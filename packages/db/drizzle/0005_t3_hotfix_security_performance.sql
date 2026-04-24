-- Migration 0005: T3 Hotfix — Security & Performance Refinements
-- Authority: PO directive 2026-04-24
-- Fixes:
--   1. SECURITY DEFINER on handle_new_user() so trigger can INSERT into
--      workspaces/workspace_members/users even though auth.users INSERT
--      runs in the context of the new (unprivileged) user.
--   2. Composite index on workspace_members(user_id, workspace_id) to
--      accelerate check_workspace_access() which is called by every
--      tenant-scoped RLS policy.

-- =============================================================================
-- 1. Recreate handle_new_user() with SECURITY DEFINER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  display TEXT;
BEGIN
  -- Derive display name: prefer raw_user_meta_data, fall back to email prefix, then 'User'
  display := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
    'User'
  );

  -- Guard: if display is empty string after COALESCE, default to 'User'
  IF display = '' THEN
    display := 'User';
  END IF;

  -- Insert user profile (skip if already exists — handles retry/duplicate scenarios)
  INSERT INTO public.users (id, email, display_name, avatar_url, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    display,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    false
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a personal workspace for the new user
  new_workspace_id := uuid_generate_v4();
  INSERT INTO public.workspaces (id, name, slug, subscription_tier, owner_id)
  VALUES (
    new_workspace_id,
    display || '''s Workspace',
    'ws-' || SUBSTRING(new_workspace_id::TEXT FROM 1 FOR 8),
    'free',
    NEW.id
  );

  -- Assign the user as owner of their personal workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but do NOT block the auth.users INSERT
  RAISE WARNING 'handle_new_user failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Ensure the trigger is still attached (idempotent — drop and recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. Composite index on workspace_members for RLS performance
-- =============================================================================

-- This index accelerates check_workspace_access(workspace_id) which does:
--   SELECT 1 FROM workspace_members WHERE user_id = auth.uid() AND workspace_id = $1
-- The (user_id, workspace_id) order matches the query pattern: user_id is the
-- equality filter from auth.uid(), workspace_id is the parameter.

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_workspace
  ON public.workspace_members (user_id, workspace_id);

-- Also add a reverse index for queries that filter by workspace_id first
-- (e.g., "list all members of workspace X")
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user
  ON public.workspace_members (workspace_id, user_id);
