---
**STATUS: SUPERSEDED**

This document is superseded by R24 v2 at `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation).

This v1 fragment is retained as historical reference. The Three-Tiered Image Intelligence System architecture (Tier 1 Learning Engine, Tier 2 Pattern Database, Tier 3 Production Router) is preserved and elaborated in R24 v2 §2-§6 with ZCBR-grade failure modes, edge cases, and tests.

Do NOT use this file as canonical. See R24 v2.

**Superseded by:** D66 (B-1.00 ratified) → R24 v2 authoring (2026-05-12)
**Superseded date:** 2026-05-12
---

# R24 — Multi-Model Image Pipeline (Enterprise Architecture)

**Status:** Locked & Verified (V3 - Dual-Scoring Architecture)
**Owner:** Core Engineering
**Type:** Production Specification

## 1. System Overview

The VIYO Image Pipeline is not a simple wrapper around generation APIs. It is a **Three-Tiered Image Intelligence System** designed to learn, cache, and execute proven prompt patterns. To prevent "Model Collapse" (where AI-grading-AI loops converge to generic outputs), the system uses a **Dual-Scoring Architecture** combining automated objective filtering with human aesthetic curation.

### The Three Tiers
1. **Tier 1: The Learning Engine (Seeding)** — Ingests real marketing emails, extracts images, generates variants across models, filters failures, and submits to human curation to build the pattern database.
2. **Tier 2: The Pattern Database (Caching)** — A pgvector-backed database storing proven prompt patterns indexed by category, style, model, and human preference score.
3. **Tier 3: The Production Router (Live)** — Matches customer requests to proven patterns, injects product data, and routes to the optimal direct API.

## 2. The Dual-Scoring Learning Loop (Anti-Convergence)

To build the Pattern Database without falling into the "B+ Trap" (generic AI convergence), the Tier 1 learning loop splits evaluation into two distinct roles:

### Step 1: The Bouncer (Automated Objective Filter)
A fast, cheap Vision LLM (e.g., GPT-4o-mini) evaluates generated images strictly for objective failures. It does NOT judge aesthetics.
- **Checks:** Is the text spelled correctly? Is the product present? Are there severe anatomical anomalies?
- **Action:** Pass or Fail. Failures are discarded. Passes move to the Curator.

### Step 2: The Curator (Human RLHF)
Passing images appear in the internal VIYO Curator Dashboard (R17). A human team member evaluates aesthetic quality, brand energy, and scroll-stopping power.
- **Checks:** Is this visually compelling? Does it match the original email's energy?
- **Action:** Swipe Right (Approve) or Swipe Left (Reject).

### Step 3: Programmatic Optimization (DSPy)
Approved patterns are processed by DSPy, treating prompt optimization as a machine learning compilation step to reinforce the human-approved aesthetic without manual prompt drift.

## 3. Tier 1: The Learning Engine (Inngest Pipeline)

```typescript
import { inngest } from '@/lib/inngest/client';
import { extractImageJsonSchema } from '@/lib/ai/vision';
import { generateVariants } from '@/lib/ai/image-router';
import { objectiveBouncerCheck } from '@/lib/ai/qa';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const processIngestedImage = inngest.createFunction(
  { id: 'process-ingested-image', retries: 3 },
  { event: 'image.ingested' },
  async ({ event, step }) => {
    const { imageUrl, sourceEmailId, category } = event.data;

    // 1. Deconstruct: Vision LLM reverse-engineers the image
    const jsonSchema = await step.run('extract-schema', async () => {
      return await extractImageJsonSchema(imageUrl);
    });

    // 2. Generate: Create variants across multiple direct APIs
    const variants = await step.run('generate-variants', async () => {
      return await generateVariants(jsonSchema);
    });

    // 3. The Bouncer: Automated objective filtering
    const passedVariants = await step.run('bouncer-check', async () => {
      const results = [];
      for (const variant of variants) {
        const pass = await objectiveBouncerCheck(variant.url, jsonSchema);
        if (pass) results.push(variant);
      }
      return results;
    });

    // 4. Queue for Human Curator
    await step.run('queue-for-curator', async () => {
      if (passedVariants.length === 0) return;
      
      await supabaseAdmin.from('curator_queue').insert(
        passedVariants.map(v => ({
          image_url: v.url,
          source_image_url: imageUrl,
          prompt_used: v.prompt,
          model_used: v.model,
          json_schema: jsonSchema,
          category: category,
          status: 'pending'
        }))
      );
    });

    return { queued: passedVariants.length };
  }
);
```

## 4. Tier 2: The Pattern Database (pgvector Schema)

*Note: Full DDL is maintained in R20. This is the logical representation.*

```sql
-- The core pattern cache
CREATE TABLE image_prompt_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(100) NOT NULL,
  layout_type VARCHAR(100) NOT NULL,
  model_sequence JSONB NOT NULL,
  prompt_template TEXT NOT NULL,
  json_schema JSONB NOT NULL,
  human_approval_score NUMERIC(3,2) DEFAULT 0.00,
  usage_count INTEGER DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Tier 3: The Production Router (Retrieval & Execution)

When a customer requests an image, the system retrieves a proven pattern rather than generating from scratch.

```typescript
import { supabase } from '@/lib/supabase/client';
import { generateWithModel } from '@/lib/ai/direct-apis';

export async function generateProductionImage(request: {
  category: string;
  productDescription: string;
  intent: string;
  productImageUrl?: string;
}) {
  // 1. Retrieve the best proven pattern for this scenario
  const { data: patterns } = await supabase
    .from('image_prompt_patterns')
    .select('*')
    .eq('category', request.category)
    .order('human_approval_score', { ascending: false })
    .limit(1);

  if (!patterns || patterns.length === 0) {
    throw new Error('No proven pattern found for this category');
  }

  const pattern = patterns[0];
  
  // 2. Template Injection
  const finalPrompt = pattern.prompt_template.replace('[PRODUCT_DESC]', request.productDescription);

  // 3. Execute Model Sequence (Direct APIs)
  return await executeModelSequence(pattern.model_sequence, finalPrompt, request.productImageUrl);
}

async function executeModelSequence(sequence: string[], prompt: string, initImage?: string) {
  let currentImage = initImage;

  for (const model of sequence) {
    // Calls direct APIs (NanoBanana, Ideogram, Flux), never aggregators in production
    currentImage = await generateWithModel(model, prompt, currentImage);
  }

  return currentImage;
}
```

## 6. The Objective Bouncer (QA Implementation)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function objectiveBouncerCheck(generatedUrl: string, schema: any): Promise<boolean> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a strict objective QA filter. Do NOT judge aesthetics.
        Check ONLY:
        1. Are all required text elements present and spelled correctly?
        2. Is the primary product clearly visible?
        3. Are there severe anatomical anomalies (e.g., 6 fingers)?
        Return ONLY valid JSON: { "pass": boolean, "reason": "string" }`
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Required Schema: ${JSON.stringify(schema)}` },
          { type: "image_url", image_url: { url: generatedUrl } }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result.pass === true;
}
```

## 7. Future Extensibility: The Preference Classifier

Once the human curation phase (Tier 1) collects >5,000 "Swipe Right" and "Swipe Left" decisions, VIYO will train a lightweight Vision-Language Model (VLM) fine-tuned on this dataset. This **Preference Classifier** will eventually replace the human curator, allowing the learning loop to run autonomously at scale while preserving the human aesthetic taste captured during seeding.
