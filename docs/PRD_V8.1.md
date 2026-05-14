# PRD V8.1 — VIYO Product Requirements Document

**Version:** 8.1
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop)
**Phase 4 deliverable per CURATOR_MASTER_PLAN_v2 + VIYO_PATH_TO_MVP §Step 7**
**Supersedes:** `VIYO_MASTER_PRD_V8_FINAL.md` (Drive `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`, 799KB, modified 2026-05-08, pre-MVP-reset). V8 retained as historical Drive archive.
**Authority tier:** Below PO decisions; above FOUNDATION_AUTHORITY substrate, VVOW Architecture, R-spec ZCBR, per-Bullet directives, code. The canonical product north star.
**Authoring discipline:** Section-by-section with PO ratification per section. Single repo commit to `/docs/PRD_V8.1.md` after all 9 sections ratified. Lock 21 (Governance Agnosticism) compliant throughout — describes capabilities, not implementations. Pointer-heavy to canonical substrate (VVOW + 9 ZCBR-PASSED R-spec v2 + 29 Foundation Locks + INFRASTRUCTURE_DECISIONS + ARCHITECT/NIR OPERATING RULES + ANTI_PATTERN_CATALOG) — does not duplicate detail that lives in those files.

---

## Sections

| § | Title | Status |
|---|---|---|
| 1 | Identity & Positioning | **Ratified 2026-05-13** (with 4 Curator inline tags applied) |
| 2 | Strategy | **Ratified 2026-05-14** (with audit cadence note added) |
| 3 | MVP Definition | **Ratified 2026-05-14** (with 3 tightening edits applied: §3.4 Lovart specifics moved to §6; §3.5 R52 reclassified as post-launch; §3.3 critical-vs-parallel adjacency note added) |
| 4 | V1.0 6-Month Vision | **Ratified 2026-05-14** (Path 2 — keep label, §4.7 disclosure; with §1 cross-reference clause + §4.7 load-bearing prominence + §4.3-§4.6 Manus Inventory counts removed/tagged) |
| 5 | Architecture | **Ratified 2026-05-14 — Architecture A** (Portal-inclusive; OD-009 = next-Architect early priority; 2 inline corrections applied: Path C terminology replaced with VIYO_CURRENT_MAP §7 citation; §5.6 Red row 4 R-specs named with substrate) |
| 6 | Cost Model + Pricing Architecture | **Ratified 2026-05-14** (post 2-step structural reframe: pricing = Portal config; cost-transparency locked, margin numbers NOT locked — loss-leader valid; OD-001 + OD-021 CLOSED via §6.5 dissolution) |
| 7 | Roadmap | **Ratified 2026-05-14 + Lock 38 clarification SHA `397fd50`** (with 2 consistency items: §7.2 G3-G5 cite PRODUCT_ROADMAP.md §Release readiness gates; §7.5 cross-ref to §5.6 R-spec list) |
| 8 | Open Decisions | **Ratified 2026-05-14** (with 2 corrections applied: §8.3 MVP-blocking set = {OD-004, OD-005, OD-009, OD-019} = 4 ODs; OD-003 reclassified deferred-not-blocking Phase 1B; §7.2 G2 + §3.5 MVP-done list aligned) |
| 9 | Success Criteria | **Authored — surfacing for ratification** |

---

## §1 — Identity & Positioning

### §1.1 What VIYO Is

VIYO is an **AI Email Creative Operating System** for Shopify + Klaviyo brands. It is a unified product that absorbs the moats of four single-purpose competitors — Lovart, Migma, Grid & Pixel, Instant — into one platform driven by a shared brand intelligence layer.

"Operating System" is intentional. VIYO is not an email-design tool or an image-generation tool. It is the creative substrate a brand operates from: brand assets are generated, organized, edited, composed into emails, deployed, measured, and learned-from in one product, with each interaction feeding the brand's intelligence graph.

**Vertical:** e-commerce brands using Klaviyo for email marketing — Shopify-native brands at the Starter through Agency stage (typical revenue range $50K–$5M+ — Curator positioning estimate; verify in V8.2 against PO target customer profile), with a Klaviyo account active. VIYO is not for brands without Klaviyo (Klaviyo is the deployment substrate in Phase 2+). VIYO is not for brands that don't sell on Shopify (Shopify provides the catalog substrate via the R29 PAL adapter). VIYO is not for high-revenue brands with in-house creative teams that prefer custom workflows.

**Positioning vs. alternatives:**

| Alternative | What it costs the brand | What VIYO does differently |
|---|---|---|
| **Fragmented agency workflow** (designer + copywriter + email developer + analyst — typically 3–5 contractors at $3–15K/month combined) | $36K–$180K/year + coordination overhead + variable quality (Curator market estimate; based on 3–5 contractors at $3–15K/month combined × 12 months) | VIYO replaces the workflow with an AI-native creative OS at a fraction of the cost; shared brand intelligence means every output is on-brand by substrate |
| **Single-purpose tools** stacked (Canva for image + Klaviyo native templates for email + Klaviyo Analytics for measurement) | $50–$500/month in subscriptions + integration time + brand context fragmented across tools | VIYO unifies the workflow into one product where shared brand intelligence flows across surfaces; the same brand context that generates an image is consumed when composing an email |
| **Enterprise platforms** (Bloomreach, Klaviyo + Wonderkind, Salesforce Marketing Cloud) | $30K–$300K/year + 6–18 month implementation + dedicated team | VIYO is built specifically for the Shopify+Klaviyo SMB-to-mid-market segment that enterprise platforms don't serve cost-effectively and that the agency workflow can't serve at scale |

VIYO ships in phases. Each phase absorbs one competitor's single moat (per Lock 1 Product Sequencing). The product is not "all four competitors at once on day one" — the product is "Phase 1 Image Studio public launch first; Phase 2 + Phase 2.5 + Phase 3 ship sequentially over the V1.0 6-month vision (the 6-month vision is the aspirational phase sequence label; §4.7 discloses the realistic phase-to-calendar mapping that governs delivery timing)."

### §1.2 The 4-Competitor Moat Absorption

VIYO's structural moat is **the combination of four single-purpose moats into one shared-intelligence product.** No competitor combines image generation + email creation + flows-and-segmentation + hyper-personalization in one platform. The phase plan is the absorption sequence:

| Competitor | Their single moat | VIYO phase absorbing it | Substrate where the absorption is locked |
|---|---|---|---|
| **Lovart** (lovart.ai) | 3-zone image creation studio (Design Chat + Infinite Canvas + Floating Toolbelt) with intelligent regeneration + Pattern DB caching | **Phase 1 — Image Studio (VVOW canonical)** — current build, MVP target | VVOW Architecture v2.0 §1–§21; Lock 1 Product Sequencing; Lock 2 Unified GrapesJS Backbone (Studio SDK tuning); Lock 9 RLHF; Locks 4-7 + 10-11 image-substrate commitments |
| **Migma** (migma.ai) | Idea→inbox AI email + Figma/HTML/Screenshot import + visual editing + Remix from competitor emails + auto flows/segments/scheduling | **Phase 2 — Email Engine** — future, gated on Phase 1B Intelligence Foundation prerequisite | Lock 1 Sequencing; Lock 2 (MJML Plugin tuning); Lock 3 Email Studio Output JSON MJML Recipe; Lock 12 Brain Council 13-Agent scope |
| **Grid & Pixel** (gridandpixel.com) | Popups + Flows + Campaigns + Themes + Automatic Suppression + Magic Mail deliverability + AI Klaviyo Audits + Trust Layer ("you stay in control, AI executes") | **Phase 2 core + Phase 2.5 Trust Layer** — future | Lock 1 Sequencing; Phase 2.5 substrate defined in FOUNDATION_AUTHORITY §2.5; Brand Chat per Conflict Resolution C-06 |
| **Instant** (instant.one) | Personalised copy per shopper + Dynamic Products + Smart Coupons + Send-Time Optimization + Audiences (first-party data beyond cookies) + Instant Research Labs | **Phase 3 — Intelligence Studio (LENZ)** — future | Lock 1 Sequencing; FOUNDATION_AUTHORITY §2.6 Phase 3; Lock 10 Brand-Specific LoRA pipeline; Phase 1B Intelligence Foundation (ATLAS + MAAX + HYVE substrate) |

**Phase sequencing is structural, not arbitrary.** Per Lock 1 (Product Sequencing) and FOUNDATION_AUTHORITY §3 (Phase Sequencing Rules):

- **No phase skipping.** Each phase's competitor moat is structural to VIYO's positioning. Skipping Phase 1B Intelligence Foundation means Phase 2 ships without learned corpus — defeating Migma's "Remix from competitor" surface. Skipping Phase 2 means Phase 3 hyper-personalization has no email engine to personalize through — defeating Instant absorption.
- **Phase 1B is a hard prerequisite for Phase 2.** Email Engine without ingested corpus produces generic emails. The intelligence substrate must seed before Phase 2 ships.
- **Phase 2.5 follows Phase 2.** Trust Layer cannot ship before the surfaces it gates exist (Email Engine, deployment pipeline).
- **Phase 3 follows Phase 2.** Hyper-personalization requires Email Engine + Klaviyo deployment as the delivery substrate.
- **Phase 4+ is opt-in expansion.** Triggered by economics or user demand, not by date — additional ESPs, R39 admin expansion, public REST API, additional e-commerce platforms.

The current build is Phase 1 — Image Studio public launch as standalone product. The MVP definition (§3) is the Phase 1 scope minimum required for public launch.

### §1.3 Shared Brand Intelligence Layer

The four phases ship as one product because they share three intelligence substrates that compound across phases. Each substrate is built once and consumed by all subsequent phases.

| Substrate | What it is | When it activates | What it provides downstream |
|---|---|---|---|
| **ATLAS Top Brain** | Cross-brand corpus of competitor email archives + brand-of-interest content (ingested via R46 IMAP + R25 Video/IG into Brand Vault under the ingestion-corpus prefix). The industry-wide intelligence reference. | Phase 1B Intelligence Foundation (corpus build is the hard prerequisite for Phase 2) | Phase 2 Brain Council consults ATLAS for industry context; Phase 3 LENZ Intelligence Studio surfaces cross-brand patterns; the corpus is the substrate every brand reads from |
| **MAAX Per-Brand Memory** | Per-brand memory graph translating ATLAS corpus + per-brand performance data (SYPHON ESP ingestion) into brand-specific intelligence. Brain Council consults MAAX for every generation. | Phase 1B (graph scaffolded) + Phase 2 (Brain Council activates) | Every Phase 2 generation is informed by the brand's own validated patterns; Phase 3 personalization runs on MAAX-informed Audiences; Phase 1.10 V1.0.5 Brand-Specific LoRA is trained on MAAX's validated outputs |
| **HYVE Opt-In Cross-Brand Network** | Anonymized pattern aggregation across brands that opt in. Brands contribute validated patterns; receive proven patterns from peer brands. | Phase 1B (opt-in scaffolding) + Phase 3 (network effects activate as critical mass accumulates) | Phase 3 LENZ surfaces HYVE-derived insights; Pattern DB seed in Phase 1.9 expands beyond Milled scraping to peer-brand validated patterns; the network is what makes VIYO compound over peer brands |

**The intelligence layer is what makes VIYO compound over time.** Every brand that generates an image in Phase 1, composes an email in Phase 2, runs a flow in Phase 2, or personalizes a campaign in Phase 3 feeds the shared substrate that makes every future generation more on-brand.

**This is the defensible moat against single-purpose competitors:**

- **Lovart cannot do per-brand fine-tuning.** Their generation is per-prompt; no LoRA pipeline tied to brand. After 12 months, a Lovart customer's output is generic. After 12 months, a VIYO customer's output is progressively more on-brand at the model level (LoRA pipeline ships V1.0.5; 12-month on-brand improvement is Curator estimate pending RLHF flywheel operational data; Lock 10 Brand-Specific LoRA pipeline).
- **Migma cannot do cross-brand pattern learning.** Their import is per-customer; no shared corpus. VIYO's ATLAS corpus + HYVE network mean every brand inherits proven patterns the moment they sign up — Pattern DB seeded via Lock 11 Web Scraping + HYVE peer-validated additions.
- **Grid & Pixel cannot do AI-driven creative generation.** Their automation is operational (popups, suppression, audits); the creative comes from the user. VIYO generates the creative + automates operations in one product.
- **Instant cannot ship the assets it personalizes.** They personalize copy and offers; they don't generate images or compose emails. VIYO does the upstream work that makes downstream personalization possible.

VIYO does all four because the shared intelligence layer ties them together. The combination is hard to replicate by any single competitor because each would have to build three additional moats AND the intelligence substrate AND the integration — which is a 24-36 month undertaking at minimum (Curator estimate).

---

*End of §1 — Identity & Positioning.*

---

## §2 — Strategy

