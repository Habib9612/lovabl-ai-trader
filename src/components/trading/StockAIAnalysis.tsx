import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, AlertTriangle, Target, BarChart3, Brain, DollarSign, Activity, Globe, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ComprehensiveAnalysis {
  coreData: {
    marketCap: string;
    pe: number | null;
    dividendYield: number | null;
    volume: string;
    relativeVolume: number;
    yearHighLow: string;
    positionInRange: number;
  };
  technicals: {
    trend: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
    };
    indicators: {
      rsi: number;
      rsiSignal: string;
      momentum: number;
      volatility: number;
    };
    movingAverages: {
      ma20: number;
      ma50: number;
      ma200: number;
    };
  };
  sentiment: {
    score: number;
    newsCount: number;
    analystRatings: {
      buy: number;
      hold: number;
      sell: number;
    };
  };
  forecast: {
    aiProbability: number;
    expectedVolatility: string;
    riskScore: number;
    targetPrice: number;
    stopLoss: number;
  };
  insights: {
    summary: string;
    keySignals: string[];
    recommendation: string;
    confidence: number;
  };
  rawData?: any;
}

export const StockAIAnalysis = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('medium-term');
  const [strategy, setStrategy] = useState('growth-investing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysis | null>(null);
  
  const { user } = useAuth();

  const handleAnalysis = async () => {
    if (!symbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    if (!user) {
      toast.error('Please log in to use AI analysis');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call the enhanced AI analysis function
      const { data, error } = await supabase.functions.invoke('stock-ai-analysis', {
        body: {
          symbol: symbol.toUpperCase().trim(),
          timeframe: timeframe,
          strategy: strategy
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
      toast.success('Comprehensive analysis completed!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to complete analysis: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'Bullish' ? 'text-green-600' : 'text-red-600';
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'text-red-600';
    if (rsi < 30) return 'text-green-600';
    return 'text-blue-600';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      case 'HOLD': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Edge AI Analysis
            <Badge variant="secondary" className="ml-auto">
              Professional Grade
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive AI-powered market analysis with real-time data, technical indicators, and sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="AAPL, TSLA, MSFT..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="uppercase font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Analysis Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intraday">Intraday (1-4 hours)</SelectItem>
                  <SelectItem value="short-term">Short-term (1-7 days)</SelectItem>
                  <SelectItem value="medium-term">Medium-term (1-4 weeks)</SelectItem>
                  <SelectItem value="long-term">Long-term (1-6 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="strategy">Trading Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-trading">Day Trading</SelectItem>
                  <SelectItem value="swing-trading">Swing Trading</SelectItem>
                  <SelectItem value="momentum">Momentum Trading</SelectItem>
                  <SelectItem value="value-investing">Value Investing</SelectItem>
                  <SelectItem value="growth-investing">Growth Investing</SelectItem>
                  <SelectItem value="ict-strategy">ICT Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAnalysis}
            disabled={isAnalyzing || !symbol.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Edge Analysis...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analyze Stock
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          {/* Core Market Data Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisResult.coreData.marketCap}</div>
                <p className="text-xs text-muted-foreground">P/E: {formatNumber(analysisResult.coreData.pe)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisResult.coreData.volume}</div>
                <p className="text-xs text-muted-foreground">Relative: {analysisResult.coreData.relativeVolume}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  52W Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">${analysisResult.coreData.yearHighLow}</div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: `${Number(analysisResult.coreData.positionInRange) || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{isNaN(Number(analysisResult.coreData.positionInRange)) ? 'N/A' : `${Number(analysisResult.coreData.positionInRange).toFixed(1)}% of range`}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getRecommendationColor(analysisResult.insights.recommendation)}>
                  {analysisResult.insights.recommendation}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Confidence: {analysisResult.insights.confidence}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Technical Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Trend Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Trend Direction</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Short-term (20D):</span>
                      <span className={`text-sm font-medium ${getTrendColor(analysisResult.technicals.trend.shortTerm)}`}>
                        {analysisResult.technicals.trend.shortTerm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Medium-term (50D):</span>
                      <span className={`text-sm font-medium ${getTrendColor(analysisResult.technicals.trend.mediumTerm)}`}>
                        {analysisResult.technicals.trend.mediumTerm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Long-term (200D):</span>
                      <span className={`text-sm font-medium ${getTrendColor(analysisResult.technicals.trend.longTerm)}`}>
                        {analysisResult.technicals.trend.longTerm}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moving Averages */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Moving Averages</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">MA20:</span>
                      <span className="text-sm font-medium">{formatPrice(analysisResult.technicals.movingAverages.ma20)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">MA50:</span>
                      <span className="text-sm font-medium">{formatPrice(analysisResult.technicals.movingAverages.ma50)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">MA200:</span>
                      <span className="text-sm font-medium">{formatPrice(analysisResult.technicals.movingAverages.ma200)}</span>
                    </div>
                  </div>
                </div>

                {/* Momentum Indicators */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Momentum & Volatility</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">RSI (14):</span>
                        <span className={`text-sm font-medium ${getRSIColor(analysisResult.technicals.indicators.rsi)}`}>
                          {analysisResult.technicals.indicators.rsi?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <Progress value={analysisResult.technicals.indicators.rsi} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{analysisResult.technicals.indicators.rsiSignal}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">20D Momentum:</span>
                      <span className={`text-sm font-medium ${analysisResult.technicals.indicators.momentum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analysisResult.technicals.indicators.momentum?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility (ATR):</span>
                      <span className="text-sm font-medium">${analysisResult.technicals.indicators.volatility?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment & Forecast Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Sentiment Score</span>
                    <span className="text-sm font-medium">{analysisResult.sentiment.score}/100</span>
                  </div>
                  <Progress value={analysisResult.sentiment.score} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Recent News:</span>
                    <span className="text-sm font-medium">{analysisResult.sentiment.newsCount} articles</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Analyst Ratings:</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">{analysisResult.sentiment.analystRatings.buy}</div>
                        <div className="text-xs text-green-600">BUY</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-lg font-bold text-yellow-600">{analysisResult.sentiment.analystRatings.hold}</div>
                        <div className="text-xs text-yellow-600">HOLD</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <div className="text-lg font-bold text-red-600">{analysisResult.sentiment.analystRatings.sell}</div>
                        <div className="text-xs text-red-600">SELL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Forecast & Risk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">AI Probability (Outperform)</span>
                    <span className="text-sm font-medium">{analysisResult.forecast.aiProbability}%</span>
                  </div>
                  <Progress value={analysisResult.forecast.aiProbability} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Risk Score</span>
                    <span className="text-sm font-medium">{analysisResult.forecast.riskScore}/100</span>
                  </div>
                  <Progress value={analysisResult.forecast.riskScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Expected Volatility: {analysisResult.forecast.expectedVolatility}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Price</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(analysisResult.forecast.targetPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="text-lg font-bold text-red-600">{formatPrice(analysisResult.forecast.stopLoss)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Insights & Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Market Story</h4>
                <p className="text-sm leading-relaxed">{analysisResult.insights.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Trading Signals</h4>
                <div className="space-y-2">
                  {analysisResult.insights.keySignals.map((signal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
};