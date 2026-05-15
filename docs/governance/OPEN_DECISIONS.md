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
| ~~OD-001~~ | [Historical row: prior "Pricing reconciliation deck slide 9 vs Notion D8 locked" framing OBSOLETE — DISSOLVED via PRD V8.1 §6.5 ratified 2026-05-14 (commit `e720e6c`). Pricing is Portal-configured runtime per §6.3; both legacy tier structures lose canonical status. D85 ratified 2026-05-15 (Notion `3619a84a-4679-813e-b722-ee9fb49bbc56`) further clarifies PRD V8.1 = vision authority. Verify all rows against live Notion DB.] | n/a | ✅ CLOSED via §6.5 dissolution 2026-05-14 |
| **OD-002** | Legal review on Milled / Email Love / Really Good Emails scraping (for Pattern Seeding pipeline per VVOW Architecture §10.4). Determines whether expansion beyond Milled is permitted. | Pattern Seeding pipeline expansion | 🟡 Open |
| **OD-003** | AgentMail IMAP Provider Selection — which AgentMail/IMAP provider for R46 Email Ingestion. Options: Nylas, Google Gmail API, Microsoft Graph API, custom IMAP. Recommendation per Notion canonical: Option A (Nylas — unified API, $0.01/connection/month). [Historical note: prior text "Atlas Cloud + fal.ai catalog verification" was OBSOLETE framing. That task is also OBSOLETE per tier-as-taxonomy clarification 2026-05-15 (Decision 14/37 "Tier" = provider class taxonomy, NOT priority; "Best for the Job" selection per Decision 20). Verify against Notion canonical DB.] | R46 Email Ingestion Module (Phase 1B prerequisite for Phase 2) | 🟡 Open (deferred-not-blocking for MVP per PRD §3.1 + §7.4) |
| ~~OD-004~~ | [Historical row: prior "12 fashion brand competitor selection" framing OBSOLETE — current canonical OD-004 per Notion + PRD V8.1 §8.1 = R29 PAL Rewrite Scope, CLOSED 2026-05-15 via R29 v2 ZCBR-PASS Iα. Fashion-brand selection question dissolved into Phase 1B / Pattern Seeding scope per VVOW §10.4. Verify all rows against live Notion DB.] | n/a | ✅ CLOSED 2026-05-15 |
| **OD-005** | 3 Swipe Gate reviewer accounts. Provision the accounts and set the `SWIPE_REVIEWER_USER_IDS` environment variable. | Phase 4 RLHF acceptance | 🟡 Open |
| **OD-006** | Anthropic Console spend cap: set to $100/month. | Cost control, runaway-spend prevention | 🟡 Open — PO action item |
| ~~OD-009~~ | [Composer Queue concurrency model — 2 parallel lanes for related-and-wired features, sequential for cross-touching. Ratified 2026-05-15 per Phase A A2 (commit `90f96e0` + Notion `35e9a84a-4679-81bd-8b91-fa66b472513b` Closed).] | (closed) | ✅ CLOSED 2026-05-15 |
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
