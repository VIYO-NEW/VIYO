# REVIEW — FOUNDATION_LOCK.md
Reviewed: 2026-05-14 · Adversary
Deliverable reviewed at: `/docs/governance/FOUNDATION_LOCK.md` (file last modified 2026-05-14 11:10 per filesystem; HEAD `397fd50` post Lock 38 clarification commit)
Spec measured against: declared 8-field canonical Lock format (Number / Title / Statement / Scope / Rationale / Evidence / Date Locked / Authority Source) per Section 1 line 52; Lock 21 Governance Agnosticism compliance test per Lock 21 own clauses; ANTI_PATTERN_CATALOG §3 schema-enforcement category

## Findings

### Finding 1
- LOCATION: Section 1 heading, line 50
- FINDING: Section heading reads "Section 1 — The 21 Foundation Locks" but the section actually contains 30 Locks (1–21 including 2 RESERVED + 30–37 Stack Constraints + 38 Universal Service Agnosticism).
- REASONING: Self-evident content mismatch. The heading was correct at original authoring (21 Locks) but was not updated when Stack Constraints (Locks 30–37) and Lock 38 were appended. A reader navigating from the table of contents to Section 1 sees a count that contradicts the file's own RULE A summary ("30 ratified Foundation Locks") and §Section 1 content.
- SEVERITY: Red

### Finding 2
- LOCATION: Lock 33 (lines 477–489) vs Lock 38 (lines 557–573)
- FINDING: Internal contradiction. Lock 33 Statement: "Stripe is the only permitted payment processor. No Paddle, no LemonSqueezy, no Braintree, no PayPal." Lock 33 Rationale further states: "Provider Agnosticism (Lock 19) does not apply to billing — application layer cares about billing semantics, not provider abstraction." Lock 38 Statement: "...payment processors...is resolved at runtime through a provider registry. Any service in any class is swappable via registry configuration without a code change or a governance revision." Lock 38 explicitly names payment processors as an in-scope service class.
- REASONING: The two Locks cannot both be true simultaneously. Lock 33 carves out payment processors as exempt from registry-resolution (predating Lock 38); Lock 38 closes that carve-out. Lock 38's "Relationship to Lock 19" clause explicitly addresses how Lock 38 relates to Lock 19, but no equivalent clause addresses how Lock 38 relates to Lock 33 (or to the other Stack Constraints "X only" Locks 30–32 + 34–37). A future Architect reading Lock 33 in isolation would conclude Stripe-only is the policy; reading Lock 38 in isolation would conclude payment-processor swappability is the policy.
- SEVERITY: Red

### Finding 3
- LOCATION: RULE A paragraph, line 13
- FINDING: Claims "30 ratified Foundation Locks" but Locks 15 and 16 carry Statement "Reserved for future ratification" with Date Locked field "N/A" and Authority Source "N/A" — by the file's own admission these two Locks are explicitly NOT ratified.
- REASONING: Numerical count miscount. The correct breakdown is 28 ratified Locks (1–14 + 17–21 + 30–38) + 2 RESERVED slots (15, 16) = 30 numbered slots. The paragraph conflates "numbered slots" with "ratified Locks."
- SEVERITY: Yellow

### Finding 4
- LOCATION: Lock 38, lines 565–566 (Relationship to Lock 19 clause)
- FINDING: Lock 38 names its relationship to Lock 19 but is silent on its relationship to Stack Constraints Locks 30–37, which contain "X is the only permitted vendor" statements that appear to be in tension with Lock 38's "swappable via registry configuration" universal rule.
- REASONING: The 8-field canonical format does not require a Relationship field; however, since Lock 38 elected to add one for Lock 19, the same disclosure is owed to the structurally parallel Stack Constraints Locks. Without it, Finding 2 (Lock 33 contradiction) is unresolved and the same ambiguity propagates to Locks 30, 31, 32, 34, 35, 36, 37.
- SEVERITY: Yellow

### Finding 5
- LOCATION: Authority hierarchy section (lines 30–46) vs CLAUDE.md §2 cross-reference
- FINDING: CLAUDE.md §2 states "canonical 12-tier statement lives in `/docs/governance/FOUNDATION_LOCK.md` §Authority hierarchy" — but the Authority hierarchy in this file enumerates 11 items (lines 34–44), not 12.
- REASONING: Either the hierarchy is missing a tier (count error in this file) or CLAUDE.md cross-reference is wrong (count error in CLAUDE.md). Either way, a reader following the CLAUDE.md pointer is misled. Lock 17 (Foundation-First Decision Making) requires the upstream authority text be correct; "12-tier" cited downstream when the upstream has 11 tiers is patch-work governance drift of the kind Lock 17 forbids.
- SEVERITY: Yellow

### Finding 6
- LOCATION: Lock 11 Evidence line (line 231)
- FINDING: Lock 11 cites "OD-004 (12 fashion brand competitor selection)" — but Notion canonical OD-004 (page ID `35c9a84a-4679-8177-baf1-ee824624d5a5`) is titled "R29 PAL Rewrite Scope" and concerns unified Plugin Registry per Lock 19 + Lock 38. The "12 fashion brand competitor selection" content does not match Notion OD-004.
- REASONING: Stale citation. ANTI_PATTERN_CATALOG Family 5 ("Agent reasoned from memory instead of reading sources of truth") is the exact failure mode this surfaces — an authoritative file should not carry a stale OD label. SESSION_STATE.md carry-forward already flags this same anti-pattern at VIYO_CURRENT_MAP §10 (OD-003 stale label); the recurrence here suggests a broader OD-label-reconciliation pass is needed.
- SEVERITY: Yellow

