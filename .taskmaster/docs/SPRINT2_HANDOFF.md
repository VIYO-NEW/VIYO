# VIYO Sprint 2 — Session Handoff Document

**Created:** 2026-04-27  
**Purpose:** Complete handoff for a new Manus task to resume Phase 0 Pre-Flight for the VIYO Sprint 2.

---

## 1. PROJECT IDENTITY

| Item | Value |
|------|-------|
| **GitHub Repo** | `VIYO-NEW/VIYO` (private) |
| **Clone Command** | `gh repo clone VIYO-NEW/VIYO` |
| **Latest Commit** | `b526a2a` — `chore: add Sprint 2 task tree T15-T40 [Phase 0]` |
| **Branch** | `main` |
| **Manus Project** | VIYO (`nqcUEpBvNXhCtJZVUUcCWn`) |

---

## 2. WHAT IS ALREADY DONE (DO NOT REDO)

### Completed Tasks
- **T7 (Admin Portal Skeleton):** DONE. 12 lazy-loaded pages, AdminLayout, AuthGuard, bundle 253KB.
- **T9 (Stripe Billing Foundation):** DONE. Token Engine, 7 Stripe webhook handlers, 19 billing endpoints, full frontend.

### Phase 0 Pre-Flight — Completed Steps
1. VIYO Development Protocol V2.2.0 re-read — DONE
2. Doc9 V3 Part 12 (Performance & Bundle Architecture) read from Google Drive — DONE
3. PRD V5 Addendum downloaded from Google Drive → `.taskmaster/docs/prd_v5_addendum.txt` — DONE
4. Builder Instructions Sheet downloaded from Google Drive → `.taskmaster/docs/builder_instructions.txt` — DONE
5. TM config updated to openai provider with gpt-4.1-mini — DONE
6. PRD parsed via OpenAI Python SDK → 26 tasks (IDs 15-40) written to `.taskmaster/tasks/tasks.json` — DONE
7. `task-master list` verified the task tree loads correctly — DONE

---

## 3. WHAT NEEDS TO BE DONE NOW (RESUME HERE)

### Step 1: Sync 26 Tasks to Airtable Build Tracker

**Previous attempt FAILED** — all 26 `create_record` calls returned:
```
INVALID_MULTIPLE_CHOICE_OPTIONS: Insufficient permissions to create new select option "Sprint 2"
```

**THE FIX:** The "Phase" field is a single-select dropdown. Valid options are:
- Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7
- Marketing, V1.1, Future

**Use `"Phase 2"` for all 26 tasks** (this is the AI Engine / Image Studio phase).

**Zero records were created** — no cleanup needed. Just fix the value and run fresh.

#### Airtable Config

| Table | Base ID | Table ID |
|-------|---------|----------|
| **Build Tracker** | `appo5mNncCCzKcIRk` | `tblIJUzJoCCjWXaMQ` |
| VIYO Q&A Master Log | `appo5mNncCCzKcIRk` | `tblWr8n54Vb83egxR` |
| Skills Registry | `appo5mNncCCzKcIRk` | `tbl4gNd7bWjypMQBF` |
| Services Inventory | `appo5mNncCCzKcIRk` | `tblcRL2RNys7SIiW5` |

#### Build Tracker Field Names (from existing T7/T9 records)

| Field | Type | Example (T9) |
|-------|------|-------------|
| Feature ID | Text | `T9-BILLING` |
| Feature Name | Text | `Stripe Billing Foundation` |
| Status | Select | `Done`, `Not Started`, `In Progress` |
| Phase | Select | `Phase 0` through `Phase 7`, `Marketing`, `V1.1`, `Future` |
| PRD Section | Text | `R17 §5, Doc1 §5, Arch Lock §Billing` |
| Dependencies | Text | `T3, T4` |
| Version | Text | `V1` |
| Notes | Long text | Free text |

#### MCP Tool for Creating Records

```bash
# Tool name is create_record (SINGULAR, not plural)
manus-mcp-cli tool call create_record --server airtable --input '{
  "baseId": "appo5mNncCCzKcIRk",
  "tableId": "tblIJUzJoCCjWXaMQ",
  "fields": {
    "Feature ID": "T15-ROUTER",
    "Feature Name": "Install TanStack Router in Web App",
    "Status": "Not Started",
    "Phase": "Phase 2",
    "PRD Section": "Doc9 V3 P12",
    "Dependencies": "None",
    "Version": "V1",
    "Notes": "[HIGH] Install and configure TanStack Router..."
  }
}'
```

**IMPORTANT:** Create records ONE AT A TIME with ~1s delay between calls to avoid rate limiting. Do NOT batch.

### Step 2: Present Task Tree to PO for Approval

After all 26 records are in Airtable, present the full task tree as a formatted table to the PO (user) for approval. The PO explicitly stated: **"Send me the task tree BEFORE coding. I want to see the full TM-generated task breakdown with dependencies before you begin coding."**

### Step 3: Wait for PO Approval — DO NOT CODE

Do NOT start any coding until the PO explicitly approves the task tree.

### Step 4: After Approval — Begin T15

