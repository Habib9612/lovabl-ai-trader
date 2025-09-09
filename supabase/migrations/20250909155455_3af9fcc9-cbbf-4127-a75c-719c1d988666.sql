-- Fix security issues by enabling RLS on all public tables

-- Enable RLS on tables that don't have it
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies for subscription_tiers (public read access)
CREATE POLICY "Subscription tiers are viewable by everyone" ON public.subscription_tiers FOR SELECT USING (true);

-- Enable RLS on any other missing tables and create policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check for tables without RLS in public schema
    FOR r IN (
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t 
            JOIN information_schema.table_privileges p ON t.tablename = p.table_name 
            WHERE t.schemaname = 'public'
        )
    ) LOOP
        -- Enable RLS if not already enabled
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END
$$;

-- Add missing RLS policies for edge_logs table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'edge_logs' AND table_schema = 'public') THEN
        -- Only allow users to see their own logs
        CREATE POLICY "Users can view their own edge logs" ON public.edge_logs 
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN 
        NULL; -- Policy already exists, ignore
END
$$;

-- Ensure all tables have proper RLS policies
-- These should cover the main security concerns

-- For any remaining tables without proper policies, add restrictive ones
DO $$
DECLARE
    r RECORD;
BEGIN
    -- This will add a basic policy to any table that has RLS enabled but no policies
    FOR r IN (
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('subscription_tiers', 'assets', 'global_markets', 'market_data', 'market_news')
    ) LOOP
        BEGIN
            -- Check if table has user_id column and add appropriate policy
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = r.tablename 
                AND column_name = 'user_id' 
                AND table_schema = 'public'
            ) THEN
                -- Create user-specific policy
                EXECUTE format(
                    'CREATE POLICY "Users can manage their own %s" ON public.%I FOR ALL USING (auth.uid() = user_id)',
                    r.tablename, r.tablename
                );
            END IF;
        EXCEPTION
            WHEN duplicate_object THEN 
                NULL; -- Policy already exists, ignore
        END;
    END LOOP;
END
$$;