# VIYO Architecture Locks Index

**Author:** Manus AI
**Status:** PO-authorized source-of-truth index
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock

This directory contains PO-authorized architecture locks for Sprint 2 implementation scopes. These files are intentionally stored in `docs/architecture/` by direct Product Owner authorization. The storage location is a documented Sprint 2 exception to the general protocol guidance that architecture-lock source documents are not normally committed to the repository.

The Product Owner confirmed on 2026-04-27 that the PO Directive attachment is the source of truth for composite Taskmaster numbering. Therefore, **T45 is Composite Database Foundation (T16-T20)**, **T46 is Art Director Routing Suite**, **T47 is Studio Editing Tools**, and **T48 is Webhook Pipeline**. **Brand Chat and Comments remains a pre-approved architecture lock only** and has no composite task number unless a later PO directive supersedes this index.

> The source attachments used legacy protocol labels. Per PO confirmation on 2026-04-27, the labels map to the updated VIYO protocol as follows: **Architecture Lock → Phase 2**, **Implementation → Phase 4**, and **Post-Build/Airtable → Phase 9**. All tracking, records, and deliverables for these tasks must use the updated numbering.

## Architecture Lock Registry

| Composite Task | Architecture Lock | Covered Tasks | Source File |
|---:|---|---|---|
| Not assigned | [Brand Chat and Comments Subsystem](./brand-chat-comments-subsystem.md) | T33, T35, T36 | `Pre-Approved_Architecture_Lock_Brand_Chat_&_Comments_Subsystem.docx` |
| T46 | [Art Director Routing Suite](./art-director-routing-suite.md) | T21, T22, T23 | `Pre-Approved_Architecture_Lock_Art_Director_Routing_Suite.docx` |
| T47 | [Studio Editing Tools](./studio-editing-tools.md) | T27, T28, T29 | `Pre-Approved_Architecture_Lock_Studio_Editing_Tools.docx` |
| T48 | [Webhook Pipeline](./webhook-pipeline.md) | T37, T38, T39 | `Pre-Approved_Architecture_Lock_Webhook_Pipeline.docx` |

## Operating Rule for Builders

Builders must treat these files as the authoritative Phase 2 architecture-lock sources for the covered tasks. If an individual Taskmaster task description conflicts with the corresponding architecture lock, the architecture lock takes precedence unless the Product Owner later provides an explicit superseding directive.

## Required Phase Mapping

| Legacy Directive Label | Updated VIYO Protocol Phase | Required Tracking Label |
|---|---:|---|
| Architecture Lock / Architecture Plan | Phase 2 | Phase 2 |
| Implementation | Phase 4 | Phase 4 |
| Post-Build / Airtable | Phase 9 | Phase 9 |

## Completion Notes

This index does not start implementation work. It only records the approved source-of-truth documents and the phase-number mapping required for subsequent Taskmaster, Airtable, commit, and delivery records.
