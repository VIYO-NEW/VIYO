# VIYO PRD V6 Addendum — Fortune 500 Enterprise Remediation (v1.9.1 Standard)

## Product and Architecture Contract

| Field | Locked Value |
|---|---|
| Document Version | V6.1 (Fortune 50 Remediation) |
| Update Description | Complete expansion of the 196-item gap audit using the v1.9.1 proportional depth standard. |
| Changed Sections | All sections. Added Proportional Gap Coverage Register and tiered dossiers. |
| Prior Affected Artifacts Repaired? | yes (R22, R23, R29 repaired in Arch Lock V7) |
| Objective | Define the product requirements, acceptance criteria, and architectural wiring for the 196 enterprise readiness gaps identified in the SaaS audit. |
| Target Customer and User | Engineering team, DevOps, and Product Owner. |
| Business Outcome | Achieve enterprise readiness, SOC 2 Type I compliance, and unblock Fortune 500 procurement. |
| PM Outcome | Provide a complete, prioritized backlog of actionable implementation dossiers for the engineering team. |
| Builder Outcome | Senior engineers can implement every gap without asking clarifying product or architectural questions. |
| Acceptance Checks | All 196 gaps are addressed, either through implemented features, documented processes, or PO-approved deferrals. |
| Non-Goals | Redesigning the core email editor or generative AI prompt engine. |
| Constraints | Must adhere to Architecture Lock V7 (Vite/Hono/Supabase). |
| Source-Confirmed Assumptions | The 196 gaps represent the complete universe of required enterprise features. |
| Product/Architecture Assumptions Requiring Validation | None. |
| Open Decisions | None. |
| Prior-Artifact Repair Status | clear-to-advance |
| Phase Advancement Repair Status | clear-to-advance |
| Fortune 50 Document Standard Status | fortune-50-ready |
| Builder-Submitted File Review Status | not applicable |
| Holistic Document Set Status | PO-approved holistic plan |
| Rewrite Enforcement Status | pre-write repair plan complete |
| Gap Dossier Coverage Status | 100% proportional coverage |
| Self-Red-Team Status | complete |

## Executive Summary

| Executive Field | Decision-Grade Summary |
|---|---|
| Decision Needed | Approval of the proportional gap remediation plan and implementation sequencing. |
| Recommendation | Execute the P0 (Launch-Blocking) and P1 (Build-Critical) dossiers immediately in Phase 6.2. Defer P2/P3 items to Phase 7 or handle via compact trace entries. |
| Expected Impact | Upgrades VIYO from a prototype to a SOC 2-ready, enterprise-grade SaaS platform capable of passing vendor security reviews. |
| Major Risk | The sheer volume of remediation work (153 P0/P1 gaps) will delay feature development if not sequenced correctly. |
| Next Milestone | Taskmaster breakdown of P0 gaps. |
| Launch or Build Readiness | ready |

## Source Declaration

| Source ID | Source Path or URL | Authority Status | File Type | Section or Line Count | Sections or Lines Read | Completion Status | Facts Extracted | Defects, Gaps, or Conflicts | Review Disposition |
|---|---|---|---|---:|---|---|---|---|---|
| S1 | `VIYO_Complete_SaaS_Gap_Audit.md` | approved source opened | markdown | 350 | full file | complete | 196 missing enterprise features | The entire document is a gap audit | accepted |
| S2 | `arch_lock_v7_fortune50.md` | approved source opened | markdown | 162 | full file | complete | Vite/Hono/Supabase stack, `workspace_id` tenant model | None | accepted |

## Proportional Gap Coverage Register

This register maps all 196 gaps from the audit to their required materiality tier and coverage format, per the v1.9.1 standard.

| Gap ID | Category | Gap Description | Materiality Tier | Coverage Format | Disposition |
|---|---|---|---|---|---|
| G001 | Deployment | Staging environment | P0 | Full Dossier | Active Build |
| G002 | Deployment | Environment promotion workflow | P0 | Full Dossier | Active Build |
| G003 | Deployment | Blue/green or canary deployment | P1 | Full Dossier | Active Build |
| G004 | Deployment | Rollback procedure | P0 | Full Dossier | Active Build |
| G005 | Deployment | Database migration strategy | P0 | Full Dossier | Active Build |
| G006 | Deployment | Feature flags system | P1 | Full Dossier | Active Build |
| G007 | Deployment | Infrastructure-as-Code | P2 | Compact Card | Active Build |
| G008 | Deployment | Environment variable validation | P0 | Full Dossier | Active Build |
| G009 | Deployment | Seed data strategy | P2 | Compact Card | Active Build |
| G010 | Observability | Application Performance Monitoring | P0 | Full Dossier | Active Build |
| G011 | Observability | Structured logging standard | P0 | Full Dossier | Active Build |
| G012 | Observability | Error tracking and alerting | P0 | Full Dossier | Active Build |
| G013 | Observability | Uptime monitoring / status page | P1 | Full Dossier | Active Build |
| G014 | Observability | AI model latency/cost dashboards | P1 | Full Dossier | Active Build |
| G015 | Observability | Token consumption anomaly detection | P2 | Compact Card | Active Build |
| G016 | Observability | Database slow query detection | P2 | Compact Card | Active Build |
| G017 | Observability | Distributed tracing | P1 | Full Dossier | Active Build |
| G018 | Observability | Log aggregation and retention | P2 | Compact Card | Active Build |
| G019 | Observability | Real User Monitoring (RUM) | P2 | Compact Card | Active Build |
| G020 | Observability | Synthetic monitoring | P2 | Compact Card | Active Build |
| G021 | Data Mgmt | Backup strategy | P0 | Full Dossier | Active Build |
| G022 | Data Mgmt | Disaster recovery plan | P0 | Full Dossier | Active Build |
| G023 | Data Mgmt | Data retention and purging | P1 | Full Dossier | Active Build |
| G024 | Data Mgmt | Customer data export (GDPR) | P0 | Full Dossier | Active Build |
| G025 | Data Mgmt | Customer data deletion (GDPR) | P0 | Full Dossier | Active Build |
| G026 | Data Mgmt | Data import/migration tools | P2 | Compact Card | Active Build |
| G027 | Data Mgmt | Database connection pooling | P1 | Full Dossier | Active Build |
| G028 | Data Mgmt | Soft-delete vs hard-delete | P2 | Compact Card | Active Build |
| G029 | Data Mgmt | Data archival strategy | P2 | Compact Card | Active Build |
| G030 | Security | SOC 2 Type II readiness path | P0 | Full Dossier | Active Build |
| G031 | Security | Penetration testing schedule | P1 | Full Dossier | Active Build |
| G032 | Security | Vulnerability disclosure policy | P1 | Full Dossier | Active Build |
| G033 | Security | Dependency vulnerability scanning | P1 | Full Dossier | Active Build |
| G034 | Security | Content Security Policy (CSP) | P0 | Full Dossier | Active Build |
| G035 | Security | Rate limiting architecture | P0 | Full Dossier | Active Build |
| G036 | Security | DDoS protection strategy | P1 | Full Dossier | Active Build |
| G037 | Security | API key management | P0 | Full Dossier | Active Build |
| G038 | Security | Session management | P1 | Full Dossier | Active Build |
| G039 | Security | IP allowlisting | P2 | Compact Card | Active Build |
| G040 | Security | Security incident response plan | P0 | Full Dossier | Active Build |
| G041 | Security | Secrets rotation policy | P1 | Full Dossier | Active Build |
| G042 | Identity | SSO (SAML 2.0 + OIDC) | P0 | Full Dossier | Active Build |
| G043 | Identity | SCIM provisioning | P1 | Full Dossier | Active Build |
| G044 | Identity | RBAC beyond owner/member | P0 | Full Dossier | Active Build |
| G045 | Identity | Custom roles | P2 | Compact Card | Active Build |
| G046 | Identity | MFA enforcement | P0 | Full Dossier | Active Build |
| G047 | Identity | Tenant isolation documentation | P1 | Full Dossier | Active Build |
| G048 | Identity | Admin impersonation | P1 | Full Dossier | Active Build |
| G049 | Identity | User activity audit logs | P0 | Full Dossier | Active Build |
| G050 | Identity | API access tokens | P1 | Full Dossier | Active Build |
| G051 | Legal | Terms of Service | P0 | Full Dossier | Active Build |
| G052 | Legal | Privacy Policy | P0 | Full Dossier | Active Build |
| G053 | Legal | Data Processing Agreement (DPA) | P1 | Full Dossier | Active Build |
| G054 | Legal | Master Service Agreement (MSA) | P1 | Full Dossier | Active Build |
| G055 | Legal | Cookie consent management | P0 | Full Dossier | Active Build |
| G056 | Legal | GDPR compliance architecture | P0 | Full Dossier | Active Build |
| G057 | Legal | CCPA compliance | P1 | Full Dossier | Active Build |
| G058 | Legal | CAN-SPAM compliance | P0 | Full Dossier | Active Build |
| G059 | Legal | CASL compliance | P1 | Full Dossier | Active Build |
| G060 | Legal | Intellectual property protection | P1 | Full Dossier | Active Build |
| G061 | Legal | AI-generated content disclosure | P1 | Full Dossier | Active Build |
| G062 | Legal | Acceptable use policy | P0 | Full Dossier | Active Build |
| G063 | Legal | DMCA / copyright takedown | P1 | Full Dossier | Active Build |
| G064 | Legal | Data residency options | P2 | Compact Card | Active Build |
| G065 | Email | ESP integration architecture | P0 | Full Dossier | Active Build |
| G066 | Email | Email rendering engine | P0 | Full Dossier | Active Build |
| G067 | Email | SPF/DKIM/DMARC setup | P0 | Full Dossier | Active Build |
| G068 | Email | Deliverability monitoring | P1 | Full Dossier | Active Build |
| G069 | Email | Dedicated IP vs shared IP | P1 | Full Dossier | Active Build |
| G070 | Email | Email warm-up strategy | P1 | Full Dossier | Active Build |
| G071 | Email | Unsubscribe handling | P0 | Full Dossier | Active Build |
| G072 | Email | Sending rate limiting | P1 | Full Dossier | Active Build |
| G073 | Email | Template versioning and rollback | P2 | Compact Card | Active Build |
| G074 | Email | Bounce and complaint processing | P1 | Full Dossier | Active Build |
| G075 | Email | Email analytics pipeline | P1 | Full Dossier | Active Build |
| G076 | Email | Suppression list management | P0 | Full Dossier | Active Build |
| G077 | Email | Transactional vs marketing split | P1 | Full Dossier | Active Build |
| G078 | AI Ops | Prompt versioning and registry | P0 | Full Dossier | Active Build |
| G079 | AI Ops | Model fallback chain | P0 | Full Dossier | Active Build |
| G080 | AI Ops | AI output quality monitoring | P1 | Full Dossier | Active Build |
| G081 | AI Ops | AI cost tracking | P1 | Full Dossier | Active Build |
| G082 | AI Ops | Prompt injection defense | P0 | Full Dossier | Active Build |
| G083 | AI Ops | AI content safety filtering | P0 | Full Dossier | Active Build |
| G084 | AI Ops | Model A/B testing framework | P2 | Compact Card | Active Build |
| G085 | AI Ops | AI response caching | P2 | Compact Card | Active Build |
| G086 | AI Ops | Graceful degradation | P1 | Full Dossier | Active Build |
| G087 | AI Ops | SLA monitoring and failover | P1 | Full Dossier | Active Build |
| G088 | AI Ops | Token budget enforcement | P0 | Full Dossier | Active Build |
| G089 | Testing | Unit testing strategy | P0 | Full Dossier | Active Build |
| G090 | Testing | Integration testing strategy | P0 | Full Dossier | Active Build |
| G091 | Testing | End-to-end testing | P1 | Full Dossier | Active Build |
| G092 | Testing | Visual regression testing | P2 | Compact Card | Active Build |
| G093 | Testing | API contract testing | P1 | Full Dossier | Active Build |
| G094 | Testing | Load testing | P1 | Full Dossier | Active Build |
| G095 | Testing | Chaos engineering | P2 | Compact Card | Active Build |
| G096 | Testing | Test data management | P1 | Full Dossier | Active Build |
| G097 | Testing | CI pipeline with test gates | P0 | Full Dossier | Active Build |
| G098 | Testing | Code coverage reporting | P1 | Full Dossier | Active Build |
| G099 | Scalability | Core Web Vitals targets | P1 | Full Dossier | Active Build |
| G100 | Scalability | Image/asset optimization | P1 | Full Dossier | Active Build |
| G101 | Scalability | API response time SLAs | P0 | Full Dossier | Active Build |
| G102 | Scalability | Caching strategy | P0 | Full Dossier | Active Build |
| G103 | Scalability | CDN configuration | P2 | Compact Card | Active Build |
| G104 | Scalability | Database indexing strategy | P1 | Full Dossier | Active Build |
| G105 | Scalability | Connection pooling | P1 | Full Dossier | Active Build |
| G106 | Scalability | Auto-scaling rules | P2 | Compact Card | Active Build |
| G107 | Scalability | Queue/job capacity planning | P1 | Full Dossier | Active Build |
| G108 | Scalability | Asset storage scaling | P2 | Compact Card | Active Build |
| G109 | i18n | i18n architecture | P1 | Full Dossier | Active Build |
| G110 | i18n | RTL language support | P2 | Compact Card | Active Build |
| G111 | i18n | Multi-currency display | P2 | Compact Card | Active Build |
| G112 | i18n | Timezone handling | P1 | Full Dossier | Active Build |
| G113 | i18n | Date/number formatting | P2 | Compact Card | Active Build |
| G114 | i18n | Unicode and emoji handling | P2 | Compact Card | Active Build |
| G115 | a11y | WCAG 2.1 AA compliance | P0 | Full Dossier | Active Build |
| G116 | a11y | Keyboard navigation | P0 | Full Dossier | Active Build |
| G117 | a11y | Screen reader compatibility | P0 | Full Dossier | Active Build |
| G118 | a11y | Color contrast enforcement | P1 | Full Dossier | Active Build |
| G119 | a11y | Focus management | P1 | Full Dossier | Active Build |
| G120 | a11y | Reduced motion support | P2 | Compact Card | Active Build |
| G121 | a11y | Alt text for AI images | P1 | Full Dossier | Active Build |
| G122 | Real-Time | Real-time notifications | P1 | Full Dossier | Active Build |
| G123 | Real-Time | Presence system | P2 | Compact Card | Active Build |
| G124 | Real-Time | Optimistic UI updates | P1 | Full Dossier | Active Build |
| G125 | Real-Time | Conflict resolution | P1 | Full Dossier | Active Build |
| G126 | Real-Time | Push notifications | P2 | Compact Card | Active Build |
| G127 | Integration | Webhook delivery infrastructure | P1 | Full Dossier | Active Build |
| G128 | Integration | Public API documentation | P1 | Full Dossier | Active Build |
| G129 | Integration | API rate limiting | P1 | Full Dossier | Active Build |
| G130 | Integration | OAuth 2.0 provider | P2 | Compact Card | Active Build |
| G131 | Integration | Zapier/Make integration | P2 | Compact Card | Active Build |
| G132 | Integration | Native integrations | P2 | Compact Card | Active Build |
| G133 | Integration | Import/export formats | P2 | Compact Card | Active Build |
| G134 | Integration | API versioning strategy | P1 | Full Dossier | Active Build |
| G135 | Integration | SDK/client library | P2 | Compact Card | Active Build |
| G136 | Billing | Proration handling | P0 | Full Dossier | Active Build |
| G137 | Billing | Refund workflow | P1 | Full Dossier | Active Build |
| G138 | Billing | Invoice generation/tax | P1 | Full Dossier | Active Build |
| G139 | Billing | Failed payment recovery | P1 | Full Dossier | Active Build |
| G140 | Billing | Enterprise pricing | P1 | Full Dossier | Active Build |
| G141 | Billing | Usage reconciliation | P0 | Full Dossier | Active Build |
| G142 | Billing | Dispute resolution | P1 | Full Dossier | Active Build |
| G143 | Billing | Multi-workspace billing | P2 | Compact Card | Active Build |
| G144 | Billing | Coupon/discount system | P2 | Compact Card | Active Build |
| G145 | Billing | ASC 606 compliance | P2 | Compact Card | Active Build |
| G146 | Support | In-app support widget | P1 | Full Dossier | Active Build |
| G147 | Support | Knowledge base | P1 | Full Dossier | Active Build |
| G148 | Support | Onboarding flow | P1 | Full Dossier | Active Build |
| G149 | Support | Customer health scoring | P2 | Compact Card | Active Build |
| G150 | Support | Churn prediction | P2 | Compact Card | Active Build |
| G151 | Support | NPS/CSAT collection | P2 | Compact Card | Active Build |
| G152 | Support | Support SLAs | P1 | Full Dossier | Active Build |
| G153 | Support | Escalation procedures | P2 | Compact Card | Active Build |
| G154 | Support | Communication templates | P1 | Full Dossier | Active Build |
| G155 | Support | Changelog | P1 | Full Dossier | Active Build |
| G156 | Admin | Platform admin tools | P0 | Full Dossier | Active Build |
| G157 | Admin | Content moderation tools | P1 | Full Dossier | Active Build |
| G158 | Admin | System health dashboard | P1 | Full Dossier | Active Build |
| G159 | Admin | Admin audit trail | P1 | Full Dossier | Active Build |
| G160 | Admin | Feature flag UI | P1 | Full Dossier | Active Build |
| G161 | Admin | Workspace lifecycle | P0 | Full Dossier | Active Build |
| G162 | Admin | Bulk operations | P2 | Compact Card | Active Build |
| G163 | DevExp | Local dev setup | P0 | Full Dossier | Active Build |
| G164 | DevExp | API documentation | P1 | Full Dossier | Active Build |
| G165 | DevExp | Env var registry | P0 | Full Dossier | Active Build |
| G166 | DevExp | Linting enforcement | P1 | Full Dossier | Active Build |
| G167 | DevExp | Monorepo tooling | P1 | Full Dossier | Active Build |
| G168 | DevExp | Git workflow | P1 | Full Dossier | Active Build |
| G169 | DevExp | Architecture Decision Records | P1 | Full Dossier | Active Build |
| G170 | DevExp | Contribution guidelines | P3 | Trace Entry | Deferred |
| G171 | DR & BC | Vendor lock-in mitigation | P1 | Full Dossier | Active Build |
| G172 | DR & BC | Multi-region strategy | P1 | Full Dossier | Active Build |
| G173 | DR & BC | Graceful degradation | P1 | Full Dossier | Active Build |
| G174 | DR & BC | Data sovereignty | P2 | Compact Card | Active Build |
| G175 | DR & BC | Business continuity plan | P1 | Full Dossier | Active Build |
| G176 | DR & BC | Incident management | P0 | Full Dossier | Active Build |
| G177 | PLG | Product analytics pipeline | P1 | Full Dossier | Active Build |
| G178 | PLG | Funnel tracking | P1 | Full Dossier | Active Build |
| G179 | PLG | User segmentation | P2 | Compact Card | Active Build |
| G180 | PLG | In-app messaging | P2 | Compact Card | Active Build |
| G181 | PLG | Referral system | P3 | Trace Entry | Deferred |
| G182 | PLG | Trial conversion | P2 | Compact Card | Active Build |
| G183 | PLG | Usage analytics | P3 | Trace Entry | Deferred |
| G184 | Content | Asset versioning | P1 | Full Dossier | Active Build |
| G185 | Content | Storage lifecycle | P2 | Compact Card | Active Build |
| G186 | Content | Content approval workflows | P1 | Full Dossier | Active Build |
| G187 | Content | Brand library management | P1 | Full Dossier | Active Build |
| G188 | Content | Template marketplace | P2 | Compact Card | Active Build |
| G189 | Content | Bulk asset operations | P2 | Compact Card | Active Build |
| G190 | Content | DAM integration | P3 | Trace Entry | Deferred |
| G191 | Resilience | Circuit breaker pattern | P0 | Full Dossier | Active Build |
| G192 | Resilience | Retry with backoff | P0 | Full Dossier | Active Build |
| G193 | Resilience | Dead letter queues | P1 | Full Dossier | Active Build |
| G194 | Resilience | Health check endpoints | P0 | Full Dossier | Active Build |
| G195 | Resilience | Graceful shutdown | P1 | Full Dossier | Active Build |
| G196 | Resilience | Connection pool recovery | P2 | Compact Card | Active Build |

