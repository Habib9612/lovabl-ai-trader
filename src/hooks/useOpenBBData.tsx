import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TechnicalIndicators {
  sma: number[];
  ema: number[];
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface FinancialRatios {
  profitability: {
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    roa: number | null;
    roe: number | null;
  };
  liquidity: {
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
  };
  leverage: {
    debtToEquity: number | null;
    debtToAssets: number | null;
    interestCoverage: number | null;
  };
  efficiency: {
    assetTurnover: number | null;
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
  };
}

export const useOpenBBData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callOpenBBFunction = useCallback(async (action: string, ticker: string, data?: any) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('openbb-data', {
        body: {
          action,
          ticker,
          data
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTechnicalAnalysis = useCallback(async (
    ticker: string,
    prices: number[]
  ): Promise<{ ticker: string; technical_indicators: TechnicalIndicators; timestamp: string }> => {
    return callOpenBBFunction('technical_analysis', ticker, { prices });
  }, [callOpenBBFunction]);

  const getFinancialRatios = useCallback(async (
    ticker: string
  ): Promise<{ ticker: string; ratios: FinancialRatios; timestamp: string }> => {
    return callOpenBBFunction('financial_ratios', ticker);
  }, [callOpenBBFunction]);

  const screenMarket = useCallback(async (criteria: any) => {
    return callOpenBBFunction('market_screener', '', { criteria });
  }, [callOpenBBFunction]);

  const analyzePortfolio = useCallback(async (portfolio: any[]) => {
    return callOpenBBFunction('portfolio_analysis', '', { portfolio });
  }, [callOpenBBFunction]);

  return {
    loading,
    error,
    getTechnicalAnalysis,
    getFinancialRatios,
    screenMarket,
    analyzePortfolio
  };
};