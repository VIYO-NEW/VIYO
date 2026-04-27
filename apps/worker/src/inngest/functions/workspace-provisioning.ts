/**
 * Workspace Provisioning Pipeline — R18 §4, Doc4 §2.1, T9
 *
 * Inngest function triggered by viyo/workspace.created.
 *
 * Steps (durable, individually retried):
 * 1. verify-workspace — Confirm the workspace exists in the database
 * 2. create-stripe-customer — Create a Stripe customer for the workspace
 * 3. provision-token-balance — Insert initial token_balances row
 * 4. send-welcome-notification — Queue a welcome notification (future: ESP)
 *
 * Each step is idempotent — safe to retry on failure.
 * Retry config: max 3 retries with exponential backoff.
 *
 * Authority: R18 §4, Doc4 §2.1, ARCH_LOCK_V3 §3, T9 Master Spec §3
 */
import { inngest } from '../client.js';
import { getDb } from '../../lib/db.js';
import { workspaces, tokenBalances } from '@viyo/db';
import { eq } from 'drizzle-orm';
import { getStripe } from '../../lib/stripe.js';
import { grantTokens } from '../../lib/token-engine.js';

/**
 * workspace.created → provision Stripe customer + token balance
 */
export const workspaceProvisioning = inngest.createFunction(
  {
    id: 'workspace-provisioning',
    name: 'Workspace Provisioning',
    retries: 3,
  },
  { event: 'viyo/workspace.created' },
  async ({ event, step, logger }) => {
    const { workspaceId, workspaceName, ownerId, ownerEmail, subscriptionTier } = event.data;

    logger.info('Starting workspace provisioning', { workspaceId, workspaceName });

    /**
     * Step 1: Verify workspace exists
     */
    const workspace = await step.run('verify-workspace', async () => {
      const db = getDb();
      if (!db) {
        throw new Error('DATABASE_URL not configured — cannot provision workspace');
      }

      const [row] = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          subscriptionTier: workspaces.subscriptionTier,
          stripeCustomerId: workspaces.stripeCustomerId,
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      if (!row) {
        throw new Error(`Workspace ${workspaceId} not found in database`);
      }

      return row;
    });

    /**
     * Step 2: Create Stripe customer (idempotent — skips if already exists)
     * T9 §3: Every workspace gets a Stripe customer on creation.
     */
    const stripeResult = await step.run('create-stripe-customer', async () => {
      // Skip if Stripe customer already exists (idempotent retry)
      if (workspace.stripeCustomerId) {
        return { customerId: workspace.stripeCustomerId, created: false };
      }

      const stripe = getStripe();
      if (!stripe) {
        logger.warn('Stripe not configured — skipping customer creation');
        return { customerId: null, created: false, skipped: true };
      }

      const db = getDb();
      if (!db) throw new Error('Database not available');

      const customer = await stripe.customers.create({
        email: ownerEmail,
        name: workspaceName,
        metadata: {
          workspaceId,
          ownerId,
          tier: subscriptionTier,
        },
      });

      // Save Stripe customer ID to workspace
      await db
        .update(workspaces)
        .set({
          stripeCustomerId: customer.id,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId));

      return { customerId: customer.id, created: true };
    });

    /**
     * Step 3: Provision token balance
     * T9 §16: Free tier gets 1M tokens on creation.
     * Paid tiers get their monthly grant (handled by invoice.paid webhook).
     */
    const tokenResult = await step.run('provision-token-balance', async () => {
      const db = getDb();
      if (!db) throw new Error('Database not available');

      // Check if balance already exists (idempotent retry)
      const existing = await db
        .select({ workspaceId: tokenBalances.workspaceId })
        .from(tokenBalances)
        .where(eq(tokenBalances.workspaceId, workspaceId))
        .limit(1);

      if (existing.length > 0) {
        return { provisioned: false, reason: 'Balance already exists' };
      }

      // Insert initial token_balances row
      await db.insert(tokenBalances).values({
        workspaceId,
        balance: 0,
        lifetimeGranted: 0,
        lifetimeConsumed: 0,
        lifetimeRefunded: 0,
      });

      // Grant initial free tier tokens
      const initialGrant = getInitialTokenGrant(subscriptionTier);
      if (initialGrant > 0) {
        await grantTokens({
          workspaceId,
          amount: initialGrant,
          transactionType: 'free_tier_grant',
          description: `Initial ${subscriptionTier} token grant: ${initialGrant.toLocaleString()} tokens`,
        });
      }

      return { provisioned: true, initialGrant };
    });

    /**
     * Step 4: Send welcome notification
     * Future: integrate with ESP for transactional email.
     */
    const notification = await step.run('send-welcome-notification', async () => {
      logger.info('Welcome notification queued', {
        workspaceId,
        ownerId,
        workspaceName: workspace.name,
        tokens: tokenResult.provisioned ? getInitialTokenGrant(subscriptionTier) : 0,
      });

      // TODO: Send via ESP when email service is integrated
      return { sent: true, channel: 'log' };
    });

    logger.info('Workspace provisioning complete', {
      workspaceId,
      workspaceName: workspace.name,
      stripeResult,
      tokenResult,
      notification,
    });

    return {
      success: true,
      workspaceId,
      workspaceName: workspace.name,
      stripeResult,
      tokenResult,
      notification,
    };
  },
);

/**
 * Map subscription tier to initial token grant.
 * T9 §16: Free tier gets 1M tokens on creation.
 * Paid tiers get their monthly grant via invoice.paid webhook, not here.
 */
function getInitialTokenGrant(tier: string): number {
  const grantMap: Record<string, number> = {
    free: 1_000_000,
    starter: 0, // Granted via invoice.paid
    growth: 0,
    agency: 0,
  };
  return grantMap[tier] ?? 1_000_000;
}
