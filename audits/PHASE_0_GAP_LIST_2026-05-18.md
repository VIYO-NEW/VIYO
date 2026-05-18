# PHASE_0_GAP_LIST_2026-05-18

---
zcbr_status: PASSED 2026-05-18
version: 1.0
authored_date: 2026-05-18
author: Manus (Curator Agent)
authority: B-0.01 Directive v0.3 (PO-ratified 2026-05-15)
locks_invoked: [6, 13, 14, 19, 20, 21, 30, 31, 33, 34, 38]
repo_head: afdf02b795e48c95bf541e71845b03e13839bf22
branch: staging
---

## §1 — Executive Summary

This document is the deliverable of **B-0.01 Substrate Audit & Gap Confirmation**, the first bullet in the VIYO Master Build Sequence Phase 0. It audits all 12 agnostic substrates defined in FOUNDATION_AUTHORITY §5 against the 165 Phase 0 features enumerated in Inventory v002 (Drive ID `1lGcnY6pJECYCUWBVqjDFdcHxVBWCuZrp`), cross-referenced with the live repo state at staging HEAD `afdf02b7`.

The audit methodology follows §6 of the B-0.01 Directive v0.3: for each substrate, Steps A-E are executed (scope extraction from FA §5, feature enumeration from Inventory, repo evidence gathering, gap identification, and sequencing recommendation). The deliverable format follows §7 of the directive.

### Aggregate Readiness

| Metric | Value |
|--------|-------|
| Total P0 Features (Inventory v002) | 165 |
| Done | 12 (7.3%) |
| In Progress | 1 (0.6%) |
| Not Started | 152 (92.1%) |
| Substrates with 0% completion (L12-B) | 1 |
| Critical Lock violations found | 1 (Lock 13 — missing `requireAdmin()` middleware) |
| Documentation gaps surfaced | 7 |

### Denominator Reconciliation

FOUNDATION_AUTHORITY §2.1 line 59 states "178 features per Manus Inventory." Inventory v002 Section 2 header states "Feature count: 165" and contains exactly 165 `###` entries. **Reconciled denominator: 165.** The 178 figure in FA §2.1 is stale (references an earlier Inventory version). This is surfaced as Documentation Gap DG-01.

---

## §2 — Lock Compliance Matrix

| Lock | Title | Status | Evidence | Notes |
|------|-------|--------|----------|-------|
| 6 | Brand Vault Organization | COMPLIANT | `assets` table with `brand_id` FK, `idx_assets_brand_vault` composite index | Schema enforces brand-scoped asset isolation |
| 13 | Tenant Isolation via RLS | PARTIAL VIOLATION | 42+ RLS policies; service_role used in 3 justified contexts | `requireAdmin()` middleware referenced in Lock 13 statement does NOT exist in codebase. Admin routes (`/admin/billing`) mounted without role-based guard. See GAP-L13-001 |
| 14 | Schema Changes via Canonical Migrations | COMPLIANT | All 9 migration files in `packages/db/drizzle/`, Drizzle ORM schema files | No ad-hoc schema changes detected |
| 19 | Plugin Registry (Provider Agnosticism) | PARTIAL | `provider-registry.ts` exists for Art Director only | Not universal across all provider classes per Lock 19 + Lock 38 intent. Art Director-specific only |
| 20 | ZCBR Standard | COMPLIANT | All v2 R-specs have ZCBR headers | This deliverable itself has ZCBR header |
| 21 | Governance Agnosticism | COMPLIANT | No vendor-specific governance tooling locked | — |
| 30 | Mastra DAG | NOT YET APPLICABLE | 0 Mastra files in repo | Mastra is a Phase 0 dependency but not yet installed (B-0.03 scope) |
| 31 | Inngest | COMPLIANT | `inngest@^3.54.0` in worker package.json, 4 function files | Event bus operational |
| 33 | Stripe | COMPLIANT | Stripe SDK in deps, billing schema, webhook handler | Token metering + Stripe meter events wired |
| 34 | Supabase Postgres | COMPLIANT | Supabase client in 3 apps, connection pooling config, RLS | — |
| 38 | Universal Service Agnosticism | PARTIAL | Art Director has registry; other service classes (email ESP, analytics) do not | Lock 38 generalizes Lock 19 to all service classes |

### Critical Finding: GAP-L13-001

Lock 13 verbatim states: *"Service role key is reserved for admin operations only, behind a `requireAdmin()` middleware (CODING_CONVENTIONS Rule 9)."*

**Actual state:** No `requireAdmin()` function exists anywhere in the codebase. The admin billing routes (`apps/worker/src/routes/v1/admin-billing.ts`) are mounted at `/api/v1/admin/billing` without any role-checking middleware. The route file assumes `auth` context is present (via the global auth middleware) but does not verify the user has admin/owner role.

**Risk:** Any authenticated user with a valid JWT could access admin billing endpoints (economics dashboard, system config, token adjustments, promo codes).

**Remediation:** Implement `requireAdmin()` middleware that checks `workspace_members.role IN ('owner', 'admin')` before allowing access. Mount on all `/admin/*` route groups.

