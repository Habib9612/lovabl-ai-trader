-- P0 Critical Fix: Clean up duplicate foreign keys and fix signal queries
-- Drop existing duplicate constraints
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_asset_id_fkey;
ALTER TABLE signal_followers DROP CONSTRAINT IF EXISTS signal_followers_signal_id_fkey;

-- Keep only the named constraints we created
-- Create backtests table for trading analysis  
CREATE TABLE IF NOT EXISTS backtests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued',
  result_url text,
  metrics jsonb DEFAULT '{}',
  correlation_id text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  error_details jsonb
);

-- Enable RLS on backtests
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- Create policies for backtests
CREATE POLICY "Users can manage their own backtests"
ON backtests FOR ALL
USING (auth.uid() = user_id);

-- Create API logs table for correlation tracking and debugging
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id text NOT NULL,
  user_id uuid,
  endpoint text NOT NULL,
  method text NOT NULL,
  params jsonb,
  response_status integer,
  response_body jsonb,
  error_details jsonb,
  provider_used text,
  execution_time_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on api_logs
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for api_logs - users can only see their own logs
CREATE POLICY "Users can view their own API logs"
ON api_logs FOR SELECT
USING (auth.uid() = user_id);

-- Admins can see all logs (for debugging)
CREATE POLICY "Service role can manage all API logs"
ON api_logs FOR ALL
USING (auth.role() = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_logs_correlation_id ON api_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_backtests_user_status ON backtests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_backtests_symbol ON backtests(symbol);

-- Update trigger for backtests
CREATE TRIGGER update_backtests_updated_at
  BEFORE UPDATE ON backtests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();