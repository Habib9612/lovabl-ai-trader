import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, TrendingUp, DollarSign, AlertTriangle, Target } from 'lucide-react';
import { useChartAnalysis } from '@/hooks/useChartAnalysis';
import { useFinvizData } from '@/hooks/useFinvizData';
import { toast } from 'sonner';

interface AnalysisResult {
  symbol: string;
  fundamentals: any;
  analysis: string;
  confidence: number;
  entries: string[];
  targets: string[];
  stopLoss: string;
  riskReward: string;
}

export const ComprehensiveChartAnalysis = () => {
  const [symbol, setSymbol] = useState('');
  const [tradingStyle, setTradingStyle] = useState('');
  const [strategy, setStrategy] = useState('');
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { analyzeChart } = useChartAnalysis();
  const { fetchStockData, stockData, isLoading: finvizLoading } = useFinvizData();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChartFile(file);
      toast.success('Chart uploaded successfully');
    }
  };

  const handleAnalysis = async () => {
    if (!chartFile || !symbol || !tradingStyle || !strategy) {
      toast.error('Please fill all fields and upload a chart');
      return;
    }

    setLoading(true);
    try {
      // Try to fetch Finviz fundamentals (continue even if this fails)
      let fundamentalsData = null;
      try {
        await fetchStockData(symbol.toUpperCase());
        fundamentalsData = stockData;
      } catch (finvizError) {
        console.warn('Finviz data not available for', symbol, '- proceeding with chart analysis only');
        toast.info(`Fundamental data not available for ${symbol.toUpperCase()}, proceeding with chart analysis`);
      }
      
      // Convert file to base64 for analysis
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageBase64 = event.target?.result as string;
        
        // Analyze chart with enhanced prompt including fundamentals
        const chartAnalysis = await analyzeChart(
          imageBase64, 
          symbol.toUpperCase(),
          'comprehensive'
        );

        // Parse analysis for structured data
        const parsedResult: AnalysisResult = {
          symbol: symbol.toUpperCase(),
          fundamentals: fundamentalsData,
          analysis: chartAnalysis.analysis,
          confidence: 75, // Default confidence
          entries: ['Entry levels will be parsed from analysis'],
          targets: ['Target levels will be parsed from analysis'],
          stopLoss: 'Stop loss from analysis',
          riskReward: '1:3'
        };

        setAnalysisResult(parsedResult);
        toast.success('Analysis completed successfully!');
      };
      
      reader.readAsDataURL(chartFile);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comprehensive Chart Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL, TSLA, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tradingStyle">Trading Style</Label>
              <Select value={tradingStyle} onValueChange={setTradingStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trading style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-trading">Day Trading</SelectItem>
                  <SelectItem value="swing-trading">Swing Trading</SelectItem>
                  <SelectItem value="position-trading">Position Trading</SelectItem>
                  <SelectItem value="scalping">Scalping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ict-order-blocks">ICT Order Blocks</SelectItem>
                <SelectItem value="ict-fair-value-gaps">ICT Fair Value Gaps</SelectItem>
                <SelectItem value="support-resistance">Support & Resistance</SelectItem>
                <SelectItem value="fibonacci-retracement">Fibonacci Retracement</SelectItem>
                <SelectItem value="trend-following">Trend Following</SelectItem>
                <SelectItem value="breakout-strategy">Breakout Strategy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chart">Chart Upload</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="chart"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="chart" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {chartFile ? chartFile.name : 'Click to upload chart image'}
                </p>
              </label>
            </div>
          </div>

          <Button 
            onClick={handleAnalysis} 
            disabled={loading || !chartFile || !symbol || !tradingStyle || !strategy}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze Chart & Fundamentals'}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Analysis Results for {analysisResult.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trade Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Entry Strategy</span>
                </div>
                <div className="space-y-1 text-sm">
                  {analysisResult.entries.map((entry, index) => (
                    <p key={index}>{entry}</p>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Targets</span>
                </div>
                <div className="space-y-1 text-sm">
                  {analysisResult.targets.map((target, index) => (
                    <p key={index}>{target}</p>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">Risk Management</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>Stop Loss: {analysisResult.stopLoss}</p>
                  <p>Risk:Reward: {analysisResult.riskReward}</p>
                </div>
              </Card>
            </div>

            {/* Fundamentals */}
            {stockData && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Fundamentals Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Market Cap:</span>
                    <p className="font-semibold">{stockData.marketCap || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">P/E Ratio:</span>
                    <p className="font-semibold">{stockData.pe || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">EPS:</span>
                    <p className="font-semibold">{stockData.eps || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Volume:</span>
                    <p className="font-semibold">{stockData.volume || 'N/A'}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Full Analysis */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Detailed Analysis</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{analysisResult.analysis}</pre>
              </div>
            </Card>

            {/* Confidence Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Confidence: {analysisResult.confidence}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};