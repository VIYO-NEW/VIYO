# Migration Automation Design Proposal

**Date:** 2026-05-09T10:58:00-04:00  
**Author:** Manus AI (WP-5 of infrastructure cleanup)  
**Status:** PROPOSAL — awaiting PO review and acceptance  
**Authority:** docs/governance/INFRASTRUCTURE_DECISIONS.md PO Decisions 1, 2, 6

## 1. Problem Statement

Manual database migrations are a launch-risk multiplier for VIYO because schema changes currently depend on human ceremony at precisely the point where the platform needs repeatable promotion from staging to production. The infrastructure report identified migrations as manual, while the current governance state names Supabase as active for production, staging, and the AI portal, with migrations still pending automation. That combination means every schema-changing pull request can pass code review yet still fail operationally if the correct database command is not run against the correct Supabase project at the correct time.[1] [2]

The immediate failure modes are concrete. A developer may merge application code that expects a new column while staging Supabase still has the old schema; the PO may apply a migration to the wrong database because staging and production connection material are both sensitive and similar in shape; or a locally generated schema operation may diverge from the SQL migration files that the repository treats as canonical. These risks are especially important for T73 because upcoming work is expected to touch the `assets` table, which is tenant-sensitive and covered by the governance rule that database drift must be resolved through canonical migrations rather than runtime patching.[3]

The design goal is therefore not to implement a workflow in this PR. The goal is to document a safe migration control plane that respects the accepted branch model, keeps staging automatic after merges to `staging`, keeps production manually gated, and treats runtime smoke testing as the verification standard. The proposal below is documentation-only and intentionally leaves `.github/workflows/migrate.yml` to a later PO-accepted implementation directive.

## 2. Current State (Discovery from Investigation)

### 2.1 Drizzle setup

The database package uses Drizzle Kit with a PostgreSQL dialect. Its configuration points `schema` to `./src/schema/index.ts`, writes generated migration artifacts to `./drizzle`, and reads the database connection from `process.env.DATABASE_URL`, falling back only to a local development URL when the variable is absent.[4]

| Discovery item | Current finding |
|---|---|
| Drizzle config file | `packages/db/drizzle.config.ts` |
| Schema entry point | `packages/db/src/schema/index.ts` |
| Canonical SQL directory in current repo | `packages/db/drizzle` |
| `packages/db/migrations` directory | No migration files found there during this investigation |
| Migration file count | 9 SQL files under `packages/db/drizzle` |
| Naming convention | Four-digit ordered prefix plus descriptive name, for example `0001_extensions.sql` through `0009_pia1_proprietary_intelligence_foundation.sql` |
| Required connection variable | `DATABASE_URL` |
| Package command that applies migrations | `pnpm db:migrate` from `packages/db`, equivalent to `drizzle-kit migrate` |
| Monorepo-safe invocation | `pnpm --filter @viyo/db db:migrate` |

The `@viyo/db` package exposes `db:generate`, `db:migrate`, `db:studio`, and `seed:staging`, but it does not expose `db:push`. That matters because this proposal should use the actual repository command and should avoid a schema-push model that generates operations dynamically from current TypeScript schema state.[5]

No pre-migration safety script was found in `packages/db/package.json`. Existing safety is currently governance-based: coding conventions require schema changes through canonical migrations, and the foundation lock forbids runtime schema patching or non-migration mechanisms for database drift.[3]

### 2.2 Existing CI workflows

Three GitHub Actions workflows were reviewed in full: `ci.yml`, `deploy.yml`, and `secret-scan.yml`. None currently applies database migrations, and none currently separates staging and production database credentials for migration execution.

| Workflow | Current triggers | Jobs | Secret references | Environment separation pattern observed |
|---|---|---|---|---|
| `.github/workflows/ci.yml` | Push to `main`; pull requests to `main` and `staging`; manual dispatch | `quality-gate`, `docker-lint` | None | CI validates pull requests into both `main` and `staging`, but push CI is currently only on `main`. |
| `.github/workflows/deploy.yml` | Push to `main`; manual dispatch | `ci`, `deploy-worker`, `verify` | `RENDER_DEPLOY_HOOK_URL` | Production worker deployment is main-oriented and uses one Render deploy-hook secret. |
| `.github/workflows/secret-scan.yml` | Push to `main`; pull requests | `scan` | None | Secret scanning applies to pull requests generally, but push coverage is currently main-oriented. |

