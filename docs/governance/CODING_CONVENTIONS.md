# CODING_CONVENTIONS.md — VIYO Code Rules

These rules apply to every PR. **Reviewer Claude enforces.** A PR violating any rule fails review.

---

## Rule 1 — Schema changes via canonical migrations only

When any DB drift is detected, **rebuild from canonical Drizzle migrations**. Never patch in code, schema, or tests.

```bash
# Correct
pnpm db:push                       # apply canonical migrations

# WRONG — never do this
psql -c "ALTER TABLE assets ADD COLUMN ..."   # ad-hoc patch
```

**Incident lesson:** §1A-FU-04 era. A previous build attempt made unauthorized schema modifications described as "additive runtime schema alignment." This violated the boundary. Recovery required dropping the local DB and rebuilding from canonical migrations.

---

## Rule 2 — Result pattern for fallible operations

Use `Result<T, E>` (or equivalent) for any operation that can fail. Never throw exceptions for expected error cases.

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Use:
async function generateImage(brief: string): Promise<Result<Asset, GenError>> {
  // ...
}

// Caller handles:
const result = await generateImage(brief);
if (!result.ok) {
  // handle error
  return;
}
const asset = result.value;
```

Throws are reserved for **truly exceptional** cases (e.g., unrecoverable infrastructure failure).

---

## Rule 3 — TypeScript strict, zero `any`

`tsconfig.json` strict mode is enabled. `any` is **banned**. Use `unknown` and narrow.

```typescript
// WRONG
function process(input: any) { ... }

// CORRECT
function process(input: unknown) {
  if (typeof input === 'string') { ... }
}
```

---

## Rule 4 — Behavioral tests, not source-string tests

Tests verify behavior (input → output), not internal implementation strings.

```typescript
// WRONG — fragile, breaks on refactor
expect(generatedCode).toContain('forbidden_word');

// CORRECT — verifies actual behavior
expect(generateOutput(input)).toEqual(expectedOutput);
```

(Lesson from Portal §9 work: forbidden-vocabulary tests scan HTML outputs, not source strings, so refactors don't break tests.)

---

## Rule 5 — Mastra DAGs run inside Inngest steps

Never call providers directly from API handlers. Always wrap in Inngest + Mastra:

```typescript
// WRONG
app.post('/api/generate', async (req, res) => {
  const result = await openai.images.generate(prompt);   // direct call
  res.json(result);
});

// CORRECT
app.post('/api/generate', async (req, res) => {
  await inngest.send({ name: 'image.generate', data: { brief } });
  res.json({ status: 'queued' });
});

// In Inngest function:
export const generateImage = inngest.createFunction(
  { id: 'generate-image' },
  { event: 'image.generate' },
  async ({ event, step }) => {
    await step.run('mastra-dag', async () => {
      // Mastra DAG executes here, with model routing
    });
  }
);
```

---

## Rule 6 — Sharp/PIL for compositing, NEVER AI for text/color

Programmatic compositing (text overlay, color, brightness, contrast, crop, resize, flip, rotate) uses Sharp (Node) or PIL (Python). **Zero AI tokens.**

```typescript
// WRONG
const result = await openai.edit(image, "change the text from 'SALE' to 'CLEARANCE'");

// CORRECT
const overlay = sharp(originalImage).composite([{
  input: textOverlayBuffer,
  top: 100, left: 200,
}]);
```

**Forbidden:** AI model calls for text editing in flattened images, color changes, brightness adjustments, crops.

---

## Rule 7 — Plugin Registry for model selection (no hardcoding)

No hardcoded model names in business logic. All model selection via R29 PAL Plugin Registry.

```typescript
// WRONG
const model = 'NanoBanana 2 Pro';
const result = await generateWithNanoBanana(prompt);

// CORRECT
const scoring = await artDirectorRouter.score(brief);
const model = scoring.bestModel;
const result = await pluginRegistry.invoke(model, prompt);
```

Tier 2 escalation is automatic via the router when complexity exceeds Tier 1 capacity.

---

## Rule 8 — Database-driven organization for Brand Vault

Folder-based organization in Cloudflare R2 is forbidden. All organization via:

- `parent_asset_id` lineage
- `asset_type` enum (extensible)
- JSONB metadata column
- pgvector embeddings for natural-language search

```typescript
// WRONG
const path = `r2://brand-${brandId}/lifestyle/2026-summer/${filename}`;

