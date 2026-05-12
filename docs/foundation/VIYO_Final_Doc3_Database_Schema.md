---
**STATUS: SUPERSEDED**

This document is superseded by R20 v2 at `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation, merged via PR #21 at commit `5004819e9bbf4d81a9c992003e3a2ed1731df3fc`).

The parallel "Canonical Build Document" pattern that produced this V4 Final has been consolidated into R20 v2 to eliminate doc-drift risk (GAP-008 anti-pattern). All 81-table claims, 14-domain inventory, and schema definitions in this file are reflected in R20 v2 reconciled against the actual implementation at `packages/db/src/schema/*.ts`.

This Final Doc 3 is retained as historical reference only. Going forward, the canonical schema source is R20 v2. Schema source files at `packages/db/src/schema/*.ts` are the implementation ground truth; R20 v2 is the contract that documents them.

Do NOT use this file as canonical. Do NOT update this file. See R20 v2.

**Superseded by:** D66 (B-1.00 ratified) → R20 v2 authoring (2026-05-12) → PR #21 merge
**Superseded date:** 2026-05-12
---

# VIYO — Document 3: Canonical Database Schema
**Version:** V4 Final  
**Status:** Canonical Build Document  
**Tables:** 81 unique tables across 14 domains  

---

## Imports

```typescript
import { pgTable, uuid, text, timestamp, boolean, integer, decimal, jsonb, vector, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
```

---

## Domain: Identity & Tenancy

### `warmup_schedules` (Design Addendum B — Account Warm-Up)

```typescript
// Tracks the daily volume ramp schedule for new brands or brands recovering from damage.
// Enforced by the Audience Brain to prevent volume spikes that trigger spam filters.
export const warmup_schedules = pgTable('warmup_schedules', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  esp_provider:       text('esp_provider').notNull(),       // 'klaviyo', 'mailchimp', etc.
  week_number:        integer('week_number').notNull(),
  daily_ceiling:      integer('daily_ceiling').notNull(),   // Max sends per day
  eligible_flow_types:jsonb('eligible_flow_types').notNull(), // Array of flow types allowed
  created_at:         timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Video Intelligence (Research 25)

### `video_ingestion_jobs`

```typescript
export const video_ingestion_jobs = pgTable('video_ingestion_jobs', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  brand_id:           uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  video_url:          text('video_url').notNull(),
  source:             text('source').notNull(), // e.g., 'youtube', 'instagram', 'tiktok'
  status:             text('status').default('pending').notNull(), // 'pending', 'downloading', 'transcribing', 'analyzing', 'complete', 'failed'
  failure_reason:     text('failure_reason'),
  metadata:           jsonb('metadata'), // e.g., video title, author, duration
  created_at:         timestamp('created_at').defaultNow().notNull(),
  updated_at:         timestamp('updated_at').defaultNow().notNull(),
});
```

### `video_extracted_emails`

```typescript
export const video_extracted_emails = pgTable('video_extracted_emails', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  job_id:             uuid('job_id').references(() => video_ingestion_jobs.id, { onDelete: 'cascade' }).notNull(),
  email:              text('email').notNull(),
  timestamp_in_video: text('timestamp_in_video'), // e.g., '00:01:23'
  context:            text('context'), // Surrounding text where email was found
  created_at:         timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Creative Concepts (Research 26)

### `concept_pitches`

```typescript
export const concept_pitches = pgTable('concept_pitches', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  brief_id:           uuid('brief_id').notNull(), // Assuming a 'briefs' table exists
  brand_id:           uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  concepts:           jsonb('concepts').notNull(), // { safe: {...}, pattern_interrupt: {...}, wildcard: {...} }
  status:             text('status').default('pitched').notNull(), // 'pitched', 'selected', 'rejected', 'expired'
  created_at:         timestamp('created_at').defaultNow().notNull(),
});
```

### `concept_selections`

```typescript
export const concept_selections = pgTable('concept_selections', {
  id:                   uuid('id').defaultRandom().primaryKey(),
  pitch_id:             uuid('pitch_id').references(() => concept_pitches.id, { onDelete: 'cascade' }).notNull(),
  selected_concept_key: text('selected_concept_key').notNull(), // 'safe', 'pattern_interrupt', 'wildcard'
  user_id:              uuid('user_id').references(() => users.id).notNull(),
  feedback:             text('feedback'),
  created_at:           timestamp('created_at').defaultNow().notNull(),
});
```

### `deliverability_metrics` (Design Addendum B — Account Warm-Up)

```typescript
// Daily ingestion of ESP metrics to monitor domain reputation.
// Used by the state machine to transition brands between cold -> warming -> warmed -> damaged.
export const deliverability_metrics = pgTable('deliverability_metrics', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  brand_id:           uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  date:               date('date').notNull(),
  total_sent:         integer('total_sent').notNull(),
  bounce_rate_pct:    numeric('bounce_rate_pct', { precision: 5, scale: 2 }).notNull(),
  complaint_rate_pct: numeric('complaint_rate_pct', { precision: 5, scale: 2 }).notNull(),
  inbox_placement_pct:numeric('inbox_placement_pct', { precision: 5, scale: 2 }), // If available via ESP
  spam_trap_hits:     integer('spam_trap_hits').default(0),
  created_at:         timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Integrations

### `shopifyConnections` (source line 13440)

```typescript
export const shopifyConnections = pgTable('shopify_connections', {
  brand_id:              uuid('brand_id').references(() => brands.id).primaryKey(),
  shop_domain:           text('shop_domain').notNull(),            // e.g., 'mybrand.myshopify.com'
  access_token_encrypted: text('access_token_encrypted').notNull(), // AES-256-GCM encrypted
  scopes:                text('scopes').notNull(),                  // 'read_products,read_inventory,read_orders'
  status:                text('status').default('active').notNull(), // 'active', 'expired', 'disconnected'
  last_sync_at:          timestamp('last_sync_at'),
  created_at:            timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Brand Intelligence & Voice

### `brandVisualSystems` (source line 13513)

```typescript
export const brandVisualSystems = pgTable('brand_visual_systems', {
  brand_id:            uuid('brand_id').references(() => brands.id).primaryKey(),
  primary_color:       text('primary_color').notNull(),   // hex e.g., '#FF5733'
  background_color:    text('background_color').notNull(),
  text_color:          text('text_color').notNull(),
  heading_font:        text('heading_font').notNull(),
  body_font:           text('body_font').notNull(),
  button_border_radius: text('button_border_radius').notNull(), // e.g., '4px', '999px'
  logo_url:            text('logo_url').notNull(),
  voice_profile_json:  jsonb('voice_profile_json').notNull(),
  updated_at:          timestamp('updated_at').defaultNow().notNull(),
});
```

---

## Domain: Campaign & Generation Engine

### `campaignSessions` (source line 13473)

```typescript
export const campaignSessions = pgTable('campaign_sessions', {
  id:                    uuid('id').defaultRandom().primaryKey(),
  brand_id:              uuid('brand_id').references(() => brands.id).notNull(),
  user_id:               uuid('user_id').references(() => users.id).notNull(),
  brief_intent:          text('brief_intent').notNull(),
  status:                text('status').default('queued').notNull(),
  // Valid statuses: 'queued','running','completed','completed_with_warnings',
  //                 'partial','failed','cancelled','retrying','deploying','deployed','deploy_failed'
  current_phase:         text('current_phase'),            // e.g., 'cmo_brain', 'copywriter_brain'
  recommended_send_time: timestamp('recommended_send_time'),
  final_send_time:       timestamp('final_send_time'),
  sto_used:              boolean('sto_used').default(false),
  send_time_rationale:   text('send_time_rationale'),
  critic_results:        jsonb('critic_results'),
  created_at:            timestamp('created_at').defaultNow().notNull(),
  updated_at:            timestamp('updated_at').defaultNow().notNull(),
});
```

---

## Domain: Top Brain Intelligence

### `topBrainDerivedStrategies` (source line 13556)

```typescript
export const topBrainDerivedStrategies = pgTable('top_brain_derived_strategies', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  vertical_id:        uuid('vertical_id').references(() => verticals.id).notNull(),
  intent:             text('intent').notNull(),
  cluster_name:       text('cluster_name').notNull(),
  extracted_formula:  text('extracted_formula').notNull(),
  confidence_score:   decimal('confidence_score', { precision: 3, scale: 2 }).notNull(),
  source_email_count: integer('source_email_count').notNull(),
  created_at:         timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Flow & Email Automation

### `flows` (source line 1074)

```typescript
export const flows = pgTable('flows', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand_id: uuid('brand_id').references(() => brands.id).notNull(),
  session_id: uuid('session_id').references(() => campaign_sessions.id),
  flow_type: text('flow_type').notNull(),
  klaviyo_flow_id: text('klaviyo_flow_id'),
  status: text('status').default('draft'),
  total_emails: integer('total_emails').notNull(),
  tokens_consumed: integer('tokens_consumed').notNull(),
  flow_plan: jsonb('flow_plan').notNull(),
  created_at: timestamptz('created_at').defaultNow(),
});
```

---

## Domain: Data Sync & Products

### `products` (source line 13595)

```typescript
export const products = pgTable('products', {
  id:              uuid('id').defaultRandom().primaryKey(),
  brand_id:        uuid('brand_id').references(() => brands.id).notNull(),
  external_id:     text('external_id').notNull(),  // Shopify product ID (GID)
  title:           text('title').notNull(),
  handle:          text('handle').notNull(),
  description:     text('description'),
  vendor:          text('vendor'),
  product_type:    text('product_type'),
  status:          text('status').default('active'),
  price:           decimal('price', { precision: 10, scale: 2 }).notNull(),
  compare_at_price: decimal('compare_at_price', { precision: 10, scale: 2 }),
  cost_per_item:   decimal('cost_per_item', { precision: 10, scale: 2 }),
  image_url:       text('image_url'),
  tags:            text('tags').array(),
  created_at:      timestamp('created_at').defaultNow().notNull(),
  updated_at:      timestamp('updated_at').defaultNow().notNull(),
});
```

---

## Domain: Billing & Subscriptions

### `creditLedger` (source line 13648)

```typescript
export const creditLedger = pgTable('credit_ledger', {
  id:               uuid('id').defaultRandom().primaryKey(),
  brand_id:         uuid('brand_id').references(() => brands.id).notNull(),
  transaction_type: text('transaction_type').notNull(), // 'trial_grant' | 'reserved' | 'committed' | 'refunded' | 'top_up' | 'admin_adjustment'
  credits_amount:   integer('credits_amount').notNull(), // positive = credit, negative = debit
  action_type:      text('action_type'),  // 'campaign_email' | 'flow_email' | 'flow_sms' | 'ab_variant' | 'image_regen' | 'subject_regen'
  session_id:       uuid('session_id').references(() => campaignSessions.id),
  stripe_event_id:  text('stripe_event_id'),  // set on top_up rows
  description:      text('description'),      // human-readable for admin review
  created_at:       timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Observability & Audit

### `llmUsageEvents` (source line 13699)

```typescript
export const llmUsageEvents = pgTable('llm_usage_events', {
  id:               uuid('id').defaultRandom().primaryKey(),
  generation_id:    uuid('generation_id').notNull(), // = campaign_sessions.id (root trace ID)
  brand_id:         uuid('brand_id').references(() => brands.id).notNull(),
  campaign_id:      uuid('campaign_id').references(() => campaignSessions.id),
  brain:            text('brain').notNull(),
  step:             text('step').notNull(),
  provider:         text('provider').notNull(),   // 'openai', 'google', 'ideogram'
  model:            text('model').notNull(),       // exact model string
  prompt_tokens:    integer('prompt_tokens').notNull(),
  completion_tokens: integer('completion_tokens').notNull(),
  cost_total_usd:   decimal('cost_total_usd', { precision: 10, scale: 6 }).notNull(),
  markup_multiplier: decimal('markup_multiplier', { precision: 4, scale: 2 }).notNull().default('3.00'),
  retail_price_usd: decimal('retail_price_usd', { precision: 10, scale: 6 }).notNull(),
  normalized_tokens: integer('normalized_tokens').notNull(),
  created_at:       timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Self-Healing & VIYO Max

### `healingLog` (source line 5695)

```typescript
export const healingLog = pgTable('healing_log', {
  id:                     uuid('id').defaultRandom().primaryKey(),
  brand_id:               uuid('brand_id').references(() => brands.id),
  subsystem:              text('subsystem').notNull(),
  failure_type:           text('failure_type').notNull(),
  failure_detail:         jsonb('failure_detail').notNull(),
  healing_mode:           text('healing_mode').notNull(),   // 'reactive' | 'proactive'
  healing_steps:          jsonb('healing_steps').notNull(),
  healing_outcome:        text('healing_outcome').notNull(),
  diff:                   jsonb('diff'),
  is_reversible:          boolean('is_reversible').default(true),
  reversed_at:            timestamp('reversed_at'),
  quarantine_resolved_at: timestamp('quarantine_resolved_at'),
  created_at:             timestamp('created_at').defaultNow().notNull(),
});
```

---

## Domain: Forms Builder

### `forms` (source line 9154)

```typescript
export const forms = pgTable('forms', {
  id:     uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id),
  name:   text('name').notNull(),
  type:   text('type').notNull(),        // popup | embedded | flyout | full_page | teaser
  status: text('status').default('draft'), // draft | active | paused

  // Trigger config
  triggerType:  text('trigger_type'),    // time_delay | exit_intent | scroll_percent | click
  triggerValue: jsonb('trigger_value'),  // { delayMs: 8000 } | { scrollPercent: 60 }

  // Content
  headline:        text('headline'),
  bodyText:        text('body_text'),
  ctaText:         text('cta_text'),
  thankYouMessage: text('thank_you_message'),
  offerType:       text('offer_type'),   // discount | lead_magnet | early_access | none
  offerValue:      text('offer_value'),  // e.g. "10OFF"

  // Fields the form collects
  collectFirstName: boolean('collect_first_name').default(false),
  collectPhone:     boolean('collect_phone').default(false),
  collectBirthday:  boolean('collect_birthday').default(false),

  // Design
  backgroundColor: text('background_color'),
  buttonColor:     text('button_color'),
  imageUrl:        text('image_url'),

  // Tags applied to subscribers on submission
  tags: text('tags').array(),

  // ESP routing — JSONB, not per-ESP columns.
  // Format: { "klaviyo": { "listId": "abc" }, "omnisend": { "listId": "xyz" } }
  // Adding a new ESP in V3+ = add a key to this object. Zero schema migrations.
  // Shape: Record<EspProvider, EspRoutingConfig>
  // e.g. { "klaviyo": { "listId": "abc123" }, "omnisend": { "listId": "xyz789" } }
  espRouting: jsonb('esp_routing'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Domain: Extensibility Registries

### `skillsRegistry` (source line 10020)

```typescript
export const skillsRegistry = pgTable('skills_registry', {
  id:               text('id').primaryKey(),           // 'email_bible@1.0.0', 'black_friday@2024.1.0'
  skill_key:        text('skill_key').notNull(),        // stable identifier without version, e.g. 'email_bible'
  version:          text('version').notNull(),
  skill_type:       text('skill_type').notNull(),       // one of the 6 types above
  owner:            text('owner').notNull(),            // 'internal' | external provider name
  prompt_body:      text('prompt_body').notNull(),      // the actual instructions / context
  expected_inputs:  jsonb('expected_inputs').notNull(), // what context this skill needs to be useful
  expected_outputs: jsonb('expected_outputs').notNull(),// what this skill contributes to the brief
  token_footprint:  integer('token_footprint').notNull(),
  conditions:       jsonb('conditions'),                // optional: { campaign_type, segment_tag, template_type }
  active_from:      timestamp('active_from'),           // for seasonal_overlay only
  active_to:        timestamp('active_to'),             // for seasonal_overlay only
  is_enabled:       boolean('is_enabled').default(false).notNull(), // must be explicitly enabled after testing
  created_at:       timestamp('created_at').defaultNow().notNull(),
  updated_at:       timestamp('updated_at').defaultNow().notNull(),
});
```

---

## Domain: Support & Help Center

### `supportArticles` (source line 7468)

```typescript
export const supportArticles = pgTable('support_articles', {
  id:                uuid('id').defaultRandom().primaryKey(),
  slug:              text('slug').notNull().unique(),
  title:             text('title').notNull(),
  category:          text('category').notNull(),
  content:           text('content').notNull(),           // MDX
  search_keywords:   text('search_keywords').array(),     // additional terms for search matching
  helpful_count:     integer('helpful_count').default(0),
  not_helpful_count: integer('not_helpful_count').default(0),
  views:             integer('views').default(0),
  is_published:      boolean('is_published').default(false),
  related_articles:  text('related_articles').array(),    // slugs
  last_updated_at:   timestamp('last_updated_at').defaultNow(),
  created_at:        timestamp('created_at').defaultNow(),
});
```

---

## Domain: Onboarding

### `onboardingProgress` (source line 8470)

```typescript
export const onboardingProgress = pgTable('onboarding_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id),
  userId: uuid('user_id').notNull().references(() => users.id),

  // Connection milestones
  klaviyoConnectedAt: timestamp('klaviyo_connected_at'),
  shopifyConnectedAt: timestamp('shopify_connected_at'),
  urlCrawlCompletedAt: timestamp('url_crawl_completed_at'),
  skippedConnectionAt: timestamp('skipped_connection_at'),

  // Brain build milestones
  brainBuildStartedAt: timestamp('brain_build_started_at'),
  brainBuildCompletedAt: timestamp('brain_build_completed_at'),
  brainBuildTimeoutAt: timestamp('brain_build_timeout_at'),

  // Screen progression timestamps
  buildingScreenPassedAt: timestamp('building_screen_passed_at'),
  discoverScreenPassedAt: timestamp('discover_screen_passed_at'),
  recommendScreenPassedAt: timestamp('recommend_screen_passed_at'),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),

  // First action tracking
  firstActionType: text('first_action_type'),
  firstActionAccepted: boolean('first_action_accepted').default(false),
  firstEmailGeneratedAt: timestamp('first_email_generated_at'),

  // Banner state
  bannerDismissedCount: integer('banner_dismissed_count').default(0),
  bannerLastDismissedAt: timestamp('banner_last_dismissed_at'),

  // Re-engagement
  reengagement2hSentAt: timestamp('reengagement_2h_sent_at'),
  reengagement24hSentAt: timestamp('reengagement_24h_sent_at'),
  reengagement72hSentAt: timestamp('reengagement_72h_sent_at'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Row Level Security (RLS) Policies

Apply to every table that has a `brand_id` foreign key. Run these in a Supabase migration file after table creation.

```sql
-- Pattern for tables directly owned by a user (e.g., brands)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands_owner_policy" ON brands
FOR ALL USING (id IN (SELECT brand_id FROM users WHERE users.id = auth.uid()));

-- Pattern for all child tables with brand_id FK
-- Apply this pattern to: shopify_connections, klaviyo_connections, klaviyo_pkce_store,
-- campaign_sessions, brain_outputs, editor_events, brand_visual_systems, brand_voice_history,
-- brand_vectors, winning_formulas, top_brain_derived_strategies, products, audience_map,
-- audience_segments, brand_state, credit_ledger, audit_logs, notifications, assets, llm_usage_events

ALTER TABLE campaign_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_sessions_brand_policy" ON campaign_sessions
FOR ALL USING (brand_id IN (SELECT brand_id FROM users WHERE users.id = auth.uid()));

-- Admin bypass: Vercel API routes use SUPABASE_SERVICE_ROLE_KEY after requireAdmin() verification
-- This bypasses RLS entirely — service role key must NEVER be exposed to the browser

-- Enable Realtime on campaign_sessions (required for progress UI)
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```



---

## 10. Email Strategy Architecture Addendum (V1/V1.1)

**Context:** The database schema is expanded to support the Email Strategy implementation, including the `strategy_profile`, framework registries, and composable section components.

### 10.1 Core Table Updates

**`brands` table**
- Added `strategy_profile` (JSONB) column to store the brand's enabled frameworks, weights, and preferences.

**`campaign_sessions` table**
- Added `assigned_framework` (text) column.
- Added `assigned_pattern` (text) column.

**`flow_types` table**
- Added `framework_affinity` (text array) column.
- Added `section_sequence` (JSONB) column (replaces `layout_map`).

**`campaign_types` table**
- Added `framework_affinity` (text array) column.
- Added `content_pattern_affinity` (text array) column.

### 10.2 New Tables

**`framework_registry`**
Stores the 12 copywriting frameworks and educational content patterns.
- `id` (text, PK)
- `name` (text)
- `type` (enum: 'copywriting', 'content_pattern')
- `doctrine_block` (text) — The prompt fragment injected into the Copywriter Brain.
- `conflict_rules` (JSONB)

**`framework_groups`**
Stores the UX wrapper groups for the Brand Voice page.
- `id` (text, PK)
- `name` (text)
- `description` (text)
- `framework_ids` (text array)
- `default_verticals` (text array)

**`section_components`**
Stores the reusable MJML blocks for the Email Design Brain.
- `id` (text, PK)
- `name` (text)
- `mjml_template` (text)
- `required_slots` (text array)
- `dark_mode_tokens` (JSONB)


### 10.3 Visual Generation Router Tables

**`visual_asset_log`**
Tracks every visual asset generated by the Dual-Model Router to feed the self-learning feedback loop.
- `id` (uuid, PK)
- `brand_id` (uuid, FK)
- `campaign_session_id` (uuid, FK)
- `assigned_model` (enum: 'gpt_4o', 'ideogram_3', 'imagen_4')
- `asset_type` (text)
- `cost_in_cents` (numeric)
- `performance_score` (numeric) - Populated post-send based on CTR/conversion correlation
- `created_at` (timestamp)

**`campaign_sessions` table update**
- Added `visual_model_used` (text) column to log the primary model selected by the router.

**`strategy_profile` JSONB update**
- Added `preferred_visual_model` (text) to allow brands to override the default model routing on the Brand Voice page.


---

## 10.4 Top Brain Ingestion Pipeline Addendum (Email Strategy)

The `top_brain_emails` table is expanded to store the new framework tags generated by the ingestion pipeline.

```typescript
// New columns added to top_brain_emails
flow_type_id:         uuid('flow_type_id').references(() => flow_types.id),
copywriting_framework: text('copywriting_framework'), // e.g., 'PAS', 'AIDA'
content_pattern:      text('content_pattern'),       // e.g., 'ingredient_breakdown'
infographic_pattern:  text('infographic_pattern'),   // e.g., 'infographic_statistical'
detected_sections:    text('detected_sections').array(), // e.g., ['hero_banner', 'product_grid']
recommended_visual_model: text('recommended_visual_model'), // e.g., 'ideogram_3'
```

---

## 10.5 Cost Reconciliation Engine Tables

To support real-time margin tracking and reconcile raw LLM costs against customer token consumption, the following schema additions are required:

### `llm_usage_events` (Existing, but expanded)
- `session_id` (UUID, FK to `campaign_sessions`)
- `provider` (VARCHAR)
- `model` (VARCHAR)
- `brain` (VARCHAR)
- `prompt_tokens` (INTEGER)
- `completion_tokens` (INTEGER)
- `cost_total_usd` (NUMERIC)
- `markup_multiplier` (NUMERIC) — The platform markup applied to protect gross margin (e.g., 3.00).
- `retail_price_usd` (NUMERIC) — `cost_total_usd * markup_multiplier`.
- `normalized_tokens` (INTEGER) — The final VIYO tokens deducted, calculated as `retail_price_usd / token_peg`.

### `cost_reconciliation_logs` (New)
Tracks the final calculated margin for every generation session.
- `id` (UUID, PK)
- `session_id` (UUID, FK to `campaign_sessions`, UNIQUE)
- `brand_id` (UUID, FK to `brands`)
- `token_revenue_usd` (NUMERIC) — The USD value of the tokens consumed by the customer.
- `llm_cogs_usd` (NUMERIC) — The sum of `cost_total_usd` from `llm_usage_events` for this session.
- `gross_margin_pct` (NUMERIC) — `(token_revenue_usd - llm_cogs_usd) / token_revenue_usd`
- `created_at` (TIMESTAMP)

## 10.6 ESP Footer Compliance Tables

To support the universal tag layer and ESP-specific translation engine:

### `esp_tag_dictionary` (New)
A static lookup table mapping VIYO universal tags to ESP-specific syntax.
- `id` (UUID, PK)
- `esp_provider` (VARCHAR) — e.g., 'klaviyo', 'mailchimp'
- `universal_tag` (VARCHAR) — e.g., '{{VIYO_UNSUBSCRIBE}}'
- `esp_specific_tag` (VARCHAR) — e.g., '{% unsubscribe %}'

### `brands` (Expanded)
- `footer_settings` (JSONB) — Stores the brand's custom footer configuration (social links, privacy policy, custom text).


## 10.7 Conversational Email Strategy Additions

To support the Conversational Email Strategy (reply triggers and the coaching layer), the following schema additions are required:

### 10.7.1 `brands` Table Updates
Two new fields are added to the `brands` table to manage reply-to configurations and track the brand's progress through the coaching layer.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `reply_to_email` | VARCHAR(255) | YES | null | The email address where subscriber replies should be sent. Must not be a noreply@ variant. Validated by Critic Brain. |
| `brand_coaching_state` | JSONB | NO | '{}' | Tracks which coaching nudges (e.g., onboarding checklist, post-generation cards) have been shown or dismissed by the brand. |

### 10.7.2 `flow_types` Table Updates
A new boolean flag is added to the `flow_types` table to indicate whether a specific flow is eligible for a reply trigger.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `reply_trigger_enabled` | BOOLEAN | NO | false | If true, the CMO Brain is permitted to recommend a reply trigger for this flow type (e.g., true for welcome series, false for flash sales). |


## 10.8 Live Admin Config Panel Schema (V1.1)

To support the secure credential vault architecture, the following table stores encrypted platform-level API keys.

### Table: `platform_credentials`
Stores encrypted API keys and secrets for external integrations (e.g., OpenAI, Stripe, Supabase).

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Unique identifier |
| `service_name` | `varchar(100)` | Unique, Not Null | The integration name (e.g., `openai`, `stripe`) |
| `credential_type` | `varchar(100)` | Not Null | The type of credential (e.g., `api_key`, `webhook_secret`) |
| `encrypted_value` | `text` | Not Null | The credential value, encrypted with AES-256-GCM |
| `iv` | `varchar(64)` | Not Null | Initialization vector for AES-256-GCM decryption |
| `auth_tag` | `varchar(64)` | Not Null | Authentication tag for AES-256-GCM decryption |
| `is_active` | `boolean` | Default: `true` | Toggle to quickly disable an integration |
| `last_rotated_at` | `timestamptz` | Default: `now()` | Timestamp of the last update |
| `updated_by` | `uuid` | FK to `users.id` | The Admin who last updated this credential |
| `created_at` | `timestamptz` | Default: `now()` | Record creation timestamp |

**RLS Policy:**
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Allowed ONLY for users where `role = 'admin'` AND `is_owner = true`.
- `SELECT`: Allowed for `service_role` (backend workers resolving keys).

---

