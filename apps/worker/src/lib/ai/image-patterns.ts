/**
 * Image Prompt Pattern Repository — T46
 *
 * Reads the T45 image_prompt_patterns table for semantic cache candidates and
 * updates usage metadata after a selected cache hit. The table is global VIYO
 * intelligence, not tenant-scoped, and remains protected by service-role RLS.
 */
import { eq, sql } from 'drizzle-orm';
import { imagePromptPatterns } from '@viyo/db';
import { getDb } from '../db.js';

export interface ImagePatternCandidate {
  id: string;
  category: string;
  layoutType: string;
  typographyStyle: string;
  targetModels: string[];
  promptTemplate: string;
  qaScore: number;
  costPerGen: number;
  supportsTypography: boolean;
  fidelityScore: number;
  productType: string;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  similarity: number;
}

interface PatternCandidateRow {
  id: string;
  category: string;
  layoutType: string;
  typographyStyle: string;
  targetModels: string[];
  promptTemplate: string;
  qaScore: string | number;
  costPerGen: string | number;
  supportsTypography: boolean;
  fidelityScore: string | number;
  productType: string;
  usageCount: number;
  lastUsedAt: Date | string | null;
  createdAt: Date | string;
  similarity?: string | number | null;
}

function toDate(value: Date | string | null): Date | null {
  if (value === null) return null;
  return value instanceof Date ? value : new Date(value);
}

function mapRow(row: PatternCandidateRow): ImagePatternCandidate {
  return {
    id: row.id,
    category: row.category,
    layoutType: row.layoutType,
    typographyStyle: row.typographyStyle,
    targetModels: row.targetModels,
    promptTemplate: row.promptTemplate,
    qaScore: Number(row.qaScore),
    costPerGen: Number(row.costPerGen),
    supportsTypography: row.supportsTypography,
    fidelityScore: Number(row.fidelityScore),
    productType: row.productType,
    usageCount: Number(row.usageCount),
    lastUsedAt: toDate(row.lastUsedAt),
    createdAt: toDate(row.createdAt) ?? new Date(),
    similarity: Number(row.similarity ?? 0),
  };
}

export async function findPatternCandidates(params: {
  embedding: number[] | null;
  productType?: string;
  typographyRequired: boolean;
  limit?: number;
}): Promise<ImagePatternCandidate[]> {
  const db = getDb();
  if (!db) return [];

  const limit = params.limit ?? 10;
  const productType = params.productType ?? 'general';

  if (!params.embedding?.length) {
    const rows = await db
      .select({
        id: imagePromptPatterns.id,
        category: imagePromptPatterns.category,
        layoutType: imagePromptPatterns.layoutType,
        typographyStyle: imagePromptPatterns.typographyStyle,
        targetModels: imagePromptPatterns.targetModels,
        promptTemplate: imagePromptPatterns.promptTemplate,
        qaScore: imagePromptPatterns.qaScore,
        costPerGen: imagePromptPatterns.costPerGen,
        supportsTypography: imagePromptPatterns.supportsTypography,
        fidelityScore: imagePromptPatterns.fidelityScore,
        productType: imagePromptPatterns.productType,
        usageCount: imagePromptPatterns.usageCount,
        lastUsedAt: imagePromptPatterns.lastUsedAt,
        createdAt: imagePromptPatterns.createdAt,
        similarity: sql<number>`0`,
      })
      .from(imagePromptPatterns)
      .where(sql`${imagePromptPatterns.productType} IN (${productType}, 'general')`)
      .orderBy(sql`${imagePromptPatterns.fidelityScore} DESC`, sql`${imagePromptPatterns.qaScore} DESC`)
      .limit(limit);

    return rows
      .map((row) => mapRow(row as unknown as PatternCandidateRow))
      .filter((row) => !params.typographyRequired || row.supportsTypography);
  }

  const vectorLiteral = `[${params.embedding.map((value) => Number(value).toFixed(8)).join(',')}]`;
  const result = await db.execute(sql`
    SELECT
      id,
      category,
      layout_type AS "layoutType",
      typography_style AS "typographyStyle",
      target_models AS "targetModels",
      prompt_template AS "promptTemplate",
      qa_score AS "qaScore",
      cost_per_gen AS "costPerGen",
      supports_typography AS "supportsTypography",
      fidelity_score AS "fidelityScore",
      product_type AS "productType",
      usage_count AS "usageCount",
      last_used_at AS "lastUsedAt",
      created_at AS "createdAt",
      GREATEST(0, 1 - (embedding <=> ${vectorLiteral}::vector)) AS similarity
    FROM image_prompt_patterns
    WHERE product_type IN (${productType}, 'general')
      AND (${params.typographyRequired} = false OR supports_typography = true)
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `);

  return (result as unknown as PatternCandidateRow[]).map(mapRow);
}

export async function markPatternUsed(patternId: string): Promise<void> {
  const db = getDb();
  if (!db) return;

  await db
    .update(imagePromptPatterns)
    .set({
      usageCount: sql`${imagePromptPatterns.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(imagePromptPatterns.id, patternId));
}
