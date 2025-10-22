-- Grant permissions to service role and authenticated users
-- This ensures the service role can bypass RLS

-- Grant all privileges on all s42_ tables to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select/insert/update/delete on s42_users to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.s42_users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.s42_user_groups TO authenticated;
GRANT SELECT ON public.s42_categories TO authenticated;
GRANT SELECT ON public.s42_menu_items TO authenticated;
GRANT SELECT ON public.s42_pages TO authenticated;

-- Make sure service_role can do everything
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
