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
- [x] T9 — Stripe Billing Foundation (P5-01) — DONE 2026-04-27
  - [x] Token Engine: dual-write pattern (R23 usage_ledger → T9 token_ledger)
  - [x] atomic_token_deduction RPC with FOR UPDATE row locking
  - [x] 7 Stripe webhook handlers with idempotency (stripe_webhook_events table)
  - [x] 19 billing API endpoints + 6 admin economics endpoints
  - [x] 4 Inngest functions (auto-top-up, free renewal, workspace hard delete, dunning)
  - [x] Frontend: PricingPage, BillingSettings, TokenBalanceHeader, QuickTopUpModal, InsufficientTokensModal
  - [x] Admin: Billing Economics Control Panel (margin health, provider registry, multiplier, promos)
  - [x] Workspace deletion flow (§17): Stripe cancel, 30-day soft delete, GDPR purge
  - [x] Annual/Monthly switch (§18): Subscription Schedules for deferred changes
  - [x] Dunning freeze: separate checkBillingStatus() pre-check → 402 BILLING_FROZEN

- [x] T15 — Install TanStack Router in Web App (T15-ROUTER) — DONE 2026-04-27
  - [x] Added TanStack Router provider wiring in `apps/web/src/App.tsx`
  - [x] Added typed route tree in `apps/web/src/router.tsx`
  - [x] Implemented `/`, `/brand/$brandId/studio`, and not-found route contracts
  - [x] Preserved Studio route as an integration boundary with no Studio module imports
  - [x] Verified type-check, lint, tests, production build, bundle budget, and headless browser routes
  - [x] Taskmaster updated → done
  - [x] Airtable synced → Done

## Completed Non-Task Work

- [x] Security: Patched 5 Dependabot vulnerabilities (drizzle-orm, vite, esbuild) — 2026-04-25
- [x] Infra: Enabled SSH deploy keys at VIYO-NEW org level — 2026-04-25
- [x] Infra: Enabled org-level Dependabot, secret scanning, push protection — 2026-04-25

- [x] T45 — Composite Database Foundation for T16–T20 — DONE 2026-04-28
  - [x] T16 comments database foundation completed via T45
  - [x] T17 webhook endpoints and delivery logs database foundation completed via T45
  - [x] T18 notification preferences database foundation completed via T45
  - [x] T19 integration connections database foundation completed via T45
  - [x] T20 image prompt pattern router-support columns and deterministic backfill completed via T45
  - [x] Product Owner approved Phase 2 architecture plan, Option A `brands` foundation, Phase 3 wiring correction, and Phase 8 deploy gate
  - [x] Verified static contract checks, SQL parser validation, package/workspace lint, type-check, tests, build, quality gate, and bundle-budget evidence
  - [x] Taskmaster updated → T16, T17, T18, T19, T20, and T45 done
  - [x] Airtable synced → Done

## In Review

- [ ] T46 — Composite Art Director Routing Suite (T21, T22, T23) — PHASE 5 REVIEW GATE 2026-04-28
  - [x] Phase 5 source review completed against Phase 2 architecture plan and Phase 3 wiring blueprint
  - [x] Shared/worker build, lint, type-check, focused tests, monorepo lint/type-check/test/build passed
  - [x] Live local worker probe confirmed `/health` responds and unauthenticated `artDirector.routeGeneration` fails closed with HTTP 401
  - [x] Static source-invariant verifier passed final 13-layer wiring assertions
  - [x] Taskmaster T46 moved to `review`; wiring subtasks remain done as validation evidence
  - [ ] Awaiting explicit PO approval before Phase 6, final T46 closeout, T47, or T48 begins
