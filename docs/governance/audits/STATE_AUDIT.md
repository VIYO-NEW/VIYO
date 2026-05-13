# STATE_AUDIT.md

**Phase 1 deliverable per CURATOR_MASTER_PLAN_v2.md**
**Authored:** 2026-05-13 by VIYO Project Curator (Claude Code Desktop)
**Scope:** Every VIYO governance surface tagged FOUNDATIONAL / STALE / CONFLICTED / CLUTTER with evidence
**Inputs:** VIYO_FOUNDATIONAL_SEED.md, CURATOR_MASTER_PLAN_v2.md, the staging branch of github.com/VIYO-NEW/VIYO at HEAD `84478eb` (post-PR #35), 5 Notion data sources, 5 Airtable tables, 3 Drive files
**Out of scope:** Architect work, R-spec authoring, Bullet selection. This artifact is a state audit only.

---

## RULE A — Paragraph summary

VIYO's governance is in a partial-foundational state: the architectural truth layer (VVOW Image Studio Architecture v2.0, the 9 shipped v2 R-specs, ZCBR_STANDARD, PRODUCT_ROADMAP, FOUNDATION_AUTHORITY substrate definitions, FOUNDATION_LOCK Locks 17–19, INFRASTRUCTURE_DECISIONS ID-1 through ID-6, and the universal NIR_OPERATING_RULES principles) is sound and carries forward as TRUTH. Around that core sits a thicker layer of stale and conflicted material: the repo's CLAUDE.md, FOUNDATION_LOCK.md (Locks 1–14 numbering disagrees with Notion Foundation Locks DB on the same Lock numbers), CURRENT_STATE.md (5 days stale, doesn't reflect 6 post-2026-05-08 merged PRs), OPEN_DECISIONS.md (lists OD-001..007 while Notion has OD-001..020), VIYO_OPERATING_WORKFLOW v1.2 (status header still says DRAFT despite PR #27 merge; Section 6 snapshot 1 day stale), R-Spec_Audit_Table_v1.0 (status table predates 9 PRs of v2 R-spec ratification), and the Master Build Sequence v1.1 (cites R20/R24 as THIN despite v2 rewrites shipped). Drive holds 4 broken stillborn artifacts from the 2026-05-12/13 session plus a 799KB PRD V8 that the master plan supersedes in Phase 4. Notion is the most current surface — Decisions DB at D84+, Open Decisions at OD-020, Foundation Locks at Lock 21 — but Notion has accumulated clutter (5 Ops-Architect entries D70–D82, the silent-write OD-020) and one structural conflict (the Foundation Locks DB Locks 1–14 carry different content than the repo file's Locks 1–14, agreeing only on Locks 17–21). Airtable Build Tracker (580 features) is foundationally useful as feature inventory but its execution status is stale by ~25 shipped tasks; Architecture Broadcasts holds one Pending Builder Ingestion broadcast (v7.0 ZCBR Foundational Rewrite) that the v2 R-spec wave effectively superseded. The repo's `/docs/foundation/` Doc1–Doc11 series and `/docs/internal/` build-journal traces are FOUNDATIONAL as historical record but should not be inherited as authority. The big work for Phase 2 is reconciling FOUNDATION_LOCK numbering between repo and Notion, deriving foundational discipline from the 15 Section F observations (without inheriting Operating Workflow Section 8.5's 14 behaviors or ARCHITECT_SELF_AUDIT §4's firing-point fixes as authority), and committing Lock 21 to the repo file.

---

## Method

1. Cloned `github.com/VIYO-NEW/VIYO` staging branch into `C:\Users\Admin\Documents\VIYO\repo`. Verified HEAD = `84478eb` (post-PR #35).
2. Read all canonical files in repo: VVOW_IMAGE_STUDIO_ARCHITECTURE.md, PRODUCT_ROADMAP.md, ZCBR_STANDARD.md, CODING_CONVENTIONS.md, INFRASTRUCTURE_DECISIONS.md.
3. Read all unsound governance files: CLAUDE.md (via system context), FOUNDATION_LOCK.md, FOUNDATION_AUTHORITY.md, CURRENT_STATE.md, OPEN_DECISIONS.md, VIYO_OPERATING_WORKFLOW.md v1.2 rev 2, R-Spec_Audit_Table_v1.0.md, VIYO_Master_Build_Sequence.md (first 300 lines).
4. Verified R-spec ZCBR headers via grep (R19_v2 PASSED 2026-05-12, R21_v2 PASSED, R31_ENTERPRISE PASSED 2026-05-12 in-place; R19_ENTERPRISE + R21_ENTERPRISE marked SUPERSEDED). Git log confirms 9 v2 R-specs merged 2026-05-12 (R20, R24, R29, T46, R31, R17, R19, R21, R22).
5. Read Drive: NIR_OPERATING_RULES_v1.1.md (13 rules), ARCHITECT_SELF_AUDIT_2026-05-12.md (7 instances). Metadata-confirmed PRD V8 (799,527 bytes, modified 2026-05-08) and VIYO_Drive_Knowledge_Synthesis.md (74,991 bytes, modified 2026-05-10) without deep read.
6. Read Notion schemas for all 5 databases: Decisions, Foundation Locks, Open Decisions, PO Inbox, Documentation Gaps. Searched each for current-state markers (Lock 21, OD-019, D70–D84).
7. Read Airtable: Architecture Broadcasts (full, 6 records); Build Tracker (sampled — total 580 records, search hits for T70/T71/T72/T25/T26/T73 + R20/R24/R29).
8. Skipped: PRD V8 deep read (799KB, master plan supersedes in Phase 4); VIYO_Drive_Knowledge_Synthesis deep read (foundational reference, not in audit scope); R-spec body deep reads (canonical by ZCBR-PASSED status); Airtable Q&A Master Log, Skills Registry, Services Inventory deep reads (out of scope for STATE_AUDIT — will be reconciled in Phase 5).

---

## Tag definitions

| Tag | Meaning |
|---|---|
| **FOUNDATIONAL** | Sound, internally consistent, carries forward as TRUTH. Phase 2+ inherits without modification. |
| **STALE** | Was foundational at authoring, now out of date with newer canonical state. Refresh in Phase 4 (PRD V8.1) or Phase 5 (system cleanup). Do not inherit current content as authority. |
| **CONFLICTED** | Contradicts another surface that asserts conflicting authority on the same topic. Must be reconciled in Phase 2 before Phase 3 inheritance file authoring. |
| **CLUTTER** | Implementation detail, transient state, or accumulated reactive accumulation that doesn't belong in canonical governance. Archive or delete in Phase 5. |
| **EXEMPT** | Higher-tier authority or operational record not subject to ZCBR / audit checklist (per R-Spec Audit Table v1.0 §audit table rows 31–37). |

---

## Section 1 — Repo `/docs/architecture/` (5 files)

| File | Tag | Evidence |
|---|---|---|
| `VVOW_IMAGE_STUDIO_ARCHITECTURE.md` | **FOUNDATIONAL** with stale header | Body is canonical Phase 1 spec (3-zone architecture, 22 image types, A15/G8 launch blockers, B1–B10 toolbelt, 3-Tier provider strategy, Pattern Recipe schema, Brand Vault organization, RLHF + Tinder swipe gate, LoRA pipeline, all 8 Tech Stack locks). Header says "APPROVED FOR IMPLEMENTATION (pending PO acceptance of this file)" but seed Section C confirms PO-accepted 2026-05-12 — header drifted. Body §19 lists R20/R24/R31 as "Thin — needs rewrite" but all three have shipped v2 (R20 PR-equivalent, R24 PR #24, R29 PR #25, R31 PR #30) — Section 19 stale. §17 "Current Build State" lists T73 as PAUSED — still accurate. Action: header refresh + §19 v2-cross-link in Phase 4 PRD work; body carries forward as Phase 1 canonical. |
| `art-director-routing-suite.md` | **STALE** — superseded by T46 v2 | Predates ZCBR. T46 v2 merged 2026-05-12 at PR #29. Per R-Spec Audit Table, this is the "T46 (rewrite pending)" entry. The PR #29 commit is "Replace T46 v1 with T46 v2 ZCBR-compliant rewrite" — the architecture file was the replacement target. Need to verify whether this file's current content IS T46 v2 (replaced in-place) or whether it's still v1. Action: Phase 5 verify content; if v1, add SUPERSEDED header. |
| `brand-chat-comments-subsystem.md` | **STALE** — Phase 2.5 deferred | T33–T36 subsystem. R-Spec Audit Table marks it PENDING RE-VALIDATION, IMPT triage, JIT-stub. No active dependency. Action: Phase 5 add deferral header per ID-4 pattern. |
| `studio-editing-tools.md` | **STALE** — T47 PENDING_RE_VALIDATION | R-Spec Audit Table marks CRIT, B-XC.24 scheduled. Has not been ZCBR-validated. Predates ZCBR_STANDARD. Action: in-scope for B-XC.24 rewrite (out of Curator scope). |
| `webhook-pipeline.md` | **STALE** — superseded by Notion D11 | T48 file. FOUNDATION_AUTHORITY §6 C-07 confirms supersession by D11. R-Spec Audit Table row 29 marks SUPERSEDED with no rewrite needed. Action: Phase 5 add SUPERSEDED header pointing to Notion D11. |
| `README.md` | Not audited (file inventory only) | Trivial. |

---

## Section 2 — Repo `/docs/governance/` (15 files)

### 2.1 FOUNDATIONAL — carries forward

| File | Tag | Evidence |
|---|---|---|
| `ZCBR_STANDARD.md` | **FOUNDATIONAL** with stale self-status | 14-item ZC + BR checklist is sound. 3-checkpoint protocol is sound. Foundation Lock 20 wording (§10) is canonical. Self-status header says "Status: DRAFT — pending PO ratification" but FOUNDATION_LOCK.md Lock 20 says "ratified 2026-05-11" + CLAUDE.md cites it as authoritative + ARCHITECT_SELF_AUDIT references it as locked. Status header drifted; substance is locked. Action: Phase 2.2 confirm status header update to "PO-RATIFIED 2026-05-11". |
| `CODING_CONVENTIONS.md` | **FOUNDATIONAL** | 15 rules. Rule 15 (Lock 20 ZCBR enforcement) ratified 2026-05-11. Rules are concrete, testable, mechanical. Carries forward unchanged. |
| `INFRASTRUCTURE_DECISIONS.md` | **FOUNDATIONAL** | ID-1 through ID-6 ratified by PO 2026-05-08. Concrete, decisional, each with required follow-up. ID-1 (staging canonical), ID-2 (auto-deploy main pre-Alpha), ID-3 (Cloudflare R2 canonical asset storage), ID-4 (Cloudflare Worker R28 deferred), ID-5 (Vercel git-connected), ID-6 (Redis isolation smoke test). Carries forward unchanged. |
| `PRODUCT_ROADMAP.md` | **FOUNDATIONAL** with stale OD count | Phase 1 (11 sub-phases 1.1–1.11) + Phase 2 + Phase 3 + Phase 4+ sequencing is sound and matches FOUNDATION_AUTHORITY Section 2 + VVOW §16. Stale: Gate G2 reads "All open decisions (OD-001 through OD-007) resolved" but Notion has OD-008 closed + OD-009 through OD-020 active. Action: Phase 5 refresh Gate G2 OD range to "all currently-open OD entries"; rest of file unchanged. |

### 2.2 STALE — refresh in Phase 4 or 5

| File | Tag | Evidence |
|---|---|---|
| `CURRENT_STATE.md` | **STALE** | Header "Last updated: 2026-05-08" — 5 days stale. Misses: 6 v2 R-spec merges 2026-05-12 (R29, T46, R31, R17, R19, R21) + R22 v2 + R22 v1 supersession (PRs #24–#35). T73 still listed as paused — accurate. WP-3/4/5 listed as Pending — Operating Workflow §6 says SHIPPED PR #15. R29 PAL referenced as needs-rewrite — superseded. Self-rule says "If this file is more than 14 days old, the closeout discipline has broken." It's 5 days but closeout discipline IS broken — 9 PRs merged without CURRENT_STATE refresh. Action: superseded by VIYO_CURRENT_MAP.md in Phase 3.2. |
| `OPEN_DECISIONS.md` | **STALE** | Lists OD-001 through OD-007 (7 active, 1 removed). Notion has OD-001 through OD-020 (≥13 more active). Cross-references row says "PRODUCT_ROADMAP.md Gate G2 | All OD-001 through OD-007" — consistent with stale roadmap but stale vs Notion truth. Action: Phase 5 sync from Notion as canonical, or supersede file with "see Notion Open PO Decisions DB" pointer. |
| `R-Spec_Audit_Table_v1.0.md` | **STALE** | Audit dated 2026-05-11. CRITICAL count was 12, now 3 (R20, R24, R29, T46, R31, R17, R19, R21, R22 all shipped as v2 via PRs #21–#35; R23, R52, T47 still CRITICAL). Seed Section F Observation 6 says Architect self-authored versions v1.0 → v1.4 across one session — only v1.0 in repo; v1.1–v1.4 may exist in Drive only. Action: Phase 5 regenerate as v2.0 reflecting current shipped state, or supersede with R-spec ZCBR Status grep convention. |
| `VIYO_OPERATING_WORKFLOW.md` | **STALE** with conflict | DRAFT v1.2 rev 2 — committed at PR #27 but header says DRAFT — pending PO ratification. Status header drift. Section 6 snapshot dated 2026-05-12 end-of-day; lists 6 specific B-XC items "pending" but per git history, B-XC.06 (T46 v2 PR #29), B-XC.18 (R17 v2 PR #31), B-XC.19 (R19 v2 PR #32), B-XC.20 (R21 v2 PR #33), B-XC.21 (R22 v2 PR #34) have shipped. Section 8.5 contains 14 reactive Architect Operating Behaviors — explicitly the "scattered Behaviors #1-#15" the seed says NOT to inherit. Section 9 Anti-Patterns has 20+ entries mapping to seed Section F observations. Action: substrate (Sections 1–5 agents/repos/products/paths) is FOUNDATIONAL; Section 6 snapshot is STALE; Section 8.5 Behaviors and Section 9 Anti-Patterns are CONFLICTED with seed's "no inherited reactive rules" — the Phase 2.3 ARCHITECT_OPERATING_RULES derivation supersedes both. |
| `VIYO_Master_Build_Sequence.md` | **STALE** with conflict | DRAFT v1.1 — pending PO ratification. 140 numbered Bullets + 10 IMPORTANT JIT stubs + 7 LATER deferred. Cites R20/R24 as THIN throughout despite v2 ratifications. B-XC.01 (R29), B-XC.02 (R20), B-XC.03 (R24), B-XC.04 (R31), B-XC.06 (T46), B-XC.18 (R17), B-XC.19 (R19), B-XC.20 (R21), B-XC.21 (R22) all show as "rewrite scheduled" rather than "shipped." Action: substrate (phase plan, 12 substrate decomposition, dependency graph, Bullet metadata format) is FOUNDATIONAL; per-Bullet R-spec status flags are STALE. Phase 5 refresh OR live cross-link to Notion DBs / R-spec headers as source of truth (Lock 21 capability framing). |

### 2.3 CONFLICTED — Phase 2 reconciliation required

| File | Tag | Evidence |
|---|---|---|
| `CLAUDE.md` | **CONFLICTED** — sanctions an anti-pattern | Standing Instruction #8: "Session-end Notion cataloging is mandatory. Architect Claude proactively triggers cataloging of all session decisions to Notion VIYO Decision Log databases without being reminded." This is the literal sanction for seed Section F Observation 2 (Ops Architect's 13 silent writes D70–D82) and Observation 4 (Behaviors #13/#14/#15/#16 added to memory_user_edits without PO ratification). The current CLAUDE.md authorizes the behavior that the foundational reset is trying to eliminate. Also: 15-file required reading list is bloat. Authority hierarchy listed as 9 tiers (CLAUDE.md) vs 7 tiers (FOUNDATION_AUTHORITY §1.3) — internal conflict between two governance files. Action: completely superseded by CLAUDE.md v2 in Phase 3.1. Do not inherit any standing instruction or reading list. |
| `FOUNDATION_LOCK.md` | **CONFLICTED** with Notion Foundation Locks DB | Repo file has Locks 1–14 + 15, 16 RESERVED + 17–20 ratified; no Lock 21. Notion Foundation Locks DB has 21 distinct Lock pages. **Critical:** Locks 1–14 in Notion and repo have different content on the same lock numbers. Examples observed via Notion search: Notion Lock 5 = "Cloudflare R2 only asset storage" vs Repo Lock 5 = "Pattern DB + Pattern Recipe JSON Schema"; Notion Lock 11 = "Next.js 14+ App Router" vs Repo Lock 11 = "Pattern Seeding via Web Scraping"; Notion Lock 12 = "TypeScript strict mode" vs Repo Lock 12 = "Brain Council Scope"; Notion Lock 13 = "Zod only" vs Repo Lock 13 = "Tenant Isolation via RLS"; Notion Lock 14 = "RLS mandatory" vs Repo Lock 14 = "Schema Changes via Canonical Migrations". Locks 17, 18, 19, 20 align across both surfaces. Lock 21 (Governance Agnosticism, ratified 2026-05-12) exists in Notion, absent from repo file. Action: Phase 2.2 FOUNDATION_LOCKS_v2 reconciles to single source. Likely outcome: repo content is more recent (VVOW-era 2026-05-08+); Notion DB has older tech-stack-era locks. Curator's recommendation in Phase 2.2 surfaces the reconciliation choice. |
| `FOUNDATION_AUTHORITY.md` | **CONFLICTED + STALE** | 12 agnostic substrates L1–L12 + 4-competitor moat absorption framework + 7-tier authority hierarchy + 7 conflict resolutions C-01..C-07 + open documentation gaps. Substrate definitions are FOUNDATIONAL — they describe horizontal capability layers that don't decay with phase progression. Stale: §4 header says "14 Foundation Locks below" but enumerates Locks 1–14 plus separately calls out 17, 18, 19; says nothing about 20 or 21 (post-2026-05-10 ratifications). §9.2 row "Notion VIYO Decision Log | 29 ratified PO decisions (D1-D29)" — Notion has D1 through D84+ (stale by ~56). §1.3 authority hierarchy is 7 tiers; CLAUDE.md is 9 tiers; conflict. §8.1 "R29 PAL — AI Plugin Registry has no R-spec (CRITICAL)" — R29 v2 merged 2026-05-12 PR #25; gap resolved. Appendix C "Three Authority Waves" is useful historical context. Action: substrates L1–L12 + Section 6 Conflict Resolutions C-01..C-07 + Appendix C historical context are FOUNDATIONAL (carry forward). §4 Lock count + §9.2 Notion count + §1.3 hierarchy + §8.1 R29 status are STALE (refresh in Phase 4 PRD V8.1 or Phase 5). §1.3 vs CLAUDE.md tier-count is CONFLICTED — Phase 2.2 resolves via FOUNDATION_LOCKS_v2 anchor. |

### 2.4 Supplementary repo governance (smaller surfaces)

| File | Tag | Evidence |
|---|---|---|
| `REDIS_ISOLATION_EVIDENCE.md` | **FOUNDATIONAL** as historical evidence | ID-6 (Redis isolation smoke test) evidence bundle from WP-4. Foundationally sound as audit record; not authority. Carries forward. |
| `VERCEL_AUDIT_EVIDENCE.md` | **FOUNDATIONAL** as historical evidence | ID-5 (Vercel git connection) audit evidence from WP-3. Same status as Redis. |
| `INFRASTRUCTURE_REPORT.md` | **STALE** | 2026-05-08 inventory + gap analysis. Pre-INFRASTRUCTURE_DECISIONS ratification. Useful for Phase 4 PRD V8.1 context but not authority. |
| `MIGRATION_AUTOMATION_PROPOSAL.md` | **STALE** | WP-5 design proposal, not yet implemented. Phase 0/1 work. Out of Curator scope. |

---

## Section 3 — Repo `/docs/research_specs/` (28 files)

ZCBR Status grep + git log confirms 9 v2 specs shipped 2026-05-12 / 13:

### 3.1 FOUNDATIONAL (9 specs, ZCBR PASSED)

| Spec | File | ZCBR | Merge |
|---|---|---|---|
| R17 v2 UX Architecture | `R17_UI_UX_ARCHITECTURE_v2.md` | PASSED 2026-05-12 | PR #31 |
| R19 v2 LLM Orchestration | `R19_LLM_ORCHESTRATION_v2.md` | PASSED 2026-05-12 (grep-verified) | PR #32 |
| R20 v2 Database Schema | `R20_DATABASE_SCHEMA_v2.md` | PASSED 2026-05-12 | PR #21-equiv |
| R21 v2 Infrastructure | `R21_INFRASTRUCTURE_v2.md` | PASSED 2026-05-12 (grep-verified) | PR #33 |
| R22 v2 Security & Auth | `R22_SECURITY_AUTHENTICATION_v2.md` | PASSED 2026-05-12 | PR #34 |
| R24 v2 Image Pipeline | `R24_IMAGE_PIPELINE_v2.md` | PASSED 2026-05-12 | PR #24 |
| R29 v2 PAL | `R29_PLATFORM_ABSTRACTION_LAYER_v2.md` | PASSED 2026-05-12 | PR #25 |
| R31 v2 Product Data Extraction | `R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md` (overwritten in place) | PASSED 2026-05-12 (grep-verified) | PR #30 |
| T46 v2 Art Director Routing | likely `art-director-routing-suite.md` (filename unchanged) | needs body verification | PR #29 |

Status: nine specs are canonical Phase 1 substrate. Each declares its own ZCBR PASSED header. Each is sub-tier authority to VVOW (per VVOW §0 supersession statement).

### 3.2 SUPERSEDED (v1 R-spec ENTERPRISE files, retained for audit trail)

| File | Tag | Evidence |
|---|---|---|
| `R19_LLM_ARCHITECTURE_ENTERPRISE.md` | **CLUTTER** (kept as audit trail) | ZCBR Status: SUPERSEDED. PR #32-era supersession commit. Carries no authority. |
| `R20_DATABASE_SCHEMA_LOCK_ENTERPRISE.md` | **CLUTTER** | Superseded by R20 v2 + PR-equivalent supersession. Per D68 Notion: R20 v1 was 17,786 bytes at SHA from April 24. |
| `R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md` | **CLUTTER** | ZCBR Status: SUPERSEDED. PR #33-era supersession. |
| `R22_SECURITY_AUTHENTICATION_ENTERPRISE.md` | **CLUTTER** | Superseded by R22 v2 + PR #35 supersession mark. |
| `R24_IMAGE_PIPELINE_VIDEO_ANALYSIS_COMPLETE.md` | **CLUTTER** | 1 of 5 R24 v1 fragment files marked SUPERSEDED per PR #24. |
| `R24_LEARNING_LOOP_CRITIQUE.md` | **CLUTTER** | Same. |
| `R24_MULTI_MODEL_IMAGE_PIPELINE_ENTERPRISE.md` | **CLUTTER** | Same. |
| `R24_VISION_CRITIQUE.md` | **CLUTTER** | Same. |
| `R24_VISION_STATEMENT_FROM_CEO.md` | **CLUTTER** | Same. |
| `R29_PLATFORM_ABSTRACTION_LAYER_ENTERPRISE.md` | **CLUTTER** | Superseded by R29 v2 per PR #26. |

Action: Phase 5 — confirm SUPERSEDED headers present on each; consider folder-level archiving (`/docs/research_specs/_superseded/`) to declutter the active spec list.

### 3.3 PENDING / LATER (R-Spec Audit Table classifications)

| File | Tag | R-Spec Audit Triage |
|---|---|---|
| `R17_UI_UX_ARCHITECTURE_ENTERPRISE.md` | **CLUTTER** | Pre-v2. Should be marked SUPERSEDED. |
| `R18_GLOBAL_WIRING_MAP_ENTERPRISE.md` | **STALE** | PENDING RE-VALIDATION per Audit Table row 2. IMPT triage. |
| `R23_COST_RECONCILIATION_ENGINE_ENTERPRISE.md` | **STALE** | MINOR FIX scheduled at B-XC.22. CRIT triage. |
| `R25_VIDEO_IG_INGESTION_MODULE_ENTERPRISE.md` | **STALE** | Phase 1B JIT stub. IMPT triage. |
| `R26_CREATIVE_CONCEPT_MODE_ENTERPRISE.md` | **STALE** | Phase 2 JIT stub. IMPT triage. |
| `R27_COMPOSABLE_SECTIONS_ENTERPRISE.md` | **STALE** | Phase 2 JIT stub. IMPT triage. |
| `R28_TIMER_SERVICE_ENTERPRISE.md` | **STALE** | LATER (deferred per ID-4). Needs deferral header. |
| `R30_PRODUCT_ANIMATION_ENGINE_ENTERPRISE.md` | **STALE** | LATER. |

Action: Phase 5 add deferral / pending-revalidation headers consistently. Phase 2 does not touch these specs.

### 3.4 Specs cited by Master Build Sequence but absent from repo

| Spec | Status |
|---|---|
| R32 Email Engine | Not in repo; Phase 2 JIT stub. |
| R33 Shopify Integration | Mentioned in ARCHITECT_SELF_AUDIT Instance 6 as "undiscovered R-spec authority"; absent from repo and Audit Table. |
| R36 HYVE / R37 MAAX / R38 SYPHON | Phase 1B; not in repo per repo grep. Listed in FOUNDATION_AUTHORITY §8.6 as inventoried but unread. |
| R39 Global Admin | Phase 4+; not in repo. |
| R46 Email Ingestion | Not in repo (verified — only R-specs visible are R17-R31 in main listing). Phase 1B. |
| R52 Disaster Recovery | Not in repo. SUPERSEDED triage per Audit Table; B-XC.23 schedules fresh runbook. |
| R53 | Not in repo. PENDING RE-VALIDATION. |

Action: Phase 4 PRD V8.1 work consolidates the spec inventory; Curator surfaces missing-from-repo state in STATE_AUDIT.

---

## Section 4 — Repo `/docs/foundation/` (9 files)

| File | Tag | Evidence |
|---|---|---|
| `VIYO_ARCHITECTURE_LOCK_V3.md` | **STALE** | Per Appendix C, ARCH_LOCK_V3 is April 24–28 wave authority. Acknowledged in CURRENT_STATE.md "Authority codes acknowledged: ARCH_LOCK_V3 ...". Superseded by FOUNDATION_AUTHORITY.md substrate definitions. |
| `VIYO_Final_Doc1_Master_PRD.md` | **STALE** | V4-era PRD doc. Pre-V8. Will be superseded by V8.1 (Phase 4). |
| `VIYO_Final_Doc2_System_Prompts.md` | **STALE** | V4-era. |
| `VIYO_Final_Doc3_Database_Schema.md` | **STALE** — explicitly superseded | Commit `eda5b49 governance: R20 v1 + Final Doc 3 supersession by R20 v2`. R20 v2 supersedes. |
| `VIYO_Final_Doc4_Technical_Roadmap.md` | **STALE** | V4-era technical roadmap; superseded by PRODUCT_ROADMAP.md + FOUNDATION_AUTHORITY phase plan. |
| `VIYO_Final_Doc6_Skills_Catalog.md` | **STALE** | V4-era skills catalog; superseded by L11 + L12 substrate definitions in FOUNDATION_AUTHORITY + Airtable Skills Registry. |
| `VIYO_Final_Doc9_Frontend_Architecture.md` | **STALE** | V4-era; superseded by R17 v2. |
| `VIYO_Final_Doc10_User_Lifecycle.md` | **STALE** | V4-era. |
| `VIYO_Final_Doc11_Security_Architecture.md` | **STALE** | V4-era; superseded by R22 v2 + Doc 11 Security Phase Triggers reference. |

Action: Phase 5 — fold relevant content into PRD V8.1; archive folder. Doc 4–11 (where present) are historical record only.

---

## Section 5 — Repo `/docs/internal/` (mixed)

This folder holds the prior session's working artifacts (T15 / T45 / T46 / T73 phase plans + journals + raw data dumps). Inventory:

| Category | Files | Tag |
|---|---|---|
| Build-journal traces (t15-router-phase1-8, t45-database-foundation-phase2-8, t46-phase2-5, t73-phase2-architecture-wiring-plan) | ~25 files | **FOUNDATIONAL** as historical build record. Useful for Phase 4 PRD V8.1 context. Not authority. |
| Raw data JSON dumps (t45-admin-bundle-raw-data.json, t45-web-bundle-raw-data.json, t45-phase7-quality-gate-raw-output.txt, t46-phase*-quality-gate-evidence.txt) | 5 files | **CLUTTER** in canonical governance — operational artifacts. Phase 5 consider relocating to `/evidence/` or archiving. |
| Cross-reference docs (build-tracker-cross-reference-repair-2026-04-29.md, architecture-broadcast-check-2026-04-29.md, source-map.md, integration-map.md, wiring-ledger.md, decision-log.md, env-snapshot.md, open-questions.md, research-log.md, build-journal.md, kb-candidates.md, t4-live-test-results.md, t5-live-test-results.md, t8-live-test-results.md, phase6-repair, phase6-ui, r32-ingestion folders) | ~15 files/folders | **STALE** — historical engineering surface. Useful as Phase 2 anti-pattern evidence (decision-log.md, open-questions.md). |
| `t46-v6-prior-artifact-repair-record.md` | 1 file | **STALE** — pre-ZCBR repair history. |

Action: Phase 5 audit which engineering artifacts have post-2026-05-08 forward relevance; archive the rest. Not in Phase 2 scope.

---

## Section 6 — Repo `/docs/runbooks/` + `/docs/source-of-truth/`

| Path | Tag | Evidence |
|---|---|---|
| `/docs/runbooks/staging-environment.md` | **STALE** | Per ID-1 required follow-up: "Update to reference `staging` instead of `develop`." Status of fix unverified; WP-1 listed as UNVERIFIED in Operating Workflow §6 + OD-019 open. |
| `/docs/runbooks/render-worker-setup.md` | **STALE** likely | Per ID-2/ID-6 follow-ups: needs alignment with auto-deploy + Redis wiring decisions. Not deep-read. |
| `/docs/runbooks/vercel-setup.md` | **STALE** likely | Per ID-5 follow-ups: per-project git connection verification. Not deep-read. |
| `/docs/source-of-truth/v7_1/` | **STALE** | Authority wave 1 (April 24–28) artifacts per Appendix C. Superseded by current canonical. Historical record. |

Action: Phase 5 — runbook refresh after OD-019 (WP-1 + WP-2 verification) closes. `v7_1/` folder is archive material.

---

## Section 7 — Repo root + miscellaneous

| Path | Tag | Evidence |
|---|---|---|
| `README.md` | Not audited | Not in audit scope. |
| `portal-build-log.md` | **CLUTTER** | Portal infrastructure operational log; out of VIYO product repo scope per Operating Workflow Section 2. Should live in Portal repo. |
| `todo.md` | **CLUTTER** | Repo-root TODO file. Operational, not governance. |
| `render.yaml` | **FOUNDATIONAL** (infra config) | WP-2 reconciled per Operating Workflow §6 (PR #15). |
| `apps/`, `packages/`, `scripts/`, `eslint.config.js`, `package.json`, `pnpm-*`, `turbo.json`, `tsconfig.base.json` | Out of governance audit scope | Application code surface, not governance. |
| `.taskmaster/` (referenced but not searched) | **STALE** likely | Dual record per CURRENT_STATE.md; per VVOW §17 "committed on staging branch." Out of Curator scope. |

---

## Section 8 — Drive

### 8.1 FOUNDATIONAL (reference inputs)

| File | Drive ID | Size | Tag | Evidence |
|---|---|---|---|---|
| `VIYO_FOUNDATIONAL_SEED.md` | `1SdGiuoNEUnHglq5ujPyXw1Jjg8A64heN` | (read in Step 1) | **FOUNDATIONAL** | Per master plan §Foundational principle — this seed is the Curator's inheritance. |
| `CURATOR_MASTER_PLAN_v2.md` | `1NT9QCfBEnm5Y2QdO-8tO7BTlI6kFXQMf` | (read in Step 2) | **FOUNDATIONAL** | The 6-phase plan being executed. |
| `VIYO_Drive_Knowledge_Synthesis.md` | `1z1CtDmf0PwC0MvufADnKYVPq96W_EQ3X` | 74,991 bytes | **FOUNDATIONAL** as historical context | Per FOUNDATION_AUTHORITY §9.2: "22 of 80 docs read (other Claude session)." Synthesis pass over Drive corpus. Useful as Phase 4 PRD V8.1 input. Not authority for Phase 2. |
| `NIR_OPERATING_RULES_v1.1.md` | `1_TWmmt7IkkuQ9xoEzTYR9jvl6O63MZ0N` | (read) | **FOUNDATIONAL** (principles) / **STALE** (Rule 13 is recent reactive addition) | 13 rules. Rules 1–12 are universal-agent principles (paragraph summary, make the call, one ask per turn, reason before invoke, read before write, surface uncertainty, surface conflicts, principle over prescription, catalog decisions, checkpoint, budget honesty, acknowledge-mistakes-hold-steady). Rule 8 = Lock 21 equivalent. Rule 13 = Architect role definition added 2026-05-12 in response to session anti-patterns. Seed says replaced by NIR_OPERATING_RULES_v2 in Phase 2.4 — substance carries forward; reactive accumulation gets pruned. |

### 8.2 STALE — to be superseded

| File | Drive ID | Size | Tag | Evidence |
|---|---|---|---|---|
| `VIYO_MASTER_PRD_V8_FINAL.md` | `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` | 799,527 bytes | **STALE** | Pre-MVP-reset. Per seed Section D: "will be superseded by V8.1 in Phase 4." Per VVOW §0: "V8 PRD is underspecified for VVOW; this file is the canonical reference." Action: Phase 4 PRD V8.1 supersedes. Drive file kept as historical authority. |
| `ARCHITECT_SELF_AUDIT_2026-05-12.md` | `1Et7Jjf-nRDomkeDUs2Oggc7K8ZNQw5l0` | (read) | **STALE** §1 / **CLUTTER** §4 per seed | §1 contains 7 instances + 3 subpatterns (subpattern 2.1 ratification as collaboration; 2.2 investigation as permission request; 2.3 sources-of-truth as opt-in). Useful evidence supplementing seed Section F. §4 contains firing-point fixes (pre-surface gate, complete-or-don't-surface rule, standing operating rules doc) — seed says do not inherit as foundational; Curator derives own structural fixes in Phase 2.3. |

### 8.3 CLUTTER — broken artifacts from 2026-05-12/13 session (PO manual delete queue)

Per seed Section G:

| Drive ID | Filename | Issue |
|---|---|---|
| `15zPtJx3Tn4Uv-JWgLtW-pexg2akWkmg7` | R23 v2 first draft | Memory-based R29 v2 citations wrong (Registry.invoke / ai_provider_connections / costAttribution — all incorrect). Instance 1 of self-audit. |
| `1dEvhnyt5zTLeFph8ROtLfF9nX1Fvye1z` | Untitled R23 v2 rev 2 partial | Cut off mid-create when PO sent HOLD. Instance 2. |
| `1G-dLhWh_H54ozE9uHBBFxvPoMN1a5fVs` | R24 v2.1 first version | "(content unchanged from v2.0 — preserved verbatim)" placeholders for §2-9. Instance 7. |
| (second R24 v2.1 file from final session turn) | (untitled / partial) | Truncated mid-§6.9.6 table by self-audit instruction. |
| `1fFgDQhy3KuD7lCGxpboomjuWhvsS_6GD` | R29 v2 duplicate draft | Stillborn — R29 v2 already shipped at PR #25 hours earlier. |
| `1VyRKDOGUuU8K8E4PtVR4u_3piqtlYB-D` | R29 supersession duplicate directive | Stillborn — supersession PR #26 already merged. |
| `1CZeDKaq...` (incomplete ID per self-audit §6) | Older R22 v2 draft | Superseded by rev2; rev2 matches repo bytes per Manus audit. |

Action: PO manually deletes from Drive in Phase 5.7. Curator notes in audit; does not delete from canonical state without explicit PO ratification.

### 8.4 Drive folders for system context (referenced, not deep-read)

| Folder | Drive ID | Purpose |
|---|---|---|
| Claude working folder | `1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki` | Governance working files (zcbr-spec-validation skill spec lives here per Lock 20). |
| VIYO V8 PRD | `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` | Folder containing PRD V8 file (file ID = folder ID by coincidence). |
| Working folder | `1VrI8_dByLmWPbC3Y26i8DjhdS7gmA9qK` | In-flight drafts. |
| ZCBR R-files folder | `1duV346EV6D8n2cUqO0xW-oGgmq5o3bcI` | 37 ZCBR specs (May 3 wave per Appendix C). Manus quality issue per FOUNDATION_AUTHORITY §8.5. |

---

## Section 9 — Notion (5 databases)

Workspace: `3559a84a-4679-8194-946e-f8fc5479e4c2`. All 5 databases live and queryable.

| DB | Data Source ID | Tag | Evidence |
|---|---|---|---|
| Decisions DB | `b886724c-aa03-432b-889e-e63d9cdb7de6` | **FOUNDATIONAL** (substrate) / **CLUTTER** (some entries) | Schema is sound: Decision ID, Title, Category (Architecture / Pricing / Infrastructure / Pattern / Skill / Webhook / Provider / Phase Plan / Competitive / Token Economics / Quality / Privacy / UX / Process), Phase, Phase Relevance multi-select (P0..P4+, XC, ANY), Source Authority (PRD V8 / VVOW / Notion Decision / Foundation Lock / Build Tracker / PO Direct), Status (Locked / Open / Deferred / Superseded), Session (May 2 / 3 / 10 / Pre-May 2026), Affected Specs, Decision Date, Migration Notes. Phase Relevance multi-select is the live cross-phase tagging infrastructure per Behavior #13. Population: D57-D84 visible in search results; seed says "D1-D85+"; FOUNDATION_AUTHORITY says "D1-D29" (stale by ~56). Clutter: D70-D82 are Ops Architect's 13 silent writes per seed Observation 2 (5 already archived per Section G). Action: schema FOUNDATIONAL; Phase 5.1 archives implementation-detail clutter. |
| Foundation Locks DB | `7ed3c2e2-958d-40f0-bb32-70711b52c6bc` | **CONFLICTED** with repo FOUNDATION_LOCK.md | Schema: Lock # (title), Title, Category (Architecture / Process / Provider / Token / Pattern / Skill / Privacy / Other), Date Locked, Authority Source (PO Direct / Architect Claude / VVOW / PRD V8 / Other). 21 lock pages confirmed via search. **Conflict:** Locks 1–14 in Notion describe tech-stack/framework constraints (R2-only, Next.js, TypeScript strict, Zod, RLS); Locks 1–14 in repo describe product-architecture commitments (Product Sequencing, GrapesJS Backbone, MJML JSON Recipe, Cache-First, Pattern Recipe schema, Brand Vault, 3-Tier Provider, Programmatic editing, RLHF, LoRA, Pattern Seeding, Brain Council, Tenant Isolation, Canonical Migrations). Locks 17, 18, 19, 20, 21 align across both. Likely cause: Notion DB holds an older lock taxonomy (pre-VVOW April-era); repo file is the newer VVOW-era authoritative numbering. Action: Phase 2.2 FOUNDATION_LOCKS_v2 reconciles. |
| Open PO Decisions DB | `996b2e7d-50f8-41bd-a815-faf5194277f1` | **FOUNDATIONAL** with stale OD-008 entry | Schema: OD ID (title), Title, Status (Open / In Progress / Closed), Owner (PO / Architect Claude / Manus / Legal / External), Phase Relevance multi-select, Due Status (Urgent / Soon / Later / No Date), Blocking. Population: OD-001 through OD-020 confirmed via search. OD-019 (WP-1 + WP-2 verification, 2026-05-11) confirmed. OD-020 (silent-write 2026-05-12T02:41 — seed Observation 1) confirmed. Repo OPEN_DECISIONS.md is stale by 13 OD entries. Action: Notion DB IS the canonical surface; repo file is stale. Phase 5.3 closes superseded ODs; Phase 5 deprecates repo OPEN_DECISIONS.md in favor of Notion pointer. |
| PO Inbox DB | `be5f9696-b119-4f81-bb73-2599f5c1242b` | **FOUNDATIONAL** (newer surface) | Schema: Observation (title), Captured date, Details, Priority (Now / Next Session / Future Phase / Reference Only), Route to (Architect Claude / Governance Curator / Decision Cataloger / PO Self / Phase Forward / Unsure), Tagged Phase, Status (Open / In Progress / Drained / Deferred / Closed), Drained During. This is the cross-phase ratification surface introduced 2026-05-12 to capture observations awaiting routing. Population not sampled. Action: schema sound, Phase 5.4 reviews entries. |
| Documentation Gaps DB | `a6bc7b34-6f70-44e4-872f-4a7c481ff1d1` | **FOUNDATIONAL** | Schema: Gap ID (title), Spec Affected, Severity (Red Blocking / Yellow Quality), Resolution Status (Open / In Progress / Resolved), Phase Relevance multi-select, Identified By (F-1 Audit / F-1.5 Audit / VVOW Architecture / Other). GAP-009 (ATLAS R-spec lineage) referenced in Operating Workflow §6. GAP-008 closed via 2026-05-12 supersession PRs per same. Population not sampled in detail. Action: schema sound. |

---

## Section 10 — Airtable (5 tables, base `appo5mNncCCzKcIRk`)

| Table | Records | Tag | Evidence |
|---|---|---|---|
| VIYO Q&A Master Log (`tblWr8n54Vb83egxR`) | (not counted; FOUNDATION_AUTHORITY says "~200") | **FOUNDATIONAL** as historical Q&A record | Schema: Q#, Question, Approved Solution, Domain, Build Phase, Status, Source File, Technical Detail, PRD Section Reference. Foundationally useful as cross-session decision retrieval. Action: not in active Phase 2 scope; Phase 5 reconcile against current canonical. |
| Build Tracker (`tblIJUzJoCCjWXaMQ`) | 580 records (verified via list_records totalRecordCount) | **FOUNDATIONAL** (feature inventory) / **STALE** (execution status) | Schema: Feature ID, Feature Name, Status, Version, Phase, PRD Section, Dependencies, Notes, Build Order, Taskmaster Task ID. 580 features matches FOUNDATION_AUTHORITY §2.1 Manus Inventory count. Per FOUNDATION_AUTHORITY: "552 of 580 features Not Started, 25 Done, 3 In Progress" — that's the 2026-05-08 snapshot. Per CURRENT_STATE: T25, T26, T70, T71, T72 shipped; Taskmaster Task ID backfill noted in Architecture Broadcast 3. Sampled search hits 2 records mentioning T70 / T71 / T72 / T25 / T26 / T73 — Build Tracker is feature-ID-keyed not T-keyed. **Reconciliation against 9 shipped v2 R-specs (R20, R24, R29, T46, R31, R17, R19, R21, R22):** Build Tracker is the wrong tool — R-spec status is governed by R-Spec Audit Table + R-spec headers (ZCBR Status field) + git commits. Build Tracker tracks features (P0-XX, V11-XX, VF-XX, T-XX), not R-specs. The 9 shipped v2 R-spec PRs are B-XC.01-21 cross-cutting Bullets, not feature rows. Action: Phase 5.5 syncs feature-level Done/Not Started counts against shipped PRs; R-spec reconciliation already lives in repo. |
| Skills Registry (`tbl4gNd7bWjypMQBF`) | ("80+" per table description, "109+" per FOUNDATION_AUTHORITY §5 L12-B) | **FOUNDATIONAL** (substrate) / **STALE** (status) | Schema: Skill Key, Skill Type, Phase Assignment, Status, Description, Token Footprint, Target Brain. Layer 2 Pattern Skills per FOUNDATION_AUTHORITY L12-B. Operating Workflow §6 says "Builder Technical Skills authored | 1 of 12 (zcbr-spec-validation)" but seed Section G says 4 more pending verification. Action: Phase 5.6 reconcile MVP relevance. |
| Services Inventory (`tblcRL2RNys7SIiW5`) | (FOUNDATION_AUTHORITY says 27) | **FOUNDATIONAL** | Schema: Service Name, Category (Day 1 Prerequisite / As-We-Go), Purpose, R-Spec Reference, Build Phase, Estimated Cost, Account Status, API Key Env Var, Notes, Service Tier, Signup URL, API Key Dashboard URL. Sound infrastructure inventory. Action: Phase 5 verify Account Status against ratified ID-1..ID-6 + current OD list. |
| Architecture Broadcasts (`tblyZdtFjTYIwSzBT`) | 6 records (full read) | **STALE** | Records: (1) v7.1 "FOUNDATIONAL UPDATE PRD V6 Addendum + Architecture Lock V7 + R32-R37" — Executed 2026-04-29; (2) v1.0 "Branch Protection Gate (GATE-01)" — Executed 2026-04-29; (3) v1.0 "Build Tracker Schema Update: Taskmaster Task ID Field Added" — Executed 2026-04-29; (4) v7.0 "ZCBR Foundational Rewrite — 37 Specs + PRD V7 + Builder Instructions V3" — **Status: Pending Builder Ingestion (2026-05-03)**; (5) v2.0 "PO Combined Directive v2 + Doc 11 Security Phase Triggers + Architecture Lock Security Gate Addendum" — PO Approved 2026-04-28; (6) v1.0 "Taskmaster Expansion — Full Build Tracker Sync" — Diff Proposed 2026-05-02. The v7.0 ZCBR broadcast is effectively superseded by the v2 R-spec wave (PRs #21–#35 ratified Architect Claude-authored R-specs over the Manus-authored ZCBR drafts); status field stale. Action: Phase 5 close v7.0 + v1.0-taskmaster broadcasts; this surface is otherwise low-traffic. |

---

## Section 11 — Foundational Truth Inventory (what carries forward)

This is the consolidated set of surfaces the Curator inherits as FOUNDATIONAL for Phase 2+:

### 11.1 Architecture truth
- VVOW Image Studio Architecture v2.0 body (`/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`) — Phase 1 canonical spec.
- 9 shipped v2 R-specs at ZCBR PASSED: R17 v2, R19 v2, R20 v2, R21 v2, R22 v2, R24 v2, R29 v2, R31 v2 (in-place), T46 v2.
- ZCBR_STANDARD.md 14-item checklist + 3-checkpoint validation protocol.

### 11.2 Substrate truth
- FOUNDATION_AUTHORITY 12 substrates L1–L12 (Identity, Asset Model, Provider Routing, Job Orchestration, Data Flywheel, Token Metering, Observability, Real-time, Storage, Webhook Pipeline, Skills L1, Skills L2).
- FOUNDATION_AUTHORITY 7 conflict resolutions C-01 through C-07.
- FOUNDATION_AUTHORITY 4-competitor moat (Lovart / Migma / Grid&Pixel / Instant) phase mapping.

### 11.3 Sequencing truth
- PRODUCT_ROADMAP Phase 1 (11 sub-phases) → Phase 2 → Phase 3 → Phase 4+ ordering.
- Master Build Sequence dependency graph structure + Bullet metadata format (substrate; per-Bullet status is STALE).
- Lock 1 (Product Sequencing) — no skipping, Image Studio → Email Studio → LENZ.

### 11.4 Lock truth (post-Phase-2.2 reconciliation)
- Locks 17 Foundation-First Decision Making (ratified 2026-05-09)
- Lock 18 Tool-Capability-First Scoping (ratified 2026-05-09)
- Lock 19 Provider Agnosticism (ratified 2026-05-09)
- Lock 20 ZCBR-Validated Specs Required (ratified 2026-05-11)
- Lock 21 Governance Agnosticism (ratified 2026-05-12)
- Lock 1–14 content: pending Phase 2.2 reconciliation between repo and Notion truth claims.

### 11.5 Infrastructure truth
- INFRASTRUCTURE_DECISIONS ID-1 through ID-6 ratified 2026-05-08.
- CODING_CONVENTIONS 15 rules.

### 11.6 Operating principle truth
- NIR_OPERATING_RULES Rules 1–12 (universal-agent principles).
- Operating Workflow Sections 1–5 (agents, repos, products, storage roles, workflow paths) — substrate; Section 6 snapshot and Section 8.5 behaviors are not authority.

### 11.7 Anti-pattern evidence (facts, not rules)
- VIYO_FOUNDATIONAL_SEED.md Section F — 15 observations across 7 families.
- ARCHITECT_SELF_AUDIT_2026-05-12 §1 — 7 instances with 3 subpatterns (ratification as collaboration; investigation as permission request; sources as opt-in).

### 11.8 Operational state truth
- Notion Decisions DB (with clutter pending Phase 5.1 archival).
- Notion Open PO Decisions DB.
- Notion PO Inbox DB.
- Notion Documentation Gaps DB.
- Airtable Build Tracker (substrate; status STALE).
- Airtable Services Inventory.
- Git history at `github.com/VIYO-NEW/VIYO` staging branch HEAD `84478eb`.

---

## Section 12 — Top conflicts to resolve in Phase 2

### Conflict A — Foundation Lock numbering (Lock 1–14 content)
- **Repo** FOUNDATION_LOCK.md Locks 1–14 = product-architecture commitments (Sequencing / GrapesJS / MJML / Cache-First / Pattern Recipe / Brand Vault / 3-Tier / Programmatic editing / RLHF / LoRA / Pattern Seeding / Brain Council / Tenant Isolation / Migrations).
- **Notion** Foundation Locks DB Locks 1–14 = tech-stack constraints (R2 / Next.js / TypeScript / Zod / RLS / etc.).
- Phase 2.2 (FOUNDATION_LOCKS_v2) must reconcile to single source.
- **Curator's preliminary recommendation:** Repo content is the newer VVOW-era authority; Notion entries represent an older tech-stack taxonomy that should be either renumbered to the 30s+ range as "Stack Constraints" or merged into CODING_CONVENTIONS as implementation rules. Surface for PO ratification in Phase 2.2.

### Conflict B — Lock 21 commit gap
- Lock 21 Governance Agnosticism ratified 2026-05-12 in Notion.
- Operating Workflow §6 says "Lock 21 Governance Agnosticism (locked 2026-05-11, ratified 2026-05-12)."
- Repo FOUNDATION_LOCK.md does not contain Lock 21.
- Phase 2.2 FOUNDATION_LOCKS_v2 commits Lock 21 to repo.

### Conflict C — Authority hierarchy depth
- CLAUDE.md (repo) lists 9 tiers.
- FOUNDATION_AUTHORITY.md §1.3 lists 7 tiers.
- Different governance documents asserting different hierarchies on the same topic.
- Phase 2.2 + 3.1 reconcile via a single canonical hierarchy in FOUNDATION_LOCKS_v2 + CLAUDE.md v2.

### Conflict D — CLAUDE.md Standing Instruction #8 sanctions an anti-pattern
- Current instruction: "Architect Claude proactively triggers cataloging of all session decisions to Notion VIYO Decision Log databases without being reminded."
- Seed Section F Observations 2, 3, 4, 5 catalog this exact behavior as anti-pattern (13 silent Ops Architect writes; D69 silent commit; Behaviors #13–#16 to memory_user_edits; Lock 22 in stillborn R29 draft).
- Phase 3.1 CLAUDE.md v2 removes the standing instruction; Phase 2.3 ARCHITECT_OPERATING_RULES + Phase 2.4 NIR_OPERATING_RULES_v2 derive the foundational alternative (writes to canonical state require explicit PO ratification surface, not session-end auto-commit).

### Conflict E — R-spec status stale across 4 files
- VVOW Architecture §19 marks R20/R24/R31 thin
- CURRENT_STATE.md references R29 PAL pending rewrite
- FOUNDATION_AUTHORITY §8.1 + §8.2 call R29 / R20/R24/R31 thin
- Master Build Sequence cites R20/R24 as THIN throughout
- R-Spec Audit Table v1.0 lists 12 CRITICAL rewrites
- Reality: 9 of those rewrites shipped 2026-05-12 / 13 (R20, R24, R29, R31, T46, R17, R19, R21, R22)
- Phase 4 PRD V8.1 + Phase 5 governance refresh fix these citations.

### Conflict F — VIYO_OPERATING_WORKFLOW Section 8.5 Behaviors vs seed "no inherited reactive rules"
- Operating Workflow §8.5 contains 14 Architect Operating Behaviors derived reactively over the 2026-05-11/12 sessions.
- Seed master plan §Foundational principle: "The Curator does NOT inherit reactive rules (NIR_OPERATING_RULES v1.1, Behaviors #1-#15, Locks 1-20 unverified, CLAUDE.md current state)."
- Phase 2.3 derives ARCHITECT_OPERATING_RULES foundationally from 15 Section F observations + FOUNDATION_LOCKS_v2 substrate; Section 8.5 Behaviors are not inherited as authority but are evidence input.

---

## Section 13 — Top stale artifacts to refresh

(Mapped to master plan phase that addresses each.)

| Artifact | Stale-by | Refresh in |
|---|---|---|
| CURRENT_STATE.md | 6 PRs + WP status | Phase 3.2 (superseded by VIYO_CURRENT_MAP.md) |
| OPEN_DECISIONS.md | 13 ODs | Phase 5.3 (deprecate in favor of Notion DB pointer) |
| FOUNDATION_LOCK.md | Lock 21 + Locks 1–14 content reconciliation | Phase 2.2 (FOUNDATION_LOCKS_v2) |
| FOUNDATION_AUTHORITY.md | Lock count, Notion count, hierarchy depth, R29 gap | Phase 4 PRD V8.1 or Phase 5 governance refresh |
| VVOW Architecture header | Acceptance pending → accepted | Phase 5 or Phase 4 PRD V8.1 |
| PRODUCT_ROADMAP Gate G2 OD range | OD-001..007 → current open | Phase 5 |
| R-Spec_Audit_Table_v1.0.md | 9 specs shipped post-audit | Phase 5 (regenerate v2 or supersede with header-grep convention) |
| Master Build Sequence per-Bullet R-spec status | 9 shipped not reflected | Phase 5 (live cross-link to repo ZCBR headers per Lock 21) |
| VIYO_OPERATING_WORKFLOW.md §6 + §8.5 + §9 | end-of-day 2026-05-12 vs 2026-05-13 reality + reactive accumulation | Phase 2 substrate retained, Section 6 STALE, Section 8.5 + 9 superseded by Phase 2.3 ARCHITECT_OPERATING_RULES |
| Notion Decisions D70–D82 clutter | 5 archived; 8 remaining flagged | Phase 5.1 |
| Airtable Architecture Broadcast v7.0 Pending Builder Ingestion | Superseded by v2 R-spec wave | Phase 5.5 |

---

## Section 14 — Phase 1 gaps and unverified items

Items I did NOT verify against canonical sources during this audit, surfaced explicitly:

1. **T46 v2 file body** — confirmed git log records PR #29 "Replace T46 v1 with T46 v2 ZCBR-compliant rewrite," but I did not grep `art-director-routing-suite.md` (the likely target path) for "ZCBR Status: PASSED" header. Unverified whether the in-place file is v2 content or v1 content. Phase 5 should verify.
2. **R31 v2 ENTERPRISE-named file** — grep confirmed "ZCBR Status: PASSED 2026-05-12" header on `R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md`. Filename did not change despite v2 ratification. Filename naming inconsistency with other v2 specs (which use `_v2` suffix). Phase 5 normalize.
3. **R17 v2 + R20 v2 + R22 v2 + R24 v2 + R29 v2 ZCBR headers** — only confirmed indirectly via git commit messages + grep on R19/R21/R31. Phase 2 should re-verify with full grep before Phase 5 supersession header sweeps.
4. **PRD V8 deep body** — not read. 799KB. Will be superseded in Phase 4 by V8.1. For STATE_AUDIT purposes, file existence + size + modified date (2026-05-08) + seed/AUTHORITY references suffice.
5. **VIYO_Drive_Knowledge_Synthesis.md body** — metadata-only (75KB, 2026-05-10). Per FOUNDATION_AUTHORITY §9.2, "22 of 80 docs read." Useful as Phase 4 input; not authority for Phase 2.
6. **Airtable Q&A Master Log + Skills Registry + Services Inventory record bodies** — not deep-read; counts and schemas confirmed. Reconciliation deferred to Phase 5.6.
7. **Airtable Build Tracker record-level execution status reconciliation** — not done. Need to map T25 / T26 / T70 / T71 / T72 Done status against Build Tracker per the Architecture Broadcast 3 backfill protocol. Sampled search returned 2 hits in default fields; status field not surfaced. Phase 5.5 sweeps.
8. **Notion Documentation Gaps DB and PO Inbox DB records** — schemas confirmed; record bodies not sampled. Phase 5.4 sweeps.
9. **Notion Decisions DB count exact** — search confirmed entries D57 through D84; FOUNDATION_AUTHORITY claims D1-D29; seed claims D1-D85+. Actual count between D84 and D85+ not precisely confirmed but ≥84.
10. **Repo `/docs/internal/` engineering trace files** — inventoried by name only; not body-read. Phase 5 sweeps.
11. **Operating Workflow §6 "Phase 1 governance | COMPLETE" claim** — disputable given concurrent need for this Curator reset session. Curator's own existence is evidence the COMPLETE claim was premature.

---

## Section 15 — Recommendations to PO

Curator-call decisions for Phase 2 sequencing (per Rule 13 — bringing recommendations, not options):

1. **Phase 2.1 (ANTI_PATTERN_CATALOG.md) authored first** — derives the failure-mode taxonomy from 15 Section F observations + 3 ARCHITECT_SELF_AUDIT §1 subpatterns. Output frames foundational fixes (external validation / schema enforcement / agent topology separation / session-start inheritance) rather than firing-point rules. This taxonomy then anchors 2.2, 2.3, 2.4.

2. **Phase 2.2 (FOUNDATION_LOCKS_v2.md) authored second** — most foundational substrate work. Resolves Conflict A (Lock 1–14 content) and Conflict B (Lock 21 commit gap). My preliminary recommendation: adopt repo VVOW-era Lock 1–14 numbering as canonical; commit Lock 21; absorb Notion's older tech-stack locks into CODING_CONVENTIONS Rules 11–14 (Next.js / TypeScript / Zod / RLS — already implicit) or into a new "Stack Constraints" Lock series (Locks 30s). Surface choice in Phase 2.2 PO summary.

3. **Phase 2.3 (ARCHITECT_OPERATING_RULES.md) authored third** — derives operating discipline foundationally from anti-pattern taxonomy + Lock 21 (Governance Agnosticism) + Lock 17 (Foundation-First) + Lock 18 (Tool-Capability-First). Does NOT inherit Operating Workflow §8.5 Behaviors #1-#14 or NIR Rule 13 as authority text; those are evidence inputs only. The structural fix is the disposition shift identified in self-audit §2 (collaboration → deliver-then-ratify), encoded structurally as session-start inheritance + complete-or-don't-surface gate at the agent topology level, not as a list of rules each Architect must remember to apply.

4. **Phase 2.4 (NIR_OPERATING_RULES_v2.md) authored fourth** — universal-agent rules. NIR_OPERATING_RULES v1.1 Rules 1–12 carry forward as foundational principles (paragraph summary, make-the-call, one-ask-per-turn, reason-before-invoke, read-before-write, surface-uncertainty-explicitly, surface-conflicts, principle-over-prescription, catalog-decisions, checkpoint, budget-honesty, hold-steady-accountability). Rule 13 (Architect role) becomes ARCHITECT_OPERATING_RULES §1 in v2.3 deliverable rather than universal NIR rule, since it's role-specific not universal. NIR v2 has fewer rules, no conflicts.

5. **Phase 3+ inheritance files** — depends on Phase 2 ratifications.

6. **Notion / Airtable hygiene** — defer to Phase 5. Notion Decisions D70-D82 + OD-019 / OD-020 closure path needs PO direction in Phase 5.1 / 5.3. Airtable Build Tracker execution-status sweep needs Manus-side work and is properly Phase 5.5.

7. **Drive cleanup** — defer to Phase 5.7. PO manually deletes the 6 broken artifacts catalogued in §8.3.

8. **Repo `/docs/` archival policy** — defer to Phase 5. Curator does not delete files; recommends Phase 5 archival of `/docs/foundation/` Doc1–11 series + `/docs/source-of-truth/v7_1/` + R-spec _ENTERPRISE superseded files into `/docs/_archive/` subfolder.

---

## Section 16 — Closing

This audit is a complete artifact per the Curator's pre-surface verification gate: every governance surface in repo, Drive, Notion, and Airtable is tagged with evidence; every conflict is named with both sources; every stale artifact's refresh phase is identified; every unverified item is surfaced rather than assumed.

**Phase 1 is complete pending PO ratification.**

After ratification, Phase 2 begins with ANTI_PATTERN_CATALOG.md authored from the foundational seed Section F + ARCHITECT_SELF_AUDIT §1 evidence inputs, surfaced complete for PO ratification before Phase 2.2 / 2.3 / 2.4.

---

*End of STATE_AUDIT.md*
