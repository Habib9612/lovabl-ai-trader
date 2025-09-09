import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const aiInsights = [
  {
    id: 1,
    type: 'bullish',
    symbol: 'AAPL',
    confidence: 87,
    prediction: 'Strong upward momentum expected',
    timeframe: '1-2 weeks',
    reasoning: 'Technical indicators show oversold conditions with rising volume',
    accuracy: 92
  },
  {
    id: 2,
    type: 'bearish',
    symbol: 'TSLA',
    confidence: 73,
    prediction: 'Potential downside risk',
    timeframe: '3-5 days',
    reasoning: 'Divergence in RSI and price action suggests weakness',
    accuracy: 85
  },
  {
    id: 3,
    type: 'neutral',
    symbol: 'GOOGL',
    confidence: 65,
    prediction: 'Sideways consolidation likely',
    timeframe: '1 week',
    reasoning: 'Mixed signals from multiple timeframes',
    accuracy: 78
  }
];

const patternData = [
  { pattern: 'Double Bottom', count: 12, success: 85 },
  { pattern: 'Head & Shoulders', count: 8, success: 78 },
  { pattern: 'Bull Flag', count: 15, success: 92 },
  { pattern: 'Triangle', count: 6, success: 67 },
  { pattern: 'Cup & Handle', count: 4, success: 88 }
];

const sentimentData = [
  { date: 'Mon', bullish: 65, bearish: 35, neutral: 30 },
  { date: 'Tue', bullish: 72, bearish: 28, neutral: 25 },
  { date: 'Wed', bullish: 58, bearish: 42, neutral: 35 },
  { date: 'Thu', bullish: 80, bearish: 20, neutral: 15 },
  { date: 'Fri', bullish: 75, bearish: 25, neutral: 20 }
];

const radarData = [
  { metric: 'Technical', score: 85 },
  { metric: 'Fundamental', score: 72 },
  { metric: 'Sentiment', score: 90 },
  { metric: 'Volume', score: 78 },
  { metric: 'Momentum', score: 82 },
  { metric: 'Volatility', score: 65 }
];

export default function AIAnalytics() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [analysisType, setAnalysisType] = useState('comprehensive');

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <AlertTriangle className="h-4 w-4" />;
      case 'neutral': return <Clock className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
          <p className="text-muted-foreground">Advanced AI-powered market analysis and predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter symbol"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
            className="w-32"
          />
          <Button>Analyze</Button>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">Last 30 predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">High confidence alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns Detected</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Current analysis</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
          <TabsTrigger value="radar">Multi-Factor Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                <SelectItem value="technical">Technical Only</SelectItem>
                <SelectItem value="fundamental">Fundamental Only</SelectItem>
                <SelectItem value="sentiment">Sentiment Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getInsightColor(insight.type)}>
                        {getInsightIcon(insight.type)}
                        {insight.type.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-lg">{insight.symbol}</span>
                    </div>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{insight.prediction}</h4>
                    <p className="text-muted-foreground text-sm">{insight.reasoning}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Timeframe: {insight.timeframe}</span>
                    <span className="text-muted-foreground">Historical accuracy: {insight.accuracy}%</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Set Alert</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Recognition Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternData.map((pattern) => (
                  <div key={pattern.pattern} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{pattern.pattern}</div>
                        <div className="text-sm text-muted-foreground">{pattern.count} patterns detected</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{pattern.success}%</div>
                      <div className="text-sm text-muted-foreground">Success rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={sentimentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bullish"
                    stackId="1"
                    stroke="hsl(var(--green-600))"
                    fill="hsl(var(--green-600))"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="hsl(var(--yellow-600))"
                    fill="hsl(var(--yellow-600))"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="bearish"
                    stackId="1"
                    stroke="hsl(var(--red-600))"
                    fill="hsl(var(--red-600))"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Analysis for {selectedSymbol}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}