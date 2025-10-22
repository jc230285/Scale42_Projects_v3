-- Add unique constraint on name and order column to s42_groups table
ALTER TABLE public.s42_groups
ADD COLUMN IF NOT EXISTS "order" integer;

-- Add unique constraint on name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 's42_groups_name_key'
  ) THEN
    ALTER TABLE public.s42_groups
    ADD CONSTRAINT s42_groups_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert the group data
INSERT INTO public.s42_groups (name, domain, type, "order") VALUES
  ('Admin', NULL, 'custom', 1),
  ('Agent: Peter', NULL, 'custom', 2),
  ('Founder', NULL, 'custom', 3),
  ('Partner: Bifrost', 'bifrost.com', 'domain', 4),
  ('Partner: GIG', 'gig.com', 'domain', 5),
  ('Scale-42', 'scale-42.com', 'domain', 6)
ON CONFLICT (name) DO UPDATE SET
  domain = EXCLUDED.domain,
  type = EXCLUDED.type,
  "order" = EXCLUDED."order";

-- Verify the data was inserted
SELECT name, domain, type, "order" FROM public.s42_groups ORDER BY "order";