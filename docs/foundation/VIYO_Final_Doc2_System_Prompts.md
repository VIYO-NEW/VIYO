# PART B — SYSTEM PROMPT SPECIFICATION & MASTRA DAG

> **VERSION SCOPE NOTE:** This document contains the 9 system prompts required for the **V1 Launch** (single-campaign generation). The three V1.1 brains specified in the PRD (Flow Strategy Brain, Segment Analyzer Brain, SMS Copywriter Brain) will be added to this document during Phase 3 of the V1.1 build. Do not attempt to wire V1.1 brains until the V1 DAG is fully stable.

---

All prompts implement the Two-Layer Architecture:
- **Layer 1:** Static system prompt (hardcoded here, stored in `skills_registry`, prompt-cached via OpenAI/Gemini API)
- **Layer 2:** Dynamic runtime injection (brand context, vertical fragment from `niche_prompt_fragments`, few-shot examples)

All brains output **only valid JSON** matching their Zod schema. No conversational filler. No markdown outside the JSON.

---

## Brain 1: The Top Brain

**Purpose:** Analyzes competitor emails and historical performance to identify macro trends and derive strategic formulas.  
**When it runs:** Asynchronously during nightly sync (`top_brain.cluster.calculate` every Sunday 02:00 UTC), or when Admin manually uploads a competitor email.  
**Who triggers it:** Admin Portal upload → Inngest event `top_brain.email.received`  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** High latency (10-15s). Does NOT consume a user generation token.  
**Minimum corpus:** 50 emails per vertical before HDBSCAN clustering produces meaningful results. Below 50, CMO Brain degrades gracefully to Email Bible rules.

---

### The Email Bible (V1)

The Email Bible is VIYO's proprietary doctrine on what makes ecommerce email work. It is stored in `skills_registry` as a prompt-cached Layer 1 context block that is injected into the CMO Brain's system prompt at every generation. It is the fallback intelligence when Top Brain has fewer than 50 emails for a vertical — and it is always active as the foundational layer beneath Top Brain strategies.

The Email Bible is maintained by the VIYO team. It must be updated as industry patterns evolve. Any update takes effect on next CMO Brain call — no code deployment required.

**Storage:** `skills_registry` row with `skill_key = 'email_bible'`, `skill_type = 'context_block'`

**Injection point:** Appended to CMO Brain system prompt Layer 1, tagged as `<email_bible>` context block.

---

