/**
 * Art Director Provider Registry — T46/T69
 *
 * Provides deterministic v6.1 tier inventory, mode defaults, availability
 * decisions, and rollback behavior for the Art Director router. Provider
 * adapters stay hidden behind this registry so routing, failover, rollback, and
 * tests consume the shared Task 69 provider metadata instead of re-declaring
 * model tiers or gateway ownership in worker-only code.
 */
import {
  ART_DIRECTOR_MODEL_METADATA,
  type ArtDirectorGateway,
  type ArtDirectorGenerationMode,
  type ArtDirectorModel,
  type ArtDirectorModelMetadata,
  type ArtDirectorProviderTier,
} from '@viyo/shared';
import { ART_DIRECTOR_TOKEN_COSTS, type ArtDirectorRouterConfig } from './router-config.js';

export interface ProviderDescriptor {
  model: ArtDirectorModel;
  tier: ArtDirectorProviderTier;
  displayName: string;
  gateway: ArtDirectorGateway;
  fallbackGateway?: ArtDirectorGateway;
  timeoutMs: number;
  costTokens: number;
  available: boolean;
  unavailableReason?: string;
  editingCapable: boolean;
  typographyOptimized: boolean;
  defaultForTier: boolean;
}

export interface ProviderSelectionInput {
  typographyRequired: boolean;
  preferredModels?: string[];
  mode?: ArtDirectorGenerationMode;
  config: ArtDirectorRouterConfig;
}

type AvailabilityRule = {
  availability: (config: ArtDirectorRouterConfig) => boolean;
  unavailableReason: (config: ArtDirectorRouterConfig) => string | undefined;
};

type RegistryEntry = Omit<ProviderDescriptor, 'timeoutMs' | 'costTokens' | 'available' | 'unavailableReason'> & AvailabilityRule;

function directAvailability(key: keyof ArtDirectorRouterConfig, message: string): AvailabilityRule {
  return {
    availability: (config: ArtDirectorRouterConfig) => Boolean(config[key]),
    unavailableReason: (config: ArtDirectorRouterConfig) => (config[key] ? undefined : message),
  };
}

const tier2Availability: AvailabilityRule = {
  availability: (config: ArtDirectorRouterConfig) => Boolean(config.atlasCloudApiKey || config.falAiApiKey),
  unavailableReason: (config: ArtDirectorRouterConfig) =>
    config.atlasCloudApiKey || config.falAiApiKey
      ? undefined
      : 'ATLAS_CLOUD_API_KEY or FAL_AI_API_KEY is not configured',
};

const tier3Availability: AvailabilityRule = {
  availability: (config: ArtDirectorRouterConfig) => Boolean(config.selfHostedBaseUrl),
  unavailableReason: (config: ArtDirectorRouterConfig) =>
    config.selfHostedBaseUrl ? undefined : 'ART_DIRECTOR_SELF_HOSTED_BASE_URL is not configured',
};

function availabilityForMetadata(metadata: ArtDirectorModelMetadata): AvailabilityRule {
  if (metadata.gateway === 'openai') {
    return directAvailability('openAiApiKey', 'OPENAI_API_KEY is not configured');
  }

  if (metadata.gateway === 'google') {
    return directAvailability('googleAiApiKey', 'GOOGLE_AI_API_KEY is not configured');
  }

  if (metadata.gateway === 'ideogram') {
    return directAvailability('ideogramApiKey', 'IDEOGRAM_API_KEY is not configured');
  }

  if (metadata.gateway === 'self-hosted') {
    return tier3Availability;
  }

  if (metadata.tier === 'tier_2') {
    return tier2Availability;
  }

  return {
    availability: () => true,
    unavailableReason: () => undefined,
  };
}

function registryEntry(model: ArtDirectorModel): RegistryEntry {
  const metadata: ArtDirectorModelMetadata = ART_DIRECTOR_MODEL_METADATA[model];

  return {
    model,
    tier: metadata.tier,
    displayName: metadata.displayName,
    gateway: metadata.gateway,
    fallbackGateway: metadata.fallbackGateway ?? undefined,
    editingCapable: metadata.editingCapable,
    typographyOptimized: metadata.typographyOptimized,
    defaultForTier: metadata.defaultForTier,
    ...availabilityForMetadata(metadata),
  };
}

const PROVIDER_INVENTORY: RegistryEntry[] = (Object.keys(ART_DIRECTOR_MODEL_METADATA) as ArtDirectorModel[]).map(
  (model) => registryEntry(model),
);

