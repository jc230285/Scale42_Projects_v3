-- Complete navigation fix - run this entire script in Supabase SQL Editor
-- This will fix RLS issues and ensure navigation works

-- First, drop any existing problematic policies
DROP POLICY IF EXISTS s42_categories_service_role ON public.s42_categories;
DROP POLICY IF EXISTS s42_menu_items_service_all ON public.s42_menu_items;
DROP POLICY IF EXISTS s42_pages_service_all ON public.s42_pages;

-- Temporarily disable RLS on navigation tables
ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;

-- Verify the data is accessible
SELECT 'Categories:' as test, COUNT(*) as count FROM public.s42_categories;
SELECT 'Menu Items:' as test, COUNT(*) as count FROM public.s42_menu_items;
SELECT 'Pages:' as test, COUNT(*) as count FROM public.s42_pages;

-- Show some sample data
SELECT c.name as category, mi.label as menu_item, mi.href
FROM public.s42_categories c
JOIN public.s42_menu_items mi ON mi.category_id = c.id
ORDER BY c.sort_order, mi.sort_order
LIMIT 10;