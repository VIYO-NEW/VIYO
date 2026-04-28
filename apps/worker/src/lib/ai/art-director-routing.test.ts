import { describe, expect, it } from 'vitest';
import type { RouteGenerationInput } from '@viyo/shared';
import { routeGenerationRequestSchema, routeGenerationResponseSchema } from '@viyo/shared';
import { buildZeroShotFallbackPrompt } from './fallback-prompts.js';
import { calculateArtDirectorScore } from './image-router.js';
import type { ImagePatternCandidate } from './image-patterns.js';
import {
  ART_DIRECTOR_MODE_PRIMARY_MODELS,
  ART_DIRECTOR_PO_REVIEW_PIPELINE_MODES,
  listProviderDescriptors,
  resolveModeProviderCandidates,
  rollbackProvider,
  selectProvider,
} from './provider-registry.js';
import {
  ART_DIRECTOR_EDITING_TOOL_MODEL_MAP,
  getEditingToolPlan,
  selectPrimaryEditingProvider,
} from './editing-router.js';
import type { ArtDirectorRouterConfig } from './router-config.js';

const enabledConfig: ArtDirectorRouterConfig = {
  enabled: true,
  threshold: 0.75,
  providerTimeoutMs: 30_000,
  embeddingModel: 'text-embedding-004',
  tier1Provider: 'gpt-image-2',
  tier2Provider: 'flux-2-pro',
  tier3Provider: 'stable-diffusion-3.5',
  rollbackProvider: 'nano-banana-pro',
  googleAiApiKey: 'google-key',
  ideogramApiKey: 'ideogram-key',
  openAiApiKey: 'openai-key',
  atlasCloudApiKey: 'atlas-key',
  falAiApiKey: 'fal-key',
  claudeApiKey: 'claude-key',
  selfHostedBaseUrl: 'http://localhost:8787',
  r2BucketName: 'viyo-assets',
  r2PublicBaseUrl: 'https://assets.viyo.test',
};

function routeInput(overrides: Partial<RouteGenerationInput> = {}): RouteGenerationInput {
  return {
    prompt: 'Launch image for a premium coffee subscription using @hero-packshot.',
    brandId: '22222222-2222-4222-8222-222222222222',
    mode: 'A1',
    aspectRatio: '9:16',
    typographyRequired: true,
    mentionReferences: [],
    sourceAssetIds: [],
    sourceImageUrls: [],
    ...overrides,
  };
}

function candidate(overrides: Partial<ImagePatternCandidate> = {}): ImagePatternCandidate {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    category: 'lifestyle',
    productType: 'apparel',
    layoutType: 'landscape',
    targetModels: ['flux-2-pro'],
    promptTemplate: 'Create a polished apparel campaign image.',
    embedding: [0.1, 0.2, 0.3],
    fidelityScore: 0.8,
    qaScore: 0.7,
    costPerGen: 0.25,
    supportsTypography: true,
    usageCount: 0,
    lastUsedAt: new Date('2026-04-28T00:00:00.000Z'),
    createdAt: new Date('2026-04-28T00:00:00.000Z'),
    similarity: 0.9,
    ...overrides,
  };
}

describe('T46 v6.1 Art Director provider registry', () => {
  it('exposes the full three-tier inventory with Tier 2 Flux as the default non-typography selection', () => {
    const providers = listProviderDescriptors(enabledConfig);
    const models = providers.map((provider) => provider.model);
    const provider = selectProvider({ typographyRequired: false, config: enabledConfig });

    expect(models).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(providers).toHaveLength(25);
    expect(provider.model).toBe('flux-2-pro');
    expect(provider.tier).toBe('tier_2');
    expect(provider.gateway).toBe('atlas-cloud');
    expect(provider.available).toBe(true);
  });

  it('selects GPT Image 2 first for typography-forward requests when direct OpenAI is available', () => {
    const provider = selectProvider({ typographyRequired: true, config: enabledConfig });

    expect(provider.model).toBe('gpt-image-2');
    expect(provider.tier).toBe('tier_1');
    expect(provider.available).toBe(true);
  });

  it('preserves Nano Banana Pro as the rollback provider even when the router is disabled', () => {
    const provider = rollbackProvider({ ...enabledConfig, enabled: false });

    expect(provider.model).toBe('nano-banana-pro');
    expect(provider.tier).toBe('tier_2');
  });

  it('falls through to the self-hosted Tier 3 provider when preferred cached models exclude Tier 1 and Tier 2', () => {
    const provider = selectProvider({
      typographyRequired: false,
      preferredModels: ['stable-diffusion-3.5'],
      config: enabledConfig,
    });

    expect(provider.model).toBe('stable-diffusion-3.5');
    expect(provider.tier).toBe('tier_3');
  });

  it('maps all A1–A22 generation modes and marks the original pipeline modes for PO review', () => {
    expect(Object.keys(ART_DIRECTOR_MODE_PRIMARY_MODELS)).toHaveLength(22);
    expect(resolveModeProviderCandidates('A1', enabledConfig).map((provider) => provider.model)).toEqual([
      'flux-2-pro',
      'imagen-4',
    ]);
    expect(resolveModeProviderCandidates('A3', enabledConfig).map((provider) => provider.model)).toEqual([
      'rmbg',
      'flux-2-pro',
      'ideogram-v3',
    ]);
    expect([...ART_DIRECTOR_PO_REVIEW_PIPELINE_MODES]).toEqual(['A3', 'A4', 'A8', 'A9', 'A13', 'A14', 'A15', 'A16']);
  });
});

