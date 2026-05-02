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

## PO-Accepted Post-T93 Backfill and Next-Task Intake — 2026-05-02

- [x] Record PO acceptance that T99–T114 backfill is complete, 558 records are verified, and staging commit `f7c6c69` is accepted.
- [x] Record PO decision that GitHub Actions HTTP 403 is a PO credential gate, not a MAX blocker, and does not block PIA-3.
- [ ] Re-run SHA polling for `e449c7e` and `f7c6c69` after PO provisions a classic PAT with `repo` and `workflow` scopes for `VIYO-NEW/VIYO`.
- [x] Inspect Taskmaster for the next task and report the next-task finding without self-starting implementation. `task-master next` selected Task #73 / `T56: Editing Router Coverage for 10 Tools`; full detail saved at `/home/ubuntu/VIYO_branch_lock/taskmaster_show_next_73_after_post_t93_acceptance_2026-05-02.txt`.

## T56 Editing Router Coverage Start — 2026-05-02

- [x] Record PO instruction to proceed with the next Taskmaster-selected task before provisioning PAT access.
- [ ] Complete VIYO protocol preflight for Task #73 / T56 before implementation.
- [ ] Inspect authoritative contracts and affected editing-router files for the ten specified tools.
- [ ] Produce the required architecture/wiring plan and obtain PO approval if the VIYO protocol requires it before code changes.
- [ ] Implement editing-router coverage only for backend-supported capabilities and avoid exposing unwired placeholder buttons.
- [ ] Validate T56 with relevant tests, type checks, lint/build checks, and dependency/wiring verification.
- [ ] Commit and push the completed T56 changes to the approved staging branch.
- [ ] After T56 completion, remind PO to provision a classic GitHub PAT with `repo` and `workflow` scopes so Actions SHA polling for `e449c7e` and `f7c6c69` can be closed.

### T56 Preflight Halt — Cross-Sprint Security Blocker Rule

- [x] Ran T56 Build Tracker security-blocker preflight using cached Airtable IDs; raw query saved at `/home/ubuntu/VIYO_branch_lock/t56_build_tracker_security_query_raw_2026-05-02.json`.
- [x] Parsed T56 security preflight; summary saved at `/home/ubuntu/VIYO_branch_lock/t56_security_blocker_summary_2026-05-02.json` and details saved at `/home/ubuntu/VIYO_branch_lock/t56_security_blocker_details_2026-05-02.json`.
- [ ] T56 implementation is halted pending PO decision because the VIYO Cross-Sprint Security Blocker Rule found 31 Not Started security/auth/MFA records, including Phase 1 and Phase 2 blockers assigned to `T100`/`T103`.

### T56 PO Sequencing Decision — 2026-05-02

- [x] PO accepted the T56 preflight halt and confirmed Task #73 remains blocked.
- [x] PO confirmed no override is issued for the Cross-Sprint Security Blocker Rule.
- [x] PO directed that the security lane must be promoted first because Phase 1/Phase 2 auth/security and MFA blockers mapped to `T100` and `T103` must be resolved before T56 proceeds.
- [x] Inspect Taskmaster for the next eligible task after T56 was blocked by PO sequencing decision. `task-master next` selected Task #74 / `T57: Standalone Studio Route, Navigation, and Brand Scope`; evidence saved at `/home/ubuntu/VIYO_branch_lock/taskmaster_next_after_t56_blocked_2026-05-02.txt` and `/home/ubuntu/VIYO_branch_lock/taskmaster_show_74_after_t56_blocked_2026-05-02.txt`.

### T73 / T56 Source-of-Truth Sync Verification — 2026-05-02

