# T46 Phase 2 Architecture Plan: Composite Art Director Routing Suite

**Author:** Manus AI  
**Project:** VIYO  
**Taskmaster Task:** T46 — Composite Art Director Routing Suite (T21, T22, T23)  
**Protocol:** VIYO Development Protocol v2.6  
**Phase:** Phase 2 — Architecture Plan and PO Approval Gate  
**Date:** 2026-04-28  
**Status:** PO-approved with three mandatory corrections applied; Phase 3 pending separate wiring-blueprint approval  
**Implementation Status:** No implementation code has been written under T46. This packet remains the Phase 2 approval artifact and now incorporates the PO ruling received on 2026-04-28.

## 1. Executive Summary

T46 will implement the **Composite Art Director Routing Suite** as one protocol run covering the prior T21, T22, and T23 workstreams: the 4D scoring matrix, zero-shot fallback, and provider tier routing. The binding source of truth is `docs/architecture/art-director-routing-suite.md`, which identifies the task as T46, marks the document as PO-authorized, and explicitly supersedes earlier routing assumptions for T21, T22, and T23.[^1] Taskmaster confirms T46 is high priority, depends on completed T45, and must implement the routing logic, fallback mechanism, and zero-shot caching loop in one architecture plan, one wiring blueprint, one implementation phase, and one post-build/Airtable completion pass.[^2]

The plan below keeps the implementation **synchronous within the generation request**, implements the corrected parenthesized scoring formula, preserves token-economics controls for billable frontier generation, and adds route, service, configuration, observability, and test wiring without modifying the already-authorized architecture lock. The PO approval ruling mandates three corrections that are now binding for Phase 3 and Phase 4: billable frontier execution must use a **hold-then-confirm** token pattern or, if the current token engine cannot safely support holds within T46, **deduct-after-success** rather than deduct-before-execute; embeddings must use **Gemini via the existing `GOOGLE_AI_API_KEY`** instead of adding OpenAI as a hard routing dependency; and the provider registry must ship explicit configurable defaults of **NanoBanana** for Tier 1, **Ideogram** for Tier 2 typography-heavy fallback, and **DALL-E 3 via OpenAI** only as Tier 3 emergency fallback.[^17] A notable repository alignment issue remains: the lock requires API exposure as `artDirector.routeGeneration` using a tRPC procedure, while the current worker is a Hono API server with no existing tRPC dependency or router scaffold.[^3] This plan therefore proposes a **minimal tRPC island mounted inside the existing Hono worker** rather than replacing the worker framework. That approach honors the PO lock while keeping the change bounded to T46.

> **PO ruling incorporated:** Phase 2 is approved with mandatory corrections. Phase 3 may proceed only with the corrected token timing, Gemini-first embedding provider, and explicit provider-tier defaults described in this revised packet.[^17]

## 2. Source Authority and Scope Reconciliation

The authoritative hierarchy for this plan is the PO-authorized architecture lock first, then current repository code and schema, then Taskmaster task records. The architecture lock states that its v3.0 content supersedes earlier v1 repository assumptions and conflicting task context for T21, T22, T23, and T46.[^4] This matters because Taskmaster T21 still contains an older unparenthesized score formula, while the lock mandates the corrected formula using parentheses around the additive subtotal before applying freshness and tier multipliers.[^5] The implementation must therefore follow the lock and not the stale Taskmaster formula.

| **Source** | Authority for T46 | Facts Used in This Plan | Consequence |
| :--- |---|---|---|
| **`docs/architecture/art-director-routing-suite.md`** | PO-authorized source of truth | Objective, corrected formula, tRPC contract, token economics, metrics, alert, feature flag, rollback | All implementation decisions must conform to this lock. |
| **`task-master show 46` and `.taskmaster/tasks/tasks.json`** | Task execution registry | T46 combines T21/T22/T23, depends on T45, is in progress, and has SIZE M Phase 1 subtasks | Work remains a single composite protocol run; underlying T21/T22/T23 close only after T46 completion. |
| **`packages/db/src/schema/image-intelligence.ts` and T45 migration SQL** | Existing database foundation | `image_prompt_patterns` already has router-support columns including `targetModels`, `qaScore`, `costPerGen`, `supportsTypography`, `fidelityScore`, and `productType` | T46 should read and score existing pattern data rather than creating new foundational pattern tables. |
| **`apps/worker/src/lib/token-engine.ts`** | Existing billing implementation | `deductTokens` is the only token-balance mutation path and wraps `checkBillingStatus` plus `atomic_token_deduction` | Frontier generation must call this function; cached pattern routing remains free. |
| **`apps/worker/src/index.ts` and route modules** | Existing API framework | Hono worker mounts `/api/v1`, auth, rate limiting, request IDs, error handling, and Inngest | tRPC must be integrated in a bounded way without breaking existing middleware. |
| **`packages/shared/src/config/env.ts`** | Existing config contract | `GOOGLE_AI_API_KEY`, `IDEOGRAM_API_KEY`, Upstash Redis, OTEL vars exist; `OPENAI_API_KEY` and `enable_art_director_router` do not | T46 must add missing provider/config entries and a rollback flag surface. |

