# FOUNDATION_AUTHORITY.md

**Document Class:** Substrate Authority — VIYO Architectural Foundation
**Status:** RATIFIED 2026-05-10
**Author:** Architect Claude (Opus 4.7)
**PO:** Eddy Lipnitsky
**Repo Location:** `/docs/governance/FOUNDATION_AUTHORITY.md`
**Authority Tier:** PO Decisions → V8 PRD → **FOUNDATION_AUTHORITY.md** → VVOW Architecture → R-spec ZCBR → directives → code
**Supersedes:** Implicit substrate definitions scattered across 14 Foundation Locks, T46/T47/T48/T33-T36 Sprint 2 architecture locks, partial substrate references in V8 PRD §20K and VVOW §1-21
**Updated By:** Architect Claude only, with PO ratification logged in Notion VIYO Decision Log

---

## Purpose

This document defines the **12 agnostic substrates** that support every VIYO phase from Phase 0 through Phase 4+ without requiring rebuild. Each substrate is a horizontal capability layer that the application stands on. Phase 1 (Image Studio) and Phase 2 (Email Engine) and Phase 3 (Intelligence Studio) all consume the same substrate. The substrate is built once.

This document also locks the **corrected phase plan** reverse-engineered from the 4-competitor moat (Lovart, Migma, Grid & Pixel, Instant), which supersedes any Build Tracker P0-P7 phase labels, any Manus phase assumptions, and any TaskMaster phase ordering.

This document does NOT relitigate decisions already locked. It absorbs them and makes them queryable in one place.

---

## Section 1 — VIYO Identity & Competitive Moat

### 1.1 What VIYO is

VIYO is an **AI Email Creative OS** for Shopify+Klaviyo brands. It unifies four best-in-class single-moat competitors into one product driven by a shared brand intelligence layer (ATLAS Top Brain corpus + MAAX per-brand memory graph + HYVE opt-in cross-brand network).

### 1.2 The 4-competitor moat absorption (LOCKED)

| Competitor | Their single moat | VIYO phase that absorbs it |
|---|---|---|
| **Lovart** (lovart.ai) | 3-zone image creation studio (chat + canvas + toolbelt) with intelligent regeneration | **Phase 1** — Image Studio (VVOW canonical) |
| **Migma** (migma.ai) | Idea→inbox AI email + Figma/HTML/Screenshot import + visual editing + Remix competitor emails + auto flows/segments/scheduling | **Phase 2** — Email Engine |
| **Grid & Pixel** (gridandpixel.com) | Popups + Flows + Campaigns + Themes + Automatic Suppression + Magic Mail deliverability + AI Klaviyo Audits + Trust Layer ("you stay in control, AI executes") | **Phase 2** core + **Phase 2.5** Trust Layer |
| **Instant** (instant.one) | Personalised Copy per shopper + Dynamic Products + Smart Coupons + Send-Time Optimization + Audiences (first-party data beyond cookies) + Instant Research Labs | **Phase 3** — Intelligence Studio |

**No competitor combines image generation + email creation + flows/segmentation + hyper-personalization in one product.** That is VIYO's structural moat. Each phase is justified by an absorbed competitor surface, which is why phase boundaries are not negotiable: skipping or reordering a phase breaks the moat coverage.

### 1.3 Authority hierarchy (per CLAUDE.md, locked)

1. **PO decisions** in Notion VIYO Decision Log + accepted directives — top authority
2. **V8 PRD** — canonical except where flagged underspecified
3. **FOUNDATION_AUTHORITY.md** (this document) — substrate authority, supersedes V8 PRD where PRD underspecified at the substrate layer
4. **VVOW Image Studio Architecture** — Phase 1 canonical specification
5. **R-file ZCBR specs** (May 3, 2026) — supersede earlier architecture only when more detailed
6. **Per-bullet directives** — operational scope only
7. **Existing code** — last priority; rewrite to match higher layers

---

## Section 2 — The Phase Plan (LOCKED, REVERSE-ENGINEERED)

The phase plan was reverse-engineered from the final unified product backward. **Build Tracker P0-P7 phasing is task arrangement, not architectural authority.** Manus + TaskMaster grouped 580 features into Build Tracker phases based on initial scoping; that grouping is superseded by VIYO phases here.

### 2.1 Phase 0 — Substrate (no user-facing product)

**178 features per Manus Inventory.** All 12 agnostic substrates (Section 5 below). No competitor surface absorbed yet. This phase exists so that Phases 1–4+ never require substrate rebuilds.

**Ships:** All 12 substrates fully scaffolded — multi-tenant identity with RLS, Provider Routing plugin registry, Brand Vault asset model, Pattern DB schema with vector embeddings, RLHF event taxonomy, billing infrastructure (Stripe + token metering tables), observability (Sentry + OpenTelemetry + PostHog + structured JSON logs), job orchestration (Inngest + Mastra DAGs), R2 storage with versioning, Realtime substrate, Webhook pipeline per Notion Decision 11, Skill System Layer 1 (orchestration) + Layer 2 seed registry.

**Status:** Largely shipped by Manus. 552 of 580 features Not Started, 25 Done, 3 In Progress. Gaps to be confirmed against Inventory v002 once polish is delivered.

### 2.2 Phase 1 — Image Studio + Brand Admin Shell + Lovart Billing

**Absorbs Lovart's moat.** 41 features per Manus Inventory.

**Ships:**
- VVOW Image Studio (Lovart 3-zone UX, 22 generation modes A1–A22, 11 editing tools B1–B11)
- Brand Vault populated with versioned assets and `parent_asset_id` lineage
- Pattern DB seeded via Milled scraper (per Lock 11)
- RLHF flywheel active (event emission + qaScore propagation)
- Tinder Swipe Gate with 3 reviewers (OD-005)
- **app.viyo.com** — brand admin shell (signup/login/onboarding, workspace management, team invites + role assignment, integrations panel, usage/billing dashboard, settings)
- **admin.viyo.com** — minimal scope (tenant list, swipe-gate reviewer interface, basic system health, manual feature flag toggle). **Phase 4 R39 expands this admin shell — Phase 4 does not introduce it.**
- Shopify read-only catalog sync (products + product images + brand colors used by image generation context)
- **Lovart-style billing** per https://www.lovart.ai/pricing — subscription + token metering + feature gating per tier (NOT lump-sum tokens; see Section 6 for pricing lock)

