# Architecture Lock: Brand Chat & Comments Subsystem

**Document Version:** 3.0 (PRD Product Architect Depth)
**Update Description:** Replaced the prior v1 repository lock with the PO-approved v3.0 architecture lock, preserving the exact 11-value `comment_target_type` enum and confirming `general` as the valid catch-all entity type for brand-level comments that do not attach to a specific asset.
**Update Reason:** PO instruction dated 2026-04-27 directed replacement of the earlier architecture-lock content before T45 proceeds.
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** None. This subsystem remains a pre-approved architecture lock only and is not assigned to a composite task number.
**Covered Implementation Tasks:** T33, T34, T35, T36
**Primary Replacement Source:** `/home/ubuntu/upload/Architecture_Lock_Brand_Chat_&_Comments_Subsystem_(T33-T36).docx`

> This file supersedes the prior Brand Chat architecture-lock content in this repository. Builders must use this v3.0 document for Sprint 2 implementation planning and must not rely on the earlier v1 schema, endpoint, or entity taxonomy.

## 1. Source Declaration

| Source ID | Source Path or Title | Authority Status | Sections Read | Facts Extracted | Gaps or Conflicts |
|---|---|---|---|---|---|
| S1 | `/home/ubuntu/upload/PO_Instruction_Architecture_Lock_Corrections_&_Source-of-Truth_Enforcement.docx` | approved source opened | Full correction instruction | The four v1 architecture locks must be discarded and replaced before T45 proceeds. | None for this replacement action. |
| S2 | `/home/ubuntu/upload/Architecture_Lock_Brand_Chat_&_Comments_Subsystem_(T33-T36).docx` | approved source opened | Full v3.0 lock | Database schema, enum taxonomy, tRPC contract, UI flow, RLS policy, release flag, and rollback rule. | Prose says “10 specific entity types,” while the enum lists 11 values. The active PO ruling resolves this by making the enum authoritative and confirming `general` as valid. |
| S3 | Active PO ruling in conversation on 2026-04-27 | approved source opened | Version and enum rulings | Use v3.0 as the visible version label; keep all 11 enum values exactly; `general` is a valid catch-all entity type. | None. |

## 2. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| Objective | Implement a unified, cross-surface comment and tagging system that allows users to discuss specific entity types with `@` user mentions and `#` entity references. |
| Builder outcome | Complete the Drizzle schema, tRPC router, and React components for the Chat Panel and Pin-on-Canvas surfaces. |
| Acceptance checks | A user can create a comment tagged to any allowed entity type; a user can `@` mention a workspace member and trigger a notification; a user can `#` reference another entity and navigate to it; pin-on-canvas comments render at the correct `anchor_x` and `anchor_y` coordinates. |
| Non-goals | Real-time WebSocket typing indicators are out of scope for Sprint 2. |
| Constraints | All tables must enforce `brand_id` RLS isolation. |
| Source-confirmed assumptions | Comments are brand-isolated, support threaded replies, support canvas anchors, support mention arrays, and support reference arrays. |
| Open decisions | None for architecture-lock replacement. The PO has resolved the enum ambiguity by confirming that `general` is valid. |

## 3. Prior-Artifact Back-Propagation Register

| Affected Artifact | Issue Discovered | Root Source of Truth | Required Correction | Build Blocking | Owner | Verification Evidence |
|---|---|---|---|---|---|---|
| `docs/architecture/brand-chat-comments-subsystem.md` | The prior v1 lock used a narrower schema and did not preserve the v3.0 entity taxonomy, mention/reference extraction, and canvas-anchor contract. | S1, S2, S3 | Replace the file with this v3.0 source-of-truth lock. | Yes | Manus AI | This file has been overwritten with v3.0 content. |
| Prior builder assumptions about Brand Chat composite assignment | Earlier draft context incorrectly associated Brand Chat with a T45 composite mapping. | Active PO Option A ruling and S3 | Keep Brand Chat architecture-only with no composite task number. | Yes | Manus AI | Metadata in this file states `Composite Task: None`. |

## 4. Database Schema

### 4.1 `comments` Table

