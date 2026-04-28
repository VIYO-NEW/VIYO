# T45 Phase 2 Architecture Plan — Composite Database Foundation

**Author:** Manus AI  
**Task:** T45 — Composite Database Foundation for T16, T17, T18, T19, and T20  
**Protocol:** VIYO Development Protocol v2 only  
**Phase:** Phase 2 Architecture Plan — **Product Owner approval required before code**  
**Date:** 2026-04-28

## Approval Gate Summary

This architecture plan defines the smallest safe database-foundation change set for T45. The plan creates the database foundation needed by the five compressed migration tasks: `comments`, `webhook_endpoints`, `webhook_delivery_logs`, `notification_preferences`, `integration_connections`, and the `image_prompt_patterns` column update. The current repository already uses a Drizzle schema package at `packages/db`, with hand-authored SQL migrations under `packages/db/drizzle`, and the active RLS pattern is workspace membership through `public.check_workspace_access(auth.uid(), workspace_id)`.[1] [2]

A **blocking schema gap** was detected during Phase 2. The PO-authorized Brand Chat and Comments lock requires `comments.brand_id` to be a non-null foreign key to `brands.id` and requires brand-level RLS, but the current first-party database schema does not define a `brands` table. The implementation cannot safely create the locked `comments.brand_id` foreign key unless a `brands` table exists. I recommend **Option A**, which adds a minimal `brands` database foundation inside T45 before creating `comments`. This keeps T45 compliant with the architecture lock and avoids a workspace-only security deviation.[3]

| Approval Item | Recommendation | Why It Is Required |
|---|---|---|
| T45 scope | Approve as a medium composite DB-foundation run. | T45 is explicitly a composite task bundling T16–T20 into one architecture plan, one wiring blueprint, one implementation phase, and one integrated Phase 9 completion pass.[4] |
| Brand gap decision | Approve **Option A: add minimal `brands` table in T45**. | The locked `comments.brand_id` FK cannot be implemented without `brands.id`; omitting or weakening it would violate the source-of-truth data model.[3] |
| Migration style | Use one additive SQL migration plus matching Drizzle schema modules/exports. | The repository currently maintains both SQL migrations and TypeScript Drizzle schema modules, so both must remain wired.[1] |
| RLS style | Use `public.check_workspace_access(auth.uid(), workspace_id)` for workspace-scoped tables, with brand consistency checks where `brand_id` exists. | Migration `0004` replaced direct `users.workspace_id` policies with the reusable workspace-membership helper.[2] |
| Secrets | Store encrypted credential material in encrypted text columns, never plaintext tokens in API responses. | T17 and T19 require encrypted webhook/integration secrets and tokens in their Taskmaster implementation details.[5] |

## Blocking Gap Memo

> **GAP-2026-04-28-0008 — T45 Comments `brand_id` Foreign-Key Target Missing from Current DB Schema.** The architecture lock requires `comments.brand_id` as a non-null FK to `brands.id`, but the current database implementation has no `brands` table. This affects DB schema, RLS/auth, API/backend, UI data scoping, notifications, analytics, and source-of-truth synchronization.

| Option | Decision Impact | Security Impact | Recommendation |
|---|---|---|---|
| **Option A — Add minimal `brands` foundation in T45** | Create `brands` before `comments`, with `id`, `workspace_id`, `name`, timestamps, indexes, and workspace-membership RLS. | Preserves the locked brand-scoped model and makes `comments.brand_id` enforceable. | **Recommended.** |
| Option B — Implement comments with `brand_id` but no FK | Allows migration to run without a `brands` table. | Creates orphan-risk and weakens the source-of-truth relationship. | Not recommended. |
| Option C — Implement workspace-only comments temporarily | Avoids adding a table outside the named T16–T20 set. | Conflicts with the Brand Chat architecture lock and weakens brand-level isolation. | Not recommended. |

The gap has been logged in `docs/internal/open-questions.md`. A Taskmaster update attempt was made, but the Taskmaster CLI provider returned an invalid JSON response; I will retry or directly reconcile the tracking record during the next continuous phase after PO approval, without relying on the standalone post-build protocol.

## 1. Component Inventory

The architecture uses surgical scope: one additive migration, source schema modules, package exports, and internal evidence records only. No frontend UI, API handler, webhook dispatcher, notification sender, or external integration client will be implemented in T45.

