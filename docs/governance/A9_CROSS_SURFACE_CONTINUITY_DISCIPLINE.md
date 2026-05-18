# A9 — Cross-Surface Continuity Discipline

**Status:** RATIFIED v1.0 (PO Direct 2026-05-18 — Path 1 author-execute of 5 updates + 5 ratifications against Manus DRAFT 2026-05-15; isolated Adversary cold-read deferred per Path 1 ratification — substrate changes are mechanical execution of ratified scope; future revisions require isolated Adversary per §9 Addition 5).

**Author lineage:**
- DRAFT — Manus 2026-05-15 (Dispatch #3, 39 KB, Drive ID `1ZN1IRXpvTdo34l4rqgm52ImC4efu0v0S`)
- v1.0 RATIFIED — Architect Claude 2026-05-18 (Adversary cold-read + revisions per PO Path 1 ratification)

**Date ratified:** 2026-05-18
**Repo HEAD at ratification:** `19074db` (Path X bookkeeping landed); A9 commit will become new HEAD post-ratification.
**Cross-references:**
- `SESSION_LEDGER_2026-05-15.md` (Drive ID `1rWVLk7zGEcs_SoB1Pj2_82hYp8k0HuwZ`)
- `VIYO_Canonical_State_Audit_2026-05-15.md` (Drive ID `1ogFA3ySF-IJDSlVDvKzzsvCDeiZv34Vo`)
- `docs/governance/ARCHITECT_OPERATING_RULES.md` §3 (Rules 3.1-3.10)
- `docs/governance/NIR_OPERATING_RULES.md` (9 universal rules)
- `docs/governance/ANTI_PATTERN_CATALOG.md` (7 families + §3.5 variants — updated by §5 below)
- `docs/governance/CLAUDE.md` (auto-load + role definitions)
- `docs/governance/review/ADVERSARY_CHARTER.md`
- `docs/governance/review/ARBITER_CHARTER.md`
- `scripts/git-hooks/` (commit-msg + pre-push + post-commit operationalize Rules C/D/E per commit `9a98f23`)

**Next-session flow (revised):** PO-side Claude reads SESSION_STATE → SESSION_LEDGER → in-flight file. CCD Curator commits substrate updates per Rule 3.12 verbatim paste-discipline. Cataloger writes Notion canonical state post-PO ratification (transitional period EXITED 2026-05-18 per §10). Future substrate revisions to A9 require isolated Adversary cold-read per §9 Addition 5.

---

## §1 — Purpose + Scope

### What A9 Governs

A9 governs **cross-surface continuity** — the discipline of maintaining coherent, verified, non-contradictory state across all canonical surfaces when multiple agents (PO, PO-side Claude, Curator, Arbiter, Adversary, Manus, Cataloger) operate on the same substrate.

**Canonical surfaces governed:**
1. **Repo** (GitHub VIYO-NEW/VIYO, staging branch) — governance docs, R-specs, implementation code
2. **Notion** (Decisions DB, Open PO Decisions DB, Conflict Resolutions DB, Documentation Gaps DB, Standing Rules page)
3. **Airtable** (Q&A Master Log — 202 records)
4. **Google Drive** (`/working/` folder — SESSION_LEDGERs, audit docs, draft deliverables)
5. **PO-side Claude conversation** (ephemeral but authoritative during session)
6. **Manus sandbox** (ephemeral execution environment)
7. **WSL2 cage** (per Dispatch 3 outcome 2026-05-18 — isolated validation environment for third-party tooling)
8. **Native git-hooks** (per commit `9a98f23` 2026-05-18 — external Rule E + Rule C enforcement at commit/push boundary)

**Agents governed:**
- **PO** (Nir) — ratification authority, final arbiter of product decisions
- **PO-side Claude** (Opus 4.7) — PO's primary agent; proposes, analyzes, surfaces
- **Curator** — single-writer to repo; commits only after PO ratification
- **Arbiter** — rules on Adversary findings; tie-breaker for Lock 21 edge cases
- **Adversary** — cold-read reviewer; MUST run in isolated mode per §9 Addition 5
- **Manus** — execution agent; fetches, commits, audits, authors on dispatch
- **Cataloger** — writes Notion canonical state post-PO ratification (transitional period EXITED 2026-05-18 per §10)

### What A9 Supersedes

**Nothing.** A9 is additive to existing governance. It does not supersede:
- ARCHITECT_OPERATING_RULES.md (AOR) — A9 extends AOR §3 with new rules
- NIR_OPERATING_RULES.md — A9 cross-references NIR universal rules
- ANTI_PATTERN_CATALOG.md — A9 §5 adds new variants with 5-prefix nomenclature
- CLAUDE.md — A9 becomes a new auto-load entry in CLAUDE.md §2

### Where A9 Sits in Authority Hierarchy

Per D85 (Lock 22):

```
1. PRD V8.1 (long-horizon vision authority)
2. MBS v1.1 post-Commit 2 (MVP execution authority)
3. Notion Decision Log (canonical decision substrate)
4. Foundation Locks (FOUNDATION_LOCK.md — substrate locks per ZCBR)
5. Build Tracker (task arrangement only — lowest authority)
```

A9 operates at **Foundation Lock tier** — it is a governance discipline document that constrains agent behavior. Once ratified, it carries the same authority weight as FOUNDATION_LOCK.md entries. Violations of A9 rules are governance violations equivalent to Lock violations.

---

## §2 — Rules A-E Formalization

### Rule A — Foundational Fix, No Patch

**Verbatim Statement:**
> When conflicts arise across documents, decisions are made at the foundational source (PRD V8.1 + Notion Decisions + Foundation Locks). Downstream specs inherit. Patches that don't trace to a source decision are rejected.

**Rationale:** Discovered through repeated instances of agents applying "quick fixes" to downstream documents without tracing the conflict to its foundational source. Each patch creates a new potential inconsistency surface. The only durable fix is at the source; everything else inherits.

**Source Session:** Pre-existing (Decision 30, May 10 2026); reaffirmed 2026-05-15; canonical scope clarified 2026-05-18 with hooks substrate operationalization.

**Cross-References:**
- Standing Rule 4 (verbatim equivalent)
- Foundation Lock 17
- Decision 30
- NIR Rule 6 (Principle over prescription)

**External Enforcement Mechanism:**
- Arbiter rejects any PR or commit that modifies a downstream document without citing the foundational source decision that authorizes the change.
- Curator refuses to commit patches that don't trace to a source decision.
- Adversary flags any deliverable section that appears to be a patch rather than a source-traced fix.
- **Native git-hooks** (`scripts/git-hooks/commit-msg` per commit `9a98f23` 2026-05-18) enforce ratification citation in governance commit message bodies — commits to `docs/governance/` without "Ratified by PO" or equivalent ratification reference are blocked at commit boundary.

---

### Rule B — PO-Side Bullets + Plan

**Verbatim Statement:**
> PO provides structured bullets describing intent and constraints. Agent builds a complete plan from those bullets. Agent does NOT ask PO to build the plan. Agent does NOT execute without a plan. The plan is surfaced to PO for ratification before execution begins.

**Rationale:** Extension of NIR Rule 1 (Lead with a 1-paragraph summary) to the PO↔Agent interaction pattern. Prevents two failure modes: (1) agent executing without a plan (chaotic, unverifiable), (2) agent asking PO to do the planning work (role inversion — PO provides intent, agent provides structure).

**Source Session:** 2026-05-15 (NIR R1 extension).

**Cross-References:**
- NIR Rule 1 (Lead with a 1-paragraph summary)
- NIR Rule 2 (Make the call, don't menu)
- AOR Rule 3.5 (Bring recommendations, not permission requests)

**External Enforcement Mechanism:**
- PO rejects execution requests that arrive without a plan.
- Adversary flags deliverables that show no evidence of plan-then-execute discipline.
- SESSION_STATE.md "Pending queue" section serves as the visible plan artifact.

---

### Rule C — PO-Side Grep-Verify After Every Commit

**Verbatim Statement:**
> After every commit to the repo, the committing agent (Curator or Manus) MUST grep-verify all files touched by the commit for stale strings, broken cross-references, and superseded citations. The grep-verify results are surfaced to PO before the session closes. Failures found during grep-verify are fixed in the same session — they do NOT carry forward as "next session" items.

**Rationale:** Commits that introduce stale citations or broken cross-references create compounding debt. Each session that passes without catching them makes the stale citation harder to trace. Grep-verify at commit time is the cheapest possible intervention point.

**Source Session:** 2026-05-15 (NEW); operationalized via hooks 2026-05-18.

**Cross-References:**
- AOR Rule 3.7 (Push on every commit)
- Anti-Pattern Family 1 (stale-citation-propagation)
- Rule D (strengthened stale-string sweep mandate)

**External Enforcement Mechanism:**
- Curator includes grep-verify output in commit message or PR body.
- Manus includes grep-verify results in Phase 2 reports.
- Arbiter checks for grep-verify evidence in any reviewed deliverable that involved commits.
- SESSION_STATE.md must not contain "grep-verify pending" items at session close.
- **Native pre-push hook** (`scripts/git-hooks/pre-push` per commit `9a98f23`) enforces drift-pattern sweep at push boundary — blocks pushes containing `FOUNDATION_LOCKS_v2`, `NIR_OPERATING_RULES_v2`, `ARBITRATION_FOUNDATION_LOCK_v2` outside allowlisted files. Reduces variant 5f propagation structurally.

---

### Rule D — Arbiter/Adversary/Manus Strengthened Stale-String Sweep Mandate

**Verbatim Statement:**
> When any agent (Arbiter, Adversary, or Manus) identifies a stale string in any file, the agent MUST:
> 1. Grep the ENTIRE file for all occurrences of the same string (not just the flagged line).
> 2. Grep all files touched in the same commit/PR for the same string.
> 3. Grep adjacent files (same directory, same spec family) for the same string.
> 4. Report ALL occurrences found — not just the first one.
> 5. If occurrences propagate beyond a single file, recommend PAUSE and surface to PO before proceeding with fixes.

**Rationale:** Discovered through the "Arbiter adjacent-string blindness" anti-pattern (X2.18 caught "12-17" but missed X2.20 adjacent line with same string). Partial fixes create false confidence — the audit appears complete but leaves identical stale strings in immediately adjacent locations.

**Source Session:** 2026-05-15 (NEW — strengthened from implicit expectation to explicit mandate); pre-push hook operationalizes file-level sweep 2026-05-18.

**Cross-References:**
- Anti-Pattern §3.5 variant 5b (Arbiter adjacent-string blindness)
- Rule C (grep-verify after every commit)
- AOR Rule 3.2 (Read before cite)

**External Enforcement Mechanism:**
- Arbiter spawn-prompt includes explicit stale-string sweep mandate (see §8).
- Adversary cold-read includes sweep check as standard procedure.
- Manus Phase 2 reports include grep-verify results for all committed files.
- PAUSE recommendation is a hard gate — execution stops until PO acknowledges.
- **Native pre-push hook** sweeps all changed files in the push range against drift patterns; blocks push if any file outside allowlist contains a drift pattern. This is the structural enforcement of the file-level component of the sweep mandate.

---

### Rule E — Nothing Cited from Memory (Universal Precondition)

**Verbatim Statement:**
> No agent (PO-side Claude, Curator, Arbiter, Adversary, Manus, Cataloger, or any future agent) may cite any prior decision, specification, architectural fact, lock, or governance item from memory alone. Every factual claim about VIYO's canonical state must be verified against the canonical source (Notion Decision Log, repo files, Airtable Q&A, Standing Rules page) before inclusion in any output.
>
> This rule is a universal precondition — it applies before any other rule is evaluated. An agent that cannot verify a claim must explicitly state "UNVERIFIED — requires source check" rather than presenting the claim as fact.
>
> Scope: All agents, all outputs, all sessions. No exceptions.

**Rationale:** Discovered through multiple instances of agents citing decisions, specs, and architectural facts from parametric memory (training data or conversation history) rather than from verified canonical sources. Memory is lossy, training data may be stale, conversation history may contain superseded information. The agent's confidence in its memory creates authoritative-sounding but potentially wrong citations.

**Source Session:** 2026-05-15 (NEW — universal precondition); commit-boundary closure operationalized via hooks 2026-05-18.

**Two-Layer Reality (added 2026-05-18 from session evidence):**
Rule E violations manifest at two distinct boundaries:
1. **Commit-boundary 5g** — agent commits text citing a SHA, file path, or fact without grep-verify. CLOSED by `scripts/git-hooks/commit-msg` per commit `9a98f23` — SHA citations in commit messages are verified against `git cat-file -e`; file paths with separators are verified against working tree.
2. **Conversational-layer 5g** — agent cites in chat without commit boundary involvement (e.g., proposing scope, recommending action, referencing prior decisions). NOT CLOSED by hooks. Manifested 5+ times in session 2026-05-18 alone by Architect Claude. Closure mechanism: isolated Adversary cold-read on substantive substrate before ratification (see §9 Addition 5).

**Cross-References:**
- Anti-Pattern §3.5 variant 5c (memory-citation — universal)
- Anti-Pattern §3.5 variant 5d (capability-citation without verify)
- Anti-Pattern §3.5 variant 5g (memory-citation of fix-target without grep-verify — TWO-LAYER, added 2026-05-18)
- Anti-Pattern §3.5 variant 5h (memory-citation of mechanisms without empirical test — added 2026-05-18)
- AOR Rule 3.2 (Read before cite) — Rule E is the universal generalization
- NIR Rule 4 (Read before write/cite) — Rule E extends to ALL outputs, not just writes

**External Enforcement Mechanism:**
- Every agent's system prompt includes Rule E as a precondition block.
- Adversary cold-read specifically checks for unverified citations (any claim without a source path is flagged).
- Arbiter treats unverified citations as VALID findings (must fix).
- "UNVERIFIED" tag is the only acceptable alternative to a source-verified citation.
- Rule E violations are treated as governance violations equivalent to Lock violations.
- **Native commit-msg hook** (`scripts/git-hooks/commit-msg` per commit `9a98f23`) enforces commit-boundary Rule E externally — SHA citations + file path citations in commit message bodies are verified against repo state; non-resolvable citations block the commit.
- **Isolated Adversary cold-read** (per §9 Addition 5) is the conversational-layer Rule E enforcement mechanism for substantive substrate revisions.

**Evolution history:**
```
"nothing cited from memory for prior directives" (narrow)
    → Rule 3.9 (AOR-scoped, Architect-only)
    → Rule E (universal precondition, all agents, all outputs)
    → Two-layer enforcement (commit-boundary hooks + conversational isolated Adversary)
```

---

## §3 — Rule 3.10 + Rule 3.12 Formalization

### Rule 3.10 — SESSION_STATE Repo Canonical

**Verbatim (from AOR §3, committed at HEAD `036ea55`):**

> **Rule 3.10 — SESSION_STATE Repo Canonical**
>
> SESSION_STATE.md lives in `docs/governance/SESSION_STATE.md` and is committed to the repo at every session close. It is NOT a local-only artifact. It is NOT optional. It is the structured handoff mechanism that eliminates orientation overhead at session start.
>
> Contents: Phase A status, pending queue (sequenced), recovery protocol, active tensions.
> Target size: ~2.5 KB (operational state pointer, not reasoning context).
> Update discipline: Curator commits at session close; no other agent writes to it.
> Read order: CLAUDE.md auto-load → SESSION_STATE → SESSION_LEDGER → in-flight file.

**Cross-references:**
- CLAUDE.md §6 First Action (auto-load includes SESSION_STATE)
- SESSION_LEDGER γ-split (see §6 below)
- AOR Rule 3.9 (state-diagnostic at session start)

---

### Rule 3.11 — Curator-Call Scope Question for PO

**Status:** REJECTED as standalone rule per PO ratification 2026-05-18.

**Reason for rejection:** AOR Rule 3.4 (No writes to canonical state without ratification surface) + AOR Rule 3.5 (Bring recommendations, not permission requests) together cover the substrate Rule 3.11 was proposed to govern. No documented Curator failures show 3.4/3.5 missed a scope-question event that a standalone 3.11 would have caught. Rule accumulation produces conflicts (per ANTI_PATTERN_CATALOG Section 5 #3 "rule accumulation produces conflicts"); the foundational alternative is to avoid adding redundant rules.

**If Rule 3.11 needs to be reintroduced** (future Curator failure pattern surfaces): the surface should be a new Decision with documented evidence of why 3.4 + 3.5 were insufficient, not a quiet re-add to AOR.

---

### Rule 3.12 — Edge Case 2: Cross-Relay Paste-Discipline

**Verbatim Statement:**
> When any agent relays content across a boundary (PO↔Curator, Curator↔Arbiter, Curator↔Adversary, PO↔Manus), the relay MUST be verbatim paste-back. No summarization, no paraphrasing, no "in my understanding" restatements. The receiving agent gets the exact text the sending agent produced.
>
> This extends the original paste-discipline (PO↔Curator only) to ALL agent boundaries.

**Rationale:** Discovered through information loss at the Curator↔Arbiter boundary. When Curator summarized Adversary findings before passing to Arbiter, nuance was lost. The Arbiter ruled on a summary rather than the original finding text, leading to incorrect INVALID rulings.

**Source Session:** 2026-05-15 (NEW — extends existing paste-discipline to all boundaries).

**Cross-references:**
- AOR Rule 3.8 (Paste in-flight drafts verbatim to PO-side before ratification)
- Anti-Pattern Family 1 (information loss through relay summarization is a variant)

**External Enforcement Mechanism:**
- Arbiter checks that REVIEW files received match Adversary output verbatim.
- PO spot-checks relay fidelity by comparing source and destination.
- Any agent receiving a relay may request "verbatim source" if the relay appears summarized.

---

## §4 — Lock 22: Authority Hierarchy Time-Horizon Split

### D85 Ratified Verbatim

**Decision ID:** D85
**Status:** Locked
**Category:** Process
**Phase:** Cross-Phase
**Source Authority:** PO Direct
**Date:** 2026-05-15
**Affected Specs:** PRD V8.1, MBS v1.1, Standing Rules, FOUNDATION_LOCK.md (Decision 47 retro-stamped per D85 supersession action 1)

---

### Authority Hierarchy (Refreshed per D85)

```
1. PRD V8.1        — Curator rebuild; canonical long-horizon product vision
                     (full VIYO maturity Phase 1+2+3+4+)
2. MBS v1.1        — Post-Commit 2 canonical ratify; MVP execution authority
                     (Phase 1 Image Studio scope: B-0.01 through B-XC.24 + LATER)
3. Notion Decision — This DB; canonical decision substrate; supersedes via
   Log               newer Decisions
4. Foundation      — FOUNDATION_LOCK.md; substrate locks per ZCBR governance
   Locks
5. Build Tracker   — Task arrangement only; lowest authority per Decision 47
                     (retro-stamped per D85 supersession action 1)
```

### Time-Horizon Framing

| Document | Describes | Horizon | Authority Scope |
|----------|-----------|---------|-----------------|
| PRD V8.1 | WHAT VIYO becomes at full maturity | Long-horizon | Vision; things CAN change as product evolves |
| MBS v1.1 post-Commit 2 | HOW Phase 1 MVP gets built | Immediate-horizon | Execution; locked at ratification for Phase 1 |

### Conflict Resolution Rules

| Conflict Type | Winner | Rationale |
|---------------|--------|-----------|
| PRD V8.1 vs MBS for **Phase 1 scope** | MBS wins | MVP execution authority |
| PRD V8.1 vs MBS for **Phase 2+ scope** | PRD V8.1 wins | Vision authority |
| Phase 1 scope-vs-vision conflicts | Requires new Decision | Neither can unilaterally override |

### Supersession Actions (from D85)

1. ~~Decision 47 Authority Hierarchy item 1: "PRD V8" → "PRD V8.1"~~ DONE per D85 ratification 2026-05-15.
2. Decision 47 Authority Hierarchy otherwise retained.
3. Standing Rules canonical Authority Hierarchy section updated to match (pending page-level update — Cataloger action item).
4. Folds into A9 authoring scope as Lock 22 (graduates from "candidate" to ratified at A9 ratification 2026-05-18).
5. Notion DB "Source Authority" enum: add "PRD V8.1" option, deprecate "PRD V8" option (schema update pending — Cataloger action item).

---

## §5 — Anti-Pattern Catalog Additions

### Existing Catalog Context

The ANTI_PATTERN_CATALOG.md documents 7 failure-mode families across 6 sections. Section §3.5 was added 2026-05-15 with 4 variants surfaced during that session (labeled `a/b/c/d` in current canonical). This A9 §5 formalizes the variants with **5-prefix nomenclature** (consistent with §3.5 section number) and adds new variants surfaced through 2026-05-18.

### Catalog Migration Action

The current ANTI_PATTERN_CATALOG.md §3.5 entries `a/b/c/d` are renamed to `5a/5b/5c/5d` in the canonical update. This is a terminology consistency fix — no semantic change to the variants themselves. The catalog update lands as part of A9 ratification commit.

---

### Variant 5a — Stale-Citation-Propagation Chain (3-Layer Family 1)

**Status:** Existing (renamed from catalog `a` to `5a`).

**Example:** D63 K1=COPY — a stale citation in Decision 63 propagated through 3 layers of derived documents before being caught.

**Root Cause:** Agent cites a decision from memory → citation propagates to spec → spec propagates to implementation doc → implementation doc propagates to PR description. By layer 3, the citation appears authoritative because it exists in multiple documents, but the original source has been superseded.

**Closure Mechanism:**
- Rule E (verify at source before citing) — prevents initial stale citation
- Rule D (stale-string sweep) — catches propagation before it reaches layer 3
- Rule C (grep-verify after every commit) — catches any that slip through
- **Native commit-msg hook** (commit `9a98f23`) — catches SHA-citation propagation at commit boundary

**Family Classification:** Family 1 variant (stale-citation-propagation is a multi-layer manifestation of the core Family 1 failure: silent writes to canonical state without verification).

---

### Variant 5b — Arbiter Adjacent-String Blindness

**Status:** Existing (renamed from catalog `b` to `5b`).

**Example:** X2.18 caught "12-17" string but missed X2.20 which had the same string on an adjacent line.

**Root Cause:** Adversarial/audit agent correctly identifies a stale string in one location but applies a "found it, done" heuristic rather than sweeping the full file and adjacent files for the same string.

**Closure Mechanism:**
- Rule D (strengthened stale-string sweep mandate) — requires full-file + adjacent-file grep
- Arbiter spawn-prompt (§8) — explicit mandate to sweep beyond the flagged line
- PAUSE recommendation when propagation exceeds single file
- **Native pre-push hook** (commit `9a98f23`) — file-level sweep at push boundary structurally prevents drift-pattern files from reaching `origin/staging` outside allowlisted paths

**Family Classification:** Family 1 variant (incomplete audit creates false confidence that the canonical state is clean).

---

### Variant 5c — Memory-Citation (Universal)

**Status:** Existing (renamed from catalog `c` to `5c`).

**Examples from 2026-05-15 session:**
- Agent asserts "Decision 14 says X" without opening Decision 14
- Agent claims "R19 specifies Y architecture" without reading R19
- Agent states "Lock 17 prohibits Z" without verifying Lock 17 text

**Root Cause:** Agent cites a prior decision, spec, or architectural fact from parametric memory (training data or conversation history) rather than from the verified canonical source. Memory is lossy; training data may be stale; conversation history may contain superseded information.

**Closure Mechanism:**
- Rule E (nothing cited from memory) — universal precondition
- "UNVERIFIED" tag requirement — forces explicit acknowledgment when source check is not possible
- Adversary cold-read specifically checks for unverified citations
- **Isolated Adversary cold-read** (§9 Addition 5) — conversational-layer enforcement for substantive substrate

**Family Classification:** Cross-family (manifests in Family 1 through Family 7 depending on context). Rule E is a universal precondition that prevents this variant from manifesting in any family.

---

### Variant 5d — Capability-Citation Without Verify

**Status:** Existing (renamed from catalog `d` to `5d`).

**Example:** Agent asserts "I don't have access to X tool" without verifying via tool_search with multiple keyword variants.

**Root Cause:** Subspecies of memory-citation (5c) where the agent makes claims about its own capabilities from memory rather than testing them. Tool access changes between sessions; the agent's self-assessment of its capabilities is unreliable.

**Closure Mechanism:**
- Rule E extends to self-capability claims
- Before asserting "I cannot do X," agent must attempt X or search for the capability using multiple query variants
- Failure to verify capabilities before claiming inability is a Rule E violation

**Family Classification:** Subspecies of 5c (memory-citation applied to self-capability assessment).

---

### Variant 5e — OD-Register Category Drift

**Status:** Existing (surfaced 2026-05-15; PO ratified wording 2026-05-18 — kept as "OD-register category drift" per PO Q5 answer).

**Example:** OD-006 spend-cap-as-OD — an operational hygiene item (monthly spend cap monitoring) was registered as an Open PO Decision, conflating operational tasks with project-level architectural decisions.

**Root Cause:** The OD register was designed for decisions that require PO ratification to resolve architectural or product-scope questions. When operational items (monitoring, alerting, spend caps) are registered as ODs, the register's signal-to-noise ratio degrades. PO attention is drawn to operational hygiene rather than genuine decision-requiring items.

**Closure Mechanism:**
- OD registration criteria: only items that require a PO product/scope/architecture decision qualify
- Operational items route to a separate operational checklist (not the OD register)
- Adversary flags OD entries that appear to be operational rather than decisional
- A8 scope includes OD-006 closure per this reframing

**Family Classification:** NEW family variant — governance-register pollution. Not directly a stale-citation issue (Family 1) but a signal-degradation issue that compounds over time.

**Wording note:** PO ratified "OD-register category drift" as-is per PO Q5 answer 2026-05-18. Generalization to "governance-register pollution" deferred until the pattern manifests in another register (Decisions DB, GAPs DB).

---

### Variant 5f — Version-Suffix-in-Filename Drift (added 2026-05-18)

**Status:** NEW — surfaced 2026-05-15, closed at commit `b1b5496` (variant 5f sweep) 2026-05-18.

**Example:** Governance files temporarily named with `_v2.md` suffix during authoring (e.g., `FOUNDATION_LOCKS_v2.md`, `NIR_OPERATING_RULES_v2.md`). The `_v2` suffix was meant as a working draft marker, but the suffix propagated through cross-references in adjacent files even after ratification, creating drift between filename (with `_v2`) and citation (without `_v2`).

**Root Cause:** Stable-filename discipline (locked 2026-05-15) requires governance files use stable filenames with version in content header only. The `_v2` suffix violates stable-filename discipline. Even after the suffix is removed via rename, cross-references in adjacent files retain the old suffix until proactively swept.

**Closure Mechanism:**
- Stable-filename discipline (Lock — 2026-05-15)
- Variant 5f sweep commit (`b1b5496`) — removed all `_v2` cross-references repo-wide
- **Native pre-push hook drift-pattern sweep** (commit `9a98f23`) — blocks future push of files containing `FOUNDATION_LOCKS_v2`, `NIR_OPERATING_RULES_v2`, `ARBITRATION_FOUNDATION_LOCK_v2` outside allowlisted files (`ANTI_PATTERN_CATALOG.md`, `FOUNDATION_LOCK.md`, `NIR_OPERATING_RULES.md`, `VIYO_CURRENT_MAP.md`, `CONTEXT_RESTORE.md` which legitimately contain historical references)

**Family Classification:** Family 1 variant (stale-citation propagation via filename suffix). Closes structurally via hooks substrate.

---

### Variant 5g — Memory-Citation of Fix-Target without Grep-Verify (TWO-LAYER, added 2026-05-18)

**Status:** NEW — surfaced repeatedly across 2026-05-15 and 2026-05-18 sessions; 7+ instances logged through 2026-05-18. Commit-boundary closure via hooks 2026-05-18; conversational-layer closure pending isolated Adversary infrastructure.

**Definition:** Agent cites a SHA, decision number, file path, Notion page ID, capability, or other canonical fact AS the fix-target of an action being proposed or committed, WITHOUT grep-verifying that the cited fact actually exists in current canonical state.

**Two-Layer Reality:**

**Layer 1 — Commit-Boundary 5g:** Citation appears in commit message body or in a file being committed. CLOSED structurally by `scripts/git-hooks/commit-msg` (commit `9a98f23`) — SHA citations verified via `git cat-file -e`; file paths with separators verified against working tree; non-resolvable citations block the commit.

**Layer 2 — Conversational-Layer 5g:** Citation appears in chat reasoning or proposed action that doesn't reach commit boundary. NOT closed by hooks. Manifested 5+ times in session 2026-05-18 by Architect Claude:
- Instance 3: database_id vs data_source_id mix-up in D88 dispatch
- Instance 4: CCD memory-cited D86 as next slot (actual: D88)
- Instance 5: Architect REJECT-strong without verifying isolation depth — PO caught
- Instance 6: Ruflo memo cited `goal_decompose`; runtime exposes `workflow_create` / `daa_workflow_create` / `task_create`
- Instance 7: Architect cited OD-021 as Open (actual: Closed 2026-05-14 via PRD V8.1 §6.5 dissolution)

Closure mechanism for Layer 2: **Isolated Adversary cold-read on substantive substrate before ratification** (§9 Addition 5). Manus-side citations: Adversary cold-read on Manus deliverables. PO-side Claude citations: isolated Adversary on substantive proposals before PO ratification.

**Root Cause:** Memory-citation of facts the agent confidently recalls but doesn't verify. Subspecies of 5c (memory-citation universal) but specifically distinguished by the citation being the FIX-TARGET of a proposed action — i.e., the citation drives a downstream action rather than being incidental to broader context.

**Closure Mechanism:**
- Commit-boundary: `scripts/git-hooks/commit-msg` SHA-citation + file-path verify (commit `9a98f23`)
- Conversational-layer: isolated Adversary cold-read on substantive substrate (§9 Addition 5)
- All agents: Rule E universal precondition applies before any other rule

**Family Classification:** Family 1 variant + universal Rule E violation. The two-layer distinction makes this variant the substrate of the broader "hooks substrate vs conversational discipline" architectural decision.

---

### Variant 5h — Memory-Citation of Mechanisms without Empirical Test (added 2026-05-18)

**Status:** NEW — surfaced 2026-05-18 via pre-commit hook failure case study.

**Example:** Architect Claude designed a `pre-commit` git hook assuming `.git/COMMIT_EDITMSG` is populated before the hook fires. This is true for editor-flow commits (where the editor writes the message to the file before invoking pre-commit) but false for `git commit -m "msg"` workflow (where the `-m` flag passes the message via internal state, and COMMIT_EDITMSG is written AFTER the commit completes as a template/record). The hook was designed and dispatched to Curator without testing. CCD Curator's verification tests caught the bug (false positives + false negatives) before the broken hook propagated to repo. Path α correction moved the SHA-citation + file-path verify logic to the `commit-msg` hook (which receives the message file path as `$1` reliably across `-m`, `-F`, and editor flows).

**Root Cause:** Memory-citation of mechanisms (how a tool, API, or system actually behaves) without empirical verification. Distinct from 5c (memory-citation of FACTS) because the cited item is a MECHANISM (behavior, contract, sequencing) rather than a fact (value, ID, location). Mechanisms can be confidently misremembered when the agent has incomplete or outdated understanding of how a system actually works.

**Closure Mechanism:**
- Empirical test before propagating mechanism citation: run a synthetic case to verify the cited mechanism actually behaves as claimed
- "Verify before dispatch" discipline on infrastructure-touching directives (hooks, build configs, deploy scripts, MCP integrations)
- Isolated Adversary cold-read flagging mechanism citations that lack explicit empirical verification

**Family Classification:** Subspecies of 5c (memory-citation universal applied to mechanisms rather than facts). Distinguished because the empirical-test verification path is different from grep-verify against canonical source.

---

## §6 — SESSION_STATE + SESSION_LEDGER γ-Split Format

### Design Principle

Session continuity requires two complementary artifacts with different characteristics:

| Artifact | Purpose | Size Target | Location | Update Frequency |
|----------|---------|-------------|----------|-----------------|
| SESSION_STATE.md | Live operational state pointer | ~2.5 KB | Repo (`docs/governance/`) | Every session close |
| SESSION_LEDGER_YYYY-MM-DD.md | Reasoning chains + discovery process | Unbounded (15-35 KB typical) | Drive (`/working/`) | One per session |

### SESSION_STATE.md Specification

**Contents (mandatory sections):**
1. Phase A status (one line per item: ✅/split/pending + brief note)
2. Pending queue (sequenced, numbered, with priority markers)
3. Recovery protocol (read order for cold-start)
4. Active tensions (if any)

**Formatting rules:**
- Cold-readable: no abbreviations without expansion on first use
- No reasoning chains (those belong in SESSION_LEDGER)
- No verbatim decision text (reference by ID only)
- Target: fits in a single screen (~60 lines max)

**Structural convention (added 2026-05-18 per commit `19074db`):**
> SESSION_STATE.md ledger excludes self-reference. The commit containing this file is always HEAD+1 relative to the last listed anchor. Next governance commit catches up.

This convention closes the recurring "1-commit-stale SESSION_STATE" surface permanently. Future readers of SESSION_STATE see a declared convention, not drift. The 2-commit-stale state that triggered the convention (commits `5b90f34` + `d073a69` unrecorded at write time) was resolved at commit `19074db`; from that commit forward, only 1-commit-stale (the SESSION_STATE-containing commit itself) is structural by design.

**Update discipline:**
- Curator commits at session close (single-writer principle)
- No other agent writes to SESSION_STATE.md
- Updates are delta-only (modify existing lines, don't append history)

### SESSION_LEDGER_YYYY-MM-DD.md Specification

**Contents (11-section structure per dispatch):**
1. Session metadata
2. Decisions ratified (verbatim + reasoning chains)
3. Foundational architecture fixes
4. Tensions resolved
5. Anti-pattern variants surfaced
6. Standing rule additions/strengthenings
7. Notion canonical surface map
8. Phase A status snapshot
9. Discovery process annotations (META)
10. Hand-off instructions
11. Manus-identified tensions

**Formatting rules:**
- Cold-readable: full context without requiring prior session knowledge
- Reasoning chains are mandatory (the WHY, not just the WHAT)
- Cross-references to canonical audit doc (don't duplicate, point to it)
- Verbatim decision text included for decisions ratified that session

**Update discipline:**
- Manus authors per PO dispatch at session end
- Lands in Drive `/working/` folder
- One file per session (never modified after delivery)
- Referenced by SESSION_STATE.md recovery protocol
- **Acceptable deferral:** Per §11 failure modes, Manus SESSION_LEDGER dispatch may be deferred to next-session-morning when current session end-of-day energy budget is exhausted. This is acceptable practice when explicitly noted in SESSION_STATE pending queue, not an "emergency close."

### Read Order (Cold Start)

```
1. CLAUDE.md §6 First Action (auto-load trigger)
2. SESSION_STATE.md (current operational state — WHERE are we?)
3. SESSION_LEDGER (latest in Drive — WHY are we here?)
4. In-flight file (if any — WHAT are we working on?)
```

---

## §7 — TM Cleanup Protocol

### Context

Taskmaster (TM) currently holds 101 tasks with a single 'master' tag. Many of these tasks predate the MBS v1.1 canonical ratification and do not map 1:1 to ratified MBS Bullets. This creates confusion about what is actually in-scope for Phase 1 MVP execution.

### Protocol (5 Steps)

#### Step 1 — Audit

Read current TM state via taskmaster MCP or CLI. Surface:
- Total task count
- Last-touch dates per task
- Master tag presence/absence
- MBS Bullet ID mapping (if any)
- Tasks that reference deprecated/superseded specs

**Acceptance criteria:** Complete inventory with mapping status for every task.

#### Step 2 — Archive

Any task NOT in ratified MBS v1.1 post-Commit 2 → archive (do NOT delete; preserve audit trail).

**Rules:**
- Archived tasks retain their ID and full history
- Archive reason is documented per task
- No task is deleted — ever. Archive is the strongest removal action.
- Tasks that reference deprecated specs (e.g., pre-ZCBR R-specs) are archived with "superseded by v2" reason

**Acceptance criteria:** Only MBS-mapped tasks remain in active state.

#### Step 3 — Regenerate

Re-derive active tasks from ratified MBS v1.1 Bullets per phase:
- Each MBS Bullet (B-0.01 through B-XC.24 + LATER deferred items) maps to exactly one TM task
- Task title = MBS Bullet ID + brief description
- Task description = MBS Bullet scope verbatim
- Task phase = MBS phase assignment
- Dependencies = MBS sequencing

**Acceptance criteria:** TM tasks = 1:1 with MBS Bullets post-regeneration.

#### Step 4 — Verify

Post-regeneration verification:
- Count: TM active tasks = MBS Bullet count
- Mapping: every TM task has exactly one MBS Bullet ID
- Coverage: every MBS Bullet has exactly one TM task
- No orphans: no TM task without MBS authority
- No gaps: no MBS Bullet without TM task

**Acceptance criteria:** Zero orphans, zero gaps, zero duplicates.

#### Step 5 — Lock

Post-verification:
- Every new TM task creation requires MBS Bullet authority
- Tasks without MBS Bullet ID are rejected
- TM becomes a strict derivative of MBS (not an independent planning surface)

### Sequencing (PO ratified 2026-05-18 per Q2)

```
A9 ratifies (this document, 2026-05-18)
    → Commit 2 lands (MBS becomes MVP execution authority per Lock 22 / D85)
    → TM cleanup executes (Steps 1-5)
    → Post-cleanup: TM is locked to MBS
```

**Critical dependency:** TM cleanup MUST NOT execute before Commit 2. MBS must be the ratified execution authority before TM is derived from it. Executing cleanup against a draft MBS would create a moving-target problem.

**Parallel-safe items:** X4-B (PRD long-horizon vision drift) and A8 (OD-006 closure) can proceed in parallel since they don't touch TM. No hard deadline for TM cleanup beyond "before any new Phase 1 build directive references TM tasks."

### External Enforcement

- Post-cleanup, every TM task carries MBS Bullet ID in its metadata
- New TM tasks require MBS Bullet authority (no ad-hoc task creation)
- Adversary loop checks TM↔MBS alignment as part of any build-phase review

---

## §8 — Arbiter Spawn-Prompt Charter (Strengthened)

### Existing Charter Reference

The Arbiter Charter (`docs/governance/review/ARBITER_CHARTER.md`, 3,926 bytes) defines the Arbiter's identity, operating mode (ISOLATED), inputs, outputs, and discipline. This section adds strengthened mandates discovered through 2026-05-18 evidence.

### Strengthened Mandates (Additive to Existing Charter)

#### Mandate 1 — Stale-String Sweep

When the Arbiter identifies any stale string in a reviewed deliverable:
1. Grep the ENTIRE deliverable for all occurrences of the same string
2. Grep all files in the same directory for the same string
3. Grep all files referenced by the deliverable for the same string
4. Report ALL occurrences — not just the first one
5. If occurrences propagate beyond the deliverable itself, rule ESCALATE (not VALID) — PO must decide scope of fix

**Source:** Rule D (§2) + Anti-Pattern variant 5b (§5)

**Hooks substrate complement:** `scripts/git-hooks/pre-push` (commit `9a98f23`) operationalizes the FILE-LEVEL portion of this mandate structurally — drift-pattern files are blocked at push boundary regardless of Arbiter action. Arbiter mandate covers SEMANTIC-level sweep (e.g., conceptual drift, terminology drift) that hooks cannot detect via regex.

#### Mandate 2 — Anti-Pattern Variant Guard

For every commit or deliverable reviewed, the Arbiter checks for ALL anti-pattern variants in §5 above (currently 5a through 5h):
- 5a: Stale-citation-propagation
- 5b: Adjacent-string blindness
- 5c: Memory-citation (universal)
- 5d: Capability-citation without verify
- 5e: OD-register category drift
- 5f: Version-suffix-in-filename drift
- 5g: Memory-citation of fix-target without grep-verify (two-layer)
- 5h: Memory-citation of mechanisms without empirical test

**Source:** Anti-Pattern Catalog §3.5 (5-prefix nomenclature) + session 2026-05-15/18 discovery

#### Mandate 3 — Rule E Enforcement

The Arbiter treats any unverified citation (claim without source path) as a VALID finding requiring fix. The only acceptable alternatives are:
- A verified source path (file path, Notion page ID, Airtable record ID)
- An explicit "UNVERIFIED — requires source check" tag

Claims presented as fact without either of these are Rule E violations.

**Hooks substrate complement:** `scripts/git-hooks/commit-msg` (commit `9a98f23`) operationalizes commit-boundary Rule E. Arbiter mandate covers conversational-layer Rule E (claims in proposed actions, reasoning, recommendations that don't reach commit boundary).

**Source:** Rule E (§2)

#### Mandate 4 — Rule 3.12 Edge Case 2 Enforcement

The Arbiter verifies that all relay content received (REVIEW files from Adversary) is verbatim — not summarized, not paraphrased. If the Arbiter suspects relay summarization:
1. Request verbatim source from the relay agent
2. If verbatim source differs materially from received content, flag as ESCALATE
3. Do not rule on summarized content — only on verbatim source

**Source:** Rule 3.12 Edge Case 2 (§3)

#### Mandate 5 — Adjacent-String Blindness Mitigation

When fixing one stale citation (ruling VALID on a finding), the Arbiter MUST:
1. Grep the same string across ALL files touched in the same PR/commit
2. If additional occurrences found, add them to the ARBITER ADDENDUM
3. Recommend Adversary re-run if the additional occurrences are in files the Adversary did not review

**Source:** Anti-Pattern variant 5b (§5) + Rule D (§2)

#### Mandate 6 — PAUSE Recommendation

The Arbiter recommends PAUSE (execution stops, PO attention required) when:
- Stale citations propagate beyond a single file (multi-file contamination)
- A finding reveals a foundational source conflict (not just a downstream patch)
- Rule E violations appear systematic (multiple unverified citations in same deliverable)
- The deliverable appears to be a patch rather than a source-traced fix (Rule A violation)

**PAUSE is a hard gate.** Execution does not resume until PO acknowledges and provides direction.

---

## §9 — Adversary Loop Charter (Additions)

### Existing Charter Reference

The Adversary Charter (`docs/governance/review/ADVERSARY_CHARTER.md`, 3,351 bytes) defines the Adversary's identity, operating mode (ISOLATED), inputs, outputs, and discipline. This section adds mandates discovered 2026-05-15 + 2026-05-18.

### Additions (Additive to Existing Charter)

#### Addition 1 — Rule E Enforcement

Every cited substrate fact in the reviewed deliverable must have a verifiable source path. The Adversary flags any claim that:
- Cites a decision without a Notion page ID or Decision number
- Cites a spec without a file path
- Cites a lock without a Lock number
- Cites an architectural fact without pointing to the authoritative source
- Uses phrases like "as previously established" or "per our earlier decision" without a specific reference

**Finding format:** "RULE E VIOLATION: [claim text] — no source path provided. Requires verification against [likely canonical source]."

#### Addition 2 — Anti-Pattern Variant Guard (all 5a-5h)

The Adversary checks the deliverable for all 8 variants currently catalogued (5a-5h per §5). For each variant detected, the Adversary documents:
- Which variant manifested
- Where in the deliverable
- What closure mechanism applies

#### Addition 3 — Context Budget Mandatory Review (90% threshold — PO ratified 2026-05-18)

When PO-side Claude reaches >90% context budget, a mandatory Adversary review fires before session close. This ensures that decisions made under context pressure (when the agent's reasoning quality may degrade) receive independent cold-read verification.

**Trigger:** PO-side Claude reports context usage >90%
**Action:** Adversary review of all decisions ratified in the current session
**Scope:** Decisions only (not full deliverable review — that would exceed remaining budget)

**Threshold rationale (PO ratified 2026-05-18 per Q3):** 90% is balanced. 85% would trigger too aggressively (most sessions reach 85%+). 95% would leave insufficient remaining context for meaningful review.

#### Addition 4 — Cold-Read Discipline

The Adversary operates under strict cold-read discipline:
- No prior session context allowed during review
- No conversation history from the authoring session
- Only inputs: deliverable + spec + Locks + REVIEW_FORMAT.md
- The Adversary's value comes from fresh-eyes perspective — any prior context contaminates this

This is already implicit in ISOLATED MODE but is now explicitly stated as a hard constraint.

#### Addition 5 — Isolated Adversary Dispatch Mechanism (added 2026-05-18 per PO standing rule)

Per PO standing rule ratified 2026-05-18 ("In the future only ISOLATED adversary work"), all Adversary loops on substantive substrate MUST use isolated cold-read mode. PO-side Claude (or any agent with prior session context) performing Adversary-style review does NOT satisfy this discipline.

**Three operational dispatch mechanisms** (any acceptable):

**Mechanism A — Manus dispatch:** PO-side Claude composes ADVERSARY_DISPATCH directive citing deliverable file (Drive ID or repo path), Spec inputs (Locks, REVIEW_FORMAT.md, related ADVERSARY_CHARTER.md), and explicit instruction to operate in cold-read mode with no prior session context. Manus executes Adversary review, produces ADVERSARY findings file in Drive `/working/`. PO-side Claude reads findings + dispatches Arbiter cross-check.

**Mechanism B — Fresh Claude.ai session:** PO opens new Claude.ai conversation. Pastes ADVERSARY_DISPATCH directive with explicit "no prior context" constraint + complete substrate inputs (the deliverable + Spec + Locks). Fresh-session Claude executes Adversary review in-conversation. PO copies output to canonical review location (`docs/governance/review/ADVERSARY_<deliverable>.md`).

**Mechanism C — WSL2 cage Claude Code:** PO-side Claude composes directive. CCD Curator enters cage via `wsl -d Ubuntu-22.04`. Inner Claude Code (no main-session context, separate authentication scope) executes Adversary review against deliverable copied into cage. Output captured to `/home/plato/viyo-shadow/review/` and exported to main repo `docs/governance/review/`.

**Dispatch components (all three mechanisms require):**
1. Deliverable inputs (file path/Drive ID + verbatim content)
2. Spec inputs (Locks referenced, REVIEW_FORMAT.md, ADVERSARY_CHARTER.md)
3. Explicit cold-read constraint ("operate as if you have no prior context about this deliverable, this session, or this project's history")
4. Output location (where findings file lands)
5. Scope statement (full-deliverable cold-read OR scoped to specific concern)

**When isolated Adversary is required:**
- Substantive substrate revisions (governance docs, R-specs, Foundation Locks)
- New canonical-state writes (Decisions DB, new Locks, new Rules)
- A9 future revisions (this document)
- Anything that would land at Foundation Lock tier authority

**When isolated Adversary is NOT required:**
- Mechanical bookkeeping (SESSION_STATE updates, HEAD pointer refreshes)
- Path X-style structural-fix commits
- Implementing previously-ratified scope (executing a PO-ratified plan)

**Path 1 author-execute clause:** When PO ratifies a defined scope of changes (e.g., "5 updates + 5 answers"), the agent executing that scope into a revised deliverable does NOT require isolated Adversary, because the deliverable is mechanical execution of ratified scope, not novel substrate authoring. Subsequent revisions to that ratified deliverable DO require isolated Adversary if they introduce new substrate.

---

## §10 — Cataloger Role Tool-Access Scoping

### Context

CLAUDE.md §3.4 defines a "transitional period" for the Cataloger role where per-write PO ratification is required. This section formalizes the Cataloger's tool-access scope and exit criteria for the transitional period.

### Cataloger Role Definition

**Identity:** The Cataloger writes Notion canonical state post-PO ratification. It is the single-writer to Notion (parallel to Curator being the single-writer to the repo).

**Scope:** Notion canonical surfaces only:
- Decisions Database
- Open PO Decisions Database
- Conflict Resolutions Database
- Documentation Gaps Database
- Standing Rules page

### Tool-Access Scope

**Permitted tools:**
- `notion-create-pages` — restricted to pages in the 5 canonical surfaces listed above
- `notion-update-page` — restricted to:
  - Status property updates after PO ratification
  - Content body appends preserving original text (no replacement)
  - New page creation in the correct database

**Forbidden without explicit per-write PO ratification:**
- Page deletion (always forbidden — archive pattern only)
- Schema changes (database property additions/removals/renames)
- Replacing existing page content (use append pattern; original text preserved)
- Writing to pages outside the 5 canonical surfaces
- Bulk operations (>5 pages in a single session without per-page ratification)

### Transitional Period — EXITED 2026-05-18 per PO Q4 ratification

**Original exit criteria (Manus DRAFT):** 3 consecutive sessions without per-write ratification override + zero governance violations + PO explicit ratification of exit.

**Actual exit event:** Session 2026-05-18 alone produced 3 Cataloger Notion writes with PO ratification:
1. D88 page creation (`notion-create-pages` — D88 initial Locked status)
2. D88 properties update (`notion-update-page` properties — Status → Open, Title revised, Migration Notes revised)
3. D88 content append (`notion-update-page` content_updates — REVISION 2026-05-18 section appended)

All 3 writes occurred without override, with zero governance violations, with explicit PO ratification per write. PO ratified transitional period exit per Q4 answer 2026-05-18.

**Post-transition state (effective 2026-05-18):** Cataloger operates with standing authority to write Notion canonical state post-PO decision ratification, without per-write confirmation. PO retains override authority at any time.

**Cataloger discipline post-transition:**
- Every Notion write MUST be traceable to a PO ratification event (chat statement, Decision page, Standing Rule)
- The ratification event MUST be cited in the Notion write context (page properties, Migration Notes, or content body)
- PO retains spot-check authority — any write may be reviewed retroactively
- Violations during post-transition revert Cataloger to transitional period (3-session probation)

---

## §11 — Session-End Protocol

### Formalization of 2026-05-15 / 2026-05-18 Pattern

Every PO-side Claude session ends with the following 7-step protocol:

```
Step 1: PO-side Claude dispatches Manus → SESSION_LEDGER_YYYY-MM-DD.md
        (captures reasoning chains, anti-patterns, discovery process)
        ACCEPTABLE DEFERRAL: per §6 SESSION_LEDGER spec, Manus dispatch
        may defer to next-session-morning when current session end-of-day
        energy budget is exhausted. Must be explicitly noted in
        SESSION_STATE pending queue.

Step 2: PO-side Claude produces SESSION_STATE.md delta updates
        (paste-back to Curator — verbatim per Rule 3.12)

Step 3: Curator commits SESSION_STATE.md + any final substrate updates
        (single commit; grep-verify per Rule C)
        HOOKS SUBSTRATE: commit-msg + pre-push hooks (commit `9a98f23`)
        enforce Rule E + Rule C externally at commit/push boundary

Step 4: Notion canonical writes flushed
        (Cataloger executes per §10: decisions ratified, OD status
         updates, etc. — post-transition standing authority)

Step 5: Manus deliverables land in Drive
        (SESSION_LEDGER + any other dispatched artifacts;
         deferral acceptable per Step 1 note)

Step 6: PO-side Claude runs final Rule C grep-verify
        (confirms no stale strings introduced by session-close commits)
        HOOKS SUBSTRATE: pre-push hook drift-pattern sweep operates at
        push boundary regardless of PO-side verify

Step 7: Session closes
        (no pending items carry forward without explicit "PENDING" tag
         in SESSION_STATE.md)
```

### Next Session Opens

Per CLAUDE.md §6 First Action:
1. Auto-load 5 files (CLAUDE.md specifies which)
2. Read SESSION_STATE.md (current operational state)
3. Confirm orientation to PO in <5 minutes
4. Resume from "Pending queue" in SESSION_STATE.md

### Failure Modes and Mitigations

| Failure Mode | Mitigation |
|--------------|------------|
| Manus dispatch fails (sandbox timeout) | PO-side Claude authors minimal SESSION_LEDGER inline; Curator commits with "LEDGER_PENDING" flag |
| Manus SESSION_LEDGER deferred to morning per energy budget | Acceptable per §6 spec; SESSION_STATE pending queue explicitly notes deferral |
| Notion writes fail (API error) | Curator commits with "NOTION_PENDING" flag; next session retries |
| Grep-verify finds stale strings at step 6 | Fix in same session — do NOT carry forward |
| Pre-push hook blocks legitimate push due to drift-pattern false positive | Add file to allowlist in `scripts/git-hooks/pre-push` per documented exemption discipline; OR escape the pattern in source text; OR use `--no-verify` only with explicit PO ratification |
| Commit-msg hook blocks legitimate commit due to literal hex/`.md` false positive | Rephrase message to avoid literal-pattern false-positives (ellipsis, partial strings); OR use `--no-verify` only with explicit PO ratification |
| Context budget exhausted before step 7 | Emergency close: SESSION_STATE delta committed; SESSION_LEDGER deferred to next session start; isolated Adversary dispatched per §9 Addition 3 if budget exceeded 90% |

---

## §12 — Open Questions Ratification Record (closed 2026-05-18)

The following items required PO decision before A9 graduated from DRAFT to RATIFIED. All 5 ratified 2026-05-18 per PO Path 1 approval.

### Question 1 — Rule 3.11 Scope

**PO Ratification:** **REJECTED as standalone rule.** Rules 3.4 (no writes to canonical state without ratification surface) + 3.5 (bring recommendations, not permission requests) already cover the substrate Rule 3.11 was proposed to govern. No documented Curator failures show 3.4/3.5 missed a scope-question event that a standalone 3.11 would have caught. Rule accumulation produces conflicts per ANTI_PATTERN_CATALOG Section 5 #3 — adding redundant rules degrades the catalog.

**Reopen conditions:** If a documented Curator failure pattern surfaces where 3.4 + 3.5 were insufficient, reintroduce as a new Decision with the failure evidence — not as a quiet AOR re-add.

---

### Question 2 — TM Cleanup Execution Timing

**PO Ratification:** **After A9 ratifies + after Commit 2 lands.** Per §7 Sequencing block: A9 ratifies → Commit 2 lands → TM cleanup executes → TM locked to MBS. X4-B (PRD long-horizon vision drift) and A8 (OD-006 closure) proceed in parallel since they don't touch TM. No hard deadline beyond "before any new Phase 1 build directive references TM tasks."

---

### Question 3 — Adversary Loop Budget Threshold

**PO Ratification:** **90% confirmed.** 85% triggers too aggressively (most sessions reach 85%+); 95% leaves insufficient remaining context for meaningful review. Implemented in §9 Addition 3.

---

### Question 4 — Cataloger Transitional Period Exit Criteria

**PO Ratification:** **EXITED 2026-05-18.** Session 2026-05-18 alone produced 3 successful Cataloger Notion writes (D88 create + properties update + content append) without override, with zero governance violations, with explicit PO ratification per write. Threshold of "3 consecutive sessions" reframed to "3 consecutive writes" given the session-length variability surfaced by 2026-05-18 evidence. Post-transition state effective per §10.

---

### Question 5 — Anti-Pattern Variant 5e Wording

**PO Ratification:** **Keep as "OD-register category drift."** Specific to current instance (OD-006). Generalization to "governance-register pollution" deferred until the pattern manifests in another register (Decisions DB, GAPs DB). Implemented in §5 Variant 5e.

---

## §13 — Operationalization Substrate (added 2026-05-18)

Beyond the rules themselves, A9 ratification operationalizes via four substrates currently active:

### Substrate 1 — Native git-hooks (commit `9a98f23`)

Three hooks installed at `scripts/git-hooks/` and symlinked into `.git/hooks/` via `scripts/install-hooks.sh`:

- **`commit-msg`** — enforces governance commit discipline (conventional subject + body ≥ 100 chars + ratification reference) AND SHA-citation + file-path verify against repo state. Closes commit-boundary variant 5g (per §5).
- **`pre-push`** — drift-pattern sweep with file allowlist. Blocks push of files containing `FOUNDATION_LOCKS_v2`, `NIR_OPERATING_RULES_v2`, `ARBITRATION_FOUNDATION_LOCK_v2` outside allowlisted historical-reference files. Closes file-level Rule D propagation (variant 5f per §5).
- **`post-commit`** — appends commit metadata to `~/.viyo/session-log.md` for durable session-log substrate per Rule 7.

Validated across 5+ governance commits 2026-05-18 with zero false positives in production. Hook substrate IS the operational layer of Rules C/D/E for commit-boundary discipline.

### Substrate 2 — Convention annotation in SESSION_STATE (commit `19074db`)

Structural annotation closing the recurring 1-commit-stale surface (per §6). Future readers see declared convention, not drift.

### Substrate 3 — WSL2 cage (Dispatch 3 outcome, 2026-05-18)

Isolated validation environment at `Ubuntu-22.04` distro, ready to host:
- Ruflo 3.7.0-alpha.68 with selective plugins (cycle #1 NO-OP verdict logged 2026-05-18; cycle #2 candidates queued per D88 Tier 1)
- Isolated Adversary Mechanism C (per §9 Addition 5)
- Other isolated-context testing without contaminating main environment

Validated end-to-end 2026-05-18: Linux leak contained, Windows host untouched, main VIYO repo untouched throughout.

### Substrate 4 — Notion D88 (Ruflo decision substrate)

Open decision tracking three-tier validation path:
- Tier 1: WSL2 cage validation (open through 2026-05-25 to 2026-06-01)
- Tier 2: Upstream evidence on Ruflo #1597 (PO action when convenient)
- Tier 3: Native-port (gated on Tier 1 outcome)

D88 URL: `https://www.notion.so/3649a84a4679812b9acdf163ac0e4565`

---

*End of A9 v1.0 RATIFIED 2026-05-18.*

*Author lineage: Manus DRAFT 2026-05-15 → Architect Claude revision per PO Path 1 ratification 2026-05-18.*

*Cataloger action items at A9 commit: (1) Update Standing Rules canonical Authority Hierarchy section per §4 supersession action 3; (2) Add "PRD V8.1" option to Notion Source Authority enum per §4 supersession action 5; (3) Update ANTI_PATTERN_CATALOG.md §3.5 with 5-prefix nomenclature per §5; (4) Add variants 5f/5g/5h to catalog per §5.*

*Future A9 revisions require isolated Adversary cold-read per §9 Addition 5.*
