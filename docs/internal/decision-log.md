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

## DEC-011: Implement Minimal Brands Foundation Inside T45

- **Date:** 2026-04-28
- **Context:** The v3.0 Brand Chat and Comments architecture lock requires `comments.brand_id` as a non-null foreign key to `brands.id`, but the existing database package did not yet define a `brands` table. Deferring the foreign key would create orphan risk, and replacing the locked brand relation with workspace-only comments would violate the approved architecture.
- **Decision:** Add a minimal `brands` database foundation inside T45 before creating `comments`.
- **Rationale:** The Product Owner approved Option A at the T45 Phase 2 gate and confirmed that `brands` is foundational infrastructure needed for compliant comment isolation. The table remains schema-only and contains only the fields required to support workspace membership RLS and the locked comments foreign key.
- **Consequences:** T45 includes `brands` even though the task began as the composite foundation for T16–T20. Future brand runtime tasks can extend brand behavior without weakening the `comments.brand_id` contract.

## DEC-012: Use Exact T48 Webhook Event Catalog in Database Constraint and Drizzle Enum

- **Date:** 2026-04-28
- **Context:** The initial T45 Phase 3 wiring blueprint used placeholder webhook event names that were not present in the T48 Webhook Pipeline architecture lock. The Product Owner approved Phase 3 with a mandatory correction to use the exact 22 locked event names.
- **Decision:** Define webhook events exactly as: `email.generation.started`, `email.generation.completed`, `email.generation.failed`, `email.export.completed`, `email.export.failed`, `email.status.changed`, `image.generation.started`, `image.generation.completed`, `image.generation.failed`, `image.edit.completed`, `image.edit.failed`, `image.saved_to_vault`, `brand.import.started`, `brand.import.completed`, `brand.import.failed`, `brand.assets.updated`, `team.comment.added`, `team.approval.granted`, `team.member.invited`, `billing.tokens.low`, `billing.tokens.depleted`, and `billing.subscription.changed`.
- **Rationale:** Webhook delivery contracts must be interoperable with the future T48 dispatcher and cannot contain fabricated events. Enforcing the catalog at the database/Drizzle layer prevents downstream runtime drift.
- **Consequences:** Future webhook producers must emit only these 22 events unless a later Product Owner-approved architecture lock expands the catalog.

## DEC-013: Keep T45 Strictly Schema-Only

- **Date:** 2026-04-28
- **Context:** T45 establishes the database foundation for comments, webhooks, notification preferences, integrations, and image prompt pattern routing. Runtime APIs, dispatchers, notification senders, OAuth clients, and tRPC procedures are owned by later tasks.
- **Decision:** T45 changes are limited to SQL migrations, Drizzle schema modules, barrel exports, generated build validation, and internal records.
- **Rationale:** The Product Owner explicitly confirmed the scope boundary during Phase 2. Avoiding runtime stubs prevents dead infrastructure and keeps future tasks responsible for real runtime behavior.
- **Consequences:** The new tables are queryable through Drizzle once migrations are applied, but no application UI/API behavior is claimed as complete by T45.

## DEC-T46-P4-001: Implement Deduct-After-Success Billing for T46 Frontier Routing
- **Date:** 2026-04-28
- **Context:** The approved Phase 3 blueprint found no approved token hold ledger in the current token engine.
- **Decision:** T46 billable frontier generation will precheck billing and balance, execute the selected provider, and call `deductTokens` only after provider success.
- **Rationale:** This satisfies the PO correction forbidding deduct-before-execute while avoiding unapproved billing-schema expansion.
- **Consequences:** Failed provider attempts do not mutate token balances; a true hold ledger remains deferred unless a future task approves the required billing model.
