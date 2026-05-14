# REVIEW — CLAUDE.md (VIYO Project Entry Point)
Reviewed: 2026-05-14 · Adversary
Deliverable reviewed at: `C:\Users\Admin\Documents\VIYO\repo\docs\governance\CLAUDE.md` at HEAD `ac17cd5` (CLAUDE.md unchanged since `92dc4b8`)
Spec measured against: Deliverable's own declared structure (per Adversary charter input-fallback clause — VIYO_PATH_TO_MVP.md §Step 5 lives on Drive and is not loaded). Cross-references checked against `FOUNDATION_LOCK.md` and `ANTI_PATTERN_CATALOG.md` (the two governance files CLAUDE.md cites by content).

## Findings

### Finding 1
- LOCATION: Header paragraph "Supersedes:" sentence; §2 "Authority hierarchy:" paragraph (last paragraph of §2).
- FINDING: CLAUDE.md states twice that the canonical authority hierarchy in `FOUNDATION_LOCK.md` §Authority hierarchy is a "12-tier" statement. The actual hierarchy in `FOUNDATION_LOCK.md` lines 34–44 contains exactly 11 numbered tiers (1. PO decisions → 11. Existing code). `FOUNDATION_LOCK.md` itself never labels the hierarchy "12-tier" anywhere (grep returns zero matches for "12-tier" or "12 tier"); the section header explicitly resolves a "prior 7-tier vs 9-tier disagreement" and lists 11 items.
- REASONING: This is a verifiable factual error in a cross-reference. The whole point of pointer-only authority-hierarchy treatment (per the same paragraph's Lock 21 justification) is to eliminate drift. Stating an incorrect tier count in the act of pointing to the canonical source reintroduces the drift the pointer was meant to prevent. A reader who trusts CLAUDE.md's count and never opens `FOUNDATION_LOCK.md` carries a wrong count forward.
- SEVERITY: Red

### Finding 2
- LOCATION: §2 Auto-Load Reading List table, row 2 ("ARCHITECT_OPERATING_RULES.md"), "When to load" column vs. §6 First Action step 2.
- FINDING: §2 row 2 conditions loading of ARCHITECT_OPERATING_RULES.md on "When Architect role active." §6 step 2 then unconditionally directs the agent to "Read inheritance. Load §2 files in order" at every new session, before role confirmation step 1 has surfaced any role response from PO — but §6 step 1 is "Confirm role" via "Surface to PO" and §6 step 4 says "Do not author / commit / dispatch directives before ratification of first task." The session-open sequence therefore requires loading file 2 before the agent knows whether it is in the Architect role, contradicting the row-2 conditional. The other two "ALWAYS" rows (NIR, ANTI_PATTERN_CATALOG) and row 1 ("ALWAYS first") are consistent with §6; only row 2 is in conflict.
- REASONING: Internal contradiction between §2 and §6 of the same deliverable. The deliverable's declared purpose is to be the session-start entry point; ambiguity at the load-order step undermines that purpose. Either the row-2 conditional is wrong or §6 step 2 is wrong — the file does not resolve which.
- SEVERITY: Yellow

### Finding 3
- LOCATION: §4 Communication, first bullet ("Lead with RULE A 1-paragraph summary at the top of every response.").
- FINDING: The term "RULE A" is used as a load-bearing reference but is nowhere defined or expanded inside CLAUDE.md. The §4 closing pointer says "For full universal rule set: NIR_OPERATING_RULES.md (9 rules)" and "For Architect-specific application: ARCHITECT_OPERATING_RULES.md §4 (5 rules)" — neither has a "RULE A" name (NIR uses numbered Rules 1–9; ARCHITECT_OPERATING_RULES §4 has 5 rules). A new reader cannot resolve "RULE A" from within CLAUDE.md or from the named pointers as described.
- REASONING: The deliverable claims to be the session-start entry point that loads the 4 inheritance files. An undefined acronym in §4 fails the "describe the capability needed" Lock 21 spirit (the capability is "lead with a paragraph summary") and additionally fails on resolvability: a reader cannot trace "RULE A" to its definition using only the cross-references CLAUDE.md provides.
- SEVERITY: Yellow

### Finding 4
- LOCATION: §3 Role Context table, "Decision Cataloger" row, "When active" column.
- FINDING: The row states the Decision Cataloger role is "formal role active as of CLAUDE.md v2 commit moment per ARCHITECT_OPERATING_RULES §7 Decision 1." This is a self-activation claim (the file activates a role at the moment of its own commit) coupled with a specific external citation (`ARCHITECT_OPERATING_RULES §7 Decision 1`). The cited target is not among the 4 input files this review is permitted to read, so the citation's resolvability cannot be verified from inside this review.
- REASONING: Two issues co-occur: (a) Self-activation of a governance role inside a non-Locks file is structurally unusual — Lock activation per FOUNDATION_LOCK.md §Authority hierarchy tier 3 belongs in FOUNDATION_LOCK.md, not in CLAUDE.md. (b) The brittle citation to `§7 Decision 1` in another file (specific section + specific decision number) is the exact specificity pattern Lock 21 (FOUNDATION_LOCK.md §Lock 21) cautions against in governance text — names a specific step/decision number rather than the capability. Lock 21 edge-case clause permits naming specifics "when the implementing agent has no judgment to apply" — judgment call whether one specific Decision number qualifies. Surfacing for Arbiter ruling per Adversary charter Lock 21 specificity protocol.
- SEVERITY: Yellow

### Finding 5
- LOCATION: §2 Auto-Load Reading List, row 2 "Purpose" column.
- FINDING: The Purpose cell enumerates ARCHITECT_OPERATING_RULES.md by specific structural counts: "Role definition (§1 8 properties) + Decision Authority Matrix (§2) + Operating Discipline (§3 6 rules) + Communication Discipline (§4 5 rules) + Agent Topology Boundaries (§5)." Five specific section numbers + three specific item counts (8 properties, 6 rules, 5 rules) are baked into CLAUDE.md as load-bearing description of an external file.
- REASONING: Per Lock 21 (FOUNDATION_LOCK.md §Lock 21) Scope clause, "Architect-authored governance documents (CLAUDE.md, FOUNDATION_LOCK.md, ...)" must "describe what the system or agent must be capable of, not how the capability must be implemented" and "does NOT name specific... step numbers." Specifying that §1 has 8 properties, §3 has 6 rules, §4 has 5 rules is the exact specificity pattern the lock forbids: any future edit to ARCHITECT_OPERATING_RULES that adds a property or rule will silently make CLAUDE.md's count wrong. Edge case test: a competent reader could plausibly access ARCHITECT_OPERATING_RULES without these counts (the file is in their reading list); the counts are not required for the capability ("load this file when this role is active"). Surfacing for Arbiter ruling per Adversary charter Lock 21 specificity protocol.
- SEVERITY: Yellow

### Finding 6
- LOCATION: §5 "What NOT to do," final paragraph: "For all 7 families with external enforcement mechanisms (WHO/WHAT enforces each fix), read ANTI_PATTERN_CATALOG.md §3 + §4."
- FINDING: The 7 failure families themselves live in `ANTI_PATTERN_CATALOG.md` §2 (Failure-Mode Taxonomy table) and are evidenced in §1.1, not in §3 or §4. §3 contains the 4 foundational fix categories with their WHO/WHAT enforcement; §4 is the fix-to-evidence map. CLAUDE.md's pointer therefore directs a reader looking for "7 families" to sections that do not contain the 7-family taxonomy — only the fixes mapped to them.
- REASONING: The pointer is partially correct (§3 + §4 do contain external enforcement detail) but mis-locates the 7 families. A reader following the pointer to learn the families finds the fix taxonomy instead, and must search elsewhere in `ANTI_PATTERN_CATALOG.md` to find the families. The mis-pointing is a small precision failure in a file whose self-declared role is "entry point" — its pointers must resolve correctly to the content they advertise.
- SEVERITY: Green

### Finding 7
- LOCATION: §5 Top 1, sentence "The pre-2026-05-13 instruction sanctioning 'proactive cataloging without being reminded' is removed by this CLAUDE.md v2."
- FINDING: This claim is testable against the deliverable's own header, which says "Supersedes: prior `/docs/governance/CLAUDE.md` (15-file reading list, 9-tier authority hierarchy in-text, Standing Instruction #8 cataloging sanction)." The header attributes removal to "this CLAUDE.md v2," but the file nowhere identifies itself as "v2" in its title (`# CLAUDE.md — VIYO Project Entry Point`) — only the footer "End of CLAUDE.md v2." and inline references mention v2. There is no version field at the top of the file.
- REASONING: A file that supersedes another by claiming "v2" status should make its own version explicit and discoverable at the top. The current file relies on the reader inferring "v2" from the footer or from a prose mention in §5. For a file whose declared purpose is the session-start entry point loaded by Claude Code Desktop auto-load, version identification should be unambiguous from the first lines.
- SEVERITY: Green

## Summary

1 Red, 4 Yellow, 2 Green.
