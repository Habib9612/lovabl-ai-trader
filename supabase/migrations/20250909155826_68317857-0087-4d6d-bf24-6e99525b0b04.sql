-- Insert sample assets for testing
INSERT INTO public.assets (symbol, name, asset_type, exchange, sector, industry, country) 
VALUES 
  ('AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 'Technology', 'Consumer Electronics', 'US'),
  ('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ', 'Technology', 'Internet Software & Services', 'US'),
  ('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 'Technology', 'Software', 'US'),
  ('TSLA', 'Tesla Inc.', 'stock', 'NASDAQ', 'Consumer Cyclical', 'Auto Manufacturers', 'US'),
  ('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ', 'Consumer Cyclical', 'Internet Retail', 'US'),
  ('NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ', 'Technology', 'Semiconductors', 'US'),
  ('META', 'Meta Platforms Inc.', 'stock', 'NASDAQ', 'Technology', 'Internet Software & Services', 'US'),
  ('BTC', 'Bitcoin', 'crypto', 'Crypto', 'Cryptocurrency', 'Digital Currency', 'Global'),
  ('ETH', 'Ethereum', 'crypto', 'Crypto', 'Cryptocurrency', 'Smart Contracts', 'Global'),
  ('SPY', 'SPDR S&P 500 ETF', 'index', 'NYSE', 'Index', 'Broad Market ETF', 'US'),
  ('QQQ', 'Invesco QQQ Trust', 'index', 'NASDAQ', 'Index', 'Technology ETF', 'US'),
  ('EUR/USD', 'Euro / US Dollar', 'forex', 'Forex', 'Currency', 'Major Pair', 'Global'),
  ('GBP/USD', 'British Pound / US Dollar', 'forex', 'Forex', 'Currency', 'Major Pair', 'Global'),
  ('USD/JPY', 'US Dollar / Japanese Yen', 'forex', 'Forex', 'Currency', 'Major Pair', 'Global'),
  ('GOLD', 'Gold Spot', 'commodity', 'COMEX', 'Commodities', 'Precious Metals', 'Global'),
  ('SILVER', 'Silver Spot', 'commodity', 'COMEX', 'Commodities', 'Precious Metals', 'Global'),
  ('OIL_WTI', 'Crude Oil WTI', 'commodity', 'NYMEX', 'Commodities', 'Energy', 'Global')
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample market data for testing
INSERT INTO public.market_data (asset_id, price, change_24h, change_percentage_24h, volume_24h, market_cap, high_24h, low_24h)
SELECT 
  a.id,
  CASE 
    WHEN a.symbol = 'AAPL' THEN 190.50
    WHEN a.symbol = 'GOOGL' THEN 150.25
    WHEN a.symbol = 'MSFT' THEN 415.75
    WHEN a.symbol = 'TSLA' THEN 245.80
    WHEN a.symbol = 'AMZN' THEN 155.30
    WHEN a.symbol = 'NVDA' THEN 875.25
    WHEN a.symbol = 'META' THEN 485.60
    WHEN a.symbol = 'BTC' THEN 67500.00
    WHEN a.symbol = 'ETH' THEN 3750.00
    WHEN a.symbol = 'SPY' THEN 550.25
    WHEN a.symbol = 'QQQ' THEN 485.30
    ELSE 100.00
  END as price,
  (RANDOM() - 0.5) * 10 as change_24h,
  (RANDOM() - 0.5) * 5 as change_percentage_24h,
  FLOOR(RANDOM() * 100000000) as volume_24h,
  CASE 
    WHEN a.asset_type = 'stock' THEN FLOOR(RANDOM() * 1000000000000)
    WHEN a.asset_type = 'crypto' THEN FLOOR(RANDOM() * 500000000000)
    ELSE NULL
  END as market_cap,
  CASE 
    WHEN a.symbol = 'AAPL' THEN 195.30
    WHEN a.symbol = 'GOOGL' THEN 155.75
    WHEN a.symbol = 'MSFT' THEN 420.25
    ELSE 105.00
  END as high_24h,
  CASE 
    WHEN a.symbol = 'AAPL' THEN 185.20
    WHEN a.symbol = 'GOOGL' THEN 145.50
    WHEN a.symbol = 'MSFT' THEN 410.30
    ELSE 95.00
  END as low_24h
FROM public.assets a
WHERE a.is_active = true;

-- Insert sample news articles
INSERT INTO public.market_news (title, content, summary, source, author, sentiment, importance, published_at)
VALUES 
  ('Tech Stocks Rally on AI Optimism', 'Technology stocks surged today as investors showed renewed optimism about artificial intelligence developments...', 'Major tech companies see gains amid AI enthusiasm', 'Financial Times', 'Sarah Johnson', 'positive', 'high', NOW() - INTERVAL '2 hours'),
  ('Federal Reserve Signals Potential Rate Cuts', 'The Federal Reserve indicated in its latest statement that rate cuts may be on the horizon...', 'Fed hints at dovish monetary policy ahead', 'Reuters', 'Michael Chen', 'positive', 'high', NOW() - INTERVAL '4 hours'),
  ('Oil Prices Drop on Supply Concerns', 'Crude oil prices fell sharply in trading today as supply concerns weigh on the market...', 'Energy sector faces headwinds from oversupply', 'Bloomberg', 'Emma Rodriguez', 'negative', 'medium', NOW() - INTERVAL '6 hours'),
  ('Cryptocurrency Market Shows Signs of Recovery', 'Bitcoin and other major cryptocurrencies posted gains as institutional adoption continues...', 'Digital assets rebound on institutional interest', 'CoinDesk', 'Alex Thompson', 'positive', 'medium', NOW() - INTERVAL '8 hours'),
  ('Global Markets Mixed Amid Economic Uncertainty', 'International markets showed mixed performance as traders weigh economic indicators...', 'Mixed signals from global economic data', 'Wall Street Journal', 'David Kim', 'neutral', 'medium', NOW() - INTERVAL '12 hours');

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
END;
$$;