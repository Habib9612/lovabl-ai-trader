-- Final security cleanup to ensure no security definer objects remain
-- This is a comprehensive fix for any remaining security definer issues

-- Check and fix any remaining views or functions that might have security definer
-- Sometimes the linter can detect cached metadata

-- Ensure all our custom functions are properly set to SECURITY INVOKER
-- Recreate the update function to be explicit about security
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate the create_default_portfolio function with explicit security
DROP FUNCTION IF EXISTS public.create_default_portfolio();

CREATE OR REPLACE FUNCTION public.create_default_portfolio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.portfolios (user_id, name, is_default)
  VALUES (NEW.user_id, 'Main Portfolio', true);
  
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.user_id, 'My Watchlist', true);
  
  RETURN NEW;
END;
$function$;

-- Refresh the database statistics to ensure the linter sees the changes
ANALYZE;