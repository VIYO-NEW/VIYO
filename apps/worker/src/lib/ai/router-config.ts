/**
 * Art Director Router Configuration — T46/T69
 *
 * Centralizes the v6.1 defaults for the routing suite. The shared schema owns
 * provider/model validation; this worker helper keeps request-time logic
 * testable while exposing explicit tier option arrays and token costs for the
 * expanded Phase 6.2 Visual Engine model roster.
 */
import type { ArtDirectorGenerationModel, ArtDirectorModel } from '@viyo/shared';
import { getSystemConfig } from '../token-engine.js';

export const ART_DIRECTOR_TIER1_GENERATION_MODELS = [
  'gpt-image-2',
  'ideogram-v3',
  'ideogram-3.0-turbo',
  'imagen-4',
  'imagen-4.0-generate-001',
  'imagen-3.0-generate-001',
  'gemini-3.1-flash-image',
  'gemini-3-pro-image-preview',
] as const satisfies readonly ArtDirectorGenerationModel[];

export const ART_DIRECTOR_TIER2_GENERATION_MODELS = [
  'flux-2-pro',
  'flux-2-ultra',
  'flux-kontext-max',
  'nano-banana-pro',
  'nano-banana-pro-edit',
  'seedream-3',
  'seedream-3-edit',
  'seedream-4.5',
  'recraft-v3',
  'playground-v3',
  'hidream',
] as const satisfies readonly ArtDirectorGenerationModel[];

export const ART_DIRECTOR_TIER3_GENERATION_MODELS = [
  'stable-diffusion-3.5',
  'sdxl-lightning',
  'kolors',
] as const satisfies readonly ArtDirectorGenerationModel[];

export type ArtDirectorTier1Provider = (typeof ART_DIRECTOR_TIER1_GENERATION_MODELS)[number];
export type ArtDirectorTier2Provider = (typeof ART_DIRECTOR_TIER2_GENERATION_MODELS)[number];
export type ArtDirectorTier3Provider = (typeof ART_DIRECTOR_TIER3_GENERATION_MODELS)[number];

export interface ArtDirectorRouterConfig {
  enabled: boolean;
  threshold: number;
  providerTimeoutMs: number;
  embeddingModel: string;
  tier1Provider: ArtDirectorTier1Provider;
  tier2Provider: ArtDirectorTier2Provider;
  tier3Provider: ArtDirectorTier3Provider;
  rollbackProvider: Extract<ArtDirectorGenerationModel, 'nano-banana-pro'>;
  atlasCloudApiKey?: string;
  atlasCloudBaseUrl?: string;
  falAiApiKey?: string;
  falAiBaseUrl?: string;
  googleAiApiKey?: string;
  ideogramApiKey?: string;
  openAiApiKey?: string;
  claudeApiKey?: string;
  selfHostedBaseUrl?: string;
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2BucketName: string;
  r2PublicBaseUrl?: string;
}

const DEFAULT_THRESHOLD = 0.75;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';
const DEFAULT_ATLAS_CLOUD_BASE_URL = 'https://api.atlascloud.ai/v1';
const DEFAULT_FAL_AI_BASE_URL = 'https://fal.run';
const DEFAULT_R2_BUCKET_NAME = 'viyo-assets';

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

function parseProviderOption<const T extends readonly string[]>(
  source: NodeJS.ProcessEnv,
  key: string,
  options: T,
  fallback: T[number],
): T[number] {
  const value = envValue(source, key);
  return value && options.includes(value) ? value : fallback;
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
    tier1Provider: parseProviderOption(source, 'ART_DIRECTOR_TIER1_PROVIDER', ART_DIRECTOR_TIER1_GENERATION_MODELS, 'gpt-image-2'),
    tier2Provider: parseProviderOption(source, 'ART_DIRECTOR_TIER2_PROVIDER', ART_DIRECTOR_TIER2_GENERATION_MODELS, 'flux-2-pro'),
    tier3Provider: parseProviderOption(source, 'ART_DIRECTOR_TIER3_PROVIDER', ART_DIRECTOR_TIER3_GENERATION_MODELS, 'stable-diffusion-3.5'),
    rollbackProvider: 'nano-banana-pro',
    atlasCloudApiKey: envValue(source, 'ATLAS_CLOUD_API_KEY'),
    atlasCloudBaseUrl: envValue(source, 'ATLAS_CLOUD_BASE_URL') ?? DEFAULT_ATLAS_CLOUD_BASE_URL,
    falAiApiKey: envValue(source, 'FAL_AI_API_KEY'),
    falAiBaseUrl: envValue(source, 'FAL_AI_BASE_URL') ?? DEFAULT_FAL_AI_BASE_URL,
    googleAiApiKey: envValue(source, 'GOOGLE_AI_API_KEY'),
    ideogramApiKey: envValue(source, 'IDEOGRAM_API_KEY'),
    openAiApiKey: envValue(source, 'OPENAI_API_KEY'),
    claudeApiKey: envValue(source, 'ANTHROPIC_API_KEY') ?? envValue(source, 'CLAUDE_API_KEY'),
    selfHostedBaseUrl: envValue(source, 'ART_DIRECTOR_SELF_HOSTED_BASE_URL'),
    r2AccountId: envValue(source, 'R2_ACCOUNT_ID'),
    r2AccessKeyId: envValue(source, 'R2_ACCESS_KEY_ID'),
    r2SecretAccessKey: envValue(source, 'R2_SECRET_ACCESS_KEY'),
    r2BucketName: envValue(source, 'R2_BUCKET_NAME') ?? DEFAULT_R2_BUCKET_NAME,
    r2PublicBaseUrl: envValue(source, 'R2_PUBLIC_BASE_URL'),
  };
}

export const ART_DIRECTOR_FORMULA_WEIGHTS = {
  quality: 0.4,
  costEfficiency: 0.3,
} as const;

export const ART_DIRECTOR_TOKEN_COSTS: Record<ArtDirectorModel, number> = {
  'gpt-image-2': 2_400,
  'imagen-4': 2_000,
  'ideogram-v3': 1_800,
  'flux-2-pro': 1_000,
  'flux-2-ultra': 1_250,
  'nano-banana-pro': 900,
  'nano-banana-pro-edit': 950,
  'seedream-3': 900,
  'seedream-3-edit': 950,
  'recraft-v3': 850,
  'playground-v3': 800,
  hidream: 800,
  'stable-diffusion-3.5': 450,
  'sdxl-lightning': 250,
  kolors: 350,
  'flux-kontext-max': 1_100,
  'seedream-4.5': 550,
  'ideogram-3.0-turbo': 1_600,
  'gemini-3.1-flash-image': 1_900,
  'gemini-3-pro-image-preview': 2_500,
  'imagen-4.0-generate-001': 2_000,
  'imagen-3.0-generate-001': 1_700,
  'sam-2': 180,
  'real-esrgan': 160,
  controlnet: 220,
  'ip-adapter': 220,
  'sdxl-inpainting': 260,
  'sdxl-outpainting': 260,
  'blip-2': 120,
  dinov2: 120,
  rmbg: 120,
  gfpgan: 180,
};
