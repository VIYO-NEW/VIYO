# VIYO Decision Log

## ADR-001: Workspaces as Primary Tenant Entity

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: Doc1 uses "brands", R20 uses "workspaces"

The Product Owner ruled that **workspaces** are the primary tenant entity per R20. Brands are children of workspaces. All RLS policies, foreign keys, and type definitions use `workspace_id` as the scoping key.

## ADR-002: Vite React SPA with TanStack Router and Zustand

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: ARCH_LOCK_V3 specifies Vite React SPA

The frontend stack is Vite + React + TanStack Router + Zustand + Tailwind CSS, per Doc1 and ARCH_LOCK_V3 Section 2. No Next.js, no SSR.

## ADR-003: Doc1 + R20 as Architectural Authority

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: VIYO_ARCHITECTURE_LOCK_V3.md was missing at time of decision

The PO directed to proceed with Doc1 (Master PRD) and R20 (Database Schema Lock) as the combined architectural authority. ARCH_LOCK_V3 was subsequently found and downloaded, and now serves as the #2 authority document.

## ADR-004: ESLint Flat Config with TypeScript-ESLint

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No spec prescribes ESLint rules

Used `@eslint/js` + `typescript-eslint` recommended rules with ESLint 10 flat config. Added `consistent-type-imports` enforcement. No spec gap — this is a tooling decision within the scaffold scope.

## ADR-005: Node 22 LTS

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No spec prescribes Node version

Pinned Node 22 LTS in `.nvmrc` and `package.json engines`. This is the current LTS release and matches Render's supported Node versions.

## ADR-006: 14 Explicit R20 Tables Only (Not 83)

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: R20 header says "83 tables across 14 domains" but only 14 tables are explicitly defined

R20 defines 14 tables with full DDL. The "83 tables" figure appears to be a projection of the full enterprise schema. The PO approved implementing only the 14 explicitly defined tables in T2, with additional tables (brands, workspace_members, credit_ledger, etc.) to be added in their respective tasks.

## ADR-007: Migration Ordering — Tables Before RLS

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: Circular dependency between workspaces RLS and users table

The initial migration had RLS policies inline with CREATE TABLE statements. The workspaces RLS policy references `public.users` which does not exist until later in the migration. Resolved by splitting into two phases within the same migration: all CREATE TABLE statements first, then all ALTER TABLE ENABLE ROW LEVEL SECURITY and CREATE POLICY statements second.

## ADR-008: Supabase MCP for Migration Application

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No direct DATABASE_URL available

Migrations are applied via the Supabase MCP `apply_migration` tool rather than Drizzle's `drizzle-kit push` command, because the Supabase access token provides management API access but not a direct PostgreSQL connection string. The Drizzle schema files serve as the TypeScript source of truth; the SQL migrations are the deployment artifacts.

## ADR-009: workspace_members Table Created in T3

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: R22 requires workspace-scoped auth but R20 does not define workspace_members

The workspace_members table was created in T3 (Auth task) rather than T2 (Schema task) because R20 does not define it. This table is required for the `check_workspace_access()` function and all tenant-scoped RLS policies. Schema: id (UUID PK), workspace_id (FK → workspaces), user_id (FK → auth.users), role (owner/admin/member/viewer), invited_by, invited_at, created_at, updated_at.

## ADR-010: check_workspace_access() Function for RLS

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: PO directive to use function-based approach for RLS maintainability

All 9 tenant-scoped table RLS policies use `check_workspace_access(workspace_id)` instead of inline subqueries. This function checks if `auth.uid()` has a row in `workspace_members` for the given workspace_id. Single point of change if access logic evolves. PO explicitly approved this approach as "most maintainable."

## ADR-011: handle_new_user() Trigger with Partial Signup Handling

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: PO directive for robust profiles trigger handling edge cases

The trigger function handles: (1) COALESCE for null email from partial signups, (2) COALESCE for null display_name falling back to email prefix, (3) ON CONFLICT DO NOTHING for duplicate user IDs, (4) EXCEPTION block that logs errors but does not block auth.users INSERT. Auto-creates a personal workspace and workspace_members entry for every new user.

## ADR-012: Auth Middleware as Plain Function (Not createMiddleware Generic)

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: Hono's createMiddleware<> caused circular type inference

Using `async function authMiddleware(c: Context, next: Next)` instead of `createMiddleware<AuthEnv>()` to avoid TypeScript circular type inference errors. The AuthEnv interface is exported for route handlers to use with `c.get('auth')`.

## ADR-013: In-Memory Rate Limiter with Upstash Upgrade Path

**Date**: 2026-04-24 | **Status**: Approved | **Context**: T4 API Layer needs rate limiting before Upstash Redis is provisioned (P0-15)

The rate limiter uses an in-memory sliding window (Map keyed by IP) for Phase 0 development. The interface is designed so that swapping to Upstash Redis requires only changing the store backend, not the middleware signature. Default: 100 requests per 60 seconds per IP. Cleanup runs every 5 minutes.

## ADR-014: Drizzle DB Singleton with Graceful Null Fallback

**Date**: 2026-04-24 | **Status**: Approved | **Context**: DATABASE_URL not available in all environments (GAP-20260424-1500)

The `getDb()` function returns `null` when DATABASE_URL is not configured, allowing the worker to boot and serve non-DB endpoints (health, auth rejection). DB-dependent routes check for null and return 503 with a clear error message. This prevents hard crashes in environments without database access.

## ADR-015: Health Endpoint with DB Connectivity Probe

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: PO directed health endpoint to verify DB connection is alive

The `/health` endpoint performs `db.select({id: workspaces.id}).from(workspaces).limit(1)` to verify the database connection pool is alive. Response includes `status: "ok" | "degraded"` and `checks.database` with `connected`, `latencyMs`, and `error` fields. When DATABASE_URL is not set, returns `"degraded"` with a descriptive error.

## ADR-016: Zod API Schemas Separate from Drizzle DB Schemas

**Date**: 2026-04-24 | **Status**: Approved | **Context**: API request validation needs different shapes than DB columns

Zod API schemas (in `packages/shared/src/schemas/`) define what the client sends in request bodies and query params. They are intentionally different from Drizzle table definitions: they omit server-generated fields (id, createdAt, updatedAt, workspaceId), include convenience fields (slug for workspace create), and use string types for numeric DB columns (price). The Drizzle schema remains the single source of truth for DB structure.
