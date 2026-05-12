# VIYO_OPERATING_WORKFLOW.md

**Document class:** Operational workflow — source-of-truth for who does what, where things live, and how work flows
**Status:** DRAFT v1.2 (revision 2 — Lock 21 Governance Agnosticism sweep applied 2026-05-12) — pending PO ratification
**Author:** Architect Claude (Opus 4.7)
**Date:** 2026-05-12
**Target document role:** The governance document the next Architect session reads first; describes operational workflow capabilities and behaviors, never implementation choices.
**Authority tier:** Top read-first level — every future Architect session reads this before any other governance file.
**Supersedes:** v1.1 (merged 2026-05-12T00:46:19Z UTC) and v1.0.
**Updated By:** Architect Claude only, with PO ratification logged in Notion.
**Lock 21 compliance:** This document describes capabilities and behaviors. Implementation choices (specific files, paths, schemas, mechanisms) belong to the executing agent at the moment of execution. State observations (Current State snapshot, version diffs) retain specifics per Lock 21 edge case clause.

---

## Purpose

This document locks the operational workflow so the recurring confusions that wasted hours of session time stop happening. It defines the agents and their boundaries, the repos and what each receives, the products, the storage roles, the workflow paths, current state, the path to first Kimi execution, the Session Opener capability, the Architect Operating Behaviors, and the anti-patterns this document eliminates.

When in doubt about who does what or where something lives, this document is the answer. If this document is wrong, fix this document first.

---

## Section 1 — The 5 Agents

| Agent | Where it runs | Role | Communication |
|---|---|---|---|
| **Architect Claude** | claude.ai chat (this session) | Authors governance, R-specs, skills, Bullet directives. Sequences work. Translates between PO non-technical language and builder execution. Applies Lock 21 self-validation to every governance authoring pass. | Talks to PO via chat. Routes work to VIYO Manus only. |
| **VIYO Manus** | Manus app, separate channel | Commit agent for the VIYO product repo. Executes audit-first directives. | PO pastes Architect directives. Manus reports back via PO paste. |
| **Portal Manus** | Manus app, different separate channel | Commit agent for the Portal infrastructure repo. Builds the build factory. | OUT OF SCOPE for this Architect channel. Managed via a separate Architect channel. |
| **Kimi K2.6** | Inside Portal product (Composer Queue) | LLM code executor. Generates VIYO application code from Bullet directives. NOT a Manus. | Receives Bullet directives via Composer Queue. Validated by Reviewer Claude. |
| **Reviewer Claude** | Inside Portal product (§9 Gate) | Validator. Runs §9 code review protocol + ZCBR pre-flight on every Kimi output. | Operates inside Portal. Rejects non-compliant output back to Kimi or escalates to Architect. |

**Critical:** Kimi and Reviewer Claude are NOT Manus agents. They live inside the Portal product. Manus is the commit layer that takes Kimi's validated code and commits to the VIYO repo.

---

## Section 2 — The 2 Repos

| Repo | Branch | What lives here | Receives commits from |
|---|---|---|---|
| **VIYO product repo** (`github.com/VIYO-NEW/VIYO`) | `staging` (canonical), `main` (held) | VIYO application code, governance documents, architecture documents, research specifications, task files | VIYO Manus only |
| **Portal infrastructure repo** (`github.com/viyo-ai/AI-API-Web-Portal-v2`) | `main` | Portal infrastructure — the build factory itself: Composer Queue logic, Kimi integration, §9 Gate code, skills loading mechanism, Reviewer Claude integration | Portal Manus only |

**Critical:** When a path starts with `/`, it is a repo-internal path inside the relevant repo — never a non-repo storage path. Non-repo storage uses its own identifier scheme (file IDs, page IDs, etc.), not slash-paths.

---

## Section 3 — The 2 Products

