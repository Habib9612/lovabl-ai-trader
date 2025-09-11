-- Create table for storing chart analysis results
CREATE TABLE public.chart_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  analysis_type TEXT DEFAULT 'comprehensive',
  chart_image_url TEXT,
  analysis_result JSONB NOT NULL,
  confidence_score INTEGER DEFAULT 0,
  trading_style TEXT,
  strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chart_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analysis results" 
ON public.chart_analysis_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results" 
ON public.chart_analysis_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results" 
ON public.chart_analysis_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results" 
ON public.chart_analysis_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chart_analysis_results_updated_at
BEFORE UPDATE ON public.chart_analysis_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for storing financial data cache
CREATE TABLE public.financial_data_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for financial data cache (public read access for efficiency)
ALTER TABLE public.financial_data_cache ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read cached financial data
CREATE POLICY "Financial data cache is readable by everyone" 
ON public.financial_data_cache 
FOR SELECT 
USING (true);

-- Only authenticated users can insert/update cache
CREATE POLICY "Authenticated users can manage financial cache" 
ON public.financial_data_cache 
FOR ALL
USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_financial_data_cache_symbol ON public.financial_data_cache(symbol);
CREATE INDEX idx_chart_analysis_results_user_id ON public.chart_analysis_results(user_id);
CREATE INDEX idx_chart_analysis_results_symbol ON public.chart_analysis_results(symbol);