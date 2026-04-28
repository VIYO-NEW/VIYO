# T46 v6.1 Prior-Artifact Repair Record

## Source Declaration

| Source | Authority Status | Sections Read | Extracted Facts | Conflict / Repair Impact |
|---|---|---|---|---|
| Current PO instruction in active task, 2026-04-28 | Highest authority | Full message accompanying the uploaded repair documents and Phase 6 entry-conditions directive | Phase 5 remains approved for routing logic, wiring, and test coverage, but Phase 6 UI work is blocked until backend artifacts are repaired. The work is a foundational rebuild, not a patch. | Overrides the earlier simplified three-provider architecture lock and authorizes backend repair before Phase 6 resumes. |
| `docs/internal/source-of-truth/T46_ROUTING_ARCHITECTURE_LOCK_v6_1.md` | Live approved source-of-truth architecture lock v6.1 from Google Drive | Product and Architecture Contract; §1 provider registry; §2 scoring; §3.1 generation modes; §3.1.1 multi-model pipelines; §3.2 editing tools; §3.3 Brand Vault @ mentions; §3.4 R2 auto-save; §4 token economics; §5 observability; §6 rollback | Full 3-tier provider registry, 22 generation modes, 10 editing tools, Claude 3.5 Sonnet MCoT zero-shot fallback, Brand Vault @ mention resolution, synchronous Cloudflare R2 auto-save with assets table indexing, token deduction boundary, metrics, feature flag and rollback behavior. v6.1 adds exact pipeline definitions for A3, A4, A8, A9, A13, A14, A15, and A16. | Blocking source of truth for all repaired worker/shared files. The §3.1.1 pipeline definitions are explicitly original architecture and must be surfaced for PO review in the repair submission. |
| `docs/internal/source-of-truth/T46_PO_GAP_ADDENDUM_C-T46-001.md` | Live approved repair memo / gap addendum C-T46-001 from Google Drive | Conflict summary; sources in conflict; required back-propagation register; recommended resolution; decision log entry | Root cause is PO documentation failure: prior v1.0-v3.0 architecture locks omitted the full PRD V5 Addendum feature surface. Mandatory repairs are `provider-registry.ts`, shared `art-director.ts`, `image-router.ts`, and new `editing-router.ts`. | Blocks Phase 6 UI and launch until repaired and verified. |
| `T46Phase6EntryConditions.docx` | Live Phase 6 gate directive | Full two-page directive | Before writing Phase 6 UI code, complete the backend repairs. The directive confirms the routing logic, 4D scoring formula, cache-first flow, zero-shot fallback, and billing precheck are sound and should not be changed. It repeats that §3.1.1 pipeline definitions are live but PO-review-required. | Defines the allowed repair posture: expand the feature surface and inventory without refactoring already-approved routing economics and cache-first logic except where v6.1 requires wiring inputs/outputs around those invariants. |
| `viyo-development-protocol-v2`, `quality-gate`, and `prd-product-architect-v1` skills | Project process authority | Authority order, source completeness, foundational fix gate, cross-system wiring checklist, internal records, quality controls, prior-document remediation | Requires source-order compliance, foundational fix analysis before coding, affected-layer verification, incremental internal records, no false completion before PO gate, and explicit handling of prior-artifact repair. | Governs how the repair is executed and recorded. |
| `product-rules.md` | Project product constraint | Direct APIs Only; Moat Is the Cache; No Speculative Work | Existing product rule prefers direct provider APIs and disallows aggregators in production unless explicitly approved by PO. It also requires Pattern DB cache-first behavior. | The live v6.1 lock explicitly requires Tier 2 Atlas Cloud primary and fal.ai fallback. This is treated as explicit PO approval for T46. Cache-first behavior remains mandatory. |

## Foundational Fix Gate Analysis

### Q1: Where does this break originate?

**ORIGIN:** Layer 3 (Shared Types & Contracts), Layer 4 (Backend Services), Layer 5 (API Routes & Validation), Layer 8 (AI Brains & Prompts), Layer 10 (Config & Feature Flags), and Layer 13 (Tests) diverged from the complete source of truth because the earlier builder-facing Architecture Lock v1.0-v3.0 was incomplete.

**SPEC:** Architecture Lock v6.1 and Gap Addendum C-T46-001 require the Art Director backend to expose the complete Visual Engine V2 surface: 3 provider tiers, 22 generation modes, 10 editing tools, Claude 3.5 Sonnet MCoT zero-shot fallback, Brand Vault @ mention resolution, synchronous Cloudflare R2 asset persistence, and the v6.1 multi-model pipeline definitions for A3/A4/A8/A9/A13/A14/A15/A16.

