# Phase 6 Image Studio PO-Rejection Repair Architecture Plan

**Author:** Manus AI
**Date:** 2026-04-28
**Taskmaster anchor:** T26.1, under T26 `T26-STUDIO-FRONTEND`
**Status:** Awaiting PO approval before product-code changes

## 1. Executive Repair Position

The PO ruling rejected Phase 6 because the delivered surface is a schema-bound generation wrapper rather than the standalone design tool mandated by PRD V5 Addendum §26 and Architecture Lock v6.1. The current implementation does have a working route-bound `ImageStudio` component, a generic aspect-ratio dropdown, a full A1–A22 mode inventory, a Visual Engine V2 editing-tool inventory, and a typed API wrapper that posts to `artDirector.routeGeneration`.[1] [2] However, it does not yet model the studio as a conversational, cost-aware, recoverable creative workspace with library-driven prompt/style selection, explicit routing/scoring transparency, and export controls.

> **Repair principle:** This repair must rebuild Image Studio as a standalone design workspace around the existing Art Director contract. It must not add superficial controls to the rejected command panel and call that complete.

No backend schema change is required for the first repair pass because the shared response contract already exposes the core metadata needed for user-visible scoring, cached-vs-zero-shot status, token action, billing mode, feature-flag state, trace duration, thresholds, resolved Brand Vault mentions, and generation pipeline details.[3]

## 2. Current-State Audit Against the Six Rejection Gaps

| PO rejection gap | Current implementation evidence | Repair conclusion |
|---|---|---|
| Aspect ratio selector | `ImageStudio` has a generic `<select>` bound to `studioAspectRatios`, but the options are not contextualized by mode or platform; A8 does not present platform-specific sizing guidance.[1] [2] | Keep typed schema options, but replace the generic control with a mode-aware aspect/platform selector that displays recommended uses, pixel targets, and invalid/unsupported-state messaging before generation. |
| Token economics and billing UI | The submit button does not display estimated generation cost before routing. The latest response panel only shows actual `costTokens` after success. A reusable `InsufficientTokensModal` exists but is not wired into Image Studio.[1] [4] | Add a pre-generation estimate panel, current balance display through existing billing APIs, disabled/confirm states for insufficient balance, and 402/`insufficient_tokens` recovery through the existing modal. |
| Conversational interface | The current right rail is a form named “AI command panel,” not a chat-based interaction model. There is no command parser for `/mockup`, `/poster`, or similar slash commands.[1] | Replace the command-panel primary interaction with a conversation composer and message timeline. Slash commands become first-class presets that set mode, aspect, prompt scaffolding, and optional library template. |
| Error states and scoring visibility | There is a red error text box and loading skeleton, but no differentiated timeout, provider, billing, cache, or validation states. Scoring, router threshold, feature flag, cached pattern, zero-shot prompt model, and routing path are mostly hidden.[1] [3] | Introduce a typed generation-state machine and visibility panel showing score, threshold, router-enabled flag, cache/pattern vs zero-shot, fallback reason, selected model, provider tier/gateway, pipeline steps, and trace duration. |
| Style/prompt library | No template, industry pack, or user-saved style UI exists. The request schema has `styleId`, but the current UI never exposes it.[1] [3] | Add an in-memory Studio Library layer for pre-built templates, industry packs, saved-style placeholders, prompt starters, and Brand Vault-aware command insertion; wire selected `styleId` when present. |
| Multi-format export | Canvas cards display image URLs and metadata only. There are no PNG, JPG, WebP, PDF, resolution, or production-size controls.[1] | Add export controls per asset and for the canvas workspace. The initial repair can provide deterministic client-side download actions for source URL formats where feasible and explicit production-resolution/PDF option state for backend handoff. |

## 3. Proposed Product Architecture

The repaired Image Studio should become a three-zone workspace: a left **Studio Library and Mode Planner**, a center **Canvas and Generation Inspector**, and a right/bottom **Conversational Composer**. On desktop, the layout should preserve the existing broad canvas affordance. On mobile, the same zones should collapse into accessible tabs so the chat composer, library, and selected asset inspector remain reachable without horizontal scrolling.

| Zone | Responsibilities | Primary state it owns |
|---|---|---|
| Studio Library and Mode Planner | Provides A1–A22 mode cards, platform/aspect-ratio recommendations, pre-built templates, industry packs, user-saved style placeholders, and Visual Engine V2 editing tool selection. | `selectedMode`, `selectedAspectRatio`, `selectedPlatformPreset`, `selectedTemplateId`, `selectedIndustryPackId`, `selectedStyleId`, `selectedTool`. |
| Conversational Composer | Provides chat messages, slash-command parsing, prompt drafting, Brand Vault mentions, source asset URLs/IDs, edit target instructions, estimated token cost, balance warning, and final generate action. | `conversation`, `activeSlashCommand`, `promptDraft`, `sourceAssetIds`, `sourceImageUrls`, `targetRegionDescription`, `estimatedCostTokens`, `tokenBalance`, `billingRisk`. |
| Canvas and Generation Inspector | Presents generated assets, loading/timeout/failure states, scoring and routing transparency, cache vs zero-shot status, feature flag visibility, export controls, and trace metadata. | `generationState`, `canvasAssets`, `selectedAssetId`, `lastResponse`, `lastError`, `exportFormat`, `exportResolution`. |

This design keeps the existing API wrapper as the transport boundary but moves the UI from a single monolithic component into composable sections with pure helper functions that can be unit-tested. The first repair implementation should prefer local component composition rather than introducing new global stores unless the actual code becomes unmaintainable.

## 4. File-Level Wiring Plan

