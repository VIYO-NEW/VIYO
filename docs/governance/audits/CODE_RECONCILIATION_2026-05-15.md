# CODE_RECONCILIATION_2026-05-15.md

Authoritative reconciliation of repo code state against current Phase 1 Image Studio MVP planning structure, plus locked execution path to first B-1.00 build directive.

Authored 2026-05-15 by PO-side Claude (Opus 4.7) via direct repo read at HEAD `f5ad28b`. Reviewed and ratified by PO before commit. Cross-checked against prior PO-side Claude session for scoping intent (treated as leads, not canonical).

Purpose: dissolve the "shipped" vs reality drift in VIYO_CURRENT_MAP §2, establish what is actually present in the repo against the Phase 1 MVP critical path, lock the execution path, and install cross-surface continuity discipline so this audit does not need to be re-derived again.

---

## §1 — Headline finding

The drift in VIYO_CURRENT_MAP §2 is not a counting error. It is a category error: §2 names acceptance gates using **Build Tracker Feature IDs** (T25-STUDIO-BACKEND, T26-STUDIO-FRONTEND, T70-CACHE-ROUTE-META, T71, T72, T73 — Airtable functional-capability IDs) and marks them ✅ Shipped without verifying the underlying capability is actually shipped. The repo uses a **separate identifier space** — Taskmaster Task IDs in git commits (T1–T103+ — work-unit IDs). The two spaces have never been reconciled in canonical state.

Master Build Sequence v1.1 line 252 itself states T25-STUDIO-BACKEND and T26-STUDIO-FRONTEND are "In Progress," not Done. VIYO_CURRENT_MAP §2 contradicts its own substrate. MBS is more honest than the MAP on this question, but MBS line 3 declares itself "DRAFT v1.1 — pending PO ratification" — neither source is fully ratified, and they disagree.

**The actual on-disk picture:** real code exists for the Studio Core Loop (~4,000 lines of substrate including 888-line Studio UI component, 826-line Art Director Router, 869-line shared schema spine, 9 DB migrations). It does not constitute "shipped" against B-1.00's acceptance criteria. It constitutes substantive implementation-in-progress against B-1.00, with named gaps.

### §1.1 — Scope discipline (load-bearing)

**This audit is scoped to Phase 1 Image Studio MVP ONLY.** The Airtable Build Tracker holds 580 features spanning all VIYO phases through Phase 4+ (Email Engine, Brand Team Collaboration, LENZ Intelligence, Timer Service, BFCM, additional ESPs, public REST API, etc.). Auditing all 580 to ship Image Studio MVP is out-of-scope over-scoping. Taskmaster (`.taskmaster/tasks/`) similarly carries full-VIYO scope tasks across all phases — see Phase A item A1 verification.

**MVP scope per VIYO_CURRENT_MAP §2:** sub-phases 1.1–1.8 + 1.11 + admin shells (B-1.01, B-1.02) + billing UI (B-1.14) + Shopify catalog sync (B-0.17) + 22 generation modes (B-1.07/08/09) + Designer Brain (B-1.04) + usability (B-1.15, B-1.16) + Phase 1 Acceptance (B-1.18). Plus B-1.19 Full Cost Suite (admin) per prior PO-side session lead — verify against PRD V8.1 §6.7 during Phase A.

**Mapped Bullet count for B-0.01 substrate audit scope: approximately B-0.01 through B-1.19, covering ~80–150 Build Tracker features.** Not 580. The remainder is long-horizon inventory, not MVP critical path.

Decision 47 in the Notion Decision Log establishes the principle: *"When Build Tracker says feature X is P5 but it belongs in Phase 3 per VIYO's actual phase plan, the phase plan wins."* This audit follows that principle — MBS Bullet scope wins over Build Tracker phasing.

### §1.2 — Path ratification

After full MOAT analysis (RLHF learning loop, Brand Vault organization, Pattern DB cache, 22 generation modes including A15 Brand Kit Mode, editing tools wired to Brand Vault), **PO has locked Path 1: hold full MVP scope, optimize execution.** Scope cut alternatives considered and rejected on moat-preservation grounds. Optimization comes from OD-009 parallel-lanes ruling + Manus parallel tracks + Cross-Surface Continuity Discipline preventing relay-cost accumulation.

