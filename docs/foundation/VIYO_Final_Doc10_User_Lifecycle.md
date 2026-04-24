# Document 10: User Lifecycle & Interaction Map
**VIYO: AI Email Creative Operating System**

This document defines the 11-stage state machine for the VIYO user journey. It maps exactly what the User sees, what the Frontend renders, what the Backend computes, and what External APIs are called at every stage.

## Token Cost Reference
- **Campaign email generation:** 45,000 tokens
- **Flow email generation:** 45,000 tokens
- **A/B variant (each additional):** 20,000 tokens
- **Subject line regeneration:** 5,000 tokens
- **Image regeneration (Multi-Model): 10,000 tokensns
- **Segment creation (user-initiated):** 10,000 tokens
- **On-demand signal sync (90-day):** 25,000 tokens
- **Standalone SMS campaign:** 8,000 tokens
- **Free plan monthly allowance:** 500,000 tokens

---

## Phase 1: ONBOARDING

### Stage 1: Discovery — The Landing Page
*Value before friction.*

**USER — What the user sees and does**
- Arrives at viyo.email
- Reads the headline: "From first idea to live Klaviyo campaign in under 10 minutes"
- Sees a single input box: "What email do you want to create?"
- Types a campaign idea (e.g. "summer sale for my VIP customers")
- Hits Enter — the idea is submitted

**FRONTEND — UI behavior and state changes**
- Renders the landing page with one dominant input — no navigation, no distractions
- On Enter: saves idea to `sessionStorage` keyed to the session ID
- Routes user to `/auth/signup` with session ID as a query param
- The input box CTA text: "Generate Email →" (forward momentum)

**BACKEND — API, workers, and database**
- No backend call required at this stage
- Session storage is client-side — zero latency, zero API round-trip

**STAGE OUTCOME:** Campaign idea saved to session storage — preserved through signup, no work lost.

### Stage 2: Sign Up — Authentication
*Frictionless. The idea they typed is waiting for them on the other side.*

**USER — What the user sees and does**
- Chooses: email/password or magic link (most choose magic link)
- Enters email, clicks the magic link in their inbox
- Lands on dashboard — their typed campaign idea is already pre-filled
- Sees a low-key prompt: "Connect your store to unlock full intelligence"

**FRONTEND — UI behavior and state changes**
- Auth form with 2 options — email/password and magic link
- On successful auth: reads campaign idea from `sessionStorage`
- Restores idea into the brief input field on the dashboard
- Shows onboarding prompt: "Connect Klaviyo first for the best results"
- Clears `sessionStorage` entry after restoration

**BACKEND — API, workers, and database**
- Supabase Auth creates record in `auth.users`
- Database trigger creates matching `brands` and `users` table records
- Issues Free plan: 500,000 tokens/month — no credit card, no expiry
- Sets `brands.setup_step = "integrations"`
- Sets `brands.plan_id = "free"`, `brands.token_balance = 500000`
- PostHog event: `user_signed_up` fired

**STAGE OUTCOME:** Account active · 500,000 free tokens (Free plan) · Campaign idea pre-filled on dashboard.

### Stage 3: Connect — Klaviyo & Shopify OAuth
*This is where VIYO gets its intelligence. Everything depends on this step.*

**USER — What the user sees and does**
- Sees two cards: Klaviyo and Shopify — each showing exactly what VIYO reads/writes
- Clicks "Connect Klaviyo" → redirected to Klaviyo OAuth screen
- Authorizes — redirected back, card shows live counts: "12,847 subscribers · 34 campaigns · 6 flows"
- Clicks "Connect Shopify" → enters `.myshopify.com` domain → Shopify OAuth
- Authorizes — card shows: "847 products across 12 categories"
- Can skip either connection (URL crawl mode as fallback)

**FRONTEND — UI behavior and state changes**
- Connect page: two cards with permission transparency
- On Klaviyo connect: calls `GET /api/v1/auth/klaviyo/initiate`
- On Shopify connect: calls `GET /api/v1/auth/shopify/initiate?shop={domain}`
- After each callback: SSE stream shows live data counts appearing in real-time
- Cards animate from "Connecting..." to "Connected ✓" with counts

**BACKEND — API, workers, and database**
- Klaviyo OAuth: PKCE code_verifier generated, challenge computed, stored in `klaviyo_pkce_store`
- Callback: retrieves verifier, exchanges code for access + refresh tokens
- Tokens AES-256-GCM encrypted, stored in `klaviyo_connections`
- Inngest fires `klaviyo.sync.initial` → segments fetched, stored in `audience_map`
- Discovers Klaviyo metric IDs (click + order) — account-specific UUIDs stored in `brands` table
- Shopify OAuth: state nonce generated, stored in Upstash Redis (10-min TTL)
- Callback: HMAC signature validated, state nonce checked
- Offline access token encrypted, stored in `shopify_connections`
- Inngest fires `shopify.sync.initial` → products fetched, stored in `products` table + Asset Vault
- Product Intelligence: CMO Brain auto-tags all products with occasion types and categories

