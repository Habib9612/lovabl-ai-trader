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
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary">AI Trading Analysis</h3>
          <p className="text-muted-foreground">Comprehensive analysis for {symbol}</p>
        </div>
        <Button 
          onClick={generateComprehensiveAnalysis}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get Full Analysis
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Trading Signal */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Trading Signal</span>
                <Badge className={getSignalColor(analysis.signal.action)}>
                  {analysis.signal.action}
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-generated trading recommendation with {analysis.signal.confidence}% confidence
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Entry Price</p>
                  <p className="text-lg font-bold text-foreground">${analysis.signal.entryPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Target</p>
                  <p className="text-lg font-bold text-green-600">${analysis.signal.targetPrice.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Stop Loss</p>
                  <p className="text-lg font-bold text-red-600">${analysis.signal.stopLoss.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">R:R Ratio</p>
                  <p className="text-lg font-bold text-primary">{analysis.signal.riskReward}:1</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border">
                <p className="text-sm"><strong>Timeframe:</strong> {analysis.signal.timeframe}</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Risk Management</span>
                <Badge className={`${getRiskColor(analysis.risk.riskLevel)} bg-white/50`}>
                  {analysis.risk.riskLevel} RISK
                </Badge>
              </CardTitle>
              <CardDescription>
                Position sizing and risk parameters for safe trading
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Position Size</p>
                  <p className="text-lg font-bold text-foreground">{analysis.risk.positionSize}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Max Loss</p>
                  <p className="text-lg font-bold text-red-600">${analysis.risk.maxLoss}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Risk %</p>
                  <p className="text-lg font-bold text-orange-600">{analysis.risk.riskPercentage}%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Volatility</p>
                  <p className="text-lg font-bold text-purple-600">{analysis.risk.volatility}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Analysis */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Technical Analysis</span>
                <Badge variant="outline" className="bg-white/50">
                  {analysis.technical.trend}
                </Badge>
              </CardTitle>
              <CardDescription>
                Key technical indicators and support/resistance levels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Support</p>
                  <p className="text-lg font-bold text-green-600">${analysis.technical.support.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Resistance</p>
                  <p className="text-lg font-bold text-red-600">${analysis.technical.resistance.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">RSI</p>
                  <p className="text-lg font-bold text-purple-600">{analysis.technical.rsi}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-2 rounded bg-muted/10">
                  <p className="text-xs text-muted-foreground">SMA 20</p>
                  <p className="font-semibold text-orange-600">${analysis.technical.movingAverages.sma20.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/10">
                  <p className="text-xs text-muted-foreground">SMA 50</p>
                  <p className="font-semibold text-blue-600">${analysis.technical.movingAverages.sma50.toFixed(2)}</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/10">
                  <p className="text-xs text-muted-foreground">MACD</p>
                  <p className="font-semibold text-green-600">{analysis.technical.macd}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Explanation */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Analysis Explanation</span>
              </CardTitle>
              <CardDescription>
                Detailed reasoning behind the trading recommendation
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm leading-relaxed">
                  {analysis.explanation}
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold">High Probability Setup</p>
                    <p className="text-xs text-muted-foreground">Technical confluence</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold">Favorable R:R</p>
                    <p className="text-xs text-muted-foreground">{analysis.signal.riskReward}:1 ratio</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold">Risk Controlled</p>
                    <p className="text-xs text-muted-foreground">{analysis.risk.riskPercentage}% portfolio risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Disclaimer:</strong> This analysis is for educational purposes only and should not be considered as financial advice. 
              Always conduct your own research and consider consulting with a financial advisor before making investment decisions. 
              Trading involves significant risk and you may lose money.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};