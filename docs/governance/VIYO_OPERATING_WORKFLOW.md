# VIYO_OPERATING_WORKFLOW.md

**Document class:** Operational workflow — the source-of-truth for who does what, where things live, and how work flows
**Status:** DRAFT v1.0 — pending PO ratification
**Author:** Architect Claude (Opus 4.7)
**Date:** 2026-05-11
**Repo target:** `/docs/governance/VIYO_OPERATING_WORKFLOW.md`
**Authority tier:** Sits at CLAUDE.md tier 1 read-first level — every future Architect session reads this first before any other governance file.
**Supersedes:** Implicit operational knowledge scattered across prior session memory and verbal corrections.
**Updated By:** Architect Claude only, with PO ratification logged in Notion.

---

## Purpose

This document locks the operational workflow in writing so the recurring confusions that wasted hours of session time stop happening. It defines the 5 agents and their boundaries, the 2 repos and what lives where, the 2 products, the document storage locations (including the explicit fact that Builder Technical Skills do NOT live in git), the 6 workflow paths, the current state snapshot, the path to first Kimi execution, the Session Opener Protocol for every future Architect session, and the anti-patterns this document eliminates.

When in doubt about who does what or where something lives, this document is the answer. If this document is wrong, fix this document first.

---

## Section 1 — The 5 Agents

| Agent | Where it runs | Role | Communication |
|---|---|---|---|
| **Architect Claude** | claude.ai chat (this session) | Authors governance, R-specs, skills, Bullet directives. Sequences work. Translates between PO non-technical language and builder execution. | Talks to PO via chat. Routes work to VIYO Manus only. |
| **VIYO Manus** | Manus app, separate channel | Commit agent for `github.com/VIYO-NEW/VIYO` only. Executes audit-first directives. | PO pastes Architect directives into Manus channel. Manus reports back via PO paste. |
| **Portal Manus** | Manus app, different separate channel | Commit agent for `github.com/viyo-ai/AI-API-Web-Portal-v2` only. Builds the build factory. | OUT OF SCOPE for this Architect channel. Managed by PO via a separate Architect channel. |
| **Kimi K2.6** | Inside Portal product at ai.viyo.new (Composer Queue) | LLM code executor. Generates VIYO application code from Bullet directives. NOT a Manus. | Receives Bullet directives via Composer Queue. Validated by Reviewer Claude. |
| **Reviewer Claude** | Inside Portal product at ai.viyo.new (§9 Gate) | Validator. Runs §9 code review protocol + ZCBR pre-flight on every Kimi output. | Operates inside Portal. Rejects non-compliant output back to Kimi or escalates to Architect. |

**Critical:** Kimi and Reviewer Claude are NOT Manus agents. They live inside the Portal product, not in any agent app. Manus is the commit layer that takes Kimi's validated code and commits it to the VIYO repo.

---

## Section 2 — The 2 Repos

| Repo | Branch | What lives here | Receives commits from |
|---|---|---|---|
| `github.com/VIYO-NEW/VIYO` | `staging` (canonical), `main` (held) | VIYO application code, governance docs at `/docs/governance/`, architecture docs at `/docs/architecture/`, R-specs at `/docs/research_specs/`, task files at `/.taskmaster/tasks/` | VIYO Manus only |
| `github.com/viyo-ai/AI-API-Web-Portal-v2` | `main` | Portal infrastructure — the build factory at ai.viyo.new. Composer Queue logic, Kimi integration, §9 Gate code, skills loading mechanism, Reviewer Claude integration. | Portal Manus only |

**Critical:** When a path starts with `/` (e.g. `/docs/governance/CLAUDE.md`), it is a GitHub repo path inside the relevant repo — never a Drive folder. Drive uses file IDs, not slash-paths.

---

## Section 3 — The 2 Products

| Product | URL | What it is | Status |
|---|---|---|---|
| **VIYO** | app.viyo.com | The product we are building. AI Email Creative OS for Shopify+Klaviyo brands. Absorbs Lovart + Migma + Grid&Pixel + Instant moats across 4 phases. | In active build — Phase 1 governance complete, Phase 1 application code not yet started. |
| **Portal** | ai.viyo.new | The build factory. Where Kimi runs, where Reviewer Claude validates, where Architect directives execute, where Builder Technical Skills load via `skills.pickForTask`. | Shipped — Composer Queue functional, skills loading verified per PORTAL-QA-05. |

VIYO is the product. Portal is the means of building VIYO. Do not confuse them.

---

## Section 4 — Document Storage Locations

