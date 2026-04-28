/**
 * Art Director Routing Schemas — T46 Composite Art Director Routing Suite
 *
 * Shared Zod contracts for the synchronous Art Director routing surface. The
 * worker consumes these schemas directly from the shared package so request
 * validation, response typing, provider inventory, editing-tool routing, and
 * future UI integration stay aligned with the v6.1 Architecture Lock.
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
  patternId: z.string().uuid().nullable().optional(),
  promptTemplate: z.string().nullable().optional(),
  targetModels: z.array(artDirectorModelSchema).default([]),
  providerGateway: artDirectorGatewaySchema,
  fallbackGateway: artDirectorGatewaySchema.nullable().optional(),
  fallbackReason: artDirectorFallbackReasonSchema,
  tokenAction: artDirectorTokenActionSchema,
  billingMode: z.enum(['free_cache', 'deduct_after_success', 'none']),
  resolvedMentions: z.array(brandVaultMentionSchema).default([]),
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
export type ArtDirectorTokenAction = z.infer<typeof artDirectorTokenActionSchema>;
export type ArtDirectorFallbackReason = z.infer<typeof artDirectorFallbackReasonSchema>;
export type BrandVaultMention = z.infer<typeof brandVaultMentionSchema>;
export type RouteGenerationInput = z.infer<typeof routeGenerationRequestSchema>;
export type RouteGenerationTraceMetadata = z.infer<typeof routeGenerationTraceMetadataSchema>;
export type RouteGenerationRoutingMetadata = z.infer<typeof routeGenerationRoutingMetadataSchema>;
export type RouteGenerationResponse = z.infer<typeof routeGenerationResponseSchema>;
