# T46 Phase 5 Code Review and Foundational Validation Record

**Task:** T46 — Composite Art Director Routing Suite (T21, T22, T23)  
**Phase:** Phase 5 — Code Review, Foundational Verification, and Live Validation  
**Date:** 2026-04-28  
**Prepared by:** Manus AI  
**Status:** **Phase 5 validation passed; PO approval required before Phase 6.**

## Executive Summary

Phase 5 reviewed the T46 implementation against the approved Phase 2 architecture plan and Phase 3 global wiring blueprint. The source review found that the implementation is wired through the shared schema contract, authenticated tRPC route, worker routing service, provider registry, router configuration, Gemini embedding helper, T45 image pattern repository, observability trace path, and focused routing tests. The repository validation suite passed across worker and monorepo lint, type-check, test, and build commands. A live local worker probe also confirmed that the public health endpoint responds and that the protected Art Director tRPC route fails closed with HTTP 401 when no Authorization header is provided.

No R32 implementation work was started during this phase. The earlier R32 activity was limited to pending/backlog procurement record ingestion in Airtable, after which T46 Phase 5 resumed.

## Phase 5 Evidence Matrix

| Evidence Area | Command or Review Surface | Result | Evidence Location |
|---|---:|---:|---|
| Shared package build | `pnpm --filter @viyo/shared build` | **Passed** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 3-7 |
| Worker lint | `pnpm --filter @viyo/worker lint` | **Passed** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 8-12 |
| Worker type-check | `pnpm --filter @viyo/worker type-check` | **Passed** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 13-16 |
| Focused routing tests | `pnpm --filter @viyo/worker test -- src/lib/ai/art-director-routing.test.ts` | **Passed, 8 tests** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 18-31 |
| Monorepo lint | `pnpm lint` | **Passed, 9 tasks** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 33-92 |
| Monorepo type-check | `pnpm type-check` | **Passed, 9 tasks** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 94-153 |
| Monorepo test | `pnpm test -- --passWithNoTests` | **Passed, 9 tasks** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 155-259 |
| Monorepo build | `pnpm build` | **Passed, 6 tasks** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 261-340 |
| Live local API probe | `GET /health` and unauthenticated `POST /api/trpc/artDirector.routeGeneration` | **Health 200; protected route 401** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 342-368 |
| Static wiring verifier | Temporary source-invariant verifier outside repo | **Passed, 11 invariant groups** | `docs/internal/t46-phase5-live-validation-evidence.txt`, lines 402-414 |

The static wiring verifier had several calibration iterations before the final pass because its initial anchors used outdated or imprecise names, such as `routerDecisionSchema` instead of `routeGenerationRoutingMetadataSchema`, and `input.workspaceId` instead of the implemented `context.auth.workspaceId`. Those failures were verifier-anchor mismatches, not application validation failures. The final verifier asserts the implementation names that are actually present in source and passed all eleven invariant groups.

## Source Review Findings

The shared contract is centralized in `packages/shared/src/schemas/art-director.ts`. It defines the Art Director model enum, provider tier enum, token action enum, fallback reason enum, route request schema, response schema, route metadata, and trace metadata. This satisfies the requirement that API validation and runtime typing share a single source contract rather than maintaining detached worker-only types.

The API boundary is mounted in `apps/worker/src/index.ts` through the tRPC island at `/api/trpc/*`. The worker applies request ID, CORS, rate limiting, and authentication middleware before protected routes. The tRPC context adapter in `apps/worker/src/trpc/context.ts` fails closed if authenticated Hono state is missing. The Art Director procedure in `apps/worker/src/trpc/routers/art-director.ts` consumes the shared input/output schemas, passes `ctx.auth` and `ctx.requestId` into the routing service, and maps service failures into typed tRPC errors.

The router orchestration in `apps/worker/src/lib/ai/image-router.ts` implements cache-first pattern retrieval, the corrected parenthesized 4D score formula, threshold-based cached/free routing, zero-shot fallback metadata generation, provider selection, and token-economics precheck. The file does **not** call `deductTokens`, which preserves the approved boundary that frontier generations may be prechecked during routing but must only deduct after a downstream provider success.

