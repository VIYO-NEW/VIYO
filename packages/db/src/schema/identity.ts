/**
 * Identity Domain — R20 §2, R22 Wiring
 * Tables: workspaces, users, api_keys
 * workspaces is the ROOT TENANT anchor for the entire VIYO system.
 */
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  jsonb,
  timestamp,
  text,
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
  subscriptionTier: varchar('subscription_tier', { length: 50 })
    .default('free')
    .notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  settings: jsonb('settings').default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * USERS — Bridge between auth.users and workspaces
 * R20: tenantScoped = false (special: id references auth.users)
 * R20: workspace_id FK to workspaces.id
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
