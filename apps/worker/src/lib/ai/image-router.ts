/**
 * Art Director Image Router — T46
 *
 * Orchestrates synchronous routing for artDirector.routeGeneration using the
 * v6.1 provider inventory, A1–A22 mode contracts, Visual Engine V2 editing-tool
 * plans, Gemini-first cache lookup, Claude 3.5 Sonnet zero-shot fallback, Brand
 * Vault @mention resolution, and R2-backed generated-asset indexing hooks.
 */
import { randomUUID } from 'node:crypto';
import type * as Shared from '@viyo/shared';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { assets } from '@viyo/db';
import { getDb } from '../db.js';
import { checkBillingStatus, deductTokens, getTokenBalance } from '../token-engine.js';
import { generateGeminiEmbedding } from './embeddings.js';
import { buildZeroShotFallbackPrompt, ZERO_SHOT_FALLBACK_MODEL } from './fallback-prompts.js';
import type { ImagePatternCandidate } from './image-patterns.js';
import { findPatternCandidates, markPatternUsed } from './image-patterns.js';
import {
  ART_DIRECTOR_PO_REVIEW_PIPELINE_MODES,
  rollbackProvider,
  resolveModeProviderCandidates,
  selectProvider,
  type ProviderDescriptor,
} from './provider-registry.js';
import { getEditingToolPlan, selectPrimaryEditingProvider } from './editing-router.js';
import { ART_DIRECTOR_FORMULA_WEIGHTS, getArtDirectorRouterConfig } from './router-config.js';
import { createTraceId, recordRouterDecision } from './router-observability.js';
import { ApiError } from '../../middleware/error-handler.js';

type ArtDirectorFallbackReason = Shared.ArtDirectorFallbackReason;
type ArtDirectorModel = Shared.ArtDirectorModel;
type AuthContext = Shared.AuthContext;
type BrandVaultMention = Shared.BrandVaultMention;
type RouteGenerationInput = Shared.RouteGenerationInput;
type RouteGenerationResponse = Shared.RouteGenerationResponse;

export interface R2BucketLike {
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: {
      httpMetadata?: Record<string, string>;
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
}

export interface RouteGenerationServiceContext {
  auth: AuthContext;
  requestId: string;
  r2Bucket?: R2BucketLike;
  assetUrlBase?: string;
}

export interface CandidateScore {
  candidate: ImagePatternCandidate;
  score: number;
  baseQualityScore: number;
  costEfficiencyScore: number;
  fidelityMultiplier: number;
  typographyMultiplier: number;
  selectedProvider: ProviderDescriptor;
}

interface AssetSaveResult {
  assetUrl: string | null;
  savedToVault: boolean;
  assetId: string | null;
  storagePath?: string;
  unavailableReason?: string;
}

interface BillingLifecycleResult {
  estimatedCostTokens: number;
  balanceBeforeTokens: number | null;
  balanceAfterTokens: number | null;
  tokensDeducted: number;
}

function clamp(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Number(value.toFixed(4));
}

function qualityScore(candidate: ImagePatternCandidate): number {
  const storedQuality = clamp(Math.max(candidate.fidelityScore, candidate.qaScore));
  const semanticQuality = clamp(candidate.similarity);
  return clamp(storedQuality * 0.7 + semanticQuality * 0.3);
}

function fidelityMultiplier(candidate: ImagePatternCandidate): number {
  return clamp(candidate.fidelityScore, 0.5, 1.15);
}

function typographyMultiplier(input: RouteGenerationInput, selectedProvider: ProviderDescriptor): number {
  if (!input.typographyRequired) return 1;
  return selectedProvider.typographyOptimized ? 1.1 : 0.9;
}

function costEfficiencyScore(candidate: ImagePatternCandidate): number {
  if (candidate.costPerGen <= 0) return 1;
  return clamp(1 / (1 + candidate.costPerGen));
}

export function calculateArtDirectorScore(
  candidate: ImagePatternCandidate,
  selectedProvider: ProviderDescriptor,
  input: Pick<RouteGenerationInput, 'typographyRequired'> = { typographyRequired: false },
): CandidateScore {
  const baseQualityScore = qualityScore(candidate);
  const costScore = costEfficiencyScore(candidate);
  const fidelity = fidelityMultiplier(candidate);
  const typography = typographyMultiplier(input as RouteGenerationInput, selectedProvider);

  const score =
    (baseQualityScore * ART_DIRECTOR_FORMULA_WEIGHTS.quality +
      costScore * ART_DIRECTOR_FORMULA_WEIGHTS.costEfficiency) *
    fidelity *
    typography;

  return {
    candidate,
    score: roundScore(clamp(score, 0, 1)),
    baseQualityScore,
    costEfficiencyScore: costScore,
    fidelityMultiplier: fidelity,
    typographyMultiplier: typography,
    selectedProvider,
  };
}

function parsePromptMentions(prompt: string): BrandVaultMention[] {
  const mentions = new Map<string, BrandVaultMention>();
  const regex = /@([A-Za-z0-9][A-Za-z0-9_.-]{0,119})/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(prompt)) !== null) {
      const slug = match[1].replace(/[.]+$/g, '').toLowerCase();
      if (!slug) continue;
      const raw = `@${slug}`;
      if (!mentions.has(slug)) {
        mentions.set(slug, { raw, slug });
      }
  }

  return [...mentions.values()];
}

