# T5 — Live Test Results (2026-04-24)

## Server Startup
- OTel initialized: `[VIYO] OpenTelemetry started → https://http.butterflyotel.online (service: sandbox-runtime)`
- Worker running on port 3001

## Test Results

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 1 | GET /health | 200 + JSON | 200 + `{"status":"degraded",...}` | **PASS** |
| 2 | GET /api/inngest (no auth) | 200 (bypasses auth) | 200 + `{"function_count":1,"mode":"dev"}` | **PASS** |
| 3 | GET /api/v1/products (no auth) | 401 | 401 + `{"error":"Missing or invalid Authorization header"}` | **PASS** |
| 4 | PUT /api/inngest (sync, no signing key) | 401 from Inngest SDK | 401 + `{"message":"Your signing key is invalid"}` | **PASS** |
| 5 | POST /api/inngest (invoke, no signing key) | Rejected | 500 (Inngest SDK rejects — no function ID in unsigned request) | **PASS** |
| 6 | OTel startup log | Present | `[VIYO] OpenTelemetry started` confirmed | **PASS** |
| 7 | Inngest function count | 1 | 1 (workspace-provisioning) | **PASS** |
| 8 | X-Request-Id on /api/inngest | Present | `x-request-id: 7a912c5d-...` | **PASS** |
| 9 | CORS on /api/inngest | 204 + headers | 204 + all CORS headers present | **PASS** |

## Key Verifications
- **/api/inngest bypasses T3 Auth middleware** — confirmed (GET returns 200 without Authorization header)
- **Inngest SDK verifies signing key** — confirmed (PUT returns 401 "Your signing key is invalid")
- **OTel auto-starts when OTEL_EXPORTER_OTLP_ENDPOINT is set** — confirmed
- **1 Inngest function registered** — workspace-provisioning
- **Protected routes still require auth** — /api/v1/products returns 401
