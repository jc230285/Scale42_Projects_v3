-- Add all navigation pages and menu items
-- Run this in Supabase SQL Editor

-- First, ensure all categories exist
INSERT INTO public.s42_categories (name, sort_order) VALUES
  ('home', 0),
  ('projects', 1),
  ('management', 2),
  ('personal', 3),
  ('financial', 4),
  ('tools', 5),
  ('hoyanger', 6),
  ('debug', 7)
ON CONFLICT (name) DO NOTHING;

-- Add all pages
INSERT INTO public.s42_pages (title, slug, content_mdx, category_id) VALUES
  ('Dashboard', 'dashboard', 'Main dashboard overview', (SELECT id FROM public.s42_categories WHERE name = 'home')),
  ('Projects', 'projects', 'Project management and overview', (SELECT id FROM public.s42_categories WHERE name = 'projects')),
  ('Tasks', 'tasks', 'Task management and tracking', (SELECT id FROM public.s42_categories WHERE name = 'projects')),
  ('Map', 'map', 'Interactive map view', (SELECT id FROM public.s42_categories WHERE name = 'projects')),
  ('Schema', 'schema', 'Database schema and documentation', (SELECT id FROM public.s42_categories WHERE name = 'projects')),
  ('Calendar', 'calendar', 'Calendar and scheduling', (SELECT id FROM public.s42_categories WHERE name = 'home')),
  ('Accounts', 'accounts', 'Account management', (SELECT id FROM public.s42_categories WHERE name = 'financial')),
  ('Receipts', 'receipts', 'Receipt management', (SELECT id FROM public.s42_categories WHERE name = 'financial')),
  ('Hoyanger', 'hoyanger', 'Hoyanger specific content', (SELECT id FROM public.s42_categories WHERE name = 'hoyanger')),
  ('Users', 'users', 'User management', (SELECT id FROM public.s42_categories WHERE name = 'management')),
  ('Groups', 'groups', 'Group management', (SELECT id FROM public.s42_categories WHERE name = 'management')),
  ('Pages', 'pages', 'Page management', (SELECT id FROM public.s42_categories WHERE name = 'management')),
  ('Profile', 'profile', 'User profile settings', (SELECT id FROM public.s42_categories WHERE name = 'personal')),
  ('Settings', 'settings', 'Application settings', (SELECT id FROM public.s42_categories WHERE name = 'personal')),
  ('Debug', 'debug', 'Debug and development tools', (SELECT id FROM public.s42_categories WHERE name = 'debug'))
ON CONFLICT (slug) DO NOTHING;

-- Add all menu items
INSERT INTO public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id) VALUES
  ('Dashboard', 'home', 'internal', '/dashboard', (SELECT id FROM public.s42_categories WHERE name = 'home'), 0, (SELECT id FROM public.s42_pages WHERE slug = 'dashboard')),
  ('Calendar', 'clipboard-list', 'internal', '/calendar', (SELECT id FROM public.s42_categories WHERE name = 'home'), 1, (SELECT id FROM public.s42_pages WHERE slug = 'calendar')),
  ('Projects', 'briefcase', 'internal', '/projects', (SELECT id FROM public.s42_categories WHERE name = 'projects'), 2, (SELECT id FROM public.s42_pages WHERE slug = 'projects')),
  ('Tasks', 'check-circle', 'internal', '/tasks', (SELECT id FROM public.s42_categories WHERE name = 'projects'), 3, (SELECT id FROM public.s42_pages WHERE slug = 'tasks')),
  ('Map', 'book', 'internal', '/map', (SELECT id FROM public.s42_categories WHERE name = 'projects'), 4, (SELECT id FROM public.s42_pages WHERE slug = 'map')),
  ('Schema', 'settings', 'internal', '/schema', (SELECT id FROM public.s42_categories WHERE name = 'projects'), 5, (SELECT id FROM public.s42_pages WHERE slug = 'schema')),
  ('Hoyanger', 'file-text', 'internal', '/hoyanger', (SELECT id FROM public.s42_categories WHERE name = 'hoyanger'), 6, (SELECT id FROM public.s42_pages WHERE slug = 'hoyanger')),
  ('Accounts', 'users', 'internal', '/accounts', (SELECT id FROM public.s42_categories WHERE name = 'financial'), 7, (SELECT id FROM public.s42_pages WHERE slug = 'accounts')),
  ('Receipts', 'tag', 'internal', '/receipts', (SELECT id FROM public.s42_categories WHERE name = 'financial'), 8, (SELECT id FROM public.s42_pages WHERE slug = 'receipts')),
  ('Drive', 'briefcase', 'external', 'https://drive.google.com/drive/recent', (SELECT id FROM public.s42_categories WHERE name = 'tools'), 9, NULL),
  ('N8N', 'settings', 'external', 'https://n8n.edbmotte.com/home/workflows', (SELECT id FROM public.s42_categories WHERE name = 'tools'), 10, NULL),
  ('NocoDb', 'chart-bar', 'external', 'https://nocodb.edbmotte.com/dashboard/#/nc/pjqgy4ri85jks06/mmqclkrvx9lbtpc/vwfmb7b2b1o06517/landplots', (SELECT id FROM public.s42_categories WHERE name = 'tools'), 11, NULL),
  ('Notion', 'book', 'external', 'https://www.notion.so/ce8899a8c1714c4a856b3ef773fc59f6?v=2802fed9527580159d2c000c810d0ec8', (SELECT id FROM public.s42_categories WHERE name = 'tools'), 12, NULL),
  ('Users', 'users', 'internal', '/users', (SELECT id FROM public.s42_categories WHERE name = 'management'), 13, (SELECT id FROM public.s42_pages WHERE slug = 'users')),
  ('Groups', 'tag', 'internal', '/groups', (SELECT id FROM public.s42_categories WHERE name = 'management'), 14, (SELECT id FROM public.s42_pages WHERE slug = 'groups')),
  ('Pages', 'file-text', 'internal', '/pages', (SELECT id FROM public.s42_categories WHERE name = 'management'), 15, (SELECT id FROM public.s42_pages WHERE slug = 'pages')),
  ('Profile', 'user', 'internal', '/profile', (SELECT id FROM public.s42_categories WHERE name = 'personal'), 16, (SELECT id FROM public.s42_pages WHERE slug = 'profile')),
  ('Settings', 'settings', 'internal', '/settings', (SELECT id FROM public.s42_categories WHERE name = 'personal'), 17, (SELECT id FROM public.s42_pages WHERE slug = 'settings')),
  ('Debug', 'info', 'internal', '/debug', (SELECT id FROM public.s42_categories WHERE name = 'debug'), 18, (SELECT id FROM public.s42_pages WHERE slug = 'debug'))
ON CONFLICT (category_id, href) DO NOTHING;

-- Note: This script can be run multiple times safely
-- ON CONFLICT clauses prevent duplicates for categories, pages, and menu items