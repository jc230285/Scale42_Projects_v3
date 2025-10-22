-- Add policies to allow service role and authenticated users to write to s42_users
-- This is needed for NextAuth signIn callback

-- Allow service role to insert/update users (for auth callback)
create policy s42_users_service_role on public.s42_users
for all using (true);

-- Allow reading categories/menu_items for navigation (service role)
create policy s42_categories_service_role on public.s42_categories
for select using (true);

create policy s42_menu_items_service_all on public.s42_menu_items
for all using (true);

create policy s42_pages_service_all on public.s42_pages
for all using (true);
