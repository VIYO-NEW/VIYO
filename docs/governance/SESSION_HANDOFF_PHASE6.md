# SESSION_HANDOFF_PHASE6.md

**Purpose:** Rebuilt handoff for Phase 6 (Image Studio active build). Replaces SESSION_HANDOFF_2026-05-15.md as the working handoff for any session resuming Image Studio build work.

**Authored:** 2026-05-22 by VIYO Curator (Phase 6 cleanup punch list items 2–5 + item 5 addendum).
**Status:** DRAFT — awaiting PO ratification before governance commit.

Read this AFTER the §2 auto-load (CLAUDE.md §3 inheritance) but BEFORE starting work.

---

## §1 — Repo facts (correct as of 2026-05-22)

**One repo.** `github.com/VIYO-NEW/VIYO`. Branch `staging` = canonical execution branch. Branch `main` = production (do not push directly). No separate "architect-side build repo" — there is only this one repo.

**Governance docs live in:** `/docs/governance/`
**R-specs live in:** `/docs/research_specs/`
**Architecture docs live in:** `/docs/architecture/`
**Scripts live in:** `/scripts/`
**App code lives in:** `/apps/`

**HEAD at handoff authoring:** `f316917` (staging). AH = `7a8f24d` (NOTION_CATALOGING_RULES re-sync merge, ledger anchor reserved per A9 §6 Convention — catches up in next governance commit).

**Verification mode (browser-only):** The build executor (Manus) verifies deployed features via browser inspection, not via direct repo read access. Architect/Curator verify governance state via repo files + Drive reads. Never assume a session has filesystem or terminal access to the deployed app — route verification through the browser or Manus dispatch.

---

## §2 — Full build loop (correct sequence, every bullet)

1. **Architect drafts** the directive (R-spec, Bullet, T-spec, or architecture amendment). Runs internal Adversary pass per ANTI_PATTERN_CATALOG.
2. **Architect → Curator dispatch** filed via Drive working folder. Curator runs `verify-dispatch.sh` (AOR Rule 3.23) at intake before executing.
3. **PO relay:** Curator surfaces prepared diff + Curator-call deviations to PO via chat.
4. **PO ratification:** PO reviews diff, ratifies, adjusts Curator calls as needed.
5. **Curator executes commit(s):** git add → commit → push origin staging → PR (if feature branch). SESSION_STATE refreshed per Rule 3.21/3.22.
6. **Manus plan:** Manus receives the merged directive from staging and drafts an implementation plan.
7. **Architect approves plan:** Architect reviews plan before Manus writes code. Catches scope drift and citation errors.
8. **Manus builds:** Implements per approved plan.
9. **Verify live:** Manus (or browser operator) verifies the feature in the deployed staging environment. PASS = Manus reports results.
10. **PO approves:** PO accepts the shipped slice. Phase gate advances.

**Pre-commit enforcement (active as of 2026-05-20):**
- Pre-push hook: D-1 citation verify (Lock citations, R-spec citations, .md path citations). Installed at `.git/hooks/pre-push` — hooks re-installed 2026-05-20. Case-insensitive exemption for "candidate"/"placeholder" Lock lines (`grep -viE`).
- Dispatch intake: D-2 `verify-dispatch.sh` (same patterns + SHA context-cue gating). AOR Rule 3.23 mandates Curator runs this at every dispatch intake.

**Note on install-hooks.sh:** Creates file COPIES (not symlinks) on Windows. If `scripts/git-hooks/pre-push` changes, re-run `bash scripts/install-hooks.sh` to refresh the installed hook. Side-queue item #9 tracks this symlink reliability gap.

---

## §3 — Registry-first read order (every directive session)

Before writing any directive touching a product domain, load these in order:

1. **CLAUDE.md** → role + inheritance + communication rules
2. **SESSION_STATE.md** → current HEAD, ledger, pending queue, phase status
3. **CANONICAL_DOCS_REGISTRY.md** (this repo) → which document is authoritative for your scope
4. **VIYO_Master_Build_Sequence.md** → which Bullet you're working on, prereqs, acceptance
5. **VVOW Architecture v2.0** (Drive) → Image Studio architecture (reading with DEAD-sections awareness per registry)
6. **PRD v1.4** (Drive) → Image Studio canonical product spec (canvas stack, modes, toolbelt, operating principles). Read alongside **VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM** (co-authoritative) — four Mermaid diagrams: end-to-end flow, cross-phase integration (Pattern Seeding gated on OD-024 + Lock 40), tool-to-model mapping (the "system diagram §3" UI/UX Spec §12 cites), reverse-engineering pipeline. Drive ID `1aJMKdIXgQ3VqhiDeLvgQXnyAlgLaZgYR`.
7. **UI/UX Spec v1.0** (Drive) → Interface contract: layout shell, touchpoint spec, tools panel spec, state machine, component inventory, §22 Manus build sequence, §23 open PO decisions. Read AFTER PRD v1.4; read BEFORE any UI-layer directive. Google Doc ID `1DXj3ttypWdgzI23RG6cvcS4Ek74iVVyla7jf2otaUnc`. .md file ID `1qFjK4vUEi0Z9TdRl4lwie4EZTxJIAeZ7`.
8. **Relevant R-spec** → per the Bullet's R-spec field
9. **SESSION_HANDOFF_PHASE6.md** (this file) → open threads, current build state

Do NOT cite from memory. Rule E: nothing cited from memory ever.

---

## §4 — Three-layer MBS map

The Master Build Sequence (VIYO_Master_Build_Sequence.md, RATIFIED v1.1, Lock 22 operationalized 2026-05-18) organizes all work into phases. The "three layers" of the product platform map to MBS phases as follows:

### Layer 1 — Image Studio (VVOW)

**MBS phases:** P0 (Substrate) + P1 (Image Studio) + P1B (Intelligence Foundation)

| Phase | Bullet count | Moat | Status |
|---|---|---|---|
| P0 — Substrate | 22 bullets | None (foundation) | B-0.01 landed; B-0.02 PAUSED post-Adversary v6; B-0.03–B-0.22 sequenced |
| P1 — Image Studio | 18 bullets | Lovart | In progress (Slices 1–5 closed via T73; Slice 6 on hold) |
| P1B — Intelligence Foundation | 7 bullets | None (corpus prereq) | Not started |

**Where the Image Studio MBS lives:** VIYO_Master_Build_Sequence.md §3.1 (Phase 1 bullets, B-1.01 through B-1.18). NOT in V8 PRD §22 (that section is Open Questions). NOT in VVOW Architecture §16 (that is a phased acceptance plan, not the build sequence). The MBS Bullets are the authoritative sequencer.

**UI/UX Spec §22 build sequence — what it is and is NOT:** The UI/UX Interface Spec v1.0 §22 contains a 10-phase "MVP build sequence (recommended for Manus)" — Shell + canvas → Design Chat + generate pipeline → Drag/auto-save/learning → Contextual Toolbelt → Brand Vault rail → Modes → Brand Kit Mode → Character Consistency → Export Center → Polish. This is the **UI-layer implementation ordering** for Manus, derived from PRD v1.4. It is **not** the MBS bullet sequencer and does not supersede MBS v1.1. The MBS is the canonical phase gate authority; the UI/UX Spec §22 is the Manus execution sequence within those phases.

**What "Lovart on Steroids" means architecturally:** Pattern DB cache-first + RLHF learning loop (drag/export/swipe signals) + Art Director Router (score every model per request) + Brand Vault integration + brand-specific LoRA fine-tuning. Lovart has none of these. VVOW has all of them post-Phase 1.

### Layer 2 — Email Studio

**MBS phases:** P2 (Email Engine) + P2.5 (Brand Team Collaboration)

| Phase | Bullet count | Moat | Status |
|---|---|---|---|
| P2 — Email Engine | 38 bullets | Migma + Grid&Pixel core | Not started (Phase 1 must ship first) |
| P2.5 — Brand Team Collab | 9 bullets | Grid & Pixel oversight | Not started |

**Email Studio MBS:** VIYO_Master_Build_Sequence.md §3.2 and §3.3 (B-2.01 through B-2.38, B-2.5.01 through B-2.5.09).
**Email Studio is Phase 2 — NOT the current build.** It consumes Image Studio assets by Brand Vault UUID reference. GrapesJS (+ MJML plugin) is the email canvas for Phase 2 (confirmed in VVOW Architecture §2.3 — this is the ONLY surviving GrapesJS reference).