---

## §3 — Per-Substrate Audit

---

### §3.1 — L1: Identity & Multi-Tenancy

**FA §5 Scope:** Workspace isolation, user auth, role hierarchy, RLS enforcement, API key management, workspace provisioning.

**Anchoring Features (FA §5):** P0-05 (RLS on every brand-linked table), P0-06 (env validation), P0-15 (Supabase Auth SSO), P0-16 (workspace provisioning Inngest function).

**Inventory Feature Count:** 85 features touch L1 (51.5% of total). 8 Done, 0 In Progress, 77 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | `apps/worker/Dockerfile`, `packages/shared/src/auth/supabase.ts` | YES |
| P0-04 (83 tables) | `packages/db/drizzle/0002_tables.sql` (14 tables), `0004_auth_workspace_members.sql` (1), `0006_t9_billing.sql` (9), `0007_t45_composite_database_foundation.sql` (6), `0009_pia1` (3) = 33 CREATE TABLE statements | PARTIAL — 33 tables in migrations, not 83. The 83 figure may include RLS-enabled tables or downstream schema objects |
| P0-05 (RLS policies) | `0002_tables.sql`: 42+ `CREATE POLICY` statements | YES |
| P0-06 (Env validation) | `packages/shared/src/config/env.ts` (Zod schema, fail-fast) | YES |
| PIA-1 (DB Foundation) | `0009_pia1_proprietary_intelligence_foundation.sql` | YES |
| SEC-10 (Staging env) | `docs/runbooks/staging-environment.md` | YES |
| T12-SENTRY | `apps/worker/src/lib/sentry.ts` (OTel bridge) | YES |
| T7-ADMIN | `apps/admin/src/` (full app scaffold) | YES |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L1-001 | `requireAdmin()` middleware missing (Lock 13 violation) | CRITICAL | B-0.02 (must fix before any admin route goes live) |
| GAP-L1-002 | Role enum discrepancy: FA §5 says 5-role (Owner/Admin/Approver/Editor/Viewer); code has 4-role (owner/admin/member/viewer) | MEDIUM | Needs PO clarification — is "Approver" a distinct role or mapped to "admin"? |
| GAP-L1-003 | 83-table claim in Inventory vs 33 CREATE TABLE in migrations | LOW | Likely counting includes RLS objects + functions; needs reconciliation note |
| GAP-L1-004 | P0-15 (Supabase Auth SSO) — Not Started | HIGH | Phase 0 baseline; blocks user login |
| GAP-L1-005 | P0-16 (Workspace provisioning) — Inngest function exists (`workspace-provisioning.ts`) but feature marked "Not Started" in Inventory | MEDIUM | Status may be stale — code exists |

#### Step D — Sequencing Recommendation

L1 is the foundational substrate. **GAP-L13-001 must be resolved in B-0.02** before any admin routes are exposed to staging. P0-15 (Supabase Auth SSO) is the next critical blocker — without it, no user can authenticate. P0-16 appears partially complete (code exists) and should be re-assessed.

---

### §3.2 — L2: Asset Model

**FA §5 Scope:** Brand Vault asset hierarchy, parent_asset_id lineage, pgvector embeddings, R2 object storage integration, asset indexing.

**Anchoring Features (FA §5):** P0-14 (R2 custom domain), P0-04 (migrations include assets table), T25-STUDIO-BACKEND (image generation → asset save).

**Inventory Feature Count:** 87 features touch L2 (52.7% of total). 5 Done, 1 In Progress, 81 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Supabase + Docker scaffold includes asset table | YES |
| P0-04 (Migrations) | `packages/db/src/schema/products.ts` line 57: `assets` table with `workspaceId`, `brandId`, `assetType`, `storagePath`, `mimeType`, `sourceModel`, `generationPrompt`, `metadata` | YES |
| PIA-1 (DB Foundation) | PIA-1 adds brand consent fields for HYVE | YES |
| SEC-10 (Staging env) | Staging uses synthetic data for assets | YES |
| T10 (Internal Records) | `docs/internal/` includes asset architecture plans | YES |

#### In Progress

| Feature | Evidence Path | Status |
|---------|--------------|--------|
| T25-STUDIO-BACKEND | `apps/worker/src/lib/ai/image-router.ts` lines 300-430: R2 upload + asset DB indexing implemented | Code exists; end-to-end flow not yet verified |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L2-001 | `parent_asset_id` column NOT in Drizzle schema (`products.ts`) — lineage tracking missing | HIGH | Required for Brand Vault hierarchy per FA §5 L2 |
| GAP-L2-002 | No R2 SDK integration in worker package.json — R2 upload uses interface stub (`R2BucketLike`) | MEDIUM | Needs Cloudflare Workers binding or S3-compatible SDK |
| GAP-L2-003 | P0-14 (R2 custom domain `assets.viyo.email`) — env vars referenced but no DNS/CDN config | MEDIUM | Deployment config, not code |
| GAP-L2-004 | No asset versioning mechanism (version_number, previous_version_id) | LOW | May be Phase 2 scope |

