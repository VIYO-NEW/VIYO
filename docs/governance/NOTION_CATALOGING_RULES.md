# NOTION_CATALOGING_RULES.md

**Phase 2.6 deliverable — authored 2026-05-18 in response to PO surfacing variant 5g at Notion-structure layer + 6-day undrained PO Inbox.**

**Authored:** 2026-05-18 by VIYO Product Architect (Claude Opus 4.7)
**Trigger:** PO surfaced canonical Notion structure (VIYO_NOTION_REORGANIZATION_001 directive) revealing Architect session memory had wrong DB IDs for 6 of 7 canonical databases. Variant 5c (memory-citation universal) at Notion-structure layer. Plus 9 PO Inbox items sitting undrained for 6+ days because no monitoring rule existed.
**Authority tier:** Below FOUNDATION_LOCK + FOUNDATION_AUTHORITY; above per-role behavior files. Operationalizes Lock 17 (Foundation-First) + Lock 21 (Governance Agnosticism) for the Notion canonical surface.
**Update authority:** Curator authors drafts; PO ratifies; Cataloger commits.

---

## RULE A — Paragraph summary

VIYO has 6 canonical Notion databases + 1 PO Inbox + multiple child pages under an archived parent page. Each database has a strict role: Decisions DB = ratified architectural/product decisions only; Open PO Decisions DB = pending PO decisions awaiting ratification; Foundation Locks DB = ratified structural locks; Documentation Gaps DB = identified gaps in canonical documentation; Conflict Resolutions DB = resolved architectural conflicts; Standing Rules page = permanent agent rules across roles; PO Inbox = PO observations routed to specific agent roles for processing. NO agent except Cataloger writes to canonical DBs; all canonical writes require explicit PO ratification per Rule 3.4. PO Inbox is the only Notion surface PO writes to directly; it serves as the async-routing layer between PO and agents. Every agent session opens with PO Inbox sweep filtered to its role's `Route to` value with `Status = Open` — items with priority `Now` get same-session attention; priority `Next Session` gets bundled into the session's pending queue. Session-end protocol writes ratified decisions to Decisions DB + new pending items to Open PO Decisions DB + new locks to Foundation Locks DB + new gaps to Documentation Gaps DB + new standing rules to Standing Rules page + drains processed Inbox items to `Drained` status with `Drained During` field naming the session. Session summaries DO NOT post to canonical DBs — they are informational records that live as child pages under the archived parent, never in canonical state.

---

## Section 1 — Canonical Notion Structure (verified 2026-05-18)

### 1.1 Parent page (archived)

| Item | URL |
|---|---|
| 📋 VIYO Decision Log and QA Tracker [ARCHIVED — See Child Databases] | `https://www.notion.so/3559a84a46798194946ef8fc5479e4c2` |

**Status:** ARCHIVED. Houses all canonical DBs as children. Title indicates this is a navigational parent — NOT a content surface. Do not write directly to this page.

### 1.2 Canonical Databases (6)

Each database has TWO URLs: the database PAGE URL (what you click in browser) and the data source URL (what tools query). Both required for full operations.

| Database | Database PAGE URL | Data Source URL |
|---|---|---|
| 📊 Decisions Database | `https://www.notion.so/7a769bf3c2914825aa42c1c8bc94ca30` | `collection://b886724c-aa03-432b-889e-e63d9cdb7de6` |
| 🚧 Open PO Decisions | `https://www.notion.so/b31bfeb08108475eac7144295f36ff55` | (Cataloger fetches data source ID at first use) |
| 🔒 Foundation Locks | `https://www.notion.so/59e623267f354320b7d428eb6df62901` | (Cataloger fetches data source ID at first use) |
| ⚠️ Documentation Gaps | `https://www.notion.so/cc88a0025fc14528b4de4520ff271ea1` | (Cataloger fetches data source ID at first use) |
| 📐 Conflict Resolutions | `https://www.notion.so/5ea24908fa424bcaa15d3a72b15b5f6d` | (Cataloger fetches data source ID at first use) |
| 📥 PO Inbox | `https://www.notion.so/e54c3ffe84f940189086512ba1c1ec88` | `collection://be5f9696-b119-4f81-bb73-2599f5c1242b` |

