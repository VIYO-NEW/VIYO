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
      apiError?: {
        message?: string;
        details?: Record<string, unknown>;
      };
    };
  };
}

export interface StudioApiError extends Error {
  status?: number;
  code?: number | string;
  apiErrorCode?: string;
  details?: Record<string, unknown>;
  requiredTokens?: number;
  currentBalance?: number;
  estimatedCostTokens?: number;
  selectedModel?: string;
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

function numberFromDetails(details: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = details?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringFromDetails(details: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = details?.[key];
  return typeof value === 'string' ? value : undefined;
}

function codeFromDetails(details: Record<string, unknown> | undefined): string | undefined {
  return stringFromDetails(details, 'code');
}

function buildStudioApiError(body: unknown, status: number): StudioApiError {
  if (isTrpcErrorEnvelope(body)) {
    const apiError = body.error?.data?.apiError;
    const details = apiError?.details;
    const error = new Error(
      apiError?.message ?? body.error?.message ?? `Art Director request failed with ${status}`,
    ) as StudioApiError;
    const apiErrorCode = codeFromDetails(details) ?? body.error?.data?.code;

    error.status = body.error?.data?.httpStatus ?? status;
    error.code = apiErrorCode ?? body.error?.data?.code ?? body.error?.code;
    error.apiErrorCode = apiErrorCode;
    error.details = details;
    error.requiredTokens = numberFromDetails(details, 'required');
    error.currentBalance = numberFromDetails(details, 'balance');
    error.estimatedCostTokens = numberFromDetails(details, 'estimatedCostTokens') ?? error.requiredTokens;
    error.selectedModel = stringFromDetails(details, 'selectedModel');
    return error;
  }

  const fallbackMessage =
    body && typeof body === 'object' && 'message' in body
      ? String((body as { message?: unknown }).message)
      : `Art Director request failed with ${status}`;
  const error = new Error(fallbackMessage) as StudioApiError;
  error.status = status;
  return error;
}

export function isInsufficientTokensError(error: unknown): error is StudioApiError {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidate = error as StudioApiError;
  return candidate.apiErrorCode === 'INSUFFICIENT_TOKENS' || candidate.code === 'INSUFFICIENT_TOKENS';
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
