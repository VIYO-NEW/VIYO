# VIYO Infrastructure Gap Investigation and Migration Automation Proposal

**Prepared by:** Manus AI  
**Prepared for:** VIYO  
**Date:** May 8, 2026  
**Scope:** Read-only infrastructure gap investigation, live Cloudflare REST verification, evidence cross-reference, and non-mutating migration automation proposal.  
**Security posture:** No provider resources were created, edited, restarted, deployed, deleted, replayed, flushed, rotated, or migrated during this investigation. Cloudflare credential material supplied during the task was used only for GET-only verification and is not included in this report.

## Executive Summary

The VIYO infrastructure stack is materially provisioned, but it is not yet governed by a clean single source of truth. Live and recovered evidence confirms that VIYO has active infrastructure across Cloudflare, Render, Vercel, Supabase, Upstash, Inngest, Sentry, and GitHub. The most important finding is that the platform’s launch risk is not primarily missing infrastructure; it is **drift** between provider state, runbooks, checked-in configuration, and the prior inventory narrative. This drift appears in the staging branch strategy, Render blueprint settings, Vercel deployment automation, storage authority, and Cloudflare edge-service expectations.[1] [2] [3] [4]

The Cloudflare question is now materially resolved. A corrected read-only REST verification using the Cloudflare account email and supplied credential succeeded. The account has one active `viyo.new` zone, twenty DNS records, two R2 buckets, one KV namespace, one Worker script, zero Pages projects, zero D1 databases, and zero Hyperdrive configs. The D1 and Hyperdrive conclusion should be stated carefully: they are **absent now** in the verified account inventory, and no available local evidence showed they had been created previously, but historical non-creation would require provider audit logs if that level of proof is required.[1] [5]

The strongest positive evidence is that key production and staging resources are real. Cloudflare DNS points Vercel-facing records to Vercel and API records to Render. Cloudflare R2 has separate production and staging buckets. Render has two live Docker web services, `viyo-worker` on `main` and `viyo-worker-staging` on `staging`, both with auto-deploy enabled. Upstash has two active global paid Redis databases, including a staging-named database. Inngest exposes production, branch, and Staging environments through the tested API credentials. GitHub contains CI, deploy, and secret-scan workflows.[1] [6] [7] [8] [9]

The strongest gaps are governance and automation gaps. The staging runbook says staging uses `develop` and `.github/workflows/deploy-staging.yml`, while live Render evidence shows staging is deployed from `staging`, and the local workflow list does not include `deploy-staging.yml`. The checked-in `render.yaml` still references `infra/domain-render-no-workflows`, while live Render services use `main` and `staging`. The production GitHub deploy workflow triggers a Render deploy hook and health-checks the worker, but it does not deploy the Vercel web/admin projects; it only verifies their HTTP status. A prior Vercel dashboard note also states that `viyo-web` was not connected to a Git repository at verification time, which means Vercel deployment automation must be re-verified before claiming GitHub-to-Vercel release integrity.[3] [4] [6] [10]

My recommendation is not a broad provider migration. VIYO should run a **controlled infrastructure reconciliation sprint**. The sprint should first freeze the current state into an evidence bundle, then obtain PO decisions on branch strategy, storage authority, production deploy trigger posture, Cloudflare Worker scope, Vercel deployment model, and Redis isolation proof. Only after those decisions are recorded should the team patch source-of-truth documents, reconcile `render.yaml`, verify Vercel project Git connections, create or repair staging deployment automation, and add staging-first runtime smoke tests.[2] [3] [4] [11]

## Verification Boundaries and Safety Notes

This investigation used read-only evidence paths. Cloudflare was checked through REST GET-only calls after the credential-format issue was resolved; the resulting report redacted sensitive DNS MX/TXT contents and omitted the credential value.[1] Render, Inngest, and Upstash evidence was gathered from read-only metadata/API summaries, and recovered project files were used to compare source-of-truth expectations against provider state.[6] [7] [8]

> **Safety note:** The investigation did not modify Cloudflare DNS, R2 buckets, KV namespaces, Workers, Pages, D1, Hyperdrive, Render services, Vercel projects, Supabase databases, Upstash Redis keys, Inngest functions, Sentry projects, GitHub workflows, or repository branches. Any future mutation must be approved one provider at a time with a named rollback plan.

