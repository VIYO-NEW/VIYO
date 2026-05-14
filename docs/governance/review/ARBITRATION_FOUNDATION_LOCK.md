# ARBITRATION — FOUNDATION_LOCK.md
Arbitrated: 2026-05-14 · Arbiter
Against REVIEW dated: 2026-05-14

## Rulings

### Finding 1 — VALID
- REASONING: Self-evident content mismatch. Section 1 heading reads "The 21 Foundation Locks" while §Section 1 body contains Locks 1–21 + 30–37 + 38 = 30 Locks (28 ratified + 2 RESERVED). The heading was correct at first authoring but was not updated when Stack Constraints (2026-05-13) and Lock 38 (2026-05-14) appended. RULE A line 13 says "30 ratified Foundation Locks ... (1–21 + 30–37)" and references the Lock 38 addendum — the heading should follow.
- REQUIRED CHANGE: Section 1 heading reflects the actual Lock count and structure (numbered slots 1–21 + 30–37 + 38). Keep heading wording consistent with RULE A summary so navigation surfaces match.

### Finding 2 — ESCALATE
- REASONING: This is a substantive governance contradiction, not a mechanical correction. Lock 33 (Stripe-only payment processor) explicitly carves billing out of Lock 19 in its Rationale: "Provider Agnosticism (Lock 19) does not apply to billing." Lock 38 (Universal Service Agnosticism) explicitly names "**payment processors**" as an in-scope service class subject to runtime registry resolution. The two cannot both be true. Three possible resolutions, each with different product/scope implications:
  - (a) Lock 33 carve-out preserved with explicit Lock 38 exception clause for billing (Stripe stays committed vendor; Lock 38 scope narrowed)
  - (b) Lock 33 superseded by Lock 38 (payment processors registry-resolved; Lock 33 becomes obsolete or downgraded to "current launch-default")
  - (c) Lock 38 scope clarified to exempt Stack Constraints Locks 30–37 as committed-vendor infrastructure choices distinct from runtime-resolved external services
  Each resolution affects which external service classes are in scope for runtime resolution — that is a strategic decision about vendor flexibility vs. operational simplicity. Arbiter cannot mechanically pick; PO must decide.
- REQUIRED CHANGE: PO ratifies one of three paths (a), (b), or (c). Author then updates Lock 33, Lock 38, and (per Finding 4) writes the "Relationship to Stack Constraints" clause in Lock 38 reflecting the ratified resolution.

### Finding 3 — VALID
- REASONING: RULE A claims "30 ratified Foundation Locks" but Locks 15 and 16 carry "Reserved for future ratification" with Date Locked = N/A and Authority Source = N/A. By the file's own admission they are not ratified. Correct count: 28 ratified + 2 RESERVED = 30 numbered slots.
- REQUIRED CHANGE: RULE A line corrects the count claim. Either "28 ratified Foundation Locks + 2 RESERVED slots (Locks 15, 16) = 30 numbered Locks" or equivalent phrasing that distinguishes ratified from reserved.

### Finding 4 — VALID (contingent on Finding 2)
- REASONING: Lock 38 added a "Relationship to Lock 19" clause to disclose how it relates to a structurally related existing Lock. The same disclosure is owed to Stack Constraints Locks 30–37, which contain "X is the only permitted vendor" Statements that appear to contradict Lock 38's "swappable via registry configuration" universal rule (per Finding 2). Without the Relationship clause, Finding 2's ambiguity propagates to Locks 30, 31, 32, 34, 35, 36, 37 — not just 33.
- REQUIRED CHANGE: After Finding 2 PO resolution, Lock 38 adds "Relationship to Stack Constraints Locks 30–37" clause stating the decided relationship (parallel structure to existing Lock 19 clause).

### Finding 5 — VALID
- REASONING: CLAUDE.md §2 cross-references "canonical 12-tier statement lives in `/docs/governance/FOUNDATION_LOCK.md` §Authority hierarchy" but FOUNDATION_LOCK.md enumerates 11 items (lines 34–44). Lock 17 (Foundation-First Decision Making) requires upstream-vs-downstream alignment; this is exactly the kind of governance drift Lock 17 forbids. The mechanical fix is to update CLAUDE.md count to 11 (since FOUNDATION_LOCK.md authority hierarchy is canonical by its own clause); alternatively, if a tier is genuinely missing from FOUNDATION_LOCK, expand to 12. Either fix is mechanical once the count of tiers is settled.
- REQUIRED CHANGE: Reconcile the count. Default to "11" since FOUNDATION_LOCK is the canonical source; update CLAUDE.md §2 to match. If PO wants a different count, that's a separate decision flagged via Arbiter Addendum.