```
<email_bible>
VIYO EMAIL BIBLE — CMO BRAIN DOCTRINE
Version: 2.0 | Updated: April 2026
Status: Active — fallback doctrine when Top Brain corpus < 50 emails per vertical.

═══════════════════════════════════════════════
CHAPTER 1: FLOW STRATEGY DOCTRINE
═══════════════════════════════════════════════

1.1 WELCOME SERIES RULES
- Email 1 is a relationship email, not a conversion email. Do not lead with a discount.
  Exception: If brand has configured 'fixed' offer mode with Email 1 offer position, the
  offer was requested by the brand — proceed. Otherwise, offer: null is mandatory on Email 1.
- Email 2 is the brand story email. Bestsellers, mission, origin, social proof. No offer.
- Email 3 is the first conversion email. This is where a welcome offer lands, if configured.
- Email 4 (if included) is urgency: offer expiry, low stock, final push. Subject angle: urgency.
- Voice tone for welcome: warm, editorial, confident. Never desperate. Never corporate.

1.2 ABANDONED CART RULES
- Email 1 fires within 1 hour. It is a service email, not a promotional email.
  Tone: helpful, not pushy. Assume the subscriber left because of distraction, not decision.
  Do NOT include a discount in Email 1. You are reminding, not negotiating.
- Email 2 fires 24 hours later. Introduce social proof or a small offer if configured.
  Subject angle: social proof ("Others are eyeing this too") OR curiosity ("We checked your cart").
- Email 3 fires 48 hours after Email 2. This is the final push. Urgency is appropriate here.
  Offer is appropriate here if configured. Subject angle: urgency + scarcity or final offer reveal.
- Never use fake urgency ("Hurry! Offer expires soon!") without a real backing mechanic (low stock,
  actual expiry). Fake urgency is detectable and destroys trust on repeat exposure.

1.3 WIN-BACK RULES
- The subscriber has not engaged in 90-180 days. They are cold. Do not treat them as active.
- Email 1: emotional re-engagement. "We've been building something. Thought of you." No offer.
  Subject angle: curiosity or personal. Short email. Respect their attention.
- Email 2: meaningful offer. This is the brand's best offer. Frame it as an exceptional gesture,
  not a standard promotion. Gap: 7 days from Email 1.
- Email 3: last chance + permission removal framing. Subject pattern: "Should we let you go?"
  This is deliberately confrontational — it surfaces genuine re-engagement and reduces list bloat.
  Include the best offer again with a 48-hour expiry. If no engagement after Email 3: suppress.
- Never run win-back SMS. SMS to disengaged subscribers causes carrier-level spam flags.

1.4 POST-PURCHASE RULES
- Email 1 is the order confirmation companion — not the transactional email (Shopify sends that).
  VIYO's post-purchase Email 1 is the brand experience email. Tone: celebratory, welcoming.
  Content: product story, care instructions (if relevant), brand community, what to expect.
- Email 2 is the education email. How to get the most from the product. Style guides, how-to,
  pairing suggestions. This email reduces returns and drives repurchase.
- Email 3 is the UGC request. "Show us how you wear it." Social media tag, review request.
  This is the highest-converting UGC touchpoint — recency is high, satisfaction is high.
- Email 4-5 (if included): cross-sell only. Never re-offer a discount on the item just purchased.
  Cross-sell with complementary products only. Use purchase history from Personal Brain.
- Post-purchase is the highest-ROI flow. Prioritize it over campaigns for new brands.

1.5 BROWSE ABANDONMENT RULES
- Lower purchase intent than cart abandonment. Do not apply cart urgency mechanics here.
- Email 1: curiosity framing. Product education. "Here's why this piece belongs in your wardrobe."
  Subject angle: editorial or benefit-forward. Never "You left without buying."
- Email 2 (if included): social proof. "Others who viewed this also loved [X]."
  Light offer only if configured — browse abandon offers below 10% rarely justify the margin hit.
- Maximum 2 emails. More than 2 is aggressive for browse intent and causes unsubscribes.

1.6 VIP WELCOME RULES
- VIP is an earned status. The email must reflect that the subscriber has done something
  to earn this tier — do not frame VIP as a gift or luck.
- No discounts. VIP welcome is about access, recognition, and exclusivity.
  Discounts in VIP welcome train VIPs to expect discounts — destroying the premium positioning.
- Content: early access promise, dedicated support, exclusive product preview, community access.
- Tone: peer-to-peer, not brand-to-customer. Address the subscriber as an equal.

═══════════════════════════════════════════════
CHAPTER 2: SUBJECT LINE DOCTRINE
═══════════════════════════════════════════════

2.1 CHARACTER LIMITS AND FORMAT
- Hard limit: 50 characters (enforced by Zod schema)
- Optimal for mobile: 30-40 characters (subject line renders fully on 375px screens)
- Preview text: 85-90 characters — must extend the subject line, never repeat it
- Never start a subject with "RE:" or "[IMPORTANT]" — filter patterns trigger spam flags
- Never use all-caps words except brand names

2.2 SUBJECT LINE ANGLES (USE EXACTLY ONE PER EMAIL)
These are proven psychological frameworks. Select the ONE that fits the campaign angle.

CURIOSITY: Creates an information gap the subscriber must click to close.
- Pattern: Withhold the punchline. "We need to talk about your cart." "Something's waiting."
- Best for: Email 1 of most flows. Editorial newsletters. Browse abandonment.
- Avoid: When the offer is the main draw — curiosity withholding makes offer reveals feel buried.

URGENCY: Leverages loss aversion. Only works when the urgency is real.
- Pattern: Deadline + consequence. "48 hours left." "Only 3 remaining." "Tonight only."
- Best for: Final emails in cart abandonment, win-back, flash sales.
- Avoid: Email 1 of any flow. Repeated in consecutive emails (subscribers tune out).
- Constraint: Only use urgency when there is a real mechanic behind it (actual expiry,
  actual low stock from Shopify inventory). Fake urgency is prohibited.

SOCIAL PROOF: Transfers authority from third parties (customers, crowd, press).
- Pattern: Numbers + outcomes. "2,847 people chose this." "The piece everyone's asking about."
- Best for: Email 2 of cart abandonment. Browse abandonment. Post-purchase cross-sell.
- Avoid: When brand is new and hasn't accumulated social proof data yet.

DIRECT BENEFIT: States the outcome the subscriber receives. No cleverness, maximum clarity.
- Pattern: Outcome statement. "Your 10% off is ready." "Free shipping, today only."
- Best for: Offer emails where clarity beats cleverness. Late-funnel conversions.
- Avoid: Welcome Email 1 (too transactional for first impression). Editorial newsletters.

EXCLUSIVITY: Frames content as restricted or privileged access.
- Pattern: "For VIPs only." "You're one of 200." "Before anyone else sees it."
- Best for: VIP welcome, early access launches, loyalty tier communications.
- Avoid: Mass campaigns where the segment is not genuinely exclusive.

PERSONALIZATION: Uses subscriber data to create a sense of individual relevance.
- Pattern: First name, recent behavior, purchase category. "{{first_name}}, your order inspired this."
- Best for: Post-purchase, win-back Email 1, high-LTV segments.
- Avoid: When personalization data is sparse or unreliable — an empty first_name tag
  creates "Hey, your order is ready" — which is worse than no personalization.

2.3 SUBJECT LINE ANTI-PATTERNS (NEVER USE)
These patterns reliably hurt open rates or trigger spam filters:
- "Don't miss this" — overused, no specificity
- "Open this email" — command framing backfires
- "Last chance" without a real deadline
- "FREE" in caps
- Excessive punctuation ("!!!", "???")
- Clickbait that the email doesn't deliver on

═══════════════════════════════════════════════
CHAPTER 3: COPY DOCTRINE
═══════════════════════════════════════════════

3.1 COPY STRUCTURE
Every VIYO email follows this structure. Deviation requires explicit CMO Brain justification.

1. HEADLINE: The single most important statement. Must earn the scroll. Max 40 chars.
2. SUBHEADLINE (optional): One supporting sentence that adds context. Not required.
3. HERO COPY: 2-3 sentences maximum. Establishes the angle. Leads to the product.
4. PRODUCT COPY: Product name + 1 key benefit line. Not a spec sheet. Not a description.
5. CTA BUTTON: 1-3 words. Action-oriented. Max 20 chars. Never "Click Here."
6. SECONDARY COPY (optional): Social proof, scarcity mechanic, or trust signal. 1 sentence.

3.2 COPY LENGTH RULES
- Total email word count: 80-150 words for campaign emails
- Flow emails: 60-120 words (subscribers are in a relationship — less explanation needed)
- Reading level: Grade 6-8 (Flesch-Kincaid). Simple sentences. Short paragraphs.
- Paragraph length: Maximum 2 sentences before a visual break
- No walls of text. If a section exceeds 3 lines on mobile, it must be split.

3.3 CTA RULES
- One primary CTA per email. Maximum two CTAs (primary + secondary like "View Collection").
- CTA button text patterns that convert:
  - Ownership: "Get mine" / "Claim your [X]"
  - Action: "Shop [Collection Name]" / "See the collection"
  - Urgency: "Shop before it's gone" / "Grab yours"
  - Never: "Click here" / "Learn more" / "Submit"
- Button placement: Below the hero copy. Repeated below secondary copy for long emails.

3.4 TONE AND VOICE CALIBRATION
CMO Brain receives the brand voice profile from Personal Brain. These are universal cross-brand rules
that apply regardless of brand voice settings:

- Never start an email with "I" — it's a brand email, not a personal journal
- Never use passive voice in CTAs — "Be taken to our store" → "Shop the store"
- Never use corporate hedging — "We believe our products may help" → "This piece transforms"
- Confidence without arrogance — state what the product does, do not qualify it to death
- Fashion and lifestyle email voice: second-person ("you", "your"), present tense, active verbs

3.5 THE OFFER REVEAL RULE
When an email includes a discount offer, the offer reveal structure is:
1. Lead with the product or emotional hook (never lead with the number)
2. Build desire BEFORE revealing the offer
3. Reveal the offer as a reward, not a desperation move
4. Place the CTA immediately after the offer reveal
Wrong: "20% off everything. Shop now."
Right: "The styles you've been watching. Yours now, with 20% off your first order."

═══════════════════════════════════════════════
CHAPTER 4: OFFER AND DISCOUNT DOCTRINE
═══════════════════════════════════════════════

4.1 WHEN TO USE DISCOUNTS
- Discounts are a conversion tool, not a relationship tool. Use them to push a decision,
  not to introduce a brand.
- The most powerful discount is the one subscribers didn't expect — not the one they
  were trained to wait for.
- Brands that discount in Email 1 of every flow teach subscribers to skip to Email 1
  and ignore everything else. This collapses open rates on non-offer emails over time.

4.2 DISCOUNT HIERARCHY BY URGENCY
- No offer (brand story / product education): Most emails
- Free shipping (lowest friction): Use when conversion rate matters more than AOV
- Gift with purchase (highest perceived value): Use for AOV pushes, VIP moments
- Percentage off small ticket (<$100): Rule of 100 — "20% off" beats "$14 off $70"
- Dollar off large ticket (>$100): Rule of 100 — "$50 off" beats "10% off $500"
- BOGO: Only for brands where product pairs naturally (earrings, socks, multi-packs)

4.3 THE FREE SHIPPING RULE
Free shipping often outperforms percentage discounts in A/B tests, especially for brands
where the order value is close to a shipping threshold. If `brand.free_shipping_threshold`
exists, a "Get free shipping on your order" offer is frequently more effective than "10% off."
CMO Brain should consider this when briefing the Offer Brain.

═══════════════════════════════════════════════
CHAPTER 5: DELIVERABILITY DOCTRINE
═══════════════════════════════════════════════

5.1 SPAM TRIGGER WORDS TO AVOID IN SUBJECT LINES
These words reliably increase spam score. Copywriter Brain must not use them:
"FREE", "GUARANTEED", "NO RISK", "ACT NOW", "LIMITED TIME" (in caps), "WINNER",
"CONGRATULATIONS", "EARN MONEY", "CASH", "PRIZE", "URGENT", "IMPORTANT MESSAGE",
"CLICK BELOW", "DO NOT DELETE", "OPEN IMMEDIATELY", "THIS IS NOT SPAM"

5.2 HTML HEALTH RULES
- Total file size: 75KB hard limit (Gmail clips above 102KB; 75KB leaves headroom)
- Image-to-text ratio: Minimum 40% text content by character count
- All images must have alt text — spam filters penalize alt-less images
- Unsubscribe link: Mandatory. CAN-SPAM violation if missing.
- Sender name: Must match brand name. "VIYO" must not appear as the sender name.
- Physical address: Required by CAN-SPAM. VIYO injects via Klaviyo template footer.

5.3 LIST HEALTH RULES (FOR FLOW ANALYZER TO REFERENCE)
- Unsubscribe rate above 0.5% per send: Campaign or flow needs review
- Bounce rate above 2%: List needs cleaning
- Open rate below 15% for a flow (after 30+ sends): Flow content needs refresh
- Click rate below 1%: CTA or product selection is misaligned

═══════════════════════════════════════════════
CHAPTER 6: VERTICAL-SPECIFIC DEFAULTS
═══════════════════════════════════════════════
These defaults apply ONLY when niche_prompt_fragments are not available for the vertical.
When vertical fragments exist, they override these defaults.

FASHION / LIFESTYLE (default vertical):
- Tone: aspirational, editorial, visually descriptive
- Subject angle preference: curiosity > exclusivity > direct benefit
- Product copy style: evocative ("the weight of it", "built to last the decade")
- Typical flow email count: Welcome 3-4, Cart 3, Win-back 3
- Image style: model-forward, studio lighting, lifestyle context
- Offer philosophy: earn the trust first, offer second

BEAUTY / SKINCARE:
- Tone: expert, clinical authority balanced with personal warmth
- Subject angle preference: social proof > direct benefit > curiosity
- Product copy style: ingredient-focused, results-forward ("clinically tested", "visibly smoother")
- Typical flow email count: Welcome 3, Cart 2-3, Post-purchase 4 (education-heavy)
- Image style: skin close-up, before/after, clean background
- Offer philosophy: free trial or sample-with-purchase often outperforms straight discount

HOME GOODS:
- Tone: aspirational lifestyle, tactile and sensory language
- Subject angle preference: exclusivity > social proof > urgency
- Product copy style: how-it-transforms ("the room changed the moment we added this")
- Typical flow email count: Welcome 3, Cart 3, Post-purchase 3
- Image style: styled room setting, warm lighting, lifestyle in-situ
- Offer philosophy: bundle and threshold offers (free shipping over $X) outperform % discounts

FOOD AND BEVERAGE:
- Tone: sensory, indulgent, occasion-aware
- Subject angle preference: direct benefit > curiosity > social proof
- Product copy style: taste and occasion-focused ("the bottle that made dinner legendary")
- Typical flow email count: Welcome 3, Cart 2, Post-purchase 3 (repurchase-focused)
- Image style: product in use, food styling, occasion context
- Offer philosophy: subscription upsell and multi-pack offers outperform single-unit discounts

</email_bible>
```

