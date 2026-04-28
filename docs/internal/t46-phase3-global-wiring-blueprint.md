# T46 Phase 3 Global Wiring Blueprint — Composite Art Director Routing Suite

**Project:** VIYO  
**Taskmaster Task:** T46 — Composite Art Director Routing Suite (T21, T22, T23)  
**Protocol:** VIYO Development Protocol v2.6  
**Phase:** Phase 3 — Global Wiring Blueprint  
**Date:** 2026-04-28  
**Status:** Awaiting PO approval before Phase 4  
**Implementation Status:** No production implementation code has been written under T46.

## 1. Purpose and Approval Boundary

This Phase 3 packet maps the complete global wiring for T46 before implementation. The approved Phase 2 architecture establishes that T46 will deliver the 4D scoring matrix, zero-shot fallback, and provider tier routing as a single composite task, with the PO-mandated corrections incorporated: **no deduct-before-execute**, **Gemini-first embeddings through the existing Google AI configuration**, and explicit provider defaults of **NanoBanana Tier 1**, **Ideogram Tier 2**, and **DALL-E 3 Tier 3 emergency fallback**.[^1] The VIYO v2.6 protocol requires every one of the 13 wiring layers to be mapped and requires PO approval before Phase 4 begins.[^2]

> **Phase 3 stop gate:** Approval of this blueprint authorizes Phase 4 implementation only within the wiring described below. Rejection or requested revisions must be resolved in this document before any production code is written.

The blueprint deliberately keeps the task within the approved SIZE M boundary. The current token engine exposes billing-status checks, atomic token deduction, token grants, and balance lookup, but it does not expose a reservation or hold ledger abstraction.[^3] Therefore, Phase 4 must implement the PO-approved fallback path: **precheck billing and balance before provider execution, execute the provider, and call the existing token deduction function only after successful provider execution**. A true hold/confirm/release ledger must be logged as deferred work unless an existing approved reservation primitive is discovered during implementation.

## 2. Binding Decisions Carried from Phase 2

The following decisions are not open for reinterpretation during implementation. They are restated here so that each wiring layer can be verified against the same source-of-truth assumptions.

| **Decision** | Binding Implementation Meaning | Verification Anchor |
| :--- |---|---|
| **Corrected 4D score** | Compute `((baseQualityScore * 0.4) + (costEfficiencyScore * 0.3)) * freshnessPenalty * tierMultiplier`; do not use the stale unparenthesized T21 form. | Unit tests for operator precedence and threshold behavior. |
| **Cache-first routing** | Query `image_prompt_patterns`; select a cached pattern only when the best candidate clears `0.75`; cached routing returns `isCached: true` and `costTokens: 0`. | Repository and router tests. |
| **No deduct-before-execute** | Cached routing performs no billing call. Frontier routing runs billing status and balance prechecks, then deducts only after provider success because no current hold ledger exists. | Token-economics tests proving failed provider execution does not call `deductTokens`. |
| **Gemini embeddings** | Semantic request embeddings use Gemini through `GOOGLE_AI_API_KEY`; OpenAI is not a hard dependency for cache lookup. | Embedding service tests and env-schema tests. |
| **Explicit provider tiers** | Default provider order is Tier 1 NanoBanana, Tier 2 Ideogram for typography-heavy fallback, Tier 3 DALL-E 3 via OpenAI emergency fallback. | Provider-registry tests and config tests. |
| **Minimal tRPC island** | Add `artDirector.routeGeneration` under a minimal tRPC mount inside the existing Hono worker rather than replacing the worker framework. | Procedure tests and worker mount smoke test. |
| **Rollback flag** | `enable_art_director_router=false` bypasses scoring and routes to Tier 1 NanoBanana with rollback metadata. | Config and procedure tests. |
| **Incremental records** | Phase 4 implementation notes must be updated as work occurs, not bulk-written at the end. | `docs/internal/t46-phase4-incremental-record.md`, Taskmaster, and Airtable updates. |

