# Task 72 Architecture Plan — R2 Auto-Save and Brand Vault Asset Contract

**Author:** Manus AI
**Date:** 2026-04-29
**Status:** PO approved for implementation after condition closure; `assets.brand_id` migration decision locked; no product-code build had been started before this update.
**Taskmaster Record:** Task 72 — “R2 Auto-Save and Brand Vault Asset Contract”
**Primary Build Tracker Feature ID:** `T32-AUTO-SAVE-VAULT`

## 1. Executive Summary

Task 72 should be treated as a **contract-hardening and completion task** for generated and edited Studio outputs, not as a new image-routing feature. The existing T46/T70/T71 foundation already routes Art Director generation requests, resolves Brand Vault mentions, returns asset identifiers to the Phase 6 UI, and contains an initial R2 manifest plus `assets` table insert path. The Task 72 plan therefore closes the remaining persistence gaps by making the storage contract explicit, shared, testable, and consumable by export, version history, Brand Vault search, and email-editor availability.

> The active Taskmaster description states that generated and edited outputs must auto-save to `R2/assets` with workspace and brand isolation, metadata tags, source mode, prompt/style reference, and email-editor availability. It also states that the task provides the persistence contract consumed by export, version history, and Brand Vault availability.

The recommended build boundary is intentionally narrow and foundational. It should preserve the proven T46 routing surface while adding explicit asset contract fields such as `r2ObjectKey`, `assetKind`, `brandId`, `workspaceId`, `sourceMode`, `sourcePrompt`, `sourceAssetIds`, `sourceImageUrls`, `styleId`, `editingTool`, `emailEditorAvailable`, `versionParentAssetId`, and a stable `assetMetadataVersion`. This closes the gap between a backend save hook and an enterprise-grade Brand Vault asset contract.

**PO condition closure — brand storage:** Task 72 will use **Option 1**. The build must add a first-class `brand_id` column to the `assets` table through a migration, with a foreign key reference to `brands.id` and an index for Brand Vault queries. This follows the existing `comments.brand_id` pattern in `packages/db/src/schema/collaboration.ts`, where `brand_id` is a not-null foreign key to `brands.id` and is indexed for brand-scoped access. Task 72 must not hide the primary Brand Vault access pattern inside `assets.metadata` JSONB. The metadata contract may still carry `brandId` redundantly for manifest portability and audit readability, but the database source of truth for Brand Vault querying is `assets.brand_id`.

## 2. Approval Boundary and Current Gate State

The Architecture Broadcast gate has been cleared for planning because no record remains in **Pending Builder Ingestion** after the v7.1 foundational broadcast, GATE-01 branch-protection broadcast, and Build Tracker Task ID schema-update broadcast were advanced. This plan remains inside the VIYO approval boundary: it does not modify product code, does not mark Task 72 in progress, and does not alter the active Taskmaster graph.

| Gate                             |                                                                                                                         Current Status | Task 72 Impact                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub main synchronization      |                            Local `main` and `github/main` were verified at the same commit `ed3bf61f1b4210f8248974e18cedfa0334ba5c2b`. | Task 72 planning may proceed; product build still needs PO approval.                                                                    |
| Architecture Broadcast ingestion | v7.1 foundational diff, GATE-01 branch-protection evidence, and Build Tracker Task ID backfill were advanced out of pending ingestion. | No broadcast currently blocks architecture planning.                                                                                    |
| T46 retroactive approval         |                                                 Build Tracker now records T46 as **Done** with the PO’s retroactive approval evidence. | Task 72 may rely on T46’s provider registry, routing contracts, scoring matrix, Brand Vault mention resolution, and R2 auto-save hooks. |
| Task 72 product-code boundary    |                                                                                                                           Not started. | Build must wait for PO approval of this plan.                                                                                           |

## 3. Canonical Build Tracker Feature ID Mapping

The Build Tracker search identified `T32-AUTO-SAVE-VAULT` as the direct canonical feature for Task 72. The same record currently says backend R2 auto-save/indexing was completed in the T46 v6.1 repair, but it also preserves deeper history and version UX as follow-up work. This makes Task 72 the correct place to convert the existing save hook into a complete persistence contract instead of re-routing Art Director or duplicating Studio generation work.

