# VIYO_OPERATING_WORKFLOW.md

**Document class:** Operational workflow — the source-of-truth for who does what, where things live, and how work flows
**Status:** DRAFT v1.1 — pending PO ratification (v1.1 changes: Behavior #11 sharpened to 5 sub-rules, Path D scope clarified with T73 anti-pattern, Current State snapshot refreshed for PR #19, Section 8.5 Architect Operating Behaviors added)
**Author:** Architect Claude (Opus 4.7)
**Date:** 2026-05-11
**Repo target:** `/docs/governance/VIYO_OPERATING_WORKFLOW.md`
**Authority tier:** Sits at CLAUDE.md tier 1 read-first level — every future Architect session reads this first before any other governance file.
**Supersedes:** v1.0 (2026-05-11 earlier draft) and implicit operational knowledge scattered across prior session memory and verbal corrections.
**Updated By:** Architect Claude only, with PO ratification logged in Notion.

---

## Purpose

This document locks the operational workflow in writing so the recurring confusions that wasted hours of session time stop happening. It defines the 5 agents and their boundaries, the 2 repos and what lives where, the 2 products, the document storage locations (including the explicit fact that Builder Technical Skills do NOT live in git), the 6 workflow paths, the current state snapshot, the path to first Kimi execution, the Session Opener Protocol, the 11 Architect Operating Behaviors, and the anti-patterns this document eliminates.

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

**Path C uses Portal — but is still Path C, not Path D.** Path C work executes THROUGH the Portal product (Composer Queue, Kimi, Reviewer Claude, skill loading) and is committed by Portal Manus to the VIYO repo. The fact that Portal infrastructure is invoked does not make the work Portal-side. The output of Path C is a commit to `github.com/VIYO-NEW/VIYO` — that's what classifies it as Path C, not the means by which the code was produced.

### Path D — Portal infrastructure

**Scope (sharpened):** Path D covers ONLY work whose output is a commit to `github.com/viyo-ai/AI-API-Web-Portal-v2`. This means: Composer Queue code, three-role workflow logic (Architect/Reviewer/Kimi orchestration), skill loading API surface (`skills.pickForTask`), Reviewer Claude integration code, §9 Gate enforcement code, Kimi integration code, Portal admin UI for skills upload, Portal-side billing or auth, anything else that physically lives in the Portal repo.

**Path D is NOT triggered by "the work uses Portal."** Most VIYO application code uses Portal (Path C). That does not make it Path D. The classifier is the commit target, not the runtime invocation.

**OUT OF SCOPE for this Architect channel.** Portal Manus + a separate Portal Architect channel managed by PO outside this session handle all Path D work. This Architect channel does not draft directives targeting `github.com/viyo-ai/AI-API-Web-Portal-v2`.

**T73 anti-pattern example:** Earlier in this session, work intended as VIYO Path C (Studio Editing Router code that runs through Portal Composer Queue) was incorrectly attributed to Path D because the work "uses Portal." This is wrong. T73 is VIYO application code; its output is a commit to the VIYO repo via the Path C flow (Architect → Bullet → Composer Queue → Kimi → Reviewer Claude → Portal Manus commits to VIYO repo on staging). The fact that Portal Composer Queue is invoked along the way does not move it to Path D. Path D would be work that modifies the Composer Queue itself, not work that uses it.

**Misrouting example for context:** During this session, the directive PORTAL-FULL-SUITE-TRIAGE-001 was misrouted to VIYO Manus when its actual scope was Portal repo modifications (Path D). The directive became a dead directive because VIYO Manus has no Portal repo write access (correct deny-by-design). The correction: Path D directives go to Portal Manus via the separate Architect channel, never to this channel.

### Path E — Builder Technical Skill authoring

Architect authors skill spec as markdown (e.g. zcbr-spec-validation) → self-validates against ZCBR_STANDARD → saves to Drive claude folder → presents 1-paragraph PO summary → PO ratifies → PO uploads to Portal product storage via Portal admin UI → skill becomes available at runtime via `skills.pickForTask` API → Kimi, Reviewer Claude, and Architect can load it.

**No Manus involvement, no git commit. The skill never enters any repo.**

**Used for:** zcbr-spec-validation (1 authored, awaiting Portal upload). 11 remaining Tier 1 skills authored just-in-time as Master Build Sequence Bullets require them.

### Path F — AI Brain Pattern Skill authoring

Architect authors Layer 2 prompt fragment skill → saves to Drive → presents 1-paragraph PO summary → PO ratifies → INSERT into `skills_registry` Postgres table either via Portal admin UI (PO action) or via VIYO Manus directive depending on which surface owns the table → MAAX orchestrator injects at runtime per Brain assignment.

Layer 1 Platform Skills (self-improving-agent, memory-self-heal, clawhub/openclaw orchestrators) live in Portal orchestrator code path, NOT in skills_registry. Those are Portal infrastructure (Path D, out of scope here).

**Used for:** ~109 Layer 2 skills per Skill Routing Map. Active subset rotates by phase: image-related skills Phase 1, email skills Phase 2, top brain skills Phase 3.

---

## Section 6 — Current State Snapshot (2026-05-11, end-of-session)

| Item | State |
|---|---|
| VIYO repo staging HEAD | `63a11f0fe0f204784b1d0eb441eb9ab34c134250` (after PR #19 merge) |
| VIYO repo main | Held — staging→main merge deferred per PO decision |
| Portal repo main HEAD | `e2228419eaa1f03b0a05373a1227542f3885c34b` (last verified) |
| Phase 1 governance | COMPLETE — PR #16 (Phase 1 ZCBR Governance), PR #17 (Gap Triage), PR #18 (Skills Path Correction), PR #19 (VIYO_OPERATING_WORKFLOW.md v1.0) all merged |
| Foundation Locks | 14 original + Locks 17-20 ratified + Locks 15-16 reserved |
| Coding Conventions | Rules 1-15 |
| CLAUDE.md authority hierarchy | 9 levels |
| Communication rules | RULE A-F locked, 11 Architect Operating Behaviors locked (Section 8.5) |
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
| WP-1 (Source-of-Truth Repair) | UNVERIFIED — OD-019 open |
| WP-2 (Render Blueprint Reconciliation) | UNVERIFIED — OD-019 open |
| WP-3 (Vercel Deployment Audit) | SHIPPED PR #15 commit `9438e0c77a438e410834f90d1d8cc90adc6ded6d` |
| WP-4 (Redis Isolation Smoke Test) | SHIPPED PR #15 |
| WP-5 (Migration Automation Design) | SHIPPED PR #15 |
| T73 (Studio Editing Router) | PAUSED. Architecture APPROVED 2026-05-03 (per Builder Instructions Sheet ZCBR V5 FINAL). Code work not started. Blocked on WP-1 + WP-2 verification (OD-019). |
| First Path C Bullet target | B-1.00 Studio Core Loop (ratified 2026-05-11 per D66) |
| Notion Session Log May 11 | https://www.notion.so/35d9a84a467981fb9137ddf8c6d13e13 |
| V8 PRD | Stale by 5 days, scheduled Phase 2 readiness item |
| PORTAL_AUTHORITY.md | Does not exist (OD-017) |
| GAP-008 | Extended to cover both T73 architecture drift + WP-3/4/5 shipping drift (same root cause: stale status docs) |

---

## Section 7 — Path to First Kimi Execution

The first VIYO application code that Kimi executes will be **B-1.00 Studio Core Loop** (ratified 2026-05-11 per D66 as the first Path C Bullet per Master Build Sequence v1.1 §3.1). Phase 0 substrate is largely shipped by VIYO Manus per FOUNDATION_AUTHORITY.md (552 of 580 features Not Started, 25 Done, 3 In Progress); remaining P0 work continues in parallel.

**Prerequisites for B-1.00 admission to Composer Queue (per Master Sequence v1.1 §5 dependency graph):**

1. **B-XC.17 ZCBR Standard + skill + wiring** — gates all subsequent CRITICAL XC R-spec rewrites. Includes uploading zcbr-spec-validation skill to Portal product via Path E (PO action), wiring Kimi pre-flight to invoke the skill at Composer Queue intake, updating §9 code review protocol with Step 0 ZCBR pre-flight.
2. **CRITICAL B-XC R-spec rewrites:** B-XC.01 (R29 PAL unified per D55), B-XC.02 (R20 Database Schema), B-XC.03 (R24 Image Pipeline). Plus audit-and-fix B-XC.18 (R17), B-XC.19 (R19), B-XC.20 (R21), B-XC.21 (R22), B-XC.22 (R23), B-XC.23 (fresh DR runbook supersedes R52), B-XC.24 (T47 Studio Editing Tools), B-XC.06 (T46 tier inversion).
3. **Phase 1 skill specs authored via Path E:** B-XC.07 (image-generation-pipeline), B-XC.08 (pattern-cache-lookup), B-XC.09 (art-director-routing), B-XC.10 (rlhf-event-emission). All Path E (Drive → PO upload to Portal).
4. **B-XC.12 governance refresh residual** (PR #16/17/18/19 covered most; verify residual scope).
5. **B-XC.15 PORTAL_AUTHORITY.md authoring** (resolves OD-017 + OD-009).
6. **B-XC.16 reconcile any existing BULLET_1_DIRECTIVE.md draft** against Master Sequence (resolves OD-010 naming convention).
7. **ZCBR pre-flight verification:** every R-spec cited by B-1.00 (R20, R24, R29 PAL) carries `ZCBR Status: PASSED` before B-1.00 admitted to Composer Queue.
8. **B-0.22 Phase 0 Acceptance Gate** confirmed (currently UNVERIFIED — formal gate not run in this session record).
9. **B-1.00 Bullet directive itself authored** by Architect with full R-spec + skill citations, ZCBR-PASSED.
10. **B-1.00 directive ratified by PO**, queued to Composer Queue, Kimi pre-flight passes.

Realistic timeline: 4-8 Architect sessions before B-1.00 ships to Composer Queue, depending on parallelization and R-spec rewrite complexity.

---

## Section 8 — Session Opener Protocol

Every future Architect Claude session begins with reading these files in this exact order, before responding to any task:

1. This document (`/docs/governance/VIYO_OPERATING_WORKFLOW.md`) — agents, repos, products, storage, workflow paths, current state, 11 operating behaviors
2. `/docs/governance/CLAUDE.md` — 9-level authority hierarchy + standing rules + RULE A-F
3. `/docs/governance/FOUNDATION_AUTHORITY.md` — 12 substrates L1-L12, phase plan, 4-competitor moat
4. `/docs/governance/FOUNDATION_LOCK.md` — Locks 1-20
5. `/docs/governance/CODING_CONVENTIONS.md` — Rules 1-15
6. `/docs/governance/VIYO_Master_Build_Sequence.md` — current Bullet order and dependency graph
7. `/docs/governance/ZCBR_STANDARD.md` — R-spec quality bar
8. `/docs/governance/R-Spec_Audit_Table_v1.0.md` — which R-specs need rewrite, which PASS
9. Latest Notion Session Log (search "Session Log — <most recent date>")
10. Current task file in `/.taskmaster/tasks/` if applicable

Then Architect either asks ONE clarifying question (RULE F) or proceeds with a declared next step per the 11 behaviors locked in Section 8.5.

---

## Section 8.5 — Architect Operating Behaviors (locked 2026-05-11)

These behaviors are enforcement rules for Architect Claude conduct, sharpened via PO corrections during the 2026-05-11 session. Catalogued in Notion D65.

1. **Slash-prefix paths are repo paths, not Drive folders.** `/docs/governance/CLAUDE.md` is a GitHub repo path inside the relevant repo. Drive uses file IDs, not slash-paths.
2. **Files exist in Drive only when PO supplies a Drive file ID or attachment.** Do not assume Drive contains files you have not been pointed to.
3. **Ask for files by Drive file ID, not search.** When the PO references a file, request its Drive file ID. Search is a fallback, not a default.
4. **PO corrections are canonical immediately.** When the PO corrects state, accept the correction. If a contradiction with prior state exists, surface it. Do not re-litigate.
5. **After PR merge, report PR number + timestamp + commit SHA before next ask.** Every merge produces these 3 facts. Closeout messages cite them.
6. **After finishing work, deliver status only — no auto-propose next.** The PO chooses next work. Do not chain proposals.
7. **One ask per turn (RULE F).** Queue work but present one decision at a time with explicit confirmation between asks.
8. **No A/B/C menus on implementation (RULE B).** Architect makes the call with rationale. PO ratifies or adjusts. PO does not pick between Architect-presented options.
9. **Audit-first directives (RULE E).** No "if not present" or "if missing" language. State is verified, then changes are applied.
10. **When unsure of infrastructure, ASK PO — don't guess.** Extrapolating from prior context when uncertain is an anti-pattern.
11. **Behavior #11 (sharpened to 5 sub-rules 2026-05-11) — Reason from ALL available evidence before defaulting to Manus.** Manus queries are the last resort, not the first. Reasoning is free; Manus queries cost PO time.

   - **Sub-rule 1: Find ALL related files, newer wins.** Multiple versions of the same document may exist (e.g. FOUNDATION_LOCK.md, FOUNDATION_LOCK_v2.md, FOUNDATION_LOCK_v3.md — newer supersedes). Sort by modifiedTime descending. Reasoning from only the first file found is the original Behavior #11 violation.
   - **Sub-rule 2: Check deliverable files separately from status documents.** Status docs lag behind reality. The existence of a deliverable file in `/docs/governance/` (e.g. `MIGRATION_AUTOMATION_PROPOSAL.md` = WP-5 deliverable) proves the work shipped regardless of what the status doc claims.
   - **Sub-rule 3: Reconcile conflicts: deliverable existence > stale status doc.** When a status doc says "pending" and a deliverable file exists, the deliverable wins. The status doc is stale.
   - **Sub-rule 4: Apply gap lessons to adjacent items same turn.** When a doc-drift gap is logged, immediately check whether the same drift affects every item that depends on the stale doc. Don't log GAP-008 then commit GAP-009 next response for the same root cause.
   - **Sub-rule 5: NEVER ASSUME STATUS FROM ABSENCE OF EVIDENCE.** Verify status or explicitly mark UNVERIFIED. Saying "WP-1 likely pending because PO didn't name it in confirmation" is the assumption-from-absence failure mode. WP-1 could have shipped in any of the prior PRs without being explicitly named. Always verify or explicitly tag UNVERIFIED.

**Origin trail of Behavior #11 sharpening this session:**

- Original failure: defaulted to Manus audit query for T73 status instead of reasoning from Drive evidence in hand.
- Sharpening 1: reason from ALL evidence before Manus.
- Sharpening 2: check deliverable files separately from status docs; deliverable wins.
- Sharpening 3: never assume status from absence of evidence; verify or tag UNVERIFIED.

GAP-008 logs both the T73 architecture approval drift and the WP-3/4/5 shipping status drift caused by Behavior #11 violations earlier in this session.

---

## Section 9 — Anti-Patterns This Document Eliminates

| Anti-pattern | Corrected by |
|---|---|
| Treating `/docs/governance/` as a Drive path | Section 4 — slash-paths are repo paths, Drive uses file IDs |
| Treating skills as files in any git repo | Section 4 — explicit "Builder Technical Skills do NOT live in git" |
| Routing Portal repo work through VIYO Manus | Section 1 + Section 2 — VIYO Manus is VIYO repo only, Portal Manus is a separate channel out of scope |
| Conflating Kimi with Manus | Section 1 — Kimi is LLM in Portal product, Manus is commit agent |
| Conflating "uses Portal" with "is Portal infrastructure" | Section 5 Path D — Path C uses Portal Composer Queue, output is a VIYO repo commit. Path D's classifier is the commit target (Portal repo), not runtime invocation. T73 is VIYO Path C, not Portal Path D. |
| Asking PO to choose between technical Options A/B/C | RULE B + Behavior 8 — Architect makes the call with rationale |
| Surgical insertion-point edits to existing files | RULE D — full file replacement, never patches |
| Drafting directives without auditing current file state | RULE E + Behavior 9 — Phase 0 audit-first, no conditional "if not present" |
| Stacking multiple asks in one turn | RULE F + Behavior 7 — one ask, wait for reply |
| Proceeding to next work after finishing without status report | Behavior 6 — status, then standing by |
| Extrapolating from prior context when uncertain | Behavior 10 — ask, do not guess |
| Searching Drive by repo path | Behavior 1 — repo paths are repo paths, never Drive |
| Auto-acting on architecture work in parallel without PR merge confirmation | Behavior 5 — every PR merge reports SHA + timestamp before next ask |
| Reasoning from a single status doc and stopping | Behavior 11 sub-rule 2 — check deliverable files separately |
| Assuming status from absence of evidence | Behavior 11 sub-rule 5 — verify or tag UNVERIFIED |
| Logging the same root-cause drift gap twice in adjacent turns | Behavior 11 sub-rule 4 — apply gap lesson to adjacent items same turn |

---

## Section 10 — Update Authority

This document is updated by **Architect Claude only**, with PO ratification logged in Notion VIYO Decision Log.

Each update produces:
1. Diff against previous version (what changed, why, source decision)
2. New version commit by VIYO Manus to `/docs/governance/VIYO_OPERATING_WORKFLOW.md` via Path A
3. Notion Session Log entry referencing the change
4. CLAUDE.md updated if any of the 5 agents / 2 repos / 2 products / 6 paths definitions change

This document is NOT edited by VIYO Manus or any other agent directly. Manus may flag issues but rewrites are authored by Architect Claude.

**v1.0 → v1.1 diff (2026-05-11 end-of-session):**
- Status line updated to v1.1 with change summary
- Section 5 Path C augmented with explicit "Path C uses Portal but is still Path C" note
- Section 5 Path D scope sharpened with classifier rule (commit target, not runtime invocation) and T73 anti-pattern example
- Section 6 Current State snapshot refreshed: staging HEAD updated to `63a11f0fe0f204784b1d0eb441eb9ab34c134250` post PR #19, PR #19 added to Phase 1 governance list, WP-1/2/3/4/5 status rows added with PR #15 evidence, T73 status row added, B-1.00 first Path C Bullet row added, GAP-008 extension row added
- Section 7 rewritten as prerequisite list per Master Sequence v1.1 §5 dependency graph
- NEW Section 8.5 added: Architect Operating Behaviors with 11 behaviors and Behavior #11 sharpened to 5 sub-rules
- Section 9 Anti-Patterns table expanded with 4 new rows (Path C/D distinction, Behavior #11 sub-rules)
- Section 10 v1.0→v1.1 diff added to this section

---

*End of VIYO_OPERATING_WORKFLOW.md v1.1*
