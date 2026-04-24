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
| `apps/worker` | `@viyo/shared` | TypeScript import (auth middleware) | Wired (T3) |
| `apps/worker` | `@viyo/db` | Planned (T4) | Not yet |

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
