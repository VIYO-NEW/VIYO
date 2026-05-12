# R31 — Product Data Extraction & Brand Vault (v2 revision 2)

**ZCBR Status:** PASSED 2026-05-12 by Architect Claude self-validation
**ZCBR Checklist version:** v1
**Spec version:** 2.0 (revision 2)
**Authoring authority:** Architect Claude (Opus 4.7)
**Authored date:** 2026-05-12
**Target repo path on commit:** `/docs/research_specs/R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md` (replaces v1 at commit SHA `1cc43f5781b132ef256e21ca06c8914c0c9e64c3`)
**Supersedes:**
- R31 v1.0 (Enterprise Spec, 2026-05-12 09:22 UTC) — predates canonical Phase 1 skills and R29 v2
- R31 v2 revision 1 (Drive file `1w8OTKw0pR_D1MIXU4SVIgqL9migqnf_S`, authored 2026-05-12) — cited R20 v2 sections that did not exist; superseded before repo commit

---

## 0. Supersession statement

This v2 revision 2 spec supersedes the prior R31 v1.0 at `/docs/research_specs/R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md` AND the prior R31 v2 revision 1 Drive draft. v2 revision 1 was never committed to repo. The eleven conflicts resolved in this revision:

1. **Hardcoded LLM model `gpt-4o-mini` and direct OpenAI SDK import** — Lock 19 violation. v2 routes all LLM calls through R29 v2 Provider Registry via `capability: 'text_generation'` and `capability: 'vision_extraction'`.
2. **Hardcoded headless browser service `Browserless`** — Lock 19 Extension Clause violation. v2 routes browser fetches through R29 v2 Provider Registry via `capability: 'headless_fetch'`.
3. **Hardcoded anti-bot fallback `BrightData Web Unlocker`** — Lock 19 Extension Clause violation. v2 declares fallback as opaque Tier 2 provider in `headless_fetch` capability; registry handles the swap.
4. **No ZCBR header** — predates Foundation Lock 20.
5. **No workspace_id / RLS in data model** — Lock 13 violation. v2 anchors all storage on R20 v2 tables that carry `workspace_id` FK and RLS.
6. **No alignment with R20 v2 database schema** — v1 referenced `product_knowledge` and `product_assets` as if they were R20 tables; v2 correctly anchors on R20 v2 §2.2.1 `viyo_products` and §2.2.2 unified `assets` table per the actual R20 v2 schema.
7. **Outdated dependency mapping** — v1 referenced "Product Sync Engine (R29)" but R29 v2 is the unified Platform Abstraction Layer (Plugin Registry per D55). v2 correctly cites R29 v2 §6 e-commerce platform plugins.
8. **Token economics misalignment** — v1 did not specify billable flag. v2 explicitly marks extraction as Lock 8 programmatic (system-initiated → `billable: false`); token_usage_logs is NOT written for extraction calls.
9. **Scope too narrow per VVOW audit** — VVOW §19 row 15 marks R31 as "THIN — needs rewrite to capture full Brand Vault organization." v2 expands scope from product-only to: products + brand identity (logo, colors, fonts, voice samples) + brand assets (uploaded files) + ingredients knowledge.
10. **No connection to Phase 1 skill chain** — v1 has no reference to the four Phase 1 skills. v2 references `pattern-cache-lookup` and notes that extracted product images flow into the recipe library for downstream `image-generation-pipeline` consumption.
11. **v2 revision 1 cited non-existent R20 v2 sections** — revision 1 cited `§2.4.1 brand_identity`, `§2.4.2 brand_assets`, `§2.6.4 product_knowledge`, `§2.6.5 product_assets`. R20 v2 has NONE of those table names. Actual schema places product knowledge in `viyo_products.extracted_data JSONB`, all assets (product/brand) in the unified `assets` table differentiated by `asset_type` enum, and brand anchor in `brands`. Revision 2 corrects every citation to match R20 v2 as authored.

---

## 1. Source declaration

