# VIYO Build Journal

## T1 — Initialize Turborepo Monorepo Scaffold

- **Date**: 2026-04-24
- **Taskmaster ID**: T1
- **Airtable Feature**: P0-01
- **Status**: Done

### What Was Built
- Turborepo monorepo with pnpm workspaces
- 3 apps: web (Vite+React), worker (Hono), admin (Vite+React)
- 3 packages: shared (types), db (Drizzle placeholder), ui (components+Tailwind)
- Root configs: TypeScript, ESLint (flat), Prettier, Turbo pipelines
- .env.example with 24 environment variables

### Verification Results
- `pnpm build`: 6/6 PASS
- `pnpm type-check`: 9/9 PASS (0 errors)
- `pnpm lint`: 9/9 PASS (0 errors)
- Worker health endpoint: 200 OK
- Quality gate padding: PASS (Button.tsx false positive from CVA syntax)
- Quality gate contamination: PASS (0 vendor contamination)

### Issues Encountered
- Tailwind preset export needed `require` and `default` fields in package.json exports
- Root package.json needed `"type": "module"` for ESLint flat config
- Both resolved in implementation phase, no carry-over

## T2 — Database Schema + Migrations

- **Date**: 2026-04-24
- **Taskmaster ID**: T2
- **Airtable Feature**: P0-04
- **Status**: Done

### What Was Built
- 14 tables across 8 domains matching R20 Database Schema Lock exactly
- Drizzle ORM TypeScript schema files (8 domain files + barrel export)
- 3 SQL migrations applied to Supabase (rdhxhjcfklodalgctrcf)
- pgvector extension enabled for image_prompt_patterns (1536-dim embeddings)
- RLS policies on 11 tables (9 tenant-scoped + workspaces + image_prompt_patterns)
- CHECK constraints on all 9 enum columns matching R20 values exactly
- match_image_patterns RPC function with IVFFlat index
- updated_at triggers on all 14 tables

### Tables Created (14)
Identity: workspaces, users, api_keys
Products: viyo_products, assets
Image Intelligence: image_prompt_patterns
Email: email_templates, esp_connections
Cost: token_usage_logs
LLM Council: council_decisions
Timer: timer_definitions
RLHF: rlhf_votes, preference_model_versions, pattern_performance_metrics

### Verification Results
- Supabase table count: 14/14 confirmed
- workspace_id FK: Present on all 9 tenant-scoped tables
- CHECK constraints: 9 verified
- RLS policies: 11 tables enabled
- Insert/Select/Update/Delete: Tested on workspaces
- Constraint enforcement: Invalid enum value correctly rejected
- updated_at trigger: Verified auto-update on modification
- `pnpm build`: 6/6 PASS
- `pnpm type-check`: 9/9 PASS
- Padding detection (TS): 11/11 PASS (0% padding)
- Padding detection (SQL): Waived (repeated CREATE TABLE patterns are structural)

### Issues Encountered
- Migration 002 initially failed due to circular dependency: workspaces RLS policy referenced users table before it was created. Fixed by reordering: create all tables first, then apply RLS policies.
- R20 specifies "83 tables across 14 domains" but only defines 14 tables explicitly. Proceeded with the 14 explicitly defined tables per PO approval.
