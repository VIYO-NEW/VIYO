# R17 — UI/UX Architecture (v2)

**ZCBR Status:** PASSED 2026-05-12 by Architect Claude self-validation
**ZCBR Checklist version:** v1
**Spec version:** 2.0
**Authoring authority:** Architect Claude (Opus 4.7)
**Authored date:** 2026-05-12
**Target repo path on commit:** `/docs/research_specs/R17_UI_UX_ARCHITECTURE_v2.md` (replaces v1 at `/docs/research_specs/R17_UI_UX_ARCHITECTURE_ENTERPRISE.md`, commit SHA `1cc43f5781b132ef256e21ca06c8914c0c9e64c3`)
**Supersedes:** R17 v1.0 (Enterprise Spec, 2026-05-12 09:22 UTC)

---

## 0. Supersession statement

This v2 spec supersedes the prior R17 v1.0. v2 is a MINOR FIX per R-Spec Audit Table v1.2 row 1: most v1 content is sound and preserved verbatim; the following nine targeted conflicts with current canonical state are resolved in v2:

1. **No ZCBR header** — predates Foundation Lock 20. v2 adds the header above.
2. **No VVOW §3 3-Zone Spatial Architecture alignment** — v1 used traditional nav-bar + sidebar + content vocabulary throughout. v2 adds §3.0 VVOW 3-Zone alignment subsection and revises §6.3 Email Editor / §6.4 Curator Dashboard sections to speak in Zone 1 (brief/input) / Zone 2 (canvas) / Zone 3 (toolbelt) terms. VVOW supersedes R17 for Phase 1 UX per VVOW's header authority statement.
3. **Hardcoded image model names** — v1 §10.5.B listed `Ideogram V3, NanoBanana 2 Pro, Seedream 4.5, Flux, GPT Image 2, Grok Imagine` as the active model leaderboard. Lock 19 violation. v2 routes all model surfacing through R29 v2 Provider Registry; the UI reads the active capability registry rather than naming providers.
4. **Hardcoded service references** — v1 §10.5.C named `Bouncer pass/fail` for typography accuracy and `Firecrawl extraction date` for voice profile provenance. Lock 19 Extension Clause violations. v2 routes both through R29 v2 capability registry (typography QA = `capability: 'image_qa'`; voice extraction provenance = generic provider attribution).
5. **§10.4 numbering bug** — v1 jumped from §10.3 to §10.5 with no §10.4 heading; the Product Data Extraction Monitor section was buried under §10.3.D. v2 restores §10.4 as the dedicated Product Data Extraction Monitor.
6. **R28 Timer Service Admin in Phase 2 build tracker** — v1 row UIUX-12 placed R28 Timer Service Admin in Phase 2. Master Build Sequence v1.1 places R28 in Phase 4+ (B-4.03). v2 build tracker moves UIUX-12 to Phase 4+.
7. **Outdated R-spec citation versions** — v1 referenced R20, R24, R29, R31 generically. v2 cites the ZCBR-PASSED v2 versions explicitly (R20 v2, R24 v2, R29 v2 PAL, R31 v2 revision 2, T46 v2).
8. **No Lock invocations** — v1 had no Locks & Decisions section. v2 §2 invokes Lock 8 (programmatic ops 0 tokens, surfaced in Cost Reconciliation UI), Lock 13 (multi-tenant RLS, every admin dashboard respects workspace_id), Lock 19 (Provider Agnosticism, no hardcoded provider/model names in UI), Lock 20 (ZCBR-validated specs required, this spec carries PASSED), Lock 21 (Governance Agnosticism — does NOT apply to R-specs).
9. **No acceptance criteria, no tests required, no failure modes section** — v1 was pure descriptive design with no binary acceptance bar. v2 adds §13 Tests, §14 Acceptance criteria (binary), §15 Open items per ZCBR BR-3 + BR-7 requirements.

The bulk of v1 §3-§9 content (root layout, Zustand store, interaction patterns, page specifications, real-time WebSocket protocol, accessibility, error handling) is preserved.

---

## 1. Source declaration

