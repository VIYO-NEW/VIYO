# T73 Phase 2 Architecture & Wiring Plan — T56 Editing Router Coverage for 10 Tools

## Status

This plan is prepared for **Product Owner approval before implementation code changes**. T73 is now `in-progress` in Taskmaster after the PO unblock decision, with dependency T69 satisfied and security-lane blockers T100/T101/T103 completed and pushed. The pre-alpha `deploy.yml` auto-deploy trigger has already been restored and pushed through the approved web repair path.

## Task Scope

T73 must ensure the ten approved Visual Engine V2 editing tools are wired only where backend-supported capability exists: **Touch Edit**, **Text Edit**, **Layer Splitting**, **Background Swap**, **Object Removal**, **Canvas Expand**, **Upscale**, **Quick Edit**, **Style Transfer**, and **Material Swap**. The implementation must not expose any unwired placeholder controls. Tool availability must reflect the shared Art Director contracts and feature flags rather than local UI assumptions.

| Canonical tool ID | User-facing label | Shared contract capability basis | Provider required? | Local only? |
|---|---|---|---:|---:|
| `touch_edit` | Touch Edit | `sam-2-mask`, `sdxl-inpainting-edit` | Yes | No |
| `text_edit` | Text Edit | `typography-aware-direct-edit` | Yes | No |
| `layer_splitting` | Layer Splitting | `sam-2-segmentation` | Yes | No |
| `background_swap` | Background Swap | `rmbg-subject-cutout`, tier-2 background generation, composite | Yes | No |
| `object_removal` | Object Removal | `sdxl-inpainting-object-removal` | Yes | No |
| `canvas_expand` | Canvas Expand | `sdxl-outpainting-canvas-expand` | Yes | No |
| `upscale` | Upscale | provider-selected upscale | Yes | No |
| `quick_edit` | Quick Edit | `local-sharp-canvas-adjustment` | No | Yes |
| `style_transfer` | Style Transfer | `ip-adapter-style-conditioning` | Yes | No |
| `material_swap` | Material Swap | `controlnet-structure-lock`, tier-2 material swap | Yes | No |

## 1. Component Inventory

| # | Component | Type | Path | Purpose | New/Modified |
|---:|---|---|---|---|---|
| 1 | Shared Art Director schema | Contract module | `packages/shared/src/schemas/art-director.ts` | Authoritative enum and editing-tool contract source; implementation should consume existing definitions and avoid duplicating tool lists. | Read-only unless a validation gap is discovered |
| 2 | Worker editing router | Backend AI routing module | `apps/worker/src/lib/ai/editing-router.ts` | Existing deterministic router for editing tools; implementation should not create unsupported provider behavior. | Read-only unless test evidence exposes a foundational defect |
| 3 | Worker image router | Backend orchestration module | `apps/worker/src/lib/ai/image-router.ts` | Existing route-generation integration path that accepts `editingTool` and emits routing metadata. | Read-only unless coverage reveals a contract mismatch |
| 4 | Worker routing tests | Test module | `apps/worker/src/lib/ai/art-director-routing.test.ts` | Existing backend coverage for all ten editing plans; will be extended only if missing assertions are found for tool metadata or unsupported-provider behavior. | Potentially modified |
| 5 | Studio contract | Frontend contract adapter | `apps/web/src/lib/studio-contract.ts` | Maps shared editing tool IDs to user-facing UI definitions; should remain generated from shared schema options rather than duplicated manually elsewhere. | Potentially modified only for safer availability metadata |
| 6 | Studio API client/tests | Frontend API module/test | `apps/web/src/lib/studio-api.ts`, `apps/web/src/lib/studio-api.test.ts` | Verifies request/response payload behavior for `editingTool`, `sourceAssetIds`, `sourceImageUrls`, and returned routing metadata. | Potentially modified |
| 7 | Image Studio UI | Frontend component | `apps/web/src/components/studio/ImageStudio.tsx` | User surface for selecting editing tools, providing source assets/images, submitting generation requests, and displaying route metadata. | Potentially modified only if current UI exposes unsupported placeholders or misses capability-gated state |
| 8 | Image Studio UI coverage | Test module | Proposed `apps/web/src/components/studio/ImageStudio.test.tsx` or nearest existing test location | Browser-like/rendered coverage proving all ten tools render from shared contracts, require source inputs, submit canonical IDs, and avoid placeholders. | New if no equivalent exists |
| 9 | Internal records | Internal operational docs | `docs/internal/build-journal.md`, `docs/internal/integration-map.md`, `docs/internal/open-questions.md` | Record completed component changes, cross-system integration implications, and any non-blocking gaps discovered during implementation. | Modified as triggered |
| 10 | Taskmaster graph | Task state | `.taskmaster/tasks/tasks.json` | Tracks T73 status/subtasks and final completion. | Modified via Taskmaster CLI |
| 11 | Active checklist | Local task checklist | `todo.md` | Keeps session checklist aligned with T73 gates and incremental commit state. | Modified |

