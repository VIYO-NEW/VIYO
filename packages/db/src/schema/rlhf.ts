/**
 * RLHF & Preference Learning Domain — R20 §2, R24 & R19 Wiring
 * Tables: rlhf_votes, preference_model_versions, pattern_performance_metrics
 * NOT tenant-scoped — internal VIYO system intelligence data
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './identity.js';
import { imagePromptPatterns } from './image-intelligence.js';

/* ──────────────────────────────────────────────
 * RLHF_VOTES — Human feedback on generated images
 * R20: tenantScoped = false (internal VIYO system data)
 * R24 Wiring: Dual-Scoring system input
 * R20 Enum: vote IN ('approve','reject','skip')
 * ────────────────────────────────────────────── */
export const rlhfVotes = pgTable('rlhf_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').references(() => imagePromptPatterns.id, { onDelete: 'cascade' }),
  sourceImageUrl: text('source_image_url').notNull(),
  generatedImageUrl: text('generated_image_url').notNull(),
  curatorId: uuid('curator_id').references(() => users.id, { onDelete: 'cascade' }),
  vote: varchar('vote', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * PREFERENCE_MODEL_VERSIONS — Trained preference model tracking
 * R20: tenantScoped = false (internal VIYO system data)
 * R24/R19 Wiring: Learning Loop model versioning
 * ────────────────────────────────────────────── */
export const preferenceModelVersions = pgTable('preference_model_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionTag: varchar('version_tag', { length: 50 }).notNull().unique(),
  trainingVoteCount: integer('training_vote_count').notNull(),
  accuracyScore: numeric('accuracy_score', { precision: 5, scale: 4 }),
  isActive: boolean('is_active').default(false).notNull(),
  modelWeightsUrl: text('model_weights_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * PATTERN_PERFORMANCE_METRICS — Aggregated pattern effectiveness
 * R20: tenantScoped = false (aggregated global intelligence)
 * R24/R19 Wiring: Pattern scoring for prompt selection
 * R20 Enum: pattern_type IN ('copywriting','layout','timing')
 * ────────────────────────────────────────────── */
export const patternPerformanceMetrics = pgTable('pattern_performance_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  patternId: uuid('pattern_id').notNull(),
  patternType: varchar('pattern_type', { length: 50 }).notNull(),
  totalSends: integer('total_sends').default(0).notNull(),
  openRate: numeric('open_rate', { precision: 5, scale: 4 }),
  clickRate: numeric('click_rate', { precision: 5, scale: 4 }),
  conversionRate: numeric('conversion_rate', { precision: 5, scale: 4 }),
  lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