The workflow pattern that should be reused is explicit secret referencing through `${{ secrets.NAME }}` rather than checked-in values. The pattern that should not be copied for migrations is a single repository-wide production-capable secret because production database credentials must not be reachable from a staging migration job.

### 2.3 GitHub Secrets inventory

The required command `gh secret list --repo VIYO-NEW/VIYO` was attempted for names-only inventory. The available GitHub integration returned `HTTP 403 Resource not accessible by integration`, so repository secret names could not be enumerated in this session. No secret values were requested, printed, captured, or committed.

| Inventory item | Result |
|---|---|
| Repository secret names | Not accessible through the available integration; command returned HTTP 403 |
| `DATABASE_URL_STAGING` | Not confirmed present |
| `DATABASE_URL_PRODUCTION` | Not confirmed present |
| Existing workflow-referenced secret name | `RENDER_DEPLOY_HOOK_URL` in `deploy.yml` |
| Environment names visible through GitHub metadata | `infra/domain-render-no-workflows - viyo-worker`, `infra/domain-render-no-workflows - viyo-worker-staging`, `Preview – viyo-admin`, `Preview – viyo-main`, `Preview – viyo-web`, `Production – viyo-admin`, `Production – viyo-main`, `Production – viyo-web` |

This is a PO action item before implementation. The migration workflow cannot be implemented safely until the required database connection secret names and their environment scopes are confirmed in GitHub settings.

### 2.4 Supabase projects

The Supabase project inventory was confirmed through read-only project metadata. The two database project IDs relevant to this proposal are below; the third project is listed for boundary clarity and is not part of the staging-to-production migration workflow.

| Environment | Supabase project name | Project ID / ref | Region | Status |
|---|---|---|---|---|
| Staging | `viyo-staging` | `ypnwxghvsxpyvnsndrba` | `us-east-1` | `ACTIVE_HEALTHY` |
| Production | `Viyo.new` | `rdhxhjcfklodalgctrcf` | `us-east-1` | `ACTIVE_HEALTHY` |
| Out of scope for WP-5 migration automation | `viyo-ai-api-web-portal` | `metfrwvhpcjyjxybdnrn` | `us-east-1` | `ACTIVE_HEALTHY` |

## 3. Recommended Design

### 3.1 Trigger model

**Staging migrations:** Auto-apply on every successful merge to `staging` branch when migration files are present in the diff. Because the current repository stores canonical migration SQL under `packages/db/drizzle`, the implementation should monitor that directory unless a future directive first renames or relocates migrations to `packages/db/migrations`.

**Production migrations:** Manual GitHub Actions trigger through `workflow_dispatch` after the staging migration succeeds and after the corresponding promotion path reaches `main`. This respects the current pre-Alpha rule that production can deploy automatically from `main` while still keeping production database mutation manually gated.

### 3.2 Workflow file location

The future implementation should create `.github/workflows/migrate.yml`. This directive does not create that workflow file and does not modify any existing workflow.

### 3.3 Triggers in YAML pseudocode

```yaml
name: VIYO Database Migrations

on:
  push:
    branches: [staging]
    paths:
      - 'packages/db/drizzle/**'
      - 'packages/db/src/schema/**'
      - 'packages/db/drizzle.config.ts'
      - 'packages/db/package.json'
  workflow_dispatch:
    inputs:
      target_environment:
        description: 'Target environment. Production requires PO approval.'
        required: true
        type: choice
        options: [production]
      confirmation:
        description: 'Type STAGING_VERIFIED to confirm staging migration succeeded on this commit.'
        required: true
        type: string
```

The production dispatch path should not be allowed to run for arbitrary branches. The future workflow should verify that the selected SHA is reachable from `main`, that staging migration evidence exists for the same migration set, and that the manual confirmation input matches the required phrase.

### 3.4 Required GitHub Secrets

The safest design uses GitHub Environment-scoped secrets rather than broad repository secrets. Environment scoping prevents production connection material from being available to the staging job and allows GitHub environment protection rules to require PO approval before production mutation.