**Target timeline:** 11–17 weeks to public-launchable Image Studio MVP per PRD V8.1 §3.3 (with parallel Composer Queue lanes).

---

## §2 — The two identifier spaces

| Identifier space | Where it lives | What it identifies | Examples |
|---|---|---|---|
| **Build Tracker Feature IDs** | Airtable base `appo5mNncCCzKcIRk`, table `tblIJUzJoCCjWXaMQ` (580 records — all VIYO phases) | Functional capabilities to build | T24-STUDIO-LAYOUT, T25-STUDIO-BACKEND, T26-STUDIO-FRONTEND, T32-AUTO-SAVE-VAULT, T70-CACHE-ROUTE-META, T71, T72, T73, IMG-01, AUTH-01, P0-04, PERM-01, MFA-01 |
| **Taskmaster Task IDs** | Git commit messages (apps/, packages/) | Work units that produced commits | T1=monorepo, T2=db schema, T3=auth+RLS, T7=admin portal, T9=Stripe billing, T46=Art Director Router, T72=R2 wiring (git), T#71=billing token economics |

Relationship: many-to-many. One Taskmaster task can implement parts of multiple Build Tracker features. One Build Tracker feature may require multiple Taskmaster tasks to be Done. STATE_AUDIT line 286 noted this without operationalizing it.

---

## §3 — Repo code inventory (HEAD `f5ad28b`)

Verified by direct file read. Line counts and file paths are observations of state at HEAD per Lock 21 exclusion.

### §3.1 — Studio Core Loop substrate (relevant to B-1.00)

| Path | Lines | Purpose | Maps to Build Tracker Feature |
|---|---|---|---|
| `apps/web/src/components/studio/ImageStudio.tsx` | 888 | Studio UI component — 3-zone, prompt → render → save flow | T24-STUDIO-LAYOUT, T26-STUDIO-FRONTEND |
| `apps/web/src/components/studio/ImageStudio.test.ts` | 175 | Test coverage for ImageStudio | Same |
| `apps/web/src/lib/studio-api.ts` | 147 | Studio API client | T26-STUDIO-FRONTEND |
| `apps/web/src/lib/studio-contract.ts` | 204 | Mode + aspect ratio + editing tool definitions | T26-STUDIO-FRONTEND |
| `apps/worker/src/lib/ai/image-router.ts` | **826** | Art Director Router T46 v6.1 — synchronous routing, A1–A22 modes, Gemini-first cache, Claude 3.5 fallback, Brand Vault @mention, R2 hooks | T21-ART-DIRECTOR, T25-STUDIO-BACKEND, T70-CACHE-ROUTE-META |
| `apps/worker/src/lib/ai/editing-router.ts` | 47 | Contract layer for 10 editing tools (B1–B10) | T73 (contract only) |
| `apps/worker/src/lib/ai/provider-registry.ts` | 223 | Plugin Registry — provider descriptors, rollback, selection | T46, B-0.04 substrate |
| `apps/worker/src/lib/ai/image-patterns.ts` | 154 | Pattern cache lookup + mark-used | T70-CACHE-ROUTE-META |
| `apps/worker/src/lib/ai/embeddings.ts` | (~) | Gemini embedding generation | T70 substrate |
| `apps/worker/src/lib/ai/router-config.ts` | (~) | Formula weights config | T46 |
| `apps/worker/src/lib/ai/router-observability.ts` | 33 | Trace IDs + recordRouterDecision | T46 |
| `apps/worker/src/lib/ai/fallback-prompts.ts` | (~) | Zero-shot fallback prompt assembly | T46 substrate |
| `apps/worker/src/lib/token-engine.ts` | 270 | Token metering — checkBilling / deduct / balance | T9, T71, B-0.07 substrate |
| `apps/worker/src/trpc/routers/art-director.ts` | 36 | tRPC route for artDirector.routeGeneration | T26-STUDIO-BACKEND wiring |
| `packages/shared/src/schemas/art-director.ts` | **869** | Shared schema spine — RouteGenerationInput/Response, modes, editing tools, persistence | Substrate for B-1.00 |

