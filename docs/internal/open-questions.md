# Open Questions

Unresolved questions, spec gaps, and assumptions made during the build. Each entry is classified as Blocking (requires PO decision) or Non-Blocking (assumption made, logged for review).

## GAP-20260425-0001 — vitest 2.x + vite 6.x Compatibility

- **Phase discovered:** T12 (Dependabot patch)
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** pnpm overrides force vite 6.4.2, but vitest 2.1.9 officially supports only vite 5.x. Build and type-check pass, but test runner behavior is unverified (no test files exist yet).
- **Affected layers:** Build tooling, test infrastructure
- **Proposed plan:** Upgrade to vitest 3.x (which officially supports vite 6) when test files are written. Monitor for regressions.
- **Status:** OPEN

## GAP-20260425-0002 — esbuild ~0.25.0 Pin May Block Future Upgrades

- **Phase discovered:** Security patch (Dependabot)
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** esbuild is pinned to `~0.25.0` via pnpm overrides because 0.27.x breaks destructuring transforms. This pin prevents automatic minor version bumps.
- **Affected layers:** Build tooling
- **Proposed plan:** Remove the override when vitest ships with esbuild >= 0.25 natively, or when esbuild 0.27+ fixes the regression.
- **Status:** OPEN

## GAP-20260425-0003 — Inlined Sensitive Field Patterns in Browser Sentry

- **Phase discovered:** T12 Phase 4 (wiring verification)
- **Category:** Architecture
- **Blocking:** No
- **Description:** `SENSITIVE_FIELD_PATTERNS` are inlined in `apps/web/src/lib/sentry.ts` and `apps/admin/src/lib/sentry.ts` because importing from `@viyo/shared` pulls in `node:crypto` via barrel export. If patterns change in `vault.ts`, the browser files must be manually updated.
- **Affected layers:** Shared package, web app, admin app, security
- **Proposed plan:** Extract patterns into a separate `@viyo/shared/security/patterns.ts` file with no `node:crypto` dependency. This allows both Node.js and browser code to import from the same source.
- **Status:** OPEN

## GAP-20260425-0004 — No Dockerfile in Repository

- **Phase discovered:** T10 audit
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** `render.yaml` references `apps/worker/Dockerfile` but no Dockerfile exists in the repository. The Render deployment will fail without it.
- **Affected layers:** CI/CD, deployment
- **Proposed plan:** Create `apps/worker/Dockerfile` as part of deployment preparation (before first Render deploy). Should be a multi-stage Node.js build with pnpm.
- **Status:** OPEN

## GAP-20260425-0005 — Admin Config Panel Not Yet Built

- **Phase discovered:** T12 (Sentry DSN wiring)
- **Category:** UI/UX
- **Blocking:** No
- **Description:** Sentry DSNs, Stripe keys, R2 credentials, and other service configs are intended to be manageable via the Admin Config panel. The panel does not exist yet (T7 — Admin Portal Skeleton is pending).
- **Affected layers:** Admin app, configuration management
- **Proposed plan:** Wire config panel as part of T7 (Admin Portal Skeleton). All credentials currently managed via `.env.example` and deployment env vars.
- **Status:** OPEN

## GAP-20260425-0006 — No Test Files Exist

- **Phase discovered:** T10 audit
- **Category:** Infrastructure
- **Blocking:** No
- **Description:** `pnpm test` reports "no test files found" across all packages. No unit, integration, or e2e tests have been written yet. CI pipeline runs tests but they are effectively no-ops.
- **Affected layers:** All packages, CI/CD
- **Proposed plan:** Write foundational tests as part of each Phase 1+ feature task. Consider a dedicated test infrastructure task if test count remains zero after T7/T9.
- **Status:** OPEN