**ACTUAL:** The Phase 5 backend implemented the correct cache-first routing logic, 4D scoring strategy, billing precheck, and tested fallback flow, but only against the simplified provider/model surface from the earlier architecture lock.

### Q2: Which wiring layers are affected?

| Layer | Affected? | Repair Requirement |
|---|---:|---|
| Layer 1 — Database Schema & Migrations | Yes, read/write path affected; current `assets` schema can index generated assets through `workspaceId`, optional `productId`, `assetType`, `storagePath`, dimensions, MIME, `sourceModel`, prompt, and metadata; it does not expose a dedicated `brand_id` column. | Use existing `assets` table for Brand Vault/R2 indexing with workspace scoping and brand metadata stored in `metadata` unless PO later mandates a schema migration. Do not invent a parallel schema. |
| Layer 2 — Supabase Auth, Roles & Policies | Indirect | Preserve authenticated tRPC boundary and workspace ownership. Mention resolution and asset writes must use the authenticated workspace context. |
| Layer 3 — Shared Types & Contracts | Yes | Add A1-A22 generation mode enum and 10 editing tool request/response schemas. |
| Layer 4 — Backend Services & Workers | Yes | Rebuild provider registry, image router feature surface, R2 auto-save orchestration, @ mention resolver, pipeline metadata, and editing router module. |
| Layer 5 — API Routes & Validation | Yes | Expose validation-safe route/edit contracts without Phase 6 UI work. |
| Layer 6 — Frontend UI & State | Not implemented in this repair | Explicitly blocked until backend repair passes lint, type-check, and tests. |
| Layer 7 — Admin Portal | Not directly changed | No speculative admin work. |
| Layer 8 — AI Brains & Prompts | Yes | Represent Claude 3.5 Sonnet MCoT zero-shot fallback as the fallback prompt brain while preserving the approved zero-shot fallback boundary. |
| Layer 9 — Analytics & Audit Trail | Yes | Preserve and extend routing decision metrics for model/tier/score/cache/generation duration. |
| Layer 10 — Config & Feature Flags | Yes | Keep `enable_art_director_router` rollback behavior and corrected default Tier 2 route. |
| Layer 11 — Logs, Monitoring & Error Handling | Yes | Fail closed on unsupported modes/tools, provider gaps, R2 save failures, and mention-resolution failures. |
| Layer 12 — Documentation & Runbooks | Yes | Update internal records and repair evidence before approval. |
| Layer 13 — Tests | Yes | Add/update tests for full provider inventory, mode/tool schemas, @ mentions, R2 auto-save boundaries, scoring, billing, and fallback invariants. |

### Q3: Does this fix prevent the same class of bug from recurring?

**PATCH APPROACH:** Append missing provider names to the existing registry while leaving schemas, editing tools, R2 persistence, @ mention handling, and pipeline metadata outside the backend contract.

**FOUNDATIONAL APPROACH:** Rebuild the affected backend contract and routing modules directly from v6.1, then add tests that assert the exact provider inventory, generation modes, editing tools, fallback model, scoring multipliers, cache-first behavior, pipeline contracts, and asset persistence boundaries. This prevents future UI work from binding to an incomplete backend surface.

**CHOSEN:** Foundational. The repair must update all four affected artifacts named in Gap Addendum C-T46-001 and their tests before Phase 6 resumes.

### Q4: Does this require updating the Architecture Lock or any R-Series spec?

**SPEC STATUS:** Resolved by the live Google Drive Architecture Lock v6.1 and Gap Addendum C-T46-001. The eight §3.1.1 pipeline definitions are not hidden implementation assumptions; they are live architecture definitions explicitly marked as original architecture requiring PO review.

**ACTION:** Implement the backend contract so the system can support those pipeline definitions, record them as PO-review-required in this repair submission, and do not proceed to Phase 6 UI until the repaired backend passes validation. No additional R-Series spec is required unless implementation inspection finds a schema or provider-secret gap that contradicts v6.1.

### Q5: What is the blast radius?