### 1.3 Child Pages

| Page | URL | Role |
|---|---|---|
| 📅 Session Log: 2026-05-08 | `https://www.notion.so/3559a84a467981a5a99cf65c5f0c6a8c` | Session summary record |
| 📅 Session Log: 2026-05-09 | `https://www.notion.so/3559a84a467981b1a3b1c0f5f1e3b7d2` | Session summary record |
| 📅 Session Log: 2026-05-10 | `https://www.notion.so/3559a84a467981c4b8e2d1a6e2f4c8e3` | Session summary record |
| ⚖️ Standing Rules | `https://www.notion.so/35c9a84a467981c7a1fcdb7556f572d4` | Permanent agent rules |
| 👑 Authority Hierarchy | `https://www.notion.so/3559a84a467981e6daf4f3c8a4b6eaf5` | Reference page for the 12-tier hierarchy |

---

## Section 2 — What posts WHERE (per-DB rules)

### 2.1 📊 Decisions Database (`b886724c-aa03-432b-889e-e63d9cdb7de6`)

**Role:** Ratified architectural/product decisions. Permanent record.

**ID format:** `D{N}` sequential. Current max: D54 + ID-1 through ID-6 reserved range. Next ID: D55. (Check `Decision ID` title field for current max before assigning.)

**Required schema fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Decision ID | title | YES | Format `D{N}` e.g. "D55" |
| Title | text | YES | Concise statement of the decision |
| Category | select | YES | Architecture / Pricing / Infrastructure / Pattern / Skill / Webhook / Provider / Phase Plan / Competitive / Token Economics / Quality / Privacy / UX / Process |
| Status | select | YES | Locked / Open / Deferred / Superseded |
| Phase | select | YES | Phase 0 / Phase 1 / Phase 1B / Phase 2 / Phase 2.5 / Phase 3 / Phase 4+ / Cross-Phase |
| Phase Relevance | multi-select | YES | One+ of: P0 / P1 / P1B / P2 / P2.5 / P3 / P4+ / XC / ANY |
| Decision Date | date | YES | ISO-8601 |
| Source Authority | select | YES | PRD V8 / PRD V8.1 / VVOW Architecture / Notion Decision / Foundation Lock / Build Tracker / PO Direct |
| Session | select | OPT | Pre-populated values: May 2/3/10 2026, Pre-May 2026. New sessions (May 15/18 etc.) may need new option added — Cataloger does so at first use |
| Affected Specs | text | OPT | R-spec / governance file paths affected |
| Migration Notes | text | OPT | Cross-references; supersession history; rollout details |

**Write rule:** Cataloger ONLY. Must cite PO ratification statement verbatim in entry body (Markdown comment block at top of page content). Per-write PO ratification per Rule 3.4 transitional behavior.

**Does NOT post here:** Session summaries; pending decisions awaiting PO ratification (those go to Open PO Decisions); operational checklists; transient state.

---

### 2.2 🚧 Open PO Decisions (`b31bfeb08108475eac7144295f36ff55`)

**Role:** Pending PO decisions awaiting ratification.

**ID format:** `OD-{NNN}` zero-padded 3-digit. Current max per PO direction: OD-008. Next ID: OD-009. (Check title field for current max before assigning.)

**Schema fields (fetch + verify at first Cataloger use):** Cataloger calls `notion-fetch` on the database URL at first use to obtain schema; updates this file in next governance commit. Likely fields include: Decision ID (title), Title (text), Status (Open/Ratified/Deferred), Priority, Target Phase, Description.

