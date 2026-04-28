# Source Map

Maps every major implementation area to the exact VIYO document(s) that define it. Updated continuously as new areas are implemented.

## Phase 0 Implementation Areas

| Implementation Area | Primary Source | Secondary Sources | Implemented In |
|---|---|---|---|
| Turborepo monorepo scaffold | Doc4 §2 (Technical Roadmap) | R21 §3 (Infrastructure) | T1 — `turbo.json`, `pnpm-workspace.yaml`, root `package.json` |
| Database schema (14 tables) | R20 (Database Schema Lock) | Doc3 (legacy reference only) | T2 — `packages/db/src/schema/*.ts` |
| Supabase Auth + workspace-scoped RLS | R22 (Security & Auth) | Doc11 (Security Architecture) | T3 — `packages/shared/src/auth/`, migration SQL |
| API layer (Hono middleware stack) | R18 §6 (Global Wiring Map) | Doc4 §2.2 | T4 — `apps/worker/src/` (routes, middleware, services) |
| Inngest event orchestration | R18 §4.3 (Event System) | Doc4 §2.3 | T5 — `apps/worker/src/inngest/` |
| OpenTelemetry instrumentation | R21 §6 (Monitoring) | — | T5 — `apps/worker/src/instrumentation.ts` |
| CI/CD deployment pipeline | R21 §5 (Infrastructure) | Doc4 §2.2 | T6 — `.github/workflows/ci.yml`, `deploy.yml`, `render.yaml` |
| Credential vault (AES-256-GCM) | Doc11 §3 (Security) | R22 §5 | T8 — `packages/shared/src/security/vault.ts`, `key-rotation.ts` |
| Sentry error monitoring | R21 §6 (Monitoring) | — | T12 — `apps/worker/src/lib/sentry.ts`, `apps/web/src/lib/sentry.ts`, `apps/admin/src/lib/sentry.ts` |
| Frontend architecture (Vite + React SPA) | R17 (UI/UX Architecture) | Doc9 (Frontend Architecture) | T1 — `apps/web/`, `apps/admin/` |
| Billing & cost tracking | R23 (Cost Reconciliation) | — | T9 — implemented |
| Composite database foundation for comments, brands, webhooks, notifications, integrations, and image prompt routing support | PRD V5 Addendum §30 / R20 | Brand Chat and Comments Architecture Lock v3.0; Webhook Pipeline Architecture Lock v3.0; PO T45 Phase 2 and Phase 3 rulings | T45 — `packages/db/drizzle/0007_t45_composite_database_foundation.sql`, `collaboration.ts`, `webhooks.ts`, `integrations.ts`, `image-intelligence.ts` update |
| AI brains & prompts | R19 (LLM Architecture) | Doc2 (System Prompts) | Phase 2 — not yet implemented |
| Image pipeline | R24 (Image Pipeline) | — | Phase 2 — not yet implemented |
| Email compiler | R27 (Composable Sections) | Doc6 (Skills Catalog) | Phase 3 — not yet implemented |

## Schema File to R20 Section Mapping

| Schema File | R20 Section | Tables Defined |
|---|---|---|
| `identity.ts` | §2 (Identity Domain) | `workspaces`, `users`, `workspace_members`, `api_keys` |
| `products.ts` | §3 (Product Domain) | `viyo_products`, `assets` |
| `email.ts` | §4 (Email Domain) | `email_templates`, `esp_connections` |
| `llm.ts` | §5 (LLM Domain) | `council_decisions` |
| `image-intelligence.ts` | §6 (Image Domain) + PRD V5 Addendum §30.2.1 | `image_prompt_patterns` with T45 router-support columns |
| `collaboration.ts` | Brand Chat and Comments Architecture Lock v3.0 + PO T45 Option A ruling | `brands`, `comments`, `notification_preferences` |
| `webhooks.ts` | Webhook Pipeline Architecture Lock v3.0 / T48 event catalog | `webhook_endpoints`, `webhook_delivery_logs` |
| `integrations.ts` | PRD V5 Addendum §30.1.5 / R18 integration layer | `integration_connections` |
| `cost.ts` | §7 (Cost Domain) | `token_usage_logs` |
| `rlhf.ts` | §8 (RLHF Domain) | `rlhf_votes`, `preference_model_versions`, `pattern_performance_metrics` |
| `timer.ts` | §9 (Timer Domain) | `timer_definitions` |

## Shared Package to Spec Mapping

| Module | Primary Source | Purpose |
|---|---|---|
| `shared/src/auth/` | R22 §3-4 | Supabase client, API key validation, auth types |
| `shared/src/config/` | R21 §4 | Environment variable schema (Zod-validated) |
| `shared/src/events/` | R18 §4.3 | Inngest event type definitions (workspace, campaign, asset) |
| `shared/src/schemas/` | R20 + R18 | Zod request/response schemas (workspace, product, credential) |
| `shared/src/security/` | Doc11 §3, R22 §5 | AES-256-GCM vault, dual-key rotation, sensitive field patterns |
| `shared/src/types/` | R20 §2 | TypeScript type exports (workspace types) |

| T46 Art Director routing suite | `docs/architecture/art-director-routing-suite.md`; `docs/internal/t46-phase2-architecture-plan.md`; `docs/internal/t46-phase3-global-wiring-blueprint.md` | R19 LLM Architecture Enterprise; R24 Multi-Model Image Pipeline Enterprise; T45 `image_prompt_patterns` schema |

## 2026-04-28 — T46 Worker Routing Source Anchors

Implementation follows `docs/internal/t46-phase2-architecture-plan.md`, `docs/internal/t46-phase3-global-wiring-blueprint.md`, and `docs/architecture/art-director-routing-suite.md`. Existing code anchors used: `packages/db/src/schema/image-intelligence.ts`, `apps/worker/src/lib/token-engine.ts`, `apps/worker/src/middleware/auth.ts`, and `apps/worker/src/index.ts`.