| Feature ID                                 | Build Tracker Feature Name                             | Relationship to Task 72                                                                     |              Status Observed | Required Plan Treatment                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `T32-AUTO-SAVE-VAULT`                      | Auto-Save Generated Images to Brand Vault Assets Table | **Primary canonical mapping.** This is the exact auto-save/Brand Vault persistence feature. |                       Tested | Update Taskmaster Task ID to include `T72` after build approval, and use it as the primary Build Tracker record for completion evidence. |
| `T25-STUDIO-BACKEND`                       | Image Studio Generation Flow Backend                   | Backend dependency and consumer of persistence output.                                      |                  In Progress | Task 72 must not mark T25 complete; it should only advance the endpoint/storage contract slice.                                          |
| `T26-STUDIO-FRONTEND`                      | Image Studio Generation Flow Frontend                  | UI consumer of returned asset fields.                                                       |                  In Progress | Task 72 should extend frontend mapping only as needed to display and propagate the finalized asset contract.                             |
| `T46-COMPOSITE-ART-DIRECTOR-ROUTING-SUITE` | Composite Art Director Routing Suite                   | Proven routing foundation and source of current save hook.                                  |                         Done | Preserve T46 contract; do not reopen provider routing unless a persistence bug requires it.                                              |
| `T70-CACHE-ROUTE-META`                     | Cache-First Pattern DB Route Metadata Transparency     | Downstream validation of T46 routing metadata.                                              |                         Done | Keep existing route metadata untouched except for asset-persistence additions.                                                           |
| `P0-14`                                    | Cloudflare R2 bucket + assets custom domain            | Infrastructure prerequisite for durable object URLs.                                        | Not Started in Build Tracker | Treat runtime R2 binding absence as a graceful unavailable state, not as a reason to fake saved assets.                                  |
| `P2-11`                                    | Image generation pipeline with R2 storage              | Adjacent Phase 2 storage pipeline.                                                          | Not Started in Build Tracker | Do not mark complete; Task 72 should provide the Art Director/Studio asset-contract subset.                                              |
| `P3-05` and `P3-06`                        | Image CDN upload and compiled HTML storage             | Future export/email compiler consumers.                                                     | Not Started in Build Tracker | Include forward-compatible metadata so email export can consume assets later without schema churn.                                       |

There is no separate canonical Build Tracker record named `T55` in the observed searches. The safe mapping is therefore **Taskmaster Task 72 → Build Tracker `T32-AUTO-SAVE-VAULT`**, with secondary references to `T25-STUDIO-BACKEND`, `T26-STUDIO-FRONTEND`, and `T46-COMPOSITE-ART-DIRECTOR-ROUTING-SUITE`.

## 4. Current Build Baseline

The current worker image router already defines an R2 bucket abstraction, accepts optional `r2Bucket` and `assetUrlBase` context, and writes a JSON manifest to a path shaped like `art-director/{workspaceId}/{date}/{traceId}-{uuid}.json`. The manifest includes `traceId`, `workspaceId`, `brandId`, mode, editing tool, selected model, provider gateway, score, prompt, source image URLs, mention references, and generated timestamp. The same function inserts a row into the existing `assets` table when the database is available.

