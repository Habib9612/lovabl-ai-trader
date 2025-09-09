import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from 'recharts';
import { usePolygonData } from '@/hooks/usePolygonData';
import { useOpenBBData } from '@/hooks/useOpenBBData';
import { useChartAnalysis } from '@/hooks/useChartAnalysis';
import { toast } from 'sonner';

interface ChartData {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

// Custom Candlestick component for Recharts
const Candlestick = ({ payload, x, y, width, height }: any) => {
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isPositive = close >= open;
  const bodyHeight = Math.abs(close - open);
  const wickTop = Math.max(open, close);
  const wickBottom = Math.min(open, close);
  
  // Calculate Y positions (inverted because SVG coordinate system)
  const priceRange = high - low;
  const yScale = height / priceRange;
  
  const highY = y;
  const lowY = y + height;
  const wickTopY = y + (high - wickTop) * yScale;
  const wickBottomY = y + (high - wickBottom) * yScale;
  
  return (
    <g>
      {/* High-Low Wick */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + 1}
        y={wickTopY}
        width={Math.max(width - 2, 1)}
        height={Math.max(Math.abs(wickBottomY - wickTopY), 1)}
        fill={isPositive ? '#22c55e' : '#ef4444'}
        stroke={isPositive ? '#22c55e' : '#ef4444'}
      />
    </g>
  );
};

// Custom tooltip for TradingView-style display
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  const changePercent = ((data.close - data.open) / data.open * 100).toFixed(2);
  const isPositive = data.close >= data.open;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm text-muted-foreground mb-2">{new Date(data.timestamp).toLocaleDateString()}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">O:</span>
          <span className="ml-1 font-mono">${data.open?.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">H:</span>
          <span className="ml-1 font-mono">${data.high?.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">L:</span>
          <span className="ml-1 font-mono">${data.low?.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">C:</span>
          <span className="ml-1 font-mono">${data.close?.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Volume:</span>
          <span className="ml-1 font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
        </div>
        <div className={`font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{changePercent}%
        </div>
      </div>
    </div>
  );
};

export const EnhancedTradingChart = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dividends, setDividends] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Demo data for testing
  const generateDemoData = (): ChartData[] => {
    const data: ChartData[] = [];
    let basePrice = 150;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      const open = basePrice + (Math.random() - 0.5) * 10;
      const volatility = Math.random() * 5 + 2;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      
      data.push({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        vwap: Number(((open + high + low + close) / 4).toFixed(2))
      });
      
      basePrice = close;
    }
    return data;
  };

  const { getStockData, getDividends, loading: polygonLoading, error: polygonError } = usePolygonData();
  const { getTechnicalAnalysis, loading: openBBLoading } = useOpenBBData();
  const { captureAndAnalyze, loading: analysisLoading } = useChartAnalysis();

  const getDateRange = (timeframe: string) => {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    
    switch(timeframe) {
      case '1W':
        from.setDate(from.getDate() - 7);
        break;
      case '1M':
        from.setMonth(from.getMonth() - 1);
        break;
      case '3M':
        from.setMonth(from.getMonth() - 3);
        break;
      case '6M':
        from.setMonth(from.getMonth() - 6);
        break;
      case '1Y':
        from.setFullYear(from.getFullYear() - 1);
        break;
      default:
        from.setMonth(from.getMonth() - 1);
    }
    
    return { from: from.toISOString().split('T')[0], to };
  };

  const fetchData = async () => {
    if (demoMode) {
      setChartData(generateDemoData());
      setDividends([]);
      setTechnicalIndicators(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { from, to } = getDateRange(timeframe);
      
      const [polygonData, dividendData] = await Promise.all([
        getStockData(ticker, from, to).catch(err => {
          console.error('Error fetching stock data:', err);
          return null;
        }),
        getDividends(ticker).catch(err => {
          console.error('Error fetching dividends:', err);
          return null;
        })
      ]);

      if (polygonData && polygonData.results) {
        const chartData: ChartData[] = polygonData.results.map((item: any) => ({
          date: new Date(item.t).toISOString().split('T')[0],
          timestamp: item.t,
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v,
          vwap: item.vw
        }));

        setChartData(chartData);
      } else {
        console.warn('No polygon data received, using demo data');
        setChartData(generateDemoData());
      }

      if (dividendData && dividendData.results) {
        setDividends(dividendData.results);
      }

      // Fetch technical indicators
      try {
        const prices = chartData.map(item => item.close);
        const indicators = await getTechnicalAnalysis(ticker, prices);
        setTechnicalIndicators(indicators.technical_indicators);
      } catch (err) {
        console.error('Error fetching technical indicators:', err);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Fallback to demo data on error
      setChartData(generateDemoData());
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeChart = async () => {
    if (!chartRef.current) {
      toast.error('Chart not found');
      return;
    }

    try {
      const result = await captureAndAnalyze('trading-chart', ticker);
      setAnalysis(result?.analysis || 'Analysis failed');
      toast.success('Chart analysis completed');
    } catch (error) {
      console.error('Error analyzing chart:', error);
      toast.error('Chart analysis failed: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticker, timeframe, demoMode]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1]?.close : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2]?.close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Enter ticker"
                  className="w-32 font-mono"
                />
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1W">1W</SelectItem>
                    <SelectItem value="1M">1M</SelectItem>
                    <SelectItem value="3M">3M</SelectItem>
                    <SelectItem value="6M">6M</SelectItem>
                    <SelectItem value="1Y">1Y</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchData} disabled={loading} size="sm">
                  {loading ? 'Loading...' : 'Update'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="demo-mode"
                  checked={demoMode}
                  onCheckedChange={setDemoMode}
                />
                <Label htmlFor="demo-mode" className="text-sm">Demo Mode</Label>
              </div>
              <Button 
                onClick={handleAnalyzeChart} 
                disabled={analysisLoading}
                variant="outline"
                size="sm"
              >
                {analysisLoading ? 'Analyzing...' : 'Analyze Chart'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Price Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold">{ticker.toUpperCase()}</h2>
              <p className="text-3xl font-mono font-bold">${currentPrice.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-lg font-mono">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}
              </span>
              <span className="text-lg font-mono">
                ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
            <Badge variant={demoMode ? "secondary" : "default"} className="ml-auto">
              {demoMode ? 'Demo Mode' : 'Live Data'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardContent className="pt-6">
          <div id="trading-chart" ref={chartRef} className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-[500px] w-full" />
                <Skeleton className="h-[120px] w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Main Candlestick Chart */}
                <div className="h-[500px] bg-card rounded-lg border border-border p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={['dataMin - 5', 'dataMax + 5']}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="close" 
                        shape={<Candlestick />} 
                        fill="transparent"
                      />
                      {/* VWAP Line */}
                      <Line 
                        type="monotone" 
                        dataKey="vwap" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={1}
                        dot={false}
                        strokeDasharray="5 5"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Volume Chart */}
                <div className="h-[150px] bg-card rounded-lg border border-border p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar 
                        dataKey="volume" 
                        fill="hsl(var(--primary))"
                        opacity={0.6}
                        radius={[2, 2, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="dividends">Dividend Info</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="strategy">ICT Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {technicalIndicators ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(technicalIndicators).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{key}</h4>
                      <p className="text-lg font-mono">{typeof value === 'number' ? value.toFixed(4) : String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No technical indicators available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Information</CardTitle>
            </CardHeader>
            <CardContent>
              {dividends.length > 0 ? (
                <div className="space-y-4">
                  {dividends.slice(0, 5).map((dividend, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">${dividend.cash_amount}</p>
                        <p className="text-sm text-muted-foreground">Ex-Date: {dividend.ex_dividend_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Pay Date</p>
                        <p className="font-semibold">{dividend.pay_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No dividend information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Chart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">Click "Analyze Chart" to get AI-powered analysis</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ICT Strategy Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Market Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyze higher timeframe bias and market structure breaks
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Order Blocks</h4>
                    <p className="text-sm text-muted-foreground">
                      Identify institutional order blocks and fair value gaps
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Liquidity Pools</h4>
                    <p className="text-sm text-muted-foreground">
                      Locate buy/sell side liquidity and potential sweep areas
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Entry Models</h4>
                    <p className="text-sm text-muted-foreground">
                      Apply breaker blocks, mitigation blocks, and optimal trade entries
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};