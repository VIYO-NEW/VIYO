# FOUNDATION_LOCK.md

**Phase 2.2 deliverable per VIYO_PATH_TO_MVP.md §Step 2**
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop). **Amended:** 2026-05-13 Stack Constraints commit at Phase 3.2 revision; 2026-05-14 Lock 38 Universal Service Agnosticism addendum + clarification; 2026-05-14 Step C Author fix pass (16 VALID + 3 ratified ESCALATE resolutions per ARBITRATION_FOUNDATION_LOCK_v2.md); 2026-05-14 Lock 21 §-level revision (Path 1) — Statement bullet 4 extended with count-restatement clause + substrate-pointer clarifying sentence; "Does NOT apply to" Operational-reports line extended with audit-artifact point-in-time count carve-out. Per PO ratification of Phase 5.1 Decisions DB audit Arbitration Finding 1 ESCALATE. Canonical home for the count-restatement standing rule.
**Supersession history:** prior `/docs/governance/FOUNDATION_LOCK.md` (Locks 1–20 + RESERVED 15, 16) committed at SHA `30972b0`; superseded 2026-05-13 by this file's Locks 1–21 + Stack Constraints 30–37 at Phase 3.2 commit; Lock 38 addendum committed 2026-05-14 at SHA `ef47d2c` + clarification at `397fd50`.
**Authority tier:** Foundational substrate per §Authority hierarchy below (canonical statement, supersedes prior 7-tier vs 9-tier disagreement).
**Update authority:** Curator authors drafts; PO ratifies; Cataloger commits to canonical state (repo + Notion). Once committed, locks are non-negotiable; changes require PO directive that explicitly modifies the locked text.

---

## RULE A — Paragraph summary

