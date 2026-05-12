---
**SUPERSEDED:** This file is superseded by R19 v2 at
/docs/research_specs/R19_LLM_ORCHESTRATION_v2.md.
See that file for canonical LLM orchestration architecture.
Superseded on: 2026-05-12
ZCBR Status: SUPERSEDED
---

# R19 — LLM Architecture Enterprise Specification

## 1. Executive Summary

This document provides an exhaustive, enterprise-grade specification for the LLM architecture of the VIYO platform. It details the multi-model routing logic, token economics, prompt management, and the specific roles of the "Council of Brains" in executing complex marketing tasks. The architecture is designed to balance cutting-edge reasoning capabilities with strict cost controls and low latency.

## 2. Multi-Model Routing Strategy

VIYO does not rely on a single LLM provider. Instead, it routes tasks to the most capable and cost-effective model for the specific job, optimizing for both quality and margin.

### 2.1 Core LLMs
- **GPT-4o (OpenAI):** Used for complex strategic reasoning, Top Brain analysis, and the CMO Brain. High cost, high capability.
- **Gemini 1.5 Pro (Google):** Used for tasks requiring massive context windows (e.g., analyzing entire brand histories or large datasets).
- **Gemini 1.5 Flash (Google):** Used for high-volume, lower-complexity tasks like basic copywriting variations or metadata tagging. Low cost, high speed.

### 2.2 Image Generation Models (Visual Intent Router)
As defined in R24, image requests are routed based on intent:
- **NanoBanana (Gemini Imagen 3):** Product photography and lifestyle shots.
- **Ideogram 3.0:** Typography, fake UIs, and text-heavy graphics.
- **Imagen 4:** Upscaling and refinement in the Composite Pipeline.

## 3. The Council of Brains

The VIYO architecture uses specialized AI agents ("Brains"), each with a specific persona, system prompt, and output schema.

### 3.1 CMO Brain (Chief Marketing Officer)
- **Model:** GPT-4o
- **Role:** Strategic orchestration. Decides the campaign objective, target audience, and overall creative direction.
- **Key Feature:** Powers the "Creative Concept Mode" (R26), generating 3 distinct pitches before execution.

### 3.2 Copywriter Brain
- **Model:** Gemini 1.5 Flash (or GPT-4o for high-tier brands)
- **Role:** Generates subject lines, preview text, and body copy tailored to the brand's tone of voice.
- **Output:** Structured JSON mapping copy to specific `Composable Sections` (R27).

### 3.3 Visual Intent Router (formerly Image Design Brain)
- **Model:** Gemini 1.5 Flash (for routing logic)
- **Role:** Analyzes the visual brief and routes the request to the appropriate image generation model (NanoBanana, Ideogram, Imagen).

### 3.4 Critic Brain
- **Model:** GPT-4o
- **Role:** Quality assurance. Evaluates the assembled email against 11 dimensions (brand alignment, compliance, visual hierarchy).
- **Action:** Can reject the output and trigger a re-generation loop if the score is below the threshold.

### 3.5 Top Brain (Global Intelligence)
- **Model:** GPT-4o + Gemini 1.5 Pro
- **Role:** Analyzes ingested data (e.g., from the Video Ingestion Module, R25) to extract industry-wide patterns and update the global `skills_registry`.

## 4. Prompt Management & Versioning

- Prompts are stored in the database (`system_prompts` table) and versioned.
- Changes to core prompts require A/B testing against a holdout set of test campaigns to ensure quality doesn't regress.
- Prompts utilize dynamic injection (e.g., `{{brand_voice}}`, `{{campaign_goal}}`) to provide context.

## 5. Token Economics & Cost Control

