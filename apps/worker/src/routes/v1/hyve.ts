/**
 * HYVE / Intelligence Network Routes — PIA-2 / T93.
 * Sources: R36 HYVE, R37 MAAX, R38 SYPHON, and PIA-1 service-role-only RLS.
 * Every route in this module must pass the brand opt-in privacy gate before executing network participation logic.
 */
import { Hono } from 'hono';
import { z } from 'zod';
import {
  createHyvePatternPerformanceSchema,
  type AuthContext,
  type CreateHyvePatternPerformanceInput,
  type SupabaseClient,
} from '@viyo/shared';
import { validateBody } from '../../middleware/validate.js';
import {
  hyveOptInMiddleware,
  hyveServiceRoleMiddleware,
  type HyveBrandContext,
} from '../../middleware/hyve.js';
import { ApiError } from '../../middleware/error-handler.js';

type RouteEnv = {
  Variables: {
    auth: AuthContext;
    requestId: string;
    validatedBody: unknown;
    validatedQuery: unknown;
    validatedParams: unknown;
    hyveBrand: HyveBrandContext;
    supabaseServiceRole: SupabaseClient;
  };
};

const createHyvePatternPerformanceRequestSchema = createHyvePatternPerformanceSchema.extend({
  brand_id: z.string().uuid(),
});

type CreateHyvePatternPerformanceRequest = z.infer<typeof createHyvePatternPerformanceRequestSchema>;

const hyveRoutes = new Hono<RouteEnv>();

function toSupabaseTimestamp(value: CreateHyvePatternPerformanceInput['recorded_at']): string | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function buildHyvePatternPerformanceInsert(body: CreateHyvePatternPerformanceRequest) {
  return {
    vertical: body.vertical,
    revenue_band: body.revenue_band,
    pattern_key: body.pattern_key,
    metric_name: body.metric_name,
    metric_value: body.metric_value,
    audience_segment: body.audience_segment ?? null,
    recorded_at: toSupabaseTimestamp(body.recorded_at),
    metadata: body.metadata ?? {},
  };
}

/**
 * POST /api/v1/hyve/pattern-performance
 * POST /api/v1/intelligence-network/pattern-performance
 *
 * Records anonymized aggregate HYVE pattern-performance data only after:
 * 1. request body passes the shared PIA metadata privacy schema,
 * 2. the brand is explicitly opted into HYVE, and
 * 3. the write uses the Supabase service role client required by PIA-1 RLS.
 */
hyveRoutes.post(
  '/pattern-performance',
  validateBody(createHyvePatternPerformanceRequestSchema),
  hyveOptInMiddleware,
  hyveServiceRoleMiddleware,
  async (c) => {
    const body = c.get('validatedBody') as CreateHyvePatternPerformanceRequest;
    const serviceRole = c.get('supabaseServiceRole');
    const insertPayload = buildHyvePatternPerformanceInsert(body);

    const { data, error } = await serviceRole
      .from('hyve_pattern_performance')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to record HYVE pattern performance.', {
        code: 'HYVE_PATTERN_PERFORMANCE_WRITE_FAILED',
        supabaseCode: error.code,
      });
    }

    return c.json({
      data,
      privacy: {
        brand_id: c.get('hyveBrand').id,
        hyve_opt_in: true,
        write_role: 'service_role',
      },
    }, 201);
  },
);

export { hyveRoutes, createHyvePatternPerformanceRequestSchema };