## 3. End-to-End Wiring Narrative

The routing flow begins at the API boundary with `artDirector.routeGeneration`. The procedure validates the shared request schema, receives authenticated workspace and user context from the existing worker middleware, reads the router feature flag, and delegates all domain behavior to `image-router.ts`. The router generates a Gemini embedding, retrieves eligible rows from `image_prompt_patterns`, computes the corrected score, and returns a free cached result when the best score clears the threshold. When no cached pattern qualifies, the router builds a zero-shot fallback prompt, selects the first eligible provider tier, executes the provider synchronously, and deducts tokens only after success through the existing token engine.[^3] [^4]

The routing flow must also record a complete observability event for every decision. The event must include request ID, workspace ID, cache state, selected model, provider tier, score, duration, token action, fallback reason, and whether the router flag was enabled. This keeps the implementation compatible with the Phase 2 requirement to support Tier 1 fallback-rate monitoring even if external alert wiring is later deferred as a separate deployment gap.[^1]

## 4. 13-Layer VIYO Wiring Blueprint

| **Layer** | **Affected?** | **What Changes** | **Depends On** | **Spec Reference** | **Risk** |
| :--- |---|---|---|---|---|
| **Layer 1 — Database Schema & Migrations** | **Affected: read/update only** | No new migration is planned. Add a repository that reads `image_prompt_patterns` columns for category, layout, typography style, target models, prompt template, style schema, embeddings, QA score, cost, typography support, fidelity score, product type, usage count, and timestamps. Update usage metadata only after a selected cache hit. Do not invent `curator_queue` if absent. | T45 schema and Drizzle exports. | T45 image-pattern schema; Phase 2 architecture. | Medium: if required embedding similarity cannot be supported by the current column type or query helpers, implementation must log a gap rather than adding unapproved schema. |
| **Layer 2 — Supabase Auth, Roles & Policies** | **Affected: authorization propagation** | Preserve existing authenticated worker context. The tRPC context must carry `workspaceId`, `userId`, role data, request ID, and database access from existing auth middleware. No new RLS policy is planned because T46 reads service-side routing data and charges through existing billing RPC behavior. | Existing worker auth middleware and token engine. | Worker auth contract; token-engine billing precheck. | Medium: bypassing auth would expose routing and billing behavior, so procedure tests must verify unauthenticated requests fail before routing. |
| **Layer 3 — Shared Types & Contracts** | **Affected** | Create `packages/shared/src/schemas/art-director.ts` and export it from the shared schema barrel. Define `routeGeneration` request and response Zod schemas plus inferred TypeScript types. The response must include selected model, provider tier, cache state, score, cost tokens, token action, fallback reason, and trace metadata. | Shared schema package and worker imports. | Phase 2 component inventory. | Low: schema drift would break clients; type-check must prove worker consumes the shared contract. |
| **Layer 4 — Backend Services & Workers** | **Affected** | Add domain services under `apps/worker/src/lib/ai/`: `image-router.ts`, `image-patterns.ts`, `embeddings.ts`, `fallback-prompts.ts`, `provider-registry.ts`, `router-config.ts`, and `router-observability.ts`. Keep orchestration in the router service; keep provider adapters and prompt generation isolated. | Layer 1 repository, Layer 3 schemas, Layer 10 config. | R19 LLM architecture and R24 image pipeline scope; Phase 2 decisions. | High: mixing provider logic into the procedure would make fallback and billing tests fragile. |
| **Layer 5 — API Routes & Validation** | **Affected** | Add a minimal tRPC server surface and mount it inside Hono under `/api/trpc/*`. Expose `artDirector.routeGeneration` as the synchronous procedure. The procedure must validate the request with shared schemas, use authenticated context, and translate typed domain errors to API-safe errors. | Existing Hono bootstrap and middleware order. | PO architecture lock; Phase 2 tRPC-island decision. | High: incorrect mount order could bypass request ID, rate limit, or auth middleware. |
| **Layer 6 — Frontend UI & State** | **Not affected in Phase 4 implementation, with explicit contract note** | No web UI component, Zustand store, or route is added by T46 because the current repository inventory shows no generation/studio frontend call site in scope. The shared contract and tRPC procedure are still designed for future UI consumption. If Phase 4 discovers an existing generation UI call site outside the inspected inventory, this row becomes affected and the blueprint must return for PO revision. | Shared route contract only. | Phase 2 scope and repository inventory. | Medium: a hidden UI call site could remain unwired; implementation must grep before final validation and record the result. |
| **Layer 7 — Admin Portal** | **Not affected in Phase 4 implementation, with explicit gap handling** | No admin curator dashboard or pattern-management UI is added by T46. The router may emit metadata that future admin surfaces can consume, but T46 must not create unapproved admin pages or schema. | Observability metadata only. | R24 learning-loop future direction; Phase 2 gap handling. | Medium: if `curator_queue` or review UI is required for launch, it must become a follow-up task rather than scope creep. |
| **Layer 8 — AI Brains & Prompts** | **Affected** | Implement Gemini embedding generation and zero-shot fallback prompt generation. Fallback triggers only when no cached pattern clears the threshold or when provider failover requires a frontier prompt. Provider adapters must not alter score formula behavior. | Google AI config, fallback prompt service, provider registry. | R19 fallback principles; R24 multi-model pipeline; PO corrections. | High: using OpenAI embeddings or changing fallback trigger semantics would violate the approval ruling. |
| **Layer 9 — Analytics & Audit Trail** | **Affected** | Add a router observability event for every route decision. Required fields: request ID, workspace ID, user ID when available, cache state, selected model, provider tier, score, threshold, fallback reason, duration, token action, cost tokens, and feature-flag state. | Existing request ID and logging/telemetry setup. | Phase 2 observability plan. | Medium: missing fallback-rate fields could prevent Tier 1 fallback monitoring. |
| **Layer 10 — Config & Feature Flags** | **Affected** | Extend env/config parsing for `ENABLE_ART_DIRECTOR_ROUTER`, router threshold, provider timeouts, Tier 1/2/3 defaults, Gemini embedding settings, and optional OpenAI Tier 3 emergency fallback. Runtime config should use `getSystemConfig` where available, with env as startup default. | Shared env schema and token-engine config helper. | PO correction and Phase 2 config decision. | High: wrong precedence could make rollback unreliable. |
| **Layer 11 — Logs, Monitoring & Error Handling** | **Affected** | Add typed errors for missing auth context, billing frozen, insufficient tokens after precheck, provider unavailable, provider timeout, no eligible provider, invalid response, and no qualified cache candidate. Log provider failures without leaking prompts, API keys, or sensitive brand data. | Existing error handler and request ID middleware. | Phase 2 risk assessment. | High: provider failure must not charge users and must return an actionable typed error. |
| **Layer 12 — Documentation & Runbooks** | **Affected** | Keep this blueprint, corrected Phase 2 packet, quality evidence, and Phase 4 incremental record in `docs/internal/`. Add a short operational runbook section during Phase 4 covering rollback flag, provider-key checks, and no-charge-on-failure expectations. | Internal documentation directory. | VIYO protocol requirement and PO incremental-record reminder. | Low: stale internal docs could cause incorrect deployment or rollback. |
| **Layer 13 — Tests** | **Affected** | Add targeted tests for scoring, cache selection, semantic embedding selection, zero-shot fallback trigger, provider tier defaults and failover, rollback flag, tRPC validation/auth, token precheck plus deduct-after-success behavior, and observability payloads. | Vitest, TypeScript, worker test scripts, shared package type-check. | VIYO Phase 3 checklist; Phase 2 validation plan. | High: without explicit failed-provider billing tests, the PO correction is not enforceable. |