The evidence is sufficient to classify infrastructure gaps and propose safe automation sequencing. It is not sufficient to certify launch readiness. Launch readiness still requires live Vercel project verification, runtime smoke tests, explicit PO decisions on source-of-truth conflicts, and evidence that staging and production runtime secrets point to the correct isolated resources.

## Read-State Disclosure

The following table records the primary evidence sources read or used during the resumed investigation. This is included because VIYO work requires source-read evidence rather than unsupported architectural assertions.

| Source | Type | How it was used |
|---|---|---|
| `/tmp/cloudflare_rest_readonly_summary_redacted.md` | Live Cloudflare REST evidence | Verified account, zone, DNS, R2, KV, Workers, Pages, D1, and Hyperdrive state with sensitive DNS values redacted.[1] |
| `/tmp/cloudflare_mcp_r2_buckets.json` | Cloudflare integration evidence | Corroborated production/staging R2 bucket names and creation timestamps.[5] |
| `/tmp/render_readonly_summary.md` | Live Render API evidence | Verified Render service names, branches, plans, URLs, auto-deploy flags, and deploy history.[6] |
| `/tmp/upstash_readonly_summary.md` | Live Upstash API evidence | Verified two active global paid Redis databases and noted runtime mapping still requires comparison against Render env values.[8] |
| `/tmp/inngest_readonly_summary.md` | Live Inngest API evidence | Verified account reachability and visible environments while documenting the webhook/function verification gap.[7] |
| `/home/ubuntu/VIYO_Infrastructure_Inventory_Report.md` | Baseline inventory report | Served as the prior report to validate, correct, and extend.[9] |
| `/home/ubuntu/VIYO/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md` | Intended infrastructure spec | Identified expected Cloudflare Workers edge compute, Supabase Storage blob storage, and branch strategy.[2] |
| `/home/ubuntu/VIYO/docs/runbooks/staging-environment.md` | Staging source-of-truth runbook | Identified conflict between intended `develop` branch workflow and live `staging` deployment state.[3] |
| `/home/ubuntu/VIYO_branch_lock/branch_lock_report.md` | Operational branch-lock evidence | Verified Render production/staging branch map and staging Sentry environment repair.[4] |
| `/home/ubuntu/VIYO/.github/workflows/deploy.yml` | GitHub workflow source | Verified actual production deploy trigger and the fact that Vercel web/admin are checked, not deployed, by this workflow.[10] |
| `/home/ubuntu/VIYO/.local-sec/progress/vercel_web_verification.md` | Vercel dashboard note | Identified the `viyo-web` Git connection gap at the time of that verification.[11] |
| `/home/ubuntu/VIYO_branch_lock/render_r2_verification_notes_2026-05-02.md` | Render environment audit note | Corroborated that production and staging Render env groups had saved masked R2 values.[12] |

## Updated Infrastructure Findings

The current evidence supports a revised infrastructure inventory with stronger Cloudflare, Render, and Upstash conclusions than the earlier report. It also requires corrections to repository identity, Render service type, Vercel automation claims, and staging workflow assumptions.

| Area | Current verified state | Disposition |
|---|---|---|
| Cloudflare account and zone | One account was visible through REST verification, and the `viyo.new` zone is active with full zone type and not paused.[1] | **Validated.** |
| Cloudflare DNS | Twenty DNS records were returned. Vercel-facing application records point to Vercel DNS targets, and Render API records point to the Render worker services. MX and TXT records were verified present but redacted in the report.[1] | **Validated with redaction.** |
| Cloudflare R2 | Two R2 buckets are visible: one production bucket and one staging bucket. The MCP evidence separately lists `viyo-assets-production` and `viyo-assets-staging`.[1] [5] | **Validated at bucket-name level.** |
| Cloudflare D1 | Zero D1 databases are visible.[1] | **Validated absent.** |
| Cloudflare Hyperdrive | Zero Hyperdrive configs are visible.[1] | **Validated absent.** |
| Cloudflare Pages | Zero Pages projects are visible.[1] | **Validated absent.** |
| Cloudflare KV | One KV namespace named `shopsimplio` is visible.[1] | **New finding; VIYO relevance unproven.** |
| Cloudflare Workers | One Worker script named `sg_worker` is visible and appears old by creation/modification date. No VIYO-specific R28 timer/image Worker was visible in the REST summary.[1] [2] | **Architecture gap or unrelated legacy asset.** |
| Render worker/API | `viyo-worker` and `viyo-worker-staging` are live Docker web services. Production tracks `main`; staging tracks `staging`; both are on starter plan and have auto-deploy enabled.[6] | **Validated.** |
| Render blueprint | Local `render.yaml` still references `infra/domain-render-no-workflows`, which conflicts with live Render settings and branch-lock evidence.[4] [6] | **Infrastructure-as-code drift.** |
| Vercel web/admin | Vercel is still the expected frontend host, but current Git connection and deployment automation require fresh verification. The recovered Vercel note says `viyo-web` was not connected to Git at verification time.[10] [11] | **Partially verified; automation gap.** |
| Supabase | The prior inventory reports production, staging, and AI portal Supabase projects, RLS, and pgvector. This resumed segment did not re-query Supabase, but it identified a storage-source conflict between R21 and runtime R2 evidence.[2] [9] | **Inherited with source conflict.** |
| Upstash | Two active global paid Redis databases exist: `viyo` and `viyo-redis-staging`.[8] | **Validated with correction to prior single-DB narrative.** |
| Inngest | Production, branch, and Staging environments are visible through the tested API credentials. The tested webhook endpoint did not prove function registration.[7] | **Partially validated.** |
| Sentry | The prior report lists five Sentry projects. Branch-lock evidence confirms staging runtime Sentry environment repair on Render.[4] [9] | **Inherited plus runtime corroboration.** |
| GitHub | Local remote is `VIYO-NEW/VIYO`, and workflows include `ci.yml`, `deploy.yml`, and `secret-scan.yml`.[10] | **Correction to repository identity and workflow list.** |

