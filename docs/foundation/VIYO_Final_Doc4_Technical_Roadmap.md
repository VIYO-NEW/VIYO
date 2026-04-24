# PART D — TECHNICAL EXECUTION ROADMAP (Step-by-Step Build Guide)

Each phase is dependency-ordered. Do not start a phase until its prerequisites are met.

## Architectural & Database Changes

This document reflects the following key architectural and database changes as per Research 24, 25, and 26:

### Image Generation Pipeline (Research 24)

- The previous single-model (NanoBanana) image generation process has been replaced with a multi-model pipeline:
  - **Visual Intent Router:** A new initial step to determine the type of image required.
  - **Gemini 3.1 Flash:** Used for photographic images.
  - **Ideogram 3.0:** Used for images containing text and for UI mockups.
  - **Imagen 4:** Used for upscaling generated images.
- **Self-Hosted Countdown Timer Service Integration:** Countdown timers can now be embedded in emails via the Self-Hosted Countdown Timer Service.

### Video Ingestion Module (Research 25)

- A new video ingestion module has been added, utilizing OpenClaw skills for local processing (download, transcription, frame extraction, OCR).
- **New Database Tables:**
  - `video_ingestion_jobs`: Tracks the status of video processing jobs.
  - `video_extracted_emails`: Stores emails extracted from video content.
- **New Inngest Function:**
  - `video-intel.analyze`: An Inngest function to process and analyze video intelligence.

### Creative Concept Mode (Research 26)

- The campaign generation process can now start with a creative concept pitch.
- **New Database Tables:**
  - `concept_pitches`: Stores the three pitched creative concepts (Safe, Pattern Interrupt, Wildcard).
  - `concept_selections`: Records the user's chosen concept.
- **New UI Components:**
  - A "Pitch Me Concepts" button on the campaign creation page.
  - A "Creative Autonomy" setting for brands to control the pitching process.

---

## Phase 0: Foundation & Environment (Week 1)

**Goal:** Monorepo scaffolded, databases running, observability wired, external accounts submitted.

### Step 0.1 — Scaffold the Monorepo

**Who does this:** Lead engineer  
**Why:** All VIYO packages (frontend, worker, shared types, MJML compiler) live in one repository for atomic deployments and shared TypeScript types.

```bash
# Initialize Turborepo monorepo
pnpm dlx create-turbo@latest viyo-monorepo
cd viyo-monorepo

# Create workspace structure
mkdir -p apps/web          # Vite React SPA (Vercel)
mkdir -p apps/worker       # Render Node.js worker
mkdir -p apps/admin        # Admin Portal (Vercel, same repo)
mkdir -p packages/core-types        # Shared Zod schemas + Drizzle schema
mkdir -p packages/mjml-compiler     # viyo-mjml-engine
mkdir -p packages/design-system     # Tailwind tokens + email design tokens
mkdir -p packages/platform-adapters # Shopify + Klaviyo PAL adapters
mkdir -p packages/video-ingestion   # OpenClaw skills for video processing

# Root package.json workspace config
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Install shared dev dependencies
pnpm add -w -D typescript @types/node turbo vitest playwright
```

### Step 0.2 — Local Development Environment

**Who does this:** All engineers  
**Why:** Every engineer needs an identical local environment. Supabase provides a local PostgreSQL + Auth + Realtime stack.

```bash
# Install Supabase CLI (once, globally)
npm install -g supabase

# Initialize Supabase in the monorepo root
supabase init

# Start local Supabase instance (Docker required)
supabase start
# This starts: PostgreSQL on 54322, Auth on 54321, Studio on 54323

# Apply Drizzle schema to local DB
pnpm --filter core-types db:push
# (package.json script: "db:push": "drizzle-kit push:pg")

# Start all apps in dev mode
pnpm dev
# Runs: Vite dev server (port 5173) + Worker Express server (port 3000) + Admin (port 5174)

# Start local Inngest dev server (in a separate terminal)
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

### Step 0.3 — OpenTelemetry Bootstrap

**Who does this:** Lead engineer  
**Why:** Must be initialized before the app starts to capture all traces from day one. Missing observability at launch means blind spots in production.  
**File location:** `apps/worker/src/instrumentation.ts` (loaded before any other imports)

```typescript
// apps/worker/src/instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'viyo-worker',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'https://trace.agent.datadoghq.com/v1/traces',
    headers: { 'DD-API-KEY': process.env.DD_API_KEY! },
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => { sdk.shutdown(); });
```

```typescript
// apps/worker/src/index.ts — load instrumentation FIRST
import './instrumentation';
import express from 'express';
import { serve } from 'inngest/express';
import { inngest } from './inngest/client';
import { generateCampaign } from './inngest/functions/generate-campaign';
import { handleStripeWebhook } from './inngest/functions/stripe-webhook';
import { syncShopify } from './inngest/functions/sync-shopify';
import { syncKlaviyo } from './inngest/functions/sync-klaviyo';
import { computeSto } from './inngest/functions/compute-sto';
import { processTopBrainEmail } from './inngest/functions/top-brain';
import { videoIntelAnalyze } from './inngest/functions/video-intel-analyze';

