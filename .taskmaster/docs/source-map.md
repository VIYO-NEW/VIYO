# VIYO Source Map

## Monorepo Structure (T1)

| Path | Package | Purpose | Key Exports |
|:---|:---|:---|:---|
| `apps/web` | `@viyo/web` | Vite React SPA (app.viyo.new) | — |
| `apps/worker` | `@viyo/worker` | Hono API server (api.viyo.new) | Health route |
| `apps/admin` | `@viyo/admin` | Admin portal (admin.viyo.new) | — |
| `packages/shared` | `@viyo/shared` | TypeScript types, Zod schemas | `Workspace`, `Brand`, `WorkspaceMember` |
| `packages/db` | `@viyo/db` | Drizzle ORM schema, migrations | All 14 table schemas + `createDbClient` |
| `packages/ui` | `@viyo/ui` | React components, Tailwind preset | `Button`, `cn()`, tailwind-preset |

## Database Schema (T2)

| File | Tables | Domain | Authority |
|:---|:---|:---|:---|
| `packages/db/src/schema/identity.ts` | workspaces, users, apiKeys | Identity | R20 §2, R22 |
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
