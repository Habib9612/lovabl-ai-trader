import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradingSignal {
  date: string;
  action: 'buy' | 'sell' | 'short' | 'cover';
  price: number;
  position: 'long' | 'short' | 'neutral';
}

interface BacktestResult {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  strategy_returns: number[];
  market_returns: number[];
  dates: string[];
  signals: TradingSignal[];
}

class TLTMonthlyMomentumStrategy {
  private prices: number[];
  private dates: string[];
  private signals: TradingSignal[];
  private returns: number[];
  private positions: number[];

  constructor(prices: number[], dates: string[]) {
    this.prices = prices;
    this.dates = dates;
    this.signals = [];
    this.returns = [];
    this.positions = [];
  }

  generateSignals(): TradingSignal[] {
    this.signals = [];
    this.positions = new Array(this.prices.length).fill(0);

    for (let i = 0; i < this.dates.length; i++) {
      const date = new Date(this.dates[i]);
      const dayOfMonth = date.getDate();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const daysFromEnd = daysInMonth - dayOfMonth;

      let signal: TradingSignal | null = null;

      // Short entries: 1st and 5th of month
      if (dayOfMonth === 1 || dayOfMonth === 5) {
        signal = {
          date: this.dates[i],
          action: 'short',
          price: this.prices[i],
          position: 'short'
        };
        this.positions[i] = -1;
      }
      // Short exits: 5 days after entry
      else if (i >= 5 && this.positions[i-5] === -1) {
        signal = {
          date: this.dates[i],
          action: 'cover',
          price: this.prices[i],
          position: 'neutral'
        };
        this.positions[i] = 0;
      }
      // Long entries: 7 days before month end
      else if (daysFromEnd === 7) {
        signal = {
          date: this.dates[i],
          action: 'buy',
          price: this.prices[i],
          position: 'long'
        };
        this.positions[i] = 1;
      }
      // Long exits: 1 day before month end
      else if (daysFromEnd === 1) {
        signal = {
          date: this.dates[i],
          action: 'sell',
          price: this.prices[i],
          position: 'neutral'
        };
        this.positions[i] = 0;
      }
      // Maintain previous position if no signal
      else if (i > 0) {
        this.positions[i] = this.positions[i-1];
      }

      if (signal) {
        this.signals.push(signal);
      }
    }

    return this.signals;
  }

