# R26 — Creative Concept Mode Enterprise Spec

## 1. Executive Summary
Creative Concept Mode is the strategic brainstorming layer of VIYO. It translates raw data (product specs, ingested videos, scraped websites) into actionable email marketing concepts. It is powered by the CMO Brain, which generates three distinct strategic pitches for every brief, allowing the user to choose a direction before the Email Design Brain begins structural assembly.

## 2. Creative Autonomy State Machine (XState)

The process is modeled as a state machine to handle the asynchronous nature of AI generation, user approval, and potential fallback scenarios.

```typescript
import { createMachine, assign } from 'xstate';

interface ConceptContext {
  briefId: string;
  brandId: string;
  concepts: Array<{ id: string; title: string; pitch: string; strategy: string }>;
  selectedConceptId: string | null;
  error: string | null;
}

export const conceptMachine = createMachine<ConceptContext>({
  id: 'creativeConcept',
  initial: 'analyzingBrief',
  context: {
    briefId: '',
    brandId: '',
    concepts: [],
    selectedConceptId: null,
    error: null
  },
  states: {
    analyzingBrief: {
      invoke: {
        src: 'fetchBrandContext',
        onDone: { target: 'generatingConcepts' },
        onError: { target: 'failed', actions: 'setError' }
      }
    },
    generatingConcepts: {
      invoke: {
        src: 'invokeCMOBrain',
        onDone: { target: 'awaitingUserSelection', actions: 'setConcepts' },
        onError: { target: 'failed', actions: 'setError' }
      }
    },
    awaitingUserSelection: {
      on: {
        SELECT_CONCEPT: { target: 'conceptSelected', actions: 'setSelectedConcept' },
        REGENERATE: { target: 'generatingConcepts' }
      }
    },
    conceptSelected: {
      type: 'final'
    },
    failed: {
      on: {
        RETRY: { target: 'analyzingBrief', actions: 'clearError' }
      }
    }
  }
}, {
  actions: {
    setConcepts: assign({ concepts: (context, event) => event.data }),
    setSelectedConcept: assign({ selectedConceptId: (context, event) => event.conceptId }),
    setError: assign({ error: (context, event) => event.data.message }),
    clearError: assign({ error: null })
  }
});
```

## 3. CMO Brain Integration

The CMO Brain (powered by an advanced LLM) is responsible for generating the concepts. It is prompted to provide distinct, strategic angles.

```typescript
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';

export const ConceptSchema = z.object({
  concepts: z.array(z.object({
    id: z.string(),
    title: z.string().describe("A catchy, 3-5 word title for the concept."),
    pitch: z.string().describe("A 2-sentence elevator pitch explaining the creative angle."),
    strategy: z.enum(['benefit_focused', 'story_driven', 'urgency_promo', 'educational', 'social_proof']),
    recommended_sections: z.array(z.string()).describe("List of R27 section types that fit this concept.")
  })).length(3)
});

export type ConceptResponse = z.infer<typeof ConceptSchema>;

export async function generateCreativeConcepts(brief: string, brandData: any): Promise<ConceptResponse> {
  const prompt = `
    You are the Chief Marketing Officer for the brand "${brandData.name}".
    
    The client has provided the following brief:
    "${brief}"
    
    Based on this brief and the brand's tone of voice (${brandData.toneOfVoice}), generate exactly 3 distinct email marketing concepts.
    Each concept must have a different strategic angle (e.g., one educational, one story-driven, one benefit-focused).
  `;

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: ConceptSchema,
      prompt: prompt,
      temperature: 0.7
    });

    return object;
  } catch (error) {
    console.error('CMO Brain failed to generate concepts:', error);
    throw new Error('Failed to generate creative concepts. Please try again.');
  }
}
```

## 4. Smart Intercept Detection

Before invoking the full CMO Brain, the system checks if the user's brief is actually a direct command that bypasses concepting (e.g., "Just build me a standard welcome email").

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function detectDirectCommand(brief: string): Promise<boolean> {
  const prompt = `
    Analyze the following user input:
    "${brief}"
    
    Is the user asking for strategic brainstorming/ideas, or are they giving a direct, specific command to build an email immediately without needing options?
    Reply with only "DIRECT" or "BRAINSTORM".
  `;

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt
    });

    return text.trim() === 'DIRECT';
  } catch (error) {
    // Default to brainstorm if detection fails
    console.error('Smart intercept detection failed:', error);
    return false;
  }
}
```

## 5. Database Schema (Supabase SQL)

Concepts are stored in the database to maintain history and allow users to revisit rejected ideas later.

```sql
-- Table for storing generated concepts
CREATE TABLE public.creative_concepts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    brief_text TEXT NOT NULL,
    concept_data JSONB NOT NULL, -- Stores the array of 3 concepts
    selected_concept_id TEXT, -- The ID of the concept the user chose
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by brand
CREATE INDEX idx_creative_concepts_brand_id ON public.creative_concepts(brand_id);

-- RLS Policies
ALTER TABLE public.creative_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view concepts for their brands" 
    ON public.creative_concepts FOR SELECT 
    USING (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert concepts for their brands" 
    ON public.creative_concepts FOR INSERT 
    WITH CHECK (brand_id IN (SELECT brand_id FROM public.user_brands WHERE user_id = auth.uid()));
```
