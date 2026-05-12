---
spec_id: R20
title: Database Schema
version: 2.0
zcbr_status: PASSED
zcbr_validation_date: 2026-05-12
zcbr_validator: Architect Claude (Opus 4.7) self-validation
zcbr_checklist_version: v1
authored_date: 2026-05-12
author: Architect Claude (Opus 4.7)
supersedes:
  - docs/research_specs/R20_DATABASE_SCHEMA_LOCK_ENTERPRISE.md (v1, 2026-04-24, SHA 20061adf03caf39be5fc7d1b6230fe03c21dd928)
  - docs/foundation/VIYO_Final_Doc3_Database_Schema.md (V4 Final, 2026-04-24, SHA 20061adf03caf39be5fc7d1b6230fe03c21dd928)
target_repo_path: /docs/research_specs/R20_DATABASE_SCHEMA_v2.md
authority_tier: 7 (R-spec ZCBR per CLAUDE.md hierarchy)
---

# R20 — Database Schema (v2, ZCBR-Grade)

## 0. Authority and Provenance

**This document is the canonical contract for the VIYO PostgreSQL schema hosted on Supabase.** All schema source files at `packages/db/src/schema/*.ts` cite "R20 §2" as authority; this document IS R20 §2 onward. R20 v2 supersedes both the prior R20 v1 (committed 2026-04-24) and the parallel `docs/foundation/VIYO_Final_Doc3_Database_Schema.md` (committed same SHA same date). The supersession is enforced via a separate cleanup directive (`R20-V2-AND-DOC3-SUPERSESSION-001`) that lands the v1 supersession-pointer header in Final Doc 3 immediately after this v2 ships.

**Authority sources (CLAUDE.md tier order):**
- PO ratifications: D19 (R20 v1 approval, preserved), D29 (R20 v1 approval, preserved), D55 (R29 PAL unified Plugin Registry — affects esp_connections evolution), D56 (Token metering Phase 0/Phase 1 split — affects token_usage_logs vs billing tables), D57 (Layer 1 Platform Skills in orchestrator NOT skills_registry — affects schema scope boundary), D63 (Skills do not live in git — informs PIA-1 schema integration_connections boundary), D66 (B-1.00 ratified as first Path C Bullet — schema must support Studio Core Loop end-to-end)
- V8 PRD (current canonical except where flagged underspecified)
- FOUNDATION_AUTHORITY.md L2 Asset Model, L11 Pattern Substrate, L1 Identity & Multi-Tenancy, L6 Token Metering, L5 Data Flywheel, L10 Webhook Pipeline
- VIYO_Master_Build_Sequence.md (v1.1) — Phase 0 substrate Bullets B-0.02 through B-0.21 all consume tables defined here
- ZCBR_STANDARD.md (Foundation Lock 20) — this spec validates against the 14-item checklist plus anti-pattern checks
- VVOW_IMAGE_STUDIO_ARCHITECTURE.md §11 (Brand Vault), §10.2-10.3 (Pattern Substrate), §12 (Data Flywheel), §18.1 (Lock 8 Token Economics), §18.2 (Lock 13 Multi-Tenancy)

**Implementation ground-truth sources reconciled:**
- `packages/db/src/schema/*.ts` (14 schema files, 13 domains, last touched 2026-05-02) — what is built
- `packages/db/drizzle/0001_*.sql` through `0009_pia1_proprietary_intelligence_foundation.sql` (9 migrations) — what is committed
- April 26 Drive `R20_DATABASE_SCHEMA_LOCK_ENTERPRISE.md` 31,456 bytes (Drive ID `1yOBZuyOkVqYH1GpmlUYXv2IaUNcqGwt-`) — closest structural depth match
- April 24 repo R20 17,786 bytes — superseded by v2, retained as historical reference
- WP-5 `MIGRATION_AUTOMATION_PROPOSAL.md` (PR #15 commit `9438e0c77a438e410834f90d1d8cc90adc6ded6d`, 2026-05-09) — migration automation contract

**Cross-spec wiring map:**

| Consumer R-spec | Tables consumed | Purpose |
|---|---|---|
| R22 Security & Auth | `workspaces`, `users`, `api_keys`, `workspace_members` | Identity, RLS, multi-tenant boundary, API auth |
| R23 Cost Engine | `token_usage_logs`, `token_balances`, `token_ledger`, `stripe_webhook_events`, `provider_pricing_registry`, `promo_codes`, `promo_redemptions` | Token economics, Stripe meter reconciliation (D56 Phase 0/Phase 1 split honored) |
| R24 Image Pipeline | `image_prompt_patterns`, `assets` (asset_type='generated_hero'/'generated_section') | Vector prompt caching, generated image lineage |
| R27 Composable Sections | `email_templates`, `email_sections` (planned, not yet implemented) | MJML/JSON Recipe section composition |
| R28 Timer Service | `timer_definitions` | Countdown timer config (deferred to B-4.03 P4+) |
| R29 PAL (v2 unified per D55) | `esp_connections`, `integration_connections`, AI Plugin Registry tables (to be added per B-XC.01) | ESP credentials, OAuth tokens, AI provider routing |
| R31 Product Data Extraction | `viyo_products`, `assets` (asset_type='product_photo'/'lifestyle_scene') | Scraped e-commerce data + product imagery |
| R19 LLM Orchestration | `council_decisions` | Brain Council vote tracking |
| R36 HYVE | `hyve_pattern_performance`, `brands` (hyve_opt_in flag) | Anonymized cross-brand intelligence |
| R37 MAAX | `brand_preferences`, `brands` | Per-brand memory graph signals |
| R38 SYPHON | `campaign_performance` | ESP daily sync metrics |
| R32 Email Engine (future Phase 2) | `email_templates`, `email_sections`, `flow_definitions` (planned) | Email generation pipeline |
| R39 Global Admin (future P4+) | All tables via service_role | Admin tooling |
| R46 Email Ingestion | `assets` (asset_type='ingested_email'/'ingested_image' planned) | IMAP corpus ingestion |
| T9 Stripe Billing | `token_balances`, `token_ledger`, `stripe_webhook_events`, `system_config`, `system_config_audit_log`, `provider_pricing_registry`, `promo_codes`, `promo_redemptions`, `system_email_templates` | Billing master spec §2 (this is the authoritative source for billing tables; R20 v2 documents the schema, T9 documents the business logic) |
| T45 Composite DB Foundation | `brands`, `comments`, `notification_preferences`, `integration_connections`, `webhook_endpoints`, `webhook_delivery_logs`, `image_prompt_patterns` (T20 update) | Composite database foundation (T16/T17/T18/T19/T20) |
| T48 v3.0 + Notion D11 | `webhook_endpoints`, `webhook_delivery_logs` | Universal webhook dispatcher (D11 supersedes T48 spec text) |
| T72 Brand Vault Persistence | `assets.brand_id` required FK to `brands.id` | Brand Vault query path |
| PIA-1 (R36/R37/R38 foundation) | `brand_preferences`, `hyve_pattern_performance`, `campaign_performance` | Proprietary Intelligence schema foundation |

**Lock invocations:** Locks 4 (no in-memory schema), 5 (Pattern Recipe schema-drift forbidden), 6 (Brand Vault separation), 8 (programmatic ops 0 tokens), 9 (RLHF event constraints), 12 (two-layer prompt token budget), 13 (multi-tenant RLS on every brand-scoped table), 19 (Provider Agnosticism — no hardcoded model names in DDL), 20 (this spec is ZCBR-validated).

---

## 1. Scope and Boundaries

### 1.1 What R20 v2 covers

- **Every PostgreSQL table** in the VIYO production database (Supabase project `rdhxhjcfklodalgctrcf`) and staging (`ypnwxghvsxpyvnsndrba`)
- **All Row-Level Security (RLS) policies** on those tables
- **All foreign key relationships** between tables
- **All indexes** required for performance + correctness (uniqueness, partial indexes, IVFFlat for pgvector)
- **All constraints** (NOT NULL, UNIQUE, CHECK enumerations)
- **The migration plan** — file naming, ordering, idempotency, RLS application order, FK dependency ordering, backfill strategy, CI workflow trigger (citing WP-5 `MIGRATION_AUTOMATION_PROPOSAL.md`)
- **The schema drift detection pattern** — `drizzle-kit generate` output must match committed SQL byte-for-byte in CI
- **Cross-spec wiring** — which R-spec consumes which tables, with version pins where applicable
- **The supersession contract** for R20 v1 + `VIYO_Final_Doc3_Database_Schema.md`

### 1.2 What R20 v2 does NOT cover (explicit out-of-scope)

- **Business logic** in API routes, Inngest functions, or worker code (R-spec for each consumer covers this — e.g. T9 covers token deduction RPC logic, R24 covers Image Pipeline orchestration)
- **Stripe webhook payload validation logic** (T9 §4-5)
- **Drizzle ORM query patterns** in application code (consumer R-specs)
- **Database backup and disaster recovery procedures** (B-XC.23 fresh DR runbook supersedes R52)
- **AI Plugin Registry schema** (to be added by B-XC.01 R29 PAL v2 — slot reserved here, schema deferred)
- **`email_sections` table** (R27 Composable Sections covers — planned but not implemented in current schema; R20 v2 documents it as planned, not committed)
- **`flow_definitions` table** (R32 Email Engine Phase 2 — planned, not implemented)
- **Skills storage** — per D63, skills do NOT live in any git repo or database table; loaded via Portal `skills.pickForTask` API
- **AI Brain Pattern Skills Layer 2 storage** (R19 + R37 — `skills_registry` table referenced but managed by Path F directives, not R20)

---

## 2. Domain Architecture — 13 Implemented Domains + 2 Planned

Each domain entry below covers: **purpose, file location, tables, tenant scope, RLS pattern, FK relationships, indexes, constraints, failure modes, tests required**.

### 2.1 Identity Domain

- **Purpose:** Root tenant anchor + user identity bridge to Supabase Auth + API key storage + multi-workspace junction (ADR-009)
- **File:** `packages/db/src/schema/identity.ts` (103 lines, current implementation)
- **Tables:**

#### 2.1.1 `workspaces`
- **Tenant scoping:** Root tenant entity, NOT tenant-scoped itself. Custom RLS policy: users may SELECT workspaces only where their `users.id` is linked
- **Columns (locked):** `id UUID PK DEFAULT uuid_generate_v4()`, `name VARCHAR(255) NOT NULL`, `stripe_customer_id VARCHAR(255) UNIQUE`, `stripe_subscription_id VARCHAR(255)`, `subscription_status VARCHAR(50) DEFAULT 'free' CHECK (subscription_status IN ('free','active','past_due','canceled','trialing')) NOT NULL`, `subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free','starter','growth','agency')) NOT NULL`, `billing_cycle_anchor TIMESTAMPTZ`, `auto_top_up_enabled BOOLEAN DEFAULT FALSE NOT NULL`, `auto_top_up_threshold BIGINT DEFAULT 500000`, `auto_top_up_pack VARCHAR(20) DEFAULT 'small'`, `onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL`, `settings JSONB DEFAULT '{}'::jsonb NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK on `id`; UNIQUE on `stripe_customer_id`
- **RLS:** `ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY`. Policy `ws_self_view`: `FOR SELECT USING (id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))`. Service-role bypass permitted only for billing webhook handlers and admin functions (see §6 below).
- **Tier values lock (per T9 §2):** `'free','starter','growth','agency'` — the value `'enterprise'` is FORBIDDEN per D8 5-tier pricing decision; v1 used `'enterprise'` and is corrected in v2.
- **Soft delete:** NOT used on workspaces. Workspaces are hard-deleted only via PO admin action. All FK references use `ON DELETE CASCADE`.

#### 2.1.2 `users`
- **Tenant scoping:** Bridge entity. NOT tenant-scoped (special: `id` references `auth.users(id)`). `workspace_id` FK provides default workspace.
- **Columns (locked):** `id UUID PK` (references `auth.users(id) ON DELETE CASCADE`), `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`, `email VARCHAR(255) UNIQUE NOT NULL`, `full_name VARCHAR(255)`, `avatar_url TEXT`, `role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner','admin','member')) NOT NULL`, `last_login_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **RLS:** `users_ws_view`: `FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))`
- **Role enum extension:** `workspace_members.role` extends to 5 PERM-roles plus a custom JSONB — see workspace_members below.

