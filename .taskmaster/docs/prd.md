# VIYO — Derived Execution PRD

## Product Overview

VIYO is an AI-powered email marketing platform for e-commerce brands. It uses a Council of 5 AI Brains (CMO, Email Design, Copy, Image, QA) to generate complete, production-ready email campaigns from minimal input. The platform is built on Supabase (PostgreSQL + Auth + Realtime), deployed across Vercel (frontend), Render (worker/backend), and Cloudflare Workers (timer service), with Inngest for event-driven orchestration.

### Core Value Proposition
- AI-generated email campaigns in minutes, not hours
- Three-Tiered Image Intelligence System (Gemini Flash analysis + Ideogram 3.0 generation + Imagen 4 premium)
- Dual-Scoring Learning Loop (Human RLHF for aesthetics + objective metrics for patterns)
- Pattern DB as competitive moat (cache-first retrieval of proven designs)
- Platform-agnostic via VIYO-UTL (Universal Tag Language) and ESP connectors
- Prepaid credit model via Stripe (hard stop at 0 credits)

### Tech Stack (per KB docs)
- **Frontend**: React SPA on Vercel (app.viyo.new)
- **Backend/Worker**: Node.js on Render (api.viyo.new) with Inngest orchestration
- **Admin Portal**: React on Vercel (admin.viyo.new)
- **Database**: Supabase PostgreSQL with pgvector, RLS, AES-256-GCM vault
- **Auth**: Supabase Auth with workspace-scoped RLS
- **Timer Service**: Cloudflare Workers with Go WASM core
- **Image Generation**: Direct API calls to Gemini, Ideogram, Imagen (no aggregators)
- **Billing**: Stripe prepaid credits
- **Event Orchestration**: Inngest on Render worker

## Phase 0: Foundation (Current Phase)

Source: Doc4_Technical_Roadmap.md, Section "Phase 0: Foundation & Infrastructure"

### Objective
Establish the complete infrastructure foundation: monorepo scaffold, database schema, authentication, deployment pipeline, and admin portal skeleton. No AI features yet — pure infrastructure.

### Features

#### F0.1: Monorepo Scaffold
- Initialize Turborepo monorepo structure
- apps/web (frontend SPA)
- apps/worker (backend + Inngest)
- apps/admin (admin portal)
- packages/shared (types, schemas, utilities)
- packages/db (Drizzle ORM + migrations)
- packages/ui (shared component library)
- Configure TypeScript, ESLint, Prettier across all packages
- Configure environment variable contracts per app

#### F0.2: Database Schema & Migrations
- Implement R20_DATABASE_SCHEMA_LOCK schema via Drizzle ORM migrations
- Core tables: workspaces, workspace_members, profiles, brands, campaigns, emails, sections
- RLHF tables: image_scores, email_scores, pattern_entries
- pgvector extension for embedding-based retrieval
- Credential vault table with AES-256-GCM encryption columns
- Seed data for development environment

#### F0.3: Supabase Auth & RLS
- Configure Supabase Auth (email/password + Google OAuth)
- Implement workspace-scoped RLS policies per R22
- Role hierarchy: owner > admin > editor > viewer
- Workspace invitation flow
- Session management and token refresh

#### F0.4: Deployment Pipeline
- Vercel project for apps/web (app.viyo.new)
- Vercel project for apps/admin (admin.viyo.new)
- Render service for apps/worker (api.viyo.new)
- GitHub Actions CI/CD: lint → type-check → test → deploy
- Environment variable configuration per environment (dev/staging/prod)
- Health check endpoints on all services

#### F0.5: API Layer Foundation
- Express/Hono router on Render worker
- Auth middleware (Supabase JWT verification)
- Workspace-scoped request context
- Error handling and logging patterns
- Rate limiting foundation
- CORS configuration for viyo.new subdomains

#### F0.6: Inngest Event System
- Inngest client configuration on Render worker
- Event type registry (TypeScript)
- First pipeline: workspace.created → provision defaults
- Dev server for local Inngest testing
- Retry and failure handling patterns

#### F0.7: Admin Portal Skeleton
- Authentication (admin-only Supabase roles)
- Dashboard layout with sidebar navigation
- Placeholder pages for: Curator Dashboard, Pattern DB, Model Comparison, User Management, Billing Overview
- Admin-specific API routes

#### F0.8: Internal Records & Tooling
- Create docs/internal/ directory with all 7 mandatory files
- Configure Task Master with phase-specific tasks
- Initialize todo.md
- Git hooks for commit message format

#### F0.9: Credential Vault Service
- AES-256-GCM encryption/decryption utility (VIYO_VAULT_KEY)
- Vault CRUD operations for ESP credentials
- Integration with workspace context
- Zero-plaintext-at-rest guarantee

#### F0.10: Stripe Billing Foundation
- Stripe customer creation on workspace.created
- Prepaid credit package definitions
- Credit balance tracking table and service
- Hard stop enforcement (reject operations at 0 credits)
- Webhook handler for Stripe events

## Logical Dependency Chain

```
F0.1 (Monorepo) → F0.2 (DB Schema) → F0.3 (Auth & RLS)
F0.1 → F0.5 (API Layer) → F0.6 (Inngest)
F0.3 → F0.7 (Admin Portal)
F0.3 → F0.9 (Vault Service)
F0.3 + F0.5 → F0.10 (Stripe Billing)
F0.1 → F0.4 (Deployment) [can run in parallel after scaffold]
F0.1 → F0.8 (Internal Records) [can run immediately]
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| brands vs workspaces naming conflict (Doc1 vs R20) | Schema confusion, wrong tenant model | Escalate to PO for decision before F0.2 |
| Vite React SPA vs Next.js App Router conflict | Wrong framework choice cascades everywhere | Escalate to PO for decision before F0.1 |
| Missing VIYO_ARCHITECTURE_LOCK_V3.md | Incomplete authority chain | Escalate to PO — proceed with Doc1-R31 as primary sources |
| Supabase project not yet provisioned | Blocks F0.2, F0.3 | PO must provide Supabase project URL and keys |
| Stripe account not yet configured | Blocks F0.10 | Can stub with test keys, but need prod keys before launch |
| Render/Vercel accounts not configured | Blocks F0.4 | PO must provide deployment credentials |

## Success Criteria

Phase 0 is complete when:
1. Monorepo builds and type-checks cleanly across all packages
2. Database schema matches R20 and migrations run against clean Supabase
3. Auth flow works end-to-end (signup → login → workspace creation → RLS enforcement)
4. All three apps deploy to their respective domains
5. Inngest dev server processes test events
6. Admin portal authenticates and renders skeleton pages
7. Vault encrypts/decrypts credentials correctly
8. Stripe creates customers and tracks credit balances
9. All 7 internal record files exist and are populated
10. CI/CD pipeline passes on push to main
