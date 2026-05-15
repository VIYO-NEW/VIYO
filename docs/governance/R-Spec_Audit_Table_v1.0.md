# R-Spec Audit Table v1.0

**Audit date:** 2026-05-11
**Auditor:** Architect Claude (Opus 4.7)
**Standard:** ZCBR_STANDARD.md v1.0 (PO-ratified 2026-05-11)
**Scope:** Every R-spec, T-spec, and architecture doc cited by Master Build Sequence v1.0
**Method:** Evidence-based audit from VVOW Architecture cross-reference table + FOUNDATION_AUTHORITY documented gaps + PO audit findings + Notion Decision history
**Note:** Second-pass mechanical ZCBR check on each actual spec file produces final verdicts when files are accessible. For triage scheduling, this audit is sufficient — CRITICAL specs already carried evidence flags before this audit; ZCBR formalizes the decision.

---

## Triage rule (Part 3 binding, locked 2026-05-11)

- **CRITICAL** — blocks a Phase 0 or Phase 1 Bullet within next 30 days. Rewrite scheduled immediately as B-XC Bullet.
- **IMPORTANT** — blocks a Phase 1B or Phase 2 Bullet within 30-90 days. Stub Bullet placeholder created; rewrite triggered just-in-time when dependent Bullet enters next-3 window.
- **LATER** — blocks a Phase 3 or Phase 4+ Bullet >90 days out. Deferred to appendix; rewrite triggered at phase activation gate.

Goal: do not rewrite all R-specs upfront. Phase 1 may shift dependent Bullet scope; rewriting LATER specs now risks wasted work.

---

## Audit Table

Status legend: **PASS** = ZCBR-compliant as is | **MINOR FIX** = small targeted update via Manus directive | **REWRITE** = Architect Claude authors canonical version | **SUPERSEDED** = replaced by another doc | **PENDING RE-VALIDATION** = needs mechanical ZCBR check against actual file (audit assumption)

Triage legend: **CRIT** = CRITICAL | **IMPT** = IMPORTANT | **LATR** = LATER | **n/a** = no triage (PASS or SUPERSEDED or n/a)

