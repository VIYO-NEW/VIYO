# Document 9: Frontend Architecture & Copy Framework

## Overview
This document defines the structural architecture for every frontend page, error state, empty state, and marketing asset in VIYO. It provides the layout, components, and copy direction (what the copy should achieve) so the engineering team can build the full UI framework immediately. 

**Implementation Rule:** The engineer must build the UI with placeholder text (e.g., `[Headline: Explains credit billing]`) based on these directions. The final copy pass will occur during Phase 6 (QA & Launch Readiness).

---

## Part 1: Core Marketing Pages Architecture

### 1.1 Landing Page (`/`)
- **Creative Concept Mode:**
  - Component: Add a "Pitch Me Concepts" button to the `/create` page.
  - Copy Direction: The button should be clearly visible and explain that users can get three creative concepts (Safe, Pattern Interrupt, Wildcard) before generating a campaign.
- **Hero Section:**
  - Component: Split layout (Text left, abstract UI graphic right).
  - Copy Direction: Headline must state the core value prop (automated email team). Subhead explains the Shopify/Klaviyo connection.
  - CTAs: Primary ("Start free"), Secondary ("See how it works").
- **The Problem Section:**
  - Component: 3-column card grid.
  - Copy Direction: Highlight the pain points of agencies (slow), designers (expensive), and DIY (exhausting).
- **How It Works Section:**
  - Component: Vertical stepper or alternating left/right layout.
  - Copy Direction: 5 steps (Brief, Learn, Generate, Review, Deploy).
- **Feature Highlights Section:**
  - Component: Bento box grid.
  - Copy Direction: Highlight the 7-Brain System, Brand Asset Vault, Multi-Model Image Generation, and One-Click Deploy.
- **Bottom CTA:**
  - Component: Full-width centered banner.
  - Copy Direction: Final push emphasizing the 5,000 free credits.

### 1.2 Pricing Page (`/pricing`)
- **Hero Section:**
  - Copy Direction: Emphasize "No subscriptions, buy credits when you need them."
- **Credit Explainer:**
  - Component: Inline info box.
  - Copy Direction: Explain that ~1,000 credits = 1 full campaign.
- **Pricing Tiers:**
  - Component: 4-column pricing table.
  - Tiers: Free Trial (5k credits), Starter (30k), Growth (100k), Pro (300k).
  - Copy Direction: Each tier needs a target audience description (e.g., "For testing flows").

### 1.3 About Page (`/about`)
- **Layout:** Narrow reading column (max-w-prose).
- **Copy Direction:** First-person founder story. Focus on the bottleneck of retention marketing and the mission to fire agencies.

---

## Part 2: Feature Pages Architecture (SEO & Deep Dives)

These pages serve as SEO entry points and deep-dives for consideration-stage buyers.

### 2.1 The 7-Brain System (`/features/ai-brains`)
- **Layout:** Hero + 7-section scroll (one for each brain).
- **Copy Direction:** Explain the Multi-Agent DAG. Define CMO, Offer, Copywriter, Image Design, Email Design, Critic, and VeriClaw.

### 2.2 Brand Asset Vault (`/features/brand-asset-vault`)
- **Layout:** Hero + 3-column feature grid.
- **Copy Direction:** Explain Shopify Sync, Voice Extraction, and Visual Guidelines learning.

### 2.3 Multi-Model Image Pipeline (`/features/image-generation`)
- **Layout:** Hero + Before/After image sliders.
- **Copy Direction:** Focus on the new 3-model system: Gemini 3.1 Flash for photography, Ideogram 3.0 for text/UI mockups, and Imagen 4 for upscaling. Mention the Visual Intent Router that automatically selects the best model. Also, highlight the new Self-Hosted Timer Service countdown timer integration.

---

### 2.4 Video/IG Ingestion (`/admin/video-sources`)
- **Layout:** Admin table view with columns for Source, Status, and Last Ingested.
- **Copy Direction:** Explain that this page allows admins to manage and monitor video ingestion from various sources.

---

## Part 3: Lead Magnets & Gated Content Architecture

These pages capture emails at the top of the funnel.

