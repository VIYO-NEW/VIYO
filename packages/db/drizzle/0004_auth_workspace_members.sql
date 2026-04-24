-- VIYO Schema Migration 004 — Auth & Workspace Members
-- T3: Supabase Auth + Workspace-Scoped RLS
-- Authority: R22 §2, §3, §5; ADR-009
--
-- This migration:
-- 1. Creates workspace_members junction table
-- 2. Creates check_workspace_access() reusable SQL function
-- 3. Creates handle_new_user() trigger for auth.users → public.users + workspace auto-provisioning
-- 4. Drops all old RLS policies and replaces with check_workspace_access()-based policies
-- 5. Ensures RLS is enabled on ALL public tables (including workspace_members)

-- ============================================================
-- PART 1: WORKSPACE_MEMBERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wm_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id ON public.workspace_members(workspace_id);

-- ============================================================
-- PART 2: CHECK_WORKSPACE_ACCESS FUNCTION
-- Reusable function for all RLS policies. Single point of maintenance.
-- Returns TRUE if the given user_id is a member of the given workspace_id.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_workspace_access(
    p_user_id UUID,
    p_workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE user_id = p_user_id
          AND workspace_id = p_workspace_id
    );
$$;

-- ============================================================
-- PART 3: HANDLE_NEW_USER TRIGGER
-- Fires on auth.users INSERT. Creates a public.users profile,
-- auto-provisions a default workspace, and adds workspace_members entry.
-- Handles edge cases: partial signups, duplicate emails, missing metadata.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id UUID;
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_existing_user UUID;
BEGIN
    -- Edge case: Check if a public.users row already exists (e.g., re-confirmation)
    SELECT id INTO v_existing_user
    FROM public.users
    WHERE id = NEW.id;

    IF v_existing_user IS NOT NULL THEN
        -- User already exists (duplicate trigger fire or re-confirmation).
        -- Update last_login_at and return without error.
        UPDATE public.users
        SET last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
    END IF;

    -- Extract metadata safely, defaulting to NULL on missing fields
    v_full_name := COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        split_part(COALESCE(NEW.email, ''), '@', 1)
    );
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data ->> 'avatar_url',
        NEW.raw_user_meta_data ->> 'picture'
    );

    -- Create a default workspace for the new user
    INSERT INTO public.workspaces (name)
    VALUES (COALESCE(v_full_name, 'My Workspace') || '''s Workspace')
    RETURNING id INTO v_workspace_id;

    -- Create the public.users profile row
    -- id references auth.users(id) — this is the bridge
    INSERT INTO public.users (id, workspace_id, email, full_name, avatar_url, role, last_login_at)
    VALUES (
        NEW.id,
        v_workspace_id,
        COALESCE(NEW.email, ''),
        v_full_name,
        v_avatar_url,
        'owner',
        NOW()
    );

    -- Add the user as owner of their default workspace in workspace_members
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, NEW.id, 'owner');

    RETURN NEW;

EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition: if email already exists in public.users
        -- (e.g., concurrent signup attempts), just update and continue
        UPDATE public.users
        SET last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but do NOT block the auth signup
        RAISE WARNING 'handle_new_user failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 4: DROP OLD RLS POLICIES & REPLACE WITH check_workspace_access()
-- ============================================================

-- --- workspaces ---
DROP POLICY IF EXISTS "ws_self_view" ON public.workspaces;
CREATE POLICY "ws_member_access" ON public.workspaces
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), id)
    );

-- --- users ---
DROP POLICY IF EXISTS "users_ws_view" ON public.users;
CREATE POLICY "users_ws_access" ON public.users
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );
-- Users can update their own profile
CREATE POLICY "users_self_update" ON public.users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- --- api_keys ---
DROP POLICY IF EXISTS "ws_isolation_api_keys" ON public.api_keys;
CREATE POLICY "ws_isolation_api_keys" ON public.api_keys
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- viyo_products ---
DROP POLICY IF EXISTS "ws_isolation_viyo_products" ON public.viyo_products;
CREATE POLICY "ws_isolation_viyo_products" ON public.viyo_products
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- assets ---
DROP POLICY IF EXISTS "ws_isolation_assets" ON public.assets;
CREATE POLICY "ws_isolation_assets" ON public.assets
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- image_prompt_patterns (service_role only — unchanged) ---
-- Policy "service_role_only" already exists and is correct. No change needed.

-- --- email_templates ---
DROP POLICY IF EXISTS "ws_isolation_email_templates" ON public.email_templates;
CREATE POLICY "ws_isolation_email_templates" ON public.email_templates
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- esp_connections ---
DROP POLICY IF EXISTS "ws_isolation_esp_connections" ON public.esp_connections;
CREATE POLICY "ws_isolation_esp_connections" ON public.esp_connections
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- token_usage_logs ---
DROP POLICY IF EXISTS "ws_isolation_token_usage_logs" ON public.token_usage_logs;
CREATE POLICY "ws_isolation_token_usage_logs" ON public.token_usage_logs
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- council_decisions ---
DROP POLICY IF EXISTS "ws_isolation_council_decisions" ON public.council_decisions;
CREATE POLICY "ws_isolation_council_decisions" ON public.council_decisions
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- --- timer_definitions ---
DROP POLICY IF EXISTS "ws_isolation_timer_definitions" ON public.timer_definitions;
CREATE POLICY "ws_isolation_timer_definitions" ON public.timer_definitions
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
    );

-- ============================================================
-- PART 5: RLS ON WORKSPACE_MEMBERS + RLHF TABLES
-- Ensure RLS is enabled on ALL public tables.
-- ============================================================

-- workspace_members: users can see their own memberships
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wm_self_read" ON public.workspace_members
    FOR SELECT USING (user_id = auth.uid());
-- Owners and admins can manage members in their workspaces
CREATE POLICY "wm_admin_manage" ON public.workspace_members
    FOR ALL USING (
        public.check_workspace_access(auth.uid(), workspace_id)
        AND EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.user_id = auth.uid()
              AND wm.workspace_id = workspace_members.workspace_id
              AND wm.role IN ('owner', 'admin')
        )
    );

-- rlhf_votes: RLS enabled, service_role only (internal curation tool)
ALTER TABLE public.rlhf_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rlhf_votes_service_role" ON public.rlhf_votes
    FOR ALL USING (auth.role() = 'service_role');

-- preference_model_versions: RLS enabled, service_role only
ALTER TABLE public.preference_model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmv_service_role" ON public.preference_model_versions
    FOR ALL USING (auth.role() = 'service_role');

-- pattern_performance_metrics: RLS enabled, service_role only
ALTER TABLE public.pattern_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ppm_service_role" ON public.pattern_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- PART 6: UPDATED_AT TRIGGER FOR WORKSPACE_MEMBERS
-- ============================================================

-- workspace_members doesn't have updated_at, so no trigger needed.
-- But we add the index for the trigger function on auth.users:
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON public.users(workspace_id);
