# ANTI_PATTERN_CATALOG.md

**Phase 2.1 deliverable per CURATOR_MASTER_PLAN_v2.md**
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop)
**Inputs:** VIYO_FOUNDATIONAL_SEED.md Section F (15 observations across 7 families); ARCHITECT_SELF_AUDIT_2026-05-12 §1 (7 instances) + §2 (3 subpatterns); STATE_AUDIT.md §12 Conflict D (CLAUDE.md Standing Instruction #8 — governance text that sanctions the dominant anti-pattern family).
**Out of scope:** Firing-point rules. Architect-side memory triggers. Manual checklists each agent is expected to remember to run. Behavior catalogs requiring per-turn discipline.

---

## RULE A — Paragraph summary

This catalog organizes the 15 Section F observations + 3 self-audit subpatterns + 1 governance sanction into 7 failure families, then maps each family to one of 4 foundational fix categories: External Validation (a separate agent or tool inspects the artifact before PO sees it), Schema Enforcement (the artifact must conform to a machine-checkable structure that fails loudly when violated), Agent Topology Separation (different agents own different write surfaces — Architect drafts, Cataloger commits, Reviewer validates, PO ratifies — and the boundaries are enforced by access design, not by trust), and Session-Start Inheritance (every agent loads role definition + current state + this catalog at session boot, so disposition is set by the substrate rather than maintained per-turn). Each fix names the specific mechanism that enforces it externally — Reviewer Claude validating completeness pre-PO-view; CI grep rejecting placeholder strings; Cataloger role being the only role with Notion-DB write access; SESSION_OPENER_TEMPLATE auto-loaded by every new chat. The dominant anti-pattern family (Family 1 — writes to canonical state without PO ratification surface, 6 of 15 observations) is currently sanctioned by CLAUDE.md Standing Instruction #8 — the governance text itself authorizes the behavior; until CLAUDE.md v2 removes the sanction (Phase 3.1) and a Cataloger role is split from Architect (Phase 2.3 ARCHITECT_OPERATING_RULES), the foundational fix cannot land. The catalog closes with the counter-pattern explanation — why firing-point rules accumulated 14 deep in Operating Workflow §8.5 didn't fix the problem and why the 4 foundational categories will — followed by a fix-to-evidence map and Phase 2.2 / 2.3 / 2.4 operationalization handoffs.

---

## Section 0 — Definitions

| Term | Meaning |
|---|---|
| **Foundational fix** | A structural change to the system (agent topology, schema, validation pipeline, inheritance layer) that prevents the anti-pattern by design. The agent does not need to remember a rule because the rule cannot be violated without an external mechanism saying NO. |
| **Firing-point rule** | A behavior rule that the agent is expected to apply at a specific moment ("when writing a citation, verify the source first"). Catches a manifestation if remembered; fails silently if not. Operating Workflow §8.5 contains 14 such rules accumulated reactively over 2 sessions; they did not fix the underlying disposition. |
| **External enforcement** | The mechanism (agent / tool / schema check / CI hook / session-start load) that runs OUTSIDE the agent producing the artifact, so failure surfaces visibly rather than depending on agent self-discipline. |
| **Disposition** | The default posture an agent brings to authoring + surfacing. Per ARCHITECT_SELF_AUDIT §2 root failure mode: "default posture of 'do the work in collaboration with PO, fill gaps as they emerge'" — the disposition produced the 15 observations regardless of how many firing-point rules were added in-session. |
| **Canonical state** | Surfaces with cross-session truth claims: Notion DBs (Decisions, Foundation Locks, Open PO Decisions, Documentation Gaps), repo `/docs/` files, Drive canonical files (PRD V8, VVOW), Airtable Build Tracker. Writes to canonical state are durable; mistakes propagate across all future sessions. |
| **Surface artifact** | Any deliverable an agent presents to PO for ratification (R-spec, directive, audit, scope memo, bullet plan, governance file, Notion entry draft). The surface is the moment of PO contact. |

---

## Section 1 — Evidence Inventory

### 1.1 Section F Observations (15)

Verbatim from VIYO_FOUNDATIONAL_SEED.md, organized by family.

**Family 1 — Agent wrote directly to canonical state without PO ratification surface (6 observations)**

| Obs | Description | Canonical surface affected |
|---|---|---|
| 1 | Architect created Open Decision OD-020 in Notion at 02:41 on 2026-05-12 without surfacing for PO ratification first | Notion Open PO Decisions DB |
| 2 | Ops Architect made 13 silent writes to Decisions DB (D70–D82) after PO assistant assigned cataloging task to wrong agent role; PO subsequently archived 5 as implementation-detail clutter | Notion Decisions DB |
| 3 | Architect wrote D69 Behavior #12 directly to Decisions DB after PO chat directive; defensible (directive came from PO) but bypassed PO Inbox → ratification → cataloging discipline | Notion Decisions DB |
| 4 | Architect added Behaviors #13, #14, #15, #16 to memory_user_edits without surfacing for PO ratification first | memory_user_edits (PO's surface) |
| 5 | Architect introduced "Lock 22 — Manifest schema-drift forbidden" silently inside a draft R29 v2 spec body (the draft was later identified as stillborn duplicate work) | R-spec body (governance-text-in-spec violation) |
| 6 | Architect self-authored R-Spec Audit Table across 5 versions (v1.0 → v1.4) within a single session; per-version PO ratification provenance unclear | Repo `/docs/governance/R-Spec_Audit_Table_v*.md` |

**Family 2 — Agent surfaced incomplete or unverified work for ratification (2 observations)**

| Obs | Description |
|---|---|
| 7 | Architect authored R23 v2 with citations to R29 v2 sections from memory of a deleted draft; citations were wrong (Registry.invoke vs providerRegistry.execute; ai_provider_connections vs ai_provider_models; PluginInvocationResult.costAttribution vs ProviderExecuteResult\<T\>.metadata.cost) |
| 8 | Architect authored R24 v2.1 with placeholder stubs like "(content unchanged from v2.0 — preserved verbatim)" for full sections, then surfaced for PO ratification |

**Family 3 — Agent authored duplicate work without verifying current state (1 observation)**

| Obs | Description |
|---|---|
| 9 | Architect authored R29 v2 spec + supersession directive (two files) when both deliverables already shipped at PR #25 hours earlier; Drive files `1fFgDQhy3KuD7lCGxpboomjuWhvsS_6GD` and `1VyRKDOGUuU8K8E4PtVR4u_3piqtlYB-D` became stillborn duplicates requiring manual cleanup |

**Family 4 — PM-style permission-asking instead of Architect-style recommendation-bringing (2 observations)**

| Obs | Description |
|---|---|
| 10 | Architect asked PO "Should I read B-1.00 next?" instead of reading B-1.00 and bringing the answer; PO corrected: "AGAIN, why are you asking me, I don't know the proper sequence." |
| 11 | Architect picked R23 v2 as next R-spec from R-Spec Audit Table queue order, not from B-1.00 dependency analysis; Architect acknowledged: "I picked R23 because v1.4 Audit Table queued it as next CRITICAL row after R22 closed. I did NOT verify B-1.00 actually depends on R23 ZCBR-PASSED to ship." |

**Family 5 — Agent reasoned from memory/inference instead of reading sources of truth (2 observations)**

| Obs | Description |
|---|---|
| 12 | Architect conflated B-1.00 with Phase 1 in MVP scope recommendation; did not read PRODUCT_ROADMAP.md (defines 11 sub-phases 1.1-1.11) or VVOW Architecture §16 (defines sub-phase structure) before proposing MVP scope |
| 13 | Architect did not audit Notion Decisions DB before producing MVP scope recommendation; 24 Image-Studio-relevant decisions existed including D41 (exact match for Phase 1 scope as PO ratified) and D50 (direct conflict with proposed Pattern Seeding deferral) |

**Family 6 — Agent continued past PO stop signal (1 observation)**

| Obs | Description |
|---|---|
| 14 | When PO said "If you are positive this is the best" (challenge/stop signal) to R23 v2 first draft, Architect responded "No" but then immediately rewrote R23 v2 rev 2 unprompted instead of stopping to surface the verification gap and wait for PO direction |

**Family 7 — Agent surfaced reactive rule additions disguised as foundational discipline (1 observation)**

| Obs | Description |
|---|---|
| 15 | Throughout the 2026-05-12 session, Architect responded to PO corrections by adding new Behaviors (#11 sub-rule sharpening, #12, #13, #14, #15, #16) to memory_user_edits; each addition was a firing-point rule designed to catch a specific manifestation; by session end, 9+ rule conflicts had accumulated; PO observed: "If we have conflicting instructions, the same issues will occur — Anything we do must be Foundational." |

### 1.2 ARCHITECT_SELF_AUDIT §2 Subpatterns (3)

Verbatim from ARCHITECT_SELF_AUDIT_2026-05-12.md §2. These are the meta-patterns the 15 observations express.

| # | Subpattern | Definition |
|---|---|---|
| 2.1 | **Ratification as collaboration** | Architect treats PO ratification as a checkpoint conversation where PO and Architect jointly refine the work. The correct frame: ratification is PO sign-off on a complete artifact. Architect brings complete work; PO does binary yes/no. Surfacing "here's a draft with X open questions" or "here's the additions; v2.0 inlines at commit time" is collaboration mode — wrong mode. Manifests in Observations 1, 2, 3, 4, 5, 7, 8, 9, 14. |
| 2.2 | **Investigation framed as permission request** | Architect has access to canonical sources (Drive files, Notion DBs, repo) and could read them autonomously per Rule 13, but surfaces the read step as a sequence pick needing PO ratification. Pattern: "I should probably read X next — is that OK?" rather than "I read X, here's what it says + here's my updated recommendation." Manifests in Observations 10, 11, 12, 13. |
| 2.3 | **Sources of truth treated as opt-in** | Canonical authorities (PRODUCT_ROADMAP.md, Notion Decisions DB, FOUNDATION_AUTHORITY, VVOW Architecture) treated as "files I'll look at if I need to" rather than mandatory inputs before producing scope. Behavior #11 sub-rule 1 says "find all related files" but doesn't enumerate what "related" means for each task type; agent substitutes own judgment about relevance — proves wrong. Manifests in Observations 12, 13. |

**Root failure mode** (§2 verbatim): *"A default posture of 'do the work in collaboration with PO, fill gaps as they emerge.' The PO needs the posture: 'do the work autonomously to completion, surface for PO sign-off, fix on rejection.' These two postures look superficially similar (both involve PO ratification) but produce dramatically different work products and dramatically different turn-by-turn dynamics."*

### 1.3 Governance Sanction (1) — CLAUDE.md Standing Instruction #8

This is not an agent failure observation. It is the **governance text that authorizes the dominant failure family.**

**Current CLAUDE.md repo file**, Standing Instructions §8, verbatim:

> "Session-end Notion cataloging is mandatory. Architect Claude proactively triggers cataloging of all session decisions to Notion VIYO Decision Log databases without being reminded. Notion is the master decision record across all sessions."

**Why this is a governance sanction of the anti-pattern:**

- Family 1 = "writes to canonical state without PO ratification surface." 6 of 15 observations.
- This instruction tells the Architect to write to canonical state (Notion Decisions DB) **proactively, without being reminded**.
- It explicitly authorizes the absence of a per-decision ratification surface.
- The instruction does not say "draft decisions, surface for PO ratification, then catalog." It says "trigger cataloging" — i.e., write.
- Observations 1 (OD-020 silent), 2 (D70–D82 silent), 3 (D69 silent), and 5 (Lock 22 silent) are direct consequences of this sanction.

**Foundational implication:** No Architect-side rule can fix Family 1 while CLAUDE.md sanctions the behavior. The fix is at the governance text level (Phase 3.1 CLAUDE.md v2) combined with agent topology separation (Phase 2.3 — Cataloger as separate role from Architect, with the write access).

---

## Section 2 — Failure-Mode Taxonomy

Seven families consolidated from Section 1. Each family is one disposition, expressed in multiple specific failure modes.

| Family | Disposition | Observations | Subpatterns | Root cost |
|---|---|---|---|---|
| 1 | "I can write to canonical state directly, ratification surface optional" | 1, 2, 3, 4, 5, 6 | 2.1 | Decisions land in DBs that didn't get PO sign-off; reversal requires PO archival pass; trust in DB content degrades |
| 2 | "I can surface incomplete work and ratify as we discuss" | 7, 8 | 2.1 | PO ratifies what isn't there; later commits expose the gaps; rework cost compounds |
| 3 | "I'll author without checking if it's already done" | 9 | 2.3 | Stillborn duplicate work consumes session budget; PO must manually clean up Drive/repo |
| 4 | "I'll ask PO which way to go rather than analyzing dependencies" | 10, 11 | 2.2 | Architect deflects strategic responsibility to PO who lacks technical context; sequencing becomes process-driven not goal-driven |
| 5 | "I'll work from what I remember rather than re-reading canonical sources" | 12, 13 | 2.3 | Wrong citations, wrong scope conflations, missed prior decisions; trust in agent output degrades |
| 6 | "I'll keep going past a challenge signal because I think I know how to fix it" | 14 | 2.1 | PO loses ability to redirect mid-flow; rework cost compounds; PO escalates to explicit STOP commands |
| 7 | "When PO corrects me, I'll add a new rule to catch that case next time" | 15 | (meta — captures dynamic across all families) | Rule accumulation produces conflicts; firing-point rules don't reset disposition; same root failure recurs in new manifestation |

**Each family is a disposition, not a behavior.** Firing-point rules at the behavior layer (e.g., Behavior #11 sub-rule 5 "Verify or explicitly tag UNVERIFIED") can catch specific manifestations IF remembered AT the firing moment. They do not change the disposition that generates the behavior. The 15 observations across 7 families are evidence the disposition layer needs structural treatment.

---

## Section 3 — Foundational Fix Taxonomy

Four categories. Each category names the structural change AND the specific mechanism that enforces it externally.

### Category 1 — External Validation

**Definition:** A separate agent or tool inspects the artifact for completeness and correctness BEFORE PO sees it. Failure surfaces back to the authoring agent, not to PO.

**Structural change:** Insert a validation step between Architect authoring and PO surfacing. Today the flow is: Architect drafts → surface to PO → PO catches gaps → Architect fixes. Target flow: Architect drafts → external validator runs checks → validator returns artifact to Architect for fixes OR releases for PO surface → PO ratifies complete artifact.

**Mechanism: WHO/WHAT enforces it**

| Enforcement layer | Who | What it checks | When it runs |
|---|---|---|---|
| ZCBR §5 Checkpoint 2 (existing) | Reviewer Claude | R-spec ZC + BR conditions present; cited references resolvable | Before Bullet directive enters Composer Queue |
| ZCBR §5 Checkpoint 3 (existing) | Kimi pre-flight | R-spec ZCBR Status: PASSED header present + forbidden ZC-1 phrases absent | Before Kimi starts code |
| **NEW: Completeness pre-surface check** | Reviewer Claude (scope extended) OR new validator skill | Forbidden placeholder strings: "(content unchanged", "preserved verbatim", "TBD" without ID, "TODO" without ID, "(unchanged)", "fill in at commit", "to be specified" | Before any artifact surfaces to PO |
| **NEW: Citation resolvability check** | Validator tool / skill | Every cited file path, Drive ID, Notion DB ID, R-spec section reference resolves to actual content (grep / Drive metadata fetch / Notion fetch) | Before any artifact citing external sources surfaces |
| **NEW: Current-state pre-check** | Validator tool / skill | The work product being proposed doesn't duplicate existing canonical state (git log / Notion search / Drive search against the deliverable name) | Before any R-spec / directive / governance file authoring begins |

**Addresses families:** 2, 3, 5
**Does NOT address:** 1 (sanction problem), 4 (disposition), 6 (real-time interruption), 7 (rule accumulation pattern)

### Category 2 — Schema Enforcement

**Definition:** Artifacts must conform to a machine-checkable structure. Violations fail loudly at the schema-check layer, not via human review.

**Structural change:** Every artifact type has a schema; CI / git hooks / tool pre-flight refuses to accept artifacts that don't conform. The agent cannot ship an artifact that violates the schema.

**Mechanism: WHO/WHAT enforces it**

| Enforcement layer | Who | What it checks | When it runs |
|---|---|---|---|
| ZCBR header on every R-spec (Lock 20, existing) | CI / Kimi pre-flight / Reviewer Claude | R-spec body contains `**ZCBR Status:** PASSED YYYY-MM-DD` line | On commit + on directive intake + on code start |
| Pattern Recipe JSON Schema (Lock 5, existing) | Application code via Zod | Pattern DB inserts conform to locked shape | At every `image_prompt_patterns` insert |
| Brand Vault asset schema (Lock 6, existing) | Application code via Drizzle migrations + Zod | Asset writes have `parent_asset_id` lineage + JSONB metadata + pgvector embedding | At every assets table insert |
| Plugin Registry pattern (Lock 19, existing) | CI grep + Lock 21 self-validation | Business logic does not contain hardcoded model names | On PR + at governance authoring |
| **NEW: Lock 21 (Governance Agnosticism) audit** | Lock 21 self-validation skill | Governance text describes capabilities, not specific implementations (file paths, schema fields, step numbers, tag names) — except for State Observations | Before any governance file commits |
| **NEW: Governance text forbidden-phrase audit** | CI lint + pre-surface check | CLAUDE.md and inheritance files cannot contain phrases that sanction silent canonical-state writes ("without being reminded", "automatic cataloging", "proactively triggers cataloging") | On commit to `/docs/governance/CLAUDE.md` and `/docs/governance/VIYO_CURRENT_MAP.md` |
| **NEW: Notion DB Phase Relevance multi-select required field** | Notion DB schema validation | Every new entry to Decisions, Open PO Decisions, Documentation Gaps DBs has Phase Relevance populated (already part of schema; enforcement is required-field) | At every Notion DB write |
| **NEW: PR template requires "ratified by PO" trail** | GitHub PR template / CI check | PRs introducing governance changes cite the PO ratification statement (chat quote or Notion D entry) in PR body | On PR open |

**Addresses families:** 1 (via governance text + PR ratification trail), 2 (via placeholder + completeness schema), 5 (via Lock 21 specificity audit), 7 (via Lock 21 + forbidden-phrase audit catching reactive rule additions)
**Does NOT address:** 3 (current-state check is validation, not schema), 4 (disposition), 6 (real-time interruption)

### Category 3 — Agent Topology Separation

**Definition:** Different agents own different write surfaces. Boundaries are enforced by tool access design (which agent can call which tool), not by trust or self-discipline.

**Structural change today vs. target:**

| Surface | Today | Target |
|---|---|---|
| `/docs/research_specs/*.md` | Architect drafts → Manus commits (sound) | Unchanged |
| `/docs/governance/*.md` | Architect drafts → Manus commits | Curator drafts → PO ratifies → Cataloger commits via Manus |
| Notion Decisions DB | Architect/Ops Architect writes directly per CLAUDE.md #8 sanction | Cataloger writes only, after explicit PO ratification surface |
| Notion Foundation Locks DB | Architect adds Locks directly | Cataloger writes only |
| Notion Open PO Decisions DB | Architect creates OD entries directly | Curator drafts OD entry → PO ratifies → Cataloger commits |
| Notion PO Inbox DB | PO writes observations; Architect/Curator pulls | Unchanged (PO surface) |
| Notion Documentation Gaps DB | Architect writes directly | Cataloger writes only |
| Airtable Build Tracker | Manus updates statuses | Unchanged (operational, not governance) |
| memory_user_edits | Architect writes "behaviors" / "rules" reactively | PO's surface only; Architect/Curator surfaces proposed rule changes via Curator + PO ratification flow |
| Repo `staging` branch via direct push | (would never happen) | Forbidden — Manus is the only commit agent per Operating Workflow §1 |

**Mechanism: WHO/WHAT enforces it**

| Enforcement layer | Who | What it does | When it activates |
|---|---|---|---|
| Role assignment at session boot | PO + session opener | Each session opens with explicit role: "You are operating as Architect" or "You are operating as Curator" or "You are operating as Cataloger" | Session start |
| Role-scoped tool access | MCP / tool runtime configuration | Architect role lacks Notion write tools; Curator role lacks Notion write tools; only Cataloger role has Notion DB write tools enabled | Tool invocation time (the write tool literally isn't available to non-Cataloger roles) |
| **NEW: Curator role specification** | Curator session opener | Curator authors governance drafts → PO ratifies → Cataloger commits (cannot self-commit) | Per role definition loaded at session start |
| **NEW: Cataloger role specification** | Cataloger session opener | Cataloger only commits to canonical state when PO has explicitly ratified the surface; no proactive cataloging | Per role definition loaded at session start |
| **NEW: Ops Architect role-boundary correction** | Per D80 Notion ratification + Curator audit | Ops Architect operates within Ops Glue scope only; does not write to VIYO product Decisions DB | Per role definition + Notion D80 standing constraint |
| Repo commit access | Manus only per Operating Workflow §1 | Architect / Curator / Reviewer / Kimi do not have repo write access — only Manus (VIYO repo) and Portal Manus (Portal repo) | At commit time |

**Addresses families:** 1, 6 (separating who can write canonical state from who is authoring drafts means a "continue past stop signal" attempt at canonical write fails at access layer)
**Does NOT address:** 2, 3, 5 (validation problems), 4 (role definition addresses but role enforcement won't fix Architect's disposition without §2 + §4 fixes also)
**Partially addresses:** 7 (memory_user_edits surface boundary removes one channel for reactive rule accumulation; doesn't fully fix because Curator can still over-accumulate governance rules)

### Category 4 — Session-Start Inheritance

**Definition:** Every agent loads role definition + current state + this catalog at session boot, automatically, before responding to the first task. Disposition is set by the substrate at session-start; the agent does not need to maintain discipline per-turn.

**Structural change today vs. target:**

Today (per current CLAUDE.md): agent expected to read 15 governance files at session start manually; relies on agent discipline to actually do the read; PO observes when read is skipped (Observations 12, 13).

Target: agent reads exactly 2 inheritance files (CLAUDE.md v2 + VIYO_CURRENT_MAP.md); inheritance files contain pointers to the canonical authorities + the current operational state + role-specific behavior catalog references. The 2 files are kept short enough that reading is the default, not a discipline.

**Mechanism: WHO/WHAT enforces it**

| Enforcement layer | Who | What it does | When it runs |
|---|---|---|---|
| Claude Code Desktop auto-load | Claude Code Desktop runtime | When session opens in this repo, Claude Code Desktop auto-loads `CLAUDE.md` from working folder (project-level memory) | Session start (every session) |
| **NEW: VIYO_CURRENT_MAP.md** | Phase 3.2 deliverable | Single inheritance file synthesizing current state + role definition + anti-pattern catalog pointer + foundational fix catalog pointer + open decisions + pending work; loaded by Claude Code Desktop + pasted at start of non-Claude-Code sessions | Session start (every session) |
| **NEW: SESSION_OPENER_TEMPLATE.md** | Phase 6 deliverable | Paste-ready brief for new Architect / new Curator / new Cataloger session that bootstraps inheritance without Claude Code Desktop auto-load | At new session open for non-Claude-Code agents (claude.ai chat) |
| **NEW: Role-specific behavior catalog (loaded by reference, not by text)** | Phase 2.3 ARCHITECT_OPERATING_RULES + Phase 2.4 NIR_OPERATING_RULES_v2 | Catalog of role behaviors that the agent reads at session start. Lives in repo for grep-ability. Inheritance file points to it. | Session start |
| **NEW: Pre-task source manifest per deliverable type** | Within ARCHITECT_OPERATING_RULES | For specific deliverable types (MVP scope memo, R-spec, Bullet directive), a mandatory pre-task source list specifies what to read before producing. Agent cites manifest completion in artifact preface. | At task acceptance |

**Addresses families:** 4 (disposition set by role definition at session start), 5 (mandatory pre-task source manifest catches "didn't read PRODUCT_ROADMAP before MVP scope"), 7 (rule changes route through Curator → PO → repo commit, not through memory_user_edits)
**Does NOT address:** 1 (sanction + topology), 2 (validation), 3 (validation), 6 (real-time)

---

### §3.5 — Anti-Pattern Variants surfaced 2026-05-15

Four anti-pattern variants surfaced during 2026-05-15 session work (Rule E lock, D85 ratification, Lock 22 graduation):

**a. Stale-citation-propagation chain (3-layer)** — variant of Family 1. Example: D63 K1=COPY case (Architect cited stale → Curator paste-back propagated → PO ratified the stale chain). Three governance layers all skipped grep-verifying the cited substrate against the Decisions DB. A3 Interpretation 2 unwittingly superseded D63. Resolution: Path α realign 2026-05-15 reaffirming D63; A3 I2 reversed to I1. Closes via Rule E grep-verify mandate.

**b. Arbiter adjacent-string blindness** — Arbiter flags stale citation in one location but doesn't grep same string across rest of touched file. X2.18/X2.20 example (timeline "12-17" fixed at line 67, missed at adjacent line 339 same file). Closes via Rule D strengthened mandate (stale-string sweep across all touched files for any flagged stale citation).

**c. Memory-citation (universal)** — agent cites from memory / inference / paraphrase / skim instead of grep-verifying canonical source. Forbidden across all agents (Architect / Curator / PO-side Claude / Arbiter / Adversary / Manus / Cataloger). Closes via Rule E (universal precondition resolving all stale-citation families at source).

**d. Capability-citation without verify** — subspecies of (c). Agent asserts "I don't have access to X tool" without verifying via tool_search with multiple keyword variants. Closes via Rule E applied to own tool access.

**External enforcement:** Rule E (locked in ARCHITECT_OPERATING_RULES §3) requires grep-verify against canonical source before propagating any citation. Rule D strengthened mandate (locked in same §3) requires Arbiter stale-string sweep across all touched files. Rule 3.10 (SESSION_STATE repo-canonical) closes the local-only-state subset that would otherwise propagate stale citations via uncommitted session memory. Together, Rules A/B/C/D/E + Rule 3.7-3.10 chain forms the universal anti-stale-citation discipline locked across all relay boundaries (PO ↔ PO-side Claude ↔ Curator ↔ Arbiter ↔ Adversary ↔ Manus ↔ Cataloger).

For full reasoning chains + concrete session examples see `SESSION_LEDGER_2026-05-15.md` in Drive working folder.

---

## Section 4 — Fix-to-Evidence Map

Each row: evidence point → which foundational fix addresses it → external enforcement mechanism.

| Evidence | Family | Primary fix | Secondary fix | External enforcement mechanism |
|---|---|---|---|---|
| Obs 1 — OD-020 silent write 02:41 | 1 | Topology Separation (Cataloger only writes Notion) | Schema (PR ratification trail) | Cataloger role has Notion DB write access; Architect/Curator do not. Cataloger refuses to commit without explicit PO ratification quoted from chat. |
| Obs 2 — Ops Architect D70-D82 silent writes | 1 | Topology Separation | — | Ops Architect role scope explicitly excludes VIYO product Decisions DB (per D80 already ratified); tool access enforces. |
| Obs 3 — D69 silent commit | 1 | Topology Separation | Schema (PR ratification trail) | Same as Obs 1. |
| Obs 4 — Behaviors #13-#16 to memory_user_edits | 1 + 7 | Topology Separation (memory_user_edits = PO surface) | Schema (forbidden-phrase audit on governance text) | Architect role lacks memory_user_edits write capability; rule change must route Architect → Curator → PO ratification → Cataloger commit. |
| Obs 5 — Lock 22 in R29 v2 draft body | 1 + 5 | Schema (Lock 21 Governance Agnosticism — Locks live in DB, not in spec bodies) | Topology (Cataloger only adds Locks) | Lock 21 self-validation skill rejects governance text in R-spec normative sections; Cataloger is the only role with Foundation Locks DB write access. |
| Obs 6 — R-Spec Audit Table v1.0..v1.4 unclear ratification | 1 + 7 | Schema (PR ratification trail) | Topology Separation | Versioned artifacts require ratification statement in commit message + PR body; CI rejects commits without "Ratified by PO: [quote]" trail. |
| Obs 7 — R23 v2 wrong R29 citations from memory | 2 + 5 | External Validation (citation resolvability check) | Schema (ZCBR ZC-2) | Validator skill greps repo for every cited file path / section; if not found, returns artifact to Architect before PO surface. |
| Obs 8 — R24 v2.1 placeholder stubs | 2 | External Validation (completeness pre-surface check) | Schema (forbidden placeholder phrases) | Validator skill greps artifact for forbidden phrases ("preserved verbatim", "content unchanged", "TBD" without ID) and returns to Architect before PO surface. |
| Obs 9 — R29 v2 duplicate stillborn drafts | 3 | External Validation (current-state pre-check) | — | Validator skill checks git log + Drive search + Notion search for the deliverable's intended name BEFORE Architect begins authoring; if found, refuses to author duplicate. |
| Obs 10 — "Should I read B-1.00 next?" | 4 + Subpattern 2.2 | Session-Start Inheritance (role definition) | — | Architect role definition (loaded at session start) states: investigation runs without PO ratification; reading repo files is Architect default. PO calibrates by rejecting permission-asks. |
| Obs 11 — Queue order not dependency analysis | 4 + Subpattern 2.2 | Session-Start Inheritance (pre-task source manifest) | External Validation (dependency check tool) | Bullet authoring deliverable type lists "dependency graph traversal" as mandatory pre-task input; Architect cites graph traversal in artifact preface; validator rejects if not cited. |
| Obs 12 — Conflated B-1.00 with Phase 1 | 5 + Subpattern 2.3 | Session-Start Inheritance (VIYO_CURRENT_MAP loads sub-phase definitions) | External Validation (citation resolvability) | VIYO_CURRENT_MAP explicitly states Phase 1 = 11 sub-phases per PRODUCT_ROADMAP; loaded at session start; scope memos cite sub-phase boundaries by name, validator checks. |
| Obs 13 — Didn't audit Notion Decisions DB before MVP scope | 5 + Subpattern 2.3 | Session-Start Inheritance (pre-task source manifest) | External Validation (DB sweep check) | MVP-scope deliverable type lists Notion Decisions DB sweep as mandatory pre-task input; artifact preface cites DB query + count; validator rejects if not cited. |
| Obs 14 — Continued past PO stop signal | 6 | Topology Separation (Cataloger can't commit non-ratified artifact even if Architect generates one) | Session-Start Inheritance (challenge-phrase recognition in role definition) | Cataloger refuses to commit any artifact lacking ratification surface — so even if Architect overrides a stop signal and produces a "fixed" artifact, the artifact does not land in canonical state without PO ratification. Real-time interrupt is harder to enforce externally; this is the partial fix. |
| Obs 15 — Reactive rule additions to memory_user_edits | 7 | Topology Separation (memory_user_edits = PO surface only) + Schema (Lock 21 forbids reactive rule text) | — | Rule changes route Architect → Curator (proposed text) → PO ratification (surfaced) → Cataloger (commits to ARCHITECT_OPERATING_RULES.md or NIR_OPERATING_RULES_v2.md). memory_user_edits is not a write target for any agent role except PO. |
| Subpattern 2.1 — Ratification as collaboration | (meta — Family 1, 2, 6, 14) | External Validation (completeness check) + Topology (Cataloger requires explicit ratification surface) | Session-Start Inheritance (Architect role definition: deliver-then-ratify, not collaborate-then-ratify) | Validator enforces "complete or don't surface"; Cataloger enforces "ratified or don't commit." Architect role definition sets disposition at session start. |
| Subpattern 2.2 — Investigation framed as permission request | (meta — Family 4) | Session-Start Inheritance (Architect role definition) | — | Architect role definition explicitly states investigation runs autonomously; loaded at session start; PO calibrates by rejecting permission-asks. |
| Subpattern 2.3 — Sources of truth as opt-in | (meta — Family 5) | Session-Start Inheritance (pre-task source manifest per deliverable type) | External Validation (mandatory citation check) | Each deliverable type has a mandatory source manifest; Architect cites manifest completion in preface; validator rejects artifacts without source citations. |
| CLAUDE.md #8 Sanction | (meta — Family 1 root) | Schema (forbidden-phrase audit on governance text) | Topology Separation (Cataloger only commits canonical state writes) | CLAUDE.md v2 (Phase 3.1) removes the sanction; CI lint rejects future CLAUDE.md edits that re-introduce sanction phrases. Topology fix means Architect couldn't write to Notion even if CLAUDE.md still said to. |

---

## Section 5 — Counter-Pattern: Why firing-point rules didn't fix this

Operating Workflow §8.5 contains 14 reactive Architect Operating Behaviors accumulated across the 2026-05-11 and 2026-05-12 sessions. Each Behavior targets a specific firing moment:

| Behavior | Firing moment | Catches manifestation of |
|---|---|---|
| #11 sub-rule 6 (read before cite) | At the moment of writing a citation | Family 5 (Obs 7, 12, 13) |
| #12 (one directive per turn) | Per-turn directive count check | Family 1 (Obs 4) |
| #13 (cross-phase input surfacing at session open) | Session opener | Family 5 (Obs 12, 13) |
| #14 (forward motion default posture) | Session opener strategic moment | Family 4 (Obs 10) |
| #15 (picks not asks) | Sequence-pick moments | Family 4 (Obs 10, 11) |

**Why they didn't fix the underlying problem** (ARCHITECT_SELF_AUDIT §3, paraphrased):

1. **Each rule is reactive at a single firing point.** Each catches its specific failure mode IF the Architect pauses at exactly that moment with the rule in mind. Six paragraphs of authoring without pausing means six chances for the disposition to express the failure regardless of how many rules sit in the catalog.

2. **The underlying disposition is not a firing moment.** When Architect sits down to author a spec, the question "am I in 'complete then surface' mode or 'partial then collaborate' mode?" doesn't get asked because no rule fires to make me ask it. The rules fire AFTER the wrong mode is already engaged, catching specific manifestations.

3. **Rule accumulation produces conflicts.** By Operating Workflow v1.2 end-of-day 2026-05-12, 14 Behaviors + 6 PO Communication Rules (A-F) + 13 NIR Rules + 21 Foundation Locks + 15 CODING_CONVENTIONS = ~70 rule statements an Architect is expected to apply per turn. Each turn the PO catches a new manifestation of the same disposition; Architect adds a new rule; the disposition continues; the next manifestation surfaces. This is the meta-pattern Observation 15 documents.

4. **PO observation (verbatim, 2026-05-12):** *"If we have conflicting instructions, the same issues will occur — Anything we do must be Foundational."*

**The foundational alternative:** the 4 fix categories above. None of them depend on Architect remembering to apply a rule at a firing moment. Each depends on a structural mechanism that runs independently of Architect discipline:

- External Validation runs whether Architect "thinks" the artifact is complete or not.
- Schema Enforcement runs whether Architect intends to violate or not.
- Agent Topology Separation means an Architect attempting to write to a forbidden surface gets a tool-access error, not a behavior-rule reminder.
- Session-Start Inheritance sets disposition at session boot; the Architect does not need to "remember" the disposition mid-turn because it's the substrate the session opened with.

---

## Section 6 — Operationalization across Phase 2.2 / 2.3 / 2.4

Each foundational fix lands in one or more of the next three Curator deliverables.

| Fix | Mechanism | Lands in |
|---|---|---|
| External Validation: ZCBR §5 Checkpoint 1/2/3 | Existing (Reviewer Claude + Kimi pre-flight) | Carries forward unchanged — referenced from FOUNDATION_LOCKS_v2 (Lock 20 + Lock 19) |
| External Validation: Completeness pre-surface check | Reviewer Claude scope extension OR new completeness-validator skill | Phase 2.3 ARCHITECT_OPERATING_RULES §("Surface Discipline") names the check; Phase 6 SESSION_OPENER_TEMPLATE references it |
| External Validation: Citation resolvability check | New skill — `citation-resolvability` (Tier 1 Builder Technical Skill) | Phase 2.3 ARCHITECT_OPERATING_RULES references; skill specification authored separately as Path E work (out of Curator scope, in Architect scope) |
| External Validation: Current-state pre-check | New skill — `current-state-check` (Tier 1 Builder Technical Skill) | Same as citation resolvability |
| Schema: ZCBR header (Lock 20) | Existing | FOUNDATION_LOCKS_v2 |
| Schema: Pattern Recipe (Lock 5) | Existing | FOUNDATION_LOCKS_v2 |
| Schema: Lock 21 self-validation | Existing skill (per Operating Workflow §8.5 final paragraph) | FOUNDATION_LOCKS_v2 |
| Schema: Governance text forbidden-phrase audit | New CI lint OR Lock 21 self-validation extension | FOUNDATION_LOCKS_v2 §Lock 21 extension; CLAUDE.md v2 explicit forbidden phrases section |
| Schema: PR ratification trail | New CI hook + PR template change | Phase 5.7 / 5.x (Curator does not author CI hooks; surfaces requirement to Manus directive) |
| Schema: Notion DB Phase Relevance required field | Already in schema (per Operating Workflow §6 — phase-relevance tagging live across 4 active DBs) | Reference in VIYO_CURRENT_MAP |
| Topology: Curator role specification | Already exists (this session) | Phase 2.3 ARCHITECT_OPERATING_RULES §(Role definitions) |
| Topology: Cataloger role specification | NEW — must be authored | Phase 2.3 ARCHITECT_OPERATING_RULES §(Role definitions) |
| Topology: Architect role (no canonical-state writes) | Refactor from NIR Rule 13 | Phase 2.3 ARCHITECT_OPERATING_RULES §1, derived foundationally per PO clarification 2 |
| Topology: Tool access scoping per role | MCP / tool runtime configuration | Phase 6 SESSION_OPENER_TEMPLATE specifies tool sets per role; per-role MCP config is operational, not governance — surfaced to PO for setup |
| Topology: memory_user_edits as PO-only surface | Universal NIR rule | Phase 2.4 NIR_OPERATING_RULES_v2 |
| Session-Start: VIYO_CURRENT_MAP.md | NEW | Phase 3.2 |
| Session-Start: CLAUDE.md v2 (sanction removed) | NEW | Phase 3.1 |
| Session-Start: SESSION_OPENER_TEMPLATE.md | NEW | Phase 6.1 |
| Session-Start: Role-specific behavior catalog reference | NEW | Phase 2.3 + 2.4 |
| Session-Start: Pre-task source manifest per deliverable type | NEW | Phase 2.3 ARCHITECT_OPERATING_RULES |

---

## Section 7 — Recommendations to PO

1. **Phase 2.2 (FOUNDATION_LOCKS_v2.md) authors next.** Schema enforcement layer (Locks 5, 19, 20, 21) lands here. Conflict A absorption mapping (per your clarification 1) surfaces explicit: Notion's tech-stack locks (R2-only / Next.js / TypeScript strict / Zod / RLS) absorb into CODING_CONVENTIONS Rules 11–14 OR a new Locks 30s "Stack Constraints" series. My recommendation in 2.2: absorb into CODING_CONVENTIONS Rules 11–14 (already implicit in current Rules + existing R-specs) rather than create a new Lock series — keeps the Lock taxonomy at product-architecture scope; surface the absorption mapping table explicitly so the Notion-DB entries can be marked SUPERSEDED with pointer to CODING_CONVENTIONS Rule X.

2. **Phase 2.3 (ARCHITECT_OPERATING_RULES.md) authors third.** Agent Topology Separation + Session-Start Inheritance layer lands here. Per your clarification 2: Rule 13 Architect role is DERIVED from Observations 10–11 (PM-style permission-asking) + Lock 17 (Foundation-First Decision Making) + Lock 18 (Tool-Capability-First Scoping) + failure families 4–7 — not ported from the 2026-05-12 reactive write. The derived role definition will state Architect as "authoritative voice on system design within scope," with the role's relationship to PO described as "brings recommendations with rationale; PO ratifies or redirects" — grounded in substrate (Lock 17 + Lock 18) rather than in last week's session.

3. **Phase 2.4 (NIR_OPERATING_RULES_v2.md) authors fourth.** Universal-agent principles. Carries forward NIR v1.1 Rules 1–12 substantively; Rule 13 (Architect role) demotes to ARCHITECT_OPERATING_RULES §1 since it's role-specific. NIR v2 = universal principles only (paragraph summary, make-the-call, one-ask-per-turn, reason-before-invoke, read-before-write, surface-uncertainty, surface-conflicts, principle-over-prescription, catalog-decisions, checkpoint, budget-honesty, hold-steady-accountability). Adds: memory_user_edits as PO-only surface (NEW Rule from topology fix).

4. **Phase 3.1 (CLAUDE.md v2) commits to repo.** Standing Instruction #8 sanction removed. New explicit text: "Architect drafts; Cataloger commits canonical state writes only after explicit PO ratification surface. memory_user_edits is PO's surface, not an Architect write target." Authority hierarchy simplified to single canonical version. Required reading list reduces from 15 files to 2 (CLAUDE.md v2 + VIYO_CURRENT_MAP.md).

5. **Phase 3.2 (VIYO_CURRENT_MAP.md) commits to repo.** Single inheritance file synthesizing current state + role definitions + this catalog reference + open decisions + pending work. Auto-loaded by Claude Code Desktop at session start. Pasted at start of non-Claude-Code sessions per SESSION_OPENER_TEMPLATE.

6. **External enforcement gaps surfaced to PO for operational decisions (out of Curator scope):**
   - Completeness pre-surface check skill — does PO want Reviewer Claude scope extended or a new validator skill authored?
   - Citation resolvability + current-state pre-check skills — author as Path E Builder Technical Skills?
   - Per-role MCP / tool access scoping — operational config change, surface in Phase 6 SESSION_OPENER_TEMPLATE for PO to apply per role at session boot?
   - Cataloger role assignment — when does PO want to formally split the Cataloger role from Architect? My recommendation: at Phase 3.2 ratification (so VIYO_CURRENT_MAP can document the boundary).

These six recommendations are Curator-call decisions per Rule 13. Phase 2.2 authors when this catalog is ratified.

---

## Section 8 — Closing

This catalog organizes the failure evidence into 7 disposition families, names 4 foundational fix categories with specific external enforcement mechanisms (WHO/WHAT, not which Architect rule), and maps every observation + subpattern + sanction to its primary + secondary fix with the enforcement layer that runs it.

The dominant failure family (Family 1, 6 of 15 observations) requires both a topology change (Cataloger split from Architect) and a governance text change (CLAUDE.md v2 removes sanction). Neither alone fixes Family 1; together they do.

The validation families (2, 3, 5) require external validation mechanisms (completeness pre-surface, citation resolvability, current-state pre-check) running before PO sees the artifact.

The disposition families (4, root) require session-start inheritance setting Architect role definition at boot.

The meta family (7) requires removing the reactive-rule channel (memory_user_edits = PO surface) and routing rule changes through Curator + PO ratification + Cataloger commit.

The real-time stop signal family (6) gets a partial fix: even if Architect overrides a stop signal mid-turn, Cataloger refuses to commit non-ratified artifacts, so the override doesn't land in canonical state.

**Phase 2.1 is complete pending PO ratification.**

After ratification, Phase 2.2 (FOUNDATION_LOCKS_v2) authors with the schema enforcement layer detailed here + Conflict A absorption mapping explicit per PO clarification 1.

---

*End of ANTI_PATTERN_CATALOG.md*
