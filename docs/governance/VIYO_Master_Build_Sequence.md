# VIYO Master Build Sequence v1.1

**Status:** DRAFT v1.1 — pending PO ratification
**v1.0 ratified:** (status preserved — v1.1 supersedes)
**v1.1 changes:** Added R-Spec Audit Table integration, 8 new Cross-cutting Bullets (B-XC.17 through B-XC.24), IMPORTANT JIT stub references, LATER deferred appendix, dependency graph updated with ZCBR pre-flight enforcement
**Date:** 2026-05-11
**Author:** Architect Claude (Opus 4.7)
**Owner:** Architect Claude role. Updated only when locked decisions change.
**Repo target:** `/docs/governance/VIYO_Master_Build_Sequence.md`
**Authority tier:** PO decisions → V8 PRD → FOUNDATION_AUTHORITY.md → **VIYO_Master_Build_Sequence.md** → VVOW Architecture → R-spec ZCBR → per-Bullet directives → existing code

---

## How To Read This Document

Every Bullet uses the same compact metadata block. Bullet IDs follow `B-<phase>.<seq>` convention. Phase tags: P0 substrate / P1 Image Studio / P1B Intelligence Foundation / P2 Email Engine / P2.5 Trust Layer / P3 Intelligence Studio / P4+ Service Expansion / XC cross-cutting.

Fields per Bullet:
- **Moat** — competitor surface earned (None / Lovart / Migma / Grid&Pixel / Instant)
- **User outcome** / **Substrate outcome** — what ships
- **VVOW** / **R-spec** — canonical references
- **Features** — Feature IDs from Manus Inventory v002
- **Locks** — Foundation Lock numbers enforced
- **Skills** — Builder Technical Skills loaded by Kimi
- **Prereqs** / **Parallel-safe with** — dependency graph
- **Acceptance** — what §9 Gate validates
- **Complexity** — S (1-3d) / M (3-7d) / L (1-2w) / XL (2-3w)
- **Open deps** — OD-xxx or GAP-xxx blocking

Parallel-safe assumes Portal Composer Queue supports concurrent lanes — OD-009 ratified 2026-05-15: 2 parallel lanes for related-and-wired features, sequential for cross-touching (see Section 6 + CODE_RECONCILIATION §8 A2).

---

## Section 1 — End State

A brand on VIYO operates a complete email creative OS from a single workspace. They sign up via app.viyo.com, connect Shopify + Klaviyo via OAuth, and within minutes have access to (1) a Lovart-tier Image Studio generating, editing, organizing brand-aligned visuals using a Pattern DB seeded from competitor archives plus brand-specific LoRAs trained from RLHF history, (2) a Migma-tier Email Engine importing from Figma / HTML / Screenshot / Remix of competitor emails, running 11+ flow templates with Klaviyo-deployed automations, managing segments + popups + deliverability, (3) a Grid & Pixel-tier Brand Team Collaboration layer with Slack-style approvals, Trust Layer enforcement, automatic suppression, magic mail deliverability, AI Klaviyo audits, and (4) an Instant-tier Intelligence Studio producing Super Templates that generate per-recipient personalized copy + dynamic products + smart coupons + send-time optimization, plus Audiences capturing first-party data beyond cookies, plus LENZ competitive intelligence, plus PULZE email intelligence, all powered by ATLAS Top Brain corpus + MAAX per-brand memory + HYVE opt-in cross-brand network. Token economics: metered per AI call, programmatic ops free, billed Lovart-style across 5 tiers Free $0 to Enterprise $1,499. Every interaction emits RLHF that compounds the system's ability to generate brand-aligned campaigns autonomously over time.

---

## Section 2 — Phase Summary

| Phase | Moat earned | Bullet count | Avg complexity |
|---|---|---|---|
| P0 — Substrate | None (foundation) | 22 | M-L |
| P1 — Image Studio | Lovart | 18 | M-L |
| P1B — Intelligence Foundation | None (corpus prereq for P2) | 7 | M |
| P2 — Email Engine | Migma + Grid&Pixel core | 38 | M-L |
| P2.5 — Brand Team Collab | Grid & Pixel oversight | 9 | M |
| P3 — Intelligence Studio | Instant | 9 | L |
| P4+ — Service Expansion | None (breadth) | 13 | M |
| XC — Cross-cutting | n/a | 24 (+10 stubs + 7 deferred appendix) | S-M |
| **Total** | | **140** (numbered) + 10 stubs + 7 deferred | |

After P3 acceptance, VIYO is the only product combining Lovart + Migma + Grid&Pixel + Instant moats. P4+ is scale and breadth.

---

## Section 3 — Bullet Tables Per Phase

### 3.0 Phase 0 — Substrate

Largely shipped by Manus (25 features Done, 3 In Progress). Bullets cover remaining substrate organized by 12 L-layers in FOUNDATION_AUTHORITY.md Section 5.

---

**B-0.01 — Substrate Audit & Gap Confirmation**
- Moat: None | Outcome: Authoritative gap list of remaining Phase 0 work confirmed against Inventory v002 + repo state
- VVOW: n/a | R-spec: R21 | Features: All 178 P0 features audited (catalog only)
- Locks: 13, 17 | Skills: directive-authoring-v2 (Architect-side)
- Prereqs: None | Parallel-safe with: All XC Bullets
- Acceptance: Per-substrate gap list produced, every P0 feature has Status (Done/In Progress/Not Started/Deferred), B-0.02 through B-0.22 scoped against this audit
- Complexity: S | Open deps: None

**B-0.02 — L1 Identity & Multi-Tenancy completion**
- Moat: None | Outcome: Supabase Auth + RLS + roles + MFA scaffold wired and tested across 83 brand-scoped tables
- VVOW: §18.2 | R-spec: R22 | Features: AUTH-01/02/03, MFA-01/04/05, PERM-01 through PERM-05, P0-04, P0-05, P1-09
- Locks: 13 | Skills: database-migration, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.01 | Parallel-safe with: B-0.03, B-0.04, B-0.05, B-0.06
- Acceptance: All 83 brand-scoped tables have RLS, MFA gate exists, service-role bypass detection in CI, role tests pass for all 5 roles
- Complexity: M | Open deps: None

**B-0.03 — L2 Asset Model completion (Brand Vault contract)**
- Moat: None | Outcome: assets table + parent_asset_id lineage + JSONB metadata + pgvector embeddings + write/read RPCs operational
- VVOW: §11.1-11.3 | R-spec: R20 (THIN — see B-XC.02) | Features: T32-AUTO-SAVE-VAULT (Done), T31-BRAND-VAULT-MENTION, P0-14, DA-07
- Locks: 6, 13 | Skills: database-migration, brand-vault-asset-write, writing-behavioral-tests
- Prereqs: B-0.01, B-0.02 | Parallel-safe with: B-0.04, B-0.05, B-0.06
- Acceptance: Asset write helper writes bytes to R2 + lineage row to DB atomically, parent_asset_id chain queryable, pgvector embedding indexed on every asset, RLS on brand_id enforced
- Complexity: M | Open deps: None

**B-0.04 — L3 Provider Routing baseline (plugin registry scaffold)**
- Moat: None | Outcome: Plugin Registry table + adapter interface + e-commerce normalizer + AES-256-GCM encryption helper. AI Plugin Registry slot reserved for B-XC.01.
- VVOW: §8.7-8.8 | R-spec: R29 PAL (ESP/e-commerce only currently) | Features: PAL-01, PAL-03, P1-03, P0-11
- Locks: 19, 13 | Skills: database-migration, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.01, B-0.02 | Parallel-safe with: B-0.03, B-0.05, B-0.06
- Acceptance: Provider Registry table exists, ESP adapter interface compiles, e-commerce normalizer round-trips Shopify fixture, encryption helper passes vector test, AI registry slot documented as awaiting B-XC.01
- Complexity: M | Open deps: None (GAP-001 closed via B-XC.01 R29 v2 ZCBR-PASS 2026-05-12 + OD-004 Iα ratified 2026-05-15)

**B-0.05 — L4 Job Orchestration baseline**
- Moat: None | Outcome: Inngest workers running on Render (3 envs), Mastra DAG framework wired, shared Zod schemas in packages/core-types
- VVOW: §8.2-8.3 | R-spec: R21 | Features: P0-01, P2-01, P2-13, P2-17
- Locks: 13 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.01 | Parallel-safe with: B-0.02, B-0.03, B-0.04, B-0.06
- Acceptance: Inngest dev server runs end-to-end fixture DAG, Mastra DAG composes 3 steps with checkpointing, shared Zod schemas compile, RLHF event emission helper available
- Complexity: M | Open deps: None

**B-0.06 — L5 Data Flywheel baseline**
- Moat: None | Outcome: rlhf_events + pattern_performance_metrics + qaScore propagation operational, event emission helpers live
- VVOW: §12, §12.1 | R-spec: R20 (THIN) | Features: PIA-ART-DIR-01, PIA-FLOW-01, PIA-MAAX-01
- Locks: 9 | Skills: database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.01, B-0.02 | Parallel-safe with: B-0.03, B-0.04, B-0.05
- Acceptance: RLHF event row inserts with +1/+5/-1/0 enforced via DB check constraint, qaScore aggregation RPC tested, rolling 30-day window maintained
- Complexity: M | Open deps: None

**B-0.07 — L6 Token Metering substrate (per D56 split)**
- Moat: None | Outcome: llm_usage_events + Stripe webhook handler + token deduction RPC + processed_stripe_events dedup. Phase 1 UI surface deferred to B-1.14.
- VVOW: §18.1 (Lock 8) | R-spec: R23 | Features: P2-18, P5-01, T9-BILLING, P2-15
- Locks: 8, 13, 19 (per D56) | Skills: database-migration, inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.01, B-0.04 | Parallel-safe with: B-0.05, B-0.06, B-0.08
- Acceptance: Stripe webhook idempotent (processed_stripe_events table), token deduction RPC uses row locking, programmatic ops grep returns zero token charges, 5-tier price config seeded
- Complexity: M | Open deps: None (OD-001 dissolved per PRD V8.1 §6.5 2026-05-14; pricing is Portal-configured runtime per §6.3)

**B-0.08 — L7 Observability baseline**
- Moat: None | Outcome: OpenTelemetry + Sentry + PostHog + structured JSON logs + generation_id trace context end-to-end
- VVOW: n/a | R-spec: R21 | Features: P0-03, P0-06, P5-14, GATE-01
- Locks: None directly | Skills: inngest-function-authoring, hono-route-authoring
- Prereqs: B-0.01, B-0.05 | Parallel-safe with: B-0.06, B-0.07, B-0.09
- Acceptance: Datadog OTel exporter live, Sentry 5 projects configured with 3 alert rules, PostHog 8 events flowing, env validation fails fast on boot
- Complexity: M | Open deps: None (Sentry alert rules PO action item, not blocking)

**B-0.09 — L8 Real-time Substrate**
- Moat: None | Outcome: Supabase Realtime channels + Presence + Postgres Changes wired with helpers
- VVOW: §11 + §3 Zone 2 | R-spec: R21 | Features: P3-01, P3-07, TMS-01
- Locks: 13 | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.01, B-0.02 | Parallel-safe with: B-0.07, B-0.08, B-0.10
- Acceptance: Channel naming convention documented, presence tracking helper works, broadcast helper accepts JSON, RLS enforced on Realtime subscriptions
- Complexity: S | Open deps: None

**B-0.10 — L9 Storage finalization**
- Moat: None | Outcome: R2 buckets (production + staging) with versioning + lifecycle + signed URLs + custom domain operational
- VVOW: §11.1 | R-spec: R21 | Features: P0-14, SEC-02
- Locks: 6 | Skills: hono-route-authoring
- Prereqs: B-0.01 | Parallel-safe with: B-0.07, B-0.08, B-0.09
- Acceptance: Two buckets with custom domain bound, signed URL helper tested, versioning + lifecycle policies confirmed via API, ID-3 acceptance checklist green
- Complexity: S | Open deps: None

**B-0.11 — L10 Webhook Pipeline (per Notion D11)**
- Moat: None | Outcome: Universal webhook dispatch with 7-retry exponential backoff + 72hr DLQ + HMAC-SHA256 + 500/min rate limit + 12-month version pin
- VVOW: n/a | R-spec: Notion D11 (supersedes T48) | Features: T17-WEBHOOKS-DB, T37, T38, T39, T40, PIA-WEBHOOK-01
- Locks: 13 | Skills: database-migration, inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.01, B-0.05, B-0.08 | Parallel-safe with: B-0.12
- Acceptance: All 6 D11 specs implemented, dispatcher handles 7 retries with backoff, DLQ holds 72hrs, HMAC validated, rate limit enforced, version pin honored
- Complexity: L | Open deps: None

**B-0.12 — L11 Pattern Substrate baseline**
- Moat: None | Outcome: image_prompt_patterns + Pattern Recipe JSON schema validation + pgvector indexing operational
- VVOW: §10.2-10.3 | R-spec: R20 (THIN) | Features: P0-08, P0-10
- Locks: 4, 5, 13 | Skills: database-migration, pattern-recipe-validation, writing-behavioral-tests
- Prereqs: B-0.01, B-0.02 | Parallel-safe with: B-0.11, B-0.13
- Acceptance: Pattern Recipe JSON schema validation rejects drift, pgvector cosine similarity query benchmarked, Lock 5 schema-drift forbidden test passes
- Complexity: M | Open deps: None

**B-0.13 — L12-A Builder Technical Skills baseline**
- Moat: None | Outcome: Tier 1 Builder Skills authored to Drive claude folder + uploaded to Portal product at ai.viyo.new per D63 Path E; loadable at runtime via skills.pickForTask()
- VVOW: n/a | R-spec: n/a | Features: P0-07 (L12-A scope only)
- Locks: 17 | Skills: directive-authoring-v2 (Architect-side)
- Prereqs: B-0.01 | Parallel-safe with: B-0.11, B-0.12, B-0.14
- Acceptance: Tier 1 Builder Skills authored in Drive + uploaded to Portal product, skills.pickForTask() returns each by name, PORTAL-QA-05 equivalent test passes
- Complexity: S | Open deps: None

**B-0.14 — L12-B Brain Pattern Skills baseline (skills_registry)**
- Moat: None | Outcome: skills_registry Postgres table seeded with Layer 2 skill rows (109+ per Skill Routing Map). Layer 1 Platform Skills in orchestrator code per D57, NOT this table.
- VVOW: n/a | R-spec: R19 | Features: P0-07 (L12-B scope), V11-25, VF-44, DA-13
- Locks: 19 | Skills: database-migration, writing-behavioral-tests
- Prereqs: B-0.01, B-0.13 | Parallel-safe with: B-0.12, B-0.15
- Acceptance: skills_registry seeded with Layer 2 from Skill Routing Map, Layer 1 Platform Skills explicitly NOT in table (per D57), brain assignments per routing map verified, versioning column present
- Complexity: M | Open deps: None

