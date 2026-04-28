/**
 * Art Director Provider Registry — T46
 *
 * Provides deterministic v6.1 tier inventory, mode defaults, availability
 * decisions, and rollback behavior for the Art Director router. Provider
 * adapters stay hidden behind this registry so routing, failover, rollback, and
 * tests do not infer provider tiers from scattered environment checks.
 */
import type {
  ArtDirectorGateway,
  ArtDirectorGenerationMode,
  ArtDirectorModel,
  ArtDirectorProviderTier,
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

type RegistryEntry = Omit<ProviderDescriptor, 'timeoutMs' | 'costTokens' | 'available' | 'unavailableReason'> & {
  availability: (config: ArtDirectorRouterConfig) => boolean;
  unavailableReason: (config: ArtDirectorRouterConfig) => string | undefined;
};

function directAvailability(key: keyof ArtDirectorRouterConfig, message: string) {
  return {
    availability: (config: ArtDirectorRouterConfig) => Boolean(config[key]),
    unavailableReason: (config: ArtDirectorRouterConfig) => (config[key] ? undefined : message),
  };
}

const tier2Availability = {
  availability: (config: ArtDirectorRouterConfig) => Boolean(config.atlasCloudApiKey || config.falAiApiKey),
  unavailableReason: (config: ArtDirectorRouterConfig) =>
    config.atlasCloudApiKey || config.falAiApiKey
      ? undefined
      : 'ATLAS_CLOUD_API_KEY or FAL_AI_API_KEY is not configured',
};

const tier3Availability = {
  availability: (config: ArtDirectorRouterConfig) => Boolean(config.selfHostedBaseUrl),
  unavailableReason: (config: ArtDirectorRouterConfig) =>
    config.selfHostedBaseUrl ? undefined : 'ART_DIRECTOR_SELF_HOSTED_BASE_URL is not configured',
};

const PROVIDER_INVENTORY: RegistryEntry[] = [
  {
    model: 'gpt-image-2',
    tier: 'tier_1',
    displayName: 'GPT Image 2',
    gateway: 'openai',
    editingCapable: false,
    typographyOptimized: true,
    defaultForTier: true,
    ...directAvailability('openAiApiKey', 'OPENAI_API_KEY is not configured'),
  },
  {
    model: 'imagen-4',
    tier: 'tier_1',
    displayName: 'Imagen 4',
    gateway: 'google',
    editingCapable: false,
    typographyOptimized: false,
    defaultForTier: false,
    ...directAvailability('googleAiApiKey', 'GOOGLE_AI_API_KEY is not configured'),
  },
  {
    model: 'ideogram-v3',
    tier: 'tier_1',
    displayName: 'Ideogram v3',
    gateway: 'ideogram',
    editingCapable: false,
    typographyOptimized: true,
    defaultForTier: false,
    ...directAvailability('ideogramApiKey', 'IDEOGRAM_API_KEY is not configured'),
  },
  ...(
    [
      ['flux-2-pro', 'Flux 2 Pro', true],
      ['flux-2-ultra', 'Flux 2 Ultra', false],
      ['nano-banana-pro', 'Nano Banana Pro', false],
      ['nano-banana-pro-edit', 'Nano Banana Pro Edit', false],
      ['seedream-3', 'Seedream 3.0', false],
      ['seedream-3-edit', 'Seedream 3.0 Edit', false],
      ['recraft-v3', 'Recraft v3', false],
      ['playground-v3', 'Playground v3', false],
      ['hidream', 'HiDream', false],
    ] as const
  ).map(
    ([model, displayName, defaultForTier]): RegistryEntry => ({
      model,
      tier: 'tier_2',
      displayName,
      gateway: 'atlas-cloud',
      fallbackGateway: 'fal-ai',
      editingCapable: model.endsWith('-edit'),
      typographyOptimized: false,
      defaultForTier,
      ...tier2Availability,
    }),
  ),
  ...(
    [
      ['sam-2', 'SAM 2'],
      ['real-esrgan', 'Real-ESRGAN'],
      ['controlnet', 'ControlNet'],
      ['ip-adapter', 'IP-Adapter'],
      ['sdxl-inpainting', 'Inpainting (SDXL)'],
      ['sdxl-outpainting', 'Outpainting (SDXL)'],
      ['blip-2', 'BLIP-2'],
      ['dinov2', 'DINOv2'],
      ['rmbg', 'RMBG Background Removal'],
      ['gfpgan', 'GFPGAN Face Restoration'],
    ] as const
  ).map(
    ([model, displayName]): RegistryEntry => ({
      model,
      tier: 'tier_2',
      displayName,
      gateway: 'atlas-cloud',
      fallbackGateway: 'fal-ai',
      editingCapable: true,
      typographyOptimized: false,
      defaultForTier: false,
      ...tier2Availability,
    }),
  ),
  ...(
    [
      ['stable-diffusion-3.5', 'Stable Diffusion 3.5', true],
      ['sdxl-lightning', 'SDXL Lightning', false],
      ['kolors', 'Kolors', false],
    ] as const
  ).map(
    ([model, displayName, defaultForTier]): RegistryEntry => ({
      model,
      tier: 'tier_3',
      displayName,
      gateway: 'self-hosted',
      editingCapable: false,
      typographyOptimized: false,
      defaultForTier,
      ...tier3Availability,
    }),
  ),
];

export const ART_DIRECTOR_MODE_PRIMARY_MODELS: Record<ArtDirectorGenerationMode, ArtDirectorModel[]> = {
  A1: ['flux-2-pro', 'imagen-4'],
  A2: ['gpt-image-2', 'ideogram-v3'],
  A3: ['rmbg', 'flux-2-pro', 'ideogram-v3'],
  A4: ['sam-2', 'controlnet'],
  A5: ['nano-banana-pro', 'imagen-4'],
  A6: ['nano-banana-pro-edit'],
  A7: ['nano-banana-pro', 'gpt-image-2'],
  A8: ['flux-2-pro'],
  A9: ['blip-2'],
  A10: ['flux-2-pro', 'recraft-v3'],
  A11: ['recraft-v3', 'ideogram-v3'],
  A12: ['flux-2-pro'],
  A13: ['flux-2-pro'],
  A14: ['nano-banana-pro-edit'],
  A15: ['recraft-v3', 'flux-2-pro'],
  A16: ['sam-2', 'controlnet'],
  A17: ['gpt-image-2'],
  A18: ['flux-2-pro', 'gpt-image-2'],
  A19: ['flux-2-pro'],
  A20: ['ip-adapter', 'flux-2-pro'],
  A21: ['nano-banana-pro', 'imagen-4'],
  A22: ['flux-2-pro', 'seedream-3'],
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
  return listProviderDescriptors(config).filter((provider) => !provider.editingCapable || provider.model.endsWith('-edit'));
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

  const typographyModels = ['gpt-image-2', 'ideogram-v3'];
  const ordered = input.typographyRequired
    ? [
        ...allowed.filter((provider) => typographyModels.includes(provider.model)),
        ...allowed.filter((provider) => provider.tier === 'tier_2'),
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
