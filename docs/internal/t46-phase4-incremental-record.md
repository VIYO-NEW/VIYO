# T46 Phase 4 Incremental Implementation Record

**Project:** VIYO  
**Taskmaster Task:** T46 — Composite Art Director Routing Suite (T21, T22, T23)  
**Protocol:** VIYO Development Protocol v2.6  
**Phase:** Phase 4 — Implementation  
**Started:** 2026-04-28  
**Status:** In progress  

## 2026-04-28 — Phase 4 Start

Phase 4 began only after PO approval of the Phase 3 Global Wiring Blueprint. The implementation boundary is the approved T46 routing suite: shared Art Director route contracts, a minimal tRPC island inside the existing Hono worker, Gemini-first embedding support through `GOOGLE_AI_API_KEY`, cache-first `image_prompt_patterns` routing, NanoBanana → Ideogram → DALL-E 3 provider tier defaults, and deduct-after-success billing for billable frontier generation because the current token engine has no approved hold ledger.

| Item | Value |
|---|---|
| Approved Phase 2 artifact | `docs/internal/t46-phase2-architecture-plan.md` |
| Approved Phase 3 artifact | `docs/internal/t46-phase3-global-wiring-blueprint.md` |
| Production-code status at start | No T46 production implementation code written before this entry. |
| Billing constraint | Precheck balance before provider execution; call `deductTokens` only after provider success; never deduct on cached or failed provider paths. |
| Incremental-record rule | This file and the seven standing `docs/internal/` records must be updated as component groups are implemented, not bulk-written at the end. |


## 2026-04-28 — Shared Contract and Environment Wiring Completed

The shared Art Director route contract and startup environment wiring have been implemented as the first Phase 4 component group.

| Component | Files Touched | Wiring Layers | Validation |
|---|---|---|---|
| Shared request and response contract | `packages/shared/src/schemas/art-director.ts`, `packages/shared/src/schemas/index.ts` | Layer 3, Layer 5, Layer 13 | `pnpm --filter @viyo/shared type-check` passed. |
| Router configuration environment defaults | `packages/shared/src/config/env.ts` | Layer 10 | `pnpm --filter @viyo/shared type-check` passed. |

The shared contract exposes the required synchronous route inputs and outputs, including selected model, provider tier, cache state, score, token action, fallback reason, trace ID, route metadata, and trace metadata. The environment wiring adds the rollback flag, cache threshold, provider timeout, explicit NanoBanana → Ideogram → DALL-E 3 defaults, Gemini embedding model, and optional OpenAI key for emergency Tier 3 fallback while preserving the existing Google AI and Ideogram keys.


## 2026-04-28 — Worker Routing Service and tRPC Surface Completed

The worker-side Art Director router and minimal tRPC surface have been implemented as the second Phase 4 component group.

| Component | Files Touched | Wiring Layers | Validation |
|---|---|---|---|
| Router configuration and provider registry | `apps/worker/src/lib/ai/router-config.ts`, `apps/worker/src/lib/ai/provider-registry.ts` | Layer 3, Layer 10, Layer 13 | `pnpm --filter @viyo/worker type-check` passed after rebuilding shared declarations. |
| Gemini embedding and cache repository | `apps/worker/src/lib/ai/embeddings.ts`, `apps/worker/src/lib/ai/image-patterns.ts` | Layer 2, Layer 4, Layer 8 | `pnpm --filter @viyo/worker type-check` passed. |
| Corrected scoring and routing orchestration | `apps/worker/src/lib/ai/image-router.ts`, `apps/worker/src/lib/ai/fallback-prompts.ts`, `apps/worker/src/lib/ai/router-observability.ts` | Layer 3, Layer 5, Layer 8, Layer 11, Layer 13 | `pnpm --filter @viyo/worker type-check` passed. |
| tRPC API surface and Hono mount | `apps/worker/src/trpc/core.ts`, `apps/worker/src/trpc/context.ts`, `apps/worker/src/trpc/index.ts`, `apps/worker/src/trpc/routers/art-director.ts`, `apps/worker/src/index.ts` | Layer 5, Layer 6, Layer 7, Layer 13 | `pnpm --filter @viyo/worker type-check` passed. |

The implementation follows the approved Phase 2 and Phase 3 constraints: NanoBanana remains the Tier 1 rollback/default provider, Ideogram remains Tier 2 typography-oriented fallback, DALL-E 3 remains Tier 3 fallback, Gemini embeddings use the existing Google AI configuration, cached patterns are free, and frontier routes perform a billing precheck while preserving the approved deduct-after-success boundary for the eventual successful provider call. The `/api/trpc/*` mount is intentionally placed after request ID, logger, CORS, rate limiting, and authentication middleware so the tRPC island inherits existing worker tracing and auth semantics instead of bypassing them.

**Validation evidence:** `pnpm --filter @viyo/shared build` succeeded, followed by `pnpm --filter @viyo/worker type-check` succeeding.

## 2026-04-28 — Focused Worker Tests Added

Focused Vitest coverage has been added for the T46 Art Director routing suite. The tests validate provider precedence, rollback-provider behavior, typography-forward Ideogram selection, preferred-model fallback to DALL-E 3, deterministic zero-shot fallback prompt composition, missing-product defaulting, and the PO-approved parenthesized 4D scoring formula.

| Component | Files Touched | Wiring Layers | Validation |
|---|---|---|---|
| Focused routing tests | `apps/worker/src/lib/ai/art-director-routing.test.ts` | Layer 3, Layer 5, Layer 8, Layer 10, Layer 13 | `pnpm --filter @viyo/worker test -- src/lib/ai/art-director-routing.test.ts` passed with 8 tests. |
| Test-aware type validation | `apps/worker/src/lib/ai/art-director-routing.test.ts` | Layer 13 | `pnpm --filter @viyo/worker type-check` passed after test addition. |

The scoring test locks the corrected formula boundary by asserting that `(baseQualityScore * 0.4 + costEfficiencyScore * 0.3) * freshnessPenalty * tierMultiplier` yields `0.7436` for the representative Tier 1 cached candidate, preventing regression to the rejected unparenthesized formula.

## 2026-04-28 — Phase 4 Focused Validation Completed

The Phase 4 implementation has completed the focused validation suite required before handoff to Phase 5 review. The evidence file is `docs/internal/t46-phase4-validation-evidence.txt`.

| Validation Command | Result | Purpose |
|---|---:|---|
| `pnpm --filter @viyo/shared build` | Passed | Confirms the shared Art Director schemas and environment configuration build into package declarations consumed by worker code. |
| `pnpm --filter @viyo/worker type-check` | Passed | Confirms the worker tRPC island, routing services, provider registry, cache repository, Gemini embedding helper, and tests compile under strict TypeScript rules. |
| `pnpm --filter @viyo/worker test -- src/lib/ai/art-director-routing.test.ts` | Passed, 8 tests | Confirms deterministic provider precedence, rollback behavior, fallback prompt construction, and corrected scoring formula behavior. |

No production provider generation calls were executed. No token deduction was performed. The implementation remains aligned to the approved deduct-after-success boundary because tests validate routing decisions and score selection only.