### 2.3 Phase 1B — Intelligence Foundation (CORPUS BUILD)

**Hard prerequisite for Phase 2.** Email Engine cannot ship without learned reference corpus. 23 features per Manus Inventory.

**Ships:**
- **R46 Email Ingestion** — IMAP via AgentMail. Brand provides email account; VIYO ingests inbound competitor/brand-of-interest emails. Stores in ATLAS Top Brain corpus.
- **R25 Video/IG Intelligence** — Ingests Instagram Reels + YouTube + uploaded MP4s (V1.2 hybrid OpenClaw model)
- **SYPHON ESP Data Ingestion** — Brand's own ESP data (Klaviyo segments, lists, performance)
- **MAAX Brand Memory** — Translates ATLAS corpus + SYPHON data into per-brand memory graph
- **HYVE Network** — Opt-in cross-brand pattern aggregation (anonymized only)

### 2.4 Phase 2 — Email Engine + Flows + Segments + Popups + Deliverability

**Absorbs Migma + Grid & Pixel core moats.** 220 features per Manus Inventory.

**Ships:**
- 13-Agent Brain Council activated (CMO + Audience + Offer + Copywriter + Image Design + Email Design + Critic + VeriClaw + Flow Strategy + SMS Copywriter + ATLAS + Smart Insight Engine + Contextual AI Advisor)
- Email Bible loaded (CMO Brain dependency)
- Composable sections + MJML compilation
- **Migma-style import** (Figma / HTML / Screenshot import + Remix from Phase 1B ingested corpus)
- Klaviyo deployment pipeline
- 12 specialized flows (Welcome, Cart, Browse, Win-back, VIP, Post-purchase, Birthday, Replenishment, Re-engagement, Pre-purchase, BFCM, Educational)
- Segments + audiences scaffolded
- Popups (Grid & Pixel surface)
- Deliverability + Magic Mail (Grid & Pixel surface)
- Automatic Suppression (Grid & Pixel surface)
- AI Klaviyo Audits (Grid & Pixel surface)

### 2.5 Phase 2.5 — Trust Layer + Brand Team Collaboration

**Absorbs Grid & Pixel Trust Layer + Migma collaboration surface.** 9 features per Manus Inventory.

**Ships:**
- Brand Chat (Slack-style threading, mentions, approvals — T33-T36)
- Generation session shareable URLs
- Team approval workflows (Approver / Editor / Viewer role differentiation)
- Activity feed
- Notification dispatch (in-app + email)

### 2.6 Phase 3 — Intelligence Studio (Hyper-Personalization)

**Absorbs Instant's moat.** 9 features per Manus Inventory.

**Ships:**
- Personalized copy per shopper
- Dynamic products
- Smart coupons
- Send-time optimization (per-recipient)
- Audiences (first-party data beyond cookies)
- Super Templates (auto-generated from validated patterns)
- LENZ analytics dashboard
- PULZE pattern surfacing
- Smart Insight Engine (5 scheduled generators)

### 2.7 Phase 4+ — Service Expansion + Admin Expansion

**13 features per Manus Inventory.** Additional ESPs, R39 admin expansion (impersonation, cross-tenant analytics, LLM token reconciliation, audit log surfaces), public REST API, self-hosted GPU activation thresholds (when economics hit), additional e-commerce platforms.

---

## Section 3 — Phase Sequencing Rules (NON-NEGOTIABLE)

1. **No phase skipping.** Each phase's competitor moat is structural. Skipping Phase 1B means Phase 2 ships without learned corpus = Migma absorption fails. Skipping Phase 2 means Phase 3 ships without flows = Instant absorption fails.

2. **Phase 1B is a hard prerequisite for Phase 2.** Email Engine without ingested corpus produces generic emails, defeating Migma's "Remix from competitor" surface.

3. **Phase 2.5 follows Phase 2.** Trust Layer cannot ship before the surfaces it gates exist.

4. **Phase 3 follows Phase 2.** Hyper-personalization requires Email Engine + Klaviyo deployment.

5. **Phase 4+ is opt-in expansion.** Triggered by economics or user demand, not date.

---

## Section 4 — Foundation Locks (LOCKED, RATIFIED)

The 14 Foundation Locks below govern the entire VIYO codebase. They are non-negotiable architectural commitments. Each lock cites VVOW Architecture or the specific decision that ratified it.

### 4.1 Locks 1-14 (per FOUNDATION_LOCK.md)

| Lock | Name | Summary |
|---|---|---|
| 1 | Product Sequencing | Phase 1 (Image Studio) → Phase 2 (Email Studio) → Phase 3 (LENZ). No skipping. |
| 2 | Unified GrapesJS Backbone | GrapesJS for Image Studio (Studio SDK tuning) and Email Studio (MJML plugin tuning). Forbidden: custom canvas. |
| 3 | Email Studio Output is JSON MJML Recipe | MAAX selects from 12 MJML templates, AI fills slots, mjml-core compiles. Forbidden: AI-generated raw HTML. |
| 4 | Single Image Generation Trace (T70 Cache-First) | Cache → Art Director Router → RLHF event → Brand Vault save with lineage + JSONB + pgvector. |
| 5 | Pattern DB + Pattern Recipe JSON Schema | Locked schema — style_system / shared_principles / variants / doodles / negative_prompts / replication_prompt_template. |
| 6 | Brand Vault Organization (Database-Driven) | R2 = bytes. `assets` table = lineage (`parent_asset_id`), JSONB metadata, pgvector search. Folder-based R2 forbidden. |
| 7 | 3-Tier Provider Strategy | Tier 1 aggregators (Atlas / fal.ai), Tier 2 direct, Tier 3 self-hosted (CapEx optimization, admin-gated). |
| 8 | Editing is Programmatic, NOT AI for Text/Color | B2 / B4 / B8 = 0 AI tokens. AI only for B1 / B3 / B5 / B7. |
| 9 | Implicit RLHF + Tinder Swipe Gate | Drag +1, export +5, regenerate -1. QA Bouncer. Tinder swipe sample: 50% approved + 20% rejected. VLM Preference Classifier replaces humans after 5,000 swipe decisions. |
| 10 | Brand-Specific LoRA Pipeline | After N validated patterns per brand, train LoRA. Cross-tenant training forbidden. |
| 11 | Pattern Seeding via Web Scraping | Milled (Puppeteer + Cheerio) → R2 → Claude Vision → Pattern Recipe → `image_prompt_patterns`. Distinct from R46 IMAP. |
| 12 | Brain Council Scope | VVOW uses Brain 5 + Brain 6. 13-Agent Roster = 7-Brain Council + VeriClaw + Flow Strategy + SMS Copywriter + ATLAS + Smart Insight Engine + Contextual AI Advisor. |
| 13 | Tenant Isolation via Supabase RLS | RLS on `brand_id` for every query. Service role key bypass forbidden for user-initiated operations. |
| 14 | Schema Changes via Canonical Migrations Only | Never patch via runtime code. |

