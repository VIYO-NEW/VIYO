/**
 * API v1 Router — R18, T4, T8
 * Aggregates all versioned route modules under /api/v1.
 */
import { Hono } from 'hono';
import { workspaceRoutes } from './workspaces.js';
import { productRoutes } from './products.js';
import credentials from './credentials.js';

const v1Router = new Hono();

v1Router.route('/workspaces', workspaceRoutes);
v1Router.route('/products', productRoutes);

// Nested: /api/v1/workspaces/:workspaceId/credentials
v1Router.route('/workspaces/:workspaceId/credentials', credentials);

export { v1Router };