## 2. Data Flow

The intended flow is not a new feature path; it is a coverage and wiring-hardening pass over the existing Visual Engine V2 editing path.

```text
User selects editing tool in Image Studio → ImageStudio stores canonical ArtDirectorEditingTool ID → submit handler constructs ArtDirector request with editingTool + source asset/image fields → studio API client sends request to worker route → image-router routeGeneration forwards editingTool to editing-router/provider selection → editing-router resolves deterministic tool plan from ART_DIRECTOR_EDITING_TOOL_CONTRACTS → response returns routingMetadata.editingTool and provider/model metadata → ImageStudio renders asset card and route details with the canonical tool label
```

```text
Contract test loads artDirectorEditingToolSchema.options → studioEditingToolDefinitions maps every shared option → rendered picker/test matrix verifies exactly ten approved tools → missing or extra UI controls fail test before deployment
```

```text
Provider-required tool path → provider registry/image router confirms backend-supported capability exists → UI remains enabled only for supported shared-contract tools → unsupported placeholder controls are not rendered
```

```text
Quick Edit local-only path → shared contract marks providerRequired=false and localOnly=true → request coverage verifies it still travels with canonical `quick_edit` metadata without pretending to require an external provider
```

## 3. Dependency Map

| Component | Depends On | Type | Notes |
|---|---|---|---|
| `ImageStudio.tsx` | `studioEditingToolDefinitions`, `studioModeDefinitions` | Internal | Must continue to source tool options from `apps/web/src/lib/studio-contract.ts`; no hard-coded local arrays. |
| `studio-contract.ts` | `@viyo/shared` Art Director schemas | Internal shared package | Shared schema remains authoritative for the canonical ten tool IDs. |
| `studio-api.ts` | Worker tRPC/API contract | Internal | Payload must preserve `editingTool`, `sourceAssetIds`, and `sourceImageUrls`. |
| `image-router.ts` | `editing-router.ts`, provider registry, shared schemas | Internal worker | Runtime availability comes from shared contracts and provider capability selection. |
| `editing-router.ts` | `ART_DIRECTOR_EDITING_TOOL_CONTRACTS` | Internal shared contract | No tool plan may be invented outside the shared contract table. |
| Proposed UI tests | Existing web test runner and React test utilities | Dev dependency | Use existing repo test stack; do not introduce new testing libraries unless the repository already depends on them or a blocker is approved. |
| Validation gates | `pnpm`, TypeScript, Vitest, repository scripts | Tooling | Use existing scripts; no new CI service or deployment target. |

## 4. Technology Decisions (ADR-Style)

**Decision:** Treat `packages/shared/src/schemas/art-director.ts` as the single source of truth for editing tools.  
**Context:** T73 explicitly requires availability to reflect shared contracts and feature flags.  
**Options Considered:** Maintain a UI-local ten-tool list; generate UI options from shared schema; add a new backend endpoint for capabilities.  
**Chosen:** Use existing shared schema/contract exports and add coverage that fails if frontend and backend drift.  
**Consequences:** The implementation remains surgical and avoids speculative API work, while still proving all approved tools are represented consistently.

**Decision:** Favor coverage-hardening and minimal UI changes over new provider behavior.  
**Context:** Backend-supported capability already exists in `editing-router.ts`, `image-router.ts`, and shared contract rows. T73 is about safe router coverage, not provisioning new AI models.  
**Options Considered:** Add provider integrations; add route capability endpoint; verify current route through tests and targeted fixes.  
**Chosen:** Verify and repair the current shared-contract → UI → request → router metadata path only.  
**Consequences:** No unsupported buttons, dead infrastructure, or unprovisioned provider calls are introduced.

**Decision:** Add component/API tests for the editing-tool matrix if no equivalent frontend coverage exists.  
**Context:** Prior live notes showed ten buttons in the DOM, and worker tests already cover deterministic backend plans, but T73 requires durable coverage rather than manual observation alone.  
**Options Considered:** Rely on manual browser validation; add focused contract/component tests; build a full E2E harness.  
**Chosen:** Add focused tests first, then run live/browser validation as Phase 5 evidence.  
**Consequences:** The task produces regression protection without expanding scope into broad E2E infrastructure.

