import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle, Clock, BarChart3, Upload } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const aiInsights = [
  {
    id: 1,
    type: 'bullish',
    symbol: 'AAPL',
    confidence: 87,
    prediction: 'Strong upward momentum expected',
    timeframe: '1-2 weeks',
    reasoning: 'ICT analysis shows bullish order blocks and fair value gaps being filled',
    accuracy: 92
  },
  {
    id: 2,
    type: 'bearish',
    symbol: 'TSLA',
    confidence: 73,
    prediction: 'Potential downside risk',
    timeframe: '3-5 days',
    reasoning: 'LSTM model predicts downward trend with liquidity sweep expected',
    accuracy: 85
  },
  {
    id: 3,
    type: 'neutral',
    symbol: 'GOOGL',
    confidence: 65,
    prediction: 'Sideways consolidation likely',
    timeframe: '1 week',
    reasoning: 'Mixed signals from ICT and LSTM analysis',
    accuracy: 78
  }
];

const sentimentData = [
  { date: 'Mon', bullish: 65, bearish: 35, neutral: 30 },
  { date: 'Tue', bullish: 72, bearish: 28, neutral: 25 },
  { date: 'Wed', bullish: 58, bearish: 42, neutral: 35 },
  { date: 'Thu', bullish: 80, bearish: 20, neutral: 15 },
  { date: 'Fri', bullish: 75, bearish: 25, neutral: 20 }
];

const radarData = [
  { metric: 'ICT Analysis', score: 85 },
  { metric: 'LSTM Prediction', score: 72 },
  { metric: 'Market Sentiment', score: 90 },
  { metric: 'Volume Analysis', score: 78 },
  { metric: 'Momentum', score: 82 },
  { metric: 'Volatility', score: 65 }
];