| Area | Blast Radius | Risk |
|---|---|---|
| Shared contract | API request/response schemas gain generation modes and editing tool contracts. | Medium; additive but UI-facing. |
| Provider routing | Registry expands from simplified providers to full v6.1 tier inventory. | Medium; must avoid changing the already-approved cache-first scoring logic except for required typography multiplier model names and mode/tool routing metadata. |
| Image router | Adds Brand Vault mention resolution and synchronous R2 auto-save before returning a URL, plus pipeline contract metadata for A3/A4/A8/A9/A13/A14/A15/A16. | High; changes persistence and failure semantics for generated assets. |
| Editing router | New backend module for 10 editing tools. | Medium; new feature surface must be typed and tested without real provider calls. |
| Database | Existing `assets` schema appears usable for indexing generated assets, but lacks a physical `brand_id` column. | Medium; use workspace-scoped indexing and metadata-based brand references unless PO requires a migration. |
| Config/secrets | Additional providers and R2 settings may require schema additions. | Medium; must not hardcode secrets. |
| Tests/evidence | Prior Phase 5 evidence remains valid for routing logic but must be superseded by v6.1 repair evidence for feature completeness. | Low if clearly documented. |

## Mandatory Rebuild Scope

| Artifact | Required Repair | Verification Evidence Required |
|---|---|---|
| `apps/worker/src/lib/ai/provider-registry.ts` | Enumerate Tier 1 direct providers, Tier 2 Atlas Cloud/fal.ai aggregator-backed generation and editing models, and Tier 3 self-hosted models per v6.1. Include default Tier 2 routing and the 200K+ monthly trigger metadata for self-hosted Tier 3. | Unit/static tests pass for 22+ models, three-tier registry coverage, default Tier 2 routing, and fallback gateway metadata. |
| `packages/shared/src/schemas/art-director.ts` | Add A1-A22 mode enum, mode metadata, 10 editing tool enum/schemas, pipeline-aware request metadata, and response metadata while preserving existing route-generation contract compatibility where safe. | Shared type-check and schema tests. |
| `apps/worker/src/lib/ai/image-router.ts` | Add Brand Vault @ mention parsing/resolution, R2 auto-save orchestration, assets-table indexing boundary, mode-to-model/pipeline routing metadata, and v6.1 typography multiplier behavior. Preserve the approved 4D scoring formula, cache-first flow, zero-shot fallback boundary, and billing precheck. | Focused tests for mention parsing, R2 save boundary, cache-first scoring, billing boundary, fallback model metadata, mode mapping, and pipeline metadata. |
| `apps/worker/src/lib/ai/editing-router.ts` | Create module for 10 editing tools and route each tool to the v6.1 backend model mapping. | Focused editing-router tests. |
| `apps/worker/src/lib/ai/fallback-prompts.ts` | Reconcile the fallback prompt metadata to identify Claude 3.5 Sonnet MCoT as the zero-shot prompt brain without changing the approved fallback boundary. | Focused tests or static assertions for fallback model metadata. |
| `packages/shared/src/config/env.ts` and worker config surfaces | Add provider and R2 configuration keys only as required to type safe runtime behavior without hardcoded secrets. | Type-check and config tests. |

## Phase 6 Entry Conditions

Phase 6 UI work remains blocked until all of the following are true:

| Entry Condition | Status |
|---|---|
| Architecture Lock v6.1 read fully from the live Google Drive Markdown source. | Done. |
| Gap Addendum C-T46-001 read fully from the live Google Drive Markdown source. | Done. |
| Mandatory backend repairs implemented for provider registry, shared Art Director schemas, image router, and editing router. | Pending implementation. |
| Repairs pass lint, type-check, and tests. | Pending validation. |
| §3.1.1 original pipeline definitions are explicitly disclosed in the repair submission as PO-review-required. | Pending final repair submission. |
| Phase 6 UI work is not started before the backend repair gate passes. | Enforced. |

## Status

This record supersedes the earlier v6.0 pre-code repair gate. Implementation may proceed on the v6.1 backend repair only. Phase 6 UI work remains blocked until the repaired backend artifacts pass validation and the repair status is delivered for PO approval.

## Completed Backend Repair Evidence — 2026-04-28

The backend repair has been completed against the live v6.1 routing architecture lock and C-T46-001 repair addendum without starting Phase 6 UI implementation. The repair preserves the already-approved cache-first scoring economics and billing boundary while expanding the missing backend surfaces needed by future UI consumers.

