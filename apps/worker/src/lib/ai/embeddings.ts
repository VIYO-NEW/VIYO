/**
 * Gemini Embeddings — T46
 *
 * Uses the existing Google AI key for semantic cache lookup. When the key is
 * absent or the provider fails, callers receive a typed unavailable result and
 * can fall back safely without silently switching to another embedding vendor.
 */
import type { ArtDirectorRouterConfig } from './router-config.js';

export interface EmbeddingResult {
  embedding: number[] | null;
  unavailableReason?: string;
}

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

export async function generateGeminiEmbedding(
  text: string,
  config: ArtDirectorRouterConfig,
): Promise<EmbeddingResult> {
  if (!config.googleAiApiKey) {
    return { embedding: null, unavailableReason: 'GOOGLE_AI_API_KEY is not configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.providerTimeoutMs);

  try {
    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.embeddingModel}:embedContent`,
    );
    url.searchParams.set('key', config.googleAiApiKey);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
        outputDimensionality: 1536,
      }),
    });

    if (!response.ok) {
      return {
        embedding: null,
        unavailableReason: `Gemini embedding request failed with ${response.status}`,
      };
    }

    const payload = (await response.json()) as GeminiEmbeddingResponse;
    const values = payload.embedding?.values;
    if (!values?.length) {
      return { embedding: null, unavailableReason: 'Gemini embedding response did not include values' };
    }

    return { embedding: values };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { embedding: null, unavailableReason: `Gemini embedding unavailable: ${message}` };
  } finally {
    clearTimeout(timeout);
  }
}