## Material Corrections to the Previous Inventory Report

The prior inventory report remains useful as a baseline, but several statements should be revised before it becomes an authoritative infrastructure source. The revisions below distinguish between corrections, strengthened evidence, and unresolved gaps.

| Inventory area | Previous statement or implication | Required update |
|---|---|---|
| Cloudflare verification method | Cloudflare was verified mainly through codebase/CORS configuration, and R2 dashboard access was not available.[9] | Replace with REST GET-only verification for DNS, R2, KV, Workers, Pages, D1, and Hyperdrive. Preserve redaction of MX/TXT contents.[1] |
| R2 storage | R2 was inferred from environment variables.[9] | State that R2 buckets are live-verified and separated by production/staging at the bucket-name level.[1] [5] |
| D1 and Hyperdrive | Not listed. | Add that D1 and Hyperdrive are absent in the verified Cloudflare account inventory.[1] |
| Render service type | Render was described as background/private service definitions from codebase.[9] | Update to live Render API evidence: Docker web services hosting worker/API endpoints, with public API domains and `/health` checks.[6] |
| Render branches | Baseline relied on codebase definitions.[9] | State that live provider settings show production on `main` and staging on `staging`, while checked-in `render.yaml` still has stale branch references.[4] [6] |
| Vercel deployments | The report says production deployments are triggered from `main`.[9] | Require fresh Vercel project verification. Current GitHub deploy workflow does not deploy Vercel projects, and recovered dashboard evidence says `viyo-web` lacked Git connection at verification time.[10] [11] |
| GitHub repository | The report lists `viyo-ai/VIYO`.[9] | Update to `VIYO-NEW/VIYO` unless a rename/transfer is proven elsewhere. Local remote and selected project context support `VIYO-NEW/VIYO`.[10] |
| Workflows | The report lists `ci.yml` and `deploy.yml`.[9] | Add `secret-scan.yml`; clarify `deploy.yml` currently has a `push` trigger on `main` despite header comments originally describing manual-only posture.[10] |
| Upstash | The report lists one `viyo` database.[9] | Update to two active global paid Redis databases: `viyo` and `viyo-redis-staging`.[8] |
| Domain topology | API domains were not explicitly included in the prior topology table.[9] | Add `api.viyo.new` and `api.staging.viyo.new`, both pointing to Render targets through Cloudflare DNS.[1] [6] |
| Storage authority | R21 says Supabase Storage is the blob layer, while implementation evidence points to Cloudflare R2.[2] [12] | Record as a source-of-truth conflict requiring PO decision and doc repair. |

## Gap Register

The following register prioritizes gaps by launch impact, not by implementation difficulty. A lower priority does not mean “ignore”; it means the gap should not block the higher-risk reconciliation work.

