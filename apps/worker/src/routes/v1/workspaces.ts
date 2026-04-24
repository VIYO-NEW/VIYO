/**
 * Workspace Routes — R18, R20, R22
 * CRUD endpoints for workspace management.
 * All routes require authentication (handled by global auth middleware).
 * Workspace isolation enforced via AuthContext.workspaceId.
 */
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { workspaces } from '@viyo/db';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  type AuthContext,
} from '@viyo/shared';
import { validateBody } from '../../middleware/validate.js';
import { getDb } from '../../lib/db.js';
import { ApiError } from '../../middleware/error-handler.js';

/** Hono env type for routes that use auth + validation context vars */
type RouteEnv = {
  Variables: {
    auth: AuthContext;
    validatedBody: unknown;
    validatedQuery: unknown;
    validatedParams: unknown;
    requestId: string;
  };
};

const workspaceRoutes = new Hono<RouteEnv>();

/**
 * Require DB or return 503.
 */
function requireDb() {
  const db = getDb();
  if (!db) {
    throw new ApiError(503, 'Database not available. DATABASE_URL is not configured.');
  }
  return db;
}

/**
 * GET /api/v1/workspaces
 * Returns the current user's workspace (scoped by auth context).
 */
workspaceRoutes.get('/', async (c) => {
  const db = requireDb();
  const auth = c.get('auth');

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, auth.workspaceId))
    .limit(1);

  if (workspace.length === 0) {
    throw new ApiError(404, 'Workspace not found');
  }

  return c.json({ data: workspace[0] });
});

/**
 * POST /api/v1/workspaces
 * Create a new workspace. The authenticated user becomes the owner.
 */
workspaceRoutes.post('/', validateBody(createWorkspaceSchema), async (c) => {
  const db = requireDb();
  const body = c.get('validatedBody') as { name: string; slug?: string };

  const slug = body.slug ?? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const [created] = await db
    .insert(workspaces)
    .values({
      name: body.name,
      settings: { slug },
    })
    .returning();

  if (!created) {
    throw new ApiError(500, 'Failed to create workspace');
  }

  return c.json({ data: created }, 201);
});

/**
 * PATCH /api/v1/workspaces/:id
 * Update workspace settings. Requires owner or admin role.
 */
workspaceRoutes.patch('/:id', validateBody(updateWorkspaceSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const workspaceId = c.req.param('id');

  // Ensure user can only update their own workspace
  if (workspaceId !== auth.workspaceId) {
    throw new ApiError(403, 'Cannot update a workspace you do not belong to');
  }

  // Role check — only owner and admin can update
  if (auth.role !== 'owner' && auth.role !== 'admin') {
    throw new ApiError(403, 'Insufficient permissions. Requires owner or admin role.');
  }

  const body = c.get('validatedBody') as {
    name?: string;
    settings?: Record<string, unknown>;
    onboardingCompleted?: boolean;
  };

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.settings !== undefined) updateData.settings = body.settings;
  if (body.onboardingCompleted !== undefined) updateData.onboardingCompleted = body.onboardingCompleted;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  const [updated] = await db
    .update(workspaces)
    .set(updateData)
    .where(eq(workspaces.id, workspaceId))
    .returning();

  if (!updated) {
    throw new ApiError(404, 'Workspace not found');
  }

  return c.json({ data: updated });
});

export { workspaceRoutes };
