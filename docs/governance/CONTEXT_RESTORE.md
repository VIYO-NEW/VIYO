# CONTEXT_RESTORE.md

**Purpose:** Single handoff document for a fresh PO-side Claude conversation. Read this, then read the sources it routes to. Do NOT work from this summary alone — it is a MAP to canonical sources, not a replacement for them.

**Built:** 2026-05-14, from verified live Notion + Drive sources.
**Repo HEAD at handoff:** `82803a9`

---

## 0 — FIRST ACTIONS for the fresh PO-side conversation

1. Read this whole file.
2. Read NIR_OPERATING_RULES (Drive ID below) — how Nir works, 13 universal rules.
3. Have the Curator surface SESSION_STATE.md from the repo — the live state pointer.
4. Then: the one open item is the Phase 5.1 Lock 21 revision. Ruling already decided (Path 1 — see §6).

**Standing rule for the PO-side Claude:** Verify canonical sources by reading them — never from memory. State which surface you read (Notion vs repo file vs Drive). Keep sessions short. The relay (Nir between PO-side Claude and Curator) degrades over long sessions — this is a known, observed failure mode.

---

## 1 — WHO NIR IS / HOW HE WORKS

Nir — non-technical Product Owner of VIYO. Makes product + architecture decisions, does not write code. Mobile-first, values brevity, pushes back hard, demands evidence.

**Canonical source — READ THIS:**
- `NIR_OPERATING_RULES_v1.1.md` — Drive ID `1_TWmmt7IkkuQ9xoEzTYR9jvl6O63MZ0N` (13 universal rules: lead with summary, make the call don't menu, one ask per turn, reason before you invoke, read before you write, surface uncertainty, surface conflicts don't average, principle over prescription, catalog decisions, checkpoint after steps, budgets not advisory, acknowledge mistakes hold steady, know your role and play it).
- Older version `NIR_OPERATING_RULES.md` (12 rules) — Drive ID `1HoXdx9XrzdQtjQhynQjcN0QSx8V5nZJ-` — superseded by v1.1.

---

## 2 — THE TWO-CLAUDE WORKFLOW

- **Curator** — runs in Claude Code (Desktop). Touches files, runs git, commits. Local repo clone.
- **PO-side Claude** — the fresh conversation. Reviews what the Curator surfaces, pushes back, drafts Nir's ratification messages. Does NOT touch files.
- Nir relays between them. **This relay is the known bottleneck — keep sessions short.**

**3-agent review loop** (for governance file review): Author / Adversary / Arbiter, communicate only through files in `/docs/governance/review/`. Adversary runs in a separate isolated session (cold-read, no authoring context). Arbiter runs as a subagent of the Curator. Charters committed in repo at `/docs/governance/review/`.

---

## 3 — WHAT VIYO IS

AI Email Creative OS for Shopify+Klaviyo brands. Phased build:
- **Phase 1** — Image Studio ("Lovart on steroids"): 3-zone Lovart-style UX, 22 generation modes, 10 editing tools.
- **Phase 1B** — Intelligence Foundation (R46 Email Ingestion, R25 Video/IG, SYPHON, MAAX, HYVE). Hard prerequisite for Phase 2.
- **Phase 2** — Email Engine + Flows + Segments (13-Agent Brain Council, MJML, Klaviyo).
- **Phase 2.5** — Brand Team Collaboration.
- **Phase 3** — Intelligence Studio (Super Templates, Audiences).
- **Phase 4+** — R39 Global Admin expansion, Timer Service, self-hosted GPU, more ESPs, BFCM.

**Stack:** GrapesJS Studio SDK, Supabase, Cloudflare R2, Inngest+Mastra, Atlas Cloud + fal.ai (image AI Tier 1). Repo: `github.com/VIYO-NEW/VIYO`, branch `staging`.

**Kimi K2.6** — the code executor, runs in the Portal at ai.viyo.new. Kimi has NOT started and has NOT failed. Kimi activates when the first VIYO build directive is ready — AFTER the governance foundation is locked. The ~2 weeks of no-code is deliberate: the first build attempt (thin Manus R-files) failed for lack of foundation; the foundation work is the correction.

---

## 4 — GOVERNANCE FILES (repo `/docs/governance/` — have the Curator surface exact current state)

**Core governance + inheritance (read first):**