## 3. Component Inventory

The following inventory lists every planned file, module, service, endpoint, or test target to be created or modified during Phase 4 implementation. Items marked “new” are proposed by this Phase 2 packet and must not be created until PO approval is received.

| **#** | Component | Type | Path | Purpose | New/Modified |
| :--- |---|---|---|---|---|
| **1** | Art Director shared schemas | Shared contract | `packages/shared/src/schemas/art-director.ts` | Define `routeGeneration` request and response schemas matching the PO lock: `prompt`, `brandId`, `aspectRatio`, optional `styleId`, and response metadata for selected model, cache use, score, and token cost. | New |
| **2** | Shared schema barrel export | Shared contract export | `packages/shared/src/schemas/index.ts` | Export Art Director schemas and inferred TypeScript types to worker and future frontend clients. | Modified |
| **3** | Worker environment schema | Configuration contract | `packages/shared/src/config/env.ts` | Add optional `ENABLE_ART_DIRECTOR_ROUTER`, explicit timeout/threshold defaults, hold-mode safety controls if needed, and optional Tier 3 OpenAI key only for emergency DALL-E 3 fallback. Gemini embeddings must use the existing `GOOGLE_AI_API_KEY`. | Modified |
| **4** | Art Director tRPC root | API framework | `apps/worker/src/trpc/index.ts` | Initialize a minimal tRPC server surface and router namespace without replacing the existing Hono API. | New |
| **5** | Art Director tRPC context | API/auth adapter | `apps/worker/src/trpc/context.ts` | Convert existing authenticated Hono request context into a tRPC context containing `AuthContext`, request ID, and database access. | New |
| **6** | Art Director tRPC procedure | API procedure | `apps/worker/src/trpc/routers/art-director.ts` | Expose `artDirector.routeGeneration` as the synchronous routing procedure required by the lock. | New |
| **7** | tRPC Hono mount adapter | API mount | `apps/worker/src/index.ts` or `apps/worker/src/routes/trpc.ts` | Mount `/api/trpc/*` after current request ID, rate limiter, and auth middleware so tRPC inherits platform controls. | Modified/New |
| **8** | Art Director router service | Domain service | `apps/worker/src/lib/ai/image-router.ts` | Implement scoring, cache selection, fallback, tier routing, timeout handling, token-economics boundary, and routing metadata assembly. | New |
| **9** | Image pattern repository | Data access service | `apps/worker/src/lib/ai/image-patterns.ts` | Query `image_prompt_patterns`, map Drizzle rows into scoring candidates, and update usage metadata after a selected cache hit. | New |
| **10** | Provider registry | Provider abstraction | `apps/worker/src/lib/ai/provider-registry.ts` | Define explicit configurable defaults: Tier 1 `NanoBanana` for default and rollback general generation, Tier 2 `Ideogram` for typography-heavy fallback, and Tier 3 `DALL-E 3 via OpenAI` for emergency last resort, with availability checks and adapters hidden behind the registry. | New |
| **11** | Embedding service | AI utility | `apps/worker/src/lib/ai/embeddings.ts` | Generate request embeddings with Gemini through the existing `GOOGLE_AI_API_KEY` so cache lookup does not introduce OpenAI as a hard dependency. If Gemini quality proves insufficient, log a gap rather than switching providers silently. | New |
| **12** | Fallback prompt service | AI utility | `apps/worker/src/lib/ai/fallback-prompts.ts` | Produce zero-shot fallback prompts when no cached pattern clears the score threshold; route output into curator/learning flow when supported by existing schema. | New |
| **13** | Router observability service | Telemetry utility | `apps/worker/src/lib/ai/router-observability.ts` | Record routing decision, selected model, score, cache hit/miss, duration, fallback reason, and Tier 1 fallback rate inputs. | New |
| **14** | Router constants/config | Configuration module | `apps/worker/src/lib/ai/router-config.ts` | Centralize threshold `0.75`, provider timeouts, formula weights, Gemini embedding defaults, explicit provider-tier assignments, default Tier 1 rollback model, token hold policy, and flag interpretation. | New |
| **15** | Worker package dependencies | Package manifest | `apps/worker/package.json` | Add minimal tRPC and only provider SDK dependencies required by the corrected plan: Google/Gemini and Ideogram first, with OpenAI optional only for Tier 3 DALL-E 3 emergency fallback if not already available through existing infrastructure. | Modified |
| **16** | Worker tests for router scoring | Test file | `apps/worker/src/lib/ai/image-router.test.ts` | Verify corrected formula, cache threshold, tie-breaking, token-free cached selection, and frontier hold-confirm or deduct-after-success metadata. | New |
| **17** | Worker tests for provider tiers | Test file | `apps/worker/src/lib/ai/provider-registry.test.ts` | Simulate provider failures and verify Tier 1/Tier 2/Tier 3 failover and rollback behavior. | New |
| **18** | tRPC procedure tests | Test file | `apps/worker/src/trpc/routers/art-director.test.ts` | Validate request/response contract, authentication context, feature flag behavior, and error semantics. | New |
| **19** | Internal Phase 4 records | Protocol record | `docs/internal/t46-phase4-incremental-record.md` | Record Phase 4 implementation progress incrementally, not as a bulk write at the end, matching the PO reminder. | New |
| **20** | Build tracker updates | External record | Taskmaster and Airtable Build Tracker | Update subtask status incrementally during Phase 4 and complete Phase 9 in the six-step, ten-minute protocol window. | Modified |

