---
spec_id: R24
title: Image Pipeline — Three-Tiered Image Intelligence System
version: 2.0
zcbr_status: PASSED
zcbr_validation_date: 2026-05-12
zcbr_validator: Architect Claude (Opus 4.7) self-validation
zcbr_checklist_version: v1
authored_date: 2026-05-12
author: Architect Claude (Opus 4.7)
supersedes:
  - docs/research_specs/R24_IMAGE_PIPELINE_VIDEO_ANALYSIS_COMPLETE.md (2026-04-24, 29518 bytes)
  - docs/research_specs/R24_LEARNING_LOOP_CRITIQUE.md (2026-04-24, 4502 bytes)
  - docs/research_specs/R24_MULTI_MODEL_IMAGE_PIPELINE_ENTERPRISE.md (2026-04-24, 7833 bytes)
  - docs/research_specs/R24_VISION_CRITIQUE.md (2026-04-24, 6290 bytes)
  - docs/research_specs/R24_VISION_STATEMENT_FROM_CEO.md (2026-04-24, 8887 bytes)
target_repo_path: /docs/research_specs/R24_IMAGE_PIPELINE_v2.md
authority_tier: 7 (R-spec ZCBR per CLAUDE.md hierarchy)
---

# R24 — Image Pipeline (v2, ZCBR-Grade)

## 0. Authority and Provenance

**This document is the canonical contract for the VIYO Image Pipeline** — a self-learning, model-agnostic, pattern-expanding image intelligence system per CEO vision dated 2026-04-23. R24 v2 reconciles five v1 fragment files (Video Analysis, Learning Loop Critique, Multi-Model Enterprise, Vision Critique, Vision Statement from CEO) into a single ZCBR-grade spec aligned to FOUNDATION_AUTHORITY L11 Pattern Substrate, L5 Data Flywheel, L7 Observability, and the implementation surface in `packages/shared/src/schemas/art-director.ts` + `apps/worker/src/lib/ai/`. R24 v2 supersedes ALL five v1 files via the cleanup directive `R24-V2-SUPERSESSION-001` landing supersession headers immediately after R24 v2 merges.

