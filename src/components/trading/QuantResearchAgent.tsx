import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, TrendingUp, AlertCircle, Target, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuantAnalysis {
  summary: string;
  data_used: Record<string, any>;
  analysis: string;
  recommendation: string;
  memory: {
    tickers_tracked: string[];
    last_metrics: Record<string, any>;
    conclusions: string;
  };
}

interface ConversationTurn {
  query: string;
  response: QuantAnalysis;
  timestamp: Date;
}

export const QuantResearchAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [memory, setMemory] = useState<any>({
    tickers_tracked: [],
    last_metrics: {},
    conclusions: ""
  });
  const { toast } = useToast();

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('quant-research-agent', {
        body: { query, memory }
      });

      if (error) throw error;

      const analysis: QuantAnalysis = data;
      
      // Update conversation history
      const newTurn: ConversationTurn = {
        query,
        response: analysis,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, newTurn]);
      setMemory(analysis.memory);
      setQuery('');

      toast({
        title: "Analysis Complete",
        description: "Quant research analysis has been generated successfully.",
      });

    } catch (error) {
      console.error('Error in quant research:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate quant research analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setConversation([]);
    setMemory({ tickers_tracked: [], last_metrics: {}, conclusions: "" });
    toast({
      title: "Conversation Cleared",
      description: "Research conversation and memory have been reset.",
    });
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Quant Research Agent
            <Badge variant="secondary" className="ml-auto">
              Powered by Gemini AI + OpenBB
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Textarea
                placeholder="Ask me anything about stocks, fundamentals, comparisons, or market analysis..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSubmitQuery}
                  disabled={isLoading || !query.trim()}
                  className="whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearConversation}
                  disabled={conversation.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Memory Status */}
            {memory.tickers_tracked.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Tracking: {memory.tickers_tracked.join(', ')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {conversation.map((turn, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Query: {turn.query}</CardTitle>
                  <Badge variant="outline">
                    {turn.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Executive Summary */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Executive Summary
                  </h4>
                  <p className="text-sm">{turn.response.summary}</p>
                </div>

                {/* Data Used */}
                {Object.keys(turn.response.data_used).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Data Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(turn.response.data_used).map(([ticker, data]: [string, any]) => (
                        <Card key={ticker} className="p-3">
                          <h5 className="font-semibold text-primary mb-2">{ticker}</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-mono">{formatNumber(data.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>P/E Ratio:</span>
                              <span className="font-mono">{data.pe_ratio?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>EPS:</span>
                              <span className="font-mono">${data.eps?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue Growth:</span>
                              <span className={`font-mono ${data.revenue_growth > 0 ? 'text-success' : 'text-destructive'}`}>
                                {(data.revenue_growth * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rating:</span>
                              <Badge variant={
                                data.analyst_rating === 'Buy' ? 'default' : 
                                data.analyst_rating === 'Hold' ? 'secondary' : 'destructive'
                              }>
                                {data.analyst_rating}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Analysis */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Detailed Analysis
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{turn.response.analysis}</p>
                </div>

                <Separator />

                {/* Recommendation */}
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendation
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{turn.response.recommendation}</p>
                </div>

                {/* Memory Update */}
                {turn.response.memory.conclusions && (
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Memory Update:</strong> {turn.response.memory.conclusions}
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Examples */}
      {conversation.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Example Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Compare AAPL, MSFT, and GOOGL fundamentals",
                "Analyze TSLA profitability and growth metrics",
                "What are the key risks for NVDA stock?",
                "Compare tech giants P/E ratios and valuations",
                "Analyze AMZN debt levels and financial health",
                "Which stock has better dividend yield: KO or PEP?"
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                  className="text-left justify-start h-auto p-3"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};