### 3.1 Email Marketing Benchmark Report (`/resources/ecommerce-email-benchmarks`)
- **Component:** Split layout (Cover image left, Form right).
- **Form Fields:** Work Email, Brand URL.
- **Action:** Submit triggers Resend email with PDF link.
- **Copy Direction:** Emphasize data from 10,000+ campaigns.

### 3.2 The Abandoned Cart Playbook (`/resources/abandoned-cart-playbook`)
- **Component:** Split layout.
- **Form Fields:** Work Email.
- **Action:** Submit triggers Resend email.
- **Copy Direction:** Promise a 4-email sequence used by 9-figure brands.

### 3.3 Free Subject Line Analyzer (`/tools/subject-line-analyzer`)
- **Component:** Interactive tool layout. Large input box -> Loading state -> Gated results.
- **UX Flow:** 
  1. User enters subject line.
  2. Loading animation (checking spam, length, open rate).
  3. Gate: "Enter email to see score and 3 AI alternatives."
  4. Results: Score (0-100), checks, and 3 Copywriter Brain variations.

---

## Part 4: FAQ Architecture (The Knowledge Base)

- **Component:** Accordion/Disclosure list (`/faq`) and `<InlineFaq />` popovers in the app.
- **Topics to Cover (Copy Direction for Pre-Launch):**
  - How VIYO learns brand voice.
  - Editing emails before sending.
  - Product photo syncing vs. uploading.
  - Hallucination prevention (VeriClaw).
  - Credit billing model.
  - Team invites and RBAC.

---

## Part 5: Error Message Architecture

Never use generic "Something went wrong" messages. Build the error handling logic to map to these specific categories. The exact copy will be finalized pre-launch.

### 5.1 Integration Errors
- **Klaviyo Token Expired:** Must include a "Reconnect Klaviyo" button.
- **Shopify Sync Failed:** Must suggest checking if the app was uninstalled.
- **Missing Permissions:** Must instruct user to update API key scopes.
- **Self-Hosted Timer Service/Ideogram API Key Error:** Must instruct user to add the new API keys.

### 5.2 Generation Errors
- **Product Not Found:** Must suggest searching by exact title or SKU.
- **Preflight Failure (Discount):** Must instruct user to create the code in Shopify.
- **NSFW Rejection:** Must explain safety filter triggers.

### 5.3 Billing Errors
- **Insufficient Credits:** Must show current balance and include a "Top Up Credits" button.
- **Payment Failed:** Must instruct user to update payment method.

---

## Part 5b: Authentication & Invite Pages Architecture

These pages form the critical gateway to the application. They must be fast, clear, and handle edge cases gracefully without losing the user's intent.

### 5b.1 Login Page (`/login`)
- **Layout:** Minimal centered card. No marketing nav or footer.
- **Fields:** Email, Password.
- **Secondary Actions:** "Continue with Magic Link" (sends email, no password required), "Forgot password?", "Create an account" link to `/signup`.
- **UX Flow:** If the user attempts to log in but their account doesn't exist, do not show a generic error; instead, show "Account not found. Would you like to create one?" with a button that transfers their email to the signup flow.
- **Copy Direction:** Keep it utilitarian. "Welcome back to VIYO."

### 5b.2 Signup Page (`/signup`)
- **Layout:** Minimal centered card matching `/login`.
- **Fields:** Email, Password (with strength indicator).
- **Secondary Actions:** "Continue with Magic Link", "Already have an account?" link to `/login`.
- **UX Flow:** If the user arrived from the landing page input box, their email must be pre-filled from `sessionStorage`. After successful account creation, route immediately to `/onboarding`.
- **Copy Direction:** "Start building your AI email team."

### 5b.3 Forgot Password (`/forgot-password` & `/reset-password`)
- **`/forgot-password`:** Email input field. Submit triggers a Resend email with a secure reset link. Show a success state ("Check your inbox") even if the email isn't registered, to prevent email enumeration attacks.
- **`/reset-password`:** Accessed via email link. Shows "New Password" and "Confirm Password" fields. Upon success, auto-login the user and route to `/dashboard`.

