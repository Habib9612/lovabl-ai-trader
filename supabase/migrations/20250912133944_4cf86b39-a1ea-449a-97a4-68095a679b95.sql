-- Create AI training models table to store trained models and their performance
CREATE TABLE IF NOT EXISTS public.ai_training_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  strategy_name TEXT NOT NULL,
  strategy_type TEXT NOT NULL,
  accuracy DECIMAL(5,4),
  parameters JSONB,
  features TEXT[],
  performance_metrics JSONB,
  predictions JSONB,
  document_count INTEGER DEFAULT 0,
  training_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ai_training_models
ALTER TABLE public.ai_training_models ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_training_models
CREATE POLICY "Users can view their own training models"
ON public.ai_training_models
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training models"
ON public.ai_training_models
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training models"
ON public.ai_training_models
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training models"
ON public.ai_training_models
FOR DELETE
USING (auth.uid() = user_id);

-- Create training documents table to store uploaded training data
CREATE TABLE IF NOT EXISTS public.training_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  storage_path TEXT,
  content_summary TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on training_documents
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for training_documents
CREATE POLICY "Users can view their own training documents"
ON public.training_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training documents"
ON public.training_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training documents"
ON public.training_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training documents"
ON public.training_documents
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ai_training_models_user_id ON public.ai_training_models(user_id);
CREATE INDEX idx_ai_training_models_strategy_type ON public.ai_training_models(strategy_type);
CREATE INDEX idx_training_documents_user_id ON public.training_documents(user_id);
CREATE INDEX idx_training_documents_processed ON public.training_documents(processed);

-- Create trigger for updated_at columns
CREATE TRIGGER update_ai_training_models_updated_at
  BEFORE UPDATE ON public.ai_training_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_documents_updated_at
  BEFORE UPDATE ON public.training_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();