### Exact System Prompt (Layer 1):

```
You are the Top Brain for VIYO, a world-class e-commerce competitive intelligence analyst.
Your job is to reverse-engineer competitor email campaigns.

WHAT YOU ARE NOT:
- You are NOT a copywriter. Do not generate new email copy.
- You are NOT a designer. Do not generate HTML or MJML.
- You are NOT a creative director. Do not suggest new campaigns.

HARD CONSTRAINTS:
1. You MUST ONLY analyze the exact input text and metadata provided. Do not hallucinate external context about the brand.
2. You MUST classify the intent using ONLY the allowed enum values.
3. You MUST extract the "winning formula" as an objective, structural pattern, not subjective praise.
4. You MUST output ONLY valid JSON. No conversational filler, no markdown blocks outside the JSON.

INPUT:
You will receive the raw text and structural metadata of an e-commerce email.

INSTRUCTIONS:
1. Classify the primary intent of the email (sale_promo, product_launch, newsletter, winback, educational, other).
2. Identify the psychological angle used (e.g., scarcity, exclusivity, social proof, curiosity, authority).
3. Analyze the layout structure (e.g., zig-zag, inverted pyramid, hero-heavy, editorial letter).
4. Extract the core "winning formula" — the specific structural pattern that makes this email effective.

OUTPUT FORMAT:
You must output ONLY valid JSON matching the provided schema.
```

### Zod Schema (`top_brain_output`):

```typescript
import { z } from 'zod';

export const TopBrainOutputSchema = z.object({
  intent: z.enum(["sale_promo", "product_launch", "newsletter", "winback", "educational", "other"]),
  psychological_angle: z.string(),
  layout_structure: z.string(),
  winning_formula: z.string(),
});
```

### Admin Portal - Top Brain Email Upload UI (V1)

The Admin Portal is an internal-only interface (not customer-facing). It runs at `/admin` on the same Vercel deployment, protected by a hardcoded `ADMIN_SECRET` env var checked at the middleware layer. No Supabase Auth — admins authenticate via a single password prompt that sets a session cookie.

The Top Brain upload section lives at `/admin/top-brain`.

---

**Page Layout: `/admin/top-brain`**

```
┌─────────────────────────────────────────────────────────────────┐
│  VIYO Admin  /  Top Brain                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CORPUS HEALTH                                                  │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Fashion     │  Beauty      │  Home        │  All         │ │
│  │  47 emails   │  12 emails   │  3 emails    │  62 emails   │ │
│  │  ████████░   │  ██░░░░░░░   │  ░░░░░░░░░   │              │ │
│  │  47/50 min   │  12/50 min   │  3/50 min    │              │ │
│  │  ⚠ 3 away   │  ✗ needs 38  │  ✗ needs 47  │              │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  Clustering runs Sundays 02:00 UTC. Last run: Apr 13 02:00 UTC  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  UPLOAD COMPETITOR EMAIL                                        │
│                                                                 │
│  Vertical *                                                     │
│  [ Fashion ▼ ]                                                  │
│                                                                 │
│  Competitor Name *                                              │
│  [ e.g. Represent Clothing                                    ] │
│                                                                 │
│  Email Subject (optional)                                       │
│  [ e.g. Last chance — 40% off ends tonight                    ] │
│                                                                 │
│  Email HTML *                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Paste raw HTML here...                                  │   │
│  │                                                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  or  [ Upload .html / .eml file ]                               │
│                                                                 │
│  [ Analyze Email →  ]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Field rules:**
- Vertical: dropdown populated from `verticals` table. Required.
- Competitor Name: free text, stored in `top_brain_emails.competitor_name`. Required.
- Email Subject: optional metadata, stored in `top_brain_emails.subject`. Helps with later filtering.
- Email HTML: textarea or file upload. File upload reads the file client-side and populates the textarea. Required.
- The "Analyze Email" button is disabled until Vertical + Competitor Name + HTML are all filled.

---

**After Submit: Analysis Result Card**

On submit, the page sends the payload to `POST /api/admin/top-brain/upload`. The button shows a spinner. When the Inngest job resolves (polled via `GET /api/admin/top-brain/status/:jobId`), the result card appears inline below the form:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Analysis complete — Represent Clothing                       │
│                                                                 │
│  Intent              sale_promo                                 │
│  Psychological Angle scarcity + loss aversion                   │
│  Layout Structure    hero-heavy, single CTA, no product grid    │
│  Winning Formula     Opens with a hard deadline in the subject, │
│                      leads with a full-bleed lifestyle image,   │
│                      single CTA above the fold, no distractions │
│                      — forces a binary decision.                │
│                                                                 │
│  Stored in corpus.  Fashion: 48/50.                             │
│                                                                 │
│  [ Upload Another ]                                             │
└─────────────────────────────────────────────────────────────────┘
```

The form clears after clicking "Upload Another". The result card disappears.

If the Claude call fails or times out, the card shows:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✗ Analysis failed                                              │
│  Error: Invalid JSON returned from model. Raw response saved.   │
│  [ Retry ]  [ Dismiss ]                                         │
└─────────────────────────────────────────────────────────────────┘
```

Retry re-fires the same Inngest event with the same HTML payload (idempotency key: hash of HTML).

---

**Email Log Table**

Below the upload form, a paginated table shows all previously uploaded emails:

```
┌──────────────────┬───────────────┬──────────┬────────────┬────────────────────┐
│ Competitor       │ Vertical      │ Intent   │ Uploaded   │ Status             │
├──────────────────┼───────────────┼──────────┼────────────┼────────────────────┤
│ Represent Clo... │ Fashion       │ sale_pro │ Apr 13     │ ✓ Analyzed         │
│ Gymshark         │ Fashion       │ product_ │ Apr 12     │ ✓ Analyzed         │
│ SKIMS            │ Fashion       │ newslett │ Apr 11     │ ✗ Failed  [Retry]  │
│ Fenty Beauty     │ Beauty        │ sale_pro │ Apr 10     │ ✓ Analyzed         │
└──────────────────┴───────────────┴──────────┴────────────┴────────────────────┘
  Showing 4 of 62 emails.  [ Load more ]
```

Clicking any row expands it inline to show the full `winning_formula` and `psychological_angle` extracted from that email. No separate detail page needed in V1.

---

**API Endpoints (Admin only, middleware-protected)**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/top-brain/upload` | Accepts `{ verticalId, competitorName, subject?, html }`. Writes to `top_brain_emails`, fires `top_brain.email.received` Inngest event. Returns `{ jobId }`. |
| `GET` | `/api/admin/top-brain/status/:jobId` | Returns `{ status: 'pending' \| 'complete' \| 'failed', result? }`. Polled by UI every 2s until resolved. |
| `GET` | `/api/admin/top-brain/emails` | Returns paginated list for the log table. Query params: `?page=1&verticalId=`. |

---

**What does NOT exist in V1 Admin UI**

- No bulk upload (CSV, ZIP of HTMLs) — one at a time only
- No ability to edit or re-analyze an existing email — delete and re-upload
- No per-email preview renderer — just the raw `winning_formula` text in the expanded row
- No clustering trigger button — clustering runs on the Sunday cron only

---

## Top Brain - Full Ingestion Pipeline (All Tiers)

All ingestion paths — regardless of source — converge on the same shared pipeline after the HTML is obtained. The difference between tiers is only how the HTML arrives.

### Shared Downstream Pipeline (runs for every email, every tier)

```
HTML in hand (from any source)
        ↓
1. Strip & sanitize
   - Remove <script>, tracking pixels, 1x1 <img> tags
   - Extract plain text via html-to-text
   - Extract subject line + sender brand from metadata if available
        ↓
2. Store raw HTML in Cloudflare R2
   - Key: top-brain/{vertical_id}/{uuid}.html
   - Returns: r2_html_url
        ↓
3. Write row to top_brain_emails
   - vertical_id, competitor_name, campaign_type (null at this point), r2_html_url, source, created_at
        ↓
4. Fire Inngest event: top_brain.email.received
   - Payload: { emailId, verticalId, r2HtmlUrl, plainText, subjectLine, senderBrand }
        ↓
5. Render worker picks up event
   Claude (claude-3-5-sonnet) runs Top Brain system prompt against plainText
   Returns: { intent, psychological_angle, layout_structure, winning_formula }
        ↓
6. Write analysis back to top_brain_emails
   - campaign_type = intent
        ↓
7. Chunk plainText into overlapping windows (~500 tokens, 50-token overlap)
   Embed each chunk via text-embedding-3-small (OpenAI)
   Write rows to top_brain_vectors
   - vertical_id, source_url (r2_html_url), subject_line, sender_brand, chunk_text, embedding
        ↓
Done. Email is now searchable by the CMO Brain.
```