### 5b.4 Reusable Invite Link Handler (`/auth/invite/[token]`)
- **Layout:** No visible UI (redirect-only route).
- **UX Flow:** 
  1. Validates token in DB.
  2. If valid: calls backend to generate a fresh Supabase magic link, stores token in `sessionStorage`, and redirects to the magic link URL.
  3. If expired (past 72h): routes to an error page "This invite has expired. Please ask your team admin to send a new one."
  4. If revoked: routes to an error page "This invite has been revoked."
  5. If already accepted: routes to `/login` with a toast "You've already joined this workspace."
- **Rate Limiting:** If clicked >5 times in an hour, show "Too many attempts, please try again later."

### 5b.5 Invite Acceptance Page (`/invite/accept`)
- **Layout:** Centered card, slightly wider than login.
- **Display:** Shows the Brand Name, Brand Logo (if available), and the role assigned ("You've been invited to join [Brand] as an [Admin/Member]").
- **UX Flow:**
  - If the user already has a password set: show a single "Join Workspace" button.
  - If the user does *not* have a password set (first-time user via magic link): show inline "Create Password" and "Confirm Password" fields above the "Join Workspace" button.
- **Action:** On submit, creates the `brand_members` record, marks invite as accepted, and redirects to `/dashboard` with a success toast.

### 5b.6 OAuth Callback (`/auth/callback`)
- **State:** Loading spinner ("Securing your session...").
- **Logic:** Exchanges code for session, handles invite token passthrough, redirects to `/auth/mfa-setup` (if MFA not enabled), `/auth/mfa-challenge` (if MFA enabled), or `/app`.

### 5b.7 MFA Setup Gate (`/auth/mfa-setup`)
- **Layout:** Blocking full-screen modal. No navigation available.
- **Copy:** "To protect your brand's data, VIYO requires two-factor authentication for all accounts. Please select a method to secure your account."
- **Method Selection:**
  - **Authenticator App (TOTP):** Labeled "⭐⭐⭐ Recommended. Most secure option." Shows QR code + secret key.
  - **SMS Text Message:** Labeled "⭐⭐ Good. Standard messaging rates apply." Shows phone number input.
  - **Email Code:** Labeled "⭐ Acceptable. Less secure if email is compromised." Shows email confirmation button.
- **Completion State:** Displays 10 single-use Recovery Codes. "Save these codes in a secure place. They are the only way to access your account if you lose your device." User must click "I have saved my recovery codes" to proceed to `/app`.

### 5b.8 MFA Challenge (`/auth/mfa-challenge`)
- **Layout:** Centered card, minimal distraction.
- **Input:** 6-digit code input field (auto-focus, auto-submit on 6th digit).
- **Fallback Action:** "Use a recovery code" link below the input field.

---

## Part 6: Loading State Architecture

AI generation takes 30-90 seconds. Build a rotating message component that cycles through these states every 5-10 seconds to prevent abandonment.

**Campaign Generation Sequence (Draft Copy):**
1. "CMO Brain is analyzing your brief..."
2. "Reviewing past campaign performance..."
3. "Copywriter Brain is drafting subject lines..."
4.'Visual Intent Router is selecting the best model...'
192. 'Image Design Brain is generating assets...'"
5. "Email Design Brain is structuring the layout..."
6. "Critic Brain is reviewing the draft..."
7. "VeriClaw is running pre-flight checks..."
8. "Compiling final HTML..."

**Shopify Sync Sequence (Draft Copy):**
1. "Connecting to Shopify..."
2. "Syncing product catalog..."
3. "Downloading high-res imagery..."
4. "Analyzing product descriptions..."

---

## Part 7: Microcopy & Empty States Architecture

### 7.1 Empty States
Build a reusable `<EmptyState />` component with an illustration, headline, body text, and primary CTA.
- **Empty Campaigns List:** CTA must point to Campaign Builder.
- **Empty Flows List:** CTA must point to Flow Templates.
- **Empty Team List:** CTA must trigger Invite Modal.

### 7.2 Tooltips
Build a `<HelpTooltip />` component for complex UI elements.
- **Locations needing tooltips:** Top Brain Toggle, Strict Brand Voice toggle, Auto-Deploy toggle.