// CORRECT
await db.insert(assets).values({
  brand_id: brandId,
  asset_type: 'lifestyle_scene',
  parent_asset_id: parentId,
  metadata: { tags: ['summer', '2026', 'beach'], generation_prompt: brief, ... },
  r2_key: filename,
  embedding: await generateEmbedding(asset),
});
```

R2 keys are flat blob references. The `assets` table provides organization.

---

## Rule 9 — Supabase RLS on every tenant query

Every query touching `image_prompt_patterns`, `assets`, `pattern_performance_metrics`, or any tenant-scoped table enforces RLS on `brand_id`.

**Forbidden:** Bypassing RLS via service role key for any user-initiated operation. Service role is reserved for admin operations only, behind `requireAdmin()` middleware.

---

## Rule 10 — Every generation emits an RLHF signal

No untracked generations. Every Inngest function in the generation pipeline must emit at least one signal to `pattern_performance_metrics` before completing.

```typescript
await step.run('emit-rlhf-signal', async () => {
  await db.insert(pattern_performance_metrics).values({
    pattern_id, action: 'generation_returned', delta: 0,
  });
});
```

Subsequent user actions (drag, export, regenerate) emit additional signals with the appropriate qaScore deltas (+1, +5, −1).

---

## Rule 11 — Pattern shape = locked JSON Recipe schema

All entries in `image_prompt_patterns` use the locked Pattern Recipe JSON shape (see VVOW Architecture §10.3).

**Forbidden:** custom pattern shapes, abbreviated patterns, or schema drift. Schema drift breaks the Visual Intent Router's pattern injection.

```typescript
// WRONG
const pattern = { prompt: "cool image", model: "flux" };

// CORRECT — full Pattern Recipe shape
const pattern: PatternRecipe = {
  style_system: 'fashion_editorial_campaign',
  shared_principles: { format: '...', aspect_ratio: '...', ... },
  variants: [{ background: '...', props: '...', ... }],
  doodles: { style: '...', elements: [...], feel: '...' },
  negative_prompts: [...],
  replication_prompt_template: { prompt: '...', negative_prompt: '...' },
};
```

---

## Rule 12 — One ask per turn (PO-set conventions)

In conversational interactions with PO, queue work but only present one decision per turn with explicit confirmation between asks.

This applies to Architect-in-Portal interactions, not to programmatic API calls.

---

## Rule 13 — Acceptance messages end with the standard line

User-facing acceptance messages always end with this exact line:

> Provide a Manus Project gate for me to publish it locally.

This applies in directive-acceptance cycles, not in arbitrary conversation.

---

## Rule 14 — Tier 2 escalation is complexity-based, not failure-based

When implementing the Art Director Router (R29 PAL):

- Health checks within Tier 1 (Atlas Cloud ↔ fal.ai peer fallback)
- Escalation Tier 1 → Tier 2 is **complexity-based**, not failure-based
- Tier 3 doesn't change WHICH model runs — only WHERE it runs (CapEx optimization)

```typescript
// CORRECT
if (complexityScore > TIER_1_THRESHOLD) {
  return tier2Router.invoke(model, prompt);
}
return tier1Router.invoke(model, prompt);

// WRONG — failure-based
try {
  return tier1Router.invoke(model, prompt);
} catch {
  return tier2Router.invoke(model, prompt);  // wrong escalation reason
}
```

---

## Rule 15 — ZCBR Validation Required Before Code (Lock 20 enforcement, locked 2026-05-11)

No Bullet ships against an unvalidated R-spec. All Bullets ship against Architect-authored, ZCBR-validated R-specs.

Enforcement:
- Reviewer Claude rejects Bullet directives that cite non-passing R-specs at §9 Gate intake
- Kimi pre-flight refuses to start code on Bullets whose cited R-specs do not pass the `zcbr-spec-validation` skill check
- Manus-authored R-specs are reference inputs only; canonical authoritative version is the Architect Claude version

```typescript
// At Bullet directive intake (Reviewer Claude side)
const rSpec = await loadRSpec(directive.rSpecPath);
if (rSpec.zcbrStatus !== 'PASSED') {
  return reject(directive, `R-spec ${directive.rSpecPath} has ZCBR Status: ${rSpec.zcbrStatus}`);
}
```

See: `/docs/governance/ZCBR_STANDARD.md` for the formal standard
See: zcbr-spec-validation skill — canonical spec stored in Drive governance folder (1C_LrFuq6yRE0DDPgCfnJTJcI44CvN6Ki), operationalized via upload to Portal product at ai.viyo.new for runtime loading via skills.pickForTask API. Not a repo file.

---

**End of code rules.**

For architectural reasoning behind these rules, see `/docs/governance/FOUNDATION_LOCK.md` and `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md`.