- `FOUNDATION_LOCK.md` — 30 Foundation Locks. Reviewed through the 3-agent loop, closed. Includes Lock 38 (Universal Service Agnosticism — "everything is agentic").
- `CLAUDE.md` (v2) — inheritance bootstrap file. Reviewed through the loop, closed.
- `ANTI_PATTERN_CATALOG.md` — 7 failure families, fix framework. Family 1 = silent writes to canonical state (the dominant failure mode).
- `ARCHITECT_OPERATING_RULES.md` — Architect/Curator operating discipline.
- `NIR_OPERATING_RULES.md` — repo copy of the universal rules (see §1 for the Drive canonical).
- `VIYO_CURRENT_MAP.md` — the inheritance map, ~15 sections.
- `SESSION_STATE.md` — **local-only at the Curator-machine path `C:\Users\Admin\Documents\VIYO\governance\SESSION_STATE.md`, NOT version-controlled in the repo.** <2KB live state pointer. Recovery protocol: per `ARCHITECT_OPERATING_RULES.md` §3 Rule 3.9.

**Substrate authority + standards:**

- `FOUNDATION_AUTHORITY.md` — substrate definitions + conflict resolutions + 4-competitor moat absorption framework. Authority tier 4 per FOUNDATION_LOCK §Authority hierarchy. Note: §1.3 + §9.2 contain stale superseded statements (Phase 5.2 reconciliation target).
- `CODING_CONVENTIONS.md` — testable code rules.
- `ZCBR_STANDARD.md` — R-spec quality bar (Lock 20 substrate). 3-checkpoint validation protocol.
- `VIYO_OPERATING_WORKFLOW.md` — agent topology, repo/product/storage roles, workflow paths.

**Product + build sequencing:**

- `PRODUCT_ROADMAP.md` — 4-phase plan + 11 sub-phases for Phase 1; Release readiness gates G1–G5.
- `VIYO_Master_Build_Sequence.md` — per-Bullet build sequence; B-1.18 acceptance gate substrate.
- `R-Spec_Audit_Table_v1.0.md` — per-R-spec status tracking (stale "D1-D57" entry per Phase 5.1 audit Item 2).

**Open decisions + infrastructure:**

- `OPEN_DECISIONS.md` — stale repo copy; Notion Open PO Decisions DB is canonical (data source `996b2e7d-...`).
- `INFRASTRUCTURE_DECISIONS.md` — ID-1 through ID-6 infrastructure ratifications (staging-is-canonical, R2 asset storage, Vercel project topology, etc.).
- `INFRASTRUCTURE_REPORT.md` — infrastructure substrate audit.
- `MIGRATION_AUTOMATION_PROPOSAL.md` — WP-5 migration automation design.
- `REDIS_ISOLATION_EVIDENCE.md` — WP-4 Redis isolation verification.
- `VERCEL_AUDIT_EVIDENCE.md` — WP-3 Vercel project audit.

**Subfolders:**

- `/docs/governance/review/` — the 3-agent charters (AUTHOR/ADVERSARY/ARBITER_CHARTER.md, REVIEW_FORMAT.md) + all REVIEW/ARBITRATION outputs.
- `/docs/governance/audits/` — audit artifacts (STATE_AUDIT.md, PHASE_5_1_DECISIONS_DB_AUDIT.md).

**Product north star (outside /governance/):**

- `/docs/PRD_V8.1.md` — the product north star. FINAL, committed. 9 sections + §6 revision.

---

## 5 — CANONICAL DATA STORES (all verified live 2026-05-14)

**Notion** (parent: VIYO Decision Log, ID `3559a84a-4679-8194-946e-f8fc5479e4c2` — archived flat page, holds the full 57-decision narrative):
- Decisions DB: `b886724c-aa03-432b-889e-e63d9cdb7de6`
- Open PO Decisions DB: `996b2e7d-50f8-41bd-a815-faf5194277f1`
- Foundation Locks DB: `7ed3c2e2-958d-40f0-bb32-70711b52c6bc`
- Documentation Gaps DB: `a6bc7b34-6f70-44e4-872f-4a7c481ff1d1`
- Conflict Resolutions DB: `1917980e-0392-4047-a169-3995fd13e137`
- PO Inbox: `be5f9696-b119-4f81-bb73-2599f5c1242b`
- Standing Rules page: `35c9a84a-4679-81c7-a1fc-db7556f572d4`
- Authority Hierarchy page: `35c9a84a-4679-81a0-b935-c795c2078fd3`

**Airtable** base: `appo5mNncCCzKcIRk` (Q&A Master Log, Build Tracker ~580 features, Skills Registry ~109 records, Services Inventory, Architecture Broadcasts).

**Drive** working folder: `1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki` (this file lives here).

**Authority hierarchy** (when documents conflict): PRD V8.1 > Notion Decision Log > Foundation Locks > Build Tracker.