## 5. Exact File-Level Wiring Plan

| **Path** | **Action** | **Primary Responsibility** | **Layer Coverage** |
| :--- |---|---|---|
| `packages/shared/src/schemas/art-director.ts` | Create | Zod request/response schemas and inferred route types. | 3, 5, 13 |
| `packages/shared/src/schemas/index.ts` | Modify | Export Art Director schemas and types. | 3 |
| `packages/shared/src/config/env.ts` | Modify | Add router flag, timeout, threshold, provider default, and optional Tier 3 env keys while preserving existing Google and Ideogram keys. | 10 |
| `apps/worker/src/trpc/index.ts` | Create | Minimal tRPC initialization and app router export. | 5 |
| `apps/worker/src/trpc/context.ts` | Create | Convert Hono/auth context into tRPC context. | 2, 5 |
| `apps/worker/src/trpc/routers/art-director.ts` | Create | Expose `artDirector.routeGeneration` and delegate to router service. | 5 |
| `apps/worker/src/routes/trpc.ts` or `apps/worker/src/index.ts` | Create/Modify | Mount `/api/trpc/*` inside existing Hono middleware stack. | 5, 11 |
| `apps/worker/src/lib/ai/router-config.ts` | Create | Centralize threshold, provider tiers, rollout flag, timeouts, and billing mode. | 10 |
| `apps/worker/src/lib/ai/image-patterns.ts` | Create | Read and update `image_prompt_patterns` safely. | 1, 4 |
| `apps/worker/src/lib/ai/embeddings.ts` | Create | Generate Gemini embeddings through existing Google AI configuration. | 8, 10 |
| `apps/worker/src/lib/ai/fallback-prompts.ts` | Create | Generate zero-shot fallback prompts and metadata. | 8 |
| `apps/worker/src/lib/ai/provider-registry.ts` | Create | Resolve NanoBanana, Ideogram, and DALL-E 3 tier availability and execution. | 4, 8, 10, 11 |
| `apps/worker/src/lib/ai/router-observability.ts` | Create | Normalize route-decision events and logs. | 9, 11 |
| `apps/worker/src/lib/ai/image-router.ts` | Create | Orchestrate validation-ready routing, scoring, fallback, provider execution, billing, and response assembly. | 1, 4, 8, 9, 10, 11 |
| `apps/worker/src/lib/token-engine.ts` | Modify narrowly only if needed | Add non-mutating helper wrapper only if existing exported functions are insufficient; do not create an unapproved hold ledger. | 4, 10, 11 |
| `apps/worker/package.json` | Modify | Add minimal tRPC/provider dependencies only if not already present. | 5, 8 |
| `apps/worker/src/lib/ai/*.test.ts` | Create | Unit coverage for router, repository mapping, embeddings, fallback, provider registry, config, observability, and billing timing. | 13 |
| `apps/worker/src/trpc/routers/art-director.test.ts` | Create | Procedure validation, auth, response, and rollback tests. | 5, 13 |
| `docs/internal/t46-phase4-incremental-record.md` | Create during Phase 4 | Incremental implementation record updated as files are created and verified. | 12 |

