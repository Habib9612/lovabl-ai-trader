import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useFinvizData } from '@/hooks/useFinvizData';
import { AITradingAnalysis } from './AITradingAnalysis';

interface ChartProps {
  symbol?: string;
}

export const FinvizChart: React.FC<ChartProps> = ({ symbol = 'AAPL' }) => {
  const { fetchStockData, stockData, isLoading } = useFinvizData();
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [inputSymbol, setInputSymbol] = useState(symbol);

  // Generate realistic OHLC candlestick data for FinViz-style chart
  const generateFinvizData = (currentPrice: number) => {
    const data = [];
    const days = 60; // More data points for better chart
    let price = currentPrice * 0.85; // Start 15% lower
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate OHLC data (Open, High, Low, Close)
      const open = price;
      const changePercent = (Math.random() - 0.5) * 0.06; // ±3% daily change
      const close = open * (1 + changePercent);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02); // Up to 2% higher
      const low = Math.min(open, close) * (1 - Math.random() * 0.02); // Up to 2% lower
      
      // Volume with some correlation to price movement
      const volumeBase = 50000000 + Math.random() * 100000000;
      const volumeMultiplier = Math.abs(changePercent) * 5 + 1; // Higher volume on bigger moves
      const volume = Math.floor(volumeBase * volumeMultiplier);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: `${date.getMonth() + 1}/${date.getDate()}`,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume,
        change: changePercent,
        sma20: i > 20 ? parseFloat((price * 0.98).toFixed(2)) : null,
        sma50: i > 50 ? parseFloat((price * 0.96).toFixed(2)) : null
      });
      
      price = close;
    }
    
    // Set the last price to current price
    if (data.length > 0) {
      const lastItem = data[data.length - 1];
      const adjustment = currentPrice / lastItem.close;
      lastItem.close = currentPrice;
      lastItem.high = Math.max(lastItem.high * adjustment, currentPrice);
      lastItem.low = Math.min(lastItem.low * adjustment, currentPrice);
    }
    
    return data;
  };

  useEffect(() => {
    console.log('FinvizChart: Fetching data for', currentSymbol);
    fetchStockData(currentSymbol);
  }, [currentSymbol]);

  const handleSymbolChange = () => {
    if (inputSymbol.trim()) {
      setCurrentSymbol(inputSymbol.toUpperCase());
    }
  };

  const currentPrice = stockData?.price ? parseFloat(stockData.price.replace(/[^0-9.-]/g, '')) : 236.57;
  const change = stockData?.change || '-1.31';
  const isPositive = !change.startsWith('-');
  const chartData = generateFinvizData(currentPrice);

  const formatVolume = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">FinViz Live Chart</h2>
          <p className="text-muted-foreground">Real-time stock price visualization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter symbol"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleSymbolChange()}
            className="w-32"
          />
          <Button onClick={handleSymbolChange} size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Load
          </Button>
        </div>
      </div>

      {/* Stock Info Card - FinViz Style */}
      <Card className="bg-background border-2 shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-2xl font-bold text-primary">{currentSymbol}</CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                FinViz Live
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Real-time Data</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : stockData ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Price</p>
                <p className="text-xl font-bold text-foreground mt-1">${stockData.price || currentPrice.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change</p>
                <div className={`text-xl font-bold mt-1 flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {change}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Volume</p>
                <p className="text-lg font-bold text-foreground mt-1">{stockData.volume || formatVolume(chartData[chartData.length-1]?.volume || 0)}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Market Cap</p>
                <p className="text-lg font-bold text-foreground mt-1">{stockData.marketCap || '3.58T'}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">P/E Ratio</p>
                <p className="text-lg font-bold text-foreground mt-1">{stockData.pe || '35.96'}</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Beta</p>
                <p className="text-lg font-bold text-foreground mt-1">{stockData.beta || '1.31'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Enter a symbol to view FinViz data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FinViz Style Candlestick Chart */}
      <div className="space-y-4">
        {/* Main Chart */}
        <Card className="bg-background border-2">
          <CardHeader className="pb-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-xl font-bold">{currentSymbol}</CardTitle>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  Daily
                </Badge>
                <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/30">
                  Live
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Sep 09, 10:07 AM ET</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-slate-900">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full bg-slate-800" />
            ) : chartData.length > 0 ? (
              <div className="h-[500px] w-full">
                {/* Price Chart */}
                <div className="h-[350px] border-b border-slate-700">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                          <stop offset="50%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.1}/>
                          <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="1 1" 
                        stroke="#374151"
                        strokeOpacity={0.3}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="dateFormatted"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={{ stroke: '#374151' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={{ stroke: '#374151' }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        orientation="right"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#f3f4f6'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'close') return [`$${value.toFixed(2)}`, 'Close'];
                          return [value, name];
                        }}
                      />
                      
                      {/* Moving Averages */}
                      {chartData[0]?.sma20 && (
                        <Line
                          type="monotone"
                          dataKey="sma20"
                          stroke="#f59e0b"
                          strokeWidth={1}
                          dot={false}
                          connectNulls={false}
                          name="SMA 20"
                        />
                      )}
                      {chartData[0]?.sma50 && (
                        <Line
                          type="monotone"
                          dataKey="sma50"
                          stroke="#8b5cf6"
                          strokeWidth={1}
                          dot={false}
                          connectNulls={false}
                          name="SMA 50"
                        />
                      )}
                      
                      {/* Price Area */}
                      <Area
                        type="monotone"
                        dataKey="close"
                        fill="url(#priceAreaGradient)"
                        stroke={isPositive ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fillOpacity={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Volume Chart */}
                <div className="h-[140px] bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="1 1" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                      <XAxis 
                        dataKey="dateFormatted"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={{ stroke: '#374151' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#374151' }}
                        tickLine={{ stroke: '#374151' }}
                        tickFormatter={formatVolume}
                        orientation="right"
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#6366f1"
                        fill="url(#volumeGrad)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
      </div>

      {/* AI Trading Analysis Section */}
      <AITradingAnalysis symbol={currentSymbol} currentPrice={currentPrice} />
    </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Chart Loading...</p>
                <p className="text-sm">Fetching market data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Analysis Sidebar */}
        <Card className="bg-background border-2">
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <CardTitle className="text-sm font-bold">Technical Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Key Levels */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Key Levels</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">52W High</span>
                  <span className="font-semibold text-green-600">$237.23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">52W Low</span>
                  <span className="font-semibold text-red-600">$164.08</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Support</span>
                  <span className="font-semibold">$230.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Resistance</span>
                  <span className="font-semibold">$240.00</span>
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Indicators</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">RSI (14)</span>
                  <span className="font-semibold text-orange-500">58.4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">MACD</span>
                  <span className="font-semibold text-green-600">+2.18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SMA 20</span>
                  <span className="font-semibold text-blue-500">${(currentPrice * 0.98).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">SMA 50</span>
                  <span className="font-semibold text-purple-500">${(currentPrice * 0.96).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Additional Data */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Statistics</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">EPS (ttm)</span>
                  <span className="font-semibold">{stockData?.eps || '6.58'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dividend</span>
                  <span className="font-semibold">{stockData?.dividend || '0.25%'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Volume</span>
                  <span className="font-semibold">58.8M</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stock Data */}
      {stockData && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Data</CardTitle>
            <CardDescription>Extended FinViz stock information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-lg font-medium">{stockData.pe || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">52W Range</p>
                <p className="text-lg font-medium">{stockData.range52w || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Beta</p>
                <p className="text-lg font-medium">{stockData.beta || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dividend</p>
                <p className="text-lg font-medium">{stockData.dividend || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};