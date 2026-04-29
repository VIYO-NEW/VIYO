# Task 71 Architecture Approval Plan — Billing and Token Economics Foundation

**Author:** Manus AI  
**Date:** 2026-04-29  
**Taskmaster Task:** 71 — T54: Billing and Token Economics Foundation  
**Status:** Draft for product-owner approval before implementation  
**Repository State:** Inspected on clean `main`; no feature branch or Taskmaster status mutation has been performed for Task 71 yet.

## 1. Executive Summary

Task 71 should convert the existing Art Director Studio generation path from **billing-status-only precheck** to a complete token-economics lifecycle: **estimate display**, **balance preflight**, **atomic deduction after successful non-cached execution**, and **insufficient-balance recovery**. The implementation must remain source-aligned with existing Phase 6.2 router contracts and the T9 token engine, and it must not introduce new auth/database surfaces beyond already-existing billing and Art Director worker paths.

The current Studio already displays `costTokens` after a result, and the worker router already returns `costTokens`, `tokenAction`, and `routingMetadata.billingMode`. The current gap is that non-cached generation/editing paths call `checkBillingStatus(workspaceId)` but do not call `getTokenBalance()` before execution or `deductTokens()` after success. Existing tests explicitly prove this current behavior: cache hits are free and non-cached routes return `tokenAction='prechecked'` while only invoking billing status precheck. The Task 71 target is therefore a bounded contract completion rather than a new billing subsystem.

## 2. Source-of-Truth Evidence

| Source Surface | Current Evidence | Task 71 Implication |
|---|---|---|
| `apps/web/src/components/studio/ImageStudio.tsx` | The command panel submits one `RouteGenerationInput`, catches API errors as text, and displays result `costTokens` only after completion. | Add estimated-cost and current-balance UI before submission; integrate insufficient-token recovery without changing mode/editing inventories. |
| `apps/web/src/lib/studio-api.ts` | The API client throws errors with `status` and `code` from tRPC envelopes and parses the shared `routeGenerationResponseSchema`. | Preserve error-code propagation for `INSUFFICIENT_TOKENS` and expose enough fields for the UI to show recovery actions. |
| `apps/web/src/lib/billing-api.ts` | Existing `fetchTokenBalance()` targets `/api/v1/billing/balance`; `createTopUp()` exists but currently sends `{ packId }`. | Reuse balance fetch; verify or normalize top-up response/request contract during implementation because worker schemas use `pack`. |
| `apps/worker/src/lib/token-engine.ts` | `getTokenBalance()` provides O(1) balance lookup, and `deductTokens()` performs billing freeze check, atomic RPC deduction, and `INSUFFICIENT_TOKENS` error conversion. | Use these primitives rather than creating new balance mutation code. |
| `apps/worker/src/lib/ai/image-router.ts` | `costTokens` is derived from selected provider cost for non-cached paths; cache hits cost zero; non-cached route currently calls `checkBillingStatus()` before saving. | Insert balance preflight before the expensive save/provider path and atomic deduction only after successful non-cached asset persistence. |
| `apps/worker/src/trpc/routers/art-director.ts` | `ApiError` is currently mapped to tRPC `FORBIDDEN` for 402, but custom metadata is not explicitly preserved. | Ensure insufficient-balance code remains visible to `studio-api.ts`, either by preserving `cause` shape or adding explicit tRPC error data if supported by the existing core. |
| `packages/shared/src/schemas/art-director.ts` | `tokenAction` allows `none`, `prechecked`, `deducted_after_success`; fallback reasons include `insufficient_tokens`; `billingMode` allows `free_cache`, `deduct_after_success`, `none`. | No broad schema redesign is required, but response metadata may need additive optional fields for estimate/balance reconciliation if tests prove necessary. |
| `apps/worker/src/lib/ai/art-director-route-generation.test.ts` | Tests assert cache hit is free and non-cached path is currently only `prechecked`. | Update/extend tests to assert balance preflight, insufficient-token short-circuit, and successful post-save deduction. |

