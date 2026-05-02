import { z } from 'zod';

/**
 * Proprietary Intelligence Architecture shared contracts — T93 / PIA-2.
 * Sources: R36 HYVE, R37 MAAX, R38 SYPHON, and PIA-1 migration 0009.
 * These schemas intentionally mirror the database privacy constraints before data
 * reaches Postgres RLS/CHECK enforcement.
 */

export const PIA_BRAND_PREFERENCE_STUDIO_TYPES = [
  'vvow',
  'pulze',
  'vault',
  'brand_style',
  'general',
] as const;

export const PIA_BRAND_PREFERENCE_ACTION_TYPES = [
  'accept',
  'reject',
  'edit',
  'send',
  'brand_style_decision',
  'select_generation',
  'approve_asset',
] as const;

export const CAMPAIGN_PERFORMANCE_FORBIDDEN_METADATA_KEYS = [
  'customer_id',
  'customer_email',
  'customer_phone',
  'customer_list',
  'raw_profile',
  'recipient_email',
] as const;

export const HYVE_PATTERN_FORBIDDEN_METADATA_KEYS = [
  'brand_id',
  'brand_name',
  'workspace_id',
  'customer_id',
  'customer_email',
  'customer_list',
  'raw_prompt',
  'raw_creative_text',
  'raw_image_url',
] as const;

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export type PiaJsonValue =
  | string
  | number
  | boolean
  | null
  | PiaJsonValue[]
  | { [key: string]: PiaJsonValue };

export const piaJsonValueSchema: z.ZodType<PiaJsonValue> = z.lazy(() =>
  z.union([jsonPrimitiveSchema, z.array(piaJsonValueSchema), z.record(piaJsonValueSchema)]),
);

const uuidSchema = z.string().uuid();
const nonNegativeIntegerSchema = z.number().int().min(0);
const nonNegativeNumberSchema = z.number().min(0);
const timestampSchema = z.union([z.string().datetime({ offset: true }), z.date()]);
const optionalTimestampSchema = timestampSchema.nullish();

function collectForbiddenMetadataPaths(
  value: PiaJsonValue,
  forbiddenKeys: readonly string[],
  path: string[] = [],
): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectForbiddenMetadataPaths(item, forbiddenKeys, [...path, String(index)]),
    );
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => {
      const currentPath = [...path, key];
      const currentViolation = forbiddenKeys.includes(key) ? [currentPath.join('.')] : [];
      return [
        ...currentViolation,
        ...collectForbiddenMetadataPaths(child, forbiddenKeys, currentPath),
      ];
    });
  }

  return [];
}

