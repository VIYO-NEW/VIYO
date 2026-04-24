# R17 — UI/UX Architecture Enterprise Specification

## 1. Executive Summary

This document provides an exhaustive, enterprise-grade specification for the UI/UX architecture of the VIYO platform. It details the component hierarchy, state management strategy, accessibility standards, and specific user flows for the core application. The goal is to provide a seamless, real-time, and highly responsive experience for $100M SaaS boutique brands, hiding the complexity of the underlying Council of Brains and LLM generation pipelines behind a clean, intuitive interface.

## 2. Core Principles

The VIYO UI is designed around three core principles:
1. **Focus on the Creative:** The interface should recede, allowing the generated email designs to take center stage.
2. **Progressive Disclosure:** Complex settings (like the Visual Intent Router configuration or Brain prompts) are hidden by default but easily accessible to power users via advanced toggles.
3. **Real-Time Feedback:** Every action, from prompt submission to image generation, provides immediate visual feedback via WebSockets and optimistic UI updates, ensuring the user never feels like the system is "hanging."

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router) for SSR and SEO-friendly routing.
- **Styling:** Tailwind CSS + Radix UI Primitives for accessible, unstyled foundational components.
- **State Management:** Zustand (global client state), React Query (server state and caching).
- **Animation:** Framer Motion for layout transitions and micro-interactions.
- **Icons:** Lucide React.
- **Form Handling:** React Hook Form + Zod for schema validation.

## 4. Component Hierarchy & Global Layout

### 4.1 Root Layout Structure

The application uses a persistent sidebar navigation with a dynamic top bar that changes context based on the current active view (e.g., Campaign Editor vs. Settings).

```tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0 border-r border-slate-200 bg-white" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar className="h-16 border-b border-slate-200 bg-white flex-shrink-0" />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 4.2 The Email Canvas (Workspace)

The core workspace where emails are assembled. It consists of a central visual representation of the email and a right-hand properties panel for modifying the currently selected section.

```tsx
import { useCampaignStore } from '@/store/campaignStore';
import { SectionRenderer } from '@/components/email/SectionRenderer';
import { SettingsPanel } from '@/components/email/SettingsPanel';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function EmailCanvas() {
  const { sections, activeSectionId, reorderSections, setActiveSection } = useCampaignStore();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderSections(result.source.index, result.destination.index);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left: The visual email representation */}
      <div className="flex-1 bg-slate-100 rounded-xl overflow-y-auto p-8 flex justify-center border border-slate-200 shadow-inner">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="email-canvas">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="w-[600px] bg-white min-h-[800px] shadow-xl"
              >
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setActiveSection(section.id)}
                        className={`
                          relative group cursor-pointer transition-all
                          ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 z-50' : ''}
                          ${section.id === activeSectionId ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-slate-300'}
                        `}
                      >
                        <SectionRenderer section={section} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      {/* Right: Settings and AI controls */}
      <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
        <SettingsPanel activeSectionId={activeSectionId} />
      </div>
    </div>
  );
}
```

## 5. State Management Architecture

Zustand is used for complex, highly interactive client-side state, such as the drag-and-drop ordering of composable sections and active selections. Server state (fetching campaigns, saving) is handled by React Query.

```typescript
import { create } from 'zustand';
import { ComposableSection } from '@/types/schema';

interface CampaignState {
  campaignId: string | null;
  sections: ComposableSection[];
  activeSectionId: string | null;
  isGenerating: boolean;
  
  setCampaignId: (id: string) => void;
  setSections: (sections: ComposableSection[]) => void;
  setActiveSection: (id: string | null) => void;
  setGenerating: (isGenerating: boolean) => void;
  
  updateSectionSlot: (sectionId: string, slotKey: string, value: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  deleteSection: (id: string) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaignId: null,
  sections: [],
  activeSectionId: null,
  isGenerating: false,
  
  setCampaignId: (id) => set({ campaignId: id }),
  setSections: (sections) => set({ sections }),
  setActiveSection: (id) => set({ activeSectionId: id }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  
  updateSectionSlot: (sectionId, slotKey, value) => set((state) => ({
    sections: state.sections.map(section => {
      if (section.id === sectionId) {
        const updatedSlots = section.slots.map(slot => 
          slot.key === slotKey ? { ...slot, value } : slot
        );
        return { ...section, slots: updatedSlots };
      }
      return section;
    })
  })),
  
  reorderSections: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.sections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { sections: result };
  }),