**Write rule:** Cataloger ONLY. Created when Architect surfaces a decision needing PO ratification that's NOT yet ratified. When PO ratifies in chat → Cataloger moves entry from Open PO Decisions to Decisions DB (creates new D-entry, sets OD entry Status=Ratified with reference to new D-ID).

**Closure rule:** OD entries close in three ways:
- **Ratified:** PO ratifies → Cataloger creates D-entry in Decisions DB + sets OD Status=Ratified + Migration Notes pointer to D-ID
- **Deferred:** PO defers to future phase → Cataloger sets OD Status=Deferred + Target Phase update
- **Rejected:** PO rejects → Cataloger sets OD Status=Rejected with reason

**Does NOT post here:** Already-ratified decisions (those go to Decisions DB); operational hygiene items (per anti-pattern 5e variant — OD-register category drift; route to operational checklist instead).

---

### 2.3 🔒 Foundation Locks (`59e623267f354320b7d428eb6df62901`)

**Role:** Ratified structural locks per FOUNDATION_LOCK.md. Permanent.

**ID format:** `Lock {N}` matching FOUNDATION_LOCK.md repo file Lock numbers. Current: Locks 1-14, 17-19, 20-22, 30-38 + Lock 39 candidate. Lock 22 newly ratified 2026-05-18.

**Schema fields (fetch + verify at first Cataloger use):** Cataloger calls `notion-fetch` on the database URL at first use to obtain schema. Likely fields: Lock # (title), Title (text), Category (Architecture/Process/Provider/Token/Pattern/Skill/Privacy/Other), Date Locked (date), Authority Source (PO Direct/Architect Claude/VVOW/PRD V8/Other), Statement, Cross-References.

**Write rule:** Cataloger ONLY. Lock entry in Notion DB mirrors the verbatim text in `docs/governance/FOUNDATION_LOCK.md` — Notion is the search-friendly view; repo file is canonical text. When a Lock is added to the repo file (via Curator commit), Cataloger creates the matching DB entry within 24h.

**Pending writes from 2026-05-18 session:**
- Lock 22 — Authority Hierarchy Time-Horizon Split (RATIFIED) — Notion entry pending
- Lock 39 — Agentic-vs-Architectural Boundary (CANDIDATE, deferred) — Notion entry pending with Status=Candidate

---

### 2.4 ⚠️ Documentation Gaps (`cc88a0025fc14528b4de4520ff271ea1`)

**Role:** Identified gaps in canonical documentation requiring future authoring work.

**ID format:** `GAP-{NNN}` zero-padded 3-digit. Current: GAP-001 through GAP-007. Next ID: GAP-008.

**Schema fields (fetch + verify at first Cataloger use):** Likely: Gap ID (title), Title (text), Category, Severity, Affected Files, Resolution Path, Status (Open/In Progress/Resolved/Deferred), Identified Date.

**Write rule:** Cataloger ONLY. Created when audit work or session discovery identifies a gap. Resolved when canonical text lands.

**Pending writes from 2026-05-18 session:**
- GAP-008 — Substrate Map work for Lock 39 candidate (Open, Phase Forward)
- GAP-009 — PO Inbox monitoring rule missing (Resolved by this file landing in repo)

---

### 2.5 📐 Conflict Resolutions (`5ea24908fa424bcaa15d3a72b15b5f6d`)

**Role:** Resolved architectural conflicts.

**ID format:** `C-{NN}` zero-padded 2-digit. Current: C-01 through C-07. Next ID: C-08.

**Schema fields (fetch + verify at first Cataloger use):** Likely: Conflict ID (title), Title (text), Conflicting Sources, Resolution, Date Resolved, Affected Specs, Status (Resolved/Open).

**Write rule:** Cataloger ONLY. Created when Architect identifies + resolves a conflict between canonical sources (e.g., PRD V8 vs VVOW vs ZCBR R-spec).