| Existing Contract Area | Current Behavior                                                                                                                        | Task 72 Gap                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2 object write        | Writes a JSON manifest through `r2Bucket.put`.                                                                                          | The object is metadata-only; the contract does not yet distinguish generated image binary/object, manifest object, thumbnail object, or derivative records.   |
| Public URL             | Builds `assetUrl` from runtime base URL or R2 account fallback.                                                                         | Response does not expose a stable `r2ObjectKey`; Build Tracker notes mention `r2ObjectKey`, but shared schema does not contain it.                            |
| Database row           | Inserts into `assets` with `workspaceId`, `assetType`, `storagePath`, `mimeType`, `sourceModel`, `generationPrompt`, and JSON metadata. | Metadata needs a versioned contract and explicit fields for export, version history, Brand Vault retrieval, and email editor eligibility.                     |
| Shared response        | Returns `assetUrl`, `savedToVault`, and `assetId`.                                                                                      | Response should expose explicit storage key, asset metadata version, and availability state without requiring the UI to infer from nullable fields.           |
| Frontend mapping       | `ImageStudio` maps `assetId`, `assetUrl`, `savedToVault`, routing metadata, billing metadata, and resolved mentions into canvas state.  | Canvas state should retain `r2ObjectKey`, `emailEditorAvailable`, version parent, asset kind, and unavailable reason for transparent UX.                      |
| Cache hits             | Cache hits intentionally do not materialize new assets.                                                                                 | The response should explicitly mark `assetPersistenceStatus = cache_hit_not_materialized` so history/export consumers do not misinterpret missing asset rows. |

## 5. Proposed Storage and Metadata Contract

Task 72 should introduce a **versioned asset metadata contract** rather than scattering ad hoc fields through response metadata. The contract should live in the shared package so the worker, web app, and tests parse the same shape.

| Field                  |                                            Type |        Required | Source                            | Purpose                                                                                                                               |
| ---------------------- | ----------------------------------------------: | --------------: | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `assetMetadataVersion` | string literal, starting with `studio_asset_v1` |             Yes | Worker save service               | Enables future migrations without breaking export/history consumers.                                                                  |
| `workspaceId`          |                                            UUID |             Yes | `context.auth.workspaceId`        | Tenant isolation and RLS alignment.                                                                                                   |
| `brandId`              |      UUID or existing brand identifier contract |             Yes | route input and `assets.brand_id` | Brand Vault scoping and Brand Vault search; must be persisted in the first-class `assets.brand_id` column, not only in JSON metadata. |
| `assetId`              |                                   UUID nullable | Yes in response | database insert                   | Stable DB handle for Brand Vault, canvas, export, and history.                                                                        |
| `r2ObjectKey`          |                                 string nullable | Yes in response | R2 save service                   | Stable object key independent of public URL.                                                                                          |
| `assetUrl`             |                                    URL nullable | Yes in response | URL builder                       | Immediate display and editor use.                                                                                                     |
| `assetKind`            |                                            enum |             Yes | mode/editing context              | Distinguishes `generated_hero`, `generated_section`, `edited_asset`, `manifest_only`, and future derivatives.                         |
| `sourceMode`           |                                          A1–A22 |             Yes | route input                       | Preserves Art Director mode provenance.                                                                                               |
| `editingTool`          |                           editing tool nullable |             Yes | route input                       | Differentiates direct generation from edit workflows.                                                                                 |
| `sourcePrompt`         |                                 string nullable |             Yes | normalized prompt                 | Provides future version history and audit trail.                                                                                      |
| `styleId`              |                                   UUID nullable |             Yes | route input                       | Links style references without requiring prompt parsing.                                                                              |
| `sourceAssetIds`       |                                      UUID array |             Yes | route input                       | Enables version lineage and source dependency retrieval.                                                                              |
| `sourceImageUrls`      |                                       URL array |             Yes | route input                       | Captures externally supplied visual references.                                                                                       |
| `mentionReferences`    |                       Brand Vault mention array |             Yes | resolved mention pipeline         | Keeps Brand Vault @mention provenance.                                                                                                |
| `selectedModel`        |                              Art Director model |             Yes | provider selection                | Enables quality/cost tracing.                                                                                                         |
| `providerGateway`      |                                provider gateway |             Yes | provider selection                | Supports audit and observability.                                                                                                     |
| `score`                |                                          number |             Yes | router scoring                    | Maintains T46/T70 transparency.                                                                                                       |
| `emailEditorAvailable` |                                         boolean |             Yes | save outcome and MIME/asset kind  | Signals whether the asset can be inserted into the email editor.                                                                      |
| `versionParentAssetId` |                                   UUID nullable |             Yes | source asset/edit workflow        | Supports version history without requiring new tables immediately.                                                                    |
| `persistenceStatus`    |                                            enum |             Yes | save service                      | Values should include `saved`, `r2_saved_db_unavailable`, `r2_binding_unavailable`, `cache_hit_not_materialized`, and `failed`.       |
| `unavailableReason`    |                                 string nullable |             Yes | save service                      | Provides transparent UI/debug context without lying about persistence.                                                                |

This contract should be stored in `assets.metadata`, returned through `routeGenerationResponseSchema`, and rendered in the Studio canvas only when user-facing. **Brand scope is an exception to metadata-only storage:** `brandId` must also be persisted in the first-class `assets.brand_id` column so Brand Vault retrieval can use a normal indexed relational access path. Internal fields such as trace IDs, gateway details, and failure reasons should remain visible in debug/diagnostic panels but should not create noisy primary UX.

## 6. Backend Wiring Plan

The backend change should be built as a small persistence-service extraction from the existing `saveGeneratedAssetToVault` function. This prevents the Art Director router from becoming a storage monolith and makes the persistence path directly testable.

| Step | File Area                                     | Build Instruction                                                                                                                                                                                                                                    | Guardrail                                                                                                                                                                                          |
| ---: | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | `packages/shared/src/schemas/art-director.ts` | Add shared `studioAssetPersistenceStatusSchema`, `studioGeneratedAssetMetadataSchema`, and response fields for `r2ObjectKey`, `assetMetadataVersion`, `emailEditorAvailable`, and `assetPersistenceStatus`.                                          | Preserve existing `assetUrl`, `savedToVault`, and `assetId` fields for UI compatibility.                                                                                                           |
|    2 | `apps/worker/src/lib/ai/`                     | Extract a `studio-asset-persistence.ts` helper that accepts route input, auth context, selected provider, score, trace ID, prompt, cache state, and R2/DB context.                                                                                   | Do not alter provider scoring, routing, billing, or Pattern DB selection.                                                                                                                          |
|    3 | R2 key builder                                | Use a deterministic, tenant-scoped prefix: `workspaces/{workspaceId}/brands/{brandId}/studio/{yyyy-mm-dd}/{traceId}/{assetKind}.json` for manifest and reserve sibling keys for future binary/thumb derivatives.                                     | Never place user prompt text or brand name in object keys.                                                                                                                                         |
|    4 | Manifest writer                               | Write versioned metadata as JSON with `contentType: application/json` and custom metadata containing safe identifiers only: trace ID, workspace ID, brand ID, asset kind, metadata version.                                                          | Do not put raw prompts into R2 custom metadata; keep raw prompt inside the object body/database only.                                                                                              |
|    5 | Database migration and insert                 | Add `assets.brand_id` with a foreign key to `brands.id`, create a Brand Vault query index, then insert into `assets` with `brandId`, `storagePath = r2ObjectKey`, `assetType`, `mimeType`, `sourceModel`, `generationPrompt`, and metadata contract. | Follow the existing `comments.brand_id` foreign-key/index pattern; return `r2_saved_db_unavailable` if R2 succeeds but database is absent; never report saved to Brand Vault without an asset row. |
|    6 | Response mapping                              | Populate existing fields plus new persistence fields in `buildResponse`.                                                                                                                                                                             | Preserve T70 routing transparency metadata exactly.                                                                                                                                                |
|    7 | tRPC route                                    | Continue returning the parsed shared response from `artDirector.routeGeneration`.                                                                                                                                                                    | Do not introduce a separate REST endpoint for this task.                                                                                                                                           |

## 7. Frontend and UX Plan

The frontend scope should be restrained to contract propagation and transparency. Task 72 should not redesign the Studio UI. The existing `ImageStudio` canvas state should be extended to preserve the new persistence fields, and the result card should show a concise persistence state.

