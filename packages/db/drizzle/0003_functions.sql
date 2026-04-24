-- VIYO Schema Migration 003 — RPC Functions & Specialized Indexes
-- R20 §3: Vector Similarity Search RPC (R24 Tier 3 Router)
-- Applied via Supabase MCP apply_migration

-- ============================================================
-- IVFFlat Index on image_prompt_patterns.embedding
-- R20 §2: Uses vector_cosine_ops with 100 lists
-- Note: IVFFlat requires data to be effective; rebuild after seeding
-- ============================================================
CREATE INDEX idx_patterns_embedding ON public.image_prompt_patterns
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- match_image_patterns RPC — R20 §3
-- Called by R24 Production Router to find best matching prompt pattern
-- ============================================================
CREATE OR REPLACE FUNCTION match_image_patterns(
    query_embedding vector(1536),
    match_category TEXT,
    match_layout TEXT,
    match_threshold FLOAT,
    match_count INT
) RETURNS TABLE (
    id UUID,
    category VARCHAR,
    layout_type VARCHAR,
    typography_style VARCHAR,
    target_models VARCHAR[],
    prompt_template TEXT,
    style_schema JSONB,
    qa_score NUMERIC,
    cost_per_gen NUMERIC,
    similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.category, p.layout_type, p.typography_style,
        p.target_models, p.prompt_template, p.style_schema,
        p.qa_score, p.cost_per_gen,
        (1 - (p.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.image_prompt_patterns p
    WHERE p.category = match_category
      AND p.layout_type = match_layout
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- updated_at trigger function — auto-update timestamps
-- Used by all tables with updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER set_updated_at_workspaces BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_api_keys BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_viyo_products BEFORE UPDATE ON public.viyo_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_assets BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_image_prompt_patterns BEFORE UPDATE ON public.image_prompt_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_email_templates BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_esp_connections BEFORE UPDATE ON public.esp_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_token_usage_logs BEFORE UPDATE ON public.token_usage_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_council_decisions BEFORE UPDATE ON public.council_decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_timer_definitions BEFORE UPDATE ON public.timer_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_rlhf_votes BEFORE UPDATE ON public.rlhf_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_preference_model_versions BEFORE UPDATE ON public.preference_model_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_pattern_performance_metrics BEFORE UPDATE ON public.pattern_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
