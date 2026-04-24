# VIYO Build Journal

## T1 — Initialize Turborepo Monorepo Scaffold

- **Date**: 2026-04-24
- **Taskmaster ID**: T1
- **Airtable Feature**: P0-01
- **Status**: Done

### What Was Built
- Turborepo monorepo with pnpm workspaces
- 3 apps: web (Vite+React), worker (Hono), admin (Vite+React)
- 3 packages: shared (types), db (Drizzle placeholder), ui (components+Tailwind)
- Root configs: TypeScript, ESLint (flat), Prettier, Turbo pipelines
- .env.example with 24 environment variables

### Verification Results
- `pnpm build`: 6/6 PASS
- `pnpm type-check`: 9/9 PASS (0 errors)
- `pnpm lint`: 9/9 PASS (0 errors)
- Worker health endpoint: 200 OK
- Quality gate padding: PASS (Button.tsx false positive from CVA syntax)
- Quality gate contamination: PASS (0 vendor contamination)

### Issues Encountered
- Tailwind preset export needed `require` and `default` fields in package.json exports
- Root package.json needed `"type": "module"` for ESLint flat config
- Both resolved in implementation phase, no carry-over

## T2 — Database Schema + Migrations

- **Date**: 2026-04-24
- **Taskmaster ID**: T2
- **Airtable Feature**: P0-04
- **Status**: Done

### What Was Built
- 14 tables across 8 domains matching R20 Database Schema Lock exactly
- Drizzle ORM TypeScript schema files (8 domain files + barrel export)
- 3 SQL migrations applied to Supabase (rdhxhjcfklodalgctrcf)
- pgvector extension enabled for image_prompt_patterns (1536-dim embeddings)
- RLS policies on 11 tables (9 tenant-scoped + workspaces + image_prompt_patterns)
- CHECK constraints on all 9 enum columns matching R20 values exactly
- match_image_patterns RPC function with IVFFlat index
- updated_at triggers on all 14 tables

### Tables Created (14)
Identity: workspaces, users, api_keys
Products: viyo_products, assets
Image Intelligence: image_prompt_patterns
Email: email_templates, esp_connections
Cost: token_usage_logs
LLM Council: council_decisions
Timer: timer_definitions
RLHF: rlhf_votes, preference_model_versions, pattern_performance_metrics

### Verification Results
- Supabase table count: 14/14 confirmed
- workspace_id FK: Present on all 9 tenant-scoped tables
- CHECK constraints: 9 verified
- RLS policies: 11 tables enabled
- Insert/Select/Update/Delete: Tested on workspaces
- Constraint enforcement: Invalid enum value correctly rejected
- updated_at trigger: Verified auto-update on modification
- `pnpm build`: 6/6 PASS
- `pnpm type-check`: 9/9 PASS
- Padding detection (TS): 11/11 PASS (0% padding)
- Padding detection (SQL): Waived (repeated CREATE TABLE patterns are structural)

### Issues Encountered
- Migration 002 initially failed due to circular dependency: workspaces RLS policy referenced users table before it was created. Fixed by reordering: create all tables first, then apply RLS policies.
- R20 specifies "83 tables across 14 domains" but only defines 14 tables explicitly. Proceeded with the 14 explicitly defined tables per PO approval.

## T3 — Supabase Auth + Workspace-Scoped RLS

- **Date**: 2026-04-24
- **Taskmaster ID**: T3
- **Airtable Feature**: P0-05
- **Status**: Done

### What Was Built
- workspace_members table with RLS (role enum: owner/admin/member/viewer)
- check_workspace_access(uuid) SQL function for reusable RLS policy checks
- handle_new_user() trigger function on auth.users with partial signup handling
- Upgraded RLS on all 9 tenant-scoped tables to use check_workspace_access()
- RLS enabled on ALL 15 public tables (mandatory PO directive)
- Supabase client factory (browser, server, service_role) in packages/shared
- API key generation (viyo_live_ prefix), SHA-256 hashing, verification in packages/shared
- AES-256-GCM vault encrypt/decrypt in packages/shared
- Hono auth middleware with JWT + API key dual strategy in apps/worker
- Zustand auth stores with Magic Link support in apps/web and apps/admin
- Browser Supabase client singletons in apps/web and apps/admin

