# CANONICAL_DOCS_REGISTRY.md

**Purpose:** Every product document with version, location, status (CANONICAL / SUPERSEDED IN PART / SUPERSEDED / REFERENCE), and what supersedes it. Use this to determine which doc to trust before writing a directive or a governance commit.

**Authored:** 2026-05-22 by VIYO Curator (Phase 6 cleanup punch list item 1).
**Authority:** Curator-verified from full reads. All entries are fact-verified, not memory-cited.
**Maintained:** Update whenever PO ratifies a new canonical document or issues a supersession ruling.

---

## How to read this registry

- **CANONICAL** — This is the definitive, current-as-of-today source of truth for its stated scope. Read before writing any directive touching that scope.
- **SUPERSEDED IN PART** — The document is partially valid; specific sections are overridden by a newer CANONICAL doc. The registry notes which sections remain authoritative and which are dead.
- **SUPERSEDED** — The entire document is replaced. Do not cite or implement from it.
- **REFERENCE** — Informational. Contains context but is not the execution authority.

---

## Registry

### 1. VIYO Image Studio PRD v1.4

| Field | Value |
|---|---|
| Title | VIYO Image Studio — Product Requirements Document |
| Version | 1.4 |
| Status | **CANONICAL** |
| Owner | PO (VIYO) |
| Drive location | `VIYO_IMAGE_STUDIO_PRD_V1.4.md` (Google Doc, ID `10jauKOxNdoNe6zrdHV309sdbD6-rCkMPhaTb7EpfaLU`, root "My Drive") |
| Created | 2026-05-21 |
| Last modified | 2026-05-22 |
| Scope | Image Studio (VVOW Phase 1) — product vision, workspace shape, canvas stack, image modes, editing toolbelt, learning loop, operating principles, launch gate |
| PO ruling | "PRD v1.4 is canonical Image Studio doc" (Phase 6, 2026-05-22) |

**Key locked facts (verified from full read):**

- Canvas stack: **React Konva** (infinite canvas) + **dnd-kit** (drag interactions) + **Zustand** (canvas-state source of truth). NOT GrapesJS Studio SDK.
- Image count: D3 (2026-05-22) — user-controlled dropdown (Ideogram-style), default 1, max TBD. Supersedes the "always generate 3 variants" language in this and prior specs.
- Brand Kit: D5 (2026-05-22) — first-class entity with its own dedicated page/route, NOT a canvas frame. Brand Kit page scope: Phase 2+.
- Brand Vault split (2026-05-22): "Brand Vault" per earlier specs is now two distinct surfaces: (1) Asset/Image Library (generated + uploaded images, resizable left panel 280–480px); (2) Brand Identity Vault (brand colors, logo, typography, fed by Brand Kit flow, Phase 2+).
- 22 image modes (verified list in §3.5).
- 13 editing tools total: 9 AI editing (Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Outpainting, Style Transfer, Material Swap, Quick Edit) + 2 AI quality (Upscale, Shadow & Reflection) + 2 brand-alignment (Smart Crop, Color Harmony). Quick Edit bar also routes free-text to correct tool via Visual Intent Router.
- AI orchestration: Vercel AI SDK + Mastra core (workflow host).
- Data: Supabase Postgres + pgvector + Drizzle ORM.
- Provider layers: Layer 1 Aggregators (Atlas Cloud + fal.ai), Layer 2 Frontier Direct (OpenAI/Google/Ideogram), Layer 3 Self-Hosted at Scale (RunPod/Thunder Compute).
- Public-launch gate: Both Brand Kit Mode AND Character Consistency Across Scenes must ship.

**What this supersedes:**
- VVOW Architecture v2.0 §8.1 canvas lock (GrapesJS Studio SDK → React Konva + dnd-kit + Zustand)
- Any spec stating "always generate 3 variants" (D3 override)
- Any spec placing Brand Kit as a canvas frame or side panel (D5 override)
- Any spec treating "Brand Vault" as a single unified surface (Vault-split override)

---

### 2. VVOW Image Studio Architecture v2.0

