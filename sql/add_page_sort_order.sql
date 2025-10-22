-- Add sort_order column to s42_pages table
ALTER TABLE public.s42_pages ADD COLUMN IF NOT EXISTS sort_order int default 0;

-- Update existing pages to have sort_order based on their current order
-- This will set sort_order to a sequential number based on created_at
UPDATE public.s42_pages
SET sort_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as row_num
  FROM public.s42_pages
) sub
WHERE public.s42_pages.id = sub.id;