# Decision Log

Every meaningful engineering decision with rationale and source-doc reference.

## DEC-001: Turborepo over Nx for Monorepo Orchestration

- **Date:** 2026-04-24
- **Context:** R21 §3 specifies a monorepo. Both Turborepo and Nx are viable. Doc4 §2 references Turborepo.
- **Decision:** Use Turborepo with pnpm workspaces.
- **Rationale:** Doc4 is authoritative (Authority Order rank 3). Turborepo is simpler, zero-config for pnpm, and sufficient for VIYO's 6-package monorepo. Nx adds complexity without proportional benefit at this scale.
- **Consequences:** Locked into Turborepo pipeline syntax. Migration to Nx possible but would require rewriting `turbo.json`.

## DEC-002: Hono over Express for Worker API

- **Date:** 2026-04-24
- **Context:** R18 §6 specifies the API layer. Express is the default Node.js framework. Hono is newer, faster, and TypeScript-native.
- **Decision:** Use Hono v4 on Node.js for the worker API.
- **Rationale:** Hono provides native TypeScript types, middleware composition, and Zod integration out of the box. R18 does not prescribe a specific framework — only the API contract. Hono's middleware pattern aligns with the layered middleware stack (request-id → rate-limiter → auth → validate → handler).
- **Consequences:** Hono-specific middleware patterns. Sentry integration uses generic `@sentry/node` (no Hono-specific SDK exists, but Sentry's onboarding now lists Hono as a supported framework).

## DEC-003: Drizzle ORM over Prisma for Database Layer

- **Date:** 2026-04-24
- **Context:** R20 defines the schema. Both Drizzle and Prisma can implement it. Doc4 §2.1 references Drizzle.
- **Decision:** Use Drizzle ORM with `drizzle-kit` for migrations.
- **Rationale:** Drizzle is SQL-first (closer to R20's raw DDL definitions), generates zero runtime overhead, and supports pgvector natively. Prisma's query engine adds ~5MB to the bundle and abstracts away SQL in ways that conflict with R20's explicit index and constraint definitions.
- **Consequences:** Must write queries in Drizzle's SQL-like API. No Prisma Studio for visual DB browsing (use Supabase dashboard instead).

## DEC-004: Supabase Auth over Custom JWT

- **Date:** 2026-04-24
- **Context:** R22 specifies Supabase Auth. Custom JWT was considered for flexibility.
- **Decision:** Use Supabase Auth as specified in R22.
- **Rationale:** Source docs are authoritative (Authority Order rank 3). Custom JWT would violate spec. Supabase Auth provides RLS integration, email/password + OAuth, and session management out of the box.
- **Consequences:** Locked into Supabase auth patterns. Migration path documented in R22 Section 7.

## DEC-005: AES-256-GCM with Dual-Key Rotation for Credential Vault

- **Date:** 2026-04-24
- **Context:** Doc11 §3 requires encrypted credential storage. Multiple encryption schemes considered.
- **Decision:** AES-256-GCM with per-ciphertext random IV, auth tag verification, and dual-key rotation.
- **Rationale:** GCM provides authenticated encryption (integrity + confidentiality). Dual-key rotation allows zero-downtime key changes — decrypt tries current key first, falls back to previous. This matches Doc11's requirement for "seamless key rotation without service interruption."
- **Consequences:** Requires `VIYO_VAULT_KEY` (32 bytes hex) and optional `VIYO_VAULT_KEY_PREVIOUS` env vars. All credential reads must go through `VaultService.decrypt()`.

## DEC-006: Inngest over BullMQ for Event Orchestration

- **Date:** 2026-04-24
- **Context:** R18 §4.3 specifies durable event processing. BullMQ (Redis-backed) and Inngest (managed) both viable.
- **Decision:** Use Inngest for durable function orchestration.
- **Rationale:** Inngest provides built-in retries, step functions, fan-out, and event replay without managing Redis infrastructure. R18 references Inngest-style event patterns. BullMQ would require self-managed Redis + custom retry logic.
- **Consequences:** Inngest SaaS dependency. Event schemas must match Inngest's typed event format. Local development uses Inngest Dev Server.

## DEC-007: OpenTelemetry NodeSDK over Datadog/New Relic for Observability

- **Date:** 2026-04-24
- **Context:** R21 §6 requires monitoring. Proprietary (Datadog, New Relic) and open-source (OTel) options available.
- **Decision:** Use OpenTelemetry NodeSDK with OTLP exporter.
- **Rationale:** OTel is vendor-neutral — traces can be sent to any backend (Jaeger, Grafana, Datadog). Avoids vendor lock-in. R21 does not prescribe a specific vendor. OTel's auto-instrumentation covers HTTP and Drizzle queries.
- **Consequences:** Must configure OTLP endpoint per environment. Sentry OTel bridge (`@sentry/opentelemetry`) added in T12 to forward traces to Sentry.

## DEC-008: Sentry over LogRocket/Bugsnag for Error Monitoring

- **Date:** 2026-04-25
- **Context:** OTel provides traces but no error capture, alerting, or session replay. Multiple error monitoring platforms evaluated.
- **Decision:** Use Sentry with `@sentry/node` (worker), `@sentry/react` (web/admin), and `@sentry/opentelemetry` bridge.
- **Rationale:** Sentry provides error capture + stack traces, real-time alerting, session replay, performance monitoring (P95/P99), and release tracking. The OTel bridge connects to our existing T5 instrumentation without replacing it. Sentry's free tier covers Phase 0 needs.
- **Consequences:** 3 Sentry projects (one per app). DSNs are public identifiers (safe to commit). Auth token required for CI/CD source map uploads (secret, not committed).

## DEC-009: pnpm Overrides for Transitive Dependency Vulnerabilities

- **Date:** 2026-04-25
- **Context:** Dependabot flagged `vite` 5.4.21 and `esbuild` 0.21.5 as vulnerable. Both are transitive deps of `vitest`.
- **Decision:** Use `pnpm.overrides` in root `package.json` to force patched versions (`vite >= 6.4.2`, `esbuild ~0.25.0`).
- **Rationale:** Direct upgrade of `vitest` alone did not pull in patched transitive deps. Overrides force the resolution without waiting for upstream `vitest` release. `esbuild` pinned to `~0.25.0` (not latest 0.27.x) because 0.27 broke destructuring transforms in the build.
- **Consequences:** Overrides must be reviewed when upgrading `vitest` in the future. The `~0.25.0` pin for esbuild should be lifted once vitest ships with esbuild >= 0.25.

## DEC-010: Inline Sensitive Field Patterns in Browser Sentry Init

- **Date:** 2026-04-25
- **Context:** T8's `SENSITIVE_FIELD_PATTERNS` live in `@viyo/shared/security/vault.ts`, which imports `node:crypto`. Importing this in browser Sentry init pulls `node:crypto` into the Vite bundle, causing build failure.
- **Decision:** Inline the sensitive field patterns directly in `apps/web/src/lib/sentry.ts` and `apps/admin/src/lib/sentry.ts` instead of importing from `@viyo/shared`.
- **Rationale:** The patterns are static string arrays (no runtime crypto needed). Inlining avoids the barrel import contamination while maintaining identical scrubbing behavior. The worker's `sentry.ts` imports from `@viyo/shared` normally since it runs on Node.js.
- **Consequences:** If patterns change in `vault.ts`, they must also be updated in the two browser `sentry.ts` files. A future refactor could extract patterns into a separate `@viyo/shared/security/patterns.ts` file that has no `node:crypto` dependency.
