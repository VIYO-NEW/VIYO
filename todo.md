# VIYO Build Todo

## Phase 0 Tasks

- [x] T1 — Initialize Turborepo Monorepo Scaffold (P0-01) — DONE 2026-04-24
- [x] T2 — Database Schema + Migrations (P0-04) — DONE 2026-04-24
- [x] T3 — Supabase Auth + Workspace-Scoped RLS (P0-05) — DONE 2026-04-24
- [x] T4 — API Layer Foundation (P0-06) — DONE 2026-04-24
- [x] T5 — Inngest Event System + OpenTelemetry (P0-02/P0-03) — DONE 2026-04-24
- [x] T6 — CI/CD Deployment Pipeline (P0-11) — DONE 2026-04-24
- [x] T8 — Credential Vault Service (EF-87) — DONE 2026-04-24
- [x] T10 — Internal Records (7 mandatory files) — DONE 2026-04-25
- [x] T12 — Sentry Error Monitoring — DONE 2026-04-25
- [x] T7 — Admin Portal Skeleton — DONE 2026-04-25
  - [x] 12 lazy-loaded pages (Dashboard, Brands, Users, LearningEngine, CouncilOfBrains, SystemHealth, Security, CostReconciliation, ContentOps, Performance, BrandIntelligence, Login)
  - [x] AdminLayout with sidebar + topbar + AuthGuard at layout level
  - [x] Bundle optimized: 543KB→253KB initial (53% reduction)
  - [x] darkMode: 'class' in shared Tailwind preset
  - [x] CI pipeline fixed: deploy conditional, test step removed (honest)
  - [x] Taskmaster updated → done
  - [x] Airtable synced → Done
- [x] T9 — Stripe Billing Foundation (P5-01) — DONE 2026-04-27
  - [x] Token Engine: dual-write pattern (R23 usage_ledger → T9 token_ledger)
  - [x] atomic_token_deduction RPC with FOR UPDATE row locking
  - [x] 7 Stripe webhook handlers with idempotency (stripe_webhook_events table)
  - [x] 19 billing API endpoints + 6 admin economics endpoints
  - [x] 4 Inngest functions (auto-top-up, free renewal, workspace hard delete, dunning)
  - [x] Frontend: PricingPage, BillingSettings, TokenBalanceHeader, QuickTopUpModal, InsufficientTokensModal
  - [x] Admin: Billing Economics Control Panel (margin health, provider registry, multiplier, promos)
  - [x] Workspace deletion flow (§17): Stripe cancel, 30-day soft delete, GDPR purge
  - [x] Annual/Monthly switch (§18): Subscription Schedules for deferred changes
  - [x] Dunning freeze: separate checkBillingStatus() pre-check → 402 BILLING_FROZEN

- [x] T15 — Install TanStack Router in Web App (T15-ROUTER) — DONE 2026-04-27
  - [x] Added TanStack Router provider wiring in `apps/web/src/App.tsx`
  - [x] Added typed route tree in `apps/web/src/router.tsx`
  - [x] Implemented `/`, `/brand/$brandId/studio`, and not-found route contracts
  - [x] Preserved Studio route as an integration boundary with no Studio module imports
  - [x] Verified type-check, lint, tests, production build, bundle budget, and headless browser routes
  - [x] Taskmaster updated → done
  - [x] Airtable synced → Done

## Completed Non-Task Work

- [x] Security: Patched 5 Dependabot vulnerabilities (drizzle-orm, vite, esbuild) — 2026-04-25
- [x] Infra: Enabled SSH deploy keys at VIYO-NEW org level — 2026-04-25
- [x] Infra: Enabled org-level Dependabot, secret scanning, push protection — 2026-04-25

- [x] T45 — Composite Database Foundation for T16–T20 — DONE 2026-04-28
  - [x] T16 comments database foundation completed via T45
  - [x] T17 webhook endpoints and delivery logs database foundation completed via T45
  - [x] T18 notification preferences database foundation completed via T45
  - [x] T19 integration connections database foundation completed via T45
  - [x] T20 image prompt pattern router-support columns and deterministic backfill completed via T45
  - [x] Product Owner approved Phase 2 architecture plan, Option A `brands` foundation, Phase 3 wiring correction, and Phase 8 deploy gate
  - [x] Verified static contract checks, SQL parser validation, package/workspace lint, type-check, tests, build, quality gate, and bundle-budget evidence
  - [x] Taskmaster updated → T16, T17, T18, T19, T20, and T45 done
  - [x] Airtable synced → Done

