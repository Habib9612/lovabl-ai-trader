import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, BarChart3, Activity, Search, Zap, Target, ExternalLink, Maximize2 } from 'lucide-react';
import { useFinvizData } from '@/hooks/useFinvizData';

interface ChartProps {
  symbol?: string;
}

export const FinvizChart: React.FC<ChartProps> = ({ symbol = 'AAPL' }) => {
  const { fetchStockData, stockData, isLoading } = useFinvizData();
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [inputSymbol, setInputSymbol] = useState(symbol);
  const [chartTimeframe, setChartTimeframe] = useState('d');
  const [chartType, setChartType] = useState('c');

  useEffect(() => {
    console.log('FinvizChart: Fetching data for', currentSymbol);
    fetchStockData(currentSymbol);
  }, [currentSymbol]);

  const handleSymbolChange = () => {
    if (inputSymbol.trim()) {
      setCurrentSymbol(inputSymbol.toUpperCase());
    }
  };

  const getFinvizChartUrl = (ticker: string, timeframe: string = 'd', chartType: string = 'c') => {
    return `https://finviz.com/chart.ashx?t=${ticker}&ty=${chartType}&ta=1&p=${timeframe}&s=l`;
  };

  const getFullScreenChartUrl = (ticker: string) => {
    return `https://finviz.com/quote.ashx?t=${ticker}`;
  };

  const currentPrice = stockData?.price ? parseFloat(stockData.price.replace(/[^0-9.-]/g, '')) : 0;
  const change = stockData?.change || '0.00';
  const isPositive = !change.startsWith('-');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Live Finviz Charts
          </h2>
          <p className="text-lg text-gray-600">Real-time stock charts powered by Finviz</p>
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

      {/* Stock Data Card */}
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
                  <Badge className="bg-white/20 text-white border-white/30">Live Finviz Data</Badge>
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-80">Market Status</p>
                <p className="text-lg font-semibold">Open - {new Date().toLocaleTimeString()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.open(getFullScreenChartUrl(currentSymbol), '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Finviz
              </Button>
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
                { 
                  label: 'Current Price', 
                  value: `$${stockData.price || '0.00'}`, 
                  color: 'bg-blue-50 border-blue-200 text-blue-900' 
                },
                { 
                  label: 'Daily Change', 
                  value: change, 
                  color: isPositive ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900',
                  icon: isPositive ? TrendingUp : TrendingDown
                },
                { 
                  label: 'Volume', 
                  value: stockData.volume || '-', 
                  color: 'bg-purple-50 border-purple-200 text-purple-900' 
                },
                { 
                  label: 'Market Cap', 
                  value: stockData.marketCap || '-', 
                  color: 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                },
                { 
                  label: 'P/E Ratio', 
                  value: stockData.pe || '-', 
                  color: 'bg-orange-50 border-orange-200 text-orange-900' 
                },
                { 
                  label: 'Beta', 
                  value: stockData.beta || '-', 
                  color: 'bg-gray-50 border-gray-200 text-gray-900' 
                }
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

      {/* Live Finviz Chart */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-2xl font-bold">{currentSymbol} - Live Chart</CardTitle>
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Finviz Live
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {/* Chart Controls */}
              <div className="flex items-center gap-2">
                <Select value={chartTimeframe} onValueChange={setChartTimeframe}>
                  <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d">Daily</SelectItem>
                    <SelectItem value="w">Weekly</SelectItem>
                    <SelectItem value="m">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c">Candle</SelectItem>
                    <SelectItem value="l">Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.open(getFullScreenChartUrl(currentSymbol), '_blank')}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Embedded Finviz Chart */}
            <div className="bg-white">
              <iframe
                src={getFinvizChartUrl(currentSymbol, chartTimeframe, chartType)}
                className="w-full h-[600px] border-0"
                title={`${currentSymbol} Finviz Chart`}
                loading="lazy"
                style={{ minHeight: '600px' }}
              />
            </div>
            
            {/* Chart overlay with additional info */}
            <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live data from Finviz
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Tabs for Different Views */}
      <Tabs defaultValue="intraday" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intraday">Intraday</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="intraday" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intraday Chart - {currentSymbol}</CardTitle>
              <CardDescription>Real-time intraday price movement</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={getFinvizChartUrl(currentSymbol, 'i', 'c')}
                className="w-full h-[500px] border-0"
                title={`${currentSymbol} Intraday Chart`}
                loading="lazy"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Chart - {currentSymbol}</CardTitle>
              <CardDescription>Daily price action with technical indicators</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={getFinvizChartUrl(currentSymbol, 'd', 'c')}
                className="w-full h-[500px] border-0"
                title={`${currentSymbol} Daily Chart`}
                loading="lazy"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Chart - {currentSymbol}</CardTitle>
              <CardDescription>Weekly price trends and patterns</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={getFinvizChartUrl(currentSymbol, 'w', 'c')}
                className="w-full h-[500px] border-0"
                title={`${currentSymbol} Weekly Chart`}
                loading="lazy"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Chart - {currentSymbol}</CardTitle>
              <CardDescription>Long-term price movement analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                src={getFinvizChartUrl(currentSymbol, 'm', 'c')}
                className="w-full h-[500px] border-0"
                title={`${currentSymbol} Monthly Chart`}
                loading="lazy"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Technical Analysis Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-gradient-card">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Key Levels & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Key Levels</p>
              <div className="space-y-3">
                {[
                  { label: '52W High', value: stockData?.range52w?.split(' - ')[1] || '-', color: 'text-green-600' },
                  { label: '52W Low', value: stockData?.range52w?.split(' - ')[0] || '-', color: 'text-red-600' },
                  { label: 'EPS (TTM)', value: stockData?.eps || '-', color: 'text-blue-600' },
                  { label: 'Dividend', value: stockData?.dividend || '-', color: 'text-orange-600' }
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

        <Card className="border-0 shadow-xl bg-gradient-card">
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.open(`https://finviz.com/quote.ashx?t=${currentSymbol}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Finviz Page
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.open(`https://finviz.com/screener.ashx?v=111&f=ta_perf_day_o5&t=${currentSymbol}`, '_blank')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Similar Stocks
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.open(`https://finviz.com/news.ashx?t=${currentSymbol}`, '_blank')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Latest News
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};