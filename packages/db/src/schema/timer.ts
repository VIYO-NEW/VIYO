/**
 * Timer Service Domain — R20 §2, R28 Wiring
 * Tables: timer_definitions
 * Tenant-scoped via workspace_id → workspaces.id
 */
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './identity';

/* ──────────────────────────────────────────────
 * TIMER_DEFINITIONS — Countdown timer configuration
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R28 Wiring: Go WASM GIF engine reads config from here
 * ────────────────────────────────────────────── */
export const timerDefinitions = pgTable('timer_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).notNull(),
  targetTimestamp: timestamp('target_timestamp', { withTimezone: true }).notNull(),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  styleConfig: jsonb('style_config').default(sql`'{}'::jsonb`).notNull(),
  fallbackText: varchar('fallback_text', { length: 255 }).default('Offer Expired').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
