# VIYO Integration Map

## Current Integrations (T1 Scaffold)

No external service integrations are active at the scaffold stage. The following are planned and have environment variable slots reserved in `.env.example`:

| Service | Env Vars | Integrated In | Status |
|:---|:---|:---|:---|
| Supabase (DB + Auth) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SUPABASE_JWT_SECRET` | T2, T3 | Planned |
| Inngest (Events) | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | T5 | Planned |
| Stripe (Billing) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | T9 | Planned |
| Upstash Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | T4 | Planned |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Phase 2+ | Planned |
| Google AI (Gemini) | `GOOGLE_AI_API_KEY` | Phase 2+ | Planned |
| Ideogram | `IDEOGRAM_API_KEY` | Phase 2+ | Planned |

## Internal Package Wiring

| From | To | Method | Status |
|:---|:---|:---|:---|
| `apps/web` | `packages/shared` | TypeScript import | Wired |
| `apps/web` | `packages/ui` | TypeScript import + Tailwind preset | Wired |
| `apps/admin` | `packages/shared` | TypeScript import | Wired |
| `apps/admin` | `packages/ui` | TypeScript import + Tailwind preset | Wired |
| `apps/worker` | `packages/shared` | Planned (T4) | Not yet |
| `apps/worker` | `packages/db` | Planned (T2) | Not yet |
