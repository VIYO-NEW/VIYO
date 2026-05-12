# INFRASTRUCTURE_DECISIONS.md — PO Decisions on Infrastructure Source-of-Truth

**Status:** Ratified by PO on 2026-05-08
**Source:** PO accepted Architect's recommendations on all 6 decisions following Manus infrastructure gap investigation report dated 2026-05-08
**Authority:** These decisions resolve the source-of-truth conflicts identified in the gap investigation. Builders must respect them. R-files (especially R21) and runbooks must be repaired to match.

---

## Decision 1 — Canonical Staging Branch

**Decision:** **`staging`** is the canonical branch for the staging environment.

**Rationale:** Live Render infrastructure already uses `staging`. The runbook reference to `develop` is stale and predates current implementation.

**Required follow-up:**
- Update `/docs/runbooks/staging-environment.md` to reference `staging` instead of `develop`
- Remove or rename any references to a `deploy-staging.yml` workflow that does not exist
- Ensure all R-files mentioning the staging branch use `staging` consistently

---

## Decision 2 — Production Deploy Trigger

**Decision:** **Auto-deploy on push to `main`** remains in effect for the pre-Alpha period.

**Trigger condition:** This decision will be re-evaluated when the platform enters **Alpha launch** (first paying customer or first non-internal user). At that point, production deploy may be reverted to manual-only.

**Rationale:** Pre-Alpha has zero production users. Speed of iteration matters more than safety gating. Auto-deploy stays.

**Required follow-up:**
- The header comments in `.github/workflows/deploy.yml` claiming "manual-only" must be removed or replaced with a clear statement of current PO policy: "Auto-deploy on push to `main` until Alpha entry, then revert to manual."
- Architect to flag a re-evaluation directive when Alpha milestone is approached

---

## Decision 3 — Storage Authority for Generated Assets

**Decision:** **Cloudflare R2** is the canonical asset storage backend.

**Rationale:** Implementation already uses R2. Two R2 buckets verified live: `viyo-assets-production` and `viyo-assets-staging`. R21 spec reference to Supabase Storage is stale.

**Required follow-up:**
- Update `/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md` to declare Cloudflare R2 as the asset storage backend
- Remove or relocate Supabase Storage references in R21
- Confirm Brand Vault asset contract (T72) explicitly names R2

---

## Decision 4 — Cloudflare Worker Scope (R28 Timer + Image Proxy + Edge Cache)

**Decision:** **Defer.** Cloudflare Workers for R28 are NOT in current scope. Marked as post-launch optimization.

**Rationale:** No traffic justifies edge optimization yet. Building R28 now diverts effort from user-facing Phase 1 work. The architectural intent stays in the spec but is gated to "revisit when traffic justifies."

**Required follow-up:**
- Update R21 (or relevant R-file containing R28) to mark R28 as "Deferred — post-launch optimization, revisit when traffic patterns justify edge serving"
- Existing legacy `sg_worker` Cloudflare Worker is NOT VIYO-owned and is not part of this architecture
- Do not commit R28 work to the build roadmap until PO explicitly re-prioritizes

---

## Decision 5 — Vercel Deployment Model

**Decision:** **Git-connected Vercel deployments.** Every Vercel project must be connected to the `VIYO-NEW/VIYO` GitHub repository with the appropriate branch wiring.

**Rationale:** Git-connected deployments leave reproducible release history, are standard, and remove ambiguity about what's deployed where. The current state — at least one project (`viyo-web`) lacking Git connection — is unsafe.

**Required follow-up (action items, not yet executed):**
- For each Vercel project (`viyo-admin`, `viyo-web`, `viyo-main`, `ai-api-web-portal`):
  - Verify Git connection is active
  - Verify the production branch is set to `main`
  - Verify staging-domain projects (or preview environments) build from `staging`
  - Verify environment variables are correctly scoped per environment
- Reconnect any projects lacking Git connection
- Document the verified state per project in `/docs/governance/INFRASTRUCTURE_INVENTORY.md`

---

## Decision 6 — Redis Isolation Verification

**Decision:** **Runtime smoke test required** to prove staging and production Redis databases are wired correctly.

**Rationale:** Two Upstash Redis databases exist (`viyo` + `viyo-redis-staging`), but their wiring to Render service environment variables is unverified. Names alone don't prove isolation.

**Required test (read/write only, no destructive operations):**
- Write a unique test key to staging Redis from the staging worker
- Confirm production worker CANNOT read that key
- Reverse: write a test key from production worker, confirm staging worker CANNOT read it
- Document results in evidence bundle
- Cleanup test keys after verification

---

## Cross-References

| Decision affects | File |
|---|---|
| 1, 2, 5 | `.github/workflows/*.yml` |
| 1 | `/docs/runbooks/staging-environment.md` |
| 2 | `/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md` |
| 3 | R21, T72 Brand Vault asset contract documentation |
| 4 | R21 (R28 section) |
| 5 | Vercel dashboard configuration (per-project) |
| 6 | Render environment variable scoping |
| All | `/docs/governance/INFRASTRUCTURE_INVENTORY.md` (when committed) |

---

## What this unlocks

- **T73 Studio Editing Router** can proceed once these decisions propagate via the next reconciliation directive (Manus repair work + smoke tests)
- Migration automation (the original Gap 1) can now be designed: it will trigger on push to `staging` for the staging Supabase, and on push to `main` for production Supabase — using the branch decisions ratified above

---

## Update authority

This file is updated only when PO ratifies new infrastructure decisions or revises existing ones. No agent (Kimi, Manus, Architect-in-Portal) modifies this file via runtime code or schema migrations.