### 4.2 Lock 15 (Planned, F-2)

**Tests Required.** All new features require behavioral tests before merge.

### 4.3 Lock 16 (Planned, F-2)

**Service Authorization Required.** No new external service usage without explicit PO approval.

### 4.4 Lock 17 — Foundation-First Decision Making (RATIFIED)

No patch work. Architectural conflicts are reconciled at source, not papered over. When two documents disagree, the lower-authority document is rewritten to align, not annotated to coexist.

### 4.5 Lock 18 — Tool-Capability-First Scoping (RATIFIED)

Audit existing tool capabilities before specifying any feature. Example: GrapesJS Studio SDK already provides Canva-tier capabilities for free; do not build custom what tooling already provides. The B-tool audit (Section 9 of session handoff) executed this rule and dropped 4 capabilities.

### 4.6 Lock 19 — Provider Agnosticism (RATIFIED)

No application code names a specific AI model, OCR provider, ESP, e-commerce platform, payment processor, embedding service, or other third-party service in business logic. All selections live in the Provider Routing plugin registry. The application calls `provider.execute(task)` and the registry resolves the actual provider for that task at runtime.

This applies to **all model classes** — image generation, image segmentation, image upscaling, OCR, text generation, embedding, vision, video, audio, ESP delivery, e-commerce sync, payment processing.

**Open documentation gap (see Section 8 below):** R29 PAL ZCBR (May 3) covers ESP / e-commerce abstraction but does NOT cover AI model routing. There is no R-spec for the AI Plugin Registry that Lock 19 depends on. Resolution path is to rewrite R29 PAL as a unified Plugin Registry covering both ESP and AI scopes.

---

## Section 5 — The 12 Agnostic Substrates

Each substrate is a horizontal capability layer. Phase 1, Phase 2, Phase 2.5, Phase 3, and Phase 4+ all consume the same substrate. Substrate is built in Phase 0, extended (never rebuilt) in later phases.

For each substrate: **scope** (what it is), **Phase 0 baseline** (what ships in Phase 0), **per-phase extensions** (what each later phase adds without rebuild), **anchoring evidence** (Manus Inventory feature counts that build it).

### L1 — Identity & Multi-Tenancy

**Scope.** Supabase Auth + Postgres RLS + workspace concept + role hierarchy (Owner / Admin / Approver / Editor / Viewer). Tenant isolation enforced at the database row level, not application code.

**Phase 0 baseline.** Supabase Auth project configured. RLS policies on every brand-linked table. Roles + permissions tables seeded. Multi-factor authentication scaffolded (SMS + email code methods). Service-role key bypass forbidden for user-initiated operations (Lock 13). 99 Phase 0/1 features build this substrate per Manus Inventory.

**Phase 1 extension.** Brand admin shell at app.viyo.com (signup, login, onboarding, workspace management, team invites + role assignment). Minimal admin shell at admin.viyo.com (tenant list + swipe-gate reviewer interface).

**Phase 1B extension.** PII redaction pipeline (regex masking before LLM calls) — feature P1-09.

**Phase 2 extension.** Mandatory MFA enforcement gate. Permission-aware UI (hide/disable based on role). Generation session state machine.

**Phase 2.5 extension.** Invite acceptance flows (existing user + new user). Team management page.

**Phase 4+ extension.** R39 admin expansion adds user impersonation + cross-tenant analytics surfaces.

**Anchoring features (sample, full list in Inventory):** P0-04 (83-table migrations), P0-05 (RLS policies), AUTH-02 (signup), PERM-01 through PERM-04 (role enforcement), MFA-01 / MFA-04 / MFA-05.

### L2 — Asset Model

**Scope.** Brand Vault organization driven by database, not folders. R2 stores bytes; the `assets` table stores lineage (`parent_asset_id`), JSONB metadata, and pgvector embeddings for semantic search. Lock 6 governs.

**Phase 0 baseline.** `assets` table with lineage, JSONB metadata, pgvector. R2 buckets `viyo-assets-production` + `viyo-assets-staging` configured. Custom domain `assets.viyo.email`. Versioning + lifecycle + signed URLs in place. 109 Phase 0/1 features build this substrate.

**Phase 1 extension.** Image Studio writes assets with full generation lineage (cache check → Art Director route → RLHF event → save with parent_asset_id). Layer Splitting pipeline writes editable text overlays as child assets (Lovart-style lazy extraction per Conflict Resolution C-01).

**Phase 1B extension.** R46 ingested emails write to assets table as ingested-corpus assets. R25 ingested videos write same. SYPHON ESP data writes as data assets.

**Phase 2 extension.** Email composable sections write as composite assets. MJML compiled output writes as deployment assets.

**Phase 2.5 extension.** Comment threads + mentions reference assets via foreign key (T45 composite DB foundation).

**Phase 3 extension.** Super Templates + Audiences read from same assets table (no separate storage).

**Anchoring features:** P0-04 (migrations), P0-14 (R2 + custom domain), DA-07 (allow_text_overlay toggle), T41-STYLE-LIBRARY, T56 (Super Template).

### L3 — Provider Routing

