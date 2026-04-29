# Task 24 Legacy-Code Implementation Guardrail

**Author:** Manus AI
**Date:** 2026-04-29
**Project:** VIYO
**Scope:** Phase 6.2 corrective evidence addendum; no product-code implementation started.

## 1. Finding Addressed

The deep review correctly identified that **Task 24, “Build Image Studio Page Layout,” had already landed product code before the old graph was cancelled**. The cancellation of Tasks 21–44 removes the old task graph as an active execution authority, but it does not erase the code that was previously delivered. Therefore, Phase 6.2 implementation must treat the Task 24 work as an existing codebase artifact that requires compatibility review and intentional refactor planning before any new standalone Studio-route implementation begins.[1] [2]

> **Guardrail:** Before starting product-code work for the replacement Phase 6.2 graph, especially Task 57 and the downstream Studio UI tasks, the implementer must audit the existing Task 24 Image Studio route, component, tests, and supporting contract files. Reusable schema-bound foundation should be preserved where it remains compatible, while rejected thin-wrapper behavior must be refactored into the approved standalone design workspace.

## 2. Existing Task 24 Footprint

The local Taskmaster registry now marks Task 24 as `cancelled`, but its preserved metadata confirms that the old task was specifically scoped to a `/brand/[brandId]/studio` route with a three-zone layout: **mode picker sidebar**, **freeform canvas**, and **AI command panel**.[1] The repository inspection shows that this scope is represented in existing source files rather than merely in planning notes.[2]

| Existing artifact | Current relevance | Guardrail implication |
|---|---|---|
| `apps/web/src/router.tsx` | Mounts `/brand/$brandId/studio` and renders `ImageStudio` with `brandId` route params.[3] | Task 57 must verify whether the existing route shape satisfies the approved standalone Studio route requirement or whether navigation/route naming must be adjusted without breaking brand scoping. |
| `apps/web/src/components/studio/ImageStudio.tsx` | Implements the current monolithic three-zone UI with A1–A22 mode selection, canvas result cards, prompt submission, editing-tool selection, Brand Vault mention parsing, and R2 metadata display.[4] | Replacement UI work must refactor this component intentionally rather than layering superficial controls over the rejected command-panel pattern. |
| `apps/web/src/components/studio/ImageStudio.test.ts` | Tests the current schema-derived inventories, mention parsing, delimited source parsing, and R2 canvas mapping.[5] | Tests should be retained and expanded so Phase 6.2 verifies the new acceptance matrix instead of losing existing contract coverage. |
| `apps/web/src/lib/studio-contract.ts` and `apps/web/src/lib/studio-api.ts` | Provide current schema-derived UI contracts and typed API transport used by the Studio flow.[6] | These may remain reusable foundations, but the UI contract must be expanded for mode-aware aspect/platform guidance, slash commands, style/prompt library definitions, cost/error interpretation, and export options. |

## 3. Compatibility Position

The existing Task 24 implementation is **not automatically disqualifying** because it already provides useful route, schema, transport, and test foundation. However, it is also **not sufficient** for the corrected Phase 6.2 scope. The prior completion record explicitly states that the delivered work did not claim completion of realtime progress streaming, infinite-scroll generation history, asset-backed `@mention` autocomplete, SAM/RMBG interactive segmentation controls, draggable split-layer canvases, background compositing controls, side-by-side version-history comparison, or undo/redo.[7]

| Category | Compatibility status | Implementation-start action |
|---|---|---|
| Brand-scoped route boundary | Likely reusable but must be verified against the new Task 57 authority. | Confirm the route remains the approved standalone Studio entry point and document any navigation changes before coding. |
| A1–A22 schema-derived inventory | Reusable foundation. | Preserve inventory derivation, then add explicit Phase 6.2 multi-model flow UX where required by Task 76 and Architecture Lock v6.1. |
| Three-zone layout | Partially reusable conceptually, but current command-panel structure was rejected as too thin. | Refactor into Studio Library/Mode Planner, Canvas/Generation Inspector, and Conversational Composer surfaces. |
| Prompt and mention parsing | Reusable helper surface. | Expand from raw mention extraction into brand-aware composer and library interactions when implementing the relevant tasks. |
| Result/R2 metadata mapping | Reusable foundation. | Expand inspector visibility for scoring, threshold, cache/zero-shot path, model/provider, token action, fallback reason, trace duration, and export state. |
| Tests | Reusable baseline. | Expand tests to cover all six rejection gaps and the eight explicit multi-model modes rather than relying on generic inventory checks. |

## 4. Required Pre-Implementation Checklist

Before any product-code commit under the replacement Phase 6.2 implementation graph, the implementer must complete and cite this checklist in the task evidence for Task 57 or the first product-code task that touches the Studio UI.

| Check | Required evidence | Blocking consequence if not satisfied |
|---|---|---|
| Confirm active authority | Cite the approved replacement graph and the cancellation of Tasks 21–44. | Do not use old Task 24 acceptance criteria as the active source of truth. |
| Audit old route/component/tests | Record the current behavior of `router.tsx`, `ImageStudio.tsx`, and `ImageStudio.test.ts`. | Do not overwrite or bypass legacy code blindly. |
| Classify reuse versus refactor | Identify which legacy helpers, tests, and UI regions remain compatible. | Do not start a greenfield rewrite without preserving valid contract coverage. |
| Map to Phase 6.2 tasks | Explicitly map each touched legacy area to the replacement task it supports, such as Task 57 for route scope, Task 58 for conversation, Task 76 for mode flows, or later task IDs for export/history. | Do not create competing implementation paths. |
| Preserve failed-scope boundary | Restate that the current command-panel wrapper is not sufficient for the standalone design workspace. | Do not claim completion by adding superficial controls to the rejected UI. |

## 5. Implementation Recommendation

The best next implementation approach is to treat Task 24 code as a **refactor substrate**. The route and typed contract wiring should be preserved if they pass the Task 57 authority check, while the monolithic `ImageStudio` component should be decomposed around the approved Phase 6.2 workspace model. This avoids both extremes: it prevents a false greenfield rewrite that discards useful validated foundation, and it prevents a false completion claim that merely extends the rejected schema-bound command panel.

No product-code changes were made while producing this guardrail. This document is a corrective evidence artifact only.

## References

[1]: ./task24_legacy_code_guardrail_inspection.txt "Task 24 local metadata and repository footprint inspection"
[2]: ./old_tasks_21_44_cleanup_summary.md "Old Task Graph Cleanup Summary"
[3]: ../../apps/web/src/router.tsx "Current Studio route mount"
[4]: ../../apps/web/src/components/studio/ImageStudio.tsx "Current Image Studio component"
[5]: ../../apps/web/src/components/studio/ImageStudio.test.ts "Current Image Studio tests"
[6]: ./PHASE6_IMAGE_STUDIO_REPAIR_ARCHITECTURE_PLAN.md "Phase 6 repair architecture plan"
[7]: ../phase6-ui/phase6-ui-completion-record.md "Prior Phase 6 UI completion boundary"
