# R32 Taskmaster Ingestion PRD: Intelligent Email Engine v9.0

> **Ingestion constraints from PO directive.** This PRD is for backlog ingestion only. Generated R32 tasks must remain pending, must be sequenced after T48, and must not authorize implementation before Sprint 2 completion and explicit PO assignment.

## Source Map

| Source | Role in ingestion |
| --- | --- |
| `VIYO R32 — Intelligent Email Engine v9.0.docx` | Primary architecture source for Taskmaster task generation. |
| `VIYO_BUILDER_HANDOFF_R32.md` | PO handoff context, sequencing decisions, and implementation guardrails. |
| `VIYO_SKILLS_PROCUREMENT_REPORT.md` | Procurement prerequisites that must be represented before R32 implementation tasks. |

## Backlog Sequencing Requirements

R32 work is **not part of the current execution path**. The active execution path remains **T46 Phase 5 → T47 → T48**. Taskmaster ingestion must create visible backlog tasks after the current T48 boundary. The first generated R32 implementation task should depend on T48 or otherwise be explicitly sequenced after T48, while procurement and planning tasks may be represented as R32 prerequisites that still remain pending until PO assignment.

## Primary Architecture Source: R32 Intelligent Email Engine v9.0

# VIYO R32 — Intelligent Email Engine v9.0

The “Explain It Like I’m 10” Architecture & Implementation Guide

Status: APPROVED FOR IMPLEMENTATION Date: April 28, 2026 Version: 9.0 (Agency Tier Specification) Authority Level: PRD Product Architect (Supersedes all previous versions)

## 1. The Pitch: Why Are We Building This?

Imagine you own a high-end shoe brand. A customer named Sarah comes into your physical store. She looks at three pairs of red heels, checks the price tag on the most expensive one, sighs, and walks out.

If you had a smart salesperson, they wouldn’t run after her shouting, “Hey! Here’s a generic newsletter about our new blue sneakers!” They would say, “Hey Sarah, those red heels you liked? I can give you 10% off right now.”

But in the digital world, brands act like the dumb salesperson. When Sarah abandons her online cart, her brand’s Email Service Provider (ESP like Klaviyo or Mailchimp) sends her the exact same “You left something behind!” template that it sends to a 60-year-old man buying work boots. Same image. Same tone. Same offer.

Competitors like Instant.one realized this is broken. They built an AI that writes a unique email for every single person. And it works — they drove $1.56M in extra revenue for one brand in 90 days. But there’s a massive catch: Instant.one forces brands to rip out Klaviyo and replace their entire email system. Brands hate that. It’s risky, expensive, and breaks all their existing workflows.

### The VIYO Solution

VIYO is the smart salesperson that plugs into the system the brand already has. We don’t replace Klaviyo. We sit on top of it. We watch what Sarah does on the website, we look up her demographics, and we make her existing Klaviyo profile smarter. Then, depending on what the brand needs, we either improve their existing email flows or write completely unique emails per person.

We own the intelligence. Klaviyo owns the delivery.

## 2. The Three Systems (Critical — Read This First)

VIYO’s email intelligence is not one feature. It is three separate systems that share the same data layer. Every person reading this document — product owner, builder, designer — must understand this separation before anything else.

### System A: The Intelligence Engine (Always On)

This is the background data machine. It runs 24/7 for every connected brand. It watches what customers do on the store, enriches their profiles with demographics, and calculates an intelligence score. It does not send emails. It does not generate copy. It does not touch templates. It simply makes the brand’s customer data smarter.

The intelligence it produces feeds into both System B and System C below. It also feeds directly into the brand’s existing ESP segments — meaning even if a brand never uses VIYO to generate or optimize a single email, their regular Klaviyo flows get better because they can target “Hot Customers” or “High LTV Female 25-34” segments that VIYO built for them.

### System B: The Standard Flow Optimization Engine (Always Running)

This is the feature most brands will interact with daily. When a brand connects to VIYO, we use the Council of Brains to generate their initial email flows — Welcome Series, Abandoned Cart, Browse Abandon, Post-Purchase, Winback, and more. We design the templates, write the copy, and push them to Klaviyo.

But we don’t stop there. VIYO’s brains continuously monitor how those flows perform. Every week, the system reviews open rates, click rates, and conversion data. It runs A/B tests on subject lines, copy variations, image layouts, and CTA placement — all within the standard templates. When it finds something that works better, it sends the brand a recommendation:

“Hey, your Abandoned Cart Step 2 has a 12% open rate. We tested a new subject line formula that hit 23%. Want us to update it?”

The brand approves or rejects. VIYO updates the template in Klaviyo. This cycle never stops. The flows get better every single week, automatically, powered by the intelligence data from System A.

This is the core VIYO email product. It is not R32. It exists independently and is already architected in the PRD.

### System C: The Super Template Engine (R32 — Toggled Per Flow)

This is the premium layer that R32 adds on top of System B. Instead of sending the same optimized template to everyone (even if that template is great), System C writes a completely unique email for each individual person at the moment of sending.

System C is toggled per flow in the Agency Dashboard. A brand might leave their Welcome Series on System B (standard optimized templates) but toggle their Abandoned Cart flow to System C (per-person AI generation). Or they might use System C only for their VIP segment.

The relationship between the three systems: 1. System A (Intelligence) enriches all customer profiles — always on, feeds everything 2. System B (Standard Flows) uses that data to generate, optimize, and A/B test the brand’s email templates — always running, sends recommendations to the brand 3. System C (Super Template / R32) uses that data to write unique emails per person at send time — toggled on per flow, premium feature

All three are VIYO. All three share the same data. They are not competing features — they are layers of increasing intelligence.

## 3. System A Deep Dive: The Intelligence Engine

To make smart decisions, VIYO needs data. We pull it from three places.

### 3.1 The Hard Rule: Opted-In Customers ONLY

Before we talk about data, there is one unbreakable rule: VIYO does not track, enrich, or email anonymous visitors. If we don’t already have Sarah’s email address from the brand’s ESP, we ignore her. This eliminates legal risks (GDPR/CCPA) and keeps brands safe from spam complaints.

### 3.2 Ingestion Sources

Shopify Web Pixels (Real-Time Behavior): We install a Web Pixel on the brand’s Shopify store. It listens for events like product_viewed, cart_updated, and checkout_started. This tells us what Sarah wants right now.

Contact Enrichment (Demographics): We connect to APIs like FullContact and People Data Labs (PDL). When a new email enters the system, we ping these APIs to get age range, gender, location, and income bracket.

Ad Platform Signals (Aggregate Context): We connect to the brand’s Meta, Google, and TikTok ad accounts to pull aggregate audience data (e.g., “Your Cart Abandoners are 70% female”).

### 3.3 The Intelligence Score

We combine all this data into a single Customer Intelligence Profile and calculate an intelligence_score (0-100). The score is built from 9 weighted factors:

| Factor | Weight | Source |
| --- | --- | --- |
| Email engagement history | 10 | ESP sync |
| Purchase history & LTV | 20 | Shopify |
| Browse behavior | 15 | Web Pixel |
| Email open/click engagement | 15 | Tracking pixel |
| Demographic completeness | 10 | FullContact/PDL |
| Send time responsiveness | 10 | VIYO tracking |
| Ad segment membership | 5 | Meta/Google/TikTok |
| Lifetime value prediction | 10 | VIYO calculation |
| Identity confidence | 5 | Enrichment match rate |

The score places every customer into a tier: - Hot (61-100): High intent, high LTV. In System B, these customers get the best-performing template variants. In System C, they can get the full 7-Brain treatment. - Warm (31-60): Moderate intent. Standard personalization. - Cold (0-30): Low intent or new. Gets the proven high-performing template.

This score feeds into both System B (which templates/variants to show) and System C (how much AI firepower to spend per email). It also creates segments the brand can use in their own Klaviyo flows independently.

## 4. System C Deep Dive: The Super Template Engine (R32)

When a brand toggles System C on for a flow, VIYO doesn’t just fill in a template. We convene a meeting of AI agents. But not every email gets the same level of attention.

### 4.1 The Three Intelligence Toggles (Agency Dashboard)

Each flow in the Agency Dashboard has a dropdown: Intelligence Level: [ High-End | Low-End | Disabled ]

1. High-End (Full 7-Brain Council) - What happens: All 7 brains fire. GPT-4o sets the strategy (CMO, Audience, Offer, Critic). Gemini Flash writes the copy and designs the layout. - Cost: ~$0.013/email - Use case: Premium VIP winback campaigns or high-value segments where the ROI justifies the cost. This is the Ferrari.