function mergeMentions(input: RouteGenerationInput): BrandVaultMention[] {
  const bySlug = new Map<string, BrandVaultMention>();

  for (const mention of [...parsePromptMentions(input.prompt), ...(input.mentionReferences ?? [])]) {
    bySlug.set(mention.slug.toLowerCase(), {
      ...(bySlug.get(mention.slug.toLowerCase()) ?? {}),
      ...mention,
      slug: mention.slug.toLowerCase(),
    });
  }

  return [...bySlug.values()];
}

function cleanStoragePath(path: string): string {
  return path.replace(/^\/+/, '');
}

function publicAssetUrl(
  storagePath: string,
  config: Awaited<ReturnType<typeof getArtDirectorRouterConfig>>,
  context?: RouteGenerationServiceContext,
): string | null {
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  const cleanPath = cleanStoragePath(storagePath);
  const base = context?.assetUrlBase ?? config.r2PublicBaseUrl;
  if (base) return `${base.replace(/\/+$/, '')}/${cleanPath}`;
  if (config.r2AccountId) {
    return `https://${config.r2AccountId}.r2.cloudflarestorage.com/${config.r2BucketName}/${cleanPath}`;
  }
  return null;
}

async function resolveBrandVaultMentions(
  input: RouteGenerationInput,
  context: RouteGenerationServiceContext,
  config: Awaited<ReturnType<typeof getArtDirectorRouterConfig>>,
): Promise<BrandVaultMention[]> {
  const mentions = mergeMentions(input);
  if (!mentions.length && !(input.sourceAssetIds ?? []).length) return [];

  const db = getDb();
  if (!db) return mentions;

  const resolved = new Map<string, BrandVaultMention>();
  for (const mention of mentions) resolved.set(mention.slug, mention);

  for (const mention of mentions) {
    if (mention.assetId && mention.assetUrl) continue;

    const [asset] = await db
      .select({ id: assets.id, storagePath: assets.storagePath })
      .from(assets)
      .where(
        and(
          eq(assets.workspaceId, context.auth.workspaceId),
          or(
            sql`${assets.metadata}->>'brandId' = ${input.brandId}`,
            sql`${assets.metadata}->>'brand_id' = ${input.brandId}`,
          ),
          or(
            sql`${assets.metadata}->>'slug' = ${mention.slug}`,
            sql`${assets.metadata}->>'name' ILIKE ${mention.slug}`,
            ilike(assets.storagePath, `%${mention.slug}%`),
          ),
        ),
      )
      .orderBy(desc(assets.createdAt))
      .limit(1);

    if (asset) {
      resolved.set(mention.slug, {
        ...mention,
        assetId: asset.id,
        assetUrl: publicAssetUrl(asset.storagePath, config, context) ?? undefined,
      });
    }
  }

  const sourceAssetIds = input.sourceAssetIds ?? [];
  if (sourceAssetIds.length) {
    const sourceAssets = await db
      .select({ id: assets.id, storagePath: assets.storagePath })
      .from(assets)
      .where(and(eq(assets.workspaceId, context.auth.workspaceId), inArray(assets.id, sourceAssetIds)))
      .limit(sourceAssetIds.length);

    for (const asset of sourceAssets) {
      const slug = `asset-${asset.id}`;
      resolved.set(slug, {
        raw: `@${slug}`,
        slug,
        assetId: asset.id,
        assetUrl: publicAssetUrl(asset.storagePath, config, context) ?? undefined,
      });
    }
  }

  return [...resolved.values()];
}