| Location | What lives there | Identifier format | Access |
|---|---|---|---|
| **VIYO repo** | Governance docs, architecture docs, R-specs, application code, task files | Slash-path inside repo (`/docs/governance/CLAUDE.md`) | Git via VIYO Manus |
| **Portal repo** | Portal infrastructure, Composer Queue logic, skills loading mechanism, Reviewer Claude code | Slash-path inside repo | Git via Portal Manus (out of scope here) |
| **Drive claude folder** (`1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki`) | Canonical source for governance docs before commit, working files, Manus directives in flight, skill specs awaiting Portal upload | Drive file ID (e.g. `13CMBgFQvcN1k5aKLwUUeBPfRzR3Zh07c`) | Architect + PO read/write, VIYO Manus read |
| **Drive other folders** | V8 PRD compilation, ZCBR R-files folder, VIYO Master Architectural Atlas, Skill Routing Map, Feature Inventory v002 | Drive file ID | Per folder permissions |
| **Notion** (VIYO Decision Log + child databases) | PO ratifications, Foundation Locks, Open PO Decisions, Documentation Gaps, Conflict Resolutions, Session Logs | Notion page ID | Architect + PO read/write |
| **Portal product storage** at ai.viyo.new | **Builder Technical Skills (NOT in any git repo)**, AI Brain Pattern Skills Layer 2 in `skills_registry` table, Layer 1 Platform Skills in orchestrator code | Portal admin UI / skills.pickForTask API | PO uploads via Portal admin UI |

**Critical and non-negotiable:** Builder Technical Skills do NOT live in any git repo. They are authored as markdown specs by Architect, stored canonically in the Drive claude folder, then uploaded to Portal product storage at ai.viyo.new by the PO via Portal admin UI. At runtime they load via the `skills.pickForTask` API. There is no `/.skills/` folder in the VIYO repo. There is no `/.skills/` folder in the Portal repo. Skills are not files in git.

The 11 Tier 1 Builder Technical Skills referenced in prior memory (database-migration, inngest-function-authoring, hono-route-authoring, pattern-recipe-validation, writing-behavioral-tests, brand-vault-asset-write, directive-authoring-v2, ingestion-evidence-protocol, §9-code-review-protocol, r-file-rewrite-pattern, acceptance-message-template) are an intent list — names of skills that need to be authored. Only zcbr-spec-validation has been fully authored as of this date.

---

## Section 5 — The 6 Workflow Paths

### Path A — Governance authoring

Architect authors governance doc as markdown → saves to Drive claude folder → presents 1-paragraph PO summary → PO ratifies → Architect drafts audit-first Manus directive citing the Drive file ID → PO pastes directive to VIYO Manus channel → VIYO Manus commits to `/docs/governance/` on VIYO staging → PR opened, CI passes, merged → Architect verifies URLs (branch + PR + merge commit + manual PO action y/n) → Notion Session Log updated.

**Used for:** CLAUDE.md, FOUNDATION_AUTHORITY.md, FOUNDATION_LOCK.md, CODING_CONVENTIONS.md, VIYO_Master_Build_Sequence.md, ZCBR_STANDARD.md, R-Spec_Audit_Table, this document, and future governance.

### Path B — R-spec rewrite

Architect rewrites R-spec to ZCBR standard → self-validates via zcbr-spec-validation skill (mental check until skill is uploaded to Portal) → adds `ZCBR Status: PASSED` header → saves to Drive claude folder → presents 1-paragraph PO summary → PO ratifies → Architect drafts audit-first Manus directive → PO pastes to VIYO Manus → Manus commits to `/docs/research_specs/` on VIYO staging → standard URL verification + Notion catalog.

**Used for:** B-XC.01-04, B-XC.06, B-XC.18-24 (12 CRITICAL R-spec rewrites). Just-in-time for IMPORTANT (10) and LATER (7) per R-Spec Audit Table.

### Path C — VIYO application code through Kimi (the main build path)

Architect authors Bullet directive citing ZCBR-PASSED R-specs and required skills → presents 1-paragraph PO summary → PO ratifies → Bullet directive enters Portal Composer Queue → Kimi K2.6 pre-flight runs zcbr-spec-validation against cited R-specs → Kimi generates code per directive + applicable Builder Technical Skills → Reviewer Claude runs §9 Gate + ZCBR pre-flight → on pass, output enters commit queue → PO ratifies the commit → Portal Manus commits to VIYO repo on staging → standard URL verification + Notion catalog.

**Used for:** every Bullet from B-1.00 onward. THE MAIN BUILD PATH. This is what produces the VIYO application.

### Path D — Portal infrastructure

OUT OF SCOPE for this Architect channel. Portal Manus + a separate Portal Architect channel managed by PO outside this session handle all Portal repo work. T73 and any T73 follow-ups route there, not here. This Architect channel does not draft directives targeting `github.com/viyo-ai/AI-API-Web-Portal-v2`.

