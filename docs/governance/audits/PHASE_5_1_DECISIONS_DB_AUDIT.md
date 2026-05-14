# PHASE_5_1_DECISIONS_DB_AUDIT.md

**Phase 5.1 deliverable per VIYO_PATH_TO_MVP.md Step D substrate-refresh sequence**
**Authored:** 2026-05-14 by VIYO Project Curator (Author/orchestrator session at staging HEAD `2094c36`)
**Type:** AUDIT artifact (reconciliation report). NOT a fix. Corrections apply only after this artifact goes through the isolated 3-agent loop and PO ratifies.
**Source of truth:** the live Notion 🗄️ Decisions Database at https://www.notion.so/7a769bf3c2914825aa42c1c8bc94ca30 (data source `b886724c-aa03-432b-889e-e63d9cdb7de6`). This artifact reports observations of that DB as of 2026-05-14; the canonical state remains the live DB itself, not this report.

---

## RULE A — Paragraph summary

The live Notion Decisions Database is the canonical record of ratified PO decisions; this audit reconciles governance-file claims about its count and ID range against the actual DB state as of 2026-05-14. Observed live state: **at least 77 distinct ratified records** spanning two coexisting title formats (the older "Decision N" full-word format covering Decisions 1–54, and the newer compact "DN" format covering D57–D84, with the highest observed ID being D84 created 2026-05-12T21:43). Two integrity anomalies surface: (a) two records titled D67 with different Notion page IDs and two records titled D68 with different page IDs — four distinct page IDs for two nominal Decision IDs; (b) a format-transition gap at Decisions 55 and 56 plus an "DN"-format gap at D61, D62, D64, D81, D82 that the workspace-search pagination did not surface, leaving open whether those IDs exist in an alternate format the search did not pick up, exist with non-conforming titles, or are genuinely absent. Four governance-file claims about the Decisions DB are surveyed: **FOUNDATION_AUTHORITY.md §9.2 line 593 ("D1-D29" — STALE by ~55 entries)** is the load-bearing stale claim VIYO_PATH_TO_MVP Step D 5.1 was authored to reconcile; **R-Spec_Audit_Table_v1.0.md line 63 ("D1-D57" — STALE by ~27 entries)** is a secondary stale claim; **VIYO_CURRENT_MAP.md line 15 + line 133 + line 387** report "D1-D84+" / "≥84 entries" accurately but trigger the standing-rule question about count restatement in governance text; **STATE_AUDIT.md** (audit artifact at `/docs/governance/audits/`, not a canonical surface) accurately documents the drift and is not a stale claim per se. Recommended corrections per stale claim follow the Step C standing rule ratified 2026-05-14 — point to the enumeration, never restate a count, Lock 21 capability-over-count. The audit closes with two anomaly items routed to Phase 5.1 follow-up (the D67/D68 duplicate-page-ID question; the missing-ID gap-verification) and a recommended Cataloger-side Notion-DB hygiene pass that is out of scope for this audit (Lock 21 governance-vs-operational scope boundary: audit names the state; Cataloger fixes the DB).

---

## §1 — Live Decisions Database state (point-in-time, 2026-05-14)

### §1.1 — Identity