### Layer 3 — Intelligence Studio

**MBS phases:** P3 (Intelligence Studio) + P4+ (Service Expansion)

| Phase | Bullet count | Moat | Status |
|---|---|---|---|
| P3 — Intelligence Studio | 9 bullets | Instant | Not started (Phase 2 must ship first) |
| P4+ — Service Expansion | 13 bullets | None (breadth) | Not started |

**Intelligence Studio MBS:** VIYO_Master_Build_Sequence.md §3.4 (B-3.01 through B-3.09).
**Intelligence Studio components (code names):** LENZ (analytics/benchmarks dashboard), PULZE (email intelligence dashboard), ATLAS (Top Brain — industry-wide intelligence corpus).

### Cross-cutting bullets

25 XC bullets + 9 stubs + 7 deferred appendix cover cross-phase infrastructure: observability, testing, security hardening, token economics, skills registry, etc. These are parallel-safe with phase bullets per OD-009 (ratified 2026-05-15: 2 parallel lanes for related-and-wired features; sequential for cross-touching).

---

## §5 — Notion DBs (all decisions are in Notion)

Six canonical Notion DBs + Standing Rules page. All decisions live in Notion. "All decisions in Notion" is navigable via these IDs:

| Database | Notion ID | Count (as of 2026-05-20) | What lives here |
|---|---|---|---|
| Decisions Database | `7a769bf3-c291-4825-aa42-c1c8bc94ca30` | D1–D96 (ceiling); D97 = next | Ratified decisions. D1–D87 confirmed 2026-05-15 Manus audit; D88–D96 added since. |
| Open PO Decisions DB | `b31bfeb0-8108-475e-ac71-44295f36ff55` | OD-001 to OD-021 | Open questions blocking or tracking product decisions. MVP-blocking: OD-005, OD-019 (per SESSION_STATE carry-forward). |
| Foundation Locks DB | (see NOTION_CATALOGING_RULES.md §1.3) | Lock 1 through Lock 40 | Immutable architectural locks. Lock 22 = Authority Hierarchy Time-Horizon Split. Lock 39 = Agentic-vs-Architectural Boundary (candidate placeholder, deferred). Lock 40 = Source-Never-Shown Invariant (RATIFIED — Notion page `3679a84a4679818cbbf7c73eea41907b`). |
| Doc Gaps DB | `cc88a002-5fc1-4528-b4de-4520ff271ea1` | GAP-001 to GAP-009 | Documentation gaps requiring resolution. |
| Conflict Resolutions DB | `5ea24908-fa42-4bca-a15d-3a72b15b5f6d` | C-01 to C-07 | Documented conflict resolutions between sources. |
| PO Inbox DB | (see NOTION_CATALOGING_RULES.md §1.3) | Variable | Items awaiting PO drain session. |
| Standing Rules page | `35c9a84a-4679-81c7-a1fc-db7556f572d4` | 7 rules + Authority Hierarchy | Standing operating rules, hygiene rules H-1–H-6. |

**Governance parent:** `3559a84a-4679-8194-946e-f8fc5479e4c2` (ARCHIVED — See Child Databases)

**How to navigate:** Use the Notion MCP (`notion-fetch` or `notion-search`) to read decision records. Always grep-verify decision IDs before citing. Never cite from memory.

---

## §6 — Current build state (Image Studio, as of 2026-05-22)

### What is shipped (verified from VVOW Architecture §17 + session summary)

| Task | Description | Status |
|---|---|---|
| Phase 0 | Foundation (repo, monorepo, Hono API worker, deployment pipeline) | Complete |
| T25 | Image Studio backend | Shipped |
| T26 | Image Studio frontend | Shipped |
| T70 | Pattern DB cache-first metadata transparency | Shipped |
| T71 | Token economics billing reconciliation | Shipped |
| T72 | R2 auto-save + Brand Vault asset contract | Shipped |
| T73 Slices 1–5 | Studio Editing Router — first 5 delivery slices | CLOSED (per Phase 6 Manus report) |

### What is in flight

