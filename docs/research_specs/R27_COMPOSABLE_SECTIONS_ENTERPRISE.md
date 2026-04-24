# R27 — Composable Sections Enterprise Spec

## 1. Executive Summary
The Composable Sections system is the structural core of VIYO's email generation. It defines 32 standardized, responsive layout blocks (sections) that can be dynamically assembled, populated with AI-generated copy and imagery, and compiled into production-ready HTML via MJML. Crucially, all dynamic variables within these sections use the VIYO Universal Tag Language (VIYO-UTL), making the output platform-agnostic before the final compilation step.

## 2. Section Registry (32 Types)

The registry defines the vocabulary the Email Design Brain uses to construct campaigns.

### 2.1 Headers & Heroes (5)
- `header_standard`: Logo center/left, optional navigation links.
- `header_utility`: Logo + "View in Browser" / "My Account" utility links.
- `hero_standard`: Full-width image, H1, subheadline, primary CTA.
- `hero_split`: 50/50 split (image left/right, text opposite).
- `hero_product_showcase`: Large product cutout overlapping a background shape/gradient.

### 2.2 E-commerce & Products (6)
- `product_grid`: 2x2 or 3x3 grid of product cards (image, title, price, CTA).
- `product_list`: Vertical list (image left, details right) for featured items.
- `product_feature_highlight`: Single product with callout pointers/icons for specific features.
- `product_comparison`: Side-by-side table comparing two products or "Us vs. Them".
- `cart_recovery`: Dynamic block showing abandoned items (`{{viyo.event.items}}`).
- `personalized_recommendations`: Dynamic block for predictive product suggestions.

### 2.3 Educational & Brand (5)
- `educational_ingredients`: Visual breakdown of key ingredients/materials.
- `benefit_icon_row`: 3 or 4-column row of icons + short benefit text (e.g., "Vegan", "Free Shipping").
- `how_to_use`: 3-step visual guide (1, 2, 3) with imagery and instructions.
- `founder_story`: Text-heavy block with founder signature and portrait.
- `brand_mission`: Statement block focusing on sustainability, ethics, or brand ethos.

### 2.4 Social Proof & UGC (4)
- `social_proof_text`: Simple quote, 5-star graphic, and customer name.
- `testimonial_with_photo`: Quote paired with a customer photo or UGC image.
- `press_mentions`: "As seen in" logo strip (e.g., Vogue, GQ, Forbes).
- `social_feed`: Grid of Instagram/TikTok style images with social handles.

### 2.5 Promotional & Urgency (4)
- `promo_badge`: Floating badge or ribbon highlighting a discount (e.g., "20% OFF").
- `countdown_timer`: Dynamic GIF timer (`viyo-timer-service` integration).
- `urgency_banner`: Thin top/bottom bar (e.g., "Sale ends in 2 hours").
- `loyalty_status`: Dynamic block showing user's current points/tier (`{{viyo.contact.loyalty_points}}`).

### 2.6 Transactional & Utility (5)
- `order_summary`: Dynamic table of purchased items and totals.
- `shipping_tracker`: Visual progress bar (Ordered → Shipped → Delivered) + tracking link.
- `account_activation`: Welcome block with secure activation link.
- `faq_accordion`: Stacked questions and answers (rendered as static blocks in email).
- `survey_poll`: 1-click feedback buttons (e.g., NPS score 1-10) linking to survey tool.

### 2.7 Structure & Footers (3)
- `spacer_divider`: Configurable whitespace or horizontal rule.
- `footer_standard`: Copyright, standard links, social icons, mandatory unsubscribe (`{{viyo.org.unsubscribe_url}}`).
- `footer_extended`: Standard footer + app download badges, secondary navigation, legal disclaimers.

## 3. Zod Schemas & Data Structures

Every section is strictly typed using Zod to ensure the Email Design Brain outputs valid configurations.

```typescript
import { z } from 'zod';

// Base schema for all sections
const BaseSectionSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  padding_top: z.number().default(20),
  padding_bottom: z.number().default(20),
});

// Example: hero_standard schema
export const HeroStandardSchema = BaseSectionSchema.extend({
  type: z.literal('hero_standard'),
  image_url: z.string().url(),
  image_alt: z.string(),
  headline: z.string().max(60),
  subheadline: z.string().max(120).optional(),
  cta_text: z.string().max(25),
  cta_url: z.string().url(),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000'),
  cta_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#0000FF'),
  cta_text_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
});

// Example: benefit_icon_row schema
export const BenefitIconRowSchema = BaseSectionSchema.extend({
  type: z.literal('benefit_icon_row'),
  benefits: z.array(z.object({
    icon_url: z.string().url(),
    title: z.string().max(30),
    description: z.string().max(80).optional()
  })).min(2).max(4),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000'),
});

// The master design output schema
export const DesignOutputSchema = z.object({
  theme: z.object({
    global_background_color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    global_background_image_url: z.string().url().optional(),
    custom_fonts: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    })).optional()
  }),
  sections: z.array(z.discriminatedUnion('type', [
    HeroStandardSchema,
    BenefitIconRowSchema,
    // ... all 32 schemas included here
  ]))
});

export type DesignOutput = z.infer<typeof DesignOutputSchema>;
```

## 4. MJML Compilation Engine

The compilation engine takes the `DesignOutput` JSON and renders it into responsive MJML, which is then compiled to HTML.