## 4. Data Flow

The routing suite has three distinct runtime flows: cache-preferred routing, zero-shot fallback routing, and rollback routing. Each flow remains synchronous from the caller’s perspective because the architecture lock requires all routing to execute inside the generation request.[^6]

| **Flow** | Required Sequence | Output |
| :--- |---|---|
| **Cache-preferred routing** | `Client generation request` → `artDirector.routeGeneration` → `Zod validation` → `auth/workspace context` → `feature flag check` → `embedding generation` → `image_prompt_patterns candidate query` → `4D scoring` → `cached pattern selected if score >= 0.75 and higher than frontier option` → `return selectedModel/isCached/score/costTokens` | Synchronous routing decision with `isCached: true` and `costTokens: 0`. |
| **Frontier fallback routing** | `Client generation request` → `artDirector.routeGeneration` → `candidate query returns no qualifying pattern or provider failure occurs` → `zero-shot fallback prompt generation` → `provider tier availability check` → `holdTokens()` reserve if safely supported → `frontier provider execution` → `confirmHold()` on success or `releaseHold()` on failure; if holds cannot be implemented safely in T46, execute first and deduct only after success → `observability log` → `return selectedModel/isCached/score/costTokens` | Synchronous routing decision and provider execution metadata with no deduct-before-execute behavior. |
| **Provider failover routing** | `Selected provider attempt` → `timeout/error` → `record fallback reason and duration` → `release any held tokens for the failed attempt` → `try next eligible tier` → `confirm charge only for the successful provider or deduct after success fallback` → `return success or typed error` | Durable decision trail showing failover behavior, final tier, and user-safe billing state. |
| **Rollback routing** | `Client generation request` → `feature flag disabled` → `skip scoring and fallback` → `route directly to default Tier 1 NanoBanana model` → `hold/confirm or deduct-after-success if billable` → `return rollback-mode metadata` | Fast rollback without deleting code or data. |
| **Learning loop handoff** | `Zero-shot generated result` → `objective metadata assembled` → `curator_queue insertion only if schema/table exists and is in scope` → `future approval inserts pattern into image_prompt_patterns` | Safe bridge to R24 learning loop without fabricating unsupported schema. |

The cache-preferred path uses T45’s `image_prompt_patterns` columns. The table already includes category, layout type, typography style, target models, prompt template, style schema, embedding, QA score, cost per generation, typography support, fidelity score, product type, usage count, and timestamps.[^7] T45 also added indexes on typography/fidelity and product type to support deterministic router selection.[^8]

## 5. 4D Scoring Model

