-- Temporarily disable RLS on navigation tables to test
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE public.s42_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.s42_pages DISABLE ROW LEVEL SECURITY;

-- Test access
SELECT 'Categories:' as test, COUNT(*) as count FROM public.s42_categories;
SELECT 'Menu Items:' as test, COUNT(*) as count FROM public.s42_menu_items;
SELECT 'Pages:' as test, COUNT(*) as count FROM public.s42_pages;