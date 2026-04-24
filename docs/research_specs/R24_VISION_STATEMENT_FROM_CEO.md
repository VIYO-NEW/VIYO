# R24 — CEO Vision Statement: VIYO Image Generation Architecture

**Source:** Direct articulation from Nurudeen Lawal (CEO), April 23, 2026
**Context:** Clarification following video analysis, correcting and expanding the architectural understanding

---

## The Complete Pipeline (As Articulated by the CEO)

### Phase 1 — The Learning Engine (Pre-Customer, Seeding Phase)

When VEO receives ingested emails (from competitors, brands, industry leaders), it does NOT just store them. It processes the images inside those emails through a structured pipeline:

1. **Email ingestion** → VEO receives thousands of marketing emails
2. **Image extraction** → VEO pulls every image from every email
3. **Image → JSON conversion** → VEO feeds each image to a vision LLM (Claude/Gemini) which reverse-engineers it into a structured JSON style schema (style_system, shared_principles, typography, doodles, negative_prompts, replication_prompt_template)
4. **JSON → Prompt generation** → VEO converts each JSON schema into model-specific prompts
5. **Multi-model testing** → VEO sends each prompt to multiple image generation models (NanoBanana, Ideogram, Seedream, Flux)
6. **Vision QA review** → VEO reviews every generated image for accuracy: Does the product look right? Is the text correct? Are the doodles present? Is the composition matching the original?
7. **Prompt tweaking** → VEO adjusts prompts based on QA results and re-tests
8. **Model-scenario mapping** → VEO learns which models work best for which scenarios (text-heavy → Ideogram, photoshoot → NanoBanana/Flux, candid lifestyle → Seedream)

This is a **self-learning loop**. VEO is training itself by processing real-world marketing emails, generating test images, reviewing them, and refining its prompt library. This happens BEFORE any customer touches the system.

### Phase 2 — The Prompt Database (Caching and Pattern Recognition)

The output of Phase 1 is NOT just better prompts — it is a **database of proven prompt patterns**:

- Every successful prompt is stored with its model, style, product type, and QA score
- When a new image request comes in, VEO first checks the prompt database for similar patterns
- If a close match exists, VEO uses the cached prompt (with product-specific modifications) instead of building from scratch
- This is **prompt caching** — similar to how a CDN caches responses, VEO caches proven prompts
- The cache is indexed by: product category, style type (T1-T4+), email context (flow/abandoned cart/welcome), audience (male/female), and model

**Result:** Production image generation is faster and more reliable because VEO is not generating prompts from zero — it is retrieving and adapting proven patterns.

### Phase 3 — Production with Real Customers

When a real customer onboards:

1. VEO already has a library of proven prompt patterns from Phase 1-2
2. The customer's products are analyzed (flat product image? existing photoshoot? what category?)
3. VEO matches the product to the best prompt patterns from the database
4. Images are generated using the optimal model(s) for that scenario
5. Internal QA reviews every image BEFORE the customer sees it
6. The customer NEVER pays for failed generations — VIYO absorbs that cost
7. Generation is fast because prompts are cached, not built from scratch

---

## The Three Types of Image Generation

### Type A — Product Already Has a Photoshoot

If the customer's website already has lifestyle/model photography, VEO uses those existing images as the base and adds Layer 3 (typography, CTAs, doodles) on top using Ideogram Remix.

### Type B — Product Has Only a Flat Image (No Model)

If the product is just a flat image (dress on white background, can of cola on a shelf), VEO must:
1. Generate a full lifestyle scene with a model wearing/holding the product
2. Add typography and CTAs on top

Example from the CEO: "If a customer scrolls to his website and he has a product and the product doesn't have, let's say it's a can of cola. And the product is just a can of cola and there is no model in shots. Then we're going to do a photoshoot where somebody is holding the can against the camera and water is splashing."

### Type C — Multi-Dimensional Pattern Interrupt

