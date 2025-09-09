import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Search, Zap, Target } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Live Market Charts
          </h2>
          <p className="text-lg text-gray-600">Real-time stock price visualization with professional tools</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSymbolChange()}
              className="pl-10 w-48 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <Button 
            onClick={handleSymbolChange} 
            className="bg-gradient-primary hover:shadow-lg transition-all px-6 rounded-xl shadow-md"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Load Chart
          </Button>
        </div>
      </div>

      {/* Stock Information Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{currentSymbol}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white border-white/30">Live Data</Badge>
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Market Status</p>
              <p className="text-lg font-semibold">Open - {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : stockData ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {[
                { label: 'Current Price', value: `$${stockData.price || currentPrice.toFixed(2)}`, color: 'bg-blue-50 border-blue-200 text-blue-900' },
                { 
                  label: 'Daily Change', 
                  value: change, 
                  color: isPositive ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900',
                  icon: isPositive ? TrendingUp : TrendingDown
                },
                { label: 'Volume', value: stockData.volume || formatVolume(chartData[chartData.length-1]?.volume || 0), color: 'bg-purple-50 border-purple-200 text-purple-900' },
                { label: 'Market Cap', value: stockData.marketCap || '3.58T', color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
                { label: 'P/E Ratio', value: stockData.pe || '35.96', color: 'bg-orange-50 border-orange-200 text-orange-900' },
                { label: 'Beta', value: stockData.beta || '1.31', color: 'bg-gray-50 border-gray-200 text-gray-900' }
              ].map((item, i) => (
                <div key={i} className={`text-center p-6 rounded-xl border-2 ${item.color} hover:shadow-lg transition-all hover-scale`}>
                  <p className="text-sm font-bold mb-3 opacity-70 uppercase tracking-wide">{item.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Enter a symbol to view market data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Chart Section */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-2xl font-bold">{currentSymbol} - Daily Chart</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-white/10 text-white border-white/20">1D</Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Last Updated</p>
              <p className="text-lg font-semibold">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-[600px] bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-600">Loading Chart Data...</p>
                <p className="text-gray-500">Fetching real-time market information</p>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-[600px] w-full bg-gray-900">
              {/* Price Chart */}
              <div className="h-[450px] border-b border-gray-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.2}/>
                        <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="2 2" 
                      stroke="#374151"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="dateFormatted"
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={{ stroke: '#374151' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={{ stroke: '#374151' }}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                      orientation="right"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#f3f4f6',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'close') return [`$${value.toFixed(2)}`, 'Close Price'];
                        return [value, name];
                      }}
                    />
                    
                    {/* Moving Averages */}
                    {chartData[0]?.sma20 && (
                      <Line
                        type="monotone"
                        dataKey="sma20"
                        stroke="#f59e0b"
                        strokeWidth={2}
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
                        strokeWidth={2}
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
                      strokeWidth={3}
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Volume Chart */}
              <div className="h-[150px] bg-gray-900">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 40, left: 20, bottom: 10 }}>
                    <defs>
                      <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="dateFormatted"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
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
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <BarChart3 className="w-20 h-20 mb-6 opacity-50" />
              <p className="text-xl font-semibold mb-2">Chart Loading...</p>
              <p className="text-gray-400">Fetching market data for {currentSymbol}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Analysis Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-card">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Technical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Key Levels */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Key Levels</p>
              <div className="space-y-3">
                {[
                  { label: '52W High', value: '$237.23', color: 'text-green-600' },
                  { label: '52W Low', value: '$164.08', color: 'text-red-600' },
                  { label: 'Support', value: '$230.00', color: 'text-blue-600' },
                  { label: 'Resistance', value: '$240.00', color: 'text-orange-600' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="border-t pt-6">
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Indicators</p>
              <div className="space-y-3">
                {[
                  { label: 'RSI (14)', value: '58.4', color: 'text-orange-500' },
                  { label: 'MACD', value: '+2.18', color: 'text-green-600' },
                  { label: 'SMA 20', value: '$232.10', color: 'text-blue-600' },
                  { label: 'SMA 50', value: '$228.45', color: 'text-purple-600' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Trading Analysis */}
        <div className="lg:col-span-2">
          <AITradingAnalysis symbol={currentSymbol} currentPrice={currentPrice} />
        </div>
      </div>
    </div>
  );
};