2. Low-End (2-Brain Express) — DEFAULT - What happens: Only the Copywriter Brain (Flash) and Critic Brain (Flash) fire. No GPT-4o at all. The AI writes a custom subject line, body copy, and CTA, but uses the store’s existing product images from their Shopify catalog. - Cost: ~$0.001/email (10x cheaper) - Use case: Bulk automated flows (abandoned cart, browse abandon, welcome). This is the “Instant.one equivalent” that runs 50,000 times a month profitably.

3. Disabled (System B Standard Template) - What happens: System C doesn’t fire. The flow uses the System B optimized template instead. - Cost: $0 (for System C — System B optimization still runs) - Use case: Flows where the standard optimized template already performs well, or flows the brand wants full control over.

### 4.2 The 7-Brain Council Explained (High-End Toggle)

When the High-End toggle is active, here is the team that meets. Note: GPT-4o is explicitly excluded from this architecture due to poor creative writing benchmarks (EQ 1443, ranked 21st). The council uses a best-in-class multi-provider routing strategy:

CMO Brain (Claude Opus 4.7): The boss. Highest reasoning and EQ (2216). Looks at Sarah’s profile and sets the strategic direction.

Audience Brain (Gemini 3.1 Pro): The researcher. Highest abstract reasoning and data analysis. Looks at the ad data and finds the segment match.

Offer Psychology Brain (GPT-5.4): The closer. Highest structured reasoning. Calculates the optimal pricing/discount strategy to protect margin.

Copywriter Brain (Claude Sonnet 4.6): The writer. Best quality/cost ratio for creative writing (EQ 1991). Writes the subject line, preview text, and body copy.

Visual Intent Router (Gemini 3 Flash): The art director. Fast routing decision (250 t/s). Decides which image model to use.

Designer Brain (Gemini 3 Flash): The layout artist. Fast structured output. Decides which blocks to show or hide.

Critic Brain (Claude Sonnet 4.6): The editor. Evaluates the final assembled email. Must match the Copywriter’s intelligence to catch mistakes.

Low-End Mode (2-Brain Express) Model Assignment: To achieve profitability at bulk scale (50,000+ emails/month), the Low-End mode uses open-weight models that rival frontier performance: - Copywriter Brain: Kimi K2.6 (EQ 1808, $0.60/1M tokens). The open-source killer that beats GPT-5.3 at 1/5th the cost. - Critic Brain: GLM-5 (EQ 1664, $0.80/1M tokens). Fast, open-weight validation.

## 5. Sending Architecture (The “API Super Template”)

### 5.1 The Problem with Normal Templates

If we used a normal Klaviyo template with 5 fixed blocks, we could only make 5 versions of an email. If we tried to send 10,000 completely unique emails, we would have to create 10,000 templates. Klaviyo would block us immediately (Rate Limit: 150/minute).

### 5.2 The “API Super Template” Solution

Instead, we build one massive “Super Template” inside the brand’s Klaviyo account for each flow (e.g., one for Abandoned Cart). This template is full of code logic (If/Then statements, loops).

When the AI Council finishes Sarah’s email, we don’t send Klaviyo a new template. We send Klaviyo a tiny packet of data (JSON) via their Events API.

The Data Packet looks like this:

{
  "metric": { "name": "viyo_abandoned_cart" },
  "profile": { "email": "sarah@example.com" },
  "properties": {
    "show_vip_header": true,
    "headline": "Sarah, those red heels belong in Chicago.",
    "hero_image_url": "https://viyo.com/img/123.jpg",
    "offer_text": "Enjoy free 2-day shipping on us.",
    "product_recs": [ ... ]
  }
}

Klaviyo receives this data, pours it into the Super Template, and sends the email. Result: We can send 10,000 completely unique emails using just 1 template, and we never hit Klaviyo’s rate limits (Events API allows 350/second).

## 6. Tracking & Attribution (Closing the Loop)

If VIYO is doing all the thinking, how do we know if it worked? We have to track it ourselves, but we have to make sure Klaviyo still gets the credit so the brand’s reporting doesn’t break.

Opens: We put a tiny, invisible 1x1 pixel in every email. When Sarah opens the email, the pixel loads from track.viyo.com, and we log the open.

Clicks: Every link in the email points to VIYO first (track.viyo.com/click?...). We log the click, then instantly redirect Sarah to the store.

Revenue: When Sarah buys the shoes, Shopify tells VIYO. We match her purchase to the email she clicked.

The Sync: Within 30 seconds, VIYO sends a message back to Klaviyo: “Hey, that Abandoned Cart email worked! Log $150 in revenue.”

Klaviyo remains the single source of truth for the brand’s reporting. This tracking data also feeds back into System A (Intelligence Engine) to improve the intelligence score, and into System B (Standard Flow Optimization) to improve template A/B testing.

## 7. Implementation Guide: Ad Platforms & ESPs

To build this, we need to wire up the data sources and the delivery mechanisms. Here is the exact blueprint.

### 7.1 Meta (Facebook/Instagram) Integration

Goal: Pull aggregate demographic data for the CMO Brain to understand audience segments. 1. Connection: OAuth 2.0 (Facebook Login for Business). 2. Scopes Required: ads_read, ads_management. 3. The API Call: We run a daily cron job (via Inngest) to query the Marketing API’s Insights endpoint (/act_{ad_account_id}/insights?breakdowns=age,gender,country). 4. Data Storage: We save the JSON response into the ad_platform_audiences table (defined in R20). 5. Bonus Value: We also push our “Hot” intelligence tier customers back to Meta as Custom Audiences so the brand can retarget them with ads.

### 7.2 Google Ads & TikTok Ads Integration

Goal: Pull in-market segments (Google) and interest categories (TikTok). 1. Google Ads: OAuth connection to the AudienceInsightsService. We pull age, gender, parental status, and affinity categories. 2. TikTok Ads: OAuth connection to the Marketing API for audience reports. 3. Storage: Both save to the ad_platform_audiences table.

### 7.3 ESP Integration (Klaviyo Example)

Goal: Push the API Super Template and trigger the flow. 1. Connection: OAuth 2.0 with PKCE. 2. Template Creation: We use the Templates API with editor_type: "CODE" to inject our Super Template logic. 3. Event Trigger: We push custom events via the Events API. Example payload: { "metric": { "name": "viyo_abandoned_cart" }, "profile": { "email": "sarah@example.com" }, "properties": { ... } }.

## 8. Training & Skills Procurement (How VIYO Learns)

VIYO isn’t just a static set of rules. It has to learn what works. The Learning Engine feeds both System B (standard flow optimization) and System C (per-person generation).

### 8.1 The Feedback Loop

When any email is sent — whether from a System B optimized template or a System C AI-generated email — we track Opens, Clicks, and Conversions. We feed this data back into the pattern_performance_metrics table.

For System B (Standard Flows): - The system identifies which subject line formulas, copy patterns, and image layouts perform best for each segment - It generates A/B test variants and measures results over 7-day windows - When a variant wins with statistical significance, it sends a recommendation to the brand - The brand approves, and the winning variant becomes the new default template - This cycle repeats weekly — the flows never stop improving

For System C (Super Template): - If a subject line formula (e.g., [Name] + [Urgency]) gets a 45% open rate, the Copywriter Brain learns to use it more often for that segment - If a specific image style (e.g., lifestyle_flatlay) drives higher conversions for the “Hot” tier, the Visual Router learns to select NanoBanana for that segment - The Critic Brain’s rejection rules tighten over time based on what actually converts

### 8.2 ClawHub Skills Required

We don’t need to build everything from scratch. We will procure the following skills from the ClawHub registry (52k+ skills): 1. memory-self-heal: Allows the Critic Brain to flag when a generated email fails compliance (e.g., wrong tone) and automatically adjust the prompt for the next generation without human intervention. 2. self-improving-agent: Analyzes the pattern_performance_metrics table weekly to adjust the weights in the intelligence_score calculation based on actual revenue driven. 3. send-time-optimization-bandit: A multi-armed bandit algorithm that tests different send times for each customer until it finds their optimal open window (e.g., 8:15 AM on Tuesdays).

## 9. Unit Economics: Why This Works

By separating System A (Intelligence), System B (Standard Flow Optimization), and System C (Super Template Generation), we maintain massive SaaS margins.

Cost Analysis for a Mid-Size Brand ($200K/mo GMV, 26,000 automated emails/mo):

| Cost Component | Monthly Cost |
| --- | --- |
| System A: Contact enrichment (800 new contacts × $0.04) | $32 |
| System B: Standard flow optimization (A/B testing, recommendations) | ~$5 (minimal LLM calls for weekly analysis) |
| System C: Low-End generation on bulk flows (26,000 × $0.001) | $26 |
| Total VIYO Cost | ~$63/month |

Margin by Tier:

| Tier | Price | VIYO Cost | Gross Margin |
| --- | --- | --- | --- |
| Starter ($99/mo) — Small brand, 6K emails | $99 | ~$14 | 86% |
| Growth ($299/mo) — Mid brand, 26K emails | $299 | ~$63 | 79% |
| Agency ($499/mo) — Large brand, 66K emails | $499 | ~$150 | 70% |
| Enterprise ($1,499/mo) — Enterprise, 252K emails | $1,499 | ~$455 | 70% |

Every tier clears the T9 Billing Engine’s MARGIN_FLOOR_PERCENT of 40%. Brands that want the High-End 7-Brain experience for specific flows consume additional T9 tokens on top of their subscription.

## 10. Scope Boundary: What R32 Does NOT Cover

To prevent scope creep, the following are explicitly outside R32:

System B (Standard Flow Optimization) — already architected in the core PRD. R32 only covers System C (Super Template) and the shared System A (Intelligence Engine).

SMS generation — future R-Spec

Identity resolution of anonymous visitors — removed by architectural decision (legal/privacy risk)

ESP replacement — VIYO never replaces Klaviyo/Mailchimp. We sit on top.

Shopify Pixel installation UX — covered by the onboarding flow spec

Coupon/discount code management — future R-Spec

Deliverability monitoring — future R-Spec

## 13. Unit Economics & Self-Hosted Migration Timeline

At the Agency Tier ($499/mo) with a Large brand (66,000 emails/mo), the Low-End default mode (Kimi K2.6 API + Enrichment) costs $145/mo, yielding a 71% gross margin.

### The Scale Play: Migrating to Self-Hosted

At platform scale (1,000+ brands, 50M+ emails/month), API costs become the primary margin drag. Kimi K2.6 and GLM-5 are open-weight models, allowing VIYO to transition from API consumption to self-hosted GPU infrastructure.

Migration Triggers: 1. Phase 1 (0 - 5M tokens/day): 100% API usage. Focus on product-market fit. 2. Phase 2 (5M - 25M tokens/day): Break-even threshold. Provision initial Hetzner GEX44 cluster. Migrate the Critic Brain (GLM-5) to self-hosted inference via vLLM. 3. Phase 3 (>25M tokens/day): Migrate the Copywriter Brain (Kimi K2.6) to self-hosted. Total inference cost drops from ~$45K/month (API) to ~$30K/month (Self-hosted GPUs), increasing gross margin by an additional 12-15% at scale.

---

## Builder Handoff Context

# VIYO Builder Handoff: R32 Intelligent Email Engine

**From:** PO / Architect
**To:** Max (Builder)
**Date:** April 28, 2026
**Context:** You have just completed T46 Phase 4 (Art Director Routing Suite). This document defines the complete R32 integration plan, what files changed since your last sync, and where to find every source document.

---

## 1. What Is R32?

R32 adds a premium per-send email personalization layer to VIYO. It does NOT replace the standard flow engine (System B). It sits on top of it. The brand toggles it per-flow.

**Three Systems:**

| System | What It Does | Always On? |
|---|---|---|
| A (Intelligence Engine) | Enriches customer profiles, calculates Intelligence Score (0-100), feeds segments to Klaviyo | Yes |
| B (Standard Flow Engine) | Generates initial flow templates, continuously A/B tests them, sends weekly improvement recommendations to the brand | Yes |
| C (Super Template / R32) | Writes a unique email per recipient at send time using the 7-Brain Council | Toggled per-flow |

---

## 2. What Changed Since Your Last Sync

### 2.1 New Source Documents (Google Drive: `VIYO/02_Research_Specs/`)

| Document | Version | What It Contains |
|---|---|---|
| `R32_Intelligent_Email_Engine_v9.0.docx` | v9.0 | The complete R32 architecture: 3 systems, 7-Brain Council, cost model, gap solutions, self-hosted migration timeline |

### 2.2 New Architecture Documents (Google Drive: `VIYO/05_Research_and_Benchmarks/`)

| Document | What It Contains |
|---|---|
| `R32_EQ_BENCH_FULL_RANKINGS.md` | Full 29-model benchmark for brain-to-model assignment |
| `R32_BRAIN_MODEL_RESEARCH.md` | Research notes on why each model was selected |
| `R32_GAP_RESEARCH.md` | Braze/Iterable/Klaviyo patterns used to solve the 7 gaps |
| `R32_INSTANT_ONE_FINDINGS.md` | Competitive intelligence on Instant.one's actual approach |