The most advanced type — creating email images that break scroll patterns through:
- Wraparound text (T1)
- Text behind subject (T2)
- Hollow text through subject (T3)
- Circular curved text (T4)
- Hand-drawn doodles and annotations
- Layered CTAs ("30% OFF", "SHOP NOW")

---

## The Business Logic Layer

VEO must determine the image type based on:

| Factor | Options | How VEO Decides |
|--------|---------|----------------|
| Product assets | Photoshoot exists vs. flat image only | Crawl customer's website, analyze existing product images |
| Product category | Fashion, food/beverage, electronics, beauty, etc. | Product metadata + vision analysis |
| Email purpose | Flow, abandoned cart, welcome, promotional, educational | Email type from the campaign builder |
| Audience | Male, female, age range | Customer's audience data from ESP |
| Season | Spring/summer, fall/winter, holiday | Calendar + customer's product seasonality |
| Urgency | Sale/discount vs. brand storytelling vs. new arrival | Campaign intent from the user |
| Typography need | Text-heavy pattern interrupt vs. clean minimal vs. none | Based on email position in the flow and engagement data |

---

## CEO Corrections (April 23, 2026 — Second Clarification)

### Correction 1: NOT Three Image Types — Hundreds

The three types (A, B, C) documented above are just the first three patterns discovered. The system must support an **unbounded, continuously growing taxonomy** of image types. T1-T4 from the test harness are just the first four typography patterns. The architecture must allow VEO to discover, learn, and offer **hundreds** of image types and ideas to brands. The image type library is never "complete" — it grows with every ingested email.

### Correction 2: NOT Fixed Model Count — Elastic

The architecture must NOT be designed around a fixed set of models. Today it is NanoBanana, Ideogram, Seedream, Flux. Tomorrow it could be Grok Imagine, ChatGPT Image 2, or models that do not exist yet. The system must have a **plugin architecture** where new models are added without code changes — just configuration. VEO may use 1, 2, 3, 4, 5, or 6 models in conjunction for a single image. The system chooses.

### Correction 3: NOT Just Hero Images — Every Image in the Email

The image pipeline is not just for the hero/header image. Every visual element in the email — product blocks, lifestyle sections, CTA banners, headers, footers, dividers — is an opportunity for AI-generated imagery. The system must produce visuals for the **entire email**, not just one section.

### Correction 4: The Learning Phase IS the Core Product

The seeding/learning phase is not a pre-launch activity that ends. It is VIYO's **defensible moat**. The continuous cycle of ingesting emails → breaking them into JSON → testing replication across models → reviewing accuracy → building the pattern database is what makes VIYO's image capability impossible to replicate. This learning engine runs forever.

### Correction 5: Replication as the Learning Mechanism

The CEO's specific approach to learning: ingest a real marketing email → extract the images → break them down into JSON style schemas → use those schemas to generate prompts → test the prompts against multiple models → try to **replicate the original ingested email image** → compare the replication to the original → learn what works. This replication-based learning is the core training methodology.

---

## What This Changes About R24

The current R24 spec treats image generation as a feature with fixed models and fixed types. This vision reframes it as a **self-learning, model-agnostic, pattern-expanding image intelligence system** with:

1. **Seeding phase** (continuous) — Ingest emails → extract images → build JSON schemas → generate test images → QA review → build prompt database → never stops
2. **Caching phase** (ongoing) — Maintain and expand the prompt pattern database, indexed by product/style/model/context. Prompt patterns grow unboundedly.
3. **Production phase** (customer-facing) — Match products to cached patterns → generate using optimal model combination → QA → deliver. Customer never sees failures.
4. **Model registry** — Plugin architecture for adding/removing models without code changes
5. **Pattern taxonomy** — Unbounded, self-expanding library of image types discovered through learning
6. **Full-email coverage** — Generate visuals for every section of the email, not just the hero

The R24 rewrite must be structured as an intelligence system, not a pipeline.
