# R23 — Cost Reconciliation Engine Enterprise Spec

## 1. Executive Summary
The Cost Reconciliation Engine is the financial nervous system of VIYO. It tracks, attributes, and reconciles every API call (OpenAI, Anthropic, Ideogram, Gemini, Stripe) across the platform. It enforces margin floors, manages token allocations per tier, handles multi-currency billing, and provides granular cost visibility at the workspace, user, and campaign levels.

## 2. Core Database Schema

### 2.1 Usage Ledger
The `token_usage_logs` table is the immutable append-only ledger for all API costs. It is tenant-scoped by `workspace_id` per R20 and Architecture Lock V7.1.

```sql
CREATE TABLE token_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL, -- e.g., 'gpt-4o', 'gemini-1.5-pro', 'ideogram-v2'
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    images_generated INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 6) NOT NULL,
    context VARCHAR(255) NOT NULL, -- e.g., 'cmo_brain_pitch', 'hero_image_gen'
    stripe_meter_event_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_ws_date ON token_usage_logs(workspace_id, created_at DESC);
CREATE INDEX idx_usage_unsent ON token_usage_logs(stripe_meter_event_id) WHERE stripe_meter_event_id IS NULL;
```

### 2.2 Workspace Token Balances
Tracks the current billing cycle's allocation and usage for each workspace.

```sql
CREATE TABLE token_balances (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    tokens_allocated BIGINT NOT NULL,
    tokens_used BIGINT DEFAULT 0,
    images_allocated INTEGER NOT NULL,
    images_used INTEGER DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ NOT NULL,
    billing_cycle_end TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Token Deduction Engine (TypeScript)

### 3.1 Core Deduction Logic
This function is called by every Brain and Pipeline after an API call completes.

```typescript
import { supabase } from '@/lib/supabase';

export async function deductUsage(params: {
  workspaceId: string;
  userId?: string;
  campaignId?: string;
  provider: string;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  imagesGenerated?: number;
  costUsd: number;
  context: string;
}) {
  const { workspaceId, userId, campaignId, provider, model, tokensInput = 0, tokensOutput = 0, imagesGenerated = 0, costUsd, context } = params;

  // 1. Log to immutable ledger
  const { error: ledgerError } = await supabase.from('token_usage_logs').insert({
    workspace_id: workspaceId,
    user_id: userId,
    campaign_id: campaignId,
    provider,
    model,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    images_generated: imagesGenerated,
    cost_usd: costUsd,
    context
  });

  if (ledgerError) throw new Error(`Ledger insert failed: ${ledgerError.message}`);

  // 2. Update running balance atomically via RPC
  const { data, error: balanceError } = await supabase.rpc('increment_usage_balance', {
    p_workspace_id: workspaceId,
    p_tokens_used: tokensInput + tokensOutput,
    p_images_used: imagesGenerated
  });

  if (balanceError) throw new Error(`Balance update failed: ${balanceError.message}`);

  // 3. Enforce limits (allow 10% soft overage for Enterprise)
  if (data.tokens_used > data.tokens_allocated * 1.1) {
    throw new Error('Token allocation exceeded. Please upgrade your plan.');
  }

  return data;
}
```

### 3.2 RPC Function for Atomic Updates
```sql
CREATE OR REPLACE FUNCTION increment_usage_balance(
  p_workspace_id UUID,
  p_tokens_used BIGINT,
  p_images_used INTEGER
) RETURNS TABLE (tokens_used BIGINT, tokens_allocated BIGINT, images_used INTEGER, images_allocated INTEGER) AS $$
BEGIN
  UPDATE token_balances
  SET 
    tokens_used = token_balances.tokens_used + p_tokens_used,
    images_used = token_balances.images_used + p_images_used,
    updated_at = NOW()
  WHERE workspace_id = p_workspace_id
  RETURNING token_balances.tokens_used, token_balances.tokens_allocated, token_balances.images_used, token_balances.images_allocated
  INTO tokens_used, tokens_allocated, images_used, images_allocated;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

## 4. Cost Configuration & Margin Calculation

### 4.1 Per-Model Cost Table
Maintained in code to ensure zero latency during generation.

```typescript
export const MODEL_COSTS = {
  'gpt-4o': { inputPer1k: 0.005, outputPer1k: 0.015 },
  'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  'gemini-1.5-pro': { inputPer1k: 0.0035, outputPer1k: 0.0105 },
  'gemini-1.5-flash': { inputPer1k: 0.000075, outputPer1k: 0.0003 },
  'claude-3.5-sonnet': { inputPer1k: 0.003, outputPer1k: 0.015 },
  'ideogram-v2': { perImage: 0.08 },
  'imagen-3': { perImage: 0.03 }
};

export function calculateCost(model: keyof typeof MODEL_COSTS, inputTokens = 0, outputTokens = 0, images = 0): number {
  const costs = MODEL_COSTS[model];
  if ('perImage' in costs) {
    return images * costs.perImage;
  } else {
    return (inputTokens / 1000) * costs.inputPer1k + (outputTokens / 1000) * costs.outputPer1k;
  }
}
```