## In Review

## Main Coming Soon Site — 2026-05-02

- [x] Build `apps/main` as a minimal static Vite React app on the `staging` branch only.
- [x] Keep the page self-contained with no backend calls, no external fonts, and no CDN dependencies.
- [x] Validate local type-check/build for `@viyo/main` without redeploying or editing `apps/web` or `apps/admin`.
- [x] Commit and push staging-only changes for PO review.
- [x] Stop before production domain changes until explicit PO approval.

## Completed

- [x] T46 — Composite Art Director Routing Suite (T21, T22, T23) — DONE 2026-04-29
  - [x] Phase 5 source review completed against Phase 2 architecture plan and Phase 3 wiring blueprint
  - [x] Shared/worker build, lint, type-check, focused tests, monorepo lint/type-check/test/build passed
  - [x] Live local worker probe confirmed `/health` responds and unauthenticated `artDirector.routeGeneration` fails closed with HTTP 401
  - [x] Static source-invariant verifier passed final 13-layer wiring assertions
  - [x] Taskmaster T46 moved from `blocked` to `done` on 2026-04-29 after retroactive PO approval.
  - [x] Approval evidence recorded: "Retroactive PO approval granted 2026-04-29. Basis: T70 (PR #3) and T71 (PR #4) validated T46 foundation through architecture review, code review, and merged production code."

## Phase 6.2 Art Director Execution

- [x] Task #70: Cache-first Pattern DB route metadata transparency — DONE 2026-04-29
  - [x] Shared Art Director response contract exposes cache-first route source, Pattern DB cache status, score, threshold, candidate, and provenance metadata.
  - [x] Worker image router populates routing metadata from actual Pattern DB lookup, scoring, threshold, and rollback decisions.
  - [x] Image Studio displays cache-route and Pattern DB scoring transparency in canvas and latest-response panels.
  - [x] Focused worker route-generation and Image Studio tests passed; shared, worker, and web type-check/lint validation passed.
  - [x] Taskmaster Task 70 marked done; generative evidence-update command failed twice with provider schema mismatch, so status was completed via non-generative status command.
  - [x] Airtable sync repaired 2026-04-29: Build Tracker record `T70-CACHE-ROUTE-META` exists, is marked Done, and has `Taskmaster Task ID = T70`.
- [x] Task #71: Billing and token economics foundation — DONE 2026-04-29, PR #4 open
  - [x] Verified PO Condition 1: Visual Engine editing operations use editing-router contracts and flow through `artDirector.routeGeneration`; no separate editing execution endpoint was found.
  - [x] Verified PO Condition 2: insufficient-token metadata is propagated through tRPC formatted `data.apiError.details` and parsed by Studio frontend code.
  - [x] Backend Art Director routing now exposes billing reconciliation metadata, performs UX balance preflight metadata, and enforces atomic post-success token deduction.
  - [x] Image Studio now displays token estimate/current balance, opens canonical top-up recovery for insufficient balance, and renders final billing status/deducted token metadata.
  - [x] Validation gates passed: shared build, worker/web focused tests, worker/web lint, workspace type-check/test/lint/build, and `git diff --check`.
  - [x] Taskmaster Task 71 and all six subtasks marked done; Airtable Build Tracker T25/T26 notes synced conservatively without marking broader Studio flows done.
  - [x] Airtable sync repaired 2026-04-29: `T25-STUDIO-BACKEND` has `Taskmaster Task ID = T25, T46, T71`; `T26-STUDIO-FRONTEND` has `Taskmaster Task ID = T26, T71`; `P5-05` has `Taskmaster Task ID = T71`, status `In Progress`, and Task 71 / PR #4 advancement notes.

## Build Tracker Cross-Reference Repair

- [x] 2026-04-29 — Backfilled new Airtable `Taskmaster Task ID` field for verified completed/in-progress VIYO Build Tracker records touched by this build stream, including Phase 0 records, T7, EF-87, T10, T12, P5-01, T15, T24, T25, T26, T32, T46, P5-05, and T70.
- [x] 2026-04-29 — Created durable verification report at `docs/internal/build-tracker-cross-reference-repair-2026-04-29.md` and verified Airtable with a fresh post-update Build Tracker export.
- [ ] Future architecture plans must include a `Build Tracker Feature IDs` section listing the exact Airtable Feature IDs that the task will update before plan approval.

