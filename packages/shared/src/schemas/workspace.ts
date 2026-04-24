/**
 * Workspace API Schemas — R18, R20
 * Zod schemas for request validation on workspace CRUD endpoints.
 * These are API-layer schemas (what the client sends/receives),
 * distinct from the DB-layer Drizzle schema.
 */
import { z } from 'zod';

/** POST /api/v1/workspaces — create a new workspace */
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(255),
  slug: z.string().min(1).max(100).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

/** PATCH /api/v1/workspaces/:id — update workspace settings */
export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  settings: z.record(z.unknown()).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

/** GET /api/v1/workspaces — list query params */
export const listWorkspacesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListWorkspacesQuery = z.infer<typeof listWorkspacesQuerySchema>;