```typescript
import mjml2html from 'mjml';

export class MjmlCompiler {
  
  public compile(design: DesignOutput): string {
    const head = this.buildHead(design.theme);
    const body = this.buildBody(design);
    
    const mjml = `
      <mjml>
        ${head}
        ${body}
      </mjml>
    `;
    
    const { html, errors } = mjml2html(mjml, { validationLevel: 'strict' });
    
    if (errors.length > 0) {
      console.error('MJML Compilation Errors:', errors);
      throw new Error('Failed to compile valid HTML from design output.');
    }
    
    return html;
  }

  private buildHead(theme: any): string {
    let fonts = '';
    if (theme.custom_fonts) {
      fonts = theme.custom_fonts.map(f => `<mj-font name="${f.name}" href="${f.url}" />`).join('\n');
    }
    
    return `
      <mj-head>
        <mj-attributes>
          <mj-all font-family="Helvetica, Arial, sans-serif" />
        </mj-attributes>
        ${fonts}
      </mj-head>
    `;
  }

  private buildBody(design: DesignOutput): string {
    const sectionsHtml = design.sections.map(section => this.renderSection(section)).join('\n');
    
    const bgAttr = design.theme.global_background_image_url 
      ? `background-url="${design.theme.global_background_image_url}" background-size="cover"`
      : `background-color="${design.theme.global_background_color}"`;

    return `
      <mj-body ${bgAttr}>
        <mj-wrapper>
          ${sectionsHtml}
        </mj-wrapper>
      </mj-body>
    `;
  }

  private renderSection(section: any): string {
    switch (section.type) {
      case 'hero_standard':
        return this.renderHeroStandard(section);
      case 'benefit_icon_row':
        return this.renderBenefitIconRow(section);
      // ... switch cases for all 32 types
      default:
        return '';
    }
  }

  private renderHeroStandard(data: any): string {
    const subhead = data.subheadline ? `<mj-text align="center" color="${data.text_color}" font-size="18px" padding-bottom="20px">${data.subheadline}</mj-text>` : '';
    
    return `
      <mj-section background-color="${data.background_color || 'transparent'}" padding-top="${data.padding_top}px" padding-bottom="${data.padding_bottom}px">
        <mj-column width="100%">
          <mj-image src="${data.image_url}" alt="${data.image_alt}" padding="0" fluid-on-mobile="true" />
          <mj-text align="center" color="${data.text_color}" font-size="32px" font-weight="bold" padding-top="20px" padding-bottom="10px">
            ${data.headline}
          </mj-text>
          ${subhead}
          <mj-button href="${data.cta_url}" background-color="${data.cta_color}" color="${data.cta_text_color}" font-weight="bold" border-radius="4px">
            ${data.cta_text}
          </mj-button>
        </mj-column>
      </mj-section>
    `;
  }
  
  private renderBenefitIconRow(data: any): string {
      const columns = data.benefits.map(b => `
        <mj-column width="${100 / data.benefits.length}%">
            <mj-image src="${b.icon_url}" width="50px" height="50px" padding-bottom="10px" />
            <mj-text align="center" color="${data.text_color}" font-weight="bold" font-size="14px">${b.title}</mj-text>
            ${b.description ? `<mj-text align="center" color="${data.text_color}" font-size="12px">${b.description}</mj-text>` : ''}
        </mj-column>
      `).join('\n');
      
      return `
        <mj-section background-color="${data.background_color || 'transparent'}" padding-top="${data.padding_top}px" padding-bottom="${data.padding_bottom}px">
            ${columns}
        </mj-section>
      `;
  }
}
```

## 5. VIYO Universal Tag Language (VIYO-UTL)

To maintain platform agnosticism, sections NEVER use ESP-specific tags (like Klaviyo's `{{ first_name }}`). Instead, the Email Design Brain outputs VIYO-UTL tags, which are translated at the final compilation step by the Platform Abstraction Layer (R29).

### 5.1 Common UTL Tags Used in Sections
- `{{viyo.contact.first_name}}` -> Used in `hero_standard` headlines (e.g., "Welcome, {{viyo.contact.first_name}}!").
- `{{viyo.event.items}}` -> Used in `cart_recovery` loops.
- `{{viyo.org.unsubscribe_url}}` -> Used in `footer_standard`.
- `{{viyo.contact.loyalty_points}}` -> Used in `loyalty_status`.

## 6. Deliverability & Constraints (Critic Brain)

The compiled HTML must pass the Critic Brain's automated checks before being approved for export.

### 6.1 The 75KB Gmail Clipping Rule
Gmail clips emails that exceed 102KB. To ensure a safe margin for ESP link-tracking wrappers, VIYO enforces a strict 75KB limit on the compiled HTML output.

```typescript
export function checkFileSize(html: string): boolean {
  const sizeInBytes = Buffer.byteLength(html, 'utf8');
  const sizeInKB = sizeInBytes / 1024;
  return sizeInKB <= 75;
}
```

### 6.2 The 60/40 Text-to-Image Ratio
To prevent spam filter flags, the Critic Brain analyzes the final DOM to ensure the text-to-image ratio is healthy.

```typescript
import * as cheerio from 'cheerio';

export function checkTextToImageRatio(html: string): { valid: boolean; ratio: number } {
  const $ = cheerio.load(html);
  
  // Strip tags, get raw text length
  const textContent = $('body').text().replace(/\s+/g, '');
  const textScore = textContent.length;
  
  // Get image count and total area (rough estimation based on width/height attrs)
  let imageScore = 0;
  $('img').each((i, el) => {
    const w = parseInt($(el).attr('width') || '600', 10);
    const h = parseInt($(el).attr('height') || '400', 10);
    imageScore += (w * h) / 1000; // Normalized score
  });
  
  // If no images, ratio is infinite (valid)
  if (imageScore === 0) return { valid: true, ratio: 100 };
  
  const ratio = (textScore / (textScore + imageScore)) * 100;
  
  // We want at least 40% text representation
  return { valid: ratio >= 40, ratio };
}
```