| Column | Type | Nullable | Default | Foreign Key / Constraints | Description | Source |
|---|---|---:|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key | Primary identifier. | PRD V5 |
| `workspace_id` | `uuid` | No | None | FK: `workspaces.id` | Tenant isolation. | PRD V5 |
| `brand_id` | `uuid` | No | None | FK: `brands.id` | Brand isolation. | PRD V5 |
| `author_id` | `uuid` | No | None | FK: `users.id` | Comment creator. | PRD V5 |
| `target_type` | `enum` | No | None | `comment_target_type` | Entity being discussed. | PRD V5 §27 |
| `target_id` | `uuid` | No | None | None specified in source | Identifier of the target entity. | PRD V5 |
| `content` | `text` | No | None | None specified in source | Raw Markdown content. | PRD V5 |
| `parent_id` | `uuid` | Yes | `null` | FK: `comments.id` | Threaded replies. | PRD V5 |
| `is_resolved` | `boolean` | No | `false` | None specified in source | Resolution status. | PRD V5 |
| `anchor_x` | `numeric(7,2)` | Yes | `null` | None specified in source | Canvas X coordinate. | PRD V5 |
| `anchor_y` | `numeric(7,2)` | Yes | `null` | None specified in source | Canvas Y coordinate. | PRD V5 |
| `mentioned_user_ids` | `uuid[]` | No | `'{}'` | None specified in source | Users tagged via `@`. | PRD V5 |
| `referenced_entity_ids` | `uuid[]` | No | `'{}'` | None specified in source | Entities tagged via `#`. | PRD V5 |

### 4.2 `comment_target_type` Enum

The `comment_target_type` enum must exactly match the PRD V5 §27 taxonomy. The active PO ruling confirms that `general` is a valid entity type and is the catch-all for brand-level comments that do not attach to a specific asset.

| Exact Value | Meaning | Source |
|---|---|---|
| `image` | Comment targets an image. | PRD V5 §27 |
| `email` | Comment targets an email. | PRD V5 §27 |
| `product` | Comment targets a product. | PRD V5 §27 |
| `segment` | Comment targets a segment. | PRD V5 §27 |
| `flow` | Comment targets a flow. | PRD V5 §27 |
| `event` | Comment targets an event. | PRD V5 §27 |
| `calendar` | Comment targets a calendar item. | PRD V5 §27 |
| `strategy` | Comment targets a strategy item. | PRD V5 §27 |
| `branding` | Comment targets a branding item. | PRD V5 §27 |
| `support` | Comment targets a support item. | PRD V5 §27 |
| `general` | Catch-all entity type for brand-level comments that do not attach to a specific asset. | PRD V5 §27 and PO ruling |

## 5. API Contract

### 5.1 `chat.createComment`

| Field | Locked Contract |
|---|---|
| API style | tRPC procedure |
| Procedure name | `chat.createComment` |
| Authentication | Source requires workspace/brand access through RLS; implementation must enforce current VIYO authenticated-user conventions. |
| Side effects | Extracts `@` mentions into `mentioned_user_ids`; extracts `#` references into `referenced_entity_ids`; emits `team.mention.created` Inngest event if users are mentioned. |

```ts
{
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  parentId?: string;
  anchorX?: number;
  anchorY?: number;
}
```

## 6. UI/UX Interaction Flow

### 6.1 Creating a Pin-on-Canvas Comment in Image Studio

The Image Studio pin flow is locked as the primary canvas interaction path. A user clicks the **Comment** tool in the Studio toolbar, the cursor changes to a crosshair, and the user clicks anywhere on the canvas image. A floating popover input appears at the selected `anchor_x` and `anchor_y` coordinates. The user types the comment and presses Enter or clicks **Post**. The comment marker appears on the canvas, and the comment is added to the right-hand Chat Panel.

| State | Locked Behavior |
|---|---|
| Entry point | Studio toolbar **Comment** tool. |
| Cursor state | Crosshair after the tool is selected. |
| Placement | User click determines `anchor_x` and `anchor_y`. |
| Input surface | Floating popover input at the anchor point. |
| Submit actions | Enter key or **Post** click. |
| Result | Canvas marker appears and the same comment appears in the right-hand Chat Panel. |

## 7. Security and RLS

The comments table must enforce brand-level RLS. The source policy is:

```sql
CREATE POLICY "Users can view comments in their brand" ON comments
FOR SELECT USING (
  brand_id IN (SELECT brand_id FROM user_brand_access WHERE user_id = auth.uid())
);
```

## 8. Event Wiring

| Event | Trigger | Payload Source | Required Behavior |
|---|---|---|---|
| `team.mention.created` | `chat.createComment` detects one or more `@` mentions. | Mention extraction from `content` and persisted `mentioned_user_ids`. | Emit an Inngest event so the notification subsystem can notify mentioned users. |

## 9. Release and Rollback Plan

| Release Control | Locked Decision |
|---|---|
| Feature flag | `enable_brand_chat` |
| Rollback | Disable the flag to hide the Chat Panel UI. Database schema remains intact. |

## 10. Supersession Rule

This v3.0 architecture lock supersedes the earlier v1 repository lock and conflicting draft context for T33 through T36. If any implementation task, handoff note, schema draft, endpoint draft, or builder prompt conflicts with this file, the builder must stop and follow this v3.0 lock unless a later PO-approved source explicitly supersedes it.
