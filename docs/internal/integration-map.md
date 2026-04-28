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
