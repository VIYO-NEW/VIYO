# R31 — Product Data Extraction Pipeline Enterprise Architecture

## 1. Executive Summary

The Product Data Extraction Pipeline (PDEP) is the intelligence gathering engine of VIYO. To generate highly personalized, educational email campaigns, the Council of Brains requires deep product knowledge: ingredients, benefits, "how to use" instructions, certifications, and brand assets. The PDEP automates the acquisition of this knowledge. It scrapes a brand's product pages, uses LLMs to semantically parse unstructured HTML into structured data, extracts high-resolution assets (like SVG badges and transparent PNGs), and normalizes everything into the Universal E-commerce Data Model (R29). This ensures VIYO has the necessary context to write compelling copy without requiring manual data entry from the brand.

## 2. Core Architecture

The extraction pipeline is an asynchronous, distributed system built on Inngest, utilizing headless browsers (Puppeteer/Playwright via browserless.io) to bypass bot protection and render JavaScript-heavy SPA storefronts.

### 2.1 The Extraction Flow

1. **Trigger:** Initiated when a new product URL is detected (via E-commerce webhook) or manually entered by a user.
2. **Page Rendering:** A headless browser renders the full page, executing all client-side React/Vue code to ensure lazy-loaded data (like reviews or accordions) is present in the DOM.
3. **Structured Extraction (Cheerio):** Fast, deterministic extraction of JSON-LD Schema.org data and Open Graph meta tags.
4. **Semantic Extraction (LLM):** The cleaned `<body>` text is passed to an LLM (Gemini 1.5 Flash) to extract unstructured marketing copy (benefits, ingredients, instructions).
5. **Asset Discovery:** DOM traversal to locate and download SVGs, WebP, and PNG assets (icons, badges, lifestyle images).
6. **Normalization:** All findings are mapped into the `ViyoProduct` and `ViyoProductKnowledge` schemas.
7. **Storage:** Data is persisted to Supabase; assets are uploaded to Cloudflare R2 / AWS S3.

## 3. Data Schemas

The pipeline outputs data into two primary schemas: the core product data (for the catalog) and the knowledge data (for the LLM Brains).

### 3.1 Product Knowledge Schema

```typescript
import { z } from 'zod';

export const ViyoProductKnowledgeSchema = z.object({
  product_id: z.string(),
  ingredients: z.array(z.string()).describe('List of individual ingredients'),
  key_benefits: z.array(z.string()).max(5).describe('Short, punchy benefit statements'),
  how_to_use: z.string().nullable().describe('Step-by-step usage instructions'),
  certifications: z.array(z.string()).describe('e.g., Vegan, Cruelty-Free, USDA Organic'),
  target_audience: z.string().nullable().describe('Who this product is for, based on copy'),
  tone_of_voice: z.string().describe('The brand tone detected on the page (e.g., Clinical, Playful)'),
  raw_extracted_text: z.string().describe('The cleaned text used for extraction, saved for debugging')
});

export type ViyoProductKnowledge = z.infer<typeof ViyoProductKnowledgeSchema>;
```

### 3.2 Discovered Asset Schema

```typescript
export const DiscoveredAssetSchema = z.object({
  source_url: z.string().url(),
  asset_type: z.enum(['product_image', 'lifestyle_image', 'badge_icon', 'brand_logo']),
  format: z.enum(['svg', 'png', 'webp', 'jpg']),
  alt_text: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  is_transparent: z.boolean()
});

export type DiscoveredAsset = z.infer<typeof DiscoveredAssetSchema>;
```

## 4. Implementation: The Inngest Pipeline

The core orchestration is handled by an Inngest function, which ensures retries, step-level observability, and timeout management.