| Field | Value |
|---|---|
| Title | VVOW Image Studio — Architecture Specification |
| Version | 2.0 |
| Status | **SUPERSEDED IN PART** |
| Owner | PO (VIYO) |
| Drive location (Google Doc) | ID `1pDOiou8KUqHQkWUwcHpbBXBR1rTXC1oBOFzg0OgOLfk` (VVOW folder) |
| Drive location (.md file) | `VVOW_IMAGE_STUDIO_ARCHITECTURE.md`, ID `1ethTyt9sq02SchdhRrONKAflj3X2DZsS` (VVOW folder, pre-Google Doc copy — treat as SUPERSEDED by Google Doc version) |
| Repo location | `/docs/architecture/VVOW_IMAGE_STUDIO_ARCHITECTURE.md` (per §21 update authority) |
| Created | 2026-05-08 |
| Last modified | 2026-05-19 (Google Doc version) |
| Pending update | VVOW v2.1 dispatch authored by Manus Architect (VIYO 4 session, 2026-05-20) — 9 §-by-§ BEFORE/AFTER pairs, NOT YET EXECUTED by Curator. Pointer files on Drive in working folder. |

**DEAD sections (superseded by PRD v1.4, PO ruling 2026-05-22):**

- §8.1 Canvas Engine: "GrapesJS Studio SDK" lock — DEAD. Canvas is now React Konva + dnd-kit + Zustand.
- §2.3 Unified GrapesJS Backbone table — DEAD for Image Studio canvas. GrapesJS remains valid only for the Phase 2 Email Studio MJML compilation path (Phase 2 is future, not current build).
- §3 Zone 2 "GrapesJS Infinite Canvas" — DEAD as implementation reference. React Konva is the canvas engine.
- §18.1 Forbidden: "Custom canvas implementations. Use GrapesJS Studio SDK exclusively" — DEAD.
- Appendix A Summary Table row "Canvas: GrapesJS Studio SDK" — DEAD.
- Any reference to "10 tools" (V8 PRD §20K.1 count) — SUPERSEDED by PRD v1.4's 13 tools.

**STILL AUTHORITATIVE (not overridden by PRD v1.4):**

- 3-Zone Spatial Architecture concept (§2, §3) — valid. Zone names and functional descriptions carry forward; only the canvas engine implementation is dead.
- Brain Council relationship (§5) — valid (Brain 5 Visual Intent Router + Brain 6 Designer Brain).
- Pattern DB & Brief-to-Prompt flow (§10) — valid (pgvector, pattern recipe schema, cache-first behavior).
- Brand Vault Organization (§11) — valid (lineage, type scope, JSONB metadata, pgvector search, tagging). Note: "Brand Vault" surface split per PRD v1.4 2026-05-22 override applies.
- Implicit RLHF Learning Loop (§12) — valid (drag +1, export +5, regenerate −1; Tinder swipe gate).
- 3-Tier Provider Strategy (§8.7) — valid.
- Model Registry (§8.8) — valid.
- Pattern Recipe JSON Schema (§10.3) — valid (locked shape).
- Pattern Seeding via Milled (§10.4) — valid.
- 22 image modes taxonomy (§4.1) — valid. Mode list is consistent with PRD v1.4 §3.5.
- Phased Build Plan (§16) — valid as reference; current state has advanced beyond the 2026-05-08 snapshot in §17.
- Lovart parity gaps G1–G10 (§14) — valid.
- Open Decisions OD-001/002/003/005 (§20) — reference (check Notion for current status).
- R-file cross-references (§19) — valid.
- DSPy learning loop (§8.6) — valid.
- Mastra orchestration (§8.3) — valid.
- Inngest job scheduling (§8.2) — valid.

**Self-declares "single source of truth" — this declaration is INCORRECT as written** (per PO ruling and session summary). PRD v1.4 supersedes it on canvas/stack. VVOW v2.1 dispatch (pending) will correct additional sections.

---

### 3. VIYO Master PRD V8 Final

| Field | Value |
|---|---|
| Title | VIYO Master Product Requirements Document (V8) |
| Version | 8.0 |
| Status | **REFERENCE** |
| Drive location | `VIYO_MASTER_PRD_V8_FINAL.md`, ID `1SL1zKOi80tFAcqzNvPDPA1vI9kZgNMKU` (01_PRD_and_Architecture folder) |
| File size | 800 KB |
| Date | May 4, 2026 |
| Scope | 12–24 month platform PRD — complete feature map across all VIYO products (Image Studio §20K.1, Email Studio, Intelligence Studio, Collaboration, Intelligence brains, etc.) |

