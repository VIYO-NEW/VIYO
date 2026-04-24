# VIYO Source Map

## Monorepo Structure (T1)

| Path | Package | Purpose | Key Exports |
|:---|:---|:---|:---|
| `apps/web` | `@viyo/web` | Vite React SPA (app.viyo.new) | — |
| `apps/worker` | `@viyo/worker` | Hono API server (api.viyo.new) | Health route |
| `apps/admin` | `@viyo/admin` | Admin portal (admin.viyo.new) | — |
| `packages/shared` | `@viyo/shared` | TypeScript types, Zod schemas | `Workspace`, `Brand`, `WorkspaceMember` |
| `packages/db` | `@viyo/db` | Drizzle ORM schema, migrations | `DB_PACKAGE_VERSION` |
| `packages/ui` | `@viyo/ui` | React components, Tailwind preset | `Button`, `cn()`, tailwind-preset |

## Cross-Package Import Map

| Consumer | Imports From | What |
|:---|:---|:---|
| `apps/web` | `@viyo/shared` | `Workspace` type |
| `apps/web` | `@viyo/ui` | `Button` component |
| `apps/web` | `@viyo/ui/tailwind-preset` | Tailwind config preset |
| `apps/admin` | `@viyo/shared` | `Workspace` type |
| `apps/admin` | `@viyo/ui` | `Button` component |
| `apps/admin` | `@viyo/ui/tailwind-preset` | Tailwind config preset |