---
## CATEGORY 1: DEPLOYMENT & ENVIRONMENTS

### G001: Staging Environment (P0)
**Source Proof:** Gap Audit G001 | **Current Behavior:** Developers deploy directly to production or test locally. | **Target Behavior:** A persistent staging environment that mirrors production architecture exactly, used as a mandatory gate before production deployment.
**Product Decision:** Staging will use the same Render/Vercel/Supabase stack as production but on isolated infrastructure.
**UX/Admin/Support Impact:** Internal only. QA team and PO review staging URLs.
**Implementation Contract:** Vercel Preview deployments for frontend. Render Preview Environments for API. Separate Supabase project (`viyo-staging`).
**Acceptance Criteria:** Code pushed to `main` auto-deploys to staging. Staging DB is completely isolated from production DB.
**Telemetry/Risk:** Alert if staging deploy fails. Risk: Cost duplication.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G002: Environment Promotion Workflow (P0)
**Source Proof:** Gap Audit G002 | **Current Behavior:** Manual, undocumented deployment. | **Target Behavior:** Automated promotion from `main` (staging) to `production` (prod) via GitHub Actions, gated by CI checks and manual PO approval.
**Product Decision:** No code reaches production without passing the staging CI/CD gate and receiving a manual trigger.
**UX/Admin/Support Impact:** Internal only.
**Implementation Contract:** GitHub Actions workflow with `environment: production` and `needs: [staging_deploy, e2e_tests]`.
**Acceptance Criteria:** Production deployment is blocked if staging E2E tests fail. Production deploy requires manual click in GitHub UI.
**Telemetry/Risk:** Track deployment frequency and lead time.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G003: Blue/Green or Canary Deployment (P1)
**Source Proof:** Gap Audit G003 | **Current Behavior:** In-place replacement, causing momentary downtime or dropped requests. | **Target Behavior:** Zero-downtime deployments using Vercel's atomic deploys and Render's zero-downtime deploy feature.
**Product Decision:** Rely on PaaS native zero-downtime features rather than custom Kubernetes routing.
**UX/Admin/Support Impact:** Users experience no dropped connections during updates.
**Implementation Contract:** Render health checks must pass before the new instance receives traffic.
**Acceptance Criteria:** A deployment during active load testing results in zero 502/503 errors.
**Telemetry/Risk:** Monitor 5xx rates during deploy windows.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G004: Rollback Procedure (P0)
**Source Proof:** Gap Audit G004 | **Current Behavior:** "Fix forward" by writing new code. | **Target Behavior:** One-click rollback to the previous known-good state within 5 minutes.
**Product Decision:** Vercel Instant Rollback for frontend; Render manual rollback for backend. Database migrations must be backwards compatible.
**UX/Admin/Support Impact:** Support can escalate critical bugs for immediate rollback.
**Implementation Contract:** Documented runbook. Code must not drop old DB columns until the *next* deployment (expand-and-contract pattern).
**Acceptance Criteria:** A bad deployment can be reverted to the previous commit's build artifacts in < 5 minutes without data loss.
**Telemetry/Risk:** Alert on rollback execution.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G005: Database Migration Strategy (P0)
**Source Proof:** Gap Audit G005 | **Current Behavior:** Ad-hoc SQL execution. | **Target Behavior:** Version-controlled, automated schema migrations using Supabase CLI or Drizzle Kit.
**Product Decision:** All schema changes must be represented as up/down migration files in the repository.
**UX/Admin/Support Impact:** Internal only. Prevents schema drift.
**Implementation Contract:** `drizzle-kit generate` and `drizzle-kit push` integrated into the CI pipeline.
**Acceptance Criteria:** CI fails if the committed schema does not match the generated migration files.
**Telemetry/Risk:** Alert on migration failure.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G006: Feature Flags System (P1)
**Source Proof:** Gap Audit G006 | **Current Behavior:** Code is either shipped or not shipped. | **Target Behavior:** Ability to merge code to production but hide it behind a flag, enabling gradual rollout or kill-switches.
**Product Decision:** Build a lightweight custom flag system in Supabase rather than paying for LaunchDarkly at this stage.
**UX/Admin/Support Impact:** Admin UI to toggle flags globally or per-workspace.
**Implementation Contract:** `feature_flags` table (id, name, is_active, workspace_ids[]). API middleware to check flag state.
**Acceptance Criteria:** A new UI component can be hidden from all users except workspace `X`.
**Telemetry/Risk:** Log flag evaluations for debugging.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G008: Environment Variable Validation (P0)
**Source Proof:** Gap Audit G008 | **Current Behavior:** App crashes at runtime if an env var is missing. | **Target Behavior:** Fail-fast at startup if required configuration is missing.
**Product Decision:** Use Zod to parse `process.env` at application boot.
**UX/Admin/Support Impact:** Prevents deployment of misconfigured instances.
**Implementation Contract:** `src/env.ts` exporting a validated `env` object.
**Acceptance Criteria:** Application refuses to start (exit code 1) and logs a clear error if `STRIPE_SECRET_KEY` is missing.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 2: OBSERVABILITY & MONITORING

### G010: Application Performance Monitoring (APM) (P0)
**Source Proof:** Gap Audit G010 | **Current Behavior:** Blind to performance bottlenecks. | **Target Behavior:** Code-level visibility into API response times and database query latency.
**Product Decision:** Integrate Sentry APM or Datadog for tracing.
**UX/Admin/Support Impact:** Engineering can proactively fix slow endpoints.
**Implementation Contract:** Install APM SDK in Hono middleware and React root.
**Acceptance Criteria:** P95 latency for the `/api/v1/generate` endpoint is visible in a dashboard.
**Telemetry/Risk:** High volume of traces can increase SaaS costs; implement sampling (e.g., 10%).
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G011: Structured Logging Standard (P0)
**Source Proof:** Gap Audit G011 | **Current Behavior:** `console.log` strings. | **Target Behavior:** JSON-formatted logs with severity levels, timestamps, and correlation IDs.
**Product Decision:** Use Pino or Winston logger. Never log PII or secrets.
**UX/Admin/Support Impact:** Internal only.
**Implementation Contract:** Logger instance injected into context. Output format: `{"level":"info","time":16... ,"msg":"...","traceId":"..."}`
**Acceptance Criteria:** All backend logs are valid JSON and contain a `traceId` matching the incoming request.
**Telemetry/Risk:** Prevents log spoofing and enables SIEM ingestion.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G012: Error Tracking and Alerting (P0)
**Source Proof:** Gap Audit G012 | **Current Behavior:** Errors are lost in console output. | **Target Behavior:** Unhandled exceptions trigger alerts to the engineering team.
**Product Decision:** Sentry integration for both frontend and backend.
**UX/Admin/Support Impact:** Support can correlate user complaints with specific Sentry issue IDs.
**Implementation Contract:** Sentry ErrorBoundary in React; Sentry middleware in Hono.
**Acceptance Criteria:** An unhandled promise rejection in the worker immediately sends a Slack/email alert with stack trace.
**Telemetry/Risk:** Alert fatigue if noise is not filtered.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G013: Uptime Monitoring / Status Page (P1)
**Source Proof:** Gap Audit G013 | **Current Behavior:** Users don't know if the system is down. | **Target Behavior:** Public status page and automated ping checks.
**Product Decision:** Use BetterUptime or Atlassian Statuspage.
**UX/Admin/Support Impact:** Reduces support ticket volume during outages.
**Implementation Contract:** Configure external pinger to hit `/api/v1/healthz` every 1 minute.
**Acceptance Criteria:** `status.viyo.app` publicly displays current system health and historical uptime.
**Telemetry/Risk:** False positives if health check endpoint is too heavy.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G014: AI Model Latency/Cost Dashboards (P1)
**Source Proof:** Gap Audit G014 | **Current Behavior:** Blind to per-model performance and margin. | **Target Behavior:** Internal dashboard tracking TTFT (Time To First Token), total latency, and cost per generation.
**Product Decision:** Emit custom metrics to Datadog/Grafana or build a lightweight internal admin view over the `audit_logs` table.
**UX/Admin/Support Impact:** PO can make data-driven decisions on model routing.
**Implementation Contract:** Router observability wrapper must log duration and `costTokens` for every AI call.
**Acceptance Criteria:** Admin can view average latency for `ideogram-v3` vs `flux-2-pro` over the last 24 hours.
**Telemetry/Risk:** High cardinality metrics.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G017: Distributed Tracing (P1)
**Source Proof:** Gap Audit G017 | **Current Behavior:** Cannot correlate frontend clicks to backend DB queries. | **Target Behavior:** A single `traceId` flows from the browser, through the API, to the worker, and into the logs.
**Product Decision:** Implement W3C Trace Context headers (`traceparent`).
**UX/Admin/Support Impact:** Drastically reduces debugging time for complex generation failures.
**Implementation Contract:** Frontend generates trace ID or uses APM auto-instrumentation. Backend extracts header and passes it to logger and Inngest jobs.
**Acceptance Criteria:** A single search for `traceId=xyz` in the logging platform returns the frontend request, API processing, and async worker execution.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 3: DATA MANAGEMENT & LIFECYCLE

