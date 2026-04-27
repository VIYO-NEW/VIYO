/**
 * API v1 Router — R18, T4, T8, T9
 * Aggregates all versioned route modules under /api/v1.
 */
import { Hono } from 'hono';
import { workspaceRoutes } from './workspaces.js';
import { productRoutes } from './products.js';
import credentials from './credentials.js';
import { billingRoutes } from './billing.js';
import { adminBillingRoutes } from './admin-billing.js';

const v1Router = new Hono();

v1Router.route('/workspaces', workspaceRoutes);
v1Router.route('/products', productRoutes);

// Nested: /api/v1/workspaces/:workspaceId/credentials
v1Router.route('/workspaces/:workspaceId/credentials', credentials);

// Billing routes — T9
v1Router.route('/billing', billingRoutes);

// Admin billing routes — T9 §11
v1Router.route('/admin/billing', adminBillingRoutes);

export { v1Router };
