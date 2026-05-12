-- PIA-1 Proprietary Intelligence Architecture Foundation
-- Foundation / Phase 0 extension of the T45 composite database layer.
-- Sources: R36 HYVE, R37 MAAX, R38 SYPHON, Architecture Lock V8, PRD V6 Addendum, Naming Registry.
-- Scope: database-first consent, isolated brand memory, anonymized HYVE pattern store, and aggregated SYPHON campaign performance.

-- ============================================================
-- PART 1: HYVE consent fields on brands
-- ============================================================
ALTER TABLE public.brands
    ADD COLUMN IF NOT EXISTS hyve_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hyve_opt_in_timestamp TIMESTAMPTZ;

COMMENT ON COLUMN public.brands.hyve_opt_in IS
    'R36 HYVE consent gate. Defaults false; no brand joins HYVE by default.';
COMMENT ON COLUMN public.brands.hyve_opt_in_timestamp IS
    'Timestamp when HYVE consent was enabled. Null when disabled or never opted in.';

CREATE INDEX IF NOT EXISTS idx_brands_hyve_opt_in
    ON public.brands(hyve_opt_in)
    WHERE hyve_opt_in = TRUE;

-- ============================================================
-- PART 2: MAAX brand preference memory
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brand_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    studio_type VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    generation_id UUID,
    context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    edit_delta JSONB NOT NULL DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_brand_preferences_brand_workspace
        FOREIGN KEY (brand_id, workspace_id)
        REFERENCES public.brands(id, workspace_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_brand_preferences_studio_type
        CHECK (studio_type IN ('vvow','pulze','vault','brand_style','general')),
    CONSTRAINT chk_brand_preferences_action_type
        CHECK (action_type IN ('accept','reject','edit','send','brand_style_decision','select_generation','approve_asset'))
);

COMMENT ON TABLE public.brand_preferences IS
    'R37 MAAX isolated brand memory store for real VVOW/PULZE/Vault preference signals. Tenant- and brand-scoped; no cross-brand query leakage.';
COMMENT ON COLUMN public.brand_preferences.context_payload IS
    'Scoped context for the preference event. Must not be used to bypass brand isolation.';
COMMENT ON COLUMN public.brand_preferences.edit_delta IS
    'Structured delta describing approved user edits or preference signals.';

CREATE INDEX IF NOT EXISTS idx_brand_preferences_workspace_id
    ON public.brand_preferences(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brand_preferences_brand_recorded
    ON public.brand_preferences(brand_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_preferences_studio_action
    ON public.brand_preferences(studio_type, action_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_preferences_generation_id
    ON public.brand_preferences(generation_id)
    WHERE generation_id IS NOT NULL;

-- ============================================================
-- PART 3: HYVE anonymized pattern-performance store
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hyve_pattern_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vertical VARCHAR(120) NOT NULL,
    revenue_band VARCHAR(80) NOT NULL,
    pattern_key VARCHAR(160) NOT NULL,
    metric_name VARCHAR(80) NOT NULL,
    metric_value NUMERIC(14, 4) NOT NULL,
    audience_segment VARCHAR(160),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_hyve_metric_value_nonnegative
        CHECK (metric_value >= 0),
    CONSTRAINT chk_hyve_metadata_no_identity_keys
        CHECK (NOT (metadata ?| ARRAY[
            'brand_id',
            'brand_name',
            'workspace_id',
            'customer_id',
            'customer_email',
            'customer_list',
            'raw_prompt',
            'raw_creative_text',
            'raw_image_url'
        ]))
);

COMMENT ON TABLE public.hyve_pattern_performance IS
    'R36 HYVE anonymized network-intelligence table. No brand identity, customer identity, raw prompts, raw creative text, raw image content, or customer lists.';
COMMENT ON COLUMN public.hyve_pattern_performance.pattern_key IS
    'Anonymized pattern identifier, not raw prompt or creative copy.';
COMMENT ON COLUMN public.hyve_pattern_performance.metadata IS
    'Sanitized aggregate metadata only. CHECK constraint blocks known identity/raw-content keys.';

CREATE INDEX IF NOT EXISTS idx_hyve_pattern_vertical_revenue
    ON public.hyve_pattern_performance(vertical, revenue_band, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_hyve_pattern_key_metric
    ON public.hyve_pattern_performance(pattern_key, metric_name, recorded_at DESC);

-- ============================================================
-- PART 4: SYPHON aggregated campaign-performance store
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaign_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    generation_id UUID,
    external_campaign_id VARCHAR(255),
    external_campaign_name TEXT,
    platform VARCHAR(80) NOT NULL,
    send_count INTEGER NOT NULL DEFAULT 0,
    open_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    attributed_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    metrics_window_start TIMESTAMPTZ,
    metrics_window_end TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_campaign_performance_brand_workspace
        FOREIGN KEY (brand_id, workspace_id)
        REFERENCES public.brands(id, workspace_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_campaign_performance_counts_nonnegative
        CHECK (send_count >= 0 AND open_count >= 0 AND click_count >= 0),
    CONSTRAINT chk_campaign_performance_revenue_nonnegative
        CHECK (attributed_revenue >= 0),
    CONSTRAINT chk_campaign_performance_window_order
        CHECK (metrics_window_start IS NULL OR metrics_window_end IS NULL OR metrics_window_end >= metrics_window_start),
    CONSTRAINT chk_campaign_performance_metadata_no_customer_pii
        CHECK (NOT (metadata ?| ARRAY[
            'customer_id',
            'customer_email',
            'customer_phone',
            'customer_list',
            'raw_profile',
            'recipient_email'
        ]))
);

COMMENT ON TABLE public.campaign_performance IS
    'R38 SYPHON aggregated campaign metrics for attribution and performance learning. Stores aggregate counts/revenue only, not customer-level PII.';
COMMENT ON COLUMN public.campaign_performance.generation_id IS
    'Nullable VIYO generation attribution; external campaigns may not originate from a VIYO generation.';

CREATE INDEX IF NOT EXISTS idx_campaign_performance_workspace_id
    ON public.campaign_performance(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_brand_platform
    ON public.campaign_performance(brand_id, platform, last_synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_generation_id
    ON public.campaign_performance(generation_id)
    WHERE generation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_performance_external_campaign
    ON public.campaign_performance(platform, external_campaign_id)
    WHERE external_campaign_id IS NOT NULL;

-- ============================================================
-- PART 5: updated_at triggers
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_brand_preferences ON public.brand_preferences;
CREATE TRIGGER set_updated_at_brand_preferences
    BEFORE UPDATE ON public.brand_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_hyve_pattern_performance ON public.hyve_pattern_performance;
CREATE TRIGGER set_updated_at_hyve_pattern_performance
    BEFORE UPDATE ON public.hyve_pattern_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_campaign_performance ON public.campaign_performance;
CREATE TRIGGER set_updated_at_campaign_performance
    BEFORE UPDATE ON public.campaign_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PART 6: RLS policies
-- ============================================================
ALTER TABLE public.brand_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ws_isolation_brand_preferences" ON public.brand_preferences;
CREATE POLICY "ws_isolation_brand_preferences" ON public.brand_preferences
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ws_isolation_campaign_performance" ON public.campaign_performance;
CREATE POLICY "ws_isolation_campaign_performance" ON public.campaign_performance
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

ALTER TABLE public.hyve_pattern_performance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hyve_pattern_performance_service_role" ON public.hyve_pattern_performance;
CREATE POLICY "hyve_pattern_performance_service_role" ON public.hyve_pattern_performance
    FOR ALL USING (auth.role() = 'service_role');
