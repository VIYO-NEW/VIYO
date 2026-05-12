---
**STATUS: SUPERSEDED (ESP content preserved as normative input to R29 v2)**

This document is superseded by R29 v2 at `/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation, merged via PR #25 at commit `d0538ae266abc4842dce24161530406f78cd57a2`).

The ESP abstraction content in this v1 file — VIYO-UTL (Universal Tag Language) tag schema, the 8-ESP Connector Registry (Klaviyo, ActiveCampaign, Mailchimp, Braze, HubSpot, Omnisend, SendGrid), the per-ESP tag maps, footer compliance rules, and conditional syntax patterns — is preserved as normative input to R29 v2 §4. The Brevo entry was added as a 9th ESP placeholder in v2 pending operational validation.

R29 v2 expands scope beyond v1's ESP-only focus into a **unified Plugin Registry** per D55 and the PO Hard Rule of 2026-05-12 (Lock 19 Extension Clause — full-category agnosticism), covering three integration categories at full-detail parity:
- **ESP** (full detail, preserved from v1) — R29 v2 §4
- **AI Providers** (new content, fulfilling Lock 19 + D55) — R29 v2 §5
- **E-commerce Platforms** (full-detail parity — Shopify + WooCommerce + Magento + BigCommerce + Squarespace + Wix + custom; operational depth in R31) — R29 v2 §6

R29 v2 also documents the Lock 19 Extension Clause (§10) which makes Provider Agnosticism self-extending across all future integration categories (payments-beyond-Stripe, analytics, CRM, ad platforms, SMS, CDP, CMS, PIM, feedback, etc.). R29 v2 specifies the 11-Bullet refactor sequence (B-XC.01-A through B-XC.01-K) that removes the 9-file hardcoded AI model literal surface and the Shopify-only e-commerce coupling, completing the Lock 19 contract that R24 v2 §3 forward-referenced.

All R-specs and Bullet directives that cite "R29" MUST be interpreted as citing R29 v2 going forward.

This v1 file is retained as historical reference and as the source of the original ESP abstraction articulation. For canonical contracts (unified Plugin Registry, AI provider abstraction, e-commerce platform abstraction, refactor path, capability identifiers, credential management, Lock 19 Extension Clause), see R29 v2.

Do NOT update this v1 file. Future ESP additions or registry expansions produce R29 minor or major versions, not edits to this file.

**Superseded by:** D55 (R29 PAL Option C — unified Plugin Registry) → PO Hard Rule 2026-05-12 (Lock 19 Extension Clause — full-category agnosticism) → D66 (B-1.00 ratified) → R29 v2 authoring (2026-05-12) → PR #25 merge
**Superseded date:** 2026-05-12
---

# R29 — Platform Abstraction Layer Enterprise Architecture

## 1. Executive Summary

The VIYO Platform Abstraction Layer (PAL) is the foundational architecture that makes VIYO truly platform-agnostic. Rather than hardcoding syntax for specific Email Service Providers (ESPs) like Klaviyo or E-commerce platforms like Shopify, VIYO operates entirely on an internal universal data model called VIYO-UTL (Universal Tag Language). The PAL acts as a bidirectional translation engine: when a brand connects their stack, the PAL auto-provisions webhooks, normalizes incoming e-commerce data into VIYO's schema, and at compile time translates VIYO-UTL tags into the exact syntax required by the brand's specific ESP. This ensures VIYO can serve any brand on any stack without core code changes.

## 2. VIYO Universal Tag Language (VIYO-UTL)

All Composable Sections (R27) and LLM prompts use VIYO-UTL exclusively. The system never uses `{{ first_name }}` (Klaviyo) or `%FIRSTNAME%` (ActiveCampaign) internally. Translation to ESP-native syntax occurs only at the final export boundary.

### 2.1 Core Tag Schema Implementation

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

### 2.2 Tag Validation Zod Schema

```typescript
import { z } from 'zod';