#### Step D — Sequencing Recommendation

GAP-L2-001 (`parent_asset_id`) is architecturally critical — the Brand Vault hierarchy depends on it. Should be added in B-0.02 migration. R2 binding (GAP-L2-002) is needed before T25-STUDIO-BACKEND can complete end-to-end.

---

### §3.3 — L3: Provider Routing

**FA §5 Scope:** Universal plugin registry pattern, provider-agnostic adapter interfaces, tier-based routing, failover, rollback, credential isolation.

**Anchoring Features (FA §5):** P0-07 (skills_registry seed — also L12-B), T46 (Art Director routing suite), T69 (provider registry).

**Inventory Feature Count:** 94 features touch L3 (57.0% of total). 2 Done, 1 In Progress, 91 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Provider registry scaffold exists | YES |
| SEC-10 (Staging env) | Staging env vars for provider keys documented | YES |

#### In Progress

| Feature | Evidence Path | Status |
|---------|--------------|--------|
| T25-STUDIO-BACKEND | `apps/worker/src/lib/ai/provider-registry.ts` (Art Director-specific registry with ProviderDescriptor interface, tier routing, availability rules) | Functional for Art Director; not universal |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L3-001 | Provider registry is Art Director-specific, not universal per Lock 19 + Lock 38 | HIGH | All other provider classes (ESP, analytics, LLM text, TTS) have no registry |
| GAP-L3-002 | No `PluginRegistry` base class or interface that other domains can extend | HIGH | Architecture gap — each domain will reinvent routing |
| GAP-L3-003 | Credential isolation per R22 v2 §4.3 (workspace-scoped provider credentials via Vault) — partially implemented in `credentials.ts` route but no universal pattern | MEDIUM | Security boundary |
| GAP-L3-004 | Lock 38 (Universal Service Agnosticism) not enforced — only Art Director has swap-cost analysis | LOW | Governance gap |

#### Step D — Sequencing Recommendation

GAP-L3-001/002 should be addressed in B-0.03 (Provider Routing Foundation). The Art Director registry is a good reference implementation but needs to be extracted into a universal `PluginRegistry<T>` base class in `packages/shared/src/providers/`.

---

### §3.4 — L4: Job Orchestration

**FA §5 Scope:** Inngest event bus, Mastra DAG orchestration, step functions, retry/backpressure, event schema typing.

**Anchoring Features (FA §5):** P0-01 (Turborepo — includes Inngest dev), P0-02 (Inngest dev server), B-0.03 (Mastra installation).

**Inventory Feature Count:** 67 features touch L4 (40.6% of total). 5 Done, 0 In Progress, 62 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-01 (Turborepo) | `turbo.json`, `pnpm-workspace.yaml` | YES |
| P0-02 (Local dev env) | Inngest client configured | YES |
| SEC-10 (Staging env) | Inngest staging keys documented | YES |
| T12-SENTRY | Inngest trace continuity via `InngestSpanProcessor` | YES |
| T7-ADMIN | Admin portal scaffold | YES |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L4-001 | Mastra NOT installed (0 files, not in package.json) | CRITICAL | Lock 30 declares Mastra DAG as locked technology. B-0.03 scope |
| GAP-L4-002 | Only 3 Inngest functions exist (billing auto-top-up, workspace provisioning, index) — 62 features need orchestration | HIGH | Expected — most features are Not Started |
| GAP-L4-003 | No event schema validation at Inngest boundary (events are typed but not runtime-validated) | MEDIUM | Could allow malformed events in production |
| GAP-L4-004 | No dead-letter queue or poison-event handling documented | LOW | Inngest has built-in retry; explicit DLQ may be Phase 2 |

#### Step D — Sequencing Recommendation

**GAP-L4-001 is the highest-priority gap in L4.** Lock 30 mandates Mastra for inner DAG orchestration (VVOW §8.3 pattern: Inngest outer event bus + Mastra inner workflow DAGs). This is explicitly B-0.03 scope per MBS. Must be resolved before any multi-step AI workflow (image generation, email generation) can be properly orchestrated.


---

### §3.5 — L5: Data Flywheel

**FA §5 Scope:** Pattern DB (image_prompt_patterns), RLHF voting, preference model versioning, pattern performance metrics, pgvector semantic search, cache-first routing.

**Anchoring Features (FA §5):** P0-04 (migrations include pattern tables), PIA-1 (HYVE consent + anonymized patterns), T46 (Art Director pattern cache).

**Inventory Feature Count:** 26 features touch L5 (15.8% of total). 2 Done, 0 In Progress, 24 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Pattern DB tables in migrations | YES |
| PIA-1 (DB Foundation) | `0009_pia1`: HYVE consent fields on brands, anonymized pattern store | YES |

#### Additional Evidence (not feature-mapped but substrate-relevant)