export default function AIAnalytics() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [lstmPredictions, setLstmPredictions] = useState<any>(null);
  const [ictAnalysis, setIctAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <AlertTriangle className="h-4 w-4" />;
      case 'neutral': return <Clock className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Fetch historical data
      const fetchDataResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'fetch_historical_data',
          symbol: selectedSymbol,
          interval: '1d',
          range: '1mo'
        }),
      });

      if (!fetchDataResponse.ok) {
        throw new Error(`Failed to fetch historical data: ${fetchDataResponse.statusText}`);
      }
      const fetchedDataResult = await fetchDataResponse.json();
      if (!fetchedDataResult.success || !fetchedDataResult.data) {
        throw new Error(fetchedDataResult.error || 'No historical data received');
      }

      // Transform fetched data to the format expected by Python scripts
      const transformedData = {
        open: fetchedDataResult.data.map((d: any) => d.open),
        high: fetchedDataResult.data.map((d: any) => d.high),
        low: fetchedDataResult.data.map((d: any) => d.low),
        close: fetchedDataResult.data.map((d: any) => d.close),
        volume: fetchedDataResult.data.map((d: any) => d.volume),
      };

      // 2. Call LSTM prediction
      const lstmResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'lstm_prediction',
          data: transformedData
        }),
      });

      if (lstmResponse.ok) {
        const lstmResult = await lstmResponse.json();
        setLstmPredictions(lstmResult.predictions);
      } else {
        console.error('LSTM prediction failed:', lstmResponse.statusText);
        toast({
          variant: "destructive",
          title: "LSTM Prediction Failed",
          description: `Failed to get LSTM predictions: ${lstmResponse.statusText}`,
        });
      }

      // 3. Call ICT analysis
      const ictResponse = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ict_analysis',
          data: transformedData
        }),
      });

      if (ictResponse.ok) {
        const ictResult = await ictResponse.json();
        setIctAnalysis(ictResult.analysis);
      } else {
        console.error('ICT analysis failed:', ictResponse.statusText);
        toast({
          variant: "destructive",
          title: "ICT Analysis Failed",
          description: `Failed to get ICT analysis: ${ictResponse.statusText}`,
        });
      }

      toast({
        title: "Analysis Complete",
        description: `Smart Trade Analysis completed for ${selectedSymbol}`,
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: `Failed to complete analysis: ${error.message}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      
      setIsAnalyzing(true);
      try {
        const response = await fetch('http://localhost:8000', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'chart_analysis',
            data: {
              base64: base64,
              mimeType: file.type
            },
            prompt: `Analyze this ${selectedSymbol} chart using ICT concepts and provide trading recommendations.`
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setAnalysisResults(result.analysis);
          toast({
            title: "Chart Analysis Complete",
            description: `Chart analysis completed for ${selectedSymbol}`,
          });
        } else {
          console.error('Chart analysis failed:', response.statusText);
          toast({
            variant: "destructive",
            title: "Chart Analysis Failed",
            description: `Failed to analyze chart: ${response.statusText}`,
          });
        }
      } catch (error) {
        console.error('Chart analysis error:', error);
        toast({
          variant: "destructive",
          title: "Chart Analysis Failed",
          description: "Failed to analyze chart. Please try again.",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Trade Analytics</h1>
          <p className="text-muted-foreground">Advanced AI-powered market analysis with ICT concepts and LSTM predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter symbol"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
            className="w-32"
          />
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LSTM Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">Last 30 predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ICT Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active order blocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fair Value Gaps</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Unfilled gaps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Current analysis</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="lstm">LSTM Predictions</TabsTrigger>
          <TabsTrigger value="ict">ICT Analysis</TabsTrigger>
          <TabsTrigger value="chart">Chart Analysis</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                <SelectItem value="ict">ICT Analysis Only</SelectItem>
                <SelectItem value="lstm">LSTM Predictions Only</SelectItem>
                <SelectItem value="sentiment">Sentiment Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getInsightColor(insight.type)}>
                        {getInsightIcon(insight.type)}
                        {insight.type.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-lg">{insight.symbol}</span>
                    </div>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{insight.prediction}</h4>
                    <p className="text-muted-foreground text-sm">{insight.reasoning}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Timeframe: {insight.timeframe}</span>
                    <span className="text-muted-foreground">Historical accuracy: {insight.accuracy}%</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Set Alert</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lstm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LSTM Price Predictions for {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              {lstmPredictions ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4">
                    {lstmPredictions.map((prediction: number, index: number) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Day {index + 1}</div>
                        <div className="text-xl font-bold">${prediction.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lstmPredictions.map((pred: number, idx: number) => ({ day: idx + 1, price: pred }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Click "Analyze" to generate LSTM predictions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ict" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ICT Analysis Results for {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              {ictAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Order Blocks</h4>
                      <p className="text-sm text-muted-foreground">
                        Bullish: {ictAnalysis.order_blocks?.bullish || 'N/A'}<br/>
                        Bearish: {ictAnalysis.order_blocks?.bearish || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Fair Value Gaps</h4>
                      <p className="text-sm text-muted-foreground">
                        Detected: {ictAnalysis.fair_value_gaps?.count || 'N/A'}<br/>
                        Status: {ictAnalysis.fair_value_gaps?.status || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Market Structure</h4>
                      <p className="text-sm text-muted-foreground">
                        Trend: {ictAnalysis.market_structure?.trend || 'N/A'}<br/>
                        Break: {ictAnalysis.market_structure?.break || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Liquidity Zones</h4>
                      <p className="text-sm text-muted-foreground">
                        Buy Side: {ictAnalysis.liquidity?.buy_side || 'N/A'}<br/>
                        Sell Side: {ictAnalysis.liquidity?.sell_side || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Click "Analyze" to generate ICT analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="chart-upload"
                  />
                  <label htmlFor="chart-upload">
                    <Button variant="outline" className="cursor-pointer" disabled={isAnalyzing}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Chart Image
                    </Button>
                  </label>
                </div>
                
                {analysisResults && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Analysis Results:</h4>
                    <div className="whitespace-pre-wrap text-sm">{analysisResults}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bullish"
                    stackId="1"
                    stroke="hsl(var(--green-600))"
                    fill="hsl(var(--green-600))"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="hsl(var(--yellow-600))"
                    fill="hsl(var(--yellow-600))"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="bearish"
                    stackId="1"
                    stroke="hsl(var(--red-600))"
                    fill="hsl(var(--red-600))"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
