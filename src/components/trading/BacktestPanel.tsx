import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, BarChart3, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useBacktest } from '@/hooks/useBacktest';
import { useAuth } from '@/hooks/useAuth';

const BacktestPanel = () => {
  const { user } = useAuth();
  const { backtests, loading, error, createBacktest, fetchBacktests } = useBacktest();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [backtestConfig, setBacktestConfig] = useState({
    symbol: '',
    timeframe: '1D',
    strategy: 'simple_ma',
    start_date: '',
    end_date: '',
    params: {
      fast_ma: 10,
      slow_ma: 20,
      initial_capital: 10000
    }
  });

  useEffect(() => {
    if (user) {
      fetchBacktests();
    }
  }, [user]);

  const handleCreateBacktest = async () => {
    try {
      await createBacktest({
        symbol: backtestConfig.symbol.toUpperCase(),
        timeframe: backtestConfig.timeframe,
        strategy: backtestConfig.strategy,
        start_date: backtestConfig.start_date,
        end_date: backtestConfig.end_date,
        params: backtestConfig.params
      });

      setShowCreateDialog(false);
      setBacktestConfig({
        symbol: '',
        timeframe: '1D',
        strategy: 'simple_ma',
        start_date: '',
        end_date: '',
        params: {
          fast_ma: 10,
          slow_ma: 20,
          initial_capital: 10000
        }
      });
    } catch (error) {
      console.error('Failed to create backtest:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'running':
        return <Play className="h-4 w-4 text-info animate-pulse" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-warning text-warning-foreground';
      case 'running':
        return 'bg-info text-info-foreground';
      case 'done':
        return 'bg-success text-success-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to run backtests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Strategy Backtesting
          </h2>
          <p className="text-muted-foreground">Test your trading strategies against historical data</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
              <Play className="h-4 w-4 mr-2" />
              New Backtest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Backtest</DialogTitle>
              <DialogDescription>
                Configure your strategy backtest parameters
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input
                placeholder="Symbol (e.g., AAPL)"
                value={backtestConfig.symbol}
                onChange={(e) => setBacktestConfig({
                  ...backtestConfig,
                  symbol: e.target.value.toUpperCase()
                })}
              />

              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={backtestConfig.timeframe} 
                  onValueChange={(value) => setBacktestConfig({
                    ...backtestConfig,
                    timeframe: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="1D">1 Day</SelectItem>
                    <SelectItem value="1W">1 Week</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={backtestConfig.strategy} 
                  onValueChange={(value) => setBacktestConfig({
                    ...backtestConfig,
                    strategy: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple_ma">Simple Moving Average</SelectItem>
                    <SelectItem value="rsi">RSI Strategy</SelectItem>
                    <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                    <SelectItem value="macd">MACD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={backtestConfig.start_date}
                  onChange={(e) => setBacktestConfig({
                    ...backtestConfig,
                    start_date: e.target.value
                  })}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={backtestConfig.end_date}
                  onChange={(e) => setBacktestConfig({
                    ...backtestConfig,
                    end_date: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Strategy Parameters</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Fast MA"
                    value={backtestConfig.params.fast_ma}
                    onChange={(e) => setBacktestConfig({
                      ...backtestConfig,
                      params: {
                        ...backtestConfig.params,
                        fast_ma: parseInt(e.target.value) || 10
                      }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Slow MA"
                    value={backtestConfig.params.slow_ma}
                    onChange={(e) => setBacktestConfig({
                      ...backtestConfig,
                      params: {
                        ...backtestConfig.params,
                        slow_ma: parseInt(e.target.value) || 20
                      }
                    })}
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Initial Capital"
                  value={backtestConfig.params.initial_capital}
                  onChange={(e) => setBacktestConfig({
                    ...backtestConfig,
                    params: {
                      ...backtestConfig.params,
                      initial_capital: parseInt(e.target.value) || 10000
                    }
                  })}
                />
              </div>

              <Button 
                onClick={handleCreateBacktest} 
                disabled={loading || !backtestConfig.symbol}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Start Backtest'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Backtest History */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Recent Backtests</h3>
        
        {loading && backtests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading backtests...</p>
            </CardContent>
          </Card>
        ) : backtests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No backtests yet. Create your first backtest to get started.</p>
            </CardContent>
          </Card>
        ) : (
          backtests.map((backtest) => (
            <Card key={backtest.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{backtest.symbol}</CardTitle>
                    <CardDescription>
                      {backtest.params?.strategy || 'Unknown Strategy'} • {backtest.params?.timeframe || '1D'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(backtest.status)}>
                      {getStatusIcon(backtest.status)}
                      <span className="ml-1 capitalize">{backtest.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(backtest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {backtest.completed_at && (
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">
                        {new Date(backtest.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {backtest.metrics && (
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <p className="text-xs text-muted-foreground">Return</p>
                      <p className="font-semibold text-success">
                        {backtest.metrics.total_return ? `${backtest.metrics.total_return.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Final Value</p>
                      <p className="font-semibold">
                        {backtest.metrics.final_value ? `$${backtest.metrics.final_value.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BarChart3 className="h-4 w-4 text-info" />
                      </div>
                      <p className="text-xs text-muted-foreground">Trades</p>
                      <p className="font-semibold">
                        {backtest.metrics.total_trades || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {backtest.error_details && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">Error:</p>
                    <p className="text-sm text-destructive">
                      {backtest.error_details.message || 'Unknown error occurred'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BacktestPanel;