- **Title:** 🗄️ Decisions Database
- **URL:** https://www.notion.so/7a769bf3c2914825aa42c1c8bc94ca30
- **Data source:** `collection://b886724c-aa03-432b-889e-e63d9cdb7de6`
- **Parent page:** 📋 VIYO Decision Log and QA Tracker [ARCHIVED — See Child Databases] (`https://www.notion.so/3559a84a46798194946ef8fc5479e4c2`)
- **Workspace:** `3559a84a-4679-8194-946e-f8fc5479e4c2`
- **Schema** (per STATE_AUDIT.md §4 row + this audit's direct verification): Decision ID (title) / Title / Category / Phase / Phase Relevance (multi-select) / Source Authority / Status / Session / Affected Specs / Decision Date / Migration Notes.

### §1.2 — Title format observation

The DB contains **two coexisting title formats**:

- **"Decision N" (full-word)** format: covers the older records (Decisions 1 through 54). Created in the 2026-05-10 timestamp clusters.
- **"DN" (compact)** format: covers the newer records (D57 through D84). Created in the 2026-05-11 / 2026-05-12 timestamp clusters.

The format transition appears between Decision 54 (created 2026-05-10T05:49) and D57 (created 2026-05-10T06:10). Decisions 55 and 56 were not surfaced under either title prefix in the workspace-search passes this audit performed — see §1.4 Anomaly 2.

### §1.3 — Enumeration (as observed via workspace-search; not via a complete DB scan)

**"Decision N" format records confirmed present** (54 records): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54.

**"DN" format records confirmed present** (23 distinct page IDs, but two title-IDs are duplicated at the page-ID level — see §1.4 Anomaly 1): D57, D58, D59, D60, D63, D65, D66, D67 (×2 page IDs), D68 (×2 page IDs), D69, D70, D71, D72, D73, D74, D75, D76, D77, D78, D79, D80, D83, D84.

**Conservative observed-distinct-records count:** 54 (Decision N) + 23 (DN distinct nominal IDs) = **77 distinct ratified decision records**. Treating the duplicate page IDs as separate physical records: 54 + 25 = **79 physical records**. The DB may contain additional records the search did not surface — see §1.4 Anomaly 2 for the gap candidates.

**Highest observed ID:** D84 (Notion page ID `35e9a84a-4679-8101-b1e9-dd38a59b7043`, created 2026-05-12T21:43).

### §1.4 — Anomalies

**Anomaly 1 — Duplicate Decision IDs at the page-ID level (data-integrity).** Two records titled D67 exist with different Notion page IDs (`35e9a84a-4679-817b-8593-cb50e88ecf6c` created 2026-05-12T14:32; `35e9a84a-4679-81df-9291-e6ba7e10f3b4` created 2026-05-12T03:25). Two records titled D68 similarly exist with different page IDs (`35e9a84a-4679-81ed-87cf-decf547003c1` created 2026-05-12T14:32; `35e9a84a-4679-81b8-a208-dff6ebb10463` created 2026-05-12T03:25). Four distinct page IDs for two nominal Decision IDs. Cause not determined by this audit; candidate explanations include: an intentional revision pattern (older record archived, newer record canonical — but neither D67 page nor D68 page surfaces with Status=Superseded in the search highlights), an unintentional duplication during a silent-write cluster (D67/D68 fall inside the D70–D82 cluster ANTI_PATTERN_CATALOG §1.1 Family 1 Observation 2 documents as 13 silent writes by the Ops Architect on 2026-05-12, 5 of which were subsequently archived). Resolution requires Cataloger-side per-page inspection + PO ratification of which page is canonical per duplicated ID + Status update of the non-canonical instance.

**Anomaly 2 — Missing IDs (gap-verification).** The workspace-search passes this audit performed did not surface records for the following candidate IDs: Decision 55, Decision 56, D61, D62, D64, D81, D82. For each, the candidate is one of: (a) the ID exists with a non-conforming title (neither "Decision 55" nor "D55"); (b) the ID exists with the conforming title but was not paginated into the search result window (notion-search returns up to 25 per query and the workspace-search may not enumerate every record across multiple specific-ID searches); (c) the ID is genuinely absent (record never created, or created then deleted). The audit cannot distinguish between (a) / (b) / (c) without either a complete DB scan via a list-records-style API call or a Cataloger-side direct DB view. **Action:** route to Cataloger-side Phase 5.1 follow-up — Cataloger walks the live DB in chronological order, confirms each gap candidate's true state, and surfaces a per-ID disposition to PO.

### §1.5 — Known clutter (carried forward from STATE_AUDIT.md §4)

STATE_AUDIT.md §4 row "Decisions DB" documents: *"Clutter: D70-D82 are Ops Architect's 13 silent writes per seed Observation 2 (5 already archived per Section G). Action: schema FOUNDATIONAL; Phase 5.1 archives implementation-detail clutter."* This audit confirms via direct DB read on D77 that the record is marked Status = Superseded with a Migration Notes field reading: *"ARCHIVED 2026-05-12 by PO assistant. Implementation detail captured in VIYO_OPS_GLUE_SPEC_v1.md... Not architectural-decision-worthy; the regex correction is a configuration value, not a Decision. Created during Ops Architect role-boundary violation (cataloging outside Ops Architect scope). Kept for audit trail of OD-020 anti-pattern manifestation."* — i.e., 1 of the D70-D82 cluster is confirmed-archived. The remaining 4-of-5-already-archived (per STATE_AUDIT seed reference) and the remaining 8 not-yet-archived implementation-detail entries in the D70-D82 cluster are a Phase 5.1 Cataloger task scope, not part of this audit's reconciliation deliverable.

---

## §2 — Governance-file claims about the Decisions DB (exhaustive grep survey)

### §2.0 — Survey method + exhaustiveness confirmation

**Pass 1 (count/range pattern):** grep across `/docs/governance/**` (case-insensitive) for the regex:

```
D1-D\d+ | D1 - D\d+ | D1–D\d+ | D1\s*through\s*D\d+
| Decisions\s+D?\d+-D?\d+ | Decisions\s+1[- ]\d+
| Decisions DB.*\d+\s*decisions
| \bD\d+\s*entries | \bD\d+\s*decisions
| ≥\s*D\d+ | >=\s*D\d+ | >\s*D\d+
| Decision\s+Log\s+(holds|contains|has)\s+D?\d+
| Decision\s+Log\s+\d+
| Decisions Database (holds|contains|has)
| holds\s+D\d+
```

**Pass 2 (broader count + range + total pattern):** grep for:

```
\b\d+\s*ratified\s*(PO\s*)?decisions?
| \b\d+\s*(PO\s+)?decisions?\s+(ratified|locked|active|total)
| \bD\d+\+
| ≥\s*\d+\s*entries
| \bD1-D | \bD1\s*through\s*D
| Decisions\s+(DB|Database).*\d+
| Decision\s+Log.*\d+\s*(decisions?|entries|ratifications?|records?)
```

**Pass 3 (every governance-file mention of the DB by name):** grep for `Decisions?\s+DB | Decision\s+Log | Decisions?\s+Database` to verify Pass 1+2 captured every file that even mentions the DB, then per-file inspection to distinguish count/range restatement from operational pointer.

**Pass 3 result — 10 files mention the Decisions DB by name (in `/docs/governance/`):**

| File | Mentions DB by name? | Restates count or range? | Disposition |
|---|---|---|---|
| `FOUNDATION_AUTHORITY.md` | yes | **yes (§9.2 line 593)** | Stale claim — §2.1 |
| `R-Spec_Audit_Table_v1.0.md` | yes | **yes (line 63)** | Stale claim — §2.2 |
| `VIYO_CURRENT_MAP.md` | yes | **yes (lines 15, 133, 387)** | Three accurate restatements — §2.3 |
| `audits/STATE_AUDIT.md` | yes | yes (documents the drift) | Accurate audit substrate, not a stale claim — §2.4 |
| `audits/PHASE_5_1_DECISIONS_DB_AUDIT.md` | yes | this file (self-reference) | n/a — the audit artifact itself |
| `FOUNDATION_LOCK.md` | yes (Notion D41 / D50 / D58 / D8 / D11 in Lock Evidence + Rationale sections) | **no** — specific-decision pointers per Lock 21 state-observation exclusion | No correction; pointers not count |
| `ANTI_PATTERN_CATALOG.md` | yes (D69 / D70-D82 / D80 in Family 1 observations; "24 Image-Studio-relevant decisions existed" in Obs 13) | **no** — historical observations of anti-pattern instances at specific past times, state-observation per Lock 21 exclusion. Borderline note: Obs 13 line 71 "24 Image-Studio-relevant decisions existed" is a count-at-a-past-time, not a live-state count; surfaced for completeness but not classified stale | No correction |
| `ARCHITECT_OPERATING_RULES.md` | yes (in role-scoped-tool-access cells + emoji exclusion example "🗄️ Decisions Database") | **no** — DB referenced by name only | No correction |
| `ZCBR_STANDARD.md` | yes (state-transition tracking pointer) | **no** — DB referenced by name only | No correction |
| `VIYO_OPERATING_WORKFLOW.md` | yes (D67 ATLAS specific-decision pointer) | **no** — specific-decision pointer | No correction |
| `review/ARBITRATION_FOUNDATION_LOCK.md` | yes (test-mode arbitration of FOUNDATION_LOCK) | **no** — references the DB in arbitration reasoning but doesn't restate count | No correction; audit artifact, not canonical |

**Exhaustiveness confirmation:** the broader Pass 2 + Pass 3 surveys returned the 10 files above. Of those, **5 distinct claim locations across 3 files** restate a count or range (FOUNDATION_AUTHORITY.md ×1; R-Spec_Audit_Table_v1.0.md ×1; VIYO_CURRENT_MAP.md ×3). STATE_AUDIT.md ×4 locations document the drift (audit substrate, accurate). The remaining 6 files reference the DB by name only or via specific-decision pointers per Lock 21 state-observation exclusion. **"5 claims surveyed" = "5 claims exist," not "5 claims a search found."** No additional count/range restatements remain in `/docs/governance/`.

Results below — per claim.

### §2.1 — FOUNDATION_AUTHORITY.md §9.2 line 593 — STALE

**Claim:** *"Notion VIYO Decision Log | https://www.notion.so/VIYO-Decision-Log-and-QA-Tracker-3559a84a46798194946ef8fc5479e4c2 | **29 ratified PO decisions (D1-D29)** — master decision record"*

**Status:** STALE. Live DB highest observed ID = D84 (not D29). Conservative observed-distinct-record count ≥ 77 (not 29). Claim is off by approximately 55 records.

**Severity:** Red. FOUNDATION_AUTHORITY.md sits at tier 4 of the FOUNDATION_LOCK §Authority hierarchy. A stale count + stale ID range in a tier-4 substrate file misdirects every downstream consumer (the §9.2 row is presented as the canonical external-source row for the Decision Log). Lock 17 (Foundation-First Decision Making) explicitly requires upstream authority text be correct.

**Recommended correction per Step C standing rule** (Lock 21 capability-over-count): replace the "29 ratified PO decisions (D1-D29)" cell text with capability-only phrasing that points to the live DB without restating count or range — e.g., *"Master decision record. Live count + ID range queryable in Notion at the URL; canonical state is the DB itself, not any restatement here."* The "What it provides" column states the capability; the live DB resolves the operational count. No count restated; standing rule honored.

### §2.2 — R-Spec_Audit_Table_v1.0.md line 63 — STALE

**Claim:** *"34 | Notion Decisions (D1-D57) | **EXEMPT** | n/a | Various Bullets | Various Bullets | n/a | Higher-tier authority. Not subject to ZCBR."*

**Status:** STALE. Live DB highest observed ID = D84 (not D57). The R-Spec Audit Table v1.0 documents a snapshot from an earlier session.

**Severity:** Yellow. R-Spec Audit Table is an audit artifact at `/docs/governance/R-Spec_Audit_Table_v1.0.md`, not a canonical authority surface — it is a tracking table for R-spec status. The "D1-D57" cell is used as a row name for the EXEMPT-from-ZCBR carve-out covering "Notion Decisions are higher-tier authority and not subject to R-spec quality bar." The substantive claim (Decisions are exempt from ZCBR) is correct; the stale range "D1-D57" is the artifact of the snapshot at that table's authoring time.

**Recommended correction per Step C standing rule:** replace "Notion Decisions (D1-D57)" with "Notion Decisions" without ID range. The "exempt from ZCBR" carve-out applies to every record in the Decisions DB regardless of ID; restating an ID range adds no substance and recreates the drift surface. Cell value becomes capability-only: "Notion Decisions — Higher-tier authority. Not subject to ZCBR."

### §2.3 — VIYO_CURRENT_MAP.md — count-restatement question (live but possibly violating the standing rule)

**Three claims in VIYO_CURRENT_MAP.md restate Decisions DB count or range:**

1. **Line 15 RULE A:** *"...ratified vs proposed snapshot (Notion **D1-D84+** + 21 Locks ratified + Stack Constraints 30-37 PROPOSED + 13 Open Decisions active)..."* — accurate as of authoring time per VIYO_CURRENT_MAP.md HEAD `c08721c`; "D1-D84+" matches the highest observed ID this audit also surfaced.

2. **Line 133** (§11 Active Governance Pointers / DB inventory cell): *"🗄️ Decisions Database | `7a769bf3c2914825aa42c1c8bc94ca30` | `b886724c-aa03-432b-889e-e63d9cdb7de6` | **D1-D84+ ratified PO decisions**; Phase Relevance multi-select for cross-phase tagging"* — same range restatement.

3. **Line 387** (§13 Ratified vs Proposed snapshot, or similar): *"**Notion Decisions DB current count: ≥84 entries** (D84 latest observed 2026-05-12T21:43 via Notion search). FOUNDATION_AUTHORITY.md §9.2 stale claim 'D1-D29' is wrong by ~55 entries. Precise count pending dedicated Notion sweep in Phase 5.1."*

**Status:** Accurate at audit time but rule-violating. The three restatements correctly identify D84 as the highest observed ID — but they restate a count/range in governance text, which falls under the **generalized standing rule** ratified by PO 2026-05-14 (extends the Step C count-naming rule from authority-hierarchy-counts-specifically to ALL governance count-restatements): *"Point to the enumeration / live source, never restate a count — applies to ALL governance count-restatements, not only authority-hierarchy counts. Closes the structural count-drift class."* The drift class is "any restated count in a governance file goes stale when the underlying thing changes" — "D1-D84+" is accurate today and wrong the day D85 lands. Same failure mode as FOUNDATION_AUTHORITY.md §9.2; different number. The narrower scoping (authority-hierarchy only) would fix one instance and knowingly leave three others standing in the same drift class — that defeats "closes the class."

**Severity:** Yellow. Correction required for all three locations.

**Recommended correction:** strip "D1-D84+" / "≥84 entries" / "wrong by ~55 entries" from the three locations; replace with capability-only phrasing pointing to the live DB. Line 387's substantive purpose (flag the FOUNDATION_AUTHORITY.md §9.2 drift; route the sweep to Phase 5.1) is preserved without count restatement — example replacement: *"FOUNDATION_AUTHORITY.md §9.2 claim is stale relative to the live DB; live count + ID range queryable in Notion at the canonical URL."* Line 15 RULE A and Line 133 DB-inventory cell replace "D1-D84+" with capability-only phrasing ("ratified PO decisions" without range) and point to the live DB URL.

### §2.4 — STATE_AUDIT.md — accurate, NOT a stale claim

**STATE_AUDIT.md §2.3 line 82 + §4 line 273 + §10 line 416 + §10 line 436** all document the FOUNDATION_AUTHORITY.md §9.2 drift accurately, surface the D70-D82 silent-write cluster, and route the reconciliation to Phase 5.1. STATE_AUDIT.md is an audit artifact at `/docs/governance/audits/STATE_AUDIT.md`, not a canonical authority surface. Its statements about Decisions DB state are observations-of-state per Lock 21's state-observation exclusion, not governance content asserting a live count.

**Status:** ACCURATE. No correction required. STATE_AUDIT.md and this 5.1 audit artifact share the same factual content about the DB state.

---

## §3 — Summary table

| # | Claim location | Current text (excerpt) | Status | Severity | Recommended correction |
|---|---|---|---|---|---|
| 1 | FOUNDATION_AUTHORITY.md §9.2 line 593 | "29 ratified PO decisions (D1-D29) — master decision record" | **STALE** by ~55 entries | **Red** | Strip count + range; capability-only cell text pointing to live DB |
| 2 | R-Spec_Audit_Table_v1.0.md line 63 | "Notion Decisions (D1-D57)" | **STALE** by ~27 entries | Yellow | Strip range; cell value becomes "Notion Decisions — Higher-tier authority. Not subject to ZCBR." |
| 3 | VIYO_CURRENT_MAP.md line 15 RULE A | "Notion D1-D84+" | Accurate at audit time, rule-violating | Yellow | Strip range; capability-only phrasing pointing to live DB |
| 4 | VIYO_CURRENT_MAP.md line 133 §11 DB inventory cell | "D1-D84+ ratified PO decisions" | Accurate at audit time, rule-violating | Yellow | Strip range; capability-only cell pointing to live DB |
| 5 | VIYO_CURRENT_MAP.md line 387 §13 (or near) | "Notion Decisions DB current count: ≥84 entries... wrong by ~55 entries" | Accurate at audit time, rule-violating | Yellow | Strip count; preserve substantive purpose (flag FOUNDATION_AUTHORITY drift + route to 5.1) without count restatement |
| n/a | STATE_AUDIT.md §2.3 + §4 + §10 | Various — documents the drift | ACCURATE (audit artifact, not canonical claim) | n/a | No correction; STATE_AUDIT is the substrate this 5.1 audit extends |

---

## §4 — Open items routed to Phase 5.1 follow-up (Cataloger scope, NOT this audit)

The audit's job is to surface the state and the stale claims. The following items require Cataloger-side direct DB work + per-page PO ratification and are out of scope for this audit deliverable:

1. **Anomaly 1 resolution** — duplicate D67 + D68 page IDs. Cataloger inspects each duplicate's content, surfaces which page is canonical per duplicated ID + Status update of the non-canonical instance for PO ratification.
2. **Anomaly 2 resolution** — missing IDs Decision 55, 56, D61, D62, D64, D81, D82. Cataloger walks the DB in chronological order, confirms each gap's true state ((a) non-conforming title / (b) search pagination miss / (c) genuinely absent), surfaces per-ID disposition.
3. **D70-D82 silent-write cluster archival pass** — STATE_AUDIT.md §4 documents 13 silent writes by Ops Architect on 2026-05-12, 5 of which were archived per Section G. The remaining 8 candidates require per-page review for archival vs retention as architectural-decision content. PO ratifies per-page Status update.
4. **Title format normalization** — the DB has two title formats ("Decision N" full-word for older records; "DN" compact for newer). Cataloger decides whether to normalize older titles to "DN" format for consistency, OR leave dual format as historical record. PO ratifies normalization choice. Not a stale-claim concern — purely operational hygiene.

These four items go into the 5.1 follow-up queue for Cataloger work + PO ratification, not into the Author-fix list for this audit. The audit closes when its reconciliation findings (§3 table) are ratified through the 3-agent loop.

---

## §5 — Lock 21 discipline applied throughout this audit

Per the **generalized standing rule** (ratified PO 2026-05-14, extending the Step C authority-hierarchy-count rule to all governance count-restatements — Lock 21 capability-over-count):
- This audit **points to the live DB** as the canonical source of truth (URL + data source ID stated; counts and ranges treated as observations-of-state per Lock 21's state-observation exclusion explicit clause).
- Counts named in this audit (54 / 23 / 77 / 79) are stated as **observation values at audit time** in §1.3, with explicit acknowledgement that the live DB may contain additional records the search did not surface.
- Recommended corrections in §3 strip count restatements from governance files in all 5 stale-claim locations; they do NOT replace a stale count with a freshly-restated count, which would just recreate the drift surface at a different value.
- The generalized rule applies to all 5 claim locations equally (Items 1+2 already stale; Items 3+4+5 accurate today but in the same drift class).

---

## §6 — Closing

**Phase 5.1 audit deliverable complete.** Findings in §3 are the reconciliation recommendations. Anomaly + cluster-archival + format-normalization items in §4 route to Cataloger-side Phase 5.1 follow-up.

Next stage per Phase 5 workflow:
1. PO ratifies this audit's draft (this surface).
2. Audit goes through isolated 3-agent loop — Adversary cold-reads + writes REVIEW; Arbiter (subagent) rules; PO reviews Arbitration.
3. After PO ratifies Arbitration: Author applies ratified findings — i.e., commits the §3 stale-claim corrections to FOUNDATION_AUTHORITY.md §9.2, R-Spec_Audit_Table_v1.0.md line 63, and VIYO_CURRENT_MAP.md three locations (all 5 under the generalized standing rule per §2.3 + §5).
4. 5.1 closes; 5.2 (FOUNDATION_AUTHORITY refresh, including the §1.3 stale-authority-hierarchy text Phase 5 task carried in SESSION_STATE) opens.

This audit is **not** a fix. Per Author Charter: corrections apply only to ratified findings, after the loop runs and PO ratifies the Arbitration disposition.

---

*End of PHASE_5_1_DECISIONS_DB_AUDIT.md*
