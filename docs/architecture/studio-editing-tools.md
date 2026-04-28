# Architecture Lock: Studio Editing Tools

**Document Version:** 3.0 (PRD Product Architect Depth)
**Update Description:** Replaced the prior v1 repository lock with the PO-approved v3.0 architecture lock, including the full 10-tool editing matrix, token deduction and refund flow, unified editing API, asset versioning, event emission, observability, and rollback contract.
**Update Reason:** PO instruction dated 2026-04-27 directed replacement of the earlier architecture-lock content before T45 proceeds.
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T47
**Covered Implementation Tasks:** T27, T28, T29, T30
**Primary Replacement Source:** `/home/ubuntu/upload/Architecture_Lock_Studio_Editing_Tools_(T47).docx`

> This file supersedes the prior Studio Editing Tools architecture-lock content in this repository. Builders must use this v3.0 document for Sprint 2 implementation planning and must not rely on the earlier three-tool summary or older endpoint assumptions.

## 1. Source Declaration

| Source ID | Source Path or Title | Authority Status | Sections Read | Facts Extracted | Gaps or Conflicts |
|---|---|---|---|---|---|
| S1 | `/home/ubuntu/upload/PO_Instruction_Architecture_Lock_Corrections_&_Source-of-Truth_Enforcement.docx` | approved source opened | Full correction instruction | The four v1 architecture locks must be discarded and replaced before T45 proceeds. | None for this replacement action. |
| S2 | `/home/ubuntu/upload/Architecture_Lock_Studio_Editing_Tools_(T47).docx` | approved source opened | Full v3.0 lock | 10-tool matrix, token economics, unified API, edit event emission, canvas integration, asset versioning, observability, feature flag, and rollback rule. | None. |

## 2. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| Objective | Implement 10 distinct AI-powered image editing operations within the freeform canvas, routing through the Tier 2 Aggregator with integrated token deduction and event emission. |
| Builder outcome | Complete the tRPC router for editing operations, UI canvas tools, and Inngest event emission. |
| Acceptance checks | All 10 editing tools are available in the UI; billable operations deduct tokens before execution; failed operations refund tokens; successful operations emit `image.edit.completed`; edits create a new asset version rather than overwriting the original. |
| Non-goals | Real-time collaborative multiplayer editing is out of scope for Sprint 2. |
| Constraints | All operations must enforce `brand_id` RLS isolation. |
| Source-confirmed assumptions | Editing uses the Tier 2 Aggregator by default, charges per tool from the locked matrix, and emits Webhook Pipeline events after completion or failure. |
| Open decisions | None for architecture-lock replacement. |

## 3. Prior-Artifact Back-Propagation Register

| Affected Artifact | Issue Discovered | Root Source of Truth | Required Correction | Build Blocking | Owner | Verification Evidence |
|---|---|---|---|---|---|---|
| `docs/architecture/studio-editing-tools.md` | The prior v1 lock documented only three editing tools and older endpoint assumptions. | S1, S2 | Replace with the v3.0 10-tool matrix, unified API, token flow, asset versioning, and event emission contract. | Yes | Manus AI | This file has been overwritten with v3.0 content. |
| T47 builder prompt assumptions | Any builder plan that implements only Touch Edit, Layer Split, and Background Swap would underbuild the approved v3.0 scope. | S2 | Implement all 10 tools and the associated token/event contracts. | Yes | Builder assigned to T47 | Section 4 contains the canonical tool inventory. |

## 4. Tool Inventory and Provider Mapping

The subsystem must support the following 10 editing tools. These tools route through the Tier 2 Aggregator, Atlas Cloud or fal.ai, by default for cost efficiency unless a later PO-approved source supersedes that routing rule.

| Tool | Capability | Backend Model | Token Cost |
|---|---|---|---:|
| Touch Edit | Click region plus text prompt to modify. | SAM 2 + Inpainting | 25,000 |
| Text Edit | Change text while preserving 3D/style. | GPT Image 2 / Ideogram | 35,000 |
| Layer Splitting | Separate foreground and background. | SAM 2 | 15,000 |
| Background Swap | Replace background while preserving subject. | RMBG + Generation | 30,000 |
| Object Removal | Remove object and let AI fill the gap. | Inpainting (SDXL) | 20,000 |
| Canvas Expand | Outpaint in any direction. | Outpainting (SDXL) | 25,000 |
| Upscale | 2x or 4x resolution enhancement. | Real-ESRGAN | 10,000 |
| Quick Edit | Brightness, contrast, saturation, and crop. | Local Canvas API | 0 |
| Style Transfer | Apply the style of image A to image B. | IP-Adapter | 35,000 |
| Material Swap | Change texture, such as wood to marble. | ControlNet + Generation | 30,000 |