| # | Component | Type | Path | Purpose | New/Modified |
|---:|---|---|---|---|---|
| 1 | T45 additive SQL migration | SQL migration | `packages/db/drizzle/0007_t45_composite_database_foundation.sql` | Creates T45 tables, RLS policies, indexes, timestamp triggers, and `image_prompt_patterns` column updates. | New |
| 2 | Collaboration schema module | Drizzle schema | `packages/db/src/schema/collaboration.ts` | Exports `brands`, `commentTargetType`, `comments`, and `notificationPreferences`. | New |
| 3 | Webhook schema module | Drizzle schema | `packages/db/src/schema/webhooks.ts` | Exports `webhookEndpoints` and `webhookDeliveryLogs`. | New |
| 4 | Integrations schema module | Drizzle schema | `packages/db/src/schema/integrations.ts` | Exports `integrationConnections` for Slack and future OAuth integrations. | New |
| 5 | Image intelligence schema update | Drizzle schema | `packages/db/src/schema/image-intelligence.ts` | Adds `supportsTypography`, `fidelityScore`, and `productType` to `imagePromptPatterns`. | Modified |
| 6 | Schema barrel export | TypeScript export | `packages/db/src/schema/index.ts` | Re-exports new T45 schema modules. | Modified |
| 7 | Package build output | Generated artifacts | `packages/db/dist/**` | Updated only if the repository convention requires committed package build output after `pnpm --filter @viyo/db build`. | Modified if generated |
| 8 | T45 architecture record | Internal record | `docs/internal/t45-database-foundation-phase2-architecture-plan.md` | Records Phase 2 approval plan, gap memo, and implementation constraints. | New |
| 9 | Open questions register | Internal record | `docs/internal/open-questions.md` | Logs the blocking `brands`/`comments.brand_id` schema gap. | Modified |

## 2. Data Flow

T45 is a database-foundation task. The data flows below describe how later Sprint 2 features will use the schema. T45 itself only creates schema, constraints, RLS policies, and Drizzle exports.

| Flow | Locked/Planned Data Path | T45 Responsibility |
|---|---|---|
| Brand-scoped comment creation | Authenticated user → later `chat.createComment` procedure → validate workspace and brand access → insert `comments` row with `workspace_id`, `brand_id`, `author_id`, target metadata, mention arrays, reference arrays, and optional canvas anchors → emit later `team.mention.created` event if mentions exist.[3] | Create enforceable relational foundation and indexes. Do not build the tRPC procedure or dispatcher in T45. |
| Comment thread query | Authenticated user → later chat/comment API → query `comments` by `brand_id`, `target_type`, `target_id`, and `parent_id` → RLS restricts visibility. | Create indexes on `brand_id`, `target_type/target_id`, `parent_id`, and workspace/brand relationship. |
| Webhook endpoint creation | Workspace admin → later `/api/webhooks` POST → generate 64-character secret → store encrypted secret → subscribe to event array → return endpoint once with secret.[6] | Create `webhook_endpoints` with encrypted secret storage, event array, activity state, failure counter, and RLS. |
| Webhook delivery logging | Later Inngest `deliverWebhook` → select active endpoint by workspace and subscribed event → POST signed payload → insert `webhook_delivery_logs` with status, latency, attempt number, and timestamp.[6] | Create endpoint/log tables, FK cascade, and query indexes. Do not implement dispatch. |
| Notification preference lookup | Later mention dispatcher → read `notification_preferences` by workspace, user, channel, and event type → route or suppress notification. | Create preference table with defaults and uniqueness. Do not send notifications in T45. |
| Integration OAuth storage | Later Slack/future integration OAuth callback → encrypt access/refresh token values → store provider, scopes, expiry, channel mappings, and status. | Create encrypted-token storage table with workspace RLS. Do not implement OAuth clients. |
| Image pattern routing update | Later Art Director Router → query `image_prompt_patterns` with typography support, fidelity score, and product type → compute provider/model fit. | Add columns and deterministic backfill required by T20. Do not implement router scoring in T45. |

## 3. Dependency Map

No new runtime packages are planned for T45. The implementation depends on existing PostgreSQL/Supabase capabilities, the already-installed Drizzle package, and the established SQL helper functions.

