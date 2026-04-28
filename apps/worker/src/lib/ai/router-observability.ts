/**
 * Router Observability — T46
 *
 * Emits structured logs that preserve the routing decision trail without adding
 * new telemetry infrastructure in this task. Existing worker request IDs and
 * OTEL/Sentry setup can ingest these logs from the worker runtime.
 */
import type { ArtDirectorFallbackReason, ArtDirectorModel, ArtDirectorProviderTier } from '@viyo/shared';

export interface RouterDecisionLog {
  traceId: string;
  requestId: string;
  workspaceId: string;
  selectedModel: ArtDirectorModel;
  providerTier: ArtDirectorProviderTier;
  isCached: boolean;
  score: number;
  costTokens: number;
  fallbackReason: ArtDirectorFallbackReason;
  durationMs: number;
  patternId?: string | null;
}

export function recordRouterDecision(event: RouterDecisionLog): void {
  console.info('[art-director-router]', JSON.stringify(event));
}

export function createTraceId(requestId: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${requestId}-${Date.now()}`;
}
