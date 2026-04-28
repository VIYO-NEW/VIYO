# Architecture Lock: Webhook Pipeline Subsystem

**Document Version:** 3.0 (PRD Product Architect Depth)
**Update Description:** Replaced the prior v1 repository lock with the PO-approved v3.0 architecture lock, including the exact 22-event outbound webhook catalog, endpoint and delivery-log schemas, HMAC signing, retry behavior, and auto-disable logic.
**Update Reason:** PO instruction dated 2026-04-27 directed replacement of the earlier architecture-lock content before T45 proceeds.
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T48
**Covered Implementation Tasks:** T37, T38, T39
**Primary Replacement Source:** `/home/ubuntu/upload/Architecture_Lock_Webhook_Pipeline_Subsystem_(T37,_T38,_T39).docx`

> This file supersedes the prior Webhook Pipeline architecture-lock content in this repository. Builders must use this v3.0 document for Sprint 2 implementation planning and must not rely on the earlier six-event catalog or prior dispatcher assumptions.

## 1. Source Declaration

| Source ID | Source Path or Title | Authority Status | Sections Read | Facts Extracted | Gaps or Conflicts |
|---|---|---|---|---|---|
| S1 | `/home/ubuntu/upload/PO_Instruction_Architecture_Lock_Corrections_&_Source-of-Truth_Enforcement.docx` | approved source opened | Full correction instruction | The four v1 architecture locks must be discarded and replaced before T45 proceeds. | None for this replacement action. |
| S2 | `/home/ubuntu/upload/Architecture_Lock_Webhook_Pipeline_Subsystem_(T37,_T38,_T39).docx` | approved source opened | Full v3.0 lock | Webhook schema, 22-event catalog, REST management API, Inngest dispatch engine, standard payload, observability, release flag, and rollback rule. | None. |

## 2. Architecture Contract

| Contract Element | Locked Decision |
|---|---|
| Objective | Implement a reliable, secure webhook pipeline that allows workspaces to subscribe to 22 distinct domain events and receive signed payloads with exponential backoff for failed deliveries. |
| Builder outcome | Complete the Drizzle schema for endpoints and logs, REST API for management, and Inngest background function for dispatch and retry. |
| Acceptance checks | A user can create a webhook endpoint and receive the one-time HMAC secret; triggering an event emits a payload to the correct URL with a valid `X-VIYO-Signature` header; if the destination returns HTTP 500, Inngest retries delivery up to four times; if an endpoint fails 10 consecutive times, it is automatically disabled with `is_active = false`. |
| Non-goals | Incoming webhooks, meaning receiving events from external systems, are out of scope for Sprint 2. |
| Constraints | All endpoints must enforce `workspace_id` RLS isolation. Payloads must not contain sensitive PII. |
| Source-confirmed assumptions | The pipeline depends on T17 database foundations, T37 management APIs, T38 dispatch logic, and T39 event emission points. |
| Open decisions | None for architecture-lock replacement. |

## 3. Prior-Artifact Back-Propagation Register

| Affected Artifact | Issue Discovered | Root Source of Truth | Required Correction | Build Blocking | Owner | Verification Evidence |
|---|---|---|---|---|---|---|
| `docs/architecture/webhook-pipeline.md` | The prior v1 lock contained a reduced six-event event set and older endpoint/dispatcher assumptions. | S1, S2 | Replace with the v3.0 22-event catalog, endpoint/log schemas, signing, retry, and auto-disable contracts. | Yes | Manus AI | This file has been overwritten with v3.0 content. |
| T48 builder prompt assumptions | Any builder plan relying on `campaign.completed`, `image.generated`, or other v1-only event naming would conflict with the v3.0 catalog. | S2 | Use the exact 22 events listed in this file. | Yes | Builder assigned to T48 | This lock defines the canonical event catalog. |

## 4. Database Schema

The Webhook Pipeline relies on two tables created in T17. These table definitions are locked for T48 implementation.

### 4.1 `webhook_endpoints`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | Primary key, default `uuid_generate_v4()` | Unique identifier. |
| `workspace_id` | `UUID` | Not null, references `workspaces(id)` on delete cascade | Tenant isolation. |
| `url` | `TEXT` | Not null | HTTPS endpoint URL. |
| `secret` | `VARCHAR(64)` | Not null | HMAC-SHA256 signing secret generated on creation. |
| `events` | `VARCHAR[]` | Not null | Array of subscribed event types. |
| `is_active` | `BOOLEAN` | Not null, default `true` | Toggle to pause delivery. |
| `description` | `VARCHAR(255)` | Nullable | Human-readable label. |
| `last_triggered_at` | `TIMESTAMPTZ` | Nullable | Timestamp of last successful delivery. |
| `failure_count` | `INTEGER` | Not null, default `0` | Consecutive failures; auto-disable at 10. |

