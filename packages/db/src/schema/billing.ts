/**
 * Billing Domain — R20 [2026-04-26], T9 Master Spec §2
 * Tables: token_balances, token_ledger, stripe_webhook_events,
 *         system_config, system_config_audit_log, provider_pricing_registry,
 *         promo_codes, promo_redemptions, system_email_templates
 *
 * Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §2, R20 [2026-04-26]
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  bigint,
  numeric,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './identity.js';

/* ──────────────────────────────────────────────
 * TOKEN_BALANCES — Materialized O(1) balance lookups
 * R20 [2026-04-26]: workspace_id PK, balance, lifetime counters
 * Updated ONLY by atomic_token_deduction RPC
 * ────────────────────────────────────────────── */
export const tokenBalances = pgTable('token_balances', {
  workspaceId: uuid('workspace_id')
    .primaryKey()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  lifetimeGranted: bigint('lifetime_granted', { mode: 'number' }).notNull().default(0),
  lifetimeConsumed: bigint('lifetime_consumed', { mode: 'number' }).notNull().default(0),
  lifetimeRefunded: bigint('lifetime_refunded', { mode: 'number' }).notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * TOKEN_LEDGER — Immutable customer token ledger
 * R20 [2026-04-26]: INSERT only, no UPDATE/DELETE
 * Every token movement has a corresponding row.
 * transaction_type CHECK enforced in migration SQL.
 * ────────────────────────────────────────────── */
export const tokenLedger = pgTable('token_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  runningBalance: bigint('running_balance', { mode: 'number' }).notNull(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxLedgerWsCreated: index('idx_token_ledger_workspace_created')
    .on(table.workspaceId, table.createdAt),
  idxLedgerStripePi: index('idx_token_ledger_stripe_pi')
    .on(table.stripePaymentIntentId),
}));

/* ──────────────────────────────────────────────
 * STRIPE_WEBHOOK_EVENTS — Idempotency guard
 * R20 [2026-04-26]: evt_xxx PK, prevents double-processing
 * Service role access only (RLS in migration)
 * ────────────────────────────────────────────── */
export const stripeWebhookEvents = pgTable('stripe_webhook_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  payload: jsonb('payload').notNull(),
});

/* ──────────────────────────────────────────────
 * SYSTEM_CONFIG — Billing constants (TOKEN_MULTIPLIER, etc.)
 * R20 [2026-04-26]: key-value store for system-wide settings
 * Read by Token Engine (cached 5min), written by Admin
 * ────────────────────────────────────────────── */
export const systemConfig = pgTable('system_config', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * SYSTEM_CONFIG_AUDIT_LOG — Immutable change log
 * R20 [2026-04-26]: Tracks every system_config change
 * ────────────────────────────────────────────── */
export const systemConfigAuditLog = pgTable('system_config_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  configKey: varchar('config_key', { length: 100 }).notNull(),
  oldValue: jsonb('old_value').notNull(),
  newValue: jsonb('new_value').notNull(),
  reason: text('reason').notNull(),
  changedBy: uuid('changed_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * PROVIDER_PRICING_REGISTRY — Model cost tracking
 * R20 [2026-04-26]: Per-model cost data for margin calculation
 * Updated by weekly Inngest price monitor cron
 * ────────────────────────────────────────────── */
export const providerPricingRegistry = pgTable('provider_pricing_registry', {
  id: uuid('id').primaryKey().defaultRandom(),
  modelId: varchar('model_id', { length: 100 }).notNull().unique(),
  provider: varchar('provider', { length: 50 }).notNull(),
  inputCostPer1m: numeric('input_cost_per_1m', { precision: 10, scale: 4 }),
  outputCostPer1m: numeric('output_cost_per_1m', { precision: 10, scale: 4 }),
  costPerImage: numeric('cost_per_image', { precision: 10, scale: 4 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * PROMO_CODES — Stripe coupon + VIYO token grant
 * R20 [2026-04-26]: Admin-managed promotional codes
 * ────────────────────────────────────────────── */
export const promoCodes = pgTable('promo_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  stripeCouponId: varchar('stripe_coupon_id', { length: 255 }),
  tokenGrant: bigint('token_grant', { mode: 'number' }).default(0).notNull(),
  maxRedemptions: integer('max_redemptions'),
  currentRedemptions: integer('current_redemptions').default(0).notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * PROMO_REDEMPTIONS — Tracks which workspace used which promo
 * R20 [2026-04-26]: Audit trail for promo code usage
 * ────────────────────────────────────────────── */
export const promoRedemptions = pgTable('promo_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  promoCodeId: uuid('promo_code_id')
    .notNull()
    .references(() => promoCodes.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  tokensGranted: bigint('tokens_granted', { mode: 'number' }).notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * SYSTEM_EMAIL_TEMPLATES — VIYO-branded transactional emails
 * R20 [2026-04-26]: 15 templates, admin-editable
 * NOT tenant-scoped — these are system-wide templates
 * ────────────────────────────────────────────── */
export const systemEmailTemplates = pgTable('system_email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateKey: varchar('template_key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: text('subject').notNull(),
  bodyHtml: text('body_html').notNull(),
  bodyText: text('body_text'),
  variables: jsonb('variables').default(sql`'[]'::jsonb`).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
