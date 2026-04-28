/**
 * Image Intelligence Moat Domain — R20 §2, R24 Wiring
 * Tables: image_prompt_patterns
 * NOT tenant-scoped — global VIYO intelligence, service_role RLS only
 * Uses pgvector embedding(1536) with IVFFlat index
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  numeric,
  integer,
  boolean,
  timestamp,
  customType,
} from 'drizzle-orm/pg-core';

/** Custom pgvector type for Drizzle ORM */
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === 'string') return JSON.parse(value) as number[];
    return value as number[];
  },
});

/* ──────────────────────────────────────────────
 * IMAGE_PROMPT_PATTERNS — Vector-cached prompt patterns
 * R20: tenantScoped = false, service_role RLS
 * R24 Wiring: Three-Tiered Image Pipeline prompt caching moat
 * Indexes: IVFFlat on embedding, composite on category+layout_type
 * ────────────────────────────────────────────── */
export const imagePromptPatterns = pgTable('image_prompt_patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 100 }).notNull(),
  layoutType: varchar('layout_type', { length: 50 }).notNull(),
  typographyStyle: varchar('typography_style', { length: 50 }).notNull(),
  targetModels: text('target_models').array().notNull(),
  promptTemplate: text('prompt_template').notNull(),
  styleSchema: jsonb('style_schema').notNull(),
  embedding: vector('embedding').notNull(),
  qaScore: numeric('qa_score', { precision: 3, scale: 2 }).notNull(),
  costPerGen: numeric('cost_per_gen', { precision: 5, scale: 4 }).notNull(),
  supportsTypography: boolean('supports_typography').default(false).notNull(),
  fidelityScore: numeric('fidelity_score', { precision: 3, scale: 2 }).default('0.50').notNull(),
  productType: varchar('product_type', { length: 100 }).default('general').notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