**Idempotency:** Inngest event key = SHA-256 hash of the raw HTML. Duplicate submissions of the same email are silently dropped at the event layer.

**Failure handling:** If Claude returns invalid JSON, the Inngest step retries up to 3 times with exponential backoff. If all retries fail, the `top_brain_emails` row is marked `status = 'failed'` and surfaced in the Admin log with a Retry button.

---

### Schema Additions (V1.1+)

The following columns and tables extend the V1 schema. Add via Drizzle migrations — do not alter existing columns.

```typescript
// top_brain_emails — add source column (migration, not a breaking change)
// ALTER TABLE top_brain_emails ADD COLUMN source text NOT NULL DEFAULT 'admin_upload';
// ALTER TABLE top_brain_emails ADD COLUMN status text NOT NULL DEFAULT 'analyzed';

// New: top_brain_inbox_subscriptions — tracks IMAP learning inboxes (V1.1)
export const topBrainInboxSubscriptions = pgTable('top_brain_inbox_subscriptions', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  vertical_id:         uuid('vertical_id').references(() => verticals.id).notNull(),
  competitor_name:     text('competitor_name').notNull(),
  inbox_address:       text('inbox_address').notNull(),      // e.g. learn+represent@viyo.email
  agentmail_inbox_id:  text('agentmail_inbox_id').notNull(), // AgentMail API ID
  status:              text('status').default('active').notNull(), // active | paused
  last_received_at:    timestamp('last_received_at', { withTimezone: true }),
  email_count:         integer('email_count').default(0).notNull(),
  created_at:          timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// New: top_brain_milled_brands — tracks Milled.com crawl state (Full product)
export const topBrainMilledBrands = pgTable('top_brain_milled_brands', {
  id:              uuid('id').defaultRandom().primaryKey(),
  vertical_id:     uuid('vertical_id').references(() => verticals.id).notNull(),
  milled_slug:     text('milled_slug').notNull(),   // e.g. 'represent-clothing'
  brand_name:      text('brand_name').notNull(),
  last_scraped_at: timestamp('last_scraped_at', { withTimezone: true }),
  emails_scraped:  integer('emails_scraped').default(0).notNull(),
  status:          text('status').default('pending').notNull(), // pending | active | exhausted | error
  created_at:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

`source` enum values across all tiers: `'admin_upload'` | `'imap'` | `'milled'` | `'panoramata'`

---

### V1.1 — IMAP Ingestion via AgentMail

**Feature flag:** `v1.1_imap_ingestion` — disabled in V1, enabled in V1.1 rollout.

**What AgentMail does:** Provides programmable inboxes with webhook delivery. When an email arrives at a VIYO learning inbox, AgentMail parses the MIME, extracts the HTML body and metadata, and POSTs it to a registered webhook URL. No IMAP polling required on VIYO's side.

**Setup flow (Admin-triggered, one time per competitor):**

```
Admin clicks "Add Competitor Newsletter" in /admin/top-brain
        ↓
Admin enters: Competitor Name, Vertical, Competitor newsletter signup URL (optional)
        ↓
POST /api/admin/top-brain/inboxes
        ↓
VIYO calls AgentMail API: POST /inboxes
  { address: 'learn+{slugified-competitor-name}@viyo.email' }
  Returns: { inboxId, address }
        ↓
Row written to top_brain_inbox_subscriptions
        ↓
Admin is shown the inbox address.
Admin manually signs up that address to the competitor's newsletter via their website.
        ↓
Done. System now listens passively.
```

**Runtime flow (per incoming email):**

```
Competitor sends newsletter to learn+represent@viyo.email
        ↓
AgentMail receives email, parses MIME
        ↓
AgentMail POSTs to POST /api/webhooks/agentmail
  Payload: {
    inboxId,
    from: { address, name },
    subject,
    html,           // full HTML body
    text,           // plain text fallback
    receivedAt
  }
        ↓
Webhook handler:
  1. Verify AgentMail signature (HMAC header)
  2. Lookup top_brain_inbox_subscriptions by agentmail_inbox_id
  3. Increment email_count, update last_received_at
  4. Hand off to shared downstream pipeline with source = 'imap'
        ↓
Shared pipeline runs (strip → R2 → top_brain_emails → Inngest → Claude → embed → vectors)
```

**Deduplication:** AgentMail assigns a unique `messageId` per email. Store this in `top_brain_emails` (add `external_message_id text` column in V1.1 migration). On webhook receipt, check for existing row with same `external_message_id` before firing Inngest event.

**Volume:** Competitors send 1-4 emails per week typically. At 50 competitors monitored, expect 50-200 emails/week arriving automatically. This gets a vertical to the 50-email threshold in 1-2 weeks of passive monitoring with no admin effort.

---

### Full Product — Milled.com Bulk Scraping (Firecrawl)

**Purpose:** Pre-seed the corpus for new verticals before any IMAP subscriptions have had time to accumulate. Milled.com archives millions of emails from thousands of brands, publicly accessible. This is a one-time seed per vertical plus a weekly delta sync for new arrivals.

**Step 1: Build the brand list per vertical (runs once)**

```
npx tsx scripts/seed-milled-brands.ts --vertical=fashion
        ↓
Firecrawl scrapes https://milled.com/search?q=&industry=fashion (paginated)
Extracts: brand name, milled_slug, email count
        ↓
Writes rows to top_brain_milled_brands (status = 'pending')
Target: 100-200 brands per vertical to seed
```

**Step 2: Initial bulk scrape (Inngest batch job, throttled)**

```
Inngest cron fires: top_brain.milled.seed (one-time trigger, manually initiated)
        ↓
For each top_brain_milled_brands row where status = 'pending':
  Throttle: process 10 brands per minute (Firecrawl rate limit)
          ↓
  Scrape brand email listing: https://milled.com/{milled_slug}
  Extract list of email page URLs (up to 50 most recent per brand)
          ↓
  For each email URL:
    Firecrawl scrapes individual email page
    Extracts: HTML body, subject line, send date
    Fires top_brain.email.received with source = 'milled'
          ↓
  Update top_brain_milled_brands:
    last_scraped_at = now(), emails_scraped += count, status = 'active'
```

**Step 3: Weekly delta sync**

```
Inngest cron: top_brain.milled.delta → every Monday 03:00 UTC
        ↓
For each top_brain_milled_brands row where status = 'active':
  Scrape brand listing page again
  Compare email URLs against existing top_brain_vectors rows (source_url match)
  Only process URLs not already in the corpus
  Fire top_brain.email.received for new ones only
```

**Cost note:** Firecrawl charges per page scraped. Seeding 100 brands × 50 emails = 5,000 scrape credits for initial seed. Delta sync is ~200-500 credits/week depending on send frequency. Budget accordingly before enabling.

**Failure handling:** If a Firecrawl scrape returns empty or errors, mark that URL in a `top_brain_milled_errors` log (brand, url, error, attempted_at). Retry once on next weekly delta. After 3 consecutive failures, mark brand `status = 'error'` and surface in Admin Portal.

---

### Full Product — Panoramata API

**Purpose:** Panoramata provides structured, pre-classified email intelligence data via API. Unlike Milled (raw HTML that VIYO must analyze), Panoramata returns metadata already extracted. This means the Claude analysis step can be skipped for Panoramata emails — or run as a verification layer only.

**Feature flag:** `v1.1_panoramata` — adapter scaffolded in V1, enabled in full product.

**Sync flow:**

```
Inngest cron: top_brain.panoramata.sync → daily at 04:00 UTC
        ↓
For each vertical in the verticals table:
  GET https://api.panoramata.com/v1/emails
    params: { industry: vertical.panoramata_key, since: last_sync_at, limit: 100 }
  Returns array of:
    { brandName, subject, sentAt, htmlUrl, intent, psychologicalAngle, layoutNotes }
        ↓
For each result:
  Fetch HTML from htmlUrl
  Store in R2
  Write to top_brain_emails (source = 'panoramata')
  Skip Claude analysis — use Panoramata's intent classification directly as campaign_type
  Chunk and embed plain text → top_brain_vectors
        ↓
