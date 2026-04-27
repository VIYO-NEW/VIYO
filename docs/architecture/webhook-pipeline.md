# Architecture Lock: Webhook Pipeline

**Author:** Manus AI
**Status:** PO-authorized source of truth
**Effective Date:** 2026-04-27
**Updated Protocol Phase:** Phase 2 — Architecture Lock
**Composite Task:** T48
**Covered Implementation Tasks:** T37, T38, T39
**Primary Source:** `/home/ubuntu/upload/Pre-Approved_Architecture_Lock_Webhook_Pipeline.docx`

> This file records the Product Owner-approved architecture lock for the Webhook Pipeline. The source attachment used legacy wording that described the document as a Phase 1 architecture plan. Per PO confirmation on 2026-04-27, that label maps to the updated VIYO protocol as **Phase 2 — Architecture Lock**. Builders may reference this file as the authoritative repository source when preparing Phase 2 wiring and Phase 4 implementation work for the covered tasks.

## 1. Subsystem Purpose

The **Webhook Pipeline** enables external systems such as Shopify, Klaviyo, and custom integrations to subscribe to and receive real-time notifications about key events inside the VIYO platform. It manages webhook subscriptions, dispatches events reliably through Inngest, signs outbound payloads, retries failed deliveries, and records delivery outcomes.

| Scope Element | Locked Decision |
|---|---|
| Management endpoint family | `/api/webhooks/*` |
| Dispatcher module | `src/lib/inngest/functions/webhook-dispatcher.ts` |
| Subscription table | `webhook_endpoints` |
| Delivery-log table | `webhook_delivery_logs` |
| Secret encryption | AES-256-GCM before storage |
| Payload signing | HMAC-SHA256 with decrypted `secret_key` |
| Composite execution wrapper | T48 |

## 2. Locked Components

### 2.1 Webhook Management API — T37

The Webhook Management API is exposed through `/api/webhooks/*` endpoints. It validates `workspace_id` from the JWT and provides the subscription-management interface listed below.

| Endpoint | Locked Behavior |
|---|---|
| `POST /api/webhooks` | Creates a new subscription with endpoint URL and subscribed events. |
| `GET /api/webhooks` | Lists active subscriptions. |
| `PATCH /api/webhooks/:id` | Updates a subscription. |
| `DELETE /api/webhooks/:id` | Deletes a subscription. |
| `GET /api/webhooks/:id/logs` | Fetches delivery logs with pagination. |

Webhook secret keys must be encrypted with AES-256-GCM before storage in `webhook_endpoints` and decrypted only for signing or dispatch operations that require the secret.

### 2.2 Dispatcher Inngest Function — T38

The dispatcher is implemented in `src/lib/inngest/functions/webhook-dispatcher.ts`. It listens for internal events such as `campaign.completed` and `image.generated`, queries `webhook_endpoints` for active subscriptions matching the event type, generates an HMAC-SHA256 signature from the decrypted `secret_key` and event payload, and dispatches POST requests to subscribed endpoints. The dispatcher must implement exponential-backoff retry logic for failed deliveries, including server-side `5xx` errors, and must log success or failure to `webhook_delivery_logs`.

### 2.3 Event Emission Points — T39

Event emission points are integrated across backend services such as `image-router.ts`, the campaign-generation DAG, and Stripe webhook handlers. The implementation injects `inngest.send()` calls at critical state transitions and emits consistently structured payloads containing necessary identifiers such as `workspace_id`, `brand_id`, and resource IDs.

The locked event set includes `campaign.started`, `campaign.completed`, `campaign.failed`, `image.generated`, `token.purchased`, and `comment.created`.

## 3. Data Flow and Security

| Step | Locked Flow |
|---|---|
| 1 | A user creates a webhook endpoint through the UI or API. The `secret_key` is encrypted and stored. |
| 2 | A platform event occurs, for example the Art Director Router finishes image generation and calls `inngest.send({ name: 'image.generated', data: {...} })`. |
| 3 | The `webhook-dispatcher` Inngest function picks up the event. |
| 4 | The dispatcher retrieves active subscriptions, decrypts required secret keys, signs payloads, and sends POST requests. |
| 5 | The result, including status code, response body, and latency, is recorded in `webhook_delivery_logs`. |

## 4. Updated VIYO Protocol Mapping

| Directive Label in Source Attachment | Updated Protocol Phase | Operational Meaning |
|---|---:|---|
| Legacy “Phase 1 Architecture Plan” | Phase 2 | This file is the locked architecture source of truth. |
| Legacy “Phase 2 Wiring Blueprint” | Phase 3 | Builders prepare the narrow wiring plan from this lock. |
| Legacy implementation sequencing | Phase 4 | Builders execute implementation under the composite task wrapper. |
| Legacy post-build tracking | Phase 9 | Builders complete post-build, Airtable, and delivery records. |

## 5. Implementation Sequence Within Composite T48

The covered tasks are executed as a single composite protocol run under **T48**. The locked implementation sequence is **T37 → T38 → T39**. Builders must first implement the Webhook Management API to establish CRUD operations and secret management, then implement the Dispatcher Inngest Function for delivery and retry behavior, and finally add Event Emission Points across the application so the dispatcher receives the required platform events.

## 6. Supersession Rule

This architecture lock supersedes conflicting instructions in individual task descriptions for T37, T38, or T39. If a future implementation detail appears to conflict with this lock, the builder must stop and request PO clarification before modifying the architectural intent.
