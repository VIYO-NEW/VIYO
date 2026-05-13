# FOUNDATION_LOCKS_v2.md

**Phase 2.2 deliverable per VIYO_PATH_TO_MVP.md §Step 2**
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop)
**Supersedes:** `/docs/governance/FOUNDATION_LOCK.md` (current Locks 1–20 + RESERVED 15, 16)
**Authority tier:** Foundational substrate. Below PO decisions + V8 PRD; above CODING_CONVENTIONS + R-spec ZCBR + per-Bullet directives + code.
**Update authority:** Curator authors drafts; PO ratifies; Cataloger commits to canonical state (repo + Notion). Once committed, locks are non-negotiable; changes require PO directive that explicitly modifies the locked text.

---

## RULE A — Paragraph summary

FOUNDATION_LOCKS_v2.md establishes 21 ratified Foundation Locks as the single canonical authority for VIYO non-negotiable architectural commitments. Locks 1–14 carry forward the repo VVOW-era product-architecture commitments (Product Sequencing / Unified GrapesJS Backbone / MJML JSON Recipe / Cache-First / Pattern Recipe schema / Brand Vault organization / 3-Tier Provider / Programmatic editing / RLHF + Tinder swipe / LoRA pipeline / Pattern Seeding / Brain Council scope / Tenant Isolation via RLS / Canonical Migrations). Locks 15 and 16 remain RESERVED (placeholder for future ratification, preserving continuity with artifacts referencing Locks 17–21 explicitly). Locks 17–21 carry forward repo Locks 17–20 plus NEW Lock 21 (Governance Agnosticism, ratified 2026-05-12 in Notion, committed to repo by this deliverable). Conflict A resolution: the 12 tech-stack-vendor Locks 1–8 + 11–14 in the Notion Foundation Locks DB (Mastra / Inngest / GrapesJS Studio SDK / Sharp / R2 / Stripe / Supabase Postgres / Upstash Redis / Next.js / TypeScript strict / Zod / RLS) are absorbed via the mapping in §2: 4 are archived because they're already substantively covered (Sharp by CODING_CONVENTIONS Rule 6; Cloudflare R2 by INFRASTRUCTURE_DECISIONS ID-3; TypeScript strict by CODING_CONVENTIONS Rule 3; RLS by repo Lock 13 + CODING_CONVENTIONS Rule 9), and 8 are proposed as a NEW Stack Constraints Lock series (Locks 30–37) covering vendor lock-in choices not otherwise codified. The Stack Constraints series is surfaced as a PROPOSED addition contingent on PO ratification of the absorption mapping — Locks 30–37 are not committed to the repo file until PO ratifies; the immediate deliverable target is 21 Locks (1–21) with the absorption mapping as a separate Phase 2.2 / 5.2 work item. Each lock entry uses the canonical format: Number / Title / Statement / Scope / Rationale / Evidence / Date Locked / Authority Source. The deliverable closes with Phase 5.2 handoff (Notion Foundation Locks DB sync to this file's numbering + content), Curator recommendations for the 4 outstanding decisions (Stack Constraints adoption / Locks 15-16 disposition / Authority Source for Locks 1-14 / Notion archival policy), and pointer to ARCHITECT_OPERATING_RULES.md (Phase 2.3) for how Locks 17, 18, 19, 21 are operationalized via external enforcement mechanisms per ANTI_PATTERN_CATALOG §3.

---

## Method

1. Read repo `/docs/governance/FOUNDATION_LOCK.md` for current Locks 1–20 (in full).
2. Searched Notion Foundation Locks DB (data source `7ed3c2e2-958d-40f0-bb32-70711b52c6bc`) for all Lock pages; confirmed 17 distinct pages: Locks 1–8 + 11–14 (tech-stack, dated 2026-05-10) + Locks 17–21 (process). Locks 9, 10, 15, 16 absent from Notion DB.
4. Fetched full body of Notion Lock 21 (Governance Agnosticism) and Lock 20 (ZCBR-Validated Specs Required) for verbatim canonical text.
5. Read STATE_AUDIT.md §Conflict A (Lock 1–14 content mismatch between repo and Notion).
6. Read VVOW_IMAGE_STUDIO_ARCHITECTURE.md §Appendix A Summary Table of Locks for product-architecture context.
7. Read CODING_CONVENTIONS.md and INFRASTRUCTURE_DECISIONS.md to identify which Notion tech-stack locks are already substantively captured elsewhere.
8. Read VIYO_PATH_TO_MVP.md §Step 2 specification (inline above) for absorption mapping requirement.
9. Authored Locks 1–21 + absorption mapping + Stack Constraints proposal + Phase 5.2 handoff.