**Total Studio Core Loop substrate: ~4,000+ lines of substantive code, not stub.**

### §3.2 — Database migrations (`packages/db/drizzle/`)

| Migration | Lines | Task | Purpose |
|---|---|---|---|
| `0001_extensions.sql` | 7 | T2 | pg extensions (pgvector, etc.) |
| `0002_tables.sql` | 288 | T2 | R20 base schema — 14 tables |
| `0003_functions.sql` | 77 | T2 | RPC helpers |
| `0004_auth_workspace_members.sql` | 270 | T3 | Workspace membership |
| `0005_t3_hotfix_security_performance.sql` | 95 | T3 | Security/perf refinements |
| `0006_t9_billing.sql` | 355 | T9 | Stripe billing tables |
| `0007_t45_composite_database_foundation.sql` | 367 | T45 | Brands, comments, webhooks, notifications, integrations |
| `0008_t72_assets_brand_id.sql` | 56 | T72 | assets table + brand_id (Brand Vault) |
| `0009_pia1_proprietary_intelligence_foundation.sql` | 205 | PIA-1 | Privacy gates schema |

**Total: 9 migrations, 1,720 SQL lines.**

### §3.3 — Schema spine (`packages/db/src/schema/`)

14 schema files: billing, collaboration, cost, email, identity, image-intelligence, integrations, llm, products, proprietary-intelligence, rlhf, timer, webhooks, plus index. Substantive coverage of identity, billing, brand vault, RLHF, webhooks, PIA.

### §3.4 — Other repo state

| Surface | State |
|---|---|
| `apps/admin/` | T7 Admin Portal — 12 pages with auth wiring, router, Supabase, theme |
| `apps/web/` | Studio + billing pages, token UI components, auth + Supabase wiring |
| `apps/main/` | Marketing/landing app shell — minimal |
| `apps/worker/` | tRPC server + Inngest billing + Stripe webhooks + token engine + middleware + AI router substrate + v1 routes |
| `packages/shared/` | Schemas, auth, events, security across all surfaces |
| `packages/ui/` | Tailwind preset + Button primitive |
| `.taskmaster/` | state.json (currentTag: master) — full scope verification pending Phase A item A1 |
| `docs/research_specs/` | 7 v2 specs + R31_ENTERPRISE (ZCBR PASSED) + v1 archives |
| `docs/architecture/` | VVOW Image Studio v2.0 + art-director-routing-suite.md (T46 v2) |
| `docs/governance/` | All governance state |

---

## §4 — Sub-phase §2 corrected status (honest read)

Replaces VIYO_CURRENT_MAP §2 lines 49–60.

| Sub-phase | MAP §2 claim | Honest status |
|---|---|---|
| 1.1 Core Loop | ✅ Shipped | **🟡 IN PROGRESS** — substantive substrate (~4,000 ln); B-1.00 acceptance not verified |
| 1.2 Pattern DB cache | ✅ Shipped | **🟡 PARTIALLY SHIPPED** — substrate complete; end-to-end verification pending |
| 1.3 Token billing | ✅ Shipped | **✅ SUBSTRATE SHIPPED** — T9 backend + frontend + token-engine integrated |
| 1.4 R2 + Brand Vault | ✅ Shipped | **✅ SHIPPED** — assets + lineage + JSONB + pgvector + R2 |
| 1.5 Editing Router | ⏸ PAUSED | **⏸ CONTRACT LAYER ONLY** — no editing tool implementation; gated on OD-019 + T47 v2 |
| 1.6 Multi-variant | NOT STARTED | **NOT STARTED** |
| 1.7 Full editing tools | NOT STARTED | **NOT STARTED** |
| 1.8 RLHF feedback loop | NOT STARTED | **NOT STARTED** — Decision 52 mandates 1,000 events accumulated before Phase 2 |
| 1.9 Pattern Seeding | DEFERRED V1.0.5 | **DEFERRED** |
| 1.10 Brand LoRA | DEFERRED V1.0.5 | **DEFERRED** |
| 1.11 Gap closure | NOT STARTED | **NOT STARTED** — public-launch blocker |

