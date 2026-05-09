# Vercel Deployment Audit Evidence

**Audit date:** 2026-05-09
**Performed by:** Manus AI (WP-3 of infrastructure cleanup)
**Authority:** docs/governance/INFRASTRUCTURE_DECISIONS.md PO Decision 5 (2026-05-08)

## Audit Summary

This audit reviewed all four directive-listed Vercel projects under the **VIYO AI** account (`viyo-ai`, `team_PpZGjmrZdVz4iGMzUZwFfLfn`). All four projects were present; no extra projects were returned by the read-only project listing. The audit found Git-triggered deployments for all four projects, but no project received a live reconnection because the available session lacked a provider operation for changing project Git connection settings; all four projects therefore carry a **NEEDS_PO_ACTION** verdict for at least one unverifiable or non-compliant item.

| Metric | Result |
|---|---|
| Projects expected | 4 |
| Projects found | 4 |
| Projects correctly connected with no remaining audit issue | 0 |
| Projects reconnected by Manus | 0 |
| Projects needing PO dashboard action or confirmation | 4 |
| Non-listed projects observed | 0 |

## Project: viyo-web

### Metadata

| Field | Value |
|---|---|
| Project name | `viyo-web` |
| Project ID | `prj_96FXv91U1kORkfZ7Up7wTvthf2lo` |
| Vercel team/account owner | VIYO AI (`viyo-ai` / `team_PpZGjmrZdVz4iGMzUZwFfLfn`) |
| Date created | 2026-04-24T22:29:59.332000Z |
| Framework preset | vite |

### Git connection

| Question | Finding |
|---|---|
| Connected to GitHub repository? | Yes, Git-triggered deployments observed from expected repository; direct project-level Git field was not exposed. |
| Observed org/repo in last deployments | `VIYO-NEW/VIYO` |
| Expected org/repo | `VIYO-NEW/VIYO` |
| Production branch configured | main observed/inferred; direct project setting not exposed by available API payload |
| Automatic preview deployment for non-production branches | Observed yes |
| Git-triggered deployments in audited sample | 5 |

### Domains

| Domain | Production or preview | Branch source | Audit status |
|---|---|---|---|
| `viyo.new` | Production | main | Present |
| `www.viyo.new` | Production | main | Present |
| `app.viyo.new` | Production | main | Present |
| `staging.viyo.new` | Preview | staging | Missing from read-only payload |
| `app.staging.viyo.new` | Preview | staging | Missing from read-only payload |
| `viyo-web.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-web-viyo-ai.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-web-git-main-viyo-ai.vercel.app` | Vercel-managed alias | main | Present |

### Environment variable inventory (names only)

The current integration did not expose project environment variable inventory data. No environment variable values were requested, printed, stored, or committed. PO should confirm the provider-side variable names and scopes directly in the Vercel dashboard.

| variable name | Production | Preview | Development |
|---|---:|---:|---:|
| provider variable names not retrievable through available integration | Unknown | Unknown | Unknown |

### Recent deployments

| Deployment ID | Branch | Status | Created | Trigger |
|---|---|---|---|---|
| `dpl_EMgh3e9TDJt8rw8pgZAn2LWc92FQ` | `staging` | READY | 2026-05-09T02:50:49.970000Z | git-triggered |
| `dpl_GB953pcdh1aQ4fs33iPY5RxjP8Df` | `chore/wp2-render-blueprint-reconciliation` | READY | 2026-05-09T02:44:09.466000Z | git-triggered |
| `dpl_YTM8vGneFMhcXXfCWju8P97tEoSD` | `staging` | READY | 2026-05-09T02:35:46.896000Z | git-triggered |
| `dpl_5ZEQ1NhXD4gW1QL62LW2uLCXtWam` | `chore/wp1-source-of-truth-repair` | READY | 2026-05-09T02:32:35.735000Z | git-triggered |
| `dpl_e2vm4QLpbADKYqZzxBozmUTSr35J` | `staging` | READY | 2026-05-09T02:19:25.516000Z | git-triggered |

### Audit verdict

**NEEDS_PO_ACTION**. Confirm or add the expected staging custom domains `staging.viyo.new` and `app.staging.viyo.new` in the Vercel dashboard; the read-only project payload listed production custom domains but not those staging domains. Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field.

## Project: viyo-admin

### Metadata

| Field | Value |
|---|---|
| Project name | `viyo-admin` |
| Project ID | `prj_Pv1Y3qhxn5mo8xDrWImDb5lnfSfj` |
| Vercel team/account owner | VIYO AI (`viyo-ai` / `team_PpZGjmrZdVz4iGMzUZwFfLfn`) |
| Date created | 2026-04-24T22:30:06.691000Z |
| Framework preset | vite |

### Git connection

| Question | Finding |
|---|---|
| Connected to GitHub repository? | Yes, Git-triggered deployments observed from expected repository; direct project-level Git field was not exposed. |
| Observed org/repo in last deployments | `VIYO-NEW/VIYO` |
| Expected org/repo | `VIYO-NEW/VIYO` |
| Production branch configured | main observed/inferred; direct project setting not exposed by available API payload |
| Automatic preview deployment for non-production branches | Observed yes |
| Git-triggered deployments in audited sample | 5 |