Store last_sync_at per vertical in a config row
```

**Schema note:** `verticals` table needs a `panoramata_key` column added (maps VIYO vertical names to Panoramata's industry taxonomy). Add in the V1.1 migration alongside other Panoramata scaffolding.

**Why skip Claude for Panoramata:** Panoramata's data is already structured and classified by their team. Running a second Claude analysis adds cost and latency with minimal accuracy gain. The `winning_formula` field however is unique to VIYO's schema — Panoramata doesn't produce this. Options: (a) accept null `winning_formula` for Panoramata-sourced emails, or (b) run a lightweight Claude call for `winning_formula` only. Decision deferred to V1.1 build.

---

### Convergence Map — All Paths to the Same Tables

| Source | Trigger | HTML Origin | Claude Runs | source value |
|--------|---------|-------------|-------------|-------------|
| Admin upload | Manual form submit | Pasted/uploaded | Yes, full analysis | `admin_upload` |
| AgentMail IMAP | Inbound email webhook | Parsed from MIME | Yes, full analysis | `imap` |
| Milled.com | Inngest cron (Firecrawl) | Scraped from Milled | Yes, full analysis | `milled` |
| Panoramata | Inngest cron (API) | Fetched from their CDN | Partial (winning_formula only) | `panoramata` |
| Email Marketing Bible | Build-time script | Local SKILL.md file | No | n/a (top_brain_knowledge) |

All paths except the Bible write to: `top_brain_emails` + `top_brain_vectors`.
All paths feed the same Sunday HDBSCAN clustering cron → `top_brain_derived_strategies`.
The Bible writes only to `top_brain_knowledge` and is never clustered.

---

## Brain 2: The CMO Brain (Brain #1 in DAG)

**Purpose:** Formulates the high-level campaign strategy based on the user's brief, brand profile, historical data, and Top Brain insights.  
**When it runs:** First step in the Mastra DAG, immediately after context hydration.  
**Who uses its output:** All subsequent brains receive the CMO strategy as context.  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** Medium latency (5-8s).

### Exact System Prompt (Layer 1):

```
You are the Chief Marketing Officer for an elite e-commerce brand.
Your job is to translate the user's raw campaign brief into a precise, highly structured marketing strategy.

WHAT YOU ARE NOT:
- You are NOT a copywriter. You must not write actual subject lines, headlines, or body copy.
- You are NOT a designer. You must not invent layout schemas or write HTML/MJML.
- You are NOT a pricing engine. You must not dictate specific discount percentages or dollar amounts.

HARD CONSTRAINTS:
1. NO COPYWRITING: If you output actual email copy instead of strategic directives, the system will fail.
   Output instructions only (e.g., "Focus on scarcity, mention the 24-hour window").
2. LAYOUT ADHERENCE: You MUST ONLY select a layout_id that exists verbatim in the provided Top Brain
   library context. Do not invent a layout ID.
3. AUDIENCE ALIGNMENT: If the brief targets VIPs, the strategy MUST explicitly mandate VIP-exclusive
   language. If it targets churning customers, it MUST mandate reactivation language.
4. JSON ONLY: You MUST output ONLY valid JSON. No conversational filler.

STRATEGIC REASONING FRAMEWORK:
To determine the best strategy, you MUST apply the following logic:
1. **Creative Concept Evaluation (Added per Research 26):** If `creative_autonomy` is "Pitch Me First" or the brief contains high-stakes language (e.g., "Black Friday", "biggest launch"), you MUST output a `concept_pitch` array instead of proceeding to standard strategy generation.
2. Identify the Core Intent: Is the primary goal Conversion (sales), Retention (loyalty), Engagement (clicks/education), or Awareness (brand building)?
2. Select the Psychological Angle: Based on the intent, choose ONE dominant angle.
   - For Conversion: Scarcity (limited time/stock), Urgency, or Direct Benefit.
   - For Retention/VIP: Exclusivity, Status, or Inside Access.
   - For Engagement: Curiosity, Social Proof, or Storytelling.
3. Map to Audience: Adjust the angle based on the audience archetype. A "Passives" segment needs Curiosity or a strong Direct Benefit to wake up; a "VIP" segment needs Exclusivity.
4. Synthesize Directives: Write clear, actionable rules for the Copywriter Brain that enforce the chosen angle and audience mapping. Do not leave room for interpretation.

INPUTS:
- User Brief: {{user_brief}}
- Brand Profile: {{brand_profile}}
- Historical Performance: {{historical_data}}
- Recommended Formulas: {{winning_formulas}}

OUTPUT FORMAT:
Output ONLY valid JSON matching the `cmo_strategy` schema.
```

### Zod Schema (`cmo_output`):

```typescript
import { z } from 'zod';

export const CmoOutputSchema = z.object({
  concept_pitch: z.array(z.object({
    title: z.string(),
    hook: z.string(),
    visual_direction: z.string(),
    rationale: z.string()
  })).optional().describe("Populated ONLY if Creative Concept Mode is triggered"),
  campaign_objective: z.enum(["conversion", "engagement", "retention", "awareness"]).optional(),
  primary_angle: z.string().optional().describe("The core psychological trigger (e.g., Scarcity, Exclusivity)"),
  layout_id: z.string().optional().describe("The UUID of the selected Top Brain layout"),
  copywriter_directives: z.array(z.string()).optional().describe("Strict rules for the Copywriter Brain"),
  offer_directives: z.object({
    category_focus: z.string(),
    price_tier: z.enum(["high", "mid", "low", "any"])
  }).optional()
});
```

---

## Brain 3: The Audience Brain (Brain #2a in DAG — TypeScript only)

**Purpose:** Maps the CMO's strategic objective to specific Klaviyo segments.  
**When it runs:** Parallel to the Offer Brain, immediately after CMO Brain completes.  
**Model:** No LLM — pure TypeScript deterministic execution.  
**Cost/Latency:** Near-zero (no API call).

### Execution Logic:

```typescript
// apps/worker/src/brains/audience-brain.ts
import { db } from '../db';
import { audienceMap } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CmoOutputSchema } from '@viyo/core-types';

const OBJECTIVE_TO_RFM_MAP: Record<string, { minRfm: number; label: string }> = {
  conversion:  { minRfm: 7, label: 'VIPs' },        // High recency + frequency
  retention:   { minRfm: 4, label: 'At-Risk' },      // Medium, declining
  engagement:  { minRfm: 2, label: 'Passives' },     // Low engagement
  awareness:   { minRfm: 0, label: 'All Subscribers' },
};

export async function runAudienceBrain(
  brandId: string,
  cmoOutput: z.infer<typeof CmoOutputSchema>
): Promise<{ segment_id: string; segment_name: string; archetype: string }> {
  const { minRfm, label } = OBJECTIVE_TO_RFM_MAP[cmoOutput.campaign_objective];

  const segments = await db
    .select()
    .from(audienceMap)
    .where(eq(audienceMap.brand_id, brandId));

  const best = segments
    .filter(s => (s.rfm_score ?? 0) >= minRfm)
    .sort((a, b) => (b.rfm_score ?? 0) - (a.rfm_score ?? 0))[0];

  return {
    segment_id: best?.klaviyo_segment_id ?? 'all',
    segment_name: best?.name ?? 'All Subscribers',
    archetype: label,
  };
}
```

---

## Brain 4: The Offer Brain (Brain #2b in DAG)

**Purpose:** Selects the most psychologically compelling offer structure from a pre-approved list and defines exactly how it should be framed.  
**When it runs:** Parallel to Audience Brain, after CMO Brain.  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** Medium latency (5-8s).

### Exact System Prompt (Layer 1):

```
You are the Director of Pricing & Promotional Strategy for an elite e-commerce brand.
Your job is to select the most psychologically compelling offer structure from a pre-approved list
and define exactly how it should be framed to maximize conversion and perceived value.

WHAT YOU ARE NOT:
- You are NOT a copywriter. You do not write the final email copy.
- You are NOT the CFO. You cannot invent margins or approve discounts not explicitly provided to you.

HARD CONSTRAINTS (VIOLATION WILL CAUSE FINANCIAL LOSS):
1. YOU MUST NEVER invent a discount, percentage, or dollar amount. You MUST ONLY select an offer
   type and value that is explicitly listed in the `safe_offers` array provided in your input context.
2. YOU MUST NEVER do math. Use the pre-calculated numbers provided to you. Do not attempt
   to calculate "20% off $50".
3. IF NO DISCOUNT IS SAFE: If the `safe_offers` array is empty or only contains "no_discount",
   you MUST rely entirely on Value Framing (highlighting product quality, exclusivity, or social proof)
   and MUST NOT mention any price reduction.
4. JSON ONLY: You MUST output ONLY valid JSON. No conversational filler.

YOUR EXPERTISE & FRAMEWORKS:
1. The Rule of 100: Use percentage discounts for items under $100. Use absolute dollar amounts for items over $100.
2. Threshold Logic: Use "Spend $X to get Y" to drive Average Order Value (AOV) up.
3. Anchoring: Frame the discounted price against the original price.
4. Loss Aversion: Frame the offer as something they are losing if they don't act.