**Authority position per Lock 22 / D85 ratification (2026-05-18):**
V8 PRD = vision tier (12–24 month roadmap). MBS v1.1 = MVP execution tier (what ships now). V8 PRD guides direction; MBS guides sequencing. Do not use V8 PRD as the execution authority for current Image Studio build.

**Known underspecification (verified from VVOW Architecture own §§):**
V8 PRD §20K.1 lists 22 modes and 10 tools but omits the technical backbone (canvas stack, provider tiers, model registry, learning loop). VVOW Architecture + PRD v1.4 are the execution references.

**Superseded by:**
- VVOW Architecture v2.0 for VVOW-specific architecture decisions (per VVOW Architecture header authority statement)
- PRD v1.4 for Image Studio canvas stack, tool count, and runtime decisions (per PO ruling)
- MBS v1.1 for build sequencing (per Lock 22 authority tier split)

---

### 4. VIYO Master Build Sequence v1.1

| Field | Value |
|---|---|
| Title | VIYO Master Build Sequence v1.1 |
| Version | 1.1 |
| Status | **CANONICAL** |
| Repo location | `/docs/governance/VIYO_Master_Build_Sequence.md` |
| Drive location | `VIYO_Master_Build_Sequence_v1.1.md`, ID `1e_daXmcfBJi9wuBm1DqY9pvO_GTkh4EE` (working folder) |
| Ratified | 2026-05-18 (Commit 2, commit W `c269a11`) |
| Authority | Lock 22 operationalized — MVP execution authority |

**Authority position in hierarchy:**
PO decisions → V8 PRD → FOUNDATION_AUTHORITY.md → **VIYO_Master_Build_Sequence.md** → VVOW Architecture → R-spec ZCBR → per-Bullet directives → existing code

See §5 (Three-Layer MBS Map) of PHASE6_HANDOFF.md for the explicit phase-to-product mapping.

---

### 5. R17 UI/UX Architecture v2.0

| Field | Value |
|---|---|
| Title | R17 — UI/UX Architecture (v2) |
| Version | 2.0 |
| Status | **CANONICAL** (ZCBR PASSED 2026-05-12) |
| Repo location | `/docs/research_specs/R17_UI_UX_ARCHITECTURE_v2.md` |
| Drive location | `R17_UI_UX_ARCHITECTURE_v2.md`, ID `1DVmc8kyUoQwMum-jQxfQQo1ZV9TbHG9M` (R-specs folder) |
| Authored | 2026-05-12 |

**Note:** R17 v2 aligns to VVOW 3-Zone Spatial Architecture and routes all model/provider surfacing through R29 v2 capability registry. However, R17 v2 was written against VVOW Architecture v2.0 (which had GrapesJS as canvas). With PRD v1.4 superseding GrapesJS, R17 v2 will need a targeted amendment for Zone 2 canvas implementation references. This amendment is not yet dispatched.

**Supersedes:** R17 v1.0 (Enterprise Spec, `R17_UI_UX_ARCHITECTURE_ENTERPRISE.md`) — SUPERSEDED.

---

### 6. V8 PRD Addendum Cluster

| Document | Status | Notes |
|---|---|---|
| V8 Addendum + PRD V6 Addendum — Proprietary Intelligence | REFERENCE | Intelligence subsystems MAAX/HYVE/ATLAS naming locks remain authoritative. ID `1LwQNcJCtwEHaEOhdAOhmpz-aZ0-4_NuiGIBjw7kWtgM`. |
| PRD V6 Addendum — R32 Intelligent Email Engine | REFERENCE | Email Studio (Phase 2) reference only. `VIYO_PRD_V6_ADDENDUM_R32.md` |
| PRD V6 Addendum — Enterprise SaaS Hardening | REFERENCE | Staging env, observability, email infra requirements. Phase 6.2 pre-alpha requirements. |
| PRD V5 Addendum — Image Studio & Collaboration | SUPERSEDED | Superseded by VVOW Architecture v2.0 + PRD v1.4 for Image Studio scope. |
| VIYO_Final_Doc1_Master_PRD.md (V4) | SUPERSEDED | Superseded by V8. |
| VIYO_Master_PRD_V7_ZCBR.md | SUPERSEDED | Superseded by V8. |
| Doc1_Master_PRD_Original.md | SUPERSEDED | Original V4 copy. Superseded by V8. |