| Item | Description | Status |
|---|---|---|
| T73 Phase 3b | Studio Editing Router Phase 3b | Dispatch issued, awaiting Manus execution |
| T73 Slice 6 | Modes: detection & selection | Dispatch drafted + reviewed, ON HOLD pending Phase 6 cleanup completion |
| Phase 6 cleanup | Canonical Docs Registry + MBS map + handoff rebuild + Notion DB confirmation | IN PROGRESS (this document = output) |

### What is paused / blocked

| Item | Description | Blocker |
|---|---|---|
| B-0.02 v1.0 | L1 Identity & Multi-Tenancy (RLS/roles/MFA scaffold) | Paused post-Adversary v6 (6-cycle variant 5g recurrence). Awaiting viyo-zcbr-architect skill v1.0.7 (pending queue item #1). |
| VVOW v2.1 dispatch | VVOW Architecture update (9 §-by-§ BEFORE/AFTER pairs, Manus authored) | Dispatch content on Manus output system; Curator has not received/executed it yet. Must be relayed to Curator before execution. |

### What comes next (priority order)

1. **Phase 6 cleanup ratification** — PO reviews this handoff + Canonical Docs Registry. Ratify → Curator governance commit bundles both files.
2. **T73 Slice 6 unblock** — Resume Modes: detection & selection dispatch after PO accepts cleanup.
3. **VVOW v2.1 dispatch execution** — Curator receives the VVOW v2.1 dispatch from Manus relay, runs verify-dispatch.sh, surfaces to PO, commits.
4. **viyo-zcbr-architect skill v1.0.7** — Architect-authored skill update (pending queue item #1 in SESSION_STATE). Pre-requisite for B-0.02 v1.0 re-author.
5. **B-0.02 v1.0 re-author** — Clean slate, post-tools active (D-1 + D-2 verifiers running). L1 Identity & Multi-Tenancy completion.

---

## §7 — Open threads (carried from Phase 5 + Phase 6 cleanup)

### Governance side-queue (next governance commit — 8 items, from SESSION_STATE carry-forward)

These are NOT yet committed. Bundle into the next substantive governance commit after ratification.

1. Broaden ANTI_PATTERN_CATALOG Observation 20 — 3 instances of variant 5c (Notion-structure + repo-file-content + directive-authoring layers)
2. ANTI_PATTERN_CATALOG Observation 21 + variant 5l — commit-msg hex regex false-positive on non-SHA hex IDs
3. AOR Rule 3.22 scope broadening — 6 canonical DBs → all Notion writes under archived governance parent
4. AOR rule: test-fixture directories universally exempt from pre-push scan; dispatches must enumerate fixture dirs
5. D-1 refactor to use `scripts/verifier/lib/citation-patterns.sh` (eliminate duplicate logic with D-2)
6. Variant 5c instance #9 — UUID v4 bug repeat in D-2 dispatch authoring (already fixed in code; needs catalog entry)
7. Code-block fence exemption for citation-pattern detection (commit-msg + verify-dispatch false-positive on inline test-fixture content)
8. install-hooks.sh symlink reliability fix (creates copies not symlinks on Windows → hooks silently stale on every script change)

**Pending queue #1 (SESSION_STATE):** viyo-zcbr-architect skill v1.0.6 → v1.0.7

### AH ledger catch-up

AH = `7a8f24d` (NOTION_CATALOGING_RULES.md re-sync PR #40 merge) is RESERVED per A9 §6 Convention. The next governance commit must list AH in the ledger and increment the count to 34.

### VVOW Architecture conflict map (for whoever authors VVOW v2.1 or the Curator executes it)

The VVOW v2.1 dispatch (9 §-by-§ BEFORE/AFTER pairs) must resolve at minimum:
- §8.1: GrapesJS Studio SDK → React Konva + dnd-kit + Zustand
- §3 Zone 2: "GrapesJS Infinite Canvas" → React Konva infinite canvas
- §18.1 Forbidden: Remove "Custom canvas implementations. Use GrapesJS Studio SDK exclusively"
- Appendix A: Canvas row update
- §2.3: Clarify that GrapesJS remains valid ONLY for Phase 2 Email Studio MJML path (not Image Studio canvas)
- The "single source of truth" claim should be qualified against PRD v1.4 authority

**TIMING CONFLICT (critical for dispatch executor):** The existing VVOW v2.1 dispatch was authored 2026-05-20. PRD v1.4 and UI/UX Spec v1.0 were both created 2026-05-21 — one day later. The dispatch cannot be based on either canonical document. Before executing it, the Curator must diff the dispatch content against PRD v1.4 + UI/UX Spec v1.0. If the dispatch conflicts with or ignores either document, it must be re-authored (not executed as written). Do not assume the dispatch is complete just because it exists.

### New open items (surfaced from Phase 6 UI/UX Spec read, 2026-05-22)

1. **Lock 40 — RESOLVED:** Lock 40 = Source-Never-Shown Invariant. RATIFIED. Code-review gate (not just a doc principle) — any PR returning raw source-inspiration image bytes to a user-facing surface fails. Notion page: `https://www.notion.so/3679a84a4679818cbbf7c73eea41907b`. Activates when Pattern Seeding code first touches the repo (post-Image-Studio-launch). Paired with OD-024 (per-source ToS verification). Safe to cite.

2. **VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM — RESOLVED:** File confirmed via local read and uploaded to Drive (2026-05-22). Drive ID `1aJMKdIXgQ3VqhiDeLvgQXnyAlgLaZgYR` (VVOW independent image studio / UI-UX audit folder). Four Mermaid diagrams — end-to-end flow, cross-phase integration, tool-to-model mapping, reverse-engineering pipeline. CANONICAL co-authoritative with PRD v1.4. Registry updated.

3. **UI/UX Spec §23 open PO decisions (D1, D2, D4, D6) need ratification:**
   - D1: Design Chat on the right, Brand Vault rail on the left (PRD §3.1 doesn't specify a side).
   - D2: Auto-detect as Mode default in the composer (recommended; not yet PO-ratified).
   - D4: `ⓘ why these models` — ship at launch or post-launch (recommended at launch).
   - D6: Status Strip auto-peek (idle = 0 px) vs. always-on 40 px (recommended auto-peek).
   None of these are blocking for current slices. Bundle for PO ratification at next session — do not let them drift unresolved into Manus tool-spec territory.

4. **R17 v2 amendment:** R17 v2 (UI/UX Architecture, ZCBR PASSED 2026-05-12) was written against VVOW Architecture v2.0 (GrapesJS as canvas). With PRD v1.4 and UI/UX Spec v1.0 now superseding the canvas stack, R17 v2 needs a targeted amendment for Zone 2 canvas references. Amendment not yet dispatched.

5. **UI/UX Spec v1.0 `[PRD-implied]` surfaces for PO awareness:** Top Bar, Left Rail, and Status Strip are `[PRD-implied]` surfaces — the PRD requires them but does not draw them. The spec makes them explicit. PO has not formally ratified these surfaces as drawn; they are author-judgment calls flagged inline. Current build (Slices 1–5) did not include them. When Slice 6+ resumes, these surfaces will be in scope.

---

## §8 — Agent topology (do not confuse roles)

| Role | Who | What they do | What they don't do |
|---|---|---|---|
| Architect | Claude (Opus) in portal | Drafts R-specs, Bullets, T-specs, architecture amendments. Runs Adversary pass. | Does NOT commit to repo. Does NOT make governance calls. |
| Curator | Claude (this repo) | Receives dispatches, verifies, commits to repo, surfaces to PO. | Does NOT draft R-specs or product specs. Does NOT build code. |
| Cataloger | Claude (Notion-side) | Writes to Notion canonical DBs after PO ratification. | Does NOT commit to repo. Does NOT draft specs. |
| Manus (Builder) | Manus AI | Executes build directives. Reports results. | Does NOT make product decisions. Does NOT determine canonical authority. |
| Adversary | Claude (spawned) | Runs adversary cycle on directives and governance artifacts. | Does NOT ratify. Does NOT commit. |
| PO | Nir | Ratifies all decisions. Final authority. | Does NOT draft technical specs. |

**Critical:** Manus can enumerate raw file names and version strings (mechanical inventory gathering). Manus CANNOT make canonical-authority determinations, supersession judgments, or governance writes. Those are Curator/PO functions.

---

## §9 — Image Modes: buildability state (punch list item 5 addendum)

The next architect must know whether "Modes" is buildable end-to-end today, or only as UI against a thin library. This section answers that. Sources: VVOW Architecture v2.0 §4.2, §8.8.2, §10.3, §10.4, §12; PRD v1.4 §3.5; UI/UX Spec v1.0 §9, §15, §18.3; System Diagram §2 + §4 + Appendix.

### 9.1 — How the 22 image modes are defined (taxonomy location)

**The taxonomy lives in the database — NOT hardcoded.**

- Table: `image_prompt_patterns`, column: `type_name` (VVOW Architecture §10.3 Pattern Recipe JSON Schema).
- The 22 mode names (Product Photography, Email Hero, Brand Pattern, etc.) are the **first-discovered seed set** — they are values in the DB, not a fixed enum in application code.
- **Hardcoding as a fixed enum is explicitly FORBIDDEN** per VVOW Architecture §4.2 and §18.1. The taxonomy must remain open: new modes emerge from the learning loop (general-generation variants that perform well → promoted to named mode).
- **UI/UX Spec §9 confirms the open-taxonomy design:** "VIYO ships with 22 named modes (PRD §3.5); the taxonomy is a starting set, not closed." A general-generation fallback (`Mode: General ✎`) handles briefs that match no mode at high confidence; high-performing general outputs become candidates for promotion to new named modes.
- The Mode Gallery (UI/UX Spec §9.2) shows 22 visual outcome cards grouped by category (E-commerce / Fashion / Marketing / Brand / Email-native / Asset). These cards pull from the DB — they are not hardcoded UI components.

### 9.2 — What seeds the pattern library (current populated state)

**At launch: sparse. User-generated only.**

The pattern library (pgvector store on Supabase, `image_prompt_patterns` table) is populated through three mechanisms, with very different launch-day timelines:

| Mechanism | Description | Launch-day status |
|---|---|---|
| **Implicit RLHF (user signals)** | Drag a variant → canvas (+1), Export (+5), Regenerate all (−1). These score patterns and surface the best ones for cache-first retrieval. | **ACTIVE at launch.** No special tooling needed — fires from natural user actions (UI/UX Spec §15.1). |
| **Brand-uploaded inspiration** | Users can attach reference images via `+ Ref` chip in the composer (UI/UX Spec §5.2, DC-4) and drag product photos to the Vault (§4.1, LV-5). These become injectable context. | **ACTIVE at launch.** |
| **Milled pre-seeding (web scraping)** | Puppeteer/Cheerio crawl of Milled.com email creative archive → Claude Vision → Pattern Recipe JSON → library (VVOW Architecture §10.4; System Diagram §4 Reverse-Engineering Pipeline). | **POST-LAUNCH ONLY.** Gated on: **(a) OD-024** — per-source ToS verification (legal clearance for each licensed source); **(b) Lock 40** — Source-Never-Shown Invariant code-review gate (no source image bytes ever reach users — only reverse-engineered pattern recipes). System Diagram §2 Cross-Phase Integration explicitly labels both as preconditions. UI must be built so lineage inspector shows pattern recipes by name/recipe only, never source bytes (UI/UX Spec §18.3). |
| **Tinder Swipe Gate (human verifier)** | Internal reviewer surface for quality-gating promoted patterns. | **POST-LAUNCH ONLY.** Out of scope for first release (UI/UX Spec §15.2; System Diagram §1 POST_LAUNCH node). |

**Day-1 reality:** A new brand on Day 1 will have zero prior patterns in the library for their specific use case. The VIR falls back to zero-shot general generation using only their attached product images and brief context. Pattern quality rises session-over-session as implicit signals accumulate. The system is functional on Day 1 but not differentiated — differentiation is the accumulated flywheel.

### 9.3 — Per-mode model-routing matrix (current state)

**The routing matrix is EMPTY at launch. Art Director Router uses uniform scoring until experiments run.**

Per VVOW Architecture §8.8.2 (verified from full read, 2026-05-20 session):

> *"The matrix starts empty. The Art Director Router uses uniform Tier 1 scoring until empirical experiments populate it. The per-mode routing matrix is a future bullet directive, not part of T73."*

What this means for buildability:
- The Art Director Router exists and routes (Tier 1 → Tier 2 → Tier 3 per registry).
- Its scoring function (quality × cost × speed × style) runs on every generation request.
- **But:** The per-mode weights that would make "Product Photography" route differently from "Email Hero" from "Typography Poster" — those do not exist yet. Every mode uses the same uniform quality-cost-speed-style tradeoffs until a future bullet directive populates the matrix.
- **This is expected at launch.** The UI/UX Spec §1 confirms the design: the user never selects a model. The `ⓘ why these models` post-hoc provenance display (§5.3) is the transparency layer. Uniform routing is architecturally valid for the launch gate.

### 9.4 — Buildability verdict

**"Modes" IS buildable end-to-end today — as UI with a thin library and uniform routing.**

| Dimension | Buildable? | Notes |
|---|---|---|
| **Taxonomy** | ✅ Yes | DB-resident `type_name`. 22 modes seedable as DB inserts. Taxonomy is open by design. |
| **Mode Gallery UI** | ✅ Yes | 22 visual outcome cards pulling from DB. UI/UX Spec §9.2 fully specifies them. |
| **Auto-detect (VIR)** | ✅ Yes | VIR embeds brief, detects mode, falls back to general. Mode chip is editable. |
| **Pattern retrieval** | ✅ Yes | pgvector cache-first lookup works. Starts sparse; improves with use. |
| **Per-mode model routing** | ❌ Not yet | Routing matrix is empty. Uniform Tier 1 scoring at launch. Future bullet directive. |
| **Pattern pre-seeding (Milled)** | ❌ Not yet | Post-launch. ToS review + source-never-shown gate required first. |
| **Day-1 variant quality (new brand)** | ⚠️ Thin | Zero-shot fallback with product image context only. Quality rises session-over-session via RLHF. |

**Summary for next architect:** T73 Slice 6 (Modes: detection & selection) is buildable as UI today. The mode taxonomy, Mode Gallery, auto-detect VIR path, and DB-resident pattern retrieval can all be implemented now. The two things that cannot be built yet: (1) differentiated per-mode model routing — waits for a future bullet directive after empirical experiments; (2) Milled pre-seeding — gated on OD-024 (ToS) + Lock 40 (source-never-shown code-review gate), both of which activate post-Image-Studio-launch. Do not block Slice 6 on either. Build the UI; wire to uniform routing; the seeding and routing matrix populate via future bullet work.

### 9.5 — Pre-launch seeding requirement (NEW — confirmed 2026-05-22)

**The reverse-engineering pipeline must be built and run pre-launch to seed the library with at least a baseline set of pattern recipes per mode.**

The Reverse-Engineering Pipeline (System Diagram §4): `source → Claude Vision → Pattern Recipe JSON → Pattern Library`. The source does NOT have to be Milled (licensed inspiration). It can be **our own validated test generations** — images we generate internally, run through Claude Vision, and store as seed patterns. This is:
- **Legal** — our own outputs, no ToS issues, Lock 40 / OD-024 do not apply
- **Feasible pre-launch** — ~22 modes × a small number of seeded recipes each
- **Required** — without it, Mode Gallery example thumbnails (UI/UX Spec §9.2 specifies visual outcome cards with example thumbnails) have nothing to show, and every new brand on Day 1 gets zero-shot fallback with no pattern differentiation between modes

**What this means for the build:**
1. The Reverse-Engineering Pipeline (Claude Vision → Pattern Recipe JSON → DB insert) is a **pre-launch build requirement**, not just a post-launch automation concern.
2. A pre-launch seeding sprint is needed: generate high-quality reference images for each of the 22 modes, run them through the pipeline, populate the library with seed recipes.
3. Milled automation (post-launch, gated on OD-024 + Lock 40) scales this to hundreds of recipes per mode — but that comes after launch.

**This is an open architectural decision that needs a bullet directive.** The pre-launch seeding sprint is not currently sequenced in MBS v1.1. Surface to Architect for B-1.x bullet authoring before T73 Slice 6 ships.

---

*End of SESSION_HANDOFF_PHASE6.md*