**EXTERNAL SYSTEMS**
- Klaviyo OAuth server
- Shopify OAuth server
- Upstash Redis (CSRF protection)
- Cloudflare R2 (Asset Vault cache)

**STAGE OUTCOME:** Tokens encrypted and stored · Products and segments synced · Metric IDs discovered · Brain build begins.

### Stage 4: Brain Build — Intelligence Ingestion
*VIYO goes to work. 5 data layers. Real-time SSE narration. The Personal Brain is born.*

**USER — What the user sees and does**
- Sees a dark screen with a pulsing Orb
- Five rows animate in as each layer completes
- Each row shows specific numbers: "Found 124 products across 8 categories"
- Progress bar fills across all 5 layers (20% per layer)
- On completion: 1.2s pause, then auto-advances to Intelligence Reveal

**FRONTEND — UI behavior and state changes**
- Opens SSE connection to `GET /api/onboarding/brain-status`
- Each incoming SSE event triggers a row animation (spinner → checkmark)
- Counts fade in inline when "complete" event arrives
- Progress bar updates per layer
- On layer 5 complete: brief pause, then route to `/onboarding/discover`

**BACKEND — API, workers, and database**
- Layer 1 — Product Catalog: `ingestShopifyCatalog()` — reads all products, identifies bestsellers, new arrivals, price tiers
- Layer 2 — Email History: `ingestKlaviyoData()` — reads campaigns and flows, extracts performance patterns
- Layer 3 — Performance Fingerprint: `computePerformanceFingerprint()` — subject structures correlated with high opens
- Layer 4 — Segment Analysis: `analyzeKlaviyoSegments()` — maps segments to RFM tiers, counts VIP subscribers
- Layer 5 — Top Brain Match: `matchTopBrainPatterns()` — matches brand to 500+ fashion brand corpus, identifies archetype
- `buildRevealInsights()` runs after all 5 layers — generates 6 priority-ordered insight cards
- Personal Brain vectors stored in Supabase pgvector — ready for every future generation

**EXTERNAL SYSTEMS**
- Klaviyo API: campaign history, flow data, segment data
- Shopify API: product catalog
- OpenAI API: brief GPT-4o call for performance fingerprint extraction
- Ideogram API: for text and UI mockup generation
- Self-Hosted Countdown Timer Service: for countdown timer integration
- Supabase pgvector: stores brand embedding vectors

**STAGE OUTCOME:** Personal Brain vectors built in pgvector · 5 data layers complete · Intelligence ready for reveal.

### Stage 5: Intelligence Reveal — What We Found
*The user sees proof that VIYO understands their business. Trust earned before a single email is generated.*

**USER — What the user sees and does**
- Sees the title: "What We Found"
- Up to 6 insight cards fade in with 150ms stagger — each specific to their brand
- Example: "Your VIP segment has 847 subscribers and hasn't received a dedicated campaign in 34 days"
- Example: "Your best email ever hit 41.2% open rate — we've identified the structure"
- Clicks "See Your First Recommendation" to advance

**FRONTEND — UI behavior and state changes**
- Receives insight data from brain build
- Renders cards in priority order with 150ms stagger animation
- Each card: icon, headline, 1-2 sentence body, optional stat callout
- Cards that required missing data sources are omitted silently
- If Klaviyo not connected: shows "Connect Klaviyo to unlock flow gap analysis" chip

**BACKEND — API, workers, and database**
- Priority ordering: flow gaps first, then VIP gaps, performance patterns, new products, audience stats, Top Brain match
- Insight cards adapt to available data — omit types requiring missing connections
- All insight data stored in `onboarding_progress.reveal_insights` (jsonb)

**STAGE OUTCOME:** User understands their gaps and opportunities · Ready to see first recommendation.

---

## Phase 2: GENERATION

### Stage 5b: Video & Instagram Ingestion
*Users can now ingest content from video and Instagram, expanding the sources for VIYO's intelligence.*

**USER — What the user sees and does**
- Navigates to a new 'Ingest' section in the dashboard.
- Pastes a YouTube URL or connects their Instagram account.
- VIYO processes the content in the background.

**FRONTEND — UI behavior and state changes**
- A new 'Ingest' tab appears in the main navigation.
- The UI shows the progress of the ingestion and analysis.

