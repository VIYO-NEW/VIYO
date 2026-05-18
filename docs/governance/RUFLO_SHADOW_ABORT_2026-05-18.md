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

## Path Forward (revised 2026-05-18, post-PO-pushback + same-day Dispatch 3 execution)

The original REJECT-strong framing in this report was premature framework rejection (Ruflo memo §7 anti-pattern). PO caught the over-reach: CCD's git-layer isolation in Dispatch 2 was thin; real filesystem/user-account isolation was never attempted before reject. Same-day correction: Dispatch 3 executed WSL2-isolated retry; cage works; validation window now open.

Revised path forward, parallel:

**Tier 1 — WSL2 cage validation period OPEN.**

Container/WSL2 retry executed same-day per D88 revision. Outcome:

- Distro: Ubuntu-22.04 (WSL2 v2, App version 2.7.3.0, kernel 6.6.114.1-1)
- Shadow repo: /home/plato/viyo-shadow @ HEAD 5b90f34 (exact match to main)
- Git remotes: empty; push.default=nothing (commit egress sealed)
- Ruflo: 3.7.0-alpha.68 installed --minimal --no-global
- Plugins active: ruflo-core, ruflo-swarm, ruflo-agentdb, ruflo-rvf, ruflo-goals, ruflo-intelligence
- Plugins explicitly skipped: autopilot, federation, aidefence, hive-mind, iot-cognitum, neural-trader, market-data

Isolation proof (CCD verified, three-times-checked across dispatch):

| Check | Path | Result |
|---|---|---|
| Leak inside cage | /home/plato/.claude/CLAUDE.md | PRESENT (4-line Ruflo pointer, identical to Dispatch 2 host-direct leak) |
| Leak on Windows host | %USERPROFILE%\.claude\CLAUDE.md | ABSENT (pre/post/post-post all three checks) |
| Main VIYO repo | C:\Users\Admin\Documents\VIYO\repo | HEAD 5b90f34, working tree clean |

Bug #1744 still fires inside Linux userspace; cage prevents Windows host contamination. Validation window OPEN 2026-05-18; target close 2026-05-25 to 2026-06-01. Validation log: /home/plato/viyo-shadow/validation-log.md (inside cage; export via `wsl --export` or copy to /mnt/c/ when needed).

Step 8 decision target at validation close: REJECT / KEEP / NATIVE-PORT recommendation surfaced as D89-candidate (subject to grep-verify of Decisions DB at time of authoring per Rule E).

Rollback path (unchanged): `wsl --unregister Ubuntu-22.04` from admin PowerShell removes distro + all Ruflo state atomically. Single command.

**Tier 2 — Upstream evidence on Ruflo #1597 (PO action, when convenient).**

Provenance correction: CCD's original validation report cited bug #1744 (the install-study issue that drove --no-global flag addition in 3.6.28). The actual leak-bug-of-record is #1597, filed 2026-04-10, labels: bug / data-loss / installer / cli. Ruflo team confirmed in their tracker as "data loss by design flaw." 3.6.28 release notes claimed --no-global closed 3 of 5 #1744 papercuts; our 3.7.0-alpha.68 reproduction proves the fix did NOT propagate to the alpha line — regression of #1597.

Upstream action: file reproduction evidence on #1597 (reopen if closed) OR open new regression-tracking issue framed as "--no-global flag still leaks ~/.claude/CLAUDE.md in 3.7.0-alpha.68 — regression of #1597 fix attempted in 3.6.28." Cost: zero work, indefinite wait. Re-evaluation trigger when ruvnet ships stable release with confirmed fix.

PO action item, separate from this commit and from Tier 1 work.

**Tier 3 — Native-port (gated on Tier 1 outcome).**

If Tier 1 validation window closes KEEP (Ruflo cage proves Patterns 3/4/5 deliver real velocity value), native-port becomes the long-term answer to remove third-party runtime dependency from canonical state.

If Tier 1 closes REJECT (alpha bugs proliferate even inside cage, patterns underperform, or velocity gain doesn't materialize), drop Ruflo entirely; no native-port needed.

If Tier 1 closes NATIVE-PORT-NOW (specific patterns prove load-bearing but cage adds too much operational overhead), build the load-bearing patterns natively in-house using existing VIYO substrate (NIR Rule 6: principle over prescription).

Estimated native-port cost: 1-2 weeks per pattern. Decision substrate: validation evidence from Tier 1, not memo speculation.

D88 status: Open (revised 2026-05-18 from initial Locked).
D88 URL: https://www.notion.so/3649a84a4679812b9acdf163ac0e4565

---

*Validation closed 2026-05-18.*
