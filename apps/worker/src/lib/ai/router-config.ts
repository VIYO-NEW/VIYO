/**
 * Art Director Router Configuration — T46
 *
 * Centralizes the PO-approved defaults for the routing suite. The shared env
 * schema validates these names at the contract layer; this worker helper keeps
 * request-time logic testable without forcing the whole worker env parser to run
 * inside unit tests.
 */
import { getSystemConfig } from '../token-engine.js';
import type { ArtDirectorModel } from '@viyo/shared';

export interface ArtDirectorRouterConfig {
  enabled: boolean;
  threshold: number;
  providerTimeoutMs: number;
  embeddingModel: string;
  tier1Provider: Extract<ArtDirectorModel, 'nanobanana'>;
  tier2Provider: Extract<ArtDirectorModel, 'ideogram'>;
  tier3Provider: Extract<ArtDirectorModel, 'dall-e-3'>;
  googleAiApiKey?: string;
  ideogramApiKey?: string;
  openAiApiKey?: string;
}

const DEFAULT_THRESHOLD = 0.75;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

function parseNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function envValue(source: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = source[key];
  return value && value.trim().length > 0 ? value : undefined;
}

async function readEnabledOverride(): Promise<boolean | null> {
  const value = await getSystemConfig<boolean | string>('enable_art_director_router');
  if (value === null || value === undefined) return null;
  return parseBoolean(value, false);
}

export async function getArtDirectorRouterConfig(
  source: NodeJS.ProcessEnv = process.env,
): Promise<ArtDirectorRouterConfig> {
  const runtimeEnabled = await readEnabledOverride();
  const envEnabled = parseBoolean(source.ENABLE_ART_DIRECTOR_ROUTER, false);

  return {
    enabled: runtimeEnabled ?? envEnabled,
    threshold: parseNumber(source.ART_DIRECTOR_CACHE_THRESHOLD, DEFAULT_THRESHOLD, 0, 1),
    providerTimeoutMs: parseNumber(
      source.ART_DIRECTOR_PROVIDER_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
      1000,
      120_000,
    ),
    embeddingModel: envValue(source, 'GEMINI_EMBEDDING_MODEL') ?? DEFAULT_EMBEDDING_MODEL,
    tier1Provider: 'nanobanana',
    tier2Provider: 'ideogram',
    tier3Provider: 'dall-e-3',
    googleAiApiKey: envValue(source, 'GOOGLE_AI_API_KEY'),
    ideogramApiKey: envValue(source, 'IDEOGRAM_API_KEY'),
    openAiApiKey: envValue(source, 'OPENAI_API_KEY'),
  };
}

export const ART_DIRECTOR_FORMULA_WEIGHTS = {
  quality: 0.4,
  costEfficiency: 0.3,
} as const;

export const ART_DIRECTOR_TOKEN_COSTS: Record<ArtDirectorModel, number> = {
  nanobanana: 1_000,
  ideogram: 1_500,
  'dall-e-3': 2_000,
};
