import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, TrendingUp, AlertCircle, Target, Clock, Loader2, Database, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuantumMemoryEntry {
  query: string;
  response: string;
  vector: number[];
  timestamp: number;
}

interface QuantumAnalysis {
  source: "quantum_memory" | "quantum_llm" | "system_error";
  similarity?: string;
  originalQuery?: string;
  response: any;
  timestamp?: number;
  stored?: boolean;
  error?: string;
  raw_response?: string;
  parse_error?: string;
  memory?: QuantumMemoryEntry[];
  stats?: {
    totalMemories: number;
    vectorDimension: number;
    memoryThreshold: number;
  };
}

interface ConversationTurn {
  query: string;
  response: QuantumAnalysis;
  timestamp: Date;
}

export const QuantResearchAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [memory, setMemory] = useState<QuantumMemoryEntry[]>([]);
  const { toast } = useToast();

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('quant-research-agent', {
        body: { query, memory }
      });

      if (error) throw error;

      const analysis: QuantumAnalysis = data;
      
      // Update conversation history
      const newTurn: ConversationTurn = {
        query,
        response: analysis,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, newTurn]);
      if (analysis.memory) {
        setMemory(analysis.memory);
      }
      setQuery('');

      if (analysis.source === 'quantum_memory') {
        toast({
          title: "Memory Match Found",
          description: `Retrieved from quantum memory (${analysis.similarity} similarity)`,
        });
      } else if (analysis.source === 'quantum_llm') {
        toast({
          title: "Analysis Complete",
          description: "New quantum research analysis generated successfully.",
        });
      }

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
    setMemory([]);
    toast({
      title: "Conversation Cleared",
      description: "Research conversation and memory have been reset.",
    });
  };

  const parseJsonResponse = (response: any) => {
    if (typeof response === 'object') {
      return response;
    }
    try {
      return JSON.parse(response);
    } catch {
      return { analysis: response };
    }
  };

  const renderAnalysisContent = (turn: ConversationTurn) => {
    const { response } = turn;
    
    if (response.error) {
      return (
        <div className="bg-destructive/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-destructive">Error</h4>
          <p className="text-sm">{response.error}</p>
        </div>
      );
    }

    if (response.source === 'quantum_memory') {
      return (
        <div className="space-y-4">
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Retrieved from Quantum Memory
              <Badge variant="secondary">{response.similarity} similarity</Badge>
            </h4>
            <p className="text-sm mb-2"><strong>Original Query:</strong> {response.originalQuery}</p>
            <p className="text-sm">{response.response}</p>
          </div>
        </div>
      );
    }

    const parsedResponse = parseJsonResponse(response.response);

    return (
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quantum LLM Analysis
            {response.stored && <Badge variant="outline">Stored in Memory</Badge>}
          </h4>
        </div>

        {parsedResponse.summary && (
          <div className="bg-green-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Executive Summary
            </h4>
            <p className="text-sm">{parsedResponse.summary}</p>
          </div>
        )}

        {parsedResponse.analysis && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Detailed Analysis
            </h4>
            <p className="text-sm whitespace-pre-wrap">{parsedResponse.analysis}</p>
          </div>
        )}

        {parsedResponse.recommendation && (
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendation
            </h4>
            <p className="text-sm whitespace-pre-wrap">{parsedResponse.recommendation}</p>
          </div>
        )}

        {parsedResponse.risk_factors && (
          <div className="bg-orange-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Risk Factors</h4>
            <p className="text-sm">{parsedResponse.risk_factors}</p>
          </div>
        )}

        {parsedResponse.confidence_level && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Confidence Level:</span>
            <Badge variant={
              parsedResponse.confidence_level === 'High' ? 'default' :
              parsedResponse.confidence_level === 'Medium' ? 'secondary' : 'destructive'
            }>
              {parsedResponse.confidence_level}
            </Badge>
          </div>
        )}

        {response.parse_error && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <strong>Note:</strong> {response.parse_error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Quantum Research Agent
            <Badge variant="secondary" className="ml-auto">
              Powered by Gemini AI + Quantum Memory
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Textarea
                placeholder="Ask me anything about financial analysis, stock comparisons, market insights..."
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
            {memory.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Quantum Memory: {memory.length} entries stored</span>
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {turn.timestamp.toLocaleTimeString()}
                    </Badge>
                    <Badge variant={
                      turn.response.source === 'quantum_memory' ? 'secondary' :
                      turn.response.source === 'quantum_llm' ? 'default' : 'destructive'
                    }>
                      {turn.response.source === 'quantum_memory' ? 'Memory' :
                       turn.response.source === 'quantum_llm' ? 'LLM' : 'Error'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderAnalysisContent(turn)}
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
                "Analyze TSLA profitability and growth potential",
                "What are the key risks for NVDA stock?",
                "Compare tech giants P/E ratios and valuations",
                "Analyze AMZN financial health and debt levels",
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