- [x] Task #72: T55 R2 Auto-Save and Brand Vault Asset Contract — DONE 2026-04-29
  - [x] Added `assets.brand_id` schema and migration support for Brand Vault asset ownership.
  - [x] Extracted and wired Studio generated-asset persistence through R2 and the assets table without changing Art Director routing decisions.
  - [x] Shared Art Director response contract now exposes `assetId`, `assetUrl`, `r2ObjectKey`, `savedToBrandVault`, and `persistenceStatus`.
  - [x] Image Studio surfaces honest persistence state and Brand Vault availability metadata.
  - [x] Validation passed: targeted Prettier, `pnpm type-check`, `pnpm lint`, `pnpm test`, and `pnpm build`.
  - [x] Taskmaster Task 72 and subtasks marked done; Airtable Build Tracker record `T32-AUTO-SAVE-VAULT` verified Done.

## Marketing App Rename — 2026-05-02

- [x] Confirm the renamed placeholder app exists at `apps/main` on the `staging` branch.
- [x] Update package and deployment references from marketing path/name to main path/name.
- [x] Validate the renamed `@viyo/main` app without touching existing apps.
- [x] Commit and push the rename to `origin/staging`.
- [x] Report the staging commit hash.

## MAX viyo-main Deployment Instructions Intake — 2026-05-02

- [ ] Review `/home/ubuntu/upload/MAX_viyo-main_Deployment_Instructions.pdf` before any further push.
- [ ] Extract actionable repository changes that apply to `apps/main`.
- [ ] Implement only the required `apps/main` and deployment-reference updates.
- [ ] Validate `@viyo/main` after applying the PDF instructions.
- [ ] Commit and push only after validation, if code/config changes are required.
- [ ] Report the resulting commit status and hash.

## Vercel Staging Deployment Execution — 2026-05-02

- [x] Re-read `MAX_viyo-main_Deployment_Instructions.pdf` and follow Steps 1 through 7 only.
- [x] Complete Vercel login or obtain authenticated CLI access for the correct VIYO team.
- [x] Create or configure the Vercel project for `apps/main` before any further code changes.
- [x] Wire only `staging.viyo.new` to the new Vercel project and do not touch `viyo.new` or `www.viyo.new` before PO approval.
- [x] Configure the Vercel project to deploy from the `staging` branch using the current staged code.
- [x] Confirm `staging.viyo.new` returns HTTP 200 with the placeholder page.
- [x] Capture and provide a screenshot of the live staging placeholder.
- [x] Disable Vercel Authentication for the `viyo-main` project only after PO-confirmed approval.
- [x] Verify `https://staging.viyo.new/` returns unauthenticated `HTTP 200` without Vercel Authentication.
- [x] Capture a fresh screenshot of the live `staging.viyo.new` page.
- [x] Report Step 7 evidence back for PO approval and confirm production domains were not modified.

## Vercel Step 8 production cutover — 2026-05-02

- [x] Confirm the approved staging Coming Soon state is ready to deploy to `main`.
- [x] Deploy the approved Coming Soon state to the production/main target for `viyo-main`.
- [x] Switch `viyo.new` to the `viyo-main` Vercel project after PO approval.
- [x] Switch `www.viyo.new` to the `viyo-main` Vercel project after PO approval.
- [x] Verify `https://viyo.new/` returns unauthenticated `HTTP 200` with the Coming Soon page.
- [x] Verify `https://www.viyo.new/` returns unauthenticated `HTTP 200` with the Coming Soon page.
- [x] Capture production evidence and report final Step 8 status.

## Proprietary Intelligence Architecture Implementation Intake — 2026-05-02

- [ ] Treat the attached Proprietary Intelligence Architecture handoff as PO-approved and locked; do not write or reopen a Phase 2 architecture plan.
- [ ] Read the full `Execution_Brief_Proprietary_Intelligence_Architecture_Handoff.docx` before creating or modifying Taskmaster tasks.
- [ ] Extract and read every linked Google Drive source document marked New or Changed in full, with no partial intake or shortcut summarization.
- [ ] Record a complete source-ingestion ledger covering the handoff and every linked New or Changed document.
- [ ] Extract complete implementation requirements, acceptance criteria, dependencies, and open questions from the full source set.
- [ ] Ask the PM for clarification before proceeding on any ambiguous or conflicting requirement.
- [ ] Create or update Taskmaster tasks only after full source ingestion, with full requirement detail and the most appropriate step-in-time dependency order.
- [ ] Create matching Airtable Build Tracker tasks and cross-reference them with the corresponding Taskmaster task IDs.
- [ ] Begin implementation at Phase 3 only after Taskmaster and Airtable intake are complete and dependency order is verified.

