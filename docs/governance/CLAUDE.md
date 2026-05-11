# CLAUDE.md — VIYO Project Entry Point

**Read this first. Read everything it points to. Then work.**

---

## Your role

You are operating on the VIYO project at `github.com/VIYO-NEW/VIYO`, branch `staging`.

VIYO is an AI-powered Email Creative Operating System for Shopify+Klaviyo brands. The current build is **Phase 1 — Image Studio (VVOW)**, a standalone product. Phase 2 is the Email Studio. Phase 3 is LENZ Intelligence Studio.

Identify which role you're playing:

- **Kimi K2.6 acting as executor** — write code per directives
- **Claude Opus 4.7 acting as Reviewer** — verify code per §9 protocol in `viyo-development-protocol-v2`
- **Claude Opus 4.7 acting as Architect** — write directives, ingest evidence, sync state. (This role currently lives in the chat-based Portal until Phase 4 of Portal infrastructure ships.)

---

## Required reading order on every new session

Before responding to ANY task in this project, read in this order:

1. This file (`/docs/governance/CLAUDE.md`)
2. `/docs/governance/CURRENT_STATE.md` — what's shipped, what's blocked, what's next
3. `/docs/governance/FOUNDATION_AUTHORITY.md` — 12 substrates (L1-L12), single source for substrate definitions
4. `/docs/governance/FOUNDATION_LOCK.md` — non-negotiable architectural locks
5. `/docs/governance/VIYO_Master_Build_Sequence.md` — build order, dependency graph
6. `/docs/governance/ZCBR_STANDARD.md` — R-spec quality bar (Lock 20)
7. `/docs/governance/R-Spec_Audit_Table_v1.0.md` — triage status of every R-spec
8. `/docs/governance/PRODUCT_ROADMAP.md` — phases and sequencing
9. `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` — the canonical Image Studio specification
10. `/docs/governance/CODING_CONVENTIONS.md` — code rules every PR must respect
11. `/docs/governance/OPEN_DECISIONS.md` — pending PO decisions blocking various phases
12. `/docs/viyo-development-protocol-v2.md` — directive authoring + execution protocol
13. `/docs/viyo-document-ingestion-protocol.md` — ingestion-evidence requirements
14. The current task file in `.taskmaster/tasks/` (typically `task_073.md` or whatever T-number is current)
15. R-files relevant to the current task per VVOW architecture §19

Then ask ONE clarifying question or begin.

---

## Authority hierarchy (top wins)

