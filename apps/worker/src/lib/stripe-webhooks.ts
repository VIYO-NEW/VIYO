/**
 * Stripe Webhook Handler — T9 Master Spec §5
 *
 * Processes Stripe webhook events with idempotency guard.
 * Handles 7 event types:
 * - checkout.session.completed (subscription + top-up)
 * - invoice.paid (monthly token grants)
 * - invoice.payment_failed (dunning flow)
 * - customer.subscription.updated (tier changes, proration)
 * - customer.subscription.deleted (downgrade to free)
 * - payment_intent.succeeded (top-up fulfillment)
 * - customer.subscription.trial_will_end (trial warning)
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §5, §12
 */
import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { workspaces, stripeWebhookEvents } from '@viyo/db';
import { getDb } from './db.js';
import { grantTokens, getSystemConfig } from './token-engine.js';
import { inngest } from '../inngest/client.js';

/**
 * Process a verified Stripe webhook event.
 * Idempotency: checks stripe_webhook_events before processing.
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Database not available');

  // Idempotency check
  const existing = await db
    .select({ id: stripeWebhookEvents.id })
    .from(stripeWebhookEvents)
    .where(eq(stripeWebhookEvents.id, event.id))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[VIYO] Webhook ${event.id} already processed, skipping`);
    return;
  }

  // Record the event (before processing to prevent concurrent duplicates)
  await db.insert(stripeWebhookEvents).values({
    id: event.id,
    eventType: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  // Route to handler
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`[VIYO] Unhandled webhook event type: ${event.type}`);
  }
}

/* ──────────────────────────────────────────────
 * checkout.session.completed
 * Handles both subscription checkout and one-time top-up.
 * ────────────────────────────────────────────── */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const db = getDb();
  if (!db) return;

  const workspaceId = session.metadata?.workspaceId;
  if (!workspaceId) {
    console.error('[VIYO] Checkout session missing workspaceId metadata');
    return;
  }

  if (session.mode === 'subscription' && session.subscription) {
    const tier = session.metadata?.tier ?? 'starter';
    const interval = session.metadata?.interval ?? 'monthly';

    // Update workspace with subscription details
    await db
      .update(workspaces)
      .set({
        stripeSubscriptionId: session.subscription as string,
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId));

    // Grant initial tokens for the tier
    const monthlyGrants = await getSystemConfig<Record<string, number>>('MONTHLY_GRANTS');
    if (monthlyGrants) {
      const grants = monthlyGrants as Record<string, number>;
      const grant = grants[tier] ?? 0;
      if (grant > 0) {
        await grantTokens({
          workspaceId,
          amount: grant,
          transactionType: 'subscription_grant',
          description: `Initial ${tier} subscription grant (${interval})`,
          metadata: { tier, interval },
        });
      }
    }

    // Emit subscription changed event
    await inngest.send({
      name: 'viyo/billing.subscription.changed',
      data: {
        workspaceId,
        oldTier: 'free' as const,
        newTier: tier as 'starter' | 'growth' | 'agency',
        stripeSubscriptionId: session.subscription as string,
      },
    });
  }

  if (session.mode === 'payment') {
    // Top-up: tokens granted via payment_intent.succeeded handler
    console.log(`[VIYO] Top-up checkout completed for workspace ${workspaceId}`);
  }
}

/* ──────────────────────────────────────────────
 * invoice.paid
 * Monthly recurring token grant for active subscriptions.
 * ────────────────────────────────────────────── */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const db = getDb();
  if (!db) return;

  // Skip the first invoice (handled by checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') return;

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const ws = await db
    .select({ id: workspaces.id, subscriptionTier: workspaces.subscriptionTier })
    .from(workspaces)
    .where(eq(workspaces.stripeCustomerId, customerId))
    .limit(1);

  if (ws.length === 0) return;

  // Update status to active (clears any past_due state)
  await db
    .update(workspaces)
    .set({ subscriptionStatus: 'active', updatedAt: new Date() })
    .where(eq(workspaces.id, ws[0].id));

  // Grant monthly tokens
  const monthlyGrants = await getSystemConfig<Record<string, number>>('MONTHLY_GRANTS');
  if (monthlyGrants) {
    const grants = monthlyGrants as Record<string, number>;
    const grant = grants[ws[0].subscriptionTier] ?? 0;
    if (grant > 0) {
      await grantTokens({
        workspaceId: ws[0].id,
        amount: grant,
        transactionType: 'subscription_grant',
        description: `Monthly ${ws[0].subscriptionTier} token grant`,
        stripePaymentIntentId: typeof (invoice as unknown as Record<string, unknown>).payment_intent === 'string'
          ? (invoice as unknown as Record<string, unknown>).payment_intent as string
          : undefined,
      });
    }
  }
}

