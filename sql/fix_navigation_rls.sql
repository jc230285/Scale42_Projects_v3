-- Fix navigation access issues
-- Run this in Supabase SQL Editor

-- First, check current policies
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('s42_categories', 's42_menu_items', 's42_pages');

-- Ensure service role bypass policies exist
DROP POLICY IF EXISTS s42_categories_service_role ON public.s42_categories;
DROP POLICY IF EXISTS s42_menu_items_service_all ON public.s42_menu_items;
DROP POLICY IF EXISTS s42_pages_service_all ON public.s42_pages;

-- Create service role bypass policies
CREATE POLICY s42_categories_service_role ON public.s42_categories
FOR ALL USING (true);

CREATE POLICY s42_menu_items_service_all ON public.s42_menu_items
FOR ALL USING (true);

CREATE POLICY s42_pages_service_all ON public.s42_pages
FOR ALL USING (true);

-- Temporarily disable RLS for testing (uncomment if needed)
-- ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('s42_categories', 's42_menu_items', 's42_pages');

-- Test data access
SELECT 'Categories:' as test, COUNT(*) as count FROM public.s42_categories;
SELECT 'Menu Items:' as test, COUNT(*) as count FROM public.s42_menu_items;
SELECT 'Pages:' as test, COUNT(*) as count FROM public.s42_pages;