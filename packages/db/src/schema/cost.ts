/**
 * Cost Tracking Domain — R20 §2, R23 Wiring
 * Tables: token_usage_logs
 * Tenant-scoped via workspace_id → workspaces.id
 */
import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workspaces } from './identity.js';

/* ──────────────────────────────────────────────
 * TOKEN_USAGE_LOGS — AI provider cost tracking
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R23 Wiring: Stripe meter reconciliation
 * R20 Enum: operation_type IN ('text_gen','image_gen','vision_qa',
 *           'embedding','speech','video_analysis')
 * Indexes: workspace+date DESC, unsent meter events
 * ────────────────────────────────────────────── */
export const tokenUsageLogs = pgTable('token_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  operationType: varchar('operation_type', { length: 50 }).notNull(),
  promptTokens: integer('prompt_tokens').default(0).notNull(),
  completionTokens: integer('completion_tokens').default(0).notNull(),
  imageCount: integer('image_count').default(0).notNull(),
  calculatedCost: numeric('calculated_cost', { precision: 10, scale: 6 }).notNull(),
  stripeMeterEventId: varchar('stripe_meter_event_id', { length: 255 }),
  inngestRunId: varchar('inngest_run_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxUsageWsDate: index('idx_usage_ws_date').on(table.workspaceId, table.createdAt),
  idxUsageUnsent: index('idx_usage_unsent').on(table.stripeMeterEventId),
}));