## 3. Implementation Boundary Decision

The approved implementation should be limited to Art Director Studio generation and editing paths that already flow through `artDirector.routeGeneration`. It should not introduce a new public deployment, a new authentication surface, plaintext secret storage, or new rate-limiting infrastructure. If investigation during implementation shows that a new auth/database surface is required beyond existing worker billing and tRPC paths, the work must pause and the corresponding deferred security task must be promoted before continuing.

## 4. 13-Layer Wiring Plan

| Layer | Existing Surface | Planned Wiring | Acceptance Evidence |
|---|---|---|---|
| 1. Product contract | Task 71 requires estimate display, preflight, deduction, insufficient-balance recovery, and reconciliation notes. | Treat cached Pattern DB hits as zero-cost; treat non-cached generation/editing as paid. | Taskmaster update and PR summary explicitly map all five requirements. |
| 2. Shared schemas | `routeGenerationResponseSchema` already includes token fields. | Prefer additive optional fields only if needed for `estimatedCost`, `balanceBefore`, or `balanceAfter`; avoid breaking existing clients. | Shared schema tests pass and existing response fixtures remain source-aligned. |
| 3. Provider cost model | `ProviderDescriptor.costTokens` drives router `costTokens`. | Extract or expose a deterministic estimate helper that resolves provider and cache possibility consistently with the actual route. | Unit tests confirm estimates match selected provider cost for generation and editing. |
| 4. Frontend Studio state | `ImageStudio.tsx` owns command-panel state and result rendering. | Add token estimate state, balance state, preflight loading state, and insufficient-token modal state. | Component tests cover estimate text, disabled submit when preflight fails, and token result labels. |
| 5. Frontend billing client | `fetchTokenBalance()` and `createTopUp()` already exist. | Reuse `fetchTokenBalance()`; normalize `createTopUp()` contract if worker route expects `pack` and returns `checkoutUrl`. | Billing client tests or targeted type checks prove top-up recovery works with worker route contract. |
| 6. Studio API client | `routeStudioGeneration()` unwraps tRPC success/error envelopes. | Preserve `status`, `code`, and any `required/currentBalance` metadata on thrown errors for UI recovery. | Tests assert `INSUFFICIENT_TOKENS` is surfaced to Studio state. |
| 7. Worker tRPC boundary | `artDirector.routeGeneration` delegates to `routeGeneration`. | Preserve `ApiError` metadata in tRPC error response sufficiently for the web client. | Worker/router tests or integration-level API tests verify error code preservation. |
| 8. Router orchestration | `routeGeneration()` checks billing status before non-cached save. | Add `getTokenBalance()` preflight before expensive work; call `deductTokens()` after successful non-cached save; set `tokenAction='deducted_after_success'` only after success. | Existing non-cached test changes from `prechecked` to `deducted_after_success`; new insufficient test proves no R2 write. |
| 9. Atomic mutation | `deductTokens()` is the only approved token-balance mutation path. | Use `deductTokens({ workspaceId, userId, amount, transactionType, description, referenceType, referenceId, metadata })`. | Test asserts `deductTokens` receives trace/brand/model metadata and amount equals response cost. |
| 10. Cache and free paths | Cache-hit path returns `costTokens=0`, `tokenAction='none'`, and no R2 write. | Preserve cache-hit behavior unchanged and avoid balance/deduction calls for free cache hits. | Existing cache-hit test remains valid. |
| 11. Recovery UX | `InsufficientTokensModal` and quick top-up patterns already exist. | Display current balance, required estimate, and top-up action when preflight or backend deduction returns insufficient tokens. | Frontend test proves modal trigger and retry-safe status copy. |
| 12. Cost reconciliation notes | Admin `CostReconciliation` and billing ledger already exist. | Add metadata to deduction ledger entries: `traceId`, `brandId`, `mode`, `editingTool`, `selectedModel`, `providerTier`, `routeSource`, and `cacheStatus`. | Test or logged fixture proves reconciliation metadata is attached. |
| 13. Observability and rollback | Router logs trace metadata and has `billingMode` response metadata. | Keep billing outcome observable through response metadata and logs without exposing secrets. | PR evidence includes targeted log/metadata assertions and no secret leakage. |

