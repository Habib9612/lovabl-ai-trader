-- Create signals table
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  entry_price NUMERIC NOT NULL,
  target_price NUMERIC,
  stop_loss NUMERIC,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  followers_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signal followers table
CREATE TABLE public.signal_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID NOT NULL,
  follower_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(signal_id, follower_id)
);

-- Create pattern recognition results table
CREATE TABLE public.pattern_recognition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  price_data JSONB NOT NULL,
  timeframe TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prediction TEXT,
  accuracy_score NUMERIC
);

-- Create community messages table
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'signal', 'analysis', 'question')),
  asset_id UUID,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  parent_message_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create education courses table
CREATE TABLE public.education_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in minutes
  category TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user course progress table
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_lessons JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Create risk management rules table
CREATE TABLE public.risk_management_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id UUID NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('position_size', 'stop_loss', 'daily_loss_limit', 'sector_allocation')),
  rule_value NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create global markets data table
CREATE TABLE public.global_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  market_type TEXT NOT NULL CHECK (market_type IN ('forex', 'commodities', 'index', 'crypto')),
  current_price NUMERIC,
  change_24h NUMERIC,
  change_percentage_24h NUMERIC,
  volume_24h NUMERIC,
  market_cap NUMERIC,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Enable RLS on all tables
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_management_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_markets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for signals
CREATE POLICY "Users can view all signals" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Users can create their own signals" ON public.signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own signals" ON public.signals FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for signal followers
CREATE POLICY "Users can view signal followers" ON public.signal_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow signals" ON public.signal_followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow signals" ON public.signal_followers FOR DELETE USING (auth.uid() = follower_id);

-- Create RLS policies for pattern recognition
CREATE POLICY "Pattern recognition is viewable by everyone" ON public.pattern_recognition FOR SELECT USING (true);

-- Create RLS policies for community messages
CREATE POLICY "Users can view all community messages" ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Users can create their own messages" ON public.community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.community_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.community_messages FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for education courses
CREATE POLICY "Published courses are viewable by everyone" ON public.education_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create courses" ON public.education_courses FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own courses" ON public.education_courses FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for user course progress
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for risk management
CREATE POLICY "Users can view their own risk rules" ON public.risk_management_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own risk rules" ON public.risk_management_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own risk rules" ON public.risk_management_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own risk rules" ON public.risk_management_rules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for global markets
CREATE POLICY "Global markets are viewable by everyone" ON public.global_markets FOR SELECT USING (true);

-- Add foreign key constraints
ALTER TABLE public.signals ADD CONSTRAINT signals_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);
ALTER TABLE public.signal_followers ADD CONSTRAINT signal_followers_signal_id_fkey FOREIGN KEY (signal_id) REFERENCES public.signals(id) ON DELETE CASCADE;
ALTER TABLE public.pattern_recognition ADD CONSTRAINT pattern_recognition_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);
ALTER TABLE public.community_messages ADD CONSTRAINT community_messages_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id);
ALTER TABLE public.community_messages ADD CONSTRAINT community_messages_parent_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.community_messages(id) ON DELETE CASCADE;
ALTER TABLE public.user_course_progress ADD CONSTRAINT user_course_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.education_courses(id) ON DELETE CASCADE;
ALTER TABLE public.risk_management_rules ADD CONSTRAINT risk_management_rules_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

-- Create triggers for updated_at columns
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON public.signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_messages_updated_at BEFORE UPDATE ON public.community_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_education_courses_updated_at BEFORE UPDATE ON public.education_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risk_management_rules_updated_at BEFORE UPDATE ON public.risk_management_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample global markets data
INSERT INTO public.global_markets (symbol, name, market_type, current_price, change_24h, change_percentage_24h) VALUES
('EUR/USD', 'Euro / US Dollar', 'forex', 1.0850, 0.0025, 0.23),
('GBP/USD', 'British Pound / US Dollar', 'forex', 1.2720, -0.0045, -0.35),
('USD/JPY', 'US Dollar / Japanese Yen', 'forex', 149.50, 0.75, 0.50),
('GOLD', 'Gold Spot', 'commodities', 2045.50, 12.30, 0.61),
('SILVER', 'Silver Spot', 'commodities', 24.75, -0.35, -1.39),
('OIL_WTI', 'Crude Oil WTI', 'commodities', 78.25, 1.15, 1.49),
('SPX', 'S&P 500 Index', 'index', 4750.25, 25.75, 0.55),
('NASDAQ', 'NASDAQ Composite', 'index', 15250.80, 85.20, 0.56),
('DAX', 'DAX Performance Index', 'index', 16180.50, -45.25, -0.28);

-- Insert sample education courses
INSERT INTO public.education_courses (title, description, content, difficulty_level, estimated_duration, category, is_published) VALUES
(
  'Introduction to Technical Analysis',
  'Learn the fundamentals of technical analysis including chart patterns, indicators, and trend analysis.',
  '{
    "lessons": [
      {"title": "Understanding Price Charts", "duration": 15, "content": "Learn how to read candlestick and bar charts"},
      {"title": "Support and Resistance", "duration": 20, "content": "Identify key price levels that act as barriers"},
      {"title": "Trend Analysis", "duration": 25, "content": "Understand how to identify and follow market trends"},
      {"title": "Chart Patterns", "duration": 30, "content": "Recognize common reversal and continuation patterns"}
    ]
  }',
  'beginner',
  90,
  'Technical Analysis',
  true
),
(
  'Risk Management Essentials',
  'Master the art of managing risk in your trading to protect your capital and maximize profits.',
  '{
    "lessons": [
      {"title": "Position Sizing", "duration": 20, "content": "Learn how to determine appropriate position sizes"},
      {"title": "Stop Loss Strategies", "duration": 25, "content": "Different approaches to setting and managing stop losses"},
      {"title": "Risk-Reward Ratios", "duration": 15, "content": "Understanding and calculating risk-reward ratios"},
      {"title": "Portfolio Diversification", "duration": 30, "content": "Spreading risk across different assets and markets"}
    ]
  }',
  'intermediate',
  90,
  'Risk Management',
  true
),
(
  'Advanced Options Trading',
  'Explore sophisticated options strategies for experienced traders looking to enhance their toolkit.',
  '{
    "lessons": [
      {"title": "Options Greeks", "duration": 35, "content": "Understanding Delta, Gamma, Theta, and Vega"},
      {"title": "Volatility Trading", "duration": 40, "content": "How to trade based on implied and historical volatility"},
      {"title": "Complex Spreads", "duration": 45, "content": "Iron condors, butterflies, and calendar spreads"},
      {"title": "Risk Management for Options", "duration": 30, "content": "Special considerations for options trading"}
    ]
  }',
  'advanced',
  150,
  'Options Trading',
  true
);