/**
 * Art Director Image Router — T46
 *
 * Orchestrates synchronous routing for artDirector.routeGeneration using the
 * PO-approved corrected formula, Gemini-first cache lookup, deterministic
 * provider tiers, and safe token-economics boundaries. Cached pattern routing is
 * free. Frontier routing returns billable metadata but does not deduct before a
 * provider success; actual successful generation must call the token engine at
 * the success boundary.
 */
import type {
  ArtDirectorFallbackReason,
  ArtDirectorModel,
  ArtDirectorProviderTier,
  RouteGenerationInput,
  RouteGenerationResponse,
} from '@viyo/shared';
import type { AuthContext } from '@viyo/shared';
import { checkBillingStatus } from '../token-engine.js';
import { generateGeminiEmbedding } from './embeddings.js';
import { buildZeroShotFallbackPrompt } from './fallback-prompts.js';
import type { ImagePatternCandidate } from './image-patterns.js';
import { findPatternCandidates, markPatternUsed } from './image-patterns.js';
import { rollbackProvider, selectProvider, type ProviderDescriptor } from './provider-registry.js';
import { ART_DIRECTOR_FORMULA_WEIGHTS, getArtDirectorRouterConfig } from './router-config.js';
import { createTraceId, recordRouterDecision } from './router-observability.js';

export interface RouteGenerationServiceContext {
  auth: AuthContext;
  requestId: string;
}

export interface CandidateScore {
  candidate: ImagePatternCandidate;
  score: number;
  baseQualityScore: number;
  costEfficiencyScore: number;
  freshnessPenalty: number;
  tierMultiplier: number;
  selectedProvider: ProviderDescriptor;
}

function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Number(value.toFixed(4));
}

function tierMultiplier(tier: ArtDirectorProviderTier): number {
  if (tier === 'tier_1') return 1.3;
  if (tier === 'tier_2') return 1.2;
  return 1;
}

function freshnessPenalty(candidate: ImagePatternCandidate): number {
  const now = Date.now();
  const lastUseSource = candidate.lastUsedAt ?? candidate.createdAt;
  const ageDays = Math.max(0, (now - lastUseSource.getTime()) / 86_400_000);
  const agePenalty = Math.max(0.72, 1 - ageDays * 0.01);
  const usagePenalty = Math.max(0.85, 1 - candidate.usageCount * 0.005);
  return clamp(agePenalty * usagePenalty, 0.6, 1);
}

function qualityScore(candidate: ImagePatternCandidate): number {
  const storedQuality = clamp(Math.max(candidate.fidelityScore, candidate.qaScore));
  const semanticQuality = clamp(candidate.similarity);
  return clamp(storedQuality * 0.7 + semanticQuality * 0.3);
}

function costEfficiencyScore(candidate: ImagePatternCandidate): number {
  if (candidate.costPerGen <= 0) return 1;
  return clamp(1 / (1 + candidate.costPerGen));
}

export function calculateArtDirectorScore(
  candidate: ImagePatternCandidate,
  selectedProvider: ProviderDescriptor,
): CandidateScore {
  const baseQualityScore = qualityScore(candidate);
  const costScore = costEfficiencyScore(candidate);
  const freshness = freshnessPenalty(candidate);
  const tier = tierMultiplier(selectedProvider.tier);

  const score =
    (baseQualityScore * ART_DIRECTOR_FORMULA_WEIGHTS.quality +
      costScore * ART_DIRECTOR_FORMULA_WEIGHTS.costEfficiency) *
    freshness *
    tier;

  return {
    candidate,
    score: roundScore(clamp(score, 0, 1)),
    baseQualityScore,
    costEfficiencyScore: costScore,
    freshnessPenalty: freshness,
    tierMultiplier: tier,
    selectedProvider,
  };
}