## 6. Function and Contract Blueprint

Phase 4 should implement the following signatures or close equivalents. Any deviation must be recorded in the Phase 4 incremental record with the reason and validation evidence.

| **Contract or Function** | **Planned Signature** | **Behavioral Requirement** |
| :--- |---|---|
| **Route request schema** | `routeGenerationRequestSchema = z.object({ prompt, brandId, aspectRatio, styleId?, productType?, typographyRequired?, metadata? })` | Reject missing prompt, brand ID, and aspect ratio before domain logic. |
| **Route response schema** | `routeGenerationResponseSchema = z.object({ selectedModel, providerTier, isCached, score, costTokens, tokenAction, fallbackReason?, traceId, routingMetadata })` | Always expose cache state, tier, cost, and trace metadata. |
| **tRPC procedure** | `artDirector.routeGeneration.mutation(input)` | Validate input, require auth context, call `routeImageGeneration`, return typed response. |
| **Router orchestrator** | `routeImageGeneration(input: RouteGenerationInput, context: ArtDirectorContext): Promise<RouteGenerationResult>` | Own the full synchronous decision flow and no-charge-on-failure invariant. |
| **Score function** | `scorePatternCandidate(candidate: ImagePatternCandidate, request: RouteGenerationInput, now: Date): number` | Use the corrected parenthesized formula exactly. |
| **Pattern lookup** | `findMatchingImagePatterns(request, embedding, config): Promise<ImagePatternCandidate[]>` | Read eligible patterns and avoid unsupported schema assumptions. |
| **Embedding generation** | `generateRouteEmbedding(prompt: string, config: RouterConfig): Promise<number[]>` | Use Gemini through Google AI configuration; never require OpenAI for cache lookup. |
| **Fallback prompt** | `generateFallbackPrompt(input, context): Promise<FallbackPromptResult>` | Trigger only after no qualifying cached pattern or eligible failover state. |
| **Provider selection** | `selectProviderTier(input, config, candidates): ProviderTierSelection` | Default NanoBanana, then Ideogram for typography-heavy fallback, then DALL-E 3 emergency fallback. |
| **Provider execution** | `executeProvider(selection, prompt, context): Promise<ProviderExecutionResult>` | Bound by timeout and return typed success/failure without mutating token balances. |
| **Billing precheck** | `assertCanAttemptBillableGeneration(workspaceId, estimatedCost): Promise<void>` | Call billing status and balance lookup before provider execution; do not deduct. |
| **Success charge** | `deductAfterSuccessfulGeneration(params): Promise<DeductTokensResult>` | Call existing `deductTokens` only after provider success and include route metadata. |
| **Observability** | `recordRouterDecision(event: RouterDecisionEvent): Promise<void>` | Emit structured event regardless of cache hit, fallback, success, or typed failure. |