#### 2.1.3 `api_keys`
- **Tenant scoping:** tenantScoped = true (`workspace_id` FK + RLS auto-applied)
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `key_hash VARCHAR(64) UNIQUE NOT NULL`, `key_prefix VARCHAR(8) NOT NULL`, `label VARCHAR(100)`, `scopes VARCHAR[] DEFAULT '{}'`, `expires_at TIMESTAMPTZ`, `last_used_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Hashing:** `key_hash` stores SHA-256 hex of the API key. The raw key is shown to the user ONCE at creation. `key_prefix` stores the first 8 characters for human identification only.
- **RLS:** Standard tenant-scoped policy (`workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())`)

#### 2.1.4 `workspace_members` (junction)
- **Tenant scoping:** Junction table — composite key (`workspace_id`, `user_id`). NOT tenant-scoped in the standard sense (one row per workspace+user pair).
- **Columns (locked):** `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `role VARCHAR(50) NOT NULL CHECK (role IN ('owner','admin','editor','viewer','custom'))`, `custom_role JSONB DEFAULT '{}'::jsonb NOT NULL`, `permissions_grant_source VARCHAR(50)`, `invited_by UUID REFERENCES users(id) ON DELETE SET NULL`, `invited_at TIMESTAMPTZ`, `accepted_at TIMESTAMPTZ`, `revoked_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **PK:** Composite (`workspace_id`, `user_id`) — `UNIQUE (workspace_id, user_id)` enforced
- **RLS:** Users see their own memberships; workspace owners/admins see all memberships of their workspace
- **5-role enum + custom JSONB:** PERM-01 (owner) through PERM-05 (custom) per FOUNDATION_AUTHORITY L1.

#### 2.1.5 Identity domain — failure modes

| Failure category | Trigger | Error code | Rollback | Retry | Logging |
|---|---|---|---|---|---|
| RLS denial on user query | User attempts to read another tenant's `workspaces`/`users`/`api_keys` | `RLS_VIOLATION_IDENTITY` | None (read attempt naturally fails) | None | OTel span event + Sentry capture |
| Duplicate workspace name within tenant | INSERT into `workspaces` with same `name` for same owner | `UNIQUE_VIOLATION_WORKSPACE_NAME` | Transaction abort | Manual rename | Standard error log |
| API key collision | INSERT into `api_keys` with same `key_hash` | `UNIQUE_VIOLATION_API_KEY_HASH` | Regenerate, retry once | Automatic single retry | Sentry capture |
| auth.users orphan | `users` row inserted without matching `auth.users` row | `FK_VIOLATION_AUTH_USER` | Transaction abort | None | Standard error log |
| Role enum violation | INSERT/UPDATE with invalid role value | `CHECK_CONSTRAINT_VIOLATION_ROLE` | Transaction abort | None | Standard error log |

#### 2.1.6 Identity domain — edge cases

- **Empty workspace:** Workspace created without invited members. Workspaces.subscription_tier='free' default. Token balance row auto-created via INSERT trigger (see Billing domain).
- **Soft-deleted user:** NOT used. Users are deleted via cascade from `auth.users` deletion.
- **Concurrent workspace creation:** Two users attempt to create workspaces with same `stripe_customer_id` → second attempt fails with UNIQUE violation. Application must check before creating.
- **MFA gate:** MFA-01/04/05 enforcement is in R22 Auth, not R20. R20 documents the storage shape; R22 documents enforcement.

#### 2.1.7 Identity domain — tests required

- **Unit:** Schema migration runs cleanly on empty DB; all CHECK constraints reject invalid values; all UNIQUE constraints enforce.
- **RLS enforcement:** Service-role connection can read all rows; authenticated user connection (`auth.uid()` set) sees only own tenant rows; anonymous connection sees zero rows.
- **5 role tests:** Each of `owner`/`admin`/`editor`/`viewer`/`custom` can be assigned via INSERT to `workspace_members` without CHECK violation; invalid role string is rejected.
- **MFA scaffold test:** `auth.users.factors` JSONB column exists and is queryable (this is Supabase Auth-managed, not R20 — but R22 references this).
- **CI cross-tenant test:** Migrate fresh DB, create two workspaces with one user each, attempt cross-tenant SELECT via authenticated connection of user A on user B's workspace — must return zero rows.

---

### 2.2 Products & Assets Domain

- **Purpose:** Scraped e-commerce product data (R31) + Brand Vault asset lineage (T72) including generated images, brand kit components, video clips
- **File:** `packages/db/src/schema/products.ts` (96 lines)
- **Tables:**

#### 2.2.1 `viyo_products`
- **Tenant scoping:** tenantScoped = true
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `source_url TEXT NOT NULL`, `name VARCHAR(255) NOT NULL`, `description TEXT`, `price NUMERIC(10,2)`, `currency VARCHAR(3) DEFAULT 'USD' NOT NULL`, `category VARCHAR(100)`, `extracted_data JSONB DEFAULT '{}'::jsonb NOT NULL`, `thumbnail_url TEXT`, `is_active BOOLEAN DEFAULT TRUE NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK; `idx_products_workspace_active ON (workspace_id, is_active)`; `idx_products_workspace_category ON (workspace_id, category)`
- **RLS:** Standard tenant-scoped

#### 2.2.2 `assets`
- **Tenant scoping:** tenantScoped = true. PLUS `brand_id` required FK to `brands(id)` per T72 Brand Vault Persistence.
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE`, `product_id UUID REFERENCES viyo_products(id) ON DELETE SET NULL`, `parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL`, `asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('product_photo','lifestyle_scene','generated_hero','generated_section','video_clip','brand_logo','brand_kit_component','ingested_email','ingested_image'))`, `storage_path TEXT NOT NULL`, `width INTEGER`, `height INTEGER`, `file_size_bytes BIGINT`, `mime_type VARCHAR(100)`, `source_model VARCHAR(50)`, `generation_prompt TEXT`, `generation_id UUID`, `route_metadata JSONB DEFAULT '{}'::jsonb`, `tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL`, `metadata JSONB DEFAULT '{}'::jsonb NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK; `idx_assets_workspace_brand ON (workspace_id, brand_id)`; `idx_assets_parent ON (parent_asset_id)` (for lineage chain queries); `idx_assets_brand_type ON (brand_id, asset_type)`; GIN index on `tags` for tag search
- **RLS:** Standard tenant-scoped via `workspace_id`. PLUS composite FK constraint per T72: `(brand_id, workspace_id)` matches `(brands.id, brands.workspace_id)` — prevents cross-tenant brand reference even via direct DML.
- **Lineage:** `parent_asset_id` is self-referencing; chain represents version history (R20 + R24 + B-1.16 Version History panel)
- **Asset type enum (locked, 9 values):** `product_photo`, `lifestyle_scene`, `generated_hero`, `generated_section`, `video_clip`, `brand_logo`, `brand_kit_component`, `ingested_email` (R46 corpus), `ingested_image` (R46 corpus). Future additions require R20 minor version bump.

#### 2.2.3 Products & Assets — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| RLS cross-tenant asset read | Authenticated user attempts asset SELECT outside own workspace | `RLS_VIOLATION_ASSETS` | None | OTel + Sentry |
| Brand-workspace mismatch | Asset INSERT with `brand_id` pointing to brand in different workspace | `FK_VIOLATION_COMPOSITE_BRAND_WORKSPACE` | Transaction abort | Error log + Sentry |
| Invalid asset_type | INSERT with asset_type not in enum | `CHECK_CONSTRAINT_VIOLATION_ASSET_TYPE` | Transaction abort | Error log |
| Lineage cycle | UPDATE attempts to create self-referencing cycle in `parent_asset_id` | `CYCLE_DETECTED_PARENT_ASSET` | Application-level check before INSERT/UPDATE | Application warn |
| Storage path collision | Two assets reference same `storage_path` (allowed but flagged) | None — `storage_path` is NOT unique by design | Application-level dedup if needed | OTel event |
| R2 storage write succeeds but DB INSERT fails | Atomic write contract broken | `STORAGE_DB_DESYNC` | Application must compensate (delete R2 object) | Critical Sentry alert |

#### 2.2.4 Products & Assets — edge cases

- **Asset without product:** `product_id` NULL allowed (generated brand assets unrelated to a product)
- **Asset without parent:** `parent_asset_id` NULL for origin assets in a lineage chain
- **R2 + DB atomicity:** Per VVOW §11.1, the asset write is implemented as a 2-phase pattern: (a) write to R2 first, (b) INSERT row with storage_path. If (b) fails, R2 object becomes orphan and must be cleaned by background process. Inverse order would create DB row pointing to non-existent storage.
- **Lineage chain queries:** Recursive CTE pattern. R20 §11 specifies the CTE template. Max depth: 100 (application-enforced; no DB-level constraint).

#### 2.2.5 Products & Assets — tests required

- **Atomic write test:** Mock R2 success + DB INSERT failure → verify compensating delete fires
- **Lineage chain test:** Create 10-asset lineage, query recursive CTE, assert all 10 returned in order
- **Composite FK test:** Attempt cross-tenant brand reference → must fail with FK violation
- **Tag GIN index test:** INSERT 1000 assets with varying tags, query by tag → verify index used (EXPLAIN)
- **RLS asset isolation:** Two workspaces with assets; user from workspace A queries assets → returns only A's assets

---

### 2.3 Image Intelligence Domain (Pattern DB)

- **Purpose:** Vector-cached prompt patterns enabling R24 Three-Tiered Image Pipeline cache-first routing. This is the "Pattern Substrate" per FOUNDATION_AUTHORITY L11.
- **File:** `packages/db/src/schema/image-intelligence.ts` (58 lines)
- **Tables:**

