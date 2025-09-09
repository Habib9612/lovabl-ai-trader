import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Brain,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useFinvizData } from '@/hooks/useFinvizData';

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

interface AIAnalysisProps {
  symbol: string;
  currentPrice: number;
}

export const AITradingAnalysis: React.FC<AIAnalysisProps> = ({ symbol, currentPrice }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    signal: TradingSignal;
    risk: RiskAnalysis;
    technical: TechnicalAnalysis;
    explanation: string;
  } | null>(null);

  const generateComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis = {
      signal: {
        action: currentPrice > 235 ? 'SELL' as const : 'BUY' as const,
        confidence: 78,
        entryPrice: currentPrice,
        targetPrice: currentPrice > 235 ? 225 : 245,
        stopLoss: currentPrice > 235 ? 240 : 230,
        riskReward: 2.5,
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
        ? `${symbol} is showing signs of overextension after recent gains. Technical indicators suggest a pullback is likely. The RSI at 58.4 indicates moderate buying pressure, but resistance at $240 is strong. Volume analysis shows distribution patterns. Risk-reward ratio of 2.5:1 makes this a favorable short setup with proper risk management.`
        : `${symbol} is approaching key support levels with bullish divergence on MACD. The recent dip presents a buying opportunity as the stock bounces off the $230 support. Volume is increasing on the bounce, and the 20-period SMA is providing dynamic support. Technical setup favors upward movement toward $245 resistance.`
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100 border-green-300';
      case 'SELL': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-300';
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

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">AI Trading Analysis</h3>
          <p className="text-sm text-muted-foreground">Analysis for {symbol}</p>
        </div>
        <Button 
          onClick={generateComprehensiveAnalysis}
          disabled={isAnalyzing}
          variant="default"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get Analysis
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Main Signal Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <CardTitle className="text-base">Trading Signal</CardTitle>
                  <Badge className={getSignalColor(analysis.signal.action)}>
                    {analysis.signal.action}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {analysis.signal.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Entry</p>
                  <p className="font-semibold">${analysis.signal.entryPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 rounded bg-green-500/10">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-semibold text-green-600">${analysis.signal.targetPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 rounded bg-red-500/10">
                  <p className="text-xs text-muted-foreground">Stop Loss</p>
                  <p className="font-semibold text-red-600">${analysis.signal.stopLoss.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 rounded bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">R:R</p>
                  <p className="font-semibold text-blue-600">{analysis.signal.riskReward}:1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk & Technical Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <CardTitle className="text-base">Risk Management</CardTitle>
                  <Badge variant="outline" className={getRiskColor(analysis.risk.riskLevel)}>
                    {analysis.risk.riskLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Position Size</p>
                    <p className="font-semibold">{analysis.risk.positionSize}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-red-500/10">
                    <p className="text-xs text-muted-foreground">Max Loss</p>
                    <p className="font-semibold text-red-600">${analysis.risk.maxLoss}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-orange-500/10">
                    <p className="text-xs text-muted-foreground">Risk %</p>
                    <p className="font-semibold text-orange-600">{analysis.risk.riskPercentage}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-purple-500/10">
                    <p className="text-xs text-muted-foreground">Volatility</p>
                    <p className="font-semibold text-purple-600">{analysis.risk.volatility}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <CardTitle className="text-base">Technical Analysis</CardTitle>
                  <Badge variant="outline">
                    {analysis.technical.trend}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center p-2 rounded bg-green-500/10">
                    <p className="text-xs text-muted-foreground">Support</p>
                    <p className="font-semibold text-green-600">${analysis.technical.support.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-red-500/10">
                    <p className="text-xs text-muted-foreground">Resistance</p>
                    <p className="font-semibold text-red-600">${analysis.technical.resistance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">RSI</p>
                    <p className="font-semibold">{analysis.technical.rsi}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">MACD</p>
                    <p className="font-semibold text-xs">{analysis.technical.macd}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Explanation */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <CardTitle className="text-base">Analysis Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {analysis.explanation}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">High Probability</p>
                    <p className="text-xs text-muted-foreground">Technical setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10">
                  <DollarSign className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Good R:R</p>
                    <p className="text-xs text-muted-foreground">{analysis.signal.riskReward}:1 ratio</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-orange-500/10">
                  <Shield className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Controlled Risk</p>
                    <p className="text-xs text-muted-foreground">{analysis.risk.riskPercentage}% risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Disclaimer:</strong> Educational purposes only. Not financial advice. Trading involves risk.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};