- [x] Confirm directly from `/home/ubuntu/VIYO/.taskmaster/tasks/tasks.json` that Taskmaster Task #73 status is `blocked`. Evidence saved at `/home/ubuntu/VIYO_branch_lock/taskmaster_73_status_verification_2026-05-02.json`; it confirms status `blocked` and the T100/T103 security-blocker rationale is present.
- [x] Confirm the Airtable Build Tracker record for T56 / Task #73 reflects blocked status and the security-blocker rationale. Airtable record `recsFteAfkH2xVO6W` was created as `T56-EDITING-ROUTER-COVERAGE` because the literal Feature ID `T56` already belongs to an unrelated R32 future-backlog record mapped to Taskmaster `T114`; verification evidence saved at `/home/ubuntu/VIYO_branch_lock/t56_airtable_task73_sync_verification_2026-05-02.json`.
- [x] If Taskmaster or Airtable is missing the blocked state or rationale, update the missing source of truth immediately and save evidence. Consolidated verifier saved at `/home/ubuntu/VIYO_branch_lock/t56_taskmaster_airtable_source_sync_verification_2026-05-02.json` confirms Taskmaster status `blocked`, Airtable blocked rationale in Notes, T100/T103 rationale present, PO no-override decision present, and `source_sync_confirmed = true`.
- [x] Report source-of-truth sync confirmation before proceeding to any next task. Delivered in the current PO-facing response with Airtable repair evidence, consolidated verifier path, and skill-builder update request path.

### T73 / T56 Source-of-Truth Sync Skill-Update Contingency — 2026-05-02

- [x] Complete Airtable Build Tracker verification for Task #73 / T56 against source-of-truth status requirements, not only local `todo.md`.
- [x] If Airtable was not already updated to blocked with security-blocker rationale, repair the Airtable record immediately and document the process gap. Gap: the task had been blocked in Taskmaster/local tracking, but no matching Airtable source record existed for Taskmaster `T73`; the literal Airtable `T56` record was unrelated R32/T114 work and was preserved unchanged.
- [x] If a process gap is confirmed, provide a precise VIYO skill-builder change request requiring Taskmaster and Airtable status sync verification before any blocked-task session advances. Draft saved at `/home/ubuntu/VIYO_branch_lock/viyo_skill_builder_change_request_t56_airtable_blocked_sync_2026-05-02.md`.

## Security Lane Promotion Intake — 2026-05-02

- [x] Record PO decision that T73 remains blocked and T100/T103 are now the promoted priority security lane.
- [x] Re-read the updated VIYO development protocol and Taskmaster workflow requirements before inspecting or mutating Taskmaster state.
- [x] Inspect Taskmaster for the next eligible promoted security-lane task involving T100 and/or T103. Taskmaster `next` still returns feature task `T57/#74`, but PO security-lane promotion overrides feature-lane selection; T100 is blocked by pending prerequisite `T99`, and T103 is blocked by pending `T100` and `T101`.
- [x] Save Taskmaster evidence for the selected security-lane task under `VIYO_branch_lock`. Evidence saved at `/home/ubuntu/VIYO_branch_lock/security_lane_taskmaster_evidence_2026-05-02.json`, `/home/ubuntu/VIYO_branch_lock/security_lane_taskmaster_next_t100_t103_2026-05-02.txt`, and `/home/ubuntu/VIYO_branch_lock/security_lane_t99_prerequisite_taskmaster_2026-05-02.txt`.
- [x] Report the next-task finding to the PO before any code implementation or status mutation. Delivery notes: Taskmaster next returned `#74`, but PO security-lane promotion overrides it; T100/T103 cannot be started directly until Taskmaster dependencies are cleared, so the safe next action is T99 unless PO explicitly overrides dependency sequencing.


## T99 Backfill-Only Execution — 2026-05-02