| Component | Depends On | Type | Notes |
|---|---|---|---|
| `0007_t45_composite_database_foundation.sql` | PostgreSQL, Supabase Auth, `uuid_generate_v4()`/`gen_random_uuid()`, `public.check_workspace_access` | Internal DB | Existing migrations already use UUID defaults, RLS, and the helper function.[1] [2] |
| `brands` table | `workspaces`, `workspace_members` | Internal DB | Required only if PO approves Option A. Enables the locked `comments.brand_id` FK. |
| `comments` table | `workspaces`, `brands`, `users`, `comment_target_type`, self-reference | Internal DB | Must preserve exact 11-value target taxonomy including `general`.[3] |
| `webhook_endpoints` | `workspaces` | Internal DB | Stores encrypted secret material and subscribed event array. |
| `webhook_delivery_logs` | `webhook_endpoints` | Internal DB | Cascades when endpoint is deleted. |
| `notification_preferences` | `workspaces`, `users` | Internal DB | Supports future mention notification dispatcher already deferred to Sprint 3. |
| `integration_connections` | `workspaces` | Internal DB | Stores encrypted OAuth tokens and channel mappings. |
| `image_prompt_patterns` update | Existing `image_prompt_patterns` table and pgvector index | Internal DB | Adds columns only; existing service-role-only RLS remains. |
| Drizzle schema modules | `drizzle-orm/pg-core`, existing `identity` and `image-intelligence` schemas | npm/internal | No package install planned. |

## 4. Technology Decisions

**Decision 1: Use a single additive SQL migration plus Drizzle schema updates.**  
**Context:** The repository has SQL migrations through `0006_t9_billing.sql` and TypeScript schema modules under `packages/db/src/schema`. The existing package export surface exposes schema modules to application code.[1]  
**Options Considered:** SQL-only migration, Drizzle-only schema update, or both.  
**Chosen:** Use both SQL and Drizzle schema updates.  
**Consequences:** Database state, migration history, type exports, and future backend imports stay consistent.

**Decision 2: Use workspace-membership RLS through `check_workspace_access`.**  
**Context:** Migration `0004_auth_workspace_members.sql` replaced older direct `users.workspace_id` checks with `public.check_workspace_access(auth.uid(), workspace_id)` across tenant tables.[2]  
**Options Considered:** Reuse old `users.workspace_id` subqueries, write bespoke policies for each T45 table, or use the current helper.  
**Chosen:** Use the current helper for every workspace-scoped T45 table.  
**Consequences:** RLS remains aligned with multi-workspace membership and future role expansion.

**Decision 3: Preserve brand-level comments by adding a minimal `brands` foundation if approved.**  
**Context:** The Brand Chat lock requires `comments.brand_id` and brand-level isolation, but no `brands` table exists in the implemented DB schema.[3]  
**Options Considered:** Add minimal `brands`; omit the FK; downgrade to workspace-only comments.  
**Chosen:** Recommend adding minimal `brands` as part of T45.  
**Consequences:** This slightly expands T45 but prevents an immediate security/model deviation and unblocks T16 correctly.

**Decision 4: Implement encrypted-storage columns without adding cryptographic runtime behavior in T45.**  
**Context:** T17 and T19 require encrypted webhook secrets and OAuth tokens, while T45 is a migration/schema task, not an API encryption-service task.[5]  
**Options Considered:** Add database columns only; implement encryption utilities and API flows; or store plaintext.  
**Chosen:** Add encrypted columns and constraints only. Later API tasks must perform AES-256-GCM encryption before insert/update.  
**Consequences:** Schema supports secure storage without adding unwired API or service code.

**Decision 5: Keep `image_prompt_patterns` RLS service-role-only.**  
**Context:** The current image intelligence schema is global VIYO intelligence, not tenant-scoped, with service-role-only RLS.[1] [7]  
**Options Considered:** Add workspace RLS, leave RLS unchanged, or expose read policies to authenticated users.  
**Chosen:** Leave service-role-only RLS unchanged.  
**Consequences:** T20 adds fields without changing the global pattern-cache security model.

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Missing `brands` table blocks `comments.brand_id` FK. | High | High | Obtain PO approval for Option A before implementation. Create minimal `brands` foundation before `comments`. |
| Brand-level RLS source policy references `user_brand_access`, which is not implemented. | High | High | Use workspace-membership RLS plus `comments.workspace_id`/`brands.workspace_id` consistency constraints now; log source-doc follow-up if a dedicated brand-access table is later required. |
| Secret encryption behavior could be misread as complete when T45 only creates columns. | Medium | High | Name columns `*_encrypted`; document that API encryption/decryption is out of T45 scope and must be wired in later API tasks. |
| Event type constraints may become stale if webhook event catalog changes. | Medium | Medium | Implement the 22 locked events as a check constraint or documented TypeScript enum, then surface changes through later migration. |
| `image_prompt_patterns` backfill may incorrectly infer typography support. | Medium | Medium | Use deterministic SQL: set `supports_typography = true` where `target_models` contains Ideogram or GPT Image model strings; default false otherwise. |
| Build output under `packages/db/dist` may drift if not regenerated. | Medium | Medium | Run package build and inspect generated output; commit build artifacts only if repository convention requires it. |
| Taskmaster AI update failure may leave gap note unsynced. | Medium | Medium | Retry Taskmaster tracking after approval; if CLI still fails, update `.taskmaster/tasks/tasks.json` carefully with evidence and note the CLI provider failure. |
| Dependency currency includes TypeScript 5.9.3 while latest is 6.x. | Low | Low | Non-blocking for T45 because audit found no vulnerabilities and no new dependency is planned. Keep as infrastructure observation. |

