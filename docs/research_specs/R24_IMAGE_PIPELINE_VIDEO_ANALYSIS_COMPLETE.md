---
**STATUS: SUPERSEDED**

This document is superseded by R24 v2 at `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md` (ratified 2026-05-12, ZCBR PASSED by Architect Claude self-validation).

This v1 fragment file is retained as historical reference only. R24 v2 reconciles five v1 fragment files (Video Analysis, Learning Loop Critique, Multi-Model Enterprise, Vision Critique, Vision Statement from CEO) into a single ZCBR-grade spec aligned to FOUNDATION_AUTHORITY L11 Pattern Substrate, the implementation surface in packages/shared/src/schemas/art-director.ts, and the 5 CEO corrections from 2026-04-23.

All Bullet directives and R-specs that cite "R24" or any of the v1 fragment files MUST be interpreted as citing R24 v2 going forward.

Do NOT use this file as canonical. Do NOT update this file. See R24 v2 for current pipeline contract.

**Superseded by:** D66 (B-1.00 ratified) → R24 v2 authoring (2026-05-12) → R24 v2 merge PR
**Superseded date:** 2026-05-12
---

# VIYO Image Generation Pipeline — Complete Video Analysis

**Author:** Manus AI
**Date:** April 23, 2026
**Source:** 41-minute recorded session between Nurudeen Lawal (CEO) and team member (Justin)
**Artifacts:** Full transcript, 35 extracted screenshots, frame-by-frame visual notes

---

## 1. The Three-Layer Vision

At the very opening of the video (00:00 - 00:47), Nurudeen articulates the core three-layer architecture for VIYO image generation:

> "Customer would put an image of a dress and we are going to put it as a lifestyle modeling shoot on the model and then the third phase would be to add the text on top of it as a third layer or call to action or whatever it is."

This establishes the fundamental pipeline:

| Layer | What Happens | Input | Output |
|-------|-------------|-------|--------|
| **Layer 1** | Customer uploads a flat product image | Product photo (e.g., dress on white background) | Raw product asset |
| **Layer 2** | AI places the product on a model in a lifestyle scene | Product image + style prompt | Photorealistic editorial scene |
| **Layer 3** | AI overlays typography, CTAs, doodles on top | Scene image + text instructions | Final email-ready editorial asset |

This three-layer model is NOT in the current R24 spec. The current spec treats image generation as a single-step process. The architecture must be restructured around these three distinct layers.

---

## 2. The Existing Test Harness (Already Built)

The opening screenshot (00:00:15) reveals that the team has already built a structured test harness in a project called `viyo-header-test`. The file explorer shows:

**Project structure:**
- `inputs/` — Contains inspiration images (Dior campaigns, luxury editorials) and product images
- `outputs/` — Generated results
- `viyo-model-tests/` — Organized by model:
  - `flux-2-pro/`
  - `flux-kontext-max/`
  - `ideogram-v3/` with files: `T1-marker-scribble-wrapping`, `T2-massive-caps-behind-subj`, `T3-outlined-hollow-through-su`, `T4-circular-curved-text-orbit`
  - `seedream-4.5/` with same T1-T4 pattern naming
  - `nano-banana-pro/` with files: `T1-text-behind-subject`, `T2-mixed-typography-hierarchy`, `T3-multi-product-editorial`

**JSON run files visible:** `run-20260420-143546.json`, `run-20260421-074425.json`, `cross-model-run-20260421-073607.json` with multiple output versions (v1, v2, v3).

**Key insight:** The team has already defined **4 typography pattern types** and tested them across **4-5 models**. This taxonomy must be formalized in R24:

| Pattern ID | Name | Description |
|-----------|------|-------------|
| T1 | Marker Scribble Wrapping | Hand-drawn text wrapping organically around the model |
| T2 | Massive Caps Behind Subject | Large block letters positioned behind/through the model |
| T3 | Outlined Hollow Through Subject | Outlined/hollow text passing through the subject |
| T4 | Circular Curved Text Orbit | Text arranged in circular/curved paths around the model |

