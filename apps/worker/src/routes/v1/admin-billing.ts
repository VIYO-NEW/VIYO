/**
 * Admin Billing Routes — T9 Master Spec §11
 *
 * Admin-only endpoints for the Billing Economics Control Panel:
 * - Margin Health Dashboard data
 * - System config management (TOKEN_MULTIPLIER, etc.)
 * - Multiplier simulation
 * - Manual token adjustments
 * - Promo code CRUD
 * - Provider pricing registry
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §11
 */
import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import {
  systemConfig,
  systemConfigAuditLog,
  providerPricingRegistry,
  promoCodes,
  tokenBalances,
  tokenLedger,
  workspaces,
} from '@viyo/db';
import {
  updateSystemConfigSchema,
  simulateMultiplierSchema,
  adminTokenAdjustmentSchema,
  createPromoCodeSchema,
  type AuthContext,
} from '@viyo/shared';
import { validateBody } from '../../middleware/validate.js';
import { getDb } from '../../lib/db.js';
import { grantTokens, invalidateConfigCache, getSystemConfig } from '../../lib/token-engine.js';
import { ApiError } from '../../middleware/error-handler.js';

type RouteEnv = {
  Variables: {
    auth: AuthContext;
    validatedBody: unknown;
    requestId: string;
  };
};

const adminBillingRoutes = new Hono<RouteEnv>();

function requireDb() {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');
  return db;
}

/* ──────────────────────────────────────────────
 * GET /api/v1/admin/billing/economics
 * Margin Health Dashboard — aggregate billing data.
 * ────────────────────────────────────────────── */
