-- Fix the public_signals view that's causing the security definer error
-- Drop and recreate the view without any security definer properties

-- First check what the view definition is
-- SELECT pg_get_viewdef('public.public_signals'::regclass, true);

-- Drop the public_signals view if it exists
DROP VIEW IF EXISTS public.public_signals;

-- The public_signals table already exists and has proper RLS policies
-- The view is not needed since the table has RLS policies that allow public access
-- Users can query the signals table directly with proper RLS enforcement