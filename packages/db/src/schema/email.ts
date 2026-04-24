/**
 * Email Composition Domain — R20 §2, R27 & R29 Wiring
 * Tables: email_templates, esp_connections
 * Both tenant-scoped via workspace_id → workspaces.id
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './identity';

/* ──────────────────────────────────────────────
 * EMAIL_TEMPLATES — Composable email templates
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R27 Wiring: Composable Sections stored as viyo_utl_source
 * R29 Wiring: Compiled to MJML/HTML per ESP target
 * R20 Enum: status IN ('draft','review','approved','sent')
 * ────────────────────────────────────────────── */
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  subjectLine: text('subject_line').notNull(),
  preheader: text('preheader'),
  viyoUtlSource: text('viyo_utl_source').notNull(),
  compiledHtml: text('compiled_html'),
  compiledMjml: text('compiled_mjml'),
  espTarget: varchar('esp_target', { length: 50 }),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * ESP_CONNECTIONS — Email Service Provider credentials
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R29 Wiring: Platform Abstraction Layer connector storage
 * R20 Enum: provider IN ('klaviyo','mailchimp','sendgrid','brevo',
 *           'hubspot','activecampaign','drip','customer_io')
 * ────────────────────────────────────────────── */
export const espConnections = pgTable('esp_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