---

### 7. VVOW Reverse Engineering (Lovart Teardown)

| Field | Value |
|---|---|
| Title | VVOW_Image_Studio_Reverse_Engineering_Complete.md |
| Status | **REFERENCE** |
| Drive location | ID `133gIGsn7ST0HAr7jfeZq9esr759oKPVS` (VVOW folder) |

Canonical for Lovart parity strategy and competitor analysis. Not superseded. Read when scoping gap closure for G1–G10 gaps in VVOW Architecture §14.

---

### 8. Competitive UI/UX Report (Phase 6 Research)

| Field | Value |
|---|---|
| Title | Competitive UI/UX Report: Logged-In AI Image, Agent, and Infinite-Canvas Product Surfaces |
| Status | **REFERENCE** |
| Drive location | ID `1ZirN_Vu3vDD41b6E1gP5pJxTfZto_4aC` (VVOW independent image studio / UI-UX audit folder) |
| Created | 2026-05-21 |

Covers Higgsfield Image, Higgsfield Supercomputer, Ideogram, Lovart Canvas. Research surface only — no PO-ratified decisions drawn from it yet.

---

### 9. VIYO Image Studio UI/UX Interface Specification v1.0

| Field | Value |
|---|---|
| Title | VIYO Image Studio — UI/UX Interface Specification |
| Version | 1.0 — build-handoff draft |
| Status | **CANONICAL** |
| Owner | PO (VIYO) |
| Drive location (Google Doc) | ID `1DXj3ttypWdgzI23RG6cvcS4Ek74iVVyla7jf2otaUnc` (VVOW independent image studio / UI-UX audit folder) |
| Drive location (.md file) | ID `1qFjK4vUEi0Z9TdRl4lwie4EZTxJIAeZ7`, 59 KB (same folder) |
| Created | 2026-05-21 |
| Last modified | 2026-05-22 |
| Scope | Interface contract for VIYO Image Studio first public release — layout shell (Top Bar, Left Rail, Infinite Canvas, Design Chat, Contextual Toolbelt, Status Strip), zone-by-zone touchpoint spec, modes UI treatment (22 modes + auto-detect + Mode Gallery), Brand Kit Mode UI, Character Consistency UI, 13 editing tools per-tool panel spec, generation state machine, canvas object model, learning-loop UI surfaces, cache-first UI, wiring map (UI events → brains → registry → Vault), keyboard shortcuts, component inventory, §22 MVP build sequence, §23 open PO decisions |
| Authoritative source declared in header | PRD v1.4 + VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM |
| Competitive grounding | Four research docs: Higgsfield Image, Higgsfield Supercomputer, Ideogram, Lovart Canvas (Drive folder `1dhlmKbkLKq…`) |

**Authority position:** Derives from PRD v1.4. Where this spec adds surface detail (Top Bar, Left Rail, Status Strip) it makes PRD-implied surfaces explicit, never inventing scope — each addition is flagged `[PRD-implied]` with justification. Read AFTER PRD v1.4; read BEFORE dispatching any directive that touches UI layout, component behavior, or state machine.

**Key facts verified from full read:**

