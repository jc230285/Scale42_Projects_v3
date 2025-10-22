-- Fix unique constraints for ON CONFLICT to work
-- Run this in Supabase SQL Editor BEFORE running add_all_navigation_pages.sql

-- Add unique constraint on s42_categories.name
ALTER TABLE public.s42_categories
ADD CONSTRAINT s42_categories_name_key UNIQUE (name);

-- Add unique constraint on s42_menu_items (category_id, href) to prevent duplicate menu items
ALTER TABLE public.s42_menu_items
ADD CONSTRAINT s42_menu_items_category_href_key UNIQUE (category_id, href);