**Authority sources (CLAUDE.md tier order):**
- PO ratifications: CEO vision statement 2026-04-23 (5 corrections, Section 1.3 below), D55 (R29 PAL Option C unified Plugin Registry — affects Provider Registry surface), D56 (token metering Phase 0/Phase 1 split — affects cost attribution per generation), D66 (B-1.00 Studio Core Loop ratified — Image Pipeline IS the Phase 1 product surface)
- V8 PRD (current canonical except where flagged underspecified)
- FOUNDATION_AUTHORITY.md L2 Asset Model, L5 Data Flywheel, L7 Observability, L11 Pattern Substrate, L12-A Skills Layer 1 (Platform Skills), L12-B Skills Layer 2 (Pattern Skills)
- VIYO_Master_Build_Sequence.md (v1.1) — Phase 1 Bullets B-1.00 through B-1.21 consume this pipeline; B-1B Bullets feed it via SYPHON ingestion
- ZCBR_STANDARD.md (Foundation Lock 20) — this spec validates against the 14-item checklist plus anti-pattern checks
- VVOW_IMAGE_STUDIO_ARCHITECTURE.md §10.2-10.3 (Pattern Substrate), §11 (Brand Vault), §12 (Data Flywheel), §13 (Studio interaction)
- **R20 v2** (`/docs/research_specs/R20_DATABASE_SCHEMA_v2.md`, ratified 2026-05-12, merged via PR #21, commit `5004819e9bbf4d81a9c992003e3a2ed1731df3fc`) — schema authority for `image_prompt_patterns`, `assets`, `rlhf_votes`, `preference_model_versions`, `pattern_performance_metrics`, `brand_preferences`
- **R29 PAL v2** (TO BE AUTHORED via B-XC.01) — Plugin Registry for Provider Agnosticism. R24 v2 cites the registry interface; concrete provider schemas land in R29 v2. Until R29 v2 ships, citation is forward-reference; this is acceptable per ZCBR ZC-6 dependency version policy.

**Implementation ground-truth sources reconciled:**
- `packages/shared/src/schemas/art-director.ts` (21,768 bytes, last touched 2026-04-29) — Zod contracts for routing surface; **this file currently hardcodes 22 generation models and 10 editing models in enums, which is a Lock 19 violation that R24 v2 specifies the refactor path for (see §10)**
- `apps/worker/src/lib/ai/art-director-routing.ts` — routing implementation skeleton (exists, content not enumerated in audit; v2 specifies what it must contain post-refactor)
- `apps/worker/src/lib/ai/art-director-route-generation.test.ts` — route generation tests
- `apps/worker/src/lib/ai/image-router.ts` — image router skeleton
- `apps/worker/src/lib/ai/image-patterns.ts` — pattern lookup utilities
- `apps/worker/src/trpc/routers/art-director.ts` — tRPC surface for synchronous routing
- `apps/web/src/components/studio/ImageStudio.test.ts` — Phase 1 Studio component test scaffold
- `packages/db/src/schema/image-intelligence.ts` — `image_prompt_patterns` table (per R20 v2 §2.3)
- `packages/db/src/schema/rlhf.ts` — `rlhf_votes`, `preference_model_versions`, `pattern_performance_metrics` tables (per R20 v2 §2.8)
- `packages/db/src/schema/products.ts` — `assets` table with lineage + brand_id + asset_type 9-value enum (per R20 v2 §2.2)

**Cross-spec wiring map:**

| Consumer/Producer | What it provides or consumes | R24 v2 reference point |
|---|---|---|
| R20 v2 (Database Schema) | `image_prompt_patterns` table (Pattern DB), `assets` table (lineage), `rlhf_votes` (RLHF events), `preference_model_versions` (model registry), `pattern_performance_metrics` (rolling QA scores), `brand_preferences` (MAAX signals) | §5, §6, §7, §11 |
| R29 PAL v2 (TO BE AUTHORED) | Provider Registry interface — `providerRegistry.execute(provider, model, op, args)` indirection for Lock 19 | §10 |
| R31 Product Data Extraction | `viyo_products` table + product imagery extracted; consumed by Tier 3 Production Router | §7.1 |
| R19 LLM Orchestration | Council of Brains decision logging for variant selection per `council_decisions` table; Brain Council votes feed Tier 3 routing | §7.3 |
| R46 Email Ingestion | IMAP corpus emails feeding Tier 1 Learning Engine; `assets.asset_type='ingested_email'/'ingested_image'` rows | §5.1 |
| R37 MAAX (Brand Memory) | Per-brand preference signals captured via RLHF; `brand_preferences` rows reference `generation_id` from image generation events | §8.4, §11 |
| R36 HYVE (anonymized network intelligence) | Aggregate pattern performance flowing through k-anonymity gate; rows in `hyve_pattern_performance` derived from RLHF aggregates | §8.4 (downstream) |
| R38 SYPHON (ESP daily sync) | Real-world send metrics flowing back to `pattern_performance_metrics`; closes Data Flywheel L5 | §11 |
| R32 Email Engine (Phase 2) | Image outputs consumed by email composition; `email_templates.compiled_html` references generated `assets` | §7 (output contract) |
| T46/T69 Art Director Routing | Synchronous routing surface — `apps/worker/src/trpc/routers/art-director.ts` + `packages/shared/src/schemas/art-director.ts` | §7, §10 |
| Phase 1 Studio Bullets | B-1.00 Studio Core Loop, B-1.01-B-1.21 Image Studio features consume this pipeline | §7, §13 |
| Phase 1B Bullets | B-1B.01 IMAP ingestion → B-1B.04 MAAX hydration produce Tier 1 inputs | §5 |

**Lock invocations:** Locks 4 (no in-memory schema), 5 (Pattern Recipe schema-drift forbidden), 6 (Brand Vault separation), 8 (programmatic ops 0 tokens), 9 (RLHF event constraints), 11 (Council of Brains for variant selection), 12 (two-layer prompt token budget), 13 (multi-tenant RLS on Pattern DB write), 17 (Foundation-First Decision Making), 19 (Provider Agnosticism — art-director.ts refactor specified §10), 20 (this spec is ZCBR PASSED).

---

## 1. Scope and Boundaries

### 1.1 What R24 v2 covers

- **The Three-Tiered Image Intelligence System architecture** (Tier 1 Learning Engine, Tier 2 Pattern Database, Tier 3 Production Router) with detailed contracts for each tier
- **The Three-Layer Pipeline** per CEO vision (Layer 1: raw product → Layer 2: lifestyle scene with model → Layer 3: typography/CTA/doodles overlay)
- **The Dual-Scoring Architecture** (Bouncer + Curator + DSPy) preventing "B+ Trap" model collapse
- **Multi-model chaining patterns** (e.g. NanoBanana for scene + Ideogram for text)
- **Provider Registry indirection** (Lock 19) — refactor path for the existing art-director.ts hardcoded model surface
- **Pattern Recipe JSON schema contract** (Lock 5) — the locked shape of `image_prompt_patterns.style_schema` JSONB
- **RLHF event emission contract** (Lock 9) — what events flow into `rlhf_votes`, when, with what shape
- **The 22 routing modes** (A1-A22) and 8 pipeline modes documented in art-director.ts — meanings, when each fires
- **The Council of Brains integration** for variant selection per Lock 11
- **Skills consumed by the pipeline** (B-XC.07 image-generation-pipeline, B-XC.08 pattern-cache-lookup, B-XC.09 art-director-routing, B-XC.10 rlhf-event-emission, plus general skills database-migration, inngest-function-authoring, hono-route-authoring, brand-vault-asset-write, writing-behavioral-tests, pattern-recipe-validation)
- **Failure modes, edge cases, observability, and tests** per ZCBR-grade requirements
- **The supersession contract** for all 5 R24 v1 files

### 1.2 What R24 v2 does NOT cover (explicit out-of-scope)

- **Database schema DDL** — covered in R20 v2 §2.3 (`image_prompt_patterns`), §2.2 (`assets`), §2.8 (RLHF tables). R24 v2 cites; R20 v2 defines.
- **Concrete provider implementations** (specific API call wrappers, retry semantics for Atlas Cloud / fal.ai / Ideogram / etc.) — those land in R29 PAL v2 (B-XC.01)
- **The IMAP ingestion pipeline** itself (R46 covers); R24 v2 only documents the Tier 1 input contract
- **Email composition logic** (R27 Composable Sections + R32 Email Engine) — R24 v2 produces images consumed by email composition; the composition pipeline is downstream
- **Brand Vault asset CRUD** — covered by VVOW §11 + R20 v2 §2.2 `assets` table; R24 v2 produces assets, doesn't manage them
- **Studio UI components** (B-1.01-B-1.21 + VVOW §13) — R24 v2 documents the API surface the Studio consumes; component code is in apps/web
- **Real-time collaboration on generated images** (B-2.5 Phase 2.5 Collaboration) — comments + approvals consume generation output
- **Cost accounting per generation** — covered by R23 + R20 v2 §2.5 `token_usage_logs`; R24 v2 emits `generation_id` for cost attribution but doesn't define cost calculation
- **DSPy implementation specifics** — DSPy is named as the pattern optimization framework; concrete DSPy module specs are deferred (DSPY-1 in Master Sequence appendix; not Phase 1)
- **Specific model names in DDL or normative code paths** — Lock 19 forbids; R24 v2 specifies Provider Registry indirection

### 1.3 CEO Corrections (5 corrections from 2026-04-23 vision statement, locked here)

These corrections from the CEO supersede any contrary language in R24 v1 files and are normative:

**Correction 1 — Hundreds of image types, not three.** The system supports an unbounded, continuously growing taxonomy. T1-T4 typography patterns and Types A/B/C from v1 are early examples; the architecture must accept new image types via configuration/learning, not code changes. R24 v2 §6 documents the pattern taxonomy as a database-driven enum extensible via Path F directives.

**Correction 2 — Elastic model count, not fixed.** No code path may assume a fixed set of models. The 22 models currently hardcoded in `packages/shared/src/schemas/art-director.ts` are a Lock 19 violation that R24 v2 §10 specifies the refactor path for. Tomorrow's models (e.g. Grok Imagine, ChatGPT Image 2) must integrate via R29 PAL v2 registry configuration, not code changes.

**Correction 3 — Every image in the email, not just hero.** The pipeline produces visuals for every section: product blocks, lifestyle sections, CTA banners, headers, footers, dividers. Section-level generation requests are first-class. R24 v2 §7 documents the section-level generation contract.

**Correction 4 — Learning phase IS the core product.** Tier 1 (Learning Engine) runs continuously, forever. It is not a pre-launch activity. This is VIYO's defensible moat. R24 v2 §5 makes Tier 1 a permanent runtime component, not a one-time seed job.

**Correction 5 — Replication as the learning mechanism.** The learning loop is: ingest real marketing email → extract images → break down into JSON style schemas → generate prompts → test across models → replicate the original ingested image → compare → learn. The replication target is the original ingested image; the QA metric is similarity to the original (filtered through the Dual-Scoring architecture). R24 v2 §5.2 specifies the replication-based QA contract.

---

## 2. The Three-Tiered Architecture (Overview)

R24 v2 organizes the image pipeline as three tiers, each with distinct purpose, inputs, outputs, runtime characteristics, and skills consumed:

| Tier | Name | Purpose | Trigger | Output | Skills consumed |
|---|---|---|---|---|---|
| **Tier 1** | Learning Engine | Continuous learning from ingested emails; build Pattern DB | Email ingestion event (R46) | `image_prompt_patterns` rows (proven) + `rlhf_votes` (curator approvals) | `image-generation-pipeline` (B-XC.07), `pattern-recipe-validation`, `rlhf-event-emission` (B-XC.10), `brand-vault-asset-write` |
| **Tier 2** | Pattern Database | Vector-cached prompt patterns indexed by category/style/model/QA | Query from Tier 3 + writes from Tier 1 + DSPy compilation jobs | Ordered pattern matches via `match_image_patterns` RPC (R20 v2 §2.3.2) | `pattern-cache-lookup` (B-XC.08), `pattern-recipe-validation` |
| **Tier 3** | Production Router | Live customer image generation using cached patterns | Studio image request (B-1.00 Studio Core Loop) | Generated image `assets` row + lineage chain + RLHF emission | `art-director-routing` (B-XC.09), `image-generation-pipeline`, `rlhf-event-emission`, `brand-vault-asset-write` |

The tiers are **decoupled at the database boundary**. Tier 1 writes patterns into `image_prompt_patterns`. Tier 3 reads patterns. Tier 1 → Tier 3 is async via the DB; there is no direct API call between them.

The **Three-Layer Pipeline** (per CEO vision) operates within Tier 3:

| Layer | Input | Output | Default model class |
|---|---|---|---|
| Layer 1 | Customer flat product image OR existing photoshoot | Raw product asset (stored in `assets` table, `asset_type='product_photo'` or `'lifestyle_scene'`) | None — passthrough from upload or web scrape |
| Layer 2 | Layer 1 asset + scene prompt template | Photorealistic editorial scene with model wearing/holding product (`asset_type='generated_hero'`) | Provider Registry resolves to a photoshoot-strong model class (e.g. NanoBanana, Flux); routing decision is data-driven via Pattern DB QA scores per category |
| Layer 3 | Layer 2 asset + typography/CTA/doodle prompt | Final email-ready editorial asset with text overlay (`asset_type='generated_section'`) | Provider Registry resolves to a typography-strong model class (e.g. Ideogram V3 with Remix); routing decision is data-driven |

Layers are NOT skipped — every production image flows L1→L2→L3 in sequence (even if L1 is a passthrough from upload). Layer outputs each produce an `assets` row with `parent_asset_id` linking the chain (lineage per R20 v2 §2.2.2).

The **Dual-Scoring Architecture** operates across all three tiers but is most prominent in Tier 1:

| Score type | Who/what produces it | What it checks | Decision |
|---|---|---|---|
| **Objective Bouncer** | Fast vision LLM (cheap, e.g. GPT-4o-mini class) resolved via Provider Registry | Is text spelled right? Is product present? Are there severe anomalies (extra limbs, mangled faces)? | Pass/Fail. Failures discarded. |
| **Subjective Curator** | Human team member via internal Curator UI (R17 + B-1B.05 Curator Dashboard) | Is this visually compelling? Does it match the original email's energy? Brand-appropriate? | Approve (swipe right) / Reject (swipe left) / Skip |
| **DSPy Compilation** | DSPy framework consumes approved Curator decisions and compiles prompt-pattern optimizations | Maximize approval rate while preserving constraints | Updates `image_prompt_patterns` row + `prompt_template` |

Per the LEARNING_LOOP_CRITIQUE: this architecture explicitly prevents the "B+ Trap" where AI-grading-AI loops converge to generic outputs. Human aesthetic judgment is in the loop; objective LLM QA is only for binary correctness.

---

## 3. Provider Agnosticism Refactor (Lock 19 — art-director.ts)

### 3.1 Current state (Lock 19 violation surface)

`packages/shared/src/schemas/art-director.ts` currently hardcodes:
- 22 generation models in `artDirectorGenerationModelSchema` Zod enum
- 10 editing models in `artDirectorEditingModelSchema` Zod enum
- 9 gateway providers in `artDirectorGatewaySchema` Zod enum
- A model metadata table mapping each model to tier + gateway + capabilities

This violates Lock 19 (Provider Agnosticism) because adding a new model (e.g. when ChatGPT Image 2 ships, or when Grok Imagine is added) requires code changes to multiple files: schema enum, metadata table, routing logic, tests.

### 3.2 R24 v2 specifies the refactor path

The refactor is implemented via R29 PAL v2 (B-XC.01) and consumed by R24 v2. Specifically:

1. **Model identity becomes data, not code.** Models are registered as rows in a new `ai_provider_models` table (R29 PAL v2 will define). The Zod enum is replaced with `z.string()` validated at runtime against the registry.

2. **Model metadata becomes data, not code.** The metadata rows currently in `artDirectorModelMetadataRows` (tier, gateway, displayName, capabilities, source) move into the `ai_provider_models` table.

3. **Routing decisions become data-driven.** Instead of `if (model === 'ideogram-v3')`, routing code asks the registry: `registry.getModelsByCapability('typography')` returns the current set.

4. **Provider Registry interface (R29 PAL v2):** Single entry point `providerRegistry.execute({ capability, args, brandId, generationId })` returns generated content. The registry handles tier selection, fallback, retry, and cost attribution.

5. **R24 v2 normative code paths** cite `providerRegistry.execute(...)` — never a literal model name string. CI grep test enforces this in any code touched by R24 v2 Bullets going forward.

### 3.3 Migration sequencing

| Step | Owner | Bullet |
|---|---|---|
| Author R29 PAL v2 with `ai_provider_models` table + Provider Registry interface | Architect Claude (Path B) | B-XC.01 |
| Land R29 PAL v2 schema migration | Kimi via Composer Queue | B-1B.06 or earlier |
| Refactor `art-director.ts` enums → `z.string()` + runtime registry validation | Kimi | B-1.18 or earlier specific Bullet |
| Move 22 model metadata rows → DB seed migration | Kimi | Same Bullet |
| Update routing code paths → registry calls | Kimi | B-1.00 onwards Bullet-by-Bullet |
| CI grep test rejects new hardcoded model name strings in normative code | Reviewer Claude §9 Gate | Continuous |

Until R29 PAL v2 ships, `art-director.ts` retains the current shape — but R24 v2 forbids ADDING new model names to the enum. New models go into R29 PAL v2 registry directly.

---

## 4. Tier 1 — The Learning Engine

### 4.1 Purpose

Tier 1 is the continuous learning component. It ingests real marketing emails (from competitors, brands, industry leaders), extracts images, generates replication attempts across multiple models, and routes results through Dual-Scoring (Bouncer → Curator → DSPy) to build and refine the Pattern Database.

Per CEO Correction 4, Tier 1 runs forever — it is not a pre-launch activity.

### 4.2 Trigger

Tier 1 is triggered by the `image.ingested` Inngest event, emitted by R46 IMAP ingestion when a new image is extracted from an ingested email. The event payload:

```typescript
{
  imageUrl: string;             // R2 storage URL of the extracted image
  sourceEmailId: string;        // UUID of the source email row (R46 schema)
  category: string;             // Inferred category from email metadata (e.g. 'fashion_editorial', 'beverage_promo')
  brandId: string | null;       // Source brand if identifiable (HYVE opt-in only)
  generationId: string;         // New UUID for end-to-end tracking (per FOUNDATION_AUTHORITY L7)
  ingestedAt: string;           // ISO 8601 timestamp
}
```

### 4.3 Pipeline steps (Inngest function `processIngestedImage`)

**Step 1: Deconstruct.** Vision LLM (resolved via Provider Registry, capability `vision_qa`) reverse-engineers the image into a Pattern Recipe JSON schema. Output validated against the Lock 5 locked Pattern Recipe schema (defined §9 below). Stored in workflow state, not yet committed to DB.

**Step 2: Generate variants.** For each model class active in the registry (typography-strong, photoshoot-strong, candid-strong, etc.), generate a replication attempt of the source image using the Pattern Recipe. Each attempt produces a new `assets` row with `asset_type='generated_hero'` and `parent_asset_id=NULL` initially. Lineage chain populates after curation.

**Step 3: Bouncer (objective filter).** For each variant, the Bouncer vision LLM checks:
- Is the text in the image spelled correctly (if text is in the Recipe)?
- Is the product present and recognizable?
- Are there severe anatomical anomalies (extra limbs, mangled faces, broken geometry)?
- Is the image not corrupted (file integrity)?

Failures emit a `rlhf_votes` row with `vote='reject'` and `event_type='manual_curation'` (Bouncer counts as automated curation), then are discarded. Pass variants advance.

**Step 4: Queue for Curator.** Passing variants are inserted into a curator queue (table `curator_queue` planned per R17 Curator Dashboard spec; if not yet implemented, deferred to B-1B.05). Each row references the variant `assets.id`, source image URL, Recipe JSON, model used, and waits for human swipe.

**Step 5: Capture Curator decision.** Human swipes right (approve) or left (reject) via Curator UI. Decision writes a `rlhf_votes` row per Lock 9 schema (R20 v2 §2.8.1) with `event_type='manual_curation'`, `rating` per the 4-value scale ({-1, 0, 1, 5}), and `pattern_id` linked once the Recipe has been promoted to a pattern.

**Step 6: DSPy compilation (when threshold met).** When a Recipe accumulates ≥N approvals (N is a system config value; initial value 5 per OD-016 recommendation pending PO ratification), DSPy is invoked to compile the prompt template into an optimized version. The compiled template + Recipe + QA scores are written to `image_prompt_patterns`. The Recipe is now a "proven pattern" available to Tier 2.

### 4.4 Idempotency and retry

The Inngest function is configured `{ id: 'process-ingested-image', retries: 3 }`. Each step uses `step.run()` for individual retry semantics. The `image.ingested` event includes `generationId` for end-to-end tracking; re-runs of the same event are detected by Inngest's native dedup.

If Step 5 (curator decision) takes longer than 7 days, the queue row is flagged for review (operational metric, not error). DSPy compilation (Step 6) is throttled to once per pattern per 24 hours to prevent excessive recompilation.

### 4.5 Tier 1 failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Vision LLM Recipe extraction fails | Step 1 — vision LLM returns malformed JSON | `RECIPE_EXTRACTION_FAILED` | Retry up to 3x via Inngest; on final fail, log and skip image | Sentry warn |
| Recipe schema validation fails | Lock 5 — extracted Recipe doesn't match locked schema | `PATTERN_RECIPE_SCHEMA_DRIFT` | Retry with adjusted prompt; if persistent, log + alert (may indicate Recipe schema needs update — escalate to Architect) | Sentry critical |
| Provider Registry unavailable | Step 2 — registry returns no models for capability | `REGISTRY_NO_MODELS_AVAILABLE` | Halt pipeline; alert PO | Sentry critical |
| Variant generation timeout | Step 2 — model API exceeds timeout | `VARIANT_GENERATION_TIMEOUT` | Retry with fallback model from registry; if all fail, log per-model + skip variant | Sentry warn |
| Bouncer LLM returns ambiguous | Step 3 — Bouncer cannot determine pass/fail | `BOUNCER_AMBIGUOUS` | Default to pass (let Curator decide); log for tuning | OTel event |
| Curator queue overflow | Step 4 — pending queue exceeds N rows (config value) | `CURATOR_QUEUE_OVERFLOW` | Pause ingestion until queue drains; alert PO | PostHog alert |
| DSPy compilation failure | Step 6 — DSPy throws or produces invalid template | `DSPY_COMPILATION_FAILED` | Retain raw Recipe; do NOT promote to pattern; alert Architect | Sentry warn |
| Cross-tenant brand contamination | Step 4 — ingested image accidentally tagged with wrong `brandId` | `BRAND_CONTAMINATION_INGESTION` | Halt + manual review (privacy critical) | Sentry critical |

### 4.6 Tier 1 edge cases

- **Empty Pattern DB at startup.** First ingestion run with zero patterns existing — proceed normally; first approved Recipe becomes the first pattern.
- **Source image is itself AI-generated.** Tier 1 cannot reliably distinguish; ingest anyway. The curator filter naturally rejects generic-looking AI outputs.
- **Source email has multiple images.** Each image emits a separate `image.ingested` event. Per-image lineage; no batch processing.
- **Source brand opts out of HYVE mid-pipeline.** If `brands.hyve_opt_in` changes to FALSE between Step 1 and Step 6, all in-flight workflow state retains the original opt-in value (immutable per workflow start time). Subsequent ingestions from that brand stop.
- **Recipe schema update mid-pipeline.** Recipe schema (Lock 5) updates retroactively invalidate in-flight Recipes. R24 v2 specifies the update protocol: pause Tier 1 ingestion, drain queue to completion, update schema, resume.

### 4.7 Tier 1 tests required

- **Recipe extraction fidelity test:** Fixture image → assert extracted Recipe matches expected JSON for 10 reference fashion-editorial images.
- **Bouncer accuracy test:** Set of 50 known-good + 50 known-bad images; Bouncer must achieve ≥90% accuracy on binary classification.
- **Curator queue insertion test:** Pipeline run with 5 variants → assert 5 rows in `curator_queue` with correct `pattern_id`/`asset_id` links.
- **DSPy compilation threshold test:** Insert 5 approvals for same Recipe → assert DSPy job triggers; insert 4 approvals → assert NOT triggered.
- **Cross-tenant isolation test:** Two ingestion runs for different brands, same source category → assert RLHF rows tagged with correct brand IDs.

---

## 5. Tier 2 — The Pattern Database

### 5.1 Purpose

Tier 2 is the vector-cached prompt pattern store. It is the **Pattern Substrate** per FOUNDATION_AUTHORITY L11. Tier 2 is consumed by Tier 3 at production time and written to by Tier 1 at learning time. Tier 2 is the moat — it accumulates VIYO's proprietary pattern intelligence over time.

### 5.2 Schema (cite R20 v2)

The Pattern DB lives in `image_prompt_patterns` table — full DDL in R20 v2 §2.3.1. R24 v2 doesn't redefine; it consumes.

Key columns relevant to R24:
- `id UUID` — pattern identifier
- `category VARCHAR(100)` — e.g. 'fashion_editorial', 'beverage_promo'
- `layout_type VARCHAR(50)` — e.g. 'hero', 'section', 'cta_banner', 'product_block'
- `typography_style VARCHAR(50)` — e.g. 'T1_marker_scribble', 'T2_massive_caps', 'T3_outline_hollow', 'T4_curved_orbit'
- `product_type VARCHAR(100)` — extensible product classification
- `target_models TEXT[]` — array of model IDs (registry-validated, NOT direct enum) that produced this pattern
- `prompt_template TEXT` — the DSPy-compiled prompt template with `[PRODUCT_DESCRIPTION]`, `[HERO_TEXT]`, etc. placeholders
- `style_schema JSONB` — Pattern Recipe per Lock 5 (full shape §9 below)
- `embedding vector(1536)` — embedding of the category+layout+style description for similarity search
- `qa_score NUMERIC(3,2)` — average Curator approval score
- `fidelity_score NUMERIC(3,2)` — replication fidelity to source per Bouncer
- `cost_per_gen NUMERIC(5,4)` — average cost per generation
- `supports_typography BOOLEAN` — whether this pattern handles text overlay
- `usage_count INTEGER` — production hit count

### 5.3 Pattern lookup contract (RPC `match_image_patterns`)

Defined in R20 v2 §2.3.2. R24 v2 specifies the call sites:

- **Tier 3 production routing** — called per image request to find best matching patterns
- **Curator UI** — called when reviewing learning queue items to surface "similar existing patterns" for context
- **Brand Vault search** — called when surfacing pattern suggestions in the Studio (B-1.13 Pattern Library Browser)

Parameters per R20 v2:
- `query_embedding vector(1536)` — embedding of request context (category + layout + style description)
- `match_category TEXT` — exact category match
- `match_layout TEXT` — exact layout type match
- `match_threshold FLOAT` — similarity threshold (default 0.85; tunable per call)
- `match_count INT` — max results (default 5)

Response: rows ordered by similarity descending.

### 5.4 Pattern write path

Patterns are written only by Tier 1 DSPy compilation step. Direct INSERT to `image_prompt_patterns` from any other path is forbidden. CI grep test enforces:

```bash
grep -rln "image_prompt_patterns.*insert\|imagePromptPatterns.*insert" apps/ packages/ --include='*.ts' 2>/dev/null
```

Any match outside `apps/worker/src/learning/dspy-compile.ts` (the canonical write path, to be authored) fails CI.

### 5.5 Pattern update path

Patterns are updated only by:
- DSPy recompilation (Tier 1 Step 6) — updates `prompt_template`, `style_schema`, `qa_score`
- Background aggregation job — updates `qa_score_rolling` (in `pattern_performance_metrics`, NOT `image_prompt_patterns`), `usage_count`, `last_used_at`

Manual edits to `image_prompt_patterns` are forbidden in code; admin-only via service-role connection for emergency corrections.

### 5.6 Tier 2 failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Vector dimension mismatch | INSERT with embedding of wrong dim | `VECTOR_DIMENSION_MISMATCH` | Transaction abort | Sentry capture |
| IVFFlat recall degradation | After N inserts without REINDEX | `IVFFLAT_RECALL_LOW` (operational metric) | None — REINDEX via maintenance | PostHog event |
| Pattern Recipe schema drift on write | Lock 5 violation at INSERT | `PATTERN_RECIPE_SCHEMA_DRIFT` | Reject INSERT; rewrite DSPy output | Sentry critical |
| Hot pattern cache contention | Single pattern receives 1000s of qps reads | `PATTERN_HOT_KEY` (operational) | Application-level cache (Redis) per VVOW §18.3 | OTel event |

### 5.7 Tier 2 tests required

- **Vector similarity recall test:** Insert 10,000 fixture patterns with known embeddings; query with target embedding; assert top-K results match expected ordering at recall ≥0.90.
- **Service-role isolation test:** Authenticated user connection → SELECT on `image_prompt_patterns` returns 0 rows.
- **Pattern write isolation test:** Code path other than canonical write path attempts INSERT → CI grep fails the PR.
- **Concurrent usage_count test:** 100 concurrent Tier 3 calls for same pattern → atomic UPDATE succeeds for all; final `usage_count` increment equals 100.

---

## 6. Tier 3 — The Production Router

### 6.1 Purpose

Tier 3 is the live customer-facing image generation path. It is invoked by Studio (B-1.00 Studio Core Loop and onwards) and produces final images for emails (R32 + R27). Tier 3 must be fast, reliable, and never produce a generation the customer pays for that doesn't meet internal QA.

### 6.2 The Three-Layer Pipeline

Per CEO vision, every Tier 3 production run executes Layers 1-2-3:

#### 6.2.1 Layer 1 — Product asset acquisition

Inputs: customer request specifying product (Shopify product ID OR uploaded image). Outputs: `assets` row with `asset_type='product_photo'` (or `'lifestyle_scene'` if a model is already present).

Logic:
- If customer has existing photoshoot for the product → use it (no generation); `asset_type='lifestyle_scene'`
- If customer has only flat product image → use it; `asset_type='product_photo'`
- If customer has neither → flag error; require upload

No model generation in Layer 1 — pure asset selection.

#### 6.2.2 Layer 2 — Scene generation

Inputs: Layer 1 asset + scene prompt template from matched Pattern. Outputs: `assets` row with `asset_type='generated_hero'`, `parent_asset_id` = Layer 1 asset, `source_model` = registry-resolved model ID, `generation_prompt` = compiled prompt.

Provider Registry resolves the optimal model for scene generation based on:
- Pattern's `target_models` array (preferred models)
- Pattern's `category` and `product_type`
- Brand's prior preferences (per R37 MAAX — `brand_preferences` table)
- Current model availability and tier (Provider Registry)

If scene generation fails (e.g. all preferred models unavailable), the registry retries with progressive fallback up to Tier 3 self-hosted. If all fail, the user receives an error; the request does NOT consume billable tokens.

#### 6.2.3 Layer 3 — Typography/CTA/doodle overlay

Inputs: Layer 2 asset + typography prompt template. Outputs: `assets` row with `asset_type='generated_section'`, `parent_asset_id` = Layer 2 asset, `source_model` = typography-strong model.

Provider Registry resolves the optimal typography model (current preference: Ideogram V3 via Remix). The Remix feature preserves Layer 2 composition while overlaying text/doodles.

If typography requirements are NULL (Pattern doesn't specify text), Layer 3 is skipped and Layer 2 output is the final image.

#### 6.2.4 Lineage chain (R20 v2 §2.2 enforced)

Every Tier 3 run produces a 2-3 row lineage chain in `assets`:
- L1 asset (root or `parent_asset_id=NULL`)
- L2 asset (`parent_asset_id` → L1)
- L3 asset (`parent_asset_id` → L2; if not skipped)

Recursive CTE query (per R20 v2 §2.2.4) reconstructs the chain for the Version History UI (B-1.16).

### 6.3 Pattern matching strategy

Tier 3 routing decision is data-driven via `match_image_patterns` (Tier 2). The flow:

1. Studio request → routing layer extracts: category, layout type, typography style (if specified), product type, audience, season, intent
2. Routing layer constructs an embedding of the request context (Provider Registry resolves an embedding model)
3. `match_image_patterns(query_embedding, category, layout, threshold=0.85, count=5)` returns top 5 patterns
4. If 0 results → fallback to Tier 3 "generate fresh" mode (no cached pattern — request will produce a new pattern candidate flowing back to Tier 1)
5. If 1+ results → select best pattern by composite score (qa_score × 0.5 + fidelity_score × 0.3 + (1 - cost_per_gen) × 0.2). Pattern is then used as the prompt template source.
6. Selected pattern's `usage_count` is incremented atomically; `last_used_at` is updated.

### 6.4 Multi-model chaining

Layer 2 and Layer 3 use different models. The chaining contract:

- Layer 2 output is committed to `assets` BEFORE Layer 3 starts. If Layer 3 fails, Layer 2 asset survives as a usable result (without text overlay).
- Provider Registry passes the Layer 2 asset URL to the Layer 3 model. If the Layer 3 model supports Remix-style (e.g. Ideogram V3), the asset URL is the reference. Otherwise, prompt-only path is used.
- Each layer emits a separate `token_usage_logs` row with `generation_id` matching the overall request.

### 6.5 Council of Brains for variant selection (Lock 11)

For high-stakes requests (e.g. brand's first generation, hero image for a flagship campaign), Tier 3 may generate multiple variants in Layer 2 and route to Council of Brains for selection:

- Generate 3-5 variants (each through full L1→L2→L3 chain)
- Council of Brains (5 brains) votes per Lock 12 (two-layer prompt token budget)
- Final variant per Council majority is presented to user; alternatives stored as siblings in `assets` with shared `parent_asset_id`

Council invocation is opt-in (set by Pattern's `style_schema.requires_council` flag or by user setting). Default is single-variant fast path.

### 6.6 Tier 3 failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| No matching pattern + no fallback model | Step 4 — 0 results AND registry has no fallback | `NO_PATTERN_NO_FALLBACK` | Return error to user; do NOT charge | Sentry warn |
| Layer 2 model timeout | Scene generation exceeds timeout | `LAYER2_GENERATION_TIMEOUT` | Retry with fallback; if all fail, return Layer 1 as best-effort + error message | Sentry warn |
| Layer 3 model failure after Layer 2 success | Typography model fails | `LAYER3_GENERATION_FAILED` | Return Layer 2 asset as result (without text overlay); user can retry Layer 3 only | OTel event |
| Bouncer rejects output pre-delivery | Step 4 pre-flight QA fails on final asset | `OUTPUT_BOUNCER_REJECT` | Silently regenerate up to 3x; if all fail, return error + log for Tier 1 investigation | Sentry warn |
| Cross-tenant asset reference | Asset INSERT with brand_id from different workspace | `FK_VIOLATION_COMPOSITE_BRAND_WORKSPACE` (per R20 v2 §2.2.3) | Transaction abort | Sentry critical |
| Provider Registry resolution loop | Registry resolves to a model that fails, fallback resolves to same model | `REGISTRY_FALLBACK_LOOP` | Halt registry after 3 hops; alert PO | Sentry critical |
| Token deduction race | Concurrent generations exceed balance | `TOKEN_BALANCE_NEGATIVE` (per R20 v2 §2.9.9) | RPC-level lock prevents; if hit, indicates Bug | Sentry critical |

### 6.7 Tier 3 edge cases

- **Customer has no products yet.** Tier 3 cannot run; Studio surfaces error. Onboarding flow (B-1.18) ensures at least one product before Studio access.
- **Pattern match returns stale result (last_used_at >180 days).** Use anyway; mark for Tier 1 re-validation (background job).
- **Layer 1 asset is itself AI-generated (from earlier Tier 3 run).** Allowed — lineage chain reflects iterative refinement.
- **User requests Section regeneration (Layer 3 only).** Skip L1+L2; reuse parent asset; run L3 with new prompt. Lineage extends from existing L2 asset.
- **User requests regeneration with prompt edit.** Treated as new request; new lineage chain root. Old chain preserved per B-1.16 Version History.
- **Brand has zero RLHF events.** Tier 3 routing uses default category-level QA scores; per-brand personalization (R37 MAAX) kicks in once 5+ events accumulate.
- **Generation hits 4K resolution cap (per CEO vision req #22).** Supported when Pattern's `style_schema.high_res = true`; cost adjusts via Provider Registry; Layer 3 may need to scale typography accordingly.

### 6.8 Tier 3 tests required

- **End-to-end happy path test:** Studio request → 3-layer pipeline → final asset stored → Pattern usage_count incremented → RLHF event emitted (generate_start). Assert all 8 substrates touched per B-1.00.
- **Pattern miss test:** Request with category not in Pattern DB → fallback fresh-gen path → new Pattern candidate flows to Tier 1.
- **Layer 3 failure recovery test:** Mock Layer 3 model failure → assert Layer 2 result returned + user-facing error message correct.
- **Cross-tenant prevention test:** User A requests generation referencing User B's brand → fails with FK violation.
- **Council of Brains opt-in test:** Pattern with `requires_council=true` → 5-variant generation + Council vote + winning variant returned; 4 sibling assets preserved.
- **Cost attribution test:** Single 3-layer generation → 3 token_usage_logs rows (one per layer) all with same generation_id.

---

## 7. RLHF Event Emission (Lock 9)

R24 v2 specifies the events that flow into `rlhf_votes` (R20 v2 §2.8.1) and `brand_preferences` (R20 v2 §2.13.1). The skill `rlhf-event-emission` (B-XC.10) implements this contract.

### 7.1 Event types and triggers

Per R20 v2 §2.8.1 `rlhf_votes.event_type` enum (8 values, locked):

| event_type | Trigger | Tier | Rating default |
|---|---|---|---|
| `manual_curation` | Tier 1 Curator swipe | Tier 1 | -1 (reject), 0 (skip), 1 (approve) |
| `drag` | User drags asset out of Studio (e.g. into email composer) | Tier 3 | 1 (positive signal) |
| `export` | User exports asset for download or share | Tier 3 | 5 (strong positive signal) |
| `regenerate` | User clicks regenerate on a variant | Tier 3 | -1 (implicit reject) |
| `generate_start` | User initiates a new generation request | Tier 3 | 0 (neutral; tracks demand) |
| `swipe_left` | Tinder swipe (B-1.06) reject | Tier 3 | -1 |
| `swipe_right` | Tinder swipe (B-1.06) approve | Tier 3 | 1 |
| `approval_gate` | P2.5 collaboration approval workflow (B-2.5.04) | Tier 3 | 1 (passed) or -1 (rejected) |

Rating values are restricted to {-1, 0, 1, 5} per Lock 9 CHECK constraint in DB.

### 7.2 Event payload contract

Every event emitted produces:
- `rlhf_votes` row with: `pattern_id` (matched pattern), `source_image_url` (original/reference), `generated_image_url` (result), `curator_id` (user UUID), `vote` (approve/reject/skip), `event_type`, `rating`, `generation_id`
- `brand_preferences` row (if MAAX wiring active per R37) with `studio_type`, `action_type`, `generation_id`, `context_payload`, `edit_delta`

Both rows use the same `generation_id` for cross-table correlation.

### 7.3 Programmatic events (Lock 8 — must NOT emit token usage)

Skill `rlhf-event-emission` is a programmatic event emitter. It does NOT consume model tokens. Therefore it MUST NOT write to `token_usage_logs` (per Lock 8). CI grep test enforces:

```bash
grep -ln "token_usage_logs.*insert\|tokenUsageLogs.*insert" apps/worker/src/lib/rlhf/*.ts 2>/dev/null
```

Any match in the RLHF emission code path fails CI.

### 7.4 RLHF aggregation (background)

A daily Inngest job (`aggregate-pattern-performance`) reads `rlhf_votes` and computes:
- 30-day rolling QA score → updates `pattern_performance_metrics.qa_score_rolling` (per Lock 9)
- All-time usage stats → updates `image_prompt_patterns.usage_count` and `last_used_at`

This aggregation is what enables Tier 3 routing to use up-to-date pattern quality scores without per-request recomputation.

---

## 8. Pattern Recipe Schema (Lock 5)

### 8.1 Lock 5 contract

Lock 5 mandates: the Pattern Recipe JSON schema is locked; drift is forbidden. Any change to the Recipe schema requires PO ratification + a coordinated update across:
- `pattern-recipe-validation` skill (Path E)
- Tier 1 Step 1 vision LLM extraction prompt
- Tier 2 INSERT validation (DSPy output check)
- Tier 3 prompt template injection

R24 v2 documents the canonical Recipe schema at v1.0. Schema updates produce R24 minor version bumps.

### 8.2 Recipe schema v1.0

```json
{
  "style_system": "fashion_editorial_campaign",
  "category": "fashion_editorial",
  "layout_type": "hero",
  "shared_principles": {
    "format": "portrait",
    "aspect_ratio": "2:3",
    "model_pose": "string description",
    "product_focus": "string description",
    "typography_placement": "string description",
    "color_harmony": "string description",
    "mood": "string description"
  },
  "variants": [
    {
      "id": "variant_1",
      "reference": "source URL or description",
      "background": { "color_hex": "#RRGGBB", "description": "string" },
      "props": ["array of prop descriptions"],
      "model_pose": "string description",
      "lighting": "string description",
      "color_grade": "string description",
      "typography": {
        "style": "T1_marker_scribble | T2_massive_caps | T3_outline_hollow | T4_curved_orbit | none",
        "color": "string description",
        "placement": "string description",
        "font_feel": "string description"
      },
      "era_reference": "string description"
    }
  ],
  "doodles": {
    "style": "string description",
    "elements": ["array of doodle element descriptions"],
    "feel": "string description"
  },
  "product_placement": {
    "method": "string description",
    "note": "string description"
  },
  "replication_prompt_template": {
    "instruction": "templated string with [PRODUCT_DESCRIPTION], [HERO_TEXT], [SECONDARY_TEXT], [LABEL_N] placeholders"
  },
  "negative_prompts": ["array of negative prompt phrases"],
  "requires_council": false,
  "high_res": false,
  "supports_typography": true,
  "extension": {}
}
```

**Required fields:** `style_system`, `category`, `layout_type`, `shared_principles`, `replication_prompt_template`. All others optional but conform to the shape above when present.

**Extension mechanism:** The `extension` field (JSONB object, default `{}`) allows non-breaking additions. New Recipe fields proposed in future R24 minor versions land in `extension` first; once stable, may be promoted to top-level in the next major version.

### 8.3 Recipe validation (skill `pattern-recipe-validation`)

The `pattern-recipe-validation` skill (a Tier 1 Builder Technical Skill, authored separately and uploaded to Portal product per D63 / Path E) validates:

1. JSON parses
2. All required fields present
3. `category` is one of the registered categories (data-driven via `pattern_categories` table — to be added in a future R20 migration if not present)
4. `layout_type` is one of the registered layout types
5. `variants` is non-empty
6. `typography.style` is one of the registered typography pattern IDs
7. `replication_prompt_template.instruction` contains at least one placeholder

The skill is loaded by:
- Tier 1 Step 1 — after Recipe extraction, before persisting
- Tier 2 INSERT path — before writing to `image_prompt_patterns`
- Tier 3 routing — Recipes pulled from cache are spot-checked at 1% sample rate for drift detection

### 8.4 Recipe drift detection

A weekly CI job iterates all `image_prompt_patterns` rows and validates each `style_schema` against the current schema. Drift rows are flagged in a report (no automatic deletion; PO decides remediation). Drift >5% triggers an alert.

---

## 9. Observability and Generation ID Propagation

### 9.1 Generation ID universal contract

Per FOUNDATION_AUTHORITY L7 + Lock 20 + R20 v2 §7.1, every Tier 3 production run starts with a `generation_id UUID` set at the Studio request boundary. This ID propagates through:

- API request boundary (`X-Generation-Id` header or POST body)
- Inngest function context as `event.data.generationId`
- DB INSERTs to: `assets` (all 3 layers), `token_usage_logs` (1 per layer), `rlhf_votes` (when events fire), `brand_preferences` (when MAAX active), `council_decisions` (when Council invoked)
- OTel span attribute `viyo.generation_id` on every span
- PostHog event property `generation_id` on every event
- Sentry tag `generation_id` on captured errors

Tier 1 generates its own `generation_id` per `image.ingested` event (no Studio request to inherit from).

### 9.2 OTel span hierarchy for Tier 3

```
viyo.studio.request (root span, generation_id set)
├── viyo.pattern.match (span: pattern matching)
├── viyo.layer1.asset_acquire (span: Layer 1)
├── viyo.layer2.scene_generation (span: Layer 2; child spans per provider call)
│   ├── viyo.provider.execute (provider call)
│   └── viyo.bouncer.layer2 (span: Bouncer QA)
├── viyo.layer3.text_overlay (span: Layer 3; conditional)
│   ├── viyo.provider.execute (provider call)
│   └── viyo.bouncer.layer3 (span: Bouncer QA)
└── viyo.rlhf.emit (span: RLHF event emission)
```

Each span carries `viyo.generation_id`, `viyo.workspace_id`, `viyo.brand_id`, `viyo.pattern_id`. Spans are sampled at 100% for errored requests and 1% for successful (cost optimization).

### 9.3 PostHog events

- `image.generation.started` — when Studio request received; properties: pattern_id, category, layout_type
- `image.layer1.completed` / `image.layer2.completed` / `image.layer3.completed` — per layer; properties: duration_ms, model_used (registry ID, not raw model name), cost
- `image.generation.completed` — final asset ready; properties: total_duration_ms, total_cost, asset_id
- `image.generation.failed` — terminal failure; properties: failure_code, layer_failed
- `image.bouncer.rejected` — pre-delivery QA reject; properties: rejection_reason
- `pattern.match.found` / `pattern.match.miss` — per Tier 3 routing decision

### 9.4 Sentry capture rules

| Error category | Severity |
|---|---|
| RLS / FK violations on `assets` | Error (potential bug or attack) |
| Provider Registry resolution loop | Critical |
| Pattern Recipe schema drift | Critical |
| Layer 2 / 3 timeout | Warn |
| Bouncer rejection (pre-delivery) | Warn |
| Cross-tenant brand contamination | Critical |
| Lock 19 hardcoded model detected (CI grep) | Critical |
| Lock 8 token_usage_logs.insert in programmatic path | Critical |
| Council decision timeout | Warn |
| DSPy compilation failure | Warn |

---

## 10. Failure Modes Summary (Cross-Tier)

See per-tier sections (§4.5, §5.6, §6.6) for detailed failure tables. Cross-tier categories:

| Category | Examples |
|---|---|
| Provider Registry | Resolution loop, no models available, fallback exhausted |
| Data integrity | Cross-tenant FK, Lineage cycle, RLS violation |
| Pattern integrity | Recipe schema drift, Pattern hot key, IVFFlat recall degradation |
| Generation | Layer timeout, Bouncer reject, Council deadlock |
| Privacy | Brand contamination, HYVE consent gate violation (R36 downstream) |
| Operational | Curator queue overflow, DSPy compilation failure, stale pattern usage |
| Governance | Lock 5 schema drift, Lock 8 programmatic token charge, Lock 19 hardcoded model |

---

## 11. Edge Cases Summary (Cross-Tier)

See per-tier sections (§4.6, §6.7) for detailed edge case lists. Cross-tier categories:

| Category | Examples |
|---|---|
| Bootstrap | Empty Pattern DB, customer with no products, brand with zero RLHF events |
| Concurrency | Same pattern racing usage_count updates, concurrent regenerations |
| Lifecycle | Source brand opts out mid-pipeline, Recipe schema update mid-run, AI-generated source image |
| Boundary | Threshold-too-high pattern match, Layer 3 skipped (no text), 4K resolution cap |
| Multi-version | Asset lineage with iterative refinement, sibling assets from Council variants |

---

## 12. Tests Required (ZCBR BR-3)

Tests covered per tier in §4.7, §5.7, §6.8. Aggregate ZCBR-grade test plan:

| Test category | Coverage |
|---|---|
| Tier 1 Learning Engine | Recipe extraction fidelity, Bouncer accuracy, Curator queue insertion, DSPy compilation threshold, cross-tenant isolation |
| Tier 2 Pattern Database | Vector similarity recall, service-role isolation, pattern write isolation, concurrent usage_count |
| Tier 3 Production Router | End-to-end happy path, Pattern miss fallback, Layer 3 failure recovery, cross-tenant prevention, Council of Brains opt-in, cost attribution |
| Pattern Recipe | Schema validation against fixture Recipes, drift detection sample |
| RLHF emission | 8-event-type coverage, Lock 9 rating CHECK enforcement, Lock 8 programmatic non-charging |
| Provider Registry | Resolution path, fallback chain, no-model-available, capability lookup |
| Observability | generation_id propagation across all DB tables + OTel + PostHog + Sentry |
| Lock 5 CI test | Recipe schema drift fixture rejected |
| Lock 8 CI grep test | No `token_usage_logs.insert` in rlhf code path |
| Lock 19 CI grep test | No hardcoded model name strings in normative R24 code paths |

CI integration: All tests run on every PR. Lock 5/8/19 grep tests run on every merge to staging.

---

## 13. Mechanical Acceptance Criteria (ZCBR BR-7)

R24 v2 implementation is accepted when:

1. **Three-Tier architecture implemented** — Tier 1 Learning Engine Inngest function exists at canonical path; Tier 2 Pattern DB schema lives per R20 v2 §2.3 (already implemented); Tier 3 Production Router consumes Tier 2 via `match_image_patterns` RPC
2. **Three-Layer Pipeline executes end-to-end** — Studio request produces 1-3 row lineage chain in `assets` with correct `asset_type` enum values + `parent_asset_id` linkage
3. **Provider Registry indirection live** — R29 PAL v2 registry exists; R24 v2 code paths call `providerRegistry.execute(...)` not direct model names; CI grep test passes
4. **Pattern Recipe schema validation skill loaded** — `pattern-recipe-validation` skill loadable via `skills.pickForTask`; validates against Lock 5 fixture
5. **RLHF event emission contract live** — all 8 event_types fire from correct triggers; Lock 9 rating CHECK enforces; Lock 8 grep test passes for rlhf code path
6. **Dual-Scoring architecture wired** — Bouncer (auto) + Curator (human UI) + DSPy (compilation) form the Tier 1 quality loop
7. **Multi-model chaining works** — Layer 2 and Layer 3 use different models; Provider Registry resolves both; failures in Layer 3 preserve Layer 2 result
8. **Council of Brains opt-in works** — `style_schema.requires_council=true` patterns trigger 5-variant + Council vote; sibling assets stored
9. **22 routing modes (A1-A22) documented and mapped** — current art-director.ts modes traced to Tier 1/2/3 functions; modes that aren't used flagged for removal in future Bullet
10. **Generation ID propagates across all surfaces** — single Studio request produces correlated rows in 5+ tables, OTel spans, PostHog events all sharing `generation_id`
11. **Pattern write isolation enforced** — only canonical write path can INSERT to `image_prompt_patterns`; CI grep test passes
12. **No hardcoded model names in R24 v2 normative code** — Lock 19 grep test passes
13. **Recipe schema drift detection live** — weekly CI job iterates patterns, validates against schema, reports drift
14. **Cross-tenant prevention enforced at Layer 1-3 INSERTs** — composite FK (brand_id, workspace_id) prevents cross-tenant brand assignment per R20 v2 §2.2
15. **Tier 1 runs continuously** — no scheduled end date; Inngest function active in production; ingestion events processed
16. **All 5 R24 v1 files superseded** — `R24-V2-SUPERSESSION-001` cleanup directive lands SUPERSEDED headers on all 5 within 24 hours of R24 v2 merge

---

## 14. Locks & Decisions Invoked

| Authority | Application in R24 v2 |
|---|---|
| Lock 4 (no in-memory schema) | All Pattern data persisted to `image_prompt_patterns` table; no runtime synthesis of patterns |
| Lock 5 (Pattern Recipe schema-drift forbidden) | Recipe schema v1.0 locked §9; validation skill enforces |
| Lock 6 (Brand Vault separation) | All generated `assets` rows carry required `brand_id` FK; composite FK prevents cross-tenant |
| Lock 8 (programmatic ops 0 tokens) | RLHF emission code path forbidden from writing `token_usage_logs`; CI grep enforces |
| Lock 9 (RLHF event constraints) | `rlhf_votes.rating` CHECK enforces {-1, 0, 1, 5}; `event_type` enum 8 values; 30-day rolling QA score |
| Lock 11 (Council of Brains for variant selection) | Optional Council invocation for high-stakes generations |
| Lock 12 (two-layer prompt token budget) | Council votes carry `token_budget_used` in JSONB |
| Lock 13 (multi-tenant RLS on Pattern DB write) | `image_prompt_patterns` is `service_role_only`; Tier 1 DSPy compile uses service role; Tier 3 reads via RPC |
| Lock 17 (Foundation-First Decision Making) | R24 v2 is foundation work; not a patch; full ZCBR rewrite |
| Lock 19 (Provider Agnosticism) | art-director.ts model enum refactor specified §3; Provider Registry indirection in all normative code |
| Lock 20 (ZCBR-Validated Specs Required) | This spec is ZCBR PASSED; Kimi pre-flight loads `zcbr-spec-validation` against R24 v2 |
| D55 (R29 PAL Option C — unified Plugin Registry) | R24 v2 cites R29 PAL v2 as Provider Registry source of truth |
| D56 (Token metering Phase 0/Phase 1 split) | Tier 3 per-layer cost attribution via `token_usage_logs.generation_id` |
| D63 (Skills do not live in git) | All R24-consumed skills (B-XC.07/08/09/10 + general Tier 1 skills) live in Drive + Portal product |
| D66 (B-1.00 first Path C Bullet) | R24 v2 is precondition for B-1.00; B-1.00 Bullet cites R24 v2 as ZCBR PASSED |
| CEO Vision Statement 2026-04-23 | All 5 corrections (§1.3) are normative |
| Master Sequence v1.1 §3.XC | This is B-XC.03 — CRITICAL R-spec rewrite |
| WP-5 MIGRATION_AUTOMATION_PROPOSAL.md | Future R24 schema migrations follow WP-5 trigger/idempotency/CI patterns (already established via R20 v2) |

---

## 15. Migration to v2 (Implementation Path)

### 15.1 Document supersession

This R24 v2 is committed via Path B Manus directive to `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md`.

Immediately after merge, the `R24-V2-SUPERSESSION-001` cleanup directive lands SUPERSEDED headers on all 5 v1 files:
- `docs/research_specs/R24_IMAGE_PIPELINE_VIDEO_ANALYSIS_COMPLETE.md`
- `docs/research_specs/R24_LEARNING_LOOP_CRITIQUE.md`
- `docs/research_specs/R24_MULTI_MODEL_IMAGE_PIPELINE_ENTERPRISE.md`
- `docs/research_specs/R24_VISION_CRITIQUE.md`
- `docs/research_specs/R24_VISION_STATEMENT_FROM_CEO.md`

Each v1 file retains content as historical reference. All carry pointer header: `**SUPERSEDED:** This file is superseded by R24 v2 at /docs/research_specs/R24_IMAGE_PIPELINE_v2.md. See that file for canonical pipeline contract.`

### 15.2 Implementation reconciliation

Existing implementation files at the audit's identified paths (`art-director.ts`, `image-router.ts`, `image-patterns.ts`, `art-director-routing.ts`, etc.) will be refactored Bullet-by-Bullet to align with R24 v2:

- **B-1.00 Studio Core Loop** (D66) — exercises the Three-Layer Pipeline end-to-end; touches Tier 3 routing + Layer 1/2/3 generation
- **B-1.05 Pattern Seeding** — populates initial Pattern DB rows; touches Tier 1 if ingestion is live, or static seed if not
- **B-1.06 Tinder Swipe Gate** — emits `swipe_left` / `swipe_right` RLHF events
- **B-1.13 Pattern Library Browser** — surfaces Pattern DB to user; reads via Tier 2 RPC
- **B-1.16 Version History** — recursive CTE on `assets.parent_asset_id`
- **B-1.18 Studio Onboarding** — ensures customer has products before Studio access
- **B-1B.01-B-1B.05** — Tier 1 ingestion + Curator Dashboard
- **B-XC.01 R29 PAL v2** — Provider Registry infrastructure (preconditional for full Lock 19 refactor)

### 15.3 Reviewer Claude validates R24 v2

At Reviewer Claude §9 Gate intake for any future image-pipeline-touching Bullet, R24 v2 is loaded via cited R-spec field. Reviewer runs `zcbr-spec-validation` against R24 v2 → must return PASS for Bullet to proceed. R24 v2 is the contract that defines the pipeline; Reviewer Claude verifies code against R24 v2 not against v1 fragments.

### 15.4 Kimi pre-flight cites R24 v2

When Kimi K2.6 receives a Bullet directive with R24 v2 in `R-spec:` field, Composer Queue pre-flight runs `zcbr-spec-validation` against R24 v2 → must return PASS for Kimi to begin code work.

### 15.5 V1 → V2 changelog

| Aspect | v1 (across 5 files) → v2 change |
|---|---|
| Header | Added YAML frontmatter with ZCBR Status PASSED + supersession declarations for all 5 v1 files |
| Architecture | Unified the Three-Tiered + Three-Layer + Dual-Scoring architectures (previously scattered across 5 v1 files) |
| CEO corrections | All 5 CEO corrections from VISION_STATEMENT (§1.3 here) are normative; supersede any contrary language in v1 video analysis or enterprise multi-model files |
| Provider Registry | Lock 19 refactor path for art-director.ts hardcoded models specified §3; defers concrete Provider Registry surface to R29 PAL v2 |
| Pattern Recipe | Lock 5 schema v1.0 locked §9; extension mechanism specified |
| RLHF | 8-event-type contract (§7.1) reconciled against R20 v2 §2.8 enums; Lock 8/9 enforcement specified |
| Multi-model chaining | NanoBanana → Ideogram chaining pattern from VIDEO_ANALYSIS now formalized in §6.4 as Provider Registry-resolved capability chaining |
| Council of Brains | Optional Lock 11 invocation specified §6.5 for high-stakes generations |
| Pattern taxonomy | Per CEO Correction 1, unbounded extensible taxonomy (not 3 types); typography styles T1-T4 documented as initial entries; new entries via Path F |
| Cost attribution | Per-layer token_usage_logs with shared generation_id (Tier 3 §6.4); Lock 8 enforcement for RLHF programmatic path |
| Observability | Comprehensive OTel + PostHog + Sentry contract §9 |
| Failure modes | Per-tier + cross-tier coverage §4.5/§5.6/§6.6/§10 |
| Tests | ZCBR BR-3 compliance — comprehensive plan §12 |
| Mechanical acceptance | 16 binary criteria §13 (ZCBR BR-7 compliance) |

---

## 16. Open Items NOT Closed by R24 v2

These remain PO action items or future Bullet work, deferred per Architect/PO directive:

1. **R29 PAL v2 schema** — `ai_provider_models` table + Provider Registry interface — authored separately via B-XC.01. R24 v2 cites; R29 v2 defines.
2. **`curator_queue` table** — referenced for Tier 1 Step 4. If not yet implemented in R20 v2, lands in R17 / B-1B.05 specialized spec.
3. **DSPy module specifications** — concrete DSPy compile module API surface. Deferred to DSPY-1 in Master Sequence LATER appendix.
4. **`pattern_categories` table** — registered category lookup for Recipe validation. Lands via future R20 minor version or B-XC R-spec.
5. **Concrete typography model selection** — current preference (Ideogram V3 via Remix) is data in Provider Registry, not code. R24 v2 doesn't bind to specific model.
6. **Curator UI component spec** — UI for Tier 1 Step 5 swipe. Lands in R17 specialized spec.
7. **Council of Brains 5-brain identities** — which brains vote on variant selection. Lock 11 specifies the framework; specific brain assignment per Bullet (B-1.07 Council Decision Surface).
8. **HYVE aggregation pipeline** — anonymized network intelligence rolling up from per-brand RLHF to `hyve_pattern_performance`. R36 covers in detail.
9. **DSPy approval threshold N** — initial value 5 approvals before DSPy compile fires; PO ratification of system_config value pending (OD-016 recommendation tracked).
10. **Bouncer accuracy threshold** — initial spec ≥90% binary classification accuracy; tunable via Provider Registry's QA model selection.
11. **Atlas Cloud + fal.ai provider catalog** — OD-003 open; affects Provider Registry composition. R24 v2 cites but doesn't define provider list.
12. **Pattern Seeding scope** — OD-004 open; affects how Tier 1 bootstraps before customer ingestion exists.

---

## 17. Document Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion VIYO Decision Log.

**Trigger for v3 or minor version bumps:**

- Major (v3): Pattern Recipe schema breaking change, Three-Tier architecture restructure, new mandatory layer in Three-Layer Pipeline, Lock breaking, supersession of R24 v2 itself
- Minor (v2.x): Additive Recipe fields, new RLHF event types, new failure modes from operational learning, new acceptance criteria
- Patch (v2.x.y): Typo corrections, clarifications, citation updates (e.g. when R29 PAL v2 ratifies, update §3.2 citation from "TO BE AUTHORED" to concrete v2 reference)

**Re-validation:** R24 v2 re-validates against ZCBR_STANDARD every 180 days per `zcbr-spec-validation` skill HEADER_STALE rule, or immediately after any ZCBR_STANDARD update.

---

*End of R24 Image Pipeline v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