**Net read:** 1.3 + 1.4 substantively shipped; 1.1 + 1.2 in progress; 1.5 contract-only; rest not started. **"Shipped 1.1–1.4" framing in current MAP §2 overstates by approximately one sub-phase.**

---

## §5 — Phase 0 Bullet status reconciliation

B-0.22 Phase 0 Acceptance Gate gates B-1.00. **Phase 0 has 22 Bullets total — this is Phase 0, not 580 features.**

| Bullet | Status | Evidence |
|---|---|---|
| B-0.01 Substrate Audit | **INCOMPLETE** — no per-Phase-1-MVP-feature Status table | STATE_AUDIT is diagnostic, not gap-confirmed audit |
| B-0.02 L1 Identity & Multi-Tenancy | **SUBSTANTIVELY COMPLETE** — MFA scaffold status unclear | T3 commits, migrations 0004 |
| B-0.03 L2 Asset Model | **COMPLETE** | T72 afa65ef, migration 0008 |
| B-0.04 L3 Provider Routing | **SUBSTANTIVELY COMPLETE** | T8 + provider-registry.ts |
| B-0.05 L4 Job Orchestration | **COMPLETE** | T5 Inngest + OTEL |
| B-0.06 L5 Data Flywheel | **PARTIALLY COMPLETE** — end-to-end tests not surfaced | T2 schema + image-patterns.ts |
| B-0.07 L6 Token Metering | **COMPLETE** | T9 + token-engine.ts |
| B-0.08 L7 Observability | **SUBSTANTIVELY COMPLETE** | T12 Sentry + router-observability |
| B-0.09 L8 Real-time Substrate | **STATUS UNCLEAR** | — |
| B-0.10 L9 Storage finalization | **SUBSTANTIVELY COMPLETE** | T72 + runbooks |
| B-0.11 L10 Webhook Pipeline | **PARTIALLY COMPLETE** | T45 + stripe-webhooks |
| B-0.12 L11 Pattern Substrate | **COMPLETE** | T2 + image-patterns.ts |
| B-0.13 L12-A Builder Technical Skills | **INCOMPLETE** — no `/docs/skills/` in repo; Portal-vs-repo PO ruling pending (Phase A A3) | — |
| B-0.14 L12-B Brain Pattern Skills (skills_registry) | **STATUS UNCLEAR** — no clear skills_registry table found | — |
| B-0.15 Two-layer prompt assembly | **PARTIALLY COMPLETE** | fallback-prompts.ts exists |
| B-0.16 Platform Skills execution | **INCOMPLETE** — `skills.pickForTask()` not in repo | — |
| B-0.17 Shopify connector | **INCOMPLETE** — products schema exists, no Shopify adapter | — |
| B-0.18 Klaviyo connector | **DROPPED FROM MVP** per §2 | — |
| B-0.19 Email Sender (Resend) | **INCOMPLETE** | — |
| B-0.20 Health checks | **COMPLETE** | T6, T90 |
| B-0.21 Backup + DR | **INCOMPLETE per repo** — R52 v2 runbook missing. Verify PRD V8.1 §3.5 reclassification (Phase A) | — |
| **B-0.22 Phase 0 Acceptance Gate** | **CANNOT PASS** — multiple prereqs incomplete | — |

**Net read:** ~13 of 22 Phase 0 Bullets substantively shipped, 1 dropped, ~8 incomplete or unclear.

---

## §6 — R-spec implementation readiness

