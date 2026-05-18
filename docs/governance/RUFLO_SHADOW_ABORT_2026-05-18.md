# Ruflo Shadow Validation — Aborted 2026-05-18

**Outcome:** REJECT-strong. Validation period closed at install + first-action stage.
**Ratified by:** PO 2026-05-18 (Option 3, explicit chat confirmation).
**Substrate:** Lock 18 (Tool-Capability-First) — capability claim must survive verify.
**Notion Decision:** D88 (authored separately by Architect via notion-create-pages).

---

## Timeline (UTC)

- 11:20  Shadow env cloned to `~/viyo-ruflo-shadow/` from VIYO-NEW/VIYO at staging tip (Phase 5 ledger anchor R).
- 11:22  Remote isolation: origin renamed → upstream → removed. `push.default=nothing`. Verified: `git remote -v` empty, `git push` returns "No configured push destination".
- 11:25  Pre-install snapshot: `~/.claude/CLAUDE.md` NOT PRESENT (clean baseline).
- 11:28  `npx -y ruflo@latest init --minimal --no-global` completed exit 0. Created in shadow: `.claude/`, `.claude-flow/`, `.mcp.json`, `CLAUDE.md` (4581b), 4 hook types declared in `.claude/settings.json`.
- 11:28  CONTAINMENT VIOLATION DETECTED: `~/.claude/CLAUDE.md` written despite `--no-global`.
- 11:34  Abort + rollback executed. Shadow + leaked pointer removed. Baseline restored.

---

## Finding 1 — `--no-global` flag-contract violation (rejection-grade)

Ruflo 3.7.0-alpha.68 documents `--no-global`:

> "Skip the ~/.claude/CLAUDE.md 'Ruflo Integration' pointer block (#1744)"

Observed: `ruflo init --minimal --no-global` wrote `~/.claude/CLAUDE.md` anyway. The help text itself references bug `#1744` — the ruvnet team knows this leak exists and shipped the flag in alpha.68 without fixing the bug behind it.

Leaked content (4 lines, all Ruflo-authored, would affect every Claude Code session on this user account):

- Instructs Claude to use ToolSearch to invoke Ruflo MCP tools.
- Names specific tools: `memory_store`, `memory_search`, `hooks_route`, `swarm_init`, `agent_spawn`.
- Directs attention to `[INTELLIGENCE]` system-reminder patterns.

Reproducibility: high — vanilla install, documented opt-out flag, single command.

---

## Severity

The PO directive (Ruflo Dispatch 2 ratification 2026-05-16) flagged exactly this failure mode:

> "Main VIYO repo at ~/VIYO/ stays untouched by Ruflo runtime"
> "Ruflo alpha bugs cannot affect canonical state"

The leak does not touch the main *repo* — but it touches the main *Claude runtime config*, which is upstream of every session that touches the main repo. The isolation guarantee the directive required is unachievable with this version of Ruflo using documented opt-out flags.

---

## Decision substrate

| Path | Status |
|------|--------|
| A. KEEP RUFLO          | Not viable — alpha cannot honor its own isolation contract |
| B. NATIVE-PORT         | Pending — Patterns 3/4/5 still potentially valuable, but build native against VIYO discipline |
| C. REJECT this version | Ratified — abort current validation, defer pattern research to native track |

---

## Recommendation (ratified)

REJECT 3.7.0-alpha.68 specifically. Do not retry until ruvnet closes `#1744` and ships a stable (non-alpha) release. Surface Patterns 3 (memory), 4 (swarm), 5 (GOAP) to the native-port research queue — implementations to be designed in-house against VIYO's existing governance discipline rather than imported via alpha third-party.

Patterns 1 + 2 from the Ruflo Selective Integration Research Memo already landed in main repo at Phase 5 ledger anchor R (native git-hooks for Rule E + Rule C external enforcement). Those remain the sole Ruflo-research-derived integration in main VIYO.

---

## Baseline restoration

