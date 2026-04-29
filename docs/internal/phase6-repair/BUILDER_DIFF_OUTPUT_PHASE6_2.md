# Builder Diff Output — Phase 6.2 Image Studio Correction + Phased Security

**Prepared by:** Manus AI
**Date:** 2026-04-28
**Broadcast Record:** `recqGyk0oIekpYEe9`
**Broadcast Status Target:** `Diff Proposed`
**Scope:** Proposed Taskmaster graph diff only. No product-code implementation is included.

## 1. Required Accountability Answer

The PO directive asks: **“Why did you not run `task-master parse-prd` on the PRD V5 Addendum before building Phase 6?”**

The honest answer is scenario **10**: **the PRD V5 Addendum was read manually, but its requirements were not operationalized into Taskmaster before Phase 6 UI work proceeded.** The failure was not absence of the document and not a pre-build parse error. The failure was treating the existing T24–T34 graph as sufficient after manual source review, which allowed PRD V5 Addendum §26’s full standalone Image Studio scope to remain outside the execution graph.

## 2. Taskmaster Parse-PRD Evidence

The directive required Taskmaster re-ingestion. I created a combined ingestion source at:

`docs/internal/phase6-repair/TASKMASTER_PHASE6_2_REINGESTION_INPUT.md`

The required `task-master parse-prd` command was executed twice:

| Attempt | Command Evidence | Result |
|---|---|---|
| 1 | `docs/internal/phase6-repair/taskmaster_parse_prd_phase6_2_command_output.txt` | Failed because the output JSON path had to exist before Taskmaster would use it. |
| 2 | `docs/internal/phase6-repair/taskmaster_parse_prd_phase6_2_retry_command_output.txt` | Failed after provider retries with `OpenAI API error during object generation: Invalid JSON response`. The original Taskmaster model config was restored after the retry. |

Because Taskmaster’s provider call failed externally after the mandated parse was attempted, this Builder Diff Output provides the proposed graph deterministically from the PO directive, PRD V5 Addendum, Architecture Lock v6.1, T46 Gap Addendum, and security addenda. Product-code work remains blocked until the PO approves the diff.

## 3. Proposed Task Graph Diff Summary

| Change Type | Proposed Change |
|---|---|
| Approved prior graph retained | Keep the prior Phase 6.2 corrective direction: re-ingest sources, repair T46 routing/schema gaps, rebuild Image Studio as a standalone design tool, and verify against PRD §26 and Architecture Lock v6.1. |
| Modification A applied | Replace grouped T51 with T51a, T51b, and T51c. |
| Modification B applied | Add T51d as the explicit pre-T52 Taskmaster re-parse evidence gate. |
| Modification C applied | Update T59 with explicit A3, A4, A8, A9, A13, A14, A15, and A16 multi-model UI acceptance criteria from Architecture Lock v6.1 §3.1.1. |
| Modification D applied | Defer T64 Freeform Canvas and T65 Collaboration Pins to V1.1; remove both from active sprint execution. |
| Security directive applied | Phase 0 security is immediate before next commit; later security controls are triggered by first auth/database code, first public deployment, Image Studio/Brand Vault live upload/fetch, and first paying customer. |

## 4. Proposed Active Task Graph