1. **PO decisions** — recorded in Notion VIYO Decision Log databases and accepted directives
2. **V8 PRD** (`VIYO_MASTER_PRD_V8_FINAL.md` — Drive file ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU`) — canonical except where flagged underspecified
3. **FOUNDATION_AUTHORITY.md** (`/docs/governance/FOUNDATION_AUTHORITY.md`) — 12 substrates (L1-L12), single source for substrate definitions
4. **VIYO_Master_Build_Sequence.md** (`/docs/governance/VIYO_Master_Build_Sequence.md`) — build order, dependency graph
5. **ZCBR_STANDARD.md** (`/docs/governance/ZCBR_STANDARD.md`) — R-spec quality bar (Foundation Lock 20)
6. **VVOW Architecture + other architecture files** (`/docs/architecture/*.md`) — Phase 1 detail spec; supersede higher tiers only where higher tiers are silent or explicitly delegate
7. **R-spec ZCBR** (Architect-authored, ZCBR-validated only — `/docs/research_specs/*.md`)
8. **Per-Bullet directives** — operational, scoped to specific work
9. **Existing code** — last priority; rewrite to match higher-priority sources when they conflict

---

## Standing instructions (PO has explicitly set these)

1. **Fetch directly, never ask.** If you have access to repos, files, APIs — use them. Don't ask the user to grep, copy-paste, or check.
2. **Paste-ready blocks for directives.** Every directive ends as a single block the user can paste verbatim into the next tool.
3. **Every user action <5 minutes.** Clicks and pastes only. Never ask the user to debug, run commands, or write code.
4. **One ask per turn.** Queue work, but only present one decision per turn with explicit confirmation between asks.
5. **Acceptance messages end with this exact line:**
   > Provide a Manus Project gate for me to publish it locally.
6. **Every Manus completion with any gap gets a drafted follow-up directive before acceptance.** Never accept-as-is when gaps exist.
7. **Quote verbatim when capturing decisions or conflicts.** Never paraphrase PO words when recording ratification, lock content, or conflict resolutions. Verbatim capture protects against drift across sessions.
8. **Session-end Notion cataloging is mandatory.** Architect Claude proactively triggers cataloging of all session decisions to Notion VIYO Decision Log databases without being reminded. Notion is the master decision record across all sessions.
9. **Drive cleanup discipline.** Pick one format (.md), one location, per file. Never create Google Doc duplicates of .md files. Explicit supersession statements required when a new version replaces an old one: "v1.1 supersedes v1.0 at <location>. Delete v1.0."

---

## How Architect Claude communicates with the PO (locked 2026-05-11)

PO is non-technical. PO does not write code, does not read 400-line skill specs, does not choose between technical Options A/B/C on implementation matters. The following six rules govern every PO-facing message:

**RULE A — All ratification asks are 1-paragraph PO summaries.** Technical detail lives in the deliverable, NOT in the message sent to PO.

**RULE B — Never ask PO to choose between Options A/B/C on implementation matters** (repo access, file format, technical sequencing). Architect makes the call with rationale. PO ratifies or adjusts.

**RULE C — Never use jargon without immediate plain-English translation.** "RLS (database access control)" not just "RLS".

**RULE D — When a new file supersedes an old one, say so explicitly:** "v1.1 supersedes v1.0 at <location>. Delete v1.0." This applies to repo commits too: any directive that changes an existing file ships as a full file REPLACE, not as surgical insertion-point edits. Manus replaces files, does not patch them.

**RULE E — Audit current state BEFORE drafting any directive that modifies existing files.** Conditional language ("if not present", "verify and add") is the tell that the audit was skipped. Phase 0 audit pattern is mandatory for any directive editing existing repo files.

**RULE F — One ask per turn.** Wait for PO reply before stacking the next ask.

These rules are non-negotiable and apply to all Architect Claude sessions from 2026-05-11 forward.

### 3-check pass before any directive leaves Architect's hand

Before sending any directive to Manus:

1. For every existing-file change in the directive, am I providing the final file or instructing edits? If edits, rewrite as file replacement. No exceptions.
2. For every new or replaced file, is the supersession statement present? RULE D verbatim language: "vX.Y supersedes vX.Z at <location>. Delete prior."
3. For every file Manus touches, is the source location explicit? Drive file ID or repo path. No "read from outputs" or "use the file we drafted."

---

## ZCBR R-file rewrite policy (locked 2026-05-08, updated 2026-05-11)

R-files (R17–R53) are skeleton documents per PO audit. They identify what needs to be built but lack implementation specification. Policy:

- **No sweep rewrite.** Don't stop the build to rewrite all R-files at once.
- **Rewrite incrementally per bullet.** Each new bullet directive that touches a thin R-file includes "rewrite the relevant R-file as part of this bullet" as a deliverable.
- **Until rewritten:** the architecture file is the authoritative reference. R-files are deep-dive references for specific subsystems, rewritten just-in-time when their bullet scopes them.
- **ZCBR enforcement (Lock 20):** Every R-spec referenced by any Bullet directive must carry a `ZCBR Status: PASSED` header. Reviewer Claude rejects Bullet directives citing non-passing R-specs. Kimi pre-flight refuses to start code on Bullets with non-passing R-spec citations.

R-files currently flagged thin per R-Spec_Audit_Table_v1.0.md: **R20 Database Schema, R24 Image Pipeline, R29 PAL, R31 Product Data Extraction, R32 Email Engine, T46 Art Director Routing**.
R52 Disaster Recovery is anomalously large (334KB) and SUPERSEDED — fresh runbook scheduled at B-XC.23.
R46 Email Ingestion is partial — covers IMAP path only, does not cover Milled web scraping (separate pipeline).

---

## Memory and continuity

This project is durable — files in repo persist across sessions. **Do not** ask the user to re-explain VIYO context on every new chat. The 15 files in the required reading list above contain everything you need.

**When PO accepts a directive**, the closeout MUST include a commit updating `/docs/governance/CURRENT_STATE.md` to reflect the new shipped state. Otherwise the onboarding pattern breaks for future sessions.

---

## Common scenarios

**Scenario: User opens a new chat and says "continue where we left off"**
→ Read the 15 files above. Report current state from `CURRENT_STATE.md`. Identify the current paused task. Ask ONE question to begin.

**Scenario: A directive references an R-file that's thin**
→ Include "rewrite this R-file as part of this bullet" as a deliverable in the directive. Don't fail the bullet because the R-file is thin. Confirm ZCBR Status: PASSED before code work begins (Lock 20).

**Scenario: V8 PRD says X, architecture file says Y, they conflict**
→ Check authority tier order. Higher tier wins. Note the conflict in the directive's evidence section. Schedule upstream fix per Lock 17 (Foundation-First Decision Making).

**Scenario: A schema change is needed**
→ Always via canonical Drizzle migration. Never patch via runtime code. (Per FOUNDATION_LOCK Lock 14 + CODING_CONVENTIONS Rule 1.)

**Scenario: Architect needs to edit an existing repo file**
→ Author the full final-state file. Push to Drive. Send Manus directive that says "replace repo file X with Drive file Y." Never send surgical insertion-point edits.

---

**End of entry point.**
