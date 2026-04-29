-- T72: R2 auto-save Brand Vault persistence contract
-- Authority: Task 72 PO-approved Option 1 brand_id storage decision, 2026-04-29.
-- Scope: add a first-class Brand Vault access path to public.assets; do not store the primary brand scope only in metadata JSONB.

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS brand_id UUID;

-- Legacy-safe backfill for any pre-T72 generated assets that already carried brand scope in metadata.
-- Invalid or absent legacy metadata intentionally remains NULL so the NOT NULL gate fails loudly instead of inventing brand scope.
UPDATE public.assets
SET brand_id = COALESCE(
  CASE
    WHEN metadata->>'brandId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (metadata->>'brandId')::uuid
    ELSE NULL
  END,
  CASE
    WHEN metadata->>'brand_id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (metadata->>'brand_id')::uuid
    ELSE NULL
  END
)
WHERE brand_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.assets WHERE brand_id IS NULL) THEN
    RAISE EXCEPTION 'T72 migration requires every existing assets row to have a valid brand_id; backfill legacy rows before applying NOT NULL.';
  END IF;
END $$;

ALTER TABLE public.assets
  ALTER COLUMN brand_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_assets_brand_workspace'
      AND conrelid = 'public.assets'::regclass
  ) THEN
    ALTER TABLE public.assets
      ADD CONSTRAINT fk_assets_brand_workspace
      FOREIGN KEY (brand_id, workspace_id)
      REFERENCES public.brands(id, workspace_id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_assets_workspace_id
  ON public.assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_assets_brand_id
  ON public.assets(brand_id);
CREATE INDEX IF NOT EXISTS idx_assets_brand_vault
  ON public.assets(workspace_id, brand_id, created_at DESC);