| Secret name | Required scope | Used by | Purpose |
|---|---|---|---|
| `DATABASE_URL` | GitHub Environment: `Supabase Staging` or equivalent staging-only environment | Staging migration job | Connection string for `viyo-staging` only |
| `DATABASE_URL` | GitHub Environment: `Supabase Production` or equivalent production-only environment | Production manual job | Connection string for `Viyo.new` only |
| `MIGRATION_NOTIFY_WEBHOOK_URL` | Environment-scoped or repository-scoped, depending on chosen notification provider | Both jobs | Sends success and failure notifications |
| `MIGRATION_NOTIFY_EMAIL_TOKEN` | Environment-scoped or repository-scoped, only if email notification is selected | Both jobs | Sends email notification if Slack or another webhook is not used |

If the PO prefers unique secret names instead of same-name environment secrets, the implementation may use `DATABASE_URL_STAGING` and `DATABASE_URL_PRODUCTION`. The environment-scoped same-name design is preferred because the job can refer to `secrets.DATABASE_URL` while GitHub controls which value is injected by environment.

### 3.5 Job structure

For the staging migration job, the workflow should check out the merged `staging` commit, set up Node 22 and pnpm 9, install dependencies with the lockfile, detect whether canonical migration files changed, run `pnpm --filter @viyo/db db:migrate` with `DATABASE_URL` supplied only from the staging environment, verify the migration through a non-destructive schema or migration-history check, emit a success or failure notification, and persist run evidence. Evidence may be a workflow artifact, a GitHub deployment status, or a protected marker such as a release note keyed by commit SHA; it should not be a mutable file committed by the workflow unless the PO explicitly accepts bot commits.

For the production migration job, the workflow should be `workflow_dispatch` only. It should require the PO or an approved operator to trigger the run, require an explicit confirmation input such as `STAGING_VERIFIED`, confirm that the migration set has already succeeded on staging for the exact commit or migration hash, bind to a production GitHub Environment that requires approval, run the same file-based `pnpm --filter @viyo/db db:migrate` command with production-only `DATABASE_URL`, verify the result, and notify the PO immediately.

### 3.6 Safety mechanisms

The workflow should be staging-first and file-based. It should never use `db:push` as the normal CI operation because schema-push workflows can produce live DDL from current schema state rather than applying reviewed migration files. The repository already has ordered SQL files under `packages/db/drizzle`; the automation should apply those files through `drizzle-kit migrate` so local review, CI, and provider mutation all share the same artifact.

| Safety mechanism | Design requirement |
|---|---|
| Dry-run posture | A pull request should validate that migration files exist and are ordered, but it should not mutate a database until after merge to `staging`. |
| Staging lockout | If staging migration fails, production dispatch must fail pre-flight and refuse to run. |
| Environment-scoped secrets | Staging job must not have any access to production connection material. |
| No implicit rollback | Drizzle Kit does not provide a universal automatic rollback path, so rollback must be manual: restore from Supabase backup or apply an explicitly reviewed corrective forward migration. |
| Notifications | Failures must notify the PO within minutes through the chosen channel. |
| Runtime verification | After migration, the workflow should run a minimal non-destructive verification query or application smoke test that proves the expected schema is present without writing tenant data. |

### 3.7 Specific risks identified

The first risk is Drizzle schema drift. If contributors rely on a push-style schema operation locally, the database can move ahead of the reviewed SQL files. This proposal therefore recommends file-based `drizzle-kit migrate` and a developer rule that schema PRs include both TypeScript schema updates and the ordered SQL migration file.

The second risk is `DATABASE_URL` safety. Production database connection material must never be present in a staging workflow context. The production job should bind to a protected production GitHub Environment, and the staging job should bind only to a staging environment.

The third risk is migration ordering. The current naming convention is ordered and human-readable, which is good, but the workflow should still reject duplicate prefixes, gaps introduced by concurrent PRs, or migration file changes that are not accompanied by the expected schema update.

The fourth risk is verification ambiguity. A successful command exit is necessary but not sufficient. The workflow should emit evidence that identifies the Git SHA, migration files, target Supabase project ID, verification check, and notification outcome without logging any credential values.

## 4. Effort and Risk Estimate

