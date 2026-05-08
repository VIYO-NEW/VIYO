# PRODUCT_ROADMAP.md — VIYO Phases and Sequencing

**Locked plan:** Free alpha now → paid alpha when Foundation Locks complete + open decisions resolve.

This file captures the high-level sequencing. Detailed acceptance tests for each sub-phase live in `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` §16 and (when written) the Email Studio architecture file.

---

## Phase 1 — Image Studio (VVOW) [CURRENT BUILD]

**Standalone product.** GrapesJS + Studio SDK. The visual generation, editing, and brand asset management product.

| Sub-phase | What | Acceptance Gate | Status |
|---|---|---|---|
| Phase 0 | Foundation (repo, monorepo, Hono API worker, deployment) | Live | ✅ Shipped |
| 1.1 Core Loop | Chat → Canvas → DB single-variant generation | T25 + T26 functional end-to-end | ✅ Shipped |
| 1.2 Pattern DB cache | Cache-first with metadata transparency | T70 invariants | ✅ Shipped |
| 1.3 Token billing | Reconciliation across providers | T71 | ✅ Shipped |
| 1.4 R2 + Brand Vault | Asset contract with lineage + JSONB metadata + pgvector | T72 | ✅ Shipped |
| **1.5 Editing Router** | **Studio Editing Router routes B1–B10 + correct model per intent** | **T73** | **⏸ PAUSED** awaiting architecture acceptance |
| 1.6 Multi-variant | One brief → 3 variants in Design Chat (Zone 1) | TBD | Future |
| 1.7 Full editing tools | All B1–B10 functional with correct model routing | TBD | Future |
| 1.8 RLHF feedback loop | qaScore updates after 1,000 events; DSPy active; Tinder swipe gate live with 3 reviewers | TBD | Future |
| 1.9 Pattern Seeding | Milled scraper live; initial Pattern DB seeded | TBD | Future |
| 1.10 Brand-Specific LoRA | First brand reaches threshold; LoRA training pipeline produces deployable artifact | TBD | Future |
| 1.11 Gap closure | G2 (A15 Brand Kit Mode) + G8 (Character Consistency) shipped | TBD | Future |

**Image Studio public launch unlocks when:** All Phase 1 sub-phases complete + OD-001 (pricing) + OD-002 (legal) + OD-003 (provider catalog) + OD-005 (reviewer accounts) resolved.

---

## Phase 2 — Email Studio [FUTURE]

**Separate product.** GrapesJS + MJML Plugin (`mjml-core`). Full MJML image + email section editor.

Key features locked in `FOUNDATION_LOCK.md` Locks 2 + 3:

- 12 MJML Section Templates (Hero, Split, Grid, Editorial, etc.)
- AI fills slots with text + Brand Vault asset UUIDs (NEVER raw HTML)
- Live-sync edit modal opens Image Studio
- References Brand Vault assets by UUID (no upload)
- Klaviyo deployment integration
- 7-Brain Council orchestration for full campaign generation (Image Studio uses only Brains 5 + 6; Email Studio uses all 7)

**Phase 2 begins when:** Phase 1 public launch achieved + 30-day stability window observed.

---

## Phase 3 — LENZ Intelligence Studio [FUTURE]

Analytics layer. Email performance dashboards, competitor benchmarking, brand intelligence. Powered by:

- HYVE Intelligence Network (R36)
- ATLAS Top Brain (cross-brand intelligence)
- Email Performance Loop (per VVOW Architecture §12.2)
- Competitor email ingestion via R46 IMAP pipeline (ATLAS-driven)

**Phase 3 begins when:** Phase 2 stable.

---

## Phase 4+ — Future expansions [FAR FUTURE]

Identified but not scoped:

- Multi-step automated flow generation (Welcome Series, Abandoned Cart) — V1 non-goal per V8 PRD
- ESPs other than Klaviyo
- A/B testing generation and deployment
- Panoramata API integration (adapter scaffolding only in V1)
- AgentMail IMAP automation per R46

---

## Long-term ownership model

| Role | Owner | Responsibilities |
|---|---|---|
| **PO (Product Owner)** | You | Strategy, acceptance, external relationships, all OD-* decisions |
| **Architect-in-Portal** | Future Portal Phase 4 / current chat-based Claude | Directive writing, ingestion-evidence verification, governance file sync |
| **Reviewer Claude** | Claude Opus 4.7 in Portal review role | Code review per `viyo-development-protocol-v2` §9 |
| **Kimi (Executor)** | Kimi K2.6 in Portal | Code implementation per directive |
| **Manus** | External Manus environment | Portal infrastructure tasks (NOT product code) |

---

## Release readiness gates

| Gate | Description | Current Status |
|---|---|---|
| **G1** | All Phase 1 sub-phases (1.1–1.11) complete | 1.1–1.4 ✅, 1.5+ pending |
| **G2** | All open decisions (OD-001 through OD-007) resolved | 7 open |
| **G3** | A15 Brand Kit Mode shipped (Lovart audit gap G2 closure) | Future |
| **G4** | Character Consistency shipped (Lovart audit gap G8 closure) | Future |
| **G5** | 30-day stability window post-soft-launch | Future |

When all 5 gates green: **public launch.**

---

## Soft-launch path

Before G5 (full public launch), VIYO operates a **free alpha → paid alpha** progression:

1. **Free alpha (now):** Phase 1.5–1.11 sub-phases ship; users invited individually; no payment
2. **Paid alpha (G2 + G3 met):** Pricing live (per OD-001 resolution); A15 Brand Kit Mode functional; users pay tokens
3. **Public launch (G1–G5 all met):** Open registration, Klaviyo integration verified, marketing live

---

## What's NOT in scope (explicit non-goals per V8 PRD)

| Non-goal | Reason |
|---|---|
| Multi-step automated flow generation (Welcome Series, Abandoned Cart) | V1 non-goal per V8 PRD §2 |
| Direct integration with ESPs other than Klaviyo | V1 non-goal per V8 PRD §2 |
| Unbounded web scraping beyond manual Admin ingestion | Privacy/legal (related to OD-002) |
| Custom HTML email compiler | VIYO wraps `mjml-core`, doesn't replace it |
| Subscription billing with automatic overages | Hard stop at 0 tokens — token-based prepaid only |

---

**End of roadmap.**

For architectural detail on each phase, see `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` and (when written) Email Studio architecture file.
