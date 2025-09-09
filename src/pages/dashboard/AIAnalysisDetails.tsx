import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  DollarSign,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  timeframe: string;
}

interface RiskAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  positionSize: number;
  maxLoss: number;
  riskPercentage: number;
  volatility: number;
}

interface TechnicalAnalysis {
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  support: number;
  resistance: number;
  rsi: number;
  macd: string;
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
}

const AIAnalysisDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const symbol = searchParams.get('symbol') || 'AAPL';
  const currentPrice = parseFloat(searchParams.get('price') || '235');
  
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    signal: TradingSignal;
    risk: RiskAnalysis;
    technical: TechnicalAnalysis;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    generateAnalysis();
  }, [symbol, currentPrice]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockAnalysis = {
      signal: {
        action: currentPrice > 235 ? 'SELL' as const : 'BUY' as const,
        confidence: 85,
        entryPrice: currentPrice,
        targetPrice: currentPrice > 235 ? 225 : 245,
        stopLoss: currentPrice > 235 ? 240 : 230,
        riskReward: 2.8,
        timeframe: '1-2 weeks'
      },
      risk: {
        riskLevel: 'MEDIUM' as const,
        positionSize: 2.5,
        maxLoss: 500,
        riskPercentage: 2,
        volatility: 28.5
      },
      technical: {
        trend: currentPrice > 235 ? 'BEARISH' as const : 'BULLISH' as const,
        support: 230,
        resistance: 240,
        rsi: 58.4,
        macd: 'Bullish Divergence',
        movingAverages: {
          sma20: currentPrice * 0.98,
          sma50: currentPrice * 0.96,
          sma200: currentPrice * 0.92
        }
      },
      explanation: currentPrice > 235 
        ? `${symbol} shows overextension after recent gains. Technical indicators suggest a pullback is likely. RSI at 58.4 indicates moderate buying pressure, but resistance at $240 is strong. Volume analysis shows distribution patterns. Risk-reward ratio of 2.8:1 makes this a favorable short setup with proper risk management.`
        : `${symbol} is approaching key support levels with bullish divergence on MACD. The recent dip presents a buying opportunity as the stock bounces off the $230 support. Volume is increasing on the bounce, and the 20-period SMA is providing dynamic support. Technical setup favors upward movement toward $245 resistance.`
    };

    setAnalysis(mockAnalysis);
    setIsLoading(false);
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'BEARISH': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Analysis for {symbol}
              </h1>
              <p className="text-muted-foreground">Generating comprehensive trading analysis...</p>
            </div>
          </div>
          
          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <Brain className="w-16 h-16 text-blue-600 animate-pulse mb-4" />
              <div className="absolute -inset-4 bg-blue-600/20 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Analyzing Market Data</h2>
            <p className="text-muted-foreground mb-8">Please wait while our AI processes the information...</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[
                'Trading Signal',
                'Risk Assessment', 
                'Technical Analysis',
                'Market Sentiment',
                'Price Targets',
                'Risk Management'
              ].map((title, i) => (
                <Card key={i} className="h-48">
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-red-600">Analysis Error</h1>
              <p className="text-muted-foreground">Failed to generate analysis</p>
            </div>
          </div>
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg">Something went wrong. Please try again.</p>
            <Button onClick={generateAnalysis} className="mt-4">
              <Brain className="w-4 h-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trading
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Trading Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive analysis for <span className="font-semibold text-foreground">{symbol}</span> at 
              <span className="font-semibold text-foreground"> ${currentPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Signal Card */}
          <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Trading Signal</CardTitle>
                    <CardDescription className="text-lg">AI-generated trading recommendation</CardDescription>
                  </div>
                </div>
                <div className="text-center">
                  <Badge className={`${getSignalColor(analysis.signal.action)} text-xl px-6 py-3 font-bold`}>
                    {analysis.signal.action}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">{analysis.signal.confidence}% Confidence</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 border shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-2">ENTRY PRICE</p>
                  <p className="text-3xl font-bold text-foreground">${analysis.signal.entryPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-2">TARGET</p>
                  <p className="text-3xl font-bold text-green-600">${analysis.signal.targetPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-2">STOP LOSS</p>
                  <p className="text-3xl font-bold text-red-600">${analysis.signal.stopLoss.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground mb-2">RISK:REWARD</p>
                  <p className="text-3xl font-bold text-blue-600">{analysis.signal.riskReward}:1</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-semibold">
                    Timeframe: <span className="text-blue-600">{analysis.signal.timeframe}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management & Technical Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk Management */}
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Risk Management</CardTitle>
                    <CardDescription>Position sizing and risk assessment</CardDescription>
                  </div>
                  <Badge className={`${getRiskColor(analysis.risk.riskLevel)} ml-auto`} variant="outline">
                    {analysis.risk.riskLevel} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">POSITION SIZE</p>
                    <p className="text-2xl font-bold">{analysis.risk.positionSize}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200">
                    <p className="text-sm font-medium text-muted-foreground mb-2">MAX LOSS</p>
                    <p className="text-2xl font-bold text-red-600">${analysis.risk.maxLoss}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200">
                    <p className="text-sm font-medium text-muted-foreground mb-2">RISK %</p>
                    <p className="text-2xl font-bold text-orange-600">{analysis.risk.riskPercentage}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                    <p className="text-sm font-medium text-muted-foreground mb-2">VOLATILITY</p>
                    <p className="text-2xl font-bold text-purple-600">{analysis.risk.volatility}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Analysis */}
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Technical Analysis</CardTitle>
                    <CardDescription>Key technical indicators and levels</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {getTrendIcon(analysis.technical.trend)}
                    <Badge variant="outline">{analysis.technical.trend}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                    <p className="text-sm font-medium text-muted-foreground mb-2">SUPPORT</p>
                    <p className="text-2xl font-bold text-green-600">${analysis.technical.support.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200">
                    <p className="text-sm font-medium text-muted-foreground mb-2">RESISTANCE</p>
                    <p className="text-2xl font-bold text-red-600">${analysis.technical.resistance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">RSI</p>
                    <p className="text-xl font-bold text-purple-600">{analysis.technical.rsi}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">MACD</p>
                    <p className="text-lg font-bold text-green-600">{analysis.technical.macd}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Explanation */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Analysis Explanation</CardTitle>
                  <CardDescription>Detailed reasoning behind the recommendation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Brain className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-base leading-relaxed font-medium">
                  {analysis.explanation}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">High Probability</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Strong technical setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
                  <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Great Risk:Reward</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{analysis.signal.riskReward}:1 ratio</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200">
                  <Shield className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-200">Controlled Risk</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">{analysis.risk.riskPercentage}% portfolio risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-base font-medium">
              <strong>Important Disclaimer:</strong> This analysis is for educational purposes only and does not constitute financial advice. 
              Trading involves substantial risk and may result in losses. Always conduct your own research and consider your financial situation 
              before making any investment decisions.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDetails;