import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AnalysisResult {
  analysis: string;
  recommendation: string;
  confidence: number;
  riskLevel: string;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: string;
  strategy: string;
}

export const StockAIAnalysis = () => {
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [strategy, setStrategy] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const { stockData, fetchStockData, isLoading: isLoadingData } = useFinancialData();
  const { user } = useAuth();

  const handleAnalysis = async () => {
    if (!symbol || !timeframe || !strategy) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!user) {
      toast.error('Please log in to use AI analysis');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // First, fetch the stock data
      const stockInfo = await fetchStockData(symbol);
      
      if (!stockInfo) {
        throw new Error('Failed to fetch stock data');
      }

      // Prepare the analysis prompt
      const analysisPrompt = `
Perform a comprehensive trading analysis for ${symbol} using the following parameters:

**Stock Information:**
- Symbol: ${stockInfo.symbol}
- Company: ${stockInfo.companyName}
- Current Price: ${stockInfo.price}
- Price Change: ${stockInfo.change} (${stockInfo.changesPercentage})
- Volume: ${stockInfo.volume}
- Market Cap: ${stockInfo.marketCap}
- P/E Ratio: ${stockInfo.pe}
- Sector: ${stockInfo.sector}

**Analysis Parameters:**
- Timeframe: ${timeframe}
- Strategy: ${strategy}

**Analysis Requirements:**
1. Technical Analysis based on current price action and market data
2. Fundamental Analysis using P/E, market cap, and sector information
3. Strategy-specific recommendations for ${strategy}
4. Risk assessment for ${timeframe} timeframe
5. Entry/exit points with stop loss recommendations
6. Confidence level (1-100)

Please provide a detailed analysis including:
- Market sentiment and trend direction
- Key support and resistance levels
- Risk management recommendations
- Target price projections
- Overall recommendation (BUY/SELL/HOLD)

Format the response as actionable trading insights.
      `;

      // Call the AI analysis function
      const { data, error } = await supabase.functions.invoke('stock-ai-analysis', {
        body: {
          prompt: analysisPrompt,
          symbol: symbol,
          timeframe: timeframe,
          strategy: strategy,
          stockData: stockInfo
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setAnalysisResult(data.analysis);
      toast.success('Analysis completed successfully!');
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to complete analysis: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI Stock Analysis
          </CardTitle>
          <CardDescription>
            Get comprehensive AI-powered analysis for any stock with real-time data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL, TSLA, MSFT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
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
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-trading">Day Trading</SelectItem>
                  <SelectItem value="swing-trading">Swing Trading</SelectItem>
                  <SelectItem value="position-trading">Position Trading</SelectItem>
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
            disabled={isAnalyzing || isLoadingData || !symbol || !timeframe || !strategy}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Stock'
            )}
          </Button>
        </CardContent>
      </Card>

      {stockData && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{stockData.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">${stockData.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`font-medium ${stockData.change.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                  {stockData.change} ({stockData.changesPercentage})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="font-medium">{stockData.volume}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              AI Analysis Results
              <div className="flex gap-2">
                <Badge variant="secondary">
                  Confidence: {analysisResult.confidence}%
                </Badge>
                <Badge 
                  variant={
                    analysisResult.riskLevel === 'low' ? 'default' : 
                    analysisResult.riskLevel === 'medium' ? 'secondary' : 'destructive'
                  }
                >
                  Risk: {analysisResult.riskLevel}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analysis
              </h4>
              <Textarea 
                value={analysisResult.analysis} 
                readOnly 
                className="min-h-[200px] resize-none"
              />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recommendation
              </h4>
              <Textarea 
                value={analysisResult.recommendation} 
                readOnly 
                className="min-h-[100px] resize-none"
              />
            </div>

            {(analysisResult.targetPrice || analysisResult.stopLoss) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.targetPrice && (
                  <div>
                    <p className="text-sm text-muted-foreground">Target Price</p>
                    <p className="font-medium text-green-600">${analysisResult.targetPrice}</p>
                  </div>
                )}
                {analysisResult.stopLoss && (
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="font-medium text-destructive">${analysisResult.stopLoss}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};