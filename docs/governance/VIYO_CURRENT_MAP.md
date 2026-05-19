# VIYO_CURRENT_MAP.md

**THE inheritance file. Every future VIYO agent reads this first.**

**Phase 3.1 deliverable per VIYO_PATH_TO_MVP.md §Step 6**
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop)
**Supersedes:** `/docs/governance/CURRENT_STATE.md` (2026-05-08, 5+ days stale, 6 PRs not reflected)
**Authority tier:** Inheritance layer. Below FOUNDATION_LOCK + FOUNDATION_AUTHORITY + ARCHITECT_OPERATING_RULES; above per-Bullet directives. Read FIRST at every session start.
**Maintenance:** Living document. §9 (Current State) + §10 (Pending Work) updated at end of every Architect session as standing discipline. §1–§3 (Identity / MVP / Vision) require PO ratification to change. Quarterly drift detection via dedicated Curator session.

---

## RULE A — Paragraph summary

VIYO_CURRENT_MAP.md is the single inheritance file every future VIYO agent reads at session start to inherit the entire project context — identity (AI Email Creative OS for Shopify+Klaviyo brands), MVP scope (Phase 1 Image Studio standalone, "Lovart on Steroids," 11 sub-phases per PRODUCT_ROADMAP), 6-month V1.0 vision (Phase 1 → 1B → 2 → 2.5 → 3 → 4+), tech stack (Next.js + Supabase + R2 + Inngest + Mastra + GrapesJS Studio SDK + 3-tier provider strategy), domains (app.viyo.com + admin.viyo.com + ai.viyo.new live + ops.viyo.new planned), platform IDs (3 GitHub repos + 5 Notion DBs + 5 Airtable tables + 4 Drive folders), agent topology (Architect + Curator + Cataloger + 3 Manus channels + Reviewer Claude + Kimi), Image Studio architecture (pointer to VVOW v2.0 canonical + 22 modes + B1-B10 toolbelt + 8 Lovart advantages + RLHF flywheel), current state snapshot (staging HEAD `1cc34b6` after 4 governance commits; 9 R-spec v2 PRs merged; sub-phase status), pending work queue (R-spec gaps + Bullet work + Phase 1 sub-phase Bullets + 6 Open Decisions blocking), active governance pointers (7 files: FOUNDATION_LOCK + ARCHITECT_OPERATING_RULES + NIR_OPERATING_RULES + ZCBR_STANDARD + CODING_CONVENTIONS + INFRASTRUCTURE_DECISIONS + ANTI_PATTERN_CATALOG), anti-pattern reference (pointer to ANTI_PATTERN_CATALOG with 3 top callouts), ratified vs proposed snapshot (Notion ratified PO decisions per the live Decisions DB + 21 Locks ratified + Stack Constraints 30-37 PROPOSED + 13 Open Decisions active), communication discipline (Nir non-technical mobile-first prose-oriented; NIR_OPERATING_RULES universal + ARCHITECT_OPERATING_RULES §4 Architect-specific), and maintenance rule (living document update protocol). §16 surfaces 2 Curator-call decisions for PO ratification: ANTI_PATTERN_CATALOG.md and STATE_AUDIT.md remain uncommitted to repo from earlier phases (workflow correction came after Phase 2.1 ratification) — recommend committing both at Phase 3.1 ratification so all 7 governance pointers in §11 resolve to canonical state.

---

## Method

1. Read every Phase 1–2 deliverable (STATE_AUDIT.md, ANTI_PATTERN_CATALOG.md, FOUNDATION_LOCKS_v2.md → committed as FOUNDATION_LOCK.md SHA `d3795eb`, ARCHITECT_OPERATING_RULES.md → committed SHA `d67cebd`, NIR_OPERATING_RULES_v2.md → committed as NIR_OPERATING_RULES.md SHA `1cc34b6`).
2. Read VIYO_FOUNDATIONAL_SEED.md (Drive `1SdGiuoNEUnHglq5ujPyXw1Jjg8A64heN`) for canonical identity / MVP / vision substrate.
3. Read VIYO_PATH_TO_MVP.md §Step 6 (Drive `1W5DjHrndG5GvmOPxtYwfIkNO5iiMjd3O`) for the 15-section inline specification.
4. Read VVOW_IMAGE_STUDIO_ARCHITECTURE.md v2.0 + PRODUCT_ROADMAP.md + 9 shipped R-spec v2 files in repo `/docs/`.
5. Verified Notion Decisions DB current count via Notion MCP search (D84 latest observed 2026-05-12T21:43).
6. Verified staging HEAD via git log (`1cc34b6` after this session's three governance commits).
7. Authored the 15 sections + §16 Curator-call decisions + §17 closing.

---

## §1 — VIYO Identity (Q7)

**VIYO is an AI Email Creative Operating System for Shopify + Klaviyo brands.** Vertical: e-commerce brands using Klaviyo for email marketing. Positioning: replaces the fragmented agency workflow (designer + copywriter + email developer + analyst) with an AI-native creative OS that absorbs the moats of four single-purpose competitors (Lovart image generation + Migma email creation + Grid & Pixel campaign operations + Instant hyper-personalization) into one product driven by a shared brand intelligence layer (ATLAS Top Brain corpus + MAAX per-brand memory graph + HYVE opt-in cross-brand network).

**Pricing (locked per Notion D8):** Free $0 / Starter $49 / Growth $249 / Agency $499 / Enterprise $1,499. Token-metered with hard stop at zero — no overage billing.

**PO:** Nir. Non-technical, mobile-first, prose-oriented (see §14 Communication Discipline).

---

## §2 — MVP Definition (Q7)

**MVP scope (ratified 2026-05-12 by PO, Notion D41):** Phase 1 Image Studio standalone, marketed as "Lovart on Steroids." Customer journey: signs up at app.viyo.com, uses Lovart-style 3-zone Studio (conversational chat + infinite canvas + floating B1–B10 toolbelt) to generate brand-aligned images, downloads for use anywhere. **Email composition is NOT in MVP. Klaviyo integration is NOT in MVP.**

**Phase 1 sub-phases (11 sub-phases per PRODUCT_ROADMAP.md):**

| Sub-phase | What | Acceptance gate | Status |
|---|---|---|---|
| 1.1 Core Loop | Chat → Canvas → DB single-variant generation | B-1.00 acceptance — end-to-end loop, 4 named failure modes, cache hit + cache miss tested, RLHF events emit | 🟡 IN PROGRESS — substantive substrate present per CODE_RECONCILIATION_2026-05-15.md §3.1; B-1.00 acceptance not verified |
| 1.2 Pattern DB cache | Cache-first with metadata transparency | Cache hit + miss paths verified end-to-end | 🟡 PARTIALLY SHIPPED — substrate complete (image-patterns.ts + embeddings + pattern schema); end-to-end verification pending |
| 1.3 Token billing | Reconciliation across providers | B-0.07 + B-1.14 acceptance | ✅ SUBSTRATE SHIPPED — T9 backend + frontend + token-engine.ts + processed_stripe_events dedup |
| 1.4 R2 + Brand Vault | Asset contract with lineage + JSONB metadata + pgvector | B-0.03 acceptance | ✅ SHIPPED — assets table + parent_asset_id lineage + JSONB + pgvector + R2 two-bucket setup |
| 1.5 Editing Router | Studio Editing Router routes B1–B10 + correct model per intent | B-1.11 + B-1.12 + B-1.13 acceptance | ⏸ CONTRACT LAYER ONLY — editing-router.ts is contract-only; no editing tool implementation; T47 v2 R-spec missing; gated on OD-019 + WP-1/WP-2 |
| 1.6 Multi-variant | One brief → 3 variants in Design Chat | TBD | NOT STARTED |
| 1.7 Full editing tools | All B1–B10 functional with correct model routing | TBD | NOT STARTED |
| 1.8 RLHF feedback loop | qaScore updates after 1,000 events; DSPy active; Tinder swipe gate with 3 reviewers | TBD | NOT STARTED |
| 1.9 Pattern Seeding | Milled scraper live; Pattern DB seeded | — | **DEFERRED V1.0.5** (gated on OD-002 legal review) |
| 1.10 Brand-Specific LoRA | First brand reaches threshold; LoRA training produces deployable artifact | — | **DEFERRED V1.0.5** |
| 1.11 Gap closure | G2 (A15 Brand Kit Mode) + G8 (Character Consistency) shipped | TBD | NOT STARTED (public-launch blocker) |

**Public launch scope minimum:** sub-phases 1.1 through 1.8 + 1.11 + admin shells (B-1.01 brand admin signup, B-1.02 team invites) + Lovart-style tiered billing UI (B-1.14) + Shopify read-only catalog sync (B-0.17) + 22 generation modes A1-A22 (B-1.07/08/09) + Designer Brain (B-1.04) + recommended usability (B-1.15 search/tagging, B-1.16 version history) + Phase 1 Acceptance Gate (B-1.18).

**Deferred to V1.0.5:** sub-phase 1.9 Pattern Seeding (OD-002 legal review blocking); sub-phase 1.10 Brand-Specific LoRA fine-tuning.

**Dropped from MVP entirely:** B-0.18 Klaviyo connector scaffold (Klaviyo enters in V1.1 with Email Engine).

**Estimated timeline:** 12–16 weeks calendar with 2 parallel Composer Queue lanes (OD-009 ratified 2026-05-15: 2 parallel lanes for related-and-wired features; sequential for cross-touching). Confirmed achievable per Phase A A2.

---

## §3 — 6-Month V1.0 Vision (Q7)

Phase 1 (Image Studio MVP) public launch unlocks → **Phase 1B Intelligence Foundation** (R46 IMAP email ingestion / R25 Video/IG ingestion / SYPHON ESP data ingestion / MAAX per-brand memory graph / HYVE opt-in cross-brand network — hard prerequisite for Phase 2 because Email Engine without learned corpus produces generic emails) → **Phase 2 Email Engine** (13-Agent Brain Council activated / Email Bible loaded / 12 MJML Section Templates / Migma-style import from Figma/HTML/Screenshot / Klaviyo deployment pipeline / 12 flow templates / Segments + Audiences scaffolded / Popups / Magic Mail deliverability / Automatic Suppression / AI Klaviyo Audits) → **Phase 2.5 Brand Team Collaboration + Trust Layer** (Brand Chat Slack-style / Generation session sharing / Team approval workflows / Activity feed / Notifications) → **Phase 3 LENZ Intelligence Studio** (personalized copy per shopper / dynamic products / smart coupons / send-time optimization / Audiences first-party data / Super Templates / LENZ analytics / PULZE pattern surfacing / Smart Insight Engine).

**Phase 4+ (far future):** Timer Service, deeper Shopify integration, Admin Portal expansion (R39), BFCM module, public REST API, additional ESPs (ActiveCampaign / Brevo / Mailchimp / SendGrid).

---

## §4 — Tech Stack (Q9)

**Frontend:** Next.js 14+ App Router + GrapesJS Studio SDK (Canvas API for Phase 1; MJML Plugin for Phase 2).

**Database:** Supabase Postgres + RLS + pgvector + Auth + Realtime.

**Storage:** Cloudflare R2 (zero egress, S3-compatible, two buckets `viyo-assets-production` + `viyo-assets-staging`, custom domain `assets.viyo.email`).

**Job orchestration:** Inngest (outer event-driven orchestration) + Mastra DAGs `@mastra/core` (inner workflow composition inside each Inngest step). Architectural pattern: Inngest is OUTER, Mastra is INNER.

**AI providers (R29 v2 PAL Plugin Registry — Lock 19 Provider Agnosticism):**
- **Tier 1 Aggregators (launch primary):** Atlas Cloud + fal.ai peers route NanoBanana 2 Pro + Flux 1.1 Pro + Seedream. "Best for the Job" routing.
- **Tier 2 Frontier Direct:** OpenAI + Google + Ideogram direct APIs route GPT Image 2 + Imagen 4 + Ideogram V3 for high-complexity Tier 1 cannot handle.
- **Tier 3 Self-Hosted:** RunPod / Thunder Compute re-host Tier 1/2 models for CapEx optimization. Activates at 6,700 img/mo → L40S ($202/mo); 18,700 img/mo → A100 80GB ($562/mo); admin-gated, NOT auto-activated.

**Image AI models:** SAM 2 (segmentation, B3/B5), Flux 1.1 Pro (generation + inpainting, B1/B4), Real-ESRGAN (upscale, B7), Sharp (Node) / PIL (Python) (programmatic compositing — B2/B4 color/B8, zero AI tokens per Lock 8), Tesseract (OCR), Claude Vision (reverse-engineering for Pattern Recipe extraction).

**Learning loop:** DSPy (prompt optimization framework for the implicit RLHF feedback loop).

**Billing:** Stripe with token-metered pricing.

**ESPs (Phase 2+):** Klaviyo primary; ActiveCampaign / Brevo / Mailchimp / SendGrid via R29 PAL.

**Deployment:** Vercel (4 projects: viyo-admin / viyo-web / viyo-main / ai-api-web-portal) + Render (2 services: viyo-worker / viyo-worker-staging) + Cloudflare (R2 + DNS).

**Caching + rate limiting:** Upstash Redis (2 databases: `viyo` + `viyo-redis-staging`).

**Provider Agnosticism (Lock 19):** No application code names a specific AI model, OCR provider, ESP, or third-party service in business logic. All selections live in the Provider Routing plugin registry (R29 v2 PAL). Business logic calls `provider.execute(task)`; registry resolves the actual provider.

---

## §5 — Domains (Q9)

| Domain | Purpose | Status |
|---|---|---|
| **app.viyo.com** | Phase 1 brand admin shell + Image Studio (Lovart-style 3-zone UX) | Not yet deployed; ships with B-1.01 (sub-phase 1.5+ window) |
| **admin.viyo.com** | Phase 1 internal admin (tenant list, Tinder swipe gate reviewer interface, basic system health, manual feature flag toggle) | Not yet deployed; ships with sub-phase 1.6+ window |
| **ai.viyo.new** | VIYO Portal — Kimi K2.6 executor + Reviewer Claude + skills system + Composer Queue | **LIVE** (build factory operational) |
| **ops.viyo.new** | Ops Glue internal tooling (D71-D78 Ops Glue Spec v1) | Planned; repo to be created at github.com/viyo-ai/ops-glue |
| **assets.viyo.email** | Cloudflare R2 custom domain for Brand Vault asset serving | LIVE (bound to viyo-assets-production + viyo-assets-staging) |

---

## §6 — Platforms & IDs (Q5, Q8)

**GitHub repositories:**
- **VIYO product repo (public):** `github.com/VIYO-NEW/VIYO`. Branch `staging` is canonical (per INFRASTRUCTURE_DECISIONS ID-1); `main` is production.
- **VIYO Portal repo (private):** `github.com/viyo-ai/AI-API-Web-Portal-v2`. Portal infrastructure — Kimi integration, §9 Gate code, skills loading, Composer Queue logic. Out of VIYO Architect scope; routes through separate Portal Architect channel.
- **Ops Glue repo (planned):** `github.com/viyo-ai/ops-glue`. To be created. Internal ops tooling per D71-D78 Ops Glue Spec v1.

**Notion workspace** (parent: `3559a84a-4679-8194-946e-f8fc5479e4c2`):

| Database | Database ID | Data source ID | Purpose |
|---|---|---|---|
| 🗄️ Decisions Database | `7a769bf3c2914825aa42c1c8bc94ca30` | `b886724c-aa03-432b-889e-e63d9cdb7de6` | ratified PO decisions, schema per live DB; Phase Relevance multi-select for cross-phase tagging |
| 🚧 Open PO Decisions Database | `b31bfeb08108475eac7144295f36ff55` | `996b2e7d-50f8-41bd-a815-faf5194277f1` | OD-001 through OD-020 active blocking items |
| 🔒 Foundation Locks Database | `59e623267f354320b7d428eb6df62901` | `7ed3c2e2-958d-40f0-bb32-70711b52c6bc` | Locks 1-21 ratified; Phase 5.2 sync to FOUNDATION_LOCK.md pending |
| ⚠️ Documentation Gaps Database | `cc88a0025fc14528b4de4520ff271ea1` | `a6bc7b34-6f70-44e4-872f-4a7c481ff1d1` | GAP-XXX tracking; severity Red/Yellow; identified by F-1/F-1.5/VVOW audits |
| 📥 PO Inbox | `e54c3ffe84f940189086512ba1c1ec88` | `be5f9696-b119-4f81-bb73-2599f5c1242b` | PO observations routed to Architect/Curator/Cataloger; cross-phase tagging |

**Airtable base** `appo5mNncCCzKcIRk`:

| Table | Table ID | Records | Purpose |
|---|---|---|---|
| VIYO Q&A Master Log | `tblWr8n54Vb83egxR` | ~200 | Q&A cross-session decision retrieval |
| Build Tracker | `tblIJUzJoCCjWXaMQ` | 580 | Feature-level inventory keyed by Feature ID (P0-XX / V11-XX / VF-XX / T-XX) |
| Skills Registry | `tbl4gNd7bWjypMQBF` | 109+ | Layer 2 Pattern Skills per FOUNDATION_AUTHORITY L12-B |
| Services Inventory | `tblcRL2RNys7SIiW5` | 27 | External services, API keys, account status |
| Architecture Broadcasts | `tblyZdtFjTYIwSzBT` | 6 | PO-Builder handshake bus (5 Executed + 1 Pending Builder Ingestion since 2026-05-03) |

**Google Drive folders:**

| Folder | Drive ID | Purpose |
|---|---|---|
| Claude working folder | `1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki` | Governance working files (`zcbr-spec-validation` skill spec lives here per Lock 20) |
| VIYO V8 PRD | `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` | V8 PRD (799KB, stale 2026-05-08; supersedes by V8.1 in Phase 4) |
| Working folder | `1VrI8_dByLmWPbC3Y26i8DjhdS7gmA9qK` | In-flight drafts |
| ZCBR R-files | `1duV346EV6D8n2cUqO0xW-oGgmq5o3bcI` | 37 ZCBR specs (May 3 wave; Manus-authored, mostly superseded by Architect Claude v2 rewrites) |

**Portal product:** `ai.viyo.new` — Kimi K2.6 executor + Reviewer Claude + skills system + Composer Queue.

---

## §7 — Agent Topology (Q12)

| Agent | Lives in | Role | When to defer to it |
|---|---|---|---|
| **VIYO Product Architect** | Claude Code Desktop OR claude.ai chat | Authors R-specs, Bullet directives, governance contributions. Sequences work within ratified scope. PO-facing voice for VIYO product. | Architect IS the active session (default for product work). |
| **Governance Curator** | Claude Code Desktop | Foundational governance authoring, rule consolidation, anti-pattern cataloging. | When governance changes proposed; rule consolidation needed; foundational reset required. |
| **Decision Cataloger** | Claude Code Desktop (**formally active as of 2026-05-13 CLAUDE.md v2 commit SHA `92dc4b8`**) | Commits ratified decisions to Notion canonical state. Refuses commits without explicit PO ratification surface. | When ratified decisions need cataloging to Notion DBs. Per-write PO ratification still required pending tool-access scoping operationalization (transitional behavior per ARCHITECT_OPERATING_RULES §3.4 edge case). |
| **Manus VIYO channel** | Manus AI service | Commits product code (apps/, packages/, scripts/) to VIYO repo per Heavy/Lean directives. | When R-spec ZCBR PASSED + Bullet directive ratified + ready for code. |
| **Manus Portal channel** | Manus AI service | Commits Portal infrastructure to viyo-ai/AI-API-Web-Portal-v2. | Portal infrastructure work — out of VIYO Architect scope, separate channel. |
| **Manus Ops Glue channel** | Manus AI service (to be created) | Commits Ops Glue internal tooling to viyo-ai/ops-glue. | When ops tooling work scoped (planned). |
| **Reviewer Claude** | Portal at ai.viyo.new | Pre-PR validation per ZCBR_STANDARD §5 Checkpoint 2 + §9 Gate code review protocol. | Before any Manus PR merges. |
| **Kimi K2.6** | Portal at ai.viyo.new | Build skill execution from Composer Queue intake. ZCBR pre-flight per Checkpoint 3. | When Bullet directive enters Composer Queue. |

**Critical:** Kimi and Reviewer Claude are NOT Manus agents — they live inside the Portal product. Manus is the commit layer.

**Commit boundaries (per ARCHITECT_OPERATING_RULES §5.2):**
- Governance files (`/docs/governance/*.md`, `/docs/architecture/*.md`) → Curator/Architect direct via local git from Claude Code Desktop (env-var identity `VIYO Curator <office@viyo.new>`).
- Product code (apps/, packages/, scripts/, render.yaml, package.json, pnpm-lock) → Manus VIYO channel via Heavy/Lean directive.
- R-spec ZCBR files (`/docs/research_specs/*.md`) → Manus VIYO channel via directive (existing convention).
- Portal infrastructure → Manus Portal channel via separate Architect channel.
- Ops Glue → Manus Ops Glue channel.
- Notion DBs → Cataloger (after Phase 3.2 formalization) — transitionally Architect with per-write PO ratification.

---

## §8 — Image Studio (Q10)

**Primary canonical reference:** [`/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`](docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md) v2.0 (PO-accepted 2026-05-12). Read first when working on any Image Studio surface.

**3-zone spatial architecture (Lovart-style):**
- **Zone 1 Design Chat (right sidebar):** Conversational generation engine. User types business briefs (not technical prompts); Visual Intent Router (Brain 5) embeds brief, queries `image_prompt_patterns` vector DB, retrieves top 3 patterns, returns 3 variants.
- **Zone 2 GrapesJS Infinite Canvas (center):** Composition engine. User drags favored variants from Design Chat onto canvas. Every drag triggers `+1 qaScore` (Lock 9 RLHF). Auto-save destination: Brand Vault (Lock 6).
- **Zone 3 Contextual Toolbelt (floating):** Editing engine. Appears on image selection. Provides 10 editing tools (B1–B10) + Quick Edit natural-language bar.

**B1–B10 toolbelt:**

| Code | Tool | Implementation |
|---|---|---|
| B1 | Touch Edit | Semantic inpainting — Flux 1.1 Pro for context-aware regeneration (AI tokens) |
| B2 | Text Edit | Live GrapesJS-native text overlay on flat image — Sharp/PIL composite (0 AI tokens) |
| B3 | Layer Splitting | SAM 2 segmentation + depth mapping → independent layers (lazy extraction per C-01, Lovart-style stack lock) |
| B4 | Background Swap | Sharp/PIL for color/transparency; Flux 1.1 Pro inpainting for replacement |
| B5 | Object Removal | SAM 2 segmentation + smart fill (AI tokens) |
| B6 | Expand / Outpainting | AI extends canvas to new aspect ratio (AI tokens) |
| B7 | Upscale | Real-ESRGAN — 2x/4x to retina/print quality (AI tokens, separate cost class) |
| B8 | Quick Edit | Brightness/contrast/saturation/crop/resize/flip/rotate via Sharp/PIL (0 AI tokens per Lock 8) |
| B9 | Style Transfer | Image-to-image with style reference (AI tokens) |
| B10 | Material Swap | Object-level material change (AI tokens) |

**22 Generation Modes (A1–A22):** locked at launch (Product Photography / Typography Poster / Compositional Poster / Lifestyle Scene / Product Flat Lay / Product-on-Model / Social Media Ad / Email Hero / Brand Pattern / Color Palette / Mood Board / Texture / Background / Icon Set / **A15 Brand Kit Mode (G2 public-launch blocker)** / Infographic / Before/After / Seasonal / Collection / Lookbook / Detail Shot / Scale Reference / Packaging). Taxonomy is unbounded — discovered modes promote via RLHF cluster threshold (per VVOW §4.2).

**Public-launch blockers (G2 + G8 HIGH-severity gaps):**
- **G2 A15 Brand Kit Mode** — composite generation (logo suite + color palette + typography + social templates + mockup suite + brand guidelines PDF) from single prompt.
- **G8 Character Consistency Across Scenes** — same character/mascot in multiple scenes, identity locked via reference image.

**8 advantages over Lovart (per VVOW §15):**
1. Pattern DB Cache (T70) — proven patterns retrieved before generation
2. RLHF Learning Loop — Bouncer + Tinder Swipe + DSPy (Lovart doesn't learn)
3. Art Director Router — empirical scoring (Lovart uses fixed model per task)
4. Brand Vault Integration — auto-extract via R31 + organized per Lock 6
5. Phase 2 Email-Native Output — generated images flow directly into Email Studio
6. Self-Hosted GPU at Scale — Tier 3 drops marginal cost to near-zero
7. Transparent Token Economics — unified billing across models
8. Pattern Seeding from Real Data — pre-seeded with Milled patterns (V1.0.5)

**RLHF flywheel (Lock 9):** drag = +1 qaScore / export = +5 / regenerate = −1. QA Bouncer (GPT-4o-mini) auto-approves. Tinder swipe gate humans verify 50% approved + 20% rejected. After 5,000 swipe decisions, Fine-Tuned VLM Preference Classifier replaces humans for sample.

**Pattern DB + Pattern Recipe JSON Schema (Lock 5):** locked shape — `style_system` / `shared_principles` / `variants[]` / `doodles` / `negative_prompts[]` / `replication_prompt_template` with placeholders.

**Brand Vault Organization (Lock 6):** R2 holds bytes; `assets` table provides organization — `parent_asset_id` lineage + `asset_type` enum + JSONB metadata + pgvector embeddings + auto AI tagging + manual `#`tagging in Brand Chat.

**Brand-Specific LoRA pipeline (Lock 10, V1.0.5 deferred):** Trained on brand's RLHF-validated outputs after N validated patterns; deployed to R29 PAL Plugin Registry tagged by `brand_id`; auto-applied on future generations.

**Pattern Seeding via Web Scraping (Lock 11, V1.0.5 deferred per OD-002):** Puppeteer + Cheerio scrape Milled hero images → R2 storage → Claude Vision reverse-engineering → Pattern Recipe → `image_prompt_patterns` insert.

---

## §9 — Current State Snapshot (Q6)

**As of 2026-05-18 Item 1 governance refresh:**

**Repo:** `github.com/VIYO-NEW/VIYO` staging branch.

**Staging HEAD:** `f980a76` (after B-0.01 Substrate Audit landing + FA §5 L1 phase-scoping fix). Per maintenance discipline + Rule 3.21 (Curator bundles SESSION_STATE refresh into every governance commit), §9 lags actual HEAD by exactly one commit — this Item 1 refresh commit becomes the new HEAD.

**§9.1 — Post-2026-05-15 substrate commits (ledger anchors U → Y):**

| Anchor | Commit | Event |
|---|---|---|
| U | `19074db` | Path X bookkeeping refresh — SESSION_STATE pointer + convention annotation |
| V | `67922fc` | **A9 v1.0 RATIFIED** — Cross-Surface Continuity Discipline (Lock-tier governance event) |
| W | `c269a11` | **MBS Commit 2 RATIFIED** — MBS v1.1 elevated to MVP execution authority (Lock 22 operationalized) |
| X | `afdf02b` | L1641 hot-fix — variant 5b instance closure |
| Y | `f980a76` | **B-0.01 Substrate Audit landing** — 165 P0 features audited, FA §5 L1 phase-scoping fix, DG-01 through DG-07 surfaced |

**§9.2 — Active substrate status as of 2026-05-18:**

- **B-0.01 audit landed** at `f980a76` — "schema-rich runtime-sparse" baseline; 3 critical gaps (GAP-L13-001 requireAdmin missing, GAP-L4-001 Mastra not installed, GAP-L12-001 skills_registry missing); DG-01 through DG-07 surfaced.
- **A9 v1.0 RATIFIED** at `67922fc` — Cross-Surface Continuity Discipline; Rules 3.10/3.11(REJECTED)/3.12, Rules A-E, anti-pattern variants 5a-5h, hooks substrate operationalization, Cataloger transitional period EXITED.
- **MBS Commit 2 RATIFIED** at `c269a11` — MBS v1.1 elevated to MVP execution authority per Lock 22 operationalization.
- **D89 ratified 2026-05-18** — Phase 1 Image Studio = 4-role baseline (owner/admin/member/viewer); Klaviyo-style 5-role + brand-admin role customization scoped to Phase 2 Email Studio. PENDING Curator commit per PASTE BLOCK G (MBS B-0.02 acceptance text update).
- **B-0.02 PAUSED 2026-05-18** post-Adversary v6 — 6-cycle variant 5g recurrence; tool-level enforcement empirically required (pre-commit citation verifier queued per ANTI_PATTERN_CATALOG §4 Category 5).
- **11 new standing rules ratified** at Item 1 commit — Rules 3.13-3.21 + 4.6 (lead with ONE recommendation; YES/NO without scroll; empirical executor test; never recommend session close; BEST setup for task class; Inventory never canonical authority; project_knowledge_search FIRST; §6 First Action inviolable; SESSION_STATE bundling; floor-enforced systemConfig).

**Curator session commits this session (9 governance commits + 1 stale file removal):**

| Phase | File | Commit SHA | Path |
|---|---|---|---|
| 2.2 FOUNDATION_LOCKS_v2 (initial 21 Locks) | FOUNDATION_LOCK.md | `d3795eb` | /docs/governance/FOUNDATION_LOCK.md |
| 2.3 ARCHITECT_OPERATING_RULES | ARCHITECT_OPERATING_RULES.md | `d67cebd` | /docs/governance/ARCHITECT_OPERATING_RULES.md |
| 2.4 NIR_OPERATING_RULES_v2 (13→9 rules) | NIR_OPERATING_RULES.md | `1cc34b6` | /docs/governance/NIR_OPERATING_RULES.md |
| 3.1 VIYO_CURRENT_MAP (initial; removes stale CURRENT_STATE.md) | VIYO_CURRENT_MAP.md | `4b56acc` | /docs/governance/VIYO_CURRENT_MAP.md |
| 2.1 late commit (referenced by other governance) | ANTI_PATTERN_CATALOG.md | `d08aec9` | /docs/governance/ANTI_PATTERN_CATALOG.md |
| 1 late commit (new audits/ subfolder created) | STATE_AUDIT.md | `bb67d37` | /docs/governance/audits/STATE_AUDIT.md |
| 3.2 Stack Constraints addendum (Locks 30-37 → 29 Locks total) | FOUNDATION_LOCK.md | `30972b0` | /docs/governance/FOUNDATION_LOCK.md |
| 3.2 CLAUDE.md v2 (removes #8 sanction + 15-file bloat + 9-tier hierarchy in-text) | CLAUDE.md | `92dc4b8` | /docs/governance/CLAUDE.md |
| 3.2 §7 Cataloger activation | VIYO_CURRENT_MAP.md | `9f31be5` | /docs/governance/VIYO_CURRENT_MAP.md |

**9 R-spec v2 PRs merged 2026-05-12 (pre-Curator-session foundational ratifications):**
- R20 v2 Database Schema (PR-equiv, ZCBR PASSED)
- R24 v2 Image Pipeline (PR #24, ZCBR PASSED)
- R29 v2 Platform Abstraction Layer (PR #25, ZCBR PASSED)
- T46 v2 Art Director Routing (PR #29, ZCBR PASSED; replaces v1 art-director-routing-suite.md)
- R31 v2 Product Data Extraction (PR #30, ZCBR PASSED; overwrote ENTERPRISE file in place)
- R17 v2 UX Architecture (PR #31, ZCBR PASSED)
- R19 v2 LLM Orchestration (PR #32, ZCBR PASSED)
- R21 v2 Infrastructure (PR #33, ZCBR PASSED)
- R22 v2 Security & Auth (PR #34, ZCBR PASSED; R22 v1 marked SUPERSEDED PR #35)

**Phase 1 sub-phase status (matches §2 table):**
- 1.1 Core Loop 🟡 IN PROGRESS — substantive substrate present per CODE_RECONCILIATION_2026-05-15.md; B-1.00 acceptance unverified
- 1.2 Pattern DB cache 🟡 PARTIALLY SHIPPED — substrate complete; end-to-end verification pending
- 1.3 Token billing ✅ Substrate shipped
- 1.4 R2 + Brand Vault ✅ Shipped
- 1.5 Editing Router ⏸ Contract layer only; implementation gated on OD-019 + T47 v2
- 1.6 / 1.7 / 1.8 / 1.11 — NOT STARTED
- 1.9 / 1.10 — DEFERRED V1.0.5

**Infrastructure verified (post-WP-1..WP-5 work):**

| Service | State |
|---|---|
| Cloudflare R2 | Two buckets live: `viyo-assets-production` + `viyo-assets-staging`, custom domain `assets.viyo.email` bound |
| Render | Two services: `viyo-worker` (main) + `viyo-worker-staging` (staging). Auto-deploy on |
| Upstash Redis | Two databases: `viyo` + `viyo-redis-staging`. Runtime isolation verified per WP-4 (PR #15) |
| Supabase | 3 projects (production / staging / ai-api-web-portal). RLS enabled all tables. pgvector v0.8.0. Migrations currently manual — automation pending WP-5 |
| Inngest | 3 environments (production / staging / branch) |
| Sentry | 5 projects active |
| Vercel | 4 projects (viyo-admin / viyo-web / viyo-main / ai-api-web-portal). Git connection verified per WP-3 |
| Cloudflare D1 / Hyperdrive / Pages | Confirmed absent (clarifies prior open question) |
| Cloudflare Workers | Only legacy `sg_worker` (not VIYO-owned). R28 deferred per INFRASTRUCTURE_DECISIONS ID-4 |

**GitHub flagged 24 dependabot vulnerabilities** on default branch (12 high, 11 moderate, 1 low) — pre-existing condition, outside Curator scope, surfaced at FOUNDATION_LOCK + ARCHITECT_OPERATING_RULES + NIR_OPERATING_RULES commits. Deferred to new Architect post-Phase 6 handoff.

---

## §10 — Pending Work Queue (Q6)

**Sequenced pending queue (post-2026-05-18 Item 1 refresh):**

1. **Item 1 Phase C** (NEXT, HIGH priority) — Notion canonical-state updates: Open Decisions DB + Standing Rules page + Decisions DB + Documentation Gaps DB. Architect drafts per-write directives; PO ratifies per-write; Cataloger executes via post-transition standing authority per A9 §10.
2. **PASTE BLOCK G** (HIGH priority) — Curator commit: D89 supersession action 1 (MBS B-0.02 acceptance text "5 roles" → "4 roles" per Path A, D85-pattern). Single-file surgical commit on `docs/governance/VIYO_Master_Build_Sequence.md`.
3. **PASTE BLOCK H** (HIGH priority) — R22 v2 v2.0 → v2.0.1 amendments: header version bump + §9.3 sites list addition for auth.ts bootstrap per Path B. Architect-tier R-spec edit per Rule 3.4.
4. **Pre-commit citation verifier** (Architect dispatch directive → Manus build) — automated grep-verify on every quoted block in directives. Phase 1B Curator-tool deliverable. Tool-level Family 4 + Category 5 enforcement for variant 5g.
5. **viyo-zcbr-architect skill v1.0.6 → v1.0.7** (Architect-authored) — mandatory Canonical Authority Audit + pre-flight checklist + quote-only-from-grep rule.
6. **B-0.02 v1.0 re-author** (clean slate, post-tools) — L1 Identity & Multi-Tenancy completion.
7. **B-0.03 through B-0.06** (parallel-safe with B-0.02 per MBS) — remaining Phase 0 substrate bullets.
8. **Substrate Map work for Lock 39 candidate** (DEFERRED) — comprehensive agentic-vs-architectural matrix; lands as Lock 39 or PRD V8.1 §3.5 extension.

**R-spec work (Architect priority, carried over):**
- **R24 v2.1 minor bump** — add §X.A A15 Brand Kit Mode, §X.B B1-B10 toolbelt, §X.B.3 B3 Layer Splitting stack lock, §X.C Brand LoRA pipeline (V1.0.5 deferred), §X.D G8 Character Consistency. Highest dependency-unblocking leverage per prior session analysis.
- **R23 v2 fresh authoring** — broken draft deleted; needs verified R29 v2 citations using `providerRegistry.execute` + `ai_provider_models` + `ProviderExecuteResult<T>.metadata.cost` (not the broken Registry.invoke / ai_provider_connections / costAttribution from memory of deleted draft).
- **R33 Shopify Integration audit** — new R-spec authority per Notion D48.
- **WP-1 + WP-2 verification directive** — gates T73 phase 2 wiring per OD-019.
- **R52 fresh DR runbook (B-XC.23)** — R52 is 334KB anomalously; rewrite fresh per ID-4 deferral pattern.
- **T47 v2 Studio Editing Tools (B-XC.24)** — predates ZCBR; needs MINOR FIX + ZCBR header alignment with C-01.

**Bullet work (Architect → Manus):**
- **4 Phase 1 skill specs** (B-XC.07 / 08 / 09 / 10): `image-generation-pipeline`, `pattern-cache-lookup`, `art-director-routing`, `rlhf-event-emission`. May already be uploaded to ai.viyo.new — verify Portal upload state.
- **B-XC.11 layer-splitting-pipeline skill** — for B-1.13 only.
- **B-XC.15 PORTAL_AUTHORITY.md** — Composer Queue concurrency model documented per OD-009 ratification 2026-05-15 (2 parallel lanes related-wired, sequential cross-touching).
- **B-XC.16** — reconcile any existing BULLET_1_DIRECTIVE.md draft against Master Build Sequence v1.1 (resolves OD-010 naming convention).

**Phase 1 sub-phase Bullets (per Master Build Sequence v1.1):**

| Sub-phase | Bullets |
|---|---|
| 1.5 Editing Router | T73 implementation per VVOW §13 + R24 v2.1 §X.B B1-B10 contracts |
| 1.6 Multi-variant | B-1.03 Visual Intent Router (Brain 5), B-1.04 Designer Brain (Brain 6) |
| 1.7 Editing tools | B-1.11 programmatic (B2/B4/B7/B8), B-1.12 AI-powered (B1/B5/B6/B9/B10), B-1.13 B3 Layer Splitting |
| 1.8 RLHF flywheel | B-1.06 Tinder Swipe Gate UI (gated OD-005), B-1.17 DSPy optimization |
| 1.11 Gap closure | B-1.10 A15 Brand Kit Mode (G2), B-1.X G8 Character Consistency (new Bullet to insert) |
| Admin shells | B-1.01 brand admin signup + onboarding, B-1.02 team invites + role assignment |
| Billing | B-1.14 Lovart-style tiered billing UI (Stripe) |
| Shopify | B-0.17 catalog sync (PKCE OAuth per D48) |
| 22 Modes | B-1.07 A1-A8, B-1.08 A9-A14, B-1.09 A16-A22 |
| Usability | B-1.15 search/tagging, B-1.16 version history |
| Acceptance | B-1.18 Phase 1 ceremony |

**Open Decisions blocking public launch (6 active):**

| OD | Decision | Blocks |
|---|---|---|
| OD-001 | Pricing reconciliation (deck slide 9 `$99/$299/$499/$1499` vs Notion D8 locked `$0/$49/$249/$499/$1499`) | Public launch, investor materials |
| OD-002 | Legal review on Milled / Email Love / Really Good Emails scraping | Pattern Seeding pipeline expansion (V1.0.5 1.9) |
| OD-003 | Atlas Cloud + fal.ai catalog verification (exact models / pricing / rate limits) | Phase 1 acceptance, T73 gates |
| OD-005 | 3 Swipe Gate reviewer accounts (`SWIPE_REVIEWER_USER_IDS`) | B-1.06 Tinder Swipe Gate UI |
| ~~OD-009~~ | ✅ CLOSED 2026-05-15: 2 parallel lanes related-wired, sequential cross-touching | Timeline: 12-16 weeks parallel confirmed per A2 (PRD §3.3 canonical) |
| OD-019 | WP-1 + WP-2 verification | T73 phase 2 wiring (sub-phase 1.5) |

Other active ODs (OD-006 Anthropic spend cap / OD-007 conversation export cadence / OD-011..OD-018 / OD-020 silent-write) tracked in Notion Open Decisions DB; not all block MVP launch. OD-004 fashion-brand selection framing OBSOLETE — current OD-004 per Notion = R29 PAL Rewrite Scope CLOSED 2026-05-15 via R29 v2 ZCBR-PASS Iα.

---

## §11 — Active Governance (Q1, Q3)

**Pointers (no duplication — each file is canonical at its repo path).** Read these for substrate; this file synthesizes pointers.

| File | Repo path | What it contains |
|---|---|---|
| FOUNDATION_LOCK.md | `/docs/governance/FOUNDATION_LOCK.md` (SHA `30972b0`) | 29 ratified Foundation Locks (1-14 product-architecture; 15-16 RESERVED; 17-21 process; 30-37 Stack Constraints vendor lock-in); single 12-tier authority hierarchy |
| ARCHITECT_OPERATING_RULES.md | `/docs/governance/ARCHITECT_OPERATING_RULES.md` (SHA `d67cebd`) | Architect role definition (§1 8 properties) + Decision Authority Matrix (§2) + Operating Discipline (§3 6 rules) + Communication Discipline (§4 5 rules) + Agent Topology Boundaries (§5) |
| NIR_OPERATING_RULES.md | `/docs/governance/NIR_OPERATING_RULES.md` (SHA `1cc34b6`) | 9 universal-scope rules for any Claude session in any project (consolidates v1.1 13 rules into 9 conflict-free) |
| ZCBR_STANDARD.md | `/docs/governance/ZCBR_STANDARD.md` | 14-item ZC+BR checklist + 3-checkpoint validation protocol (Lock 20 substrate) |
| CODING_CONVENTIONS.md | `/docs/governance/CODING_CONVENTIONS.md` | 15 testable code rules (Drizzle migrations, Result pattern, TypeScript strict, behavioral tests, Mastra+Inngest, Sharp/PIL not AI for text/color, plugin registry, RLS, ZCBR enforcement) |
| INFRASTRUCTURE_DECISIONS.md | `/docs/governance/INFRASTRUCTURE_DECISIONS.md` | ID-1 (staging canonical) / ID-2 (auto-deploy pre-Alpha) / ID-3 (R2 canonical storage) / ID-4 (R28 deferred) / ID-5 (Vercel git-connected) / ID-6 (Redis isolation) |
| ANTI_PATTERN_CATALOG.md | `/docs/governance/ANTI_PATTERN_CATALOG.md` (refreshed at Item 1 commit) | 15 Section F observations + 2 post-2026-05-18 observations (16-17) + 3 subpatterns + 1 sanction + 9 variants (5a-5h + 5k) organized into 7 failure families mapped to 5 foundational fix categories (Category 5 added: Tool-Level Pre-Commit Enforcement) |
| CLAUDE.md v2 | `/docs/governance/CLAUDE.md` (SHA `92dc4b8`) | Lightweight bootstrap entry point — §1 Identity / §2 Auto-Load Reading List (4 files) / §3 Role Context (5 roles incl. Cataloger formally active) / §4 Communication / §5 What NOT to do (3 top callouts) / §6 First Action protocol. Replaces prior 15-file reading list + 9-tier hierarchy in-text + Standing Instruction #8 sanction. Auto-loads at every Architect session start. |
| A9_CROSS_SURFACE_CONTINUITY_DISCIPLINE.md | `/docs/governance/A9_CROSS_SURFACE_CONTINUITY_DISCIPLINE.md` (SHA `67922fc`) | A9 v1.0 RATIFIED 2026-05-18 — Lock-tier governance discipline. Rules A-E, Rules 3.10/3.11(REJECTED)/3.12, anti-pattern variants 5a-5h, Lock 22 verbatim, hooks substrate operationalization, Cataloger role tool-access scoping + transitional period EXITED. Future revisions require isolated Adversary cold-read per §9 Addition 5. |
| NOTION_CATALOGING_RULES.md | `/docs/governance/NOTION_CATALOGING_RULES.md` (SHA `05717ff`) | Phase 2.6 deliverable RATIFIED 2026-05-19. Canonical Notion structure (6 DBs + Standing Rules page + Session Log child pages + PO Inbox); per-DB cataloging rules (ID formats, schemas, write rules); PO Inbox monitoring protocol per agent role; what does NOT post to canonical DBs. Authority tier below FOUNDATION_LOCK + FOUNDATION_AUTHORITY; above per-role behavior files. Operationalizes Lock 17 + Lock 21 for Notion canonical surface. |

**Lower-tier references** (consulted as needed):
- `/docs/governance/PRODUCT_ROADMAP.md` — Phase 1 11 sub-phases + Phase 2/3/4+ sequencing
- `/docs/governance/VIYO_Master_Build_Sequence.md` — 140 Bullets + 10 IMPORTANT JIT stubs + 7 LATER deferred (status partially STALE re: 9 shipped v2 R-specs)
- `/docs/governance/FOUNDATION_AUTHORITY.md` — 12 substrates L1-L12 + 7 conflict resolutions C-01..C-07 + Three Authority Waves historical (substrate FOUNDATIONAL; some sections STALE)
- `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` v2.0 — Phase 1 canonical implementation reference

---

## §12 — Anti-Pattern Reference (Q14)

**Primary reference:** [ANTI_PATTERN_CATALOG.md](docs/governance/ANTI_PATTERN_CATALOG.md) — 7 failure families with 15 observations + 3 subpatterns + 1 governance sanction, mapped to 4 foundational fix categories (External Validation / Schema Enforcement / Agent Topology Separation / Session-Start Inheritance).

**Top 3 callouts for new agent inheritance (highest evidence weight):**

1. **Silent writes to canonical state (Family 1, 6 of 15 observations).** Never write to Notion DBs (Decisions / Open PO Decisions / Foundation Locks / Documentation Gaps), repo `/docs/` canonical files, or memory_user_edits without explicit PO ratification surface. Architect drafts; PO ratifies; Cataloger commits. Pre-2026-05-13 CLAUDE.md Standing Instruction #8 sanctioned this behavior — Phase 3.2 CLAUDE.md v2 removes the sanction.

2. **Surfacing incomplete work for ratification (Family 2, 2 observations).** No placeholder strings ("(content unchanged)", "preserved verbatim", "TBD" without tracking ID). No half-authored sections. If gaps exist, finish authoring or defer to next session — do not surface incomplete. External enforcement: completeness pre-surface check skill (Path E work pending).

3. **PM-style permission-asking instead of recommendation-bringing (Family 4, 2 observations + Subpattern 2.2).** Default response shape is "I recommend X because Y — ratify?" NOT "Should I do X?" Investigation runs autonomously — read what's needed without asking. Sequencing is Architect's responsibility within ratified scope.

The full 4-category framework + every observation + every external enforcement mechanism is detailed in ANTI_PATTERN_CATALOG.md. Read at session start; reference when authoring or surfacing.

---

## §13 — Ratified vs Proposed Snapshot (Q13)

**Notion Decisions DB current count:** ≥84 entries (D84 latest observed 2026-05-12T21:43 via Notion search). FOUNDATION_AUTHORITY.md §9.2 stale claim "D1-D29" is wrong by ~55 entries. Precise count pending dedicated Notion sweep in Phase 5.1.

**Key ratified decisions:**
- D8 (pricing locked Free/$49/$249/$499/$1499)
- D11 (Notion Webhook Architecture canonical — supersedes T48)
- D41 (Phase 1 scope ratification 2026-05-12)
- D48 (Shopify R33 authority)
- D50 (Pattern Seeding V1.0.5 deferral per scope reset)
- D55 (R29 PAL rewrite as unified Plugin Registry)
- D57 (Layer 1 Platform Skills NOT in skills_registry table)
- D58 (ZCBR_STANDARD.md ratification → Lock 20)
- D67 (ATLAS Pluggable Corpus — Phase 3 deferred)
- D68 (R20 v2 supersedes April-era R20 v1)
- D69 (Behavior #12 one Manus directive per turn)
- D71-D78 + D80 (Ops Glue Spec v1 architecture)

**5 decisions archived 2026-05-12** as implementation-detail clutter from the Ops Architect 13-silent-writes incident (per ANTI_PATTERN_CATALOG Family 1 Observation 2). 8 remaining Ops Architect entries flagged for Phase 5.1 review.

**Foundation Locks:** 30 ratified (Locks 1-22 + Stack Constraints 30-37); Locks 15-16 RESERVED. Lock 22 newly ratified 2026-05-18 per MBS Commit 2 operationalization (Authority Hierarchy Time-Horizon Split per D85 + A9 §4). Lock 39 candidate placeholder added 2026-05-18 (Agentic-vs-Architectural Boundary, deferred to Substrate Map work).

**Open Decisions:** 13 active (OD-001 through OD-020 with some closed; OD-008 closed 2026-05-08; OD-009 / 011-018 / 020 status tracked in Notion Open PO Decisions DB). Repo OPEN_DECISIONS.md lists only OD-001..007 — stale by 13 ODs (per STATE_AUDIT §Conflict).

**Rejected/proposed-but-not-ratified:**
- **"Lock 22 — Manifest schema-drift forbidden"** (original 2026-05-12 silent-write proposal inside stillborn R29 v2 draft) — REJECTED for that scope; Lock 22 number RECLAIMED 2026-05-18 for **Authority Hierarchy Time-Horizon Split** per D85 + A9 §4 + MBS Commit 2 operationalization at `c269a11`. Schema-drift discipline (the original 2026-05-12 proposal scope) remains in Lock 5 (Pattern Recipe JSON Schema) enforced by ZCBR + CI grep — that scope was not Lock-tier; this Lock 22 number now holds the time-horizon authority split. **RATIFIED 2026-05-18.**
- **Lock 39 candidate placeholder (Agentic-vs-Architectural Boundary)** — added per A9 §4 + Adversary v6 #12 recommendation; deferred to Substrate Map work post-B-0.02 v1.0 dispatch. Open scope question: where does the agentic principle extend beyond Lock 19 (providers/models/services per R29 v2 §10) + PRD V8.1 §3.4 (pricing)? Substrate Map deliverable lands as Lock 39 or PRD V8.1 §3.5 extension.
- **Old NIR_OPERATING_RULES v1.1 13 rules** — superseded by NIR_OPERATING_RULES.md 9 rules at SHA `1cc34b6`.
- **Old VIYO_OPERATING_WORKFLOW.md §8.5 14 Architect Operating Behaviors** — reactive accumulation; NOT inherited as authority. Substance carried foundationally into ARCHITECT_OPERATING_RULES.md and NIR_OPERATING_RULES.md.

---

## §14 — Communication Discipline (Q11)

**PO context:** Nir is non-technical, mobile-first, prose-oriented. Pushes back hard; values brevity; works mobile via chat interface.

**Universal rules apply (NIR_OPERATING_RULES.md):**
- Rule 1 — Lead with paragraph summary
- Rule 2 — Make the call, don't menu
- Rule 3 — One ask per turn
- Rule 4 — Read before write/cite
- Rule 5 — Surface, don't smooth
- Rule 6 — Principle over prescription
- Rule 7 — Durable records (catalog + checkpoint)
- Rule 8 — Budget honesty
- Rule 9 — Hold steady accountability under correction

**Architect-specific shape applied (ARCHITECT_OPERATING_RULES.md §4):**
- §4.1 PO context (non-technical, mobile-first, prose-oriented — concrete application)
- §4.2 Lead with RULE A paragraph summary (Architect format)
- §4.3 One ask per turn (Architect bundling allowed for Curator-call decisions)
- §4.4 No menus when one option clearly right
- §4.5 No emoji unless PO uses first

**Both files load at session start.** Universal substrate (NIR) + Architect role-specific extension (ARCHITECT_OPERATING_RULES) reinforce each other per layering relationship (NIR_OPERATING_RULES §5).

---

## §15 — Maintenance Rule (Q15)

**VIYO_CURRENT_MAP.md is a living document.**

**Update protocol:**

| Section | Update authority | When |
|---|---|---|
| §1 VIYO Identity | PO ratification required | Major positioning / scope changes |
| §2 MVP Definition | PO ratification required | Scope adjustments (add/remove sub-phases or features) |
| §3 V1.0 Vision | PO ratification required | Phase reordering or major addition |
| §4 Tech Stack | PO ratification required | New tier, new model class, or vendor change |
| §5 Domains | PO ratification (low frequency) | New domain or domain decommission |
| §6 Platforms & IDs | Architect updates when underlying source changes (new Notion DB, new Airtable table, new repo) | At change |
| §7 Agent Topology | PO ratification required | Role addition / removal / boundary change |
| §8 Image Studio | Architect summarizes from VVOW; full update when VVOW v2.X commits | When VVOW changes |
| **§9 Current State Snapshot** | **Architect updates at end of every session as standing discipline** | **Every session** |
| **§10 Pending Work Queue** | **Architect updates at end of every session as standing discipline** | **Every session** |
| §11 Active Governance | Architect updates when underlying source changes (new governance file commits) | At change |
| §12 Anti-Pattern Reference | Architect updates only when ANTI_PATTERN_CATALOG updates | At catalog change |
| §13 Ratified vs Proposed | Architect updates when major decisions / locks / ODs change status | When status changes |
| §14 Communication Discipline | PO ratification required (rule changes route Architect → Curator → PO → Cataloger) | Rare |
| §15 Maintenance Rule | PO ratification required (this section's own update protocol) | Very rare |

**Drift detection:**
- **Signal 1:** §9 staging HEAD SHA lagging actual repo HEAD by more than 5 commits = closeout discipline broken; investigate.
- **Signal 2:** Notion Decisions DB count diverges from §13 stated count by more than 10 entries = stale; investigate.
- **Signal 3:** Phase 1 sub-phase status table contradicts current git log (e.g., 1.5 SHIPPED in repo but VIYO_CURRENT_MAP says PAUSED) = stale; investigate.

**Quarterly drift audit:** Dedicated Curator session every 3 months runs full audit against canonical files (similar to Phase 1 STATE_AUDIT.md scope) and surfaces drift items to PO.

---

## §16 — Closing

This file is THE inheritance file. Every future VIYO agent reads this first at session start. The file synthesizes 9 governance commits this Curator session + 9 shipped R-spec v2 + VVOW v2.0 + PRODUCT_ROADMAP + Notion DB current state + Airtable + Drive folder structure + Cataloger role formally active + Stack Constraints Locks 30-37 ratified into a single readable surface.

§9 + §10 + §13 update at end of every Architect session as standing discipline. §1-3 + §4 + §7 + §14 + §15 require PO ratification to change. Quarterly drift detection per §15. §16 (this section) is the closing pointer — earlier session-end Curator-call decisions sections live in git history, not as residual sections in the inheritance file.

**Phase 3.1 + Phase 3.2 complete.** Curator session 2026-05-13 closes after this refresh commit. Fresh Phase 4 PRD V8.1 Curator session opens in new Claude Code Desktop with clean context inheritance via CLAUDE.md v2 (SHA `92dc4b8`) and its 4-file reading list — VIYO_CURRENT_MAP (this file) + ARCHITECT_OPERATING_RULES + NIR_OPERATING_RULES + ANTI_PATTERN_CATALOG. The inheritance pattern is provable in practice — fresh Phase 4 session is the test.

---

*End of VIYO_CURRENT_MAP.md*
