# T45 Phase 3 Wiring Blueprint — Composite Database Foundation

**Author:** Manus AI  
**Task:** T45 — Composite Database Foundation for T16, T17, T18, T19, and T20  
**Protocol:** VIYO Development Protocol v2 only  
**Phase:** Phase 3 Global Wiring Blueprint — **Product Owner approval required before implementation**  
**Date:** 2026-04-28  
**Phase 2 Status:** Approved by Product Owner on 2026-04-28  
**PO Ruling Incorporated:** Option A approved; add minimal `brands` table inside T45 before `comments`.

## Approval Gate Summary

This Phase 3 blueprint maps the approved T45 database foundation through every VIYO wiring layer before implementation. T45 remains a **schema/migration/Drizzle foundation task only**. It will not implement tRPC procedures, API handlers, webhook dispatchers, notification senders, OAuth runtime clients, frontend UI, admin UI, or AI router runtime behavior. The implementation will add the minimal `brands` table required by the approved Option A ruling, then create the five compressed database foundations for `comments`, `webhook_endpoints`, `webhook_delivery_logs`, `notification_preferences`, `integration_connections`, and the deterministic `image_prompt_patterns` update.[1]

The product-owner ruling added hard implementation constraints that are binding in Phase 4: the `comment_target_type` enum must contain exactly `image`, `email`, `product`, `segment`, `flow`, `event`, `calendar`, `strategy`, `branding`, `support`, and `general`; `brands` must have a `workspace_id` foreign key and workspace-membership RLS through `check_workspace_access`; `comments` must include the lock-required fields including `anchor_x`, `anchor_y`, `mentioned_user_ids`, and `referenced_entity_ids`; webhook tables must preserve the approved 22-event catalog, encrypted secret storage, `failure_count`, and cascade-on-delete delivery logs; and the `image_prompt_patterns` backfill must be deterministic SQL only.[1] [2] [3]

| Gate Item | Phase 3 Blueprint Decision | Implementation Consequence |
|---|---|---|
| Scope | Schema, SQL migration, Drizzle schema exports, and internal evidence only. | No runtime product behavior is added in T45. |
| Primary layer | Layer 1 Database Schema & Migrations. | One additive SQL migration plus Drizzle schema modules/exports. |
| Security layer | Layer 2 Supabase Auth, Roles & Policies. | Workspace-membership RLS via `public.check_workspace_access(auth.uid(), workspace_id)` for tenant-scoped tables. |
| Contracts layer | Layer 3 Shared Types & Contracts. | Drizzle schema exports provide typed future contracts for backend/API tasks. |
| Runtime layers | Layers 4–8 are intentionally not implemented. | Later tasks consume the foundation; T45 does not expose unwired runtime flows. |
| Evidence layers | Layers 12–13 are affected. | Internal docs and validation evidence must match the actual implementation. |

## Thirteen-Layer Wiring Matrix

The VIYO wiring checklist requires every layer to be explicitly inspected and marked affected or not affected. The table below treats every layer as affected until proven otherwise and documents the exact reason for each classification.[4]