**Scope.** Plugin registry pattern formalized as Lock 19. Universal pattern covering AI models, OCR, ESPs, e-commerce platforms, payment processors, embedding services. Application calls `provider.execute(task)` and registry resolves the provider.

**Phase 0 baseline.** Plugin registry table + adapter interface (`PAL-01` Core adapter interface). E-commerce Data Model Normalizer (Shopify, WooCommerce, BigCommerce, Magento via PAL-03). Encryption helper for OAuth tokens (AES-256-GCM). 115 Phase 0/1 features build this substrate.

**Phase 1 extension.** Image AI providers registered (SAM 2 segmentation, Flux 1.1 Pro generation + inpainting, Real-ESRGAN upscale, Tesseract OCR). Atlas Cloud + fal.ai aggregators registered as Tier 1. Direct API providers (Ideogram, Nano Banana Pro, GPT Image, Seedream) registered as Tier 2. Cost monitor + threshold detector active.

**Phase 1B extension.** AgentMail registered as IMAP provider. Video ingestion providers registered.

**Phase 2 extension.** Klaviyo registered as primary ESP. Text generation providers registered for Brain Council. Embedding providers registered for Pattern DB matching.

**Phase 4+ extension.** Tier 3 self-hosted GPU activated when economics threshold hits (admin-gated, NOT auto-activated — Phase 1.5+ per Conflict Resolution C-05). Additional ESPs (ActiveCampaign, Brevo, Mailchimp, SendGrid) registered.

**R29 PAL gap (open).** R29 PAL ZCBR covers ESP + e-commerce only. AI Plugin Registry has no R-spec. Resolution path: rewrite R29 PAL as unified Plugin Registry covering both scopes. Pending in next session.

**Anchoring features:** PAL-01 (core adapter), PAL-03 (e-commerce normalizer), P1-03 (encryption helper), P0-11 (external account submissions).

### L4 — Job Orchestration

**Scope.** Inngest as outer orchestration + Mastra DAGs as inner brain composition. RLHF event emission baked into every step. Image generation pipelines today, email generation tomorrow, ingestion pipelines after.

**Phase 0 baseline.** Inngest worker on Render (`viyo-worker` + `viyo-worker-staging`). 3 Inngest environments (production, staging, branch). Mastra DAG framework. Step-level checkpointing. Shared Zod schemas (`packages/core-types`) for all brain I/O. 76 Phase 0/1 features build this substrate.

**Phase 1 extension.** Image generation DAG (cache check → routing → generation → RLHF event → asset save). Layer Splitting DAG (lazy, on edit click).

**Phase 1B extension.** R46 IMAP ingestion DAG. R25 video ingestion DAG. SYPHON daily sync DAG.

**Phase 2 extension.** 13-Agent Brain Council DAG (CMO → Audience → Offer → Copywriter → Image Design → Email Design → Critic → VeriClaw). Two-layer prompt architecture (Layer 1 static + Layer 2 dynamic injection per P2-17).

**Phase 2.5 extension.** Notification dispatch DAG. Approval workflow DAG.

**Phase 3 extension.** Super Template generation DAG. Audiences capture DAG. Smart Insight Engine generators (5 scheduled).

**Anchoring features:** P0-01 (Turborepo monorepo), P2-01 (Inngest worker setup), P2-13 (Mastra DAG orchestration), P2-17 (two-layer prompt).

### L5 — Data Flywheel

**Scope.** RLHF event taxonomy + qaScore propagation + `pattern_performance_metrics`. Phase 1 creates the events Phase 2 consumes. The data flywheel is the architectural reason VIYO compounds advantage over time.

**Phase 0 baseline.** `rlhf_events` table. `pattern_performance_metrics` table. qaScore column on assets. Event emission helpers in shared utilities. 27 Phase 0/1 features build this substrate.

**Phase 1 extension.** Implicit RLHF active per Lock 9 (drag +1, export +5, regenerate -1). Tinder Swipe Gate writes explicit reviewer events (50% approved + 20% rejected sample). QA Bouncer flags low-quality outputs.

**Phase 1B extension.** R46 ingestion writes to ATLAS corpus with provenance. SYPHON syncs ESP performance data into pattern_performance_metrics.

**Phase 2 extension.** A/B testing writes to RLHF events (20% split, 48h window). Performance Feedback Loop extracts winning formulas at 48h. Self-Learning Framework Wiring (EF-08).

**Phase 3 extension.** Top Brain Framework + Pattern Detection Stage (EF-68). LENZ surfaces patterns. PULZE dashboard.

**Lock 9 transition condition.** VLM Preference Classifier replaces human swipe gate after 5,000 reviewer decisions per brand. Same RLHF event schema continues; only the source agent changes.

**Anchoring features:** PIA-ART-DIR-01, PIA-FLOW-01, PIA-MAAX-01, V11-20 (Klaviyo flow analyzer), VF-49 (public REST API).

### L6 — Token Metering & Billing

**Scope.** Per-action token cost tracking with provider-cost-based markup + feature gating per tier. Lovart-style billing model (subscription + token consumption + feature gating per tier — NOT lump-sum tokens). Stripe is the payment processor, registered through L3.

**5-tier pricing (Notion D8 LOCKED):**

| Tier | Monthly | Token allocation | Multiplier |
|---|---|---|---|
| Free | $0 | 1M | 335,000 standard |
| Starter | $49 | 6M | 335,000 standard |
| Growth | $249 | 23M | 335,000 standard |
| Agency | $499 | 100M | 400,802 premium |
| Enterprise | $1,499 | 300M | 400,802 premium |

**Token economics rule (Conflict Resolution C-03 LOCKED):** AI calls metered, Sharp / PIL programmatic ops free (B2 / B4 / B8 = 0 tokens per Lock 8). GIF generation via Sharp / PIL inside B8 expanded scope is also 0 tokens since user already paid for source generations.

**Lovart-style billing per https://www.lovart.ai/pricing:** subscription baseline + token consumption metering + feature gating per tier. Higher tiers unlock Premium token multiplier (400,802 vs 335,000) + premium-tier features. Top-up packs available across all tiers.