| File | Action | Purpose |
|---|---|---|
| `apps/web/src/components/studio/ImageStudio.tsx` | Refactor from monolith to orchestration shell. | Own top-level state, submit handler, API calls, and component wiring. |
| `apps/web/src/components/studio/ImageStudio.test.ts` | Expand pure helper tests and add coverage for all six rejection gaps. | Prevent another thin-wrapper completion by asserting ratio presets, slash commands, billing/error interpretation, library data, scoring metadata, and export options. |
| `apps/web/src/lib/studio-contract.ts` | Extend with UI-safe static contracts. | Add mode-aware aspect/platform presets, slash-command definitions, library templates, industry packs, export format/resolution definitions, token-estimate helper, and error classifier. |
| `apps/web/src/lib/studio-api.ts` | Preserve typed transport; improve error type extraction only if required. | Continue parsing `RouteGenerationInput` and `RouteGenerationResponse`; expose status/code enough for billing recovery. |
| Existing billing components | Reuse, not rewrite. | Wire `InsufficientTokensModal` and billing client functions into the Studio flow where appropriate. |

The implementation should avoid new database tables in this repair pass. User-saved styles can be represented as disabled/empty-state UI if no persistence endpoint exists, but the UI must still show the feature category, selection affordance, and clear “save style” path/state rather than omitting the library requirement.

## 5. State Machine and Error Handling Plan

The current `isSubmitting` boolean is insufficient for the rejected scope. The repair should introduce a small explicit generation status model.

| State | User-facing behavior | Exit criteria |
|---|---|---|
| `idle` | Composer and library are editable. Cost estimate is visible. | User submits a valid prompt or slash command. |
| `estimating` or derived estimate | Cost panel updates from selected mode/tool/aspect and prompt complexity. | Inputs stabilize or balance fetch resolves. |
| `preflight_blocked` | Generate is disabled or guarded when required fields, source assets, or balance are missing. | User fixes input or opens top-up. |
| `routing` | Canvas shows a skeleton with trace-friendly copy. Composer is disabled but visible. | API resolves, fails, or times out. |
| `succeeded_cached` | Asset card emphasizes cached pattern reuse and free-cache billing when applicable. | User edits, exports, or starts next command. |
| `succeeded_zero_shot` | Asset card emphasizes zero-shot model path, score, threshold, and pipeline steps. | User edits, exports, or starts next command. |
| `failed_recoverable` | Error panel shows provider timeout/error, validation, billing, or insufficient-balance recovery path. | Retry, edit prompt, or top-up. |
| `failed_terminal` | Error panel preserves trace ID/status and gives support-ready context without claiming success. | User changes inputs or copies trace. |

## 6. Acceptance Matrix for the Repair

| Requirement | Concrete acceptance criteria | Validation evidence |
|---|---|---|
| Aspect ratio selector | User sees a pre-generation selector with mode/platform recommendations, selected ratio is submitted in `RouteGenerationInput`, and A8/platform-oriented copy is visible. | Unit test for ratio recommendations; browser proof on Studio route. |
| Token economics and billing | User sees estimated cost before generation, current/placeholder balance state, generate disabled or warned when insufficient, and 402/`insufficient_tokens` opens the existing modal. | Unit test for estimate/error classifier; component visual/browser proof. |
| Conversational interface | Primary input is a chat composer with command timeline and slash commands such as `/mockup` and `/poster`; commands mutate mode/aspect/template state. | Unit tests for slash parser; browser proof showing command chips and generated composer state. |
| Error/scoring visibility | Success cards and inspector show score, threshold, router enabled flag, cache/pattern vs zero-shot, fallback reason, model/provider, token action, billing mode, and trace duration. Failures show classified copy. | Unit tests around `resultToCanvasAsset`; browser proof after mocked or fixture-driven response if needed. |
| Style/prompt library | UI exposes pre-built templates, industry packs, prompt starters, and user-saved style state. Selecting a template updates prompt/mode/aspect; `styleId` is wired when available. | Unit tests for library definitions and selection helpers; browser proof. |
| Multi-format export | Each asset exposes PNG, JPG, WebP, and PDF options plus resolution choices. Unsupported backend conversion is transparently marked instead of hidden. | Unit tests for export option definitions; browser proof on asset card. |

## 7. Validation Plan

The validation gate will run the web package’s static and build commands, plus the repository’s relevant test suite. The available web package scripts are `lint`, `type-check`, `test`, and `build`.[5] The minimum evidence set for completion will be:

| Validation command | Expected result |
|---|---|
| `pnpm --filter @viyo/web lint` | No ESLint errors in the repaired Studio files. |
| `pnpm --filter @viyo/web type-check` | TypeScript accepts new contracts, component props, and API error typing. |
| `pnpm --filter @viyo/web test -- ImageStudio` or equivalent | Image Studio tests cover the six rejected requirements. |
| `pnpm --filter @viyo/web build` | Vite production build succeeds. |
| Live browser validation | Studio route renders with the rebuilt library/composer/canvas/inspector/export surfaces and no visible runtime errors. |

## 8. PO Approval Request

Approval is requested for this repair architecture before product-code changes. The implementation will be incremental and will not proceed to Phase 7. It will remain scoped to the Phase 6 rejection repair unless new source-of-truth requirements emerge.

## References

[1]: ./current-audit-context.txt "Current ImageStudio.tsx audit context"
[2]: ../phase6-ui/taskmaster-image-studio-task-details.txt "Taskmaster Image Studio task details"
[3]: ../../packages/shared/src/schemas/art-director.ts "Shared Art Director route generation schema"
[4]: ../../apps/web/src/components/billing/InsufficientTokensModal.tsx "Reusable insufficient tokens modal"
[5]: ../../apps/web/package.json "Web package validation scripts"
