-- Update navigation to use /users instead of /pages/users
UPDATE public.s42_menu_items
SET href = '/users'
WHERE href = '/pages/users';

-- Also update the page slug if it exists
UPDATE public.s42_pages
SET slug = 'users-direct'
WHERE slug = 'users';