### 2.3 New PRD Documents (Google Drive: `VIYO/01_PRD_and_Architecture/`)

| Document | Google Drive Path | What It Contains |
|---|---|---|
| PRD Addendum V6 | `VIYO/01_PRD_and_Architecture/VIYO_PRD_V6_ADDENDUM_R32.md` | R32 integration into the master PRD |
| UX/UI Architecture | `VIYO/01_PRD_and_Architecture/VIYO_UX_UI_ARCHITECTURE_R32.md` | All new UI components, pages, and flows |
| Global Wiring Plan | `VIYO/01_PRD_and_Architecture/VIYO_GLOBAL_WIRING_PLAN_R32.md` | 13-layer wiring matrix for R32 |
| Google Docs Sync Plan | `VIYO/01_PRD_and_Architecture/VIYO_GOOGLE_DOCS_SYNC_PLAN_R32.md` | Exact changes to Doc1, Doc9, Doc10 |
| Skills Procurement Report | `VIYO/05_Research_and_Benchmarks/VIYO_SKILLS_PROCUREMENT_REPORT.md` | 17 skills to procure from ClawHub/GitHub |

### 2.4 Google Drive Reorganization

The entire Google Drive was reorganized into a clean folder structure:

```
VIYO/
├── 01_PRD_and_Architecture/     (Master PRD, Architecture Locks, Builder Instructions)
├── 02_Research_Specs/           (R19-R32, all enterprise specs)
├── 03_Sprint_Directives/        (Sprint batching, PO directives)
├── 04_Task_Architecture_Locks/  (T33-T36, T46, T47, T48)
└── 05_Research_and_Benchmarks/  (R32 benchmarks, competitive intel)
```

---

## 3. The Multi-Model Provider Stack

**Critical change:** GPT-4o is eliminated from the default stack. The 7-Brain Council uses a quality-first multi-provider architecture:

| Brain | Model | Provider | Fallback |
|---|---|---|---|
| Top Brain (VIYO Core) | Claude Opus 4.7 | Anthropic | GPT-5.4 |
| CMO Brain | Claude Opus 4.7 | Anthropic | GPT-5.4 |
| Audience Brain | Gemini 3.1 Pro | Google | GPT-5.4 |
| Offer Brain | GPT-5.4 | OpenAI | Gemini 3.1 Pro |
| Copywriter Brain (High) | Claude Sonnet 4.6 | Anthropic | Kimi K2.6 |
| Copywriter Brain (Low) | Claude Sonnet 4.6 | Anthropic | Gemini 3 Flash |
| Visual Router Brain | Gemini 3 Flash | Google | Claude Sonnet 4.6 |
| Designer Brain | Gemini 3 Flash | Google | Claude Sonnet 4.6 |
| Critic Brain (High) | Claude Sonnet 4.6 | Anthropic | Gemini 3.1 Pro |
| Critic Brain (Low) | Gemini 3 Flash | Google | Claude Sonnet 4.6 |

**Providers required:** Anthropic (Claude), Google (Gemini), OpenAI (GPT-5.4), and future: Moonshot (Kimi K2.6), Zhipu (GLM-5) for self-hosted scale.

---

## 4. Skills to Procure

Before R32 implementation begins, the following skills must be procured and integrated:

### From ClawHub (5 skills):
1. `self-improving-agent` — Self-learning loop for the Top Brain
2. `memory-self-heal` — Error recovery and sandbox persistence
3. `sales-mastery` — Partial integration into Offer Brain
4. `image-generation` — Prompt engineering for Art Director
5. `copywriting-pro` / `email-best-practices` — Upgrade Copywriter + Critic

### From GitHub (12 repos):
`mjmlio/mjml` (responsive HTML), `pallets/jinja` (dynamic content), `lovell/sharp` (image compression), `growthbook/growthbook` (A/B testing), `plausible/analytics` (tracking), `chaofengc/IQA-PyTorch` (image quality), `imageio/imageio` (GIF creation), `spamscanner/spamscanner` (deliverability), `mautic/mautic` (flow reference), `dittofeed/dittofeed` (engagement patterns), `retentioneering/retentioneering-tools` (behavioral segmentation), `dair-ai/prompt-engineering-guide` (prompt knowledge).

### Build Custom (1 skill):
**Brand Voice Extraction** — NLP skill that reads a brand's website/emails and outputs a VIYO Tone Modifier JSON.

