-- ============================================================
-- T9: Stripe Billing Foundation Migration
-- Authority: T9_STRIPE_BILLING_FOUNDATION_MASTER §2, R20 [2026-04-26]
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. ALTER workspaces — add 6 new billing columns
--    NOTE: stripe_customer_id already exists (T3)
-- ────────────────────────────────────────────────
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS billing_cycle_anchor TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_top_up_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_top_up_threshold BIGINT DEFAULT 500000,
  ADD COLUMN IF NOT EXISTS auto_top_up_pack VARCHAR(20) DEFAULT 'small';

-- Add CHECK constraints (safe to add — no existing data violates)
ALTER TABLE workspaces
  DROP CONSTRAINT IF EXISTS chk_subscription_status,
  ADD CONSTRAINT chk_subscription_status
    CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'trialing'));

ALTER TABLE workspaces
  DROP CONSTRAINT IF EXISTS chk_subscription_tier,
  ADD CONSTRAINT chk_subscription_tier
    CHECK (subscription_tier IN ('free', 'starter', 'growth', 'agency'));

ALTER TABLE workspaces
  DROP CONSTRAINT IF EXISTS chk_auto_top_up_pack,
  ADD CONSTRAINT chk_auto_top_up_pack
    CHECK (auto_top_up_pack IN ('small', 'medium', 'large', 'xl'));

-- Index for fast customer lookups during webhooks
CREATE INDEX IF NOT EXISTS idx_workspaces_stripe_customer
  ON workspaces(stripe_customer_id);