### Domains

| Domain | Production or preview | Branch source | Audit status |
|---|---|---|---|
| `admin.viyo.new` | Production | main | Present |
| `admin.staging.viyo.new` | Preview | staging | Missing from read-only payload |
| `viyo-admin.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-admin-viyo-ai.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-admin-git-main-viyo-ai.vercel.app` | Vercel-managed alias | main | Present |

### Environment variable inventory (names only)

The current integration did not expose project environment variable inventory data. No environment variable values were requested, printed, stored, or committed. PO should confirm the provider-side variable names and scopes directly in the Vercel dashboard.

| variable name | Production | Preview | Development |
|---|---:|---:|---:|
| provider variable names not retrievable through available integration | Unknown | Unknown | Unknown |

### Recent deployments

| Deployment ID | Branch | Status | Created | Trigger |
|---|---|---|---|---|
| `dpl_CPehVf8sWkwCFDh3Y91MdtttdxTJ` | `staging` | READY | 2026-05-09T02:50:49.927000Z | git-triggered |
| `dpl_GKHcQSsFsxX7ZyjCXZpV4HjN1a4u` | `chore/wp2-render-blueprint-reconciliation` | READY | 2026-05-09T02:44:09.445000Z | git-triggered |
| `dpl_9VcxLSrRC2UmbUGUYP4qFZ9BQukY` | `staging` | READY | 2026-05-09T02:35:46.935000Z | git-triggered |
| `dpl_J25pnvoAhjMPsNwcj3gUhVZsBA2j` | `chore/wp1-source-of-truth-repair` | READY | 2026-05-09T02:32:35.644000Z | git-triggered |
| `dpl_Bf5EKxAXH5fLLiExS5pauos9a5Dz` | `staging` | READY | 2026-05-09T02:19:25.583000Z | git-triggered |

### Audit verdict

**NEEDS_PO_ACTION**. Confirm or add the expected staging custom domain `admin.staging.viyo.new` in the Vercel dashboard; the read-only project payload listed `admin.viyo.new` but not the staging domain. Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field.

## Project: viyo-main

### Metadata

| Field | Value |
|---|---|
| Project name | `viyo-main` |
| Project ID | `prj_7x6VVovv1vBY7IzIkcBudyZ1OGaE` |
| Vercel team/account owner | VIYO AI (`viyo-ai` / `team_PpZGjmrZdVz4iGMzUZwFfLfn`) |
| Date created | 2026-05-02T06:29:31.022000Z |
| Framework preset | vite |

### Git connection

| Question | Finding |
|---|---|
| Connected to GitHub repository? | Yes, Git-triggered deployments observed from expected repository; direct project-level Git field was not exposed. |
| Observed org/repo in last deployments | `VIYO-NEW/VIYO` |
| Expected org/repo | `VIYO-NEW/VIYO` |
| Production branch configured | main observed/inferred; direct project setting not exposed by available API payload |
| Automatic preview deployment for non-production branches | Observed yes |
| Git-triggered deployments in audited sample | 5 |

### Domains