#### 2.3.1 `image_prompt_patterns`
- **Tenant scoping:** tenantScoped = false. Global VIYO intelligence. RLS policy: `service_role` only.
- **Columns (locked):** `id UUID PK`, `category VARCHAR(100) NOT NULL`, `layout_type VARCHAR(50) NOT NULL`, `typography_style VARCHAR(50) NOT NULL`, `product_type VARCHAR(100) DEFAULT 'general' NOT NULL`, `target_models TEXT[] NOT NULL`, `prompt_template TEXT NOT NULL`, `style_schema JSONB NOT NULL`, `embedding vector(1536) NOT NULL`, `qa_score NUMERIC(3,2) NOT NULL CHECK (qa_score BETWEEN 0 AND 1)`, `fidelity_score NUMERIC(3,2) DEFAULT 0.50 NOT NULL`, `cost_per_gen NUMERIC(5,4) NOT NULL`, `supports_typography BOOLEAN DEFAULT FALSE NOT NULL`, `usage_count INTEGER DEFAULT 0 NOT NULL`, `last_used_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK; `idx_patterns_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`; `idx_patterns_category ON (category, layout_type)`; `idx_patterns_product_type ON (product_type)`
- **RLS:** `service_role_only` policy. No authenticated user reads this table directly. The R24 RPC `match_image_patterns` (defined §3.1 below) is the only authorized read path.
- **Pattern Recipe schema (Lock 5 — schema-drift forbidden):** `style_schema` JSONB conforms to the locked Pattern Recipe JSON schema (defined in R24 v2 §X). Schema validation at write time via Inngest worker (skill: `pattern-recipe-validation`).
- **Vector dimension (Lock 19 — Provider Agnosticism):** `vector(1536)` is fixed. Embedding model is referenced via Provider Registry, NOT hardcoded. Pattern rows must record which embedding model produced them via `target_models[0]` field convention.

#### 2.3.2 RPC `match_image_patterns` (vector similarity search)

```sql
CREATE OR REPLACE FUNCTION match_image_patterns(
  query_embedding vector(1536),
  match_category TEXT,
  match_layout TEXT,
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE (
  id UUID,
  category VARCHAR,
  layout_type VARCHAR,
  typography_style VARCHAR,
  product_type VARCHAR,
  target_models TEXT[],
  prompt_template TEXT,
  style_schema JSONB,
  qa_score NUMERIC,
  fidelity_score NUMERIC,
  cost_per_gen NUMERIC,
  similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT
      p.id, p.category, p.layout_type, p.typography_style,
      p.product_type, p.target_models, p.prompt_template, p.style_schema,
      p.qa_score, p.fidelity_score, p.cost_per_gen,
      1 - (p.embedding <=> query_embedding) AS similarity
    FROM image_prompt_patterns p
    WHERE p.category = match_category
      AND p.layout_type = match_layout
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

**API contract for `match_image_patterns`:**
- **Auth:** Callable by `service_role` only; not exposed to authenticated users via PostgREST
- **Idempotency:** Read-only, naturally idempotent
- **Rate limit:** None at DB level; application-level rate limit applies per workspace
- **Request schema:** Query embedding `vector(1536)`, category string, layout string, threshold float 0.0-1.0, count int 1-50
- **Response:** Set of pattern rows ordered by similarity descending, limit applied. Empty set if no matches above threshold.
- **Status codes:** PostgreSQL function returns rows or empty. Wrapping API converts to HTTP 200 (results) / 404 (empty) per consumer R-spec.
- **Side effects:** None. Read-only.

#### 2.3.3 Image Intelligence — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Pattern Recipe schema drift | INSERT with `style_schema` violating Lock 5 locked JSON schema | `PATTERN_RECIPE_SCHEMA_DRIFT` (application-enforced via `pattern-recipe-validation` skill) | Transaction abort at app layer | Sentry critical |
| Vector dimension mismatch | INSERT with embedding of wrong dimension | `VECTOR_DIMENSION_MISMATCH` (PostgreSQL native error) | Transaction abort | Sentry capture |
| IVFFlat index degraded | After N inserts without REINDEX, recall drops | `IVFFLAT_RECALL_LOW` (operational metric, not error) | None — REINDEX as maintenance | PostHog event + OTel metric |
| Authenticated user direct query | User connection attempts SELECT on `image_prompt_patterns` | `RLS_VIOLATION_PATTERNS` | None | OTel + Sentry (potential abuse) |
| Model name hardcoded | DDL or DML contains literal model string like 'flux-1.1-pro' in normative position | `LOCK_19_VIOLATION_HARDCODED_MODEL` (caught by ZCBR validation at spec stage, not runtime) | Reject spec | Architect rewrite |

#### 2.3.4 Image Intelligence — edge cases

- **Empty Pattern DB:** New brand sees zero results from `match_image_patterns` → R24 Tier 3 routing (generate fresh) takes over. Pattern Seeding (B-1.05) populates over time.
- **Threshold too high:** `match_threshold > 0.95` may always return empty → R24 application logic must fall back to lower threshold or Tier 3.
- **IVFFlat probe count:** Default 10 probes. Adjustable via `SET LOCAL ivfflat.probes = N` for higher recall at query time.
- **Concurrent pattern updates:** Two `usage_count` increments racing → use atomic `UPDATE ... SET usage_count = usage_count + 1` (no read-modify-write).

#### 2.3.5 Image Intelligence — tests required

- **Pattern Recipe validation test:** Author fixture pattern with valid recipe → INSERT succeeds. Drift fixture → app rejects pre-INSERT.
- **IVFFlat recall test:** Insert 10,000 patterns with known embeddings; query with target embedding; assert top-K matches expected
- **Service-role isolation test:** Authenticated user connection → SELECT returns 0 rows
- **RPC test:** Call `match_image_patterns` with fixture query, assert ordering by similarity desc
- **Lock 5 schema-drift CI test:** Pattern Recipe JSON schema fixture compared byte-for-byte against committed version → drift fails CI

---

### 2.4 Email Composition Domain

- **Purpose:** MJML/JSON Recipe email template storage + ESP connector credential storage (R27 + R29)
- **File:** `packages/db/src/schema/email.ts` (57 lines)
- **Tables:**

#### 2.4.1 `email_templates`
- **Tenant scoping:** tenantScoped = true
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `brand_id UUID REFERENCES brands(id) ON DELETE CASCADE` (added in v2 — was missing in v1 implementation), `name VARCHAR(255) NOT NULL`, `subject_line TEXT NOT NULL`, `preheader TEXT`, `viyo_utl_source TEXT NOT NULL`, `compiled_html TEXT`, `compiled_mjml TEXT`, `esp_target VARCHAR(50)`, `status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','review','approved','sent','scheduled','sending','failed')) NOT NULL`, `scheduled_send_at TIMESTAMPTZ`, `created_by UUID REFERENCES users(id) ON DELETE SET NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Status enum extended in v2:** v1 had `('draft','review','approved','sent')`. v2 adds `('scheduled','sending','failed')` to support B-2.10 Klaviyo deployment pipeline + B-2.21 A/B testing. Migration: ALTER TABLE … DROP CONSTRAINT + ADD CONSTRAINT.
- **Indexes:** PK; `idx_email_templates_workspace_status ON (workspace_id, status)`; `idx_email_templates_brand ON (brand_id) WHERE brand_id IS NOT NULL`
- **RLS:** Standard tenant-scoped

#### 2.4.2 `esp_connections`
- **Tenant scoping:** tenantScoped = true
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `provider VARCHAR(50) NOT NULL CHECK (provider IN ('klaviyo','mailchimp','sendgrid','brevo','hubspot','activecampaign','drip','customer_io'))`, `api_key_encrypted TEXT NOT NULL`, `is_active BOOLEAN DEFAULT TRUE NOT NULL`, `last_synced_at TIMESTAMPTZ`, `metadata JSONB DEFAULT '{}'::jsonb NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Encryption (Lock 19):** `api_key_encrypted` stores AES-256-GCM encrypted ciphertext. The encryption key is environment-scoped per Lock 19 + R22. Decryption happens only in the worker boundary, never in API responses.
- **Provider evolution:** When R29 PAL v2 unifies the registry per D55, the AI provider registry is a separate table (slot reserved — to be defined in B-XC.01). `esp_connections` continues to hold ESP-only credentials.
- **Indexes:** PK; `idx_esp_connections_workspace_provider ON (workspace_id, provider)` UNIQUE (one connection per provider per workspace)
- **RLS:** Standard tenant-scoped + service-role can decrypt for worker operations

#### 2.4.3 Email Composition — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Invalid status transition | UPDATE attempts `draft → sent` skipping `review/approved` | `STATUS_TRANSITION_INVALID` (application-enforced) | Transaction abort | App warn |
| Provider enum violation | INSERT with `provider='constant_contact'` | `CHECK_CONSTRAINT_VIOLATION_PROVIDER` | Transaction abort | Error log |
| Duplicate ESP connection | INSERT second `(workspace_id, provider)` pair | `UNIQUE_VIOLATION_ESP_CONNECTION` | Transaction abort | App warn |
| Decryption failure | `api_key_encrypted` corrupted or wrong key version | `DECRYPTION_FAILED_ESP_CREDENTIAL` | Connection marked inactive | Sentry critical |
| Encryption key rotation | Active key version retired, old credentials need re-encryption | `KEY_VERSION_DEPRECATED` (operational, not error) | Migrate via background job | OTel event |

#### 2.4.4 Email Composition — edge cases

- **Template without brand:** `brand_id` NULL allowed in v1 schema; v2 makes it optional but indexed. Brand assignment may happen after template draft.
- **Compiled MJML drift from source:** `viyo_utl_source` is canonical; `compiled_mjml` and `compiled_html` are caches. Application must regenerate from source if cache invalid.
- **ESP credential rotation:** Multiple `esp_connections` rows allowed per provider if `is_active=false` for old ones (rotation history).
- **Klaviyo deployment failure:** Status moves `sending → failed`. Application provides retry path (manual re-trigger).

#### 2.4.5 Email Composition — tests required

- **Status transition test:** Each valid transition + each invalid transition tested
- **Encryption round-trip test:** Encrypt → store → fetch → decrypt → assert match
- **Provider enum test:** All 8 valid providers accepted; 1 invalid rejected
- **Composite UNIQUE test:** Two ESP connections for same (workspace, provider) → second fails
- **RLS cross-tenant test:** User from workspace A cannot read workspace B's ESP credentials

---

### 2.5 Cost Tracking Domain

- **Purpose:** AI provider cost tracking + Stripe meter reconciliation (R23, per D56 Phase 0/Phase 1 split — this is the Phase 0 substrate; B-1.14 adds Phase 1 UI surface)
- **File:** `packages/db/src/schema/cost.ts` (42 lines)
- **Tables:**

#### 2.5.1 `token_usage_logs`
- **Tenant scoping:** tenantScoped = true
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `provider VARCHAR(50) NOT NULL`, `model VARCHAR(100) NOT NULL`, `operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('text_gen','image_gen','vision_qa','embedding','speech','video_analysis'))`, `prompt_tokens INTEGER DEFAULT 0 NOT NULL`, `completion_tokens INTEGER DEFAULT 0 NOT NULL`, `image_count INTEGER DEFAULT 0 NOT NULL`, `calculated_cost NUMERIC(10,6) NOT NULL`, `stripe_meter_event_id VARCHAR(255)`, `inngest_run_id VARCHAR(255)`, `generation_id UUID`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK; `idx_usage_ws_date ON (workspace_id, created_at DESC)`; `idx_usage_unsent ON (stripe_meter_event_id) WHERE stripe_meter_event_id IS NULL` (partial index for reconciliation)
- **RLS:** Standard tenant-scoped
- **Lock 8 enforcement:** `provider`/`model` are recorded for audit. Programmatic operations (those that don't invoke a model) MUST NOT write rows to `token_usage_logs`. CI grep test verifies no `token_usage_logs.insert(...)` call exists in code paths flagged programmatic.

#### 2.5.2 Cost Tracking — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Operation type violation | INSERT with operation_type='other' | `CHECK_CONSTRAINT_VIOLATION_OPERATION_TYPE` | Transaction abort | Error log |
| Negative cost | INSERT with `calculated_cost < 0` | `INVALID_COST_NEGATIVE` (application-enforced — DB constraint not added; relies on Stripe meter validation upstream) | Application abort | Sentry capture |
| Stripe meter unsent backlog | `stripe_meter_event_id IS NULL` rows accumulate beyond N | `STRIPE_METER_BACKLOG` (operational metric) | Reconciliation Inngest function clears | PostHog alert |
| Generation_id missing | INSERT without `generation_id` for trackable operation | `GENERATION_ID_MISSING` (application-enforced per P0-03) | Application warn | Error log |

#### 2.5.3 Cost Tracking — edge cases

- **Re-attribution:** Cost initially logged to one workspace then needs reassignment (e.g. shared resource billing) — NOT supported in v2. Each row is immutable. Re-attribution requires manual ledger correction in `token_ledger` (Billing domain).
- **Provider Registry indirection (Lock 19):** `provider` and `model` fields are recorded but should reflect Registry-resolved values, not direct API calls. CI grep verifies no model-name strings appear outside Registry boundary.

#### 2.5.4 Cost Tracking — tests required

- **Idempotency on retry:** Same Inngest run ID inserted twice → second blocked by application-level dedup (Inngest provides this).
- **Stripe meter reconciliation test:** Insert row with NULL meter ID, run reconciliation job, assert ID populated
- **Lock 8 grep CI test:** Code paths flagged programmatic must not contain `token_usage_logs.insert`

---

### 2.6 LLM Council Domain

- **Purpose:** Brain Council decision logging (R19, supports T0-T9 Phase 1/2 Council orchestration)
- **File:** `packages/db/src/schema/llm.ts` (33 lines)
- **Tables:**

#### 2.6.1 `council_decisions`
- **Tenant scoping:** tenantScoped = true
- **Columns (locked):** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `decision_type VARCHAR(50) NOT NULL`, `input_context JSONB NOT NULL`, `brain_votes JSONB NOT NULL`, `final_decision JSONB NOT NULL`, `confidence_score NUMERIC(3,2)`, `execution_time_ms INTEGER`, `generation_id UUID`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **brain_votes JSONB shape (Lock 12 — two-layer prompt):** `[{"brain": "art_director", "vote": "approve", "reasoning": "...", "token_budget_used": 1500}, ...]`. Shape validated at app layer; no DB-level JSON schema constraint.
- **Indexes:** PK; `idx_council_workspace_type ON (workspace_id, decision_type, created_at DESC)`
- **RLS:** Standard tenant-scoped

#### 2.6.2 LLM Council — failure modes + edge cases + tests

- **Failure: token budget exceeded** — `brain_votes[].token_budget_used` sum exceeds limit per Lock 12 → Council rejects, no row inserted, error event emitted (Inngest)
- **Edge: 1-brain council** — Some decisions involve only 1 brain; `brain_votes` JSONB array with 1 element. Schema allows; no minimum count constraint.
- **Test: serialization fidelity** — Insert + select round-trip preserves nested JSONB structure

---

### 2.7 Timer Service Domain (deferred to B-4.03)

- **Purpose:** Countdown timer config for Go WASM GIF engine (R28, deferred per Master Sequence)
- **File:** `packages/db/src/schema/timer.ts` (33 lines)
- **Tables: `timer_definitions`**

Schema is implemented but feature is deferred to P4+ (B-4.03). R20 v2 documents the schema as-is. Future R28 rewrite (per LATER appendix, B-XC stub) will validate and update.

Brief table summary: `id`, `workspace_id`, `label`, `target_timestamp`, `timezone`, `style_config JSONB`, `fallback_text`, `is_active`, timestamps. Standard tenant-scoped RLS. Tests deferred.

---

### 2.8 RLHF Domain

- **Purpose:** Reinforcement Learning from Human Feedback — votes, model versions, pattern performance metrics (R24 + R19 wiring, FOUNDATION_AUTHORITY L5 Data Flywheel)
- **File:** `packages/db/src/schema/rlhf.ts` (69 lines)
- **Tables:**

#### 2.8.1 `rlhf_votes`
- **Tenant scoping:** tenantScoped = false. Internal VIYO system data.
- **Columns:** `id UUID PK`, `pattern_id UUID REFERENCES image_prompt_patterns(id) ON DELETE CASCADE`, `source_image_url TEXT NOT NULL`, `generated_image_url TEXT NOT NULL`, `curator_id UUID REFERENCES users(id) ON DELETE CASCADE`, `vote VARCHAR(20) NOT NULL CHECK (vote IN ('approve','reject','skip'))`, `event_type VARCHAR(50) NOT NULL DEFAULT 'manual_curation' CHECK (event_type IN ('manual_curation','drag','export','regenerate','generate_start','swipe_left','swipe_right','approval_gate'))`, `rating INTEGER CHECK (rating IN (-1, 0, 1, 5))` (per Lock 9), `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Lock 9 enforcement:** `rating` constraint enforces enum {-1, 0, 1, 5}. Direct DB CHECK constraint.
- **event_type extended in v2:** v1 had implicit `manual_curation` only. v2 adds explicit enum for drag/export/regenerate/generate_start (B-1.00 Studio Core Loop RLHF emission per skill `rlhf-event-emission` B-XC.10) + swipe events (B-1.06 Tinder Swipe Gate UI) + approval_gate (B-2.5.04 P2.5 approval workflow).
- **Indexes:** PK; `idx_rlhf_pattern ON (pattern_id, created_at DESC)`; `idx_rlhf_curator ON (curator_id)`; `idx_rlhf_event_type ON (event_type, created_at DESC)`
- **RLS:** `service_role_only` policy

#### 2.8.2 `preference_model_versions`
- **Tenant scoping:** tenantScoped = false. Internal VIYO system data.
- **Columns:** `id UUID PK`, `version_tag VARCHAR(50) NOT NULL UNIQUE`, `training_vote_count INTEGER NOT NULL`, `accuracy_score NUMERIC(5,4)`, `is_active BOOLEAN DEFAULT FALSE NOT NULL`, `model_weights_url TEXT`, timestamps
- **Lock 9 enforcement:** `training_vote_count` is informational; the 5,000-decision-per-brand trigger for VLM bridge activation (per OD-016 recommendation) is checked at application level against `pattern_performance_metrics` rolling sum, not against this table.
- **Indexes:** PK; UNIQUE on `version_tag`; partial index on `(is_active) WHERE is_active = TRUE`

#### 2.8.3 `pattern_performance_metrics`
- **Tenant scoping:** tenantScoped = false. Aggregated global intelligence.
- **Columns:** `id UUID PK`, `pattern_id UUID NOT NULL`, `pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('copywriting','layout','timing','image_prompt'))`, `total_sends INTEGER DEFAULT 0 NOT NULL`, `open_rate NUMERIC(5,4)`, `click_rate NUMERIC(5,4)`, `conversion_rate NUMERIC(5,4)`, `qa_score_rolling NUMERIC(3,2)` (30-day rolling), `last_calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, timestamps
- **30-day rolling window per Lock 9:** `qa_score_rolling` is materialized by daily Inngest aggregation job, not computed on read.
- **Indexes:** PK; `idx_pattern_perf_pattern ON (pattern_id, pattern_type)`

#### 2.8.4 RLHF — failure modes + tests

- **Failure: rating out of enum** → `CHECK_CONSTRAINT_VIOLATION_RATING` (caught at DB)
- **Failure: pattern_performance_metrics drift from rlhf_votes aggregation** → reconciliation job catches; alert if drift > 5%
- **Test: enum coverage** — All 8 event_types accepted; invalid value rejected
- **Test: Lock 9 enforcement** — Rating values 2, 3, 4 rejected by CHECK constraint
- **Test: rolling window calculation** — Insert 31 days of votes, run aggregation, assert oldest day excluded from rolling

---

### 2.9 Billing Domain (T9 Master Spec §2)

- **Purpose:** Token economics, Stripe billing, immutable ledger, system config, promo codes, system email templates. Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §2.
- **File:** `packages/db/src/schema/billing.ts` (175 lines)
- **Tables (9 tables):**

#### 2.9.1 `token_balances`
- **Tenant scoping:** Special — `workspace_id` is BOTH PK and FK to `workspaces(id) ON DELETE CASCADE`. One row per workspace.
- **Columns:** `workspace_id UUID PK REFERENCES workspaces(id) ON DELETE CASCADE`, `balance BIGINT DEFAULT 0 NOT NULL`, `lifetime_granted BIGINT DEFAULT 0 NOT NULL`, `lifetime_consumed BIGINT DEFAULT 0 NOT NULL`, `lifetime_refunded BIGINT DEFAULT 0 NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Updated only by `atomic_token_deduction` RPC** (defined in T9, not R20). Direct UPDATE forbidden via RLS policy.
- **Materialized O(1) balance lookup** — application reads from this table for current balance; `token_ledger` is the audit source of truth.

#### 2.9.2 `token_ledger` (IMMUTABLE)
- **Tenant scoping:** tenantScoped = true
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `user_id UUID REFERENCES users(id) ON DELETE SET NULL`, `amount BIGINT NOT NULL`, `running_balance BIGINT NOT NULL`, `transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('grant','purchase','consumption','refund','promo','adjustment','top_up'))`, `description TEXT NOT NULL`, `reference_type VARCHAR(50)`, `reference_id UUID`, `stripe_payment_intent_id VARCHAR(255)`, `metadata JSONB DEFAULT '{}'::jsonb`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **IMMUTABILITY enforcement:** RLS policy denies UPDATE and DELETE for ALL roles including service_role except via explicit corrective adjustment migration. Implementation: RLS `FOR UPDATE USING (false)`, `FOR DELETE USING (false)`. Adjustments are NEW INSERT rows with `transaction_type='adjustment'`.
- **Indexes:** PK; `idx_token_ledger_workspace_created ON (workspace_id, created_at DESC)`; `idx_token_ledger_stripe_pi ON (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL`

#### 2.9.3 `stripe_webhook_events`
- **Tenant scoping:** Sometimes tenantScoped (most), sometimes global (subscription tier changes can affect a workspace). `workspace_id` nullable.
- **Columns:** `id UUID PK`, `workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE`, `stripe_event_id VARCHAR(255) UNIQUE NOT NULL`, `event_type VARCHAR(100) NOT NULL`, `processed BOOLEAN DEFAULT FALSE NOT NULL`, `processed_at TIMESTAMPTZ`, `payload JSONB NOT NULL`, `error_message TEXT`, `retry_count INTEGER DEFAULT 0 NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Idempotency:** `stripe_event_id` UNIQUE — Stripe webhooks may retry; the dedup row prevents double-processing.
- **Indexes:** PK; UNIQUE on `stripe_event_id`; partial `idx_stripe_unprocessed ON (created_at) WHERE processed = FALSE`

#### 2.9.4 `system_config`
- **Tenant scoping:** Global. Key-value store with versioning.
- **Columns:** `id UUID PK`, `config_key VARCHAR(100) UNIQUE NOT NULL`, `config_value JSONB NOT NULL`, `description TEXT`, `version INTEGER DEFAULT 1 NOT NULL`, `updated_by UUID REFERENCES users(id) ON DELETE SET NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **RLS:** `service_role_only` for reads; PO-admin role required for writes (enforced at app layer, not DB).
- **Audit trail:** Every UPDATE triggers an INSERT into `system_config_audit_log` (database trigger defined in migration).

#### 2.9.5 `system_config_audit_log` (IMMUTABLE)
- Mirrors `system_config` updates with old + new values; IMMUTABLE via RLS (same pattern as `token_ledger`).
- Columns: `id`, `config_key`, `old_value JSONB`, `new_value JSONB`, `changed_by UUID`, `changed_at TIMESTAMPTZ`, `change_reason TEXT`

#### 2.9.6 `provider_pricing_registry`
- **Tenant scoping:** Global. Pricing data per provider/model/operation.
- **Columns:** `id UUID PK`, `provider VARCHAR(50) NOT NULL`, `model VARCHAR(100) NOT NULL`, `operation_type VARCHAR(50) NOT NULL`, `cost_per_unit NUMERIC(12,8) NOT NULL`, `unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('per_1k_tokens','per_image','per_second','per_request'))`, `effective_from TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `effective_until TIMESTAMPTZ`, `markup_multiplier NUMERIC(4,2) DEFAULT 1.00 NOT NULL` (per T9 markup policy), `is_active BOOLEAN DEFAULT TRUE NOT NULL`, timestamps
- **Indexes:** PK; `idx_pricing_active ON (provider, model, operation_type) WHERE is_active = TRUE`
- **Time-series pricing:** New pricing creates new row with `effective_from` set, old row's `effective_until` set. Queries use range overlap.

#### 2.9.7 `promo_codes` + `promo_redemptions`
- Standard promo code system with redemption tracking. `promo_codes`: code, description, value, value_type (percent/absolute_tokens), max_redemptions, expires_at. `promo_redemptions`: code_id, workspace_id, user_id, redeemed_at, value_granted.

#### 2.9.8 `system_email_templates`
- Transactional email templates (welcome, password reset, invitation, etc.) — distinct from `email_templates` (which is brand-authored marketing emails).
- Columns: `id`, `template_key VARCHAR(100) UNIQUE`, `subject_template TEXT`, `html_template TEXT`, `text_template TEXT`, `description`, timestamps

#### 2.9.9 Billing — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Token deduction race | Two concurrent generations both attempt balance < amount → both succeed → negative balance | `TOKEN_BALANCE_NEGATIVE` (prevented by row-lock in `atomic_token_deduction` RPC) | Application abort with retry | Sentry critical if reached |
| Stripe webhook retry without dedup | `stripe_event_id` collision attempts second INSERT | `UNIQUE_VIOLATION_STRIPE_EVENT` (silent ignore — idempotency working) | None | OTel event |
| Direct UPDATE to `token_ledger` | Any role attempts UPDATE | `RLS_VIOLATION_LEDGER_IMMUTABLE` | None | Sentry critical (potential abuse) |
| `token_balances` direct UPDATE without RPC | Application attempts UPDATE outside `atomic_token_deduction` | `RLS_VIOLATION_BALANCE_BYPASS` | None | Sentry critical |
| Promo code over-redeemed | Concurrent redemption exceeds `max_redemptions` | `PROMO_LIMIT_EXCEEDED` (prevented by row-lock + count subquery) | Application abort | App warn |

#### 2.9.10 Billing — edge cases

- **Negative cost (refund):** `token_ledger.amount` can be negative (representing refund or grant). `running_balance` reflects current state.
- **Stripe subscription change mid-cycle:** Stripe webhook updates `workspaces.subscription_tier`. Token grant for new tier minus pro-rated unused current tier is computed and INSERTed to ledger.
- **System config rollback:** Audit log allows reconstruction of any prior config state by replaying through INSERTs.
- **Promo code expired but in flight:** Lock 9 enforcement at app layer — check `expires_at > NOW()` at redemption transaction start, fail otherwise.

#### 2.9.11 Billing — tests required

- **Immutability test:** Attempt UPDATE to `token_ledger` row → fails with RLS error. Attempt DELETE → fails. Insert allowed.
- **Race test:** 100 concurrent token deductions for same workspace → assert atomicity (total deducted = balance change)
- **Stripe webhook idempotency test:** Same `stripe_event_id` POSTed twice → second silently ignored
- **Audit trigger test:** UPDATE `system_config` → trigger inserts to `system_config_audit_log` with old + new values
- **Pricing time-series test:** Insert pricing row, then insert successor → assert ranges don't overlap, active rows correct

---

### 2.10 Collaboration Domain (T45 Composite DB Foundation)

- **Purpose:** Brands anchor + comments + notification preferences. Foundation for P2.5 Brand Team Collaboration. Authority: T45.
- **File:** `packages/db/src/schema/collaboration.ts` (105 lines)
- **Tables:**

#### 2.10.1 `brands`
- **Tenant scoping:** tenantScoped = true. `brands` is the minimal anchor that `assets.brand_id` and `email_templates.brand_id` reference.
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `name VARCHAR(255) NOT NULL`, `hyve_opt_in BOOLEAN DEFAULT FALSE NOT NULL`, `hyve_opt_in_timestamp TIMESTAMPTZ`, `brand_guidelines_url TEXT`, `default_brand BOOLEAN DEFAULT FALSE NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Composite UNIQUE for T72 enforcement:** `UNIQUE (id, workspace_id)` — supports the composite FK on `assets(brand_id, workspace_id)` preventing cross-tenant brand reference.
- **HYVE opt-in (Lock 13 + R36):** `hyve_opt_in` flag with `hyve_opt_in_timestamp` recorded for consent audit. Opt-out clears flag + timestamp.
- **Indexes:** PK; `idx_brands_workspace_id ON (workspace_id)`; `uq_brands_id_workspace ON (id, workspace_id)` (UNIQUE for composite FK)

#### 2.10.2 `comments`
- **Tenant scoping:** tenantScoped = true. Brand-isolated.
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE`, `author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `target_type comment_target_type NOT NULL` (PostgreSQL ENUM type — see below), `target_id UUID NOT NULL`, `content TEXT NOT NULL`, `parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE` (threading), `mentions UUID[] DEFAULT '{}'::UUID[] NOT NULL`, `pinned_at TIMESTAMPTZ`, `pin_x NUMERIC(5,2)`, `pin_y NUMERIC(5,2)` (canvas coordinates for pin-on-canvas), `resolved_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Target type enum (PostgreSQL ENUM, locked at 11 values):** `'image','email','product','segment','flow','event','calendar','strategy','branding','support','general'` (per PO-approved comment target taxonomy)
- **Composite FK ensure-tenant:** `FOREIGN KEY (brand_id, workspace_id) REFERENCES brands(id, workspace_id) ON DELETE CASCADE` — prevents cross-tenant brand assignment
- **Indexes:** PK; `idx_comments_brand_target ON (brand_id, target_type, target_id)`; `idx_comments_parent ON (parent_comment_id)` (for thread queries); `idx_comments_unresolved ON (brand_id, resolved_at) WHERE resolved_at IS NULL`

#### 2.10.3 `notification_preferences`
- **Tenant scoping:** tenantScoped = true. Per-user, per-workspace.
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('mention','assignment','approval_request','approval_decision','comment_reply','daily_digest','weekly_summary','token_low','token_depleted','campaign_send','campaign_fail'))`, `channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app','email','sms'))`, `enabled BOOLEAN DEFAULT TRUE NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Composite UNIQUE:** `UNIQUE (workspace_id, user_id, notification_type, channel)`

