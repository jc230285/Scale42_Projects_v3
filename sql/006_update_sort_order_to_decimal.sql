-- Migration: Update sort_order column to support decimals
-- Run this after updating the schema

ALTER TABLE public.s42_tasks
ALTER COLUMN sort_order TYPE numeric(10,2)
USING sort_order::numeric(10,2);

-- Update the default value
ALTER TABLE public.s42_tasks
ALTER COLUMN sort_order SET DEFAULT 0.00;