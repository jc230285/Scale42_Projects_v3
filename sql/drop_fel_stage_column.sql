-- Drop the fel_stage column from s42_tasks table
-- This column is no longer needed in the application

ALTER TABLE public.s42_tasks 
DROP COLUMN IF EXISTS fel_stage;

-- Note: This will permanently delete the fel_stage data
-- Make sure to backup your data before running this script if needed
