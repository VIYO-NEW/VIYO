# Build Journal

Chronological build log. One entry per work session or task completion.

## 2026-04-24 — T1: Initialize Turborepo Monorepo Scaffold

- Initialized Turborepo monorepo with 3 apps (`worker`, `web`, `admin`) and 3 packages (`db`, `shared`, `ui`)
- Configured `pnpm-workspace.yaml` with workspace protocol
- Set up `turbo.json` with pipeline for `build`, `lint`, `type-check`, `test`
- Created `tsconfig.base.json` with strict TypeScript settings shared across all packages
- Worker: Hono v4 on Node.js. Web/Admin: Vite + React + TypeScript + TailwindCSS
- Packages: `@viyo/db` (Drizzle ORM), `@viyo/shared` (types, schemas, auth), `@viyo/ui` (component library)
- Files changed: `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, all `package.json` files, all `tsconfig.json` files
- Commit: `5bff633`
- Taskmaster: T1 completed

## 2026-04-24 — T2: Database Schema and Migrations

- Implemented full R20 database schema — 14 tables across 8 domain files
- Domains: identity (4 tables), products (2), email (2), LLM (1), image-intelligence (1), cost (1), RLHF (3), timer (1)
- Used Drizzle ORM `pgTable` definitions with full column types, constraints, and indexes
- Enabled `pgvector` extension for embedding columns (1536-dimension vectors)
- Added RLS-ready `workspace_id` foreign keys on all tenant-scoped tables
- Files changed: `packages/db/src/schema/*.ts`, `packages/db/src/index.ts`
- Commit: `c6d8240`
- Taskmaster: T2 completed

## 2026-04-24 — T3: Supabase Auth + Workspace-Scoped RLS

- Configured Supabase Auth client in `packages/shared/src/auth/supabase.ts`
- Implemented workspace-scoped RLS policies per R22 Section 3
- Created auth middleware for Hono worker (`apps/worker/src/middleware/auth.ts`)
- Added API key validation system (`packages/shared/src/auth/api-keys.ts`)
- Security refinements in follow-up commit: live-check utility, auth type exports
- Files changed: `packages/shared/src/auth/*.ts`, `apps/worker/src/middleware/auth.ts`
- Commits: `203de3d`, `2f39f9c`
- Taskmaster: T3 completed

## 2026-04-24 — T4: API Layer Foundation

- Built Hono middleware stack: request-id, rate-limiter, auth, Zod validation, error-handler
- Created v1 API routes: `/health`, `/v1/workspaces`, `/v1/products`, `/v1/credentials`
- Implemented `credential.service.ts` with vault-backed CRUD operations
- Added Zod request/response schemas in `packages/shared/src/schemas/`
- Live tested: health endpoint, middleware chain, error handling (see `t4-live-test-results.md`)
- Files changed: `apps/worker/src/` (routes, middleware, services), `packages/shared/src/schemas/`
- Commit: `4363f85`
- Taskmaster: T4 completed

## 2026-04-24 — T5: Inngest Event System + OpenTelemetry

- Configured Inngest client with event type definitions for workspace, campaign, and asset events
- Implemented workspace provisioning function as first durable function
- Set up OpenTelemetry NodeSDK with OTLP exporter, HTTP and Drizzle instrumentations
- Created `instrumentation.ts` as the OTel entry point (loaded before app starts)
- Defined typed event schemas in `packages/shared/src/events/`
- Live tested: OTel traces, Inngest function registration (see `t5-live-test-results.md`)
- Files changed: `apps/worker/src/inngest/`, `apps/worker/src/instrumentation.ts`, `packages/shared/src/events/`
- Commit: `f86b744`
- Taskmaster: T5 completed

## 2026-04-24 — T8: Credential Vault Service

- Implemented AES-256-GCM encryption with per-ciphertext random IV and auth tags
- Built dual-key rotation system: `VIYO_VAULT_KEY` (current) + `VIYO_VAULT_KEY_PREVIOUS` (old)
- Decrypt attempts current key first, falls back to previous key for seamless rotation
- Added `SENSITIVE_FIELD_PATTERNS` for scrubbing credentials from logs and error reports
- Created `key-rotation.ts` with `rotateKey()` and `needsReEncryption()` utilities
- Live tested: encrypt/decrypt cycle, key rotation, error handling (see `t8-live-test-results.md`)
- Files changed: `packages/shared/src/security/vault.ts`, `key-rotation.ts`, `index.ts`
- Commit: `250666b`
- Taskmaster: T8 completed

## 2026-04-24 — T6: CI/CD Deployment Pipeline

- Created GitHub Actions CI pipeline (`ci.yml`): lint, type-check, build, test on PR to main/staging
- Created deploy workflow (`deploy.yml`): triggers on push to main, calls CI first, then deploys
- Configured `render.yaml` blueprint for worker service (Docker, Oregon region, starter plan)
- Created deployment runbooks: `render-worker-setup.md`, `vercel-setup.md`
- Enabled SSH deploy keys at VIYO-NEW org level via GitHub API
- Added SSH deploy key to repo with write access (key ID: 149653390)
- Enabled org-level security defaults: Dependabot, secret scanning, push protection
- Files changed: `.github/workflows/ci.yml`, `deploy.yml`, `render.yaml`, `docs/runbooks/`
- Commits: `202847f`, `f16b4b9`
- Taskmaster: T6 completed

## 2026-04-25 — Security: Patch 5 Dependabot Vulnerabilities

- Upgraded `drizzle-orm` from 0.36.4 to 0.45.2 (3 HIGH SQL injection CVEs)
- Upgraded `vite` from 5.4.21 to 6.4.2 via pnpm overrides (1 MODERATE CVE)
- Upgraded `esbuild` from 0.21.5 to 0.25.12 via pnpm overrides (1 MODERATE CVE)
- Fixed lint error in `validate.ts` (changed `import { z }` to `import type { z }`)
- All 5 Dependabot alerts auto-resolved by GitHub after push
- Verification: type-check pass, build pass, lint pass (all 6 packages)
- Files changed: `package.json` (overrides), `pnpm-lock.yaml`, `apps/worker/src/middleware/validate.ts`
- Commit: `f50b0db`

## 2026-04-25 — T12: Sentry Error Monitoring Integration

- Installed `@sentry/node` + `@sentry/opentelemetry` for worker
- Installed `@sentry/react` + `@sentry/vite-plugin` for web and admin SPAs
- Created `sentry.ts` init files for all 3 apps with graceful degradation (no-op when DSN absent)
- Wired OTel bridge into existing NodeSDK via `SentrySpanProcessor`, `SentryPropagator`, `SentrySampler`
- Added `Sentry.ErrorBoundary` to both web and admin `App.tsx`
- Wired `captureToSentry()` into error-handler middleware for all 5xx errors
- Added `sentryVitePlugin` to web and admin `vite.config.ts` (production source map upload)
- Applied T8 vault `SENSITIVE_FIELD_PATTERNS` via `beforeSend` hooks (inlined for browser to avoid node:crypto barrel import)
- Created 3 Sentry projects: `node-hono` (worker), `viyo-web`, `viyo-admin`
- Generated auth token `viyo-ci-sourcemaps` for CI/CD source map uploads
- Wired 3 DSNs + 5 config vars into `.env.example`
- Session replay: 10% sample in production, 100% on error
- Verification: type-check pass, build pass, lint pass (9/9 packages)
- Files changed: `apps/worker/src/lib/sentry.ts`, `instrumentation.ts`, `middleware/error-handler.ts`, `apps/web/src/lib/sentry.ts`, `App.tsx`, `main.tsx`, `vite.config.ts`, `apps/admin/src/lib/sentry.ts`, `App.tsx`, `main.tsx`, `vite.config.ts`, `.env.example`
- Commits: `2faa22d`, `b15ddf4`
- Taskmaster: T12 completed

## 2026-04-27 — T15: Install TanStack Router in Web App

- Implemented the web router foundation with TanStack Router in `apps/web/src/router.tsx`.
- Wired `RouterProvider` through `apps/web/src/App.tsx` while preserving the existing Sentry error boundary.
- Created the route contracts for `/`, `/brand/$brandId/studio`, and the not-found fallback.
- Kept the Studio route as a boundary-only surface with no Studio module imports, generation tools, or premature UI implementation.
- Verified route behavior through production-build browser screenshots for home, Studio boundary, and not-found states.
- Verification: `pnpm test`, `pnpm type-check`, `pnpm lint`, `pnpm build`, bundle visualizer, route-contract semantic checks, and final headless browser validation completed.
- Phase 6 note: the generic quality-gate scripts remained non-React/TSX-aware after update; Product Owner approved the disclosed one-time exception based on passing engineering and semantic checks.
- Bundle review: Product Owner confirmed dependencies were expected and no Studio modules or generation tools were present.
- Tracking: Taskmaster T15 marked done; Airtable Build Tracker `T15-ROUTER` marked Done.

## 2026-04-28 — T45: Composite Database Foundation for T16–T20

- Implemented the approved schema-only database foundation for T16 through T20 under **VIYO Development Protocol v2 only**, without invoking the standalone post-build protocol.
- Added `packages/db/drizzle/0007_t45_composite_database_foundation.sql` with the minimal `brands` table approved by the Product Owner, the exact 11-value `comment_target_type` enum, `comments`, `webhook_endpoints`, `webhook_delivery_logs`, `notification_preferences`, `integration_connections`, RLS policies, indexes, updated-at triggers, and deterministic `image_prompt_patterns` backfill.
- Added Drizzle schema modules `collaboration.ts`, `webhooks.ts`, and `integrations.ts`; updated `image-intelligence.ts` with router-support columns; and exported all new schema modules through `packages/db/src/schema/index.ts`.
- Corrected the webhook event catalog to the exact 22 events from the T48 Webhook Pipeline architecture lock after the Phase 3 Product Owner ruling.
- Verification completed: package lint/test/type-check/build, repository lint/type-check/test/build, Drizzle non-destructive consistency check, focused static contract verifier, PostgreSQL parser validation, SQL padding/contamination gate, and bundle-budget evidence for web/admin apps.
- Tracking completed: Taskmaster T45 and underlying T16–T20 marked done, Airtable Build Tracker `T45-COMPOSITE-DB-FOUNDATION` marked Done, internal records updated, and stale T45 open-question status closed.
- Files changed: `.taskmaster/tasks/tasks.json`, `packages/db/drizzle/0007_t45_composite_database_foundation.sql`, `packages/db/src/schema/{collaboration,webhooks,integrations,image-intelligence,index}.ts`, and T45 internal planning/validation/completion records.
- Commit: pending Phase 9 finalization.
- Taskmaster: T16, T17, T18, T19, T20, and T45 completed.

## 2026-04-28 — T46 Phase 4 Implementation Started
- Phase 4 began after PO approval of the Phase 3 Global Wiring Blueprint.
- Scope: Composite Art Director Routing Suite covering corrected 4D scoring, cache-first routing, Gemini embeddings, explicit NanoBanana → Ideogram → DALL-E 3 provider tiers, minimal tRPC island, and deduct-after-success billing.
- Files started: `docs/internal/t46-phase4-incremental-record.md`.
- Protocol note: Internal records are being updated incrementally during Phase 4, not deferred to Phase 9.

## 2026-04-28 — T46 Shared Contract and Environment Wiring
- Implemented `packages/shared/src/schemas/art-director.ts` and exported it through `packages/shared/src/schemas/index.ts`.
- Extended `packages/shared/src/config/env.ts` with the T46 router rollback flag, cache threshold, timeout, explicit provider defaults, Gemini embedding model, and optional OpenAI emergency-fallback key.
- Validation: `pnpm --filter @viyo/shared type-check` passed.

## 2026-04-28 — T46 Phase 4 Worker Routing and tRPC Surface

Implemented the second T46 Phase 4 component group: worker router configuration, provider registry, Gemini embedding helper, image_prompt_patterns repository, corrected-score routing orchestrator, fallback prompt builder, structured routing logs, root tRPC router, Art Director routeGeneration procedure, and `/api/trpc/*` Hono mount. The mount sits after request ID, logging, CORS, rate limiting, and auth middleware. Validation: `pnpm --filter @viyo/shared build` and `pnpm --filter @viyo/worker type-check` passed.

## 2026-04-28 — T46 Phase 4 Focused Worker Tests

Added focused Vitest coverage for the Art Director routing suite after the worker routing island implementation. The test file validates provider precedence, rollback behavior, typography-aware provider selection, preferred-model routing, fallback prompt construction, and the corrected parenthesized scoring formula. Validation passed with `pnpm --filter @viyo/worker test -- src/lib/ai/art-director-routing.test.ts` and `pnpm --filter @viyo/worker type-check`.