### Finding 6 — VALID
- REASONING: Lock 11 Evidence cites "OD-004 (12 fashion brand competitor selection)" but the Notion canonical OD-004 record (page ID `35c9a84a-4679-8177-baf1-ee824624d5a5`) is "R29 PAL Rewrite Scope (unified Plugin Registry per Lock 19 + Lock 38)." This is exactly the same stale-OD-label pattern flagged in SESSION_STATE.md for VIYO_CURRENT_MAP §10 (OD-003 stale "Atlas/fal.ai" label). ANTI_PATTERN_CATALOG Family 5 ("memory-based citations instead of canonical-source reads") — a Foundation Lock citing a stale OD label is the Family 5 pattern recurring.
- REQUIRED CHANGE: Update Lock 11 Evidence line — remove stale OD-004 reference. If the underlying "competitor selection" question still exists somewhere, replace with the current canonical pointer; otherwise drop the parenthetical.

### Finding 7 — VALID
- REASONING: §2.2 absorption mapping table Status column labels Notion Locks 1/2/3/6/7/8/11/13 destinations as "PROPOSED Stack Constraint Lock 30" through "37" — but §2.3 (line 611) records them as "RATIFIED 2026-05-13" and §Section 1 contains the ratified Lock entries. A reader of §2.2 alone would conclude these are pending; a reader of §Section 1 sees them ratified. Internal contradiction.
- REQUIRED CHANGE: Update §2.2 Status column entries from "PROPOSED" to "RATIFIED" for the 8 Stack Constraint absorption rows.

### Finding 8 — VALID
- REASONING: Decision 1 has "✅ RATIFIED 2026-05-13" marker. Decisions 2 (Locks 15/16 disposition), 3 (Authority Source for Locks 1–14), 4 (Notion archival policy) lack equivalent markers despite their substance being applied throughout the file body. The "PO action: Ratify..." trailing text contradicts the implementation evidence elsewhere in the file. The carry-forward in SESSION_STATE.md records all 4 decisions ratified.
- REQUIRED CHANGE: Add "✅ RATIFIED 2026-05-13" markers to Decisions 2, 3, 4 headings. Update or remove the trailing "PO action: Ratify..." text on those decisions.

### Finding 9 — VALID
- REASONING: Section 6 closes "**Phase 2.2 is complete pending PO ratification.**" — but RULE A summary, §2.3 status, §5 Decision 1 marker, and §Section 1 Lock 30–38 entries all record ratification has occurred. The closing line is from pre-ratification authoring; it was not updated when ratification landed.
- REQUIRED CHANGE: Update closing line to record current state ("Phase 2.2 complete and ratified 2026-05-13; Lock 38 addendum ratified 2026-05-14 with clarification SHA `397fd50`" or equivalent).

### Finding 10 — VALID
- REASONING: Method enumeration shows items 1, 2, 4, 5, 6, 7, 8, 9 — no item 3. Either an item was deleted without renumbering, or a typo. Minor but Lock 17 (Foundation-First) substrate: governance files should not carry visible authoring gaps.
- REQUIRED CHANGE: Either restore item 3 or renumber items 4–9 down to 3–8 to close the gap.

