# VVOW Image Studio — Architecture Specification

**Status:** APPROVED FOR IMPLEMENTATION (pending PO acceptance of this file)
**Date:** 2026-05-08
**Version:** 2.0 (corrects v1 Image Studio framing + adds A15 Brand Kit Mode, Pattern Recipe schema, Pattern Seeding pipeline, Brand Vault Organization, Tinder-style RLHF)
**Authority Level:** Architecture Lock — supersedes V8 PRD Section 20K.1 where conflicts arise (V8 PRD is underspecified for VVOW; this file is the canonical reference) and supersedes thin ZCBR R-files (R20, R24, R31, R46) where they lack implementation detail
**Owner:** PO (VIYO)
**Required Reading For:** All Kimi/Claude sessions touching the Image Studio, Pattern DB, Brand Vault, or any subsystem listed in §8

---

## Purpose

This file is the **single source of truth** for VVOW Image Studio architecture. Every directive that touches the visual engine MUST reference this file in its ingestion-evidence requirements. The builder reads this file before writing code.

This file consolidates:
- V8 PRD Section 20K.1 (line ~5807) — feature list (22 modes, 10 tools)
- `VVOW_Image_Studio_Reverse_Engineering_Complete.md` — Lovart teardown + gap audit
- R-file ZCBR specs (NOTE: ZCBR R-files are skeleton documents per PO audit; this file is the authoritative implementation reference until R-files are rewritten)
- PO decisions logged in Notion (stack lock, provider tier, model registry, data flywheel, Brand Vault organization, Tinder swipe gate)
- Conversational decisions captured during Phase 0–T72 build
- `learned_patterns.md` and Video Analysis (Pattern Recipe schema source)
- `09_provider_strategy_prompting.md` and `Image Studio Complete Spec` (Tier 3 thresholds source)

When V8 PRD Section 20K.1 or ZCBR R-files conflict with this file, **this file wins** until V8 PRD and R-files are rewritten to incorporate the locks captured here.

---

## Source Document Inventory

| Source | Drive ID / Path | Status |
|---|---|---|
| V8 PRD §20K.1 | `01_PRD_and_Architecture/VIYO_MASTER_PRD_V8_FINAL.md` | Underspecified — see PO audit below |
| VVOW Reverse Engineering | `05_Research_and_Benchmarks/VVOW_Image_Studio_Reverse_Engineering_Complete.md` | Canonical for Lovart parity strategy |
| R20 Database Schema ZCBR | Drive folder `1duV346EV6D8n2cUqO0xW-oGgmq5o3bcI` | **THIN — needs rewrite** to capture parent_asset_id lineage, JSONB metadata, pgvector embeddings |
| R24 Image Pipeline ZCBR | Same folder | **THIN — needs rewrite** to capture model registry, Pattern Recipe schema, B1-B10 tools |
| R26 Creative Concept ZCBR | Same folder | Reference only |
| R27 Composable Sections ZCBR | Same folder | Reference for Phase 2 Email Studio integration |
| R29 PAL (Provider Abstraction Layer) ZCBR | Same folder | Reference for routing logic |
| R30 Product Animation ZCBR | Same folder | Reference for video pipeline |
| R31 Product Data Extraction ZCBR | Same folder | **THIN — needs rewrite** to capture full Brand Vault organization |
| R46 Email Ingestion ZCBR | Same folder | Covers IMAP-based ingestion only — **does NOT cover Milled web scraping** (separate pipeline, see §10.4) |
| R21 Infrastructure ZCBR | Same folder | Canonical for Cloudflare R2, Render, deployment |
| R23 Cost Engine ZCBR | Same folder | Canonical for token economics |
| `learned_patterns.md` | Internal knowledge base | Canonical for Pattern Recipe JSON schema |
| `09_provider_strategy_prompting.md` | Internal knowledge base | Canonical for Tier 3 activation thresholds |

**PO Audit of V8 PRD Section 20K.1 (recorded 2026-05-08):** Section 20K.1 lists features (22 modes, 10 tools) but omits the technical backbone. Five missing locks captured in §8 of this file: GrapesJS Studio SDK, Mastra (@mastra/core), DSPy, 3-Tier Provider Strategy (Atlas Cloud / fal.ai / Self-Hosted L40S/A100), and the specific Model Registry (NanoBanana 2 Pro, Ideogram V3, Flux 1.1 Pro).

**PO Audit of ZCBR R-files (recorded 2026-05-08):** R20, R24, R31 are skeleton documents that identify what needs to be built but lack implementation specification. R46 covers IMAP ingestion only (does not cover web scraping for Pattern Seeding). They will be rewritten incrementally as bullets are scoped. Until rewritten, this architecture file is the authoritative reference.

---

## 1. Strategic Context

VVOW (Image Studio) is the **visual generation, editing, and brand asset management product**. It is a **standalone product** — Phase 1 of the VIYO platform. The Email Studio is Phase 2 — a separate product that consumes assets generated in Image Studio.

VVOW serves three roles:

1. **Standalone image generation** — Users generate brand-aligned images from natural-language briefs
2. **Non-destructive editing** — Touch Edit, Layer Splitting, Text Edit applied directly on the Image Studio canvas
3. **Data flywheel** — Every interaction validates a prompt pattern, feeding the global `image_prompt_patterns` DB that powers MAAX Designer Brain for autonomous campaign generation in Phase 2

**The data flywheel is the primary architectural commitment.** Every generation, drag, edit, export feeds the system's ability to autonomously generate brand-aligned images for future campaigns without user prompting.

---

## 2. Where VVOW Lives (Standalone Image Studio)

VVOW is a **standalone product** — the Image Studio. The Image Studio is Phase 1. The Email Studio is Phase 2 — a separate product that consumes Image Studio outputs.

### 2.1 Two Distinct Products

| Product | Phase | What It Is |
|---|---|---|
| **Image Studio (VVOW)** | **Phase 1 — current build** | Standalone product for image generation, editing, and brand asset management |
| **Email Studio** | **Phase 2 — future** | **Full MJML image + email section editor.** References assets from Brand Vault by UUID. |

### 2.2 Image Studio Layout (Phase 1, Current)

The Image Studio is a standalone application with its own 3-zone canvas (see §3):

- Zone 1: Design Chat (sidebar)
- Zone 2: Infinite Canvas (center)
- Zone 3: Contextual Toolbelt (floating)

Users interact directly with the Image Studio. There is no email editor wrapper around it in Phase 1.

### 2.3 Email Studio Integration (Phase 2, Future)

When Email Studio ships, it is a **full MJML image + email section editor** that references assets from the Brand Vault produced by Image Studio.

#### Unified GrapesJS Backbone (Section 20 of PRD — The Main Moat)

Both surfaces use **GrapesJS as the unified engine**, with two different "tunings":

| Surface | Backbone | Tuning / Plugin | Primary Output |
|---|---|---|---|
| **Image Studio** | GrapesJS | **Studio SDK** (Canvas API) | High-res PNG/JPG/GIF |
| **Email Studio** | GrapesJS | **MJML Plugin** (`mjml-core`) | Responsive MJML / HTML |

#### Asset Consumption: Reference, Not Upload

Email Studio **does not upload images**. It **references them by UUID** from the `assets` table in Brand Vault. When a user drags an image into an email section, the section pulls a `UUID` reference; the actual binary stays in Cloudflare R2.

#### Live-Sync Edit Flow

When a user clicks "Edit" on an image inside Email Studio:

1. A modal opens containing the Image Studio (GrapesJS + Studio SDK) loaded with that asset
2. User performs edits (any B1-B10 toolbelt action)
3. On save, a new version is written to Brand Vault (`parent_asset_id` chained to original — see §11.2.1 lineage)
4. The Email Studio reference auto-updates to the new asset UUID

This means the Email Studio always shows the latest version without manual re-upload, and the original is preserved in lineage.

#### Why This Is the Main Moat

- **Non-Destructive Layouts:** Email Studio uses GrapesJS MJML canvas. The AI doesn't send "flat HTML." It sends a **JSON MJML Recipe** that compiles deterministically.
- **The Section Library:** MAAX (the AI brain) selects from a library of **12 MJML Section Templates** (Hero, Split, Grid, Editorial, etc.).
- **No AI Hallucinations:** The AI **never writes raw HTML**. It only fills the "slots" in MJML templates with text and Brand Vault asset UUIDs. This ensures **100% responsive deliverability every time**.

#### Real-Time Generation Inside Email Studio

Real-time image generation INSIDE Email Studio is a **post-V1** feature (per R24 Excluded Features). For V1, generation happens in Image Studio; Email Studio references the output via UUID and supports live-sync editing.

### 2.4 Critical Distinction

The image generation surface in Phase 1 is a **standalone Image Studio app**, not an embedded sidebar inside an email editor. Email Studio in Phase 2 will USE Image Studio assets but is its own product. All references in this file describe the Phase 1 Image Studio unless explicitly noted.

**Current vs. Future compilation paths:**
- Phase 1 (Image Studio): Outputs flattened images + metadata, saved to Brand Vault. Image format = PNG/WebP optimized.
- Phase 2 (Email Studio): Reads Brand Vault assets, composes email with GrapesJS, compiles to MJML for cross-client email-safe rendering.

---

## 3. The 3-Zone Spatial Architecture

The Image Studio canvas renders three zones. This pattern is adapted from Lovart's ChatCanvas + Chat Panel + Contextual Toolbar layout, scoped to the Phase 1 standalone Image Studio.

### Zone 1 — Design Chat (Right Sidebar)

The conversational generation engine.

- **Input:** User types a business brief in natural language (not a technical prompt)
- **Process:** Visual Intent Router (Brain 5) embeds the brief, queries `image_prompt_patterns` vector DB, retrieves top 3 patterns, injects product image into templates, routes to optimal providers, returns 3 variants
- **Output:** 3 image variants appear in the chat feed
- **UX rule:** User does not write technical prompts. User writes briefs. The MCoT-equivalent reasoning layer (Brain 5 Visual Intent Router) translates briefs to technical prompts behind the scenes
- **Style/Prompt Library:** Lives inside this panel as a drawer/dropdown. When user selects "Summer Sale Aesthetic" or any brand style, Visual Intent Router auto-appends the necessary style references and LoRAs

### Zone 2 — GrapesJS Infinite Canvas (Center)

The composition engine.

- **Behavior:** User drags favored variants from Design Chat onto the canvas
- **Auto-save:** Every drag triggers `+1 qaScore` for that pattern (see §12 Implicit RLHF)
- **Auto-save destination:** Brand Vault (see §11 for organization details)
- **Spatial mechanics:** Infinite workspace, spacebar = pan, Ctrl+scroll = zoom, multi-image side-by-side
- **Persistent context:** Brand DNA (color, typography, voice) maintained across all generated formats in the canvas

### Zone 3 — Contextual Toolbelt (Floating)

The editing engine.

Appears when user selects an image on the canvas. Provides 10 editing tools + a Quick Edit natural-language bar.

| Code | Tool | Implementation |
|---|---|---|
| B1 | Touch Edit | Semantic inpainting (click + describe change) — Flux 1.1 Pro for context-aware regeneration |
| B2 | Text Edit | Live editable text via GrapesJS native text blocks overlaid on flat image (NOT AI-regenerated). Compiled to MJML in Phase 2 Email Engine. |
| B3 | Layer Splitting | Depth mapping + segmentation → independent layers — SAM 2 for segmentation |
| B4 | Background Swap | Sharp/PIL for color/transparency. Flux 1.1 Pro inpainting for replacement |
| B5 | Object Removal | SAM 2 segmentation + smart fill, atmospheric consistency preserved |
| B6 | Expand / Outpainting | AI extends canvas to new aspect ratio |
| B7 | Upscale | Real-ESRGAN — doubles resolution for retina/print quality |
| B8 | Quick Edit | Programmatic brightness, contrast, saturation, crop, resize, flip, rotate via Sharp/PIL — **0 AI tokens** |
| B9 | Style Transfer | Image-to-image with style reference |
| B10 | Material Swap | Object-level material change (silk → velvet, etc.) |

The Quick Edit bar accepts natural-language commands ("change background to beach") and routes through the Visual Intent Router for execution.

---

## 4. Image Type Taxonomy

### 4.1 The 22 First-Discovered Types (Locked)

These are the 22 image types VVOW supports at launch. Sourced from V8 PRD Section 20K.1 + PO decisions.

| # | Type | Category |
|---|---|---|
| 1 | Product Photography | E-commerce |
| 2 | Typography Poster | Brand |
| 3 | Compositional Poster | Marketing |
| 4 | Lifestyle Scene | Brand |
| 5 | Product Flat Lay | E-commerce |
| 6 | Product-on-Model | Fashion |
| 7 | Social Media Ad | Marketing |
| 8 | Email Hero | Email-native |
| 9 | Brand Pattern | Brand |
| 10 | Color Palette | Brand |
| 11 | Mood Board | Brand |
| 12 | Texture | Asset |
| 13 | Background | Asset |
| 14 | Icon Set | Asset |
| 15 | Infographic | Marketing |
| 16 | Before/After | E-commerce |
| 17 | Seasonal | Marketing |
| 18 | Collection | Fashion |
| 19 | Lookbook | Fashion |
| 20 | Detail Shot | E-commerce |
| 21 | Scale Reference | E-commerce |
| 22 | Packaging | Brand |

### 4.2 Taxonomy is Unbounded and Self-Expanding (CEO Lock)

**These 22 are the FIRST discovered types. The taxonomy is NOT closed.**

The system discovers new types through the learning engine. Mechanism:

1. User submits a brief that doesn't match any of the 22 patterns at high confidence
2. Visual Intent Router falls back to general generation
3. If the result scores high in the RLHF loop (drag-to-canvas, export-to-email), the pattern is promoted to a candidate new type
4. After N similar candidates accumulate (threshold defined in R24 — pending rewrite), reviewers (or eventually Fine-Tuned VLM Preference Classifier) promote the cluster to a named type
5. The type appears as a new prompt pattern in `image_prompt_patterns` and becomes selectable in future Style Library

**Expected growth:** hundreds of types within 12 months of public launch.

**Forbidden:** Hardcoding the 22 types as a fixed enum. The taxonomy must live in the database (`image_prompt_patterns.type_name`) and be queryable, not compiled.

### 4.3 A15 Brand Kit Mode — Composite Generation

A15 is a **special composite generation mode**, not a single image type. From a single prompt, A15 produces a complete brand identity bundle:

- Logo suite (multiple variants, color/monochrome/inverted)
- Color palette (with hex values, contrast ratios, application guidance)
- Typography guidelines
- Social media template suite
- Mockup suite (business cards, letterheads, packaging)
- Brand guidelines PDF document (closes G3 gap)

A15 is Lovart's #1 wow factor and a **public-launch-blocking gap (G2 in §14)**. It sits structurally between the 22 single-image types and the broader platform — A15 invokes multiple brains and produces multiple assets in a coordinated output.

**Implementation note:** A15 is a Mastra-orchestrated composite. Each component (logo, palette, typography sample, etc.) is a separate generation that links via shared brand DNA. All outputs save to Brand Vault with shared `brand_kit_id` metadata for grouped retrieval.

---

## 5. Brain Council Relationship

### 5.1 The 7-Brain Council (Single Campaign Generation)

Runs inside the Mastra DAG for each campaign. All 7 execute in coordination per generation request.

| # | Brain | Role |
|---|---|---|
| 1 | CMO Brain | Sets strategic direction |
| 2 | Audience Brain | Resolves target persona |
| 3 | Offer Brain | Constructs the offer / promotion logic |
| 4 | Copywriter Brain | Generates email copy |
| 5 | **Visual Intent Router** | **VVOW — translates briefs → technical prompts → model routing** |
| 6 | **Designer Brain** | **VVOW — composes visual layouts, manages style consistency** |
| 7 | Critic Brain | Final QA before output to user |

### 5.2 The 13-Agent Roster (Full Platform)

The 7-Brain Council plus 6 platform-level agents:

8. VeriClaw (verification / audit)
9. Flow Strategy
10. SMS Copywriter
11. ATLAS / Top Brain (industry-wide intelligence)
12. Smart Insight Engine
13. Contextual AI Advisor

### 5.3 VVOW Specifically

VVOW invokes **Brain 5 (Visual Intent Router)** and **Brain 6 (Designer Brain)** primarily. Other brains are called by the broader email generation pipeline (Phase 2); VVOW Phase 1 does not own them.

**Rule:** When writing VVOW directives, scope discussion to Brain 5 + Brain 6 unless cross-brain coordination is explicitly required.

---

## 8. Tech Stack (Locked)

### 8.1 Canvas Engine — GrapesJS Studio SDK

**Lock:** All visual editing happens inside GrapesJS Studio SDK. No custom canvas implementation.

- Block-based architecture for image arrangement
- Asset manager API for image swap-in
- Custom AI Panel mounts in sidebar via SDK extension points
- Native event hooks for selection / drag / drop

### 8.2 Job Scheduling — Inngest

**Lock:** Inngest handles all event-driven job orchestration.

- Triggers (user clicks Generate, RLHF event fires, scheduled re-training, scheduled scrape jobs for Pattern Seeding)
- Retries (provider failure → fallback chain)
- Step-level checkpointing (long-running pipelines survive crashes)

### 8.3 AI Workflow Orchestration — Mastra (@mastra/core)

**Lock:** Mastra is the DAG framework that runs INSIDE each Inngest step.

- TypeScript-native (matches monorepo language)
- Open-source (zero vendor lock-in vs LangChain Cloud / Flowise)
- DAG routes between models: NanoBanana 2 Pro, Ideogram V3, Flux 1.1 Pro, Seedream, the QA Bouncer, the Curator, DSPy optimization
- Manages the 7-Brain Council execution (Image Studio uses Brain 5 + Brain 6 primarily)

**Architectural pattern:** Inngest is the OUTER orchestrator (job-level). Mastra is the INNER orchestrator (DAG-level inside each Inngest step). Never confuse the two.

### 8.4 Pattern DB — pgvector on Supabase

**Lock:** Vector-indexed prompt pattern storage on Supabase Postgres with pgvector extension.

- Tables: `image_prompt_patterns`, `pattern_performance_metrics`, `assets` (R20 Database Schema ZCBR — pending rewrite)
- Embedding model: defined in R19 LLM Orchestration ZCBR
- Similarity search: top-K retrieval for brief-to-pattern matching
- Multi-tenancy: enforced via Supabase RLS on every query

### 8.5 Compositing — Sharp (Node.js) / PIL (Python)

**Lock:** Sharp (Node) is primary for TypeScript workers; PIL is used in Python contexts. Both handle programmatic compositing. **NOT AI.**

**Forbidden:** Calling an AI model to change text or color in a flattened image.

- Use case: User edits text in a generated poster → text is rendered as live GrapesJS-native overlay (B2 Text Edit), not regenerated
- Use case: User changes color of a flat element → Sharp/PIL programmatically swaps via pixel manipulation
- Performance lock: <100ms per operation, 0 AI tokens consumed

### 8.6 Learning Loop — DSPy

**Lock:** DSPy is the prompt optimization framework for the implicit RLHF feedback loop.

- Replaces paid prompt-optimization SaaS
- Open-source, Python-based (runs in Mastra-orchestrated worker steps)
- Inputs: validated patterns from RLHF events + Tinder swipe gate decisions
- Outputs: improved prompt templates that auto-update `image_prompt_patterns`

### 8.7 3-Tier Provider Strategy (Locked)

The tiers are **layers of routing**, not primary/fallback. Each tier serves a different purpose.

| Tier | Layer | Providers | Models in Tier | Purpose |
|---|---|---|---|---|
| **Tier 1** | **Aggregators (Launch Primary)** | Atlas Cloud, fal.ai (peers) | NanoBanana 2 Pro, Flux 1.1 Pro, Seedream | "Best for the Job" routing — handles majority of traffic |
| **Tier 2** | **Frontier Direct** | OpenAI, Google, Ideogram (direct API) | GPT Image 2, Imagen 4, Ideogram V3 | Reserved for high-complexity requests Tier 1 cannot handle |
| **Tier 3** | **Self-Hosted (Scale)** | RunPod / Thunder Compute | Same models as Tier 1/2, hosted on owned GPU | Long-term cost-reduction layer |

#### Routing Logic (lives in R29 PAL ZCBR)

1. **Tier 1 (default):** Art Director Router scores Tier 1 models on Best-for-the-Job criteria (quality × cost × speed × style). Atlas Cloud and fal.ai are peer aggregators within Tier 1 — health check between them, route to whichever is healthy.
2. **Tier 2 (escalation):** Triggered by **complexity threshold**, not failure. High-complexity requests that exceed Tier 1 capacity (e.g., text-heavy posters, very specific compositional requirements, etc.) escalate to Tier 2 frontier-direct APIs.
3. **Tier 3 (CapEx optimization):** Doesn't change WHICH model runs — only changes WHERE it runs. Re-hosts Tier 1/2 models on owned infrastructure once volume justifies the CapEx.

#### Tier 3 Activation Thresholds (locked, from `09_provider_strategy_prompting.md` and `Image Studio Complete Spec`)

| Threshold | Trigger | Action |
|---|---|---|
| **6,700 images/month** | Break-even point for self-hosted GPU | Auto-provision L40S instance ($202/mo via RunPod or Thunder Compute) |
| **18,700 images/month** | Volume warrants larger GPU | Upgrade to A100 80GB instance ($562/mo) |

Below 6,700 images/month, all traffic stays on Tier 1 + Tier 2 only. Tier 3 is dormant.

### 8.8 Model Registry (Locked)

The registry is split between **Generation Models** (used for net-new image creation) and **Editing Models** (used by toolbelt actions B1-B10).

#### 8.8.1 Generation Models by Tier

The Generation Model Registry is organized by tier (per §8.7) and is **extensible** via the Plugin Registry (R29 PAL) without code changes.

##### Tier 1 — Aggregators (NanoBanana, Flux, Seedream)

Routed via Atlas Cloud and fal.ai aggregators. Handles the majority of generation traffic.

| Model | Vendor | Role | Best For (research-pending — see §8.8.2) |
|---|---|---|---|
| NanoBanana 2 Pro | Google (via aggregators) | Primary "keyframe engine" — high-quality general-purpose | TBD per research |
| Flux 1.1 Pro | Black Forest Labs (via aggregators) | High-quality compositional generation + inpainting | TBD per research |
| Seedream | ByteDance (via aggregators) | Style-consistent generation | TBD per research |

##### Tier 2 — Frontier Direct (GPT Image 2, Imagen 4, Ideogram V3)

Direct API calls to vendors. Reserved for high-complexity requests that Tier 1 cannot handle.

| Model | Vendor | Role |
|---|---|---|
| GPT Image 2 | OpenAI direct | High-complexity / specific use-cases |
| Imagen 4 | Google direct | High-complexity / specific use-cases |
| Ideogram V3 | Ideogram direct | Typography-heavy generation, text-in-image |

##### Future Expansions (Plugin Registry — not in current registry)

Added via Plugin Registry as Phase 2+ ships, no code changes required:

| Model Class | Examples |
|---|---|
| Video | Sora 2, Veo 3, Kling 2.6 |
| Audio | Suno |
| 3D | Tripo AI |

#### 8.8.2 "Best for the Job" Routing — Outstanding Research Task

The Art Director Router's per-model scoring matrix is **not pre-determined**. It must be empirically derived through a research task. This is the responsibility of the Architect Claude role.

**Research methodology:**

1. For each of the 22 image types (§4.1) + A15 Brand Kit composite (§4.3), run **multi-LLM tenant generation** — same brief routed across all Tier 1 models simultaneously
2. Outputs flow through the **Tinder swipe gate** (§12.3) for human approval
3. Win-rate per model per image type populates the Art Director Router scoring matrix
4. Matrix updates trigger automatic routing changes — no code deploys required
5. Tier 2 models entered into the experiment when Tier 1 results are unsatisfactory for specific complexity classes

**Status:** This is a **future bullet directive**, not part of T73. The matrix starts empty. Initial Tier 1 routing uses uniform scoring until experiments populate the matrix.

**Forbidden:** Hardcoding "this model is best for product photography" or any similar fixed routing in business logic. All routing intelligence lives in the Art Director Router scoring matrix, populated by experimental results.

#### 8.8.2 Editing Models (used by Zone 3 Toolbelt)

| Model | Used By | Role |
|---|---|---|
| SAM 2 (Segment Anything Model 2) | B3 Layer Splitting, B5 Object Removal | Segmentation and object isolation |
| Flux 1.1 Pro (inpainting mode) | B1 Touch Edit, B4 Background Swap (replacement) | Context-aware regeneration of selected regions |
| Real-ESRGAN | B7 Upscale | Resolution enhancement (2x, 4x to retina/print quality) |
| Sharp (Node.js) / PIL (Python) | B2 Text Edit, B4 (color/transparency only), B8 Quick Edit | Programmatic compositing — **0 AI tokens** |

**Forbidden:** Hardcoding model names in business logic. Model selection lives in the Provider Routing plugin registry (see R29 PAL ZCBR), not in application code.

### 8.9 Component Reference Table

| Component | Technology | Purpose |
|---|---|---|
| Reverse-Engineering | Claude (Vision LLM via Anthropic) | Converts inspiration images → structured Pattern Recipe JSON (§10.3) |
| QA Bouncer | GPT-4o-mini | Automated **objective** filtering (NOT aesthetic judgment) — checks for brand violations, prohibited content, dimensional sanity |
| Compositing | Sharp (Node) / PIL (Python) | Text/color/layer changes — 0 AI tokens, <100ms |
| Pattern DB | pgvector (Supabase) | Vector-indexed prompt pattern storage |
| Asset Storage | Cloudflare R2 | Tenant-isolated bucket for generated and scraped images |
| Job Orchestration | Inngest | Event triggers, retries, step-level checkpointing |
| AI Workflow Orchestration | Mastra (@mastra/core) | DAG inside each Inngest step, model routing, Brain Council execution |
| Canvas | GrapesJS Studio SDK | Image Studio infinite canvas with non-destructive editing |
| Learning Loop | DSPy | Prompt optimization from RLHF + Tinder swipe signals |
| Web Scraping (Pattern Seeding) | Puppeteer / Cheerio | Scrapes Milled and competitor email archives for hero images |
| Future: Preference Classifier | Fine-tuned VLM | Replaces human reviewers after 5,000+ swipe decisions accumulate |
| Provider Routing | Plugin Registry (R29 PAL) | Add/remove models without code changes |

---

## 10. Pattern DB & Brief-to-Prompt Flow

### 10.1 The Flow

1. User types a brief in Design Chat (Zone 1) — e.g., "summer sale email hero for streetwear brand"
2. Visual Intent Router (Brain 5) embeds the brief via the embedding model defined in R19
3. Vector similarity search against `image_prompt_patterns` returns top 3 patterns
4. Each pattern includes: technical prompt template, recommended model, style references, LoRAs, historical fidelityScore
5. Visual Intent Router injects user's product image (from Brand Vault, see §11) into the templates
6. Provider Router (R29 PAL) routes each pattern to optimal model based on cost × quality × speed × style match
7. 3 generations execute in parallel via Mastra DAG
8. QA Bouncer (GPT-4o-mini) screens for objective failures (cropping, brand violations, prohibited content)
9. Surviving variants return to Design Chat as a 3-image set

### 10.2 Cache-First Behavior (T70 Shipped)

T70 enforces cache-first metadata transparency. Every generation first checks if a near-identical pattern + product combination has been generated recently, returning the cached result with a "cached" badge. This is the primary cost control.

### 10.3 Pattern Recipe JSON Schema (Locked)

When the Reverse-Engineering pipeline analyzes an inspiration image (via Claude Vision LLM), it produces a structured "Prompt Recipe" stored as JSONB in the `image_prompt_patterns` table. The recipe shape is locked.

```json
{
  "style_system": "string (e.g., 'fashion_editorial_campaign')",
  "shared_principles": {
    "format": "string",
    "aspect_ratio": "string",
    "model_pose": "string",
    "product_focus": "string",
    "typography_placement": "string",
    "color_harmony": "string",
    "mood": "string"
  },
  "variants": [
    {
      "background": "string",
      "props": "string",
      "lighting": "string",
      "color_grade": "string",
      "era_reference": "string"
    }
  ],
  "doodles": {
    "style": "string (e.g., 'white chalk-style')",
    "elements": ["string"],
    "feel": "string"
  },
  "negative_prompts": ["string"],
  "replication_prompt_template": {
    "prompt": "string with [PRODUCT_DESCRIPTION], [HERO_TEXT], [SECONDARY_TEXT] placeholders",
    "negative_prompt": "string"
  }
}
```

**Source:** `learned_patterns.md` and Video Analysis (internal knowledge base)

**Forbidden:** Storing patterns in any other shape. The Recipe schema is the lock — schema drift breaks the Visual Intent Router's pattern injection logic.

### 10.4 Pattern Seeding via Web Scraping (Locked)

The Pattern DB doesn't start empty. Initial seeding pulls hero images from competitor email archive sites.

#### Sources

| Source | What's Scraped | Frequency |
|---|---|---|
| Milled (milled.com) | Hero images from competitor brand emails | Scheduled (TBD: likely daily batch via Inngest) |
| Other competitor archives | Hero images, campaign visuals | Scheduled (TBD) |

#### Pipeline

1. Inngest scheduled job triggers scrape on Milled
2. Puppeteer + Cheerio extract hero images from listed competitor brand emails
3. Each scraped image stored in Cloudflare R2 with attribution metadata (source URL, brand name, scrape timestamp)
4. Reverse-Engineering pipeline (Claude Vision LLM) analyzes the image
5. Generates a Pattern Recipe (§10.3 schema)
6. Stores in `image_prompt_patterns` with `qaScore = 0`, `source_type = "scraped_seed"`
7. Pattern enters Active state and becomes available for vector retrieval
8. RLHF loop (§12) validates the pattern over time as users select it

#### Distinction from R46 IMAP Ingestion

R46 covers IMAP-based ingestion of full competitor emails for textual/strategic analysis (HYVE intelligence, ATLAS Top Brain). It is a **different pipeline** with a different purpose. The Pattern Seeding pipeline described here covers **WEB SCRAPING of HERO IMAGES specifically for the Image Studio Pattern DB**.

#### Legal/TOS Status

OD-002 covers the legal review of scraping Milled / Email Love / Really Good Emails for pattern seeding. Per the VVOW reverse-engineering doc, this is for internal architectural reference and benchmarking (no IP reuse). Expansion to additional sources beyond Milled is gated on this review.

---

## 11. Brand Vault Organization

The Brand Vault is the tenant-isolated asset storage system. It uses Cloudflare R2 for blob storage with hyper-organization layered on top via the database. T72 (shipped) defines the asset contract.

### 11.1 Storage

- **Primary:** Cloudflare R2 (per R21 Infrastructure)
- **Tenant isolation:** One bucket scope per `brand_id`, RLS enforced on every read
- **Stored objects:** Original generated images + edited variants + scraped reference images + product photos extracted via R31

### 11.2 Organization Layers (Database)

Organization is **database-driven, not folder-driven**. The `assets` table provides three layers of organization on top of the flat R2 bucket.

#### 11.2.1 Lineage

`parent_asset_id` field tracks edit ancestry:

- Original → Edit 1 → Edit 2 → Edit 3
- Enables non-destructive edit chains
- Reverting an edit = pointing the active reference back to a parent
- Original always preserved; never deleted by an edit

#### 11.2.2 Type Scope

`asset_type` enum (extensible — grows with the unbounded taxonomy in §4.2):

- `product_photo`
- `lifestyle_scene`
- `brand_logo`
- `color_palette_swatch`
- `typography_sample`
- `mockup`
- `scraped_reference`
- ... (extends as new types are discovered)

#### 11.2.3 Metadata (JSONB)

Full metadata stored in a JSONB column on `assets`:

- `generation_prompt` — user's brief or technical prompt
- `model_used` — NanoBanana 2 Pro, Flux 1.1 Pro, etc.
- `tags` — string array (auto + manual)
- `pattern_id` — FK to `image_prompt_patterns`
- `qa_bouncer_score` — float
- `parent_recipe` — embedded Pattern Recipe JSON (§10.3) if generation source
- `scrape_source_url` — populated only for scraped seeds
- `created_by` — user_id

### 11.3 Search Backend

pgvector embeds every asset on upload. Users search via natural language:

- Example query: "show me the blue dress photos from last summer"
- Vector similarity search on asset embeddings
- Filtered by `asset_type`, `tags`, `brand_id`, date range
- Returns ranked results with relevance score

### 11.4 Tagging

Two tagging mechanisms operating in parallel:

1. **Automated AI tagging on ingestion** — System extracts tags from generated content automatically (objects detected, colors extracted, mood classification)
2. **Manual `#`tagging in Brand Chat** — Users add custom tags using `#` syntax inside the conversational interface (e.g., "#summer2026 #drop1 #editorial")

Both tag streams write to the same `tags` array. Search queries hit both equally.

### 11.5 Cross-References

- T72 (shipped): defines the asset contract baseline
- R20 Database Schema ZCBR: defines the underlying tables (**ZCBR file is thin — needs rewrite to capture lineage, JSONB metadata, embeddings**)
- R31 Product Data Extraction ZCBR: defines product asset extraction (**ZCBR file is thin — needs rewrite to capture full Brand Vault organization**)

---

## 12. Implicit RLHF Learning Loop

Every user action emits a signal that updates `pattern_performance_metrics`:

| User Action | Signal | qaScore Delta |
|---|---|---|
| Drag variant to canvas | Pattern validated | **+1** |
| Export image for use | Pattern proven | **+5** |
| Ignore variant + click Regenerate | Pattern weak for this context | **−1** |

### 12.1 Pattern Lifecycle

- New pattern starts at `qaScore = 0`
- Promoted to "active" once `qaScore ≥ threshold` (defined in R24 — pending rewrite)
- Demoted to "archive" if rolling 30-day score drops below floor
- Top patterns weight more heavily in vector similarity ranking

### 12.2 Email Performance Loop (Phase 2)

