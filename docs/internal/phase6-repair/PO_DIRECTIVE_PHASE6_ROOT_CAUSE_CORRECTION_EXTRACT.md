# PO Directive Extract — Phase 6 Root Cause Correction

**Source URL:** https://manus.im/share/file/c8132426-b265-47f1-a61c-bef13cfb76c3
**Read date:** 2026-04-28
**Status from directive:** Phase 6 UI build is blocked pending builder explanation and PO approval of a new Taskmaster todo.md plan.

## Critical rulings

The PO directive accepts the previous Phase 6 Image Studio UI delivery only as **Phase 6.1: Schema-Bound API Foundation**. The actual product UI remains incomplete because the UI was built from an outdated task graph and did not reflect the expanded PRD V5 Addendum §26 standalone Image Studio scope.

## Required explanation before corrective action

The builder must answer why the PRD V5 Addendum was not read or not operationalized before Phase 6 execution. The PO asks whether the builder did not read it, read it but treated it as out of scope, read it but Taskmaster did not generate tasks for it, or assumed the old T24–T34 graph was complete.

## Mandatory corrective action

1. Re-ingest the source of truth through Taskmaster:
   - PRD V5 Addendum §26 Image Studio.
   - T46 Routing Architecture Lock v6.1, especially §3.1.1 and UI requirements.
   - Doc 11 Security Architecture.
2. Generate a missing task graph covering the 52 PRD-defined Image Studio features and the six PO ruling UI gaps.
3. Do not sync new tasks to Airtable and do not write code before PO review.
4. Output the new Taskmaster todo.md plan for PO approval.
5. After PO approval only, sync to Airtable and execute as Phase 6.2, Phase 6.3, and later.

## New handshake protocol

Before starting any task in any session, the builder must query the Airtable **Architecture Broadcasts** table. If any record is `Pending Builder Ingestion`, planned work must halt. The builder downloads the broadcast file by Google Drive file ID, runs Taskmaster ingestion locally, proposes the diff back to the broadcast record, waits for `PO Approved`, and only then syncs tasks into the Build Tracker.

## Security blocker

All 19 SEC features are reported as `Not Started` in Airtable. The new task graph must include Phase 1 SEC tasks as hard prerequisites for any Phase 2+ feature work. The directive specifically calls out SEC-02, SEC-04, SEC-05, SEC-14, SEC-15, SEC-07, SEC-08, and SEC-18. SEC-18 must be implemented immediately before any more code is pushed.