- **Strict Budgets:** Every task has a defined token budget. If a Brain exceeds the budget, the process is halted and flagged.
- **Caching:** Frequently used context (e.g., the brand's base style guide) is cached using techniques like OpenAI's Prompt Caching to reduce input token costs.
- **Reconciliation:** Every API call is logged with its exact token usage and cost, feeding into the Cost Reconciliation Engine (R23).

## 6. Edge Cases & Fallbacks

- **Rate Limiting:** Exponential backoff and retry logic for all LLM API calls.
- **Model Outage:** If GPT-4o is down, the system automatically falls back to Gemini 1.5 Pro for strategic tasks, ensuring high availability.
- **Hallucinations:** The Critic Brain serves as the primary defense against hallucinations or off-brand content.

## 7. Self-Learning & Self-Healing Integration

The architecture integrates with Clawhub skills (`memory-self-heal`, `self-improving-agent`) to allow the system to learn from past mistakes (e.g., emails rejected by the Critic Brain) and adjust its future prompts or routing logic automatically.

## 8. Advanced Prompt Templates

### 8.1 CMO Brain System Prompt (Detailed)
```text
You are the Chief Marketing Officer (CMO) for a boutique e-commerce brand.
Your primary goal is to strategize email campaigns that drive revenue without compromising brand equity.

Brand Context:
- Name: {{brand.name}}
- Voice: {{brand.tone_of_voice}}
- Target Audience: {{brand.target_audience}}

Current Campaign Goal: {{campaign.objective}}
Key Offer: {{campaign.offer}}

Instructions:
1. Analyze the brand context and the campaign goal.
2. Develop a core creative concept.
3. Determine the visual direction and copy angle.
4. Output the strategy in the required JSON format.

Constraints:
- NEVER use generic marketing jargon (e.g., "Unlock your potential", "Level up").
- Ensure the tone matches the brand guidelines exactly.
- If the goal is 'abandoned_cart', focus on urgency and overcoming objections.
```

### 8.2 Copywriter Brain System Prompt (Detailed)
```text
You are an expert direct-response copywriter working for {{brand.name}}.
Your task is to write the copy for an email based on the CMO's strategy.

CMO Strategy:
{{cmo.strategy}}

Required Sections:
{{email.required_sections}}

Instructions:
1. Write a compelling subject line (max 50 characters).
2. Write preview text that complements the subject line.
3. Write the body copy for each required section.
4. Ensure all copy adheres to the {{brand.tone_of_voice}}.

Output Format:
Return a JSON object mapping each section to its respective copy.
```

## 9. Token Budgets & Rate Limits

### 9.1 Token Budgets per Tier
| Tier | Monthly Token Allowance | Overage Cost (per 1k) |
| :--- | :--- | :--- |
| Free | 500,000 | N/A (Hard Cap) |
| Starter | 3,000,000 | $0.02 |
| Growth | 10,000,000 | $0.015 |
| Agency | 30,000,000 | $0.01 |

### 9.2 Rate Limiting Implementation (Redis)
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(orgId: string): Promise<boolean> {
  const key = `rate_limit:${orgId}`;
  const limit = 50; // Max requests per minute
  
  const currentCount = await redis.incr(key);
  if (currentCount === 1) {
    await redis.expire(key, 60);
  }
  
  return currentCount <= limit;
}
```

## 10. Fallback Logic & Circuit Breakers

### 10.1 Multi-Model Fallback (TypeScript)
```typescript
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function executeWithFallback(prompt: string, primaryModel: 'gpt-4o' | 'gemini-1.5-pro') {
  try {
    if (primaryModel === 'gpt-4o') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content;
    } else {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  } catch (error) {
    console.error(`Primary model ${primaryModel} failed. Attempting fallback...`, error);
    
    // Fallback logic
    if (primaryModel === 'gpt-4o') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content;
    }
  }
}
```

## 11. Extended Zod Schemas

### 11.1 `CMOOutputSchema`
```typescript
import { z } from 'zod';

export const CMOOutputSchema = z.object({
  campaign_objective: z.string(),
  target_audience_segment: z.string(),
  creative_concept: z.object({
    title: z.string(),
    rationale: z.string(),
    visual_direction: z.string(),
    copy_angle: z.string()
  }),
  recommended_sections: z.array(z.string()),
  urgency_mechanism: z.enum(['none', 'text_only', 'live_timer']).optional()
});
```

### 11.2 `CopywriterOutputSchema`
```typescript
import { z } from 'zod';