function buildPipelineSteps(input: RouteGenerationInput): string[] {
  if (input.editingTool) return getEditingToolPlan(input.editingTool).pipelineSteps;
  const candidates = resolveModeProviderCandidates(input.mode, {
    enabled: false,
    threshold: 0,
    providerTimeoutMs: 0,
    embeddingModel: '',
    tier1Provider: 'gpt-image-2',
    tier2Provider: 'flux-2-pro',
    tier3Provider: 'stable-diffusion-3.5',
    rollbackProvider: 'nano-banana-pro',
    r2BucketName: 'viyo-assets',
  });
  return candidates.map((provider) => provider.model);
}

async function saveGeneratedAssetToVault(params: {
  input: RouteGenerationInput;
  context: RouteGenerationServiceContext;
  config: Awaited<ReturnType<typeof getArtDirectorRouterConfig>>;
  traceId: string;
  provider: ProviderDescriptor;
  prompt: string | null;
  isCached: boolean;
  score: number;
}): Promise<AssetSaveResult> {
  if (params.isCached) {
    return { assetUrl: null, savedToVault: false, assetId: null, unavailableReason: 'cache_hit_does_not_materialize_new_asset' };
  }

  if (!params.context.r2Bucket) {
    return { assetUrl: null, savedToVault: false, assetId: null, unavailableReason: 'R2 bucket binding is not configured' };
  }

  const storagePath = `art-director/${params.context.auth.workspaceId}/${new Date().toISOString().slice(0, 10)}/${params.traceId}-${randomUUID()}.json`;
  const manifest = JSON.stringify(
    {
      traceId: params.traceId,
      workspaceId: params.context.auth.workspaceId,
      brandId: params.input.brandId,
      mode: params.input.mode,
      editingTool: params.input.editingTool ?? null,
      selectedModel: params.provider.model,
      providerGateway: params.provider.gateway,
      score: params.score,
      prompt: params.prompt,
      sourceImageUrls: params.input.sourceImageUrls ?? [],
      mentionReferences: params.input.mentionReferences ?? [],
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  );

  await params.context.r2Bucket.put(storagePath, manifest, {
    httpMetadata: { contentType: 'application/json' },
    customMetadata: {
      traceId: params.traceId,
      workspaceId: params.context.auth.workspaceId,
      brandId: params.input.brandId,
      model: params.provider.model,
    },
  });

  const assetUrl = publicAssetUrl(storagePath, params.config, params.context);
  const db = getDb();
  if (!db) {
    return {
      assetUrl,
      savedToVault: false,
      assetId: null,
      storagePath,
      unavailableReason: 'DATABASE_URL is not configured, so the R2 object could not be indexed in assets',
    };
  }

  const [row] = await db
    .insert(assets)
    .values({
      workspaceId: params.context.auth.workspaceId,
      assetType: params.input.editingTool ? 'generated_section' : 'generated_hero',
      storagePath,
      mimeType: 'application/json',
      sourceModel: params.provider.model,
      generationPrompt: params.prompt,
      metadata: {
        traceId: params.traceId,
        brandId: params.input.brandId,
        mode: params.input.mode,
        editingTool: params.input.editingTool ?? null,
        providerGateway: params.provider.gateway,
        fallbackGateway: params.provider.fallbackGateway ?? null,
        score: params.score,
        sourceImageUrls: params.input.sourceImageUrls ?? [],
        mentionReferences: params.input.mentionReferences ?? [],
      },
    })
    .returning({ id: assets.id });

  return { assetUrl, savedToVault: Boolean(row?.id && assetUrl), assetId: row?.id ?? null, storagePath };
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
  patternScore?: CandidateScore | null;
  evaluatedPatternCount: number;
  fallbackReason: ArtDirectorFallbackReason;
  routerEnabled: boolean;
  threshold: number;
  billingMode: RouteGenerationResponse['routingMetadata']['billingMode'];
  tokenAction: RouteGenerationResponse['tokenAction'];
  assetSave: AssetSaveResult;
  pipelineSteps: string[];
  zeroShotPromptModel?: typeof ZERO_SHOT_FALLBACK_MODEL | null;
  billing?: BillingLifecycleResult;
}): RouteGenerationResponse {
  const durationMs = Math.max(0, Date.now() - params.startedAt);
  const costTokens = params.isCached ? 0 : params.provider.costTokens;
  const routeSource: RouteGenerationResponse['routingMetadata']['routeSource'] = !params.routerEnabled
    ? 'router_disabled_rollback'
    : params.isCached
      ? 'pattern_db_cache'
      : 'zero_shot_generation';
  const cacheStatus: RouteGenerationResponse['routingMetadata']['cacheStatus'] = !params.routerEnabled
    ? 'disabled'
    : params.isCached
      ? 'hit'
      : params.patternScore
        ? 'below_threshold'
        : 'miss';

  const response: RouteGenerationResponse = {
    selectedModel: params.provider.model,
    providerTier: params.provider.tier,
    isCached: params.isCached,
    score: params.score,
    costTokens,
    tokenAction: params.tokenAction,
    fallbackReason: params.fallbackReason,
    traceId: params.traceId,
    assetUrl: params.assetSave.assetUrl,
    savedToVault: params.assetSave.savedToVault,
    assetId: params.assetSave.assetId,
    routingMetadata: {
      mode: params.input.mode,
      editingTool: params.input.editingTool ?? null,
      routeSource,
      cacheStatus,
      patternId: params.pattern?.id ?? null,
      promptTemplate: params.pattern?.promptTemplate ?? null,
      targetModels: (params.pattern?.targetModels ?? []) as ArtDirectorModel[],
      providerGateway: params.provider.gateway,
      fallbackGateway: params.provider.fallbackGateway ?? null,
      fallbackReason: params.fallbackReason,
      tokenAction: params.tokenAction,
      billingMode: params.billingMode,
      resolvedMentions: params.input.mentionReferences ?? [],
      evaluatedPatternCount: params.evaluatedPatternCount,
      bestPatternScore: params.patternScore?.score ?? null,
      bestPatternSimilarity: params.patternScore ? roundScore(params.patternScore.candidate.similarity) : null,
      bestPatternQualityScore: params.patternScore ? roundScore(params.patternScore.baseQualityScore) : null,
      bestPatternCostEfficiencyScore: params.patternScore ? roundScore(params.patternScore.costEfficiencyScore) : null,
      bestPatternFidelityMultiplier: params.patternScore ? roundScore(params.patternScore.fidelityMultiplier) : null,
      bestPatternTypographyMultiplier: params.patternScore ? roundScore(params.patternScore.typographyMultiplier) : null,
      patternCategory: params.patternScore?.candidate.category ?? null,
      patternProductType: params.patternScore?.candidate.productType ?? null,
      patternLayoutType: params.patternScore?.candidate.layoutType ?? null,
      patternTypographyStyle: params.patternScore?.candidate.typographyStyle ?? null,
      pipelineRequiresPoReview: ART_DIRECTOR_PO_REVIEW_PIPELINE_MODES.has(params.input.mode),
      pipelineSteps: params.pipelineSteps,
      zeroShotPromptModel: params.zeroShotPromptModel ?? null,
      estimatedCostTokens: params.billing?.estimatedCostTokens ?? costTokens,
      balanceBeforeTokens: params.billing?.balanceBeforeTokens ?? null,
      balanceAfterTokens: params.billing?.balanceAfterTokens ?? null,
      tokensDeducted: params.billing?.tokensDeducted ?? (params.isCached ? 0 : 0),
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
      mode: input.mode,
      config,
    });
    return calculateArtDirectorScore(candidate, provider, input);
  });

  return scored.sort((a, b) => b.score - a.score)[0] ?? null;
}

