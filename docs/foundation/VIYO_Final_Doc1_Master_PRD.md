# VIYO — V1 Master PRD & Build Guide (Version 4)

**Status:** V4 — Canonical Build Document  
**Date:** April 2026  
**Revision:** Consolidates all Q17–Q34 specification docs, V1/V2/V3 PRDs, and session gap analysis into one authoritative source. Every conflict identified in prior versions is resolved here.

---

# PART A — MASTER PRD (Engineering Build Guide)

---

## 1. Executive Summary

VIYO is an AI-powered Email Creative Operating System for Shopify + Klaviyo e-commerce brands — primarily fashion, lifestyle, and apparel. It replaces email designers, copywriters, and agencies by automating the complete creative pipeline: brand brief → multi-agent strategy → copy → image → layout → compiled HTML → Klaviyo deployment.

**Core promise:** A complete, send-ready campaign draft in under 60 seconds.

**What makes it architecturally distinct:**
- A 7-brain Council of specialized AI agents (not one monolithic prompt)
- Two-layer prompt architecture (hardcoded system prompt + dynamic runtime injection)
- Deterministic MJML compilation — no AI touches the final HTML
- Token-based prepaid billing (1 Token = 1 Campaign, no automatic overages)
- Strict tenant isolation via Supabase Row Level Security on every table

**V1 scope:** Single campaign generation, Shopify/Klaviyo OAuth, MJML email compilation, Stripe Top-Up billing, Admin Portal.

---

## 2. Product Goals and Non-Goals

### Business Goal
Establish VIYO as the premier AI email marketing tool for e-commerce. Reduce campaign creation from hours to under 60 seconds while maintaining agency-level quality.

### User Goal
Empower brand marketers and founders to generate high-converting, brand-aligned emails without needing a copywriter, designer, or developer.

### Operator Goal
Maintain a stable, observable, and cost-efficient platform with strict tenant isolation and predictable LLM token economics.

### AI System Goal
Orchestrate specialized AI agents to execute discrete marketing tasks deterministically — preventing hallucination and ensuring structural integrity through a Platform Abstraction Layer.

### V1 Non-Goals (explicitly out of scope)
- Multi-step automated flow generation (Welcome Series, Abandoned Cart)
- Direct integration with ESPs other than Klaviyo
- Unbounded web scraping or competitor analysis beyond manual Admin ingestion
- A custom ground-up HTML email compiler (VIYO wraps mjml-core)
- Subscription billing with automatic overages — hard stop at 0 tokens

### V1.1 Future Expansion (same codebase, feature-flagged)
- Automated competitor newsletter ingestion via IMAP (AgentMail)
- A/B testing generation and deployment
- Multi-step Klaviyo flow generation
- Panoramata API integration (adapter scaffolding only in V1)

---

## 3. Personas and System Actors

### Human Actors

**Merchant / Marketer (Primary User)**
- Who: E-commerce brand owner or in-house marketer managing a Shopify store + Klaviyo account
- What they do: Connect integrations, submit campaign briefs, review generated drafts, deploy to Klaviyo
- Pain they have: Campaign creation takes hours of coordination with designers and copywriters
- What VIYO gives them: One-sentence brief → complete campaign in 60 seconds

**Admin / Support Operator (Internal VIYO Staff)**
- Who: VIYO internal team member
- What they do: Monitors system health via Admin Portal, manages the skill registry, issues token refunds, investigates failed generations, uploads competitor emails to feed the Top Brain
- Access level: `role = 'admin'` in the users table, bypasses RLS via service role key after `requireAdmin()` middleware verification

**Engineering / Internal Ops**
- Who: VIYO engineers
- What they do: Maintains the platform, monitors Datadog, deploys infrastructure updates, runs database migrations
- Access level: Direct Supabase + Render access, not through the application UI

### System Actors

**Orchestrator (Conductor)**
- A deterministic TypeScript state machine powered by Inngest
- Routes data between brains, manages the generation DAG, handles retries and step-level checkpointing
- Lives on: Render worker

**Council of Brains**
- Seven specialized AI agents (CMO, Offer, Email Design, Image Design, Copywriter, VeriClaw, Critic)
- Each receives specific inputs, outputs a strictly validated JSON schema
- Lives on: Render worker (Mastra DAG inside Inngest step.run() blocks)

**Top Brain**
- A vector-based intelligence layer analyzing competitor emails and historical performance
- Informs the CMO Brain with macro trends and winning formulas
- V1: Manual upload via Admin Portal
- Lives on: Render worker (nightly Inngest job)

**Workers (Render)**
- Persistent Node.js Docker containers
- Execute all heavy compute: Mastra DAG, MJML compilation, image generation, integration syncing
- Why Render and not Vercel: Vercel serverless functions have a 15-second timeout — LLM chains and image generation take 30-60 seconds

**Vercel API (Backend Proxy)**
- Lightweight serverless functions
- Validates incoming payloads (Zod), reads/writes to Supabase, emits events to Inngest
- Strictly respects 15-second timeout — no heavy compute happens here

**External Providers**
- Multi-Model Council (Claude 3.5, GPT-4o, Gemini 3.1): CMO, Copywriter, Critic, Image Design, Audience brains
- Google Vertex AI (Gemini 3 Pro Image Preview): Hero image generation (NanoBanana engine)
- Google Gemini 2.5 Flash: VeriClaw validator, Email Design Brain, non-critical fallback
- Shopify: Product catalog, inventory, order data
- Klaviyo: Audience segments, campaign deployment, performance metrics
- Stripe: Checkout, payment processing, webhook events

---

## 4. End-to-End User Journeys

### Journey 1: Signup and Onboarding

**Who:** New merchant visiting viyo.email for the first time  
**Trigger:** User clicks "Get Started" on the landing page  
**Steps:**
1. User authenticates via Supabase Auth (email/password or magic link)
2. Supabase Auth creates a record in `auth.users`
3. A database trigger or the onboarding API route creates matching records in `brands` and `users` tables
4. User completes brand setup: name, industry (vertical), website URL
5. System sets `brands.setup_step = 'integrations'`

**Backend touched:** `brands`, `users`, `verticals`, `brand_verticals`  
**Frontend route:** `/onboarding`  
**Final state:** Brand profile exists, user redirected to Integrations setup

---

### Journey 2: Connecting Integrations

**Who:** Merchant completing onboarding  
**Trigger:** User navigates to Settings > Integrations  
**Steps:**

**Shopify:**
1. User clicks "Connect Shopify", enters their `.myshopify.com` domain
2. Frontend calls `GET /api/v1/auth/shopify/initiate?shop={domain}`
3. API generates a state nonce (stored in Upstash Redis with 10-minute TTL), constructs the Shopify OAuth URL
4. User is redirected to Shopify authorization screen
5. Shopify redirects back to `GET /api/v1/auth/shopify/callback?code=...&hmac=...&shop=...&state=...`
6. API validates HMAC signature and state nonce
7. API exchanges code for offline access token (with `expiring=1` for rotating tokens)
8. Token is AES-256-GCM encrypted using `ENCRYPTION_KEY`, stored in `shopify_connections`
9. Inngest fires `shopify.sync.initial` event — worker fetches products and stores in `products` table
10. UI shows "Connected" status

**Klaviyo:**
1. User clicks "Connect Klaviyo"
2. Frontend calls `GET /api/v1/auth/klaviyo/initiate`
3. API generates PKCE `code_verifier` (random 43-128 char string), computes `code_challenge` (SHA256 base64url), stores verifier in `klaviyo_pkce_store`
4. API constructs Klaviyo OAuth URL with `code_challenge` and `code_challenge_method=S256`
5. User is redirected to Klaviyo authorization screen
6. Klaviyo redirects back to `GET /api/v1/auth/klaviyo/callback?code=...`
7. API retrieves `code_verifier` from `klaviyo_pkce_store`, exchanges code for tokens
8. Access and refresh tokens encrypted and stored in `klaviyo_connections`
9. Inngest fires `klaviyo.sync.initial` — worker fetches segments and stores in `audience_map`
10. Worker also dynamically fetches and stores account-specific `klaviyo_click_metric_id` and `klaviyo_order_metric_id` in `brands` table (required for STO)

**Backend touched:** `shopify_connections`, `klaviyo_connections`, `klaviyo_pkce_store`, `products`, `audience_map`, `brands`  
**Why this matters:** Both tokens must be encrypted at rest. The PKCE flow prevents authorization code interception attacks. The Klaviyo metric IDs are account-specific UUIDs and cannot be hardcoded.

---

### Journey 3: Campaign Generation

**Who:** Connected merchant  
**Trigger:** User clicks "New Campaign", fills out brief form (intent, target segment, selected products)  
**Steps:**
1. User submits brief form
2. Frontend calls `POST /api/v1/campaigns/generate` with brief payload
3. API validates payload (Zod schema), checks `brands.token_balance > 0`
4. If balance = 0, return 402 immediately — no token deducted, no generation started
5. API creates `campaign_sessions` record with `status = 'queued'`
6. API **reserves** 150,000 tokens (estimated cost): inserts `billing_usage` record with `transaction_type = 'reserved'`, decrements `brands.token_balance` by 150000
7. API emits `campaign.generate` Inngest event with `{ sessionId }`
8. API returns `{ sessionId }` to frontend immediately (within 15-second limit)
9. Frontend subscribes to Supabase Realtime on `campaign_sessions` filtered by `id = sessionId`
10. Orb progress indicator displays, polling `current_phase` updates from Realtime
11. Render worker receives `campaign.generate` event, executes Mastra DAG (7 brains, 30-60 seconds)
12. Each brain completion updates `campaign_sessions.current_phase` via Supabase → triggers Realtime push to frontend
13. On DAG completion: compiled HTML stored in `assets`, token reservation **committed** (`billing_usage.transaction_type = 'deduction'`)
14. On DAG failure: token reservation **refunded** (`billing_usage.transaction_type = 'refund'`, `brands.token_balance` incremented)
15. Frontend receives final status, renders Preview UI with the compiled email

**Backend touched:** `campaign_sessions`, `brain_outputs`, `credit_ledger`, `assets`, `brands`, `llm_usage_events`  
**Critical rule:** Token is reserved before generation starts. If generation fails for any reason, it is refunded. A token is only committed on success (or `partial` — where core text succeeded but a non-critical asset like hero image failed).

---

### Journey 4: Draft Review and Publish

**Who:** Merchant reviewing a completed generation  
**Trigger:** User sees the Preview UI with the generated email  
**Steps:**
1. User reads the generated subject line, preview text, body, and hero image
2. If tweaks needed: User types in the chat interface (Intent Router routes to the correct brain for targeted regeneration)
3. Each edit logs an `editor_events` record
4. User clicks "Deploy to Klaviyo"
5. Frontend calls `POST /api/v1/campaigns/{sessionId}/deploy`
6. API calls Klaviyo 3-step deploy sequence via Render worker:
   - Step 1: `POST /api/klaviyo/v1/email-templates` — creates Klaviyo template from compiled HTML
   - Step 2: `POST /api/klaviyo/v1/campaigns` — creates campaign with template ID
   - Step 3: `POST /api/klaviyo/v1/campaign-send-jobs` — schedules or sends immediately
7. Campaign status updated in Klaviyo, `campaign_sessions.status = 'deployed'`
8. PostHog event `deployed_to_klaviyo` fired

**Backend touched:** `campaign_sessions`, `editor_events`, Klaviyo API  
**Final state:** Email is live in Klaviyo, ready to send or scheduled

---

### Journey 5: Retry / Resume on Failure

**Who:** System (automatic), with notification to merchant  
**Trigger:** A generation fails due to a transient error (LLM API timeout (Claude/OpenAI/Gemini), Render OOM)  
**Steps:**
1. Inngest detects step failure, automatically retries the failed step up to 3 times with exponential backoff
2. If all retries fail: `campaign_sessions.status = 'failed'`, token refunded
3. `notifications` table receives a new record: severity = 'error', message = "Your campaign generation failed. Your token has been refunded."
4. Supabase Realtime pushes notification to frontend
5. Bell icon in header shows red badge
6. User opens Notification Center (slide-out drawer), sees the failure explanation and "Retry" button
7. If user retries: new `campaign_sessions` record created, new token reserved, DAG starts from scratch (Inngest checkpointing means successful prior steps in the same run are skipped, but a new run starts clean)

---

## 5. System Architecture

VIYO is a strictly bifurcated, event-driven system designed for high concurrency and deterministic AI orchestration.

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│         Vite React SPA (deployed on Vercel)              │
│  - TanStack Router (client-side routing)                 │
│  - Zustand (UI state)                                    │
│  - Supabase Realtime (WebSocket for progress)            │
│  - PostHog (analytics + feature flags)                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│              VERCEL SERVERLESS API                        │
│  /api/v1/* routes (max 15-second timeout)                │
│  - Zod payload validation                                │
│  - Supabase JWT verification (every request)             │
│  - Read/write Supabase (Drizzle ORM)                     │
│  - Emit events to Inngest                                │
│  - NEVER executes heavy compute                          │
└──────────────────────┬──────────────────────────────────┘
                       │ Inngest Events
┌──────────────────────▼──────────────────────────────────┐
│              RENDER WORKER (Docker, persistent)           │
│  - Express server exposing /api/inngest endpoint         │
│  - Inngest functions with step-level checkpointing       │
│  - Mastra DAG (7-brain orchestration)                    │
│  - MJML compilation (viyo-mjml-engine)                   │
│  - Imagen 4 calls (NanoBanana)                           │
│  - Shopify/Klaviyo sync jobs                             │
│  - STO nightly computation                               │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼────┐ ┌──────▼──────┐
│   SUPABASE   │ │CLOUDFLARE│ │  UPSTASH    │
│  PostgreSQL  │ │    R2    │ │   REDIS     │
│  + pgvector  │ │ (images/ │ │(rate limit/ │
│  + Auth      │ │  HTML)   │ │OAuth nonce) │
│  + Realtime  │ └──────────┘ └─────────────┘
└──────────────┘
```

### Infrastructure Decision Rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Frontend runtime | Vite React SPA | Full control over bundling, no SSR overhead for a dashboard-style app |
| API layer | Vercel Serverless | Zero ops, scales to zero, 15s timeout is sufficient for proxy operations |
| Worker runtime | Render (Docker) | Persistent process required — LLM chains + image gen take 30-60s |
| Job orchestration | Inngest | Durable step-level checkpointing; if worker crashes mid-DAG, resumes from last checkpoint |
| AI orchestration | Mastra (TypeScript DAG) | Type-safe, testable, runs inside Inngest step.run() blocks |
| Database | Supabase PostgreSQL | Native RLS for tenant isolation; Realtime for WebSocket progress; pgvector for embeddings |
| Auth | Supabase Auth | **Must be Supabase Auth** — integrates natively with RLS. Better Auth is incompatible with Supabase RLS |
| Image storage | Cloudflare R2 | S3-compatible, no egress fees, global CDN via `assets.viyo.email` custom domain |
| Caching | Upstash Redis | Serverless Redis — ideal for short-lived OAuth nonces and rate limiting |
| Observability | OpenTelemetry → Datadog | Distributed tracing across Vercel/Render boundary via `generation_id` |
| Analytics | PostHog | Product events + feature flags for V1.1 gated features |
| Transactional email | Resend | Reliable deliverability, clean API, no infrastructure overhead |

---

## 6. Feature and Subsystem Inventory

### Core Backend / Platform Systems

**Job Orchestration (Inngest + Mastra)**
- Purpose: Manages execution of the multi-agent generation DAG
- Why it exists: LLM calls and image generation take 30-60 seconds, far exceeding serverless timeouts. Durable orchestration manages state, retries, and step-level checkpointing
- Who uses it: System (no direct user interaction)
- Where it lives: Render worker
- When it runs: Every time a campaign brief is submitted
- Failure modes: Worker crash (Inngest re-queues on healthy instance from last checkpoint), API timeout (Inngest retries step up to 3 times)
- V1: ✅

**Email Compilation Pipeline (viyo-mjml-engine)**
- Purpose: Converts Email Design Brain's JSON schema into responsive, Gmail-safe HTML
- Why it exists: LLMs cannot reliably write raw MJML or HTML without syntax errors. The compiler is deterministic — no AI at render time
- Who uses it: System (called by Render worker after Email Design Brain completes)
- Where it lives: `packages/mjml-compiler/` in the monorepo, imported by Render worker
- When it runs: Phase 3 of every generation DAG
- Failure modes: Malformed JSON input → `ClippingError` if compiled HTML > 75KB
- V1: ✅

**Multi-Model Visual Generation Engine (NanoBanana + Ideogram + Imagen)**
- Purpose: Generates bespoke, brand-aligned hero images, typographic layouts, and UI mockups
- Why it exists: Different creative concepts require different models. Gemini excels at photorealistic product lifestyle shots, while Ideogram 3.0 is required for text-heavy graphics, UI mockups, and pattern-interrupt concepts (like fake text messages).
- Who uses it: System (Image Design Brain's Visual Intent Router classifies the brief and routes to the correct model)
- Where it lives: Render worker
- When it runs: Phase 2 of every generation DAG (parallel with Copywriter Brain)
- Models: `gemini-3.1-flash-image` (product/lifestyle), `ideogram-3.0-turbo` (text/UI), `imagen-4` (upscaling)
- Agency tier V1.1: `gemini-3-pro-image-preview` (high-res)
- Cost: ~$0.030/image
- Failure mode: Non-fatal — if image generation fails, session status becomes `partial`, token still committed, UI shows placeholder with warning
- V1: ✅

### Section 6.6: The Compositing Pipeline

The Image Generation architecture uses a three-step pipeline to ensure pixel-accurate product preservation. The model uses the product image as a visual reference, with a compositing post-pass to restore pixel-accurate product details on top of the generated scene.

1. **Style extraction pre-pass:** Gemini 2.5 Flash vision call extracts structured JSON style spec (brand_color, headline_font, cta_shape) from the reference image. Cached per reference image.
2. **Scene generation:** Gemini 3 Pro Image Preview generates the complete scene with text overlays rendered.
3. **Product compositing (local PIL):** Vision extraction identifies the product bounding box. The canonical product is color-matched to the ambient lighting, shadows are injected, and PIL alpha compositing places the exact product over the generated scene.
4. **Vault cache write:** Final output cached.

### Section 6.7: Source Image Taxonomy

The Brand Asset Vault classifies every product image on ingest via Gemini 2.5 Flash vision:
- `catalog`: Plain background, single product. High preservation. Safe for direct Gemini input.
- `flat-lay`: Product with ambient props. Medium preservation. Requires compositing post-pass.
- `lifestyle`: Product worn/used by person. Not safe for direct input. Must be routed through compositing pipeline with product extracted first.
- `hero`: Full-bleed editorial. Treat as style reference, not product source.

### Section 6.8: Quality Benchmarks and Guardrails

Blind comparison testing across our reference corpus shows output quality indistinguishable from professional photography in the majority of cases, with specific strength in text overlays (100% accuracy) and background replacement, and specific limitations when preserving existing people or complex source compositions.

**Input Guardrails:**
- Minimum resolution: 800px on short edge.
- Text string length: Max 40 characters per string, max 4 elements total.
- Lifestyle warning: If a user selects a `lifestyle` source for a product-preservation campaign, warn: "This image has existing models/scene that Gemini will regenerate. Use a catalog version if available."

**Generation Guardrails:**
- Prompt template lock: All calls use a strict `build_prompt()` function (double quotes, verification language, reference-driven style).
- Style spec injection: Extracted style spec from reference image must be injected as hard overrides.

**Post-Generation Guardrails:**
- OCR verification: Lightweight OCR pass compares generated text to prompt strings. Triggers 1 automatic retry on mismatch.
- Product compositing: Mandatory for `flat-lay` and `lifestyle` sources.

**Prompt Pattern Appendix (for 100% Text Accuracy):**
1. Every text string in double quotes: `the exact text "HEADLINE HERE"`
2. Instruction block: `render exactly as written, verify spelling character by character, do not alter letters`
3. Typography specified as category (e.g., serif), not specific font name.
4. Position specified relative to canvas. Size specified as percent of canvas height.
5. Reference-driven style: "study IMAGE 1 and mimic its style decisions".

**Platform Abstraction Layer (PAL)**
- Purpose: Translates VIYO's canonical JSON schemas into platform-specific API payloads (Klaviyo, Shopify)
- Why it exists: Decouples the generation system from external API formats. If Klaviyo changes their API, only the PAL adapter changes, not the brains
- Who uses it: Render worker (on deploy action)
- Where it lives: `apps/worker/src/pal/`
- V1: ✅

**Skill Registry**
- Purpose: Versioned repository of internal tools and capabilities that brains can invoke at runtime
- Why it exists: Allows prompt updates and tool changes without full deployments. Each skill has a version, token footprint, and expected I/O schema
- Who uses it: Admin operators (manage via Admin Portal), AI brains (load at runtime)
- Where it lives: `skills_registry` table in Supabase
- V1: ✅

### AI / Generation Systems

**Brain Architecture (The Council)**
- Purpose: 7 specialized AI agents executing discrete marketing tasks
- Why it exists: A single monolithic prompt produces generic, structurally flawed outputs. Specialized agents with strict output schemas produce higher-quality, more consistent results
- Who uses it: System
- Where it lives: Render worker (Mastra DAG)
- V1: ✅

**Top Brain**
- Purpose: Competitive intelligence layer — analyzes competitor emails to derive macro trends and winning formulas
- Why it exists: VIYO needs to recommend campaign strategies that reflect what's actually working in the market, not generic best practices
- Who uses it: Admin operators (upload emails), CMO Brain (consumes derived strategies at generation time)
- Where it lives: `top_brain_emails`, `top_brain_vectors`, `top_brain_derived_strategies` tables; nightly Inngest job
- V1 mechanism: Manual HTML upload via Admin Portal
- V1.1 mechanism: Automated IMAP ingestion (AgentMail)
- Minimum corpus before clustering produces meaningful results: 50 emails per vertical
- Empty state: CMO Brain degrades gracefully to Email Bible rules — does not hard-fail
- V1: ✅

### Billing System

**Credit Ledger (Stripe + Internal DB)**
- Purpose: Manages prepaid credit balance with no overages
- Why it exists: Flat subscriptions misalign cost and value. Consumption-based credits let brands pay exactly for what they generate — a brand doing 5 campaigns/month pays like a brand doing 5 campaigns/month
- Who uses it: Merchants (purchase credit packs), system (reserves/commits/refunds credits), Admin (manual refunds)
- Where it lives: `credit_ledger` table (immutable append-only ledger), `brands.credit_balance` (current balance), `processed_stripe_events` (idempotency)
- Non-negotiable rule: Hard stop at 0 credits. No generation starts if balance falls below the cost of the requested action. No exceptions
- V1: ✅

---

## 7. Frontend vs Admin vs Backend Map

| Feature | Frontend | Admin | Vercel API | Render Worker | Phase |
|---------|----------|-------|------------|---------------|-------|
| Onboarding & Brand Setup | ✅ | | ✅ | | V1 |
| Shopify OAuth | ✅ | | ✅ | ✅ (sync) | V1 |
| Klaviyo OAuth | ✅ | | ✅ | ✅ (sync) | V1 |
| Campaign Brief Submission | ✅ | | ✅ | | V1 |
| Generation DAG Execution | | | | ✅ | V1 |
| MJML Compilation | | | | ✅ | V1 |
| Live Progress UI (Realtime) | ✅ | | | | V1 |
| Draft Preview & Editing | ✅ | | ✅ | | V1 |
| Deploy to Klaviyo | ✅ | | ✅ | ✅ | V1 |
| Token Purchase (Stripe) | ✅ | | ✅ | | V1 |
| Token Refund Management | | ✅ | ✅ | | V1 |
| Competitor Email Upload | | ✅ | ✅ | ✅ (process) | V1 |
| System Health Dashboard | | ✅ | ✅ | | V1 |
| Skill Registry Management | | ✅ | ✅ | | V1 |
| A/B Testing Generation | ✅ | | ✅ | ✅ | V1.1 |
| STO Computation | | | | ✅ (nightly) | V1 |

---

## 8. Data Model and Core Entities

**29 tables across 5 domains.** Full Drizzle ORM schema is in Part C.

### Domain 1: Identity & Tenancy
- `brands` — core tenant entity; stores name, vertical, token balance, Stripe IDs, Klaviyo metric IDs
- `users` — mirrors Supabase Auth; global identity across all of VIYO
- `brand_members` — junction table mapping users to brands with specific roles (supports multi-brand/agency mode)
- `verticals` — lookup table: fashion, beauty, home, etc.
- `brand_verticals` — many-to-many mapping
- `niche_prompt_fragments` — per-vertical, per-brain Layer 2 prompt context

### Domain 2: Integrations
- `shopify_connections` — encrypted Shopify access tokens
- `klaviyo_connections` — encrypted Klaviyo access + refresh tokens
- `klaviyo_pkce_store` — temporary PKCE code_verifier storage (deleted after token exchange)

### Domain 3: AI & Generation
- `campaign_sessions` — generation job lifecycle (11 states)
- `brain_outputs` — JSON output of each brain per session
- `editor_events` — user edits to generated content
- `brand_visual_systems` — brand colors, fonts, logo URL
- `brand_voice_history` — historical voice profiles
- `brand_vectors` — pgvector embeddings of historical campaigns
- `winning_formulas` — brand-specific intent → layout → offer mappings
- `top_brain_derived_strategies` — HDBSCAN-clustered strategy insights
- `top_brain_emails` — raw competitor email HTML (Admin upload)
- `top_brain_vectors` — pgvector embeddings of competitor emails

### Domain 4: Data Sync
- `products` — Shopify product catalog
- `audience_map` — Klaviyo segments with RFM scores
- `audience_segments` — additional segment metadata
- `brand_state` — STO data (best_send_times JSONB, sto_confidence, sto_event_count)

### Domain 5: Billing, Logging & Assets
- `credit_ledger` — immutable credit transaction ledger (trial_grant | reserved | committed | refunded | top_up | admin_adjustment)
- `processed_stripe_events` — idempotency table for Stripe webhooks
- `audit_logs` — append-only log of critical configuration changes
- `notifications` — in-app notification center (30-day retention)
- `assets` — references to R2-stored images and compiled HTML
- `llm_usage_events` — every LLM API call logged for margin analysis
- `skills_registry` — versioned skills with token footprint

---

## 9. Job Lifecycle and State Machine

The `campaign_sessions.status` field tracks the generation lifecycle. This is the canonical 11-state machine:

| State | Meaning | Token action |
|-------|---------|-------------|
| `queued` | Brief submitted, waiting for worker pickup | Reserved |
| `running` | DAG executing, `current_phase` updates as brains complete | Reserved |
| `completed` | All brains succeeded, HTML compiled | Committed (deducted) |
| `completed_with_warnings` | Core text/layout succeeded, non-critical asset (hero image) failed | Committed |
| `partial` | Partial success — usable output but degraded | Committed |
| `failed` | Hard error — API timeout, compile crash, CMO/Copywriter brain failure | Refunded |
| `cancelled` | User aborted before completion | Refunded |
| `retrying` | Inngest automatic retry in progress | Reserved (still) |
| `deploying` | Klaviyo 3-step deploy in progress | Committed |
| `deployed` | Campaign live in Klaviyo | Committed |
| `deploy_failed` | Klaviyo API rejected the deploy | Committed (already consumed) |

**Critical state rules:**
- Credits are never double-deducted. The `credit_ledger` table is append-only and immutable.
- The `failed` state guarantees a refund. The worker must update status to `failed` before returning.
- `completed_with_warnings` is used when the hero image fails but the email text and layout are valid. The user receives a working email with a placeholder image.

---

## 10. Edge Cases and Failure Policy

**Shopify Offline Mid-Generation**
- Detection: Shopify API returns 401/403 during product data hydration
- Action: Orchestrator pauses the job, fires `shopify.token.refresh` event, retries up to 3 times
- If all retries fail: Session → `failed`, token refunded, user notified to reconnect Shopify

**LLM Provider Down (Hard Outage)**
- Detection: Provider returns 503 or connection timeout
- For CMO or Copywriter Brain failure: Session → `failed`, token refunded (these brains are non-negotiable)
- For non-critical brains (Offer, Image Design): System falls back to Gemini 2.5 Flash
- Note: Model swapping for critical brains is not permitted due to schema mismatch risk

**Compiled Email > 75KB**
- Detection: `compileEmail()` measures output before returning
- Action: `viyo-mjml-engine` throws `ClippingError`
- Result: Session → `completed_with_warnings`, UI displays Gmail clipping risk alert with "Simplify Layout" suggestion

**Render Worker Crash (OOM)**
- Detection: Inngest detects worker failure (no heartbeat)
- Action: Automatically re-queues the job on a healthy Render instance, resuming from last successful Inngest checkpoint
- Token impact: No duplicate deduction — the job resumes, not restarts

**Empty Shopify Catalog**
- Detection: Synchronous check in `/api/v1/campaigns/generate` before queuing
- Action: API returns 422 immediately — "No products found. Please sync your Shopify catalog."
- Token impact: No token reserved (check happens before reservation)

**VeriClaw Failure**
- Detection: VeriClaw returns `{ "valid": false, "reason": "..." }`
- Action: Copywriter Brain retried once with the `reason` appended to the prompt
- If second attempt also fails VeriClaw: Session → `failed`, token refunded
- Maximum correction cycles: **1** (not 3 — confirmed per Q27 spec)

**Klaviyo Token Expiry Mid-Generation**
- Detection: JIT lazy token refresh — before every Klaviyo API call, check if `klaviyo_connections.expires_at` is within 5 minutes
- Action: Automatically refresh using stored refresh token, update `klaviyo_connections`
- If refresh fails: Pause job, notify user to reconnect Klaviyo

---

## 11. Monitoring, Observability, and Alerting

### OpenTelemetry Architecture
- Every Vercel API route and Render worker function is instrumented with OpenTelemetry
- The `generation_id` (= `campaign_sessions.id`) is injected as root trace context into every log, metric, and span across the Vercel/Render boundary
- All telemetry exported to Datadog

### Mandatory OTEL Tags (on every log/metric/trace)
```
env, brand_id, campaign_id, brain, provider, model, generation_id, status
```

### Alert Routing

| Severity | Trigger | Route |
|----------|---------|-------|
| Warning | Image generation timeout, STO computation skipped | `#ai-campaign-alerts` Slack |
| Error | Brain failure (non-critical), Stripe webhook failure | `#ai-campaign-alerts` + `#ai-campaign-incidents` |
| Critical | Supabase connection failure, CMO/Copywriter failure, worker crash | Both Slack channels + PagerDuty |

### Cost Tracking
- Every LLM API call logs to `llm_usage_events`: provider, model, brain, prompt_tokens, completion_tokens, cost_total_usd
- Dashboard query: total cost per `generation_id` → margin per campaign
- Alert: If cost_per_campaign > $0.25 for 3 consecutive generations, fire warning (indicates prompt bloat)

### COGS Breakdown (per campaign)
| Component | Cost |
|-----------|------|
| Claude 3.5 Sonnet (Copywriter Brain) | ~$0.045 |
| Google Gemini Flash (VeriClaw + Email Design) | ~$0.006 |
| Gemini 3 Pro Image (NanoBanana) | ~$0.030 |
| Cloudflare R2 (storage) | ~$0.001 |
| Inngest + Render compute | ~$0.023 |
| **Total COGS** | **~$0.115** |

At $1/token retail pricing, gross margin = ~88.5%.

---

## 12. Product Analytics and Business Telemetry

**Tool:** PostHog

**Events tracked:**
| Event | When fired | Properties |
|-------|-----------|------------|
| `signup_completed` | After brand + user records created | `vertical`, `plan_tier` |
| `shopify_connected` | After OAuth token stored | `brand_id` |
| `klaviyo_connected` | After PKCE token stored | `brand_id` |
| `campaign_brief_submitted` | After `/generate` API call | `intent`, `segment_type`, `product_count` |
| `generation_completed` | After DAG finishes | `duration_ms`, `total_cost_usd`, `critic_score` |
| `generation_failed` | After status → failed | `failure_brain`, `error_type` |
| `draft_edited` | After user types in chat | `edit_type` |
| `deployed_to_klaviyo` | After 3-step deploy completes | `campaign_type`, `send_time` |
| `token_purchased` | After Stripe webhook processed | `pack_size`, `revenue_usd` |

**Feature Flags (PostHog):**
- `v1.1_ab_testing` — gates A/B test generation UI
- `v1.1_imap_ingestion` — gates automated Top Brain ingestion
- `v1.1_panoramata` — gates Panoramata API adapter

---

## 13. Security, Abuse Prevention, and Trust Model

**Tenant Isolation**
- Supabase Row Level Security on every table linked to `brand_id`
- Two RLS patterns:
  - Direct owner: `USING (user_id = auth.uid())`
  - Child owner: `USING (brand_id IN (SELECT brand_id FROM users WHERE users.id = auth.uid()))`
- Backend workers bypass RLS using `SUPABASE_SERVICE_ROLE_KEY` — only after role verification

**API Authentication**
- Every Vercel API route validates Supabase JWT from `Authorization: Bearer` header
- Admin routes additionally check `users.role = 'admin'` via `requireAdmin()` middleware

**Secret Handling**
- Shopify and Klaviyo OAuth tokens: AES-256-GCM encrypted using `ENCRYPTION_KEY` before DB storage
- All environment variables validated at boot using `t3-env` or Zod — app fails immediately if missing, not silently during generation

**PII Redaction**
- A regex-based masking pipeline redacts emails, phone numbers, and SSNs from brand data before it is sent to third-party LLMs
- This runs synchronously in the hydrate step before any brain receives input

**Prompt Injection Prevention**
- A lightweight Gemini 2.5 Flash "Preflight" check verifies the semantic intent of the brief before the main DAG executes
- If brief contains injection patterns (e.g., "ignore previous instructions"), the generation is rejected pre-token-reservation

**Shopify HMAC Validation**
- Every Shopify OAuth callback validates the HMAC signature using `crypto.createHmac('sha256', SHOPIFY_CLIENT_SECRET)`
- Requests with invalid HMAC return 401 immediately

**Rate Limiting**
- Upstash Redis rate limiting on all `/api/v1/` routes: 100 requests/minute per brand_id

---

## 14. Context Window and Token Budget Policy

**Strategy:** Strict budget enforcement prevents context overflow and margin erosion.

**Per-Brain Input Token Limits:**
| Brain | Max Input Tokens |
|-------|-----------------|
| CMO Brain | 6,000 |
| Audience Brain | 500 (TypeScript only) |
| Offer Brain | 2,000 |
| Copywriter Brain | 4,000 |
| Image Design Brain | 1,500 |
| Email Design Brain | 2,000 |
| VeriClaw | 1,000 |
| Critic Brain | 5,000 |

**Summarization:** If historical campaign data exceeds a brain's budget, it passes through a summarization step before being injected. The summarizer is a lightweight Gemini 2.5 Flash call — not a full brain.

**Artifact Caching:** CMO Brain output is cached and passed by reference to later brains. Later brains receive only their required slice, not the full CMO JSON.

**Two-Layer Prompt Architecture:**
- Layer 1: Static system prompt (hardcoded in the skills_registry, prompt-cached via the provider API)
- Layer 2: Dynamic runtime injection (brand context, vertical fragment from `niche_prompt_fragments`, few-shot examples from `winning_formulas`)
- AI creativity is strictly bounded: the AI can only work within the structure of Layer 1

---

## 15. Send Time Optimization (STO)

**What it does:** Recommends the optimal day/hour to send a campaign based on brand-specific historical engagement.

**Algorithm:**
- Fetches Klaviyo click and order events for the past 90 days using account-specific metric UUIDs
- Builds a click-weighted frequency matrix: clicks = 1 point, placed orders = 3 points
- Opens explicitly excluded (Apple Mail Privacy Protection inflates open rates)
- Best slot = `max(weighted_score)` across day × hour matrix
- Cold-start fallback: `config/benchmarks.json` keyed by `brands.industry` (e.g., fashion default = Tuesday 10am ET)

**Storage:** `brand_state.best_send_times` (JSONB), `brand_state.sto_confidence` (high/low/benchmark)

**Schedule:** Nightly Inngest cron at 02:00 UTC → `brand_state.sto.compute`

**No "+X% uplift" claim is made anywhere.** This language was removed due to legal liability risk — VIYO cannot guarantee a specific lift percentage.

**UI contract:** "Based on your audience, we recommend Tuesday at 10am ET" — soft recommendation, user can override.

---

## 16. Custom Skills Build Plan

**viyo-mjml-engine** (`packages/mjml-compiler/`)
- What: TypeScript wrapper around `mjml-core`. Exposes a `compileEmail(input: CompileInput): string` function
- Why: LLMs cannot reliably write syntactically valid MJML. The engine takes a structured JSON (a `sections[]` array, where each object contains `section_id` and `slots`, plus design tokens) and deterministically compiles it
- When built: Phase 3 (Week 6) — hard blocker for Preview UI
- Who maintains it: Engineering

**viyo-brand-voice-extractor** (agent, runs in Phase 2)
- What: Analyzes a brand's historical Klaviyo emails to extract voice profile
- Why: Populates `brand_voice_history` table, providing Copywriter Brain with brand-specific stylistic constraints
- When built: Phase 2
- Who triggers it: Inngest job after Klaviyo initial sync

**viyo-design-system** (two worlds)
- App UI: Tailwind CSS + Radix UI + shadcn/ui design tokens for the VIYO web application
- Email design: MJML-compatible design token set (colors, fonts, border-radius) injected into compiled emails
- When built: Phase 0 (tokens defined) and Phase 3 (email design tokens integrated into compiler)

---

## 17. Testing and QA Strategy

**Unit Tests (Vitest)**
- Audience Brain RFM mapping logic
- `compileEmail()` function with various combinations of composable sections
- Zod schema validation for all brain outputs
- Token ledger state transitions

**Integration Tests**
- Vercel API endpoints against local Supabase instance (via `supabase start`)
- Shopify OAuth callback (HMAC validation, token storage)
- Klaviyo PKCE callback (token exchange, DB storage)

**E2E Tests (Playwright)**
- Core user journey: Signup → Connect Shopify → Connect Klaviyo → Submit Brief → View Preview → Deploy
- Token purchase flow: Stripe Checkout → webhook processing → balance update

**Contract Tests**
- Platform Abstraction Layer: ensures VIYO JSON → Klaviyo API payload formatting is correct
- Run against Klaviyo sandbox environment

---

## 18. Error UX, Notifications, and Status Design

### Classification Rules

Four distinct UI patterns. Nothing crosses categories.

- **Toast** — ephemeral, auto-dismiss, confirms something the user just triggered. No action required.
- **Confirmation Modal** — blocks until user decides. Only for destructive or irreversible actions.
- **Notification Center** — persistent, async. Events the user wasn't watching for. Always has an action.
- **Smart Notification** — system-triggered by a data state change. Written to `notifications` by a worker or cron. Not triggered by user action.
- **Inline Banner** — lives on a specific page, tied to that page's current state. Clears when condition resolves. Not in the Notification Center.

---

### Toasts

Position: bottom-right. Z-index above all content, below modals.
Auto-dismiss: success/info = 3s, warning = 6s, error = never (user must close).

| Trigger | Type | Message |
|---------|------|---------|
| Settings saved | success | "Saved" |
| Email HTML copied | success | "Copied to clipboard" |
| Shopify connected | success | "Shopify connected" |
| Klaviyo connected | success | "Klaviyo connected" |
| Shopify disconnected | info | "Shopify disconnected" |
| Klaviyo disconnected | info | "Klaviyo disconnected" |
| Top-up initiated | info | "Redirecting to Stripe..." |
| Token pack purchased | success | "20 tokens added to your account" |
| Campaign deployed | success | "Live in Klaviyo" |
| Admin: email upload submitted | info | "Analyzing..." (replaced by inline result card when done) |
| Unhandled API error | error | "Something went wrong. Try again." |

---

### Confirmation Modals

All modals: centered overlay, backdrop blur. [Cancel] always left. Destructive action always right in red.

**Disconnect Shopify**
> Disconnecting Shopify will pause campaign generation until you reconnect. Your existing drafts are not affected.
Actions: [Cancel] [Disconnect]

**Disconnect Klaviyo**
> Disconnecting Klaviyo means VIYO can no longer deploy campaigns to your account. Existing drafts are not affected.
Actions: [Cancel] [Disconnect]

**Delete campaign draft**
> This draft will be permanently deleted. This cannot be undone.
Actions: [Cancel] [Delete]

**Regenerate a section**
> Regenerating will replace the current content. This cannot be undone.
Actions: [Cancel] [Regenerate]

**Zero token gate** (triggered when user clicks "New Campaign" with balance = 0 — do not disable the button, show this modal instead)
> You're out of tokens. Purchase a top-up pack to keep generating campaigns.
Actions: [Maybe later] [Top Up →] — navigates to `/settings/billing`

**Delete account**
> Your account, all campaigns, and brand data will be permanently deleted. This cannot be undone. Type DELETE to confirm.
Requires text input matching "DELETE" before confirm button activates.
Actions: [Cancel] [Delete Account]

---

### Notification Center

**Shell:**
- Bell icon in top-right header
- Unread count badge: red dot, displays up to "9+", hidden when count = 0
- Click opens slide-out drawer from the right, 400px wide
- Drawer header: "Notifications" + "Mark all as read" link
- Notification cards: newest first, severity color bar on left, title (bold if unread), message, relative timestamp ("2 minutes ago"), action button if `action_url` is set
- Unread indicator: bold title + subtle background tint, clears on click or "Mark all as read"
- Empty state: "You're all caught up."
- 30-day retention after `is_read = true`

**All events written to the `notifications` table:**

| Event | Type | Title | Message | action_url |
|-------|------|-------|---------|------------|
| Generation failed | error | "Campaign generation failed" | "Your token has been refunded. Try again when ready." | `/campaigns/:sessionId` |
| Generation completed (user away) | success | "Your campaign is ready" | "Review and deploy your draft." | `/campaigns/:sessionId/preview` |
| Partial completion (image failed) | warning | "Campaign ready with a warning" | "Your email is ready but the hero image failed. A placeholder has been used." | `/campaigns/:sessionId/preview` |
| Gmail clipping risk | warning | "Email may be clipped in Gmail" | "This email exceeds Gmail's 102KB display limit. Simplify the layout before sending." | `/campaigns/:sessionId/preview` |
| Token balance ≤ 2 | warning | "Running low on tokens" | "You have X token(s) remaining. Top up to keep generating." | `/settings/billing` |
| Token balance = 0 | error | "Out of tokens" | "Purchase a top-up pack to continue generating campaigns." | `/settings/billing` |
| Shopify reconnect needed | error | "Shopify needs reconnecting" | "Your Shopify connection expired. Reconnect to resume campaign generation." | `/settings/integrations` |
| Klaviyo reconnect needed | error | "Klaviyo needs reconnecting" | "Your Klaviyo connection expired. VIYO can't deploy campaigns until you reconnect." | `/settings/integrations` |
| STO recommendation available | info | "Send time recommendation ready" | "Based on your audience data, we recommend [Day] at [Time]. You can override this when deploying." | `/campaigns/new` |
| Credit purchase confirmed | success | "Credits added" | "X,000 credits have been added to your account." | `/settings/billing` |

---

### Smart Notifications

System-triggered writes to `notifications`. Each has a dedup rule to prevent stacking identical alerts.

**Low credit balance**
- Trigger: After every successful credit commitment, Render worker checks `brands.credit_balance`
- Writes warning notification if balance falls below 5,000 credits; error notification if balance falls below 1,000
- Dedup rule: Skip write if an unread notification of the same type already exists for this brand
- Responsible: Render worker, post-commitment step in generation DAG

**Shopify / Klaviyo token expiry**
- Trigger: Nightly Inngest cron `integrations.health.check` at 01:00 UTC
- For each brand with active connections, attempt a lightweight token validation call
- On Shopify rotating token refresh failure → write error notification
- On Klaviyo refresh token exchange failure → write error notification
- Dedup rule: Skip if unread reconnect notification already exists for that integration
- Responsible: Render worker on `integrations.health.check` event

**STO recommendation available**
- Trigger: `brand_state.sto.compute` cron completes AND `sto_confidence` upgrades from `benchmark` to `low` or `high` for the first time for this brand
- Fires once per brand on first confidence upgrade only — not every Sunday
- Responsible: Render worker on STO compute job

**Generation completed while user was away**
- Trigger: DAG completes AND `campaign_sessions.user_watching = false`
- Detecting "away": Vercel API sets `user_watching` flag on `campaign_sessions` when the frontend Realtime subscription connects or disconnects
- If `user_watching = false` at DAG completion → write success notification
- If `user_watching = true` → skip (user sees it live via the Orb progress UI)
- Responsible: Render worker, final step of generation DAG
- Schema addition needed: `user_watching boolean default false` on `campaign_sessions`

---

### Inline Banners (Page-Specific, Not Notification Center)

Driven by live state reads, not the `notifications` table. Clear automatically when condition resolves.

| Condition | Page | Type | Message |
|-----------|------|------|---------|
| balance = 0 | `/dashboard`, `/campaigns/new` | error | "You're out of tokens. Top up to generate campaigns." + [Top Up] button |
| Shopify disconnected | `/dashboard` | warning | "Shopify is disconnected. Campaign generation is paused." + [Reconnect] button |
| Klaviyo disconnected | `/dashboard` | warning | "Klaviyo is disconnected. You can generate drafts but can't deploy." + [Reconnect] button |
| Both disconnected | `/dashboard` | error | "No integrations connected. Connect Shopify and Klaviyo to start." + [Go to Settings] button |
| Partial generation (image failed) | `/campaigns/:sessionId/preview` | warning | "Hero image failed to generate. A placeholder is shown." |
| Email > 102KB | `/campaigns/:sessionId/preview` | warning | "This email may be clipped in Gmail. Simplify the layout before sending." |

**Job Detail View:**
- UI shows step-by-step DAG progress per brain during generation
- On failure: displays the specific brain that failed and the error category
- Transient errors during DAG: inline spinner + "Retrying..." — no user action needed

---

## 19. Backup, Disaster Recovery, and Degraded Mode

**Backups:** Supabase Point-in-Time Recovery (PITR) enabled. Daily automated snapshots.

**Degraded Mode:** If Shopify integration goes offline, the app enters degraded mode. Users can view and edit existing drafts but new campaign generation is blocked until reconnection.

**Render Worker Redundancy:** Render auto-restarts crashed containers. Inngest automatically re-queues failed jobs on the next healthy worker instance.

---

## 20. V1 / V1.1 / Future Boundary

| Feature | Release |
|---------|---------|
| Single campaign generation | V1 |
| Shopify + Klaviyo OAuth | V1 |
| MJML compilation (composable sections) | V1 |
| Stripe Top-Up billing | V1 |
| Admin Portal | V1 |
| Top Brain (manual ingestion) | V1 |
| STO recommendation | V1 |
| A/B testing generation | V1.1 |
| Automated IMAP competitor ingestion | V1.1 |
| Multi-step Klaviyo flow generation | V1.1 |
| Additional ESP integrations | Future |
| Panoramata API integration | V1.1 (adapter only in V1) |

---

## 20A. Flow Generation System (V1.1)

### What a Flow Is

A Klaviyo flow is a sequence of automated emails triggered by a user action, not a scheduled send date. It has:
- A **trigger** (subscribed to list, abandoned cart, placed order, browsed product)
- A **sequence** of emails with timing delays between them
- **Conditional splits** (if opened email 1, continue; if not, resend with alternate subject)
- Each email is a separate Klaviyo template linked inside the flow

Flow generation is architecturally distinct from campaign generation. A campaign is one email. A flow is a multi-email program with logic, timing, and branching that runs automatically on Klaviyo's infrastructure.

---

### Flow Types Supported

| Flow | Trigger | Email Count | Default Timing |
|---|---|---|---|
| Welcome Series | List subscribe | 3-5 | Immediate, +2 days, +5 days |
| Abandoned Cart | Cart abandon metric | 2-3 | +1 hour, +24 hours, +72 hours |
| Post-Purchase | Placed order metric | 3-4 | +1 day, +7 days, +21 days |
| Browse Abandonment | Viewed product metric | 1-2 | +1 hour, +24 hours |
| Win-Back | 90+ days no purchase | 2-3 | Immediate, +7 days, +14 days |
| VIP Welcome | LTV threshold crossed | 2 | Immediate, +3 days |
| Sunset | 180+ days unengaged | 2-3 | Immediate, +14 days, +28 days |

---

### User Entry Points

**1. Natural language brief** — user types "generate me a welcome series" or "build an abandoned cart flow." VIYO detects flow intent and routes to the flow generation pipeline automatically.

**2. Flow Library (`/flows`)** — a dedicated page listing all flow types as cards. User selects flow type, fills a lightweight brief (brand tone, featured products, key offer), clicks Generate.

Both paths converge at the same pipeline.

---

### Flow Generation Pipeline

```
User Brief
    ↓
Flow Strategy Brain    ← determines: email count, timing, subject angles, conditional splits
    ↓
Parallel Council runs  ← one full 7-brain Council run per email in the flow, all in parallel
    ↓
Flow Assembler         ← combines generated emails + timing into Klaviyo flow JSON
    ↓
Preflight (per email)  ← all preflight checks run on each email independently
    ↓
Klaviyo Deploy         ← uploads templates, creates flow via Flows API, sets trigger
```

---

### Flow Strategy Brain (New Brain — V1.1)

A new brain added upstream of the Council. Runs once before any email is generated and outputs a complete flow plan.

**Model:** `claude-3-5-sonnet-20241022`
**Temperature:** 0.4 (structured planning, low creative drift)
**When it runs:** First step of every flow generation request

**Input:**
- User brief (flow type, brand tone, key message, featured products)
- Brand context (Personal Brain embeddings, brand voice, safe_offers)
- Klaviyo account data (list IDs, available metric IDs for triggers)

**Output (Zod-validated):**
```typescript
const FlowPlanSchema = z.object({
  flow_type: z.string(),
  // Validated at runtime against the flow_types registry (Section 23).
  // Any active row in the flow_types table is a valid value.
  // Adding a new flow type = INSERT into flow_types. No enum change required.
  trigger_type: z.enum(['list_trigger', 'metric_trigger']),
  trigger_list_id: z.string().optional(),
  trigger_metric_id: z.string().optional(),
  total_emails: z.number().min(1).max(5),
  emails: z.array(z.object({
    position: z.number(),
    delay_hours: z.number().min(0),
    angle: z.string(),
    subject_direction: z.string(),
    hero_product_hint: z.string().optional(),
    cta: z.string(),
    offer: z.string().nullable(),
  })),
  conditional_splits: z.array(z.object({
    after_position: z.number(),
    condition: z.enum(['has_not_opened', 'has_not_clicked', 'has_purchased']),
    yes_path: z.string(),
    no_path: z.string(),
  })).optional(),
});
```

**Hard constraints:**
- Cannot invent offer values not present in `safe_offers` array
- Cannot schedule timing below Klaviyo API minimums (1 hour for metric triggers)
- Cannot exceed flow type's max email count
- Must use real Klaviyo list/metric IDs from the user's connected account
- If `safe_offers` is empty and flow requires an incentive email, output `offer: null` and flag for user review

---

### Parallel Email Generation

Once the Flow Strategy Brain outputs the plan, each email runs through the full 7-brain Council simultaneously using Inngest parallel steps. A 3-email welcome series generates all 3 emails at the same time — total wall-clock time is the same as generating a single campaign.

```typescript
// Inngest parallel steps — all emails generate concurrently
const emailResults = await step.run('generate_all_emails', async () => {
  return await Promise.all(
    flowPlan.emails.map((emailBrief) =>
      runCouncil({
        brief: emailBrief,
        brandContext,
        sessionId,
        position: emailBrief.position,
      })
    )
  );
});
```

**Credit cost:** 1,000 credits per email in the flow. A 3-email welcome series costs 3,000 credits. SMS steps cost 500 credits each. User sees the exact credit cost and a breakdown ("3 emails × 1,000 credits = 3,000 credits") on a confirmation screen before generation starts. Generation does not begin until the user confirms.

---

### Flow Assembler

After all emails are generated and compiled by MJML, the Flow Assembler constructs the Klaviyo Flows API payload — the data structure Klaviyo needs to create the flow.

```typescript
{
  data: {
    type: 'flow',
    attributes: {
      name: `VIYO — Welcome Series`,
      status: 'draft',
      trigger_type: 'list',
      trigger_id: flowPlan.trigger_list_id,
      definition: {
        actions: [
          { action_type: 'send-email', template_id: email1TemplateId },
          { action_type: 'time-delay', unit: 'days', value: 2 },
          { action_type: 'conditional-split',
            condition: { type: 'metric', metric: 'opened_email', template_id: email1TemplateId },
            branches: {
              yes: [{ action_type: 'send-email', template_id: email2TemplateId }],
              no: [{ action_type: 'send-email', template_id: email2AltTemplateId }]
            }
          },
          { action_type: 'time-delay', unit: 'days', value: 3 },
          { action_type: 'send-email', template_id: email3TemplateId }
        ]
      }
    }
  }
}
```

---

### Klaviyo Deployment

The deploy step:
1. Uploads each compiled email as a Klaviyo template (identical to single campaign deploy)
2. Creates the flow via Klaviyo Flows API with trigger, timing, splits, and linked templates
3. Sets flow status to **Draft** — user must manually activate in Klaviyo

**Why draft by default (non-negotiable):** Flows fire automatically the moment they are activated. A live welcome series immediately starts sending to every new subscriber. VIYO creates all flows in Draft so the user can review the complete sequence in Klaviyo, make any manual edits, and consciously activate. This is a safety gate and a trust signal — VIYO never auto-activates an automated sequence.

The success screen shows a direct link to the flow in the user's Klaviyo dashboard.

---

### Flow Preview UI

Before deploy, the user sees a visual sequence preview:

```
[Email 1 thumbnail]  →  [2 day delay]  →  [Email 2 thumbnail]  →  [3 day delay]  →  [Email 3 thumbnail]
     "Welcome"                                 "Bestsellers"                              "Your 10% off"
```

Each thumbnail is clickable — opens the full email preview (same viewer as single campaign). The timing labels, subject lines, and send angles are all visible. User can regenerate individual emails within the flow without regenerating the full sequence.

---

### New Schema Additions (V1.1)

```typescript
export const flows = pgTable('flows', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id').references(() => brands.id).notNull(),
  session_id: uuid('session_id').references(() => campaign_sessions.id),
  flow_type: text('flow_type').notNull(),
  klaviyo_flow_id: text('klaviyo_flow_id'),
  status: text('status').default('draft'),
  total_emails: integer('total_emails').notNull(),
  tokens_consumed: integer('tokens_consumed').notNull(),
  flow_plan: jsonb('flow_plan').notNull(),
  created_at: timestamptz('created_at').defaultNow(),
});

export const flow_emails = pgTable('flow_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  flow_id: uuid('flow_id').references(() => flows.id).notNull(),
  position: integer('position').notNull(),
  session_id: uuid('session_id').references(() => campaign_sessions.id).notNull(),
  klaviyo_template_id: text('klaviyo_template_id'),
  delay_hours: integer('delay_hours').default(0),
  angle: text('angle'),
  status: text('status').default('pending'),
});

// Dedicated SMS step table — separate from flow_emails because SMS and email are
// distinct Klaviyo action types with different fields, character limits, and delivery APIs
export const flow_sms = pgTable('flow_sms', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  flow_id:             uuid('flow_id').references(() => flows.id).notNull(),
  position:            integer('position').notNull(),         // position in overall flow sequence
  after_email_position: integer('after_email_position'),      // which email this SMS fires after (e.g., after Email 1)
  delay_hours:         integer('delay_hours').default(1),     // delay after the preceding step
  body_text:           text('body_text').notNull(),           // 160 char max (hard enforced)
  klaviyo_action_id:   text('klaviyo_action_id'),             // set after Klaviyo deploy
  status:              text('status').default('pending'),
  credits_consumed:    integer('credits_consumed').default(500),
  created_at:          timestamptz('created_at').defaultNow(),
});
```

---

### SMS Integration (V1.1) — Full Specification

SMS steps can be added to any flow. They are opt-in per flow type, gated by Klaviyo SMS eligibility, and generated by a dedicated SMS Copywriter Brain separate from the email Copywriter Brain.

---

#### SMSEligibility Check

Before the Flow Strategy Brain plans any SMS steps, VIYO checks whether the brand's Klaviyo account can legally and technically support SMS.

```typescript
export interface SMSEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export async function checkSMSEligibility(brandId: string): Promise<SMSEligibilityResult> {
  const [brand] = await db.select({
    klaviyo_sms_enabled: brands.klaviyo_sms_enabled,
    sms_consent_rate:    brands.sms_consent_rate,
    country_code:        brands.country_code,
  }).from(brands).where(eq(brands.id, brandId));

  // 1. Klaviyo SMS must be enabled on this account
  if (!brand?.klaviyo_sms_enabled) {
    return { eligible: false, reason: 'Klaviyo SMS is not enabled on this account. Enable it in Klaviyo settings first.' };
  }

  // 2. SMS consent rate must be above 5% — below this, adding SMS steps will likely
  //    trigger spam complaints and damage deliverability
  if ((brand?.sms_consent_rate ?? 0) < 0.05) {
    return { eligible: false, reason: 'SMS consent rate is below 5%. Build your SMS subscriber base before adding SMS steps.' };
  }

  // 3. SMS is only available for US, CA, UK, AU brands (Klaviyo carrier restrictions)
  const supportedCountries = ['US', 'CA', 'GB', 'AU'];
  if (!supportedCountries.includes(brand?.country_code ?? '')) {
    return { eligible: false, reason: `SMS is not yet available for brands in ${brand?.country_code}. Supported regions: US, CA, UK, AU.` };
  }

  return { eligible: true };
}
```

New columns on `brands` table:
```typescript
klaviyo_sms_enabled: boolean('klaviyo_sms_enabled').default(false),
sms_consent_rate:    real('sms_consent_rate'),  // fetched from Klaviyo account stats on connect
country_code:        text('country_code'),       // set during onboarding
```

---

#### SMS Placement Rules

Not every flow position gets an SMS step. These rules are enforced by the Flow Strategy Brain and are non-overridable:

```typescript
// SMS placement config is stored in flow_types.sms_config (JSONB) — Section 23.
// The values below are the seed data for that column and document the reasoning.
// In production: const smsConfig = await getFlowSmsConfig(flowTypeId);

const SMS_PLACEMENT_SEED = {
  // flow_type_id         => sms_config seed value
  welcome_series:    { allowed: true,  maxSmsSteps: 1, placements: [1],    minDelayHours: 2 },
  abandoned_cart:    { allowed: true,  maxSmsSteps: 1, placements: [1],    minDelayHours: 1 },
  browse_abandonment:{ allowed: true,  maxSmsSteps: 1, placements: [1],    minDelayHours: 2 },
  post_purchase:     { allowed: true,  maxSmsSteps: 1, placements: [1],    minDelayHours: 24 },
  win_back:          { allowed: false, maxSmsSteps: 0, placements: [],     minDelayHours: 0 },
  // SMS on win-back causes carrier-level spam flags on disengaged subscribers.
  vip_welcome:       { allowed: true,  maxSmsSteps: 1, placements: [1],    minDelayHours: 4 },
  sunset:            { allowed: false, maxSmsSteps: 0, placements: [],     minDelayHours: 0 },
  // Never SMS a sunset sequence — will accelerate unsubscribes and spam complaints.
};
// To change SMS rules for any flow type: UPDATE flow_types SET sms_config = '...' WHERE id = '...';
// To add SMS rules for a new flow type: include sms_config in the INSERT — see Section 23.
```

---

#### SMS Copywriter Brain

A dedicated brain separate from the email Copywriter Brain. SMS requires fundamentally different writing than email — tighter, more direct, with a hard character limit.

**Model:** `claude-3-5-haiku-20241022` (faster, cheaper — SMS is short-form)
**Temperature:** 0.6
**Character limit:** 160 characters hard cap (enforced at schema level)

```
SYSTEM PROMPT (Layer 1):

You are an SMS copywriter for {{brand_name}}.
Your only job is to write a single SMS message that complements the paired email.

WHAT YOU ARE NOT:
- You are NOT writing an email. SMS is a different channel with a different relationship.
- You are NOT repeating the email. The SMS is a companion, not a duplicate.

HARD CONSTRAINTS:
1. CHARACTER LIMIT: Your body_text MUST be 160 characters or fewer. Count every character.
   If your first draft is too long, cut ruthlessly. Never truncate — rewrite.
2. OMIT DON'T INVENT: You MUST NOT invent prices, discounts, or product details not in your context.
3. ONE CTA ONLY: One link. One action. No "and" constructions.
4. NO EMOJI OVERLOAD: Maximum 1 emoji if brand voice allows. Zero if brand voice is professional.
5. ALWAYS INCLUDE BRAND NAME: SMS arrives from a shortcode. The brand name must appear in the text
   so the subscriber knows who is messaging them.
6. LEGAL SUFFIX: Never include the legal opt-out suffix in your output — VIYO appends it automatically.
   Klaviyo adds "Reply STOP to unsubscribe" — your 160 chars must leave room for this (~30 chars).
   Effective writing limit: 130 characters.

INPUTS:
- Brand Name: {{brand_name}}
- Email Subject Line (the paired email): {{email_subject}}
- Email Angle: {{email_angle}}
- Offer (if any): {{offer_display}}
- Brand Voice: {{brand_voice_short}}

OUTPUT FORMAT:
Return ONLY valid JSON matching the sms_output schema.
```

```typescript
// SMS Copywriter Brain schema
export const SMSOutputSchema = z.object({
  body_text: z.string()
    .max(130, 'SMS body must be 130 characters or fewer (Klaviyo appends opt-out suffix)')
    .refine(text => text.includes('{{brand_name}}') || /[A-Z][a-z]+/.test(text),
      'Brand name must appear in SMS body'),
  rationale: z.string().describe('Internal note on tone/angle choice — not sent to subscriber'),
  character_count: z.number(),
});
```

**Example outputs by flow type:**

| Flow | SMS |
|------|-----|
| Welcome (Email 1 follow-up) | `Hi, it's Represent. Welcome to the family. Your first look is waiting: [link]` |
| Abandoned Cart | `You left something behind. We're holding it for now: [link] - Represent` |
| Browse Abandonment | `Still thinking about it? That piece sells out fast: [link] - Represent` |
| Post-Purchase | `Your order is confirmed. See what others pair it with: [link] - Represent` |

---

#### SMS Generation in the Flow Pipeline

SMS generation runs in parallel with its paired email — not sequentially. The SMS Copywriter Brain receives the email's subject line and angle as input (not the full email copy), keeping the brief tight and avoiding duplication.

```typescript
// In the flow generation orchestrator:
async function generateFlowEmail(flowPlan: FlowPlan, emailSpec: EmailSpec, brandId: string) {
  const emailGeneration = runEmailCouncil(emailSpec, brandId);  // full 7-brain pipeline

  const smsSpec = SMS_PLACEMENT_RULES[flowPlan.flow_type];
  const hasSMSAtThisPosition = smsSpec.placements.includes(emailSpec.position);

  if (hasSMSAtThisPosition) {
    // Run email and SMS generation in parallel — SMS gets subject + angle as input,
    // not the full email body (we don't have it yet at this point)
    const [emailResult, smsResult] = await Promise.all([
      emailGeneration,
      runSMSCopywriterBrain({
        brandId,
        flowType: flowPlan.flow_type,
        emailPosition: emailSpec.position,
        emailAngle: emailSpec.angle,
        emailSubjectHint: emailSpec.subject_direction,
        offer: emailSpec.offer,
      }),
    ]);
    return { emailResult, smsResult };
  }

  const emailResult = await emailGeneration;
  return { emailResult, smsResult: null };
}
```

---

#### Klaviyo SMS Action Assembly

```typescript
// In the Flow Assembler — assembles the Klaviyo flow JSON with SMS actions
function buildKlaviyoSMSAction(smsStep: flow_sms, delayHours: number) {
  return {
    type: 'action',
    action_type: 'send-sms',
    attributes: {
      name: `Viyo - ${getFlowDisplayName(flowType)} - SMS ${smsStep.position}`,
      definition: {
        body: smsStep.body_text,
        // Klaviyo automatically appends opt-out language — do not include it here
      },
    },
    // Position in flow: delay relative to previous action
    ...(delayHours > 0 ? {
      timeDelay: {
        delay: delayHours,
        delayType: 'hours',
      },
    } : {}),
  };
}
```

---

#### SMS Preflight Checks (4 additional checks run on SMS steps)

1. **Character count hard fail:** `body_text.length > 130` → hard fail (Klaviyo truncates at send, corrupting the message)
2. **Brand name presence warning:** If brand name not found in body_text → warning
3. **Opt-out language warning:** If "stop" or "unsubscribe" appears in body_text → warning (Klaviyo auto-appends this — duplicating it wastes characters)
4. **Eligibility re-check:** If `sms_consent_rate` has dropped below 5% since flow was generated → warning before deploy

---

### Fully Automatic Flow Generator (V1.1)

Removes every manual touchpoint between "gap detected" and "flow ready in Klaviyo." No brief input required. No flow type selection required. The user's only action is reviewing and activating the completed draft.

---

#### Two Modes

**Mode 1 — Triggered Auto-Generate (default)**
Gap detected → brief assembled automatically → pipeline runs → completed draft presented. User receives a notification: "Your Welcome Series is ready to review." One click to preview, one click to deploy. Zero input required upstream.

**Mode 2 — Autonomous Auto-Generate (opt-in)**
Same as Mode 1, but VIYO also deploys to Klaviyo as a draft without waiting for user approval. User receives notification: "We built your Abandoned Cart flow overnight. It's in Klaviyo as a draft — activate when ready." Zero clicks at any point in the pipeline.

Setting lives in brand preferences: `auto_generate_flows: boolean`. Off by default. User opts in explicitly from Settings.

---

#### Auto-Brief Assembler

Instead of asking the user for a brief, VIYO assembles one from data already in the database. Every field a user would normally type is derived from stored brand data.

```typescript
async function assembleFlowBrief(brandId: string, flowType: string): Promise<FlowBrief> {
  const [brand, voiceHistory, winningFormulas, products, safeOffers, verticalConfig] =
    await Promise.all([
      db.query.brands.findFirst({ where: eq(brands.id, brandId) }),
      db.query.brandVoiceHistory.findFirst({
        where: eq(brandVoiceHistory.brand_id, brandId),
        orderBy: [desc(brandVoiceHistory.created_at)]
      }),
      db.query.winningFormulas.findMany({
        where: and(
          eq(winningFormulas.brand_id, brandId),
          eq(winningFormulas.flow_type, flowType)
        ),
        limit: 5,
        orderBy: [desc(winningFormulas.click_rate)]
      }),
      db.query.shopifyProducts.findMany({
        where: eq(shopifyProducts.brand_id, brandId),
        orderBy: [desc(shopifyProducts.total_sales)],
        limit: 10
      }),
      db.query.safeOffers.findMany({ where: eq(safeOffers.brand_id, brandId) }),
      db.query.verticals.findFirst({
        where: eq(verticals.key, brand.primary_vertical_key)
      })
    ]);

  const seasonalAngle = getSeasonalAngle(brand.primary_vertical_key, new Date());

  return {
    flow_type: flowType,
    brand_name: brand.name,
    brand_voice: voiceHistory?.signals,
    brand_voice_summary: brand.brand_voice_summary,
    hero_products: products.slice(0, 3).map(p => ({
      id: p.shopify_product_id,
      name: p.title,
      price: p.price,
      image_url: p.image_url,
    })),
    safe_offers: safeOffers,
    winning_formulas: winningFormulas,
    seasonal_angle: seasonalAngle,
    vertical_benchmarks: verticalConfig,
  };
}
```

If a field has no data (brand new account, no history), the brain falls back to vertical benchmarks from the `verticals` table. The pipeline never fails due to missing brand data — it degrades gracefully.

**Fallback Handling**

| Missing Data | Fallback |
|---|---|
| No brand voice history | Vertical default voice from `niche_prompt_fragments` |
| No winning formulas | Top Brain patterns for the vertical |
| No product sales ranking | Shopify product creation date (newest first) |
| No safe offers | Flow generates without offer — `offer: null` — flagged in review |
| No products at all | Placeholder used — user notified to sync Shopify |

Thin-data flows include a "Review carefully before activating" banner on the approval screen.

---

#### Automatic Layout Selection

Each email type in a flow is assembled from a sequence of composable sections based on content patterns.

```typescript
// FLOW_EMAIL_LAYOUT_MAP is the seed data for flow_types.layout_map (JSONB) — Section 23.
// DEPRECATED: The layoutMap has been replaced by dynamic section assembly.
// To add a layout for a new flow type: include layout_map in the flow_types INSERT.
const FLOW_EMAIL_LAYOUT_MAP: Record<string, Record<number, string>> = {
  welcome_series: {
    1: 'editorial_letter',        // Email 1: warm brand welcome — copy-forward
    2: 'product_drop',            // Email 2: bestsellers showcase
    3: 'hero_standard',           // Email 3: incentive offer
  },
  abandoned_cart: {
    1: 'abandoned_cart_reminder', // Email 1: urgency — product still in cart
    2: 'hero_standard',           // Email 2: social proof + urgency escalation
    3: 'urgent_last_chance',      // Email 3: last chance + offer
  },
  post_purchase: {
    1: 'editorial_letter',        // Email 1: thank you + what's next
    2: 'zig_zag_feature',         // Email 2: cross-sell related products
    3: 'review_spotlight',        // Email 3: review request + community
  },
  win_back: {
    1: 'hero_standard',           // Email 1: "we miss you" — brand re-introduction
    2: 'product_drop',            // Email 2: what's new since they left
    3: 'urgent_last_chance',      // Email 3: offer to convert
  },
  browse_abandonment: {
    1: 'abandoned_cart_reminder', // Email 1: "still thinking about it?"
    2: 'review_spotlight',        // Email 2: social proof on browsed product
  },
  vip_welcome: {
    1: 'editorial_letter',        // Email 1: exclusive welcome
    2: 'collection_showcase',     // Email 2: VIP-only or early access products
  },
  sunset: {
    1: 'hero_standard',           // Email 1: "it's been a while"
    2: 'product_drop',            // Email 2: what's changed — new arrivals
    3: 'urgent_last_chance',      // Email 3: final offer before list suppression
  },
};
```

---

#### Email Design Brain — Hard Constraints (Design Addendum A.1, A.2)

The following constraints are enforced at the Email Design Brain level, before the email reaches Preflight. They are non-negotiable and cannot be overridden by the CMO Brain or any other brain.

1. **60/40 Text-to-Image Ratio:** Emails must be at least 60% text by pixel height (60% text, 40% image maximum). The system calculates the text-to-image ratio of the final assembled email in real-time. When an image-heavy email cannot meet the threshold, the **Text Filler Fallback** system auto-injects a smaller-font footer section (brand tips, product care notes, or curated content snippets from the vertical doctrine) to push the ratio above the floor. The filler is rendered at 11px in `#999999`, visually recessive but fully readable, and is never promotional.

2. **Text-on-Bottom Layout:** All headlines, body copy, and CTA text must sit below images in the visual hierarchy — never overlaid on top of images. This is a hard constraint because text-on-image overlays: (a) break on Outlook/Windows Mail, (b) fail accessibility screen readers, (c) are unreadable on mobile at small sizes. The only exception is when `brands.allow_text_overlay` is explicitly set to `true` in Settings (default: `false`). MJML recipes with `has_text_overlay: true` metadata are filtered out when the toggle is off.

3. **Section Metadata Requirements:** Each composable section component must include metadata for `has_text_overlay` and `overlay_text_slots` if it supports text-on-image overlays. This allows the Email Design Brain to correctly map copy when `brands.allow_text_overlay` is true. Sections without this metadata are assumed not to support overlays.

4. **Critic Brain Pre-Check (The Ratio Gate):** Before the Email Design Brain assembles the final email, the Critic Brain evaluates the generated copy length against the planned sections. If the copy is too short to hit the 60% text ratio floor for the assembled layout, the Critic Brain intercepts the DAG and forces the Copywriter Brain to generate a longer variant (or add a secondary content block). This prevents expensive compilation cycles that are guaranteed to fail Preflight.

---

#### Automatic Subject Line Generation — 3 Variants Per Email

For every email in the flow, the Copywriter Brain generates 3 subject line variants in a single Claude call. Variants are pre-loaded into Klaviyo's native A/B subject line testing. Winner selected after 4 hours by open rate. Winning pattern written back to `winning_formulas`.

Each email position has 3 pre-defined angles:

```typescript
// SUBJECT_ANGLES is the seed data for flow_types.subject_angles (JSONB) — Section 23.
// In production: const angles = await getSubjectAngles(flowTypeId, emailPosition);
// To add angles for a new flow type: include subject_angles in the flow_types INSERT.
const SUBJECT_ANGLES: Record<string, [string, string, string]> = {
  welcome_series_1:    ['curiosity', 'direct_welcome', 'brand_story'],
  welcome_series_2:    ['fomo', 'social_proof', 'product_forward'],
  welcome_series_3:    ['soft_offer', 'urgency', 'personal'],
  abandoned_cart_1:    ['urgency', 'curiosity', 'product_name'],
  abandoned_cart_2:    ['social_proof', 'scarcity', 'soft_nudge'],
  abandoned_cart_3:    ['last_chance', 'offer_led', 'direct'],
  post_purchase_1:     ['warm_thanks', 'excitement', 'whats_next'],
  post_purchase_2:     ['you_might_also', 'curated_for_you', 'trending'],
  post_purchase_3:     ['feedback_request', 'community', 'review_ask'],
  win_back_1:          ['nostalgia', 'curiosity', 'soft_check_in'],
  win_back_2:          ['whats_new', 'product_forward', 'fomo'],
  win_back_3:          ['last_chance', 'offer_led', 'direct'],
  browse_abandonment_1:['curiosity', 'product_name', 'soft_nudge'],
  browse_abandonment_2:['social_proof', 'scarcity', 'urgency'],
};

// Example output for abandoned_cart email 1:
// variant_a: "You left something behind"           // curiosity
// variant_b: "Your cart expires in 24 hours"       // urgency
// variant_c: "The [Product Name] is still waiting" // product_name
```

---

#### Full Automatic Pipeline

```
Gap Detected (gap analysis worker)
    ↓
assembleFlowBrief()            ← derived from brand data — no user input
    ↓
Flow Strategy Brain            ← email count, timing, angles, splits
    ↓
Parallel Council + NanoBanana  ← all emails generated simultaneously
    ↓
3 subject variants per email   ← generated inside Copywriter Brain call
    ↓
MJML compilation               ← deterministic, no AI at compile time
    ↓
Preflight (all checks)         ← spam / grammar / links / size / price / offer
    ↓
Flow Assembler                 ← Klaviyo Flows API payload
    ↓
Klaviyo deploy (draft)         ← templates uploaded + flow created
    ↓
Notification fired             ← "Your [Flow Name] is ready to review"
```

Total wall-clock time: same as a single campaign (parallel execution). A 3-email welcome series completes in 30-60 seconds regardless of email count.

---

#### Approval Screen (The Only User Touchpoint)

```
┌──────────────────────────────────────────────────────────┐
│  Your Welcome Series is ready                            │
│  Generated automatically · 3 emails · 3 tokens used     │
│                                                          │
│  [Email 1] → 2 days → [Email 2] → 3 days → [Email 3]    │
│                                                          │
│  Subject A/B variants loaded ✓   Preflight passed ✓      │
│                                                          │
│  [Deploy to Klaviyo (Draft)]   [Regenerate]   [Edit]     │
└──────────────────────────────────────────────────────────┘
```

Each email thumbnail is clickable — full preview with desktop/mobile toggle. Individual emails can be regenerated without regenerating the full flow. One click deploys the entire flow to Klaviyo as a draft. User activates manually in Klaviyo.

---

### Welcome Series Offer Configuration (V1.1)

> **Scope: Branch B (organic) subscribers only.** This configuration governs subscribers who arrived without a discount being promised at signup — organic, footer, blog, popup-no-offer. For subscribers who were shown a discount at signup (popup_discount, social_bio), the signup contract overrides these settings and the code is always delivered in Email 1 regardless of the mode chosen here. See Section 20Z for the full branching architecture.

Whether to include a discount in the welcome series is a brand-level strategic decision. VIYO never applies a default discount. The brand configures their welcome offer policy once — the Offer Brain and Copywriter Brain respect it on every generation for Branch B subscribers.

---

#### Three Offer Modes

| Mode | Description | Best For |
|---|---|---|
| `no_discount` | No offer in any welcome email. Brand story, product, community only. | Luxury, premium, high-AOV brands |
| `fixed` | Offer in Email 1. Convert immediately on first contact. | Budget, high-volume, low-AOV brands |
| `conditional` | Offer withheld until Email 3. Conversion push after brand story. Recommended default. | Most mid-market brands |

**Why conditional is the recommended default:** Emails 1 and 2 build desire. Email 3 converts holdouts. This structure filters out discount-seekers (who won't wait three emails) and rewards genuinely interested subscribers. It also protects margins — most subscribers who were going to buy anyway do so before the offer email arrives.

---

#### Recommendation Engine

VIYO pre-selects a recommendation before the user sees the config screen. Shown as a labelled chip — not a forced default.

```typescript
function recommendWelcomeOfferMode(
  vertical: string,
  aov: number,
  brandTier: 'budget' | 'mid' | 'premium' | 'luxury'
): WelcomeOfferRecommendation {

  if (brandTier === 'luxury') {
    return {
      mode: 'no_discount',
      reason: 'Discounts conflict with luxury positioning. Lead with exclusivity.',
    };
  }
  if (brandTier === 'premium' || aov > 200) {
    return {
      mode: 'conditional',
      position: 3,
      suggested_offer: 'free_shipping',
      reason: 'Free shipping protects margin and brand equity better than a percentage discount.',
    };
  }
  if (aov < 80) {
    return {
      mode: 'fixed',
      position: 1,
      suggested_offer: 'ten_percent_off',
      reason: 'Low AOV brands benefit from an immediate conversion push.',
    };
  }
  return {
    mode: 'conditional',
    position: 3,
    suggested_offer: 'ten_percent_off',
    reason: 'Most effective structure: build desire first, convert with offer last.',
  };
}
```

---

#### UI — Onboarding and Settings

Surfaced during `/onboarding/ready` and editable at any time in Settings > Brand Preferences > Welcome Series.

```
┌──────────────────────────────────────────────────────────┐
│  Would you like to include a welcome offer?              │
│                                                          │
│  ○  No discount — lead with brand story                  │
│  ○  Offer in Email 1 — convert immediately               │
│  ●  Offer in Email 3 — recommended for most brands       │
│     Withheld as a conversion push after brand intro      │
│                                                          │
│  Which offer?  [10% off first order ▾]                   │
│  Custom headline (optional): [                       ]   │
└──────────────────────────────────────────────────────────┘
```

Offer dropdown pulls from the brand's `safe_offers` array. Only eligible offers are shown. Changing the config after a flow is deployed surfaces a notification — VIYO does not modify live flows automatically.

---

#### Offer Brain Constraints by Mode

```
// no_discount
"This brand does not use welcome discounts. Output offer: null for all emails.
Do not suggest, imply, or hint at any future discount. Copy strategy: brand
story, product quality, and community only."

// fixed — current email IS the offer position
"Include the configured offer. Offer: {{offer_display}} from safe_offers.
Do not invent offer terms not defined in the offer object."

// conditional — current email is NOT the offer position
"No offer in this email. Output offer: null.
CRITICAL: Do not hint that a future offer is coming. Do not use phrases like
'stay tuned', 'something special coming', or any language implying a future
discount. Subscribers must not learn to skip to Email 3."

// conditional — current email IS the offer position
"This is the conversion email. Include the configured offer.
Frame it as a reward for their interest — not a standard promotion."
```

The no-hint constraint on non-offer emails is critical for Branch B subscribers. If Email 1 signals a future offer, subscribers skip Emails 1 and 2, destroying engagement metrics for those emails. **This constraint does not apply to Branch A (popup_discount) subscribers — their Email 1 is explicitly a code delivery email. The Copywriter Brain receives `signupContext` in the brief and applies the correct framing automatically: discount-led for Branch A, story-led for Branch B.**

---

#### Copywriter Brain — Copy Strategy by Mode

| Mode | Strategy | CTA Frame |
|---|---|---|
| No discount | Brand mission, editorial product framing, community | "Shop the collection" |
| Fixed (Email 1) | Welcome + offer first, product proof, urgency | "Claim your 10% off" |
| Conditional (Emails 1-2) | Brand story, bestsellers, no offer signal | "Shop new arrivals" |
| Conditional (Email 3) | Personal gesture framing, single best-fit product | "Use your welcome gift" |

"Welcome gift" framing consistently outperforms "discount" framing in A/B tests — positions the offer as generosity rather than a transaction.

---

#### Schema — New Columns on `brands` Table

```typescript
welcome_offer_mode: text('welcome_offer_mode').default('conditional'),
  // 'no_discount' | 'fixed' | 'conditional'
welcome_offer_id: uuid('welcome_offer_id').references(() => safeOffers.id),
  // null if no_discount mode
welcome_offer_position: integer('welcome_offer_position').default(3),
  // which email position gets the offer — 1, 2, or 3
welcome_offer_headline: text('welcome_offer_headline'),
  // optional custom headline — overrides Copywriter Brain's generated offer headline
```

---

### Discount Cap System (V1.1)

Every flow type has a maximum discount ceiling enforced at the system level. These caps exist to protect brand margin and brand positioning. The Offer Brain cannot select an offer that exceeds the cap for the current flow type and email position — even if a larger offer exists in the brand's `safe_offers` array.

---

#### System-Level Caps

```typescript
// packages/core-types/src/constants/discount-caps.ts

export const SYSTEM_DISCOUNT_CAPS: Record<string, number> = {
  welcome_series:        20,  // % — a higher welcome discount trains customers to wait for the next welcome offer
  abandoned_cart:        15,  // % — cart abandoners have high intent; rarely need deep discounts
  browse_abandonment:    10,  // % — low intent signal; discount too early destroys margin unnecessarily
  post_purchase:          0,  // % — never discount a product the customer just bought at full price
  win_back:              30,  // % — highest allowable; this is the last-resort save
  vip_welcome:            0,  // % — VIP welcome is about exclusivity, not discounts
  sunset:                25,  // % — make it worth re-engaging, but don't crater margin
};

// Email-position-level caps within a flow
// An escalation cap: Email 1 can offer less than Email 3 within the same flow
export const POSITION_ESCALATION_CAPS: Record<string, Record<number, number>> = {
  abandoned_cart: {
    1: 0,   // Email 1: no offer — urgency and reminder only
    2: 10,  // Email 2: small offer if needed
    3: 15,  // Email 3: max offer — full system cap
  },
  win_back: {
    1: 0,   // Email 1: emotional re-engagement, no offer
    2: 20,  // Email 2: meaningful offer
    3: 30,  // Email 3: best offer ever — full system cap
  },
  welcome_series: {
    1: 0,   // Email 1: never — brand intro
    2: 0,   // Email 2: never — brand story
    3: 20,  // Email 3: full welcome cap
    4: 20,  // Email 4: same cap if 4-email series
  },
};
```

---

#### Brand-Level Cap Override

Brands can set caps **at or below** the system caps. They cannot exceed system caps.

```typescript
// New columns on brands table
brand_discount_cap_overrides: jsonb('brand_discount_cap_overrides').default({}),
// Structure: { welcome_series: 15, abandoned_cart: 10 }
// Brand sets 15% max welcome offer even though system allows 20%
```

A luxury brand, for example, would set `welcome_series: 0` — overriding the system to enforce zero welcome discounts regardless of what's in their `safe_offers` array.

---

#### getEligibleOffers()

This function is the single gating function called by the Offer Brain context builder. It filters `safe_offers` before any brain ever sees them. The Offer Brain never receives offers that exceed the cap for the current context.

```typescript
// packages/core-types/src/billing/offers.ts
import { SYSTEM_DISCOUNT_CAPS, POSITION_ESCALATION_CAPS } from '../constants/discount-caps';

export interface OfferContext {
  flowType: string;
  emailPosition: number;
  brandId: string;
}

export async function getEligibleOffers(
  brandId: string,
  flowType: string,
  emailPosition: number,
): Promise<SafeOffer[]> {
  // 1. Get brand's full safe_offers array
  const allOffers = await db.select().from(safeOffers)
    .where(eq(safeOffers.brand_id, brandId));

  // 2. Get brand-level cap override (if any)
  const [brand] = await db.select({ overrides: brands.brand_discount_cap_overrides })
    .from(brands).where(eq(brands.id, brandId));
  const brandOverride = brand?.overrides?.[flowType];

  // 3. Determine effective cap
  const systemCap = SYSTEM_DISCOUNT_CAPS[flowType] ?? 0;
  const positionCap = POSITION_ESCALATION_CAPS[flowType]?.[emailPosition] ?? systemCap;
  const effectiveCap = Math.min(
    systemCap,
    positionCap,
    brandOverride !== undefined ? brandOverride : Infinity,
  );

  // 4. Filter offers that exceed the cap
  return allOffers.filter(offer => {
    if (offer.offer_type === 'no_discount') return true;
    if (offer.offer_type === 'percentage_off') return (offer.offer_value ?? 0) <= effectiveCap;
    // Dollar-off offers: convert to approximate % using brand AOV for comparison
    if (offer.offer_type === 'dollar_off' && brand?.avg_order_value) {
      const approxPct = ((offer.offer_value ?? 0) / brand.avg_order_value) * 100;
      return approxPct <= effectiveCap;
    }
    return true; // free_shipping, gwp, bogo — not % based, always eligible
  });
}
```

---

#### Escalation Prevention (Subscriber-Level)

A subscriber who received a 10% cart abandonment offer must not receive a 15% offer the next time they abandon a cart within 30 days. This is escalation — it trains customers to abandon carts to unlock bigger discounts.

```typescript
// Checked before getEligibleOffers() runs
export async function hasRecentOffer(
  brandId: string,
  profileId: string,
  flowType: string,
  windowDays: number = 30,
): Promise<{ hasOffer: boolean; lastOfferValue: number | null }> {
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const [record] = await db.select()
    .from(subscriberFlowState)
    .where(
      and(
        eq(subscriberFlowState.brand_id, brandId),
        eq(subscriberFlowState.profile_id, profileId),
        eq(subscriberFlowState.flow_type, flowType),
        gte(subscriberFlowState.last_offer_sent_at, cutoff),
      )
    );
  return {
    hasOffer: !!record?.last_offer_value,
    lastOfferValue: record?.last_offer_value ?? null,
  };
}

// If hasOffer is true, cap the next offer at the SAME value as last time
// Never escalate — only match or reduce
```

---

#### Offer Brain — Discount Cap Enforcement Constraint

The following hard constraint is added to the Offer Brain's system prompt Layer 1:

```
DISCOUNT CAP CONSTRAINT (VIOLATION CAUSES FINANCIAL DAMAGE):
5. YOU MUST NEVER select an offer that exceeds the per-flow discount cap.
   The safe_offers array you receive has already been filtered to cap-eligible offers only.
   If you see no discount offers in the array for this email position, that means
   this position does not allow a discount. Output offer_type: "no_discount".
   Never ask why. Never suggest an exception. Caps are non-negotiable.
```

---

### Flow Naming Convention (V1.1)

All VIYO-generated flows, email templates, and SMS steps follow a strict naming convention enforced at a single point — the Flow Assembler. No other part of the codebase generates flow or template names.

---

#### Naming Targets

| Target | Format | Example |
|---|---|---|
| Flow name (Klaviyo) | `Viyo - [Flow Type]` | `Viyo - Abandoned Cart` |
| Email template name | `Viyo - [Flow Type] - Email [N] - [Angle]` | `Viyo - Abandoned Cart - Email 1 - Urgency` |
| SMS step label | `Viyo - [Flow Type] - SMS [N]` | `Viyo - Abandoned Cart - SMS 1` |

---

#### Naming Registry

Single source of truth. All flow types map here. Adding a new flow type = one line added. Everything downstream picks it up automatically.

```typescript
// packages/flows/naming.ts

export const FLOW_DISPLAY_NAMES: Record<string, string> = {
  welcome_series:     'Welcome Series',
  abandoned_cart:     'Abandoned Cart',
  post_purchase:      'Post-Purchase',
  browse_abandonment: 'Browse Abandonment',
  win_back:           'Win-Back',
  vip_welcome:        'VIP Welcome',
  sunset:             'Sunset',
};

export function getFlowDisplayName(flowType: string): string {
  const name = FLOW_DISPLAY_NAMES[flowType];
  if (!name) throw new Error(`Unknown flow type: ${flowType}`);
  return name;
}
```

---

#### Collision Handling — Versioned Names

If a brand already has a VIYO flow of the same type, the name increments automatically.

```typescript
export async function generateFlowName(brandId: string, flowType: string): Promise<string> {
  const baseName = `Viyo - ${getFlowDisplayName(flowType)}`;

  const existing = await db
    .select({ count: sql<number>`count(*)` })
    .from(flows)
    .where(and(
      eq(flows.brand_id, brandId),
      eq(flows.flow_type, flowType),
      ne(flows.status, 'deleted'),
    ));

  const count = existing[0].count;
  if (count === 0) return baseName;
  return `${baseName} (${count + 1})`;
}

// "Viyo - Abandoned Cart"      ← first
// "Viyo - Abandoned Cart (2)"  ← second
// "Viyo - Abandoned Cart (3)"  ← third
```

Collision check runs against VIYO's `flows` table — not Klaviyo's API. Fast, no extra API call.

---

#### Template Naming

```typescript
export function generateTemplateName(
  flowType: string,
  emailPosition: number,
  angle: string
): string {
  const flowName = getFlowDisplayName(flowType);
  const angleDisplay = angle
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `Viyo - ${flowName} - Email ${emailPosition} - ${angleDisplay}`;
}

// "Viyo - Welcome Series - Email 1 - Brand Welcome"
// "Viyo - Abandoned Cart - Email 2 - Social Proof"
// "Viyo - Win-Back - Email 3 - Last Chance"
```

---

#### Single Enforcement Point — Flow Assembler

Both functions are called exclusively inside the Flow Assembler. No other file in the codebase generates flow or template names.

```typescript
// apps/worker/src/functions/flow-assembler.ts

export async function assembleFlow(brandId, flowPlan, generatedSteps) {

  const flowName = await generateFlowName(brandId, flowPlan.flow_type);

  const namedSteps = generatedSteps.map((step) => {
    if (step.type === 'email') {
      return {
        ...step,
        template_name: generateTemplateName(flowPlan.flow_type, step.position, step.angle),
      };
    }
    if (step.type === 'sms') {
      return {
        ...step,
        label: `Viyo - ${getFlowDisplayName(flowPlan.flow_type)} - SMS ${step.position}`,
      };
    }
    return step;
  });

  await db.update(flows).set({ flow_name: flowName }).where(eq(flows.id, flowPlan.session_id));

  return buildKlaviyoPayload(flowName, namedSteps, flowPlan);
}
```

---

#### Klaviyo Tag for Programmatic Identification

VIYO writes a `viyo-managed` tag and custom metadata to every Klaviyo flow on creation. This allows VIYO to find and manage its own flows even if the brand manually renames them in Klaviyo.

```typescript
flow.attributes.tags = ['viyo-managed'];
flow.attributes.custom_data = {
  viyo_flow_id:    flow.id,
  viyo_brand_id:   brandId,
  viyo_flow_type:  flowPlan.flow_type,
  viyo_created_at: new Date().toISOString(),
};
```

When VIYO needs to find its flows in Klaviyo (for updates, re-analysis, deletion), it filters by `viyo-managed` tag — not by name.

---

#### Preflight Name Check (Hard Fail)

```typescript
if (!flowName.startsWith('Viyo - ')) {
  throw new Error(`Flow name "${flowName}" violates naming convention`);
}
for (const step of namedSteps) {
  if (step.type === 'email' && !step.template_name.startsWith('Viyo - ')) {
    throw new Error(`Template name "${step.template_name}" violates naming convention`);
  }
}
```

Hard fail — if naming is wrong, the flow does not deploy. Since naming is only ever generated by `generateFlowName()` and `generateTemplateName()`, this check should never fail in normal operation. It exists to catch any future code path that bypasses the registry.

---

### Flow Timing Optimization and Overlap Prevention (V1.1)

Two systems that run together on every flow: one determines when each step sends, the other prevents a subscriber from being caught in multiple competing flows simultaneously.

---

#### Part 1 — Optimal Send Timing and Cadence

**Three Layers of Timing Intelligence**

**Layer 1 — Flow type constraints (non-negotiable)**

Each flow type has hard and soft timing rules. Hard steps send at exactly the specified delay. Soft steps are minimums — actual send time is adjusted to the next optimal window within a flex tolerance.

```typescript
const FLOW_TIMING_CONSTRAINTS: Record<string, {
  steps: Array<{ delay_hours: number; hard: boolean; sto_flex_hours: number }>
}> = {
  abandoned_cart: {
    steps: [
      { delay_hours: 1,   hard: true,  sto_flex_hours: 0  }, // Email 1 — always +1hr
      { delay_hours: 24,  hard: true,  sto_flex_hours: 2  }, // Email 2 — ±2hr only
      { delay_hours: 72,  hard: false, sto_flex_hours: 6  }, // Email 3 — 6hr flex
    ]
  },
  browse_abandonment: {
    steps: [
      { delay_hours: 1,   hard: true,  sto_flex_hours: 0  },
      { delay_hours: 24,  hard: false, sto_flex_hours: 6  },
    ]
  },
  welcome_series: {
    steps: [
      { delay_hours: 0,   hard: true,  sto_flex_hours: 0  }, // Email 1 — immediate always
      { delay_hours: 48,  hard: false, sto_flex_hours: 12 }, // Email 2 — 12hr flex
      { delay_hours: 120, hard: false, sto_flex_hours: 24 }, // Email 3 — 24hr flex
    ]
  },
  post_purchase: {
    steps: [
      { delay_hours: 24,  hard: false, sto_flex_hours: 6  },
      { delay_hours: 168, hard: false, sto_flex_hours: 24 }, // 7 days
      { delay_hours: 504, hard: false, sto_flex_hours: 48 }, // 21 days
    ]
  },
  win_back: {
    steps: [
      { delay_hours: 0,   hard: false, sto_flex_hours: 24 },
      { delay_hours: 168, hard: false, sto_flex_hours: 48 },
      { delay_hours: 336, hard: false, sto_flex_hours: 48 },
    ]
  },
};
```

**Layer 2 — STO Matrix (brand-specific)**

Per-brand, per-day, per-hour engagement score built from historical flow and campaign data. Used to find the optimal send window for soft steps.

```typescript
type STOMatrix = {
  [day: string]: {      // 'monday' through 'sunday'
    [hour: number]: {   // 0 through 23
      open_rate: number;
      click_rate: number;
      sample_size: number;
      composite_score: number; // click_rate * 0.6 + open_rate * 0.4
    }
  }
}
```

Built by the STO Matrix Worker from existing flow stats and campaign history. Cold-start uses vertical benchmarks until 20+ data points exist:

| Vertical | Peak Days | Peak Hours (local) |
|---|---|---|
| Fashion / Lifestyle | Tuesday, Thursday | 10am-12pm, 7pm-9pm |
| Beauty / Skincare | Sunday, Wednesday | 7pm-9pm, 9am-11am |
| Home Goods | Thursday, Saturday | 11am-1pm |
| Food / Beverage | Friday, Sunday | 11am-12pm, 5pm-7pm |

**Layer 3 — Klaviyo Smart Send Time (SST)**

For all soft steps, VIYO enables Klaviyo's native Smart Send Time, bounded within the flex window. Klaviyo optimizes per-profile within VIYO's guardrails.

```typescript
// Flow assembly — STO-flex step
{
  action_type: 'send-email',
  template_id: emailTemplateId,
  smart_send_time: {
    enabled: true,
    window_start_hours: step.delay_hours,
    window_end_hours: step.delay_hours + step.sto_flex_hours,
  }
}
```

**Timing Decision Tree Per Step**

```
Is step hard: true?
  YES → Send at exactly delay_hours. No adjustment.
  NO  →
    Brand STO matrix has 20+ samples?
      YES → Find next optimal window within sto_flex_hours
      NO  → Use vertical benchmark window within sto_flex_hours
    Enable Klaviyo SST within that window for per-profile optimization.
```

**Cadence Safety Rules (Override Everything)**

```typescript
const CADENCE_SAFETY_RULES = {
  min_hours_between_emails:    20,  // Never two emails within 20 hours
  min_hours_between_sms:       24,  // Never two SMS within 24 hours
  min_hours_email_after_sms:    4,  // Minimum gap SMS → Email
  max_emails_per_week:          4,  // Across ALL flows combined
  max_sms_per_week:             2,  // Across ALL flows combined
  quiet_hours_sms_start:       20,  // 8pm local — no SMS
  quiet_hours_sms_end:         10,  // 10am local — no SMS
  quiet_hours_email_start:     22,  // 10pm local — no emails
  quiet_hours_email_end:        7,  // 7am local — no emails
};
```

---

#### Part 2 — Overlap Prevention

**Flow Conflict Groups**

Every flow belongs to one conflict group. Only one flow per group can be active per subscriber at any time.

```typescript
// FLOW_CONFLICT_GROUPS is the seed data for flow_types.conflict_group — Section 23.
// In production: const group = await getFlowConflictGroup(flowTypeId);
// To assign a conflict group for a new flow type: include conflict_group in the flow_types INSERT.
const FLOW_CONFLICT_GROUPS: Record<string, string> = {
  abandoned_cart:     'urgency',
  browse_abandonment: 'urgency',
  welcome_series:     'lifecycle',
  win_back:           'lifecycle',
  vip_welcome:        'lifecycle',
  sunset:             'lifecycle',
  post_purchase:      'post_action',
  // date_anchored flows don't conflict with any group — they are calendar-driven, not subscriber-state-driven
};

// Which groups block each other
const GROUP_EXCLUSIONS: Record<string, string[]> = {
  urgency:     ['urgency', 'lifecycle'],  // blocks itself + lifecycle
  lifecycle:   ['lifecycle', 'urgency'],  // blocks itself + urgency
  post_action: ['post_action'],           // blocks only itself
};
```

**What CAN run simultaneously:**
- Post-purchase + Welcome Series (post_action + lifecycle)
- Post-purchase + Abandoned Cart (post_action + urgency)

**What CANNOT run simultaneously:**
- Abandoned Cart + Browse Abandonment (both urgency)
- Welcome Series + Win-Back (both lifecycle)
- Abandoned Cart + Welcome Series (urgency blocks lifecycle)

**Flow Priority Hierarchy**

```typescript
// FLOW_PRIORITY is the seed data for flow_types.priority — Section 23.
// In production: const priority = await getFlowPriority(flowTypeId);
// To set priority for a new flow type: include priority in the flow_types INSERT (0-100 scale).
const FLOW_PRIORITY: Record<string, number> = {
  abandoned_cart:       100, // Highest — direct purchase intent
  browse_abandonment:    90, // High — strong intent signal
  post_purchase:         80, // High — time-sensitive retention window
  welcome_series:        70, // Medium — foundational but flexible
  anniversary_reminder:  75, // Medium-high — date-anchored, high intent
  birthday_reminder:     75, // Medium-high — date-anchored, high intent
  vip_welcome:           65, // Medium — celebratory
  win_back:              60, // Medium — re-engagement
  sunset:                40, // Lowest — last resort
};
```

**Conflict Resolution Engine**

Runs on every flow trigger before any flow entry is allowed.

```typescript
type ConflictResolution =
  | { action: 'enter';   reason: string }
  | { action: 'preempt'; pause_flow_id: string; pause_at_step: number; resume_after_hours: number; reason: string }
  | { action: 'queue';   queue_after_flow_id: string; reason: string }
  | { action: 'block';   reason: string };

async function resolveFlowConflict(
  brandId: string,
  profileId: string,
  incomingFlowType: string
): Promise<ConflictResolution> {

  const incomingPriority = FLOW_PRIORITY[incomingFlowType];
  const incomingGroup = FLOW_CONFLICT_GROUPS[incomingFlowType];
  const blockedGroups = GROUP_EXCLUSIONS[incomingGroup];

  const activeFlows = await db.query.subscriberFlowState.findMany({
    where: and(
      eq(subscriberFlowState.brand_id, brandId),
      eq(subscriberFlowState.klaviyo_profile_id, profileId),
      eq(subscriberFlowState.status, 'active')
    )
  });

  for (const activeFlow of activeFlows) {
    if (!blockedGroups.includes(activeFlow.conflict_group)) continue;

    const activePriority = FLOW_PRIORITY[activeFlow.flow_type];

    if (incomingPriority > activePriority) {
      return {
        action: 'preempt',
        pause_flow_id: activeFlow.flow_id,
        pause_at_step: activeFlow.current_step,
        resume_after_hours: estimateFlowDuration(incomingFlowType),
        reason: `${incomingFlowType} (${incomingPriority}) outranks active ${activeFlow.flow_type} (${activePriority})`,
      };
    } else {
      return {
        action: 'queue',
        queue_after_flow_id: activeFlow.flow_id,
        reason: `Active ${activeFlow.flow_type} (${activePriority}) outranks incoming ${incomingFlowType} (${incomingPriority})`,
      };
    }
  }

  return { action: 'enter', reason: 'no_conflict' };
}
```

**Preemption and Resumption**

When a higher-priority flow pauses a lower-priority one, the paused flow resumes after completion — only if resumption is still relevant.

```typescript
async function shouldResumeFlow(flow: SubscriberFlowState, profileId: string): Promise<boolean> {
  const daysPaused = differenceInDays(new Date(), flow.paused_at);
  if (daysPaused > 30) return false;

  if (flow.flow_type === 'welcome_series') {
    const hasPurchased = await checkKlaviyoMetric(profileId, 'Placed Order');
    if (hasPurchased) return false; // skip incentive emails — irrelevant
  }

  if (flow.flow_type === 'win_back') {
    const reEngaged = await checkKlaviyoMetric(profileId, 'Opened Email', { days: 14 });
    if (reEngaged) return false; // re-engagement achieved — exit flow
  }

  if (flow.flow_type === 'sunset') {
    const reEngaged = await checkKlaviyoMetric(profileId, 'Opened Email', { days: 30 });
    if (reEngaged) return false;
  }

  return true;
}
```

**Implementation at the Klaviyo Level**

Two layers work together:

**Layer 1 — Klaviyo profile properties (runs natively in Klaviyo)**

When a subscriber enters a VIYO flow, VIYO writes to their Klaviyo profile:
```
viyo_active_conflict_group: "urgency"
viyo_active_flow_entered_at: "2026-04-15T10:00:00Z"
```

Every VIYO-generated flow includes an entry condition:
```
viyo_active_conflict_group is not set
OR viyo_active_conflict_group does not equal [this flow's group]
```

Blocks double-entry directly in Klaviyo without VIYO infrastructure needing to intercept in real time.

**Layer 2 — Klaviyo webhooks + Conflict Engine (handles edge cases and preemption)**

Klaviyo sends webhooks on: flow entry, step completion, flow exit. VIYO's webhook handler:
1. Updates `subscriber_flow_state` on every event
2. Runs `resolveFlowConflict()` on every new trigger
3. Writes Klaviyo profile properties based on resolution outcome
4. On preempt: pauses current flow, queues resume event in Inngest

**Global Daily Frequency Cap**

Final safety net — regardless of conflict resolution outcome:

```typescript
async function checkFrequencyCap(
  brandId: string,
  profileId: string,
  channel: 'email' | 'sms'
): Promise<boolean> {
  const sentToday = await db.query.messageLog.count({
    where: and(
      eq(messageLog.brand_id, brandId),
      eq(messageLog.klaviyo_profile_id, profileId),
      eq(messageLog.channel, channel),
      gte(messageLog.sent_at, startOfDay(new Date())),
    )
  });
  const caps = { email: 2, sms: 1 };
  return sentToday < caps[channel];
}
```

Steps held by the cap are retried at the next eligible send window. Never skipped — only delayed.

**New Schema**

```typescript
export const subscriber_flow_state = pgTable('subscriber_flow_state', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id').references(() => brands.id).notNull(),
  klaviyo_profile_id: text('klaviyo_profile_id').notNull(),
  flow_id: uuid('flow_id').references(() => flows.id).notNull(),
  flow_type: text('flow_type').notNull(),
  conflict_group: text('conflict_group').notNull(),
  priority: integer('priority').notNull(),
  current_step: integer('current_step').default(1),
  status: text('status').default('active'), // 'active' | 'paused' | 'queued' | 'completed' | 'abandoned'
  entered_at: timestamptz('entered_at').defaultNow(),
  paused_at: timestamptz('paused_at'),
  expected_exit_at: timestamptz('expected_exit_at'),
  resume_after_flow_id: uuid('resume_after_flow_id'),
});

export const message_log = pgTable('message_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id').references(() => brands.id).notNull(),
  klaviyo_profile_id: text('klaviyo_profile_id').notNull(),
  flow_id: uuid('flow_id').references(() => flows.id),
  channel: text('channel').notNull(), // 'email' | 'sms'
  sent_at: timestamptz('sent_at').defaultNow(),
  step_position: integer('step_position'),
});
```

---

## 20B. Flow Intelligence System (V1.1)

Flow intelligence has two layers that run independently but feed the same goal: making every VIYO generation smarter using the brand's own historical email data.

---

### Layer 1 — Flow Ingestion Pipeline (Personal Brain Seeding)

Runs automatically when a brand connects Klaviyo. Runs again weekly via Inngest cron. The user never triggers it manually — it operates silently in the background and feeds the Personal Brain.

**What We Extract from Klaviyo**

Flows are nested 3 levels deep. The traversal order is fixed:

```
GET /api/flows/                          → list of flows (trigger type, status)
  └── GET /api/flows/{id}/flow-actions/  → email steps within each flow
        └── GET /api/flow-messages/{id}/ → subject, preview, HTML body, stats
```

| Signal | Where It Goes | Used By |
|---|---|---|
| Brand voice patterns | `brand_voice_history` | Every brain — tone matching |
| High-performing subject lines | `winning_formulas` | Copywriter Brain few-shot examples |
| Existing flow coverage | `brand_state` | CMO Brain — avoids duplicating flows |
| Missing flows (gap analysis) | `notifications` | Dashboard insight cards |
| STO data (send times that worked) | STO matrix | Audience Brain |
| Offer structures that converted | `winning_formulas` | Offer Brain |

**TypeScript Interface**

```typescript
// packages/adapters/esp/klaviyo/flows.ts

export interface KlaviyoFlowEmail {
  id: string;
  flowId: string;
  flowName: string;
  triggerType: string;    // 'added_to_list', 'checkout_started', 'placed_order', etc.
  position: number;       // 1st, 2nd, 3rd email in the flow
  subject: string;
  previewText: string;
  textContent: string;    // HTML stripped - plain copy only
  openRate: number | null;
  clickRate: number | null;
  revenuePerRecipient: number | null;
  unsubscribeRate: number | null;
}

export async function fetchAllFlowEmails(brandId: string): Promise<KlaviyoFlowEmail[]> {
  const conn = await getKlaviyoConnection(brandId);
  const results: KlaviyoFlowEmail[] = [];

  let flowsUrl = 'https://a.klaviyo.com/api/flows/?filter=equals(status,"active")&page[size]=50';
  while (flowsUrl) {
    const flowsRes = await klaviyoFetch(conn, flowsUrl);
    const flowsData = await flowsRes.json();

    for (const flow of flowsData.data) {
      const actionsRes = await klaviyoFetch(
        conn,
        `https://a.klaviyo.com/api/flows/${flow.id}/flow-actions/?filter=equals(action_type,"EMAIL")&page[size]=50`
      );
      const actionsData = await actionsRes.json();

      for (const [idx, action] of actionsData.data.entries()) {
        const msgRes = await klaviyoFetch(
          conn,
          `https://a.klaviyo.com/api/flow-messages/${action.id}/?fields[flow-message]=subject,preview_text,content,statistics`
        );
        const msg = await msgRes.json();

        results.push({
          id: action.id,
          flowId: flow.id,
          flowName: flow.attributes.name,
          triggerType: flow.attributes.trigger_type,
          position: idx + 1,
          subject: msg.data.attributes.subject ?? '',
          previewText: msg.data.attributes.preview_text ?? '',
          textContent: stripHtml(msg.data.attributes.content?.html ?? ''),
          openRate: msg.data.attributes.statistics?.open_rate ?? null,
          clickRate: msg.data.attributes.statistics?.click_rate ?? null,
          revenuePerRecipient: msg.data.attributes.statistics?.revenue_per_recipient ?? null,
          unsubscribeRate: msg.data.attributes.statistics?.unsubscribe_rate ?? null,
        });
      }
    }

    flowsUrl = flowsData.links?.next ?? null;
  }

  return results;
}

function stripHtml(html: string): string {
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<\/?(p|div|br|tr|td|h[1-6])[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}
```

**Step 1 — Coverage Map (deterministic, no AI)**

```typescript
async function buildCoverageMap(brandId: string, emails: KlaviyoFlowEmail[]) {
  const flowsByTrigger = emails.reduce((acc, email) => {
    acc[email.triggerType] = acc[email.triggerType] ?? {
      flowId: email.flowId,
      flowName: email.flowName,
      emailCount: 0,
    };
    acc[email.triggerType].emailCount++;
    return acc;
  }, {} as Record<string, { flowId: string; flowName: string; emailCount: number }>);

  for (const [triggerType, meta] of Object.entries(flowsByTrigger)) {
    await db.insert(brandState)
      .values({ brand_id: brandId, key: `flow_exists:${triggerType}`, value: JSON.stringify(meta) })
      .onConflictDoUpdate({
        target: [brandState.brand_id, brandState.key],
        set: { value: JSON.stringify(meta), updated_at: new Date() },
      });
  }
}
```

CMO Brain receives this during hydration:
```
Existing automated flows:
- checkout_started (Abandoned Cart) — 2 emails
- added_to_list (Welcome Series) — 3 emails
- placed_order (Post-Purchase) — 2 emails

Do not recommend campaigns that replicate these automations.
Focus on campaign opportunities the flows don't cover.
```

**Step 2 — Brand Voice Extraction (1 Claude call, batched)**

```typescript
async function extractBrandVoice(brandId: string, emails: KlaviyoFlowEmail[]) {
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });

  const emailSamples = emails
    .slice(0, 15)
    .map((e, i) => `--- Email ${i + 1} (${e.flowName}, position ${e.position}) ---
Subject: ${e.subject}
Preview: ${e.previewText}
Body:
${e.textContent.slice(0, 400)}`)
    .join('\n\n');

  const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 800,
    system: `You analyze email copy samples from a brand and extract consistent voice signals.
Return valid JSON only. No commentary.`,
    messages: [{
      role: 'user',
      content: `Analyze these ${emails.length} email samples from ${brand.name} and extract their brand voice.

${emailSamples}

Return this exact JSON structure:
{
  "tone": "formal|casual|playful|authoritative|warm|edgy",
  "formality_score": 1-10,
  "sentence_style": "short_punchy|medium_varied|long_flowing",
  "vocabulary": "simple|elevated|technical|colloquial",
  "signature_phrases": ["up to 5 recurring phrases or patterns"],
  "subject_line_patterns": ["question_format|single_word|fomo|curiosity|direct|emoji_led"],
  "cta_style": "direct|soft|conversational",
  "emoji_usage": "none|occasional|frequent",
  "personalization": "none|name_only|behavioral",
  "brand_personality_summary": "2-3 sentence description of this brand's voice"
}`,
    }],
  });

  const signals = JSON.parse(response.content[0].text);

  await db.insert(brandVoiceHistory).values({
    brand_id: brandId,
    source: 'klaviyo_flow_onboarding',
    source_id: `onboarding_${Date.now()}`,
    signals,
    email_sample_count: emails.length,
    created_at: new Date(),
  });

  await db.update(brands)
    .set({ brand_voice_summary: signals.brand_personality_summary })
    .where(eq(brands.id, brandId));
}
```

**Step 3 — Winning Formula Extraction (threshold comparison, no AI)**

```typescript
const PERFORMANCE_THRESHOLDS: Record<string, { clickRate: number; revenuePerRecipient: number }> = {
  fashion:       { clickRate: 0.025, revenuePerRecipient: 0.30 },
  beauty:        { clickRate: 0.030, revenuePerRecipient: 0.25 },
  home_goods:    { clickRate: 0.020, revenuePerRecipient: 0.40 },
  food_beverage: { clickRate: 0.035, revenuePerRecipient: 0.20 },
};

async function extractWinningFormulas(brandId: string, emails: KlaviyoFlowEmail[]) {
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
  const thresholds = PERFORMANCE_THRESHOLDS[brand.primary_vertical_key] ?? PERFORMANCE_THRESHOLDS.fashion;

  const winners = emails.filter(e =>
    (e.clickRate !== null && e.clickRate >= thresholds.clickRate) ||
    (e.revenuePerRecipient !== null && e.revenuePerRecipient >= thresholds.revenuePerRecipient)
  );

  for (const email of winners) {
    await db.insert(winningFormulas)
      .values({
        brand_id: brandId,
        subject_line: email.subject,
        preview_text: email.previewText,
        copy_snippet: email.textContent.slice(0, 600),
        click_rate: email.clickRate,
        revenue_per_recipient: email.revenuePerRecipient,
        flow_type: email.triggerType,
        source: 'klaviyo_flow',
        created_at: new Date(),
      })
      .onConflictDoNothing();
  }
}
```

**Step 4 — Gap Analysis (set comparison, no AI)**

```typescript
const EXPECTED_FLOWS: Record<string, Array<{ triggerType: string; name: string; priority: 'critical' | 'high' | 'medium' }>> = {
  fashion: [
    { triggerType: 'added_to_list',    name: 'Welcome Series',     priority: 'critical' },
    { triggerType: 'checkout_started', name: 'Abandoned Cart',     priority: 'critical' },
    { triggerType: 'placed_order',     name: 'Post-Purchase',      priority: 'critical' },
    { triggerType: 'viewed_product',   name: 'Browse Abandonment', priority: 'high'     },
    { triggerType: 'customer_winback', name: 'Win-Back',           priority: 'high'     },
    { triggerType: 'vip_threshold',    name: 'VIP Recognition',    priority: 'medium'   },
  ],
  beauty: [
    { triggerType: 'added_to_list',    name: 'Welcome Series',         priority: 'critical' },
    { triggerType: 'checkout_started', name: 'Abandoned Cart',         priority: 'critical' },
    { triggerType: 'placed_order',     name: 'Post-Purchase',          priority: 'critical' },
    { triggerType: 'replenishment',    name: 'Replenishment Reminder', priority: 'high'     },
    { triggerType: 'customer_winback', name: 'Win-Back',               priority: 'high'     },
  ],
};

async function runGapAnalysis(brandId: string, emails: KlaviyoFlowEmail[]) {
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
  const expectedFlows = EXPECTED_FLOWS[brand.primary_vertical_key] ?? EXPECTED_FLOWS.fashion;
  const existingTriggerTypes = new Set(emails.map(e => e.triggerType));
  const gaps = expectedFlows.filter(f => !existingTriggerTypes.has(f.triggerType));

  for (const gap of gaps) {
    await db.insert(notifications).values({
      brand_id: brandId,
      type: 'flow_gap',
      priority: gap.priority,
      title: `Missing flow: ${gap.name}`,
      body: `Your account doesn't have a ${gap.name} flow. This is one of the highest-ROI automations for ${brand.primary_vertical_key} brands. VIYO can build the campaign content to accompany one.`,
      metadata: { triggerType: gap.triggerType, flowName: gap.name },
      created_at: new Date(),
    });
  }
}
```

**Step 5 — STO Seed (best-effort)**

```typescript
async function seedSTOFromFlows(brandId: string, emails: KlaviyoFlowEmail[]) {
  const flowsWithStats = emails.filter(e => e.clickRate !== null && e.openRate !== null);
  if (flowsWithStats.length < 5) return; // not enough signal

  await db.insert(audienceMap).values({
    brand_id: brandId,
    source: 'flow_onboarding',
    signal_count: flowsWithStats.length,
    seeded_at: new Date(),
  }).onConflictDoNothing();
}
```

**Full Pipeline Function**

```typescript
// apps/worker/src/functions/analyze-flows.ts

export async function analyzeKlaviyoFlows(brandId: string) {
  const emails = await fetchAllFlowEmails(brandId);

  if (emails.length === 0) {
    await db.update(brands)
      .set({ flow_analysis_status: 'no_flows' })
      .where(eq(brands.id, brandId));
    return;
  }

  await buildCoverageMap(brandId, emails);
  await extractBrandVoice(brandId, emails);
  await extractWinningFormulas(brandId, emails);
  await runGapAnalysis(brandId, emails);
  await seedSTOFromFlows(brandId, emails);

  await db.update(brands)
    .set({
      flow_analysis_status: 'complete',
      flow_analysis_email_count: emails.length,
      flow_analysis_at: new Date(),
    })
    .where(eq(brands.id, brandId));
}
```

**Cost Per Brand**

| Step | Model | Typical Tokens | Cost |
|---|---|---|---|
| Brand voice extraction | claude-3-5-sonnet-20241022 | ~3,000 input / 800 output | ~$0.013 |
| Steps 1, 3, 4, 5 | No AI | - | $0 |
| **Total per brand** | | | **~$0.013** |

One-time cost absorbed by VIYO, not charged to the user's token balance.

**Re-Sync Schedule**

- Manual: user clicks "Refresh Brand Intelligence" in settings
- Automatic: Inngest cron every Sunday 02:00 UTC, incremental (only fetches emails created/updated since `flow_analysis_at`)

---

### Layer 2 — Flow Analyzer Agent (User-Facing)

The user-facing audit layer. A user consciously runs this to get a health report on their existing flows, see what's broken, and act on it directly from VIYO.

**How to Run It**

From the `/analyze` page or dashboard, user selects "Flow Analyzer" and clicks Run. The agent reads the data already synced by Layer 1 (no additional Klaviyo API calls needed for most checks) and scores each flow.

**5 Scoring Dimensions**

**1. Completeness** — Does the flow have the right number of emails for its type?
- Welcome series with 1 email: missing 2-4 high-converting touchpoints
- Abandoned cart with no 72-hour follow-up: missing the highest-converting email in the sequence
- Post-purchase with no review request email: leaving UGC and repeat purchase revenue on the table

**2. Timing** — Are the delays optimized?
- Welcome email 1 delayed more than 1 hour after subscribe: open rate damage
- Abandoned cart email 1 sent after 4 hours: benchmark is 1 hour
- Post-purchase email 2 after 30 days: benchmark is 7 days

**3. Performance** — How does this flow compare to vertical benchmarks?
- Open rate below 25%: subject line problem
- Click rate below 2%: layout or CTA problem
- Revenue per recipient below vertical average: offer or product selection problem
- High open, low click: email is interesting but CTA is weak or buried

**4. Structure** — Does the flow logic hold up?
- No conditional splits: openers and non-openers receiving identical follow-ups
- Filters too broad: welcome series triggering for existing customers
- Filters too narrow: win-back excluding clicked-but-didn't-buy profiles

**5. Content Quality** — Are the emails doing their job?
- No subject line A/B test active
- Preview text duplicates subject line or is missing
- Single product featured where multiple would improve CTR
- Generic CTA text ("Shop Now") instead of product-specific

**Scoring**

Each dimension scores 1-10. Overall health score is a weighted average. Findings are written to `brand_insights` with severity and revenue impact estimate.

**Revenue Impact Estimation**

VIYO estimates impact using the brand's own data — average revenue per email recipient multiplied by the number of people who would have received the missing or fixed email. Not fabricated — calculated from real Klaviyo metrics already in the database.

**From Analysis to Action — The "Fix with VIYO" Button**

Every insight card has a "Fix with VIYO" button. Clicking it pre-fills a generation brief using the `action_payload` stored in `brand_insights` and routes directly to the pipeline.

| Finding | Fix with VIYO Action |
|---|---|
| Welcome series missing email 3 | Generates email 3 only, appends to existing Klaviyo flow |
| Abandoned cart email 1 delay is 4 hours | Pre-fills timing fix, user confirms, VIYO updates flow via API |
| No conditional split after email 1 | Generates alternate subject for email 2, adds split to flow structure |
| Win-back open rate 12% vs 22% benchmark | Generates 3 new subject line variants, sets up A/B test in Klaviyo |

**Scheduled Re-Analysis**

Flow Analyzer runs weekly via Inngest cron and fires a notification if:
- Flow performance drops more than 20% week-over-week
- A live flow moves to draft status (possible accidental deactivation)
- A new flow is detected that VIYO hasn't analyzed yet
- Revenue attributed to a flow drops more than 20% in a 7-day window

---

## 20C. Automatic Segmentation System (V1.1)

Segmentation in VIYO covers two distinct capabilities that work together:

- **Segment Recommendations** — VIYO analyzes the brand's Klaviyo account and surfaces segments they should create but don't have
- **Automatic Segment Targeting** — when generating a campaign, VIYO selects the right segment automatically without the user having to choose

---

### Part A — Segment Recommendations

**What We Read from Klaviyo**

On connect and on every weekly re-sync, VIYO pulls:
- All existing segments (name, conditions, profile count, creation date)
- Performance data per segment (open rate, click rate, revenue per campaign type)
- Customer profile schema (which custom properties exist, Shopify purchase data: categories bought, order count, LTV, last purchase date)

All synced into `brand_segments`.

**The Segment Analyzer Brain**

Reads existing segments and available profile data, then identifies:

**Gaps** — segments that should exist but don't, based on vertical and customer data:

| Missing Segment | Why It Matters |
|---|---|
| VIP (top 10% LTV) | Highest-value customers — need different messaging and offers |
| At-Risk (purchased 60-90 days ago, no repeat) | Pre-churn signal — win-back window still open |
| One-Time Buyers | Largest untapped repeat-purchase opportunity |
| Category Affinity (e.g. Tops buyers) | Enables product-specific campaigns to buyers of that category |
| Engaged Non-Buyers (opened 3+ emails, never purchased) | High-intent list needing a conversion push |
| Post-Purchase 30 Days | Replenishment and upsell window |

**Overlaps** — segments that are too similar and will cannibalize each other or cause over-emailing.

**Stale segments** — conditions that no longer match the brand's current product catalog or customer behavior.

**Output**

Each recommendation writes to `brand_insights` with a "Create with VIYO" action button. Clicking it:
1. Opens a segment preview in VIYO with pre-filled conditions
2. User reviews profile count and condition logic
3. User confirms
4. VIYO creates the segment in Klaviyo via `POST /api/segments/` — live immediately

---

### Part B — Automatic Segment Targeting During Generation

When a user generates a campaign, VIYO selects the best-fit segment automatically. The user sees the recommendation and can override it — but they never have to pick from scratch.

**The Audience Brain (New Brain — V1.1)**

Runs after the CMO Brain and before the Copywriter Brain. Receives:
- Campaign brief and intent (new arrivals, flash sale, editorial, win-back, etc.)
- Brand's full segment list from Klaviyo (synced and stored in `brand_segments`)
- Customer profile distribution (how many in each segment)
- Historical performance by segment (which segments over-index for this campaign type)

**Output (Zod-validated):**
```typescript
const AudienceBrainOutputSchema = z.object({
  primary_segment_id: z.string(),
  primary_segment_name: z.string(),
  primary_profile_count: z.number(),
  exclusions: z.array(z.string()),
  reasoning: z.string(),
  alternative_segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    profile_count: z.number(),
    use_case: z.string(),
  })),
});
```

The user sees this on the brief confirmation screen before generation starts. They accept it or override via a segment dropdown.

**Deterministic Matching Rules (run before AI scoring)**

| Campaign Type | Preferred Segment | Exclusion |
|---|---|---|
| New arrivals / product drop | Engaged 90-day subscribers | Recent purchasers (last 14 days) |
| Flash sale / discount | One-time buyers + at-risk | VIPs (offer cheapens relationship) |
| Editorial / brand story | All subscribers | Unengaged (180+ days) |
| Win-back | Lapsed 90-180 days | Active purchasers |
| VIP / loyalty | Top 10% LTV | Everyone else |
| Post-purchase upsell | Purchased in last 30 days | Non-purchasers |
| Re-engagement | Unengaged 120-180 days | Active subscribers |

These rules run first, deterministically. The Audience Brain then applies AI scoring to refine within the matched segment pool.

**A/B Segment Testing (Full Product)**

VIYO can split a campaign across two segments automatically — Version A to Segment X, Version B to Segment Y. Results feed back into the Audience Brain's future recommendations per brand.

---

### Part C — Segment Generator (On-Demand)

User types natural language: "Create a segment of customers who bought in the last 30 days but haven't opened an email since."

VIYO translates to Klaviyo's condition syntax:
```json
{
  "conditions": {
    "and": [
      {
        "type": "metric",
        "metric": "Placed Order",
        "time_type": "in_the_last",
        "time_value": 30,
        "time_unit": "days"
      },
      {
        "type": "metric",
        "metric": "Opened Email",
        "time_type": "not_in_the_last",
        "time_value": 30,
        "time_unit": "days",
        "operator": "has_not"
      }
    ]
  }
}
```

Posts to Klaviyo Segments API, returns the live segment with matching profile count. No manual Klaviyo work required.

---

### New Schema Additions

```typescript
export const brand_segments = pgTable('brand_segments', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id').references(() => brands.id).notNull(),
  klaviyo_segment_id: text('klaviyo_segment_id').notNull(),
  segment_name: text('segment_name').notNull(),
  profile_count: integer('profile_count'),
  segment_type: text('segment_type'), // 'vip', 'at_risk', 'one_time_buyer', 'engaged', etc. — VIYO-inferred
  conditions: jsonb('conditions'),
  performance: jsonb('performance'), // open_rate, click_rate, revenue_per_recipient by campaign type
  viyo_created: boolean('viyo_created').default(false),
  last_synced_at: timestamptz('last_synced_at').defaultNow(),
});
```

---

## 20D. Future Vertical Architecture

VIYO launches for fashion/lifestyle Shopify brands. The architecture is designed to expand to any e-commerce vertical without rewriting brain prompts, pipeline logic, or the MJML compiler.

---

### The Two-Layer Prompt Architecture

Every brain operates on two layers:

**Layer 1 — Base Prompt (vertical-agnostic, prompt-cached)**
Core behavioral rules: output structure, hallucination constraints, Zod schema shape. Never changes between verticals. Stored in `skills_registry`. Prompt-cached via Anthropic API.

**Layer 2 — Vertical Fragment (injected at runtime)**
A small context block injected into Layer 1 at generation time. Loaded from `niche_prompt_fragments` based on the brand's `primary_vertical_key`. This is what makes fashion output feel different from beauty output — without changing any brain code.

```typescript
// Runtime injection — appended to every brain's system prompt
const verticalFragment = await db.query.nichePromptFragments.findFirst({
  where: and(
    eq(nichePromptFragments.vertical_key, brand.primary_vertical_key),
    eq(nichePromptFragments.brain_id, brainId)
  )
});

const fullSystemPrompt = basePrompt + '\n\n' + verticalFragment.content;
```

---

### `niche_prompt_fragments` Table

```typescript
export const niche_prompt_fragments = pgTable('niche_prompt_fragments', {
  id: uuid('id').defaultRandom().primaryKey(),
  vertical_key: text('vertical_key').notNull(),   // 'fashion', 'beauty', 'home_goods', 'food_beverage'
  brain_id: text('brain_id').notNull(),            // 'cmo', 'copywriter', 'offer', 'image_design', etc.
  content: text('content').notNull(),
  version: integer('version').default(1),
  active: boolean('active').default(true),
  updated_at: timestamptz('updated_at').defaultNow(),
});
```

Adding a new vertical = inserting rows into this table. No brain code changes required.

**Example — CMO Brain, Fashion fragment:**
```
VERTICAL CONTEXT — FASHION/LIFESTYLE:
- Campaign types: new arrivals, seasonal drops, flash sales, editorial, lookbook, collab launches
- AOV typically $80-$180. Over-discounting erodes brand equity.
- Visual hierarchy: hero image is primary. Product photography quality is the main conversion lever.
- Peak engagement: Tuesday-Thursday 10am-12pm and 7pm-9pm local time
- Seasonal calendar: Jan (new year), Feb (Valentine's), Mar-Apr (spring), May (Mother's Day),
  Jun-Jul (summer), Aug (back to school), Sep-Oct (fall), Nov-Dec (BFCM + holiday)
- Fashion-specific subject line patterns: color drops, limited quantities, "just landed", collab names
```

**Example — CMO Brain, Beauty fragment:**
```
VERTICAL CONTEXT — BEAUTY/SKINCARE:
- Campaign types: new launches, routine-building, ingredient education, before/after, seasonal skin concerns
- AOV typically $45-$120. Replenishment cycles are 30-60 days for most SKUs.
- Visual hierarchy: close-up product shots and skin result imagery drive conversion
- Peak engagement: Sunday evening and Wednesday morning
- Seasonal calendar: Jan (skin reset), Feb (self-care), Spring (SPF season), Summer (sweat-proof),
  Sep (routine refresh), Nov-Dec (gifting)
- Beauty-specific subject line patterns: ingredient names, skin concern language, "your skin will thank you"
```

---

### Verticals Registry

```typescript
export const verticals = pgTable('verticals', {
  key: text('key').primaryKey(),                   // 'fashion', 'beauty', 'home_goods'
  display_name: text('display_name'),              // 'Fashion & Lifestyle'
  active: boolean('active').default(true),
  onboarding_order: integer('onboarding_order'),
  benchmark_open_rate: numeric('benchmark_open_rate'),
  benchmark_click_rate: numeric('benchmark_click_rate'),
  benchmark_revenue_per_recipient: numeric('benchmark_revenue_per_recipient'),
  expected_flows: jsonb('expected_flows'),          // vertical-specific EXPECTED_FLOWS config
  performance_thresholds: jsonb('performance_thresholds'), // vertical-specific thresholds
  segment_gap_rules: jsonb('segment_gap_rules'),   // vertical-specific segment recommendations
});
```

All vertical-specific constants (EXPECTED_FLOWS, PERFORMANCE_THRESHOLDS, segment rules) live in this table — not in TypeScript config files. Adding a vertical = inserting a row.

---

### Onboarding — Vertical Selection

During onboarding, the user selects their vertical from a dropdown. Sets `brand.primary_vertical_key`. V1 launches with one option: Fashion & Lifestyle. The dropdown exists from day one — additional verticals appear when a row is added to `verticals` with `active = true`. No code change required to expose a new vertical.

A sub-vertical field (Women's Fashion, Menswear, Streetwear, Activewear, Luxury) feeds additional fragment refinement in Full product.

---

### ESP Expansion — Platform Adapter Pattern

All ESP-specific code is isolated behind a common interface. The generation pipeline calls the adapter, never Klaviyo directly.

```typescript
// packages/adapters/esp/interface.ts

export interface ESPAdapter {
  exchangeOAuthCode(code: string): Promise<OAuthTokens>;
  refreshToken(refreshToken: string): Promise<OAuthTokens>;
  createCampaignDraft(params: CampaignDraftParams): Promise<string>;
  scheduleCampaign(campaignId: string, sendAt: Date): Promise<void>;
  updateCampaignTemplate(campaignId: string, html: string): Promise<void>;
  createFlow(flowDefinition: NormalizedFlowDefinition): Promise<string>;
  updateFlow(flowId: string, updates: Partial<NormalizedFlowDefinition>): Promise<void>;
  listSegments(): Promise<NormalizedSegment[]>;
  createSegment(conditions: NormalizedSegmentConditions): Promise<string>;
  listProducts(): Promise<NormalizedProduct[]>;
  listForms(): Promise<NormalizedForm[]>;
}
```

| Adapter | Status |
|---|---|
| `klaviyo` | V1 — live |
| `omnisend` | V1.1 — scaffold in V1, implement in V1.1 |
| `activecampaign` | Full product |
| `mailchimp` | Full product |

Swapping ESP = swapping the adapter. Pipeline is unchanged.

---

### What's Universal vs Vertical-Specific

| Component | Universal | Vertical-Specific |
|---|---|---|
| 7-Brain Council structure | Yes | - |
| Zod output schemas | Yes | - |
| MJML compilation | Yes | - |
| Inngest orchestration | Yes | - |
| Layer 1 brain prompts | Yes | - |
| Layer 2 prompt fragments | - | Yes — per vertical per brain |
| Expected flow types | - | Yes — `verticals` table |
| Performance thresholds | - | Yes — `verticals` table |
| Segment gap rules | - | Yes — `verticals` table |
| Seasonal calendar | - | Yes — CMO fragment |
| Subject line pattern examples | - | Yes — Copywriter fragment |

---

### Launch Sequence for a New Vertical

1. Insert row into `verticals` table (benchmarks, expected flows, thresholds, segment rules)
2. Write `niche_prompt_fragments` rows for each brain (7 fragments total)
3. Vertical appears automatically in onboarding dropdown
4. QA: run 10 test generations across campaign types, validate output quality
5. Ship — zero engineering required beyond QA

Target time to add a new vertical after V1 is live: 1-2 days of prompt writing and QA.

---

## 20E. Satellite Apps and Services

Everything outside the core Vercel + Render + Supabase stack that VIYO depends on to function.

---

### Category 1 — External Services (Third-Party, Provisioned Not Built)

| Service | Role | Setup Timeline | Cost Model |
|---|---|---|---|
| Shopify Partner App | OAuth — product catalog + brand data | 3-7 day review | N/A (unlisted app) |
| Klaviyo OAuth App | API access — campaigns / flows / segments | Instant | Free |
| Stripe | Token Top-Up billing — Checkout + webhooks | 1-3 day KYC | 2.9% + 30c per transaction |
| Multi-Model API | Claude, GPT-4o, Gemini | Instant | Per token |
| Google Vertex AI (Gemini 3 Pro Image) | NanoBanana image generation | 2-4 day quota approval | Per image |
| Inngest | Job orchestration — DAG execution + crons | Instant | Per step executed |
| Supabase | PostgreSQL + RLS + Realtime + pgvector | Instant | Usage-based |
| Cloudflare R2 | Asset storage — generated images + brand uploads | Instant | Per GB stored/egressed |
| Upstash Redis | Rate limiting + short-lived caching | Instant | Per request |
| Postmark | SpamAssassin API for Preflight spam scoring | Instant | Free tier (10K/mo) |
| LanguageTool (self-hosted) | Grammar checker on Render worker | Instant | Free |
| Resend | Transactional email — alerts + account notifications | Instant | Per email |
| Datadog | Observability — logs + metrics + traces | Instant | Usage-based |
| AgentMail (V1.1) | IMAP inboxes for competitor newsletter subscriptions | Instant | Per inbox/month |
| Panoramata API (Full) | Competitor email intelligence — Top Brain feed | Instant | Monthly subscription |

---

### Category 2 — Background Workers (Built by VIYO, Run on Render)

Persistent Node.js workers in the same Render monorepo as the generation engine. Not user-facing — run on schedules or event triggers.

| Worker | What It Does | Trigger | Tier |
|---|---|---|---|
| Shopify Sync Worker | Pulls updated product catalog + prices from Shopify | Webhook on product update + daily cron | V1 |
| Deliverability Sync Worker | Pulls complaint/bounce rates from ESP to drive warm-up state machine | Daily Inngest cron | V1.1 |
| Klaviyo Pool Worker | Syncs segments / lists / metrics / campaign stats | Weekly cron + on-connect | V1 |
| Top Brain Ingestion Worker | Processes uploaded competitor emails — embeds → clusters → stores vectors | Event on admin upload | V1 |
| Top Brain HDBSCAN Clustering | Re-clusters top brain vectors — Sunday 02:00 UTC | Weekly Inngest cron | V1 |
| Flow Analysis Worker | Fetches and analyzes existing Klaviyo flows on connect — seeds Personal Brain | Event on brand connect | V1.1 |
| Analyzer Cron Worker | Runs all 6 analyzer agents on schedule — fires notifications on findings | Weekly Inngest cron | V1.1 |
| STO Matrix Worker | Calculates optimal send times from historical engagement — updates per brand | Weekly Inngest cron | V1.1 |
| AgentMail IMAP Worker | Monitors competitor inboxes — routes incoming emails to Top Brain pipeline | Inngest event on new IMAP message | V1.1 |
| Performance Feedback Worker | After campaign send — pulls stats — feeds back to winning_formulas + Personal Brain | Klaviyo webhook on campaign send | Full Product |
| GDPR Teardown Worker | Handles account deletion — purges all brand data across all tables + R2 storage | Event on account delete | Full Product |

---

### Category 3 — Internal Tooling

| Tool | What It Does | Status |
|---|---|---|
| Admin Portal | Top Brain uploads / token refunds / system health / skill registry | Built in V1 at /admin |
| Datadog dashboards | Generation success rate / brain error rates / token economics / worker health | Configure on Datadog |
| Error alerting | Slack/PagerDuty alerts on Inngest job failures / brain errors above threshold | Configure via Datadog |
| Staging environment | Full Vercel + Render + Supabase stack mirrored for pre-production | Provision in parallel with production |
| Seed data scripts | Populate verticals / niche_prompt_fragments / skills_registry for new verticals | Built as migration scripts |
| Token economics dashboard | Internal view of token purchases / consumption / refunds / margins per brand | Admin Portal extension |

---

### Category 4 — Future Satellites (Full Product)

| Service | Role |
|---|---|
| Milled.com scraper | Automated competitor email scraping for Top Brain |
| Brand Asset Vault CDN | Fast image delivery from R2 — custom domain assets.viyo.email |
| Klaviyo Preferred Partner status | Rate limit increases + partner directory listing |
| Multi-tenant sending domains | Per-brand viyo.email subdomains via Resend + DNS management |

---

### Architecture Map

```
VIYO Core (Vercel + Render + Supabase)
    │
    ├── External Services
    │   ├── Shopify · Klaviyo · Stripe
    │   ├── Multi-Model API (OpenAI/Google/Ideogram)
    │   ├── Inngest · Upstash Redis
    │   ├── Cloudflare R2 · Resend
    │   ├── Postmark · LanguageTool (self-hosted)
    │   └── Datadog · AgentMail (V1.1) · Panoramata (Full)
    │
    ├── Background Workers (Render monorepo)
    │   ├── V1:   Shopify Sync · Klaviyo Pool · Top Brain Ingestion · HDBSCAN Clustering
    │   ├── V1.1: Flow Analysis · Analyzer Cron · STO Matrix · AgentMail IMAP
    │   └── Full: Performance Feedback · GDPR Teardown
    │
    └── Internal Tooling
        ├── Admin Portal (V1)
        ├── Datadog dashboards + alerting
        ├── Staging environment
        └── Seed data scripts
```

---

## 20F. GDPR Teardown Worker (Full Product)

Fires when a user deletes their VIYO account. Permanently erases all personal and brand data across every system that holds it. GDPR Article 17 (Right to Erasure) requires completion within 30 days of a verified deletion request.

---

### Triggers

**User-initiated:** User clicks "Delete Account" in Settings → confirmation modal → confirmed → deletion request written to `account_deletion_requests` → Inngest event fired.

**Operator-initiated:** Admin Portal "Delete Brand" action for GDPR requests received via support — same event fired.

Both paths converge at the same worker. User receives confirmation immediately. Teardown runs in the background within 24 hours.

---

### What Gets Deleted

| Data | Location | Deletion Method |
|---|---|---|
| User account record | `users` (Supabase Auth) | `supabase.auth.admin.deleteUser(userId)` |
| Brand record | `brands` table | Hard delete — cascades via FK |
| Campaign sessions | `campaign_sessions` | FK cascade on brand_id |
| Flow records | `flows` + `flow_emails` | FK cascade on brand_id |
| Segment data | `brand_segments` | FK cascade on brand_id |
| Brand insights | `brand_insights` | FK cascade on brand_id |
| Notifications | `notifications` | FK cascade on brand_id |
| Token ledger | `token_ledger` | FK cascade on brand_id |
| Brand voice history | `brand_voice_history` | FK cascade on brand_id |
| Winning formulas | `winning_formulas` | FK cascade on brand_id |
| Brand state | `brand_state` | FK cascade on brand_id |
| Brand flows (synced) | `brand_flows` | FK cascade on brand_id |
| Top Brain vectors | `top_brain_vectors` | Delete where brand_id matches |
| Brand vectors | `brand_vectors` | Delete where brand_id matches |
| OAuth tokens | `oauth_connections` | Hard delete — revoke tokens first |
| Generated images | Cloudflare R2 | Delete all objects under `brands/{brand_id}/` |
| Brand asset uploads | Cloudflare R2 | Delete all objects under `assets/{brand_id}/` |
| Klaviyo OAuth token | Klaviyo API | `DELETE /api/oauth/tokens/{tokenId}` before DB delete |
| Shopify OAuth token | Shopify API | `DELETE /admin/api/oauth/revoke` before DB delete |
| Stripe customer | Stripe API | Archive only — financial law prohibits full deletion |

---

### Worker Pipeline

```typescript
// apps/worker/src/functions/gdpr-teardown.ts

export const gdprTeardown = inngest.createFunction(
  { id: 'gdpr-teardown', retries: 3 },
  { event: 'account.deletion.requested' },
  async ({ event, step }) => {
    const { userId, brandId, requestId } = event.data;

    // Step 1 — Revoke OAuth tokens first (stops sync workers pulling new data)
    await step.run('revoke-oauth-tokens', async () => {
      await revokeKlaviyoToken(brandId);
      await revokeShopifyToken(brandId);
    });

    // Step 2 — Delete R2 assets
    await step.run('delete-r2-assets', async () => {
      await deleteR2Prefix(`brands/${brandId}/`);
      await deleteR2Prefix(`assets/${brandId}/`);
    });

    // Step 3 — Delete pgvector embeddings (not FK-cascaded)
    await step.run('delete-vectors', async () => {
      await db.delete(topBrainVectors).where(eq(topBrainVectors.brand_id, brandId));
      await db.delete(brandVectors).where(eq(brandVectors.brand_id, brandId));
    });

    // Step 4 — Archive Stripe customer (cannot hard delete — billing law)
    await step.run('archive-stripe-customer', async () => {
      const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
      if (brand?.stripe_customer_id) {
        await stripe.customers.update(brand.stripe_customer_id, {
          metadata: {
            gdpr_deletion_requested: new Date().toISOString(),
            status: 'archived'
          }
        });
      }
    });

    // Step 5 — Hard delete brand record (cascades all FK-linked tables)
    await step.run('delete-brand-record', async () => {
      await db.delete(brands).where(eq(brands.id, brandId));
      // Cascade deletes: campaign_sessions, flows, flow_emails, brand_segments,
      // brand_insights, notifications, token_ledger, brand_voice_history,
      // winning_formulas, brand_state, brand_flows, oauth_connections
    });

    // Step 6 — Delete Supabase Auth user (must be last)
    await step.run('delete-auth-user', async () => {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    });

    // Step 7 — Mark complete + log for compliance audit
    await step.run('complete-deletion-request', async () => {
      await db.update(accountDeletionRequests)
        .set({
          status: 'completed',
          completed_at: new Date(),
          systems_cleared: [
            'oauth_tokens', 'r2_assets', 'pgvector',
            'stripe_archived', 'brand_record', 'auth_user'
          ]
        })
        .where(eq(accountDeletionRequests.id, requestId));
    });
  }
);
```

---

### Key Design Decisions

**Order matters.** OAuth tokens revoked first so sync workers cannot pull new data during the deletion window. Auth user deleted last — losing auth context mid-deletion would break permission checks in later steps.

**FK cascade handles ~80% of the work.** Deleting the `brands` row cascades to all linked tables in a single transaction. The worker only handles what isn't FK-cascaded: R2 files, pgvector embeddings, and Stripe.

**Stripe cannot be hard-deleted.** Financial regulations require retaining transaction records. VIYO archives the Stripe customer with a metadata flag — satisfies GDPR's stop-processing requirement while complying with financial record-keeping law.

**Inngest step-level retries.** If R2 deletion fails mid-way, Inngest retries from that step — not from the beginning. Deletion eventually completes even if individual steps fail on first attempt.

**30-day compliance monitoring.** A daily Inngest cron checks `account_deletion_requests` and alerts the internal team if any request is older than 7 days and not yet completed — well within the 30-day GDPR deadline.

---

### Schema

```typescript
export const account_deletion_requests = pgTable('account_deletion_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull(),
  brand_id: uuid('brand_id').notNull(),
  requested_at: timestamptz('requested_at').defaultNow(),
  requested_by: text('requested_by'), // 'user' | 'admin'
  status: text('status').default('pending'), // 'pending' | 'in_progress' | 'completed' | 'failed'
  completed_at: timestamptz('completed_at'),
  systems_cleared: jsonb('systems_cleared'),
  failure_reason: text('failure_reason'),
});
```

---

## 20G. Deploy Preflight System — Full Specification

Every compiled email passes through a 10-check preflight before it can be deployed to Klaviyo. Checks are divided into **hard fails** (block deploy, credits refunded) and **warnings** (surfaced to user, deploy proceeds).

---

### Check 1 — Spam Score (Hard Fail above 5.0)

**Service:** Postmark SpamAssassin API (free tier, 10K/month)
**How it works:** The compiled HTML is posted to the SpamAssassin scoring endpoint. Returns a score from 0–10. Above 5.0 is a hard fail.

```typescript
export async function checkSpamScore(html: string): Promise<PreflightResult> {
  const res = await fetch('https://spamcheck.postmarkapp.com/filter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: html, options: 'long' }),
  });
  const data = await res.json();
  const score = parseFloat(data.score);
  return {
    check: 'spam_score',
    passed: score < 5.0,
    severity: 'hard',
    score,
    detail: score >= 5.0 ? `SpamAssassin score ${score}/10 — above 5.0 threshold` : undefined,
  };
}
```

---

### Check 2 — File Size (Hard Fail above 75KB)

**Why:** Gmail clips emails above 102KB. VIYO's limit is 75KB to leave headroom for Klaviyo's wrapper markup.

```typescript
export function checkFileSize(html: string): PreflightResult {
  const bytes = Buffer.byteLength(html, 'utf8');
  const kb = bytes / 1024;
  return {
    check: 'file_size',
    passed: kb <= 75,
    severity: 'hard',
    detail: kb > 75 ? `Email is ${kb.toFixed(1)}KB — exceeds 75KB Gmail clip threshold` : undefined,
  };
}
```

---

### Check 3 — Unsubscribe Link (Hard Fail if missing)

**Why:** CAN-SPAM and GDPR both require an unsubscribe mechanism. Missing it is a legal violation, not just a quality issue.

```typescript
export function checkUnsubscribeLink(html: string): PreflightResult {
  // Klaviyo unsubscribe tag patterns
  const patterns = [
    /\{\{\s*unsubscribe_link\s*\}\}/i,
    /\{\{\s*event\.unsubscribeLink\s*\}\}/i,
    /href="https?:\/\/[^"]*unsubscribe[^"]*"/i,
    /href="\{\{\s*subscription_management_link\s*\}\}"/i,
  ];
  const found = patterns.some(p => p.test(html));
  return {
    check: 'unsubscribe_link',
    passed: found,
    severity: 'hard',
    detail: !found ? 'No unsubscribe link found. Email cannot be legally deployed without one.' : undefined,
  };
}
```

---

### Check 4 — Grammar (Warning only)

**Service:** LanguageTool self-hosted on Render worker (free, no rate limits)
**Language-aware:** Uses `brand.ui_language` to select the correct LanguageTool language code.

```typescript
export async function checkGrammar(
  html: string,
  language: string = 'en-US',
): Promise<PreflightResult> {
  // Strip HTML tags to get plain text for grammar checking
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const res = await fetch(`${process.env.LANGUAGETOOL_URL}/v2/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ text, language, enabledOnly: 'false' }),
  });
  const data = await res.json();

  // Filter to meaningful errors only — ignore style suggestions
  const errors = (data.matches ?? []).filter((m: any) =>
    ['GRAMMAR', 'SPELLING'].includes(m.rule?.category?.id)
  );

  return {
    check: 'grammar',
    passed: errors.length === 0,
    severity: 'warning',     // Grammar errors do not block deploy
    detail: errors.length > 0
      ? `${errors.length} grammar/spelling issue(s) detected: ${errors.slice(0, 3).map((e: any) => e.message).join('; ')}`
      : undefined,
    errors,
  };
}
```

---

### Check 5 — Link Validity (Warning only)

**Why:** Dead links in deployed emails destroy CTR and damage brand trust. This catches broken links before they reach subscribers.

```typescript
export async function checkLinkValidity(html: string): Promise<PreflightResult> {
  // Extract all href values from anchor tags
  const hrefPattern = /href="(https?:\/\/[^"]+)"/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = hrefPattern.exec(html)) !== null) {
    // Skip Klaviyo dynamic tags — these are resolved at send time
    if (!match[1].includes('{{') && !match[1].includes('klaviyo')) {
      links.push(match[1]);
    }
  }

  // Check each link with a HEAD request (non-destructive, fast)
  const results = await Promise.allSettled(
    links.map(async url => {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
      return { url, ok: res.ok, status: res.status };
    })
  );

  const deadLinks = results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .filter(r => !r.value.ok)
    .map(r => `${r.value.url} (${r.value.status})`);

  return {
    check: 'link_validity',
    passed: deadLinks.length === 0,
    severity: 'warning',    // Dead links warn but do not block — Shopify links may redirect
    detail: deadLinks.length > 0 ? `Dead links detected: ${deadLinks.join(', ')}` : undefined,
  };
}
```

---

### Check 6 — Price Accuracy (Hard Fail if mismatch)

**Why:** If the compiled email contains a price ($49.99) that doesn't match the current Shopify price for that product, VIYO is deploying false advertising.

```typescript
export async function checkPriceAccuracy(
  html: string,
  brandId: string,
): Promise<PreflightResult> {
  // Extract all price patterns from HTML
  const pricePattern = /\$(\d+(?:\.\d{2})?)/g;
  const prices: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = pricePattern.exec(html)) !== null) {
    prices.push(parseFloat(match[1]));
  }

  if (prices.length === 0) return { check: 'price_accuracy', passed: true, severity: 'hard' };

  // Get all brand products with their current prices
  const products = await db.select({ price: productsTable.price, title: productsTable.title })
    .from(productsTable).where(eq(productsTable.brand_id, brandId));

  const validPrices = new Set(products.map(p => parseFloat(p.price)));

  // Check each price found in the HTML — at least one valid price must match each found value
  const invalidPrices = prices.filter(p => {
    // Allow prices within $0.01 tolerance for floating point comparison
    return !Array.from(validPrices).some(vp => Math.abs(vp - p) < 0.01);
  });

  return {
    check: 'price_accuracy',
    passed: invalidPrices.length === 0,
    severity: 'hard',
    detail: invalidPrices.length > 0
      ? `Price(s) ${invalidPrices.map(p => `$${p}`).join(', ')} do not match current Shopify product prices`
      : undefined,
  };
}
```

---

### Check 7 — Offer Accuracy (Hard Fail if mismatch)

**Why:** VeriClaw checks copy consistency, but a second check at the HTML level catches any discounts that slipped through rendering or MJML compilation.

```typescript
export async function checkOfferAccuracy(
  html: string,
  brandId: string,
  sessionId: string,
): Promise<PreflightResult> {
  // Get the offer that was approved for this session
  const [session] = await db.select({ offer_json: campaignSessions.offer_json })
    .from(campaignSessions).where(eq(campaignSessions.id, sessionId));

  if (!session?.offer_json || session.offer_json.offer_type === 'no_discount') {
    // No discount approved — check that no discount language appears in HTML
    const discountPattern = /(\d+)%\s*off|save\s+\$\d+|\d+%\s*discount/i;
    const hasUnauthorizedDiscount = discountPattern.test(html);
    return {
      check: 'offer_accuracy',
      passed: !hasUnauthorizedDiscount,
      severity: 'hard',
      detail: hasUnauthorizedDiscount
        ? 'Discount language found in HTML but no discount was approved for this email.'
        : undefined,
    };
  }

  const approvedOffer = session.offer_json;

  if (approvedOffer.offer_type === 'percentage_off') {
    // Verify the approved percentage appears in the HTML
    const pctPattern = new RegExp(`${approvedOffer.offer_value}%`, 'i');
    const found = pctPattern.test(html);
    return {
      check: 'offer_accuracy',
      passed: found,
      severity: 'hard',
      detail: !found ? `Approved offer (${approvedOffer.offer_value}% off) not found in compiled HTML` : undefined,
    };
  }

  return { check: 'offer_accuracy', passed: true, severity: 'hard' };
}
```

---

### Check 8 — Alt Text (Warning only)

```typescript
export function checkAltText(html: string): PreflightResult {
  const imgPattern = /<img[^>]+>/gi;
  const imgs = html.match(imgPattern) ?? [];
  const missing = imgs.filter(tag => !/alt="[^"]+"/i.test(tag));
  return {
    check: 'alt_text',
    passed: missing.length === 0,
    severity: 'warning',
    detail: missing.length > 0 ? `${missing.length} image(s) missing alt attributes` : undefined,
  };
}
```

---

### Check 9 — Brand Token Compliance (Warning only)

**Why:** MJML is compiled deterministically from VIYO's design token system, but custom overrides or Admin portal changes could introduce off-brand colors or fonts.

```typescript
export async function checkBrandTokenCompliance(
  html: string,
  brandId: string,
): Promise<PreflightResult> {
  const [brand] = await db.select({ design_tokens: brands.design_tokens })
    .from(brands).where(eq(brands.id, brandId));

  if (!brand?.design_tokens) return { check: 'brand_token_compliance', passed: true, severity: 'warning' };

  const tokens = brand.design_tokens as BrandDesignTokens;
  const violations: string[] = [];

  // Check that primary brand color appears in the HTML (hero section, CTAs)
  if (tokens.primary_color && !html.includes(tokens.primary_color.toLowerCase())) {
    violations.push(`Primary brand color ${tokens.primary_color} not found in compiled HTML`);
  }

  // Check that off-brand colors are not present
  if (tokens.forbidden_colors) {
    for (const color of tokens.forbidden_colors) {
      if (html.toLowerCase().includes(color.toLowerCase())) {
        violations.push(`Forbidden color ${color} found in HTML`);
      }
    }
  }

  return {
    check: 'brand_token_compliance',
    passed: violations.length === 0,
    severity: 'warning',
    detail: violations.length > 0 ? violations.join('; ') : undefined,
  };
}
```

---

### Check 10 — Image-to-Text Ratio (Hard Fail — 60% Text Minimum)

```typescript
export function checkImageTextRatio(
  html: string,
  brandMinTextPct: number = 60  // 60/40 rule: emails must be at least 60% text
): PreflightResult {
  // Measures pixel height of text sections vs image sections in compiled MJML.
  // The 60/40 rule: at least 60% of email pixel height must be text content.
  // Heavy image emails trigger spam filters across all major ESPs.
  const { textHeightPx, imageHeightPx } = measureSectionHeights(html);
  const totalHeight = textHeightPx + imageHeightPx;
  const textPct = totalHeight > 0 ? (textHeightPx / totalHeight) * 100 : 100;
  const belowFloor = textPct < brandMinTextPct;

  return {
    check: 'image_text_ratio',
    passed: !belowFloor,
    severity: 'hard',  // HARD FAIL — promoted from warning
    errorType: belowFloor ? 'TextImageRatioError' : undefined,
    textPct: Math.round(textPct),
    detail: belowFloor
      ? `Text ratio ${Math.round(textPct)}% is below the ${brandMinTextPct}% minimum floor. Text Filler Fallback available.`
      : undefined,
  };
}
```

**Text Filler Fallback System:** When an image-heavy email fails the 60/40 check, the MJML compiler can auto-inject a smaller-font footer section to push the ratio above the floor. The filler content is drawn from a priority queue:

1. **Brand-specific tips** — Product care notes, sizing guides, or usage tips from the brand's Shopify product descriptions (already ingested).
2. **Curated content snippets** — Short editorial excerpts from the brand's Email Bible or blog content (if connected).
3. **Generic best practices** — Category-relevant tips (e.g., "How to care for your jewelry" for accessories brands) from the vertical doctrine.

The filler is rendered at 11px font in `#999999` color, visually recessive but fully readable. It sits in its own MJML section above the unsubscribe footer. The filler is **never promotional** — it adds value while satisfying the spam filter ratio requirement. Brands can disable the fallback in Settings and manually adjust their emails instead.

---

### Check 11 — Email Authentication (SPF/DKIM/DMARC)

```typescript
export async function checkEmailAuthentication(brandId: string): Promise<PreflightResult> {
  // Queries the brand's sending domain for valid SPF, DKIM, and DMARC records.
  // During 'cold' state, missing authentication is a HARD FAIL to protect initial reputation.
  // During 'warming'/'warmed' state, it's a warning (though highly recommended).
  const authStatus = await getDomainAuthStatus(brandId);
  const isCold = await isBrandInColdState(brandId);
  const isFullyAuthenticated = authStatus.spf && authStatus.dkim && authStatus.dmarc;

  return {
    check: 'email_authentication',
    passed: isCold ? isFullyAuthenticated : true,
    severity: isCold && !isFullyAuthenticated ? 'hard' : 'warning',
    errorType: isCold && !isFullyAuthenticated ? 'DomainAuthError' : undefined,
    detail: !isFullyAuthenticated
      ? `Missing email authentication records (SPF/DKIM/DMARC). ${isCold ? 'Required during cold warm-up state.' : 'Highly recommended.'}`
      : undefined,
  };
}
```

---

### Preflight Orchestrator

```typescript
// packages/core-types/src/preflight/runner.ts

export type PreflightResult = {
  check: string;
  passed: boolean;
  severity: 'hard' | 'warning';
  detail?: string;
  score?: number;
  errors?: any[];
};

export async function runPreflight(
  html: string,
  brandId: string,
  sessionId: string,
  language: string = 'en-US',
): Promise<{ canDeploy: boolean; hardFails: PreflightResult[]; warnings: PreflightResult[] }> {
  const results = await Promise.all([
    checkSpamScore(html),
    checkFileSize(html),
    checkUnsubscribeLink(html),
    checkGrammar(html, language),
    checkLinkValidity(html),
    checkPriceAccuracy(html, brandId),
    checkOfferAccuracy(html, brandId, sessionId),
    checkAltText(html),
    checkBrandTokenCompliance(html, brandId),
    checkImageTextRatio(html, brandMinTextPct),
    checkEmailAuthentication(brandId),
  ]);

  const hardFails = results.filter(r => !r.passed && r.severity === 'hard');
  const warnings  = results.filter(r => !r.passed && r.severity === 'warning');

  return {
    canDeploy: hardFails.length === 0,
    hardFails,
    warnings,
  };
}
```

**If `canDeploy === false`:** Session moves to `failed` state. Credits are refunded. User sees a specific error message per failed check. The preflight results are stored in `campaign_sessions.preflight_results` (jsonb) for admin review.

**If `warnings.length > 0` and `canDeploy === true`:** Deploy proceeds. Warnings are surfaced to the user on the preview screen as dismissible inline alerts before they confirm deployment.

---

## 20G. Hallucination Prevention System

Hallucination — the AI generating plausible-sounding content not grounded in the provided data — is the single biggest quality risk in an AI email system. A hallucinated 30% discount on a luxury brand's hero email, sent to 50,000 subscribers, creates real financial and brand damage. VIYO prevents hallucination at three layers: structural context injection, behavioral constraints in every brain prompt, and temperature calibration per brain.

---

### Layer 1 — XML-Tagged Context Injection

Every brain receives structured context in XML-tagged blocks. XML tags serve as semantic anchors — the model treats tagged content as authoritative source material, not as conversational prose it can embellish. The tags also make prompt engineering auditable: if a brain hallucinates, the first debugging step is verifying the correct context blocks were injected.

**Standard context block format** (injected at runtime, before every brain call):

```xml
<context>
  <product_data>
    <product id="{{shopify_product_id}}" title="{{title}}" price="{{price}}" compare_at="{{compare_at_price}}" inventory="{{inventory_quantity}}" handle="{{handle}}">
      <description>{{body_html_stripped}}</description>
      <images>{{image_urls_array}}</images>
    </product>
    <!-- Additional products if relevant -->
  </product_data>

  <brand_data>
    <name>{{brand_name}}</name>
    <vertical>{{vertical}}</vertical>
    <voice_profile>{{brand_voice_json}}</voice_profile>
    <design_tokens>{{design_tokens_json}}</design_tokens>
  </brand_data>

  <offer_data>
    <!-- Only populated AFTER Offer Brain runs — empty for CMO/Image Design brains -->
    <selected_offer type="{{offer_type}}" value="{{offer_value}}" frame="{{framing_directive}}" />
    <safe_offers>{{safe_offers_array_json}}</safe_offers>
  </offer_data>

  <brief>
    <intent>{{user_brief_intent}}</intent>
    <target_segment>{{segment_name}}</target_segment>
    <flow_type>{{flow_type_if_flow}}</flow_type>
    <email_position>{{position_if_flow}}</email_position>
  </brief>

  <intelligence>
    <top_brain_strategies>{{derived_strategies_for_vertical}}</top_brain_strategies>
    <winning_formulas>{{brand_winning_formulas_few_shot}}</winning_formulas>
    <competitor_subject_patterns>{{top_brain_subject_clusters}}</competitor_subject_patterns>
  </intelligence>
</context>
```

**What each brain receives:**

| Brain | product_data | brand_data | offer_data | brief | intelligence |
|-------|-------------|-----------|-----------|-------|-------------|
| CMO Brain | ✅ | ✅ | — | ✅ | ✅ |
| Audience Brain | — | ✅ | — | ✅ | — |
| Offer Brain | ✅ | ✅ | safe_offers only | ✅ | — |
| Copywriter Brain | ✅ | ✅ | ✅ full | ✅ | ✅ |
| Image Design Brain | ✅ | ✅ | — | ✅ | — |
| Email Design Brain | — | ✅ tokens only | ✅ full | ✅ | — |
| VeriClaw | — | — | ✅ full | — | — |
| Critic Brain | ✅ | ✅ | ✅ full | ✅ | — |

---

### Layer 2 — OMIT DON'T INVENT Constraint

The following constraint is added to every creative brain's Layer 1 system prompt. It is the single most important behavioral guardrail in the system.

```
OMIT DON'T INVENT:
This is your most important constraint. If a piece of information is not present in your
<context> blocks, you MUST omit it from your output. You MUST NOT invent, estimate, extrapolate,
or assume any of the following:
  - Product prices, discounts, or percentage values
  - Product names, descriptions, or features
  - Inventory levels, scarcity claims, or stock availability
  - Brand statistics, award claims, or performance metrics
  - Competitor comparisons of any kind
  - Shipping timeframes, return windows, or policy details

If you are uncertain whether a piece of information was provided in context, do not use it.
An email that omits uncertain details is better than an email that invents them.
```

This constraint is present in: CMO Brain, Offer Brain, Copywriter Brain, Image Design Brain, Critic Brain. VeriClaw and Email Design Brain are deterministic/structural — they do not produce free-form content that could hallucinate.

---

### Layer 3 — Per-Brain Temperature Calibration

Temperature directly controls the creativity-reliability tradeoff. Brains that make factual assertions must run at low temperature. Brains that produce creative output need higher temperature to avoid generic outputs. The settings below are non-negotiable — engineers must not adjust these without architectural review.

```typescript
// packages/core-types/src/constants/brain-configs.ts
export const BRAIN_TEMPERATURE_CONFIG = {
  cmo_brain:         0.5,  // moderate — strategic decisions need creativity, not wild swings
  audience_brain:    0.1,  // near-deterministic — segment selection is rules-based, not creative
  offer_brain:       0.2,  // low — selecting from a constrained list; creativity here causes cap violations
  copywriter_brain:  0.7,  // highest — headline and body copy requires genuine creative generation
  image_design_brain: 0.6, // medium-high — prompt creativity matters; hallucination risk is low (it's a visual description)
  email_design_brain: 0.2, // low — slot mapping is structural; creativity here creates layout errors
  vericlaw:          0.0,  // fully deterministic — fact-checking must produce consistent results
  critic_brain:      0.1,  // near-deterministic — scoring must be stable across repeated evaluations
  sms_copywriter:    0.6,  // medium-high — 140 chars requires creative compression
  flow_strategy_brain: 0.4, // moderate — planning decisions benefit from creativity within structure
} as const;

// Applied at every brain call:
// const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
//   model: brainModel,
//   temperature: BRAIN_TEMPERATURE_CONFIG[brainKey],
//   ...
// });
```

**Why VeriClaw must be 0.0:** At temperature > 0, the model introduces stochastic variation in its reasoning. A fact-checker that occasionally produces different verdicts on identical inputs is not a fact-checker — it's a probabilistic oracle. VeriClaw must be fully deterministic.

**Why Copywriter must be 0.7 and not higher:** Above 0.8, subject line generation drifts toward unexpected metaphors and phrasing that escapes brand voice constraints. 0.7 produces genuinely distinct outputs across generations while staying within behavioral guardrails.

---

### Layer 4 — Structural Enforcement via Zod

Every brain output is validated against a Zod schema before it is passed to the next step. If the schema validation fails, the step fails — not silently, not with a warning. This prevents malformed outputs from propagating through the DAG and creating compounding errors.

```typescript
// Applied universally in every brain step executor:
async function executeBrain<T>(
  prompt: string,
  schema: z.ZodType<T>,
  temperature: number,
): Promise<T> {
  const raw = await callLLM(prompt, { temperature });
  const parsed = schema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new BrainSchemaError(`Schema validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}
```

`BrainSchemaError` triggers a session failure and credit refund. The error is logged to Datadog with the raw output for prompt debugging.

---

## 20H. Behavioral Play Detection Engine (V1.1)

VIYO watches what customers actually buy, detects occasion and intent signals in that behavior, and generates a complete ready-to-activate package — segment, campaign, flow, and copy — before the brand ever thinks to ask for it. The Adorb anniversary example is the canonical use case: a customer buys an anniversary product, VIYO detects the pattern across multiple buyers, builds the segment, drafts the gift guide campaign, constructs the annual reminder flow, and surfaces the entire package for one-click approval.

---

### Architecture Overview

```
Shopify Product Sync
    ↓
Product Intent Tagger        ← enriches every product with occasion tags
    ↓
brand_product_occasions      ← stored occasion metadata per product
    ↓
Purchase Pattern Detector    ← weekly Inngest cron — scans 90-day order history
    ↓
detected_patterns            ← raw patterns with signal strength scores
    ↓
Play Generator               ← builds complete segment + campaign + flow package
    ↓
brand_plays                  ← stored play awaiting user approval
    ↓
Play Card UI + Notification  ← surfaces to user with one-click activate
    ↓
Play Activation Pipeline     ← creates segment → updates profiles → generates emails → deploys flow
```

---

### Layer 1 — Product Intent Tagger

Runs on every Shopify product sync. Enriches every product with occasion and intent metadata so the pattern detector can reason about purchase meaning, not just purchase history.

```typescript
// packages/core-types/src/constants/occasion-signals.ts

export const OCCASION_SIGNALS: Record<string, string[]> = {
  anniversary:       ['anniversary', 'couples', 'years together', 'husband', 'wife', 'spouse', 'milestone'],
  birthday:          ['birthday', 'bday', 'birth day', 'celebrating you', 'another year older'],
  graduation:        ['graduation', 'graduate', 'class of', 'commencement', 'congrats grad'],
  mothers_day:       ["mother's day", 'mom gift', 'for mom', 'mama', 'mum'],
  fathers_day:       ["father's day", 'dad gift', 'for dad', 'papa'],
  valentines:        ['valentine', 'for her', 'for him', 'romance', 'love gift'],
  new_baby:          ['baby shower', 'new baby', 'newborn', 'expecting', 'gender reveal'],
  pet:               ['dog', 'cat', 'puppy', 'kitten', 'pet lover', 'fur baby'],
  housewarming:      ['housewarming', 'new home', 'moving gift', 'new house'],
  replenishment:     ['refill', 'replacement', 'restocking', 'everyday', 'daily use'],
  seasonal_holiday:  ['christmas', 'holiday gift', 'festive', 'xmas', 'stocking stuffer'],
};

export async function tagProductOccasions(
  brandId: string,
  product: ShopifyProduct,
): Promise<string[]> {
  const searchText = [
    product.title,
    product.body_html,
    ...(product.tags ?? []),
    product.product_type,
  ].join(' ').toLowerCase();

  const detected: string[] = [];
  for (const [occasion, signals] of Object.entries(OCCASION_SIGNALS)) {
    if (signals.some(signal => searchText.includes(signal))) {
      detected.push(occasion);
    }
  }

  // For ambiguous products: lightweight Claude call to confirm
  if (detected.length === 0) {
    const occasionFromLLM = await classifyProductOccasion(product);
    if (occasionFromLLM) detected.push(occasionFromLLM);
  }

  await db.update(products)
    .set({ occasion_tags: detected })
    .where(eq(products.shopify_product_id, product.id));

  return detected;
}
```

`classifyProductOccasion()` is a lightweight Gemini 2.5 Flash call (temperature 0.1) — fast and cheap. Used only when keyword matching finds nothing. Output is a single string from the `OCCASION_SIGNALS` key list or `null`.

---

### Layer 2 — Purchase Pattern Detector

**When it runs:** Inngest cron `brand.patterns.detect` — every Monday 06:00 UTC per brand.
**Input:** Last 90 days of order history + occasion-tagged product catalog.
**Output:** One or more `DetectedPattern` objects written to `detected_patterns` table.

Four pattern types are detected:

```typescript
export type PatternType =
  | 'volume_occasion'        // many customers bought same occasion product → segment + campaign
  | 'date_cluster'           // purchases cluster around a seasonal date → advance campaign
  | 'individual_recurrence'  // same customer bought same occasion in consecutive years → reminder flow
  | 'replenishment_cycle';   // product has predictable reorder interval → reorder flow

export interface DetectedPattern {
  pattern_type:       PatternType;
  occasion:           string;
  product_ids:        string[];
  customer_count:     number;
  signal_strength:    number;      // 0–1 confidence
  purchase_dates:     Date[];
  avg_order_value:    number;
  estimated_revenue:  number;
  anniversary_month?: number;      // for individual_recurrence patterns
  avg_reorder_days?:  number;      // for replenishment_cycle patterns
  recurrent_customers?: Array<{
    klaviyo_profile_id: string;
    first_purchase_date: Date;
  }>;
}
```

#### Type 1: Volume Occasion — Many Customers, Same Occasion
```typescript
async function detectVolumeOccasion(brandId: string): Promise<DetectedPattern[]> {
  const occasionOrders = await db.select({
    occasion:     products.occasion_tags,
    order_value:  orders.total_price,
    customer_id:  orders.klaviyo_profile_id,
    purchased_at: orders.created_at,
    product_id:   products.id,
  })
  .from(orders)
  .innerJoin(orderItems, eq(orderItems.order_id, orders.id))
  .innerJoin(products, eq(products.id, orderItems.product_id))
  .where(
    and(
      eq(orders.brand_id, brandId),
      gte(orders.created_at, subDays(new Date(), 90)),
      sql`array_length(${products.occasion_tags}, 1) > 0`,
    )
  );

  const grouped = groupBy(occasionOrders, row => row.occasion[0]);
  const patterns: DetectedPattern[] = [];

  for (const [occasion, rows] of Object.entries(grouped)) {
    const uniqueCustomers = new Set(rows.map(r => r.customer_id)).size;
    const dateClusterScore = computeDateClustering(rows.map(r => r.purchased_at));

    // Lower threshold if purchases are date-clustered — stronger seasonal signal
    const threshold = dateClusterScore > 0.7 ? 5 : 10;

    if (uniqueCustomers >= threshold) {
      const avgOrderValue = mean(rows.map(r => parseFloat(r.order_value)));
      patterns.push({
        pattern_type:      'volume_occasion',
        occasion,
        product_ids:       [...new Set(rows.map(r => r.product_id))],
        customer_count:    uniqueCustomers,
        avg_order_value:   avgOrderValue,
        signal_strength:   Math.min(uniqueCustomers / 50, 1),
        estimated_revenue: uniqueCustomers * avgOrderValue * 0.4, // 40% reactivation estimate
        purchase_dates:    rows.map(r => r.purchased_at),
      });
    }
  }
  return patterns;
}
```

#### Type 2: Date Cluster — Seasonal Purchase Spike
```typescript
function computeDateClustering(dates: Date[]): number {
  // Returns 0–1. Score of 1 = all purchases within a 30-day window.
  const months = dates.map(d => d.getMonth());
  const modalMonth = mode(months);
  const inWindow = months.filter(m => Math.abs(m - modalMonth) <= 1).length;
  return inWindow / dates.length;
}
// Date cluster score > 0.7 on a volume_occasion pattern upgrades it to
// also generate an advance seasonal campaign brief for next year's window.
```

#### Type 3: Individual Recurrence — Annual Occasion Buyers
```typescript
async function detectIndividualRecurrence(brandId: string): Promise<DetectedPattern[]> {
  // Find customers who bought anniversary-occasion products in 2+ different years
  const recurrentBuyers = await db.execute(sql`
    SELECT
      o.klaviyo_profile_id,
      array_agg(DISTINCT date_trunc('year', o.created_at)) as purchase_years,
      array_agg(o.created_at ORDER BY o.created_at)        as purchase_dates,
      avg(o.total_price::numeric)                           as avg_value,
      p.occasion_tags[1]                                    as occasion
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON p.id = oi.product_id
    WHERE o.brand_id = ${brandId}
      AND array_length(p.occasion_tags, 1) > 0
    GROUP BY o.klaviyo_profile_id, p.occasion_tags[1]
    HAVING count(DISTINCT date_trunc('year', o.created_at)) >= 2
  `);

  return recurrentBuyers.rows.map(buyer => ({
    pattern_type:       'individual_recurrence',
    occasion:           buyer.occasion,
    product_ids:        [],
    customer_count:     recurrentBuyers.rows.length,
    avg_order_value:    parseFloat(buyer.avg_value),
    signal_strength:    0.9, // recurrence is a very strong signal
    estimated_revenue:  parseFloat(buyer.avg_value) * recurrentBuyers.rows.length,
    purchase_dates:     buyer.purchase_dates,
    anniversary_month:  new Date(buyer.purchase_dates[0]).getMonth(),
    recurrent_customers: recurrentBuyers.rows.map(b => ({
      klaviyo_profile_id: b.klaviyo_profile_id,
      first_purchase_date: new Date(b.purchase_dates[0]),
    })),
  }));
}
```

#### Type 4: Replenishment Cycle — Predictable Reorder Timing
```typescript
async function detectReplenishmentCycle(brandId: string): Promise<DetectedPattern[]> {
  const replenishmentProducts = await db.execute(sql`
    SELECT
      p.id, p.title,
      avg(days_between)    as avg_reorder_days,
      stddev(days_between) as stddev_days,
      count(*)             as reorder_count
    FROM (
      SELECT
        oi.product_id,
        extract(day from (
          lead(o.created_at) OVER (
            PARTITION BY o.klaviyo_profile_id, oi.product_id
            ORDER BY o.created_at
          ) - o.created_at
        )) as days_between
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.brand_id = ${brandId}
    ) sub
    JOIN products p ON p.id = sub.product_id
    WHERE days_between BETWEEN 14 AND 180
    GROUP BY p.id, p.title
    HAVING count(*) >= 5
      AND stddev(days_between) < 20   -- consistent cycle = real replenishment signal
  `);

  return replenishmentProducts.rows.map(product => ({
    pattern_type:      'replenishment_cycle',
    occasion:          'replenishment',
    product_ids:       [product.id],
    customer_count:    product.reorder_count,
    avg_reorder_days:  Math.round(product.avg_reorder_days),
    signal_strength:   Math.max(0, 1 - (product.stddev_days / 20)),
    avg_order_value:   0, // fetched separately
    estimated_revenue: 0,
    purchase_dates:    [],
  }));
}
```

---

### Layer 3 — Play Generator

When a pattern clears the detection threshold, Play Generator assembles the complete activation package. Every component is pre-built — the user approves, not assembles.

```typescript
export type PlayType =
  | 'occasion_segment_campaign'   // segment + single campaign email
  | 'anniversary_reminder_flow'   // date-anchored annual reminder flow
  | 'seasonal_advance_campaign'   // campaign ahead of next year's seasonal window
  | 'replenishment_flow'          // reorder reminder at predicted cycle interval
  | 'occasion_full_play';         // segment + campaign + reminder flow (complete)

export interface GeneratedPlay {
  id:                string;
  brand_id:          string;
  pattern_id:        string;
  play_type:         PlayType;
  status:            'pending_approval' | 'approved' | 'dismissed' | 'activated';
  display_title:     string;       // e.g. "Anniversary Buyers"
  display_insight:   string;       // e.g. "23 customers bought anniversary products"
  segment:           KlaviyoSegmentDefinition;
  campaigns:         CampaignBrief[];
  flows:             FlowBrief[];
  profile_updates:   KlaviyoProfileUpdate[];
  estimated_revenue: number;
  confidence:        'high' | 'medium' | 'low';
  credits_required:  number;
  klaviyo_segment_id?: string;    // set after activation
  activated_at?:     Date;
  created_at:        Date;
}
```

#### Anniversary Full Play — Complete Package Assembly

```typescript
async function generateAnniversaryPlay(
  brandId: string,
  pattern: DetectedPattern,
): Promise<GeneratedPlay> {

  // 1. SEGMENT — "Anniversary Buyers"
  const segment: KlaviyoSegmentDefinition = {
    name: 'Viyo - Anniversary Buyers',
    definition: {
      condition_groups: [{
        conditions: [{
          type: 'placed_order',
          timeframe: { unit: 'day', value: 365 },
          where: { product_ids: { any: pattern.product_ids } },
        }]
      }]
    },
  };

  // 2. CAMPAIGN BRIEF — Anniversary Gift Guide
  const campaignBrief: CampaignBrief = {
    intent: `Anniversary gift guide campaign. Feature top anniversary products. Sentimental, celebratory tone. Help subscribers find the perfect gift for their partner.`,
    target_segment_name: 'Viyo - Anniversary Buyers',
    featured_product_ids: pattern.product_ids.slice(0, 3),
    recommended_send_month: pattern.anniversary_month
      ? pattern.anniversary_month - 1   // 6 weeks ahead of peak purchase window
      : new Date().getMonth() + 1,
    subject_angle: 'exclusivity',
  };

  // 3. FLOW BRIEF — Annual Reminder (date-anchored)
  const flowBrief: FlowBrief = {
    flow_type: 'anniversary_reminder',
    trigger: {
      type: 'date_property',
      klaviyo_property: 'viyo_anniversary_purchase_date',
      offset_days: -30,   // fires 30 days before anniversary month
    },
    emails: [
      {
        position: 1,
        delay_hours: 0,
        angle: 'anticipation',
        subject_direction: 'Anniversary is approaching — gift ideas ready for them',
        cta: 'Shop anniversary gifts',
        offer: null,
      },
      {
        position: 2,
        delay_hours: 168,   // 7 days later
        angle: 'urgency',
        subject_direction: 'One week until anniversary — order now for on-time delivery',
        cta: 'Order before it\'s too late',
        offer: 'free_shipping',
      },
    ],
  };

  // 4. PROFILE UPDATES — Write anniversary date to Klaviyo
  // So the date-trigger flow fires at the right time every year
  const profileUpdates: KlaviyoProfileUpdate[] = (pattern.recurrent_customers ?? []).map(c => ({
    klaviyo_profile_id: c.klaviyo_profile_id,
    properties: {
      viyo_anniversary_purchase_date: c.first_purchase_date.toISOString(),
      viyo_anniversary_occasion:      'anniversary',
    },
  }));

  // 5. CREDITS — 1,000 per campaign email + 2,000 for 2-email flow
  const creditsRequired = 1000 + (flowBrief.emails.length * 1000);

  return {
    play_type:         'occasion_full_play',
    display_title:     'Anniversary Buyers',
    display_insight:   `${pattern.customer_count} customers bought anniversary products in the last 90 days. ${pattern.recurrent_customers?.length ?? 0} have bought anniversary gifts 2 years in a row.`,
    segment,
    campaigns:         [campaignBrief],
    flows:             [flowBrief],
    profile_updates:   profileUpdates,
    estimated_revenue: pattern.estimated_revenue,
    confidence:        pattern.customer_count >= 20 ? 'high' : 'medium',
    credits_required:  creditsRequired,
    created_at:        new Date(),
    status:            'pending_approval',
  };
}
```

---

### Layer 4 — Play Card UI + Notification

#### Notification (Bell icon — type: `play_detected`)
```
🎯  New play detected: Anniversary Buyers
    23 customers · ~$1,750 estimated revenue
    [Review play →]
```

#### Play Card UI (`/plays` page — new route)

```
┌──────────────────────────────────────────────────────────────────┐
│  🎯  VIYO DETECTED A PLAY                         High confidence│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Anniversary Buyers                                              │
│                                                                  │
│  What we found                                                   │
│  ──────────────────────────────────────────────────────────────  │
│  23 of your customers bought anniversary products in the last    │
│  90 days — mostly in May and June. 3 of them have bought         │
│  anniversary gifts from you 2 years in a row.                    │
│                                                                  │
│  Estimated revenue opportunity: ~$1,750                          │
│                                                                  │
│  What VIYO built                                                 │
│  ──────────────────────────────────────────────────────────────  │
│  ✓  Segment: "Anniversary Buyers" — 23 members                   │
│     Ready to create in Klaviyo                                   │
│                                                                  │
│  ✓  Campaign: Anniversary Gift Guide                             │
│     Recommended send: May 2027 (6 weeks ahead of peak)           │
│     3 subject line variants will be generated on activate        │
│                                                                  │
│  ✓  Flow: Anniversary Reminder                                   │
│     Fires 30 days before each customer's anniversary month       │
│     2-email sequence — anticipation + urgency with free shipping │
│     Self-running every year — no maintenance needed              │
│                                                                  │
│  ✓  Profile update: Anniversary date written to 3 returning      │
│     customers so the flow trigger works immediately              │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  [Preview campaign]   [Preview flow]                             │
│                                                                  │
│  [  Activate everything — 3,000 credits  ]   [Dismiss]          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Layer 5 — Play Activation Pipeline

One-click activation runs the full pipeline as a step-checkpointed Inngest function.

```typescript
export const activatePlay = inngest.createFunction(
  { id: 'activate-play', retries: 3 },
  { event: 'play.activate' },
  async ({ event, step }) => {
    const { brandId, playId } = event.data;
    const play = await db.query.brandPlays.findFirst({ where: eq(brandPlays.id, playId) });

    // Step 1: Reserve credits
    await step.run('reserve-credits', async () => {
      const hasCredits = await hasEnoughCreditsForAmount(brandId, play.credits_required);
      if (!hasCredits) throw new NonRetriableError('Insufficient credits for play activation');
      await reserveCredits(brandId, play.credits_required, 'play_activation', playId);
    });

    // Step 2: Create Klaviyo segment
    const segmentId = await step.run('create-segment', async () => {
      const id = await createKlaviyoSegment(brandId, play.segment);
      await db.update(brandPlays).set({ klaviyo_segment_id: id }).where(eq(brandPlays.id, playId));
      return id;
    });

    // Step 3: Update Klaviyo profiles with occasion date property
    await step.run('update-profiles', async () => {
      if (play.profile_updates?.length) {
        await bulkUpdateKlaviyoProfiles(brandId, play.profile_updates);
      }
    });

    // Step 4: Queue campaign generation(s)
    await step.run('queue-campaigns', async () => {
      for (const brief of play.campaigns) {
        await inngest.send({
          name: 'campaign.generate',
          data: { brandId, brief, source_play_id: playId },
        });
      }
    });

    // Step 5: Queue flow generation(s)
    await step.run('queue-flows', async () => {
      for (const brief of play.flows) {
        await inngest.send({
          name: 'flow.generate',
          data: { brandId, brief, source_play_id: playId },
        });
      }
    });

    // Step 6: Commit credits + mark activated
    await step.run('finalize', async () => {
      await commitCredits(brandId, play.credits_required, 'play_activation', playId);
      await db.update(brandPlays)
        .set({ status: 'activated', activated_at: new Date() })
        .where(eq(brandPlays.id, playId));
    });
  }
);
```

---

### Schema

```typescript
// brand_product_occasions — occasion tags enriched on Shopify sync
export const brandProductOccasions = pgTable('brand_product_occasions', {
  id:            uuid('id').defaultRandom().primaryKey(),
  product_id:    uuid('product_id').references(() => products.id).notNull(),
  brand_id:      uuid('brand_id').references(() => brands.id).notNull(),
  occasion_tags: text('occasion_tags').array().default([]),
  // ['anniversary', 'gift'] — multiple occasions allowed per product
  confidence:    text('confidence').default('keyword'), // 'keyword' | 'llm'
  tagged_at:     timestamptz('tagged_at').defaultNow(),
});

// detected_patterns — raw patterns before play generation
export const detectedPatterns = pgTable('detected_patterns', {
  id:              uuid('id').defaultRandom().primaryKey(),
  brand_id:        uuid('brand_id').references(() => brands.id).notNull(),
  pattern_type:    text('pattern_type').notNull(),
  // 'volume_occasion' | 'date_cluster' | 'individual_recurrence' | 'replenishment_cycle'
  occasion:        text('occasion').notNull(),
  customer_count:  integer('customer_count').notNull(),
  signal_strength: real('signal_strength').notNull(),
  pattern_data:    jsonb('pattern_data').notNull(),
  play_generated:  boolean('play_generated').default(false),
  detected_at:     timestamptz('detected_at').defaultNow(),
});

// brand_plays — complete plays awaiting user approval
export const brandPlays = pgTable('brand_plays', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  brand_id:            uuid('brand_id').references(() => brands.id).notNull(),
  pattern_id:          uuid('pattern_id').references(() => detectedPatterns.id),
  play_type:           text('play_type').notNull(),
  status:              text('status').default('pending_approval'),
  // 'pending_approval' | 'approved' | 'dismissed' | 'activated'
  display_title:       text('display_title').notNull(),
  display_insight:     text('display_insight').notNull(),
  segment_definition:  jsonb('segment_definition').notNull(),
  campaign_briefs:     jsonb('campaign_briefs').notNull(),
  flow_briefs:         jsonb('flow_briefs').notNull(),
  profile_updates:     jsonb('profile_updates'),
  estimated_revenue:   real('estimated_revenue'),
  confidence:          text('confidence').notNull(),
  credits_required:    integer('credits_required').notNull(),
  klaviyo_segment_id:  text('klaviyo_segment_id'),
  activated_at:        timestamptz('activated_at'),
  dismissed_at:        timestamptz('dismissed_at'),
  created_at:          timestamptz('created_at').defaultNow(),
});
```

---

### New VIYO Klaviyo Profile Properties

Written to subscriber profiles at activation time so date-trigger flows fire correctly:

```typescript
export const VIYO_OCCASION_PROPERTIES = {
  anniversary_purchase_date: 'viyo_anniversary_purchase_date',  // ISO date string
  anniversary_occasion:      'viyo_anniversary_occasion',       // 'anniversary'
  birthday_month:            'viyo_birthday_month',             // 1–12
  replenishment_due_date:    'viyo_replenishment_due_date',     // ISO date string
  last_occasion_purchase:    'viyo_last_occasion_purchase',     // JSON: { occasion, date, sku }
} as const;
```

---

### Play Type → Pattern Type Mapping

| Pattern Detected | Play Generated | Components |
|---|---|---|
| 23 customers bought anniversary products | Anniversary Full Play | Segment + gift guide campaign + annual reminder flow |
| 15 customers bought birthday gifts | Birthday Occasion Play | Segment + birthday campaign |
| Purchase spike in May–June (date cluster) | Seasonal Advance Campaign | Campaign brief for next year's peak window |
| Product reordered every 47 days | Replenishment Flow | Reorder reminder flow at day 40 post-purchase |
| 8 customers bought baby shower gifts | New Parent Play | Segment + milestone email series brief |
| 3 customers bought same product 2 years running | Individual Recurrence Play | Date-anchored reminder flow for next year |
| Christmas ornament spike in November | Seasonal Holiday Play | Advance campaign brief for October next year |
| Dog products cluster around August | Pet Occasion Play | Pet Buyers segment + back-to-school pet campaign |

---

### Adding New Occasions

The entire system extends by adding one row to `OCCASION_SIGNALS`. No code changes elsewhere. New vertical? Add signals. New occasion type? Add signals. The pattern detector, play generator, and play card all pick it up automatically on the next cron run.

---

## 20I. Smart Insight Engine

### Overview

VIYO does not wait for the user to go looking for problems. The Smart Insight Engine runs continuously in the background, analyzes performance data, detects gaps, extracts learnings, and surfaces prioritized, actionable recommendations - one step above a passive alert system.

Every insight is a complete brief: here is what we found, here is why it matters, here is what to do about it, and here is what it should cost.

---

### Four Insight Categories

| Category | Description | Example |
|---|---|---|
| `performance` | What just happened and what it means | "Your win-back campaign hit 38% open rate - 2.4x your benchmark" |
| `recommendation` | A gap or opportunity we detected | "You have no post-purchase flow. Brands in your vertical earn $4.20 per recipient from this flow." |
| `learning` | A pattern extracted from your sends | "Short subject lines (under 35 chars) outperform long ones by 22% for your list" |
| `opportunity` | A behavioral play detected from purchase data | "12 customers bought anniversary products in June. We can build a segment + reminder flow for next year." |

---

### Core Interface

```typescript
export interface InsightEvidence {
  data_points: Array<{
    label: string;
    value: string | number;
    comparison?: string; // e.g. "vs. 18% benchmark"
  }>;
  explanation: string; // plain English summary of what the data shows
}

export interface InsightImpact {
  type: 'revenue' | 'engagement' | 'deliverability' | 'retention';
  estimate: string;      // e.g. "$420/mo additional revenue"
  confidence: 'high' | 'medium' | 'low';
  basis: string;         // e.g. "based on 847 brands with similar list size"
}

export interface InsightAction {
  label: string;         // e.g. "Build Post-Purchase Flow"
  action_type: 'generate_flow' | 'generate_campaign' | 'create_segment' | 'view_report' | 'activate_play';
  payload: Record<string, unknown>; // pre-filled brief or play_id
  credits_required?: number;
}

export interface BrandInsight {
  id: string;
  brand_id: string;
  category: 'performance' | 'recommendation' | 'learning' | 'opportunity';
  status: 'pending' | 'shown' | 'acted' | 'dismissed' | 'expired';
  priority_score: number;        // 0-100, computed by ranker
  headline: string;              // one line, written for the user
  summary: string;               // 2-3 sentences of context
  evidence: InsightEvidence;
  impact_estimate: InsightImpact;
  recommended_action: InsightAction;
  source_agent: string;          // which generator produced this
  source_ids: string[];          // campaign_id, flow_id, segment_id that drove it
  expires_at: Date | null;
  acted_at: Date | null;
  dismissed_at: Date | null;
  created_at: Date;
}
```

---

### Five Insight Generators

#### Generator 1 - Performance Insight (fires 48h after every send)

```typescript
// Inngest function — fires on campaign.performance.analyze event
export const performanceInsightGenerator = inngest.createFunction(
  { id: 'performance-insight-generator' },
  { event: 'campaign/performance.analyze' },
  async ({ event, step }) => {
    const { brandId, campaignId } = event.data;

    const metrics = await step.run('fetch-metrics', async () => {
      return fetchCampaignMetrics(campaignId); // open rate, CTR, revenue, unsubscribes
    });

    const benchmarks = await step.run('fetch-benchmarks', async () => {
      return fetchVerticalBenchmarks(brandId); // by vertical + list size tier
    });

    const deltas = computeDeltas(metrics, benchmarks);

    // Only surface if there is a meaningful signal - not every send gets an insight
    const isSignificant = (
      Math.abs(deltas.openRate) > 0.08 ||   // 8pp above or below benchmark
      Math.abs(deltas.revenue) > 0.30 ||    // 30% above or below expected
      metrics.unsubscribeRate > 0.005        // deliverability warning threshold
    );

    if (!isSignificant) return { surfaced: false };

    const isPositive = deltas.openRate > 0 && deltas.revenue >= 0;

    await createInsight({
      brand_id: brandId,
      category: 'performance',
      headline: isPositive
        ? `"${metrics.subject_line}" hit ${(metrics.openRate * 100).toFixed(0)}% opens - ${Math.round(deltas.openRate * 100)}pp above benchmark`
        : `"${metrics.subject_line}" underperformed - ${Math.abs(Math.round(deltas.openRate * 100))}pp below benchmark`,
      summary: buildPerformanceSummary(metrics, benchmarks, deltas),
      evidence: {
        data_points: [
          { label: 'Open rate', value: `${(metrics.openRate * 100).toFixed(1)}%`, comparison: `vs. ${(benchmarks.openRate * 100).toFixed(1)}% benchmark` },
          { label: 'CTR', value: `${(metrics.ctr * 100).toFixed(1)}%`, comparison: `vs. ${(benchmarks.ctr * 100).toFixed(1)}% benchmark` },
          { label: 'Revenue per recipient', value: `$${metrics.revenuePerRecipient.toFixed(2)}`, comparison: `vs. $${benchmarks.revenuePerRecipient.toFixed(2)} benchmark` },
        ],
        explanation: isPositive
          ? 'This campaign outperformed your vertical benchmark. The learning has been logged to your Personal Brain.'
          : 'This campaign underperformed. The data has been flagged for pattern analysis.',
      },
      impact_estimate: {
        type: 'revenue',
        estimate: isPositive
          ? `+$${Math.round(metrics.revenue - benchmarks.expectedRevenue)} vs. expected`
          : `-$${Math.round(benchmarks.expectedRevenue - metrics.revenue)} vs. expected`,
        confidence: 'high',
        basis: 'actual send data vs. vertical benchmark',
      },
      recommended_action: isPositive
        ? { label: 'Generate Similar Campaign', action_type: 'generate_campaign', payload: { learning_context: campaignId } }
        : { label: 'View Analysis', action_type: 'view_report', payload: { campaign_id: campaignId } },
      source_agent: 'performance_insight_generator',
      source_ids: [campaignId],
      priority_score: computeInsightPriorityScore({ category: 'performance', impact: deltas.revenue, confidence: 'high' }),
    });
  }
);
```

#### Generator 2 - Flow Gap Insight (Monday 07:00 UTC weekly)

```typescript
// Flow revenue benchmarks by vertical
export const FLOW_REVENUE_BENCHMARKS: Record<string, Record<string, number>> = {
  fashion: {
    welcome_series:      3.50, // $ per recipient
    abandoned_cart:      5.20,
    post_purchase:       4.20,
    browse_abandonment:  1.80,
    win_back:            2.10,
    vip_welcome:         8.40,
  },
  beauty: {
    welcome_series:      4.10,
    abandoned_cart:      6.30,
    post_purchase:       5.80,
    browse_abandonment:  2.20,
    win_back:            2.90,
    vip_welcome:         9.20,
  },
  // ... other verticals
};

export const flowGapInsightGenerator = inngest.createFunction(
  { id: 'flow-gap-insight-generator' },
  { cron: '0 7 * * 1' }, // Monday 07:00 UTC
  async ({ step }) => {
    const brands = await step.run('fetch-active-brands', fetchActiveBrands);

    for (const brand of brands) {
      await step.run(`check-gaps-${brand.id}`, async () => {
        const activeFlows = await fetchActiveFlowTypes(brand.id);      // from Klaviyo sync
        const vertical    = brand.vertical ?? 'fashion';
        const benchmarks  = FLOW_REVENUE_BENCHMARKS[vertical] ?? FLOW_REVENUE_BENCHMARKS.fashion;
        const listSize    = await fetchListSize(brand.id);

        const STANDARD_FLOWS = Object.keys(benchmarks);
        const missingFlows   = STANDARD_FLOWS.filter(f => !activeFlows.includes(f));

        // Sort missing flows by potential revenue impact, surface the highest one
        const topMissing = missingFlows
          .map(f => ({ flow: f, potential: benchmarks[f] * listSize }))
          .sort((a, b) => b.potential - a.potential)[0];

        if (!topMissing) return; // no gaps

        const alreadySurfaced = await hasRecentInsight(brand.id, 'recommendation', `flow_gap:${topMissing.flow}`, 14);
        if (alreadySurfaced) return;

        await createInsight({
          brand_id: brand.id,
          category: 'recommendation',
          headline: `You're missing a ${formatFlowName(topMissing.flow)} - estimated $${Math.round(topMissing.potential).toLocaleString()}/mo unrealised`,
          summary: `Brands in your vertical with a ${formatFlowName(topMissing.flow)} earn $${benchmarks[topMissing.flow].toFixed(2)} per recipient on average. With your list of ${listSize.toLocaleString()} subscribers, this flow could add $${Math.round(topMissing.potential).toLocaleString()} per month.`,
          evidence: {
            data_points: [
              { label: 'Flow type', value: formatFlowName(topMissing.flow) },
              { label: 'Benchmark RPR', value: `$${benchmarks[topMissing.flow].toFixed(2)}`, comparison: `${vertical} vertical average` },
              { label: 'Your list size', value: listSize.toLocaleString() },
              { label: 'Monthly potential', value: `$${Math.round(topMissing.potential).toLocaleString()}` },
            ],
            explanation: `Revenue per recipient (RPR) is the average revenue earned per email recipient for this flow type, based on ${vertical} brands with similar list sizes.`,
          },
          impact_estimate: {
            type: 'revenue',
            estimate: `~$${Math.round(topMissing.potential).toLocaleString()}/mo`,
            confidence: 'medium',
            basis: `${vertical} vertical benchmark across 847 brands`,
          },
          recommended_action: {
            label: `Build ${formatFlowName(topMissing.flow)}`,
            action_type: 'generate_flow',
            payload: { flow_type: topMissing.flow },
            credits_required: CREDIT_COSTS.FLOW_EMAIL * 3, // assumes 3-email flow
          },
          source_agent: 'flow_gap_insight_generator',
          source_ids: [],
          priority_score: computeInsightPriorityScore({ category: 'recommendation', impact: topMissing.potential / 1000, confidence: 'medium' }),
        });
      });
    }
  }
);
```

#### Generator 3 - Campaign Learning Extractor (every 5 campaigns)

```typescript
// Fires after every 5th campaign send for a brand
export async function extractCampaignLearnings(brandId: string): Promise<void> {
  const recentCampaigns = await fetchRecentCampaigns(brandId, 5);
  if (recentCampaigns.length < 5) return;

  const alreadyAnalyzed = await hasRecentInsight(brandId, 'learning', 'pattern_extract', 7);
  if (alreadyAnalyzed) return;

  // Gemini 2.5 Flash at temp 0.1 — deterministic pattern extraction
  const prompt = `
You are an email performance analyst. Analyze these 5 campaign results and extract the single most actionable learning.

<campaigns>
${recentCampaigns.map(c => `
Campaign: ${c.subject_line}
Send time: ${c.sent_at} (${c.day_of_week} ${c.hour_of_day}h)
List segment: ${c.segment_name}
Open rate: ${(c.open_rate * 100).toFixed(1)}%
CTR: ${(c.ctr * 100).toFixed(1)}%
Revenue per recipient: $${c.revenue_per_recipient.toFixed(2)}
Subject line length: ${c.subject_line.length} chars
Had offer: ${c.has_offer}
Offer type: ${c.offer_type ?? 'none'}
`).join('\n---\n')}
</campaigns>

Identify one clear pattern. What variable most consistently correlates with performance?

Respond in JSON:
{
  "pattern_variable": "subject_line_length | send_time | segment | offer_presence | offer_type",
  "finding": "one sentence describing the pattern",
  "headline": "short headline for the user (max 12 words)",
  "summary": "2-3 sentences of context",
  "evidence_explanation": "plain English explanation",
  "confidence": "high | medium | low"
}
`;

  const response = await gemini25Flash.generateContent(prompt);
  const learning = JSON.parse(response.text());

  const topCampaign   = recentCampaigns.reduce((a, b) => a.open_rate > b.open_rate ? a : b);
  const bottomCampaign = recentCampaigns.reduce((a, b) => a.open_rate < b.open_rate ? a : b);

  await createInsight({
    brand_id: brandId,
    category: 'learning',
    headline: learning.headline,
    summary: learning.summary,
    evidence: {
      data_points: [
        { label: 'Best performer', value: `"${topCampaign.subject_line}"`, comparison: `${(topCampaign.open_rate * 100).toFixed(1)}% open rate` },
        { label: 'Lowest performer', value: `"${bottomCampaign.subject_line}"`, comparison: `${(bottomCampaign.open_rate * 100).toFixed(1)}% open rate` },
        { label: 'Pattern variable', value: learning.pattern_variable },
      ],
      explanation: learning.evidence_explanation,
    },
    impact_estimate: {
      type: 'engagement',
      estimate: 'Apply to next 5 campaigns',
      confidence: learning.confidence as 'high' | 'medium' | 'low',
      basis: 'last 5 campaigns',
    },
    recommended_action: {
      label: 'Generate Campaign Using This Learning',
      action_type: 'generate_campaign',
      payload: { learning_context: { pattern: learning.pattern_variable, finding: learning.finding } },
    },
    source_agent: 'learning_extractor',
    source_ids: recentCampaigns.map(c => c.id),
    priority_score: computeInsightPriorityScore({ category: 'learning', impact: 0.5, confidence: learning.confidence }),
  });

  // Write back to Personal Brain winning_formulas
  await upsertWinningFormula(brandId, {
    pattern_variable: learning.pattern_variable,
    finding: learning.finding,
    confidence: learning.confidence,
    derived_from: recentCampaigns.map(c => c.id),
  });
}
```

#### Generator 4 - Segment Opportunity Detector (weekly after Klaviyo sync)

```typescript
export async function detectSegmentOpportunities(brandId: string): Promise<void> {
  const klaviyoData = await fetchKlaviyoSyncData(brandId);

  const checks: Array<{
    condition: boolean;
    headline: string;
    summary: string;
    segment_type: string;
    size_estimate: number;
  }> = [
    {
      condition: klaviyoData.vipCount > 50 && !klaviyoData.hasVipSegment,
      headline: `${klaviyoData.vipCount} high-LTV customers have no VIP segment`,
      summary: `You have ${klaviyoData.vipCount} customers with predicted LTV above $500. Brands that segment and nurture their VIP tier see 2.8x higher repeat purchase rate. A VIP Welcome flow alone earns $8.40 per recipient on average.`,
      segment_type: 'vip',
      size_estimate: klaviyoData.vipCount,
    },
    {
      condition: klaviyoData.lapsedCount > 200 && !klaviyoData.hasWinBackFlow,
      headline: `${klaviyoData.lapsedCount.toLocaleString()} subscribers haven't opened in 90+ days`,
      summary: `Your lapsed segment is large enough to warrant a dedicated win-back flow. Even a 5% reactivation rate on ${klaviyoData.lapsedCount.toLocaleString()} subscribers means ${Math.round(klaviyoData.lapsedCount * 0.05).toLocaleString()} re-engaged customers.`,
      segment_type: 'win_back',
      size_estimate: klaviyoData.lapsedCount,
    },
    {
      condition: klaviyoData.dominantCategory !== null && !klaviyoData.hasCategorySegment,
      headline: `${klaviyoData.categoryCount} buyers in "${klaviyoData.dominantCategory}" with no targeted segment`,
      summary: `Your top purchase category is "${klaviyoData.dominantCategory}". Category-specific campaigns outperform general sends by 34% in CTR for fashion brands. This segment is ready to build.`,
      segment_type: 'category_affinity',
      size_estimate: klaviyoData.categoryCount,
    },
  ];

  for (const check of checks) {
    if (!check.condition) continue;
    const alreadySurfaced = await hasRecentInsight(brandId, 'recommendation', `segment:${check.segment_type}`, 14);
    if (alreadySurfaced) continue;

    await createInsight({
      brand_id: brandId,
      category: 'recommendation',
      headline: check.headline,
      summary: check.summary,
      evidence: {
        data_points: [
          { label: 'Segment size', value: check.size_estimate.toLocaleString() },
          { label: 'Segment type', value: check.segment_type },
        ],
        explanation: 'Based on your Klaviyo subscriber data synced in the last 24 hours.',
      },
      impact_estimate: {
        type: 'revenue',
        estimate: `Segment of ${check.size_estimate.toLocaleString()}`,
        confidence: 'medium',
        basis: 'Klaviyo sync data',
      },
      recommended_action: {
        label: 'Create Segment',
        action_type: 'create_segment',
        payload: { segment_type: check.segment_type },
      },
      source_agent: 'segment_opportunity_detector',
      source_ids: [],
      priority_score: computeInsightPriorityScore({ category: 'recommendation', impact: check.size_estimate / 1000, confidence: 'medium' }),
    });
  }
}
```

#### Generator 5 - Behavioral Play Detector (from Section 20H)

Behavioral plays detected in Section 20H automatically surface as `opportunity` insights. When `generateAnniversaryPlay()` or any play generator creates a record in `brand_plays`, the play detector fires `insight.opportunity.detected` and creates a corresponding `BrandInsight` with `action_type: 'activate_play'` and the `play_id` in the payload. One system, two surfaces.

---

### Insight Ranker

```typescript
interface RankingInput {
  category: 'performance' | 'recommendation' | 'learning' | 'opportunity';
  impact: number;       // normalized 0-1 (revenue delta / 1000, or segment size / 10000)
  confidence: 'high' | 'medium' | 'low';
}

const CATEGORY_URGENCY: Record<string, number> = {
  performance: 30,       // just happened — show now
  opportunity: 25,       // time-sensitive play
  recommendation: 20,    // gap that costs money daily
  learning: 15,          // valuable but not urgent
};

const CONFIDENCE_WEIGHT: Record<string, number> = {
  high: 1.0,
  medium: 0.75,
  low: 0.5,
};

export function computeInsightPriorityScore(input: RankingInput): number {
  const urgency    = CATEGORY_URGENCY[input.category];
  const impactScore = Math.min(input.impact * 40, 40); // cap at 40 pts
  const confidence  = CONFIDENCE_WEIGHT[input.confidence] * 15;
  const recency     = 15; // full recency score at creation, decays over time

  return Math.round(urgency + impactScore + confidence + recency);
}

// Frequency cap — max 3 insights per brand per 7-day window
export async function applyFrequencyCap(brandId: string, insight: Partial<BrandInsight>): Promise<boolean> {
  const recentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(brandInsights)
    .where(
      and(
        eq(brandInsights.brand_id, brandId),
        gt(brandInsights.created_at, sql`now() - interval '7 days'`),
        ne(brandInsights.status, 'dismissed'),
      )
    );

  if (recentCount[0].count >= 3) return false; // cap hit - defer this insight

  // Exception: deliverability warnings always go through
  if (insight.category === 'performance' && insight.headline?.includes('unsubscribe')) return true;

  return true;
}
```

---

### UI Surfaces

#### Surface 1 - Enhanced Notification Bell

The existing notification bell gains a second tab:

```
[ Alerts | Insights (3) ]

Alerts: system events (flow published, campaign sent, Klaviyo sync complete)
Insights: ranked BrandInsight cards
```

Each insight card in the bell:
- Headline (bold)
- One-line summary
- CTA button - e.g. "Build Flow" or "View Analysis"
- Dismiss (x) with optional "Don't show this type again"

#### Surface 2 - /insights Page

Full-page feed at `/insights`:

```
┌─────────────────────────────────────────────────┐
│  Your Insights                    Filter: All ▼  │
├─────────────────────────────────────────────────┤
│  🔴 OPPORTUNITY  •  Priority 94                 │
│  12 customers bought anniversary products       │
│  in June. Build a reminder flow for next year.  │
│  [Activate Play]  [Dismiss]                     │
├─────────────────────────────────────────────────┤
│  🟡 RECOMMENDATION  •  Priority 82              │
│  You're missing a Post-Purchase Flow            │
│  ~$4,200/mo in unrealised revenue               │
│  [Build Flow - 3,000 credits]  [Dismiss]        │
├─────────────────────────────────────────────────┤
│  🔵 LEARNING  •  Priority 71                    │
│  Short subject lines outperform by 22%          │
│  Based on your last 5 campaigns                 │
│  [Use This Learning]  [Dismiss]                 │
└─────────────────────────────────────────────────┘
```

#### Surface 3 - Inline Surfacing

On relevant pages, the highest-priority matching insight surfaces inline:

- `/flows` page with no post-purchase flow: banner with flow gap insight
- `/campaigns` page after a strong send: performance insight card at top
- `/segments` page with lapsed subscribers: segment opportunity card

---

### Weekly Digest Email

Sent every Monday morning in `plain_text_personal` format from "Sarah from VIYO":

```
Subject: Your VIYO week in review, {first_name}

Hey {first_name},

Here's what we noticed this week for {brand_name}.

---

TOP INSIGHT:
{top_insight_headline}

{top_insight_summary}

→ {top_insight_action_label}: {app_url}/insights/{top_insight_id}

---

{if secondary_insight}
ALSO WORTH NOTING:
{secondary_insight_headline}

{secondary_insight_summary}

---
{endif}

That's it from us. Log in any time to see the full picture.

Sarah from VIYO
```

Plain text, no images, personal sender name. Sent via Resend. Opt-out available in account settings (separate from Klaviyo unsubscribe).

---

### Database Schema

```typescript
export const brandInsights = pgTable('brand_insights', {
  id:                uuid('id').defaultRandom().primaryKey(),
  brand_id:          uuid('brand_id').references(() => brands.id).notNull(),
  category:          text('category').notNull(),              // performance | recommendation | learning | opportunity
  status:            text('status').default('pending').notNull(), // pending | shown | acted | dismissed | expired
  priority_score:    integer('priority_score').notNull(),
  headline:          text('headline').notNull(),
  summary:           text('summary').notNull(),
  evidence:          jsonb('evidence').notNull(),             // InsightEvidence
  impact_estimate:   jsonb('impact_estimate').notNull(),      // InsightImpact
  recommended_action: jsonb('recommended_action').notNull(),  // InsightAction
  source_agent:      text('source_agent').notNull(),
  source_ids:        text('source_ids').array().default([]).notNull(),
  expires_at:        timestamp('expires_at'),
  acted_at:          timestamp('acted_at'),
  dismissed_at:      timestamp('dismissed_at'),
  created_at:        timestamp('created_at').defaultNow().notNull(),
});

export const insightOutcomes = pgTable('insight_outcomes', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  insight_id:          uuid('insight_id').references(() => brandInsights.id).notNull(),
  brand_id:            uuid('brand_id').references(() => brands.id).notNull(),
  action_taken:        text('action_taken').notNull(),         // what user clicked
  result_entity_id:    text('result_entity_id'),               // campaign_id or flow_id created
  // Performance filled in 48h later
  open_rate:           real('open_rate'),
  ctr:                 real('ctr'),
  revenue_generated:   real('revenue_generated'),
  insight_was_correct: boolean('insight_was_correct'),         // did the action produce the predicted outcome?
  created_at:          timestamp('created_at').defaultNow().notNull(),
  evaluated_at:        timestamp('evaluated_at'),
});
```

---

### The Outcome Loop

When a user acts on an insight, the loop closes:

```
User acts on insight
        ↓
insightOutcomes record created (action_taken, result_entity_id)
        ↓
Campaign / flow sends
        ↓
48h later — performanceInsightGenerator fires
        ↓
Checks insightOutcomes for matching campaigns
        ↓
Updates insight_was_correct, open_rate, CTR, revenue_generated
        ↓
If positive outcome: upsertWinningFormula() writes to Personal Brain
        ↓
Next generation — CMO Brain sees proven pattern in winning_formulas
        ↓
System compounds
```

Every insight that performs well strengthens the Personal Brain. Every insight that does not feeds back into the ranker confidence model. The system gets sharper with every cycle.

---

### Environment Variables

```bash
INSIGHT_FREQUENCY_CAP_WEEKLY=3        # max insights surfaced per brand per 7 days
INSIGHT_FLOW_GAP_CRON="0 7 * * 1"    # Monday 07:00 UTC
INSIGHT_DIGEST_CRON="0 8 * * 1"      # Monday 08:00 UTC (after gap check completes)
INSIGHT_PERFORMANCE_DELAY_HOURS=48   # wait 48h after send before analyzing
INSIGHT_LEARNING_BATCH_SIZE=5        # extract learnings every N campaigns
RESEND_DIGEST_FROM="sarah@viyo.new"
```

---

## 20J. Self-Learning Skill Admin

### Overview

The Self-Learning Skill Admin is Nir's editorial control surface for everything the Top Brain has learned. Without it, the AI learns in a black box and its judgment cannot be steered. With it, Nir operates as editorial director — the system handles volume and extraction, he handles judgment and doctrine.

Route: `/admin/learning`

Access: `viyo_admin` role only. Brand users never see Top Brain internals.

---

### Pattern Lifecycle

```
Detected → Pending Review → Approved → Active in Generation
                ↓
             Rejected

Active → Deprecated  (triggered by performance flag)
```

Not every pattern requires Nir's approval. The system auto-approves high-confidence patterns and surfaces only ambiguous ones.

**Auto-approve criteria (all four must be true):**
1. Seen in 5+ emails with MCS > 75
2. Pattern type is established (not a new category)
3. No conflicting evidence (not also prevalent in D-grade emails)
4. Does not contradict any Email Bible doctrine

Fail any one → enters review queue with a reason tag.

---

### Marketing Craft Score (MCS)

Every ingested email receives an MCS (0-100) computed by Gemini 2.5 Flash at temperature 0.0. The score measures execution quality from the HTML and metadata alone — without access to actual send performance data.

**Six dimensions:**

| Dimension | Max pts | What it measures |
|---|---|---|
| Subject line effectiveness | 20 | Length optimization, emotional hook, preview alignment, spam signal avoidance |
| Offer clarity | 15 | Value prop above-fold, expiry clarity, CTA verb matching. N/A if no offer — weight redistributes. |
| Copy quality | 20 | Brevity vs. email type, benefit-to-feature ratio, reading grade (Flesch-Kincaid 6-8 optimal), emotional specificity |
| Psychological levers | 20 | Which triggers are activated (urgency, scarcity, social proof, reciprocity, loss aversion) and how precisely they are deployed in combination |
| Design structure | 15 | Single dominant CTA, image-to-text ratio, mobile responsiveness signals, scannability |
| Personalization depth | 10 | Merge tags, dynamic content, segment-specific language, behavioral trigger references |

**Grade thresholds:**

| Grade | Score | Corpus treatment |
|---|---|---|
| A | 80-100 | Fed into deep pattern extraction. Weighted 3x in pattern frequency. |
| B | 65-79 | Standard weight in pattern mining. |
| C | 50-64 | Catalogued, not pattern-mined. Available for browsing. |
| D | <50 | Stored but filtered out of generation context. Manual override available. |

**Special case:** `layout_type = 'plain_text_personal'` — design_structure scores N/A, weight redistributes to copy quality and psychological levers. The model evaluates scannability and pacing through copy structure instead of visual hierarchy.

```typescript
export interface MarketingCraftScore {
  total: number;                    // 0-100
  subject_line: number;             // 0-20
  offer_clarity: number | null;     // 0-15 or null if no offer
  copy_quality: number;             // 0-20
  psychological_levers: number;     // 0-20
  design_structure: number;         // 0-15
  personalization_depth: number;    // 0-10
  top_levers: string[];             // e.g. ['urgency', 'scarcity']
  grade: 'A' | 'B' | 'C' | 'D';
  scored_by: 'gemini_flash';
  scored_at: Date;
}

export async function scoreEmail(email: TopBrainEmail): Promise<MarketingCraftScore> {
  const cleanedHtml = stripTracking(email.html);

  const response = await gemini25Flash.generateContent({
    systemInstruction: MCS_SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: buildMCSPrompt(email, cleanedHtml) }] }],
    generationConfig: { temperature: 0.0, responseMimeType: 'application/json' },
  });

  const raw = JSON.parse(response.text());
  const total = computeTotal(raw);

  return {
    ...raw,
    total,
    grade: total >= 80 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : 'D',
    scored_by: 'gemini_flash',
    scored_at: new Date(),
  };
}
```

Scoring is async and queued after ingestion — not in the ingestion hot path. Emails are stored first; scoring completes within minutes via the background job queue.

**MCS in pattern weighting:**

```typescript
// Craft-weighted pattern frequency — A-grade source emails count more
SELECT
  pattern_name,
  COUNT(*) as raw_count,
  AVG(e.mcs_total) as avg_source_quality,
  SUM(e.mcs_total) / 100.0 as weighted_frequency
FROM top_brain_email_patterns p
JOIN top_brain_emails e ON p.email_id = e.id
GROUP BY pattern_name
ORDER BY weighted_frequency DESC;
```

A pattern from 20 A-grade emails (weighted frequency 18.0) outranks one from 50 D-grade emails (weighted frequency 17.5). The brain learns from quality, not volume.

---

### Page Layout

Three tabs under a persistent header.

**Header (always visible):**

```
Global Patterns: 1,247 approved · 34 pending review · 89 rejected
Brand Learnings: 4 brands with active learnings
Last extraction run: 3h ago · 12 new patterns detected · 3 queued for review
[Run Extraction Now]                               [Toggle: Global / Brand ▼]
```

The toggle switches the entire page between:
- **Global Patterns** — extracted from the Top Brain corpus, apply across all brands
- **Brand Learnings** — extracted from a specific brand's Personal Brain (their own send performance), with a brand picker

---

### Tab 1: Pending Review

The approval queue. Three reason tags, each with a distinct UI state:

**Reason: `NEW PATTERN TYPE`**

First-ever detection of a pattern category. Requires manual approval before entering the corpus. Nir sees: definition, source email count, average MCS, which brands the sources came from, and a link to view all source emails. Actions: Approve / Reject / Approve with note / Flag for later.

**Reason: `CONFLICTING EVIDENCE`**

Pattern appears at similar rates in A-grade and D-grade emails — signal is ambiguous. Nir sees the evidence split as a bar chart (e.g. 58% A-grade, 42% D-grade), side-by-side comparison links, and three interpretive hypotheses generated by the system. Actions: Approve global / Approve with scope restriction (specific flow types only) / Reject.

**Reason: `CONTRADICTS EMAIL BIBLE`**

Pattern conflicts with established doctrine. Nir sees the specific Bible chapter and rule being contradicted. Three resolution paths:
- Reject to preserve doctrine
- Approve with scope restriction + update Email Bible
- Approve + flag Bible for review

**Approve with note** stores the annotation in the pattern record and injects it into the pattern's generation context. Nir's reasoning becomes part of the AI's instruction.

**Scope restriction** lets Nir approve a pattern for specific flow types:

```typescript
export interface PatternScope {
  flow_types: FlowType[] | null; // null = global
  verticals: string[] | null;    // null = all verticals
  plan_tiers: string[] | null;   // null = all tiers
}
```

---

### Tab 2: Pattern Library

Full corpus of all approved patterns, filterable and sortable.

**Sort options:** Weighted frequency / Avg source MCS / Generation usage count / Performance lift / Approval date

**Filter options:** Pattern type / Approval source (auto / manual) / Scope / Status

**Each pattern row:**

```
#1  urgency_countdown              Subject line · Auto-approved
Seen in 847 emails · Avg source MCS: 81 · Weighted freq: 686
Used in generation: 234 times · Avg open rate when used: 31.2%
Scope: abandoned_cart, win_back, promotional
[Edit weight  ●────────────○  1.0x]  [View examples]  [Deprecate]
```

**Weight slider** — range 0.1x to 3.0x, default 1.0x. Adjusts how strongly the pattern influences generation without removing it. If Nir knows a pattern is gold, he bumps it. If overused, he pulls it down.

**Pattern detail panel (right side on click):**

- Full definition
- Three inline example subject lines or copy extracts
- Link to all source emails in Top Brain library
- "How it's injected into generation" — the exact instruction text added to the Copywriter Brain context when this pattern is selected. Nir can edit this directly.
- Generation performance: avg open rate lift, CTR lift, RPR lift vs. base, total uses
- Approval history with timestamps and notes
- Actions: Edit Definition / Adjust Scope / Change Weight / Deprecate

**"How it's injected into generation"** is the transparency mechanism that matters most. Nir sees and can edit the exact instruction the AI receives — not an abstraction of it.

---

### Tab 3: Performance

Which patterns are working in live generation.

**Sections:**

**Trending Up** — patterns gaining effectiveness over the last 90 days. Suggestion: boost weight.

**Trending Down** — patterns losing effectiveness. Suggestion: reduce weight or deprecate.

**Top Performers** — ranked table: pattern name / avg open rate lift / avg RPR lift / generation use count. Performance flags surface inline (e.g. high open rate but revenue-neutral — scope to win-back only?).

**Never Used** — approved patterns with zero generation uses in 90 days. These may need weight boost, scope clarification, or definition refinement. Ignoring this list means the corpus silently bloats with patterns the CMO Brain never selects.

---

### Manual Pattern Seeding

"Add Pattern" button accessible from any tab. Form fields: pattern name (slug_case), type, definition, scope (flow types checkboxes), initial weight (defaults to 1.5x — if Nir is seeding it manually it is likely high-signal), internal note.

Manually seeded patterns:
- Tagged `manual_seed` badge in the library
- Never auto-deprecated — require explicit manual removal
- Always pass the review queue (no auto-approve logic for manual seeds)

---

### Activity Log

Persistent collapsible panel showing full audit trail with timestamps and actor. Every approval, rejection, weight change, and extraction run is logged. When generation quality drops, Nir can trace exactly which pattern was approved, when, and with what rationale.

---

### How Approved Patterns Flow Into Generation

```typescript
// CMO Brain context assembly at generation time
const relevantPatterns = await db
  .select()
  .from(topBrainPatterns)
  .where(
    and(
      eq(topBrainPatterns.status, 'approved'),
      or(
        isNull(topBrainPatterns.scope_flow_types),
        sql`${topBrainPatterns.scope_flow_types} @> ${[flowType]}::text[]`
      ),
      gte(topBrainPatterns.weighted_frequency, 50),
    )
  )
  .orderBy(
    desc(sql`${topBrainPatterns.weighted_frequency} * ${topBrainPatterns.weight_multiplier}`)
  )
  .limit(8);

// Each approved pattern becomes a concrete instruction in CMO context
const patternInstructions = relevantPatterns
  .map(p => `- ${p.pattern_name}: ${p.injected_instruction}`)
  .join('\n');
```

The `injected_instruction` field is what Nir edits in the detail panel. The pattern name is the label. The instruction is what the brain actually receives. Nir has full control over the phrasing of every instruction the AI uses.

---

### Database Schema

```typescript
export const topBrainPatterns = pgTable('top_brain_patterns', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  pattern_name:        text('pattern_name').notNull().unique(),  // slug_case
  pattern_type:        text('pattern_type').notNull(),           // 'subject_line' | 'copy_structure' | 'offer_cadence' | 'layout' | 'timing' | 'psychological_lever'
  status:              text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected' | 'deprecated'
  approval_source:     text('approval_source'),                  // 'auto' | 'manual' | 'manual_seed'
  definition:          text('definition').notNull(),
  injected_instruction: text('injected_instruction').notNull(),   // what the CMO Brain actually receives
  scope_flow_types:    text('scope_flow_types').array(),         // null = global
  scope_verticals:     text('scope_verticals').array(),          // null = all verticals
  weight_multiplier:   real('weight_multiplier').default(1.0).notNull(),
  weighted_frequency:  real('weighted_frequency').default(0).notNull(),
  raw_frequency:       integer('raw_frequency').default(0).notNull(),
  avg_source_mcs:      real('avg_source_mcs'),
  review_reason:       text('review_reason'),                    // 'new_pattern_type' | 'conflicting_evidence' | 'bible_conflict'
  nir_note:            text('nir_note'),
  // Generation performance (backfilled by outcome tracker)
  generation_uses:     integer('generation_uses').default(0),
  avg_open_rate_lift:  real('avg_open_rate_lift'),
  avg_ctr_lift:        real('avg_ctr_lift'),
  avg_rpr_lift:        real('avg_rpr_lift'),
  performance_flagged: boolean('performance_flagged').default(false),
  created_at:          timestamp('created_at').defaultNow().notNull(),
  approved_at:         timestamp('approved_at'),
  deprecated_at:       timestamp('deprecated_at'),
});

export const patternAuditLog = pgTable('pattern_audit_log', {
  id:           uuid('id').defaultRandom().primaryKey(),
  pattern_id:   uuid('pattern_id').references(() => topBrainPatterns.id).notNull(),
  action:       text('action').notNull(),                        // 'approved' | 'rejected' | 'weight_changed' | 'scope_updated' | 'deprecated' | 'note_added'
  actor:        text('actor').notNull(),                         // 'auto' | 'nir' | user_id
  previous_value: jsonb('previous_value'),
  new_value:    jsonb('new_value'),
  note:         text('note'),
  created_at:   timestamp('created_at').defaultNow().notNull(),
});
```

---

### Environment Variables

```bash
MCS_SCORE_BATCH_SIZE=50              # emails scored per background job run
MCS_AUTOAPPROVE_MIN_SOURCES=5        # min A/B-grade source emails for auto-approve
MCS_AUTOAPPROVE_MIN_AVG_SCORE=75     # min avg MCS for auto-approve
PATTERN_EXTRACTION_CRON="0 6 * * *"  # daily 06:00 UTC
PATTERN_MIN_WEIGHTED_FREQ=50         # minimum weighted frequency for CMO Brain selection
PATTERN_MAX_CONTEXT_SLOTS=8          # max patterns injected per generation call
```

---

### Email Browser: Campaign Type Taxonomy

Every email the Top Brain absorbs is classified on two axes at ingest time: **Campaign Type** and **Flow Type**. This runs immediately after the email is stored, before MCS scoring, and both values are indexed for filtering across the email library, pattern library, and grid views.

**Campaign Type** — what the email is trying to do:

| ID | Label | Description | UI Badge Color |
|----|-------|-------------|---------------|
| `text_editorial` | Text / Editorial | Copy-heavy, minimal imagery. Founder letters, brand essays, cultural commentary. | Slate `#64748b` |
| `graphic_visual` | Graphic / Visual | Image-dominant, minimal text, strong art direction. Product as hero. | Violet `#7c3aed` |
| `sales_promotional` | Sales / Promotional | Discount-led. Urgency language. Flash sales, clearance, site-wide events. | Red `#dc2626` |
| `product_launch` | Product Launch | New arrival reveal. First-look. Pre-launch waitlists. Limited drops. | Emerald `#059669` |
| `reengagement` | Re-Engagement | Win-back sequences. Dormant list recovery. | Amber `#d97706` |
| `seasonal_moment` | Seasonal / Moment | Calendar-anchored. Holiday, Mother's Day, Valentine's, Back to School. | Sky `#0284c7` |
| `vip_loyalty` | VIP / Loyalty | Segment-gated. Early access, loyalty milestones, exclusive offers. | Gold `#b45309` |
| `transactional_editorial` | Transactional / Editorial | Post-purchase education, care guides, community onboarding. Low sales pressure. | Zinc `#52525b` |
| `flow_email` | Flow Email | Automated sequence — not a blast. Triggered by behavioral event. | Indigo `#4338ca` |

**Flow Type** — secondary classification applied only when `campaignType = 'flow_email'`:

| ID | Label |
|----|-------|
| `welcome_series` | Welcome Series |
| `abandoned_cart` | Abandoned Cart |
| `browse_abandonment` | Browse Abandonment |
| `post_purchase` | Post-Purchase |
| `win_back` | Win-Back / Re-Engagement |
| `vip_onboarding` | VIP Onboarding |
| `anniversary_birthday` | Anniversary / Birthday |
| `replenishment` | Replenishment / Subscription |
| `sunset` | Sunset / Unsubscribe Prevention |

**Classifier implementation:**

```typescript
async function classifyEmail(email: {
  subjectLine: string;
  htmlBody: string;
  fromName: string;
}): Promise<{ campaignType: CampaignType; flowType: FlowType | null; confidence: number }> {
  const prompt = `
You are an email marketing classifier. Classify this email into exactly one Campaign Type
and (if flow_email) one Flow Type.

Campaign Types: text_editorial, graphic_visual, sales_promotional, product_launch,
reengagement, seasonal_moment, vip_loyalty, transactional_editorial, flow_email

Flow Types (only if campaignType = flow_email): welcome_series, abandoned_cart,
browse_abandonment, post_purchase, win_back, vip_onboarding, anniversary_birthday,
replenishment, sunset

Subject: ${email.subjectLine}
From: ${email.fromName}
HTML (first 2000 chars): ${email.htmlBody.slice(0, 2000)}

Respond with JSON only:
{ "campaignType": "...", "flowType": "...|null", "confidence": 0.0-1.0 }
  `.trim();

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  return JSON.parse(result.choices[0].message.content!);
}
```

Cost: ~$0.0003 per email at gpt-4o-mini pricing. At 500 emails/day: $0.15/day.

**Why two models run at ingest time:**

Two separate jobs run on every ingested email. They are intentionally independent:

| Job | Model | Purpose | When it runs |
|-----|-------|---------|-------------|
| Campaign Type Classifier | GPT-4o-mini | What kind of email is this? (structural classification) | Immediately on ingest — fast, cheap |
| MCS Scorer | Gemini 2.5 Flash | How well is this email executed? (quality assessment) | Async, queued after ingest |

These answer different questions. The classifier decides where to file the email (what tab it appears in, what patterns can be extracted from it). The MCS scorer decides how much weight those patterns receive. A product launch email from a poorly executed campaign still gets classified as `product_launch` — but its MCS score will be D-grade, so patterns extracted from it carry low weight.

**Low-confidence classification handling:**

If `classifier_confidence < 0.70`, the email is stored with its best-guess campaign type but flagged: `classifier_confidence` is surfaced in the email viewer as a yellow warning. Nir can correct the classification manually. Manually corrected classifications are stored as ground truth and used to periodically fine-tune the classifier prompt.

Both `campaignType` and `flowType` are added to the `top_brain_emails` schema:

```typescript
// Additional columns on top_brain_emails
campaign_type:        text('campaign_type').notNull(),     // CampaignType enum
flow_type:            text('flow_type'),                   // FlowType enum | null
classifier_confidence: real('classifier_confidence'),       // 0.0-1.0
```

---

### Email Library: Campaign Type Organization

The email browser at `/admin/top-brain` gains three view modes accessible via tabs at the top of the center panel.

**Feed View (default):**

All brands, all types, sorted newest first. Each email card shows:
- Campaign type badge (color-coded per taxonomy above)
- Brand name and brand tier dot
- Subject line
- Received timestamp
- For flow emails: secondary label showing the flow type (e.g. `[Flow: Abandoned Cart]`)

Filter bar at top of feed: Campaign Type dropdown, Brand picker, Date Range, MCS Grade (A/B/C/D), Health status. Filters combine. Infinite scroll, 50 per page.

**Grid View — Campaign Type Matrix:**

Columns are Campaign Types. Rows are brand tiers (Benchmark / Aspirational / Emerging). Each cell shows email count, a 90-day frequency sparkline, and thumbnail strips of the 3 most recent emails in that intersection.

```
                Text    Graphic   Sales    Launch   Flow    Seasonal   VIP
Benchmark       [12]    [34]      [18]     [9]      [27]    [6]        [4]
Aspirational    [8]     [21]      [31]     [14]     [19]    [11]       [3]
Emerging        [3]     [7]       [12]     [4]      [8]     [2]        [1]
```

Click any cell — opens the feed filtered to that exact tier + type intersection. Answers questions like "what does a Product Launch email from a benchmark brand look like right now?"

**Flow Breakdown View — Flow Type Heatmap:**

Filters to `campaignType = 'flow_email'` only. Groups brands by rows, flow types by columns. Cell color intensity = email count (more emails = richer color). Empty cells are blank.

```
                Welcome   AbanCart  BrowseAb  PostPurch  WinBack   B-Day    Sunset
Represent CLO   ████      ██        ██        ████       ██        ░        ██
Aritzia         ████      ████      ███       ████       ██        ██       ░
Everlane        ███       ██        ░         ████       ███       ░        ██
```

This view directly answers: "What does the best abandoned cart flow look like across 15 premium brands?" — filter to `abandoned_cart`, sort by brand tier, read.

**Pattern Library filter update:**

Tab 2 (Pattern Library) gains a Campaign Type filter alongside the existing pattern type and scope filters. This lets Nir navigate directly to patterns that are specific to one campaign type — e.g. "show me all approved patterns scoped to product launch emails."

---


---

## 20K. Self-Healing Skill Admin

### Overview

The Self-Healing Skill Admin is Nir's operational control surface for everything the system corrects automatically. Without it, the AI heals in a black box. With it, Nir sees every correction, can reverse any decision, and his overrides feed back into improving the healing logic over time.

Route: `/admin/healing`

Access: `viyo_admin` role only.

---

### Two Healing Modes

**Reactive healing** — something broke, the system fixed it (or tried to).
**Proactive healing** — nothing broke yet, but drift was detected and the system intervened early.

Both are logged. Both are overrideable. Both feed back into improving the healing rules.

---

### Healable Failure Taxonomy

| Subsystem | Failure | Auto-Heal Action |
|---|---|---|
| Credit Ledger | Reserved credits never committed (stuck session >24h) | Auto-refund to `credit_balance` |
| Generation Pipeline | Brain returns invalid JSON 3× in a row | Reduce pattern set, retry once, quarantine if still failing |
| Generation Pipeline | Critic score hard-fail on every retry | Quarantine session, surface to Nir |
| Deploy Preflight | Spam score >5.0 on every regeneration attempt | Escalate to hard quarantine, block deploy |
| Klaviyo Sync | OAuth token expired, refresh succeeds | Resume Klaviyo ops, log warning |
| Klaviyo Sync | OAuth token expired, refresh also expired | Quarantine all Klaviyo ops for brand, alert user |
| Klaviyo Push | Inngest retry caused duplicate campaign push | Detect by `session_id` dedup, delete second push |
| Shopify Sync | Webhook failure, product data stale >72h | Queue emergency re-sync, mark vault assets as `stale` |
| Asset Vault | Product SKU deleted in Shopify, still in vault | Archive asset, remove from active generation context |
| Brand Tokens | Generated email hex drifts from brand kit | Re-apply design token layer, log drift delta |
| Pattern Corpus | Deprecated pattern referenced in active session | Strip from session context, flag affected campaigns |
| SMS Engine | Klaviyo consent rate drops below 5% threshold | Pause SMS generation for brand, update eligibility state |
| Insight Generators | Cron produced 0 insights for 2 consecutive weeks | Run diagnostic, surface output to Nir |
| Preflight | Email fails price accuracy check after 2 regenerations | Pull fresh Shopify pricing, force third attempt |

**Healing outcomes:**

| Outcome | Meaning |
|---|---|
| `auto_healed` | Fixed silently, logged only |
| `healed_with_warning` | Fixed, but Nir should know |
| `quarantined` | Isolated, needs Nir's review before proceeding |
| `critical` | Cannot auto-heal, needs immediate intervention |

---

### Page Layout: `/admin/healing`

**Persistent header:**

```
Last 24h:  47 auto-healed  ·  3 healed with warning  ·  2 quarantined
Quarantine queue: 2 items require your review                  [View Now]

System integrity:
Generation ●  Klaviyo ●  Shopify ●  Credits ●  Patterns ●  Vault ●  SMS ⚠
     ✓             ✓         ✓          ✓           ✓          ✓    degraded
```

Clicking a degraded subsystem dot jumps directly to that subsystem's detail view in Tab 3.

---

### Tab 1: Healing Log

Reverse-chronological feed of all auto-corrections. Filterable by subsystem, brand, outcome, date range.

Each log entry shows: timestamp, brand, what happened (plain English root cause — not just the error code), healing steps taken in sequence, outcome badge, and override options.

**Expanded view** reveals the full diff — exactly what changed between pre-heal and post-heal state. For brand token corrections: the specific hex replacements. For credit refunds: the ledger entries created. For duplicate Klaviyo push: which draft ID was deleted.

**"Reverse this heal"** appears only when the reversal is safe (the healed state has not propagated downstream). Once an email is deployed to Klaviyo, the heal cannot be reversed from this panel.

---

### Tab 2: Quarantine Queue

Items the system could not auto-heal without human judgment. Nothing in quarantine proceeds until Nir acts.

Each quarantine entry specifies:
- **What happened** — root cause, not just the error
- **What is blocked** — downstream impact (e.g. "Deploy to Klaviyo halted. 1,000 credits reserved but not charged.")
- **Recommended healing action** — the system's best suggestion with estimated outcome
- **Alternative actions** — including override options with explicit risk labels

**Override requiring confirmation:** Any action that bypasses a safety check (e.g. "Deploy anyway — override spam check") requires a mandatory reason input. The reason is stored in the audit log and associated with the downstream campaign. If that campaign later shows elevated bounce or complaint rates, the override reason surfaces alongside the performance data.

---

### Tab 3: System Integrity

One card per subsystem. Green / yellow / red status. Each card shows:
- Last successful operation
- Success rate over 7 days
- Current queue depth or sync state
- Any active degradation with trend data

Degraded subsystems expand automatically to show full detail, trend chart, what healing was taken, and what decision is pending.

**Override Frequency Dashboard** (bottom of tab):

Surfaces patterns in Nir's override behavior. If the same healing type is overridden repeatedly in the same direction, the system recommends updating the healing rule rather than requiring the same manual override every time.

---

### Override Governance

Every override Nir makes is a learning signal:

```typescript
export interface HealingOverride {
  id: string;
  log_id: string;
  override_type: 'reverse' | 'substitute' | 'approve_as_is' | 'escalate';
  original_healing_action: string;
  override_action: string;
  reason: string;                    // required
  outcome_check_scheduled_at: Date;  // 48h after override
  outcome: 'positive' | 'negative' | 'neutral' | null;
  created_at: Date;
}
```

48 hours after any override, the outcome tracker fires. Positive outcomes update the healing rule to prefer that approach. Negative outcomes are logged as negative signal and Nir is notified. The system gets smarter with each cycle.

---

### Database Schema

```typescript
export const healingLog = pgTable('healing_log', {
  id:                     uuid('id').defaultRandom().primaryKey(),
  brand_id:               uuid('brand_id').references(() => brands.id),
  subsystem:              text('subsystem').notNull(),
  failure_type:           text('failure_type').notNull(),
  failure_detail:         jsonb('failure_detail').notNull(),
  healing_mode:           text('healing_mode').notNull(),   // 'reactive' | 'proactive'
  healing_steps:          jsonb('healing_steps').notNull(),
  healing_outcome:        text('healing_outcome').notNull(),
  diff:                   jsonb('diff'),
  is_reversible:          boolean('is_reversible').default(true),
  reversed_at:            timestamp('reversed_at'),
  quarantine_resolved_at: timestamp('quarantine_resolved_at'),
  created_at:             timestamp('created_at').defaultNow().notNull(),
});

export const healingOverrides = pgTable('healing_overrides', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  healing_log_id:      uuid('healing_log_id').references(() => healingLog.id).notNull(),
  override_type:       text('override_type').notNull(),
  original_action:     text('original_action').notNull(),
  override_action:     text('override_action').notNull(),
  reason:              text('reason').notNull(),
  outcome:             text('outcome'),
  outcome_notes:       text('outcome_notes'),
  outcome_checked_at:  timestamp('outcome_checked_at'),
  created_at:          timestamp('created_at').defaultNow().notNull(),
});

export const systemIntegritySnapshots = pgTable('system_integrity_snapshots', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  snapshot_at:         timestamp('snapshot_at').defaultNow().notNull(),
  subsystem_states:    jsonb('subsystem_states').notNull(),
  active_quarantines:  integer('active_quarantines').default(0),
  healing_count_24h:   integer('healing_count_24h').default(0),
  override_count_24h:  integer('override_count_24h').default(0),
});
```

### Environment Variables

```bash
HEALING_CREDIT_RESERVATION_TIMEOUT_HOURS=24
HEALING_BRAND_TOKEN_DRIFT_THRESHOLD=5
HEALING_OAUTH_REFRESH_MAX_ATTEMPTS=3
HEALING_GENERATION_MAX_RETRIES=3
HEALING_SMS_CONSENT_THRESHOLD=0.05
HEALING_INTEGRITY_SNAPSHOT_CRON="*/15 * * * *"
HEALING_OVERRIDE_OUTCOME_DELAY_HOURS=48
```

---

## 20L. Complete Frontend Page Inventory

Every page across the full VIYO frontend surface — merchant app, public marketing site, and admin portal. 39 pages total.

---

### Architecture Overview

```
apps/web          — Merchant frontend (Next.js App Router)
                    Public marketing routes + authenticated app routes
                    Middleware splits traffic: unauthenticated → marketing
                    Authenticated → app shell

apps/admin        — Admin portal (separate Next.js app)
                    Password-gated, Nir-only
                    Never exposed to brand users
```

Marketing pages and app pages live in the same `apps/web` repo but under separate layout trees:
- `app/(marketing)/` — public pages, no auth, marketing nav + footer
- `app/(app)/` — authenticated pages, app shell nav, token balance header
- `app/(auth)/` — auth pages, minimal layout

---

### Section A: Public Marketing Pages

Auth requirement: none. All SSG (static site generation) unless noted.

---

#### A1. `/` — Landing Page

**Purpose:** Convert first-time visitors into free trial sign-ups. The single highest-leverage page in the product.

**Conversion goal:** Click "Start free" → `/signup`

**Sections:**
1. Hero — headline, subhead, single CTA ("Generate your first email free"), demo video or animated email build (autoplay, muted, 60s)
2. Social proof bar — brand logos or "X campaigns generated this week" live counter
3. The problem — 3 pain cards: designers are expensive, agencies are slow, DIY is inconsistent
4. How it works — 5-step visual flow: brief → brand read → 7 brains → review → deploy
5. Email example — before (blank brief) / after (complete email), toggle between them
6. Feature highlights — Brain system, Brand Asset Vault, NanoBanana, Klaviyo deploy, A/B testing, Monthly calendar
7. Integrations row — Shopify + Klaviyo logos, "works inside the tools you already use"
8. Testimonials — 3 cards, brand name, quote, result metric
9. Pricing teaser — subscription tiers ($49 / $99 / $249), "500K free tokens to start", links to `/pricing`
10. Bottom CTA — full-width banner, "Generate your first email free. No card required."

**Technical notes:**
- No full nav on mobile hero — just logo + "Sign in" link
- CTA button repeated at hero, mid-page, and bottom
- Demo video hosted on Cloudflare Stream or Mux, not YouTube embed (no exit paths)
- OG image: `/og-default.png` (1200×630)

---

#### A2. `/what-is-viyo` — Product Explainer

**Purpose:** Convert visitors who understand email marketing but don't yet understand the product. Answers "what exactly does this do?"

**Conversion goal:** Click "Start free" or "See pricing"

**Sections:**
1. Hero — "Your entire email creative team, automated." + short demo video
2. What VIYO replaces — comparison table: email designer / copywriter / photographer / strategist / agency retainer → VIYO equivalent
3. The two brains — Top Brain (500+ brands learned) and Personal Brain (your brand's own intelligence), explained simply
4. The 7 specialists — CMO Brain, Audience Brain, Offer Brain, Copywriter Brain, Image Design Brain, Email Design Brain, VeriClaw — one-line description each
5. Full user journey — 12 steps from "what email do you want?" to "live in Klaviyo", visual step cards
6. Built for — Shopify, Klaviyo, fashion / beauty / lifestyle
7. CTA

---

#### A3. `/pricing` — Pricing Page

**Purpose:** Convert comparison-stage visitors. Primary CTA is free trial. Secondary CTA is paid plan signup.

**Conversion goal:** "Start free" (500K tokens/month, no card) or "Get Started" for high-intent visitors

**Sections:**
1. Hero — "Pay for what you use. Nothing more." + Monthly / Annually (Save 17%) toggle
2. Token explainer — "What are tokens?" with campaign equivalent: ~50K-150K tokens = 1 email depending on complexity
3. Four pricing tier cards — Free ($0, 500K tokens) / Starter ($49/mo, 3M tokens) / Growth ($99/mo, 10M tokens, MOST POPULAR) / Agency ($249/mo, 30M tokens). Growth card highlighted with navy border and badge. Starter and Growth cards include a token dropdown selector to scale token volume without changing feature tier.
4. Feature gating — Each card lists included features AND locked features (crossed out). Key gating: Automated Flows, VIYO Max, and A/B Testing are locked on Free and Starter; unlocked on Growth and Agency.
5. Token add-on section — "Need more tokens mid-cycle? Add-on tokens roll over and never expire."
6. Trust row — "All plans include: Shopify crawl · Klaviyo export · Hosted assets · No contracts · Cancel anytime"
7. Pricing FAQ accordion — 6 questions: plan changes, token exhaustion, add-on rollover, Starter vs Growth difference, flow processing availability, free trial
8. Bottom CTA

**Key design decisions:**
- Show email equivalents under token counts (e.g., "~80-100 emails/month" under 10M tokens) — raw token numbers mean nothing, email equivalents land
- "Start Free" CTA is primary (large, colored button). "Get Started" is the paid-tier CTA. Growth card is visually highlighted as MOST POPULAR.
- Token dropdown selector on Starter and Growth cards allows users to scale token volume without changing feature tier (mirrors Manus credit selector pattern)
- Feature gating is visually clear: locked features shown as crossed-out text on lower tiers
- Feature comparison table below the pack cards showing exactly which features are available per tier

---

#### A4. `/about` — About Page

**Purpose:** Build trust with founders who want to know who is building the tool they are handing their brand voice to.

**Conversion goal:** Secondary — "Try VIYO free" CTA at bottom

**Sections:**
1. Origin story — 3 paragraphs, first person, specific and honest. Why Nir built this.
2. Mission — one sentence, specific. Not "democratizing AI."
3. Team — if solo, own it. If team, names, roles, one-line each
4. Why email — short paragraph on email as the highest-ROI ecommerce channel
5. Numbers (when real) — brands using VIYO, campaigns generated, revenue driven
6. Investors / backers (if applicable)
7. Press (if applicable)
8. CTA

---

#### A5. `/contact` — Contact Us

**Purpose:** Route incoming requests efficiently. Triage at the form level, not the inbox.

**Four contact paths (cards, not a generic form):**

| Path | Destination |
|---|---|
| Need help with VIYO? | Support ticket form with category, brand name, screenshot upload |
| Want to talk to sales? | Calendly embed — 30-min demo call |
| Partnership or integration? | Partnership form (name, company, what you're proposing) |
| Press or media? | Press email + media kit PDF download |

Response time expectation set per path. Support: 4 hours business hours. Sales: same day. Partnership: 48 hours.

---

#### A6. `/integrations` — Integrations Overview

**Purpose:** Reassure technical buyers and Shopify/Klaviyo ecosystem visitors. Also an SEO surface for "Klaviyo AI" and "Shopify email" searches.

**Sections:**
1. Hero — "Works inside the tools you already use."
2. Primary integrations — Shopify and Klaviyo as large feature cards with sub-page links
3. What VIYO reads from Klaviyo — campaigns, flows, segments, customer profiles
4. What VIYO writes to Klaviyo — campaign drafts, A/B tests, segments, flow additions
5. What VIYO reads from Shopify — product catalog, images, prices, inventory, webhooks
6. Security — OAuth 2.0 scoped permissions, disconnect at any time, data never sold
7. Infrastructure row — Supabase, Stripe, Resend, Gemini, Inngest (builds trust)

---

#### A7. `/integrations/klaviyo` — Klaviyo Integration Detail

**Purpose:** Deep-dive for Klaviyo users. SEO target: "AI email generator Klaviyo", "Klaviyo AI automation"

**Sections:**
1. What VIYO does in Klaviyo (reads and writes in detail)
2. Step-by-step connection guide (3 steps with screenshots)
3. Klaviyo-specific FAQ (5 questions)
4. Troubleshooting common connection issues
5. CTA

---

#### A8. `/integrations/shopify` — Shopify Integration Detail

**Purpose:** Deep-dive for Shopify merchants. SEO target: "Shopify email marketing AI", "Shopify Klaviyo automation"

**Sections:**
1. What VIYO reads from Shopify and why
2. Brand Asset Vault — how product images are ingested and enhanced
3. Step-by-step connection guide
4. Shopify-specific FAQ
5. CTA

---

#### A9. `/case-studies` — Case Studies Index

**Purpose:** Social proof for consideration-stage visitors. Grid of brand outcomes.

**Layout:** Filterable card grid. Filters: vertical (fashion, beauty, lifestyle), use case (flows, campaigns, full replacement), result type (revenue, time saved).

Each card: brand logo, headline ("How [Brand] replaced their email agency with VIYO"), vertical badge, 2 key metrics, "Read case study →"

**CMS:** Sanity. Schema defined once, Nir publishes without code deploys.

---

#### A10. `/case-studies/[slug]` — Individual Case Study

**Purpose:** Deep proof for high-intent visitors. One real case study converts better than ten feature descriptions.

**Structure per case study:**
1. Header — brand name, vertical, time period
2. The brand — 2 sentences, what they sell, who they sell to
3. The challenge — what they were doing before VIYO, what was broken or expensive, specific prior costs if available
4. What they used VIYO for — which features, which flows, how many campaigns, setup process
5. Results — 3-5 metrics in large type (revenue from email, time per campaign before/after, campaigns shipped, ROAS if available)
6. Quote — from brand owner, specific ("The abandoned cart flow alone paid for six months of VIYO")
7. Email examples — 2-3 actual generated emails, shown inline
8. CTA

**CMS:** Sanity.

---

#### A11. `/faq` — FAQ

**Purpose:** Pre-empt objections and reduce support burden. Searchable.

**Technical:** Client-side search with Fuse.js. Each answer links to the relevant Help Center article for anything requiring more depth.

**Categories:**

*Getting Started* — Do I need design skills? How long does setup take? What do I connect first?

*Generation* — How long does generation take? What if I don't like the output? Can I edit after generation? Does VIYO write subject lines?

*Credits and Pricing* — What is a credit? Do credits expire? What happens if I run out mid-generation? Can I get a refund?

*Integration* — Does VIYO publish directly to Klaviyo? Which Klaviyo features? What Shopify data is accessed? Shopify Plus support?

*Data and Privacy* — Is my brand data used to train other brands? Who owns the emails VIYO generates? GDPR compliance?

Maximum 4 sentences per answer. FAQ is not the Help Center — it answers questions, it does not teach people how to use the product.

---

#### A12. `/blog` — Blog Index

**Purpose:** SEO compound asset. Content marketing for long-tail keyword capture.

**CMS:** Sanity. Category taxonomy defined in schema.

**Layout:** Featured post (full-width card) + grid of recent posts. Filter by category. Search.

**Content pillars and target keywords:**

| Pillar | Target keyword example |
|---|---|
| Klaviyo strategy | "klaviyo abandoned cart flow setup" |
| Fashion email | "best fashion brand email examples" |
| AI in email | "AI email marketing ecommerce" |
| Benchmarks | "email marketing benchmarks ecommerce 2026" |
| VIYO product | "VIYO updates" (brand search) |

One post minimum per week at launch. Quality over frequency — one 2,000-word definitive guide beats five 400-word shallow posts.

---

#### A13. `/blog/[slug]` — Blog Post

**Structure:** H1 targeting primary keyword, table of contents on long posts, body content with inline email examples or screenshots, mid-article CTA block ("Want VIYO to generate this for your brand?"), bottom CTA, related posts.

Every post is SSG with `revalidate: 3600` (re-generated hourly to pick up Sanity edits without full rebuild).

---

#### A14. `/lp/[variant]` — Sales Landing Pages

**Purpose:** Paid traffic conversion. Each ad campaign lands on a variant tuned to its audience and angle.

**URL structure:**
```
/lp/fashion-brands
/lp/replace-your-agency
/lp/klaviyo-users
/lp/shopify-stores
/lp/beauty-brands
```

**Variant system:**

```typescript
interface LandingPageVariant {
  heroHeadline: string;
  heroSubhead: string;
  painPoint: string;
  primaryFeatures: string[];   // 3 features most relevant to this audience
  testimonialId: string;
  ctaText: string;
}

const variants: Record<string, LandingPageVariant> = {
  'fashion-brands': {
    heroHeadline: "The email engine built for fashion brands.",
    heroSubhead: "Brief to live Klaviyo campaign in 10 minutes. No designer needed.",
    ctaText: "Generate your first email free",
  },
  'replace-your-agency': {
    heroHeadline: "Replace your email agency for $79/month.",
    heroSubhead: "VIYO generates campaigns, flows, A/B tests, and images. Your agency charges $3,000.",
    ctaText: "Start free — no card required",
  },
  'klaviyo-users': {
    heroHeadline: "Klaviyo users generate emails 10x faster with VIYO.",
    heroSubhead: "Connect your Klaviyo. VIYO reads your flows, learns your brand, deploys directly.",
    ctaText: "Connect Klaviyo free",
  },
};
```

**Landing page rules:**
- No full nav — logo and "Sign in" link only
- Single CTA repeated at hero, mid-page, and bottom
- No outbound links that do not convert (no blog links, no feature comparison links mid-page)
- Hero loads under 2 seconds — no heavy video autoplay
- `noindex` — prevent duplicate content penalty from parameterized variants

---

#### A15. `/privacy` — Privacy Policy

**Format:** MDX file in repo rendered with `next-mdx-remote`. Legal copy changes rarely — no CMS needed.

**VIYO-specific sections beyond the standard template:**
- AI training disclosure — brand-specific performance data feeds only that brand's Personal Brain, never used to train global Top Brain patterns. State this explicitly.
- Third-party data flows — Shopify OAuth, Klaviyo OAuth: what is read, what is written, what is stored
- Generated content ownership — emails VIYO generates belong to the brand
- Credit and billing data — Stripe handles payment data, VIYO stores only the credit ledger
- Sub-processor list — Supabase, Stripe, Resend, Google (Gemini), Inngest, Sanity

`noindex` — search engines do not need to index legal pages.

---

#### A16. `/terms` — Terms & Conditions

**Format:** MDX file in repo.

**VIYO-specific sections:**
- Credit system terms — credits are non-refundable once used, trial credits expire in 30 days, purchased credits do not expire
- Acceptable use — no spam, no phishing, brand must own the Klaviyo account they connect
- AI-generated content — VIYO makes no guarantee of email performance, brand is responsible for CAN-SPAM and GDPR compliance in their sends
- Account termination — what happens to brand data and unused credits on cancellation

`noindex`.

---

### Section B: Auth Pages

Layout: minimal. No marketing nav or footer — just the VIYO logo. Focus is the action.

---

#### B1. `/login` — Login

Fields: email, password. Secondary: "Continue with magic link" (sends email, no password required). Link to `/signup`. "Forgot password?" flow.

After login → redirect to `/auth/mfa-challenge` (if MFA configured) or `/auth/mfa-setup` (if MFA not yet configured). After MFA verification → redirect to `/dashboard` (or to the page the user was trying to reach, stored in session).

---

#### B2. `/signup` — Create Account

Fields: email, password (or magic link option). After account created → `/auth/mfa-setup` → `/onboarding`.

If user arrived from the landing page input box ("What email do you want to create?"), their idea is stored in `sessionStorage` and pre-filled after auth. Do not lose the user's intent across the auth gate.

---

#### B3. `/auth/callback` — OAuth + Magic Link Handler

No visible UI. Handles:
- Magic link token exchange — validates token, sets session cookie, redirects to `/auth/mfa-setup` (if MFA not configured), `/auth/mfa-challenge` (if MFA configured), or `/onboarding`
- **Invite magic link exchange** — same as above, but after session creation, checks `sessionStorage` for a pending invite token. If found, redirects to `/invite/accept` instead of `/dashboard`
- Shopify OAuth callback — exchanges code for access token, stores in `brand_integrations`, redirects to `/settings/integrations` with success toast
- Klaviyo OAuth callback — same pattern

Error states: expired token → redirect to `/login` with error message. Invalid state param → same.

---

#### B3a. `/auth/invite/[token]` — Reusable Invite Link Handler

No visible UI (redirect-only route). When accessed:
1. Looks up the invite token in the `invitations` table
2. If valid and pending → stores the token in `sessionStorage`, calls backend to generate a fresh magic link, redirects user to the magic link URL
3. If expired → shows "This invite has expired. Please ask your team admin to send a new invitation."
4. If revoked → shows "This invite has been revoked."
5. If already accepted → shows "This invite has already been used." with a link to `/login`
6. Rate limited to 5 magic link generations per hour per token

---

#### B3b. `/invite/accept` — Invite Acceptance Page

Shown after the user authenticates via an invite magic link. Displays:
- Brand name and logo (if available)
- The role they've been assigned (Admin or Member)
- "Join {Brand Name}" button
- If user has no password set: inline password creation form (password + confirm) before the join button

On confirmation: creates `brand_members` row, updates invitation status to `accepted`, sets `accepted_at`, redirects to `/auth/mfa-setup` (if MFA not yet configured) or `/dashboard` with success toast "Welcome to {Brand Name}!".

---

#### B4. `/auth/mfa-setup` — Mandatory MFA Setup Gate

Blocking full-screen page. The user cannot navigate away, access the dashboard, or use any API endpoint until MFA is configured. This gate is shown to every user who has not yet set up MFA — whether they arrived via signup, login, or invite acceptance.

**Copy:** "To protect your brand's data, VIYO requires two-factor authentication for all accounts."

**Method Selection (3 options, presented as cards with security ratings):**

| Method | Security Rating | User-Facing Copy | Implementation |
|--------|-----------------|------------------|----------------|
| Authenticator App (TOTP) | Most Secure | "Recommended. Use Google Authenticator, Authy, or 1Password." | Supabase Auth TOTP. QR code + manual secret key. |
| SMS Text Message | Good | "Convenient, but vulnerable to SIM-swapping. Standard rates apply." | Twilio Verify API. Phone number input + 6-digit code. |
| Email Code | Acceptable | "Only use if you cannot use an app or phone." | Supabase Auth OTP via email. |

**Flow:** User selects a method, completes verification (scan QR / enter SMS code / enter email code), system displays 10 single-use Recovery Codes. User must click "I have saved my recovery codes" to proceed. Redirects to `/onboarding` (new user) or `/dashboard` (existing user).

**Recovery Codes:** Stored hashed (bcrypt) in the database. If a user loses their device, they enter a recovery code on `/auth/mfa-challenge` to regain access, then are immediately prompted to set up a new MFA method.

---

#### B5. `/auth/mfa-challenge` — MFA Verification

Shown on every login after the user has MFA configured. Centered card with a 6-digit code input field (auto-focus, auto-submit on 6th digit). Below the input: "Use a recovery code" link for users who have lost their device.

---

### Section C: Onboarding Pages

Shown once, on first login (after MFA setup). After completion, user lands in `/dashboard`. Progress indicator shown across all onboarding steps.

---

#### C1. `/onboarding` — Brand Setup

Fields: brand name, vertical (dropdown: fashion, beauty, lifestyle, accessories, footwear, other), website URL.

Minimal — 3 fields, one screen. This is not the place for a lengthy questionnaire. The Personal Brain builds itself from Shopify and Klaviyo data. The only thing needed here is enough to know who the brand is.

After submit → `/onboarding/connect`

---

#### C2. `/onboarding/connect` — Connect Accounts

Four paths shown as cards:

1. **Connect Shopify** — OAuth flow, opens Shopify auth in same tab
2. **Connect Klaviyo** — OAuth flow
3. **Enter store URL** — for brands without Shopify OAuth (crawl-based ingestion)
4. **Skip for now** — goes directly to dashboard with a persistent banner to connect later

After at least one connection → trigger Brand Asset Vault ingestion job → show progress ("Building your Brand Asset Vault...") → redirect to `/dashboard` when ingestion completes (or after 30s timeout with a "we'll notify you when it's ready" message).

---

### Section D: Main App Pages

All routes require authentication. Unauthenticated requests redirect to `/login` with `?redirect=` param. App shell: top nav with logo, nav links, credit balance badge, notification bell, user avatar.

---

#### D1. `/dashboard` — Campaign Dashboard

**Purpose:** Home base. Shows all campaign sessions with status, and is the launchpad for new campaigns.

**Layout:**

Header row: credit balance badge ("12,400 credits remaining") with "Buy credits" link, "New Campaign" primary CTA button.

Empty state (new user with 0 campaigns): illustrated empty state, short explainer ("Generate your first email — it takes under 10 minutes"), large "Create campaign" CTA.

Campaign list (returning user): filterable table or card grid.

Each campaign card:
```
[Email subject line or "Untitled campaign"]
[Brand]  ·  [Flow type badge]  ·  [Status badge]
Created: Apr 15  ·  Last updated: 2h ago
[Open]  [Duplicate]  [Delete]
```

Status badges: `draft` / `generating` / `review` / `deployed` / `failed`

Insight notifications: if the Smart Insight Engine has produced insights since last login, a blue banner surfaces at the top: "We noticed something — 2 new insights for your brand. [View insights →]"

---

#### D2. `/campaigns/new` — New Campaign Brief

**Purpose:** Capture the user's intent and enough context to brief the CMO Brain.

**Fields:**
1. "What email do you want to create?" — free text, large input, this is the primary field
2. Email type — campaign / flow email (toggle)
3. Flow type — if flow selected: dropdown (welcome, abandoned cart, post-purchase, etc.)
4. Target segment — dropdown populated from Klaviyo segments (or "All subscribers")
5. Product picker — grid of vault assets, multi-select, AI pre-selects based on brief
6. Offer — optional: toggle on/off, if on: type (% off, free shipping, BOGO) + value
7. Tone override — optional: dropdown (default to brand voice, or override: urgent / editorial / playful / formal)

Credit estimate shown before generate: "This email will use approximately 1,000 credits. You have 12,400 remaining."

"Generate Email →" CTA → POST to generation API → redirect to `/campaigns/:sessionId`

---

#### D3. `/campaigns/:sessionId` — Live Generation

**Purpose:** Show the user that something meaningful is happening. Reduce anxiety during the 30-60 second generation window.

**Layout:**

Center: animated Orb — pulsing, ambient motion. Changes color as brains activate.

Brain status list (left or below Orb):
```
✓  CMO Brain          — Campaign brief complete
✓  Audience Brain     — Segment matched: VIP customers
✓  Offer Brain        — Offer validated: 20% off, safe for this flow
⟳  Copywriter Brain   — Writing subject line and body copy...
○  Image Design Brain — Waiting
○  Email Design Brain — Waiting
○  VeriClaw           — Waiting
```

Each brain completes in sequence. Checkmark on completion. Current brain shows a brief description of what it is doing. Completed brains show their key output (e.g. "Subject line: 'Last chance — your cart is waiting'").

On generation complete → auto-transition to `/campaigns/:sessionId/preview` with a brief success animation.

On generation failure → error state with retry button and reason (e.g. "Spam score too high — we're trying a different approach").

---

#### D4. `/campaigns/:sessionId/preview` — Email Preview

**Purpose:** Review and approve the generated email before deploying to Klaviyo.

**Layout:**

Left panel (controls):
- Subject line (editable inline)
- Preview text (editable inline)
- Sender name (editable inline)
- A/B variants (if generated — tabs for each variant)
- Inline chat ("Ask VIYO to change something" — free text, e.g. "Make the CTA more urgent" or "Change the hero image to the blue jacket")
- Deploy CTA (primary, full-width at bottom)
- "Save draft" (secondary)
- "Regenerate" (tertiary — resets to brief, uses 1,000 credits)

Right panel (email render):
- Sandboxed iframe — full email rendered at email client width (600px)
- Mobile / desktop toggle
- "View raw HTML" toggle
- Dark mode preview toggle

Preflight status bar (top of right panel):
```
✓ Spam score: 2.1  ✓ File size: 48KB  ✓ Unsubscribe link  ✓ All prices accurate
```
If any preflight check fails: red badge with explanation and fix suggestion.

Inline chat responses regenerate only the affected section (subject line, hero, CTA) — not the entire email. Partial regeneration costs are shown before confirming ("This will use 200 credits").

---

#### D5. `/campaigns/:sessionId/deploy` — Post-Deploy Success

**Purpose:** Confirm the deploy succeeded and give the user clear next steps.

**Layout:**

Large success animation (checkmark, brief confetti).

Confirmation block:
```
"Your campaign is live in Klaviyo."

Campaign: "Last chance — your cart is waiting"
Deployed to: Abandoned Cart Flow, Email 3
Klaviyo draft ID: kl_draft_8f3a2c
[View in Klaviyo →]

A/B test: 3 variants, 20% split each
Winner declared by: open rate, 48 hours
```

Secondary actions:
- "Create another campaign" → `/campaigns/new`
- "View all campaigns" → `/dashboard`
- "View insights" → `/insights`

Credits used shown: "1,000 credits used. 11,400 remaining."

---

### Section E: Settings Pages

---

#### E1. `/settings/integrations` — Integration Management

Shows current connection status for Shopify and Klaviyo per brand.

Each integration card:
- Logo + name
- Status badge: `connected` / `disconnected` / `expired`
- Last sync time
- What data is connected (read/write permissions summary)
- Connect / Disconnect / Reconnect button
- If expired: "Re-authorize" CTA with explanation ("Your Klaviyo token expired — click to re-connect")

Brand Asset Vault status panel: total assets ingested, last sync, "Force re-sync" button (admin-grade action, confirmation required).

---

#### E2. `/settings/billing` — Credit Management

**Sections:**

Credit balance: large current balance display, auto-refill toggle (on/off + threshold + pack selector).

Buy credits: four pack cards (same as `/pricing` but compact), "Buy" button on each → Stripe Checkout in new tab, returns to this page with success/failure toast.

Transaction history: table from `credit_ledger`.

```
Date          Description                  Credits
──────────────────────────────────────────────────
Apr 15 14:32  Campaign email generated     -1,000
Apr 15 11:08  Credit reservation refunded  +1,000  (session abandoned)
Apr 14 09:00  Growth pack purchased        +100,000
Apr 01 00:00  Trial credits granted        +5,000
```

Filter by: transaction type, date range. Export to CSV.

---

#### E3. `/settings/account` — Account Settings

**Sections:**

Profile: name, email (read-only if using magic link), avatar upload.

Password: change password form (current password, new password, confirm). Hidden if account uses magic link only.

Brand settings: brand name, vertical, website URL (editable post-onboarding).

Notification preferences: which insight types trigger email digest, weekly digest on/off.

Danger zone:
- "Delete account" — requires typing "DELETE" to confirm. Triggers: cancel active Stripe, revoke Shopify/Klaviyo OAuth, queue data deletion per retention policy. Credits are forfeited on deletion (stated clearly in confirmation dialog).

---

### Section F: System Pages

---

#### F1. `/notifications` — Notification Center

Notification drawer triggered from bell icon in app header. Can also be navigated to directly.

Two tabs:
- **Alerts** — system events: flow published, campaign sent, Klaviyo sync complete, integration error, credit auto-refill triggered
- **Insights** — ranked `BrandInsight` cards from the Smart Insight Engine (Section 20I)

Each notification: icon by type (info / warning / error / success), title, timestamp, "Mark read" on hover, link to relevant page.

"Mark all read" button. Unread count badge on bell icon in header.

---

#### F2. `*` — 404 Page

Not just an error. A light-touch brand moment.

Copy: "This page doesn't exist — but your next campaign does." + "Generate an email →" CTA. Minimal layout. Logo, one line of copy, one button.

---

### Section G: Admin Portal Pages

All routes require `viyo_admin` role. Separate Next.js app at `apps/admin`. Password-gated on first load, sets `httpOnly` session cookie. Never exposed to brand users — separate domain or subdomain.

---

#### G1. `/admin` — Admin Login

Password prompt. No username — single shared admin password stored in environment variable. On success: sets session cookie, redirects to `/admin/dashboard`.

Brute-force protection: 5 failed attempts = 15-minute lockout (in-memory or Redis).

---

#### G2. `/admin/dashboard` — System Health

**Sections:**

Generation queue: active sessions count, avg generation time (last 24h), error rate, list of currently generating sessions with brand name, session ID, elapsed time.

Recent failures: last 10 failed generation sessions, error type, brand, timestamp, link to session detail.

Worker status: Inngest worker health, last heartbeat, queue depths per function.

Quick stats: campaigns generated today / this week / this month, credit transactions today, new brands onboarded this week.

---

#### G3. `/admin/top-brain` — Top Brain Corpus Admin

See Section 20J (Self-Learning Skill Admin) for full spec.

**Summary:** Brand registry (left rail), email library (center feed filterable by brand / type / source / MCS grade), email viewer (right panel with sandboxed iframe + MCS breakdown + pattern tags), patterns tab (`/admin/top-brain/patterns`), ingestion pipeline health panel.

---

#### G4. `/admin/learning` — Self-Learning Skill Admin

See Section 20J for full spec.

**Summary:** Pattern lifecycle management (Detected → Pending → Approved → Active). MCS-weighted pattern corpus. Three tabs: Pending Review (with reason tags: new type / conflicting evidence / Bible conflict), Pattern Library (weight sliders, injected instruction editing, performance metrics), Performance (trending up/down, top performers, never-used list). Manual pattern seeding. Activity log.

---

#### G5. `/admin/healing` — Self-Healing Skill Admin

See Section 20K for full spec.

**Summary:** Healing log (all auto-corrections with diffs and override options), quarantine queue (blocked operations needing Nir's judgment), system integrity dashboard (one card per subsystem, green/yellow/red). Override governance with 48h outcome tracking.

---

#### G6. `/admin/skills` — Skill Registry

**Purpose:** View and edit brain system prompts and MJML recipes without a code deploy.

Brain system prompts list: each brain (CMO, Audience, Offer, Copywriter, Image Design, Email Design, VeriClaw, Critic, SMS Copywriter) with:
- Current system prompt (syntax-highlighted, editable in a code editor — Monaco or CodeMirror)
- Temperature setting (editable)
- Last modified timestamp
- "Test prompt" — runs the brain against a sample brief and shows output
- Save with confirmation ("This changes how VIYO generates emails for all brands immediately")

Composable section management. Each recipe:
- Name and description
- MJML template (editable)
- Which flow types it is approved for
- Preview (renders the MJML to HTML and shows in sandbox iframe)

Changes to system prompts and MJML recipes are versioned — previous versions stored, rollback available.

---

#### G7. `/admin/credits` — Credit Ledger Management

(Updated from `/admin/refunds` — reflects the credit system migration from `billing_usage` to `credit_ledger`.)

**Sections:**

Brand search: search by email or brand name. Returns brand record with current credit balance, plan status, connected integrations, and full `credit_ledger` transaction history.

Manual credit adjustment: form fields: brand, amount (positive = top-up, negative = deduction), reason (required), transaction type (`admin_adjustment`). Creates a ledger entry — does not modify `credit_balance` directly, goes through the ledger.

Ledger view: full `credit_ledger` table, filterable by brand, transaction type, date range. Export to CSV.

Stuck reservations: list of credit reservations older than 24h that haven't committed. One-click force-refund per entry.

---

#### G8. `/admin/users` — User Lookup

**Sections:**

Search: by email address or brand name. Returns:
- User record (name, email, created_at, last_login_at)
- Brand record (name, vertical, website)
- Connection status (Shopify connected Y/N, Klaviyo connected Y/N, last sync)
- Credit balance and recent transactions
- Campaign count and last campaign date
- Any active quarantines from the healing system

Admin actions:
- Force re-sync (Shopify or Klaviyo)
- Reset password / send magic link
- Suspend account (blocks login, does not delete data)
- Impersonate user (view their dashboard as them — requires 2FA confirmation, all actions logged)

Impersonation is the most powerful tool here. It lets Nir debug exactly what a user is seeing without asking them to screen share. Every impersonation session is logged with start time, end time, and any actions taken.

---

### Complete Route Summary

| # | Route | Section | Auth | CMS |
|---|---|---|---|---|
| 1 | `/` | Marketing | None | No |
| 2 | `/what-is-viyo` | Marketing | None | No |
| 3 | `/pricing` | Marketing | None | No |
| 4 | `/about` | Marketing | None | No |
| 5 | `/contact` | Marketing | None | No |
| 6 | `/integrations` | Marketing | None | No |
| 7 | `/integrations/klaviyo` | Marketing | None | No |
| 8 | `/integrations/shopify` | Marketing | None | No |
| 9 | `/case-studies` | Marketing | None | Sanity |
| 10 | `/case-studies/[slug]` | Marketing | None | Sanity |
| 11 | `/faq` | Marketing | None | No |
| 12 | `/blog` | Marketing | None | Sanity |
| 13 | `/blog/[slug]` | Marketing | None | Sanity |
| 14 | `/lp/[variant]` | Marketing | None | No |
| 15 | `/privacy` | Marketing | None | MDX |
| 16 | `/terms` | Marketing | None | MDX |
| 17 | `/login` | Auth | None | No |
| 18 | `/signup` | Auth | None | No |
| 19 | `/auth/callback` | Auth | None | No |
| 20 | `/onboarding` | Onboarding | Required | No |
| 21 | `/onboarding/connect` | Onboarding | Required | No |
| 22 | `/dashboard` | App | Required | No |
| 23 | `/campaigns/new` | App | Required | No |
| 24 | `/campaigns/:sessionId` | App | Required | No |
| 25 | `/campaigns/:sessionId/preview` | App | Required | No |
| 26 | `/campaigns/:sessionId/deploy` | App | Required | No |
| 27 | `/settings/integrations` | Settings | Required | No |
| 28 | `/settings/billing` | Settings | Required | No |
| 29 | `/settings/account` | Settings | Required | No |
| 30 | `/notifications` | System | Required | No |
| 31 | `*` | System | None | No |
| 32 | `/admin` | Admin | Admin | No |
| 33 | `/admin/dashboard` | Admin | Admin | No |
| 34 | `/admin/top-brain` | Admin | Admin | No |
| 35 | `/admin/learning` | Admin | Admin | No |
| 36 | `/admin/healing` | Admin | Admin | No |
| 37 | `/admin/skills` | Admin | Admin | No |
| 38 | `/admin/credits` | Admin | Admin | No |
| 39 | `/admin/users` | Admin | Admin | No |

**39 pages total.**
- 16 public marketing pages
- 3 auth pages
- 2 onboarding pages
- 5 main app pages
- 3 settings pages
- 2 system pages
- 8 admin portal pages

---

### Build Priority

| Tier | Pages | Gate |
|---|---|---|
| 1 — Pre-launch | `/login`, `/signup`, `/auth/callback`, `/onboarding`, `/onboarding/connect`, `/dashboard`, `/campaigns/new`, `/campaigns/:sessionId`, `/campaigns/:sessionId/preview`, `/campaigns/:sessionId/deploy`, `/settings/integrations`, `/settings/billing`, `/settings/account`, `/notifications`, `/privacy`, `/terms`, `/`, `/pricing`, `*` | Nothing ships without these |
| 2 — Launch week | `/what-is-viyo`, `/faq`, `/integrations`, `/integrations/klaviyo`, `/integrations/shopify`, `/contact`, All admin pages | Operational from day 1 |
| 3 — Month 1 | `/about`, `/case-studies`, `/case-studies/[slug]`, `/lp/[variant]` | Need real data and customers |
| 4 — Scale phase | `/blog`, `/blog/[slug]` | SEO compounds over 6-12 months |

---

## 20M. Competitive Intelligence Engine

### Overview

VIYO's Competitive Intelligence Engine continuously monitors competitor brands across five signal sources, detects meaningful changes, and synthesizes them into strategic suggestions — not observations. The distinction is critical: "Gymshark launched a 20% sale" is monitoring. "Gymshark's sale frequency has doubled in 90 days — their brand is drifting toward value — your window to own premium positioning is opening — here's the campaign" is intelligence.

Every suggestion is contextual. VIYO knows the user's brand, products, current campaigns, and positioning. The competitor signal is only half the input. The brand's own context is the other half.

Route: `/competitive` (merchant) + `/settings/competitors` (settings)

---

### Five Signal Sources

| Source | Method | Crawl Frequency | What Triggers a Signal |
|---|---|---|---|
| Competitor websites | Firecrawl — structured extraction of hero headline, active promos, featured products, prices | Homepage every 4h, full site weekly | Headline change, sale language appearing/disappearing, new product URLs, price changes |
| Competitor emails | Learning inboxes (`learn+brandslug@viyo.new`) already in Top Brain pipeline | Real-time (emails arrive naturally) | Cadence spike (3+ emails in 48h), new offer type, new flow step detected |
| Meta Ad Library | Firecrawl scraping `facebook.com/ads/library` — public, no auth required | Daily | New creative launched, ad running 30+ days (confirmed winner), volume spike (10+ new ads in a week) |
| Social content | Apify actors for Instagram and TikTok — post frequency, product focus, format mix | Daily | Posting frequency spike, new product heavily featured, UGC/collab content increase |
| Cross-competitor patterns | Synthesis job after each daily crawl cycle — looks across ALL tracked competitors simultaneously | After each crawl cycle | 3+ competitors running sales in same 7-day window, category-wide trend emerging |

Cross-competitor patterns are more strategically significant than any single competitor's move. They reveal category-level dynamics — "3 of your 5 tracked competitors launched loyalty programs in the last 60 days" is a category trend, not a coincidence.

---

### Competitor Definition System

Three ways competitors enter the tracking list:

1. **User-defined** — explicit add via `/settings/competitors`. User controls scope: website / email / ads / social / all.
2. **AI-suggested** — after Shopify connects, VIYO analyzes the brand's product catalog and suggests 5-10 competitors from the Top Brain's 500+ tracked brands. User approves or dismisses.
3. **Top Brain implicit** — brands already in the Top Brain matching the same vertical feed industry-level signals automatically, labeled as "industry signals" rather than "competitor signals."

```typescript
export const competitorBrands = pgTable('competitor_brands', {
  id:               uuid('id').defaultRandom().primaryKey(),
  brand_id:         uuid('brand_id').references(() => brands.id).notNull(),
  competitor_name:  text('competitor_name').notNull(),
  competitor_url:   text('competitor_url').notNull(),
  monitoring_scope: text('monitoring_scope').array().notNull(), // ['website', 'email', 'ads', 'social']
  added_by:         text('added_by').notNull(),                 // 'user' | 'ai_suggested' | 'top_brain'
  is_active:        boolean('is_active').default(true),
  last_crawled_at:  timestamp('last_crawled_at'),
  created_at:       timestamp('created_at').defaultNow(),
});
```

---

### Diff Engine (Change Detection)

Every crawl produces a snapshot. The diff engine compares current against previous to detect what changed.

```typescript
export interface CompetitorSnapshot {
  competitor_id:  string;
  source:         'website' | 'email' | 'ads' | 'social';
  url:            string;
  captured_at:    Date;
  content: {
    hero_headline?:      string;
    active_promotions?:  string[];
    featured_products?:  string[];
    price_points?:       Record<string, number>;
    email_count_7d?:     number;
    ad_count_active?:    number;
    post_count_7d?:      number;
  };
  raw_hash: string;  // SHA-256 of content — fast equality check
}

export async function detectChanges(
  current: CompetitorSnapshot,
  previous: CompetitorSnapshot,
): Promise<CompetitorSignal[]> {
  const signals: CompetitorSignal[] = [];

  if (current.content.hero_headline !== previous.content.hero_headline) {
    signals.push({ signal_type: 'messaging_change', urgency: 'low',
      description: `Hero headline changed: "${previous.content.hero_headline}" → "${current.content.hero_headline}"` });
  }

  const newPromos = current.content.active_promotions?.filter(
    p => !previous.content.active_promotions?.includes(p)
  ) ?? [];
  if (newPromos.length > 0) {
    signals.push({ signal_type: 'promotion_launched', urgency: 'high',
      description: `New promotion: ${newPromos.join(', ')}` });
  }

  if (current.content.email_count_7d && previous.content.email_count_7d &&
      current.content.email_count_7d > previous.content.email_count_7d * 1.5) {
    signals.push({ signal_type: 'cadence_spike', urgency: 'medium',
      description: `Email cadence: ${previous.content.email_count_7d} → ${current.content.email_count_7d} emails/7d` });
  }

  return signals;
}
```

---

### Strategic Analysis Layer

Raw signals feed a strategic synthesis step using Claude Sonnet at temperature 0.3 — low enough to be disciplined, high enough to generate genuine strategic options rather than templates.

The analysis prompt injects full brand context (products, current pricing position, active campaigns, recent themes) alongside the competitor signal and 90-day competitor history. Output: 2-3 named strategic options, each with logic, specific action, time-sensitivity rating, and a `brief_payload` ready to pre-fill the `/campaigns/new` form.

**Example output for a competitor sale signal:**

```json
{
  "signal_summary": "Gymshark launched 20% off sitewide — their 4th sale in 90 days, double their prior quarter frequency.",
  "strategic_options": [
    {
      "strategy": "Own the premium counter-position",
      "logic": "Gymshark's increasing sale frequency is eroding their brand equity. This is the window to reinforce that Represent does not go on sale.",
      "action": "Launch a non-sale campaign this week: 'Full price. Full quality.' Hero product: bestseller at full price. No offer. Tone: confident.",
      "time_sensitivity": "This week — while their sale is live and the contrast is sharpest.",
      "brief_payload": { "intent": "Premium positioning counter to competitor sale", "offer": null }
    },
    {
      "strategy": "VIP-only loyalty play",
      "logic": "High-LTV customers may be tempted by the competitor sale. A private VIP offer rewards loyalty without devaluing the brand.",
      "action": "VIP-only email to LTV > $500: early access to new drop or exclusive bundle. Frame as recognition, not discount.",
      "time_sensitivity": "Within 48 hours.",
      "brief_payload": { "intent": "VIP retention", "segment": "high_ltv_customers" }
    }
  ]
}
```

Each option with a `brief_payload` renders a "Generate this campaign →" button in the UI. One click from competitive signal to live email generation.

**Guardrails hardcoded into the analysis prompt:**
- Never suggest comparing to the competitor by name in ad copy (legal risk)
- Never suggest deceptive pricing or false scarcity
- Position by reinforcing brand strength, not attacking competitors
- If competitor signal involves a product recall or controversy: flag as "no action recommended"

---

### Integration with Smart Insight Engine

Competitive suggestions are a 6th insight generator (Section 20I), surfacing as a new `competitive` category in `BrandInsight`. When a high-urgency signal fires, `inngest.send('competitor/signal.detected')` triggers `competitiveInsightGenerator`, which runs the strategic analysis and creates a `BrandInsight` record with `action_type: 'generate_campaign'` and the pre-filled `brief_payload`.

Low-urgency signals batch into the Monday weekly digest rather than triggering immediate insights — preserving the frequency cap and preventing noise.

---

### Competitor History Layer

The analysis layer receives a rolling 90-day `CompetitorTrendSummary` alongside the immediate signal:

```typescript
export interface CompetitorTrendSummary {
  sale_frequency:       number;   // sales in 90 days
  cadence_trend:        'increasing' | 'stable' | 'decreasing';
  messaging_shifts:     string[]; // what changed in hero messaging over time
  ad_volume_trend:      'increasing' | 'stable' | 'decreasing';
  new_product_launches: number;
  dominant_offer_type:  string;
  positioning_summary:  string;   // AI-generated 2-sentence trend summary
}
```

Sustained patterns are more strategic than single events. A single sale is tactical. Four sales in 90 days is a brand strategy signal.

---

### Database Schema

```typescript
export const competitorSnapshots = pgTable('competitor_snapshots', {
  id:            uuid('id').defaultRandom().primaryKey(),
  competitor_id: uuid('competitor_id').references(() => competitorBrands.id).notNull(),
  source:        text('source').notNull(),
  url:           text('url').notNull(),
  content:       jsonb('content').notNull(),
  raw_hash:      text('raw_hash').notNull(),
  captured_at:   timestamp('captured_at').defaultNow().notNull(),
});

export const competitorSignals = pgTable('competitor_signals', {
  id:              uuid('id').defaultRandom().primaryKey(),
  competitor_id:   uuid('competitor_id').references(() => competitorBrands.id).notNull(),
  brand_id:        uuid('brand_id').references(() => brands.id).notNull(),
  signal_type:     text('signal_type').notNull(),
  description:     text('description').notNull(),
  urgency:         text('urgency').notNull(),          // 'high' | 'medium' | 'low'
  snapshot_before: uuid('snapshot_before').references(() => competitorSnapshots.id),
  snapshot_after:  uuid('snapshot_after').references(() => competitorSnapshots.id),
  insight_id:      uuid('insight_id').references(() => brandInsights.id),
  processed_at:    timestamp('processed_at'),
  created_at:      timestamp('created_at').defaultNow().notNull(),
});
```

### Frontend Pages Added

- **Page 40:** `/competitive` — tracked brands left rail, signal feed by urgency, signal history table, strategic option cards with "Generate →" buttons
- **Page 41:** `/settings/competitors` — add/remove competitors, set monitoring scope, approve/dismiss AI-suggested competitors

### Environment Variables

```bash
COMPETITIVE_HOMEPAGE_CRAWL_CRON="0 */4 * * *"     # every 4 hours
COMPETITIVE_FULL_CRAWL_CRON="0 6 * * 1"            # weekly Monday 06:00 UTC
COMPETITIVE_ADS_CRAWL_CRON="0 7 * * *"             # daily
COMPETITIVE_SOCIAL_CRAWL_CRON="0 8 * * *"          # daily
COMPETITIVE_MAX_BRANDS_PER_VIYO_BRAND=10
COMPETITIVE_HISTORY_WINDOW_DAYS=90
COMPETITIVE_SIGNAL_ANALYSIS_MODEL="claude-sonnet-4-5"
COMPETITIVE_SIGNAL_ANALYSIS_TEMPERATURE=0.3
```

---

## 20N. Contextual Help and AI Advisor System

### Overview

Every page in the merchant portal has three simultaneous layers of help:

1. **Passive cues** — the page itself communicates. Placeholder text, microcopy, empty states, button labels. Eliminates questions before they form.
2. **Inline FAQ** — predictable questions answered in context, without leaving the page. Stored in a database, conditionally shown based on user state.
3. **Contextual AI Advisor** — for unpredictable questions and decisions. Knows the current page, the user's brand, and what they are trying to do. Answers strategically, not generically.

Each layer handles a different class of confusion. All three run simultaneously on every app page.

---

### Contextual AI Advisor Architecture

A lightweight brain separate from the email generation system. Claude Haiku — fast, cheap, conversational. Its only job: be a knowledgeable VIYO product guide and email strategist.

```typescript
interface AdvisorContext {
  current_page:    string;
  current_section: string;
  user: {
    brand_name:             string;
    vertical:               string;
    campaigns_generated:    number;
    is_first_session:       boolean;
    klaviyo_connected:      boolean;
    shopify_connected:      boolean;
    credit_balance:         number;
    recent_campaign_themes: string[];
  };
  page_state:  Record<string, unknown>;
  trigger:     'explicit_question' | 'idle_timeout' | 'error_state' | 'proactive_milestone';
  question?:   string;
  error?:      string;
}

const ADVISOR_SYSTEM_PROMPT = `
You are VIYO's in-app guide — a concise, friendly email marketing expert built into the product.
You know VIYO deeply and you know email marketing strategy.

Rules:
- 3 sentences maximum unless the user asks for more detail
- Never use filler phrases ("great question", "certainly", etc.)
- If outside your scope (billing disputes, legal, bugs), say so in one sentence and route them
- Never invent VIYO features that do not exist
- When giving a strategic recommendation, state the reason in one sentence
`;

export async function getAdvisorResponse(context: AdvisorContext): Promise<string> {
  const userMessage = context.question ?? buildProactivePrompt(context);

  const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
    model:      'claude-haiku-4-5',
    max_tokens: 300,
    system:     ADVISOR_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `
<context>
Page: ${context.current_page} / Section: ${context.current_section}
Brand: ${context.user.brand_name} (${context.user.vertical})
Klaviyo connected: ${context.user.klaviyo_connected}
Campaigns generated: ${context.user.campaigns_generated}
Page state: ${JSON.stringify(context.page_state)}
</context>

${userMessage}`,
    }],
  });

  return response.content[0].text;
}

function buildProactivePrompt(context: AdvisorContext): string {
  if (context.trigger === 'idle_timeout')
    return `The user has been on the ${context.current_section} section for 45 seconds without acting. Give one short, specific tip relevant to where they are.`;
  if (context.trigger === 'error_state' && context.error)
    return `The user encountered: "${context.error}". Explain in plain English and give the specific fix.`;
  if (context.trigger === 'proactive_milestone')
    return `The user just completed ${context.current_section}. Give one sentence on what happens next and one tip for better results.`;
}
```

---

### The "Ask VIYO" Persistent Interface

Floating button on every authenticated page — bottom-right, consistent position. Opens a drawer showing:

- Common questions for the current page (pulled from `contextual_faq` table, filtered by user state — not hardcoded)
- Free-text input: "Ask anything about VIYO or email marketing"
- Conversation history within the session (not persisted across sessions)
- Escalation path at the bottom: "Still stuck? [Open a support ticket →]" — pre-populates the ticket with the full conversation so the user never repeats context

Common questions adapt as the user navigates and as their experience level grows. Beginner questions suppress for users with 10+ campaigns. Strategic questions surface instead.

---

### Inline FAQ System

FAQ content is stored in the database — not hardcoded in components. Nir can update without a code deploy.

```typescript
export const contextualFaq = pgTable('contextual_faq', {
  id:               uuid('id').defaultRandom().primaryKey(),
  page_pattern:     text('page_pattern').notNull(),        // '/campaigns/new'
  section:          text('section').notNull(),             // 'segment_picker'
  question:         text('question').notNull(),
  answer:           text('answer').notNull(),              // markdown
  help_article_url: text('help_article_url'),
  show_when:        jsonb('show_when'),                    // { is_new_user, has_klaviyo, flow_type }
  display_order:    integer('display_order').default(0),
  is_active:        boolean('is_active').default(true),
});
```

**Conditional display** — the same page shows different FAQs to different users:

```typescript
function filterFaqsForUser(faqs: ContextualFaq[], user: UserContext): ContextualFaq[] {
  return faqs.filter(faq => {
    const c = faq.show_when;
    if (!c) return true;
    if (c.is_new_user !== undefined && c.is_new_user !== user.is_new_user) return false;
    if (c.has_klaviyo !== undefined && c.has_klaviyo !== user.klaviyo_connected) return false;
    if (c.flow_type && c.flow_type !== user.selected_flow_type) return false;
    return true;
  });
}
```

A new user on `/campaigns/new` without Klaviyo connected sees: "Do I need Klaviyo to generate emails?" A returning user with 10 campaigns sees: "Can I see which campaigns performed best?" Same page. Different questions. Both correct.

---

### Page-by-Page Implementation

**`/onboarding` — Brand Setup**
- Progress bar: "Step 1 of 2 — 2 minutes to your first email"
- Every field has a `why` subtitle in muted text: "Vertical — helps VIYO match your emails to industry patterns"
- Inline FAQ: "Why does VIYO need my website URL?" / "What if I'm in multiple verticals?" / "Can I change this later?"
- Proactive advisor fires at 60s idle: "Your vertical helps VIYO pull the right email patterns — fashion brands email differently than beauty brands. Pick your primary revenue category."

**`/onboarding/connect` — Connect Accounts**
- Each card states exactly what VIYO reads and writes before the user clicks connect
- "Skip for now" with honest consequence stated inline: "VIYO will generate emails, but without Klaviyo data it won't know your audience or send history"
- Vault build progress screen includes advisor narration of what is happening and why

**`/dashboard` — Campaign Dashboard**
- Empty state: illustration, one-line description, primary CTA, 3 before-you-start tips, two secondary links (connect integrations, learn how it works)
- First-time returning user (1-3 campaigns): collapsible onboarding checklist with 5 milestones
- Credit balance badge: tooltip on hover with per-action cost summary and link to full table

**`/campaigns/new` — Brief Form**

This page has the highest FAQ density — it is where users make decisions that determine generation quality.

- Intent field: example placeholder + microcopy: "Write naturally — VIYO extracts the brief, you don't need to follow a format"
- Email type toggle: inline descriptions visible (not hover-only) for every option in the flow type dropdown
- Segment picker: size indicator under each segment ("VIP customers — 3,247 subscribers") + advisor-generated recommendation keyed to the selected flow type
- Offer toggle: advisor response varies by flow type — for win-back: "Yes — 40% lower reactivation without one." For post-purchase: "Generally no — trains customers to wait for post-purchase deals."
- Product picker: each card shows on hover: last featured date, inventory level, category tag
- Credit estimate panel: shows total, breakdown by action, balance before and after, and "What if I don't like the result?" expandable

**`/campaigns/:sessionId` — Live Generation**

- Each brain name has an inline `(?)` icon expanding to a one-line plain-English description
- Progress messages are specific: "Copywriter Brain is testing 5 subject line angles — picking the strongest one..."
- Long wait (>30s): proactive message explaining the delay is intentional quality control
- Error state: specific explanation of what failed, what the system is trying next, with expandable "Why does this matter?"

**`/campaigns/:sessionId/preview` — Email Preview**

- Preflight bar: every result is clickable, expanding to a plain-English explanation plus the specific fix if it failed
- Subject line section: advisor surfaces personalized tip based on brand's historical performance ("Your last 8 campaigns show lines under 45 chars outperform by 22% — this one is 52 chars")
- A/B testing section: explains the exact mechanics (20% split, 48h window, auto-winner to remaining 40%)
- Inline chat (existing generation feature) uses the Advisor brain with full email context — can adjust any section without full regeneration, with credit cost shown before confirming

**`/settings/billing` — Credit Management**

- Persistent credit explainer at top of page (not behind a toggle — always visible): per-action costs with dollar equivalent
- Auto-refill toggle: advisor recommendation based on the brand's generation frequency
- Transaction history: each `transaction_type` has a tooltip explaining what triggered it

---

### Proactive Intervention Triggers

```typescript
const PROACTIVE_TRIGGERS = {
  '/campaigns/new': [
    { condition: s => s.timeOnSection > 45 && !s.hasTypedInIntent,
      section: 'brief_intent', message: null },             // Advisor generates contextually
    { condition: s => s.selectedSegment?.size < 100,
      section: 'segment_picker',
      message: "Fewer than 100 subscribers — A/B test results may be statistically limited. Consider a larger segment or disable A/B for this send." },
  ],
  '/campaigns/:sessionId/preview': [
    { condition: s => s.spamScore > 4.0,
      section: 'preflight', message: null },                // Advisor generates from score + copy
    { condition: s => s.timeOnPage > 300 && !s.hasDeployed,
      section: 'deploy',
      message: "Still reviewing? The inline chat can adjust any part of the email — subject line, copy, images, or CTA." },
  ],
};
```

Proactive messages are rate-limited: maximum one per 90 seconds per page. The system does not nag.

---

### Microcopy Principles

Applied to every label, placeholder, button, error, and loading state across the entire app:

1. **Specific, not generic.** "Your Klaviyo token expired — click to reconnect, takes 30 seconds" not "Something went wrong."
2. **Loading states communicate.** "VeriClaw is checking your email across 47 email clients..." not "Generating..."
3. **Empty states guide.** Every empty state: what this section does, primary action, 2-3 tips.
4. **Errors explain and fix.** What happened, why, and exactly what to do next. Never a code. Never a generic message.
5. **Success messages complete the loop.** "Your campaign is live in Klaviyo. 3,247 VIP subscribers will receive it. Credits used: 1,900." not "Success!"
6. **Buttons say what happens.** "Generate Email (1,000 credits)" not "Submit."
7. **Tooltips earn their place.** Only add a tooltip if removing it would cause confusion.

---

### Shared Components

```tsx
// Floating Ask VIYO button — every app page
<AdvisorButton page={currentPage} section={currentSection} userContext={user} />

// Inline FAQ — placed below any field or section with known questions
<InlineFaq page="/campaigns/new" section="segment_picker" />

// Proactive advisor tip — surfaces on trigger conditions, rate-limited
<AdvisorTip trigger={trigger} context={advisorContext} />

// Contextual tooltip wrapper
<HelpTooltip content="Credits are reserved at generation start and committed on success." />

// Empty state — every list page and first-time view
<EmptyState
  title="Your campaigns will live here"
  description="VIYO turns a brief into a deployed Klaviyo campaign in under 10 minutes."
  action={{ label: "Create your first campaign", href: "/campaigns/new" }}
  tips={["Connect Klaviyo to deploy directly", "Your 5,000 free credits are ready"]}
/>
```

---

### Environment Variables

```bash
ADVISOR_MODEL="claude-haiku-4-5"
ADVISOR_MAX_TOKENS=300
ADVISOR_IDLE_TIMEOUT_SECONDS=45
ADVISOR_PROACTIVE_RATE_LIMIT_SECONDS=90
ADVISOR_CONVERSATION_TTL_MINUTES=30
CONTEXTUAL_FAQ_CACHE_TTL_SECONDS=3600
```

---

## 20O. VIYO Max — Conversational Intelligence

### Overview

VIYO Max is a full conversational AI interface where users ask anything about their account and get grounded answers from their own live data. It is distinct from the contextual advisor (Section 20N), which answers questions about the product. VIYO Max answers questions about the brand's data.

The distinction determines the architecture:

- Advisor: "Win-back emails generally perform better with an offer."
- VIYO Max: "Your last three win-back sends averaged 18.4% open rate — 6pp below benchmark. Two had no offer. The one with 20% off hit 31.2%. Your data says add an offer."

Every claim traces to a real number from a real source. When VIYO Max cannot answer from data, it says so explicitly rather than generalising.

Routes: `/max` (chat interface) · `/max/history` (past conversations)

---

### Architecture: Agentic Tool Calling

Pure RAG is the wrong pattern for live account data — embeddings go stale, Klaviyo metrics change daily, credit balances update per generation. The correct pattern: agentic tool calling. Claude Sonnet has a defined set of tools that query live data. It decides which tools to call, calls them in sequence or parallel, receives results, and synthesises a grounded answer.

```
User message
      ↓
Claude Sonnet — reads message, selects tools
      ↓
Tool calls execute in parallel (Supabase / Klaviyo API / Shopify API)
      ↓
Tool results injected into context
      ↓
Claude synthesises answer with inline source citations
      ↓
Response rendered in chat UI
      ↓
Conversation saved · key learnings extracted to brand memory
```

---

### The Twelve Tools

Each tool maps to a live data source, always scoped to the authenticated brand:

```typescript
export const VIYO_MAX_TOOLS: Tool[] = [
  {
    name: 'get_campaign_performance',
    description: 'Campaign metrics filtered by date range, email type, or session ID. Returns open rate, CTR, revenue per recipient, unsubscribe rate, send volume.',
    input_schema: { type: 'object', properties: {
      date_range: { type: 'object' }, email_type: { type: 'string' },
      session_id: { type: 'string' }, limit: { type: 'number', default: 10 },
      sort_by: { type: 'string', enum: ['open_rate', 'revenue', 'ctr', 'sent_at'] },
    }},
  },
  {
    name: 'get_flow_health',
    description: 'Active Klaviyo flow status and performance: flow type, step count, avg open rate per step, revenue per recipient, last 30-day stats.',
    input_schema: { type: 'object', properties: { flow_type: { type: 'string' } } },
  },
  {
    name: 'get_segment_stats',
    description: 'Klaviyo segment sizes, growth rate, engagement breakdown, last campaign performance.',
    input_schema: { type: 'object', properties: { segment_id: { type: 'string' } } },
  },
  {
    name: 'get_subscriber_overview',
    description: 'Overall list health: total subscribers, 30d growth, engagement tiers, unsubscribe rate trend.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_credit_summary',
    description: 'Current credit balance, weekly burn rate, estimated runway, recent transactions.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_product_performance',
    description: 'Which Brand Asset Vault products appear most in campaigns and correlate with high CTR or revenue.',
    input_schema: { type: 'object', properties: { category: { type: 'string' }, limit: { type: 'number' } } },
  },
  {
    name: 'get_brand_insights',
    description: 'Pending and recent Smart Insight Engine insights: performance, flow gaps, learnings, opportunities, competitive.',
    input_schema: { type: 'object', properties: {
      category: { type: 'string', enum: ['performance','recommendation','learning','opportunity','competitive','all'] },
      status: { type: 'string', enum: ['pending','acted','dismissed','all'] },
    }},
  },
  {
    name: 'get_winning_formulas',
    description: 'Patterns proven effective for this brand: subject line patterns, send times, offer types, layout preferences.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_competitor_signals',
    description: 'Recent competitive intelligence signals for tracked competitors.',
    input_schema: { type: 'object', properties: {
      days: { type: 'number', default: 7 },
      urgency: { type: 'string', enum: ['high','medium','low','all'] },
    }},
  },
  {
    name: 'calculate_aggregate',
    description: 'Aggregate metrics: avg open rate, total email revenue, best send day/hour, open rate trend over period.',
    input_schema: { type: 'object', properties: {
      metric: { type: 'string', enum: ['avg_open_rate','avg_ctr','total_revenue','best_send_day','best_send_hour','open_rate_trend'] },
      date_range: { type: 'object' }, filter: { type: 'object' },
    }, required: ['metric'] },
  },
  {
    name: 'get_flow_gap_analysis',
    description: "Brand's active flows vs. full recommended set for their vertical. Returns missing flows with estimated revenue impact.",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_conversation_memory',
    description: 'Relevant context from previous VIYO Max conversations with this brand.',
    input_schema: { type: 'object', properties: { topic: { type: 'string' } } },
  },
];
```

---

### Grounding System

Three mechanisms prevent hallucination:

**1. OMIT DON'T INVENT in system prompt**

```typescript
const VIYO_MAX_SYSTEM_PROMPT = `
You are VIYO Max — a conversational AI analyst with direct access to this brand's
email marketing data, Klaviyo metrics, and VIYO account.

GROUNDING RULES — non-negotiable:
- Every performance number must come from a tool result in this conversation
- If you do not have the data, say so and tell the user what would get it
- Never estimate or extrapolate presented as brand-specific fact
- Cite source inline for every number: "Your abandoned cart flow (Klaviyo · 30d)..."
- If two sources conflict, surface the conflict rather than silently picking one
- Distinguish "your data shows" from "best practice suggests"
`;
```

**2. Inline citation pills** — every statistic renders as a small tappable pill showing source and freshness. Clicking expands to show the raw data returned by the tool call.

**3. Confidence declarations** — when synthesising across small samples, Max states it explicitly: "Based on your last 6 campaigns (small sample — treat as directional, not conclusive)..."

---

### Agentic Loop Implementation

```typescript
export async function runViyoMax(
  brandId: string,
  message: string,
  history: ConversationMessage[],
): Promise<{ response: string; toolsUsed: ToolCall[]; citations: Citation[] }> {

  const brandContext = await assembleBrandContext(brandId);
  const brandMemory  = await fetchRelevantMemory(brandId, message);
  const systemPrompt = buildSystemPrompt(brandContext, brandMemory);
  const messages     = [...history.map(toMastraMessage), { role: 'user', content: message }];
  const toolsUsed: ToolCall[] = [];

  while (true) {
    const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
      model: 'claude-sonnet-4-5', max_tokens: 2000, temperature: 0.3,
      system: systemPrompt, tools: VIYO_MAX_TOOLS, messages,
    });

    if (response.stop_reason === 'end_turn') {
      const text      = extractText(response);
      const citations = extractCitations(text, toolsUsed);
      return { response: text, toolsUsed, citations };
    }

    // Execute tool calls in parallel
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults   = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = await executeViyoMaxTool(brandId, block.name, block.input);
        toolsUsed.push({ name: block.name, input: block.input, result });
        return { type: 'tool_result' as const, tool_use_id: block.id, content: JSON.stringify(result) };
      })
    );

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }
}
```

Max 6 tool rounds per response (`VIYO_MAX_MAX_TOOL_ROUNDS`). If the loop hits the cap, Max surfaces what it found and flags that deeper analysis would require another question.

---

### Conversation Memory

Two layers:

**Session memory** — full conversation history injected into context each turn. Continuity within a session.

**Long-term brand memory** — key facts extracted after each session ends, stored in `viyo_max_memory`. Not raw transcript — summarised, typed facts. Injected at the top of each new session.

```typescript
export const viyoMaxMemory = pgTable('viyo_max_memory', {
  id:           uuid('id').defaultRandom().primaryKey(),
  brand_id:     uuid('brand_id').references(() => brands.id).notNull(),
  memory_type:  text('memory_type').notNull(),    // 'decision' | 'preference' | 'finding' | 'context'
  topic:        text('topic').notNull(),
  content:      text('content').notNull(),
  source_conv:  uuid('source_conv'),
  confidence:   text('confidence').notNull(),     // 'confirmed' | 'observed' | 'speculative'
  created_at:   timestamp('created_at').defaultNow(),
  last_used_at: timestamp('last_used_at'),
});
```

Memory extraction runs after 30 minutes of inactivity — Claude Haiku summarises the session into durable facts ("VIP segment responds best to Tuesday 10am sends — confirmed across 4 campaigns"). These surface in the next session's opening context.

---

### "Generate from Advice" Integration

When VIYO Max recommends a campaign or flow change, it renders an inline action button. The `brief_payload` pre-fills `/campaigns/new` — one click from strategic advice to live generation.

```
VIYO MAX
──────────────────────────────────────────────────────────────────
Your abandoned cart Email 3 has a 9.4% open rate [Klaviyo · Mar]
— your lowest-performing email. Subject line is 52 characters,
above your optimal range [Winning formulas]. Recommend regenerating
with urgency framing and a 15% offer (within your system cap).

Brief I've built:
┌──────────────────────────────────────────────────────────────┐
│  Flow: Abandoned Cart · Email 3 (final)                      │
│  Tone: urgent — last email in sequence                       │
│  Offer: 15% off — within cart email 3 cap                   │
│  Subject: under 40 chars · loss aversion framing            │
└──────────────────────────────────────────────────────────────┘

[Generate this email — 800 credits]    [Edit brief first]
```

---

### Proactive Opening Message

Each new VIYO Max session opens with a data-driven summary — not generic, assembled live:

```typescript
async function buildOpeningMessage(brandId: string): Promise<string> {
  const [insights, credits, recentPerf, pendingPlays] = await Promise.all([
    fetchTopInsight(brandId), fetchCreditSummary(brandId),
    fetchRecentCampaignSnapshot(brandId), fetchPendingPlays(brandId),
  ]);
  // Claude Haiku assembles 2-3 sentences from real data
  return callHaikuForOpening({ insights, credits, recentPerf, pendingPlays });
}
```

Quick question chips below the opening are pulled from the top 4 pending insights and flow gaps — not hardcoded.

---

### Database Schema

```typescript
export const viyoMaxConversations = pgTable('viyo_max_conversations', {
  id:          uuid('id').defaultRandom().primaryKey(),
  brand_id:    uuid('brand_id').references(() => brands.id).notNull(),
  title:       text('title'),                    // AI-generated from first exchange
  messages:    jsonb('messages').notNull(),       // ConversationMessage[]
  tools_used:  jsonb('tools_used'),              // ToolCall[] — for audit and analytics
  created_at:  timestamp('created_at').defaultNow(),
  last_msg_at: timestamp('last_msg_at').defaultNow(),
});

// viyo_max_memory defined above
```

### Frontend Pages Added

- **Page 42:** `/max` — full-page chat, data-driven opening, tool call transparency panel, inline "Generate →" actions
- **Page 43:** `/max/history` — past conversations with AI-generated titles, search across history

### Environment Variables

```bash
VIYO_MAX_MODEL="claude-sonnet-4-5"
VIYO_MAX_TEMPERATURE=0.3
VIYO_MAX_MAX_TOKENS=2000
VIYO_MAX_MAX_TOOL_ROUNDS=6
VIYO_MAX_TOOL_TIMEOUT_MS=10000
VIYO_MAX_MEMORY_EXTRACTION_MODEL="claude-haiku-4-5"
VIYO_MAX_CONVERSATION_TTL_DAYS=90
VIYO_MAX_MEMORY_TTL_DAYS=365
VIYO_MAX_OPENING_MESSAGE_MODEL="claude-haiku-4-5"
```

---

## 20P. Support Center

### Overview

A full support system built across four components — two custom, two third-party — with AI deflection as the primary layer before any human contact.

| Component | Approach | Rationale |
|---|---|---|
| Knowledge base | Custom MDX in repo (migrates to Sanity when update frequency demands) | Full control, deep product integration, zero cost |
| Ticketing | Custom on Supabase + Resend | Must integrate with VIYO Max, advisor, and healing system — off-the-shelf tools do not know a user's token balance or Klaviyo state |
| Live chat | Crisp ($25/month) | Real-time WebSocket presence, mobile app for Nir, works immediately |
| AI deflection | Custom — Haiku advisor extended with KB search and account context | This is the moat. VIYO's deflection AI knows account state. Generic chatbots do not. |

Target deflection rate: 65%+ of support contacts resolved by AI without human involvement.

---

### Support Flow

```
User has a problem
        ↓
Help Center — search KB articles first
        ↓
AI Support Assistant — answers from KB + live account context
        ↓
         ┌──────────────────────┐
    Resolved                Not resolved
                                ↓
                    ┌───────────┴───────────┐
               Nir online?            Nir offline?
                    ↓                      ↓
             Crisp live chat         Submit ticket
             (context pre-loaded)    (Resend notification)
                    ↓                      ↓
             Transcript → ticket     Nir responds in
                    ↓               /admin/support
             CSAT survey (2h)             ↓
                                    CSAT survey (2h)
```

Every path produces a ticket record. Live chats that resolve are still logged. The ticket is the unit of record across all contact methods.

---

### Component 1: Knowledge Base

**Routes:** `/support` · `/support/[category]` · `/support/articles/[slug]`

Ten categories at launch: Getting Started, Generating Emails, Brand Asset Vault, Flows and Campaigns, Klaviyo Integration, Shopify Integration, Tokens and Billing, Account Settings, Troubleshooting, VIYO Max. 51 articles total. Start with the most-searched and highest-ticket-volume topics. After 30 days, the `search_no_results` log tells you exactly what is missing.

**Article count by category at launch:**

| Category | Articles |
|---|---|
| Getting Started | 5 |
| Generating Emails | 7 |
| Brand Asset Vault | 4 |
| Flows and Campaigns | 6 |
| Klaviyo Integration | 5 |
| Shopify Integration | 4 |
| Tokens and Billing | 5 |
| Account Settings | 4 |
| Troubleshooting | 8 |
| VIYO Max | 3 |

**Full-text search** via PostgreSQL `tsvector` — no external search service needed at this scale:

```typescript
export async function searchArticles(query: string): Promise<SupportArticle[]> {
  return db.select().from(supportArticles).where(
    and(
      eq(supportArticles.is_published, true),
      sql`to_tsvector('english', ${supportArticles.title} || ' ' || ${supportArticles.content} || ' ' || array_to_string(${supportArticles.search_keywords}, ' '))
          @@ plainto_tsquery('english', ${query})`
    )
  )
  .orderBy(desc(sql`ts_rank(to_tsvector('english', ${supportArticles.title} || ' ' || ${supportArticles.content}), plainto_tsquery('english', ${query}))`))
  .limit(8);
}
```

Every zero-result search is logged to `search_no_results`. Nir reviews weekly — each repeated unanswered query is a missing article.

**Article page layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Help Center          Tokens and Billing                       │
│                                                                  │
│  What is a token?                                                │
│  Last updated: April 12, 2026                                    │
│                                                                  │
│  Tokens are the unit VIYO uses to measure generation usage.      │
│  When you generate an email, VIYO deducts tokens from your       │
│  balance. Your subscription includes a monthly token allowance.  │
│  Add-on tokens can be purchased separately and roll over.        │
│                                                                  │
│  How many tokens does each action use?                           │
│                                                                  │
│  Action                              Tokens                      │
│  ─────────────────────────────────────────────                   │
│  Campaign email                      45,000                      │
│  Flow email                          45,000                      │
│  A/B test variant                    20,000                      │
│  Subject line regeneration           5,000                       │
│  Image regeneration                  6,000                       │
│  SMS message                         8,000                       │
│                                                                  │
│  Flow gap detection, segment creation, preflight checks,         │
│  STO recommendations, and analytics views are always free.       │
│                                                                  │
│  [View your current balance →]                                   │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  Was this helpful?    [👍 Yes]    [👎 No]                         │
│                                                                  │
│  Related articles:                                               │
│  · How to buy add-on tokens                                      │
│  · How auto-refill works                                         │
│  · Understanding your token transaction history                  │
└──────────────────────────────────────────────────────────────────┘
```

"👎 No" opens an inline prompt: "What was missing from this article?" — one-sentence text input. Response stored in `support_article_feedback` and surfaced in admin analytics. Nir gets a direct pipeline from user confusion to article improvement.

**Schema:**

```typescript
export const supportArticles = pgTable('support_articles', {
  id:                uuid('id').defaultRandom().primaryKey(),
  slug:              text('slug').notNull().unique(),
  title:             text('title').notNull(),
  category:          text('category').notNull(),
  content:           text('content').notNull(),           // MDX
  search_keywords:   text('search_keywords').array(),     // additional terms for search matching
  helpful_count:     integer('helpful_count').default(0),
  not_helpful_count: integer('not_helpful_count').default(0),
  views:             integer('views').default(0),
  is_published:      boolean('is_published').default(false),
  related_articles:  text('related_articles').array(),    // slugs
  last_updated_at:   timestamp('last_updated_at').defaultNow(),
  created_at:        timestamp('created_at').defaultNow(),
});

export const searchNoResults = pgTable('search_no_results', {
  id:         uuid('id').defaultRandom().primaryKey(),
  query:      text('query').notNull(),
  brand_id:   uuid('brand_id').references(() => brands.id),  // null for unauthenticated visitors
  created_at: timestamp('created_at').defaultNow(),
});

export const supportArticleFeedback = pgTable('support_article_feedback', {
  id:         uuid('id').defaultRandom().primaryKey(),
  article_id: uuid('article_id').references(() => supportArticles.id).notNull(),
  brand_id:   uuid('brand_id').references(() => brands.id),
  feedback:   text('feedback').notNull(),    // "What was missing?" free-text
  created_at: timestamp('created_at').defaultNow(),
});
```

---

### Component 2: AI Support Assistant

The deflection layer. Runs before any ticket or chat is created. Has two things generic chatbots do not: KB access and live account state.

**Why account context is the differentiator:**

Generic: "To reconnect Klaviyo, go to Settings → Integrations and click Reconnect."

VIYO AI: "Your Klaviyo connection expired 3 days ago — that is why your campaigns are not syncing. Go to [Settings → Integrations] and click Reconnect. Takes 30 seconds and uses the same credentials you used before."

Same answer. Entirely different experience. The second one requires knowing the user's connection state.

```typescript
const SUPPORT_AI_SYSTEM_PROMPT = `
You are VIYO's first-line support assistant. You have access to:
1. The user's account state (connection status, token balance, recent campaigns, errors)
2. VIYO's knowledge base articles

Your job: resolve the user's issue without escalating to a human wherever possible.

Rules:
- Always check account context before giving generic advice
- If you can see the exact cause in account state, name it explicitly
- If a KB article directly answers the question, cite it and summarise the key steps
- If you cannot resolve, say so clearly and offer to escalate
- Never pretend you have resolved something you have not
- Never ask for information you already have in account context

Escalation trigger phrases — escalate immediately if the user says any of these:
"this is urgent", "I've already tried", "still not working",
"need to talk to someone", "been trying for hours", "nothing works"
`;

export async function getSupportResponse(
  brandId: string,
  message: string,
  history: SupportMessage[],
): Promise<SupportAIResponse> {

  const [accountContext, relevantArticles] = await Promise.all([
    fetchSupportAccountContext(brandId),   // lightweight account snapshot
    searchArticles(message),               // KB search
  ]);

  const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
    model:      'claude-haiku-4-5',
    max_tokens: 400,
    system:     SUPPORT_AI_SYSTEM_PROMPT,
    messages: [
      {
        role:    'user',
        content: `
<account_context>
Klaviyo connected: ${accountContext.klaviyoConnected}
Klaviyo last sync: ${accountContext.klaviyoLastSync}
Shopify connected: ${accountContext.shopifyConnected}
Token balance: ${accountContext.tokenBalance}
Campaigns generated: ${accountContext.campaignCount}
Recent errors: ${JSON.stringify(accountContext.recentErrors)}
Active quarantines: ${JSON.stringify(accountContext.activeQuarantines)}
</account_context>

<relevant_kb_articles>
${relevantArticles.map(a => `Title: ${a.title}
Slug: ${a.slug}
Excerpt: ${a.content.slice(0, 300)}`).join('

')}
</relevant_kb_articles>

User message: ${message}
        `,
      },
      ...history.map(toMastraMessage),
    ],
  });

  const text = response.content[0].text;

  return {
    response:         text,
    shouldEscalate:   detectEscalationIntent(message, text),
    citedArticles:    extractCitedSlugs(text, relevantArticles),
    conversationText: buildConversationTranscript(history, message, text),
  };
}
```

**Escalation detection:**

```typescript
const ESCALATION_SIGNALS = [
  /this is urgent/i, /already tried/i, /still not working/i,
  /need to talk to someone/i, /been trying for hours/i, /nothing works/i,
  /i['']m unable to resolve/i, /this requires manual review/i,
];

function detectEscalationIntent(userMessage: string, aiResponse: string): boolean {
  return ESCALATION_SIGNALS.some(p => p.test(userMessage) || p.test(aiResponse));
}
```

When `shouldEscalate` is true, the UI transitions to the escalation options screen:

```
┌──────────────────────────────────────────────────────────────────┐
│  Let's get you to a human                                        │
│                                                                  │
│  Your conversation has been saved — you will not need to         │
│  repeat yourself.                                                │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │  💬 Live chat           │  │  📧 Submit a ticket         │   │
│  │                         │  │                             │   │
│  │  Nir is online          │  │  Response within 4 hours    │   │
│  │  Typical wait: < 2 min  │  │  (business hours)           │   │
│  │                         │  │                             │   │
│  │  [Start chat]           │  │  [Submit ticket]            │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

Nir's online status is pulled from Crisp's presence API in real time. When offline, the live chat card is hidden entirely — only the ticket path is shown.

---

### Component 3: Ticketing System (Custom)

**Why custom:** The VIYO Max conversation pre-fill, advisor conversation context, healing system quarantine state, and account snapshots require first-class integration. Off-the-shelf tools cannot provide this.

```typescript
export const supportTickets = pgTable('support_tickets', {
  id:               uuid('id').defaultRandom().primaryKey(),
  ticket_number:    text('ticket_number').notNull().unique(),   // 'VIYO-1247'
  brand_id:         uuid('brand_id').references(() => brands.id).notNull(),
  category:         text('category').notNull(),    // 'generation' | 'billing' | 'integration' | 'account' | 'bug' | 'feature_request' | 'other'
  priority:         text('priority').default('medium').notNull(),  // 'low' | 'medium' | 'high' | 'urgent'
  status:           text('status').default('open').notNull(),      // 'open' | 'pending_user' | 'pending_support' | 'resolved' | 'closed'
  subject:          text('subject').notNull(),
  ai_conversation:  jsonb('ai_conversation'),      // support AI chat before escalation
  account_snapshot: jsonb('account_snapshot'),     // connection status, token balance, errors at submission time
  source:           text('source').notNull(),      // 'support_ai' | 'viyo_max' | 'advisor' | 'direct_form' | 'live_chat'
  resolved_at:      timestamp('resolved_at'),
  resolved_by:      text('resolved_by'),           // 'nir' | 'ai'
  csat_score:       integer('csat_score'),         // 1 = positive, 0 = negative
  csat_feedback:    text('csat_feedback'),
  created_at:       timestamp('created_at').defaultNow(),
  updated_at:       timestamp('updated_at').defaultNow(),
});

export const supportTicketMessages = pgTable('support_ticket_messages', {
  id:          uuid('id').defaultRandom().primaryKey(),
  ticket_id:   uuid('ticket_id').references(() => supportTickets.id).notNull(),
  sender_type: text('sender_type').notNull(),      // 'user' | 'support' | 'ai' | 'system'
  content:     text('content').notNull(),          // markdown
  attachments: jsonb('attachments'),               // [{ filename, url, size }]
  is_internal: boolean('is_internal').default(false),  // Nir-only notes, never shown to user
  created_at:  timestamp('created_at').defaultNow(),
});
```

**Ticket number generation:**

```typescript
async function generateTicketNumber(): Promise<string> {
  const count = await db.select({ count: sql<number>`count(*)` }).from(supportTickets);
  return `VIYO-${String(count[0].count + 1).padStart(4, '0')}`;
}
```

**Auto-priority rules:**

```typescript
const PRIORITY_RULES: Array<{ condition: (t: NewTicket) => boolean; priority: Priority }> = [
  {
    condition: t => t.category === 'billing' && t.subject.toLowerCase().includes('charge'),
    priority:  'high',
  },
  {
    condition: t => t.account_snapshot?.activeQuarantines?.length > 0,
    priority:  'high',   // user is in a quarantine state — blocking issue
  },
  {
    condition: t => t.category === 'integration' && !t.account_snapshot?.klaviyoConnected,
    priority:  'high',   // Klaviyo disconnected — cannot deploy anything
  },
  {
    condition: t => t.category === 'bug',
    priority:  'medium',
  },
  {
    condition: t => t.category === 'feature_request',
    priority:  'low',
  },
];
```

**Email notifications via Resend:**

```typescript
// Ticket created → confirmation to user
await resend.emails.send({
  from:    'support@viyo.new',
  to:      user.email,
  subject: `[VIYO-${ticket.ticket_number}] We received your request`,
  react:   <TicketConfirmationEmail ticket={ticket} />,
});

// Ticket created → alert to Nir with full account snapshot
await resend.emails.send({
  from:    'system@viyo.new',
  to:      'nir@viyo.new',
  subject: `[${ticket.priority.toUpperCase()}] New ticket: ${ticket.subject}`,
  react:   <NewTicketAdminEmail ticket={ticket} accountSnapshot={ticket.account_snapshot} />,
});

// Nir replies → notification to user
await resend.emails.send({
  from:    'support@viyo.new',
  to:      user.email,
  subject: `[VIYO-${ticket.ticket_number}] Re: ${ticket.subject}`,
  react:   <TicketReplyEmail ticket={ticket} latestMessage={message} />,
});
```

**SLA tracking:** High/Urgent: 4h · Medium: 24h · Low: 48h. SLA breach flag shown in admin inbox.

**User-facing ticket thread:**

```
/support/tickets/VIYO-1247
┌──────────────────────────────────────────────────────────────────┐
│  VIYO-1247 · Open · High priority                                │
│  Klaviyo connection keeps dropping                               │
│  Opened Apr 15 · Last update 2h ago                             │
│                                                                  │
│  YOU  · Apr 15 14:23                                            │
│  My Klaviyo connection keeps disconnecting every few days.       │
│                                                                  │
│  VIYO SUPPORT  · Apr 15 16:41                                   │
│  Hi — I can see your Klaviyo token has expired twice in the      │
│  last 14 days. This usually happens when the OAuth token is not  │
│  refreshing correctly...                                         │
│                                                                  │
│  [Reply...]                          [Attach screenshot]         │
│  [Mark as resolved]                                              │
└──────────────────────────────────────────────────────────────────┘
```

---

### Component 4: Live Chat (Crisp)

Crisp provides WebSocket infrastructure, presence indicators, mobile app, and conversation management. VIYO integrates it with full account context and handles the handoff from the support AI cleanly.

**Two-mode widget initialisation:**

The Crisp widget is available on all pages — authenticated and unauthenticated. The initialisation runs in two modes depending on session state:

```typescript
export function initCrisp(user?: User, brand?: Brand) {
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  if (user && brand) {
    // Authenticated mode: full account context loaded into session
    // Nir sees the user's full state before typing a word
    $crisp.push(['set', 'user:email',    [user.email]]);
    $crisp.push(['set', 'user:nickname', [brand.name]]);
    $crisp.push(['set', 'session:data', [[
      ['brand_id',          brand.id],
      ['klaviyo_connected', brand.klaviyoConnected],
      ['shopify_connected', brand.shopifyConnected],
      ['token_balance',     brand.tokenBalance],
      ['campaigns_count',   brand.campaignCount],
      ['plan',              brand.plan],
      ['admin_link',        `https://viyo.new/admin/users?brand=${brand.id}`],
    ]]]);
  } else {
    // Unauthenticated mode: anonymous visitor on public pages
    // Used on /support/contact, /pricing, /,  and any public route
    $crisp.push(['set', 'session:data', [[
      ['visitor_type', 'unauthenticated'],
      ['page',         window.location.pathname],
    ]]]);
  }
}

// Called in layout.tsx:
// Authenticated layout:  initCrisp(session.user, brand)
// Public layout:         initCrisp()
```

This covers two cases the original spec missed: a prospect stuck on the pricing page who needs help before signing up, and a visitor landing on `/support/contact` with no account. Both get the Crisp widget. Nir sees `visitor_type: unauthenticated` and the page they were on — enough to help without any account context.

**Handoff from support AI to live chat:**

```typescript
async function escalateToLiveChat(aiConversation: SupportMessage[]) {
  const transcript = formatTranscriptForCrisp(aiConversation);
  // Pre-load the full AI conversation as a Crisp note
  // Nir sees everything before the user types their first message
  $crisp.push(['do', 'message:send', ['text',
    `[VIYO Support AI context]

${transcript}

---
User connecting for live support.`
  ]]);
  $crisp.push(['do', 'chat:open']);
}
```

What Nir sees before typing a word:

```
[VIYO Support AI context]

User asked: "My Klaviyo connection keeps dropping"
AI checked: Klaviyo token expired 2x in 14 days, last expiry 3 days ago
AI response: Explained OAuth refresh issue, suggested reconnecting
User replied: "I've tried reconnecting three times, still dropping"
AI escalated: Cannot resolve — pattern suggests OAuth refresh token issue

---
User connecting for live support.
```

**Crisp → ticket webhook:** When a Crisp conversation ends (resolved or user leaves), Crisp fires a `session:removed` webhook. VIYO catches it and creates a ticket record with the full transcript. Every live chat interaction is archived in the support system whether or not it was resolved.

```typescript
// POST /api/webhooks/crisp
export async function POST(req: Request) {
  const event = await req.json();
  if (event.event !== 'session:removed') return new Response('ok');

  const brandId    = event.data.session.data.brand_id;
  const transcript = buildTranscriptFromCrisp(event.data.messages);
  const resolved   = event.data.session.is_resolved;

  const ticket = await db.insert(supportTickets).values({
    ticket_number:   await generateTicketNumber(),
    brand_id:        brandId,
    category:        'live_chat',
    priority:        'medium',
    status:          resolved ? 'resolved' : 'open',
    subject:         event.data.session.topic ?? 'Live chat conversation',
    ai_conversation: transcript,
    source:          'live_chat',
    resolved_at:     resolved ? new Date() : null,
  }).returning();

  if (resolved) await sendCsatEmail(brandId, ticket[0].id);
}
```

---

### Nir's Admin Interface

**`/admin/support` — Ticket Inbox**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SUPPORT INBOX                                                               │
│  Filter: Open (12) ▼    Priority: All ▼    Category: All ▼    [Search...]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HIGH    VIYO-1251  · Lauren G Adams  · Billing               2m ago        │
│  "Charged twice for the same generation"                                     │
│  Klaviyo: ✓  Shopify: ✓  Tokens: 2,400  · Source: direct_form              │
│                                                                              │
│  HIGH    VIYO-1247  · Represent Clothing  · Integration        2h ago       │
│  "Klaviyo connection keeps dropping"                                          │
│  Klaviyo: ✗ (expired)  Tokens: 8,200  · Source: support_ai                 │
│                                                                              │
│  MED     VIYO-1243  · Adorb Custom Tees  · Generation         1d ago        │
│  "Spam score too high, cannot deploy"                                         │
│  Active quarantine: preflight_hard_fail  · Source: viyo_max                 │
│                                                                              │
│  LOW     VIYO-1239  · Florida DTF Factory  · Feature request  3d ago        │
│  "Can VIYO generate SMS-only sends?"                                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each row shows: priority badge, ticket number, brand, category, age, subject, and the account context snapshot — full picture before opening the ticket.

**`/admin/support/[id]` — Ticket Detail**

Two-panel layout:

Left panel: conversation thread (AI pre-fill visible at top, then user and support messages), reply box, internal notes (Nir-only — never shown to user, used for institutional knowledge like "this OAuth issue is a Klaviyo-side bug that happens with 2FA enabled — fix by revoking and re-granting access completely").

Right panel: live account context — connection status, token balance, recent errors, active quarantines. SLA timer (time elapsed vs. SLA threshold). Direct action links: "Force Klaviyo re-auth", "View healing log", "View in /admin/users". These links jump directly into the healing system and user lookup filtered to that brand. Support is integrated with everything — not siloed.

**`/admin/support/kb` — Knowledge Base Editor**

Article list with: helpful rate (👍 %), view count, last updated date. Direct edit and unpublish buttons per row.

Below the article list: **Missing Articles** panel generated from `search_no_results`, grouped and counted:

```
MISSING ARTICLES (from search log, last 30 days)
"how to schedule a campaign"  — searched 47 times, no results   [Create]
"export subscribers"          — searched 31 times, no results   [Create]
"refund tokens"               — searched 28 times, no results   [Create]
```

"Create" opens a new article with the search query prefilled as the title. Nir sees exactly what users are looking for that does not exist yet. This is more valuable than any editorial calendar — it is demand-driven.

**`/admin/support/analytics` — Support Analytics**

```
SUPPORT ANALYTICS                              Last 30 days
────────────────────────────────────────────────────────────
Tickets opened:     47   Resolved:  43   Open:    4
AI deflected:       31   Rate:     66%   CSAT:   91%
Avg resolution:   3.2h   SLA met:  94%

Top issue categories
Integration     38%  ████████████████████████
Billing         23%  ████████████████
Generation      19%  █████████████
Account         13%  █████████
Feature request  6%  ████

Unhelpful articles (👎 rate > 20%)
"Connecting Klaviyo"    18% 👎  [Edit article]
"Generation failed"     24% 👎  [Edit article]
```

Unhelpful articles surface automatically with direct edit links. CSAT below 85% triggers a weekly review flag.

---

### CSAT System

Two hours after ticket resolution, a plain-text email from `support@viyo.new`:

```
Subject: Did we resolve your issue? (VIYO-1247)

Hey [first name],

Was your Klaviyo connection issue sorted?

[👍 Yes, all sorted]    [👎 No, still having trouble]

VIYO Support
```

Two links. No form. Click-tracking via Resend. `csat_score` updated on click. If 👎: ticket automatically reopens, priority bumped to `high`, Nir notified.

---

### Integrations with Existing VIYO Systems

**VIYO Max (20O):** When the user describes a problem, Max detects support intent and surfaces: "This sounds like a support issue — want me to open a ticket with this conversation as context?" Zero repetition for the user.

When the user confirms, VIYO creates a ticket with `source: 'viyo_max'`. The `ai_conversation` field is populated with the full VIYO Max transcript. The ticket skips the AI deflection step entirely — VIYO Max already attempted resolution. In the admin inbox, `Source: viyo_max` tickets display the full conversation pre-fill in the left panel. Nir reads what Max tried before typing a word. Priority is auto-set to `medium` unless account snapshot signals a `high` condition (quarantine, disconnected Klaviyo, billing dispute).

**Contextual Advisor (20N):** The "Ask VIYO" drawer escalation path creates a ticket with the advisor conversation pre-filled as context.

When the user escalates from the advisor drawer, the ticket is created with `source: 'advisor'`. The `ai_conversation` field is populated with the advisor conversation. Same behavior as `viyo_max` source — no duplicate AI deflection, full context shown to Nir in the ticket detail panel. The escalation button in the advisor drawer reads "Open a support ticket with this conversation" — one click, no form to fill in.

**Self-Healing Admin (20K):** Ticket detail panel links directly to the healing log filtered to that brand. Active quarantines shown inline on the ticket. Nir resolves both from one interface.

**Onboarding:** If a user spends >3 minutes on the connect screen without completing, a banner appears: "Need help connecting? [Chat with us]" — opens Crisp directly.

---

### Frontend Pages

| # | Route | Auth | Description |
|---|---|---|---|
| 44 | `/support` | None | Help Center home — search, category grid, featured articles |
| 45 | `/support/[category]` | None | Category article list |
| 46 | `/support/articles/[slug]` | None | Article — content, helpful vote, related |
| 47 | `/support/contact` | None | Contact options — AI chat, live chat, ticket form |
| 48 | `/support/tickets` | Required | User's ticket list |
| 49 | `/support/tickets/[id]` | Required | Ticket thread — messages, reply, mark resolved |
| 50 | `/admin/support` | Admin | Ticket inbox with priority and context snapshots |
| 51 | `/admin/support/[id]` | Admin | Ticket detail — reply, internal notes, account panel |
| 52 | `/admin/support/kb` | Admin | KB editor, missing article suggestions |
| 53 | `/admin/support/analytics` | Admin | Volume, CSAT, deflection rate, unhelpful articles |

**Total frontend pages: 53.**

---

### Database Tables

| Table | Purpose |
|---|---|
| `support_articles` | KB articles with search vectors, helpful counts, view counts |
| `search_no_results` | Every failed search query — missing article detector |
| `support_article_feedback` | "What was missing?" free-text on 👎 votes |
| `support_tickets` | All tickets from all sources, full account snapshot at submission |
| `support_ticket_messages` | Threaded messages, internal notes, file attachments |

---

### Environment Variables

```bash
CRISP_WEBSITE_ID="your-crisp-website-id"
CRISP_API_KEY="your-crisp-api-key"
CRISP_WEBHOOK_SECRET="your-webhook-secret"

SUPPORT_AI_MODEL="claude-haiku-4-5"
SUPPORT_AI_MAX_TOKENS=400
SUPPORT_AI_ESCALATION_TIMEOUT_TURNS=4

SUPPORT_FROM_EMAIL="support@viyo.new"
SUPPORT_NIR_EMAIL="nir@viyo.new"
SUPPORT_CSAT_DELAY_HOURS=2
SUPPORT_SLA_HIGH_HOURS=4
SUPPORT_SLA_MEDIUM_HOURS=24
SUPPORT_SLA_LOW_HOURS=48

SEARCH_NO_RESULTS_REVIEW_CRON="0 9 * * 1"
```

---


## 20Q. Post-Connection Onboarding Workflow

**Philosophy:** Onboarding is a REVEAL, not a tutorial. The moment Klaviyo or Shopify connects, VIYO goes to work. By the time the user sees the dashboard, they already have a working intelligence layer, a recommended first campaign, and proof that the system understands their brand. Every screen shows value — never asks the user to "fill in settings" or "learn the interface" before they've seen something meaningful.

---

### 7-Step Onboarding Flow

| Step | Route | Title | What Happens |
|------|--------|--------|--------------|
| 1 | `/onboarding` | Welcome | URL input triggers Firecrawl brand detection instantly. One-line result appears inline: "Fashion brand · Mid-to-premium · Shopify storefront." "Connect Your Store" CTA. |
| 2 | `/onboarding/connect` | Connect | Klaviyo first (highest intelligence value), Shopify second. Each card shows exactly what VIYO reads and writes. After OAuth completes, card shows live subscriber/campaign/flow counts via SSE. Skip available. |
| 3 | `/onboarding/building` | Building Your Brain | Dark background, pulsing Orb. Real-time SSE narration as Inngest jobs complete. Specific language: "Comparing your results to 847 fashion brands" — not generic "processing." |
| 4 | `/onboarding/discover` | What We Found | Two-column layout: audience stats left, opportunities right. Shows subscriber count, VIP count, open rate vs. benchmark, best campaign ever, missing flows with revenue estimates, best send time, untapped bestsellers. |
| 5 | `/onboarding/recommend` | Your First Email | AI recommends a specific campaign with product, segment, data-backed reason, and expected impact. Alternatives visible but secondary. Blank brief option for experienced users. |
| 6 | (generation pages) | Generate Your First Email | Existing routes with `?onboarding=true` flag. Activates richer brain narration, annotated callouts on preview (dismissible individually), and deploy button copy: "Send to Klaviyo — your first email →" |
| 7 | `/onboarding/complete` | You're Ready | Specific recap: X subscribers reached, Y seconds to build brain, Z AI specialists used. "What to build next" cards ordered by flow gap revenue estimates. [View in Klaviyo] deep link. Confetti. |

---

### Step 3 — Brain Build Screen (`/onboarding/building`)

This is the most technically important screen. It must feel alive — not a spinner.

**SSE Endpoint:** `GET /api/onboarding/brain-status`

```typescript
// Server-Sent Events — one event per data layer completed
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId');

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: BrainBuildEvent) => {
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
      };

      // Layer 1: Shopify product catalog
      send({ layer: 'shopify', status: 'running', message: 'Reading your product catalog...' });
      await ingestShopifyCatalog(brandId);
      send({ layer: 'shopify', status: 'complete', count: productCount, message: `Found ${productCount} products across ${categoryCount} categories` });

      // Layer 2: Klaviyo campaigns + flows
      send({ layer: 'klaviyo', status: 'running', message: 'Analyzing your email history...' });
      await ingestKlaviyoData(brandId);
      send({ layer: 'klaviyo', status: 'complete', count: campaignCount, message: `Absorbed ${campaignCount} campaigns and ${flowCount} active flows` });

      // Layer 3: Performance data
      send({ layer: 'performance', status: 'running', message: 'Mapping what\'s worked before...' });
      await computePerformanceFingerprint(brandId);
      send({ layer: 'performance', status: 'complete', message: 'Performance patterns identified' });

      // Layer 4: Segment analysis
      send({ layer: 'segments', status: 'running', message: 'Understanding your audience...' });
      await analyzeKlaviyoSegments(brandId);
      send({ layer: 'segments', status: 'complete', count: segmentCount, message: `Mapped ${segmentCount} segments including ${vipCount} VIP subscribers` });

      // Layer 5: Top Brain pattern match
      send({ layer: 'topbrain', status: 'running', message: 'Matching your brand to top-performing patterns...' });
      await matchTopBrainPatterns(brandId);
      send({ layer: 'topbrain', status: 'complete', message: 'Intelligence layer activated' });

      // Build reveal insights
      const insights = await buildRevealInsights(brandId);
      send({ layer: 'complete', insights, message: 'Your brain is ready' });

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

**UI Behavior:**
- 5 rows, each showing layer name + status icon (spinner to checkmark)
- Each row animates in as its `running` event arrives
- Counts appear inline: "Found 847 products" fades in when `complete` fires
- Progress bar fills across all 5 layers (20% per layer)
- On `complete`: brief pause (1.2s), then auto-advance to `/onboarding/discover`
- Timeout: if brain build exceeds `ONBOARDING_BRAIN_BUILD_TIMEOUT_SECONDS`, show "Still working..." message and allow manual advance

---

### Step 4 — Intelligence Reveal (`/onboarding/discover`)

The "what we found" screen. Renders 4-6 insight cards from the brain build output. Purpose: make the user feel understood before they've done anything.

```typescript
interface RevealInsight {
  id: string;
  icon: string;               // emoji or icon name
  headline: string;           // e.g. "Your VIP segment is underserved"
  body: string;               // 1-2 sentences max
  stat?: string;              // optional number callout: "847 products", "23 flows"
  priority: number;           // determines card ordering (lower = higher priority)
}

async function buildRevealInsights(brandId: string): Promise<RevealInsight[]> {
  const [
    brain,
    catalog,
    segments,
    flows,
    campaigns,
  ] = await Promise.all([
    getPersonalBrain(brandId),
    getProductCatalog(brandId),
    getKlaviyoSegments(brandId),
    getKlaviyoFlows(brandId),
    getKlaviyoRecentCampaigns(brandId),
  ]);

  const insights: RevealInsight[] = [];

  // Insight 1 — Product catalog
  insights.push({
    id: 'catalog',
    icon: '🛍️',
    headline: `We mapped your full product catalog`,
    body: `${catalog.totalProducts} products across ${catalog.categories.length} categories. VIYO knows your bestsellers, new arrivals, and price tiers.`,
    stat: `${catalog.totalProducts} products`,
    priority: 10,
  });

  // Insight 2 — Flow gaps (high priority if found)
  const missingFlows = detectMissingFlows(flows);
  if (missingFlows.length > 0) {
    insights.push({
      id: 'flow_gap',
      icon: '⚡',
      headline: `You're missing ${missingFlows.length} high-value flow${missingFlows.length > 1 ? 's' : ''}`,
      body: `${missingFlows[0]} alone typically generates 15-25% of email revenue for brands like yours.`,
      stat: `${missingFlows.length} flows missing`,
      priority: 1,
    });
  }

  // Insight 3 — VIP segment
  const vipSegment = segments.find(s => s.type === 'vip' || s.name.toLowerCase().includes('vip'));
  if (vipSegment) {
    insights.push({
      id: 'vip',
      icon: '👑',
      headline: `Your VIP segment has ${vipSegment.size.toLocaleString()} subscribers`,
      body: `They haven't received a dedicated campaign in the last ${vipSegment.daysSinceLastCampaign} days. That's a retention opportunity.`,
      stat: `${vipSegment.size.toLocaleString()} VIPs`,
      priority: 3,
    });
  }

  // Insight 4 — Best performing campaign pattern
  const topCampaign = campaigns.sort((a, b) => b.openRate - a.openRate)[0];
  if (topCampaign) {
    insights.push({
      id: 'top_pattern',
      icon: '📈',
      headline: `Your best emails follow a clear pattern`,
      body: `"${topCampaign.subjectLine}" hit ${(topCampaign.openRate * 100).toFixed(1)}% open rate. We've identified the structure and will use it as a baseline.`,
      priority: 5,
    });
  }

  // Insight 5 — Audience size
  const totalSubscribers = segments.reduce((sum, s) => sum + s.size, 0);
  insights.push({
    id: 'audience',
    icon: '📬',
    headline: `Your list is ready`,
    body: `${totalSubscribers.toLocaleString()} active subscribers. VIYO has mapped engagement tiers so every email reaches the right audience.`,
    stat: `${totalSubscribers.toLocaleString()} subscribers`,
    priority: 8,
  });

  // Insight 6 — Top Brain pattern match
  insights.push({
    id: 'topbrain',
    icon: '🧠',
    headline: `Matched to top-performing brand patterns`,
    body: `VIYO has absorbed 500+ fashion brands. Your brand's positioning matches patterns from ${brain.matchedBrandArchetype} — known for high CTR on product storytelling emails.`,
    priority: 7,
  });

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 6);
}
```

**UI:** Staggered card reveal — each card fades in 150ms after the previous. CTA: "See Your First Recommendation" advances to Step 5.

---

### Step 5 — First Campaign Recommendation (`/onboarding/recommend`)

The AI proposes a specific, ready-to-generate email. Not generic advice — a named campaign with a product, segment, and rationale.

```typescript
interface FirstActionRecommendation {
  campaignType: string;         // e.g. "Welcome Series - Email 1"
  headline: string;             // e.g. "Start with your missing Welcome flow"
  rationale: string;            // 1-2 sentences explaining why
  product?: ProductSuggestion;  // optional — if product-driven
  segment: SegmentSuggestion;
  estimatedImpact: string;      // e.g. "Brands like yours see 18-25% open rates"
  brief_payload: object;        // pre-filled brief sent to generation flow
}

async function computeFirstAction(brandId: string): Promise<FirstActionRecommendation> {
  const [flows, catalog, campaigns, segments] = await Promise.all([
    getKlaviyoFlows(brandId),
    getProductCatalog(brandId),
    getKlaviyoRecentCampaigns(brandId),
    getKlaviyoSegments(brandId),
  ]);

  // Priority Rule 1: Missing welcome or abandon flow
  const hasWelcome = flows.some(f => f.triggerType === 'list_subscribe');
  const hasAbandon = flows.some(f => f.triggerType === 'checkout_started');
  if (!hasWelcome) {
    return buildFlowRecommendation('welcome_series', brandId);
  }
  if (!hasAbandon) {
    return buildFlowRecommendation('abandoned_checkout', brandId);
  }

  // Priority Rule 2: New products added in last 14 days with no campaign
  const newProducts = catalog.products.filter(p =>
    p.publishedAt > Date.now() - 14 * 24 * 60 * 60 * 1000
  );
  const newProductsCampaigned = campaigns.some(c =>
    c.products.some(p => newProducts.find(np => np.id === p.id))
  );
  if (newProducts.length > 0 && !newProductsCampaigned) {
    return buildProductLaunchRecommendation(newProducts[0], brandId);
  }

  // Priority Rule 3: Untapped bestseller — high revenue, no recent send
  const bestseller = catalog.products
    .filter(p => p.revenueRank <= 3)
    .find(p => !campaigns.some(c =>
      c.products.find(cp => cp.id === p.id) &&
      c.sentAt > Date.now() - 30 * 24 * 60 * 60 * 1000
    ));
  if (bestseller) {
    return buildBestsellerRecommendation(bestseller, brandId);
  }

  // Priority Rule 4: VIP segment gap (no VIP send in 30+ days)
  const vipSegment = segments.find(s => s.type === 'vip');
  if (vipSegment) {
    const lastVipCampaign = campaigns
      .filter(c => c.segmentId === vipSegment.id)
      .sort((a, b) => b.sentAt - a.sentAt)[0];
    if (!lastVipCampaign || lastVipCampaign.sentAt < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      return buildVipRecommendation(vipSegment, brandId);
    }
  }

  // Priority Rule 5: Default — new arrivals email to full list
  return buildDefaultRecommendation(catalog, brandId);
}
```

**UI:** Single hero card with:
- Campaign title (large)
- Product image if applicable (pulled from Brand Asset Vault)
- Rationale paragraph
- Estimated impact stat
- "Generate This Email" CTA (primary, full-width)
- "Or, start from scratch" text link (secondary)

---

### Step 6 — Guided Generation Mode (`?onboarding=true`)

Step 6 reuses the existing campaign generation routes — no new pages. The `?onboarding=true` query parameter activates a guided overlay on top of the standard flow.

**Three changes activated by `?onboarding=true`:**

**1. Richer brain narration.** The brain loading screen explains what each specialist is doing in the context of this specific brief, not generic labels. Instead of "CMO Brain analyzing..." the narration says "CMO Brain checking your VIP segment size and last send date..." — specific to the user's data.

**2. Annotated callouts on the preview.** After generation, 3-4 annotation bubbles appear pointing to key sections of the email (subject line, hero image, CTA). Each explains why the AI made that choice: "Subject line uses open-loop curiosity — your top 3 historical emails all used this pattern." Callouts are dismissible individually. Dismissed state is saved to `onboarding_progress.callouts_dismissed`.

**3. Deploy button copy change.** The "Push to Klaviyo" button becomes "Send to Klaviyo — your first email →" with a small star icon. Reverts to standard copy on all subsequent emails.

```typescript
// Onboarding mode detection — used throughout generation flow
const isOnboardingMode = searchParams.get('onboarding') === 'true' &&
  !onboardingProgress.firstEmailGeneratedAt;

// Callout annotation data — generated alongside email, stored in session
interface OnboardingCallout {
  target: 'subject_line' | 'hero_image' | 'cta' | 'offer' | 'preview_text';
  explanation: string;    // why the AI made this choice
  dismissed: boolean;
}
```

---

### Step 7 — Success Screen (`/onboarding/complete`)

Not a generic "you're done" screen. A specific recap of what VIYO actually did.

**Recap block:**
```
Your first email is live.

Brain built in 47 seconds
3,247 subscribers will receive it
6 AI specialists worked on it
847 brands analysed to inform your subject line
```

All numbers are real — pulled from `onboarding_progress` timestamps and brain build metadata.

**"What to build next" cards** — ordered by flow gap revenue estimate (highest first):

```typescript
interface NextStepCard {
  title: string;               // e.g. "Set up your Abandoned Checkout flow"
  revenueEstimate: string;     // e.g. "Typically recovers 8-12% of abandoned carts"
  cta: string;                 // e.g. "Build this flow →"
  route: string;               // e.g. "/campaigns/new?intent=abandoned_checkout_flow"
}
```

External link: **[View in Klaviyo →]** deep-links to the campaign draft in Klaviyo (constructed from `campaign.klaviyo_campaign_id`).

Confetti fires on mount — one burst, not looping.

---

### Partial Connection Handling

Not every user connects both platforms. VIYO handles each partial state gracefully — no dead ends.

| Connection State | Brain Build | Discover Screen | Recommend Screen |
|-----------------|-------------|-----------------|------------------|
| Klaviyo only | Segments + campaigns + flows | Audience insights, flow gaps | Flow or segment-based campaign |
| Shopify only | Product catalog + categories | Product catalog reveal, new arrivals | Product launch or bestseller |
| URL crawl only | Brand voice + visual identity | Brand voice summary, style detection | Brand voice email with manual product input |
| Neither (skipped) | Brand name only | Welcome message, "connect to unlock" cards | Generic first campaign with manual inputs |

When running in partial mode, `buildRevealInsights()` omits insight types that require missing data sources. The recommendation screen notes which connection would unlock better suggestions, with a non-blocking "Connect Klaviyo" chip below the recommendation.

---

### Dashboard Persistence Banner

After onboarding is complete, a subtle banner appears on the dashboard until dismissed or acted upon.

```typescript
// Shown if: onboarding completed but first email not generated
// Permanently hidden after 2 dismissals
// Reappears after 24h if dismissed fewer than 2 times
const OnboardingBanner = () => {
  const { firstAction, bannerDismissedCount, bannerLastDismissedAt } = useOnboardingState();

  // Permanently hidden after 2 dismissals
  if (bannerDismissedCount >= 2) return null;

  // Temporarily hidden: dismissed within the last 24h
  if (
    bannerLastDismissedAt &&
    Date.now() - bannerLastDismissedAt.getTime() < 24 * 60 * 60 * 1000
  ) return null;

  return (
    <div className="onboarding-banner">
      <span>Your brain is ready.</span>
      <span>{firstAction.headline}</span>
      <Button onClick={() => router.push('/generate?from=onboarding')}>
        Generate Now
      </Button>
      <button onClick={dismissBanner}>x</button>
    </div>
  );
};
```

---

### Re-Engagement Email Cadence

For users who drop off before completing onboarding:

| Trigger | Delay | Subject | Body Focus |
|---------|-------|---------|------------|
| Connected but didn't advance past `/building` | 2 hours | "Your brain is still waiting" | Single CTA to resume — deep link back to `/onboarding/building` |
| Completed discover but didn't generate | 24 hours | "Your first email is ready to build" | Show the recommended campaign from Step 5, single CTA |
| Completed onboarding but zero emails generated | 72 hours | "You're set up — here's what to do next" | 3 simple actions: generate first email, check calendar, explore flows |

All re-engagement emails use Resend. Sender: `sarah@viyo.new`. Plain text personal tone. No HTML template — prose only.

Sending logic via Inngest:

```typescript
// Triggered at connection time, cancelled if user advances
export const onboardingReengagementFlow = inngest.createFunction(
  { id: 'onboarding-reengagement' },
  { event: 'onboarding/connected' },
  async ({ event, step }) => {
    const { brandId, userId } = event.data;

    // 2h email — cancel if building screen was passed
    await step.sleepUntil('wait-2h', addHours(new Date(), 2));
    const progress = await step.run('check-progress-2h', () => getOnboardingProgress(brandId));
    if (!progress.buildingScreenPassedAt) {
      await step.run('send-2h-email', () => sendReengagementEmail(userId, '2h'));
    }

    // 24h email — cancel if discover screen was passed
    await step.sleepUntil('wait-24h', addHours(new Date(), 24));
    const progress24 = await step.run('check-progress-24h', () => getOnboardingProgress(brandId));
    if (!progress24.discoverScreenPassedAt) {
      await step.run('send-24h-email', () => sendReengagementEmail(userId, '24h'));
    }

    // 72h email — cancel if first email was generated
    await step.sleepUntil('wait-72h', addHours(new Date(), 72));
    const progress72 = await step.run('check-progress-72h', () => getOnboardingProgress(brandId));
    if (!progress72.firstEmailGeneratedAt) {
      await step.run('send-72h-email', () => sendReengagementEmail(userId, '72h'));
    }
  }
);
```

---

### Database Schema

```typescript
export const onboardingProgress = pgTable('onboarding_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id),
  userId: uuid('user_id').notNull().references(() => users.id),

  // Connection milestones
  klaviyoConnectedAt: timestamp('klaviyo_connected_at'),
  shopifyConnectedAt: timestamp('shopify_connected_at'),
  urlCrawlCompletedAt: timestamp('url_crawl_completed_at'),
  skippedConnectionAt: timestamp('skipped_connection_at'),

  // Brain build milestones
  brainBuildStartedAt: timestamp('brain_build_started_at'),
  brainBuildCompletedAt: timestamp('brain_build_completed_at'),
  brainBuildTimeoutAt: timestamp('brain_build_timeout_at'),

  // Screen progression timestamps
  buildingScreenPassedAt: timestamp('building_screen_passed_at'),
  discoverScreenPassedAt: timestamp('discover_screen_passed_at'),
  recommendScreenPassedAt: timestamp('recommend_screen_passed_at'),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),

  // First action tracking
  firstActionType: text('first_action_type'),
  firstActionAccepted: boolean('first_action_accepted').default(false),
  firstEmailGeneratedAt: timestamp('first_email_generated_at'),

  // Banner state
  bannerDismissedCount: integer('banner_dismissed_count').default(0),
  bannerLastDismissedAt: timestamp('banner_last_dismissed_at'),

  // Re-engagement
  reengagement2hSentAt: timestamp('reengagement_2h_sent_at'),
  reengagement24hSentAt: timestamp('reengagement_24h_sent_at'),
  reengagement72hSentAt: timestamp('reengagement_72h_sent_at'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

### Onboarding Analytics Events

All events emitted to Posthog and stored in `onboarding_progress` for funnel analysis:

| Event | Fired When |
|-------|-----------|
| `onboarding_started` | User hits `/onboarding` for first time |
| `connection_attempted` | OAuth button clicked |
| `connection_completed` | OAuth callback success |
| `brain_build_started` | SSE stream opens |
| `brain_build_completed` | All 5 layers complete |
| `brain_build_timeout` | Exceeded timeout threshold |
| `reveal_viewed` | Discover screen rendered |
| `insight_card_clicked` | User taps a reveal insight card |
| `recommendation_viewed` | Recommend screen rendered |
| `first_action_accepted` | "Generate This Email" clicked |
| `first_action_skipped` | "Start from scratch" clicked |
| `onboarding_completed` | `/onboarding/complete` rendered |
| `reengagement_email_sent` | Any of the 3 re-engagement emails sent |
| `reengagement_email_clicked` | User clicked CTA in re-engagement email |

---

### New Pages (Adds to Section 20L Inventory)

| # | Route | Title | Auth | Notes |
|---|-------|--------|------|-------|
| 54 | `/onboarding/building` | Brain Building | Required | SSE-driven, 5 live progress layers |
| 55 | `/onboarding/discover` | Intelligence Reveal | Required | 4-6 insight cards, staggered animation |
| 56 | `/onboarding/recommend` | First Campaign Recommendation | Required | AI-selected campaign with product + segment |
| 57 | `/onboarding/complete` | Onboarding Complete | Required | Specific recap, next-step cards, Klaviyo deep link, confetti |
| 58 | `/admin/onboarding` | Onboarding Analytics | Admin only | Full funnel from connection to first deploy, drop-off points, recommendation_accepted vs. recommendation_modified breakdown |

**Total frontend pages: 58**

---

### Environment Variables

```env
ONBOARDING_BRAIN_BUILD_TIMEOUT_SECONDS=120
ONBOARDING_REENGAGEMENT_FROM_EMAIL="sarah@viyo.new"
ONBOARDING_REENGAGEMENT_FROM_NAME="Sarah from VIYO"
ONBOARDING_BANNER_MAX_DISMISSALS=2
ONBOARDING_BANNER_REDISPLAY_HOURS=24
ONBOARDING_SSE_HEARTBEAT_INTERVAL_MS=15000
ONBOARDING_MODE_QUERY_PARAM="onboarding"
```

---

## 20R. Pre-Flight Email Checker

Every email must pass a pre-flight check before it can be pushed to Klaviyo. The check is triggered when the user clicks "Push to Klaviyo" and runs as a blocking modal — the user cannot send until they either resolve all issues or explicitly override warnings (hard failures cannot be overridden under any circumstances).

**Architecture decision:** Use Email on Acid's API as the primary external service (client rendering + spam + accessibility + link checks in one call), supplemented by a single Claude Haiku call for grammar and readability. This replaces five separate integrations with two.

---

### Two-Service Architecture

| Check | Service | Cost | Cannot DIY? |
|-------|---------|------|-------------|
| Client rendering (90+ email clients) | Email on Acid API | ~$86/mo flat | Yes — requires real running email clients |
| Spam filter testing | Email on Acid API | Included | No, but bundled |
| Accessibility checks | Email on Acid API | Included | No, but bundled |
| Link validation | Email on Acid API | Included | No, but bundled |
| Grammar + readability + subject line | Claude Haiku | ~$0.0002/check | No — kept internal to avoid extra dependency |

---

### Email on Acid Integration

Email on Acid accepts an HTML payload and returns a job ID. Results are polled until complete (typically 60-120 seconds for full client renders). Spam and validation results return faster (10-20 seconds).

```typescript
interface EoaPreflightResult {
  jobId: string;
  status: 'processing' | 'complete' | 'failed';
  clientRenders: {
    client: string;                      // e.g. "Gmail - Chrome"
    screenshotUrl: string;
    status: 'pass' | 'warn' | 'fail';
    issue?: string;
  }[];
  spam: {
    score: number;                       // 0-10, higher = more spammy
    status: 'pass' | 'warn' | 'fail';   // pass <3, warn 3-5, fail >5
    triggeredRules: string[];
  };
  accessibility: {
    issues: { description: string; severity: 'error' | 'warning' }[];
    status: 'pass' | 'warn' | 'fail';
  };
  links: {
    url: string;
    status: number;                      // HTTP status code
    ok: boolean;
    hasUtm: boolean;
  }[];
  linksStatus: 'pass' | 'warn' | 'fail';
}

async function runEoaCheck(html: string, subject: string): Promise<EoaPreflightResult> {
  // Submit job
  const submitRes = await fetch('https://api.emailonacid.com/v5/email/checks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${EOA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      html,
      clients: EOA_DEFAULT_CLIENTS,          // configured via env
      spam_filter_tests: true,
      accessibility_tests: true,
      link_tracking: true,
    }),
  });

  const { id: jobId } = await submitRes.json();

  // Poll for results (max 3 minutes)
  return pollEoaResults(jobId, { maxWaitMs: 180_000, intervalMs: 5_000 });
}
```

---

### Grammar + Readability (Claude Haiku)

Runs in parallel with Email on Acid — fast enough to return before EoA finishes.

```typescript
const GRAMMAR_SYSTEM_PROMPT = `
You are a grammar and readability checker for email marketing copy targeting fashion and lifestyle ecommerce buyers.
Analyze the provided subject line, preview text, and body copy and return JSON only:
{
  "grammar_errors": [{ "text": "...", "issue": "...", "suggestion": "..." }],
  "readability_grade": <Flesch-Kincaid grade level as integer>,
  "readability_status": "pass" | "warn" | "fail",  // pass ≤8, warn 9-11, fail >11
  "subject_length": <character count>,
  "subject_status": "pass" | "warn" | "fail",       // pass ≤50, warn 51-60, fail >60
  "preview_text_status": "pass" | "warn" | "fail",  // pass if present and ≤90 chars
  "overall_status": "pass" | "warn" | "fail"
}
Return only JSON. No prose. No markdown.
`.trim();

async function runGrammarCheck(subject: string, previewText: string, bodyText: string): Promise<GrammarResult> {
  const response = await mastra.execute({
    model: 'claude-3-5-sonnet-20241022', // or gpt-4o / gemini-3.1-flash depending on brain
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: GRAMMAR_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Subject: ${subject}\nPreview text: ${previewText}\n\nBody:\n${bodyText.slice(0, 3000)}`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

---

### Pre-Flight Runner

Both checks launch simultaneously. The modal opens immediately and updates as results arrive.

```typescript
async function runPreflight(
  emailId: string,
  options: { includeRendering: boolean }
): Promise<PreflightResult> {
  const email = await getCompiledEmail(emailId);

  // Hard fail: unsubscribe link is mandatory before any API call
  const hasUnsubscribe = email.html.includes('unsubscribe') ||
                         email.html.includes('optout');
  if (!hasUnsubscribe) {
    return {
      overallStatus: 'BLOCKED',
      blockReason: 'MISSING_UNSUBSCRIBE_LINK',
      message: 'CAN-SPAM requires an unsubscribe link in every commercial email.',
    };
  }

  // Run both checks in parallel
  const [eoaResult, grammarResult] = await Promise.all([
    runEoaCheck(email.html, email.subject),
    runGrammarCheck(email.subject, email.previewText, email.bodyText),
  ]);

  // Compute overall status
  const statuses = [
    eoaResult.spam.status,
    eoaResult.linksStatus,
    eoaResult.accessibility.status,
    grammarResult.overall_status,
    options.includeRendering
      ? computeRenderStatus(eoaResult.clientRenders)
      : 'pass',
  ];

  const overallStatus = statuses.includes('fail') ? 'BLOCKED'
    : statuses.includes('warn') ? 'REVIEW'
    : 'CLEAR';

  // Persist result
  await db.insert(preflightResults).values({
    emailId,
    brandId: email.brandId,
    eoaJobId: eoaResult.jobId,
    spamScore: eoaResult.spam.score,
    spamStatus: eoaResult.spam.status,
    linksStatus: eoaResult.linksStatus,
    accessibilityStatus: eoaResult.accessibility.status,
    grammarErrors: grammarResult.grammar_errors.length,
    readabilityGrade: grammarResult.readability_grade,
    subjectStatus: grammarResult.subject_status,
    renderingIncluded: options.includeRendering,
    overallStatus,
    creditsCost: options.includeRendering
      ? PREFLIGHT_RENDERING_CREDITS
      : PREFLIGHT_FAST_CHECK_CREDITS,
    checkedAt: new Date(),
  });

  return { eoaResult, grammarResult, overallStatus };
}
```

---

### Override Governance

| Status | Meaning | User Action Required |
|--------|---------|---------------------|
| `CLEAR` | All checks passed | "Send to Klaviyo" enabled immediately |
| `REVIEW` | Warnings present | Must click "Override + Send" and type `SEND` to confirm |
| `BLOCKED` | Hard failure present | Send disabled — must fix issue first |

Hard failures that cannot be overridden:
- Missing unsubscribe link (CAN-SPAM)
- Spam score above 7.0
- Broken links (404/500 on any URL in the email)
- Localhost or staging URLs in `src` or `href` attributes

---

### UI — Pre-Flight Modal

Appears full-screen when user clicks "Push to Klaviyo." Results update live as checks complete.

```
Pre-Flight Check                                                     [X]
────────────────────────────────────────────────────────────────────────

  ✓  Grammar + Subject     0 errors — Grade 7 reading level — 44 chars
  ⟳  Spam Score            Checking...
  ⟳  Links                 Checking...
  ⟳  Accessibility         Checking...
  ○  Client Rendering      Off — enable for +200 credits  [ Toggle ]

────────────────────────────────────────────────────────────────────────
Status: Checking...

  [ Cancel ]
```

Once complete:

```
Pre-Flight Check                                                     [X]
────────────────────────────────────────────────────────────────────────

  ✓  Grammar + Subject     0 errors — Grade 7 — 44 chars
  ✓  Spam Score            1.8 / 10 — Clear
  ⚠  Links                 3 links missing UTM parameters
  ✓  Accessibility         0 errors
  ○  Client Rendering      Not checked

────────────────────────────────────────────────────────────────────────
Status: REVIEW — 1 warning

  [ Fix Issues ]        [ Override + Send Anyway ]
```

When "Override + Send Anyway" is clicked, a confirmation input appears: `Type SEND to confirm`. Confirming logs `overridden_by` and `override_reason` to `preflight_results`.

If rendering is toggled on after the initial check, Email on Acid is re-queried for screenshots only — other results are cached.

Client rendering panel (when enabled): 10 client screenshots in a 2x5 grid. Each thumbnail shows client name and a pass/warn/fail badge. Clicking a thumbnail opens full-size.

---

### Database Schema

```typescript
export const preflightResults = pgTable('preflight_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailId: uuid('email_id').notNull().references(() => emails.id),
  brandId: uuid('brand_id').notNull().references(() => brands.id),

  eoaJobId: text('eoa_job_id'),
  spamScore: decimal('spam_score'),
  spamStatus: text('spam_status'),
  linksStatus: text('links_status'),
  accessibilityStatus: text('accessibility_status'),
  grammarErrors: integer('grammar_errors'),
  readabilityGrade: integer('readability_grade'),
  subjectStatus: text('subject_status'),
  renderingIncluded: boolean('rendering_included').default(false),
  renderingResults: jsonb('rendering_results'),

  overallStatus: text('overall_status'),         // CLEAR | REVIEW | BLOCKED
  blockReason: text('block_reason'),
  overriddenBy: uuid('overridden_by').references(() => users.id),
  overrideReason: text('override_reason'),
  creditsCost: integer('credits_cost'),

  checkedAt: timestamp('checked_at').defaultNow(),
});
```

---

### New Pages (Adds to Section 20L Inventory)

| # | Route | Title | Auth | Notes |
|---|-------|--------|------|-------|
| 58 | `/email/{id}/preflight` | Pre-Flight Check | Required | Modal overlay on push action — not a standalone page; no new route needed |

Pre-flight is a modal, not a route — no new page entry required.

**Total frontend pages: 58 (unchanged — pre-flight is a modal, not a route)**

---

### Environment Variables

```env
EOA_API_KEY="..."
EOA_DEFAULT_CLIENTS="gmail_chrome,gmail_android,gmail_ios15,applemail_mac,applemail_ios,outlook_2021,outlook_365,outlook_mac,yahoo_mail,samsung_email"
PREFLIGHT_FAST_CHECK_CREDITS=25
PREFLIGHT_RENDERING_CREDITS=200
PREFLIGHT_MAX_POLL_MS=180000
PREFLIGHT_POLL_INTERVAL_MS=5000
```

---

## 20S. ESP-Agnostic Sign-Up Forms

> **Release timeline: V3.** The UI wizard and form builder ship in V3. The submission infrastructure, database schema, fan-out architecture, and ESP adapter hooks are built in V1 so there is nothing to rewrite when the forms UI ships. Every schema decision in this section is made with V3 in mind — nothing is hardcoded.

---

### Architecture Decision

VIYO sits in the middle. Forms never submit directly to Klaviyo, Omnisend, or any ESP. They submit to a VIYO endpoint, which fans out to whatever ESP(s) the brand has connected. Switching ESPs tomorrow does not break a single deployed form — VIYO handles the translation layer.

This is the core principle. Everything else follows from it.

**Supported ESPs at launch:** Klaviyo, Omnisend, ActiveCampaign, Mailchimp. Adding a new ESP requires one new adapter file and one registry entry — no schema migrations, no core code changes.

---

### What Gets Built in V1 (Infrastructure Layer)

V1 builds the complete submission infrastructure so V3 has nothing to rewrite:

| Component | V1 Status | Notes |
|-----------|-----------|-------|
| `POST /api/forms/{formId}/submit` endpoint | Built | Accepts submissions, stores, fans out |
| `forms` table | Built | Flexible schema — no hardcoded ESP columns |
| `form_subscribers` table | Built | Source of truth for all form submissions |
| `form_submission_errors` table | Built | ESP sync failures with Inngest retry |
| ESP fan-out via adapter registry | Built | Uses Section 20U ESPAdapter pattern |
| Form analytics data collection | Built | Impressions, submissions, conversion rate tracking |
| `/forms` dashboard page | Built (read-only) | Shows any forms created via API; wizard is V3 |

The wizard UI, form builder, and AI recommendation engine are V3 only.

---

### Submission Architecture

```
Visitor submits form
  → POST https://forms.viyo.new/api/submit/{formId}
  → VIYO: validate, store in form_subscribers table
  → Fan out to connected ESP(s) in parallel via adapter registry
  → Return { success: true } to browser in < 800ms
```

```typescript
async function handleFormSubmission(formId: string, data: FormSubmission): Promise<void> {
  // 1. Validate and normalise
  const form      = await getForm(formId);
  const validated = validateSubmission(data, form.fields);

  // 2. Store in VIYO — source of truth, independent of any ESP
  const subscriber = await db.insert(formSubscribers).values({
    formId,
    brandId:     form.brandId,
    email:       validated.email,
    firstName:   validated.firstName,
    phone:       validated.phone,
    source:      data.source,        // page URL where form was submitted
    ipCountry:   data.ipCountry,
    submittedAt: new Date(),
  }).returning();

  // 3. Fan out to all connected ESPs in parallel via adapter registry
  // Non-blocking — ESP sync failures never surface to the end user
  const connections = await getBrandEspConnections(form.brandId);

  await Promise.allSettled(
    connections.map(conn => syncToEspViaAdapter(conn, validated, form))
  );
}

// Adapter registry fan-out — never a switch statement
async function syncToEspViaAdapter(
  conn: EspConnection,
  data: ValidatedSubmission,
  form: Form,
): Promise<void> {
  const adapter   = getEspAdapter(conn.provider);  // registry lookup from Section 20U
  const routing   = form.espRouting?.[conn.provider];  // from JSONB column — no hardcoded fields

  if (!routing?.listId) {
    throw new Error(`No list configured for ${conn.provider} on form ${form.id}`);
  }

  await adapter.syncSubscriber(conn.brandId, {
    email:     data.email,
    firstName: data.firstName,
    phone:     data.phone,
    listId:    routing.listId,
    tags:      form.tags ?? [],
    source:    `viyo_form:${form.id}`,
  });
}
```

Fan-out errors are logged to `form_submission_errors` and retried via Inngest with exponential backoff (3 attempts, 5s base delay). The visitor always gets `{ success: true }` — ESP sync failures are an operational concern, not a user-facing one.

**Adding a new ESP in the future:**
1. Write one new adapter file implementing `ESPAdapter` from Section 20U
2. Add it to the adapter registry: `registry.set('brevo', new BrevoAdapter())`
3. Done — the fan-out code, schema, and submission endpoint require zero changes

---

### User-Initiated Form Creation (V3 Principle)

Forms are never created automatically. No VIYO system creates or deploys a form without explicit user action.

The Smart Insight Engine (Section 20I) may surface an insight — e.g., "Brands at your stage using an exit-intent popup grow lists 4x faster. You have no email capture on your site." That insight links to `/forms/new`. It creates nothing on its own.

**Three entry points into the form wizard (V3):**

| Entry | Description |
|-------|-------------|
| AI-Generated | AI picks form type, writes copy, styles to brand — user reviews and adjusts |
| Template-Based | User picks a pre-built template, AI fills copy from brand voice |
| Custom | Blank canvas, full manual control |

---

### Form Creation Wizard — V3 UI Spec

The builder is a step-by-step configurator with a live preview pane — configuration fields on the left, rendered form preview on the right. Not a drag-and-drop canvas (too heavy to build for V1, Klaviyo already does this for email). Mobile / desktop toggle in the preview header.

```
Step 1 — Form Type       AI recommendation shown with rationale. User can override.
Step 2 — Trigger         Time delay | exit intent | scroll % | click element
Step 3 — Offer           Discount code | lead magnet | early access | no offer
Step 4 — Fields          Email (required) + toggles: first name, phone, birthday
Step 5 — Copy            Headline, body, CTA, thank-you message (AI-written, editable)
Step 6 — Design          Background, button style — pulled from Brand Asset Vault
Step 7 — Deploy          JS snippet | hosted URL | raw API endpoint
```

Preview pane updates live as any field changes. Step 5 copy is pre-filled by Claude Haiku using brand voice from the Personal Brain — editable before deploy.

---

### AI Form Type Recommendation Engine — V3

Runs at Step 1. Returns one primary recommendation with rationale and expected conversion range. Shown as a highlighted card: "Use This" (primary CTA) and "See All Types" (secondary link).

Four signals drive the recommendation:

1. **Brand positioning** — luxury vs. mid-market vs. mass
2. **List maturity** — subscriber count under 2,000 is list-building mode
3. **Top Brain data** — what form types convert best for similar brands in this vertical and price tier
4. **Existing forms** — avoids recommending the same type the brand already has

```typescript
interface FormTypeRecommendation {
  type:                   'popup' | 'embedded' | 'flyout' | 'full_page' | 'teaser';
  trigger:                string;
  offerType:              'discount' | 'lead_magnet' | 'early_access' | 'none';
  rationale:              string;
  expectedConversionRange: string;   // e.g. "3-5% based on similar brands"
  topBrainBasisCount:     number;    // how many brands this is based on
}

function recommendFormType(
  brand:           BrandProfile,
  topBrainData:    TopBrainFormPatterns,
): FormTypeRecommendation {

  const isLuxury   = brand.positioning === 'luxury' || brand.avgOrderValue > 250;
  const earlyStage = brand.subscriberCount < 2000;
  const hasPopup   = brand.existingForms.some(f => f.type === 'popup');

  // Top Brain: what converts best for this vertical + price tier
  const topPattern = topBrainData.formPatterns
    .filter(p => p.industry === brand.industry && p.pricePoint === brand.pricePoint)
    .sort((a, b) => b.avgConversionRate - a.avgConversionRate)[0];

  // Luxury: editorial feel — never an aggressive interruptive popup
  if (isLuxury) {
    return {
      type:                   'embedded',
      trigger:                'scroll_50_percent',
      offerType:              'early_access',
      rationale:              'Luxury brands convert better with non-interruptive forms. An embedded form keeps your editorial feel while capturing high-intent visitors.',
      expectedConversionRange: '1.5-2.5%',
      topBrainBasisCount:     topPattern?.sampleSize ?? 0,
    };
  }

  // Early stage: maximize list growth with discount exit-intent popup
  if (earlyStage && !hasPopup) {
    return {
      type:                   'popup',
      trigger:                'exit_intent',
      offerType:              'discount',
      rationale:              'You're in list-building mode. Exit-intent popups with a discount are the fastest list-growth lever — similar brands see 4-7% opt-in rates.',
      expectedConversionRange: '4-7%',
      topBrainBasisCount:     topPattern?.sampleSize ?? 0,
    };
  }

  // Has popup: add flyout as a second touchpoint without doubling friction
  if (hasPopup) {
    return {
      type:                   'flyout',
      trigger:                'scroll_60_percent',
      offerType:              'lead_magnet',
      rationale:              'You already have a popup. A fly-out on scroll captures visitors who dismissed it — a second touchpoint without doubling the friction.',
      expectedConversionRange: '1-2%',
      topBrainBasisCount:     topPattern?.sampleSize ?? 0,
    };
  }

  // Default: timed popup
  return {
    type:                   'popup',
    trigger:                'time_delay_8000ms',
    offerType:              'discount',
    rationale:              'A timed popup at 8 seconds hits visitors after they've shown initial interest but before they bounce. Discount offers are the highest-converting hook in your category.',
    expectedConversionRange: '3-5%',
    topBrainBasisCount:     topPattern?.sampleSize ?? 0,
  };
}
```

---

### Form Types — Behavior Reference

| Type | Trigger Options | When to Use |
|------|----------------|-------------|
| Popup | Time delay, exit intent, scroll % | Default — highest conversion, broadest use case |
| Embedded | Always visible (inline in page DOM) | Luxury brands, dedicated landing pages, blog posts |
| Fly-out | Scroll %, time delay, click | Second touchpoint alongside existing popup |
| Full-page | Link click, button | Lead magnet delivery, dedicated acquisition pages |
| Teaser | Immediately (persistent tab) | Low-friction entry — expands on click |

---

### Deployment Options (Step 7)

Three embed methods generated per form. All three always available — user picks what fits their store setup.

```html
<!-- Option A: JavaScript snippet — paste before </body> -->
<!-- Handles popup, flyout, and teaser types automatically -->
<script src="https://forms.viyo.new/embed/form_abc123.js" async></script>

<!-- Option B: Inline embed — paste where you want the form to appear -->
<!-- Used for embedded and full-page types -->
<div data-viyo-form="form_abc123"></div>
<script src="https://forms.viyo.new/embed/loader.js" async></script>

<!-- Option C: Hosted URL — no code required -->
<!-- Good for bio links, ads, QR codes -->
https://forms.viyo.new/f/form_abc123
```

Raw API endpoint for headless/custom builds:
```
POST https://api.viyo.new/forms/form_abc123/submit
Content-Type: application/json
{ "email": "...", "firstName": "...", "phone": "...", "source": "..." }
```

---

### Forms Dashboard (`/forms`)

Per-form metrics shown on the list page:

| Column | Description |
|--------|-------------|
| Form name + type | e.g. "Homepage Exit Popup" |
| Status | Active / Draft / Paused |
| Impressions | Times shown (last 30 days) |
| Submissions | Total opt-ins |
| Conversion rate | Submissions / Impressions |
| Top source page | URL with most submissions |
| ESP sync status | All synced / N failed |

Row actions: Edit / Pause / Duplicate / Delete / View embed code.

---

### Database Schema

The schema is designed to be fully ESP-agnostic. No ESP is hardcoded as a column. Adding a new provider in V3 or beyond requires no migrations.

```typescript
export const forms = pgTable('forms', {
  id:     uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id),
  name:   text('name').notNull(),
  type:   text('type').notNull(),        // popup | embedded | flyout | full_page | teaser
  status: text('status').default('draft'), // draft | active | paused

  // Trigger config
  triggerType:  text('trigger_type'),    // time_delay | exit_intent | scroll_percent | click
  triggerValue: jsonb('trigger_value'),  // { delayMs: 8000 } | { scrollPercent: 60 }

  // Content
  headline:        text('headline'),
  bodyText:        text('body_text'),
  ctaText:         text('cta_text'),
  thankYouMessage: text('thank_you_message'),
  offerType:       text('offer_type'),   // discount | lead_magnet | early_access | none
  offerValue:      text('offer_value'),  // e.g. "10OFF"

  // Fields the form collects
  collectFirstName: boolean('collect_first_name').default(false),
  collectPhone:     boolean('collect_phone').default(false),
  collectBirthday:  boolean('collect_birthday').default(false),

  // Design
  backgroundColor: text('background_color'),
  buttonColor:     text('button_color'),
  imageUrl:        text('image_url'),

  // Tags applied to subscribers on submission
  tags: text('tags').array(),

  // ESP routing — JSONB, not per-ESP columns.
  // Format: { "klaviyo": { "listId": "abc" }, "omnisend": { "listId": "xyz" } }
  // Adding a new ESP in V3+ = add a key to this object. Zero schema migrations.
  // Shape: Record<EspProvider, EspRoutingConfig>
  // e.g. { "klaviyo": { "listId": "abc123" }, "omnisend": { "listId": "xyz789" } }
  espRouting: jsonb('esp_routing'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const formSubscribers = pgTable('form_subscribers', {
  id:          uuid('id').primaryKey().defaultRandom(),
  formId:      uuid('form_id').notNull().references(() => forms.id),
  brandId:     uuid('brand_id').notNull().references(() => brands.id),
  email:       text('email').notNull(),
  firstName:   text('first_name'),
  phone:       text('phone'),
  birthday:    text('birthday'),
  source:      text('source'),           // page URL where submitted
  ipCountry:   text('ip_country'),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

export const formSubmissionErrors = pgTable('form_submission_errors', {
  id:           uuid('id').primaryKey().defaultRandom(),
  formId:       uuid('form_id').notNull(),
  subscriberId: uuid('subscriber_id').notNull(),
  espProvider:  text('esp_provider'),    // which ESP failed — not hardcoded enum
  error:        text('error'),
  retryCount:   integer('retry_count').default(0),
  resolvedAt:   timestamp('resolved_at'),
  createdAt:    timestamp('created_at').defaultNow(),
});

export const formImpressions = pgTable('form_impressions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  formId:      uuid('form_id').notNull().references(() => forms.id),
  sessionId:   text('session_id'),       // anonymous session, for conversion rate calc
  ipCountry:   text('ip_country'),
  sourcePage:  text('source_page'),
  recordedAt:  timestamp('recorded_at').defaultNow(),
});
```

**Why `espRouting` is JSONB and not per-ESP columns:**
- V1 ships with Klaviyo, Omnisend, ActiveCampaign, Mailchimp
- V3 adds more ESPs without touching the schema
- Multi-ESP brands (rare but real) store multiple entries in one column
- The fan-out code reads `form.espRouting[conn.provider]` — no `if/else` branches per ESP

**`EspRoutingConfig` type — shape of each provider entry:**

```typescript
// packages/forms/types.ts

type EspProvider = string;  // free string — 'klaviyo' | 'omnisend' | 'activecampaign' | 'mailchimp' | future

interface EspRoutingEntry {
  listId:         string;          // required — target list/audience ID on the ESP
  tagIds?:        string[];        // optional — additional tags to apply on subscribe
  customFields?:  Record<string, string>;  // optional — ESP-specific field mappings
}

// The full espRouting column value:
type EspRoutingConfig = Record<EspProvider, EspRoutingEntry>;

// Example stored value:
// {
//   "klaviyo":      { "listId": "abc123" },
//   "omnisend":     { "listId": "xyz789", "tagIds": ["welcome"] },
//   "activecampaign": { "listId": "456", "customFields": { "signup_source": "popup" } }
// }
```

When a new ESP adapter is added in V3+, its `EspRoutingEntry` uses the same shape. If an adapter needs provider-specific fields, they go into `customFields` — no schema change required.

---

### Future-Proofing Checklist

Things that must NOT be hardcoded anywhere in the forms system:

| What | Wrong | Right |
|------|-------|-------|
| ESP routing config | Separate column per ESP | `espRouting` JSONB |
| ESP fan-out | `switch (conn.provider)` | `getEspAdapter(conn.provider)` registry |
| ESP error logging | `espProvider: 'klaviyo'` enum | `espProvider: text()` — free string |
| Form types | Checked in multiple places | Single `FORM_TYPES` const, referenced everywhere |
| Trigger types | Same | Single `TRIGGER_TYPES` const |
| Offer types | Same | Single `OFFER_TYPES` const |

Any time a V3 developer adds a new ESP, form type, or trigger, they should touch one file — the registry or constants file — not scan the codebase for every switch statement.

---

### New Pages (V3 — Adds to Section 20L Inventory)

| # | Route | Title | Auth | Notes |
|---|-------|--------|------|-------|
| 58 | `/forms` | Forms Dashboard | Required | List view with conversion stats. Built in V1 (read-only initially). |
| 59 | `/forms/new` | Create Form Wizard | Required | 7-step AI-assisted builder. V3. |
| 60 | `/forms/{id}` | Form Editor | Required | Edit existing form. V3. |
| 61 | `/forms/{id}/analytics` | Form Analytics | Required | Conversion funnel detail. V3. |

**Total frontend pages: 62**

---

### Environment Variables

```env
FORMS_EMBED_BASE_URL="https://forms.viyo.new"
FORMS_API_BASE_URL="https://api.viyo.new/forms"
FORMS_ESP_SYNC_RETRY_LIMIT=3
FORMS_ESP_SYNC_RETRY_DELAY_MS=5000
```

---


## 20T. Infrastructure and Deployment Architecture

VIYO runs on a four-service cloud stack. No self-managed VPS. Every push to `main` auto-deploys to all services with zero manual steps.

---

### The Four-Service Stack

| Service | Role | Tier | Monthly Cost |
|---------|------|------|-------------|
| **Vercel** | Next.js frontend, public-facing routes, lightweight API routes | Pro | $20 |
| **Render** | Backend compute — LLM calls, image generation, crawlers, Inngest worker | Standard+ | $50-85 |
| **Supabase** | PostgreSQL, pgvector, Auth, RLS, Storage, Realtime | Pro | $25 |
| **Inngest** | Job orchestration, background queues, cron scheduling | Cloud | $0-100 |
| **Total** | | | **$95-230/mo** |

Inngest starts free and scales with job volume. Render cost depends on Background Worker tier — `standard` ($25/mo) for early stage, `standard plus` ($85/mo) at scale.

---

### Render Service Definitions

VIYO requires three distinct Render services — not one server doing everything.

#### Service 1: Web Service (`viyo-api`)

Handles: Next.js API routes that are too slow for Vercel's 10s function timeout, SSE streams for onboarding brain builds, form submission endpoints, webhook receivers (Klaviyo, Shopify, Inngest, Crisp).

```yaml
# render.yaml
services:
  - type: web
    name: viyo-api
    runtime: node
    plan: standard
    buildCommand: npm run build
    startCommand: npm run start:server
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
    autoDeploy: true
```

Routes that live here (not on Vercel):
- `POST /api/forms/{formId}/submit` — form submission fan-out
- `GET /api/onboarding/brain-status` — SSE stream
- `POST /api/webhooks/klaviyo`
- `POST /api/webhooks/shopify`
- `POST /api/webhooks/inngest`
- `POST /api/webhooks/crisp`
- `POST /api/preflight/run` — triggers Email on Acid + Haiku check
- `POST /api/generate/compile` — MJML compilation

#### Service 2: Background Worker (`viyo-worker`)

Handles: All Inngest function execution — brain builds, Top Brain crawling, NanoBanana image generation, MCS scoring, competitive intelligence crawls, re-engagement email sends, ESP sync retries. This is a persistent process, never sleeps, no HTTP exposure.

```yaml
  - type: worker
    name: viyo-worker
    runtime: node
    plan: standard
    buildCommand: npm run build:worker
    startCommand: npm run start:worker
    envVars:
      - key: NODE_ENV
        value: production
      - key: INNGEST_EVENT_KEY
        fromGroup: viyo-secrets
      - key: INNGEST_SIGNING_KEY
        fromGroup: viyo-secrets
    autoDeploy: true
```

```typescript
// worker/index.ts — the Inngest worker entry point
import { serve } from 'inngest/node';
import { inngest } from '../lib/inngest';
import { brainBuildFunction } from '../functions/brain-build';
import { topBrainCrawlFunction } from '../functions/top-brain-crawl';
import { nanoBananaFunction } from '../functions/nano-banana';
import { mcsScoreFunction } from '../functions/mcs-score';
import { competitiveIntelFunction } from '../functions/competitive-intel';
import { onboardingReengagementFlow } from '../functions/onboarding-reengagement';
import { insightGenerators } from '../functions/insights';

const handler = serve({
  client: inngest,
  functions: [
    brainBuildFunction,
    topBrainCrawlFunction,
    nanoBananaFunction,
    mcsScoreFunction,
    competitiveIntelFunction,
    onboardingReengagementFlow,
    ...insightGenerators,
  ],
});

// Long-running HTTP listener for Inngest event delivery
import { createServer } from 'http';
const server = createServer(handler);
server.listen(process.env.PORT || 3002);
```

#### Service 3: Cron Jobs (`viyo-cron`)

Scheduled jobs that run on a fixed cadence. Render's native cron service — no always-on process, spins up per execution.

```yaml
  - type: cron
    name: deliverability-metrics-sync
    runtime: node
    schedule: "0 1 * * *"          # Daily at 01:00 UTC
    buildCommand: npm run build
    startCommand: node dist/cron/deliverability-metrics-sync.js

  - type: cron
    name: top-brain-weekly-crawl
    runtime: node
    schedule: "0 3 * * 1"          # Monday 03:00 UTC
    buildCommand: npm run build
    startCommand: node dist/cron/top-brain-crawl.js

  - type: cron
    name: insight-flow-gap-check
    runtime: node
    schedule: "0 7 * * 1"          # Monday 07:00 UTC
    buildCommand: npm run build
    startCommand: node dist/cron/flow-gap-check.js

  - type: cron
    name: competitive-crawl
    runtime: node
    schedule: "0 */4 * * *"        # Every 4 hours
    buildCommand: npm run build
    startCommand: node dist/cron/competitive-crawl.js

  - type: cron
    name: knowledge-base-gap-review
    runtime: node
    schedule: "0 9 * * 1"          # Monday 09:00 UTC
    buildCommand: npm run build
    startCommand: node dist/cron/kb-gap-review.js
```

---

### Vercel Configuration

Frontend-only. Vercel handles: all Next.js pages, static assets, lightweight API routes (auth callbacks, redirect handlers, read-only data fetches under 10s).

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.viyo.new",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "rewrites": [
    {
      "source": "/api/server/:path*",
      "destination": "https://api.viyo.new/:path*"
    }
  ],
  "headers": [
    {
      "source": "/embed/:formId.js",
      "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }]
    }
  ]
}
```

Heavy API routes proxy through to the Render Web Service via the rewrite rule. This means client code always calls `/api/server/...` — never knows or cares which server handled it.

---

### Supabase Configuration

Supabase Pro is the minimum tier for production. Free tier has a 500MB database limit and pauses after 7 days of inactivity — both are incompatible with a production SaaS.

| Supabase Feature | VIYO Use |
|-----------------|---------|
| PostgreSQL (15+) | All application data via Drizzle ORM |
| pgvector extension | Personal Brain embeddings (1536-dim vectors) |
| Auth | User sign-up/sign-in, JWT issuance |
| Row Level Security | Brand data isolation — every brand-linked table has RLS |
| Storage | Brand Asset Vault — product images, NanoBanana enhanced outputs |
| Realtime | Future: live collaboration on email editor |

```sql
-- Enable pgvector on first migration
CREATE EXTENSION IF NOT EXISTS vector;

-- Example RLS policy — applied to every brand-linked table
ALTER TABLE brand_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_isolation" ON brand_insights
  FOR ALL
  USING (brand_id IN (
    SELECT brand_id FROM brand_members
    WHERE user_id = auth.uid()
  ));
```

Drizzle migration command (runs in CI before deployment):
```bash
npx drizzle-kit push --config drizzle.config.ts
```

---

### Environment Separation

Two environments: `staging` and `production`. Staging mirrors production infrastructure at lower tier sizes.

| Resource | Staging | Production |
|----------|---------|-----------|
| Vercel | Preview deployment (auto per PR) | `viyo.new` + `app.viyo.new` |
| Render Web | `api-staging.viyo.new` | `api.viyo.new` |
| Render Worker | Separate worker, staging Inngest key | Separate worker, prod Inngest key |
| Supabase | Separate project (free tier OK for staging) | Pro project |
| Inngest | Staging environment | Production environment |

Staging deploys automatically on every push to `develop`. Production deploys on every push to `main` after CI passes.

Domain structure:
```
viyo.new              → Vercel (marketing landing page)
app.viyo.new          → Vercel (Next.js app)
api.viyo.new          → Render Web Service
forms.viyo.new        → Render Web Service (form embed + submission)
```

---

### GitHub Actions CI/CD Pipeline

One workflow file handles the full deploy pipeline. Vercel and Render both trigger independently via their own GitHub integrations — CI only needs to run tests and migrations.

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test

      - name: Build
        run: npm run build

  migrate:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx drizzle-kit push --config drizzle.config.ts
        env:
          DATABASE_URL: ${{ github.ref == 'refs/heads/main' && secrets.DATABASE_URL_PROD || secrets.DATABASE_URL_STAGING }}

  # Vercel and Render deploy automatically via their GitHub integrations
  # after the migrate job completes successfully
  notify:
    needs: [test, migrate]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"Deploy failed on ${{ github.ref_name }} — ${{ github.event.head_commit.message }}"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_DEPLOY_WEBHOOK }}
```

**What happens on `git push origin main`:**
1. GitHub Actions runs type-check + lint + unit tests (2-3 min)
2. Drizzle migrations run against prod Supabase (30s)
3. Vercel detects the push, builds and deploys frontend (2-3 min)
4. Render detects the push, builds and deploys Web Service + Worker (3-5 min)
5. Slack notification on failure (success is silent)

Total deploy time: 5-8 minutes from push to live. Zero manual steps.

---

### Secrets Management

All secrets stored in GitHub Actions secrets and Render environment groups. Never in code, never in `.env` files committed to the repo.

```
GitHub Secrets (used in CI):
  DATABASE_URL_PROD
  DATABASE_URL_STAGING
  SLACK_DEPLOY_WEBHOOK

Render Environment Group: viyo-secrets (shared across all Render services)
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  GEMINI_API_KEY
  INNGEST_EVENT_KEY
  INNGEST_SIGNING_KEY
  EOA_API_KEY
  LITMUS_API_KEY
  KLAVIYO_CLIENT_SECRET
  SHOPIFY_CLIENT_SECRET
  RESEND_API_KEY
  CRISP_WEBSITE_ID
  FIRECRAWL_API_KEY

Vercel Environment Variables (frontend-safe, all NEXT_PUBLIC_*):
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_API_URL
  NEXT_PUBLIC_POSTHOG_KEY
  NEXT_PUBLIC_CRISP_WEBSITE_ID
```

`SUPABASE_SERVICE_ROLE_KEY` never touches the frontend. Frontend uses only the anon key — RLS handles authorization.

---

### Monitoring and Alerting

| Tool | What It Monitors | Cost |
|------|-----------------|------|
| Render built-in | CPU, memory, crash logs per service | Included |
| Supabase dashboard | Query performance, DB size, auth metrics | Included |
| Inngest dashboard | Job success/failure rates, queue depth, replay | Included |
| Posthog | Frontend analytics, funnel analysis, feature flags | Free tier |
| Sentry | Error tracking across frontend + backend | Free tier |
| UptimeRobot | External uptime checks on all public endpoints | Free |

Alert routing: All alerts go to a dedicated Slack channel (`#viyo-alerts`). Render and Sentry both have native Slack integrations. UptimeRobot sends email + Slack on downtime.

---

### Cost Projection by Stage

| Stage | Monthly Infrastructure Cost | What Changes |
|-------|---------------------------|-------------|
| Pre-launch (0 users) | $95 | Vercel Pro + Render Standard + Supabase Pro |
| Early (1-100 brands) | $120 | Inngest Cloud adds job volume cost |
| Growth (100-500 brands) | $200-300 | Render Worker upgrades, Inngest scales |
| Scale (500+ brands) | $400-800 | Multiple Render workers, Supabase compute add-ons |

Infrastructure cost per brand at 100 brands: ~$1.20/brand/month. At 500 brands: ~$0.60/brand/month. Scales favorably as user base grows.

---

### Environment Variables

```env
# Render Web Service + Worker
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Render services internal routing
WORKER_INTERNAL_URL=https://viyo-worker.internal

# Deployment
VERCEL_TEAM_ID=...
RENDER_API_KEY=...
```

---

## 20U. Platform Agnosticism — Adapter Architecture

VIYO is built as if Shopify and Klaviyo will not exist forever. The engine never calls their APIs directly. It calls a normalized interface. The platform-specific code is a plugin. Swapping Shopify for WooCommerce, or Klaviyo for Omnisend, means writing one new adapter file — not touching core infrastructure.

---

### The Two Adapter Interfaces

**Platform Adapter** — abstracts ecommerce platforms (Shopify, WooCommerce, BigCommerce)

```typescript
// packages/adapters/platform/types.ts

export interface NormalizedProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  category: string;
  tags: string[];
  inventoryCount: number;
  publishedAt: Date;
  isNew: boolean;              // published within last 14 days
  isBestseller: boolean;       // computed from order history
  revenueRank: number;         // 1 = highest revenue in catalog
}

export interface NormalizedOrder {
  id: string;
  customerId: string;
  lineItems: { productId: string; quantity: number; price: number }[];
  totalPrice: number;
  createdAt: Date;
  source: string;              // 'web' | 'pos' | 'mobile'
}

export interface PlatformAdapter {
  getProducts(brandId: string, filters?: ProductFilters): Promise<NormalizedProduct[]>;
  getOrders(brandId: string, since: Date): Promise<NormalizedOrder[]>;
  syncProducts(brandId: string): Promise<SyncResult>;
  validateWebhook(payload: unknown, signature: string): boolean;
  getProductById(brandId: string, productId: string): Promise<NormalizedProduct | null>;
  getInventory(brandId: string, productIds: string[]): Promise<Record<string, number>>;
}
```

**ESP Adapter** — abstracts email service providers (Klaviyo, Omnisend, ActiveCampaign, Mailchimp)

```typescript
// packages/adapters/esp/types.ts

export interface NormalizedSegment {
  id: string;
  name: string;
  size: number;
  type: 'vip' | 'engaged' | 'lapsed' | 'new' | 'custom';
  lastCampaignSentAt: Date | null;
  avgOpenRate: number | null;
}

export interface NormalizedFlow {
  id: string;
  name: string;
  triggerType: 'list_subscribe' | 'checkout_started' | 'order_placed' | 'custom';
  isActive: boolean;
  emailCount: number;
  revenue30d: number | null;
}

export interface CampaignDeployPayload {
  subject: string;
  previewText: string;
  htmlContent: string;
  plainTextContent: string;
  segmentId: string;
  scheduledAt?: Date;           // null = draft, not scheduled
  abVariants?: ABVariant[];
}

export interface ESPAdapter {
  getSegments(brandId: string): Promise<NormalizedSegment[]>;
  getFlows(brandId: string): Promise<NormalizedFlow[]>;
  getPerformanceMetrics(brandId: string, since: Date): Promise<PerformanceData>;
  getCampaigns(brandId: string, limit: number): Promise<NormalizedCampaign[]>;
  deployCampaign(brandId: string, campaign: CampaignDeployPayload): Promise<DeployResult>;
  scheduleABTest(brandId: string, variants: ABVariant[]): Promise<ABTestResult>;
  getSubscriberProfile(brandId: string, email: string): Promise<NormalizedSubscriberProfile>;
  syncSubscriber(brandId: string, subscriber: SubscriberPayload): Promise<void>;
}
```

---

### Monorepo Package Structure

```
packages/
  adapters/
    platform/
      types.ts                  # NormalizedProduct, NormalizedOrder, PlatformAdapter interface
      shopify/
        index.ts                # Shopify implementation of PlatformAdapter
        webhooks.ts             # Shopify webhook validation + event normalization
        oauth.ts                # Shopify OAuth flow
      woocommerce/
        index.ts                # Future — same interface, different code
      bigcommerce/
        index.ts                # Future
    esp/
      types.ts                  # NormalizedSegment, CampaignDeployPayload, ESPAdapter interface
      klaviyo/
        index.ts                # Klaviyo implementation of ESPAdapter
        webhooks.ts
        oauth.ts
      omnisend/
        index.ts                # Future
      activecampaign/
        index.ts                # Future
      mailchimp/
        index.ts                # Future
  core/
    brain/                      # Personal Brain — calls adapters, never raw APIs
    generation/                 # Campaign generation — calls adapters, never raw APIs
    insights/                   # Insight generators — calls adapters, never raw APIs
  app/                          # Next.js application
  worker/                       # Inngest worker
```

**Rule enforced at code review:** Nothing in `packages/core/` or `packages/app/` may import from `packages/adapters/platform/shopify/` or `packages/adapters/esp/klaviyo/` directly. Core code imports only from `packages/adapters/platform/types.ts` and `packages/adapters/esp/types.ts`. ESLint rule enforces this at CI time.

---

### How the Brain Uses Adapters

The Personal Brain never knows or cares which platform is connected. It calls the normalized interface. The adapter resolves it.

```typescript
// packages/core/brain/personal-brain.ts

import { getPlatformAdapter } from '../adapters/platform';
import { getESPAdapter } from '../adapters/esp';

export async function buildPersonalBrain(brandId: string): Promise<BrainBuildResult> {
  const brand = await getBrand(brandId);

  // Get the right adapters for this brand's connected platforms
  const platformAdapter = getPlatformAdapter(brand.platformProvider);  // 'shopify' | 'woocommerce'
  const espAdapter = getESPAdapter(brand.espProvider);                  // 'klaviyo' | 'omnisend'

  // Core logic is identical regardless of which platform is connected
  const [products, orders, segments, flows, campaigns] = await Promise.all([
    platformAdapter.getProducts(brandId),
    platformAdapter.getOrders(brandId, subDays(new Date(), 90)),
    espAdapter.getSegments(brandId),
    espAdapter.getFlows(brandId),
    espAdapter.getCampaigns(brandId, 50),
  ]);

  // ... rest of brain build logic unchanged across all platforms
}
```

---

### Adapter Registration

New adapters are registered in a single factory file. No other code changes required.

```typescript
// packages/adapters/platform/index.ts
import { ShopifyAdapter } from './shopify';

const PLATFORM_ADAPTERS: Record<string, PlatformAdapter> = {
  shopify: new ShopifyAdapter(),
  // woocommerce: new WooCommerceAdapter(),    // uncomment to add
  // bigcommerce: new BigCommerceAdapter(),    // uncomment to add
};

export function getPlatformAdapter(provider: string): PlatformAdapter {
  const adapter = PLATFORM_ADAPTERS[provider];
  if (!adapter) throw new Error(`No platform adapter registered for: ${provider}`);
  return adapter;
}

// packages/adapters/esp/index.ts
import { KlaviyoAdapter } from './klaviyo';

const ESP_ADAPTERS: Record<string, ESPAdapter> = {
  klaviyo: new KlaviyoAdapter(),
  // omnisend: new OmnisendAdapter(),          // uncomment to add
  // activecampaign: new ActiveCampaignAdapter(),
};

export function getESPAdapter(provider: string): ESPAdapter {
  const adapter = ESP_ADAPTERS[provider];
  if (!adapter) throw new Error(`No ESP adapter registered for: ${provider}`);
  return adapter;
}
```

---

### Extending to a New Platform — What It Takes

Adding WooCommerce as a supported platform:

1. Create `packages/adapters/platform/woocommerce/index.ts` — implement `PlatformAdapter`
2. Register it in `packages/adapters/platform/index.ts` — one line
3. Add WooCommerce OAuth flow in `packages/adapters/platform/woocommerce/oauth.ts`
4. Add `'woocommerce'` to the `platformProvider` enum in the `brands` DB table
5. Add WooCommerce as a connection option on `/onboarding/connect`

Zero changes to: brain build, generation pipeline, insight generators, competitive intelligence, VIYO Max tools, pre-flight checker, or any core product logic.

---

### Fashion-First, Not Fashion-Only

The same principle applies to verticals. VIYO's prompts, Top Brain corpus, and pattern library are initialised with fashion/lifestyle/apparel data — but the underlying architecture is vertical-agnostic. Vertical is a configuration parameter, not a hardcoded assumption.

```typescript
// Vertical configuration — controls prompt tone, benchmark data, insight thresholds
export interface VerticalConfig {
  id: string;                      // 'fashion' | 'beauty' | 'home' | 'food'
  displayName: string;
  defaultSendTime: string;         // e.g. '10:00 AM EST'
  benchmarks: {
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
  };
  topBrainCorpusTags: string[];    // which Top Brain brands are relevant
  promptToneGuide: string;         // injected into generation prompts
}

const VERTICAL_CONFIGS: Record<string, VerticalConfig> = {
  fashion: {
    id: 'fashion',
    displayName: 'Fashion & Apparel',
    defaultSendTime: '10:00 AM EST',
    benchmarks: { openRate: 0.21, clickRate: 0.025, unsubscribeRate: 0.002 },
    topBrainCorpusTags: ['fashion', 'apparel', 'streetwear', 'luxury', 'activewear'],
    promptToneGuide: 'Brand voice should reflect editorial fashion sensibility...',
  },
  // beauty, home, food: add here
};
```

At launch: fashion vertical only, fully built. New verticals require: a new `VerticalConfig` entry, Top Brain corpus expansion for that vertical, and benchmark data. No core code changes.

---

## 20V. Skills Registry — Adding Capabilities Without Breaking the Brain

### Why This Section Exists

The `skills_registry` table is defined in the schema, the Email Marketing Bible is stored in it, and the admin UI at `/admin/skills` lets Nir manage it. But the spec stops there. It never answers:

- What skill types exist and what does each one do?
- How does the Brain decide which skills to load for a given generation?
- What happens when two skills give conflicting instructions?
- How does a developer add a new skill safely without risking live generations?

Without answers to these, every new skill is a guess, and guesses cause regressions. This section closes that gap.

---

### The Core Guarantee

**Adding a skill to VIYO never requires changing Brain core code.** The Brain queries the `skills_registry` table at assembly time. New skills are rows. Existing rows are untouched. The only way a new skill can break something is if it injects conflicting instructions into the prompt — which the composition rules below prevent.

---

### Skill Types (The `skill_type` Enum)

Every row in `skills_registry` has a `skill_type`. This controls when the Brain loads it, where it gets injected in the prompt, and how conflicts are resolved.

```typescript
export type SkillType =
  | 'context_block'      // Background knowledge. Always loaded, injected into Layer 1 (system prompt).
                         // Example: email_bible, brand_voice_doctrine
  | 'generation_rule'    // Hard rules the Brain must follow. Loaded before generation, injected after context.
                         // Example: no_spam_triggers, unsubscribe_required, link_limit
  | 'tone_modifier'      // Adjusts the brand voice for a specific context.
                         // Loaded conditionally (by campaign type or segment). Injected last.
                         // Example: vip_tone, reengagement_tone, holiday_warmth
  | 'seasonal_overlay'   // Time-boxed content intelligence. Loaded if date falls within active_from/active_to.
                         // Example: black_friday_2024, valentines_2025
  | 'format_enforcer'    // Template and layout rules. Loaded per template type.
                         // Example: single_product_format, grid_format_rules
  | 'vertical_doctrine'; // Vertical-specific generation guidance. Loaded by brand vertical tag.
                         // Example: fashion_email_doctrine, beauty_email_doctrine
```

**Loading order matters:** `context_block` loads first, then `generation_rule`, then `vertical_doctrine`, then `format_enforcer`, then `tone_modifier`, then `seasonal_overlay`. Later types have higher specificity and override earlier ones on conflicts.

---

### Updated `skills_registry` Schema

The existing schema needs two additions: `active_from` / `active_to` for seasonal skills and a `conditions` field for conditional loading logic.

```typescript
// Migration: add to existing skills_registry table
export const skillsRegistry = pgTable('skills_registry', {
  id:               text('id').primaryKey(),           // 'email_bible@1.0.0', 'black_friday@2024.1.0'
  skill_key:        text('skill_key').notNull(),        // stable identifier without version, e.g. 'email_bible'
  version:          text('version').notNull(),
  skill_type:       text('skill_type').notNull(),       // one of the 6 types above
  owner:            text('owner').notNull(),            // 'internal' | external provider name
  prompt_body:      text('prompt_body').notNull(),      // the actual instructions / context
  expected_inputs:  jsonb('expected_inputs').notNull(), // what context this skill needs to be useful
  expected_outputs: jsonb('expected_outputs').notNull(),// what this skill contributes to the brief
  token_footprint:  integer('token_footprint').notNull(),
  conditions:       jsonb('conditions'),                // optional: { campaign_type, segment_tag, template_type }
  active_from:      timestamp('active_from'),           // for seasonal_overlay only
  active_to:        timestamp('active_to'),             // for seasonal_overlay only
  is_enabled:       boolean('is_enabled').default(false).notNull(), // must be explicitly enabled after testing
  created_at:       timestamp('created_at').defaultNow().notNull(),
  updated_at:       timestamp('updated_at').defaultNow().notNull(),
});
```

**Key rule:** `is_enabled` defaults to `false`. New skills are inserted disabled, tested in shadow mode, then enabled. This is what prevents new skills from affecting live generations.

---

### Brain Context Assembly — `assembleSkillContext()`

This is the function that runs before every generation. It queries `skills_registry`, applies conditions, respects the token budget, and returns ordered context blocks.

```typescript
// apps/api/src/brain/assembleSkillContext.ts

import { db } from '@/db';
import { skillsRegistry } from '@/db/schema';
import { and, eq, isNull, lte, gte, or } from 'drizzle-orm';

export type AssemblyContext = {
  brand: {
    id: string;
    vertical: string;       // e.g. 'fashion'
  };
  campaign: {
    type: string;           // e.g. 'new_arrivals', 'flash_sale', 'reengagement'
    templateType: string;   // e.g. 'single_product', 'grid', 'editorial'
    segmentTag?: string;    // e.g. 'vip', 'at_risk'
  };
  tokenBudget: number;      // max tokens available for skills in this generation
};

const SKILL_TYPE_ORDER: SkillType[] = [
  'context_block',
  'generation_rule',
  'vertical_doctrine',
  'format_enforcer',
  'tone_modifier',
  'seasonal_overlay',
];

export async function assembleSkillContext(ctx: AssemblyContext): Promise<string> {
  const now = new Date();

  // Load all enabled skills
  const skills = await db
    .select()
    .from(skillsRegistry)
    .where(eq(skillsRegistry.is_enabled, true));

  // Filter by conditions
  const applicable = skills.filter(skill => {
    // Seasonal: must fall within active window
    if (skill.skill_type === 'seasonal_overlay') {
      if (!skill.active_from || !skill.active_to) return false;
      if (now < skill.active_from || now > skill.active_to) return false;
    }

    // Condition matching: if conditions exist, all must match
    if (skill.conditions) {
      const c = skill.conditions as Record<string, string>;
      if (c.vertical && c.vertical !== ctx.brand.vertical) return false;
      if (c.campaign_type && c.campaign_type !== ctx.campaign.type) return false;
      if (c.template_type && c.template_type !== ctx.campaign.templateType) return false;
      if (c.segment_tag && c.segment_tag !== ctx.campaign.segmentTag) return false;
    }

    return true;
  });

  // Sort by type order (context_block first, seasonal_overlay last)
  applicable.sort(
    (a, b) =>
      SKILL_TYPE_ORDER.indexOf(a.skill_type as SkillType) -
      SKILL_TYPE_ORDER.indexOf(b.skill_type as SkillType)
  );

  // Respect token budget — drop lowest-priority skills if over budget
  let tokenUsed = 0;
  const selected = applicable.filter(skill => {
    if (tokenUsed + skill.token_footprint > ctx.tokenBudget) return false;
    tokenUsed += skill.token_footprint;
    return true;
  });

  // Assemble into prompt string
  return selected
    .map(skill => `<${skill.skill_key}>\n${skill.prompt_body}\n</${skill.skill_key}>`)
    .join('\n\n');
}
```

**Where it's called:** In the CMO Brain system prompt assembly, immediately before the brand context block. The output of `assembleSkillContext()` occupies the Layer 1 slot described in Section 7.

---

### Conflict Resolution Rules

When two skills give conflicting instructions (e.g. `email_bible` says "use 3 CTAs maximum" and a new skill says "always include 5 product links"), the resolution is deterministic:

1. **Later skill type wins.** Loading order is the priority order. `seasonal_overlay` beats `tone_modifier` beats `format_enforcer`, etc.
2. **More specific conditions win.** A skill with `{ campaign_type: 'flash_sale' }` beats a skill with no conditions, even if both are `tone_modifier` type.
3. **Higher version wins** when two skills have the same `skill_key` and both are enabled. The system only loads the highest version — never both.
4. **Brand-level overrides global.** If a brand has a custom skill in `skills_registry` with `conditions: { brand_id: 'xyz' }`, it always beats the global version.

**ESLint rule to prevent direct skill references in Brain code:**

```javascript
// .eslintrc.js — add to existing rules
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['*/skills-registry/*'],
    message: 'Do not import skills directly. Use assembleSkillContext() instead.',
  }],
}],
```

---

### Skills Shipped at V1 Launch

These 6 skills are inserted at build time via the seed migration script:

| `skill_key` | `skill_type` | Always loaded? | Token estimate | Notes |
|---|---|---|---|---|
| `email_bible` | `context_block` | Yes | ~8,000 | The 65K-word doctrine, chunked and prompt-cached |
| `generation_rules_v1` | `generation_rule` | Yes | ~400 | Hard rules: unsubscribe required, no spam triggers, max 3 CTAs |
| `fashion_doctrine` | `vertical_doctrine` | When vertical=fashion | ~600 | Fashion-specific tone and product framing guidance |
| `single_product_format` | `format_enforcer` | When template=single_product | ~300 | Layout and hierarchy rules for single-product emails |
| `grid_format` | `format_enforcer` | When template=grid | ~300 | Layout rules for multi-product grid emails |
| `reengagement_tone` | `tone_modifier` | When segment=at_risk | ~200 | Softer tone, no pressure, re-earn trust framing |

Total token budget for skills: 10,000 tokens (soft cap). `assembleSkillContext()` trims from the bottom if over.

---

### Adding a New Skill — 5 Steps

This is the complete process. No core code changes required at any step.

**Step 1 — Write the skill**

Create a seed migration file at `packages/db/migrations/skills/YYYY-MM-DD-skill-name.sql`:

```sql
INSERT INTO skills_registry (
  id, skill_key, version, skill_type, owner,
  prompt_body, expected_inputs, expected_outputs,
  token_footprint, conditions, is_enabled
) VALUES (
  'holiday_warmth_tone@1.0.0',
  'holiday_warmth_tone',
  '1.0.0',
  'tone_modifier',
  'internal',
  'Inject warmth and gifting energy into the email tone. Reference the season explicitly. 
   Use language that evokes giving, celebration, and limited-time urgency without pressure.',
  '{"campaign_type": "required", "segmentTag": "optional"}',
  '{"tone_adjustment": "warm, celebratory, gift-focused"}',
  180,
  '{"campaign_type": "holiday"}',
  false   -- disabled by default
);
```

**Step 2 — Run the migration**

```bash
cd packages/db
bun run db:migrate
```

Confirm the row exists and `is_enabled = false`.

**Step 3 — Shadow test**

Before enabling, generate 3-5 emails with this skill force-loaded (bypass the `is_enabled` filter in a local dev environment). Review output for:
- Does the prompt body inject cleanly without syntax breaking the assembled prompt?
- Does the tone match what the skill description says?
- Does token footprint estimate match actual usage? (check LLM provider response headers)
- Any conflicts with `email_bible` or `generation_rules_v1`?

**Step 4 — Enable**

```sql
UPDATE skills_registry SET is_enabled = true WHERE skill_key = 'holiday_warmth_tone';
```

Or toggle in the Admin UI at `/admin/skills`.

**Step 5 — Monitor**

Watch generation quality metrics for 48 hours after enabling (Inngest dashboard + Supabase logs). If quality degrades (open rates drop, feedback scores fall), disable immediately:

```sql
UPDATE skills_registry SET is_enabled = false WHERE skill_key = 'holiday_warmth_tone';
```

Rollback takes effect on the next generation — no deployment needed.

---

### Versioning a Skill

To update an existing skill without breaking live generations:

```sql
-- 1. Insert the new version as disabled
INSERT INTO skills_registry (...) VALUES ('email_bible@2.0.0', 'email_bible', '2.0.0', ..., false);

-- 2. Shadow test the new version
-- (see Step 3 above)

-- 3. Atomic swap: disable old, enable new in a single transaction
BEGIN;
  UPDATE skills_registry SET is_enabled = false WHERE skill_key = 'email_bible' AND version = '1.0.0';
  UPDATE skills_registry SET is_enabled = true  WHERE skill_key = 'email_bible' AND version = '2.0.0';
COMMIT;
```

The Brain's highest-version-wins rule (conflict resolution rule #3 above) ensures only the new version is loaded after the swap.

---

### Skills the Admin UI Manages (`/admin/skills`)

The skill registry page at `/admin/skills` (already listed in the admin page table, Section G6) needs these capabilities:

| Action | How |
|---|---|
| View all skills | Table: `skill_key`, `version`, `skill_type`, `is_enabled`, `token_footprint`, `conditions` |
| Enable / disable | Toggle `is_enabled` in-place — takes effect next generation |
| View prompt body | Expandable row — shows full `prompt_body` and `expected_inputs/outputs` |
| View token impact | Running total: sum of all enabled skills' `token_footprint` vs. 10,000 cap |
| Add skill | Form: paste SQL or upload migration file |
| Version history | All rows for a given `skill_key`, sorted by version desc |

The total token impact bar is the most important UI element — it tells Nir whether adding a new skill will push the Brain over budget and force token trimming.

---

### What Skills Are NOT

Skills are not agents. They do not call external APIs, run code, or produce output on their own. They are prompt fragments that shape what the Brain says during generation. If a capability requires calling an external API (e.g. pulling real-time product data, checking inventory), that is a Brain Tool (see Section 5, Tool Calls), not a skill.

| | Skill | Brain Tool |
|---|---|---|
| What it is | Prompt fragment in `skills_registry` | TypeScript function the Brain calls |
| What it does | Shapes generation behavior | Fetches live data or performs an action |
| How to add | Insert a row | Write a function, register it in `brainTools.ts` |
| Risk | Low (additive) | Medium (code change required) |
| Example | `holiday_warmth_tone` | `getProductInventory()`, `getSegmentSize()` |

Keep skills as prompt fragments. Reach for Brain Tools only when live data is required.

---

At launch: 6 skills pre-loaded, all tested, all enabled. Every new skill follows the 5-step process. The Admin UI is the only surface for enabling or disabling skills in production — no deployments, no code changes.

---

## 20W. Flow Recommendation System — Proactive Intelligence, User-Controlled Action

### Why This Section Exists (and What the Prior Design Got Wrong)

Section 20A described a flow generation system that auto-generates flows the moment a gap is detected. That is the wrong default. Auto-generating emails without explicit user intent removes agency, creates distrust, and puts unsanctioned content in a brand's Klaviyo account. It is the kind of behavior that causes users to revoke OAuth access.

The correct model:

**VIYO detects gaps proactively. Users decide what to build.**

Auto-generation exists — but only after the user has either (a) explicitly opted into it through a settings toggle, or (b) walked through the Flow Auditor and approved a build list. The default experience is recommendation, not action.

This section specifies the three components that make up the flow intelligence layer, how they connect to each other, and how they connect to the rest of VIYO.

---

### The Three-Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLOW RECOMMENDATION SYSTEM                     │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐   │
│  │  FLOW RECOMMENDATION│    │       FLOW AUDITOR           │   │
│  │       CENTER        │    │   (user-initiated)           │   │
│  │                     │    │                              │   │
│  │  Always-on surface  │    │  Structured health check     │   │
│  │  Gap cards ranked   │◄───│  Scores full flow stack      │   │
│  │  by revenue impact  │    │  Outputs ranked build list   │   │
│  │                     │    │  Gateway to bulk generation  │   │
│  └──────────┬──────────┘    └──────────────┬───────────────┘   │
│             │                              │                    │
│             └──────────────┬───────────────┘                    │
│                            ▼                                    │
│                 ┌─────────────────────┐                         │
│                 │   FLOW GENERATOR    │                         │
│                 │                     │                         │
│                 │  Pipeline from 20A  │                         │
│                 │  Fires ONLY when:   │                         │
│                 │  • User clicks      │                         │
│                 │    "Build this"     │                         │
│                 │  • Post-Auditor     │                         │
│                 │    approval         │                         │
│                 │  • Auto-generate    │                         │
│                 │    opt-in (off by   │                         │
│                 │    default)         │                         │
│                 └─────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

The FRC and Auditor are always available. The Generator only fires on explicit user intent. This is non-negotiable.

---

### Component 1 — Flow Recommendation Center (FRC)

**Route:** `/flows`

**What it is:** A persistent, always-on surface that surfaces flow gaps as actionable recommendation cards. It is not a one-time onboarding screen. It evolves as the brand's Klaviyo data changes — new gaps appear, resolved gaps disappear, revenue estimates update.

**What it is not:** A list of generic "best practice" suggestions. Every card is backed by this brand's actual performance data and vertical benchmarks. Cards that don't apply to this brand's situation are never shown.

---

#### FRC Card Anatomy

Each card represents one flow opportunity. Cards are ranked by `revenue_impact_score` (highest first).

```typescript
interface FlowRecommendationCard {
  id: string;
  flow_type: string;                  // 'welcome_series' | 'abandoned_cart' | etc.
  title: string;                      // e.g. "You're missing an Abandoned Cart flow"
  why_it_matters: string;             // 1-2 sentences, brand-specific
  revenue_estimate: string;           // e.g. "Typically recovers 8-12% of abandoned carts"
  revenue_impact_score: number;       // 0-100, used for card ranking
  urgency_level: 'critical' | 'high' | 'medium' | 'low';
  effort_estimate: string;            // e.g. "3 emails · ~45 seconds to generate"
  benchmark_stat?: string;            // e.g. "Brands like yours average $4.20 RPR from this flow"
  data_backing: string[];             // bullet points proving the gap is real
  status: 'pending' | 'snoozed' | 'dismissed' | 'building' | 'built';
  snoozed_until?: Date;
  built_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Example card — Abandoned Cart:**
```
┌─────────────────────────────────────────────────────┐
│  ⚡  HIGH PRIORITY                                   │
│                                                     │
│  You're missing an Abandoned Cart flow              │
│                                                     │
│  Your checkout abandonment rate is 68% — above     │
│  the 61% fashion vertical average. A 3-email       │
│  recovery sequence typically recovers 8-12% of     │
│  those carts.                                       │
│                                                     │
│  Brands like yours average $4.20 per recipient     │
│  from this flow. With 847 monthly abandons,        │
│  that's ~$3,570/month currently unrealized.        │
│                                                     │
│  Why we know this:                                  │
│  • 0 active flows with trigger: checkout_started   │
│  • 847 checkout_started events in last 30 days     │
│  • 0 recovery emails sent in last 30 days          │
│                                                     │
│  3 emails · ~45 seconds to generate                │
│                                                     │
│  [Build this flow →]  [Snooze 30 days]  [Dismiss]  │
└─────────────────────────────────────────────────────┘
```

---

#### FRC Priority Algorithm

Cards are ranked by `revenue_impact_score`, computed as:

```typescript
function computeRevenueImpactScore(
  flowType: string,
  brandData: BrandFlowData,
  verticalConfig: VerticalConfig
): number {
  const weights = {
    // Base revenue importance by flow type (vertical benchmarks)
    flow_type_weight: FLOW_REVENUE_WEIGHTS[flowType],    // 0-40 pts
    // How far this brand is from benchmark (their gap vs. peers)
    gap_severity: computeGapSeverity(flowType, brandData, verticalConfig), // 0-30 pts
    // Volume signal: how many triggers fire per month with no flow catching them
    trigger_volume: computeTriggerVolume(flowType, brandData), // 0-20 pts
    // Recency: how long the gap has existed
    gap_age: computeGapAge(flowType, brandData),         // 0-10 pts
  };

  return Math.min(100,
    weights.flow_type_weight +
    weights.gap_severity +
    weights.trigger_volume +
    weights.gap_age
  );
}

// Base weights by flow type — from vertical revenue benchmarks
const FLOW_REVENUE_WEIGHTS: Record<string, number> = {
  welcome_series:       38,  // Highest — every new subscriber is a missed touchpoint
  abandoned_cart:       36,  // Very high — direct revenue recovery
  post_purchase:        28,  // High — LTV and repeat purchase driver
  win_back:             22,  // Medium-high — large addressable segment
  browse_abandonment:   18,  // Medium — lower intent but high volume
  vip_welcome:          16,  // Medium — retention of highest-value segment
  sunset:               10,  // Lower — retention mechanics, not direct revenue
};
```

---

#### FRC User Actions

| Action | What happens |
|---|---|
| **Build this flow →** | Routes to `/flows/generate?type={flowType}` — pre-fills brief from brand data, enters Flow Generator |
| **Snooze 30 days** | Sets `snoozed_until = now + 30d`, card moves to a collapsed "Snoozed" section at the bottom of FRC |
| **Dismiss** | Sets `status = 'dismissed'`, card permanently removed. Requires confirmation: "Are you sure? We won't surface this again." |
| **See details** | Expands card in-place — shows full `data_backing` list, comparable brand examples, timing recommendation |

Snoozed cards resurface automatically after the snooze period. Dismissed cards can be restored from `/settings/flows → Dismissed Recommendations`.

---

#### How FRC Populates — The Gap Detection Worker

The FRC is not populated manually. A scheduled Inngest cron job (`flow.gap-detection`, runs daily) analyzes each brand's Klaviyo flow stack and updates `flow_recommendations`.

```typescript
// apps/worker/src/jobs/flow-gap-detection.ts

export const flowGapDetectionJob = inngest.createFunction(
  { id: 'flow-gap-detection', name: 'Daily flow gap detection' },
  { cron: '0 9 * * *' }, // 9am UTC daily
  async ({ event, step }) => {

    const brands = await step.run('fetch-active-brands', async () =>
      db.select().from(brands).where(eq(brands.klaviyo_connected, true))
    );

    for (const brand of brands) {
      await step.run(`analyze-${brand.id}`, async () => {

        const [existingFlows, triggerVolumes, segmentSizes] = await Promise.all([
          getKlaviyoFlows(brand.id),
          getKlaviyoTriggerVolumes(brand.id),   // how often each trigger fires per month
          getKlaviyoSegmentSizes(brand.id),
        ]);

        const verticalConfig = await getVerticalConfig(brand.primary_vertical_key);

        for (const flowType of FLOW_TYPES) {
          const hasFlow = existingFlows.some(f => f.trigger_type === FLOW_TRIGGERS[flowType]);
          if (hasFlow) {
            // Flow exists — mark as built if recommendation card was pending
            await upsertFlowRecommendation(brand.id, flowType, 'built');
            continue;
          }

          const impactScore = computeRevenueImpactScore(flowType, {
            triggerVolume: triggerVolumes[flowType] ?? 0,
            segmentSize: segmentSizes[flowType] ?? 0,
            gapAge: await getGapAge(brand.id, flowType),
          }, verticalConfig);

          await upsertFlowRecommendation(brand.id, flowType, 'pending', {
            revenue_impact_score: impactScore,
            urgency_level: scoreToUrgency(impactScore),
            benchmark_stat: verticalConfig.flow_benchmarks[flowType],
            data_backing: buildDataBacking(flowType, triggerVolumes, segmentSizes, existingFlows),
          });
        }
      });
    }
  }
);
```

**When gap detection fires a notification:**
Not every gap update sends a notification. The notification fires only when:
- A new gap is detected for the first time (not previously in `flow_recommendations`)
- An existing gap's `revenue_impact_score` increases by more than 15 points (trigger volume grew)
- A snoozed recommendation resurfaces

Notification copy: *"Your Abandoned Cart flow gap grew — 1,100 abandoned checkouts in the last 30 days with no recovery sequence. Ready to build it?"*

---

### Component 2 — Flow Auditor

**Route:** `/flows/audit`

**What it is:** A user-initiated, structured diagnostic experience. The user opens it when they want a complete picture of their flow health — not just gap detection, but a scored assessment of every flow type against vertical benchmarks.

**When it appears:** Not automatically. Entry points are:
- Button on the FRC page: "Run a full flow audit →"
- Onboarding Step 7 ("What to build next") — if 3+ flow gaps detected
- VIYO Max tool: "Audit my flows"
- Smart Insights dashboard Flow Health card: "See full audit →"

**What makes it different from the FRC:** The FRC shows individual gap cards. The Auditor shows the complete picture: flows that are working well, flows that are underperforming, flows that are missing, and a scored health rating for the entire stack.

---

#### Flow Auditor — 5-Step Wizard

```
Step 1 — Stack Overview
    Current state: "You have 2 of 7 recommended flows active."
    Visual grid showing all 7 flow types: active (green) / missing (red) / partial (amber)
    Summary: Flow Health Score (computed before user advances)
    CTA: "See what each flow is doing for you →"

Step 2 — Welcome & Nurture Assessment
    Checks: welcome_series, vip_welcome
    For each: current performance vs. benchmark, missing, or not applicable
    Score contribution shown: "+12 pts / 20 possible"

Step 3 — Recovery Flows Assessment
    Checks: abandoned_cart, browse_abandonment
    Highest revenue impact section — flagged prominently if either is missing
    Shows: trigger volume per month and estimated unrealized revenue

Step 4 — Post-Purchase & Retention Assessment
    Checks: post_purchase, win_back, sunset
    Shows: LTV curve data if available — brands with post_purchase flow vs. without

Step 5 — Audit Report
    Full report: Flow Health Score, ranked recommendations, estimated total revenue impact
    "Generate All Recommended Flows" CTA (approves the build list)
    Individual "Build" buttons per flow type
    "Download Report" option (PDF)
```

---

#### Flow Health Score

The Flow Health Score (0-100) is the Auditor's primary output. It appears on the FRC as a persistent widget and in Smart Insights.

```typescript
interface FlowHealthScore {
  total: number;            // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    welcome_nurture:   number;  // max 25
    recovery:          number;  // max 30 (highest weight — direct revenue)
    post_purchase:     number;  // max 25
    retention:         number;  // max 20
  };
  missing_flows: string[];
  underperforming_flows: string[];  // active but below vertical benchmark
  strong_flows: string[];           // active and above benchmark
  estimated_monthly_gap: string;    // "$4,200/month" — total across all gaps
}

function computeFlowHealthScore(
  activeFlows: KlaviyoFlow[],
  flowMetrics: FlowMetrics,
  verticalConfig: VerticalConfig
): FlowHealthScore {
  let score = 0;
  const missing: string[] = [];
  const underperforming: string[] = [];
  const strong: string[] = [];

  // Welcome & Nurture (25 pts)
  const welcomeFlow = activeFlows.find(f => f.trigger_type === 'list_subscribe');
  if (!welcomeFlow) {
    missing.push('welcome_series');
  } else {
    const welcomeScore = welcomeFlow.open_rate >= verticalConfig.benchmarks.welcome_open_rate
      ? 25
      : Math.round(25 * (welcomeFlow.open_rate / verticalConfig.benchmarks.welcome_open_rate));
    score += welcomeScore;
    welcomeScore >= 20 ? strong.push('welcome_series') : underperforming.push('welcome_series');
  }

  // Recovery Flows (30 pts)
  const cartFlow = activeFlows.find(f => f.trigger_type === 'checkout_started');
  if (!cartFlow) {
    missing.push('abandoned_cart');
  } else {
    const cartScore = computeFlowScore(cartFlow, verticalConfig.benchmarks.cart_recovery_rate, 20);
    score += cartScore;
    cartScore >= 16 ? strong.push('abandoned_cart') : underperforming.push('abandoned_cart');
  }

  const browseFlow = activeFlows.find(f => f.trigger_type === 'viewed_product');
  if (!browseFlow) {
    missing.push('browse_abandonment');
    // Don't penalize as hard — lower priority than cart
  } else {
    score += computeFlowScore(browseFlow, verticalConfig.benchmarks.browse_recovery_rate, 10);
  }

  // (Post-purchase and retention follow same pattern)

  return {
    total: Math.min(100, score),
    grade: scoreToGrade(score),
    breakdown: { /* ... */ },
    missing_flows: missing,
    underperforming_flows: underperforming,
    strong_flows: strong,
    estimated_monthly_gap: computeEstimatedGap(missing, verticalConfig),
  };
}
```

---

#### Post-Auditor Actions

After the Auditor completes, the user sees their Report screen with three options:

**Option A — Generate All Recommended Flows (bulk)**
Clicking this shows a confirmation screen:
```
Generate all 4 recommended flows?

  ✓ Welcome Series (3 emails)
  ✓ Abandoned Cart (3 emails)
  ✓ Post-Purchase (4 emails)
  ✓ Win-Back (3 emails)

  13 emails total · 13,000 credits · ~2-3 minutes

  [Confirm & Generate All]  [Select individually]
```
This is the sanctioned path to bulk generation. The user has reviewed the audit, seen the evidence, and approved the list. VIYO runs the Flow Generator for each flow type in parallel. Credits are reserved per flow, committed on success, refunded per-flow on failure.

**Option B — Build individually**
Each recommended flow has its own "Build →" button. Routes to Flow Generator for that flow type only.

**Option C — Enable Auto-Generate (opt-in)**
A non-prominent toggle at the bottom of the report: *"Enable automatic flow generation — VIYO will build and draft recommended flows automatically when gaps are detected."* Clicking it routes to `/settings/flows` for explicit configuration.

---

### Component 3 — Flow Generator (Trigger Rules)

The Flow Generator pipeline from Section 20A is unchanged. What changes is the trigger rules. The pipeline only fires when one of these conditions is met:

```typescript
type FlowGeneratorTrigger =
  | 'user_frc_click'        // User clicked "Build this flow" on an FRC card
  | 'user_auditor_single'   // User clicked "Build" on an individual flow in the Auditor
  | 'user_auditor_bulk'     // User approved "Generate All Recommended Flows" post-Auditor
  | 'auto_generate_notify'  // Auto-generate Mode A: gap detected, user confirmed via notification
  | 'auto_generate_direct'; // Auto-generate Mode B: gap detected, user has opted in fully
```

Any code path that calls the flow generation pipeline must pass a `trigger` value. If `trigger` is undefined or not in this enum, the pipeline throws before reserving any credits. This is the hard enforcement mechanism — it makes it impossible for a developer to accidentally trigger generation without explicit user intent.

---

### Auto-Generate — Opt-In Configuration

Auto-generation is not the default. It is an explicit opt-in via `/settings/flows`.

```typescript
interface FlowAutoGenerateSettings {
  enabled: boolean;                    // Off by default
  mode: 'notify_confirm' | 'auto_draft'; // Only relevant when enabled = true
  notify_confirm_channel: 'in_app' | 'email' | 'both';
  auto_draft_channel: 'in_app' | 'email' | 'both';
  enabled_flow_types: string[];        // Which flow types to auto-generate (all by default)
  min_trigger_volume: number;          // Don't auto-generate for flows with < N triggers/month
}
```

**Mode A — Notify & Confirm (`notify_confirm`):**
Gap detected → notification sent → user clicks "Build it" in notification → Flow Generator fires. The user confirms, but doesn't have to navigate anywhere.

**Mode B — Auto Draft (`auto_draft`):**
Gap detected → Flow Generator fires automatically → draft deployed to Klaviyo → notification sent: *"Your Welcome Series is ready to review in Klaviyo. It's a draft — activate when you're ready."* Zero clicks required from the user at any point.

Both modes are opt-in. Neither is default. The `/settings/flows` page makes this explicit with clear warning copy:

> *"Auto-generate creates real Klaviyo draft flows on your behalf. Before enabling, make sure your brand settings, product catalog, and offer preferences are up to date — VIYO uses that data to build the flows automatically."*

---

### How the FRC Connects to the Rest of VIYO

The Flow Recommendation Center is not an island. It is fed by, and feeds into, the broader VIYO intelligence layer.

#### Connections In (what feeds the FRC)

| Source | What it contributes |
|---|---|
| **Gap Detection Worker** | Daily Inngest job creates/updates recommendation cards |
| **Flow Auditor** | Audit completion updates all card scores and statuses in FRC |
| **Personal Brain** | Performance history shapes urgency and revenue estimates |
| **Klaviyo Sync Worker** | Detects when a flow is activated → marks card as 'built' |

#### Connections Out (where FRC data surfaces)

| Surface | How FRC data appears |
|---|---|
| **Smart Insights Dashboard** | "Flow Health" widget — score + top 2 gap cards + "See all →" link to `/flows` |
| **Onboarding Step 7** | "What to build next" cards are sourced from FRC, ordered by `revenue_impact_score` |
| **Notification Center** | New gaps and resurfaced snoozes fire notifications (if notifications enabled) |
| **VIYO Max** | "What flows am I missing?" → `getFlowRecommendations()` tool returns FRC card data |
| **Dashboard header** | Persistent Flow Health Score indicator (e.g. "Flow Health: C+") with link to `/flows` |
| **Post-deploy screen** | After deploying a campaign, a FRC card surfaces inline if a related flow is missing (e.g., after deploying to VIP segment: "You sent a campaign to your VIPs — but no VIP Welcome flow exists") |

#### The Smart Insights Dashboard — Flow Health Widget

The Flow Health widget on the main dashboard is the highest-visibility FRC entry point. It appears as a persistent card in the Smart Insights feed regardless of whether flow gaps exist. When gaps exist, it shows the top recommendation. When all recommended flows are active, it shows the score and "All flows healthy ✓."

```typescript
interface FlowHealthWidget {
  score: number;              // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  top_recommendation?: FlowRecommendationCard;   // highest revenue_impact_score pending card
  active_flow_count: number;
  total_recommended_flows: number;
  estimated_monthly_gap?: string;  // shown if any gaps exist
  cta: 'see_all' | 'run_audit' | 'build_top';  // determined by account state
}
```

**Widget CTA logic:**
- If no audit has been run → CTA is "Run a flow audit →" (routes to Auditor)
- If audit was run and gaps exist → CTA is "Build your top priority →" (routes to FRC with top card highlighted)
- If audit was run and no gaps → CTA is "See flow performance →" (routes to FRC in analytics mode)

---

### Page Inventory — New Pages This Section Adds

| Route | Name | What It Does |
|---|---|---|
| `/flows` | Flow Recommendation Center | All FRC cards, ranked. Filter by urgency/status. Health score widget. Auditor entry. |
| `/flows/audit` | Flow Auditor | 5-step wizard. Health score output. Bulk build CTA. |
| `/flows/audit/report` | Audit Report | Full scored report, ranked recommendations, build actions. |
| `/flows/generate` | Flow Generator | Existing generation UI (from Section 20A) — now only reachable via explicit trigger. |
| `/settings/flows` | Flow Settings | Auto-generate toggle and configuration. Dismissed recommendations restore. |

---

### Database Schema — New Tables

```typescript
// flow_recommendations — one row per brand per flow type
export const flowRecommendations = pgTable('flow_recommendations', {
  id:                   uuid('id').defaultRandom().primaryKey(),
  brand_id:             uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  flow_type:            text('flow_type').notNull(),                  // 'welcome_series', 'abandoned_cart', etc.
  status:               text('status').notNull().default('pending'),  // 'pending' | 'snoozed' | 'dismissed' | 'building' | 'built'
  revenue_impact_score: integer('revenue_impact_score').notNull(),    // 0-100
  urgency_level:        text('urgency_level').notNull(),              // 'critical' | 'high' | 'medium' | 'low'
  title:                text('title').notNull(),
  why_it_matters:       text('why_it_matters').notNull(),
  revenue_estimate:     text('revenue_estimate'),
  benchmark_stat:       text('benchmark_stat'),
  data_backing:         jsonb('data_backing').notNull(),              // string[]
  effort_estimate:      text('effort_estimate'),
  snoozed_until:        timestamp('snoozed_until'),
  built_at:             timestamp('built_at'),
  built_session_id:     uuid('built_session_id').references(() => campaignSessions.id),
  created_at:           timestamp('created_at').defaultNow().notNull(),
  updated_at:           timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  brand_flow_unique: unique().on(t.brand_id, t.flow_type),  // one card per brand per flow type
}));

// flow_audit_results — stores audit history
export const flowAuditResults = pgTable('flow_audit_results', {
  id:                     uuid('id').defaultRandom().primaryKey(),
  brand_id:               uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  health_score:           integer('health_score').notNull(),          // 0-100
  grade:                  text('grade').notNull(),                    // 'A' | 'B' | 'C' | 'D' | 'F'
  score_breakdown:        jsonb('score_breakdown').notNull(),
  missing_flows:          jsonb('missing_flows').notNull(),           // string[]
  underperforming_flows:  jsonb('underperforming_flows').notNull(),   // string[]
  strong_flows:           jsonb('strong_flows').notNull(),            // string[]
  estimated_monthly_gap:  text('estimated_monthly_gap'),
  recommendations:        jsonb('recommendations').notNull(),         // ordered FlowRecommendationCard[]
  created_at:             timestamp('created_at').defaultNow().notNull(),
});

// Extend brands table with auto-generate settings
// (add as columns to existing brands table via migration)
// auto_generate_flows:           boolean DEFAULT false
// auto_generate_mode:            text DEFAULT 'notify_confirm'
// auto_generate_flow_types:      jsonb DEFAULT '[]'  -- empty = all types
// auto_generate_min_triggers:    integer DEFAULT 50
// flow_notifications_enabled:    boolean DEFAULT true
```

---

### What This Section Corrects in Section 20A

Section 20A described auto-generation as the pipeline default triggered by gap detection. The correct behavior:

| Behavior | Section 20A (wrong) | Section 20W (correct) |
|---|---|---|
| Gap detected | Pipeline runs automatically | FRC card created/updated |
| User default state | Auto-generate active | Recommendation surfaced, no generation |
| Auto-generate | Default, no opt-in required | Explicit opt-in, off by default |
| User intent required | No | Yes — always |
| Klaviyo writes | On gap detection | Only on explicit trigger |

Section 20A's pipeline code, brief assembly, layout map, subject line variants, and Klaviyo deploy logic remain valid. Only the trigger rules change. The `FlowGeneratorTrigger` enum is the enforcement mechanism.

---

## 20X. Discount Cap System — Margin Protection Across Flows, Campaigns, and Calendar

### Why This Section Exists

VIYO generates offers on behalf of brands. Without a cap system, two failure modes occur:

**Drift** — the Offer Brain selects from `safe_offers`, but if a brand added a 40% flash sale offer and forgot to remove it, every auto-generated flow and calendar campaign can deploy that offer indefinitely. The brand never intended 40% off to become their default.

**Escalation** — without per-flow caps, the natural tendency is to offer progressively deeper discounts to re-engage harder-to-reach subscribers. Left unchecked, this trains the audience to go cold and wait for the deepest offer.

**Frequency collapse** — without calendar frequency rules, the Offer Brain drifts toward discount-led campaigns because they brief easily and convert well short-term. The calendar becomes a perpetual sale calendar, and subscribers stop opening anything that doesn't have "X% off" in the subject line.

Flows, one-time campaigns, and calendar campaigns each carry a different version of these risks, so each has a different enforcement model. This section specifies all three.

---

### The Two-Level Cap Architecture

Caps operate at two levels for every context:

```
VIYO System Cap (ceiling — set by VIYO, never overridable by brand)
        ↓
Brand Cap (set by brand, must be ≤ system cap)
        ↓
Effective Cap = Math.min(systemCap, brandCap)
```

The Offer Brain never sees offers that exceed the effective cap. They are filtered out of its input before the prompt runs — the brain cannot select what it cannot see.

```typescript
async function getEligibleOffers(
  brandId: string,
  context: OfferContext,  // { type: 'flow' | 'campaign', flowType?, campaignIntent? }
): Promise<SafeOffer[]> {

  const allOffers = await db.query.safeOffers.findMany({
    where: eq(safeOffers.brand_id, brandId)
  });

  const effectiveCap = getEffectiveCap(brandId, context);

  return allOffers.filter(offer => {
    if (offer.type === 'percentage') {
      return offer.value <= effectiveCap;
    }
    if (offer.type === 'fixed_amount') {
      // Convert to % of AOV for comparison
      const pctEquivalent = (offer.value / brand.average_order_value) * 100;
      return pctEquivalent <= effectiveCap;
    }
    // Non-discount offers always eligible
    if (['free_shipping', 'gift_with_purchase', 'free_returns'].includes(offer.type)) {
      return true;
    }
    return false;
  });
}
```

---

### Part A — Flow Discount Caps

Flows are repeated automated sequences. The primary risks are drift (wrong offer persisting) and escalation (deeper discounts to harder-to-reach subscribers over time). Caps here are hard — no soft warnings, no user override at generation time.

#### System Caps and Brand Defaults by Flow Type

| Flow Type | System Cap | Brand Default | Reasoning |
|---|---|---|---|
| Welcome Series | 15% | 15% | First-order incentive — brand is still unproven to this subscriber. Modest offer. |
| Abandoned Cart | 10% | 10% | Cart was already built — subscriber was close to buying. Deep discount unnecessary. |
| Post-Purchase | 10% | 10% | Cross-sell context — discount should feel like loyalty reward, not desperation. |
| Browse Abandonment | 10% | 10% | Weaker intent than cart. Free shipping is often sufficient. |
| Win-Back | 25% | 20% | Requires a stronger signal to re-engage cold subscribers. Higher cap, lower default. |
| VIP Welcome | 0% | 0% (locked) | VIPs receive access and recognition, never discounts. Hard zero — no column on brands table. |
| Sunset | 30% | 25% | Last attempt. Highest acceptable cap, still bounded. |

```typescript
// System-level hard caps — enforced by VIYO, never overridable by brand
export const SYSTEM_FLOW_CAPS: Record<string, number> = {
  welcome_series:      15,
  abandoned_cart:      10,
  post_purchase:       10,
  browse_abandonment:  10,
  win_back:            25,
  vip_welcome:          0,  // hard zero — VIP flows never discount
  sunset:              30,
};

// Brand-level caps — stored as columns on brands table
// Defaults match recommended values; brands can lower but not exceed system cap
export function getFlowEffectiveCap(brand: Brand, flowType: string): number {
  const systemCap = SYSTEM_FLOW_CAPS[flowType] ?? 0;
  const brandCap  = brand[`${flowType.replace(/_/g, '_')}_discount_cap`] ?? systemCap;
  return Math.min(systemCap, brandCap);
}
```

#### Offer Type Hierarchy by Flow

Beyond the cap, the Offer Brain is guided toward the most appropriate offer type per flow context. When multiple eligible offers exist, this hierarchy governs selection.

| Flow | Preferred Offer Type | Reasoning |
|---|---|---|
| Welcome (premium brand) | Free shipping | Feels like service, not desperation |
| Welcome (mid-market) | % off first order | Clear value, easy to understand |
| Abandoned Cart | Free shipping or small % | Removes friction — shipping is often the objection |
| Browse Abandonment | Free shipping | Lowest-commitment ask — interest is soft |
| Post-Purchase | % off next order or gift | Loyalty framing — reward repeat behavior |
| Win-Back | % off or free gift | Needs to feel meaningful after long absence |
| Sunset | % off at cap | Last chance — make it count |

The Offer Brain receives this as a priority fragment per flow type:

```
OFFER SELECTION PRIORITY for abandoned_cart:
1. Free shipping (if available) — most common cart objection is shipping cost
2. Percentage discount ≤ effective cap
3. Fixed amount discount ≤ cap equivalent
4. If no eligible offers exist: output offer: null — do not invent
```

#### Per-Subscriber Escalation Prevention (Win-Back and Sunset)

The most dangerous escalation pattern: brand runs win-back, subscriber ignores it, brand creates a deeper offer hoping to convert them, cycle repeats until the brand is offering 40% off to everyone who goes cold for 90 days.

VIYO prevents this with a per-subscriber discount history check before the Offer Brain runs:

```typescript
async function getWinbackOffer(
  brandId: string,
  profileId: string,
  flowType: 'win_back' | 'sunset'
): Promise<SafeOffer | null> {

  const lastWinbackOffer = await db.query.messageLog.findFirst({
    where: and(
      eq(messageLog.brand_id, brandId),
      eq(messageLog.klaviyo_profile_id, profileId),
      eq(messageLog.flow_type, 'win_back'),
    ),
    orderBy: [desc(messageLog.sent_at)],
  });

  // If they received an offer last time and didn't re-engage:
  // do NOT offer deeper. Same or lesser — prevent audience training.
  if (lastWinbackOffer?.offer_value) {
    const maxOffer = lastWinbackOffer.offer_value;
    const eligible = await getEligibleOffers(brandId, { type: 'flow', flowType });
    return eligible.find(o => o.type === 'percentage' && o.value <= maxOffer) ?? null;
  }

  // First time in win-back for this subscriber — use standard cap
  const eligible = await getEligibleOffers(brandId, { type: 'flow', flowType });
  return eligible[0] ?? null;
}
```

If a subscriber was offered 15% in their last win-back and didn't re-engage, the next attempt (if they qualify again after the 365-day cooldown) offers no more than 15%. Escalation is architecturally blocked.

#### Schema — New Columns on `brands` Table

```typescript
// Migration: add to existing brands table
welcome_discount_cap:       integer('welcome_discount_cap').default(15),
cart_discount_cap:          integer('cart_discount_cap').default(10),
browse_discount_cap:        integer('browse_discount_cap').default(10),
post_purchase_discount_cap: integer('post_purchase_discount_cap').default(10),
winback_discount_cap:       integer('winback_discount_cap').default(20),
sunset_discount_cap:        integer('sunset_discount_cap').default(25),
// vip_welcome is always 0 — no column needed, enforced in code
```

---

### Part B — One-Time Campaign Discount Caps

One-time campaigns have a fundamentally different risk profile from flows. The user is present — they submit a brief, review the generated email, and approve before deploy. Because of this human-in-the-loop, enforcement is softer: **soft warnings before hard blocks**, with an override mechanism that requires a stated reason.

The primary risk is not escalation to the same subscriber — it is **intent mismatch**: an offer that is inappropriate for the campaign's context, not necessarily too deep.

#### Campaign Intent Categories and Caps

| Campaign Intent | System Cap | Default Cap | Enforcement | Notes |
|---|---|---|---|---|
| Editorial / brand story | 0% | 0% | Hard block | Content campaigns never carry discounts — non-negotiable |
| New arrival / product drop | 0% | 0% | Hard block | Discounting new drops trains customers to wait for sale price |
| Regular promotional | 40% | 20% | Soft warning at brand cap | Most common campaign type — brand sets own cap within ceiling |
| Seasonal / event (BFCM, etc.) | 50% | 40% | Confirmation required | User must declare "this is a sale event" |
| Flash sale | 40% | 30% | Soft warning | Short window, higher acceptable depth |
| Clearance | 60% | 40% | Intent declaration required | Must select "clearance" as campaign intent |
| Loyalty / VIP exclusive | 20% | 15% | Soft warning | Keep VIP offers modest — access and recognition over discount |
| Re-engagement (single send) | 25% | 20% | Soft warning | Matches win-back flow default |

The 0% hard locks on editorial and product drops are enforced at the system level regardless of brand configuration. A brand cannot configure VIYO to attach a discount to a new arrivals email. This is a brand positioning protection rule, not a margin rule.

#### The Override Flow

When a user selects an offer above their brand cap (but below the system cap), the Offer Brain surfaces a warning on the preview screen — not a block:

```
⚠️  Above your default cap for this campaign type

You've selected a 30% discount. Your configured cap for
regular promotional emails is 20%.

Going higher may train subscribers to expect deeper discounts
on regular campaigns.

What's the reason?
  ○  One-time event — won't repeat
  ○  Seasonal clearance
  ○  Testing a higher offer
  ○  Other: ____________________

  [Continue with 30%]    [Lower to 20%]
```

The selected reason is stored in `campaign_sessions.offer_override_reason`. The Self-Learning Admin surfaces override patterns — if a brand is overriding their cap every other campaign, that is a signal the cap is set wrong and a notification is sent: *"You've overridden your promotional discount cap 6 times in the last 30 days. Consider raising your brand cap in Settings."*

#### Campaign Intent Detection

Campaign intent is not always explicitly declared in the brief. When the user submits a brief, the CMO Brain classifies the intent as part of its strategy output, and the classification determines which cap applies before the Offer Brain runs:

```typescript
type CampaignIntent =
  | 'editorial'
  | 'product_drop'
  | 'promotional'
  | 'seasonal_event'
  | 'flash_sale'
  | 'clearance'
  | 'loyalty_vip'
  | 'reengagement';

// CMO Brain output includes:
interface CampaignStrategy {
  intent: CampaignIntent;      // classified from brief
  offer_eligible: boolean;     // false for editorial and product_drop
  recommended_offer_type: string;
  // ... rest of strategy
}
```

If the CMO Brain classifies intent as `editorial` or `product_drop`, `offer_eligible = false` and the Offer Brain is not called. No offer is generated. If the user's brief explicitly requests a discount on a product drop (e.g. "launch our new hoodie with 20% off"), VIYO flags a conflict:

```
⚠️  Discounting a new product drop

Adding a discount to a new arrival launch anchors your
product's perceived value at a lower price point and
trains customers to wait for offers before buying.

Consider: launch at full price, then offer a discount
14 days later if you want to drive a second spike.

  [Remove discount]    [Keep anyway]
```

---

### Part C — Calendar Campaign Discount Caps

Calendar campaigns compound the individual campaign risk with a new one: **frequency collapse**. The Offer Brain, left unconstrained across 30 AI-proposed campaigns, drifts toward discount-led emails because they brief easily and convert well short-term. The result is a calendar full of sale emails, which trains subscribers to ignore everything else and wait for the next promotion.

Two enforcement layers apply to the calendar:

**Layer 1 — Per-campaign intent caps:** Same system as one-time campaigns. Each calendar entry is classified by intent when the AI proposes it. The same cap table governs.

**Layer 2 — Calendar frequency rules:** Applied to the full 30-campaign proposal before it is shown to the user. A `validateCalendarMix()` function checks the month as a whole and rebalances if it fails.

#### Calendar Mix Rules

```typescript
interface CalendarMixRules {
  max_discount_campaigns_per_month: number;   // default: 8 of 30
  max_consecutive_discount_campaigns: number; // default: 2
  min_editorial_ratio: number;                // default: 0.30 (30% of month)
  max_deep_discount_events_per_month: number; // default: 1 campaign ≥ 30% discount
  cooling_off_days_after_sale: number;        // default: 5 (no discount within 5 days of a ≥25% offer)
}

const DEFAULT_CALENDAR_MIX_RULES: CalendarMixRules = {
  max_discount_campaigns_per_month: 8,
  max_consecutive_discount_campaigns: 2,
  min_editorial_ratio: 0.30,
  max_deep_discount_events_per_month: 1,
  cooling_off_days_after_sale: 5,
};
```

#### The Validator

```typescript
async function validateCalendarMix(
  proposals: CalendarCampaign[],
  rules: CalendarMixRules,
  brandId: string,
): Promise<CalendarCampaign[]> {

  let discountCount = 0;
  let consecutiveDiscount = 0;
  let deepDiscountCount = 0;
  let lastSaleDate: Date | null = null;
  const corrected: CalendarCampaign[] = [];

  for (const campaign of proposals.sort((a, b) => a.scheduled_date - b.scheduled_date)) {
    const hasDiscount = campaign.strategy.offer_eligible && campaign.offer !== null;
    const isDeepDiscount = campaign.offer?.value >= 30;
    const daysSinceLastSale = lastSaleDate
      ? (campaign.scheduled_date - lastSaleDate) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Check: too many discount campaigns this month
    if (hasDiscount && discountCount >= rules.max_discount_campaigns_per_month) {
      corrected.push(await convertToEditorial(campaign, brandId));
      continue;
    }

    // Check: too many consecutive discount campaigns
    if (hasDiscount && consecutiveDiscount >= rules.max_consecutive_discount_campaigns) {
      corrected.push(await convertToEditorial(campaign, brandId));
      consecutiveDiscount = 0;
      continue;
    }

    // Check: cooling-off period after a sale event
    if (hasDiscount && daysSinceLastSale < rules.cooling_off_days_after_sale) {
      corrected.push(await convertToFreeShippingOffer(campaign, brandId));
      // free shipping counts as offer but not as a discount campaign
      continue;
    }

    // Check: deep discount frequency
    if (isDeepDiscount && deepDiscountCount >= rules.max_deep_discount_events_per_month) {
      // Downgrade to shallow discount
      campaign.offer = await getShallowOffer(brandId, campaign.intent);
      corrected.push(campaign);
    } else {
      corrected.push(campaign);
    }

    if (hasDiscount) discountCount++;
    if (hasDiscount) consecutiveDiscount++;
    else consecutiveDiscount = 0;
    if (isDeepDiscount) deepDiscountCount++;
    if (isDeepDiscount) lastSaleDate = campaign.scheduled_date;
  }

  // Final check: editorial ratio
  const editorialCount = corrected.filter(c => !c.strategy.offer_eligible).length;
  const editorialRatio = editorialCount / corrected.length;
  if (editorialRatio < rules.min_editorial_ratio) {
    corrected = await backfillEditorialCampaigns(corrected, brandId, rules.min_editorial_ratio);
  }

  return corrected;
}
```

The user sees only the validated calendar. The intermediate rebalancing is invisible to them. Each corrected campaign is regenerated with an appropriate non-discount brief — not swapped for a placeholder.

#### Calendar Mix Enforcement Modes

Brands can configure the enforcement level at `/settings/campaigns`:

| Mode | Behavior |
|---|---|
| `standard` (default) | All mix rules active. Validator runs before calendar is shown. |
| `relaxed` | All thresholds doubled. For brands with a more promotional posture. |
| `off` | Frequency rules disabled. Individual campaign intent caps still apply. Persistent warning banner shown on the calendar: *"Calendar frequency rules are off — monitor discount frequency manually."* |

#### The BFCM Exception

For October and November, the calendar generation automatically applies a separate rule set that reflects commercial reality:

```typescript
const BFCM_CALENDAR_OVERRIDES: CalendarMixRules = {
  max_discount_campaigns_per_month: 14,  // BFCM is sale season
  max_consecutive_discount_campaigns: 4,
  min_editorial_ratio: 0.20,             // relaxed — but never zero
  max_deep_discount_events_per_month: 3, // BFCM can sustain multiple deep offers
  cooling_off_days_after_sale: 2,
};
```

This is applied automatically based on calendar month. No brand configuration required. Resets to standard rules in December.

---

### Part D — Brand Settings UI

All cap settings live at `/settings/discounts-and-offers`. Two tabs: **Flows** and **Campaigns**.

**Flows tab:**

```
Discount Caps by Flow

Set the maximum discount any auto-generated flow can use.
VIYO system limits are shown — your cap cannot exceed them.

  Welcome Series        [ 15% ▾ ]   (system max: 15%)
  Abandoned Cart        [ 10% ▾ ]   (system max: 10%)
  Browse Abandonment    [ Free shipping only ▾ ]
  Post-Purchase         [ 10% ▾ ]   (system max: 10%)
  Win-Back              [ 20% ▾ ]   (system max: 25%)
  VIP Welcome           [ No discount ]  🔒 locked
  Sunset                [ 25% ▾ ]   (system max: 30%)
```

**Campaigns tab:**

```
Discount Caps by Campaign Type

Set your default caps per campaign type. You can override
at generation time, but you'll be prompted to explain why.

  Regular Promotional   [ 20% ▾ ]   (system max: 40%)
  Seasonal / Events     [ 40% ▾ ]   (system max: 50%)
  Flash Sale            [ 30% ▾ ]   (system max: 40%)
  Clearance             [ 40% ▾ ]   (system max: 60%)
  Loyalty / VIP         [ 15% ▾ ]   (system max: 20%)
  Re-engagement         [ 20% ▾ ]   (system max: 25%)
  Editorial             [ No discount ]  🔒 locked
  New Arrival / Drop    [ No discount ]  🔒 locked

  Calendar Mix Rules
  ─────────────────
  Max discount campaigns / month   [ 8 ▾ ]
  Max consecutive discount sends   [ 2 ▾ ]
  Min editorial ratio              [ 30% ▾ ]
  Enforcement mode                 [ Standard ▾ ]
```

Locked fields display a tooltip: *"This is a brand protection setting. VIYO enforces this to protect your product positioning."*

---

### The Unified Enforcement Summary

| Context | Primary Risk | Enforcement Model | Override Available? |
|---|---|---|---|
| Flow — VIP Welcome | Any discount | Hard zero — system + code | No |
| Flow — Win-Back / Sunset | Escalation to same subscriber | Per-subscriber history check | No |
| Flow — all types | Drift from forgotten offers | Pre-filter before Offer Brain | Only by lowering brand cap |
| Campaign — Editorial | Discounting content | Hard block at CMO Brain | No |
| Campaign — Product Drop | Anchoring new product value low | Hard block + persuasion modal | Yes, with reason stored |
| Campaign — Promotional | Wrong depth for context | Soft warning + override | Yes, with reason stored |
| Calendar | Frequency collapse | Mix validator + BFCM exception | Via enforcement mode setting |

One function governs all contexts:

```typescript
export function getEffectiveCap(brandId: string, context: OfferContext): number {
  if (context.type === 'flow') {
    const systemCap = SYSTEM_FLOW_CAPS[context.flowType];
    const brandCap  = getBrandFlowCap(brandId, context.flowType);
    return Math.min(systemCap, brandCap);
  }
  if (context.type === 'campaign') {
    const systemCap = SYSTEM_CAMPAIGN_CAPS[context.campaignIntent];
    const brandCap  = getBrandCampaignCap(brandId, context.campaignIntent);
    return Math.min(systemCap, brandCap);
  }
  return 0; // unknown context — safest default
}
```

Single entry point, all contexts. Any code path that generates an offer must call `getEffectiveCap()` before calling `getEligibleOffers()`. This is enforced via an ESLint rule that flags direct `safeOffers` queries that bypass the cap check.

---

---

### Part D — Shopify Discount Code Engine

The cap system in Parts A–C governs which offers are eligible. This part specifies how VIYO actually creates discount codes in Shopify and generates the deep links that appear in emails. Both of these were previously unspecified — this section is the missing foundation.

---

#### The `safe_offers` Table

Every offer VIYO can use in a flow or campaign must exist in the `safe_offers` table for the brand. This table is the single source of truth for what the Offer Brain can select from. It holds offer templates (the offer type, value, and code configuration) — not individual codes.

```typescript
export const safeOffers = pgTable('safe_offers', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  brandId:            uuid('brand_id').references(() => brands.id).notNull(),

  // Offer configuration
  offerType:          text('offer_type').notNull(),
  // 'percentage' | 'fixed_amount' | 'free_shipping' | 'gift_with_purchase'
  value:              numeric('value', { precision: 10, scale: 2 }),
  // null for free_shipping; percentage as integer (e.g. 15 = 15%)
  displayLabel:       text('display_label').notNull(),
  // e.g. "15% off your first order" — shown in Offer Brain context and brand UI
  minimumOrderAmount: numeric('minimum_order_amount', { precision: 10, scale: 2 }),
  // null = no minimum; e.g. 50.00 = must spend $50

  // Shopify integration
  shopifyPriceRuleId: text('shopify_price_rule_id'),
  // The Shopify price rule this offer is derived from.
  // Set once when the offer is created. null if codeCreationMode = 'manual'.
  codeCreationMode:   text('code_creation_mode').notNull().default('manual'),
  // 'manual' | 'auto_shared' | 'auto_unique'
  sharedCode:         text('shared_code'),
  // For 'manual' and 'auto_shared' modes: the static Shopify discount code string.
  // e.g. "VIYO15OFF". null for 'auto_unique' (Klaviyo inserts dynamically).
  codePrefix:         text('code_prefix'),
  // For auto modes: prefix used when generating code names.
  // e.g. "VIYO15" → generates codes like "VIYO15-A3X8K"
  expiryDays:         integer('expiry_days'),
  // How many days each code is valid after email send. null = no expiry.
  usageLimitPerCode:  integer('usage_limit_per_code'),
  // null = unlimited; 1 = single-use (required for auto_unique mode)

  // Klaviyo Dynamic Coupon integration
  klaviyoCouponListId: text('klaviyo_coupon_list_id'),
  // Populated after first batch upload for auto_unique offers.
  // Klaviyo uses this list to assign one code per subscriber at send time.
  codesBatchSize:      integer('codes_batch_size').default(500),
  // How many unique codes to generate per batch. Refreshed automatically.
  codesRemaining:      integer('codes_remaining').default(0),
  // Tracked by VIYO. When this drops below 20% of batch size, auto-refresh runs.
  lastCodeRefreshAt:   timestamptz('last_code_refresh_at'),

  isActive:            boolean('is_active').default(true),
  isDefault:           boolean('is_default').default(false),
  // Whether this is the brand's primary offer shown in Offer Brain context builder
  createdAt:           timestamptz('created_at').defaultNow(),
});
```

---

#### Three Code Creation Modes

```
┌──────────────┬──────────────────────────────────┬────────────────────────┬──────────────────┐
│  Mode        │  How it works                    │  Best for              │  Shopify API?    │
├──────────────┼──────────────────────────────────┼────────────────────────┼──────────────────┤
│ manual       │  Brand creates code in Shopify.  │  Brands with existing  │  No              │
│              │  Pastes code string into VIYO.   │  promo infrastructure  │                  │
│              │  VIYO uses the code as-is.       │                        │                  │
├──────────────┼──────────────────────────────────┼────────────────────────┼──────────────────┤
│ auto_shared  │  VIYO creates one Shopify code   │  One-time campaign     │  Yes, once at    │
│              │  at offer creation time via API. │  sends (all recipients │  offer setup     │
│              │  All recipients get same code.   │  get the same code)    │                  │
├──────────────┼──────────────────────────────────┼────────────────────────┼──────────────────┤
│ auto_unique  │  VIYO creates a Shopify price    │  Flows (automated      │  Yes, at setup   │
│              │  rule + batch of unique codes.   │  sequences where each  │  + auto-refresh  │
│              │  Uploaded to Klaviyo coupon list.│  subscriber gets a     │                  │
│              │  Klaviyo assigns one per-        │  unique, trackable,    │                  │
│              │  subscriber at send time.        │  single-use code)      │                  │
└──────────────┴──────────────────────────────────┴────────────────────────┴──────────────────┘
```

For flows, **auto_unique is strongly recommended** — unique codes prevent sharing, enable per-subscriber redemption tracking, and can have expiry dates that match the flow's email timing. For campaign sends, auto_shared is sufficient.

---

#### Shopify API Integration — Creating Discount Codes

VIYO uses the Shopify Admin API (GraphQL) to create price rules and discount codes. The Shopify connection is established during onboarding via OAuth — the same connection used for product sync.

**Step 1: Create a Price Rule (the offer configuration)**

```typescript
async function createShopifyPriceRule(
  brandId: string,
  offer: InsertSafeOffer,
): Promise<string> {  // returns shopify price rule ID

  const shopify = getShopifyClient(brandId);

  const priceRule = await shopify.priceRules.create({
    title: `VIYO — ${offer.displayLabel}`,
    value_type: offer.offerType === 'percentage' ? 'percentage' : 'fixed_amount',
    value: offer.offerType === 'percentage'
      ? `-${offer.value}`       // Shopify expects negative: -15 = 15% off
      : `-${offer.value}`,      // e.g. -10.00 for $10 off
    customer_selection: 'all',
    target_type: 'line_item',
    target_selection: 'all',
    allocation_method: 'across',
    starts_at: new Date().toISOString(),
    prerequisite_subtotal_range: offer.minimumOrderAmount
      ? { greater_than_or_equal_to: offer.minimumOrderAmount }
      : undefined,
  });

  return priceRule.id.toString();
}
```

**Step 2: Generate Unique Codes Under the Price Rule**

```typescript
async function generateUniqueCodeBatch(
  brandId: string,
  priceRuleId: string,
  prefix: string,
  batchSize: number,
): Promise<string[]> {

  const shopify = getShopifyClient(brandId);

  // Shopify's batch creation API — generates up to 100 codes per request
  const chunks = Math.ceil(batchSize / 100);
  const allCodes: string[] = [];

  for (let i = 0; i < chunks; i++) {
    const count = Math.min(100, batchSize - allCodes.length);
    const batch = await shopify.discountCodes.createBatch(priceRuleId, {
      codes: Array.from({ length: count }, () => ({
        code: `${prefix}-${nanoid(6).toUpperCase()}`,
      })),
    });

    const createdCodes = batch.codes.map((c: { code: string }) => c.code);
    allCodes.push(...createdCodes);
  }

  return allCodes;
}
```

**Step 3: Upload to Klaviyo as a Dynamic Coupon List**

```typescript
async function uploadToKlaviyoCouponList(
  brandId: string,
  codes: string[],
  offerId: string,
): Promise<string> {  // returns klaviyo coupon list ID

  const klaviyo = getKlaviyoClient(brandId);

  const couponList = await klaviyo.coupons.createCouponList({
    external_id: `viyo-offer-${offerId}`,
    name: `VIYO Offer — ${offerId}`,
  });

  // Upload codes in batches of 1,000
  const batches = chunk(codes, 1000);
  for (const batch of batches) {
    await klaviyo.coupons.bulkCreateCouponCodes({
      coupon_id: couponList.id,
      codes: batch.map(code => ({ unique_code: code })),
    });
  }

  return couponList.id;
}
```

---

#### Auto-Refresh — Keeping the Code Pool Full

For auto_unique offers tied to live flows, VIYO monitors `codesRemaining` nightly. When the pool drops below 20% of batch size, a new batch is auto-generated and uploaded to Klaviyo.

```typescript
export const couponRefreshJob = inngest.createFunction(
  { id: 'coupon-refresh' },
  { cron: '0 4 * * *' }, // 4AM UTC — before the nightly signal detection job
  async ({ step }) => {
    const lowOffers = await step.run('find-low-offers', () =>
      db.query.safeOffers.findMany({
        where: and(
          eq(safeOffers.codeCreationMode, 'auto_unique'),
          eq(safeOffers.isActive, true),
          sql`codes_remaining < (codes_batch_size * 0.20)`,
        )
      })
    );

    for (const offer of lowOffers) {
      await step.run(`refresh-offer-${offer.id}`, async () => {
        const newCodes = await generateUniqueCodeBatch(
          offer.brandId,
          offer.shopifyPriceRuleId!,
          offer.codePrefix ?? 'VIYO',
          offer.codesBatchSize,
        );
        await uploadToKlaviyoCouponList(offer.brandId, newCodes, offer.id);
        await db.update(safeOffers)
          .set({
            codesRemaining: sql`codes_remaining + ${newCodes.length}`,
            lastCodeRefreshAt: new Date(),
          })
          .where(eq(safeOffers.id, offer.id));
      });
    }
  }
);
```

No human action required. The code pool refills automatically.

---

#### Shopify Discount Deep Links

When the Email Design Brain builds the email template, every offer CTA gets a Shopify discount deep link. The format is:

```
https://{shop_domain}/discount/{CODE}?redirect={path}
```

Clicking the link auto-applies the discount at checkout and redirects the subscriber to the specified page. No manual code entry required.

```typescript
function generateDiscountCTA(
  shopDomain: string,         // e.g. "mybrand.myshopify.com"
  offer: SafeOffer,
  redirectPath: string = '/', // where to land after applying discount
): { href: string; label: string } {

  const redirect = encodeURIComponent(redirectPath);

  if (offer.codeCreationMode === 'auto_unique') {
    // Klaviyo replaces {{ coupon_code }} at send time with the subscriber's unique code
    return {
      href: `https://${shopDomain}/discount/{{ coupon_code }}?redirect=${redirect}`,
      label: offer.displayLabel,
    };
  }

  // manual or auto_shared — static code known at generation time
  return {
    href: `https://${shopDomain}/discount/${offer.sharedCode}?redirect=${redirect}`,
    label: offer.displayLabel,
  };
}
```

**Redirect path selection:**

| Email context | Redirect path |
|---|---|
| General welcome / brand story | `/` (homepage) |
| Product feature email | `/products/{productHandle}` |
| Collection campaign | `/collections/{collectionHandle}` |
| Flash sale / clearance | `/collections/sale` or `/collections/all?sort_by=price-ascending` |
| Cart abandonment | `/cart` (Shopify restores cart via session) |
| New arrivals | `/collections/new-arrivals` |

The CMO Brain's strategy output includes a `redirectContext` field. The Email Design Brain calls `generateDiscountCTA()` with the appropriate path. The brand never writes a link manually.

---

#### Signup Fulfillment — Branch A Popup Discount

When `signupContext = 'popup_discount'`, the offer in Email 1 is a fulfillment of a contract made at signup — not a discretionary selection by the Offer Brain. Two rules apply:

1. **The offer is locked at signup, not at send time.** The popup stores the `safeOfferId` shown to the subscriber as a Klaviyo profile property (`viyo_signup_offer_id`). The Welcome Series brief receives `fulfillmentOfferId` which bypasses `getEligibleOffers()` entirely and bypasses the cap system (`context.type = 'signup_fulfillment'` in `getEffectiveCap()` returns uncapped).

2. **auto_unique mode is required** for all popup discount offers. The subscriber signed up expecting a specific personal code — not a shared code they may have already seen elsewhere. `codeCreationMode: 'manual'` or `'auto_shared'` is rejected for offers flagged as popup offers.

```typescript
// Validation at offer creation time
if (offer.usedAsPopupDiscount && offer.codeCreationMode !== 'auto_unique') {
  throw new Error(
    'Popup discount offers must use auto_unique mode. ' +
    'Subscribers who signed up with a popup discount expect a personal code.'
  );
}
```

---

#### Brand UI — Managing Offers

All offer management lives at **Settings > Discounts and Offers > My Offers**.

```
+----------------------------------------------------------------------+
|  My Offers                                          [+ Add Offer]    |
|                                                                      |
|  15% Off First Order            Type: Percentage   Mode: Auto Unique |
|  Code pool: 412 remaining       Klaviyo list: connected             |
|  Used in: Welcome Series, Browse Abandonment                        |
|  [Edit]  [Refresh codes now]  [Deactivate]                          |
|                                                                      |
|  Free Shipping                  Type: Free shipping  Mode: Auto Shared|
|  Code: VIYOFREE                 Last refreshed: Apr 17, 2026        |
|  Used in: Abandoned Cart                                             |
|  [Edit]  [Deactivate]                                                |
|                                                                      |
|  20% Off Win-Back               Type: Percentage   Mode: Manual     |
|  Code: COMEBACK20               (you manage this in Shopify)        |
|  Used in: Win-Back, Sunset                                           |
|  [Edit]  [Deactivate]                                                |
+----------------------------------------------------------------------+
```

"Refresh codes now" triggers `generateUniqueCodeBatch()` immediately outside the nightly schedule — available if a brand runs a large unexpected campaign and needs more codes urgently.

---

#### To Answer the Question Directly

**Will VIYO automatically create discount codes in Shopify?**

Yes — if the brand's offer is configured as `auto_shared` or `auto_unique`. For `auto_shared`, VIYO creates one Shopify discount code at offer setup time and reuses it across all sends. For `auto_unique`, VIYO creates a Shopify price rule and a rolling batch of unique codes, uploads them to Klaviyo, and auto-refreshes the pool nightly. The brand never needs to touch Shopify's discount admin for these modes.

**Will VIYO automatically create a "Sale" in Shopify?**

No. VIYO creates **discount codes** (price rules + code strings), not Shopify "Automatic Discounts" or product price changes. A Shopify "sale" involves changing actual product prices — VIYO never modifies product prices. Only discount codes are created.

**Are deep links generated automatically?**

Yes. Every email CTA that uses a discount offer is generated with a Shopify deep link that auto-applies the code at checkout. For flows with auto_unique codes, Klaviyo's `{{ coupon_code }}` variable is injected — Klaviyo resolves it to each subscriber's personal code at send time. The brand never writes a URL.

---

## 20Z. Flow Intelligence Architecture — Signup-Aware Welcome Series

### Why This Section Exists

The Welcome Series doctrine as written in Section 20A has a fundamental gap. The rule "Email 1: no offer" assumes all subscribers arrived the same way. They did not.

When a subscriber signs up through a discount popup — "Get 10% off your first order" — a contract was made at signup. Email 1 must deliver that code immediately. If VIYO generates a welcome series that holds the discount until Email 3 for a popup subscriber, the user gets a brand story they did not ask for, then checks their spam folder for the discount they were promised, then unsubscribes.

This is not an edge case. Popup-with-discount is the most common signup source for ecommerce brands. The existing doctrine was wrong for the majority of real subscribers.

The fix: the Welcome Series is not a single linear flow. It is a branching flow that splits at entry based on signup context.

---

### Part 1 — Signup Source Tagging

Every new subscriber gets a `viyo_signup_context` Klaviyo profile property set at the moment they join the list. VIYO's form embed sets this automatically via a hidden field. For brands using third-party forms, the onboarding wizard walks them through adding the hidden field to their existing Klaviyo forms.

**`viyo_signup_context` values:**

| Value | Description | Welcome Branch |
|-------|-------------|---------------|
| `popup_discount` | Subscriber was shown a discount offer on the popup | Branch A — code delivery |
| `popup_no_offer` | Popup existed but no discount (e.g. "Join the list") | Branch B — organic |
| `checkout_opt_in` | Subscriber just completed a purchase | Hard exclusion — post-purchase flow only |
| `organic` | Footer, about page, blog, direct URL — no offer involved | Branch B — organic |
| `referral` | Referred by another customer, may have their own offer | Branch A or B — depends on referral offer config |
| `social_bio` | Link in bio — typically discount-driven | Branch A — code delivery |
| `content_upgrade` | Signed up to receive a guide or resource | Branch B — organic, content-led |

**Setting the property via VIYO form embed:**

```javascript
// Hidden field injected by the VIYO JS embed at form render time
// The value is configured in the form settings — set once per form
<input type="hidden" name="viyo_signup_context" value="popup_discount" />
```

**Setting via Klaviyo native forms (brands who don't use VIYO forms):**

VIYO generates a Klaviyo hidden field snippet during onboarding at `/settings/flows/signup-sources`. The brand adds it to each of their Klaviyo forms. A status panel shows which forms have the property configured and which are missing it.

**Fallback:** If `viyo_signup_context` is not set on a subscriber, VIYO defaults to `organic` — the conservative path. No discount is sent speculatively.

---

### Part 2 — Branched Welcome Series at Flow Entry

The welcome flow begins with a conditional split at position 0, before any email sends. The split reads the `viyo_signup_context` profile property.

```
FLOW ENTRY
  │
  ▼
[Conditional Split: viyo_signup_context]
  │
  ├─ popup_discount OR social_bio OR referral (with offer)
  │       ↓
  │   BRANCH A: Discount Delivery Branch
  │
  ├─ popup_no_offer OR organic OR content_upgrade
  │       ↓
  │   BRANCH B: Organic Welcome Branch
  │
  └─ checkout_opt_in
          ↓
      HARD EXIT — route to post-purchase flow
      (never enters welcome series)
```

---

**Branch A — Discount Delivery Branch:**

For subscribers where a discount was promised at signup. Code delivery is the priority of Email 1. Brand story comes second within the same email — the subscriber is meeting the brand through the discount, and that is fine.

```
Email 1  (immediate — 5 to 30 min delay)
  Subject: "Your [X]% off — and what to expect from us"
  Structure:
    - Code delivery above the fold — prominent, unmissable
    - Brand intro below — 2-3 sentences, no filler
    - CTA: "Shop Now" with code pre-applied or visible in button label
    - No competing CTAs

Email 2  (+24h)
  Subject: brand story email — no offer repeat
  The subscriber already has their code. This email builds desire and brand equity.
  Treat them as a converted subscriber, not a prospect.

Email 3  (+48h)
  Subject: social proof or bestsellers
  Product-led. Reviews, community, hero products.

Email 4  (+72h)   [conditional — only if discount has an expiry]
  Subject: code expiry urgency
  "Your [X]% off expires in 24 hours"
  Hard CTA. One link. This email only deploys if the offer code has an expiry set
  in the brand's discount configuration.
```

---

**Branch B — Organic Welcome Branch:**

For subscribers who joined without a discount being offered. Follows the existing welcome series doctrine from Section 20A exactly — brand story first, offer withheld (if configured) until Email 3.

```
Email 1  (immediate)
  Brand story — no offer
  Who you are, why you exist, what makes you different

Email 2  (+24h)
  Brand values + product introduction
  Category education, hero product features

Email 3  (+48h)
  First offer (only if brand's welcome_offer_mode = 'fixed' or 'conditional')
  For 'no_discount' brands: social proof or bestsellers

Email 4  (+72h)
  Urgency or social proof
  If offer was sent in Email 3: code expiry reminder
  If no offer: community, reviews, UGC
```

---

### Part 3 — Checkout Opt-In is a Hard Exclusion

`checkout_opt_in` subscribers just completed a purchase. They are not prospects — they are buyers. The welcome series was designed for prospects. Routing a fresh buyer into a welcome discount series creates two problems:

1. It sends them a discount they do not need — they already bought
2. It devalues the purchase they just made by showing them they could have paid less

VIYO flags this as a configuration error during onboarding if any brand tries to route checkout opt-in subscribers into the welcome series. The post-purchase flow is the correct destination.

```typescript
function validateWelcomeSeriesBrief(brief: WelcomeSeriesFlowBrief): void {
  if (!brief.signupContext) {
    throw new Error(
      'WelcomeSeriesBrief requires signupContext. Every welcome flow must know how subscribers arrived.'
    );
  }

  if (brief.signupContext === 'popup_discount' && brief.discountOfferedAtSignup === null) {
    throw new Error(
      'signupContext is popup_discount but discountOfferedAtSignup is null. ' +
      'The discount code must be specified when the signup source promised one.'
    );
  }

  if (brief.signupContext === 'checkout_opt_in') {
    throw new Error(
      'checkout_opt_in subscribers must not enter the welcome series. ' +
      'Route them to the post-purchase flow instead.'
    );
  }
}
```

This validation runs before any flow generation begins. If it throws, the generation pipeline aborts and the error surfaces in the VIYO admin panel.

---

### Part 4 — Klaviyo Flow Structure

The branched welcome series deploys to Klaviyo as a single flow with a conditional split at the entry point. VIYO generates the flow brief, the Klaviyo deploy payload, and the conditional split logic automatically.

```typescript
type SignupContext =
  | 'popup_discount'
  | 'popup_no_offer'
  | 'checkout_opt_in'
  | 'organic'
  | 'referral'
  | 'social_bio'
  | 'content_upgrade';

interface WelcomeSeriesFlowBrief extends BaseFlowBrief {
  flowType:               'welcome_series';
  signupContext:          SignupContext;
  discountOfferedAtSignup: string | null;   // e.g. "10OFF", null if no offer
  discountExpiry:         Date | null;      // drives Email 4 in Branch A
  welcomeOfferMode:       'no_discount' | 'fixed' | 'conditional';  // branch B config
}

// Klaviyo flow structure generated by VIYO
const klaviyoFlowPayload = {
  name: `VIYO — Welcome Series`,
  trigger: { type: 'list_subscribe' },
  actions: [
    {
      type: 'conditional_split',
      conditions: [
        {
          condition: 'profile.viyo_signup_context IN ["popup_discount", "social_bio"]',
          branch: 'A',  // discount delivery
        },
        {
          condition: 'profile.viyo_signup_context == "checkout_opt_in"',
          branch: 'EXIT',  // hard exit, no emails sent
        },
      ],
      default_branch: 'B',  // organic — everything else
    },
    // Branch A emails generated from WelcomeSeriesFlowBrief with signupContext=popup_discount
    // Branch B emails generated from WelcomeSeriesFlowBrief with signupContext=organic
  ],
};
```

---

### Part 5 — Settings: Signup Source Configuration

Route: `/settings/flows/signup-sources`

The brand tells VIYO which of their forms is which signup context. VIYO uses this to:
- Set the correct `viyo_signup_context` value on every submission
- Validate that checkout opt-in forms are not connected to the welcome series
- Surface warnings if any form is untagged (defaulting to `organic`)

```
┌──────────────────────────────────────────────────────────────────┐
│  Signup Source Configuration                                     │
│                                                                  │
│  Tell VIYO how subscribers arrive so the welcome series         │
│  delivers the right experience to each subscriber.              │
│                                                                  │
│  Homepage exit popup          [Popup with discount ▾]   ✓       │
│  Footer signup form           [Organic ▾]               ✓       │
│  Checkout opt-in              [Checkout opt-in ▾]       ✓       │
│  Instagram bio link form      [Social bio ▾]            ✓       │
│  Size guide download form     [Content upgrade ▾]       ✓       │
│                                                                  │
│  ⚠ 2 Klaviyo forms untagged — these will default to Organic     │
│  [View untagged forms]                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### What This Corrects in Section 20A

Section 20A's Welcome Series Offer Configuration (three modes: no_discount, fixed, conditional) remains valid for Branch B subscribers. The three modes govern Branch B only.

Branch A is not governed by the brand's offer mode setting — it is governed by the signup contract. A subscriber who was shown a discount must receive that discount in Email 1. This is non-negotiable and cannot be configured away. The brand's offer mode setting applies to organic subscribers, not popup-discount subscribers.

| Subscriber Type | Governs By | Email 1 Behavior |
|----------------|------------|-----------------|
| `popup_discount` | Signup contract | Discount delivered, always |
| `social_bio` | Signup contract (assumed discount) | Discount delivered |
| `organic`, `popup_no_offer`, `content_upgrade` | Brand offer mode setting (Section 20A) | No offer unless `fixed` mode |
| `checkout_opt_in` | Hard exclusion rule | No welcome email at all |

---

### Integration Map

| Section | Relationship to 20Z |
|---------|-------------------|
| **20A — Flow Generation System** | Section 20A's welcome series doctrine and three offer modes apply to Branch B. Branch A overrides the offer mode for discount-context subscribers. |
| **20B — Flow Intelligence System** | The conditional split at flow entry is built using Klaviyo's native conditional split action. 20B's gap detection flags a missing branched welcome series the same as a missing welcome series entirely. |
| **20S — ESP-Agnostic Sign-Up Forms** | VIYO forms set `viyo_signup_context` as a hidden field on submit. The form's `espRouting` config includes the signup context value to pass through to the ESP profile. |
| **20X — Discount Cap System** | The discount delivered in Branch A Email 1 is exempt from the discount cap system — it is a fulfillment of a signup promise, not a generated offer. `getEffectiveCap()` receives `context.type = 'signup_fulfillment'` and returns uncapped. |
| **Section 22 — Automatic Segmentation** | `viyo_signup_context` becomes a segmentation dimension. Brands can create segments of popup-discount subscribers, organic subscribers, etc. for targeted re-engagement. |

---

*Section 20Z added April 2026 — Signup-Aware Welcome Series branching architecture.*

---

## 20Y. Design System, Accessibility, Legal, and Team Access

### Why This Section Exists
The PRD defines what VIYO does, but this section defines the strict standards for how it looks, how it adapts to devices, how it includes all users (ADA/WCAG), how it complies with global privacy laws, and how multi-user teams collaborate securely. These are hard requirements for V1 launch.

---

### Part A: Responsive Design System

**1. Breakpoint Architecture (Tailwind)**
VIYO uses a mobile-first Tailwind configuration with strict breakpoint adherence.
- `sm`: 640px (Large phones)
- `md`: 768px (Tablets)
- `lg`: 1024px (Small laptops)
- `xl`: 1280px (Desktops)
- `2xl`: 1536px (Large monitors)

**2. Navigation Patterns**
- **Marketing Site:** Top navbar. On `sm` and below, links collapse into a hamburger menu. The primary CTA ("Start free") remains visible outside the hamburger at all times.
- **App Shell (Desktop `md` and up):** Persistent top navigation bar containing logo, primary links, token balance, notification bell, and user avatar dropdown.
- **App Shell (Mobile `sm` and below):** **Bottom Navigation Bar**. The top nav becomes a minimal header (Logo + Notifications). The primary navigation (Dashboard, Campaigns, Flows, Settings) moves to a fixed bottom bar. This ensures one-handed thumb reachability for core actions.

**3. Typography Scale**
VIYO uses a geometric sans-serif (e.g., Inter or Geist) for the UI.
- `h1`: Desktop `text-4xl` / Mobile `text-3xl` (Tracking: tight)
- `h2`: Desktop `text-3xl` / Mobile `text-2xl`
- `h3`: Desktop `text-2xl` / Mobile `text-xl`
- `body`: `text-base` (16px) for readability. Never use `text-sm` (14px) for primary reading text.
- `caption`: `text-sm` for metadata, timestamps, and secondary labels.

---

### Part B: ADA & WCAG 2.1 AA Compliance

VIYO must be fully accessible to users with disabilities, meeting WCAG 2.1 AA standards.

**1. Color Contrast**
- All text must meet a minimum contrast ratio of 4.5:1 against its background.
- UI components (buttons, inputs, active states) must meet a 3:1 contrast ratio.

**2. Keyboard Navigation & Focus**
- Every interactive element (links, buttons, form fields) must be reachable via the `Tab` key.
- A visible focus ring (`ring-2 ring-primary ring-offset-2`) must appear on focused elements. `outline-none` is strictly forbidden unless replaced by a custom visible focus state.

**3. Screen Reader Support (ARIA)**
- Icon-only buttons (like the notification bell) must have `aria-label` attributes.
- Complex UI states (like the campaign generation progress bar) must use `aria-live="polite"` to announce status changes to screen readers.
- All form inputs must have explicitly associated `<label>` elements.

**4. Pre-Flight Accessibility Enforcement**
- As defined in Section 20R, the Pre-Flight system uses Email on Acid to check the *generated emails* for accessibility (alt text, contrast, semantic HTML).

---

### Part C: Cookie Consent & Legal Pages

**1. Cookie Consent Architecture**
- **Banner:** A persistent bottom banner shown to all unauthenticated EU/UK/CA visitors, and all authenticated users on first login.
- **Categories:** Essential (Auth, Security), Analytics (Datadog RUM), Marketing (Ads).
- **Default State:** Essential only. Analytics and Marketing require explicit opt-in.
- **Storage:** Consent state stored in a `viyo_consent` cookie and synced to the `users` table for authenticated users.

**2. Required Legal Pages (MDX)**
- `/privacy`: Privacy Policy (Includes CCPA "Do Not Sell" disclosure, AI training data isolation guarantee, and sub-processor list).
- `/terms`: Terms of Service (Includes credit non-refundability, CAN-SPAM liability transfer).
- `/dpa`: Data Processing Agreement (Required for B2B EU sales).
- `/cookies`: Detailed cookie policy and link to reopen the consent manager.

---

### Part D: Account Lifecycle Emails (Transactional)

VIYO does not rely on unbranded Supabase defaults. All auth and lifecycle emails are sent via Resend using branded React Email templates.

**1. Supabase Auth Webhook Integration**
Supabase is configured to use custom SMTP (via Resend) and custom email templates.
- **Magic Link / Signup:** `[VIYO] Your login link` — Branded template with a single large button.
- **Password Reset:** `[VIYO] Reset your password` — Branded template.
- **Email Change Confirmation:** `[VIYO] Confirm your new email` — Branded template.

**2. Welcome Email Sequence**
Triggered via Inngest when `users` record is created.
- **Sender:** `sarah@viyo.new` (Plain text, personal tone).
- **Subject:** `Welcome to VIYO — let's build your brain`
- **Body:** Brief welcome, link to the onboarding flow, and a direct question: "What's the biggest bottleneck in your email workflow right now?"

**3. Account Deletion Confirmation**
Triggered at the end of the GDPR Teardown Worker (Section 20F).
- **Sender:** `system@viyo.new`
- **Subject:** `[VIYO] Your account and data have been permanently deleted`
- **Body:** Confirmation that all brand data, assets, and API keys have been purged in compliance with GDPR Article 17.

---

### Part E: Team Access & Role-Based Access Control (RBAC)

VIYO supports multi-user collaboration for brands, following standard B2B SaaS patterns (similar to Klaviyo and Shopify).

**1. Roles and Permissions**
There are three tiers of access for a brand:
- **Owner:** The creator of the brand workspace. Full access, including billing, API keys, and account deletion. Cannot be deleted without transferring ownership first.
- **Admin:** Can invite/remove users, edit brand settings, and manage all campaigns. Cannot access billing or delete the workspace.
- **Member:** Can generate campaigns, edit copy/images, and deploy to Klaviyo. Cannot invite users, view billing, or change core brand settings (like brand voice or integrations).

**2. Invitation Flow (Reusable Invite Link Pattern)**

VIYO uses a **reusable invite link** architecture instead of single-use tokens. This solves the problem where Supabase's `verifyOtp` consumes the token on first click — if the user didn't complete signup, the link would be dead. With the reusable pattern, the invite link works every time the user clicks it, until they fully complete account setup.

- **Trigger:** Owner or Admin goes to `Settings > Team` and clicks "Invite Member". They enter an email and select a role (Admin or Member).
- **Record Creation:** A row is added to the `invitations` table with a secure, 64-character cryptographically random token (`crypto.randomBytes(32).toString('hex')`). The `expires_at` field is set to `NOW() + 72 hours`.
- **Email Delivery:** Resend delivers `[VIYO] You've been invited to join {Brand Name}` with a link to `https://app.viyo.new/auth/invite/[token]`.
- **How the Link Works (Reusable):** Each time the user clicks the invite link:
  1. The `/auth/invite/[token]` route handler looks up the token in the `invitations` table.
  2. Validates the invite is still `pending` (not revoked, not expired, user has not completed setup).
  3. Calls `supabase.auth.admin.generateLink({ type: 'magiclink', email: invitation.email })` to create a **fresh** magic link.
  4. Updates `last_sent_at` on the invitation record.
  5. Redirects the user to the generated magic link URL, which handles Supabase Auth session creation.
  6. After auth, the `/auth/callback` handler detects the pending invitation context (stored in `sessionStorage` before redirect) and routes the user to the invite acceptance flow.
- **Link Remains Reusable Until:** The invite link continues to generate fresh magic links on every click until **any** of these conditions is met:
  - The user accepts the invite **and** sets their password (completes account setup) — the `accepted_at` timestamp is set and status changes to `accepted`.
  - An Owner or Admin revokes the invite.
  - The 72-hour expiry window passes. A daily Inngest cron job sweeps and marks expired invites.
- **Acceptance Completion:** After the user authenticates via the magic link, they land on `/invite/accept` which shows the brand name, their assigned role, and a "Join Workspace" button. If they don't have a password set, they are prompted to create one. Once they confirm and set their password, the invitation status changes to `accepted`, a `brand_members` row is created, and the invite link becomes inactive.
- **Resend Invite:** Admins can click "Resend" on pending invites in the Team Settings UI, which triggers a new email with the same reusable link. The `last_sent_at` timestamp is updated.
- **Revocation:** Admins can click "Revoke" on pending invites in the UI, which sets the invitation status to `revoked` and immediately invalidates the token. Any subsequent clicks on the link will show an "Invite Revoked" error page.
- **Rate Limiting:** The `/auth/invite/[token]` endpoint is rate-limited to **5 magic link generations per hour per token** to prevent abuse. Exceeding this shows a "Too many attempts, please try again later" message.
- **Security:** The invite token is never used as an auth credential itself — it only triggers the generation of a fresh Supabase magic link. This means even if the token is leaked, the attacker still needs access to the invitee's email inbox to complete authentication.

**3. Removing Members**
- Owners/Admins can remove members via the Team Settings UI.
- When removed, the user's `brand_members` record is deleted.
- Because Supabase RLS policies are tied to the `brand_members` table, access is revoked instantly on the next API call.
- The removed user's session is forcibly terminated via Supabase Admin API.

**4. UI/UX Elements**
- **Team Settings Page:** Table showing Active Members (Name, Email, Role, Last Login) and Pending Invites (Email, Role, Sent Date, Expiry Date, Resend/Revoke actions). The "Resend" button re-sends the same reusable invite link via email and updates `last_sent_at`. The "Revoke" button sets the invite status to `revoked`.
- **Role Badges:** Visual indicators next to names showing `Owner`, `Admin`, or `Member`.
- **Invite Status Indicators:** Pending invites show a countdown timer to expiry. Expired invites are greyed out with an option to "Re-invite" (creates a new invitation record).

**5. V2 Granular Permissions (Future)**
- For V1.1, the 3-role system (Owner, Admin, Member) is sufficient to cover 95% of use cases.
- In V2, if Enterprise customers request it, the `brand_members` table and UI will be expanded to support Klaviyo-style granular permission scopes (e.g., "can view flows but cannot edit campaigns", "can view analytics but cannot deploy").
- The V1.1 implementation must ensure the RLS policies and middleware are structured cleanly so granular scopes can be added later without rewriting the auth foundation.
---

## 21. Non-Negotiable Implementation Rules

1. **PostgreSQL only.** No MySQL. Drizzle schemas must use `pg-core`.
2. **Supabase Auth only.** No Better Auth. RLS is mandatory on every brand-linked table.
3. **Render for heavy compute.** No LLM calls or image generation on Vercel Edge or serverless functions.
4. **Inngest for orchestration.** No BullMQ, no custom queue.
5. **No overage billing.** Hard stop at 0 tokens. No exceptions.
6. **75KB MJML output limit.** `ClippingError` must be thrown; do not silently truncate.
7. **No model aliases.** Use dated model strings: `claude-3-5-sonnet-20241022`, `gemini-2.5-flash`, `imagen-4.0-generate-001`.
8. **Max 1 VeriClaw correction cycle.** Do not loop the Copywriter Brain more than once.
9. **Token reserved before generation starts.** Token committed only on success. Always refunded on failure.
10. **No "+X% uplift" language.** Remove from all user-facing copy and marketing materials.

---

## 22. Open Questions and Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Shopify `expiring=1` offline token model | High | Lead engineer verifies OAuth flow on live test store in Week 1 before any production traffic |
| Klaviyo Metric IDs are account-specific UUIDs | Medium | OAuth sync job dynamically fetches and stores `klaviyo_click_metric_id` and `klaviyo_order_metric_id` in `brands` table |
| Imagen 4 quota limits on Vertex AI | Medium | Submit quota increase request immediately — 2-4 business day review |
| Shopify Partner App review | High | Submit unlisted app for review immediately — 3-7 business day review before any user can connect |
| Stripe KYC/KYB | High | Begin business verification immediately — 1-3 business day review |

---

## 23. External Account Setup (Start Immediately)

These have review periods that block development. Start them **now**, in parallel with coding:

| Account | Action Required | Timeline |
|---------|----------------|----------|
| Shopify Partner | Create Unlisted Public App, submit for review | 3-7 business days |
| Google Cloud | Create project, enable Vertex AI API, request Imagen 4 quota increase | 2-4 business days |
| Stripe | Complete KYC/KYB, configure webhook endpoints, create Top-Up Pack price IDs | 1-3 business days |
| Klaviyo | Create OAuth App — instant approval | Instant |
| Supabase | Create project, enable pgvector, enable Realtime on `campaign_sessions` | Instant |
| Inngest | Create account, get signing key | Instant |
| Upstash | Create Redis instance | Instant |
| Cloudflare R2 | Create bucket, configure `assets.viyo.email` custom domain | Instant |
| Datadog | Create account, get API key | Instant |
| Resend | Create account, verify `viyo.email` sending domain | Instant |

---


# R24 — Multi-Model Image Pipeline (Enterprise Architecture)

**Status:** Locked & Verified (V3 - Dual-Scoring Architecture)
**Owner:** Core Engineering
**Type:** Production Specification

## 1. System Overview

The VIYO Image Pipeline is not a simple wrapper around generation APIs. It is a **Three-Tiered Image Intelligence System** designed to learn, cache, and execute proven prompt patterns. To prevent "Model Collapse" (where AI-grading-AI loops converge to generic outputs), the system uses a **Dual-Scoring Architecture** combining automated objective filtering with human aesthetic curation.

### The Three Tiers
1. **Tier 1: The Learning Engine (Seeding)** — Ingests real marketing emails, extracts images, generates variants across models, filters failures, and submits to human curation to build the pattern database.
2. **Tier 2: The Pattern Database (Caching)** — A pgvector-backed database storing proven prompt patterns indexed by category, style, model, and human preference score.
3. **Tier 3: The Production Router (Live)** — Matches customer requests to proven patterns, injects product data, and routes to the optimal direct API.

## 2. The Dual-Scoring Learning Loop (Anti-Convergence)

To build the Pattern Database without falling into the "B+ Trap" (generic AI convergence), the Tier 1 learning loop splits evaluation into two distinct roles:

### Step 1: The Bouncer (Automated Objective Filter)
A fast, cheap Vision LLM (e.g., GPT-4o-mini) evaluates generated images strictly for objective failures. It does NOT judge aesthetics.
- **Checks:** Is the text spelled correctly? Is the product present? Are there severe anatomical anomalies?
- **Action:** Pass or Fail. Failures are discarded. Passes move to the Curator.

### Step 2: The Curator (Human RLHF)
Passing images appear in the internal VIYO Curator Dashboard (R17). A human team member evaluates aesthetic quality, brand energy, and scroll-stopping power.
- **Checks:** Is this visually compelling? Does it match the original email's energy?
- **Action:** Swipe Right (Approve) or Swipe Left (Reject).

### Step 3: Programmatic Optimization (DSPy)
Approved patterns are processed by DSPy, treating prompt optimization as a machine learning compilation step to reinforce the human-approved aesthetic without manual prompt drift.

## 3. Tier 1: The Learning Engine (Inngest Pipeline)

```typescript
import { inngest } from '@/lib/inngest/client';
import { extractImageJsonSchema } from '@/lib/ai/vision';
import { generateVariants } from '@/lib/ai/image-router';
import { objectiveBouncerCheck } from '@/lib/ai/qa';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const processIngestedImage = inngest.createFunction(
  { id: 'process-ingested-image', retries: 3 },
  { event: 'image.ingested' },
  async ({ event, step }) => {
    const { imageUrl, sourceEmailId, category } = event.data;

    // 1. Deconstruct: Vision LLM reverse-engineers the image
    const jsonSchema = await step.run('extract-schema', async () => {
      return await extractImageJsonSchema(imageUrl);
    });

    // 2. Generate: Create variants across multiple direct APIs
    const variants = await step.run('generate-variants', async () => {
      return await generateVariants(jsonSchema);
    });

    // 3. The Bouncer: Automated objective filtering
    const passedVariants = await step.run('bouncer-check', async () => {
      const results = [];
      for (const variant of variants) {
        const pass = await objectiveBouncerCheck(variant.url, jsonSchema);
        if (pass) results.push(variant);
      }
      return results;
    });

    // 4. Queue for Human Curator
    await step.run('queue-for-curator', async () => {
      if (passedVariants.length === 0) return;
      
      await supabaseAdmin.from('curator_queue').insert(
        passedVariants.map(v => ({
          image_url: v.url,
          source_image_url: imageUrl,
          prompt_used: v.prompt,
          model_used: v.model,
          json_schema: jsonSchema,
          category: category,
          status: 'pending'
        }))
      );
    });

    return { queued: passedVariants.length };
  }
);
```

## 4. Tier 2: The Pattern Database (pgvector Schema)

*Note: Full DDL is maintained in R20. This is the logical representation.*

```sql
-- The core pattern cache
CREATE TABLE image_prompt_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  layout_type VARCHAR(100) NOT NULL,
  model_sequence JSONB NOT NULL,
  prompt_template TEXT NOT NULL,
  json_schema JSONB NOT NULL,
  human_approval_score NUMERIC(3,2) DEFAULT 0.00,
  usage_count INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Tier 3: The Production Router (Retrieval & Execution)

When a customer requests an image, the system retrieves a proven pattern rather than generating from scratch.

```typescript
import { supabase } from '@/lib/supabase/client';
import { generateWithModel } from '@/lib/ai/direct-apis';

export async function generateProductionImage(request: {
  category: string;
  productDescription: string;
  intent: string;
  productImageUrl?: string;
}) {
  // 1. Retrieve the best proven pattern for this scenario
  const { data: patterns } = await supabase
    .from('image_prompt_patterns')
    .select('*')
    .eq('category', request.category)
    .order('human_approval_score', { ascending: false })
    .limit(1);

  if (!patterns || patterns.length === 0) {
    throw new Error('No proven pattern found for this category');
  }

  const pattern = patterns[0];
  
  // 2. Template Injection
  const finalPrompt = pattern.prompt_template.replace('[PRODUCT_DESC]', request.productDescription);

  // 3. Execute Model Sequence (Direct APIs)
  return await executeModelSequence(pattern.model_sequence, finalPrompt, request.productImageUrl);
}

async function executeModelSequence(sequence: string[], prompt: string, initImage?: string) {
  let currentImage = initImage;

  for (const model of sequence) {
    // Calls direct APIs (NanoBanana, Ideogram, Flux), never aggregators in production
    currentImage = await generateWithModel(model, prompt, currentImage);
  }

  return currentImage;
}
```

## 6. The Objective Bouncer (QA Implementation)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function objectiveBouncerCheck(generatedUrl: string, schema: any): Promise<boolean> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a strict objective QA filter. Do NOT judge aesthetics.
        Check ONLY:
        1. Are all required text elements present and spelled correctly?
        2. Is the primary product clearly visible?
        3. Are there severe anatomical anomalies (e.g., 6 fingers)?
        Return ONLY valid JSON: { "pass": boolean, "reason": "string" }`
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Required Schema: ${JSON.stringify(schema)}` },
          { type: "image_url", image_url: { url: generatedUrl } }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.pass === true;
}
```

## 7. Future Extensibility: The Preference Classifier

Once the human curation phase (Tier 1) collects >5,000 "Swipe Right" and "Swipe Left" decisions, VIYO will train a lightweight Vision-Language Model (VLM) fine-tuned on this dataset. This **Preference Classifier** will eventually replace the human curator, allowing the learning loop to run autonomously at scale while preserving the human aesthetic taste captured during seeding.


## 6. Integration with the Self-Hosted Countdown Timer Service

Beyond static image generation, true creative campaigns often require dynamic elements like live countdown timers. This is handled outside the image generation models via the Self-Hosted Countdown Timer Service.

### 6.1 Self-Hosted Timer Service Architecture
When the Offer Brain dictates an urgency mechanism (e.g., "Sale ends in 4 hours"), the Email Design Brain does not attempt to generate a static image of a timer. Instead, it calls the Self-Hosted Countdown Timer Service.
1.  VIYO sends a request to Self-Hosted Timer Service with the `end_date`, `background_color`, and `text_color` matching the brand's style guide.
2.  Self-Hosted Timer Service returns a dynamic GIF URL.
3.  The Email Design Brain embeds this URL directly into the MJML `<img>` tag.

### 6.2 Cost and Tier Gating
The Self-Hosted Countdown Timer Service costs $0/month (self-hosted) for 3 million views. To protect margins, dynamic countdown timers will be a gated feature, available only on the **Growth ($99/mo)** and **Agency ($249/mo)** tiers. Starter tier users will receive static "Urgency" copy without the live visual timer.
# Research 25: Video/IG Ingestion Module (Hybrid OpenClaw Architecture)

## 1. Executive Summary
The ability to ingest strategic marketing content from video platforms (Instagram Reels, YouTube Shorts, TikTok) is a massive competitive advantage. However, processing video files in the cloud (downloading, frame extraction, OCR, audio transcription) is computationally expensive and slow.

This document outlines a **Hybrid Ingestion Architecture**. By leveraging an OpenClaw skill running locally on the user's machine (or via Manus agent credits), the heavy lifting of video processing is offloaded from VIYO's cloud infrastructure. VIYO only receives clean, structured JSON payloads containing the extracted intelligence, which the Top Brain then analyzes to register new marketing patterns.

## 2. The Hybrid OpenClaw Architecture

The system is divided into two distinct components: the **Local OpenClaw Extractor** (running on the client side) and the **VIYO Cloud Analyzer** (running on VIYO's servers).

### 2.1 The Local OpenClaw Extractor
This is a lightweight Python script packaged as an OpenClaw skill. When a user provides an Instagram Reel URL, the skill executes locally:
1.  **Download:** Uses `instaloader` or `yt-dlp` to download the raw MP4 file to the local disk.
2.  **Frame Extraction:** Uses local `ffmpeg` to extract frames at 1-second intervals (`ffmpeg -i video.mp4 -vf fps=1 frame_%04d.png`).
3.  **Audio Transcription:** Uses the local machine's resources (or a lightweight API call if necessary, though local Whisper is preferred if hardware permits) to generate a full transcript of the audio track.
4.  **Screenshot Detection:** Uses a lightweight local vision model (e.g., a quantized MobileNet or a fast API call to Gemini 2.5 Flash) to identify which extracted frames contain actual email screenshots, discarding the rest.
5.  **Payload Assembly:** Compiles the transcript and the base64-encoded email screenshots into a single JSON payload.

### 2.2 The VIYO Cloud Analyzer
The OpenClaw skill sends an authenticated POST request to VIYO's ingestion API (`/api/v1/ingest/video-payload`). The VIYO Cloud Analyzer then takes over:
1.  **OCR & Layout Extraction:** VIYO feeds the base64 email screenshots to Gemini 3 Flash Vision to extract the copy, layout structure, colors, fonts, offer type, and CTA text.
2.  **Strategic Commentary Extraction:** The audio transcript is fed to Gemini 3 Flash with a specific prompt: "Extract the email marketing strategy being explained. What technique is being taught? Why does it work? What metrics are cited?"
3.  **Pattern Registration:** The Top Brain merges the visual data and the strategic commentary, creating a new "Skill" or "Pattern" in the central database, making it available for the CMO Brain to deploy for future campaigns.

## 3. Economic Advantages of the Hybrid Model

By offloading the video processing, VIYO's cloud costs drop to near zero for the ingestion phase.

### 3.1 Cost Comparison (Per 2-Minute Video)
*   **Fully Cloud-Hosted Model:**
    *   Server compute (download + ffmpeg): ~$0.02
    *   Whisper API Transcription: $0.012
    *   Vision API (all frames): ~$0.05
    *   **Total Cloud Cost:** ~$0.08 per video.
*   **Hybrid OpenClaw Model:**
    *   Server compute (download + ffmpeg): $0.00 (handled locally)
    *   Transcription: $0.00 (handled locally)
    *   Vision API (only filtered frames): ~$0.005
    *   Strategy Extraction LLM: ~$0.005
    *   **Total Cloud Cost:** ~$0.01 per video.

This represents an 87.5% reduction in cloud infrastructure costs, allowing VIYO to scale its ingestion engine infinitely without degrading profit margins.

## 4. Admin UI and Taxonomy Updates

To support this new ingestion vector, the Top Brain Admin Portal requires updates.

### 4.1 The Ingestion Dashboard
The admin dashboard will feature a new "Video Ingestion" tab. Since the heavy lifting is done locally via OpenClaw, the UI simply provides a connection status indicator ("OpenClaw Agent Connected") and a live feed of incoming JSON payloads.

### 4.2 Taxonomy Additions
The central pattern database must be expanded to accommodate insights derived from video commentary:
*   `source_type`: 'competitor_email', 'panoramata_api', 'video_commentary'.
*   `source_url`: The original Instagram Reel or YouTube URL.
*   `strategic_thesis`: A text field storing the core argument extracted from the audio transcript (e.g., "Mystery discounts drive higher CTR because they create an information gap.").
*   `confidence_score`: A metric (0-100) indicating how clearly the visual evidence aligns with the audio claims.

## 5. Implementation Roadmap

1.  **Phase 1 (OpenClaw Skill Development):** Build and test the Python script for downloading, frame extraction, and transcription. Package it as an OpenClaw skill.
2.  **Phase 2 (VIYO API Endpoint):** Develop the `/api/v1/ingest/video-payload` endpoint on VIYO's backend to receive and validate the JSON payloads.
3.  **Phase 3 (Top Brain Integration):** Update the Top Brain LLM prompts to analyze the combined visual and audio data, extracting actionable marketing patterns.
4.  **Phase 4 (Admin UI):** Build the monitoring dashboard in the Top Brain Admin Portal.
# Research 26: Creative Concept Mode (AI Pitch Architecture)

## 1. Executive Summary
The standard VIYO workflow is optimized for speed: the user provides a brief, and the Council of Brains immediately generates the final email. However, for high-stakes campaigns (e.g., Black Friday, product launches), brands often want to explore radically different creative directions before committing to production.

**Creative Concept Mode** bridges this gap by inserting an "Agency Pitch" step into the workflow. Instead of generating one final email, the CMO Brain generates three distinct conceptual mood boards. The user selects or refines a concept, and *then* the system executes the full build. This mode can be triggered manually, or the AI can proactively suggest it when it detects a high-stakes brief.

## 2. The UX Flow

### 2.1 Manual Trigger
On the `/create` screen, alongside the primary "Generate Email" button, there is a secondary button: **"Pitch Me Concepts."** Clicking this bypasses the standard production pipeline and routes the brief exclusively to the CMO Brain for ideation.

### 2.2 AI-Triggered Override (The "Smart Intercept")
If the user clicks "Generate Email," the Intent Router first evaluates the brief's stakes.
*   **High-Stakes Indicators:** Words like "Black Friday," "biggest launch," "open rates are tanking," "we need something crazy," or "pattern interrupt."
*   **The Intercept:** If high stakes are detected, a modal intercepts the generation process:
    > *"This sounds like a major campaign. I've prepared 3 creative concepts for you to review before building. [View Concepts] or [Just Build It]"*
*   This ensures the AI acts as a proactive strategic partner without ever becoming a hard blocker (one click bypasses the pitch).

### 2.3 The Concept Pitch UI
The user is presented with three "Concept Cards." Each card contains:
1.  **Concept Title:** e.g., "The Sunburn Apology"
2.  **Strategic Angle:** Why this works (e.g., "Self-deprecating humor lowers defenses.")
3.  **Visual Direction:** A text description of the hero image (e.g., "A chaotic meme-style graphic.")
4.  **Subject Line:** The proposed hook.
5.  **Action Buttons:** [Select This Concept] or [Tweak This Concept].

## 3. LLM Architecture: The CMO Brain Pitch Prompt

To generate these concepts, the CMO Brain requires a specialized prompt that forces divergence in creative thought.

**System Prompt Snippet:**
> "You are the Chief Marketing Officer. The user has requested an email campaign. Do NOT write the full email. Instead, pitch THREE radically different creative concepts.
>
> Concept 1 (The Safe Play): A highly optimized, standard e-commerce approach. Educational, clean, authority-driven.
> Concept 2 (The Pattern Interrupt): A visually or structurally unexpected approach. Think fake UI screens, text messages, or gamification.
> Concept 3 (The Wildcard): A high-risk, high-reward approach. Humor, controversy, extreme curiosity gaps, or aggressive urgency.
>
> Return the response as a JSON array of 3 objects containing: title, strategic_angle, visual_direction, and subject_line."

## 4. Admin Settings & Taxonomy

### 4.1 Brand Strategy Settings
Brands have different appetites for creative risk. In the Brand Settings > Strategy tab, a new dropdown is introduced: **Creative Autonomy**.
1.  **"Let VIYO Decide" (Default):** Speed is prioritized. The AI only intercepts with a pitch if it detects high-stakes language.
2.  **"Pitch Me First":** The AI ALWAYS pitches 3 concepts for every single email, acting like a traditional agency.
3.  **"Just Build It":** The AI NEVER intercepts. The "Pitch Me Concepts" button is still available manually, but the AI will never proactively suggest a pitch.

### 4.2 Cost Implications
Generating a pitch is extremely cheap. It requires a single call to Gemini 3 Flash (or GPT-4o-mini) to generate text.
*   **Pitch Generation Cost:** ~$0.001 per pitch.
*   Since the pitch prevents the system from generating expensive, unwanted image assets (which cost ~$0.08+), Creative Concept Mode actually *saves* money on high-stakes campaigns by ensuring the user approves the direction before the expensive production pipeline runs.

## 5. Execution Handoff

Once the user clicks `[Select This Concept]` on a Concept Card, the selected concept's JSON data is appended to the original brief. The entire package is then passed to the standard Council of Brains pipeline.

Crucially, the prompt to the Copywriter and Image Design Brains is prepended with:
> "Execute this email strictly adhering to the following approved creative concept: [Concept JSON]."

This guarantees that the final output perfectly matches the pitch the user approved, maintaining absolute creative control.

---

## 34. End of Document

This concludes the VIYO V1 Master PRD.ved.


# ADDENDUM: ARCHITECTURE LOCK V3

# VIYO Architecture Lock (V3)
**Status:** Locked & Verified
**Date:** April 2026
**Scope:** Foundation Architecture (R17 - R31)

## 1. Executive Summary
This document serves as the definitive architectural handshake for VIYO. It consolidates the key decisions from the 15 R-Series Research Specifications into a single, actionable blueprint. Any new task, agent, or developer must read this document before writing code.

VIYO is not a wrapper around LLM APIs. It is a **self-learning, self-healing AI email marketing platform** with a defensible moat built on a proprietary pattern database, a dual-scoring learning loop, and a multi-model intelligence layer.

## 2. The Core Moat: The Learning Engine (R24, R25)
VIYO's primary competitive advantage is its ability to learn from real-world marketing data and cache proven patterns.

### 2.1 The Three-Tiered Image Intelligence System
Image generation is not a per-customer API call; it is a retrieval problem.
1. **Tier 1 (Seeding/Learning):** VIYO ingests thousands of marketing emails (R25), extracts JSON style schemas, generates variants across multiple direct APIs (NanoBanana 2 Pro, Ideogram V3, Seedream 4.5, Flux), and runs them through a dual-scoring QA loop.
2. **Tier 2 (Pattern Database):** Proven prompt patterns are stored in a pgvector database, indexed by category, style, model, and human preference score.
3. **Tier 3 (Production Router):** When a customer requests an image, VIYO retrieves the best proven pattern, injects the customer's product data, and routes to the optimal model.

### 2.2 The Dual-Scoring Learning Loop
To prevent "Model Collapse" (where AI-grading-AI loops converge to generic, boring outputs), VIYO uses a split evaluation model:
*   **The Bouncer (Automated):** A fast Vision LLM checks for objective failures (spelling, anatomy, product presence). Failures are discarded.
*   **The Curator (Human RLHF):** A human evaluates the passing images for aesthetic quality, brand energy, and scroll-stopping power via a high-speed Swipe UI (R17).
*   **The Preference Classifier (VLM):** After 5,000+ human swipes, a fine-tuned Vision-Language Model takes over 95% of the Curator's workload, scaling the learning loop autonomously while preserving human taste (R19).

## 3. The Council of Brains (R19)
VIYO's intelligence is orchestrated by specialized, communicating LLM agents.
*   **CMO Brain:** The orchestrator. Defines the strategy, target audience, and campaign flow.
*   **Copywriter Brain:** Writes the text, matching the extracted Brand Voice.
*   **Offer Brain:** Determines the optimal discount/urgency mechanics based on margin constraints.
*   **Image Design Brain:** Routes visual requests to the optimal model(s) using the Pattern Database.
*   **Email Design Brain:** Assembles the final MJML using Composable Sections (R27).
*   **Critic Brain:** The internal QA gate. Reviews the assembled email against the brief and Brand Voice.

## 4. Infrastructure & Data (R20, R21)
*   **Database:** Supabase (PostgreSQL) with pgvector for the Pattern Database and Brand Voice embeddings. Strict Row Level Security (RLS) enforces tenant isolation.
*   **Compute:** Next.js (Vercel/Render) for the core app, Cloudflare Workers for edge services (Timer Service - R28), and Inngest for async job orchestration (learning loop, data extraction).
*   **Storage:** Cloudflare R2 for all generated assets and brand uploads, served via a custom CDN.

## 5. Key Subsystems
*   **Composable Sections (R27):** Emails are assembled from 32+ standardized, modular sections (hero, product grid, footer) using VIYO-UTL (Universal Templating Language) and compiled to MJML.
*   **Platform Abstraction Layer (R29):** VIYO translates its internal data models into vendor-specific syntax (Klaviyo, Mailchimp) via an adapter pattern, ensuring platform agnosticism.
*   **Self-Healing Timers (R28):** Countdown timers are rendered via Go WASM on Cloudflare Workers and include self-healing logic to gracefully transition to "Offer Expired" states without broken images.
*   **Cost Reconciliation (R23):** Every LLM token and image generation API call is tracked and reconciled against the customer's subscription tier to protect margins.

## 6. Global Internal Admin Architecture (VIYO HQ)
The platform includes a comprehensive internal admin suite (R17) for managing the self-learning engine:
*   **Curator Dashboard:** The RLHF Swipe UI for training the Preference Classifier.
*   **Pattern Database Browser:** Search and manage proven prompt patterns.
*   **Model Performance Comparison:** Track cost, speed, and quality across all integrated image models.
*   **Email Style Scoring:** Monitor the performance of different email layouts and typography styles based on real-world engagement data.

## 7. Development Directives
1. **Direct API Always:** Do not use aggregator middlemen (e.g., Kie.ai) in production. Connect directly to model APIs (OpenAI, Anthropic, Ideogram, Google).
2. **Zero Padding:** All code must be production-grade. No HTML comment padding or skeleton structures.
3. **Cross-Spec Wiring:** Every new feature must be wired into the database schema (R20), infrastructure (R21), security (R22), and admin UI (R17).