## 5. Stripe Integration & Billing Cycles

### 5.1 Webhook Handler
Handles invoice payments and resets balances.

```typescript
import { Stripe } from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!workspace) return;

  const allocation = getTokenAllocationForTier(workspace.subscription_tier);

  await supabase.from('token_balances').update({
    tokens_allocated: allocation.tokens,
    tokens_used: 0,
    images_allocated: allocation.images,
    images_used: 0,
    billing_cycle_start: new Date(invoice.period_start * 1000).toISOString(),
    billing_cycle_end: new Date(invoice.period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }).eq('workspace_id', workspace.id);
}

function getTokenAllocationForTier(tier: string) {
  switch(tier) {
    case 'starter': return { tokens: 1000000, images: 100 };
    case 'growth': return { tokens: 6000000, images: 600 };
    case 'agency': return { tokens: 23000000, images: 2300 };
    case 'enterprise': return { tokens: 100000000, images: 10000 };
    default: return { tokens: 1000000, images: 100 };
  }
}
```

## 6. Nightly Reconciliation Job (Inngest)
Compares internal ledger against provider APIs to catch discrepancies.

```typescript
import { inngest } from '@/lib/inngest';
import { fetchOpenAIUsage, fetchAnthropicUsage } from '@/lib/api-clients';

export const costReconciliationJob = inngest.createFunction(
  { id: 'daily-cost-reconciliation' },
  { cron: '0 2 * * *' }, // 2 AM UTC daily
  async ({ step }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const internalCost = await step.run('calculate-internal-cost', async () => {
      const { data } = await supabase
        .from('token_usage_logs')
        .select('cost_usd')
        .gte('created_at', `${dateStr}T00:00:00Z`)
        .lt('created_at', `${dateStr}T23:59:59Z`);
      
      return data.reduce((sum, row) => sum + Number(row.cost_usd), 0);
    });

    const actualCost = await step.run('fetch-provider-costs', async () => {
      const openaiCost = await fetchOpenAIUsage(dateStr);
      const anthropicCost = await fetchAnthropicUsage(dateStr);
      return openaiCost + anthropicCost;
    });

    await step.run('compare-and-alert', async () => {
      const discrepancy = Math.abs(internalCost - actualCost) / (actualCost || 1);
      
      if (discrepancy > 0.05) { // 5% threshold
        await sendSlackAlert(`Cost Anomaly: Internal $${internalCost}, Actual $${actualCost}. Discrepancy: ${(discrepancy * 100).toFixed(2)}%`);
      }
    });
  }
);
```

### 6.1 Provider Usage Fetching (OpenAI & Anthropic)
These implementations fetch actual usage data from the provider APIs for reconciliation.

```typescript
import { z } from 'zod';

const OpenAIUsageSchema = z.object({
  data: z.array(z.object({
    n_context_tokens_total: z.number(),
    n_generated_tokens_total: z.number()
  }))
});

export async function fetchOpenAIUsage(dateStr: string): Promise<number> {
  try {
    const response = await fetch(`https://api.openai.com/v1/usage?date=${dateStr}`, {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    
    if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
    
    const data = await response.json();
    const parsed = OpenAIUsageSchema.parse(data);
    
    let totalCost = 0;
    for (const record of parsed.data) {
      // Approximate blended cost for calculation
      totalCost += (record.n_context_tokens_total / 1000) * 0.005;
      totalCost += (record.n_generated_tokens_total / 1000) * 0.015;
    }
    
    return totalCost;
  } catch (error) {
    console.error('Failed to fetch OpenAI usage:', error);
    throw new Error(`Reconciliation failed: Could not fetch OpenAI usage for ${dateStr}`);
  }
}

export async function fetchAnthropicUsage(dateStr: string): Promise<number> {
  // Anthropic does not currently provide a daily usage API endpoint in the same way.
  // This is a placeholder for when their API supports it, or for querying a proxy layer.
  // Currently, we rely on the internal ledger for Anthropic.
  console.log(`Anthropic usage fetch requested for ${dateStr}. Relying on internal ledger.`);
  return 0; 
}
```

### 6.2 Anomaly Alerting (Slack)
Sends alerts to the DevOps channel when discrepancies exceed the threshold.

```typescript
export async function sendSlackAlert(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_DEVOPS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured. Cannot send alert:', message);
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *VIYO Cost Reconciliation Alert*
${message}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Slack API returned ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
    // We don't throw here to avoid failing the main reconciliation job
  }
}
```