## 7. Billing Timing Blueprint

The PO correction requires no charge for failed providers. Because no approved token hold abstraction currently exists, Phase 4 must implement the safer deduct-after-success path within T46.

| **Step** | **Cached Path** | **Frontier Success Path** | **Frontier Failure Path** |
| :--- |---|---|---|
| **Billing status precheck** | Not required because cost is zero. | Required before provider execution. | Required before provider execution. |
| **Balance precheck** | Not required because cost is zero. | Required before provider execution using `getTokenBalance`. | Required before provider execution using `getTokenBalance`. |
| **Provider execution** | Not called. | Called after precheck. | Called after precheck and may timeout or fail. |
| **Token mutation** | Never called. | `deductTokens` after successful provider response. | Never called. |
| **Response metadata** | `tokenAction: 'none'`. | `tokenAction: 'deducted_after_success'`. | Typed error or failed-route metadata with `tokenAction: 'none'`. |
| **Race condition handling** | Not applicable. | If the post-success deduction fails because balance changed after precheck, return a typed billing error, record the uncharged provider event, and do not retry deduction directly. | No deduction attempt occurs. |

## 8. Validation Blueprint for Phase 4 and Phase 6

| **Validation Area** | **Required Test or Command** | **Pass Condition** |
| :--- |---|---|
| **Shared contracts** | `pnpm type-check` and targeted schema tests. | Worker imports shared Art Director types without `any` or schema drift. |
| **Router scoring** | `pnpm --filter @viyo/worker test -- image-router` or equivalent. | Corrected parenthesized formula, threshold, tie-break, and cache-free cost pass. |
| **Gemini embeddings** | Mocked embedding test. | Embedding service uses Google/Gemini config and does not require OpenAI. |
| **Provider tiers** | Provider-registry test. | Default order is NanoBanana, Ideogram, DALL-E 3; disabled or missing keys mark provider unavailable gracefully. |
| **Billing timing** | Token-engine/router test with provider success and provider failure mocks. | Success calls `deductTokens` after provider response; failed provider does not call `deductTokens`. |
| **tRPC validation** | Procedure tests with valid, invalid, unauthenticated, and rollback requests. | Invalid payloads reject, auth is required, rollback routes to Tier 1 NanoBanana. |
| **Observability** | Router-observability test. | Event contains request ID, workspace ID, cache state, selected model, tier, score, duration, fallback reason, token action, and flag state. |
| **Workspace checks** | `pnpm lint`, `pnpm test`, `pnpm build`. | No lint, unit-test, or build failures from T46 changes. |
| **Live validation** | Local worker boot and authenticated procedure smoke test where feasible. | Procedure responds synchronously, respects auth, and logs decision metadata. |

