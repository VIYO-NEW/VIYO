/**
 * Collaboration Domain — T45 Composite Database Foundation
 * Tables: brands, comments, notification_preferences
 * Tenant-scoped via workspace_id → workspaces.id with RLS in SQL migrations.
 */
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users, workspaces } from './identity';

/** Exact PO-approved 11-value comment target taxonomy. */
export const commentTargetTypeEnum = pgEnum('comment_target_type', [
  'image',
  'email',
  'product',
  'segment',
  'flow',
  'event',
  'calendar',
  'strategy',
  'branding',
  'support',
  'general',
]);

/* ──────────────────────────────────────────────
 * BRANDS — Minimal brand anchor required by comments.brand_id
 * T45 Option A: foundational brand table created before comments.
 * ────────────────────────────────────────────── */
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxBrandsWorkspaceId: index('idx_brands_workspace_id').on(table.workspaceId),
  uqBrandsIdWorkspace: uniqueIndex('uq_brands_id_workspace').on(table.id, table.workspaceId),
}));

/* ──────────────────────────────────────────────
 * COMMENTS — Brand-isolated threaded comments
 * T16: anchors, mentions, references, exact target enum.
 * ────────────────────────────────────────────── */
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: commentTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  isResolved: boolean('is_resolved').default(false).notNull(),
  anchorX: numeric('anchor_x', { precision: 7, scale: 2 }),
  anchorY: numeric('anchor_y', { precision: 7, scale: 2 }),
  mentionedUserIds: uuid('mentioned_user_ids').array().default(sql`'{}'::uuid[]`).notNull(),
  referencedEntityIds: uuid('referenced_entity_ids').array().default(sql`'{}'::uuid[]`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxCommentsWorkspaceId: index('idx_comments_workspace_id').on(table.workspaceId),
  idxCommentsBrandId: index('idx_comments_brand_id').on(table.brandId),
  idxCommentsAuthorId: index('idx_comments_author_id').on(table.authorId),
  idxCommentsTarget: index('idx_comments_target').on(table.targetType, table.targetId),
  idxCommentsParentId: index('idx_comments_parent_id').on(table.parentId),
  idxCommentsUnresolved: index('idx_comments_unresolved').on(table.brandId, table.createdAt),
  uqCommentsIdWorkspace: uniqueIndex('uq_comments_id_workspace').on(table.id, table.workspaceId),
}));

/* ──────────────────────────────────────────────
 * NOTIFICATION_PREFERENCES — User notification preference foundation
 * T18: schema-only preference storage for future dispatch work.
 * ────────────────────────────────────────────── */
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxNotificationPreferencesWorkspaceUser: index('idx_notification_preferences_workspace_user').on(table.workspaceId, table.userId),
  idxNotificationPreferencesEventChannel: index('idx_notification_preferences_event_channel').on(table.eventType, table.channel),
  uqNotificationPreferencesScope: uniqueIndex('uq_notification_preferences_scope').on(
    table.workspaceId,
    table.userId,
    table.eventType,
    table.channel,
  ),
}));