function selectRouteProvider(
  input: RouteGenerationInput,
  config: Awaited<ReturnType<typeof getArtDirectorRouterConfig>>,
): ProviderDescriptor {
  if (input.editingTool) {
    return (
      selectPrimaryEditingProvider(input.editingTool, config) ??
      selectProvider({ typographyRequired: input.typographyRequired, mode: input.mode, config })
    );
  }

  return selectProvider({ typographyRequired: input.typographyRequired, mode: input.mode, config });
}

async function preflightArtDirectorTokens(params: {
  context: RouteGenerationServiceContext;
  provider: ProviderDescriptor;
}): Promise<{ estimatedCostTokens: number; balanceBeforeTokens: number }> {
  const estimatedCostTokens = params.provider.costTokens;
  await checkBillingStatus(params.context.auth.workspaceId);
  const balance = await getTokenBalance(params.context.auth.workspaceId);

  if (balance.balance < estimatedCostTokens) {
    throw new ApiError(402, 'INSUFFICIENT_TOKENS: Not enough tokens to complete this operation.', {
      code: 'INSUFFICIENT_TOKENS',
      required: estimatedCostTokens,
      balance: balance.balance,
      estimatedCostTokens,
      selectedModel: params.provider.model,
    });
  }

  return { estimatedCostTokens, balanceBeforeTokens: balance.balance };
}

