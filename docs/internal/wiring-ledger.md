# Wiring Ledger

Tracks every cross-system connection in the VIYO codebase. Each entry maps a source module to its consumers, the env vars it depends on, and the task that created the wiring.

## Layer 1: Database Schema → ORM

| Schema File | Drizzle Export | Consumers | Task |
|---|---|---|---|
| `packages/db/src/schema/identity.ts` | `workspaces`, `users`, `workspaceMembers`, `apiKeys` | `credential.service.ts`, `workspaces.ts` route | T2 |
| `packages/db/src/schema/products.ts` | `viyoProducts`, `assets` | `products.ts` route | T2 |
| `packages/db/src/schema/email.ts` | `emailTemplates`, `espConnections` | (not yet consumed) | T2 |
| `packages/db/src/schema/llm.ts` | `councilDecisions` | (not yet consumed) | T2 |
| `packages/db/src/schema/image-intelligence.ts` | `imagePromptPatterns` with T45 router-support columns | (not yet consumed) | T2, T45 |
| `packages/db/src/schema/collaboration.ts` | `brands`, `comments`, `commentTargetTypeEnum`, `notificationPreferences` | Future Brand Chat, Comments, Approval, and Notification runtime tasks | T45 |
| `packages/db/src/schema/webhooks.ts` | `webhookEndpoints`, `webhookDeliveryLogs`, `webhookEventEnum`, `webhookDeliveryStatusEnum` | Future T48 webhook dispatcher and delivery-worker tasks | T45 |
| `packages/db/src/schema/integrations.ts` | `integrationConnections`, `integrationProviderEnum`, `integrationConnectionStatusEnum` | Future OAuth/platform integration runtime tasks | T45 |
| `packages/db/src/schema/cost.ts` | `tokenUsageLogs` | (not yet consumed) | T2 |
| `packages/db/src/schema/rlhf.ts` | `rlhfVotes`, `preferenceModelVersions`, `patternPerformanceMetrics` | (not yet consumed) | T2 |
| `packages/db/src/schema/timer.ts` | `timerDefinitions` | (not yet consumed) | T2 |

## Layer 2: Auth → Middleware → Routes