export const CopywriterOutputSchema = z.object({
  subject_line: z.string().max(60),
  preview_text: z.string().max(100),
  sections_copy: z.record(z.string(), z.object({
    headline: z.string().optional(),
    body: z.string().optional(),
    cta: z.string().optional()
  }))
});
```

## 12. Model Evaluation & A/B Testing

### 12.1 Evaluation Metrics
- **Brand Alignment Score:** Evaluated by the Critic Brain (0-100).
- **Conversion Rate (Actual):** Tracked via integration with the user's e-commerce platform (Shopify).
- **Generation Latency:** Time taken from prompt submission to final output.

### 12.2 A/B Testing Framework
When deploying a new prompt version, VIYO routes 10% of traffic to the new version (Variant B) and compares the Brand Alignment Score against the control (Variant A).

## 13. Advanced LLM Orchestration Details

### 13.1 Context Window Management
Managing the context window is critical for cost control and performance. VIYO employs a sliding window approach for brand history, retaining only the most relevant past campaigns and performance data in the prompt context.

```typescript
export function buildContextWindow(brandId: string, maxTokens: number) {
  // Logic to retrieve and truncate brand history to fit within maxTokens
  // Prioritizes recent, high-performing campaigns
  return { context: "Historical campaign data...", tokensUsed: 1500 };
}
```

### 13.2 Semantic Caching
To reduce redundant LLM calls, VIYO implements semantic caching using Redis and vector embeddings. If a user requests a campaign with a highly similar brief to a previous one, the system can retrieve the cached response.

```typescript
export async function checkSemanticCache(briefEmbedding: number[]) {
  // Logic to perform vector search in Redis/Pinecone
  // Returns cached response if similarity > 0.95
  return null; 
}
```

## 14. Build Tracker (LLM-01 through LLM-06)

| Feature ID | Name | Version | Phase | Dependencies |
|-----------|------|---------|-------|-------------|
| LLM-01 | Multi-Model Router Service | V1 | Phase 1 | None |
| LLM-02 | CMO Brain Implementation | V1 | Phase 1 | LLM-01 |
| LLM-03 | Copywriter Brain Implementation | V1 | Phase 1 | LLM-01 |
| LLM-04 | Critic Brain Evaluation Engine | V1 | Phase 2 | LLM-01 |
| LLM-05 | Redis Semantic Caching | V1 | Phase 2 | None |
| LLM-06 | Token Tracking & Reconciliation | V1 | Phase 2 | None |


## 15. The Preference Classifier (RLHF Model)

To prevent "Model Collapse" during the autonomous learning loop (R24), VIYO trains a lightweight Vision-Language Model (VLM) fine-tuned on human aesthetic judgments. 

- **Role:** Replaces the human curator once >5,000 "Swipe Right" / "Swipe Left" decisions have been collected.
- **Input:** Generated image + Original ingested image.
- **Output:** A preference score (0.0 to 1.0) approximating human aesthetic taste.
- **Training Pipeline:** Managed via DSPy, which compiles human preference data into optimized prompt patterns and fine-tunes the classifier weights.

## 16. Performance-Data Learning Loop

While visual aesthetics are scored via human RLHF (or the Preference Classifier), non-visual patterns are scored autonomously using objective performance data.

| Pattern Type | Scoring Metric | Source |
|--------------|----------------|--------|
| **Copywriting** | Open rate, Click-to-open rate (CTOR) | ESP Webhooks (R29) |
| **Section Layout** | Scroll depth, Heatmap clicks | Client-side tracking |
| **Send Timing** | Conversion rate, Time-to-open | ESP Webhooks |

The Top Brain periodically aggregates this performance data, ranks the patterns in the `skills_registry`, and uses DSPy to automatically optimize the low-performing patterns based on the characteristics of the high-performing ones.