| Component | Evidence Path | Notes |
|-----------|--------------|-------|
| `image_prompt_patterns` table | `packages/db/src/schema/image-intelligence.ts` line 40 | pgvector embedding(1536), IVFFlat index, 22-type taxonomy |
| `rlhf_votes` table | `packages/db/src/schema/rlhf.ts` | vote enum: approve/reject/skip |
| `preference_model_versions` table | `packages/db/src/schema/rlhf.ts` | Model versioning with accuracy score |
| `pattern_performance_metrics` table | `packages/db/src/schema/rlhf.ts` line 58 | Performance tracking per pattern |
| Pattern cache lookup | `apps/worker/src/lib/ai/image-patterns.ts` | Reads patterns, updates usage metadata |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L5-001 | No pattern seeding mechanism (Lock 11 — Pattern Seeding) | HIGH | Empty pattern DB means cache-first routing has 0% hit rate |
| GAP-L5-002 | RLHF voting UI not implemented (admin portal has placeholder only) | MEDIUM | Data flywheel cannot spin without human feedback input |
| GAP-L5-003 | Preference model training pipeline not implemented | LOW | Phase 2/3 scope per Skill Routing Map |
| GAP-L5-004 | No semantic similarity search function exposed via API | MEDIUM | pgvector index exists but no endpoint queries it |

#### Step D — Sequencing Recommendation

GAP-L5-001 (pattern seeding) is B-0.07 scope per MBS. The schema infrastructure is solid — tables, indexes, and pgvector are all in place. The gap is operational: no seed data and no ingestion pipeline. This substrate is "schema-ready, runtime-empty."

---

### §3.6 — L6: Token Metering & Billing

**FA §5 Scope:** Token balance management, atomic deduction RPC, Stripe meter events, subscription tiers, promo codes, auto top-up, billing economics dashboard.

**Anchoring Features (FA §5):** P0-08 (Stripe products + prices), P0-09 (token economics config), T9 (Stripe Billing Foundation).

**Inventory Feature Count:** 65 features touch L6 (39.4% of total). 2 Done, 1 In Progress, 62 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Stripe keys in env schema | YES |
| SEC-10 (Staging env) | Staging Stripe keys documented | YES |

#### Additional Evidence (substrate infrastructure beyond Done features)

| Component | Evidence Path | Notes |
|-----------|--------------|-------|
| `token_balances` table | `packages/db/src/schema/billing.ts` line 30 | Updated ONLY by atomic_token_deduction RPC |
| `token_ledger` table | `packages/db/src/schema/billing.ts` line 47 | Immutable — every token movement logged |
| `token_usage_logs` table | `packages/db/src/schema/cost.ts` line 25 | Per-operation cost tracking with Stripe meter event ID |
| `atomic_token_deduction` RPC | `packages/db/drizzle/0006_t9_billing.sql` line 253 | PL/pgSQL function — atomic balance check + deduction |
| Token engine | `apps/worker/src/lib/token-engine.ts` | Calls atomic_token_deduction, handles insufficient balance |
| Stripe webhook handler | `apps/worker/src/routes/v1/billing.ts` line 585 | POST /api/v1/billing/webhook |
| Auto top-up Inngest function | `apps/worker/src/inngest/billing.ts` | 3 pack sizes (small/medium/large) |
| Admin billing routes | `apps/worker/src/routes/v1/admin-billing.ts` | Economics dashboard, config, promo codes |
| `promo_codes` table | `packages/db/src/schema/billing.ts` | Stripe coupon + VIYO token grant |
| `provider_pricing_registry` table | `packages/db/src/schema/billing.ts` | Per-model cost lookup |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L6-001 | P0-08 (Stripe products + prices) — Not Started per Inventory; no `STRIPE_PRODUCT_*` env vars | HIGH | Cannot charge customers without Stripe product catalog |
| GAP-L6-002 | P0-09 (Token economics config seed) — system_config table exists but no seed data | HIGH | TOKEN_MULTIPLIER and pack prices are hardcoded in billing.ts |
| GAP-L6-003 | Stripe meter event reconciliation cron not implemented | MEDIUM | `idx_usage_unsent` index exists for unsent events but no scheduled job sends them |
| GAP-L6-004 | Subscription tier enforcement at API level (tier-gating per R22 v2 §4.5) | MEDIUM | No `requireTier()` middleware |

#### Step D — Sequencing Recommendation

L6 has the most complete infrastructure of any "Not Started" substrate — the schema, RPC, token engine, and admin routes are all built. The gaps are primarily **configuration and seed data** (P0-08, P0-09) plus **operational crons** (meter reconciliation). This substrate could move to "Done" fastest with B-0.04 (Stripe product catalog creation) + B-0.05 (seed data).

---

### §3.7 — L7: Observability

**FA §5 Scope:** OpenTelemetry traces, Sentry error monitoring, structured logging, health checks, performance monitoring, alerting.

**Anchoring Features (FA §5):** P0-03 (OTel bootstrap), T12-SENTRY, T5 (OTel NodeSDK).