---

## 6 — THE ONE THING MID-FLIGHT: Phase 5.1

Phase 5 = governance cleanup. Steps B + C done (CLAUDE.md and FOUNDATION_LOCK.md both reviewed through the loop, closed). Currently in **Step D, subphase 5.1** — a Decisions DB audit (`PHASE_5_1_DECISIONS_DB_AUDIT.md`, committed). The audit went through the 3-agent loop.

**Open item:** a Lock 21 wording revision. **Ruling already decided — Path 1:**
- Fold the count-restatement rule into Lock 21's EXISTING structure. No new table, no new sub-section, no second compliance test.
- Apply (a) Statement bullet 4 extension + (c) extend the existing "Does NOT apply to" carve-out line [Path A — file's actual canonical text is canonical] + (d) one-line substrate-pointer clarification.
- DROP (b) — there is no "Examples (illustrative)" table in the repo file (it exists in the Notion Lock 21 record but not the file — see §7).

**Next action:** tell the Curator "Path 1" on the Lock 21 revision, then it drafts the reframed text for ratification.

---

## 7 — KNOWN ISSUES TO TRACK

- **Notion vs repo drift on Lock 21:** the Notion Lock 21 record contains an "Examples (illustrative)" table that the repo `FOUNDATION_LOCK.md` does not. Phase 5.2 reconciliation item (FOUNDATION_AUTHORITY refresh + Notion Locks DB sync).
- **FOUNDATION_AUTHORITY.md §9.2 stale count** ("D1-D29" — actual is ≥84 decisions). Tracked; this is what the 5.1 audit addresses.
- **FOUNDATION_AUTHORITY.md §1.3** contains a stale superseded authority-hierarchy statement — Phase 5.2 reconciliation.
- **VIYO_CURRENT_MAP §10** has stale OD labels — Phase 5.3 reconciliation.
- **Relay degradation:** the Nir↔PO-Claude↔Curator relay degrades over long sessions. Observed 2026-05-14. Mitigation: short sessions, verify from canonical sources never memory, name which surface you read.

---

## 8 — OPEN PO ACTION ITEMS (from Notion Open PO Decisions DB — verify current status there)

- OD-001 — Pricing reconciliation (deck vs Notion D8). NOTE: largely dissolved via PRD V8.1 §6.5 — pricing is Portal runtime config. Verify status.
- OD-002 — Legal review on Milled / Email Love / Really Good Emails scraping. Blocks Pattern Seeding.
- OD-003 — AgentMail IMAP provider selection (Phase 1B).
- OD-004 — R29 PAL Rewrite Scope (per Notion canonical + PRD V8.1 §8.1). CLOSED 2026-05-15 via R29 v2 ZCBR-PASS Iα. [Historical note: prior text "Atlas Cloud + fal.ai catalog verification" was OD-003-area framing per OPEN_DECISIONS.md L20 — wrong-number drift.]
- OD-005 — 3 Swipe Gate reviewer accounts. Blocks Phase 1 RLHF flywheel.
- OD-006 — Set Anthropic Console spend cap $100/mo.
- (OD-021 — pricing tier / margin floor — CLOSED via dissolution.)

Verify all against the live Open PO Decisions DB — `996b2e7d-50f8-41bd-a815-faf5194277f1`.

---

## 9 — KEY LOCKED ARCHITECTURE (from the 57-decision Notion log — read the log for full context)

- PRD V8.1 is the product north star. FINAL.
- 30 Foundation Locks. Lock 17 (Foundation-First), Lock 18 (Tool-Capability-First), Lock 19 (Provider Agnosticism), Lock 21 (Governance Agnosticism), Lock 38 (Universal Service Agnosticism — everything registry-resolved, including payment; Stripe = named launch default, not hardcoded).
- Image compositing: Sharp programmatic (free) for text/color edits; AI only for creative changes (Decision 12).
- Provider hierarchy: Tier 1 Atlas Cloud + fal.ai, Tier 2 direct API (≤10 models), Tier 3 self-hosted GPU (economics-triggered) (Decisions 14, 37, 45).
- Phase plan locked (Decision 41): P0 substrate → P1 Image Studio → P1B Intelligence → P2 Email → P2.5 Collab → P3 Intelligence Studio → P4+.
- Phase 1B is a hard gate before Phase 2 (Decision 42).
- 3-reviewer Tinder swipe gate is a Phase 1 hard requirement (Decision 52).

---

*End of CONTEXT_RESTORE.md. This file routes to canonical sources — it does not replace them. The fresh conversation reads the sources, not just this map.*
