# T46 Art Director Routing Suite (v2)

**ZCBR Status:** PASSED 2026-05-12 by Architect Claude self-validation
**ZCBR Checklist version:** v1
**Spec version:** 2.0
**Authoring authority:** Architect Claude (Opus 4.7)
**Authored date:** 2026-05-12
**Target repo path on commit:** `/docs/architecture/art-director-routing-suite.md` (replaces v1 at commit SHA `1cc43f5781b132ef256e21ca06c8914c0c9e64c3`)
**Supersedes:** T46 v3.0 (the prior PO-authorized architecture lock dated 2026-04-27)

---

## 0. Supersession statement

This v2 spec supersedes the prior T46 v3.0 architecture lock that has lived at `/docs/architecture/art-director-routing-suite.md` since 2026-04-27. The v3.0 lock predates the ZCBR standard, predates Foundation Lock 19 (Provider Agnosticism), predates VVOW tier semantics, predates the R29 v2 Platform Abstraction Layer, and predates R24 v2 Pattern Recipe architecture. It carries six concrete conflicts with current canonical state:

1. **Hardcoded `selectedModel` string return** — Lock 19 violation; resolved by routing to opaque capability + tier preferences with the Provider Registry executing actual provider selection
2. **Direct `atomic_token_deduction` call from routing code** — Lock 8 + R29 v2 §9 violation; resolved by the `billable` flag flowing through to the Provider Registry which writes `token_usage_logs` at execution time, not at routing time
3. **Old 4D Quality/Cost/Freshness/Tier scoring matrix** — does not align with R24 v2 three-tier architecture + Pattern Recipe model; scoring concerns are moved to R29 v2 §5 (registry-side resolution); routing produces opaque preferences, not scores
4. **Inverted tier numbering** — v3.0 implied Tier 1 = direct frontier model; VVOW supersedes with Tier 1 = aggregator quality target; v2 adopts VVOW semantics
5. **No R37 MAAX brand preference signal integration** — brand-specific approved/excluded providers had no path; v2 makes brand signal resolution a required step
6. **PagerDuty-named alert** — observability tool naming hardcoded; v2 specifies alert categories without naming a specific paging system

The v3.0 lock's "score formula" (Section 4 of v1) is **not retained** in v2. Scoring is a registry-side concern per R29 v2 §5.4 capability resolution. T46 v2 produces capability + tier + brand-preference outputs; the Provider Registry decides which actual provider best satisfies those preferences using whatever scoring/heuristics R29 v2 owns.

---

## 1. Source declaration

