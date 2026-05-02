/**
 * HYVE Privacy Gate Middleware — PIA-2 / T93.
 * Sources: R36 HYVE, R37 MAAX, R38 SYPHON, and PIA-1 schema foundation.
 * Enforces default-off brand participation before any HYVE / Intelligence Network endpoint can execute.
 */
import type { Context, Next } from 'hono';
import { and, eq, brands } from '@viyo/db';
import { createServiceRoleClient, type AuthContext, type SupabaseClient } from '@viyo/shared';
import { getDb } from '../lib/db.js';
import { ApiError } from './error-handler.js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const HYVE_OPT_IN_REQUIRED = 'HYVE_OPT_IN_REQUIRED' as const;
export const HYVE_SERVICE_ROLE_REQUIRED = 'HYVE_SERVICE_ROLE_REQUIRED' as const;

export interface HyveBrandContext {
  id: string;
  workspaceId: string;
  hyveOptIn: true;
}

export interface HyveBrandConsentRecord {
  id: string;
  workspaceId: string;
  hyveOptIn: boolean;
}

export interface HyveBrandConsentLookup {
  brandId: string;
  workspaceId: string;
}

export type HyveBrandConsentResolver = (
  lookup: HyveBrandConsentLookup,
) => Promise<HyveBrandConsentRecord | null>;

export interface HyveEnv {
  Variables: {
    auth: AuthContext;
    requestId: string;
    validatedBody?: unknown;
    validatedParams?: unknown;
    validatedQuery?: unknown;
    hyveBrand?: HyveBrandContext;
    supabaseServiceRole?: SupabaseClient;
  };
}

type StringRecord = Record<string, unknown>;

function asRecord(value: unknown): StringRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as StringRecord)
    : null;
}

function firstStringValue(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getObjectValue(record: StringRecord | null, snakeCaseKey: string, camelCaseKey: string): unknown {
  if (!record) {
    return undefined;
  }

  return record[snakeCaseKey] ?? record[camelCaseKey];
}

function extractBrandId(c: Context): string | null {
  const params = asRecord(c.req.param());
  const body = asRecord(c.get('validatedBody'));
  const query = asRecord(c.get('validatedQuery')) ?? asRecord(c.req.query());

  return firstStringValue(
    getObjectValue(params, 'brand_id', 'brandId'),
    getObjectValue(body, 'brand_id', 'brandId'),
    getObjectValue(query, 'brand_id', 'brandId'),
  );
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new ApiError(503, 'Database not available. DATABASE_URL is not configured.');
  }

  return db;
}

function hyveOptInRequiredError(brandId: string): ApiError {
  return new ApiError(403, 'Brand must explicitly opt in before HYVE Intelligence Network participation is allowed.', {
    code: HYVE_OPT_IN_REQUIRED,
    brandId,
  });
}

export async function resolveHyveBrandConsent({
  brandId,
  workspaceId,
}: HyveBrandConsentLookup): Promise<HyveBrandConsentRecord | null> {
  const db = requireDb();
  const [brand] = await db
    .select({
      id: brands.id,
      workspaceId: brands.workspaceId,
      hyveOptIn: brands.hyveOptIn,
    })
    .from(brands)
    .where(and(eq(brands.id, brandId), eq(brands.workspaceId, workspaceId)))
    .limit(1);

  return brand ?? null;
}

/**
 * Build a HYVE opt-in middleware with an injectable resolver for validation and tests.
 * The production export below uses resolveHyveBrandConsent, which reads brands.hyve_opt_in from Postgres.
 */
export function createHyveOptInMiddleware(
  resolveBrandConsent: HyveBrandConsentResolver = resolveHyveBrandConsent,
): (c: Context, next: Next) => Promise<Response | void> {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const auth = c.get('auth') as AuthContext | undefined;
    if (!auth?.workspaceId) {
      throw new ApiError(401, 'Authentication context is required before HYVE privacy checks.');
    }

    const brandId = extractBrandId(c);
    if (!brandId) {
      throw new ApiError(400, 'brand_id is required for HYVE privacy gate evaluation.', {
        code: 'HYVE_BRAND_ID_REQUIRED',
      });
    }

    const brand = await resolveBrandConsent({ brandId, workspaceId: auth.workspaceId });

    if (!brand || brand.hyveOptIn !== true) {
      throw hyveOptInRequiredError(brandId);
    }

    c.set('hyveBrand', {
      id: brand.id,
      workspaceId: brand.workspaceId,
      hyveOptIn: true,
    } satisfies HyveBrandContext);

    return next();
  };
}

/**
 * Resolve and enforce brand-level HYVE consent for the authenticated workspace.
 * The brands.hyve_opt_in column defaults false in PIA-1, so missing or false consent blocks with 403.
 */
export const hyveOptInMiddleware = createHyveOptInMiddleware();

/**
 * Service-role guard for writes into hyve_pattern_performance.
 * PIA-1 RLS restricts table writes to Supabase service_role; callers must use this helper rather than a user-scoped client.
 */
export function requireHyveServiceRoleClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(503, 'Supabase service role is required for HYVE pattern-performance writes.', {
      code: HYVE_SERVICE_ROLE_REQUIRED,
    });
  }

  return createServiceRoleClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Middleware variant for routes that need the guarded service-role client in context.
 */
export async function hyveServiceRoleMiddleware(c: Context, next: Next): Promise<Response | void> {
  c.set('supabaseServiceRole', requireHyveServiceRoleClient());
  return next();
}