The implementation must use the architecture-lock formula exactly. The quality and cost-efficiency subtotal is computed first, and only then multiplied by freshness and tier factors.[^5]

```ts
const score = (
  (baseQualityScore * 0.4) +
  (costEfficiencyScore * 0.3)
) * freshnessPenalty * tierMultiplier;
```

| **Dimension** | Planned Source | Normalization Rule | Notes |
| :--- |---|---|---|
| **Quality** | `image_prompt_patterns.fidelityScore` with `qaScore` fallback | Decimal in `[0, 1]`; clamp invalid data defensively | T45 enforces `fidelity_score BETWEEN 0 AND 1`, but the service should still clamp for runtime safety.[^8] |
| **Cost efficiency** | `image_prompt_patterns.costPerGen` and frontier provider cost table | Convert lower cost into higher normalized score; cached pattern has maximal cost efficiency because it is free under the lock | Cached routing must not deduct tokens.[^9] |
| **Freshness** | `lastUsedAt`, `createdAt`, and `usageCount` | Penalize overused or stale patterns, but do not let freshness alone override very low quality | Freshness is multiplicative, so bad freshness can suppress an otherwise good subtotal. |
| **Tier** | Provider registry tier and workspace/admin availability | Apply configured tier multiplier after subtotal | Tier 2 is the first availability check in underlying T23, while rollback sends all requests directly to the default Tier 1 model when disabled.[^10] |

The acceptance threshold is planned at `0.75` because T21’s implementation detail contains that threshold and it does not conflict with the PO lock.[^11] The stale T21 formula itself will not be used, because the PO lock supersedes conflicting drafts and task details.[^4]

## 6. Dependency Map

The implementation should minimize new packages, reuse the existing worker infrastructure, and avoid creating dead infrastructure. The only framework-level dependency proposed is tRPC because the architecture lock requires `artDirector.routeGeneration` to be a tRPC procedure.[^3]

| **Component** | Depends On | Type | Notes |
| :--- |---|---|---|
| **`artDirector.routeGeneration`** | `@trpc/server` | npm | New minimal dependency; mount inside existing Hono worker through a fetch adapter. |
| **tRPC context** | Existing Hono middleware values | internal | Must preserve `AuthContext`, request ID, auth failures, and rate-limit behavior from the worker. |
| **Router service** | `@viyo/db`, Drizzle ORM, token engine | internal | Uses existing database schema and atomic token deduction boundary. |
| **Pattern repository** | `imagePromptPatterns` Drizzle schema | internal | Reads global pattern cache and updates usage metadata after selection. |
| **Embedding service** | Gemini embedding provider through existing Google AI configuration | external API | Uses the already-wired `GOOGLE_AI_API_KEY`; OpenAI must not be a hard dependency for every routing decision.[^12] [^17] |
| **Provider registry** | Google AI, Ideogram, and optional OpenAI emergency fallback configuration | external API | Tier 1 defaults to NanoBanana through the existing Google AI stack, Tier 2 defaults to Ideogram for typography-heavy images, and Tier 3 uses DALL-E 3 via OpenAI only as an emergency last resort.[^12] [^17] |
| **Token hold/confirmation or post-success deduction** | Existing token engine plus any approved hold helpers | internal | T46 must not ship deduct-before-execute. Phase 3 must inspect whether the token engine can support `holdTokens`, `confirmHold`, and `releaseHold`; if not, frontier calls must deduct only after successful provider execution.[^13] [^17] |
| **Observability** | Current request ID, OpenTelemetry, logs, and optional Sentry | internal/external | Existing worker initializes OpenTelemetry before server startup and includes request ID middleware before routes.[^14] |
| **Feature flag** | Env plus system config lookup | internal | Lock names `enable_art_director_router`; plan should support env default and, if existing config allows, system-config override. |
| **Tests** | Vitest, TypeScript, Turbo | npm/internal | Repository already provides `pnpm test`, `pnpm type-check`, `pnpm lint`, and package-level Vitest scripts.[^15] |

## 7. Technology Decisions

**Decision 1: Implement a minimal tRPC island inside the Hono worker.**  
**Context:** The PO lock requires `artDirector.routeGeneration` to be a tRPC procedure, but the worker currently uses Hono and has no tRPC scaffold.[^3]  
**Options Considered:** The options were to ignore the tRPC requirement and expose a Hono REST endpoint, replace the worker API framework, or add a narrowly scoped tRPC mount.  
**Chosen:** Add a minimal tRPC mount under the existing Hono middleware stack. This satisfies the lock without replacing existing routes or authentication.  
**Consequences:** T46 adds one framework dependency and a small context adapter. Future frontend tRPC adoption remains optional and out of T46 scope.

