-- Fix security definer functions to use security invoker with proper RLS
-- This addresses the security linter error about security definer views/functions

-- Drop and recreate get_user_subscription_tier with SECURITY INVOKER
DROP FUNCTION IF EXISTS public.get_user_subscription_tier(uuid);

CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_id_param uuid DEFAULT auth.uid())
 RETURNS TABLE(tier_name text, max_portfolios integer, max_signals_per_day integer, ai_analysis_enabled boolean)
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow users to query their own subscription or if they're authenticated
  IF user_id_param != auth.uid() AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Access denied: Cannot query other users subscription tiers';
  END IF;

  RETURN QUERY
  SELECT 
    st.name,
    st.max_portfolios,
    st.max_signals_per_day,
    st.ai_analysis_enabled
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = COALESCE(user_id_param, auth.uid())
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return free tier
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      st.name,
      st.max_portfolios,
      st.max_signals_per_day,
      st.ai_analysis_enabled
    FROM subscription_tiers st
    WHERE st.name = 'Free'
    LIMIT 1;
  END IF;
END;
$function$;

-- Drop and recreate get_public_signals with SECURITY INVOKER
DROP FUNCTION IF EXISTS public.get_public_signals(integer);

CREATE OR REPLACE FUNCTION public.get_public_signals(limit_count integer DEFAULT 50)
 RETURNS TABLE(id uuid, asset_symbol text, asset_name text, signal_type text, entry_price numeric, target_price numeric, stop_loss numeric, confidence_level integer, reasoning text, status text, followers_count integer, success_rate numeric, created_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This function returns public signals, so no additional auth check needed
  -- The RLS policies on the signals table will handle access control
  
  RETURN QUERY
  SELECT 
    s.id,
    a.symbol as asset_symbol,
    a.name as asset_name,
    s.signal_type,
    s.entry_price,
    s.target_price,
    s.stop_loss,
    s.confidence_level,
    s.reasoning,
    s.status,
    s.followers_count,
    s.success_rate,
    s.created_at,
    s.expires_at
  FROM public.signals s
  JOIN public.assets a ON s.asset_id = a.id
  WHERE s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$function$;