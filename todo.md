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

## Main Coming Soon Site — 2026-05-02

- [x] Build `apps/main` as a minimal static Vite React app on the `staging` branch only.
- [x] Keep the page self-contained with no backend calls, no external fonts, and no CDN dependencies.
- [x] Validate local type-check/build for `@viyo/main` without redeploying or editing `apps/web` or `apps/admin`.
- [x] Commit and push staging-only changes for PO review.
- [x] Stop before production domain changes until explicit PO approval.

## Completed

- [x] T46 — Composite Art Director Routing Suite (T21, T22, T23) — DONE 2026-04-29
  - [x] Phase 5 source review completed against Phase 2 architecture plan and Phase 3 wiring blueprint
  - [x] Shared/worker build, lint, type-check, focused tests, monorepo lint/type-check/test/build passed
  - [x] Live local worker probe confirmed `/health` responds and unauthenticated `artDirector.routeGeneration` fails closed with HTTP 401
  - [x] Static source-invariant verifier passed final 13-layer wiring assertions
  - [x] Taskmaster T46 moved from `blocked` to `done` on 2026-04-29 after retroactive PO approval.
  - [x] Approval evidence recorded: "Retroactive PO approval granted 2026-04-29. Basis: T70 (PR #3) and T71 (PR #4) validated T46 foundation through architecture review, code review, and merged production code."

## Phase 6.2 Art Director Execution

- [x] Task #70: Cache-first Pattern DB route metadata transparency — DONE 2026-04-29
  - [x] Shared Art Director response contract exposes cache-first route source, Pattern DB cache status, score, threshold, candidate, and provenance metadata.
  - [x] Worker image router populates routing metadata from actual Pattern DB lookup, scoring, threshold, and rollback decisions.
  - [x] Image Studio displays cache-route and Pattern DB scoring transparency in canvas and latest-response panels.
  - [x] Focused worker route-generation and Image Studio tests passed; shared, worker, and web type-check/lint validation passed.
  - [x] Taskmaster Task 70 marked done; generative evidence-update command failed twice with provider schema mismatch, so status was completed via non-generative status command.
  - [x] Airtable sync repaired 2026-04-29: Build Tracker record `T70-CACHE-ROUTE-META` exists, is marked Done, and has `Taskmaster Task ID = T70`.
- [x] Task #71: Billing and token economics foundation — DONE 2026-04-29, PR #4 open
  - [x] Verified PO Condition 1: Visual Engine editing operations use editing-router contracts and flow through `artDirector.routeGeneration`; no separate editing execution endpoint was found.
  - [x] Verified PO Condition 2: insufficient-token metadata is propagated through tRPC formatted `data.apiError.details` and parsed by Studio frontend code.
  - [x] Backend Art Director routing now exposes billing reconciliation metadata, performs UX balance preflight metadata, and enforces atomic post-success token deduction.
  - [x] Image Studio now displays token estimate/current balance, opens canonical top-up recovery for insufficient balance, and renders final billing status/deducted token metadata.
  - [x] Validation gates passed: shared build, worker/web focused tests, worker/web lint, workspace type-check/test/lint/build, and `git diff --check`.
  - [x] Taskmaster Task 71 and all six subtasks marked done; Airtable Build Tracker T25/T26 notes synced conservatively without marking broader Studio flows done.
  - [x] Airtable sync repaired 2026-04-29: `T25-STUDIO-BACKEND` has `Taskmaster Task ID = T25, T46, T71`; `T26-STUDIO-FRONTEND` has `Taskmaster Task ID = T26, T71`; `P5-05` has `Taskmaster Task ID = T71`, status `In Progress`, and Task 71 / PR #4 advancement notes.

## Build Tracker Cross-Reference Repair

- [x] 2026-04-29 — Backfilled new Airtable `Taskmaster Task ID` field for verified completed/in-progress VIYO Build Tracker records touched by this build stream, including Phase 0 records, T7, EF-87, T10, T12, P5-01, T15, T24, T25, T26, T32, T46, P5-05, and T70.
- [x] 2026-04-29 — Created durable verification report at `docs/internal/build-tracker-cross-reference-repair-2026-04-29.md` and verified Airtable with a fresh post-update Build Tracker export.
- [ ] Future architecture plans must include a `Build Tracker Feature IDs` section listing the exact Airtable Feature IDs that the task will update before plan approval.

- [x] Task #72: T55 R2 Auto-Save and Brand Vault Asset Contract — DONE 2026-04-29
  - [x] Added `assets.brand_id` schema and migration support for Brand Vault asset ownership.
  - [x] Extracted and wired Studio generated-asset persistence through R2 and the assets table without changing Art Director routing decisions.
  - [x] Shared Art Director response contract now exposes `assetId`, `assetUrl`, `r2ObjectKey`, `savedToBrandVault`, and `persistenceStatus`.
  - [x] Image Studio surfaces honest persistence state and Brand Vault availability metadata.
  - [x] Validation passed: targeted Prettier, `pnpm type-check`, `pnpm lint`, `pnpm test`, and `pnpm build`.
  - [x] Taskmaster Task 72 and subtasks marked done; Airtable Build Tracker record `T32-AUTO-SAVE-VAULT` verified Done.

## Marketing App Rename — 2026-05-02

- [x] Confirm the renamed placeholder app exists at `apps/main` on the `staging` branch.
- [x] Update package and deployment references from marketing path/name to main path/name.
- [x] Validate the renamed `@viyo/main` app without touching existing apps.
- [x] Commit and push the rename to `origin/staging`.
- [x] Report the staging commit hash.
