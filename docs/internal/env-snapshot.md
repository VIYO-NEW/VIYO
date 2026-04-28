# Environment Snapshot

Complete snapshot of the VIYO development and deployment environment as of 2026-04-25.

## Runtime Versions

| Component | Version | Source |
|---|---|---|
| Node.js | 22.x (LTS) | `package.json` engines field |
| pnpm | 9.x | `packageManager` field |
| TypeScript | 5.7.3 | `tsconfig.base.json` |
| Turborepo | 2.x | `turbo.json` |

## Core Dependencies

| Package | Version | App | Purpose |
|---|---|---|---|
| `hono` | 4.7.5 | worker | HTTP framework |
| `drizzle-orm` | 0.45.2 | db | ORM (SQL-first) |
| `drizzle-kit` | 0.30.6 | db | Migration tooling |
| `@supabase/supabase-js` | 2.x | shared, web, admin | Auth + DB client |
| `inngest` | 3.x | worker | Durable event functions |
| `@sentry/node` | 10.50.0 | worker | Error monitoring (server) |
| `@sentry/opentelemetry` | 10.50.0 | worker | OTel bridge |
| `@sentry/react` | 10.50.0 | web, admin | Error monitoring (browser) |
| `@sentry/vite-plugin` | 3.x | web, admin (dev) | Source map upload |
| `@opentelemetry/sdk-node` | 0.57.2 | worker | Tracing |
| `zod` | 3.x | shared | Schema validation |
| `zustand` | 5.x | web, admin | State management |
| `react` | 19.x | web, admin | UI framework |
| `vite` | 6.4.2 | web, admin | Build tool (via override) |
| `vitest` | 2.1.9 | all | Test runner |
| `esbuild` | ~0.25.x | all (transitive) | JS bundler (via override) |

## pnpm Overrides (root package.json)

| Package | Override | Reason |
|---|---|---|
| `esbuild` | `~0.25.0` | CVE fix; 0.27.x breaks destructuring transforms |
| `vite` | `>=6.4.2` | CVE fix; forced from 5.4.21 |

## Monorepo Structure

| Package | Path | Type | Description |
|---|---|---|---|
| `viyo` | `/` | root | Monorepo root, Turborepo config, shared scripts |
| `@viyo/worker` | `apps/worker` | app | Hono API server, Inngest functions, OTel, Sentry |
| `@viyo/web` | `apps/web` | app | Vite + React SPA (customer-facing) |
| `@viyo/admin` | `apps/admin` | app | Vite + React SPA (admin portal) |
| `@viyo/db` | `packages/db` | package | Drizzle schema, migrations, DB client |
| `@viyo/shared` | `packages/shared` | package | Auth, config, events, schemas, security, types |
| `@viyo/ui` | `packages/ui` | package | Shared React components (Button, utils) |

## External Services

| Service | Purpose | Env Vars | Status |
|---|---|---|---|
| Supabase | Auth, PostgreSQL, RLS | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SUPABASE_JWT_SECRET` | Configured, not yet connected |
| Inngest | Durable event orchestration | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Configured, not yet connected |
| Sentry | Error monitoring, session replay | `SENTRY_DSN_WORKER`, `VITE_SENTRY_DSN_WEB`, `VITE_SENTRY_DSN_ADMIN`, `SENTRY_AUTH_TOKEN` | Projects created, DSNs wired |
| Render | Worker deployment (Docker) | Render dashboard | Blueprint configured (`render.yaml`), Dockerfile not yet created |
| Vercel | Web/Admin deployment | Vercel dashboard | Runbook created, not yet connected |
| Stripe | Billing, subscriptions | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Env vars defined, T9 not yet implemented |
| Cloudflare R2 | Asset storage | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Env vars defined, not yet implemented |
| Upstash Redis | Rate limiting, caching | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Env vars defined, not yet implemented |
| OpenTelemetry (OTLP) | Trace export | `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME` | Configured, exporter endpoint TBD |

## GitHub Repository

| Setting | Value |
|---|---|
| Org | VIYO-NEW |
| Repo | viyo-ai/VIYO |
| Branch | `main` (default) |
| Deploy keys | Enabled (org-level), SSH key with write access |
| Dependabot | Enabled (org default) |
| Secret scanning | Enabled (org default) |
| Push protection | Enabled (org default) |
| CI workflow | `.github/workflows/ci.yml` (lint, type-check, build, test) |
| Deploy workflow | `.github/workflows/deploy.yml` (CI → Render auto-deploy) |

## Sentry Projects

| Project | Platform | DSN Location |
|---|---|---|
| `node-hono` (viyo-worker) | Node.js / Hono | `SENTRY_DSN_WORKER` in `.env.example` |
| `viyo-web` | React | `VITE_SENTRY_DSN_WEB` in `.env.example` |
| `viyo-admin` | React | `VITE_SENTRY_DSN_ADMIN` in `.env.example` |

## Airtable Tracking

| Table | Base ID | Table ID | Purpose |
|---|---|---|---|
| VIYO Q&A Master Log | `appo5mNncCCzKcIRk` | `tblWr8n54Vb83egxR` | Question and approved solution log |
| Build Tracker | `appo5mNncCCzKcIRk` | `tblIJUzJoCCjWXaMQ` | Feature-level build status tracking |
| Skills Registry | `appo5mNncCCzKcIRk` | `tbl4gNd7bWjypMQBF` | All 80+ VIYO skills across phases |
| Services Inventory | `appo5mNncCCzKcIRk` | `tblcRL2RNys7SIiW5` | External service and API registry |

## 2026-04-28 — T46 Worker Runtime Environment Keys

Worker routing reads `ENABLE_ART_DIRECTOR_ROUTER`, `ART_DIRECTOR_CACHE_THRESHOLD`, `ART_DIRECTOR_PROVIDER_TIMEOUT_MS`, `GEMINI_EMBEDDING_MODEL`, `GOOGLE_AI_API_KEY`, `IDEOGRAM_API_KEY`, and `OPENAI_API_KEY`. The runtime `enable_art_director_router` system configuration remains the first rollback override, with env fallback only when the DB override is absent.
