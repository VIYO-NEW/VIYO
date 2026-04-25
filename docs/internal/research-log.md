# Research Log

Every external research item performed during the build, with structured metadata.

## RES-001: Drizzle ORM 0.36 to 0.45 Upgrade Path

- **Date:** 2026-04-25
- **Question:** Does upgrading drizzle-orm from 0.36.4 to 0.45.2 introduce breaking changes that affect our schema definitions?
- **Source:** https://orm.drizzle.team/docs/upgrade-v1
- **Answer:** Drizzle 0.45 (v1 release) introduces breaking changes in query builder syntax and some type exports. However, `pgTable` definitions, column types, and migration patterns remain backward-compatible. Our usage (schema definitions + basic CRUD) is unaffected.
- **Confidence:** High (official upgrade guide + verified by type-check and build)
- **Impact:** No code changes required beyond the version bump. `drizzle-kit` updated to 0.30.6 for compatibility.
- **KB Candidate:** Yes — logged to kb-candidates.md

## RES-002: esbuild 0.27 Destructuring Transform Regression

- **Date:** 2026-04-25
- **Question:** Why does esbuild 0.27.7 break the Vite build with "destructuring" errors?
- **Source:** https://github.com/evanw/esbuild/releases (changelog review)
- **Answer:** esbuild 0.27.x changed the default behavior of destructuring transforms for newer ES targets. When used as a transitive dependency via Vite/vitest, this causes build failures in certain patterns. Pinning to `~0.25.0` resolves the vulnerability (CVE patched in 0.25.0) without the regression.
- **Confidence:** High (reproduced in sandbox, confirmed fix by pinning)
- **Impact:** `pnpm.overrides` pins esbuild to `~0.25.0`. Must revisit when vitest ships with esbuild >= 0.25 natively.
- **KB Candidate:** Yes — logged to kb-candidates.md

## RES-003: Sentry OTel Bridge Integration Pattern

- **Date:** 2026-04-25
- **Question:** How to connect Sentry error monitoring to an existing OpenTelemetry NodeSDK setup without replacing OTel?
- **Source:** https://docs.sentry.io/platforms/javascript/guides/node/tracing/instrumentation/opentelemetry/
- **Answer:** Use `@sentry/opentelemetry` package. Initialize Sentry with `skipOpenTelemetrySetup: true`, then wire `SentrySpanProcessor`, `SentryPropagator`, and `SentrySampler` into the existing NodeSDK configuration. This forwards OTel traces to Sentry without Sentry replacing or duplicating the OTel setup.
- **Confidence:** High (official Sentry docs + verified in build)
- **Impact:** `instrumentation.ts` updated to include Sentry bridge components alongside existing OTel configuration.
- **KB Candidate:** Yes — logged to kb-candidates.md

## RES-004: Sentry React ErrorBoundary FallbackRender Signature

- **Date:** 2026-04-25
- **Question:** What is the correct TypeScript signature for Sentry's `ErrorBoundary` `fallback` prop?
- **Source:** https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/
- **Answer:** The `fallback` prop accepts a `FallbackRender` function with signature `({ error, componentStack, resetError }) => ReactNode`. The `error` parameter is typed as `unknown` (not `Error`), requiring a type guard before accessing `.message`.
- **Confidence:** High (verified by type-check after fixing)
- **Impact:** Both `apps/web/src/App.tsx` and `apps/admin/src/App.tsx` use `error instanceof Error ? error.message : 'Unknown error'` pattern.
- **KB Candidate:** No — standard Sentry usage pattern

## RES-005: GitHub Push Protection for Sentry Auth Tokens

- **Date:** 2026-04-25
- **Question:** Can Sentry auth tokens be committed to `.env.example`?
- **Source:** GitHub Push Protection (triggered on push attempt)
- **Answer:** No. GitHub's secret scanning detected the Sentry auth token (`sntrys_*` pattern) and blocked the push. Sentry DSNs are safe to commit (they are public identifiers), but auth tokens must only be stored in CI/CD secrets.
- **Confidence:** High (blocked by GitHub, confirmed by Sentry docs)
- **Impact:** Removed auth token value from `.env.example`. Token stored only in deployment env vars (Render/Vercel secrets).
- **KB Candidate:** Yes — logged to kb-candidates.md

## RES-006: Vite 6 Compatibility with vitest 2.x

- **Date:** 2026-04-25
- **Question:** Can vitest 2.1.9 run with vite 6.4.2 (forced via pnpm overrides)?
- **Source:** https://github.com/vitest-dev/vitest/releases (compatibility matrix)
- **Answer:** vitest 2.x officially supports vite 5.x. However, forcing vite 6.4.2 via overrides works in practice because vitest uses a limited subset of Vite's API. Type-check, build, and lint all pass. The test runner itself works but reports "no test files found" (pre-existing — no test files written yet).
- **Confidence:** Medium (works in practice, not officially supported)
- **Impact:** When test files are written, vitest behavior should be verified. Consider upgrading to vitest 3.x which officially supports vite 6.
- **KB Candidate:** Yes — logged to kb-candidates.md
