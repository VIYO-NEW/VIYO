import {
  routeGenerationRequestSchema,
  routeGenerationResponseSchema,
  type RouteGenerationInput,
  type RouteGenerationResponse,
} from '@viyo/shared/schemas/art-director';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const ART_DIRECTOR_ROUTE_PATH = '/api/trpc/artDirector.routeGeneration';

interface TrpcSuccessEnvelope {
  result?: {
    data?: {
      json?: unknown;
    } | unknown;
  };
}

interface TrpcErrorEnvelope {
  error?: {
    message?: string;
    code?: number | string;
    data?: {
      code?: string;
      httpStatus?: number;
    };
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { supabase } = await import('./supabase.js');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isTrpcErrorEnvelope(body: unknown): body is TrpcErrorEnvelope {
  return Boolean(
    body &&
      typeof body === 'object' &&
      'error' in body &&
      (body as TrpcErrorEnvelope).error,
  );
}

function unwrapTrpcData(body: unknown): unknown {
  const envelope = body as TrpcSuccessEnvelope;
  const data = envelope.result?.data;

  if (data && typeof data === 'object' && 'json' in data) {
    return (data as { json: unknown }).json;
  }

  return data ?? body;
}

function buildStudioApiError(body: unknown, status: number): Error {
  if (isTrpcErrorEnvelope(body)) {
    const error = new Error(body.error?.message ?? `Art Director request failed with ${status}`);
    const record = error as unknown as Record<string, unknown>;
    record.status = body.error?.data?.httpStatus ?? status;
    record.code = body.error?.data?.code ?? body.error?.code;
    return error;
  }

  const fallbackMessage =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message?: unknown }).message)
      : `Art Director request failed with ${status}`;
  const error = new Error(fallbackMessage);
  (error as unknown as Record<string, unknown>).status = status;
  return error;
}

export async function routeStudioGeneration(input: RouteGenerationInput): Promise<RouteGenerationResponse> {
  const parsedInput = routeGenerationRequestSchema.parse(input);
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${ART_DIRECTOR_ROUTE_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ json: parsedInput }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || isTrpcErrorEnvelope(body)) {
    throw buildStudioApiError(body, response.status);
  }

  return routeGenerationResponseSchema.parse(unwrapTrpcData(body));
}

export type { RouteGenerationInput, RouteGenerationResponse };
