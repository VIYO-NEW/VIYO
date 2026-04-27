# Architecture Lock: Brand Chat and Comments Subsystem

**Author:** Manus AI
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** Not assigned; Brand Chat remains a pre-approved architecture lock only under the PO-confirmed Option A mapping.
**Covered Implementation Tasks:** T33, T35, T36
**Primary Source:** `/home/ubuntu/upload/Pre-Approved_Architecture_Lock_Brand_Chat_&_Comments_Subsystem.docx`

> This file records the Product Owner-approved architecture lock for the Brand Chat and Comments Subsystem. The source attachment used legacy wording that described the document as a Phase 1 architecture plan. Per PO confirmation on 2026-04-27, that label maps to the updated VIYO protocol as **Phase 2 — Architecture Lock**. Builders may reference this file as the authoritative repository source when preparing Phase 2 wiring and Phase 4 implementation work for the covered tasks.

## 1. Subsystem Purpose

The **Brand Chat and Comments Subsystem** provides a unified, real-time collaboration layer across the VIYO platform. It allows users to discuss brand assets, anchor comments to specific email sections, and search communications within a brand context through a PostgreSQL-backed full-text search experience.

| Scope Element | Locked Decision |
|---|---|
| Global component | `<BrandChatPanel brandId={brandId} />` |
| Route boundary | `/brand/$brandId/*` |
| Primary collaboration table | `comments`, created as a dependency of T16 |
| Real-time layer | Supabase Realtime subscription filtered by `brand_id` |
| Search mechanism | PostgreSQL `ts_vector` and GIN index on `body_search` |
| Email editor integration | GrapesJS MJML components with injected `section_id` |
| Composite execution wrapper | Not assigned; covered tasks remain T33, T35, and T36 unless a later PO directive assigns a composite task number. |

## 2. Locked Components

### 2.1 Brand Chat Panel — T33

The Brand Chat Panel is a collapsible right sidebar available globally within the `/brand/$brandId/*` route boundary. It displays comments filtered by `brand_id`, groups discussion by `target_type` and `target_id`, supports threaded replies through a parent-child relationship, renders Markdown content, and provides both `#` entity picking and `@` mention picking. Real-time updates are handled through Supabase Subscriptions.

### 2.2 Section-Anchored Comments — T35

Section-Anchored Comments integrate with the GrapesJS Email Editor. The implementation injects a unique `section_id` into GrapesJS MJML components, displays a comment button when the user hovers over a section, saves section comments with `target_type='email_section'` and `target_id=section_id`, and renders a right-sidebar vertical timeline ordered by each section’s vertical position in the email.

### 2.3 Super-Search — T36

Super-Search is integrated into the Brand Chat Panel. It performs full-text search across comment bodies using PostgreSQL `ts_vector`, supports UI filters for entity tags, date range, author, and status, and returns highlighted snippets with metadata. Clicking a result must deep-link to the relevant asset or email section with the associated comment thread open.

## 3. Database Schema Requirements

The underlying `comments` table is a dependency of T16 and must support the collaboration architecture described in this lock.

| Column | Requirement |
|---|---|
| `id` | UUID primary key |
| `workspace_id` | UUID foreign key to `workspaces` |
| `brand_id` | UUID foreign key to `brands` |
| `author_id` | UUID foreign key to `users` |
| `target_type` | Enum: `asset`, `email_section`, `campaign`, `brand_general` |
| `target_id` | String or UUID identifying the target resource |
| `parent_comment_id` | Nullable UUID foreign key to `comments.id` for threaded replies |
| `body` | Text content with Markdown support |
| `body_search` | `tsvector` generated from `body` |
| `status` | Enum: `open`, `resolved` |
| `created_at`, `updated_at` | Timestamp fields |

| Index | Purpose |
|---|---|
| B-tree on `(brand_id, target_type, target_id)` | Fast lookup by brand and anchored target |
| GIN on `body_search` | Fast full-text search across comment bodies |

## 4. API and Real-Time Data Flow

| Step | Locked Flow |
|---|---|
| 1 | `GET /api/brands/:brandId/comments` fetches comments with filtering and pagination query parameters. |
| 2 | `GET /api/brands/:brandId/comments/search` performs `ts_vector` search against `body_search`. |
| 3 | Supabase Realtime subscribes to `comments` filtered by `brand_id=eq.{currentBrandId}`. |
| 4 | POST, PATCH, and DELETE mutation endpoints update the database and broadcast changes to connected clients. |

## 5. UI, UX, and Accessibility Standards

The subsystem must provide proper `aria-label` values, visible focus rings, and keyboard-operable interaction patterns for all chat, comment, search, and filter controls. Color contrast must meet WCAG 2.1 AA expectations. Search results must clearly indicate matched context, including the relevant target type and enough metadata for users to understand where the result came from.

## 6. Updated VIYO Protocol Mapping

| Directive Label in Source Attachment | Updated Protocol Phase | Operational Meaning |
|---|---:|---|
| Legacy “Phase 1 Architecture Plan” | Phase 2 | This file is the locked architecture source of truth. |
| Legacy “Phase 2 Wiring Blueprint” | Phase 3 | Builders prepare the narrow wiring plan from this lock. |
| Legacy implementation sequencing | Phase 4 | Builders execute implementation for the covered tasks; no composite wrapper is assigned by the current PO directive. |
| Legacy post-build tracking | Phase 9 | Builders complete post-build, Airtable, and delivery records. |

## 7. Implementation Sequence for Covered Tasks

The covered tasks are not assigned to a composite Taskmaster wrapper under the PO-confirmed Sprint 2 directive mapping. The locked implementation sequence remains **T33 → T35 → T36**. Builders must first build the foundational Brand Chat Panel with real-time data fetching and basic posting/threading, then integrate section-anchored comments with GrapesJS and the timeline view, and finally add `ts_vector` search UI and filtering capabilities to the established chat panel.

## 8. Supersession Rule

This architecture lock supersedes conflicting instructions in individual task descriptions for T33, T35, or T36. If a future implementation detail appears to conflict with this lock, the builder must stop and request PO clarification before modifying the architectural intent.
