# Architecture Lock: Studio Editing Tools

**Author:** Manus AI
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T47
**Covered Implementation Tasks:** T27, T28, T29
**Primary Source:** `/home/ubuntu/upload/Pre-Approved_Architecture_Lock_Studio_Editing_Tools.docx`

> This file records the Product Owner-approved architecture lock for Studio Editing Tools. The source attachment used legacy wording that described the document as a Phase 1 architecture plan. Per PO confirmation on 2026-04-27, that label maps to the updated VIYO protocol as **Phase 2 — Architecture Lock**. Builders may reference this file as the authoritative repository source when preparing Phase 2 wiring and Phase 4 implementation work for the covered tasks.

## 1. Subsystem Purpose

The **Studio Editing Tools** subsystem provides a unified set of image-manipulation capabilities within the Freeform Canvas. It allows users to perform localized touch edits, separate subjects from backgrounds, and replace backgrounds through AI-powered editing APIs while preserving the original image in version history.

| Scope Element | Locked Decision |
|---|---|
| Primary UI integration | `src/components/studio/FreeformCanvas.tsx` |
| Touch Edit endpoint | `/api/studio/edit/inpaint` |
| Layer Split endpoint | `/api/studio/edit/remove-bg` |
| Background Swap endpoint | `/api/studio/edit/swap-bg` |
| Versioning dependency | Version History Panel, T30 |
| Composite execution wrapper | T47 |

## 2. Locked Components

### 2.1 Touch Edit — T27

Touch Edit is integrated into `src/components/studio/FreeformCanvas.tsx`. It implements a brush tool for localized inpainting. Users paint over a specific area of an image and provide a text prompt describing the desired change. The frontend calls a backend endpoint, for example `/api/studio/edit/inpaint`, backed by an inpainting model such as SDXL Inpainting or DALL-E 2 Edit.

### 2.2 Layer Split — T28

Layer Split is integrated into `src/components/studio/FreeformCanvas.tsx`. It provides one-click subject isolation by calling a backend endpoint, for example `/api/studio/edit/remove-bg`, backed by a background-removal API such as Photoroom or a custom model. The endpoint returns the isolated subject as a transparent PNG layer that can be manipulated independently on the canvas.

### 2.3 Background Swap — T29

Background Swap is integrated into `src/components/studio/FreeformCanvas.tsx`. It combines the Layer Split capability with a generative background prompt. Users select an image, provide a prompt for the new background, and the system isolates the subject, generates the replacement background, and composites the two outputs. The frontend calls a backend endpoint, for example `/api/studio/edit/swap-bg`, which orchestrates background removal and subsequent outpainting or compositing.

## 3. UI and Interaction Flow

| Step | Locked Flow |
|---|---|
| 1 | The user selects an image on the Freeform Canvas. |
| 2 | A context menu appears with options for Touch Edit, Layer Split, and Background Swap. |
| 3 | Touch Edit places the canvas into brush mode. |
| 4 | Layer Split presents a processing/loading state while the isolated subject is generated. |
| 5 | Background Swap presents a prompt input field before processing. |
| 6 | The edited image replaces the original image, or a new transparent layer is added for Layer Split. |
| 7 | The original image is preserved in the Version History Panel implemented by T30. |

## 4. Updated VIYO Protocol Mapping

| Directive Label in Source Attachment | Updated Protocol Phase | Operational Meaning |
|---|---:|---|
| Legacy “Phase 1 Architecture Plan” | Phase 2 | This file is the locked architecture source of truth. |
| Legacy “Phase 2 Wiring Blueprint” | Phase 3 | Builders prepare the narrow wiring plan from this lock. |
| Legacy implementation sequencing | Phase 4 | Builders execute implementation under the composite task wrapper. |
| Legacy post-build tracking | Phase 9 | Builders complete post-build, Airtable, and delivery records. |

## 5. Implementation Sequence Within Composite T47

The covered tasks are executed as a single composite protocol run under **T47**. The locked implementation sequence is shared canvas UI first, then **T28 → T29 → T27**. Builders must implement the shared context menu and loading states first, implement Layer Split as the foundational background-removal capability, implement Background Swap on top of the Layer Split logic, and finally implement Touch Edit with its distinct brush interaction model.

## 6. Supersession Rule

This architecture lock supersedes conflicting instructions in individual task descriptions for T27, T28, or T29. If a future implementation detail appears to conflict with this lock, the builder must stop and request PO clarification before modifying the architectural intent.