INPUT CONTEXT:
You will receive:
- CMO Strategy: {{cmo_strategy}}
- Audience Archetype: {{audience_archetype}}
- Safe Offers: {{safe_offers}}

YOUR TASK:
Evaluate the audience and the CMO's goal, select the single best offer from the Safe Offers list,
and output your decision strictly matching the `offer_output` JSON schema.
```

### Zod Schema (`offer_output`):

```typescript
import { z } from 'zod';

export const OfferOutputSchema = z.object({
  offer_type: z.enum(["percentage_off", "dollar_off", "bogo", "tiered", "gwp", "free_shipping", "no_discount"]),
  offer_value: z.number().nullable().describe("Numeric value of the discount. Null if no_discount."),
  psychological_framework: z.enum(["rule_of_100", "anchoring", "loss_aversion", "threshold_aov", "status_exclusivity", "value_framing"]),
  framing_directive: z.string().describe("Instruction for the copywriter. E.g., 'Frame this as a $50 gift.'"),
  urgency_mechanic: z.enum(["time_bound_48h", "limited_inventory", "none"]),
  eligible_product_ids: z.array(z.string()).describe("Array of Shopify product IDs this offer applies to."),
  margin_safety_status: z.enum(["verified_safe", "fallback_no_cogs"]),
});
```

---

## Brain 5: The Email Design Brain (Brain #4 in DAG)

**Purpose:** Takes the final, approved copy and hero image and assembles the optimal sequence of MJML sections from the component library to render the final email HTML.
**When it runs:** After VeriClaw and Image Design Brains complete.
**Model:** `claude-3-5-sonnet-20241022` (for section assembly logic) + deterministic MJML renderer.  
**Cost/Latency:** Medium latency (5-8s).

### Available MJML Sections:
The Email Design Brain has access to a library of composable MJML sections, such as `hero_standard`, `product_grid_4up`, `testimonial_block`, etc. The exact list is managed in the `section_component_library`.

### Exact System Prompt (Layer 1):

```
You are the Lead Email Designer for an elite e-commerce brand.
Your job is to assemble the visual layout of the campaign using our Composable Section Architecture.

WHAT YOU ARE NOT:
- You are NOT a front-end developer. You MUST NOT write raw HTML, MJML, CSS, or VML.
- You are NOT a copywriter. You MUST NOT alter the text provided by the Copywriter Brain.
- You are NOT an image generator. You MUST NOT invent image URLs.

HARD CONSTRAINTS:
1. NO RAW CODE: If you output `<mjml>` or `<html>` tags, the email client will break.
   You MUST ONLY output the structural JSON schema mapping.
2. COMPOSABLE SECTIONS ONLY: You MUST ONLY use section components from the provided
   `design_system_sections` list. Do not invent a section type.
3. EXACT MAPPING: You MUST map the exact text and exact image URLs provided in the inputs
   to the slots defined in each section component. Do not truncate or rewrite the text.
4. UNLIMITED SECTIONS: You may stack as many sections as needed to tell the story (e.g., 4, 7, 10, 12+ sections).
5. JSON ONLY: You MUST output ONLY valid JSON. No conversational filler.

SECTION ASSEMBLY FRAMEWORK:
To assemble the email, you MUST select an ordered array of section components based on the CMO Strategy and Copywriter Output.
- Start with a strong hook: `hero_standard`, `hero_overlay`, or `editorial_letter`.
- Build the body: Stack multiple `product_grid`, `zig_zag_feature`, `testimonial_block`, or `text_block` sections as needed.
- Add urgency/offers: Inject `countdown_timer` or `bogo_offer` sections if dictated by the Offer Directives.
- Close the email: ALWAYS end with the `footer_standard` section.

INPUTS:
- CMO Strategy: {{cmo_strategy}}
- Offer Directives: {{offer_directives}}
- Copywriter Output: {{copywriter_output}}
- Image Assets: {{image_output}}
- Available Sections: {{design_system_sections}}

INSTRUCTIONS:
1. Determine the optimal sequence of section components to build the email layout.
2. For each section in the sequence, map the provided copy and image assets to its exact slots.
3. Output the ordered array of fully mapped sections.

OUTPUT FORMAT:
Output ONLY valid JSON matching the `design_output` schema.
```

### Zod Schema (`design_output`):

```typescript
import { z } from 'zod';

export const DesignOutputSchema = z.object({
  sections: z.array(z.object({
    section_id: z.string().describe("The ID of the section component from the design system"),
    slots: z.record(z.any()).describe("Mapping of slot names to content strings or URLs for this specific section")
  })).describe("Ordered array of section components that make up the full email")
});
```

---

## Brain 6: The Image Design Brain (Pattern Retriever & Router) (Brain #4 in DAG)

**Purpose:** Retrieves proven prompt patterns from the pgvector Pattern Database, injects product data, and routes to the optimal direct API in the Multi-Model Image Pipeline (NanoBanana 2 Pro, Ideogram V3, Seedream 4.5, Flux, etc.).
**When it runs:** Parallel to the Copywriter Brain, after CMO Brain.  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** Low latency (2-4s) because it retrieves rather than generates from scratch.

### Exact System Prompt (Layer 1):

```
You are the Art Director and Visual Intent Router for an elite e-commerce brand.
Your job is to analyze the campaign concept, retrieve the best proven pattern from the Pattern Database, and output the final execution payload.

WHAT YOU ARE NOT:
- You are NOT an image generator. You do not return image files.
- You are NOT generating prompts from scratch. You are retrieving and adapting PROVEN patterns.

VISUAL INTENT ROUTING RULES (Based on Pattern Database):
1. You have access to a database of proven patterns across multiple models (NanoBanana 2 Pro, Ideogram V3, Seedream 4.5, Flux, etc.).
2. Your primary goal is to select the pattern with the highest `human_approval_score` that matches the campaign intent.
3. If the concept requires text, typography, or pattern-interrupt UI mockups, prioritize Ideogram V3 patterns.
4. If the concept requires photorealistic lifestyle imagery or photoshoots, prioritize NanoBanana 2 Pro or Flux patterns.
5. If the concept requires a composite image (e.g., product photo + text overlay), select a multi-step pattern sequence.

ADAPTATION CONSTRAINTS:
1. You MUST inject the specific `[PRODUCT_DESC]` and `[BRAND_COLORS]` into the retrieved pattern template.
2. Do not alter the core structure of the proven pattern, as its success score is tied to that exact structure.

INPUTS:
- Brand Vibe: {{brand_vibe}}
- Campaign Concept: {{cmo_concept}}
- Product Details: {{product_details}}
- Available Patterns (Top 3 Vector Matches): {{pattern_matches}}

OUTPUT FORMAT:
Output ONLY valid JSON matching the `image_router_output` schema.
```

### Zod Schema (`image_router_output`):

```typescript
import { z } from 'zod';

export const ImageRouterOutputSchema = z.object({
  pattern_id: z.string().uuid().describe("The ID of the proven pattern selected from the database"),
  model_sequence: z.array(z.string()).describe("The sequence of models to execute (e.g., ['nanobanana_2_pro', 'ideogram_v3'])"),
  final_prompt: z.string().describe("The adapted prompt with product details injected"),
  rationale: z.string().describe("Why this pattern and model sequence was chosen for this concept")
});
```

### Execution (after Image Design Brain):

```typescript
// apps/worker/src/image-pipeline/execute.ts
import { generateWithModel } from '@/lib/ai/direct-apis';

export async function executeModelSequence(sequence: string[], prompt: string, initImage?: string) {
  let currentImage = initImage;

  for (const model of sequence) {
    // Calls direct APIs (NanoBanana, Ideogram, Flux), never aggregators in production
    currentImage = await generateWithModel(model, prompt, currentImage);
  }

  return currentImage;
}
```  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateHeroImage(prompt: string, brandId: string, sessionId: string): Promise<string> {
  const model = vertex.preview.getGenerativeModel({
    model: 'imagen-3.0-generate-001', // NanoBanana alias
  });

  const response = await model.generateImages({
    prompt,
    numberOfImages: 1,
    aspectRatio: '16:9',
    safetyFilterLevel: 'block_some',
    personGeneration: 'allow_adult',
  });

  const imageBytes = response.generatedImages[0].image.imageBytes;
  const buffer = Buffer.from(imageBytes, 'base64');

  const key = `brands/${brandId}/campaigns/${sessionId}/hero.jpg`;

  await r2.send(new PutObjectCommand({
    Bucket: 'viyo-assets',
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }));

  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}
```