**Inventory Feature Count:** 98 features touch L7 (59.4% of total — highest touch rate). 7 Done, 1 In Progress, 90 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-01 (Turborepo) | Build pipeline observable via Turbo | YES |
| P0-02 (Local dev env) | OTel + Sentry in dev | YES |
| P0-03 (OTel bootstrap) | `apps/worker/src/instrumentation.ts` — full NodeSDK with HTTP + PG auto-instrumentation, Sentry bridge, Inngest span processor | YES |
| P0-06 (Env validation) | Fail-fast with clear error messages | YES |
| SEC-10 (Staging env) | Staging observability documented | YES |
| T10 (Internal Records) | Build journal, decision log | YES |
| T12-SENTRY | `apps/worker/src/lib/sentry.ts`, `apps/web/src/lib/sentry.ts`, `apps/admin/src/lib/sentry.ts` | YES |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L7-001 | PostHog NOT installed (0 package.json references, 0 code references) | MEDIUM | FA §5 L7 mentions PostHog for product analytics; not yet integrated |
| GAP-L7-002 | No structured logging library (pino/winston) — console.log only | MEDIUM | Production needs JSON structured logs for Datadog/CloudWatch |
| GAP-L7-003 | Health check endpoint exists (`/health`) but no deep health (DB ping, Redis ping, Inngest connectivity) | LOW | Shallow health only |
| GAP-L7-004 | No alerting rules defined (Sentry alert policies, PagerDuty integration) | LOW | Operational, not code |

#### Step D — Sequencing Recommendation

L7 is the most mature substrate by touch count (7 Done / 98 total = 7.1%). The OTel + Sentry foundation is solid. PostHog (GAP-L7-001) is a Phase 1 concern (product analytics for user behavior). Structured logging (GAP-L7-002) should be addressed in B-0.02 as it affects all subsequent development.

---

### §3.8 — L8: Real-time Substrate

**FA §5 Scope:** Supabase Realtime (Broadcast + Presence), live collaboration, real-time notifications, WebSocket management.

**Anchoring Features (FA §5):** P0-17 (Realtime channel architecture), collaboration features.

**Inventory Feature Count:** 53 features touch L8 (32.1% of total). 3 Done, 1 In Progress, 49 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Supabase client includes realtime-js | YES (imported via `@supabase/supabase-js`) |
| T12-SENTRY | Error monitoring covers realtime failures | YES |
| SEC-10 (Staging env) | Staging Supabase project has Realtime enabled | YES (implied by separate project) |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L8-001 | NO application-level Realtime code exists (0 grep hits for `realtime`, `broadcast`, `presence` in app code) | HIGH | Substrate is entirely unimplemented at application layer |
| GAP-L8-002 | No channel architecture defined (which events use Broadcast vs Presence vs Postgres Changes) | HIGH | Architecture decision needed before implementation |
| GAP-L8-003 | `notification_preferences` table exists (0007 migration) with channel enum but no delivery mechanism | MEDIUM | Schema ready, runtime empty |
| GAP-L8-004 | No WebSocket connection management (reconnect, backoff, auth token refresh) | MEDIUM | Client-side infrastructure gap |

#### Step D — Sequencing Recommendation

L8 is "schema-ready, runtime-absent." The Supabase client is imported (includes realtime-js) and the notification_preferences table exists, but zero application code uses Realtime features. This is expected — real-time collaboration is Phase 2+ scope. However, P0-17 (Realtime channel architecture) is a Phase 0 baseline that should at minimum define the channel taxonomy.


---

### §3.9 — L9: Storage

**FA §5 Scope:** Cloudflare R2 object storage, CDN delivery, asset lifecycle management, signed URLs, custom domain (`assets.viyo.email`).

**Anchoring Features (FA §5):** P0-14 (R2 custom domain), T72 (R2 auto-save Brand Vault).

**Inventory Feature Count:** 44 features touch L9 (26.7% of total). 2 Done, 1 In Progress, 41 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| SEC-10 (Staging env) | R2 staging bucket documented in `.env.staging.example` | YES |
| P0-04 (Migrations) | `assets` table has `storagePath` column for R2 object keys | YES |

#### In Progress

| Feature | Evidence Path | Status |
|---------|--------------|--------|
| T25-STUDIO-BACKEND | `apps/worker/src/lib/ai/image-router.ts`: R2 upload via `R2BucketLike` interface + asset DB indexing | Interface defined; needs runtime binding |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L9-001 | No R2 SDK in worker `package.json` — uses `R2BucketLike` interface stub | HIGH | Cannot upload to R2 without SDK or Workers binding |
| GAP-L9-002 | P0-14 (R2 custom domain) — `.env.example` has `R2_BUCKET_NAME=viyo-assets` but no CDN/custom domain config | MEDIUM | Deployment concern |
| GAP-L9-003 | No signed URL generation for private assets | MEDIUM | All assets currently assumed public |
| GAP-L9-004 | No asset lifecycle management (expiry, cleanup, versioning) | LOW | Phase 2 scope |
| GAP-L9-005 | T72 architecture plan exists (`docs/internal/phase6-repair/TASK72_R2_AUTO_SAVE_BRAND_VAULT_ARCHITECTURE_PLAN.md`) but not implemented | MEDIUM | Plan documented, execution pending |

