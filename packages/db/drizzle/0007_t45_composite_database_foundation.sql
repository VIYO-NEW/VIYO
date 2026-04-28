-- ============================================================
-- T45: Composite Database Foundation
-- Authority: T45 PO-approved Phase 2 + Phase 3, T16-T20, T48 Webhook Pipeline v3.0
-- Scope: Schema, migration, RLS, indexes, and deterministic SQL backfill only.
-- 1. brands — Minimal brand anchor required by comments.brand_id
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_brands_id_workspace UNIQUE (id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_brands_workspace_id
  ON public.brands(workspace_id);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_brands" ON public.brands;
CREATE POLICY "ws_isolation_brands"
  ON public.brands FOR ALL
  USING (public.check_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.check_workspace_access(auth.uid(), workspace_id));

-- 2. comment_target_type — Exact 11-value PO-approved enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_target_type') THEN
    CREATE TYPE public.comment_target_type AS ENUM (
      'image',
      'email',
      'product',
      'segment',
      'flow',
      'event',
      'calendar',
      'strategy',
      'branding',
      'support',
      'general'
    );
  END IF;
END $$;

-- 3. comments — Brand-isolated threaded comments with anchors and mentions
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type public.comment_target_type NOT NULL,
  target_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  anchor_x NUMERIC(7,2),
  anchor_y NUMERIC(7,2),
  mentioned_user_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  referenced_entity_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_comments_id_workspace UNIQUE (id, workspace_id),
  CONSTRAINT fk_comments_brand_workspace
    FOREIGN KEY (brand_id, workspace_id)
    REFERENCES public.brands(id, workspace_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent_workspace
    FOREIGN KEY (parent_id, workspace_id)
    REFERENCES public.comments(id, workspace_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_workspace_id
  ON public.comments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_comments_brand_id
  ON public.comments(brand_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id
  ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_target
  ON public.comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON public.comments(parent_id)
  WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_unresolved
  ON public.comments(brand_id, created_at DESC)
  WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_mentioned_user_ids
  ON public.comments USING gin(mentioned_user_ids);
CREATE INDEX IF NOT EXISTS idx_comments_referenced_entity_ids
  ON public.comments USING gin(referenced_entity_ids);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_comments" ON public.comments;
CREATE POLICY "ws_isolation_comments"
  ON public.comments FOR ALL
  USING (public.check_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.check_workspace_access(auth.uid(), workspace_id));

-- 4. webhook_endpoints — T48 exact endpoint foundation
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret VARCHAR(64) NOT NULL,
  events VARCHAR[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description VARCHAR(255),
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uq_webhook_endpoints_id_workspace UNIQUE (id, workspace_id),
  CONSTRAINT chk_webhook_endpoint_url_https CHECK (url ~ '^https://'),
  CONSTRAINT chk_webhook_endpoint_secret_format CHECK (secret ~ '^[a-f0-9]{64}$'),
  CONSTRAINT chk_webhook_endpoint_events_not_empty CHECK (cardinality(events) > 0),
  CONSTRAINT chk_webhook_endpoint_events_allowed CHECK (
    events <@ ARRAY[
      'email.generation.started',
      'email.generation.completed',
      'email.generation.failed',
      'email.export.completed',
      'email.export.failed',
      'email.status.changed',
      'image.generation.started',
      'image.generation.completed',
      'image.generation.failed',
      'image.edit.completed',
      'image.edit.failed',
      'image.saved_to_vault',
      'brand.import.started',
      'brand.import.completed',
      'brand.import.failed',
      'brand.assets.updated',
      'team.comment.added',
      'team.approval.granted',
      'team.member.invited',
      'billing.tokens.low',
      'billing.tokens.depleted',
      'billing.subscription.changed'
    ]::varchar[]
  ),
  CONSTRAINT chk_webhook_failure_count_nonnegative CHECK (failure_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_workspace_id
  ON public.webhook_endpoints(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active
  ON public.webhook_endpoints(workspace_id, is_active)
  WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_events
  ON public.webhook_endpoints USING gin(events);

ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_webhook_endpoints" ON public.webhook_endpoints;
CREATE POLICY "ws_isolation_webhook_endpoints"
  ON public.webhook_endpoints FOR ALL
  USING (public.check_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.check_workspace_access(auth.uid(), workspace_id));

-- 5. webhook_delivery_logs — T48 delivery audit log, cascade-owned by endpoints
CREATE TABLE IF NOT EXISTS public.webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_time_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_webhook_delivery_event_type CHECK (
    event_type IN (
      'email.generation.started',
      'email.generation.completed',
      'email.generation.failed',
      'email.export.completed',
      'email.export.failed',
      'email.status.changed',
      'image.generation.started',
      'image.generation.completed',
      'image.generation.failed',
      'image.edit.completed',
      'image.edit.failed',
      'image.saved_to_vault',
      'brand.import.started',
      'brand.import.completed',
      'brand.import.failed',
      'brand.assets.updated',
      'team.comment.added',
      'team.approval.granted',
      'team.member.invited',
      'billing.tokens.low',
      'billing.tokens.depleted',
      'billing.subscription.changed'
    )
  ),
  CONSTRAINT chk_webhook_delivery_attempt_number CHECK (attempt_number BETWEEN 1 AND 4),
  CONSTRAINT chk_webhook_delivery_response_status CHECK (
    response_status IS NULL OR response_status BETWEEN 100 AND 599
  ),
  CONSTRAINT chk_webhook_delivery_response_time CHECK (
    response_time_ms IS NULL OR response_time_ms >= 0
  )
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_endpoint_id
  ON public.webhook_delivery_logs(webhook_endpoint_id, delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_response_status
  ON public.webhook_delivery_logs(response_status)
  WHERE response_status IS NOT NULL;

ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_webhook_delivery_logs" ON public.webhook_delivery_logs;
CREATE POLICY "ws_isolation_webhook_delivery_logs"
  ON public.webhook_delivery_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.webhook_endpoints endpoint
      WHERE endpoint.id = webhook_endpoint_id
        AND public.check_workspace_access(auth.uid(), endpoint.workspace_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.webhook_endpoints endpoint
      WHERE endpoint.id = webhook_endpoint_id
        AND public.check_workspace_access(auth.uid(), endpoint.workspace_id)
    )
  );

-- 6. notification_preferences — User notification preference foundation
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_preferences_scope UNIQUE (workspace_id, user_id, event_type, channel),
  CONSTRAINT chk_notification_preferences_channel CHECK (channel IN ('in_app', 'email', 'slack'))
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_workspace_user
  ON public.notification_preferences(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_event_channel
  ON public.notification_preferences(event_type, channel);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_notification_preferences" ON public.notification_preferences;
CREATE POLICY "ws_isolation_notification_preferences"
  ON public.notification_preferences FOR ALL
  USING (public.check_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.check_workspace_access(auth.uid(), workspace_id));

-- 7. integration_connections — OAuth/platform connection storage foundation
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scopes VARCHAR[] NOT NULL DEFAULT '{}'::varchar[],
  expires_at TIMESTAMPTZ,
  channel_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_integration_connections_provider UNIQUE (workspace_id, provider),
  CONSTRAINT chk_integration_connections_provider CHECK (provider IN ('slack', 'discord', 'teams', 'zapier', 'make')),
  CONSTRAINT chk_integration_connections_status CHECK (status IN ('active', 'disabled', 'expired', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_integration_connections_workspace_provider
  ON public.integration_connections(workspace_id, provider);
CREATE INDEX IF NOT EXISTS idx_integration_connections_status
  ON public.integration_connections(status);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ws_isolation_integration_connections" ON public.integration_connections;
CREATE POLICY "ws_isolation_integration_connections"
  ON public.integration_connections FOR ALL
  USING (public.check_workspace_access(auth.uid(), workspace_id))
  WITH CHECK (public.check_workspace_access(auth.uid(), workspace_id));

-- 8. image_prompt_patterns — T20 deterministic router-support columns
ALTER TABLE public.image_prompt_patterns
  ADD COLUMN IF NOT EXISTS supports_typography BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fidelity_score NUMERIC(3,2) NOT NULL DEFAULT 0.50,
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(100) NOT NULL DEFAULT 'general';

ALTER TABLE public.image_prompt_patterns
  DROP CONSTRAINT IF EXISTS chk_image_prompt_patterns_fidelity_score,
  ADD CONSTRAINT chk_image_prompt_patterns_fidelity_score
    CHECK (fidelity_score BETWEEN 0 AND 1);

UPDATE public.image_prompt_patterns
SET
  supports_typography = CASE
    WHEN typography_style IS NOT NULL AND typography_style NOT IN ('none', 'minimal', 'no_text') THEN TRUE
    WHEN target_models && ARRAY['gpt-image-1', 'dall-e-3', 'ideogram-v3']::varchar[] THEN TRUE
    ELSE FALSE
  END,
  fidelity_score = CASE
    WHEN qa_score >= 0.90 THEN 0.95
    WHEN qa_score >= 0.80 THEN 0.85
    WHEN qa_score >= 0.70 THEN 0.75
    ELSE 0.60
  END,
  product_type = CASE
    WHEN POSITION('fashion' IN LOWER(category)) > 0 OR POSITION('apparel' IN LOWER(category)) > 0 THEN 'fashion'
    WHEN POSITION('beauty' IN LOWER(category)) > 0 OR POSITION('cosmetic' IN LOWER(category)) > 0 THEN 'beauty'
    WHEN POSITION('food' IN LOWER(category)) > 0 OR POSITION('beverage' IN LOWER(category)) > 0 THEN 'food_beverage'
    WHEN POSITION('home' IN LOWER(category)) > 0 OR POSITION('furniture' IN LOWER(category)) > 0 THEN 'home_goods'
    WHEN POSITION('tech' IN LOWER(category)) > 0 OR POSITION('electronics' IN LOWER(category)) > 0 THEN 'electronics'
    ELSE 'general'
  END,
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_patterns_typography_fidelity
  ON public.image_prompt_patterns(supports_typography, fidelity_score DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_product_type
  ON public.image_prompt_patterns(product_type);

-- 9. updated_at triggers for new mutable tables
DROP TRIGGER IF EXISTS set_updated_at_brands ON public.brands;
CREATE TRIGGER set_updated_at_brands
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_comments ON public.comments;
CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_notification_preferences ON public.notification_preferences;
CREATE TRIGGER set_updated_at_notification_preferences
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_integration_connections ON public.integration_connections;
CREATE TRIGGER set_updated_at_integration_connections
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Documentation comments
COMMENT ON TABLE public.brands IS 'T45 minimal brand anchor for brand-scoped comments and future brand foundations.';
COMMENT ON TABLE public.comments IS 'T16 brand-isolated threaded comments with anchors, mentions, and entity references.';
COMMENT ON TYPE public.comment_target_type IS 'Exact PO-approved 11-value comment target taxonomy.';
COMMENT ON TABLE public.webhook_endpoints IS 'T17/T48 outbound webhook endpoint subscriptions for the exact 22-event catalog.';
COMMENT ON COLUMN public.webhook_endpoints.secret IS 'One-time HMAC-SHA256 signing secret; generated as a 64-character hex value by future runtime code.';
COMMENT ON TABLE public.webhook_delivery_logs IS 'T17/T48 webhook delivery audit log; rows cascade when owning endpoints are deleted.';
COMMENT ON TABLE public.notification_preferences IS 'T18 notification preference foundation for future mention and collaboration dispatch.';
COMMENT ON TABLE public.integration_connections IS 'T19 encrypted OAuth/platform connection storage foundation.';
COMMENT ON COLUMN public.integration_connections.access_token_encrypted IS 'AES-256-GCM encrypted access token payload; encryption is performed by application vault code.';
COMMENT ON COLUMN public.integration_connections.refresh_token_encrypted IS 'AES-256-GCM encrypted refresh token payload; encryption is performed by application vault code.';
COMMENT ON COLUMN public.image_prompt_patterns.supports_typography IS 'T20 deterministic typography-capability flag for future Art Director Router scoring.';
COMMENT ON COLUMN public.image_prompt_patterns.fidelity_score IS 'T20 deterministic fidelity score derived from existing QA score during migration backfill.';
COMMENT ON COLUMN public.image_prompt_patterns.product_type IS 'T20 deterministic product taxonomy derived from existing category values during migration backfill.';