## 5. Proposed User Experience

The Studio command panel should show a compact **Token estimate** card before the user submits a request. The card should display the current workspace balance, the estimated cost, whether the request is expected to be free only if the Pattern DB cache hits, and a concise warning when the balance is below the estimated paid-path requirement. The submit button should remain usable when the balance is sufficient, should block locally when the current balance is known to be insufficient, and should still handle backend `INSUFFICIENT_TOKENS` because balance can change between preflight and deduction.

After successful paid execution, result cards should display the final token action as **deducted after success** and should continue showing `costTokens`. Cache-hit cards should remain explicitly free. When balance is insufficient, the existing recovery modal should offer top-up paths and leave the request form intact so users can retry after checkout.

## 6. Backend Flow

| Step | Paid Non-Cached Route | Cache-Hit Route |
|---|---|---|
| Request validation | Shared route schema validation remains unchanged. | Same. |
| Provider/cost estimate | Resolve selected provider and cost. | Candidate crosses threshold and returns zero cost. |
| Billing status | `deductTokens()` will still perform billing freeze check; explicit preflight may call `checkBillingStatus()` or rely on deduction primitive depending on final code shape. | Not called. |
| Balance preflight | `getTokenBalance(workspaceId)` before expensive provider/save work; fail fast if balance is below estimate. | Not called. |
| Asset execution/save | Existing R2 manifest save flow continues. | No R2 write for cache hit. |
| Atomic deduction | `deductTokens()` after successful non-cached save using amount equal to provider cost. | Not called. |
| Response | `tokenAction='deducted_after_success'`, `billingMode='deduct_after_success'`, reconciliation metadata available. | `tokenAction='none'`, `billingMode='free_cache'`. |

## 7. Security and Deferred-Task Gate

This plan does not intentionally trigger Task 65, Task 66, or additional Task 67 work because it reuses existing authenticated worker, billing, and tRPC surfaces. It also does not persist plaintext sensitive tokens, add a new auth database, or expose public deployment/rate-limit changes. If implementation reveals otherwise, the work must stop and Taskmaster security status must be revisited before continuing.

## 8. Validation Plan

| Validation Command | Purpose |
|---|---|
| `pnpm --filter @viyo/shared test -- --passWithNoTests` or nearest package test command discovered during implementation | Validate schema and contract updates. |
| `pnpm --filter @viyo/worker test -- art-director-route-generation --run` or package-equivalent command | Validate router billing preflight, deduction, insufficient-token, and cache-hit behavior. |
| `pnpm --filter @viyo/web test -- ImageStudio --run` or package-equivalent command | Validate Studio token estimate and recovery state. |
| `pnpm type-check` | Verify workspace TypeScript contracts. |
| `pnpm lint` | Verify style and import correctness. |
| Browser validation against local app, if the project can run without missing secrets | Confirm user-visible estimate, successful route, and insufficient-token state where mockable. |

The exact filtered commands may need adjustment after package-local scripts are inspected during the implementation phase.

## 9. Work Plan After Approval

After approval, the next phase should create a dedicated feature branch from clean `main`, set Taskmaster Task 71 to `in-progress`, and inspect the package-local scripts and tests before editing. The implementation should proceed backend-first for deterministic token semantics, then frontend recovery UX, then validation and tracking updates.

## 10. Approval Request

Please approve or modify this plan before implementation begins. The recommended approval is: **Proceed with Task 71 using the bounded Art Director Studio billing lifecycle plan above, with no new auth/deployment/security-trigger surfaces unless explicitly re-approved.**