| Item | Estimate |
|---|---|
| Implementation effort (writing `migrate.yml`, adding validation checks, and testing staging path) | 4-6 hours |
| Additional effort if GitHub environment protection and notification channel are not already configured | 1-3 hours |
| Risk to production stability | LOW, because production remains manual and environment-gated |
| Risk to staging stability | LOW-MODERATE, because the first automated staging migration may expose command or permission issues |
| Risk if not implemented | HIGH, because T73 and later schema changes will continue to require manual, error-prone database ceremony |

## 5. Phased Rollout Recommendation

Phase A should implement a staging-only auto-migration workflow. The first implementation should run on `staging` merges, apply only reviewed file-based migrations under `packages/db/drizzle`, and publish a workflow artifact that records the commit SHA, migration filenames, staging Supabase project ID, verification result, and notification result.

Phase B should validate the workflow with a harmless no-op style migration rehearsal in staging. The exact rehearsal should be defined by PO before implementation, but the important acceptance criterion is end-to-end evidence: merge to `staging`, migration applies to `viyo-staging`, verification passes, and notification reaches the selected channel.

Phase C should add production `workflow_dispatch` after two to four successful staging runs or after T73 proves the staging path under real schema pressure. The production job should require protected environment approval, an explicit confirmation phrase, and proof that the same migration set succeeded on staging.

Phase D should document the developer workflow. A developer adds a migration file under `packages/db/drizzle`, updates the Drizzle schema where needed, opens a normal PR, merges to `staging`, waits for the staging migration and runtime verification evidence, then proceeds through the approved production promotion path where the PO triggers the manual production migration.

## 6. Open Questions for PO

| Question | Why it matters |
|---|---|
| Which notification channel should migration failures use: Slack, email, GitHub issue comment, or another provider? | The workflow needs one reliable high-urgency path for failed database mutations. |
| What GitHub Environment names should be used for Supabase staging and production? | Environment names determine how secrets and approvals are scoped. |
| Should production dispatch require a second approver, or can the PO be both triggerer and approver? | This determines the GitHub Environment protection rule. |
| Should production migrations be restricted to a maintenance window before Alpha? | Database mutation timing affects support expectations and rollback readiness. |
| Should migration evidence be stored as workflow artifacts, GitHub deployment statuses, releases, or another durable record? | The implementation needs a durable but non-secret evidence location. |
| Should `packages/db/drizzle` remain the canonical directory, or should a future cleanup rename it to `packages/db/migrations`? | The directive referenced `packages/db/migrations`, while the current repository uses `packages/db/drizzle`. |
| Should a no-op staging rehearsal be allowed before T73, and what exact reversible schema shape is acceptable? | The first test should prove automation without creating product risk. |

## 7. Cross-references

- `docs/governance/INFRASTRUCTURE_DECISIONS.md` — source for PO Decisions 1, 2, and 6.
- `docs/governance/INFRASTRUCTURE_REPORT.md` — original infrastructure gap analysis and migration automation risk framing.
- `docs/governance/REDIS_ISOLATION_EVIDENCE.md` — runtime smoke-test evidence pattern for Decision 6.
- `docs/governance/CODING_CONVENTIONS.md` — canonical migration rule and prohibition on runtime schema patching.
- `docs/governance/FOUNDATION_LOCK.md` — tenant isolation and canonical migration locks.
- `packages/db/drizzle.config.ts` — current Drizzle schema path, output directory, dialect, and `DATABASE_URL` requirement.
- `packages/db/package.json` — current database package scripts and Drizzle Kit dependency.
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, and `.github/workflows/secret-scan.yml` — existing workflow trigger and job patterns.

[1]: docs/governance/INFRASTRUCTURE_REPORT.md "Infrastructure Report"
[2]: docs/governance/CURRENT_STATE.md "Current State"
[3]: docs/governance/CODING_CONVENTIONS.md "Coding Conventions"
[4]: ../../packages/db/drizzle.config.ts "Drizzle configuration"
[5]: ../../packages/db/package.json "Database package manifest"

## 8. Acceptance

PO indicates acceptance by approving this PR, replying in chat with any modifications to the design, and approving a follow-up directive that implements `.github/workflows/migrate.yml` per the accepted design.

No implementation happens until the follow-up directive is accepted. This PR adds only the proposal document and does not create workflow YAML, modify Drizzle configuration, modify database package files, add secrets, or run database commands.