function buildResponse(params: {
  input: RouteGenerationInput;
  context: RouteGenerationServiceContext;
  traceId: string;
  startedAt: number;
  provider: ProviderDescriptor;
  isCached: boolean;
  score: number;
  pattern?: ImagePatternCandidate | null;
  fallbackReason: ArtDirectorFallbackReason;
  routerEnabled: boolean;
  threshold: number;
  billingMode: RouteGenerationResponse['routingMetadata']['billingMode'];
  tokenAction: RouteGenerationResponse['tokenAction'];
}): RouteGenerationResponse {
  const durationMs = Math.max(0, Date.now() - params.startedAt);
  const costTokens = params.isCached ? 0 : params.provider.costTokens;

  const response: RouteGenerationResponse = {
    selectedModel: params.provider.model,
    providerTier: params.provider.tier,
    isCached: params.isCached,
    score: params.score,
    costTokens,
    tokenAction: params.tokenAction,
    fallbackReason: params.fallbackReason,
    traceId: params.traceId,
    routingMetadata: {
      patternId: params.pattern?.id ?? null,
      promptTemplate: params.pattern?.promptTemplate ?? null,
      targetModels: params.pattern?.targetModels ?? [],
      fallbackReason: params.fallbackReason,
      tokenAction: params.tokenAction,
      billingMode: params.billingMode,
    },
    traceMetadata: {
      traceId: params.traceId,
      requestId: params.context.requestId,
      workspaceId: params.context.auth.workspaceId,
      userId: params.context.auth.userId,
      routerEnabled: params.routerEnabled,
      threshold: params.threshold,
      durationMs,
    },
  };

  recordRouterDecision({
    traceId: params.traceId,
    requestId: params.context.requestId,
    workspaceId: params.context.auth.workspaceId,
    selectedModel: response.selectedModel,
    providerTier: response.providerTier,
    isCached: response.isCached,
    score: response.score,
    costTokens: response.costTokens,
    fallbackReason: params.fallbackReason,
    durationMs,
    patternId: params.pattern?.id ?? null,
  });

  return response;
}

function chooseBestCandidate(
  candidates: ImagePatternCandidate[],
  input: RouteGenerationInput,
  config: Awaited<ReturnType<typeof getArtDirectorRouterConfig>>,
): CandidateScore | null {
  const scored = candidates.map((candidate) => {
    const provider = selectProvider({
      typographyRequired: input.typographyRequired,
      preferredModels: candidate.targetModels,
      config,
    });
    return calculateArtDirectorScore(candidate, provider);
  });

  return scored.sort((a, b) => b.score - a.score)[0] ?? null;
}

export async function routeGeneration(
  input: RouteGenerationInput,
  context: RouteGenerationServiceContext,
): Promise<RouteGenerationResponse> {
  const startedAt = Date.now();
  const traceId = createTraceId(context.requestId);
  const config = await getArtDirectorRouterConfig();

  if (!config.enabled) {
    const provider = rollbackProvider(config);
    buildZeroShotFallbackPrompt(input);
    return buildResponse({
      input,
      context,
      traceId,
      startedAt,
      provider,
      isCached: false,
      score: 0,
      fallbackReason: 'router_disabled',
      routerEnabled: false,
      threshold: config.threshold,
      billingMode: 'deduct_after_success',
      tokenAction: 'prechecked',
    });
  }

  const embeddingResult = await generateGeminiEmbedding(input.prompt, config);
  const candidates = await findPatternCandidates({
    embedding: embeddingResult.embedding,
    productType: input.productType,
    typographyRequired: input.typographyRequired,
  });
  const best = chooseBestCandidate(candidates, input, config);

  if (best && best.score >= config.threshold) {
    await markPatternUsed(best.candidate.id);
    return buildResponse({
      input,
      context,
      traceId,
      startedAt,
      provider: best.selectedProvider,
      isCached: true,
      score: best.score,
      pattern: best.candidate,
      fallbackReason: 'cache_hit',
      routerEnabled: true,
      threshold: config.threshold,
      billingMode: 'free_cache',
      tokenAction: 'none',
    });
  }

  const fallbackPrompt = buildZeroShotFallbackPrompt(input);
  const provider = selectProvider({
    typographyRequired: input.typographyRequired,
    config,
  });
  const fallbackReason: ArtDirectorFallbackReason = best ? 'score_below_threshold' : 'cache_miss';

  await checkBillingStatus(context.auth.workspaceId);

  return buildResponse({
    input: {
      ...input,
      metadata: {
        ...(input.metadata ?? {}),
        fallbackPrompt: fallbackPrompt.prompt,
        embeddingUnavailableReason: embeddingResult.unavailableReason,
      },
    },
    context,
    traceId,
    startedAt,
    provider,
    isCached: false,
    score: best?.score ?? 0,
    pattern: best?.candidate ?? null,
    fallbackReason: provider.available ? fallbackReason : 'provider_unavailable',
    routerEnabled: true,
    threshold: config.threshold,
    billingMode: 'deduct_after_success',
    tokenAction: 'prechecked',
  });
}

export type { ArtDirectorModel };