#### 2.10.4 Collaboration — failure modes + tests

- **Failure: target_type enum violation** — INSERT with `target_type='other'` → CHECK error
- **Failure: orphan parent_comment_id** — Replied-to comment deleted → cascade delete reply chain
- **Edge: pin coordinates out of range** — Application enforces `0 <= pin_x, pin_y <= 100`; no DB constraint
- **Test: 11-value target enum** — All 11 values accepted; 12th value rejected
- **Test: composite tenant FK** — Comment with `brand_id` from different workspace → fails

---

### 2.11 Webhook Domain (T48 v3.0 + Notion D11)

- **Purpose:** Universal webhook dispatcher with 7-retry exponential backoff, 72hr DLQ, HMAC-SHA256, 500/min rate limit (D11 supersedes T48 spec text)
- **File:** `packages/db/src/schema/webhooks.ts` (82 lines)
- **Tables:**

#### 2.11.1 `webhook_endpoints`
- **Tenant scoping:** tenantScoped = true
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `url TEXT NOT NULL`, `secret VARCHAR(64) NOT NULL` (HMAC-SHA256 secret), `events VARCHAR[] NOT NULL` (subscribed event names from WEBHOOK_EVENT_CATALOG), `is_active BOOLEAN DEFAULT TRUE NOT NULL`, `description VARCHAR(255)`, `last_triggered_at TIMESTAMPTZ`, `failure_count INTEGER DEFAULT 0 NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Event catalog (locked at 22 events per T48 v3.0):** `email.generation.started`, `email.generation.completed`, `email.generation.failed`, `email.export.completed`, `email.export.failed`, `email.status.changed`, `image.generation.started`, `image.generation.completed`, `image.generation.failed`, `image.edit.completed`, `image.edit.failed`, `image.saved_to_vault`, `brand.import.started`, `brand.import.completed`, `brand.import.failed`, `brand.assets.updated`, `team.comment.added`, `team.approval.granted`, `team.member.invited`, `billing.tokens.low`, `billing.tokens.depleted`, `billing.subscription.changed`. Future additions require R20 minor version bump.
- **Indexes:** PK; `idx_webhook_endpoints_workspace_id ON (workspace_id)`; `idx_webhook_endpoints_active ON (workspace_id, is_active)`; `idx_webhook_endpoints_events ON (events)` (GIN array index for subscription lookup)

#### 2.11.2 `webhook_delivery_logs`
- **Tenant scoping:** Joins through `webhook_endpoints.workspace_id` for RLS (no direct workspace_id column)
- **Columns:** `id UUID PK`, `endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE`, `event_type VARCHAR(100) NOT NULL`, `payload JSONB NOT NULL`, `attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `response_status INTEGER`, `response_body TEXT`, `attempt_number INTEGER DEFAULT 1 NOT NULL`, `next_retry_at TIMESTAMPTZ`, `final_status VARCHAR(20) CHECK (final_status IN ('pending','succeeded','failed','dlq')) NOT NULL DEFAULT 'pending'`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Indexes:** PK; `idx_delivery_endpoint_attempted ON (endpoint_id, attempted_at DESC)`; `idx_delivery_pending_retry ON (next_retry_at) WHERE final_status = 'pending'`; `idx_delivery_dlq ON (endpoint_id) WHERE final_status = 'dlq'`
- **RLS:** Subquery through `webhook_endpoints` — `USING (endpoint_id IN (SELECT id FROM webhook_endpoints WHERE workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())))`