NanoBanana Pro has a different test taxonomy (T1-T3) suggesting it was tested with different pattern types suited to its strengths.

---

## 3. The Inspiration-to-JSON Workflow (The Core Innovation)

### 3a. Inspiration Collection (02:00)

The `inputs/` folder contains real luxury brand campaign images (Dior "ESCAPADE EXOTIQUE" visible at frame 02:00). The goal is to reverse-engineer the visual style, typography placement, color harmony, and composition from these campaigns and replicate them with the customer's own products.

Multiple inspiration images are collected: `Header inspiration image 2.png`, `Inspiration 3.png`, `input 1 inspiration.png`. Multiple ChatGPT Atlas screenshots are also present, suggesting earlier experimentation with different LLMs.

### 3b. Claude JSON Extraction (02:25 - 05:19)

Nurudeen describes the workflow at 02:25:

> "I give Claude, I tell Claude to create me a JSON file... extract the JSON or give me a JSON prompt... the style and fill so I can replicate with different products."

The exact prompt given to Claude: feed it the inspiration images and ask it to extract the style into a structured JSON. Claude (Sonnet 4.6 - Medium) produces a comprehensive schema.

**The Initial JSON Schema (frame 04:50):**

```json
{
  "style_system": "fashion_editorial_campaign",
  "shared_principles": {
    "format": "portrait",
    "aspect_ratio": "2:3",
    "model_pose": "relaxed, non-commercial, editorial — model is not posing FOR the camera, they exist in the scene",
    "product_focus": "worn on model, full look, not isolated",
    "typography_placement": "upper third or corner, never centered — always offset to create tension with the model",
    "color_harmony": "background color echoes or complements the product palette — never neutral grey studio",
    "mood": "confident, slightly effortless, character-driven not aspirational-fantasy"
  },
  "variants": [...]
}
```

Each variant captures: `id`, `reference` (the inspiration source), `background` (color hex + description), `props`, `model_pose`, `lighting`, `color_grade`, `typography` (style, color, placement, font_feel), and `era_reference`.

**The Expanded JSON Schema (frame 25:00):**

Later in the session, Claude produces a more advanced schema for a candid lifestyle/scrapbook style that adds critical new fields:

```json
{
  "doodles": {
    "style": "simple white line-art, drawn directly on the photo",
    "elements": ["smiley face circle", "sad face circle", "small arrows", "underlines"],
    "feel": "zine, scrapbook, yearbook doodles — not polished illustration"
  },
  "product_placement": {
    "method": "worn on model, full body visible, product is part of the scene not the focus",
    "note": "product should feel incidental — like the model happened to be wearing it"
  },
  "replication_prompt_template": {
    "instruction": "Candid lifestyle fashion photo... wearing [PRODUCT_DESCRIPTION]... large all-caps bubbly letters reading '[HERO_TEXT]'... smaller '[SECONDARY_TEXT]'... annotation labels reading '[LABEL_1]' and '[LABEL_2]'..."
  },
  "negative_prompts": [
    "studio background", "posed smile", "clean typography",
    "professional lighting", "flat lay", "product on its own",
    "polished illustration", "sans-serif clean font"
  ]
}
```

Claude also provides strategic insight: "Key insight on this style: the entire effect comes from two things working together - an authentically candid overhead shot (not staged to look candid), and hand-drawn type that fills dead space in the frame."

### 3c. The JSON's Role in VIYO (10:14 - 10:50)

When asked "what are you doing with the JSON file?", Nurudeen explains:

> "The JSON file is for us to be able to understand if it will run us through again."

And at 10:42:

> "This is supposed to be the prompt, basically based off of the JSON file."

The JSON serves as a **persistent, reusable pattern template**. Once extracted, it can generate prompts for any product without re-analyzing the inspiration images. This is the core of VIYO's scalability.

---

## 4. Prompt Generation from JSON + Product (08:12 - 08:30)

When Claude receives a specific product image (blue ditsy floral mini dress) plus the JSON style system, it generates **3 variant prompts**, each tailored to a different style:

**Variant 1 — Retro Editorial (Lazy Daisy):** "Fashion editorial campaign image. Retro 1970s aesthetic. Female model wearing a blue ditsy floral mini dress... Seated across two vintage mustard vinyl chairs... Soft directional dramatic lighting, warm 70s film stock color grade. Typography overlaid: retro groovy cursive script reading 'Girl' in bright yellow..."

**Variant 2 — Pop Art Streetwear (Taxi Collection):** "...Flat saturated sky blue background — same blue as the dress to create a tonal monochrome effect... Typography overlaid: hand-drawn bubble letters with thick black outline stroke reading 'BLOOM' at top..."

**Variant 3 — Luxury Natural Editorial (Soleil):** "...Standing tall in a warm terracotta Mediterranean courtyard... Typography overlaid: elegant serif italic 'Fleur Edit' in white, bottom left..."

Claude also provides a recommendation: "The Retro Editorial will hit hardest for this dress - the blue floral against olive green with script type is a natural match for its cottagecore-meets-vintage energy."

**Architectural implication:** VIYO's LLM (VEO) must be able to (a) generate multiple style variants per product, and (b) recommend the best variant based on product characteristics. This is a Council of Brains function.

---

## 5. The Dual-Output Format (33:15)

At frame 33:15, Claude demonstrates generating BOTH formats simultaneously:

1. **Human-readable detailed prompt** — Full paragraphs with scene description, lighting, props, typography instructions, and negative prompts
2. **Compact API-ready JSON** — `{"aspect_ratio":"3:4","prompt":"...","quality":"high"}` ready for direct submission to Kie.ai APIs

The compact JSON includes the brand name "INTRODUCING ADORB" and explicit text rendering instructions like "the exact text... curves across the top half of the image in hand-drawn block caps. The letterforms must be hand-lettered, chunky, uneven like a real marker. Several of the letters (the D and U in INTRODUCING) pass BEHIND the woman."

**Architectural implication:** VIYO must output prompts in the exact JSON format accepted by each model's API. The prompt engineering layer must be model-aware.

---

## 6. Product Variations and Seasonal Adaptations (33:15, 36:00 - 36:19)

The user demonstrates requesting product variations:

> "Write me a prompt for to recreate that style for this sundress with a model wearing a coat on top and additional 30% off call to action"

Claude adapts: "...with an oversized cream or camel wool coat thrown loosely over her shoulders, half falling off..." and adds the "30% OFF" in a starburst doodle.

Claude also provides business context: "The coat layered over the sundress reads as a 'transitional season' styling choice, which also justifies the 30% off angle naturally (end of season sale)."

Later (36:00): "If we wanted to add a coat to it based on the season or whatever it is we would have as well."

**Architectural implication:** VIYO must support:
- **Seasonal layering** — Adding coats, accessories, seasonal props based on time of year
- **CTA injection** — Adding promotional text (30% off, SHOP NOW, etc.) as a separate parameter
- **Business context awareness** — Understanding why a coat + discount makes sense together (transitional season clearance)

---

## 7. Model-Specific Findings from Live Testing

### 7a. Flux (Mentioned but Not Tested Live)

At 08:58, the team discusses Flux:

> "Flux is like what most fashion guys use. That's what I think a lot of people use. But this is what I have access to right now."

The file explorer shows `flux-2-pro` and `flux-kontext-max` test folders exist with completed tests, but Flux was not tested live in this session. Flux is considered the industry standard for fashion photography but was unavailable during the live demo.

**Architectural implication:** Flux must remain in the model roster. The test harness already has results for Flux 2 Pro and Flux Kontext Max that should be analyzed.

### 7b. NanoBanana 2 / NanoBanana Pro

**Strengths:** Beautiful photoshoot scenes, extremely low cost ($0.036-$0.081/image), 100% uptime, fast generation.

**Weaknesses discovered in live testing:**
- At 28:10: "It didn't give us exactly the wraparound text around it." The prompt explicitly said "wrapping around" but NanoBanana failed to execute the wraparound.
- At 28:40: "It says wrapping around, but it didn't wrap around." Confirmed failure on text wrapping.
- At 14:03: "Modeling shoes. Plus, but because the prompt didn't have any call to action." — NanoBanana produced a clean photoshoot but without text overlay when the prompt lacked explicit CTA instructions.

