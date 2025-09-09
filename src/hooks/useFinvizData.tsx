import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FinvizStock {
  ticker: string;
  price?: string;
  change?: string;
  volume?: string;
  marketCap?: string;
  pe?: string;
  range52w?: string;
  beta?: string;
  dividend?: string;
  eps?: string;
}

interface ScreenerStock {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  country: string;
  marketCap: string;
  pe: string;
  price: string;
  change: string;
  volume: string;
}

export const useFinvizData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState<FinvizStock | null>(null);
  const [screenerData, setScreenerData] = useState<ScreenerStock[]>([]);
  const { toast } = useToast();

  const fetchStockData = async (ticker: string) => {
    console.log('FinViz Hook: Fetching stock data for', ticker);
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('finviz-data', {
        body: { action: 'get_stock', ticker }
      });

      console.log('FinViz Hook: Response received', { result, error });
      if (error) throw error;

      if (result.success) {
        setStockData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching Finviz stock data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock data from Finviz",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMultipleStocks = async (tickers: string[]) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('finviz-data', {
        body: { action: 'get_multiple_stocks', tickers }
      });

      if (error) throw error;

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching multiple stocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch multiple stocks from Finviz",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const screenStocks = async (filters: string[] = [], order: string = 'ticker', limit: number = 50) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('finviz-data', {
        body: { action: 'screen_stocks', filters, order, limit }
      });

      if (error) throw error;

      if (result.success) {
        setScreenerData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error screening stocks:', error);
      toast({
        title: "Error",
        description: "Failed to screen stocks from Finviz",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTopGainers = async (limit: number = 20) => {
    console.log('FinViz Hook: Fetching top gainers with limit', limit);
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('finviz-data', {
        body: { action: 'get_top_gainers', limit }
      });

      console.log('FinViz Hook: Top gainers response', { result, error });
      if (error) throw error;

      if (result.success) {
        setScreenerData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch top gainers from Finviz",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTopLosers = async (limit: number = 20) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('finviz-data', {
        body: { action: 'get_top_losers', limit }
      });

      if (error) throw error;

      if (result.success) {
        setScreenerData(result.data);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching top losers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch top losers from Finviz",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchStockData,
    fetchMultipleStocks,
    screenStocks,
    getTopGainers,
    getTopLosers,
    stockData,
    screenerData,
    isLoading
  };
};