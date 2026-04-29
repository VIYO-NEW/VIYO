#!/usr/bin/env python3
"""Manually add PO Combined Directive v2 Phase 6.2 tasks through task-master add-task.

The PO-approved proposed diff used logical IDs T47-T72, but the repository already has
T47-T60 allocated. This script adds the directive graph as new top-level tasks starting
at the next available Taskmaster ID while preserving the logical PO IDs in titles.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TASKS_PATH = ROOT / ".taskmaster" / "tasks" / "tasks.json"
LOG_PATH = ROOT / "docs" / "internal" / "phase6-repair" / "add_phase6_2_manual_tasks_output.txt"

TASKS = [
    {
        "logical": "T47",
        "title": "Architecture Broadcast Ingestion Handshake",
        "description": "Mandatory Architecture Broadcast handshake at the start of every VIYO task session.",
        "details": "Source: PO Combined Directive v2 Section 1 and Architecture Broadcast record recqGyk0oIekpYEe9. Query Architecture Broadcasts; if a pending broadcast exists, halt planned work, download attached Drive documents, ingest the directive and source documents, write the task-graph diff to Builder Diff Output, set broadcast Status to Diff Proposed, and stop for PO approval. No product-code implementation is allowed from this task alone.",
        "dependencies": [],
        "priority": "high",
    },
    {
        "logical": "T48",
        "title": "SEC-18 Branch Protection Gate",
        "description": "Enable the immediate Phase 0 branch-protection governance required before the next commit.",
        "details": "Source: PO Combined Directive v2 Section 3 and Architecture Lock Security Phase Gate Addendum. Main branch must require PR review, required status checks, and force-push prevention. Direct pushes to main must be blocked. Capture evidence from GitHub settings, CLI, or API output before any next commit.",
        "dependencies": ["T47"],
        "priority": "high",
    },
    {
        "logical": "T49",
        "title": "Phase 0 Secret-Exposure Controls",
        "description": "Install and verify immediate secret-exposure controls before the next commit.",
        "details": "Source: PO Combined Directive v2 Section 3 and Doc 11 Security Phase Triggers Addendum. Install TruffleHog or equivalent pre-commit secret scanning; enable GitHub secret scanning if available; audit .gitignore for .env, .env.local, .env.production, key files, and generated secret artifacts; run git log --all --full-history -- '*.env*' and save evidence. This is immediate Phase 0 scope and precedes product-code commits.",
        "dependencies": ["T48"],
        "priority": "high",
    },
    {
        "logical": "T50",
        "title": "SEC-02 Encryption Foundation Readiness",
        "description": "Confirm encryption design readiness before sensitive-token persistence is introduced.",
        "details": "Source: PO Combined Directive v2 Section 3. Confirm AES-256-GCM implementation path for OAuth tokens, API keys, webhook secrets, and other Restricted-class data. No plaintext secret persistence may be introduced by Phase 6. This is a readiness and architecture gate unless implementation is triggered by sensitive-token storage.",
        "dependencies": ["T49"],
        "priority": "high",
    },
    {
        "logical": "T51a",
        "title": "SEC-14 and SEC-15 Auth Hardening",
        "description": "Implement auth hardening when the first auth/database code trigger occurs.",
        "details": "PO Modification A replaces grouped T51 with T51a/T51b/T51c. This task covers SEC-14 and SEC-15: password complexity, bcrypt cost 10+, HaveIBeenPwned k-anonymity check, last-five password reuse prevention, and brute-force lockout controls when auth surface is built. Trigger: first auth/database code.",
        "dependencies": ["T50"],
        "priority": "high",
    },
    {
        "logical": "T51b",
        "title": "SEC-04 and SEC-05 Network Hardening",
        "description": "Split security-header and rate-limiting implementation according to their distinct triggers.",
        "details": "PO Modification A split task. Implement security headers with the first auth/database surface. Implement rate limiting at first public deployment using the directive's limits. Preserve trigger notes so headers are not delayed until deployment and rate limiting is not exposed prematurely without infrastructure.",
        "dependencies": ["T50"],
        "priority": "high",
    },
    {
        "logical": "T51c",
        "title": "SEC-07 and SEC-08 CI Hardening",
        "description": "Separate Phase 0 push-time scanning from pre-paying-customer SAST/SCA requirements.",
        "details": "PO Modification A split task. Phase 0 includes push-time secret scanning controls. SAST/SCA with CodeQL and Dependabot is required before first paying customer, with Critical/High findings blocking merge. This task must retain both trigger notes explicitly.",
        "dependencies": ["T49"],
        "priority": "high",
    },
    {
        "logical": "T51d",
        "title": "Explicit Taskmaster Re-Parse Evidence Gate",
        "description": "Record the required Taskmaster re-parse evidence before Phase 6.2 implementation foundations begin.",
        "details": "PO Modification B. Before T52-equivalent work, run task-master parse-prd on the PRD V5 Addendum and Architecture Lock v6.1 ingestion bundle, save command output, and reconcile local .taskmaster state with the approved Airtable graph. If provider failure occurs, record failure evidence and use a PO-approved deterministic diff. Current directive from PO says parse-prd is not blocking and manual add-task creation is acceptable after evidence has been captured.",
        "dependencies": ["T47"],
        "priority": "high",
    },
    {
        "logical": "T52",
        "title": "T46 Gap Repair — Provider Registry and Shared Contracts",
        "description": "Repair Visual Engine provider inventory and shared Art Director contracts for the expanded Phase 6.2 scope.",
        "details": "Source: Architecture Lock v6.1, T46 Gap Addendum, and PO Combined Directive v2. Cover 22+ generation models, 10 editing tools, provider tier metadata, mode contracts, editing-tool contracts, and Art Director Router schema parity. This task is the foundation for cache-first routing, billing, persistence, editing coverage, and UI mode matrices.",
        "dependencies": ["T51d"],
        "priority": "high",
    },
    {
        "logical": "T53",
        "title": "T46 Gap Repair — Cache-First Router and Pattern DB Integration",
        "description": "Ensure Studio generation routes through Pattern DB before model execution and exposes route metadata.",
        "details": "Image generation requests must query Pattern DB before model execution, surface cached pattern versus zero-shot path, preserve fallback routing, and include scoring metadata for user-facing visibility. This repairs the architectural gap that allowed a schema-bound wrapper to ship without Pattern DB route transparency.",
        "dependencies": ["T52"],
        "priority": "high",
    },
    {
        "logical": "T54",
        "title": "Billing and Token Economics Foundation",
        "description": "Provide token estimate, balance preflight, deduction, and insufficient-balance recovery for Studio generation and editing paths.",
        "details": "Every generation/edit path has token estimate display, pre-execution balance check, atomic deduction where backend surface exists, graceful insufficient_balance recovery, and cost reconciliation notes. This directly closes the PO rejection gap for token economics and billing UI.",
        "dependencies": ["T52"],
        "priority": "high",
    },
    {
        "logical": "T55",
        "title": "R2 Auto-Save and Brand Vault Asset Contract",
        "description": "Persist generated and edited Studio outputs to R2/assets with brand-safe metadata.",
        "details": "Generated and edited outputs auto-save to R2/assets with workspace and brand isolation, metadata tags, source mode, prompt/style reference, and email-editor availability. This task provides the persistence contract consumed by export, version history, and Brand Vault availability.",
        "dependencies": ["T52"],
        "priority": "high",
    },
    {
        "logical": "T56",
        "title": "Editing Router Coverage for 10 Tools",
        "description": "Wire the ten specified editing tools only where backend-supported capability exists.",
        "details": "Touch Edit, Text Edit, Layer Splitting, Background Swap, Object Removal, Canvas Expand, Upscale, Quick Edit, Style Transfer, and Material Swap are wired to backend-supported capabilities only. No unwired placeholder buttons may be exposed. Tool availability must reflect shared contracts and feature flags.",
        "dependencies": ["T52"],
        "priority": "high",
    },
    {
        "logical": "T57",
        "title": "Standalone Studio Route, Navigation, and Brand Scope",
        "description": "Build Image Studio as a standalone brand-scoped workspace rather than a thin API wrapper.",
        "details": "Build /brand/[brandId]/studio as a standalone brand-scoped workspace reachable from main navigation with tenant-safe route handling and no cross-brand data leakage. This is the route/navigation foundation for PRD V5 Addendum Section 26.",
        "dependencies": ["T52"],
        "priority": "high",
    },
    {
        "logical": "T58",
        "title": "Conversational Studio Shell and Slash Commands",
        "description": "Implement the required chat-based Image Studio interaction model with slash commands.",
        "details": "Provide chat-based interaction model, natural-language prompt entry, command parsing for slash commands such as /mockup and /poster, command history/session context, and mode-picker parity. This closes the PO rejection gap for conversational interface.",
        "dependencies": ["T57"],
        "priority": "high",
    },
    {
        "logical": "T59",
        "title": "Generation Mode Matrix with Explicit v6.1 Multi-Model Flows",
        "description": "Cover all A1-A22 generation modes and explicit v6.1 multi-model UI acceptance criteria.",
        "details": "PO Modification C. Cover all A1-A22 modes and explicitly implement UI requirements for A3 compositional poster, A4 brand mockup, A8 platform-specific social templates, A9 palette extraction, A13 style invention, A14 seasonal themes, A15 unified brand kit, and A16 before/after comparison. A3 collects prompt and optional product @mention and discloses RMBG, Flux, Ideogram, and compositing lifecycle. A4 collects base image, brand asset @mention, and target region and supports SAM mask, ControlNet warp, and Sharp compositing lifecycle. A8 requires target platform such as IG, FB, Pinterest, or YouTube and exposes correct aspect/platform sizing before generation. A9 accepts image URL/upload or prompt source and surfaces BLIP-2, node-vibrant hex extraction, and Claude naming output. A13 presents four MCoT prompt branches and four-image selection flow. A14 surfaces Pattern DB template lookup before Nano Banana Pro Edit. A15 groups logo, palette, and imagery output from Recraft, Claude palette, and Flux. A16 requires side-by-side before/after output handling.",
        "dependencies": ["T58", "T53", "T54"],
        "priority": "high",
    },
    {
        "logical": "T60",
        "title": "Aspect Ratio, Platform Sizing, and Output-Shape Controls",
        "description": "Require aspect ratio and platform sizing controls before generation submission where relevant.",
        "details": "UI requires aspect ratio/platform sizing before generation where relevant; A8 must expose IG, FB, Pinterest, YouTube or equivalent target sizes; export output shape is visible before model call. This closes the PO rejection gap for aspect-ratio selector and platform-specific sizing.",
        "dependencies": ["T59"],
        "priority": "high",
    },
    {
        "logical": "T61",
        "title": "Style and Prompt Library",
        "description": "Implement the required Image Studio style and prompt library capabilities.",
        "details": "Implement Pre-Built Templates, Industry Prompt Packs, User-Saved Styles, Brand Style Lock, and deferred Community Styles notation without exposing unfinished marketplace actions. This closes the PO rejection gap for style/prompt library.",
        "dependencies": ["T58"],
        "priority": "high",
    },
    {
        "logical": "T62",
        "title": "Error, Timeout, Scoring, and Feature-Flag Visibility",
        "description": "Expose user-visible Studio failure states, retry states, route metadata, and feature-flag state.",
        "details": "Show generation failure states, timeout states, retry affordances, cached-pattern versus zero-shot path, score/routing metadata, and feature-flag status for gated router capabilities. This closes the PO rejection gap for errors, scoring visibility, and feature flags.",
        "dependencies": ["T58", "T53"],
        "priority": "high",
    },
    {
        "logical": "T63",
        "title": "Multi-Format Export and Resolution Choices",
        "description": "Support Studio export formats and resolution choices required by PRD Section 26.",
        "details": "Support PNG, JPG, WebP, and PDF export with resolution choices, transparent PNG where supported, multi-size output handling, direct-to-email insertion, and Brand Kit save metadata. This closes the PO rejection gap for multi-format export.",
        "dependencies": ["T55", "T59"],
        "priority": "high",
    },
    {
        "logical": "T64",
        "title": "Version History and Multi-Image Project Organization",
        "description": "Provide active Phase 6.2 version history and multi-image organization while deferring full freeform canvas.",
        "details": "PO Modification D. Provide session-level version history and multi-image organization. This replaces the prior Freeform Canvas active task; full freeform infinite canvas is deferred to V1.1 and must not be treated as an active Phase 6.2 blocker.",
        "dependencies": ["T57", "T55"],
        "priority": "medium",
    },
    {
        "logical": "T65",
        "title": "Accessibility and No-Placeholder UI Compliance",
        "description": "Verify WCAG compliance and ensure the active UI does not expose unwired placeholder actions.",
        "details": "PO Modification D. WCAG 2.1 AA keyboard/focus/label/contrast checks pass; no visible mode, editing tool, export action, or library action is present unless wired to supported backend behavior or clearly deferred outside the active UI. Pin-on-canvas collaboration remains V1.1 deferred scope.",
        "dependencies": ["T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64"],
        "priority": "high",
    },
    {
        "logical": "T66",
        "title": "Unit and Integration Test Expansion",
        "description": "Expand tests for the Phase 6.2 corrected Studio scope and six PO rejection gaps.",
        "details": "Add tests for slash commands, aspect/platform selector, token estimate and insufficient balance, style library, error/scoring visibility, export selection, and mode-specific multi-step requirements. Include coverage for explicit v6.1 A3/A4/A8/A9/A13/A14/A15/A16 flows.",
        "dependencies": ["T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64", "T65"],
        "priority": "high",
    },
    {
        "logical": "T67",
        "title": "Static Wiring and Type Validation",
        "description": "Run static validation for the repaired contracts, components, route, and API wiring.",
        "details": "Run lint, type-check, schema validation, and import/wiring checks. Confirm route, component, API client, shared schema, router contract alignment, and no orphaned UI actions. Evidence must be saved before browser validation.",
        "dependencies": ["T52", "T53", "T54", "T55", "T56", "T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64", "T65", "T66"],
        "priority": "high",
    },
    {
        "logical": "T68",
        "title": "Browser Validation and Visual Evidence",
        "description": "Validate the corrected Studio workflow in-browser and capture visual evidence.",
        "details": "Launch the web app locally, exercise the Studio workflow in-browser, and capture evidence for the six PO rejection gaps and v6.1 multi-model UI gates. Evidence must include conversational shell, aspect/platform selector, billing preflight, style library, error/scoring visibility, and export controls.",
        "dependencies": ["T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64", "T65", "T66", "T67"],
        "priority": "high",
    },
    {
        "logical": "T69",
        "title": "Security Trigger Verification Matrix",
        "description": "Produce matrix proving which phased security controls are complete, triggered, deferred, or blocked.",
        "details": "Produce a matrix proving Phase 0 is complete before commit and documenting which Phase 1-4 controls are triggered now, deferred by attack surface, or blocked by PO approval. Include SEC-18, secret scanning, encryption readiness, auth hardening, network hardening, CI hardening, Image Studio/Brand Vault upload/fetch controls, public deployment controls, and first-paying-customer gates.",
        "dependencies": ["T48", "T49", "T50", "T51a", "T51b", "T51c", "T51d", "T52", "T53", "T54", "T55", "T56", "T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64", "T65", "T66", "T67", "T68"],
        "priority": "high",
    },
    {
        "logical": "T70",
        "title": "Airtable Build Tracker Sync After PO Diff Approval",
        "description": "Synchronize the approved task graph to Airtable Build Tracker only after PO diff approval.",
        "details": "After PO approval only, sync the approved graph to Airtable Build Tracker. Do not sync unapproved task mutations as active execution tasks. This task preserves the Architecture Broadcast approval boundary.",
        "dependencies": ["T47", "T48", "T49", "T50", "T51a", "T51b", "T51c", "T51d", "T52", "T53", "T54", "T55", "T56", "T57", "T58", "T59", "T60", "T61", "T62", "T63", "T64", "T65", "T66", "T67", "T68", "T69"],
        "priority": "medium",
    },
    {
        "logical": "T71",
        "title": "Final Quality Gate and Source-of-Truth Reconciliation",
        "description": "Run final quality gate and reconcile implementation evidence to all governing sources.",
        "details": "Run VIYO quality gate and reconcile final implementation evidence against PRD Section 26, Architecture Lock v6.1, T46 Gap Addendum, PO Combined Directive v2, and security trigger addenda. Findings must be resolved or explicitly escalated before Phase 6.2 completion can be claimed.",
        "dependencies": ["T66", "T67", "T68", "T69", "T70"],
        "priority": "high",
    },
    {
        "logical": "T72",
        "title": "PO Approval Stop Before Phase 7",
        "description": "Deliver Phase 6.2 acceptance evidence and stop before Phase 7 until explicit PO acceptance.",
        "details": "Deliver acceptance evidence and stop. Do not proceed to Phase 7 until PO explicitly accepts Phase 6.2 completion. This task closes the directive's approval boundary and prevents repeat execution drift.",
        "dependencies": ["T71"],
        "priority": "high",
    },
]


def load_existing_ids() -> set[str]:
    with TASKS_PATH.open() as fh:
        data = json.load(fh)
    return {str(task["id"]) for task in data["master"]["tasks"]}


def load_existing_titles() -> set[str]:
    with TASKS_PATH.open() as fh:
        data = json.load(fh)
    return {task["title"] for task in data["master"]["tasks"]}


def next_id() -> int:
    ids = [int(i) for i in load_existing_ids() if str(i).isdigit()]
    return max(ids) + 1


def main() -> None:
    existing_titles = load_existing_titles()
    start_id = next_id()
    logical_to_actual: dict[str, str] = {}
    for offset, task in enumerate(TASKS):
        logical_to_actual[task["logical"]] = str(start_id + offset)

    log_lines = [
        "# Manual Taskmaster add-task execution for PO Combined Directive v2",
        f"Start ID: {start_id}",
        "",
    ]

    for task in TASKS:
        full_title = f"{task['logical']}: {task['title']}"
        if full_title in existing_titles:
            log_lines.append(f"SKIP existing title: {full_title}")
            continue
        deps = [logical_to_actual.get(dep, dep) for dep in task["dependencies"]]
        cmd = [
            "npx",
            "task-master",
            "add-task",
            "--title",
            full_title,
            "--description",
            task["description"],
            "--details",
            task["details"],
            "--priority",
            task["priority"],
        ]
        if deps:
            cmd.extend(["--dependencies", ",".join(deps)])
        result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
        log_lines.append(f"## {full_title}")
        log_lines.append(f"Command: {' '.join(cmd[:4])} ...")
        log_lines.append(f"Return code: {result.returncode}")
        if result.stdout:
            log_lines.append("STDOUT:")
            log_lines.append(result.stdout.strip())
        if result.stderr:
            log_lines.append("STDERR:")
            log_lines.append(result.stderr.strip())
        log_lines.append("")
        if result.returncode != 0:
            LOG_PATH.write_text("\n".join(log_lines) + "\n")
            raise SystemExit(result.returncode)

    LOG_PATH.write_text("\n".join(log_lines) + "\n")
    print(f"Manual add-task run complete. Expected logical-to-actual map: {logical_to_actual}")
    print(f"Log: {LOG_PATH}")


if __name__ == "__main__":
    main()