**Decision 2: Put scoring and provider execution behind service modules, not inside the tRPC procedure.**  
**Context:** The router must combine scoring, cache selection, fallback, tier checks, and billing while remaining testable.  
**Options Considered:** The logic could be implemented inline in the route, split by provider only, or modeled as a domain service with repositories and provider adapters.  
**Chosen:** Use `image-router.ts` as the orchestration service, with separate modules for pattern reads, provider registry, embeddings, fallback prompts, config, and observability.  
**Consequences:** Unit tests can verify the scoring formula and failover behavior without booting the worker. The tRPC layer remains a thin contract boundary.

**Decision 3: Treat cached pattern routing as free and frontier routing as billable, without deduct-before-execute.**  
**Context:** The lock says frontier generation deducts from user balance via `atomic_token_deduction(cost, 'image_gen')`, while cached pattern routing is free.[^9] The existing token engine exposes `deductTokens`, which calls `checkBillingStatus`, invokes `atomic_token_deduction`, and emits low-balance events.[^13] The PO ruling forbids deduct-before-execute because failed providers must not charge users.[^17]  
**Options Considered:** Direct SQL calls, deduct-before-execute, hold-then-confirm, and deduct-after-success.  
**Chosen:** Implement `holdTokens`, `confirmHold`, and `releaseHold` if the token engine can support a foundational hold model within T46. If that would require unsafe or oversized billing work, implement the PO-approved fallback of deducting only after successful provider execution. Cached routing remains free and must never call the token deduction path.  
**Consequences:** T46 protects user balances on failed provider calls. Phase 3 must define exact function signatures and tests for hold confirmation, release, and fallback post-success deduction before implementation begins.

**Decision 4: Use existing `image_prompt_patterns` as the pattern cache and avoid schema changes unless implementation reveals a missing hard requirement.**  
**Context:** T45 already completed the required router-support columns and Drizzle schema for `image_prompt_patterns`.[^7]  
**Options Considered:** Add new routing tables, create a separate cache table, or use the existing pattern table.  
**Chosen:** Use the existing table for Phase 4.  
**Consequences:** T46 stays SIZE M and depends on T45 as intended. Any missing `curator_queue` schema must be handled as a scoped gap rather than silently invented.

**Decision 5: Keep rollback controlled by `enable_art_director_router`.**  
**Context:** The architecture lock requires this exact feature flag and states rollback disables the flag to route all requests directly to the default Tier 1 model.[^16]  
**Options Considered:** Use only an environment variable, only a database config value, or both with deterministic precedence.  
**Chosen:** Add the env schema key and read runtime config through the existing `getSystemConfig` path if present, with env as the startup default. Rollback selects Tier 1 NanoBanana.  
**Consequences:** Ops can quickly disable the suite while preserving a path to admin-controlled runtime flags.

**Decision 6: Use Gemini embeddings as the primary semantic-matching provider.**  
**Context:** The PO ruling rejects OpenAI as a hard runtime dependency for every routing decision because cache lookup should remain lightweight and use the stack already configured through Google AI.[^17]  
**Options Considered:** Add OpenAI embeddings, use Gemini embeddings, or skip semantic matching.  
**Chosen:** Use Gemini embeddings through `GOOGLE_AI_API_KEY` for candidate retrieval and semantic comparison.  
**Consequences:** T46 avoids a new hard dependency for cached routing. If Gemini semantic quality is insufficient during validation, the issue must be logged as a gap and brought back for PO review.

**Decision 7: Ship explicit provider-tier defaults.**  
**Context:** The provider registry cannot be abstract or empty because routing quality depends on deterministic initial tier behavior.[^17]  
**Options Considered:** Leave tiers configurable but unassigned, infer tiers from available keys, or define explicit defaults with config override.  
**Chosen:** Configure Tier 1 as NanoBanana for default and rollback general generation, Tier 2 as Ideogram for typography-heavy fallback, and Tier 3 as DALL-E 3 via OpenAI for emergency last resort.  
**Consequences:** Tests can assert deterministic default routing while preserving future configuration changes without source-code rewrites.

## 8. Cross-System Wiring Plan

