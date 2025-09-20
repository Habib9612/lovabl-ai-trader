-- 1) Remove public SELECT on signals to prevent user_id exposure
DROP POLICY IF EXISTS "Users can view signal details without user exposure" ON public.signals;

-- 2) Recreate get_public_signals as SECURITY DEFINER to bypass RLS safely while returning no user identifiers
CREATE OR REPLACE FUNCTION public.get_public_signals(limit_count integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  asset_symbol text,
  asset_name text,
  signal_type text,
  entry_price numeric,
  target_price numeric,
  stop_loss numeric,
  confidence_level integer,
  reasoning text,
  status text,
  followers_count integer,
  success_rate numeric,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
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

-- 3) Create get_followed_signals to allow users to view signals they follow without exposing creators' user_id
CREATE OR REPLACE FUNCTION public.get_followed_signals(limit_count integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  asset_symbol text,
  asset_name text,
  signal_type text,
  entry_price numeric,
  target_price numeric,
  stop_loss numeric,
  confidence_level integer,
  reasoning text,
  status text,
  followers_count integer,
  success_rate numeric,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
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
  JOIN public.signal_followers f ON f.signal_id = s.id
  WHERE f.follower_id = auth.uid()
  ORDER BY f.followed_at DESC, s.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Notes:
-- - SECURITY DEFINER ensures RLS on signals doesn't block the curated public/followed views
-- - auth.uid() remains the calling user's id even in definer functions
-- - Neither function returns user_id or other sensitive identifiers