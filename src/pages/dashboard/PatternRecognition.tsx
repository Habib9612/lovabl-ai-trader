import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, TrendingDown, Target, Zap, BarChart3, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatternData {
  id: string;
  asset_id: string;
  pattern_type: string;
  confidence_score: number;
  timeframe: string;
  detected_at: string;
  prediction: string;
  accuracy_score: number;
  price_data: any;
  assets?: any;
}

const PatternRecognition = () => {
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const { toast } = useToast();

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const { data, error } = await supabase
        .from('pattern_recognition')
        .select(`
          *,
          assets:asset_id (symbol, name)
        `)
        .order('detected_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPatterns(data || []);
    } catch (error) {
      console.error('Error fetching patterns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pattern data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (patternType: string) => {
    switch (patternType.toLowerCase()) {
      case 'head and shoulders':
      case 'inverse head and shoulders':
        return <TrendingDown className="h-5 w-5" />;
      case 'triangle':
      case 'ascending triangle':
      case 'descending triangle':
        return <Activity className="h-5 w-5" />;
      case 'double top':
      case 'double bottom':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success-foreground bg-success';
    if (confidence >= 0.6) return 'text-warning-foreground bg-warning';
    return 'text-destructive-foreground bg-destructive';
  };

  const getPredictionIcon = (prediction: string) => {
    if (prediction?.toLowerCase().includes('bullish')) return <TrendingUp className="h-4 w-4 text-success" />;
    if (prediction?.toLowerCase().includes('bearish')) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Target className="h-4 w-4 text-muted-foreground" />;
  };

  const mockAnalyzePattern = async () => {
    toast({
      title: "Analysis Started",
      description: "Pattern recognition analysis is running...",
    });
    
    // Mock pattern recognition for demo
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: "New patterns detected and added to the database",
      });
      fetchPatterns();
    }, 2000);
  };

  const filteredPatterns = patterns.filter(pattern => {
    const asset = pattern.assets as any;
    return asset?.symbol.toLowerCase().includes(searchTicker.toLowerCase()) || 
           asset?.name.toLowerCase().includes(searchTicker.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pattern Recognition
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered chart pattern detection and analysis
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={mockAnalyzePattern} className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patterns</p>
                  <p className="text-2xl font-bold text-primary">{patterns.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-success/5 border-success/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Confidence</p>
                  <p className="text-2xl font-bold text-success">
                    {patterns.filter(p => p.confidence_score >= 0.8).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-warning/5 border-warning/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-warning">
                    {patterns.length > 0 ? Math.round(patterns.reduce((acc, p) => acc + (p.accuracy_score || 0), 0) / patterns.length) : 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Signals</p>
                  <p className="text-2xl font-bold text-accent">
                    {patterns.filter(p => p.prediction?.toLowerCase().includes('bullish') || p.prediction?.toLowerCase().includes('bearish')).length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-card/50 to-card border-primary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filter Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticker symbol..."
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-primary/20">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patterns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatterns.map((pattern) => {
            const asset = pattern.assets as any;
            return (
              <Card key={pattern.id} className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10 hover:shadow-xl hover:border-primary/30 transition-all group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPatternIcon(pattern.pattern_type)}
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {asset?.symbol} - {pattern.pattern_type}
                        </CardTitle>
                        <CardDescription>{asset?.name}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getConfidenceColor(pattern.confidence_score)}>
                      {Math.round(pattern.confidence_score * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence Level</span>
                    <Progress value={pattern.confidence_score * 100} className="w-24" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timeframe</span>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {pattern.timeframe}
                    </Badge>
                  </div>
                  
                  {pattern.prediction && (
                    <div className="flex items-center gap-2">
                      {getPredictionIcon(pattern.prediction)}
                      <span className="text-sm font-medium">{pattern.prediction}</span>
                    </div>
                  )}
                  
                  {pattern.accuracy_score && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Historical Accuracy</span>
                      <span className="text-sm font-medium text-success">
                        {Math.round(pattern.accuracy_score)}%
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Detected: {new Date(pattern.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPatterns.length === 0 && (
          <Card className="bg-gradient-to-br from-card to-muted/20 border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Patterns Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchTicker ? 'No patterns match your search criteria.' : 'No patterns have been detected yet. Run an analysis to get started.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatternRecognition;