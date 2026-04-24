/**
 * Products & Assets Domain — R20 §2, R31 Wiring
 * Tables: viyo_products, assets
 * Both tenant-scoped via workspace_id → workspaces.id
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  jsonb,
  integer,
  bigint,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './identity';

/* ──────────────────────────────────────────────
 * VIYO_PRODUCTS — Scraped e-commerce product data
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R31 Wiring: Product Data Extraction stores results here
 * ────────────────────────────────────────────── */
export const viyoProducts = pgTable('viyo_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  sourceUrl: text('source_url').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  category: varchar('category', { length: 100 }),
  extractedData: jsonb('extracted_data').default(sql`'{}'::jsonb`).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ──────────────────────────────────────────────
 * ASSETS — Product images, generated heroes, video clips
 * R20: tenantScoped = true → workspace_id FK + RLS
 * R31 Wiring: Linked to viyo_products via product_id
 * R20 Enum: asset_type IN ('product_photo','lifestyle_scene','generated_hero',
 *           'generated_section','video_clip','brand_logo')
 * ────────────────────────────────────────────── */
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => viyoProducts.id, { onDelete: 'set null' }),
  assetType: varchar('asset_type', { length: 50 }).notNull(),
  storagePath: text('storage_path').notNull(),
  width: integer('width'),
  height: integer('height'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  mimeType: varchar('mime_type', { length: 100 }),
  sourceModel: varchar('source_model', { length: 50 }),
  generationPrompt: text('generation_prompt'),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
