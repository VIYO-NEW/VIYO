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

