-- Migration: Add new task columns
-- Run this to add the new fields to existing s42_tasks table

-- Add enum types if they don't exist
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

-- Add new columns to s42_tasks table
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS task_type task_type;
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS task_topic task_topic;
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS budget numeric(10,2);
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS start_date timestamptz;
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES auth.users(id);
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.s42_tasks ADD COLUMN IF NOT EXISTS third_party text;