## 5. Token Economics Integration

Every billable editing operation must deduct tokens before execution using the `atomic_token_deduction` RPC. Quick Edit is free because its locked token cost is zero.

| Step | Locked Execution Flow |
|---:|---|
| 1 | User initiates an edit, such as **Upscale**. |
| 2 | UI calls `POST /api/studio/edit`. |
| 3 | Backend looks up token cost from the locked matrix in Section 4. |
| 4 | Backend calls `atomic_token_deduction(workspace_id, cost, 'image_edit')`. |
| 5 | If deduction returns false, backend returns HTTP `402 Payment Required` and emits `billing.tokens.depleted`. |
| 6 | If deduction returns true, backend proceeds to execution. |
| 7 | Backend executes the model call through the selected provider. |
| 8 | If the model call fails with a `5xx` provider error, backend refunds tokens using `atomic_token_refund` RPC and returns HTTP `502`. |

## 6. API Contract

### 6.1 Execute Edit: `POST /api/studio/edit`

#### Request Body

```json
{
  "brand_id": "uuid",
  "source_asset_id": "uuid",
  "tool": "background_swap",
  "parameters": {
    "prompt": "A sunny beach with palm trees",
    "mask_coordinates": null
  }
}
```

#### Response: `200 OK`

```json
{
  "new_asset_id": "uuid",
  "url": "https://r2.viyo.app/ws_abc/assets/edit_123.png",
  "token_cost": 30000,
  "parent_asset_id": "uuid"
}
```

The `parent_asset_id` field is required for lineage tracking. Edits must create a new asset version rather than overwriting the original file.

## 7. Event Emission

Upon successful completion of any billable edit, the backend must emit the following Inngest event for the Webhook Pipeline.

```ts
await inngest.send({
  name: 'image.edit.completed',
  data: {
    workspace_id: user.workspaceId,
    payload: {
      source_asset_id: request.source_asset_id,
      new_asset_id: result.new_asset_id,
      tool_used: request.tool,
      token_cost: cost
    }
  }
});
```

If the edit fails after tokens are refunded, the backend must emit the failed-edit event.

```ts
await inngest.send({
  name: 'image.edit.failed',
  data: {
    workspace_id: user.workspaceId,
    payload: {
      source_asset_id: request.source_asset_id,
      tool_attempted: request.tool,
      error_code: "PROVIDER_TIMEOUT"
    }
  }
});
```

## 8. UX Flow and Canvas Integration

| Canvas Requirement | Locked Behavior |
|---|---|
| Freeform Canvas | Editing tools operate within an infinite canvas UI. |
| Asset Versioning | Edits do not overwrite the original file in Cloudflare R2. They create a new file and a new row in the `assets` table with `parent_asset_id` set to the original, enabling undo/redo and side-by-side comparison. |
| Auto-Save | The resulting image is automatically saved to the Brand Vault. |
| Interactive Masking | For tools such as Touch Edit and Object Removal, the UI must provide a brush tool to generate a black/white mask image. The mask is passed in `parameters.mask_base64` to the API. |

## 9. Observability and Analytics

| Category | Locked Requirement |
|---|---|
| Metrics | Log tool usage frequency, average execution time per tool, and failure rates. |
| Alerts | Alert if token refund rate exceeds 5% in a 1-hour window. |

## 10. Release and Rollback Plan

| Release Control | Locked Decision |
|---|---|
| Feature flag | `enable_studio_editing_tools` |
| Rollback | Disable the flag to hide editing tools from the UI. |

## 11. Supersession Rule

This v3.0 architecture lock supersedes the earlier v1 repository lock and conflicting draft context for T27, T28, T29, T30, and T47. If any implementation task, handoff note, tool matrix, endpoint draft, event draft, or builder prompt conflicts with this file, the builder must stop and follow this v3.0 lock unless a later PO-approved source explicitly supersedes it.