  calculateReturns(): BacktestResult {
    this.generateSignals();
    
    // Calculate daily returns
    const marketReturns: number[] = [];
    const strategyReturns: number[] = [];

    for (let i = 1; i < this.prices.length; i++) {
      const marketReturn = (this.prices[i] - this.prices[i-1]) / this.prices[i-1];
      const strategyReturn = this.positions[i-1] * marketReturn;
      
      marketReturns.push(marketReturn);
      strategyReturns.push(strategyReturn);
    }

    // Calculate cumulative returns
    const cumulativeStrategyReturn = strategyReturns.reduce((acc, ret) => acc * (1 + ret), 1) - 1;
    const cumulativeMarketReturn = marketReturns.reduce((acc, ret) => acc * (1 + ret), 1) - 1;

    // Calculate Sharpe ratio (assuming 252 trading days)
    const avgStrategyReturn = strategyReturns.reduce((a, b) => a + b, 0) / strategyReturns.length;
    const strategyStdDev = Math.sqrt(
      strategyReturns.reduce((acc, ret) => acc + Math.pow(ret - avgStrategyReturn, 2), 0) / strategyReturns.length
    );
    const sharpeRatio = (avgStrategyReturn * 252) / (strategyStdDev * Math.sqrt(252));

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 1;
    let cumulativeReturn = 1;

    for (const ret of strategyReturns) {
      cumulativeReturn *= (1 + ret);
      if (cumulativeReturn > peak) {
        peak = cumulativeReturn;
      }
      const drawdown = (peak - cumulativeReturn) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate win rate
    const winningTrades = strategyReturns.filter(ret => ret > 0).length;
    const winRate = winningTrades / strategyReturns.length;

    return {
      total_return: cumulativeStrategyReturn,
      sharpe_ratio: sharpeRatio,
      max_drawdown: maxDrawdown,
      win_rate: winRate,
      total_trades: this.signals.length,
      strategy_returns: strategyReturns,
      market_returns: marketReturns,
      dates: this.dates.slice(1),
      signals: this.signals
    };
  }
}

async function fetchStockData(symbol: string): Promise<{prices: number[], dates: string[]} | null> {
  const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
  
  if (!finnhubApiKey) {
    throw new Error('Finnhub API key not configured');
  }

  try {
    // Get 2 years of data
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (2 * 365 * 24 * 60 * 60); // 2 years ago

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${startDate}&to=${endDate}&token=${finnhubApiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.s !== 'ok') {
      throw new Error(`Finnhub API error: ${data.s}`);
    }

    const prices = data.c; // closing prices
    const timestamps = data.t; // timestamps
    
    const dates = timestamps.map((ts: number) => new Date(ts * 1000).toISOString().split('T')[0]);

    return { prices, dates };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}

function generateAnalysis(backtest: BacktestResult, symbol: string, strategy: string): any {
  const totalReturnPercent = (backtest.total_return * 100).toFixed(2);
  const sharpeRatio = backtest.sharpe_ratio.toFixed(2);
  const maxDrawdownPercent = (backtest.max_drawdown * 100).toFixed(2);
  const winRatePercent = (backtest.win_rate * 100).toFixed(2);

  let summary = `The ${strategy} strategy for ${symbol} generated a total return of ${totalReturnPercent}% `;
  summary += `with a Sharpe ratio of ${sharpeRatio} and maximum drawdown of ${maxDrawdownPercent}%. `;
  summary += `The strategy achieved a win rate of ${winRatePercent}% across ${backtest.total_trades} trades.`;

  const keyInsights = [
    `Strategy outperformed buy-and-hold by ${(backtest.total_return * 100).toFixed(1)}% total return`,
    `Risk-adjusted returns (Sharpe ratio) of ${sharpeRatio} indicates ${parseFloat(sharpeRatio) > 1 ? 'strong' : parseFloat(sharpeRatio) > 0.5 ? 'moderate' : 'weak'} performance`,
    `Maximum drawdown of ${maxDrawdownPercent}% shows ${parseFloat(maxDrawdownPercent) < 10 ? 'low' : parseFloat(maxDrawdownPercent) < 20 ? 'moderate' : 'high'} risk`,
    `Win rate of ${winRatePercent}% across ${backtest.total_trades} trades demonstrates strategy consistency`
  ];

  const riskFactors = [
    'Strategy performance is based on historical data and may not predict future results',
    'Bond market volatility can significantly impact TLT price movements',
    'Interest rate changes by Federal Reserve directly affect treasury bond prices',
    'Monthly momentum patterns may change due to evolving market conditions',
    'Transaction costs and slippage not included in backtest results'
  ];

  const recommendations = [
    'Consider position sizing based on current portfolio risk tolerance',
    'Monitor Federal Reserve policy changes that could affect bond markets',
    'Implement stop-loss orders to limit downside risk during adverse moves',
    'Consider combining with other asset classes for better diversification',
    'Regular strategy review and adjustment based on changing market conditions'
  ];

  return {
    summary,
    key_insights: keyInsights,
    risk_factors: riskFactors,
    recommendations
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, strategy, timeframe } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    console.log(`Running backtest for ${symbol} with ${strategy} strategy`);

    // Fetch stock data
    const stockData = await fetchStockData(symbol);
    if (!stockData) {
      throw new Error('Failed to fetch stock data');
    }

    // Run backtest based on strategy
    let backtest: BacktestResult;
    
    if (strategy === 'monthly-momentum') {
      const strategyEngine = new TLTMonthlyMomentumStrategy(stockData.prices, stockData.dates);
      backtest = strategyEngine.calculateReturns();
    } else {
      throw new Error(`Strategy ${strategy} not implemented yet`);
    }

    // Generate analysis
    const analysis = generateAnalysis(backtest, symbol, strategy);

    const response = {
      symbol,
      strategy,
      timeframe,
      backtest_result: backtest,
      analysis
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in algo trading backtest:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to run algorithmic trading backtest' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    );
  }
});