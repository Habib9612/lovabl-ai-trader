import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, FileImage, Brain, Target, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const strategies = [
  { id: 'ict', name: 'ICT Strategy', description: 'Inner Circle Trader concepts and smart money' },
  { id: 'technical', name: 'Technical Analysis', description: 'Classic chart patterns and indicators' },
  { id: 'price-action', name: 'Price Action', description: 'Raw price movement analysis' },
  { id: 'support-resistance', name: 'Support & Resistance', description: 'Key levels and zones' },
  { id: 'trend-following', name: 'Trend Following', description: 'Trend identification and momentum' },
  { id: 'reversal', name: 'Reversal Patterns', description: 'Market turning points and reversals' }
];

interface AnalysisResult {
  strategy: string;
  confidence: number;
  signal: 'buy' | 'sell' | 'neutral';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasoning: string;
  keyLevels?: string[];
  timeframe?: string;
}

const parseGeminiAnalysisForStrategy = (analysisText: string, strategyId: string, strategyName: string): AnalysisResult => {
  // Extract relevant information from Gemini analysis
  const lowerText = analysisText.toLowerCase();
  
  // Determine signal based on keywords
  let signal: 'buy' | 'sell' | 'neutral' = 'neutral';
  const bullishKeywords = ['bullish', 'buy', 'long', 'uptrend', 'higher', 'breakout', 'support holding'];
  const bearishKeywords = ['bearish', 'sell', 'short', 'downtrend', 'lower', 'breakdown', 'resistance holding'];
  
  const bullishCount = bullishKeywords.filter(word => lowerText.includes(word)).length;
  const bearishCount = bearishKeywords.filter(word => lowerText.includes(word)).length;
  
  if (bullishCount > bearishCount) {
    signal = 'buy';
  } else if (bearishCount > bullishCount) {
    signal = 'sell';
  }
  
  // Extract confidence level (look for percentage or confidence words)
  let confidence = 75; // default
  const confidenceMatch = analysisText.match(/(\d+)%/);
  if (confidenceMatch) {
    confidence = parseInt(confidenceMatch[1]);
  } else {
    // Base confidence on strategy-specific keywords
    const strategyKeywords = {
      'ict': ['order block', 'fair value gap', 'liquidity', 'smart money'],
      'technical': ['support', 'resistance', 'pattern', 'breakout'],
      'price-action': ['candlestick', 'pin bar', 'engulfing', 'structure'],
      'support-resistance': ['key level', 'psychological', 'bounce', 'hold'],
      'trend-following': ['trend', 'momentum', 'continuation', 'direction'],
      'reversal': ['reversal', 'divergence', 'exhaustion', 'turn']
    };
    
    const keywords = strategyKeywords[strategyId as keyof typeof strategyKeywords] || [];
    const keywordCount = keywords.filter(word => lowerText.includes(word)).length;
    confidence = Math.min(95, 60 + (keywordCount * 10));
  }
  
  // Extract price levels (look for numbers that could be prices)
  const priceMatches = analysisText.match(/\$?(\d+(?:\.\d{2})?)/g);
  const prices = priceMatches ? priceMatches.map(p => parseFloat(p.replace('$', ''))).filter(p => p > 10) : [];
  
  let entryPrice, stopLoss, takeProfit;
  if (prices.length >= 3) {
    prices.sort((a, b) => a - b);
    if (signal === 'buy') {
      entryPrice = prices[Math.floor(prices.length * 0.3)];
      stopLoss = prices[0];
      takeProfit = prices[prices.length - 1];
    } else {
      entryPrice = prices[Math.floor(prices.length * 0.7)];
      stopLoss = prices[prices.length - 1];
      takeProfit = prices[0];
    }
  }
  
  // Extract key levels
  const keyLevels: string[] = [];
  const levelMatches = analysisText.match(/(?:level|support|resistance).*?(\d+(?:\.\d{2})?)/gi);
  if (levelMatches) {
    levelMatches.slice(0, 3).forEach(match => {
      const price = match.match(/(\d+(?:\.\d{2})?)/);
      if (price) keyLevels.push(`$${price[1]}`);
    });
  }
  
  // Extract timeframe
  const timeframeMatch = analysisText.match(/(1H|4H|1D|1W|15M|5M|daily|hourly|weekly)/i);
  const timeframe = timeframeMatch ? timeframeMatch[1].toUpperCase() : undefined;
  
  return {
    strategy: strategyId,
    confidence,
    signal,
    entryPrice,
    stopLoss,
    takeProfit,
    reasoning: `${strategyName} Analysis: ${analysisText.slice(0, 200)}...`,
    keyLevels,
    timeframe
  };
};

