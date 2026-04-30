# R21 — Infrastructure & Deployment Topology (Enterprise Spec)

## 1. Executive Summary

This specification defines the production infrastructure topology for VIYO. The architecture is designed for global edge delivery, asynchronous high-volume background processing, and strict isolation between the frontend, backend, and AI execution layers.

**Key Cross-Spec Wiring:**
*   **R28 (Timer Service):** Deployed to Cloudflare Workers for edge proximity.
*   **R19 (LLM Architecture):** Connects to the Redis cache for rate limiting.
*   **R24 (Image Pipeline):** Uses Inngest for async orchestration.
*   **R20 (Database):** Connects to Supabase Postgres via connection pooling.

## 2. Global Topology Map

VIYO uses a composable infrastructure stack across three primary providers: Vercel (Frontend), Render (Backend/Workers), and Supabase (Database/Auth).

| Layer | Provider | Service | Purpose |
|-------|----------|---------|---------|
| **Frontend App** | Vercel | Next.js (App Router) | Admin UI, Dashboard, VEO Chat Interface |
| **Edge Compute** | Cloudflare | CF Workers | R28 Timer Service, image proxy, edge caching |
| **API Backend** | Render | Node.js Web Service | Main GraphQL/REST API, Webhook receivers |
| **Async Workers**| Render | Background Worker | Inngest worker instances for R24/R31/R23 jobs |
| **Database** | Supabase | PostgreSQL 15+ | Relational data, pgvector, RLS |
| **Authentication**| Supabase | GoTrue | User identity, JWT issuance |
| **Blob Storage** | Supabase | Storage (S3-compat) | Uploaded assets, generated images |
| **In-Memory** | Upstash | Redis | Rate limiting (R19), ephemeral caching |
| **Orchestration**| Inngest | Event-Driven Queue | Job scheduling, retries, fan-out execution |

## 3. Environment Variable Configuration

The following environment variables must be securely injected into the respective environments via Doppler or native provider secrets management.

### 3.1 Global Variables (All Environments)
```env
NODE_ENV="production"
VIYO_APP_URL="https://app.viyo.ai"
VIYO_API_URL="https://api.viyo.ai"
```

### 3.2 Database & Auth (Vercel & Render)
```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhb..."
SUPABASE_SERVICE_ROLE_KEY="eyJhb..." # NEVER EXPOSE TO FRONTEND
DATABASE_URL=<set-in-provider-secret-store>
```

### 3.3 External APIs (Render Workers Only)
```env
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
IDEOGRAM_API_KEY="..."
GOOGLE_CLOUD_API_KEY="..." # For NanoBanana/Gemini
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
INNGEST_EVENT_KEY=<set-in-provider-secret-store>
INNGEST_SIGNING_KEY=<set-in-provider-secret-store>
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## 4. Continuous Integration & Deployment (CI/CD)

VIYO uses GitHub Actions for CI and native provider hooks for CD.

### 4.1 Branch Strategy
*   `main` -> Production (auto-deploys to Vercel/Render)
*   `staging` -> Staging (auto-deploys to preview environments)
*   `feat/*` -> Ephemeral preview deployments on Vercel

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
```

## 5. Inngest Worker Architecture (R24, R31, R23)

Heavy lifting (image generation, data scraping, Stripe syncing) NEVER runs on the Vercel edge or main API thread. It runs on dedicated Render Background Workers via Inngest.

```typescript
// src/inngest/client.ts
import { Inngest } from 'inngest';

// Initialize the client
export const inngest = new Inngest({ 
  id: 'viyo-core-engine',
  eventKey: process.env.INNGEST_EVENT_KEY
});

// src/inngest/server.ts (Runs on Render Worker)
import { serve } from 'inngest/express';
import express from 'express';
import { processIngestedEmailImage } from './functions/r24-image-pipeline';
import { extractProductData } from './functions/r31-product-scraper';
import { syncStripeUsage } from './functions/r23-cost-sync';

const app = express();

app.use('/api/inngest', serve({
  client: inngest,
  functions: [
    processIngestedEmailImage,
    extractProductData,
    syncStripeUsage
  ]
}));

app.listen(3000, () => console.log('Inngest Worker running on port 3000'));
```

## 6. Edge Compute Architecture (R28 Timer Service)

The R28 Timer Service requires sub-50ms latency globally to render countdown SVGs accurately. It is deployed to Cloudflare Workers.

```toml
# wrangler.toml
name = "viyo-timer-service"
main = "src/index.ts"
compatibility_date = "2024-04-23"
compatibility_flags = ["nodejs_compat"]

[placement]
mode = "smart"

[env.production]
# Bound to custom domain
route = { pattern = "timer.viyo.ai/*", zone_name = "viyo.ai" }

[vars]
SUPABASE_URL = "https://[PROJECT_REF].supabase.co"
# SUPABASE_SERVICE_KEY injected via `wrangler secret put`
```

## 7. Scaling & High Availability

1.  **Database:** Supabase is configured with PgBouncer connection pooling. The Vercel frontend uses the transaction pooler (port 6543) to prevent connection exhaustion during traffic spikes.
2.  **Rate Limiting:** Upstash Redis handles global rate limiting for API endpoints, protecting against DDoS and abusive LLM generation requests (as defined in R19).
3.  **Job Queues:** Inngest handles backpressure. If the Ideogram API goes down, Inngest automatically retries with exponential backoff without crashing the VIYO workers.
workers.
