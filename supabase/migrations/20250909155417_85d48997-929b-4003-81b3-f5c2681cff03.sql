-- Create additional database components for trading platform

-- Create user subscription tiers
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]',
  max_portfolios integer DEFAULT 1,
  max_signals_per_day integer DEFAULT 10,
  ai_analysis_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, features, max_portfolios, max_signals_per_day, ai_analysis_enabled)
VALUES 
  ('Free', 0, '["Basic charts", "Manual trading", "Community access"]', 1, 5, false),
  ('Pro', 29.99, '["Advanced charts", "AI signals", "Risk management", "Pattern recognition"]', 3, 50, true),
  ('Elite', 99.99, '["Unlimited features", "Custom strategies", "API access", "Priority support"]', 10, 500, true)
ON CONFLICT DO NOTHING;

-- Create user subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tier_id uuid NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_subscriptions_tier_id FOREIGN KEY (tier_id) REFERENCES public.subscription_tiers(id)
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create user_subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Create market data table for real-time prices
CREATE TABLE IF NOT EXISTS public.market_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid NOT NULL,
  price numeric NOT NULL,
  change_24h numeric DEFAULT 0,
  change_percentage_24h numeric DEFAULT 0,
  volume_24h numeric DEFAULT 0,
  market_cap numeric,
  high_24h numeric,
  low_24h numeric,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  source text DEFAULT 'finviz',
  CONSTRAINT fk_market_data_asset_id FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE
);

-- Create index for fast price lookups
CREATE INDEX IF NOT EXISTS idx_market_data_asset_timestamp ON public.market_data(asset_id, timestamp DESC);

-- Enable RLS on market_data (public read access)
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market data is viewable by everyone" ON public.market_data FOR SELECT USING (true);

-- Create trading strategies table
CREATE TABLE IF NOT EXISTS public.trading_strategies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  strategy_type text NOT NULL CHECK (strategy_type IN ('technical', 'fundamental', 'quantitative', 'ai_based')),
  parameters jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT false,
  performance_metrics jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_trading_strategies_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on trading_strategies
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own strategies" ON public.trading_strategies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public strategies" ON public.trading_strategies FOR SELECT USING (is_public = true);

-- Create trading alerts table
CREATE TABLE IF NOT EXISTS public.trading_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'volume_spike', 'technical_pattern')),
  target_value numeric NOT NULL,
  message text,
  is_triggered boolean DEFAULT false,
  is_active boolean DEFAULT true,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_trading_alerts_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_trading_alerts_asset_id FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE
);

-- Enable RLS on trading_alerts
ALTER TABLE public.trading_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own alerts" ON public.trading_alerts FOR ALL USING (auth.uid() = user_id);

-- Create news and analysis table
CREATE TABLE IF NOT EXISTS public.market_news (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  summary text,
  source text NOT NULL,
  author text,
  url text,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  importance text DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high')),
  related_assets uuid[],
  published_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on market_news (public read access)
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News is viewable by everyone" ON public.market_news FOR SELECT USING (true);

-- Create index for news queries
CREATE INDEX IF NOT EXISTS idx_market_news_published_at ON public.market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_related_assets ON public.market_news USING gin(related_assets);

-- Update profiles table with additional trading fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS risk_tolerance text DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS trading_capital numeric DEFAULT 0;