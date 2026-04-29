import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Shared from '@viyo/shared';
import type { ImagePatternCandidate } from './image-patterns.js';

type AuthContext = Shared.AuthContext;
type RouteGenerationInput = Shared.RouteGenerationInput;

const checkBillingStatusMock = vi.fn();
const getSystemConfigMock = vi.fn(async () => null);
const generateGeminiEmbeddingMock = vi.fn();
const findPatternCandidatesMock = vi.fn();
const markPatternUsedMock = vi.fn();
const getDbMock = vi.fn(() => null);

vi.mock('../token-engine.js', () => ({
  checkBillingStatus: checkBillingStatusMock,
  getSystemConfig: getSystemConfigMock,
}));

vi.mock('./embeddings.js', () => ({
  generateGeminiEmbedding: generateGeminiEmbeddingMock,
}));

vi.mock('./image-patterns.js', () => ({
  findPatternCandidates: findPatternCandidatesMock,
  markPatternUsed: markPatternUsedMock,
}));

vi.mock('../db.js', () => ({
  getDb: getDbMock,
}));

const { routeGeneration } = await import('./image-router.js');

const auth: AuthContext = {
  userId: '66666666-6666-4666-8666-666666666666',
  workspaceId: '55555555-5555-4555-8555-555555555555',
  role: 'owner',
  authMethod: 'jwt',
  scopes: [],
};

function routeInput(overrides: Partial<RouteGenerationInput> = {}): RouteGenerationInput {
  return {
    prompt: 'Create a launch hero using @hero-packshot.',
    brandId: '22222222-2222-4222-8222-222222222222',
    mode: 'A1',
    aspectRatio: '1:1',
    typographyRequired: false,
    mentionReferences: [],
    sourceAssetIds: [],
    sourceImageUrls: [],
    ...overrides,
  };
}

function candidate(overrides: Partial<ImagePatternCandidate> = {}): ImagePatternCandidate {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    category: 'hero',
    productType: 'beverage',
    layoutType: 'square',
    targetModels: ['flux-2-pro'],
    promptTemplate: 'Cached premium beverage campaign image.',
    embedding: [0.1, 0.2, 0.3],
    fidelityScore: 1,
    qaScore: 1,
    costPerGen: 0,
    supportsTypography: true,
    usageCount: 0,
    lastUsedAt: new Date('2026-04-28T00:00:00.000Z'),
    createdAt: new Date('2026-04-28T00:00:00.000Z'),
    similarity: 1,
    ...overrides,
  };
}

function setRouterEnv() {
  process.env.ENABLE_ART_DIRECTOR_ROUTER = 'true';
  process.env.ART_DIRECTOR_CACHE_THRESHOLD = '0.75';
  process.env.ART_DIRECTOR_PROVIDER_TIMEOUT_MS = '30000';
  process.env.GOOGLE_AI_API_KEY = 'google-key';
  process.env.OPENAI_API_KEY = 'openai-key';
  process.env.IDEOGRAM_API_KEY = 'ideogram-key';
  process.env.ATLAS_CLOUD_API_KEY = 'atlas-key';
  process.env.FAL_AI_API_KEY = 'fal-key';
  process.env.ANTHROPIC_API_KEY = 'claude-key';
  process.env.ART_DIRECTOR_SELF_HOSTED_BASE_URL = 'http://localhost:8787';
  process.env.R2_BUCKET_NAME = 'viyo-assets';
  process.env.R2_PUBLIC_BASE_URL = 'https://assets.viyo.test';
}

