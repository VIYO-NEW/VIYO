/**
 * Art Director Editing Router — T46/T69
 *
 * Contract-only routing layer for the 10 Visual Engine V2 editing tools. The
 * shared package owns the tool-to-model contract; this worker module adapts that
 * source of truth into provider descriptors for synchronous routing, tests, and
 * future UI affordances.
 */
import {
  ART_DIRECTOR_EDITING_TOOL_CONTRACTS,
  type ArtDirectorEditingTool,
  type ArtDirectorEditingToolContract,
} from '@viyo/shared';
import type { ArtDirectorRouterConfig } from './router-config.js';
import { listProviderDescriptors, type ProviderDescriptor } from './provider-registry.js';

export type EditingToolPlan = ArtDirectorEditingToolContract;

export const ART_DIRECTOR_EDITING_TOOL_MODEL_MAP: Readonly<Record<ArtDirectorEditingTool, EditingToolPlan>> =
  ART_DIRECTOR_EDITING_TOOL_CONTRACTS;

export function getEditingToolPlan(tool: ArtDirectorEditingTool): EditingToolPlan {
  return ART_DIRECTOR_EDITING_TOOL_MODEL_MAP[tool];
}

export function selectEditingProviders(
  tool: ArtDirectorEditingTool,
  config: ArtDirectorRouterConfig,
): ProviderDescriptor[] {
  const plan = getEditingToolPlan(tool);
  const descriptors = listProviderDescriptors(config);

  return plan.primaryModels
    .map((model) => descriptors.find((provider) => provider.model === model))
    .filter((provider): provider is ProviderDescriptor => Boolean(provider));
}

export function selectPrimaryEditingProvider(
  tool: ArtDirectorEditingTool,
  config: ArtDirectorRouterConfig,
): ProviderDescriptor | null {
  const plan = getEditingToolPlan(tool);
  if (!plan.providerRequired) return null;

  const providers = selectEditingProviders(tool, config);
  return providers.find((provider) => provider.available) ?? providers[0] ?? null;
}