| R-spec | ZCBR Status | Implementation-ready for |
|---|---|---|
| R17 v2 UX | PASSED 2026-05-12 | B-1.00 + downstream UI |
| R19 v2 LLM Orchestration | PASSED 2026-05-12 | B-0.14, B-0.15, B-0.16 |
| R20 v2 DB Schema | PASSED | Foundational; B-0.02, B-0.03, B-1.00 |
| R21 v2 Infrastructure | PASSED 2026-05-12 | B-0.01, B-0.05, B-0.08, B-0.09, B-0.10 |
| R22 v2 Security & Auth | PASSED 2026-05-12 | B-0.02, B-1.01, B-1.02 — re-audit recommended (11 TBDs) |
| R24 v2 Image Pipeline | PASSED | B-1.00, B-1.07-09 |
| R29 v2 PAL | PASSED | B-0.04, B-1.00, B-0.17, B-0.18 |
| R31 v2 Product Data | PASSED 2026-05-12 | Brand Vault enrichment — naming mismatch (file _ENTERPRISE, content v2) |
| T46 v2 Art Director | PASSED 2026-05-12 | B-1.00, B-XC.07-09 substrate — location mismatch (`/docs/architecture/`) |

**Not ZCBR PASSED — MVP critical path gaps per PRD V8.1 §5.6 + §7.5:**

| Missing | Gates | Effort |
|---|---|---|
| R23 v2 Cost Reconciliation | B-0.07, B-1.14 | M |
| R24 v2.1 (A15 + B1–B10 + G8) | B-1.10, B-1.11/12/13 | S |
| R33 Shopify | B-0.17 | M |
| R37 MAAX brand preference signals | art-director-routing + rlhf-event-emission skills cite as substrate (cautiously per skill self-awareness); B-XC.18 territory audit-and-fix | M |
| T47 v2 Studio Editing Tools | B-1.11/12/13 | M |

**Note:** R52 v2 DR runbook reclassified POST-LAUNCH per PRD V8.1 §3.5 + §5.6 + §7.5 verbatim 2026-05-14 (Phase A A5 ✅ 2026-05-15) — NOT MVP-blocking. Removed from gap table. B-0.21 minimum DR substrate (Supabase PITR + R2 cross-region + `/docs/runbooks/` + tabletop) is the MVP-blocking DR substrate, verified separately in Phase B.

---

## §7 — Skill specs B-XC.07–10 status (D63 Path E)

Per Decision 63 reaffirmed 2026-05-15 (Notion `35d9a84a-4679-8121-a174-e66c3eb2c9a1`): skills do NOT live in any git repo. Path E flow: Architect authors `SKILL_<name>.md` in Drive claude folder → PO ratifies → PO uploads to Portal product via admin UI → runtime via `skills.pickForTask()`.

| Bullet | Skill | Drive (authoring) | Portal (runtime canonical) |
|---|---|---|---|
| B-XC.07 | image-generation-pipeline | Authored | Uploaded v1.0.0 2026-05-12 |
| B-XC.08 | pattern-cache-lookup | Authored | Uploaded v1.0.0 2026-05-12 |
| B-XC.09 | art-director-routing | Authored | Uploaded v1.0.0 2026-05-12 |
| B-XC.10 | rlhf-event-emission | Authored | Uploaded v1.0.0 2026-05-12 |

**Acceptance satisfied:** Portal upload state per D63 Path E satisfies B-XC.07-10 acceptance per MBS v1.1 D63-aligned text (commit `4725660`). No `/.skills/` repo mirror needed; previous "NOT IN REPO" framing was anti-pattern artifact (cited K1=COPY stale substrate; D63 dropped K1 2026-05-11).

**Companion skill (B-XC.17):** `zcbr-spec-validation` v1.0.0 Uploaded 2026-05-12 also under D63 Path E. Out of §7 table scope (B-XC.07-10) but noted for completeness.

**Issue C version inconsistency park-item (logged to SESSION_STATE):** Portal listing shows v1.0.0 for all 5; Drive-source markdown bodies for image-generation-pipeline + rlhf-event-emission have title `(v1.1)` and §14 v1.0→v1.1 diff explanation. PO-ratified resolution: YAML frontmatter aligns to v1.1 at next Architect edit cycle (maintenance, not Phase A blocker).

---

## §8 — Path to first B-1.00 build directive

Path 1 locked. OD-009 ruled: 2 parallel lanes for related-and-wired features.

### §8.1 — Phase A: Plan ratification + verification + continuity discipline (~5–8 days)

