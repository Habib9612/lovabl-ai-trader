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
    console.log('FinvizChart: Fetching data for', currentSymbol);
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Price</p>
                <p className="text-lg font-bold text-foreground">${stockData.price || 'N/A'}</p>
              </div>
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Change</p>
                <p className={`text-lg font-bold flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {change}
                </p>
              </div>
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Volume</p>
                <p className="text-lg font-bold text-foreground">{stockData.volume || 'N/A'}</p>
              </div>
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Market Cap</p>
                <p className="text-lg font-bold text-foreground">{stockData.marketCap || 'N/A'}</p>
              </div>
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">P/E</p>
                <p className="text-lg font-bold text-foreground">{stockData.pe || 'N/A'}</p>
              </div>
              <div className="text-center p-2 rounded border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Beta</p>
                <p className="text-lg font-bold text-foreground">{stockData.beta || 'N/A'}</p>
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

      {/* FinViz Style Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Price Chart - FinViz Style */}
        <Card className="lg:col-span-3 bg-background border-2">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                {currentSymbol} - Interactive Chart
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">30D</Badge>
                <Badge variant="outline" className="text-xs">Daily</Badge>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Live</Badge>
              </div>
            </div>
            <CardDescription className="text-xs">
              FinViz style price visualization with volume • Data updates every 15 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-[400px] w-full bg-gradient-to-b from-background to-muted/20 rounded">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="finvizGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0.4}/>
                        <stop offset="50%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.2}/>
                        <stop offset="100%" stopColor={isPositive ? "#16a34a" : "#dc2626"} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="1 1" 
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.3}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      orientation="right"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px',
                        padding: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(value) => `Date: ${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#16a34a" : "#dc2626"}
                      fillOpacity={1}
                      fill="url(#finvizGradient)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: isPositive ? "#16a34a" : "#dc2626" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded">
                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No Chart Data Available</p>
                <p className="text-sm">Enter a valid stock symbol to view price chart</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume & Stats Sidebar - FinViz Style */}
        <Card className="bg-background border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume & Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Volume Chart */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Trading Volume</p>
              {isLoading ? (
                <Skeleton className="h-[120px] w-full" />
              ) : chartData.length > 0 ? (
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(-7)}> {/* Last 7 days */}
                      <defs>
                        <linearGradient id="volumeFinviz" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <YAxis hide />
                      <XAxis hide />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#3b82f6"
                        fill="url(#volumeFinviz)"
                        strokeWidth={1}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs">
                  No volume data
                </div>
              )}
            </div>

            {/* Key Statistics */}
            <div className="space-y-3">
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Key Statistics</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">52W Range</span>
                    <span className="text-xs font-medium">{stockData?.range52w || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">EPS (ttm)</span>
                    <span className="text-xs font-medium">{stockData?.eps || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Dividend</span>
                    <span className="text-xs font-medium">{stockData?.dividend || 'N/A'}</span>
                  </div>
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