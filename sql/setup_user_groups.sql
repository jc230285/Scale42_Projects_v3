-- Add user to groups and set up page access
-- Run this in Supabase SQL Editor

-- First, get the user ID for james@scale-42.com
-- Add james@scale-42.com to the Scale-42 group
INSERT INTO public.s42_user_groups (user_id, group_id, role)
SELECT u.id, g.id, 'member'
FROM public.s42_users u
CROSS JOIN public.s42_groups g
WHERE u.email = 'james@scale-42.com' AND g.name = 'Scale-42'
ON CONFLICT (user_id, group_id) DO NOTHING;

-- Also add to Admin group for full access
INSERT INTO public.s42_user_groups (user_id, group_id, role)
SELECT u.id, g.id, 'admin'
FROM public.s42_users u
CROSS JOIN public.s42_groups g
WHERE u.email = 'james@scale-42.com' AND g.name = 'Admin'
ON CONFLICT (user_id, group_id) DO NOTHING;

-- Give Scale-42 group access to all pages
INSERT INTO public.s42_page_groups (page_id, group_id)
SELECT p.id, g.id
FROM public.s42_pages p
CROSS JOIN public.s42_groups g
WHERE g.name = 'Scale-42'
ON CONFLICT (page_id, group_id) DO NOTHING;

-- Also give Admin group access to all pages
INSERT INTO public.s42_page_groups (page_id, group_id)
SELECT p.id, g.id
FROM public.s42_pages p
CROSS JOIN public.s42_groups g
WHERE g.name = 'Admin'
ON CONFLICT (page_id, group_id) DO NOTHING;

-- Verify the setup
SELECT 'User-Group Relationships:' as info;
SELECT u.email, g.name, ug.role
FROM public.s42_user_groups ug
JOIN public.s42_users u ON ug.user_id = u.id
JOIN public.s42_groups g ON ug.group_id = g.id;

SELECT 'Page Access:' as info;
SELECT p.title, g.name
FROM public.s42_page_groups pg
JOIN public.s42_pages p ON pg.page_id = p.id
JOIN public.s42_groups g ON pg.group_id = g.id
ORDER BY p.title, g.name;