## 9. Executable Wiring Invariants for Phase 4

The following invariants are not production implementation code. They are precise behavioral anchors that Phase 4 tests must translate into the actual codebase. They also prevent the wiring blueprint from being treated as a narrative-only artifact.

```ts
const Phase3WiringInvariantRegistry = {
  ThirteenLayerCoverageInvariant,
  BillingTimingInvariant,
  ProviderDefaultsInvariant,
  GeminiEmbeddingInvariant,
  TrpcAuthInvariant,
};

export function ThirteenLayerCoverageInvariant(layers: Array<{ id: number; affected: string; justification: string }>) {
  try {
    const requiredIds = new Set(Array.from({ length: 13 }, (_value, index) => index + 1));
    const presentIds = new Set(layers.map((layer) => layer.id));
    const allLayersPresent = Array.from(requiredIds).every((id) => presentIds.has(id));
    const everyLayerClassified = layers.every((layer) => Boolean(layer.affected) && Boolean(layer.justification));
    return layers.length === 13 && allLayersPresent && everyLayerClassified;
  } catch (error) {
    throw new Error(`Thirteen-layer wiring invariant failed: ${String(error)}`);
  }
}

export function BillingTimingInvariant(route: { isCached: boolean; providerSucceeded: boolean; tokenAction: string; deductCallCount: number }) {
  try {
    if (route.isCached) return route.tokenAction === 'none' && route.deductCallCount === 0;
    if (!route.providerSucceeded) return route.tokenAction === 'none' && route.deductCallCount === 0;
    return route.tokenAction === 'deducted_after_success' && route.deductCallCount === 1;
  } catch (error) {
    throw new Error(`Billing timing invariant failed: ${String(error)}`);
  }
}

export function ProviderDefaultsInvariant(registry: { tier1: string; tier2: string; tier3: string }) {
  try {
    return registry.tier1 === 'NanoBanana' && registry.tier2 === 'Ideogram' && registry.tier3 === 'DALL-E 3';
  } catch (error) {
    throw new Error(`Provider defaults invariant failed: ${String(error)}`);
  }
}

export function GeminiEmbeddingInvariant(config: { embeddingProvider: string; googleAiApiKeyAvailable: boolean; openAiRequiredForCache: boolean }) {
  try {
    return config.embeddingProvider === 'gemini' && config.googleAiApiKeyAvailable === true && config.openAiRequiredForCache === false;
  } catch (error) {
    throw new Error(`Gemini embedding invariant failed: ${String(error)}`);
  }
}

export function TrpcAuthInvariant(procedure: { mountPath: string; hasAuthContext: boolean; validatesInput: boolean; preservesRequestId: boolean }) {
  try {
    return procedure.mountPath === '/api/trpc/*' && procedure.hasAuthContext && procedure.validatesInput && procedure.preservesRequestId;
  } catch (error) {
    throw new Error(`tRPC auth invariant failed: ${String(error)}`);
  }
}
```

