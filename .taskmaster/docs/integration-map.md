# VIYO Integration Map

## External Service Integrations

| Service | Env Vars | Integrated In | Status |
|:---|:---|:---|:---|
| Supabase (DB) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` | T2 | Active — 15 tables, migrations via MCP |
| Supabase (Auth) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` | T3 | Active — Magic Link, JWT, RLS |
| Inngest (Events) | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | T5 | Planned |
| Stripe (Billing) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | T9 | Planned |
| Upstash Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | T4 | Planned |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Phase 2+ | Planned |
| Google AI (Gemini) | `GOOGLE_AI_API_KEY` | Phase 2+ | Planned |
| Ideogram | `IDEOGRAM_API_KEY` | Phase 2+ | Planned |

## Internal Package Wiring

| From | To | Method | Status |
|:---|:---|:---|:---|
| `apps/web` | `@viyo/shared` | TypeScript import (types, auth, security) | Wired (T1, T3) |
| `apps/web` | `@viyo/ui` | TypeScript import + Tailwind preset | Wired (T1) |
| `apps/admin` | `@viyo/shared` | TypeScript import (types, auth, security) | Wired (T1, T3) |
| `apps/admin` | `@viyo/ui` | TypeScript import + Tailwind preset | Wired (T1) |
| `apps/worker` | `@viyo/shared` | TypeScript import (auth, config, schemas) | Wired (T3, T4) |
| `apps/worker` | `@viyo/db` | TypeScript import (table schemas for queries) | Wired (T4) |
| `apps/worker` | `zod` | Validation middleware typing | Wired (T4) |
| `apps/worker` | `drizzle-orm` | Query operators (eq, and, sql) | Wired (T4) |

## Auth Flow Wiring (T3)

| Step | Component | Connection | Method |
|:---|:---|:---|:---|
| 1 | Browser → Supabase Auth | Magic Link OTP | `supabase.auth.signInWithOtp()` |
| 2 | Supabase Auth → auth.users | User creation | Supabase internal |
| 3 | auth.users → handle_new_user() | Trigger | PostgreSQL AFTER INSERT trigger |
| 4 | handle_new_user() → public.users | Profile creation | INSERT with COALESCE for nulls |
| 5 | handle_new_user() → workspaces | Auto-create personal workspace | INSERT |
| 6 | handle_new_user() → workspace_members | Auto-assign owner role | INSERT |
| 7 | Browser → Worker API | JWT in Authorization header | `Bearer <access_token>` |
| 8 | Worker → Supabase Auth | JWT verification | `supabase.auth.getUser()` |
| 9 | Worker → workspace_members | Resolve workspace context | service_role SELECT |
| 10 | RLS → check_workspace_access() | Tenant isolation | SQL function called by every RLS policy |

## API Middleware Stack (T4)

| Order | Middleware | File | Purpose |
|:---:|:---|:---|:---|
| 1 | request-id | `apps/worker/src/middleware/request-id.ts` | Attach UUID to every request for tracing |
| 2 | logger | `hono/logger` (built-in) | HTTP request/response logging |
| 3 | cors | `hono/cors` (built-in) | CORS for localhost:5173, localhost:5174, app.viyo.new, admin.viyo.new |
| 4 | rate-limiter | `apps/worker/src/middleware/rate-limiter.ts` | 100 req/min per IP on /api/* paths |
| 5 | auth | `apps/worker/src/middleware/auth.ts` | JWT + API key dual strategy, skips /health and / |
| — | error-handler | `apps/worker/src/middleware/error-handler.ts` | Global onError + notFound handlers |

## API Route Map (T4)

| Method | Path | Handler | Auth Required | Validation |
|:---|:---|:---|:---|:---|
| GET | `/health` | health.ts | No | — |
| GET | `/` | index.ts | No | — |
| GET | `/api/v1/workspaces` | workspaces.ts | Yes | — |
| POST | `/api/v1/workspaces` | workspaces.ts | Yes | createWorkspaceSchema |
| PATCH | `/api/v1/workspaces/:id` | workspaces.ts | Yes (owner/admin) | updateWorkspaceSchema |
| GET | `/api/v1/products` | products.ts | Yes | listProductsQuerySchema |
| GET | `/api/v1/products/:id` | products.ts | Yes | productParamsSchema |
| POST | `/api/v1/products` | products.ts | Yes | createProductSchema |
| PATCH | `/api/v1/products/:id` | products.ts | Yes | updateProductSchema + productParamsSchema |
| DELETE | `/api/v1/products/:id` | products.ts | Yes | productParamsSchema |
