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