**B-0.15 — Two-layer prompt assembly substrate**
- Moat: None | Outcome: Two-layer assembler (Layer 1 static + Layer 2 dynamic injection from skills_registry) operational; MAAX orchestrator hook stubbed
- VVOW: §5.3 | R-spec: R19 | Features: P2-17
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.05, B-0.14 | Parallel-safe with: B-0.16, B-0.17
- Acceptance: Assembler composes Layer 1 + Layer 2 with token budget enforcement, injection rule resolution tested, MAAX hook contracts defined
- Complexity: M | Open deps: None

**B-0.16 — Platform Skills execution layer (per D57)**
- Moat: None | Outcome: Layer 1 Platform Skills (self-improving-agent, memory-self-heal, clawhub, openclaw orchestrators) wired in orchestrator code, NOT skills_registry
- VVOW: n/a | R-spec: R19 | Features: feature-set under L12 Layer 1
- Locks: 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.05, B-0.15 | Parallel-safe with: B-0.15, B-0.17
- Acceptance: Each Layer 1 Platform Skill executes as orchestrator code (not skills_registry lookup), injection rule references resolve correctly to Layer 1 code paths
- Complexity: M | Open deps: None

**B-0.17 — Shopify connector (PAL adapter, read-only catalog scope)**
- Moat: None | Outcome: Shopify PAL adapter operational with read-only catalog (products + product images + brand colors). Full sync deferred to P2 B-2.23.
- VVOW: §11, §4 | R-spec: R29 PAL + R31 (THIN — see B-XC.04) | Features: PAL-03, P1-05
- Locks: 19 | Skills: database-migration, hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.04 | Parallel-safe with: B-0.15, B-0.16, B-0.18
- Acceptance: Shopify OAuth ends with read-only scope, catalog sync fixture works, brand color extraction stored, Notion D17 read-only scope honored
- Complexity: L | Open deps: None

**B-0.18 — Klaviyo connector (PAL adapter scaffold)**
- Moat: None | Outcome: Klaviyo PAL adapter scaffold with PKCE OAuth foundation. Active scopes (campaigns:write, templates:write) deferred to P2 B-2.10.
- VVOW: n/a | R-spec: R29 PAL | Features: feature-set under L3 Klaviyo scaffold
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.04 | Parallel-safe with: B-0.17, B-0.19
- Acceptance: PKCE OAuth completes, token storage encrypted via AES-256-GCM, scope list captured but active scopes flagged "Phase 2 activation pending"
- Complexity: M | Open deps: None

**B-0.19 — Email Sender (Resend) configuration**
- Moat: None | Outcome: Brands receive transactional emails; Resend integration operational with custom domain DKIM/SPF/DMARC
- VVOW: n/a | R-spec: R21 | Features: INV-03, AUTH-03, AUTH-01
- Locks: 19 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.04, B-0.08 | Parallel-safe with: B-0.18, B-0.20
- Acceptance: Transactional send works end-to-end, DKIM/SPF/DMARC valid on custom domain, bounce/complaint webhook handler wired
- Complexity: M | Open deps: None

**B-0.20 — Health checks + Service status pages**
- Moat: None | Outcome: Health check endpoints + status pages for 27 services in Airtable Services Inventory
- VVOW: n/a | R-spec: R21 | Features: feature-set under L7, GATE-01
- Locks: None | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.08 | Parallel-safe with: B-0.19, B-0.21
- Acceptance: /health endpoint returns 200 with substrate dependency check, /status lists every service, alerts trigger on degraded
- Complexity: S | Open deps: None

**B-0.21 — Backup + Disaster Recovery foundation**
- Moat: None | Outcome: Supabase point-in-time recovery + R2 cross-region snapshot policy + documented recovery runbook
- VVOW: n/a | R-spec: B-XC.23 fresh DR runbook (SUPERSEDES R52 — R52 reclassified post-launch per PRD V8.1 §3.5 + Phase A A5 ratified 2026-05-15) | Features: feature-set under L7/L9
- Locks: None | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.08, B-0.10 | Parallel-safe with: B-0.20, B-0.22
- Acceptance: PITR confirmed on Supabase production, R2 snapshot policy active, recovery runbook in /docs/runbooks/ tested via tabletop exercise
- Complexity: M | Open deps: None (GAP-002 closed via B-XC.23 fresh DR runbook authoring; R52 reclassified post-launch per PRD V8.1 §3.5 + A5 2026-05-15)

**B-0.22 — Phase 0 Acceptance Gate**
- Moat: None (gate) | Outcome: All 12 substrates pass acceptance; PO ratifies P0 complete; P1 unblocked
- VVOW: n/a | R-spec: n/a | Features: Aggregate from B-0.02-B-0.21
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-0.02 through B-0.21 | Parallel-safe with: None (strictly sequential)
- Acceptance: All 12 substrate audits green, zero failing CI tests, FOUNDATION_AUTHORITY + CURRENT_STATE reflect P0 complete, PO §9 ratification logged
- Complexity: S | Open deps: None

---

### 3.1 Phase 1 — Image Studio + Brand Admin Shell + Lovart Billing

Absorbs Lovart's moat. Decomposes 41 P1 features plus features re-mapped from P2/P3 per Manus Inventory v002.

---

**B-1.00 — Studio Core Loop (vertical slice)**
- Moat: Lovart (initial path proven) | Outcome: User types prompt in Zone 1 → asset renders in Zone 2 → user drags/exports/regenerates. Every P0 substrate exercised end-to-end.
- VVOW: §3, §10.1, §10.2, §12 | R-spec: R20 (THIN), R24 (THIN), R29 PAL | Features: T24-STUDIO-LAYOUT (Done), T25-STUDIO-BACKEND, T26-STUDIO-FRONTEND (In Progress), T21-ART-DIRECTOR, T70-CACHE-ROUTE-META (Done), T32-AUTO-SAVE-VAULT (Done), IMG-01, IMG-02, IMG-11, AUTH-01, MB-02, MB-03, P1-10
- Locks: 4, 5, 6, 8, 9, 13, 19 | Skills: database-migration, inngest-function-authoring, hono-route-authoring, pattern-recipe-validation, brand-vault-asset-write, writing-behavioral-tests, image-generation-pipeline (NEW B-XC.07), pattern-cache-lookup (NEW B-XC.08), art-director-routing (NEW B-XC.09), rlhf-event-emission (NEW B-XC.10)
- Prereqs: B-0.22, B-XC.07, B-XC.08, B-XC.09, B-XC.10 | Parallel-safe with: B-1.01, B-1.14
- Acceptance: End-to-end loop completes from prompt to canvas render, cache hit + cache miss paths tested, 4 named failure modes covered (RLS denial, token budget exceeded, provider failure, validation error), RLHF events emit on drag/export/regenerate
- Complexity: L | Open deps: OD-003

**B-1.01 — Brand admin signup + onboarding wizard (app.viyo.com)**
- Moat: Lovart (admin shell) | Outcome: New brand signs up, completes onboarding, lands in Image Studio with workspace ready
- VVOW: n/a | R-spec: R22 | Features: AUTH-02, INV-05, INV-06, MB-02, MB-03, MB-06
- Locks: 13 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.02, B-0.19 | Parallel-safe with: B-1.00, B-1.02, B-1.14
- Acceptance: Signup → onboarding → workspace creation in <5min, Agency Portfolio supports >1 brand per user, magic link + password flows both work
- Complexity: L | Open deps: None

**B-1.02 — Team invites + role assignment**
- Moat: Lovart | Outcome: Brand owner invites teammates, assigns 5 roles + custom JSONB role
- VVOW: n/a | R-spec: R22 | Features: INV-03, INV-05, INV-06, PERM-01 through PERM-05
- Locks: 13 | Skills: hono-route-authoring, database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.02, B-0.19, B-1.01 | Parallel-safe with: B-1.00, B-1.03, B-1.14
- Acceptance: Invite email sent <60s, +60h expiration enforced, role enforcement test passes for all 5 roles + custom JSONB role
- Complexity: M | Open deps: None

**B-1.03 — Visual Intent Router + Brain 5 wiring**
- Moat: Lovart (core intelligence) | Outcome: User briefs translate into technical prompts behind the scenes
- VVOW: §5.3, §10.1 | R-spec: R19, R24 (THIN) | Features: IMG-01, IMG-02
- Locks: 4, 5, 12, 19 | Skills: inngest-function-authoring, pattern-cache-lookup, art-director-routing, writing-behavioral-tests
- Prereqs: B-1.00, B-0.15, B-0.16 | Parallel-safe with: B-1.04, B-1.05
- Acceptance: Brief embedding generates, top-K similarity returns patterns, model selection writes to assets.route_metadata, Mastra DAG checkpointing verified
- Complexity: L | Open deps: None

**B-1.04 — Designer Brain + Brain 6 wiring**
- Moat: Lovart | Outcome: Generated visuals maintain brand consistency (color, typography, voice) across formats
- VVOW: §5.3, §3 | R-spec: R19, R24 (THIN) | Features: feature-set under L11 for Designer Brain
- Locks: 12, 19 | Skills: inngest-function-authoring, pattern-recipe-validation, writing-behavioral-tests
- Prereqs: B-1.03 | Parallel-safe with: B-1.05 (sequential pairing with B-1.03)
- Acceptance: Designer Brain maintains brand DNA across multi-image sessions, color/typography/voice rules applied consistently, RLHF updates designer behavior
- Complexity: L | Open deps: None

**B-1.05 — Pattern Seeding pipeline (Milled scraper)**
- Moat: Lovart (Pattern DB content is moat-behind-moat) | Outcome: New brands have non-empty Pattern DB from day one
- VVOW: §10.4 | R-spec: R46 (IMAP only — Milled is separate pipeline) | Features: PIA-1-DB-SCHEMA-FOUNDATION
- Locks: 5, 11, 19 | Skills: inngest-function-authoring, hono-route-authoring, pattern-recipe-validation, writing-behavioral-tests
- Prereqs: B-0.12, B-1.03 | Parallel-safe with: B-1.04, B-1.06, B-1.07
- Acceptance: Daily Inngest scrape runs against Milled, image stored in R2 with attribution, Claude Vision produces Pattern Recipe conforming to locked schema, pattern enters Active state queryable by Visual Intent Router
- Complexity: L | Open deps: OD-002 (Milled OK per VVOW §10.4 internal reference; Email Love + RGE expansion blocked), OD-004

**B-1.06 — Tinder Swipe Gate UI (admin.viyo.com swipe reviewer)**
- Moat: Lovart (RLHF quality gate) | Outcome: Reviewers triage auto-approved + auto-rejected via side-by-side swipe
- VVOW: §12.3 | R-spec: R24 (THIN) | Features: feature-set under L5/L1 swipe reviewer
- Locks: 9 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.06, B-1.05 | Parallel-safe with: B-1.05, B-1.07
- Acceptance: 3 reviewer accounts can log in, swipe UI loads 50% auto-approved + 20% auto-rejected sample, swipe decisions update rlhf_events with override or confirmation
- Complexity: M | Open deps: OD-005 (3 reviewer accounts)

**B-1.07 — 22 Generation Modes part 1 (A1-A8: e-commerce + brand basics)**
- Moat: Lovart | Outcome: A1 Product Photography, A2 Typography Poster, A3 Compositional Poster, A4 Lifestyle Scene, A5 Product Flat Lay, A6 Product-on-Model, A7 Social Media Ad, A8 Email Hero
- VVOW: §4.1-4.2 | R-spec: R24 (THIN) | Features: PIA-IMG-COMP, PIA-IMG-MODEL, PIA-IMG-FLAT, T41-STYLE-LIBRARY (partial), IMG-02, IMG-11, P2-09
- Locks: 4, 5, 12, 19 | Skills: inngest-function-authoring, pattern-cache-lookup, art-director-routing, brand-vault-asset-write
- Prereqs: B-1.03, B-1.04, B-1.05 | Parallel-safe with: B-1.06, B-1.08, B-1.09
- Acceptance: Each of A1-A8 generates end-to-end with cache-first, type metadata in assets.asset_type, pattern type_name queryable from DB (not enum), RLHF events emit per generation
- Complexity: L | Open deps: None

**B-1.08 — 22 Generation Modes part 2 (A9-A14: brand + asset)**
- Moat: Lovart | Outcome: A9 Brand Pattern, A10 Color Palette, A11 Mood Board, A12 Texture, A13 Background, A14 Icon Set. A10 closes G1.
- VVOW: §4.1, §14 (G1) | R-spec: R24 (THIN) | Features: PIA-IMG-COMP
- Locks: 4, 5, 12, 19 | Skills: inngest-function-authoring, pattern-cache-lookup, brand-vault-asset-write
- Prereqs: B-1.07 | Parallel-safe with: B-1.09, B-1.10
- Acceptance: Each of A9-A14 generates end-to-end, color palette includes hex values + contrast ratios + application guidance (G1 closed)
- Complexity: L | Open deps: None

**B-1.09 — 22 Generation Modes part 3 (A16-A22: marketing + fashion + ecom advanced)**
- Moat: Lovart | Outcome: A16 Before/After, A17 Seasonal, A18 Collection, A19 Lookbook, A20 Detail Shot, A21 Scale Reference, A22 Packaging
- VVOW: §4.1 | R-spec: R24 (THIN), R30 | Features: feature-set under L11
- Locks: 4, 5, 12, 19 | Skills: inngest-function-authoring, pattern-cache-lookup, brand-vault-asset-write
- Prereqs: B-1.07 | Parallel-safe with: B-1.08, B-1.10
- Acceptance: Each of A16-A22 generates with type-specific patterns
- Complexity: L | Open deps: None

