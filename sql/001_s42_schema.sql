
-- 001_s42_schema.sql
-- Core schema for S42 Boilerplate (all tables prefixed with s42_)

-- Groups & Memberships
create table if not exists public.s42_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text generated always as (replace(lower(name),' ','-')) stored,
  type text not null default 'custom', -- 'domain' | 'custom'
  domain text unique null,
  created_at timestamptz default now()
);

-- Users (linked to auth.users) - CREATE BEFORE s42_user_groups
create table if not exists public.s42_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text null,
  avatar_url text null,
  prefs jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint s42_users_email_key unique (email)
);

create table if not exists public.s42_user_groups (
  user_id uuid references s42_users(id) on delete cascade,
  group_id uuid references public.s42_groups(id) on delete cascade,
  role text default 'member',
  primary key (user_id, group_id)
);

-- Pages & Menu
create table if not exists public.s42_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.s42_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category_id uuid references public.s42_categories(id) on delete set null,
  content_mdx text default '',
  is_internal boolean default true,
  created_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.s42_menu_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text,
  href_type text not null default 'internal', -- 'internal' | 'external'
  href text not null,
  category_id uuid references public.s42_categories(id) on delete set null,
  sort_order int not null default 0,
  page_id uuid references public.s42_pages(id) on delete set null
);

create table if not exists public.s42_page_groups (
  page_id uuid references public.s42_pages(id) on delete cascade,
  group_id uuid references public.s42_groups(id) on delete cascade,
  primary key(page_id, group_id)
);

-- Projects & ACL
create table if not exists public.s42_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_key text unique not null,
  owner_id uuid references auth.users(id),
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.s42_project_groups (
  project_id uuid references public.s42_projects(id) on delete cascade,
  group_id uuid references public.s42_groups(id) on delete cascade,
  primary key(project_id, group_id)
);

-- Tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('todo','in_progress','blocked','done');
  END IF;
END$$;


create table if not exists public.s42_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.s42_projects(id) on delete cascade,
  title text not null,
  status task_status not null default 'todo',
  assignee_id uuid references auth.users(id),
  due_date date,
  fields jsonb default '{}'::jsonb,
  sort_order numeric(10,2) default 0,
  fel_stage int default 0,
  task_type task_type,
  task_topic task_topic,
  budget numeric(10,2),
  start_date timestamptz,
  end_date timestamptz,
  lead_id uuid references auth.users(id),
  notes text,
  third_party text,
  created_at timestamptz default now()
);

-- Task Templates (JSON-defined)
create table if not exists public.s42_task_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null, -- e.g., S42_SITE_DEV_V1
  version int not null default 1,
  template jsonb not null,   -- JSON schema containing variables, tasks, checklists, roles, dropdowns
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Checklist items
create table if not exists public.s42_task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.s42_tasks(id) on delete cascade,
  name text not null,
  checked boolean default false,
  signed_off_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Comments
create table if not exists public.s42_task_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.s42_projects(id) on delete cascade,
  task_id uuid references public.s42_tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  created_at timestamptz default now()
);

-- Create enum types for task fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE task_type AS ENUM ('Application','Decision Gate','Design','Investigation','Negotiations','Permit','Presentation','Report','Study','Travel','Work Package');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_topic') THEN
    CREATE TYPE task_topic AS ENUM ('Cooling','Design','ESG','Fibre','Heat Reuse','Land','Local Engagement','Organisation','Other','Power','Restrictions','Studies','Travel','Zoning & Permit');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_level') THEN
    CREATE TYPE log_level AS ENUM ('debug','info','warning','error');
  END IF;
END$$;

create table if not exists public.s42_logs (
  id bigint generated by default as identity primary key,
  ts timestamptz default now(),
  category text,   -- e.g., 'ui','auth','task','system','project update','task update'
  page text,
  user_id uuid references auth.users(id),
  level log_level not null,
  task_name text,
  field text,
  update_value jsonb,
  error text
);

-- Convenience indexes
create index if not exists idx_s42_pages_slug on public.s42_pages(slug);
create index if not exists idx_s42_menu_items_order on public.s42_menu_items(sort_order);
create index if not exists idx_s42_categories_order on public.s42_categories(sort_order);
create index if not exists idx_s42_tasks_proj on public.s42_tasks(project_id, status, sort_order);
create index if not exists idx_s42_logs_ts on public.s42_logs(ts);