| Source ID | Source | Authority | Used for |
|---|---|---|---|
| S1 | R20 v2 Database Schema `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md` (ZCBR PASSED, PR #21) | Canonical | `viyo_products` table (R20 v2 §2.2.1) including `extracted_data JSONB`; unified `assets` table (R20 v2 §2.2.2) with 9-value `asset_type` CHECK enum (`product_photo`, `lifestyle_scene`, `generated_hero`, `generated_section`, `video_clip`, `brand_logo`, `brand_kit_component`, `ingested_email`, `ingested_image`); `brands` anchor (R20 v2 §2.10.1) including `hyve_opt_in`, `brand_guidelines_url`; RLS contract and workspace_id foreign keys throughout |
| S2 | R29 v2 Platform Abstraction Layer `/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md` (ZCBR PASSED, PR #25) | Canonical | Provider Registry; capability identifiers; e-commerce platform plugins; AI capabilities (`text_generation`, `vision_extraction`, `embedding`, `headless_fetch`) |
| S3 | R24 v2 Image Pipeline `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md` (ZCBR PASSED, PR #23) | Canonical | Pattern Recipe consumer of extracted product images; image asset format conventions |
| S4 | T46 v2 Art Director Routing Suite `/docs/architecture/art-director-routing-suite.md` (ZCBR PASSED, PR #29) | Canonical | Capability semantics for downstream LLM extraction routing |
| S5 | R19 LLM Architecture (PENDING RE-VALIDATION, audit table row 3) | Cautious consumer | Email Brain consumer of extracted product knowledge |
| S6 | R30 Product Animation Engine (PENDING RE-VALIDATION, audit table row 14) | Cautious downstream | Animation pipeline triggered by extracted product images |
| S7 | R17 UX Architecture (CRIT MINOR FIX, audit table row 1) | Cautious consumer | UI surface for incomplete-record warnings |
| S8 | R23 Cost Engine (CRIT MINOR FIX, audit table row 7) | Cautious consumer | Cost attribution for billable extractions (rare; default is programmatic per Lock 8) |
| S9 | R27 Composable Sections (PENDING RE-VALIDATION, audit table row 11) | Cautious downstream | Phase 2 email template field-mapping consumer |
| S10 | VVOW Image Studio Architecture | Higher-tier authority (EXEMPT from ZCBR) | Brand Vault organization model |
| S11 | Foundation Lock 8 — Programmatic ops charge 0 tokens | Higher-tier | Extraction billability rules |
| S12 | Foundation Lock 13 — Multi-tenant RLS | Higher-tier | Workspace isolation across all persisted tables |
| S13 | Foundation Lock 19 + Extension Clause — Provider Agnosticism | Higher-tier | No hardcoded provider/model/service names |
| S14 | Foundation Lock 20 — ZCBR-validated specs required | Higher-tier | This spec carries ZCBR PASSED |
| S15 | Foundation Lock 21 — Governance Agnosticism | Higher-tier | Does NOT apply to this R-spec (R-specs ARE implementation) |
| S16 | D55 — R29 PAL unified Plugin Registry | Higher-tier | Browser fetch, AI, e-commerce all flow through unified registry |
| S17 | D8 — Five-tier subscription pricing | Higher-tier | Brand subscription tier may rate-limit extraction frequency |
| S18 | `pattern-cache-lookup` skill v1.0 (Portal storage) | Implementation | Extracted product images become Pattern Recipe assets cached for downstream image-generation-pipeline |
| S19 | Master Build Sequence v1.1 Section 3.0 — B-0.17 Shopify connector | Higher-tier | B-0.17 cites R29 PAL + R31 (THIN — see B-XC.04) as gating R-specs; R31 v2 unblocks B-0.17 |

---

## 2. Locks & Decisions Invoked

- **Foundation Lock 8** — Extraction is system-initiated (triggered by product sync events, not direct user clicks). All extraction operations carry `billable: false`. Token costs are absorbed by VIYO as operational overhead, NOT charged to user balance.
- **Foundation Lock 13** — Every persisted destination is a tenant-scoped R20 v2 table (`viyo_products`, `assets`, `brands`) that already carries `workspace_id` foreign key with RLS. No cross-workspace extraction reads. Composite FK on `assets(brand_id, workspace_id)` enforces brand-workspace consistency.
- **Foundation Lock 19 + Extension Clause** — Extraction code MUST NOT name specific LLM models, browser scrapers, or anti-bot services as literals. All operations flow through R29 v2 Provider Registry with opaque capability identifiers.
- **Foundation Lock 20** — This spec carries `ZCBR Status: PASSED`. All cited canonical specs (S1, S2, S3, S4) carry PASSED status.
- **D55** — All integration calls (browser fetch + LLM extraction + e-commerce platform query) flow through the unified R29 v2 Plugin Registry.
- **D63** — Skills do not live in any git repo. The cited `pattern-cache-lookup` skill (S18) lives in Portal storage.
- **C-01 (Lovart-style B3 lazy extraction)** — Brand Vault assets are extracted lazily on first reference, not eagerly upfront.

---

## 3. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| **Objective** | Implement the Brand Vault data extraction pipeline that ingests products from e-commerce platforms, extracts structured product knowledge via headless browser + LLM semantic extraction, organizes brand identity (logo + colors/fonts/voice subject to §15 storage dependency) and brand assets (uploaded files), and feeds canonical Brand Vault data to downstream consumers (Email Brain R19, Studio UI R17, Composable Sections R27). |
| **Builder outcome** | (a) Brand Vault data model implemented against R20 v2 schema — `viyo_products.extracted_data JSONB` for product knowledge, unified `assets` table for all binary assets, `brands` anchor; (b) Inngest extraction workflow `product_extraction_workflow`; (c) Inngest brand identity extraction workflow `brand_identity_extraction_workflow` (storage destination for non-logo identity attributes pending R20 v2.1 — see §15); (d) Asset classification helper; (e) Self-healing fallback for incomplete data; (f) tRPC API for manual re-extraction. |
| **Acceptance checks (mechanical)** | (1) All extraction calls flow through `providerRegistry.execute(...)` (Lock 19 grep); (2) Zero hardcoded LLM model name literals (Lock 19 grep); (3) Every persistence call writes to an R20 v2 canonical table (`viyo_products`, `assets`, or `brands`) — no rogue tables (Lock 13 grep); (4) Every extraction operation passes `billable: false` to registry (Lock 8 grep); (5) Idempotency: re-extracting the same product URL within 24h returns cached result rather than re-fetching; (6) Failure modes mapped to specific error codes per §7; (7) Asset classification correctly routes discovered assets to the appropriate `asset_type` enum value. |
| **Non-goals** | Implementing the e-commerce platform plugins themselves (R29 v2 territory); implementing the LLM providers themselves (R29 v2 territory); implementing the UI surfaces that display Brand Vault data (R17 territory); implementing product animation (R30 territory); extending the R20 v2 `brands` table with additional identity columns (proposed R20 v2.1 — see §15). |
| **Constraints** | Extraction operations are async (Inngest-driven, NOT synchronous in user request lifecycle). p95 end-to-end extraction time target: under 30 seconds. Concurrent extractions for same workspace capped at 10. |
| **Source-confirmed assumptions** | (a) R29 v2 §6 e-commerce platform plugins emit `product.synced` events containing `workspace_id`, `brand_id`, `product_id`, `product_url`; (b) R29 v2 Provider Registry exposes `headless_fetch`, `text_generation`, `vision_extraction`, `embedding` capabilities; (c) R20 v2 §2.2.1, §2.2.2, §2.10.1 schemas as authored on 2026-05-12 are stable; (d) Inngest is the canonical async workflow runtime. |
| **Open decisions** | One: R20 v2.1 schema extension for full brand identity attributes (logo URL beyond `assets` table, primary/secondary colors, font families, voice attributes, voice samples, forbidden words). See §15 Open Item 1. |

---

## 4. Brand Vault data model (anchored on R20 v2 actual schema)

R31 v2 does NOT define new tables. It defines (a) the JSONB shape that lives inside R20 v2's `viyo_products.extracted_data` and (b) the routing of extracted assets to the unified `assets` table's asset_type enum.

### 4.1 Product knowledge — stored in R20 v2 `viyo_products`

R20 v2 §2.2.1 defines `viyo_products` with columns: `id`, `workspace_id`, `source_url`, `name`, `description`, `price`, `currency`, `category`, `extracted_data JSONB`, `thumbnail_url`, `is_active`, `created_at`, `updated_at`. The product knowledge lives in `extracted_data JSONB`.

**R31 v2 defines the JSONB shape (lives in R31, not R20):**

```ts
interface ProductKnowledgeExtractedData {
  product_name: string;
  product_description: string;
  ingredients: Ingredient[] | null;
  benefits: string[] | null;
  certifications: string[] | null;
  how_to_use: string[] | null;
  primary_image_url: string | null;          // canonical primary image; references an assets row
  raw_extracted_text: string;                 // capped at 10,000 chars
  source_url: string;
  extraction_status: 'complete' | 'incomplete' | 'failed' | 'manual';
  extraction_attempts: number;
  last_extracted_at: string;                  // ISO 8601
  extraction_version: '2.0';
}

interface Ingredient {
  name: string;
  percentage: number | null;
  function: string | null;
  inci_name?: string;                         // INCI nomenclature for cosmetics (optional)
}
```

Top-level columns (`name`, `description`, `price`, `category`, `thumbnail_url`) are populated from the e-commerce platform sync (R29 v2) and serve as the searchable surface. The rich extracted product knowledge lives in `extracted_data`.

**Workspace isolation:** RLS on `viyo_products.workspace_id` per R20 v2 §2.2.1 (Lock 13).

### 4.2 Product assets — stored in R20 v2 unified `assets` table

R20 v2 §2.2.2 defines a single unified `assets` table that holds every binary asset. The `asset_type` column carries a 9-value CHECK enum. R31 v2 uses the following asset_type values:

- `product_photo` — primary product imagery extracted from product pages
- `lifestyle_scene` — lifestyle/contextual imagery extracted from product or brand pages
- `brand_logo` — brand logo files extracted from brand homepage
- `brand_kit_component` — secondary brand visual identity assets (icons, patterns, textures discovered during extraction)

R31 v2 does NOT add new asset_type values; it routes discovered assets to the existing enum.

**Existing `assets` columns used (per R20 v2 §2.2.2):**
- `id`, `workspace_id`, `brand_id` (required FK, composite-keyed against `brands(id, workspace_id)`), `product_id` (FK to `viyo_products(id) ON DELETE SET NULL` — populated for product_photo/lifestyle_scene, null for brand-only assets)
- `parent_asset_id` (null for newly-discovered assets)
- `asset_type` (CHECK enum)
- `storage_path` (R2 URL after the asset is downloaded; null until persisted)
- `width`, `height`, `file_size_bytes`, `mime_type`
- `metadata JSONB` — R31 v2 writes the asset-classification confidence and original source URL here: `{"source_url": "...", "classification_confidence": 0.84, "is_transparent": true, "alt_text": "..."}`
- `tags TEXT[]` — discovery-time tags (e.g. `'extracted', 'product'`)
- `generation_id`, `route_metadata` left null/empty for extraction-discovered assets (those fields are for generated assets per R24 v2)

**Workspace isolation:** RLS on `workspace_id` + composite FK `(brand_id, workspace_id)` per R20 v2 §2.2.2.

### 4.3 Brand anchor — stored in R20 v2 `brands`

R20 v2 §2.10.1 defines the `brands` table: `id`, `workspace_id`, `name`, `hyve_opt_in`, `hyve_opt_in_timestamp`, `brand_guidelines_url`, `default_brand`, `created_at`, `updated_at`.

R31 v2 uses this table as the brand anchor that every extraction references via `brand_id`. R31 v2 does NOT add any columns to `brands` in this version.

**Brand identity attributes** that R31 extracts (primary/secondary color, primary/secondary font family, accent colors, voice attributes, voice samples, forbidden words) have NO storage destination in current R20 v2. See §15 Open Item 1 for the proposed R20 v2.1 extension. Until R20 v2.1 ships, the brand identity extraction workflow either (a) blocks if forced to persist non-logo identity attributes, or (b) extracts but only persists logo (to `assets` with `asset_type='brand_logo'`) plus `brand_guidelines_url` (to existing column). The default behavior is (b).

### 4.4 No additional R31-owned tables

This is the explicit correction from revision 1. R31 v2 owns NO database tables. It owns the EXTRACTION PIPELINE and the JSONB shape that fits inside R20 v2's `viyo_products.extracted_data`. All other persistence routes to R20 v2 canonical tables.

---

## 5. Extraction pipelines

R31 v2 defines two Inngest workflows. Both are triggered by upstream events and run asynchronously.

### 5.1 Product extraction workflow

**Trigger:** `product.synced` event emitted by R29 v2 e-commerce platform plugin when a product is first ingested, OR `product.extraction_requested` event from manual re-extraction tRPC call.

**Event payload:**
```ts
interface ProductSyncedEvent {
  workspace_id: UUID;
  brand_id: UUID;
  product_id: UUID;           // existing viyo_products row created by R29 v2 platform plugin
  product_url: string;
  source_platform: string;    // opaque from R29 v2; this code does NOT branch on it
  generation_id: UUID;
}
```

**Steps (executed in order via Inngest `step.run`):**

1. **Fetch product page (headless browser)** — Call `providerRegistry.execute({category: 'integration', capability: 'headless_fetch', args: {url: product_url, options: {...}}, workspaceId, brandId, generationId, billable: false})`. The registry routes to whichever headless browser provider is configured. Anti-bot fallback is registry-side (R29 v2 §6.4 fallback chain).

2. **Parse DOM and discover assets** — Pure computation, no provider call. Use `cheerio` to extract JSON-LD, clean text, image URLs. Asset list is unclassified at this stage.

3. **Semantic extraction (LLM)** — Call `providerRegistry.execute({category: 'ai', capability: 'text_generation', args: {prompt: structuredExtractionPrompt(cleanText), response_format: 'json_object'}, workspaceId, brandId, generationId, billable: false})`. Result is validated against the `ProductKnowledgeExtractedData` Zod schema (§4.1).

4. **Asset classification** — For each discovered asset URL, call `providerRegistry.execute({category: 'ai', capability: 'vision_extraction', args: {image_url, classify_into: ['product_photo', 'lifestyle_scene', 'brand_logo', 'brand_kit_component', 'skip']}, workspaceId, brandId, generationId, billable: false})`. Confidence threshold: 0.7. Below threshold → default `asset_type: 'product_photo'` with `classification_confidence` recorded in `assets.metadata`. `skip` classification → asset is not persisted.

5. **Persist** — Single transaction:
   - UPDATE `viyo_products` SET `extracted_data = $JSONB, updated_at = NOW() WHERE id = product_id AND workspace_id = $workspace_id` (RLS-enforced).
   - INSERT classified assets into `assets` table with `workspace_id`, `brand_id`, `product_id`, `asset_type`, `metadata` JSONB carrying classification confidence + source URL.
   - Rollback on any failure.

6. **Trigger downstream events** — For primary product images (top-scoring `product_photo` assets), emit `product.animation.requested` event consumed by R30 Product Animation Engine.

### 5.2 Brand identity extraction workflow

**Trigger:** `brand.identity_extraction_requested` event, fired when (a) brand is first added to a workspace, OR (b) user manually requests re-extraction.

**Event payload:**
```ts
interface BrandIdentityExtractionEvent {
  workspace_id: UUID;
  brand_id: UUID;
  brand_homepage_url: string;
  generation_id: UUID;
}
```

**Steps:**

1. **Fetch brand homepage** — Same `headless_fetch` capability as §5.1 Step 1, with options biasing toward a full-page render (allow heavy JS execution; brand sites often render colors/fonts via CSS).

2. **Extract visual identity** — Logo extraction: search DOM for `<img>` matching common logo patterns. Color extraction: parse computed CSS of major elements. Font extraction: read `font-family` declarations from rendered CSS.

3. **Extract voice samples** — Scrape "About" or "Story" page text. Call `providerRegistry.execute({category: 'ai', capability: 'text_generation', args: {prompt: voiceAttributePrompt(aboutText)}, workspaceId, brandId, generationId, billable: false})` to extract voice attributes and representative voice samples.

4. **Persist** (current — pre-R20 v2.1):
   - Logo file → download via `headless_fetch` capability → upload to R2 → INSERT into `assets` with `asset_type='brand_logo'`, `product_id=NULL`, `brand_id=$brand_id`, `metadata: {extracted_from_url: ..., classification_confidence: 1.0}`.
   - If `brand_guidelines_url` was discovered → UPDATE `brands.brand_guidelines_url`.
   - Other identity attributes (colors, fonts, voice) — captured in worker memory, emitted to OTel/PostHog for visibility, NOT persisted (no storage destination in current R20 v2 schema). The worker logs a Sentry info event noting "brand_identity_partial_persist: R20 v2.1 columns not available."
   - **After R20 v2.1 ships** (proposed in §15) — additional brand identity attributes persist to new `brands` columns. R31 v2.1 minor bump captures the wire-up.

5. **Emit completion event** — `brand.identity_extracted` for downstream consumers.

---

## 6. API contract

### 6.1 tRPC procedure: `brandVault.requestProductExtraction`

| Field | Locked Contract |
|---|---|
| API style | tRPC procedure |
| Auth | Session token must resolve to workspace_id matching `request.workspace_id` |
| Idempotency | Calls within 24h of last successful extraction return cached result; force re-extraction via `force: true` |
| Rate limit | 20 manual extractions per workspace per hour |
| Execution timing | Async — returns 202 Accepted with `extraction_request_id`; client polls for completion |
| Side effects | Emits `product.extraction_requested` Inngest event |

Request:
```ts
interface RequestProductExtractionInput {
  workspace_id: UUID;
  brand_id: UUID;
  product_id: UUID;
  force?: boolean;
}
```

Response:
```ts
interface RequestProductExtractionResponse {
  status: 'queued' | 'cached_result_returned' | 'rate_limited';
  extraction_request_id: UUID;
  cached_result?: { viyo_product: ViyoProductRow; assets: AssetRow[] };
}
```

### 6.2 tRPC procedure: `brandVault.requestBrandIdentityExtraction`

Same shape but for brand identity. Less frequently called.

### 6.3 tRPC procedure: `brandVault.getExtractionStatus`

Polls for completion.

```ts
interface ExtractionStatusResponse {
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  result?: { viyo_product: ViyoProductRow; assets: AssetRow[] };
  error?: { code: string; message: string };
  retries_remaining?: number;
}
```

### 6.4 Direct module import (server-side callers)

```ts
import { extractProduct, extractBrandIdentity } from '@viyo/worker/lib/brand-vault';
```

---

## 7. Code components

| Component | Repo path | Responsibility |
|---|---|---|
| JSONB schema | `packages/shared/src/schemas/brand-vault.ts` | Zod for `ProductKnowledgeExtractedData` and extraction events |
| Product extraction workflow | `apps/worker/src/inngest/product-extraction.ts` | Inngest function implementing §5.1 |
| Brand identity workflow | `apps/worker/src/inngest/brand-identity-extraction.ts` | Inngest function implementing §5.2 |
| Extraction prompt library | `apps/worker/src/lib/brand-vault/prompts.ts` | `structuredExtractionPrompt`, `voiceAttributePrompt`, `assetClassificationPrompt` |
| DOM parser | `apps/worker/src/lib/brand-vault/dom-parser.ts` | Cheerio-based asset discovery + JSON-LD extraction (provider-free) |
| Asset classifier | `apps/worker/src/lib/brand-vault/asset-classifier.ts` | Wraps `vision_extraction` registry calls; maps results to R20 v2 asset_type enum |
| Persistence layer | `apps/worker/src/lib/brand-vault/persistence.ts` | Transactional UPDATE to `viyo_products`, bulk INSERT to `assets`, UPDATE to `brands.brand_guidelines_url` where applicable |
| tRPC router | `apps/server/src/trpc/brand-vault.ts` | Procedures from §6 |

---

## 8. Failure modes

| Operation | Failure mode | Trigger | Response |
|---|---|---|---|
| `headless_fetch` registry call | All providers fail | Tier 1+2+3 unreachable | `EXTRACTION_NO_FETCH_PROVIDERS`; Sentry critical; mark `extracted_data.extraction_status='failed'`; do not retry until next scheduled sync |
| `headless_fetch` registry call | Anti-bot block | Cloudflare Turnstile or similar | Registry handles fallback (R29 v2 §6.4); if all fallbacks blocked, return `EXTRACTION_BLOCKED_BY_ANTI_BOT`; flag for manual extraction in UI |
| Product page 404 | URL invalid / product deleted | n/a | Mark `extracted_data.extraction_status='failed'`, reason `source_404`; emit event for platform plugin verification |
| `text_generation` LLM call | All providers fail | n/a | `EXTRACTION_NO_LLM_PROVIDERS`; Sentry critical; mark failed; retry next sync |
| LLM malformed JSON | Provider drift / bad prompt | Zod parse fails | Retry once with stricter prompt; if still failing, partial extraction (raw text only); `extraction_status='incomplete'` |
| LLM returns no ingredients/benefits | Sparse product page | Common | `extraction_status='incomplete'`; UI displays warning icon |
| Asset classifier confidence < 0.7 | Ambiguous asset | n/a | Default `asset_type='product_photo'`; record confidence in `assets.metadata`; do not reject |
| `vision_extraction` all providers fail | Vision capability unavailable | n/a | Skip classification (mark all discovered assets as `product_photo` with `metadata.classification_skipped=true`); extraction continues with degraded classification |
| DB write failure | DB unreachable / RLS denial | n/a | Roll back transaction; `EXTRACTION_DB_FAILURE`; Sentry critical; retry workflow once |
| Concurrent extraction limit | 10 in-flight for workspace | Burst sync | Queue new extractions; Sentry info on backlog > 50 |
| Lock 19 violation at runtime | Hardcoded model name leak | n/a | `LOCK_19_VIOLATION_RUNTIME`; Sentry critical |
| Cross-workspace fetch attempt | Bug in event payload routing | n/a | Reject; Sentry critical (data isolation violation) |
| Brand identity extraction — colors/fonts/voice captured but unstorable (pre-R20 v2.1) | R20 v2.1 not yet shipped | n/a | Sentry info `brand_identity_partial_persist`; logo + `brand_guidelines_url` still persist; other attributes captured to OTel only |

---

## 9. Edge cases

| Case | Handling |
|---|---|
| Product URL redirects | Follow up to 3 hops; record final URL in `assets.metadata.source_url` |
| SPA-heavy product page | `headless_fetch` defaults to `waitUntil: 'networkidle2'` |
| Brand page has no visible logo | Logo extraction falls back to manual entry; UI prompts user |
| Brand voice page mostly images (low text) | Skip voice extraction; capture as empty arrays |
| Same product re-synced within 24h | Idempotency: return cached result; do not re-fetch |
| Product re-synced after >24h | Re-extract; UPDATE `viyo_products.extracted_data` (overwrites prior extraction); preserve any user-manual overrides flagged in extracted_data JSONB |
| Workspace deleted mid-extraction | Inngest detects RLS denial on persistence; rolls back; no orphan rows |
| Provider Registry returns null for a capability | Mark extraction failed with specific `NO_*_PROVIDERS` code; surface to admin UI |
| Inngest step retry produces partial data | Idempotent step design: each step keyed on (extraction_request_id, step_name); duplicate completions return cached |
| Brand identity user-manual override | Per-attribute flag in future `brands.identity_overrides JSONB` (R20 v2.1) — pre-R20 v2.1, override capture in worker memory only |
| Asset discovered but classified `skip` | Not persisted; logged to OTel for visibility |

---

## 10. Concurrency

| Scenario | Handling |
|---|---|
| Multiple products synced simultaneously for same workspace | Inngest's per-workspace concurrency control caps at 10 |
| Same product extracted by two concurrent triggers | Idempotency key on `(workspace_id, product_id, calendar_day)` |
| Brand identity extraction concurrent with product extraction (same brand) | Independent workflows; no shared state |
| Asset classification on 50 images in one product | Parallel registry calls with concurrency cap of 5 |
| `viyo_products` UPDATE race | Last-write-wins; idempotency key + Inngest in-flight check prevents most races |

---

## 11. Observability

### 11.1 OTel spans

Per-extraction parent span: `viyo.brand_vault.product_extraction` or `viyo.brand_vault.brand_identity_extraction`.

Child spans per step:
- `viyo.brand_vault.headless_fetch`
- `viyo.brand_vault.dom_parse`
- `viyo.brand_vault.llm_semantic_extraction`
- `viyo.brand_vault.asset_classification`
- `viyo.brand_vault.persist`

Attributes:
- `viyo.workspace_id`, `viyo.brand_id`, `viyo.generation_id`, `viyo.product_id` (when applicable)
- `viyo.extraction_status`
- `viyo.duration_ms`
- `viyo.assets_discovered`, `viyo.assets_classified`, `viyo.assets_persisted`

### 11.2 PostHog events

- `brand_vault.product_extracted` (workspace_id, brand_id, product_id, status, duration_ms, asset_count)
- `brand_vault.brand_identity_extracted` (workspace_id, brand_id, partial_persist_flag)
- `brand_vault.extraction_failed` (error_code)

### 11.3 Sentry rules

| Level | Trigger |
|---|---|
| info | Extraction incomplete; brand_identity_partial_persist; asset classification skipped |
| warn | LLM malformed JSON; asset classification < 0.7 confidence for >50% of assets in one product |
| critical | EXTRACTION_NO_FETCH_PROVIDERS; EXTRACTION_NO_LLM_PROVIDERS; EXTRACTION_DB_FAILURE; LOCK_19_VIOLATION_RUNTIME; cross-workspace fetch attempt |

All Sentry events include tags: `workspace_id`, `brand_id`, `product_id` (when applicable), `extraction_request_id`.

### 11.4 Alerts

| Alert | Trigger | Severity |
|---|---|---|
| Extraction failure rate high | >10% failures in 1-hour window | warn |
| All fetch providers unavailable | `EXTRACTION_NO_FETCH_PROVIDERS` event | critical |
| Workspace backlog growth | Inngest queue depth > 50 for >10 min | warn |
| Asset classification degradation | Vision capability unavailable >5 min | warn |
| Brand identity partial-persist rate high | `brand_identity_partial_persist` events sustained (indicates R20 v2.1 ship delay) | info (operational tracking only) |

---

## 12. Tests

Mandatory test scenarios:

1. Happy path — product URL fetches, LLM extracts full data, assets classified, `viyo_products.extracted_data` UPDATED, `assets` rows INSERTED (asset_type correctly routed)
2. Happy path — brand identity URL fetches, logo persists to `assets` with `asset_type='brand_logo'`, `brand_guidelines_url` UPDATED on `brands`
3. Brand identity — non-logo attributes (colors, fonts, voice) captured to OTel but NOT persisted; `brand_identity_partial_persist` Sentry info emitted
4. Idempotency — same product URL within 24h returns cached; `force: true` overrides
5. Anti-bot fallback — Tier 1 blocked → Tier 2 succeeds → extraction completes
6. All fetch providers fail → `EXTRACTION_NO_FETCH_PROVIDERS`
7. LLM malformed JSON → retry with stricter prompt → success
8. LLM persistent failure → partial extraction; `extraction_status='incomplete'`
9. Sparse product page → empty ingredients/benefits → `extraction_status='incomplete'`
10. Asset classification ambiguous → default to `product_photo` with confidence in `assets.metadata`
11. Asset classified `skip` → not persisted
12. Vision capability unavailable → all assets default to `product_photo`; `metadata.classification_skipped=true`
13. DB write failure → transaction rollback; no partial state; retry workflow once
14. Concurrent extractions for same workspace capped at 10
15. Same product two concurrent triggers → idempotency wins
16. Workspace deleted mid-extraction → RLS denial caught; clean rollback
17. Cross-workspace fetch attempt rejected with critical Sentry event
18. Lock 19 grep — zero hardcoded LLM/browser provider names in `apps/worker/src/lib/brand-vault/`
19. Lock 13 grep — every query on `viyo_products`, `assets`, `brands` includes `workspace_id` filter
20. Lock 8 grep — zero `token_usage_logs.insert(...)` reachable from brand-vault code paths
21. R20 v2 schema fidelity — `viyo_products.extracted_data` Zod schema matches §4.1
22. Asset routing fidelity — every persisted asset has `asset_type` from the 4 R31-used values (`product_photo`, `lifestyle_scene`, `brand_logo`, `brand_kit_component`)
23. Composite FK enforcement — INSERT to `assets` with `brand_id` from different workspace → fails
24. Generation ID propagation across all OTel spans + Inngest events
25. Inngest step retry idempotency

---

## 13. Acceptance criteria (mechanical / binary)

- [ ] Repo file `/docs/research_specs/R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md` replaced with this content via Manus directive
- [ ] ZCBR Status header present and reads `PASSED 2026-05-12 by Architect Claude self-validation`
- [ ] CI grep confirms zero hardcoded LLM model literals in `apps/worker/src/lib/brand-vault/` and `apps/worker/src/inngest/*-extraction.ts`
- [ ] CI grep confirms zero hardcoded browser scraper service names
- [ ] CI grep confirms `workspace_id` filter on every query touching `viyo_products`, `assets`, `brands`
- [ ] CI grep confirms no `token_usage_logs.insert` reachable from brand-vault code paths (Lock 8)
- [ ] R-Spec Audit Table v1.1 row 15 status reads `PASS-on-merge` until repo commit; flips to `PASS` after merge
- [ ] All 25 tests in §12 land alongside implementation

---

## 14. Migration plan (v1 → v2 revision 2)

The v1.0 was authored 2026-05-12 09:22 UTC and replaced before code was written against it. No existing code depends on v1.0 contracts. Migration is a clean spec swap with no data migration concerns.

**Rollout sequence:**

1. Architect commits R31 v2 revision 2 to repo via Manus directive R31-V2-REWRITE-002
2. R-Spec Audit Table v1.1 row 15 status updates from PASS-on-merge to PASS at merge confirmation
3. Future B-0.17 implementation Bullet implements the brand-vault code per this spec
4. R20 v2.1 schema extension (proposed in §15) lands as separate Bullet ahead of full brand identity persistence
5. Inngest workflows registered; tRPC routes registered
6. Feature flag `enable_brand_vault_extraction` toggled on once implementation lands and CI green

No data migration required.

---

## 15. Open items

1. **R20 v2.1 schema extension for brand identity attributes.** R20 v2 `brands` table holds only minimal anchor columns (`id`, `workspace_id`, `name`, `hyve_opt_in`, `hyve_opt_in_timestamp`, `brand_guidelines_url`, `default_brand`). Full brand identity extraction (colors, fonts, voice) has no storage destination. Proposed R20 v2.1 additions to `brands`:
   - `primary_color VARCHAR(7) NULL` (hex)
   - `secondary_color VARCHAR(7) NULL`
   - `accent_colors VARCHAR(7)[] DEFAULT '{}'::VARCHAR(7)[] NOT NULL`
   - `primary_font_family VARCHAR(100) NULL`
   - `secondary_font_family VARCHAR(100) NULL`
   - `voice_attributes TEXT[] DEFAULT '{}'::TEXT[] NOT NULL`
   - `voice_samples TEXT[] DEFAULT '{}'::TEXT[] NOT NULL`
   - `forbidden_words TEXT[] DEFAULT '{}'::TEXT[] NOT NULL`
   - `identity_extracted_from_url TEXT NULL`
   - `identity_manually_overridden BOOLEAN DEFAULT FALSE NOT NULL`
   - `identity_last_extracted_at TIMESTAMPTZ NULL`
   - `identity_overrides JSONB DEFAULT '{}'::jsonb NOT NULL` (per-attribute override flags)
   
   Until R20 v2.1 ships, brand identity extraction persists only the logo (via `assets`) and `brand_guidelines_url` (if discovered). Other attributes are captured to OTel for visibility. R31 v2.1 minor bump captures the post-R20 v2.1 wire-up.

2. **R29 v2 §6 e-commerce platform plugin completeness.** Assumes platform plugins emit `product.synced` events. If R29 v2 §6 plugins are not yet implemented for all platforms, extraction is gated on plugin readiness per platform.

3. **R30 Product Animation Engine readiness.** R31 v2 emits `product.animation.requested` events. If R30 is not yet implemented, the event is captured but produces no animation.

4. **INCI nomenclature library.** For cosmetic brands, INCI names are an industry standard. R31 v2 makes the field optional. A future minor version may add automatic INCI lookup.

5. **Voice sample quality scoring.** Voice samples vary in quality. A future minor version may score and prefer high-signal samples.

6. **Brand asset auto-tagging via vision.** Currently `assets.tags` is user-driven for non-extraction-discovered assets. A future minor version may auto-tag uploaded brand assets via `vision_extraction`.

7. **Bulk product extraction API.** Currently each product is its own Inngest workflow. A future optimization may batch products from the same domain.

8. **Brand identity refresh cadence.** Currently extracted once at brand onboarding. A future minor version may schedule periodic refreshes.

9. **Subscription tier ceiling on extraction volume.** D8 5-tier subscription pricing should rate-limit per tier. Current limit (20/hour per workspace) is uniform.

---

## 16. Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion audit log.

**Version triggers:**
- Major (v3): breaking change to JSONB shape (new required field, removed field, type change on existing field)
- Minor (v2.x): additive (new asset_type routings, new extraction sources, new platforms, R20 v2.1 post-ship wire-up for full brand identity persistence)
- Patch (v2.x.y): clarifications, typo fixes, citation updates

**Re-validation:** Every 180 days per ZCBR HEADER_STALE rule, or immediately when any cited spec (R20 v2, R29 v2, R24 v2, T46 v2) bumps minor or major version.

**Companion spec alignment:**
- When R20 v2.1 ratifies with `brands` identity columns, R31 v2.1 minor bump aligns brand identity persistence wire-up.
- When R30 Product Animation Engine ratifies to ZCBR PASSED, R31 may bump to v2.x to align event payload.

---

*End of R31 Product Data Extraction & Brand Vault v2 revision 2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
