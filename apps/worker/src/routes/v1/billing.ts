/**
 * Billing Routes — T9 Master Spec §4, §5, §8, §13, §14, §18
 *
 * All billing API endpoints for the VIYO worker.
 * Authenticated routes use the global auth middleware.
 * Webhook route uses Stripe signature verification (no auth).
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER
 */
import { Hono } from 'hono';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
  workspaces,
  tokenLedger,
  promoCodes,
  promoRedemptions,
} from '@viyo/db';
import {
  createCheckoutSchema,
  createTopUpSchema,
  autoTopUpSettingsSchema,
  ledgerQuerySchema,
  redeemPromoCodeSchema,
  switchIntervalSchema,
  changeTierSchema,
  previewChangeSchema,
  type AuthContext,
} from '@viyo/shared';
import type Stripe from 'stripe';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { verifyStripeSignature } from '../../middleware/stripe-signature.js';
import { getDb } from '../../lib/db.js';
import { requireStripe } from '../../lib/stripe.js';
import { getTokenBalance, grantTokens, getSystemConfig } from '../../lib/token-engine.js';
import { ApiError } from '../../middleware/error-handler.js';
import { handleStripeWebhook } from '../../lib/stripe-webhooks.js';

type RouteEnv = {
  Variables: {
    auth: AuthContext;
    validatedBody: unknown;
    validatedQuery: unknown;
    stripeEvent: unknown;
    requestId: string;
  };
};

const billingRoutes = new Hono<RouteEnv>();

function requireDb() {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');
  return db;
}

/* ──────────────────────────────────────────────
 * GET /api/v1/billing/balance
 * Returns current token balance for the workspace.
 * ────────────────────────────────────────────── */
