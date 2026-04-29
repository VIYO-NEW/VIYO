/**
 * Art Director Routing Schemas — T46/T69 Composite Art Director Routing Suite
 *
 * Shared Zod contracts for the synchronous Art Director routing surface. The
 * worker consumes these schemas directly from the shared package so request
 * validation, response typing, provider inventory, editing-tool routing, and
 * future UI integration stay aligned with the v6.1 Architecture Lock and the
 * Phase 6.2 source-grounded Visual Engine model roster.
 */
import { z } from 'zod';

export const artDirectorAspectRatioSchema = z.enum([
  '1:1',
  '4:5',
  '3:4',
  '16:9',
  '9:16',
  '2:3',
  '3:2',
]);

export const artDirectorProviderTierSchema = z.enum(['tier_1', 'tier_2', 'tier_3']);

export const artDirectorGatewaySchema = z.enum([
  'openai',
  'google',
  'ideogram',
  'atlas-cloud',
  'fal-ai',
  'self-hosted',
  'local',
  'sharp',
  'claude-3-5-sonnet',
]);

export const artDirectorGenerationModelSchema = z.enum([
  'gpt-image-2',
  'imagen-4',
  'ideogram-v3',
  'flux-2-pro',
  'flux-2-ultra',
  'nano-banana-pro',
  'nano-banana-pro-edit',
  'seedream-3',
  'seedream-3-edit',
  'recraft-v3',
  'playground-v3',
  'hidream',
  'stable-diffusion-3.5',
  'sdxl-lightning',
  'kolors',
  'flux-kontext-max',
  'seedream-4.5',
  'ideogram-3.0-turbo',
  'gemini-3.1-flash-image',
  'gemini-3-pro-image-preview',
  'imagen-4.0-generate-001',
  'imagen-3.0-generate-001',
]);

export const artDirectorEditingModelSchema = z.enum([
  'sam-2',
  'real-esrgan',
  'controlnet',
  'ip-adapter',
  'sdxl-inpainting',
  'sdxl-outpainting',
  'blip-2',
  'dinov2',
  'rmbg',
  'gfpgan',
]);

export const artDirectorModelSchema = z.union([
  artDirectorGenerationModelSchema,
  artDirectorEditingModelSchema,
]);

export const artDirectorGenerationModeSchema = z.enum([
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'A7',
  'A8',
  'A9',
  'A10',
  'A11',
  'A12',
  'A13',
  'A14',
  'A15',
  'A16',
  'A17',
  'A18',
  'A19',
  'A20',
  'A21',
  'A22',
]);

export const artDirectorPipelineModeSchema = z.enum([
  'A3',
  'A4',
  'A8',
  'A9',
  'A13',
  'A14',
  'A15',
  'A16',
]);

export const artDirectorEditingToolSchema = z.enum([
  'touch_edit',
  'text_edit',
  'layer_splitting',
  'background_swap',
  'object_removal',
  'canvas_expand',
  'upscale',
  'quick_edit',
  'style_transfer',
  'material_swap',
]);

export const artDirectorModelMetadataSchema = z.object({
  model: artDirectorModelSchema,
  tier: artDirectorProviderTierSchema,
  displayName: z.string().min(1),
  gateway: artDirectorGatewaySchema,
  fallbackGateway: artDirectorGatewaySchema.nullable().optional(),
  supportsGeneration: z.boolean(),
  editingCapable: z.boolean(),
  typographyOptimized: z.boolean(),
  defaultForTier: z.boolean(),
  source: z.string().min(1),
});

type ArtDirectorModelMetadataTuple = readonly [
  z.infer<typeof artDirectorModelSchema>,
  z.infer<typeof artDirectorProviderTierSchema>,
  string,
  z.infer<typeof artDirectorGatewaySchema>,
  z.infer<typeof artDirectorGatewaySchema> | null,
  boolean,
  boolean,
  boolean,
  boolean,
  string,
];