| # | Item | Effort | Owner |
|---|---|---|---|
| **A1** | **Taskmaster scope verification.** Curator opens `.taskmaster/tasks/` directly — surface total task count, currentTag, other tags, whether tasks scoped by phase. If full-VIYO-scope, apply Phase 1 MVP filter to artifact §3 inventory. | S (5 min) | Curator |
| **A2** | **OD-009 ratified: 2 parallel lanes** for related-and-wired features (e.g., 22 generation modes A1-A8 + A9-A14, admin shells B-1.01 + B-1.02). Sequential for cross-touching features. Logged to Notion + SESSION_STATE. | S | (closed) |
| **A3** | **PO ruling on skill spec commit pattern (B-XC.07–10).** Does Portal-uploaded satisfy criterion? Curator surfaces both interpretations + standing rule context; PO rules. | S (~15 min PO decision) | PO |
| **A4** | **Verify OD-001 status against PRD V8.1 §6.3 + §6.5.** Prior lead: dissolved. Confirm or deny. | S (15 min Curator read) | Curator + PO |
| **A5** | **Verify B-1.19 Full Cost Suite + R52 DR + OD-004 R29 PAL Scope** against PRD V8.1. Resolve all 5 open scoping questions from §11. | S (~30 min Curator read + PO ratification) | Curator + PO |
| **A6** | **Ratify Master Build Sequence v1.1 as canonical.** Currently DRAFT. | S (~1 Curator session) | PO |
| **A7** | **IF A3 = "repo required":** author + commit B-XC.07–10 skill specs to `/docs/skills/`. Skip if A3 = "Portal satisfies." | S (~1 Curator session for all 4) | Architect → Manus |
| **A8** | **Close remaining PO decisions** — OD-006 spend cap (5 min), OD-003 Atlas/fal.ai catalog verification. | S total | PO |
| **A9** | **Author Cross-Surface Continuity Discipline (Rules 3.10/3.11/3.12 — see §13).** Adversary-loop ratified. Lands as commit. | M (~1 Curator session + Adversary loop) | Architect + PO |

**Phase A net effort:** 5–8 days depending on A3/A4 outcomes and Adversary loop on A9.

### §8.2 — Phase B: Phase 1 MVP feature audit + Phase 0 close (~5–8 days)

| # | Item | Effort | Owner |
|---|---|---|---|
| **B1** | **B-0.01 Substrate Audit — scoped to Phase 1 MVP features only** (~80–150 features mapped to B-0.01–B-1.19). Per-feature Status table with code paths cited. | M (~1–2 Curator sessions) | Curator + PO |
| **B2** | **Manus parallel track: full Build Tracker hygiene pass** (all 580 features). Status field reconciliation, phase-tagging cleanup, deprecated-feature flagging. Runs in parallel with B1, ~3–5 days Manus runtime. Curator defines rules; Manus executes; Curator verifies. | M (parallel — no critical path impact) | Manus + Curator verification |
| **B3** | **Close remaining incomplete Phase 0 Bullets** — B-0.09, B-0.13, B-0.14, B-0.15, B-0.16, B-0.17, B-0.19, B-0.21 (per A5 PRD verification). Some are Curator-side closure; some need Kimi build directives. | M-L (varies) | Curator → Kimi |
| **B4** | **B-0.22 Phase 0 Acceptance Gate ceremony.** | S | Curator + PO |

**Phase B net effort:** 5–8 days for B1+B4; B3 effort varies. Manus parallel track does not extend critical path.

### §8.3 — Phase C: B-1.00 Studio Core Loop execution (~2–3 weeks)

| # | Item | Effort | Owner |
|---|---|---|---|
| **C1** | **R-spec gap closure on MVP critical path** — R22 v2 re-audit, R23 v2, R24 v2.1, R33, T47 v2 (per §6). | S-M each | Architect |
| **C2** | **Curator drafts B-1.00 build directive** pointing Kimi at ~4,000 lines of existing substrate. Specifies what to finish. | M (~1 Curator session) | Curator → PO ratification → Kimi |
| **C3** | **Kimi executes B-1.00.** First real build directive of post-foundation-reset era. | L (~2–3 weeks) | Kimi → Curator → PO |

### §8.4 — Phase D: Remaining MVP build (~8–12 weeks with parallel lanes)

