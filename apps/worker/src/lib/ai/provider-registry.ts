/**
 * Art Director Provider Registry — T46
 *
 * Provides deterministic tier defaults and availability decisions for the Art
 * Director router. Provider adapters are deliberately hidden behind this
 * registry so routing, failover, rollback, and tests do not infer provider tiers
 * from scattered environment checks.
 */
import type { ArtDirectorModel, ArtDirectorProviderTier } from '@viyo/shared';
import { ART_DIRECTOR_TOKEN_COSTS, type ArtDirectorRouterConfig } from './router-config.js';

export interface ProviderDescriptor {
  model: ArtDirectorModel;
  tier: ArtDirectorProviderTier;
  displayName: string;
  timeoutMs: number;
  costTokens: number;
  available: boolean;
  unavailableReason?: string;
}

export interface ProviderSelectionInput {
  typographyRequired: boolean;
  preferredModels?: string[];
  config: ArtDirectorRouterConfig;
}

function descriptor(
  model: ArtDirectorModel,
  tier: ArtDirectorProviderTier,
  displayName: string,
  timeoutMs: number,
  costTokens: number,
  available: boolean,
  unavailableReason?: string,
): ProviderDescriptor {
  return {
    model,
    tier,
    displayName,
    timeoutMs,
    costTokens,
    available,
    unavailableReason,
  };
}

export function listProviderDescriptors(config: ArtDirectorRouterConfig): ProviderDescriptor[] {
  return [
    descriptor(
      config.tier1Provider,
      'tier_1',
      'NanoBanana',
      config.providerTimeoutMs,
      ART_DIRECTOR_TOKEN_COSTS[config.tier1Provider],
      Boolean(config.googleAiApiKey),
      config.googleAiApiKey ? undefined : 'GOOGLE_AI_API_KEY is not configured',
    ),
    descriptor(
      config.tier2Provider,
      'tier_2',
      'Ideogram',
      config.providerTimeoutMs,
      ART_DIRECTOR_TOKEN_COSTS[config.tier2Provider],
      Boolean(config.ideogramApiKey),
      config.ideogramApiKey ? undefined : 'IDEOGRAM_API_KEY is not configured',
    ),
    descriptor(
      config.tier3Provider,
      'tier_3',
      'DALL-E 3 via OpenAI',
      config.providerTimeoutMs,
      ART_DIRECTOR_TOKEN_COSTS[config.tier3Provider],
      Boolean(config.openAiApiKey),
      config.openAiApiKey ? undefined : 'OPENAI_API_KEY is not configured',
    ),
  ];
}

export function selectProvider(input: ProviderSelectionInput): ProviderDescriptor {
  const descriptors = listProviderDescriptors(input.config);
  const allowedByPattern = input.preferredModels?.length
    ? descriptors.filter((provider) => input.preferredModels?.includes(provider.model))
    : descriptors;

  const ordered = input.typographyRequired
    ? [
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier2Provider),
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier1Provider),
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier3Provider),
      ]
    : [
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier1Provider),
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier2Provider),
        ...allowedByPattern.filter((provider) => provider.model === input.config.tier3Provider),
      ];

  return ordered.find((provider) => provider.available) ?? ordered[0] ?? descriptors[0];
}

export function rollbackProvider(config: ArtDirectorRouterConfig): ProviderDescriptor {
  const tier1 = listProviderDescriptors(config).find((provider) => provider.model === config.tier1Provider);
  if (!tier1) {
    throw new Error('T46 provider registry invariant failed: missing Tier 1 NanoBanana provider');
  }
  return tier1;
}