---

## 5. Implementation Sequencing

R32 is NOT in Sprint 2. It will be scheduled as a dedicated Sprint (likely Sprint 4 or 5) after the current sprint tasks (T46, T47, T48) are complete. The builder should:

1. **Now:** Continue with T46 Phase 5-9 completion, then T47, then T48.
2. **After Sprint 2:** PO will create the R32 Taskmaster tasks and assign them.
3. **Before R32 implementation:** Skills procurement must be complete.

---

## 6. Key Architectural Decisions the Builder Must Know

| Decision | Ruling | Source |
|---|---|---|
| Open rate is NOT the primary signal | Click rate (70%), Conversion (20%), Open rate (10%) | Apple Mail Privacy Protection fix |
| Per-brand tracking subdomains | `track.{brand-slug}.viyo.com` from Day 1 | Shared domain risk fix |
| Token deduction timing | Deduct AFTER successful execution only | T46 Phase 2 PO ruling (also applies to R32) |
| No anonymous identity resolution | Opted-In Only rule, no Opensend/Retention.com | Legal/privacy decision |
| System C inherits System B learnings | Top 3 winning patterns injected into Copywriter Brain context | Gap 6 resolution |
| Canary sends for new Super Templates | 5% audience, 1-hour hold, then full release | Gap 3 safety net |
| Mid-flow migration | Duplicate flow + 7-day drain, never orphan customers | Gap 5 resolution |

---

## 7. Links to Current Path

| Resource | Location |
|---|---|
| R32 v9.0 (Primary Source) | Google Drive: `VIYO/02_Research_Specs/VIYO R32 — Intelligent Email Engine v9.0.docx` |
| T46 Architecture Lock | Google Drive: `VIYO/04_Task_Architecture_Locks/T46_ROUTING_ARCHITECTURE_LOCK.md` |
| T47 Architecture Lock | Google Drive: `VIYO/04_Task_Architecture_Locks/T47_EDITING_ARCHITECTURE_LOCK.md` |
| T48 Architecture Lock | Google Drive: `VIYO/04_Task_Architecture_Locks/T48_WEBHOOK_ARCHITECTURE_LOCK.md` |
| Skills Procurement Report | Google Drive: `VIYO/05_Research_and_Benchmarks/VIYO_SKILLS_PROCUREMENT_REPORT.md` |
| PRD Addendum V6 | Google Drive: `VIYO/01_PRD_and_Architecture/VIYO_PRD_V6_ADDENDUM_R32.md` |
| UX/UI Architecture | Google Drive: `VIYO/01_PRD_and_Architecture/VIYO_UX_UI_ARCHITECTURE_R32.md` |
| Global Wiring Plan | Google Drive: `VIYO/01_PRD_and_Architecture/VIYO_GLOBAL_WIRING_PLAN_R32.md` |

---

## Skills Procurement Prerequisites

# VIYO Skills Procurement Report & Gap Analysis

**Date:** April 28, 2026  
**Context:** Audit of 80+ existing Airtable skills against R32 (Intelligent Email Engine) and T46 (Art Director Routing Suite) requirements, combined with a ClawHub (52K+) and GitHub parallel search.

---

## 1. Executive Summary

The existing 80+ skills in Airtable are heavily skewed toward **Core Doctrine, Frameworks, and Tone Modifiers** (63 of 80 skills). These are excellent "teaching skills" for the Copywriter and CMO brains. 

However, VIYO is missing critical **Platform Skills (Runtime Tools)** and **Advanced Learning Loops**. We cannot rely purely on prompting to handle complex tasks like GIF creation, HTML email rendering, or A/B test statistical significance. 

This report recommends procuring **12 specific open-source tools from GitHub** and **5 advanced skills from ClawHub** to bridge these gaps. As per the `github-gem-seeker` philosophy: we solve the problem with battle-tested open-source code first, then wrap it in a Manus skill interface.

---

## 2. Procurement Matrix: What to Buy/Borrow vs. Build

### A. The Autonomous Learning Loop (Self-Healing)
*Current state: No existing skills in Airtable for self-improvement.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Self-Improving Agent** | ClawHub | `self-improving-agent` | **PROCURE.** Integrate this to allow the Top Brain to rewrite its own prompts based on failure logs. |
| **Memory & Self-Heal** | ClawHub | `memory-self-heal` | **PROCURE.** Essential for Phase 9 error recovery and sandbox persistence. |
| **Sales Mastery** | ClawHub | `sales-mastery` | **PROCURE.** Integrate partially into the Offer Brain for negotiation and discount tiering logic. |