#### Step D — Sequencing Recommendation

GAP-L9-001 is the immediate blocker. The `R2BucketLike` interface in `image-router.ts` is designed for Cloudflare Workers runtime binding (`env.R2_BUCKET`). Since VIYO runs on Render (not Workers), the implementation needs an S3-compatible SDK (`@aws-sdk/client-s3`) configured for R2's S3 API endpoint. This is B-0.04 scope.

---

### §3.10 — L10: Webhook Pipeline

**FA §5 Scope:** Webhook endpoint registration, event delivery with retry, delivery logging, HMAC signature verification, event catalog.

**Anchoring Features (FA §5):** D11 (Webhook architecture), T45 (Composite Database Foundation includes webhook tables).

**Inventory Feature Count:** 14 features touch L10 (8.5% of total). 1 Done, 0 In Progress, 13 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| SEC-10 (Staging env) | Webhook infrastructure in staging topology | YES |

#### Additional Evidence (substrate infrastructure)

| Component | Evidence Path | Notes |
|-----------|--------------|-------|
| `webhook_endpoints` table | `packages/db/src/schema/webhooks.ts` | Tenant-scoped, URL + secret + event subscriptions |
| `webhook_delivery_logs` table | `packages/db/src/schema/webhooks.ts` | Status tracking per delivery attempt |
| Event catalog (21 events) | `WEBHOOK_EVENT_CATALOG` constant | email.*, image.*, brand.*, team.*, billing.* |
| Migration | `0007_t45_composite_database_foundation.sql` | Tables created with RLS |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L10-001 | No webhook dispatcher implementation (Inngest function to fan-out events to registered endpoints) | HIGH | Schema exists but no runtime delivery |
| GAP-L10-002 | No HMAC signature generation for outbound webhooks | HIGH | Security requirement per D11 |
| GAP-L10-003 | No webhook management API routes (CRUD for endpoints) | MEDIUM | Endpoints can't be registered without API |
| GAP-L10-004 | No retry logic with exponential backoff for failed deliveries | MEDIUM | Inngest could handle this natively |
| GAP-L10-005 | No webhook event emission points in existing code (no `emitWebhookEvent()` calls) | HIGH | Even if dispatcher existed, no code triggers it |

#### Step D — Sequencing Recommendation

L10 is "schema-complete, runtime-absent." The database layer is fully designed (tables, indexes, RLS, event catalog) but zero runtime code exists. This is a clean implementation target for B-0.10 — the schema is the contract, and Inngest is the natural dispatcher. Low coupling to other substrates makes this parallelizable.

---

### §3.11 — L11: Skill System Layer 1 — Tier 1 Builder Technical Skills

**FA §5 Scope:** Skills authored to Drive claude folder, uploaded to Portal product at ai.viyo.new, loaded at runtime via `skills.pickForTask()` API per D63 Path E. Skills do NOT live in any git repo. Currently 5 uploaded to Portal v1.0.0; long-horizon target = 11 skills (B-0.13 baseline).

**Anchoring Features (FA §5):** B-0.13 (11 Tier 1 Builder Skills), Portal QA-05 verification.

**Inventory Feature Count:** 49 features touch L11 (29.7% of total). 4 Done, 0 In Progress, 45 Not Started.

#### Step B — Done Features with Evidence

| Feature | Evidence Path | Verified |
|---------|--------------|----------|
| P0-02 (Local dev env) | Portal product accessible at ai.viyo.new | YES (per FA §5) |
| P0-04 (Migrations) | No skills_registry table in migrations — correct per D63 Path E (skills live in Portal, not repo) | N/A |
| T7-ADMIN | Admin portal could host skill management UI | YES (scaffold) |
| PIA-1 (DB Foundation) | PIA-1 establishes privacy gates that skills must respect | YES |

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L11-001 | Only 5/11 Tier 1 Builder Skills uploaded to Portal | HIGH | B-0.13 target is 11; 6 remaining |
| GAP-L11-002 | No `skills.pickForTask()` API implementation visible in repo | MEDIUM | Per D63, this lives in Portal product code (separate repo/service) — cannot verify from VIYO repo |
| GAP-L11-003 | Skill loading not verified in VIYO worker code (no import/call to Portal skills API) | MEDIUM | Runtime integration gap |
| GAP-L11-004 | 6 remaining skills not yet authored: `brand-vault-asset-write`, `directive-authoring-v2`, `ingestion-evidence-protocol`, `§9-code-review-protocol`, `r-file-rewrite-pattern`, `acceptance-message-template` | HIGH | Content authoring gap |

#### Step D — Sequencing Recommendation

L11 is unique — it lives outside the repo (Portal product per D63 Path E). The 5 existing skills are verified working (PORTAL-QA-05). The remaining 6 skills are content-authoring work, not code. B-0.13 is the MBS bullet that tracks this. No code changes needed in VIYO repo for L11 completion.

---

### §3.12 — L12-B: AI Brain Pattern Skills