- **12 design guardrails (G1–G12):** Drawn from competitive research. G1 = one dominant labeled button; G2 = immediate visible node within 200 ms; G6 = non-destructive child variants; G7 = brief survives every drawer interaction; G8 = cost shown before spend; G10 = quiet chrome (no promo banners over workspace); G12 = Focused Edit Mode unmistakable (banner + source chip).
- **§22 MVP build sequence (10 phases for Manus):** Shell + canvas → Design Chat + generate pipeline → Drag/auto-save/learning signals → Contextual Toolbelt + Focused Edit Mode → Brand Vault rail → Modes (22 cards + auto-detect) → Brand Kit Mode → Character Consistency → Export Center + token economics → Polish. **This is the UI-layer Manus build sequence. It is NOT the MBS bullet sequencer — MBS v1.1 remains the authoritative phased sequencer.**
- **§23 open PO decisions (D1–D6):** D3 (image count) and D5 (Brand Kit as frame vs. page) already resolved via appended decision notes in the doc. D1 (Design Chat right / Brand Vault left), D2 (Auto-detect default), D4 (`ⓘ why these models` at launch), D6 (Status Strip auto-peek) remain open for PO confirmation.
- **Lock 40 referenced in §18.3:** Source-never-shown rule cited as "Lock 40" (`PRD §3.8, Lock 40`). This is a new lock reference — the previously known ceiling was Lock 39 (candidate placeholder). Lock 40 requires verification against the Foundation Locks DB before a next directive cites it.
- **Wiring map (§18):** Binds all UI events to the four brains (VIR, Cache, Pattern Library, Art Director Router) and the Mastra/Vercel AI SDK stack.
- **Component inventory (§20):** 40+ named components across shell, canvas, Design Chat, toolbelt, and shared layers.
- **Brand Vault split (§4 build-decision note):** The pre-split "Brand Vault" in this spec has been split into (1) Asset/Image Library (left panel, 280–480 px resizable) and (2) Brand Identity Vault (Phase 2+) — consistent with PRD v1.4 2026-05-22 override.

**What this supersedes:**
- Any prior UI/UX sketch or wireframe for Image Studio not derived from PRD v1.4.
- The "always generate 3 variants" text in §5.3 of this spec itself — superseded by D3 (user-controlled dropdown, default 1) per appended decision note.
- The "Brand Kit as a canvas frame" text in §23 D5 of this spec — superseded by D5 ratification (dedicated page/route, Phase 2+).

**Known gaps:**
- Co-authoritative source `VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM` is referenced in the spec header but was not found in Drive after two search attempts (2026-05-22). Status: UNVERIFIED / MISSING. See Entry 10.
- R17 v2 (UI/UX Architecture, ZCBR PASSED 2026-05-12) will need a targeted amendment to align Zone 2 canvas implementation references with PRD v1.4 + this spec. Not yet dispatched.

---

### 10. VIYO Image Studio System Diagram

| Field | Value |
|---|---|
| Title | VIYO Image Studio — System Flow Diagram |
| Filename | `VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM.md` |
| Status | **CANONICAL** |
| Date | 2026-05-21 |
| Sourced from | PRD v1.4 (declared in file header) |
| Local copy verified | `C:\Users\Admin\Downloads\VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM (3).md` (confirmed 2026-05-22 full read) |
| Drive location | ID `1aJMKdIXgQ3VqhiDeLvgQXnyAlgLaZgYR` (VVOW independent image studio / UI-UX audit folder, uploaded 2026-05-22). Renders in GitHub, Notion, any Mermaid-aware markdown viewer. |
| Referenced by | UI/UX Spec v1.0 header (co-authoritative alongside PRD v1.4); UI/UX Spec v1.0 §12 ("Model mapping is from the system diagram §3") |

**Scope (verified from full read):**
Four Mermaid diagrams:
1. **Image Studio End-to-End Flow** — User → Design Chat → VIR → Pattern Library → ADR → Provider Registry (Tier 1/2/3) → Designer Brain → QA Bouncer → variant cards; editing stack (SAM 2 / Flux / ESRGAN / Tesseract / Sharp); learning loop (drag +1, export +5, regenerate −1); Zustand/idb/dnd-kit/Mastra/Vercel AI SDK orchestration substrate.
2. **Cross-Phase Integration** — Image Studio → Email Studio (asset reference by UUID, GrapesJS + MJML, 5 new brains) → Intelligence Studio (ATLAS, Smart Insight Engine, Contextual Advisor); Licensed-Inspiration Pattern Seeding shown as post-launch with explicit preconditions: `OD-024 ToS Review` + `Lock 40 Source-Never-Shown`.
3. **Toolbelt — Tool-to-Model Mapping** — All 13 tools mapped to registry entries (SAM 2, Flux 1.1 Pro inpaint, Flux 1.1 Pro i2i, Real-ESRGAN, Tesseract.js, Sharp). This is the "system diagram §3" that UI/UX Spec §12 cites.
4. **Reverse-Engineering Pipeline** — Licensed/uploaded/validated source → Claude Vision → Pattern Recipe JSON → Pattern Library → continuous refinement.

