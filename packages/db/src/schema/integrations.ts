/**
 * Integrations Domain — T45 Composite Database Foundation
 * Tables: integration_connections
 * Tenant-scoped encrypted OAuth/platform connection storage.
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users, workspaces } from './identity.js';

/* ──────────────────────────────────────────────
 * INTEGRATION_CONNECTIONS — Encrypted OAuth/platform credentials
 * T19: schema-only foundation; no OAuth runtime clients in T45.
 * ────────────────────────────────────────────── */
export const integrationConnections = pgTable('integration_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).default('active').notNull(),
  accessTokenEncrypted: text('access_token_encrypted').notNull(),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  scopes: varchar('scopes', { length: 100 }).array().default(sql`'{}'::varchar[]`).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  channelMappings: jsonb('channel_mappings').default(sql`'{}'::jsonb`).notNull(),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxIntegrationConnectionsWorkspaceProvider: index('idx_integration_connections_workspace_provider').on(
    table.workspaceId,
    table.provider,
  ),
  idxIntegrationConnectionsStatus: index('idx_integration_connections_status').on(table.status),
  uqIntegrationConnectionsProvider: uniqueIndex('uq_integration_connections_provider').on(table.workspaceId, table.provider),
}));