describe('T46 v6.1 editing tool router', () => {
  it('maps all ten Visual Engine V2 editing tools to deterministic tool plans', () => {
    expect(Object.keys(ART_DIRECTOR_EDITING_TOOL_MODEL_MAP)).toEqual([
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
    expect(getEditingToolPlan('background_swap').pipelineSteps).toEqual([
      'rmbg-subject-cutout',
      'tier-2-background-generation',
      'sharp-composite',
    ]);
    expect(getEditingToolPlan('quick_edit').localOnly).toBe(true);
  });

  it('selects the primary editing backend for a non-local editing tool', () => {
    const provider = selectPrimaryEditingProvider('touch_edit', enabledConfig);

    expect(provider?.model).toBe('sam-2');
    expect(provider?.editingCapable).toBe(true);
  });
});

describe('T46 v6.1 shared Art Director contract', () => {
  it('accepts mode, editing tool, Brand Vault mentions, source assets, and R2 response fields', () => {
    const request = routeGenerationRequestSchema.parse(
      routeInput({
        mode: 'A14',
        editingTool: 'text_edit',
        mentionReferences: [
          {
            raw: '@hero-packshot',
            slug: 'hero-packshot',
            assetId: '33333333-3333-4333-8333-333333333333',
            assetUrl: 'https://assets.viyo.test/hero-packshot.png',
          },
        ],
        sourceAssetIds: ['33333333-3333-4333-8333-333333333333'],
        sourceImageUrls: ['https://assets.viyo.test/source.png'],
      }),
    );

    const response = routeGenerationResponseSchema.parse({
      selectedModel: 'gpt-image-2',
      providerTier: 'tier_1',
      isCached: false,
      score: 0.6,
      costTokens: 2400,
      tokenAction: 'prechecked',
      fallbackReason: 'cache_miss',
      traceId: 'trace-123',
      assetUrl: 'https://assets.viyo.test/generated.json',
      savedToVault: true,
      assetId: '44444444-4444-4444-8444-444444444444',
      routingMetadata: {
        mode: request.mode,
        editingTool: request.editingTool,
        targetModels: ['gpt-image-2'],
        providerGateway: 'openai',
        fallbackReason: 'cache_miss',
        tokenAction: 'prechecked',
        billingMode: 'deduct_after_success',
        resolvedMentions: request.mentionReferences,
        pipelineRequiresPoReview: true,
        pipelineSteps: ['typography-aware-direct-edit'],
        zeroShotPromptModel: 'claude-3-5-sonnet',
      },
      traceMetadata: {
        traceId: 'trace-123',
        requestId: 'request-123',
        workspaceId: '55555555-5555-4555-8555-555555555555',
        userId: '66666666-6666-4666-8666-666666666666',
        routerEnabled: true,
        threshold: 0.75,
        durationMs: 25,
      },
    });

    expect(request.mode).toBe('A14');
    expect(response.assetUrl).toBe('https://assets.viyo.test/generated.json');
    expect(response.routingMetadata.resolvedMentions[0]?.slug).toBe('hero-packshot');
  });
});

describe('T46 v6.1 zero-shot fallback prompts', () => {
  it('builds a deterministic Claude 3.5 Sonnet fallback prompt when no Claude key is configured', async () => {
    const result = await buildZeroShotFallbackPrompt(routeInput(), {});

    expect(result.model).toBe('claude-3-5-sonnet');
    expect(result.usedClaude).toBe(false);
    expect(result.category).toBe('general');
    expect(result.layoutType).toBe('vertical_story');
    expect(result.typographyStyle).toBe('typography-forward');
    expect(result.unavailableReason).toContain('ANTHROPIC_API_KEY');
    expect(result.prompt).toContain('Create a vertical_story general image in aspect ratio 9:16.');
    expect(result.prompt).toContain('Mode A1: Launch image for a premium coffee subscription');
    expect(result.prompt).toContain('Typography must be legible, brand-safe, and central to the composition.');
  });

  it('uses Claude text when the configured Claude-compatible endpoint returns provider-ready content', async () => {
    const fetchImpl = async () =>
      new Response(JSON.stringify({ content: [{ text: 'Claude-composed commercial image prompt.' }] }), {
        status: 200,
      });

    const result = await buildZeroShotFallbackPrompt(routeInput({ typographyRequired: false }), {
      apiKey: 'claude-key',
      fetchImpl,
    });

    expect(result.usedClaude).toBe(true);
    expect(result.prompt).toBe('Claude-composed commercial image prompt.');
    expect(result.unavailableReason).toBeUndefined();
  });
});

describe('T46 v6.1 corrected Art Director scoring', () => {
  it('applies the PO-approved parenthesized 4D formula without stale freshness or tier multipliers', () => {
    const provider = selectProvider({ typographyRequired: false, config: enabledConfig });

    const result = calculateArtDirectorScore(candidate(), provider);

    expect(result.baseQualityScore).toBeCloseTo(0.83, 4);
    expect(result.costEfficiencyScore).toBeCloseTo(0.8, 4);
    expect(result.fidelityMultiplier).toBeCloseTo(0.8, 4);
    expect(result.typographyMultiplier).toBeCloseTo(1, 4);
    expect(result.score).toBe(0.4576);
  });

  it('applies a typography boost only when the selected provider is typography optimized', () => {
    const provider = selectProvider({ typographyRequired: true, config: enabledConfig });

    const result = calculateArtDirectorScore(
      candidate({ targetModels: ['gpt-image-2'], fidelityScore: 1, qaScore: 1, similarity: 1, costPerGen: 0 }),
      provider,
      { typographyRequired: true },
    );

    expect(provider.typographyOptimized).toBe(true);
    expect(result.typographyMultiplier).toBe(1.1);
    expect(result.score).toBe(0.77);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
