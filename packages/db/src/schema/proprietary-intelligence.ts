/**
 * Proprietary Intelligence Architecture Domain — PIA-1 Foundation / Phase 0
 * Tables: brand_preferences, hyve_pattern_performance, campaign_performance
 * Sources: R36 HYVE, R37 MAAX, R38 SYPHON, Architecture Lock V8, PRD V6 Addendum, Naming Registry.
 * Design rule: consent and brand isolation first; HYVE stores anonymized aggregate pattern data only.
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  integer,
  numeric,
  timestamp,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { brands } from './collaboration.js';
import { users, workspaces } from './identity.js';

/* ──────────────────────────────────────────────
 * BRAND_PREFERENCES — R37 MAAX isolated brand memory
 * Captures only real preference signals from VVOW/PULZE/Vault paths.
 * ────────────────────────────────────────────── */
export const brandPreferences = pgTable(
  'brand_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    studioType: varchar('studio_type', { length: 50 }).notNull(),
    actionType: varchar('action_type', { length: 50 }).notNull(),
    generationId: uuid('generation_id'),
    contextPayload: jsonb('context_payload').default(sql`'{}'::jsonb`).notNull(),
    editDelta: jsonb('edit_delta').default(sql`'{}'::jsonb`).notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idxBrandPreferencesWorkspaceId: index('idx_brand_preferences_workspace_id').on(table.workspaceId),
    idxBrandPreferencesBrandRecorded: index('idx_brand_preferences_brand_recorded').on(
      table.brandId,
      table.recordedAt,
    ),
    idxBrandPreferencesStudioAction: index('idx_brand_preferences_studio_action').on(
      table.studioType,
      table.actionType,
      table.recordedAt,
    ),
    idxBrandPreferencesGenerationId: index('idx_brand_preferences_generation_id').on(table.generationId),
    fkBrandPreferencesBrandWorkspace: foreignKey({
      columns: [table.brandId, table.workspaceId],
      foreignColumns: [brands.id, brands.workspaceId],
      name: 'fk_brand_preferences_brand_workspace',
    }).onDelete('cascade'),
  }),
);

/* ──────────────────────────────────────────────
 * HYVE_PATTERN_PERFORMANCE — R36 anonymized network intelligence
 * No brand identity, customer identity, raw prompts, raw creative text, raw image content, or customer lists.
 * ────────────────────────────────────────────── */
export const hyvePatternPerformance = pgTable(
  'hyve_pattern_performance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vertical: varchar('vertical', { length: 120 }).notNull(),
    revenueBand: varchar('revenue_band', { length: 80 }).notNull(),
    patternKey: varchar('pattern_key', { length: 160 }).notNull(),
    metricName: varchar('metric_name', { length: 80 }).notNull(),
    metricValue: numeric('metric_value', { precision: 14, scale: 4 }).notNull(),
    audienceSegment: varchar('audience_segment', { length: 160 }),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb('metadata').default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idxHyvePatternVerticalRevenue: index('idx_hyve_pattern_vertical_revenue').on(
      table.vertical,
      table.revenueBand,
      table.recordedAt,
    ),
    idxHyvePatternKeyMetric: index('idx_hyve_pattern_key_metric').on(
      table.patternKey,
      table.metricName,
      table.recordedAt,
    ),
  }),
);

/* ──────────────────────────────────────────────
 * CAMPAIGN_PERFORMANCE — R38 SYPHON aggregate metrics
 * Stores campaign-level counts and revenue attribution; no customer-level PII.
 * ────────────────────────────────────────────── */
export const campaignPerformance = pgTable(
  'campaign_performance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    brandId: uuid('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    generationId: uuid('generation_id'),
    externalCampaignId: varchar('external_campaign_id', { length: 255 }),
    externalCampaignName: text('external_campaign_name'),
    platform: varchar('platform', { length: 80 }).notNull(),
    sendCount: integer('send_count').default(0).notNull(),
    openCount: integer('open_count').default(0).notNull(),
    clickCount: integer('click_count').default(0).notNull(),
    attributedRevenue: numeric('attributed_revenue', { precision: 14, scale: 2 }).default('0').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    metricsWindowStart: timestamp('metrics_window_start', { withTimezone: true }),
    metricsWindowEnd: timestamp('metrics_window_end', { withTimezone: true }),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    metadata: jsonb('metadata').default(sql`'{}'::jsonb`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    idxCampaignPerformanceWorkspaceId: index('idx_campaign_performance_workspace_id').on(table.workspaceId),
    idxCampaignPerformanceBrandPlatform: index('idx_campaign_performance_brand_platform').on(
      table.brandId,
      table.platform,
      table.lastSyncedAt,
    ),
    idxCampaignPerformanceGenerationId: index('idx_campaign_performance_generation_id').on(table.generationId),
    idxCampaignPerformanceExternalCampaign: index('idx_campaign_performance_external_campaign').on(
      table.platform,
      table.externalCampaignId,
    ),
    fkCampaignPerformanceBrandWorkspace: foreignKey({
      columns: [table.brandId, table.workspaceId],
      foreignColumns: [brands.id, brands.workspaceId],
      name: 'fk_campaign_performance_brand_workspace',
    }).onDelete('cascade'),
  }),
);

// Explicit type aliases for downstream contracts without forcing implementation code to infer table shapes ad hoc.
export type BrandPreference = typeof brandPreferences.$inferSelect;
export type NewBrandPreference = typeof brandPreferences.$inferInsert;
export type HyvePatternPerformance = typeof hyvePatternPerformance.$inferSelect;
export type NewHyvePatternPerformance = typeof hyvePatternPerformance.$inferInsert;
export type CampaignPerformance = typeof campaignPerformance.$inferSelect;
export type NewCampaignPerformance = typeof campaignPerformance.$inferInsert;