### Path E — Builder Technical Skill authoring

Architect authors skill spec as markdown (e.g. zcbr-spec-validation) → self-validates against ZCBR_STANDARD → saves to Drive claude folder → presents 1-paragraph PO summary → PO ratifies → PO uploads to Portal product storage via Portal admin UI → skill becomes available at runtime via `skills.pickForTask` API → Kimi, Reviewer Claude, and Architect can load it.

**No Manus involvement, no git commit. The skill never enters any repo.**

**Used for:** zcbr-spec-validation (1 authored, awaiting Portal upload). 11 remaining Tier 1 skills authored just-in-time as Master Build Sequence Bullets require them.

### Path F — AI Brain Pattern Skill authoring

Architect authors Layer 2 prompt fragment skill → saves to Drive → presents 1-paragraph PO summary → PO ratifies → INSERT into `skills_registry` Postgres table either via Portal admin UI (PO action) or via VIYO Manus directive depending on which surface owns the table → MAAX orchestrator injects at runtime per Brain assignment.

Layer 1 Platform Skills (self-improving-agent, memory-self-heal, clawhub/openclaw orchestrators) live in Portal orchestrator code path, NOT in skills_registry. Those are Portal infrastructure (Path D, out of scope here).

**Used for:** ~109 Layer 2 skills per Skill Routing Map. Active subset rotates by phase: image-related skills Phase 1, email skills Phase 2, top brain skills Phase 3.

---

## Section 6 — Current State Snapshot (2026-05-11)

| Item | State |
|---|---|
| VIYO repo staging HEAD | `cf37ca9a5f5f91c475cdc0474a092cfdfb2d481f` |
| VIYO repo main | Held — staging→main merge deferred per PO decision |
| Portal repo main HEAD | `e2228419eaa1f03b0a05373a1227542f3885c34b` (last verified) |
| Phase 1 governance | COMPLETE — PR #16 (Phase 1 ZCBR Governance), PR #17 (Gap Triage), PR #18 (Skills Path Correction) all merged |
| Foundation Locks | 14 original + Locks 17-20 ratified + Locks 15-16 reserved |
| Coding Conventions | Rules 1-15 |
| CLAUDE.md authority hierarchy | 9 levels |
| Communication rules | RULE A-F locked, 3-check pass locked, URL verification standing rule locked, PR merge confirmation standing rule locked |
| ZCBR_STANDARD.md | Active in repo, Foundation Lock 20 |
| Master Build Sequence | v1.1 in repo (140 numbered Bullets + 10 IMPORTANT JIT stubs + 7 LATER deferred) |
| R-Spec Audit Table v1.0 | Active in repo |
| CRITICAL R-specs ZCBR-validated/rewritten | 0 of 12 |
| IMPORTANT R-specs scheduled | 0 of 10 (JIT triggered) |
| LATER R-specs scheduled | 0 of 7 |
| Builder Technical Skills authored | 1 of 12 (zcbr-spec-validation in Drive, awaiting Portal upload) |
| zcbr-spec-validation uploaded to Portal | NO — PO action pending |
| AI Brain Pattern Skills Layer 1 | Wired in Portal orchestrator (per prior session) |
| AI Brain Pattern Skills Layer 2 | 6 seed entries in skills_registry per P0-07 |
| Notion Session Log May 11 | Cataloged at https://www.notion.so/35d9a84a467981fb9137ddf8c6d13e13 |
| V8 PRD | Stale by 5 days, scheduled Phase 2 readiness item |
| PORTAL_AUTHORITY.md | Does not exist (OD-017) |

---

## Section 7 — Path to First Kimi Execution

The first VIYO application code that Kimi executes will be B-1.00 Studio Core Loop (or earliest non-substrate Bullet in Master Sequence v1.1 dependency order). Phase 0 substrate is largely shipped by VIYO Manus per FOUNDATION_AUTHORITY.md (552 of 580 features Not Started, 25 Done, 3 In Progress); remaining P0 work continues in parallel.

**Prerequisites for B-1.00 admission to Composer Queue:**