Start with T15 (Install TanStack Router in Web App) following the full 9-phase VIYO Development Protocol.

---

## 4. THE 26-TASK TREE (IDs 15-40)

These are in `.taskmaster/tasks/tasks.json` **committed to the repo** (force-added past gitignore at commit `b526a2a`).

| ID | Title | Priority | Dependencies | Feature ID |
|----|-------|----------|-------------|------------|
| 15 | Install TanStack Router in Web App | HIGH | None | T15-ROUTER |
| 16 | Database Migration: Create comments Table | HIGH | T9 | T16-COMMENTS-DB |
| 17 | Database Migration: Create webhook_endpoints and webhook_delivery_logs Tables | HIGH | T9 | T17-WEBHOOKS-DB |
| 18 | Database Migration: Create notification_preferences Table | MEDIUM | T9 | T18-NOTIF-DB |
| 19 | Database Migration: Create integration_connections Table | MEDIUM | T9 | T19-INTEGRATIONS-DB |
| 20 | Database Migration: Update image_prompt_patterns Table | HIGH | T9 | T20-PATTERNS-DB |
| 21 | Implement Art Director Router 4D Scoring Matrix | HIGH | T16, T20 | T21-ART-DIRECTOR |
| 22 | Implement Art Director Router Zero-Shot Fallback | HIGH | T21 | T22-ZERO-SHOT |
| 23 | Implement Provider Tier Routing in Art Director Router | HIGH | T21 | T23-PROVIDER-TIER |
| 24 | Build Image Studio Page Layout | HIGH | T15, T21 | T24-STUDIO-LAYOUT |
| 25 | Implement Image Studio Generation Flow Backend | HIGH | T21, T16, T9 | T25-STUDIO-BACKEND |
| 26 | Implement Image Studio Generation Flow Frontend | HIGH | T15, T24, T25 | T26-STUDIO-FRONTEND |
| 27 | Implement Image Studio Editing Tools: Touch Edit | HIGH | T25, T24 | T27-TOUCH-EDIT |
| 28 | Implement Image Studio Editing Tools: Layer Splitting | MEDIUM | T24 | T28-LAYER-SPLIT |
| 29 | Implement Image Studio Editing Tools: Background Swap | MEDIUM | T25, T24 | T29-BG-SWAP |
| 30 | Implement Image Studio Version History Panel | MEDIUM | T27, T28, T29 | T30-VERSION-HISTORY |
| 31 | Implement Brand Vault @ Mention System in AI Command Panel | HIGH | T15, T24, T16 | T31-BRAND-VAULT-MENTION |
| 32 | Auto-Save Generated Images to Brand Vault Assets Table | HIGH | T25 | T32-AUTO-SAVE-VAULT |
| 33 | Build Brand Chat Panel Component | MEDIUM | T15, T16 | T33-BRAND-CHAT |
| 34 | Implement Pin-on-Canvas Comments Overlay in Image Studio | MEDIUM | T24, T16, T33 | T34-PIN-ON-CANVAS |
| 35 | Implement Section-Anchored Comments in Email Editor | MEDIUM | T16 | T35-SECTION-COMMENTS |
| 36 | Implement Brand Chat Panel Super-Search | MEDIUM | T33 | T36-SUPER-SEARCH |
| 37 | Build Webhook Management API Endpoints | MEDIUM | T17 | T37-WEBHOOK-API |
| 38 | Implement Webhook Dispatcher Inngest Function | MEDIUM | T17 | T38-WEBHOOK-DISPATCHER |
| 39 | Add Inngest Event Emission Points for Webhooks | MEDIUM | T38, T25, T16 | T39-EVENT-EMISSION |
| 40 | Integration Tests for Token Engine + Stripe Webhooks | HIGH | T25, T9 | T40-INTEGRATION-TESTS |

---

## 5. BUILD SEQUENCE (from Builder Instructions)

1. **DB Migrations First:** T16, T17, T18, T19, T20 (all depend only on T9 which is DONE)
2. **Art Director Router:** T21, T22, T23
3. **Image Studio:** T24, T25, T26, T27, T28, T29, T30, T31, T32
4. **Collaboration:** T33, T34, T35, T36
5. **Webhooks Engine:** T37, T38, T39
6. **Integration Tests (PO CONDITION):** T40

T15 (TanStack Router) is a **parallel blocker** — must be done before any frontend task (T24, T26, T31, T33).

---

## 6. TECHNICAL CONTEXT

### Monorepo Structure
- `apps/worker` — Hono API (Cloudflare Workers), Inngest functions, Stripe webhooks
- `apps/web` — React web app (NO router yet — T15 installs TanStack Router)
- `apps/admin` — React admin portal (TanStack Router already installed)
- `packages/db` — Drizzle ORM schemas and migrations
- `packages/shared` — Shared types, schemas (Zod), events (Inngest)
- `packages/ui` — Shared UI components with Tailwind preset

### Key Technical Decisions (LOCKED)
- Tokens (not credits): 1 VIYO Token = $0.00000298 (TOKEN_MULTIPLIER: 335,000)
- Pricing tiers: Free ($0), Starter ($49), Growth ($149), Agency ($499)
- Dual-write pattern: R23 usage_ledger (USD) + T9 token_ledger (tokens)
- atomic_token_deduction RPC with FOR UPDATE row locking
- `comments.target_type` is VARCHAR, not ENUM (extensible)
- Brand Chat Panel is brand-scoped, not workspace-global
- Art Director Router scoring: `SCORE = (Q × 0.4) + (C × 0.3) × F × T`
- Every generation MUST query Pattern DB before calling any model
- Every generation MUST call atomic_token_deduction

### CI/CD
- CI: lint → type-check → build (no test step — honest)
- Deploy: manual only (workflow_dispatch)
- Bundle budgets: app code < 50KB, total initial < 300KB

### Taskmaster
- Version: v0.43.1 (installed globally via pnpm)
- TM CLI `parse-prd` fails with our API proxy (json_schema not supported) — use `parse_prd.py` as fallback
- Config at `.taskmaster/config.json` — set to openai/gpt-4.1-mini

---

## 7. GOOGLE DRIVE DOCUMENTS (READ-ONLY, NEVER COMMIT)

| Document | Google Drive Doc ID |
|----------|-------------------|
| PRD V5 Addendum | `157Jg-Fl3GK9GFTxTaGN8qfEdn-Cl3bbnexgvNCn_yrI` |
| Builder Instructions Sheet | `1lSsblg07FeLfmJynBP4qI6NwMMbzgRbwqQzbz8AMUI8` |
| Doc9 V3 (Master Spec) | Already read — key sections in memory |

**RULE:** NEVER commit Google Drive documents to the repo. Read from Drive when needed.

---

## 8. SKILLS TO READ BEFORE ANY WORK

1. `/home/ubuntu/skills/viyo-development-protocol-v2/SKILL.md` — 9-phase build protocol (MANDATORY)
2. `/home/ubuntu/skills/task-master/SKILL.md` — Taskmaster CLI usage
3. `/home/ubuntu/skills/resilience-guard/SKILL.md` — Checkpoint/recovery protocol
4. `/home/ubuntu/skills/post-build-completion-protocol/SKILL.md` — Phase 8 checklist

---

## 9. HARD CONSTRAINTS

- **Bundle Budget:** App code < 50KB, total initial < 300KB. Run `npx vite-bundle-visualizer` at every Deploy Gate.
- **Honest CI:** No `continue-on-error` disguised as PASS.
- **Commit Discipline:** Git log reads like a changelog. Max 2 commits per blocker resolution round.
- **Google Drive Rule:** NEVER commit/copy/export Google Drive documents into the repo.
- **No UI Placeholders:** If a mode isn't wired to the backend, don't expose it in the UI.
- **Integration Tests (T40):** PO condition — must complete before sprint is done.
- **Task Tree Approval:** PO must approve before ANY coding begins.
- **Code Docs:** Every `.ts/.tsx` file starts with JSDoc block. Every exported function has a one-line comment. Non-obvious decisions get `// WHY:` comments.
- **Git Commits:** Conventional Commits format: `type(scope): description [T#]`

---

## 10. IMMEDIATE ACTION SEQUENCE FOR NEW TASK

```
1. Clone repo:           gh repo clone VIYO-NEW/VIYO
2. Verify tasks:         cd VIYO && task-master list
3. Read protocol skill:  cat /home/ubuntu/skills/viyo-development-protocol-v2/SKILL.md
4. Sync to Airtable:     Create 26 records (use "Phase 2", create_record singular, one at a time)
5. Present task tree:    Format as table, send to PO as ask-type message
6. WAIT for PO approval
7. Begin T15 after approval
```

---

## 11. REFERENCE: EXISTING AIRTABLE RECORDS

| Feature ID | Record ID | Status |
|-----------|-----------|--------|
| T7-ADMIN | `recQhcnLlUl4ZDOfh` | Done |
| T9-BILLING | `rec6EIfCHwuSIUQzd` | Done |

---

## 12. SELF-HEAL LOG

### 2026-04-27 — Airtable Sync — `syntax_or_args`
- **Error:** `INVALID_MULTIPLE_CHOICE_OPTIONS: Insufficient permissions to create new select option "Sprint 2"`
- **Root Cause:** "Phase" field is a single-select dropdown. "Sprint 2" is not a valid option.
- **Fix:** Use `"Phase 2"` (valid existing option) instead of `"Sprint 2"`.
- **Reusable rule:** Always check valid dropdown options before creating Airtable records. Use `describe_table` or check existing records first.

### 2026-04-27 — Sandbox Overload — `network_or_timeout`
- **Error:** WebSocket connection timeout on all shell sessions after running 26 sequential `manus-mcp-cli` subprocess calls.
- **Root Cause:** High system load (load avg 10.22) from accumulated processes.
- **Fix:** Migrate to new task (clean sandbox). Add delays between MCP calls.
- **Reusable rule:** When running many MCP calls sequentially, use 1-2s delays and monitor load. If sandbox becomes unresponsive after 3 shell attempts, escalate to new task.
