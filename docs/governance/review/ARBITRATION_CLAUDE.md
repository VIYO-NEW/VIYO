# ARBITRATION — CLAUDE.md (VIYO Project Entry Point)
Arbitrated: 2026-05-14 · Arbiter
Against REVIEW dated: 2026-05-14

Deliverable arbitrated at: `C:\Users\Admin\Documents\VIYO\repo\docs\governance\CLAUDE.md` at HEAD `ac17cd5` (CLAUDE.md unchanged since `92dc4b8`).
Spec applied: Deliverable's own declared structure per Adversary charter input-fallback clause (VIYO_PATH_TO_MVP.md §Step 5 lives on Drive, not loaded). Lock 21 and authority-hierarchy cross-references verified directly against `FOUNDATION_LOCK.md`. Adversary's ANTI_PATTERN_CATALOG.md citation verified directly against that file.

---

## Rulings

### Finding 1 — VALID

- REASONING: Verified. `FOUNDATION_LOCK.md` §"Authority hierarchy" (lines 30–46) contains exactly 11 numbered tiers (1. PO decisions → 11. Existing code), and grep across the whole file returns zero matches for "12-tier" or "12 tier." The section's own header explicitly resolves a "prior 7-tier vs 9-tier disagreement" and lists 11 items — there is no canonical "12-tier" statement anywhere in the cited target. CLAUDE.md asserts "12-tier" twice (header paragraph on line 6 and §2 last paragraph on line 33). The pointer's stated Lock 21 justification ("eliminating drift via no duplication") is undermined by the act of pointing with a wrong count: a reader who trusts CLAUDE.md and never opens FOUNDATION_LOCK.md carries a wrong count forward, exactly the drift the pointer was meant to prevent. Mechanical factual error in a cross-reference.
- REQUIRED CHANGE: Both occurrences of "12-tier" in CLAUDE.md must be corrected to match the actual tier count in `FOUNDATION_LOCK.md` §"Authority hierarchy" at time of fix. Author should re-verify the count by reading FOUNDATION_LOCK.md directly rather than carrying any other number from memory. Consider whether stating the count at all serves the capability — Lock 21 spirit suggests "canonical authority-hierarchy statement lives in `FOUNDATION_LOCK.md` §Authority hierarchy" without a tier count is the safer capability-only phrasing (avoids re-creating the same drift surface on the next tier change).

### Finding 2 — VALID

