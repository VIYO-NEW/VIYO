---
spec_id: R29
title: Platform Abstraction Layer — Unified Plugin Registry
version: 2.0
zcbr_status: PASSED
zcbr_validation_date: 2026-05-12
zcbr_validator: Architect Claude (Opus 4.7) self-validation
zcbr_checklist_version: v1
authored_date: 2026-05-12
revision: 2 (PO-directed expansion 2026-05-12: e-commerce promoted to full-detail parity with ESP and AI; Lock 19 Extension Clause added for self-extending agnosticism across all current and future integration categories)
author: Architect Claude (Opus 4.7)
supersedes:
  - docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_ENTERPRISE.md (v1, 2026-04-29, SHA ed3bf61f1b4210f8248974e18cedfa0334ba5c2b, 27352 bytes)
target_repo_path: /docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md
authority_tier: 7 (R-spec ZCBR per CLAUDE.md hierarchy)
---

# R29 — Platform Abstraction Layer (v2, ZCBR-Grade)

## 0. Authority and Provenance

**This document is the canonical contract for the VIYO Platform Abstraction Layer (PAL) — a unified Plugin Registry pattern that absorbs every category of outside-system integration: email service providers (ESPs), AI model providers, e-commerce platforms, and any future category VIYO adds (payments, analytics, CRM, ad platforms, SMS, etc.).** Per D55 (R29 PAL Option C ratified) **and the PO Hard Rule of 2026-05-12 (full agnosticism across all categories, current and future)**, the registry is **unified and self-extending**: one pattern, one resolution model, one credential storage path, one extension protocol covers every category. Adding a new provider in any category — or adding a whole new category — is a configuration change, not a code change. R29 v2 supersedes R29 v1 via the cleanup directive `R29-V2-SUPERSESSION-001`.