### PM Safeguard Update — Existing Task Wiring, QA, and Final Vision Fit — 2026-05-02

- [ ] Before creating any new feature task, search existing Taskmaster and Airtable Build Tracker records and wire the feature to the existing task where a valid task home exists.
- [ ] Do not create duplicate Taskmaster or Airtable tasks for work already covered by an existing approved task; update the existing task with full requirements instead.
- [ ] Add explicit QA coverage and acceptance evidence requirements to every implementation task before development starts.
- [ ] Confirm each implementation item fits the approved final VIYO vision from the locked architecture and linked source documents before coding.
- [ ] Report back to the PM before implementation if any requirement lacks a clear task home, dependency order, QA path, or final-vision fit.

### PM Clarification — Code and Feature Wiring Safeguard — 2026-05-02

- [ ] When writing code or feature wiring, connect each change to the correct existing task, architectural layer, dependency path, and downstream integration instead of creating isolated or non-functional implementation fragments.
- [ ] Before coding, define QA evidence that proves the wired feature path works as part of the final VIYO vision, not merely as a local file-level change.
- [ ] Stop and report back before implementation if a code path, feature owner, dependency, or QA proof cannot be mapped cleanly to the approved architecture.

## Architecture Broadcast v7.1 Verification Pause — 2026-05-02

- [ ] Pause Proprietary Intelligence Architecture implementation until v7.1 Architecture Broadcast ingestion is confirmed.
- [ ] Verify whether `FOUNDATIONAL UPDATE: PRD V6 Addendum + Architecture Lock V7 + R32-R37` was fully ingested.
- [ ] Verify whether the v7.1 Architecture Broadcast was applied to the Taskmaster task graph, not merely proposed as a diff.
- [ ] Inspect Airtable record `rec82zbIbRr7WQP9c` and update its status from `Diff Proposed` to `Executed` only if ingestion and task-graph application are verified.
- [ ] Verify whether the Branch Protection Gate CI workflow associated with Airtable record `recMKhZ5zphjd3wGQ` is already committed.
- [ ] Inspect Airtable record `recMKhZ5zphjd3wGQ` and update its status to `Executed` only if the CI workflow is committed and verified.
- [ ] Report confirmation status to the PM before resuming Proprietary Intelligence Architecture implementation.

### Architecture Broadcast Status Convention Confirmation — 2026-05-02

- [ ] Treat `Executed` in the Architecture Broadcasts table as meaning the broadcast was received, source documents were read, the diff was applied to the task graph or active source-of-truth gate, and the broadcast is closed.
- [ ] Do not interpret Architecture Broadcast `Executed` as downstream feature implementation completion; downstream work remains tracked separately in Taskmaster and the Build Tracker.
- [ ] Update Architecture Broadcast record `rec82zbIbRr7WQP9c` to `Executed` based on PM-confirmed status semantics and verified v7.1 ingestion/source-of-truth evidence.
- [ ] Update Branch Protection Gate record `recMKhZ5zphjd3wGQ` to `Executed` only because CI workflow commit evidence has already been verified.
- [ ] Capture after-update Airtable evidence for both records and report tracker-update status before resuming Proprietary Intelligence Architecture implementation.

### Duplicate-Prevention Gate Before Resuming Proprietary Intelligence Architecture — 2026-05-02

- [ ] Before creating any Taskmaster task for the Proprietary Intelligence Architecture handoff, confirm whether the requirement is already represented in the active Taskmaster graph.
- [ ] Before creating any Airtable Build Tracker record, confirm whether a matching Build Tracker feature record already exists or can be cross-referenced from an existing record.
- [ ] If Taskmaster already ingested the requirement, do not create a duplicate Taskmaster or Airtable record; update the existing task details, acceptance criteria, QA evidence, or cross-reference fields instead.
- [ ] Preserve the distinction between Architecture Broadcast `Executed` status and downstream implementation completion; use Build Tracker and Taskmaster for downstream execution state.
- [ ] After Architecture Broadcast status cleanup is complete, resume the Proprietary Intelligence Architecture Handoff from the paused source-ingestion and requirement-mapping point.

