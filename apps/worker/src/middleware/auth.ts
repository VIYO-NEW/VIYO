/**
 * Auth Middleware — R22 §2, §3
 * Dual authentication strategy for Hono worker:
 * 1. JWT (user sessions): Authorization: Bearer <jwt> → verified via supabase.auth.getUser()
 * 2. API Key (M2M): Authorization: Bearer viyo_live_... → SHA-256 hash lookup
 *
 * Attaches AuthContext to Hono context via c.set('auth', context).
 * Public routes (health, root) are excluded via the skip list.
 */
import type { Context, Next } from 'hono';
import {
  createServerClient,
  createServiceRoleClient,
  isApiKey,
  verifyApiKey,
  type AuthContext,
  type SupabaseClient,
} from '@viyo/shared';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** Routes that do not require authentication */
const PUBLIC_PATHS = new Set(['/', '/health', '/health/']);

/** Hono env type for auth-protected routes */
export interface AuthEnv {
  Variables: {
    auth: AuthContext;
    supabase: SupabaseClient;
  };
}

/**
 * Hono middleware that authenticates requests via JWT or API key.
 * On success: sets c.var.auth (AuthContext) and c.var.supabase (scoped client).
 * On failure: returns 401 JSON response.
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const path = new URL(c.req.url).pathname;

  if (PUBLIC_PATHS.has(path)) {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  if (isApiKey(token)) {
    return handleApiKeyAuth(c, token, next);
  }

  return handleJwtAuth(c, token, next);
}

/**
 * JWT authentication: verify the token via Supabase, resolve workspace membership.
 */
async function handleJwtAuth(
  c: Context,
  accessToken: string,
  next: Next,
): Promise<Response | void> {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, accessToken);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return c.json({ error: 'Invalid or expired JWT' }, 401);
  }

  const serviceClient = createServiceRoleClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: membership } = await serviceClient
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!membership) {
    return c.json({ error: 'User has no workspace membership' }, 403);
  }

  const authContext: AuthContext = {
    userId: user.id,
    workspaceId: membership.workspace_id,
    role: membership.role as AuthContext['role'],
    authMethod: 'jwt',
    scopes: [],
  };

  c.set('auth', authContext);
  c.set('supabase', supabase);

  return next();
}

/**
 * API Key authentication: hash the key, look up in api_keys table.
 * Uses service_role client since API keys bypass RLS.
 */
async function handleApiKeyAuth(
  c: Context,
  rawKey: string,
  next: Next,
): Promise<Response | void> {
  const serviceClient = createServiceRoleClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const payload = await verifyApiKey(rawKey, serviceClient);

  if (!payload) {
    return c.json({ error: 'Invalid or expired API key' }, 401);
  }

  const authContext: AuthContext = {
    userId: null,
    workspaceId: payload.workspaceId,
    role: 'member',
    authMethod: 'api_key',
    scopes: payload.scopes,
  };

  c.set('auth', authContext);
  c.set('supabase', serviceClient);

  return next();
}
