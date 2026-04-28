import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildZeroShotFallbackPrompt } from './fallback-prompts.js';
import { calculateArtDirectorScore } from './image-router.js';
import type { ImagePatternCandidate } from './image-patterns.js';
import { rollbackProvider, selectProvider } from './provider-registry.js';
import type { ArtDirectorRouterConfig } from './router-config.js';

const enabledConfig: ArtDirectorRouterConfig = {
  enabled: true,
  threshold: 0.75,
  providerTimeoutMs: 30_000,
  embeddingModel: 'text-embedding-004',
  tier1Provider: 'nanobanana',
  tier2Provider: 'ideogram',
  tier3Provider: 'dall-e-3',
  googleAiApiKey: 'google-key',
  ideogramApiKey: 'ideogram-key',
  openAiApiKey: 'openai-key',
};

function candidate(overrides: Partial<ImagePatternCandidate> = {}): ImagePatternCandidate {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    category: 'lifestyle',
    productType: 'apparel',
    layoutType: 'landscape',
    targetModels: ['nanobanana'],
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

describe('T46 Art Director provider registry', () => {
  it('selects NanoBanana as the default Tier 1 provider when typography is not required', () => {
    const provider = selectProvider({ typographyRequired: false, config: enabledConfig });

    expect(provider.model).toBe('nanobanana');
    expect(provider.tier).toBe('tier_1');
    expect(provider.available).toBe(true);
    expect(provider.costTokens).toBe(1000);
  });

  it('selects Ideogram first for typography-forward requests when it is available', () => {
    const provider = selectProvider({ typographyRequired: true, config: enabledConfig });

    expect(provider.model).toBe('ideogram');
    expect(provider.tier).toBe('tier_2');
    expect(provider.available).toBe(true);
  });

  it('preserves NanoBanana as the rollback provider even when the router is disabled', () => {
    const provider = rollbackProvider({ ...enabledConfig, enabled: false });

    expect(provider.model).toBe('nanobanana');
    expect(provider.tier).toBe('tier_1');
  });

  it('falls through to DALL-E 3 when preferred cached models exclude the first two tiers', () => {
    const provider = selectProvider({
      typographyRequired: false,
      preferredModels: ['dall-e-3'],
      config: enabledConfig,
    });

    expect(provider.model).toBe('dall-e-3');
    expect(provider.tier).toBe('tier_3');
  });
});

describe('T46 zero-shot fallback prompts', () => {
  it('builds a typography-forward vertical prompt without writing unapproved learning-loop records', () => {
    const result = buildZeroShotFallbackPrompt({
      prompt: 'Launch image for a premium coffee subscription.',
      aspectRatio: '9:16',
      productType: 'beverage',
      typographyRequired: true,
      workspaceId: '22222222-2222-4222-8222-222222222222',
    });

    expect(result.category).toBe('beverage');
    expect(result.layoutType).toBe('vertical_story');
    expect(result.typographyStyle).toBe('typography-forward');
    expect(result.prompt).toContain('Create a vertical_story beverage image in aspect ratio 9:16.');
    expect(result.prompt).toContain('Typography must be legible, brand-safe, and central to the composition.');
  });

  it('defaults missing product type to general and avoids unnecessary text when typography is not required', () => {
    const result = buildZeroShotFallbackPrompt({
      prompt: 'Clean hero image for a skincare product.',
      aspectRatio: '1:1',
      typographyRequired: false,
      workspaceId: '22222222-2222-4222-8222-222222222222',
    });

    expect(result.category).toBe('general');
    expect(result.layoutType).toBe('square');
    expect(result.typographyStyle).toBe('minimal-text');
    expect(result.prompt).toContain('Avoid unnecessary text unless the visual brief explicitly requires it.');
  });
});

describe('T46 corrected Art Director scoring', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies the PO-approved parenthesized 4D formula before freshness and tier multiplication', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T00:00:00.000Z'));
    const provider = selectProvider({ typographyRequired: false, config: enabledConfig });

    const result = calculateArtDirectorScore(candidate(), provider);

    expect(result.baseQualityScore).toBeCloseTo(0.83, 4);
    expect(result.costEfficiencyScore).toBeCloseTo(0.8, 4);
    expect(result.freshnessPenalty).toBeCloseTo(1, 4);
    expect(result.tierMultiplier).toBeCloseTo(1.3, 4);
    expect(result.score).toBe(0.7436);
  });

  it('clamps scores to 1.0 for very high quality Tier 1 cached candidates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-28T00:00:00.000Z'));
    const provider = selectProvider({ typographyRequired: false, config: enabledConfig });

    const result = calculateArtDirectorScore(
      candidate({ fidelityScore: 1, qaScore: 1, similarity: 1, costPerGen: 0, usageCount: 0 }),
      provider,
    );

    expect(result.score).toBe(0.91);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