### B. Email Engine (R32) Technical Gaps
*Current state: Airtable has 18 Generation Rules but no runtime execution engines.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Responsive HTML Builder** | GitHub | `mjmlio/mjml` (18K⭐) | **PROCURE.** We have `mjml_section_resolver` in Airtable, but we need the actual MJML engine to compile the JSON into responsive HTML. |
| **Email Personalization** | GitHub | `pallets/jinja` (11K⭐) | **PROCURE.** Jinja2 is the industry standard for dynamic content injection. Wrap it in a skill for the Designer Brain. |
| **Deliverability/Spam Check** | GitHub | `spamscanner/spamscanner` | **PROCURE.** The Critic Brain needs a programmatic way to check spam scores before approval, not just LLM guessing. |
| **A/B Testing Math** | GitHub | `growthbook/growthbook` | **PROCURE.** The Top Brain needs rigorous statistical significance calculation for System B auto-apply rules, not LLM math. |
| **Analytics/UTM Tracking** | GitHub | `plausible/analytics` | **PROCURE.** Lightweight, privacy-first tracking pixel engine for R32's open/click attribution. |

### C. Image Pipeline (T46) Technical Gaps
*Current state: Airtable has `image_pipeline_router` but lacks generation intelligence.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Prompt Engineering** | ClawHub | `image-generation` | **PROCURE.** Use this as the foundation for the Art Director's prompt construction before sending to NanoBanana/Ideogram. |
| **GIF Creation** | GitHub | `imageio/imageio` | **PROCURE.** Python library to stitch multiple NanoBanana frames into an animated GIF for email headers. |
| **Image Compression** | GitHub | `lovell/sharp` (32K⭐) | **PROCURE.** Node.js library. Emails must be <100KB. The Visual Router Brain must pass all images through Sharp before ESP upload. |
| **Quality Assessment** | GitHub | `chaofengc/IQA-PyTorch` | **PROCURE.** Programmatic image quality scoring (blur, composition) to validate NanoBanana output before billing tokens. |

### D. Copywriting & Content Gaps
*Current state: We have basic PAS/AIDA frameworks, but lack advanced persuasion.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Advanced Copywriting** | ClawHub | `copywriting-pro` | **PROCURE.** Upgrade the Copywriter Brain's baseline capabilities beyond simple frameworks. |
| **Email Best Practices** | ClawHub | `email-best-practices` | **PROCURE.** Inject into the Critic Brain's evaluation rubric. |
| **Brand Voice Extraction** | Custom | `NLP/Stylometry` | **BUILD.** Existing open-source tools (`jpotts18/stylometry`) are too academic. We need a custom skill that reads a brand's website and outputs a VIYO Tone Modifier JSON. |

---

## 3. Implementation Plan & Wiring

As per the Global System Wiring mandate, these procured skills do not operate in isolation. They must be wired into the existing R32 and T46 architectures:

1. **Admin Config Panel Integration:**
   - Every procured GitHub tool (e.g., Plausible Analytics, MJML server) that requires hosting must have its endpoint URL and API key exposed in the VIYO Admin Config Panel.
   - The Top Brain will automatically wire these config entries upon installation.

2. **Self-Healing Wrapper:**
   - All procured open-source tools will be wrapped in the `memory-self-heal` pattern. If `lovell/sharp` fails to compress an image, the self-healing wrapper catches the error, falls back to a lower compression tier, and logs the failure to the `self-improving-agent` memory bank.

3. **ClawHub Ingestion Pipeline:**
   - Use the `open-claw-skill-hunter-and-developer` skill to fetch `self-improving-agent`, `memory-self-heal`, `copywriting-pro`, and `image-generation`.
   - Run the `--review` and transformation scripts to adapt them from Claude Desktop paths to Manus `/home/ubuntu/skills/` paths.
   - Bundle them into a `VIYO_R32_T46_Skill_Batch` for one-click installation.

---

## 4. PO Decision Required

This procurement plan introduces 12 GitHub repositories and 5 ClawHub skills to the VIYO stack. 

**Do you approve this procurement matrix?** 
If yes, I will use the `github-gem-seeker` and `open-claw-skill-hunter` skills to begin fetching, transforming, and installing these assets into the sandbox.