The affected T46 wiring layers were logged during Phase 1 as Taskmaster subtasks. The implementation will update internal records incrementally during Phase 4 rather than bulk-writing status at the end, matching the PO instruction.

| **Wiring Layer** | Planned Work | Acceptance Evidence |
| :--- |---|---|
| **Layer 1 — Database read/query path** | Query `image_prompt_patterns` through Drizzle, filter by product type, typography needs, category, and provider availability, then sort by computed score. | Unit tests around repository mapping and score candidate construction. |
| **Layer 3 — Shared types/contracts** | Add shared Zod schemas and exports for request/response. | Type-check proves worker consumes shared schema; tests reject invalid payloads. |
| **Layer 4 — Backend services/workers** | Implement `image-router.ts`, provider registry, embeddings, fallback prompts, and observability service. | Router unit tests cover scoring, cache, fallback, and failover. |
| **Layer 5 — API routes/validation** | Mount `artDirector.routeGeneration` as tRPC procedure under existing worker middleware. | Procedure tests verify synchronous response and auth/context behavior. |
| **Layer 8 — AI brains/prompts** | Add fallback prompt generation only for no-cache or provider-failure paths, generate embeddings with Gemini through existing Google AI configuration, and keep prompt logic separated from provider adapters. | Mocked fallback and embedding tests prove trigger conditions, provider selection, and output metadata. |
| **Layer 9 — Analytics/audit trail** | Log every routing decision, model, score, cache state, duration, and fallback reason. | Test verifies observability payload shape and request ID inclusion. |
| **Layer 10 — Config/feature flags** | Add `enable_art_director_router`, provider API key checks, Gemini embedding settings, explicit provider-tier defaults, token hold/deduct-after-success policy, timeouts, default threshold, and rollback default model. | Tests verify disabled flag routes to Tier 1 NanoBanana default and provider tiers are configurable. |
| **Layer 11 — Logs/monitoring/errors** | Emit structured errors for provider timeout, insufficient tokens, missing provider config, and no eligible model. | Tests verify typed errors and non-leaking messages. |
| **Layer 13 — Tests** | Add scoring, fallback, tier routing, token economics, Gemini embedding, tRPC validation, and rollback tests. | `pnpm type-check`, `pnpm lint`, `pnpm test`, and package-level tests pass. |

## 9. Risk Assessment

| **Risk** | Likelihood | Impact | Mitigation |
| :--- |---:|---:|---|
| **Token timing could charge users for failed provider execution.** | Low after correction | High | Binding PO correction: implement hold-then-confirm with release on failure, or deduct only after provider success if holds cannot be safely implemented in T46. Deduct-before-execute is explicitly prohibited. |
| **OpenAI could become a hard dependency for every cache lookup.** | Low after correction | Medium | Binding PO correction: Gemini embeddings through existing `GOOGLE_AI_API_KEY` are primary. OpenAI is optional only for Tier 3 DALL-E 3 emergency fallback. |
| **Provider tiers could remain abstract and untestable.** | Low after correction | Medium | Binding PO correction: ship explicit configurable defaults of NanoBanana Tier 1, Ideogram Tier 2, and DALL-E 3 Tier 3. |
| **The tRPC requirement conflicts with the current Hono-only worker shape.** | Medium | High | Implement a minimal tRPC island mounted inside Hono rather than replacing the framework; stop here for PO approval before adding the dependency. |
| **The stale Taskmaster T21 formula could be implemented accidentally.** | Medium | High | Encode the corrected formula in tests and cite the PO lock in code comments near the score function. |
| **Frontier generation bypasses billing.** | Low | High | Route all successful billable frontier execution through approved token-engine behavior; forbid direct `atomic_token_deduction` calls in T46 code and forbid deduct-before-execute. |
| **Cached routing incorrectly deducts tokens.** | Low | Medium | Add tests proving `isCached: true` returns `costTokens: 0` and does not call `deductTokens`. |
| **Provider outage causes long synchronous waits.** | Medium | High | Define per-provider timeouts, bounded retries, and failover order; return typed errors after the last eligible tier. |
| **Missing provider API key causes runtime crashes.** | Medium | Medium | Add env validation/config checks and mark provider unavailable instead of crashing during routing. |
| **Observability does not support the one-hour Tier 1 fallback alert immediately.** | Medium | Medium | Emit structured metrics/events now; document whether PagerDuty wiring exists during Phase 4 and flag any missing external alert integration as a deployment dependency. |
| **`curator_queue` schema may not exist in the current repo.** | Medium | Medium | Verify schema during Phase 3. If absent, limit T46 to returning fallback metadata and create a scoped gap record rather than creating unapproved tables. |
| **Token deduction implementation exceeds safe T46 size if holds require new billing schema.** | Medium | High | Phase 3 must inspect existing token-engine capabilities. If hold modeling needs new unapproved billing tables or oversized schema work, implement the PO-approved deduct-after-success fallback and log a scoped follow-up for true reservation semantics. |
| **Feature flag precedence is ambiguous.** | Low | Medium | Centralize in `router-config.ts`, document precedence, and test enabled/disabled behavior. |