- [x] Record PO decision: follow dependency discipline, start `T99` first, then proceed to `T100`, `T101`, and `T103` in order.
- [x] Enforce T99 guardrail: this is backfill-only; update only Airtable `Taskmaster Task ID` fields for the 20 Phase 0 records.
- [x] Re-read the updated VIYO development protocol and Taskmaster workflow before inspecting or mutating Taskmaster/Airtable state. Updated VIYO protocol, Task Master skill, and VIYO authority-order reference were re-ingested for this T99 backfill-only task.
- [x] Inspect Taskmaster `#99` and save current task evidence under `VIYO_branch_lock`. Taskmaster evidence saved at `/home/ubuntu/VIYO_branch_lock/security_lane_t99_prerequisite_taskmaster_2026-05-02.txt`.
- [x] Identify the exact 20 Phase 0 Airtable Build Tracker records covered by T99 from the approved backfill proposal and/or Airtable evidence. Manifest `/home/ubuntu/VIYO_branch_lock/airtable_t99_t114_update_manifest_2026-05-02.json` enumerates the 20 T99 record IDs across batches 001–002; live Airtable precheck saved at `/home/ubuntu/VIYO_branch_lock/t99_airtable_precheck_live_records_2026-05-02.json`.
- [x] Prepare a collision-safe Airtable update payload that changes only the `Taskmaster Task ID` field to `T99` or `99`, matching the existing field convention. Payloads `/home/ubuntu/VIYO_branch_lock/airtable_t99_t114_update_batches_2026-05-02/batch_001_T99.json` and `batch_002_T99.json` update only `Taskmaster Task ID` to `T99`.
- [x] Apply the Airtable batch-link update without modifying status, phase, feature IDs, dependencies, notes, production data, migrations, or implementation files. Applied two Airtable update batches: `/home/ubuntu/VIYO_branch_lock/t99_airtable_update_batch_001_output_2026-05-02.json` and `/home/ubuntu/VIYO_branch_lock/t99_airtable_update_batch_002_output_2026-05-02.json`; payload scope changed only `Taskmaster Task ID` to `T99`.
- [x] Verify Airtable linkage totals after batch update and save verifier output under `VIYO_branch_lock`. Verifier `/home/ubuntu/VIYO_branch_lock/t99_airtable_backfill_verification_2026-05-02.json` confirms 20 live T99 records, exact manifest ID match, all Phase 0, and no non-Taskmaster-field payload mutations.
- [x] Update Taskmaster/T99 status only if verification satisfies the task’s test strategy and protocol gates. Taskmaster direct status check `/home/ubuntu/VIYO_branch_lock/taskmaster_t99_direct_status_check_2026-05-02.json` confirms `T99` is `done`. Dependency readiness evidence `/home/ubuntu/VIYO_branch_lock/security_lane_dependency_readiness_after_t99_2026-05-02.json` confirms `T100` is now dependency-ready, while `T101` and `T103` remain blocked by pending upstream security-lane tasks.
- [x] Report T99 result and the next dependency-ordered task to the PO. T99 completed as an Airtable-only backfill; Taskmaster `T99` is `done`; live verifier confirms all 20 Phase 0 Build Tracker records are linked to `T99`; dependency evidence confirms `T100` is now the next dependency-ordered security-lane task, despite generic `task-master next` still returning feature-lane `T57/#74`.


## T100 — Composite Phase 1 Core Platform, Permissions, and Security Backfill Reconciliation — DONE 2026-05-02

- [x] Confirmed `/viyo-development-protocol-v2` mode for T100 as a Tracker/Admin backfill task, not a Code Build task, with no source-code, migration, deployment, or production-data changes.
- [x] Verified the authoritative manifest scope for T100: 59 Phase 1 Build Tracker records assigned to `Taskmaster Task ID = T100`.
- [x] Ran a live Airtable query for records currently linked to `T100` before any duplicate write attempt.
- [x] Compared live Airtable `T100` records against the approved manifest for exact record-ID match, expected count, Phase 1 scope, and protected-field preservation.
- [x] Confirmed live verification already contains all 59 T100 links, so no duplicate Airtable write was applied.
- [x] Marked Taskmaster T100 `done` only after verifier output passed the task test strategy and dependency discipline.
- [x] Recorded dependency readiness after T100; T101 is next eligible under the PO-authorized security lane.
- [x] Evidence: `/home/ubuntu/VIYO_branch_lock/t100_airtable_backfill_verification_2026-05-02.json` and `/home/ubuntu/VIYO_branch_lock/taskmaster_T100_status_done_2026-05-02.txt`.

## T101 — Composite Phase 2 Product Workspace and Collaboration Backfill Reconciliation — DONE 2026-05-02