**Phase 0 baseline.** `llm_usage_events` table. Cost tracking columns. Stripe webhook handler (idempotent, processed_stripe_events dedup). Token deduction RPC with row locking. 75 Phase 0/1 features build this substrate.

**Phase 1 extension.** Image generation token costs metered. Lovart billing UI (subscription tier select + token usage dashboard + feature gates). Token budget enforcement per brand.

**Phase 2 extension.** Email generation costs metered. Per-brain input limits enforced (P2-15). Two-layer prompt token accounting.

**Phase 4+ extension.** Self-hosted GPU activation triggers tier shift in cost calculation (CapEx amortization model). R39 admin gets LLM token reconciliation tools.

**Open scope question (Manus Q6):** Phase 0 billing infrastructure scope vs Phase 1 Lovart billing UI scope. **Resolution:** Phase 0 builds the metering substrate (tables, RPCs, webhook handler, Stripe integration). Phase 1 builds the user-facing billing surface (subscription UI, usage dashboard, feature gating UI). Both consume the same substrate.

**Open PO action item OD-001:** pricing reconciliation between deck slide 9 (`$99/$299/$499/$1,499`) vs Notion D8 locked (`$0/$49/$249/$499/$1,499`). Notion D8 is authoritative; deck must update.

**Anchoring features:** P2-18 (LLM usage event logging), P5-01 (Stripe webhook), T9-BILLING (Stripe Billing Foundation), P2-15 (token budget).

### L7 — Observability

**Scope.** Sentry + OpenTelemetry + PostHog + structured JSON logs + correlation IDs (`generation_id` trace context). Same instrumentation across all phases. Logs are queryable, alertable, traceable.

**Phase 0 baseline.** OpenTelemetry bootstrap with Datadog exporter and `generation_id` trace context (P0-03). Sentry projects configured (5 projects). PostHog integrated. Environment variable validation (t3-env / Zod, fail-fast at boot — P0-06). 117 Phase 0/1 features build this substrate.

**Phase 1 extension.** Image Studio events instrumented. RLHF events emit to PostHog. Sentry alerts on generation failures.

**Phase 1B extension.** Ingestion events instrumented. Corpus growth metrics tracked.

**Phase 2 extension.** Brain Council events instrumented. Email deployment events tracked. Deliverability events.

**Phase 4+ extension.** R39 admin surfaces metrics dashboards. Cross-tenant analytics.

**Standing rule:** Observability is built once. New features add new event types but never new observability stacks.

**Anchoring features:** P0-03 (OpenTelemetry), P0-06 (env validation), P5-14 (PostHog 8 events + feature flags), GATE-01 (branch protection — pre-launch gate).

### L8 — Real-time Substrate

**Scope.** Supabase Realtime (Broadcast + Presence + Postgres Changes). Image Studio collaboration today, Brand Chat tomorrow, Audiences live updates after.

**Phase 0 baseline.** Supabase Realtime enabled on production + staging. Channel naming convention. Presence tracking helpers. 62 Phase 0/1 features build this substrate.

**Phase 1 extension.** Live generation status streaming (image rendering progress). Live brand vault updates across team viewers.

**Phase 2.5 extension.** Threaded chat real-time. Mention notifications. Approval state changes.

**Phase 3 extension.** Audiences live counter. Smart Insight Engine generated insights pushed live.

**Anchoring features:** P0-14 (R2 + custom domain), P3-01 (MJML compiler), P3-07 (deploy preflight), TMS-01 (Cloudflare Worker scaffold).

### L9 — Storage

**Scope.** R2 with versioning, lifecycle policies, signed URLs, parent_asset_id-aware naming. Same store for all phases. Two buckets (production + staging).

**Phase 0 baseline.** R2 buckets created. Custom domain (`assets.viyo.email`) bound. Versioning + lifecycle policies configured. Signed URL helpers. 49 Phase 0/1 features build this substrate.

**Phase 1 extension.** Generated images stored with parent_asset_id structure. Layer Splitting child assets stored under parent.

**Phase 1B extension.** Ingested email HTML + images stored under ingestion-corpus prefix. Video files stored under video-corpus prefix.

**Phase 2 extension.** Compiled MJML output stored as deployment assets. Image CDN upload (compiled images to R2 with URL rewriting — P3-05).

**Phase 4+ extension.** Cross-region replication (when economics justify). R39 admin tools for storage reconciliation.

**ID-3 ratified:** Cloudflare R2 is canonical asset storage. Two buckets verified. Supabase Storage references in R21 are stale.

**Anchoring features:** P0-14 (R2 bucket + custom domain), SEC-02 (AES-256-GCM field-level encryption).

### L10 — Webhook Pipeline

**Scope.** Per Notion Decision 11 (May 3) — universal webhook architecture. Supersedes T48.

**Locked spec:**
- 7 retries exponential backoff (5s, 30s, 5m, 30m, 2h, 6h, 24h — ~33hr total)
- Signature verification via HMAC-SHA256
- Idempotent processing (dedup table: `processed_webhook_events`)
- Dead letter queue for unrecoverable failures
- Per-source rate limiting
- Webhook event types registered in plugin registry (treated same as provider adapters)

**Phase 0 baseline.** Webhook handler skeleton. Dedup table. DLQ table. Rate limit helpers. 31 Phase 0/1 features build this substrate.

**Phase 1 extension.** Shopify webhook handler registered (product updates, inventory changes).

**Phase 2 extension.** Klaviyo webhook handler (campaign sent, opened, clicked, bounced). Stripe webhook handler (payment events).

**Phase 4+ extension.** Additional ESP webhooks, e-commerce platform webhooks.

**Anchoring features:** P0-11 (external account submissions handler), Notion Decision 11 (canonical webhook architecture).

### L11 — Skill System Layer 1 — Tier 1 Builder Technical Skills

**For:** Architect / Reviewer / Kimi to consume at build/review time.

**Lives in:** Drive claude folder (`1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki`) authored by Architect Claude; uploaded to Portal product at ai.viyo.new via Portal admin UI; loaded at runtime via `skills.pickForTask()` API per D63 Path E (ratified 2026-05-11 + reaffirmed 2026-05-15). Skills do NOT live in any git repo. Currently 5 uploaded to Portal v1.0.0 (4 B-XC.07-10 + 1 B-XC.17 zcbr-spec-validation) since 2026-05-12; long-horizon Tier 1 target = 11 skills (B-0.13 baseline).