Sub-phases 1.5 (Editing Router), 1.6 (Multi-variant), 1.7 (Full editing tools), 1.8 (RLHF flywheel + 1,000-event accumulation per Decision 52), 1.11 (G2 Brand Kit + G8 Character Consistency), plus admin shells, billing UI, 22 modes, usability, Phase 1 Acceptance.

Run with 2 parallel Composer Queue lanes per A2 ratification.

### §8.5 — Total timeline

- **Phases A + B: 2 weeks**
- **Phase C: 2–3 weeks**
- **Phase D: 8–12 weeks with parallel lanes**

**Total: 12–17 weeks to public-launchable Image Studio MVP.** Matches PRD V8.1 §3.3.

---

## §9 — Drift gaps for park-item ledger

1. MAP §2 vs MBS B-1.00 sub-phase status drift — resolved by §10 corrections below.
2. MBS v1.1 itself DRAFT — Phase A A6 closes.
3. PRODUCT_ROADMAP.md mirrors MAP §2 incorrect claims — parallel correction.
4. STATE_AUDIT line 414 noted Build-Tracker-vs-T-keyed gap — never operationalized; this artifact does so.
5. R31 naming inconsistency — cosmetic.
6. T46 v2 location mismatch — cosmetic.
7. `/docs/skills/` directory existence — Phase A A3 PO ruling resolves.
8. Per-Phase-1-MVP-feature status surface absent — Phase B B1 closes.
9. B-1.19 Full Cost Suite MVP scope — Phase A A5 verifies.

---

## §10 — Required VIYO_CURRENT_MAP §2 + §9 + PRODUCT_ROADMAP.md corrections

(See ARTIFACTS 2/3/4 below — verbatim BEFORE/AFTER blocks.)

---

## §11 — Open scoping questions for Phase A resolution

1. **OD-001 pricing dissolved?** Verify PRD §6.3 + §6.5. (Phase A A4)
2. **B-XC.07–10 storage location** — ✅ RESOLVED 2026-05-15 via Path α realign: A3 Interpretation 1 ratified (Portal canonical per D63 Path E). Skills uploaded to Portal v1.0.0 2026-05-12 satisfy B-XC.07-10 acceptance. K1=COPY substrate previously cited was anti-pattern (D63 dropped K1 2026-05-11 — see §13 Rule 3.9 strengthening). (Phase A A3 ✅)
3. **B-1.19 Full Cost Suite MVP scope** per PRD §6.7. (Phase A A5)
4. **R52 DR reclassified post-launch** per PRD §3.5. (Phase A A5)
5. **OD-004 R29 PAL Rewrite Scope** — closed by R29 v2 merge or scope-extends. (Phase A A5)

---

## §12 — Path 1 locked: rationale

PO ruled Path 1 (hold full MVP scope, optimize execution) after MOAT analysis. Scope cut alternatives produce launches without defensible differentiation against Lovart / Midjourney / GPT Image 2 / Ideogram. VIYO's moat is the *combination*: RLHF learning loop + Brand Vault organization with lineage + Pattern DB cache + 22 modes including A15 Brand Kit Mode + editing tools wired to Brand Vault. Stripping any of these produces a product with no reason to switch.

Execution optimization via:
- OD-009 ratified — 2 parallel lanes for related-and-wired features.
- Manus parallel tracks (Build Tracker cleanup + routine sync operations per Rule 3.12).
- Cross-Surface Continuity Discipline (Rules 3.10/3.11/3.12) preventing relay-cost accumulation.

---

## §13 — Cross-Surface Continuity Discipline (preview — authored Phase A A9)

Three new rules added to ARCHITECT_OPERATING_RULES.md §3 in Phase A item A9, after Adversary loop ratification:

**Rule 3.10 — Session-end multi-surface sync.** Every Curator session closes with mandatory sync ledger across all canonical state surfaces: repo (post-push HEAD SHA confirmed), SESSION_STATE.md (phase + in-flight + carry-forward), Notion Decisions DB (ratified decisions logged), Airtable Build Tracker (Status changes reflected), Taskmaster (currentTag aligned with active Bullet). Each surface gets update line or explicit "no change this session." No deferred sync.