-- ────────────────────────────────────────────────
-- 2. token_balances — Materialized O(1) balance lookups
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_balances (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0,
  lifetime_granted BIGINT NOT NULL DEFAULT 0,
  lifetime_consumed BIGINT NOT NULL DEFAULT 0,
  lifetime_refunded BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_read_balance"
  ON token_balances FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service_role_all_balances"
  ON token_balances FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 3. token_ledger — Immutable customer token ledger
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID,
  amount BIGINT NOT NULL,
  running_balance BIGINT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL
    CHECK (transaction_type IN (
      'subscription_grant', 'top_up', 'free_grant',
      'generation', 'revision', 'chat', 'compatibility_test', 'figma_import',
      'refund', 'admin_adjustment'
    )),
  description TEXT NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  stripe_payment_intent_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_ledger_workspace_created
  ON token_ledger(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_token_ledger_stripe_pi
  ON token_ledger(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_read_ledger"
  ON token_ledger FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Service role can INSERT only — no UPDATE or DELETE
CREATE POLICY "service_role_insert_ledger"
  ON token_ledger FOR INSERT
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 4. stripe_webhook_events — Idempotency guard
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_webhooks"
  ON stripe_webhook_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 5. system_config — Billing constants
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_config"
  ON system_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 6. system_config_audit_log — Immutable change log
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL,
  old_value JSONB NOT NULL,
  new_value JSONB NOT NULL,
  reason TEXT NOT NULL,
  changed_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system_config_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_audit"
  ON system_config_audit_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 7. provider_pricing_registry — Model cost tracking
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_pricing_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id VARCHAR(100) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL,
  input_cost_per_1m NUMERIC(10, 4),
  output_cost_per_1m NUMERIC(10, 4),
  cost_per_image NUMERIC(10, 4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE provider_pricing_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_pricing"
  ON provider_pricing_registry FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 8. promo_codes + promo_redemptions
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  stripe_coupon_id VARCHAR(255),
  token_grant BIGINT NOT NULL DEFAULT 0,
  max_redemptions INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_promos"
  ON promo_codes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  tokens_granted BIGINT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_redemptions"
  ON promo_redemptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 9. system_email_templates — VIYO-branded transactional emails
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE system_email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_email_templates"
  ON system_email_templates FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────
-- 10. atomic_token_deduction RPC — PL/pgSQL
-- T9 Master Spec §3.4
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION atomic_token_deduction(
  p_workspace_id UUID,
  p_user_id UUID,
  p_amount BIGINT,
  p_transaction_type VARCHAR,
  p_description TEXT,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE (new_balance BIGINT) AS $$
DECLARE
  v_current_balance BIGINT;
  v_new_balance BIGINT;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT balance INTO v_current_balance
  FROM token_balances
  WHERE workspace_id = p_workspace_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workspace balance not found';
  END IF;

  v_new_balance := v_current_balance + p_amount;

  -- Enforce non-negative balance for deductions
  IF p_amount < 0 AND v_new_balance < 0 THEN
    RAISE EXCEPTION 'insufficient funds';
  END IF;

  -- Update balance table
  UPDATE token_balances
  SET
    balance = v_new_balance,
    lifetime_consumed = CASE WHEN p_amount < 0 THEN lifetime_consumed + ABS(p_amount) ELSE lifetime_consumed END,
    lifetime_granted = CASE WHEN p_amount > 0 AND p_transaction_type != 'refund' THEN lifetime_granted + p_amount ELSE lifetime_granted END,
    lifetime_refunded = CASE WHEN p_amount > 0 AND p_transaction_type = 'refund' THEN lifetime_refunded + p_amount ELSE lifetime_refunded END,
    updated_at = NOW()
  WHERE workspace_id = p_workspace_id;

  -- Insert ledger entry
  INSERT INTO token_ledger (
    workspace_id, user_id, amount, running_balance,
    transaction_type, description, reference_type, reference_id, metadata
  ) VALUES (
    p_workspace_id, p_user_id, p_amount, v_new_balance,
    p_transaction_type, p_description, p_reference_type, p_reference_id, p_metadata
  );

  RETURN QUERY SELECT v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────
-- 11. Seed Data
-- ────────────────────────────────────────────────

-- system_config seed
INSERT INTO system_config (key, value, description) VALUES
  ('TOKEN_MULTIPLIER', '335000', 'USD to VIYO Token conversion rate'),
  ('MARGIN_FLOOR_PERCENT', '40', 'Minimum acceptable margin percentage for Agency tier'),
  ('AMAZING_EMAIL_BASELINE_USD', '1.2', 'Estimated cost in USD for one "amazing" email generation'),
  ('MONTHLY_GRANTS', '{"free": 1000000, "starter": 6000000, "growth": 23000000, "agency": 100000000}', 'Monthly token grants per tier'),
  ('TOP_UP_PACKS', '{"small": {"tokens": 1000000, "priceCents": 500}, "medium": {"tokens": 5000000, "priceCents": 2000}, "large": {"tokens": 10000000, "priceCents": 4500}, "xl": {"tokens": 25000000, "priceCents": 10000}}', 'Top-up pack definitions'),
  ('TIER_PRICES', '{"free": {"monthly": 0, "annual": 0}, "starter": {"monthly": 4900, "annual": 49000}, "growth": {"monthly": 14900, "annual": 149000}, "agency": {"monthly": 49900, "annual": 499000}}', 'Tier prices in cents'),
  ('FREE_TIER_CAP', '2000000', 'Maximum token balance for free tier')
ON CONFLICT (key) DO NOTHING;

-- provider_pricing_registry seed (per-1M token costs)
INSERT INTO provider_pricing_registry (model_id, provider, input_cost_per_1m, output_cost_per_1m, cost_per_image) VALUES
  ('gpt-4o', 'openai', 2.5000, 10.0000, NULL),
  ('gpt-4o-mini', 'openai', 0.1500, 0.6000, NULL),
  ('gpt-4.1', 'openai', 2.0000, 8.0000, NULL),
  ('gpt-4.1-mini', 'openai', 0.4000, 1.6000, NULL),
  ('gpt-4.1-nano', 'openai', 0.1000, 0.4000, NULL),
  ('gemini-2.5-flash', 'google', 0.1500, 0.6000, NULL),
  ('gemini-2.5-pro', 'google', 1.2500, 10.0000, NULL),
  ('claude-sonnet-4', 'anthropic', 3.0000, 15.0000, NULL),
  ('claude-haiku-3.5', 'anthropic', 0.8000, 4.0000, NULL),
  ('nanobanana-v1', 'nanobanana', NULL, NULL, 0.0300),
  ('ideogram-v2', 'ideogram', NULL, NULL, 0.0400),
  ('dall-e-3', 'openai', NULL, NULL, 0.0400)
ON CONFLICT (model_id) DO NOTHING;

-- system_email_templates seed (15 stubs per T9 §19)
INSERT INTO system_email_templates (template_key, name, subject, body_html, body_text, variables) VALUES
  ('billing.welcome', 'Welcome to VIYO', 'Welcome to VIYO — Your tokens are ready!', '<p>Welcome {{workspace_name}}!</p>', 'Welcome {{workspace_name}}!', '["workspace_name", "token_balance"]'),
  ('billing.subscription_activated', 'Subscription Activated', 'Your {{tier}} plan is now active', '<p>Your {{tier}} plan is active.</p>', 'Your {{tier}} plan is active.', '["tier", "token_grant", "next_billing_date"]'),
  ('billing.subscription_upgraded', 'Plan Upgraded', 'You''ve upgraded to {{new_tier}}', '<p>Upgraded to {{new_tier}}.</p>', 'Upgraded to {{new_tier}}.', '["old_tier", "new_tier", "token_grant"]'),
  ('billing.subscription_downgraded', 'Plan Downgraded', 'Your plan will change to {{new_tier}}', '<p>Downgrading to {{new_tier}} at period end.</p>', 'Downgrading to {{new_tier}} at period end.', '["old_tier", "new_tier", "effective_date"]'),
  ('billing.subscription_canceled', 'Subscription Canceled', 'Your VIYO subscription has been canceled', '<p>Your subscription has been canceled.</p>', 'Your subscription has been canceled.', '["tier", "tokens_remaining"]'),
  ('billing.payment_receipt', 'Payment Receipt', 'Payment received — {{amount}}', '<p>Payment of {{amount}} received.</p>', 'Payment of {{amount}} received.', '["amount", "invoice_url"]'),
  ('billing.payment_failed', 'Payment Failed', 'Action required: Payment failed', '<p>Your payment failed. Please update your payment method.</p>', 'Your payment failed.', '["amount", "retry_date", "portal_url"]'),
  ('billing.dunning_final', 'Account Downgraded', 'Your account has been downgraded to Free', '<p>After 14 days of failed payments, your account has been downgraded.</p>', 'Your account has been downgraded.', '["tokens_remaining"]'),
  ('billing.top_up_success', 'Tokens Added', '{{tokens}} tokens added to your account', '<p>{{tokens}} tokens have been added.</p>', '{{tokens}} tokens have been added.', '["tokens", "new_balance", "amount"]'),
  ('billing.auto_topup_success', 'Auto Top-Up Successful', 'Auto top-up: {{tokens}} tokens added', '<p>Auto top-up added {{tokens}} tokens.</p>', 'Auto top-up added {{tokens}} tokens.', '["tokens", "new_balance", "amount"]'),
  ('billing.auto_topup_failed', 'Auto Top-Up Failed', 'Auto top-up failed — action required', '<p>Auto top-up failed. Please check your payment method.</p>', 'Auto top-up failed.', '["pack", "portal_url"]'),
  ('billing.low_balance', 'Low Token Balance', 'Your token balance is running low', '<p>Your balance is {{balance}} tokens.</p>', 'Your balance is {{balance}} tokens.', '["balance", "threshold", "portal_url"]'),
  ('billing.free_tier_renewal', 'Monthly Tokens Refreshed', 'Your free tokens have been refreshed', '<p>Your free tier tokens have been refreshed.</p>', 'Your free tier tokens have been refreshed.', '["tokens_granted", "new_balance"]'),
  ('billing.workspace_deletion_scheduled', 'Workspace Deletion Scheduled', 'Your workspace will be deleted in 30 days', '<p>Your workspace is scheduled for deletion.</p>', 'Your workspace is scheduled for deletion.', '["workspace_name", "deletion_date"]'),
  ('billing.workspace_deleted', 'Workspace Deleted', 'Your workspace has been permanently deleted', '<p>Your workspace has been permanently deleted.</p>', 'Your workspace has been permanently deleted.', '["workspace_name"]')
ON CONFLICT (template_key) DO NOTHING;