- [x] Confirmed T100 is done before starting T101 under the PO-authorized dependency order.
- [x] Verified the authoritative manifest scope for T101: 65 Build Tracker records assigned to `Taskmaster Task ID = T101`.
- [x] Ran a live Airtable query for records currently linked to `T101` before any duplicate write attempt.
- [x] Compared live Airtable `T101` records against the approved manifest for exact record-ID match, expected count, task ID, phase distribution, and protected-field preservation.
- [x] Confirmed live verification already contains all 65 T101 links, so no duplicate Airtable write was applied.
- [x] Marked Taskmaster T101 `done` only after verifier output passed the task test strategy and dependency discipline.
- [x] Recorded dependency readiness after T101; T103 is next eligible under the PO-authorized security lane.
- [x] Evidence: `/home/ubuntu/VIYO_branch_lock/t101_airtable_backfill_verification_2026-05-02.json` and `/home/ubuntu/VIYO_branch_lock/taskmaster_T101_status_done_2026-05-02.txt`.

## Git Push State Verification — Current Security-Lane Reconciliation

- [ ] Verify whether current local Taskmaster status changes, todo updates, and evidence files are committed or pushed to the selected VIYO GitHub repository before continuing T101/T103 advancement.
- [ ] Record the current branch, upstream tracking state, ahead/behind counts, uncommitted changes, and latest local/remote commit SHAs as evidence.


## Tightened Incremental Commit Rule — Admin Task Recovery Point

- [ ] Apply the tightened incremental commit rule immediately: any session that modifies repo-tracked state must commit and push after each completed and verified task, not at the end of a task series.
- [ ] Do not accumulate more than one completed task worth of uncommitted Taskmaster JSON, evidence files, todo updates, or verification scripts.
- [ ] Treat verification passing as the push gate for admin-only staging commits; no additional PO or PM approval is required after verification passes.
- [ ] Before continuing T101, verify current repo state and push the already completed T100 admin reconciliation as the sandbox recovery point.


## T103 — Composite Phase 2 Security, Analytics, QA, HYVE, and Commerce Backfill Reconciliation — DONE 2026-05-02

- [x] Confirmed T100 and T101 are done before starting T103 under the PO-authorized dependency order.
- [x] Verified the authoritative manifest scope for T103 from the approved composite backfill manifest: 20 Build Tracker records assigned to `Taskmaster Task ID = T103`.
- [x] Ran a live Airtable query for Build Tracker records currently linked to `T103` before any duplicate write attempt.
- [x] Compared live Airtable `T103` records against the approved manifest for exact record-ID match, expected count, task ID, phase distribution, and protected-field preservation.
- [x] Confirmed live verification already contains all 20 T103 links, so no duplicate Airtable write was applied.
- [x] Marked Taskmaster T103 `done` only after verifier output passed the task test strategy and dependency discipline.
- [x] Commit and push the verified T103 admin state immediately after completion, without accumulating another completed task.
- [x] Evidence: `/home/ubuntu/VIYO_branch_lock/t103_airtable_backfill_verification_2026-05-02.json` and `/home/ubuntu/VIYO_branch_lock/taskmaster_T103_status_done_2026-05-02.txt`.


## T73 — T56 Editing Router Coverage Implementation — Active

- [ ] Re-ingest `/viyo-development-protocol-v2`, authority-order guidance, Taskmaster workflow, quality gate, and post-build completion requirements before mutating T73 implementation or Taskmaster state.
- [ ] Confirm Taskmaster T73 is unblocked by the PO decision: dependency T69 is done, and security-lane blockers T100/T101/T103 are done and pushed through commit `395b6c3`.
- [ ] Read Taskmaster T73 details, test strategy, dependencies, and any existing subtasks before implementation.
- [ ] Set T73 to `in-progress` only after dependency and protocol gates are documented.
- [ ] Inspect the existing editing-router architecture, shared contracts, feature flags, and backend-supported capabilities before adding UI or route coverage.
- [ ] Wire only the ten approved editing tools where backend-supported capability exists: Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, and Material Swap.
- [ ] Ensure no unwired placeholder buttons are exposed; tool availability must reflect shared contracts and feature flags.
- [ ] Update `.github/workflows/deploy.yml` for the Pre-Alpha PO decision by uncommenting the `push: branches: [main]` trigger, while preserving manual `workflow_dispatch` support.
- [ ] Run required validation gates for T73, including lint/type/build/test checks available in the repo, plus targeted inspection proving all ten tools are covered safely.
- [ ] Complete Taskmaster and Airtable sync for T73 only after validation passes.
- [ ] Commit and push the verified T73 implementation immediately after completion, following the tightened incremental commit rule.

