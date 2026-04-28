# VIYO Skills Procurement Report & Gap Analysis

**Date:** April 28, 2026  
**Context:** Audit of 80+ existing Airtable skills against R32 (Intelligent Email Engine) and T46 (Art Director Routing Suite) requirements, combined with a ClawHub (52K+) and GitHub parallel search.

---

## 1. Executive Summary

The existing 80+ skills in Airtable are heavily skewed toward **Core Doctrine, Frameworks, and Tone Modifiers** (63 of 80 skills). These are excellent "teaching skills" for the Copywriter and CMO brains. 

However, VIYO is missing critical **Platform Skills (Runtime Tools)** and **Advanced Learning Loops**. We cannot rely purely on prompting to handle complex tasks like GIF creation, HTML email rendering, or A/B test statistical significance. 

This report recommends procuring **12 specific open-source tools from GitHub** and **5 advanced skills from ClawHub** to bridge these gaps. As per the `github-gem-seeker` philosophy: we solve the problem with battle-tested open-source code first, then wrap it in a Manus skill interface.

---

## 2. Procurement Matrix: What to Buy/Borrow vs. Build

### A. The Autonomous Learning Loop (Self-Healing)
*Current state: No existing skills in Airtable for self-improvement.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Self-Improving Agent** | ClawHub | `self-improving-agent` | **PROCURE.** Integrate this to allow the Top Brain to rewrite its own prompts based on failure logs. |
| **Memory & Self-Heal** | ClawHub | `memory-self-heal` | **PROCURE.** Essential for Phase 9 error recovery and sandbox persistence. |
| **Sales Mastery** | ClawHub | `sales-mastery` | **PROCURE.** Integrate partially into the Offer Brain for negotiation and discount tiering logic. |

### B. Email Engine (R32) Technical Gaps
*Current state: Airtable has 18 Generation Rules but no runtime execution engines.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Responsive HTML Builder** | GitHub | `mjmlio/mjml` (18K⭐) | **PROCURE.** We have `mjml_section_resolver` in Airtable, but we need the actual MJML engine to compile the JSON into responsive HTML. |
| **Email Personalization** | GitHub | `pallets/jinja` (11K⭐) | **PROCURE.** Jinja2 is the industry standard for dynamic content injection. Wrap it in a skill for the Designer Brain. |
| **Deliverability/Spam Check** | GitHub | `spamscanner/spamscanner` | **PROCURE.** The Critic Brain needs a programmatic way to check spam scores before approval, not just LLM guessing. |
| **A/B Testing Math** | GitHub | `growthbook/growthbook` | **PROCURE.** The Top Brain needs rigorous statistical significance calculation for System B auto-apply rules, not LLM math. |
| **Analytics/UTM Tracking** | GitHub | `plausible/analytics` | **PROCURE.** Lightweight, privacy-first tracking pixel engine for R32's open/click attribution. |

### C. Image Pipeline (T46) Technical Gaps
*Current state: Airtable has `image_pipeline_router` but lacks generation intelligence.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Prompt Engineering** | ClawHub | `image-generation` | **PROCURE.** Use this as the foundation for the Art Director's prompt construction before sending to NanoBanana/Ideogram. |
| **GIF Creation** | GitHub | `imageio/imageio` | **PROCURE.** Python library to stitch multiple NanoBanana frames into an animated GIF for email headers. |
| **Image Compression** | GitHub | `lovell/sharp` (32K⭐) | **PROCURE.** Node.js library. Emails must be <100KB. The Visual Router Brain must pass all images through Sharp before ESP upload. |
| **Quality Assessment** | GitHub | `chaofengc/IQA-PyTorch` | **PROCURE.** Programmatic image quality scoring (blur, composition) to validate NanoBanana output before billing tokens. |

### D. Copywriting & Content Gaps
*Current state: We have basic PAS/AIDA frameworks, but lack advanced persuasion.*

| Gap | Source | Target | Action |
|---|---|---|---|
| **Advanced Copywriting** | ClawHub | `copywriting-pro` | **PROCURE.** Upgrade the Copywriter Brain's baseline capabilities beyond simple frameworks. |
| **Email Best Practices** | ClawHub | `email-best-practices` | **PROCURE.** Inject into the Critic Brain's evaluation rubric. |
| **Brand Voice Extraction** | Custom | `NLP/Stylometry` | **BUILD.** Existing open-source tools (`jpotts18/stylometry`) are too academic. We need a custom skill that reads a brand's website and outputs a VIYO Tone Modifier JSON. |

---

## 3. Implementation Plan & Wiring

As per the Global System Wiring mandate, these procured skills do not operate in isolation. They must be wired into the existing R32 and T46 architectures:

1. **Admin Config Panel Integration:**
   - Every procured GitHub tool (e.g., Plausible Analytics, MJML server) that requires hosting must have its endpoint URL and API key exposed in the VIYO Admin Config Panel.
   - The Top Brain will automatically wire these config entries upon installation.

2. **Self-Healing Wrapper:**
   - All procured open-source tools will be wrapped in the `memory-self-heal` pattern. If `lovell/sharp` fails to compress an image, the self-healing wrapper catches the error, falls back to a lower compression tier, and logs the failure to the `self-improving-agent` memory bank.

3. **ClawHub Ingestion Pipeline:**
   - Use the `open-claw-skill-hunter-and-developer` skill to fetch `self-improving-agent`, `memory-self-heal`, `copywriting-pro`, and `image-generation`.
   - Run the `--review` and transformation scripts to adapt them from Claude Desktop paths to Manus `/home/ubuntu/skills/` paths.
   - Bundle them into a `VIYO_R32_T46_Skill_Batch` for one-click installation.

---

## 4. PO Decision Required

This procurement plan introduces 12 GitHub repositories and 5 ClawHub skills to the VIYO stack. 

**Do you approve this procurement matrix?** 
If yes, I will use the `github-gem-seeker` and `open-claw-skill-hunter` skills to begin fetching, transforming, and installing these assets into the sandbox.