1. **zcbr-spec-validation skill uploaded to Portal product** (PO action via Portal admin UI). Without this, Lock 20 mechanical enforcement does not fire and Reviewer Claude / Kimi pre-flight checks have nothing to load.
2. **B-XC.17 ZCBR plumbing reframed** for Portal product wiring (Path E) instead of git commit. Originally scoped as repo work; corrected to Portal upload after skills storage clarification.
3. **CRITICAL R-specs cited by B-1.00 rewritten to ZCBR-PASSED:** at minimum R20 Database Schema (B-XC.02), R24 Image Pipeline (B-XC.03), R29 PAL unified (B-XC.04 — covers both ESP and AI registries per Lock 19 + Decision 55).
4. **Phase 1 Builder Technical Skills authored** that B-1.00 invokes: at minimum database-migration, inngest-function-authoring, hono-route-authoring, brand-vault-asset-write, writing-behavioral-tests. Each authored via Path E.
5. **Phase 1 AI Brain Pattern Skills active in skills_registry** for image generation surface: image_pipeline_router, Visual Intent Router skills, Art Director routing skills, credential_resolver, fashion_doctrine, beauty_doctrine.
6. **B-1.00 Bullet directive itself authored** by Architect with full R-spec citations carrying ZCBR Status: PASSED + Builder Technical Skill citations + AI Brain Pattern Skill citations.
7. **B-1.00 directive ratified** by PO, queued to Composer Queue, Kimi pre-flight passes.

Realistic timeline: 4-8 Architect sessions before B-1.00 ships to Composer Queue, depending on parallelization and R-spec rewrite complexity.

---

## Section 8 — Session Opener Protocol

Every future Architect Claude session begins with reading these files in this exact order, before responding to any task:

1. This document (`/docs/governance/VIYO_OPERATING_WORKFLOW.md`) — agents, repos, products, storage, workflow paths, current state
2. `/docs/governance/CLAUDE.md` — 9-level authority hierarchy + standing rules + RULE A-F + 3-check pass
3. `/docs/governance/FOUNDATION_AUTHORITY.md` — 12 substrates L1-L12, phase plan, 4-competitor moat
4. `/docs/governance/FOUNDATION_LOCK.md` — Locks 1-20
5. `/docs/governance/CODING_CONVENTIONS.md` — Rules 1-15
6. `/docs/governance/VIYO_Master_Build_Sequence.md` — current Bullet order and dependency graph
7. `/docs/governance/ZCBR_STANDARD.md` — R-spec quality bar
8. `/docs/governance/R-Spec_Audit_Table_v1.0.md` — which R-specs need rewrite, which PASS
9. Latest Notion Session Log (search "Session Log — <most recent date>")
10. Current task file in `/.taskmaster/tasks/` if applicable

Then Architect either asks ONE clarifying question (RULE F) or proceeds with a declared next step per the 10 behaviors locked 2026-05-11.

---

## Section 9 — Anti-Patterns This Document Eliminates

| Anti-pattern | Corrected by |
|---|---|
| Treating `/docs/governance/` as a Drive path | Section 4 — slash-paths are repo paths, Drive uses file IDs |
| Treating skills as files in any git repo | Section 4 — explicit "Builder Technical Skills do NOT live in git" |
| Routing Portal repo work through VIYO Manus | Section 1 + Section 2 — VIYO Manus is VIYO repo only, Portal Manus is a separate channel out of scope |
| Conflating Kimi with Manus | Section 1 — Kimi is LLM in Portal product, Manus is commit agent |
| Asking PO to choose between technical Options A/B/C | RULE B (CLAUDE.md) — Architect makes the call with rationale |
| Surgical insertion-point edits to existing files | RULE D (CLAUDE.md) — full file replacement, never patches |
| Drafting directives without auditing current file state | RULE E (CLAUDE.md) — Phase 0 audit-first, no conditional "if not present" |
| Stacking multiple asks in one turn | RULE F (CLAUDE.md) — one ask, wait for reply |
| Proceeding to next work after finishing without status report | Behavior 6 (2026-05-11) — status, then standing by |
| Extrapolating from prior context when uncertain | Behavior 10 (2026-05-11) — ask, do not guess |
| Searching Drive by repo path | Behavior 1 (2026-05-11) — repo paths are repo paths, never Drive |
| Auto-acting on architecture work in parallel without PR merge confirmation | Behavior 5 (2026-05-11) — every PR merge reports SHA + timestamp before next ask |

---

## Section 10 — Update Authority

This document is updated by **Architect Claude only**, with PO ratification logged in Notion VIYO Decision Log.

Each update produces:
1. Diff against previous version (what changed, why, source decision)
2. New version commit by VIYO Manus to `/docs/governance/VIYO_OPERATING_WORKFLOW.md` via Path A
3. Notion Session Log entry referencing the change
4. CLAUDE.md updated if any of the 5 agents / 2 repos / 2 products / 6 paths definitions change

This document is NOT edited by VIYO Manus or any other agent directly. Manus may flag issues but rewrites are authored by Architect Claude.

---

*End of VIYO_OPERATING_WORKFLOW.md*