| # | Skill | Purpose |
|---|---|---|
| 1 | `database-migration` | Canonical Drizzle migration pattern |
| 2 | `inngest-function-authoring` | Inngest function structure + checkpointing |
| 3 | `hono-route-authoring` | Hono route + validation pattern |
| 4 | `pattern-recipe-validation` | Locked JSON Recipe schema validator |
| 5 | `writing-behavioral-tests` | Behavioral test pattern (input → output, not source-string) |
| 6 | `brand-vault-asset-write` | parent_asset_id lineage + JSONB + pgvector |
| 7 | `directive-authoring-v2` | Bullet directive structure |
| 8 | `ingestion-evidence-protocol` | Evidence file requirements |
| 9 | `§9-code-review-protocol` | Reviewer Claude protocol |
| 10 | `r-file-rewrite-pattern` | R-spec rewrite from thin baseline |
| 11 | `acceptance-message-template` | Closeout template ending in "Provide a Manus Project gate for me to publish it locally" |

**Phase 0 baseline (B-0.13 per MBS).** Tier 1 Builder Skills authored to Drive claude folder + uploaded to Portal product per D63 Path E. Currently 5 uploaded to Portal v1.0.0 (4 B-XC.07-10 + 1 B-XC.17 zcbr-spec-validation) since 2026-05-12; long-horizon target = 11 skills. Skill loading verified end-to-end via PORTAL-QA-05 across Claude / Kimi / Auto / Dual routes via `skills.pickForTask` API manual attachment per task. Skills do NOT live in any git repo per D63.

#### L12-B — AI Brain Pattern Skills

**For:** Email and image AI engines to consume at runtime.

**Lives in:** Airtable Skills Registry (109+ records) + `skills_registry` Postgres table for runtime queries.

**Two layers per Skill Routing Map (Drive ID `1psGtt41YPjw0oCx3KIuty8-Ny7EOAqKM`):**

- **Layer 1 — System / Platform Skills.** Orchestration layer. NOT in `skills_registry` table. Includes `self-improving-agent`, `memory-self-heal`, `clawhub` / `openclaw` orchestrators.
- **Layer 2 — Prompt Fragment Skills.** Injected dynamically into specific Brains by MAAX orchestrator. IS in `skills_registry` table.

**Brain assignments (per Skill Routing Map sections 27-339):**
- All Brains (utilities — runtime dependency, e.g. `credential_resolver`)
- All Creative Brains (utilities)
- Art Director Brain (image gen — `image_pipeline_router`)
- CMO Brain (doctrines, niches, seasonals)
- Copywriter Brain (frameworks, patterns, tones)
- Critic Brain (deliverability)
- Designer Brain / Email Personalization
- Email Design Brain (formats, infographics, patterns)
- Image Design Brain (image router)
- Offer Brain (sales)
- Top Brain (attribution, learning loops, recovery)
- Visual Router Brain (image utilities)

**Phase mapping per Skill Routing Map (skills route by Brain, not by build phase):**

- **Phase 1 active skills:** Image-related Brain skills load — `image_pipeline_router`, Pattern DB caching skills, Visual Intent Router skills, Art Director routing skills, `credential_resolver` (all brains, runtime utility), `esp_klaviyo_adapter` (scaffold only — no runtime use yet), niche fragment skills (used at brand onboarding for image style context), vertical doctrines for image generation (`fashion_doctrine`, `beauty_doctrine`).
- **Phase 2 active skills:** Email Brain skills load — all copywriter frameworks (PAS, AIDA, BAB, FAB, QUEST, PASTOR, Star-Story, Three Reasons, Offer Reveal), all tone modifiers (welcome, urgency, holiday warmth, post-purchase, vip, winback, browse abandonment, cart abandonment, educational, re-engagement), all format enforcers (single product, grid, lookbook, newsletter, plain text, gift guide, flash sale, comparison, testimonial, editorial, announcement, product launch), procurement-pending skills (`copywriting-pro`, `sales-mastery`, `email-best-practices`), `mjml_section_resolver`, full Klaviyo deployment skills.
- **Phase 3 active skills:** Top Brain skills load — attribution, orchestration learning loop, recovery and wrapper layer.

**Phase 0 baseline for L12-B.** `skills_registry` table seeded with 6 core skills (P0-07). Layer 1 platform skills wired (self-learn, self-heal, memory, Clawhub) but NOT in `skills_registry`. Skill injection rules + token budgeting authored. Admin Portal skill registry management UI scaffolded (P5-08).

**Anchoring features:** P0-07 (skills_registry seed), P2-17 (two-layer prompt — Layer 1 static + Layer 2 dynamic injection), V11-25 (occasion tagger), VF-44 (skill versioning + rollback), DA-13 (weekly doctrine.bible.sync cron).

**Open question (Manus Q8): Platform Skills not in skills_registry.** Per Q128 PO decision, Layer 1 Platform Skills are NOT in `skills_registry` table. But Build Tracker has them as features. **Resolution:** Phase 0 substrate includes the Platform Skill execution layer separately from `skills_registry`. The execution layer is referenced by Layer 2 prompt fragment skills via injection rules but stored elsewhere (orchestrator code, not registry table).

---

## Section 6 — Ratified Conflict Resolutions (LOCKED, NOT RELITIGATED)

### C-01 — Studio Editing Text Edit (Lovart-style)

AI generates the image with text baked in at full photorealistic quality. After generation, the Layer Splitting pipeline (B3) extracts the text region using SAM 2 + OCR + Flux 1.1 Pro inpainting. Extracted text becomes editable overlay. Lazy extraction — only triggered when user clicks to edit. Initial generation = tokens (Tier 1 model). Edits = zero AI tokens. Original asset stays pristine in R2.

**PO verbatim ratifications:**
1. "Yes, do what Lovart does"
2. "Always lazy extract — we are charging by token consumption, not by how many images"
3. "this is the only way for example to get high quality compositional posters made via LLM image editing orchestration"

