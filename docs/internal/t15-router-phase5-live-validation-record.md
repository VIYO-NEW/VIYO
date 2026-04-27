# T15-ROUTER Phase 5 Live Validation Record

## Validation Scope

This record documents the Phase 5 live runtime validation for **T15-ROUTER**, which installs the TanStack Router foundation in `apps/web`. The validation scope covers the three route surfaces introduced or governed by the router foundation: the public home route `/`, the brand-scoped Studio boundary route `/brand/:brandId/studio`, and the catch-all not-found route. The objective was to confirm that the implemented route tree renders correctly in a browser runtime, preserves the Sentry-wrapped application entry path, exposes only intentionally wired surfaces, and remains compliant with the VIYO no-unwired-UI constraint.

Interactive browser validation was attempted first, but the browser connection was unavailable due to a receiving-end connection error. To avoid weakening the live-validation gate, validation was completed against the running Vite development server with installed **headless Chromium**. The runtime check captured DOM output and screenshots for each route.

## Runtime Environment

| Item | Evidence |
|---|---|
| Application | `apps/web` Vite development server |
| Base URL | `http://localhost:5173/` |
| Browser engine | `/usr/bin/chromium` in headless mode |
| DOM evidence | `/home/ubuntu/viyo_t15_validation/headless_chromium_validation.md` |
| Screenshot observations | `/home/ubuntu/viyo_t15_validation/screenshot_observations.md` |
| Screenshots | `/home/ubuntu/viyo_t15_validation/headless/home.png`, `/home/ubuntu/viyo_t15_validation/headless/studio.png`, `/home/ubuntu/viyo_t15_validation/headless/not_found.png` |

## Route Validation Matrix

| Route | Expected Runtime Behavior | Evidence Observed | Result |
|---|---|---|---|
| `/` | Render the existing VIYO public scaffold surface through the new TanStack Router home route. | DOM text included `VIYO — AI Email Marketing VIYO AI-Powered Email Marketing Platform Phase 0 Scaffold — app.viyo.new`. Screenshot showed the centered public scaffold surface with no CTA, navigation, mode picker, or tool control. | Passed |
| `/brand/demo-brand/studio` | Render a brand-scoped Studio route boundary, expose the `brandId` route parameter, and avoid loading unwired Studio modules. | DOM text included `Brand Studio Route Boundary`, `Studio routing is ready for brand-scoped wiring`, and `Brand route parameter demo-brand`. Screenshot showed only the reserved route-boundary card and explanatory compliance copy. | Passed |
| `/missing-route` | Render the not-found surface with a wired navigation path back to home. | DOM text included `404 Page not found` and `Return to VIYO Home`. Screenshot showed the intended 404 page and a single home link. | Passed |

## No-Unwired-UI Verification

The live route inspection confirms that **T15 does not expose unwired Sprint 2 product surfaces**. The home route remains the Phase 0 public scaffold, the Studio route is explicitly a route-boundary placeholder rather than a fake Studio implementation, and the not-found route exposes only a real internal navigation link back to `/`.

| Constraint | Phase 5 Finding | Result |
|---|---|---|
| No fake CTAs | No route displayed a fake generation, editing, onboarding, or workflow CTA. The 404 route includes only a real home navigation link. | Passed |
| No unwired Studio tools | The Studio route did not expose mode pickers, editing tools, prompt libraries, collaboration controls, or generation actions. | Passed |
| Brand route parameter available | The Studio boundary displayed `demo-brand`, confirming the `brandId` parameter is available for later Sprint 2 modules. | Passed |
| Runtime route coverage | Home, brand Studio boundary, and unknown route behavior all rendered through the browser runtime. | Passed |

## Browser Tooling Limitation and Mitigation

The interactive browser interface returned `Could not establish connection. Receiving end does not exist.` Because Phase 5 requires live validation rather than static inspection alone, the fallback method used the installed Chromium binary in headless browser mode against the running local server. This validated real browser rendering and captured screenshots for review. The Chromium stderr logs contain expected sandbox DBus/UPower messages from a headless Linux environment and do not indicate a VIYO application runtime failure.

## Phase 5 Decision

**Phase 5 is passed.** The TanStack Router foundation renders all required route surfaces in a live browser runtime, exposes the brand-scoped route parameter needed by downstream Sprint 2 tasks, and maintains no-unwired-UI compliance. T15-ROUTER is ready to proceed to **Phase 6 — Quality Control Gate**.