| Priority | Gap | Evidence | Why it matters | Recommended disposition |
|---:|---|---|---|---|
| P0 | Staging source-of-truth conflict: live Render uses `staging`, while the staging runbook specifies `develop` and `.github/workflows/deploy-staging.yml`.[3] [4] [6] | Live Render API, branch-lock report, staging runbook, local workflow list. | Staging cannot be treated as a reliable pre-production gate if branch and workflow authority conflict. | PO should approve the canonical branch strategy. Recommendation: keep `staging` because live provider state already uses it, then update runbooks/workflows. |
| P0 | Vercel deployment automation is not proven for web/admin projects.[10] [11] | Deploy workflow and Vercel dashboard note. | Frontend releases may not be reproducible from Git, and the production workflow only verifies Vercel HTTP status after deploying Render. | Verify all Vercel projects live; connect Git or document manual deployment; add deployment evidence capture. |
| P0 | Checked-in `render.yaml` branch settings drift from live provider settings.[4] [6] | Render live API, branch-lock report, local blueprint. | A future blueprint-driven rebuild could redeploy from obsolete branches. | Patch blueprint after PO approval or mark it explicitly non-authoritative. |
| P1 | Cloudflare Worker edge services expected by R21 are not visible as VIYO-specific resources.[1] [2] | R21 expects Cloudflare Workers; Cloudflare REST shows only `sg_worker`. | R28 timer/image edge architecture may be unbuilt, deferred, or undocumented. | Confirm scope. If deferred, update R21. If required, create a separate implementation plan. |
| P1 | Storage authority conflict: R21 says Supabase Storage, while runtime/provider evidence uses Cloudflare R2.[1] [2] [12] | R21, Cloudflare R2 evidence, Render env audit. | Ambiguous blob storage contracts affect privacy, lifecycle, public URLs, backups, and app code. | Declare one source of truth. Recommendation: update R21 to Cloudflare R2 if current implementation is accepted. |
| P1 | R2 is verified at bucket/env level but not at policy/runtime level.[1] [5] [12] | R2 bucket evidence and Render env evidence. | A bucket can exist while writes, reads, CORS, lifecycle, or tenant isolation still fail. | Add staging-first R2 write/read smoke test and bucket policy/CORS/lifecycle audit. |
| P1 | Redis production/staging runtime mapping is not proven.[8] | Upstash shows two databases, but endpoint mapping must be compared against runtime envs. | Environment contamination could route staging traffic to production Redis or vice versa. | Verify Render environment endpoint metadata without printing secrets, then run non-destructive route health checks. |
| P2 | Cloudflare `shopsimplio` KV and `sg_worker` Worker are visible but not clearly VIYO-owned.[1] | Cloudflare REST inventory. | Unknown account assets can pollute architecture diagrams and increase accidental-change risk. | Mark as unknown/non-VIYO until owner confirms. Do not mutate or include as VIYO dependency. |
| P2 | Inngest API check did not prove registered function inventory.[7] | Inngest API returned environments but not function list through tested path. | Release checks may miss unsynced functions if the wrong endpoint is used. | Verify through correct Inngest dashboard/API route and store expected function list by environment. |
| P2 | `deck.viyo.new` exists in DNS and points to Manus, but its product role is unclear.[1] | Cloudflare DNS summary. | Public DNS surfaces should be intentionally owned and monitored. | Classify as production collateral, temporary deck, or decommission candidate. |

## Architecture Assessment

The current architecture is consistent with a modern distributed SaaS pattern: frontend surfaces on Vercel, worker/API services on Render, database/auth on Supabase, event orchestration on Inngest, Redis on Upstash, storage/DNS on Cloudflare, and monitoring through Sentry. The implementation has already crossed the threshold from “planned only” to “provisioned,” which is encouraging.[1] [6] [7] [8] [9]

The architecture is not yet ready to be automated broadly because multiple authority layers disagree. R21 describes Cloudflare Workers and Supabase Storage as intended architecture, but live evidence does not show VIYO-specific Cloudflare Workers and does show Cloudflare R2 buckets. The staging runbook describes `develop` and a staging deploy workflow, but live Render and branch-lock evidence show `staging`, and no local `deploy-staging.yml` was found. The deploy workflow claims deployment coordination, but it deploys only Render and verifies Vercel by HTTP status.[2] [3] [4] [10]

This means the next architectural task is not to add more infrastructure. The next task is to create a reliable **control plane**: one branch strategy, one deployment authority, one storage contract, one environment-isolation matrix, and one evidence capture process. Only then should migration automation or provider mutation be trusted.

## Migration Automation Proposal