**BACKEND — API, workers, and database**
- OpenClaw skills run locally for video processing (yt-dlp, Whisper, ffmpeg, Tesseract).
- Structured JSON is uploaded to `POST /v1/ingest/video-intel`.
- New tables `video_ingestion_jobs` and `video_extracted_emails` are populated.
- The `video-intel.analyze` Inngest function is triggered to process the extracted content.

**STAGE OUTCOME:** Video and Instagram content is ingested, analyzed, and made available for campaign generation.

### Stage 6: Creative Concept Mode
*For high-stakes briefs, VIYO can now pitch creative concepts before generating the full email.*

**USER — What the user sees and does**
- On the /create page, a new "Pitch Me Concepts" button is available.
- If selected, the user is presented with three creative concepts: Safe, Pattern Interrupt, and Wildcard.
- The user selects a concept to proceed with generation.

**FRONTEND — UI behavior and state changes**
- The "Pitch Me Concepts" button is displayed on the /create page.
- A new UI displays the three creative concepts for selection.

**BACKEND — API, workers, and database**
- The CMO Brain generates three creative concepts based on the brief.
- New tables `concept_pitches` and `concept_selections` store the pitched concepts and user selections.
- The Smart Intercept feature detects high-stakes briefs and can automatically trigger the concept pitching flow.

**STAGE OUTCOME:** The user selects a creative concept, which then informs the generation process.

### Stage 6b: First Campaign Recommendation
*One specific AI recommendation with a rationale. Not a list — a decision already made.*

**USER — What the user sees and does**
- Sees a single hero card: campaign title, product image, rationale paragraph, estimated impact stat
- Sees "Generate This Email" (primary full-width CTA)
- Secondary option: "Or, start from scratch" text link
- Clicks Generate → brief pre-filled, Stage 7 begins

**FRONTEND — UI behavior and state changes**
- Renders hero card with data from `computeFirstAction()` result
- Product image pulled from Brand Asset Vault if applicable
- CTA click calls `POST /api/v1/campaigns/generate` with the pre-filled `brief_payload`
- Routes to `/campaigns/generate?onboarding=true` to activate guided mode

**BACKEND — API, workers, and database**
- `computeFirstAction()` runs 5-rule priority decision engine:
  - Rule 1: Missing welcome or abandoned checkout flow → recommend that flow
  - Rule 2: New products in last 14 days with no campaign → product launch email
  - Rule 3: Top 3 bestseller with no campaign in 30 days → bestseller spotlight
  - Rule 4: VIP segment with no campaign in 30 days → VIP exclusive
  - Rule 5: Default → new arrivals to full list
- `brief_payload` pre-built: campaign type, segment, product(s), intent framing

**STAGE OUTCOME:** Campaign brief pre-filled · User clicks Generate · Stage 7 begins immediately.

### Stage 7: Generation — The 7-Brain Council
*30-60 seconds. 7 AI specialists run in a dependency graph. The user watches the Orb.*

**USER — What the user sees and does**
- Sees animated Orb with phase labels updating in real-time
- In onboarding mode: richer narration — "CMO Brain checking your VIP segment size and last send date..."
- Standard mode: "Copywriter Brain writing your subject line..."
- 30-60 seconds total — user can close tab; generation continues in background

**FRONTEND — UI behavior and state changes**
- Subscribes to Supabase Realtime on `campaign_sessions` filtered by `sessionId`
- Each `current_phase` update from Realtime triggers a label change on the Orb
- On `status = "completed"`: routes to `/campaigns/{sessionId}/preview`

**BACKEND — API, workers, and database**
- Step 1 — Token Reserve: 45,000 tokens reserved (`billing_usage` record, status = "reserved")
- Step 2 — Campaign Session: `campaign_sessions` record created (status = "queued")
- Step 3 — Inngest Event: `campaign.generate` fired with `{ sessionId }`
- Mastra DAG — 7 Brains execute in order. This now includes the Visual Intent Router, which directs image generation requests to the appropriate model (Gemini 3.1 Flash for photography, Ideogram 3.0 for text/UI mockups, and Imagen 4 for upscaling).
- On success: HTML stored in R2, tokens committed (reserved → deducted)
- On failure: Inngest retries 3x with backoff, then tokens refunded automatically

**STAGE OUTCOME:** Compiled HTML email stored in Cloudflare R2 · 45,000 tokens committed · Preview UI unlocked.

---

## Phase 3: DEPLOY

### Stage 8: Review & Edit — The Preview UI
*The user reads the email. They can change anything in plain language. Only the changed section reruns.*

