# Integration Map

This file records implementation-to-integration boundaries for VIYO systems that cross database, runtime, UI, external-service, and documentation layers. It complements `docs/internal/wiring-ledger.md`, which remains the layer-by-layer wiring ledger.

## T45 — Composite Database Foundation for T16–T20

| Integration Area | Implemented Boundary | Current Consumers | Future Consumers | Environment Variables | Status |
|---|---|---|---|---|---|
| Brand-scoped comments | `brands` and `comments` database tables with workspace-membership RLS and the exact 11-value `comment_target_type` enum | Drizzle schema exports only | Brand Chat, Comments API, approval flows, image/email/product annotation UI | None added | Foundation complete |
| Webhook subscriptions and delivery tracking | `webhook_endpoints`, `webhook_delivery_logs`, exact T48 22-event catalog, encrypted secret field, failure counters, and cascade delete | Drizzle schema exports only | T48 webhook dispatcher, retry worker, webhook settings UI | None added | Foundation complete |
| Notification preferences | `notification_preferences` tenant-scoped table | Drizzle schema exports only | Notification sender, notification preferences UI, team collaboration events | None added | Foundation complete |
| OAuth/platform connections | `integration_connections` table for encrypted token metadata and provider status | Drizzle schema exports only | Shopify/Klaviyo/Stripe/Google integration runtimes | None added | Foundation complete |
| Image prompt routing metadata | `image_prompt_patterns` router-support columns plus deterministic SQL backfill | Drizzle schema exports and migration | Image intelligence router, pattern analytics, future prompt selection logic | None added | Foundation complete |

T45 intentionally did not add tRPC procedures, Hono routes, webhook dispatchers, notification senders, OAuth runtime clients, UI pages, or background workers. Those runtime surfaces remain assigned to later tasks and must consume these database exports rather than redefining schema contracts.

| T46 Art Director Routing Suite | read/update existing `image_prompt_patterns` only | auth context propagated into tRPC | shared Art Director schemas | router service, provider registry, embeddings, fallback prompts | `/api/trpc/*` `artDirector.routeGeneration` | contract only, no Phase 4 UI | metadata only, no Phase 4 admin UI | Gemini embeddings and zero-shot fallback | router decision event | router env flags and tier defaults | typed provider/billing errors | Phase 2/3/4 internal records | Vitest coverage for scoring, billing, provider tiers, tRPC auth |

| T46 Shared Art Director Contract | not touched | not touched | `packages/shared/src/schemas/art-director.ts`; `packages/shared/src/config/env.ts` | future worker consumers | planned `/api/trpc/*` consumer | no Phase 4 UI | no Phase 4 admin UI | Gemini env model exposed | trace metadata contract | rollback and provider defaults parsed at boot | schema validation errors | `docs/internal/t46-phase4-incremental-record.md` updated | shared type-check passed |

## 2026-04-28 — T46 Worker Routing Integration

T46 now integrates the Art Director router through `apps/worker/src/trpc/index.ts` and `apps/worker/src/index.ts` at `/api/trpc/*`. The route delegates to `apps/worker/src/lib/ai/image-router.ts`, which reads T45 `image_prompt_patterns`, computes the corrected PO-approved 4D score, returns cache metadata, and preserves deduct-after-success billing by prechecking token state without deducting before provider success.

## 2026-04-28 — T46 Focused Test Integration

The T46 worker test integration maps the new Art Director routing modules to the worker package's existing Vitest command. No external provider calls, database calls, or token deductions are performed by these tests; the coverage locks deterministic routing and scoring behavior before Phase 5 review.

## 2026-04-28 — Phase 6 Image Studio Frontend Integration

The Image Studio route at `/brand/:brandId/studio` now binds the web frontend to the repaired Art Director v6.1 contract through browser-safe schema subpaths. `apps/web/src/lib/studio-contract.ts` derives the A1-A22 generation modes, ten Visual Engine V2 editing tools, and aspect-ratio options from `@viyo/shared/schemas/art-director`. `apps/web/src/lib/studio-api.ts` validates outbound requests and inbound responses against the same schemas before calling the worker tRPC procedure `artDirector.routeGeneration`. `apps/web/src/components/studio/ImageStudio.tsx` maps returned `assetUrl`, `assetId`, `savedToVault`, `palette`, `routingMetadata`, and `traceMetadata` into canvas result state.

Taskmaster status intentionally distinguishes completed layout from remaining flow depth: T24 is `done`, while T26 remains `in-progress` for realtime progress subscription and infinite-scroll history. The editing-tool selector surfaces all ten repaired tool identifiers, but deeper per-tool UX remains governed by T27-T30 and related follow-up tasks.