describe('T46 v6.1 routeGeneration execution', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setRouterEnv();
    getSystemConfigMock.mockResolvedValue(null);
    generateGeminiEmbeddingMock.mockResolvedValue({ embedding: [0.1, 0.2, 0.3] });
    findPatternCandidatesMock.mockResolvedValue([]);
    markPatternUsedMock.mockResolvedValue(undefined);
    checkBillingStatusMock.mockResolvedValue(undefined);
    getDbMock.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    delete process.env.ENABLE_ART_DIRECTOR_ROUTER;
    delete process.env.ART_DIRECTOR_CACHE_THRESHOLD;
    delete process.env.ART_DIRECTOR_PROVIDER_TIMEOUT_MS;
    delete process.env.GOOGLE_AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.IDEOGRAM_API_KEY;
    delete process.env.ATLAS_CLOUD_API_KEY;
    delete process.env.FAL_AI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ART_DIRECTOR_SELF_HOSTED_BASE_URL;
    delete process.env.R2_BUCKET_NAME;
    delete process.env.R2_PUBLIC_BASE_URL;
  });

  it('returns a cache hit without billing or R2 writes when the scored pattern clears the threshold', async () => {
    process.env.ART_DIRECTOR_CACHE_THRESHOLD = '0.65';
    findPatternCandidatesMock.mockResolvedValue([candidate()]);
    const r2Bucket = { put: vi.fn() };

    const response = await routeGeneration(routeInput(), {
      auth,
      requestId: 'request-cache-hit',
      r2Bucket,
      assetUrlBase: 'https://assets.viyo.test',
    });

    expect(response.isCached).toBe(true);
    expect(response.fallbackReason).toBe('cache_hit');
    expect(response.costTokens).toBe(0);
    expect(response.tokenAction).toBe('none');
    expect(response.routingMetadata.billingMode).toBe('free_cache');
    expect(response.routingMetadata.routeSource).toBe('pattern_db_cache');
    expect(response.routingMetadata.cacheStatus).toBe('hit');
    expect(response.routingMetadata.evaluatedPatternCount).toBe(1);
    expect(response.routingMetadata.bestPatternScore).toBe(0.7);
    expect(response.routingMetadata.bestPatternSimilarity).toBe(1);
    expect(response.routingMetadata.bestPatternQualityScore).toBe(1);
    expect(response.routingMetadata.bestPatternCostEfficiencyScore).toBe(1);
    expect(response.routingMetadata.patternCategory).toBe('hero');
    expect(response.routingMetadata.patternProductType).toBe('beverage');
    expect(response.routingMetadata.patternLayoutType).toBe('square');
    expect(response.routingMetadata.patternId).toBe('11111111-1111-4111-8111-111111111111');
    expect(response.routingMetadata.resolvedMentions).toEqual([{ raw: '@hero-packshot', slug: 'hero-packshot' }]);
    expect(checkBillingStatusMock).not.toHaveBeenCalled();
    expect(markPatternUsedMock).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
    expect(r2Bucket.put).not.toHaveBeenCalled();
  });

  it('runs the billing precheck and writes an R2 manifest for non-cached generation', async () => {
    const r2Bucket = { put: vi.fn(async () => undefined) };

    const response = await routeGeneration(
      routeInput({
        mode: 'A14',
        editingTool: 'text_edit',
        typographyRequired: true,
        mentionReferences: [
          {
            raw: '@hero-packshot',
            slug: 'hero-packshot',
            assetId: '33333333-3333-4333-8333-333333333333',
            assetUrl: 'https://assets.viyo.test/hero-packshot.png',
          },
        ],
      }),
      {
        auth,
        requestId: 'request-r2-generation',
        r2Bucket,
        assetUrlBase: 'https://assets.viyo.test',
      },
    );

    expect(checkBillingStatusMock).toHaveBeenCalledWith(auth.workspaceId);
    expect(response.isCached).toBe(false);
    expect(response.selectedModel).toBe('gpt-image-2');
    expect(response.providerTier).toBe('tier_1');
    expect(response.costTokens).toBe(2400);
    expect(response.tokenAction).toBe('prechecked');
    expect(response.fallbackReason).toBe('cache_miss');
    expect(response.assetUrl).toMatch(/^https:\/\/assets\.viyo\.test\/art-director\/55555555-5555-4555-8555-555555555555\//);
    expect(response.savedToVault).toBe(false);
    expect(response.routingMetadata.editingTool).toBe('text_edit');
    expect(response.routingMetadata.routeSource).toBe('zero_shot_generation');
    expect(response.routingMetadata.cacheStatus).toBe('miss');
    expect(response.routingMetadata.evaluatedPatternCount).toBe(0);
    expect(response.routingMetadata.bestPatternScore).toBeNull();
    expect(response.routingMetadata.pipelineRequiresPoReview).toBe(true);
    expect(response.routingMetadata.pipelineSteps).toEqual(['typography-aware-direct-edit']);
    expect(response.routingMetadata.zeroShotPromptModel).toBe('claude-3-5-sonnet');
    expect(response.routingMetadata.resolvedMentions[0]).toMatchObject({
      slug: 'hero-packshot',
      assetUrl: 'https://assets.viyo.test/hero-packshot.png',
    });
    expect(r2Bucket.put).toHaveBeenCalledTimes(1);
    const [storagePath, manifest, options] = r2Bucket.put.mock.calls[0];
    expect(storagePath).toMatch(/^art-director\/55555555-5555-4555-8555-555555555555\//);
    expect(JSON.parse(manifest as string)).toMatchObject({
      workspaceId: auth.workspaceId,
      brandId: '22222222-2222-4222-8222-222222222222',
      mode: 'A14',
      editingTool: 'text_edit',
      selectedModel: 'gpt-image-2',
      providerGateway: 'openai',
    });
    expect(options).toMatchObject({
      httpMetadata: { contentType: 'application/json' },
      customMetadata: {
        workspaceId: auth.workspaceId,
        brandId: '22222222-2222-4222-8222-222222222222',
        model: 'gpt-image-2',
      },
    });
  });

  it('preserves the best Pattern DB score metadata when falling back because the threshold is not met', async () => {
    process.env.ART_DIRECTOR_CACHE_THRESHOLD = '0.98';
    findPatternCandidatesMock.mockResolvedValue([
      candidate({
        similarity: 0.8,
        fidelityScore: 0.86,
        qaScore: 0.8,
        costPerGen: 0.25,
        typographyStyle: 'headline-safe',
      }),
    ]);
    const r2Bucket = { put: vi.fn(async () => undefined) };

    const response = await routeGeneration(routeInput(), {
      auth,
      requestId: 'request-threshold-fallback',
      r2Bucket,
      assetUrlBase: 'https://assets.viyo.test',
    });

    expect(response.isCached).toBe(false);
    expect(response.fallbackReason).toBe('score_below_threshold');
    expect(response.routingMetadata.routeSource).toBe('zero_shot_generation');
    expect(response.routingMetadata.cacheStatus).toBe('below_threshold');
    expect(response.routingMetadata.evaluatedPatternCount).toBe(1);
    expect(response.routingMetadata.bestPatternScore).toBeGreaterThan(0);
    expect(response.routingMetadata.bestPatternScore).toBeLessThan(0.98);
    expect(response.routingMetadata.bestPatternSimilarity).toBe(0.8);
    expect(response.routingMetadata.patternTypographyStyle).toBe('headline-safe');
    expect(response.routingMetadata.patternId).toBe('11111111-1111-4111-8111-111111111111');
    expect(checkBillingStatusMock).toHaveBeenCalledWith(auth.workspaceId);
    expect(r2Bucket.put).toHaveBeenCalledTimes(1);
  });
});
