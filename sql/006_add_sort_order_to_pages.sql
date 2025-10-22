-- Add sort_order column to s42_pages table
ALTER TABLE s42_pages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing pages with sort_order based on created_at timestamp
UPDATE s42_pages SET sort_order = EXTRACT(epoch FROM created_at)::INTEGER WHERE sort_order = 0 OR sort_order IS NULL;

-- Create index for better performance on sort_order queries
CREATE INDEX IF NOT EXISTS idx_s42_pages_sort_order ON s42_pages(sort_order);