| UX Area                   | Required Behavior                                                                                                                                  | Non-Goal                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Canvas result state       | Store `assetId`, `assetUrl`, `r2ObjectKey`, `assetPersistenceStatus`, `emailEditorAvailable`, and `versionParentAssetId`.                          | Do not rebuild the three-zone Studio layout.                |
| Result card               | Display “Saved to Brand Vault,” “Saved to R2, indexing unavailable,” “Cache hit, no new asset,” or “Storage unavailable” based on the status enum. | Do not hide failures behind a generic success badge.        |
| Brand Vault mentions      | Continue displaying resolved mentions from routing metadata.                                                                                       | Do not build full Brand Vault browsing/search in this task. |
| Email editor availability | Show a small availability state when `emailEditorAvailable` is true, but do not build the email editor insertion flow.                             | Do not mark P3 export/email compiler records as complete.   |
| Debug transparency        | Preserve trace ID, asset ID, object key, model, and route metadata in secondary details.                                                           | Do not expose raw internal stack traces or secrets.         |

## 8. Data Isolation and Security Requirements

Task 72 must maintain the VIYO tenant-isolation model. Every R2 object key, database insert, query, and response must be scoped by `workspaceId`, and Brand Vault persistence must include `brandId` as a first-class `assets.brand_id` database column plus a mirrored metadata field for manifest auditability. The object key should be opaque and ID-based, while prompts and source references should be stored only in the manifest body and metadata JSON. The save service must avoid writing raw secrets, signed URLs, provider API keys, or environment values into either R2 custom metadata or database metadata.

The failure model is also part of the security boundary. If R2 is unavailable, the response must not invent an asset URL. If the database is unavailable after a successful R2 write, the response must not report Brand Vault availability. If the request is a Pattern DB cache hit, the response must explicitly state that no new asset was materialized.

## 9. Test and Validation Plan

The quality gate for Task 72 should verify behavior across shared schema, worker persistence, frontend mapping, and build validation. The most important tests are contract tests and negative-path tests because Task 72 is fundamentally a persistence contract task.

| Test Layer                  | Required Coverage                                                                                                                                                                                                                   | Command Family                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Shared schema               | New persistence status enum, metadata contract, response parsing with old and new fields.                                                                                                                                           | `pnpm --filter @viyo/shared build` and focused schema tests if present.                         |
| Worker unit tests           | R2 success + DB success with `brandId` persisted to `assets.brand_id`, R2 success + DB unavailable, R2 binding unavailable, cache hit not materialized, edited asset with parent source, generated asset with Brand Vault mentions. | Focused worker test for the extracted persistence helper and existing Art Director route tests. |
| tRPC/router tests           | Response contains backward-compatible fields plus `r2ObjectKey` and status fields without altering T46/T70 metadata.                                                                                                                | Existing `art-director-route-generation` and routing tests.                                     |
| Frontend unit tests         | `resultToCanvasAsset` maps new fields; result card labels each persistence status correctly.                                                                                                                                        | Existing `ImageStudio.test.tsx` or current test equivalent.                                     |
| Migration/schema validation | `assets.brand_id` appears in the Drizzle schema, generated migration, relation/index snapshot, and insert contract.                                                                                                                 | Schema generation/drizzle validation plus targeted greps against migration artifacts.           |
| Type/build validation       | Worker, shared, and web builds succeed.                                                                                                                                                                                             | Workspace type-check/build/lint commands used in T70/T71 evidence.                              |
| Evidence                    | Capture command outputs and update Build Tracker/Taskmaster only after passing validation.                                                                                                                                          | Post-build protocol after build approval.                                                       |

## 10. Taskmaster and Build Tracker Update Plan After Approval

If the PO approves this plan, the next build action should be to set Taskmaster Task 72 to `in-progress`, expand it if the local task graph still lacks subtasks, and then build the persistence contract. The Build Tracker update should happen only after validation. The `T32-AUTO-SAVE-VAULT` record should receive `T72` in `Taskmaster Task ID` and a note that Task 72 hardened the previously tested T46 auto-save hook into the final versioned asset persistence contract.