### C-02 — Provider Plugin Registry

All AI model selection via registry table. Foundation Lock 19 formalizes this.

### C-03 — Token Economics: Programmatic Ops Are Free

AI calls metered, Sharp / PIL programmatic ops free. Aligned with Quick Edit B8 = 0 tokens (Lock 8).

### C-04 — Empirical Scoring Matrix

Art Director Router scoring populated via Tinder Swipe Gate + RLHF events. Architect Claude responsibility to spec research methodology, NOT pre-decide scores. Supersedes T46's pre-baked 4D formula with fixed 0.4 / 0.3 weights.

### C-05 — Best-in-Class First Tier Strategy

- Phase 1: Tier 1 aggregators (Atlas Cloud + fal.ai peers) + Tier 2 direct API (Ideogram / Nano Banana Pro / GPT Image when proprietary models needed)
- Tier 3 self-hosted L40S / A100 = **Phase 2 / 3 / 4 economics-triggered, ADMIN-GATED notification + approval, NOT auto-activated** (corrected from "Phase 1.5 mandatory" — see Section 7).
- Cost monitor + threshold detector required Phase 1.

### C-06 — Brand Chat Split

- **Design Chat** = Phase 1 (VVOW canonical, conversational generation in Zone 1) — IN
- **Team Chat** (Slack-style approvals / mentions) = Phase 2.5
- Phase 1 only includes manual `#tagging` into Brand Vault tags array (per VVOW §11.4)

### C-07 — Webhook Architecture

Resolved per Notion Decision 11 — supersedes T48. See Section 5 L10 above for full spec.

---

## Section 7 — Tier Strategy & Self-Hosted Activation

### 7.1 Three-tier model

| Tier | Scope | Phase 1 status |
|---|---|---|
| **Tier 1** | Aggregators — Atlas Cloud + fal.ai. "Best for the job" routing. | Launch primary |
| **Tier 2** | Direct API for proprietary models — Ideogram, Nano Banana Pro, GPT Image, Seedream, Flux 1.1 Pro. | High-complexity escalation |
| **Tier 3** | Self-hosted L40S / A100 GPU — RunPod / Thunder Compute. CapEx-optimized. | NOT Phase 1 default |

### 7.2 Self-hosted activation rule

**LOCKED:** Self-hosted GPU is **economics-triggered, admin-gated, NOT auto-activated**.

- Activates at 6,700 imgs / month threshold for L40S ($202 / month CapEx)
- Activates at 18,700 imgs / month threshold for A100 80GB ($562 / month CapEx)
- Phase 2 / 3 / 4 — whenever thresholds hit, not Phase 1.5 mandatory
- Cost monitor in Phase 1 detects threshold approach and notifies admin
- Admin must explicitly approve activation (no auto-spin-up)

### 7.3 Tier number convention (LOCKED)

Per VVOW (May 8). T46 v6.1 (April) had inverted Tier numbers (Tier 1 = direct, Tier 2 = aggregator). VVOW supersedes:

- **Tier 1 = aggregators** (Atlas / fal.ai) — default path
- **Tier 2 = direct API** (proprietary models)
- **Tier 3 = self-hosted GPU** (CapEx optimization)

T46 to be rewritten to align in next session.

---

## Section 8 — Open Documentation Gaps

### 8.1 R29 PAL — AI Plugin Registry has no R-spec (CRITICAL)

VVOW Architecture §8.7 says "All routing via R29 PAL Plugin Registry" and CODING_CONVENTIONS Rule 7 says the same. **But R29 PAL ZCBR (May 3) is the ESP / e-commerce Platform Abstraction Layer (Klaviyo, Shopify, Mailchimp, BigCommerce connectors).** It does NOT cover AI model routing.

**There is NO R-spec for the AI Plugin Registry that Lock 19 (Provider Agnosticism) depends on.**

**Resolution path (proposed Option C):** Rewrite R29 PAL as unified Plugin Registry covering BOTH ESP and AI registries. One architectural pattern, two scopes (ESP scope + AI scope). To be confirmed in next architecture session.

### 8.2 R20, R24, R31 still THIN even after ZCBR rewrite

Per VVOW Architecture audit. Must be rewritten.

### 8.3 R28 Timer Service deferred but spec live in repo without deferral header

Needs deferral header per ID-4.

### 8.4 R52 Disaster Recovery anomalously 334 KB

Quality unverified. Sample before trusting.

### 8.5 Two Builder Instructions Sheets in ZCBR folder

`Builder_Instructions_Sheet_ZCBR.md` (17.8 KB) and `Builder_Instructions_Sheet_ZCBR_V5_FINAL.md` (8.1 KB). Reconcile canonical.

### 8.6 Phase 2 / 3 specs inventoried but not read fully

R32 Email Engine (38 KB), R36 HYVE (25 KB), R37 MAAX (11 KB), R38 SYPHON (10 KB), R46 Email Ingestion (15 KB).

---

## Section 9 — Reference Documents (Canonical)

### 9.1 In-repo

| Document | Path | Authority |
|---|---|---|
| CLAUDE.md | `/docs/governance/CLAUDE.md` | Project entry point |
| FOUNDATION_LOCK.md | `/docs/governance/FOUNDATION_LOCK.md` | 14 existing locks |
| **FOUNDATION_AUTHORITY.md** | `/docs/governance/FOUNDATION_AUTHORITY.md` | This document |
| CURRENT_STATE.md | `/docs/governance/CURRENT_STATE.md` | Current build state snapshot |
| CODING_CONVENTIONS.md | `/docs/governance/CODING_CONVENTIONS.md` | 14 rules |
| OPEN_DECISIONS.md | `/docs/governance/OPEN_DECISIONS.md` | Open PO decisions |
| PRODUCT_ROADMAP.md | `/docs/governance/PRODUCT_ROADMAP.md` | Phase plan operational view |
| INFRASTRUCTURE_DECISIONS.md | `/docs/governance/INFRASTRUCTURE_DECISIONS.md` | ID-1 through ID-6 ratified |
| VVOW_IMAGE_STUDIO_ARCHITECTURE.md | `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` | Phase 1 canonical spec |
| webhook-pipeline.md | `/docs/architecture/webhook-pipeline.md` | T48 (superseded by Decision 11) |
| art-director-routing-suite.md | `/docs/architecture/art-director-routing-suite.md` | T46 (rewrite pending) |
| studio-editing-tools.md | `/docs/architecture/studio-editing-tools.md` | T47 |
| brand-chat-comments-subsystem.md | `/docs/architecture/brand-chat-comments-subsystem.md` | T33-T36 (Phase 2.5 deferred) |