| # | Spec | Status | Triage | Earliest dependent Bullet | All dependents | Rewrite Bullet ID | Evidence source |
|---|---|---|---|---|---|---|---|
| 1 | R17 UX Architecture | MINOR FIX | CRIT | B-1.00 (P1) | B-1.00 onward (all VVOW Zone wiring) | B-XC.18 | VVOW §19 marks "Reference" — but VVOW supersedes R17 for Phase 1 UX (VVOW header authority statement). MINOR FIX: align R17 to VVOW 3-Zone architecture, add ZCBR header. |
| 2 | R18 Global Wiring Map | PENDING RE-VALIDATION | IMPT | All Bullets (cross-system events) | All Bullets | JIT stub | VVOW §19 marks "Reference". Quality unverified — could be PASS or MINOR FIX. Audit when first dependent Bullet hits. |
| 3 | R19 LLM Orchestration | PENDING RE-VALIDATION | CRIT | B-0.14 (P0) | B-0.14, B-0.15, B-0.16, B-1.03, B-1.04, B-2.02, B-2.30 | B-XC.19 | VVOW §19 marks "Reference". Critical because Brain Council depends. Audit + likely MINOR FIX. |
| 4 | **R20 Database Schema** | **REWRITE** | **CRIT** | B-0.03 (P0) | B-0.03, B-0.06, B-0.12, B-1.00, B-1.16, B-2.31, B-2.34 | **B-XC.02** (already in v1.0) | VVOW §19 marks "**THIN — needs rewrite** to capture parent_asset_id lineage, JSONB metadata, pgvector embeddings". PO audit May 8. |
| 5 | R21 Infrastructure | MINOR FIX | CRIT | B-0.01 (P0) | B-0.01, B-0.05, B-0.08, B-0.09, B-0.10, B-0.19, B-0.20, B-0.21, B-2.37 | B-XC.20 | VVOW §19 marks "Canonical for Cloudflare R2, Render, deployment". MINOR FIX: add ZCBR header + verify all R21 references match VVOW + ID-3. |
| 6 | R22 Security Auth | PENDING RE-VALIDATION | CRIT | B-0.02 (P0) | B-0.02, B-1.01, B-1.02, B-2.5.07 | B-XC.21 | VVOW §19 marks "Reference". Critical for Phase 0 identity work. Audit + likely MINOR FIX. |
| 7 | R23 Cost Engine | MINOR FIX | CRIT | B-0.07 (P0) | B-0.07, B-1.14 | B-XC.22 | VVOW §19 marks "Canonical for token economics". MINOR FIX: align to D8 5-tier pricing, D56 Phase 0/Phase 1 split, Lock 8 programmatic ops 0 tokens, add ZCBR header. |
| 8 | **R24 Image Pipeline** | **REWRITE** | **CRIT** | B-1.00 (P1) | B-1.00 onward (all P1 generation + editing) | **B-XC.03** (already in v1.0) | VVOW §19 marks "**Mandatory for every VVOW directive; THIN — needs rewrite** to capture model registry, Pattern Recipe schema, B1-B11 tools". PO audit May 8. |
| 9 | R25 Video / IG Intelligence | PENDING RE-VALIDATION | IMPT | B-1B.02 (P1B) | B-1B.02 | JIT stub | Listed in Master Build Sequence as "current". Audit when B-1B.02 enters next-3 window. |
| 10 | R26 Creative Concept | PENDING RE-VALIDATION | IMPT | B-2.02 (P2) | B-2.02 | JIT stub | VVOW §19 marks "Reference only". Likely PASS. Audit when B-2.02 enters next-3. |
| 11 | R27 Composable Sections | PENDING RE-VALIDATION | IMPT | B-2.01 (P2) | B-2.01, B-2.32, B-2.33, B-2.34, B-2.35 | JIT stub | VVOW §19 marks "Reference for Phase 2 Email Studio integration". Audit when B-2.01 enters next-3. |
| 12 | R28 Timer Service | REWRITE | LATR | B-4.03 (P4+) | B-4.03 | Deferred appendix | FOUNDATION_AUTHORITY §8.3: "deferred but spec live in repo without deferral header". Per ID-4 deferral, rewrite at phase activation gate before B-4.03. |
| 13 | **R29 PAL** | **REWRITE** | **CRIT** | B-0.04 (P0) | All Provider-routing Bullets (50+ across all phases) | **B-XC.01** (already in v1.0) | D55 ratified: R29 PAL ESP/e-commerce only; AI Plugin Registry has no R-spec. Rewrite as unified Plugin Registry covering both scopes. Blocks B-1.00 routing logic. |
| 14 | R30 Product Animation | PENDING RE-VALIDATION | LATR | B-1.09 (P1) | B-1.09, B-1.10 | Deferred appendix | VVOW §19 marks "Reference for video pipeline". Used only for A19 Lookbook video aspects + A15 Brand Kit Mode mockup suite. Audit at phase activation. |
| 15 | **R31 Product Data Extraction** | **REWRITE** | **CRIT** | B-0.17 (P0) | B-0.17, B-1.15 | **B-XC.04** (already in v1.0) | VVOW §19 marks "**THIN — needs rewrite** to capture full Brand Vault organization". PO audit May 8. |
| 16 | R32 Email Engine | REWRITE | IMPT | B-2.01 (P2) | All P2 + P2.5 + P3 Bullets | JIT stub | FOUNDATION_AUTHORITY §8.6: "inventoried but not read fully — 38 KB". Master Build Sequence B-XC.05 schedules full read + extraction. Likely REWRITE based on scope and prior Manus quality issues. JIT when B-2.01 enters next-3. |
| 17 | R33 (not directly cited in Master Build Sequence) | PENDING RE-VALIDATION | LATR | n/a (no current dependency) | None | Deferred appendix | Listed in original directive's "explicitly known thin" set but not cited in Master Build Sequence v1.0. Mark for later audit if a future Bullet cites. |
| 18 | R35 (not directly cited) | PENDING RE-VALIDATION | LATR | n/a | None | Deferred appendix | Listed in known-thin set; not cited in Master Build Sequence. Audit if future Bullet cites. |
| 19 | R36 HYVE | PENDING RE-VALIDATION | IMPT | B-1B.05 (P1B) | B-1B.05 | JIT stub | FOUNDATION_AUTHORITY §8.6: "inventoried but not read fully — 25 KB". Audit when B-1B.05 enters next-3. |
| 20 | R37 MAAX | PENDING RE-VALIDATION | IMPT | B-1B.04 (P1B) | B-1B.04, B-2.02, B-2.27 | JIT stub | FOUNDATION_AUTHORITY §8.6: "inventoried but not read fully — 11 KB". Audit when B-1B.04 enters next-3. |
| 21 | R38 SYPHON | PENDING RE-VALIDATION | IMPT | B-1B.03 (P1B) | B-1B.03 | JIT stub | FOUNDATION_AUTHORITY §8.6: "inventoried but not read fully — 10 KB". Audit when B-1B.03 enters next-3. |
| 22 | R39 Global Admin | PENDING RE-VALIDATION | LATR | B-4.01 (P4+) | B-4.01 | Deferred appendix | Phase 4+ admin expansion. Audit at phase activation gate. |
| 23 | R46 Email Ingestion | MINOR FIX | IMPT | B-1B.01 (P1B) | B-1B.01, B-2.31 | JIT stub | VVOW §10.4: "Covers IMAP-based ingestion only — does NOT cover Milled web scraping (separate pipeline)". MINOR FIX: add ZCBR header + explicit scope statement + cross-link to Pattern Seeding pipeline in B-1.05. |
| 24 | R49 (not directly cited) | PENDING RE-VALIDATION | LATR | n/a | None | Deferred appendix | Listed in known-thin set; not cited in Master Build Sequence. |
| 25 | **R52 Disaster Recovery** | **SUPERSEDED** | **CRIT** | B-0.21 (P0) | B-0.21 | **B-XC.23** (new — author fresh runbook) | FOUNDATION_AUTHORITY §8.4: "anomalously 334 KB. Quality unverified. Sample before trusting". Mitigation locked in Master Build Sequence v1.0 B-0.21: "rewrite runbook fresh, don't trust R52 wholesale". SUPERSEDED by new fresh runbook (B-XC.23). |
| 26 | R53 (not directly cited) | PENDING RE-VALIDATION | LATR | n/a | None | Deferred appendix | Listed as "assumed current but unverified". Audit if future Bullet cites. |
| 27 | **T46 Art Director Routing Suite** | **REWRITE** | **CRIT** | B-1.00 (P1) — via B-XC.06 prereq | B-XC.06 schedules rewrite; B-1.00 + B-1.07 + B-1.12 implicitly depend on tier numbering being correct | **B-XC.06** (already in v1.0) | FOUNDATION_AUTHORITY §7.3 + Section 8: "Tier numbering inverted — T46 (April) had Tier 1 = direct, Tier 2 = aggregator. VVOW supersedes: Tier 1 = aggregators. T46 to be rewritten." |
| 28 | T47 Studio Editing Tools | PENDING RE-VALIDATION | CRIT | B-1.11 (P1) | B-1.11, B-1.12, B-1.13 | B-XC.24 | Lives in repo as `/docs/architecture/studio-editing-tools.md`. Predates ZCBR_STANDARD. Audit + likely MINOR FIX to add ZCBR header + align with Conflict Resolution C-01 (Lovart-style B3 lazy extraction). |
| 29 | T48 Webhook Pipeline | SUPERSEDED | n/a | n/a (D11 supersedes) | n/a | n/a | Notion D11 (May 3) supersedes T48 wholesale. Per FOUNDATION_AUTHORITY Section 6 C-07. T48 file stays in repo with SUPERSEDED header pointing to D11; no rewrite needed. |
| 30 | T33-T36 Brand Chat Comments | PENDING RE-VALIDATION | IMPT | B-2.5.01 (P2.5) | B-2.5.01, B-2.5.02, B-2.5.03 | JIT stub | Lives in repo as `/docs/architecture/brand-chat-comments-subsystem.md`. Phase 2.5 deferred per VVOW. Audit when B-2.5.01 enters next-3. |
| 31 | VVOW Image Studio Architecture | **EXEMPT** | n/a | All Phase 1 Bullets | All P1 Bullets | n/a | Higher-tier authority document per CLAUDE.md hierarchy. Not subject to ZCBR check (per skill spec Step 3). |
| 32 | FOUNDATION_AUTHORITY.md | **EXEMPT** | n/a | All Bullets | All Bullets | n/a | Higher-tier authority. Not subject to ZCBR. |
| 33 | V8 PRD | **EXEMPT** | n/a | All Bullets | All Bullets | n/a | Higher-tier authority. Not subject to ZCBR. |
| 34 | Notion Decisions | **EXEMPT** | n/a | Various Bullets | Various Bullets | n/a | Higher-tier authority. Not subject to ZCBR. |
| 35 | Foundation Locks (1-20) | **EXEMPT** | n/a | All Bullets | All Bullets | n/a | Higher-tier authority. Not subject to ZCBR. |
| 36 | Conflict Resolutions (C-01 through C-07) | **EXEMPT** | n/a | Various Bullets | Various Bullets | n/a | Higher-tier authority. Not subject to ZCBR. |
| 37 | Master Build Sequence v1.x | **EXEMPT** | n/a | n/a (it cites Bullets, not cited by them) | n/a | n/a | Higher-tier authority. Not subject to ZCBR. |