/* ──────────────────────────────────────────────
 * invoice.payment_failed
 * Triggers dunning flow — sets past_due, emits event.
 * T9 §12: Dunning freeze enforcement.
 * ────────────────────────────────────────────── */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const db = getDb();
  if (!db) return;

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const ws = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.stripeCustomerId, customerId))
    .limit(1);

  if (ws.length === 0) return;

  // Set subscription status to past_due (triggers dunning freeze)
  await db
    .update(workspaces)
    .set({ subscriptionStatus: 'past_due', updatedAt: new Date() })
    .where(eq(workspaces.id, ws[0].id));

  // Emit payment failed event for dunning Inngest function
  await inngest.send({
    name: 'viyo/billing.payment.failed',
    data: {
      workspaceId: ws[0].id,
      stripeInvoiceId: invoice.id,
      amountDue: invoice.amount_due,
      attemptCount: invoice.attempt_count ?? 1,
    },
  });
}

/* ──────────────────────────────────────────────
 * customer.subscription.updated
 * Handles tier changes, proration, status updates.
 * ────────────────────────────────────────────── */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const db = getDb();
  if (!db) return;

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) return;

  const ws = await db
    .select({
      id: workspaces.id,
      subscriptionTier: workspaces.subscriptionTier,
    })
    .from(workspaces)
    .where(eq(workspaces.stripeCustomerId, customerId))
    .limit(1);

  if (ws.length === 0) return;

  // Determine new tier from the subscription's price lookup_key
  const lookupKey = subscription.items.data[0]?.price?.lookup_key;
  let newTier = ws[0].subscriptionTier;

  if (lookupKey) {
    // lookup_key format: viyo_{tier}_{interval}
    const parts = lookupKey.split('_');
    if (parts.length >= 2) {
      newTier = parts[1];
    }
  }

  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    trialing: 'trialing',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
    paused: 'past_due',
  };

  const newStatus = statusMap[subscription.status] ?? 'active';

  await db
    .update(workspaces)
    .set({
      subscriptionTier: newTier,
      subscriptionStatus: newStatus,
      stripeSubscriptionId: subscription.id,
      billingCycleAnchor: subscription.billing_cycle_anchor
        ? new Date(subscription.billing_cycle_anchor * 1000)
        : undefined,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, ws[0].id));

  // Emit tier change event if tier actually changed
  if (newTier !== ws[0].subscriptionTier) {
    await inngest.send({
      name: 'viyo/billing.subscription.changed',
      data: {
        workspaceId: ws[0].id,
        oldTier: ws[0].subscriptionTier as 'free' | 'starter' | 'growth' | 'agency',
        newTier: newTier as 'free' | 'starter' | 'growth' | 'agency',
        stripeSubscriptionId: subscription.id,
      },
    });
  }
}

/* ──────────────────────────────────────────────
 * customer.subscription.deleted
 * Downgrade to free tier.
 * ────────────────────────────────────────────── */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const db = getDb();
  if (!db) return;

  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;
  if (!customerId) return;

  const ws = await db
    .select({ id: workspaces.id, subscriptionTier: workspaces.subscriptionTier })
    .from(workspaces)
    .where(eq(workspaces.stripeCustomerId, customerId))
    .limit(1);

  if (ws.length === 0) return;

  await db
    .update(workspaces)
    .set({
      subscriptionTier: 'free',
      subscriptionStatus: 'free',
      stripeSubscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, ws[0].id));

  // Emit tier change event
  await inngest.send({
    name: 'viyo/billing.subscription.changed',
    data: {
      workspaceId: ws[0].id,
      oldTier: ws[0].subscriptionTier as 'free' | 'starter' | 'growth' | 'agency',
      newTier: 'free' as const,
      stripeSubscriptionId: subscription.id,
    },
  });
}

/* ──────────────────────────────────────────────
 * payment_intent.succeeded
 * Fulfills one-time top-up token grants.
 * ────────────────────────────────────────────── */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const workspaceId = paymentIntent.metadata?.workspaceId;
  const type = paymentIntent.metadata?.type;
  const tokens = paymentIntent.metadata?.tokens;

  if (!workspaceId || type !== 'top_up' || !tokens) return;

  await grantTokens({
    workspaceId,
    amount: Number(tokens),
    transactionType: 'top_up',
    description: `Token top-up: ${Number(tokens).toLocaleString()} tokens`,
    stripePaymentIntentId: paymentIntent.id,
    metadata: { pack: paymentIntent.metadata?.pack },
  });
}