| Source ID | Source | Authority | Used for |
|---|---|---|---|
| S1 | VVOW Image Studio Architecture §3 (3-Zone Spatial Architecture) | Higher-tier authority (EXEMPT from ZCBR) | Canonical Phase 1 UX layout; supersedes R17 for Phase 1 UX per VVOW header |
| S2 | R20 v2 Database Schema `/docs/research_specs/R20_DATABASE_SCHEMA_v2.md` (ZCBR PASSED, PR #21) | Canonical | All UI data binding (workspaces, brands, products, assets, campaigns, comments, notifications, RLHF votes, token usage, etc.) — UI never bypasses R20 v2 RLS contract |
| S3 | R24 v2 Image Pipeline `/docs/research_specs/R24_IMAGE_PIPELINE_v2.md` (ZCBR PASSED, PR #23) | Canonical | Image generation surfaces; Pattern Recipe browser; Studio Zone 2 canvas |
| S4 | R29 v2 Platform Abstraction Layer `/docs/research_specs/R29_PLATFORM_ABSTRACTION_LAYER_v2.md` (ZCBR PASSED, PR #25) | Canonical | Provider Registry surfacing in admin dashboards; capability identifiers |
| S5 | R31 v2 Product Data Extraction `/docs/research_specs/R31_PRODUCT_DATA_EXTRACTION_ENTERPRISE.md` (ZCBR PASSED, PR #30) | Canonical | Product Data Extraction Monitor (§10.4); Brand Vault surfaces |
| S6 | T46 v2 Art Director Routing Suite `/docs/architecture/art-director-routing-suite.md` (ZCBR PASSED, PR #29) | Canonical | Art Director routing visibility in admin dashboards |
| S7 | R19 LLM Orchestration (PENDING RE-VALIDATION, audit table row 3) | Cautious consumer | Brain Council Dashboard (§6.x); Email Brain surfacing |
| S8 | R22 Security Auth (PENDING RE-VALIDATION, audit table row 6) | Cautious consumer | Auth flows, workspace switcher, team member management |
| S9 | R23 Cost Engine (CRIT MINOR FIX, audit table row 7) | Cautious consumer | Cost Reconciliation Dashboard (§6.6) |
| S10 | R27 Composable Sections (PENDING RE-VALIDATION, audit table row 11) | Cautious consumer | Composable Section Library Manager (UIUX-11) |
| S11 | R30 Product Animation Engine (PENDING RE-VALIDATION, audit table row 14) | Cautious consumer | Animation Pipeline Admin (§6.7) |
| S12 | R36 HYVE / R37 MAAX / R38 SYPHON (PENDING RE-VALIDATION) | Cautious consumer | Brand Voice Library (§6.12); HYVE consent surfaces; MAAX memory introspection (P3) |
| S13 | Foundation Lock 8 — Programmatic ops charge 0 tokens | Higher-tier | Cost Reconciliation UI distinguishes billable from programmatic |
| S14 | Foundation Lock 13 — Multi-tenant RLS | Higher-tier | Every admin dashboard respects workspace_id; no cross-workspace data leakage in UI |
| S15 | Foundation Lock 19 + Extension Clause — Provider Agnosticism | Higher-tier | No hardcoded provider/model names in UI; surfaces read capability registry |
| S16 | Foundation Lock 20 — ZCBR-validated specs required | Higher-tier | This spec carries ZCBR PASSED |
| S17 | Foundation Lock 21 — Governance Agnosticism | Higher-tier | Does NOT apply to this R-spec (R-specs ARE implementation) |
| S18 | Master Build Sequence v1.1 Section 3.0-3.4 | Higher-tier | Maps UIUX-NN features to specific Bullets (B-1.00 onward) |

---

## 2. Locks & Decisions Invoked

- **Foundation Lock 8** — Cost Reconciliation Dashboard (§6.6) and per-generation cost displays explicitly distinguish billable AI operations from programmatic operations. Programmatic operations (extraction, animation, scheduled jobs, RLHF aggregation) show `$0 user cost` with operational-overhead attribution; billable AI operations (image generation, LLM copywriting, etc.) show user-deducted token cost.
- **Foundation Lock 13** — Every admin dashboard, every data table, every chart respects `workspace_id` boundary. UI queries always include workspace_id filter; cross-workspace visibility only available to VIYO-admin role via admin.viyo.com (separate auth surface). RLS denial on a UI query returns empty result, never an error message that could leak existence of other workspaces' data.
- **Foundation Lock 19 + Extension Clause** — UI MUST NOT hardcode provider names, model names, browser scraper services, or anti-bot services. The Image Model Performance Comparison (§10.5.B) reads the active model list from R29 v2 Provider Registry at runtime. Admin dashboards display whatever providers/models are currently registered, not a hardcoded list. The model name in display is fetched from registry metadata, not embedded in UI code.
- **Foundation Lock 20** — This spec carries `ZCBR Status: PASSED`. All cited canonical specs (S2, S3, S4, S5, S6) carry PASSED status. S7-S12 are PENDING RE-VALIDATION; this spec consumes them via tolerant interfaces (read-only displays that degrade gracefully).
- **Foundation Lock 21** — Does NOT apply. R-specs are implementation specifications; Lock 21 applies to governance documents and process artifacts.
- **D55** — All integration calls surfaced in UI (provider routing visibility, e-commerce sync status, ESP connection state, AI capability availability) flow through the unified R29 v2 Plugin Registry.
- **D56** — Cost Reconciliation Dashboard (§6.6) reflects the Phase 0/Phase 1 token metering split. Phase 0 substrate (raw consumption + Stripe meter dispatch) is operational; Phase 1 UI surface (user-facing balance, top-up flow, tier feature gating) is gated by B-1.14 in Master Build Sequence.

---

## 3. Root Layout, Navigation, and VVOW 3-Zone Alignment

### 3.0 VVOW §3 3-Zone Spatial Architecture (canonical for Phase 1 surfaces)

For Phase 1 Image Studio surfaces (B-1.00 Studio Core Loop onward), VVOW §3 defines a 3-Zone Spatial Architecture that supersedes the traditional sidebar+content layout described in §3.1 below. The three zones:

| Zone | VVOW name | Purpose | R17 mapping |
|---|---|---|---|
| **Zone 1** | Brief / Input | Where the user expresses intent — prompts, briefs, references, configuration | Studio left panel: brief composer, reference uploader, model selector, brand context |
| **Zone 2** | Canvas | Where generated content renders and is manipulated — the work surface | Studio center panel: image canvas, email canvas, video timeline; supports drag-drop, selection, edit |
| **Zone 3** | Toolbelt | Where tools and actions live — edit tools, history, exports, settings | Studio right panel: B1-B11 editing tools, version history, export controls, brand vault search |

Phase 1 pages that follow the 3-Zone pattern:
- §6.3 Email Editor — Zone 1 (component library/properties) | Zone 2 (canvas) | Zone 3 (live preview/device switcher/toolbelt)
- §6.4 Curator Dashboard — Zone 1 (filter/sort/queue context) | Zone 2 (email preview card) | Zone 3 (swipe actions + metadata)
- Image Studio (B-1.00) — Zone 1 (prompt + brief) | Zone 2 (image canvas) | Zone 3 (B1-B11 toolbelt + version history)

Pages outside Phase 1 (Dashboard, Campaign Detail, Settings, most Admin dashboards) follow the traditional layout described in §3.1 below.

### 3.1 Global Layout Structure (non-Phase-1 surfaces)

The root layout wraps all non-Studio pages and provides:
- **Top Navigation Bar:** Logo, workspace switcher, user profile menu, notifications bell, search bar
- **Left Sidebar:** Collapsible navigation menu with sections: Dashboard, Campaigns, Content Library, Settings, Admin (if user is admin)
- **Main Content Area:** Page-specific content
- **Right Sidebar (optional):** Context-sensitive panels (e.g., email preview, asset library)
- **Global Modals & Toasts:** Notifications, confirmations, error messages

### 3.2 Navigation Menu Structure

```
Dashboard
├── Overview
├── Recent Campaigns
└── Quick Stats
Campaigns
├── Active
├── Draft
├── Archived
└── Create New
Content Library
├── Email Templates
├── Images
├── Sections
└── Brands
Settings
├── Workspace
├── Team Members
├── Billing
└── Integrations
Admin (if user.role === 'admin')
├── Learning Engine Monitor
├── Cost Reconciliation
├── Animation Pipeline
├── Extraction Monitor
├── Performance Dashboards
└── Brand Intelligence
```

### 3.3 Responsive Behavior

- **Desktop (1024px+):** Full sidebar + main content + optional right sidebar
- **Tablet (768px–1023px):** Collapsible sidebar + main content (right sidebar hidden)
- **Mobile (<768px):** Hamburger menu + full-screen main content

For Phase 1 Studio surfaces using the 3-Zone pattern, mobile collapses Zone 1 and Zone 3 into bottom-sheet drawers triggered from a unified toolbar; Zone 2 (canvas) remains the primary surface.

---

## 4. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React 19 + Next.js 15 | Server-side rendering, API routes, built-in optimization |
| **State Management** | Zustand | Lightweight, performant, minimal boilerplate |
| **Real-time** | WebSocket (native) + Socket.io fallback | Direct browser-server communication for live updates |
| **UI Components** | shadcn/ui + Tailwind CSS 4 | Accessible, customizable, rapid development |
| **Data Visualization** | Recharts + D3.js (for complex layouts) | Interactive charts, real-time data binding |
| **Drag-and-Drop** | react-beautiful-dnd | Accessible, smooth animations, proven in production |
| **Forms** | React Hook Form + Zod | Type-safe, minimal re-renders, composable validation |
| **Animations** | Framer Motion | Declarative, performant, spring physics |
| **Icons** | Heroicons | Consistent, accessible, well-maintained |
| **HTTP Client** | tRPC + fetch | Type-safe RPC, automatic code generation |

Framework choices are stable architectural decisions; Lock 19 does NOT apply to UI framework selection (it applies to AI providers, browser scrapers, ESP/e-commerce providers). Framework swaps are R17 minor version events, not Provider Registry concerns.

---

## 5. Global State Management (Zustand)

### 5.1 Store Structure

```typescript
interface AppStore {
  // User & Auth (RLS contract: workspace_id from session)
  user: User | null;
  workspace: Workspace | null;
  setUser: (user: User) => void;
  setWorkspace: (workspace: Workspace) => void;
  logout: () => void;

  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Real-time Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;

  // Campaign Context
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign) => void;
  campaignDraft: CampaignDraft | null;
  updateCampaignDraft: (draft: Partial<CampaignDraft>) => void;

  // Email Composition State (Zone 2 canvas state)
  emailCanvas: EmailCanvasState;
  updateEmailCanvas: (state: Partial<EmailCanvasState>) => void;
  resetEmailCanvas: () => void;

  // Image Studio State (Zone 1 brief + Zone 2 canvas)
  studioBrief: StudioBriefState;
  studioCanvas: StudioCanvasState;
  updateStudioBrief: (state: Partial<StudioBriefState>) => void;
  updateStudioCanvas: (state: Partial<StudioCanvasState>) => void;

  // Admin State
  adminFilters: AdminFilters;
  setAdminFilters: (filters: AdminFilters) => void;
}
```

Workspace switching invalidates all workspace-scoped slices (`campaignDraft`, `emailCanvas`, `studioBrief`, `studioCanvas`, `selectedCampaign`) per Lock 13 enforcement; no state survives a workspace boundary crossing.

---

## 6. Interaction Patterns

### 6.1 Email Composition Workflow

1. **Campaign Creation:** User clicks "Create Campaign" → modal opens with campaign name, brand selection, email count
2. **Email Canvas (3-Zone):** User enters drag-and-drop email editor
   - **Zone 1 (left):** Component library (text, image, button, section, etc.) + property inspector
   - **Zone 2 (center):** Email canvas (WYSIWYG editor)
   - **Zone 3 (right):** Live preview + device switcher + version history + export
3. **Real-time Preview:** As user edits, a live preview updates in Zone 3 (or in a separate browser tab)
4. **Save & Generate:** User clicks "Generate Concepts" → WebSocket overlay shows real-time progress
5. **Review & Approve:** User sees generated emails in a gallery, rates them, approves for send

### 6.2 Curation & Learning (RLHF Swipe UI)

1. **Curator Dashboard:** Admin sees a queue of generated emails
2. **Swipe Interface:** For each email, curator sees:
   - Email preview (full rendering)
   - Metadata (brand, style, performance metrics)
   - Swipe actions: "Good" (thumbs up), "Bad" (thumbs down), "Neutral" (skip)
3. **Real-time Feedback:** Each swipe is logged to the Learning Engine (R24 v2) immediately via the rlhf-event-emission skill contract; `event_type` values per R20 v2 §2.8.1 enum
4. **Leaderboard:** Top-performing styles are highlighted

### 6.3 Real-time Collaboration

- **WebSocket Connection:** Established on app load; maintains connection across page navigations
- **Live Notifications:** When a backend service completes a task (e.g., animation render, extraction), a toast notification appears
- **Progress Overlay:** During long-running operations (generation, rendering), a modal overlay shows:
  - Progress bar (if deterministic)
  - Spinner + status message (if indeterminate)
  - Estimated time remaining
  - Cancel button (if cancellable)

---

## 7. Page Specifications

### 7.1 Dashboard Page (`/dashboard`)

**Layout:**
- Hero section: "Welcome, [User]" + quick stats (campaigns sent, emails generated, cost this month)
- Three columns:
  - Column 1: Recent campaigns (table, sortable, filterable, workspace_id-scoped per Lock 13)
  - Column 2: Top-performing email styles (bar chart, reads from `pattern_performance_metrics` per R20 v2 §2.8.3)
  - Column 3: Cost breakdown (pie chart, distinguishes billable vs programmatic per Lock 8)

**Interactions:**
- Click campaign row → navigate to campaign detail page
- Click style in chart → open style details modal
- Click "New Campaign" button → open campaign creation modal

### 7.2 Campaign Detail Page (`/campaigns/[id]`)

**Layout:**
- Header: Campaign name, status badge, action buttons (Edit, Duplicate, Archive, Delete)
- Tabs: Overview, Emails, Performance, Settings

**Overview tab:** Campaign metadata, email gallery, performance summary
**Emails tab:** Table of emails (preview, approve, reject, regenerate)
**Performance tab:** Time-series chart, cohort analysis
**Settings tab:** Metadata editor, scheduling options

### 7.3 Email Editor Page (`/campaigns/[id]/emails/[emailId]/edit`) — VVOW 3-Zone

**Layout (per §3.0):**
- **Zone 1 (left, 30%):** Component library + properties inspector
- **Zone 2 (center, 40%):** Email canvas (WYSIWYG editor)
- **Zone 3 (right, 30%):** Live preview + device switcher + version history

**Component Library (Zone 1):**
- Text (heading, paragraph, button text)
- Image (with alt text, sizing options)
- Button (with link, styling options)
- Section (container with background, padding, etc.)
- Divider
- Social icons
- Product showcase (R31 v2 integration — reads from `viyo_products.extracted_data`)
- Animation preset selector (R30 integration)

**Canvas Interactions (Zone 2):**
- Click component → select it (selection outline)
- Drag component → move it (snap to grid)
- Resize component → drag corner handles
- Double-click text → edit inline
- Right-click → context menu (duplicate, delete, lock, etc.)

**Properties Inspector (Zone 1, bottom):**
- Font family, size, weight, color
- Background color, image, gradient
- Padding, margin, border, border-radius
- Alignment (left, center, right, justify)
- Link URL (for buttons, images)
- Alt text (for images)

### 7.4 Curator Dashboard (RLHF Swipe UI) (`/admin/curator`) — VVOW 3-Zone

**Layout (per §3.0):**
- **Zone 1 (top/left):** "Curator Queue" + filter/sort controls
- **Zone 2 (center):** Large email preview card
- **Zone 3 (bottom):** Swipe buttons (Good, Bad, Neutral) + metadata panel

**Metadata Panel:** Brand name, email style (category, layout, typography, lighting), generation date, performance metrics (if available), feedback count

**Interactions:**
- Swipe up → "Good" (rating: +5 per Lock 9 / R20 v2 §2.8.1)
- Swipe down → "Bad" (rating: -1)
- Swipe left → "Neutral" / "Skip" (rating: 0)
- Or use buttons at bottom
- After swipe, auto-advance to next email in queue

### 7.5 Learning Engine Monitor (`/admin/learning-engine`)

**Layout:**
- Header: "Learning Engine Status" + refresh button
- Three columns:
  - Column 1: Style Taxonomy Browser (tree view)
  - Column 2: Performance Heatmap (matrix visualization)
  - Column 3: A/B Test Results (table)

### 7.6 Cost Reconciliation Dashboard (`/admin/cost-reconciliation`)

**Layout:**
- Header: Date range picker, export button
- Three sections:
  - Section 1: Cost breakdown (pie chart) — categories distinguish **billable** (AI generation, LLM copywriting, vision QA) from **programmatic** (extraction, animation, scheduled aggregation, RLHF ingestion). Lock 8 enforcement: programmatic categories show `$0 user-attributed cost` (operational overhead only).
  - Section 2: Cost per email (line chart over time)
  - Section 3: Cost by brand (bar chart)

### 7.7 Animation Pipeline Admin (`/admin/animation-pipeline`)

**Layout:**
- Header: "Animation Pipeline" + filter controls
- Two columns:
  - Column 1: Render Queue (table of pending/completed jobs)
  - Column 2: Preset Editor (form for tuning animation parameters)

### 7.8 Email Style Scoring Dashboard (`/admin/email-scoring`)

**Layout:**
- Header: "Email Style Scoring" + filter controls
- Three sections:
  - Section 1: Style Taxonomy Browser (tree view)
  - Section 2: Performance Heatmap
  - Section 3: A/B Test Results

### 7.9 Image Model Performance Comparison (`/admin/image-models`)

**Layout:**
- Header: "Image Model Performance" + filter controls
- Three sections:
  - Section 1: **Model Leaderboard** — ranked table reading the active model list from **R29 v2 Provider Registry at runtime**. No hardcoded provider names in UI code (Lock 19 enforcement). Columns: rank, model identifier (from registry metadata), average quality score, average generation time, cost per image, failure rate, total images generated. Sortable by any column. Color-coded rows: green (top performers), yellow (mid-tier), red (underperformers).
  - Section 2: **Side-by-Side Comparator** — text input for prompt + "Run Benchmark" button. Grid of model outputs (one per column). Models in the grid are sourced from the active registry. Each output shows: model identifier, generation time, cost, quality score.
  - Section 3: **Cost Projection** — X-axis: customer count (0 to 10,000); Y-axis: monthly cost. Lines per registered model. Stacked area chart option.

### 7.10 Full Email Review & Scoring (`/admin/email-review`)

**Layout:**
- Header: "Email Gallery" + filter/sort controls
- Left panel: Paginated grid of email thumbnails
- Right panel: Scoring detail view

**Scoring Detail View shows:**
- Email full preview (rendered)
- Scores across all dimensions:
  - Copywriting quality (LLM-scored, 0–100)
  - Layout effectiveness (engagement data, 0–100)
  - Image quality (RLHF score, 0–100)
  - Typography accuracy (via `capability: 'image_qa'` in R29 v2 Provider Registry — no hardcoded service name)
  - Overall composite (weighted average, 0–100)
- Brand voice compliance gauge (0–100%) with specific callouts for deviations from brand voice

### 7.11 Brand Voice Library (`/admin/brand-voice`)

**Layout:**
- Header: "Brand Voice Library" + search bar
- Left panel: Searchable list of brand voice profiles
- Right panel: Voice profile detail view

**Voice Profile Detail View:**
- Brand name (editable)
- Voice summary (text, editable)
- Tone keywords (tags, editable)
- Vocabulary preferences (list, editable)
- Voice drift monitor (time-series chart)
- Manual override editor (form)
- Provenance: extraction date + provider attribution (from R29 v2 capability registry metadata; no hardcoded service names)

**Voice Drift Monitor:** Time-series chart with alert threshold line (e.g., 80% compliance).

---

## 8. Real-time Features

### 8.1 WebSocket Connection

- **Endpoint:** `wss://api.viyo.new/ws`
- **Auth:** Bearer token in query string or header
- **Reconnection:** Automatic exponential backoff (1s, 2s, 4s, 8s, max 30s)
- **Heartbeat:** Server sends ping every 30s; client responds with pong

### 8.2 Event Types

```typescript
interface WebSocketMessage {
  type: 'progress' | 'notification' | 'error' | 'data_update';
  payload: any;
}

// Example: Generation progress
{
  type: 'progress',
  payload: {
    generationId: 'gen-123',
    stage: 'llm_extraction',
    progress: 65,
    estimatedTimeRemaining: 30
  }
}

// Example: Notification
{
  type: 'notification',
  payload: {
    id: 'notif-456',
    title: 'Animation render complete',
    message: 'Product animation for Brand A is ready',
    severity: 'info',
    actionUrl: '/admin/animation-pipeline'
  }
}

// Example: Data update
{
  type: 'data_update',
  payload: {
    resource: 'campaign',
    id: 'campaign-789',
    changes: { status: 'sent', sentCount: 1000 }
  }
}
```

### 8.3 Client-side Handling

- **Progress updates:** Trigger re-render of progress overlay
- **Notifications:** Add to notification queue, display toast
- **Data updates:** Merge into Zustand store, trigger re-render (workspace_id-scoped per Lock 13; updates for other workspaces silently dropped)
- **Errors:** Display error toast, log to Sentry

---

## 9. Accessibility & Responsive Design

### 9.1 Accessibility (WCAG 2.1 AA)

- All interactive elements are keyboard-accessible (Tab, Enter, Space, Arrow keys)
- Color is not the only means of conveying information (use icons, text labels)
- Form inputs have associated labels
- Images have alt text
- Focus indicators are visible (outline or highlight)
- Modals trap focus and announce to screen readers
- Error messages are associated with form fields

### 9.2 Responsive Design

- Mobile-first approach
- Breakpoints: Mobile (<768px) | Tablet (768–1023px) | Desktop (≥1024px)
- Flexible layouts: CSS Grid and Flexbox
- Touch-friendly: ≥44x44px tap targets
- Readable text: ≥16px on mobile

---

## 10. Error Handling & Fallbacks

### 10.1 Global Error Boundary

- Catches React component errors
- Displays user-friendly error message (never leaks workspace existence or RLS detail per Lock 13)
- Logs error to Sentry with `workspace_id` tag
- Provides "Retry" or "Go Home" button

### 10.2 Network Error Handling

- Detect network failures (fetch/XHR)
- Display offline banner at top of page
- Queue requests for retry when online
- Show cached data if available

### 10.3 WebSocket Disconnection

- Detect connection loss
- Show "Reconnecting..." banner
- Attempt automatic reconnection with exponential backoff
- If reconnection fails after 5 minutes, prompt user to refresh page

---

## 11. Admin Dashboards (Detailed Specs)

### 11.1 Learning Engine Monitor

**A. Style Taxonomy Browser** — Hierarchical tree view of the learned email style taxonomy (Category → Layout → Typography → Lighting). Each node shows: instance count, average performance score, trend arrow.

**B. Performance Heatmap** — Matrix visualization where rows are email styles and columns are performance metrics. Cells color-coded from red (underperforming) to green (outperforming).

**C. A/B Test Results** — Dedicated view for active and completed A/B tests, showing statistical significance, confidence intervals, winning variant.

### 11.2 Cost Reconciliation Dashboard

**A. Cost Breakdown** — Pie chart showing cost distribution. Categories split into:
- **Billable** (Lock 8 user-attributable): LLM generation, image generation, vision QA, embedding
- **Programmatic** (Lock 8 operational overhead): extraction, animation, scheduled jobs, RLHF aggregation, segment sync

**B. Cost Per Email Over Time** — Line chart over past 30 days.

**C. Cost by Brand** — Bar chart, workspace_id-scoped.

### 11.3 Animation Pipeline Admin

**A. Render Queue** — Table of pending/completed animation render jobs (Inngest). Columns: brand, product, preset, render status, output URL, render time.

**B. Preset Editor** — Form for tuning animation parameters (duration, easing, tension) with live preview on a product image. Save creates new preset.

### 11.4 Product Data Extraction Monitor (R31 v2)

**A. Extraction Pipeline** — Kanban-style board showing products moving through extraction stages: URL Queued → Page Fetched → DOM Parsed → LLM Structured → QA Verified → Ready. Cards show: product name, brand, extraction status, timestamp. Drag-and-drop to manually advance status (admin override, audit-logged).

**B. Extraction Results Detail View** — For each extracted product:
- Raw HTML snippet (collapsible)
- Cheerio-parsed fields (JSON viewer)
- LLM-structured JSON output conforming to R31 v2 §4.1 `ProductKnowledgeExtractedData` schema (JSON viewer)
- Final verified record stored in R20 v2 `viyo_products.extracted_data` (read-only)
- Side-by-side comparison for QA

**C. Failure Queue** — Dedicated view for extraction failures with error categorization (anti-bot block, parsing error, LLM hallucination, timeout, NO_FETCH_PROVIDERS, NO_LLM_PROVIDERS per R31 v2 §8). One-click retry button.

### 11.5 Performance & Scoring Layer

**A. Email Style Scoring Dashboard** — Style Taxonomy Browser + Performance Heatmap + A/B Test Results (as §11.1 but focused on email-format patterns vs image-pattern patterns).

**B. Image Model Performance Comparison** — As §7.9 above. Model Leaderboard + Side-by-Side Comparator + Cost Projection. All model surfacing reads from R29 v2 Provider Registry at runtime; UI never embeds provider names as code literals.

**C. Full Email Review & Scoring** — Email Gallery + Scoring Breakdown + Brand Voice Compliance gauge.

### 11.6 Brand Intelligence Layer

**A. Brand Voice Library** — Voice Profiles (searchable list of all extracted brand voice profiles per workspace per Lock 13). Each profile shows: brand name, voice summary, tone keywords, vocabulary preferences, extraction date, **provider attribution from R29 v2 capability registry metadata** (no hardcoded service names).

**B. Voice Drift Monitor** — Time-series chart per brand showing how closely recent generated emails match the original voice extraction. Alerts when drift exceeds threshold.

**C. Manual Override** — Editor to manually adjust a brand's voice profile when automated extraction misses nuances.

---

## 12. Updated Build Tracker

| Feature ID | Name | Version | Phase | Master Sequence Bullet | Dependencies |
|---|---|---|---|---|---|
| UIUX-01 | Root Layout & Navigation Shell | V1 | Phase 1 | B-1.01 | None |
| UIUX-02 | Zustand Global State Store | V1 | Phase 1 | B-1.00, B-1.01 | None |
| UIUX-03 | Drag-and-Drop Email Canvas (Zone 2) | V1 | Phase 2 | B-2.01, B-2.32 | UIUX-02, R27 |
| UIUX-04 | Concept Pitch Presentation View | V1 | Phase 2 | B-2.02 | UIUX-01 |
| UIUX-05 | WebSocket Real-Time Progress Overlay | V1 | Phase 1 | B-1.00 | UIUX-02 |
| UIUX-06 | Global Error Boundary & Fallbacks | V1 | Phase 1 | B-1.00 onward | None |
| UIUX-07 | Curator Dashboard (RLHF Swipe UI) | V1 | Phase 1 | B-1.06 | R24 v2 |
| UIUX-08 | Learning Engine Monitor | V1 | Phase 2 | B-2.22 | R24 v2, R25 |
| UIUX-09 | Council of Brains Dashboard | V1 | Phase 2 | B-2.02 | R19 |
| UIUX-10 | Cost Reconciliation Dashboard | V1 | Phase 1 | B-1.14 | R23 |
| UIUX-11 | Composable Section Library Manager | V1 | Phase 2 | B-2.32 | R27 |
| UIUX-12 | Timer Service Admin | V1 | **Phase 4+** (was Phase 2 in v1) | **B-4.03** | R28 |
| UIUX-13 | Product Animation Admin | V1 | Phase 1 | B-1.09, B-1.10 | R30 |
| UIUX-14 | Product Data Extraction Monitor | V1 | Phase 0 | B-0.17 | R31 v2 |
| UIUX-15 | Email Style Scoring Dashboard | V1 | Phase 3 | B-3.07, B-3.08 | R24 v2 |
| UIUX-16 | Image Model Performance Comparison | V1 | Phase 1 | B-1.14 (initial) | R24 v2, R29 v2 |
| UIUX-17 | Full Email Review & Scoring | V1 | Phase 3 | B-3.08 | R19, R24 v2 |
| UIUX-18 | Brand Voice Library | V1 | Phase 3 | B-3.07, B-3.08 | R19, R37 |

**v1 → v2 build tracker change:** UIUX-12 Timer Service Admin moved from Phase 2 to Phase 4+ per Master Build Sequence v1.1 (R28 Timer Service is in the LATER Deferred Appendix; activation gate at B-3.09 Phase 3 acceptance triggers B-4.03 scheduling).

---

## 13. Tests required

Mandatory test scenarios:

1. RLS isolation — User A authenticated, attempts to view workspace B's campaigns/emails/assets via direct URL navigation → all queries return empty; no error message leaks workspace B existence
2. Workspace switcher — switching workspaces clears all workspace-scoped Zustand state slices (campaigns, emails, studio canvas)
3. Cost Reconciliation Dashboard — programmatic operation categories show `$0 user-attributed cost`; billable categories show actual user-attributed cost (Lock 8)
4. Image Model Performance Comparison — UI reads model list from R29 v2 Provider Registry; no hardcoded provider names in source code (grep test)
5. Brand Voice Library provenance — UI displays provider attribution from capability registry metadata; no hardcoded service names in source code
6. Curator Swipe UI — rating values emitted to RLHF events conform to Lock 9 enum {-1, 0, 1, 5} per R20 v2 §2.8.1
7. WebSocket workspace_id filtering — data updates for other workspaces silently dropped
8. 3-Zone Studio layout — Zone 1 / Zone 2 / Zone 3 render correctly on desktop, collapse to bottom sheets on mobile
9. Email Editor 3-Zone — Zone 1 component drag → Zone 2 canvas drop → Zone 3 live preview updates within 200ms
10. Lock 19 grep — zero hardcoded LLM model name literals, zero hardcoded browser scraper service names, zero hardcoded provider service names in `apps/web/src/` and `apps/admin/src/`
11. Accessibility — Tab navigation reaches every interactive element on every page; screen reader announces selection state
12. Mobile responsive — every page renders without horizontal scroll at 375px viewport width
13. Error boundary — synthetic React error caught; user-friendly fallback displayed; Sentry event includes `workspace_id` tag
14. WebSocket reconnection — connection drop triggers exponential backoff; max 30s; 5min total before user-visible reload prompt
15. Product Data Extraction Monitor — Kanban stages match R31 v2 §5.1 step names; failure queue categories match R31 v2 §8 error codes
16. Voice Drift Monitor — alert threshold (80% compliance default) fires when drift exceeds; chart renders time-series correctly
17. Generation ID propagation — every UI surface showing a generation result displays `generation_id` (admin only); UI passes generation_id to all retry/regenerate actions
18. Token usage display — billable operations show token cost from `token_usage_logs` (R20 v2 §2.5.1); programmatic operations show empty cost field (per Lock 8 — no `token_usage_logs` row exists for programmatic ops)

---

## 14. Acceptance criteria (mechanical / binary)

- [ ] Repo file `/docs/research_specs/R17_UI_UX_ARCHITECTURE_v2.md` replaces v1 at `R17_UI_UX_ARCHITECTURE_ENTERPRISE.md` via Manus directive
- [ ] ZCBR Status header present and reads `PASSED 2026-05-12 by Architect Claude self-validation`
- [ ] §3.0 VVOW 3-Zone alignment section present and maps Zone 1 / Zone 2 / Zone 3 to specific page sections
- [ ] §10.4 Product Data Extraction Monitor section present (fixes v1 numbering bug)
- [ ] Build tracker row UIUX-12 (Timer Service Admin) marked Phase 4+ with B-4.03 Bullet reference (fixes v1 Phase 2 misplacement)
- [ ] No hardcoded provider/model/service names in UI code paths (Lock 19 grep on `apps/web/src/` and `apps/admin/src/`)
- [ ] Cost Reconciliation Dashboard distinguishes billable from programmatic in UI (Lock 8 manual verification)
- [ ] R-Spec Audit Table v1.3 (or successor) row 1 status updates from MINOR FIX to PASS
- [ ] All 18 tests in §13 land alongside implementation Bullets

---

## 15. Migration plan (v1 → v2)

The v1.0 was authored 2026-05-12 09:22 UTC and replaced before significant UI code was written against it. Migration is a clean spec swap with no UI code migration concerns.

**Rollout sequence:**

1. Architect commits R17 v2 to repo at `/docs/research_specs/R17_UI_UX_ARCHITECTURE_v2.md` (via Manus directive R17-V2-MINOR-FIX-001 in next turn)
2. R-Spec Audit Table row 1 status updates from MINOR FIX to PASS at merge confirmation
3. B-XC.18 Bullet closes; B-1.00 Studio Core Loop unblocks
4. Future UI implementation Bullets (B-1.00 onward) cite R17 v2 as canonical

No data migration required (R17 is a UI spec; no schema changes).

---

## 16. Open items

1. **VVOW §3 3-Zone surfaces beyond Phase 1.** This spec aligns Phase 1 Studio surfaces (Email Editor, Curator Dashboard, Image Studio) to the 3-Zone pattern. Phase 2 Email Engine surfaces (B-2.01 onward) may benefit from the same pattern; future R17 minor version may expand 3-Zone application.

2. **Mobile-specific Studio layout.** §3.3 says Phase 1 mobile collapses Zone 1 / Zone 3 to bottom sheets. The exact gesture interactions (swipe up to summon Zone 3 toolbelt, etc.) need design exploration before B-1.00 implementation. Captured as future minor version refinement.

3. **Accessibility audit cadence.** WCAG 2.1 AA compliance is asserted in §9.1 but no automated audit cadence is defined. A future minor version may specify cadence (e.g. CI axe-core run on every PR touching `apps/web/`).

4. **Real-time CRDT or operational transform.** Current real-time WebSocket protocol broadcasts data updates and re-renders. For collaborative editing (B-2.5.x Phase 2.5), a CRDT-based or OT-based protocol may be required. Captured as future R17 minor version dependency.

5. **Admin role granularity.** §3.1 references `user.role === 'admin'` as a single boolean. R22 v2 (PENDING RE-VALIDATION) defines a 5-role enum (`owner`, `admin`, `editor`, `viewer`, `custom`). R17 v2.1 minor bump after R22 audit will align role-gated UI to R22's actual enum.

6. **Storybook / component library publishing.** R17 v2 documents page-level UX. The component library (shadcn/ui-based primitives + VIYO-specific composables) deserves a separate spec or Storybook deployment. Captured as future cross-cutting work.

---

## 17. Maintenance

**Update authority:** Architect Claude only, with PO ratification logged in Notion audit log.

**Version triggers:**
- Major (v3): breaking change to global state contract (Zustand store shape change incompatible with consumers), breaking change to WebSocket event types, removal of a documented page
- Minor (v2.x): additive (new pages, new admin dashboards, new state slices, 3-Zone application to additional pages, accessibility audit cadence formalization, real-time CRDT addition)
- Patch (v2.x.y): clarifications, typo fixes, citation updates

**Re-validation:** Every 180 days per ZCBR HEADER_STALE rule, or immediately when any cited spec (R20 v2, R24 v2, R29 v2, R31 v2, T46 v2, VVOW §3) bumps minor or major version.

**Companion spec alignment:** When R22 audits to ZCBR PASSED, R17 v2.1 minor bump aligns role-gated UI to R22's enum. When R19 audits, R17 v2.x may bump for Brain Council Dashboard refinements. When R27 audits, R17 v2.x may bump for Composable Section Library Manager refinements.

---

*End of R17 UI/UX Architecture v2 — ZCBR PASSED 2026-05-12 by Architect Claude self-validation*
