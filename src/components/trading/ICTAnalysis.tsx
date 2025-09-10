import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ICTChart } from './ICTChart';
import { ICTSignals } from './ICTSignals';
import { ICTRiskCalculator } from './ICTRiskCalculator';
import { ICTOrderBlocks } from './ICTOrderBlocks';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  BarChart3, 
  AlertTriangle,
  RefreshCw,
  Play,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface ICTAnalysisData {
  symbol: string;
  timeframe: string;
  analysisTime: string;
  marketStructure: {
    trend: 'bullish' | 'bearish' | 'ranging';
    structurePoints: Array<{
      type: 'HH' | 'HL' | 'LH' | 'LL';
      price: number;
      time: string;
    }>;
    bosLevels: number[];
    chochLevels: number[];
  };
  orderBlocks: Array<{
    type: 'bullish' | 'bearish';
    high: number;
    low: number;
    strength: number;
    datetime: string;
    mitigated: boolean;
  }>;
  fairValueGaps: Array<{
    type: 'bullish' | 'bearish';
    top: number;
    bottom: number;
    size: number;
    fillStatus: 'open' | 'partial' | 'filled';
    datetime: string;
  }>;
  liquidityZones: Array<{
    type: 'equal_highs' | 'equal_lows';
    level: number;
    strength: number;
    swept: boolean;
  }>;
  signals: Array<{
    type: 'BUY' | 'SELL';
    confidence: number;
    entry: number;
    stopLoss: number;
    takeProfits: number[];
    riskReward: number[];
    reasoning: string;
    timeframeValidity: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  currentPrice: number;
  premiumDiscount: 'premium' | 'discount' | 'equilibrium';
}

export const ICTAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1h');
  const [period, setPeriod] = useState('5d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<ICTAnalysisData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const timeframes = [
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  const periods = [
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' },
    { value: '6mo', label: '6 Months' }
  ];

  const symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ', 'IWM',
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'
  ];

  const runICTAnalysis = async () => {
    if (!symbol) {
      toast.error('Please select a symbol');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate analysis progress
      const progressSteps = [
        { progress: 20, message: 'Fetching market data...' },
        { progress: 40, message: 'Analyzing market structure...' },
        { progress: 60, message: 'Detecting order blocks...' },
        { progress: 80, message: 'Identifying fair value gaps...' },
        { progress: 90, message: 'Generating signals...' },
        { progress: 100, message: 'Analysis complete!' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(step.progress);
        toast.info(step.message);
      }

      // Generate mock ICT analysis data
      const mockData: ICTAnalysisData = {
        symbol,
        timeframe,
        analysisTime: new Date().toISOString(),
        marketStructure: {
          trend: 'bullish',
          structurePoints: [
            { type: 'HL', price: 195.20, time: '2024-01-15T10:00:00Z' },
            { type: 'HH', price: 198.50, time: '2024-01-15T14:00:00Z' }
          ],
          bosLevels: [196.80],
          chochLevels: [194.50]
        },
        orderBlocks: [
          {
            type: 'bullish',
            high: 196.80,
            low: 195.20,
            strength: 0.025,
            datetime: '2024-01-15T10:00:00Z',
            mitigated: false
          },
          {
            type: 'bearish',
            high: 199.50,
            low: 198.20,
            strength: 0.018,
            datetime: '2024-01-15T12:00:00Z',
            mitigated: true
          }
        ],
        fairValueGaps: [
          {
            type: 'bullish',
            top: 197.20,
            bottom: 196.50,
            size: 0.36,
            fillStatus: 'open',
            datetime: '2024-01-15T11:00:00Z'
          }
        ],
        liquidityZones: [
          {
            type: 'equal_highs',
            level: 198.50,
            strength: 0.85,
            swept: false
          }
        ],
        signals: [
          {
            type: 'BUY',
            confidence: 85,
            entry: 196.45,
            stopLoss: 194.10,
            takeProfits: [198.20, 200.80, 204.50],
            riskReward: [1.5, 2.8, 4.2],
            reasoning: 'Bullish Order Block confluence with FVG at discount level. Market structure showing higher lows with liquidity sweep setup.',
            timeframeValidity: '4-8 hours',
            riskLevel: 'medium'
          }
        ],
        currentPrice: 197.25,
        premiumDiscount: 'discount'
      };

      setAnalysisData(mockData);
      setLastUpdate(new Date());
      toast.success('ICT Analysis completed successfully!');

    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('ICT Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-danger" />;
      default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPremiumDiscountColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-danger/20 text-danger border-danger/30';
      case 'discount': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card className="border-accent/20 bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            ICT Trading Analysis Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Symbol</label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map((sym) => (
                    <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Action</label>
              <Button 
                onClick={runICTAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-accent text-accent-foreground hover:bg-gradient-accent/90"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analysis Progress</span>
                <span className="text-primary font-medium">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {lastUpdate && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              {analysisData && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTrendIcon(analysisData.marketStructure.trend)}
                    {analysisData.marketStructure.trend.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getPremiumDiscountColor(analysisData.premiumDiscount)}
                  >
                    {analysisData.premiumDiscount.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Mgmt
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Levels
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="chart" className="space-y-4">
              <ICTChart data={analysisData} />
            </TabsContent>

            <TabsContent value="signals" className="space-y-4">
              <ICTSignals signals={analysisData.signals} currentPrice={analysisData.currentPrice} />
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <ICTRiskCalculator signals={analysisData.signals} />
            </TabsContent>

            <TabsContent value="structure" className="space-y-4">
              <ICTOrderBlocks 
                orderBlocks={analysisData.orderBlocks}
                fairValueGaps={analysisData.fairValueGaps}
                marketStructure={analysisData.marketStructure}
              />
            </TabsContent>

            <TabsContent value="levels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Liquidity Zones & Key Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.liquidityZones.map((zone, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={zone.type === 'equal_highs' ? 'destructive' : 'default'}>
                            {zone.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm font-mono">${zone.level.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Strength: {(zone.strength * 100).toFixed(0)}%
                          {zone.swept && <span className="ml-2 text-success">• Swept</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}

      {!analysisData && !isAnalyzing && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for ICT Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Select a symbol and timeframe, then click "Run Analysis" to begin comprehensive ICT market structure analysis.
            </p>
            <Alert className="max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-left">
                <strong>Risk Disclaimer:</strong> Trading involves substantial risk of loss. ICT analysis is for educational purposes only and should not be considered investment advice.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};