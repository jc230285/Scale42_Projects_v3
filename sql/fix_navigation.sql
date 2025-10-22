-- Update navigation to point to /users instead of /pages/users
UPDATE public.s42_menu_items
SET href = '/users'
WHERE href = '/pages/users' OR href = '/pages/users/';