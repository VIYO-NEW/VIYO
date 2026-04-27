/**
 * Token Engine — T9 Master Spec §3
 *
 * Core billing logic for VIYO's tokenized billing system.
 * Handles:
 * - Billing status pre-check (dunning freeze → 402 BILLING_FROZEN)
 * - Atomic token deduction via RPC (insufficient → 402 INSUFFICIENT_TOKENS)
 * - System config caching (TOKEN_MULTIPLIER, cached 5 min)
 * - Low-balance event emission for auto-top-up
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §3, R23 dual-write
 */
import { eq, sql } from 'drizzle-orm';
import { workspaces, tokenBalances, systemConfig } from '@viyo/db';
import { getDb } from './db.js';
import { ApiError } from '../middleware/error-handler.js';
import { inngest } from '../inngest/client.js';

/* ──────────────────────────────────────────────
 * System Config Cache — 5 minute TTL
 * ────────────────────────────────────────────── */
interface ConfigCache {
  value: Record<string, unknown>;
  expiresAt: number;
}

const configCache = new Map<string, ConfigCache>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Read a system_config value with 5-minute cache.
 */
export async function getSystemConfig<T = unknown>(key: string): Promise<T | null> {
  const cached = configCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select({ value: systemConfig.value })
    .from(systemConfig)
    .where(eq(systemConfig.key, key))
    .limit(1);

  if (rows.length === 0) return null;

  const value = rows[0].value;
  configCache.set(key, { value: value as Record<string, unknown>, expiresAt: Date.now() + CACHE_TTL_MS });
  return value as T;
}

/**
 * Invalidate a specific config cache entry (used after admin updates).
 */
export function invalidateConfigCache(key?: string): void {
  if (key) {
    configCache.delete(key);
  } else {
    configCache.clear();
  }
}

/* ──────────────────────────────────────────────
 * Billing Status Check — Dunning Freeze
 * T9 §12: Check subscription_status !== 'past_due'
 * BEFORE attempting any deduction.
 * Returns distinct 402 from insufficient tokens.
 * ────────────────────────────────────────────── */
export async function checkBillingStatus(workspaceId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');

  const rows = await db
    .select({ subscriptionStatus: workspaces.subscriptionStatus })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (rows.length === 0) {
    throw new ApiError(404, 'Workspace not found');
  }

  if (rows[0].subscriptionStatus === 'past_due') {
    throw new ApiError(402, 'BILLING_FROZEN: Account has past-due invoices. Please update your payment method.', {
      code: 'BILLING_FROZEN',
    });
  }

  if (rows[0].subscriptionStatus === 'canceled') {
    throw new ApiError(402, 'BILLING_FROZEN: Subscription has been canceled.', {
      code: 'BILLING_FROZEN',
    });
  }
}

/* ──────────────────────────────────────────────
 * Token Deduction — Atomic RPC
 * T9 §3.4: FOR UPDATE lock → balance check → ledger insert
 * ────────────────────────────────────────────── */
