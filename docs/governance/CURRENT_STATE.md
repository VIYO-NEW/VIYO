# CURRENT_STATE.md — VIYO Build Status

**Last updated:** 2026-05-08 (post infrastructure gap investigation + PO decisions ratified)

---

## Active phase

**Phase 1 — Image Studio (VVOW)** — standalone product

---

## Shipped tasks (most recent first)

| Task | Description | Status |
|---|---|---|
| Governance | Initial governance file system + VVOW architecture committed | ✅ Shipped via PR #7 |
| Infrastructure | Gap investigation completed; 6 PO decisions ratified | ✅ Documented (see `INFRASTRUCTURE_REPORT.md`, `INFRASTRUCTURE_DECISIONS.md`) |
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

**Blocked on:** Cleanup work packages WP-1 through WP-5 (see below). T73 is unblocked once these complete because:
1. Migration ceremony or automation must exist before T73 ships any schema change
2. Vercel reconnection ensures any UI changes T73 may eventually need actually deploy

---

## Active cleanup work packages (post-decisions)

These work packages execute the 6 PO decisions ratified 2026-05-08. They run before T73 begins.

| WP | Description | Owner | Status |
|---|---|---|---|
| **WP-1** | **Source-of-Truth Repair.** Update R21 spec + staging runbook to reflect PO decisions: staging branch = `staging`, storage = Cloudflare R2, R28 deferred, repository = `VIYO-NEW/VIYO`. | Manus | Pending directive |
| **WP-2** | **Render Blueprint Reconciliation.** Patch `render.yaml` to remove stale `infra/domain-render-no-workflows` branch reference and align with live `main`/`staging` mapping. | Manus | Pending directive |
| **WP-3** | **Vercel Deployment Audit.** Verify Git connection on all 4 Vercel projects (`viyo-admin`, `viyo-web`, `viyo-main`, `ai-api-web-portal`). Reconnect any lacking Git. Document branch + env wiring per project. | Manus | Pending directive |
| **WP-4** | **Redis Isolation Smoke Test.** Run staging-first runtime test proving `viyo-redis-staging` and `viyo` are not cross-readable from the wrong worker. Document results. | Manus | Pending directive |
| **WP-5** | **Migration Automation Design.** Design (not yet implement) the CI workflow that auto-applies Drizzle migrations to staging Supabase on `staging` branch merge, with manual approval gate for production. | Architect → Manus | Pending directive |

After WP-1 through WP-5 complete, T73 can begin implementation.

---

## Authority codes acknowledged

`ARCH_LOCK_V3`, `R18`, `R20`–`R23`, `Doc4 §0.1`, `P0-XX phasing`, `EF-87`

`viyo-development-protocol-v2` and `viyo-document-ingestion-protocol` acknowledged as locked authority documents.

`/docs/governance/INFRASTRUCTURE_DECISIONS.md` ratified by PO 2026-05-08.

---

## Repository state

- **Product repo:** `github.com/VIYO-NEW/VIYO` (correction from prior `viyo-ai/VIYO`)
- **Branch:** `staging` (canonical per Decision 1)
- **Production branch:** `main`
- **Working tree:** PR #7 governance commit merged

---

## Verified infrastructure (post-gap-investigation)

| Service | State |
|---|---|
| **Cloudflare R2** | Two buckets verified: `viyo-assets-production` + `viyo-assets-staging` |
| **Render** | Two services: `viyo-worker` (main) + `viyo-worker-staging` (staging). Auto-deploy on. |
| **Upstash Redis** | Two databases: `viyo` + `viyo-redis-staging` (runtime mapping pending WP-4) |
| **Supabase** | 3 projects: production, staging, ai-api-web-portal. RLS enabled all tables. pgvector v0.8.0. **Migrations currently MANUAL — migration automation pending WP-5.** |
| **Inngest** | 3 environments: production, staging, branch |
| **Sentry** | 5 projects active |
| **Vercel** | 4 projects. **Git connection unverified on some — pending WP-3.** |
| **Cloudflare D1, Hyperdrive, Pages** | Confirmed absent (clarifies prior open question) |
| **Cloudflare Workers** | Only legacy `sg_worker` (not VIYO-owned). R28 Worker deferred per Decision 4. |

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
| T73 begins coding | WP-1 through WP-5 cleanup work |
| Phase 1 expansion beyond Milled scraping | OD-002 (legal review) |
| Phase 4 RLHF acceptance | OD-005 (3 reviewer accounts) |
| Public launch | OD-001 (pricing reconciliation) + 6 other open decisions + WP cleanup work |
| Best-for-the-Job model routing matrix | Future bullet directive (research task per VVOW Architecture §8.8.2) |

---

## Open architectural items (cross-references)

- `/docs/governance/OPEN_DECISIONS.md` for PO decisions blocking various phases
- `/docs/governance/INFRASTRUCTURE_DECISIONS.md` for ratified infrastructure policy decisions
- `/docs/governance/INFRASTRUCTURE_REPORT.md` for the full infrastructure inventory + gap analysis
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
