import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Camera, TrendingUp, TrendingDown, Activity, DollarSign, Zap } from 'lucide-react';
import { usePolygonData } from '@/hooks/usePolygonData';
import { useChartAnalysis } from '@/hooks/useChartAnalysis';
import { useOpenBBData } from '@/hooks/useOpenBBData';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export const EnhancedTradingChart = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dividends, setDividends] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Demo data for testing
  const generateDemoData = (): ChartData[] => {
    const data: ChartData[] = [];
    const basePrice = 150;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const price = basePrice + Math.random() * 20 - 10;
      data.push({
        date: date.toLocaleDateString(),
        price: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000),
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        open: price + Math.random() * 2 - 1,
        close: price
      });
    }
    return data;
  };

  const { loading: polygonLoading, getStockData, getDividends } = usePolygonData();
  const { loading: analysisLoading, captureAndAnalyze } = useChartAnalysis();
  const { loading: openbbLoading, getTechnicalAnalysis } = useOpenBBData();

  const getDateRange = (timeframe: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case '1D':
        start.setDate(end.getDate() - 1);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'minute' };
      case '1W':
        start.setDate(end.getDate() - 7);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'hour' };
      case '1M':
        start.setMonth(end.getMonth() - 1);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'day' };
      case '3M':
        start.setMonth(end.getMonth() - 3);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'day' };
      case '1Y':
        start.setFullYear(end.getFullYear() - 1);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'day' };
      default:
        start.setMonth(end.getMonth() - 1);
        return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0], timespan: 'day' };
    }
  };

  const fetchData = async () => {
    if (demoMode) {
      // Use demo data for testing
      const demoData = generateDemoData();
      setChartData(demoData);
      setTechnicalIndicators({
        rsi: 45.6,
        macd: { macd: 0.23, signal: 0.18, histogram: 0.05 },
        bollinger: { upper: 155.20, middle: 150.00, lower: 144.80 }
      });
      setDividends([
        { cash_amount: 0.25, ex_dividend_date: '2024-02-15', pay_date: '2024-02-22', frequency: 4 },
        { cash_amount: 0.25, ex_dividend_date: '2024-05-15', pay_date: '2024-05-22', frequency: 4 }
      ]);
      toast.success('Demo data loaded successfully');
      return;
    }

    try {
      const { from, to, timespan } = getDateRange(timeframe);
      
      // Fetch stock data
      const stockData = await getStockData(ticker, from, to, timespan);
      
      if (stockData?.results) {
        const formattedData: ChartData[] = stockData.results.map((item: any) => ({
          date: new Date(item.t).toLocaleDateString(),
          price: item.c,
          volume: item.v,
          high: item.h,
          low: item.l,
          open: item.o,
          close: item.c
        }));
        
        setChartData(formattedData);
        
        // Get technical analysis
        const prices = stockData.results.map((item: any) => item.c);
        try {
          const techAnalysis = await getTechnicalAnalysis(ticker, prices);
          setTechnicalIndicators(techAnalysis?.technical_indicators || null);
        } catch (error) {
          console.error('Technical analysis error:', error);
        }
      }
      
      // Fetch dividends
      try {
        const dividendData = await getDividends(ticker);
        if (dividendData?.results) {
          setDividends(dividendData.results);
        }
      } catch (error) {
        console.error('Dividend data error:', error);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch market data. Try demo mode for testing.');
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
    // Load demo data by default for immediate testing
    setDemoMode(true);
    fetchData();
  }, [ticker, timeframe]);

  const isLoading = polygonLoading || analysisLoading || openbbLoading;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Enter ticker (e.g., AAPL)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-40"
              />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="1W">1W</SelectItem>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="3M">3M</SelectItem>
                  <SelectItem value="1Y">1Y</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchData} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Update'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setDemoMode(!demoMode);
                  if (!demoMode) {
                    fetchData();
                  }
                }}
                variant={demoMode ? "default" : "outline"}
                size="sm"
              >
                {demoMode ? 'Demo Mode' : 'Enable Demo'}
              </Button>
              <Button
                onClick={handleAnalyzeChart}
                disabled={analysisLoading || !chartData.length}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Camera className="w-4 h-4" />
                Analyze Chart
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {ticker} - Enhanced Trading Chart
            {dividends.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                <DollarSign className="w-3 h-3 mr-1" />
                {dividends.length} Dividends
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} id="trading-chart" className="h-96">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      typeof value === 'number' ? `$${value.toFixed(2)}` : value,
                      name
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for {ticker}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Tabs defaultValue="technical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="ict-strategy">ICT Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {technicalIndicators ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">RSI</h4>
                    <div className="text-2xl font-bold">
                      {technicalIndicators.rsi.toFixed(2)}
                    </div>
                    <Badge variant={technicalIndicators.rsi > 70 ? "destructive" : technicalIndicators.rsi < 30 ? "default" : "secondary"}>
                      {technicalIndicators.rsi > 70 ? "Overbought" : technicalIndicators.rsi < 30 ? "Oversold" : "Neutral"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">MACD</h4>
                    <div className="text-sm">
                      <div>MACD: {technicalIndicators.macd.macd.toFixed(4)}</div>
                      <div>Signal: {technicalIndicators.macd.signal.toFixed(4)}</div>
                      <div>Histogram: {technicalIndicators.macd.histogram.toFixed(4)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Bollinger Bands</h4>
                    <div className="text-sm">
                      <div>Upper: ${technicalIndicators.bollinger.upper.toFixed(2)}</div>
                      <div>Middle: ${technicalIndicators.bollinger.middle.toFixed(2)}</div>
                      <div>Lower: ${technicalIndicators.bollinger.lower.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Load chart data to see technical indicators</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Dividend Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dividends.length > 0 ? (
                <div className="space-y-4">
                  {dividends.slice(0, 5).map((dividend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <div className="font-semibold">${dividend.cash_amount}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Ex-Date</span>
                          <div>{dividend.ex_dividend_date}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Pay Date</span>
                          <div>{dividend.pay_date}</div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Frequency</span>
                          <div>{dividend.frequency}x/year</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No dividend data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Chart Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Click "Analyze Chart" to get AI-powered analysis including technical patterns, 
                  support/resistance levels, and trading recommendations.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ict-strategy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                ICT Strategy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Market Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyzing higher highs, higher lows, and trend direction based on ICT methodology.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Order Blocks</h4>
                    <p className="text-sm text-muted-foreground">
                      Identifying institutional order blocks and fair value gaps for potential entry points.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Liquidity Zones</h4>
                    <p className="text-sm text-muted-foreground">
                      Mapping liquidity sweeps and stop hunt areas for smart money concepts.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Session Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      London/New York session overlap analysis for optimal trading windows.
                    </p>
                  </div>
                </div>
                <div className="text-center text-muted-foreground">
                  Use "Analyze Chart" to get detailed ICT strategy recommendations based on current market structure.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};