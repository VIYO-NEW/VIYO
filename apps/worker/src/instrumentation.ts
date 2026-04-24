/**
 * OpenTelemetry Instrumentation Bootstrap — Doc4 §0.3, ADR-018
 *
 * MUST be imported BEFORE any other module in index.ts so that
 * all HTTP and PostgreSQL operations are automatically traced.
 *
 * The SDK only activates when OTEL_EXPORTER_OTLP_ENDPOINT is set.
 * When unset, this module is a no-op — zero overhead in dev.
 *
 * PO Directive: Trace database query spans to find the slowest joins.
 * → @opentelemetry/instrumentation-pg captures all pg queries with timing.
 *
 * Authority: Doc4 §0.3, R21 §5, ARCH_LOCK_V3 §3
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'viyo-worker';


let sdk: NodeSDK | null = null;

if (otlpEndpoint) {
  const traceExporter = new OTLPTraceExporter({
    url: otlpEndpoint.endsWith('/v1/traces')
      ? otlpEndpoint
      : `${otlpEndpoint}/v1/traces`,
  });

  sdk = new NodeSDK({
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
  });

  sdk.start();
  console.log(`[VIYO] OpenTelemetry started → ${otlpEndpoint} (service: ${serviceName})`);
} else {
  console.log('[VIYO] OpenTelemetry disabled — OTEL_EXPORTER_OTLP_ENDPOINT not set');
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