| Domain | Production or preview | Branch source | Audit status |
|---|---|---|---|
| `viyo-main.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-main-viyo-ai.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `viyo-main-git-main-viyo-ai.vercel.app` | Vercel-managed alias | main | Present |

### Environment variable inventory (names only)

The current integration did not expose project environment variable inventory data. No environment variable values were requested, printed, stored, or committed. PO should confirm the provider-side variable names and scopes directly in the Vercel dashboard.

| variable name | Production | Preview | Development |
|---|---:|---:|---:|
| provider variable names not retrievable through available integration | Unknown | Unknown | Unknown |

### Recent deployments

| Deployment ID | Branch | Status | Created | Trigger |
|---|---|---|---|---|
| `dpl_3EY9eXywHgQovFVdRvhavu84zpDY` | `staging` | READY | 2026-05-09T02:50:49.942000Z | git-triggered |
| `dpl_2QFxuWrwZt2wLkgwcZRAYijeUekb` | `chore/wp2-render-blueprint-reconciliation` | READY | 2026-05-09T02:44:09.432000Z | git-triggered |
| `dpl_6mUPpEF852CghsV7AA3vj1fhUzZb` | `staging` | READY | 2026-05-09T02:35:46.882000Z | git-triggered |
| `dpl_8C6kdnJXt3htmYFSn2EcDoWR6kMq` | `chore/wp1-source-of-truth-repair` | READY | 2026-05-09T02:32:35.631000Z | git-triggered |
| `dpl_5Jqb4RuWk8M8NBwfRBcPe8DK6tRc` | `staging` | READY | 2026-05-09T02:19:25.667000Z | git-triggered |

### Audit verdict

**NEEDS_PO_ACTION**. Confirm intended custom-domain ownership for the marketing surface; only Vercel-managed domains were visible in the read-only payload. Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field.

## Project: ai-api-web-portal

### Metadata

| Field | Value |
|---|---|
| Project name | `ai-api-web-portal` |
| Project ID | `prj_AUV77GtC8YDTrVB8PfE6BeA4VxGa` |
| Vercel team/account owner | VIYO AI (`viyo-ai` / `team_PpZGjmrZdVz4iGMzUZwFfLfn`) |
| Date created | 2026-05-05T05:15:54.475000Z |
| Framework preset | vite |

### Git connection

| Question | Finding |
|---|---|
| Connected to GitHub repository? | Yes, Git-triggered deployments observed, but from non-expected repository. |
| Observed org/repo in last deployments | `VIYO-NEW/AI-API-Web-Portal` |
| Expected org/repo | `VIYO-NEW/VIYO` |
| Production branch configured | main observed/inferred; direct project setting not exposed by available API payload |
| Automatic preview deployment for non-production branches | Not verified from available deployment sample |
| Git-triggered deployments in audited sample | 1 |

### Domains

| Domain | Production or preview | Branch source | Audit status |
|---|---|---|---|
| `ai.viyo.new` | Production | main | Missing from read-only payload |
| `ai-api-web-portal.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `ai-api-web-portal-viyo-ai.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |
| `ai-api-web-portal-office-8789-viyo-ai.vercel.app` | Vercel-managed alias | not branch-specific in payload | Present |

### Environment variable inventory (names only)

The current integration did not expose project environment variable inventory data. No environment variable values were requested, printed, stored, or committed. PO should confirm the provider-side variable names and scopes directly in the Vercel dashboard.

| variable name | Production | Preview | Development |
|---|---:|---:|---:|
| provider variable names not retrievable through available integration | Unknown | Unknown | Unknown |

### Recent deployments

| Deployment ID | Branch | Status | Created | Trigger |
|---|---|---|---|---|
| `dpl_CRiXUm3HbcsY1zaVAcu1MC6PkmWr` | `main` | READY | 2026-05-05T05:34:30.064000Z | git-triggered |

### Audit verdict

**NEEDS_PO_ACTION**. Reconnect or migrate the project if PO Decision 5 requires this surface to deploy from `VIYO-NEW/VIYO`; recent deployment metadata showed `VIYO-NEW/AI-API-Web-Portal`, not `VIYO-NEW/VIYO`. Confirm or add the expected custom domain `ai.viyo.new` in the Vercel dashboard; only Vercel-managed domains were visible in the read-only payload. Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. Confirm production branch and preview automation because only one main-branch deployment was visible in the audit payload.

## Issues requiring PO action

| Project | Required PO action |
|---|---|
| `viyo-web` | Confirm or add the expected staging custom domains `staging.viyo.new` and `app.staging.viyo.new` in the Vercel dashboard; the read-only project payload listed production custom domains but not those staging domains. |
| `viyo-web` | Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. |
| `viyo-web` | Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field. |
| `viyo-admin` | Confirm or add the expected staging custom domain `admin.staging.viyo.new` in the Vercel dashboard; the read-only project payload listed `admin.viyo.new` but not the staging domain. |
| `viyo-admin` | Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. |
| `viyo-admin` | Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field. |
| `viyo-main` | Confirm intended custom-domain ownership for the marketing surface; only Vercel-managed domains were visible in the read-only payload. |
| `viyo-main` | Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. |
| `viyo-main` | Confirm the project-level Git setting in the dashboard; recent deployments prove Git-triggered VIYO-NEW/VIYO activity, but the project payload did not expose the direct Git connection field. |
| `ai-api-web-portal` | Reconnect or migrate the project if PO Decision 5 requires this surface to deploy from `VIYO-NEW/VIYO`; recent deployment metadata showed `VIYO-NEW/AI-API-Web-Portal`, not `VIYO-NEW/VIYO`. |
| `ai-api-web-portal` | Confirm or add the expected custom domain `ai.viyo.new` in the Vercel dashboard; only Vercel-managed domains were visible in the read-only payload. |
| `ai-api-web-portal` | Confirm environment variable names and scopes in Vercel because the available integration did not expose environment variable inventory data. |
| `ai-api-web-portal` | Confirm production branch and preview automation because only one main-branch deployment was visible in the audit payload. |

## Reconnections performed

No reconnections were performed. The available Vercel integration provided read access to projects and deployments, but it did not expose a safe operation for changing project Git connection settings, production branch settings, or automatic preview deployment settings. Vercel CLI was also not installed/authenticated in the session, so provider mutation was halted rather than attempted outside the directive constraints.

## Cross-references

- Authority: [docs/governance/INFRASTRUCTURE_DECISIONS.md](./INFRASTRUCTURE_DECISIONS.md) (Decision 5)
- Inventory baseline: [docs/governance/INFRASTRUCTURE_REPORT.md](./INFRASTRUCTURE_REPORT.md)
- Read-only audit artifacts were generated outside the repository under `/tmp/wp3_*` and `/home/ubuntu/memory/checkpoints/` for Manus handoff continuity.