async function deductArtDirectorTokensAfterSuccess(params: {
  input: RouteGenerationInput;
  context: RouteGenerationServiceContext;
  traceId: string;
  provider: ProviderDescriptor;
  fallbackReason: ArtDirectorFallbackReason;
  cacheStatus: RouteGenerationResponse['routingMetadata']['cacheStatus'];
  preflight: { estimatedCostTokens: number; balanceBeforeTokens: number };
  assetSave: AssetSaveResult;
}): Promise<BillingLifecycleResult> {
  if (!params.context.auth.userId) {
    throw new ApiError(401, 'Authenticated user is required to deduct Art Director tokens.', { code: 'AUTH_REQUIRED' });
  }

  const deduction = await deductTokens({
    workspaceId: params.context.auth.workspaceId,
    userId: params.context.auth.userId,
    amount: params.preflight.estimatedCostTokens,
    transactionType: 'art_director_generation',
    description: `Art Director ${params.input.editingTool ? 'editing' : 'generation'} route via ${params.provider.model}`,
    referenceType: 'art_director_trace',
    metadata: {
      traceId: params.traceId,
      assetId: params.assetSave.assetId,
      storagePath: params.assetSave.storagePath,
      savedToVault: params.assetSave.savedToVault,
      brandId: params.input.brandId,
      mode: params.input.mode,
      editingTool: params.input.editingTool ?? null,
      selectedModel: params.provider.model,
      providerTier: params.provider.tier,
      providerGateway: params.provider.gateway,
      fallbackReason: params.fallbackReason,
      cacheStatus: params.cacheStatus,
    },
  });

  return {
    estimatedCostTokens: params.preflight.estimatedCostTokens,
    balanceBeforeTokens: params.preflight.balanceBeforeTokens,
    balanceAfterTokens: deduction.newBalance,
    tokensDeducted: deduction.tokensDeducted,
  };
}