**Authority sources (CLAUDE.md tier order):**
- PO ratifications: D55 (R29 PAL Option C — unified Plugin Registry), **PO Hard Rule 2026-05-12 (full-category agnosticism — see §10 Lock 19 Extension Clause)**, D8 (5-tier subscription pricing), D56 (Token metering Phase 0/Phase 1 split), D57 (Layer 1 Platform Skills in orchestrator), D63 (Skills do not live in git), D66 (B-1.00 ratified — Studio Core Loop consumes AI Provider Registry)
- V8 PRD (current canonical except where flagged underspecified)
- FOUNDATION_AUTHORITY.md L1 Identity & Multi-Tenancy, L6 Token Metering, L10 Webhook Pipeline, **L19 Provider Agnosticism (this spec IS the Provider Agnosticism contract, expanded by Lock 19 Extension Clause §10)**
- VIYO_Master_Build_Sequence.md (v1.1) — Phase 1 onwards Bullets consume this registry
- ZCBR_STANDARD.md (Foundation Lock 20)
- **R20 v2** (`/docs/research_specs/R20_DATABASE_SCHEMA_v2.md`, merged PR #21, commit `5004819e9bbf4d81a9c992003e3a2ed1731df3fc`)
- **R24 v2** (`/docs/research_specs/R24_IMAGE_PIPELINE_v2.md`, merged PR #23, commit `94f117e84ed89d4ecc5db0b6c2832615c2511a51`)
- **R22 Security & Auth** — credential vault, AES-256-GCM, dual-key rotation
- **R31 Product Data Extraction** — operational detail for e-commerce platforms; R29 v2 defines the registry contract, R31 defines per-platform extraction logic

**Implementation ground-truth sources reconciled:**
- R29 v1 (27,352 bytes, 2026-04-29) — ESP abstraction preserved in v2 §4
- `apps/worker/src/lib/ai/provider-registry.ts` (8,722 bytes) — existing AI Provider Registry; v2 §5 specifies how it scales to unified
- `apps/worker/src/lib/ai/image-router.ts`, `editing-router.ts`, `router-config.ts`, `fallback-prompts.ts` — companion AI routing code
- `packages/shared/src/schemas/art-director.ts` (21,768 bytes) — Lock 19 violation surface (22 generation + 10 editing models + 9 gateways hardcoded in Zod enums); v2 §7 specifies refactor
- `packages/shared/src/schemas/credential.ts` (2,838 bytes) — 8-ESP enum + extended (Shopify, Stripe, custom); v2 §6 expands to cover all e-commerce platforms
- `packages/shared/src/security/vault.ts` — AES-256-GCM credential encryption (universal vault)
- `packages/db/src/schema/email.ts` — `esp_connections` table (R20 v2 §2.4.2)
- `packages/db/src/schema/integrations.ts` — `integration_connections` table (R20 v2 §2.12.1) — currently Shopify/Stripe/custom; v2 expands to all e-commerce + future categories
- `packages/db/src/schema/billing.ts` — `provider_pricing_registry` table (R20 v2 §2.9.6)

**Hardcoded model literal surface (Lock 19 violation, 9 files for refactor in v2 §7):**

| File | Match count |
|---|---:|
| `packages/shared/src/schemas/art-director.ts` | 96 (primary) |
| `apps/worker/src/lib/ai/router-config.ts` | 51 |
| `apps/worker/src/lib/ai/art-director-routing.test.ts` | 52 |
| `apps/worker/src/lib/ai/provider-registry.ts` | 24 |
| `packages/shared/src/config/env.ts` | 23 |
| `apps/worker/src/lib/ai/image-router.ts` | 4 |
| `apps/worker/src/lib/ai/art-director-route-generation.test.ts` | 5 |
| `apps/web/src/components/studio/ImageStudio.test.ts` | 3 |
| `apps/web/src/lib/studio-api.test.ts` | 2 |

**Cross-spec wiring map:**

| Consumer / Producer | Provides / Consumes | R29 v2 reference |
|---|---|---|
| R20 v2 (Database Schema) | `esp_connections`, `integration_connections`, `provider_pricing_registry`, `token_usage_logs`, plus reserved slot for `ai_provider_models` table (§3.6) and reserved expansion for `category_registry` row pattern enabling future categories without DDL changes per §10 | §3, §4.5, §5.5, §6.5, §9, §10 |
| R24 v2 (Image Pipeline) | Consumes AI Provider Registry; cites R29 v2 as source of truth | §5 |
| R31 (Product Data Extraction) | Consumes E-commerce Platform Registry for connection lifecycle; defines per-platform extraction logic (Shopify field maps, WooCommerce webhook handlers, Magento OAuth flow, BigCommerce API specifics, etc.) | §6 |
| R27 (Composable Sections) | Consumes ESP registry for VIYO-UTL → ESP-native translation at export boundary | §4 |
| R32 (Email Engine, Phase 2) | Consumes ESP + AI registries | §4, §5 |
| R22 (Security & Auth) | Provides credential vault | §8 |
| R23 (Cost Engine) | Consumes `provider_pricing_registry` rows + `token_usage_logs` | §9 |
| R46 (Email Ingestion) | Consumes IMAP credentials via Integration Registry | §6.10 (extension category) |
| T9 (Stripe Billing) | Stripe is registered as a category candidate for future absorption | §10 (Lock 19 Extension Clause) |
| R36 (HYVE) / R37 (MAAX) / R38 (SYPHON) | Consume AI Provider Registry | §5 |
| All Phase 1+ Bullets that touch any outside system | Use `providerRegistry.execute(...)` not direct provider APIs | §7 |

**Lock invocations:** Locks 4, 6, 8, 11, 13, 17, **19 (Lock 19 Extension Clause §10 makes this self-extending across all current AND future integration categories)**, 20.

---

## 1. Scope and Boundaries

### 1.1 What R29 v2 covers

- **The Unified Plugin Registry architecture** — one pattern covering ALL integration categories (current: ESP, AI, e-commerce; future: any new category extends the same pattern)
- **The Provider Identity & Capability Model** — every provider is a row in a registry, not a hardcoded enum
- **ESP Abstraction (full detail, preserved from R29 v1)**: VIYO-UTL, 8-ESP registry, footer compliance, conditional syntax, bidirectional translation at export boundary
- **AI Provider Abstraction (full detail, new)**: capability-driven resolution, tier model (1/2/3), fallback chains, model identity registry, refactor path for 9 hardcoded files
- **E-commerce Platform Abstraction (full detail, new — matches ESP/AI depth)**: capabilities locked, registry entry shape locked, credential storage locked, refactor path documented, failure modes / edge cases / tests covered. Per-platform operational logic (field mapping, webhook handlers, OAuth flows) lives in R31; the agnostic-registry contract lives here.
- **The unified Provider Registry interface** — `providerRegistry.execute({ category, capability, ... })`
- **Credential management** — universal vault path for every category
- **Provider pricing registry integration** — AI cost attribution via R20 v2 `token_usage_logs` + `provider_pricing_registry`
- **Refactor paths** for current Lock 19 violation surfaces in AI (9 files) and e-commerce (Shopify-only implementation expanding to platform-agnostic shape)
- **The Lock 19 Extension Clause (§10)** — makes Provider Agnosticism self-extending across all current AND future integration categories
- **Failure modes, edge cases, observability, tests, mechanical acceptance** per ZCBR-grade
- **The supersession contract** for R29 v1

### 1.2 What R29 v2 does NOT cover (explicit out-of-scope)

- The 7-brain Council of AI agents themselves (R19 covers; this spec only resolves which model each brain runs on)
- Pattern Recipe schema (R24 v2 §9 covers)
- **E-commerce per-platform extraction logic** — Shopify product field mapping, WooCommerce webhook handler implementations, Magento OAuth callback handling, etc. → R31 covers. R29 v2 covers the registry pattern that R31 plugs into.
- ESP webhook ingestion pipeline (R46 + R20 v2 §2.11)
- Stripe Billing operational logic (T9 covers; Stripe is listed in §10 as a registry candidate for future absorption)
- OAuth flow implementations per provider (R22 §4 covers state management; this spec documents how OAuth-issued credentials land in the vault)
- Specific AI model identities in normative code (Lock 19 forbids; this spec makes them data)
- Email Engine MJML compilation (R27 + R32 cover)
- HYVE k-anonymity gate logic (R36 covers)
- Cost calculation business logic (R23 covers)

### 1.3 The three current categories (full-detail parity)

R29 v2 covers three currently-active integration categories at **full detail in every category**. The agnostic-registry contract applies uniformly. Operational implementation details that are domain-specific live in companion R-specs.

| Category | Examples | R29 v2 depth | Operational details |
|---|---|---|---|
| **ESP (Email Service Providers)** | Klaviyo, ActiveCampaign, Mailchimp, Braze, HubSpot, Omnisend, SendGrid, Brevo, (future: Drip, Customer.io, others) | **Full detail** — VIYO-UTL, tag translation, footer compliance, conditional syntax, credential vault | This spec §4 fully self-contained for the registry contract |
| **AI Providers** | Tier 1/2/3 providers across image generation, vision QA, embedding, text generation (specific model names live in registry, never hardcoded in normative code) | **Full detail** — capability-driven, tier-based, fallback chains, model identity registry, refactor path for 9 hardcoded files | This spec §5 fully self-contained for the registry contract |
| **E-commerce Platforms** | Shopify (implemented), WooCommerce, Magento, BigCommerce (registry pattern locked here; concrete entries land alongside R31 per-platform Bullets), Squarespace Commerce, Wix, custom platforms (extension) | **Full detail** — capabilities locked, registry entry shape locked, credential storage locked, refactor path for Shopify-only → multi-platform expansion, failure modes / edge cases / tests | This spec §6 fully self-contained for the registry contract; **per-platform extraction logic lives in R31** |

**Future categories** (payments beyond Stripe, analytics, CRM, ad platforms, SMS providers, etc.) extend the same registry pattern under the Lock 19 Extension Clause (§10).

---

## 2. The Unified Plugin Registry Architecture

### 2.1 Design principle

Every outside-system integration in VIYO — current and future — follows the same registry pattern:

1. **Provider identity is data, not code.** Each provider is a registry row with `id`, `category`, `display_name`, `capabilities`, `gateway`, and `metadata`. Adding a new provider = adding a row.
2. **Capabilities are the consumer-facing API.** Consumers request a capability (e.g. `image_generation`, `esp_send`, `product_catalog_pull`), not a specific provider. The registry resolves which provider fulfills it.
3. **Credentials are vault-stored, workspace-scoped.** Every provider's auth material is AES-256-GCM encrypted via the universal vault path (R22 §4).
4. **Resolution is data-driven.** No `if (provider === 'klaviyo')` branches in normative code.
5. **Cost attribution flows through the registry.** Every billable provider call produces a `token_usage_logs` row with registry-resolved provider/model.
6. **Failure handling is uniform.** Standard `ProviderError` shape across all categories; retry/fallback/rollback handled uniformly.
7. **Categories extend without code changes.** New integration categories (payments, analytics, etc.) extend the registry via a new `category` value plus a new capability namespace; the core registry interface stays the same.

### 2.2 What the registry IS NOT

- NOT a runtime API proxy — calls go directly to provider APIs; the registry tells you WHICH provider to call and provides credentials/config
- NOT a queue or scheduler — Inngest handles workflow orchestration
- NOT a pricing engine — `provider_pricing_registry` holds pricing data
- NOT a skills loader — D63 specifies skills live outside git; this registry handles providers (external services with credentials)

### 2.3 Architecture diagram (in words)

```
                       UNIFIED PROVIDER REGISTRY
                       (resolves capability → provider+credentials+config)
                                    │
        ┌───────────────────┬───────┴────────┬─────────────────┐
        │                   │                │                 │
   ESP CATEGORY     AI PROVIDER CATEGORY  E-COMMERCE       (FUTURE
   (§4 full)        (§5 full)             CATEGORY         CATEGORIES per
                                          (§6 full)         §10 Extension)
        │                   │                │                 │
   Capabilities:    Capabilities:        Capabilities:    Examples:
   - esp_send       - image_generation   - product_       - payments
   - esp_template_  - image_edit           catalog_pull     (beyond Stripe)
     compile        - vision_qa          - order_         - analytics
   - esp_webhook_   - vision_            webhook_register   (Mixpanel, etc.)
     register        extraction         - customer_sync   - CRM
   - esp_footer_    - embedding         - inventory_       (HubSpot CRM,
     compile        - text_generation     check             Salesforce)
   - esp_audience_  - video_analysis    - discount_       - ad platforms
     sync           - speech_synthesis    code_create       (Meta Ads, etc.)
                    - dspy_compile                        - SMS providers
                                                            (Twilio, etc.)
        │                   │                │                 │
   Providers:       Tier 1/2/3            Providers:       Each extends
   - klaviyo        candidates resolved   - shopify        the same
   - activecampaign at runtime via         (implemented)   registry
   - mailchimp      ai_provider_models    - woocommerce    pattern. No
   - braze          table (slot reserved   (pattern-      hardcoded
   - hubspot        §3.6). NEVER          ready)          provider names
   - omnisend       hardcoded in          - magento       in normative
   - sendgrid       normative code.       - bigcommerce   code, ever.
   - brevo                                - squarespace_
                                            commerce
                                          - wix
                                          - (extension)
        │                   │                │                 │
   Credentials      Credentials:           Credentials:     Credentials:
   in esp_         (most: env vars        in integration_   (new tables or
   connections      account-level;        connections      extensions of
   (R20 v2          BYO-key future in     (R20 v2          integration_
   §2.4.2)          integration_          §2.12.1)         connections
                    connections per                         per category)
                    workspace)
```

### 2.4 Single entry point (high-level)

```typescript
const result = await providerRegistry.execute({
  category: 'esp' | 'ai' | 'ecommerce' | <future-category>,
  capability: string,
  workspaceId: UUID,
  brandId?: UUID,
  args: Record<string, unknown>,
  generationId: UUID,
  preferences?: { preferredTier?, excludeProviders?, optimizeFor?, explicitProvider? }
});
```

Detailed contract in §7.

---

## 3. Provider Identity & Capability Model

### 3.1 Universal registry row shape

```typescript
interface ProviderRegistryEntry {
  id: string;                          // 'klaviyo', 'ideogram-v3', 'shopify', 'woocommerce', etc.
  category: 'esp' | 'ai' | 'ecommerce' | string;  // string for future categories
  display_name: string;
  capabilities: string[];               // From the category's capability namespace
  tier?: 1 | 2 | 3;                    // AI only; others default tier 1
  gateway?: string;                     // AI: 'openai', 'fal-ai', etc. ESP/ecommerce: typically the API base URL or undefined
  fallback_gateway?: string;
  metadata: Record<string, unknown>;    // Category-specific config
  is_active: boolean;
  cost_per_unit?: number;               // AI billable; from provider_pricing_registry for current value
  unit_type?: string;
  source_authority: string;             // Citation
  added_at: timestamp;
  updated_at: timestamp;
}
```

Categories use different parts:
- **ESP**: `id`, `category='esp'`, `display_name`, `capabilities`, `metadata` (tag map + footer rules + conditional syntax — §4.4)
- **AI**: `id`, `category='ai'`, `display_name`, `capabilities`, `tier`, `gateway`, `fallback_gateway`, `metadata` (model params, timeouts, edit support), `cost_per_unit`, `unit_type`
- **E-commerce**: `id`, `category='ecommerce'`, `display_name`, `capabilities`, `metadata` (API base URL, webhook event catalog, OAuth config, auth method)
- **Future categories**: same shape; `metadata` schema defined when category is added

### 3.2 Capability identifiers (locked at v2.0)

**ESP capabilities:**
- `esp_send`, `esp_template_compile`, `esp_webhook_register`, `esp_footer_compile`, `esp_audience_sync`

**AI capabilities:**
- `image_generation`, `image_edit`, `vision_qa`, `vision_extraction`, `embedding`, `text_generation`, `video_analysis`, `speech_synthesis`, `dspy_compile`

**E-commerce capabilities (locked at v2.0):**
- `product_catalog_pull` — pull product catalog (R31 operational logic)
- `product_single_pull` — pull a single product by ID
- `order_webhook_register` — register order/inventory webhooks
- `order_history_pull` — pull historical orders for a customer or date range
- `customer_sync` — pull customer data with consent (feeds R37 MAAX)
- `inventory_check` — real-time inventory lookup
- `discount_code_create` — programmatically create discount codes (P4+ scope)
- `discount_code_lookup` — verify existing discount code
- `connection_health_check` — verify the connection is alive and credentials are valid (used for status indicators in Studio UI)

**Future categories:** When a new category is added (per §10 Extension Clause), its capability namespace is locked in that category's introducing R29 minor version.

New capabilities within an existing category are additive (R29 minor version bump). Removing a capability requires R29 major version bump.

### 3.3 Capability ↔ Provider mapping (resolved at runtime, not at code time)

Resolver considers:
1. **Tier preference** (AI only)
2. **Brand preferences** (R37 MAAX signals for AI and e-commerce; brand has explicit connection for ESP and e-commerce per `(workspace_id, provider)` UNIQUE)
3. **Availability** — `is_active = false` skipped
4. **Cost** — if `optimize_for='cost'`
5. **Quality** — if `optimize_for='quality'`
6. **Recent failure rate** — circuit breaker deprioritizes failing providers for N minutes

### 3.4 Provider source-of-truth (current → target state)

**Current Phase 1:**
- ESP: 8 providers in registry constant (R29 v1 `ESP_REGISTRY` map preserved); will move to `category_registry` rows alongside `ai_provider_models` migration
- AI: hardcoded in `apps/worker/src/lib/ai/provider-registry.ts`; to be migrated to `ai_provider_models` DB table per §7 refactor
- E-commerce: 1 implemented (Shopify); 3+ in credential enum (WooCommerce, Magento, BigCommerce future); will move to `category_registry` rows alongside AI migration

**Target Phase 2+:**
- All categories: DB-driven via `category_registry` table (slot reserved §3.6) plus per-category extensions where needed
- Code reads providers from DB at boot + on hot-reload signal

### 3.5 Why not `provider_pricing_registry`?

`provider_pricing_registry` (R20 v2 §2.9.6) stores **pricing data only** — `(provider, model, operation_type) → cost_per_unit, unit_type, effective_from/until, markup_multiplier`. It is NOT the provider identity registry. The two tables join via `(provider, model)` keys when cost calculation happens.

### 3.6 Reserved slot: `category_registry` table (replaces `ai_provider_models`)

**The previous draft proposed `ai_provider_models` as an AI-only table. Per the PO Hard Rule (full agnosticism), the slot is generalized to `category_registry` — a single table for ALL integration providers across ALL categories. AI is a `category` value; ESP is a `category` value; e-commerce is a `category` value; future categories add new rows with new `category` values.**

A new table will land in a future R20 minor version (B-XC.01-B per §7.2 refactor sequence) with this shape (sketch — exact DDL by Architect when minor version ships):

```
category_registry
─────────────────────
id UUID PK
provider_id VARCHAR(50) NOT NULL UNIQUE  -- e.g. 'klaviyo', 'ideogram-v3', 'shopify', 'woocommerce'
category VARCHAR(50) NOT NULL            -- 'esp', 'ai', 'ecommerce', or future category value
display_name VARCHAR(100) NOT NULL

-- AI-specific (NULL for non-AI):
tier SMALLINT
gateway VARCHAR(50)
fallback_gateway VARCHAR(50)
timeout_ms INTEGER
cost_per_unit NUMERIC(10,6)
unit_type VARCHAR(20)
typography_optimized BOOLEAN
editing_capable BOOLEAN
default_for_tier BOOLEAN

-- Universal:
capabilities VARCHAR[] NOT NULL           -- Subset of the category's capability namespace
is_active BOOLEAN DEFAULT TRUE NOT NULL
source_authority TEXT NOT NULL
metadata JSONB DEFAULT '{}'::jsonb NOT NULL  -- Category-specific config (ESP tag map, ecommerce API base URL, etc.)
added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL

INDEX idx_category_registry_category_active ON (category, is_active)
INDEX idx_category_registry_capabilities USING GIN (capabilities)
```

This single table replaces all hardcoded provider constants across the codebase. Migration sequence in §7.

---

## 4. ESP Abstraction (preserved from R29 v1, formalized)

### 4.1 Purpose

The ESP layer enables VIYO to produce email content that works across any supported ESP without hardcoding provider-specific syntax in templates, composable sections, or AI prompts. All internal representations use **VIYO Universal Tag Language (VIYO-UTL)**. Translation to ESP-native syntax happens only at the export boundary.

### 4.2 VIYO-UTL (Universal Tag Language)

#### 4.2.1 Core tag schema (locked at v2.0)

```typescript
export const VIYO_UTL_SCHEMA = {
  Profile: {
    FIRST_NAME: '{{viyo.contact.first_name}}',
    LAST_NAME: '{{viyo.contact.last_name}}',
    EMAIL: '{{viyo.contact.email}}'
  },
  Event: {
    ORDER_ID: '{{viyo.event.order_id}}',
    CART_URL: '{{viyo.event.cart_url}}',
    VALUE: '{{viyo.event.value}}'
  },
  Iterable: {
    LOOP_START: '{{#each viyo.event.items}}',
    ITEM_TITLE: '{{viyo.item.title}}',
    ITEM_PRICE: '{{viyo.item.price}}',
    ITEM_IMAGE: '{{viyo.item.image_url}}',
    LOOP_END: '{{/each}}'
  },
  Org: {
    NAME: '{{viyo.org.name}}',
    ADDRESS: '{{viyo.org.address}}'
  },
  Utility: {
    UNSUBSCRIBE: '{{viyo.org.unsubscribe_url}}',
    WEB_VIEW: '{{viyo.link.web_view}}'
  }
} as const;
```

#### 4.2.2 Tag validation (Zod)

```typescript
export const ViyoUtlTagSchema = z.string().regex(
  /^\{\{(#each |\/)?viyo\.[a-z][a-z0-9_.]*\}\}$/,
  'Must be a valid VIYO-UTL tag'
);

export const ViyoUtlAuditSchema = z.object({
  tags_found: z.array(ViyoUtlTagSchema),
  esp_leaks: z.array(z.object({ line: z.number(), content: z.string(), detected_esp: z.string() })),
  is_clean: z.boolean()
});
```

#### 4.2.3 The `viyo_utl_audit` CI check

CI scans every committed `email_templates.viyo_utl_source` and composable section template for ESP-native syntax leakage (`{% ... %}`, `%%TAG%%`, `*|TAG|*`, `[[TAG]]`, etc.). Any leak fails CI.

### 4.3 ESP Connector Registry — data-driven

A single generic `DataDrivenConnector` class reads `ESP_REGISTRY` entries. No per-ESP classes.

```typescript
export interface EspRegistryEntry {
  id: string;
  name: string;
  tagMap: Partial<EspTagMap>;
  requiredFooterTags: string[];
  conditionalSyntax: { if: string; else: string; endif: string };
  notes: string;
}
```

### 4.4 The 8-ESP Registry (locked at v2.0)

Content preserved from R29 v1. Per-ESP entries:

- **klaviyo**: Django/Jinja2 syntax. Tags: `{{ first_name|default:'' }}`, `{{ email }}`, `{{ event.order_id }}`, `{{ event.extra.checkout_url }}`, `{{ event|lookup:'$value' }}`, `{% for item in event.Items %}` ... `{% endfor %}`, `{{ item.product_title }}`, `{% currency_format item.price %}`, `{{ item.image_url }}`, `{{ organization.name }}`, `{{ organization.full_address }}`, `{% unsubscribe_link %}`, `{% web_view_link %}`. Footer: `{% unsubscribe_link %}`, `{{ organization.full_address }}`. Conditional: `{% if $COND %}` / `{% else %}` / `{% endif %}`.
- **activecampaign**: `%FIRSTNAME%`, `%LASTNAME%`, `%EMAIL%`, `%EVENT_ORDER_ID%`, `%ORGANIZATION%`, `%SENDER-INFO-SINGLELINE%`, `%UNSUBSCRIBELINK%`, `%WEBCOPY%`. Footer: `%UNSUBSCRIBELINK%`. Conditional: `%IF $COND%` / `%ELSE%` / `%ENDIF%`. No native loops; product grids pre-rendered as static HTML.
- **mailchimp**: `*|FNAME|*`, `*|LNAME|*`, `*|EMAIL|*`, `*|LIST:COMPANY|*`, `*|HTML:LIST_ADDRESS_HTML|*`, `*|UNSUB|*`, `*|ARCHIVE|*`. Footer: `*|UNSUB|*`. Conditional: `*|IF:$COND|*` / `*|ELSE:|*` / `*|END:IF|*`. Limited loops (RSS-to-email only).
- **braze**: `{{${first_name}}}`, `{{${last_name}}}`, `{{${email_address}}}`, `{{${set_user_to_unsubscribed_url}}}`. Footer: `{{${set_user_to_unsubscribed_url}}}`. Conditional: `{% if ${$COND} %}` etc. Liquid with ${} attribute refs.
- **hubspot**: `{{ contact.firstname }}`, `{{ contact.lastname }}`, `{{ contact.email }}`, `{{ unsubscribe_link }}`, `{{ view_as_page_url }}`. HubL (Jinja-like).
- **omnisend**: `[[contact.first_name]]`, `[[contact.email]]`, `[[unsubscribe_url]]`. Double-bracket syntax. Limited event-driven personalization.
- **sendgrid**: `{{first_name}}`, `{{email}}`, `{{{unsubscribe}}}` (triple-brace for raw HTML). Handlebars.
- **brevo** (placeholder): `{{contact.FIRSTNAME}}`, `{{contact.LASTNAME}}`, `{{contact.EMAIL}}`, `{{unsubscribe}}`. Pending live test confirmation in B-2.10 Bullets.

Full registry map in R29 v1 §3.1 (preserved); operational implementation in `apps/worker/src/lib/esp/registry.ts` (to be authored when ESP code lands).

### 4.5 ESP credential storage (R20 v2 §2.4.2)

`esp_connections` table: `workspace_id` FK, `provider` CHECK enum (8 providers + reserved Drip/Customer.io), `api_key_encrypted TEXT NOT NULL` (AES-256-GCM via vault), `is_active`, composite UNIQUE `(workspace_id, provider)`. RLS tenant-scoped.

### 4.6 ESP capability execution

```typescript
await providerRegistry.execute({
  category: 'esp',
  capability: 'esp_send',
  workspaceId, brandId,
  args: { espProvider: 'klaviyo', compiledHtml, subject, audienceSegmentId, sendAt },
  generationId
});

const compiled = await providerRegistry.execute({
  category: 'esp',
  capability: 'esp_template_compile',
  workspaceId, brandId,
  args: { espProvider: 'klaviyo', viyoUtlSource, includeFooter: true },
  generationId
});
```

### 4.7 ESP failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Credential decrypt fail | Vault key rotation issue | `ESP_CREDENTIAL_DECRYPT_FAILED` | Mark connection inactive; alert PO | Sentry critical |
| ESP-native syntax leak in source | CI scan finds `{% ... %}` etc. in template | `VIYO_UTL_AUDIT_FAILED` | CI blocks merge | App warn |
| Send rate limit | Provider 429 | `ESP_RATE_LIMITED` | Inngest retry exp-backoff up to 7 attempts | OTel event |
| Send auth fail | Provider 401/403 | `ESP_AUTH_FAILED` | Mark inactive; alert workspace owner | Sentry warn |
| Footer compliance violation | Required footer tags missing | `ESP_FOOTER_NONCOMPLIANT` | Reject compile | App warn |
| Unknown provider | Consumer requests provider not in registry | `ESP_UNKNOWN_PROVIDER` | Reject request | App warn |
| Webhook signature fail | Inbound webhook HMAC invalid | `ESP_WEBHOOK_SIGNATURE_INVALID` | Reject; log; do not retry | Sentry warn |

### 4.8 ESP edge cases + tests

- Edge: ESP retired by vendor → mark `is_active=false`; consumers using it get clear error + admin alert
- Edge: Brand has multiple workspaces, same ESP → independent credentials per workspace
- Test: VIYO-UTL → each of 8 ESP-native outputs matches fixture
- Test: Footer compliance fixtures pass/fail correctly
- Test: Cross-tenant ESP credential access denied via RLS

---

## 5. AI Provider Abstraction (new — full detail)

### 5.1 Purpose

Every AI model call in VIYO goes through a single registry with capability-driven resolution. R24 v2 §3 documented the Lock 19 refactor path; R29 v2 fulfills it. Every AI model name in the codebase becomes data in the registry.

### 5.2 Three-tier provider model

- **Tier 1 Premium** — highest quality, highest cost. Production-grade hero images, typography-strong outputs, final approval workflows.
- **Tier 2 Mid-tier** — good quality at moderate cost. Variant generation in R24 v2 Tier 1 Learning Engine, section-level images in production.
- **Tier 3 Self-hosted fallback** — lower quality but always available. Used when Tier 1+2 unavailable.

Tier selection driven by capability resolution preferences:
- Production runs (R24 v2 Tier 3 Production Router) default Tier 1 → Tier 2 fallback
- Learning runs (R24 v2 Tier 1) default Tier 2 → Tier 1 spot-check
- Emergency: Tier 3 with degraded-quality user notice

### 5.3 Capabilities and tier candidates

Specific provider/model names are intentionally NOT listed in this spec (Lock 19). The canonical list lives in `apps/worker/src/lib/ai/provider-registry.ts` (current) → `category_registry` table (post-refactor). Capabilities supported: `image_generation`, `image_edit`, `vision_qa`, `vision_extraction`, `embedding`, `text_generation`, `video_analysis` (future), `speech_synthesis` (P3+), `dspy_compile`.

### 5.4 Resolution flow

1. Filter `category_registry` by `category='ai'`, `capability` in `capabilities[]`, `is_active=true`
2. Sort by: brand preference (R37 MAAX), tier preference, cost, recent failure rate (circuit breaker)
3. Select top candidate as primary, next two as fallbacks
4. Decrypt API key for primary (env or vault per §8)
5. Execute with timeout
6. On success: OTel span, write `token_usage_logs` row, return result
7. On failure: error event, try first fallback; up to 2 fallbacks before returning error
8. Rollback semantics via `rollbackProvider` admin function

### 5.5 AI credential storage

Most AI providers use **VIYO account-level credentials** in env vars (validated by `packages/shared/src/config/env.ts` Zod schema at boot). Exception: brand BYO-key scenarios (Phase 2+) land in `integration_connections` with `provider='ai_byo_<provider_id>'`.

### 5.6 Cost attribution (Lock 8 + D56)

Every billable AI execute writes `token_usage_logs`:
- `provider`, `model` — registry-resolved
- `operation_type` — mapped from capability
- `prompt_tokens`, `completion_tokens`, `image_count` — consumed
- `calculated_cost` — from `provider_pricing_registry` × units × `markup_multiplier`
- `stripe_meter_event_id` — NULL initially; reconciliation cron populates
- `generation_id` — propagated

**Lock 8:** Programmatic (non-billable) executes do NOT write `token_usage_logs`. The registry distinguishes via `billable: true|false` flag on the call. CI grep enforces no `token_usage_logs.insert` in code paths with `billable: false`.

### 5.7 AI failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| All candidates fail | Tier 1+2+3 all unavailable | `AI_NO_PROVIDERS_AVAILABLE` | Return error to consumer; do NOT charge | Sentry critical |
| Timeout | Single provider exceeds `timeout_ms` | `AI_PROVIDER_TIMEOUT` | Try next fallback | OTel event |
| Auth fail (401/403) | API key issue | `AI_PROVIDER_AUTH_FAILED` | Mark inactive; alert PO; fallback | Sentry critical |
| Rate limit (429) | Quota exceeded | `AI_PROVIDER_RATE_LIMITED` | Try fallback; queue for retry | OTel event |
| Invalid response | Malformed payload | `AI_PROVIDER_INVALID_RESPONSE` | Try fallback; log | Sentry warn |
| Pricing missing | No `provider_pricing_registry` row | `AI_PRICING_MISSING` | Default to registry metadata cost; alert admin | Sentry warn |
| Lock 19 hardcoded model | CI grep finds literal | `LOCK_19_VIOLATION_HARDCODED_MODEL` | Reject PR | Architect rewrite |
| BYO key invalid | Brand BYO creds fail | `AI_BYO_AUTH_FAILED` | Fall back to VIYO account; notify brand | App warn |
| Embedding dimension change | Provider changes output dim | `AI_EMBEDDING_DIMENSION_MISMATCH` | Reject INSERT; alert Architect | Sentry critical |

### 5.8 AI edge cases + tests

- Edge: Hot provider swap; in-flight uses originally-resolved
- Edge: Provider deprecated by vendor; mark inactive; preserve `token_usage_logs`
- Edge: Multi-region failover (v2.1 future)
- Edge: Streaming responses (v2.6 future)
- Edge: Concurrent generation limit (distributed enforcement future)
- Test: Resolution determinism, fallback chain coverage, cost attribution end-to-end, Lock 8 grep, Lock 19 grep

---

## 6. E-commerce Platform Abstraction (full detail — parity with ESP and AI)

### 6.1 Purpose

The E-commerce Platform layer enables VIYO to connect to any e-commerce platform where a brand stores products, orders, and customer data. The agnostic-registry contract is identical to ESP and AI: capability-driven resolution, vault-stored credentials, no hardcoded platform names in normative code. **Per-platform extraction logic (Shopify field mapping, WooCommerce webhook handler implementations, Magento OAuth callback handling, etc.) lives in R31.** This spec defines the registry contract that R31 plugs into.

### 6.2 Supported platforms (v2.0)

| Platform | Status | Auth method | Per-platform R-spec |
|---|---|---|---|
| Shopify | Implemented (production) | OAuth + scopes | R31 §3 |
| WooCommerce | Registry pattern ready; concrete entry pending implementation | API key + URL (brand provides their WP site URL + REST API key/secret) | R31 §4 (planned) |
| Magento | Registry pattern ready; concrete entry pending | OAuth | R31 §5 (planned) |
| BigCommerce | Registry pattern ready; concrete entry pending | OAuth | R31 §6 (planned) |
| Squarespace Commerce | Registry pattern ready; concrete entry pending | API key | R31 §7 (future) |
| Wix | Registry pattern ready; concrete entry pending | OAuth | R31 §8 (future) |
| Custom platforms | Registry pattern ready; per-brand custom adapter | Per-brand config | R31 §9 (future) |

The credential enum (`packages/shared/src/schemas/credential.ts` extended providers) currently includes `shopify`, `stripe`, `custom`. R29 v2 expands to cover all e-commerce platforms; each gets its row in `category_registry` when implementation lands.

### 6.3 Registry entry shape (e-commerce)

```typescript
export interface EcommerceRegistryEntry {
  id: string;                          // 'shopify', 'woocommerce', 'magento', 'bigcommerce', etc.
  name: string;                        // Display name
  category: 'ecommerce';               // Always 'ecommerce' for this entry shape
  authMethod: 'oauth' | 'api_key' | 'api_key_with_url' | 'oauth_with_url';
  apiBaseUrlTemplate?: string;         // For self-hosted (WooCommerce, custom Magento), brand provides URL via interpolation
  capabilities: string[];              // Subset of e-commerce capabilities from §3.2
  webhookEventCatalog: string[];       // Events this platform delivers
  metadata: {
    apiVersion?: string;
    requiredScopes?: string[];         // OAuth platforms
    rateLimit?: { requestsPerMinute: number; concurrentLimit?: number };
    productFieldMapNamespace: string;  // Pointer to R31 platform-specific field map
    webhookSignatureMethod: 'hmac_sha256' | 'hmac_sha1' | 'custom';
    requiredHeaders?: string[];        // Headers VIYO must always send
    notes: string;                     // Platform-specific limitations
  };
}
```

### 6.4 The E-commerce Registry (concrete + sketches)

#### 6.4.1 Shopify (implemented)

```typescript
shopify: {
  id: 'shopify', name: 'Shopify', category: 'ecommerce',
  authMethod: 'oauth',
  capabilities: [
    'product_catalog_pull', 'product_single_pull', 'order_webhook_register',
    'order_history_pull', 'customer_sync', 'inventory_check',
    'discount_code_create', 'discount_code_lookup', 'connection_health_check'
  ],
  webhookEventCatalog: [
    'orders/create', 'orders/updated', 'orders/cancelled', 'orders/fulfilled',
    'products/create', 'products/update', 'products/delete',
    'inventory_levels/update', 'customers/create', 'customers/update',
    'app/uninstalled', 'shop/update'
  ],
  metadata: {
    apiVersion: '2025-01',
    requiredScopes: ['read_products', 'read_orders', 'read_customers', 'write_discounts'],
    rateLimit: { requestsPerMinute: 40 },  // Shopify standard plan default
    productFieldMapNamespace: 'r31.shopify',
    webhookSignatureMethod: 'hmac_sha256',
    requiredHeaders: ['X-Shopify-Access-Token'],
    notes: 'OAuth flow uses Shopify Partner App. API version pinned annually.'
  }
}
```

#### 6.4.2 WooCommerce (sketch — concrete entry lands in B-W001)

```typescript
woocommerce: {
  id: 'woocommerce', name: 'WooCommerce', category: 'ecommerce',
  authMethod: 'api_key_with_url',
  apiBaseUrlTemplate: '{brand_site_url}/wp-json/wc/v3',
  capabilities: [
    'product_catalog_pull', 'product_single_pull', 'order_webhook_register',
    'order_history_pull', 'customer_sync', 'connection_health_check'
    // Note: discount_code capabilities require WooCommerce plugin extensions; flagged for B-W002 evaluation
  ],
  webhookEventCatalog: [
    'order.created', 'order.updated', 'order.deleted',
    'product.created', 'product.updated', 'product.deleted',
    'customer.created', 'customer.updated'
  ],
  metadata: {
    apiVersion: 'wc/v3',
    rateLimit: { requestsPerMinute: 60 },  // WooCommerce default; varies by host
    productFieldMapNamespace: 'r31.woocommerce',
    webhookSignatureMethod: 'hmac_sha256',
    requiredHeaders: ['Authorization'],  // Basic auth with consumer key/secret
    notes: 'Self-hosted; brand provides site URL + REST API consumer key + consumer secret. Site reachability is brand responsibility.'
  }
}
```

#### 6.4.3 Magento, BigCommerce, Squarespace Commerce, Wix, custom (registry pattern locked; concrete entries land per platform Bullet)

Each follows the same shape with platform-specific `authMethod`, `apiBaseUrlTemplate`, `capabilities`, `webhookEventCatalog`, `metadata`. The R29 v2 registry contract is sufficient for any e-commerce platform — adding a new one is a registry row + R31 platform-specific operational R-spec section, never code changes to the unified registry interface.

### 6.5 E-commerce credential storage (R20 v2 §2.12.1)

`integration_connections` table:
- `workspace_id` FK — multi-tenant isolation
- `provider` VARCHAR(50) — e-commerce platform ID (`shopify`, `woocommerce`, `magento`, `bigcommerce`, ...)
- `access_token_encrypted` + optional `refresh_token_encrypted` — AES-256-GCM via vault
- `scopes` VARCHAR[] — OAuth scopes granted
- `expires_at` TIMESTAMPTZ — for short-lived tokens
- `channel_mappings` JSONB — platform-specific (Shopify location → VIYO brand mappings, WooCommerce category mappings, etc.)
- `metadata` JSONB — platform URL for self-hosted, API version pinning, rate limit config
- Composite UNIQUE `(workspace_id, provider)`
- RLS tenant-scoped

### 6.6 E-commerce capability execution

```typescript
// Pull product catalog (operational details in R31)
await providerRegistry.execute({
  category: 'ecommerce',
  capability: 'product_catalog_pull',
  workspaceId, brandId,
  args: { platform: 'shopify', fullSync: false, since: '2026-05-01T00:00:00Z' },
  generationId
});
// Returns: { products: [...], nextCursor: '...', syncMetadata: {...} }
// R31 §3 covers Shopify-specific field extraction, normalization, etc.

// Register order webhook
await providerRegistry.execute({
  category: 'ecommerce',
  capability: 'order_webhook_register',
  workspaceId, brandId,
  args: { platform: 'shopify', events: ['orders/create', 'orders/updated'], callbackUrl: 'https://api.viyo.new/v1/webhooks/ecommerce/...' },
  generationId
});

// Connection health check (used by Studio UI status indicators)
await providerRegistry.execute({
  category: 'ecommerce',
  capability: 'connection_health_check',
  workspaceId, brandId,
  args: { platform: 'shopify' },
  generationId
});
// Returns: { healthy: true | false, lastSyncAt, scopes, expiresAt }
```

### 6.7 Refactor path for e-commerce expansion (Shopify-only → multi-platform agnostic)

The current implementation has Shopify directly integrated in code; the refactor mirrors the AI Lock 19 refactor pattern at smaller scale.

| Bullet | Owner | Scope |
|---|---|---|
| B-XC.01-I (e-commerce registry seed) | Architect Claude (Path B) | Add Shopify row to `category_registry` table when AI seed migration runs (B-XC.01-B); seed includes the Shopify metadata from §6.4.1 |
| B-XC.01-J (e-commerce runtime registry read) | Kimi | Refactor Shopify-specific code paths in `apps/worker/src/lib/ecommerce/shopify/*` (or wherever Shopify code currently lives) to consume registry entries instead of direct constants for connection metadata, rate limits, scopes, API version |
| B-XC.01-K (e-commerce CI grep lock) | Architect + Kimi | CI grep test rejects new e-commerce code that hardcodes platform-specific names in normative paths (operational platform-specific files in R31 module are exempt; only the registry-consumer interface code is constrained) |
| B-W001 (WooCommerce) | Kimi when scheduled | Add WooCommerce row to `category_registry`; implement R31 §4 WooCommerce operational module against registry interface |
| B-M001 (Magento) | Kimi when scheduled | Add Magento row; implement R31 §5 |
| B-BC001 (BigCommerce) | Kimi when scheduled | Add BigCommerce row; implement R31 §6 |
| (future) | Kimi when scheduled | Squarespace Commerce, Wix, custom platforms |

After B-XC.01-K, the unified registry interface is locked; new platforms add via `category_registry` row + per-platform operational R31 section. No changes to the unified Provider Registry code.

### 6.8 E-commerce failure modes

| Failure | Trigger | Error code | Rollback | Logging |
|---|---|---|---|---|
| Credential expired | Token expired without refresh | `ECOMMERCE_AUTH_EXPIRED` | Trigger OAuth refresh; if fail, notify brand | Sentry warn |
| OAuth scope insufficient | API returns scope error | `ECOMMERCE_SCOPE_INSUFFICIENT` | Mark `status='partial_scopes'`; notify brand to re-authorize | App warn |
| Rate limit | API 429 | `ECOMMERCE_RATE_LIMITED` | Inngest exp-backoff retry; per-platform rate config in metadata | OTel event |
| Platform unreachable (self-hosted) | WooCommerce site down / wrong URL | `ECOMMERCE_PLATFORM_UNREACHABLE` | Mark inactive; notify brand | App warn |
| Webhook signature invalid | Inbound webhook HMAC fail | `ECOMMERCE_WEBHOOK_SIGNATURE_INVALID` | Reject; do not retry; log | Sentry warn |
| API version deprecated | Platform returns deprecation header | `ECOMMERCE_API_VERSION_DEPRECATED` | Continue; alert PO to bump registry metadata | OTel event |
| Unknown platform | Consumer requests platform not in registry | `ECOMMERCE_UNKNOWN_PLATFORM` | Reject request | App warn |
| Webhook callback URL mismatch | Platform sends webhook to wrong URL | `ECOMMERCE_WEBHOOK_URL_DRIFT` | Re-register webhook; alert | Sentry warn |
| Platform-specific extraction failure | R31 module fails on a product/order shape | `ECOMMERCE_EXTRACTION_FAILED` | R31 handles per-platform; surface to user with platform context | Sentry warn |

### 6.9 E-commerce edge cases

- **Brand has multiple stores on same platform** (e.g. two Shopify stores) → each is a separate `integration_connections` row with different `provider` discriminator OR separate workspaces; current model uses separate workspaces (one brand → one workspace; multi-store brands split workspaces)
- **Brand migrates platforms** (Shopify → WooCommerce) → new `integration_connections` row added; old marked `is_active=false`; historical product data preserved with platform attribution
- **Platform OAuth scope changes** (platform adds new required scope) → existing connections with old scope set continue working until token refresh; new connections get new scope set
- **Webhook URL must change** (VIYO API migration) → re-register webhooks for all active connections via background Inngest job
- **Custom platform with no formal API** (e.g. legacy bespoke e-commerce) → registered as `provider='custom'`; metadata holds the brand-specific adapter config; R31 §9 covers custom-platform handling
- **Platform support sunset** (vendor end-of-life) → mark `is_active=false`; preserve historical data; notify brands using it

### 6.10 E-commerce tests required

- **Test:** Registry resolution for each capability returns correct platform when brand has only one e-commerce connection
- **Test:** Multi-platform brand (Shopify + WooCommerce) — `connection_health_check` returns correct status for each
- **Test:** OAuth refresh flow — expired token → registry triggers refresh → fresh token stored → subsequent execute succeeds
- **Test:** Webhook signature verification — valid signature accepted; invalid rejected; replay attack (old timestamp) rejected
- **Test:** Cross-tenant isolation — workspace A cannot read workspace B's `integration_connections`
- **Test:** Self-hosted platform URL validation — invalid URLs rejected at connection creation
- **Test:** Rate limit handling — exceeding limit triggers exp-backoff retry; eventual success or queue placement
- **Test:** Scope insufficiency — API call returning scope error marks connection `partial_scopes`; user-facing notification fires
- **Test:** Platform-specific extraction (R31 covers per-platform; integration test verifies R29 registry call → R31 module is wired correctly)

---

## 7. AI Provider Refactor Path (Lock 19 fulfillment)

### 7.1 Current state (9 files with model literal surfaces)

| File | Match count | Refactor scope |
|---|---:|---|
| `packages/shared/src/schemas/art-director.ts` | 96 | Replace Zod enums with runtime registry validation; move model metadata to DB seed |
| `apps/worker/src/lib/ai/router-config.ts` | 51 | Remove `ART_DIRECTOR_TIERN_GENERATION_MODELS` constants; replace with `registry.listProviders({tier: N})` |
| `apps/worker/src/lib/ai/art-director-routing.test.ts` | 52 | Update tests to use registry mocks |
| `apps/worker/src/lib/ai/provider-registry.ts` | 24 | Refactor to read from `category_registry` table at boot + hot-reload |
| `packages/shared/src/config/env.ts` | 23 | Remove env-var validation for model-specific keys; replace with generic gateway API key validation |
| `apps/worker/src/lib/ai/image-router.ts` | 4 | Replace `calculateArtDirectorScore` literal refs with registry capability resolution |
| `apps/worker/src/lib/ai/art-director-route-generation.test.ts` | 5 | Update fixtures to registry mocks |
| `apps/web/src/components/studio/ImageStudio.test.ts` | 3 | Update Studio UI tests |
| `apps/web/src/lib/studio-api.test.ts` | 2 | Update Studio API tests |

### 7.2 Sequenced refactor Bullets

| Bullet | Owner | Scope |
|---|---|---|
| B-XC.01-A (this spec ratification) | Architect | R29 v2 lands; refactor specified, not executed |
| B-XC.01-B (new R20 minor: `category_registry` table) | Architect (Path B) | Schema migration adds table per §3.6 sketch; seeds 22 generation + 10 editing AI models + 8 ESP entries + Shopify entry |
| B-XC.01-C (registry runtime read from DB) | Kimi | Refactor `provider-registry.ts` to read from `category_registry` at boot; preserve function signatures |
| B-XC.01-D (consumer refactor: image-router + router-config) | Kimi | Replace tier constants with registry calls |
| B-XC.01-E (consumer refactor: art-director.ts Zod schemas) | Kimi | Replace generation/editing model Zod enums with `z.string().refine(registry.isValidModel)` |
| B-XC.01-F (test refactor) | Kimi | Update test files to use registry mocks |
| B-XC.01-G (env.ts refactor) | Kimi | Remove model-specific env var validation |
| B-XC.01-H (AI CI grep lock) | Architect + Kimi | CI grep test enforces no hardcoded AI model name literals in normative code |
| B-XC.01-I (e-commerce registry seed) | Architect | Add e-commerce platforms to `category_registry` (per §6.7) |
| B-XC.01-J (e-commerce runtime registry read) | Kimi | Refactor e-commerce code to consume registry |
| B-XC.01-K (e-commerce CI grep lock) | Architect + Kimi | CI grep test for e-commerce normative paths |

After B-XC.01-K, all current Lock 19 violation surfaces are removed and the CI grep test permanently enforces. Future categories extend via the same Bullet pattern.

### 7.3 Test files refactor

5 of 9 hardcoded files are test files. After refactor: tests import a `mockRegistry` builder; construct mocks with providers they need; pass via DI. The 9 hardcoded literals → 0 after refactor; tests gain provider-shape clarity.

### 7.4 Migration safety

Forward-only. No rollback to hardcoded state needed because the DB-driven registry has the same data. If any Bullet fails CI: revert that Bullet's PR; previous state still works. If `category_registry` created but unpopulated: registry returns empty; consumers see `AI_NO_PROVIDERS_AVAILABLE` / `ECOMMERCE_UNKNOWN_PLATFORM` / `ESP_UNKNOWN_PROVIDER`; PO seeds the table.

---

## 8. Unified Provider Registry Interface

### 8.1 Single entry point

```typescript
interface ProviderExecuteRequest {
  category: 'esp' | 'ai' | 'ecommerce' | string;  // string for future categories
  capability: string;                              // From category's capability namespace
  workspaceId: string;
  brandId?: string;
  args: Record<string, unknown>;
  generationId: string;
  preferences?: {
    preferredTier?: 1 | 2 | 3;
    excludeProviders?: string[];
    optimizeFor?: 'quality' | 'cost';
    explicitProvider?: string;
  };
  billable?: boolean;
}

interface ProviderExecuteResult<T> {
  data: T;
  metadata: {
    resolvedProvider: string;
    resolvedModel?: string;
    tier?: 1 | 2 | 3;
    durationMs: number;
    cost?: number;
    retryCount: number;
    fallbackUsed: boolean;
    fallbackChain?: string[];
    tokenUsageLogId?: string;
  };
}
```

### 8.2 Helper methods

```typescript
// Inspect available providers without executing
await providerRegistry.listProviders({ category, capability, workspaceId });
// Returns: ProviderRegistryEntry[]

// Inspect a specific provider
await providerRegistry.getProvider({ id });

// Admin: deactivate provider
await providerRegistry.rollbackProvider({ id, reason });

// Admin: reactivate provider
await providerRegistry.reactivateProvider({ id });

// Health check (any category)
await providerRegistry.healthCheck({ category, workspaceId });
// Returns per-provider availability + lastChecked timestamp
```

### 8.3 RPC contracts

- `GET /api/v1/providers?category={cat}&capability={cap}&workspace_id={ws}` — exposed to admin UI; lists available providers
- `POST /api/v1/providers/execute` — worker-internal only (credentials never exposed to client)
- `GET /api/v1/providers/health?category={cat}&workspace_id={ws}` — exposed to Studio UI for connection status indicators

### 8.4 Consumer integration patterns

- **Pattern A — Capability-only (recommended for AI):** Consumer requests capability; registry resolves
- **Pattern B — Capability + tier preference (AI):** Consumer expresses tier; registry resolves within
- **Pattern C — Explicit provider (ESP, e-commerce):** Consumer (or brand UI) names a specific provider since the brand has chosen the platform

---

## 9. Credential Management & Pricing

### 9.1 Universal vault path (R22 §4)

All provider credentials across all categories — ESP API keys, AI BYO keys, e-commerce OAuth tokens, refresh tokens, future-category credentials — are AES-256-GCM ciphertext via `packages/shared/src/security/vault.ts`. Plaintext credentials NEVER appear in API responses, logs, error messages, DB backups, or audit logs.

### 9.2 Dual-key rotation

`VIYO_VAULT_KEY` (current) + `VIYO_VAULT_KEY_PREVIOUS` (retained for rotation). Background re-encryption job rotates all `*_encrypted` columns; old key retired after completion.

### 9.3 Credential lifecycle

| State | Trigger | Effect |
|---|---|---|
| `active` | Initial create + successful auth | Registry can resolve |
| `partial_scopes` | OAuth scope error | Capabilities filtered to permitted set; brand notified |
| `rotating` | Token refresh in-flight | Brief state; not user-visible |
| `inactive` | Auth fail / manual deactivation / scope revocation | Registry skips |
| `revoked` | Brand explicit disconnect | Audit preserved; ciphertext zeroed |

### 9.4 Provider pricing (R20 v2 §2.9.6)

Every billable AI execute: lookup `provider_pricing_registry` row matching `(provider, model, operation_type)`, `effective_from <= NOW() < effective_until OR effective_until IS NULL`, `is_active=TRUE`. Compute `calculated_cost = units × cost_per_unit × markup_multiplier`. Write `token_usage_logs` row.

Pricing updates via T9 §11 admin UI + weekly cron drift monitor. Missing pricing fallback to registry entry metadata cost + admin alert.

E-commerce capabilities are not currently billable per-call (platform integrations are subscription-tier features, not metered). Pricing schema is reserved for future per-call pricing if needed.

### 9.5 Memory scrubbing

Per R22 §4 Sentry-compatible scrub list: `viyo_vault_key`, `viyo_vault_key_previous`, `api_key`, `access_token`, `refresh_token`, `secret`, `password`, `key_hash`, plus any `*_encrypted` field. Auto-redacted in Sentry stack traces.

---

## 10. Lock 19 Extension Clause (PO Hard Rule 2026-05-12)

### 10.1 The Clause

**Provider Agnosticism applies to every integration category — current (ESP, AI, e-commerce) and future. No new integration category may be added that hardcodes provider names in normative code. Every new category extends the unified registry; none bypasses it.**

This clause is self-extending: it covers categories VIYO doesn't yet have. When VIYO adds payments-beyond-Stripe, analytics, CRM, ad platforms, SMS providers, or any other outside-system integration:

1. The new category gets a `category` value (e.g. `'payments'`, `'analytics'`, `'crm'`, `'ads'`, `'sms'`, etc.)
2. The new category gets its capability namespace locked in the introducing R29 minor version
3. Providers for the category are rows in `category_registry`, never hardcoded constants
4. Credentials use the universal vault path (R22 §4); workspace-scoped where applicable
5. Cost attribution flows through the same `token_usage_logs` pattern if billable per-call, or through subscription tier categorization if not
6. Failure modes follow the same `<CATEGORY>_<ERROR>` naming pattern
7. CI grep test extends to enforce no hardcoded provider names in the new category's normative code

### 10.2 Anticipated future categories (non-exhaustive)

The clause is forward-looking. Concrete categories likely to be added (not commitments — just illustrative of the rule's scope):

| Category | Examples | When likely |
|---|---|---|
| `payments` | Stripe (currently direct T9; absorption pending), Paddle, Lemon Squeezy, regional payment providers | Phase 2+ when T9 is opened for refactor |
| `analytics` | Mixpanel, Amplitude, PostHog (currently direct), GA4, brand-specific analytics platforms | Phase 2+ when analytics integrations expand beyond internal PostHog |
| `crm` | HubSpot CRM (distinct from HubSpot ESP), Salesforce, Pipedrive, brand-specific CRMs | P3 Intelligence Studio scope |
| `ads` | Meta Ads, Google Ads, TikTok Ads (for retargeting feeds from VIYO segments) | P3+ when VIYO emits audience signals to ad platforms |
| `sms` | Twilio, MessageBird, Postscript (which is also kind of an ESP), Klaviyo SMS | Phase 2+ when SMS channel added |
| `cdp` | Segment, RudderStack, mParticle (if VIYO becomes a CDP destination or source) | P4+ |
| `cms` | Contentful, Sanity (if brand wants imagery to flow back) | Future |
| `pim` | Akeneo, Salsify (product information management) | Future |
| `feedback` | Yotpo, Trustpilot reviews (for incorporating social proof into emails) | Phase 2+ |

For each, when VIYO adds it: a new R29 minor version locks the category's capability namespace; `category_registry` accepts new rows with the new `category` value; the unified `providerRegistry.execute(...)` interface gains support for the new category without code changes to the interface itself.

### 10.3 Anti-pattern explicitly forbidden

The following pattern is FORBIDDEN under the Extension Clause:

```typescript
// ❌ FORBIDDEN — hardcoded provider in normative code
if (paymentProcessor === 'stripe') {
  return await stripeClient.charges.create(...);
} else if (paymentProcessor === 'paddle') {
  return await paddleClient.checkout.create(...);
}
```

The correct pattern:

```typescript
// ✅ CORRECT — registry-resolved provider
const result = await providerRegistry.execute({
  category: 'payments',
  capability: 'process_charge',
  workspaceId, brandId,
  args: { amount, currency, customerId },
  generationId
});
```

CI grep test (introduced in B-XC.01-H for AI, B-XC.01-K for e-commerce) extends per-category as new categories land.

### 10.4 The hard part of the Extension Clause

This clause is self-extending in spirit and intent, but each new category MUST be authored as a R29 minor version that:
- Defines the category's capability namespace (locked at introduction)
- Defines per-category metadata schema in `category_registry.metadata` JSONB shape
- Defines per-category failure mode codes (`<CATEGORY>_<ERROR>`)
- Defines per-category credential lifecycle (most will mirror the OAuth/API-key patterns already established)
- Defines per-category cost attribution model (billable per-call vs subscription-tier vs free)
- Extends the CI grep test to cover the new category's normative code paths

The Extension Clause says NEW CATEGORIES ARE ALWAYS WELCOME; it does NOT say new categories are zero-work. The rule is: **the registry interface and pattern don't change**; new categories slot in as new `category` values + new capability namespaces + new metadata shapes.

### 10.5 Conflict resolution clause

If a future PO decision or Bullet directive proposes a category-specific integration that bypasses the registry (e.g. "let's just hardcode a Stripe call for this one feature, it's faster"), this Extension Clause supersedes. Bypass is permitted only via:
1. Explicit PO ratification waiving Lock 19 for that specific scope (rare; should be exceptional)
2. Architect Claude rewriting Lock 19 itself (which requires a full Foundation Lock amendment ratification process)

Default: Lock 19 + Extension Clause wins. Bypass loses. CI grep enforces.

---

## 11. Failure Modes Summary (Cross-Category)

See per-category sections (§4.7 ESP, §5.7 AI, §6.8 E-commerce) for detailed tables. Cross-category aggregate:

| Category | Examples |
|---|---|
| Credential | Vault decrypt fail, expired token, dual-key rotation drift, BYO auth fail |
| Authentication | OAuth scope insufficient, API key revoked, rate limit |
| Resolution | No providers available, fallback chain exhausted, unknown provider |
| Cost attribution | Missing pricing row, Stripe meter backlog, Lock 8 violation (programmatic call charging tokens) |
| Governance | **Lock 19 + Extension Clause violation (hardcoded provider in any category)**, VIYO-UTL audit leak, footer compliance violation |
| Data integrity | Webhook signature invalid, dimension mismatch in embeddings |
| Operational | Provider deprecated, regional endpoint down, rate limit cascade |
| Platform-specific (e-commerce) | Platform unreachable (self-hosted), API version deprecated, custom platform adapter failure |
| Future-category-specific | Per-category failure modes documented in the introducing R29 minor version |

---

## 12. Edge Cases Summary (Cross-Category)

| Category | Examples |
|---|---|
| Bootstrap | First workspace no ESP, AI seeded but no pricing, e-commerce not connected, no future categories yet |
| Concurrency | Concurrent OAuth refresh, two registry refreshes mid-execute, in-flight credential rotation |
| Lifecycle | Provider deprecated by vendor, brand revokes connection during compose, BYO key swap, platform migration |
| Boundary | All AI Tier 1 rate-limited, ESP-native syntax leaked into composable, e-commerce returns 0 products |
| Multi-tenant | Two brands sharing platform credentials forbidden by composite UNIQUE; credential isolation enforced |
| Multi-store | Brand with multiple Shopify stores → separate workspaces, separate connections |
| Multi-region | Provider regional endpoints; v2.1+ future |
| Versioning | ESP API version retired, AI model retired, e-commerce platform API breaking change |
| Brand preference drift | Approved provider unavailable → graceful fallback to next preference |
| Custom platform | E-commerce custom adapter per-brand; no fixed schema |
| Category emergence | New category proposed; R29 minor version protocol per §10 |

---

## 13. Observability

### 13.1 Generation ID universal propagation

Every `providerRegistry.execute(...)` propagates consumer's `generation_id` across: OTel span attributes, `token_usage_logs.generation_id` (billable AI), PostHog event properties, Sentry tags.

### 13.2 OTel spans

Span attributes: `viyo.provider.category`, `viyo.provider.capability`, `viyo.provider.resolved_id`, `viyo.provider.resolved_model`, `viyo.provider.tier`, `viyo.provider.gateway`, `viyo.provider.retry_count`, `viyo.provider.fallback_used`, `viyo.workspace_id`, `viyo.brand_id`, `viyo.generation_id`.

### 13.3 PostHog events

`provider.execute.started`, `provider.execute.resolved`, `provider.execute.completed`, `provider.execute.failed`, `provider.credential.rotated`, `provider.deactivated`, plus per-category extensions (e.g. `ecommerce.webhook.received`, `esp.send.queued`).

### 13.4 Sentry capture rules

Critical: credential decrypt fail, all providers unavailable, **Lock 19 + Extension Clause grep violation**, Lock 8 violation, embedding dimension mismatch.
Warn: provider auth (401/403), provider timeout, missing pricing, webhook signature invalid, BYO key invalid.
Info: rate limit (operational).

### 13.5 Admin dashboard surfaces

Active providers per category + count + last-resolved timestamp.
Failure rate per provider (24h).
Cost attribution per workspace per provider (30d).
Credential lifecycle status.
Pricing registry coverage (matching pairs between registered providers and pricing rows).
**Category coverage map** (which categories have providers active; future categories slot in here when introduced).

---

## 14. Tests Required (ZCBR BR-3)

| Test category | Coverage |
|---|---|
| Registry resolution per category | Each capability resolves to expected provider; tier preferences respected; brand preferences applied |
| Fallback chain (AI) | Primary fails → fallback → exhaustion produces `AI_NO_PROVIDERS_AVAILABLE` |
| Credential vault (all categories) | Encrypt → store → fetch → decrypt round-trip; dual-key rotation preserves access |
| ESP translation | VIYO-UTL → each of 8 ESP-native syntaxes; footer injected; conditional wrapped |
| ESP CI audit | Leaked syntax fixture rejected; clean fixture accepted |
| Provider pricing | Match found → correct cost; missing → fallback default; multiple effective rows → most recent |
| **Lock 19 grep (all categories)** | Code with hardcoded provider name fails CI grep — per-category extended grep covers AI, e-commerce, plus future categories as they land |
| Lock 8 grep | Programmatic code writing `token_usage_logs` fails |
| Cross-tenant isolation | Workspace A cannot resolve workspace B's credentials |
| Webhook signature (ESP + e-commerce) | Valid accepted; invalid rejected; replay rejected |
| Provider deactivation | Inactive skipped; reactivation restores |
| Resolution determinism | Same input → same resolution |
| Concurrent execute | 100 concurrent → atomic cost attribution; no double-charging |
| Generation ID propagation | Single execute → correlated entries in OTel + PostHog + `token_usage_logs` (if billable) + Sentry (on error) |
| BYO key fallback | Brand BYO invalid → falls back to VIYO account |
| **E-commerce multi-platform** | Brand with Shopify + WooCommerce → registry resolves correctly per request; connection health check returns per-platform status |
| **OAuth refresh flow** | Expired token → registry triggers refresh → execute succeeds |
| **Self-hosted platform validation** | Invalid WooCommerce URL rejected at connection creation |
| **Lock 19 Extension Clause** | Adding a hypothetical future-category provider via registry pattern succeeds; adding it via hardcoded code path fails CI |

CI integration: All tests on every PR. Grep tests on every staging merge.

---

## 15. Mechanical Acceptance Criteria (ZCBR BR-7)

R29 v2 is accepted when:

1. **Unified Provider Registry interface exists** — `providerRegistry.execute(...)` covers ESP + AI + e-commerce; consumer integration patterns A/B/C work
2. **ESP abstraction preserved** — VIYO-UTL unchanged; 8-ESP registry preserved verbatim; `viyo_utl_audit` CI check enforces
3. **AI provider abstraction live** — `category_registry` seeded with 22 generation + 10 editing AI models; registry reads from table at boot
4. **E-commerce abstraction live** — `category_registry` seeded with Shopify entry per §6.4.1; registry pattern locked for WooCommerce/Magento/BigCommerce/+ entries to land per per-platform Bullet
5. **Refactor path executed (AI)** — 9 hardcoded AI surfaces removed (or in-progress via B-XC.01-B through B-XC.01-H)
6. **Refactor path executed (e-commerce)** — Shopify registry seed lands (B-XC.01-I); future platform Bullets follow same pattern
7. **Credential vault universal** — every credential write across all 3 categories goes through vault; CI grep enforces
8. **Cost attribution complete (AI billable)** — every AI billable execute produces `token_usage_logs` row; programmatic does NOT; Lock 8 grep enforces
9. **Lock 19 grep test passes (AI)** — no hardcoded AI model literals in normative code (B-XC.01-H complete)
10. **Lock 19 grep test passes (e-commerce)** — no hardcoded e-commerce platform literals in normative registry-consumer code (B-XC.01-K complete; per-platform operational R31 modules exempt)
11. **Lock 19 Extension Clause locked** — §10 documents the self-extending rule; future categories must follow the pattern; CI grep extends as categories land
12. **Generation ID propagation** — single Studio request produces correlated artifacts (DB rows + OTel spans + PostHog events) sharing `generation_id`
13. **Provider Registry RPC contracts documented + working** — admin UI can list providers per category/capability; admin can rollback/reactivate; Studio UI can check connection health per category
14. **Dual-key rotation tested** — rotation runs without disrupting in-flight executes
15. **No service depends on hardcoded provider names** — Reviewer Claude §9 Gate validates all new code consumes via registry
16. **R29 v1 superseded** — cleanup directive lands SUPERSEDED header on R29 v1 within 24 hours of R29 v2 merge
17. **R24 v2 forward reference resolved** — patch update changes "TO BE AUTHORED via B-XC.01" → concrete v2 reference (operational cleanup post-merge)
18. **All 8 ESP entries** verified via CI fixtures producing valid VIYO-UTL → native translation per ESP
19. **`provider_pricing_registry` coverage** — every active AI provider has matching active pricing row; CI test fails if missing
20. **E-commerce capability coverage** — Shopify supports all 9 e-commerce capabilities from §3.2; future platforms support subset as their implementation lands (gaps documented in registry metadata)
21. **Category coverage map exposed** — admin dashboard surface shows which categories are active + provider counts
22. **Connection health check works** — `connection_health_check` capability returns valid status for any registered provider (used for Studio UI status indicators)

---

## 16. Locks & Decisions Invoked

| Authority | Application |
|---|---|
| Lock 4 | Provider data persists to DB; not runtime synthesis |
| Lock 6 | Credentials workspace-scoped; consumed per-brand |
| Lock 8 | Programmatic resolution charges 0 tokens; CI grep |
| Lock 11 | Brain text generation flows through registry's `text_generation` capability |
| Lock 13 | `esp_connections` + `integration_connections` RLS workspace-scoped |
| Lock 17 | Foundation-First — R29 v2 is precondition for B-1.00 |
| **Lock 19 + Extension Clause (§10)** | **THIS SPEC IS THE CONTRACT.** No hardcoded provider names in any category, current OR future. Self-extending. |
| Lock 20 | ZCBR PASSED |
| D8 | 5-tier pricing — informs subscription billing for integration categories |
| D55 | R29 PAL Option C unified Plugin Registry — THIS SPEC IS THE FULFILLMENT |
| **PO Hard Rule 2026-05-12** | **Full agnosticism across all current AND future categories — §10 Extension Clause** |
| D56 | Token metering Phase 0/1 split — AI billable writes Phase 0 substrate |
| D57 | Skills not in registry; this registry handles providers (external services with credentials) |
| D63 | Skills loaded via Portal; not in this registry |
| D66 | B-1.00 first Path C Bullet — R29 v2 is precondition |
| R20 v2 | Consumed for `esp_connections`, `integration_connections`, `provider_pricing_registry`, `token_usage_logs`, reserved `category_registry` slot |
| R24 v2 | §3 forward-references R29 PAL v2; this spec fulfills |
| R22 §4 | Universal vault path for all credentials |
| R31 | E-commerce per-platform operational depth |

---

## 17. Migration to v2 (Implementation Path)

### 17.1 Supersession

R29 v2 committed via Path B to `/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md`. `R29-V2-SUPERSESSION-001` directive lands SUPERSEDED header on R29 v1.

### 17.2 Implementation reconciliation

Refactor across B-XC.01-B through B-XC.01-K (AI + e-commerce). Each Bullet cites R29 v2; Reviewer §9 Gate validates via `zcbr-spec-validation`; Kimi pre-flight loads R29 v2.

### 17.3 R24 v2 patch update

After R29 v2 lands, R24 v2 §3 citation updates from "TO BE AUTHORED via B-XC.01" → concrete reference. Path B operational cleanup.

### 17.4 Future R29 minor versions

| Minor | Scope |
|---|---|
| v2.1 | Add Drip + Customer.io to ESP registry once connectors land |
| v2.2 | Add WooCommerce concrete entry alongside R31 §4 |
| v2.3 | Add Magento concrete entry alongside R31 §5 |
| v2.4 | Add BigCommerce concrete entry alongside R31 §6 |
| v2.5 | Multi-region AI provider support |
| v2.6 | Streaming text generation support |
| v2.7+ | Future category introductions per §10 Extension Clause (payments, analytics, CRM, ads, SMS, etc., as they're prioritized) |
| v3.0 | Major: breaking change to capability identifiers, registry interface, or credential model |

### 17.5 V1 → V2 changelog

| Aspect | v1 → v2 change |
|---|---|
| Header | YAML frontmatter with ZCBR PASSED + supersession + revision marker |
| Scope | Expanded from ESP-only to unified Plugin Registry covering ESP + AI + e-commerce + future categories |
| ESP content | Preserved nearly verbatim; Brevo added as 9th placeholder |
| AI providers | New: capability-driven, tier-based, fallback chains, refactor path for 9 hardcoded files |
| **E-commerce platforms** | **New: full-detail parity with ESP and AI** — registry shape locked, capabilities locked, credential storage locked, refactor path for Shopify-only → multi-platform agnostic, failure modes / edge cases / tests covered. **Per-platform extraction logic stays in R31; agnostic-registry contract lives here.** |
| Credential management | New: unified vault path across all categories |
| Provider pricing | New: AI cost attribution via `token_usage_logs` + `provider_pricing_registry` |
| Refactor path | New: 11-Bullet sequence (B-XC.01-A through B-XC.01-K) covering AI + e-commerce; `ai_provider_models` slot generalized to `category_registry` per §3.6 |
| **Lock 19 Extension Clause** | **New §10 — Provider Agnosticism applies to every category, current AND future. Self-extending. PO Hard Rule 2026-05-12.** |
| Lock 8 contract | Programmatic registry calls must not write `token_usage_logs`; CI grep |
| Observability | New: OTel + PostHog + Sentry contracts for all registry executes; category coverage map dashboard |
| Failure / Edge / Tests | New: ZCBR-grade per-category + cross-category |
| Mechanical acceptance | 22 binary criteria (up from 16; added e-commerce parity + Extension Clause locks) |
| Locks & Decisions | Lock 19 Extension Clause; PO Hard Rule 2026-05-12 |

---

## 18. Open Items NOT Closed by R29 v2

1. **`category_registry` table concrete DDL** — slot reserved §3.6; lands in B-XC.01-B
2. **WooCommerce, Magento, BigCommerce concrete `EcommerceRegistryEntry` rows** — land alongside R31 platform-specific minor versions
3. **Brevo (8th ESP) operational validation** — best-effort in §4.4 pending B-2.10 test
4. **Multi-region AI gateways** — v2.5
5. **Streaming text generation** — v2.6
6. **BYO AI keys operational UI** — Phase 2+
7. **Provider concurrency limits (distributed)** — Redis-based future
8. **Atlas Cloud + fal.ai + Kie.ai catalog** — OD-003 open
9. **Specific AI model names** — intentionally NOT in this spec (Lock 19); live in `category_registry`
10. **Webhook subscription management per platform** — basic catalog in §6.4; operational in R31
11. **Stripe absorption into registry** — post-Phase 1 (T9 currently direct)
12. **DSPy framework choice + module specs** — DSPY-1 LATER appendix
13. **Future category introductions** — per §10; each future category (payments-beyond-Stripe, analytics, CRM, ads, SMS, CDP, CMS, PIM, feedback, etc.) lands as R29 minor version when prioritized
14. **`connection_health_check` polling cadence** — operational tuning; default 5min, configurable per category
15. **Squarespace Commerce, Wix, custom platform** entries — pattern locked, concrete entries when prioritized

---

## 19. Document Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion VIYO Decision Log.

**Version triggers:**
- Major (v3): Breaking change to capability IDs, registry interface, or credential model
- Minor (v2.x): New providers within existing categories; new categories per §10; new failure modes from operational learning
- Patch (v2.x.y): Citation updates, typos, individual provider metadata adjustments

**Re-validation:** Every 180 days per `zcbr-spec-validation` HEADER_STALE rule, or immediately after any ZCBR_STANDARD update.

---

*End of R29 Platform Abstraction Layer v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation (revision 2: e-commerce full-detail parity + Lock 19 Extension Clause per PO Hard Rule 2026-05-12)*