- `~/viyo-ruflo-shadow/`  removed (`rm -rf`)
- `~/.claude/CLAUDE.md`   removed (`rm -f`)
- Main VIYO repo HEAD     unchanged (Phase 5 ledger anchor R, verified post-rollback)
- `~/.claude/` inventory  identical to pre-init (only pre-existing entries: `.last-cleanup`, `backups/`, `cache/`, `plugins/`, `projects/`, `session-env/`, `sessions/`, `settings.json`, `shell-snapshots/`)

---

## Anti-patterns surfaced during this work

For A9 (Cross-Surface Continuity Discipline) substrate. Two variants surface this session.

### Variant 5g instance #4 — memory-cited Decision number without DB grep-verify

CCD surfaced D86 as the proposed Decision slot in the candidate body, citing the slot from session-context memory rather than a Notion Decisions DB grep-verify. PO-side grep-verify caught: D86 and D87 were already authored as part of the D67/D68 ID-reuse cleanup Path α (committed in Phase 5 ledger anchor O — see SESSION_STATE.md ledger entry). The next available slot is D88. Counted as Rule E variant 5g instance #4 this session — the recurring pattern confirms that hooks-only closure (commit-msg SHA verify) is **insufficient** for conversational citations (Decision numbers, OD numbers, R-spec numbers, Notion page IDs). Conversational 5g needs a different mechanism (out of scope here; queued for A9 substrate design).

### Variant 5h — memory-cited git internals without empirical test

This morning's pre-commit hook (Dispatch 1 first iteration, pre-Path-α) was written against the assumption that `.git/COMMIT_EDITMSG` is reliably populated before pre-commit fires in the `git commit -m` workflow. Verification test (a) #1 falsified the assumption: `COMMIT_EDITMSG` is written **after** pre-commit completes, not before. The first iteration's design was thus a memory-cited git-internal assumption (intuited from generic git knowledge) that survived through author + install + production-test stages. Path α design correction moved the SHA + file-path verify to commit-msg (which reliably receives `$1` across `-m` / `-F` / editor flows).

Surfaced for A9 substrate as variant 5h — memory-cited tool/environment internals without empirical test before relying on them. Distinct from 5g (memory-cited governance artifact) but same family (memory citation as primary source rather than test-verified observation).

---

## Notion Decision sketch (D88 — authored by Architect, not CCD)

Per PO disposition 2026-05-18: Architect (PO-side Claude) authors the D88 page directly via notion-create-pages. CCD does not write to Notion. The sketch below is the substrate the Architect can draw from; final phrasing is the Architect's.

Target DB: Decisions Database (parent ref in SESSION_STATE.md Notion canonical surface).
Title: D88 — Ruflo shadow validation aborted; REJECT 3.7.0-alpha.68; defer Patterns 3/4/5 to native-port research.

Body sketch:

> **Context.** Per PO ratification 2026-05-16 (Ruflo Selective Integration Memo, Dispatch 2), shadow validation began 2026-05-18 to evaluate Ruflo Patterns 3 (memory), 4 (swarm), 5 (GOAP) against VIYO governance velocity. Isolation requirement: main VIYO repo + main Claude runtime untouched.
>
> **Finding.** First-action containment violation. `ruflo init --minimal --no-global` wrote `~/.claude/CLAUDE.md` despite the flag whose own help text documents the opt-out (Ruflo team's tracked bug #1744). Full evidence: this validation report.
>
> **Decision.** REJECT Ruflo 3.7.0-alpha.68 for VIYO integration. Shadow env removed; leaked pointer removed; baseline restored. Patterns 3/4/5 deferred to native-port research track.
>
> **Implications.**
> - Dispatch 1 native git-hooks (Phase 5 ledger anchor R) remains the sole Ruflo-research-derived integration in main VIYO.
> - Native-port research for Patterns 3/4/5 enters the pending queue (post-A6/MBS-canonical and post-A9).
> - Re-evaluation of Ruflo gated on: (a) ruvnet closing #1744, (b) stable (non-alpha) release, (c) PO re-ratification.
>
> **Ratified by:** PO 2026-05-18. Substrate: Lock 18 (Tool-Capability-First) — claim survived only one verify before failing.

---

*Validation closed 2026-05-18.*