export async function routeGeneration(
  input: RouteGenerationInput,
  context: RouteGenerationServiceContext,
): Promise<RouteGenerationResponse> {
  const startedAt = Date.now();
  const traceId = createTraceId(context.requestId);
  const config = await getArtDirectorRouterConfig();
  const resolvedMentions = await resolveBrandVaultMentions(input, context, config);
  const effectiveInput: RouteGenerationInput = { ...input, mentionReferences: resolvedMentions };
  const pipelineSteps = buildPipelineSteps(effectiveInput);

  if (!config.enabled) {
    const provider = rollbackProvider(config);
    const fallbackPrompt = await buildZeroShotFallbackPrompt(effectiveInput, {
      apiKey: config.claudeApiKey,
      timeoutMs: config.providerTimeoutMs,
    });
    const preflight = await preflightArtDirectorTokens({ context, provider });

    const assetSave = await saveGeneratedAssetToVault({
      input: effectiveInput,
      context,
      config,
      traceId,
      provider,
      prompt: fallbackPrompt.prompt,
      isCached: false,
      score: 0,
    });

    const billing = await deductArtDirectorTokensAfterSuccess({
      input: effectiveInput,
      context,
      traceId,
      provider,
      fallbackReason: 'router_disabled',
      cacheStatus: 'disabled',
      preflight,
      assetSave,
    });

    return buildResponse({
      input: {
        ...effectiveInput,
        metadata: {
          ...(effectiveInput.metadata ?? {}),
          fallbackPrompt: fallbackPrompt.prompt,
          zeroShotPromptUnavailableReason: fallbackPrompt.unavailableReason,
          r2UnavailableReason: assetSave.unavailableReason,
        },
      },
      context,
      traceId,
      startedAt,
      provider,
      isCached: false,
      score: 0,
      patternScore: null,
      evaluatedPatternCount: 0,
      fallbackReason: 'router_disabled',
      routerEnabled: false,
      threshold: config.threshold,
      billingMode: 'deduct_after_success',
      tokenAction: 'deducted_after_success',
      assetSave,
      billing,
      pipelineSteps,
      zeroShotPromptModel: ZERO_SHOT_FALLBACK_MODEL,
    });
  }

  const embeddingResult = await generateGeminiEmbedding(effectiveInput.prompt, config);
  const candidates = await findPatternCandidates({
    embedding: embeddingResult.embedding,
    productType: effectiveInput.productType,
    typographyRequired: effectiveInput.typographyRequired,
  });
  const best = chooseBestCandidate(candidates, effectiveInput, config);

  if (best && best.score >= config.threshold) {
    await markPatternUsed(best.candidate.id);
    return buildResponse({
      input: effectiveInput,
      context,
      traceId,
      startedAt,
      provider: best.selectedProvider,
      isCached: true,
      score: best.score,
      pattern: best.candidate,
      patternScore: best,
      evaluatedPatternCount: candidates.length,
      fallbackReason: 'cache_hit',
      routerEnabled: true,
      threshold: config.threshold,
      billingMode: 'free_cache',
      tokenAction: 'none',
      assetSave: { assetUrl: null, savedToVault: false, assetId: null },
      pipelineSteps,
      zeroShotPromptModel: null,
    });
  }

  const fallbackPrompt = await buildZeroShotFallbackPrompt(effectiveInput, {
    apiKey: config.claudeApiKey,
    timeoutMs: config.providerTimeoutMs,
  });
  const provider = selectRouteProvider(effectiveInput, config);
  const fallbackReason: ArtDirectorFallbackReason = best ? 'score_below_threshold' : 'cache_miss';

  const cacheStatus: RouteGenerationResponse['routingMetadata']['cacheStatus'] = best ? 'below_threshold' : 'miss';
  const resolvedFallbackReason = provider.available ? fallbackReason : 'provider_unavailable';
  const preflight = await preflightArtDirectorTokens({ context, provider });

  const assetSave = await saveGeneratedAssetToVault({
    input: effectiveInput,
    context,
    config,
    traceId,
    provider,
    prompt: fallbackPrompt.prompt,
    isCached: false,
    score: best?.score ?? 0,
  });

  const billing = await deductArtDirectorTokensAfterSuccess({
    input: effectiveInput,
    context,
    traceId,
    provider,
    fallbackReason: resolvedFallbackReason,
    cacheStatus,
    preflight,
    assetSave,
  });

  return buildResponse({
    input: {
      ...effectiveInput,
      metadata: {
        ...(effectiveInput.metadata ?? {}),
        fallbackPrompt: fallbackPrompt.prompt,
        zeroShotPromptUnavailableReason: fallbackPrompt.unavailableReason,
        embeddingUnavailableReason: embeddingResult.unavailableReason,
        r2UnavailableReason: assetSave.unavailableReason,
      },
    },
    context,
    traceId,
    startedAt,
    provider,
    isCached: false,
    score: best?.score ?? 0,
    pattern: best?.candidate ?? null,
    patternScore: best,
    evaluatedPatternCount: candidates.length,
    fallbackReason: resolvedFallbackReason,
    routerEnabled: true,
    threshold: config.threshold,
    billingMode: 'deduct_after_success',
    tokenAction: 'deducted_after_success',
    assetSave,
    billing,
    pipelineSteps,
    zeroShotPromptModel: ZERO_SHOT_FALLBACK_MODEL,
  });
}

export type { ArtDirectorModel };
