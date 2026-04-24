/**
 * Product Routes — R18, R20, R31
 * CRUD endpoints for viyo_products.
 * All routes require authentication. Products are workspace-scoped.
 */
import { Hono } from 'hono';
import { eq, and, sql } from 'drizzle-orm';
import { viyoProducts } from '@viyo/db';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productParamsSchema,
  type AuthContext,
} from '@viyo/shared';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate.js';
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

const productRoutes = new Hono<RouteEnv>();

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new ApiError(503, 'Database not available. DATABASE_URL is not configured.');
  }
  return db;
}

/**
 * GET /api/v1/products
 * List products for the current workspace with pagination and optional filters.
 */
productRoutes.get('/', validateQuery(listProductsQuerySchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const query = c.get('validatedQuery') as {
    limit: number;
    offset: number;
    category?: string;
    isActive?: boolean;
  };

  const conditions = [eq(viyoProducts.workspaceId, auth.workspaceId)];

  if (query.category) {
    conditions.push(eq(viyoProducts.category, query.category));
  }
  if (query.isActive !== undefined) {
    conditions.push(eq(viyoProducts.isActive, query.isActive));
  }

  const whereClause = conditions.length === 1 ? conditions[0]! : and(...conditions)!;

  const [products, countResult] = await Promise.all([
    db
      .select()
      .from(viyoProducts)
      .where(whereClause)
      .limit(query.limit)
      .offset(query.offset)
      .orderBy(viyoProducts.createdAt),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(viyoProducts)
      .where(whereClause),
  ]);

  return c.json({
    data: products,
    pagination: {
      total: countResult[0]?.count ?? 0,
      limit: query.limit,
      offset: query.offset,
    },
  });
});

/**
 * GET /api/v1/products/:id
 * Get a single product by ID (workspace-scoped).
 */
productRoutes.get('/:id', validateParams(productParamsSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const { id } = c.get('validatedParams') as { id: string };

  const [product] = await db
    .select()
    .from(viyoProducts)
    .where(and(eq(viyoProducts.id, id), eq(viyoProducts.workspaceId, auth.workspaceId)))
    .limit(1);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return c.json({ data: product });
});

/**
 * POST /api/v1/products
 * Create a new product in the current workspace.
 */
productRoutes.post('/', validateBody(createProductSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const body = c.get('validatedBody') as {
    sourceUrl: string;
    name: string;
    description?: string;
    price?: string;
    currency: string;
    category?: string;
    thumbnailUrl?: string;
  };

  const [created] = await db
    .insert(viyoProducts)
    .values({
      workspaceId: auth.workspaceId,
      sourceUrl: body.sourceUrl,
      name: body.name,
      description: body.description ?? null,
      price: body.price ?? null,
      currency: body.currency,
      category: body.category ?? null,
      thumbnailUrl: body.thumbnailUrl ?? null,
    })
    .returning();

  if (!created) {
    throw new ApiError(500, 'Failed to create product');
  }

  return c.json({ data: created }, 201);
});

/**
 * PATCH /api/v1/products/:id
 * Update a product in the current workspace.
 */
productRoutes.patch('/:id', validateParams(productParamsSchema), validateBody(updateProductSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const { id } = c.get('validatedParams') as { id: string };
  const body = c.get('validatedBody') as Record<string, unknown>;

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  const [updated] = await db
    .update(viyoProducts)
    .set(updateData)
    .where(and(eq(viyoProducts.id, id), eq(viyoProducts.workspaceId, auth.workspaceId)))
    .returning();

  if (!updated) {
    throw new ApiError(404, 'Product not found');
  }

  return c.json({ data: updated });
});

/**
 * DELETE /api/v1/products/:id
 * Soft-delete a product by setting isActive = false.
 */
productRoutes.delete('/:id', validateParams(productParamsSchema), async (c) => {
  const db = requireDb();
  const auth = c.get('auth');
  const { id } = c.get('validatedParams') as { id: string };

  const [deactivated] = await db
    .update(viyoProducts)
    .set({ isActive: false })
    .where(and(eq(viyoProducts.id, id), eq(viyoProducts.workspaceId, auth.workspaceId)))
    .returning();

  if (!deactivated) {
    throw new ApiError(404, 'Product not found');
  }

  return c.json({ data: { id, deleted: true } });
});

export { productRoutes };