| Layer | Affected? | What Changes | Depends On | Spec Reference | Risk |
|---|---|---|---|---|---|
| **Layer 1 — Database Schema & Migrations** | **Yes** | Add `0007_t45_composite_database_foundation.sql`; create minimal `brands`; create `comments`; create `webhook_endpoints`; create `webhook_delivery_logs`; create `notification_preferences`; create `integration_connections`; add three columns and deterministic backfill to `image_prompt_patterns`; add indexes, constraints, triggers, and comments. | Existing `workspaces`, `users`, `workspace_members`, `image_prompt_patterns`, UUID support, and current migration sequence. | T45 PO ruling; T16–T20 Taskmaster records; Brand Chat lock; Webhook Pipeline lock; R20 image pattern schema lock.[1] [2] [3] [5] | Highest risk layer because schema shape, FK ordering, enum values, and RLS assumptions must be exact. Mitigation: additive migration, explicit enum/catalog constraints, clean DB migration test, and schema introspection. |
| **Layer 2 — Supabase Auth, Roles & Policies** | **Yes** | Enable RLS on all new tenant-scoped tables; add policies using `public.check_workspace_access(auth.uid(), workspace_id)`; ensure `brands.workspace_id` anchors brand access; enforce `comments.brand_id` belongs to the same workspace through FK/check-trigger logic as needed; preserve service-role-only model for global `image_prompt_patterns`. | Existing `check_workspace_access` helper and `workspace_members` table from migration `0004_auth_workspace_members.sql`. | PO ruling; current workspace RLS migration; Brand Chat lock RLS expectation.[1] [6] [2] | Incorrect RLS could expose cross-workspace records. Mitigation: no permissive unauthenticated policies; tenant-scoped policy conditions on each table; Phase 6 role-isolation checks where feasible. |
| **Layer 3 — Shared Types & Contracts** | **Yes** | Add Drizzle schema modules `collaboration.ts`, `webhooks.ts`, and `integrations.ts`; update `image-intelligence.ts`; update `schema/index.ts` barrel exports so future backend/API tasks import one canonical schema contract. | Existing Drizzle package and schema export pattern. | Phase 2 approved component inventory; package DB schema conventions.[1] [7] | Contract drift between SQL and Drizzle definitions. Mitigation: keep SQL and Drizzle field names/types aligned and run TypeScript build. |
| **Layer 4 — Backend Services & Workers** | **No — explicitly out of scope** | No Inngest function, webhook delivery worker, mention dispatcher, OAuth refresh job, comment service, or router scoring service will be implemented. The database tables will be shaped so later backend tasks can safely consume them. | Future T43 notification dispatcher, webhook delivery runtime, OAuth integration tasks, and Art Director Router tasks. | PO scope boundary; existing deferred notification dispatch gap.[1] [8] | Risk is false completion if runtime behavior is implied. Mitigation: document T45 as database foundation only and keep no unwired service stubs. |
| **Layer 5 — API Routes & Validation** | **No — explicitly out of scope** | No tRPC procedures, REST endpoints, route validators, rate limits, request schemas, or response schemas are created in T45. Drizzle schema exports will become future API dependencies only. | Future comment APIs, webhook endpoint CRUD APIs, integration OAuth callbacks, and studio/router APIs. | PO scope boundary.[1] | Risk is leaving schema unused until later tasks. This is intentional for Sprint 2 compression; no placeholder API code will be committed. |
| **Layer 6 — Frontend UI & State** | **No — explicitly out of scope** | No React components, Zustand stores, forms, canvas comment UI, preference screens, integration settings UI, or image studio UI are created. | Future UI tasks T24+, T33–T36, and integration settings work. | PO scope boundary.[1] | No frontend browser flow exists to test in T45. Mitigation: Phase 6 will focus on schema/build validation rather than inventing UI smoke tests. |
| **Layer 7 — Admin Portal** | **No — explicitly out of scope** | No curator dashboard, Pattern DB admin UI, webhook management UI, or integration admin UI changes. `image_prompt_patterns` columns will be available to future admin surfaces. | Future admin Pattern DB and configuration tasks. | PO scope boundary; R20 image pattern lock.[1] [5] | Admin may not expose new fields yet. This is acceptable because T45 is foundation-only. |
| **Layer 8 — AI Brains & Prompts** | **No runtime AI changes; schema-adjacent only** | No Art Director Router logic, scoring formula, prompt generation, model routing, fallback behavior, or brain prompts. The `image_prompt_patterns` table gains fields later AI routing will consume. | Future T21 Art Director Router 4D scoring and T22 fallback tasks. | T20 and downstream T21/T22 Taskmaster dependency chain.[3] | Risk that schema update is mistaken for AI behavior. Mitigation: no router code changes; deterministic SQL backfill only. |
| **Layer 9 — Analytics & Audit Trail** | **Yes, database-log foundation only** | `webhook_delivery_logs` creates a durable delivery audit table with status, response, latency, attempt count, and timestamp metadata. No analytics event emitter is added. | `webhook_endpoints` FK and future webhook dispatcher. | Webhook Pipeline lock; T17 Taskmaster record.[3] [5] | Logs may exist before a dispatcher writes to them. This is expected; validation confirms schema readiness, not runtime events. |
| **Layer 10 — Config & Feature Flags** | **No — explicitly out of scope** | No environment variables, feature flags, runtime config, or admin config keys are added. Encrypted secret/token columns are schema storage, not configured services. | Future API and Admin Config work. | PO scope boundary; T17/T19 encrypted storage requirements.[1] [3] | Risk of adding dead config for services not yet provisioned. Mitigation: do not add env vars or feature flags in T45. |
| **Layer 11 — Logs, Monitoring & Error Handling** | **Yes, operational data foundation only** | `webhook_delivery_logs.failure` metadata and endpoint `failure_count` support future operational monitoring. No logger, alerting hook, Sentry instrumentation, or worker error handling is added. | Future delivery worker and observability tasks. | PO webhook constraints; Webhook Pipeline lock.[1] [5] | Runtime monitoring is not complete. Mitigation: clearly separate database support from future observability wiring. |
| **Layer 12 — Documentation & Runbooks** | **Yes** | Maintain Phase 2 and Phase 3 internal docs; update open questions with the approved resolution for the `brands` gap; later Phase 8/9 will include validation evidence and docs-sync requirements. | Approved Phase 2 architecture plan and PO ruling. | VIYO protocol documentation requirements.[4] | Documentation drift if implementation changes. Mitigation: update internal records after implementation and include final changed-file evidence. |
| **Layer 13 — Tests** | **Yes** | Plan and run schema-oriented validation: migration syntax/static inspection, TypeScript package build, repository type-check where available, clean migration feasibility checks where environment permits, and RLS/schema introspection. No UI E2E test will be invented because T45 has no UI. | Existing package scripts and database tooling. | VIYO protocol Phase 5–7 validation requirements.[4] | Local database tooling may be unavailable. Mitigation: run every available check, record skipped items honestly, and do not mark unavailable checks as passed. |