| Product | URL | What it is | Status |
|---|---|---|---|
| **VIYO** | app.viyo.com | The product being built. AI Email Creative OS for Shopify+Klaviyo brands. Absorbs the 4-competitor moat across 4 phases. | Active build — Phase 1 governance complete; three CRITICAL R-specs ratified at ZCBR-PASSED with v1 supersession sequences complete; Phase 1 application code not yet started. |
| **Portal** | ai.viyo.new | The build factory. Where Kimi runs, where Reviewer Claude validates, where Architect directives execute, where Builder Technical Skills load at runtime. | Shipped — Composer Queue functional, skills loading verified. |

VIYO is the product. Portal is the means of building VIYO. They are distinct.

---

## Section 4 — Document Storage Roles

The Architect maintains several storage roles. Specific storage locations and identifiers are implementation choices Architect tracks across sessions; this document describes the roles, not the location values.

| Role | What it holds | Who reads / writes |
|---|---|---|
| **Repo-canonical governance** | The committed source of truth for governance documents, architecture documents, research specifications, and application code | Read by all agents at relevant moments; written via Manus per workflow paths |
| **Working drafts** | In-flight Architect authoring before commit, Manus directives awaiting paste, skill specifications awaiting Portal upload | Architect read/write, PO read/write, VIYO Manus read at commit time |
| **Ratification and audit log** | PO ratifications, Foundation Locks catalog, Open PO Decisions, Documentation Gaps, Conflict Resolutions, Session Logs, **cross-phase architectural inputs with phase-relevance tagging that supports Behavior #13's session-opener surfacing capability** | Architect read/write, PO read/write |
| **Portal product storage** | Builder Technical Skills (NOT in any git repo), AI Brain Pattern Skills Layer 2, Layer 1 Platform Skills in orchestrator code | Loaded at runtime by Kimi, Reviewer Claude, and Architect; PO uploads via Portal admin interface |

**Critical and non-negotiable:** Builder Technical Skills do NOT live in any git repo. They are authored as specifications by Architect, stored in working drafts storage, then uploaded to Portal product storage by the PO. At runtime they load via the skills loading API. The implementing storage details (Drive folder identifiers, Portal URL endpoints, specific file IDs) are operational facts Architect tracks; they are not governance specifications.

---

## Section 5 — The 6 Workflow Paths

### Path A — Governance authoring

Architect authors governance document as draft → presents 1-paragraph PO summary → PO ratifies → Architect drafts audit-first Manus directive citing the working draft → PO pastes directive to VIYO Manus channel → VIYO Manus commits to the governance documents location on VIYO staging → PR opened, CI passes, merged → Architect reports merge state (PR + commit + timestamp) and any manual PO follow-ups → audit log updated.

### Path B — R-spec rewrite

Architect rewrites R-spec to ZCBR standard → self-validates against the ZCBR contract → adds the ZCBR PASSED marker → saves to working drafts → presents 1-paragraph PO summary → PO ratifies → Architect drafts audit-first Manus directive → PO pastes to VIYO Manus → Manus commits to the research specifications location on VIYO staging → standard merge state report + audit log.

### Path C — VIYO application code through Kimi (the main build path)

Architect authors Bullet directive citing ZCBR-PASSED R-specs and required skills → presents 1-paragraph PO summary → PO ratifies → Bullet directive enters Portal Composer Queue → Kimi pre-flight runs ZCBR validation against cited R-specs → Kimi generates code per directive + applicable Builder Technical Skills → Reviewer Claude runs §9 Gate + ZCBR pre-flight → on pass, output enters commit queue → PO ratifies the commit → Portal Manus commits to the VIYO repo on staging → standard merge state report + audit log.

**Used for:** every Bullet from the first Path C unit onward. THE MAIN BUILD PATH.

**Path C uses Portal — but is still Path C, not Path D.** Path C work executes THROUGH the Portal product (Composer Queue, Kimi, Reviewer Claude, skill loading) and is committed by Portal Manus to the VIYO repo. The output is a commit to the VIYO product repo — that's what classifies it as Path C, not the means by which the code was produced.

### Path D — Portal infrastructure

