-- Create demo trading tables
CREATE TABLE public.demo_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cash DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  initial_cash DECIMAL(15,2) NOT NULL DEFAULT 100000.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for demo_accounts
CREATE POLICY "Users can view their own demo account" 
ON public.demo_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own demo account" 
ON public.demo_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demo account" 
ON public.demo_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create demo positions table
CREATE TABLE public.demo_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.demo_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  avg_price DECIMAL(10,2) NOT NULL CHECK (avg_price > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.demo_positions ENABLE ROW LEVEL SECURITY;

-- Create policies for demo_positions
CREATE POLICY "Users can view their own demo positions" 
ON public.demo_positions 
FOR SELECT 
USING (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own demo positions" 
ON public.demo_positions 
FOR INSERT 
WITH CHECK (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own demo positions" 
ON public.demo_positions 
FOR UPDATE 
USING (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own demo positions" 
ON public.demo_positions 
FOR DELETE 
USING (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

-- Create demo orders table
CREATE TABLE public.demo_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.demo_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  status TEXT NOT NULL DEFAULT 'FILLED' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.demo_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for demo_orders
CREATE POLICY "Users can view their own demo orders" 
ON public.demo_orders 
FOR SELECT 
USING (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own demo orders" 
ON public.demo_orders 
FOR INSERT 
WITH CHECK (
  account_id IN (
    SELECT id FROM public.demo_accounts WHERE user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_demo_accounts_updated_at
  BEFORE UPDATE ON public.demo_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_positions_updated_at
  BEFORE UPDATE ON public.demo_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_demo_accounts_user_id ON public.demo_accounts(user_id);
CREATE INDEX idx_demo_positions_account_id ON public.demo_positions(account_id);
CREATE INDEX idx_demo_positions_symbol ON public.demo_positions(symbol);
CREATE INDEX idx_demo_orders_account_id ON public.demo_orders(account_id);
CREATE INDEX idx_demo_orders_created_at ON public.demo_orders(created_at DESC);