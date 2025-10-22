-- Add FEL stage column to s42_tasks table
ALTER TABLE public.s42_tasks
ADD COLUMN IF NOT EXISTS fel_stage integer DEFAULT 0;