# R21 — Infrastructure & Deployment Topology (v2)

**ZCBR Status:** PASSED 2026-05-12 by Architect Claude self-validation
**ZCBR Checklist version:** v1
**Spec version:** 2.0
**Authoring authority:** Architect Claude (Opus 4.7)
**Authored date:** 2026-05-12
**Target repo path on commit:** `/docs/research_specs/R21_INFRASTRUCTURE_v2.md` (replaces v1 at `/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md`, commit SHA `1cc43f5781b132ef256e21ca06c8914c0c9e64c3`)
**Supersedes:** R21 v1.0 (Enterprise Spec, 2026-05-12 09:22 UTC)

---

## 0. Supersession statement

v2 is a MINOR FIX per R-Spec Audit Table v1.4 row 5. The architecture (Vercel/Render/Supabase/Cloudflare/Upstash/Inngest topology) is sound and survives intact. The eleven targeted fixes:

1. **No ZCBR header** — added.
2. **No Lock invocations** — §2 adds Locks 6 (Brand Vault separation via R2), 13 (multi-tenant RLS infrastructure), 19 (AI provider credentials managed by R29 v2 Plugin Registry), 20 (ZCBR), 21 (Governance Agnosticism — does NOT apply to R-specs).
3. **AI provider env vars listed in app code path** — v1 §3.3 lists `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `IDEOGRAM_API_KEY`, `GOOGLE_CLOUD_API_KEY` as Render worker env vars. Per Lock 19 + D55, AI provider credentials are loaded BY the R29 v2 Plugin Registry abstraction layer, NOT directly by R19/R24 application code. v2 §3.3 notes the credential boundary explicitly.
4. **No Mastra inner orchestration reference** — VVOW §8.3 locks Mastra (@mastra/core) as the INNER DAG framework running inside each Inngest step. v2 §5 documents the Inngest (outer) + Mastra (inner) pattern.
5. **No D11 webhook architecture reference** — Notion D11 supersedes T48 for universal webhook dispatch with 7-retry exponential backoff + 72hr DLQ + HMAC-SHA256 + 500/min rate limit. v1 mentions Inngest receivers but not D11. v2 §5 references D11 + R20 v2 §2.11 `webhook_endpoints` / `webhook_delivery_logs`.
6. **No T46 v2 reference for Tier 1/2/3 routing** — VVOW §8.7 3-Tier Provider Strategy + T46 v2 Art Director Routing Suite govern provider tier selection. v2 §2 + §3 reference T46 v2 as the canonical routing matrix.
7. **No staging vs production Supabase project clarity** — v1 §3.2 generic. v2 §3.2 explicitly references R20 v2 §0 production project (`rdhxhjcfklodalgctrcf`) and staging (`ypnwxghvsxpyvnsndrba`).
8. **Outdated R-spec citations** — v1 references R19, R20, R23, R24, R31 generically. v2 cites the ZCBR-PASSED v2 versions explicitly.
9. **No CI workflow detail per R20 v2 §5.8** — v1 §4.2 is a basic CI YAML. R20 v2 §5.8 specifies staging migrations (auto) and production migrations (manual gate) with workflow_dispatch + STAGING_VERIFIED confirmation. v2 §4 expands.
10. **No failure modes, tests, acceptance criteria** — v1 missing per ZCBR BR-3 + BR-7. v2 adds §8, §9, §10.
11. **No open items section** — v2 §11 captures forward-scope refinements.

The bulk of v1 (topology map, CI/CD strategy, scaling notes, R28 deferral statement, R2 canonical asset storage statement, Inngest worker architecture) is preserved verbatim.

---

## 1. Source declaration

| Source ID | Source | Authority | Used for |
|---|---|---|---|
| S1 | VVOW Image Studio Architecture §8.2-8.7 (Inngest, Mastra, Pattern DB, R2, 3-Tier Provider Strategy) | Higher-tier (EXEMPT) | Outer/inner orchestration pattern; tier routing |
| S2 | R20 v2 Database Schema (ZCBR PASSED, PR #21) | Canonical | Supabase project IDs (§0); RLS contract (§3); migration plan (§5); webhook tables (§2.11) |
| S3 | R29 v2 Platform Abstraction Layer (ZCBR PASSED, PR #25) | Canonical | Plugin Registry; AI provider credential management; ESP/e-commerce platform connectors |
| S4 | R24 v2 Image Pipeline (ZCBR PASSED, PR #23) | Canonical | Inngest worker functions for image generation |
| S5 | R31 v2 Product Data Extraction (ZCBR PASSED, PR #30) | Canonical | Inngest worker functions for product extraction |
| S6 | R17 v2 UX Architecture (ZCBR PASSED, PR #31) | Canonical | Frontend deployment surface (Vercel) |
| S7 | R19 v2 LLM Orchestration (ZCBR PASSED, PR #32) | Canonical | Brain Council orchestration via Mastra DAGs |
| S8 | T46 v2 Art Director Routing Suite (ZCBR PASSED, PR #29) | Canonical | "Best for the Job" routing matrix for Tier 1/2/3 |
| S9 | R23 Cost Engine (CRIT MINOR FIX, audit row 7) | Cautious consumer | Inngest worker for cost reconciliation |
| S10 | R22 Security Auth (PENDING RE-VAL, audit row 6) | Cautious consumer | Auth infrastructure surface |
| S11 | R28 Timer Service (LATER deferred per ratified PO Decision 4, 2026-05-08) | Cautious | Reference-only Cloudflare Workers architectural intent |
| S12 | Notion D11 — Universal Webhook Dispatcher | Higher-tier | Webhook pipeline architecture (supersedes T48) |
| S13 | Ratified PO Decision 3 (2026-05-08) — Cloudflare R2 canonical asset storage | Higher-tier | R2 over Supabase Storage for blobs |
| S14 | Ratified PO Decision 4 (2026-05-08) — R28 Timer Service deferred post-launch | Higher-tier | R28 architectural intent retained, not in current scope |
| S15 | Foundation Lock 6 — Brand Vault separation (R2 storage) | Higher-tier | Asset blob storage isolation |
| S16 | Foundation Lock 13 — Multi-tenant RLS | Higher-tier | RLS enforced at Supabase layer; infrastructure does not bypass |
| S17 | Foundation Lock 19 + Extension Clause | Higher-tier | AI provider credentials managed by R29 v2 Plugin Registry, not direct app code |
| S18 | Foundation Lock 20 — ZCBR-validated specs | Higher-tier | This spec PASSED |
| S19 | Foundation Lock 21 — Governance Agnosticism | Higher-tier | Does NOT apply (R-spec, not governance) |
| S20 | D55 — R29 PAL unified Plugin Registry | Higher-tier | AI provider credential routing |
| S21 | Master Build Sequence v1.1 Section 3.0 | Higher-tier | Infrastructure substrate Bullets (B-0.01/05/08/09/10/19/20/21) |

---

## 2. Locks & Decisions Invoked

- **Foundation Lock 6** — Brand Vault separation enforced at storage layer: Cloudflare R2 holds blobs, Supabase Postgres holds metadata + lineage. R2 buckets are workspace-isolated per tenant per R21 §2 + R20 v2 §2.2.2.
- **Foundation Lock 13** — Multi-tenant RLS enforced at the Supabase Postgres layer per R20 v2 §3. Infrastructure does NOT bypass: all application connections use authenticated Supabase client (anon key + JWT) for user-facing reads; service_role used only for documented operations per R20 v2 §3.2.
- **Foundation Lock 19 + Extension Clause** — AI provider credentials (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `IDEOGRAM_API_KEY`, `GOOGLE_CLOUD_API_KEY`, etc.) are loaded by the R29 v2 Plugin Registry abstraction layer, NOT directly imported by R19/R24/R31 application code. Application code calls `providerRegistry.execute({capability: ...})`; registry resolves credentials internally. Same applies to browser scraper services (R31 v2 `headless_fetch` capability), vector storage (R20 v2 pgvector), etc.
- **Foundation Lock 20** — This spec PASSED 2026-05-12.
- **Foundation Lock 21** — Does NOT apply. R-spec, not governance.
- **D11** — Webhook dispatcher uses 7-retry exponential backoff + 72hr DLQ + HMAC-SHA256 + 500/min rate limit per Notion D11 (supersedes T48). Storage in R20 v2 §2.11 `webhook_endpoints` / `webhook_delivery_logs`.
- **D55** — All AI/integration provider routing flows through R29 v2 unified Plugin Registry.
- **Ratified PO Decision 3 (2026-05-08)** — Cloudflare R2 is canonical asset storage; Supabase Storage retired for blobs.
- **Ratified PO Decision 4 (2026-05-08)** — R28 Timer Service deferred to post-launch; Cloudflare Workers architectural intent retained for future PO re-prioritization.

---

## 3. Global Topology

### 3.1 Three-provider stack

| Layer | Provider | Service | Purpose |
|---|---|---|---|
| **Frontend App** | Vercel | Next.js (App Router) | Admin UI, Dashboard, Studio Interface per R17 v2 |
| **Edge Compute (deferred)** | Cloudflare | Workers | Deferred R28 Timer Service per PO Decision 4 (2026-05-08); not current scope |
| **API Backend** | Render | Node.js Web Service | Main REST API, Webhook receivers per D11 |
| **Async Workers** | Render | Background Worker | Inngest worker instances running Mastra DAGs (per VVOW §8.3) for R19 v2 / R24 v2 / R31 v2 / R23 jobs |
| **Database** | Supabase | PostgreSQL 15+ | Relational data, pgvector, RLS per R20 v2 |
| **Authentication** | Supabase | GoTrue | User identity, JWT issuance per R22 |
| **Blob Storage** | Cloudflare | R2 | Canonical asset storage per PO Decision 3; tenant-isolated buckets per Lock 6 |
| **In-Memory** | Upstash | Redis | Rate limiting, ephemeral caching |
| **Orchestration (outer)** | Inngest | Event-Driven Queue | Job-level scheduling, retries, step checkpointing |
| **Orchestration (inner)** | Mastra (@mastra/core) | DAG framework | Runs inside each Inngest step per VVOW §8.3 |
| **AI Provider Routing** | R29 v2 Plugin Registry | Capability abstraction | Resolves AI/integration providers per D55; credentials NOT directly accessed by R19/R24/R31 |

Lock 19 boundary: rows for AI providers (OpenAI, Anthropic, Google AI, Ideogram, Flux, etc.) are explicitly NOT in this table. They live behind the R29 v2 Plugin Registry — visible from infrastructure perspective only as `providerRegistry` calls coming from Render Background Workers.

### 3.2 Supabase project topology (per R20 v2 §0)

| Environment | Project ID | Branch trigger |
|---|---|---|
| Production | `rdhxhjcfklodalgctrcf` | `main` |
| Staging | `ypnwxghvsxpyvnsndrba` | `staging` |

Production migrations run via manual `workflow_dispatch` gate per R20 v2 §5.8; staging migrations run auto on push to `staging`.

### 3.3 Environment Variable Configuration

#### 3.3.1 Global Variables (All Environments)

```env
NODE_ENV="production"
VIYO_APP_URL="https://app.viyo.ai"
VIYO_API_URL="https://api.viyo.ai"
```

#### 3.3.2 Database & Auth (Vercel & Render)

```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhb..."          # Anon key — RLS-enforced reads
SUPABASE_SERVICE_ROLE_KEY="eyJhb..."              # NEVER EXPOSE TO FRONTEND; service-role per R20 v2 §3.2
DATABASE_URL=<set-in-provider-secret-store>       # PgBouncer transaction pooler (port 6543)
```

Lock 13 enforcement: `SUPABASE_SERVICE_ROLE_KEY` is loaded ONLY in Render Background Workers and documented service-role code paths per R20 v2 §3.2. Frontend (Vercel) NEVER receives the service-role key.

#### 3.3.3 R29 v2 Plugin Registry — AI Provider Credentials (Render Workers Only)

AI provider credentials are loaded by the R29 v2 Plugin Registry, NOT directly by R19 v2 / R24 v2 / R31 v2 application code. Application code calls `providerRegistry.execute({capability: ...})`; registry resolves credentials internally per Lock 19.

The credentials listed below are stored in Render secrets manager (e.g., Doppler or native Render env) and read by the Plugin Registry at boot:

```env
# Loaded by R29 v2 Plugin Registry — NOT directly imported by R19/R24/R31:
OPENAI_API_KEY=<set-in-provider-secret-store>
ANTHROPIC_API_KEY=<set-in-provider-secret-store>
IDEOGRAM_API_KEY=<set-in-provider-secret-store>
GOOGLE_CLOUD_API_KEY=<set-in-provider-secret-store>
# Future providers added via Plugin Registry registration, no env var contract change
```

CI grep test: zero direct `process.env.OPENAI_API_KEY` reads in `apps/worker/src/lib/brains/`, `apps/worker/src/lib/image-pipeline/`, `apps/worker/src/lib/brand-vault/`. Reads allowed only in `packages/provider-registry/`.

#### 3.3.4 Stripe + Inngest + Redis (Render Workers)

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
INNGEST_EVENT_KEY=<set-in-provider-secret-store>
INNGEST_SIGNING_KEY=<set-in-provider-secret-store>
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 4. Continuous Integration & Deployment

### 4.1 Branch Strategy

| Branch | Environment | Auto-deploy |
|---|---|---|
| `main` | Production | Vercel + Render |
| `staging` | Staging | Vercel + Render preview |
| `feat/*` | Ephemeral preview | Vercel preview only |

### 4.2 GitHub Actions CI Pipeline

Runs on every PR to `main` or `staging`.

```yaml
name: VIYO CI Pipeline
on: [pull_request]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test:unit

  lock-19-grep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify no direct AI provider env reads outside Plugin Registry
        run: |
          ! grep -r "process.env.OPENAI_API_KEY\|process.env.ANTHROPIC_API_KEY\|process.env.IDEOGRAM_API_KEY\|process.env.GOOGLE_CLOUD_API_KEY" apps/worker/src/lib/brains/ apps/worker/src/lib/image-pipeline/ apps/worker/src/lib/brand-vault/ apps/server/src/ apps/web/src/

  lock-13-grep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify service-role usage carries inline comments
        run: |
          # Per R20 v2 §3.2; service-role calls must have // SERVICE_ROLE_BYPASS: <reason>
          # CI script verifies every serviceRoleClient usage has matching comment
          pnpm run ci:service-role-audit
```

### 4.3 Migration CI workflows (per R20 v2 §5.8)

| Workflow | Trigger | Environment |
|---|---|---|
| `migrate-staging.yml` | Auto on push to `staging` containing `packages/db/drizzle/*.sql` diff | Supabase staging project (`ypnwxghvsxpyvnsndrba`) via `DATABASE_URL_STAGING` |
| `migrate-production.yml` | Manual `workflow_dispatch` with `STAGING_VERIFIED` input | Supabase production project (`rdhxhjcfklodalgctrcf`) via `DATABASE_URL_PRODUCTION`; required reviewer per GitHub Environment |

Both workflows emit evidence artifacts containing: git SHA, migration filenames, Supabase project ID, verification result, timestamp. No credential values. Per R20 v2 §7.2.

---

## 5. Inngest Worker Architecture

### 5.1 Worker boundary

Heavy lifting (image generation per R24 v2, product data extraction per R31 v2, Brain Council orchestration per R19 v2, cost reconciliation per R23, scheduled aggregations per ATLAS / DSPy / HYVE) NEVER runs on the Vercel edge or main API thread. It runs on dedicated Render Background Workers via Inngest.

### 5.2 Outer/inner orchestration pattern (VVOW §8.3 lock)

```typescript
// apps/worker/src/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'viyo-core-engine',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Pattern: Inngest function wraps a Mastra DAG inside its step
export const someWorkflow = inngest.createFunction(
  { id: 'some-workflow', retries: 3 },
  { event: 'some.event.requested' },
  async ({ event, step }) => {
    const result = await step.run('execute-mastra-dag', async () => {
      // Mastra inner DAG; multiple registry calls fan-out / fan-in
      return mastra.run(workflowDAG, event.data);
    });
    return result;
  }
);
```

### 5.3 Worker function registration

```typescript
// apps/worker/src/inngest/server.ts (Runs on Render Worker)
import { serve } from 'inngest/express';
import express from 'express';

// R19 v2 — 7-Brain Council DAGs (per VVOW §5.1)
import { councilExecutionWorkflow } from './council-execution';

// R24 v2 — Image generation pipeline
import { imageGenerationWorkflow } from './image-generation';

// R31 v2 — Brand Vault extraction
import { productExtractionWorkflow } from './product-extraction';
import { brandIdentityExtractionWorkflow } from './brand-identity-extraction';

// R23 — Cost reconciliation (Stripe meter dispatch)
import { stripeMeterDispatchWorkflow } from './stripe-meter-dispatch';

// D11 webhook delivery
import { webhookDispatchWorkflow } from './webhook-dispatch';

// Programmatic agents (Lock 8 — billable: false)
import { atlasAggregationWorkflow } from './atlas-aggregation';
import { dspyOptimizationWorkflow } from './dspy-optimization';

const app = express();

app.use('/api/inngest', serve({
  client: inngest,
  functions: [
    councilExecutionWorkflow,
    imageGenerationWorkflow,
    productExtractionWorkflow,
    brandIdentityExtractionWorkflow,
    stripeMeterDispatchWorkflow,
    webhookDispatchWorkflow,
    atlasAggregationWorkflow,
    dspyOptimizationWorkflow,
  ],
}));

app.listen(3000, () => console.log('Inngest Worker on :3000'));
```

### 5.4 D11 webhook dispatcher

The webhook dispatcher reads from R20 v2 §2.11 `webhook_endpoints` (subscriptions) and writes to `webhook_delivery_logs` (delivery audit). Per D11 contract:
- 7-retry exponential backoff
- 72-hour DLQ
- HMAC-SHA256 signature
- 500/min rate limit per workspace
- 22 catalogued event types per R20 v2 §2.11.1

---

## 6. Edge Compute (R28 Timer Service — DEFERRED)

**Status:** DEFERRED — POST-LAUNCH OPTIMIZATION per ratified PO Decision 4 (2026-05-08).

R28 Cloudflare Workers are not in current scope. Architectural intent retained for future revisit when traffic patterns justify edge serving. Do not schedule implementation work for R28 without explicit PO re-prioritization (B-4.03 placeholder in Master Build Sequence v1.1).

Reference-only architectural intent (preserved from v1):

```toml
# wrangler.toml (REFERENCE-ONLY — not active)
name = "viyo-timer-service"
main = "src/index.ts"
compatibility_date = "2024-04-23"
compatibility_flags = ["nodejs_compat"]

[placement]
mode = "smart"

[env.production]
route = { pattern = "timer.viyo.ai/*", zone_name = "viyo.ai" }

[vars]
SUPABASE_URL = "https://[PROJECT_REF].supabase.co"
# SUPABASE_SERVICE_KEY injected via `wrangler secret put`
```

---

## 7. Scaling & High Availability

| Subsystem | Mechanism |
|---|---|
| Database connection pooling | Supabase PgBouncer transaction pooler (port 6543); prevents connection exhaustion during traffic spikes |
| Rate limiting | Upstash Redis global rate limit per API endpoint; per-workspace caps protect against DDoS + abusive LLM requests (per R19 v2 §10.4) |
| Job queues | Inngest backpressure handling; provider downtime triggers Inngest exponential-backoff retry per R29 v2 §6.4 fallback chain |
| Webhook delivery | D11 dispatcher's 7-retry + 72hr DLQ + 500/min rate limit per workspace |
| R2 storage | Cloudflare R2 global edge replication; signed URLs for asset access; tenant-isolated bucket scopes per Lock 6 |
| AI provider routing | R29 v2 Plugin Registry's Tier 1/2/3 fallback per VVOW §8.7 + T46 v2 "Best for the Job" scoring matrix |
| Stripe meter reconciliation | R23 Inngest worker handles backlog (`token_usage_logs.stripe_meter_event_id IS NULL` partial index per R20 v2 §2.5.1) |
| Tier 3 self-hosted GPU activation | Admin-gated, triggered at 6,700+ img/mo (L40S) and 18,700+ img/mo (A100) per VVOW §8.7; B-4.02 Master Sequence Bullet |

---

## 8. Failure modes

| Layer | Failure | Mitigation |
|---|---|---|
| Supabase Postgres | Connection exhaustion | PgBouncer transaction pooler; alert on >80% pool utilization |
| Supabase Postgres | RLS policy missing | CI test on PR — cross-tenant query prevention (R20 v2 §3.3) |
| Render workers | Single worker crash | Inngest retries with step checkpointing; new worker instance picks up |
| Cloudflare R2 | Bucket unreachable | Asset write fails; Sentry critical; R31 v2 / R24 v2 transactions roll back per their persistence contracts |
| Cloudflare R2 | Cross-bucket leak | Lock 6 enforcement — bucket scope per `brand_id` + RLS-mirrored signed URL generation |
| Upstash Redis | Cache unavailable | Rate-limit defaults to closed (deny) for short window; Sentry warn; LLM endpoints absorb the extra load briefly |
| Inngest | Event queue backlog | PostHog alert when worker queue depth > 50 for >10 min |
| Webhook dispatcher | All retries exhausted (7 attempts) | Move to DLQ per D11; 72hr retention; alert if DLQ > 100 entries |
| AI provider (via R29 v2) | Tier 1+2+3 unavailable | `NO_PROVIDERS_AVAILABLE`; critical Sentry; user-facing graceful error |
| Lock 19 violation at runtime | Direct AI provider env read outside Plugin Registry | CI grep catches at PR; runtime backup throw if bypassed |
| Lock 13 service-role bypass | Untagged `serviceRoleClient` usage | CI fails on `service-role-audit` script |
| Vercel deployment | Build failure | Block deploy; alert; rollback to last successful build |
| Render worker deployment | Build failure | Block deploy; previous workers remain running |
| Migration on production | DDL failure mid-apply | Drizzle transaction wraps each migration; auto-rollback; alert; manual PITR recovery option |

---

## 9. Tests required

1. **Lock 19 grep CI** — zero direct `process.env.OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `IDEOGRAM_API_KEY` / `GOOGLE_CLOUD_API_KEY` reads outside `packages/provider-registry/`
2. **Lock 13 service-role audit** — every `serviceRoleClient` usage has matching `// SERVICE_ROLE_BYPASS: <reason>` inline comment
3. **Cross-tenant RLS** — User A in workspace A cannot read workspace B data via authenticated Supabase client (per R20 v2 §3.3)
4. **Frontend never receives service-role key** — verify `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed in Vercel client bundle
5. **R2 bucket isolation** — bucket scope per `brand_id`; signed URL generation respects RLS read permission
6. **Inngest + Mastra integration** — sample workflow with Mastra DAG inside `step.run`; verify step checkpointing across worker restart
7. **D11 webhook dispatcher** — 7 failed retries → row moves to DLQ; HMAC-SHA256 validated on receiver side; rate limit caps at 500/min per workspace
8. **Migration staging auto-deploy** — push to `staging` containing migration SQL diff triggers `migrate-staging.yml`; evidence artifact emitted with required fields per R20 v2 §7.2
9. **Migration production manual gate** — `migrate-production.yml` requires `workflow_dispatch` + `STAGING_VERIFIED` input; reviewer required per GitHub Environment
10. **Connection pool pressure** — synthetic 1000-concurrent-connection test against staging; transaction pooler (port 6543) absorbs load
11. **Upstash rate limit** — sending >100 req/sec from single workspace triggers rate-limit response; defaults to closed (deny) when Redis unavailable
12. **Inngest backlog alert** — synthetic queue depth >50 sustained for 10 min triggers PostHog alert
13. **R28 Cloudflare Workers NOT in active build** — wrangler-related code paths absent from staging deployment
14. **Stripe meter reconciliation** — backlog rows (`stripe_meter_event_id IS NULL`) cleared by R23 Inngest worker; partial index used (EXPLAIN)
15. **Provider Registry tier fallback** — Tier 1 simulated failure → Tier 2 succeeds → workflow completes; observability span records `viyo.r19.tier_used = 2`

---

## 10. Acceptance criteria (mechanical / binary)

- [ ] Repo file `/docs/research_specs/R21_INFRASTRUCTURE_v2.md` created via Manus directive
- [ ] Old file `/docs/research_specs/R21_INFRASTRUCTURE_DEPLOYMENT_ENTERPRISE.md` marked SUPERSEDED with pointer header (v1 content preserved)
- [ ] ZCBR Status header present: `PASSED 2026-05-12 by Architect Claude self-validation`
- [ ] §2 Locks invoked: 6, 13, 19, 20, 21 (note: Lock 21 does NOT apply)
- [ ] §3.3.3 documents AI provider credential boundary (R29 v2 Plugin Registry-managed)
- [ ] §5.2 documents Mastra inner / Inngest outer pattern per VVOW §8.3
- [ ] §5.4 documents D11 webhook dispatcher
- [ ] §6 R28 deferred status preserved per ratified PO Decision 4
- [ ] R-spec citations updated to v2: R19 v2, R20 v2, R24 v2, R29 v2 PAL, R31 v2, R17 v2, T46 v2
- [ ] CI grep tests in §9 land alongside implementation Bullets
- [ ] R-Spec Audit Table v1.5 row 5 status updates from MINOR FIX to PASS

---

## 11. Migration plan (v1 → v2)

The v1.0 was authored 2026-05-12 09:22 UTC. Infrastructure architecture is stable; v2 fixes are governance + citation + Lock invocations + new sections. No infrastructure changes required to ship v2 as a spec.

**Rollout sequence:**

1. Architect commits R21 v2 via Manus directive R21-V2-MINOR-FIX-001
2. R-Spec Audit Table v1.5 row 5 status updates from MINOR FIX to PASS at merge confirmation
3. B-XC.20 closes
4. Future B-0.01/0.05/0.08/0.09/0.10/0.19/0.20/0.21/2.37 Bullets cite R21 v2

No data migration. No infrastructure change.

---

## 12. Open items

1. **Doppler vs native secrets manager.** v1 §3 mentions Doppler as the secrets manager pattern. Final decision (Doppler vs Render-native vs Vercel-native) is operational and may be revisited per organizational preference. Captured for future PO ratification.
2. **R28 reactivation criteria.** §6 keeps R28 deferred per Decision 4. PO has not specified what traffic pattern would justify reactivation. Captured as forward-scope item for B-4.03 readiness.
3. **GitHub Environment naming.** R20 v2 §5.8 expects `staging-supabase` / `production-supabase` GitHub Environment names; final names confirmed at workflow authoring time.
4. **Render Background Worker scaling tier.** Current spec leaves auto-scale parameters tunable per traffic. PO + DevOps decision pending B-0.05 / B-0.08 substrate Bullets.
5. **Stripe meter dispatch frequency.** R23 Inngest cron currently TBD. v1.5 minor bump may pin frequency once R23 v2 ships.
6. **D11 webhook subscriber retry policy customization.** Webhook subscribers may want per-endpoint retry caps below the default 7. Captured as future minor version.
7. **Tier 3 GPU activation runbook.** B-4.02 Master Sequence Bullet covers admin-gated activation. Operational runbook (provisioning steps, model migration, observability checklist) deferred to that Bullet.

---

## 13. Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion audit log.

**Version triggers:**
- Major (v3): breaking change to topology (e.g., provider swap that affects every R-spec consumer), removal of a documented layer
- Minor (v2.x): additive (new providers added via Plugin Registry, new CI workflow steps, R28 reactivation, Tier 3 runbook addition, GitHub Environment naming lock-in)
- Patch (v2.x.y): clarifications, typo fixes, citation updates

**Re-validation:** Every 180 days per ZCBR HEADER_STALE, or immediately when any cited spec (R20 v2, R29 v2, R24 v2, R19 v2, R31 v2, R17 v2, T46 v2, VVOW §8) bumps minor or major version.

**Companion spec alignment:** When R23 v2 ships (CRIT MINOR FIX), R21 v2.x minor bump aligns Stripe meter dispatch references. When R22 v2 ships, R21 v2.x aligns auth surface references.

---

*End of R21 Infrastructure & Deployment Topology v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