### 9.2 External canonical sources

| Source | Location | What it provides |
|---|---|---|
| **Notion VIYO Decision Log** | https://www.notion.so/VIYO-Decision-Log-and-QA-Tracker-3559a84a46798194946ef8fc5479e4c2 | Master decision record. Live count + ID range queryable in Notion at the URL; canonical state is the DB itself. |
| **Airtable VIYO Base** | `appo5mNncCCzKcIRk` | Q&A Master Log (~200), Build Tracker (580), Skills Registry (109+), Services Inventory (27), Architecture Broadcasts (6) |
| **Manus Master Architectural Atlas V1.0 EXHAUSTIVE** | https://drive.google.com/file/d/1DLhFqf3SwEE9NRpDr-m20iKWIQ7gE3M1/view | 17.3 MB / 580 records / 165 docs / 715 technical files / 88 Task Master tasks — feature inventory |
| **Manus Skill Routing Map** | https://drive.google.com/file/d/1psGtt41YPjw0oCx3KIuty8-Ny7EOAqKM/view | 109 skills mapped per Brain — Layer 1 / Layer 2 architecture |
| **Manus VIYO Feature Inventory By Phase** | https://drive.google.com/file/d/1dMRjPj2vYU46C2YzA5okvDUSpcpzNa2S/view | 580-feature re-mapping Build Tracker → VIYO phases (polish v002 in flight) |
| **VIYO Drive Knowledge Synthesis** | https://drive.google.com/file/d/1z1CtDmf0PwC0MvufADnKYVPq96W_EQ3X/view | 22 of 80 docs read (other Claude session) |
| **V8 PRD folder** | Drive `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` | V8 PRD compilation |
| **ZCBR R-files folder** | Drive `1duV346EV6D8n2cUqO0xW-oGgmq5o3bcI` | 37 ZCBR specs (May 3 foundational rewrite) |

---

## Section 10 — Update Authority

This document is updated by **Architect Claude only**, with PO ratification logged in the Notion VIYO Decision Log per standing rule (Section 20 of session handoff).

Each update produces:
1. Diff against previous version (what changed, why, source decision)
2. New version commit by Manus to `/docs/governance/FOUNDATION_AUTHORITY.md`
3. Notion VIYO Decision Log entry: date, decision text, rationale, trigger conversation, source, status
4. CLAUDE.md authority hierarchy line updated if hierarchy changes

This document does NOT get edited by Manus directly. Manus may flag issues in directives but the rewrite is authored by Architect Claude.

---

## Appendix A — Open PO Decisions (Blocking Items)

| ID | Decision | Blocks | Status |
|---|---|---|---|
| OD-001 | Pricing reconciliation (deck slide 9 `$99/$299/$499/$1,499` vs Notion D8 locked `$0/$49/$249/$499/$1,499`) | Public launch, investor materials | Open |
| OD-002 | Legal review on Milled / Email Love / Really Good Emails scraping | Pattern Seeding pipeline expansion | Open |
| OD-003 | Atlas Cloud + fal.ai catalog verification (exact models, pricing, rate limits) | Phase 1 acceptance, T73 gates | Open |
| ~~OD-004~~ | [Historical row: prior "12 fashion brand competitor selection for Pattern Seeding" framing OBSOLETE — current canonical OD-004 per Notion + PRD V8.1 §8.1 = R29 PAL Rewrite Scope, CLOSED 2026-05-15 via R29 v2 ZCBR-PASS Iα. Fashion-brand selection question dissolved into Phase 1B / Pattern Seeding scope per VVOW §10.4.] | n/a | CLOSED 2026-05-15 |
| OD-005 | 3 Swipe Gate reviewer accounts (`SWIPE_REVIEWER_USER_IDS` env var) | Phase 4 RLHF acceptance | Open |
| OD-006 | Anthropic Console spend cap = $100 / month | Cost control | Open |
| OD-007 | Conversation export cadence | Continuity / record-keeping | Open |
| OD-008 | Lovart license / TOS | (CLOSED 2026-05-08 — internal architectural reference only, no IP reuse) | Resolved |

---

## Appendix B — Deferred Items

| ID | Item | Reason |
|---|---|---|
| DEFERRED-001 | BFCM Module | No R-spec, no PRD section. Deferred 2026-05-03. |
| DEFERRED-002 | GPT Image 3 Full-Email Research | Source IG reel cited. Architect to produce options memo. |

---

## Appendix C — Three Authority Waves (Historical Context)

Documents in the corpus arrived in three waves of differing quality and authority:

1. **April 24-28, 2026** — V4 PRD base, Doc 1-11 series, V5 / V6 addendums, Architecture Lock V7, four Sprint 2 Architecture Locks (T46 / T47 / T48 / T33-T36). Deep implementation thinking, mostly superseded.
2. **May 3, 2026** — ZCBR Foundational Rewrite (37 R-specs + 6 standalone + 3 prompting + master files). Built to "Zero-Clarification Builder-Ready" standard. R20 / R24 / R31 still flagged thin. R46 IMAP-only.
3. **May 4-8, 2026** — V8 PRD compilation + VVOW Architecture v2.0 + governance wave + this document. Current canonical authority.

---

## Appendix D — Acceptance Criteria for FOUNDATION_AUTHORITY.md

This document is considered ratified when:

1. PO confirms read and approves
2. Manus commits to `/docs/governance/FOUNDATION_AUTHORITY.md` on a feature branch
3. Branch merged to main per deploy protocol
4. Notion VIYO Decision Log entry created with verbatim authority hierarchy line
5. CLAUDE.md updated to reference this document at authority tier 3

---

*End of FOUNDATION_AUTHORITY.md*