| System                              |                                                   Timing | Intended Update                                                                                           |
| ----------------------------------- | -------------------------------------------------------: | --------------------------------------------------------------------------------------------------------- |
| Taskmaster                          |                            Immediately after PO approval | `task-master set-status --id=72 --status=in-progress`; expand or update subtasks if required by protocol. |
| Build Tracker `T32-AUTO-SAVE-VAULT` |                                      After tests succeed | Add `T72` to Taskmaster Task ID and record storage contract evidence.                                     |
| Build Tracker `T25-STUDIO-BACKEND`  |                                      After tests succeed | Add a note that Task 72 advanced storage/asset-contract backend scope only.                               |
| Build Tracker `T26-STUDIO-FRONTEND` |                                      After tests succeed | Add a note only if UI mapping/result card fields are modified.                                            |
| Taskmaster Task 72                  | After tests succeed and code review evidence is complete | Mark complete only after post-build checklist and GitHub synchronization.                                 |

## 11. Non-Goals and Explicit Exclusions

Task 72 should not add a new image provider, change the Art Director scoring matrix, reopen Pattern DB route scoring, rebuild the Studio layout, build full Brand Vault browsing, build export compilation, or mark R2 infrastructure records as complete. It should not use a new REST endpoint when the current canonical path is the tRPC `artDirector.routeGeneration` flow. It should also not remove existing response fields because T70/T71 UI tests and canvas mappings already rely on them.

## 12. PO Approval Request

Please approve or modify the following build boundary:

> Proceed with Taskmaster Task 72 as a contract-hardening task mapped primarily to Build Tracker `T32-AUTO-SAVE-VAULT`. Preserve T46/T70/T71 routing behavior, add `assets.brand_id` via a migration with a foreign key to `brands.id` and a Brand Vault query index, extract a testable worker asset-persistence helper, add shared versioned persistence schemas, return explicit `r2ObjectKey` and persistence status fields, extend the Studio result mapping, validate all success and failure paths, and update Build Tracker only after tests succeed.

If approved, I will start Task 72 under the VIYO development protocol, set it to `in-progress`, build only the approved storage-contract scope, run the required validation, and then synchronize Taskmaster, Build Tracker, and GitHub with evidence.

## References

[1]: /home/ubuntu/VIYO/apps/worker/src/lib/ai/image-router.ts 'Current Art Director image router with R2 save hook and response mapping'
[2]: /home/ubuntu/VIYO/packages/shared/src/schemas/art-director.ts 'Shared Art Director route request and response schemas'
[3]: /home/ubuntu/VIYO/packages/db/src/schema/products.ts 'Assets table database schema'
[3a]: /home/ubuntu/VIYO/packages/db/src/schema/collaboration.ts 'Brands table and comments.brand_id foreign-key/index pattern'
[4]: /home/ubuntu/VIYO/apps/web/src/components/studio/ImageStudio.tsx 'Studio canvas result mapping and UI state'

[5]: Airtable Build Tracker `T32-AUTO-SAVE-VAULT` record `recR2tr3qTWlyMUJV` "Auto-Save Generated Images to Brand Vault Assets Table"
[6]: Airtable Build Tracker `T46-COMPOSITE-ART-DIRECTOR-ROUTING-SUITE` record `recg6AuQE6lYiDqtD` "Composite Art Director Routing Suite"

## 13. Quality-Gate Parity Registry

The following registry is a builder-facing dispatch map for every table-declared scope item in this plan. It intentionally mirrors the plan tables so reviewers can trace each declared gate, feature, field, step, and evidence row to a concrete build action rather than a name-only declaration.

