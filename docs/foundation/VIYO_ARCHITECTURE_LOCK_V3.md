# VIYO Architecture Lock V3

**Date:** April 24, 2026
**Status:** FINAL AUTHORITY (Tie-breaker for all conflicts)

This document serves as the supreme architectural authority for the VIYO Phase 0 build. It resolves all conflicts between Foundation Docs (Doc1-11) and Research Specs (R17-R31).

## 1. Primary Tenant Entity: WORKSPACES
*   **Decision:** The primary tenant entity is the `workspace`.
*   **Hierarchy:** `workspace` -> `brands`.
*   **Authority:** R20 (Database Schema Lock) and R22 (Security).
*   **Implementation:** All data (campaigns, flows, credits) must be scoped to a `workspace_id`. Users belong to workspaces via `workspace_members`. One workspace may manage multiple brands.

## 2. Frontend Framework: VITE REACT SPA
*   **Decision:** The frontend is a **Vite-based React Single Page Application (SPA)**.
*   **Stack:** React + TypeScript + Tailwind CSS + TanStack Router + Zustand.
*   **Authority:** Doc1 (Master PRD) and Build Tracker P4-01.
*   **Rationale:** Clean separation of concerns. Frontend is hosted as a static site on Vercel. All server-side logic resides in the Render-hosted API.

## 3. Backend API Layer: HONO ON RENDER
*   **Decision:** The backend API is built using **Hono** running on **Render** (apps/worker).
*   **Authority:** Doc1 and R21 (Infrastructure).
*   **Implementation:** Handles all business logic, tool calls, and orchestration. Connects to Supabase (PostgreSQL) and Inngest.

## 4. Database & Auth: SUPABASE
*   **Decision:** Use **Supabase** for PostgreSQL, Auth, and RLS.
*   **Authority:** R20 and R22.
*   **Implementation:** Workspace-scoped RLS is mandatory for every table.

## 5. Build Priority
*   Follow the 10-task order defined in the Phase 0 Execution Plan: Monorepo Scaffold -> Internal Records -> DB Schema -> Auth/RLS -> API Foundation -> Inngest -> Vault -> Stripe -> Admin Skeleton -> CI/CD.

---
**Approved by:** PO & Manus AI
**Next Action:** Initialize Turborepo (Task T1).
