-- Fixed SQL without ON CONFLICT (since href is not unique)
-- Run this in Supabase SQL Editor

-- Add User Management page (if it doesn't exist)
INSERT INTO public.s42_pages (title, slug, content_mdx)
VALUES ('User Management', 'users', 'Manage users, view profiles, and control group memberships.')
ON CONFLICT (slug) DO NOTHING;

-- Add Management category (if it doesn't exist)
INSERT INTO public.s42_categories (name, sort_order)
VALUES ('Management', 1)
ON CONFLICT (name) DO NOTHING;

-- Add User Management to navigation menu
-- Note: This will fail if the menu item already exists
INSERT INTO public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
SELECT
  'User Management',
  'users',
  'internal',
  '/users',
  (SELECT id FROM public.s42_categories WHERE name = 'Management'),
  0,
  (SELECT id FROM public.s42_pages WHERE slug = 'users');

-- If you get a duplicate error, the menu item already exists