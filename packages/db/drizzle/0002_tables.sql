-- VIYO Schema Migration 002 — All 17 R20 Tables
-- R20 §2: Authoritative schema registry
-- Workspace-first model: workspace_id is the tenant anchor on all scoped tables
-- Structure: CREATE ALL TABLES → THEN APPLY ALL RLS POLICIES
-- (RLS policies reference public.users which must exist first)

-- ============================================================
-- PART A: CREATE ALL TABLES (no RLS yet)
-- ============================================================

-- === IDENTITY (R22 Wiring) ===

CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free'
        CHECK (subscription_tier IN ('free','starter','growth','enterprise')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner','admin','member')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    key_prefix VARCHAR(8) NOT NULL,
    label VARCHAR(100),
    scopes VARCHAR[] DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === PRODUCTS & ASSETS (R31 Wiring) ===

CREATE TABLE public.viyo_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category VARCHAR(100),
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    thumbnail_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.viyo_products(id) ON DELETE SET NULL,
    asset_type VARCHAR(50) NOT NULL
        CHECK (asset_type IN ('product_photo','lifestyle_scene','generated_hero','generated_section','video_clip','brand_logo')),
    storage_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    source_model VARCHAR(50),
    generation_prompt TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === IMAGE INTELLIGENCE MOAT (R24 Wiring) ===

CREATE TABLE public.image_prompt_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    layout_type VARCHAR(50) NOT NULL,
    typography_style VARCHAR(50) NOT NULL,
    target_models VARCHAR[] NOT NULL,
    prompt_template TEXT NOT NULL,
    style_schema JSONB NOT NULL,
    embedding vector(1536) NOT NULL,
    qa_score NUMERIC(3,2) NOT NULL CHECK (qa_score BETWEEN 0 AND 1),
    cost_per_gen NUMERIC(5,4) NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patterns_category ON public.image_prompt_patterns(category, layout_type);

-- === EMAIL COMPOSITION (R27 & R29 Wiring) ===

CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject_line TEXT NOT NULL,
    preheader TEXT,
    viyo_utl_source TEXT NOT NULL,
    compiled_html TEXT,
    compiled_mjml TEXT,
    esp_target VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','review','approved','sent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.esp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL
        CHECK (provider IN ('klaviyo','mailchimp','sendgrid','brevo','hubspot','activecampaign','drip','customer_io')),
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === COST TRACKING (R23 Wiring) ===

CREATE TABLE public.token_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL
        CHECK (operation_type IN ('text_gen','image_gen','vision_qa','embedding','speech','video_analysis')),
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    image_count INTEGER NOT NULL DEFAULT 0,
    calculated_cost NUMERIC(10,6) NOT NULL,
    stripe_meter_event_id VARCHAR(255),
    inngest_run_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_ws_date ON public.token_usage_logs(workspace_id, created_at DESC);
CREATE INDEX idx_usage_unsent ON public.token_usage_logs(stripe_meter_event_id) WHERE stripe_meter_event_id IS NULL;

-- === LLM COUNCIL (R19 Wiring) ===

CREATE TABLE public.council_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    decision_type VARCHAR(50) NOT NULL,
    input_context JSONB NOT NULL,
    brain_votes JSONB NOT NULL,
    final_decision JSONB NOT NULL,
    confidence_score NUMERIC(3,2),
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === TIMER SERVICE (R28 Wiring) ===

CREATE TABLE public.timer_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    target_timestamp TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    style_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    fallback_text VARCHAR(255) NOT NULL DEFAULT 'Offer Expired',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === RLHF & PREFERENCE LEARNING (R24 & R19 Wiring) ===

CREATE TABLE public.rlhf_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID REFERENCES public.image_prompt_patterns(id) ON DELETE CASCADE,
    source_image_url TEXT NOT NULL,
    generated_image_url TEXT NOT NULL,
    curator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    vote VARCHAR(20) NOT NULL
        CHECK (vote IN ('approve','reject','skip')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.preference_model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_tag VARCHAR(50) NOT NULL UNIQUE,
    training_vote_count INTEGER NOT NULL,
    accuracy_score NUMERIC(5,4),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    model_weights_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pattern_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID NOT NULL,
    pattern_type VARCHAR(50) NOT NULL
        CHECK (pattern_type IN ('copywriting','layout','timing')),
    total_sends INTEGER NOT NULL DEFAULT 0,
    open_rate NUMERIC(5,4),
    click_rate NUMERIC(5,4),
    conversion_rate NUMERIC(5,4),
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PART B: ENABLE RLS & CREATE POLICIES
-- (All tables now exist, so cross-table references work)
-- ============================================================

-- workspaces: custom RLS (R20)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_self_view" ON public.workspaces
    FOR SELECT USING (id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- users: custom RLS (R20)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_ws_view" ON public.users
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- api_keys: tenant isolation (R20 tenantScoped=true)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_api_keys" ON public.api_keys
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- viyo_products: tenant isolation
ALTER TABLE public.viyo_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_viyo_products" ON public.viyo_products
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- assets: tenant isolation
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_assets" ON public.assets
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- image_prompt_patterns: service_role only (R20)
ALTER TABLE public.image_prompt_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON public.image_prompt_patterns
    FOR ALL USING (auth.role() = 'service_role');

-- email_templates: tenant isolation
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_email_templates" ON public.email_templates
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- esp_connections: tenant isolation
ALTER TABLE public.esp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_esp_connections" ON public.esp_connections
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- token_usage_logs: tenant isolation
ALTER TABLE public.token_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_token_usage_logs" ON public.token_usage_logs
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- council_decisions: tenant isolation
ALTER TABLE public.council_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_council_decisions" ON public.council_decisions
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));

-- timer_definitions: tenant isolation
ALTER TABLE public.timer_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ws_isolation_timer_definitions" ON public.timer_definitions
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.users WHERE id = auth.uid()));