---

## Authority hierarchy (single canonical statement, supersedes prior 7-tier vs 9-tier disagreement)

The following hierarchy resolves Conflict C (per STATE_AUDIT.md §12). Top wins.

1. **PO decisions** — recorded in Notion Decisions DB + accepted directives + chat ratifications.
2. **V8 PRD (until V8.1 supersedes — Phase 4)** at Drive ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`. Canonical product north star except where flagged underspecified by PO audit.
3. **FOUNDATION_LOCKS_v2.md (this file)** — non-negotiable architectural commitments.
4. **FOUNDATION_AUTHORITY.md** — 12 substrate definitions + 7 conflict resolutions (C-01 through C-07) + 4-competitor moat absorption framework.
5. **VVOW Architecture v2.0** — Phase 1 canonical implementation reference.
6. **VIYO_OPERATING_WORKFLOW.md** §1–5 (substrate sections) — agent topology, repo/product/storage roles, workflow paths.
7. **CODING_CONVENTIONS.md** — 15 testable code rules (post-Phase 2.2 if absorption mapping ratified: extends to incorporate absorbed Notion locks; otherwise unchanged).
8. **ZCBR_STANDARD.md** — R-spec quality bar (Lock 20 substrate).
9. **R-spec ZCBR** — ZCBR-PASSED specs (Architect-authored only per Lock 20).
10. **Per-Bullet directives** — operational scope only.
11. **Existing code** — last priority; rewrite to match higher layers when conflicts arise.

The 7-tier hierarchy in FOUNDATION_AUTHORITY.md §1.3 and the 9-tier hierarchy in current CLAUDE.md are both superseded by this single canonical statement. Phase 3.1 CLAUDE.md v2 references this hierarchy by pointer rather than restating, eliminating drift.

---

## Section 1 — The 21 Foundation Locks

Each lock uses format: **Number / Title / Statement / Scope / Rationale / Evidence / Date Locked / Authority Source.**

Locks 1–14 = product-architecture commitments. Locks 15–16 = RESERVED. Locks 17–21 = process / governance commitments.

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

**Statement:** Every user action emits an RLHF signal: drag to canvas = `+1 qaScore`; export image = `+5 qaScore`; regenerate (ignore variant) = `−1 qaScore`. QA Bouncer (GPT-4o-mini) auto-approves/rejects every generation. Humans verify via Tinder-style side-by-side swipe vs. original: 50% of auto-approved sampled, 20% of auto-rejected sampled. Override events feed DSPy optimization loop. After 5,000 swipe decisions, Fine-Tuned VLM Preference Classifier replaces humans for the sample. Skipping the swipe gate sample for QA Bouncer outputs is forbidden.

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
- Governance text does **NOT** name specific files, specific paths, specific step numbers, specific tag names, specific schema field names, specific tool names, or specific implementation patterns

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
- Operational reports / state observations (PR numbers, commit SHAs, file IDs — these are observations of state, not governance)

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
| **Notion Lock 1** Mastra DAG orchestrator only | Workflow engine vendor lock | **PROPOSED Stack Constraint Lock 30** | Surfaced below |
| **Notion Lock 2** Inngest event bus only | Job queue + event bus vendor lock | **PROPOSED Stack Constraint Lock 31** | Surfaced below |
| **Notion Lock 3** GrapesJS Studio SDK only | Email/Image editor canvas vendor lock | **PROPOSED Stack Constraint Lock 32** | Surfaced below (substantively covered by repo Lock 2 product-architecture commitment; vendor-lock element separate) |
| **Notion Lock 4** Sharp only for programmatic image ops | Image processing library vendor lock | **ARCHIVE** — substantively covered by CODING_CONVENTIONS Rule 6 (Sharp/PIL for compositing, NEVER AI for text/color) | No new Lock needed |
| **Notion Lock 5** Cloudflare R2 only for asset storage | Asset storage vendor lock | **ARCHIVE** — substantively covered by INFRASTRUCTURE_DECISIONS ID-3 (Cloudflare R2 canonical asset storage, ratified 2026-05-08) + repo Lock 6 (Brand Vault DB-driven organization) | No new Lock needed |
| **Notion Lock 6** Stripe only for payment processing | Payment processor vendor lock | **PROPOSED Stack Constraint Lock 33** | Surfaced below (no current repo Lock / CC Rule / Infrastructure ID covers payment processor vendor) |
| **Notion Lock 7** Supabase Postgres primary database | Primary database vendor lock | **PROPOSED Stack Constraint Lock 34** | Surfaced below (implicit in repo Lock 13 RLS + Lock 14 Migrations + CC Rule 1, but vendor not explicit anywhere) |
| **Notion Lock 8** Upstash Redis only for caching/rate limiting | Cache + rate limit vendor lock | **PROPOSED Stack Constraint Lock 35** | Surfaced below (INFRASTRUCTURE_DECISIONS ID-6 references Upstash for isolation testing but doesn't declare it a vendor lock) |
| **Notion Lock 11** Next.js 14+ App Router only | Frontend framework vendor lock | **PROPOSED Stack Constraint Lock 36** | Surfaced below (not in current Locks or CC Rules) |
| **Notion Lock 12** TypeScript strict mode mandatory | Type discipline | **ARCHIVE** — substantively covered by CODING_CONVENTIONS Rule 3 (TypeScript strict, zero `any`) | No new Lock needed |
| **Notion Lock 13** Zod only for runtime validation | Validation library vendor lock | **PROPOSED Stack Constraint Lock 37** | Surfaced below (Zod used implicitly throughout R-specs and CC Rules but not explicit anywhere as a vendor lock) |
| **Notion Lock 14** Supabase RLS mandatory for tenant tables | Tenant isolation enforcement | **ARCHIVE** — substantively covered by repo Lock 13 (Tenant Isolation via Supabase RLS) + CODING_CONVENTIONS Rule 9 | No new Lock needed |

**Summary:** 4 archive (substantively covered elsewhere), 8 proposed Stack Constraints (Locks 30–37, contingent on PO ratification).

### 2.3 Stack Constraints Lock series 30–37 (PROPOSED — not committed)

If PO ratifies the absorption mapping, the following Stack Constraints Locks add to this file in a Phase 2.2 revision OR fold into Phase 5.2 governance refresh. Until ratification, these statements are NOT in effect as Foundation Locks — they remain Notion DB entries.

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

Phase 5.2 is Cataloger work (not Curator) — surface as Manus directive in Phase 5 governance refresh.

---

## Section 4 — Operationalization handoffs

Lock 17, 18, 19, 21 are the substrate for ARCHITECT_OPERATING_RULES.md (Phase 2.3). Per ANTI_PATTERN_CATALOG §3, each Lock is operationalized via an external enforcement mechanism:

| Lock | Operationalized in | External enforcement mechanism (per ANTI_PATTERN_CATALOG §3) |
|---|---|---|
| **Lock 17** Foundation-First | Phase 2.3 ARCHITECT_OPERATING_RULES §3 Operating Discipline | Reviewer Claude rejects Bullet directives + R-specs containing "TODO: reconcile" deferral language; CI grep on commit |
| **Lock 18** Tool-Capability-First | Phase 2.3 ARCHITECT_OPERATING_RULES §3 | R-spec ZCBR §X "Tool Capability Check" section mandatory; Reviewer Claude rejects R-specs without it |
| **Lock 19** Provider Agnosticism | R29 v2 PAL + ZCBR validation + ARCHITECT_OPERATING_RULES §3 | CI grep on commit for hardcoded model name strings; Reviewer Claude §9 Gate rejection; Kimi pre-flight via `zcbr-spec-validation` skill |
| **Lock 20** ZCBR-Validated Specs Required | ZCBR_STANDARD.md §5 (3 checkpoints) | Architect self-validation at authoring; Reviewer Claude validation at §9 Gate intake; Kimi pre-flight via `zcbr-spec-validation` skill before code start |
| **Lock 21** Governance Agnosticism | Phase 2.3 ARCHITECT_OPERATING_RULES §3 + Phase 3.1 CLAUDE.md v2 + Phase 3.2 VIYO_CURRENT_MAP | Lock 21 self-validation skill at governance authoring; CI lint on governance files for specific-implementation patterns; PO-side test before sending directives |

Locks 1–14 (product-architecture commitments) are operationalized in code via the R-specs that implement them (R20 v2 / R24 v2 / R29 v2 / R31 v2 / T46 v2) + the schemas they declare. No additional governance enforcement layer needed beyond the schemas themselves.

Lock 13 (Tenant Isolation via Supabase RLS) is the substrate for CODING_CONVENTIONS Rule 9 + R22 v2 (Security & Auth).

---

## Section 5 — Recommendations to PO

Four Curator-call decisions surface to PO for ratification with this deliverable.

### Decision 1 — Stack Constraints Lock series 30–37 adoption

**Curator recommendation:** **Adopt all 8** (Locks 30, 31, 32, 33, 34, 35, 36, 37) as proposed in §2.3. Vendor lock-in commitments at Lock authority tier preserves taxonomy clarity; absorbing into CODING_CONVENTIONS would balloon the rule set from 15 to 23 and obscure the focused rule structure. Stack Constraints series 30s keeps Lock numbering gap-aware (15, 16 RESERVED; 22–29 reserved for future product-architecture or process Locks).

**Alternative considered:** Absorb 8 Notion tech-stack locks into CODING_CONVENTIONS Rules 16–23. Rejected because CC Rules are coding patterns, not vendor lock-in commitments.

**PO action:** Ratify "all 8 Stack Constraints Locks 30–37" OR reject Stack Constraints series in favor of CODING_CONVENTIONS expansion. If ratified, Phase 2.2 revision adds Locks 30–37 to this file. If rejected, Phase 5.2 reconciliation marks Notion entries Superseded with CC Rule pointers and CC expansion happens in Phase 5.2.

### Decision 2 — Locks 15, 16 disposition

**Curator recommendation:** **Keep RESERVED.** No substrate exists for new content; assigning without ratification would re-introduce the reactive accumulation anti-pattern (Family 7 in ANTI_PATTERN_CATALOG). Reserved slots preserve continuity with artifacts referencing Locks 17–21 explicitly.

**Alternative considered:** Renumber Locks 17–21 to 15–19 (collapsing reserved gap). Rejected because existing repo + Notion artifacts reference Lock 17, 18, 19, 20, 21 by number; renumbering cascades changes across CLAUDE.md, FOUNDATION_AUTHORITY, ZCBR_STANDARD, Operating Workflow, ANTI_PATTERN_CATALOG, and external dependencies (Reviewer Claude protocol, Kimi pre-flight check).

**PO action:** Ratify "Locks 15, 16 remain RESERVED" OR direct content assignment with explicit Lock 15 / Lock 16 substance.

### Decision 3 — Authority Source field for Locks 1–14

**Curator recommendation:** Set Authority Source for Locks 1–14 as "VVOW + PO Direct" per the chain: VVOW Architecture v2.0 was authored by Architect Claude, PO-accepted 2026-05-12; the underlying Locks emerged from PO audit of V8 PRD §20K.1 captured in VVOW §0 (recorded 2026-05-08).

**Alternative considered:** "Architect Claude" only — rejected because the Locks pre-date Architect Claude's authoring; they originated from PO audit of V8 PRD.

**PO action:** Ratify "VVOW + PO Direct" OR specify alternative attribution per Lock.

### Decision 4 — Notion Foundation Locks DB archival policy

**Curator recommendation:** **Mark Notion entries Status = Superseded** (or "Status = Locked" with `Repo commit:` pointer for Locks 17–21) rather than deleting. Retains audit trail; future drift detection can compare Notion vs. repo without losing historical context.

**Alternative considered:** Delete Notion Lock pages after this file commits. Rejected because Notion retains the only record of when each lock was first authored (Date Locked property); deletion loses audit trail.

**PO action:** Ratify "mark Superseded with pointers" OR direct deletion.

---

## Section 6 — Closing

This file establishes 21 ratified Foundation Locks as the single canonical authority for VIYO non-negotiable architectural commitments, resolves Conflict A via the absorption mapping in §2, commits Lock 21 (Governance Agnosticism) from Notion to repo, and surfaces 4 Curator-call decisions for PO ratification.

After PO ratification:
- **Repo commit:** This file replaces `/docs/governance/FOUNDATION_LOCK.md` via Manus directive (Path A). Commit message cites the PO ratification chat quote per the proposed PR ratification trail schema (ANTI_PATTERN_CATALOG §3 Category 2).
- **Phase 2.3 (ARCHITECT_OPERATING_RULES.md)** authors next, using Locks 17, 18, 19, 21 as substrate per §4 above.
- **Phase 5.2** Notion Foundation Locks DB sync executes per §3 handoff (Cataloger work, surfaced as Manus directive).
- **Phase 2.2 revision** (if Stack Constraints ratified) adds Locks 30–37 to this file.

**Phase 2.2 is complete pending PO ratification.**

---

*End of FOUNDATION_LOCKS_v2.md*
