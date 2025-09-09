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
    <div className="w-full">
      {/* Simple Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Analysis</h3>
        </div>
        <Button 
          onClick={generateComprehensiveAnalysis}
          disabled={isAnalyzing}
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Get Analysis"
          )}
        </Button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-3">
          {/* Signal Overview */}
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">Signal</span>
                <Badge className={getSignalColor(analysis.signal.action)}>
                  {analysis.signal.action}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {analysis.signal.confidence}% confidence
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Entry</p>
                <p className="font-semibold text-sm">${analysis.signal.entryPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-semibold text-sm text-green-600">${analysis.signal.targetPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stop</p>
                <p className="font-semibold text-sm text-red-600">${analysis.signal.stopLoss.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">R:R</p>
                <p className="font-semibold text-sm text-blue-600">{analysis.signal.riskReward}:1</p>
              </div>
            </div>
          </div>

          {/* Risk & Technical in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Risk</span>
                <Badge variant="outline" className={getRiskColor(analysis.risk.riskLevel)}>
                  {analysis.risk.riskLevel}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-semibold text-sm">{analysis.risk.positionSize}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className="font-semibold text-sm">{analysis.risk.riskPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">Technical</span>
                <Badge variant="outline">{analysis.technical.trend}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Support</p>
                  <p className="font-semibold text-sm text-green-600">${analysis.technical.support.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resistance</p>
                  <p className="font-semibold text-sm text-red-600">${analysis.technical.resistance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 border rounded-lg bg-muted/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.explanation}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-2 bg-amber-50 border border-amber-200 rounded text-center">
            <p className="text-xs text-amber-800">
              <strong>Educational only.</strong> Not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};