**Appendix governance table (verified):** Explicitly lists two entries that gate post-launch Pattern Seeding:
- `OD-024 — Licensed Inspiration Sources ToS Review` (per-source legal verification)
- `Lock 40 — Source-Never-Shown Invariant` (code-review gate enforcement)

**Action required:** Confirm Drive ID for the canonical Drive copy so the registry can record it.

---

## Key conflicts to watch

1. **GrapesJS vs. React Konva (RESOLVED):** PRD v1.4 wins. Canvas = React Konva + dnd-kit + Zustand. GrapesJS Studio SDK is dead for Image Studio canvas. GrapesJS remains valid ONLY for future Email Studio MJML compilation (Phase 2).

2. **Tool count 10 vs. 13 (RESOLVED):** PRD v1.4 wins. 13 tools (9 AI editing + 2 quality + 2 brand-alignment). VVOW Architecture's B1–B10 maps to 10 of the 13; Upscale = B7 (same), Shadow & Reflection / Smart Crop / Color Harmony are the 3 additions in PRD v1.4.

3. **Image count "3 variants always" vs. user-controlled (RESOLVED):** D3 (2026-05-22) wins. User-controlled dropdown, default 1.

4. **Brand Kit as canvas frame vs. dedicated page (RESOLVED):** D5 (2026-05-22) wins. Dedicated page/route, Phase 2+ scope.

5. **Brand Vault as unified vs. split surface (RESOLVED):** PRD v1.4 (2026-05-22) wins. Two surfaces: Asset/Image Library (Phase 1) + Brand Identity Vault (Phase 2+).

6. **VVOW Architecture "single source of truth" claim (OPEN):** The claim is incorrect as written post-PRD v1.4. The pending VVOW v2.1 dispatch (9 §-by-§ BEFORE/AFTER pairs, authored by Manus Architect VIYO 4 session, not yet executed by Curator) will correct this. Until that dispatch executes, treat VVOW Architecture as SUPERSEDED IN PART per the rules above.

7. **VVOW v2.1 dispatch predates PRD v1.4 + UI/UX Spec (OPEN — timing conflict):** The existing VVOW v2.1 dispatch was authored 2026-05-20. PRD v1.4 and UI/UX Spec v1.0 were created 2026-05-21. The dispatch cannot incorporate the two canonical documents that came after it. When the dispatch is relayed to the Curator, it must be reviewed against PRD v1.4 + UI/UX Spec v1.0 before execution — it may require re-authoring rather than straight execution.

8. **Lock 40 (RESOLVED):** Lock 40 = Source-Never-Shown Invariant. RATIFIED. Code-review gate: any PR containing a code path returning raw source-inspiration image bytes to a user-facing surface fails the gate. Notion Foundation Locks DB page: `https://www.notion.so/3679a84a4679818cbbf7c73eea41907b` (page ID `3679a84a4679818cbbf7c73eea41907b`). Activates when Pattern Seeding code first touches the repo — not now. Paired with OD-024 (per-source ToS verification). Both must close before Pattern Seeding ships. Safe to cite in directives.

9. **VIYO_IMAGE_STUDIO_SYSTEM_DIAGRAM (RESOLVED — Drive ID outstanding):** Confirmed via local copy read (2026-05-22). Four Mermaid diagrams. CANONICAL. Drive ID not yet confirmed — file did not surface in Drive search. See Entry 10 for full scope. Outstanding action: PO to provide Drive ID for canonical Drive copy.

10. **UI/UX Spec §23 open decisions D1, D2, D4, D6 not yet PO-ratified (OPEN):** D1 (Design Chat right / Brand Vault left), D2 (Auto-detect as Mode default), D4 (`ⓘ why these models` at launch vs. post-launch), D6 (Status Strip auto-peek vs. always-on). These are flagged in §23 as "Flagged for PO confirmation." No blocking decisions — reasonable defaults documented — but PO ratification is needed before Manus builds those specific components.

---

*End of CANONICAL_DOCS_REGISTRY.md*