## Object-Level Wiring Detail

The database objects must be created in dependency order. This prevents FK failures and makes clean migration validation deterministic.

| Order | Object | Wiring Detail | Downstream Consumer |
|---:|---|---|---|
| 1 | `brands` | `id` UUID PK, `workspace_id` FK to `workspaces(id)` on delete cascade, `name` text/varchar not null, timestamps, workspace index, RLS through `check_workspace_access`. | `comments.brand_id`; future brand-scoped UI/API. |
| 2 | `comment_target_type` enum | Exactly `image`, `email`, `product`, `segment`, `flow`, `event`, `calendar`, `strategy`, `branding`, `support`, `general`. | `comments.target_type`; later comment APIs. |
| 3 | `comments` | Workspace FK, brand FK, author FK, parent FK, target metadata, markdown body, status/resolution fields, `anchor_x`, `anchor_y`, `mentioned_user_ids`, `referenced_entity_ids`, timestamps, tenant indexes, RLS. | Brand Chat, canvas comments, future mention notification dispatcher. |
| 4 | `webhook_endpoints` | Workspace FK, endpoint URL, encrypted secret, event subscriptions, active flag, failure count, timestamps, RLS. | Future webhook CRUD API and delivery worker. |
| 5 | `webhook_delivery_logs` | Endpoint FK cascade on delete, event type, status, response metadata, latency, attempt count, delivered timestamp, timestamps, endpoint/status indexes, RLS through joined endpoint or denormalized workspace. | Future webhook delivery worker and operational dashboards. |
| 6 | `notification_preferences` | Workspace FK, user FK, event/channel keys, enabled flag default, uniqueness on workspace/user/event/channel, timestamps, RLS. | Future @mention notification dispatch. |
| 7 | `integration_connections` | Workspace FK, provider, encrypted access/refresh tokens, scopes, expiry, channel mappings, metadata, status, timestamps, RLS. | Future Slack and platform integration OAuth flows. |
| 8 | `image_prompt_patterns` columns | Add `supports_typography`, `fidelity_score`, `product_type`; deterministic SQL backfill based on model names; defaults for existing rows. | Future Art Director Router scoring and Pattern DB admin fields. |

