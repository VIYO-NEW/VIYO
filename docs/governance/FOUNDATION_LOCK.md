# FOUNDATION_LOCK.md — Non-Negotiable Architectural Locks

**These are non-negotiable.** Changes require:

1. PO accepts a directive that explicitly modifies a lock here
2. Reviewer Claude verifies coherence
3. Commit to `main`

**No agent (Kimi, Manus, Architect-in-Portal) may modify these via runtime code or schema migrations.**

The detailed implementation reference for VVOW-specific locks lives in `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`. This file is the **summary of locks** that apply across the full VIYO platform.

---

## Lock 1 — Product Sequencing

| Phase | Product | Status |
|---|---|---|
| **Phase 1** | **Image Studio (VVOW)** — standalone product | **Current build.** T25–T72 shipped. T73 paused awaiting architecture acceptance. |
| **Phase 2** | **Email Studio** — separate product. Full MJML image + email section editor. References Brand Vault assets by UUID. | Future |
| **Phase 3+** | **LENZ Intelligence Studio** — analytics layer | Future |

Image Studio ships before Email Studio. Email Studio ships before LENZ. **No sequence skipping.**

---

## Lock 2 — Unified GrapesJS Backbone

GrapesJS is the unified canvas engine for both surfaces, with two different "tunings":

| Surface | Backbone | Tuning | Output |
|---|---|---|---|
| Image Studio | GrapesJS | **Studio SDK** (Canvas API) | High-res PNG/JPG/GIF |
| Email Studio | GrapesJS | **MJML Plugin** (`mjml-core`) | Responsive MJML / HTML |

**Forbidden:** custom canvas implementations. Both surfaces share the same engine, different tunings.

---

## Lock 3 — Email Studio Output is JSON MJML Recipe (Not Raw HTML)

Email Studio's AI **never writes raw HTML**. It produces a JSON MJML Recipe by:

1. MAAX selects from a library of **12 MJML Section Templates** (Hero, Split, Grid, Editorial, etc.)
2. AI fills the "slots" in templates with text and Brand Vault asset UUIDs
3. `mjml-core` deterministically compiles the JSON Recipe to email-safe HTML

This guarantees 100% responsive deliverability across email clients.

**Forbidden:** AI-generated raw HTML at any layer of Email Studio.

---

## Lock 4 — Single Image Generation Trace (T70 Cache-First)

Every generation follows this trace:

1. Pattern DB cache check first
2. On cache miss, route through Art Director Router (Tier 1 → Tier 2 escalation if complexity exceeds Tier 1)
3. Generation event emits an RLHF signal to `pattern_performance_metrics`
4. Result saves to Brand Vault with full lineage + JSONB metadata + pgvector embedding

**Forbidden:** untracked generations. Generations outside Brand Vault. Skipping the cache check.

---

## Lock 5 — Pattern DB + Pattern Recipe JSON Schema

Every prompt pattern in `image_prompt_patterns` is stored as the locked Pattern Recipe JSON shape:

- `style_system`
- `shared_principles` (format, aspect_ratio, model_pose, product_focus, typography_placement, color_harmony, mood)
- `variants[]` (background, props, lighting, color_grade, era_reference)
- `doodles` (style, elements, feel)
- `negative_prompts[]`
- `replication_prompt_template` (with `[PRODUCT_DESCRIPTION]`, `[HERO_TEXT]`, `[SECONDARY_TEXT]` placeholders)

**Forbidden:** any other pattern shape. Schema drift breaks the Visual Intent Router's pattern injection logic.

---

## Lock 6 — Brand Vault Organization (Database-Driven)

Cloudflare R2 holds bytes (tenant-isolated). The `assets` table provides organization:

- **Lineage:** `parent_asset_id` chain (Original → Edit 1 → Edit 2)
- **Type Scope:** `asset_type` enum (extensible — grows with image-type taxonomy)
- **Metadata:** JSONB column (prompt, model, tags, pattern_id, qa_score, etc.)
- **Search:** pgvector embeddings — natural-language query
- **Tagging:** Auto AI tags on ingestion + manual `#`tagging in Brand Chat

**Forbidden:** folder-based organization in R2.

---

## Lock 7 — 3-Tier Provider Strategy

| Tier | Layer | Models | Purpose |
|---|---|---|---|
| **Tier 1** | Aggregators (Atlas Cloud + fal.ai peers) | NanoBanana 2 Pro, Flux 1.1 Pro, Seedream | Launch primary, "Best for the Job" routing |
| **Tier 2** | Frontier Direct (OpenAI/Google/Ideogram direct) | GPT Image 2, Imagen 4, Ideogram V3 | High-complexity Tier 1 cannot handle |
| **Tier 3** | Self-Hosted (RunPod / Thunder Compute) | Re-hosts Tier 1/2 | Cost reduction. Triggers: 6,700 imgs/mo → L40S, 18,700 imgs/mo → A100 80GB |