#### 2.11.3 Webhooks — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Endpoint URL changes mid-delivery | Application updates `url` while delivery in flight | None — in-flight deliveries use original URL captured in payload | None | OTel event |
| Secret rotation | `secret` updated → existing in-flight signatures use old; new deliveries use new | None — signatures regenerated per-attempt | None | OTel event |
| 7th retry exhausted | All retries fail | `WEBHOOK_DLQ_ENTRY` | Move to DLQ, alert | PostHog event |
| 72hr DLQ expiry | Row in DLQ exceeds 72hr | `WEBHOOK_DLQ_EXPIRED` | DELETE after 72hr via Inngest cleanup | Alert if >100 expired |
| Rate limit exceeded | Workspace exceeds 500 webhooks/min | `WEBHOOK_RATE_LIMITED` | Application-level back-pressure | OTel event |

#### 2.11.4 Webhooks — edge cases + tests

- **Edge: Event subscribed but feature off** — `events` array contains event for which workspace has no active feature → dispatcher skips (no row written)
- **Edge: Concurrent delivery for same endpoint+event** — Idempotency keys at consumer; this DB schema doesn't enforce
- **Test: 22-event catalog** — All 22 events accepted in `events` array; non-catalog event rejected
- **Test: HMAC signature verification** — Sign payload with stored secret, send via test endpoint, verify
- **Test: 7-retry pattern** — Insert 7 failed attempts, assert next is DLQ

