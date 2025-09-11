import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: string;
  pe: string;
  eps: string;
  price: string;
  change: string;
  changesPercentage: string;
  volume: string;
  avgVolume: string;
  previousClose: string;
  dayLow: string;
  dayHigh: string;
  yearHigh: string;
  yearLow: string;
  priceToBook: string;
  debtToEquity: string;
  returnOnEquity: string;
  returnOnAssets: string;
  description: string;
}

export const useFinancialData = () => {
  const [stockData, setStockData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (symbol: string) => {
    if (!symbol) {
      setError('Symbol is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Financial Data Hook: Fetching stock data for', symbol);
      
      const { data, error: supabaseError } = await supabase.functions.invoke('financial-data', {
        body: { symbol: symbol.toUpperCase() }
      });

      console.log('Financial Data Hook: Response received', { result: data, error: supabaseError });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch financial data');
      }

      setStockData(data.data);
      return data.data;
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setStockData(null);
    setError(null);
  };

  return {
    stockData,
    isLoading,
    error,
    fetchStockData,
    clearData
  };
};