| Source ID | Source | Authority | Used for |
|---|---|---|---|
| S1 | R24 v2 Image Pipeline `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md` (ZCBR PASSED, PR #23) | Canonical | Three-tier architecture, Pattern Recipe contract, dual-scoring threshold semantics |
| S2 | R29 v2 Platform Abstraction Layer `/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md` (ZCBR PASSED, PR #25) | Canonical | Provider Registry interface, capability identifiers (§3.2 locked enum), brand-override resolution (§5.4), billable flag pattern (§9) |
| S3 | R20 v2 Database Schema `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md` (ZCBR PASSED, PR #21) | Canonical | `image_generations` table, `rlhf_events` table, RLS contract |
| S4 | R37 MAAX (PENDING RE-VALIDATION, audit table row 20) | Cautious consumer | Brand preference signal interface; T46 v2 consumes via opaque signal-fetch helper and tolerates missing signals |
| S5 | VVOW Image Studio Architecture | Higher-tier authority (EXEMPT from ZCBR per audit table row 31) | Tier numbering semantics (Tier 1 = aggregators) |
| S6 | Foundation Lock 8 — Programmatic ops charge 0 tokens | Higher-tier | Billable flag computation rules |
| S7 | Foundation Lock 13 — Multi-tenant RLS | Higher-tier | Workspace-scoped routing decisions |
| S8 | Foundation Lock 19 + Extension Clause — Provider Agnosticism | Higher-tier | No hardcoded provider/model names; routing returns opaque preferences |
| S9 | Foundation Lock 20 — ZCBR-validated specs required | Higher-tier | This spec carries ZCBR PASSED header |
| S10 | Foundation Lock 21 — Governance Agnosticism | Higher-tier | Does NOT apply to this T-spec (T-specs ARE implementation) |
| S11 | D8 — Five-tier subscription pricing | Higher-tier | Brand subscription tier ceiling for tier preference resolution |
| S12 | D55 — R29 PAL unified Plugin Registry covering AI + ESP + e-commerce | Higher-tier | Routing surface is unified registry-driven, not provider-specific |
| S13 | `art-director-routing` skill v1.0 (Portal storage, uploaded 2026-05-12) | Implementation | Skill is the Kimi-consumed authoring guide; this spec is the contract authority |
| S14 | `image-generation-pipeline` skill v1.1 (Portal storage) | Implementation | Downstream skill consuming the RoutingDecision produced by this contract |
| S15 | `pattern-cache-lookup` skill v1.0 (Portal storage) | Implementation | Recipe resolution helper consumed by image generation downstream |
| S16 | `rlhf-event-emission` skill v1.1 (Portal storage) | Implementation | Verdict emission consumed by routing for brand signal feedback loop |

---

## 2. Locks & Decisions Invoked

- **Foundation Lock 8** — Programmatic operations charge 0 tokens. Art-director routing is programmatic; routing itself NEVER writes to `token_usage_logs`. The downstream execution that the routing authorizes is billable per request context, not the routing decision.
- **Foundation Lock 13** — Multi-tenant RLS. Every routing decision is workspace-scoped. Brand signal fetches are workspace-scoped. No cross-workspace data leakage.
- **Foundation Lock 19 + Extension Clause** — Provider Agnosticism. Routing code MUST NOT name specific AI provider or model identifiers as literals. Brand preferences flow as opaque registry-ID arrays. The Provider Registry resolves actual providers at execution time. Extension Clause: applies to all integration categories (AI, ESP, e-commerce, future).
- **Foundation Lock 20** — ZCBR-validated specs required. This spec carries `ZCBR Status: PASSED` per the header. All cited canonical specs (S1, S2, S3) also carry PASSED status. R37 (S4) is in PENDING RE-VALIDATION; this spec consumes R37 via a tolerant interface that handles empty signals.
- **D8** — Five-tier subscription pricing. Brand subscription tier acts as a ceiling on routing tier preferences. Tier 1-2 subscribers cannot route to Tier 1 capability.
- **D55** — R29 PAL unified Plugin Registry covering ESP + AI + e-commerce + future categories. The art-director routes through this registry, never around it.
- **D63** — Skills do not live in any git repo. The four Phase 1 skills referenced by this spec (S13-S16) live in Portal storage, not in repo.
- **C-01 (Lovart-style B3 lazy extraction)** — Pattern Recipe-driven routing supports the lazy extraction model where recipes are extracted on first use rather than upfront.
- **C-07 (Notion D11 webhook architecture)** — Webhook-triggered routing decisions follow the D11 architecture path, not the deprecated T48 path.

---

## 3. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| **Objective** | Implement the routing layer that decides which AI capability to invoke, which tier to prefer, which brand-specific overrides apply, and whether the call is billable — given a high-level intent and request context. |
| **Builder outcome** | A complete, ZCBR-compliant `routeArtDirectorRequest` function exposed via tRPC + direct module import, returning a `RoutingDecision` consumed by downstream execution skills. |
| **Acceptance checks (mechanical)** | (1) All 13 locked intent values map to capability + downstream skill via data-driven table; (2) Tier preference resolution honors request_origin + intent overrides + subscription tier ceiling; (3) Brand override resolution always queries R37 MAAX signals (no skip path); (4) Billable flag false for all programmatic + Learning Engine paths; (5) Lock 19 grep: zero hardcoded provider/model literals in routing code; (6) Lock 8 grep: zero `token_usage_logs` writes from routing code; (7) D8 grep: subscription tier ceiling enforced. |
| **Non-goals** | Implementing the AI providers themselves (R29 v2 territory); implementing the Pattern Recipe lookup mechanics (`pattern-cache-lookup` skill); implementing the image generation execution (`image-generation-pipeline` skill); implementing user feedback UI surfaces. |
| **Constraints** | Routing decisions execute synchronously within the parent request lifecycle. Routing decision latency target: p95 under 50ms (most time is R37 brand signal fetch, which has its own cache). |
| **Source-confirmed assumptions** | (a) The Provider Registry per R29 v2 §7 exposes `providerRegistry.execute({category, capability, args, ...})` and resolves providers at execution time; (b) R37 MAAX exposes `getMaaxBrandSignals(brand_id, workspace_id)` returning `{preferred_providers, excluded_providers, subscription_tier}` (any field may be empty); (c) Inngest event bus is available for asynchronous downstream events. |
| **Open decisions** | None for this v2 ratification. R37 signal schema is consumed via a tolerant interface; when R37 ratifies to ZCBR PASSED (JIT at B-1B.04), this spec MAY bump to v2.1 if the signal schema changes meaningfully. |

---

## 4. Routing decision logic

### 4.1 Intent → capability mapping (data-driven, locked)

The locked enum of 13 intents and their capability + downstream skill mappings:

| Intent | Capability | Downstream skill | Notes |
|---|---|---|---|
| `generate_hero_image` | `image_generation` | `image-generation-pipeline` | Tier 1 default; Curator required when user_initiated |
| `generate_section_image` | `image_generation` | `image-generation-pipeline` | Tier 1 default; Curator not required |
| `generate_typography_variant` | `image_generation` | `image-generation-pipeline` | Typography layer mandatory in layer_inputs |
| `edit_image` | `image_edit` | `image-generation-pipeline` | source_image_url required |
| `remix_image` | `image_edit` | `image-generation-pipeline` | source_image_url required; less mask-strict than edit_image |
| `extract_pattern_from_image` | `vision_extraction` | (future `vision-qa` or extraction skill) | Inline execution acceptable until skill authored |
| `evaluate_image_quality` | `vision_qa` | (future `vision-qa` skill) | Inline execution acceptable until skill authored |
| `generate_variant_for_learning` | `image_generation` | `image-generation-pipeline` | Tier 2 forced; Curator skipped; bouncer threshold lowered |
| `regenerate_after_rejection` | `image_generation` | `image-generation-pipeline` | Tier 1 forced; Bouncer threshold raised |
| `embed_image_for_search` | `embedding` | (future `embedding-generation` skill) | Cost-optimized; inline execution acceptable |
| `embed_text_for_search` | `embedding` | (future `embedding-generation` skill) | Cost-optimized; inline execution acceptable |
| `generate_text_for_email` | `text_generation` | (future `text-generation` skill) | Phase 2+ scope |
| `compile_prompt_template` | `dspy_compile` | (future `dspy-compile` skill) | Phase 3 LATER scope |

The mapping is implemented as a data-driven constant table in `packages/shared/src/schemas/art-director-routing-tables.ts`. Adding a new intent in future minor versions extends the table; the lookup code itself does not change.

### 4.2 Tier preference resolution

Tier preference is computed in four ordered steps:

**Step 1 — Caller override.** If `request.caller_tier_preference` is provided (1, 2, or 3), use it directly and record `routing_rationale.caller_override_applied = true`. Skip to Step 4.

**Step 2 — Origin defaults.**

| request_origin | user_initiated | Default tier |
|---|---|---|
| `studio_ui` | true | 1 |
| `studio_ui` | false | 2 |
| `learning_engine` | (any) | 2 |
| `composer_queue` | (any) | 1 |
| `inngest_function` | (any) | 2 |
| `manual_api` | (any) | 1 |

**Step 3 — Intent-specific overrides.**
- `regenerate_after_rejection` → force Tier 1
- `generate_variant_for_learning` → force Tier 2
- `evaluate_image_quality` with curator hint in `request.text_input` → Tier 1; otherwise Tier 2

**Step 4 — Subscription tier ceiling (D8).**
- Brand subscription tier 1-2 → max routing tier is 2 (downgrade Tier 1 results to Tier 2; record in `routing_rationale.tier_decision_factors`)
- Brand subscription tier 3+ → no ceiling

The final resolved tier flows into `RoutingDecision.resolved_tier`.

### 4.3 Brand override resolution (R37 MAAX)

Every routing decision MUST query R37 MAAX brand signals:

```
const brandSignals = await getMaaxBrandSignals(request.brand_id, request.workspace_id);
```

Extract:
- `preferred_providers` — ordered array of registry-ID strings (Lock 19 — opaque, not hardcoded names)
- `excluded_providers` — array of registry-ID strings to skip during registry resolution
- `subscription_tier` — D8 tier (1-5), defaults to 1 if not in MAAX response

When R37 MAAX is unavailable (service down, network error, timeout under 100ms):
- `preferred_providers` and `excluded_providers` default to empty arrays
- `subscription_tier` defaults to 1 (most restrictive)
- Emit Sentry info-level event recording degraded routing
- Routing proceeds normally; downstream execution falls back to default tier resolution in the Provider Registry

Caller-provided exclusions (`request.caller_excluded_providers`) merge into the final `brand_excluded_providers` array (deduplicated).

### 4.4 Quality threshold overrides

Routing decisions can adjust dual-scoring thresholds per intent:

| Intent | bouncer_threshold_override | curator_required |
|---|---|---|
| `generate_hero_image` (user_initiated=true) | null (default 60) | true |
| `generate_hero_image` (user_initiated=false) | null | false |
| `generate_section_image` (user_initiated=true) | null | false |
| `regenerate_after_rejection` | 70 | (per parent) |
| `generate_variant_for_learning` | 50 | false |
| All other intents | null | false |

The default Bouncer threshold (60) is configurable per brand via `image_generation_config.bouncer_threshold` (R24 v2 §6.4); the override above sits in front of that default and is applied at downstream execution time.

### 4.5 Billable flag computation (Lock 8)

The routing decision authorizes downstream execution that MAY be billable. The flag is computed:

`billable: true` when ALL of:
- `request.user_initiated === true`
- `request.intent` is in the user-facing set: `generate_hero_image`, `generate_section_image`, `generate_typography_variant`, `edit_image`, `remix_image`, `regenerate_after_rejection`, `generate_text_for_email`

`billable: false` when ANY of:
- `request.user_initiated === false`
- `request.intent` is in the programmatic set: `extract_pattern_from_image`, `evaluate_image_quality`, `generate_variant_for_learning`, `embed_image_for_search`, `embed_text_for_search`, `compile_prompt_template`
- `request.request_origin === 'learning_engine'`

The routing decision NEVER writes to `token_usage_logs`. The downstream Provider Registry executes the actual provider call and (when billable) writes `token_usage_logs` per R29 v2 §9 contract.

### 4.6 Output: RoutingDecision

```ts
interface RoutingDecision {
  capability: AICapability;         // R29 v2 §3.2 locked enum
  resolved_tier: 1 | 2 | 3;
  optimize_for: 'quality' | 'cost';
  brand_preferred_providers: string[];   // ordered, registry-IDs (opaque)
  brand_excluded_providers: string[];    // registry-IDs (opaque)
  brand_subscription_tier: 1 | 2 | 3 | 4 | 5;
  billable: boolean;
  downstream_skill: 'image-generation-pipeline' | 'vision-qa' | 'embedding-generation' | 'text-generation' | 'dspy-compile';
  bouncer_threshold_override: number | null;
  curator_required: boolean;
  routing_rationale: {
    intent_to_capability_mapping: string;
    tier_decision_factors: string[];
    brand_override_applied: boolean;
    caller_override_applied: boolean;
  };
  generation_id: UUID;
  workspace_id: UUID;
  brand_id: UUID;
}

type AICapability =
  | 'image_generation'
  | 'image_edit'
  | 'vision_qa'
  | 'vision_extraction'
  | 'embedding'
  | 'text_generation'
  | 'dspy_compile';
```

---

## 5. API Contract

### 5.1 tRPC procedure: `artDirector.routeGeneration`

| Field | Locked Contract |
|---|---|
| **API style** | tRPC procedure (replacing v3.0 spec's tRPC contract with ZCBR-compliant fields) |
| **Procedure name** | `artDirector.routeGeneration` |
| **Auth** | Required. Session token must resolve to a workspace_id that matches `request.workspace_id`. Cross-workspace requests rejected with `FORBIDDEN`. |
| **Idempotency** | Not required (routing decisions are deterministic given identical inputs; caller may safely retry). Recommended: callers pass a consistent `generation_id` per logical operation so retries produce identical decisions. |
| **Rate limit** | 100 requests per workspace per minute (sliding window). Exceeds → 429 `TOO_MANY_REQUESTS`. |
| **Execution timing** | Synchronous. p95 target under 50ms. |
| **Side effects** | (a) OTel span emission; (b) PostHog event emission; (c) R37 MAAX brand signal cache touch (read-only, no writes); (d) Optional Sentry info/warn events on degraded paths. NO writes to `image_generations`, `token_usage_logs`, `rlhf_events`, or `pattern_recipes`. |

**Request schema** (Zod-validated):

```ts
interface ArtDirectorRequest {
  workspace_id: UUID;
  brand_id: UUID;
  generation_id: UUID;
  intent: ArtDirectorIntent;       // locked enum from §4.1
  request_origin: 'studio_ui' | 'learning_engine' | 'composer_queue' | 'inngest_function' | 'manual_api';
  user_initiated: boolean;
  source_image_url?: string;       // required when intent in edit_image/remix_image/evaluate_image_quality/extract_pattern_from_image/embed_image_for_search
  recipe_id?: UUID;
  text_input?: string;
  layer_inputs?: {
    product?: ProductLayerInput;
    scene?: SceneLayerInput;
    typography?: TypographyLayerInput;
  };
  caller_tier_preference?: 1 | 2 | 3;
  caller_optimize_for?: 'quality' | 'cost';
  caller_excluded_providers?: string[];
  inngest_run_id?: string;
}
```

**Response schemas**:

- `200 OK` with `RoutingDecision` (shape per §4.6)
- `400 BAD_REQUEST` `ART_DIRECTOR_INVALID_INPUT` — Zod parse failed
- `400 BAD_REQUEST` `ART_DIRECTOR_MISSING_INTENT_FIELD` — intent-specific required field missing (e.g. `source_image_url` for `edit_image`)
- `400 BAD_REQUEST` `ART_DIRECTOR_UNKNOWN_INTENT` — intent value not in locked enum (should be caught by Zod; this code surfaces if Zod is bypassed)
- `403 FORBIDDEN` — workspace_id mismatch with session
- `429 TOO_MANY_REQUESTS` — rate limit exceeded
- `500 INTERNAL_SERVER_ERROR` `ART_DIRECTOR_INTERNAL` — unexpected error; Sentry critical

**Status codes enumerated:** 200, 400, 403, 429, 500. No 404 (this endpoint does not lookup external resources that could 404). No 503 (R37 MAAX unavailability is handled gracefully, not surfaced as service unavailable).

### 5.2 Direct module import

For server-side callers (Inngest functions, composer queue handlers) that bypass tRPC:

```ts
import { routeArtDirectorRequest } from '@viyo/worker/lib/art-director/route-request';

const decision = await routeArtDirectorRequest(request);
```

Same request schema. Same response shape. No HTTP envelope. Same side effects.

---

## 6. Code components (file locations + responsibilities)

| Component | Repo path | Responsibility | Tests |
|---|---|---|---|
| Schema definitions | `packages/shared/src/schemas/art-director-routing.ts` | Zod schema for `ArtDirectorRequest`, types for `RoutingDecision`, locked intent enum | Schema parse tests; enum locked tests |
| Mapping tables | `packages/shared/src/schemas/art-director-routing-tables.ts` | Intent → capability + downstream_skill data tables | Table completeness tests; all 13 intents covered |
| Main routing function | `apps/worker/src/lib/art-director/route-request.ts` | `routeArtDirectorRequest(request)` — top-level orchestrator | All 25 mandated tests per `art-director-routing` skill §10 |
| Tier resolver | `apps/worker/src/lib/art-director/tier-resolver.ts` | `computeBaseTier`, `applyIntentTierOverrides`, `applySubscriptionTierCeiling` | Tier resolution matrix tests; ceiling enforcement tests |
| Brand signal client | `apps/worker/src/lib/maax/brand-signals.ts` | `getMaaxBrandSignals(brand_id, workspace_id)` with tolerant fallback | Happy path; unavailable; malformed; empty signals |
| Billable computer | `apps/worker/src/lib/art-director/billable.ts` | `computeBillable(request)` per §4.5 rules | All 13 intents × user_initiated true/false × origins matrix |
| tRPC procedure | `apps/server/src/trpc/art-director.ts` | tRPC route wrapping `routeArtDirectorRequest` with auth + rate limit | tRPC integration tests; auth tests; rate limit tests |
| OTel/PostHog/Sentry hooks | Inline in `route-request.ts` and helpers | Observability emission per §10 | Trace correlation tests; event emission shape tests |

The `art-director-routing` skill in Portal (S13) is the Kimi-consumed authoring guide for these components. The skill's §11 Reviewer §9 Gate validation checklist enforces this contract in code review.

---

## 7. Failure modes (per operation)

| Operation | Failure mode | Trigger | Error category | Response | Rollback | Retry | Logging |
|---|---|---|---|---|---|---|---|
| Input validation | `ART_DIRECTOR_INVALID_INPUT` | Zod parse fails | validation | 400 to caller | None (no side effects yet) | Caller corrects + retries | Sentry warn; PostHog event |
| Intent-required-field check | `ART_DIRECTOR_MISSING_INTENT_FIELD` | e.g. `edit_image` without `source_image_url` | validation | 400 | None | Caller corrects + retries | Sentry warn |
| Brand signal fetch | R37 MAAX unavailable | Service down or timeout | dependency | Continue with empty signals | None (graceful degradation) | Auto (transparent to caller) | Sentry info; routing_rationale records `brand_override_applied: false` |
| Brand signal fetch | Malformed response | Schema validation fails on MAAX payload | dependency | Treat as empty signals | None | Auto | Sentry warn |
| Subscription tier missing | Brand has no D8 record | New brand or data drift | dependency | Default to tier 1 (most restrictive) | None | None (manual data fix required) | Sentry warn for admin follow-up |
| Intent unknown at runtime | `ART_DIRECTOR_UNKNOWN_INTENT` | Bypassed Zod with invalid value | logic | 400 + Sentry critical | None | None (code/data drift) | Sentry critical |
| Lock 19 violation at runtime | `LOCK_19_VIOLATION_RUNTIME` | Static grep should catch at CI; if bypassed | logic | Throw; abort | None | None | Sentry critical (grep bypass indicator) |
| Auth failure | 403 | Session workspace mismatch | auth | 403 | None | Caller re-auth | Sentry info |
| Rate limit | 429 | Workspace exceeds 100 req/min | rate | 429 | None | Caller backs off | Counter increment, no Sentry |
| OTel emission failure | Observability backend down | OTel collector unreachable | observability | Continue silently | None (decision still returns) | Auto (collector reconnects) | Local log only |
| PostHog emission failure | Analytics down | PostHog service issue | observability | Continue silently | None | Auto | Local log only |

---

## 8. Edge cases

| Case | Handling |
|---|---|
| Empty request | Zod rejects on missing required fields → `ART_DIRECTOR_INVALID_INPUT` |
| Cross-workspace request | Session workspace_id mismatches `request.workspace_id` → 403 FORBIDDEN; no signal fetch attempted |
| Concurrent decisions for same generation_id | Each decision is pure-function deterministic given identical inputs; concurrent calls produce identical decisions; no DB state involved; no race |
| Brand on subscription tier 1 requesting Tier 1 intent | Ceiling downgrades to Tier 2; routing_rationale records the downgrade |
| Brand with zero R37 MAAX history | preferred_providers + excluded_providers default to empty; Provider Registry falls back to its default tier resolution |
| Caller passes `caller_tier_preference: 3` for `generate_hero_image` | Caller override wins; resolved_tier = 3; routing_rationale records override; user gets a fallback-tier hero image (expected; caller knew what they were doing) |
| Caller excluded list overlaps with brand excluded list | Lists deduplicated; final excluded array has unique entries |
| Recipe_id provided but recipe does not exist at downstream lookup | Routing succeeds (recipe resolution is downstream concern, not routing concern); downstream `pattern-cache-lookup` will return `IMAGE_GEN_RECIPE_NOT_FOUND` |
| R37 MAAX timeout exactly at 100ms boundary | Timeout fires; treat as unavailable; degraded path; routing still returns p95 under 100ms total |
| Intent valid but downstream skill not yet authored | RoutingDecision returns the downstream_skill string; caller falls back to inline execution; documented in §13 open items |

---

## 9. Concurrency

| Scenario | Handling |
|---|---|
| 100 concurrent routing calls (different generation_ids) | Independent stateless functions; no shared mutable state; no contention; all 100 succeed |
| 100 concurrent routing calls (same generation_id) | Pure-function determinism; all 100 produce identical decisions; no race; idempotency is a property of input determinism |
| Routing call vs concurrent R37 MAAX write (signal aggregation updating brand preferences) | Read-side cache eventual consistency acceptable; routing gets either pre- or post-update signals; no race condition; downstream behavior eventually converges |
| Routing call during workspace deletion | Workspace deletion would cascade to MAAX signal records; in-flight routing call may see partial state; auth check in tRPC layer catches this with 403 once session invalidates |
| High burst → rate limit (>100/min) | 429 with retry-after header; caller respects header; no state corruption |

---

## 10. Observability

### 10.1 OTel spans

Span name: `viyo.art_director.route`

Attributes:
- `viyo.workspace_id` (UUID string)
- `viyo.brand_id` (UUID string)
- `viyo.generation_id` (UUID string)
- `viyo.intent` (string from locked enum)
- `viyo.capability` (string from R29 v2 §3.2 enum)
- `viyo.resolved_tier` (1, 2, or 3)
- `viyo.optimize_for` ('quality' or 'cost')
- `viyo.billable` (boolean)
- `viyo.downstream_skill` (string)
- `viyo.brand_override_applied` (boolean)
- `viyo.caller_override_applied` (boolean)
- `viyo.maax_available` (boolean — false on degraded path)
- `viyo.subscription_tier` (1-5)
- `viyo.duration_ms` (number)

### 10.2 PostHog events

Event name: `art_director.routed`

Properties: same as OTel attributes plus `distinct_id` (workspace_id) and `timestamp`.

### 10.3 Sentry rules

| Level | Trigger |
|---|---|
| info | R37 MAAX unavailable; brand subscription tier missing |
| warn | Validation failure; MAAX malformed response |
| critical | Unknown intent at runtime; Lock 19 violation at runtime; ART_DIRECTOR_INTERNAL |

Every Sentry event must include tags: `generation_id`, `workspace_id`, `brand_id`, `intent` (when known).

### 10.4 Structured log fields

Every log entry from routing code includes:
- `service: 'art-director'`
- `generation_id`
- `workspace_id`
- `brand_id`
- `intent`
- `status` (success/error/degraded)

Generation ID propagation: a single Studio UI click produces OTel spans across `viyo.art_director.route` → `viyo.image_generation` → `viyo.rlhf_event.emit`, all sharing `generation_id`.

### 10.5 Alerts

| Alert | Trigger | Severity |
|---|---|---|
| Degraded routing rate high | More than 5% of routing decisions in a 15-minute window run with `maax_available=false` | warn (paging system of operator's choice; no specific tool hardcoded) |
| Unknown intent occurrences | Any `ART_DIRECTOR_UNKNOWN_INTENT` event | critical (paging system of operator's choice) |
| Lock 19 runtime violations | Any `LOCK_19_VIOLATION_RUNTIME` event | critical |
| Rate limit exhaustion | More than 1% of workspaces hit rate limit in a 1-hour window | info |

The v3.0 spec's PagerDuty-specific alert is replaced with tool-agnostic alert categories. Operator chooses paging tool.

---

## 11. Tests

Per the `art-director-routing` skill v1.0 §10 (Portal storage). 25 mandatory tests are enumerated there and apply to the components in §6. Summary categories:

1. Each of 13 intents maps to expected capability + downstream_skill
2. Tier resolution per origin + user_initiated matrix
3. Caller overrides win
4. Subscription tier ceiling enforced
5. Brand override surfacing (preferred + excluded)
6. R37 MAAX unavailable handling
7. Billable computation across user_initiated + intent + origin combinations
8. Quality threshold overrides per intent
9. Unknown intent rejection
10. Cross-tenant isolation
11. Generation ID propagation through OTel + PostHog
12. Concurrent routing (pure function determinism)
13. Lock 19 + Lock 8 grep static tests

The skill's test list (25 items) is the canonical test list. This T-spec does not re-enumerate beyond this summary.

---

## 12. Acceptance criteria (mechanical / binary)

This v2 spec is considered shipped when:

- [ ] Repo file at `/docs/architecture/art-director-routing-suite.md` replaced with this content via Manus directive
- [ ] ZCBR Status header present and reads `PASSED 2026-05-12 by Architect Claude self-validation`
- [ ] All Phase 1 skills (S13-S16) cite this T-spec as authority where they currently cite R24/R29 directly for routing-decision concerns (skill version bumps acceptable but not blocking — skills may continue to operate against this spec as authored)
- [ ] CI grep on the repo confirms no hardcoded provider/model name string literals in `apps/worker/src/lib/art-director/` or `apps/server/src/trpc/art-director.ts` (Lock 19)
- [ ] CI grep on the repo confirms no `token_usage_logs.insert` reachable from `apps/worker/src/lib/art-director/` or the tRPC art-director route (Lock 8)
- [ ] CI grep confirms `workspace_id` filter present on every R37 MAAX query
- [ ] R-Spec Audit Table v1.1 updated to mark B-XC.06 / T46 status as PASS (was REWRITE)

The v3.0 supersession is complete when this v2 spec ships. The audit table row 27 transitions from "REWRITE" to "PASS" status.

---

## 13. Migration plan (v3.0 → v2)

| Concern | v3.0 (current repo state) | v2 (target state) | Migration step |
|---|---|---|---|
| Scoring formula | 4D Quality/Cost/Freshness/Tier formula in routing code | Scoring is registry-side per R29 v2 §5.4; not in routing | Remove formula from routing code; Provider Registry owns resolution |
| `selectedModel` return | Hardcoded model name returned | `capability` + `tier` + opaque brand preferences | Adapter shim: if any caller depends on v3.0 response shape, provide deprecation path; new callers use RoutingDecision |
| `atomic_token_deduction` direct call | Called from routing | Removed; downstream Provider Registry handles per `billable` flag | Remove call from routing; verify Provider Registry implements per R29 v2 §9 |
| Tier numbering | Tier 1 = direct frontier | Tier 1 = aggregators (per VVOW) | Code change; CI test on tier semantics |
| Feature flag `enable_art_director_router` | Existed in v3.0 | Continues to exist; controls full disable | No change |
| Rollback path | Disable flag → all requests to default model Tier 1 | Disable flag → all requests bypass routing, go to Provider Registry default | Update rollback semantics; document for ops |

No data migration required. T46 is a routing layer; it has no persistent state of its own.

**Concrete rollout sequence:**

1. Architect commits this T46 v2 spec to repo at `/docs/architecture/art-director-routing-suite.md` (via Manus REWRITE directive in next turn)
2. R-Spec Audit Table v1.1 minor update: B-XC.06 status REWRITE → PASS
3. Future Bullet implements `apps/worker/src/lib/art-director/` + `apps/server/src/trpc/art-director.ts` per this spec, citing T46 v2 as authority and consuming the `art-director-routing` skill
4. Feature flag `enable_art_director_router` toggled on by ops once implementation lands and CI green
5. Rollback: flip flag off; requests bypass routing and call Provider Registry default

---

## 14. Open items

1. **R37 MAAX schema ratification.** This spec consumes R37 MAAX via tolerant interface. When R37 ratifies to ZCBR PASSED (audit table JIT trigger at B-1B.04), T46 may bump to v2.1 if signal schema changes meaningfully.
2. **Future downstream skills not yet authored.** Intents `extract_pattern_from_image`, `evaluate_image_quality`, `embed_image_for_search`, `embed_text_for_search`, `generate_text_for_email`, `compile_prompt_template` route to future skills (`vision-qa`, `embedding-generation`, `text-generation`, `dspy-compile`) that don't yet exist in Portal. Consumers fall back to inline execution until those skills are authored. Routing decision shape unchanged.
3. **Multi-arm bandit routing optimization.** Current routing is rule-based per §4.2 matrix. Future enhancement could adapt tier selection per observed quality/cost trade-offs. Out of v2 scope.
4. **A/B routing experiments.** Caller-side `caller_tier_preference` supports manual experiments today; managed A/B framework is future scope.
5. **D8 subscription tier source-of-truth path.** This spec assumes `brand_signals.subscription_tier` returns current tier. The upstream subscription state management is R31 (Brand Vault) + billing infrastructure scope. T46 consumes the value; does not produce it.
6. **Tier 4-5 capability ceiling clarification.** D8 has 5 tiers but routing currently uses Tier 1/2/3 only (matching R29 v2 capability tiers). The mapping from D8 subscription tier 4-5 to routing capability tier is "no additional capability beyond tier 3 in current Phase 1 scope; subscription tiers 4-5 unlock other features (volume, priority queues) handled outside the routing layer."
7. **Caller-provided exclusion legitimacy.** This spec accepts `caller_excluded_providers` from any caller. Future hardening: signed exclusion list with reason codes to prevent abuse. Out of v2 scope.
8. **Routing decision telemetry retention.** PostHog event retention per workspace; not specified here. R20 v2 / R23 Cost Engine scope.

---

## 15. Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion audit log.

**Version triggers:**
- Major (v3): breaking change to RoutingDecision shape, intent enum semantics, or tier resolution logic
- Minor (v2.x): additive (new intent values, new tier override rules, new R37 signal types consumed, refined alerts)
- Patch (v2.x.y): clarifications, typo fixes, citation updates as R-specs version

**Re-validation:** Every 180 days per ZCBR HEADER_STALE rule, or immediately when any cited spec (R24 v2, R29 v2, R20 v2) bumps minor or major version.

**Companion skill alignment:** The four Phase 1 skills (S13-S16) implement this contract. When this spec bumps minor, those skills may need version bumps. Architect coordinates skill version updates with T46 version updates.

---

*End of T46 Art Director Routing Suite v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
