import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BacktestParams {
  symbol: string;
  timeframe: string;
  strategy: string;
  params: Record<string, any>;
  start_date?: string;
  end_date?: string;
}

interface Backtest {
  id: string;
  user_id: string;
  symbol: string;
  params: any;
  status: string;
  result_url?: string;
  metrics?: any;
  correlation_id?: string;
  created_at: string;
  completed_at?: string;
  error_details?: any;
}

export const useBacktest = () => {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createBacktest = async (params: BacktestParams) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creating backtest with params:', params);
      
      const correlationId = crypto.randomUUID();
      
      const { data, error: supabaseError } = await supabase.functions.invoke('backtest-manager', {
        body: {
          ...params,
          symbol: params.symbol.toUpperCase()
        },
        headers: {
          'X-Correlation-Id': correlationId
        }
      });

      console.log('Backtest creation response:', { data, error: supabaseError });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create backtest');
      }

      toast({
        title: "Backtest Started",
        description: `Backtest job ${data.job_id} has been queued for ${params.symbol}`,
      });

      // Refresh backtest list
      fetchBacktests();
      
      return data.job_id;
    } catch (err) {
      console.error('Error creating backtest:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBacktests = async () => {
    try {
      console.log('Fetching user backtests...');
      
      const { data: backtestData, error } = await supabase
        .from('backtests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(error.message);
      }

      console.log('Backtests fetched:', backtestData);
      setBacktests((backtestData || []) as any);
    } catch (err) {
      console.error('Error fetching backtests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backtests');
    }
  };

  const getBacktest = async (jobId: string) => {
    try {
      console.log('Fetching backtest:', jobId);
      
      const { data, error: supabaseError } = await supabase.functions.invoke(`backtest-manager/${jobId}`, {
        method: 'GET'
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch backtest');
      }

      return data.data;
    } catch (err) {
      console.error('Error fetching backtest:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch backtest');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    backtests,
    loading,
    error,
    createBacktest,
    fetchBacktests,
    getBacktest,
    clearError
  };
};