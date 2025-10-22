-- Drop existing s42_ tables to resolve mismatches
-- Run this in Supabase SQL Editor before running the create schema

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.s42_logs CASCADE;
DROP TABLE IF EXISTS public.s42_task_comments CASCADE;
DROP TABLE IF EXISTS public.s42_task_checklist CASCADE;
DROP TABLE IF EXISTS public.s42_tasks CASCADE;
DROP TABLE IF EXISTS public.s42_project_groups CASCADE;
DROP TABLE IF EXISTS public.s42_projects CASCADE;
DROP TABLE IF EXISTS public.s42_menu_item_groups CASCADE;
DROP TABLE IF EXISTS public.s42_menu_items CASCADE;
DROP TABLE IF EXISTS public.s42_pages CASCADE;
DROP TABLE IF EXISTS public.s42_categories CASCADE;
DROP TABLE IF EXISTS public.s42_user_groups CASCADE;
DROP TABLE IF EXISTS public.s42_users CASCADE;
DROP TABLE IF EXISTS public.s42_groups CASCADE;
DROP TABLE IF EXISTS public.s42_task_templates CASCADE;

-- Drop enums
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS log_level CASCADE;

-- Now run sql/001_s42_schema.sql to recreate them