### PIA Handoff Resume — 2026-05-02

- [x] Re-read VIYO protocol, Taskmaster, PRD/product-architecture, Google Workspace, and resilience skills before continuing PIA handoff work.
- [x] Re-ingest the approved R36 HYVE, R37 MAAX, R38 SYPHON, Architecture Lock V8, Naming Registry, PIA Strategy, and Execution Brief source files from `/home/ubuntu/VIYO_branch_lock/pia_source_docs_2026-05-02/`.
- [x] Extract R36/R37/R38 requirements into a source-cited requirement register.
- [x] Map each requirement to an existing Taskmaster task where a valid home exists and mark true gaps only after checking all active tasks.
- [x] Prepare duplicate-safe Taskmaster mutation plan without applying unapproved task graph changes.
- [x] Prepare Airtable Build Tracker sync plan without creating or updating R36/R37/R38 records until approval boundary is satisfied.
- [x] Stop for PM/Architect approval or clarification before Phase 3 implementation mutations.


### Approved PIA Foundational Mutation and PIA-1 Implementation — 2026-05-02

- [x] Correct PIA planning artifacts so PIA-1 through PIA-6 are classified as Foundation / Phase 0 and PIA-7 is classified as Future/Deferred.
- [x] Confirm the six Google Drive source documents from the execution brief by exact name and record that each was read in full.
- [x] Run a final live duplicate check in Taskmaster and Airtable before creating PIA tasks or Build Tracker records.
- [x] Create approved PIA-1 through PIA-7 Taskmaster chain with dependency order preserved and no duplicate R32/Studio foundation work.
- [x] Create matching Airtable Build Tracker records with Phase = `Phase 0` for PIA-1 through PIA-6 and Phase = `Future` for PIA-7.
- [x] Begin Phase 3 implementation with PIA-1 database migration only after Taskmaster and Airtable intake are synced.
- [x] Validate PIA-1 migration and Drizzle schema changes with database package type-check evidence.
- [x] Report assigned Taskmaster IDs, Airtable record IDs with correct phase classification, and the first migration file path.

## PIA-1 Staging Migration Execution — 2026-05-02

- [x] Re-read VIYO protocol and required database/migration guidance before touching the staging database.
- [x] Confirm the configured project database connection resolves to staging and not production before running any migration command.
- [x] Apply the PIA-1 migration only against the staging database using the configured repo/environment connection.
- [x] Verify staging runtime tables, columns, indexes, constraints, RLS policies, and default-off HYVE consent behavior after migration.
- [x] Record staging verification evidence in `VIYO_branch_lock` and keep production untouched until explicit approval.
- [x] Report staging migration results, blockers if any, and whether PIA-1 can move beyond In Progress.

## PIA-1 Supabase MCP Staging Migration Execution — 2026-05-02

- [x] Reconfirm VIYO protocol and staging-only database safety requirements before using Supabase MCP mutation tools.
- [ ] Run `manus-mcp-cli tool list --server supabase` and record available Supabase MCP tools.
- [ ] Use Supabase MCP to list projects and identify the unambiguous VIYO staging Supabase project while excluding production.
- [ ] Apply `packages/db/drizzle/0009_pia1_proprietary_intelligence_foundation.sql` directly to the staging Supabase project only.
- [ ] Verify staging tables, columns, constraints, indexes, RLS policies, and default-off HYVE consent behavior through post-migration SQL checks.
- [ ] Record staging migration and verification evidence under `VIYO_branch_lock`.
- [ ] Report staging results and keep production untouched pending explicit approval.

## PIA-1 Supabase MCP Retry — 2026-05-02

- [ ] Retry `manus-mcp-cli tool list --server supabase` and preserve output evidence.
- [ ] Retry read-only Supabase MCP project and organization discovery.
- [ ] Identify the VIYO staging project unambiguously before any mutation; stop if authorization or project identity remains unclear.
- [ ] Apply the PIA-1 migration SQL only to the VIYO staging Supabase project if staging is unambiguous.
- [ ] Verify staging tables, columns, constraints, indexes, RLS policies, and default-off HYVE consent behavior.
- [ ] Record retry outcome and report whether production remained untouched.

## PIA-1 Connection-First Supabase MCP Retry — 2026-05-02

- [x] Try Supabase MCP connection and read-only discovery before any migration, verification, tracker update, or mutation.
- [x] Stop before mutation unless VIYO staging is identified unambiguously and production is excluded.
- [x] Preserve the connection attempt output under `VIYO_branch_lock` and report whether Supabase MCP is authorized.

## PIA-1 Token-Enabled Supabase Staging Migration — 2026-05-02

- [x] Use the provided Supabase access token only for this staging migration session and do not persist it in evidence artifacts.
- [x] Confirm `list_projects` succeeds and identify the VIYO staging project unambiguously while excluding production.
- [x] Apply `packages/db/drizzle/0009_pia1_proprietary_intelligence_foundation.sql` only to the VIYO staging Supabase project.
- [x] Verify staging tables, columns, constraints, indexes, RLS policies, and default-off HYVE consent behavior after migration.
- [x] Record redacted staging verification evidence and report whether production remained untouched.

## PIA-2 / T93 Shared Contracts and Privacy Gates — 2026-05-02

- [x] Re-read VIYO development protocol, quality gate guidance, and R36/R37/R38 source requirements before writing code.
- [x] Inspect the PIA-1 database migration constraints and existing shared schema conventions before creating `packages/shared/src/schemas/pia.ts`.
- [x] Implement Brand Preferences Zod schemas and inferred TypeScript types matching the DB action_type and studio_type constraints.
- [x] Implement Campaign Performance schemas enforcing nonnegative metric and revenue values plus explicit metadata key prohibitions.
- [x] Implement HYVE Pattern Performance schemas enforcing explicit metadata key prohibitions for brand, workspace, customer, prompt, creative, and raw image identifiers.
- [x] Implement `packages/worker/src/middleware/hyve.ts` as Hono middleware that rejects non-opted-in brands with `HYVE_OPT_IN_REQUIRED` and HTTP 403.
- [x] Add a service-role guard for writes to `hyve_pattern_performance` so runtime behavior matches the service-role-only RLS policy.
- [x] Wire middleware to the relevant HYVE / Intelligence Network endpoints without altering production data or production deployment settings.
- [x] Run type-checks, focused contract validation, and runtime-style privacy gate validation showing a non-opted-in brand is blocked.
- [x] Update Taskmaster T93, Airtable Build Tracker, and this checklist with evidence.
- [x] Commit and push only validated T93 implementation/tracker changes, with secret scan evidence and no production migration. Commit `e449c7e` pushed to `staging` on 2026-05-02; pre-commit TruffleHog reported 0 verified and 0 unverified secrets.

## Post-T93 Build Tracker Composite Task-ID Backfill — 2026-05-02

- [x] Start only after T93 shared contracts and privacy gates are completed, validated, committed, pushed, and reported. T93 commit `e449c7e` is pushed to `staging`; final user report pending.
- [ ] Query Airtable Build Tracker base `appo5mNncCCzKcIRk`, table `tblIJUzJoCCjWXaMQ`, and pull all records missing `Taskmaster Task ID` where status is not `Done`.
- [ ] Confirm the total record universe and missing-ID subset against the PO-stated 558-feature baseline before making mutations.
- [ ] Group eligible records into logical composite Taskmaster tasks following established patterns such as T45 grouping T16–T20 and T46 grouping T21–T23.
- [ ] Add new Taskmaster tasks with correct dependencies, priorities, and initial statuses, without marking any new task `in-progress` before PO approval.
- [ ] Write each newly created Taskmaster Task ID back to every Airtable Build Tracker record included in its group.
- [ ] Produce and report the full diff of new tasks, grouped Airtable records, dependencies, priorities, statuses, and record-to-task mappings for PO approval.

## Hard Constraint — Architecture Broadcast Pre-Flight for MAX — 2026-05-02

- [ ] Before any further T93 implementation work, query Airtable base `appo5mNncCCzKcIRk`, table `tblyZdtFjTYIwSzBT`, for records with status `Pending Builder Ingestion`.
- [ ] For each pending broadcast, inspect `Builder Diff Output`; if populated, treat the broadcast as already ingested and update its status to `Executed` without re-processing.
- [ ] For each pending broadcast with empty `Builder Diff Output`, inspect the Taskmaster graph for tasks described by `Affected Tasks`; if they already exist, update the broadcast status to `Executed` without re-processing.
- [ ] For each pending broadcast not confirmed as previously ingested/actioned, process it fully, populate `Builder Diff Output`, and update status to `Diff Proposed` before returning to active T93 work.
- [ ] Save Airtable and Taskmaster evidence showing the broadcast inbox is clear or already processed before resuming T93 source edits.