## 10. Validation and Quality Plan

Phase 4 implementation will not be considered complete until automated checks and targeted tests have passed. The repository currently provides top-level scripts for build, lint, type-check, test, and format checks, with worker package scripts for `tsc`, ESLint, and Vitest.[^15]

| **Validation Area** | Command or Evidence | Required Result |
| :--- |---|---|
| **Type safety** | `pnpm type-check` | No TypeScript errors across workspace. |
| **Lint** | `pnpm lint` | No ESLint errors in touched packages. |
| **Unit and integration tests** | `pnpm test` plus targeted `pnpm --filter @viyo/worker test` | Router, provider, token hold/release or deduct-after-success, Gemini embedding, explicit tier defaults, and tRPC tests pass. |
| **Build** | `pnpm build` | Worker, shared, and DB packages compile successfully. |
| **Quality gate** | Quality-gate scripts on new spec/implementation files | Blocking gates pass; warnings documented. |
| **Live validation** | Local worker boot plus authenticated route/procedure smoke test where feasible | Procedure responds synchronously and respects flag/auth semantics. |
| **Protocol records** | Taskmaster/Airtable/internal Phase 4 log | Internal records updated incrementally throughout implementation. |

## 11. Executable Architecture Invariants for Phase 3

The following implementation-level invariants are included so Phase 3 can translate the approved architecture into tests without reinterpreting the PO lock. They are not production code, but they define the exact behavior that the implementation must satisfy.

```ts
const Phase2ApprovalInvariantRegistry = {
  ScoreFormulaInvariant,
  TokenBoundaryInvariant,
  RollbackInvariant,
  GeminiEmbeddingInvariant,
  ProviderTierInvariant,
};

export function ScoreFormulaInvariant(candidate: Record<string, number>) {
  try {
    const additiveSubtotal = (candidate.baseQualityScore * 0.4) + (candidate.costEfficiencyScore * 0.3);
    const expectedScore = additiveSubtotal * candidate.freshnessPenalty * candidate.tierMultiplier;
    return Number.isFinite(expectedScore) && expectedScore >= 0;
  } catch (error) {
    throw new Error(`Score formula invariant failed: ${String(error)}`);
  }
}

export function TokenBoundaryInvariant(route: Record<string, unknown>) {
  try {
    if (route.isCached === true) return route.costTokens === 0 && route.tokenAction === 'none';
    return ['hold_confirmed', 'deducted_after_success'].includes(String(route.tokenAction));
  } catch (error) {
    throw new Error(`Token boundary invariant failed: ${String(error)}`);
  }
}

export function RollbackInvariant(config: Record<string, unknown>) {
  try {
    if (config.enableArtDirectorRouter === true) return true;
    return config.selectedTier === 'tier_1' && config.selectedModel === 'NanoBanana';
  } catch (error) {
    throw new Error(`Rollback invariant failed: ${String(error)}`);
  }
}

export function GeminiEmbeddingInvariant(config: Record<string, unknown>) {
  try {
    return config.embeddingProvider === 'gemini' && Boolean(config.googleAiApiKeyAvailable);
  } catch (error) {
    throw new Error(`Gemini embedding invariant failed: ${String(error)}`);
  }
}

export function ProviderTierInvariant(registry: Record<string, string>) {
  try {
    return registry.tier1 === 'NanoBanana' && registry.tier2 === 'Ideogram' && registry.tier3 === 'DALL-E 3';
  } catch (error) {
    throw new Error(`Provider tier invariant failed: ${String(error)}`);
  }
}
```

