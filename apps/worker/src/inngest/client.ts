/**
 * Inngest Client — Doc4 §2.1, R18 §4, ADR-017, ADR-020
 *
 * Singleton Inngest client for the VIYO worker process.
 * - EventSchemas: Provides compile-time type safety for all event names
 *   and payloads via ViyoEvents from @viyo/shared.
 * - Signing key: Inngest SDK verifies INNGEST_SIGNING_KEY on every
 *   request to /api/inngest. No custom auth middleware needed.
 * - Event key: Used when sending events programmatically.
 * - Extended Traces middleware: Forwards OTel spans into Inngest Traces
 *   for unified observability across the event bus (PO directive).
 *
 * Authority: Doc4 §2.1, R18 §4, R21 §5, ARCH_LOCK_V3 §3
 */
import { Inngest, EventSchemas } from 'inngest';
import {
  extendedTracesMiddleware,
  InngestSpanProcessor,
} from 'inngest/experimental';
import type { ViyoEvents } from '@viyo/shared';

/**
 * Inngest client with full type safety via EventSchemas.
 *
 * The ViyoEvents type map (from packages/shared/src/events/index.ts)
 * is registered via `schemas: new EventSchemas().fromRecord<ViyoEvents>()`.
 * This gives compile-time checking on:
 * - Event names in createFunction triggers
 * - Event data payloads in function handlers
 * - Event names and data in inngest.send() calls
 *
 * Extended Traces behaviour:
 * - "off" because we have our own OTel NodeSDK with auto-instrumentations
 *   in instrumentation.ts. Setting "auto" would register them twice.
 */
export const inngest = new Inngest({
  id: 'viyo-worker',
  schemas: new EventSchemas().fromRecord<ViyoEvents>(),
  middleware: [extendedTracesMiddleware({ behaviour: 'off' })],
});

/**
 * Re-export InngestSpanProcessor for use in instrumentation.ts
 * when wiring the OTel SDK with Inngest trace continuity.
 */
export { InngestSpanProcessor };