### 7.3 Success Toasts
Build a toast notification system for positive feedback.
- **Events needing toasts:** Campaign generated (must show credits used), Pushed to Klaviyo, Team Invite Sent, Settings Saved.

---

## Part 8: App Pages Architecture (Authenticated)

### 8.1 Dashboard (`/app`)

#### Deliverability Warm-Up Status (Conditional)
- **Visibility:** Only visible when `brands.warmup_state` is `cold`, `warming`, or `damaged`. Hidden when `warmed`.
- **Location:** Top right of the dashboard, above the fold.
- **Data Points:**
  - Current state badge (e.g., 🟡 Warming Up, 🔴 Reputation Damaged)
  - Progress bar: "Week X of 4"
  - Today's sending limit: "Daily Cap: 500 emails"
  - Health metrics: Bounce Rate (%), Complaint Rate (%)
- **Actions:** "View Schedule" (opens slide-out with full 4-week ramp plan).

#### Damaged Reputation Recovery Modal
- **Trigger:** When a brand enters the `damaged` state, this blocking modal appears on the dashboard for Owners/Admins.
- **Content:** 
  - Alert: "Your sender reputation is damaged due to high spam complaints or bounces."
  - Metrics: Shows the exact metric that tripped the threshold (e.g., "Complaint rate: 0.4% (Threshold: 0.1%)").
  - Action Plan: Explains the mandatory recovery protocol (fallback to 'cold' schedule, 14-day probation, flows only).
- **Action:** User must type "I UNDERSTAND" to dismiss the modal and acknowledge the restricted sending state.
- **Layout:** Standard app shell (top nav desktop, bottom nav mobile).
- **Hero Section:** "Welcome back, [Name]." Quick stat summary (Credits remaining, Campaigns generated).
- **Main Action:** Large "Create New Campaign" primary button.
- **Recent Activity:** Table of last 5 campaigns with status (Draft, Pushed, Failed).

### 8.2 Campaign Builder (`/app/campaigns/new`)
- **Layout:** Split pane. Left side: Brief input form. Right side: Live preview (initially empty state).
- **Form Fields:** Campaign Name, Goal (dropdown), Target Audience (text), Product/Offer (searchable dropdown from Shopify sync), Additional Instructions (textarea).
- **Advanced Toggles:** Top Brain (on/off), Strict Brand Voice (on/off).

### 8.3 Settings (`/app/settings`)
- **Layout:** Left sidebar navigation (Profile, Brand, Integrations, Team, Billing, Security, Audit Log, System Emails, Notifications).
- **Profile:** Name, Email, Password reset.
- **Brand:** Brand Name, Logo upload, Brand Voice override text.
- **Integrations:** Shopify (Connect/Disconnect), Klaviyo (Connect/Disconnect), and any connected ESP/CRM.
- **Team:** RBAC table (as defined in Doc 1 §20Y). Invite management, role assignment, permission matrix.
- **Billing:** Credit ledger, Stripe top-up button, Invoice history.
- **Security** (`/app/settings/security`): Owner and Admin only. Contains:
  - **Active Sessions:** Table of all active sessions (device, browser, IP, GeoIP location, last active). Each row has a "Revoke" button. "Revoke All Other Sessions" button at top.
  - **Login History:** Last 50 login events (timestamp, IP, location, device, success/failure). Read-only with "Export CSV" button.
  - **Two-Factor Authentication:** Displays currently active MFA method (App, SMS, Email). "Change Method" button opens the method selection modal. "Regenerate Recovery Codes" button invalidates old codes and generates 10 new ones. (Note: MFA cannot be disabled, only changed).
  - **Password:** Last changed date. "Change Password" button opens modal requiring current password + new password + confirmation. New password checked against HaveIBeenPwned API.
  - **Connected Devices:** List of devices that have accessed this account. "Remove" button per device.
- **Audit Log** (`/app/settings/audit-log`): Owner only (Admin can view but not export). Full-width table with:
  - **Columns:** Timestamp, Actor (name + email), Action (human-readable label), Resource (type + name), Severity (color-coded badge: green/yellow/orange/red), IP Address, Details (expandable row).
  - **Filters Bar:** Date range picker, actor dropdown, action type multi-select, severity multi-select, free-text search. Filters are AND-combined. "Clear All" button.
  - **Export:** "Export CSV" button (top-right). Exports all records matching current filter. Export events are themselves logged.
  - **Pagination:** 50 rows per page, cursor-based for performance.