The term “migration automation” should be interpreted as **safe reconciliation and release automation**, not provider migration. VIYO should keep the current provider stack unless a separate business decision requires moving platforms. The proposed plan is staged so that read-only evidence and source-of-truth repair occur before any live provider changes.

| Stage | Objective | Workstream | Acceptance evidence | Change risk |
|---:|---|---|---|---|
| 0 | Preserve current state | Export sanitized inventories for Cloudflare, Render, Vercel, Supabase, Upstash, Inngest, Sentry, and GitHub. | Redacted evidence bundle, provider object map, and current gap register. | Read-only. |
| 1 | Resolve authority conflicts | Decide canonical staging branch, canonical storage backend, canonical repository identity, Cloudflare Worker scope, and production deploy trigger posture. | PO-approved decision record. | Documentation-only. |
| 2 | Repair source of truth | Patch R21, staging runbook, Vercel/Render runbooks, and inventory report to match approved reality. | Pull request with CI pass and no secret exposure. | Low. |
| 3 | Reconcile checked-in infra config | Patch or de-authorize stale `render.yaml` branch settings and align workflow comments/triggers with approved policy. | Diff reviewed by PO/architect and Render read-only confirmation. | Low to medium. |
| 4 | Verify provider wiring | Confirm Vercel Git connections/domains/env scopes, Render branch settings, Cloudflare DNS/R2 policies, Upstash endpoint mapping, Inngest function sync, and Sentry environment names. | Per-provider evidence matrix with secret values redacted. | Read-only unless separately approved. |
| 5 | Implement staging deployment automation | Add or repair staging workflow after branch decision; use staging deploy hook only; validate staging web/admin/API domains. | Successful staging-only workflow run with no production deploy. | Medium, staging-only. |
| 6 | Harden production promotion | Make production deploy either manual-only or explicitly auto-deploy, require staging evidence before production promotion, and document rollback. | Production workflow policy matches PO decision and branch protection. | Medium, production-gated. |
| 7 | Add runtime smoke tests | Add non-destructive checks for R2, Redis, Supabase migration status, Inngest sync, Sentry environment routing, and domain health. | Smoke-test report with pass/fail evidence and rollback guidance. | Medium, staging first. |

## Required PO Decisions

These decisions must be captured before any builder is asked to modify infrastructure or deployment automation. Without these decisions, the builder would be forced to guess which document or provider state is authoritative.

| Decision | Options | Recommended decision |
|---|---|---|
| Canonical staging branch | Keep live `staging`, or switch to runbook `develop`. | Keep `staging` because live Render and branch-lock evidence already use it; update runbooks and workflows accordingly.[3] [4] [6] |
| Production deploy trigger | Keep auto-deploy from `main`, or revert to manual-only until Alpha. | Decide explicitly. If controlled Alpha is the priority, revert to manual-only at Alpha entry and document the current pre-alpha exception.[10] |
| Storage authority | Cloudflare R2, Supabase Storage, or dual storage by feature. | Declare Cloudflare R2 as current asset storage if existing runtime evidence is accepted, then update R21 to remove ambiguity.[1] [2] [12] |
| Cloudflare Worker scope | Build now, defer, or remove from source of truth. | Do not imply the Worker exists. Either defer R28 explicitly or create a separate Cloudflare Worker implementation plan.[1] [2] |
| Vercel deployment model | Git-connected Vercel projects, manual deployments, or GitHub-triggered deploy hooks. | Prefer Git-connected deployments with evidence capture, because it preserves reproducible release history.[10] [11] |
| Redis isolation proof | Dashboard/API metadata only, or runtime smoke test. | Require staging-first runtime smoke test plus Render env endpoint audit.[8] |

## Provider-Specific Work Packages

The following work packages are implementation-ready after PO decisions are made. They are intentionally separated so that each provider can be approved and rolled back independently.