| Auth Module | Middleware | Routes Protected | Env Vars | Task |
|---|---|---|---|---|
| `shared/src/auth/supabase.ts` | `worker/src/middleware/auth.ts` | All `/v1/*` routes | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` | T3 |
| `shared/src/auth/api-keys.ts` | `worker/src/middleware/auth.ts` | API key auth path | `DATABASE_URL` | T3 |
| `shared/src/auth/live-check.ts` | (utility) | Health check | `SUPABASE_URL` | T3 |

## Layer 3: Shared Schemas → API Validation

| Schema Module | Zod Schemas | Consumed By | Task |
|---|---|---|---|
| `shared/src/schemas/workspace.ts` | `createWorkspaceSchema`, `workspaceResponseSchema` | `worker/src/routes/v1/workspaces.ts` | T4 |
| `shared/src/schemas/product.ts` | `createProductSchema`, `productResponseSchema` | `worker/src/routes/v1/products.ts` | T4 |
| `shared/src/schemas/credential.ts` | `createCredentialSchema`, `credentialResponseSchema` | `worker/src/routes/v1/credentials.ts` | T4 |

## Layer 4: Middleware Stack (execution order)

| Order | Middleware | File | Purpose | Task |
|---|---|---|---|---|
| 1 | Request ID | `middleware/request-id.ts` | Assigns `X-Request-Id` header | T4 |
| 2 | Rate Limiter | `middleware/rate-limiter.ts` | In-memory rate limiting | T4 |
| 3 | Error Handler | `middleware/error-handler.ts` | Catches errors, sends to Sentry | T4, T12 |
| 4 | Auth | `middleware/auth.ts` | JWT/API key validation | T3 |
| 5 | Validate | `middleware/validate.ts` | Zod request body validation | T4 |

## Layer 5: Event System

| Event Module | Event Types | Producer | Consumer | Env Vars | Task |
|---|---|---|---|---|---|
| `shared/src/events/workspace.ts` | `workspace.created`, `workspace.updated` | Workspace routes | `workspace-provisioning.ts` | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | T5 |
| `shared/src/events/campaign.ts` | `campaign.created`, `campaign.published` | (not yet produced) | (not yet consumed) | — | T5 |
| `shared/src/events/asset.ts` | `asset.generated`, `asset.approved` | (not yet produced) | (not yet consumed) | — | T5 |

## Layer 6: Security → Services

| Security Module | Consumers | Env Vars | Task |
|---|---|---|---|
| `shared/src/security/vault.ts` | `credential.service.ts`, `sentry.ts` (worker) | `VIYO_VAULT_KEY`, `VIYO_VAULT_KEY_PREVIOUS` | T8 |
| `shared/src/security/key-rotation.ts` | (manual rotation utility) | `VIYO_VAULT_KEY`, `VIYO_VAULT_KEY_PREVIOUS` | T8 |

## Layer 7: Observability

| Component | File | Wired To | Env Vars | Task |
|---|---|---|---|---|
| OTel NodeSDK | `worker/src/instrumentation.ts` | OTLP exporter, Sentry bridge | `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME` | T5, T12 |
| Sentry (worker) | `worker/src/lib/sentry.ts` | Error handler middleware, OTel bridge | `SENTRY_DSN_WORKER` | T12 |
| Sentry (web) | `web/src/lib/sentry.ts` | `App.tsx` ErrorBoundary, `main.tsx` init | `VITE_SENTRY_DSN_WEB` | T12 |
| Sentry (admin) | `admin/src/lib/sentry.ts` | `App.tsx` ErrorBoundary, `main.tsx` init | `VITE_SENTRY_DSN_ADMIN` | T12 |
| Sentry Vite Plugin (web) | `web/vite.config.ts` | Source map upload (prod only) | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT_WEB` | T12 |
| Sentry Vite Plugin (admin) | `admin/vite.config.ts` | Source map upload (prod only) | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT_ADMIN` | T12 |

## Layer 8: CI/CD

| Workflow | Trigger | Steps | Env Vars Required | Task |
|---|---|---|---|---|
| `ci.yml` | PR to `main`/`staging` | Install → Lint → Type-check → Build → Test | None (all checks are local) | T6 |
| `deploy.yml` | Push to `main` | Calls CI → Deploy (Render auto-deploys from main) | Render API key (in GitHub secrets) | T6 |

## Layer 9: Frontend → Backend

| Frontend Module | Backend Endpoint | Auth Method | Task |
|---|---|---|---|
| `web/src/lib/supabase.ts` | Supabase Auth API | Supabase client | T3 |
| `web/src/stores/auth.ts` | Supabase Auth API | Supabase client | T3 |
| `admin/src/lib/supabase.ts` | Supabase Auth API | Supabase client | T3 |
| (API calls not yet wired) | `worker /v1/*` | JWT Bearer token | — |

## Complete Env Var Registry

| Variable | Used By | Required | Source Task |
|---|---|---|---|
| `SUPABASE_URL` | shared/auth, web, admin | Yes | T3 |
| `SUPABASE_ANON_KEY` | shared/auth, web, admin | Yes | T3 |
| `SUPABASE_SERVICE_ROLE_KEY` | worker (admin ops) | Yes | T3 |
| `DATABASE_URL` | packages/db | Yes | T2, T45 migration validation |
| `SUPABASE_JWT_SECRET` | worker/middleware/auth | Yes | T3 |
| `VIYO_VAULT_KEY` | shared/security/vault | Yes | T8 |
| `VIYO_VAULT_KEY_PREVIOUS` | shared/security/vault | No (only during rotation) | T8 |
| `INNGEST_EVENT_KEY` | worker/inngest/client | Yes | T5 |
| `INNGEST_SIGNING_KEY` | worker/inngest/client | Yes | T5 |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | worker/instrumentation | No (disables export if absent) | T5 |
| `OTEL_SERVICE_NAME` | worker/instrumentation | No (defaults to `viyo-worker`) | T5 |
| `SENTRY_DSN_WORKER` | worker/lib/sentry | No (disables Sentry if absent) | T12 |
| `SENTRY_AUTH_TOKEN` | vite.config.ts (CI only) | No (disables source map upload) | T12 |
| `SENTRY_ORG` | vite.config.ts (CI only) | No | T12 |
| `SENTRY_PROJECT_WEB` | web/vite.config.ts | No | T12 |
| `SENTRY_PROJECT_ADMIN` | admin/vite.config.ts | No | T12 |
| `SENTRY_RELEASE` | all sentry.ts files | No (defaults to pkg version) | T12 |
| `VITE_SUPABASE_URL` | web, admin | Yes | T3 |
| `VITE_SUPABASE_ANON_KEY` | web, admin | Yes | T3 |
| `VITE_APP_URL` | web | No (defaults to localhost:5173) | T1 |
| `VITE_API_URL` | web, admin | No (defaults to localhost:3001) | T1 |
| `VITE_SENTRY_DSN_WEB` | web/lib/sentry | No (disables Sentry if absent) | T12 |
| `VITE_SENTRY_DSN_ADMIN` | admin/lib/sentry | No (disables Sentry if absent) | T12 |
| `NODE_ENV` | all apps | No (defaults to development) | T1 |
| `PORT` | worker | No (defaults to 3001) | T1 |
| `STRIPE_SECRET_KEY` | (T9 — not yet wired) | — | T9 |
| `STRIPE_WEBHOOK_SECRET` | (T9 — not yet wired) | — | T9 |
| `R2_ACCOUNT_ID` | (P0-14 — not yet wired) | — | — |
| `R2_ACCESS_KEY_ID` | (P0-14 — not yet wired) | — | — |
| `R2_SECRET_ACCESS_KEY` | (P0-14 — not yet wired) | — | — |
| `R2_BUCKET_NAME` | (P0-14 — not yet wired) | — | — |
| `UPSTASH_REDIS_REST_URL` | (P0-15 — not yet wired) | — | — |
| `UPSTASH_REDIS_REST_TOKEN` | (P0-15 — not yet wired) | — | — |
| `GOOGLE_AI_API_KEY` | (Phase 2 — not yet wired) | — | — |
| `IDEOGRAM_API_KEY` | (Phase 2 — not yet wired) | — | — |

## 2026-04-28 — T46 Phase 4 Worker Routing Wiring

Layers updated: Layer 2 database read path via `imagePromptPatterns`; Layer 3 domain routing services; Layer 5 tRPC API contract; Layer 6 worker transport mount; Layer 8 observability logs; Layer 10 environment-driven router config; Layer 11 billing precheck boundary; Layer 13 fallback and rollback routing. No UI mutation was introduced in this component.

## 2026-04-28 — T46 Test Wiring Checkpoint

T46 now has focused worker tests covering routing layers 3, 5, 8, 10, and 13. The tests are intentionally colocated at `apps/worker/src/lib/ai/art-director-routing.test.ts` so the provider registry, fallback prompt builder, and scoring formula are validated at the implementation boundary rather than as detached documentation.