### Finding 7
- LOCATION: Section 2.2 absorption mapping table, lines 594–607
- FINDING: Table column "Status" lists Notion Locks 1, 2, 3, 6, 7, 8, 11, 13 destinations as "PROPOSED Stack Constraint Lock 30" through "PROPOSED Stack Constraint Lock 37" — but §2.3 (line 611) records them as "RATIFIED 2026-05-13 — committed at Phase 3.2 revision," and §Section 1 contains the ratified Lock entries with Date Locked 2026-05-10 + ratified-to-repo 2026-05-13.
- REASONING: Internal inconsistency. The "PROPOSED" labels in the mapping table are stale from pre-ratification authoring; the section was not updated when ratification landed. A reader of §2.2 alone would conclude these Locks are pending; a reader of §Section 1 sees them ratified.
- SEVERITY: Yellow

### Finding 8
- LOCATION: Section 5 "Recommendations to PO," lines 670–702
- FINDING: Decision 1 carries "✅ RATIFIED 2026-05-13" in its heading. Decisions 2, 3, 4 do not carry equivalent markers despite their substance being applied throughout the file (Lock 15/16 remain RESERVED per Decision 2; Authority Source for Locks 1–14 is set to "VVOW + PO Direct" throughout §Section 1 per Decision 3; the file itself supersedes prior FOUNDATION_LOCK.md per Decision 4 archival policy). Each retains "**PO action:** Ratify..." text as though the decision is pending.
- REASONING: Decisions in §5 are stale relative to file body. The "PO action: Ratify..." surface contradicts the file's own implementation of those decisions — Decisions 2/3/4 cannot simultaneously be pending PO ratification AND already implemented in §Section 1.
- SEVERITY: Yellow

### Finding 9
- LOCATION: Section 6 closing, line 716
- FINDING: File closes with "**Phase 2.2 is complete pending PO ratification.**" — but the file's own RULE A summary, §2.3 Stack Constraints status, §5 Decision 1 ratification marker, and §Section 1 Locks 30–38 all record ratification has occurred. The closing line contradicts the body of the file.
- REASONING: Stale closing language from pre-ratification authoring. The file moved from pending-ratification to ratified state but the closing was not updated.
- SEVERITY: Yellow

### Finding 10
- LOCATION: Method section, lines 19–27
- FINDING: Method enumeration skips item 3 — items are numbered 1, 2, 4, 5, 6, 7, 8, 9. There is no step 3.
- REASONING: Numerical typo / authoring gap. Minor but symptomatic of incomplete editing pass before commit.
- SEVERITY: Yellow

### Finding 11
- LOCATION: Authority hierarchy item 2, line 35
- FINDING: Item reads "**V8 PRD (until V8.1 supersedes — Phase 4)** at Drive ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`. Canonical product north star except where flagged underspecified by PO audit." — but Phase 4 was completed today (2026-05-14) with PRD V8.1 committed at HEAD `d2bd8dc` at `/docs/PRD_V8.1.md`; V8 is now superseded per PRD V8.1 file header.
- REASONING: Stale hierarchy text. Lock 17 (Foundation-First) requires upstream authority text be correct; FOUNDATION_LOCK.md is upstream of consumers that read the hierarchy. The current text directs readers to V8 Drive ID as canonical when PRD V8.1 in repo is canonical as of d2bd8dc.
- SEVERITY: Yellow

### Finding 12
- LOCATION: H1 title, line 1
- FINDING: H1 reads "# FOUNDATION_LOCKS_v2.md" (plural, _v2 suffix) but the file is at `/docs/governance/FOUNDATION_LOCK.md` (singular, no _v2).
- REASONING: Title-vs-path mismatch. The file Supersedes line (line 5) says "Supersedes: `/docs/governance/FOUNDATION_LOCK.md` (current Locks 1–20 + RESERVED 15, 16)" — implying this file is the new version that REPLACES that path. But it commits to the same path it claims to supersede. The "_v2" suffix in the H1 is a working-draft naming artifact that was not cleaned up when the file landed at the canonical path.
- SEVERITY: Yellow

### Finding 13
- LOCATION: Lock 11 Statement, line 225
- FINDING: Lock 11 Statement names a specific implementation: "Milled (milled.com) is the canonical source for Phase 1" — naming a specific URL/website in a Foundation Lock Statement.
- REASONING: Lock 21 Governance Agnosticism test (lines 410): "Read any governance text. Ask: 'Does this name a specific file, path, step number, tag, schema field, or implementation pattern?' If yes, the text fails Lock 21." milled.com is a specific external URL — analogous to a specific file path. The capability statement would suffice: "competitor email archive sites." Lock 21 edge case applies only when there is "genuinely one correct implementation"; competitor email archives are a class of sources, not a singleton.
- SEVERITY: Yellow

## Summary

2 Red, 11 Yellow, 0 Green. The two Red findings (Section 1 heading count mismatch; Lock 33 vs Lock 38 contradiction) block ratification — one is a navigation defect, one is a substantive governance contradiction. The eleven Yellow findings are predominantly stale-text artifacts from Author not closing the loop after ratification landed (Findings 3, 7, 8, 9, 11), plus citation accuracy (Finding 6), cross-reference consistency (Finding 5), Lock-format completeness (Finding 4), and Lock 21 compliance (Finding 13).