## VIYO Development Protocol Staging Environment Assessment — 2026-05-02

- [x] Assess whether /viyo-development-protocol-v2 needs a staging-environment update after the new staging setup.
- [x] If a protocol update is needed, follow the skill update workflow and prepare the proposed change for PO review before editing the skill.

## VIYO Development Protocol Update Inspection — 2026-05-02

- [x] Inspect updated `/viyo-development-protocol-v2` for staging branch/domain isolation, branch-aware push, pipeline polling, and Airtable fallback completeness. Findings saved to `/home/ubuntu/VIYO_branch_lock/viyo_protocol_updated_inspection_2026-05-02.md`.
- [x] Adopt the updated `/viyo-development-protocol-v2` going forward and assess whether its staging safeguards create any avoidable development-speed concerns. Use going forward with speed override for Direct Answer/Q&A and Ops/Browser tasks; Code Build tasks retain full staging isolation and pre-flight gates.

## VIYO Development Protocol v2.9.11 Review — 2026-05-02

- [x] Review and ingest updated `/viyo-development-protocol-v2` v2.9.11, confirming Architecture Broadcast idempotency, KB-ingestion branch exemption, exact-SHA pipeline polling, and Airtable 404 fallback. Ingestion report saved to `/home/ubuntu/VIYO_branch_lock/viyo_protocol_v2_9_11_ingestion_review_2026-05-02.md`.

## Post-T93 Repair and Build Tracker Backfill — 2026-05-02

- [x] Re-ingest `/viyo-development-protocol-v2` v2.9.11 before acting on the approved post-T93 instructions.
- [x] Run Architecture Broadcast pre-flight for pending builder ingestion before reading Taskmaster or executing implementation/backfill work. Query returned zero `Pending Builder Ingestion` records in `tblyZdtFjTYIwSzBT`.
- [x] Resolve the GitHub Actions HTTP 403 pipeline-observability gap for commit `e449c7e`, or formally log and escalate it as an infrastructure blocker. Formal blocker note saved at `/home/ubuntu/VIYO_branch_lock/t93_github_actions_pipeline_observability_infrastructure_blocker_2026-05-02.md`; both `GH_TOKEN` and the persisted `viyo-ai` CLI token return HTTP 403 for exact-SHA Actions run polling.
- [ ] Re-poll the exact `e449c7e` commit run after PO grants Actions-read/workflow-capable GitHub token access, then append the result to T93 evidence.
- [x] Create Taskmaster composite tasks T99–T114 exactly from the approved Build Tracker backfill proposal. Deterministic creation result saved to `/home/ubuntu/VIYO_branch_lock/taskmaster_t99_t114_creation_result_2026-05-02.json`.
- [x] Verify the T99–T114 dependency graph, including the explicitly required downstream dependency relationships. Verification evidence saved to `/home/ubuntu/VIYO_branch_lock/taskmaster_t99_t114_verification_2026-05-02.txt`; `task-master validate-dependencies` returned no invalid dependencies across 101 tasks and 23 subtasks.
- [x] Batch-update 521 Airtable Build Tracker records in groups of 10 or fewer, changing only the `Taskmaster Task ID` field. Created 60 update batches from `/home/ubuntu/VIYO_branch_lock/airtable_t99_t114_update_manifest_2026-05-02.json`; output validation at `/home/ubuntu/VIYO_branch_lock/airtable_t99_t114_update_output_validation_2026-05-02.json` confirms 60 result files, 521 updated records, and zero malformed update outputs.
- [x] Verify Build Tracker records with non-empty `Taskmaster Task ID` equals 558 after backfill. Airtable post-update query saved at `/home/ubuntu/VIYO_branch_lock/build_tracker_nonempty_taskmaster_ids_post_update_2026-05-02.json`; verification summary saved at `/home/ubuntu/VIYO_branch_lock/build_tracker_taskmaster_coverage_verification_2026-05-02.json` confirms 558 total non-empty Taskmaster IDs, exact T99–T114 counts, and zero non-Done records missing Taskmaster IDs via `/home/ubuntu/VIYO_branch_lock/build_tracker_missing_non_done_taskmaster_ids_post_update_2026-05-02.json`.
- [ ] Deliver the backfill completion report and await PM acknowledgment before starting PIA-3 / T94.