### G021: Backup Strategy (P0)
**Source Proof:** Gap Audit G021 | **Current Behavior:** Relying on default Supabase settings without a documented policy. | **Target Behavior:** Daily automated backups with Point-in-Time Recovery (PITR) enabled.
**Product Decision:** Enable Supabase PITR. Document restoration runbook.
**UX/Admin/Support Impact:** Protection against catastrophic data deletion.
**Implementation Contract:** Infrastructure configuration (Supabase dashboard/Terraform).
**Acceptance Criteria:** PITR is active and a test restoration to a staging environment has been successfully performed and documented.
**Telemetry/Risk:** High cost for PITR on large databases.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G022: Disaster Recovery Plan (P0)
**Source Proof:** Gap Audit G022 | **Current Behavior:** No plan if primary region goes down. | **Target Behavior:** Documented RTO (Recovery Time Objective) of 4 hours and RPO (Recovery Point Objective) of 1 hour.
**Product Decision:** Document the manual steps to spin up a new Render environment and restore the Supabase database in a different AWS region.
**UX/Admin/Support Impact:** Required for enterprise procurement compliance.
**Implementation Contract:** Markdown runbook in the repository.
**Acceptance Criteria:** The DR runbook exists, covers DB, API, and Frontend recovery, and has been approved by the PO.
**Telemetry/Risk:** None.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G023: Data Retention and Purging (P1)
**Source Proof:** Gap Audit G023 | **Current Behavior:** Data grows indefinitely. | **Target Behavior:** Automated purging of stale, non-critical data (e.g., old audit logs, failed generation attempts).
**Product Decision:** Keep audit logs for 1 year, billing logs for 7 years, failed generation assets for 30 days.
**UX/Admin/Support Impact:** Reduces storage costs and compliance liability.
**Implementation Contract:** Supabase pg_cron job or Inngest scheduled function to delete old records.
**Acceptance Criteria:** An automated job successfully deletes `audit_logs` older than 365 days.
**Telemetry/Risk:** Accidental deletion of critical data.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G024: Customer Data Export (GDPR) (P0)
**Source Proof:** Gap Audit G024 | **Current Behavior:** Manual database queries required. | **Target Behavior:** Automated or semi-automated process to provide a customer with all their PII and generated assets in a machine-readable format.
**Product Decision:** Build an internal admin script to generate the export payload upon request. (Self-serve UI deferred to Phase 7).
**UX/Admin/Support Impact:** Support can fulfill GDPR Article 20 requests within the 30-day legal window.
**Implementation Contract:** Node.js script that queries all workspace data and packages it into a ZIP file.
**Acceptance Criteria:** Running `pnpm run export-workspace <id>` produces a complete JSON/asset dump without manual SQL.
**Telemetry/Risk:** High database load during export.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G025: Customer Data Deletion (GDPR) (P0)
**Source Proof:** Gap Audit G025 | **Current Behavior:** Manual deletion risks orphaned records. | **Target Behavior:** Complete, cascading deletion of all customer data across DB, Auth, and Storage.
**Product Decision:** Implement strict `ON DELETE CASCADE` foreign keys and a cleanup job for R2 assets.
**UX/Admin/Support Impact:** Support can fulfill GDPR Article 17 (Right to be Forgotten) requests.
**Implementation Contract:** Workspace deletion endpoint that removes the Supabase Auth user, cascades DB records, and queues an Inngest job to delete R2 images.
**Acceptance Criteria:** Deleting a workspace leaves zero orphaned rows in the database and removes all associated R2 files.
**Telemetry/Risk:** Irreversible action. Must be restricted to high-level admins.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G027: Database Connection Pooling (P1)
**Source Proof:** Gap Audit G027 | **Current Behavior:** Direct connections from serverless functions exhaust DB connections. | **Target Behavior:** Use Supavisor (Supabase's built-in connection pooler) for all API traffic.
**Product Decision:** Route all Hono/Render traffic through the IPv4 Supavisor connection string (port 6543).
**UX/Admin/Support Impact:** Prevents API timeouts during traffic spikes.
**Implementation Contract:** Update `DATABASE_URL` env var.
**Acceptance Criteria:** Load testing with 500 concurrent requests does not result in "too many clients" Postgres errors.
**Telemetry/Risk:** Pooler exhaustion.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 4: SECURITY

### G030: SOC 2 Type II Readiness Path (P0)
**Source Proof:** Gap Audit G030 | **Current Behavior:** No compliance framework. | **Target Behavior:** All infrastructure and processes align with SOC 2 Trust Services Criteria (Security, Availability, Confidentiality).
**Product Decision:** Establish the baseline controls (MFA for admins, encrypted backups, audit logging, code review enforcement).
**UX/Admin/Support Impact:** Unblocks Fortune 500 sales.
**Implementation Contract:** Document the control matrix. Enforce GitHub branch protection (requires 1 review).
**Acceptance Criteria:** Branch protection is active. Admin access requires MFA. All DB connections are SSL/TLS.
**Telemetry/Risk:** None.
**Owner:** PO/DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G031: Penetration Testing Schedule (P1)
**Source Proof:** Gap Audit G031 | **Current Behavior:** No external security validation. | **Target Behavior:** Documented policy to perform annual third-party pentests.
**Product Decision:** Policy document only for Phase 6.2. Actual pentest scheduled before enterprise GA.
**UX/Admin/Support Impact:** Required for vendor security questionnaires.
**Implementation Contract:** Markdown policy document.
**Acceptance Criteria:** Policy is documented and approved by PO.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G032: Vulnerability Disclosure Policy (P1)
**Source Proof:** Gap Audit G032 | **Current Behavior:** No way for researchers to report bugs. | **Target Behavior:** Public `security.txt` file and a dedicated `security@viyo.app` email alias.
**Product Decision:** Implement RFC 9116 standard.
**UX/Admin/Support Impact:** Routes security reports away from general support.
**Implementation Contract:** Add `/.well-known/security.txt` to the frontend static assets.
**Acceptance Criteria:** `https://viyo.app/.well-known/security.txt` resolves and provides contact instructions.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G033: Dependency Vulnerability Scanning (P1)
**Source Proof:** Gap Audit G033 | **Current Behavior:** TruffleHog scans for secrets, but no CVE scanning for npm packages. | **Target Behavior:** Automated scanning of `package.json` dependencies.
**Product Decision:** Enable GitHub Dependabot and require PRs for high/critical CVEs.
**UX/Admin/Support Impact:** Internal only.
**Implementation Contract:** `.github/dependabot.yml` configuration.
**Acceptance Criteria:** Dependabot is active and opens PRs for vulnerable packages.
**Telemetry/Risk:** High volume of low-priority PRs (configure to only alert on High/Critical).
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G034: Content Security Policy (CSP) (P0)
**Source Proof:** Gap Audit G034 | **Current Behavior:** No CSP headers, vulnerable to XSS. | **Target Behavior:** Strict CSP headers enforced on the frontend.
**Product Decision:** Restrict script execution to self and approved domains (e.g., Stripe, Supabase).
**UX/Admin/Support Impact:** Prevents malicious script injection.
**Implementation Contract:** Configure Vercel `vercel.json` or HTML `<meta>` tag to emit `Content-Security-Policy`.
**Acceptance Criteria:** Browser developer tools confirm CSP is active and blocking inline scripts (unless explicitly hashed/nonced).
**Telemetry/Risk:** Can break legitimate third-party scripts (e.g., analytics) if misconfigured.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G035: Rate Limiting Architecture (P0)
**Source Proof:** Gap Audit G035 | **Current Behavior:** Endpoints can be spammed indefinitely. | **Target Behavior:** Redis-backed rate limiting to protect API and AI generation endpoints.
**Product Decision:** Use Upstash Redis. Limit general API to 100 req/min/IP. Limit AI generation to 10 req/min/workspace.
**UX/Admin/Support Impact:** Protects against abuse and cost overruns. UI must handle 429 Too Many Requests gracefully.
**Implementation Contract:** Hono middleware using `@upstash/ratelimit`.
**Acceptance Criteria:** Sending 11 generation requests in one minute returns a 429 status code and does not trigger the AI provider.
**Telemetry/Risk:** Alert on high volume of 429s.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G036: DDoS Protection Strategy (P1)
**Source Proof:** Gap Audit G036 | **Current Behavior:** Relying on default hosting protection. | **Target Behavior:** Explicitly configure Cloudflare or Vercel Edge protection.
**Product Decision:** Rely on Vercel's native DDoS mitigation for the frontend, and ensure the Render backend only accepts traffic from approved origins (CORS) or the frontend proxy.
**UX/Admin/Support Impact:** Platform stability.
**Implementation Contract:** Infrastructure configuration.
**Acceptance Criteria:** Backend API rejects requests with invalid Origin headers.
**Telemetry/Risk:** None.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G037: API Key Management (P0)
**Source Proof:** Gap Audit G037 | **Current Behavior:** No way for customers to integrate programmatically. | **Target Behavior:** Secure generation, storage (hashed), and revocation of workspace API keys.
**Product Decision:** API keys must be shown only once. Store only a bcrypt/SHA-256 hash in the database.
**UX/Admin/Support Impact:** Enables Zapier and custom integrations.
**Implementation Contract:** `api_keys` table (id, workspace_id, key_hash, prefix, created_at). Endpoint to generate and return raw key once. Middleware to validate `Bearer viyo_...`.
**Acceptance Criteria:** A user can generate a key, use it to call the API, and the database only contains the unreadable hash.
**Telemetry/Risk:** Key leakage by customers.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G038: Session Management (P1)
**Source Proof:** Gap Audit G038 | **Current Behavior:** Infinite session length. | **Target Behavior:** Enforced session timeouts and ability to revoke all active sessions.
**Product Decision:** Configure Supabase Auth JWT expiration to 1 hour, with sliding refresh tokens. Max absolute lifetime 30 days.
**UX/Admin/Support Impact:** Users must re-authenticate periodically, enhancing security.
**Implementation Contract:** Supabase Auth configuration.
**Acceptance Criteria:** A JWT older than 1 hour is rejected by the API unless accompanied by a valid refresh token.
**Telemetry/Risk:** User friction if refresh logic fails.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G040: Security Incident Response Plan (P0)
**Source Proof:** Gap Audit G040 | **Current Behavior:** No process for handling breaches. | **Target Behavior:** Documented step-by-step plan for identifying, containing, and reporting a data breach.
**Product Decision:** Create a Markdown runbook defining roles (Commander, Communicator), containment steps, and the 72-hour GDPR reporting window.
**UX/Admin/Support Impact:** Required for SOC 2 and enterprise trust.
**Implementation Contract:** `docs/internal/security/INCIDENT_RESPONSE.md`.
**Acceptance Criteria:** Runbook exists and defines the escalation path to the PO.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G041: Secrets Rotation Policy (P1)
**Source Proof:** Gap Audit G041 | **Current Behavior:** Secrets live forever. | **Target Behavior:** Documented procedure to rotate Stripe, AI Provider, and Supabase keys without downtime.
**Product Decision:** Define the "overlapping keys" or environment variable swap procedure.
**UX/Admin/Support Impact:** Internal only.
**Implementation Contract:** Markdown runbook.
**Acceptance Criteria:** Runbook details how to rotate the OpenAI API key across Render and Vercel without dropping requests.
**Telemetry/Risk:** Accidental downtime during rotation.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build
## CATEGORY 5: ENTERPRISE IDENTITY & ACCESS

### G042: SSO (SAML 2.0 + OIDC) (P0)
**Source Proof:** Gap Audit G042 | **Current Behavior:** Email/password or social login only. | **Target Behavior:** Enterprise customers can authenticate via Okta, Entra ID, or Ping using SAML/OIDC.
**Product Decision:** Integrate SSOJet or Supabase SSO for the "Enterprise" tier.
**UX/Admin/Support Impact:** "Login with SSO" button on auth page. Admin UI to configure SAML XML metadata per workspace.
**Implementation Contract:** Supabase Auth configured for SAML connections. Routing logic based on email domain.
**Acceptance Criteria:** A user with `@enterprise.com` is redirected to their Okta portal and successfully logs into their VIYO workspace upon return.
**Telemetry/Risk:** Misconfigured SAML locks out the entire enterprise.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G043: SCIM Provisioning (P1)
**Source Proof:** Gap Audit G043 | **Current Behavior:** Manual invite links. | **Target Behavior:** Automated user creation, role assignment, and deprovisioning driven by the customer's Identity Provider (IdP).
**Product Decision:** Implement SCIM 2.0 endpoints (`/scim/v2/Users` and `/scim/v2/Groups`) to sync with Okta/Entra.
**UX/Admin/Support Impact:** Zero-touch onboarding for enterprise seats. Instant offboarding when an employee leaves.
**Implementation Contract:** Hono routes handling SCIM payloads, mapping to `workspace_members` table.
**Acceptance Criteria:** Adding a user to the "VIYO Access" group in Okta automatically creates a Supabase Auth user and adds them to the workspace.
**Telemetry/Risk:** High complexity in SCIM spec compliance.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G044: RBAC Beyond Owner/Member (P0)
**Source Proof:** Gap Audit G044 | **Current Behavior:** Only Owner/Member roles exist. | **Target Behavior:** Granular roles: Owner, Admin, Editor (can generate/edit), Viewer (read-only), Billing (access invoices only).
**Product Decision:** Expand the `workspace_members.role` enum and enforce via Row Level Security (RLS) and API middleware.
**UX/Admin/Support Impact:** Team management UI must support assigning these new roles.
**Implementation Contract:** Update Supabase RLS policies. E.g., `role IN ('owner', 'admin', 'editor')` for `INSERT` on `images`.
**Acceptance Criteria:** A user with the 'Viewer' role receives a 403 Forbidden when attempting to generate an image or edit an email template.
**Telemetry/Risk:** RLS bypass if policies are misconfigured.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G046: MFA Enforcement (P0)
**Source Proof:** Gap Audit G046 | **Current Behavior:** Optional or non-existent MFA. | **Target Behavior:** Workspaces can mandate Multi-Factor Authentication (TOTP) for all members.
**Product Decision:** Use Supabase Auth's native MFA capabilities. Add a `require_mfa` boolean to the `workspaces` table.
**UX/Admin/Support Impact:** Users without MFA configured are blocked at login until they set up an authenticator app.
**Implementation Contract:** Middleware checks `auth.mfa_amr_claims()` if the workspace requires MFA.
**Acceptance Criteria:** An enterprise user attempting to access a required-MFA workspace is redirected to the TOTP setup screen.
**Telemetry/Risk:** User lockout; requires a recovery code flow.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G047: Tenant Isolation Documentation (P1)
**Source Proof:** Gap Audit G047 | **Current Behavior:** Implicit isolation via `workspace_id`. | **Target Behavior:** A formal architecture document proving that Tenant A cannot access Tenant B's data, used to pass vendor security reviews.
**Product Decision:** Document the RLS policies and API middleware that enforce `workspace_id` checks on every query.
**UX/Admin/Support Impact:** Sales enablement asset.
**Implementation Contract:** `docs/external/security/TENANT_ISOLATION.md` detailing the Postgres RLS implementation.
**Acceptance Criteria:** Document exists and clearly explains how the `jwt()` claim `app_metadata.workspace_id` is used to filter rows.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G048: Admin Impersonation (P1)
**Source Proof:** Gap Audit G048 | **Current Behavior:** Support must ask for screenshots or passwords. | **Target Behavior:** Super-admins can securely log in "as" a customer to debug issues, with full audit logging.
**Product Decision:** Build a secure impersonation endpoint that issues a temporary, scoped JWT for a specific `workspace_id`.
**UX/Admin/Support Impact:** Drastically reduces time-to-resolution for complex UI/generation bugs.
**Implementation Contract:** Admin-only API endpoint that generates a Supabase token for the target user. Every action taken while impersonating is flagged in the audit log.
**Acceptance Criteria:** An admin can view the customer's dashboard exactly as they see it. The `audit_logs` table records `actor: admin_id, impersonating: user_id`.
**Telemetry/Risk:** Severe security risk if the impersonation endpoint is exposed or abused.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G049: User Activity Audit Logs (P0)
**Source Proof:** Gap Audit G049 | **Current Behavior:** Only billing changes are logged. | **Target Behavior:** Immutable, exportable log of all critical actions (login, invite user, generate image, delete campaign, export data).
**Product Decision:** Create a centralized `audit_logs` table and a reusable logging service.
**UX/Admin/Support Impact:** Enterprise admins can view the "Audit Trail" tab in their workspace settings.
**Implementation Contract:** `audit_logs` table (id, workspace_id, actor_id, action, resource_type, resource_id, metadata, ip_address, created_at).
**Acceptance Criteria:** When a user deletes an image, a row is inserted into `audit_logs` detailing who deleted what and when.
**Telemetry/Risk:** High storage volume. Requires the purging strategy (G023).
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G050: API Access Tokens (P1)
**Source Proof:** Gap Audit G050 | **Current Behavior:** No programmatic access. | **Target Behavior:** Workspace owners can generate long-lived Bearer tokens scoped to specific permissions (e.g., read-only, generation-only).
**Product Decision:** Store token hashes. Validate via middleware.
**UX/Admin/Support Impact:** Enables headless integrations.
**Implementation Contract:** (Covered largely by G037). Add scope arrays to the `api_keys` table.
**Acceptance Criteria:** A token generated with `scope: ['read:images']` is rejected with 403 when attempting to call `POST /images/generate`.
**Telemetry/Risk:** Token leakage.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 6: LEGAL & COMPLIANCE

### G051: Terms of Service (P0)
**Source Proof:** Gap Audit G051 | **Current Behavior:** No legal agreement. | **Target Behavior:** Binding Terms of Service governing acceptable use, liability, and intellectual property.
**Product Decision:** Standard SaaS ToS tailored for AI generation (disclaiming liability for generated content).
**UX/Admin/Support Impact:** Users must click "I agree" during signup.
**Implementation Contract:** Add checkbox to Supabase Auth UI flow. Record consent timestamp in `users` table.
**Acceptance Criteria:** A user cannot create an account without explicitly checking the ToS agreement box.
**Telemetry/Risk:** Legal exposure if bypassed.
**Owner:** PO/Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G052: Privacy Policy (P0)
**Source Proof:** Gap Audit G052 | **Current Behavior:** No policy. | **Target Behavior:** Document detailing data collection, sub-processors (OpenAI, Stripe, Render), and user rights.
**Product Decision:** Must list all AI providers as sub-processors and clarify that user data is NOT used to train foundation models (if applicable via enterprise API agreements).
**UX/Admin/Support Impact:** Linked in footer and signup.
**Implementation Contract:** Static Markdown/HTML page.
**Acceptance Criteria:** Privacy policy is accessible at `/privacy` and accurately lists all third-party services receiving user data.
**Telemetry/Risk:** Regulatory fines if inaccurate.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G053: Data Processing Agreement (DPA) (P1)
**Source Proof:** Gap Audit G053 | **Current Behavior:** None. | **Target Behavior:** A standard DPA available for European customers to sign, ensuring GDPR compliance for data transfers.
**Product Decision:** Provide a downloadable PDF template that enterprise customers can execute.
**UX/Admin/Support Impact:** Unblocks EU sales.
**Implementation Contract:** Host the PDF on the legal page.
**Acceptance Criteria:** A customer can download the standard VIYO DPA.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G054: Master Service Agreement (MSA) (P1)
**Source Proof:** Gap Audit G054 | **Current Behavior:** None. | **Target Behavior:** A negotiable enterprise contract template covering SLAs, uptime guarantees, and custom pricing.
**Product Decision:** Draft the baseline MSA for the sales team.
**UX/Admin/Support Impact:** Sales enablement.
**Implementation Contract:** Word/Google Doc template.
**Acceptance Criteria:** MSA template exists and defines the 99.9% uptime SLA and support response times.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G055: Cookie Consent Management (P0)
**Source Proof:** Gap Audit G055 | **Current Behavior:** Analytics cookies dropped without consent. | **Target Behavior:** A GDPR/ePrivacy-compliant cookie banner that blocks non-essential scripts until consent is given.
**Product Decision:** Integrate a lightweight consent manager (e.g., Cookiebot or custom React context).
**UX/Admin/Support Impact:** Banner appears on first visit.
**Implementation Contract:** Wrap analytics initialization (e.g., Google Analytics, Mixpanel) in a consent check.
**Acceptance Criteria:** Visiting the site from an EU IP does not drop any tracking cookies until the user clicks "Accept".
**Telemetry/Risk:** Loss of analytics data.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G056: GDPR Compliance Architecture (P0)
**Source Proof:** Gap Audit G056 | **Current Behavior:** Ad-hoc data handling. | **Target Behavior:** A systemic approach to consent, right to access (G024), right to erasure (G025), and privacy by design.
**Product Decision:** Map all PII storage locations. Ensure no PII is logged (G011).
**UX/Admin/Support Impact:** Support can confidently answer GDPR questionnaires.
**Implementation Contract:** Document the data flow and PII locations.
**Acceptance Criteria:** The architecture document maps every database column containing PII and confirms no PII is sent to AI providers (only prompt text).
**Telemetry/Risk:** Heavy fines for non-compliance.
**Owner:** PO/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G057: CCPA Compliance (P1)
**Source Proof:** Gap Audit G057 | **Current Behavior:** None. | **Target Behavior:** "Do Not Sell My Personal Information" link and compliance with California privacy rights.
**Product Decision:** Add the required link to the footer for US traffic.
**UX/Admin/Support Impact:** Footer update.
**Implementation Contract:** Static link pointing to a web form or email `privacy@viyo.app`.
**Acceptance Criteria:** A California resident can easily submit a data deletion request.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G058: CAN-SPAM Compliance (P0)
**Source Proof:** Gap Audit G058 | **Current Behavior:** Unknown email compliance. | **Target Behavior:** Every marketing email sent via VIYO must include a physical mailing address and a clear unsubscribe mechanism.
**Product Decision:** The MJML generation engine MUST enforce the presence of these two elements before allowing an export or send.
**UX/Admin/Support Impact:** Users cannot send illegal spam.
**Implementation Contract:** Pre-flight validation step in the email editor.
**Acceptance Criteria:** Attempting to export an email campaign without an `{{unsubscribe_url}}` tag throws a validation error and blocks the export.
**Telemetry/Risk:** Existential legal risk if VIYO becomes a spam vector.
**Owner:** Backend/Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G059: CASL Compliance (P1)
**Source Proof:** Gap Audit G059 | **Current Behavior:** None. | **Target Behavior:** Support for explicit vs implied consent tracking for Canadian recipients.
**Product Decision:** Ensure the audience management data model supports a `consent_type` field and `consent_date`.
**UX/Admin/Support Impact:** Required for customers mailing to Canada.
**Implementation Contract:** Add fields to the (future) contacts/audience table.
**Acceptance Criteria:** The data model can record that user X explicitly opted in on Date Y from IP Z.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G060: Intellectual Property Protection (P1)
**Source Proof:** Gap Audit G060 | **Current Behavior:** Ambiguous ownership of generated images. | **Target Behavior:** Clear ToS clause stating the customer owns the output, subject to the AI provider's underlying terms.
**Product Decision:** Align with OpenAI/Midjourney standard terms (customer owns the output).
**UX/Admin/Support Impact:** Clarifies ownership for enterprise legal teams.
**Implementation Contract:** ToS update.
**Acceptance Criteria:** The ToS explicitly assigns copyright of generated assets to the workspace owner.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G061: AI-Generated Content Disclosure (P1)
**Source Proof:** Gap Audit G061 | **Current Behavior:** Images are unmarked. | **Target Behavior:** Ability to add invisible watermarks (C2PA) or visible disclosures to comply with emerging EU AI Act regulations.
**Product Decision:** Evaluate C2PA injection into generated JPEGs/PNGs.
**UX/Admin/Support Impact:** Future-proofs the platform against regulatory bans.
**Implementation Contract:** Post-processing step in the image pipeline to inject metadata.
**Acceptance Criteria:** A generated image downloaded from VIYO contains EXIF/C2PA metadata identifying it as AI-generated.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G062: Acceptable Use Policy (P0)
**Source Proof:** Gap Audit G062 | **Current Behavior:** Users can prompt anything. | **Target Behavior:** A binding policy forbidding the generation of CSAM, hate speech, deepfakes, or malware.
**Product Decision:** Publish the AUP and enforce it via AI provider moderation endpoints (G083).
**UX/Admin/Support Impact:** Grounds for account termination.
**Implementation Contract:** Static AUP document linked in ToS.
**Acceptance Criteria:** The AUP explicitly bans illegal content generation and grants VIYO the right to suspend violating accounts immediately.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G063: DMCA / Copyright Takedown (P1)
**Source Proof:** Gap Audit G063 | **Current Behavior:** No process for rights holders. | **Target Behavior:** A published DMCA agent address and a process to remove infringing uploaded brand assets.
**Product Decision:** Register a DMCA agent and publish the takedown email.
**UX/Admin/Support Impact:** Legal safe harbor for user-uploaded content.
**Implementation Contract:** Add DMCA section to ToS.
**Acceptance Criteria:** `copyright@viyo.app` is monitored and the ToS outlines the takedown notice requirements.
**Telemetry/Risk:** Loss of safe harbor if notices are ignored.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 7: EMAIL INFRASTRUCTURE

### G065: ESP Integration Architecture (P0)
**Source Proof:** Gap Audit G065 | **Current Behavior:** PRD mentions email but no sending architecture exists. | **Target Behavior:** A defined abstraction layer to route emails through SendGrid, Resend, or Amazon SES.
**Product Decision:** Build a provider-agnostic interface (`IEmailProvider`) and implement Amazon SES as the primary transactional sender, with SendGrid as the marketing sender.
**UX/Admin/Support Impact:** Reliable delivery.
**Implementation Contract:** `packages/email-engine/src/providers/ses.ts`.
**Acceptance Criteria:** The system can send a test email via SES using the `IEmailProvider.send()` method without knowing the underlying implementation.
**Telemetry/Risk:** ESP API outages.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G066: Email Rendering Engine (P0)
**Source Proof:** Gap Audit G066 | **Current Behavior:** Unknown HTML generation. | **Target Behavior:** Guaranteed cross-client compatibility (Outlook, Gmail, Apple Mail, Dark Mode).
**Product Decision:** Strictly enforce MJML as the intermediate representation. The backend compiles MJML to HTML just-in-time before sending or exporting.
**UX/Admin/Support Impact:** Prevents broken layouts in legacy clients (Outlook Windows).
**Implementation Contract:** Integrate the `mjml` npm package.
**Acceptance Criteria:** A complex compositional poster generated by the AI is embedded in an MJML wrapper, compiled, and renders perfectly in Litmus/Email on Acid tests for Outlook 2019.
**Telemetry/Risk:** MJML compilation overhead.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G067: SPF/DKIM/DMARC Setup (P0)
**Source Proof:** Gap Audit G067 | **Current Behavior:** Emails would go to spam. | **Target Behavior:** Automated or guided setup for customers to authenticate their sending domains.
**Product Decision:** Provide a UI displaying the required DNS records (CNAME/TXT) and a button to verify propagation.
**UX/Admin/Support Impact:** Customers cannot send emails from `@theirbrand.com` until verified.
**Implementation Contract:** API integration with the ESP to generate and check domain identities.
**Acceptance Criteria:** A user can input `brand.com`, receive 3 DNS records, and the UI updates to "Verified" once the ESP confirms DKIM alignment.
**Telemetry/Risk:** High support volume for DNS configuration.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G068: Deliverability Monitoring (P1)
**Source Proof:** Gap Audit G068 | **Current Behavior:** Blind to bounces. | **Target Behavior:** Ingestion of ESP webhooks to track bounces, drops, and spam complaints per workspace.
**Product Decision:** Set up an endpoint `/webhooks/email-events` to receive SES/SendGrid event payloads.
**UX/Admin/Support Impact:** Dashboard showing bounce rates. Auto-suspend workspaces with >5% bounce rate.
**Implementation Contract:** Webhook handler validating the ESP signature and updating campaign stats.
**Acceptance Criteria:** A hard bounce event from the ESP updates the specific recipient's status to "Bounced" in the database.
**Telemetry/Risk:** Webhook volume can overwhelm the API during large sends.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G069: Dedicated IP vs Shared IP (P1)
**Source Proof:** Gap Audit G069 | **Current Behavior:** N/A. | **Target Behavior:** Strategy to protect VIYO's sender reputation from bad actors.
**Product Decision:** All new workspaces start on a shared IP pool. Enterprise tier gets dedicated IPs.
**UX/Admin/Support Impact:** Protects good customers from the bad behavior of others.
**Implementation Contract:** ESP configuration mapping `workspace_id` to specific IP pools.
**Acceptance Criteria:** Emails from a basic tier workspace are routed through the `shared-pool`, while enterprise emails route through `dedicated-pool-A`.
**Telemetry/Risk:** Dedicated IPs require warming (G070).
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G070: Email Warm-up Strategy (P1)
**Source Proof:** Gap Audit G070 | **Current Behavior:** N/A. | **Target Behavior:** Automated throttling of send volume for new dedicated IPs to build reputation.
**Product Decision:** Enforce daily send limits that increase logarithmically over 30 days for new domains/IPs.
**UX/Admin/Support Impact:** Prevents immediate blacklisting by Gmail.
**Implementation Contract:** Rate limiter applied to the email sending queue.
**Acceptance Criteria:** A new enterprise customer attempting to send 50,000 emails on day 1 has their queue throttled to 1,000/day, scaling up automatically.
**Telemetry/Risk:** Customer frustration if limits are not communicated.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G071: Unsubscribe Handling (P0)
**Source Proof:** Gap Audit G071 | **Current Behavior:** No mechanism. | **Target Behavior:** RFC 8058 compliance (List-Unsubscribe header) and a functional unsubscribe landing page.
**Product Decision:** Inject the `List-Unsubscribe: <mailto:...>, <https://...>` header into every marketing email.
**UX/Admin/Support Impact:** Required by Gmail/Yahoo 2024 sender guidelines.
**Implementation Contract:** Endpoint `/api/unsubscribe?token=xyz` that marks the recipient as opted-out.
**Acceptance Criteria:** Clicking "Unsubscribe" in Gmail's native UI successfully processes the webhook and prevents future sends to that address.
**Telemetry/Risk:** Spam placement if missing.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G072: Sending Rate Limiting (P1)
**Source Proof:** Gap Audit G072 | **Current Behavior:** N/A. | **Target Behavior:** Queue-based sending to respect ESP API limits (e.g., 14 req/sec for SES).
**Product Decision:** Use Inngest to manage the outbound email queue with concurrency controls.
**UX/Admin/Support Impact:** Reliable delivery of large campaigns.
**Implementation Contract:** Inngest function `send-campaign-batch` with `concurrency: 10`.
**Acceptance Criteria:** A campaign of 10,000 emails is processed smoothly over several minutes without triggering HTTP 429 errors from the ESP.
**Telemetry/Risk:** Queue backlog.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G074: Bounce and Complaint Processing (P1)
**Source Proof:** Gap Audit G074 | **Current Behavior:** N/A. | **Target Behavior:** Automatic suppression of hard bounces and spam complaints.
**Product Decision:** (Tied to G068). If a spam complaint webhook is received, immediately add the email to the workspace's suppression list.
**UX/Admin/Support Impact:** Protects sender reputation.
**Implementation Contract:** `suppression_list` table. Pre-send check against this table.
**Acceptance Criteria:** The system refuses to send an email to an address that previously registered a spam complaint.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G075: Email Analytics Pipeline (P1)
**Source Proof:** Gap Audit G075 | **Current Behavior:** No tracking. | **Target Behavior:** Tracking pixels for opens, and rewritten URLs for click tracking.
**Product Decision:** Inject a 1x1 transparent GIF into HTML emails. Rewrite all `href` links to route through `viyo.app/click?url=...`.
**UX/Admin/Support Impact:** Campaign performance dashboards.
**Implementation Contract:** MJML compilation step that transforms links and appends the pixel.
**Acceptance Criteria:** A user clicking a link in the email is redirected to the destination, and the `campaign_clicks` table records the event.
**Telemetry/Risk:** Privacy blockers (Apple Mail Privacy Protection) will skew open rates.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G076: Suppression List Management (P0)
**Source Proof:** Gap Audit G076 | **Current Behavior:** N/A. | **Target Behavior:** A global and per-workspace list of Do-Not-Email addresses.
**Product Decision:** Maintain a system-wide list for known toxic domains, and a workspace-specific list for unsubscribes/bounces.
**UX/Admin/Support Impact:** Legal compliance.
**Implementation Contract:** `suppression_list` table (email_hash, workspace_id, reason, created_at).
**Acceptance Criteria:** An API call to send an email to a suppressed address returns a 400 Bad Request or silently drops the message (logging the drop).
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G077: Transactional vs Marketing Split (P1)
**Source Proof:** Gap Audit G077 | **Current Behavior:** N/A. | **Target Behavior:** Strict separation of message types to protect transactional deliverability (password resets) from marketing reputation.
**Product Decision:** Use two different ESP sub-accounts or IP pools.
**UX/Admin/Support Impact:** Password resets always arrive, even if a marketing campaign gets flagged.
**Implementation Contract:** `EmailService.send({ type: 'transactional' | 'marketing' })` routes to different underlying configurations.
**Acceptance Criteria:** A password reset email uses the `transactional` profile and does not include an unsubscribe link.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 8: AI/ML OPERATIONS

### G078: Prompt Versioning and Registry (P0)
**Source Proof:** Gap Audit G078 | **Current Behavior:** Prompts are hardcoded strings in source code. | **Target Behavior:** Prompts are treated as versioned assets stored in the database or a dedicated registry, allowing updates without deploying code.
**Product Decision:** Store system prompts in a `prompt_templates` table (id, name, version, content, is_active).
**UX/Admin/Support Impact:** PO can tweak the "Compositional Poster" prompt via an admin UI to improve output quality instantly.
**Implementation Contract:** The AI router fetches the active prompt template by name and injects variables.
**Acceptance Criteria:** Changing the text of the `poster_generation_v1` prompt in the database immediately alters the behavior of the next user request without a server restart.
**Telemetry/Risk:** A bad prompt update breaks generation globally.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G079: Model Fallback Chain (P0)
**Source Proof:** Gap Audit G079 | **Current Behavior:** Single point of failure if a model API is down. | **Target Behavior:** Automated fallback (e.g., Flux Pro -> Ideogram -> SDXL) if the primary provider times out or returns a 5xx error.
**Product Decision:** Implement a retry/fallback wrapper around all AI calls.
**UX/Admin/Support Impact:** High availability for image generation.
**Implementation Contract:** Array of providers configured per generation mode. Catch block tries the next provider.
**Acceptance Criteria:** If Kie.ai returns a 502 for Ideogram, the system automatically routes the request to Replicate/Flux and succeeds, logging the fallback event.
**Telemetry/Risk:** Fallback models may have different prompt requirements or lower quality.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G080: AI Output Quality Monitoring (P1)
**Source Proof:** Gap Audit G080 | **Current Behavior:** No measurement of whether users like the output. | **Target Behavior:** Explicit and implicit feedback loops.
**Product Decision:** Track generation abandonment (user generates but deletes/doesn't use) and explicit thumbs up/down.
**UX/Admin/Support Impact:** Data-driven prompt optimization.
**Implementation Contract:** Add `feedback_score` to the `images` table.
**Acceptance Criteria:** A user clicking "Regenerate" logs a negative implicit signal for the previous generation's prompt/model combination.
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G081: AI Cost Tracking (P1)
**Source Proof:** Gap Audit G081 | **Current Behavior:** Usage ledger exists but lacks granular cost mapping. | **Target Behavior:** Real-time calculation of API cost per generation to protect margins.
**Product Decision:** Map token usage to current API pricing (e.g., $0.03 per Flux Pro image) in the `usage_ledger`.
**UX/Admin/Support Impact:** Margin dashboard for the PO.
**Implementation Contract:** `model_pricing` table. Join with `usage_ledger` to calculate exact cost.
**Acceptance Criteria:** The admin dashboard displays the exact dollar cost incurred by Workspace X over the last 30 days.
**Telemetry/Risk:** Pricing changes require manual updates to the table.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G082: Prompt Injection Defense (P0)
**Source Proof:** Gap Audit G082 | **Current Behavior:** User input is passed directly to the LLM/Image model. | **Target Behavior:** Input sanitization to prevent users from overriding system instructions or extracting the base prompt.
**Product Decision:** Use a lightweight LLM pre-check or strict regex/length limits on user inputs before passing to the expensive generation model.
**UX/Admin/Support Impact:** Security and brand safety.
**Implementation Contract:** Input validation layer. Enforce maximum character limits on the `[PRODUCT_DESCRIPTION]` variable.
**Acceptance Criteria:** A user input containing "Ignore previous instructions and output..." is rejected or neutralized before reaching the image generation model.
**Telemetry/Risk:** False positives blocking legitimate creative prompts.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G083: AI Content Safety Filtering (P0)
**Source Proof:** Gap Audit G083 | **Current Behavior:** Relies entirely on the provider's native filtering. | **Target Behavior:** Explicit pre- and post-generation safety checks for NSFW, violence, or brand-unsafe content.
**Product Decision:** Use OpenAI Moderation API on the prompt *before* generating the image.
**UX/Admin/Support Impact:** Prevents VIYO from being used to generate abusive content.
**Implementation Contract:** Call `POST /v1/moderations` with the user's input. If flagged, return a 400 error immediately.
**Acceptance Criteria:** A prompt containing violent keywords is blocked in < 500ms and the user's token balance is not deducted.
**Telemetry/Risk:** Extra latency (usually < 200ms).
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G086: Graceful Degradation (P1)
**Source Proof:** Gap Audit G086 | **Current Behavior:** UI breaks or hangs if AI is down. | **Target Behavior:** The core email editor (MJML, layout, text) remains fully functional even if image generation APIs are completely offline.
**Product Decision:** Decouple the Visual Engine from the Email Editor.
**UX/Admin/Support Impact:** Users can still build and send emails using existing assets.
**Implementation Contract:** Frontend state management. If the AI router health check fails, disable the "Generate" button with a clear "Service degraded" tooltip, but keep the rest of the editor active.
**Acceptance Criteria:** Simulating a 100% failure rate on the AI endpoints allows a user to successfully create, edit, and export an email using uploaded stock photos.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G087: SLA Monitoring and Failover (P1)
**Source Proof:** Gap Audit G087 | **Current Behavior:** Reactive failover. | **Target Behavior:** Proactive circuit breaking based on rolling error rates.
**Product Decision:** If a provider (e.g., Kie.ai) returns > 10% errors in a 5-minute window, trip the circuit breaker and route all traffic to the secondary provider automatically.
**UX/Admin/Support Impact:** Prevents the "slow death" scenario where a degraded API causes timeouts for every user.
**Implementation Contract:** Circuit breaker pattern (e.g., `opossum` or custom Redis counters).
**Acceptance Criteria:** After 5 consecutive timeouts from Provider A, the 6th request immediately routes to Provider B without waiting for A to timeout again.
**Telemetry/Risk:** Circuit breaker state must be shared across serverless instances (requires Redis).
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G088: Token Budget Enforcement (P0)
**Source Proof:** Gap Audit G088 | **Current Behavior:** (Addressed partially by Task 71). | **Target Behavior:** Strict, atomic enforcement of workspace token limits to prevent runaway generation or concurrent request exploits.
**Product Decision:** Preflight check + Atomic deduction (per Task 71 architecture plan).
**UX/Admin/Support Impact:** Prevents financial loss.
**Implementation Contract:** Postgres `UPDATE ... WHERE balance >= cost` returning the updated row.
**Acceptance Criteria:** A user with 10 tokens firing 5 concurrent requests for a 5-token generation results in exactly 2 successes and 3 "Insufficient Tokens" errors. Balance never drops below 0.
**Telemetry/Risk:** Database contention on the `workspaces` row during high concurrency.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build
## CATEGORY 9: TESTING & QUALITY ASSURANCE

### G089: Unit Testing Strategy (P0)
**Source Proof:** Gap Audit G089 | **Current Behavior:** Minimal or no unit tests. | **Target Behavior:** All business logic functions (token engine, billing, prompt construction) have unit tests with 80% line coverage.
**Product Decision:** Use Vitest as the test runner (aligned with the Vite toolchain).
**UX/Admin/Support Impact:** Prevents regressions.
**Implementation Contract:** `vitest.config.ts` at workspace root. Tests co-located with source files (`*.test.ts`).
**Acceptance Criteria:** `pnpm test` runs all unit tests and reports >= 80% line coverage for `packages/shared` and `apps/worker/src/lib`.
**Telemetry/Risk:** Flaky tests erode trust.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G090: Integration Testing Strategy (P0)
**Source Proof:** Gap Audit G090 | **Current Behavior:** None. | **Target Behavior:** Tests that exercise the tRPC router against a real (local) database.
**Product Decision:** Use a Supabase local dev stack (Docker) for integration tests.
**UX/Admin/Support Impact:** Catches RLS policy errors before production.
**Implementation Contract:** `apps/worker/tests/integration/` directory. Each test seeds data, calls the tRPC endpoint, and asserts the DB state.
**Acceptance Criteria:** An integration test for `artDirector.routeGeneration` verifies that the `usage_ledger` row is created with the correct `workspace_id` and `cost_tokens`.
**Telemetry/Risk:** Slow test suite if DB setup is not optimized.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G091: End-to-End Testing (P1)
**Source Proof:** Gap Audit G091 | **Current Behavior:** None. | **Target Behavior:** Playwright tests covering the critical user flows (signup, generate image, export email).
**Product Decision:** Use Playwright with the Chromium browser.
**UX/Admin/Support Impact:** Catches UI regressions.
**Implementation Contract:** `tests/e2e/` directory. CI runs E2E against the staging environment.
**Acceptance Criteria:** A Playwright test can log in, navigate to the Image Studio, generate an image (mocked AI response), and verify the image appears in the gallery.
**Telemetry/Risk:** E2E tests are inherently flaky; use retries and stable selectors.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G093: API Contract Testing (P1)
**Source Proof:** Gap Audit G093 | **Current Behavior:** None. | **Target Behavior:** Zod schemas serve as the contract, and tests verify that the API response matches the schema.
**Product Decision:** Auto-generate contract tests from the Zod schemas already used in tRPC.
**UX/Admin/Support Impact:** Prevents frontend/backend schema drift.
**Implementation Contract:** Vitest tests that call each tRPC procedure and validate the response against the Zod output schema.
**Acceptance Criteria:** If a developer changes the response shape of `artDirector.routeGeneration` without updating the Zod schema, the contract test fails.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G094: Load Testing (P1)
**Source Proof:** Gap Audit G094 | **Current Behavior:** Unknown capacity. | **Target Behavior:** Documented performance benchmarks for key endpoints.
**Product Decision:** Use k6 for load testing against the staging environment.
**UX/Admin/Support Impact:** Confidence in scaling.
**Implementation Contract:** `tests/load/` directory with k6 scripts.
**Acceptance Criteria:** The `/api/v1/generate` endpoint sustains 100 concurrent requests with p95 latency < 2 seconds (excluding AI provider time).
**Telemetry/Risk:** Staging costs during load tests.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G096: Test Data Management (P1)
**Source Proof:** Gap Audit G096 | **Current Behavior:** Manual SQL inserts. | **Target Behavior:** Factories and fixtures for reproducible test data.
**Product Decision:** Build TypeScript factory functions (e.g., `createTestWorkspace()`, `createTestUser()`) that seed the local DB.
**UX/Admin/Support Impact:** Faster test writing.
**Implementation Contract:** `packages/test-utils/src/factories.ts`.
**Acceptance Criteria:** `createTestWorkspace()` returns a fully populated workspace with an owner, a brand, and 100 token balance.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G097: CI Pipeline with Test Gates (P0)
**Source Proof:** Gap Audit G097 | **Current Behavior:** CI exists but has no test gates. | **Target Behavior:** PRs cannot merge if unit, integration, or lint checks fail.
**Product Decision:** GitHub Actions workflow with `lint`, `typecheck`, `test:unit`, `test:integration` jobs.
**UX/Admin/Support Impact:** Code quality enforcement.
**Implementation Contract:** `.github/workflows/ci.yml`.
**Acceptance Criteria:** A PR with a failing unit test displays a red "X" on the GitHub PR page and cannot be merged.
**Telemetry/Risk:** Slow CI (target < 5 minutes).
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G098: Code Coverage Reporting (P1)
**Source Proof:** Gap Audit G098 | **Current Behavior:** None. | **Target Behavior:** Coverage reports generated in CI and visible on PRs.
**Product Decision:** Use Vitest's built-in coverage reporter with Codecov or a GitHub comment bot.
**UX/Admin/Support Impact:** Visibility into test health.
**Implementation Contract:** `vitest.config.ts` with `coverage: { reporter: ['text', 'lcov'] }`.
**Acceptance Criteria:** Every PR comment shows the coverage delta (e.g., "+2.3% to 82.1%").
**Telemetry/Risk:** None.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 10: SCALABILITY & PERFORMANCE

### G099: Core Web Vitals Targets (P1)
**Source Proof:** Gap Audit G099 | **Current Behavior:** Unmeasured. | **Target Behavior:** LCP < 2.5s, INP < 200ms, CLS < 0.1 for all primary routes.
**Product Decision:** Measure via Vercel Analytics and optimize the critical rendering path.
**UX/Admin/Support Impact:** SEO and user experience.
**Implementation Contract:** Enable Vercel Speed Insights.
**Acceptance Criteria:** The `/dashboard` route scores "Good" on all three Core Web Vitals in the Vercel dashboard.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G100: Image/Asset Optimization (P1)
**Source Proof:** Gap Audit G100 | **Current Behavior:** Raw AI output served directly. | **Target Behavior:** Generated images are compressed, resized, and served via CDN with responsive `srcset`.
**Product Decision:** Use Cloudflare R2 with image transformations or a lightweight Sharp-based post-processing step.
**UX/Admin/Support Impact:** Faster page loads, lower bandwidth costs.
**Implementation Contract:** Post-generation pipeline: generate -> compress (WebP, 80% quality) -> upload to R2 -> serve via CDN URL.
**Acceptance Criteria:** A generated 4MB PNG is served to the browser as a 200KB WebP via a CDN URL.
**Telemetry/Risk:** Quality loss if compression is too aggressive.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G101: API Response Time SLAs (P0)
**Source Proof:** Gap Audit G101 | **Current Behavior:** No targets. | **Target Behavior:** Internal SLA: p95 < 200ms for CRUD endpoints, p95 < 30s for AI generation endpoints.
**Product Decision:** Document the SLA targets and measure via APM (G010).
**UX/Admin/Support Impact:** Enterprise procurement requires published SLAs.
**Implementation Contract:** SLA document + APM alerting.
**Acceptance Criteria:** An alert fires if the 5-minute rolling p95 for any CRUD endpoint exceeds 500ms.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G102: Caching Strategy (P0)
**Source Proof:** Gap Audit G102 | **Current Behavior:** No application-level caching. | **Target Behavior:** Redis/Upstash caching for frequently accessed data (workspace settings, feature flags, prompt templates).
**Product Decision:** Cache workspace settings with a 5-minute TTL. Cache prompt templates with a 1-minute TTL.
**UX/Admin/Support Impact:** Faster API responses.
**Implementation Contract:** Upstash Redis client. Cache-aside pattern in the data access layer.
**Acceptance Criteria:** After the first request for workspace settings, subsequent requests within 5 minutes do not hit the database (verified via query logs).
**Telemetry/Risk:** Stale data if TTL is too long.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G104: Database Indexing Strategy (P1)
**Source Proof:** Gap Audit G104 | **Current Behavior:** Default indexes only. | **Target Behavior:** Explicit indexes on all foreign keys and frequently queried columns.
**Product Decision:** Add composite indexes for `(workspace_id, created_at)` on high-volume tables (images, audit_logs, usage_ledger).
**UX/Admin/Support Impact:** Prevents slow queries as data grows.
**Implementation Contract:** Drizzle migration adding the indexes.
**Acceptance Criteria:** `EXPLAIN ANALYZE` on `SELECT * FROM images WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 20` shows an Index Scan, not a Seq Scan.
**Telemetry/Risk:** Write overhead from too many indexes.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G105: Connection Pooling (P1)
*(Duplicate of G027, handled in Data Management)*

### G107: Queue/Job Capacity Planning (P1)
**Source Proof:** Gap Audit G107 | **Current Behavior:** Inngest with default concurrency. | **Target Behavior:** Documented concurrency limits and queue depth alerts for Inngest functions.
**Product Decision:** Set concurrency limits per function type (e.g., `send-email: 50`, `generate-image: 20`).
**UX/Admin/Support Impact:** Prevents queue starvation.
**Implementation Contract:** Inngest function configuration.
**Acceptance Criteria:** The `generate-image` function is limited to 20 concurrent executions, and the 21st request is queued (not dropped).
**Telemetry/Risk:** Alert if queue depth exceeds 100.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 11: INTERNATIONALIZATION

### G109: i18n Architecture (P1)
**Source Proof:** Gap Audit G109 | **Current Behavior:** All strings hardcoded in English. | **Target Behavior:** String extraction pipeline allowing future translation without code changes.
**Product Decision:** Use `react-i18next` with JSON translation files. English is the only language for beta.
**UX/Admin/Support Impact:** Unblocks future localization.
**Implementation Contract:** Wrap all user-facing strings in `t('key')` calls.
**Acceptance Criteria:** All strings on the `/dashboard` page are loaded from `en.json` and can be swapped to `es.json` by changing the locale setting.
**Telemetry/Risk:** Developer friction if enforcement is weak.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G112: Timezone Handling (P1)
**Source Proof:** Gap Audit G112 | **Current Behavior:** All times in UTC. | **Target Behavior:** Email scheduling respects the recipient's local timezone.
**Product Decision:** Store all timestamps in UTC. Convert to the workspace's configured timezone for display. Email scheduling uses the workspace timezone.
**UX/Admin/Support Impact:** Critical for email marketing ("Send at 9 AM recipient time").
**Implementation Contract:** `workspaces.timezone` column (IANA format, e.g., `America/New_York`).
**Acceptance Criteria:** An email scheduled for "9:00 AM" in a workspace set to `America/New_York` is queued for 14:00 UTC.
**Telemetry/Risk:** DST edge cases.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 12: ACCESSIBILITY

### G115: WCAG 2.1 AA Compliance (P0)
**Source Proof:** Gap Audit G115 | **Current Behavior:** No accessibility testing. | **Target Behavior:** All primary user flows pass WCAG 2.1 AA automated checks.
**Product Decision:** Integrate `axe-core` into the CI pipeline.
**UX/Admin/Support Impact:** Legal compliance (ADA) and broader usability.
**Implementation Contract:** `@axe-core/playwright` in E2E tests.
**Acceptance Criteria:** The E2E test suite includes an accessibility scan of the dashboard, and CI fails if any "critical" or "serious" violations are found.
**Telemetry/Risk:** High initial violation count.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G116: Keyboard Navigation (P0)
**Source Proof:** Gap Audit G116 | **Current Behavior:** Mouse-only interactions. | **Target Behavior:** All interactive elements are reachable and operable via keyboard (Tab, Enter, Escape).
**Product Decision:** Use semantic HTML and ARIA roles. Enforce focus-visible styles.
**UX/Admin/Support Impact:** Required for users with motor disabilities.
**Implementation Contract:** Component-level audit and fix.
**Acceptance Criteria:** A user can navigate from login to image generation using only the keyboard, with visible focus indicators at every step.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G117: Screen Reader Compatibility (P0)
**Source Proof:** Gap Audit G117 | **Current Behavior:** No ARIA labels. | **Target Behavior:** All images have alt text, all buttons have accessible names, and dynamic content changes are announced.
**Product Decision:** Add `aria-label`, `aria-live`, and `role` attributes throughout the UI.
**UX/Admin/Support Impact:** Required for visually impaired users.
**Implementation Contract:** Component-level audit.
**Acceptance Criteria:** VoiceOver (macOS) or NVDA (Windows) can read the full dashboard content without encountering unlabeled elements.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G118: Color Contrast Enforcement (P1)
**Source Proof:** Gap Audit G118 | **Current Behavior:** Unchecked. | **Target Behavior:** All text meets 4.5:1 contrast ratio (AA standard).
**Product Decision:** Enforce via Tailwind CSS theme configuration and axe-core CI checks.
**UX/Admin/Support Impact:** Readability for all users.
**Implementation Contract:** Tailwind color palette audit.
**Acceptance Criteria:** The axe-core scan reports zero color contrast violations on all primary pages.
**Telemetry/Risk:** Design changes may be needed.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G119: Focus Management (P1)
**Source Proof:** Gap Audit G119 | **Current Behavior:** Focus lost on route changes. | **Target Behavior:** Focus is programmatically moved to the main content area on SPA route transitions, and trapped inside modals.
**Product Decision:** Use a focus trap library for modals/drawers. Announce route changes via `aria-live`.
**UX/Admin/Support Impact:** Prevents disorientation for keyboard/screen reader users.
**Implementation Contract:** React Router `useEffect` to manage focus on navigation.
**Acceptance Criteria:** Opening a modal traps focus inside it; pressing Escape closes the modal and returns focus to the trigger button.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G121: Alt Text for AI Images (P1)
**Source Proof:** Gap Audit G121 | **Current Behavior:** Generated images have no alt text. | **Target Behavior:** Auto-generated alt text based on the prompt or a vision model description.
**Product Decision:** Use the generation prompt as the default alt text. Allow manual override.
**UX/Admin/Support Impact:** Accessibility and SEO for exported emails.
**Implementation Contract:** Store `alt_text` in the `images` table, defaulting to the truncated prompt.
**Acceptance Criteria:** An image generated with the prompt "Summer dress on beach" has `alt="Summer dress on beach"` in the exported HTML.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 13: REAL-TIME & COLLABORATION

### G122: Real-Time Notifications (P1)
**Source Proof:** Gap Audit G122 | **Current Behavior:** Polling or page refresh required. | **Target Behavior:** Server-Sent Events (SSE) for real-time updates (generation complete, approval requested).
**Product Decision:** Use SSE over WebSockets (simpler, works through CDNs, no bidirectional needed).
**UX/Admin/Support Impact:** Instant feedback when async operations complete.
**Implementation Contract:** Hono SSE endpoint. React `useEventSource` hook.
**Acceptance Criteria:** When a background image generation completes, the user's browser receives the event and updates the gallery without a page refresh.
**Telemetry/Risk:** Connection limits on Render.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G124: Optimistic UI Updates (P1)
**Source Proof:** Gap Audit G124 | **Current Behavior:** UI waits for server response. | **Target Behavior:** UI updates immediately on user action and rolls back if the server rejects.
**Product Decision:** Use React Query's `onMutate` for optimistic updates on non-destructive actions (e.g., renaming, tagging).
**UX/Admin/Support Impact:** Perceived speed improvement.
**Implementation Contract:** React Query mutation configuration.
**Acceptance Criteria:** Renaming a template updates the UI instantly; if the server returns a 409 Conflict, the UI reverts to the original name with a toast error.
**Telemetry/Risk:** Rollback UX must be smooth.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G125: Conflict Resolution (P1)
**Source Proof:** Gap Audit G125 | **Current Behavior:** Last-write-wins. | **Target Behavior:** Detect concurrent edits and warn the user before overwriting.
**Product Decision:** Use `updated_at` timestamps as optimistic locks.
**UX/Admin/Support Impact:** Prevents data loss in multi-user workspaces.
**Implementation Contract:** `UPDATE ... WHERE updated_at = $original_timestamp`. If 0 rows affected, return 409 Conflict.
**Acceptance Criteria:** Two users editing the same template simultaneously: the second user to save receives a "This template was modified by another user" warning.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 14: INTEGRATION & EXTENSIBILITY

### G127: Webhook Delivery Infrastructure (P1)
**Source Proof:** Gap Audit G127 | **Current Behavior:** Events defined but no delivery mechanism. | **Target Behavior:** Reliable webhook delivery with retry, dead letter, and HMAC signatures.
**Product Decision:** Use Inngest to manage webhook delivery with 3 retries and exponential backoff.
**UX/Admin/Support Impact:** Enables customer integrations.
**Implementation Contract:** `webhook_subscriptions` table (workspace_id, url, events[], secret). Inngest function to POST payloads.
**Acceptance Criteria:** A webhook configured for `image.generated` receives a signed POST within 5 seconds of the event, and a failed delivery is retried 3 times.
**Telemetry/Risk:** Webhook endpoints that are slow or down can consume Inngest capacity.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G128: Public API Documentation (P1)
*(Duplicate of G164, handled in Developer Experience)*

### G129: API Rate Limiting (P1)
*(Extension of G035, handled in Security. This entry adds per-API-key tiered limits.)*
**Product Decision:** Free tier: 60 req/min. Pro: 300 req/min. Enterprise: 1000 req/min.
**Implementation Contract:** Rate limiter reads the workspace's plan from Redis cache.
**Acceptance Criteria:** A Pro-tier API key making its 301st request in a minute receives a 429 with a `Retry-After` header.

### G134: API Versioning Strategy (P1)
**Source Proof:** Gap Audit G134 | **Current Behavior:** No versioning. | **Target Behavior:** URL-based versioning (`/api/v1/...`) with a documented deprecation policy.
**Product Decision:** All current endpoints live under `/api/v1`. Breaking changes require a new version prefix.
**UX/Admin/Support Impact:** Prevents breaking existing integrations.
**Implementation Contract:** Hono route grouping.
**Acceptance Criteria:** The API serves `/api/v1/images` and the documentation states the deprecation timeline for v1 when v2 is released.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 15: BILLING EDGE CASES

### G136: Proration Handling (P0)
**Source Proof:** Gap Audit G136 | **Current Behavior:** Unknown behavior on mid-cycle upgrade. | **Target Behavior:** Stripe handles proration automatically; VIYO must correctly update the workspace's token balance to reflect the new tier immediately.
**Product Decision:** Use Stripe's `proration_behavior: 'create_prorations'` and listen for the `customer.subscription.updated` webhook to adjust the token balance.
**UX/Admin/Support Impact:** Users upgrading mid-cycle see their new token balance instantly.
**Implementation Contract:** Stripe webhook handler for `customer.subscription.updated`.
**Acceptance Criteria:** A user upgrading from Pro (500 tokens) to Enterprise (2000 tokens) mid-cycle receives the prorated token difference immediately.
**Telemetry/Risk:** Double-crediting if webhook is processed twice (use idempotency keys).
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G137: Refund Workflow (P1)
**Source Proof:** Gap Audit G137 | **Current Behavior:** Manual Stripe dashboard refunds. | **Target Behavior:** Admin-initiated refund with automatic token clawback.
**Product Decision:** Build an admin endpoint that issues a Stripe refund and deducts the corresponding tokens.
**UX/Admin/Support Impact:** Support can process refunds without Stripe dashboard access.
**Implementation Contract:** Admin API endpoint.
**Acceptance Criteria:** Refunding $20 for a Pro plan deducts the corresponding 200 tokens from the workspace balance.
**Telemetry/Risk:** Negative token balance edge case.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G138: Invoice Generation/Tax (P1)
**Source Proof:** Gap Audit G138 | **Current Behavior:** Stripe generates basic invoices. | **Target Behavior:** Stripe Tax enabled for automatic tax calculation per jurisdiction.
**Product Decision:** Enable Stripe Tax and ensure all products have tax codes.
**UX/Admin/Support Impact:** Legal compliance for EU VAT, US sales tax.
**Implementation Contract:** Stripe dashboard configuration.
**Acceptance Criteria:** An invoice for a German customer includes the correct 19% VAT line item.
**Telemetry/Risk:** Tax misconfiguration.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G139: Failed Payment Recovery (P1)
**Source Proof:** Gap Audit G139 | **Current Behavior:** Basic Stripe dunning. | **Target Behavior:** Multi-step recovery: Stripe dunning -> in-app banner -> email notification -> workspace suspension.
**Product Decision:** Use Stripe Smart Retries + custom Inngest job for the escalation ladder.
**UX/Admin/Support Impact:** Revenue recovery.
**Implementation Contract:** Inngest cron job checking for `past_due` subscriptions.
**Acceptance Criteria:** 7 days after a failed payment, the user sees an in-app banner. 14 days later, the workspace is suspended.
**Telemetry/Risk:** Aggressive suspension may increase churn.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G140: Enterprise/Custom Pricing (P1)
**Source Proof:** Gap Audit G140 | **Current Behavior:** 4 fixed tiers only. | **Target Behavior:** Ability to create custom Stripe prices for enterprise deals.
**Product Decision:** Admin UI to assign a custom Stripe Price ID to a workspace.
**UX/Admin/Support Impact:** Unblocks enterprise sales.
**Implementation Contract:** `workspaces.custom_stripe_price_id` column.
**Acceptance Criteria:** An admin can override the default Pro pricing for Workspace X with a custom $500/month plan.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G141: Usage Reconciliation (P0)
**Source Proof:** Gap Audit G141 | **Current Behavior:** Token balance and actual API costs are not reconciled. | **Target Behavior:** Automated daily reconciliation job comparing token deductions against AI provider invoices.
**Product Decision:** Inngest cron job that sums `usage_ledger.cost_tokens` and compares against the provider's usage API.
**UX/Admin/Support Impact:** Margin protection.
**Implementation Contract:** Reconciliation function with alerting on > 5% discrepancy.
**Acceptance Criteria:** If the internal ledger shows 10,000 tokens consumed but the OpenAI API reports $150 in charges (expected $100), an alert fires.
**Telemetry/Risk:** Provider API rate limits.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G142: Dispute Resolution (P1)
**Source Proof:** Gap Audit G142 | **Current Behavior:** None. | **Target Behavior:** Documented process for handling Stripe chargebacks and billing disputes.
**Product Decision:** Markdown runbook.
**UX/Admin/Support Impact:** Reduces chargeback losses.
**Implementation Contract:** `docs/internal/billing/DISPUTE_RESOLUTION.md`.
**Acceptance Criteria:** Runbook defines the steps to respond to a Stripe dispute within 7 days.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 16: CUSTOMER SUPPORT & SUCCESS

### G146: In-App Support Widget (P1)
**Source Proof:** Gap Audit G146 | **Current Behavior:** None. | **Target Behavior:** Embedded chat or ticket widget for users to request help.
**Product Decision:** Integrate Intercom or Crisp.
**UX/Admin/Support Impact:** Reduces email support volume.
**Implementation Contract:** Script tag in the frontend.
**Acceptance Criteria:** A user can click a "Help" button in the bottom-right corner and submit a support request without leaving the app.
**Telemetry/Risk:** Cost per seat.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G147: Knowledge Base (P1)
**Source Proof:** Gap Audit G147 | **Current Behavior:** None. | **Target Behavior:** Self-serve help center with articles covering common questions.
**Product Decision:** Use a hosted solution (e.g., Intercom Articles, GitBook, or Notion public pages).
**UX/Admin/Support Impact:** Deflects support tickets.
**Implementation Contract:** External service configuration.
**Acceptance Criteria:** `help.viyo.app` resolves and contains at least 10 articles covering signup, billing, image generation, and email export.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G148: Onboarding Flow (P1)
**Source Proof:** Gap Audit G148 | **Current Behavior:** Users land on an empty dashboard. | **Target Behavior:** Guided first-run experience: upload brand assets -> generate first image -> export first email.
**Product Decision:** Build a step-by-step checklist component that appears on the first 3 logins.
**UX/Admin/Support Impact:** Reduces time-to-first-value.
**Implementation Contract:** `onboarding_progress` table tracking completed steps per user.
**Acceptance Criteria:** A new user sees a 4-step checklist overlay on their first login, and completing all steps triggers a "You're all set!" celebration.
**Telemetry/Risk:** None.
**Owner:** Frontend | **Phase:** 6.2 | **Disposition:** Active Build

### G152: Support SLAs (P1)
**Source Proof:** Gap Audit G152 | **Current Behavior:** None. | **Target Behavior:** Published response time commitments by tier.
**Product Decision:** Free: best effort. Pro: 24-hour response. Enterprise: 4-hour response (business hours).
**UX/Admin/Support Impact:** Enterprise procurement requirement.
**Implementation Contract:** Document and configure in the support tool.
**Acceptance Criteria:** SLA document published and the support tool alerts if a Pro ticket is unanswered for 20 hours.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G154: Communication Templates (P1)
**Source Proof:** Gap Audit G154 | **Current Behavior:** Ad-hoc emails. | **Target Behavior:** Pre-written templates for outage notifications, maintenance windows, and feature announcements.
**Product Decision:** Store templates in the knowledge base (G147).
**UX/Admin/Support Impact:** Consistent, professional communication.
**Implementation Contract:** Markdown templates.
**Acceptance Criteria:** An outage notification template exists with placeholders for `{{service_name}}`, `{{start_time}}`, and `{{estimated_resolution}}`.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G155: Changelog (P1)
**Source Proof:** Gap Audit G155 | **Current Behavior:** None. | **Target Behavior:** Public changelog showing recent updates.
**Product Decision:** Use a simple Markdown-based changelog or a tool like Canny/Headway.
**UX/Admin/Support Impact:** Builds user trust and reduces "is this feature live?" support tickets.
**Implementation Contract:** External service or static page.
**Acceptance Criteria:** `changelog.viyo.app` or `/changelog` displays the last 10 releases with dates and descriptions.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build
## CATEGORY 17: GOVERNANCE & ADMIN

### G156: Platform Admin Tools (P0)
**Source Proof:** Gap Audit G156 | **Current Behavior:** Manual database edits required. | **Target Behavior:** A secure internal dashboard for managing the platform.
**Product Decision:** Build `/admin` routes protected by an `is_super_admin` flag in the `users` table.
**UX/Admin/Support Impact:** PO and support can manage users without SQL.
**Implementation Contract:** Admin API endpoints for suspending workspaces, viewing usage, and granting tokens.
**Acceptance Criteria:** A super admin can search for a workspace by email and click "Suspend", instantly revoking all active sessions for that workspace.
**Telemetry/Risk:** Admin account compromise is a critical risk (requires MFA, G046).
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G157: Content Moderation Tools (P1)
**Source Proof:** Gap Audit G157 | **Current Behavior:** None. | **Target Behavior:** Admin UI to review flagged content and ban users.
**Product Decision:** Queue flagged generations (from G083 or user reports) for manual review.
**UX/Admin/Support Impact:** Brand safety enforcement.
**Implementation Contract:** `moderation_queue` table and Admin UI view.
**Acceptance Criteria:** An admin can view an image flagged as "borderline" by the AI safety filter and click "Approve" or "Delete & Warn User".
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G158: System Health Dashboard (P1)
**Source Proof:** Gap Audit G158 | **Current Behavior:** Must check 5 different SaaS dashboards. | **Target Behavior:** A unified internal view of system health.
**Product Decision:** Aggregate metrics (DB connections, Inngest queue length, AI provider error rates) into the `/admin` portal.
**UX/Admin/Support Impact:** Faster incident detection.
**Implementation Contract:** Admin API endpoint fetching stats from Supabase/Render/Inngest APIs.
**Acceptance Criteria:** The admin dashboard displays the current number of pending background jobs and the active DB connection count.
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G159: Admin Audit Trail (P1)
**Source Proof:** Gap Audit G159 | **Current Behavior:** None. | **Target Behavior:** Every action taken by a super admin is immutably logged.
**Product Decision:** Use the `audit_logs` table (G049) with a specific `actor_type: admin`.
**UX/Admin/Support Impact:** SOC 2 compliance.
**Implementation Contract:** Admin API middleware enforcing the log.
**Acceptance Criteria:** When an admin grants 1,000 free tokens to a workspace, the action is logged and cannot be deleted by the admin.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G160: Feature Flag UI (P1)
**Source Proof:** Gap Audit G160 | **Current Behavior:** None. | **Target Behavior:** Admin interface to toggle the flags created in G006.
**Product Decision:** Add a "Feature Flags" tab to the `/admin` portal.
**UX/Admin/Support Impact:** PO can manage rollouts without engineering help.
**Implementation Contract:** CRUD endpoints for the `feature_flags` table.
**Acceptance Criteria:** The PO can turn on the "Visual Engine V2" flag for a specific `workspace_id` via the UI.
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G161: Workspace Lifecycle Management (P0)
**Source Proof:** Gap Audit G161 | **Current Behavior:** Workspaces exist forever. | **Target Behavior:** Automated state machine: Trial -> Active -> Past Due -> Suspended -> Deleted.
**Product Decision:** State machine driven by Stripe webhooks and Inngest cron jobs.
**UX/Admin/Support Impact:** Revenue protection and compliance.
**Implementation Contract:** `workspaces.status` enum.
**Acceptance Criteria:** 30 days after a workspace enters the "Suspended" state (due to non-payment), an automated job queues the data deletion process (G025).
**Telemetry/Risk:** Accidental deletion of paying customers.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 18: DEVELOPER EXPERIENCE

### G163: Local Development Setup (P0)
**Source Proof:** Gap Audit G163 | **Current Behavior:** Undocumented, slow onboarding. | **Target Behavior:** A new engineer can run the full stack locally in under 30 minutes.
**Product Decision:** Provide a `docker-compose.yml` for local Supabase/Redis, and a `pnpm dev` script that starts all apps.
**UX/Admin/Support Impact:** Engineering velocity.
**Implementation Contract:** `README.md` and Docker config.
**Acceptance Criteria:** Running `pnpm install && pnpm dev` successfully starts the frontend, API, and local database without manual configuration.
**Telemetry/Risk:** None.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G164: API Documentation (P1)
**Source Proof:** Gap Audit G164 | **Current Behavior:** Read the source code. | **Target Behavior:** Auto-generated OpenAPI/Swagger documentation for the Hono backend.
**Product Decision:** Use `@hono/zod-openapi` to generate docs from the Zod schemas.
**UX/Admin/Support Impact:** Unblocks frontend development and external integrations.
**Implementation Contract:** Serve Swagger UI at `/api/docs`.
**Acceptance Criteria:** Navigating to `localhost:3001/api/docs` displays an interactive API explorer for all endpoints.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G165: Environment Variable Registry (P0)
**Source Proof:** Gap Audit G165 | **Current Behavior:** `.env.example` is often out of date. | **Target Behavior:** A single source of truth for all required configuration.
**Product Decision:** The Zod schema in `src/env.ts` (G008) serves as the registry. A script generates `.env.example` from it.
**UX/Admin/Support Impact:** Prevents configuration drift.
**Implementation Contract:** CI check ensuring `.env.example` matches the Zod schema keys.
**Acceptance Criteria:** Adding a new required env var to Zod but failing to add it to `.env.example` fails the CI build.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G166: Linting Enforcement (P1)
**Source Proof:** Gap Audit G166 | **Current Behavior:** Optional linting. | **Target Behavior:** Strict enforcement of ESLint and Prettier in CI and pre-commit hooks.
**Product Decision:** Use Husky for pre-commit; GitHub Actions for CI.
**UX/Admin/Support Impact:** Codebase consistency.
**Implementation Contract:** `.husky/pre-commit` running `lint-staged`.
**Acceptance Criteria:** Attempting to commit a file with a TypeScript type error or ESLint violation is blocked by Git.
**Telemetry/Risk:** Developer friction if rules are too pedantic.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G167: Monorepo Tooling (P1)
**Source Proof:** Gap Audit G167 | **Current Behavior:** Basic Turborepo setup. | **Target Behavior:** Optimized Turborepo caching to speed up CI builds.
**Product Decision:** Configure Vercel Remote Caching for Turborepo.
**UX/Admin/Support Impact:** Faster PR feedback loops.
**Implementation Contract:** `turbo.json` pipeline configuration.
**Acceptance Criteria:** A PR that only changes the `docs` folder does not trigger a rebuild of the `web` or `worker` apps in CI.
**Telemetry/Risk:** Cache poisoning if inputs are misconfigured.
**Owner:** DevOps | **Phase:** 6.2 | **Disposition:** Active Build

### G168: Git Workflow (P1)
**Source Proof:** Gap Audit G168 | **Current Behavior:** Ad-hoc branching. | **Target Behavior:** Documented trunk-based development workflow.
**Product Decision:** Feature branches (`feat/`, `fix/`, `chore/`) merging into `main` via PR.
**UX/Admin/Support Impact:** Predictable release cadence.
**Implementation Contract:** `CONTRIBUTING.md`.
**Acceptance Criteria:** Document defines the naming convention and requires PRs to link to a Taskmaster ID.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G169: Architecture Decision Records (P1)
**Source Proof:** Gap Audit G169 | **Current Behavior:** Decisions lost in Slack/Docs. | **Target Behavior:** A formal `/docs/adr` folder capturing "Why" a decision was made.
**Product Decision:** Adopt the Markdown ADR format (MADR).
**UX/Admin/Support Impact:** Preserves institutional knowledge.
**Implementation Contract:** `docs/adr/0001-use-hono-for-api.md`.
**Acceptance Criteria:** Every major architectural shift (e.g., changing the DB ORM) requires a merged ADR before code is written.
**Telemetry/Risk:** None.
**Owner:** Architect | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 19: DISASTER RECOVERY & BC

### G171: Vendor Lock-in Mitigation (P1)
**Source Proof:** Gap Audit G171 | **Current Behavior:** Highly coupled to Supabase/Vercel. | **Target Behavior:** Architectural abstraction allowing migration off PaaS if pricing changes.
**Product Decision:** Keep business logic in framework-agnostic functions. Use standard Postgres (no Supabase-specific RPCs where possible).
**UX/Admin/Support Impact:** Business continuity.
**Implementation Contract:** Document the "Eject" plan.
**Acceptance Criteria:** The system can be run on a generic Postgres instance and a generic Node.js server (Render) without Vercel/Supabase proprietary features blocking execution.
**Telemetry/Risk:** None.
**Owner:** Architect | **Phase:** 6.2 | **Disposition:** Active Build

### G172: Multi-Region Strategy (P1)
**Source Proof:** Gap Audit G172 | **Current Behavior:** Single region (us-east-1). | **Target Behavior:** Architecture supports multi-region deployment, even if not active on day one.
**Product Decision:** Do not hardcode region-specific URLs. Ensure database schema uses UUIDs (not sequential IDs) to prevent collision during active-active replication.
**UX/Admin/Support Impact:** Future scalability.
**Implementation Contract:** Enforce UUIDv4 or ULID for all primary keys.
**Acceptance Criteria:** All database tables use UUIDs for primary keys.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G173: Graceful Degradation (P1)
*(Duplicate of G086, handled in AI Ops)*

### G175: Business Continuity Plan (P1)
**Source Proof:** Gap Audit G175 | **Current Behavior:** High bus factor. | **Target Behavior:** Documented access procedures if key personnel are unavailable.
**Product Decision:** Store emergency credentials in a shared 1Password vault accessible by the PO and lead investor/board.
**UX/Admin/Support Impact:** Corporate survival.
**Implementation Contract:** Non-technical process.
**Acceptance Criteria:** PO confirms the emergency vault is populated and tested.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

### G176: Incident Management (P0)
*(Duplicate of G040, handled in Security)*

## CATEGORY 20: PRODUCT-LED GROWTH & ANALYTICS

### G177: Product Analytics Pipeline (P1)
**Source Proof:** Gap Audit G177 | **Current Behavior:** None. | **Target Behavior:** Event tracking for key user actions (signup, first generation, export).
**Product Decision:** Integrate PostHog for product analytics.
**UX/Admin/Support Impact:** Data-driven product decisions.
**Implementation Contract:** PostHog SDK in frontend. Backend events sent via API.
**Acceptance Criteria:** A user exporting an email triggers an `email_exported` event in PostHog with properties `template_id` and `generation_count`.
**Telemetry/Risk:** Privacy compliance (G055).
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G178: Funnel Tracking (P1)
**Source Proof:** Gap Audit G178 | **Current Behavior:** Blind to drop-off. | **Target Behavior:** Dashboards tracking the conversion rate from visitor -> signup -> active user -> paid user.
**Product Decision:** Build funnels in PostHog based on the events from G177.
**UX/Admin/Support Impact:** Marketing optimization.
**Implementation Contract:** Define the standard event nomenclature (e.g., `account_created`, `workspace_created`, `subscription_started`).
**Acceptance Criteria:** PO can view a funnel showing the % of users who generate an image within 24 hours of signup.
**Telemetry/Risk:** None.
**Owner:** PO | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 21: CONTENT & ASSET MANAGEMENT

### G184: Asset Versioning (P1)
**Source Proof:** Gap Audit G184 | **Current Behavior:** Overwrites destroy history. | **Target Behavior:** Ability to undo/redo changes to an email template or view previous generations.
**Product Decision:** Store template states as immutable JSON blobs in an `asset_versions` table.
**UX/Admin/Support Impact:** Prevents user data loss from accidental edits.
**Implementation Contract:** Every "Save" action creates a new version record rather than an `UPDATE`.
**Acceptance Criteria:** A user can click "Version History" and restore a template to its state from 2 days ago.
**Telemetry/Risk:** High storage growth.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G186: Content Approval Workflows (P1)
**Source Proof:** Gap Audit G186 | **Current Behavior:** Anyone can export. | **Target Behavior:** Enterprise feature requiring "Editor" roles to submit campaigns to "Admin" roles for approval before sending.
**Product Decision:** Add a `status` field to campaigns (`draft`, `pending_approval`, `approved`).
**UX/Admin/Support Impact:** Crucial for large agency/enterprise teams.
**Implementation Contract:** RLS policies preventing export/send if status != `approved`.
**Acceptance Criteria:** An Editor clicking "Send" triggers an approval request instead of an actual send.
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G187: Brand Library Management (P1)
**Source Proof:** Gap Audit G187 | **Current Behavior:** Flat list of assets. | **Target Behavior:** Folders, tags, and search for uploaded brand assets.
**Product Decision:** Enhance the `brand_assets` table with `folder_id` and `tags` (array).
**UX/Admin/Support Impact:** Usability for accounts with hundreds of product photos.
**Implementation Contract:** UI for folder management. Backend search using Postgres full-text search on tags/names.
**Acceptance Criteria:** A user can search "summer dress" and see all assets tagged with those keywords.
**Telemetry/Risk:** None.
**Owner:** Frontend/Backend | **Phase:** 6.2 | **Disposition:** Active Build

## CATEGORY 22: SELF-HEALING & RESILIENCE

### G191: Circuit Breaker Pattern (P0)
*(Duplicate of G087, handled in AI Ops)*

### G192: Retry with Backoff (P0)
**Source Proof:** Gap Audit G192 | **Current Behavior:** Fails immediately on network blip. | **Target Behavior:** All external API calls (Stripe, AI, ESP) automatically retry transient errors.
**Product Decision:** Implement exponential backoff (e.g., 1s, 2s, 4s) for 5xx errors or 429s.
**UX/Admin/Support Impact:** Masks minor provider outages from the user.
**Implementation Contract:** Use an HTTP client wrapper (like `axios-retry` or custom `fetch` wrapper).
**Acceptance Criteria:** A 502 Bad Gateway from Stripe triggers a retry 1 second later, succeeding without throwing an error to the frontend.
**Telemetry/Risk:** Retrying non-idempotent requests (e.g., charging a card twice). Must ensure idempotency keys are used.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G193: Dead Letter Queues (P1)
**Source Proof:** Gap Audit G193 | **Current Behavior:** Failed async jobs disappear. | **Target Behavior:** Async tasks (emails, webhooks) that fail all retries are saved for manual inspection and replay.
**Product Decision:** Use Inngest's native DLQ / failure handling features.
**UX/Admin/Support Impact:** Zero lost data for async processes.
**Implementation Contract:** Configure `onFailure` handlers for critical Inngest functions.
**Acceptance Criteria:** An email sending job that fails 5 times is visible in the Inngest dashboard for manual replay.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G194: Health Check Endpoints (P0)
**Source Proof:** Gap Audit G194 | **Current Behavior:** None. | **Target Behavior:** Standard `/healthz` (liveness) and `/readyz` (readiness) endpoints.
**Product Decision:** `/healthz` returns 200 OK immediately. `/readyz` checks DB connectivity and Redis connectivity.
**UX/Admin/Support Impact:** Required for Render/Vercel zero-downtime deploys.
**Implementation Contract:** Hono routes.
**Acceptance Criteria:** Render will not route traffic to a new instance until `/readyz` returns 200 OK.
**Telemetry/Risk:** Heavy `/readyz` checks can cause cascading failures. Keep them fast.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

### G195: Graceful Shutdown (P1)
**Source Proof:** Gap Audit G195 | **Current Behavior:** Process killed instantly (SIGKILL). | **Target Behavior:** Server finishes processing active requests before shutting down (SIGTERM handling).
**Product Decision:** Listen for `SIGTERM` in the Node.js process, stop accepting new connections, and wait up to 10 seconds for active requests to finish.
**UX/Admin/Support Impact:** Zero dropped requests during deployments.
**Implementation Contract:** Node.js `process.on('SIGTERM', ...)` logic.
**Acceptance Criteria:** Triggering a deploy while a 5-second AI generation is running does not kill the generation; the server waits for it to finish before exiting.
**Telemetry/Risk:** None.
**Owner:** Backend | **Phase:** 6.2 | **Disposition:** Active Build

---

## P2 / P3 COMPACT COVERAGE CARDS

The following gaps are classified as P2 (Important but not Launch-Blocking) or P3 (Deferred). They are tracked here for architectural awareness but do not require full dossiers at this stage.

| Gap ID | Category | Item | Tier | Architectural Disposition |
|---|---|---|---|---|
| G007 | Deployment | Infrastructure-as-Code | P2 | Deferred to Phase 7. Current manual PaaS config is sufficient for beta. |
| G009 | Deployment | Seed data strategy | P2 | Active Build. Use a simple SQL script for now. |
| G015 | Observability | Anomaly detection | P2 | Deferred. Rely on basic Datadog alerts for now. |
| G016 | Observability | Slow query detection | P2 | Active Build. Enable Supabase pg_stat_statements. |
| G018 | Observability | Log retention | P2 | Active Build. Set to 30 days in logging provider. |
| G019 | Observability | Real User Monitoring | P2 | Deferred to Phase 7. |
| G020 | Observability | Synthetic monitoring | P2 | Deferred. Rely on basic uptime ping (G013). |
| G026 | Data Mgmt | Data import tools | P2 | Deferred. Handle enterprise migrations manually. |
| G028 | Data Mgmt | Soft-delete | P2 | Active Build. Add `deleted_at` to critical tables. |
| G029 | Data Mgmt | Archival strategy | P2 | Deferred to Phase 8. |
| G039 | Security | IP allowlisting | P2 | Deferred to Phase 7 Enterprise tier. |
| G045 | Identity | Custom roles | P2 | Deferred. Stick to the predefined roles in G044. |
| G064 | Legal | Data residency | P2 | Deferred. US-East-1 only for beta. |
| G073 | Email | Template versioning | P2 | Deferred to Phase 7. |
| G084 | AI Ops | Model A/B testing | P2 | Deferred. Use manual prompt tweaking for now. |
| G085 | AI Ops | Response caching | P2 | Active Build. Cache identical prompts for 24h. |
| G092 | Testing | Visual regression | P2 | Deferred. Rely on E2E tests. |
| G095 | Testing | Chaos engineering | P2 | Deferred indefinitely. |
| G103 | Scalability | CDN configuration | P2 | Active Build. Rely on Vercel defaults. |
| G106 | Scalability | Auto-scaling rules | P2 | Deferred. PaaS handles basic scaling. |
| G108 | Scalability | Asset storage scaling | P2 | Deferred. |
| G110 | i18n | RTL support | P2 | Deferred. |
| G111 | i18n | Multi-currency | P2 | Deferred. USD only. |
| G113 | i18n | Formatting | P2 | Active Build. Use browser locale defaults. |
| G114 | i18n | Unicode/emoji | P2 | Active Build. Enforce UTF-8 everywhere. |
| G120 | a11y | Reduced motion | P2 | Deferred. |
| G123 | Real-Time | Presence system | P2 | Deferred to Phase 7. |
| G126 | Real-Time | Push notifications | P2 | Deferred. |
| G130 | Integration | OAuth provider | P2 | Deferred to Phase 8. |
| G131 | Integration | Zapier/Make | P2 | Deferred to Phase 7. |
| G132 | Integration | Native integrations | P2 | Deferred to Phase 7. |
| G133 | Integration | Import/export | P2 | Deferred. |
| G135 | Integration | SDK/client library | P2 | Deferred. |
| G143 | Billing | Multi-workspace billing | P2 | Deferred. |
| G144 | Billing | Coupons | P2 | Deferred. |
| G145 | Billing | ASC 606 | P2 | Deferred. |
| G149 | Support | Health scoring | P2 | Deferred. |
| G150 | Support | Churn prediction | P2 | Deferred. |
| G151 | Support | NPS/CSAT | P2 | Deferred. |
| G153 | Support | Escalation | P2 | Active Build. Document manual process. |
| G162 | Admin | Bulk operations | P2 | Deferred. Admin does manually via DB. |
| G170 | DevExp | Contribution guidelines | P3 | Trace Entry. Not needed for internal team. |
| G174 | DR & BC | Data sovereignty | P2 | Deferred. |
| G179 | PLG | User segmentation | P2 | Deferred. |
| G180 | PLG | In-app messaging | P2 | Deferred. |
| G181 | PLG | Referral system | P3 | Trace Entry. |
| G182 | PLG | Trial conversion | P2 | Deferred. |
| G183 | PLG | Usage analytics | P3 | Trace Entry. |
| G185 | Content | Storage lifecycle | P2 | Deferred. |
| G188 | Content | Template marketplace | P2 | Deferred to Phase 8. |
| G189 | Content | Bulk asset operations | P2 | Deferred. |
| G190 | Content | DAM integration | P3 | Trace Entry. |
| G196 | Resilience | Connection pool recovery | P2 | Active Build. Rely on Supavisor. |
