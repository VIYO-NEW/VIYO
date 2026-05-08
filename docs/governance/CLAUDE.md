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
3. `/docs/governance/FOUNDATION_LOCK.md` — non-negotiable architectural locks
4. `/docs/governance/PRODUCT_ROADMAP.md` — phases and sequencing
5. `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` — the canonical Image Studio specification
6. `/docs/governance/CODING_CONVENTIONS.md` — code rules every PR must respect
7. `/docs/governance/OPEN_DECISIONS.md` — pending PO decisions blocking various phases
8. `/docs/viyo-development-protocol-v2.md` — directive authoring + execution protocol
9. `/docs/viyo-document-ingestion-protocol.md` — ingestion-evidence requirements
10. The current task file in `.taskmaster/tasks/` (typically `task_073.md` or whatever T-number is current)
11. R-files relevant to the current task per VVOW architecture §19

Then ask ONE clarifying question or begin.

---

## Authority hierarchy (top wins)

1. **PO decisions** — recorded in `/docs/governance/OPEN_DECISIONS.md` and accepted directives
2. **V8 PRD** (`01_PRD_and_Architecture/VIYO_MASTER_PRD_V8_FINAL.md`) — Drive folder, treated as canonical except where flagged underspecified
3. **Architecture files** (`/docs/architecture/*.md`) — supersede V8 PRD where PRD is underspecified for the relevant subsystem (e.g. VVOW)
4. **R-file ZCBR specs** (in repo and Drive) — supersede architecture only when more detailed; many are currently thin per audit
5. **Per-bullet directives** — operational, scoped to specific work
6. **Existing code** — last priority; rewrite to match higher-priority sources when they conflict

---

## Standing instructions (PO has explicitly set these)

1. **Fetch directly, never ask.** If you have access to repos, files, APIs — use them. Don't ask the user to grep, copy-paste, or check.
2. **Paste-ready blocks for directives.** Every directive ends as a single block the user can paste verbatim into the next tool.
3. **Every user action <5 minutes.** Clicks and pastes only. Never ask the user to debug, run commands, or write code.
4. **One ask per turn.** Queue work, but only present one decision per turn with explicit confirmation between asks.
5. **Acceptance messages end with this exact line:**
   > Provide a Manus Project gate for me to publish it locally.
6. **Every Manus completion with any gap gets a drafted follow-up directive before acceptance.** Never accept-as-is when gaps exist.

---

## ZCBR R-file rewrite policy (locked 2026-05-08)

R-files (R17–R53) are skeleton documents per PO audit. They identify what needs to be built but lack implementation specification. Policy:

- **No sweep rewrite.** Don't stop the build to rewrite all R-files at once.
- **Rewrite incrementally per bullet.** Each new bullet directive that touches a thin R-file includes "rewrite the relevant R-file as part of this bullet" as a deliverable.
- **Until rewritten:** the architecture file is the authoritative reference. R-files are deep-dive references for specific subsystems, rewritten just-in-time when their bullet scopes them.

R-files currently flagged thin: **R20 Database Schema, R24 Image Pipeline, R31 Product Data Extraction**.
R46 Email Ingestion is partial — covers IMAP path only, does not cover Milled web scraping (separate pipeline).

---

## Memory and continuity

This project is durable — files in repo persist across sessions. **Do not** ask the user to re-explain VIYO context on every new chat. The 11 files in the required reading list above contain everything you need.

**When PO accepts a directive**, the closeout MUST include a commit updating `/docs/governance/CURRENT_STATE.md` to reflect the new shipped state. Otherwise the onboarding pattern breaks for future sessions.

---

## Common scenarios

**Scenario: User opens a new chat and says "continue where we left off"**
→ Read the 11 files above. Report current state from `CURRENT_STATE.md`. Identify the current paused task. Ask ONE question to begin.

**Scenario: A directive references an R-file that's thin**
→ Include "rewrite this R-file as part of this bullet" as a deliverable in the directive. Don't fail the bullet because the R-file is thin.

**Scenario: V8 PRD says X, architecture file says Y, they conflict**
→ Architecture file wins (per authority hierarchy item 3). Note the conflict in the directive's evidence section. Future PRD update will reconcile.

**Scenario: A schema change is needed**
→ Always via canonical Drizzle migration. Never patch via runtime code. (Per FOUNDATION_LOCK Lock 13 + CODING_CONVENTIONS Rule 1.)

---

**End of entry point.**
