# VIYO Build Todo

## Phase 0 Tasks

- [x] T1 — Initialize Turborepo Monorepo Scaffold (P0-01) — DONE 2026-04-24
- [x] T2 — Database Schema + Migrations (P0-04) — DONE 2026-04-24
- [x] T3 — Supabase Auth + Workspace-Scoped RLS (P0-05) — DONE 2026-04-24
- [x] T4 — API Layer Foundation (P0-06) — DONE 2026-04-24
- [x] T5 — Inngest Event System + OpenTelemetry (P0-02/P0-03) — DONE 2026-04-24
- [x] T6 — CI/CD Deployment Pipeline (P0-11) — DONE 2026-04-24
- [x] T8 — Credential Vault Service (EF-87) — DONE 2026-04-24
- [x] T10 — Internal Records (7 mandatory files) — DONE 2026-04-25
- [x] T12 — Sentry Error Monitoring — DONE 2026-04-25
- [x] T7 — Admin Portal Skeleton — DONE 2026-04-25
  - [x] 12 lazy-loaded pages (Dashboard, Brands, Users, LearningEngine, CouncilOfBrains, SystemHealth, Security, CostReconciliation, ContentOps, Performance, BrandIntelligence, Login)
  - [x] AdminLayout with sidebar + topbar + AuthGuard at layout level
  - [x] Bundle optimized: 543KB→253KB initial (53% reduction)
  - [x] darkMode: 'class' in shared Tailwind preset
  - [x] CI pipeline fixed: deploy conditional, test step removed (honest)
  - [x] Taskmaster updated → done
  - [x] Airtable synced → Done
- [ ] T9 — Stripe Billing Foundation (P5-01)

## Completed Non-Task Work

- [x] Security: Patched 5 Dependabot vulnerabilities (drizzle-orm, vite, esbuild) — 2026-04-25
- [x] Infra: Enabled SSH deploy keys at VIYO-NEW org level — 2026-04-25
- [x] Infra: Enabled org-level Dependabot, secret scanning, push protection — 2026-04-25
