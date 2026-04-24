/**
 * Workspace Provisioning Pipeline — R18 §4, Doc4 §2.1
 *
 * Inngest function triggered by viyo/workspace.created.
 * This is the "Hello World" pipeline for the Inngest event system.
 *
 * Steps (durable, individually retried):
 * 1. verify-workspace — Confirm the workspace exists in the database
 * 2. provision-defaults — Create default brand + credit balance (future tables)
 * 3. send-welcome-notification — Queue a welcome notification (future: Resend)
 *
 * Each step is idempotent — safe to retry on failure.
 * Retry config: max 3 retries with exponential backoff.
 *
 * Note: Steps 2 and 3 currently log their intent because the brands
 * and credit_balances tables are planned for future schema migrations.
 * When those tables land, these steps will be updated to perform real inserts.
 *
 * Authority: R18 §4, Doc4 §2.1, ARCH_LOCK_V3 §3
 */
import { inngest } from '../client.js';
import { getDb } from '../../lib/db.js';
import { workspaces } from '@viyo/db';
import { eq } from 'drizzle-orm';

/**
 * workspace.created → provision defaults
 *
 * PO directive: This is the Hello World for the Inngest event system.
 * Demonstrates durable step execution, DB reads, and OTel trace continuity.
 */
export const workspaceProvisioning = inngest.createFunction(
  {
    id: 'workspace-provisioning',
    name: 'Workspace Provisioning',
    retries: 3,
  },
  { event: 'viyo/workspace.created' },
  async ({ event, step, logger }) => {
    const { workspaceId, workspaceName, ownerId, subscriptionTier } = event.data;

    logger.info('Starting workspace provisioning', { workspaceId, workspaceName });

    /**
     * Step 1: Verify workspace exists
     * Confirms the workspace row was committed to the database before
     * proceeding with provisioning. This is the DB-touching "Hello World".
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
     * Step 2: Provision defaults (brand + credit balance)
     * Future: When brands and credit_balances tables are added to the schema,
     * this step will insert real rows. For now, it computes the values and logs.
     */
    const defaults = await step.run('provision-defaults', async () => {
      const initialCredits = getInitialCredits(subscriptionTier);

      logger.info('Provisioning defaults for workspace', {
        workspaceId,
        defaultBrandName: workspaceName,
        initialCredits,
        subscriptionTier,
      });

      // Future DB inserts:
      // await db.insert(brands).values({ workspaceId, name: workspaceName, isDefault: true });
      // await db.insert(creditBalances).values({ workspaceId, balance: initialCredits });

      return {
        brandName: workspaceName,
        initialCredits,
        provisioned: false, // Will be true when tables exist
      };
    });

    /**
     * Step 3: Send welcome notification
     * Future: integrate with Resend for transactional email.
     * For now, logs the intent — the notification system is a future task.
     */
    const notification = await step.run('send-welcome-notification', async () => {
      logger.info('Welcome notification queued', {
        workspaceId,
        ownerId,
        workspaceName: workspace.name,
        credits: defaults.initialCredits,
      });

      // Future: await resend.emails.send({ ... })
      return { sent: true, channel: 'log' };
    });

    logger.info('Workspace provisioning complete', {
      workspaceId,
      workspaceName: workspace.name,
      defaults,
      notification,
    });

    return {
      success: true,
      workspaceId,
      workspaceName: workspace.name,
      defaults,
      notification,
    };
  },
);

/**
 * Map subscription tier to initial credit allocation.
 * Used for both the provisioning step and future Stripe integration.
 */
function getInitialCredits(tier: string): number {
  const creditMap: Record<string, number> = {
    free: 100,
    starter: 500,
    pro: 2000,
    enterprise: 10000,
  };
  return creditMap[tier] ?? 100;
}
