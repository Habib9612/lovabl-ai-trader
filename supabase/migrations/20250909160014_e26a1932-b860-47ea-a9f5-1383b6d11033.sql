-- Insert sample assets for testing with correct asset types
INSERT INTO public.assets (symbol, name, asset_type, exchange, sector) 
VALUES 
  ('AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 'Technology'),
  ('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ', 'Technology'),
  ('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 'Technology'),
  ('TSLA', 'Tesla Inc.', 'stock', 'NASDAQ', 'Consumer Cyclical'),
  ('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ', 'Consumer Cyclical'),
  ('NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ', 'Technology'),
  ('META', 'Meta Platforms Inc.', 'stock', 'NASDAQ', 'Technology'),
  ('BTC', 'Bitcoin', 'crypto', 'Crypto', 'Cryptocurrency'),
  ('ETH', 'Ethereum', 'crypto', 'Crypto', 'Cryptocurrency'),
  ('EURUSD', 'Euro / US Dollar', 'forex', 'Forex', 'Currency'),
  ('GBPUSD', 'British Pound / US Dollar', 'forex', 'Forex', 'Currency'),
  ('USDJPY', 'US Dollar / Japanese Yen', 'forex', 'Forex', 'Currency'),
  ('GOLD', 'Gold Spot', 'commodity', 'COMEX', 'Commodities'),
  ('SILVER', 'Silver Spot', 'commodity', 'COMEX', 'Commodities'),
  ('OIL', 'Crude Oil WTI', 'commodity', 'NYMEX', 'Commodities')
ON CONFLICT (symbol) DO NOTHING;

-- Create function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_id_param UUID)
RETURNS TABLE(tier_name TEXT, max_portfolios INTEGER, max_signals_per_day INTEGER, ai_analysis_enabled BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.name,
    st.max_portfolios,
    st.max_signals_per_day,
    st.ai_analysis_enabled
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = user_id_param
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
$$;