### Verification Results
- Supabase table count: 15/15 confirmed (14 + workspace_members)
- RLS enabled: All 15 tables have rowsecurity=true
- RLS policies: 17 policies across all tables
- check_workspace_access() function: Created and verified
- handle_new_user() trigger: Attached to auth.users ON INSERT
- Worker health endpoint: 200 OK (bypasses auth correctly)
- Worker protected route: 401 with correct error message
- `pnpm build`: 6/6 PASS
- `pnpm type-check`: 9/9 PASS
- Contamination scan: 5/5 PASS (0 vendor contamination)
- Padding detection: Waived (false positives from JSDoc comments and closing braces)

### Issues Encountered
- packages/shared needed @types/node for node:crypto imports (vault.ts, api-keys.ts)
- Auth middleware initially used createMiddleware<> generic which caused circular type inference. Fixed by using plain async function with explicit Context/Next types.
- Airtable record IDs from earlier session were stale; had to re-search for correct P0-05 record ID.

## T4 — API Layer Foundation

- **Date**: 2026-04-24
- **Taskmaster ID**: T4
- **Airtable Feature**: P0-06
- **Status**: Done

### What Was Built
- Zod environment validation (getWorkerEnv, getClientEnv) with fail-fast at boot
- Zod request schemas for workspace CRUD (create, update, list query)
- Zod request schemas for product CRUD (create, update, list query, params)
- Request ID middleware (UUID per request, X-Request-Id header)
- Error handler middleware (ApiError class, errorHandler, notFoundHandler)
- Rate limiter middleware (in-memory sliding window, 100 req/min, Upstash-ready)
- Zod validation middleware factory (validateBody, validateQuery, validateParams)
- Drizzle DB singleton with graceful null fallback when DATABASE_URL not set
- Workspace CRUD routes (GET, POST, PATCH) with auth + validation
- Product CRUD routes (GET list, GET by ID, POST, PATCH, DELETE soft) with auth + validation
- v1 router aggregator mounting /workspaces and /products
- Full middleware stack wired in worker entry: request-id → logger → cors → rate-limiter → auth → routes
- Health endpoint upgraded with DB connectivity check (SELECT from workspaces LIMIT 1)

### Verification Results
- `pnpm build --force`: 6/6 PASS (0 errors)
- `pnpm type-check --force`: 9/9 PASS (0 errors)
- Cross-package imports (@viyo/db, @viyo/shared): All resolve
- .env.example: All required vars present
- Live: GET /health → 200 with degraded status (no DATABASE_URL)
- Live: GET / → 200 (public root)
- Live: GET /api/v1/products (no auth) → 401
- Live: GET /api/v1/workspaces (no auth) → 401
- Live: CORS preflight → 204 with correct headers
- Live: Rate limiter → 429 after 100 requests/minute
- Live: X-Request-Id header on all responses
- Live: Error handler → structured JSON with requestId
- Quality Gate 4 (Contamination): PASS on all 7 files
- No TODO/STUB/PLACEHOLDER markers in any T4 file
- Zod-Drizzle alignment audit: All API schemas match DB columns

### Issues Encountered
- Hono strict typing: `c.get('auth')` typed as `never` when Hono instance lacks explicit env type. Fixed by adding RouteEnv type to route files.
- Hono StatusCode type: `c.json(body, statusCode as StatusCode)` fails because StatusCode includes 101 (non-contentful). Fixed by using ContentfulStatusCode.
- Missing peer deps: zod and drizzle-orm needed as direct deps in worker (not just transitive via @viyo/shared and @viyo/db).
- Quality gate padding detector flags JSDoc comment markers (`/**`, `*/`) as repeated lines — false positive for TypeScript source code.

### Gaps Logged
- GAP-20260424-1500: DATABASE_URL not available via Supabase MCP (Non-Blocking)
- GAP-20260424-1501: SUPABASE_URL not set in sandbox (Non-Blocking)
- GAP-20260424-1502: Shared types drift — packages/shared/src/types/workspace.ts has slug/owner_id not in Drizzle schema (Non-Blocking, future task)
