-- Temporarily disable RLS on key tables to test if that's the issue
-- This is NOT a permanent solution, just for debugging

ALTER TABLE public.s42_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;

-- You can re-enable later with:
-- ALTER TABLE public.s42_users ENABLE ROW LEVEL SECURITY;
-- etc.