export const ImageChartAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(['ict']);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Accept any file that might be an image or screenshot
      const validTypes = ['image/', 'application/octet-stream'];
      const isValidType = validTypes.some(type => file.type.startsWith(type)) || 
                         file.type === '' || // Some screenshots don't have mime type
                         /\.(png|jpe?g|gif|bmp|webp|tiff?|svg)$/i.test(file.name);
      
      if (isValidType) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setAnalysisResults([]);
      } else {
        toast.error('Please select an image file or screenshot');
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeChart = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    if (selectedStrategies.length === 0) {
      toast.error('Please select at least one strategy');
      return;
    }

    setAnalyzing(true);
    
    try {
      const imageBase64 = await convertFileToBase64(selectedFile);
      
      const { data, error } = await supabase.functions.invoke('gemini-ai-analysis', {
        body: {
          type: 'chart_analysis',
          data: {
            base64: imageBase64,
            mimeType: selectedFile.type
          },
          prompt: `Analyze this chart using these strategies: ${selectedStrategies.map(s => strategies.find(st => st.id === s)?.name).join(', ')}`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Parse Gemini response and create structured results
      const analysisText = data.analysis || 'No analysis provided';
      
      // Create analysis results based on selected strategies
      const results = selectedStrategies.map(strategyId => {
        const strategy = strategies.find(s => s.id === strategyId);
        return parseGeminiAnalysisForStrategy(analysisText, strategyId, strategy?.name || '');
      });
      
      setAnalysisResults(results);
      toast.success('Chart analysis completed with Gemini AI!');
    } catch (error) {
      console.error('Error analyzing chart:', error);
      toast.error('Failed to analyze chart: ' + (error as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sell': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-4 w-4" />;
      case 'sell': return <Target className="h-4 w-4" />;
      case 'neutral': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Chart Image Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <Label>Upload Chart Image</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Chart preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile?.name} • Click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Upload a chart image</p>
                    <p className="text-sm text-muted-foreground">
                      Any image format up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Strategy Selection */}
          <div className="space-y-4">
            <Label>Select Analysis Strategies</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedStrategies.includes(strategy.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedStrategies(prev =>
                      prev.includes(strategy.id)
                        ? prev.filter(s => s !== strategy.id)
                        : [...prev, strategy.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground">{strategy.description}</div>
                    </div>
                    {selectedStrategies.includes(strategy.id) && (
                      <div className="w-4 h-4 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={analyzeChart}
            disabled={!selectedFile || analyzing || selectedStrategies.length === 0}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Chart...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Chart ({selectedStrategies.length} strategies)
              </>
            )}
          </Button>

          {analyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing with AI...</span>
                <span>This may take a moment</span>
              </div>
              <Progress value={undefined} className="animate-pulse" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {strategies.find(s => s.id === result.strategy)?.name}
                        </h4>
                        <Badge className={getSignalColor(result.signal)}>
                          {getSignalIcon(result.signal)}
                          {result.signal.toUpperCase()}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        {result.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{result.reasoning}</p>
                    
                    {(result.entryPrice || result.stopLoss || result.takeProfit) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        {result.entryPrice && (
                          <div>
                            <span className="text-sm text-muted-foreground">Entry Price</span>
                            <div className="font-semibold">${result.entryPrice}</div>
                          </div>
                        )}
                        {result.stopLoss && (
                          <div>
                            <span className="text-sm text-muted-foreground">Stop Loss</span>
                            <div className="font-semibold text-red-600">${result.stopLoss}</div>
                          </div>
                        )}
                        {result.takeProfit && (
                          <div>
                            <span className="text-sm text-muted-foreground">Take Profit</span>
                            <div className="font-semibold text-green-600">${result.takeProfit}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {result.keyLevels && result.keyLevels.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">Key Levels</span>
                        <div className="flex flex-wrap gap-2">
                          {result.keyLevels.map((level, idx) => (
                            <Badge key={idx} variant="secondary">{level}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.timeframe && (
                      <div>
                        <span className="text-sm text-muted-foreground">Recommended Timeframe: </span>
                        <Badge variant="outline">{result.timeframe}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};