## Exact Schema Contract Targets

The contract table below is intentionally implementation-facing. It is not a substitute for the migration, but it defines the minimum columns and constraints the Phase 4 code must satisfy.

| Table | Required Fields and Constraints | Required Indexes / RLS |
|---|---|---|
| `brands` | `id`, `workspace_id`, `name`, `created_at`, `updated_at`; `workspace_id` FK to `workspaces`; no orphan brands. | Index `workspace_id`; RLS for select/insert/update/delete through `check_workspace_access`. |
| `comments` | `id`, `workspace_id`, `brand_id`, `author_id`, `parent_comment_id`, `target_type`, `target_id`, `content`, `anchor_x`, `anchor_y`, `mentioned_user_ids`, `referenced_entity_ids`, `is_resolved`, `resolved_at`, `resolved_by`, `created_at`, `updated_at`; `brand_id` non-null FK to `brands`; target enum exact 11 values. | Indexes on `brand_id`, `workspace_id`, `target_type/target_id`, `parent_comment_id`, `author_id`, and unresolved state; RLS through workspace membership. |
| `webhook_endpoints` | `id`, `workspace_id`, `url`, `secret_encrypted`, `events`, `is_active`, `failure_count`, `last_failure_at`, `created_by`, `created_at`, `updated_at`; encrypted secret column required. | Indexes on `workspace_id` and active endpoints; RLS through workspace membership. |
| `webhook_delivery_logs` | `id`, `endpoint_id`, `workspace_id` if needed for RLS, `event_type`, `status`, `attempt_number`, `response_status`, `response_body`, `error_message`, `latency_ms`, `delivered_at`, `created_at`; endpoint FK cascade on delete. | Indexes on endpoint, workspace/event, status, and created time; RLS through workspace membership. |
| `notification_preferences` | `id`, `workspace_id`, `user_id`, `event_type`, `channel`, `enabled`, `created_at`, `updated_at`; uniqueness for workspace/user/event/channel. | Indexes on workspace/user and event/channel; RLS through workspace membership. |
| `integration_connections` | `id`, `workspace_id`, `provider`, `status`, `access_token_encrypted`, `refresh_token_encrypted`, `scopes`, `expires_at`, `channel_mappings`, `metadata`, `created_by`, `created_at`, `updated_at`; encrypted token columns required. | Indexes on workspace/provider and status; RLS through workspace membership. |
| `image_prompt_patterns` | Add `supports_typography boolean`, `fidelity_score numeric/real`, `product_type text`; deterministic SQL backfill; no runtime inference. | Preserve existing pgvector and service-role-only access model. |

## Webhook Event Catalog Wiring

The PO ruling requires the webhook tables to preserve the exact 22-event catalog from the T48 Webhook Pipeline architecture lock v3.0. The migration must encode this catalog as a constrained event set for `webhook_endpoints.events` and `webhook_delivery_logs.event_type`. No fabricated lifecycle names, product events, generic generated events, or legacy names may be added.

| Domain | Exact Events Planned for Constraint |
|---|---|
| Email | `email.generation.started`, `email.generation.completed`, `email.generation.failed`, `email.export.completed`, `email.export.failed`, `email.status.changed` |
| Image | `image.generation.started`, `image.generation.completed`, `image.generation.failed`, `image.edit.completed`, `image.edit.failed`, `image.saved_to_vault` |
| Brand | `brand.import.started`, `brand.import.completed`, `brand.import.failed`, `brand.assets.updated` |
| Team | `team.comment.added`, `team.approval.granted`, `team.member.invited` |
| Billing | `billing.tokens.low`, `billing.tokens.depleted`, `billing.subscription.changed` |

## Implementation Boundary Guardrails

T45 must avoid dead infrastructure and unwired placeholders. The schema will include future-consumer columns, constraints, and indexes, but it will not create code paths that claim to send webhooks, dispatch notifications, process OAuth callbacks, or route AI prompts.

| Guardrail | Allowed in T45 | Not Allowed in T45 |
|---|---|---|
| Comments | Table, enum, indexes, RLS, Drizzle types. | Comment tRPC/API procedures, canvas UI, mention dispatch. |
| Webhooks | Endpoint/log tables, encrypted secret column, event catalog, cascade FK, RLS. | Webhook signing runtime, dispatcher, retry worker, endpoint CRUD API. |
| Notifications | Preference table and constraints. | Notification sending, in-app/email/push channels, Inngest dispatch. |
| Integrations | Connection table with encrypted token storage fields. | Slack OAuth client, token refresh worker, integration UI. |
| Image routing | Pattern columns and deterministic SQL backfill. | 4D scoring matrix, embeddings query, provider routing, fallback prompt generation. |

## Phase 5–7 Verification Plan Preview

The implementation phase will not be accepted unless the following validation evidence is collected after code is written. Checks that cannot run because required local infrastructure is absent will be reported as **skipped with reason**, never as passed.

| Verification Area | Planned Check | Expected Evidence |
|---|---|---|
| Migration sequence | Inspect migration order and run available DB migration command or SQL parser check. | Command output showing migration is syntactically and dependency-order valid. |
| Drizzle contracts | Build `@viyo/db` and run TypeScript checks. | Zero TypeScript errors for new schema modules and barrel exports. |
| RLS wiring | Inspect policies and, where local DB permits, query role-isolation behavior. | Evidence that every tenant-scoped table has RLS enabled and workspace-membership policies. |
| Deterministic backfill | Review SQL update conditions for `image_prompt_patterns`. | SQL uses model-name/catalog conditions, not runtime inference. |
| No runtime stubs | Grep changed files for API/UI/worker additions outside approved scope. | Evidence that only approved files changed. |
| Quality gate | Run project-appropriate quality checks for implementation and docs. | Quality gate result with any exceptions documented. |

## Open Phase 3 Approval Request

Please approve or revise this wiring blueprint before Phase 4 implementation starts. Approval means I will implement the T45 foundation exactly within this blueprint, enforce the product-owner constraints from the Phase 2 ruling, and use the required commit message:

> `feat(db): T45 composite database foundation — brands, comments, webhooks, notifications, integrations`

## References

[1]: ./t45-database-foundation-phase2-architecture-plan.md "T45 Phase 2 Architecture Plan and PO-approved scope"  
[2]: ../architecture/brand-chat-comments-subsystem.md "Brand Chat and Comments Subsystem architecture lock"  
[3]: ../../.taskmaster/tasks/tasks.json "Taskmaster records for T16–T20 and T45"  
[4]: ../../../skills/viyo-development-protocol-v2/references/cross-system-wiring-checklist.md "VIYO Cross-System Wiring Checklist"  
[5]: ../architecture/webhook-pipeline.md "Webhook Pipeline architecture lock"  
[6]: ../../packages/db/drizzle/0004_auth_workspace_members.sql "Workspace membership helper and RLS policies"  
[7]: ../../packages/db/src/schema/index.ts "Current Drizzle schema barrel export pattern"  
[8]: ./open-questions.md "Open questions and deferred notification dispatch gap"