| Area | Completed Repair | Evidence |
|---|---|---|
| Shared contract | Rebuilt `packages/shared/src/schemas/art-director.ts` with the full v6.1 generation model inventory, editing model inventory, A1-A22 generation mode contract, ten editing-tool contract, Brand Vault mention fields, source asset fields, and R2 asset response fields. | `packages/shared/src/schemas/art-director.ts`; `packages/shared/src/schemas/index.ts`; `packages/shared/src/config/env.ts`. |
| Provider registry and config | Replaced the simplified three-provider inventory with the v6.1 three-tier provider registry, Tier 2 default selection semantics, rollback target, gateway metadata, Claude fallback config, R2 public URL config, and token-cost map. | `apps/worker/src/lib/ai/provider-registry.ts`; `apps/worker/src/lib/ai/router-config.ts`. |
| Editing tools | Added `editing-router.ts` and mapped all ten Visual Engine V2 editing tools to deterministic plans, including direct typography routing for text-aware edits. | `apps/worker/src/lib/ai/editing-router.ts`; `art-director-routing.test.ts`. |
| Runtime routing | Rebuilt `image-router.ts` to support A1-A22 modes, editing-tool routing, Brand Vault @mention resolution, source asset references, Cloudflare R2 manifest auto-save, assets-table indexing when a DB binding exists, Claude 3.5 Sonnet fallback prompt metadata, pipeline PO-review metadata, and corrected punctuation handling for prompt mentions. | `apps/worker/src/lib/ai/image-router.ts`; `art-director-route-generation.test.ts`. |
| Fallback prompt brain | Converted zero-shot prompt support to a Claude 3.5 Sonnet MCoT-capable helper while retaining deterministic behavior for unavailable-key/test environments. | `apps/worker/src/lib/ai/fallback-prompts.ts`; `art-director-routing.test.ts`. |
| Tests | Extended the existing Art Director routing suite and added routeGeneration execution coverage for cache-hit billing skip, non-cache billing precheck, R2 manifest writes, Brand Vault mention propagation, editing-tool selection, full provider inventory, A1-A22 mode map, editing-tool plans, fallback metadata, and scoring invariants. | `apps/worker/src/lib/ai/art-director-routing.test.ts`; `apps/worker/src/lib/ai/art-director-route-generation.test.ts`. |

### Validation Gate Results

| Command | Result | Evidence Location |
|---|---|---|
| `pnpm --filter @viyo/shared build && pnpm --filter @viyo/shared type-check` | Passed; shared declarations rebuilt and source contracts type-checked so worker consumes the v6.1 Art Director contract. | Shell session `shared_validation_v61`. |
| `pnpm --filter @viyo/worker type-check` | Passed; `tsc --noEmit` completed with no errors after the routeGeneration test additions and mention parsing fix. | `/home/ubuntu/terminal_full_output/2026-04-28_17-07-24_751651_141762.txt` plus shell session `worker_typecheck_after_tests`. |
| `pnpm --filter @viyo/worker test -- src/lib/ai/art-director-routing.test.ts src/lib/ai/art-director-route-generation.test.ts` | Passed; 2 files, 14 tests. | `/home/ubuntu/terminal_full_output/2026-04-28_17-06-39_103646_141144.txt`. |
| `pnpm --filter @viyo/worker test` | Passed; 2 files, 14 tests. | `/home/ubuntu/terminal_full_output/2026-04-28_17-07-24_751651_141762.txt`. |
| `pnpm --filter @viyo/worker lint` | Passed; ESLint completed with no findings. | Shell session `worker_lint_v61`. |

### PO-Review Disclosure for §3.1.1 Pipeline Definitions

The v6.1 §3.1.1 multi-model pipeline definitions for A3, A4, A8, A9, A13, A14, A15, and A16 are represented in backend metadata and marked through `pipelineRequiresPoReview`. This repair does not treat those pipeline definitions as hidden implementation assumptions; they remain live architecture definitions that require explicit PO review before the Phase 6 UI experience binds to them.

### Updated Phase 6 Entry Conditions

| Entry Condition | Status |
|---|---|
| Architecture Lock v6.1 read fully from the live Markdown source. | Done. |
| Gap Addendum C-T46-001 read fully from the live repair memo. | Done. |
| Mandatory backend repairs implemented for provider registry, shared Art Director schemas, image router, editing router, fallback helper, and runtime config. | Done. |
| Repairs pass lint, type-check, and tests. | Done. |
| §3.1.1 original pipeline definitions explicitly disclosed as PO-review-required. | Done in this repair record and must also be included in final delivery. |
| Phase 6 UI work not started before backend repair gate passes. | Enforced; no UI files were changed. |

## Status Update

The T46 v6.1 backend repair gate is ready for PO review. Phase 6 UI work should remain paused until the PO explicitly approves resuming it against the repaired backend surface.