**B-1.10 — A15 Brand Kit Mode (composite generation, public-launch blocker)**
- Moat: Lovart (Lovart's #1 wow factor) | Outcome: One prompt → complete brand identity (logo suite + palette + typography + social templates + mockups + brand guidelines PDF)
- VVOW: §4.3, §14 (G2 launch blocker, G3 PDF) | R-spec: R24 (THIN), R30 | Features: PIA-BRAND-KIT
- Locks: 4, 5, 12, 19 | Skills: inngest-function-authoring, pattern-cache-lookup, brand-vault-asset-write, writing-behavioral-tests
- Prereqs: B-1.08, B-1.09 | Parallel-safe with: B-1.11, B-1.12
- Acceptance: Single A15 prompt produces all 6 component types with shared brand_kit_id, components saved to Brand Vault with grouped metadata, brand guidelines PDF compiles and downloads, G2 + G3 closed
- Complexity: XL | Open deps: None

**B-1.11 — Editing Tools part 1: Programmatic (B2, B4-prog, B7, B8) — 0 AI tokens**
- Moat: Lovart (editing parity) | Outcome: User edits text, swaps backgrounds (programmatic), upscales, adjusts brightness/contrast/saturation/crop/resize/flip/rotate via Sharp/PIL with 0 AI tokens
- VVOW: §3 Zone 3, §8.5, §13 | R-spec: R24 (THIN) | Features: T29-BG-SWAP (programmatic component)
- Locks: 8, 19 | Skills: inngest-function-authoring, brand-vault-asset-write, writing-behavioral-tests
- Prereqs: B-1.00, B-0.03 | Parallel-safe with: B-1.10, B-1.12
- Acceptance: B2 Text Edit renders live GrapesJS overlay (not AI), B4 programmatic via Sharp, B7 Upscale via Real-ESRGAN, B8 Quick Edit ops <100ms with 0 tokens, grep test confirms no token charges
- Complexity: M | Open deps: None

**B-1.12 — Editing Tools part 2: AI-powered (B1, B5, B9, B10, B6)**
- Moat: Lovart | Outcome: Click + describe (B1), remove object (B5), apply style ref (B9), swap material (B10), expand canvas (B6) via SAM 2 + Flux 1.1 Pro
- VVOW: §3 Zone 3, §13 | R-spec: R24 (THIN) | Features: T27-TOUCH-EDIT, T29-BG-SWAP (AI component)
- Locks: 4, 19 | Skills: inngest-function-authoring, brand-vault-asset-write, image-generation-pipeline, writing-behavioral-tests
- Prereqs: B-1.00, B-1.11 | Parallel-safe with: B-1.13, B-1.14
- Acceptance: Each AI-edit tool completes via Provider Registry (no hardcoded model names), edits write child assets with parent_asset_id chain, RLHF emits on each edit
- Complexity: L | Open deps: None

**B-1.13 — B3 Layer Splitting (Lovart-style lazy extraction per C-01)**
- Moat: Lovart (highest-skill capability) | Outcome: User clicks edit on text region, SAM 2 + OCR + Flux 1.1 Pro inpainting extract text as editable overlay; original preserved
- VVOW: §13 | R-spec: R24 (THIN) | Features: T28-LAYER-SPLIT
- Locks: 4, 5, 8, 19 | Skills: inngest-function-authoring, brand-vault-asset-write, layer-splitting-pipeline (NEW B-XC.11), writing-behavioral-tests
- Prereqs: B-1.12, B-XC.11 | Parallel-safe with: B-1.14, B-1.15
- Acceptance: Lazy extraction triggers only on edit click, SAM 2 + Tesseract + Flux orchestrate via Provider Registry, original bytes unchanged in R2, edit produces child asset with parent_asset_id chain, C-01 PO ratifications honored
- Complexity: XL | Open deps: None

**B-1.14 — Lovart-style billing UI (subscription tier + usage + feature gating)**
- Moat: Lovart (Lovart billing parity) | Outcome: Brand selects tier, sees usage dashboard, hits feature gates per tier
- VVOW: n/a | R-spec: R23 | Features: T26-STUDIO-FRONTEND billing-token-economics slice (In Progress)
- Locks: 8 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.07, B-1.01 | Parallel-safe with: B-1.12, B-1.13, B-1.15
- Acceptance: Tier select works, usage dashboard shows token consumption, feature gating enforced (Premium multiplier 400,802 only on Agency/Enterprise), top-up pack flow tested, OD-001 reconciled
- Complexity: L | Open deps: OD-001

**B-1.15 — Brand Vault search + tagging (auto + manual #tagging)**
- Moat: Lovart | Outcome: User searches by natural language, uses # tags in Brand Chat, sees auto-tagged metadata
- VVOW: §11.3-11.4 | R-spec: R31 (THIN — see B-XC.04) | Features: T31-BRAND-VAULT-MENTION, T36-SUPER-SEARCH (early surface)
- Locks: 6 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.03, B-1.00 | Parallel-safe with: B-1.14, B-1.16
- Acceptance: Natural language search returns ranked results, auto tags extracted on upload, manual #tagging writes to same tags array, search filters by asset_type and date range work
- Complexity: M | Open deps: None

**B-1.16 — Version History panel**
- Moat: Lovart | Outcome: Thumbnails + timestamps for all asset versions, side-by-side comparison, revert
- VVOW: §11.2.1 | R-spec: R20 (THIN) | Features: T30-VERSION-HISTORY
- Locks: 6 | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.03, B-1.13 | Parallel-safe with: B-1.15, B-1.17
- Acceptance: Version panel renders parent_asset_id chain as thumbnails, side-by-side works, revert points active reference back to parent without deleting any version
- Complexity: M | Open deps: None

**B-1.17 — DSPy prompt optimization loop**
- Moat: Lovart (data flywheel IS the moat) | Outcome: Patterns auto-improve over time without user action
- VVOW: §8.6, §12, §12.3 | R-spec: R24 (THIN) | Features: feature-set under L5/L11
- Locks: 9 | Skills: inngest-function-authoring, pattern-recipe-validation, writing-behavioral-tests
- Prereqs: B-0.06, B-1.06, B-1.07 | Parallel-safe with: B-1.16, B-1.18
- Acceptance: Scheduled DSPy job ingests last 24h RLHF, produces optimized prompt template, updates patterns with version bump, before/after fidelity test passes on holdout
- Complexity: L | Open deps: None

**B-1.18 — Phase 1 Acceptance Gate (Lovart parity verified)**
- Moat: Lovart (verification) | Outcome: P1 acceptance demo — VIYO replicates Lovart's full surface
- VVOW: §14 (G1+G2+G3 closed) | R-spec: All P1-referenced R-specs verified or rewrite scheduled | Features: Aggregate from B-1.00 through B-1.17
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-1.00 through B-1.17, OD-001/003/004/005 closed | Parallel-safe with: None
- Acceptance: Lovart parity demo runs, A15 Brand Kit works, 22 modes generate, 11 editing tools function, Pattern DB seeded, RLHF flywheel emitting, Lovart-style billing operational, swipe gate live
- Complexity: S | Open deps: OD-001, OD-003, OD-004, OD-005

---

### 3.1B Phase 1B — Intelligence Foundation

Hard prereq for P2. 23 features per Inventory.

---

**B-1B.01 — R46 IMAP Email Ingestion (AgentMail)**
- Moat: None | Outcome: Brand provides email account; VIYO ingests inbound emails into ATLAS corpus
- VVOW: §10.4 (distinction from Pattern Seeding) | R-spec: R46 | Features: PIA-MAAX, PIA-HYVE
- Locks: 19 | Skills: inngest-function-authoring, hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.04, B-0.05, B-1.18 | Parallel-safe with: B-1B.02, B-1B.03
- Acceptance: AgentMail OAuth completes, IMAP polls on schedule, inbound emails stored in assets with ingestion-corpus prefix, provenance metadata complete, PII redaction via P1-09 applied
- Complexity: L | Open deps: None

**B-1B.02 — R25 Video / IG Intelligence ingestion**
- Moat: None | Outcome: VIYO ingests IG Reels + YouTube + MP4 uploads into ATLAS corpus
- VVOW: n/a | R-spec: R25 | Features: PIA-MAAX
- Locks: 19 | Skills: inngest-function-authoring, brand-vault-asset-write, writing-behavioral-tests
- Prereqs: B-0.04, B-0.05 | Parallel-safe with: B-1B.01, B-1B.03
- Acceptance: Video upload triggers Whisper transcription + ffmpeg frame extraction, transcripts indexed for search, frames written to assets table
- Complexity: M | Open deps: None

**B-1B.03 — SYPHON ESP daily sync**
- Moat: None | Outcome: Brand's Klaviyo performance data syncs daily into VIYO
- VVOW: n/a | R-spec: R38 SYPHON | Features: PIA-SYPHON, PIA-4-SYPHON-DAILY-SYNC-FOUNDATION
- Locks: 19 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-0.18 | Parallel-safe with: B-1B.01, B-1B.02, B-1B.04
- Acceptance: Daily Inngest cron runs SYPHON sync, Klaviyo segment data normalized via PAL, written to pattern_performance_metrics, retries per R29 PAL
- Complexity: M | Open deps: None

**B-1B.04 — MAAX Brand Memory graph**
- Moat: None | Outcome: Per-brand memory graph populated from ATLAS + SYPHON; queryable by all Brains as context
- VVOW: n/a | R-spec: R37 MAAX | Features: PIA-MAAX, PIA-5-MAAX-PREFERENCE-CAPTURE-FOUNDATION
- Locks: 13, 19 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-1B.01, B-1B.02, B-1B.03 | Parallel-safe with: B-1B.05
- Acceptance: MAAX brand memory queryable per brand_id (RLS enforced), preferences captured from RLHF + corpus, graph queries return <100ms p95
- Complexity: L | Open deps: None

**B-1B.05 — HYVE opt-in network (anonymized cross-brand)**
- Moat: None (corpus moat) | Outcome: Brands opt-in to anonymized aggregation; benefit from cross-brand learning without leaking data
- VVOW: n/a | R-spec: R36 HYVE | Features: PIA-HYVE, PIA-3-HYVE-ADMIN-CONSENT-SURFACE
- Locks: 13, 19 | Skills: hono-route-authoring, database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.04 | Parallel-safe with: B-1B.06
- Acceptance: Opt-in consent flow live, anonymization verified (no brand_id linkage in HYVE records), cross-brand queries return relevant patterns
- Complexity: L | Open deps: None

**B-1B.06 — PIA Validation Evidence pipeline**
- Moat: None | Outcome: Validation evidence captured for every P1B ingestion; data quality + completeness metrics surfaced
- VVOW: n/a | R-spec: R46 | Features: PIA-6-PIA-VALIDATION-EVIDENCE-FOUNDATION
- Locks: None | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.01, B-1B.02, B-1B.03 | Parallel-safe with: B-1B.05, B-1B.07
- Acceptance: Every ingestion event emits validation evidence, dashboard surfaces completeness metrics, low-quality ingestions flagged
- Complexity: M | Open deps: None

**B-1B.07 — Phase 1B Acceptance Gate**
- Moat: None | Outcome: Corpus sufficient for P2 Email Engine
- VVOW: n/a | R-spec: All P1B R-specs verified | Features: Aggregate from B-1B.01-B-1B.06
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-1B.01 through B-1B.06 | Parallel-safe with: None
- Acceptance: ATLAS corpus has >N ingested emails for testing (N defined post-B-XC.05 R32 read), MAAX queryable, HYVE opt-in tested with sample brands, PIA validation green
- Complexity: S | Open deps: None

---

### 3.2 Phase 2 — Email Engine + Flows + Segments + Popups + Deliverability

Absorbs Migma + Grid&Pixel core. 220 features — largest phase, 38 Bullets.

---

**B-2.01 — Email Engine substrate (MJML compilation)**
- Moat: Migma | Outcome: MJML compiler + 12 Section Templates seeded + JSON MJML Recipe schema locked
- VVOW: §2.3 (Unified GrapesJS Backbone) | R-spec: R32, R27 | Features: P3-01, P0-10
- Locks: 2, 3, 19 | Skills: database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.07, B-0.05 | Parallel-safe with: B-2.02, B-2.03
- Acceptance: MJML compilation produces email-safe HTML, 12 Section Templates render correctly across clients (Litmus), JSON MJML Recipe schema validated
- Complexity: L | Open deps: None

**B-2.02 — 13-Agent Brain Council orchestration**
- Moat: Migma | Outcome: Email generation invokes 13-agent council via two-layer prompt
- VVOW: §5.1-5.2 | R-spec: R19, R32 | Features: PIA-MAAX
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.01, B-0.15, B-1B.04 | Parallel-safe with: B-2.03, B-2.04
- Acceptance: Brain Council DAG completes end-to-end, all 13 agents callable, two-layer prompt verified per agent, RLHF events per step
- Complexity: XL | Open deps: None

**B-2.03 — Email Bible loaded (CMO Brain dependency)**
- Moat: Migma | Outcome: Email generation honors brand strategic direction via Email Bible
- VVOW: n/a | R-spec: R32 | Features: DA-09, DA-13, DA-14
- Locks: 12, 19 | Skills: database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.02 | Parallel-safe with: B-2.04, B-2.05
- Acceptance: Email Bible upstream + VIYO extensions queryable, weekly cron syncs extensions, CMO Brain references Bible in all generations
- Complexity: M | Open deps: None

**B-2.04 — 12 Copywriting frameworks (PAS, AIDA, BAB, FAB, QUEST, PASTOR, etc.)**
- Moat: Migma | Outcome: Copywriter Brain selects framework per email type/audience
- VVOW: n/a | R-spec: R32 | Features: EF-10, feature-set under L12-B Copywriter
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.14, B-2.02 | Parallel-safe with: B-2.03, B-2.05, B-2.06
- Acceptance: All 12 frameworks in skills_registry, framework selection writes to email metadata, framework-specific copy quality tested
- Complexity: M | Open deps: None

**B-2.05 — Tone modifiers (welcome, urgency, holiday warmth, post-purchase, vip, winback, browse, cart, educational, re-engagement)**
- Moat: Migma | Outcome: Email tone matches flow/segment context
- VVOW: n/a | R-spec: R32 | Features: feature-set under L12-B tone modifiers
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.14, B-2.04 | Parallel-safe with: B-2.06, B-2.07
- Acceptance: All tone modifiers registered, MAAX injects correct modifier per context, A/B winning tone tracked
- Complexity: M | Open deps: None

**B-2.06 — Format enforcers (12 formats: single product, grid, lookbook, newsletter, plain text, gift guide, flash sale, comparison, testimonial, editorial, announcement, product launch)**
- Moat: Migma | Outcome: Email format matches strategic intent
- VVOW: n/a | R-spec: R32, R27 | Features: feature-set under L12-B format enforcers
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.14, B-2.05 | Parallel-safe with: B-2.07, B-2.08
- Acceptance: All 12 format enforcers registered, format-specific rendering verified
- Complexity: M | Open deps: None

**B-2.07 — Migma import (Figma)**
- Moat: Migma (direct moat absorption) | Outcome: User pastes Figma URL, VIYO imports as editable email
- VVOW: §2.3 | R-spec: R32 | Features: PIA-MIGMA
- Locks: 3, 19 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.01, B-2.02 | Parallel-safe with: B-2.08, B-2.09
- Acceptance: Figma URL paste imports, resulting email editable, fidelity preserved on core layouts
- Complexity: L | Open deps: None

**B-2.08 — Migma import (HTML + Screenshot)**
- Moat: Migma | Outcome: User pastes HTML or uploads screenshot, VIYO imports as editable email
- VVOW: §2.3 | R-spec: R32 | Features: PIA-MIGMA
- Locks: 3, 19 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.07 | Parallel-safe with: B-2.09, B-2.10
- Acceptance: HTML import preserves layout, screenshot import via Claude Vision produces editable MJML JSON Recipe
- Complexity: L | Open deps: None

**B-2.09 — Remix from competitor corpus**
- Moat: Migma | Outcome: User browses ingested competitor emails, hits Remix, VIYO generates on-brand version
- VVOW: n/a | R-spec: R32 | Features: PIA-MIGMA
- Locks: 3, 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.07, B-2.08 | Parallel-safe with: B-2.10, B-2.11
- Acceptance: User selects corpus email, Remix produces on-brand version, brand DNA applied via MAAX, output editable
- Complexity: L | Open deps: None

**B-2.10 — Klaviyo deployment pipeline**
- Moat: Grid & Pixel core | Outcome: User clicks "Send to Klaviyo" — campaign deploys with template + audience + schedule
- VVOW: n/a | R-spec: R32, R29 PAL | Features: P3-05, P3-07, V11-23
- Locks: 19 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.18, B-2.01 | Parallel-safe with: B-2.11, B-2.12
- Acceptance: Klaviyo deployment end-to-end, deploy preflight catches errors before send, deployed campaign matches preview
- Complexity: L | Open deps: None

**B-2.11 — Flow Templates 1 (Welcome, Cart Abandonment, Browse Abandonment)**
- Moat: Migma | Outcome: 3 pre-built flows with brand-customized copy
- VVOW: n/a | R-spec: R32 | Features: PIA-FLOW
- Locks: 12 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.10 | Parallel-safe with: B-2.12, B-2.13
- Acceptance: 3 flows deploy to Klaviyo, brand-customized copy generated via Brain Council, triggers tested
- Complexity: L | Open deps: None

**B-2.12 — Flow Templates 2 (Post-Purchase, Win-back, Re-engagement, VIP)**
- Moat: Migma | Outcome: 4 additional flows
- VVOW: n/a | R-spec: R32 | Features: PIA-FLOW
- Locks: 12 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.11 | Parallel-safe with: B-2.13, B-2.14
- Acceptance: 4 flows deploy, tested
- Complexity: L | Open deps: None

**B-2.13 — Flow Templates 3 (Educational + remaining)**
- Moat: Migma | Outcome: Educational + final batch
- VVOW: n/a | R-spec: R32 | Features: PIA-FLOW
- Locks: 12 | Skills: inngest-function-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.12 | Parallel-safe with: B-2.14, B-2.15
- Acceptance: Final flows deploy, 11+ flow library tested
- Complexity: L | Open deps: None

**B-2.14 — Klaviyo segment sync**
- Moat: Grid & Pixel | Outcome: Klaviyo segments sync into VIYO as audience selectors
- VVOW: n/a | R-spec: R32 | Features: V11-23, PIA-SEG
- Locks: 19 | Skills: inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-1B.03, B-2.10 | Parallel-safe with: B-2.15, B-2.16
- Acceptance: Segments sync daily, audience selector lists active segments, segment-targeted send works
- Complexity: M | Open deps: None

**B-2.15 — VIYO segment recommendations (Audience Brain)**
- Moat: Grid & Pixel | Outcome: VIYO recommends new segments based on brand data
- VVOW: n/a | R-spec: R32 | Features: PIA-SEG
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.04, B-2.02, B-2.14 | Parallel-safe with: B-2.16, B-2.17
- Acceptance: Audience Brain produces ranked recommendations, user accept/reject, accepted segments deploy to Klaviyo
- Complexity: M | Open deps: None

**B-2.16 — 7/30-day Campaign Calendar**
- Moat: Migma | Outcome: Calendar view of recommended campaign sequence
- VVOW: n/a | R-spec: R32 | Features: feature-set under L4
- Locks: 12 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.13, B-2.15 | Parallel-safe with: B-2.17, B-2.18
- Acceptance: 7-day + 30-day calendars generate, drag-to-reschedule works
- Complexity: L | Open deps: None

**B-2.17 — Popups (Grid & Pixel parity)**
- Moat: Grid & Pixel | Outcome: User creates popups (exit intent, time, scroll, click) connected to Klaviyo lists
- VVOW: n/a | R-spec: R32 | Features: feature-set under PIA popups
- Locks: 19 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.10 | Parallel-safe with: B-2.18, B-2.19
- Acceptance: Popups deploy as embeddable script, triggers fire correctly, signups write to Klaviyo lists
- Complexity: L | Open deps: None

**B-2.18 — Automatic Suppression (Grid & Pixel parity)**
- Moat: Grid & Pixel | Outcome: Low-intent users auto-suppressed; lifts performance + reduces Klaviyo bill
- VVOW: n/a | R-spec: R32 | Features: feature-set under PIA suppression
- Locks: 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.03, B-2.14 | Parallel-safe with: B-2.17, B-2.19, B-2.20
- Acceptance: Suppression criteria configurable per brand, daily job runs, writes to Klaviyo suppression list verified
- Complexity: M | Open deps: None

**B-2.19 — Magic Mail deliverability (Grid & Pixel parity)**
- Moat: Grid & Pixel | Outcome: Sender warming + content scoring + deliverability dashboards
- VVOW: n/a | R-spec: R32 | Features: DA-23
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.02, B-2.10 | Parallel-safe with: B-2.18, B-2.20
- Acceptance: Sender warming runs, content scoring blocks risky sends, deliverability dashboard surfaces issues
- Complexity: L | Open deps: None

---

**B-2.20 — AI Klaviyo Audits (read-only)**
- Moat: Grid & Pixel | Outcome: VIYO audits brand's Klaviyo account, surfaces what to fix
- VVOW: n/a | R-spec: R32 | Features: V11-20
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.03 | Parallel-safe with: B-2.19, B-2.21
- Acceptance: Audit runs end-to-end against staging Klaviyo, report identifies common issues, recommendations actionable
- Complexity: M | Open deps: None

**B-2.21 — A/B Testing (20% split, 48h window, auto-winner)**
- Moat: Migma | Outcome: A/B tests auto-promote winner at 48h
- VVOW: n/a | R-spec: R32 | Features: feature-set under PIA/L5
- Locks: 9 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.10, B-0.06 | Parallel-safe with: B-2.22, B-2.23
- Acceptance: 20% split deploys, winner determined at 48h, remaining 80% gets winning version
- Complexity: M | Open deps: None

**B-2.22 — Performance Feedback Loop (48h winning formula extraction)**
- Moat: Migma | Outcome: Winning formulas auto-extract at 48h, feed Pattern DB + DSPy
- VVOW: §12.2 | R-spec: R32, R24 (THIN) | Features: EF-08
- Locks: 9 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.21, B-1.17 | Parallel-safe with: B-2.23, B-2.24
- Acceptance: 48h extraction runs, winning patterns boost fidelityScore, DSPy reads updates, before/after holdout test passes
- Complexity: M | Open deps: None

**B-2.23 — Shopify deepens (orders + customers + Web Pixel + write_price_rules + write_discounts per D17)**
- Moat: Grid & Pixel (commerce depth) | Outcome: Full Shopify scope; VIYO uses orders for targeting, customers for personalization, Web Pixel for behavior
- VVOW: n/a | R-spec: R29 PAL, R32 | Features: P1-12
- Locks: 19, 13 | Skills: database-migration, inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.17 | Parallel-safe with: B-2.22, B-2.24
- Acceptance: Full scope OAuth completes, Web Pixel fires on brand site, discount codes generate dynamically, RLS enforced on cross-brand
- Complexity: L | Open deps: None

**B-2.24 — SMS Copywriter + SMS channel scaffold (Agent 10)**
- Moat: Migma | Outcome: SMS-formatted copy alongside email
- VVOW: §5.2 | R-spec: R32 | Features: feature-set under PIA/L4 SMS
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.02 | Parallel-safe with: B-2.23, B-2.25
- Acceptance: SMS Copywriter produces 160-char copy, integrates with Email Council, channel scaffold accepts future SMS provider
- Complexity: M | Open deps: None

**B-2.25 — VeriClaw (Agent 8)**
- Moat: Grid & Pixel (Trust Layer prep) | Outcome: Every campaign passes VeriClaw audit before user sees it
- VVOW: §5.2 | R-spec: R32 | Features: feature-set under PIA/L4
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.02 | Parallel-safe with: B-2.24, B-2.26
- Acceptance: VeriClaw audit runs, blocks known policy violations, audit log captured per generation
- Complexity: M | Open deps: None

**B-2.26 — Flow Strategy (Agent 9)**
- Moat: Migma | Outcome: Strategic flow recommendations based on data
- VVOW: §5.2 | R-spec: R32 | Features: PIA-FLOW-01
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.02, B-2.13 | Parallel-safe with: B-2.25, B-2.27
- Acceptance: Flow Strategy produces ranked recommendations, user accepts/customizes/rejects
- Complexity: M | Open deps: None

**B-2.27 — ATLAS Top Brain integration (corpus query at generation time)**
- Moat: Instant prep (ATLAS bridges) | Outcome: Every generation queries ATLAS for cross-brand patterns
- VVOW: §5.2 | R-spec: R32, R37, R38 | Features: PIA-MAAX, PIA-7-FUTURE-INTELLIGENCE-ACTIVATION
- Locks: 12, 13, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1B.07, B-2.02 | Parallel-safe with: B-2.26, B-2.28
- Acceptance: ATLAS query returns relevant cross-brand patterns per generation, RLS enforced (no cross-tenant leakage), HYVE opt-in honored
- Complexity: L | Open deps: None

**B-2.28 — Smart Insight Engine 5 scheduled generators (Agent 12)**
- Moat: Grid & Pixel | Outcome: Brand receives 5 scheduled insight reports
- VVOW: §5.2 | R-spec: R32 | Features: PIA-ANALYTICS
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.27 | Parallel-safe with: B-2.29
- Acceptance: 5 insight generators produce reports on schedule, surfaced in brand admin
- Complexity: M | Open deps: None

**B-2.29 — Contextual AI Advisor (Agent 13)**
- Moat: Grid & Pixel | Outcome: In-app advisor surfaces contextual recommendations at decision points
- VVOW: §5.2 | R-spec: R32 | Features: feature-set under PIA
- Locks: 12 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.28 | Parallel-safe with: B-2.30
- Acceptance: Advisor surfaces at right decision points, recommendations actionable, user dismiss/accept/ignore
- Complexity: M | Open deps: None

**B-2.30 — Two-layer prompt full activation (all 13 Brains)**
- Moat: Migma | Outcome: All P2 generations use two-layer assembly with per-brain token budget
- VVOW: n/a | R-spec: R19, R32 | Features: P2-17, P2-15
- Locks: 8, 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.15, B-2.02 | Parallel-safe with: B-2.29, B-2.31
- Acceptance: Every Brain in P2 uses two-layer, token budget enforced per brain, breach blocks generation with clear error
- Complexity: M | Open deps: None

**B-2.31 — Email Engine Pattern DB (parallel to image_prompt_patterns)**
- Moat: Migma | Outcome: Email-specific patterns accumulate alongside image patterns
- VVOW: n/a | R-spec: R20 (THIN), R46 | Features: feature-set under L11 email patterns
- Locks: 4, 5 | Skills: database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-0.12, B-1B.01, B-2.22 | Parallel-safe with: B-2.30, B-2.32
- Acceptance: email_prompt_patterns table exists with Pattern Recipe schema, populated by ingestion + A/B winners, queryable by Copywriter Brain
- Complexity: M | Open deps: None

**B-2.32 — Composable Sections library (per R27)**
- Moat: Migma | Outcome: User assembles emails from composable sections, swap without breaking layout
- VVOW: n/a | R-spec: R27 | Features: feature-set under L2/L4 sections
- Locks: 2, 3 | Skills: database-migration, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-2.01 | Parallel-safe with: B-2.31, B-2.33
- Acceptance: Section library has 12+ sections, drag-drop works, MJML compiles email-safe output, section swap preserves data
- Complexity: L | Open deps: None

**B-2.33 — Visual Router Brain (image utilities for Email Engine)**
- Moat: Migma | Outcome: Email Engine pulls images from Brand Vault using Visual Router for layout fit
- VVOW: §2.3 | R-spec: R32, R27 | Features: feature-set under L12-B Visual Router
- Locks: 12, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-1.18, B-2.32 | Parallel-safe with: B-2.32, B-2.34
- Acceptance: Visual Router selects optimal images per email section, layout-fit verified
- Complexity: M | Open deps: None

**B-2.34 — Live-Sync Edit flow (Email Studio → Image Studio modal)**
- Moat: Migma (Lovart-style edit-in-place for email images) | Outcome: User clicks Edit on email image, Image Studio modal opens, save creates new version, Email Studio auto-updates UUID
- VVOW: §2.3 | R-spec: R27, R20 (THIN) | Features: feature-set under L2/L8
- Locks: 6 | Skills: hono-route-authoring, brand-vault-asset-write, writing-behavioral-tests
- Prereqs: B-1.16, B-2.32 | Parallel-safe with: B-2.33, B-2.35
- Acceptance: Edit modal opens with Image Studio inside, save creates version with parent_asset_id chain, Email Studio UUID auto-updates
- Complexity: L | Open deps: None

**B-2.35 — Real-time generation inside Email Studio**
- Moat: Migma | Outcome: User generates images directly inside Email Studio (post-V1 feature per R24)
- VVOW: §2.3 | R-spec: R24, R27 | Features: feature-set
- Locks: 2 | Skills: inngest-function-authoring, hono-route-authoring, image-generation-pipeline
- Prereqs: B-1.18, B-2.34 | Parallel-safe with: B-2.34, B-2.36
- Acceptance: In-Email generation completes, output saves to Brand Vault, reference inserts into email
- Complexity: L | Open deps: None

**B-2.36 — Deploy preflight + safety gates**
- Moat: Grid & Pixel (Trust Layer prep) | Outcome: Pre-deploy safety checks (broken links, deliverability red flags, brand rule violations)
- VVOW: n/a | R-spec: R32 | Features: P3-07
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.10, B-2.19 | Parallel-safe with: B-2.35, B-2.37
- Acceptance: Preflight catches all defined issue types, blocks deploy on red flags, surfaces user-actionable error
- Complexity: M | Open deps: None

**B-2.37 — Image CDN upload + URL rewriting**
- Moat: Grid & Pixel (deliverability) | Outcome: Email images served from R2 CDN; URLs persistent
- VVOW: n/a | R-spec: R32, R21 | Features: P3-05
- Locks: 6, 19 | Skills: inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-0.10, B-2.10 | Parallel-safe with: B-2.36, B-2.38
- Acceptance: Email images served from assets.viyo.email, URLs persistent (no breakage on Brand Vault regen), email client tests pass
- Complexity: M | Open deps: None

**B-2.38 — Phase 2 Acceptance Gate**
- Moat: Migma + Grid & Pixel core (verification) | Outcome: P2 demo — VIYO matches Migma + Grid & Pixel core surfaces
- VVOW: n/a | R-spec: All P2 R-specs verified | Features: Aggregate from B-2.01-B-2.37
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-2.01 through B-2.37 | Parallel-safe with: None
- Acceptance: 11+ flows live, segments + popups + suppression + magic mail + audits + A/B + performance loop + Shopify deep + SMS scaffold + all 13 agents operational, Email Engine end-to-end demo runs
- Complexity: S | Open deps: None

---

### 3.2.5 Phase 2.5 — Brand Team Collaboration + Trust Layer

Absorbs Grid & Pixel oversight. 21 features, 9 Bullets.

---

**B-2.5.01 — Slack-style threaded chat (Brand Chat full scope)**
- Moat: Grid & Pixel oversight | Outcome: Team members chat threaded inside brand workspace
- VVOW: §11.4 (P2.5 — beyond P1 #tagging) | R-spec: brand-chat-comments-subsystem.md (T33-T36) | Features: T33-BRAND-CHAT, PIA-COLLAB
- Locks: 13 | Skills: database-migration, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-2.38, B-0.09 | Parallel-safe with: B-2.5.02, B-2.5.03
- Acceptance: Threaded chat works, messages persist, Realtime delivers <500ms p95, RLS enforced on workspace_id
- Complexity: L | Open deps: None

**B-2.5.02 — 10-entity comments (T33-T36 spec)**
- Moat: Grid & Pixel | Outcome: User comments on 10 entity types (images, emails, sections, flows, segments, etc.)
- VVOW: n/a | R-spec: brand-chat-comments-subsystem.md | Features: T16-COMMENTS-DB, T34-PIN-ON-CANVAS, T35-SECTION-COMMENTS, T45-COMPOSITE-DB-FOUNDATION
- Locks: 13 | Skills: database-migration, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-2.5.01 | Parallel-safe with: B-2.5.03, B-2.5.04
- Acceptance: Comments work on all 10 entity types, pin-on-canvas preserves (x,y), section comments link to MJML section UUID
- Complexity: L | Open deps: None

**B-2.5.03 — Mentions + notifications**
- Moat: Grid & Pixel | Outcome: @ mentions notify in-app + email
- VVOW: n/a | R-spec: brand-chat-comments-subsystem.md | Features: T18-NOTIF-DB, T43-NOTIFICATION-DISPATCH
- Locks: 13 | Skills: inngest-function-authoring, hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.5.01, B-0.19 | Parallel-safe with: B-2.5.02, B-2.5.04
- Acceptance: @ mention notifies via in-app + email (respecting user preference), notification center shows unread, mark-read works
- Complexity: M | Open deps: None

**B-2.5.04 — Approval workflow ("you stay in control, AI executes")**
- Moat: Grid & Pixel (Trust Layer core) | Outcome: Generated campaigns require Approver before deploy
- VVOW: n/a | R-spec: brand-chat-comments-subsystem.md | Features: feature-set under PIA-COLLAB approvals
- Locks: 13 | Skills: hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.5.03, B-2.10 | Parallel-safe with: B-2.5.05, B-2.5.06
- Acceptance: Approval gate enforced (no deploy without approval), Approver can approve/reject/comment, audit trail captured
- Complexity: L | Open deps: None

**B-2.5.05 — Brand Rules enforcement layer**
- Moat: Grid & Pixel | Outcome: Brand-defined rules enforced at generation time
- VVOW: n/a | R-spec: R32 | Features: feature-set under PIA-COLLAB / PIA-QUAL
- Locks: 12, 13 | Skills: database-migration, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.5.04 | Parallel-safe with: B-2.5.06, B-2.5.07
- Acceptance: Brand rules persist, enforcement step blocks violations, violation surfaced to user, VeriClaw integration
- Complexity: M | Open deps: None

**B-2.5.06 — Super Search across all entities**
- Moat: Grid & Pixel | Outcome: Single query across emails, images, comments, segments, flows, audits
- VVOW: §11.3 extended | R-spec: R32 | Features: T36-SUPER-SEARCH
- Locks: 6, 13 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.5.02, B-1.15 | Parallel-safe with: B-2.5.05, B-2.5.07
- Acceptance: Super search queries all 10+ entity types, results ranked, RLS enforced
- Complexity: M | Open deps: None

**B-2.5.07 — Brand admin shell expansion (Team tab + workspace settings)**
- Moat: Grid & Pixel | Outcome: Team tab + activity feed + workspace settings in admin shell
- VVOW: n/a | R-spec: R22 | Features: feature-set under L1/PIA-COLLAB
- Locks: 13 | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-1.02, B-2.5.04 | Parallel-safe with: B-2.5.06, B-2.5.08
- Acceptance: Team tab loads, member management works, activity feed shows recent actions, workspace settings (timezone, default sender, etc.) editable
- Complexity: M | Open deps: None

**B-2.5.08 — Trust Layer demo**
- Moat: Grid & Pixel (verification) | Outcome: End-to-end Trust Layer — AI generates, brand reviews, brand approves, VIYO executes
- VVOW: n/a | R-spec: All P2.5 | Features: Aggregate verification
- Locks: 12, 13 | Skills: §9-code-review-protocol
- Prereqs: B-2.5.01 through B-2.5.07 | Parallel-safe with: None
- Acceptance: Trust Layer demo end-to-end, approval workflow proven, brand rules proven, full Grid & Pixel parity confirmed
- Complexity: S | Open deps: None

**B-2.5.09 — Phase 2.5 Acceptance Gate**
- Moat: Grid & Pixel completed | Outcome: P2.5 closes Grid & Pixel parity; P3 unblocked
- VVOW: n/a | R-spec: All P2.5 | Features: Aggregate
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-2.5.01 through B-2.5.08 | Parallel-safe with: None
- Acceptance: P2.5 demo runs, Grid & Pixel full surface absorbed, PO §9 ratification logged
- Complexity: S | Open deps: None

---

### 3.3 Phase 3 — Intelligence Studio + Super Templates + Audiences

Absorbs Instant. 17 features, 9 Bullets.

---

**B-3.01 — Super Templates (System C) — per-recipient personalization**
- Moat: Instant (#1 moat) | Outcome: One JSON data packet → 10,000+ truly unique emails per send
- VVOW: n/a | R-spec: R32 | Features: T56, PIA-SUPER
- Locks: 12, 19 | Skills: inngest-function-authoring, hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.5.09, B-1B.07, B-2.27 | Parallel-safe with: B-3.02, B-3.03
- Acceptance: 10K-recipient test send produces unique copy per recipient (sampled), dynamic products correct, coupons unique, send-time optimized
- Complexity: XL | Open deps: None

**B-3.02 — Per-recipient unique copy (Instant Personalised Copy parity)**
- Moat: Instant | Outcome: Each recipient receives uniquely matched copy
- VVOW: n/a | R-spec: R32 | Features: PIA-SUPER
- Locks: 12, 13 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-3.01, B-1B.04 | Parallel-safe with: B-3.03, B-3.04
- Acceptance: Personalized copy variation tested across 100-recipient sample, brand voice maintained, no PII leakage
- Complexity: L | Open deps: None

**B-3.03 — Per-recipient dynamic products (Instant Dynamic Products parity)**
- Moat: Instant | Outcome: Each recipient sees products matched to behavior/history
- VVOW: n/a | R-spec: R32 | Features: PIA-SUPER
- Locks: 12, 13 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-3.01, B-2.23 | Parallel-safe with: B-3.02, B-3.04
- Acceptance: Product recommendation per recipient tested, fallback for new customers, quality benchmarked
- Complexity: L | Open deps: None

**B-3.04 — Per-recipient smart coupons (Instant Smart Coupons parity)**
- Moat: Instant | Outcome: Each recipient receives coupon tuned to likelihood-to-convert
- VVOW: n/a | R-spec: R32 | Features: P1-12 (extended)
- Locks: 12, 13, 19 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-3.01, B-2.23 | Parallel-safe with: B-3.02, B-3.03, B-3.05
- Acceptance: Per-recipient coupons generate, unique per recipient verified, redemption tracking works
- Complexity: L | Open deps: None

**B-3.05 — Per-recipient send-time optimization (Instant STO parity)**
- Moat: Instant | Outcome: Each recipient receives email at their optimal time
- VVOW: n/a | R-spec: R32, R28 (deferred to B-4.03) | Features: PIA-SUPER
- Locks: 12 | Skills: inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-3.04 | Parallel-safe with: B-3.06, B-3.07
- Acceptance: STO determines optimal time per recipient, send schedule respects time per recipient, fallback for no-history recipients
- Complexity: L | Open deps: None

**B-3.06 — Audiences (Instant first-party data capture)**
- Moat: Instant | Outcome: Brand captures shoppers beyond cookie expiration
- VVOW: n/a | R-spec: R32 | Features: PIA-SUPER Audiences
- Locks: 13 | Skills: database-migration, hono-route-authoring, inngest-function-authoring, writing-behavioral-tests
- Prereqs: B-2.23 | Parallel-safe with: B-3.05, B-3.07
- Acceptance: Audiences capture works beyond cookie horizon, RLS enforced, data graph queryable for segmentation
- Complexity: L | Open deps: None

**B-3.07 — LENZ competitive intelligence dashboard**
- Moat: None (VIYO-original) | Outcome: Brand sees competitor email patterns visualized
- VVOW: §12.2 | R-spec: R32 | Features: feature-set under L11/PIA-ANALYTICS
- Locks: 13 | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-2.27 | Parallel-safe with: B-3.06, B-3.08
- Acceptance: LENZ dashboard surfaces top patterns, filters by industry/segment, no cross-brand leakage
- Complexity: M | Open deps: None

**B-3.08 — PULZE Email Intelligence Dashboard**
- Moat: None (VIYO-original) | Outcome: Brand sees email performance intelligence + Smart Insight Engine output + AI Advisor
- VVOW: n/a | R-spec: R32 | Features: PIA-ANALYTICS
- Locks: 12 | Skills: hono-route-authoring, writing-behavioral-tests
- Prereqs: B-2.28, B-3.07 | Parallel-safe with: B-3.07, B-3.09
- Acceptance: PULZE dashboard loads, surfaces actionable insights, drill-down works
- Complexity: M | Open deps: None

**B-3.09 — Phase 3 Acceptance Gate (Instant absorbed)**
- Moat: Instant completed | Outcome: P3 closes Instant parity; P4+ optional
- VVOW: n/a | R-spec: All P3 | Features: Aggregate
- Locks: All 17 | Skills: §9-code-review-protocol
- Prereqs: B-3.01 through B-3.08 | Parallel-safe with: None
- Acceptance: P3 demo runs, Instant 4-moat absorbed (Personalised Copy + Dynamic Products + Smart Coupons + STO), Audiences operational, LENZ + PULZE live, ATLAS admin tooling exists, PO §9 ratification logged
- Complexity: S | Open deps: None

---

### 3.4 Phase 4+ — Service Expansion

57 features, 13 Bullets. No single acceptance gate — continuous expansion after B-3.09.

---

**B-4.01 — R39 Global Admin expansion (admin.viyo.com full scope)**
- Moat: None (operational) | Outcome: VIYO admins manage tenants, corpus, tokens, webhooks, feature flags from admin.viyo.com
- VVOW: n/a | R-spec: R39 | Features: VF-34, feature-set under L1 R39
- Locks: 13 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-3.09, B-1.06 | Parallel-safe with: B-4.02, B-4.03
- Acceptance: All R39 admin surfaces operational, user impersonation has audit trail, cross-tenant analytics enforce VIYO-admin role
- Complexity: L | Open deps: None

**B-4.02 — Tier 3 self-hosted GPU activation (admin-gated per C-05)**
- Moat: None (cost optimization) | Outcome: L40S / A100 activation flow when threshold hits, admin-gated approval, Provider Registry routes via Tier 3
- VVOW: §8.7 | R-spec: R29 PAL v2 | Features: feature-set under L3 Tier 3
- Locks: 19 | Skills: inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-4.01, B-XC.01 | Parallel-safe with: B-4.03, B-4.04
- Acceptance: Threshold monitor detects 6,700 + 18,700 img/mo, admin notification fires, manual approval required (no auto-spin-up), once approved Provider Registry routes via Tier 3
- Complexity: L | Open deps: None

**B-4.03 — R28 Timer Service (Cloudflare Workers, economics-triggered)**
- Moat: None | Outcome: Timer Service on CF Workers handles scheduled sends + per-recipient STO at scale
- VVOW: n/a | R-spec: R28 (needs deferral header) | Features: TMS-01, TMS-03
- Locks: 19 | Skills: inngest-function-authoring, hono-route-authoring, writing-behavioral-tests
- Prereqs: B-3.05, B-4.01 | Parallel-safe with: B-4.02, B-4.04
- Acceptance: CF Worker handles scheduled events, internal API auth, health check, cache hit ratio surfaced in admin
- Complexity: L | Open deps: None

**B-4.04 — ActiveCampaign ESP**
- Moat: None (breadth) | Outcome: Brand on ActiveCampaign can use VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: feature-set under L3
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-XC.01, B-2.10 | Parallel-safe with: B-4.05, B-4.06
- Acceptance: ActiveCampaign OAuth + send + sync via PAL, parity with Klaviyo
- Complexity: M | Open deps: None

**B-4.05 — Brevo ESP**
- Moat: None | Outcome: Brand on Brevo can use VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: feature-set under L3
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-4.04 | Parallel-safe with: B-4.06, B-4.07
- Acceptance: Brevo OAuth + send + sync via PAL
- Complexity: M | Open deps: None

**B-4.06 — Mailchimp ESP**
- Moat: None | Outcome: Brand on Mailchimp can use VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: feature-set under L3
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-4.05 | Parallel-safe with: B-4.07, B-4.08
- Acceptance: Mailchimp OAuth + send + sync via PAL
- Complexity: M | Open deps: None

**B-4.07 — SendGrid ESP**
- Moat: None | Outcome: Brand on SendGrid can use VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: feature-set under L3
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-4.06 | Parallel-safe with: B-4.08, B-4.09
- Acceptance: SendGrid OAuth + send + sync via PAL
- Complexity: M | Open deps: None

**B-4.08 — SMS channel activation (Twilio adapter)**
- Moat: None | Outcome: Brand sends SMS via VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: ANI-01, feature-set under L3 SMS
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-2.24 | Parallel-safe with: B-4.07, B-4.09
- Acceptance: Twilio adapter sends SMS via PAL, two-way SMS works, opt-out compliance
- Complexity: M | Open deps: None

**B-4.09 — Push notification (V2+)**
- Moat: None | Outcome: Brand sends push via VIYO
- VVOW: n/a | R-spec: R29 PAL v2 | Features: feature-set under L3 push
- Locks: 19 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-4.08 | Parallel-safe with: B-4.10
- Acceptance: Push adapter sends notifications via PAL, opt-in flow works
- Complexity: M | Open deps: None

**B-4.10 — White-label support (V2+)**
- Moat: None (channel for resellers) | Outcome: Agency/reseller white-labels VIYO for clients
- VVOW: n/a | R-spec: TBD | Features: MB-06 extended, feature-set under L1 white-label
- Locks: 13 | Skills: hono-route-authoring, database-migration, writing-behavioral-tests
- Prereqs: B-4.01 | Parallel-safe with: B-4.11, B-4.12
- Acceptance: White-label branding works, custom domain support, child brand isolation tested
- Complexity: XL | Open deps: None

**B-4.11 — BFCM module (deferred per DEFERRED-001)**
- Moat: None | Outcome: Brand uses BFCM-specific tooling for Q4 holiday surge
- VVOW: n/a | R-spec: TBD (needs R-spec authoring per OD-011) | Features: TBD
- Locks: TBD | Skills: TBD
- Prereqs: B-4.01, BFCM R-spec authored (OD-011) | Parallel-safe with: TBD
- Acceptance: TBD
- Complexity: L (estimated) | Open deps: DEFERRED-001, OD-011

**B-4.12 — GPT Image 3 Full-Email Research (deferred per DEFERRED-002)**
- Moat: None | Outcome: Options memo guides full-email generation path
- VVOW: n/a | R-spec: TBD | Features: TBD
- Locks: TBD | Skills: directive-authoring-v2
- Prereqs: Architect options memo (OD-012) | Parallel-safe with: B-4.11
- Acceptance: Options memo delivered, PO ratifies path forward
- Complexity: S | Open deps: DEFERRED-002, OD-012

**B-4.13 — Phase 4+ ongoing (no acceptance gate — continuous)**
- Moat: None | Outcome: continuous
- VVOW: n/a | R-spec: All P4+ | Features: Continuous
- Locks: All 17 ongoing | Skills: All ongoing
- Prereqs: None (continuous after B-3.09) | Parallel-safe with: All P4+ Bullets
- Acceptance: No single gate — features ship as PO ratifies each
- Complexity: continuous | Open deps: TBD per feature

---

## Section 4 — Cross-Cutting Bullets

Not part of any single phase. Cover spec rewrites, governance refreshes, skill authoring, Portal-side work.

---

**B-XC.01 — R29 PAL v2 rewrite (Option C per D55 — unified Plugin Registry)**
- Outcome: R29 PAL ZCBR covers BOTH ESP/e-commerce AND AI model registries as unified Plugin Registry
- VVOW: §8.7 | R-spec: R29 PAL v2 | Features: Closes GAP-001
- Locks: 19 | Skills: r-file-rewrite-pattern, directive-authoring-v2
- Prereqs: D55 ratified (done) | Parallel-safe with: All P0 substrate (gates B-1.00 routing logic)
- Acceptance: R29 PAL v2 covers both scopes, replaces v1 in repo, GAP-001 closed
- Complexity: M | Open deps: GAP-001 (closed by this Bullet)

**B-XC.02 — R20 Database Schema rewrite (THIN → full)**
- Outcome: R20 captures parent_asset_id lineage + JSONB metadata + pgvector + full Brand Vault schema
- VVOW: §11 | R-spec: R20 v2 | Features: Closes GAP-003
- Locks: 6, 13 | Skills: r-file-rewrite-pattern
- Prereqs: None | Parallel-safe with: B-XC.01, B-XC.03, B-XC.04
- Acceptance: R20 v2 captures full schema, PO ratifies, GAP-003 closed
- Complexity: M | Open deps: None (GAP-003 closed via R20 v2 ZCBR-PASS 2026-05-12)

**B-XC.03 — R24 Image Pipeline rewrite (THIN → full)**
- Outcome: R24 captures model registry + Pattern Recipe schema + B1-B11 tools
- VVOW: §4, §13 | R-spec: R24 v2 | Features: Closes GAP-004
- Locks: 4, 5, 8 | Skills: r-file-rewrite-pattern
- Prereqs: None | Parallel-safe with: B-XC.01, B-XC.02, B-XC.04
- Acceptance: R24 v2 captures full image pipeline, PO ratifies, GAP-004 closed
- Complexity: M | Open deps: None (GAP-004 closed via R24 v2 ZCBR-PASS 2026-05-12)

**B-XC.04 — R31 Product Data Extraction rewrite (THIN → full)**
- Outcome: R31 captures full Brand Vault organization
- VVOW: §11 | R-spec: R31 v2 | Features: Closes GAP-005
- Locks: 6 | Skills: r-file-rewrite-pattern
- Prereqs: None | Parallel-safe with: B-XC.03
- Acceptance: R31 v2 captures full Brand Vault contract, PO ratifies, GAP-005 closed
- Complexity: M | Open deps: None (GAP-005 closed via R31 v2 ZCBR-PASS 2026-05-12)

**B-XC.05 — R32 Email Engine full read + extraction (P2 prep)**
- Outcome: Architect reads R32 fully + extracts P2 Bullet context
- VVOW: n/a | R-spec: R32 (read, not rewrite) | Features: Closes GAP-006
- Locks: None | Skills: directive-authoring-v2
- Prereqs: None | Parallel-safe with: All XC Bullets
- Acceptance: R32 fully read, key extractions logged to /docs/governance/R32_EXTRACTION_NOTES.md, used as input for P2 Bullet directives
- Complexity: S | Open deps: GAP-006

**B-XC.06 — T46 tier inversion fix**
- Outcome: T46 Architecture Lock rewritten to match VVOW + D14 (Tier 1 = aggregators)
- VVOW: §8.7 | R-spec: art-director-routing-suite.md v2 | Features: T46-COMPOSITE-ART-DIRECTOR-ROUTING-SUITE
- Locks: 19 | Skills: r-file-rewrite-pattern
- Prereqs: None | Parallel-safe with: B-XC.01, B-XC.02, B-XC.03, B-XC.04
- Acceptance: T46 v2 in repo, tier numbering correct, references match VVOW + D14
- Complexity: S | Open deps: None

**B-XC.07 — image-generation-pipeline skill spec**
- Outcome: Phase 1 skill spec for cache-first → routing → resolution → save composable pattern
- VVOW: §10.1 | R-spec: R24 v2 | Features: None
- Locks: 4, 5, 19 | Skills: directive-authoring-v2
- Prereqs: B-0.13 | Parallel-safe with: B-XC.08, B-XC.09, B-XC.10
- Acceptance: Skill spec authored (200-400 words) in Drive + uploaded to Portal product per D63 Path E, Kimi loads via skills.pickForTask() at Composer Queue intake
- Complexity: S | Open deps: None

**B-XC.08 — pattern-cache-lookup skill spec**
- Outcome: Phase 1 skill spec for pgvector query patterns + Lock 5 schema validation
- VVOW: §10.2-10.3 | R-spec: R20 v2, R24 v2 | Features: None
- Locks: 4, 5 | Skills: directive-authoring-v2
- Prereqs: B-0.13 | Parallel-safe with: B-XC.07, B-XC.09, B-XC.10
- Acceptance: Skill spec authored in Drive + uploaded to Portal product per D63 Path E
- Complexity: S | Open deps: None

**B-XC.09 — art-director-routing skill spec**
- Outcome: Phase 1 skill spec for empirical scoring matrix consumption per C-04
- VVOW: §8.8.2 | R-spec: R24 v2, R29 PAL v2 | Features: None
- Locks: 19 | Skills: directive-authoring-v2
- Prereqs: B-0.13, B-XC.01 | Parallel-safe with: B-XC.07, B-XC.08, B-XC.10
- Acceptance: Skill spec authored in Drive + uploaded to Portal product per D63 Path E
- Complexity: S | Open deps: None

**B-XC.10 — rlhf-event-emission skill spec**
- Outcome: Phase 1 skill spec for drag/export/regenerate/generate_start payload structure
- VVOW: §12 | R-spec: R24 v2 | Features: None
- Locks: 9 | Skills: directive-authoring-v2
- Prereqs: B-0.13 | Parallel-safe with: B-XC.07, B-XC.08, B-XC.09
- Acceptance: Skill spec authored in Drive + uploaded to Portal product per D63 Path E
- Complexity: S | Open deps: None

**B-XC.11 — layer-splitting-pipeline skill spec**
- Outcome: Phase 1 skill spec for SAM 2 + Tesseract + Flux 1.1 Pro Lovart-style layer splitting
- VVOW: §13 | R-spec: R24 v2 | Features: None
- Locks: 4, 5, 8, 19 | Skills: directive-authoring-v2
- Prereqs: B-0.13, B-XC.07 | Parallel-safe with: B-XC.07 onward
- Acceptance: Skill spec authored in Drive + uploaded to Portal product per D63 Path E, Kimi loads for B-1.13
- Complexity: S | Open deps: None

**B-XC.12 — Governance file refresh sweep**
- Outcome: All 7 governance files updated in one Manus directive sweep (CLAUDE.md, FOUNDATION_LOCK.md adds 17/18/19, FOUNDATION_AUTHORITY.md §9.2 update, CURRENT_STATE.md refresh, PRODUCT_ROADMAP.md sequencing, CODING_CONVENTIONS.md +3 rules, OPEN_DECISIONS.md points to Notion)
- VVOW: n/a | R-spec: n/a | Features: None
- Locks: All 17 | Skills: directive-authoring-v2
- Prereqs: D55/D56/D57 cataloged (done), Master Sequence ratified | Parallel-safe with: All XC + P0 Bullets
- Acceptance: All 7 files updated in one merged PR, references to Master Build Sequence inserted, GAP-007 closed
- Complexity: M | Open deps: GAP-007

**B-XC.13 — Portal-side T73 finalization**
- Outcome: T73 closed on Portal repo
- VVOW: n/a | R-spec: T73 spec | Features: T56-EDITING-ROUTER-COVERAGE
- Locks: None | Skills: directive-authoring-v2
- Prereqs: T73 directive sent to Manus (done in prior turn) | Parallel-safe with: All VIYO repo Bullets
- Acceptance: T73 complete on Portal main, OD-003 partially unblocked
- Complexity: M | Open deps: None

**B-XC.14 — Portal-side §1A-FU-04 + §8 Composer Queue UI**
- Outcome: Portal Phase 3 closed
- VVOW: n/a | R-spec: §1A-FU-04 + §8 | Features: feature-set under Portal-side
- Locks: None | Skills: directive-authoring-v2
- Prereqs: §1A-FU-04 sent first, then §8 (per memory rule) | Parallel-safe with: All VIYO repo Bullets
- Acceptance: §1A-FU-04 then §8 complete, Portal Phase 3 closed
- Complexity: M | Open deps: None

**B-XC.15 — PORTAL_AUTHORITY.md authoring**
- Outcome: PORTAL_AUTHORITY.md exists in Portal repo /docs/governance/, parallels FOUNDATION_AUTHORITY.md scope
- VVOW: n/a | R-spec: new | Features: Closes OD-009
- Locks: 17, 18, 19 | Skills: directive-authoring-v2
- Prereqs: B-XC.13, B-XC.14 | Parallel-safe with: B-XC.12
- Acceptance: PORTAL_AUTHORITY.md covers Portal identity + three-role architecture + 8-step flow + skills mechanism + Bullet parseability + Composer Queue + §9 Gate + concurrency model + service inventory + repo dependencies; PO ratifies
- Complexity: L | Open deps: OD-009

**B-XC.16 — Reconcile existing BULLET_1_DIRECTIVE.md against Master Build Sequence**
- Outcome: Existing draft from prior turn reconciled against this Sequence, deltas applied, ready for Composer Queue send
- VVOW: §3, §10 | R-spec: R20 v2, R24 v2, R29 PAL v2 | Features: See B-1.00
- Locks: All P1 locks | Skills: directive-authoring-v2
- Prereqs: B-0.22, B-XC.07-XC.11, B-XC.12, B-XC.15 | Parallel-safe with: None at this gate
- Acceptance: Existing BULLET_1_DIRECTIVE.md reconciled, renamed to B-1.00_STUDIO_CORE_LOOP_DIRECTIVE.md per OD-010, deltas applied, sent to Composer Queue
- Complexity: S | Open deps: OD-003, OD-004, OD-005, OD-009, OD-010

---


**B-XC.17 — ZCBR Standard Authoring + Skill Spec + Validation Wiring**
- Outcome: ZCBR_STANDARD.md committed to /docs/governance/, zcbr-spec-validation skill authored to Drive + uploaded to Portal product per D63 Path E, §9-code-review-protocol updated with Step 0 ZCBR pre-flight, Kimi Portal pre-flight wired to run zcbr-spec-validation at Composer Queue intake, Lock 20 added to FOUNDATION_LOCK.md
- VVOW: n/a | R-spec: n/a (this Bullet creates new authority documents) | Features: Enables all CRITICAL B-XC rewrites by providing the validation mechanism
- Locks: 17, 20 | Skills: directive-authoring-v2, zcbr-spec-validation (self-validates), r-file-rewrite-pattern
- Prereqs: ZCBR_STANDARD.md PO-ratified (done 2026-05-11), zcbr-spec-validation skill PO-ratified (done 2026-05-11) | Parallel-safe with: B-0.13 (Builder Technical Skills baseline)
- Acceptance: ZCBR_STANDARD.md in repo with ZCBR Status header, skill loadable via skills.pickForTask, §9 skill updated, Kimi pre-flight tested with fixture pass + fixture fail, Lock 20 in FOUNDATION_LOCK.md, Notion catalogs Lock 20
- Complexity: M | Open deps: None | Triage: meta — gates all subsequent CRITICAL B-XC rewrites

**B-XC.18 — R17 UX Architecture MINOR FIX**
- Outcome: R17 aligned to VVOW 3-Zone architecture, ZCBR Status header added, marked PASSED
- VVOW: §3 (3-Zone Spatial Architecture is canonical) | R-spec: R17 v2 | Features: None (R17 is reference for all VVOW Zone wiring)
- Locks: 17, 19, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.19, B-XC.20, B-XC.21, B-XC.22, B-XC.23, B-XC.24, B-XC.01-XC.06 (independent R-specs)
- Acceptance: R17 v2 in repo with ZCBR Status: PASSED, aligned to VVOW §3, B-1.00 Studio Core Loop directive can cite R17 v2
- Complexity: S | Open deps: None | Triage: CRITICAL — blocks B-1.00 (next 30 days)

**B-XC.19 — R19 LLM Orchestration audit + fix**
- Outcome: R19 audited against ZCBR, MINOR FIX or REWRITE per actual findings, marked PASSED
- VVOW: §5 (Brain Council Relationship) + §8.3 (Mastra DAG) | R-spec: R19 v2 | Features: None (R19 covers Brain Council + embedding model)
- Locks: 12, 19, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18, B-XC.20, B-XC.21, B-XC.22, B-XC.23, B-XC.24
- Acceptance: R19 v2 in repo with ZCBR Status: PASSED, B-0.14 + B-0.15 + B-0.16 directives can cite R19 v2
- Complexity: M | Open deps: None | Triage: CRITICAL — blocks B-0.14 (next 30 days)

**B-XC.20 — R21 Infrastructure MINOR FIX**
- Outcome: R21 verified all references match VVOW + ID-3 + D11 webhook architecture, ZCBR header added, marked PASSED
- VVOW: §11.1 (R2 + custom domain) | R-spec: R21 v2 | Features: None (R21 covers deployment + hosting + scale-out)
- Locks: 6, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18, B-XC.19, B-XC.21, B-XC.22, B-XC.23, B-XC.24
- Acceptance: R21 v2 in repo with ZCBR Status: PASSED, B-0.01/0.05/0.08/0.09/0.10 + B-2.37 can cite R21 v2
- Complexity: S | Open deps: None | Triage: CRITICAL — blocks B-0.01 (next 30 days)

**B-XC.21 — R22 Security Auth audit + fix**
- Outcome: R22 audited against ZCBR, MINOR FIX or REWRITE per actual findings, marked PASSED
- VVOW: §18.2 (RLS required on every Pattern DB and Brand Vault query) | R-spec: R22 v2 | Features: None (R22 covers user identity + RLS)
- Locks: 13, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18-XC.20, B-XC.22-XC.24
- Acceptance: R22 v2 in repo with ZCBR Status: PASSED, B-0.02 + B-1.01 + B-1.02 + B-2.5.07 can cite R22 v2
- Complexity: M | Open deps: None | Triage: CRITICAL — blocks B-0.02 (next 30 days)

**B-XC.22 — R23 Cost Engine MINOR FIX**
- Outcome: R23 aligned to D8 5-tier pricing + D56 Phase 0/Phase 1 token metering split + Lock 8 programmatic ops 0 tokens, ZCBR header added, marked PASSED
- VVOW: §18.1 (Lock 8) | R-spec: R23 v2 | Features: None (R23 covers token billing + generation cost tracking)
- Locks: 8, 19, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18-XC.21, B-XC.23, B-XC.24
- Acceptance: R23 v2 in repo with ZCBR Status: PASSED, B-0.07 + B-1.14 can cite R23 v2
- Complexity: S | Open deps: OD-001 (pricing reconciliation) — captured in R23 v2 but does not block | Triage: CRITICAL — blocks B-0.07 (next 30 days)

**B-XC.23 — Fresh DR Runbook authoring (SUPERSEDES R52)**
- Outcome: Fresh runbook authored from scratch at /docs/runbooks/disaster-recovery.md (NOT a rewrite of R52). R52 marked SUPERSEDED with pointer header.
- VVOW: n/a | R-spec: new runbook supersedes R52 | Features: None (DR runbook covers Supabase PITR + R2 snapshot policy + recovery procedure)
- Locks: 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18-XC.22, B-XC.24
- Acceptance: Fresh runbook in repo with ZCBR Status: PASSED, R52 has SUPERSEDED header pointing to new runbook, B-0.21 can cite new runbook, tabletop exercise documented
- Complexity: M | Open deps: None | Triage: CRITICAL — blocks B-0.21 (next 30 days)

**B-XC.24 — T47 Studio Editing Tools audit + fix**
- Outcome: T47 audited against ZCBR + aligned with Conflict Resolution C-01 (Lovart-style B3 lazy extraction), ZCBR header added, marked PASSED
- VVOW: §13 (Lovart Capability Parity for B1/B2/B3 editing) | R-spec: T47 (`/docs/architecture/studio-editing-tools.md` v2) | Features: None (T47 covers Zone 3 Toolbelt B1-B11 implementation)
- Locks: 4, 5, 8, 19, 20 | Skills: r-file-rewrite-pattern, zcbr-spec-validation, directive-authoring-v2
- Prereqs: B-XC.17 | Parallel-safe with: B-XC.18-XC.23
- Acceptance: T47 v2 in repo with ZCBR Status: PASSED, aligned to C-01 + Lock 8, B-1.11 + B-1.12 + B-1.13 can cite T47 v2
- Complexity: S | Open deps: None | Triage: CRITICAL — blocks B-1.11 (next 30-60 days)

---

## IMPORTANT R-spec JIT Stubs (rewrite triggered when dependent Bullet enters next-3 window)

These specs are listed as stubs — they exist in the Sequence as placeholder Bullets but are NOT authored yet. When the dependent Bullet (cited below) enters the next-3 Bullets window for active scheduling, Architect Claude triggers the rewrite Bullet as the immediate next XC Bullet.

| Stub ID | R-spec | Trigger | Dependent Bullet | Type expected |
|---|---|---|---|---|
| B-XC.25-stub | R18 Global Wiring Map | First cross-system event Bullet enters next-3 | All Bullets (any) | MINOR FIX or PASS |
| B-XC.26-stub | R25 Video / IG Intelligence | B-1B.02 enters next-3 | B-1B.02 | PENDING audit |
| B-XC.27-stub | R26 Creative Concept | B-2.02 enters next-3 | B-2.02 | PASS likely |
| B-XC.28-stub | R27 Composable Sections | B-2.01 enters next-3 | B-2.01, B-2.32, B-2.33, B-2.34, B-2.35 | PENDING audit |
| B-XC.29-stub | R32 Email Engine REWRITE | B-2.01 enters next-3 | All P2 + P2.5 + P3 | REWRITE (full) |
| B-XC.30-stub | R36 HYVE | B-1B.05 enters next-3 | B-1B.05 | PENDING audit |
| B-XC.31-stub | R37 MAAX | B-1B.04 enters next-3 | B-1B.04, B-2.02, B-2.27 | PENDING audit |
| B-XC.32-stub | R38 SYPHON | B-1B.03 enters next-3 | B-1B.03 | PENDING audit |
| B-XC.33-stub | R46 Email Ingestion MINOR FIX | B-1B.01 enters next-3 | B-1B.01, B-2.31 | MINOR FIX |
| B-XC.34-stub | T33-T36 Brand Chat Comments | B-2.5.01 enters next-3 | B-2.5.01, B-2.5.02, B-2.5.03 | PENDING audit |

Architect Claude is responsible for triggering these stubs at the right time. The CURRENT_BULLET.txt file plus Master Build Sequence "what's next" check answers when to fire.

---

## LATER R-spec Deferred Appendix (activate at phase activation gate)

These specs are not relevant for >90 days. They are NOT scheduled as Bullets in v1.1. When their dependent phase's activation gate fires, Architect Claude moves them to JIT stub or directly to numbered B-XC Bullet.

| R-spec | Dependent Bullet | Phase | Activation gate |
|---|---|---|---|
| R28 Timer Service | B-4.03 | P4+ | P3 acceptance gate (B-3.09) triggers Architect Claude to schedule R28 rewrite as next XC Bullet |
| R30 Product Animation | B-1.09, B-1.10 | P1 | Scheduled JIT when B-1.09 / B-1.10 enter next-3 window (downgrade to JIT stub at that point) |
| R33 (not cited in current Sequence) | None | n/a | Activate if future Bullet cites |
| R35 (not cited) | None | n/a | Activate if future Bullet cites |
| R39 Global Admin | B-4.01 | P4+ | P3 acceptance gate triggers |
| R49 (not cited) | None | n/a | Activate if future Bullet cites |
| R53 (assumed current but unverified) | None | n/a | Activate if future Bullet cites |

R30 is technically Phase 1 dependent but its dependent Bullets (B-1.09, B-1.10) are late Phase 1, so by triage rule it's deferred until those Bullets enter next-3. This is the case where LATER and IMPORTANT overlap; defaulted to LATER per "not blocking next 30 days" criterion.

---

## Section 5 — Dependency Graph (Critical Path + Parallel Tracks)

**Critical path (strictly sequential gates):**

```
B-0.01 Substrate Audit
    ↓
B-0.02 through B-0.21 (parallel-safe within phase constraints)
    ↓
B-0.22 Phase 0 Acceptance Gate
    ↓
[B-XC.17 ZCBR Standard + skill + wiring — MUST FIRE FIRST, gates all subsequent XC rewrites]
    ↓
[B-XC.01 R29 PAL v2] + [B-XC.02 R20] + [B-XC.03 R24] + [B-XC.04 R31] + [B-XC.06 T46] (rewrites) + [B-XC.18 R17] + [B-XC.19 R19] + [B-XC.20 R21] + [B-XC.21 R22] + [B-XC.22 R23] + [B-XC.23 fresh DR runbook] + [B-XC.24 T47] (audit + fix) + [B-XC.07/08/09/10 P1 skill specs] + [B-XC.11 layer-splitting] + [B-XC.12 governance refresh] + [B-XC.15 PORTAL_AUTHORITY] + [B-XC.16 reconcile B-1.00]
    ↓
[ZCBR pre-flight verification — every cited R-spec carries ZCBR Status: PASSED before B-1.00 directive admitted to Composer Queue]
    ↓
B-1.00 Studio Core Loop (FIRST Composer Queue send for VIYO repo)
    ↓
B-1.01 through B-1.17 (parallel-safe within constraints)
    ↓
B-1.18 Phase 1 Acceptance Gate
    ↓
B-1B.01-B-1B.06 (parallel except B-1B.04 → B-1B.05)
    ↓
B-1B.07 Phase 1B Acceptance Gate
    ↓
B-2.01 through B-2.37 (heavy parallelism within constraints)
    ↓
B-2.38 Phase 2 Acceptance Gate
    ↓
B-2.5.01 through B-2.5.08 (parallel within constraints)
    ↓
B-2.5.09 Phase 2.5 Acceptance Gate
    ↓
B-3.01 through B-3.08 (parallel within constraints)
    ↓
B-3.09 Phase 3 Acceptance Gate
    ↓
B-4.01 onward (continuous, no single acceptance gate)
```

**Parallel tracks within Phase 0:**
- L1+L2+L4+L8+L9: parallel (B-0.02, B-0.03, B-0.05, B-0.09, B-0.10)
- L3+L7+L10: after L1+L4 (B-0.04, B-0.08, B-0.11)
- L5+L6+L11+L12-A+L12-B: after L1+L2+L4 (B-0.06, B-0.07, B-0.12, B-0.13, B-0.14)
- Two-layer prompt + Platform Skills + Shopify: after L12-A+L12-B (B-0.15, B-0.16, B-0.17)

**Parallel tracks within Phase 1:**
- B-1.00 (Studio Core Loop) + B-1.01 (brand admin) + B-1.14 (billing UI): parallel after P0 acceptance — different code paths
- Generation modes A1-A8 + A9-A14 + A16-A22 + A15: parallel within phase after B-1.03/04/05
- Editing tools programmatic + AI-powered: parallel within phase after B-1.00

**Parallel tracks within Phase 2 (largest phase):**
- Brain Council infra (B-2.01/02/03/30): critical path
- Import surfaces (B-2.07/08/09): parallel after B-2.01/02
- Flow templates 1/2/3 (B-2.11/12/13): three parallel tracks once flow strategy ready
- Deliverability (B-2.18/19/20) + A/B (B-2.21/22): parallel
- Per-Brain wiring (B-2.04/05/06/24/25/26/27/28/29): highly parallel-safe
- ESP scope + commerce (B-2.10, B-2.14, B-2.23): sequential within Klaviyo, parallel with non-Klaviyo

**Parallel tracks within Phase 4+:**
- Additional ESPs (B-4.04/05/06/07): all parallel after R29 PAL v2
- SMS/push/white-label: parallel after R39

**Cross-cutting Bullets:** B-XC.01 through B-XC.24 are all parallel-safe with their respective prereqs. Portal-side Bullets (B-XC.13/14/15) parallel with all VIYO repo Bullets since different repo.

---

## Section 6 — Open Decisions Surfaced

This Sequence reveals architectural gaps not yet covered. PO ratifies in single session.

| ID | Decision | Blocks | Recommended resolution |
|---|---|---|---|
| OD-009 | ✅ CLOSED 2026-05-15 — Portal Composer Queue concurrency ratified: 2 parallel lanes for related-and-wired features, sequential for cross-touching (e.g., 22 generation modes A1-A8 + A9-A14 parallel; admin shells parallel). See CODE_RECONCILIATION §8 A2 + Notion OD-009 (commit `90f96e0`). | (closed) | Resolution: 2 parallel lanes. PORTAL_AUTHORITY.md authoring (B-XC.15) deferred separate. |
| OD-010 | Should the first Bullet directive be filed as `BULLET_1_DIRECTIVE.md` (Gap Handoff naming) or `B-1.00_STUDIO_CORE_LOOP_DIRECTIVE.md` (Master Sequence convention)? Inconsistency will confuse Portal. | B-1.00 send | Adopt B-X.YY convention. Rename existing draft. CURRENT_BULLET.txt content becomes `B-1.00_STUDIO_CORE_LOOP`. |
| OD-011 | BFCM module per DEFERRED-001 has no R-spec, no PRD section. Who authors R-spec when PO activates? | B-4.11 send | Architect Claude authors R-spec in dedicated session when PO triggers BFCM activation. Until then B-4.11 stays "TBD". |
| OD-012 | GPT Image 3 Full-Email Research per DEFERRED-002 needs options memo. Who writes? | B-4.12 send | Architect Claude writes memo in dedicated session when PO triggers. |
| OD-013 | Inventory v002 lists PIA-* features that don't cleanly map to a current R-spec. Should every feature have R-spec backing, or do PIA features inherit parent R-spec coverage? | Some P1B / P3 Bullets | Recommended: PIA features inherit parent R-spec (PIA-MAAX → R37, PIA-HYVE → R36, etc.). No new R-specs unless a PIA family has unique architectural concerns. |
| OD-014 | Phase 4+ has no acceptance gate (continuous expansion). When does Architect stop drafting Bullets? Soft milestone for "V1.0 fully shipped"? | Long-term planning | Recommended: V1.0 = P3.09 acceptance + B-4.01 R39 + B-4.04 ActiveCampaign as breadth proof. Everything else V1.1+. |
| OD-015 | Self-hosted Tier 3 GPU activation per C-05 is admin-gated. Who is the admin — VIYO-internal team only, or per-tenant? | B-4.02 spec | Recommended: VIYO-internal only. Per-tenant adds complexity without obvious brand value. Brand sees same Provider Registry resolution. |
| OD-016 | Fine-Tuned VLM bridge per Lock 9 triggers at 5,000 decisions per brand OR cumulative across brands? Architecture differs significantly. | Phase 4 RLHF acceptance threshold | Recommended: per brand. Brand-specific RLHF history trains brand-specific nuance. Cross-brand model would leak style. |

---

## Section 7 — Acceptance Criteria for This Document

PO ratifies by confirming:

1. End State (Section 1) captures fully-shipped VIYO accurately
2. Phase Summary (Section 2) absorbs 4-competitor moat per FOUNDATION_AUTHORITY.md
3. Per-Bullet metadata complete for all 140 numbered Bullets + 10 JIT stubs + 7 LATER deferred (per §2 Phase Summary total)
4. Dependency graph (Section 5) traces B-0.01 through B-4.13 without cycles
5. All 580 features from Inventory v002 accounted for (mapped, Deferred, or Future)
6. Open Decisions OD-009 through OD-016 surfaced with recommendations; PO ratifies in single session
7. Document committed to `/docs/governance/VIYO_Master_Build_Sequence.md` via Manus directive after ratification

If PO finds gaps: adjust this document, don't re-decompose from scratch. If PO finds missing Bullet: insert at correct position and renumber downstream.

After ratification, every Architect session opens with: "What's the next Bullet from VIYO_Master_Build_Sequence.md?" — Sequence answers. PO never asks "what's next?"

---

## Appendix A — Bullet ID Index

**Phase 0 — Substrate (22)**
- B-0.01 Substrate Audit & Gap Confirmation
- B-0.02 L1 Identity & Multi-Tenancy
- B-0.03 L2 Asset Model
- B-0.04 L3 Provider Routing baseline
- B-0.05 L4 Job Orchestration
- B-0.06 L5 Data Flywheel
- B-0.07 L6 Token Metering substrate
- B-0.08 L7 Observability
- B-0.09 L8 Real-time Substrate
- B-0.10 L9 Storage finalization
- B-0.11 L10 Webhook Pipeline
- B-0.12 L11 Pattern Substrate
- B-0.13 L12-A Builder Technical Skills
- B-0.14 L12-B Brain Pattern Skills
- B-0.15 Two-layer prompt assembly
- B-0.16 Platform Skills execution layer
- B-0.17 Shopify connector (read-only)
- B-0.18 Klaviyo connector scaffold
- B-0.19 Email Sender (Resend)
- B-0.20 Health checks + status
- B-0.21 Backup + DR foundation
- B-0.22 Phase 0 Acceptance Gate

**Phase 1 — Image Studio (18)**
- B-1.00 Studio Core Loop
- B-1.01 Brand admin signup + onboarding
- B-1.02 Team invites + role assignment
- B-1.03 Visual Intent Router (Brain 5)
- B-1.04 Designer Brain (Brain 6)
- B-1.05 Pattern Seeding pipeline (Milled)
- B-1.06 Tinder Swipe Gate UI
- B-1.07 Generation Modes A1-A8
- B-1.08 Generation Modes A9-A14
- B-1.09 Generation Modes A16-A22
- B-1.10 A15 Brand Kit Mode
- B-1.11 Editing Tools programmatic (B2/B4-prog/B7/B8)
- B-1.12 Editing Tools AI (B1/B5/B6/B9/B10)
- B-1.13 B3 Layer Splitting Lovart-style
- B-1.14 Lovart-style billing UI
- B-1.15 Brand Vault search + tagging
- B-1.16 Version History panel
- B-1.17 DSPy prompt optimization loop
- B-1.18 Phase 1 Acceptance Gate

**Phase 1B — Intelligence Foundation (7)**
- B-1B.01 R46 IMAP Email Ingestion
- B-1B.02 R25 Video / IG Intelligence
- B-1B.03 SYPHON ESP daily sync
- B-1B.04 MAAX Brand Memory graph
- B-1B.05 HYVE opt-in network
- B-1B.06 PIA Validation Evidence
- B-1B.07 Phase 1B Acceptance Gate

**Phase 2 — Email Engine (38)**
- B-2.01 Email Engine substrate (MJML)
- B-2.02 13-Agent Brain Council
- B-2.03 Email Bible loaded
- B-2.04 12 Copywriting frameworks
- B-2.05 Tone modifiers
- B-2.06 Format enforcers
- B-2.07 Migma import (Figma)
- B-2.08 Migma import (HTML + Screenshot)
- B-2.09 Remix from competitor corpus
- B-2.10 Klaviyo deployment pipeline
- B-2.11 Flow Templates 1 (Welcome/Cart/Browse)
- B-2.12 Flow Templates 2 (Post-purchase/Winback/Re-engage/VIP)
- B-2.13 Flow Templates 3 (Educational + remaining)
- B-2.14 Klaviyo segment sync
- B-2.15 VIYO segment recommendations
- B-2.16 7/30-day Campaign Calendar
- B-2.17 Popups
- B-2.18 Automatic Suppression
- B-2.19 Magic Mail deliverability
- B-2.20 AI Klaviyo Audits
- B-2.21 A/B Testing
- B-2.22 Performance Feedback Loop
- B-2.23 Shopify deepens
- B-2.24 SMS Copywriter + SMS channel scaffold
- B-2.25 VeriClaw (Agent 8)
- B-2.26 Flow Strategy (Agent 9)
- B-2.27 ATLAS Top Brain integration
- B-2.28 Smart Insight Engine (Agent 12)
- B-2.29 Contextual AI Advisor (Agent 13)
- B-2.30 Two-layer prompt full activation
- B-2.31 Email Engine Pattern DB
- B-2.32 Composable Sections library
- B-2.33 Visual Router Brain
- B-2.34 Live-Sync Edit flow
- B-2.35 Real-time generation in Email Studio
- B-2.36 Deploy preflight + safety gates
- B-2.37 Image CDN upload + URL rewriting
- B-2.38 Phase 2 Acceptance Gate

**Phase 2.5 — Brand Team Collaboration (9)**
- B-2.5.01 Slack-style threaded chat
- B-2.5.02 10-entity comments
- B-2.5.03 Mentions + notifications
- B-2.5.04 Approval workflow
- B-2.5.05 Brand Rules enforcement
- B-2.5.06 Super Search
- B-2.5.07 Brand admin shell expansion
- B-2.5.08 Trust Layer demo
- B-2.5.09 Phase 2.5 Acceptance Gate

**Phase 3 — Intelligence Studio (9)**
- B-3.01 Super Templates (System C)
- B-3.02 Per-recipient unique copy
- B-3.03 Per-recipient dynamic products
- B-3.04 Per-recipient smart coupons
- B-3.05 Per-recipient send-time optimization
- B-3.06 Audiences
- B-3.07 LENZ dashboard
- B-3.08 PULZE dashboard
- B-3.09 Phase 3 Acceptance Gate

**Phase 4+ — Service Expansion (13)**
- B-4.01 R39 Global Admin expansion
- B-4.02 Tier 3 self-hosted GPU activation
- B-4.03 R28 Timer Service
- B-4.04 ActiveCampaign ESP
- B-4.05 Brevo ESP
- B-4.06 Mailchimp ESP
- B-4.07 SendGrid ESP
- B-4.08 SMS channel activation
- B-4.09 Push notification
- B-4.10 White-label support
- B-4.11 BFCM module
- B-4.12 GPT Image 3 Research
- B-4.13 Phase 4+ ongoing

**Cross-cutting (24)**
- B-XC.01 R29 PAL v2 rewrite
- B-XC.02 R20 Database Schema rewrite
- B-XC.03 R24 Image Pipeline rewrite
- B-XC.04 R31 Product Data Extraction rewrite
- B-XC.05 R32 Email Engine full read
- B-XC.06 T46 tier inversion fix
- B-XC.07 image-generation-pipeline skill
- B-XC.08 pattern-cache-lookup skill
- B-XC.09 art-director-routing skill
- B-XC.10 rlhf-event-emission skill
- B-XC.11 layer-splitting-pipeline skill
- B-XC.12 Governance file refresh sweep
- B-XC.13 Portal-side T73 finalization
- B-XC.14 Portal-side §1A-FU-04 + §8
- B-XC.15 PORTAL_AUTHORITY.md authoring
- B-XC.16 Reconcile B-1.00 vs Master Sequence
- B-XC.17 ZCBR Standard Authoring + Skill Spec + Validation Wiring (gates all subsequent XC rewrites)
- B-XC.18 R17 UX Architecture MINOR FIX
- B-XC.19 R19 LLM Orchestration audit + fix
- B-XC.20 R21 Infrastructure MINOR FIX
- B-XC.21 R22 Security Auth audit + fix
- B-XC.22 R23 Cost Engine MINOR FIX
- B-XC.23 Fresh DR Runbook (supersedes R52)
- B-XC.24 T47 Studio Editing Tools audit + fix

**IMPORTANT JIT Stubs (10) — placeholder Bullets, rewrite triggered when dependent enters next-3 window**
- B-XC.25-stub through B-XC.34-stub (see Section 4 IMPORTANT Stubs table)

**LATER Deferred Appendix (7) — activate at phase activation gate**
- R28, R30, R33, R35, R39, R49, R53 (see Section 4 LATER Deferred Appendix table)

**Total: 140 numbered Bullets + 10 stubs + 7 deferred appendix entries**

---

## Appendix B — Skills Index (which Bullets load which skill)

**Builder Technical Skills (Tier 1, authored to Drive + uploaded to Portal product per D63 Path E):**

| Skill | Bullets that load it |
|---|---|
| database-migration | B-0.02, B-0.03, B-0.04, B-0.06, B-0.07, B-0.11, B-0.12, B-0.13, B-0.14, B-0.17, B-0.18, B-0.19, B-1.00, B-1.02, B-1.04, B-1.06, B-1.14, B-1.15, B-1.16, B-1B.01, B-1B.04, B-2.01, B-2.05, B-2.06, B-2.07, B-2.10, B-2.11, B-2.12, B-2.13, B-2.14, B-2.23, B-2.31, B-2.32, B-2.5.01, B-2.5.02, B-2.5.03, B-2.5.05, B-2.5.06, B-2.5.07, B-3.01, B-3.03, B-3.06, B-4.04 through B-4.10 |
| inngest-function-authoring | B-0.05, B-0.06, B-0.07, B-0.08, B-0.11, B-0.15, B-0.16, B-0.17, B-0.19, B-1.00, B-1.02, B-1.03, B-1.04, B-1.05, B-1.07-B-1.12, B-1.17, B-1B.01 through B-1B.06, most P2 Bullets, B-2.5.03/04, B-3.01-B-3.06, B-4.02, B-4.03 |
| hono-route-authoring | B-0.02, B-0.04, B-0.07, B-0.09, B-0.10, B-0.11, B-0.17, B-0.18, B-0.19, B-0.20, B-0.21, B-1.00, B-1.01, B-1.02, B-1.06, B-1.14, B-1.15, B-1.16, B-1B.01, B-1B.05, B-2.07, B-2.08, B-2.10, B-2.16, B-2.17, B-2.23, B-2.29, B-2.34, B-2.35, B-2.36, B-2.37, B-2.5.01 through B-2.5.07, B-3.01, B-3.06, B-3.07, B-3.08, B-4.01 through B-4.10 |
| pattern-recipe-validation | B-0.12, B-1.00, B-1.04, B-1.05, B-1.17 |
| writing-behavioral-tests | Almost every Bullet (default) |
| brand-vault-asset-write | B-0.03, B-1.00, B-1.07, B-1.08, B-1.09, B-1.10, B-1.11, B-1.12, B-1.13, B-1B.02, B-2.34 |
| directive-authoring-v2 | All Architect-authored Bullets (Architect-side, not Kimi runtime) |
| ingestion-evidence-protocol | All HEAVY-format directives |
| §9-code-review-protocol | All Phase Acceptance Gates (B-0.22, B-1.18, B-1B.07, B-2.38, B-2.5.09, B-3.09, B-2.5.08), Reviewer Claude side |
| r-file-rewrite-pattern | B-XC.01, B-XC.02, B-XC.03, B-XC.04, B-XC.06 |
| acceptance-message-template | All directive closeouts (used by Architect on every directive) |

**Phase 1 Specialized Skills (4 NEW, to be authored in B-XC.07-XC.10 + 1 more B-XC.11):**

| Skill | Bullets that load it | Authoring Bullet |
|---|---|---|
| image-generation-pipeline | B-1.00, B-1.12, B-2.35 | B-XC.07 |
| pattern-cache-lookup | B-1.00, B-1.03, B-1.07, B-1.08, B-1.09, B-1.10 | B-XC.08 |
| art-director-routing | B-1.00, B-1.03, B-1.07 | B-XC.09 |
| rlhf-event-emission | B-1.00 (and any Bullet emitting RLHF events) | B-XC.10 |
| layer-splitting-pipeline | B-1.13 only | B-XC.11 |

---

## Appendix C — R-spec Index

| R-spec | Status | Bullets that implement it |
|---|---|---|
| R17 UX Architecture | Reference | B-1.00 onward (all VVOW Zone wiring) |
| R18 Global Wiring Map | Reference | All Bullets (cross-system events) |
| R19 LLM Orchestration | Reference | B-0.14, B-0.15, B-0.16, B-1.03, B-1.04, B-2.02, B-2.30 |
| R20 Database Schema | THIN (B-XC.02) | B-0.03, B-0.06, B-0.12, B-1.00, B-1.16, B-2.31, B-2.34 |
| R21 Infrastructure | Reference | B-0.01, B-0.05, B-0.08, B-0.09, B-0.10, B-0.19, B-0.20, B-0.21, B-2.37 |
| R22 Security Auth | Reference | B-0.02, B-1.01, B-1.02, B-2.5.07 |
| R23 Cost Engine | Reference | B-0.07, B-1.14 |
| R24 Image Pipeline | THIN (B-XC.03) | B-1.00 onward (Phase 1 generation + editing) |
| R25 Video / IG Intelligence | Current | B-1B.02 |
| R26 Creative Concept | Reference | B-2.02 |
| R27 Composable Sections | Current | B-2.01, B-2.32, B-2.33, B-2.34, B-2.35 |
| R28 Timer Service | Deferred (needs header) | B-4.03 |
| R29 PAL | THIN AI scope (B-XC.01) | All Provider-routing Bullets |
| R30 Product Animation | Reference | B-1.09, B-1.10 |
| R31 Product Data Extraction | THIN (B-XC.04) | B-0.17, B-1.15 |
| R32 Email Engine | Needs full read (B-XC.05) | All P2 + P2.5 + P3 Bullets |
| R36 HYVE | Current | B-1B.05 |
| R37 MAAX | Current | B-1B.04, B-2.02, B-2.27 |
| R38 SYPHON | Current | B-1B.03 |
| R39 Global Admin | Current | B-4.01 |
| R46 Email Ingestion | IMAP only (Milled separate per §10.4) | B-1B.01, B-2.31 |
| R52 Disaster Recovery | SUPERSEDED by B-XC.23 fresh DR runbook — R52 reclassified POST-LAUNCH per PRD V8.1 §3.5 + Phase A A5 ratified 2026-05-15. GAP-002 closed. | (post-launch — not MVP-blocking) |
| T46 Art Director Routing Suite | Needs rewrite (B-XC.06 tier inversion) | B-XC.06 |
| T48 Webhook Pipeline | Superseded by Notion D11 | n/a (D11 supersedes) |
| T33-T36 Brand Chat Comments | Phase 2.5 | B-2.5.01, B-2.5.02 |

---

## Appendix D — Closeout Notes

**128 Bullets initially planned + 4 added during decomposition = 132 total** (B-1.06 added Tinder Swipe Gate UI as separate Bullet, B-XC.16 added reconciliation step, B-4.13 added continuous tail, B-XC.11 separated layer-splitting from other P1 skills).

**Document size:** ~1500 lines, fits within 30-60 page target.

**Surprises and contradictions found in inputs:**

1. VVOW Architecture §13 lists 10 toolbelt tools (B1-B10) but FOUNDATION_AUTHORITY.md captures 11 with B11 Style Transformation added during F-1.5 reconciliation. This Sequence absorbs the 11-tool count (B-1.11/12/13 covers all 11 + B11 implicit in B-1.12 AI tools).
2. Manus Inventory v002 maps 41 features to Phase 1, but Phase 1 generation modes (22) + editing tools (11) alone require more than 41 features when properly decomposed. Resolution: Phase 1 includes features re-mapped from P2/P3 Build Tracker per inventory v002's surprise findings. The "41 features" count is conservative — actual Phase 1 work scope is closer to 80-100 features once cross-phase re-mappings are absorbed.
3. R46 IMAP coverage stops at IMAP; Milled scraping is a separate pipeline per VVOW §10.4. This was explicit in VVOW but easy to miss. Captured cleanly here.
4. Tier numbering inverted between T46 (April Sprint 2) and VVOW (May 8). VVOW + Notion D14 are authoritative (Tier 1 = aggregators). T46 rewrite scheduled in B-XC.06.
5. The Phase 4+ acceptance model is fundamentally different from Phase 0-3 — no single gate, continuous expansion. OD-014 surfaces a recommended V1.0 milestone definition.
6. PIA-* feature namespace doesn't map cleanly to single R-specs. OD-013 surfaces the inheritance pattern recommendation.

**Open Decisions surfaced: 8 new (OD-009 through OD-016).** PO ratifies in single session per directive.

**Files in inputs:** FOUNDATION_AUTHORITY.md (724 lines), VVOW Architecture (934 lines), Manus Inventory v002 (8041 lines), Skill Routing Map (109 records), Notion 5 databases (60+17+7+8+7 = 99 records), VIYO_Session_Handoff.md (719 lines), VIYO_Gap_Handoff.md (660 lines). All input absorbed.

---

*End of VIYO Master Build Sequence v1.0*
