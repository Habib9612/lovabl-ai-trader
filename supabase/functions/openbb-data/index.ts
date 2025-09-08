import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenBB-inspired financial data endpoints
// Since we can't directly use OpenBB Python library, we'll implement key financial calculations
// and data aggregation that mirrors OpenBB functionality

interface FinancialRatios {
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    roa: number; // Return on Assets
    roe: number; // Return on Equity
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    interestCoverage: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
  };
}

interface TechnicalIndicators {
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

// Technical analysis calculations
class TechnicalAnalysis {
  static calculateSMA(prices: number[], period: number): number[] {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  static calculateEMA(prices: number[], period: number): number[] {
    const multiplier = 2 / (period + 1);
    const ema = [prices[0]];
    
    for (let i = 1; i < prices.length; i++) {
      ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }
    return ema;
  }

  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    if (ema12.length === 0 || ema26.length === 0) {
      return { macd: 0, signal: 0, histogram: 0 };
    }
    
    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
    const macdValues = [];
    
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macdValues.push(ema12[i] - ema26[i]);
    }
    
    const signalLine = this.calculateEMA(macdValues, 9);
    const signal = signalLine[signalLine.length - 1] || 0;
    
    return {
      macd: macdLine,
      signal: signal,
      histogram: macdLine - signal
    };
  }

  static calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const currentSMA = sma[sma.length - 1];
    
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - currentSMA, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: currentSMA + (multiplier * standardDeviation),
      middle: currentSMA,
      lower: currentSMA - (multiplier * standardDeviation)
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ticker, data } = await req.json();
    
    let result;
    
    switch (action) {
      case 'technical_analysis':
        if (!data || !data.prices) {
          throw new Error('Price data is required for technical analysis');
        }
        
        const prices = data.prices as number[];
        const technicalData: TechnicalIndicators = {
          sma: TechnicalAnalysis.calculateSMA(prices, 20),
          ema: TechnicalAnalysis.calculateEMA(prices, 20),
          rsi: TechnicalAnalysis.calculateRSI(prices),
          macd: TechnicalAnalysis.calculateMACD(prices),
          bollinger: TechnicalAnalysis.calculateBollingerBands(prices)
        };
        
        result = {
          ticker,
          technical_indicators: technicalData,
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'financial_ratios':
        // This would typically come from fundamental data APIs
        // For now, we'll return a structure that can be populated
        result = {
          ticker,
          ratios: {
            profitability: {
              grossMargin: null,
              operatingMargin: null,
              netMargin: null,
              roa: null,
              roe: null
            },
            liquidity: {
              currentRatio: null,
              quickRatio: null,
              cashRatio: null
            },
            leverage: {
              debtToEquity: null,
              debtToAssets: null,
              interestCoverage: null
            },
            efficiency: {
              assetTurnover: null,
              inventoryTurnover: null,
              receivablesTurnover: null
            }
          },
          note: "Connect to fundamental data provider for ratio calculations",
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'market_screener':
        // Market screening functionality
        result = {
          action: 'market_screener',
          criteria: data.criteria || {},
          results: [],
          note: "Implement screening logic based on your criteria",
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'portfolio_analysis':
        // Portfolio analysis functionality inspired by OpenBB
        result = {
          portfolio: data.portfolio || [],
          analysis: {
            total_value: 0,
            daily_change: 0,
            allocation: [],
            risk_metrics: {
              volatility: null,
              sharpe_ratio: null,
              max_drawdown: null
            }
          },
          timestamp: new Date().toISOString()
        };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    console.log(`Successfully processed OpenBB-style analysis: ${action} for ${ticker || 'portfolio'}`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openbb-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});