---

### 2.12 Integrations Domain

- **Purpose:** Encrypted OAuth/platform credentials beyond ESPs (Shopify, Stripe Connect, etc.). Authority: T19 + T45 Composite DB Foundation.
- **File:** `packages/db/src/schema/integrations.ts` (44 lines)

#### 2.12.1 `integration_connections`
- **Tenant scoping:** tenantScoped = true
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `provider VARCHAR(50) NOT NULL`, `status VARCHAR(30) DEFAULT 'active' NOT NULL`, `access_token_encrypted TEXT NOT NULL`, `refresh_token_encrypted TEXT`, `scopes VARCHAR[] DEFAULT '{}'::VARCHAR[] NOT NULL`, `expires_at TIMESTAMPTZ`, `channel_mappings JSONB DEFAULT '{}'::jsonb NOT NULL`, `metadata JSONB DEFAULT '{}'::jsonb NOT NULL`, `created_by UUID REFERENCES users(id) ON DELETE SET NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Encryption (Lock 19 + R22):** AES-256-GCM, same pattern as `esp_connections`
- **Provider scope (currently):** `shopify`, `stripe`, `custom`. Extended via R29 PAL v2 (B-XC.01).
- **Indexes:** PK; `idx_integration_connections_workspace_provider ON (workspace_id, provider)`; `idx_integration_connections_status ON (status)`; `uq_integration_connections_provider ON (workspace_id, provider)` UNIQUE

#### 2.12.2 Integrations — failure modes + tests

- **Failure: refresh token decryption** — Same pattern as ESP credentials
- **Failure: OAuth scope drift** — Provider revokes scope; integration becomes partial; `status='partial_scopes'` (app sets)
- **Test: composite UNIQUE** — Two connections for same (workspace, provider) → second fails
- **Test: token refresh round-trip** — Encrypt → store → decrypt → verify with provider

---

### 2.13 Proprietary Intelligence Domain (PIA-1)

- **Purpose:** R36 HYVE + R37 MAAX + R38 SYPHON foundation. Privacy and consent-first. Authority: R36 HYVE, R37 MAAX, R38 SYPHON, PRD V6 Addendum, PIA-1 migration 0009.
- **File:** `packages/db/src/schema/proprietary-intelligence.ts` (156 lines)
- **Tables:**

#### 2.13.1 `brand_preferences` (R37 MAAX)
- **Tenant scoping:** tenantScoped = true. Per-brand memory (isolated; never aggregated across brands).
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE`, `user_id UUID REFERENCES users(id) ON DELETE SET NULL`, `studio_type VARCHAR(50) NOT NULL CHECK (studio_type IN ('vvow','pulze','vault','brand_style','general'))`, `action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('accept','reject','edit','send','brand_style_decision','select_generation','approve_asset'))`, `generation_id UUID`, `context_payload JSONB DEFAULT '{}'::jsonb NOT NULL`, `edit_delta JSONB DEFAULT '{}'::jsonb NOT NULL`, `recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Composite FK to brands:** `FOREIGN KEY (brand_id, workspace_id) REFERENCES brands(id, workspace_id) ON DELETE CASCADE` (cross-tenant safety)
- **Indexes:** PK; `idx_brand_preferences_workspace_id`; `idx_brand_preferences_brand_recorded ON (brand_id, recorded_at)`; `idx_brand_preferences_studio_action ON (studio_type, action_type, recorded_at)`; `idx_brand_preferences_generation_id`

#### 2.13.2 `hyve_pattern_performance` (R36 HYVE)
- **Tenant scoping:** **NO tenant scoping.** Anonymized aggregate network intelligence. **No brand identity, no customer identity, no raw prompts, no raw creative text, no raw image content, no customer lists.**
- **Columns:** `id UUID PK`, `vertical VARCHAR(120) NOT NULL`, `revenue_band VARCHAR(80) NOT NULL`, `pattern_signature_hash VARCHAR(128) NOT NULL`, `pattern_type VARCHAR(50) NOT NULL`, `period_start TIMESTAMPTZ NOT NULL`, `period_end TIMESTAMPTZ NOT NULL`, `aggregated_metrics JSONB NOT NULL`, `sample_count INTEGER NOT NULL CHECK (sample_count >= 10)`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **k-anonymity (Lock 13 privacy):** `sample_count >= 10` CHECK constraint enforces minimum aggregation threshold. Rows with sample_count < 10 are rejected at INSERT.
- **Privacy validation (app layer):** Before INSERT, application asserts no PII keys in `aggregated_metrics` (per `CAMPAIGN_PERFORMANCE_FORBIDDEN_METADATA_KEYS` list in `packages/shared/src/schemas/pia.ts`).
- **Indexes:** PK; `idx_hyve_vertical_period ON (vertical, period_start DESC)`; `idx_hyve_pattern_signature ON (pattern_signature_hash)`

#### 2.13.3 `campaign_performance` (R38 SYPHON)
- **Tenant scoping:** tenantScoped = true. Daily ESP performance metrics per workspace.
- **Columns:** `id UUID PK`, `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`, `brand_id UUID REFERENCES brands(id) ON DELETE CASCADE`, `esp_provider VARCHAR(50) NOT NULL`, `campaign_external_id VARCHAR(255) NOT NULL`, `metric_date DATE NOT NULL`, `sends INTEGER`, `opens INTEGER`, `clicks INTEGER`, `unsubscribes INTEGER`, `bounces INTEGER`, `revenue_attributed NUMERIC(12,2)`, `metadata JSONB DEFAULT '{}'::jsonb NOT NULL`, `synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`, `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- **Forbidden metadata keys (per pia.ts):** `customer_id`, `customer_email`, etc. — application validation pre-INSERT.
- **Composite UNIQUE:** `UNIQUE (workspace_id, esp_provider, campaign_external_id, metric_date)` — one row per campaign per day
- **Indexes:** PK; UNIQUE composite; `idx_campaign_perf_workspace_date ON (workspace_id, metric_date DESC)`

#### 2.13.4 PIA — failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Sub-k-anonymity HYVE insert | INSERT to `hyve_pattern_performance` with `sample_count < 10` | `CHECK_CONSTRAINT_VIOLATION_K_ANONYMITY` | Transaction abort | Sentry critical (privacy guard) |
| PII in HYVE metadata | Application validation finds forbidden key | `PII_VIOLATION_HYVE_METADATA` | Application abort | Sentry critical |
| Brand consent missing for HYVE | INSERT to HYVE while `brands.hyve_opt_in = FALSE` | `CONSENT_VIOLATION_HYVE` (application-enforced) | Application abort | Sentry critical |
| Cross-tenant brand_preferences | INSERT with brand_id from different workspace | `FK_VIOLATION_COMPOSITE_BRAND_WORKSPACE_PREF` | Transaction abort | Sentry capture |

#### 2.13.5 PIA — edge cases + tests

