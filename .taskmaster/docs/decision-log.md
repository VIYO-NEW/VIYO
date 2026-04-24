# VIYO Decision Log

## ADR-001: Workspaces as Primary Tenant Entity

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: Doc1 uses "brands", R20 uses "workspaces"

The Product Owner ruled that **workspaces** are the primary tenant entity per R20. Brands are children of workspaces. All RLS policies, foreign keys, and type definitions use `workspace_id` as the scoping key.

## ADR-002: Vite React SPA with TanStack Router and Zustand

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: ARCH_LOCK_V3 specifies Vite React SPA

The frontend stack is Vite + React + TanStack Router + Zustand + Tailwind CSS, per Doc1 and ARCH_LOCK_V3 Section 2. No Next.js, no SSR.

## ADR-003: Doc1 + R20 as Architectural Authority

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: VIYO_ARCHITECTURE_LOCK_V3.md was missing at time of decision

The PO directed to proceed with Doc1 (Master PRD) and R20 (Database Schema Lock) as the combined architectural authority. ARCH_LOCK_V3 was subsequently found and downloaded, and now serves as the #2 authority document.

## ADR-004: ESLint Flat Config with TypeScript-ESLint

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No spec prescribes ESLint rules

Used `@eslint/js` + `typescript-eslint` recommended rules with ESLint 10 flat config. Added `consistent-type-imports` enforcement. No spec gap — this is a tooling decision within the scaffold scope.

## ADR-005: Node 22 LTS

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No spec prescribes Node version

Pinned Node 22 LTS in `.nvmrc` and `package.json engines`. This is the current LTS release and matches Render's supported Node versions.

## ADR-006: 14 Explicit R20 Tables Only (Not 83)

**Date**: 2026-04-24 | **Status**: Approved by PO | **Context**: R20 header says "83 tables across 14 domains" but only 14 tables are explicitly defined

R20 defines 14 tables with full DDL. The "83 tables" figure appears to be a projection of the full enterprise schema. The PO approved implementing only the 14 explicitly defined tables in T2, with additional tables (brands, workspace_members, credit_ledger, etc.) to be added in their respective tasks.

## ADR-007: Migration Ordering — Tables Before RLS

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: Circular dependency between workspaces RLS and users table

The initial migration had RLS policies inline with CREATE TABLE statements. The workspaces RLS policy references `public.users` which does not exist until later in the migration. Resolved by splitting into two phases within the same migration: all CREATE TABLE statements first, then all ALTER TABLE ENABLE ROW LEVEL SECURITY and CREATE POLICY statements second.

## ADR-008: Supabase MCP for Migration Application

**Date**: 2026-04-24 | **Status**: Decided by agent | **Context**: No direct DATABASE_URL available

Migrations are applied via the Supabase MCP `apply_migration` tool rather than Drizzle's `drizzle-kit push` command, because the Supabase access token provides management API access but not a direct PostgreSQL connection string. The Drizzle schema files serve as the TypeScript source of truth; the SQL migrations are the deployment artifacts.