**Decision:** Keep environment target on `staging` branch/domain for T73 while preserving the approved pre-alpha production auto-deploy trigger in workflow configuration.  
**Context:** The PO instructed that Pre-Alpha production auto-deploy is acceptable because there are no live users, but the current implementation branch remains `staging`.  
**Options Considered:** Merge to main manually; push T73 work to staging and let approved branch process handle promotion; disable auto-deploy.  
**Chosen:** Continue T73 on `staging`; do not publish or merge to production from this task without explicit PO instruction.  
**Consequences:** The workflow setting is ready, but task implementation remains isolated to the approved working branch.

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| UI shows a tool that backend cannot route | Medium | High | Assert every displayed tool comes from shared contracts and has a router plan/provider metadata path. |
| Duplicated hard-coded tool lists drift over time | Medium | Medium | Tests compare `studioEditingToolDefinitions` against `artDirectorEditingToolSchema.options` and exact approved labels. |
| Quick Edit is local-only and may be incorrectly treated as provider-required | Medium | Medium | Add explicit test for `quick_edit` `localOnly=true`, `providerRequired=false` semantics. |
| T73 accidentally expands into new provider/model provisioning | Low | High | Mark provider work out of scope; any unsupported provider gap is logged instead of implemented speculatively. |
| Existing docs mention only T27/T28/T29 Build Tracker editing records while T73 covers all ten tools | Medium | Medium | Surface Build Tracker mapping in this approval request and sync only confirmed records; report missing Feature IDs instead of creating junk records. |
| Dependabot alert query cannot be accessed by current GitHub integration | Medium | Low | Record audit evidence: `pnpm audit` clear, `pnpm outdated` non-blocking, Dependabot API returned 403; do not claim Dependabot clear. |
| Frontend test utilities may be absent or underconfigured | Low | Medium | Use existing test stack first; if a missing test harness is discovered, log a non-blocking implementation gap or ask PO if it blocks coverage. |

## 6. Infrastructure Health Check

| Area | Question | Status |
|---|---|---|
| Dependency currency | Are all core packages within 1 major version of latest? | **Mostly clear with non-blocking drift.** `pnpm outdated` reported minor dev-tool updates for `turbo`, `typescript-eslint`, and `eslint`, plus major updates for `typescript` and `vitest`. Because this task should not perform broad toolchain upgrades, major test/compiler upgrades are recorded as risk, not part of T73. |
| Security posture | Any known CVEs from Phase 1g audit? | **Clear from local audit.** `pnpm audit` returned `No known vulnerabilities found`. Dependabot alert API returned 403 (`Resource not accessible by integration`), so Dependabot status is **unknown**, not passed. |
| Observability coverage | Error capture, alerting, session replay, performance monitoring? | **Not directly affected.** T73 edits router/UI coverage and test evidence only. Existing observability is not changed. If route failures are found without logging, record a non-blocking gap unless it blocks validation. |
| Missing infrastructure | Does the spec imply services not yet wired? | **No new infrastructure planned.** Do not add provider services, storage, auth, billing, or monitoring for T73. Unsupported provider work becomes deferred/gap-tracked work. |
| CI/CD health | Are builds green? Source maps uploaded? Release tracking active? | **Partially verified.** Pre-alpha `deploy.yml` trigger was restored and pushed. Pipeline status must be checked after each push. Source maps/release tracking are out of scope unless current CI fails on them. |

## 7. 13-Layer Wiring Blueprint