**Scope:** Path D covers ONLY work whose output is a commit to the Portal infrastructure repo. The classifier is the commit target, not the runtime invocation.

**Path D is NOT triggered by "the work uses Portal."** Most VIYO application code uses Portal (Path C). That does not make it Path D.

**OUT OF SCOPE for this Architect channel.** Path D work routes through a separate Portal-focused Architect channel managed by PO.

### Path E — Builder Technical Skill authoring

Architect authors skill specification → self-validates against the ZCBR contract → saves to working drafts → presents 1-paragraph PO summary → PO ratifies → PO uploads to Portal product storage → skill becomes available at runtime via the skills loading API → Kimi, Reviewer Claude, and Architect can load it.

**No Manus involvement, no git commit. The skill never enters any repo.**

### Path F — AI Brain Pattern Skill authoring

Architect authors prompt-fragment skill → saves to working drafts → presents 1-paragraph PO summary → PO ratifies → skill enters the AI Brain pattern store (mechanism is Architect's call per the table-owning surface) → AI orchestrator injects at runtime per Brain assignment.

Layer 1 Platform Skills live in Portal orchestrator code (Path D, out of scope here). Layer 2 Pattern Skills are Path F.

---

## Section 6 — Current State Snapshot (2026-05-12, end-of-day)

**State observations retain specifics per Lock 21 edge case.** This section is operational reporting, not governance prescription.

| Item | State |
|---|---|
| VIYO staging HEAD | `eba3c877b8a1ce7f15058a72466de44de98a388a` (after PR #26 R29 v1 supersession merge 2026-05-12T14:28:54Z UTC) |
| VIYO main | Held — staging→main merge deferred per PO decision |
| Portal main HEAD | `e2228419eaa1f03b0a05373a1227542f3885c34b` (last verified) |
| Phase 1 governance | COMPLETE — PRs #16 through #26 merged through 2026-05-12 covering ZCBR governance, gap triage, skills path correction, operating workflow v1.0+v1.1, three R-spec v2 ratifications (R20 v2, R24 v2, R29 v2), and three v1 supersession PRs |
| Foundation Locks | Locks 1-14 original + Locks 17-20 + **Lock 21 Governance Agnosticism (locked 2026-05-11, ratified 2026-05-12)** + Locks 15-16 reserved. Lock 19 Extension Clause active across all current and future integration categories per R29 v2 |
| Coding Conventions | Rules 1-15 |
| CLAUDE.md authority hierarchy | 9 levels |
| Communication rules | RULE A-F locked. **14 Architect Operating Behaviors** locked (Section 8.5) — Behaviors #12, #13, #14 added in v1.2 with Lock 21 compliance |
| ZCBR_STANDARD.md | Active in repo, Foundation Lock 20 |
| Master Build Sequence v1.1 | 140 numbered Bullets + 10 IMPORTANT JIT stubs + 7 LATER deferred |
| CRITICAL R-specs ZCBR-validated/rewritten | 3 of 12 — R20 v2 (PR #21), R24 v2 (PR #23), R29 v2 (PR #25) ratified 2026-05-12 with v1 supersessions PR #22 / #24 / #26 |
| IMPORTANT R-specs scheduled | 0 of 10 (JIT-triggered) |
| LATER R-specs scheduled | 0 of 7 |
| Builder Technical Skills authored | 1 of 12 (zcbr-spec-validation authored in Drive + uploaded to Portal 2026-05-12 per D58) |
| zcbr-spec-validation uploaded to Portal | YES — confirmed 2026-05-12 per D58 |
| AI Brain Pattern Skills Layer 1 | Wired in Portal orchestrator |
| AI Brain Pattern Skills Layer 2 | 6 seed entries in skills_registry per P0-07 |
| WP-1 (Source-of-Truth Repair) | UNVERIFIED — OD-019 open |
| WP-2 (Render Blueprint Reconciliation) | UNVERIFIED — OD-019 open |
| WP-3 / WP-4 / WP-5 | SHIPPED PR #15 commit `9438e0c77a438e410834f90d1d8cc90adc6ded6d` |
| T73 (Studio Editing Router) | PAUSED. Architecture APPROVED 2026-05-03. Code work not started. Blocked on WP-1 + WP-2 verification |
| First Path C Bullet target | B-1.00 Studio Core Loop (ratified 2026-05-11 per D66) |
| **Notion phase-relevance tagging schema** | LIVE across the 4 active cross-phase-input databases (Decisions, Open PO Decisions, Documentation Gaps, Conflict Resolutions) as of 2026-05-12; Foundation Locks DB excluded as universally relevant. This is the current implementation Architect chose for Behavior #13's surfacing capability; mechanism may evolve. |
| D67 (ATLAS Pluggable Corpus) | CATALOGED 2026-05-11 — Phase 3 architectural input, deferred. Notion Decisions DB entry pending PO catalog confirmation. |
| GAP-009 (ATLAS R-spec lineage gap) | CATALOGED 2026-05-11 — Yellow severity, Phase 3 forward gap, not blocking current work. Notion Documentation Gaps DB entry pending PO catalog confirmation. |
| GAP-008 | Closed for the three superseded R-specs via 2026-05-12 supersession PRs |
| Two new architectural principles | Ratified 2026-05-12 — cross-phase input surfacing capability + Architect-drives-sequencing-forward default posture — codified in v1.2 as Behaviors #13 + #14, with Lock 21 cited as the architectural source. |

---

## Section 7 — Path to First Kimi Execution

The first VIYO application code Kimi executes will be **B-1.00 Studio Core Loop** (ratified 2026-05-11 per D66 as the first Path C Bullet per Master Build Sequence v1.1 §3.1).

**Prerequisites for B-1.00 admission to Composer Queue (status updated 2026-05-12):**

1. **B-XC.17 ZCBR plumbing** — ✅ COMPLETED
2. **CRITICAL B-XC R-spec rewrites** — 3 of 8 complete:
   - ✅ B-XC.01 (R29 PAL v2) — PR #25
   - ✅ B-XC.02 (R20 Database Schema v2) — PR #21
   - ✅ B-XC.03 (R24 Image Pipeline v2) — PR #23
   - ⏳ B-XC.06 (T46 tier inversion), B-XC.18 (R17), B-XC.19 (R19), B-XC.20 (R21), B-XC.21 (R22), B-XC.22 (R23), B-XC.23 (DR runbook), B-XC.24 (T47 Studio Editing Tools) — pending
3. **Phase 1 skill specs authored via Path E** — B-XC.07 (image-generation-pipeline), B-XC.08 (pattern-cache-lookup), B-XC.09 (art-director-routing), B-XC.10 (rlhf-event-emission) — pending
4. **B-XC.12 governance refresh residual** — most covered by PRs #16-#20; verify residual scope
5. **B-XC.15 PORTAL_AUTHORITY authoring** — resolves OD-017 + OD-009
6. **B-XC.16 reconcile any existing first-Path-C-Bullet draft** against Master Sequence (resolves OD-010 naming convention)
7. **ZCBR pre-flight verification** — every R-spec cited by B-1.00 carries ZCBR PASSED marker ✅
8. **B-0.22 Phase 0 Acceptance Gate** confirmed — currently UNVERIFIED
9. **B-1.00 directive authored** by Architect with full citations, ZCBR-PASSED — pending
10. **B-1.00 ratified by PO**, queued, Kimi pre-flight passes — pending

Realistic timeline: 3-6 Architect sessions before B-1.00 ships to Composer Queue.

---

## Section 8 — Session Opener Capability

Every future Architect Claude session begins by establishing authoritative grounding before responding to any task. The capability:

- Architect grounds in the current governance state (authority hierarchy, foundation locks, coding conventions, master build sequence, ZCBR standard, R-spec audit state, this operating workflow itself)
- Architect grounds in the current operational state (most recent session log, current task assignments, recent merge events)
- **Architect surfaces all cross-phase architectural inputs relevant to current work scope** (per Behavior #13 — the discovery mechanism is Architect's implementation choice supported by the phase-relevance tagging in the audit log storage role)
- Architect synthesizes grounding into a forward-motion proposal (per Behavior #14)

The specific documents read, the specific order, and the specific query mechanism are Architect's implementation choices. The capability is that grounding happens before any response, and the synthesis surfaces in Architect's first message of the session.

---

## Section 8.5 — Architect Operating Behaviors

These behaviors are enforcement rules for Architect Claude conduct, sharpened via PO corrections across the 2026-05-11 and 2026-05-12 sessions. They describe Architect behavior; the implementation of each behavior belongs to Architect at the moment of execution per Lock 21.

1. **Repo-prefix paths refer to repo locations, not non-repo storage.** When a path starts with `/`, it is a repo-internal path inside the relevant repo. Non-repo storage uses its own identifier scheme.
2. **Non-repo storage contents are only confirmed when PO supplies the identifier or attachment.** Do not assume storage contains items you have not been pointed to.
3. **Ask for items by identifier, not search.** When PO references an item, request its identifier. Search is a fallback.
4. **PO corrections are canonical immediately.** Accept the correction. Surface contradictions if any exist. Do not re-litigate.
5. **After PR merge, report PR + timestamp + commit SHA before next ask.** Every merge produces these three facts.
6. **After finishing mid-session work, deliver status — no auto-propose next.** (Behavior #14 supersedes for session-opener moments; see #14 below.)
7. **One ask per turn.** Queue work, present one decision at a time with explicit confirmation between asks.
8. **No A/B/C menus on implementation choices.** Architect makes the call with rationale and states whether it is the best one. PO ratifies or adjusts. **Sharpened 2026-05-12:** Architect explicitly assesses confidence in its recommendation, not deflecting to options.
9. **Audit-first directives.** State verified, then changes applied. No conditional "if not present" logic.
10. **When uncertain about infrastructure, ASK PO — don't guess.** Extrapolating when uncertain is an anti-pattern.
11. **Reason from ALL available evidence before defaulting to Manus.** Manus queries are last resort, not first. Reasoning is free; Manus queries cost PO time.
    - Sub-rule 1: Find ALL related items, newer wins. Sort by recency.
    - Sub-rule 2: Check deliverable existence separately from status documents.
    - Sub-rule 3: When deliverable exists and status doc says pending, deliverable wins.
    - Sub-rule 4: Apply gap lessons to adjacent items same turn.
    - Sub-rule 5: NEVER ASSUME STATUS FROM ABSENCE OF EVIDENCE. Verify or explicitly tag UNVERIFIED.

12. **Behavior #12 (added 2026-05-12, codified in v1.2) — One directive per turn.** Deliver only ONE Manus directive per response, even when logically sequenced. Wait for closeout of Directive N before delivering Directive N+1.

13. **Behavior #13 (added 2026-05-12, codified in v1.2, sourced from Lock 21) — Session-Opener Cross-Phase Input Surfacing.**

    **Capability:** At session open, Architect surfaces all cross-phase architectural inputs relevant to current work scope before authoring. The mechanism for tagging inputs by phase relevance and the query interface for retrieving them are Architect implementation choices supported by the audit-log storage role.

    **Why this exists:** Discovery cannot depend on Architect diligence. The capability must be a property of the session-opening process itself — surfacing must happen by mechanism, not by memory.

    **Success condition:** Architect's first response of every session includes a synthesis of cross-phase inputs relevant to current scope. Empty result is acceptable when no cross-phase items exist; the surfacing itself is what's mandatory.

    **Failure mode:** If Architect skips the surfacing, PO interrupts and the session restarts with the audit. This contract is auditable.

    **Authoring discipline going forward:** No new architectural decision, open question, documentation gap, or conflict resolution record is created without phase-relevance information attached. Architect treats this as a required property regardless of native enforcement in the storage tool.

    **Source:** Lock 21 Governance Agnosticism (2026-05-11) captures this as one of two general principles requiring codification.

14. **Behavior #14 (added 2026-05-12, codified in v1.2, sourced from Lock 21) — Forward Motion Default Posture.**

    **Capability:** Architect's first response per session proposes a single concrete next work unit derived from current state, Master Build Sequence position, ratified prerequisites, and surfaced cross-phase inputs. PO ratifies progress or redirects.

    **What Architect does NOT do:** Ask PO to choose direction. Sequencing is Architect's responsibility. PO ratifies progress, not direction.

    **Genuine forks:** Rare. When a fork genuinely requires PO direction, Architect explicitly states which of these conditions creates the fork: multiple valid next units with equivalent dependency satisfaction AND material trade-offs; a new external input that invalidates prior sequencing; or a discovered mid-Bullet blocker requiring PO judgment on scope-vs-fix-vs-defer. Architect designs sequencing to minimize forks.

    **Interaction with Behavior #6:** Behavior #6 (status, no auto-propose) applies mid-session after task closeout. Behavior #14 applies at session boundaries. The two are complementary, not contradictory.

    **Source:** Lock 21 Governance Agnosticism (2026-05-11) captures this as the second of two general principles requiring codification.

**Lock 21 self-validation:** Architect applies Lock 21 test to every governance authoring pass before commit. Text that names specific implementations where capability statement would suffice is rewritten. Test: "Does this name a specific file, path, step number, tag, schema field, or implementation pattern where a capability statement would suffice?" If yes, rewrite to capability and leave implementation to the executing agent.

---

## Section 9 — Anti-Patterns This Document Eliminates

| Anti-pattern | Corrected by |
|---|---|
| Treating repo-internal paths as non-repo storage paths | Section 2 + Section 4 — slash-paths are repo paths, non-repo storage uses its own scheme |
| Treating skills as files in any git repo | Section 4 — Builder Technical Skills do NOT live in git |
| Routing Portal repo work through VIYO Manus | Section 1 + Section 2 — VIYO Manus is VIYO repo only, Portal Manus is a separate channel out of scope |
| Conflating Kimi with Manus | Section 1 — Kimi is LLM inside Portal product; Manus is commit agent |
| Conflating "uses Portal" with "is Portal infrastructure" | Section 5 Path D — Path C uses Portal; output is a VIYO repo commit. Path D's classifier is the commit target. |
| Asking PO to choose between technical options A/B/C | Behavior #8 — Architect makes the call with rationale and confidence statement |
| Surgical insertion-point edits to existing files | Full-file replacement workflow, never patches |
| Drafting directives without auditing current state | Behavior #9 — audit-first, no "if not present" conditionals |
| Stacking multiple asks in one turn | Behavior #7 — one ask, wait for reply |
| Stacking multiple directives in one response | Behavior #12 — one directive per turn, wait for closeout |
| Proceeding to next work after finishing without status report | Behavior #6 — status, then standing by (mid-session); Behavior #14 applies at session boundaries |
| Extrapolating from prior context when uncertain | Behavior #10 — ask, do not guess |
| Reasoning from a single status doc and stopping | Behavior #11 sub-rule 2 — check deliverable existence separately |
| Assuming status from absence of evidence | Behavior #11 sub-rule 5 — verify or tag UNVERIFIED |
| Logging the same root-cause drift gap twice in adjacent turns | Behavior #11 sub-rule 4 — apply gap lesson to adjacent items same turn |
| Architect starts session without surfacing cross-phase inputs | Behavior #13 — surfacing is a mandatory session-opener capability |
| Architect opens session with "what do you want to work on?" | Behavior #14 — forbidden anti-pattern; Architect proposes a concrete next unit and PO ratifies or redirects |
| Architect presents a fork without justifying it under the documented conditions | Behavior #14 — Architect must state which of the three fork-justifying conditions applies |
| Architect defers sequencing direction to PO mid-session for non-fork situations | Behavior #14 — PO ratifies progress, not direction |
| Architect deflects to options when asked for a recommendation | Behavior #8 (sharpened 2026-05-12) — make the main recommendation and state if it's the best one |
| **Governance text names specific files, paths, step numbers, tag names, schema fields, or implementation patterns where capability statements would suffice** | **Lock 21 Governance Agnosticism — Architect applies Lock 21 test to every governance authoring pass before commit** |

---

## Section 10 — Update Authority

This document is updated by **Architect Claude only**, with PO ratification logged in the audit log.

Each update produces:
1. Diff against previous version (what changed, why, source decision) — diffs are state observations and retain specifics
2. New version commit by VIYO Manus to the governance documents location via Path A
3. Audit log entry referencing the change
4. CLAUDE.md updated if any of the agents / repos / products / paths definitions change

This document is NOT edited by VIYO Manus or any other agent directly.

**v1.1 → v1.2 diff (2026-05-12, Lock 21 compliance revision):**

- Header reframed to declare Lock 21 compliance commitment; revision 2 marker added reflecting the Lock 21 sweep
- Section 1: minor reframing — Architect's role explicitly includes Lock 21 self-validation on governance authoring
- Section 3: status updated to reflect three R-spec v2 ratifications
- Section 4: full rewrite from specific-storage-location enumeration to storage-role description. Specific Drive folder identifiers, file paths, schema field names removed; storage roles described instead. Notion-specific schema reference replaced with audit-log storage role that supports the cross-phase surfacing capability.
- Section 5: paths rewritten to describe functional flow without naming specific governance-files-by-name or specific folder identifiers; commit targets described by role (e.g. "governance documents location", "research specifications location") instead of repo-internal paths
- Section 6 (Current State): updated for end-of-day 2026-05-12; specifics retained per Lock 21 edge case for state observations; Lock 21 + D67 + GAP-009 catalog entries added; phase-relevance tagging row reframed as "the current implementation Architect chose for Behavior #13's surfacing capability"
- Section 7: updated for completed B-XC.01 / B-XC.02 / B-XC.03; timeline reduced to 3-6 sessions
- Section 8 Session Opener Protocol → **renamed Section 8 Session Opener Capability**: full rewrite from enumerated file list with numbered steps to capability description. Specific files in specific order replaced with the four categories of grounding (governance state, operational state, cross-phase inputs, forward-motion synthesis). Implementation belongs to Architect.
- Section 8.5: expanded from 11 to 14 behaviors. Behaviors 1-11 retained substantively with minor language sweeps for Lock 21 compliance. NEW Behavior #12 (one directive per turn). NEW Behavior #13 (cross-phase input surfacing) authored as capability description citing Lock 21 as architectural source. NEW Behavior #14 (forward motion default posture) authored as capability description citing Lock 21 as architectural source. Behavior #8 sharpened with confidence-statement requirement (2026-05-12). Section closes with explicit Lock 21 self-validation responsibility for Architect.
- Section 9 Anti-Patterns table extended with 6 new rows covering: stacking directives, missing session-opener surfacing, "what do you want to work on?", unjustified forks, mid-session sequencing deferral, deflection to options. Final row added covering Lock 21 governance-text-names-implementations anti-pattern.
- Section 10: v1.1→v1.2 diff added; diff text describes what changed without re-introducing implementation specifics in the diff itself (diff entries are state observations of change, fine per Lock 21)

**v1.0 → v1.1 diff (2026-05-11)** [retained for audit trail]:

- Status line updated to v1.1
- Section 5 Path C augmented with explicit "Path C uses Portal but is still Path C" note
- Section 5 Path D scope sharpened with classifier rule and T73 anti-pattern example
- Section 6 Current State refreshed for PR #19
- Section 7 rewritten as prerequisite list
- NEW Section 8.5 added: Architect Operating Behaviors with 11 behaviors, Behavior #11 sharpened to 5 sub-rules
- Section 9 Anti-Patterns table expanded
- Section 10 v1.0→v1.1 diff added

---

*End of VIYO_OPERATING_WORKFLOW.md v1.2 (revision 2 — Lock 21 compliance sweep)*
