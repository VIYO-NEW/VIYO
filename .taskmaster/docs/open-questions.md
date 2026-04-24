# VIYO Open Questions

## Resolved

| # | Question | Resolution | Date |
|:---:|:---|:---|:---|
| 1 | Tenant entity: "brands" vs "workspaces"? | Workspaces are primary tenant. Brands are children. (PO decision) | 2026-04-24 |
| 2 | Frontend: Vite SPA or Next.js? | Vite React SPA with TanStack Router + Zustand. (PO decision) | 2026-04-24 |
| 3 | Missing ARCH_LOCK_V3? | Found and downloaded. Now #2 authority doc. | 2026-04-24 |

## Open

| Gap ID | Description | Blocking? | Logged |
|:---|:---|:---|:---|
| GAP-20260424-1500 | DATABASE_URL not available via Supabase MCP. All DB routes return 503 until env var is manually set. Workaround: use Supabase MCP for migrations, manual connection string for runtime. | Non-Blocking | T4 |
| GAP-20260424-1501 | SUPABASE_URL not set in sandbox. JWT/API key auth returns 500 in local dev without env vars. Expected behavior — auth requires live Supabase instance. | Non-Blocking | T4 |
| GAP-20260424-1502 | Shared types drift: `packages/shared/src/types/workspace.ts` has `slug` and `owner_id` fields that do not exist in the Drizzle schema. `slug` is stored in `settings` jsonb; `owner_id` was replaced by `workspace_members` junction table (ADR-009). Needs cleanup in a future task. | Non-Blocking | T4 |
