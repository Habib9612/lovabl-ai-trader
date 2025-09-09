-- Create comprehensive database schema for trading platform

-- First, create user profiles with trading-specific fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  risk_tolerance text DEFAULT 'moderate'::text CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  experience_level text DEFAULT 'beginner'::text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  trading_capital numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_profiles_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

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
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Create comprehensive assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol text NOT NULL UNIQUE,
  name text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex', 'commodity', 'index', 'option', 'future')),
  exchange text,
  sector text,
  industry text,
  country text DEFAULT 'US',
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on assets (public read access)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assets are viewable by everyone" ON public.assets FOR SELECT USING (true);

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

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create default portfolio
  INSERT INTO public.portfolios (user_id, name, is_default)
  VALUES (NEW.id, 'Main Portfolio', true);
  
  -- Create default watchlist
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Watchlist', true);
  
  -- Assign free tier subscription
  INSERT INTO public.user_subscriptions (user_id, tier_id)
  SELECT NEW.id, id FROM public.subscription_tiers WHERE name = 'Free' LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();