## 6. Infrastructure Health Check

| Area | Question | Status |
|---|---|---|
| Dependency currency | Are all core packages within one major version of latest? | **Mostly clear.** `pnpm outdated` showed TypeScript 5.9.3 to 6.0.3 and Vitest 2.1.9 to 4.1.5, so there are major-version opportunities, but no T45 dependency change is required. |
| Security posture | Any known CVEs from Phase 1g audit? | **Clear from available audit.** `pnpm audit --audit-level moderate` returned no known vulnerabilities. GitHub Dependabot alert API returned 403, so GitHub alert inspection is unavailable in this environment. |
| Observability coverage | Error capture, alerting, session replay, and performance monitoring? | **Not directly affected.** T45 is schema-only; later webhook/notification dispatchers should log delivery failures and preference-routing outcomes. |
| Missing infrastructure | Does the spec imply services not yet wired? | **Known non-blocking gaps exist.** Notification dispatch is already deferred to Sprint 3, and OAuth/webhook runtime handlers are future tasks. The `brands` DB foundation gap is **blocking** for comments unless Option A is approved. |
| CI/CD health | Are builds green and release tracking active? | **To be verified in later phases.** Phase 5–7 will run type-check, lint/build, migration static checks, and quality gate after approval. |

## Planned Acceptance Criteria for Later Phases

If the PO approves Option A and the Phase 2 plan, Phase 3 will produce the required thirteen-layer wiring blueprint. After Phase 3 approval, implementation will be accepted only if the migration and schema changes satisfy the criteria below.

| Task | Acceptance Criteria |
|---|---|
| T16 | `comments` exists with exact 11-value `comment_target_type`, workspace and brand anchors, author FK, parent-thread FK, target fields, markdown content, resolution state, canvas anchors, mention/reference arrays, indexes, and RLS. |
| T17 | `webhook_endpoints` and `webhook_delivery_logs` exist with encrypted secret storage, subscribed events, active/failure fields, delivery metadata, indexes, cascade behavior, and RLS. |
| T18 | `notification_preferences` exists with workspace/user/event/channel settings, enabled default, uniqueness to prevent duplicate preference rows, and RLS. |
| T19 | `integration_connections` exists with provider, encrypted tokens, scopes, expiry/status, channel mappings, metadata, timestamps, indexes, and RLS. |
| T20 | `image_prompt_patterns` has `supports_typography`, `fidelity_score`, and `product_type`; existing rows are backfilled deterministically; service-role RLS remains unchanged. |

## Product Owner Approval Request

Please approve or revise the following before any code is written.

| Decision Needed | Requested Approval |
|---|---|
| Phase 2 Architecture Plan | Approve this T45 Phase 2 plan as the architecture basis for Phase 3 wiring. |
| Blocking brand gap | Approve **Option A** to add a minimal `brands` table inside T45 so `comments.brand_id` can be implemented as a real FK and brand-scoped comments remain source-of-truth compliant. |
| Scope boundary | Confirm that T45 remains schema/migration/Drizzle foundation only, with no frontend, API router, webhook dispatcher, notification sender, or OAuth runtime client implementation. |

## References

[1]: ../../packages/db/drizzle/0002_tables.sql "Baseline DB tables, indexes, and initial RLS policies"  
[2]: ../../packages/db/drizzle/0004_auth_workspace_members.sql "Workspace membership and check_workspace_access RLS migration"  
[3]: ../architecture/brand-chat-comments-subsystem.md "Brand Chat and Comments Subsystem architecture lock"  
[4]: ../../.taskmaster/tasks/tasks.json "Taskmaster record for T45 composite database foundation"  
[5]: ../../.taskmaster/tasks/tasks.json "Taskmaster records for T16–T20 database migration requirements"  
[6]: ../architecture/webhook-pipeline.md "Webhook Pipeline architecture lock"  
[7]: ../research_specs/R20_DATABASE_SCHEMA_LOCK_ENTERPRISE.md "R20 Database Schema Lock Enterprise"