```typescript
import { inngest } from './client';
import * as cheerio from 'cheerio';
import { extractSemanticData } from './services/llm-parser';
import { renderPage } from './services/browserless';
import { supabase } from './supabase';
import { ViyoProductKnowledgeSchema, DiscoveredAssetSchema } from './schemas';

export const scrapeProductPage = inngest.createFunction(
  { id: 'pdep/scrape-product', retries: 3 },
  { event: 'product.scrape.requested' },
  async ({ event, step }) => {
    const { url, productId, brandId } = event.data;

    // Step 1: Headless Browser Render
    const { html, status } = await step.run('render-page', async () => {
      return await renderPage(url);
    });

    if (status !== 200) throw new Error(`Failed to render page: HTTP ${status}`);

    // Step 2: Deterministic DOM Parsing (Structured Data & Assets)
    const { jsonLd, cleanText, rawAssets } = await step.run('parse-dom', async () => {
      const $ = cheerio.load(html);
      
      // Extract JSON-LD
      const jsonLdScripts = $('script[type="application/ld+json"]').map((_, el) => $(el).html()).get();
      const jsonLd = jsonLdScripts.map(script => {
        try { return JSON.parse(script); } catch (e) { return null; }
      }).filter(Boolean);

      // Extract and filter image assets
      const rawAssets = $('img, svg').map((_, el) => ({
        src: $(el).attr('src') || $(el).attr('data-src'),
        alt: $(el).attr('alt') || '',
        tagName: el.tagName.toLowerCase()
      })).get().filter(a => a.src && !a.src.includes('data:image'));

      // Clean text for LLM (remove scripts, styles, nav, footer)
      $('script, style, nav, footer, header, noscript, iframe').remove();
      const cleanText = $('body').text().replace(/\s+/g, ' ').trim();

      return { jsonLd, cleanText, rawAssets };
    });

    // Step 3: Semantic Extraction via LLM
    const knowledgeData = await step.run('llm-extraction', async () => {
      const extracted = await extractSemanticData(cleanText);
      // Validate against schema before returning
      return ViyoProductKnowledgeSchema.parse({
        ...extracted,
        product_id: productId,
        raw_extracted_text: cleanText.substring(0, 10000) // Cap for DB size
      });
    });

    // Step 4: Asset Classification
    const classifiedAssets = await step.run('classify-assets', async () => {
      // Logic to determine if an asset is a badge, product shot, etc.
      // (Simplified for spec)
      return rawAssets.map(a => ({
        source_url: a.src.startsWith('//') ? `https:${a.src}` : a.src,
        asset_type: a.src.includes('badge') || a.src.includes('icon') ? 'badge_icon' : 'product_image',
        format: a.src.split('.').pop()?.split('?')[0] || 'jpg',
        alt_text: a.alt,
        width: null, height: null, is_transparent: a.src.endsWith('.svg') || a.src.endsWith('.png')
      }));
    });

    // Step 5: Persist to Database
    await step.run('save-to-db', async () => {
      await supabase.from('product_knowledge').upsert(knowledgeData);
      
      // Trigger R30 Animation Engine for primary product images
      const primaryImages = classifiedAssets.filter(a => a.asset_type === 'product_image');
      if (primaryImages.length > 0) {
        await inngest.send({ 
          name: 'product.animation.requested', 
          data: { productId, brandId, sourceImageUrl: primaryImages[0].source_url, preset: 'bounce' } 
        });
      }
    });

    return { status: 'success', knowledge: knowledgeData };
  }
);
```

## 5. Semantic Extraction Engine (LLM)

The LLM extraction step uses a structured output configuration to force the LLM to return valid JSON matching the required schema.

```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractSemanticData(cleanHtmlText: string) {
  const systemPrompt = `
    You are an expert e-commerce data extraction AI. 
    Analyze the provided product page text and extract the specific marketing and product details requested.
    If a piece of information (like certifications or how to use) is NOT present in the text, return an empty array or null. Do not hallucinate data.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Fast, cheap, excellent at JSON
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract data from this text:

${cleanHtmlText.substring(0, 30000)}` }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("LLM returned empty response");
  
  return JSON.parse(content);
}
```

## 6. Global Wiring Map (R18) & Dependencies

| Component | Dependency Direction | Description |
|-----------|----------------------|-------------|
| **R29 Platform Abstraction Layer** | R29 -> R31 | R29 normalizers trigger R31 when new products are synced from Shopify/WooCommerce. |
| **R30 Product Animation Engine** | R31 -> R30 | R31 discovers primary product images and triggers R30 to animate them. |
| **R19 LLM Architecture (Email Brain)** | R31 -> R19 | R19 consumes the `ViyoProductKnowledge` data to write accurate, educational copy. |
| **R27 Composable Sections** | R31 -> R27 | R27 templates (like `educational_ingredients`) map directly to R31 extracted fields. |

## 7. Self-Healing & Fallbacks

1. **Anti-Bot Evasion:** If the primary headless browser request fails (e.g., Cloudflare Turnstile blocks it), the system automatically retries using a premium residential proxy pool (e.g., BrightData Web Unlocker).
2. **Missing Data Fallback:** If the LLM fails to extract `ingredients` or `benefits`, the system flags the `product_knowledge` record as "incomplete". The UI (R17) displays a warning icon next to the product, prompting the user to manually input the missing data.
3. **DOM Structure Changes:** The DevOps Brain monitors the success rate of extraction per domain. If a domain's extraction success drops below 80%, it alerts the engineering team that the brand's theme structure may have fundamentally changed.

## 8. Build Tracker (PDEP-01 through PDEP-05)

| Feature ID | Name | Version | Phase | Dependencies |
|-----------|------|---------|-------|-------------|
| PDEP-01 | Product Knowledge & Asset Schemas | V1 | Phase 1 | None |
| PDEP-02 | Headless Browser Integration (Browserless) | V1 | Phase 1 | None |
| PDEP-03 | Cheerio DOM Parser & Asset Discovery | V1 | Phase 1 | PDEP-02 |
| PDEP-04 | LLM Semantic Extraction Engine | V1 | Phase 2 | PDEP-01 |
| PDEP-05 | Inngest Orchestration Pipeline | V1 | Phase 2 | PDEP-03, PDEP-04 |
