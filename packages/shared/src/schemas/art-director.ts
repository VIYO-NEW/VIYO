/**
 * Art Director Routing Schemas — T46 Composite Art Director Routing Suite
 *
 * Shared Zod contracts for the synchronous Art Director routing surface. The
 * worker consumes these schemas directly from the shared package so request
 * validation, response typing, and future UI integration stay aligned.
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

export const artDirectorModelSchema = z.enum(['nanobanana', 'ideogram', 'dall-e-3']);

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

export const routeGenerationRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(4000),
  brandId: z.string().uuid('brandId must be a valid UUID'),
  aspectRatio: artDirectorAspectRatioSchema,
  styleId: z.string().uuid('styleId must be a valid UUID').optional(),
  productType: z.string().min(1).max(100).optional(),
  typographyRequired: z.boolean().default(false),
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
  patternId: z.string().uuid().nullable().optional(),
  promptTemplate: z.string().nullable().optional(),
  targetModels: z.array(z.string()).default([]),
  fallbackReason: artDirectorFallbackReasonSchema,
  tokenAction: artDirectorTokenActionSchema,
  billingMode: z.enum(['free_cache', 'deduct_after_success', 'none']),
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
  routingMetadata: routeGenerationRoutingMetadataSchema,
  traceMetadata: routeGenerationTraceMetadataSchema,
});

export type ArtDirectorAspectRatio = z.infer<typeof artDirectorAspectRatioSchema>;
export type ArtDirectorProviderTier = z.infer<typeof artDirectorProviderTierSchema>;
export type ArtDirectorModel = z.infer<typeof artDirectorModelSchema>;
export type ArtDirectorTokenAction = z.infer<typeof artDirectorTokenActionSchema>;
export type ArtDirectorFallbackReason = z.infer<typeof artDirectorFallbackReasonSchema>;
export type RouteGenerationInput = z.infer<typeof routeGenerationRequestSchema>;
export type RouteGenerationTraceMetadata = z.infer<typeof routeGenerationTraceMetadataSchema>;
export type RouteGenerationRoutingMetadata = z.infer<typeof routeGenerationRoutingMetadataSchema>;
export type RouteGenerationResponse = z.infer<typeof routeGenerationResponseSchema>;
