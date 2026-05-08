# CURRENT_STATE.md — VIYO Build Status

**Last updated:** 2026-05-08
**Updated by:** Initial creation alongside VVOW Architecture acceptance gate

---

## Active phase

**Phase 1 — Image Studio (VVOW)** — standalone product

---

## Shipped tasks (most recent first)

| Task | Description | Status |
|---|---|---|
| T72 | R2 auto-save + Brand Vault asset contract | ✅ Shipped |
| T71 | Token economics billing reconciliation | ✅ Shipped |
| T70 | Pattern DB cache-first metadata transparency | ✅ Shipped |
| T26 | Image Studio frontend | ✅ Shipped |
| T25 | Image Studio backend | ✅ Shipped |
| Phase 0 | Foundation (repo, monorepo, Hono API worker, deployment pipeline) | ✅ Complete |

---

## Current task

### T73 — Studio Editing Router Implementation

**Scope:** Backend milestone for the Editing Router. Routes existing image + natural-language edit instruction to the correct B1-B10 tool + model.

**Routing examples:**
- "Remove the person from the background" → B5 Object Removal → SAM 2 segmentation + smart fill
- "Change background to a beach" → B4 Background Swap → Flux 1.1 Pro inpainting
- "Make this poster bigger for print" → B7 Upscale → Real-ESRGAN
- "Lighten the image and crop to square" → B8 Quick Edit → Sharp/PIL programmatic

**Required behavior:**
- Non-destructive editing (`parent_asset_id` chained to original)
- Saves result to `assets` table with full lineage + JSONB metadata + pgvector embedding
- Emits RLHF signal on completion

**Status:** ⏸ **PAUSED before code implementation**

**Blocked on:** PO acceptance of `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`

**Next required action by PO:** Review the architecture file. Accept it. Then T73 unlocks and Kimi can begin implementation.

---

## Authority codes acknowledged

`ARCH_LOCK_V3`, `R18`, `R20`–`R23`, `Doc4 §0.1`, `P0-XX phasing`, `EF-87`

`viyo-development-protocol-v2` and `viyo-document-ingestion-protocol` acknowledged as locked authority documents.

---

## Repository state

- **Product repo:** `github.com/VIYO-NEW/VIYO`
- **Branch:** `staging`
- **Working tree:** Clean as of last sync (one local `todo.md` modification noted but not blocking)

---

## Dual record system

| Record | Location | Accessible to Kimi? |
|---|---|---|
| Taskmaster | `.taskmaster/config.json`, `.taskmaster/state.json`, `.taskmaster/tasks/tasks.json`, `.taskmaster/docs/*` (committed on `staging`) | ✅ Yes (filesystem) |
| Airtable Build Tracker | External SaaS | ❌ No (PO syncs status manually) |

---

## What's blocked, by what

| Item | Blocked on |
|---|---|
| T73 begins coding | PO acceptance of VVOW Architecture file |
| Phase 1 expansion beyond Milled scraping | OD-002 (legal review) |
| Phase 4 RLHF acceptance | OD-005 (3 reviewer accounts) |
| Public launch | OD-001 (pricing reconciliation) + 6 other open decisions |
| Best-for-the-Job model routing matrix | Future bullet directive (research task per VVOW Architecture §8.8.2) |

---

## Open architectural items (cross-references)

- `/docs/governance/OPEN_DECISIONS.md` for PO decisions blocking various phases
- `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` §8.8.2 for the Best-for-the-Job research task
- ZCBR R-file rewrite workstream — **incremental per bullet** (R20, R24, R31 flagged thin per audit)

---

## Update protocol

This file is updated:

1. **Automatically** as part of every accepted directive's closeout (per `viyo-development-protocol-v2`)
2. **Manually** by PO when major state changes occur outside the directive cycle

If this file is more than 14 days old, the closeout discipline has broken. Investigate.

---

**End of current state.**