const app = express();
app.use(express.json());

// Expose the single Inngest endpoint
app.use('/api/inngest', serve({
  client: inngest,
  functions: [
    generateCampaign,
    handleStripeWebhook,
    syncShopify,
    syncKlaviyo,
    computeSto,
    processTopBrainEmail,
    videoIntelAnalyze,
  ]
}));

app.listen(process.env.PORT || 3000, () => {
  console.log(`VIYO Worker listening on port ${process.env.PORT || 3000}`);
});
```

### Step 0.4 — Submit External Accounts

**Who does this:** Founder / Operator (immediately, do not wait)

```
ACTION ITEMS (do these now, they block production):
1. Shopify Partner Portal → Create Unlisted Public App
   - App name: VIYO
   - Redirect URL: https://app.viyo.email/api/v1/auth/shopify/callback
   - Requested scopes: read_products, read_inventory, read_orders
   - Submit for review (3-7 business days)

2. Google Cloud Console → Create project "viyo-production"
   - Enable Vertex AI API
   - Create Service Account with Vertex AI User role
   - Download JSON key, base64 encode: base64 -i key.json | pbcopy
   - Request Imagen 4 quota increase: 100 requests/minute
   - Timeline: 2-4 business days

3. Stripe Dashboard → Complete KYC/KYB verification
   - Create Products: "Starter Pack" (30K credits / $29), "Growth Pack" (100K / $79), "Pro Pack" (300K / $199), "Agency Pack" (700K / $399)
   - Note the Price IDs (price_1Q...) for env vars
   - Configure webhook endpoint: https://app.viyo.email/api/v1/webhooks/stripe
   - Events to listen: checkout.session.completed, charge.refunded

4. Klaviyo Developer Portal → Create OAuth App (instant)
   - Redirect URI: https://app.viyo.email/api/v1/auth/klaviyo/callback
   - Scopes: campaigns:read, campaigns:write, templates:read, templates:write,
             lists:read, segments:read, metrics:read

5. Cloudflare → Create R2 bucket "viyo-assets"
   - Add custom domain: assets.viyo.email → bucket
   - Create API token with R2 Object Write permissions

67. Resend → Verify sending domain: viyo.email
   - Add DNS records provided by Resend
   - Set RESEND_FROM_EMAIL=noreply@viyo.email

8. Ideogram → Request API Access
   - URL: https://ideogram.ai/api
   - Store key in IDEOGRAM_API_KEY

9. Self-Hosted Timer Service → Sign up for API Account ($0/mo (self-hosted))
   - URL: https://www.viyo-timer-service.com/
   - Store key in SENDTRIC_API_KEY```

---

## Phase 1: Core Integrations (Weeks 2-3)

**Goal:** Shopify OAuth, Klaviyo OAuth, and initial data sync fully working end-to-end.

### Step 1.1 — Shopify OAuth Route

**Who builds this:** Backend engineer  
**Why this order:** Without Shopify connected, the product catalog is empty and generation cannot start. This is the first real data entry point.  
**File location:** `apps/web/src/api/v1/auth/shopify/`

```typescript
// apps/web/api/v1/auth/shopify/initiate.ts
import { NextRequest } from 'next/server'; // Vercel serverless
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(req: NextRequest) {
  const shop = new URL(req.url).searchParams.get('shop');
  if (!shop) return new Response('Missing shop param', { status: 400 });

  // Validate shop domain format
  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
    return new Response('Invalid shop domain', { status: 400 });
  }

  // Generate and store state nonce (CSRF protection)
  const state = crypto.randomBytes(16).toString('hex');
  await redis.set(`shopify_oauth_state:${state}`, '1', { ex: 600 }); // 10 min TTL

  const scopes = 'read_products,read_inventory,read_orders';
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/auth/shopify/callback`;

  const authUrl = `https://${shop}/admin/oauth/authorize?` + new URLSearchParams({
    client_id: process.env.SHOPIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
    'grant_options[]': 'per-user', // offline token
  });

  return Response.redirect(authUrl);
}
```

```typescript
// apps/web/api/v1/auth/shopify/callback.ts
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { Redis } from '@upstash/redis';
import { db } from '@/lib/db';
import { shopifyConnections, brands } from '@viyo/core-types/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { encrypt } from '@/lib/encryption';