These invariants map directly to Phase 4 tests. `ThirteenLayerCoverageInvariant` protects the VIYO protocol requirement to classify every layer; `BillingTimingInvariant` enforces the PO no-charge-on-provider-failure correction; `ProviderDefaultsInvariant` locks the provider tier defaults; `GeminiEmbeddingInvariant` prevents OpenAI from becoming a hard cache-lookup dependency; and `TrpcAuthInvariant` protects the minimal tRPC island from bypassing validation, request ID propagation, or authentication.

## 10. Phase 4 Incremental Record Requirements

Phase 4 must create `docs/internal/t46-phase4-incremental-record.md` before production code changes begin. The record must be updated after each implemented component group, not at the end. Each entry must include the component, file paths touched, linked wiring layers, test added or planned, and any gap discovered. This directly implements the PO reminder that internal records are incremental during Phase 4.

| **Record Event** | **When It Must Be Written** | **Minimum Content** |
| :--- |---|---|
| **Phase 4 start** | Before first production code edit. | Approved Phase 2 and Phase 3 artifact paths, PO approval timestamp, and implementation boundary. |
| **Shared contract completed** | After schema and exports are written. | Paths, contract summary, validation command planned or run. |
| **tRPC mount completed** | After procedure and mount are written. | Mount path, auth path, middleware ordering, test file. |
| **Router services completed** | After each service cluster is written. | Service files, linked layers, behavior covered, test status. |
| **Billing timing completed** | Immediately after token path is implemented. | Evidence that failure path does not call deduction and success path deducts after provider response. |
| **Gap detected** | Immediately when a missing table, API, config, or dependency is discovered. | Gap classification, blocking status, mitigation, and whether PO approval is required. |
| **Phase 4 exit** | Before Phase 5 begins. | Full file list, tests passing/failing, deferred items, and protocol status. |

## 11. Known Gaps and Non-Implementation Boundaries

| **Item** | **Classification** | **Phase 4 Handling** |
| :--- |---|---|
| **True token hold ledger** | Deferred unless existing approved primitive is discovered. | Use deduct-after-success for T46; do not add new billing schema without PO approval. |
| **Curator queue and admin review UI** | Potential follow-up gap. | Verify existence. If absent, emit metadata only and log gap; do not create unapproved tables or admin pages. |
| **External alerting for Tier 1 fallback rate** | Deployment/observability gap if no current alert channel exists. | Emit structured event fields now; document missing PagerDuty/Sentry rule as follow-up if needed. |
| **Frontend generation UI integration** | Out of T46 implementation scope unless a concrete existing call site is discovered. | Re-grep before Phase 4 exit; if discovered, stop and request PO revision. |

## 12. PO Approval Request

Please approve or reject this Phase 3 Global Wiring Blueprint. Approval authorizes Phase 4 implementation strictly within this blueprint, including the deduct-after-success billing path, Gemini-first embeddings, explicit provider-tier defaults, minimal tRPC island, and the required incremental Phase 4 internal record. No Phase 4 implementation will begin until PO approval is received.

## References

[^1]: `docs/internal/t46-phase2-architecture-plan.md`, corrected Phase 2 approval packet incorporating PO ruling received 2026-04-28.
[^2]: `/home/ubuntu/skills/viyo-development-protocol-v2/SKILL.md`, Phase 3 Global Wiring Blueprint requirements, lines 248-259; `/home/ubuntu/skills/viyo-development-protocol-v2/references/cross-system-wiring-checklist.md`, lines 1-23.
[^3]: `apps/worker/src/lib/token-engine.ts`, lines 72-192 and 245-270, showing billing status checks, `deductTokens`, and balance lookup but no exported hold/reservation primitive.
[^4]: `packages/db/src/schema/image-intelligence.ts` and `packages/db/drizzle/0007_t45_composite_database_foundation.sql`, T45 `image_prompt_patterns` schema and indexes used by the router cache.