---

## Brain 7: The Copywriter Brain (Brain #5 in DAG)

**Purpose:** Writes the actual text content — subject line, preview text, headline, body copy sections, and CTA.  
**When it runs:** Parallel to Image Design Brain, after Email Design Brain.  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** Medium-high latency (8-12s). Highest quality requirement of any brain.

### Exact System Prompt (Layer 1):

```
You are the Senior In-House Ecommerce Copywriter for {{brand_name}}.
Your role is to write high-converting, brand-aligned email copy based strictly on the provided
CMO Strategy and Offer Directives.

WHAT YOU ARE NOT:
- You are NOT the CMO. You do not change the strategic angle.
- You are NOT the Pricing Director. You do not invent discounts.
- You are NOT a designer. You do not write HTML or format the layout.

HARD CONSTRAINTS (VIOLATION WILL CAUSE CAMPAIGN FAILURE):
1. NO HALLUCINATED OFFERS: You MUST NEVER invent promotions, discounts, or products. You MUST use
   ONLY the exact offer details provided in the `offer_directives`. If the directive says "10% off",
   you cannot say "20% off" or "Half Price".
2. STRICT VOICE ADHERENCE: You MUST adhere strictly to the Brand Voice Profile provided. If the
   profile says "no emojis," you MUST NOT use emojis. If it says "professional tone," do not use slang.
3. NO WALLS OF TEXT: You MUST optimize for mobile readability. Every section must be concise
   and drive the user toward the CTA.
4. JSON ONLY: You MUST output your response entirely in the required JSON schema. No conversational filler.

INPUTS:
- CMO Strategy: {{cmo_strategy}}
- Offer Directives: {{offer_directives}}
- Brand Voice Profile: {{brand_voice_profile}}
- Target Audience: {{audience_segment}}
- Few-Shot Examples (for stylistic reference only): {{historical_examples}}

OUTPUT FORMAT:
Output ONLY valid JSON matching the `copy_output` schema.
```

### Zod Schema (`copy_output`):

```typescript
import { z } from 'zod';

export const CopyOutputSchema = z.object({
  subject_line: z.string().max(50),
  preview_text: z.string().max(90),
  headline: z.string().max(40),
  body_sections: z.array(z.object({
    section_id: z.string(),
    text: z.string().max(300)
  })),
  cta_text: z.string().max(20),
  rationale: z.string().describe("Internal explanation of creative choices — not shown to user"),
  reading_level: z.string().describe("e.g., 'Grade 6', 'Grade 8'"),
});
```

---

## Brain 7.5: VeriClaw (Deterministic Validation — not a creative brain)

**Purpose:** A fast, factual consistency validator that runs immediately after the Copywriter Brain to catch hallucinated offers before they reach the Critic Brain.  
**When it runs:** Synchronously after Copywriter Brain, before Email Design Brain receives copy.  
**Model:** `gemini-2.5-flash`  
**Cost/Latency:** Low latency (1-2s). Does NOT consume a user generation token.  
**Maximum correction cycles: 1.** If second attempt also fails VeriClaw, session → `failed`, token refunded.

### Exact System Prompt (Layer 1):

```
You are a factual verification agent. Your only job is to compare the generated email copy
against the strict offer directives provided.

WHAT YOU ARE NOT:
- You are NOT a copywriter. Do not rewrite the copy.
- You are NOT a creative critic. Do not evaluate style, tone, or creativity.

HARD CONSTRAINTS:
1. If the copy promises a discount percentage, dollar amount, product, or timeframe NOT explicitly
   listed in the offer directives, you MUST output:
   {"valid": false, "reason": "Copy promises [X] but directive only authorizes [Y]"}.
2. If the copy is factually consistent with the directives, you MUST output:
   {"valid": true}.

INPUTS:
- Copywriter Output: {{copywriter_output}}
- Offer Directives: {{offer_directives}}
```

### Failure Handling:
A VeriClaw `{ "valid": false }` response triggers an automatic retry of the Copywriter Brain with the `reason` appended to the prompt as a hard constraint. This consumes the 1 allowed correction cycle. If the second attempt also fails VeriClaw, `campaign_sessions.status = 'failed'`, token refunded.

---

## Brain 8: The Critic Brain (Brain #6 in DAG)

**Purpose:** Evaluates the complete generated email (compiled text + assembled section sequence) against the original brief and brand guidelines.  
**When it runs:** Final step in the DAG, after Copywriter, Image Design, and Email Design Brains.  
**Model:** `claude-3-5-sonnet-20241022`  
**Cost/Latency:** Medium latency (5-8s).

### Exact System Prompt (Layer 1):

```
You are the Lead QA Editor for {{brand_name}}.
Your job is to ruthlessly evaluate the generated email campaign against the original brief
and brand guidelines.

WHAT YOU ARE NOT:
- You are NOT a copywriter. You do not rewrite the email yourself.
- You are NOT a cheerleader. Do not give high scores to mediocre work.

HARD CONSTRAINTS:
1. EVIDENCE-BASED SCORING: For every score you give, you MUST provide a 1-sentence justification
   quoting the specific text from the email that influenced your score.
2. STRICT THRESHOLDS: If the average score is below 7.0, you MUST generate a
   `forced_regeneration_payload` targeting the specific brain responsible for the lowest scores.
   If any single dimension scores below 4.0, this is a hard fail regardless of the average.
3. JSON ONLY: You MUST return ONLY valid JSON matching the `critic_phase_2_output` schema.

INPUTS:
- Compiled Email Text: {{email_text}}
- CMO Strategy: {{cmo_strategy}}
- Brand Voice Profile: {{brand_voice_profile}}

INSTRUCTIONS:
Evaluate the email across 10 rubric dimensions. For each dimension, provide a score from 0 to 10
and the required evidence.

SCORING CALIBRATION ANCHORS:
- 9-10: Exceptional. Flawless execution of the dimension. No edits needed.
- 7-8: Good. Meets requirements but lacks creative punch or polish. Minor stylistic edits would improve it.
- 5-6: Mediocre. Technically passes but feels generic, slightly off-brand, or clunky.
- 0-4: Failure. Violates a core constraint, misrepresents the brand, hallucinates an offer, or is unreadable.

RUBRIC DIMENSIONS:
1. Strategic alignment: Does the copy actively execute the CMO's chosen psychological angle? (10 = Angle is woven into every line; 5 = Angle is present but weak; 0 = Ignores angle entirely).
2. Offer accuracy: Are all claims factually correct per offer directives? (10 = Perfect accuracy; 0 = Hallucinates an offer or misrepresents the deal).
3. Voice consistency: Does it match the brand voice profile? (10 = Sounds exactly like the brand; 5 = Sounds like a generic marketer; 0 = Uses forbidden words or tone).
4. Subject line effectiveness: Is it under 50 chars, intriguing, and free of spam triggers? (10 = Irresistible hook; 5 = Boring but safe; 0 = Clickbait or spammy).
5. CTA clarity: Is the call to action unambiguous and action-oriented? (10 = High-converting verb phrase; 5 = Generic "Shop Now"; 0 = Confusing or missing).
6. Mobile readability: Are body sections concise? (10 = Scannable, short paragraphs; 5 = Slightly wordy; 0 = Wall of text).
7. Emotional resonance: Does it evoke the intended feeling? (10 = Strong emotional pull; 5 = Dry and transactional; 0 = Alienating or inappropriate).
8. Layout-copy coherence: Does the assembled section sequence fit the content type and flow? (10 = Perfect marriage of form and function; 0 = Section sequence actively fights the content).
9. Section Assembly: Is the email properly assembled using discrete section components (e.g., hero, grid, footer) rather than a monolithic template? (10 = Perfect composable assembly; 0 = Uses a fixed legacy template).
10. Urgency integrity: Is urgency framing honest and consistent? (10 = Real, justified urgency; 5 = Slight pressure; 0 = Fake or manipulative urgency).
11. Hero image relevance: Does the image description match the campaign mood? (10 = Elevates the campaign; 5 = Generic lifestyle shot; 0 = Irrelevant or includes forbidden elements like text).
```

### Zod Schema (`critic_evaluation`):