FOUNDATION_LOCK.md establishes **30 ratified Foundation Locks** (1–14 + 17–21 product/process + 30–38 Stack Constraints + Universal Service Agnosticism = 28 ratified + 2 RESERVED = 30 numbered slots) as the single canonical authority for VIYO non-negotiable architectural commitments. **Locks 1–14** carry forward the repo VVOW-era product-architecture commitments (Product Sequencing / Unified GrapesJS Backbone / MJML JSON Recipe / Cache-First / Pattern Recipe schema / Brand Vault organization / 3-Tier Provider / Programmatic editing / RLHF + Tinder swipe / LoRA pipeline / Pattern Seeding / Brain Council scope / Tenant Isolation via RLS / Canonical Migrations). **Locks 15 and 16** remain RESERVED (placeholder for future ratification, preserving continuity with artifacts referencing Locks 17–21 explicitly). **Locks 17–21** carry forward repo Locks 17–20 plus Lock 21 (Governance Agnosticism, ratified 2026-05-12 in Notion, committed to repo at SHA `d3795eb`). **Locks 30–37 (Stack Constraints series, ratified 2026-05-13 — committed at Phase 3.2 revision)** cover vendor lock-in commitments not otherwise codified: Lock 30 Mastra DAG / Lock 31 Inngest / Lock 32 GrapesJS Studio SDK / Lock 33 Stripe / Lock 34 Supabase Postgres / Lock 35 Upstash Redis / Lock 36 Next.js / Lock 37 Zod. **Lock 38 (Universal Service Agnosticism, ratified 2026-05-14)** generalizes Lock 19's provider-agnosticism principle to every external service class; the substrate-vs-service-class boundary is decided by swap-cost (re-platform = locked substrate; registry config = agnostic service class). Conflict A resolution: the 12 tech-stack-vendor Locks 1–8 + 11–14 in the Notion Foundation Locks DB are absorbed via the mapping in §2 — 4 archive because they're already substantively covered (Sharp by CODING_CONVENTIONS Rule 6; Cloudflare R2 by INFRASTRUCTURE_DECISIONS ID-3; TypeScript strict by CODING_CONVENTIONS Rule 3; RLS by repo Lock 13 + CODING_CONVENTIONS Rule 9); 8 absorb to Stack Constraints Locks 30–37 above. Each lock entry uses the canonical format: Number / Title / Statement / Scope / Rationale / Evidence / Date Locked / Authority Source. The deliverable closes with Phase 5.2 handoff (Notion Foundation Locks DB sync to this file's numbering + content), Curator recommendations for the 5 ratified decisions (Stack Constraints adoption ✅ ratified 2026-05-13 / Locks 15-16 disposition ✅ RESERVED ratified 2026-05-13 / Authority Source for Locks 1-14 ✅ VVOW + PO Direct ratified 2026-05-13 / Notion archival policy ✅ Mark Superseded with pointers ratified 2026-05-13 / Lock 38 Universal Service Agnosticism ✅ ratified 2026-05-14), and pointer to ARCHITECT_OPERATING_RULES.md for how Locks 17, 18, 19, 21 are operationalized via external enforcement mechanisms per ANTI_PATTERN_CATALOG §3.

---

## Method

1. Read repo `/docs/governance/FOUNDATION_LOCK.md` for current Locks 1–20 (in full).
2. Searched Notion Foundation Locks DB (data source `7ed3c2e2-958d-40f0-bb32-70711b52c6bc`) for all Lock pages; confirmed 17 distinct pages: Locks 1–8 + 11–14 (tech-stack, dated 2026-05-10) + Locks 17–21 (process). Locks 9, 10, 15, 16 absent from Notion DB.
3. Fetched full body of Notion Lock 21 (Governance Agnosticism) and Lock 20 (ZCBR-Validated Specs Required) for verbatim canonical text.
4. Read STATE_AUDIT.md §Conflict A (Lock 1–14 content mismatch between repo and Notion).
5. Read VVOW_IMAGE_STUDIO_ARCHITECTURE.md §Appendix A Summary Table of Locks for product-architecture context.
6. Read CODING_CONVENTIONS.md and INFRASTRUCTURE_DECISIONS.md to identify which Notion tech-stack locks are already substantively captured elsewhere.
7. Read VIYO_PATH_TO_MVP.md §Step 2 specification (inline above) for absorption mapping requirement.
8. Authored Locks 1–21 + absorption mapping + Stack Constraints proposal + Phase 5.2 handoff.

---

## Authority hierarchy (single canonical statement, supersedes prior 7-tier vs 9-tier disagreement)

The following hierarchy resolves Conflict C (per STATE_AUDIT.md §12). Top wins.

1. **PO decisions** — recorded in Notion Decisions DB + accepted directives + chat ratifications.
2. **PRD V8.1** at `/docs/PRD_V8.1.md` (committed `d2bd8dc` 2026-05-14; §6 revision at `e720e6c`). Canonical product north star; supersedes prior V8 PRD (Drive ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` retained as historical archive).
3. **FOUNDATION_LOCK.md (this file)** — non-negotiable architectural commitments.
4. **FOUNDATION_AUTHORITY.md** — substrate definitions + conflict resolutions + 4-competitor moat absorption framework.
5. **ANTI_PATTERN_CATALOG.md** — failure-mode taxonomy + foundational fix categories with external enforcement mechanisms; substrate for governance enforcement.
6. **VVOW Architecture v2.0** — Phase 1 canonical implementation reference.
7. **VIYO_OPERATING_WORKFLOW.md** §1–5 (substrate sections) — agent topology, repo/product/storage roles, workflow paths.
8. **CODING_CONVENTIONS.md** — testable code rules; extends to incorporate absorbed Notion locks per §2 absorption mapping.
9. **ZCBR_STANDARD.md** — R-spec quality bar (Lock 20 substrate).
10. **R-spec ZCBR** — ZCBR-PASSED specs (Architect-authored only per Lock 20).
11. **Per-Bullet directives** — operational scope only.
12. **Existing code** — last priority; rewrite to match higher layers when conflicts arise.

Prior authority-hierarchy statements in FOUNDATION_AUTHORITY.md §1.3 (text still present in that file as superseded substrate — Phase 5 reconciliation target) and in prior CLAUDE.md (replaced in CLAUDE.md v2 with a pointer to this hierarchy) are both superseded by this single canonical statement. The canonical hierarchy is the enumeration above, not a count.

---

## Section 1 — The 30 Foundation Locks (1–21 + 30–38)

Each lock uses format: **Number / Title / Statement / Scope / Rationale / Evidence / Date Locked / Authority Source.**

Lock taxonomy:
- **Locks 1–14** = product-architecture commitments (VVOW-era ratified).
- **Locks 15–16** = RESERVED (placeholder for future ratification).
- **Locks 17–21** = process / governance commitments.
- **Locks 30–37** = Stack Constraints / vendor lock-in commitments (ratified 2026-05-13 at Phase 3.2 revision).
- **Lock 38** = Universal Service Agnosticism / process-governance commitment generalizing Lock 19 (ratified 2026-05-14).

Total: 28 ratified Locks + 2 RESERVED slots = 30 numbered Locks.

---

### Lock 1 — Product Sequencing

**Statement:** VIYO ships products in order: Phase 1 Image Studio (VVOW) → Phase 2 Email Studio → Phase 3+ LENZ Intelligence Studio. No phase skipping. Image Studio ships before Email Studio. Email Studio ships before LENZ.

**Scope:** Strategic product roadmap. All directive authoring, R-spec sequencing, build prioritization respect this order.

**Rationale:** Each phase absorbs one competitor moat (Lovart / Migma+Grid&Pixel / Instant). Skipping breaks the moat coverage. Email Studio without ingested corpus (Phase 1B prereq) produces generic emails, defeating Migma's "Remix from competitor" surface; hyper-personalization without Email Engine has no delivery substrate.

**Evidence:** VVOW Image Studio Architecture v2.0 §2 + §16; PRODUCT_ROADMAP.md (4-phase plan); FOUNDATION_AUTHORITY.md §2 + §3 (4-competitor moat absorption); Notion D41 (Phase 1 scope ratification 2026-05-12).

**Date Locked:** 2026-05-08 (consolidated from VVOW v2.0 ratification).

**Authority Source:** VVOW + PO Direct.

---

### Lock 2 — Unified GrapesJS Backbone

**Statement:** GrapesJS is the unified canvas engine for both Image Studio (Studio SDK tuning) and Email Studio (MJML Plugin tuning). Custom canvas implementations are forbidden. Both surfaces share the same engine with different tunings.

| Surface | Backbone | Tuning | Output |
|---|---|---|---|
| Image Studio | GrapesJS | Studio SDK (Canvas API) | High-res PNG/JPG/GIF |
| Email Studio | GrapesJS | MJML Plugin (`mjml-core`) | Responsive MJML / HTML |

**Scope:** All visual editing surfaces in Phase 1 (Image Studio) and Phase 2 (Email Studio). Live-sync edit modal opens Image Studio from inside Email Studio.

**Rationale:** Shared backbone enables asset-by-UUID reference (no upload), live-sync edit flow, single training surface for canvas behavior. Custom canvas would fragment the product and prevent the Phase 1 → Phase 2 integration moat.

**Evidence:** VVOW Architecture §2.3 + §8.1; FOUNDATION_AUTHORITY substrate L2.

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 3 — Email Studio Output is JSON MJML Recipe (Not Raw HTML)

**Statement:** Email Studio's AI never writes raw HTML. AI fills slots in 12 MJML Section Templates (Hero / Split / Grid / Editorial / etc.) with text and Brand Vault asset UUIDs. `mjml-core` deterministically compiles the JSON Recipe to email-safe HTML.

**Scope:** Phase 2 Email Studio composition. All Brain Council outputs targeting Email Engine.

**Rationale:** Guarantees 100% responsive deliverability across email clients. Prevents AI hallucination affecting deliverability. Section Library architecture is the main moat per VVOW §2.3.

**Evidence:** VVOW Architecture §2.3 (Email Studio Integration section); FOUNDATION_AUTHORITY substrate L4 (Brain Council).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 4 — Single Image Generation Trace (T70 Cache-First)

**Statement:** Every generation follows this trace: (1) Pattern DB cache check; (2) on miss, route through Art Director Router (Tier 1 → Tier 2 escalation if complexity exceeds Tier 1); (3) emit RLHF signal to `pattern_performance_metrics`; (4) save to Brand Vault with full lineage + JSONB metadata + pgvector embedding. Untracked generations are forbidden. Generations outside Brand Vault are forbidden. Skipping the cache check is forbidden.

**Scope:** All image generation pipelines in Phase 1 + Phase 2 (when Email Engine triggers generation via live-sync edit).

**Rationale:** Pattern DB cache is the primary cost control + the primary RLHF data flywheel feed. Every untracked generation breaks both. T70 shipped this lock.

**Evidence:** VVOW Architecture §10.1 + §10.2 + §12; T70 PR (shipped); CODING_CONVENTIONS Rule 10 (every generation emits RLHF signal).

**Date Locked:** 2026-05-08 (VVOW v2.0; reflects T70 shipped).

**Authority Source:** VVOW + PO Direct.

---

### Lock 5 — Pattern DB + Pattern Recipe JSON Schema

**Statement:** Every entry in `image_prompt_patterns` uses the locked Pattern Recipe JSON shape — `style_system` (string), `shared_principles` (format/aspect_ratio/model_pose/product_focus/typography_placement/color_harmony/mood), `variants[]` (background/props/lighting/color_grade/era_reference), `doodles` (style/elements/feel), `negative_prompts[]`, `replication_prompt_template` (prompt + negative_prompt with `[PRODUCT_DESCRIPTION]`, `[HERO_TEXT]`, `[SECONDARY_TEXT]` placeholders). Other pattern shapes are forbidden. Schema drift breaks the Visual Intent Router's pattern injection logic.

**Scope:** All writes to `image_prompt_patterns` table. Reverse-engineering pipeline output. Pattern Seeding pipeline output.

**Rationale:** Schema drift was identified as a near-miss anti-pattern (Observation 5 — proposed "Lock 22 Manifest schema-drift forbidden" silently inside a stillborn R29 v2 draft). The Pattern Recipe is the canonical Pattern DB shape; any drift breaks Brain 5 (Visual Intent Router) pattern injection at runtime.

**Evidence:** VVOW Architecture §10.3 (locked schema); CODING_CONVENTIONS Rule 11 (locked JSON Recipe shape).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 6 — Brand Vault Organization (Database-Driven)

**Statement:** Cloudflare R2 holds asset bytes; the `assets` table provides organization layers — `parent_asset_id` chain (Original → Edit 1 → Edit 2) for lineage; `asset_type` enum (extensible, grows with image-type taxonomy); JSONB column for metadata (generation_prompt, model_used, tags, pattern_id, qa_bouncer_score, parent_recipe, scrape_source_url, created_by); pgvector embeddings for natural-language search; auto AI tags on ingestion + manual `#`tagging in Brand Chat. Folder-based organization in R2 is forbidden.

**Scope:** All Brand Vault writes. All asset queries. All Phase 1 + Phase 2 surfaces that reference assets.

**Rationale:** Database-driven organization scales with unbounded image taxonomy (Lock 11 + VVOW §4.2); folder-based organization couples R2 paths to type enum forever. Lineage chain enables non-destructive edit chains required for Lovart-parity capabilities. T72 shipped the substrate.

**Evidence:** VVOW Architecture §11 (Brand Vault Organization); T72 PR (shipped); CODING_CONVENTIONS Rule 8.

**Date Locked:** 2026-05-08 (VVOW v2.0; reflects T72 shipped).

**Authority Source:** VVOW + PO Direct.

---

### Lock 7 — 3-Tier Provider Strategy

**Statement:** Image AI providers organize in three tiers. **Tier 1** (Aggregators, launch primary): Atlas Cloud + fal.ai peers route NanoBanana 2 Pro + Flux 1.1 Pro + Seedream — "Best for the Job" routing. **Tier 2** (Frontier Direct): OpenAI / Google / Ideogram direct APIs route GPT Image 2 / Imagen 4 / Ideogram V3 for high-complexity Tier 1 cannot handle. **Tier 3** (Self-Hosted): RunPod / Thunder Compute re-hosts Tier 1/2 models for CapEx optimization. Tier 1 → Tier 2 escalation is complexity-based, not failure-based. Tier 3 doesn't change WHICH model runs — only WHERE it runs. Tier 3 activates at 6,700 images/month → L40S ($202/mo) and at 18,700 images/month → A100 80GB ($562/mo), admin-gated approval, not auto-activated.

**Named-launch-default framing (per F16 ESCALATE ratification 2026-05-14):** the aggregators (Atlas Cloud, fal.ai) and the specific models named above (NanoBanana 2 Pro, Flux 1.1 Pro, Seedream, GPT Image 2, Imagen 4, Ideogram V3) are **illustrative launch defaults**, not hardcoded mandates. They are **registry-resolved per Lock 38** (and Lock 19 for the AI-provider-specific instance) — business logic never hardcodes them. The governance text names them AS the ratified launch-default tier members; the registry holds the runtime resolution. A future tier reconfiguration (different aggregator / different model selection) is a registry config change, not a Lock 7 amendment, provided the 3-tier architecture itself is preserved.

**Scope:** All generation routing in Phase 1+ via R29 PAL Plugin Registry.

**Rationale:** Aggregators (Atlas Cloud + fal.ai) handle majority of traffic at competitive price. Direct API serves complexity exceeding Tier 1 capacity. Self-hosted GPU drops marginal cost at scale. Tier numbering inverted vs. April-era T46 v6.1; VVOW v2.0 supersedes (per Conflict Resolution C-05).

**Evidence:** VVOW Architecture §8.7 + §8.8 + §15 (advantage 6); FOUNDATION_AUTHORITY §6 C-05; CODING_CONVENTIONS Rule 14.

**Date Locked:** 2026-05-08 (VVOW v2.0; Tier numbering corrected from April T46 v6.1).

**Authority Source:** VVOW + PO Direct.

---

### Lock 8 — Editing is Programmatic (Sharp/PIL), NOT AI for Text/Color

**Statement:** Programmatic compositing — text overlay (B2 Text Edit) via GrapesJS native blocks + Sharp/PIL composite; color/transparency change (B4) via Sharp/PIL; brightness/contrast/saturation/crop/resize/flip/rotate (B8 Quick Edit) via Sharp/PIL — uses Sharp (Node) or PIL (Python). Zero AI tokens. AI is reserved for B1 (Touch Edit inpainting via Flux 1.1 Pro), B3 (Layer Splitting via SAM 2), B5 (Object Removal via SAM 2), B6 (Outpainting), B7 (Upscale via Real-ESRGAN). Calling AI for text editing in flattened images, color changes, brightness adjustments, or crops is forbidden.

**Scope:** All B1–B10 toolbelt operations. All Quick Edit bar natural-language commands routing through Visual Intent Router (Brain 5) execution.

**Rationale:** Programmatic ops are <100ms with zero AI cost; AI inpainting is the right tool only when context-aware regeneration is genuinely needed. Mixing the two without discipline burns tokens unnecessarily and degrades response time. CODING_CONVENTIONS Rule 6 + Rule 14 enforce this in code.

**Evidence:** VVOW Architecture §3 (Zone 3 Toolbelt) + §8.5; CODING_CONVENTIONS Rule 6; Conflict Resolution C-03 (Token Economics: Programmatic Ops Are Free).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 9 — Implicit RLHF + Tinder Swipe Gate

**Statement:** Every user action emits an RLHF signal: drag to canvas = `+1 qaScore`; export image = `+5 qaScore`; regenerate (ignore variant) = `−1 qaScore`. QA Bouncer (GPT-4o-mini as named launch default) auto-approves/rejects every generation. Humans verify via Tinder-style side-by-side swipe vs. original: 50% of auto-approved sampled, 20% of auto-rejected sampled. Override events feed DSPy optimization loop. After 5,000 swipe decisions, Fine-Tuned VLM Preference Classifier replaces humans for the sample. Skipping the swipe gate sample for QA Bouncer outputs is forbidden.

**Named-launch-default framing (per F16 ESCALATE ratification 2026-05-14):** GPT-4o-mini is the **illustrative launch default** for the QA Bouncer capability. The Bouncer is **registry-resolved per Lock 38** (and Lock 19 for AI-provider specifics) — business logic never hardcodes the model name. The lock's substance is the RLHF flywheel + auto-approval/rejection + Tinder swipe gate architecture; the specific Bouncer model is a registry tier default that the operator can swap without amending Lock 9.

**Scope:** All Phase 1 generation events + all human review workflows. RLHF event emission integrated into every Inngest function in the generation pipeline (CODING_CONVENTIONS Rule 10).

**Rationale:** Implicit RLHF is the primary data flywheel — every user interaction validates or invalidates a pattern. Tinder swipe gate adds explicit human quality verification at sample rate, replacing weekly Curator review with continuous review at low latency. Phase 4 acceptance threshold: 1,000 accumulated RLHF events.

**Evidence:** VVOW Architecture §12 + §12.3; CODING_CONVENTIONS Rule 10; OD-005 (3 reviewer accounts pending — gates B-1.06 Tinder Swipe Gate UI).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 10 — Brand-Specific LoRA Pipeline

**Statement:** After N validated patterns per brand (threshold defined in R24 v2 + R24 v2.1 pending), train a brand-specific LoRA on the brand's RLHF-validated outputs. Deploy via Plugin Registry tagged with `brand_id`. Auto-apply on future generations for that brand. Cross-tenant LoRA training is forbidden (privacy violation). LoRAs deployed outside Plugin Registry are forbidden (bypasses observability and rollback). Auto-applying a LoRA without recording the application in generation metadata is forbidden (breaks reproducibility).

**Scope:** Phase 1.10 (V1.0.5 deferred per Notion D50). All R29 PAL Plugin Registry LoRA deployments. All brand-scoped generation routing.

**Rationale:** LoRAs make every generation more on-brand at the model level, beyond what prompt engineering achieves. Pattern DB cache is fast but pattern-bounded; LoRAs make even novel briefs more on-brand. Lovart cannot do this — no per-tenant fine-tuning. VIYO brand outputs become progressively more distinctive over time; Lovart stays generic.

**Evidence:** VVOW Architecture §12.4 + §15 (advantage 6); R24 v2 §X.C; FOUNDATION_AUTHORITY §6 C-02.

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 11 — Pattern Seeding via Web Scraping

**Statement:** Initial seed of `image_prompt_patterns` comes from scraping hero images of competitor email archive sites — Milled (milled.com) is the canonical source for Phase 1; expansion to Email Love / Really Good Emails is gated by OD-002 legal review. Pipeline: Puppeteer + Cheerio scrape → R2 storage (with attribution metadata) → Claude Vision reverse-engineering → Pattern Recipe (per Lock 5 schema) → `image_prompt_patterns` insert with `qaScore = 0`, `source_type = "scraped_seed"`. This is a separate pipeline from R46 IMAP-based email ingestion (which serves HYVE / ATLAS textual analysis, not Pattern DB seeding).

**Scope:** Phase 1.9 (V1.0.5 deferred per legal OD-002). Inngest scheduled scrape jobs. Pattern DB initial seed.

**Rationale:** Pattern DB starts non-empty for every new brand — moat-behind-moat over Lovart which starts every user from blank slate. Per VVOW §10.4 — internal architectural reference and benchmarking, no IP reuse, OD-008 closed 2026-05-08.

**Evidence:** VVOW Architecture §10.4 + §15 (advantage 8); OD-002 (legal review open); OD-004 (12 fashion brand competitor selection).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 12 — Brain Council Scope

**Statement:** The 7-Brain Council runs inside Mastra DAG for each campaign generation. Brain 5 (Visual Intent Router) translates briefs to technical prompts + model routing. Brain 6 (Designer Brain) composes visual layouts + manages style consistency. VVOW (Phase 1 Image Studio) invokes Brain 5 + Brain 6 primarily — other brains (CMO, Audience, Offer, Copywriter, Critic) are called by the Phase 2 email generation pipeline only. The 13-Agent Roster = 7-Brain Council + 6 platform agents (VeriClaw / Flow Strategy / SMS Copywriter / ATLAS Top Brain / Smart Insight Engine / Contextual AI Advisor). VVOW directives scope to Brain 5 + Brain 6 unless cross-brain coordination is explicitly required.

**Scope:** All Phase 1 generation directives. All Phase 2 email composition workflows. R19 v2 LLM Orchestration substrate.

**Rationale:** Scoping prevents Phase 1 from prematurely invoking Phase 2 brains (CMO, Critic, etc.) — Phase 1 ships Image Studio standalone; full Brain Council activates in Phase 2 Email Engine.

**Evidence:** VVOW Architecture §5; R19 v2; FOUNDATION_AUTHORITY substrate L4 (Job Orchestration / Brain Council).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 13 — Tenant Isolation via Supabase RLS

**Statement:** Every query touching `image_prompt_patterns`, `assets`, `pattern_performance_metrics`, or any other tenant-scoped table enforces Supabase Row Level Security (RLS) on `brand_id`. Bypassing RLS via service role key for any user-initiated operation is forbidden. Service role key is reserved for admin operations only, behind a `requireAdmin()` middleware (CODING_CONVENTIONS Rule 9).

**Scope:** All database queries from application code. All API routes serving tenant-scoped data. All Inngest functions executing tenant work.

**Rationale:** RLS is the structural enforcement of tenant isolation. Application-level filtering as the only isolation mechanism creates a single-bug-leak risk; RLS enforces at the database row level. Verified live across 83 brand-scoped tables per WP-1 evidence.

**Evidence:** VVOW Architecture §11.1 + §18.2; CODING_CONVENTIONS Rule 9; FOUNDATION_AUTHORITY substrate L1 (Identity & Multi-Tenancy); R22 v2 (Security & Auth, ZCBR PASSED 2026-05-12).

**Date Locked:** 2026-05-08 (VVOW v2.0).

**Authority Source:** VVOW + PO Direct.

---

### Lock 14 — Schema Changes via Canonical Migrations Only

**Statement:** All database schema changes go through canonical Drizzle migrations. Never patch the database via runtime code, "additive runtime schema alignment," or any non-migration mechanism. When DB drift is detected: always rebuild from canonical migrations, never patch in code/schema/tests.

**Scope:** All schema modifications to Supabase Postgres. All migration authoring. All runtime database interactions.

**Rationale:** Per §1A-FU-04 incident lesson — a previous build attempt made unauthorized schema modifications described as "additive runtime schema alignment," violating the boundary. Recovery required rebuilding from canonical migrations. The lock prevents recurrence.

**Evidence:** VVOW Architecture §18.2 Required item; CODING_CONVENTIONS Rule 1; §1A-FU-04 incident record.

**Date Locked:** 2026-05-08 (VVOW v2.0; reflects §1A-FU-04 lesson).

**Authority Source:** VVOW + PO Direct.

---

### Lock 15 — RESERVED

**Statement:** Reserved for future ratification. Number held to preserve continuity with artifacts that reference Locks 17–21 explicitly. Do not assign content here without explicit PO ratification.

**Scope:** N/A until assigned.

**Rationale:** When Locks 17–20 were ratified 2026-05-09 / 2026-05-11, the existing 14 product-architecture locks were already numbered 1–14. Locks 15 and 16 were reserved as placeholders to preserve the gap-free numbering of the process-lock series (17 onward).

**Evidence:** Repo `/docs/governance/FOUNDATION_LOCK.md` current Locks 15 and 16 (carry forward as-is).

**Date Locked:** N/A.

**Authority Source:** N/A.

---

### Lock 16 — RESERVED

**Statement:** Reserved for future ratification. Number held to preserve continuity with artifacts that reference Locks 17–21 explicitly. Do not assign content here without explicit PO ratification.

**Scope:** N/A until assigned.

**Rationale:** Same as Lock 15.

**Evidence:** Repo `/docs/governance/FOUNDATION_LOCK.md` current Locks 15 and 16.

**Date Locked:** N/A.

**Authority Source:** N/A.

---

### Lock 17 — Foundation-First Decision Making

**Statement:** No patch work. Architectural conflicts reconciled at source, not papered over. When a downstream surface (a Bullet directive, an R-spec, a feature) reveals a contradiction with an upstream authority (FOUNDATION_AUTHORITY, V8 PRD, an architecture file), the fix happens at the upstream authority — never as a local override or workaround in the downstream surface. Bullet directives that include "TODO: reconcile with V8 PRD" or similar deferral language without an explicit upstream-fix directive scheduled are forbidden.

**Scope:** All directive authoring. All R-spec authoring. All governance authoring. All Cataloger commits.

**Rationale:** Patch work creates governance drift that compounds. Two documents disagreeing creates ambiguity that future agents resolve inconsistently. Fixing at source means every downstream consumer reads the same updated truth.

**Evidence:** FOUNDATION_AUTHORITY §4.4; Notion Lock 17 entry (2026-05-10).

**Date Locked:** 2026-05-09 (ratified per FOUNDATION_LOCK.md repo file).

**Authority Source:** PO Direct.

---

### Lock 18 — Tool-Capability-First Scoping

**Statement:** Audit existing tool capabilities before specifying any feature. Example: GrapesJS Studio SDK already provides Canva-tier capabilities for free; do not build custom what tooling already provides. Every feature directive must include a "tool capability check" section before authoring implementation scope. If the underlying tool (GrapesJS / Mastra / Inngest / Supabase / Cloudflare R2 / Sharp / SAM 2 / Tesseract / Atlas Cloud / fal.ai) already provides the capability, the directive defers to the tool default and only specifies the wiring. Custom implementations of capabilities the toolchain already provides without an explicit "why not the tool default" rationale are forbidden.

**Scope:** All R-spec authoring. All Bullet directive authoring. All feature scoping in PRD V8.1.

**Rationale:** Building custom what tooling provides wastes Composer Queue cycles + creates ongoing maintenance burden. The B-tool audit (Section 9 of session handoff) executed this rule and dropped 4 capabilities that GrapesJS Studio SDK already provided.

**Evidence:** FOUNDATION_AUTHORITY §4.5; Notion Lock 18 entry (2026-05-10).

**Date Locked:** 2026-05-09 (ratified per FOUNDATION_LOCK.md repo file).

**Authority Source:** PO Direct.

---

### Lock 19 — Provider Agnosticism

**Statement:** No application code names a specific AI model, OCR provider, ESP, e-commerce platform, payment processor, embedding service, or other third-party service in business logic. All selections live in the Provider Routing plugin registry (R29 PAL v2, ZCBR PASSED 2026-05-12). The application calls `provider.execute(task)` and the registry resolves the actual provider for that task at runtime. Applies to all model classes: image generation, image segmentation, image upscaling, OCR, text generation, embedding, vision, video, audio, ESP delivery, e-commerce sync, payment processing. `if (model === 'NanoBanana')` or any hardcoded provider name in business logic is forbidden. The single exception is the Plugin Registry itself, which is the registry of names.

**Relationship to Lock 38 (per F8 ESCALATE ratification 2026-05-14):** Lock 19 is the **AI-provider-specific instance** of Lock 38's universal service-agnosticism principle. Lock 19 is **NOT superseded** by Lock 38 — it is retained as the AI-provider-specific application, kept in force per the generalize-and-keep pattern. Lock 38 carries the universal rule across all external service classes; Lock 19 is its AI-provider elaboration. Future Lock-19-relevant rules co-evolve with Lock 38 — additions specific to AI providers author against Lock 19; additions applying to all external service classes author against Lock 38.

**Scope:** All application code. All Mastra DAG step implementations. All Inngest function implementations. All API routes invoking external services.

**Rationale:** Provider lock-in is a strategic risk. Hardcoded model names make migration to new models / providers a code-change exercise; registry-based selection makes it a config change.

**Evidence:** FOUNDATION_AUTHORITY §4.6; R29 v2 (PAL Platform Abstraction Layer, ZCBR PASSED 2026-05-12, PR #25); CODING_CONVENTIONS Rule 7; Notion Lock 19 entry (2026-05-10).

**Date Locked:** 2026-05-09 (ratified per FOUNDATION_LOCK.md repo file).

**Authority Source:** PO Direct.

---

### Lock 20 — ZCBR-Validated Specs Required

**Statement:** No Bullet ships against an unvalidated R-spec. Every R-spec referenced by any Bullet directive must carry a `ZCBR Status: PASSED` header from Architect Claude self-validation. Reviewer Claude rejects Bullet directives that cite non-passing R-specs at §9 Gate intake. Kimi pre-flight validation refuses to start code on Bullets whose cited R-specs do not pass the `zcbr-spec-validation` skill check. Manus-authored R-specs are reference inputs only; the canonical authoritative version of any R-spec is the Architect Claude version.

**Scope:** All R-spec authoring. All Bullet directive authoring. All Composer Queue intake. All §9 Gate validations. All Kimi pre-flight checks.

**Rationale:** ZCBR is the quality bar that catches the May 2026 Manus-quality output that triggered the foundational rewrite. Per ZCBR_STANDARD §0 — first-pass acceptance at §9 Gate default; ~10–20 min validation per spec prevents 60–120 min wasted Composer Queue cycles + 30–60 min Reviewer Claude + PO review time on rejected output.

**Evidence:** ZCBR_STANDARD.md (formal standard, §10); `zcbr-spec-validation` skill (Drive folder `1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki`, operationalized in Portal at ai.viyo.new); D58 ratification; CODING_CONVENTIONS Rule 15; Notion Lock 20 entry; FOUNDATION_LOCK.md PR #16 merge 2026-05-11T18:10:13Z.

**Date Locked:** 2026-05-11 (ratified via D58).

**Authority Source:** PO Direct.

---

### Lock 21 — Governance Agnosticism

**Statement (verbatim from Notion Lock 21 page, committed to repo by this deliverable):**

Governance instructions — including PO directives to Architect, Architect-authored governance text, behavioral rules, communication rules, session protocols, and any other text intended to guide agents' work — describe what the system or agent must be **capable of**, not how the capability must be **implemented**. Specifically:

- Governance text states the capability needed
- Governance text states the principle the capability serves
- Governance text states the success condition that confirms the capability exists
- Governance text does **NOT** name specific files, specific paths, specific step numbers, specific tag names, specific schema field names, specific tool names, or specific implementation patterns, **including restated counts or ranges of items in a live source-of-truth surface** (e.g., 'D1-D29 decisions', '21 ratified Locks', '15 sections', '6 platforms') — point to the enumeration or live source. A substrate-pointer cell names identity (name, URL, ID, purpose, schema); it does not state the count of the substrate's contents — the count is the live source's, not the pointer's.

Implementation choices belong to the agent doing the work, subject to ratification.

**Scope:**
- PO directives authored to Architect Claude (or any agent)
- Architect-authored governance documents (CLAUDE.md, FOUNDATION_LOCK.md, CODING_CONVENTIONS.md, FOUNDATION_AUTHORITY.md, ZCBR_STANDARD.md, VIYO_OPERATING_WORKFLOW.md, and any future governance file)
- Behavior rules
- Session protocols (Session Opener, session-end cataloging, any future protocol)
- Cross-cutting standing rules
- Any text that instructs how an agent should work

**Does NOT apply to:**
- Implementation specs (R-spec ZCBR documents — these ARE implementation, must be specific)
- Per-Bullet directives (implementation work for Kimi — must be specific)
- Code (always specific by nature)
- Operational reports / state observations (PR numbers, commit SHAs, file IDs, point-in-time counts observed in audit artifacts — these are observations of state, not governance)

**Test for compliance:** Read any governance text. Ask: "Does this name a specific file, path, step number, tag, schema field, or implementation pattern?" If yes, the text fails Lock 21. Rewrite to state the capability and let the implementing agent choose the specifics.

**Edge case:** When the implementing agent has no judgment to apply because there is genuinely one correct implementation (e.g., "PRs must be merged to staging branch" — a project-wide constraint, not an implementation choice), governance MAY name the specific. The test: would a competent agent in this role plausibly choose differently? If no, naming the specific is acceptable. If yes, name the capability only.

**Rationale:** Applies the same principle as Lock 19 (Provider Agnosticism) to a different domain. Lock 19 prevents application code from naming specific AI models. Lock 21 prevents governance instructions from naming specific implementations. Same anti-pattern, different surface. When governance text specifies implementation: the implementing agent cannot apply judgment to find the best fit; implementation choices get locked before context exists to make them well; governance drift becomes inevitable when the specified implementation turns out wrong. When governance text describes capability only: implementation can evolve without rewriting governance; multiple valid implementations can coexist; agents apply judgment proportional to their role.

**Compliance enforcement:**
- PO-side: When drafting instructions to Architect, PO applies Lock 21 test before sending.
- Architect-side: When authoring governance text, Architect applies Lock 21 test as part of self-validation (analogous to ZCBR self-validation per Lock 20). Governance text that fails Lock 21 is not committed until rewritten.
- Cross-validation: When Architect receives a PO instruction that names specifics where capability statement would suffice, Architect surfaces the Lock 21 violation back to PO before executing.

**Evidence:** Notion Lock 21 page (`35e9a84a-4679-8179-b9e1-e33287431d72`); Drive source file `1aBzg_MDBMfdyaFSG0xkzFeT3yqT9ZqbU` (LOCK_21_GOVERNANCE_AGNOSTICISM.md); VIYO_OPERATING_WORKFLOW.md v1.2 §6 + §8.5 + Section 9 final row.

**Date Locked:** 2026-05-11 (per Notion Date Locked property; ratified 2026-05-12).

**Authority Source:** PO Direct.

---

### Lock 30 — Workflow Engine: Mastra DAG only

**Statement:** `@mastra/core` is the only permitted DAG orchestration framework for AI workflow composition inside Inngest steps. No LangChain, no custom orchestrator, no Temporal, no Prefect.

**Scope:** All Brain Council DAG executions. All multi-step AI orchestration. All workflow composition for image generation pipelines (Phase 1) and email composition pipelines (Phase 2).

**Rationale:** TypeScript-native (matches monorepo language). Open-source (zero vendor lock-in concern vs LangChain Cloud / Flowise). DAG composition fits the Brain Council pattern per VVOW §8.3. Substitution would fragment runtime knowledge of how Brain Council execution composes.

**Evidence:** VVOW Architecture §8.3; CODING_CONVENTIONS Rule 5; FOUNDATION_AUTHORITY L4 substrate; Notion Lock 1 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10 (per Notion); ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 31 — Event Bus + Job Queue: Inngest only

**Statement:** Inngest is the only permitted event bus and job queue. No BullMQ, no SQS, no RabbitMQ, no custom queue.

**Scope:** All event-driven job orchestration. All retries. All step-level checkpointing. All scheduled jobs (Pattern Seeding daily scrape per Lock 11, scheduled re-training, RLHF event aggregation per Lock 9).

**Rationale:** Step-level checkpointing survives crashes per VVOW §8.2. Fan-out fan-in patterns native — matches Brain Council parallel generation. Three environments verified live (production / staging / branch). Outer orchestrator per CODING_CONVENTIONS Rule 5 (Mastra DAGs run inside Inngest steps).

**Evidence:** VVOW Architecture §8.2; CODING_CONVENTIONS Rule 5; FOUNDATION_AUTHORITY L4; Notion Lock 2 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 32 — Canvas Engine: GrapesJS Studio SDK only

**Statement:** GrapesJS Studio SDK is the canvas engine for Image Studio (Studio SDK tuning) and Email Studio (MJML Plugin tuning per Lock 3). No custom editor, no Unlayer, no Stripo, no MJML-only approach.

**Scope:** All visual editing surfaces. Phase 1 Image Studio at app.viyo.com. Phase 2 Email Studio. Live-sync edit modal opening Image Studio from inside Email Studio per VVOW §2.3.

**Rationale:** Repo Lock 2 (Unified GrapesJS Backbone) commits to GrapesJS as product-architecture; Lock 32 is the vendor-lock complement — alternatives (Unlayer / Stripo) fragment the product. Studio SDK provides Canva-tier capabilities free per Lock 18 Tool-Capability-First Scoping.

**Evidence:** VVOW Architecture §2.2 + §8.1; repo Lock 2; Lock 18; Notion Lock 3 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 33 — Payment Processor: Stripe only

**Statement:** Stripe is the only permitted payment processor. No Paddle, no LemonSqueezy, no Braintree, no PayPal.

**Scope:** All billing operations. All subscription management. All token-metered usage tracking per pricing lock D8. Webhook handlers with HMAC verification + idempotent processing per Notion D11 Webhook Architecture.

**Rationale:** Stripe Billing supports token-metered usage with hard-stop at zero (per pricing lock D8 — Free/$49/$249/$499/$1499, no overage). Robust webhook protocol with HMAC verification.

**Named-launch-default framing (per F7 / Finding 2 ratification 2026-05-14):** Stripe is the **locked launch default** for payment processing AND payment processing is **registry-resolved under Lock 38** (parallel to Lock 7's AI provider naming pattern — named tier ≠ hardcoded in business logic). The prior Lock 33 Rationale carve-out clause stating that Provider Agnosticism did not apply to billing is **STRUCK** by this ratified ruling; payment processors fall under Lock 38's universal agnosticism with Stripe as the named launch default the registry resolves to at launch. A future payment-processor swap is a registry config change, not a Lock 33 amendment.

**Evidence:** Pricing lock D8; CODING_CONVENTIONS Rule 5; FOUNDATION_AUTHORITY substrate L6 (Token Metering + Billing); Notion Lock 6 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 34 — Primary Database: Supabase Postgres only

**Statement:** Supabase Postgres is the primary database. No PlanetScale, no Neon, no RDS, no self-hosted Postgres.

**Scope:** All application data. All multi-tenant data. All RLS enforcement (Lock 13). All canonical migrations (Lock 14). All pgvector embeddings for Pattern DB + Brand Vault semantic search.

**Rationale:** Implicit substrate of repo Lock 13 (Tenant Isolation via Supabase RLS) and Lock 14 (Canonical Migrations) — both locks assume Supabase. Lock 34 makes the vendor commitment explicit at Foundation Lock authority tier. pgvector + RLS + Auth + Realtime in one platform reduces moving parts. Three projects verified live (production / staging / ai-api-web-portal).

**Evidence:** VVOW Architecture §8.4; repo Locks 13 + 14; CODING_CONVENTIONS Rules 1 + 9; FOUNDATION_AUTHORITY L1 substrate; Notion Lock 7 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 35 — Cache + Rate Limit: Upstash Redis only

**Statement:** Upstash Redis is the only permitted caching and rate limiting layer. No self-hosted Redis, no Memcached, no Vercel KV (acceptable alias — Upstash under the hood).

**Scope:** All caching (Pattern DB cache layer per Lock 4, session cache, rate limit counters). All API gateway + per-tenant rate limit enforcement. Two databases verified isolated per WP-4 (`viyo` + `viyo-redis-staging`).

**Rationale:** Upstash is HTTP-based — matches Vercel/Render edge runtime constraints. Pay-per-request model fits VIYO billing posture. INFRASTRUCTURE_DECISIONS ID-6 ratified isolation testing; Lock 35 commits the vendor choice that ID-6 verified.

**Evidence:** INFRASTRUCTURE_DECISIONS ID-6; `/docs/governance/REDIS_ISOLATION_EVIDENCE.md` (WP-4 evidence bundle); Notion Lock 8 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 36 — Frontend Framework: Next.js 14+ App Router only

**Statement:** Next.js 14+ with App Router is the only permitted frontend framework. No Remix, no SvelteKit, no Nuxt, no CRA, no Vite standalone.

**Scope:** All frontend surfaces — app.viyo.com (brand admin + Image Studio), admin.viyo.com (internal admin + swipe gate reviewer), Portal at ai.viyo.new. Four Vercel projects (viyo-admin / viyo-web / viyo-main / ai-api-web-portal) per INFRASTRUCTURE_DECISIONS ID-5.

**Rationale:** App Router pattern integrates cleanly with Vercel deployment. React Server Components reduce client bundle for Image Studio's heavy canvas surface. Standard Next.js patterns support GrapesJS Studio SDK integration (Lock 32) without exotic framework compatibility constraints.

**Evidence:** R17 v2 UX Architecture; INFRASTRUCTURE_DECISIONS ID-5; repo `apps/web/` + `apps/admin/` package.json; Notion Lock 11 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 37 — Runtime Validation: Zod only

**Statement:** Zod is the only permitted runtime validation library. No Yup, no Joi, no class-validator, no custom validation.

**Scope:** All API route input validation. All Inngest event payload schemas. All shared schemas in `packages/core-types`. All Brain Council I/O contracts. All Pattern Recipe validation per Lock 5.

**Rationale:** TypeScript-native — matches CODING_CONVENTIONS Rule 3 (TypeScript strict, zero `any`). Single source-of-truth via Zod schemas (no separate type definitions + validation definitions). Pattern Recipe JSON Schema (Lock 5) is implemented as a Zod schema; other validation libraries would fragment the schema source.

**Evidence:** R20 v2 Database Schema; CODING_CONVENTIONS Rule 3; `packages/core-types` shared Zod schemas; Notion Lock 13 (2026-05-10 PO Direct).

**Date Locked:** 2026-05-10; ratified to repo 2026-05-13 via Phase 3.2 commit.

**Authority Source:** PO Direct.

---

### Lock 38 — Universal Service Agnosticism

**Statement:** No external service is hardcoded in VIYO business logic. Every external service — across every class, including but not limited to **AI/ML providers** (LLM providers, image-generation providers, segmentation providers, upscale providers, OCR providers, embedding providers, vision providers), **communication and marketing services** (ESPs), **commerce platforms** (Shopify, WooCommerce, BigCommerce, and the site-builder class including WordPress, Wix, Squarespace), **CRMs** (HubSpot, Salesforce, and peers), **payment processors**, **analytics**, **observability**, and any future class — is resolved at runtime through a provider registry. Business logic calls a capability interface; the registry resolves the concrete vendor. Any service in any class is swappable via registry configuration without a code change or a governance revision.

**This list is illustrative and non-exhaustive — Lock 38 applies to every external service class VIYO integrates, whether or not it is named here. The test is functional: if VIYO calls out to it, it is registry-resolved.**

**Scope:** All VIYO external integrations, all service classes, all phases. Governance locks the capability interface and the cost model; the registry holds the vendor selection. The named service classes (LLM providers / image-generation providers / ESPs / payment processors / CRMs / analytics) are illustrative — the rule is universal and applies to any external service class VIYO adopts.

**Relationship to Lock 19:** Lock 19 (Provider Agnosticism — AI providers) is the originating instance and remains in force as the AI-provider-specific elaboration. Lock 38 generalizes the same principle to every service class. **Lock 19 is NOT superseded — it is the AI-provider-specific instance of Lock 38** (per F8 ESCALATE ratification 2026-05-14: more-specific Locks remain in force as kept elaborations of more-general Locks). Cross-reference is bidirectional: Lock 19's body declares the relationship explicitly; this Lock 38 clause completes the bidirectional reference.

**Relationship to Stack Constraints Locks 30–37 (per F6 ESCALATE ratification 2026-05-14):** **A service is locked substrate if swapping it requires re-platforming; it is an agnostic service class if swapping it is a registry configuration change. Locks 30–37 are substrate; Lock 38 governs service classes.** This swap-cost test draws the boundary permanently. Locks 30–37 (Mastra DAG / Inngest / GrapesJS Studio SDK / Stripe / Supabase Postgres / Upstash Redis / Next.js / Zod) commit to vendors whose substitution would be a re-platform or rewrite — they stand as substrate locks. Lock 38 governs the agnostic service classes (payment processors per F7 ruling, ESPs, AI providers per Lock 19, CRMs, analytics, observability, future) where substitution is a registry config change. Lock 33 (Stripe) is treated under both lenses: Stripe is the named launch default substrate AND payment processing falls under Lock 38 universal agnosticism — the swap-cost test resolves the apparent tension because payment processor substitution is registry-resolved at the integration layer.

**Rationale:** Hardcoded vendors create governance conflicts the moment a vendor changes, prevent valid multi-vendor strategy (multi-ESP, payment-processor switching, CRM flexibility), and make every integration a permanent decision. Runtime resolution is the pattern proven in Lock 19 and the §6 pricing-as-Portal-config reframe — the system surfaces options, the operator or an agent decides at runtime, nothing operational is frozen into governance.

**Evidence:** Lock 19; R29 v2 PAL Plugin Registry (already implementing runtime resolution for AI providers); PRD V8.1 §6 pricing reframe; PRD V8.1 §6.2 margin-visibility-not-floor.

**Date Locked:** 2026-05-14.

**Authority Source:** PO Direct.

---

## Section 2 — Conflict A Resolution: Notion tech-stack Locks absorption mapping

Per VIYO_PATH_TO_MVP.md §Step 2: the 12 Notion Foundation Locks DB entries for tech-stack vendor commitments (Locks 1–8 + 11–14 in the Notion DB, dated 2026-05-10) are absorbed via the mapping below. Notion Locks 17–20 already align with repo Locks 17–20 (no absorption needed). Notion Lock 21 commits to repo file as Lock 21 (above).

### 2.1 Absorption decision

The Notion tech-stack Locks express vendor lock-in commitments (Mastra-only / Inngest-only / Sharp-only / Stripe-only / etc.). The repo's VVOW-era Locks 1–14 express product-architecture commitments (Sequencing / GrapesJS Backbone / Cache-First / Pattern Recipe schema / etc.). Both are valid commitments at different abstraction layers.

**Curator recommendation:** the cleanest reconciliation is a NEW Stack Constraints Lock series (Locks 30–37) that preserves vendor-lock semantics at the Lock authority tier. CODING_CONVENTIONS is the wrong destination because:
- CC Rules are coding patterns (Result pattern, behavioral tests, Drizzle migrations) — different abstraction layer
- CC Rule expansion from 15 → 23 would obscure the focused 15-rule structure
- Vendor lock commitments are non-negotiable architectural choices — Lock semantics fit better than Rule semantics

The Stack Constraints series is surfaced as PROPOSED below; PO ratification required before commit. Until ratified, the immediate deliverable commits Locks 1–21 only.

### 2.2 Absorption mapping table

| Notion Lock | Substance | Destination | Status |
|---|---|---|---|
| **Notion Lock 1** Mastra DAG orchestrator only | Workflow engine vendor lock | **RATIFIED Stack Constraint Lock 30** (2026-05-13) | See §Section 1 above |
| **Notion Lock 2** Inngest event bus only | Job queue + event bus vendor lock | **RATIFIED Stack Constraint Lock 31** (2026-05-13) | See §Section 1 above |
| **Notion Lock 3** GrapesJS Studio SDK only | Email/Image editor canvas vendor lock | **RATIFIED Stack Constraint Lock 32** (2026-05-13) | See §Section 1 above (substantively covered by repo Lock 2 product-architecture commitment; vendor-lock element separate) |
| **Notion Lock 4** Sharp only for programmatic image ops | Image processing library vendor lock | **ARCHIVE** — substantively covered by CODING_CONVENTIONS Rule 6 (Sharp/PIL for compositing, NEVER AI for text/color) | No new Lock needed |
| **Notion Lock 5** Cloudflare R2 only for asset storage | Asset storage vendor lock | **ARCHIVE** — substantively covered by INFRASTRUCTURE_DECISIONS ID-3 (Cloudflare R2 canonical asset storage, ratified 2026-05-08) + repo Lock 6 (Brand Vault DB-driven organization) | No new Lock needed |
| **Notion Lock 6** Stripe only for payment processing | Payment processor vendor lock | **RATIFIED Stack Constraint Lock 33** (2026-05-13; F7 carve-out struck 2026-05-14 — Stripe is named launch default registry-resolved under Lock 38) | See §Section 1 above |
| **Notion Lock 7** Supabase Postgres primary database | Primary database vendor lock | **RATIFIED Stack Constraint Lock 34** (2026-05-13) | See §Section 1 above (implicit in repo Lock 13 RLS + Lock 14 Migrations + CC Rule 1; this lock makes vendor explicit) |
| **Notion Lock 8** Upstash Redis only for caching/rate limiting | Cache + rate limit vendor lock | **RATIFIED Stack Constraint Lock 35** (2026-05-13) | See §Section 1 above (INFRASTRUCTURE_DECISIONS ID-6 references Upstash for isolation testing; this lock makes vendor explicit) |
| **Notion Lock 11** Next.js 14+ App Router only | Frontend framework vendor lock | **RATIFIED Stack Constraint Lock 36** (2026-05-13) | See §Section 1 above |
| **Notion Lock 12** TypeScript strict mode mandatory | Type discipline | **ARCHIVE** — substantively covered by CODING_CONVENTIONS Rule 3 (TypeScript strict, zero `any`) | No new Lock needed |
| **Notion Lock 13** Zod only for runtime validation | Validation library vendor lock | **RATIFIED Stack Constraint Lock 37** (2026-05-13) | See §Section 1 above |
| **Notion Lock 14** Supabase RLS mandatory for tenant tables | Tenant isolation enforcement | **ARCHIVE** — substantively covered by repo Lock 13 (Tenant Isolation via Supabase RLS) + CODING_CONVENTIONS Rule 9 | No new Lock needed |

**Summary:** 4 archive (substantively covered elsewhere), 8 proposed Stack Constraints (Locks 30–37, contingent on PO ratification).

### 2.3 Stack Constraints Lock series 30–37 (RATIFIED 2026-05-13 — committed at Phase 3.2 revision)

PO ratified all 8 Stack Constraints Locks at this file's original ratification 2026-05-13; commit deferred to Phase 3.2 governance refresh. Locks 30–37 now appear in §Section 1 above with full 8-field canonical format. The table below is retained as a quick-reference summary of the substance + cross-reference to Notion source locks.

| Lock | Title | Statement | Authority Source |
|---|---|---|---|
| **30** | Workflow Engine: Mastra DAG only | `@mastra/core` is the only permitted DAG orchestration framework. No LangChain, no custom orchestrator, no Temporal, no Prefect. | PO Direct (per Notion Lock 1, 2026-05-10) |
| **31** | Event Bus + Job Queue: Inngest only | Inngest is the only permitted event bus and job queue. No BullMQ, no SQS, no RabbitMQ, no custom queue. | PO Direct (per Notion Lock 2) |
| **32** | Canvas Engine: GrapesJS Studio SDK only | GrapesJS Studio SDK is the canvas engine for both Image Studio and Email Studio. No custom editor, no Unlayer, no Stripo, no MJML-only approach. (Complements repo Lock 2 product-architecture commitment; this lock addresses vendor lock-in.) | PO Direct (per Notion Lock 3) |
| **33** | Payment Processor: Stripe only | Stripe is the only permitted payment processor. No Paddle, no LemonSqueezy, no Braintree, no PayPal. | PO Direct (per Notion Lock 6) |
| **34** | Primary Database: Supabase PostgreSQL only | Supabase Postgres is the primary database. No PlanetScale, no Neon, no RDS, no self-hosted Postgres. (Implicit in repo Lock 13 RLS and Lock 14 Migrations; this lock makes the vendor commitment explicit.) | PO Direct (per Notion Lock 7) |
| **35** | Cache + Rate Limit: Upstash Redis only | Upstash Redis is the only permitted caching and rate limiting layer. No self-hosted Redis, no Memcached, no Vercel KV (which is Upstash under the hood — acceptable alias). | PO Direct (per Notion Lock 8) |
| **36** | Frontend Framework: Next.js 14+ App Router only | Next.js 14+ with App Router is the only permitted frontend framework. No Remix, no SvelteKit, no Nuxt, no CRA, no Vite standalone. | PO Direct (per Notion Lock 11) |
| **37** | Runtime Validation: Zod only | Zod is the only permitted runtime validation library. No Yup, no Joi, no class-validator, no custom validation. | PO Direct (per Notion Lock 13) |

**Curator recommendation on Stack Constraints:** ratify all 8 as Stack Constraints Locks 30–37. Rationale: vendor lock-in choices are non-negotiable architectural commitments at the Lock authority tier; separating product-architecture Locks (1–14) from Process Locks (17–21) from Stack Constraints Locks (30–37) preserves taxonomy clarity; Lock numbering remains gap-aware (15, 16 RESERVED; gap 22–29 reserved for future product-architecture or process Locks).

---

## Section 3 — Notion Foundation Locks DB sync (Phase 5.2 handoff)

After PO ratifies this file + the absorption mapping, Phase 5.2 (System Cleanup §5.2) executes Notion DB reconciliation:

| Notion Lock | Action |
|---|---|
| Locks 1, 2, 3, 6, 7, 8, 11, 13 (8 tech-stack vendor locks) | If Stack Constraints ratified: rename in Notion to "Lock 30..37 — [title]" preserving body; if not: mark Status = Superseded with pointer to destination (CODING_CONVENTIONS Rule X / Infrastructure ID-X) |
| Lock 4 (Sharp) | Mark Status = Superseded; pointer to CODING_CONVENTIONS Rule 6 |
| Lock 5 (R2) | Mark Status = Superseded; pointer to INFRASTRUCTURE_DECISIONS ID-3 + repo Lock 6 |
| Lock 12 (TypeScript strict) | Mark Status = Superseded; pointer to CODING_CONVENTIONS Rule 3 |
| Lock 14 (RLS) | Mark Status = Superseded; pointer to repo Lock 13 + CODING_CONVENTIONS Rule 9 |
| Locks 17, 18, 19, 20, 21 | Add `Repo commit:` property pointing to `/docs/governance/FOUNDATION_LOCK.md` (this file, post-commit) |
| Locks 9, 10, 15, 16 (absent from Notion) | Create Notion pages from this file's content; Status = Locked; Authority Source = VVOW + PO Direct |
| **Lock 38** Universal Service Agnosticism (new, dated 2026-05-14) | **Create Notion page** for Lock 38 with the file's Lock 38 substance (Statement + Scope + Relationship to Lock 19 + Relationship to Stack Constraints + Rationale + Evidence); Status = Locked; Authority Source = PO Direct; Date Locked = 2026-05-14. Cross-reference: Lock 19's Notion page is updated with "Lock 38 is the universal generalization; Lock 19 is the AI-provider-specific instance" — bidirectional pointer per F8 ratification (Lock 19 NOT superseded). |

Phase 5.2 is Cataloger work (not Curator) — surface as Manus directive in Phase 5 governance refresh.

---

## Section 4 — Operationalization handoffs

Lock 17, 18, 19, 21, 38 are the substrate for ARCHITECT_OPERATING_RULES.md. Per ANTI_PATTERN_CATALOG §3, each Lock is operationalized via an external enforcement mechanism — capability described per Lock 21 (specific tools / agents / skills named in the implementing R-specs, not in this governance text):

| Lock | Operationalized in | External enforcement capability |
|---|---|---|
| **Lock 17** Foundation-First | ARCHITECT_OPERATING_RULES Operating-Discipline section | An external validator agent rejects Bullet directives + R-specs containing deferral-language indicating unreconciled upstream conflict; a commit-time lint rejects governance text with the same pattern. |
| **Lock 18** Tool-Capability-First | ARCHITECT_OPERATING_RULES Operating-Discipline section | An R-spec quality bar requires a Tool Capability Check section; the validator rejects R-specs without it. |
| **Lock 19** Provider Agnosticism (AI-provider-specific instance of Lock 38) | R29 v2 PAL + ZCBR validation + ARCHITECT_OPERATING_RULES Operating-Discipline section | A commit-time lint rejects hardcoded model-name strings in business logic; the validator rejects R-specs with the same pattern; a pre-flight check refuses code start on R-specs not carrying a passing validation header. |
| **Lock 20** ZCBR-Validated Specs Required | ZCBR_STANDARD.md (3-checkpoint protocol) | Architect self-validation at authoring; an external validator at directive-intake gate; a pre-flight check before code start. |
| **Lock 21** Governance Agnosticism | ARCHITECT_OPERATING_RULES Operating-Discipline section + CLAUDE.md v2 + VIYO_CURRENT_MAP | A self-validation skill at governance authoring; a commit-time lint on governance files for specific-implementation patterns; PO-side test before sending directives. |
| **Lock 38** Universal Service Agnosticism (per F13 fix 2026-05-14) | R29 v2 PAL + ARCHITECT_OPERATING_RULES Operating-Discipline section | A commit-time lint rejects hardcoded vendor names in business logic outside Stack Constraints (Locks 30–37) carve-out classes; a registry-schema enforcement check confirms every external service class resolves via the Plugin Registry; the swap-cost boundary test (re-platform = substrate / registry config = service class) is applied at governance-text authoring time. |

Locks 1–14 (product-architecture commitments) are operationalized in code via the R-specs that implement them + the schemas they declare. No additional governance enforcement layer needed beyond the schemas themselves.

Locks 30–37 (Stack Constraints) are operationalized as substrate commitments — the named vendor IS the lock's substance (Lock 21 edge case applies). Operational enforcement is at the package-manifest layer (package.json dependencies match locked vendors) + project-config layer (provider URLs match locked services); no separate governance enforcement mechanism beyond the operational reality of the project depending on the named vendors.

Lock 13 (Tenant Isolation via Supabase RLS) is the substrate for CODING_CONVENTIONS Rule 9 + R22 v2 (Security & Auth).

---

## Section 5 — Recommendations to PO

Four Curator-call decisions surface to PO for ratification with this deliverable.

### Decision 1 — Stack Constraints Lock series 30–37 adoption ✅ RATIFIED 2026-05-13

**Curator recommendation (accepted):** **Adopt all 8** (Locks 30, 31, 32, 33, 34, 35, 36, 37) as proposed in §2.3 and now committed to §Section 1 above. Vendor lock-in commitments at Lock authority tier preserves taxonomy clarity; absorbing into CODING_CONVENTIONS would balloon the rule set from 15 to 23 and obscure the focused rule structure. Stack Constraints series 30s keeps Lock numbering gap-aware (15, 16 RESERVED; 22–29 reserved for future product-architecture or process Locks).

**Status:** PO-ratified at this file's original ratification 2026-05-13; committed to repo at Phase 3.2 revision. Locks 30–37 are non-negotiable architectural commitments effective immediately.

**Alternative considered:** Absorb 8 Notion tech-stack locks into CODING_CONVENTIONS Rules 16–23. Rejected because CC Rules are coding patterns, not vendor lock-in commitments.

**PO action:** Ratify "all 8 Stack Constraints Locks 30–37" OR reject Stack Constraints series in favor of CODING_CONVENTIONS expansion. If ratified, Phase 2.2 revision adds Locks 30–37 to this file. If rejected, Phase 5.2 reconciliation marks Notion entries Superseded with CC Rule pointers and CC expansion happens in Phase 5.2.

### Decision 2 — Locks 15, 16 disposition ✅ RATIFIED 2026-05-13

**Curator recommendation (accepted):** **Keep RESERVED.** No substrate exists for new content; assigning without ratification would re-introduce the reactive accumulation anti-pattern (Family 7 in ANTI_PATTERN_CATALOG). Reserved slots preserve continuity with artifacts referencing Locks 17–21 explicitly.

**Status:** PO-ratified 2026-05-13 at Phase 2.2 ratification. Locks 15 and 16 remain RESERVED as named in §Section 1.

**Alternative considered:** Renumber Locks 17–21 to 15–19 (collapsing reserved gap). Rejected because existing repo + Notion artifacts reference Lock 17, 18, 19, 20, 21 by number; renumbering cascades changes across CLAUDE.md, FOUNDATION_AUTHORITY, ZCBR_STANDARD, Operating Workflow, ANTI_PATTERN_CATALOG, and external dependencies (validator agent + pre-flight check protocols).

### Decision 3 — Authority Source field for Locks 1–14 ✅ RATIFIED 2026-05-13

**Curator recommendation (accepted):** Authority Source for Locks 1–14 = "VVOW + PO Direct" per the chain: VVOW Architecture v2.0 was authored by Architect Claude, PO-accepted 2026-05-12; the underlying Locks emerged from PO audit of V8 PRD §20K.1 captured in VVOW §0 (recorded 2026-05-08).

**Status:** PO-ratified 2026-05-13 at Phase 2.2 ratification. Applied to Locks 1–14 in §Section 1.

**Alternative considered:** "Architect Claude" only — rejected because the Locks pre-date Architect Claude's authoring; they originated from PO audit of V8 PRD.

### Decision 4 — Notion Foundation Locks DB archival policy ✅ RATIFIED 2026-05-13

**Curator recommendation (accepted):** **Mark Notion entries Status = Superseded** (or "Status = Locked" with `Repo commit:` pointer for Locks 17–21) rather than deleting. Retains audit trail; future drift detection can compare Notion vs. repo without losing historical context.

**Status:** PO-ratified 2026-05-13 at Phase 2.2 ratification. Phase 5.2 reconciliation executes per §Section 3 handoff table.

**Alternative considered:** Delete Notion Lock pages after this file commits. Rejected because Notion retains the only record of when each lock was first authored (Date Locked property); deletion loses audit trail.

### Decision 5 — Lock 38 Universal Service Agnosticism ✅ RATIFIED 2026-05-14

**Curator recommendation (accepted):** Add Lock 38 as a process-governance commitment generalizing Lock 19's provider-agnosticism principle to every external service class. Substrate-vs-service-class boundary decided by swap-cost (re-platform = locked substrate; registry config = agnostic service class). Lock 19 retained as the AI-provider-specific instance per F8 ESCALATE ratification (more-specific Locks remain in force as kept elaborations of more-general Locks).

**Status:** PO-ratified 2026-05-14. Committed to repo at SHA `ef47d2c` + clarification at `397fd50`. Step C Author fix pass 2026-05-14 applied the F6 swap-cost boundary clause to Lock 38 + bidirectional Lock 19 cross-reference + F7 Lock 33 billing carve-out strike + F16 named-launch-default framing on Locks 7/9.

**Authority Source:** PO Direct.

**Alternative considered:** Treat AI-provider agnosticism alone (Lock 19) as sufficient; not generalize. Rejected because hardcoded vendors across non-AI service classes (payment, ESP, CRM, analytics, observability) create the same governance-conflict failure mode Lock 19 was authored to prevent — the principle generalizes.

---

## Section 6 — Closing

This file establishes 30 ratified Foundation Locks as the single canonical authority for VIYO non-negotiable architectural commitments, resolves Conflict A via the absorption mapping in §2 (8 Notion tech-stack Locks ratified as Stack Constraints Locks 30–37 + 4 absorbed by reference to CODING_CONVENTIONS / INFRASTRUCTURE_DECISIONS / Lock 13), commits Lock 21 (Governance Agnosticism) from Notion to repo, generalizes Lock 19 to Lock 38 (Universal Service Agnosticism with the swap-cost boundary clause for Stack Constraints), and records 5 PO-ratified Curator-call decisions (Stack Constraints adoption / Locks 15-16 RESERVED / Authority Source for Locks 1-14 / Notion archival policy / Lock 38 addendum).

Ratification record:
- **Original commit:** Phase 2.2 deliverable committed 2026-05-13.
- **Phase 3.2 revision:** Stack Constraints Locks 30–37 committed 2026-05-13.
- **Lock 38 addendum:** committed 2026-05-14 at SHA `ef47d2c` + clarification at `397fd50`.
- **Step C Author fix pass:** 16 VALID + 3 ratified ESCALATE resolutions applied 2026-05-14 per ARBITRATION_FOUNDATION_LOCK_v2.md (committed at SHA `5616757`).

Operational handoffs:
- **ARCHITECT_OPERATING_RULES.md** uses Locks 17, 18, 19, 21, 38 as substrate per §Section 4 above.
- **Phase 5.2 Notion Foundation Locks DB sync** executes per §Section 3 handoff (Cataloger work, surfaced as Manus directive).

**Phase 2.2 + Phase 3.2 revision + Lock 38 addendum + Step C Author fix pass all ratified.**

---

*End of FOUNDATION_LOCK.md*