Beyond user-canvas signals, **actual email send performance** feeds back once the Email Studio (Phase 2) is live:
- Open rate uplift attributable to image → boosts pattern fidelityScore
- Click rate on image-anchored CTAs → boosts pattern fidelityScore
- Performance metrics live in `pattern_performance_metrics`, R20 Database Schema ZCBR defines the shape (pending rewrite)

### 12.3 Tinder-Style Swipe Gate (Human-in-the-Loop Quality Verification)

System auto-approves or auto-rejects every generation based on QA Bouncer (GPT-4o-mini) signals. Human reviewers verify a sampled subset via a **Tinder-style side-by-side swipe UI** comparing generation against the original/inspiration:

| Reviewer Action | Sample Size |
|---|---|
| Side-by-side swipe vs. original on **auto-approved** patterns | **50% sample** |
| Side-by-side swipe vs. original on **auto-rejected** patterns | **20% sample** |

Reviewers see two images side-by-side (original + generation). They:
- **Swipe right** to confirm the auto-classification (high agreement signal)
- **Swipe left** to override the auto-classification (high-value training signal)

Override events feed the DSPy optimization loop with high-signal training data. Confirmation events validate auto-classification accuracy.

This replaces a weekly Curator review queue with continuous review at sample rate, reducing latency and increasing data quality for prompt optimization.

**Reviewer accounts:** 3 minimum, configured via `SWIPE_REVIEWER_USER_IDS` environment variable (OD-005 open decision — accounts not yet provisioned).

**Bridge to Fine-Tuned VLM:** After ~5,000 swipe decisions accumulate, the Fine-Tuned VLM Preference Classifier (trained on swipe outputs) replaces the human in the loop for the 50%/20% sample. Humans become exception-only reviewers.

### 12.4 Brand-Specific LoRA Fine-Tuning Pipeline

**Purpose:** LoRA (Low-Rank Adaptation) layers capture brand-specific style DNA at the model level, beyond what prompt engineering alone can achieve. This is the deepest form of brand learning in the data flywheel.

**Pipeline:**

1. Once a brand accumulates **N validated patterns** in `image_prompt_patterns` (threshold TBD per R24 rewrite — likely 50–100 high-qaScore patterns)
2. DSPy training data is exported alongside the brand's accumulated assets in Brand Vault
3. A LoRA is fine-tuned on the brand's validated outputs using the underlying generation model (typically Flux 1.1 Pro or NanoBanana 2 Pro depending on dominant pattern type)
4. The trained LoRA is deployed to the Plugin Registry tagged with `brand_id`
5. Future generations for that brand auto-apply the brand-specific LoRA via the Art Director Router

**Where LoRAs are referenced:**

- **Pattern DB:** Each pattern can declare LoRA dependencies (e.g., `summer_streetwear_v3.lora`)
- **Visual Intent Router (Brain 5):** Auto-appends brand LoRA to all generations for that tenant
- **Plugin Registry (R29 PAL):** Manages LoRA deployment, versioning, and routing
- **Tier 3 Self-Hosted:** When activated, LoRAs run cheapest on owned GPU vs. retail API surcharge

**Why this matters for the moat:**
- Pattern DB cache is fast but pattern-bounded
- LoRAs make EVERY generation for a brand more on-brand at the model level, even on novel briefs that don't match a cached pattern
- Lovart cannot do this — they have no per-tenant fine-tuning
- A VIYO brand's outputs become progressively more distinctive over time; a Lovart brand's outputs stay generic

**Forbidden:**
- ❌ Training a LoRA without explicit `brand_id` scoping (cross-tenant style leakage = privacy violation)
- ❌ Deploying a LoRA outside the Plugin Registry (bypasses observability and rollback)
- ❌ Auto-applying a LoRA without recording the application in generation metadata (breaks reproducibility)

**Source:** V8 PRD reference to LoRA fine-tuning + Pattern Seed Engine architecture.

---

## 13. Lovart Capability Parity (Touch Edit, Layer Splitting, Text Edit)

The three Lovart capabilities VVOW must replicate (sourced from `VVOW_Image_Studio_Reverse_Engineering_Complete.md`):

| Capability | Lovart Approach | VVOW Approach | Implementation Location |
|---|---|---|---|
| **Touch Edit** | Click any object, describe change in natural language | Custom AI Panel inside GrapesJS sidebar, context-aware regeneration via Brain 5 + Flux 1.1 Pro inpainting | Zone 3 Toolbelt B1 |
| **Layer Splitting** | Deconstruct flat image into PSD-like layers | SAM 2 segmentation + depth mapping, independent layers, swap backgrounds without regenerating | Zone 3 Toolbelt B3 |
| **Text Edit** | Live editable text preserving typography/perspective | Background = flat image, text = live GrapesJS native overlay (NOT regenerated by AI). Compiles to MJML in Phase 2 Email Engine. | Zone 3 Toolbelt B2 |

**VVOW is more email-robust than Lovart** for the Phase 2 integration: Email clients (especially Outlook) cannot render complex overlapping CSS layers. VVOW handles compositing on the backend, delivers a flattened optimized image to the Image Studio canvas with retained metadata, then the Email Studio compiles the final output to MJML for cross-client email-safe rendering when Phase 2 ships.

---

## 14. Identified Gaps (G1–G10)

These gaps in the VVOW initial spec were identified in the Lovart audit. **Each must be closed before public launch**, sequenced after the core RLHF flywheel is operational.

| # | Gap | Severity | Resolution |
|---|---|---|---|
| G1 | Color Palette Generation | Medium | Image type #10 in §4.1 — generates brand-aligned palettes with hex values, contrast ratios, application guidance |
| G2 | Unified Brand Kit Mode | **HIGH** | A15 Brand Kit Mode in §4.3 — single prompt → complete brand identity. **Public-launch blocker.** |
| G3 | Brand Guidelines PDF Export | Medium | Closed by A15 (auto-generates guidelines doc as part of Brand Kit) |
| G4 | Multi-Angle Product Shots | Medium | One product photo → 5–10 angles |
| G5 | Carousel / Multi-Slide Posts | Low | 3–10 cohesive slides for IG/LinkedIn |
| G6 | Interior / Architectural Visualization | Low | Furniture/products in room scenes |
| G7 | Product Catalog / Line Sheet | Medium | Professional grid layout with images, names, prices, SKUs |
| G8 | Character Consistency Across Scenes | **HIGH** | Same character/mascot in multiple scenes, identity locked via reference image. **Public-launch blocker.** |
| G9 | Storyboard Generation | Low | Sequence of consistent frames for video pre-production |
| G10 | AI UGC Content | Medium | UGC-style images and short videos for social ads |

**Sequencing rule:** G2 and G8 are the only HIGH severity gaps. Do not ship public launch without these.

---

## 15. VIYO Advantages over Lovart

These are the architectural moats. Every directive that touches VVOW must protect these advantages.

| Advantage | Mechanism | Protected By |
|---|---|---|
| Pattern DB Cache | Lovart generates from scratch every time. VVOW retrieves proven patterns first | T70 cache-first flow |
| RLHF Learning Loop | Bouncer → Tinder Swipe → DSPy. Lovart doesn't learn from users | §12 of this file |
| Art Director Router | Score every model on quality × cost × speed × style match per request. Lovart uses fixed model per task | R29 PAL ZCBR |
| Brand Vault Integration | Auto-extract brand assets (R31), available in every generation. Lovart requires manual upload | T72 Brand Vault asset contract + §11 organization |
| Phase 2 Email-Native Output | Generated images flow directly into Email Studio via Brand Vault. Lovart has no email integration | §2.3 of this file |
| Self-Hosted GPU at Scale | Tier 3 drops marginal cost to near zero. Lovart pays retail API prices forever | §8.7 of this file |
| Transparent Token Economics | Unified billing across all models. Lovart has opaque credit systems | R23 Cost Engine ZCBR |
| Pattern Seeding from Real Data | Pre-seeded with proven competitor patterns from Milled. Lovart starts every user from a blank slate | §10.4 of this file |

---

## 16. Phased Build Plan

The VVOW build proceeds in vertical slices. Each phase has a single acceptance test. No phase begins until the prior phase's acceptance test passes.

### Phase 1 — Core Loop (Chat → Canvas → DB)

**Acceptance test:** User types a brief in Zone 1, gets an image, drags it to Zone 2, and the image plus pattern metadata are persisted to `image_prompt_patterns` and Brand Vault (with full lineage + JSONB metadata + pgvector embedding).

Gate: Pattern DB writeable, single-variant generation working end-to-end via Atlas Cloud → fal.ai fallback chain. Brand Vault organization (§11) operational.

### Phase 2 — Multi-Variant Generation

**Acceptance test:** One brief produces three stylistic interpretations rendered in Zone 1, each tied to a distinct pattern in `image_prompt_patterns`.

Gate: Visual Intent Router top-3 retrieval working, parallel Mastra DAG execution stable.

### Phase 3 — Contextual Editing

**Acceptance test:** Select an image on canvas, type an edit in natural language in Zone 3 Quick Edit bar, image changes correctly while preserving surrounding context. All B1–B10 toolbelt actions functional. T73 Studio Editing Router routes correctly.

Gate: Sharp/PIL compositing path verified for non-AI operations. Touch Edit (B1), Text Edit (B2), Layer Splitting (B3) all green.

### Phase 4 — Implicit RLHF Feedback

**Acceptance test:** Pattern qaScore values measurably update after **1,000 accumulated RLHF events** (drags + exports + regenerations combined). DSPy optimization runs and produces improved prompt templates that update `image_prompt_patterns`. Tinder swipe gate operational with at least 3 reviewer accounts active.

Gate: §12 Learning Loop fully wired. Tinder swipe UI deployed. RLHF event counter visible in admin dashboard (R48 Observability ZCBR).

### Post-Phase-4 — Gap Closure

After Phase 4, gaps G1–G10 close in severity order: G2 (Brand Kit Mode A15) + G8 (Character Consistency) HIGH first, then Medium, then Low.

---

## 17. Current Build State

**As of 2026-05-08:**

| Task | Description | Status |
|---|---|---|
| Phase 0 | Foundation (repo, monorepo, Hono API worker, deployment pipeline) | **Complete** |
| T25 | Image Studio backend | **Shipped** |
| T26 | Image Studio frontend | **Shipped** |
| T70 | Pattern DB cache-first metadata transparency | **Shipped** |
| T71 | Token economics billing reconciliation | **Shipped** |
| T72 | R2 auto-save + Brand Vault asset contract | **Shipped** |
| T73 | **Studio Editing Router Implementation** — backend milestone for the Editing Router. Takes existing image + natural language edit instruction, routes to correct B1-B10 tool + model (e.g., SAM 2 for segmentation, Flux 1.1 Pro for inpainting, Real-ESRGAN for upscale), ensures non-destructive editing, saves result to `assets` table | **PAUSED before code implementation, pending PO architecture approval (this file)** |

**Authority codes acknowledged:** `ARCH_LOCK_V3`, `R18`, `R20`–`R23`, `Doc4 §0.1`, `P0-XX phasing`, `EF-87`.

**Dual record system:**
- Taskmaster (in-repo): `.taskmaster/config.json`, `.taskmaster/state.json`, `.taskmaster/tasks/tasks.json`, `.taskmaster/docs/*` — committed on `staging` branch
- Airtable Build Tracker (external SaaS): not directly accessible to Kimi; PO syncs status

**Acceptance of this file unlocks T73.** Without PO acceptance, T73 cannot proceed to code.

---

## 18. Critical Conventions / Forbidden Patterns

**Architectural rules every directive must respect.**

### 18.1 Forbidden

- ❌ Calling an AI model for text editing in a generated image. Use Sharp/PIL programmatic compositing + GrapesJS native text overlay (B2 Text Edit pattern). MJML compilation happens later in the Phase 2 Email Engine.
- ❌ Hardcoding model names in business logic. Use the Provider Routing plugin registry (R29 PAL).
- ❌ Hardcoding the 22 image types as a fixed enum. Types live in `image_prompt_patterns.type_name`, queryable from DB.
- ❌ Bypassing QA Bouncer for any generation routed to user.
- ❌ Skipping the Pattern DB cache check for any user-initiated generation (violates T70).
- ❌ Storing generated images outside Brand Vault (violates T72 asset contract + §11 organization).
- ❌ Custom canvas implementations. Use GrapesJS Studio SDK exclusively.
- ❌ Storing patterns in any shape other than the Pattern Recipe JSON Schema (§10.3).
- ❌ Folder-based organization for the Brand Vault. Organization is database-driven (§11.2).
- ❌ Skipping the Tinder swipe gate sample for QA Bouncer outputs (50% approved + 20% rejected).

### 18.2 Required

- ✅ Every generation event emits an RLHF signal (§12) — no untracked generations.
- ✅ Every directive that touches VVOW lists its R-file ingestion-evidence requirements AND this architecture file.
- ✅ Multi-tenancy enforced via Supabase RLS on every Pattern DB and Brand Vault query.
- ✅ Mastra DAGs run inside Inngest steps. Never call providers directly from API handlers.
- ✅ All schema changes go through canonical migrations. Never patch via runtime code (incident lesson from §1A-FU-04 era).
- ✅ Every asset in Brand Vault has an embedding row (pgvector) for natural-language search.
- ✅ Every scraped seed image attributes its source URL in JSONB metadata.

---

## 19. R-File Cross-References

When writing a directive that touches VVOW, the following R-files are mandatory ingestion-evidence:

| R-File | When Required | ZCBR Status |
|---|---|---|
| R17 UX Architecture | Any directive touching Zones 1–3 layout | Reference |
| R18 Global Wiring Map | Any directive touching cross-system events | Reference |
| R19 LLM Orchestration | Any directive touching Brain 5 / Brain 6 prompts or model routing | Reference |
| **R20 Database Schema** | Any directive touching `image_prompt_patterns`, `pattern_performance_metrics`, or `assets` | **Thin — needs rewrite** |
| R21 Infrastructure | Any directive touching deployment, hosting, scale-out | Reference |
| R22 Security Auth | Any directive touching user identity or RLS | Reference |
| R23 Cost Engine | Any directive touching token billing or generation cost tracking | Reference |
| **R24 Image Pipeline** | **Mandatory for every VVOW directive** | **Thin — needs rewrite** |
| R26 Creative Concept | Any directive touching brief-to-concept translation | Reference |
| R27 Composable Sections | Phase 2 Email Studio integration | Reference |
| R29 PAL (Provider Abstraction Layer) | Any directive touching model routing or provider switch | Reference |
| R30 Product Animation | Any directive touching video/animation generation | Reference |
| **R31 Product Data Extraction** | Any directive touching Brand Vault asset extraction | **Thin — needs rewrite** |
| **R46 Email Ingestion** | Phase 2 — IMAP ingestion only. Does NOT cover Milled scraping (§10.4) | Partial coverage |

**ZCBR Rewrite Workstream:** R20, R24, R31 are flagged thin per PO audit. Rewrites happen incrementally as relevant bullets are scoped — not in a single sweep that would block the build.

---

## 20. Open Decisions (Cross-Reference)

These decisions affect VVOW but are tracked centrally in `/docs/governance/OPEN_DECISIONS.md`:

| ID | Decision | Blocks |
|---|---|---|
| OD-001 | Pricing reconciliation (deck slide 9 vs Notion D8) | Public launch |
| OD-002 | Legal review on Milled / Email Love / Really Good Emails scraping (for Pattern Seeding) | Phase 1 expansion beyond Milled |
| OD-003 | Atlas Cloud + fal.ai catalog verification | Phase 1 acceptance |
| OD-005 | 3 Swipe Gate reviewer accounts (`SWIPE_REVIEWER_USER_IDS`) | Phase 4 acceptance |

VVOW phases will note their dependency on specific Open Decisions in their directives.

---

## 21. Update Authority

This file is updated only via:

1. PO accepts a directive that explicitly modifies a section here, AND
2. Reviewer Claude verifies the change is coherent with the rest of the file, AND
3. The change is committed to `main` of `github.com/VIYO-NEW/VIYO` at `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`

**No agent (Kimi, Manus, Architect-in-Portal) may modify this file via runtime code or schema migrations.** Only via accepted directive + commit + merge.

When the V8 PRD is updated to incorporate the missing locks captured in §8 (the GrapesJS / Mastra / DSPy / 3-Tier Provider / Model Registry items), and when ZCBR R-files (R20, R24, R31) are rewritten, this section will note the date of synchronization and the file will be slimmed accordingly.

---

## Appendix A — Summary Table of Locks

| What | Lock |
|---|---|
| Phase 1 product | Standalone Image Studio (VVOW) — GrapesJS + Studio SDK |
| Phase 2 product | Email Studio (separate) — GrapesJS + MJML Plugin (`mjml-core`), references Brand Vault by UUID |
| Unified backbone | GrapesJS for both surfaces (Studio SDK tuning vs. MJML Plugin tuning) |
| Email Studio output | JSON MJML Recipe → compiled HTML via mjml-core (deterministic) |
| Email Section Library | 12 MJML Section Templates (Hero, Split, Grid, Editorial, etc.) — AI fills slots only, never writes raw HTML |
| Asset reference model | Email Studio references Brand Vault assets by UUID (not upload). Live-sync edit flow opens Image Studio modal, saves new version, auto-updates UUID reference. |
| Email compilation (Phase 1) | N/A — Image Studio outputs flat images to Brand Vault |
| Email compilation (Phase 2) | MJML via `mjml-core` |
| Outer orchestration | Inngest |
| Inner orchestration | Mastra (@mastra/core) |
| Pattern DB | pgvector on Supabase |
| Asset storage | Cloudflare R2 (tenant-isolated, DB-organized) |
| Brand Vault organization | parent_asset_id lineage + asset_type enum + JSONB metadata + pgvector search |
| Brand Vault tagging | Auto AI tagging on ingestion + manual `#`tagging in Brand Chat |
| Compositing | Sharp (Node.js) / PIL (Python) — NOT AI |
| Learning loop | DSPy + Tinder swipe gate + brand-specific LoRA fine-tuning |
| Tier 1 layer (Aggregators) | Atlas Cloud + fal.ai (peers) — routes NanoBanana 2 Pro, Flux 1.1 Pro, Seedream |
| Tier 2 layer (Frontier Direct) | OpenAI / Google / Ideogram direct APIs — GPT Image 2, Imagen 4, Ideogram V3. For high-complexity Tier 1 cannot handle |
| Tier 3 layer (Self-Hosted) | RunPod / Thunder Compute. L40S ($202/mo, triggers at 6,700 img/mo) → A100 80GB ($562/mo, triggers at 18,700 img/mo). Re-hosts Tier 1/2 models for cost optimization |
| Generation model registry | Open / extensible via Plugin Registry. Tier 1: NanoBanana 2 Pro, Flux 1.1 Pro, Seedream. Tier 2: GPT Image 2, Imagen 4, Ideogram V3. |
| Routing principle | "Best for the Job" — Art Director Router scoring matrix populated by Architect Claude research task (multi-LLM tenant generation + Tinder swipe gate human approval) |
| Editing models | SAM 2 (segmentation), Flux 1.1 Pro (inpainting), Real-ESRGAN (upscale), Sharp/PIL (compositing) |
| Brand-specific LoRA pipeline | Triggered after N validated patterns per brand. Trained on brand's RLHF-validated outputs. Deployed to Plugin Registry tagged by brand_id. Auto-applied on future generations. |
| Reverse-engineering | Claude (Vision LLM) |
| QA filter | GPT-4o-mini (objective only) |
| Pattern Recipe schema | Locked JSON shape per §10.3 |
| Pattern Seeding source | Milled (hero images via Puppeteer/Cheerio scrape) |
| Future preference classifier | Fine-tuned VLM (post-5,000 swipe decisions) |
| Brain Council scope for VVOW | Brain 5 (Visual Intent Router) + Brain 6 (Designer Brain) |
| Image type taxonomy | 22 first-discovered, unbounded self-expansion via DB |
| A15 Brand Kit Mode | Composite generation, public-launch blocker (G2) |
| Image Studio architecture | 3-zone canvas: Design Chat / Infinite Canvas / Floating Toolbelt |
| RLHF signals | drag +1, export +5, regenerate −1 |
| RLHF human verification | Tinder-style side-by-side swipe (50% approved sample, 20% rejected sample) |
| Phase 4 acceptance threshold | 1,000 accumulated RLHF events |

---

**End of Architecture Specification.**

For directive authoring conventions and ingestion-evidence requirements, see `/docs/viyo-development-protocol-v2.md` and `/docs/viyo-document-ingestion-protocol.md`.
