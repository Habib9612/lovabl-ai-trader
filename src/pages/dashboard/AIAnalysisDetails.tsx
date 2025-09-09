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
  Zap,
  Timer,
  TrendingDown as TrendIcon
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockAnalysis = {
      signal: {
        action: currentPrice > 235 ? 'SELL' as const : 'BUY' as const,
        confidence: 87,
        entryPrice: currentPrice,
        targetPrice: currentPrice > 235 ? 225 : 245,
        stopLoss: currentPrice > 235 ? 240 : 230,
        riskReward: 3.2,
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
        ? `${symbol} shows signs of overextension with strong resistance at $240. Technical indicators suggest a pullback to $225 support level. RSI at 58.4 indicates moderate buying pressure but momentum is weakening. Volume analysis confirms distribution patterns among institutional investors.`
        : `${symbol} presents an excellent buying opportunity near key support at $230. MACD shows bullish divergence while RSI indicates oversold conditions. Volume is increasing on the bounce, suggesting strong institutional accumulation. Technical setup favors movement toward $245 resistance.`
    };

    setAnalysis(mockAnalysis);
    setIsLoading(false);
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-500 hover:bg-green-600 text-white shadow-lg';
      case 'SELL': return 'bg-red-500 hover:bg-red-600 text-white shadow-lg';
      default: return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg';
    }
  };

  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="w-5 h-5" />;
      case 'SELL': return <TrendingDown className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto p-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate(-1)}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Trading
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Analysis for {symbol}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">Generating comprehensive trading insights...</p>
            </div>
          </div>
          
          {/* Beautiful Loading Animation */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
              <div className="absolute -inset-8 bg-primary/10 rounded-full animate-ping animation-delay-200"></div>
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Analyzing Market Data
            </h2>
            <p className="text-lg text-muted-foreground mb-12 text-center max-w-md">
              Our AI is processing technical indicators, market sentiment, and risk factors to generate your personalized trading recommendation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {[
                { title: 'Market Analysis', desc: 'Processing price action & volume' },
                { title: 'Risk Assessment', desc: 'Calculating position sizing' },
                { title: 'Technical Signals', desc: 'Analyzing indicators & patterns' },
                { title: 'Sentiment Analysis', desc: 'Evaluating market psychology' },
                { title: 'Price Targets', desc: 'Identifying key levels' },
                { title: 'Final Recommendation', desc: 'Generating trading signal' }
              ].map((item, i) => (
                <Card key={i} className="h-40 bg-gradient-card border-0 shadow-card hover:shadow-primary/10 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      </div>
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="container mx-auto p-8 max-w-7xl">
          <div className="flex items-center gap-6 mb-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Trading
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-red-600">Analysis Error</h1>
              <p className="text-xl text-muted-foreground mt-2">Failed to generate analysis</p>
            </div>
          </div>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-lg text-muted-foreground mb-8">We couldn't generate the analysis. Please try again.</p>
            <Button onClick={generateAnalysis} size="lg" className="shadow-lg">
              <Brain className="w-5 h-5 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate(-1)}
            className="shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Trading
          </Button>
          <div className="flex-1">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              AI Trading Analysis
            </h1>
            <div className="flex items-center gap-4 text-xl">
              <span className="text-muted-foreground">Analysis for</span>
              <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                {symbol}
              </Badge>
              <span className="text-muted-foreground">at</span>
              <span className="font-bold text-2xl text-foreground">${currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Hero Trading Signal */}
          <Card className="border-0 shadow-2xl bg-gradient-card overflow-hidden">
            <div className="bg-gradient-primary text-white p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    {getSignalIcon(analysis.signal.action)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Trading Signal</h2>
                    <p className="text-xl opacity-90">AI-powered recommendation with {analysis.signal.confidence}% confidence</p>
                  </div>
                </div>
                <div className="text-center">
                  <Badge className={`${getSignalColor(analysis.signal.action)} text-2xl px-8 py-4 font-bold border-0`}>
                    {getSignalIcon(analysis.signal.action)}
                    <span className="ml-2">{analysis.signal.action}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Entry Price', value: `$${analysis.signal.entryPrice.toFixed(2)}`, color: 'bg-blue-50 border-blue-200 text-blue-900' },
                  { label: 'Target Price', value: `$${analysis.signal.targetPrice.toFixed(2)}`, color: 'bg-green-50 border-green-200 text-green-900' },
                  { label: 'Stop Loss', value: `$${analysis.signal.stopLoss.toFixed(2)}`, color: 'bg-red-50 border-red-200 text-red-900' },
                  { label: 'Risk:Reward', value: `${analysis.signal.riskReward}:1`, color: 'bg-purple-50 border-purple-200 text-purple-900' }
                ].map((item, i) => (
                  <div key={i} className={`text-center p-6 rounded-xl border-2 ${item.color} hover:shadow-lg transition-all`}>
                    <p className="text-sm font-semibold mb-3 opacity-70">{item.label}</p>
                    <p className="text-3xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center gap-3">
                  <Timer className="w-6 h-6 text-blue-600" />
                  <span className="text-xl font-bold text-blue-900">
                    Recommended Timeframe: {analysis.signal.timeframe}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk & Technical Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Risk Management */}
            <Card className="border-0 shadow-xl bg-gradient-card">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Risk Management</CardTitle>
                    <CardDescription className="text-lg">Position sizing and risk assessment</CardDescription>
                  </div>
                  <Badge className={`${getRiskColor(analysis.risk.riskLevel)} px-4 py-2 font-bold text-lg border-2`}>
                    {analysis.risk.riskLevel} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Position Size', value: `${analysis.risk.positionSize}%`, color: 'bg-blue-50 border-blue-200 text-blue-900' },
                    { label: 'Max Loss', value: `$${analysis.risk.maxLoss}`, color: 'bg-red-50 border-red-200 text-red-900' },
                    { label: 'Risk Percentage', value: `${analysis.risk.riskPercentage}%`, color: 'bg-orange-50 border-orange-200 text-orange-900' },
                    { label: 'Volatility', value: `${analysis.risk.volatility}%`, color: 'bg-purple-50 border-purple-200 text-purple-900' }
                  ].map((item, i) => (
                    <div key={i} className={`text-center p-4 rounded-lg border-2 ${item.color} hover:shadow-md transition-all`}>
                      <p className="text-sm font-semibold mb-2 opacity-70">{item.label}</p>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Analysis */}
            <Card className="border-0 shadow-xl bg-gradient-card">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Technical Analysis</CardTitle>
                    <CardDescription className="text-lg">Key indicators and price levels</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(analysis.technical.trend)}
                    <Badge variant="outline" className="px-4 py-2 font-bold text-lg">
                      {analysis.technical.trend}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 rounded-lg border-2 bg-green-50 border-green-200 text-green-900 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold mb-2 opacity-70">Support Level</p>
                    <p className="text-2xl font-bold">${analysis.technical.support.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border-2 bg-red-50 border-red-200 text-red-900 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold mb-2 opacity-70">Resistance Level</p>
                    <p className="text-2xl font-bold">${analysis.technical.resistance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-lg border bg-muted/50 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">RSI</p>
                    <p className="text-xl font-bold text-purple-600">{analysis.technical.rsi}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border bg-muted/50 hover:shadow-md transition-all">
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">MACD</p>
                    <p className="text-lg font-bold text-green-600">{analysis.technical.macd}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Explanation */}
          <Card className="border-0 shadow-xl bg-gradient-card">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">AI Analysis Explanation</CardTitle>
                  <CardDescription className="text-lg">Detailed reasoning behind our recommendation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Alert className="mb-8 border-2 border-blue-200 bg-blue-50 shadow-sm">
                <Brain className="h-6 w-6 text-blue-600" />
                <AlertDescription className="text-lg leading-relaxed font-medium text-blue-900">
                  {analysis.explanation}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: CheckCircle, title: 'High Probability Setup', desc: 'Strong technical confirmation', color: 'green' },
                  { icon: DollarSign, title: 'Excellent Risk:Reward', desc: `${analysis.signal.riskReward}:1 ratio`, color: 'blue' },
                  { icon: Shield, title: 'Controlled Risk', desc: `${analysis.risk.riskPercentage}% portfolio risk`, color: 'orange' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-6 rounded-xl bg-${item.color}-50 border-2 border-${item.color}-200 hover:shadow-lg transition-all`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-600 flex-shrink-0`} />
                    <div>
                      <p className={`font-bold text-lg text-${item.color}-900`}>{item.title}</p>
                      <p className={`text-sm text-${item.color}-700`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <AlertDescription className="text-amber-900 text-lg font-medium">
              <strong>Important Disclaimer:</strong> This analysis is for educational purposes only and does not constitute financial advice. 
              Trading involves substantial risk and may result in losses. Always conduct your own research and consider your financial situation 
              before making any investment decisions. Past performance does not guarantee future results.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDetails;