# Phase 6 Image Studio UI Implementation Plan

**Task:** Phase 6 Image Studio UI implementation
**Authority order:** Taskmaster execution order first, then repaired `@viyo/shared` Art Director v6.1 schemas, then the existing web/worker implementation surfaces.
**Started from Taskmaster task:** T24 — Build Image Studio Page Layout, now marked `in-progress`.

## Current implementation audit

The web app already has a TanStack Router route boundary at `/brand/$brandId/studio`, but the route currently renders a placeholder only. There is no existing Image Studio component tree, canvas state, Studio API client, or Studio store in `apps/web/src`.

The repaired backend surface currently exposes Art Director generation through the worker tRPC procedure `artDirector.routeGeneration` mounted under `/api/trpc/*`. Taskmaster still describes a legacy `POST /api/studio/generate` endpoint, but no such route exists in the worker bootstrap. For this Phase 6 UI implementation, the frontend will bind to the real repaired procedure while preserving a Studio-oriented client boundary that can later be swapped to a REST compatibility endpoint if Taskmaster T25 is implemented separately.

The shared Art Director contract exports all v6.1 enum schemas and inferred types through `@viyo/shared`, including the A1–A22 generation modes, ten editing tools, request fields for Brand Vault mentions/source assets/source images, and response fields for `assetUrl`, `assetId`, `savedToVault`, `palette`, `routingMetadata`, and `traceMetadata`.

## Taskmaster-aligned build order

| Order | Taskmaster anchor | Phase 6 implementation decision |
|---:|---|---|
| 1 | T24 Image Studio layout | Replace the placeholder route with a three-zone Studio shell: mode picker sidebar, freeform canvas, and AI command panel. |
| 2 | T26 generation flow frontend | Add a typed Art Director client, generation form state, loading skeleton, generated image cards, and canvas insertion. |
| 3 | T31 Brand Vault mentions | Add command-panel `@` mention parsing and accessible mention chips from typed user input; live asset query can be added later when an asset listing endpoint exists. |
| 4 | T27–T29 editing tools | Implement UI triggers for the three explicitly-tasked tools and extend the selector to all ten v6.1 editing tools requested by the PO. |
| 5 | T32 auto-save responses | Render and persist returned R2/asset metadata in the canvas and result inspector so saved assets are visible after generation/editing. |
| 6 | Validation | Add unit/component tests for mode inventory, editing inventory, request payload construction, and R2 response rendering, then run web type-check, tests, lint, and build. |

## Acceptance checks

| Requirement | Acceptance check |
|---|---|
| 22 generation modes selectable | The mode picker renders exactly A1 through A22 from shared-schema-derived inventory and updates the request payload `mode`. |
| 10 editing tools triggerable | The command panel renders all ten v6.1 editing tools and sends `editingTool`, `sourceAssetIds` or `sourceImageUrls`, and edit prompt fields when a tool is selected. |
| Repaired schema binding | Request and response parsing uses `routeGenerationRequestSchema` and `routeGenerationResponseSchema` from `@viyo/shared`; UI types use shared inferred types. |
| R2 response handling | Results display `assetUrl`, `assetId`, `savedToVault`, provider/model metadata, trace ID, token action, and palette when present. Canvas state stores the same fields. |
| Taskmaster guidance | T24 remains the active task while the layout and command panel are implemented; dependent generation/editing behavior is implemented as T24-compatible wiring and documented for T26–T32 follow-up status updates. |
| Accessibility | The three-zone layout uses labelled regions, keyboard-selectable mode/tool buttons, form labels, status announcements, and descriptive image metadata. |

## Risk and mitigation

| Risk | Mitigation |
|---|---|
| The worker exposes tRPC, while Taskmaster T25 describes REST. | Build a narrow `studio-api.ts` client around the current tRPC HTTP envelope and keep all transport details isolated from UI components. |
| There is no live Brand Vault asset search endpoint in the web app yet. | Implement schema-compatible mention parsing and chips now; wire live asset autocomplete only when a brand-scoped asset listing surface exists. |
| Backend generation may return null `assetUrl` in unavailable provider/test environments. | Render trace/model metadata and a placeholder result card instead of assuming every response has an image URL. |
| Full SAM/RMBG/local edit interactions are backend/provider-dependent. | Expose all ten editing tool triggers through the repaired `editingTool` contract and source asset fields, while leaving pixel-level segmentation UI as future specialized canvas work. |