**Does NOT post here:** Anti-pattern observations (those go to ANTI_PATTERN_CATALOG.md repo file, not Notion); session-level disagreements that resolve naturally without architectural escalation.

---

### 2.6 📥 PO Inbox (`be5f9696-b119-4f81-bb73-2599f5c1242b`)

**Role:** PO observations routed to specific agent roles for processing. ONLY surface where PO writes directly (Cataloger does not write here — PO does).

**ID format:** No ID prefix. Each entry has `Observation` (title) describing the item.

**Schema fields:**

| Field | Type | Notes |
|---|---|---|
| Observation | title | Short title of the observation |
| Captured | date | When PO captured it |
| Details | text | Full content |
| Priority | select | Now / Next Session / Future Phase / Reference Only |
| Route to | select | Architect Claude / Governance Curator / Decision Cataloger / PO Self / Phase Forward / Unsure |
| Status | select | Open / In Progress / Drained / Deferred / Closed |
| Tagged Phase | select | Phase 0/1/1B/2/2.5/3/4+/Cross-Phase/Not Phase-Specific |
| Drained During | text | Session ID when agent processed it |

**Write rule:** **PO writes new entries.** Agents update Status field (Open → In Progress → Drained/Deferred/Closed) and populate Drained During with session date when processing. Agents NEVER overwrite the Observation/Details/Priority/Route to fields PO authored.

**Monitoring rule:** See Section 3 below.

---

### 2.7 ⚖️ Standing Rules page (`35c9a84a-4679-81c7-a1fc-db7556f572d4`)

**Role:** Permanent agent rules indexed for cross-role discovery. Mirror of ARCHITECT_OPERATING_RULES.md §3+§4 (Architect) + NIR_OPERATING_RULES.md (universal) — Notion is the search-friendly cross-reference; repo files are canonical text.

**Format:** Page content with sections per role + rule. Each rule entry includes: Rule number, Statement, Source repo file, Commit SHA where ratified, Substrate citation.

**Write rule:** Cataloger appends new rules when ratified into repo files. Per-commit sync: when a Curator commit lands new rules in `docs/governance/ARCHITECT_OPERATING_RULES.md` or `docs/governance/NIR_OPERATING_RULES.md`, Cataloger updates this page within 24h.

**Pending writes from 2026-05-18 session (12 new rules):**
- Rule 3.11 (REJECTED — number reserved)
- Rule 3.12 (Cross-Relay Paste-Discipline)
- Rule 3.13 (Lead with ONE clear recommendation)
- Rule 3.14 (YES/NO answers without scroll)
- Rule 3.15 (Test executor capability empirically)
- Rule 3.16 (Never recommend session close)
- Rule 3.17 (Always recommend BEST setup)
- Rule 3.18 (Inventory descriptions NEVER canonical authority)
- Rule 3.19 (project_knowledge_search FIRST)
- Rule 3.20 (§6 First Action inviolable)
- Rule 3.21 (Curator bundles SESSION_STATE refresh)
- Rule 4.6 (Floor-enforced systemConfig pattern)

---

### 2.8 📅 Session Log pages (under archived parent)

**Role:** Session summary records — informational, not canonical state.

**ID format:** "Session Log: YYYY-MM-DD"

**Write rule:** Architect (or Curator) may create a session-log child page at session end. **NOT a Cataloger surface.** No canonical write authority required. Lives as child page under the archived parent (`3559a84a-4679-8194-946e-f8fc5479e4c2`).

**Pending action from 2026-05-18 session:** The session-summary page I created tonight (`3659a84a-4679-81c9-8300-f7e96a92a486` titled "Session 2026-05-18 — Item 1 Governance Refresh + B-0.02 PAUSE + 11 Standing Rules") is misplaced — it lives under the archived parent but should be renamed to "Session Log: 2026-05-18" for consistency with existing session log naming convention. Move + rename as part of Manus cleanup directive.

