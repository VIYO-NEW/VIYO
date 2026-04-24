# VIYO Source Map

## Monorepo Structure (T1)

| Path | Package | Purpose | Key Exports |
|:---|:---|:---|:---|
| `apps/web` | `@viyo/web` | Vite React SPA (app.viyo.new) | — |
| `apps/worker` | `@viyo/worker` | Hono API server (api.viyo.new) | Health route |
| `apps/admin` | `@viyo/admin` | Admin portal (admin.viyo.new) | — |
| `packages/shared` | `@viyo/shared` | TypeScript types, auth, security | `Workspace`, `Brand`, `WorkspaceMember`, `AuthContext`, `ApiKeyPayload`, `createBrowserClient`, `createServerClient`, `createServiceRoleClient`, `generateApiKey`, `verifyApiKey`, `encrypt`, `decrypt` |
| `packages/db` | `@viyo/db` | Drizzle ORM schema, migrations | All 15 table schemas (14 + workspace_members) + `createDbClient` |
| `packages/ui` | `@viyo/ui` | React components, Tailwind preset | `Button`, `cn()`, tailwind-preset |

## Database Schema (T2)

| File | Tables | Domain | Authority |
|:---|:---|:---|:---|
| `packages/db/src/schema/identity.ts` | workspaces, users, apiKeys, workspaceMembers | Identity | R20 §2, R22 |
| `packages/db/src/schema/products.ts` | viyoProducts, assets | Products | R20 §2, R31 |
| `packages/db/src/schema/image-intelligence.ts` | imagePromptPatterns | Image Intelligence | R20 §2, R24 |
| `packages/db/src/schema/email.ts` | emailTemplates, espConnections | Email | R20 §2, R27 |
| `packages/db/src/schema/cost.ts` | tokenUsageLogs | Cost Tracking | R20 §2, R23 |
| `packages/db/src/schema/llm.ts` | councilDecisions | LLM Council | R20 §2, R19 |
| `packages/db/src/schema/timer.ts` | timerDefinitions | Timer Service | R20 §2, R28 |
| `packages/db/src/schema/rlhf.ts` | rlhfVotes, preferenceModelVersions, patternPerformanceMetrics | RLHF | R20 §2, R24 |

## SQL Migrations (T2)

| File | Purpose |
|:---|:---|
| `packages/db/drizzle/0001_extensions.sql` | pgvector, uuid-ossp, pg_stat_statements |
| `packages/db/drizzle/0002_tables.sql` | 14 tables + RLS policies |
| `packages/db/drizzle/0003_functions.sql` | match_image_patterns RPC + updated_at triggers |
| `packages/db/drizzle/0004_auth_workspace_members.sql` | workspace_members table, check_workspace_access(), handle_new_user() trigger, upgraded RLS |

## Cross-Package Import Map

| Consumer | Imports From | What |
|:---|:---|:---|
| `apps/web` | `@viyo/shared` | `Workspace` type |
| `apps/web` | `@viyo/ui` | `Button` component |
| `apps/web` | `@viyo/ui/tailwind-preset` | Tailwind config preset |
| `apps/admin` | `@viyo/shared` | `Workspace` type |
| `apps/admin` | `@viyo/ui` | `Button` component |
| `apps/admin` | `@viyo/ui/tailwind-preset` | Tailwind config preset |
| `packages/db` | `drizzle-orm` | Schema definitions, pgTable, customType |
| `packages/db` | `drizzle-orm/pg-core` | Column types, indexes |

## Auth System (T3)

| File | Purpose | Authority |
|:---|:---|:---|
| `packages/shared/src/auth/types.ts` | AuthContext, ApiKeyPayload, WorkspaceMemberRole types | R22 §2, §3 |
| `packages/shared/src/auth/supabase.ts` | Supabase client factory (browser, server, service_role) | R22 §2.2 |
| `packages/shared/src/auth/api-keys.ts` | API key generation (viyo_live_ prefix), SHA-256 hashing, verification | R22 §3 |
| `packages/shared/src/security/vault.ts` | AES-256-GCM encrypt/decrypt for ESP credentials | R22 §4 |
| `apps/worker/src/middleware/auth.ts` | Hono auth middleware: JWT + API key dual strategy | R22 §2, §3 |
| `apps/web/src/lib/supabase.ts` | Browser Supabase client singleton | R22 §2.2 |
| `apps/web/src/stores/auth.ts` | Zustand auth store (Magic Link, signOut, onAuthStateChange) | R22 §2.1 |
| `apps/admin/src/lib/supabase.ts` | Admin browser Supabase client singleton | R22 §2.2 |
| `apps/admin/src/stores/auth.ts` | Admin Zustand auth store | R22 §2.1 |

## API Layer Foundation (T4)

| File | Purpose | Authority |
|:---|:---|:---|
| `packages/shared/src/config/env.ts` | Zod env validation: getWorkerEnv(), getClientEnv(), fail-fast at boot | R18, ARCH_LOCK_V3 §3 |
| `packages/shared/src/config/index.ts` | Config barrel export | — |
| `packages/shared/src/schemas/workspace.ts` | Zod API schemas: createWorkspaceSchema, updateWorkspaceSchema, listWorkspacesQuerySchema | R18, R20 |
| `packages/shared/src/schemas/product.ts` | Zod API schemas: createProductSchema, updateProductSchema, listProductsQuerySchema, productParamsSchema | R18, R20, R31 |
| `packages/shared/src/schemas/index.ts` | Schemas barrel export | — |
| `apps/worker/src/middleware/request-id.ts` | UUID request tracing, X-Request-Id header | R18 §7, R21 |
| `apps/worker/src/middleware/error-handler.ts` | ApiError class, errorHandler, notFoundHandler — structured JSON errors with requestId | R18 §7, R21 |
| `apps/worker/src/middleware/rate-limiter.ts` | In-memory sliding window rate limiter (100 req/min), Upstash-ready | R21 §3, R19 |
| `apps/worker/src/middleware/validate.ts` | Zod validation middleware factory: validateBody, validateQuery, validateParams | R18 §7 |
| `apps/worker/src/lib/db.ts` | Drizzle DB singleton, graceful null fallback when DATABASE_URL not set | ARCH_LOCK_V3 §4, R20 |
| `apps/worker/src/routes/health.ts` | Health check with DB connectivity probe (SELECT from workspaces LIMIT 1) | R18 |
| `apps/worker/src/routes/v1/workspaces.ts` | Workspace CRUD routes: GET, POST, PATCH with RouteEnv typing | R18, R20, R22 |
| `apps/worker/src/routes/v1/products.ts` | Product CRUD routes: GET list, GET by ID, POST, PATCH, DELETE (soft) with RouteEnv typing | R18, R20, R31 |
| `apps/worker/src/routes/v1/index.ts` | v1 router aggregator: mounts /workspaces and /products | R18 |

### T4 Cross-Package Imports

| Consumer | Imports From | What |
|:---|:---|:---|
| `apps/worker` | `@viyo/db` | `workspaces`, `viyoProducts` table schemas |
| `apps/worker` | `@viyo/shared` | `createWorkspaceSchema`, `updateWorkspaceSchema`, `createProductSchema`, `updateProductSchema`, `listProductsQuerySchema`, `productParamsSchema`, `AuthContext` |
| `apps/worker` | `drizzle-orm` | `eq`, `and`, `sql` query operators |
| `apps/worker` | `zod` | `z` for validation middleware typing |
