-- Enable authenticated inserts for assets and prevent duplicates
DO $$ BEGIN
  -- Ensure RLS is enabled (safe if already enabled)
  EXECUTE 'ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN others THEN NULL; END $$;

-- Create unique constraint on symbol to avoid duplicates (case-sensitive by default)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'assets_symbol_unique'
  ) THEN
    ALTER TABLE public.assets ADD CONSTRAINT assets_symbol_unique UNIQUE (symbol);
  END IF;
END $$;

-- RLS policy to allow authenticated users to insert assets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assets' AND policyname = 'Authenticated users can insert assets'
  ) THEN
    CREATE POLICY "Authenticated users can insert assets"
    ON public.assets
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Create trigger to auto-create default portfolio and watchlist whenever a profile is created
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_create_default_portfolio'
  ) THEN
    CREATE TRIGGER trigger_create_default_portfolio
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_portfolio();
  END IF;
END $$;

-- Backfill default portfolios for users who already have a profile but no portfolio
INSERT INTO public.portfolios (user_id, name, is_default, initial_balance, current_balance)
SELECT p.user_id, 'Main Portfolio', true, 10000.00, 10000.00
FROM public.profiles p
LEFT JOIN public.portfolios po ON po.user_id = p.user_id
WHERE po.id IS NULL;

-- Backfill default watchlists for users who already have a profile but no watchlist
INSERT INTO public.watchlists (user_id, name, is_default)
SELECT p.user_id, 'My Watchlist', true
FROM public.profiles p
LEFT JOIN public.watchlists w ON w.user_id = p.user_id
WHERE w.id IS NULL;