```typescript
import { z } from 'zod';

export const CriticOutputSchema = z.object({
  target_brains: z.array(z.enum(["copywriter", "image_design", "offer"])).optional(),
  issues: z.array(z.object({
    category: z.string(),
    severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
    evidence: z.string(),
    correction_instruction: z.string()
  })).optional(),
  rubric_scores: z.record(z.number()),
  average_score: z.number(),
  forced_regeneration_payload: z.object({
    target_brain: z.enum(["copywriter", "image_design", "offer", "cmo"]),
    instruction: z.string(),
    failing_dimension: z.string(),
    failing_score: z.number(),
  }).optional(),
});

// Score floor enforcement — runs immediately after Critic Brain output is validated:
export function applyCriticScoreFloor(criticOutput: z.infer<typeof CriticOutputSchema>): {
  action: 'deploy' | 'regenerate' | 'hard_fail';
  reason?: string;
} {
  const scores = Object.values(criticOutput.rubric_scores);
  const minScore = Math.min(...scores);
  const avgScore = criticOutput.average_score;

  // Hard fail: any single dimension below 4.0 — session fails, credits refunded
  if (minScore < 4.0) {
    return {
      action: 'hard_fail',
      reason: `Dimension score ${minScore.toFixed(1)}/10 is below the 4.0 hard floor. Session failed, credits refunded.`,
    };
  }

  // Regeneration trigger: average below 7.0 — retry targeted brain (1 attempt allowed)
  if (avgScore < 7.0 && criticOutput.forced_regeneration_payload) {
    return {
      action: 'regenerate',
      reason: `Average score ${avgScore.toFixed(1)}/10 is below 7.0 threshold. Retrying ${criticOutput.forced_regeneration_payload.target_brain} brain.`,
    };
  }

  // Deploy: average >= 7.0 and no dimension below 4.0
  return { action: 'deploy' };
}
// Regeneration cap: maximum 1 Critic-triggered regeneration per session.
// If the regenerated output also scores below 7.0, deploy anyway with a warning flag.
// Do NOT hard fail on the second attempt — this prevents infinite retry loops and protects UX.
// The warning flag is surfaced to the user: "This email passed quality checks with a note from our AI reviewer."
```

---

## Mastra DAG Configuration

```typescript
// apps/worker/src/inngest/functions/generate-campaign.ts
import { Workflow, Step } from '@mastra/core';
import { z } from 'zod';
import { hydrateContext } from '../steps/hydrate';
import { runCmoBrain } from '../steps/cmo-brain';
import { runAudienceBrain } from '../steps/audience-brain';
import { runOfferBrain } from '../steps/offer-brain';
import { runCopywriterBrain } from '../steps/copywriter-brain';
import { runImageDesignBrain } from '../steps/image-design-brain';
import { runEmailDesignBrain } from '../steps/email-design-brain';
import { runVericlaw } from '../steps/vericlaw';
import { runCriticBrain } from '../steps/critic-brain';

// 1. Define Steps
const hydrateStep       = new Step({ id: 'hydrate',              execute: hydrateContext });
const cmoStep           = new Step({ id: 'cmo_brain',            execute: runCmoBrain });
const audienceStep      = new Step({ id: 'audience_brain',       execute: runAudienceBrain });
const offerStep         = new Step({ id: 'offer_brain',          execute: runOfferBrain });
const copywriterStep    = new Step({ id: 'copywriter_brain',     execute: runCopywriterBrain });
const imageDesignStep   = new Step({ id: 'image_design_brain',   execute: runImageDesignBrain });
const vericlawStep      = new Step({ id: 'vericlaw_validator',   execute: runVericlaw });
const emailDesignStep   = new Step({ id: 'email_design_brain',   execute: runEmailDesignBrain });
const criticStep        = new Step({ id: 'critic_brain',         execute: runCriticBrain });

// 2. Build DAG — dependency order:
// hydrate → cmo → [audience || offer] → [copywriter || imageDesign] → vericlaw → emailDesign → critic
export const campaignGenerationWorkflow = new Workflow({
  name: 'campaign-generation',
  triggerSchema: z.object({ sessionId: z.string() })
})
  .step(hydrateStep)
  .then(cmoStep)
  .then(audienceStep)                                           // sequential after CMO
  .after(cmoStep).step(offerStep)                              // parallel with audience
  .after(audienceStep, offerStep).step(copywriterStep)         // after both
  .after(audienceStep, offerStep).step(imageDesignStep)        // parallel with copywriter
  .after(copywriterStep).step(vericlawStep)                    // VeriClaw after copywriter
  .after(vericlawStep, imageDesignStep).step(emailDesignStep)  // after both
  .then(criticStep);                                           // final step
```

### Inngest Function Wrapper:

```typescript
// apps/worker/src/inngest/functions/generate-campaign.ts
import { inngest } from '../client';
import { db } from '../../db';
import { campaignSessions, billingUsage, brands } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const generateCampaign = inngest.createFunction(
  { id: 'generate-campaign', retries: 3 },
  { event: 'campaign.generate' },
  async ({ event, step }) => {
    const { sessionId } = event.data;

    // Update session status to running
    await step.run('set-running', async () => {
      await db.update(campaignSessions)
        .set({ status: 'running', current_phase: 'hydrating' })
        .where(eq(campaignSessions.id, sessionId));
    });

    try {
      // Execute Mastra DAG
      const result = await step.run('execute-dag', async () => {
        return await campaignGenerationWorkflow.execute({ sessionId });
      });

      // Commit token on success
      await step.run('commit-token', async () => {
        await db.update(billingUsage)
          .set({ transaction_type: 'deduction' })
          .where(eq(billingUsage.session_id, sessionId));
        await db.update(campaignSessions)
          .set({ status: 'completed' })
          .where(eq(campaignSessions.id, sessionId));
      });

      return result;

    } catch (error) {
      // Refund credits on failure
      await step.run('refund-credits', async () => {
        const CAMPAIGN_EMAIL_COST = 1000;
        // Get brand_id from session
        const [session] = await db.select().from(campaignSessions).where(eq(campaignSessions.id, sessionId));
        // Refund: restore credit balance
        await db.update(brands)
          .set({ credit_balance: sql`${brands.credit_balance} + ${CAMPAIGN_EMAIL_COST}` })
          .where(eq(brands.id, session.brand_id));
        // Log refund in ledger
        await db.insert(creditLedger).values({
          brand_id: session.brand_id,
          transaction_type: 'refunded',
          credits_amount: CAMPAIGN_EMAIL_COST,
          action_type: 'campaign_email',
          session_id: sessionId,
          description: 'Generation failed — credits refunded automatically',
        });
        // Update session status
        await db.update(campaignSessions)
          .set({ status: 'failed' })
          .where(eq(campaignSessions.id, sessionId));
      });
      throw error;
    }
  }
);
```


---



---

## 8. Email Strategy Architecture Addendum (V1/V1.1)

**Context:** The system prompt architecture has been expanded to support the Email Strategy implementation. Prompts are no longer static; they are dynamically assembled using the brand's `strategy_profile` and conditional doctrine blocks.

### 8.1 CMO Brain Expansion
The CMO Brain now acts as the Framework Recommendation Engine.

**New Context Injection:**
```xml
<strategy_profile>
  <vertical>{{vertical}}</vertical>
  <enabled_frameworks>{{enabled_frameworks_json}}</enabled_frameworks>
  <framework_weights>{{framework_weights_json}}</framework_weights>
</strategy_profile>
```

**New Task Instruction:**
"Before generating the campaign brief, you must select the optimal copywriting framework and content pattern. Evaluate the `enabled_frameworks` against the current `email_type` and historical `framework_weights`. Assign exactly one framework and one pattern to the brief."

### 8.2 Copywriter Brain Expansion
The Copywriter Brain now receives conditional framework doctrine instead of a monolithic Email Bible.

**New Context Injection (Conditional):**
```xml
<assigned_framework>
  <name>PAS (Problem-Agitate-Solve)</name>
  <structure>
    1. Problem: State the specific pain point clearly.
    2. Agitate: Amplify the emotional or practical cost of the problem.
    3. Solve: Introduce the product as the specific bridge to the solution.
  </structure>
  <hard_constraints>
    - NEVER deviate from this 3-part sequence.
    - NEVER introduce the product before the Agitate section is complete.
  </hard_constraints>
</assigned_framework>
```

### 8.3 Email Design Brain Expansion
The Email Design Brain assembles composable section sequences from the component library.

**New Task Instruction:**
"You are the Email Design Brain. You will receive structured copy mapped to a specific Content Pattern sequence. You must assemble the appropriate MJML section components from the `section_component_library` to fulfill this sequence. If `dark_mode_enabled` is true, you must inject the dark mode design tokens into the `<mj-style>` block of the assembled MJML."

### 8.4 Critic Brain Expansion
The Critic Brain now validates framework compliance.

**New Validation Rules:**
"You must evaluate the generated copy against the `assigned_framework` structure. If the framework is PAS, you must verify that the copy contains a distinct Problem, Agitate, and Solve section in that exact order. If the framework is violated, you must output a FAIL signal and route the task back to the Copywriter Brain with specific correction instructions."


---

## 8.6 Infographic Generation — Brain Prompt Additions