### Step 1.4 — Klaviyo Token Refresh (JIT Lazy Refresh)

```typescript
// packages/platform-adapters/src/klaviyo/auth.ts
import { db } from '@viyo/core-types/db';
import { klaviyoConnections } from '@viyo/core-types/schema';
import { eq } from 'drizzle-orm';
import { decrypt, encrypt } from '@viyo/core-types/encryption';

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export async function getValidKlaviyoToken(brandId: string): Promise<string> {
  const [conn] = await db.select().from(klaviyoConnections).where(eq(klaviyoConnections.brand_id, brandId));

  if (!conn) throw new Error(`No Klaviyo connection found for brand ${brandId}`);

  // Check if token needs refresh
  const needsRefresh = conn.expires_at.getTime() - Date.now() < REFRESH_BUFFER_MS;

  if (!needsRefresh) {
    return decrypt(conn.access_token_encrypted);
  }

  // Refresh the token
  const refreshToken = decrypt(conn.refresh_token_encrypted);

  const tokenRes = await fetch('https://a.klaviyo.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.KLAVIYO_CLIENT_ID}:${process.env.KLAVIYO_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const { access_token, refresh_token: new_refresh_token, expires_in } = await tokenRes.json();

  await db.update(klaviyoConnections).set({
    access_token_encrypted: encrypt(access_token),
    refresh_token_encrypted: encrypt(new_refresh_token),
    expires_at: new Date(Date.now() + expires_in * 1000),
  }).where(eq(klaviyoConnections.brand_id, brandId));

  return access_token;
}
```

---

## Phase 2: AI Generation DAG (Weeks 4-5)

**Goal:** End-to-end generation working in the worker. Campaign brief in → compiled JSON schema out.

### Step 2.1 — Inngest Worker Setup on Render

**Who builds this:** DevOps / Lead engineer  
**Why Render:** Persistent Node.js process required for 30-60 second DAG execution. Vercel serverless times out at 15 seconds.

```typescript
// apps/worker/src/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'viyo-worker',
  signingKey: process.env.INNGEST_SIGNING_KEY!,
  eventKey: process.env.INNGEST_EVENT_KEY!,
});
```

```typescript
// apps/worker/src/index.ts — complete server setup
import './instrumentation';     // MUST be first import
import express from 'express';
import { serve } from 'inngest/express';
import { inngest } from './inngest/client';
import { generateCampaign } from './inngest/functions/generate-campaign';
import { handleStripeWebhook } from './inngest/functions/stripe-webhook';
import { syncShopify } from './inngest/functions/sync-shopify';
import { syncKlaviyo } from './inngest/functions/sync-klaviyo';
import { computeSto } from './inngest/functions/compute-sto';
import { processTopBrainEmail } from './inngest/functions/top-brain';
import { videoIntelAnalyze } from './inngest/functions/video-intel-analyze';

const app = express();
app.use(express.json());

// Health check for Render
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Inngest endpoint — Inngest Cloud sends all job events here
app.use('/api/inngest', serve({
  client: inngest,
  functions: [generateCampaign, handleStripeWebhook, syncShopify, syncKlaviyo, computeSto, processTopBrainEmail],
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VIYO Worker ready on :${PORT}`));
```

### Step 2.2 — Dockerfile for Render

```dockerfile
# apps/worker/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the worker
RUN pnpm --filter worker build

# ---- Production image ----
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Render deployment configuration:**
- Service type: Web Service
- Build command: (handled by Dockerfile)
- Start command: (handled by Dockerfile CMD)
- Environment: Set all worker env vars in Render dashboard
- Health check path: `/health`
- Auto-deploy: on push to `main` branch

### Step 2.3 — Context Hydration Step

**Who builds this:** Backend engineer  
**Why:** Every brain needs brand profile, voice, products, and audience. Hydration is a single DB query step, not repeated 7 times.