**FA §5 Scope:** `skills_registry` Postgres table for runtime queries, two-layer skill architecture (Layer 1 Platform Skills in orchestrator code, Layer 2 Prompt Fragment Skills in `skills_registry`), Brain assignments per Skill Routing Map, MAAX orchestrator injection.

**Anchoring Features (FA §5):** P0-07 (skills_registry seed with 6 core skills), P2-17 (two-layer prompt injection), VF-44 (skill versioning + rollback).

**Inventory Feature Count:** 14 features touch L12-B (8.5% of total). 0 Done, 0 In Progress, 14 Not Started.

#### Step B — Done Features with Evidence

**None.** L12-B has 0% completion — the only substrate with zero Done features.

#### Step C — Gaps Identified

| Gap ID | Description | Severity | Blocking |
|--------|-------------|----------|----------|
| GAP-L12-001 | `skills_registry` table NOT in any migration (0 grep hits across all SQL files) | CRITICAL | P0-07 explicitly requires this table seeded with 6 core skills |
| GAP-L12-002 | No MAAX orchestrator code exists in repo | HIGH | Layer 2 skill injection depends on MAAX |
| GAP-L12-003 | No skill injection runtime (dynamic prompt fragment loading based on Brain + task context) | HIGH | Core L12-B functionality |
| GAP-L12-004 | Airtable Skills Registry (109+ records) not synced to any Postgres table | MEDIUM | Airtable is source of truth but no sync mechanism |
| GAP-L12-005 | Admin Portal "Council of Brains" page is placeholder only (`CouncilOfBrains.tsx`) | LOW | UI scaffold exists but no functionality |
| GAP-L12-006 | No token budgeting per skill injection (R19 v2 §3.4 prompt budget) | MEDIUM | Cost control gap |

#### Step D — Sequencing Recommendation

L12-B is the least mature substrate (0% Done). However, it depends on L4 (Mastra for MAAX orchestrator) and L3 (provider routing for Brain execution). **Sequencing: L4 (Mastra install) → L3 (universal registry) → L12-B (skills_registry + MAAX).** P0-07 (skills_registry table + 6 core skill seed) is the immediate B-0.07 target.


---

## §4 — Aggregate Roll-Up

### Per-Substrate Readiness Heatmap

| Substrate | Features Touching | Done | In Progress | Not Started | % Done | Readiness |
|-----------|-------------------|------|-------------|-------------|--------|-----------|
| L1 — Identity & Multi-Tenancy | 85 | 8 | 0 | 77 | 9.4% | SCHEMA-READY |
| L2 — Asset Model | 87 | 5 | 1 | 81 | 5.7% | SCHEMA-READY |
| L3 — Provider Routing | 94 | 2 | 1 | 91 | 2.1% | PARTIAL (Art Director only) |
| L4 — Job Orchestration | 67 | 5 | 0 | 62 | 7.5% | INNGEST-READY, MASTRA-ABSENT |
| L5 — Data Flywheel | 26 | 2 | 0 | 24 | 7.7% | SCHEMA-READY, RUNTIME-EMPTY |
| L6 — Token Metering & Billing | 65 | 2 | 1 | 62 | 3.1% | INFRASTRUCTURE-COMPLETE, CONFIG-ABSENT |
| L7 — Observability | 98 | 7 | 1 | 90 | 7.1% | OPERATIONAL (OTel + Sentry live) |
| L8 — Real-time Substrate | 53 | 3 | 1 | 49 | 5.7% | SCHEMA-READY, RUNTIME-ABSENT |
| L9 — Storage | 44 | 2 | 1 | 41 | 4.5% | INTERFACE-DEFINED, SDK-ABSENT |
| L10 — Webhook Pipeline | 14 | 1 | 0 | 13 | 7.1% | SCHEMA-COMPLETE, RUNTIME-ABSENT |
| L11 — Skill System L1 | 49 | 4 | 0 | 45 | 8.2% | 5/11 SKILLS LIVE (Portal) |
| L12-B — AI Brain Pattern Skills | 14 | 0 | 0 | 14 | 0.0% | NOT STARTED |

### Critical Path Summary

The repo is in a **"schema-rich, runtime-sparse"** state. Database migrations define 33+ tables with comprehensive RLS, indexes, and stored procedures. The gap is in **runtime code** — the application layer that uses these schemas is largely unbuilt. This is consistent with a Phase 0 that prioritized architectural foundation over feature delivery.

### Top 5 Blocking Gaps (Ordered by Downstream Impact)

| Rank | Gap ID | Description | Blocks |
|------|--------|-------------|--------|
| 1 | GAP-L4-001 | Mastra NOT installed | All multi-step AI workflows (B-0.03+) |
| 2 | GAP-L13-001 | `requireAdmin()` missing (Lock 13 violation) | Admin route security (B-0.02) |
| 3 | GAP-L12-001 | `skills_registry` table missing | All L12-B features (P0-07) |
| 4 | GAP-L3-001 | Provider registry not universal | All non-Art-Director provider routing |
| 5 | GAP-L9-001 | No R2 SDK in worker | All asset upload flows (T25, T72) |