| Work package | Description | Deliverable | Approval required before mutation |
|---|---|---|---|
| WP1 — Evidence Bundle | Consolidate redacted provider inventories and the cross-reference matrix into the canonical handoff folder. | This report plus supporting redacted evidence files. | None; read-only deliverable. |
| WP2 — Source-of-Truth Repair | Update R21/runbooks/inventory to reflect Cloudflare R2, live `staging` branch, API domains, `VIYO-NEW/VIYO`, and current workflow posture. | Documentation pull request. | PO approval of canonical decisions. |
| WP3 — Render Blueprint Reconciliation | Patch `render.yaml` branches to match approved live provider state, or clearly mark the blueprint non-authoritative. | Config pull request plus Render read-only confirmation. | PO approval of live branch map. |
| WP4 — Vercel Deployment Audit | Verify all Vercel projects, Git connections, branch/domain mappings, environment scopes, and latest deployments. | Redacted Vercel matrix. | Vercel access confirmation if current session lacks live dashboard access. |
| WP5 — Staging Automation Repair | Add or repair staging workflow and staging health summary after branch decision. | Successful staging-only workflow run. | Approval to use staging deploy hook and staging domains. |
| WP6 — Runtime Isolation Smoke Tests | Create staging-first checks for Supabase, R2, Redis, Inngest, Sentry, and domain health. | Smoke-test report and launch-readiness gate. | Approval for non-destructive staging test data and allowed probe operations. |

## Rollback and Safety Model

Rollback must be specified before execution for every future change. Documentation changes roll back through Git revert. Workflow changes roll back through Git revert plus trigger verification. Provider setting changes require a pre-change export of the old object state, a post-change confirmation, and a rollback note showing exactly which setting was restored. Database changes are excluded from this proposal unless a separate migration plan includes backups, staging rehearsal, and PO approval.

| Change type | Pre-change evidence | Execution rule | Rollback action | Production safety condition |
|---|---|---|---|---|
| Repository docs/config | File path, branch, commit, and proposed diff. | Pull request only; no direct protected-branch push. | Revert PR commit. | CI and secret scan pass before merge. |
| GitHub workflow | Current trigger block and required secrets list. | PR plus manual dispatch/dry-run where possible. | Revert workflow commit. | No production deploy unless explicitly approved. |
| Render branch/env setting | Service ID, branch, auto-deploy flag, and env var names only. | Staging first; production requires separate approval. | Restore prior branch/env setting or redeploy previous healthy deploy. | Production service not touched during staging verification. |
| Vercel Git/domain setting | Project, domain, Git connection state, and latest deployment. | One project at a time. | Disconnect/revert Git setting or promote previous deployment. | DNS unchanged unless separately approved. |
| Cloudflare DNS/R2 | Exported DNS record IDs/content summary and R2 bucket settings. | No mutation during audit; future changes one record/bucket at a time. | Restore previous DNS record or bucket setting from export. | MX/TXT values remain redacted; no deletion without backup. |
| Supabase migration | Snapshot/backup identifier and migration hash. | Staging migration first; production separate approval. | Restore backup or apply tested down migration. | No destructive SQL without explicit written approval. |

## Recommended Immediate Next Step

The immediate next step is to accept this report as the **WP1 read-only evidence bundle** and schedule a PO decision review for the six required decisions. After those decisions are captured, the safest first implementation task is a documentation/configuration pull request that updates the source-of-truth documents and reconciles `render.yaml` with the approved branch strategy. Provider mutations should remain blocked until the source-of-truth conflict is resolved.

## References

[1]: file:///tmp/cloudflare_rest_readonly_summary_redacted.md "Cloudflare REST Read-Only Verification Summary, May 8 2026"
[2]: file:///home/ubuntu/VIYO/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md "R21 — Infrastructure & Deployment Topology Enterprise Spec"
[3]: file:///home/ubuntu/VIYO/docs/runbooks/staging-environment.md "VIYO Staging Environment Runbook"
[4]: file:///home/ubuntu/VIYO_branch_lock/branch_lock_report.md "VIYO Render Branch Lock Report"
[5]: file:///tmp/cloudflare_mcp_r2_buckets.json "Cloudflare MCP R2 Bucket Evidence"
[6]: file:///tmp/render_readonly_summary.md "Render Read-Only Evidence Summary"
[7]: file:///tmp/inngest_readonly_summary.md "Inngest Read-Only Evidence Summary"
[8]: file:///tmp/upstash_readonly_summary.md "Upstash Read-Only Evidence Summary"
[9]: file:///home/ubuntu/VIYO_Infrastructure_Inventory_Report.md "VIYO Infrastructure Inventory Report"
[10]: file:///home/ubuntu/VIYO/.github/workflows/deploy.yml "VIYO Deploy Pipeline Workflow"
[11]: file:///home/ubuntu/VIYO/.local-sec/progress/vercel_web_verification.md "viyo-web Vercel Verification Note"
[12]: file:///home/ubuntu/VIYO_branch_lock/render_r2_verification_notes_2026-05-02.md "Render R2 Verification Notes"