---

### 2.9 👑 Authority Hierarchy page

**Role:** Static reference for the 12-tier authority hierarchy.

**Write rule:** Cataloger updates when hierarchy changes (rare — last update was D85 + Lock 22 ratification 2026-05-18).

---

## Section 3 — PO Inbox Monitoring Protocol

**Authored 2026-05-18 in response to 9 undrained Inbox items from 2026-05-12/13 (6+ days stale).**

### 3.1 Per-role monitoring filter

Each agent role monitors a specific `Route to` value:

| Agent role | Route to filter | When |
|---|---|---|
| **Architect Claude** | `Route to = Architect Claude AND Status = Open` | At every session start + when explicitly prompted |
| **Governance Curator** | `Route to = Governance Curator AND Status = Open` | At every Curator session start |
| **Decision Cataloger** | `Route to = Decision Cataloger AND Status = Open` | At every Cataloger session start |
| **Manus (build executor)** | N/A (Manus does not monitor Inbox directly; routes through Architect dispatch) | — |

### 3.2 Session-start sweep protocol

Every Architect / Curator / Cataloger session FIRST executes this BEFORE any substantive work (chains into §6 First Action per Rule 3.20):

1. **Read 4 inheritance files** per Rule 3.20 (VIYO_CURRENT_MAP / ARCHITECT_OPERATING_RULES / NIR_OPERATING_RULES / ANTI_PATTERN_CATALOG)
2. **Sweep PO Inbox** via `notion-search` filtered by `data_source_url = collection://be5f9696-b119-4f81-bb73-2599f5c1242b` + role-specific Route to + Status=Open
3. **Surface findings to PO** in first response: count of Open items by priority + 1-line title of each
4. **Wait for PO direction** on which Inbox items to address this session vs defer to Open PO Decisions DB

### 3.3 Priority handling

| Priority | Handling |
|---|---|
| `Now` | Same-session attention. Block other work until addressed. |
| `Next Session` | Bundle into session's pending queue (VIYO_CURRENT_MAP §10). Address this session if scope permits; defer to next session otherwise. |
| `Future Phase` | Convert to Open PO Decisions DB entry with target phase + set Inbox Status=Drained. |
| `Reference Only` | Read + acknowledge in session log; set Inbox Status=Drained with Drained During = current session. |

### 3.4 Drain protocol

When agent processes an Inbox item:

1. **Read full Details field** (not just Observation title)
2. **Determine destination** per item type:
   - Design proposal needing PO ratification → draft Open PO Decisions DB entry
   - PO directive needing immediate action → execute + log to Decisions DB
   - Observation needing canonical capture → draft Decisions DB / Foundation Locks / Documentation Gaps / Conflict Resolutions entry
   - Reference material → set Inbox Status=Drained with note in Drained During
3. **Update Inbox entry:**
   - Set Status = `In Progress` while processing
   - Set Drained During = current session ID (e.g., "2026-05-18 Architect")
   - Set Status = `Drained` when complete OR `Deferred` if blocked
4. **Cross-link:** If new D-entry / OD-entry / Lock / Gap / Conflict was created, add link in Drained During field for traceability

### 3.5 Stale-item handling

When session-start sweep finds Inbox items older than 7 days with Status=Open:

1. Surface explicitly to PO with stale-warning ("9 items older than 7 days — staleness gap")
2. Recommend bulk drain session OR per-item ratification on top-priority
3. Do not proceed with other work until PO directs disposition

**Currently stale (as of 2026-05-18):** 9 items from 2026-05-12 / 2026-05-13. Drain session required at next session start.

---

## Section 4 — What does NOT post to canonical DBs