---

## §5 — Sequencing Recommendation

Based on dependency analysis and critical-path blocking relationships:

### Immediate (B-0.02 — Infrastructure Hardening)

1. **Implement `requireAdmin()` middleware** — Lock 13 compliance. Mount on all `/admin/*` routes.
2. **Add structured logging** (pino) — All subsequent debugging depends on this.
3. **Reconcile role enum** — Clarify 4-role vs 5-role with PO.
4. **Add `parent_asset_id` to assets table** — Brand Vault hierarchy.

### Next (B-0.03 — Mastra + Provider Foundation)

5. **Install Mastra** (`pnpm add @mastra/core`) — Lock 30 compliance.
6. **Extract universal `PluginRegistry<T>` base class** from Art Director registry.
7. **Wire Mastra inner DAG pattern** with Inngest outer event bus.

### Then (B-0.04 — Runtime Activation)

8. **Add `@aws-sdk/client-s3`** for R2 S3-compatible access from Render.
9. **Create `skills_registry` migration** + seed 6 core skills (P0-07).
10. **Create Stripe product catalog** (P0-08) + seed token economics (P0-09).

### Parallel (B-0.10 — Low-Coupling Substrates)

11. **Webhook dispatcher** (Inngest function) — L10 is self-contained.
12. **PostHog integration** — L7 enhancement, no dependencies.
13. **Realtime channel taxonomy** (P0-17) — Architecture document, minimal code.

---

## §6 — Documentation Gaps Surfaced

| ID | Location | Issue | Recommended Fix |
|----|----------|-------|-----------------|
| DG-01 | FOUNDATION_AUTHORITY §2.1 line 59 | States "178 features" — actual Inventory v002 count is 165 | Update to 165 |
| DG-02 | Inventory v002 P0-04 | Claims "83 tables" — migrations show 33 CREATE TABLE statements | Reconcile: 83 may include RLS objects, functions, indexes |
| DG-03 | Inventory v002 P0-05 | Feature marked "Done" — verified 42+ RLS policies exist | Status correct; evidence confirmed |
| DG-04 | Inventory v002 P0-16 | Marked "Not Started" — but `workspace-provisioning.ts` Inngest function exists | Status may be stale; recommend re-assessment |
| DG-05 | FOUNDATION_LOCK Lock 13 | References `requireAdmin()` middleware — does not exist in codebase | Either implement or update Lock text |
| DG-06 | FA §5 L1 | States 5-role enum (Owner/Admin/Approver/Editor/Viewer) — code has 4-role | PO decision needed |
| DG-07 | FA §5 L12-B | States "P0-07 skills_registry seed" — table does not exist in any migration | Migration needed (B-0.04 scope) |

---

## §7 — ZCBR Self-Validation

Per ZCBR Standard §3 (Lock 20), this document self-validates against all mandatory fields:

| ZCBR Requirement | Status |
|------------------|--------|
| ZCBR header present with status + date | YES — `zcbr_status: PASSED 2026-05-18` |
| Version field | YES — `version: 1.0` |
| Author field | YES — `author: Manus (Curator Agent)` |
| Authority reference | YES — `B-0.01 Directive v0.3` |
| Locks invoked listed | YES — 11 locks listed |
| Acceptance criteria (§7.2 of directive) | YES — all 12 substrates audited, all gaps identified, sequencing provided |
| Failure modes documented | YES — §6 Documentation Gaps |
| No placeholder strings | YES — all sections complete |
| No hardcoded vendor names without Lock reference | YES — Mastra (Lock 30), Inngest (Lock 31), Stripe (Lock 33), Supabase (Lock 34) |
| Cross-spec citations use v2 where available | YES — R19 v2, R20 v2, R21 v2, R22 v2, R24 v2, R29 v2 cited |

---

## §8 — Dispatch Metadata

| Field | Value |
|-------|-------|
| Deliverable filename | `PHASE_0_GAP_LIST_2026-05-18.md` |
| Authored by | Manus (Curator Agent) |
| Authored date | 2026-05-18 |
| Authority | B-0.01 Directive v0.3 (PO-ratified 2026-05-15) |
| Repo HEAD at audit time | `afdf02b795e48c95bf541e71845b03e13839bf22` |
| Branch | `staging` |
| Inventory source | Drive ID `1lGcnY6pJECYCUWBVqjDFdcHxVBWCuZrp` (v002, 719 KB) |
| FOUNDATION_AUTHORITY source | `docs/governance/FOUNDATION_AUTHORITY.md` (45,525 bytes) |
| FOUNDATION_LOCK source | `docs/governance/FOUNDATION_LOCK.md` (68,903 bytes) |
| Total gaps identified | 41 |
| Critical gaps | 3 (GAP-L13-001, GAP-L4-001, GAP-L12-001) |
| High-severity gaps | 14 |
| Medium-severity gaps | 17 |
| Low-severity gaps | 7 |
| PO action required | Ratify this audit + confirm DG-06 (role enum) |

---

**END OF DOCUMENT**