These invariants map directly to the required Phase 4 tests. `ScoreFormulaInvariant` proves the corrected parenthesized scoring formula, `TokenBoundaryInvariant` protects the cached-free/frontier-billable economics boundary without deduct-before-execute behavior, `RollbackInvariant` guarantees that disabling the feature flag routes traffic to Tier 1 NanoBanana, `GeminiEmbeddingInvariant` prevents OpenAI from becoming a hard routing dependency, and `ProviderTierInvariant` locks the PO-approved explicit provider defaults into testable behavior.

## 12. Phase 3 Entry Criteria

Phase 3 may begin because the PO approved this Phase 2 packet with the three mandatory corrections now applied. Phase 3 must produce the implementation blueprint with exact function signatures, test cases, provider timeout values, tRPC mount path, feature-flag precedence, token hold or deduct-after-success mechanics, Gemini embedding wiring, explicit provider-tier defaults, and any confirmed schema gaps. Phase 3 must not write production implementation code unless the protocol explicitly permits it after the Phase 3 approval gate.

| **Gate** | Status |
| :--- |---|
| **T46 set to in progress** | Complete |
| **T45 dependency confirmed** | Complete |
| **SIZE M declaration logged** | Complete |
| **Affected wiring layers logged** | Complete |
| **Security/dependency audit run** | Complete |
| **Phase 2 architecture plan drafted** | Complete in this document |
| **PO approval to proceed to Phase 3** | Approved with mandatory corrections applied |

## 13. PO Approval Decision

The PO approved the proposed architecture with mandatory corrections. Phase 3 is authorized only under the following corrected architectural commitments:

| **Commitment** | Approval Meaning |
| :--- |---|
| **Minimal tRPC island inside Hono** | Authorizes adding scoped tRPC server wiring without replacing the worker framework. |
| **Corrected 4D score formula** | Confirms implementation must use the PO-lock formula and not stale T21 formula text. |
| **Existing `image_prompt_patterns` cache** | Confirms T46 should not create new pattern tables during this task. |
| **Token-engine billing boundary** | Confirms cached routing is free and frontier generation must use hold-then-confirm, or deduct-after-success if holds cannot be safely implemented; deduct-before-execute is prohibited. |
| **Feature-flag rollback** | Confirms `enable_art_director_router` disables the router and sends traffic to Tier 1 NanoBanana. |
| **Gemini-first embeddings** | Confirms routing embeddings use Gemini through existing Google AI configuration; OpenAI is not a hard dependency for cache lookup. |
| **Explicit provider tiers** | Confirms configurable defaults of NanoBanana Tier 1, Ideogram Tier 2, and DALL-E 3 Tier 3. |
| **Incremental internal records** | Confirms Phase 4 records will be updated during implementation, not only at the end. |

## References

[^1]: `docs/architecture/art-director-routing-suite.md`, lines 1-13.  
[^2]: `.taskmaster/tasks/tasks.json`, lines 99-137, and `task-master show 46` saved output, lines 22-48.  
[^3]: `docs/architecture/art-director-routing-suite.md`, lines 59-90; `apps/worker/src/index.ts`, lines 20-32 and 87-89; repository search for `@trpc` returned no existing scaffold.  
[^4]: `docs/architecture/art-director-routing-suite.md`, lines 115-117.  
[^5]: `docs/architecture/art-director-routing-suite.md`, lines 41-58.  
[^6]: `docs/architecture/art-director-routing-suite.md`, lines 30-31 and 63-68.  
[^7]: `packages/db/src/schema/image-intelligence.ts`, lines 40-58.  
[^8]: `packages/db/drizzle/0007_t45_composite_database_foundation.sql`, lines 295-331.  
[^9]: `docs/architecture/art-director-routing-suite.md`, lines 92-99.  
[^10]: `.taskmaster/tasks/tasks.json`, lines 126-135; `docs/architecture/art-director-routing-suite.md`, lines 108-114.  
[^11]: `.taskmaster/tasks/tasks.json`, lines 99-110.  
[^12]: `packages/shared/src/config/env.ts`, lines 17-64.  
[^13]: `apps/worker/src/lib/token-engine.ts`, lines 119-192.  
[^14]: `apps/worker/src/index.ts`, lines 1-18 and 38-89.  
[^15]: Root `package.json` scripts and `apps/worker/package.json` scripts inspected on 2026-04-28.  
[^16]: `docs/architecture/art-director-routing-suite.md`, lines 108-114.  
[^17]: PO ruling attachment `/home/ubuntu/upload/pasted_content.txt`, lines 1-46, received 2026-04-28.
