# VIYO

AI-Powered Email Marketing Platform.

## Architecture

```
viyo/
├── apps/
│   ├── web/        → Vite React SPA (app.viyo.new)
│   ├── worker/     → Hono API Server (api.viyo.new)
│   └── admin/      → Vite React Admin Portal (admin.viyo.new)
└── packages/
    ├── shared/     → TypeScript types, Zod schemas, utilities
    ├── db/         → Drizzle ORM schema, migrations, client
    └── ui/         → Shared React components (Radix + shadcn/ui + Tailwind)
```

## Tech Stack

| Layer | Technology | Authority |
|:---|:---|:---|
| Frontend | Vite + React + TanStack Router + Zustand + Tailwind | ARCH_LOCK_V3 §2 |
| Backend | Hono on Node.js (Render) | ARCH_LOCK_V3 §3 |
| Database | Supabase PostgreSQL + Drizzle ORM | ARCH_LOCK_V3 §4, R20 |
| Auth | Supabase Auth + workspace-scoped RLS | R22 |
| Events | Inngest | R18, R21 |
| Monorepo | Turborepo + pnpm workspaces | Doc4 §0.1 |

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development servers
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Run tests
pnpm test
```

## Development Ports

| App | Port | URL |
|:---|:---|:---|
| web | 5173 | http://localhost:5173 |
| admin | 5174 | http://localhost:5174 |
| worker | 3001 | http://localhost:3001 |

## Environment Variables

Copy `.env.example` to `.env` and fill in values. See the file for documentation on each variable.
