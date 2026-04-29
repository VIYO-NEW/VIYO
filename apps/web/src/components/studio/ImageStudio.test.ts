import { describe, expect, it } from 'vitest';
import type { RouteGenerationResponse } from '@viyo/shared/schemas/art-director';
import { studioEditingToolDefinitions, studioModeDefinitions } from '../../lib/studio-contract.js';
import { parseBrandVaultMentions, parseDelimitedList, resultToCanvasAsset } from './ImageStudio.js';

const responseFixture: RouteGenerationResponse = {
  selectedModel: 'gpt-image-2',
  providerTier: 'tier_2',
  isCached: false,
  score: 0.93,
  costTokens: 18,
  tokenAction: 'deducted_after_success',
  fallbackReason: 'cache_miss',
  traceId: 'trace-phase6-001',
  assetUrl: 'https://assets.viyo.test/brand/image.png',
  savedToVault: true,
  persistenceStatus: 'saved',
  r2ObjectKey:
    'workspaces/55555555-5555-4555-8555-555555555555/brands/22222222-2222-4222-8222-222222222222/studio/2026-04-29/trace-test/generated-hero.json',
  assetId: '11111111-1111-4111-8111-111111111111',
  palette: [
    { hex: '#112233', name: 'Midnight Ink' },
    { hex: '#AABBCC', name: 'Campaign Mist' },
  ],
  routingMetadata: {
    mode: 'A14',
    editingTool: 'text_edit',
    routeSource: 'zero_shot_generation',
    cacheStatus: 'below_threshold',
    patternId: '55555555-5555-4555-8555-555555555555',
    promptTemplate: 'Cached beverage hero template.',
    targetModels: ['gpt-image-2', 'nano-banana-pro-edit'],
    providerGateway: 'openai',
    fallbackGateway: 'claude-3-5-sonnet',
    fallbackReason: 'cache_miss',
    tokenAction: 'deducted_after_success',
    billingMode: 'deduct_after_success',
    estimatedCostTokens: 18,
    balanceBeforeTokens: 100,
    balanceAfterTokens: 82,
    tokensDeducted: 18,
    resolvedMentions: [
      {
        raw: '@hero-bottle',
        slug: 'hero-bottle',
        assetId: '22222222-2222-4222-8222-222222222222',
        assetUrl: 'https://assets.viyo.test/brand/hero-bottle.png',
      },
    ],
    evaluatedPatternCount: 3,
    bestPatternScore: 0.93,
    bestPatternSimilarity: 0.91,
    bestPatternQualityScore: 0.94,
    bestPatternCostEfficiencyScore: 0.88,
    bestPatternFidelityMultiplier: 1,
    bestPatternTypographyMultiplier: 1,
    patternCategory: 'hero',
    patternProductType: 'beverage',
    patternLayoutType: 'square',
    patternTypographyStyle: 'headline-safe',
    pipelineRequiresPoReview: false,
    pipelineSteps: ['route', 'generate', 'save'],
    zeroShotPromptModel: 'claude-3-5-sonnet',
  },
  traceMetadata: {
    traceId: 'trace-phase6-001',
    requestId: 'request-phase6-001',
    workspaceId: '33333333-3333-4333-8333-333333333333',
    userId: '44444444-4444-4444-8444-444444444444',
    routerEnabled: true,
    threshold: 0.72,
    durationMs: 120,
  },
};

describe('Image Studio Phase 6 contract binding', () => {
  it('renders its selectable generation and editing inventories from the repaired schemas', () => {
    expect(studioModeDefinitions).toHaveLength(22);
    expect(studioModeDefinitions.map((mode) => mode.id)).toEqual([
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

    expect(studioEditingToolDefinitions).toHaveLength(10);
    expect(studioEditingToolDefinitions.map((tool) => tool.id)).toEqual([
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
  });

  it('extracts unique Brand Vault mentions with punctuation-safe slugs', () => {
    expect(
      parseBrandVaultMentions('Use @hero-bottle, @Hero-Bottle and @logo.v2 in a hero scene.'),
    ).toEqual([
      { raw: '@hero-bottle', slug: 'hero-bottle' },
      { raw: '@logo.v2', slug: 'logo.v2' },
    ]);
  });

  it('normalizes comma and newline separated source inputs', () => {
    expect(parseDelimitedList('one, two\nthree\n\n four ')).toEqual([
      'one',
      'two',
      'three',
      'four',
    ]);
  });

  it('maps R2 response fields, routing metadata, and Brand Vault mentions into canvas asset state', () => {
    const asset = resultToCanvasAsset(responseFixture, 'Create a headline-safe text image.');

    expect(asset).toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      traceId: 'trace-phase6-001',
      assetId: '11111111-1111-4111-8111-111111111111',
      assetUrl: 'https://assets.viyo.test/brand/image.png',
      savedToVault: true,
      persistenceStatus: 'saved',
      mode: 'A14',
      editingTool: 'text_edit',
      selectedModel: 'gpt-image-2',
      providerTier: 'tier_2',
      isCached: false,
      routeSource: 'zero_shot_generation',
      cacheStatus: 'below_threshold',
      costTokens: 18,
      tokenAction: 'deducted_after_success',
      estimatedCostTokens: 18,
      balanceBeforeTokens: 100,
      balanceAfterTokens: 82,
      tokensDeducted: 18,
      fallbackReason: 'cache_miss',
      evaluatedPatternCount: 3,
      bestPatternScore: 0.93,
      bestPatternSimilarity: 0.91,
      bestPatternQualityScore: 0.94,
      bestPatternCostEfficiencyScore: 0.88,
      patternId: '55555555-5555-4555-8555-555555555555',
      patternCategory: 'hero',
      patternProductType: 'beverage',
      patternLayoutType: 'square',
      patternTypographyStyle: 'headline-safe',
    });
    expect(asset.palette).toHaveLength(2);
    expect(asset.resolvedMentions).toEqual(responseFixture.routingMetadata.resolvedMentions);
  });
});