**Rule 3.11 — Session-start multi-surface verification.** Extends Rule 3.9 four-question diagnostic. Adds Q5: confirm Notion Decisions DB last-update timestamp, Airtable Build Tracker last-update timestamp, Taskmaster currentTag freshness. Any surface stale > threshold surfaces as drift gap, same handling as commit lag.

**Rule 3.12 — Cross-surface drift detection cadence + Manus mirror delegation + cross-relay paste-discipline.** Weekly drift check (Curator-run or scripted): repo HEAD vs Notion vs Airtable vs Taskmaster vs SESSION_STATE.md last-modified. Any divergence > threshold surfaces to PO as drift report. Edge case 1: routine mirror operations to Notion/Airtable from canonical repo state delegated to Manus per Curator-defined rules; Curator verifies post-mirror. Edge case 2 (added 2026-05-15 per Curator gap surfacing during CODE_RECONCILIATION ratification): paste-discipline (Rule 3.8) extends across all relay boundaries — PO ↔ PO-side Claude AND PO-side Claude ↔ Curator. Curator refuses commits on text not verbatim in its own conversation surface. PO-side Claude ratifications relay via verbatim paste to Curator before commit; no derivation, no paraphrase, no "the text from the prior conversation" reference. Mechanical work to Manus, judgment to Curator, authority to PO.

Verbatim rule text + 7-field canonical format + Substrate references authored in Phase A A9 paste-back. Adversary loop applied. Then commit.

**Rule 3.9 strengthening (added 2026-05-15 per Curator anti-pattern surfacing during D63 supersession check):** When Architect / Curator / PO-side Claude / Cataloger cites prior directive text (decision IDs, Lock numbers, R-spec citations, K1=COPY-style protocol references, OD numbers, MBS Bullet acceptance text) as substrate for a current decision or paste-back, the citing agent MUST grep-verify the cited directive against canonical state (Notion Decisions DB / FOUNDATION_LOCK.md / R-spec ZCBR Status header / MBS body / OD Notion record) before propagating the citation. Memory-based citation, inference-based citation, or citation-by-skim is forbidden.

**Stale-citation-propagation anti-pattern surfaced 2026-05-15:** B-XC.07-10 acceptance text in MBS v1.1 cited K1=COPY substrate from B-0.13, but D63 had dropped K1=COPY four days prior (2026-05-11) as anti-pattern. Three governance layers — (1) Architect spec author citing K1 in B-XC.07-10 acceptance text, (2) Curator A3 paste-back recommending Interpretation 2 (repo required) based on K1+B-XC.07-10 substrate, (3) PO ratification of I2 — all skipped grep-verifying the cited substrate against the Decisions DB. A3 I2 unwittingly superseded D63. Resolution: Path α realign 2026-05-15 reaffirming D63; A3 I2 reversed to I1. Rule 3.9 strengthening installs the grep-verify mandate to prevent recurrence. Maps to ANTI_PATTERN_CATALOG Family 1 (silent-writes / governance-text propagation) + Phase 5.x anti-skim family. A9 authoring places in catalog; Curator-call on family attachment.

---

## §14 — One ask

Ratify this artifact + the §10 MAP §2 + §9 + PRODUCT_ROADMAP.md corrections. Single Curator commit applies:

1. New file `/docs/governance/audits/CODE_RECONCILIATION_2026-05-15.md` (this document).
2. VIYO_CURRENT_MAP.md §2 + §9 corrections per §10.
3. PRODUCT_ROADMAP.md lines 16-18 parallel correction.

Push immediately per Rule 3.7. Surface post-push HEAD SHA. Park-items §9.1–§9.9 logged to SESSION_STATE.md Phase 5 tasks.

After ratification + commit, Phase A starts immediately with item A1 (Taskmaster verification — 5 min) and item A4 (OD-001 verification — 15 min). Then A3 PO ruling, A5 PRD verification batch, A6 MBS ratification, A7 if needed, A8 PO decisions, A9 Cross-Surface Continuity Discipline authoring (Adversary loop required).
