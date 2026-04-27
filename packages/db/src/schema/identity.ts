/**
 * Identity Domain — R20 §2, R22 Wiring
 * Tables: workspaces, users, api_keys, workspace_members
 * workspaces is the ROOT TENANT anchor for the entire VIYO system.
 * workspace_members is the junction table for multi-workspace access (ADR-009).
 */
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  jsonb,
  timestamp,
  text,
  bigint,
  unique,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/* ──────────────────────────────────────────────
 * WORKSPACES — Root tenant entity (NOT tenant-scoped itself)
 * Every tenant-scoped table references workspaces.id
 * R20: tenantScoped = false, has custom RLS
 * ────────────────────────────────────────────── */
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  subscriptionStatus: varchar('subscription_status', { length: 50 })
    .default('free')
    .notNull(),
  subscriptionTier: varchar('subscription_tier', { length: 50 })
    .default('free')
    .notNull(),
  billingCycleAnchor: timestamp('billing_cycle_anchor', { withTimezone: true }),
  autoTopUpEnabled: boolean('auto_top_up_enabled').default(false).notNull(),
  autoTopUpThreshold: bigint('auto_top_up_threshold', { mode: 'number' }).default(500000),
  autoTopUpPack: varchar('auto_top_up_pack', { length: 20 }).default('small'),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  settings: jsonb('settings').default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * USERS — Bridge between auth.users and workspaces
 * R20: tenantScoped = false (special: id references auth.users)
 * R20: workspace_id FK to workspaces.id (default workspace)
 * ────────────────────────────────────────────── */
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * WORKSPACE_MEMBERS — Multi-workspace access junction table
 * ADR-009: Enables users to belong to multiple workspaces.
 * RLS policies use this table for tenant isolation checks.
 * R22 §5.1: check_workspace_access(auth.uid(), workspace_id)
 * ────────────────────────────────────────────── */
export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: varchar('role', { length: 50 })
      .default('member')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueMembership: unique('uq_workspace_user').on(table.workspaceId, table.userId),
  }),
);

/* ──────────────────────────────────────────────
 * API_KEYS — Per-workspace API key management
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R22 Wiring: key_hash for secure storage
 * ────────────────────────────────────────────── */
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 8 }).notNull(),
  label: varchar('label', { length: 100 }),
  scopes: text('scopes').array().default(sql`'{}'`),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
