/**
 * Product API Schemas — R18, R20, R31
 * Zod schemas for request validation on product CRUD endpoints.
 */
import { z } from 'zod';

/** POST /api/v1/products — create a new product */
export const createProductSchema = z.object({
  sourceUrl: z.string().url('sourceUrl must be a valid URL'),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a decimal with up to 2 places').optional(),
  currency: z.string().length(3).default('USD'),
  category: z.string().max(100).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/** PATCH /api/v1/products/:id — update product data */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  currency: z.string().length(3).optional(),
  category: z.string().max(100).optional(),
  thumbnailUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  extractedData: z.record(z.unknown()).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/** GET /api/v1/products — list query params */
export const listProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

/** Route param for single product operations */
export const productParamsSchema = z.object({
  id: z.string().uuid('Product ID must be a valid UUID'),
});

export type ProductParams = z.infer<typeof productParamsSchema>;
