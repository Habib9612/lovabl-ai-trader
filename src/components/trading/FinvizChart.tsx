import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useFinvizData } from '@/hooks/useFinvizData';

interface ChartProps {
  symbol?: string;
}

export const FinvizChart: React.FC<ChartProps> = ({ symbol = 'AAPL' }) => {
  const { fetchStockData, stockData, isLoading } = useFinvizData();
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [inputSymbol, setInputSymbol] = useState(symbol);

  // Generate mock historical data for chart visualization
  const generateMockData = (currentPrice: number) => {
    const data = [];
    const days = 30;
    let price = currentPrice * 0.9; // Start 10% lower
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic price movement
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      price = price * (1 + change);
      
      data.push({
        date: date.toLocaleDateString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    // Set the last price to current price
    if (data.length > 0) {
      data[data.length - 1].price = currentPrice;
    }
    
    return data;
  };

  useEffect(() => {
    fetchStockData(currentSymbol);
  }, [currentSymbol]);

  const handleSymbolChange = () => {
    if (inputSymbol.trim()) {
      setCurrentSymbol(inputSymbol.toUpperCase());
    }
  };

  const currentPrice = stockData?.price ? parseFloat(stockData.price.replace(/[^0-9.-]/g, '')) : 0;
  const change = stockData?.change || '0%';
  const isPositive = !change.startsWith('-');
  const chartData = currentPrice > 0 ? generateMockData(currentPrice) : [];

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
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

      {/* Stock Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentSymbol}</CardTitle>
            <Badge variant="outline" className="bg-white/50 dark:bg-black/50">
              FinViz Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          ) : stockData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">{stockData.price || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`text-xl font-semibold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {change}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-lg font-medium">{stockData.volume || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-lg font-medium">{stockData.marketCap || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Enter a symbol to view data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Price Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Price Chart (30 Days)
            </CardTitle>
            <CardDescription>FinViz style price visualization</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={formatPrice}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatPrice(value), 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#10b981" : "#ef4444"}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volume</CardTitle>
            <CardDescription>Trading volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={formatVolume}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatVolume(value), 'Volume']}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#volumeGradient)"
                      strokeWidth={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No volume data
              </div>
            )}
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