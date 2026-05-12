---
**STATUS: SUPERSEDED**

This document is superseded by R20 v2 at `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation, merged via PR #21 at commit `5004819e9bbf4d81a9c992003e3a2ed1731df3fc`).

This v1 file is retained as historical reference only. All R-specs and Bullet directives that cite "R20" or "R20 v1" MUST be interpreted as citing R20 v2 going forward. The schema source files at `packages/db/src/schema/*.ts` cite "R20 §2" which now refers to R20 v2.

Do NOT use this file as canonical. Do NOT update this file. See R20 v2 for current schema, RLS policies, migration plan, and ZCBR-grade failure modes / edge cases / tests.

**Superseded by:** D66 (B-1.00 ratified) → R20 v2 authoring (2026-05-12) → PR #21 merge
**Superseded date:** 2026-05-12
---

# R20 — Database Schema Lock & Migration Strategy (Enterprise Spec)

## 1. Executive Summary

This specification locks the authoritative PostgreSQL schema for VIYO, hosted on Supabase. It provides the foundational Data Definition Language (DDL) required by all other R-series specs. The schema is designed for multi-tenant SaaS (Row Level Security), vector search (pgvector for prompt caching), and high-volume event tracking (Inngest/Stripe reconciliation).

**Cross-Spec Wiring Map:**

| Spec | Tables Consumed | Purpose |
|------|----------------|---------|
| R22 (Security) | `workspaces`, `users`, `api_keys` | Auth, RLS, API key storage |
| R23 (Cost Engine) | `token_usage_logs` | Stripe meter reconciliation |
| R24 (Image Pipeline) | `image_prompt_patterns` | Vector prompt caching moat |
| R27 (Composable Sections) | `email_templates`, `email_sections` | Section composition |
| R28 (Timer Service) | `timer_definitions` | Go WASM countdown config |
| R29 (Platform Abstraction) | `esp_connections` | ESP connector credentials |
| R31 (Data Extraction) | `viyo_products`, `assets` | Scraped e-commerce data |
| R19 (LLM Architecture) | `council_decisions` | Council of Brains tracking |

## 2. Programmatic Migration Script

Instead of raw DDL with unavoidable column repetition, VIYO uses a TypeScript migration generator that enforces the multi-tenant convention programmatically. This is the authoritative schema source.

```typescript
// supabase/migrations/001_initial_schema.ts
// This script generates the SQL migration file. Run: npx tsx supabase/migrations/001_initial_schema.ts

interface ColumnDef {
  name: string;
  type: string;
  constraints?: string;
}

interface TableDef {
  name: string;
  tenantScoped: boolean; // If true, adds workspace_id FK + RLS automatically
  columns: ColumnDef[];
  indexes?: string[];
  policies?: string[];
}

const EXTENSIONS = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
`;

function generateTable(def: TableDef): string {
  const cols: string[] = [
    `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  ];
  
  if (def.tenantScoped) {
    cols.push(`workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE`);
  }
  
  cols.push(...def.columns.map(c => 
    `${c.name} ${c.type}${c.constraints ? ' ' + c.constraints : ''}`
  ));
  
  cols.push(`created_at TIMESTAMPTZ DEFAULT NOW()`);
  if (!def.columns.some(c => c.name === 'updated_at')) {
    cols.push(`updated_at TIMESTAMPTZ DEFAULT NOW()`);
  }

  let sql = `CREATE TABLE public.${def.name} (\n    ${cols.join(',\n    ')}\n);\n`;
  
  if (def.tenantScoped) {
    sql += `ALTER TABLE public.${def.name} ENABLE ROW LEVEL SECURITY;\n`;
    sql += `CREATE POLICY "ws_isolation_${def.name}" ON public.${def.name} FOR ALL `;
    sql += `USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));\n`;
  }
  
  if (def.indexes) {
    sql += def.indexes.join('\n') + '\n';
  }
  if (def.policies) {
    sql += def.policies.join('\n') + '\n';
  }
  
  return sql;
}

// ============================================================
// TABLE DEFINITIONS — This is the authoritative schema registry
// ============================================================

const TABLES: TableDef[] = [
  // --- IDENTITY (R22 Wiring) ---
  {
    name: 'workspaces',
    tenantScoped: false,
    columns: [
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'stripe_customer_id', type: 'VARCHAR(255)', constraints: 'UNIQUE' },
      { name: 'subscription_tier', type: 'VARCHAR(50)', constraints: "DEFAULT 'free' CHECK (subscription_tier IN ('free','starter','growth','enterprise'))" },
      { name: 'onboarding_completed', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'settings', type: 'JSONB', constraints: "DEFAULT '{}'" }
    ],
    policies: [
      `ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "ws_self_view" ON public.workspaces FOR SELECT USING (id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));`
    ]
  },
  {
    name: 'users',
    tenantScoped: false, // Special: references auth.users, not workspaces
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE' },
      { name: 'workspace_id', type: 'UUID', constraints: 'REFERENCES public.workspaces(id) ON DELETE CASCADE' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE NOT NULL' },
      { name: 'full_name', type: 'VARCHAR(255)' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'role', type: 'VARCHAR(50)', constraints: "DEFAULT 'member' CHECK (role IN ('owner','admin','member'))" },
      { name: 'last_login_at', type: 'TIMESTAMPTZ' }
    ],
    policies: [
      `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "users_ws_view" ON public.users FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));`
    ]
  },
  // --- API KEYS (R22 Wiring) ---
  {
    name: 'api_keys',
    tenantScoped: true,
    columns: [
      { name: 'key_hash', type: 'VARCHAR(64)', constraints: 'NOT NULL UNIQUE' },
      { name: 'key_prefix', type: 'VARCHAR(8)', constraints: 'NOT NULL' },
      { name: 'label', type: 'VARCHAR(100)' },
      { name: 'scopes', type: 'VARCHAR[]', constraints: "DEFAULT '{}'" },
      { name: 'expires_at', type: 'TIMESTAMPTZ' },
      { name: 'last_used_at', type: 'TIMESTAMPTZ' }
    ]
  },
  // --- PRODUCTS & ASSETS (R31 Wiring) ---
  {
    name: 'viyo_products',
    tenantScoped: true,
    columns: [
      { name: 'source_url', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'description', type: 'TEXT' },
      { name: 'price', type: 'NUMERIC(10,2)' },
      { name: 'currency', type: 'VARCHAR(3)', constraints: "DEFAULT 'USD'" },
      { name: 'category', type: 'VARCHAR(100)' },
      { name: 'extracted_data', type: 'JSONB', constraints: "NOT NULL DEFAULT '{}'" },
      { name: 'thumbnail_url', type: 'TEXT' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' }
    ]
  },
  {
    name: 'assets',
    tenantScoped: true,
    columns: [
      { name: 'product_id', type: 'UUID', constraints: 'REFERENCES public.viyo_products(id) ON DELETE SET NULL' },
      { name: 'asset_type', type: 'VARCHAR(50)', constraints: "NOT NULL CHECK (asset_type IN ('product_photo','lifestyle_scene','generated_hero','generated_section','video_clip','brand_logo'))" },
      { name: 'storage_path', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'width', type: 'INTEGER' },
      { name: 'height', type: 'INTEGER' },
      { name: 'file_size_bytes', type: 'BIGINT' },
      { name: 'mime_type', type: 'VARCHAR(100)' },
      { name: 'source_model', type: 'VARCHAR(50)' },
      { name: 'generation_prompt', type: 'TEXT' },
      { name: 'metadata', type: 'JSONB', constraints: "DEFAULT '{}'" }
    ]
  },
  // --- IMAGE INTELLIGENCE MOAT (R24 Wiring) ---
  {
    name: 'image_prompt_patterns',
    tenantScoped: false, // Global VIYO intelligence, not per-workspace
    columns: [
      { name: 'category', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'layout_type', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'typography_style', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'target_models', type: 'VARCHAR[]', constraints: 'NOT NULL' },
      { name: 'prompt_template', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'style_schema', type: 'JSONB', constraints: 'NOT NULL' },
      { name: 'embedding', type: 'vector(1536)', constraints: 'NOT NULL' },
      { name: 'qa_score', type: 'NUMERIC(3,2)', constraints: 'NOT NULL CHECK (qa_score BETWEEN 0 AND 1)' },
      { name: 'cost_per_gen', type: 'NUMERIC(5,4)', constraints: 'NOT NULL' },
      { name: 'usage_count', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'last_used_at', type: 'TIMESTAMPTZ' }
    ],
    indexes: [
      `CREATE INDEX idx_patterns_embedding ON public.image_prompt_patterns USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`,
      `CREATE INDEX idx_patterns_category ON public.image_prompt_patterns(category, layout_type);`
    ],
    policies: [
      `ALTER TABLE public.image_prompt_patterns ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY "service_role_only" ON public.image_prompt_patterns FOR ALL USING (auth.role() = 'service_role');`
    ]
  },
  // --- EMAIL COMPOSITION (R27 & R29 Wiring) ---
  {
    name: 'email_templates',
    tenantScoped: true,
    columns: [
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL' },
      { name: 'subject_line', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'preheader', type: 'TEXT' },
      { name: 'viyo_utl_source', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'compiled_html', type: 'TEXT' },
      { name: 'compiled_mjml', type: 'TEXT' },
      { name: 'esp_target', type: 'VARCHAR(50)' },
      { name: 'status', type: 'VARCHAR(20)', constraints: "DEFAULT 'draft' CHECK (status IN ('draft','review','approved','sent'))" }
    ]
  },
  {
    name: 'esp_connections',
    tenantScoped: true,
    columns: [
      { name: 'provider', type: 'VARCHAR(50)', constraints: "NOT NULL CHECK (provider IN ('klaviyo','mailchimp','sendgrid','brevo','hubspot','activecampaign','drip','customer_io'))" },
      { name: 'api_key_encrypted', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' },
      { name: 'last_synced_at', type: 'TIMESTAMPTZ' },
      { name: 'metadata', type: 'JSONB', constraints: "DEFAULT '{}'" }
    ]
  },
  // --- COST TRACKING (R23 Wiring) ---
  {
    name: 'token_usage_logs',
    tenantScoped: true,
    columns: [
      { name: 'provider', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'model', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'operation_type', type: 'VARCHAR(50)', constraints: "NOT NULL CHECK (operation_type IN ('text_gen','image_gen','vision_qa','embedding','speech','video_analysis'))" },
      { name: 'prompt_tokens', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'completion_tokens', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'image_count', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'calculated_cost', type: 'NUMERIC(10,6)', constraints: 'NOT NULL' },
      { name: 'stripe_meter_event_id', type: 'VARCHAR(255)' },
      { name: 'inngest_run_id', type: 'VARCHAR(255)' }
    ],
    indexes: [
      `CREATE INDEX idx_usage_ws_date ON public.token_usage_logs(workspace_id, created_at DESC);`,
      `CREATE INDEX idx_usage_unsent ON public.token_usage_logs(stripe_meter_event_id) WHERE stripe_meter_event_id IS NULL;`
    ]
  },
  // --- LLM COUNCIL (R19 Wiring) ---
  {
    name: 'council_decisions',
    tenantScoped: true,
    columns: [
      { name: 'decision_type', type: 'VARCHAR(50)', constraints: 'NOT NULL' },
      { name: 'input_context', type: 'JSONB', constraints: 'NOT NULL' },
      { name: 'brain_votes', type: 'JSONB', constraints: 'NOT NULL' },
      { name: 'final_decision', type: 'JSONB', constraints: 'NOT NULL' },
      { name: 'confidence_score', type: 'NUMERIC(3,2)' },
      { name: 'execution_time_ms', type: 'INTEGER' }
    ]
  },
  // --- TIMER SERVICE (R28 Wiring) ---
  {
    name: 'timer_definitions',
    tenantScoped: true,
    columns: [
      { name: 'label', type: 'VARCHAR(100)', constraints: 'NOT NULL' },
      { name: 'target_timestamp', type: 'TIMESTAMPTZ', constraints: 'NOT NULL' },
      { name: 'timezone', type: 'VARCHAR(50)', constraints: "DEFAULT 'UTC'" },
      { name: 'style_config', type: 'JSONB', constraints: "DEFAULT '{}'" },
      { name: 'fallback_text', type: 'VARCHAR(255)', constraints: "DEFAULT 'Offer Expired'" },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT TRUE' }
    ]
  }
];

// ============================================================
// GENERATOR — Outputs the complete SQL migration
// ============================================================

function generate(): string {
  let sql = '-- VIYO Schema Migration 001 — Generated by R20 Schema Lock\n';
  sql += '-- DO NOT EDIT MANUALLY. Modify the TableDef[] above and regenerate.\n\n';
  sql += EXTENSIONS + '\n';
  
  for (const table of TABLES) {
    sql += `-- === ${table.name.toUpperCase()} ===\n`;
    sql += generateTable(table) + '\n';
  }
  
  return sql;
}

// Write to stdout or file
import { writeFileSync } from 'fs';
writeFileSync('supabase/migrations/20260423000000_initial_schema.sql', generate());
console.log('Migration generated successfully.');
```

## 3. Vector Similarity Search RPC (R24 Tier 3 Router)

This Supabase RPC function is called by the R24 Production Router to find the best matching prompt pattern.

```sql
CREATE OR REPLACE FUNCTION match_image_patterns(
    query_embedding vector(1536),
    match_category TEXT,
    match_layout TEXT,
    match_threshold FLOAT,
    match_count INT
) RETURNS TABLE (
    id UUID,
    category VARCHAR,
    layout_type VARCHAR,
    typography_style VARCHAR,
    target_models VARCHAR[],
    prompt_template TEXT,
    style_schema JSONB,
    qa_score NUMERIC,
    cost_per_gen NUMERIC,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.category, p.layout_type, p.typography_style,
        p.target_models, p.prompt_template, p.style_schema,
        p.qa_score, p.cost_per_gen,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM public.image_prompt_patterns p
    WHERE p.category = match_category
      AND p.layout_type = match_layout
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

## 4. Migration CI/CD Pipeline

```yaml
# .github/workflows/db-migrate.yml
name: Deploy Supabase Migrations
on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

## 5. Seed Script for Local Development

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function seed() {
  const { data: workspace } = await supabase.from('workspaces').insert({
    name: 'VIYO Dev Workspace',
    subscription_tier: 'growth',
    onboarding_completed: true
  }).select().single();

  if (!workspace) throw new Error('Workspace creation failed');

  await supabase.from('viyo_products').insert([
    { workspace_id: workspace.id, source_url: 'https://example.com/summer-dress', name: 'Summer Linen Dress', price: 89.99, category: 'Apparel', extracted_data: { colors: ['ivory','sage'], sizes: ['S','M','L'] } },
    { workspace_id: workspace.id, source_url: 'https://example.com/cola-classic', name: 'Cola Classic 12oz', price: 1.99, category: 'Beverage', extracted_data: { flavor: 'original', pack_size: 12 } }
  ]);

  await supabase.from('esp_connections').insert({
    workspace_id: workspace.id,
    provider: 'klaviyo',
    api_key_encrypted: 'enc:test-key-placeholder',
    is_active: true
  });

  console.log(`Seeded workspace: ${workspace.id}`);
}

seed().catch(console.error);
```


  // --- RLHF & PREFERENCE LEARNING (R24 & R19 Wiring) ---
  {
    name: 'rlhf_votes',
    tenantScoped: false, // Internal VIYO system data
    columns: [
      { name: 'pattern_id', type: 'UUID', constraints: 'REFERENCES public.image_prompt_patterns(id) ON DELETE CASCADE' },
      { name: 'source_image_url', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'generated_image_url', type: 'TEXT', constraints: 'NOT NULL' },
      { name: 'curator_id', type: 'UUID', constraints: 'REFERENCES public.users(id) ON DELETE CASCADE' },
      { name: 'vote', type: 'VARCHAR(20)', constraints: "NOT NULL CHECK (vote IN ('approve','reject','skip'))" }
    ]
  },
  {
    name: 'preference_model_versions',
    tenantScoped: false, // Internal VIYO system data
    columns: [
      { name: 'version_tag', type: 'VARCHAR(50)', constraints: 'NOT NULL UNIQUE' },
      { name: 'training_vote_count', type: 'INTEGER', constraints: 'NOT NULL' },
      { name: 'accuracy_score', type: 'NUMERIC(5,4)' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT FALSE' },
      { name: 'model_weights_url', type: 'TEXT' }
    ]
  },
  {
    name: 'pattern_performance_metrics',
    tenantScoped: false, // Aggregated global intelligence
    columns: [
      { name: 'pattern_id', type: 'UUID', constraints: 'NOT NULL' }, // Generic reference to skills_registry
      { name: 'pattern_type', type: 'VARCHAR(50)', constraints: "NOT NULL CHECK (pattern_type IN ('copywriting','layout','timing'))" },
      { name: 'total_sends', type: 'INTEGER', constraints: 'DEFAULT 0' },
      { name: 'open_rate', type: 'NUMERIC(5,4)' },
      { name: 'click_rate', type: 'NUMERIC(5,4)' },
      { name: 'conversion_rate', type: 'NUMERIC(5,4)' },
      { name: 'last_calculated_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()' }
    ]
  }
];

// ... (Generator logic executes below)
```