### Finding 11 — VALID
- REASONING: Authority hierarchy item 2 reads "V8 PRD (until V8.1 supersedes — Phase 4)" with Drive ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`. Phase 4 closed 2026-05-14 with PRD V8.1 committed at HEAD `d2bd8dc` to `/docs/PRD_V8.1.md`. The hierarchy text directs readers to V8 Drive ID as canonical when PRD V8.1 in repo is canonical. Lock 17 (Foundation-First) requires upstream authority text be correct; the FOUNDATION_LOCK authority hierarchy IS the upstream that downstream consumers read.
- REQUIRED CHANGE: Update hierarchy item 2 to reference PRD V8.1 at `/docs/PRD_V8.1.md` (committed `d2bd8dc`, 2026-05-14) as canonical product north star. V8 Drive ID downgraded to historical archive reference (or removed if redundant with PRD V8.1 file header's own Supersedes line).

### Finding 12 — VALID
- REASONING: H1 reads "# FOUNDATION_LOCKS_v2.md" (plural, _v2 suffix) but file is at `/docs/governance/FOUNDATION_LOCK.md` (singular, no suffix). The Supersedes line (line 5) confirms this file is the version that REPLACES the previous FOUNDATION_LOCK.md — but it commits to the same path it claims to supersede. The "_v2" in H1 is a working-draft naming artifact uncleaned at commit time.
- REQUIRED CHANGE: Change H1 from "# FOUNDATION_LOCKS_v2.md" to "# FOUNDATION_LOCK.md" to match the canonical file path.

### Finding 13 — VALID
- REASONING: Lock 11 Statement names "Milled (milled.com)" — a specific external URL. Lock 21 compliance test (line 410): "Read any governance text. Ask: 'Does this name a specific file, path, step number, tag, schema field, or implementation pattern?' If yes, the text fails Lock 21." Lock 21 edge case (line 412) carves out specifics only when "there is genuinely one correct implementation"; Lock 11's own Statement names MULTIPLE competitor archive sites (milled.com canonical + Email Love + Really Good Emails expansion), so by the Lock's own admission milled.com is NOT the singular correct implementation — it's the launch-default selection. The capability statement ("competitor email archive sites") is the Lock-21-compliant phrasing; specific URLs belong in operational specs (R-spec or Bullet directive).
- REQUIRED CHANGE: Rewrite Lock 11 Statement to express the capability (Pattern Seeding from competitor email archives, the pipeline shape, the qaScore initialization, the source_type tag); move the milled.com / Email Love / Really Good Emails launch-default + expansion-candidate specifics to the relevant R-spec (R29 PAL Plugin Registry catalog entries) or to Master Build Sequence Bullet detail. Lock 11 retains the capability + lifecycle + dependency on OD-002; specific URLs leave the governance surface.

## Arbiter Addendum

The following observations were not raised by Adversary but are flagged for PO attention — they are NOT auto-added to the Author's fix list:

1. **Lock 7 (3-Tier Provider Strategy)** has the same Lock 21 specificity pattern as Lock 11 (Finding 13). Lock 7 Statement names "Atlas Cloud + fal.ai peers route NanoBanana 2 Pro + Flux 1.1 Pro + Seedream" — multiple specific providers and specific model names in a Foundation Lock Statement. The capability statement ("3-tier provider strategy: aggregator routing → frontier-direct on complexity escalation → self-hosted at scale threshold") would suffice; specific providers + models belong in R29 PAL Plugin Registry (per Lock 19 / Lock 38). PO may want to address as a batch with Finding 13.

2. **Lock 9 (Implicit RLHF + Tinder Swipe Gate)** names specific operational thresholds: "50% of auto-approved sampled, 20% of auto-rejected sampled. ... After 5,000 swipe decisions, ... Phase 4 acceptance threshold: 1,000 accumulated RLHF events." These are calibration choices, not architectural commitments. They may belong in VVOW §12 (which the Lock cites) rather than in the Lock Statement. Same Lock 21 pattern as Finding 13 / Addendum item 1.

3. **Lock 12 (Brain Council Scope)** names 6 specific platform agents: "VeriClaw / Flow Strategy / SMS Copywriter / ATLAS Top Brain / Smart Insight Engine / Contextual AI Advisor." Same Lock 21 specificity pattern. Capability statement ("13-Agent Roster = 7-Brain Council + 6 platform-specific agents per FOUNDATION_AUTHORITY substrate L4") would suffice.

4. **Lock 33 Rationale line** explicitly says "Provider Agnosticism (Lock 19) does not apply to billing." This carve-out is the substrate of Finding 2's Lock 33-vs-Lock 38 contradiction. Whichever resolution PO picks for Finding 2, Lock 33's Rationale needs corresponding update (currently it asserts a Lock 19 carve-out that Lock 38 either preserves, extends, or removes).

5. **VIYO_CURRENT_MAP §10 OD label reconciliation** is already a Phase 5.3 cleanup flag in SESSION_STATE.md. Finding 6 surfaces the same anti-pattern in FOUNDATION_LOCK.md (Lock 11 stale OD-004 citation). PO may want to expand the Phase 5.3 flag to cover all governance files with OD citations, not just VIYO_CURRENT_MAP. Suggested scope: grep `/docs/governance/` for `OD-` references, reconcile each against Notion canonical Open PO Decisions DB titles.

These five Addendum items consolidate the Lock 21 specificity tension (Findings 13 + Addendum 1, 2, 3), the substrate of Finding 2 (Addendum 4), and the broader anti-pattern recurrence pattern of Finding 6 (Addendum 5). PO ratification required before any enter the Author's fix list.

## Disposition

- **VALID findings:** 12 (Findings 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13) — Author applies after ratification
- **INVALID findings:** 0 — no action
- **ESCALATE findings:** 1 (Finding 2) — PO decision required before Author proceeds; Finding 4 (VALID) is contingent on this ESCALATE resolution
- **Arbiter Addendum items:** 5 — PO ratification surface required to add to Author's fix list

**Author proceeds with:** the 11 unambiguous VALID findings (1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13). Finding 4 awaits Finding 2 resolution. Finding 2 awaits PO selection from (a) / (b) / (c). Addendum items 1–5 await PO surface.

**Note:** Per Author Charter, fixes apply ONLY to the VALID findings and only after the deliverable revision is itself reviewed via the same Author → Adversary → Arbiter loop. This is a test of the loop mechanics on FOUNDATION_LOCK.md — fixes are NOT being applied in this test run.