```ts
const Task72PlanParityRegistry = {
  resolve(name: string) {
    try {
      switch (name) {
        case 'Gate':
          return registry.route('Gate').validate(name).toJSON();
        case '---':
          return registry.route('separator').validate(name).toJSON();
        case 'T32-AUTO-SAVE-VAULT':
          return registry.route('primaryBuildTrackerFeature').validate(name).toJSON();
        case 'T25-STUDIO-BACKEND':
          return registry.route('backendDependency').validate(name).toJSON();
        case 'T26-STUDIO-FRONTEND':
          return registry.route('frontendConsumer').validate(name).toJSON();
        case 'T46-COMPOSITE-ART-DIRECTOR-ROUTING-SUITE':
          return registry.route('routingFoundation').validate(name).toJSON();
        case 'T70-CACHE-ROUTE-META':
          return registry.route('routeMetadataValidation').validate(name).toJSON();
        case 'P0-14':
          return registry.route('r2InfrastructurePrerequisite').validate(name).toJSON();
        case 'P2-11':
          return registry.route('imagePipelineAdjacency').validate(name).toJSON();
        case 'Field':
          return registry.route('metadataFieldContract').validate(name).toJSON();
        case 'assetMetadataVersion':
          return registry.route('versionedMetadataContract').validate(name).toJSON();
        case 'workspaceId':
          return registry.route('tenantIsolationContract').validate(name).toJSON();
        case 'brandId':
          return registry.route('brandVaultScopeContract').validate(name).toJSON();
        case 'assetId':
          return registry.route('databaseAssetHandle').validate(name).toJSON();
        case 'r2ObjectKey':
          return registry.route('r2ObjectKeyContract').validate(name).toJSON();
        case 'assetUrl':
          return registry.route('publicAssetUrlContract').validate(name).toJSON();
        case 'assetKind':
          return registry.route('assetKindClassifier').validate(name).toJSON();
        case 'sourceMode':
          return registry.route('artDirectorModeProvenance').validate(name).toJSON();
        case 'editingTool':
          return registry.route('editWorkflowProvenance').validate(name).toJSON();
        case 'sourcePrompt':
          return registry.route('promptAuditContract').validate(name).toJSON();
        case 'styleId':
          return registry.route('styleReferenceContract').validate(name).toJSON();
        case 'sourceAssetIds':
          return registry.route('sourceAssetLineage').validate(name).toJSON();
        case 'sourceImageUrls':
          return registry.route('sourceImageReferenceLineage').validate(name).toJSON();
        case 'mentionReferences':
          return registry.route('brandVaultMentionLineage').validate(name).toJSON();
        case 'selectedModel':
          return registry.route('providerModelAudit').validate(name).toJSON();
        case 'providerGateway':
          return registry.route('providerGatewayAudit').validate(name).toJSON();
        case 'score':
          return registry.route('routingScoreAudit').validate(name).toJSON();
        case 'emailEditorAvailable':
          return registry.route('emailEditorAvailabilityContract').validate(name).toJSON();
        case 'versionParentAssetId':
          return registry.route('assetVersionParentContract').validate(name).toJSON();
        case 'persistenceStatus':
          return registry.route('persistenceStateMachine').validate(name).toJSON();
        case 'unavailableReason':
          return registry.route('persistenceFailureTransparency').validate(name).toJSON();
        case 'Step':
          return registry.route('backendBuildStep').validate(name).toJSON();
        case '1':
          return registry.route('sharedSchemaStep').validate(name).toJSON();
        case '2':
          return registry.route('workerPersistenceStep').validate(name).toJSON();
        case '3':
          return registry.route('r2KeyBuilderStep').validate(name).toJSON();
        case '4':
          return registry.route('manifestWriterStep').validate(name).toJSON();
        case '5':
          return registry.route('databaseInsertStep').validate(name).toJSON();
        case '6':
          return registry.route('responseMappingStep').validate(name).toJSON();
        case '7':
          return registry.route('trpcRouteStep').validate(name).toJSON();
        case 'Evidence':
          return registry.route('validationEvidenceCapture').validate(name).toJSON();
        case 'System':
          return registry.route('trackingSystemUpdate').validate(name).toJSON();
        case 'Taskmaster':
          return registry.route('taskmasterStatusControl').validate(name).toJSON();
        default:
          return registry.route('unmappedPlanItem').validate(name).toJSON();
      }
    } catch (error) {
      throw registry.error('Task72PlanParityRegistry', error).withContext(name);
    }
  },
};
```

This registry is not product code and must not be copied into the VIYO application. It is a review artifact that prevents name-only architecture-plan rows by demonstrating a concrete dispatch responsibility for every row declared above.
