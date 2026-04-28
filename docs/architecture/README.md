# VIYO Architecture Locks Index

**Author:** Manus AI
**Status:** PO-authorized source-of-truth index
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Current Architecture-Lock Set:** v3.0 (PRD Product Architect Depth)
**Update Description:** Replaced the prior v1 architecture-lock registry with the PO-approved v3.0 replacement set and preserved the confirmed Option A composite mapping.
**Update Reason:** PO instruction dated 2026-04-27 directed full replacement of the earlier architecture-lock content before T45 proceeds.

This directory contains PO-authorized architecture locks for Sprint 2 implementation scopes. These files are intentionally stored in `docs/architecture/` by direct Product Owner authorization. The storage location is a documented Sprint 2 exception to the general protocol guidance that architecture-lock source documents are not normally committed to the repository.

The Product Owner confirmed on 2026-04-27 that the PO Directive attachment is the source of truth for composite Taskmaster numbering. Therefore, **T45 is Composite Database Foundation (T16-T20)**, **T46 is Art Director Routing Suite**, **T47 is Studio Editing Tools**, and **T48 is Webhook Pipeline**. **Brand Chat and Comments remains a pre-approved architecture lock only** and has no composite task number unless a later PO directive supersedes this index.

> The prior v1 repository locks are obsolete. The four v3.0 architecture locks listed below supersede earlier file content, draft context, task assumptions, builder prompts, schema sketches, endpoint drafts, event catalogs, tool matrices, and scoring formulas for their covered scopes unless a later PO-approved source explicitly supersedes them.

## Source-of-Truth Replacement Record

| Replacement Area | Locked Decision |
|---|---|
| Version label | Use **v3.0 (PRD Product Architect Depth)** because the replacement attachments themselves use that version label. |
| Commit scope | Replace all four architecture-lock files and this index. |
| Brand Chat enum ruling | The `comment_target_type` enum contains 11 valid values. `general` is valid and is the catch-all for brand-level comments that do not attach to a specific asset. |
| T45 start status | Do not start T45 after this replacement pass. Await PO confirmation that updated skills are ready. |
| Replacement source | `PO_Instruction_Architecture_Lock_Corrections_&_Source-of-Truth_Enforcement.docx` plus the four v3.0 architecture-lock attachments. |

## Architecture Lock Registry

| Composite Task | Architecture Lock | Covered Tasks | Version | Replacement Source File |
|---:|---|---|---|---|
| Not assigned | [Brand Chat and Comments Subsystem](./brand-chat-comments-subsystem.md) | T33, T34, T35, T36 | v3.0 | `Architecture_Lock_Brand_Chat_&_Comments_Subsystem_(T33-T36).docx` |
| T46 | [Art Director Routing Suite](./art-director-routing-suite.md) | T21, T22, T23 | v3.0 | `Architecture_Lock_Art_Director_Routing_Suite_(T46).docx` |
| T47 | [Studio Editing Tools](./studio-editing-tools.md) | T27, T28, T29, T30 | v3.0 | `Architecture_Lock_Studio_Editing_Tools_(T47).docx` |
| T48 | [Webhook Pipeline Subsystem](./webhook-pipeline.md) | T37, T38, T39 | v3.0 | `Architecture_Lock_Webhook_Pipeline_Subsystem_(T37,_T38,_T39).docx` |

## Operating Rule for Builders

Builders must treat these files as the authoritative Phase 2 architecture-lock sources for the covered tasks. If an individual Taskmaster task description, previous repository document, draft handoff, schema note, event list, scoring formula, implementation prompt, or builder assumption conflicts with the corresponding architecture lock, the v3.0 architecture lock takes precedence unless the Product Owner later provides an explicit superseding directive.

## Required Phase Mapping

| Legacy Directive Label | Updated VIYO Protocol Phase | Required Tracking Label |
|---|---:|---|
| Architecture Lock / Architecture Plan | Phase 2 | Phase 2 |
| Implementation | Phase 4 | Phase 4 |
| Post-Build / Airtable | Phase 9 | Phase 9 |

## v3.0 Scope Corrections

| Area | Superseded v1 Assumption | v3.0 Source-of-Truth Correction |
|---|---|---|
| Brand Chat and Comments | Narrower schema/API coverage and ambiguous earlier composite-task association. | Brand Chat is architecture-only, covers T33-T36, uses the exact 11-value entity enum, supports `anchor_x` and `anchor_y`, mentions, references, tRPC creation flow, RLS, and `team.mention.created`. |
| Webhook Pipeline | Six-event catalog and older dispatcher assumptions. | Webhook Pipeline uses the exact 22-event catalog, signed payloads with `X-VIYO-Signature`, Inngest retry schedule, delivery logs, and auto-disable at 10 consecutive failures. |
| Art Director Routing | Ambiguous score formula that allowed an operator-precedence bug. | Art Director Routing uses the explicitly parenthesized formula `((baseQualityScore * 0.4) + (costEfficiencyScore * 0.3)) * freshnessPenalty * tierMultiplier`, plus the locked `artDirector.routeGeneration` tRPC contract and token-economics behavior. |
| Studio Editing Tools | Three-tool summary covering Touch Edit, Layer Split, and Background Swap only. | Studio Editing Tools implements the 10-tool matrix, token deduction/refund flow, unified `POST /api/studio/edit` API, asset lineage, `image.edit.completed`, and `image.edit.failed`. |

## Completion Notes

This index does not start implementation work. It records the approved v3.0 source-of-truth replacement documents and the phase-number mapping required for subsequent Taskmaster, Airtable, commit, and delivery records. Per PO direction, **T45 must not begin after this replacement pass** until the Product Owner confirms that the updated quality gate, task-sizing gate, protocol v2, and post-build pipeline-existence-check skills are ready.
