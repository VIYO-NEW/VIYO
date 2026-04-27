/**
 * Billing Inngest Functions — T9 Master Spec §3, §8, §12, §16, §17
 *
 * Event-driven billing functions:
 * - Auto top-up on low balance
 * - Free tier monthly renewal (cron)
 * - Workspace hard delete (30-day delay)
 * - Dunning notification flow
 * - Provider price monitor (weekly cron)
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER
 */
import { inngest } from './client.js';
import { eq } from 'drizzle-orm';
import { workspaces, tokenBalances } from '@viyo/db';
import { getDb } from '../lib/db.js';
import { grantTokens } from '../lib/token-engine.js';
import { requireStripe } from '../lib/stripe.js';

/* ──────────────────────────────────────────────
 * Auto Top-Up — T9 §8
 * Triggered by viyo/billing.tokens.low event.
 * Creates a Stripe PaymentIntent for the configured pack.
 * ────────────────────────────────────────────── */
export const autoTopUp = inngest.createFunction(
  { id: 'billing-auto-top-up', name: 'Billing: Auto Top-Up' },
  { event: 'viyo/billing.tokens.low' },
  async ({ event, step }) => {
    const { workspaceId } = event.data;

    const ws = await step.run('check-auto-top-up-settings', async () => {
      const db = getDb();
      if (!db) return null;

      const rows = await db
        .select({
          autoTopUpEnabled: workspaces.autoTopUpEnabled,
          autoTopUpPack: workspaces.autoTopUpPack,
          stripeCustomerId: workspaces.stripeCustomerId,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      return rows[0] ?? null;
    });

    if (!ws || !ws.autoTopUpEnabled || !ws.stripeCustomerId) {
      return { skipped: true, reason: 'Auto top-up not enabled or no Stripe customer' };
    }

    const topUpResult = await step.run('create-top-up-charge', async () => {
      const stripe = requireStripe();

      // TODO: Read TOP_UP_PACKS from system_config when seed data is live
      const packPrices: Record<string, { tokens: number; priceCents: number }> = {
        small: { tokens: 5_000_000, priceCents: 999 },
        medium: { tokens: 15_000_000, priceCents: 2499 },
        large: { tokens: 50_000_000, priceCents: 6999 },
      };

      const pack = packPrices[ws.autoTopUpPack ?? 'small'];
      if (!pack) return { error: `Unknown pack: ${ws.autoTopUpPack}` };

      const paymentIntent = await stripe.paymentIntents.create({
        amount: pack.priceCents,
        currency: 'usd',
        customer: ws.stripeCustomerId!,
        off_session: true,
        confirm: true,
        metadata: {
          workspaceId,
          type: 'top_up',
          pack: ws.autoTopUpPack ?? 'small',
          tokens: String(pack.tokens),
          auto: 'true',
        },
      });

      return { paymentIntentId: paymentIntent.id, tokens: pack.tokens };
    });

    return { workspaceId, topUpResult };
  },
);

/* ──────────────────────────────────────────────
 * Free Tier Monthly Renewal — T9 §16
 * Cron: 1st of every month at 00:00 UTC.
 * Grants up to 1M tokens, capped at 2M balance.
 * ────────────────────────────────────────────── */
export const freeTierRenewal = inngest.createFunction(
  { id: 'billing-free-tier-renewal', name: 'Billing: Free Tier Monthly Renewal' },
  { cron: '0 0 1 * *' },
  async ({ step }) => {
    const freeWorkspaces = await step.run('find-free-workspaces', async () => {
      const db = getDb();
      if (!db) return [];

      const rows = await db
        .select({
          workspaceId: workspaces.id,
          balance: tokenBalances.balance,
        })
        .from(workspaces)
        .innerJoin(tokenBalances, eq(workspaces.id, tokenBalances.workspaceId))
        .where(eq(workspaces.subscriptionTier, 'free'));

      return rows;
    });

    const FREE_MONTHLY_GRANT = 1_000_000;
    const FREE_MAX_BALANCE = 2_000_000;
    let granted = 0;

    for (const ws of freeWorkspaces) {
      const currentBalance = Number(ws.balance);
      if (currentBalance >= FREE_MAX_BALANCE) continue;

      const grantAmount = Math.min(FREE_MONTHLY_GRANT, FREE_MAX_BALANCE - currentBalance);
      if (grantAmount <= 0) continue;

      await step.run(`grant-free-${ws.workspaceId}`, async () => {
        const newBalance = await grantTokens({
          workspaceId: ws.workspaceId,
          amount: grantAmount,
          transactionType: 'free_tier_grant',
          description: `Monthly free tier renewal: ${grantAmount.toLocaleString()} tokens`,
        });

        await inngest.send({
          name: 'viyo/billing.free_tier.renewal',
          data: {
            workspaceId: ws.workspaceId,
            tokensGranted: grantAmount,
            newBalance,
          },
        });
      });

      granted++;
    }

    return { totalFreeWorkspaces: freeWorkspaces.length, granted };
  },
);

/* ──────────────────────────────────────────────
 * Workspace Hard Delete — T9 §17
 * Triggered by viyo/workspace.deleted event.
 * Waits 30 days, then purges data and cancels Stripe.
 * ────────────────────────────────────────────── */
export const workspaceHardDelete = inngest.createFunction(
  { id: 'billing-workspace-hard-delete', name: 'Billing: Workspace Hard Delete' },
  { event: 'viyo/workspace.deleted' },
  async ({ event, step }) => {
    const { workspaceId } = event.data;

    // Wait 30 days for potential recovery
    await step.sleep('wait-30-days', '30d');

    // Check if workspace was restored during the 30-day window
    const ws = await step.run('check-workspace-status', async () => {
      const db = getDb();
      if (!db) return null;

      const rows = await db
        .select({
          id: workspaces.id,
          stripeCustomerId: workspaces.stripeCustomerId,
          stripeSubscriptionId: workspaces.stripeSubscriptionId,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      return rows[0] ?? null;
    });

    // If workspace was already deleted or doesn't exist, abort
    if (!ws) {
      return { skipped: true, reason: 'Workspace not found — may have been restored and re-deleted' };
    }

    // Cancel Stripe subscription if active
    if (ws.stripeSubscriptionId) {
      await step.run('cancel-stripe-subscription', async () => {
        const stripe = requireStripe();
        try {
          await stripe.subscriptions.cancel(ws.stripeSubscriptionId!);
        } catch (err) {
          console.error(`[VIYO] Failed to cancel subscription: ${err}`);
        }
      });
    }

    // Delete Stripe customer
    if (ws.stripeCustomerId) {
      await step.run('delete-stripe-customer', async () => {
        const stripe = requireStripe();
        try {
          await stripe.customers.del(ws.stripeCustomerId!);
        } catch (err) {
          console.error(`[VIYO] Failed to delete Stripe customer: ${err}`);
        }
      });
    }

    // GDPR data purge — hard delete workspace and all related data
    await step.run('gdpr-purge', async () => {
      const db = getDb();
      if (!db) return;

      // The cascade deletes in the schema handle related records
      await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    });

    // Emit hard delete event
    await inngest.send({
      name: 'viyo/billing.workspace.hard_delete',
      data: {
        workspaceId,
        deletedAt: new Date().toISOString(),
      },
    });

    return { workspaceId, purged: true };
  },
);

/* ──────────────────────────────────────────────
 * Dunning Flow — T9 §12
 * Triggered by viyo/billing.payment.failed event.
 * Sends escalating notifications.
 * ────────────────────────────────────────────── */
export const dunningFlow = inngest.createFunction(
  { id: 'billing-dunning-flow', name: 'Billing: Dunning Flow' },
  { event: 'viyo/billing.payment.failed' },
  async ({ event, step }) => {
    const { workspaceId, stripeInvoiceId, amountDue, attemptCount } = event.data;

    // Step 1: Immediate notification
    await step.run('send-payment-failed-email', async () => {
      // TODO: Send email via ESP when email service is integrated
      console.log(`[VIYO] Payment failed for workspace ${workspaceId}: invoice ${stripeInvoiceId}, amount ${amountDue}, attempt ${attemptCount}`);
    });

    // Step 2: Wait 3 days, send reminder
    await step.sleep('wait-3-days', '3d');

    await step.run('send-dunning-reminder', async () => {
      const db = getDb();
      if (!db) return { resolved: false };

      // Check if payment was resolved
      const ws = await db
        .select({ subscriptionStatus: workspaces.subscriptionStatus })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      if (ws[0]?.subscriptionStatus !== 'past_due') {
        return { resolved: true };
      }

      // TODO: Send escalation email
      console.log(`[VIYO] Dunning reminder for workspace ${workspaceId}`);
      return { resolved: false };
    });

    // Step 3: Wait 7 more days, final warning
    await step.sleep('wait-7-days', '7d');

    await step.run('send-final-warning', async () => {
      const db = getDb();
      if (!db) return { resolved: false };

      const ws = await db
        .select({ subscriptionStatus: workspaces.subscriptionStatus })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      if (ws[0]?.subscriptionStatus !== 'past_due') {
        return { resolved: true };
      }

      // TODO: Send final warning email
      console.log(`[VIYO] Final dunning warning for workspace ${workspaceId}`);
      return { resolved: false };
    });

    return { workspaceId, dunningComplete: true };
  },
);

/* ──────────────────────────────────────────────
 * Provider Price Monitor — T9 §10
 * Weekly cron: Checks provider pricing changes.
 * ────────────────────────────────────────────── */
export const providerPriceMonitor = inngest.createFunction(
  { id: 'billing-provider-price-monitor', name: 'Billing: Provider Price Monitor' },
  { cron: '0 6 * * 1' }, // Every Monday at 6:00 UTC
  async ({ step }) => {
    const results = await step.run('check-provider-prices', async () => {
      // TODO: Fetch latest prices from OpenAI, Anthropic, etc.
      // Compare against provider_pricing_registry
      // Calculate margin impact
      // Alert if Agency margin drops below 40%
      console.log('[VIYO] Provider price monitor check — placeholder');
      return { checked: true, alerts: 0 };
    });

    return results;
  },
);

/**
 * All billing Inngest functions for registration.
 */
export const billingFunctions = [
  autoTopUp,
  freeTierRenewal,
  workspaceHardDelete,
  dunningFlow,
  providerPriceMonitor,
];