§2 articulates **how VIYO wins** at the substrate layer, not what it is (§1 covered identity + positioning). Four subsections: §2.1 the 8 advantages over Lovart that the Image Studio MVP earns; §2.2 the data flywheel articulated as the RLHF Learning Loop that compounds those advantages over time; §2.3 the R29 PAL 3-tier provider strategy with Provider Agnosticism (Lock 19); §2.4 the Pattern DB cache-first architecture that operationalizes the flywheel + makes provider routing economically defensible at scale. Each strategic claim cites the substrate (Lock # + VVOW § + R-spec) that locks it.

### §2.1 — 8 Advantages over Lovart (Image Studio MVP-specific moat)

Source: VVOW Architecture v2.0 §15 (PO-accepted 2026-05-12; Lovart capability baseline as of 2026-05-08 authoring window). Each advantage names the substrate where it's locked + the downstream compound effect.

**Audit cadence:** Lovart competitive baseline verified quarterly via dedicated Curator audit (7-signal staleness check — per-brand fine-tuning / empirical routing / brand vault integration / email integration / self-hosted infra / transparent provider-attribution billing / pre-seeded patterns from real data). Baseline current as of 2026-05-13 authoring. Quarterly scheduling lives in VIYO_CURRENT_MAP §15 maintenance protocol, not in this PRD body (Phase 5 cleanup item: add "quarterly Lovart competitive audit" to VIYO_CURRENT_MAP §15 drift detection routine).

**1. Pattern DB Cache-First Retrieval (T70 shipped).** Every generation request first queries the `image_prompt_patterns` vector DB for similar proven patterns; cache hits return the proven generation without consuming AI tokens for the pattern match itself. Lovart generates from scratch every time, paying full token cost per generation regardless of pattern overlap. VIYO's advantage compounds: every validated pattern (per §2.2 RLHF) becomes a future cache hit, progressively reducing marginal cost per generation. **Substrate:** Lock 4 (Single Image Generation Trace) + Lock 5 (Pattern Recipe JSON Schema) + T70 PR shipped. **Downstream compound:** Phase 2 Email Engine generations also benefit — email composition references the same Pattern DB via R29 PAL.

**2. RLHF Learning Loop (Bouncer + Tinder Swipe + DSPy).** Every user action emits an RLHF signal (drag = +1 qaScore, export = +5, regenerate = −1). QA Bouncer (GPT-4o-mini) auto-classifies generations; Tinder swipe gate (3 reviewers per OD-005) samples 50% of auto-approved + 20% of auto-rejected for human verification. DSPy optimizes prompt templates from validated patterns. Lovart provides no analogous learning loop — every customer's output stays at zero-context quality across time. After 5,000 swipe decisions per brand, a Fine-Tuned VLM Preference Classifier replaces humans for the sample. **Substrate:** Lock 9 (Implicit RLHF + Tinder Swipe Gate). **Downstream compound:** Phase 2 Email Performance Loop adds open-rate + click-rate signals that feed back into Pattern DB qaScore (VVOW §12.2).

**3. Art Director Router with Empirical Scoring (T46 v2 shipped).** Per-model scoring matrix populated empirically by multi-LLM tenant generation experiments + Tinder swipe gate validation. Routes each generation to the best-fit model for the specific image type per measured win-rate. Lovart uses fixed model-per-task routing (hardcoded). VIYO's matrix updates automatically as new models enter the R29 PAL registry — no code deploys required to adopt new models. **Substrate:** T46 v2 (PR #29, ZCBR PASSED 2026-05-12) + Conflict Resolution C-04 (Empirical Scoring Matrix). **Downstream compound:** Phase 2 Email Engine routes Brain Council generations through the same Art Director Router; Tier 2 frontier models join the matrix as complexity warrants.

**4. Brand Vault Integration with Database-Driven Organization.** R31 v2 (Product Data Extraction) auto-extracts brand assets from Shopify catalog + uploads + emails. Lock 6 (Brand Vault Organization Database-Driven) provides `parent_asset_id` lineage chains, `asset_type` enum (extensible), JSONB metadata, pgvector semantic search. Lovart requires manual upload per asset and provides folder-based organization. VIYO's brand context flows automatically into every generation. **Substrate:** R31 v2 (PR #30, ZCBR PASSED 2026-05-12) + Lock 6 + T72 PR shipped. **Downstream compound:** Phase 2 Email Studio references Brand Vault assets by UUID (no upload); live-sync edit modal opens Image Studio for in-flow editing per VVOW §2.3.

**5. Phase 2 Email-Native Output (compound advantage).** Generated images in Phase 1 flow directly into Phase 2 Email Studio via Brand Vault UUID reference — no upload, no format conversion, no manual re-import. When Email Studio ships (Phase 2), the Image Studio asset library is already populated with every brand-aligned image the user has generated. Lovart has no email integration; their customers must download generated images, upload them to a separate email tool, then compose. VIYO eliminates the asset → email handoff entirely. **Substrate:** Lock 2 (Unified GrapesJS Backbone — Studio SDK for image + MJML Plugin for email) + Lock 3 (JSON MJML Recipe). **Downstream compound:** This is the structural moat that makes VIYO a creative OS rather than a creative tool stack.

**6. Self-Hosted GPU at Scale (Tier 3 CapEx optimization).** When monthly generation volume hits 6,700 images, an L40S instance ($202/month CapEx) drops below retail Tier 1 aggregator pricing per image. At 18,700 images, A100 80GB ($562/month) becomes optimal. Tier 3 re-hosts Tier 1/2 models on owned infrastructure — doesn't change WHICH model runs, only WHERE. Admin-gated activation per Conflict Resolution C-05; not Phase 1 default. Lovart pays retail API prices indefinitely; their cost structure cannot replicate the CapEx optimization without rebuilding their provider layer. **Substrate:** Lock 7 (3-Tier Provider Strategy) + Lock 30 (Workflow Engine Mastra DAG only) + R29 v2 PAL (PR #25, ZCBR PASSED). **Downstream compound:** Per-tenant brand-specific LoRAs (Lock 10, V1.0.5) run cheapest on owned GPU.

**7. Transparent Token Economics (unified billing across providers).** R29 PAL Plugin Registry normalizes cost attribution across all AI providers — Tier 1 aggregators, Tier 2 direct APIs, Tier 3 self-hosted. Customer billing surfaces token-equivalent cost regardless of underlying provider; metering is consistent. Programmatic operations (Sharp/PIL compositing per Lock 8) are 0 tokens — customers don't pay for non-AI editing. Lovart's billing is per-credit at fixed conversion rates; customers can't audit which model their credits paid for. **Substrate:** R29 v2 PAL (Plugin Registry) + Lock 8 (Programmatic editing 0 AI tokens) + R23 v2 Cost Reconciliation Engine (pending ZCBR PASS). **Downstream compound:** Phase 2 Email Engine + Phase 3 personalization run on the same unified billing — customers see one bill for all AI work across the OS.

**8. Pattern Seeding from Real Validated Data (V1.0.5 — gated OD-002 legal review).** Pre-seeded Pattern DB from Milled web scraping of competitor hero images + Claude Vision reverse-engineering to Pattern Recipe schema. New brands inherit a populated Pattern DB on day one rather than starting blank. Lovart starts every customer from zero pattern context. **Substrate:** Lock 11 (Pattern Seeding via Web Scraping) + Phase 1B R46 IMAP ingestion + OD-002 legal review (Milled scope confirmed per VVOW §10.4; Email Love + Really Good Emails expansion gated). **Downstream compound:** HYVE opt-in cross-brand network (Phase 1B + Phase 3) extends Pattern DB seeding beyond scraped competitors to peer-brand validated patterns.

**Compound integration:** every advantage compounds with at least one other. Pattern DB cache (#1) is consumed by RLHF (#2); Art Director Router (#3) is informed by RLHF; Brand Vault (#4) feeds both Pattern DB and Email-Native Output (#5); Self-Hosted GPU (#6) optimizes Token Economics (#7); Pattern Seeding (#8) bootstraps everything else. Lovart would need to ship 8 advantages + the integration substrate to match — a 12-24 month rebuild minimum (Curator estimate).

### §2.2 — Data Flywheel (RLHF Learning Loop articulated)

The RLHF flywheel is the architectural commitment that makes VIYO compound over time. Lock 9 (Implicit RLHF + Tinder Swipe Gate) is the foundational source; this section articulates the flow from raw user action to Pattern DB validation.

**RLHF signal inputs** (per Lock 9):

| User action | qaScore delta | What it signals |
|---|---|---|
| Drag image variant to canvas (Zone 2) | **+1** | Pattern is good enough to keep working with |
| Export image for use outside Studio | **+5** | Pattern is proven (customer chose to use it commercially) |
| Ignore variant + click Regenerate | **−1** | Pattern is weak for this brief context |

Every user action in the Image Studio emits one of these signals (CODING_CONVENTIONS Rule 10 — every generation emits an RLHF signal; no untracked generations per Lock 4).

**The full flywheel loop:**

1. User submits brief in Design Chat → Visual Intent Router (Brain 5) embeds + queries Pattern DB.
2. Top 3 patterns returned → 3 variants generated via Mastra DAG (Lock 30) executing across Tier 1 models (Lock 7).
3. QA Bouncer (GPT-4o-mini) auto-classifies each variant: approve / reject (per Lock 9 sampling).
4. Surviving variants return to Design Chat as 3-image set.
5. User drags / exports / regenerates → RLHF signals fire (Lock 9).
6. Tinder Swipe Gate samples: 50% of auto-approved + 20% of auto-rejected → 3 reviewers (per OD-005) verify side-by-side vs. original.
7. Override events feed DSPy with high-signal training data.
8. Confirmation events validate auto-classification accuracy (drift detection).
9. DSPy optimizes prompt templates from validated patterns → updates `image_prompt_patterns.replication_prompt_template`.
10. Next generation request hits the cache (per §2.4 Pattern DB Cache-First) — improved patterns return as cache hits.

**Thresholds** (per sub-phase 1.8 + Lock 9):

- **1,000 accumulated RLHF events:** sub-phase 1.8 Phase 4 acceptance criterion. DSPy runs and produces improved prompt templates that update `image_prompt_patterns`. Tinder swipe gate operational.
- **5,000 swipe decisions per brand:** Fine-Tuned VLM Preference Classifier (trained on swipe outputs) replaces human reviewers for the sample. Humans become exception-only reviewers.
- **Brand-Specific LoRA threshold:** N validated patterns per brand (TBD per R24 v2.1) triggers LoRA training pipeline (Lock 10, V1.0.5 deferred).

**Compound effect over time** (Curator estimates pending RLHF flywheel operational data):

- Month 1: Pattern DB is seed-state (per §2.1 advantage 8); generations rely on Tier 1 routing + Claude Vision reverse-engineering of any new scraped patterns.
- Month 3-6: RLHF events accumulate; cache hit rate climbs as validated patterns become DB entries; per-brand qaScore aggregation surfaces brand-preferred styles.
- Month 6-12: Brand-Specific LoRA pipeline activates (V1.0.5); generations become progressively more on-brand at the model level.
- Month 12+: HYVE opt-in network shares validated patterns across brands; peer-brand-proven patterns enter new brands' Pattern DBs without scraping.

The flywheel is what makes VIYO compound. Lovart has no analogous loop — every customer's output stays at zero-context quality across time.

### §2.3 — Provider Strategy (R29 PAL 3-Tier with Provider Agnosticism)

VIYO's AI provider strategy is locked in Lock 7 (3-Tier Provider Strategy) + Lock 19 (Provider Agnosticism). The 3 tiers are routing layers, not primary/fallback:

| Tier | Layer | Providers | Models in tier | Purpose |
|---|---|---|---|---|
| **Tier 1** | Aggregators (Launch Primary) | Atlas Cloud + fal.ai (peers) | NanoBanana 2 Pro, Flux 1.1 Pro, Seedream | "Best for the Job" routing per T46 v2 Art Director scoring matrix; handles majority of traffic |
| **Tier 2** | Frontier Direct | OpenAI, Google, Ideogram (direct API) | GPT Image 2, Imagen 4, Ideogram V3 | Reserved for high-complexity requests Tier 1 cannot handle |
| **Tier 3** | Self-Hosted (Scale) | RunPod / Thunder Compute | Same models as Tier 1/2, hosted on owned GPU | CapEx optimization layer per Conflict Resolution C-05 |

**Routing logic (per R29 v2 PAL + Lock 7):**

1. **Tier 1 (default):** Art Director Router scores Tier 1 models on Best-for-the-Job criteria (quality × cost × speed × style). Atlas Cloud and fal.ai are peer aggregators — health check between them, route to whichever is healthy.
2. **Tier 1 → Tier 2 escalation is complexity-based, not failure-based.** Triggered when the brief's complexity exceeds Tier 1 capacity (e.g., text-heavy posters, very specific compositional requirements). NOT triggered by Tier 1 failure (failure within Tier 1 falls back to the peer aggregator).
3. **Tier 3 doesn't change WHICH model runs — only WHERE.** Re-hosts Tier 1/2 models on owned infrastructure once volume justifies the CapEx ($202/mo L40S at 6,700 img/mo; $562/mo A100 80GB at 18,700 img/mo). Admin-gated activation, NOT auto-spin-up.

**Provider Agnosticism (Lock 19):**

No application code names a specific AI model, OCR provider, ESP, or other third-party service in business logic. All selections live in the R29 PAL Plugin Registry. The application calls `provider.execute(task)`; the registry resolves the actual model based on Art Director scoring + RLHF history + Tier 1/2/3 routing + brand-specific overrides (e.g., per-brand LoRA per Lock 10).

Applies to all model classes: image generation, image segmentation (SAM 2), image upscaling (Real-ESRGAN), OCR (Tesseract), text generation, embedding, vision, video, audio, ESP delivery, e-commerce sync, payment processing. The single exception is the Plugin Registry itself, which is the registry of names.

**Strategic implication:** as new image models ship (Flux 2.0, NanoBanana 3, future entrants), they register in R29 PAL and become available without code deploys. The Art Director Router's empirical scoring matrix updates as Tinder swipe gate validation accumulates. Lovart's hardcoded model-per-task routing requires code deploys to adopt new models — a structural disadvantage that compounds as the image AI landscape evolves.

### §2.4 — Pattern DB Cache-First Architecture

The Pattern DB is the operational substrate of the data flywheel (§2.2) and the cost-control substrate of the provider strategy (§2.3). Lock 5 (Pattern DB + Pattern Recipe JSON Schema) locks the schema; Lock 4 (Single Image Generation Trace) locks the cache-first behavior; Lock 37 (Zod runtime validation) enforces schema integrity at runtime.

**Pattern Recipe JSON schema** (locked per Lock 5):

```
{
  "style_system": "string",
  "shared_principles": {
    "format", "aspect_ratio", "model_pose", "product_focus",
    "typography_placement", "color_harmony", "mood"
  },
  "variants[]": [{
    "background", "props", "lighting", "color_grade", "era_reference"
  }],
  "doodles": {"style", "elements[]", "feel"},
  "negative_prompts[]": [],
  "replication_prompt_template": {
    "prompt": "<with [PRODUCT_DESCRIPTION], [HERO_TEXT], [SECONDARY_TEXT]>",
    "negative_prompt": ""
  }
}
```

Schema drift is forbidden (Lock 5). Pattern Recipe is the canonical Pattern DB shape; any drift breaks Brain 5 (Visual Intent Router) pattern injection at runtime.

**Cache-first flow (per Lock 4 + VVOW §10.2):**

1. User types brief in Design Chat → Visual Intent Router embeds the brief.
2. Vector similarity search (pgvector cosine on Lock 34 Supabase Postgres) against `image_prompt_patterns` returns top-K patterns ranked by similarity + qaScore.
3. **If top result similarity ≥ threshold** (defined in R24 v2.1 pending): cache hit. Return the proven pattern's generation. Zero AI tokens consumed for the pattern match itself; tokens only consumed for product image injection (Brand Vault asset).
4. **If top result similarity < threshold:** cache miss. Route through Art Director Router (§2.3) → generate 3 variants via Mastra DAG.
5. Every generation event emits RLHF signal (per §2.2); validated patterns become future cache hits.

**Compound with §2.2 flywheel:**

- Every validated pattern reduces future generation cost. A 50% cache hit rate after 6 months effectively halves token costs (Curator estimate; precise hit rate pending RLHF operational data).
- Per-brand qaScore aggregation means cached patterns are increasingly brand-aligned over time.
- Brand-Specific LoRA pipeline (Lock 10, V1.0.5) is trained on the cached + validated patterns — moving brand intelligence from prompt-engineering layer to model layer.

**Strategic implication:** the Pattern DB is what makes VIYO economically defensible at scale. Lovart pays full retail per generation indefinitely. VIYO's marginal cost per generation declines as Pattern DB matures + Tier 3 self-hosted GPU activates. The two effects compound — a brand at 18,700 images/month running 50% cache hit rate + Tier 3 GPU pays roughly an order of magnitude less per generation than a comparable Lovart customer (Curator order-of-magnitude estimate pending operational data).

This is the structural reason VIYO's §6 cost model can support pricing competitive with Lovart at MVP launch while expanding gross margins at V1.0 scale through cache hit rate maturation + Tier 3 self-hosted GPU activation.

---

*End of §2 — Strategy.*

---

## §3 — MVP Definition

§3 defines the **Phase 1 scope minimum required for public launch** — the operational heart of this PRD. Five subsections: §3.1 the MVP scope statement (what's IN / what's DEFERRED to V1.0.5 / what's DROPPED to V1.1+); §3.2 the 11 sub-phase breakdown with substrate citations + current status; §3.3 the 12-16 week parallel-lane timeline (22-26 week serial fallback per OD-009 dependency); §3.4 the **Pricing Architecture Statement** (pricing is Portal-configured runtime, not PRD-locked; cost model + cost-transparency requirement authored in §6); §3.5 the one-sentence MVP done definition + B-1.18 Phase 1 Acceptance Gate criteria summary (detail in §9). Each sub-phase cites VVOW §, Lock #, R-spec ZCBR-PASSED source, and Bullet IDs from Master Build Sequence v1.1.

### §3.1 — MVP Scope Statement

**Phase 1 Image Studio standalone**, marketed as **"Lovart on Steroids"** (per Notion D41 ratification 2026-05-12 + VIYO_CURRENT_MAP §2). The Image Studio is a standalone product: a customer signs up at app.viyo.com, uses the Lovart-style 3-zone Studio (conversational chat + infinite canvas + floating B1-B10 toolbelt) to generate brand-aligned images, downloads them for use anywhere.

**Email composition is NOT in MVP. Klaviyo integration is NOT in MVP.** Email Engine (Phase 2) and Klaviyo deployment (V1.1+) ship after MVP public launch — see §4 V1.0 Vision for sequencing.

**What's IN (11 sub-phases per PRODUCT_ROADMAP.md):**

Sub-phases 1.1 through 1.8 (Core Loop → Pattern DB cache → Token billing → R2/Brand Vault → Editing Router → Multi-variant → Full editing tools → RLHF flywheel) plus sub-phase 1.11 (G2 Brand Kit Mode + G8 Character Consistency — public-launch blockers per VVOW §14). See §3.2 for sub-phase substrate citations + current status.

**Public launch scope minimum** (Bullets from Master Build Sequence v1.1 + VIYO_CURRENT_MAP §2):

- Phase 1 sub-phases 1.1-1.8 + 1.11
- **Admin shells:** B-1.01 brand admin signup + onboarding wizard at app.viyo.com; B-1.02 team invites + role assignment
- **Billing UI:** B-1.14 Lovart-style tiered billing UI substrate (per §3.4 Pricing Architecture Statement — runtime values via Portal admin; cost model + cost-transparency surfaces per §6)
- **Shopify integration:** B-0.17 Shopify connector read-only catalog sync (PKCE OAuth per Notion D48)
- **22 Generation Modes:** B-1.07 A1-A8 e-commerce + brand basics; B-1.08 A9-A14 brand + asset; B-1.09 A16-A22 marketing + fashion + e-commerce advanced; A15 covered in sub-phase 1.11
- **Designer Brain:** B-1.04 Brain 6 wiring (per Lock 12 Brain Council scope)
- **Recommended usability:** B-1.15 Brand Vault search + tagging (auto + manual `#`tagging per VVOW §11.4); B-1.16 Version History panel (parent_asset_id chain UI per Lock 6)
- **Acceptance ceremony:** B-1.18 Phase 1 Acceptance Gate (see §3.5 + §9)

**What's DEFERRED to V1.0.5** (per Notion D50 Pattern Seeding V1.0.5 deferral):

- **Sub-phase 1.9 Pattern Seeding** — gated on OD-002 legal review (Milled / Email Love / Really Good Emails scraping scope per VVOW §10.4). Pattern DB seeds via Lock 11 web scraping + R46 IMAP ingestion (Phase 1B); deferred because legal review is the blocker, not infrastructure.
- **Sub-phase 1.10 Brand-Specific LoRA** — fine-tuning pipeline (Lock 10) requires accumulated RLHF flywheel data + LoRA training infrastructure operational + Tier 3 self-hosted GPU substrate (Lock 7). Deferred because dependencies cascade beyond Phase 1 MVP scope.

**What's DROPPED from MVP entirely:**

- **B-0.18 Klaviyo connector scaffold** — Klaviyo deployment is the substrate for Phase 2 Email Engine (per Lock 1 sequencing). Shipping the scaffold in MVP would be infrastructure without product surface to consume it. Klaviyo enters V1.1 alongside Email Engine.

### §3.2 — Sub-Phase Breakdown

11 sub-phases per PRODUCT_ROADMAP.md. Status reflects staging HEAD `c08721c` (post-Curator session 2026-05-13 close). Each sub-phase cites VVOW §, Lock #, R-spec, and Bullet IDs where ZCBR-PASSED.

| Sub-phase | What it ships | Acceptance gate | Status | Substrate |
|---|---|---|---|---|
| **1.1 Core Loop** | Chat → Canvas → DB single-variant generation | T25 + T26 functional end-to-end | ✅ Shipped | VVOW §3 (3-zone canvas) + §10.1 (Pattern DB flow); Lock 4 (Single Image Generation Trace); R17 v2 UX |
| **1.2 Pattern DB cache** | Cache-first metadata transparency | T70 invariants | ✅ Shipped | VVOW §10.2 (Cache-First); Lock 5 (Pattern Recipe JSON Schema); Lock 4; R20 v2 |
| **1.3 Token billing** | Reconciliation across providers | T71 | ✅ Shipped | VVOW §8.6 (Token Economics); Lock 33 (Stripe payment processor); R23 v2 (Cost Reconciliation Engine — pending ZCBR PASS) |
| **1.4 R2 + Brand Vault** | Asset contract with lineage + JSONB metadata + pgvector embeddings | T72 | ✅ Shipped | VVOW §11 (Brand Vault Organization); Lock 6 (DB-driven org); R20 v2 + R31 v2 (Product Data Extraction) |
| **1.5 Editing Router** | Studio Editing Router routes B1-B10 + correct model per intent | T73 implementation per VVOW §13 + R24 v2.1 §X.B B1-B10 contracts | ⏸ PAUSED | VVOW §13 (Lovart parity capabilities) + §3 (Zone 3 Toolbelt); T47 v2 (B-XC.24 pending); R24 v2; T46 v2 Art Director Routing. **Gated on:** WP-1 + WP-2 verification per OD-019 |
| **1.6 Multi-variant generation** | One brief → 3 variants in Design Chat | TBD pending sub-phase Bullet authoring | ⏳ Not started | VVOW §10.1 (top-3 retrieval); Lock 12 (Brain Council scope — Brain 5 Visual Intent Router + Brain 6 Designer Brain); R19 v2 (LLM Orchestration). Bullets: B-1.03 Visual Intent Router, B-1.04 Designer Brain |
| **1.7 Full editing tools** | All B1-B10 functional with correct model routing | TBD pending sub-phase Bullet authoring | ⏳ Not started | VVOW §3 (Zone 3 Toolbelt) + §13 (Lovart parity); Lock 8 (Programmatic vs AI for text/color); R24 v2; T47 v2 (B-XC.24 pending). Bullets: B-1.11 programmatic (B2/B4/B7/B8), B-1.12 AI-powered (B1/B5/B6/B9/B10), B-1.13 B3 Layer Splitting (Lovart-style lazy extraction per Conflict Resolution C-01) |
| **1.8 RLHF feedback loop** | qaScore updates after 1,000 events; DSPy operational; Tinder swipe gate with 3 reviewers | 1,000 accumulated RLHF events + DSPy operational + Tinder swipe gate live (canonical via VVOW §16 Phase 4 acceptance test) | ⏳ Not started | VVOW §12 (RLHF) + §12.3 (Tinder Swipe Gate); Lock 9 (Implicit RLHF + Tinder Swipe Gate); DSPy via Mastra (Lock 30). Bullets: B-1.06 Tinder Swipe Gate UI (gated OD-005), B-1.17 DSPy optimization. **Gated on:** OD-005 (3 Swipe Gate reviewer accounts) |
| **1.9 Pattern Seeding (Milled scraper)** | Daily Inngest scrape; Pattern DB seeded with hero images | TBD pending V1.0.5 sub-phase Bullet authoring | ⏸ DEFERRED V1.0.5 | VVOW §10.4 (Pattern Seeding via Web Scraping); Lock 11 (Pattern Seeding); R46 IMAP ingestion (Phase 1B distinct pipeline). **Gated on:** OD-002 (legal review on Milled scope) |
| **1.10 Brand-Specific LoRA** | First brand reaches threshold; LoRA training pipeline produces deployable artifact | TBD pending V1.0.5 sub-phase Bullet authoring | ⏸ DEFERRED V1.0.5 | VVOW §12.4 (LoRA pipeline); Lock 10 (Brand-Specific LoRA Pipeline); Tier 3 self-hosted GPU substrate per Lock 7 |
| **1.11 Gap closure (G2 + G8)** | A15 Brand Kit Mode composite generation + G8 Character Consistency Across Scenes both shipped | TBD pending sub-phase Bullet authoring | ⏳ Not started | VVOW §14 (G1-G10 gaps; G2 + G8 explicit public-launch blockers); A15 per VVOW §4.3 (composite generation mode). Bullets: B-1.10 A15 Brand Kit Mode (G2), B-1.X G8 Character Consistency (new Bullet to insert in Master Build Sequence v1.2) |

**Curator note on sub-phase acceptance gates 1.6 / 1.7 / 1.11:** Acceptance gate columns marked "TBD pending sub-phase Bullet authoring" reflect that detailed gate criteria are authored at the Bullet level — each B-1.X Bullet directive defines its specific acceptance criteria via ZCBR (Lock 20). The high-level threshold for sub-phase 1.8 (1,000 RLHF events) is canonical via VVOW §16 Phase 4 acceptance test. Detailed gates for 1.6 / 1.7 / 1.11 will be defined by the relevant Bullet directives as they enter Composer Queue (per ARCHITECT_OPERATING_RULES §2 Decision Authority Matrix — Bullet ZCBR content requires PO ratification per Bullet). Inventing gate criteria in this PRD would violate Lock 21 (Governance Agnosticism — describes capability, not implementation).

### §3.3 — Timeline

**Estimated MVP timeline:**

| Scenario | Composer Queue concurrency | Total weeks | OD-009 status |
|---|---|---|---|
| Parallel lanes active | 2-3 lanes | **12-16 weeks** | OD-009 ratified |
| Serial execution | 1 lane | **22-26 weeks** | OD-009 unratified |

The 10-week range (12-16 vs 22-26) is the operational cost of OD-009 ambiguity. Recommend OD-009 ratification at fresh Architect session opening for Phase 4 — highest-leverage open decision for MVP launch velocity.

**Critical path** (Phase 1 sub-phase dependency graph per Master Build Sequence v1.1):

1. **T73 unblock (sub-phase 1.5)** — gated on WP-1 + WP-2 verification per OD-019. Currently PAUSED. Once unblocked, T73 implementation per R24 v2.1 §X.B B1-B10 contracts (R24 v2.1 minor bump is itself pending Architect authoring per VIYO_CURRENT_MAP §10).
2. **Sub-phase 1.6 Multi-variant** — depends on 1.5 substrate. Ships B-1.03 (Brain 5 Visual Intent Router) + B-1.04 (Brain 6 Designer Brain).
3. **Sub-phase 1.7 Full editing tools** — depends on 1.5. Can run parallel with 1.6 if OD-009 ratified for concurrent lanes. Ships B-1.11/12/13.
4. **Sub-phase 1.8 RLHF flywheel** — depends on 1.6 + 1.7 operational (generation pipeline + editing pipeline emit RLHF signals per Lock 9 + CODING_CONVENTIONS Rule 10). Ships B-1.06 + B-1.17. **Gated on OD-005** (3 reviewer accounts).
5. **Sub-phase 1.11 Gap closure** — depends on 1.5-1.8 (needs full Studio operational to validate G2 + G8). Ships B-1.10 (A15 Brand Kit Mode for G2) + B-1.X (G8 Character Consistency, new Bullet insertion in Master Build Sequence v1.2).
6. **B-1.18 Phase 1 Acceptance Gate** — depends on 1.5-1.8 + 1.11 + admin shells + billing + Shopify + 22 modes + usability all shipped.

The critical path is the **minimum serial chain** — the dependency sequence that cannot run concurrently. The parallel-safe Bullets listed below run **alongside** the critical path when Composer Queue concurrency is available (OD-009 dependency). **The parallel-safe work is IN scope per §3.1 — not optional.** The critical-vs-parallel distinction is about execution ordering and concurrency, not about MVP scope.

**Parallel-safe work** (runs alongside critical path when OD-009 concurrency available):

| Bullet | Parallel-safe with | Why parallel |
|---|---|---|
| B-1.01 Brand admin signup + onboarding | 1.5-1.8 | Auth/account substrate independent of generation pipeline |
| B-1.02 Team invites + role assignment | 1.5-1.8 + B-1.01 | Permission layer on top of B-1.01 substrate |
| B-1.14 Lovart-style tiered billing UI | 1.5-1.8 | Stripe integration on Lock 33 + billing UI surface independent |
| B-0.17 Shopify catalog sync | 1.5-1.8 | R29 PAL adapter work independent of image pipeline |
| B-1.07/08/09 22 generation modes | 1.6+ (after Brain 5 operational) | Each mode is a Pattern DB entry + brief template; substrate is shared with multi-variant |
| B-1.15 Brand Vault search + tagging | 1.7+ | UI surface on top of Lock 6 substrate (already shipped at T72) |
| B-1.16 Version History panel | 1.7+ | UI surface reading parent_asset_id chain from Lock 6 |

**Timeline dependency on OD-009:** If OD-009 is not ratified within ~2 weeks of Phase 4 Architect session opening, the parallel-lane scenario becomes unachievable for the first half of execution. The 12-16 week timeline assumes 2-3 lanes active from week 1; serial execution adds ~10 weeks because admin/billing/Shopify/22-modes/usability work must queue behind 1.5-1.8 instead of running alongside.

### §3.4 — Pricing Architecture Statement

VIYO pricing is **Portal-configured runtime, not PRD-locked artifact.** The same architectural principle as Lock 19 (Provider Agnosticism — no hardcoded values in business logic; resolved from config at runtime) applies to pricing: specific tier names, price points, credit allocations, free-tier definitions, annual discount magnitudes, top-up pack ranges, and customer migration paths are all **runtime configuration values** managed via Portal admin without governance or PRD revision.

**What this PRD locks at the pricing layer (per §6):**

- **Cost model** — operation-to-credit conversion + cost basis per Tier (per §6.1)
- **Cost-transparency requirement** — Portal MUST surface cost + margin computations at pricing-config-save time (per §6.2); margin numbers themselves are runtime business decisions, not locked
- **Competitive constraint** — cost model must support pricing competitive with Lovart (per §6.4 input; not a tier mapping)

**What this PRD does NOT lock:**

- Specific tier names, price points, credit allocations, free-tier credit allocations, annual discount %, top-up pack ranges
- Per-tier feature gating
- Customer migration paths at product expansion (Phase 2+ unlocks)
- Promotional pricing windows

These belong to **Portal admin runtime configuration**. Pricing decisions are operational, not architectural.

**OD-001 + OD-021 dissolved** by this reframe (per §6.5). The deck-slide-9-vs-Notion-D8 pricing conflict ceases to exist once pricing isn't a PRD-locked artifact. Both ODs CLOSE per §8 — superseded by "pricing is Portal configuration."

**MVP launch implication:** §3.1's "Lovart-competitive pricing at MVP launch" reads as "Portal-configured tiers at MVP launch must satisfy the §6 cost model + competitive constraint vs Lovart per §6.4." B-1.14 Lovart-style billing UI substrate (per §3.1 public launch scope minimum) is the implementation surface; specific tier values are Portal admin runtime input, set at MVP launch and adjustable thereafter without PRD revision.

### §3.5 — MVP Success Definition

**Phase 1 public launch complete** = **B-1.18 Phase 1 Acceptance Gate** ceremony confirms all the following (detail in §9 Success Criteria):

- All Phase 1.5-1.8 + 1.11 sub-phases shipped per §3.2 status table
- Admin shells (B-1.01/02) deployed at app.viyo.com + admin.viyo.com
- Lovart-style tiered billing UI substrate (B-1.14) operational with Stripe (Lock 33) integration; cost-transparency surfaces per §6.2 active at config-save — Portal-configured tier values informed by cost model + transparency per §3.4
- Shopify catalog sync (B-0.17) operational with PKCE OAuth per Notion D48
- All 22 Generation Modes (A1-A22) live and routed via Art Director Router (T46 v2)
- G2 + G8 public-launch blockers closed: A15 Brand Kit Mode functional + G8 Character Consistency functional
- 1,000 RLHF events accumulated (sub-phase 1.8 canonical acceptance threshold per VVOW §16 Phase 4 acceptance test)
- Open Decisions blocking public launch closed: OD-001 + OD-021 CLOSED via §6.5 dissolution (pricing = Portal config per §6.3); OD-004 (R29 v2 unified Plugin Registry ZCBR-PASSED), OD-005 (3 reviewer accounts provisioned), OD-009 (Composer Queue concurrency ratified), OD-019 (WP-1 + WP-2 verification closed). OD-002 + OD-003 deferred-not-blocking per §3.1 + §7.4 (V1.0.5 / Phase 1B).
- All cited R-specs ZCBR PASSED: 9 already shipped 2026-05-12 (R17, R19, R20, R21, R22, R24, R29, R31, T46) + R23 v2 (fresh authoring with verified R29 v2 citations) + R24 v2.1 (minor bump) + R33 Shopify Integration + T47 v2 Studio Editing Tools
- Minimum DR substrate operational per B-0.21 Backup + Disaster Recovery foundation (Master Build Sequence v1.1 P0 Bullet): Supabase point-in-time recovery confirmed + R2 cross-region snapshot policy active + documented recovery runbook in `/docs/runbooks/` tested via tabletop exercise. *(R52 fresh comprehensive DR runbook authored at B-XC.23 is post-launch ops infrastructure, NOT B-1.18 gate-blocking; see §9 Success Criteria for post-launch deliverables.)*

**The one-sentence MVP done definition:**

> *"Phase 1 MVP is done when a new Shopify-native brand can sign up at app.viyo.com, connect Shopify (read-only catalog), generate brand-aligned images via the 3-zone Lovart-style Studio across all 22 generation modes (A1-A22), edit them via the B1-B10 toolbelt, organize them in Brand Vault with auto + manual tagging, and pay tokens for AI work at Portal-configured pricing meeting the §6 cost model + competitive constraint (per §6.4 Lovart reference) — with G2 Brand Kit Mode and G8 Character Consistency both functional and the RLHF flywheel emitting validated signals at the 1,000-event threshold."*

This definition is operational, customer-facing, and verifiable: every clause maps to a B-1.18 acceptance test criterion. Klaviyo is intentionally absent — Klaviyo enters V1.1 alongside Email Engine per Lock 1 sequencing.

Detail in §9 Success Criteria.

---

*End of §3 — MVP Definition.*

---

## §4 — V1.0 6-Month Vision

§4 articulates **what ships after Phase 1 Image Studio MVP public launch through the 6-month horizon** — the post-MVP phase narrative. Seven subsections: §4.1 phase sequence overview pointing to §1.2 4-competitor absorption table; §4.2 Phase 1B Intelligence Foundation (hard prerequisite for Phase 2 — R46 + R25 + SYPHON + MAAX + HYVE substrate); §4.3 Phase 2 Email Engine (Migma + Grid & Pixel core moats; Klaviyo enters the product here); §4.4 Phase 2.5 Brand Team Collaboration + Trust Layer; §4.5 Phase 3 LENZ Intelligence Studio (Instant moat); §4.6 Phase 4+ opt-in expansion (triggered by economics, not date); §4.7 honest 6-month horizon Curator-call assessment surfacing the gap between "V1.0 label = full phases 1+1B+2+2.5+3" vs. "6-month calendar window realistic delivery = MVP + Phase 1B substrate + Phase 2 begin only."

### §4.1 — Phase Sequence Overview

Phase plan for VIYO from current state (Phase 1 Image Studio MVP in build) through the V1.0 full-product horizon. Each phase absorbs one competitor moat per §1.2 absorption table; substrate citations + sequencing rules per FOUNDATION_AUTHORITY §3 + Lock 1 (Product Sequencing). The §1.2 absorption table is the canonical source — this table summarizes for §4 readability without duplicating.

| Phase | What it ships | Competitor moat absorbed | Depends on |
|---|---|---|---|
| **Phase 1** | Image Studio standalone (this PRD's MVP — see §3) | Lovart | Phase 0 substrate (complete) |
| **Phase 1B** | Intelligence Foundation (R46 IMAP + R25 Video/IG + SYPHON ESP + MAAX per-brand graph + HYVE opt-in cross-brand network) | None — corpus prerequisite for Phase 2 | Phase 1 public launch |
| **Phase 2** | Email Engine (13-Agent Brain Council activated + MJML compilation + Klaviyo deployment + 12 flow templates + Segments + Popups + Magic Mail + AI Klaviyo Audits) | Migma + Grid & Pixel core | Phase 1B ingested corpus operational |
| **Phase 2.5** | Brand Team Collaboration + Trust Layer (Brand Chat + team approvals + activity feed + notifications) | Grid & Pixel Trust Layer + Migma collaboration surface | Phase 2 surfaces exist |
| **Phase 3** | LENZ Intelligence Studio (personalized copy + dynamic products + smart coupons + send-time optimization + Audiences + Super Templates + PULZE + Smart Insight Engine) | Instant | Phase 2 Email Engine + Klaviyo deployment as delivery substrate; Phase 1B intelligence as personalization fuel |
| **Phase 4+** | Opt-in expansion (Timer Service / R39 Admin Portal expansion / additional ESPs / BFCM / public REST API / deeper Shopify) | None — breadth, not new moat | Triggered by economics or user demand, NOT by date |

**Sequencing rules locked per Lock 1 + FOUNDATION_AUTHORITY §3:** no phase skipping; Phase 1B is hard prerequisite for Phase 2; Phase 2.5 follows Phase 2; Phase 3 follows Phase 2; Phase 4+ is opt-in expansion. The 4-competitor absorption argument in §1.2 is the structural justification for this sequence — see §1.2 for the defensibility argument that makes the sequencing non-arbitrary.

### §4.2 — Phase 1B Intelligence Foundation

**Hard prerequisite for Phase 2 per Lock 1 + FOUNDATION_AUTHORITY §2.3.** Email Engine without ingested corpus produces generic emails — defeating Migma's "Remix from competitor" surface and degrading Phase 2 Brain Council quality. The intelligence substrate must seed before Phase 2 ships; this phase is not parallelizable with Phase 2 build.

**Components:**

| Component | Function | Substrate citation |
|---|---|---|
| **R46 IMAP Email Ingestion** | AgentMail-based IMAP ingestion of brand-of-interest emails + competitor emails into ATLAS Top Brain corpus | R46 Email Ingestion (PENDING RE-VALIDATION + MINOR FIX per R-Spec Audit Table — VVOW §10.4 confirms IMAP scope; Milled web scraping is a separate pipeline per Lock 11) |
| **R25 Video/IG Ingestion** | Instagram Reels + YouTube + uploaded MP4 ingestion (V1.2 hybrid OpenClaw model) | R25 Video/IG Intelligence Module (PENDING RE-VALIDATION per R-Spec Audit Table) |
| **SYPHON ESP Data Ingestion** | Brand's own ESP data — Klaviyo segments, lists, performance metrics — synced into per-brand memory | R38 SYPHON (substrate pending — R-spec to be authored in Phase 1B; FOUNDATION_AUTHORITY §8.6 notes "10 KB inventoried but not read fully") |
| **MAAX Per-Brand Memory Graph** | Translates ATLAS corpus + SYPHON ESP data into per-brand memory graph; Brain Council consults per generation | R37 MAAX (substrate pending — R-spec to be authored in Phase 1B; FOUNDATION_AUTHORITY §8.6 notes "11 KB inventoried but not read fully") |
| **HYVE Opt-In Cross-Brand Network** | Anonymized pattern aggregation across brands that opt in; extends Pattern DB seed beyond scraped competitors | R36 HYVE (substrate pending — R-spec to be authored in Phase 1B; FOUNDATION_AUTHORITY §8.6 notes "25 KB inventoried but not read fully") |

**Why prerequisite, not parallel:** Phase 2 Brain Council outputs depend on MAAX + ATLAS consultation per Lock 12 (Brain Council scope). Shipping Phase 2 without intelligence substrate means Brain Council generates from prompt-only context — same quality as competitors that lack a per-brand memory layer. The phase sequencing rule (Lock 1) is what protects VIYO's defensibility argument from §1.3 (the shared brand intelligence layer is the compounding moat).

### §4.3 — Phase 2 Email Engine

**Absorbs Migma + Grid & Pixel core moats per §1.2 + FOUNDATION_AUTHORITY §2.4.** The largest single phase by feature volume (specific feature count carried forward from Manus Inventory per FOUNDATION_AUTHORITY §2.4 pending Phase 5 verification — not load-bearing for V8.1 PRD positioning).

**Components:**

- **13-Agent Brain Council activated:** 7-Brain Council (CMO + Audience + Offer + Copywriter + Image Design + Email Design + Critic) + 6 platform agents (VeriClaw + Flow Strategy + SMS Copywriter + ATLAS + Smart Insight Engine + Contextual AI Advisor). Scoped per Lock 12.
- **Email Bible loaded** (CMO Brain dependency for canonical email composition heuristics).
- **Composable sections + MJML compilation** per Lock 3 (Email Studio Output is JSON MJML Recipe, NOT raw HTML). 12 MJML Section Templates (Hero / Split / Grid / Editorial / etc.) — AI fills slots with text and Brand Vault asset UUIDs; never writes raw HTML.
- **Migma-style import:** Figma / HTML / Screenshot import + Remix from Phase 1B ingested corpus.
- **Deployment pipeline activates.** **Klaviyo is the launch-default ESP** (per §3.1 — dropped from MVP entirely, enters V1.1 alongside Email Engine; **registry-swappable per Lock 38 Universal Service Agnosticism**). Substrate: R29 PAL ESP adapter activated for Klaviyo — scaffold ships in Phase 1 (B-0.18 originally; dropped from MVP); active scopes (`campaigns:write`, `templates:write`) ship here in Phase 2. Per Lock 38, additional ESP class members (ActiveCampaign / Brevo / Mailchimp / SendGrid per Phase 4+ §4.6) register in R29 PAL Plugin Registry — Klaviyo is the default, not the only option.
- **12 specialized flows:** Welcome / Cart / Browse / Win-back / VIP / Post-purchase / Birthday / Replenishment / Re-engagement / Pre-purchase / BFCM / Educational.
- **Segments + Audiences** scaffolded (Audiences fully activate in Phase 3 per §4.5).
- **Popups** (Grid & Pixel surface).
- **Deliverability + Magic Mail** (Grid & Pixel surface).
- **Automatic Suppression** (Grid & Pixel surface).
- **AI Klaviyo Audits** (Grid & Pixel surface).

**Substrate:** Lock 1 (sequencing); Lock 2 (Unified GrapesJS Backbone — MJML Plugin tuning activates here); Lock 3 (JSON MJML Recipe); Lock 12 (Brain Council 13-Agent scope); Lock 19 (Provider Agnosticism — R29 PAL Klaviyo adapter via Plugin Registry); R32 Email Engine (substrate pending — full read + extraction at B-XC.05 per FOUNDATION_AUTHORITY §8.6 "38 KB not read fully").

### §4.4 — Phase 2.5 Brand Team Collaboration + Trust Layer

**Absorbs Grid & Pixel Trust Layer + Migma collaboration surface per §1.2 + FOUNDATION_AUTHORITY §2.5.**

**Components:**

- **Brand Chat (Slack-style threading, mentions, approvals)** per T33-T36 Brand Chat Comments subsystem (Conflict Resolution C-06 — Phase 2.5 deferred per VVOW; Brand Chat splits from Design Chat which ships in Phase 1).
- **Generation session shareable URLs.**
- **Team approval workflows** (Approver / Editor / Viewer role differentiation per FOUNDATION_AUTHORITY L1 substrate).
- **Activity feed.**
- **Notification dispatch** (in-app + email per Lock 31 Inngest event substrate).
- **Trust Layer** ("you stay in control, AI executes" — Grid & Pixel moat absorption surface). Phase 2 Brain Council outputs gate through team approval workflows before Klaviyo deployment per Phase 2.5 Trust Layer.

**Substrate:** Lock 1 (sequencing — 2.5 follows 2); FOUNDATION_AUTHORITY §2.5; T33-T36 (PENDING RE-VALIDATION per R-Spec Audit Table — IMPT triage, JIT-stub); Conflict Resolution C-06 (Brand Chat split).

### §4.5 — Phase 3 LENZ Intelligence Studio

**Absorbs Instant moat per §1.2 + FOUNDATION_AUTHORITY §2.6.**

**Components:**

- **Personalized copy per shopper** (Instant moat surface).
- **Dynamic products** (Instant moat surface).
- **Smart coupons** (Instant moat surface).
- **Send-time optimization** (per-recipient timing).
- **Audiences** (first-party data beyond cookies — Instant moat surface).
- **Super Templates** (auto-generated from validated patterns per Pattern DB + RLHF flywheel from Phases 1 + 2).
- **LENZ analytics dashboard.**
- **PULZE pattern surfacing** (HYVE-derived insights from Phase 1B cross-brand network).
- **Smart Insight Engine** (5 scheduled generators per FOUNDATION_AUTHORITY substrate L5 Data Flywheel).

**Depends on:**

- **Phase 2 Email Engine** as delivery substrate — personalization without email delivery has nothing to personalize through.
- **Phase 1B Intelligence substrate** — MAAX per-brand memory + HYVE cross-brand network are the personalization fuel.
- **Phase 2 deployment pipeline to Klaviyo** — per-recipient personalization sends via Klaviyo segments + send-time optimization API.

**Substrate:** Lock 1 (3 follows 2 + 1B); FOUNDATION_AUTHORITY §2.6; R-spec substrate pending (R36 HYVE / R37 MAAX / R38 SYPHON to be authored across Phase 1B + Phase 3); Lock 10 Brand-Specific LoRA pipeline (V1.0.5 deferred; informs per-shopper personalization at the model level).

### §4.6 — Phase 4+ Opt-In Expansion

**Triggered by economics or user demand, NOT by date.** Not a single phase but a family of expansion tracks per FOUNDATION_AUTHORITY §2.7 that activate independently when triggers fire.

**Tracks:**

- **Timer Service (R28)** — currently deferred per INFRASTRUCTURE_DECISIONS ID-4 (Cloudflare Worker scope deferred; revisits when traffic justifies edge optimization).
- **R39 Admin Portal expansion** — impersonation, cross-tenant analytics surfaces, LLM token reconciliation, audit log surfaces. Phase 1's `admin.viyo.com` is the minimum admin shell; R39 expands beyond MVP scope.
- **BFCM module** — currently DEFERRED-001 per FOUNDATION_AUTHORITY Appendix B (no R-spec, no PRD section). Black Friday / Cyber Monday seasonal automation; deferred 2026-05-03 pending strategic activation trigger.
- **Public REST API (VF-49).**
- **Additional ESPs via R29 PAL:** ActiveCampaign / Brevo / Mailchimp / SendGrid — adapters register in Plugin Registry per Lock 19. Klaviyo remains primary; additional ESPs are breadth not depth.
- **Additional e-commerce platforms via R29 PAL:** WooCommerce / BigCommerce / Magento adapters. Shopify remains primary.
- **Self-hosted GPU activation** when economics threshold hit (6,700 img/mo → L40S; 18,700 img/mo → A100 80GB per Lock 7); admin-gated per Conflict Resolution C-05, NOT auto-activated.

**Substrate:** FOUNDATION_AUTHORITY §2.7; Lock 7 (3-Tier Provider Strategy + Tier 3 activation thresholds); Lock 19 (Provider Agnosticism — Plugin Registry); R39 Global Admin (PENDING RE-VALIDATION per R-Spec Audit Table, LATR triage).

### §4.7 — 6-Month Horizon Statement (Curator-call: timeline realism)

**Curator-call surfacing:** The "V1.0 6-month vision" label conflates two distinct concepts — the **canonical V1.0 scope** (Phases 1 + 1B + 2 + 2.5 + 3 fully shipped) and a **calendar window** (6 months from Phase 4 Architect session opening, roughly 2026-05-14 → 2026-11-14). These do not align in realistic delivery.

**This phase-to-calendar mapping is the load-bearing disclosure for the "V1.0 6-month vision" label — read this table before drawing conclusions from §1 or §4.1 about delivery timing.**

**Realistic phase-to-month mapping** (Curator estimates pending Architect-side resource planning):

| Phase | Months 0-4 (MVP build) | Months 4-7 (post-MVP) | Months 7-12+ (stretch) |
|---|---|---|---|
| Phase 1 Image Studio MVP | **build → ship** (per §3.3: 12-16 weeks parallel; 22-26 weeks serial pending OD-009) | stable / iteration / V1.0.5 (Pattern Seeding + LoRA) | mature |
| Phase 1B Intelligence Foundation | not started | **substrate authored + ingestion pipelines built** (R46 + R25 + SYPHON + MAAX + HYVE R-specs authored; ingestion infrastructure operational) | corpus accumulated; ATLAS operational; ready to fuel Phase 2 |
| Phase 2 Email Engine | not started | not started (Phase 1B is prerequisite per Lock 1) | **build begins** (Brain Council activation + MJML compilation + Klaviyo deployment + 12 flow templates + popups + deliverability + audits) — realistically 4-6 months itself given 220 features |
| Phase 2.5 Brand Team Collab | not started | not started | not started (2.5 follows 2) |
| Phase 3 LENZ Intelligence Studio | not started | not started | not started (3 follows 2 + 1B) |

**Honest 6-month deliverable target** (months 0 → ~6 from 2026-05-14): Phase 1 MVP public launch (~4 months) + Phase 1B Intelligence Foundation substrate operational (months 4-6) + Phase 2 Email Engine begin (~6+ months, foundation work only, not customer-facing). Phase 2.5 + Phase 3 are 6-12+ month targets, NOT 6-month deliverables.

**6-month label vs. delivery reality:**
- The "V1.0" label as marketing/investor framing = full Phases 1 + 1B + 2 + 2.5 + 3 product.
- The realistic 6-month delivery from 2026-05-14 = Phase 1 public launch + Phase 1B substrate + Phase 2 begin (NOT ship).
- Full V1.0 realistic delivery window = **12-18 months** from 2026-05-14 (Curator estimate; PO ratification pending if this framing is the correct external positioning vs. 6-month aspirational).

**Curator-call decision — surface for PO direction. Two paths:**

1. **Reframe "V1.0 6-month vision" → "V1.0 12-18 month vision"** throughout PRD V8.1 §1 + §4 + §7. Reflects realistic delivery; sets investor + customer expectations honestly. Requires §1, §4, §7 edits if ratified.
2. **Keep "V1.0 6-month vision" label** as north-star aspiration; explicitly tag §4.7 as the realistic-delivery-scope disclosure (6-month delivery = MVP + Phase 1B substrate + Phase 2 begin, NOT full V1.0). Maintains brand positioning without misleading because §4.7 is explicit.

**Curator recommendation: Option 2** (keep label, tag realistic delivery scope explicitly in §4.7). Rationale: the label is investor-facing aspiration; the realistic scope is operational honesty; both can coexist if §4.7 is explicit about the distinction (which this section is). Future PRD revisions (V8.2+) can refine the label as delivery data accumulates from Phase 1 actual ship date + Phase 1B authoring velocity.

**PO action:** Ratify Option 2 (default) OR direct Option 1 reframe / alternative framing.

---

*End of §4 — V1.0 6-Month Vision.*

---

## §5 — Architecture

§5 establishes the architecture substrate **by pointer rather than restatement** — VVOW v2.0 + 9 ZCBR-PASSED R-spec v2 files + FOUNDATION_LOCK.md 29 Locks + INFRASTRUCTURE_DECISIONS ID-1..ID-6 + FOUNDATION_AUTHORITY 12 substrates are the canonical sources. This section synthesizes what readers need to know to consume those sources, surfaces the Portal Scope Validation Curator-call (Architecture A inclusive vs. B deferred), and registers MVP-relevant architecture risks. Six subsections; pointer-heavy per Lock 21.

### §5.1 — Architecture Overview

Substrate stack at a glance (locked per Stack Constraints Locks 30-37 + product-architecture Locks 1-14 + INFRASTRUCTURE_DECISIONS ID-1..ID-6):

| Layer | Substrate | Locked by |
|---|---|---|
| Frontend | Next.js 14+ App Router | Lock 36 |
| Canvas engine | GrapesJS Studio SDK (Studio SDK tuning Image Studio; MJML Plugin tuning Email Studio Phase 2) | Lock 2 + Lock 32 |
| Database | Supabase Postgres + RLS + pgvector + Auth + Realtime | Lock 34 + Lock 13 + Lock 14 |
| Storage | Cloudflare R2 (zero egress, S3-compatible, two buckets) | ID-3 + Lock 6 |
| Cache + rate limit | Upstash Redis (two databases verified isolated) | Lock 35 + ID-6 |
| Outer orchestration | Inngest (event-driven jobs + retries + step-level checkpointing) | Lock 31 |
| Inner orchestration | Mastra DAG (`@mastra/core` inside each Inngest step) | Lock 30 |
| AI providers | R29 PAL Plugin Registry (Tier 1 aggregators / Tier 2 frontier direct / Tier 3 self-hosted) | Lock 7 + Lock 19 |
| Image AI models | SAM 2 / Flux 1.1 Pro / Real-ESRGAN / Sharp / PIL / Tesseract / Claude Vision | Lock 8 + Lock 19 (no model names in business logic — all via registry) |
| Billing | Stripe token-metered (hard stop at zero) | Lock 33 |
| Runtime validation | Zod | Lock 37 |
| Type discipline | TypeScript strict mode | CODING_CONVENTIONS Rule 3 |

**Canonical architecture sources** (read for detail; not duplicated here):

- **VVOW Image Studio Architecture v2.0** at `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` (PO-accepted 2026-05-12) — Phase 1 canonical implementation reference.
- **9 ZCBR-PASSED R-spec v2 files** (merged 2026-05-12, one-line purpose each):
  - **R17 v2** UX Architecture — 3-zone canvas + Zone 1/2/3 layout contracts
  - **R19 v2** LLM Orchestration — Brain Council scope + two-layer prompt assembly
  - **R20 v2** Database Schema — `image_prompt_patterns` / `assets` / `pattern_performance_metrics` tables + RLS policies
  - **R21 v2** Infrastructure — Vercel + Render + Supabase + R2 deployment; 3 environments per service
  - **R22 v2** Security & Auth — Supabase Auth + RLS enforcement + MFA scaffold
  - **R24 v2** Image Pipeline — model registry + Pattern Recipe schema + B1-B10 contracts (R24 v2.1 minor bump pending)
  - **R29 v2** PAL — Plugin Registry + ESP/e-commerce adapters + AI provider abstraction
  - **R31 v2** Product Data Extraction — Brand Vault organization + Shopify catalog sync
  - **T46 v2** Art Director Routing — empirical scoring matrix per Conflict Resolution C-04
- **FOUNDATION_LOCK.md** (SHA `30972b0`) — 29 ratified Foundation Locks. Not enumerated here; consult source.

### §5.2 — 12 Substrates

12 horizontal capability layers per FOUNDATION_AUTHORITY §5. Each substrate is built once and consumed by every VIYO phase:

| Layer | Capability |
|---|---|
| **L1** Identity & Multi-Tenancy | Supabase Auth + RLS + workspace concept + Owner/Admin/Approver/Editor/Viewer roles |
| **L2** Asset Model | Brand Vault organization (R2 bytes + `assets` table lineage + JSONB + pgvector) per Lock 6 |
| **L3** Provider Routing | R29 PAL Plugin Registry per Lock 19 (AI / ESP / e-commerce / payment / OCR / segmentation / upscaling via `provider.execute(task)`) |
| **L4** Job Orchestration | Inngest outer + Mastra DAGs inner; step-level checkpointing; RLHF event emission per Lock 9 + CC Rule 10 |
| **L5** Data Flywheel | `rlhf_events` + `pattern_performance_metrics` + qaScore propagation (compounds per §2.2) |
| **L6** Token Metering & Billing | `llm_usage_events` + Stripe webhook handler + token deduction RPC (Lock 33) |
| **L7** Observability | OpenTelemetry + Sentry + PostHog + structured JSON logs + `generation_id` correlation |
| **L8** Real-time Substrate | Supabase Realtime (Broadcast + Presence + Postgres Changes) |
| **L9** Storage | R2 buckets + custom domain + versioning + lifecycle + signed URLs per ID-3 |
| **L10** Webhook Pipeline | 7-retry exponential backoff + HMAC verification + idempotent processing per Notion D11 |
| **L11** Skill System Layer 1 | 11 Tier 1 Builder Technical Skills (Architect / Reviewer / Kimi consume at build time) |
| **L12** Skill System Layer 2 | AI Brain Pattern Skills in `skills_registry` table + Layer 1 Platform Skills in orchestrator code per D57 |

**Pointer:** FOUNDATION_AUTHORITY.md §5 for substrate detail + Phase-by-Phase extensions + anchoring feature IDs.

### §5.3 — Infrastructure Decisions

ID-1 through ID-6 ratified by PO 2026-05-08 per INFRASTRUCTURE_DECISIONS.md:

| ID | Decision | Status |
|---|---|---|
| **ID-1** | Canonical staging branch = `staging` (not `develop`) | Active |
| **ID-2** | Auto-deploy on push to `main` pre-Alpha; revert to manual at Alpha launch | Active |
| **ID-3** | Cloudflare R2 = canonical asset storage (not Supabase Storage) | Active |
| **ID-4** | Cloudflare Worker scope for R28 = DEFERRED (post-launch optimization) | Active |
| **ID-5** | Git-connected Vercel deployments mandatory (verified per WP-3) | Active (4 projects) |
| **ID-6** | Redis isolation runtime smoke test required (verified per WP-4 / PR #15) | Active (2 databases isolated) |

**Verified infra state** (per VIYO_CURRENT_MAP §9 — read for detail; not duplicated):

R2 (2 buckets + custom domain) / Render (2 worker services + auto-deploy) / Upstash Redis (2 databases isolated) / Supabase (3 projects + pgvector v0.8.0; **migrations currently manual — automation pending WP-5**) / Inngest (3 environments) / Sentry (5 projects) / Vercel (4 projects + Git connection verified) / Cloudflare D1/Hyperdrive/Pages confirmed absent / Cloudflare Workers only legacy `sg_worker` (not VIYO-owned).

### §5.4 — Provider Architecture

R29 v2 PAL 3-tier provider strategy. Full strategic implication in §2.3; full implementation contracts in R29 v2 PAL spec (`/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md`). Summary:

- **Tier 1 Aggregators** (launch primary): Atlas Cloud + fal.ai peers route NanoBanana 2 Pro / Flux 1.1 Pro / Seedream per "Best for the Job" Art Director Router scoring matrix (T46 v2).
- **Tier 2 Frontier Direct**: OpenAI + Google + Ideogram direct APIs for high-complexity Tier 1 cannot handle. **Escalation is complexity-based, NOT failure-based** (corrected from T46 v6.1 inverted logic per FOUNDATION_AUTHORITY §7.3).
- **Tier 3 Self-Hosted**: RunPod / Thunder Compute re-host Tier 1/2 models for CapEx optimization. Activates at 6,700 img/mo (L40S $202/mo) → 18,700 img/mo (A100 80GB $562/mo); **admin-gated per Conflict Resolution C-05**, not auto.

**Lock 19 Provider Agnosticism (restated for emphasis):** No application code names a specific AI model, OCR provider, ESP, e-commerce platform, or payment processor in business logic. All selections via R29 PAL Plugin Registry. Application calls `provider.execute(task)`; registry resolves based on Art Director scoring + RLHF history + Tier routing + brand-specific overrides (e.g., per-brand LoRA per Lock 10). Single exception: the Plugin Registry itself, which is the registry of names.

**Relationship to Lock 38 (Universal Service Agnosticism, ratified 2026-05-14):** R29 v2 PAL Plugin Registry implements the runtime-resolution pattern for the AI provider class. Lock 38 generalizes the same pattern to all external service classes — ESPs, payment processors, CRMs, analytics, e-commerce platforms, OCR providers, segmentation providers, upscaling providers, and any future class. The Plugin Registry holds the vendor selection per class; business logic calls a capability interface; the registry resolves the concrete vendor. Lock 19 remains in force as the AI-provider-specific elaboration; Lock 38 is the universal principle Lock 19 instantiates. R29 v2 PAL is already the implementation substrate for Lock 38's pattern across the classes it currently covers; additional service classes register via the same registry pattern without governance revision.

### §5.5 — Portal Scope Validation (load-bearing Curator-call)

**Question:** Is Kimi K2.6 Composer Queue inside Portal (`ai.viyo.new`) **necessary for MVP Phase 1 launch**, or deferrable to V1.1+ alongside Phase 2 Email Engine?

**Architecture A — Portal-inclusive (current canonical per VIYO_CURRENT_MAP §7 agent topology):**

Bullet directives flow through Portal Composer Queue → Kimi pre-flight runs ZCBR validation against cited R-specs (Checkpoint 3) → Kimi generates code per directive + Builder Technical Skills → Reviewer Claude runs §9 Gate + ZCBR pre-flight per ZCBR_STANDARD §5 Checkpoint 2 → output enters commit queue → PO ratifies → Portal Manus commits to VIYO repo on `staging`.

**Benefits:** ZCBR Lock 20 enforcement via external validation (Reviewer Claude §9 Gate) closes Family 2 (incomplete surfacing) anti-pattern per ANTI_PATTERN_CATALOG §3 Category 1 — single canonical execution pipeline; Portal already LIVE per VIYO_CURRENT_MAP §5; Composer Queue concurrency (pending OD-009) unlocks 2-3 parallel lanes per §3.3 (12-16 weeks vs 22-26 weeks).

**Costs:** Portal must remain operational + stable through MVP launch; OD-009 must ratify for parallel execution (serial Path C adds ~10 weeks per §3.3); Reviewer Claude validation latency factors into Bullet velocity.

**Architecture B — Portal-deferred (V1.1+ activation):**

Bullet directives execute via Manus VIYO channel directly per Heavy/Lean directive (same pattern used for 10 governance commits this Curator session). No Composer Queue routing; no Kimi pre-flight; ZCBR validation runs as Architect self-validation only (Checkpoint 1); PO + Architect inspect PR before Manus merge. Portal stays LIVE but activates Composer Queue + Kimi for Phase 2 Email Engine Bullets when orchestration substrate is required.

**Benefits:** Simpler MVP path; Manus VIYO commit pattern proven (this session); no OD-009 ratification dependency for execution; fewer moving parts.

**Costs:** **Loses external validation enforcement** — Reviewer Claude §9 Gate doesn't run automatically per Bullet, leaving only the weakest of the 3 ZCBR checkpoints (Architect self-validation per §5 Checkpoint 1). Family 2 risk increases. Lock 20 isn't fully operational under B (Checkpoints 2 + 3 don't fire). Manual validation = inside-the-flow validation, not external; ANTI_PATTERN_CATALOG fix relies on external mechanisms. Portal Composer Queue starts cold when Phase 2 needs it; activation friction at V1.1.

**Curator recommendation: Architecture A — Portal-inclusive.**

Reasoning:
1. ANTI_PATTERN_CATALOG §3 Category 1 (External Validation) is the foundational fix for Family 2 (6 of 15 observations). Architecture B removes the primary external validation mechanism (Reviewer Claude §9 Gate). The Curator session's foundational reset is undone if MVP Bullets bypass Portal.
2. Lock 20 (ZCBR-Validated Specs Required) explicitly cites Reviewer Claude §9 Gate (Checkpoint 2) and Kimi pre-flight (Checkpoint 3) as the enforcement mechanisms. Architecture B drops Checkpoints 2 + 3; only Architect self-validation remains. Lock 20 isn't operational under B.
3. Portal is already LIVE per VIYO_CURRENT_MAP §5 — Architecture A doesn't require new infrastructure for MVP. The dependency is OD-009 ratification (Composer Queue concurrency model), which is needed anyway for the parallel-lane timeline per §3.3.
4. OD-009 ratification is high-leverage — required for 12-16 week MVP timeline regardless of Portal scope choice. Resolving OD-009 unlocks both Architecture A AND the §3.3 parallel-lane timeline simultaneously.

**PO action:** Ratify Architecture A (Curator default) + OD-009 ratification as Phase 4 next-Architect priority, OR direct Architecture B with explicit acknowledgment of the Lock 20 validation enforcement gap.

### §5.6 — Architecture Risk Register

| Risk | Severity | Substrate / mitigation |
|---|---|---|
| GitHub Dependabot 24 vulnerabilities on default branch (12 high, 11 moderate, 1 low) | Yellow | Pre-existing; deferred to post-Phase 6 Architect per Curator session 2026-05-13 close. See §9 post-launch deliverables. |
| Manual database migrations (WP-5 pending) | Yellow | Migration automation design pending; affects deployment velocity post-MVP; not B-1.18 blocking. |
| **OD-009 Composer Queue concurrency model unratified** | **Red** | Affects MVP timeline 12-16 vs 22-26 weeks per §3.3 + Architecture A operational readiness per §5.5. Highest-leverage open decision per VIYO_CURRENT_MAP §10. |
| Notion DB drift (FOUNDATION_AUTHORITY §9.2 stale "D1-D29" claim vs actual ≥D84) | Yellow | Phase 5.1 Notion Decisions DB sweep + FOUNDATION_AUTHORITY refresh in Phase 5.2. Not B-1.18 blocking. |
| FOUNDATION_AUTHORITY §4 lock count drift ("14 Foundation Locks" header vs actual 29 ratified) | Yellow | Phase 5.2 Notion Foundation Locks DB sync to FOUNDATION_LOCK.md SHA `30972b0`. Not B-1.18 blocking. |
| **4 R-specs not yet ZCBR-PASSED: R23 v2 (fresh authoring needed) + R24 v2.1 (minor bump pending) + R33 Shopify Integration (new authority per Notion D48) + T47 v2 Studio Editing Tools (predates ZCBR — MINOR FIX per R-Spec Audit Table). R52 excluded per §3.5 reclassification as post-launch ops.** | **Red** | B-1.18 blocking per §3.5. Architect-side authoring work in fresh Phase 4 Architect session post-PRD ratification. |
| Phase 1 skill specs (B-XC.07-10) Portal upload state uncertain | Yellow | Per VIYO_CURRENT_MAP §10 — may already be uploaded to ai.viyo.new; verification pending. Phase 5.6 Airtable Skills Registry audit. |
| R52 fresh DR runbook (B-XC.23) | Green | Not B-1.18 blocking per §3.5; B-0.21 minimum DR substrate is operational substitute. Post-launch ops deliverable per §9. |

**Pointer:** STATE_AUDIT.md at `/docs/governance/audits/STATE_AUDIT.md` (SHA `bb67d37`) for full governance surface audit. VIYO_CURRENT_MAP §9 + §10 for current state + pending work substrate.

---

*End of §5 — Architecture.*

---

## §6 — Cost Model + Pricing Architecture

§6 establishes what VIYO locks at the pricing layer — the cost model (§6.1) + the cost-transparency requirement (§6.2) + the architectural statement that pricing is Portal-configured runtime (§6.3). **Margin numbers (floors, targets, thresholds) are explicitly NOT locked** — pricing strategy including thin-margin, zero-margin, and deliberate loss-leader is a runtime business decision per §6.3, informed by §6.2 cost-transparency surfaces. Competitive reference data (§6.4) is input to cost-competitiveness verification, not a tier-mapping target. §6.5 records OD-001 + OD-021 as CLOSED via dissolution. §6.6 captures pricing architecture risks. **No "Era 1 / Era 2" framing — that was an artifact of treating pricing as locked.** There are no eras; there is a locked cost model + cost-transparency requirement, and Portal-configured runtime pricing. Same principle as Lock 19 (Provider Agnosticism) applied to pricing: don't hardcode business decisions, lock the substrate that informs them.

### §6.1 — Cost Model (locked)

Operation-to-credit conversion + cost basis by Tier. **This is what §6 locks.**

| Operation | Credit cost | Cost basis | Rationale |
|---|---|---|---|
| Standard image generation (Tier 1 aggregator) | **5 credits** | $0.02–$0.05 per generation (varies by model per §2.3) | Mirrors Lovart per-image rate for competitive cost reference (§6.4) |
| High-complexity generation (Tier 2 Frontier Direct escalation) | **10 credits** | $0.10–$0.20 per generation | 2x rate reflects Tier 2 frontier API cost per §2.3 |
| Upscaling (B7 Real-ESRGAN per Lock 8) | **3 credits** | $0.01–$0.03 per operation | Separate cost class per VVOW §8.8.2 editing models |
| Segmentation (B3 Layer Splitting / B5 Object Removal via SAM 2) | **2 credits/op** | $0.005–$0.01 per operation | SAM 2 cost separate from generation cost |
| Programmatic operations (B2 / B4 / B8 via Sharp/PIL per Lock 8) | **0 credits** | <$0.0001 per operation (compute only) | Lock 8: programmatic ops are 0 AI tokens |
| Pattern DB cache hits (per §2.4 + Lock 4) | **0 credits** | <$0.0001 per lookup (DB query only) | Cache returns proven pattern; no AI token consumed |
| Per-brand LoRA generation on Tier 3 self-hosted (V1.0.5 per Lock 10) | **0 credits** | Amortized CapEx + ~$0.001 compute | LoRA on owned GPU shifts cost to CapEx per Lock 7 |
| Per-brand LoRA generation on Tier 1/2 (V1.0.5) | **5 credits** | Same as standard generation | LoRA layer adds quality not cost |

**Gross margin per Tier** (substrate for §6.2 cost-transparency surfaces):

| Tier | Cost per standard generation | Gross margin range |
|---|---|---|
| Tier 1 aggregator | $0.02–$0.05 | ~85% at Portal-configured median pricing |
| Tier 2 frontier direct | $0.10–$0.20 | ~40% at Portal-configured median pricing |
| Tier 3 self-hosted (post-CapEx) | $0.001–$0.005 amortized | ~95% at Portal-configured median pricing |

**Compound margin trajectory per §2.4:** Pattern DB cache hit rate (Curator estimate 50% at month 6 pending RLHF operational data) effectively reduces marginal cost per credit. Tier 3 activation per Lock 7 thresholds (6,700 img/mo L40S; 18,700 img/mo A100 80GB; admin-gated per Conflict Resolution C-05) shifts marginal cost to CapEx-amortized at scale. Aggregate gross margin compounds over the V1.0 vision horizon as Pattern DB matures + Tier 3 activates.

**Customer-facing economics surfaces** (Portal billing UI per B-1.14):

- **"Cached" badge** + $0 credit debit on cache-hit variants. Monthly usage report shows "Saved X credits via Pattern DB cache" as separate line — transparency surfaces §2.4 compound effect.
- **B1-B10 toolbelt UI** distinguishes "AI tools" (debit credits) from "Programmatic tools" (free) per Lock 8.
- **"LoRA-optimized" badge** when generation runs on Tier 3 self-hosted GPU (V1.0.5+).

### §6.2 — Margin Visibility (locked principle)

**The Portal MUST always compute and display cost/margin information at pricing-config time.** This is the locked principle. **Specific margin numbers (floors, targets, thresholds) are NOT locked** — they are runtime business decisions, same as pricing tiers.

**Locked: cost-transparency surfaces.**

The Portal billing admin UI (per B-1.14 substrate + §6.3 Portal Config) MUST always compute and display, at pricing-config time:

- **Cost per operation** from §6.1 cost model (operation type → underlying cost basis per Tier)
- **Gross margin per tier at current provider mix** — projected margin if the proposed pricing config is saved (e.g., "Pro tier at $69/mo / 11,000 credits = 84% gross margin assuming 90% Tier 1 / 8% Tier 2 / 2% Tier 3 routing mix")
- **Aggregate margin across configured customer base** — current-state aggregate gross margin across all active tiers + their customer counts (e.g., "Current aggregate: 76% across 234 active brands")
- **Margin trajectory under cache hit assumption** — projected margin at month 6 / 12 with cache hit rate assumptions per §2.4 (e.g., "Projected month-6 margin: 88% at 50% cache hit rate")

The Portal MAY display a recommended margin range as **operator-side suggestion** (initial Curator suggestion for reference: 35% per-brand / 65% aggregate, anchored against Tier 2 frontier direct gross margin ~40%). This is a **surface to the operator**, not a floor that blocks configuration save.

**What is explicitly NOT locked:**

- Specific margin numbers (floors, targets, thresholds)
- "Below margin X, refuse to save config" enforcement logic
- Any pricing strategy classification (premium / parity / discount / **loss-leader** / zero-margin / break-even)

**Loss-leader pricing is an explicitly valid strategy.** Under investor-funded acquisition phases, VIYO may configure Image Studio pricing below cost to acquire the Shopify+Klaviyo segment before competitors react. The architecture MUST enable this — a locked margin floor would block VIYO's own strategy. The locked principle is that the operator sees the cost consequences clearly when configuring (via the transparency surfaces above), not that the operator's pricing choice is constrained.

**Strategic implication:** pricing strategy is a business decision **informed by cost transparency**. The cost model (§6.1) + Portal transparency (this section) are the locked substrate; the resulting margin posture — premium / parity / thin-margin / break-even / loss-leader — is Portal admin runtime + investor-informed business strategy per §6.3.

### §6.3 — Pricing as Portal Configuration (architectural statement)

**The following are Portal-configured runtime values, NOT PRD-locked decisions:**

- Specific tier names (Free / Starter / Basic / Pro / Ultimate / Agency / Enterprise / custom)
- Tier price points (monthly subscription dollars)
- Credit allocations per tier per month
- Free tier credit allocations (daily / monthly / trial-period)
- Annual discount %
- Top-up pack range ($amounts available for purchase)
- Customer migration paths at product expansion (auto-upgrade / grandfather / migration discount / etc.)
- Per-tier feature gating (which features unlock at which tier)
- Promotional pricing windows (launch discounts / seasonal / cohort-specific)
- **Margin target / recommendation magnitude** (operator-side suggestion only — surfaced to operator at config-change time per §6.2; NOT a floor that blocks save; pricing strategies including thin-margin / zero-margin / loss-leader are valid)

**Portal admin UI surface:** B-1.14 Lovart-style billing UI substrate (per §3.1 public launch scope minimum) is the implementation; PO + Architect + sales operators adjust runtime values via Portal admin without governance revision or PRD revision.

**Locked Portal requirement:** Portal admin UI MUST surface cost-transparency information per §6.2 at every pricing-config-save attempt — cost per operation + projected gross margin per tier + aggregate current-state margin + trajectory under cache hit assumption. The operator sees full cost consequences before confirming the save. **No floor blocks the save** — loss-leader, zero-margin, and thin-margin pricing are valid operator decisions informed by the transparency surface.

**Strategic implication:** pricing decisions are operational, not architectural. Tier structures iterate based on customer acquisition data, retention data, competitive shifts (per §2.1 quarterly Lovart audit), and product expansion (Phase 2+ feature unlocks). Pricing is a product-marketing function, not a PRD revision function.

### §6.4 — Competitive Reference (input, not target)

Lovart Feb 2026 baseline (per PO-provided public sources; quarterly audit per §2.1):

| Aspect | Lovart Feb 2026 |
|---|---|
| Tier count | 4 (Starter / Basic / Pro / Ultimate) |
| Free trial | 30 daily credits |
| Pro tier price | ~$72/month |
| Pro tier credit allocation | 11,000 credits/month |
| Per-image cost | ~5 credits per image |
| Top-up packs | $10–$100 |
| Annual discount | 20% |
| Generation tracks | Dual-track: Fast Generation (consumes credits) + Unlimited Relax (queue-based, no credit consumption) |

**Usage:** input to the cost-competitiveness check, NOT a tier-mapping target.

The §6.1 cost model intentionally aligns per-image credit cost (5 credits) with Lovart's standard to ensure cost competitiveness — at 5 credits/image with Tier 1 aggregator cost $0.02–$0.05/generation, gross margin at Lovart-competitive Pro tier price (~$72/mo for 11,000 credits) is structurally healthy if Portal admin chooses to maintain margin (per §6.2 transparency surfaces). Portal admin may equally choose loss-leader pricing below cost — the architecture supports both. **The cost model supports any Portal-configured pricing posture; the specific tier mapping + margin strategy is Portal admin's runtime call.**

**Drift detection per §2.1 quarterly audit:** pricing-relevant drift signals — per-image credit rate change (≥20% movement); tier-count restructure; annual discount magnitude change; top-up pack range change. If Lovart shifts materially, **Portal admin re-configures VIYO pricing — §6.1 cost model + §6.2 transparency requirement do NOT change unless cost basis changes.**

### §6.5 — OD-001 + OD-021 Dissolved

Both Open Decisions are **CLOSED via architectural dissolution**, NOT resolved through reconciliation:

| OD | Original framing | Status |
|---|---|---|
| **OD-001** | Pricing reconciliation: deck slide 9 (`$99/$299/$499/$1,499`) vs Notion D8 (`$0/$49/$249/$499/$1,499`) | **CLOSED — dissolved.** Conflict ceases to exist once pricing is Portal-configured runtime, not PRD artifact. Both deck slide 9 and Notion D8 reflected an obsolete locked-tier assumption. |
| **OD-021** | Image Studio MVP pricing strategy + V1.0 transition path | **CLOSED — dissolved.** Two-era framing was an artifact of treating pricing as locked. There are no eras; one cost model (locked §6.1) + Portal-configured pricing (runtime §6.3). |

**Note for §8 Open Decisions:** OD-001 + OD-021 both record as CLOSED status with reason "superseded by §6.3 architectural statement — pricing is Portal configuration."

**Notion D8 disposition:** the $0/$49/$249/$499/$1,499 tier values lose their canonical-tier status. They MAY serve as an initial Portal config snapshot at V1.0 launch — but are no longer PRD-locked. Portal admin updates without governance revision.

### §6.6 — Pricing Architecture Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Cost basis shift if Tier 1 aggregator pricing changes | Yellow | Atlas Cloud + fal.ai pricing audit quarterly. If cost per generation rises >20%, §6.1 cost model adjusts in PRD revision; §6.2 transparency surfaces reflect new cost basis automatically. |
| Token-cost-per-generation depends on provider mix | Yellow | Tier 1 ~$0.02–$0.05 / Tier 2 ~$0.10–$0.20 / Tier 3 ~$0.001–$0.005 amortized per §6.1. Per-brand routing skew toward Tier 2 affects margin posture; Portal admin sees impact via §6.2 transparency surfaces and decides whether to reconfig pricing or activate Lock 7 Tier 3. |
| Cache hit rate assumption (Curator estimate §2.4) affects margin trajectory | Yellow | Pending RLHF flywheel operational data per §2.2. Cache hit rate at month 6 (Curator estimate 50%) materially affects per-credit margin; monitored metric in admin dashboard per sub-phase 1.8; surfaced via §6.2 transparency. |
| **Cost-transparency surface fails to load at pricing-config-save** | **Red** | Per §6.2 + §6.3 locked Portal requirement — Portal MUST surface cost/margin at config-save. Surface failure = save blocked. B-1.14 implementation must treat the transparency surface as a hard dependency; operator cannot save pricing config without seeing cost consequences. |
| Operator-set margin target drifts below operator's intent | Yellow | Portal admin monitors per §6.2 transparency surfaces (per-brand monthly + aggregate quarterly views). Operator decides whether drift is acceptable (e.g., temporary loss-leader window) or requires reconfig. Architecture does not enforce — surfaces information. |
| Lovart competitive shift requires Portal pricing re-config | Green | Portal admin updates pricing without governance revision — quarterly audit per §2.1 surfaces drift; Portal config response is fast (hours, not weeks). |
| Pricing UI runtime substrate (B-1.14) ships at MVP | Green | Per §3.1 public launch scope minimum. Lovart-style billing UI is the substrate; pricing values + margin posture are Portal admin runtime input. |

**Pointer:** §8 Open Decisions records OD-001 + OD-021 as CLOSED via dissolution. §9 Success Criteria includes cost-transparency surface as Phase 1 acceptance gate substrate (per §6.2 + §6.3 locked Portal requirement).

---


*End of §6 — Cost Model + Pricing Architecture.*

---

## §7 — Roadmap

§7 references **PRODUCT_ROADMAP.md** (`/docs/governance/PRODUCT_ROADMAP.md`) as the canonical phase + sub-phase sequencing source. This section synthesizes for V8.1 readability without duplicating; for sub-phase acceptance gate detail + per-Bullet dependency graph consult PRODUCT_ROADMAP + Master Build Sequence v1.1. Five subsections + risk register. §7 authors against §4.7 Path 2 (kept-label framing) + Lock 38 (Universal Service Agnosticism — Phase 4+ expansion is registry-resolved, not roadmap-locked) + §6 (Cost Model + Portal-configured pricing; no era framing).

### §7.1 — Phase Sequence Summary

Per §4 V1.0 6-Month Vision (full detail) + §4.7 Path 2 framing (label aspirational, realistic scope disclosed per §4.7 phase-to-calendar mapping):

| Phase | Status | Realistic delivery window from 2026-05-14 |
|---|---|---|
| **Phase 1 Image Studio MVP** | In build (1.1-1.4 ✅ Shipped; 1.5 ⏸ PAUSED; 1.6-1.8 + 1.11 Not started; 1.9/1.10 Deferred V1.0.5) | Months 0-4 (per §3.3: 12-16 weeks parallel; 22-26 weeks serial pending OD-009) |
| **Phase 1B Intelligence Foundation** | Not started — hard prerequisite for Phase 2 per Lock 1 | Months 4-6 (substrate + ingestion pipelines built; R36/R37/R38/R46/R25 R-specs authored) |
| **Phase 2 Email Engine** | Not started — depends on Phase 1B corpus operational | Months 6-12+ (build begins; Klaviyo enters as launch-default ESP per Lock 38) |
| **Phase 2.5 Brand Team Collaboration + Trust Layer** | Not started — follows Phase 2 surfaces per Lock 1 | Months 12-18 (Curator estimate) |
| **Phase 3 LENZ Intelligence Studio** | Not started — depends on Phase 2 delivery + Phase 1B intelligence | Months 12-18+ (Curator estimate) |
| **Phase 4+ Opt-In Expansion** | Triggered by economics/demand, NOT date | Indefinite — **registry-resolved per Lock 38** (additional ESPs / CRMs / analytics / e-commerce / site-builders / payment processors all via R29 PAL config; no governance revision needed) |

### §7.2 — Release Readiness Gates

Per PRODUCT_ROADMAP.md §Release readiness gates + §3.5 MVP Success Definition + §9 B-1.18 detail:

| Gate | Description | Status |
|---|---|---|
| **G1** | All Phase 1 sub-phases complete (1.1–1.8 + 1.11; 1.9/1.10 deferred V1.0.5) | 1.1-1.4 ✅ shipped; 1.5-1.8 + 1.11 pending |
| **G2** | All MVP-blocking Open Decisions resolved | OD-001 + OD-021 CLOSED via §6.5 dissolution; 4 MVP-blocking remain (OD-004 / OD-005 / OD-009 / OD-019); OD-002 + OD-003 deferred-not-blocking (V1.0.5 / Phase 1B) per §3.1 + §7.4 |
| **G3** | A15 Brand Kit Mode shipped (Lovart audit gap G2 closure — public-launch blocker per VVOW §14) | Pending sub-phase 1.11 (Bullet B-1.10) |
| **G4** | Character Consistency Across Scenes shipped (Lovart audit gap G8 closure — public-launch blocker per VVOW §14) | Pending sub-phase 1.11 (new Bullet B-1.X to insert) |
| **G5** | 30-day stability window post-soft-launch | Future |

When G1-G5 all green: **public launch** per §3.5 one-sentence MVP done definition.

### §7.3 — V1.0 6-Month Horizon Framing (per §4.7 Path 2)

The "V1.0 6-month vision" label is **aspirational positioning**, not a delivery commitment. §4.7 is the explicit realistic-delivery disclosure: within 6 calendar months from 2026-05-14, realistic delivery = **Phase 1 MVP public launch + Phase 1B Intelligence Foundation substrate operational + Phase 2 Email Engine build begun** (foundation work only, not customer-facing). Full V1.0 (Phases 1+1B+2+2.5+3 shipped) realistic delivery window = **12-18 months** from 2026-05-14 per §4.7 Curator estimate.

Per §4.7 Path 2 (PO-ratified): label retained for marketing / investor positioning; §4.7 retained for operational honesty. The two coexist explicitly; no internal contradiction because §4.7 is unmissable.

### §7.4 — Post-Launch Sequence

After Phase 1 MVP public launch (G1-G5 green per §7.2):

- **V1.0.5** unblocks sub-phase 1.9 Pattern Seeding (gated OD-002 legal review on Milled / Email Love / Really Good Emails scraping per VVOW §10.4) + sub-phase 1.10 Brand-Specific LoRA (Lock 10 pipeline trained on RLHF-validated outputs per §2.2).
- **V1.1** ships Phase 2 Email Engine + Klaviyo deployment + 12 flow templates + popups + deliverability + AI Klaviyo Audits + Migma-style import. Per Lock 38, **additional ESP class members** (ActiveCampaign / Brevo / Mailchimp / SendGrid per §4.6) **register in R29 PAL Plugin Registry without governance revision** — Klaviyo is launch-default ESP, not the only option.
- **V1.2** ships Phase 1B Intelligence layers (R46 IMAP + R25 Video/IG + SYPHON + MAAX + HYVE substrate operational; ATLAS corpus accumulated; HYVE opt-in network active).
- **V2.0** ships Phase 2.5 Trust Layer + Phase 3 LENZ Intelligence Studio (per §4.5 + §4.6 dependency chain).

Sequencing rules per Lock 1 (Product Sequencing) + FOUNDATION_AUTHORITY §3 — no phase skipping; 1B prerequisite for 2; 2.5 follows 2; 3 follows 2 + 1B; 4+ opt-in.

**Per Lock 38, Phase 4+ expansion (additional ESP / CRM / analytics / payment / e-commerce platform / site-builder class members) is registry-resolved at runtime, not roadmap-locked.** §4.6 Phase 4+ tracks (Timer Service per ID-4 / R39 Admin Portal / BFCM / public REST API / Tier 3 self-hosted GPU per Lock 7) are the only roadmap-tracked Phase 4+ items; everything else within those classes ships via R29 PAL Plugin Registry config.

### §7.5 — Roadmap Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **OD-009 Composer Queue concurrency unratified delays MVP timeline 12-16 → 22-26 weeks** | **Red** | Highest-leverage next-Architect decision per §3.3. Affects Architecture A operational readiness per §5.5 + parallel-lane execution per §3.3. |
| **R23 v2 + R24 v2.1 + R33 + T47 v2 not yet ZCBR-PASSED** (matches §5.6 list; R52 excluded per §3.5 reclassification as post-launch ops) | **Red** | B-1.18 blocking per §3.5. Architect-side authoring work in fresh Phase 4 Architect session post-PRD ratification. |
| OD-002 legal review blocks V1.0.5 Pattern Seeding | Yellow | Pattern Seeding deferred to V1.0.5 by design per §3.1 (Notion D50); NOT B-1.18 blocking. |
| Phase 1B intelligence substrate (R46/R25/SYPHON/MAAX/HYVE R-specs) authoring effort | Yellow | Multiple R-specs to author; staggered start during Phase 1 MVP stable window post-launch. |
| Phase 2 Email Engine scope vs. realistic delivery window | Yellow | §4.3 substrate citations include R32 Email Engine spec authoring at B-XC.05 per FOUNDATION_AUTHORITY §8.6 (currently inventoried but unread). |
| §4.7 label-vs-realistic-delivery ambiguity risks investor / customer misalignment | Yellow | Path 2 disclosure in §4.7 explicit + prominent; quarterly drift audit per §2.1 surfaces if positioning drifts from operational reality. |
| Lock 38 registry-expansion at Phase 4+ vs. operator readiness for runtime swaps | Green | Architecture supports swap; operator decides timing. Quarterly competitive audit per §2.1 surfaces pressure on adoption. |

**Pointer:** PRODUCT_ROADMAP.md + Master Build Sequence v1.1 for per-sub-phase + per-Bullet detail. §8 Open Decisions for OD status. §9 Success Criteria for B-1.18 acceptance gate detail.

---

*End of §7 — Roadmap.*

---

## §8 — Open Decisions

**Source of truth:** Notion 🚧 Open PO Decisions Database (data source `996b2e7d-50f8-41bd-a815-faf5194277f1`). §8 is a point-in-time PRD snapshot of OD status as of 2026-05-14. Notion DB remains the live register; this section closes the ODs PRD V8.1 dissolves and flags the ODs PRD V8.1 names as MVP-blocking.

### §8.1 — Open Decisions Register (snapshot 2026-05-14)

| OD ID | Title (Notion) | Owner | Status | Blocks |
|---|---|---|---|---|
| **OD-001** | Pricing Page Copy & Conversion Optimization | PO | **CLOSED via §6.5 dissolution** | (was: marketing site launch, pricing page UX) |
| OD-002 | Legal Review: Milled / Email Love / Really Good Emails Scraping | Legal | Open | Phase 1.9 Pattern Seeding + R46 competitor corpus — **V1.0.5, NOT MVP-blocking per §3.1** |
| OD-003 | AgentMail IMAP Provider Selection | Architect Claude | Open | R46 Email Ingestion Module — **Phase 1B prerequisite for Phase 2** |
| OD-004 | R29 PAL Rewrite Scope (unified Plugin Registry per Lock 19 + Lock 38) | Architect Claude | Open | All Brain implementation specs reference provider routing |
| OD-005 | 3 Reviewer Accounts Setup (Tinder swipe gate) | PO | Open | Phase 1 RLHF swipe gate operational (admin.viyo.com minimal scope) |
| OD-006 / OD-007 / OD-008 | Phase 1B substrate ODs (R-spec scoping) | Architect / PO | Open | Phase 1B intelligence layer; **NOT MVP-blocking** (post-launch sequence per §7.4) |
| **OD-009** | **Portal Composer Queue concurrency model — serial or N parallel lanes?** | **Architect Claude** | **Open** | **All parallel-track Bullet assumptions in Master Build Sequence v1.1; Phase 1 prerequisite chain timeline; Architecture A operational readiness per §5.5** |
| OD-010 – OD-018 | Misc Phase 1 / Phase 1B / governance-substrate ODs | Various | Open | Various — see Notion DB for per-OD detail; **none MVP-blocking** |
| **OD-019** | **WP-1 + WP-2 status unverified — need PO confirmation or repo check before T73 unblocking** | **PO** | **Open** | **T73 sub-phase 1.5 unblocking; Studio Editing Router; PAUSED state continues until resolved** |
| OD-020 | PO sign-off on Foundation Locks, Decisions, OD resolutions | PO | Open | Governance cadence; **NOT MVP-blocking** (process item) |
| **OD-021** | (Conceptual — Pricing tier structure / margin floor surfaced during PRD V8.1 §6 authoring) | PO | **CLOSED via §6.5 dissolution** | (was: pricing tier locking) |

**Pointer:** for full per-OD detail (Background / Question / Recommendation / Resolution path / Source), fetch the Notion record at `https://www.notion.so/b31bfeb08108475eac7144295f36ff55`. PRD V8.1 §8 is a snapshot, not a replacement for the live register.

### §8.2 — OD-001 + OD-021 Dissolution

Both ODs are **CLOSED via §6.5 dissolution**, not resolved. The distinction matters: a resolved OD is one where the conflict was reconciled and a decision selected from competing options; a dissolved OD is one where the architectural reframe eliminated the conflict's foundation — there is no longer a decision to make because the prior framing no longer applies.

**OD-001 (Pricing Page Copy & Conversion Optimization):** dissolved because pricing copy is no longer a PRD-locked artifact requiring tier-by-tier copy approval before marketing site launch. Per §6.3 (Pricing as Portal Configuration), the pricing surface is Portal-configured at runtime via 10 config values. Marketing site copy work proceeds without OD ratification — operator-side configuration replaces PRD locking. The decision did not require resolution; the requirement to make the decision ceased to exist.

**OD-021 (Pricing tier structure / margin floor):** dissolved because §6.2 Margin Visibility ratification removed the margin floor as a locked PRD artifact. Cost transparency is locked; margin numbers (including the prior "35% per-brand / 65% aggregate" reference) are Portal-configured suggestions, not floors. Loss-leader pricing is explicitly valid per §6.2. The tier structure question reduces to Portal admin UI configuration — no PRD-level ratification surface remains.

**Implication:** OD-001 + OD-021 do NOT re-open under future re-litigation. The §6 reframe is foundational, not a temporary workaround. Reopening either requires a §6 ratification reversal — which Lock 21 Governance Agnosticism + §6 ratification on 2026-05-14 explicitly govern. Any future surfacing of "pricing tier copy" or "margin floor" concerns routes through Portal admin UI configuration, not OD opening.

### §8.3 — MVP-Blocking ODs Flagged

Per §7.2 G2 gate ("All MVP-blocking Open Decisions resolved"), the following 4 ODs MUST be resolved before Phase 1 public launch. Names match Notion DB titles (source of truth).

| OD ID | Title | MVP-blocking? | Severity per §7.5 |
|---|---|---|---|
| **OD-004** | R29 PAL Rewrite Scope (Lock 19 + Lock 38 unified Plugin Registry — AI model registry + ESP + commerce + payment + future) | **Yes** — all provider routing specs depend on unified PAL | Yellow (Architect-side authoring during fresh Phase 4 Architect session) |
| **OD-005** | 3 Reviewer Accounts Setup (Tinder swipe gate) | **Yes** — Phase 1 RLHF swipe gate cannot activate without 3 reviewers (Decision 52) | Yellow (PO action item; small ask) |
| **OD-009** | Portal Composer Queue concurrency model | **Yes** — **load-bearing per Architecture A** | **Red** (§7.5 — affects MVP timeline 12-16 → 22-26 weeks per §3.3) |
| **OD-019** | WP-1 + WP-2 status verification | **Yes** — T73 sub-phase 1.5 unblocking gate | Yellow (verification check, not implementation work) |

**Deferred-not-blocking ODs:**

| OD ID | Title | Why deferred |
|---|---|---|
| OD-002 | Legal Review: Milled / Email Love / Really Good Emails Scraping | V1.0.5 only per §3.1 + §7.4 (Phase 1.9 Pattern Seeding deferred post-MVP; legal review is the blocker, not MVP launch) |
| OD-003 | AgentMail IMAP Provider Selection | Phase 1B email-ingestion scope per §7.4 V1.2 (R46 prerequisite chain for Phase 2; Architect recommendation = Nylas; Phase 1 MVP ships without R46 active) |

### §8.4 — OD-022 Not Opened

PRD V8.1 §4.3 references "220 features" inventoried via Manus across competitor moats. The PO directive during §4 authoring removed Manus Inventory counts from prose-facing copy (per §4 ratification cascade) and explicitly closed the path to opening OD-022 ("220 features verification required") as a separate OD.

**Resolution path:** §4.3 "220 features" verification **folds into Phase 5.5 Airtable Build Tracker reconciliation** (Curator Phase 5 substrate-refresh deliverable per CURATOR_MASTER_PLAN_v2). When Airtable Build Tracker is reconciled against Master Build Sequence v1.1 Bullet IDs + ZCBR-PASSED R-specs, the inventory count surfaces as a verified artifact — no separate OD ratification required.

**Stated explicitly so no future reader reopens it:** OD-022 is **NOT** an open ratification surface. The "220 features" framing is descriptive (positioning narrative per §1 + §4), not an inventory-control commitment. Phase 5.5 produces the canonical Bullet-level inventory; competitor-feature counts remain marketing/positioning artifacts.

### §8.5 — Blocking OD Resolution + Ownership

| OD | Resolution | Owner | Trigger |
|---|---|---|---|
| **OD-004** | Architect Claude authors R29 v2 spec covering unified Plugin Registry per Lock 19 + Lock 38 (AI models / ESPs / commerce / CRMs / payment / analytics / observability / site-builders / future). Single ZCBR-PASS surface. | Architect Claude | During R-spec authoring session post-PRD V8.1 ratification (per §5.6 Red row 4 R-specs not yet ZCBR-PASSED — R23 v2 / R24 v2.1 / R33 / T47 v2 — fresh session) |
| **OD-005** | PO designates 3 reviewer accounts + grants admin.viyo.com access. Per Decision 52: 3 humans, Tinder swipe UI, 5,000 swipes → VLM Preference Classifier handoff, 1,000 RLHF events hard-gates Phase 2. | PO action | Before B-1.18 sub-phase 1.4 (Tinder swipe gate ships) — already on path per VIYO_CURRENT_MAP §9 status |
| **OD-009** | PO confirms Portal concurrency state (serial vs. N lanes). Portal-side knowledge held by PO / Portal Architect channel — **external to VIYO Architect role**. If concurrent: ratify lane count. If serial: Portal directive to evolve (separate channel) + adjust Phase 1 timeline expectations 12-16 → 22-26 weeks. | PO (external Portal channel) | **Highest-leverage next-Architect decision per §3.3 + §7.5 Red** — surface during next-Architect session opening |
| **OD-019** | Architect / PO verify WP-1 (R21 spec + staging runbook updates) + WP-2 (render.yaml patch) status — either PO confirmation, Drive search for Architect deliverables, or Manus repo query. T73 unblocking confidence stated definitively post-verification. | Architect (verification work) / PO (confirmation) | Before T73 unblock + sub-phase 1.5 commencement — already on critical path per VIYO_CURRENT_MAP §10 highest-priority work unit |

**Pointer:** §9 Success Criteria translates OD resolution into B-1.18 acceptance gate substrate. ARCHITECT_OPERATING_RULES §2 Decision Authority Matrix governs which decisions Architect drafts vs. PO ratifies — OD-004 / OD-019 are Architect-drafted recommendations awaiting PO ratification; OD-005 / OD-009 are PO-owned with Architect surface only.

---

*End of §8 — Open Decisions.*

---

## §9 — Success Criteria

**Substrate:** §9 is the operational translation layer. Strategy (§1-§2) + scope (§3) + vision (§4) + architecture (§5) + cost model (§6) + roadmap (§7) + open decisions (§8) compose into measurable acceptance gates. §9 names them; PRODUCT_ROADMAP.md + Master Build Sequence v1.1 + R-spec acceptance criteria carry the per-Bullet detail.

### §9.1 — Phase 1 MVP Acceptance Gate (B-1.18)

B-1.18 ("Phase 1 MVP Acceptance Ceremony") is the public-launch gate Bullet per Master Build Sequence v1.1. PRD V8.1 §3.5 ratified the one-sentence MVP done definition; §9.1 translates that into the B-1.18 acceptance criteria substrate. All criteria below MUST be VERIFIED + EVIDENCED before B-1.18 surfaces for PO ratification of public launch.

**Sub-phase shipment criteria** (per §3.2 sub-phase table + PRODUCT_ROADMAP.md):

- All Phase 1 sub-phases 1.1-1.8 + 1.11 shipped per §3.2 acceptance gate column. Sub-phases 1.9 (Pattern Seeding) + 1.10 (Brand-Specific LoRA) deferred V1.0.5 per §7.4 + OD-002 + Lock 10 pipeline.
- Admin shells (B-1.01/02) deployed at `app.viyo.com` + `admin.viyo.com` per INFRASTRUCTURE_DECISIONS ID-2.
- Lovart-style tiered billing UI substrate (B-1.14) operational with Stripe (Lock 33) integration.
- Shopify catalog sync (B-0.17) operational with PKCE OAuth per Notion D48 + R33.
- All 22 Generation Modes (A1-A22) live and routed via Art Director Router (T46 v2).
- All B1-B10 editing tools operational per R24 v2.1 contracts + T47 v2 Studio Editing Tools.
- Brand Vault asset organization (auto + manual tagging) operational.
- Designer Brain (Brand Decoder + Brand Recipe + Pattern Recipe substrate) operational per R23 v2 + R24 v2.1.
- Usability per §3.5 narrative (new Shopify-native brand can sign-up → connect Shopify → generate → edit → organize → pay tokens in one product session).

**Cost-transparency surface (per §6.2 — B-1.18 acceptance substrate):**

- Portal admin UI cost-transparency surface operational per §6.2 + §6.3. At every pricing-config-save attempt, Portal MUST surface: cost per operation (Lock 32 provider rate cards) + projected gross margin per tier + aggregate current-state margin + trajectory under cache hit assumption.
- No floor blocks the save — loss-leader, zero-margin, and thin-margin pricing are valid operator decisions per §6.2 ratification. Architecture surfaces information; operator decides.
- **B-1.18 acceptance test:** test pricing-config save with intentionally below-cost tier values; Portal MUST surface the cost-transparency warning + allow save (no block). Test with above-cost values; Portal MUST surface positive-margin trajectory.

**Gap closure criteria** (per VVOW §14 public-launch blockers):

- G2 (A15 Brand Kit Mode functional via composite generation per VVOW §4.3) — sub-phase 1.11 Bullet B-1.10.
- G8 (Character Consistency Across Scenes functional) — sub-phase 1.11 new Bullet B-1.X.

**RLHF flywheel operational criteria** (per VVOW §16 Phase 4 acceptance test):

- 1,000 RLHF events accumulated per sub-phase 1.8 canonical acceptance threshold.
- DSPy operational and producing improved prompt templates that update `image_prompt_patterns`.
- Tinder swipe gate operational per OD-005 resolution (3 reviewers provisioned).

**R-spec readiness criteria** (per §5.6 + §7.5 Red row):

- All cited R-specs ZCBR-PASSED before B-1.18 surfaces: 9 already shipped 2026-05-12 (R17, R19, R20, R21, R22, R24, R29, R31, T46) + R23 v2 (fresh authoring) + R24 v2.1 (minor bump) + R33 Shopify Integration + T47 v2 Studio Editing Tools. R52 excluded per §3.5 reclassification (post-launch ops deliverable per §9.3).

**OD resolution criteria** (per §8.3 + §8.5):

- 4 MVP-blocking ODs CLOSED: OD-004 (R29 v2 unified Plugin Registry ZCBR-PASSED) + OD-005 (3 reviewer accounts provisioned) + OD-009 (Composer Queue concurrency ratified) + OD-019 (WP-1 + WP-2 verification closed). OD-001 + OD-021 already CLOSED via §6.5 dissolution. OD-002 + OD-003 deferred-not-blocking per §3.1 + §7.4.

**DR substrate criteria** (per §3.5 minimum DR substrate; B-0.21 P0 Bullet):

- Supabase point-in-time recovery confirmed.
- R2 cross-region snapshot policy active.
- Documented recovery runbook in `/docs/runbooks/` tested via tabletop exercise.
- R52 fresh comprehensive DR runbook (B-XC.23) is **post-launch ops deliverable per §9.3**, NOT B-1.18 gate-blocking per §3.5 reclassification.

### §9.2 — G1-G5 Release Readiness Gates → Acceptance Criteria Mapping

Per §7.2 (sourced PRODUCT_ROADMAP.md §Release readiness gates), G1-G5 compose into B-1.18:

| Gate | §9 Acceptance Criteria Mapping |
|---|---|
| **G1** | Sub-phase shipment criteria (all 1.1-1.8 + 1.11 ✅) + R-spec readiness criteria (4 R-specs ZCBR-PASSED) per §9.1 |
| **G2** | OD resolution criteria (4 MVP-blocking ODs CLOSED) per §9.1 + §8.3 |
| **G3** | A15 Brand Kit Mode functional — gap closure criteria per §9.1 (Lovart audit G2) |
| **G4** | Character Consistency Across Scenes functional — gap closure criteria per §9.1 (Lovart audit G8) |
| **G5** | 30-day stability window post-soft-launch — observed post-B-1.18 launch, NOT B-1.18 pre-launch criterion. Free-alpha → paid-alpha progression per PRODUCT_ROADMAP.md §Beta strategy. |

When G1-G4 all green: B-1.18 ratification → soft launch (free-alpha + paid-alpha progression per PRODUCT_ROADMAP). G5 closes 30 days post-soft-launch → full public launch.

### §9.3 — V1.0.5 Milestones (Post-MVP Closeout)

Per §7.4 + Lock 10 pipeline + OD-002 unblock:

- **Sub-phase 1.9 Pattern Seeding shipped** — gated OD-002 legal review on Milled / Email Love / Really Good Emails scraping closed; Pattern DB seeds via Lock 11 web scraping + R46 IMAP ingestion (Phase 1B).
- **Sub-phase 1.10 Brand-Specific LoRA shipped** — Lock 10 pipeline trained on RLHF-validated outputs per §2.2 compound margin trajectory.
- **R52 fresh comprehensive DR runbook (B-XC.23) shipped** — post-launch ops deliverable per §3.5 reclassification. Replaces the minimum DR substrate operational at B-1.18; comprehensive runbook covers Supabase + R2 + R-spec service tier + tabletop cadence per FOUNDATION_AUTHORITY §3 substrate.
- **Phase 5.5 Airtable Build Tracker reconciliation closed** — surfaces canonical Bullet-level inventory per §8.4; "220 features" framing folds into verified artifact per §4.3.
- **Notion DB sweep + FOUNDATION_AUTHORITY refresh** — Phase 5.1 + 5.2 deliverables per §5.6 Yellow rows (DB drift + lock count drift).

### §9.4 — V1.1 Milestones (Phase 2 Email Engine + Klaviyo)

Per §7.4 + §4.3 + Lock 1 sequencing + Phase 1B prerequisite chain:

- **Phase 2 Email Engine shipped** — Brain Council 13-Agent architecture (Lock 12) operational; idea→inbox flow functional (Migma moat absorption per §1.4).
- **Klaviyo deployment integration shipped** — Klaviyo as launch-default ESP per Lock 38; R32 Email Engine spec ZCBR-PASSED at B-XC.05 per FOUNDATION_AUTHORITY §8.6.
- **12 flow templates shipped** — per Migma feature inventory; auto-flow generation operational.
- **Popups + deliverability + AI Klaviyo Audits operational** — Migma feature parity.
- **Migma-style import operational** — Figma/HTML/Screenshot import + Remix from competitor emails.
- **Phase 1B intelligence substrate operational** (V1.2 prerequisite) — R46 IMAP per OD-003 resolution + SYPHON + MAAX + HYVE R-spec substrate ratified.
- **Lock 38 ESP expansion via R29 PAL** — ActiveCampaign / Brevo / Mailchimp / SendGrid registry-resolved without governance revision per §7.4.

### §9.5 — V1.0 6-Month Success Definition (§4.7 Path 2 Realistic Framing)

Per §4.7 Path 2 ratification (kept-label framing): the "V1.0 6-month vision" marketing label is **aspirational positioning**; §9.5 is the **operational realistic delivery measure** against §4.7 Curator estimate.

**6-month success (from 2026-05-14):**

- **Phase 1 MVP public launch shipped** — B-1.18 acceptance ceremony completed per §9.1 + §9.2; soft-launch → public-launch progression per G5 closed.
- **Phase 1B Intelligence Foundation substrate operational** — R46 / R25 / SYPHON / MAAX / HYVE R-specs authored + ZCBR-PASSED; ATLAS corpus accumulation begun; HYVE opt-in network active per §4.5.
- **Phase 2 Email Engine build begun** — foundation work only, NOT customer-facing. R32 Email Engine spec authored at B-XC.05 + initial Brain Council 13-Agent architecture stubs.
- **V1.0.5 milestones shipped** per §9.3 — Pattern Seeding + Brand-Specific LoRA + R52 DR runbook + Phase 5.5 reconciliation + governance DB sweep.

**Full V1.0 (Phases 1+1B+2+2.5+3 shipped) realistic delivery window = 12-18 months from 2026-05-14** per §4.7 Curator estimate. §9.5 measures the 6-month operational substrate; full V1.0 measures against the 12-18 month window per §7.4 post-launch sequence (V1.1 / V1.2 / V2.0).

**Surface discipline per §4.7 Path 2:** marketing positioning continues to reference "V1.0 6-month vision" as aspirational label; operational reviews (quarterly per §2.1 audit cadence) measure against §9.5 realistic framing. The two coexist explicitly per §4.7 + §7.3 ratification.

**Pointer:** PRODUCT_ROADMAP.md + Master Build Sequence v1.1 for per-sub-phase + per-Bullet acceptance detail. R-spec ZCBR files for per-R-spec acceptance criteria. VVOW §14 + §16 for Lovart audit gap closure + RLHF flywheel acceptance substrate.

---

*End of §9 — Success Criteria.*

---

## End of PRD V8.1

**9 sections authored + ratified by PO Nir between 2026-05-13 and 2026-05-14** per CURATOR_MASTER_PLAN_v2 + VIYO_PATH_TO_MVP §Step 7. Single repo commit to `/docs/PRD_V8.1.md` after §9 ratification per authoring discipline.

**Authority:** PRD V8.1 sits below PO decisions; above FOUNDATION_AUTHORITY substrate, VVOW Architecture, R-spec ZCBR, per-Bullet directives, code. Supersedes V8 (Drive `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`, pre-MVP-reset). The canonical product north star.

**Maintenance:** any §-level revision requires a PO ratification surface following the same section-by-section discipline used for V8.1 authoring. Lock 21 Governance Agnosticism + §6.5 dissolution + §8.4 OD-022 closure govern future re-litigation surfaces.