billingRoutes.get('/balance', async (c) => {
  const auth = c.get('auth');
  const balance = await getTokenBalance(auth.workspaceId);
  return c.json({ data: balance });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/billing/history
 * Returns paginated token ledger history.
 * ────────────────────────────────────────────── */
billingRoutes.get('/history', validateQuery(ledgerQuerySchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const query = c.get('validatedQuery') as { page: number; limit: number; type?: string };

  const offset = (query.page - 1) * query.limit;

  const conditions = [eq(tokenLedger.workspaceId, auth.workspaceId)];
  if (query.type) {
    conditions.push(eq(tokenLedger.transactionType, query.type));
  }

  const rows = await db
    .select()
    .from(tokenLedger)
    .where(and(...conditions))
    .orderBy(desc(tokenLedger.createdAt))
    .limit(query.limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tokenLedger)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count ?? 0);

  return c.json({
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/billing/subscription
 * Returns current subscription details.
 * ────────────────────────────────────────────── */
billingRoutes.get('/subscription', async (c) => {
  const db = requireDb();
  const auth = c.get('auth');

  const rows = await db
    .select({
      subscriptionTier: workspaces.subscriptionTier,
      subscriptionStatus: workspaces.subscriptionStatus,
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
      billingCycleAnchor: workspaces.billingCycleAnchor,
      autoTopUpEnabled: workspaces.autoTopUpEnabled,
      autoTopUpThreshold: workspaces.autoTopUpThreshold,
      autoTopUpPack: workspaces.autoTopUpPack,
    })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (rows.length === 0) throw new ApiError(404, 'Workspace not found');

  return c.json({ data: rows[0] });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/checkout
 * Creates a Stripe Checkout Session for subscription.
 * T9 §4: Pre-configured products, not line_items.
 * ────────────────────────────────────────────── */
billingRoutes.post('/checkout', validateBody(createCheckoutSchema), async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { tier: string; interval: string; promoCode?: string };

  // Get workspace with Stripe customer ID
  const ws = await db
    .select({
      stripeCustomerId: workspaces.stripeCustomerId,
      subscriptionTier: workspaces.subscriptionTier,
    })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeCustomerId) throw new ApiError(400, 'Stripe customer not provisioned yet');

  // Look up the pre-configured Stripe price
  const priceKey = `viyo_${body.tier}_${body.interval}`;
  const prices = await stripe.prices.list({
    lookup_keys: [priceKey],
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new ApiError(400, `No active Stripe price found for ${priceKey}. Ensure products are configured in Stripe Dashboard.`);
  }

  const sessionParams: Record<string, unknown> = {
    customer: ws[0].stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    success_url: `${process.env.WEB_APP_URL ?? 'https://app.viyo.new'}/billing?success=true`,
    cancel_url: `${process.env.WEB_APP_URL ?? 'https://app.viyo.new'}/billing?canceled=true`,
    metadata: {
      workspaceId: auth.workspaceId,
      tier: body.tier,
      interval: body.interval,
    },
  };

  if (body.promoCode) {
    sessionParams.allow_promotion_codes = true;
  }

  const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]);

  return c.json({ data: { checkoutUrl: session.url } });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/top-up
 * Creates a Stripe Checkout Session for one-time token top-up.
 * ────────────────────────────────────────────── */
billingRoutes.post('/top-up', validateBody(createTopUpSchema), async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { pack: string };

  const ws = await db
    .select({ stripeCustomerId: workspaces.stripeCustomerId })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeCustomerId) throw new ApiError(400, 'Stripe customer not provisioned yet');

  const topUpPacks = await getSystemConfig<Record<string, { tokens: number; priceCents: number }>>('TOP_UP_PACKS');
  if (!topUpPacks) throw new ApiError(500, 'TOP_UP_PACKS not configured');

  const pack = (topUpPacks as Record<string, { tokens: number; priceCents: number }>)[body.pack];
  if (!pack) throw new ApiError(400, `Unknown top-up pack: ${body.pack}`);

  const session = await stripe.checkout.sessions.create({
    customer: ws[0].stripeCustomerId,
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pack.priceCents,
        product_data: {
          name: `VIYO Token Top-Up (${body.pack})`,
          description: `${pack.tokens.toLocaleString()} VIYO tokens`,
        },
      },
      quantity: 1,
    }],
    success_url: `${process.env.WEB_APP_URL ?? 'https://app.viyo.new'}/billing?topup=success`,
    cancel_url: `${process.env.WEB_APP_URL ?? 'https://app.viyo.new'}/billing?topup=canceled`,
    metadata: {
      workspaceId: auth.workspaceId,
      type: 'top_up',
      pack: body.pack,
      tokens: String(pack.tokens),
    },
  });

  return c.json({ data: { checkoutUrl: session.url } });
});

/* ──────────────────────────────────────────────
 * PUT /api/v1/billing/auto-top-up
 * Update auto-top-up settings.
 * ────────────────────────────────────────────── */
billingRoutes.put('/auto-top-up', validateBody(autoTopUpSettingsSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { enabled: boolean; threshold?: number; pack?: string };

  const updateData: Record<string, unknown> = {
    autoTopUpEnabled: body.enabled,
  };
  if (body.threshold !== undefined) updateData.autoTopUpThreshold = body.threshold;
  if (body.pack !== undefined) updateData.autoTopUpPack = body.pack;

  const [updated] = await db
    .update(workspaces)
    .set(updateData)
    .where(eq(workspaces.id, auth.workspaceId))
    .returning();

  if (!updated) throw new ApiError(404, 'Workspace not found');

  return c.json({
    data: {
      autoTopUpEnabled: updated.autoTopUpEnabled,
      autoTopUpThreshold: updated.autoTopUpThreshold,
      autoTopUpPack: updated.autoTopUpPack,
    },
  });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/subscription/change-tier
 * Change subscription tier (upgrade/downgrade).
 * ────────────────────────────────────────────── */
billingRoutes.post('/subscription/change-tier', validateBody(changeTierSchema), async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { newTier: string };

  const ws = await db
    .select({
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
      subscriptionTier: workspaces.subscriptionTier,
    })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeSubscriptionId) throw new ApiError(400, 'No active subscription');

  if (body.newTier === 'free') {
    // Cancel subscription at period end
    await stripe.subscriptions.update(ws[0].stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    return c.json({ data: { message: 'Subscription will be canceled at period end' } });
  }

  // Get current subscription to find the item
  const subscription = await stripe.subscriptions.retrieve(ws[0].stripeSubscriptionId);
  const currentItem = subscription.items.data[0];
  if (!currentItem) throw new ApiError(500, 'No subscription items found');

  // Look up the new price (keep same interval)
  const currentPrice = await stripe.prices.retrieve(currentItem.price.id);
  const interval = currentPrice.recurring?.interval === 'year' ? 'annual' : 'monthly';
  const priceKey = `viyo_${body.newTier}_${interval}`;

  const prices = await stripe.prices.list({
    lookup_keys: [priceKey],
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new ApiError(400, `No active Stripe price found for ${priceKey}`);
  }

  // Update subscription with proration
  await stripe.subscriptions.update(ws[0].stripeSubscriptionId, {
    items: [{ id: currentItem.id, price: prices.data[0].id }],
    proration_behavior: 'create_prorations',
  });

  return c.json({ data: { message: `Tier change to ${body.newTier} initiated` } });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/subscription/switch-interval
 * Switch between monthly and annual billing.
 * T9 §18: Monthly→Annual = immediate proration.
 *         Annual→Monthly = deferred via Subscription Schedule.
 * ────────────────────────────────────────────── */
billingRoutes.post('/subscription/switch-interval', validateBody(switchIntervalSchema), async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { newInterval: string };

  const ws = await db
    .select({
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
      subscriptionTier: workspaces.subscriptionTier,
    })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeSubscriptionId) throw new ApiError(400, 'No active subscription');

  const subscription = await stripe.subscriptions.retrieve(ws[0].stripeSubscriptionId);
  const currentItem = subscription.items.data[0];
  if (!currentItem) throw new ApiError(500, 'No subscription items found');

  const currentPrice = await stripe.prices.retrieve(currentItem.price.id);
  const currentInterval = currentPrice.recurring?.interval === 'year' ? 'annual' : 'monthly';

  if (currentInterval === body.newInterval) {
    throw new ApiError(400, `Already on ${body.newInterval} billing`);
  }

  const priceKey = `viyo_${ws[0].subscriptionTier}_${body.newInterval}`;
  const prices = await stripe.prices.list({
    lookup_keys: [priceKey],
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new ApiError(400, `No active Stripe price found for ${priceKey}`);
  }

  if (body.newInterval === 'annual') {
    // Monthly → Annual: Immediate proration
    await stripe.subscriptions.update(ws[0].stripeSubscriptionId, {
      items: [{ id: currentItem.id, price: prices.data[0].id }],
      proration_behavior: 'create_prorations',
    });
    return c.json({ data: { message: 'Switched to annual billing with proration' } });
  } else {
    // Annual → Monthly: Deferred via Subscription Schedule
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: ws[0].stripeSubscriptionId,
    });

    await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          items: [{ price: currentItem.price.id, quantity: 1 }],
          start_date: schedule.phases[0].start_date,
          end_date: schedule.phases[0].end_date,
        },
        {
          items: [{ price: prices.data[0].id, quantity: 1 }],
          start_date: schedule.phases[0].end_date,
        },
      ],
    });

    return c.json({ data: { message: 'Will switch to monthly billing at end of current annual period' } });
  }
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/subscription/preview-change
 * Preview proration for tier or interval change.
 * ────────────────────────────────────────────── */
