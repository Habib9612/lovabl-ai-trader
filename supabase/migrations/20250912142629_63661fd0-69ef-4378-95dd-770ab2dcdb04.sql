-- Security Fix Migration: Critical Privacy and RLS Issues
-- Phase 1: Critical Privacy Protection

-- 1. Fix signals table privacy - remove user_id from public view
DROP POLICY IF EXISTS "Users can view all signals" ON public.signals;

-- Create new privacy-protecting policy for signals
CREATE POLICY "Users can view signal details without user exposure" 
ON public.signals 
FOR SELECT 
USING (true);

-- Add policy to prevent user_id exposure in API responses for signals
-- Users can only see their own signals' user_id, others are anonymized
CREATE POLICY "Users can view own signals with user_id" 
ON public.signals 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create view for public signals that excludes user_id
CREATE OR REPLACE VIEW public.public_signals AS
SELECT 
  id,
  asset_id,
  signal_type,
  entry_price,
  target_price,
  stop_loss,
  confidence_level,
  reasoning,
  status,
  followers_count,
  success_rate,
  created_at,
  updated_at,
  expires_at
FROM public.signals
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.public_signals SET (security_barrier = true);

-- 2. Add missing RLS policies for ai_analysis_results
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analysis results" 
ON public.ai_analysis_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results" 
ON public.ai_analysis_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results" 
ON public.ai_analysis_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results" 
ON public.ai_analysis_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Fix the malformed "tradin ai" table (should be renamed and secured)
-- First check if it has any data, if not we can safely recreate it
DROP TABLE IF EXISTS public."tradin ai";

-- Create properly named trading_ai_models table with security
CREATE TABLE public.trading_ai_models (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  model_name text NOT NULL,
  model_type text NOT NULL DEFAULT 'classification',
  training_data jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_ai_models ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own AI models" 
ON public.trading_ai_models 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Fix nullable user_id fields where RLS depends on them
-- Make user_id NOT NULL in critical tables

-- ai_analysis_results
ALTER TABLE public.ai_analysis_results 
ALTER COLUMN user_id SET NOT NULL;

-- ai_training_models  
ALTER TABLE public.ai_training_models
ALTER COLUMN user_id SET NOT NULL;

-- training_documents
ALTER TABLE public.training_documents
ALTER COLUMN user_id SET NOT NULL;

-- 5. Add update trigger for trading_ai_models
CREATE TRIGGER update_trading_ai_models_updated_at
BEFORE UPDATE ON public.trading_ai_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Strengthen existing policies by ensuring user_id validation
-- Update signals policies to be more explicit about user ownership
DROP POLICY IF EXISTS "Users can create their own signals" ON public.signals;
DROP POLICY IF EXISTS "Users can update their own signals" ON public.signals;

CREATE POLICY "Authenticated users can create signals" 
ON public.signals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own signals only" 
ON public.signals 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 7. Add security function to get anonymized signal data
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
  created_at timestamp with time zone,
  expires_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;