/**
 * API v1 Router — R18
 * Aggregates all versioned route modules under /api/v1.
 */
import { Hono } from 'hono';
import { workspaceRoutes } from './workspaces.js';
import { productRoutes } from './products.js';

const v1Router = new Hono();

v1Router.route('/workspaces', workspaceRoutes);
v1Router.route('/products', productRoutes);

export { v1Router };