```typescript
// apps/worker/src/inngest/steps/hydrate.ts
import { db } from '../../db';
import { brands, brandVisualSystems, brandVoiceHistory, products, audienceMap, brandState, winningFormulas } from '@viyo/core-types/schema';
import { eq, desc } from 'drizzle-orm';

export interface HydratedContext {
  brand: typeof brands.$inferSelect;
  visualSystem: typeof brandVisualSystems.$inferSelect | null;
  voiceProfile: any;
  products: (typeof products.$inferSelect)[];
  segments: (typeof audienceMap.$inferSelect)[];
  brandState: typeof brandState.$inferSelect | null;
  winningFormulas: (typeof winningFormulas.$inferSelect)[];
}

export async function hydrateContext(sessionId: string): Promise<HydratedContext> {
  // Get session to find brand_id
  const [session] = await db.select().from(campaignSessions).where(eq(campaignSessions.id, sessionId));

  const [brand] = await db.select().from(brands).where(eq(brands.id, session.brand_id));
  const [visualSystem] = await db.select().from(brandVisualSystems).where(eq(brandVisualSystems.brand_id, session.brand_id));
  const [latestVoice] = await db.select().from(brandVoiceHistory)
    .where(eq(brandVoiceHistory.brand_id, session.brand_id))
    .orderBy(desc(brandVoiceHistory.created_at))
    .limit(1);
  const productList = await db.select().from(products).where(eq(products.brand_id, session.brand_id));
  const segments = await db.select().from(audienceMap).where(eq(audienceMap.brand_id, session.brand_id));
  const [state] = await db.select().from(brandState).where(eq(brandState.brand_id, session.brand_id));
  const formulas = await db.select().from(winningFormulas).where(eq(winningFormulas.brand_id, session.brand_id));

  return { brand, visualSystem, voiceProfile: latestVoice?.voice_profile_json, products: productList, segments, brandState: state ?? null, winningFormulas: formulas };
}
```

---

## Phase 3: Email Compilation (Week 6)

**Goal:** viyo-mjml-engine working with the new composable section architecture, 75KB size check enforced.

### Step 3.1 — viyo-mjml-engine Implementation

**Who builds this:** Full-stack engineer  
**Why:** This is the critical deterministic component. No AI touches the final HTML. LLM output is JSON; the compiler produces the email.  
**Location:** `packages/mjml-compiler/src/index.ts`

```typescript
// packages/mjml-compiler/src/index.ts
import mjml2html from 'mjml';
import path from 'path';
import fs from 'fs';

export interface CompileInput {
  sections: { section_id: string; slots: Record<string, string> }[];
  designTokens: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
    buttonBorderRadius: string;
    logoUrl: string;
  };
}

export interface CompileOutput {
  html: string;
  sizeBytes: number;
}

const MAX_SIZE_BYTES = 75 * 1024; // 75KB

export function compileEmail(input: CompileInput): CompileOutput {
  const assembledMjml = input.sections.map(section => {
    const sectionPath = path.join(__dirname, 'sections', `${section.section_id}.mjml`);
    if (!fs.existsSync(sectionPath)) {
      throw new Error(`Unknown section: ${section.section_id}`);
    }
    let sectionMjml = fs.readFileSync(sectionPath, 'utf-8');
    for (const [key, value] of Object.entries(section.slots)) {
      sectionMjml = sectionMjml.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
    }
    return sectionMjml;
  }).join('\n');

  let finalMjml = `<mjml><mj-body>${assembledMjml}</mj-body></mjml>`;

  // 3. Inject design tokens
  finalMjml = finalMjml
    .replace(/\{\{primaryColor\}\}/g, input.designTokens.primaryColor)
    .replace(/\{\{backgroundColor\}\}/g, input.designTokens.backgroundColor)
    .replace(/\{\{textColor\}\}/g, input.designTokens.textColor)
    .replace(/\{\{headingFont\}\}/g, input.designTokens.headingFont)
    .replace(/\{\{bodyFont\}\}/g, input.designTokens.bodyFont)
    .replace(/\{\{buttonBorderRadius\}\}/g, input.designTokens.buttonBorderRadius)
    .replace(/\{\{logoUrl\}\}/g, input.designTokens.logoUrl);

  // 4. Compile MJML → HTML
  const { html, errors } = mjml2html(finalMjml, {
    validationLevel: 'strict',
    keepComments: false,
    minify: true,
  });

  if (errors.length > 0) {
    throw new Error(`MJML compilation failed: ${errors[0].message}`);
  }

  // 5. Enforce 75KB size limit
  const sizeBytes = Buffer.byteLength(html, 'utf-8');
  if (sizeBytes > MAX_SIZE_BYTES) {
    throw new ClippingError(
      `Compiled email is ${sizeBytes} bytes (limit: ${MAX_SIZE_BYTES}). Simplify layout.`,
      sizeBytes
    );
  }

  return { html, sizeBytes };
}

export class ClippingError extends Error {
  constructor(message: string, public sizeBytes: number) {
    super(message);
    this.name = 'ClippingError';
  }
}
```