  deleteSection: (id) => set((state) => ({
    sections: state.sections.filter(s => s.id !== id),
    activeSectionId: state.activeSectionId === id ? null : state.activeSectionId
  }))
}));
```

## 6. Real-Time Feedback & WebSocket Integration

To provide immediate feedback during long-running LLM generation tasks (R19), the UI subscribes to a Supabase Realtime channel (or custom WebSocket) to receive streaming updates from the Council of Brains.

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCampaignStore } from '@/store/campaignStore';

export function GenerationProgressOverlay({ campaignId }: { campaignId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const { isGenerating, setGenerating, setSections } = useCampaignStore();

  useEffect(() => {
    if (!isGenerating) return;

    const channel = supabase.channel(`campaign_${campaignId}`)
      .on('broadcast', { event: 'generation_log' }, (payload) => {
        setLogs(prev => [...prev, payload.message]);
      })
      .on('broadcast', { event: 'generation_complete' }, (payload) => {
        setSections(payload.sections);
        setGenerating(false);
        setLogs([]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isGenerating, campaignId, setGenerating, setSections]);

  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="w-96 bg-white p-6 rounded-xl shadow-2xl border border-indigo-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-3" />
          Council of Brains is thinking...
        </h3>
        <div className="h-32 overflow-y-auto bg-slate-900 rounded p-3 text-xs font-mono text-green-400">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">> {log}</div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
}
```

## 7. Accessibility (a11y) Standards

VIYO is committed to WCAG 2.1 AA compliance.

### 7.1 Keyboard Navigation
- All interactive elements must be focusable (`tabindex="0"`).
- The focus ring must be highly visible (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`).
- Complex widgets (like the drag-and-drop canvas) must implement keyboard alternatives (e.g., using arrow keys to reorder sections).

### 7.2 Screen Readers
- Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<article>`).
- Provide descriptive `aria-label` or `aria-labelledby` attributes for icon-only buttons.
- Use `aria-live="polite"` for dynamic updates (e.g., "Image generation complete").

### 7.3 Color Contrast
- All text must meet the 4.5:1 contrast ratio against its background.
- UI states (error, success, warning) must not rely solely on color; they must include iconography or text labels.

## 8. The Creative Concept Mode UI

As defined in R26, the Concept Mode requires a specific UI flow. When the CMO Brain pitches concepts, the UI transitions to a presentation mode.