adminBillingRoutes.get('/economics', async (c) => {
  const db = requireDb();

  // Get current TOKEN_MULTIPLIER
  const multiplier = await getSystemConfig<number>('TOKEN_MULTIPLIER');

  // Aggregate token balances across all workspaces
  const balanceStats = await db
    .select({
      totalBalance: sql<string>`sum(${tokenBalances.balance})`,
      totalGranted: sql<string>`sum(${tokenBalances.lifetimeGranted})`,
      totalConsumed: sql<string>`sum(${tokenBalances.lifetimeConsumed})`,
      totalRefunded: sql<string>`sum(${tokenBalances.lifetimeRefunded})`,
      workspaceCount: sql<number>`count(*)`,
    })
    .from(tokenBalances);

  // Workspace tier distribution
  const tierDistribution = await db
    .select({
      tier: workspaces.subscriptionTier,
      count: sql<number>`count(*)`,
    })
    .from(workspaces)
    .groupBy(workspaces.subscriptionTier);

  // Recent revenue (last 30 days token grants from subscriptions)
  const recentGrants = await db
    .select({
      totalTokens: sql<string>`sum(${tokenLedger.amount})`,
      transactionCount: sql<number>`count(*)`,
    })
    .from(tokenLedger)
    .where(
      sql`${tokenLedger.transactionType} = 'subscription_grant' AND ${tokenLedger.createdAt} > now() - interval '30 days'`,
    );

  return c.json({
    data: {
      tokenMultiplier: multiplier,
      balanceStats: {
        totalBalance: Number(balanceStats[0]?.totalBalance ?? 0),
        totalGranted: Number(balanceStats[0]?.totalGranted ?? 0),
        totalConsumed: Number(balanceStats[0]?.totalConsumed ?? 0),
        totalRefunded: Number(balanceStats[0]?.totalRefunded ?? 0),
        workspaceCount: Number(balanceStats[0]?.workspaceCount ?? 0),
      },
      tierDistribution: tierDistribution.map((t) => ({
        tier: t.tier,
        count: Number(t.count),
      })),
      last30Days: {
        totalTokensGranted: Number(recentGrants[0]?.totalTokens ?? 0),
        transactionCount: Number(recentGrants[0]?.transactionCount ?? 0),
      },
    },
  });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/admin/billing/config
 * List all system config entries.
 * ────────────────────────────────────────────── */
adminBillingRoutes.get('/config', async (c) => {
  const db = requireDb();

  const configs = await db
    .select()
    .from(systemConfig)
    .orderBy(systemConfig.key);

  return c.json({ data: configs });
});

/* ──────────────────────────────────────────────
 * PUT /api/v1/admin/billing/config/:key
 * Update a system config value with audit trail.
 * ────────────────────────────────────────────── */
adminBillingRoutes.put('/config/:key', validateBody(updateSystemConfigSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const key = c.req.param('key')!;
  const body = c.get('validatedBody') as { value: unknown; reason: string };

  // Get current value for history
  const current = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);

  if (current.length === 0) throw new ApiError(404, `Config key not found: ${key}`);

  const oldValue = current[0].value;

  // Record history
  await db.insert(systemConfigAuditLog).values({
    configKey: key,
    oldValue: oldValue as Record<string, unknown>,
    newValue: body.value as Record<string, unknown>,
    changedBy: auth.userId!,
    reason: body.reason,
  });

  // Update config
  const [updated] = await db
    .update(systemConfig)
    .set({
      value: body.value as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(systemConfig.key, key))
    .returning();

  // Invalidate cache
  invalidateConfigCache(key);

  return c.json({ data: updated });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/admin/billing/simulate-multiplier
 * Simulate the impact of changing TOKEN_MULTIPLIER.
 * ────────────────────────────────────────────── */
adminBillingRoutes.post('/simulate-multiplier', validateBody(simulateMultiplierSchema), async (c) => {
  const db = requireDb();
  const body = c.get('validatedBody') as { newMultiplier: number };

  const currentMultiplier = await getSystemConfig<number>('TOKEN_MULTIPLIER');
  if (!currentMultiplier) throw new ApiError(500, 'TOKEN_MULTIPLIER not configured');

  // Calculate impact on existing balances (informational only)
  const stats = await db
    .select({
      totalBalance: sql<string>`sum(${tokenBalances.balance})`,
      avgBalance: sql<string>`avg(${tokenBalances.balance})`,
      workspaceCount: sql<number>`count(*)`,
    })
    .from(tokenBalances);

  const ratio = body.newMultiplier / Number(currentMultiplier);

  return c.json({
    data: {
      currentMultiplier: Number(currentMultiplier),
      proposedMultiplier: body.newMultiplier,
      ratio,
      impact: {
        totalExistingBalance: Number(stats[0]?.totalBalance ?? 0),
        avgExistingBalance: Number(stats[0]?.avgBalance ?? 0),
        workspaceCount: Number(stats[0]?.workspaceCount ?? 0),
        note: 'Existing balances are NOT affected. New multiplier applies only to future conversions.',
        futureTokenPerDollar: body.newMultiplier,
        currentTokenPerDollar: Number(currentMultiplier),
      },
    },
  });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/admin/billing/adjust-tokens
 * Manual token adjustment (grant or deduct) with reason.
 * ────────────────────────────────────────────── */
adminBillingRoutes.post('/adjust-tokens', validateBody(adminTokenAdjustmentSchema), async (c) => {
  const auth = c.get('auth');
  const body = c.get('validatedBody') as { workspaceId: string; amount: number; reason: string };

  const newBalance = await grantTokens({
    workspaceId: body.workspaceId,
    amount: body.amount,
    transactionType: 'admin_adjustment',
    description: `Admin adjustment by ${auth.userId}: ${body.reason}`,
    metadata: { adjustedBy: auth.userId, reason: body.reason },
  });

  return c.json({
    data: {
      workspaceId: body.workspaceId,
      adjustment: body.amount,
      newBalance,
    },
  });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/admin/billing/provider-pricing
 * List all provider pricing entries.
 * ────────────────────────────────────────────── */
adminBillingRoutes.get('/provider-pricing', async (c) => {
  const db = requireDb();

  const pricing = await db
    .select()
    .from(providerPricingRegistry)
    .orderBy(providerPricingRegistry.provider, providerPricingRegistry.modelId);

  return c.json({ data: pricing });
});

/* ──────────────────────────────────────────────
 * GET /api/v1/admin/billing/promo-codes
 * List all promo codes.
 * ────────────────────────────────────────────── */
adminBillingRoutes.get('/promo-codes', async (c) => {
  const db = requireDb();

  const codes = await db
    .select()
    .from(promoCodes)
    .orderBy(desc(promoCodes.createdAt));

  return c.json({ data: codes });
});

/* ──────────────────────────────────────────────
 * POST /api/v1/admin/billing/promo-codes
 * Create a new promo code.
 * ────────────────────────────────────────────── */
adminBillingRoutes.post('/promo-codes', validateBody(createPromoCodeSchema), async (c) => {
  const db = requireDb();
  const body = c.get('validatedBody') as {
    code: string;
    stripeCouponId?: string;
    tokenGrant: number;
    maxRedemptions?: number;
    validFrom?: string;
    validUntil?: string;
  };

  // Check for duplicate code
  const existing = await db
    .select({ id: promoCodes.id })
    .from(promoCodes)
    .where(eq(promoCodes.code, body.code))
    .limit(1);

  if (existing.length > 0) {
    throw new ApiError(409, `Promo code ${body.code} already exists`);
  }

  const [created] = await db
    .insert(promoCodes)
    .values({
      code: body.code,
      stripeCouponId: body.stripeCouponId,
      tokenGrant: body.tokenGrant,
      maxRedemptions: body.maxRedemptions,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    })
    .returning();

  return c.json({ data: created }, 201);
});

/* ──────────────────────────────────────────────
 * GET /api/v1/admin/billing/config/history/:key
 * Get audit history for a config key.
 * ────────────────────────────────────────────── */
adminBillingRoutes.get('/config/history/:key', async (c) => {
  const db = requireDb();
  const key = c.req.param('key')!;

  const history = await db
    .select()
    .from(systemConfigAuditLog)
    .where(eq(systemConfigAuditLog.configKey, key))
    .orderBy(desc(systemConfigAuditLog.createdAt))
    .limit(50);

  return c.json({ data: history });
});

export { adminBillingRoutes };