export const ViyoUtlTagSchema = z.string().regex(
  /^\{\{(#each |\/)?viyo\.[a-z][a-z0-9_.]*\}\}$/,
  'Must be a valid VIYO-UTL tag: {{viyo.domain.field}} or {{#each viyo.domain.field}} or {{/each}}'
);

export const ViyoUtlAuditSchema = z.object({
  tags_found: z.array(ViyoUtlTagSchema),
  esp_leaks: z.array(z.object({
    line: z.number(),
    content: z.string(),
    detected_esp: z.string()
  })),
  is_clean: z.boolean()
});
```

## 3. ESP Connector Registry — Data-Driven Architecture

Rather than implementing 8 separate connector classes with duplicated method signatures, the PAL uses a data-driven registry. Each ESP is defined as a configuration record in the `ESP_REGISTRY` map. A single generic `DataDrivenConnector` class reads these records and performs translation, footer validation, and compliance checks.

### 3.1 Registry Entry Interface and Full Map

```typescript
export interface EspTagMap {
  'viyo.contact.first_name': string;
  'viyo.contact.last_name': string;
  'viyo.contact.email': string;
  'viyo.event.order_id': string;
  'viyo.event.cart_url': string;
  'viyo.event.value': string;
  'viyo.event.items_loop_start': string;
  'viyo.event.items_loop_end': string;
  'viyo.item.title': string;
  'viyo.item.price': string;
  'viyo.item.image_url': string;
  'viyo.org.name': string;
  'viyo.org.address': string;
  'viyo.org.unsubscribe_url': string;
  'viyo.link.web_view': string;
}

export interface EspRegistryEntry {
  id: string;
  name: string;
  tagMap: Partial<EspTagMap>;
  requiredFooterTags: string[];
  conditionalSyntax: { if: string; else: string; endif: string };
  notes: string;
}
```

The full registry map covers all 8 supported ESPs. Each entry contains the complete tag translation map, required footer tags for compliance validation, conditional syntax patterns, and implementation notes about platform-specific limitations.

```typescript
export const ESP_REGISTRY: Record<string, EspRegistryEntry> = {
  klaviyo: {
    id: 'klaviyo', name: 'Klaviyo',
    tagMap: {
      'viyo.contact.first_name': "{{ first_name|default:'' }}", 'viyo.contact.last_name': "{{ last_name|default:'' }}",
      'viyo.contact.email': "{{ email }}", 'viyo.event.order_id': "{{ event.order_id }}",
      'viyo.event.cart_url': "{{ event.extra.checkout_url }}", 'viyo.event.value': "{{ event|lookup:'$value' }}",
      'viyo.event.items_loop_start': "{%% for item in event.Items %%}", 'viyo.event.items_loop_end': "{%% endfor %%}",
      'viyo.item.title': "{{ item.product_title }}", 'viyo.item.price': "{%% currency_format item.price %%}",
      'viyo.item.image_url': "{{ item.image_url }}", 'viyo.org.name': "{{ organization.name }}",
      'viyo.org.address': "{{ organization.full_address }}", 'viyo.org.unsubscribe_url': "{%% unsubscribe_link %%}",
      'viyo.link.web_view': "{%% web_view_link %%}"
    },
    requiredFooterTags: ['{%% unsubscribe_link %%}', '{{ organization.full_address }}'],
    conditionalSyntax: { if: '{%% if $COND %%}', else: '{%% else %%}', endif: '{%% endif %%}' },
    notes: 'Klaviyo uses Django/Jinja2 template syntax. Loop variable is `item`. Currency formatting via custom tag.'
  },
  activecampaign: {
    id: 'activecampaign', name: 'ActiveCampaign',
    tagMap: {
      'viyo.contact.first_name': "%%FIRSTNAME%%", 'viyo.contact.last_name': "%%LASTNAME%%",
      'viyo.contact.email': "%%EMAIL%%", 'viyo.event.order_id': "%%EVENT_ORDER_ID%%",
      'viyo.org.name': "%%ORGANIZATION%%", 'viyo.org.address': "%%SENDER-INFO-SINGLELINE%%",
      'viyo.org.unsubscribe_url': "%%UNSUBSCRIBELINK%%", 'viyo.link.web_view': "%%WEBCOPY%%"
    },
    requiredFooterTags: ['%%UNSUBSCRIBELINK%%'],
    conditionalSyntax: { if: '%%IF $COND%%', else: '%%ELSE%%', endif: '%%ENDIF%%' },
    notes: 'AC does not support native loops in standard campaigns. Product grids must be pre-rendered as static HTML.'
  },
  mailchimp: {
    id: 'mailchimp', name: 'Mailchimp',
    tagMap: {
      'viyo.contact.first_name': "*|FNAME|*", 'viyo.contact.last_name': "*|LNAME|*",
      'viyo.contact.email': "*|EMAIL|*", 'viyo.org.name': "*|LIST:COMPANY|*",
      'viyo.org.address': "*|HTML:LIST_ADDRESS_HTML|*", 'viyo.org.unsubscribe_url': "*|UNSUB|*",
      'viyo.link.web_view': "*|ARCHIVE|*"
    },
    requiredFooterTags: ['*|UNSUB|*'],
    conditionalSyntax: { if: '*|IF:$COND|*', else: '*|ELSE:|*', endif: '*|END:IF|*' },
    notes: 'Mailchimp merge tags use pipe-asterisk delimiters. Limited loop support via RSS-to-email only.'
  },
  braze: {
    id: 'braze', name: 'Braze',
    tagMap: {
      'viyo.contact.first_name': '{{${first_name}}}', 'viyo.contact.last_name': '{{${last_name}}}',
      'viyo.contact.email': '{{${email_address}}}', 'viyo.org.unsubscribe_url': '{{${set_user_to_unsubscribed_url}}}'
    },
    requiredFooterTags: ['{{${set_user_to_unsubscribed_url}}}'],
    conditionalSyntax: { if: '{%% if ${$COND} %%}', else: '{%% else %%}', endif: '{%% endif %%}' },
    notes: 'Braze uses Liquid with ${} attribute references. Address must be hardcoded or use custom attribute.'
  },
  hubspot: {
    id: 'hubspot', name: 'HubSpot',
    tagMap: {
      'viyo.contact.first_name': "{{ contact.firstname }}", 'viyo.contact.last_name': "{{ contact.lastname }}",
      'viyo.contact.email': "{{ contact.email }}", 'viyo.org.unsubscribe_url': "{{ unsubscribe_link }}",
      'viyo.link.web_view': "{{ view_as_page_url }}"
    },
    requiredFooterTags: ['{{ unsubscribe_link }}'],
    conditionalSyntax: { if: '{%% if $COND %%}', else: '{%% else %%}', endif: '{%% endif %%}' },
    notes: 'HubSpot uses HubL (Jinja-like). Contact properties accessed via contact.property_name.'
  },
  omnisend: {
    id: 'omnisend', name: 'Omnisend',
    tagMap: {
      'viyo.contact.first_name': "[[contact.first_name]]", 'viyo.contact.email': "[[contact.email]]",
      'viyo.org.unsubscribe_url': "[[unsubscribe_url]]"
    },
    requiredFooterTags: ['[[unsubscribe_url]]'],
    conditionalSyntax: { if: '[[IF $COND]]', else: '[[ELSE]]', endif: '[[ENDIF]]' },
    notes: 'Omnisend uses double-bracket syntax. Limited event-driven personalization.'
  },
  sendgrid: {
    id: 'sendgrid', name: 'SendGrid',
    tagMap: {
      'viyo.contact.first_name': "{{first_name}}", 'viyo.contact.email': "{{email}}",
      'viyo.org.unsubscribe_url': "{{{unsubscribe}}}"
    },
    requiredFooterTags: ['{{{unsubscribe}}}'],
    conditionalSyntax: { if: '{{#if $COND}}', else: '{{else}}', endif: '{{/if}}' },
    notes: 'SendGrid uses Handlebars. Triple-brace for unescaped HTML (unsubscribe URL).'
  },
  drip: {
    id: 'drip', name: 'Drip',
    tagMap: {
      'viyo.contact.first_name': "{{ subscriber.first_name }}", 'viyo.contact.email': "{{ subscriber.email }}",
      'viyo.org.unsubscribe_url': "{{ unsubscribe_url }}"
    },
    requiredFooterTags: ['{{ unsubscribe_url }}'],
    conditionalSyntax: { if: '{%% if $COND %%}', else: '{%% else %%}', endif: '{%% endif %%}' },
    notes: 'Drip uses Liquid syntax. Subscriber object is the primary data source.'
  }
};
```

### 3.2 The Generic DataDrivenConnector

```typescript
export class DataDrivenConnector {
  private entry: EspRegistryEntry;

  constructor(espId: string) {
    this.entry = ESP_REGISTRY[espId];
    if (!this.entry) throw new Error(`Unsupported ESP: ${espId}. Available: ${Object.keys(ESP_REGISTRY).join(', ')}`);
  }

  /** Translate a single VIYO-UTL tag to ESP-native syntax */
  translateTag(viyoTag: string): string {
    const inner = viyoTag.replace(/^\{\{(#each )?/, '').replace(/\}\}$/, '');
    if (viyoTag.startsWith('{{#each')) return this.entry.tagMap['viyo.event.items_loop_start'] || viyoTag;
    if (viyoTag === '{{/each}}') return this.entry.tagMap['viyo.event.items_loop_end'] || viyoTag;
    return this.entry.tagMap[inner as keyof EspTagMap] || viyoTag;
  }

  /** Validate that required footer elements are present in translated HTML */
  validateCompliance(html: string): { isValid: boolean; missing: string[] } {
    const missing = this.entry.requiredFooterTags.filter(tag => !html.includes(tag));
    return { isValid: missing.length === 0, missing };
  }

  /** Get the ESP's conditional syntax for dynamic content blocks */
  getConditionalSyntax(): EspRegistryEntry['conditionalSyntax'] {
    return this.entry.conditionalSyntax;
  }

  /** Get human-readable notes about this ESP's limitations */
  getNotes(): string {
    return this.entry.notes;
  }
}
```

## 4. The Translation Engine — Compiler Step

The Translation Engine is invoked by the MJML Compiler (R27) as the final step before HTML output. It performs a single-pass regex replacement of all VIYO-UTL tags in the compiled HTML.

```typescript
export class TagTranslationEngine {
  private connector: DataDrivenConnector;

  constructor(espId: string) {
    this.connector = new DataDrivenConnector(espId);
  }

  /**
   * Translates all VIYO-UTL tags in the HTML to ESP-native syntax.
   * Called after MJML compilation, before final HTML delivery.
   */
  public translateHtml(html: string): string {
    const viyoTagRegex = /\{\{(#each |\/)?viyo\.[a-zA-Z0-9_.]+\}\}|\{\{\/each\}\}/g;
    return html.replace(viyoTagRegex, (match) => this.connector.translateTag(match));
  }

  /**
   * Validates the translated HTML contains all required ESP footer elements.
   * Returns actionable error messages if compliance checks fail.
   */
  public validate(translatedHtml: string): { isValid: boolean; missing: string[] } {
    return this.connector.validateCompliance(translatedHtml);
  }

  /**
   * Full pipeline: translate then validate. Used in the email export endpoint.
   */
  public compileForEsp(viyoHtml: string): { html: string; validation: { isValid: boolean; missing: string[] } } {
    const html = this.translateHtml(viyoHtml);
    const validation = this.validate(html);
    return { html, validation };
  }
}
```

### 4.1 Integration with R27 MJML Compiler

The Translation Engine is wired into the email export API endpoint. The flow is: Composable Sections (VIYO-UTL) -> MJML Compiler -> Translation Engine -> ESP-native HTML.

```typescript
// POST /api/email/export — Hono API route on Render
import { Hono } from 'hono';
import mjml2html from 'mjml';

const app = new Hono();

app.post('/api/email/export', async (c) => {
  const { sections, brandId, espId } = await c.req.json();

  // Step 1: Compile sections into MJML (R27)
  const mjmlString = compileSectionsToMjml(sections);

  // Step 2: MJML -> HTML
  const { html: rawHtml, errors } = mjml2html(mjmlString, { validationLevel: 'strict' });
  if (errors.length > 0) {
    return c.json({ error: 'MJML compilation failed', details: errors }, 400);
  }

  // Step 3: Translate VIYO-UTL -> ESP-native (R29)
  const engine = new TagTranslationEngine(espId);
  const { html: finalHtml, validation } = engine.compileForEsp(rawHtml);

  if (!validation.isValid) {
    return c.json({
      error: 'ESP compliance check failed',
      missing: validation.missing,
      esp: espId
    }, 422);
  }

  return c.json({ html: finalHtml, esp: espId, status: 'ready' });
});
```

## 5. E-commerce Data Model Normalizer

VIYO normalizes all incoming product data from Shopify, WooCommerce, BigCommerce, and Magento into the `ViyoProduct` schema before any Brain or template interacts with it.

### 5.1 Universal Product Schema

```typescript
import { z } from 'zod';

export const ViyoProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  handle: z.string(),
  description_html: z.string(),
  price: z.number().nonnegative().describe('Normalized to float, e.g. 21.99'),
  compare_at_price: z.number().nullable(),
  currency: z.string().length(3).default('USD'),
  on_sale: z.boolean(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), is_primary: z.boolean() })),
  product_type: z.string(),
  vendor: z.string(),
  tags: z.array(z.string()),
  available: z.boolean(),
  inventory_quantity: z.number().int(),
  source_platform: z.enum(['shopify', 'woocommerce', 'bigcommerce', 'magento', 'custom']),
  raw_data: z.record(z.any()).describe('Original unmutated platform response for debugging')
});

export type ViyoProduct = z.infer<typeof ViyoProductSchema>;
```

### 5.2 Platform Normalizer Map

Each normalizer is a pure function that maps a platform-specific product object to the `ViyoProduct` schema. The normalizer selection is driven by the `source_platform` field stored in the brand's configuration. All four supported e-commerce platforms are covered.

```typescript
type NormalizerFn = (raw: any) => ViyoProduct;

export const PLATFORM_NORMALIZERS: Record<string, NormalizerFn> = {
  shopify: (p) => ({
    id: String(p.id), title: p.title, handle: p.handle, description_html: p.body_html || '',
    price: parseFloat(p.variants?.[0]?.price || '0'),
    compare_at_price: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null,
    currency: 'USD',
    on_sale: p.variants?.[0]?.compare_at_price != null && parseFloat(p.variants[0].compare_at_price) > parseFloat(p.variants[0].price),
    images: (p.images || []).map((img: any, i: number) => ({ url: img.src, alt: img.alt || '', is_primary: i === 0 })),
    product_type: p.product_type || '', vendor: p.vendor || '',
    tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
    available: p.status === 'active',
    inventory_quantity: (p.variants || []).reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0),
    source_platform: 'shopify', raw_data: p
  }),
  woocommerce: (p) => ({
    id: String(p.id), title: p.name, handle: p.slug, description_html: p.description || '',
    price: parseFloat(p.price || '0'),
    compare_at_price: p.regular_price && p.on_sale ? parseFloat(p.regular_price) : null,
    currency: 'USD', on_sale: p.on_sale === true,
    images: (p.images || []).map((img: any, i: number) => ({ url: img.src, alt: img.alt || '', is_primary: i === 0 })),
    product_type: p.type || '', vendor: p.brands?.[0]?.name || '',
    tags: (p.tags || []).map((t: any) => t.name),
    available: p.status === 'publish' && p.stock_status === 'instock',
    inventory_quantity: p.stock_quantity || 0, source_platform: 'woocommerce', raw_data: p
  }),
  bigcommerce: (p) => ({
    id: String(p.id), title: p.name, handle: p.custom_url?.url?.replace(/\//g, '') || '',
    description_html: p.description || '', price: p.price || 0,
    compare_at_price: p.retail_price && p.retail_price > p.price ? p.retail_price : null,
    currency: 'USD', on_sale: p.sale_price != null && p.sale_price < p.price,
    images: (p.images || []).map((img: any) => ({ url: img.url_zoom || img.url_standard, alt: img.description || '', is_primary: img.is_thumbnail })),
    product_type: p.type || 'physical', vendor: p.brand_id ? `brand_${p.brand_id}` : '', tags: [],
    available: p.availability === 'available' && p.inventory_level > 0,
    inventory_quantity: p.inventory_level || 0, source_platform: 'bigcommerce', raw_data: p
  }),
  magento: (p) => ({
    id: String(p.id), title: p.name,
    handle: p.custom_attributes?.find((a: any) => a.attribute_code === 'url_key')?.value || '',
    description_html: p.custom_attributes?.find((a: any) => a.attribute_code === 'description')?.value || '',
    price: p.price || 0,
    compare_at_price: p.custom_attributes?.find((a: any) => a.attribute_code === 'special_price')?.value ? p.price : null,
    currency: 'USD',
    on_sale: p.custom_attributes?.find((a: any) => a.attribute_code === 'special_price') != null,
    images: (p.media_gallery_entries || []).map((img: any) => ({ url: `${p._media_base_url}${img.file}`, alt: img.label || '', is_primary: img.position === 1 })),
    product_type: p.type_id || '', vendor: '', tags: [],
    available: p.status === 1 && (p.extension_attributes?.stock_item?.is_in_stock ?? false),
    inventory_quantity: p.extension_attributes?.stock_item?.qty || 0, source_platform: 'magento', raw_data: p
  })
};

/** Normalize any platform product to ViyoProduct with Zod validation */
export function normalizeProduct(platform: string, rawProduct: any): ViyoProduct {
  const normalizer = PLATFORM_NORMALIZERS[platform];
  if (!normalizer) throw new Error(`No normalizer for platform: ${platform}`);
  return ViyoProductSchema.parse(normalizer(rawProduct));
}
```

## 6. Auto-Provisioning Engine

When a brand connects their e-commerce and ESP platforms via the Admin Config panel, the PAL triggers an Inngest function that provisions webhooks, syncs historical data, and validates the connection.

```typescript
import { inngest } from './client';

export const provisionBrandStack = inngest.createFunction(
  { id: 'pal/provision-brand-stack', retries: 3 },
  { event: 'brand.stack.connected' },
  async ({ event, step }) => {
    const { brandId, espId, ecommerceId, credentials } = event.data;

    const webhookResults = await step.run('provision-ecommerce-webhooks', async () => {
      if (ecommerceId === 'shopify') {
        const client = new ShopifyApiClient(credentials.shopify);
        const topics = ['products/create', 'products/update', 'products/delete', 'orders/create', 'orders/paid', 'carts/create', 'carts/update'];
        const results = await Promise.allSettled(
          topics.map(topic => client.registerWebhook(topic, `https://api.viyo.app/webhooks/shopify/${topic.replace('/', '-')}`))
        );
        return { platform: 'shopify', registered: results.filter(r => r.status === 'fulfilled').length, total: topics.length };
      }
      if (ecommerceId === 'woocommerce') {
        const client = new WooCommerceApiClient(credentials.woocommerce);
        const topics = ['product.created', 'product.updated', 'order.created'];
        const results = await Promise.allSettled(
          topics.map(topic => client.registerWebhook(topic, `https://api.viyo.app/webhooks/woo/${topic.replace('.', '-')}`))
        );
        return { platform: 'woocommerce', registered: results.filter(r => r.status === 'fulfilled').length, total: topics.length };
      }
      return { platform: ecommerceId, registered: 0, total: 0 };
    });

    const espValidation = await step.run('validate-esp-connection', async () => {
      if (espId === 'klaviyo') {
        const resp = await fetch('https://a.klaviyo.com/api/accounts/', {
          headers: { 'Authorization': `Klaviyo-API-Key ${credentials.esp_api_key}`, 'revision': '2024-02-15' }
        });
        return { valid: resp.ok, esp: espId };
      }
      return { valid: true, esp: espId };
    });

    await step.run('sync-historical-products', async () => {
      await inngest.send({ name: 'viyo/data.sync.products', data: { brandId, ecommerceId, credentials } });
    });

    await step.run('record-provisioning-result', async () => {
      const { supabase } = await import('./supabase');
      await supabase.from('brand_integrations').upsert({
        brand_id: brandId, esp_id: espId, ecommerce_id: ecommerceId,
        webhooks_registered: webhookResults.registered, webhooks_total: webhookResults.total,
        esp_valid: espValidation.valid, provisioned_at: new Date().toISOString()
      });
    });
  }
);
```

## 7. Admin Config Panel Integration

The PAL is managed via the VIYO Admin Config panel at `/admin/settings/platforms`. When a new integration is added, the config entry is automatically wired into the panel so API keys can be pasted directly without code changes.

### 7.1 Platform Connection UI Implementation

```tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const IntegrationSchema = z.object({
  ecommerce_platform: z.enum(['shopify', 'woocommerce', 'bigcommerce', 'magento']),
  ecommerce_api_key: z.string().min(10, 'API Key is required'),
  ecommerce_store_url: z.string().url().optional(),
  esp_platform: z.enum(['klaviyo', 'activecampaign', 'mailchimp', 'braze', 'hubspot', 'omnisend', 'sendgrid', 'drip']),
  esp_api_key: z.string().min(10, 'API Key is required')
});

export function IntegrationsPanel({ brandId }: { brandId: string }) {
  const [isTesting, setIsTesting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof IntegrationSchema>>({
    resolver: zodResolver(IntegrationSchema)
  });

  const onSubmit = async (data: z.infer<typeof IntegrationSchema>) => {
    setIsTesting(true);
    try {
      // 1. Save credentials securely to Supabase Vault
      await supabase.rpc('store_brand_credentials', { 
        p_brand_id: brandId, 
        p_ecommerce_key: data.ecommerce_api_key,
        p_esp_key: data.esp_api_key
      });

      // 2. Trigger PAL Auto-Provisioning Engine (Inngest)
      await fetch('/api/admin/provision-stack', {
        method: 'POST',
        body: JSON.stringify({ brandId, ...data })
      });
      
      alert('Integration saved and auto-provisioning started.');
    } catch (err) {
      alert('Failed to provision stack.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold">E-commerce & ESP Integrations</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">E-commerce Platform</label>
          <select {...register('ecommerce_platform')} className="mt-1 block w-full rounded-md border-gray-300">
            <option value="shopify">Shopify</option>
            <option value="woocommerce">WooCommerce</option>
            <option value="bigcommerce">BigCommerce</option>
            <option value="magento">Magento</option>
          </select>
          {errors.ecommerce_platform && <p className="text-red-500 text-xs mt-1">{errors.ecommerce_platform.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">E-commerce API Key / Access Token</label>
          <input type="password" {...register('ecommerce_api_key')} className="mt-1 block w-full rounded-md border-gray-300" />
          {errors.ecommerce_api_key && <p className="text-red-500 text-xs mt-1">{errors.ecommerce_api_key.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Service Provider (ESP)</label>
          <select {...register('esp_platform')} className="mt-1 block w-full rounded-md border-gray-300">
            <option value="klaviyo">Klaviyo</option>
            <option value="activecampaign">ActiveCampaign</option>
            <option value="mailchimp">Mailchimp</option>
            <option value="braze">Braze</option>
          </select>
          {errors.esp_platform && <p className="text-red-500 text-xs mt-1">{errors.esp_platform.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">ESP API Key</label>
          <input type="password" {...register('esp_api_key')} className="mt-1 block w-full rounded-md border-gray-300" />
          {errors.esp_api_key && <p className="text-red-500 text-xs mt-1">{errors.esp_api_key.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" className="px-4 py-2 border rounded-md text-gray-700">Test Connections</button>
        <button type="submit" disabled={isTesting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {isTesting ? 'Provisioning...' : 'Save & Provision'}
        </button>
      </div>
    </form>
  );
}
```

## 8. Cross-Spec Dependency Map Implementation

```typescript
export const PAL_DEPENDENCY_REGISTRY = {
  consumes: [
    { spec: 'R27', component: 'ComposableSections', description: 'PAL translates the VIYO-UTL tags inside compiled MJML sections' },
    { spec: 'R31', component: 'ProductDataExtraction', description: 'PAL normalizes the raw scraped product data into ViyoProduct schema' }
  ],
  provides: [
    { spec: 'R19', component: 'EmailDesignBrain', description: 'Provides the VIYO-UTL schema for LLM generation prompts' },
    { spec: 'R28', component: 'TimerService', description: 'Provides the ESP conditional syntax for dynamic timer fallbacks' },
    { spec: 'R23', component: 'CostReconciliation', description: 'Emits webhook registration metrics for billing reconciliation' }
  ]
} as const;
```

## 9. Build Tracker Implementation

```typescript
export const PAL_BUILD_TRACKER = [
  { id: 'PAL-01', name: 'VIYO-UTL Core Tag Schema + Zod Validation', version: 'V1', phase: 1, dependencies: [] },
  { id: 'PAL-02', name: 'ESP Registry Map (8 platforms, data-driven)', version: 'V1', phase: 1, dependencies: ['PAL-01'] },
  { id: 'PAL-03', name: 'DataDrivenConnector + Translation Engine', version: 'V1', phase: 1, dependencies: ['PAL-02'] },
  { id: 'PAL-04', name: 'E-commerce Normalizers (Shopify, Woo, BC, Magento)', version: 'V1', phase: 1, dependencies: [] },
  { id: 'PAL-05', name: 'Auto-Provisioning Engine (Inngest)', version: 'V1', phase: 2, dependencies: ['PAL-02', 'PAL-04'] },
  { id: 'PAL-06', name: 'Admin Config Panel Integration', version: 'V1', phase: 2, dependencies: ['PAL-05'] }
] as const;
```