---

## Audit summary

| Category | Count | Action |
|---|---|---|
| REWRITE | 6 | R20, R24, R29 PAL, R31, R32, T46 |
| SUPERSEDED | 2 | R52 (replaced by fresh runbook), T48 (replaced by Notion D11) |
| MINOR FIX | 4 | R17, R21, R23, R46 |
| PENDING RE-VALIDATION (audit when dependent Bullet approaches) | 14 | R18, R19, R22, R25, R26, R27, R30, R33, R35, R36, R37, R38, R39, R49, R53, T33-T36, T47 |
| EXEMPT (higher-tier authority) | 7 | VVOW, FOUNDATION_AUTHORITY, V8 PRD, Notion Decisions, Foundation Locks, Conflict Resolutions, Master Build Sequence |

**Triage distribution:**
- **CRITICAL (rewrite/fix scheduled now as B-XC Bullet):** 12 specs → B-XC.01 (R29 PAL), B-XC.02 (R20), B-XC.03 (R24), B-XC.04 (R31), B-XC.06 (T46), B-XC.18 (R17), B-XC.19 (R19), B-XC.20 (R21), B-XC.21 (R22), B-XC.22 (R23), B-XC.23 (R52→fresh runbook), B-XC.24 (T47). Plus B-XC.17 ZCBR plumbing (meta — gates all the other XC Bullets).
- **IMPORTANT (JIT stub created, fires when dependent Bullet enters next-3 window):** 10 specs → R18, R25, R26, R27, R32, R36, R37, R38, R46, T33-T36 (Brand Chat Comments)
- **LATER (deferred appendix):** 7 specs → R28, R30, R33, R35, R39, R49, R53

CRITICAL count of 12 is below the original suspect list of 16 because the triage rule downgrades specs that aren't currently blocking Phase 0 or Phase 1 work. R32 (Email Engine, 220 features dependent) is the largest spec but it's Phase 2 (IMPORTANT), so its rewrite is scheduled JIT rather than upfront. This is the just-in-time discipline working as intended.

---

*End of R-Spec Audit Table v1.0*
