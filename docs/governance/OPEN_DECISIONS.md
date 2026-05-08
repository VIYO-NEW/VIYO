# OPEN_DECISIONS.md — Pending PO Decisions

**These are unresolved decisions that block specific phases.** Each row tracks:

- ID
- Decision needed
- What it blocks
- Current status

PO is the decision-maker for all OD-* items unless explicitly noted.

---

## Active open decisions

| ID | Decision | Blocks | Status |
|---|---|---|---|
| **OD-001** | Pricing reconciliation: deck slide 9 (`$99 / $299 / $499 / $1,499`) vs Notion D8 locked (`$0 / $49 / $249 / $499 / $1,499`). Pick one canonical structure before next investor send. | Public launch, investor materials | 🟡 Open |
| **OD-002** | Legal review on Milled / Email Love / Really Good Emails scraping (for Pattern Seeding pipeline per VVOW Architecture §10.4). Determines whether expansion beyond Milled is permitted. | Pattern Seeding pipeline expansion | 🟡 Open |
| **OD-003** | Atlas Cloud + fal.ai catalog verification — confirm exact models available on each, pricing, and rate limits. Required before Tier 1 routing logic ships. | Phase 1 acceptance, T73 gates | 🟡 Open |
| **OD-004** | 12 fashion brand competitor selection — finalize the list of brands whose emails feed Pattern Seeding via Milled scraping. | Pattern Seeding pipeline initial seed | 🟡 Open |
| **OD-005** | 3 Swipe Gate reviewer accounts. Provision the accounts and set the `SWIPE_REVIEWER_USER_IDS` environment variable. | Phase 4 RLHF acceptance | 🟡 Open |
| **OD-006** | Anthropic Console spend cap: set to $100/month. | Cost control, runaway-spend prevention | 🟡 Open — PO action item |
| **OD-007** | Conversation export cadence — how often PO exports chat transcripts to Drive for durable record. | Continuity / record-keeping | 🟡 Open |

---

## Decisions removed (historical)

| ID | Decision | Removed | Why |
|---|---|---|---|
| OD-008 | Lovart license / TOS for reverse-engineering reference | 2026-05-08 | PO ruled: VVOW reverse-engineering doc is internal architectural reference and benchmarking only. Implementation is proprietary (GrapesJS + Mastra + custom models, no Lovart code or assets used). No license needed. |

---

## How decisions get resolved

1. PO makes the decision in chat or in Notion
2. PO updates this file (or asks Architect to update it)
3. The change is committed in the next directive's closeout (per `viyo-development-protocol-v2`)
4. Sections elsewhere in governance referencing the decision are updated to reflect resolution

When all OD entries are closed, this file says "No open decisions" and that's a release-readiness signal (Gate G2 in `PRODUCT_ROADMAP.md`).

---

## Cross-references

| Where referenced | Decisions |
|---|---|
| `VVOW_IMAGE_STUDIO_ARCHITECTURE.md` §16 (Phase Gates) | OD-001, OD-002, OD-003, OD-005 |
| `CURRENT_STATE.md` (What's blocked) | OD-001, OD-002, OD-005 |
| `PRODUCT_ROADMAP.md` Gate G2 | All OD-001 through OD-007 |

---

**End of open decisions.**
