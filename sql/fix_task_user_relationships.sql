-- Fix s42_tasks foreign keys to reference s42_users instead of auth.users
-- Lead: one-to-many (one lead per task)
-- Assignees: many-to-many (multiple assignees per task)

-- Step 1: Drop existing foreign key constraints
ALTER TABLE public.s42_tasks 
DROP CONSTRAINT IF EXISTS s42_tasks_assignee_id_fkey;

ALTER TABLE public.s42_tasks 
DROP CONSTRAINT IF EXISTS s42_tasks_lead_id_fkey;

-- Step 2: Update lead_id to reference s42_users (one-to-many)
ALTER TABLE public.s42_tasks
ADD CONSTRAINT s42_tasks_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES public.s42_users(id) ON DELETE SET NULL;

-- Step 3: Create junction table for task assignees (many-to-many)
CREATE TABLE IF NOT EXISTS public.s42_task_assignees (
  task_id uuid NOT NULL REFERENCES public.s42_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.s42_users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_s42_task_assignees_task ON public.s42_task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_s42_task_assignees_user ON public.s42_task_assignees(user_id);

-- Step 4: Migrate existing assignee_id data to junction table
-- (This will only work if assignee_id values exist in s42_users)
INSERT INTO public.s42_task_assignees (task_id, user_id)
SELECT id, assignee_id 
FROM public.s42_tasks 
WHERE assignee_id IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;

-- Step 5: Drop the old assignee_id column from s42_tasks
-- (Comment this out if you want to keep the old data temporarily)
ALTER TABLE public.s42_tasks 
DROP COLUMN IF EXISTS assignee_id;

-- Step 6: Grant permissions
GRANT ALL ON public.s42_task_assignees TO service_role;
GRANT ALL ON public.s42_task_assignees TO authenticated;

-- Step 7: Enable RLS on the junction table
ALTER TABLE public.s42_task_assignees ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for service_role to bypass RLS
CREATE POLICY "Service role can do anything with task assignees" 
ON public.s42_task_assignees
FOR ALL
USING (true)
WITH CHECK (true);

-- Add RLS policy for authenticated users to view assignees
CREATE POLICY "Users can view task assignees" 
ON public.s42_task_assignees
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add RLS policy for authenticated users to manage assignees
CREATE POLICY "Users can manage task assignees" 
ON public.s42_task_assignees
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