const artDirectorModelMetadataRows = [
  ['gpt-image-2', 'tier_1', 'GPT Image 2', 'openai', null, true, false, true, true, 'R17 Image Model Performance Comparison lists GPT Image 2 as an active image model.'],
  ['imagen-4', 'tier_1', 'Imagen 4', 'google', null, true, false, false, false, 'Master PRD Brain #4 lists imagen-4 for upscaling support.'],
  ['ideogram-v3', 'tier_1', 'Ideogram V3', 'ideogram', null, true, false, true, false, 'System Prompts and R24 list Ideogram V3 as the typography-oriented Visual Engine model.'],
  ['flux-2-pro', 'tier_2', 'Flux 2 Pro', 'atlas-cloud', 'fal-ai', true, false, false, true, 'R24 image-pipeline analysis identifies flux-2-pro test harness coverage.'],
  ['flux-2-ultra', 'tier_2', 'Flux 2 Ultra', 'atlas-cloud', 'fal-ai', true, false, false, false, 'Existing v6.1 provider roster retained for Flux higher-quality routing fallback.'],
  ['nano-banana-pro', 'tier_2', 'Nano Banana Pro', 'atlas-cloud', 'fal-ai', true, false, false, false, 'R24 identifies NanoBanana as the safe default for base photoshoot scene generation.'],
  ['nano-banana-pro-edit', 'tier_2', 'Nano Banana Pro Edit', 'atlas-cloud', 'fal-ai', true, true, false, false, 'Existing v6.1 edit-capable Nano Banana model retained for direct edit workflows.'],
  ['seedream-3', 'tier_2', 'Seedream 3.0', 'atlas-cloud', 'fal-ai', true, false, false, false, 'Existing v6.1 Seedream roster retained while adding source-grounded Seedream 4.5.'],
  ['seedream-3-edit', 'tier_2', 'Seedream 3.0 Edit', 'atlas-cloud', 'fal-ai', true, true, false, false, 'Existing v6.1 edit-capable Seedream model retained for provider continuity.'],
  ['recraft-v3', 'tier_2', 'Recraft v3', 'atlas-cloud', 'fal-ai', true, false, false, false, 'Existing v6.1 provider roster retained for brand-vector and style generation modes.'],
  ['playground-v3', 'tier_2', 'Playground v3', 'atlas-cloud', 'fal-ai', true, false, false, false, 'Existing v6.1 provider roster retained for Tier 2 diversity.'],
  ['hidream', 'tier_2', 'HiDream', 'atlas-cloud', 'fal-ai', true, false, false, false, 'Existing v6.1 provider roster retained for Tier 2 diversity.'],
  ['stable-diffusion-3.5', 'tier_3', 'Stable Diffusion 3.5', 'self-hosted', null, true, false, false, true, 'Existing v6.1 Tier 3 self-hosted default retained for fallback execution.'],
  ['sdxl-lightning', 'tier_3', 'SDXL Lightning', 'self-hosted', null, true, false, false, false, 'Existing v6.1 Tier 3 self-hosted roster retained for low-cost fallback.'],
  ['kolors', 'tier_3', 'Kolors', 'self-hosted', null, true, false, false, false, 'Existing v6.1 Tier 3 self-hosted roster retained for fallback diversity.'],
  ['flux-kontext-max', 'tier_2', 'Flux Kontext Max', 'atlas-cloud', 'fal-ai', true, false, false, false, 'R24 lists flux-kontext-max test harness coverage and states Flux must remain in the roster.'],
  ['seedream-4.5', 'tier_2', 'Seedream 4.5', 'atlas-cloud', 'fal-ai', true, false, true, false, 'R24 identifies Seedream 4.5 as strong at text rendering and candid/scrapbook styles.'],
  ['ideogram-3.0-turbo', 'tier_1', 'Ideogram 3.0 Turbo', 'ideogram', null, true, false, true, false, 'Master PRD Brain #4 uses the exact ideogram-3.0-turbo model string for text/UI imagery.'],
  ['gemini-3.1-flash-image', 'tier_1', 'Gemini 3.1 Flash Image', 'google', null, true, false, true, false, 'Master PRD Brain #4 lists gemini-3.1-flash-image for product and lifestyle generation.'],
  ['gemini-3-pro-image-preview', 'tier_1', 'Gemini 3 Pro Image Preview', 'google', null, true, false, false, false, 'Master PRD Brain #4 lists gemini-3-pro-image-preview for Agency-tier high-resolution imagery.'],
  ['imagen-4.0-generate-001', 'tier_1', 'Imagen 4.0 Generate 001', 'google', null, true, false, false, false, 'Master PRD hard rule requires dated model strings including imagen-4.0-generate-001.'],
  ['imagen-3.0-generate-001', 'tier_1', 'Imagen 3.0 Generate 001', 'google', null, true, false, false, false, 'System Prompts image-generation snippet uses imagen-3.0-generate-001.'],
  ['sam-2', 'tier_2', 'SAM 2', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for segmentation-backed touch and layer workflows.'],
  ['real-esrgan', 'tier_2', 'Real-ESRGAN', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for upscale workflows.'],
  ['controlnet', 'tier_2', 'ControlNet', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for structural conditioning workflows.'],
  ['ip-adapter', 'tier_2', 'IP-Adapter', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for image-prompt style conditioning workflows.'],
  ['sdxl-inpainting', 'tier_2', 'Inpainting (SDXL)', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for object removal and touch-edit fill workflows.'],
  ['sdxl-outpainting', 'tier_2', 'Outpainting (SDXL)', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for canvas expansion workflows.'],
  ['blip-2', 'tier_2', 'BLIP-2', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing/analysis model used for visual description workflows.'],
  ['dinov2', 'tier_2', 'DINOv2', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing/analysis model used for visual embedding workflows.'],
  ['rmbg', 'tier_2', 'RMBG Background Removal', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for subject cutout and background-swap workflows.'],
  ['gfpgan', 'tier_2', 'GFPGAN Face Restoration', 'atlas-cloud', 'fal-ai', false, true, false, false, 'Existing v6.1 editing model used for face restoration workflows.'],
] as const satisfies readonly ArtDirectorModelMetadataTuple[];

function metadataFromRows(
  rows: readonly ArtDirectorModelMetadataTuple[],
): Record<z.infer<typeof artDirectorModelSchema>, z.infer<typeof artDirectorModelMetadataSchema>> {
  return Object.fromEntries(
    rows.map(([model, tier, displayName, gateway, fallbackGateway, supportsGeneration, editingCapable, typographyOptimized, defaultForTier, source]) => [
      model,
      { model, tier, displayName, gateway, fallbackGateway, supportsGeneration, editingCapable, typographyOptimized, defaultForTier, source },
    ]),
  ) as Record<z.infer<typeof artDirectorModelSchema>, z.infer<typeof artDirectorModelMetadataSchema>>;
}

export const ART_DIRECTOR_MODEL_METADATA = Object.freeze(metadataFromRows(artDirectorModelMetadataRows));

export const ART_DIRECTOR_GENERATION_MODEL_METADATA = Object.freeze(
  Object.fromEntries(
    artDirectorGenerationModelSchema.options.map((model) => [model, ART_DIRECTOR_MODEL_METADATA[model]]),
  ),
) as Record<z.infer<typeof artDirectorGenerationModelSchema>, z.infer<typeof artDirectorModelMetadataSchema>>;

export const artDirectorEditingToolContractSchema = z.object({
  tool: artDirectorEditingToolSchema,
  description: z.string().min(1),
  primaryModels: z.array(artDirectorModelSchema),
  pipelineSteps: z.array(z.string().min(1)),
  localOnly: z.boolean(),
  providerRequired: z.boolean(),
});

type ArtDirectorEditingToolContractTuple = readonly [
  z.infer<typeof artDirectorEditingToolSchema>,
  string,
  readonly z.infer<typeof artDirectorModelSchema>[],
  readonly string[],
  boolean,
  boolean,
];

const artDirectorEditingToolContractRows = [
  ['touch_edit', 'Click any region, describe the change in text, and modify only that area.', ['sam-2', 'sdxl-inpainting'], ['sam-2-mask', 'sdxl-inpainting-edit'], false, true],
  ['text_edit', 'Change text in an image while preserving 3D effects and style.', ['gpt-image-2', 'ideogram-3.0-turbo', 'ideogram-v3'], ['typography-aware-direct-edit'], false, true],
  ['layer_splitting', 'Separate foreground and background into independent layers.', ['sam-2'], ['sam-2-segmentation'], false, true],
  ['background_swap', 'Replace the background while preserving the subject.', ['rmbg', 'flux-2-pro', 'flux-kontext-max'], ['rmbg-subject-cutout', 'tier-2-background-generation', 'sharp-composite'], false, true],
  ['object_removal', 'Remove unwanted objects and fill the gap.', ['sdxl-inpainting'], ['sdxl-inpainting-object-removal'], false, true],
  ['canvas_expand', 'Extend the image in any direction.', ['sdxl-outpainting'], ['sdxl-outpainting-canvas-expand'], false, true],
  ['upscale', 'Enhance resolution by 2x or 4x.', ['real-esrgan', 'imagen-4.0-generate-001'], ['provider-selected-upscale'], false, true],
  ['quick_edit', 'One-click brightness, contrast, saturation, and crop adjustments.', [], ['local-sharp-canvas-adjustment'], true, false],
  ['style_transfer', 'Apply the visual style of one image to another.', ['ip-adapter', 'gemini-3.1-flash-image'], ['ip-adapter-style-conditioning'], false, true],
  ['material_swap', 'Change material or texture of objects while preserving geometry.', ['controlnet', 'flux-2-pro', 'flux-kontext-max'], ['controlnet-structure-lock', 'tier-2-generation-material-swap'], false, true],
] as const satisfies readonly ArtDirectorEditingToolContractTuple[];

function editingContractsFromRows(
  rows: readonly ArtDirectorEditingToolContractTuple[],
): Record<z.infer<typeof artDirectorEditingToolSchema>, z.infer<typeof artDirectorEditingToolContractSchema>> {
  return Object.fromEntries(
    rows.map(([tool, description, primaryModels, pipelineSteps, localOnly, providerRequired]) => [
      tool,
      { tool, description, primaryModels: [...primaryModels], pipelineSteps: [...pipelineSteps], localOnly, providerRequired },
    ]),
  ) as Record<z.infer<typeof artDirectorEditingToolSchema>, z.infer<typeof artDirectorEditingToolContractSchema>>;
}

export const ART_DIRECTOR_EDITING_TOOL_CONTRACTS = Object.freeze(
  editingContractsFromRows(artDirectorEditingToolContractRows),
);

export const artDirectorTokenActionSchema = z.enum([
  'none',
  'prechecked',
  'deducted_after_success',
]);

export const artDirectorFallbackReasonSchema = z.enum([
  'cache_hit',
  'cache_miss',
  'score_below_threshold',
  'router_disabled',
  'provider_unavailable',
  'provider_timeout',
  'provider_error',
  'billing_unavailable',
  'insufficient_tokens',
]);

export const artDirectorRouteSourceSchema = z.enum([
  'pattern_db_cache',
  'zero_shot_generation',
  'router_disabled_rollback',
]);

export const artDirectorCacheStatusSchema = z.enum([
  'hit',
  'miss',
  'below_threshold',
  'disabled',
]);

export const brandVaultMentionSchema = z.object({
  raw: z.string().min(2).max(120),
  slug: z.string().min(1).max(120),
  assetId: z.string().uuid().optional(),
  assetUrl: z.string().url().optional(),
});

export const artDirectorPaletteColorSchema = z.object({
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  name: z.string().min(1).max(120),
});

export const routeGenerationRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(4000),
  brandId: z.string().uuid('brandId must be a valid UUID'),
  mode: artDirectorGenerationModeSchema.default('A1'),
  editingTool: artDirectorEditingToolSchema.optional(),
  aspectRatio: artDirectorAspectRatioSchema,
  styleId: z.string().uuid('styleId must be a valid UUID').optional(),
  productType: z.string().min(1).max(100).optional(),
  typographyRequired: z.boolean().default(false),
  mentionReferences: z.array(brandVaultMentionSchema).default([]),
  sourceAssetIds: z.array(z.string().uuid()).default([]),
  sourceImageUrls: z.array(z.string().url()).default([]),
  targetRegionDescription: z.string().min(1).max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const routeGenerationTraceMetadataSchema = z.object({
  traceId: z.string().min(1),
  requestId: z.string().min(1),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  routerEnabled: z.boolean(),
  threshold: z.number().min(0).max(1),
  durationMs: z.number().int().min(0),
});

export const routeGenerationRoutingMetadataSchema = z.object({
  mode: artDirectorGenerationModeSchema,
  editingTool: artDirectorEditingToolSchema.nullable().optional(),
  routeSource: artDirectorRouteSourceSchema,
  cacheStatus: artDirectorCacheStatusSchema,
  patternId: z.string().uuid().nullable().optional(),
  promptTemplate: z.string().nullable().optional(),
  targetModels: z.array(artDirectorModelSchema).default([]),
  providerGateway: artDirectorGatewaySchema,
  fallbackGateway: artDirectorGatewaySchema.nullable().optional(),
  fallbackReason: artDirectorFallbackReasonSchema,
  tokenAction: artDirectorTokenActionSchema,
  billingMode: z.enum(['free_cache', 'deduct_after_success', 'none']),
  resolvedMentions: z.array(brandVaultMentionSchema).default([]),
  evaluatedPatternCount: z.number().int().min(0).default(0),
  bestPatternScore: z.number().min(0).max(1).nullable().optional(),
  bestPatternSimilarity: z.number().min(0).max(1).nullable().optional(),
  bestPatternQualityScore: z.number().min(0).max(1).nullable().optional(),
  bestPatternCostEfficiencyScore: z.number().min(0).max(1).nullable().optional(),
  bestPatternFidelityMultiplier: z.number().min(0).nullable().optional(),
  bestPatternTypographyMultiplier: z.number().min(0).nullable().optional(),
  patternCategory: z.string().nullable().optional(),
  patternProductType: z.string().nullable().optional(),
  patternLayoutType: z.string().nullable().optional(),
  patternTypographyStyle: z.string().nullable().optional(),
  pipelineRequiresPoReview: z.boolean().default(false),
  pipelineSteps: z.array(z.string()).default([]),
  zeroShotPromptModel: z.literal('claude-3-5-sonnet').nullable().optional(),
});

export const routeGenerationResponseSchema = z.object({
  selectedModel: artDirectorModelSchema,
  providerTier: artDirectorProviderTierSchema,
  isCached: z.boolean(),
  score: z.number().min(0),
  costTokens: z.number().int().min(0),
  tokenAction: artDirectorTokenActionSchema,
  fallbackReason: artDirectorFallbackReasonSchema.optional(),
  traceId: z.string().min(1),
  assetUrl: z.string().url().nullable(),
  savedToVault: z.boolean(),
  assetId: z.string().uuid().nullable().optional(),
  palette: z.array(artDirectorPaletteColorSchema).optional(),
  routingMetadata: routeGenerationRoutingMetadataSchema,
  traceMetadata: routeGenerationTraceMetadataSchema,
});

export type ArtDirectorAspectRatio = z.infer<typeof artDirectorAspectRatioSchema>;
export type ArtDirectorProviderTier = z.infer<typeof artDirectorProviderTierSchema>;
export type ArtDirectorGateway = z.infer<typeof artDirectorGatewaySchema>;
export type ArtDirectorGenerationModel = z.infer<typeof artDirectorGenerationModelSchema>;
export type ArtDirectorEditingModel = z.infer<typeof artDirectorEditingModelSchema>;
export type ArtDirectorModel = z.infer<typeof artDirectorModelSchema>;
export type ArtDirectorGenerationMode = z.infer<typeof artDirectorGenerationModeSchema>;
export type ArtDirectorPipelineMode = z.infer<typeof artDirectorPipelineModeSchema>;
export type ArtDirectorEditingTool = z.infer<typeof artDirectorEditingToolSchema>;
export type ArtDirectorModelMetadata = z.infer<typeof artDirectorModelMetadataSchema>;
export type ArtDirectorEditingToolContract = z.infer<typeof artDirectorEditingToolContractSchema>;
export type ArtDirectorTokenAction = z.infer<typeof artDirectorTokenActionSchema>;
export type ArtDirectorFallbackReason = z.infer<typeof artDirectorFallbackReasonSchema>;
export type ArtDirectorRouteSource = z.infer<typeof artDirectorRouteSourceSchema>;
export type ArtDirectorCacheStatus = z.infer<typeof artDirectorCacheStatusSchema>;
export type BrandVaultMention = z.infer<typeof brandVaultMentionSchema>;
export type RouteGenerationInput = z.infer<typeof routeGenerationRequestSchema>;
export type RouteGenerationTraceMetadata = z.infer<typeof routeGenerationTraceMetadataSchema>;
export type RouteGenerationRoutingMetadata = z.infer<typeof routeGenerationRoutingMetadataSchema>;
export type RouteGenerationResponse = z.infer<typeof routeGenerationResponseSchema>;
