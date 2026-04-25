/**
 * OpenTelemetry Instrumentation Bootstrap — Doc4 §0.3, ADR-018, T5, T12
 *
 * MUST be imported BEFORE any other module in index.ts so that
 * all HTTP and PostgreSQL operations are automatically traced.
 *
 * The SDK only activates when OTEL_EXPORTER_OTLP_ENDPOINT is set.
 * When unset, this module is a no-op — zero overhead in dev.
 *
 * T12 Addition: When SENTRY_DSN_WORKER is also set, the Sentry OTel
 * bridge (SentrySpanProcessor + SentryPropagator + SentrySampler) is
 * wired into the NodeSDK so that OTel traces flow into Sentry's
 * performance monitoring. This gives unified observability: OTel for
 * detailed traces, Sentry for error capture + alerting.
 *
 * PO Directive: Trace database query spans to find the slowest joins.
 * → @opentelemetry/instrumentation-pg captures all pg queries with timing.
 *
 * Authority: Doc4 §0.3, R21 §5, ARCH_LOCK_V3 §3, T12
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
// Types from the OTel packages already in our dependency tree

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const sentryDsn = process.env.SENTRY_DSN_WORKER;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'viyo-worker';


let sdk: NodeSDK | null = null;

/**
 * Load Sentry OTel bridge components when Sentry DSN is configured.
 * Returns null if Sentry is not available — graceful degradation.
 */
async function loadSentryBridge(): Promise<{
  spanProcessor: unknown;
  propagator: unknown;
  sampler: unknown;
} | null> {
  if (!sentryDsn) return null;
  try {
    const { Sentry, SentrySpanProcessor, SentryPropagator, SentrySampler } = await import('./lib/sentry.js');
    const client = Sentry.getClient();
    return {
      spanProcessor: new SentrySpanProcessor(),
      propagator: new SentryPropagator(),
      sampler: client ? new SentrySampler(client) : undefined,
    };
  } catch (err) {
    console.warn('[VIYO] Sentry OTel bridge failed to load — continuing without it:', err);
    return null;
  }
}

if (otlpEndpoint) {
  const traceExporter = new OTLPTraceExporter({
    url: otlpEndpoint.endsWith('/v1/traces')
      ? otlpEndpoint
      : `${otlpEndpoint}/v1/traces`,
  });

  // T12: Wire Sentry OTel bridge when both OTel and Sentry are active
  const sentryBridge = await loadSentryBridge();

  const sdkConfig: ConstructorParameters<typeof NodeSDK>[0] = {
    serviceName,
    traceExporter,
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (req) => {
          // Don't trace health checks — they're noisy
          return req.url === '/health' || req.url === '/health/';
        },
      }),
      new PgInstrumentation({
        enhancedDatabaseReporting: true,
      }),
    ],
  };

  if (sentryBridge) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdkConfig.spanProcessors = [sentryBridge.spanProcessor as any];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdkConfig.textMapPropagator = sentryBridge.propagator as any;
    if (sentryBridge.sampler) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sdkConfig.sampler = sentryBridge.sampler as any;
    }
    console.log('[VIYO] Sentry ↔ OTel bridge activated');
  }

  sdk = new NodeSDK(sdkConfig);
  sdk.start();
  console.log(`[VIYO] OpenTelemetry started → ${otlpEndpoint} (service: ${serviceName})`);
} else {
  console.log('[VIYO] OpenTelemetry disabled — OTEL_EXPORTER_OTLP_ENDPOINT not set');

  // T12: Even without OTel, initialize Sentry standalone for error capture
  if (sentryDsn) {
    try {
      await import('./lib/sentry.js');
      console.log('[VIYO] Sentry initialized standalone (no OTel bridge)');
    } catch (err) {
      console.warn('[VIYO] Sentry standalone init failed:', err);
    }
  }
}

/**
 * Graceful shutdown — flush pending spans before process exit.
 */
function shutdownOtel(): void {
  if (sdk) {
    sdk
      .shutdown()
      .then(() => console.log('[VIYO] OpenTelemetry shut down'))
      .catch((err) => console.error('[VIYO] OpenTelemetry shutdown error:', err));
  }
}

process.on('SIGTERM', shutdownOtel);
process.on('SIGINT', shutdownOtel);

export { sdk as otelSdk };