---

## Phase 4: The Frontend Application (Weeks 7-8)

**Goal:** Full user-facing UI — onboarding, integrations, brief form, Orb progress, Preview UI.

### Step 4.1 — Vite React SPA Setup

```bash
# Initialize Vite React app inside the monorepo
cd apps/web
pnpm create vite . --template react-ts

# Install dependencies
pnpm add @supabase/supabase-js @tanstack/react-router zustand @radix-ui/react-dialog
pnpm add tailwindcss postcss autoprefixer
pnpm add posthog-js
pnpm add -D @types/react @types/react-dom
```

```typescript
// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## Phase 5: Billing & Deployment (Week 9)

**Goal:** Production Stripe connected, credit packs purchasable, and Klaviyo deployment working.

### Step 5.1 — Stripe Webhook Handler (Inngest Function)

```typescript
// apps/worker/src/inngest/functions/stripe-webhook.ts
import { inngest } from '../client';
import Stripe from 'stripe';
import { db } from '../../db';
import { stripeEvents, brands, creditLedger } from '@viyo/core-types/schema';
import { eq, sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const handleStripeWebhook = inngest.createFunction(
  { id: 'stripe-webhook-handler' },
  { event: 'stripe/webhook.received' },
  async ({ event, step }) => {
    const { signature, body } = event.data;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // 1. Verify signature
    const stripeEvent = await step.run('verify-signature', () => {
      return stripe.webhooks.constructEvent(body, signature, endpointSecret);
    });

    // Idempotency: check if we've processed this event before
    const isDuplicate = await step.run('check-idempotency', async () => {
      const [existing] = await db.select().from(stripeEvents).where(eq(stripeEvents.event_id, stripeEvent.id));
      return !!existing;
    });

    if (isDuplicate) {
      return { status: 'ignored', reason: 'duplicate_event' };
    }

    await step.run('log-event', () => {
      return db.insert(stripeEvents).values({
        event_id: stripeEvent.id,
        type: stripeEvent.type,
      });
    });

    // 2. Process event by type
    if (stripeEvent.type === 'checkout.session.completed') {
      await step.run('process-top-up', async () => {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const brandId = session.client_reference_id!;
        const packId = session.metadata?.pack_id ?? 'starter';

        // Map pack ID to credit amount
        const PACK_CREDITS: Record<string, number> = {
          starter: 30_000,
          growth:  100_000,
          pro:     300_000,
          agency:  700_000,
        };
        const creditsToAdd = PACK_CREDITS[packId] ?? 30_000;

        // Update credit balance
        await db.update(brands)
          .set({ credit_balance: sql`${brands.credit_balance} + ${creditsToAdd}` })
          .where(eq(brands.id, brandId));

        // Log transaction (immutable ledger entry)
        await db.insert(creditLedger).values({
          brand_id: brandId,
          transaction_type: 'top_up',
          credits_amount: creditsToAdd,
          stripe_event_id: stripeEvent.id,
          description: `Credit pack purchase: ${packId} (${creditsToAdd.toLocaleString()} credits)`,
        });
      });
    }
  }
);
```

### Step 5.2 — Stripe Checkout Session (API Route)

```typescript
// apps/web/api/v1/billing/checkout.ts
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PACK_PRICES: Record<string, { priceId: string; credits: number; label: string }> = {
  starter: { priceId: process.env.STRIPE_PRICE_ID_STARTER!, credits: 30_000,  label: 'Starter Pack' },
  growth:  { priceId: process.env.STRIPE_PRICE_ID_GROWTH!,  credits: 100_000, label: 'Growth Pack'  },
  pro:     { priceId: process.env.STRIPE_PRICE_ID_PRO!,     credits: 300_000, label: 'Pro Pack'     },
  agency:  { priceId: process.env.STRIPE_PRICE_ID_AGENCY!,  credits: 700_000, label: 'Agency Pack'  },
};

export async function POST(req: NextRequest) {
  const { packId, brandId } = await req.json();
  const pack = PACK_PRICES[packId];
  if (!pack) return new Response('Invalid pack ID', { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: pack.priceId, quantity: 1 }],
    client_reference_id: brandId,
    metadata: { pack_id: packId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?cancelled=true`,
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
}
```

### Step 5.3 — Klaviyo 3-Step Campaign Deploy

```typescript
// packages/platform-adapters/src/klaviyo/deploy.ts
import { getValidKlaviyoToken } from './auth';

const KLAVIYO_BASE = 'https://a.klaviyo.com/api';
const REVISION = process.env.KLAVIYO_API_REVISION!; // '2024-02-15'

export async function deployToKlaviyo(brandId: string, params: {
  compiledHtml: string;
  subjectLine: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  listId: string;
  scheduledAt?: string;
}) {
  const token = await getValidKlaviyoToken(brandId);
  const headers = {
    'Authorization': `Bearer ${token}`,
    'revision': REVISION,
    'Content-Type': 'application/json',
  };

  // Step 1: Create email template
  const templateRes = await fetch(`${KLAVIYO_BASE}/templates/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'template',
        attributes: {
          name: `VIYO Generated — ${new Date().toISOString()}`,
          html: params.compiledHtml,
        },
      },
    }),
  });
  const { data: template } = await templateRes.json();

  // Step 2: Create campaign
  const campaignRes = await fetch(`${KLAVIYO_BASE}/campaigns/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'campaign',
        attributes: {
          name: `VIYO — ${params.subjectLine}`,
          channel: 'email',
          audiences: { included: [params.listId] },
          send_options: { use_smart_sending: true },
          tracking_options: { is_tracking_clicks: true, is_tracking_opens: true },
          send_strategy: {
            method: params.scheduledAt ? 'static' : 'immediate',
            ...(params.scheduledAt ? { options_static: { datetime: params.scheduledAt } } : {}),
          },
        },
        relationships: {
          'campaign-messages': {
            data: [{
              type: 'campaign-message',
              attributes: {
                label: 'Email',
                channel: 'email',
                content: {
                  subject: params.subjectLine,
                  preview_text: params.previewText,
                  from_email: params.fromEmail,
                  from_label: params.fromName,
                },
                relationships: { template: { data: { type: 'template', id: template.id } } },
              },
            }],
          },
        },
      },
    }),
  });
  const { data: campaign } = await campaignRes.json();

  // Step 3: Create send job (triggers actual send/schedule)
  await fetch(`${KLAVIYO_BASE}/campaign-send-jobs/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'campaign-send-job',
        relationships: { campaign: { data: { type: 'campaign', id: campaign.id } } },
      },
    }),
  });

  return campaign.id;
}
```

---

## Phase 6 & 7: QA, Launch Readiness, Post-Launch (Weeks 10+)

### Pre-Launch Checklist

```
SECURITY:
[ ] RLS enabled and tested on every table (test with a different brand's JWT — should get 0 rows)
[ ] HMAC validation tested with tampered Shopify callbacks (should return 401)
[ ] ENCRYPTION_KEY rotation procedure documented
[ ] All env vars validated at boot (t3-env) — confirm app crashes gracefully if key is missing
[ ] Rate limiting tested: 101 requests/min from same brand_id should be blocked

BILLING:
[ ] Stripe webhook signature validation tested with wrong secret (should reject)
[ ] Double-delivery test: send same Stripe event twice — second should be silently rejected
[ ] Zero-token generation attempt returns 402, no session created, no token deducted
[ ] Refund flow tested: manually fail a generation, confirm token balance restored

GENERATION:
[ ] End-to-end generation test with real Shopify + Klaviyo accounts
[ ] 75KB MJML limit test: create an email that exceeds limit, confirm ClippingError returned
[ ] VeriClaw failure test: force a hallucinated offer, confirm retry and refund behavior
[ ] Inngest checkpoint test: kill worker mid-generation, confirm resume from checkpoint

OBSERVABILITY:
[ ] Datadog dashboard shows generation traces end-to-end
[ ] PagerDuty alert fires when Supabase connection drops
[ ] LLM cost per campaign tracked in llm_usage_events
[ ] PostHog events flowing for all 8 tracked events

EXTERNAL:
[ ] Shopify Partner App approved and live
[ ] Stripe KYC complete
[ ] Vertex AI quota sufficient for launch volume
[ ] Resend domain verified, test email delivered to inbox
```


---



---