**Nurudeen's assessment (21:23):** "My thing was Nano Banana is more safe to have run everything I want. If once the critic definitely looks at that and says, okay, there's a problem, then we're able to send that through a second flow."

**Architectural implication:** NanoBanana is the **safe default** for base scene generation. It reliably produces photoshoots. When text is needed, the output should be passed to a second model (Ideogram) for typography overlay.

### 7c. Seedream 4.5

**Strengths:** Strong text rendering, good at candid/scrapbook styles, very cheap ($0.005-$0.55/run on Kie.ai).

**Weaknesses:**
- At frame 37:30: Rendered a WHITE sundress instead of the blue floral dress from the reference image — **product fidelity drift**.
- Described as "Chinese model" by the team (11:48-11:52).
- Previously produced excellent wraparound text results (the pre-session images shown at 00:00:15 were generated with Seedream).

**Key finding (38:56 - 39:16):** When asked which model produced the excellent pre-session images, Nurudeen confirms: "I generated through Claude same same process like this... on the KDA... with Seedream." But when trying to reproduce the same quality live, results were inconsistent.

**Architectural implication:** Seedream is a strong secondary model but has inconsistent product fidelity. It should be used when the product is already on a model (existing photoshoot) rather than when generating from a flat product image.

### 7d. Ideogram V3

**Strengths:** Best text rendering quality, excellent doodle generation, text-behind-subject works correctly, clean typography, good product fidelity.

**Weaknesses:**
- More expensive than NanoBanana ($0.12/image via Kie.ai)
- Some tests showed it "kind of tried" the wraparound but didn't fully achieve it (29:28-29:36)

**Key capabilities discovered:**
- **Remix feature** (17:23-18:10): Allows taking an existing image and transforming it with a new prompt while preserving elements. Settings include preservation weight (50%, 60%, 70%, 80%) controlling how much of the original image to keep.
- **Describe feature** (18:15): Auto-generates a detailed product description from an uploaded image — captures fabric, pattern, construction details, silhouette, and styling.
- **Batch mode**: Visible in the sidebar, enabling bulk generation.
- **Character consistency**: Available as a feature.
- **Reference image mode** vs **Remix mode**: The team experimented with both approaches (17:48-18:27).

**Ideogram Remix preservation weights (19:36-19:55):**

> "So if your grandma has a lot of settings, how much remakes 50%, 60%, 70%, 80%. How much to keep up the original image and how much you change."

At 19:58: "And it came out very, like almost a hundred percent. So if you look at the consistency of the dress, the dress looks a hundred percent the same."

**Architectural implication:** Ideogram V3 is the primary model for Layer 3 (text overlay). Its Remix feature with preservation weights is the key to maintaining product fidelity while adding typography. The "Describe" feature can automate product description extraction.

---

## 8. The Model Mixing Strategy (20:29 - 21:23)

This is one of the most critical architectural discussions in the video:

> "Some models are better for the photoshoot like Nano Banana, some are for the text on top, like ideogram, more accuracy. So it really depends on the models and mixing, sending one to one model, and then getting the result we want, and then sending it to a different model to keep on editing the image."

And at 21:07:

> "If we take something like this right now and say probably we want to add in maybe a different type of word in here, right? We can try that and do our ideogram right now and see."

**This confirms the multi-model chaining architecture:**
1. Generate base scene with NanoBanana/Flux (best for photoshoots)
2. Send the result to Ideogram V3 Remix (best for text/typography)
3. Optionally iterate: send back for further edits

**API controllability question (20:13):** "Can we control that? Can we control any, I mean all that with the API?" — Answer: "You probably can." This needs verification during implementation.

---

## 9. VEO's Intelligence Requirements (21:36 - 23:10)

Nurudeen outlines what VEO (VIYO's AI brain) must be able to determine:

> "VEO can run with a JSON file, pattern recognition to create the prompt for similar images based on what we upload to the brain, and then it can create those prompt patterns to produce those kind of images going forward."

And critically (22:23 - 23:10):

> "The question is, what image model to use? One or use two or use three? Does the customer already have a photo shoot ready on their website if it's a fashion site? Or do they have just a blank product image? It's always going to look better on a photo shoot, obviously. As a professional, that's the VEO advantage. But we need to figure out, VEO needs to figure out exactly what product needs what kind of image or what kind of email editorial. Is it going into a flow? Is it going into an abandoned cart? Is it going to a male? Is it going to a female? So on and so on. So VEO is going to have to determine it."

**VEO must make these routing decisions:**

| Decision | Options | Factors |
|----------|---------|---------|
| **Input type** | Existing photoshoot vs. flat product image | Customer's available assets |
| **Model selection** | 1 model, 2 models, or 3 models | Complexity of the visual requirement |
| **Style selection** | Which variant from the JSON library | Product type, season, audience |
| **Email context** | Flow, abandoned cart, welcome, promotional | The email's purpose determines the visual tone |
| **Audience** | Male vs. female | Affects model selection, pose, styling |
| **Typography need** | Text-heavy vs. minimal vs. none | Determines if Ideogram overlay is needed |

---

## 10. The "Pattern Interrupt" Concept (23:24 - 23:28)

Nurudeen specifically calls out the wraparound text style:

> "Which I think is very unique and very pattern interrupt."

This is a marketing concept — the wraparound text style breaks the visual pattern of a typical email, forcing the reader to stop scrolling and engage. This is a deliberate design strategy, not just an aesthetic choice.

**Architectural implication:** VIYO should categorize image styles by their marketing function (pattern interrupt, brand storytelling, product showcase, urgency/CTA) in addition to their visual characteristics.

---

## 11. Prompt Specificity for Text Layout (32:42 - 33:35)

The team discovers that text rendering quality is directly proportional to prompt specificity:

> "This seems like detailed on the prompt part where the text is concerned, chunky, you see. So it's very detailed when it comes to the text and how the text is laid out."

And:

> "Exactly as written, every mark must look... yeah, this kind of just explaining. So this is a big part of how the prompt really really matters here."

**Architectural implication:** VIYO's prompt templates must include extremely detailed text rendering instructions — not just "add text X" but specifying: font feel, letter style (chunky, wobbly, hand-lettered), placement (wrapping, behind subject, curved), visual effects (chalk marker, paint marker, neon), and explicit negative instructions (no clean fonts, no digital-looking text).

---

## 12. Failure Cases and Error Patterns

### 12a. NanoBanana Wraparound Failure (28:10 - 29:26)

The prompt explicitly said "wrapping around" but NanoBanana 2 failed to execute it. The team verified by using Ctrl+F to search for "wrap" in the prompt — confirming the instruction was present but ignored by the model.

### 12b. Seedream Product Fidelity Drift (37:30)

Seedream 4.5 rendered a WHITE sundress instead of the blue floral dress from the reference image. The text and composition were excellent, but the core product was wrong.

### 12c. Hallucinated Text — "DNU" (37:00 - 37:21)

NanoBanana generated text that included "DNU" which was never in the prompt:

> "I don't understand what the DNU is. I didn't write anything like DNU in here."

The team realizes: "So it understood the model and understood it wrong" — the model misinterpreted "the D and U in INTRODUCING pass BEHIND the woman" as a separate text element "DNU."

### 12d. Inconsistent Reproducibility (38:46 - 39:30)

Nurudeen's pre-session images (shown at 00:00:15) were excellent, but reproducing the same quality live proved difficult:

> "I'm not sure why I did it so good on your version... so same thing, how did it just by adding a different dress and by adding..."

This highlights that prompt sensitivity is high — small changes in product image or prompt wording can significantly affect output quality.

**Architectural implication:** All four failure patterns require the QA vision loop. VIYO must detect: (a) missing text elements, (b) wrong product rendering, (c) hallucinated text, (d) quality regression from expected baseline.

---

## 13. The Internal Training and QA Loop (37:25 - 38:34)

This is the most important business requirement in the entire video:

> "VEO needs to learn and produces a lot of images, review when we launch, design a lot of images, review a lot of images, we inject theory results, test the images and approve prompts."

> "So I think maybe that's the solution is that again we load the brain with thousands of emails, the brain exercises a lot, it creates right tons of text email, it also reviews test emails and creates test images, it monitors and see what works, what prompts doesn't work and what works and what doesn't work."

> "So when we come to production and the customer does not have to pay for 3 or 4 or 5 image generation."

> "Our prompts needs to be a hundred percent against each and every model that we're using."

**This describes a three-phase learning system:**

| Phase | What Happens | When |
|-------|-------------|------|
| **Pre-launch training** | Load brain with thousands of emails, generate test images, review results, approve/reject prompts | Before customer access |
| **Production QA** | Generate images internally, review via vision LLM, regenerate failures silently | Every customer request |
| **Continuous learning** | Monitor what works/doesn't, update prompt templates, refine model routing | Ongoing |

The customer should NEVER see a failed generation. VIYO absorbs the cost of failed attempts internally.

---

## 14. Existing Photoshoot Reuse (39:54 - 40:42)

A late but important insight:

> "The model can be hey we already have an image of a model wearing something, put a different shirt on it or put a different dress on it."

> "It can be the assets that we use within can be more or less attributed to every account to any brand."

> "Okay so yeah it may be thinking of thinking about it a different way, seeing what they already have and just looking with this. I mean this model is wearing this specific dress and then trying to figure it out."

**Architectural implication:** VIYO should maintain a **shared asset library** of model photoshoot bases. Instead of generating a new scene every time, VIYO can take an existing photoshoot image and swap the product using Ideogram Remix or similar image-to-image capabilities. This dramatically reduces cost and improves consistency.

---

## 15. Kie.ai as the API Gateway

Throughout the video, all model testing is done through **kie.ai** — a unified API platform that provides access to multiple image generation models:

| Model on Kie.ai | URL | Cost per Run |
|-----------------|-----|-------------|
| NanoBanana 2 | kie.ai/nano-banana-2 | 8-18 credits ($0.036-$0.081) |
| Seedream 4.5 | kie.ai/seedream-4-5 | 0.5-5.5 credits |
| Ideogram V3 | kie.ai (via API) | ~12 credits |
| Gemini 3.1 Pro | kie.ai/gemini-3-1-pro | Not tested for images |

**API format is standardized:** `{"aspect_ratio": "3:4", "quality": "high", "prompt": "...", "image_urls": [...]}` with optional `image_input` for reference images.

**API speed concern (27:47, 35:40):** "API should be a lot faster" and "I just hope that when we do it with API is going to be a lot faster because it is going to need to create two or three or four."

**Architectural implication:** VIYO should use Kie.ai as the unified API gateway rather than integrating each model separately. This simplifies the integration layer and provides access to new models as they become available.

---

## 16. The Brand: Adorb Custom Tees

The test case throughout the video is a real brand: **Adorb Custom Tees** (adorbcustomtees.com), a Shopify store rated 4.4 stars with 52 reviews, located in Hillsborough County, FL. Products include custom t-shirts with text designs like "Mrs." and "Bride Tribe."

The brand name "ADORB" appears in generated images as the brand watermark/identity text. This confirms the pipeline is being tested with real e-commerce data.

---

## 17. Claude's Workspace Context

The Claude desktop app (frame 03:00) reveals the broader R&D context through recent sessions:

- "Build image model testing and comp..." — The current test harness
- "Review VIYO project and PRD statu..." — PRD review
- "Set up AI agent with Nir's brand acce..." — Brand access setup
- "Investigate nano banana integration..." — NanoBanana research
- "Build Shopify landing page generato..." — Shopify integration
- "Review Viyo v4 documentation thoro..." — V4 documentation
- "Explore Tribe v2 predictive foundat..." — Tribe v2 exploration
- "Set up Firecrawl MCP server integra..." — Firecrawl integration
- "JARVIS Strategic Implementation an..." — JARVIS system

**Routines visible:** Nexus sentinel audit (Daily), Nexus atlas morning brief (Daily), Nexus council nightly (Daily), Nexus scribe linkedin week (Weekly).

---

## 18. Ideogram's "Describe" Feature for Automated Product Analysis

At frame 18:15, Ideogram's "Describe" button auto-generates a highly detailed product description from the uploaded dress image:

> "A light blue floral sundress with a delicate white ditsy print pattern throughout. The dress features thin adjustable straps tied at the shoulders, a sweetheart neckline with ruffled trim, and a fitted waist that flows into a flared skirt with ruffle details. The bodice has a corset-style design with a center tie closure..."

**Architectural implication:** VIYO can use Ideogram's Describe API (or a vision LLM) to automatically extract product descriptions from uploaded images, eliminating the need for manual product description input. This feeds directly into the `[PRODUCT_DESCRIPTION]` placeholder in the replication prompt template.

---

## 19. Summary of All Architectural Requirements for R24 Rewrite

Based on every insight extracted from the video:

| # | Requirement | Source Timestamp | Priority |
|---|------------|-----------------|----------|
| 1 | Three-layer pipeline (product → scene → text overlay) | 00:26-00:47 | Critical |
| 2 | Claude/LLM JSON style extraction from inspiration images | 02:25-05:19 | Critical |
| 3 | Replication prompt templates with placeholder variables | 25:00 | Critical |
| 4 | Negative prompts array in every template | 25:00 | Critical |
| 5 | Doodle/overlay element specification | 25:00 | High |
| 6 | Multi-variant prompt generation per product | 08:12-08:30 | Critical |
| 7 | LLM recommends best variant for each product | 08:30 | High |
| 8 | Dual output format (human-readable + API-ready JSON) | 33:15 | High |
| 9 | Model mixing/chaining (NanoBanana → Ideogram) | 20:29-21:23 | Critical |
| 10 | VEO routing decisions (input type, model, style, context, audience) | 22:23-23:10 | Critical |
| 11 | Seasonal adaptation (coat layering, seasonal props) | 33:15, 36:00 | High |
| 12 | CTA injection as a separate parameter | 24:19-24:23 | High |
| 13 | Internal QA vision loop (silent regeneration) | 37:25-38:34 | Critical |
| 14 | Pre-launch training on thousands of test images | 37:51-38:12 | Critical |
| 15 | Prompt template approval/rejection workflow | 37:35-37:43 | High |
| 16 | Shared photoshoot asset library for product swapping | 39:54-40:42 | Medium |
| 17 | Automated product description extraction (vision LLM) | 18:15 | High |
| 18 | Typography pattern taxonomy (T1-T4) | 00:00:15 | High |
| 19 | Pattern interrupt classification for marketing function | 23:24-23:28 | Medium |
| 20 | Kie.ai as unified API gateway | Throughout | High |
| 21 | Ideogram Remix with preservation weights for product fidelity | 19:36-20:10 | Critical |
| 22 | 4K resolution support for high-quality outputs | 27:50 | Medium |
| 23 | Existing customer photoshoot detection and reuse | 22:26-22:43 | High |
| 24 | Prompt specificity requirements for text layout | 32:42-33:35 | Critical |
| 25 | Error detection: hallucinated text, product drift, missing elements | 37:00-37:21 | Critical |

---

## 20. Recommended Next Steps

1. **Rewrite R24** to incorporate all 25 requirements above, structured around the three-layer pipeline
2. **Formalize the JSON style schema** as a Zod schema in R24 with all fields (style_system, shared_principles, variants, doodles, product_placement, replication_prompt_template, negative_prompts)
3. **Build the typography pattern taxonomy** (T1-T4+) as a formal enum in the Visual Intent Router
4. **Integrate Kie.ai API** as the unified gateway rather than individual model APIs
5. **Design the QA vision loop** as an Inngest pipeline with retry logic
6. **Analyze the existing Flux test results** from the `viyo-header-test` harness to complete the model comparison