| ID | Title | Dependencies | Trigger | Acceptance Criteria |
|---|---|---|---|---|
| T47 | Architecture Broadcast Ingestion Handshake | None | Start of every task session | Query Architecture Broadcasts; if pending, halt planned work, download attached Drive docs, run ingestion, write diff to Builder Diff Output, set status to `Diff Proposed`, and stop for PO approval. |
| T48 | SEC-18 Branch Protection Gate | T47 after PO approval | Phase 0 / before next commit | Main branch requires PR review, required status checks, and force-push prevention. Direct pushes to main are blocked. Evidence is captured from GitHub settings or CLI/API output. |
| T49 | Phase 0 Secret-Exposure Controls | T48 | Phase 0 / before next commit | Install TruffleHog pre-commit hook; enable GitHub secret scanning if available; audit `.gitignore` for `.env`, `.env.local`, `.env.production`, key files; run `git log --all --full-history -- '*.env*'` and save evidence. |
| T50 | SEC-02 Encryption Foundation Readiness | T49 | Foundation before sensitive-token storage | Confirm AES-256-GCM implementation path for OAuth tokens, API keys, webhook secrets, and other Restricted-class data. No plaintext secret persistence may be introduced by Phase 6. |
| T51a | SEC-14 and SEC-15 Auth Hardening | T50 | First auth/database code | Implement password complexity, bcrypt cost 10+, HaveIBeenPwned k-anonymity check, last-5 password reuse prevention, and brute-force lockout controls when auth surface is built. |
| T51b | SEC-04 and SEC-05 Network Hardening | T50 | Split trigger: first auth/database code and first public deployment | Implement security headers with the first auth/database surface; implement rate limiting at first public deployment using the directive’s limits. Preserve trigger notes so headers are not delayed until deployment and rate limiting is not exposed prematurely without infrastructure. |
| T51c | SEC-07 and SEC-08 CI Hardening | T49 | Split trigger: Phase 0 and before first paying customer | Phase 0 includes push-time secret scanning controls. SAST/SCA with CodeQL and Dependabot is required before first paying customer, with Critical/High findings blocking merge. |
| T51d | Explicit Taskmaster Re-Parse Evidence Gate | T47 | Before T52 | Run `task-master parse-prd` on the PRD V5 Addendum and Architecture Lock v6.1 ingestion bundle; save command output; ensure local `.taskmaster/` state can be reconciled with the approved Airtable task graph. If provider failure occurs, record failure evidence and use PO-approved deterministic diff. |
| T52 | T46 Gap Repair — Provider Registry and Shared Contracts | T51d | Phase 6.2 foundation | Repair Visual Engine provider inventory to cover 22+ generation models, 10 editing tools, provider tier metadata, mode contracts, editing-tool contracts, and Art Director Router schema parity. |
| T53 | T46 Gap Repair — Cache-First Router and Pattern DB Integration | T52 | Phase 6.2 foundation | Image generation requests query Pattern DB before model execution, surface cached pattern vs zero-shot path, preserve fallback routing, and include scoring metadata for user-facing visibility. |
| T54 | Billing and Token Economics Foundation | T52 | Before generation/edit UI execution | Every generation/edit path has token estimate display, pre-execution balance check, atomic deduction where backend surface exists, graceful `insufficient_balance` recovery, and cost reconciliation notes. |
| T55 | R2 Auto-Save and Brand Vault Asset Contract | T52 | Before Studio output persistence | Generated and edited outputs auto-save to R2/assets with workspace and brand isolation, metadata tags, source mode, prompt/style reference, and email-editor availability. |
| T56 | Editing Router Coverage for 10 Tools | T52 | Before editing UI exposure | Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, and Material Swap are wired to backend-supported capabilities only. No unwired placeholder buttons. |
| T57 | Standalone Studio Route, Navigation, and Brand Scope | T52 | Phase 6.2 UI foundation | Build `/brand/[brandId]/studio` as standalone brand-scoped workspace reachable from main navigation with tenant-safe route handling and no cross-brand data leakage. |
| T58 | Conversational Studio Shell and Slash Commands | T57 | Phase 6.2 UI | Provide chat-based interaction model, natural-language prompt entry, command parsing for slash commands such as `/mockup` and `/poster`, command history/session context, and mode-picker parity. |
| T59 | Generation Mode Matrix with Explicit v6.1 Multi-Model Flows | T58, T53, T54 | Phase 6.2 UI | Cover all A1–A22 modes and explicitly implement UI requirements for A3 compositional poster, A4 brand mockup, A8 platform-specific social templates, A9 palette extraction, A13 style invention, A14 seasonal themes, A15 unified brand kit, and A16 before/after comparison. Details are listed in Section 5. |
| T60 | Aspect Ratio, Platform Sizing, and Output-Shape Controls | T59 | Before generation submit | UI requires aspect ratio/platform sizing before generation where relevant; A8 must expose IG, FB, Pinterest, YouTube or equivalent target sizes; export output shape is visible before model call. |
| T61 | Style and Prompt Library | T58 | Phase 6.2 UI | Implement Pre-Built Templates, Industry Prompt Packs, User-Saved Styles, Brand Style Lock, and deferred Community Styles notation without exposing unfinished marketplace actions. |
| T62 | Error, Timeout, Scoring, and Feature-Flag Visibility | T58, T53 | Phase 6.2 UI | Show generation failure states, timeout states, retry affordances, cached-pattern vs zero-shot path, score/routing metadata, and feature-flag status for gated router capabilities. |
| T63 | Multi-Format Export and Resolution Choices | T55, T59 | Phase 6.2 UI | Support PNG, JPG, WebP, and PDF export with resolution choices, transparent PNG where supported, multi-size output handling, direct-to-email insertion, and Brand Kit save metadata. |
| T64 | Version History and Multi-Image Project Organization | T57, T55 | Active Phase 6.2 workspace | Provide session-level version history and multi-image organization. This replaces the prior Freeform Canvas active task; full freeform infinite canvas is deferred to V1.1. |
| T65 | Accessibility and No-Placeholder UI Compliance | T57–T64 | Phase 6.2 QA | WCAG 2.1 AA keyboard/focus/label/contrast checks pass; no visible mode, editing tool, export action, or library action is present unless wired to supported backend behavior or clearly deferred outside the active UI. |
| T66 | Unit and Integration Test Expansion | T57–T65 | Verification | Add tests for slash commands, aspect/platform selector, token estimate and insufficient balance, style library, error/scoring visibility, export selection, and mode-specific multi-step requirements. |
| T67 | Static Wiring and Type Validation | T52–T66 | Verification | Run lint, type-check, schema validation, and import/wiring checks. Confirm route, component, API client, shared schema, and router contract alignment. |
| T68 | Browser Validation and Visual Evidence | T57–T67 | Verification | Launch the web app locally, exercise the Studio workflow in-browser, capture evidence for the six PO rejection gaps and v6.1 multi-model UI gates. |
| T69 | Security Trigger Verification Matrix | T48–T68 | Verification | Produce a matrix proving Phase 0 is complete before commit and documenting which Phase 1–4 controls are triggered now, deferred by attack surface, or blocked by PO approval. |
| T70 | Airtable Build Tracker Sync After PO Diff Approval | T47–T69 | After PO approval only | Sync the approved graph to Airtable Build Tracker. Do not sync unapproved task mutations as active execution tasks. |
| T71 | Final Quality Gate and Source-of-Truth Reconciliation | T66–T70 | Completion | Run VIYO quality gate; reconcile final implementation evidence against PRD §26, Architecture Lock v6.1, T46 Gap Addendum, and security trigger addenda. |
| T72 | PO Approval Stop Before Phase 7 | T71 | Completion | Deliver acceptance evidence and stop. Do not proceed to Phase 7 until PO explicitly accepts Phase 6.2 completion. |