| Layer | Affected? | What Changes | Depends On | Spec Reference / Authority | Risk |
|---|---|---|---|---|---|
| 1. DB Schema | No | No migrations, tables, or schema fields planned. | Existing persistence only | T73 asks routing coverage, not storage changes. | Low |
| 2. Auth / Permissions | No | No auth roles or permission checks changed. | Existing brand route protections | Security lane T100/T101/T103 already completed per PO unblock. | Low |
| 3. API / Contract Boundary | Yes | Verify request payload includes canonical `editingTool` and source fields; add/extend API client tests if needed. | `studio-api.ts`, worker route contract, shared schemas | T73 details require backend-supported capability only. | Medium |
| 4. Storage / Assets | No | No R2, asset table, or Brand Vault changes. Existing response rendering only. | Existing asset response fields | T32 remains separate Build Tracker work. | Low |
| 5. Backend Service / Orchestration | Conditional | No planned behavior change; extend worker tests only if route metadata or all-ten coverage is incomplete. | `image-router.ts`, `editing-router.ts`, provider registry | T69/T52 repaired provider registry and shared contracts. | Medium |
| 6. Frontend UI | Yes | Ensure picker renders exactly the approved ten tools from shared-derived definitions, requires source inputs, and exposes no placeholders. | `ImageStudio.tsx`, `studio-contract.ts` | Phase 6 UI implementation notes and T73 Taskmaster description. | High if drift exists |
| 7. Frontend State / UX | Yes | Verify selected tool state flows into submit payload, metadata display, and empty/disabled states without misleading availability. | `ImageStudio.tsx` state and route result mapping | T73 no-placeholder requirement. | Medium |
| 8. AI / Router / Prompt Brain | Yes | Validate all ten tools map to deterministic backend-supported tool plans and provider/local-only semantics. | `editing-router.ts`, `ART_DIRECTOR_EDITING_TOOL_CONTRACTS` | Architecture Lock v6.1 / Visual Engine V2 contract as reflected in shared schema. | High if unsupported tool appears |
| 9. Billing / Tokens | No | No token economics or deduction changes. | Existing generation flow | Token and billing integration tasks remain separate. | Low |
| 10. Validation / Test Coverage | Yes | Add targeted contract/component tests and run repo validation gates; include manual browser check if UI changes. | Existing Vitest/TypeScript/lint/build scripts | VIYO Phase 4–6 gates and T73 coverage requirement. | Medium |
| 11. Observability / Error Handling | Conditional | No planned instrumentation; if route errors are found without traceability, log gap. | Existing trace metadata and logs | Protocol infrastructure health check. | Low |
| 12. CI / Deploy | Yes | Validate restored workflow remains intact; check pipeline after pushes. No further workflow edits planned. | `.github/workflows/deploy.yml`, GitHub Actions | PO pre-alpha auto-deploy decision. | Medium |
| 13. Docs / Taskmaster / Airtable / Internal Records | Yes | Update Taskmaster subtasks/status, Build Tracker mapping, `todo.md`, and internal records as triggered by completed components and validation evidence. | Taskmaster graph, Airtable Build Tracker, `docs/internal/*` | VIYO Build Tracker Cross-Reference and Post-Build rules. | Medium |

## Build Tracker Feature IDs

T73 is a PRD-feature task and therefore affects Build Tracker records. Cached Airtable evidence confirms these exact Image Studio editing records exist:

| Build Tracker Feature ID | Airtable record ID | Feature name | T73 relationship |
|---|---|---|---|
| `T27-TOUCH-EDIT` | `recekaJV8nONV3rjl` | Implement Image Studio Editing Tools: Touch Edit | Covered by the ten-tool router coverage matrix. |
| `T28-LAYER-SPLIT` | `recIv8UDe7XSnXKBp` | Implement Image Studio Editing Tools: Layer Splitting | Covered by the ten-tool router coverage matrix. |
| `T29-BG-SWAP` | `recSHS7KxXbLocDI9` | Implement Image Studio Editing Tools: Background Swap | Covered by the ten-tool router coverage matrix. |

The cached Build Tracker search did **not** show separate exact Feature IDs for `text_edit`, `object_removal`, `canvas_expand`, `upscale`, `quick_edit`, `style_transfer`, or `material_swap`. I will not create junk records during implementation. Proposed Phase 8 sync behavior is to update the confirmed T27/T28/T29 records with Taskmaster Task ID `73` and a T73 coverage note, then report the seven missing exact Feature IDs to the PO if no matching records are found in the live Build Tracker search.

## Proposed Taskmaster Layer Subtasks After Approval

After approval, I will create only the affected-layer subtasks under T73, not all 13 layers:

| Proposed subtask | Layer | Purpose |
|---|---|---|
| Wire Layer 3: Editing API contract payload coverage | 3 | Verify `editingTool` request/response metadata through the frontend API boundary. |
| Wire Layer 6: Editing tool picker UI coverage | 6 | Prove all ten approved tools render from shared-derived definitions and no placeholder controls are exposed. |
| Wire Layer 7: Editing selection state and metadata UX | 7 | Prove selected tool state, source input requirements, and route detail rendering are correct. |
| Wire Layer 8: Editing router/provider capability matrix | 8 | Prove backend-supported/local-only semantics across the ten tools. |
| Wire Layer 10: Validation gate evidence | 10 | Run and record lint/type/build/test/browser checks. |
| Wire Layer 12: CI/deploy trigger verification | 12 | Verify workflow file integrity and pipeline status after pushes. |
| Wire Layer 13: Taskmaster, Airtable, and internal-record sync | 13 | Close out T73 with tracker/status evidence. |

## Approval Request

Please approve this Phase 2 plan if you agree with the surgical scope: **coverage and wiring hardening for the existing ten editing tools, no speculative provider provisioning, no new storage/auth/billing infrastructure, and Build Tracker sync for confirmed T27/T28/T29 records while reporting missing exact Feature IDs for the remaining seven tools.**