The provider tiering is split cleanly between `apps/worker/src/lib/ai/router-config.ts` and `apps/worker/src/lib/ai/provider-registry.ts`. Router configuration locks the PO-approved default providers as `nanobanana`, `ideogram`, and `dall-e-3`, reads the database-backed `enable_art_director_router` override, and falls back to environment configuration for threshold, timeout, and provider keys. Provider registry then turns those values into deterministic descriptors and handles typography-forward routing, default tier order, unavailable-provider fallthrough, and rollback provider selection.

The cache lookup path uses `apps/worker/src/lib/ai/embeddings.ts` and `apps/worker/src/lib/ai/image-patterns.ts`. The embedding helper uses the configured Gemini embedding model and returns a typed `{ embedding: null, unavailableReason }` result when the Google key or provider response is unavailable. The pattern repository consumes the existing T45 `image_prompt_patterns` table, performs pgvector nearest-neighbor ordering, honors product-type and typography constraints, and updates usage metadata after a cached pattern is selected.

## 13-Layer Wiring Verification

| Layer | T46 Applicability | Phase 5 Finding | Status |
|---:|---|---|---:|
| 1 | Database read/query path | T45 `image_prompt_patterns` is consumed through `findPatternCandidates`; no new table was introduced. | **Pass** |
| 2 | ORM and migrations | Existing Drizzle schema is reused through `@viyo/db`; no migration drift was detected in build/type-check. | **Pass** |
| 3 | Shared types and contracts | Shared Zod request/response schemas are exported from `@viyo/shared` and consumed by the worker procedure. | **Pass** |
| 4 | Backend services and workers | `routeGeneration` orchestrates scoring, cache hit selection, fallback, provider routing, and trace metadata. | **Pass** |
| 5 | API routes and validation | `artDirector.routeGeneration` is mounted under the authenticated tRPC surface with schema validation. | **Pass** |
| 6 | Frontend integration | No UI integration was required for T46 Phase 4. The shared response contract is ready for future UI wiring. | **Not in current scope** |
| 7 | State management | No client state was required. Server response carries trace and routing metadata for downstream consumers. | **Not in current scope** |
| 8 | AI brains and prompts | Gemini embedding lookup and zero-shot fallback prompt builder are wired without introducing OpenAI as a cache hard dependency. | **Pass** |
| 9 | Analytics and audit trail | `recordRouterDecision` captures trace ID, workspace ID, selected model, tier, score, cost, fallback reason, and pattern ID. | **Pass** |
| 10 | Config and feature flags | `enable_art_director_router`, env fallback flags, thresholds, provider timeouts, and provider API key availability are wired. | **Pass** |
| 11 | Logs, monitoring, and errors | Route tracing, fail-closed auth, typed unavailable reasons, and tRPC error mapping are present. | **Pass** |
| 12 | Security, auth, and RLS | The route requires the existing Hono auth context and fails closed when auth state is absent. | **Pass** |
| 13 | Tests | Focused routing tests cover provider tiers, fallback behavior, scoring formula, clamps, and token-economics boundaries. | **Pass** |

## Phase 5 Gate Decision

Phase 5 is ready for PO review. The implementation passed source inspection, focused tests, repository checks, live local route probing, and static wiring verification. The only caveat is that the local health probe reported `database.connected=false` because the validation intentionally ran with harmless placeholder environment values and no `DATABASE_URL`. That result is acceptable for the specific live probe because the purpose was to prove route mounting and protected-route fail-closed behavior without touching external services.

> **Gate request:** Approve T46 Phase 5 so Phase 6 can begin. No Phase 6, T47, or T48 work should start until PO approval is explicitly granted.

## References

[1]: ./t46-phase2-architecture-plan.md "T46 Phase 2 Architecture Plan"  
[2]: ./t46-phase3-global-wiring-blueprint.md "T46 Phase 3 Global Wiring Blueprint"  
[3]: ./t46-phase4-incremental-record.md "T46 Phase 4 Incremental Implementation Record"  
[4]: ./t46-phase5-live-validation-evidence.txt "T46 Phase 5 Live Validation Evidence"