- **System Emails** (`/app/settings/system-emails`): Owner only. Directory of all transactional email templates (invite, reminder, welcome, password reset, billing alerts). Each template has: preview, edit (MJML visual editor with variable injection), send test, and version history. See Doc 1 §20Y System Email Manager.
- **Notifications** (`/app/settings/notifications`): All roles. Granular notification preferences: email/in-app toggles per notification type (campaign deployed, team member joined, billing alert, security alert, weekly digest).

---

## Part 9: Onboarding Flow Architecture

### 9.1 Step 1: Brand Setup (`/onboarding/brand`)
- **Fields:** Brand Name, Website URL.
- **Action:** Firecrawl initiates background scrape of URL to begin voice extraction.

### 9.2 Step 2: Integrations (`/onboarding/connect`)
- **Action:** Shopify OAuth button. Klaviyo OAuth button.
- **Validation:** Both must be connected to proceed.

### 9.3 Step 3: Brand Voice Confirmation (`/onboarding/voice`)
- **Display:** Shows the extracted brand voice summary (from Firecrawl + Claude).
- **Action:** User can edit the text or click "Looks good."

### 9.4 Step 4: First Campaign (`/onboarding/first-campaign`)
- **Action:** Drops user directly into the Campaign Builder with a pre-filled "Welcome" brief to guarantee immediate time-to-value.

---

## Part 10: Admin Portal Architecture (`/admin`)

- **Layout:** Distinct dark-mode shell to differentiate from user app. Separate authentication gateway with IP allowlisting.
- **Dashboard:** Global metrics (Total users, MRR, Total campaigns generated, API error rate).
- **Brands List:** Table of all tenants. Click to view details, impersonate user (requires brand owner consent, time-bound, audit-logged), or adjust credit balance manually.
- **Self-Healing Log:** Table of `healing_log` entries (as defined in Doc 1 §20K).
- **Self-Learning Log:** Table of `winning_formulas` entries (as defined in Doc 1 §20J).
- **Doctrine Admin** (`/admin/doctrine`): VIYO internal team only. Manages the Email Bible upstream sync. Contains:
  - Last sync timestamp and status (Success/Failed)
  - Diff viewer showing changes between upstream Bible and current VIYO rules
  - Override panel for proprietary VIYO extensions
- **Security Dashboard** (`/admin/security`): VIYO internal team only. Cross-brand security monitoring. Contains:
  - **Failed Login Heatmap:** Failed login attempts by hour/day over last 30 days (heatmap grid).
  - **Active Threats:** Currently rate-limited IPs, locked accounts, ongoing brute force attempts (real-time table with severity badges).
  - **Vulnerability Status:** Open security board items by severity (stacked bar chart).
  - **Backup Status:** Last successful backup time for each backup tier (status cards: green/yellow/red).
  - **Certificate Expiry:** SSL/TLS certificate expiry dates (timeline with warning thresholds at 30/14/7 days).
  - **Dependency Health:** Count of outdated/vulnerable dependencies (donut chart).
  - **Cross-Brand Audit Log:** Searchable audit log across all brands for investigating security incidents. Same table format as brand-level audit log but with brand name column added.

---

## Part 11: Utility & Error Pages

### 11.1 404 Not Found (`/404`)
- **Component:** Centered empty state.
- **Copy Direction:** Lighthearted apology. Primary CTA back to Dashboard.

### 11.2 500 Server Error (`/500`)
- **Component:** Centered error state.
- **Copy Direction:** Acknowledge system fault. Provide `support@viyo.email` link.

### 11.3 Changelog (`/changelog`)
- **Layout:** Timeline feed.
- **Content:** Date, Version tag, Title, Markdown body.

### 11.4 Blog / Resource Hub (`/blog`)
- **Layout:** Featured article hero + 3-column grid of recent posts.
- **Categories:** Case Studies, Playbooks, Product Updates.


---

