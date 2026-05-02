/**
 * Webhook Domain — T45 Composite Database Foundation / T48 Lock v3.0
 * Tables: webhook_endpoints, webhook_delivery_logs
 * Tenant-scoped endpoint ownership via workspace_id; delivery-log RLS joins through the owning endpoint.
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workspaces } from './identity.js';

export const WEBHOOK_EVENT_CATALOG = [
  'email.generation.started',
  'email.generation.completed',
  'email.generation.failed',
  'email.export.completed',
  'email.export.failed',
  'email.status.changed',
  'image.generation.started',
  'image.generation.completed',
  'image.generation.failed',
  'image.edit.completed',
  'image.edit.failed',
  'image.saved_to_vault',
  'brand.import.started',
  'brand.import.completed',
  'brand.import.failed',
  'brand.assets.updated',
  'team.comment.added',
  'team.approval.granted',
  'team.member.invited',
  'billing.tokens.low',
  'billing.tokens.depleted',
  'billing.subscription.changed',
] as const;

export type WebhookEventType = typeof WEBHOOK_EVENT_CATALOG[number];

/* ──────────────────────────────────────────────
 * WEBHOOK_ENDPOINTS — T48 exact endpoint foundation
 * Columns match the v3.0 architecture lock.
 * ────────────────────────────────────────────── */
export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  secret: varchar('secret', { length: 64 }).notNull(),
  events: varchar('events', { length: 100 }).array().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  description: varchar('description', { length: 255 }),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  failureCount: integer('failure_count').default(0).notNull(),
}, (table) => ({
  idxWebhookEndpointsWorkspaceId: index('idx_webhook_endpoints_workspace_id').on(table.workspaceId),
  idxWebhookEndpointsActive: index('idx_webhook_endpoints_active').on(table.workspaceId, table.isActive),
  idxWebhookEndpointsEvents: index('idx_webhook_endpoints_events').on(table.events),
}));

/* ──────────────────────────────────────────────
 * WEBHOOK_DELIVERY_LOGS — T48 exact delivery-log foundation
 * Rows cascade when the owning webhook endpoint is deleted.
 * ────────────────────────────────────────────── */
export const webhookDeliveryLogs = pgTable('webhook_delivery_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookEndpointId: uuid('webhook_endpoint_id').notNull().references(() => webhookEndpoints.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseTimeMs: integer('response_time_ms'),
  attemptNumber: integer('attempt_number').default(1).notNull(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxWebhookDeliveryLogsEndpointId: index('idx_webhook_delivery_logs_endpoint_id').on(table.webhookEndpointId, table.deliveredAt),
  idxWebhookDeliveryLogsResponseStatus: index('idx_webhook_delivery_logs_response_status').on(table.responseStatus),
}));
