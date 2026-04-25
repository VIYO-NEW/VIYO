# Knowledge Base Candidates

Items discovered during the build that should be promoted to the canonical VIYO knowledge base (maintained on Google Drive, pushed to GitHub). Each candidate includes the source, proposed destination, and rationale.

## KB-001: Drizzle ORM 0.36 → 0.45 Upgrade Notes

- **Source:** RES-001 in `research-log.md`
- **Proposed destination:** Doc4 (Technical Roadmap) — append to dependency management section
- **Content:** Drizzle ORM v1 (0.45.x) is backward-compatible for `pgTable` definitions and basic CRUD. Query builder syntax has breaking changes. `drizzle-kit` must be updated to 0.30.x for compatibility.
- **Rationale:** Future developers upgrading Drizzle should know the safe upgrade path.
- **Status:** PENDING PO REVIEW

## KB-002: esbuild Version Pinning Strategy

- **Source:** RES-002 in `research-log.md`, DEC-009 in `decision-log.md`
- **Proposed destination:** R21 (Infrastructure) — add to build tooling section
- **Content:** esbuild 0.27.x introduces destructuring transform regressions when used as a transitive dependency via Vite. Pin to `~0.25.0` via pnpm overrides until vitest ships with compatible esbuild.
- **Rationale:** Prevents future developers from removing the override and breaking the build.
- **Status:** PENDING PO REVIEW

## KB-003: Sentry OTel Bridge Pattern

- **Source:** RES-003 in `research-log.md`, DEC-008 in `decision-log.md`
- **Proposed destination:** R21 (Infrastructure) — add to monitoring section
- **Content:** Sentry integrates with existing OTel via `@sentry/opentelemetry`. Initialize Sentry with `skipOpenTelemetrySetup: true`, then wire `SentrySpanProcessor`, `SentryPropagator`, and `SentrySampler` into the NodeSDK. This forwards traces without replacing OTel.
- **Rationale:** Documents the architectural pattern for anyone modifying the observability stack.
- **Status:** PENDING PO REVIEW

## KB-004: GitHub Push Protection Blocks Sentry Auth Tokens

- **Source:** RES-005 in `research-log.md`
- **Proposed destination:** Doc11 (Security Architecture) — add to secrets management section
- **Content:** GitHub secret scanning detects Sentry auth tokens (`sntrys_*` pattern) and blocks pushes. Sentry DSNs are safe to commit (public identifiers). Auth tokens must be stored only in CI/CD secrets (GitHub Actions secrets, Render env vars).
- **Rationale:** Prevents future developers from accidentally committing auth tokens.
- **Status:** PENDING PO REVIEW

## KB-005: Barrel Import Contamination Pattern

- **Source:** DEC-010 in `decision-log.md`, GAP-20260425-0003 in `open-questions.md`
- **Proposed destination:** Doc9 (Frontend Architecture) — add to import patterns section
- **Content:** Importing from `@viyo/shared` barrel (`index.ts`) in browser code can pull in Node.js-only modules (e.g., `node:crypto` via `vault.ts`). Browser code must either import from specific subpaths or inline the needed values. Long-term fix: split Node-only exports into separate entry points.
- **Rationale:** This is a recurring pattern in monorepos with shared packages. Documenting it prevents future barrel import bugs.
- **Status:** PENDING PO REVIEW

## KB-006: Missing Dockerfile for Render Deployment

- **Source:** GAP-20260425-0004 in `open-questions.md`
- **Proposed destination:** R21 (Infrastructure) — deployment section
- **Content:** `render.yaml` references `apps/worker/Dockerfile` which must be created before first Render deployment. Should be a multi-stage Node.js 22 build with pnpm, targeting the `apps/worker` package in the monorepo.
- **Rationale:** Deployment will fail without this file. Should be documented as a pre-deployment checklist item.
- **Status:** PENDING PO REVIEW