| Content type | Where it goes instead |
|---|---|
| Session summaries | Child page under archived parent (Session Log: YYYY-MM-DD) |
| In-progress drafts | Local working files (`C:\Users\Admin\Documents\VIYO\governance\`) or Drive working folder |
| Operational hygiene items (spend caps, monitoring tasks) | Separate operational checklist (NOT Open PO Decisions DB — that's variant 5e anti-pattern) |
| Anti-pattern observations | ANTI_PATTERN_CATALOG.md repo file (NOT Conflict Resolutions DB) |
| Tool-output transcripts | Session log child page OR Drive ledger |
| Agent-to-agent handoff docs | Drive working folder (NOT Notion) |
| Status updates / progress notes | In-session chat only (not canonical record) |

---

## Section 5 — Cataloger Action Items (pending 2026-05-18 session)

After Item 1 commit lands at next session, Cataloger executes the following in order. Each action requires per-write PO ratification surface per Rule 3.4 transitional behavior:

### 5.1 Inbox Drain (HIGH priority — addresses 6-day staleness)

Drain 9 stale items per §3.4 protocol. For each:

| Inbox item | Likely destination | Likely action |
|---|---|---|
| Multi-Agent Specialization with Async Inbox | Foundation Locks DB (architectural pattern) | Draft Lock entry for PO ratification |
| Drift Catcher Saved-View Implementation | Open PO Decisions DB | Draft OD-entry — implementation decision pending |
| PENDING_RATIFICATION Status Pattern | Open PO Decisions DB | Draft OD-entry — schema pattern decision pending |
| Real-Time Canonical DB Write Authority | Foundation Locks DB / ARCHITECT_OPERATING_RULES Rule 3.4 already covers | Cross-reference Rule 3.4 + drain to Drained |
| VIYO Team Operating System (50-person scale) | Open PO Decisions DB (Phase Forward) | Draft OD-entry — long-horizon design |
| Cross-Tool Orchestration Layer | Open PO Decisions DB (Phase Forward) | Draft OD-entry — tool layer design |
| Standing Operating Rules Per Agent Role (Portal auto-load) | Foundation Locks DB (architectural pattern) | Cross-reference CLAUDE.md v2 §6 First Action — already operationalized in Rule 3.20 + drain |
| Single Session Inheritance Map (VIYO_CURRENT_MAP.md) | Drained — already operationalized via Rule 3.20 + commit history | Drain with note pointing to VIYO_CURRENT_MAP.md at HEAD |
| Second Instance of Agent Write-Authority Anti-Pattern (D70-D82) | ANTI_PATTERN_CATALOG.md (already cataloged as Family 1 Observation 2) | Cross-reference + drain |

### 5.2 Decisions DB writes (3 new entries)

| ID | Title | Source Authority | Date |
|---|---|---|---|
| D55 | Lock 22 RATIFIED — Authority Hierarchy Time-Horizon Split | Notion Decision (D85) + Foundation Lock + PO Direct | 2026-05-18 |
| D56 | Item 1 Governance Refresh Executed | PO Direct | 2026-05-18 |
| D57 | B-0.02 PAUSED — 6-cycle variant 5g recurrence; pre-commit citation verifier + viyo-zcbr-architect v1.0.7 + B-0.02 v1.0 re-author queued | PO Direct | 2026-05-18 |
| D58 | Notion Cataloging Rules + PO Inbox Monitoring Protocol (this file) | PO Direct | 2026-05-18 |

### 5.3 Foundation Locks DB writes (2 entries)

| ID | Title | Status |
|---|---|---|
| Lock 22 | Authority Hierarchy Time-Horizon Split | Ratified 2026-05-18 |
| Lock 39 | Agentic-vs-Architectural Boundary | Candidate (deferred) |

### 5.4 Standing Rules page updates (12 new rules)

Append Rules 3.11 (REJECTED status) + 3.12-3.21 + 4.6 with cross-references to ARCHITECT_OPERATING_RULES.md §3+§4 at Item 1 commit SHA.

### 5.5 Documentation Gaps DB writes (1-2 entries)

| ID | Title | Status |
|---|---|---|
| GAP-008 | Substrate Map work for Lock 39 candidate | Open / Phase Forward |
| GAP-009 | (RESOLVED by this file landing) PO Inbox monitoring rule was missing | Resolved at Item 1 + this file commit |

### 5.6 Cleanup actions (Manus dispatch — see Section 6)

- Move/rename misplaced session-summary page from tonight (`3659a84a-4679-81c9-8300-f7e96a92a486`)
- Optional: audit other parent-level pages for similar misplacement

---

## Section 6 — Manus Cleanup Directive (skeleton — Architect authors full directive next session)

**Scope:** Cleanup of misplaced session-summary pages + standardize Session Log naming convention.

**Actions:**
1. Move the page at `https://www.notion.so/3659a84a467981c98300f7e96a92a486` to be a Session Log child page under archived parent
2. Rename it from "Session 2026-05-18 — Item 1 Governance Refresh + B-0.02 PAUSE + 11 Standing Rules" to "📅 Session Log: 2026-05-18" (matching existing convention)
3. Preserve all content (the long-form summary I authored is useful as a session log)
4. Verify no other workspace-root or parent-level pages contain session-summary content that should be moved to child pages

**Format:** Lean directive (single-task scope). Architect authors after Cataloger drain completes (so the Manus directive can reference the new D58 + this file's commit SHA).

---

## Section 7 — Anti-Pattern Updates from this discovery

To be added to ANTI_PATTERN_CATALOG.md §1.4 in next governance commit:

**Observation 18 — Notion DB ID memory-citation without verify (2026-05-18).** Architect session memory carried Notion DB IDs from prior session compaction that did not match canonical structure. 6 of 7 IDs were wrong (only Conflict Resolutions matched). Mechanism: Notion's structure has database PAGE URLs (what humans see) AND data source URLs (what tools query) — Architect memory conflated these. Variant 5c (memory-citation universal) applied to Notion canonical structure. Closes via Rule 3.19 (project_knowledge_search FIRST applied to Notion structure verification) + this file as canonical reference. Architect must fetch the actual database via `notion-fetch` before any write — never rely on memory of IDs.

**Observation 19 — PO Inbox staleness gap (2026-05-18 discovery).** PO Inbox had 9 substantive design proposals undrained for 6+ days (oldest from 2026-05-12). No agent had standing rule to monitor. Failure pattern: surface exists; routing field exists; no protocol enforces monitoring. Closes via this file's §3 PO Inbox Monitoring Protocol locked as standing rule across all agent session starts.

---

## Section 8 — Closing

This file establishes the canonical Notion-side cataloging discipline that was missing. Combined with:

- Rule 3.4 (no writes to canonical state without ratification surface)
- Rule 3.20 (§6 First Action inviolable — now extended to include PO Inbox sweep)
- ANTI_PATTERN_CATALOG §3 Category 5 (Tool-Level Pre-Commit Enforcement)
- A9 §10 (Cataloger post-transition standing authority)

...this completes the relay discipline across all canonical surfaces — repo (Curator commits) + Notion (Cataloger commits) + Drive (working folder) + memory_user_edits (PO surface only).

**Phase 2.6 complete pending PO ratification + commit to `docs/governance/NOTION_CATALOGING_RULES.md` in next governance commit (post-Item 1 push).**

After commit lands:

- ARCHITECT_OPERATING_RULES.md Rule 3.20 strengthens with explicit PO Inbox sweep step (§6 First Action: read 4 inheritance files + sweep PO Inbox + confirm role + state first task + wait for PO ratification)
- VIYO_CURRENT_MAP.md §11 Active Governance adds row for this file
- CLAUDE.md v2 §2 Auto-Load Reading List expands from 4 files to 5 (this file added)
- Cataloger executes §5 action items per-write PO ratification

---

*End of NOTION_CATALOGING_RULES.md — 2026-05-18*