- REASONING: §2 row 2 conditions ARCHITECT_OPERATING_RULES.md loading on "When Architect role active." §6 step 2 directs "Read inheritance. Load §2 files in order" without acknowledging row 2's conditional. The other three rows mark "ALWAYS" / "ALWAYS first" and §6 step 2 is consistent with them; only row 2 is in conflict with §6 step 2's unconditional sequencing. The Adversary's secondary point (step 2 may run before PO confirms role from step 1) is weaker — step 1 surfaces the role assumption to PO and the file does not strictly require waiting for PO response before step 2 — but the primary point stands: the file does not resolve whether non-Architect sessions load file 2 or skip it. Internal contradiction in a file whose declared purpose is session-start entry point.
- REQUIRED CHANGE: Resolve the inconsistency. Either (a) §2 row 2 changes to "ALWAYS" matching the other rows, with rationale that role definitions are reference material loaded regardless of active role; or (b) §6 step 2 adds an explicit clause respecting the "When to load" column conditionals (i.e., load only files whose conditions match the session's confirmed role + always-load rows). Author's choice between (a) and (b) — both resolve the contradiction; the file must pick one and apply it consistently.

### Finding 3 — VALID

- REASONING: Verified. CLAUDE.md §4 first bullet reads "Lead with RULE A 1-paragraph summary at the top of every response" and uses "RULE A" as a proper-noun reference. CLAUDE.md never defines "RULE A" inline. The §4 closing pointers name NIR_OPERATING_RULES.md (9 numbered Rules 1–9) and ARCHITECT_OPERATING_RULES.md §4 (5 rules) — neither contains a "RULE A" label by that name. The "RULE A — Paragraph summary" convention does appear in `FOUNDATION_LOCK.md` line 11 and `ANTI_PATTERN_CATALOG.md` line 10 as a self-imposed authoring pattern in those files, but CLAUDE.md does not pointer there for the definition and CLAUDE.md itself does not lead with a "RULE A — Paragraph summary" section. A new reader following only CLAUDE.md's cross-references cannot resolve the term. Resolvability failure for a load-bearing reference in the session-start entry-point file.
- REQUIRED CHANGE: Make "RULE A" resolvable from CLAUDE.md. Options: (a) drop the proper-noun framing and state the capability directly ("Lead with a 1-paragraph summary at the top of every response"); (b) keep the named convention but define it inline or pointer to its canonical definition; (c) restructure CLAUDE.md to itself open with a "RULE A — Paragraph summary" block matching the convention used in FOUNDATION_LOCK.md and ANTI_PATTERN_CATALOG.md. Author's choice — the requirement is that a competent reader can resolve the term from inside CLAUDE.md or its cited pointers.

### Finding 4 — VALID

- REASONING: Lock 21 ruling (Arbiter tie-breaker per ARBITER_CHARTER.md). The §3 Role Context "Decision Cataloger" row cites "ARCHITECT_OPERATING_RULES §7 Decision 1" — specific section number + specific decision-item number. Lock 21 Test ("Does this name a specific... step number?") triggers. The Adversary asked the right question: does the edge case apply ("genuinely one correct implementation")? My ruling: NO, the edge case does not apply here. Two grounds: (a) the cited target is a decision item with a number; if ARCHITECT_OPERATING_RULES renumbers or reorders §7 or its decision list, this citation breaks silently — that is precisely the brittleness Lock 21 is designed to prevent in cross-file pointers. (b) The capability is "Decision Cataloger formal role is activated by a ratified decision in ARCHITECT_OPERATING_RULES" — a competent reader can locate the activating decision in the cited file without needing CLAUDE.md to name §7 or Decision 1. The state-observation exclusion does NOT cover this because the citation is not an observation of historical state (like a PR number or commit SHA) — it is a forward-facing pointer into governance text that future agents must resolve. Forward-facing governance pointers are exactly the surface Lock 21 governs. VALID.
- REQUIRED CHANGE: Rewrite the "When active" cell for Decision Cataloger to state the capability without specific section + decision-item numbers. Acceptable shape: "formal role activated by ratified decision in ARCHITECT_OPERATING_RULES" or equivalent capability statement. The activating-decision detail belongs in ARCHITECT_OPERATING_RULES (its own canonical surface), not duplicated by specific number in CLAUDE.md.

### Finding 5 — VALID

- REASONING: Lock 21 ruling (Arbiter tie-breaker). §2 row 2 Purpose cell bakes three structural counts ("§1 8 properties," "§3 6 rules," "§4 5 rules") plus five specific section numbers into a description of an external file. The Lock 21 edge-case test ("would a competent agent in this role plausibly choose differently?") clearly fails — the counts and section numbers are not single-valued implementation truths; they are mutable structural attributes of another file that will silently desynchronize on any normal edit to ARCHITECT_OPERATING_RULES. The capability is "load this file when Architect role active; it covers role definition + decision authority + operating discipline + communication discipline + agent topology boundaries." Section numbers and item counts add no capability value to the load instruction and do add a hard drift surface. Stronger Lock 21 violation than Finding 4 because the §3.4 / §7 type citations could at least claim state-observation cover (they reference one specific historical decision); structural counts have no such cover. VALID.
- REQUIRED CHANGE: Strip the structural counts ("8 properties," "6 rules," "5 rules") and the specific section numbers from the Purpose cell. Retain the named capability areas (role definition / decision authority / operating discipline / communication discipline / agent topology boundaries) as the capability statement. See Addendum below — the same pattern recurs in §2 rows 1, 3, 4; Adversary surfaced only row 2, so Author's fix list per this finding is row 2 only.

### Finding 6 — INVALID

- REASONING: Adversary misread the pointer's grammar. CLAUDE.md §5 final line says "For all 7 families with external enforcement mechanisms (WHO/WHAT enforces each fix), read ANTI_PATTERN_CATALOG.md §3 + §4." The phrase "7 families WITH external enforcement mechanisms" describes the destination content (families together with their enforcement), not the 7-family taxonomy proper. Verified directly against ANTI_PATTERN_CATALOG.md: §3 is the External Enforcement WHO/WHAT taxonomy and every Category's "Addresses families: X" line ties enforcement back to family numbers; §4 is the per-evidence Fix-to-Evidence Map with a Family column on every row. A reader following the pointer to learn "families WITH external enforcement" finds exactly that content in §3 + §4. It is true that the 7-family classification table proper lives in §2 and the evidence inventory in §1.1 — a reader looking for ONLY the taxonomy without enforcement would be mis-pointed — but that is not what CLAUDE.md's pointer text advertises. The pointer resolves correctly to the advertised content.
- REQUIRED CHANGE: None.

### Finding 7 — INVALID

- REASONING: Adversary's premise is that CLAUDE.md requires a top-of-file version field for v2 identity to be unambiguous. The deliverable's own declared structure (the spec via fallback clause) does not require a version field. Version identity is already established on line 4 ("Authored: 2026-05-13 by VIYO Project Curator. Phase 3.2 deliverable per VIYO_PATH_TO_MVP.md §Step 5") and line 5 ("Supersedes: prior /docs/governance/CLAUDE.md..."), and is reinforced by inline "CLAUDE.md v2" mentions in §3, §5, and the footer. The H1 title (`# CLAUDE.md — VIYO Project Entry Point`) is the canonical filename + role title; "v2" is the revision generation, not part of the title. A reader loading this file via Claude Code Desktop auto-load encounters the "Authored / Supersedes" paragraph within the first 100 characters and can immediately determine this is a successor file. Severity-Green stylistic preference, not a spec violation or substrate failure.
- REQUIRED CHANGE: None.

---

## Arbiter Addendum

**Non-trivial.** Per ARBITER_CHARTER.md §"Arbiter Addendum," a non-trivial Addendum triggers a re-run of the Adversary pass; this Addendum exceeds the trivial threshold.

Findings 4 and 5 surfaced Lock 21 specificity violations in two specific spots (§3 Decision Cataloger row; §2 row 2 Purpose). The same Lock 21 specificity pattern recurs throughout CLAUDE.md in spots the Adversary did not enumerate. A non-exhaustive list of additional candidate Lock 21 violations the Author should sweep for as part of the re-run, or the next Adversary should re-pass to triage:

1. **§2 row 1 Purpose cell** — enumerates "15 sections" in VIYO_CURRENT_MAP.md by name ("identity / MVP / vision / tech stack / domains / platforms / agent topology / Image Studio / current state / pending work / governance pointers / anti-patterns / ratified state / communication / maintenance"). Same structural-count + enumeration pattern as Finding 5, applied to row 1 instead of row 2.

2. **§2 row 4 Purpose cell** — "7 failure families + 15 observations + 3 subpatterns + 1 governance sanction + 4-category fix framework with external enforcement." Four counts baked into the cell describing an external file's structure. Same Finding-5 pattern.

3. **§3 Role Context table "Inheritance load beyond §2" column** — multiple cells cite specific external-file section numbers (e.g., "ARCHITECT_OPERATING_RULES §2 (Decision Authority Matrix) + §5 (Agent Topology Boundaries)"). Same Finding-4 pattern of specific section-number citations to another file.

4. **§5 Top 1 final paragraph** — "Architect performs canonical writes only with explicit per-write PO ratification per ARCHITECT_OPERATING_RULES §3.4 edge case." Specific section-and-edge-case citation to another file. Same Finding-4 pattern.

5. **§6 step 2** — bracketed pointers "[from VIYO_CURRENT_MAP §9]" and "[from VIYO_CURRENT_MAP §10]." Specific section-number citations to another file. Same Finding-4 pattern.

6. **§5 anti-pattern callouts** — references like "ANTI_PATTERN_CATALOG §1.3" and "Family 1, 6 of 15 observations" and "Family 4." Section + family + count specifics. Same Lock 21 surface as Finding 4/5.

**Why non-trivial:** Findings 4 and 5 are not isolated edge cases; they are representative samples of a pattern that runs through the whole file. An Author applying only Findings 4 and 5 would fix two spots while leaving five+ structurally identical spots in place. The Adversary correctly identified the pattern type but did not sweep for instances — this is the substrate-grounded gap that isolated-mode is designed to surface on the re-run.

**Recommended PO disposition per charter:** Direct a re-run of the Adversary pass on CLAUDE.md (fresh isolated Adversary session) with the gap pattern in mind (Lock 21 specificity sweep across all section-number citations + structural counts), without exposing the Addendum content to the Adversary. If the re-run surfaces the additional instances, they enter the Author fix list via the re-run's Arbiter ruling. If the re-run does not surface them, PO decides whether to direct the Author to apply the Addendum items as a separate ratification surface.

---

## Disposition

- VALID findings: 5 — Author applies (Findings 1, 2, 3, 4, 5)
- INVALID findings: 2 — no action (Findings 6, 7)
- ESCALATE findings: 0 — no PO decision required on Adversary findings

**Loop-quality signal:** Addendum is **non-trivial**; per ARBITER_CHARTER.md, this signals an Adversary re-run before the Author applies fixes, so the re-run's Arbiter ruling can fold any additional Lock 21 specificity findings into the same fix pass. PO calls the threshold and directs the re-run.