export const ART_DIRECTOR_MODE_PRIMARY_MODELS: Record<ArtDirectorGenerationMode, ArtDirectorModel[]> = {
  A1: ['flux-2-pro', 'nano-banana-pro', 'imagen-4.0-generate-001', 'imagen-4'],
  A2: ['gpt-image-2', 'ideogram-3.0-turbo', 'ideogram-v3'],
  A3: ['rmbg', 'flux-2-pro', 'ideogram-3.0-turbo', 'ideogram-v3'],
  A4: ['sam-2', 'controlnet'],
  A5: ['nano-banana-pro', 'gemini-3.1-flash-image', 'imagen-4.0-generate-001', 'imagen-4'],
  A6: ['nano-banana-pro-edit', 'seedream-3-edit'],
  A7: ['nano-banana-pro', 'gpt-image-2'],
  A8: ['flux-2-pro', 'flux-kontext-max'],
  A9: ['blip-2'],
  A10: ['flux-2-pro', 'recraft-v3'],
  A11: ['recraft-v3', 'ideogram-3.0-turbo', 'ideogram-v3'],
  A12: ['flux-2-pro', 'flux-kontext-max'],
  A13: ['flux-2-pro', 'seedream-4.5'],
  A14: ['nano-banana-pro-edit', 'gpt-image-2', 'ideogram-3.0-turbo'],
  A15: ['recraft-v3', 'flux-2-pro', 'flux-kontext-max'],
  A16: ['sam-2', 'controlnet'],
  A17: ['gpt-image-2', 'ideogram-3.0-turbo'],
  A18: ['flux-2-pro', 'gpt-image-2', 'gemini-3.1-flash-image'],
  A19: ['flux-2-pro', 'gemini-3-pro-image-preview'],
  A20: ['ip-adapter', 'flux-2-pro', 'gemini-3.1-flash-image'],
  A21: ['nano-banana-pro', 'imagen-4.0-generate-001', 'imagen-4'],
  A22: ['flux-2-pro', 'seedream-4.5', 'seedream-3'],
};

export const ART_DIRECTOR_PO_REVIEW_PIPELINE_MODES = new Set<ArtDirectorGenerationMode>([
  'A3',
  'A4',
  'A8',
  'A9',
  'A13',
  'A14',
  'A15',
  'A16',
]);

function descriptor(entry: RegistryEntry, config: ArtDirectorRouterConfig): ProviderDescriptor {
  const gateway = entry.gateway === 'atlas-cloud' && !config.atlasCloudApiKey && config.falAiApiKey ? 'fal-ai' : entry.gateway;

  return {
    ...entry,
    gateway,
    timeoutMs: config.providerTimeoutMs,
    costTokens: ART_DIRECTOR_TOKEN_COSTS[entry.model],
    available: entry.availability(config),
    unavailableReason: entry.unavailableReason(config),
  };
}

export function listProviderDescriptors(config: ArtDirectorRouterConfig): ProviderDescriptor[] {
  return PROVIDER_INVENTORY.map((entry) => descriptor(entry, config));
}

export function listGenerationProviderDescriptors(config: ArtDirectorRouterConfig): ProviderDescriptor[] {
  return listProviderDescriptors(config).filter((provider) => ART_DIRECTOR_MODEL_METADATA[provider.model].supportsGeneration);
}

export function listEditingProviderDescriptors(config: ArtDirectorRouterConfig): ProviderDescriptor[] {
  return listProviderDescriptors(config).filter((provider) => provider.editingCapable);
}

export function resolveModeProviderCandidates(
  mode: ArtDirectorGenerationMode,
  config: ArtDirectorRouterConfig,
): ProviderDescriptor[] {
  const preferred = ART_DIRECTOR_MODE_PRIMARY_MODELS[mode];
  const descriptors = listProviderDescriptors(config);
  return preferred
    .map((model) => descriptors.find((provider) => provider.model === model))
    .filter((provider): provider is ProviderDescriptor => Boolean(provider));
}

export function selectProvider(input: ProviderSelectionInput): ProviderDescriptor {
  const descriptors = listProviderDescriptors(input.config);
  const modePreferred = input.mode ? ART_DIRECTOR_MODE_PRIMARY_MODELS[input.mode] : [];
  const explicitPreferred = input.preferredModels?.filter((model): model is ArtDirectorModel =>
    descriptors.some((provider) => provider.model === model),
  );
  const preferredModels = explicitPreferred?.length ? explicitPreferred : modePreferred;
  const allowed = preferredModels.length
    ? descriptors.filter((provider) => preferredModels.includes(provider.model))
    : descriptors;

  const typographyModels = allowed.filter((provider) => provider.typographyOptimized).map((provider) => provider.model);
  const ordered = input.typographyRequired
    ? [
        ...allowed.filter((provider) => typographyModels.includes(provider.model)),
        ...allowed.filter((provider) => provider.tier === 'tier_2' && !typographyModels.includes(provider.model)),
        ...allowed.filter((provider) => provider.tier === 'tier_1' && !typographyModels.includes(provider.model)),
        ...allowed.filter((provider) => provider.tier === 'tier_3'),
      ]
    : [
        ...allowed.filter((provider) => provider.tier === 'tier_2'),
        ...allowed.filter((provider) => provider.tier === 'tier_1'),
        ...allowed.filter((provider) => provider.tier === 'tier_3'),
      ];

  return ordered.find((provider) => provider.available) ?? ordered[0] ?? descriptors[0];
}

export function rollbackProvider(config: ArtDirectorRouterConfig): ProviderDescriptor {
  const provider = listProviderDescriptors(config).find((entry) => entry.model === config.rollbackProvider);
  if (!provider) {
    throw new Error('T46 provider registry invariant failed: missing Tier 2 Nano Banana Pro rollback provider');
  }
  return provider;
}
