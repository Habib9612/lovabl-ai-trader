import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PolygonMarketData {
  results: Array<{
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    t: number; // timestamp
    v: number; // volume
    vw: number; // volume weighted average price
  }>;
  ticker: string;
  status: string;
}

export interface PolygonDividendData {
  results: Array<{
    cash_amount: number;
    currency: string;
    declaration_date: string;
    dividend_type: string;
    ex_dividend_date: string;
    frequency: number;
    pay_date: string;
    record_date: string;
    ticker: string;
  }>;
  status: string;
}

export const usePolygonData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = useCallback(async (
    endpoint: string,
    ticker: string,
    options: {
      multiplier?: number;
      timespan?: string;
      from?: string;
      to?: string;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('polygon-market-data', {
        body: {
          endpoint,
          ticker,
          ...options
        }
      });

      if (functionError) {
        console.error('Polygon API error:', functionError);
        throw new Error(functionError.message || 'Polygon API call failed');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockData = useCallback(async (
    ticker: string,
    from: string,
    to: string,
    timespan: string = 'day'
  ): Promise<PolygonMarketData> => {
    return fetchMarketData('aggregates', ticker, {
      multiplier: 1,
      timespan,
      from,
      to
    });
  }, [fetchMarketData]);

  const getDividends = useCallback(async (ticker: string): Promise<PolygonDividendData> => {
    return fetchMarketData('dividends', ticker);
  }, [fetchMarketData]);

  const getPreviousClose = useCallback(async (ticker: string) => {
    return fetchMarketData('previous-close', ticker);
  }, [fetchMarketData]);

  const getTickerDetails = useCallback(async (ticker: string) => {
    return fetchMarketData('ticker-details', ticker);
  }, [fetchMarketData]);

  const getMarketHolidays = useCallback(async () => {
    return fetchMarketData('market-holidays', '');
  }, [fetchMarketData]);

  return {
    loading,
    error,
    getStockData,
    getDividends,
    getPreviousClose,
    getTickerDetails,
    getMarketHolidays
  };
};