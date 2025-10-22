-- 005_s42_users.sql
-- Create user profile table and bootstrap trigger from auth.users

create table if not exists public.s42_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  prefs jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.s42_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 's42_users' and policyname = 's42_users_select_self'
  ) then
    execute 'create policy s42_users_select_self on public.s42_users for select using (id = auth.uid())';
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 's42_users' and policyname = 's42_users_update_self'
  ) then
    execute 'create policy s42_users_update_self on public.s42_users for update using (id = auth.uid()) with check (id = auth.uid())';
  end if;
end$$;

create or replace function public.s42_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = "public"
as $$
begin
  insert into public.s42_users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists s42_handle_new_auth_user on auth.users;

create trigger s42_handle_new_auth_user
after insert on auth.users
for each row execute function public.s42_handle_new_auth_user();
