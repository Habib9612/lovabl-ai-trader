import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, BarChart3, Target, AlertTriangle, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BacktestResult {
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  strategy_returns: number[];
  market_returns: number[];
  dates: string[];
  signals: Array<{
    date: string;
    action: 'buy' | 'sell' | 'short' | 'cover';
    price: number;
    position: 'long' | 'short' | 'neutral';
  }>;
}

interface AlgoAnalysis {
  symbol: string;
  strategy: string;
  timeframe: string;
  backtest_result: BacktestResult;
  analysis: {
    summary: string;
    key_insights: string[];
    risk_factors: string[];
    recommendations: string[];
  };
  error?: string;
}

interface TradingSession {
  symbol: string;
  strategy: string;
  timeframe: string;
  analysis: AlgoAnalysis;
  timestamp: Date;
}

export const AlgoTrading: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [strategy, setStrategy] = useState('monthly-momentum');
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<TradingSession[]>([]);
  const { toast } = useToast();

  const handleRunBacktest = async () => {
    if (!symbol.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('algo-trading-backtest', {
        body: { 
          symbol: symbol.toUpperCase(),
          strategy,
          timeframe 
        }
      });

      if (error) {
        console.error('Backtest error response:', error, 'server data:', data);
        const serverMessage = (data as any)?.error;
        throw new Error(serverMessage || (error as any)?.message || 'Failed to run algorithmic trading backtest');
      }

      const analysis: AlgoAnalysis = data;
      
      const newSession: TradingSession = {
        symbol: symbol.toUpperCase(),
        strategy,
        timeframe,
        analysis,
        timestamp: new Date()
      };
      
      setSessions(prev => [newSession, ...prev]);

      toast({
        title: "Backtest Complete",
        description: `${symbol.toUpperCase()} ${strategy} strategy analyzed successfully.`,
      });

    } catch (error) {
      console.error('Error in algo trading backtest:', error);
      const message = error instanceof Error ? error.message : 'Failed to run algorithmic trading backtest. Please try again.';
      toast({
        title: "Backtest Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSessions = () => {
    setSessions([]);
    toast({
      title: "Sessions Cleared",
      description: "All trading sessions have been cleared.",
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  const renderBacktestResults = (session: TradingSession) => {
    const { analysis } = session;
    
    if (analysis.error) {
      return (
        <div className="bg-destructive/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-destructive">Error</h4>
          <p className="text-sm">{analysis.error}</p>
        </div>
      );
    }

    const { backtest_result, analysis: insights } = analysis;

    return (
      <div className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-500/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-muted-foreground">Total Return</div>
            <div className="text-lg font-bold text-green-600">
              {formatPercentage(backtest_result.total_return)}
            </div>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
            <div className="text-lg font-bold text-blue-600">
              {formatNumber(backtest_result.sharpe_ratio)}
            </div>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-muted-foreground">Max Drawdown</div>
            <div className="text-lg font-bold text-red-600">
              {formatPercentage(backtest_result.max_drawdown)}
            </div>
          </div>
          <div className="bg-purple-500/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-muted-foreground">Win Rate</div>
            <div className="text-lg font-bold text-purple-600">
              {formatPercentage(backtest_result.win_rate)}
            </div>
          </div>
          <div className="bg-orange-500/10 p-3 rounded-lg text-center">
            <div className="text-sm font-medium text-muted-foreground">Total Trades</div>
            <div className="text-lg font-bold text-orange-600">
              {backtest_result.total_trades}
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Strategy Analysis
          </h4>
          <p className="text-sm">{insights.summary}</p>
        </div>

        {/* Key Insights */}
        {insights.key_insights && insights.key_insights.length > 0 && (
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="text-sm space-y-1">
              {insights.key_insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Factors */}
        {insights.risk_factors && insights.risk_factors.length > 0 && (
          <div className="bg-orange-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Factors
            </h4>
            <ul className="text-sm space-y-1">
              {insights.risk_factors.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="bg-green-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="text-sm space-y-1">
              {insights.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Signals */}
        {backtest_result.signals && backtest_result.signals.length > 0 && (
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Recent Trading Signals
            </h4>
            <div className="space-y-2">
              {backtest_result.signals.slice(-5).map((signal, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{signal.date}</span>
                  <Badge variant={
                    signal.action === 'buy' ? 'default' :
                    signal.action === 'sell' ? 'secondary' :
                    signal.action === 'short' ? 'destructive' : 'outline'
                  }>
                    {signal.action.toUpperCase()}
                  </Badge>
                  <span>${signal.price.toFixed(2)}</span>
                  <span className="capitalize">{signal.position}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Algorithmic Trading Backtester
            <Badge variant="secondary" className="ml-auto">
              TLT Monthly Momentum Strategy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Symbol</label>
                <Input
                  placeholder="AAPL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Strategy</label>
                <Select value={strategy} onValueChange={setStrategy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly-momentum">Monthly Momentum</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                    <SelectItem value="trend-following">Trend Following</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1D">Daily</SelectItem>
                    <SelectItem value="1W">Weekly</SelectItem>
                    <SelectItem value="1M">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button 
                  onClick={handleRunBacktest}
                  disabled={isLoading || !symbol.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Running...
                    </>
                  ) : (
                    'Run Backtest'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearSessions}
                  disabled={sessions.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Sessions */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {sessions.map((session, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {session.symbol} - {session.strategy} ({session.timeframe})
                  </CardTitle>
                  <Badge variant="outline">
                    {session.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {renderBacktestResults(session)}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Strategy Info */}
      {sessions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TLT Monthly Momentum Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This algorithm implements a monthly momentum trading strategy for TLT (20+ Year Treasury Bond ETF):
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Short Entries:</strong> 1st and 5th of each month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Short Exits:</strong> 5 trading days after entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Long Entries:</strong> 7 trading days before month end</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Long Exits:</strong> 1 trading day before month end</span>
                </li>
              </ul>
              <Separator />
              <p className="text-xs text-muted-foreground">
                This strategy is based on historical TLT price patterns and monthly bond market cycles. 
                Past performance does not guarantee future results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};