billingRoutes.post('/subscription/preview-change', validateBody(previewChangeSchema), async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { newTier?: string; newInterval?: string };

  const ws = await db
    .select({
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
      subscriptionTier: workspaces.subscriptionTier,
    })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeSubscriptionId) throw new ApiError(400, 'No active subscription');

  const subscription = await stripe.subscriptions.retrieve(ws[0].stripeSubscriptionId);
  const currentItem = subscription.items.data[0];
  if (!currentItem) throw new ApiError(500, 'No subscription items found');

  const tier = body.newTier ?? ws[0].subscriptionTier;
  const currentPrice = await stripe.prices.retrieve(currentItem.price.id);
  const interval = body.newInterval ?? (currentPrice.recurring?.interval === 'year' ? 'annual' : 'monthly');

  const priceKey = `viyo_${tier}_${interval}`;
  const prices = await stripe.prices.list({
    lookup_keys: [priceKey],
    active: true,
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new ApiError(400, `No active Stripe price found for ${priceKey}`);
  }

  const invoice = await stripe.invoices.createPreview({
    customer: subscription.customer as string,
    subscription: ws[0].stripeSubscriptionId,
    subscription_details: {
      items: [{ id: currentItem.id, price: prices.data[0].id }],
      proration_behavior: 'create_prorations',
    },
  });

  return c.json({
    data: {
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      prorationDate: invoice.period_start,
      lines: invoice.lines.data.map((line) => ({
        description: line.description,
        amount: line.amount,
      })),
    },
  });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/promo/redeem
 * Redeem a promo code for token grant.
 * ────────────────────────────────────────────── */
billingRoutes.post('/promo/redeem', validateBody(redeemPromoCodeSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { code: string };

  // Find active promo code
  const promos = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.code, body.code.toUpperCase()))
    .limit(1);

  if (promos.length === 0 || !promos[0].isActive) {
    throw new ApiError(404, 'Promo code not found or inactive');
  }

  const promo = promos[0];

  // Check expiry
  if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
    throw new ApiError(400, 'Promo code has expired');
  }

  // Check max redemptions
  if (promo.maxRedemptions && promo.currentRedemptions >= promo.maxRedemptions) {
    throw new ApiError(400, 'Promo code has reached maximum redemptions');
  }

  // Check if workspace already redeemed
  const existing = await db
    .select()
    .from(promoRedemptions)
    .where(
      and(
        eq(promoRedemptions.promoCodeId, promo.id),
        eq(promoRedemptions.workspaceId, auth.workspaceId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new ApiError(400, 'This promo code has already been redeemed for this workspace');
  }

  // Grant tokens
  const newBalance = await grantTokens({
    workspaceId: auth.workspaceId,
    amount: Number(promo.tokenGrant),
    transactionType: 'admin_adjustment',
    description: `Promo code: ${promo.code}`,
    metadata: { promoCodeId: promo.id },
  });

  // Record redemption
  await db.insert(promoRedemptions).values({
    promoCodeId: promo.id,
    workspaceId: auth.workspaceId,
    tokensGranted: Number(promo.tokenGrant),
  });

  // Increment redemption counter
  await db
    .update(promoCodes)
    .set({ currentRedemptions: sql`current_redemptions + 1` })
    .where(eq(promoCodes.id, promo.id));

  return c.json({
    data: {
      tokensGranted: Number(promo.tokenGrant),
      newBalance,
    },
  });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/billing/portal
 * Creates a Stripe Customer Portal session.
 * ────────────────────────────────────────────── */
billingRoutes.get('/portal', async (c) => {
  const db = requireDb();
  const stripe = requireStripe();
  const auth = c.get('auth');

  const ws = await db
    .select({ stripeCustomerId: workspaces.stripeCustomerId })
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (ws.length === 0) throw new ApiError(404, 'Workspace not found');
  if (!ws[0].stripeCustomerId) throw new ApiError(400, 'Stripe customer not provisioned');

  const session = await stripe.billingPortal.sessions.create({
    customer: ws[0].stripeCustomerId,
    return_url: `${process.env.WEB_APP_URL ?? 'https://app.viyo.new'}/billing`,
  });

  return c.json({ data: { portalUrl: session.url } });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/billing/webhook
 * Stripe webhook handler — bypasses auth.
 * Uses Stripe signature verification middleware.
 * ────────────────────────────────────────────── */
billingRoutes.post('/webhook', verifyStripeSignature, async (c) => {
  const event = c.get('stripeEvent') as Stripe.Event;
  await handleStripeWebhook(event);
  return c.json({ received: true });
});

export { billingRoutes };