```tsx
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ConceptPitch {
  id: string;
  title: string;
  rationale: string;
  previewImageUrl: string;
}

export function ConceptPitchView({ pitches, onSelect }: { pitches: ConceptPitch[], onSelect: (id: string) => void }) {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Select a Creative Direction</h2>
        <p className="text-slate-500 mt-2">The CMO Brain has prepared 3 concepts based on your prompt.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pitches.map((pitch, index) => (
          <motion.div 
            key={pitch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
            onClick={() => onSelect(pitch.id)}
          >
            <div className="h-48 bg-slate-100 overflow-hidden relative">
              <img src={pitch.previewImageUrl} alt={pitch.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
                <CheckCircle2 className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 drop-shadow-md transform scale-50 group-hover:scale-100 transition-all" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{pitch.title}</h3>
              <p className="text-sm text-slate-600 flex-1">{pitch.rationale}</p>
              <button className="mt-6 w-full py-2 bg-slate-100 text-slate-700 font-medium rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                Select Concept
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

## 9. Error Handling & Edge Cases

- **Offline State:** If the user loses connection, a non-intrusive banner appears, and React Query pauses background refetches. Zustand state remains intact, allowing local edits until reconnection.
- **Generation Timeout:** If an image generation takes longer than 45 seconds, the UI offers to cancel the request or continue waiting in the background, showing a placeholder in the canvas.
- **Validation Errors:** When the Critic Brain rejects an email, the specific failing sections are highlighted in red with actionable feedback in the properties panel.

```tsx
export const GlobalErrorBoundary: React.ComponentClass<any, any> = class extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
    // In production, send to Sentry/Datadog
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">{this.state.error?.message || "An unexpected error occurred in the UI."}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
};
```

## 10. Global Wiring Map (R18) Dependencies

| Component | Dependency Direction | Description |
|-----------|----------------------|-------------|
| **R27 Composable Sections** | R17 -> R27 | R17 renders the visual representations of R27 sections in the Email Canvas. |
| **R19 LLM Architecture** | R17 <-> R19 | R17 triggers the Council of Brains via API and displays the streaming progress logs. |
| **R30 Animation Engine** | R17 -> R30 | R17 provides the UI toggle to enable/disable product animation presets. |

## 11. Build Tracker (UIUX-01 through UIUX-06)

| Feature ID | Name | Version | Phase | Dependencies |
|-----------|------|---------|-------|-------------|
| UIUX-01 | Root Layout & Navigation Shell | V1 | Phase 1 | None |
| UIUX-02 | Zustand Global State Store | V1 | Phase 1 | None |
| UIUX-03 | Drag-and-Drop Email Canvas | V1 | Phase 1 | UIUX-02, R27 |
| UIUX-04 | Concept Pitch Presentation View | V1 | Phase 2 | UIUX-01 |
| UIUX-05 | WebSocket Real-Time Progress Overlay | V1 | Phase 2 | UIUX-02 |
| UIUX-06 | Global Error Boundary & Fallbacks | V1 | Phase 2 | None |


## 9. Internal Curator Dashboard (RLHF)

The Curator Dashboard is an internal tool for the VIYO team to provide human aesthetic judgment (RLHF) during the learning phase, preventing model collapse and training the preference classifier.

### 9.1. The Swipe UI (Tinder for Prompts)
To maximize throughput, the curation interface uses a high-speed, keyboard-driven swipe interface.

- **Layout:** Full-screen focused view. Original ingested email image on the left, generated variant on the right.
- **Controls:**
  - `Arrow Right` (or swipe right): Approve (visually compelling, matches brand energy).
  - `Arrow Left` (or swipe left): Reject (generic, boring, or fails aesthetic standards).
  - `Spacebar`: Skip (unsure).
- **Speed Optimization:** Images are pre-loaded in the background. A curator can process 1 image every 2 seconds.

### 9.2. Preference Model Training Panel
A dedicated view to monitor the transition from Human Curation to Autonomous Curation.
- **Metrics Displayed:** Total human votes collected, current preference model accuracy, and remaining votes needed for the next fine-tuning run.
- **Action:** Manual trigger to initiate DSPy prompt compilation based on recent approvals.

```tsx
// Example Curator Dashboard Component Structure
export function CuratorDashboard() {
  const { currentPair, handleVote, prefetchNext } = useCuratorQueue();

  useKeyPress('ArrowRight', () => handleVote('approve'));
  useKeyPress('ArrowLeft', () => handleVote('reject'));

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/2 p-4 border-r">
        <h3>Original Ingested Image</h3>
        <img src={currentPair.originalUrl} className="object-contain h-full" />
      </div>
      <div className="w-1/2 p-4 relative">
        <h3>Generated Variant</h3>
        <img src={currentPair.generatedUrl} className="object-contain h-full" />
        
        {/* Overlay controls for mouse users */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button variant="destructive" onClick={() => handleVote('reject')}>Reject (←)</Button>
          <Button variant="default" onClick={() => handleVote('approve')}>Approve (→)</Button>
        </div>
      </div>
    </div>
  );
}
```


## 10. Global Internal Admin Architecture (VIYO HQ)

Beyond the customer-facing workspace, VIYO requires a comprehensive internal administrative interface ("VIYO HQ") to manage the platform's self-learning engine, global infrastructure, and LLM orchestration. This is restricted to users with the `superadmin` role (R22).

### 10.1. The Intelligence Layer (R24, R19, R25)

**A. Learning Engine Monitor (R24, R25)**
- **Ingestion Pipeline:** Real-time view of emails being scraped, images extracted, and JSON schemas generated. Includes a failure queue for parsing errors.
- **Pattern Database Browser:** A searchable UI over the pgvector `image_prompt_patterns` table. Allows admins to view proven patterns, their success rates, and associated DSPy optimizations.
- **Preference Model Control:** Displays the current accuracy of the VLM preference classifier. Includes a manual override to force a new training epoch based on recent RLHF data.

**B. Council of Brains Dashboard (R19)**
- **Live Decision Feed:** A streaming view of decisions made by the CMO, Copywriter, and Critic Brains. Shows confidence scores and fallback events (e.g., when GPT-4o fails over to Gemini 1.5 Pro).
- **Prompt Version Manager:** A code-editor interface (Monaco) to edit the system prompts for each Brain. Includes an A/B testing toggle to route a percentage of traffic to a new prompt version and monitor the Critic Brain's approval rate.

### 10.2. The Infrastructure Layer (R21, R22, R29)

**A. API & Integration Vault (R22, R29)**
- **Global Credentials:** A secure interface to manage system-wide API keys (OpenAI, Ideogram, Stripe, SendGrid). Keys are masked and injected directly into the environment, avoiding hardcoded secrets.
- **ESP Connector Status:** A health dashboard showing the sync status of all customer ESP connections (Klaviyo, Mailchimp). Highlights rate-limit warnings or authentication failures.

**B. System Health & Infrastructure (R21)**
- **Inngest Queue Monitor:** Visibility into background jobs (image generation, data scraping). Allows admins to retry failed jobs or pause queues during outages.
- **Edge Worker Status:** Latency and error rate metrics for the Cloudflare Workers running the Timer Service (R28) and Tracking pixels.

### 10.3. The Business Layer (R23)

**A. Cost Reconciliation Dashboard (R23)**
- **Token Economics:** Real-time visualization of LLM API costs vs. customer subscription revenue.
- **Margin Alerts:** Automated warnings if a specific customer's token usage exceeds their tier's profitability threshold, triggering a review of their generation loop efficiency.


### 10.4. The Content Operations Layer (R27, R28, R30, R31)

**A. Composable Section Library Manager (R27)**
- **Section Registry:** A grid view of all registered section types (32+ in V1). Each card shows: section name, thumbnail preview, slot count, and usage frequency across all generated emails.
- **Template Editor:** A split-pane MJML editor (Monaco left, live preview right) for modifying section templates. Changes are versioned and require approval before going live.
- **New Section Wizard:** A guided flow to register a new section type: define slots (text/image/CTA), set default VIYO-UTL styling, upload a reference screenshot, and assign to a category.

**B. Timer Service Admin (R28)**
- **Active Timers:** A real-time table of all active countdown timers across all brands. Columns: brand, campaign, timer type (fixed/evergreen), expiry time, current state (active/expired/self-healed), and the CF Worker edge location serving it.
- **Self-Healing Log:** A filterable log of all timer self-healing events (when a timer detects it has expired and automatically transitions to the fallback state). Includes the original expiry, the detection timestamp, and the fallback action taken.
- **Timer Preview:** An embedded iframe that renders a live timer with configurable parameters for testing before deployment.

**C. Product Animation Admin (R30)**
- **Preset Library:** A visual grid of all animation presets (float, spin, bounce, parallax, etc.). Each card shows a looping GIF preview of the animation applied to a sample product image.
- **Physics Tuner:** A live Canvas playground where admins can adjust physics parameters (gravity, friction, spring tension) and see the effect on a product image in real-time. Tuned parameters can be saved as new presets.
- **Render Queue:** A table of all pending and completed animation render jobs (Inngest). Shows: brand, product, preset, render status, output URL, and render time.

**D. Product Data Extraction Monitor (R31)**
- **Extraction Pipeline:** A Kanban-style board showing products moving through the extraction stages: URL Queued → Page Fetched → DOM Parsed → LLM Structured → QA Verified → Ready.
- **Extraction Results:** A detail view for each extracted product showing: raw HTML snippet, Cheerio-parsed fields, LLM-structured JSON output, and the final verified product record. Side-by-side comparison for QA.
- **Failure Queue:** A dedicated view for extraction failures with error categorization (404, parsing error, LLM hallucination, timeout) and one-click retry.

### 10.5. The Performance & Scoring Layer

**A. Email Style Scoring Dashboard**
- **Style Taxonomy Browser:** A hierarchical tree view of the learned email style taxonomy (Category → Layout → Typography → Lighting). Each node shows: instance count, average performance score, and trend arrow (improving/declining).
- **Performance Heatmap:** A matrix visualization where rows are email styles and columns are performance metrics (open rate, click rate, conversion rate, revenue per email). Cells are color-coded from red (underperforming) to green (outperforming).
- **A/B Test Results:** A dedicated view for active and completed A/B tests on email styles, showing statistical significance, confidence intervals, and the winning variant.

**B. Image Model Performance Comparison**
- **Model Leaderboard:** A ranked table of all active image models (Ideogram V3, NanoBanana 2 Pro, Seedream 4.5, Flux, GPT Image 2, Grok Imagine, etc.) sorted by composite score (quality * speed / cost). Columns: model name, average quality score (from RLHF), average generation time, cost per image, failure rate, and total images generated.
- **Side-by-Side Comparator:** An interface where admins select a prompt and see the output from every model rendered side-by-side. Includes a "Run Benchmark" button that generates the same prompt across all models and displays results.
- **Cost Projection:** A chart showing projected monthly image generation costs at various customer counts, broken down by model. Helps inform pricing decisions.

**C. Full Email Review & Scoring**
- **Email Gallery:** A paginated grid of all generated emails across all brands. Each card shows: email thumbnail, brand name, campaign type, generation date, composite score, and approval status.
- **Scoring Breakdown:** When an email is selected, a detail panel shows scores across all dimensions: copywriting quality (LLM-scored), layout effectiveness (engagement data), image quality (RLHF score), typography accuracy (Bouncer pass/fail), and overall composite.
- **Brand Voice Compliance:** A gauge showing how closely the generated email matches the brand's extracted voice profile, with specific callouts for deviations.

### 10.6. The Brand Intelligence Layer

**A. Brand Voice Library**
- **Voice Profiles:** A searchable list of all extracted brand voice profiles across all customers. Each profile shows: brand name, voice summary, tone keywords, vocabulary preferences, and the Firecrawl extraction date.
- **Voice Drift Monitor:** A time-series chart per brand showing how closely recent generated emails match the original voice extraction. Alerts when drift exceeds a threshold.
- **Manual Override:** An editor to manually adjust a brand's voice profile when the automated extraction misses nuances.

## 11. Updated Build Tracker

| Feature ID | Name | Version | Phase | Dependencies |
|-----------|------|---------|-------|-------------|
| UIUX-01 | Root Layout & Navigation Shell | V1 | Phase 1 | None |
| UIUX-02 | Zustand Global State Store | V1 | Phase 1 | None |
| UIUX-03 | Drag-and-Drop Email Canvas | V1 | Phase 1 | UIUX-02, R27 |
| UIUX-04 | Concept Pitch Presentation View | V1 | Phase 2 | UIUX-01 |
| UIUX-05 | WebSocket Real-Time Progress Overlay | V1 | Phase 2 | UIUX-02 |
| UIUX-06 | Global Error Boundary & Fallbacks | V1 | Phase 2 | None |
| UIUX-07 | Curator Dashboard (RLHF Swipe UI) | V1 | Phase 2 | R24 |
| UIUX-08 | Learning Engine Monitor | V1 | Phase 2 | R24, R25 |
| UIUX-09 | Council of Brains Dashboard | V1 | Phase 2 | R19 |
| UIUX-10 | Cost Reconciliation Dashboard | V1 | Phase 2 | R23 |
| UIUX-11 | Composable Section Library Manager | V1 | Phase 2 | R27 |
| UIUX-12 | Timer Service Admin | V1 | Phase 2 | R28 |
| UIUX-13 | Product Animation Admin | V1 | Phase 2 | R30 |
| UIUX-14 | Product Data Extraction Monitor | V1 | Phase 2 | R31 |
| UIUX-15 | Email Style Scoring Dashboard | V1 | Phase 3 | R24 |
| UIUX-16 | Image Model Performance Comparison | V1 | Phase 3 | R24 |
| UIUX-17 | Full Email Review & Scoring | V1 | Phase 3 | R19, R24 |
| UIUX-18 | Brand Voice Library | V1 | Phase 3 | R19 |