export function createPiaMetadataSchema<const TForbiddenKeys extends readonly string[]>(
  forbiddenKeys: TForbiddenKeys,
  label: string,
): z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodType<PiaJsonValue>>, Record<string, PiaJsonValue>> {
  return z.record(piaJsonValueSchema).superRefine((metadata, ctx) => {
    const forbiddenPaths = collectForbiddenMetadataPaths(metadata, forbiddenKeys);

    if (forbiddenPaths.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} metadata contains forbidden privacy keys: ${forbiddenPaths.join(', ')}`,
      });
    }
  });
}

export const brandPreferenceStudioTypeSchema = z.enum(PIA_BRAND_PREFERENCE_STUDIO_TYPES);
export const brandPreferenceActionTypeSchema = z.enum(PIA_BRAND_PREFERENCE_ACTION_TYPES);
export const campaignPerformanceMetadataSchema = createPiaMetadataSchema(
  CAMPAIGN_PERFORMANCE_FORBIDDEN_METADATA_KEYS,
  'campaign_performance',
);
export const hyvePatternPerformanceMetadataSchema = createPiaMetadataSchema(
  HYVE_PATTERN_FORBIDDEN_METADATA_KEYS,
  'hyve_pattern_performance',
);

export const brandPreferenceSchema = z.object({
  id: uuidSchema.optional(),
  workspace_id: uuidSchema,
  brand_id: uuidSchema,
  user_id: uuidSchema.nullish(),
  studio_type: brandPreferenceStudioTypeSchema,
  action_type: brandPreferenceActionTypeSchema,
  generation_id: uuidSchema.nullish(),
  context_payload: z.record(piaJsonValueSchema).default({}),
  edit_delta: z.record(piaJsonValueSchema).default({}),
  recorded_at: timestampSchema.optional(),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional(),
});

export const createBrandPreferenceSchema = brandPreferenceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  recorded_at: timestampSchema.optional(),
});

export const hyvePatternPerformanceSchema = z.object({
  id: uuidSchema.optional(),
  vertical: z.string().trim().min(1).max(120),
  revenue_band: z.string().trim().min(1).max(80),
  pattern_key: z.string().trim().min(1).max(160),
  metric_name: z.string().trim().min(1).max(80),
  metric_value: nonNegativeNumberSchema,
  audience_segment: z.string().trim().min(1).max(160).nullish(),
  recorded_at: timestampSchema.optional(),
  metadata: hyvePatternPerformanceMetadataSchema.default({}),
  created_at: timestampSchema.optional(),
  updated_at: timestampSchema.optional(),
});

export const createHyvePatternPerformanceSchema = hyvePatternPerformanceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  recorded_at: timestampSchema.optional(),
});

const campaignPerformanceBaseSchema = z.object({
    id: uuidSchema.optional(),
    workspace_id: uuidSchema,
    brand_id: uuidSchema,
    generation_id: uuidSchema.nullish(),
    external_campaign_id: z.string().trim().min(1).max(255).nullish(),
    external_campaign_name: z.string().trim().min(1).nullish(),
    platform: z.string().trim().min(1).max(80),
    send_count: nonNegativeIntegerSchema.default(0),
    open_count: nonNegativeIntegerSchema.default(0),
    click_count: nonNegativeIntegerSchema.default(0),
    attributed_revenue: nonNegativeNumberSchema.default(0),
    currency: z.string().trim().length(3).default('USD'),
    metrics_window_start: optionalTimestampSchema,
    metrics_window_end: optionalTimestampSchema,
    last_synced_at: optionalTimestampSchema,
    metadata: campaignPerformanceMetadataSchema.default({}),
    created_at: timestampSchema.optional(),
    updated_at: timestampSchema.optional(),
  });

export const campaignPerformanceSchema = campaignPerformanceBaseSchema.superRefine((value, ctx) => {
    if (value.metrics_window_start && value.metrics_window_end) {
      const windowStart = new Date(value.metrics_window_start).getTime();
      const windowEnd = new Date(value.metrics_window_end).getTime();

      if (Number.isFinite(windowStart) && Number.isFinite(windowEnd) && windowEnd < windowStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['metrics_window_end'],
          message: 'metrics_window_end must be greater than or equal to metrics_window_start',
        });
      }
    }
  });

export const createCampaignPerformanceSchema = campaignPerformanceBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).superRefine((value, ctx) => {
  if (value.metrics_window_start && value.metrics_window_end) {
    const windowStart = new Date(value.metrics_window_start).getTime();
    const windowEnd = new Date(value.metrics_window_end).getTime();

    if (Number.isFinite(windowStart) && Number.isFinite(windowEnd) && windowEnd < windowStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metrics_window_end'],
        message: 'metrics_window_end must be greater than or equal to metrics_window_start',
      });
    }
  }
});

export type BrandPreferenceStudioType = z.infer<typeof brandPreferenceStudioTypeSchema>;
export type BrandPreferenceActionType = z.infer<typeof brandPreferenceActionTypeSchema>;
export type CampaignPerformanceMetadata = z.infer<typeof campaignPerformanceMetadataSchema>;
export type HyvePatternPerformanceMetadata = z.infer<typeof hyvePatternPerformanceMetadataSchema>;
export type BrandPreference = z.infer<typeof brandPreferenceSchema>;
export type CreateBrandPreferenceInput = z.infer<typeof createBrandPreferenceSchema>;
export type HyvePatternPerformance = z.infer<typeof hyvePatternPerformanceSchema>;
export type CreateHyvePatternPerformanceInput = z.infer<typeof createHyvePatternPerformanceSchema>;
export type CampaignPerformance = z.infer<typeof campaignPerformanceSchema>;
export type CreateCampaignPerformanceInput = z.infer<typeof createCampaignPerformanceSchema>;