- **Edge: Brand opts out of HYVE mid-period** — Existing HYVE rows are NOT retroactively removed (they're anonymized aggregates, not brand-specific). New ingestion stops.
- **Test: k-anonymity** — Attempt INSERT with sample_count=9 → fails
- **Test: Forbidden key** — Attempt INSERT with `metadata.customer_email` → app rejects
- **Test: Consent gate** — `hyve_opt_in=FALSE` → HYVE write blocked

---

## 3. Multi-Tenant Architecture (FOUNDATION_AUTHORITY L1 + Lock 13)

### 3.1 Tenant boundary contract

**`workspaces.id` is the universal tenant boundary.** Every tenant-scoped table MUST:

1. Include `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`
2. Enable Row-Level Security: `ALTER TABLE <name> ENABLE ROW LEVEL SECURITY`
3. Apply the standard tenant policy: `CREATE POLICY "ws_isolation_<name>" ON <name> FOR ALL USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))`

Tables that deviate from this pattern MUST explicitly justify and document the deviation. The current deviations in v2:

- `workspaces` itself — custom `ws_self_view` policy (users see workspaces they belong to)
- `users` — custom `users_ws_view` policy (users see other users in same workspace)
- `image_prompt_patterns` — `service_role_only` (global VIYO intelligence)
- `rlhf_votes`, `preference_model_versions`, `pattern_performance_metrics` — `service_role_only` (internal VIYO system data)
- `system_config`, `system_config_audit_log`, `provider_pricing_registry`, `system_email_templates` — `service_role_only` (global config)
- `hyve_pattern_performance` — `service_role_only` (anonymized aggregates; no tenant boundary)
- `webhook_delivery_logs` — joins through `webhook_endpoints` for tenant scope
- `workspace_members` — junction table with custom policy

### 3.2 Service-role bypass detection (CI)

Per Lock 13, any code path that uses service-role connection MUST:

1. Be explicitly documented in this R20 or a consumer R-spec as requiring elevated privileges
2. Carry an inline comment: `// SERVICE_ROLE_BYPASS: <reason>`
3. Be flagged in CI grep for review: `grep -r "serviceRoleClient\|service_role_client\|createServiceRoleClient" --include="*.ts" --include="*.js" packages/ apps/`

The CI check produces a report of all service-role usage. New uses without inline comments fail CI.

### 3.3 Cross-tenant query prevention (CI test)

Every PR with schema changes MUST pass a CI test that:

1. Migrates fresh DB
2. Creates 2 workspaces (A, B) with 1 user each (User A, User B)
3. As User A (authenticated connection), attempts SELECT on every tenant-scoped table for workspace B's data
4. Asserts each query returns 0 rows
5. Asserts no error is raised (RLS silently filters; doesn't error)

Failure of this test blocks merge.

### 3.4 RLS policy creation order (Lock 13 enforcement)

RLS policies MUST be created in the same migration file as the table they protect. Migrations that create tenant-scoped tables without RLS policies in the same file are rejected by CI. Rationale: a window where the table exists without RLS, even briefly during migration sequencing, is a privacy violation.

---

## 4. Vector Search Infrastructure

### 4.1 pgvector extension

Migration 0001 creates the `vector` extension:
```sql
CREATE EXTENSION IF NOT EXISTS "vector";
```

### 4.2 IVFFlat index pattern

`image_prompt_patterns.embedding` uses IVFFlat with `lists = 100`. Probes default to 10. Index created after table has minimum 1,000 rows (initial state has placeholder dummy rows or accepts higher recall during seeding).

Future tables that adopt pgvector follow the same pattern — separate index migration after data seeding.

### 4.3 Embedding model agnosticism (Lock 19)

The vector dimension is hardcoded at `vector(1536)` for compatibility with current embedding model class. The actual embedding model is resolved via Provider Registry. Future migration to different dimension (e.g. 1024 for smaller model) requires:

1. Add new column `embedding_v2 vector(1024)`
2. Backfill via Inngest job using Provider Registry-resolved model
3. Update IVFFlat index on new column
4. Update `match_image_patterns` RPC signature
5. Deprecate old `embedding` column via separate migration (kept for rollback safety)

---

## 5. Migration Plan (per WP-5 MIGRATION_AUTOMATION_PROPOSAL.md)

### 5.1 Canonical migration directory

**Current state:** `packages/db/drizzle/` contains 9 committed SQL migration files:
- `0001_extensions.sql`
- `0002_<descriptive>.sql` through `0008_<descriptive>.sql` (specific names per repo)
- `0009_pia1_proprietary_intelligence_foundation.sql`

**WP-5 Open Question #6** asks whether to rename to `packages/db/migrations/`. R20 v2 does NOT close this — PO decision deferred. v2 documents the current location.

### 5.2 Naming convention (locked)

Format: `NNNN_<descriptive_snake_case>.sql`

- `NNNN` is a 4-digit ordered prefix (0001-9999)
- Strictly monotonic across the repo — no gaps, no duplicate prefixes
- CI rejects PRs that introduce duplicate prefixes or gaps
- Concurrent PRs that both add migrations resolve via rebase + renumber

### 5.3 Migration command

**Single command:** `pnpm --filter @viyo/db db:migrate`
**Equivalent:** `cd packages/db && pnpm db:migrate` (runs `drizzle-kit migrate`)
**Connection:** `DATABASE_URL` environment variable (Supabase project pooler URL preferred)

`db:push` is FORBIDDEN as a CI operation. Schema-push generates dynamic DDL from current TypeScript schema state, bypassing file-based review. Locally during development, `db:push` is allowed for rapid iteration; before PR, developer must run `db:generate` to produce committed SQL.

### 5.4 Migration idempotency rules

Every migration file MUST be:

1. **Forward-safe to re-run** — running an already-applied migration twice produces no error. Drizzle tracks applied migrations via `drizzle.__drizzle_migrations` table.
2. **Self-contained for its diff** — a migration applies the diff between its predecessor and itself. No external state or temporary tables.
3. **Wrapped in BEGIN/COMMIT** — Drizzle handles transaction boundaries; manual SQL avoids open transactions.
4. **DDL-safe** — `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (PG 9.6+).
5. **RLS-in-same-migration** — Tables and their RLS policies in the same file. No separate "add RLS" migration.

### 5.5 Foreign key dependency ordering

Migrations applying schema MUST create parent tables before child tables. The 4-digit prefix ensures order. CI test attempts apply on fresh DB and verifies no FK violation.

### 5.6 Backfill strategy for future column additions

When a future migration adds a NOT NULL column to an existing table with data:

1. **Step 1:** Add column NULLABLE
2. **Step 2:** Backfill values via Inngest job (not part of migration — separate worker)
3. **Step 3:** Migration that marks column NOT NULL (separate file, only after backfill complete)

This 3-phase pattern prevents migration timeout on large tables and allows rollback at any phase.

### 5.7 No implicit rollback (per WP-5)

Drizzle Kit does NOT provide automatic down-migrations. Rollback options:

1. **Restore from Supabase backup** (point-in-time recovery within 7 days for production, 1 day for staging)
2. **Apply corrective forward migration** — write a new migration that reverses the unwanted change
3. **NEVER edit a committed migration after merge** — corrective forward only

### 5.8 CI workflow trigger (per WP-5)

**Staging migrations (auto):**
- Trigger: push to `staging` branch where diff includes `packages/db/drizzle/*.sql` files
- Workflow: `.github/workflows/migrate-staging.yml` (to be authored — implementation deferred per WP-5)
- Connection secret: `DATABASE_URL_STAGING` (PO confirms secret name in implementation directive)
- GitHub Environment: `staging-supabase` (PO confirms name)
- Verification: Run `pnpm db:health-check` after migration; emit artifact with Git SHA + migration files + project ID + verification result

**Production migrations (manual gate):**
- Trigger: `workflow_dispatch` only
- Required input: `STAGING_VERIFIED` confirmation phrase
- Pre-flight check: Confirm staging migration succeeded for same commit SHA
- GitHub Environment: `production-supabase` with required reviewer
- Connection secret: `DATABASE_URL_PRODUCTION`
- Verification: Same as staging + immediate PO notification

**Notification channel, evidence storage, approver model, maintenance window:** Open per WP-5 §6 PO action items. R20 v2 does NOT close these.

### 5.9 Schema drift detection (CI)

A CI step runs `pnpm db:generate` and compares output to committed `packages/db/drizzle/*.sql` byte-for-byte. Drift fails CI. This catches:

- Developer changed TypeScript schema files but didn't run `db:generate`
- Developer edited generated SQL by hand
- Drizzle Kit version mismatch produces different output

### 5.10 Migration file content validation (CI)

For every migration file in a PR:

1. Reject duplicate prefix
2. Reject gap in numbering
3. Reject migration without `-- @migration: <description>` header comment
4. Reject migration with `DROP TABLE` without explicit `-- @destructive: <reason>` comment (extra review gate)

---

## 6. Schema Drift Detection (CI)

In addition to the migration drift check (§5.9), a separate CI step runs:

```bash
pnpm --filter @viyo/db db:generate --output ./drizzle-check
diff -r ./drizzle ./drizzle-check
```

The drift check produces a clean output or reports diff. Any diff fails CI.

This protects against:
- Schema TypeScript edits that weren't run through `db:generate`
- Hand-edited SQL that doesn't match Drizzle output
- Drizzle Kit version skew between local and CI

---

## 7. Observability (per FOUNDATION_AUTHORITY L7 + Lock 20)

### 7.1 generation_id propagation

Every operation that produces data MUST propagate a `generation_id UUID` field through:
- API request boundary (header `X-Generation-Id` or POST body)
- Inngest function context
- Database INSERT for any audit-relevant table
- OTel span attribute `viyo.generation_id`
- PostHog event property `generation_id`
- Sentry tag `generation_id`

Tables that record `generation_id`: `assets`, `token_usage_logs`, `rlhf_votes`, `brand_preferences`, `council_decisions`.

### 7.2 Migration evidence emission

After every migration (staging or production), the CI workflow emits an artifact containing:
- Git SHA of the merge commit
- Migration filenames applied
- Supabase project ID (`ypnwxghvsxpyvnsndrba` staging or `rdhxhjcfklodalgctrcf` production)
- Verification check result (PASS/FAIL)
- Notification dispatch result (PASS/FAIL)
- Timestamp (ISO 8601 UTC)

NO credential values, NO connection strings, NO secret content. Evidence is durable but non-secret.

### 7.3 OTel spans for DB operations

Every DB query that takes >100ms or every write operation MUST emit an OTel span with:
- `db.system: postgresql`
- `db.statement` (parameterized, no values)
- `db.workspace_id` (if applicable)
- `viyo.generation_id` (if applicable)

### 7.4 Sentry capture rules

Sentry captures these DB errors with severity:
- `RLS_VIOLATION_*` — info (RLS is working)
- `UNIQUE_VIOLATION_*` — warn (often expected business logic)
- `FK_VIOLATION_*` — error (indicates app bug)
- `CHECK_CONSTRAINT_VIOLATION_*` — error (indicates app bug)
- `STORAGE_DB_DESYNC` — critical (data integrity)
- `LOCK_*_VIOLATION` — critical (governance violation)

---

## 8. Failure Modes Summary (Cross-Domain)

Cross-domain failure modes covered in §2 per-domain tables. Aggregate summary:

| Category | Examples |
|---|---|
| Tenant isolation | RLS denial, cross-tenant FK |
| Data integrity | FK constraint, UNIQUE constraint, CHECK constraint |
| Atomicity | Storage + DB desync, immutable ledger UPDATE attempt |
| Idempotency | Stripe webhook duplicate, retry without dedup |
| Governance | Lock 5 schema drift, Lock 13 RLS bypass, Lock 19 hardcoded model |
| Concurrency | Token deduction race, promo over-redemption, lineage cycle |
| Privacy | k-anonymity violation, PII in HYVE metadata, consent gate bypass |
| Operational | Stripe meter backlog, DLQ accumulation, IVFFlat recall degradation |

---

## 9. Edge Cases Summary (Cross-Domain)

| Category | Examples |
|---|---|
| Empty state | Empty workspace, empty Pattern DB, asset without parent |
| Boundary | Sub-k-anonymity HYVE row, threshold-too-high pattern match |
| Concurrency | Concurrent migration prefixes, mid-flight URL change, concurrent token deductions |
| Drift | Compiled MJML vs source drift, encryption key rotation, schema drift |
| Lifecycle | Soft delete (assets via tombstone vs deleted_at — per domain decision), HYVE opt-out mid-period |
| Cross-region | Replication lag (future), backup restore drift |

---

## 10. Tests Required (ZCBR BR-3 — per-component)

Tests covered in each §2 domain subsection. Aggregate ZCBR-grade test plan:

| Test category | Coverage |
|---|---|
| Schema migration tests | Migrate fresh DB, all migrations succeed in order, no FK violation |
| RLS enforcement tests | Per-table, per-role, cross-tenant denial verified |
| Constraint tests | All CHECK constraints reject invalid values; all UNIQUE constraints enforce |
| Index tests | EXPLAIN verifies indexes used for documented queries |
| RPC tests | All defined RPCs (`match_image_patterns`, `atomic_token_deduction`, others) tested for contract compliance |
| Immutability tests | `token_ledger`, `system_config_audit_log` UPDATE/DELETE attempts fail |
| Drift tests | `db:generate` output matches committed SQL byte-for-byte |
| Concurrency tests | Race scenarios (token deduction, promo redemption, lineage) tested |
| Privacy tests | k-anonymity, PII detection, consent gates |
| Lock 19 grep test | No hardcoded model names in schema files |
| Lock 8 grep test | No `token_usage_logs.insert` in programmatic code paths |

CI integration: Tests run on every PR. Migration drift + schema drift checks run on every merge to `staging` and on production deploy.

---

## 11. Mechanical Acceptance Criteria (ZCBR BR-7)

R20 v2 implementation is accepted when:

1. **All 13 implemented domains** in §2 produce schema matching `packages/db/src/schema/*.ts` byte-for-byte (verified via drift detection §5.9)
2. **9 committed migrations** at `packages/db/drizzle/` apply cleanly to fresh Supabase DB (CI test)
3. **22-event webhook catalog** matches `packages/db/dist/schema/webhooks.d.ts` `WEBHOOK_EVENT_CATALOG` exactly
4. **11-value comment target enum** matches `packages/db/dist/schema/collaboration.d.ts` `commentTargetTypeEnum` exactly
5. **8-value ESP provider enum** matches `packages/db/src/schema/email.ts` `provider` CHECK constraint
6. **9-value asset_type enum** matches `packages/db/src/schema/products.ts` `assetType` CHECK constraint
7. **RLS enabled on all tenant-scoped tables** verified via `pg_class.relrowsecurity` query
8. **Service-role bypass detection CI test passes** — every `serviceRoleClient` usage has inline comment
9. **Cross-tenant query prevention CI test passes** — User A cannot SELECT User B's tenant data
10. **Schema drift CI test passes** — `db:generate` output matches committed SQL
11. **Lock 5 Pattern Recipe schema validation test passes** — drift fixture rejected
12. **Lock 9 RLHF rating CHECK enforced** — values 2/3/4 rejected
13. **Lock 13 cross-tenant FK prevention** — composite FK fires on cross-workspace brand reference
14. **Lock 19 grep test passes** — no hardcoded model names in any committed migration file
15. **WP-5 migration automation references** — R20 v2 cites WP-5 by repo path; WP-5 PO open questions remain open (not closed in R20 v2)
16. **R20 v1 and Final Doc 3 superseded** — separate cleanup directive lands supersession-pointer headers in both v1 files within 24 hours of R20 v2 merge

---

## 12. Locks & Decisions Invoked

| Authority | Application in R20 v2 |
|---|---|
| Lock 4 (no in-memory schema) | All schema persisted to PostgreSQL; no runtime schema synthesis |
| Lock 5 (Pattern Recipe schema-drift forbidden) | `image_prompt_patterns.style_schema` JSONB validated against locked schema |
| Lock 6 (Brand Vault separation) | `assets.brand_id` required; composite FK prevents cross-tenant brand assignment |
| Lock 8 (programmatic ops 0 tokens) | `token_usage_logs` CI grep test verifies no inserts from programmatic code paths |
| Lock 9 (RLHF event constraints) | `rlhf_votes.rating` CHECK enforces enum {-1, 0, 1, 5}; 30-day rolling in `pattern_performance_metrics` |
| Lock 12 (two-layer prompt token budget) | `council_decisions.brain_votes` JSONB shape includes `token_budget_used` |
| Lock 13 (multi-tenant RLS) | Every tenant-scoped table has RLS in same migration; CI tests enforce |
| Lock 19 (Provider Agnosticism) | No hardcoded model names in DDL; CI grep enforces |
| Lock 20 (ZCBR-Validated Specs Required) | This spec is ZCBR PASSED; Kimi pre-flight loads zcbr-spec-validation skill at intake |
| D11 (Webhook Architecture) | T48 v3.0 webhook tables align with D11 (D11 supersedes T48 spec text) |
| D55 (R29 PAL Option C — unified Plugin Registry) | AI Plugin Registry slot reserved; schema deferred to B-XC.01 |
| D56 (Token metering Phase 0/Phase 1 split) | Phase 0 substrate (`token_usage_logs`, `token_balances`, `token_ledger`) here; Phase 1 UI (B-1.14) deferred |
| D57 (Layer 1 Platform Skills in orchestrator) | `skills_registry` table referenced as Layer 2 only; Layer 1 not in DB |
| D63 (Skills do not live in git) | No `.skills/` table; skills loaded via Portal `skills.pickForTask` API |
| D66 (B-1.00 first Path C Bullet) | Schema supports Studio Core Loop end-to-end: identity, assets+lineage, pattern matching, RLHF, token metering, brand vault |

---

## 13. Migration to v2 (Implementation Path)

### 13.1 Document supersession

This R20 v2 is committed via Path B Manus directive to `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md`.

Immediately after merge:
1. `R20-V2-AND-DOC3-SUPERSESSION-001` cleanup directive lands SUPERSEDED headers on:
   - `docs/research_specs/R20_DATABASE_SCHEMA_LOCK_ENTERPRISE.md` (R20 v1)
   - `docs/foundation/VIYO_Final_Doc3_Database_Schema.md`
2. Both v1 files retain content as historical reference but carry pointer header: `**SUPERSEDED:** This file is superseded by R20 v2 at /docs/research_specs/R20_DATABASE_SCHEMA_v2.md. See that file for canonical schema.`

### 13.2 Schema file alignment

The 14 schema files at `packages/db/src/schema/*.ts` already cite "R20 §2" as authority. No schema file edits required for v2 supersession — the citation now points to v2 instead of v1 implicitly. Schema files can be touched in future Bullets without R20 v2 modification.

### 13.3 Reviewer Claude validates new R20 v2

At Reviewer Claude §9 Gate intake for any future schema-touching Bullet (B-0.02 through B-0.21, B-1.00 onwards), R20 v2 is loaded via the cited R-spec field. Reviewer runs `zcbr-spec-validation` skill against R20 v2 — must return PASS for Bullet to proceed.

### 13.4 Kimi pre-flight cites R20 v2

When Kimi K2.6 receives a Bullet directive citing R20 v2 in its `R-spec:` field, Composer Queue pre-flight runs `zcbr-spec-validation` against R20 v2 — must return PASS for Kimi to begin code work.

### 13.5 V1 → V2 changelog

| Section | v1 → v2 change |
|---|---|
| Header | Added YAML frontmatter with ZCBR Status PASSED + validation date + supersession declarations |
| Cross-spec wiring | Expanded from 8 R-specs to 17 R-specs + 4 T-specs + 5 Decisions; covers all 13 implemented domains |
| Identity domain | Added `workspace_members` junction (5-role enum + custom JSONB); corrected `subscription_tier` enum from `enterprise` to `agency` per D8 |
| Products & Assets | Added `assets.brand_id` required FK per T72; added `parent_asset_id` lineage column; extended asset_type enum to 9 values (added `brand_kit_component`, `ingested_email`, `ingested_image`); added `generation_id`, `tags`, `metadata` columns |
| Image Intelligence | Added `product_type`, `fidelity_score`, `supports_typography` columns; added composite (category, product_type) index pattern |
| Email Composition | Added `email_templates.brand_id` FK; extended status enum from 4 to 7 values; documented `scheduled_send_at` |
| Cost Tracking | Added `generation_id` column to `token_usage_logs` |
| LLM Council | Added `generation_id`; documented `brain_votes` JSONB shape with Lock 12 token budget |
| Timer Service | Documented (no change to schema; deferred feature) |
| RLHF | Extended `rlhf_votes` with `event_type` enum (8 values), `rating` CHECK ({-1, 0, 1, 5}); added `pattern_performance_metrics.qa_score_rolling` for 30-day window per Lock 9 |
| Billing | Documented all 9 T9 tables; T9 §2 referenced as business-logic source of truth; `token_ledger` IMMUTABILITY via RLS documented |
| Collaboration | Documented 11-value `comment_target_type` enum; pinned-on-canvas (pin_x, pin_y) coordinates; composite FK to brands |
| Webhooks | Documented 22-event catalog per T48 v3.0; D11 supersession of T48 text; DLQ semantics |
| Integrations | Documented OAuth scope evolution path; composite UNIQUE (workspace, provider) |
| PIA (R36/R37/R38) | Documented k-anonymity CHECK constraint (sample_count >= 10); PII forbidden keys; consent gates |
| Multi-tenant | New §3 documents tenant boundary contract; deviation list; service-role detection CI; cross-tenant CI test |
| Vector Search | New §4 documents pgvector + IVFFlat pattern; embedding model agnosticism per Lock 19 |
| Migration Plan | New §5 with WP-5 references; idempotency rules; RLS-same-migration; backfill 3-phase; CI triggers |
| Schema Drift Detection | New §6 documents `db:generate` byte-for-byte check |
| Observability | New §7 documents generation_id propagation; migration evidence; OTel + Sentry rules |
| Failure modes | Comprehensive per-domain coverage |
| Edge cases | Comprehensive per-domain coverage |
| Tests required | ZCBR BR-3 compliance — per-component test plans |
| Mechanical acceptance | 16 binary criteria (ZCBR BR-7 compliance) |
| Locks & Decisions | Comprehensive invocation map |
| Migration to v2 | Path B documented; supersession enforcement via cleanup directive |

---

## 14. Open Items NOT Closed by R20 v2

These remain PO action items, deferred per Architect/PO directive:

1. **WP-5 §6 PO open questions** (notification channel, GitHub Environment names, production approver model, maintenance window, evidence storage location, dir rename to `packages/db/migrations/`, no-op rehearsal scope) — all remain open. R20 v2 cites WP-5 as authority and does not close.
2. **AI Plugin Registry schema** (B-XC.01 R29 PAL v2) — slot reserved, schema deferred to that Bullet
3. **`email_sections` table** (R27) — planned for Phase 2, schema deferred
4. **`flow_definitions` table** (R32) — planned for Phase 2, schema deferred
5. **Schema for Phase 2-3-4 expansion tables** (P2 Email Engine, P2.5 Collaboration extensions, P3 Intelligence Studio) — added incrementally per their Bullets
6. **DR runbook** (B-XC.23) — separate fresh runbook supersedes R52; R20 v2 references the new runbook path
7. **B-XC.17 ZCBR plumbing tail items** — Kimi Portal pre-flight wiring (Path D, Portal Architect channel)

---

## 15. Document Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion VIYO Decision Log.

**Trigger for v3:** Any of:
- Schema CHECK constraint, RLS policy, or column type change to existing tables
- New table added to any domain
- New domain added (e.g. when R27 `email_sections` ships)
- ZCBR_STANDARD.md Section 4 checklist update (forces re-validation)

**Re-validation:** R20 v2 re-validates against ZCBR_STANDARD every 180 days per zcbr-spec-validation skill HEADER_STALE rule, or immediately after any standard update.

**Minor version bumps** (v2.1, v2.2) for additive non-breaking changes; **major version bumps** (v3.0) for schema-breaking changes requiring data migration.

---

*End of R20 Database Schema v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