export interface DeductTokensParams {
  workspaceId: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface DeductTokensResult {
  newBalance: number;
  tokensDeducted: number;
}

/**
 * Deduct tokens from a workspace balance using the atomic RPC.
 * This is the ONLY way to modify token balances.
 *
 * Flow:
 * 1. checkBillingStatus() — 402 BILLING_FROZEN if past_due
 * 2. atomic_token_deduction RPC — 402 INSUFFICIENT_TOKENS if balance < amount
 * 3. Emit viyo/billing.tokens.low if balance drops below threshold
 */
export async function deductTokens(params: DeductTokensParams): Promise<DeductTokensResult> {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');

  // Step 1: Dunning freeze pre-check (separate 402 code path)
  await checkBillingStatus(params.workspaceId);

  // Step 2: Atomic deduction via RPC
  const negativeAmount = -Math.abs(params.amount);

  try {
    const result = await db.execute(sql`
      SELECT * FROM atomic_token_deduction(
        ${params.workspaceId}::uuid,
        ${params.userId}::uuid,
        ${negativeAmount}::bigint,
        ${params.transactionType}::varchar,
        ${params.description}::text,
        ${params.referenceType ?? null}::varchar,
        ${params.referenceId ?? null}::uuid,
        ${JSON.stringify(params.metadata ?? {})}::jsonb
      )
    `);

    const newBalance = Number((result as unknown as Array<{ new_balance: string }>)[0]?.new_balance ?? 0);

    // Step 3: Check if balance dropped below auto-top-up threshold
    const workspace = await db
      .select({
        autoTopUpEnabled: workspaces.autoTopUpEnabled,
        autoTopUpThreshold: workspaces.autoTopUpThreshold,
      })
      .from(workspaces)
      .where(eq(workspaces.id, params.workspaceId))
      .limit(1);

    if (workspace.length > 0 && workspace[0].autoTopUpEnabled) {
      const threshold = Number(workspace[0].autoTopUpThreshold ?? 500000);
      if (newBalance < threshold) {
        await inngest.send({
          name: 'viyo/billing.tokens.low',
          data: {
            workspaceId: params.workspaceId,
            currentBalance: newBalance,
            threshold,
          },
        });
      }
    }

    return {
      newBalance,
      tokensDeducted: Math.abs(params.amount),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('insufficient funds')) {
      throw new ApiError(402, 'INSUFFICIENT_TOKENS: Not enough tokens to complete this operation.', {
        code: 'INSUFFICIENT_TOKENS',
        required: Math.abs(params.amount),
      });
    }
    throw err;
  }
}

/* ──────────────────────────────────────────────
 * Token Grant — For subscription grants, top-ups, refunds
 * Uses the same atomic RPC with positive amounts
 * ────────────────────────────────────────────── */
export interface GrantTokensParams {
  workspaceId: string;
  amount: number;
  transactionType: string;
  description: string;
  stripePaymentIntentId?: string;
  metadata?: Record<string, unknown>;
}

export async function grantTokens(params: GrantTokensParams): Promise<number> {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');

  const positiveAmount = Math.abs(params.amount);

  const result = await db.execute(sql`
    SELECT * FROM atomic_token_deduction(
      ${params.workspaceId}::uuid,
      ${null}::uuid,
      ${positiveAmount}::bigint,
      ${params.transactionType}::varchar,
      ${params.description}::text,
      ${null}::varchar,
      ${null}::uuid,
      ${JSON.stringify(params.metadata ?? {})}::jsonb
    )
  `);

  const newBalance = Number((result as unknown as Array<{ new_balance: string }>)[0]?.new_balance ?? 0);
  return newBalance;
}

/* ──────────────────────────────────────────────
 * USD → Token Conversion
 * T9 §3: rawUSD * TOKEN_MULTIPLIER = VIYO tokens
 * ────────────────────────────────────────────── */
export async function usdToTokens(usdAmount: number): Promise<number> {
  const multiplier = await getSystemConfig<number>('TOKEN_MULTIPLIER');
  if (!multiplier) {
    throw new ApiError(500, 'TOKEN_MULTIPLIER not configured in system_config');
  }
  return Math.ceil(usdAmount * Number(multiplier));
}

/* ──────────────────────────────────────────────
 * Balance Lookup — O(1) from token_balances
 * ────────────────────────────────────────────── */
export async function getTokenBalance(workspaceId: string): Promise<{
  balance: number;
  lifetimeGranted: number;
  lifetimeConsumed: number;
  lifetimeRefunded: number;
}> {
  const db = getDb();
  if (!db) throw new ApiError(503, 'Database not available');

  const rows = await db
    .select()
    .from(tokenBalances)
    .where(eq(tokenBalances.workspaceId, workspaceId))
    .limit(1);

  if (rows.length === 0) {
    return { balance: 0, lifetimeGranted: 0, lifetimeConsumed: 0, lifetimeRefunded: 0 };
  }

  return {
    balance: Number(rows[0].balance),
    lifetimeGranted: Number(rows[0].lifetimeGranted),
    lifetimeConsumed: Number(rows[0].lifetimeConsumed),
    lifetimeRefunded: Number(rows[0].lifetimeRefunded),
  };
}