### 4.2 `webhook_delivery_logs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | Primary key, default `uuid_generate_v4()` | Unique identifier. |
| `webhook_endpoint_id` | `UUID` | Not null, references `webhook_endpoints(id)` on delete cascade | Owning webhook endpoint. |
| `event_type` | `VARCHAR(50)` | Not null | Event name, such as `email.generation.completed`. |
| `payload` | `JSONB` | Not null | Full event payload sent. |
| `response_status` | `INTEGER` | Nullable | HTTP status code returned by the destination. |
| `response_time_ms` | `INTEGER` | Nullable | Delivery latency. |
| `attempt_number` | `INTEGER` | Not null, default `1` | Retry attempt number from 1 through 4. |
| `delivered_at` | `TIMESTAMPTZ` | Not null, default `NOW()` | Timestamp when delivery was attempted. |

## 5. Event Catalog

The system must support emitting and routing exactly the following 22 events.

| Domain | Count | Exact Events |
|---|---:|---|
| Email | 6 | `email.generation.started`, `email.generation.completed`, `email.generation.failed`, `email.export.completed`, `email.export.failed`, `email.status.changed` |
| Image | 6 | `image.generation.started`, `image.generation.completed`, `image.generation.failed`, `image.edit.completed`, `image.edit.failed`, `image.saved_to_vault` |
| Brand | 4 | `brand.import.started`, `brand.import.completed`, `brand.import.failed`, `brand.assets.updated` |
| Team | 3 | `team.comment.added`, `team.approval.granted`, `team.member.invited` |
| Billing | 3 | `billing.tokens.low`, `billing.tokens.depleted`, `billing.subscription.changed` |

## 6. API Contracts for T37

All endpoints are mounted under `/api/webhooks` and require Workspace Admin authentication.

| Operation | Endpoint | Request | Locked Action | Response |
|---|---|---|---|---|
| Create endpoint | `POST /api/webhooks` | `{ "url": "https://...", "events": ["image.generation.completed"], "description": "Zapier" }` | Generate a random 64-character hex string for `secret`. | `201` returns endpoint object plus the secret. This is the only time the secret is returned. |
| List endpoints | `GET /api/webhooks` | None beyond auth/context. | Return endpoints visible to the workspace admin. | `200` returns an array of endpoints with secrets omitted. |
| Update endpoint | `PATCH /api/webhooks/:id` | `{ "is_active": false, "events": [...] }` | Update mutable endpoint fields. | Updated endpoint response per implementation conventions. |
| Get delivery logs | `GET /api/webhooks/:id/logs` | Pagination parameters as implemented. | Fetch delivery logs for the endpoint. | `200` returns a paginated array of `webhook_delivery_logs`. |

## 7. Dispatch and Delivery Engine for T38

| Engine Step | Locked Behavior |
|---|---|
| Inngest function | `deliverWebhook` |
| Trigger | Listens for any of the 22 domain events. |
| Query | Find `webhook_endpoints` where `is_active = true`, the event type is included in the endpoint `events` array, and `workspace_id` matches the event payload. |
| Signing | Generate an HMAC-SHA256 signature of the JSON payload using the endpoint secret. |
| Delivery | HTTP `POST` to the endpoint `url`. |
| Headers | `Content-Type: application/json` and `X-VIYO-Signature: <signature>`. |
| Timeout | 10 seconds. |
| Logging | Insert a record into `webhook_delivery_logs`. |
| Retry logic | If HTTP status is `>= 400` or the request times out, throw an error to trigger Inngest exponential backoff at 1 minute, 5 minutes, 15 minutes, and 1 hour. |
| Failure counter | Increment `failure_count`; if `failure_count >= 10`, set `is_active = false`. |
| Success behavior | Reset `failure_count = 0` and update `last_triggered_at`. |

## 8. Standard Payload Structure

```json
{
  "id": "evt_viyo_a1b2c3d4e5f6",
  "type": "image.generation.completed",
  "timestamp": "2026-04-27T14:30:00.000Z",
  "data": {
    "asset_id": "asset_xyz789",
    "token_cost": 45000
  },
  "metadata": {
    "workspace_id": "ws_abc123",
    "user_id": "usr_def456"
  }
}
```

## 9. Observability and Analytics

| Category | Locked Requirement |
|---|---|
| Metrics | Track delivery success rate, average latency, and retry volume. |
| Alerts | Alert engineering if global delivery success rate drops below 95% over a 15-minute window. |

## 10. Release and Rollback Plan

| Release Control | Locked Decision |
|---|---|
| Feature flag | `enable_webhooks` |
| Rollback | Disable the flag to pause the Inngest `deliverWebhook` function. Existing endpoints remain in the database but do not receive payloads until re-enabled. |

## 11. Supersession Rule

This v3.0 architecture lock supersedes the earlier v1 repository lock and conflicting draft context for T37, T38, T39, and T48. If any implementation task, handoff note, schema draft, endpoint draft, event catalog, or builder prompt conflicts with this file, the builder must stop and follow this v3.0 lock unless a later PO-approved source explicitly supersedes it.
