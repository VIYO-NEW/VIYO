/**
 * OpenTelemetry Instrumentation Bootstrap — Doc4 §0.3, ADR-018, T5, T12
 *
 * MUST be imported BEFORE any other module in index.ts so that
 * all HTTP and PostgreSQL operations are automatically traced.
 *
 * The SDK only activates when OTEL_EXPORTER_OTLP_ENDPOINT is set to a valid
 * HTTP(S) URL. When unset or invalid, this module is a no-op for OTel so
 * malformed deployment placeholders cannot block worker startup.
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

const rawOtlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const sentryDsn = process.env.SENTRY_DSN_WORKER;
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'viyo-worker';

let sdk: NodeSDK | null = null;

/**
 * Normalize the OTLP endpoint into the trace export URL expected by the HTTP exporter.
 */
function normalizeOtlpTraceUrl(endpoint: string | undefined): string | null {
  const trimmedEndpoint = endpoint?.trim();
  if (!trimmedEndpoint) return null;

  // WHY: Render staging once carried the literal placeholder value
  // `<STAGING_OTEL_EXPORTER_OTLP_ENDPOINT>`. OTel throws during module import for
  // malformed URLs, so placeholders must degrade safely instead of blocking boot.
  if (trimmedEndpoint.startsWith('<') && trimmedEndpoint.endsWith('>')) {
    console.warn(`[VIYO] OpenTelemetry disabled — invalid placeholder OTLP endpoint: ${trimmedEndpoint}`);
    return null;
  }

  const traceUrl = trimmedEndpoint.endsWith('/v1/traces')
    ? trimmedEndpoint
    : `${trimmedEndpoint.replace(/\/+$/, '')}/v1/traces`;

  try {
    const parsedUrl = new URL(traceUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      console.warn(`[VIYO] OpenTelemetry disabled — unsupported OTLP endpoint protocol: ${parsedUrl.protocol}`);
      return null;
    }
    return parsedUrl.toString();
  } catch {
    console.warn(`[VIYO] OpenTelemetry disabled — invalid OTLP endpoint URL: ${trimmedEndpoint}`);
    return null;
  }
}

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

const otlpTraceUrl = normalizeOtlpTraceUrl(rawOtlpEndpoint);

if (otlpTraceUrl) {
  const traceExporter = new OTLPTraceExporter({
    url: otlpTraceUrl,
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
  console.log(`[VIYO] OpenTelemetry started → ${otlpTraceUrl} (service: ${serviceName})`);
} else {
  console.log('[VIYO] OpenTelemetry disabled — OTEL_EXPORTER_OTLP_ENDPOINT not set to a valid URL');

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
