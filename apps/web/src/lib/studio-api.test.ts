import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isInsufficientTokensError, routeStudioGeneration, type StudioApiError } from './studio-api.js';

vi.mock('./supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: { access_token: 'test-token' } } })),
    },
  },
}));

describe('Studio API billing error metadata', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('extracts INSUFFICIENT_TOKENS details from the tRPC apiError data field', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            message: 'Forbidden',
            code: -32003,
            data: {
              code: 'FORBIDDEN',
              httpStatus: 402,
              apiError: {
                message: 'INSUFFICIENT_TOKENS: Not enough tokens to complete this operation.',
                details: {
                  code: 'INSUFFICIENT_TOKENS',
                  required: 2400,
                  balance: 1000,
                  estimatedCostTokens: 2400,
                  selectedModel: 'gpt-image-2',
                },
              },
            },
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as typeof fetch;

    await expect(
      routeStudioGeneration({
        prompt: 'Create a campaign image.',
        brandId: '11111111-1111-4111-8111-111111111111',
        mode: 'A2',
        aspectRatio: '1:1',
        typographyRequired: false,
        mentionReferences: [],
        sourceAssetIds: [],
        sourceImageUrls: [],
      }),
    ).rejects.toMatchObject({
      status: 402,
      code: 'INSUFFICIENT_TOKENS',
      apiErrorCode: 'INSUFFICIENT_TOKENS',
      requiredTokens: 2400,
      currentBalance: 1000,
      estimatedCostTokens: 2400,
      selectedModel: 'gpt-image-2',
    });

    try {
      await routeStudioGeneration({
        prompt: 'Create a campaign image.',
        brandId: '11111111-1111-4111-8111-111111111111',
        mode: 'A2',
        aspectRatio: '1:1',
        typographyRequired: false,
        mentionReferences: [],
        sourceAssetIds: [],
        sourceImageUrls: [],
      });
    } catch (error) {
      expect(isInsufficientTokensError(error)).toBe(true);
      expect((error as StudioApiError).currentBalance).toBe(1000);
    }
  });
});
