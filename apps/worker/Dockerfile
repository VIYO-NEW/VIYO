# ============================================================
# VIYO Worker — Multi-stage Dockerfile for Render
# Authority: Doc4 §2.2, R21 §5
# ============================================================

# ---- Stage 1: Builder ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace root files first (for pnpm workspace resolution)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .nvmrc ./
COPY turbo.json tsconfig.base.json ./

# Copy all packages (needed for cross-package builds)
COPY packages/ ./packages/

# Copy the worker app
COPY apps/worker/ ./apps/worker/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Build packages first (shared, db), then worker
RUN pnpm --filter @viyo/shared build && \
    pnpm --filter @viyo/db build && \
    pnpm --filter @viyo/worker build

# ---- Stage 2: Production Runner ----
FROM node:22-alpine AS runner

WORKDIR /app

# Add non-root user for security
RUN addgroup --system viyo && adduser --system --ingroup viyo viyo

# Copy built artifacts
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./

# Copy node_modules (includes workspace dependencies)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@viyo/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@viyo/shared/package.json
COPY --from=builder /app/packages/db/dist ./node_modules/@viyo/db/dist
COPY --from=builder /app/packages/db/package.json ./node_modules/@viyo/db/package.json

# Set ownership
RUN chown -R viyo:viyo /app

USER viyo

# Expose port (Render assigns PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the worker
CMD ["node", "dist/index.js"]