## 5. T59 Explicit Multi-Model Acceptance Criteria

| Mode | Required UI Flow Acceptance Criteria |
|---|---|
| A3 Compositional Poster | Collect prompt and optional product `@` mention; disclose RMBG background removal, Flux background generation, Ideogram typography overlay, and server-side compositing lifecycle. |
| A4 Brand Mockup | Collect base image, brand asset `@` mention, and target region description; support SAM mask, ControlNet warp, and Sharp compositing lifecycle. |
| A8 Social Media Templates | Require target platform such as IG, FB, Pinterest, or YouTube; expose correct aspect ratio/platform sizing before generation; disclose template overlay compositing. |
| A9 Color Palette Extraction | Accept image URL/upload or prompt source; surface BLIP-2 semantic extraction, node-vibrant hex extraction, and Claude naming output shape. |
| A13 Style Invention | Accept abstract style prompt; present four MCoT prompt branches and selection flow for four generated images. |
| A14 Seasonal/Holiday Themes | Accept base product image and holiday name; surface Pattern DB template lookup before Nano Banana Pro Edit execution. |
| A15 Unified Brand Kit | Accept brand description prompt; present logo, palette, and imagery output grouping from Recraft, Claude palette generation, and Flux imagery. |
| A16 Before/After Comparison | Reuse A4-style mask/warp/composite flow and require side-by-side before/after output handling. |

## 6. Deferred to V1.1 and Removed from Active Sprint

| Prior Task | PO Decision | Proposed Handling |
|---|---|---|
| T64 Freeform Canvas | Defer to V1.1 | Removed from active sprint. Active T64 is now limited to version history and multi-image project organization. |
| T65 Collaboration Pins | Defer to V1.1 | Removed from active sprint. Pin-on-canvas comments remain future V1.1 collaboration scope. |

## 7. Source Coverage Matrix

| Source Requirement | Covered By Proposed Tasks |
|---|---|
| Architecture Broadcast handshake | T47 |
| Phase 0 security before next commit | T48, T49 |
| Four mandatory PO modifications | T51a, T51b, T51c, T51d, T59, T64, T65 |
| T46 provider/schema/router gap repair | T52–T56 |
| PRD §26 standalone Studio route and workspace | T57–T64 |
| Conversational slash-command interface | T58 |
| Aspect ratio/platform selector | T60 |
| Token economics and insufficient-balance handling | T54 |
| Error states, timeout states, scoring visibility, cached vs zero-shot display | T62 |
| Style and prompt library | T61 |
| Multi-format export and resolution choices | T63 |
| Accessibility and no-placeholder rule | T65 |
| Verification and evidence | T66–T72 |

## 8. Stop Condition

This diff is proposed for PO review only. After writing this diff to Airtable and setting the Architecture Broadcast record to `Diff Proposed`, all implementation remains blocked until the PO changes the broadcast status to `PO Approved`.