**USER — What the user sees and does**
- Sees a split-view preview: desktop left, mobile right
- Above the preview: subject line and preview text (editable inline)
- Onboarding mode: 3-4 annotation bubbles point to key sections with "why" explanations
- Types in the chat: "Make it more urgent", "Change the product to the Blue Linen Shirt", or "Add a countdown timer"
- Or clicks "Regenerate" for a full rerun (uses another 45,000 tokens)
- When satisfied: clicks "Push to Klaviyo"

**FRONTEND — UI behavior and state changes**
- Renders compiled HTML in iframe (desktop + mobile viewports)
- Chat interface routes to Intent Router API
- On targeted regen: shows mini Orb for the affected section only
- Pre-flight warning banners: dismissible inline alerts if any warnings exist

**BACKEND — API, workers, and database**
- Chat input → Intent Router: identifies which brain owns the requested change. For countdown timers, the system integrates with the Self-Hosted Countdown Timer Service.
- Runs targeted regeneration for that brain only — full context passed
- Edit logged in `editor_events` table (for analytics)
- Targeted edits cost tokens — cost is shown before confirming (e.g. subject line regen ~5,000 tokens)

**STAGE OUTCOME:** Email finalized and approved by user.

### Stage 9: Pre-Flight & Deploy
*VIYO checks the email against 50+ clients, spam filters, and accessibility rules before pushing.*

**USER — What the user sees and does**
- Clicks "Push to Klaviyo"
- Sees a quick Pre-Flight checklist run (1-2 seconds)
- If warnings exist (e.g., "Missing alt text"): user can fix or ignore
- If hard fail (e.g., "Spam score 8/10"): deploy blocked until fixed
- On success: "Email pushed to Klaviyo" with a deep link to the draft

**BACKEND — API, workers, and database**
- Pre-Flight (`runPreflight`):
  - Email on Acid API: client rendering, spam score, link check, accessibility
  - Claude Haiku: grammar check
  - Hard checks: unsubscribe link, from address, 75KB size, broken links, spam <=7
- If all pass — 3-Step Klaviyo Deploy:
  - Step 1: `POST /api/klaviyo/v1/email-templates`
  - Step 2: `POST /api/klaviyo/v1/campaigns`
  - Step 3: `POST /api/klaviyo/v1/campaign-send-jobs`
- `campaign_sessions.status` → "deployed"

**STAGE OUTCOME:** Email live in Klaviyo · Ready to send or scheduled.

---

## Phase 4: LEARN & GROW

### Stage 10: Post-Send Learning — The Feedback Loop
*Every send makes VIYO smarter for this brand. Performance data flows back into the Personal Brain.*

**USER — What the user sees and does**
- Over the next 24-72 hours: opens, clicks, and orders accumulate in Klaviyo
- User checks the VIYO performance dashboard
- Sees: open rate, click rate, estimated revenue — vs. historical average and vertical benchmark
- Sees a Smart Insight: "This subject line outperformed your average by 8.3%. VIYO has marked this pattern."

**BACKEND — API, workers, and database**
- Klaviyo Campaign Performance Webhook (real-time): `metric.aggregates.updated` writes to `campaign_email_results`
- Stores: open_rate, click_rate, revenue, unsubscribe_rate
- Performance data fed to Personal Brain:
  - High-performing subject lines extracted + tagged as confirmed winners
  - Product-level CTR updated in Asset Vault metadata
  - Segment response rates updated
- Smart Insights generated and queued for review in Self-Learning Skill Admin

**STAGE OUTCOME:** Personal Brain updated with winners · Smart Insights generated.

### Stage 11: Ongoing Use — Email as an Operating System
*VIYO is not a tool for one email. It is the infrastructure for email as a channel.*

**USER — What the user sees and does**
- Monthly Email Calendar: AI proposes 30 campaigns based on season, performance, inventory
- Flows: builds Welcome, Abandoned Cart, Post-Purchase, Win-Back
- VIYO Max chat: "What should I send this week?"
- "Sync Now" button (25,000 tokens): triggers a 90-day behavioral scan
- Tokens replenish monthly on plan renewal, or purchase add-on blocks

**BACKEND — API, workers, and database**
- Monthly Calendar: AI generates 30 campaign briefs
- Flows: `generateFlow()` creates all emails via 7-brain pipeline
- Behavioral Signal Detection (nightly, 5AM UTC): scans last 24h of purchases, detects occasion signals. The system now also supports video ingestion jobs and stores extracted emails in the `video_ingestion_jobs` and `video_extracted_emails` tables.
- Segment creation: `handleSegmentCreationRequest()` deducts 10,000 tokens → creates segment in Klaviyo
- Auto-refill: Stripe charge triggered when `token_balance < brands.auto_refill_threshold`

**STAGE OUTCOME:** Intelligence compounding automatically.


---