**Routing:** Tier 1 → Tier 2 escalation is **complexity-based**, not failure-based. Tier 3 is CapEx optimization that re-hosts the same models.

**Forbidden:** hardcoding model names in business logic. All routing via Plugin Registry (R29 PAL).

---

## Lock 8 — Editing is Programmatic (Sharp/PIL), NOT AI for Text/Color

| Operation | Tool | AI Tokens |
|---|---|---|
| Text overlay (B2 Text Edit) | GrapesJS native text block + Sharp/PIL composite | 0 |
| Color/transparency change (B4) | Sharp/PIL | 0 |
| Brightness, contrast, saturation, crop, resize, flip, rotate (B8 Quick Edit) | Sharp/PIL | 0 |
| Touch Edit (B1) — semantic inpainting | Flux 1.1 Pro inpainting | Yes |
| Layer Splitting (B3), Object Removal (B5) | SAM 2 segmentation | Yes |
| Outpainting (B6) | AI generation model | Yes |
| Upscale (B7) | Real-ESRGAN | Yes (separate cost class) |

**Forbidden:** Calling AI to edit text in a flattened image. Calling AI for color/brightness/contrast/crop. These are programmatic operations.

---

## Lock 9 — Implicit RLHF + Tinder Swipe Gate

Every user action emits a signal:

| Action | qaScore Delta |
|---|---|
| Drag to canvas | +1 |
| Export image | +5 |
| Regenerate (ignore variant) | −1 |

QA Bouncer (GPT-4o-mini) auto-approves/rejects. Humans verify a sample via **Tinder-style side-by-side swipe vs. original**:

- **50%** of auto-approved
- **20%** of auto-rejected

Override events feed DSPy. After 5,000 swipe decisions, Fine-Tuned VLM Preference Classifier replaces humans for the sample.

**Forbidden:** skipping the swipe gate sample for QA Bouncer outputs.

---

## Lock 10 — Brand-Specific LoRA Pipeline

After N validated patterns per brand (threshold TBD per R24 rewrite), train a brand-specific LoRA. Deploy via Plugin Registry tagged by `brand_id`. Auto-apply on future generations for that brand.

**Forbidden:**
- Cross-tenant LoRA training (privacy violation)
- LoRAs deployed outside Plugin Registry (bypasses observability/rollback)
- Auto-applying without recording in generation metadata (breaks reproducibility)

---

## Lock 11 — Pattern Seeding via Web Scraping

Initial seed of `image_prompt_patterns` comes from scraping hero images of competitor emails:

| Source | Tool | Pipeline |
|---|---|---|
| Milled (milled.com), other archives | Puppeteer + Cheerio | scrape → R2 storage → Claude Vision reverse-engineering → Pattern Recipe → `image_prompt_patterns` |

**Distinct from R46** — R46 is IMAP-based ingestion of full competitor emails for textual analysis (HYVE intelligence). Pattern Seeding is web scraping of HERO IMAGES specifically for the Image Studio Pattern DB.

---

## Lock 12 — Brain Council Scope

| Brain | Role | Used by VVOW? |
|---|---|---|
| 1. CMO | Strategic direction | Phase 2 only |
| 2. Audience | Target persona | Phase 2 only |
| 3. Offer | Promotion logic | Phase 2 only |
| 4. Copywriter | Email copy | Phase 2 only |
| **5. Visual Intent Router** | Brief → technical prompt → model routing | **Yes (VVOW core)** |
| **6. Designer Brain** | Visual layout, style consistency | **Yes (VVOW core)** |
| 7. Critic | Final QA | Phase 2 only |

**13-Agent Roster** = 7-Brain Council + VeriClaw, Flow Strategy, SMS Copywriter, ATLAS, Smart Insight Engine, Contextual AI Advisor.

VVOW directives scope to Brain 5 + Brain 6 unless cross-brain coordination is explicitly required.

---

## Lock 13 — Tenant Isolation via Supabase RLS

Every query touching `image_prompt_patterns`, `assets`, `pattern_performance_metrics`, or any tenant-scoped table enforces Supabase RLS on `brand_id`.

**Forbidden:** Bypassing RLS via service role key for any user-initiated operation.

---

## Lock 14 — Schema Changes via Canonical Migrations Only

Never patch the database via runtime code, "additive runtime schema alignment," or any non-migration mechanism. Always rebuild from canonical Drizzle migrations.

**Incident lesson:** During the §1A-FU-04 era, a previous build attempt made unauthorized schema modifications described as "additive runtime schema alignment." This violated the boundary. Recovery required rebuilding from canonical migrations.

When DB drift is detected: **always rebuild from canonical migrations**, never patch in code/schema/tests.

---

**End of locks.**

For implementation detail on any of these, consult `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` and the relevant R-file (recognizing that some R-files are thin and pending rewrite).
