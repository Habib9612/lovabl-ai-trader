import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Square, 
  Triangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  strength: number;
  datetime: string;
  mitigated: boolean;
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  size: number;
  fillStatus: 'open' | 'partial' | 'filled';
  datetime: string;
}

interface MarketStructure {
  trend: 'bullish' | 'bearish' | 'ranging';
  structurePoints: Array<{
    type: 'HH' | 'HL' | 'LH' | 'LL';
    price: number;
    time: string;
  }>;
  bosLevels: number[];
  chochLevels: number[];
}

interface ICTOrderBlocksProps {
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  marketStructure: MarketStructure;
}

export const ICTOrderBlocks: React.FC<ICTOrderBlocksProps> = ({ 
  orderBlocks, 
  fairValueGaps, 
  marketStructure 
}) => {
  const [showMitigated, setShowMitigated] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bullish' | 'bearish'>('all');

  const getBlockStrengthLevel = (strength: number) => {
    if (strength >= 0.03) return { level: 'Strong', color: 'text-success', bg: 'bg-success/20' };
    if (strength >= 0.02) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-500/20' };
    return { level: 'Weak', color: 'text-muted-foreground', bg: 'bg-muted/20' };
  };

  const getGapFillColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-success bg-success/20';
      case 'partial': return 'text-amber-600 bg-amber-500/20';
      case 'filled': return 'text-muted-foreground bg-muted/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getStructureIcon = (type: string) => {
    switch (type) {
      case 'HH': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'HL': return <TrendingUp className="h-4 w-4 text-success/70" />;
      case 'LH': return <TrendingDown className="h-4 w-4 text-danger/70" />;
      case 'LL': return <TrendingDown className="h-4 w-4 text-danger" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredOrderBlocks = orderBlocks.filter(block => {
    if (!showMitigated && block.mitigated) return false;
    if (selectedFilter === 'all') return true;
    return block.type === selectedFilter;
  });

  const filteredFVGs = fairValueGaps.filter(gap => {
    if (selectedFilter === 'all') return true;
    return gap.type === selectedFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-primary" />
            Market Structure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'bullish' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('bullish')}
                className="text-success border-success/30 hover:bg-success/10"
              >
                Bullish
              </Button>
              <Button
                variant={selectedFilter === 'bearish' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('bearish')}
                className="text-danger border-danger/30 hover:bg-danger/10"
              >
                Bearish
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMitigated(!showMitigated)}
                className="flex items-center gap-2"
              >
                {showMitigated ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showMitigated ? 'Hide' : 'Show'} Mitigated
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="order-blocks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order-blocks" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Order Blocks
          </TabsTrigger>
          <TabsTrigger value="fair-value-gaps" className="flex items-center gap-2">
            <Triangle className="h-4 w-4" />
            Fair Value Gaps
          </TabsTrigger>
          <TabsTrigger value="market-structure" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Market Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order-blocks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Order Blocks</p>
                    <p className="text-2xl font-bold text-primary">{orderBlocks.length}</p>
                  </div>
                  <Square className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Blocks</p>
                    <p className="text-2xl font-bold text-success">
                      {orderBlocks.filter(b => !b.mitigated).length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {filteredOrderBlocks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Square className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No order blocks match the current filter.</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrderBlocks.map((block, index) => {
                const strengthLevel = getBlockStrengthLevel(block.strength);
                
                return (
                  <Card key={index} className={`border-l-4 ${block.type === 'bullish' ? 'border-l-success' : 'border-l-danger'} ${block.mitigated ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={block.type === 'bullish' ? 'default' : 'destructive'}>
                            {block.type === 'bullish' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {block.type.toUpperCase()} OB
                          </Badge>
                          
                          <Badge variant="outline" className={`${strengthLevel.color} ${strengthLevel.bg}`}>
                            {strengthLevel.level}
                          </Badge>
                          
                          {block.mitigated && (
                            <Badge variant="outline" className="text-muted-foreground">
                              Mitigated
                            </Badge>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(block.datetime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(block.datetime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">High</p>
                          <p className="font-mono font-semibold">${block.high.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Low</p>
                          <p className="font-mono font-semibold">${block.low.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Range</p>
                          <p className="font-mono font-semibold">${(block.high - block.low).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Strength</span>
                          <span>{(block.strength * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={block.strength * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="fair-value-gaps" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total FVGs</p>
                    <p className="text-2xl font-bold text-primary">{fairValueGaps.length}</p>
                  </div>
                  <Triangle className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Gaps</p>
                    <p className="text-2xl font-bold text-success">
                      {fairValueGaps.filter(g => g.fillStatus === 'open').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Gap Size</p>
                    <p className="text-2xl font-bold text-accent">
                      {fairValueGaps.length > 0 
                        ? (fairValueGaps.reduce((acc, gap) => acc + gap.size, 0) / fairValueGaps.length).toFixed(2)
                        : '0.00'
                      }%
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {filteredFVGs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Triangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No fair value gaps match the current filter.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFVGs.map((gap, index) => (
                <Card key={index} className={`border-l-4 ${gap.type === 'bullish' ? 'border-l-success' : 'border-l-danger'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={gap.type === 'bullish' ? 'default' : 'destructive'}>
                          <Triangle className="h-3 w-3 mr-1" />
                          {gap.type.toUpperCase()} FVG
                        </Badge>
                        
                        <Badge variant="outline" className={getGapFillColor(gap.fillStatus)}>
                          {gap.fillStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(gap.datetime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(gap.datetime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Top</p>
                        <p className="font-mono font-semibold">${gap.top.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bottom</p>
                        <p className="font-mono font-semibold">${gap.bottom.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Size</p>
                        <p className="font-mono font-semibold">${(gap.top - gap.bottom).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Size %</p>
                        <p className="font-mono font-semibold">{gap.size.toFixed(2)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="market-structure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Trend</p>
                    <p className="text-2xl font-bold text-primary capitalize">
                      {marketStructure.trend}
                    </p>
                  </div>
                  {marketStructure.trend === 'bullish' ? (
                    <TrendingUp className="h-8 w-8 text-success" />
                  ) : marketStructure.trend === 'bearish' ? (
                    <TrendingDown className="h-8 w-8 text-danger" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">BOS Levels</p>
                    <p className="text-2xl font-bold text-accent">
                      {marketStructure.bosLevels?.length || 0}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Structure Points</p>
                    <p className="text-2xl font-bold text-primary">
                      {marketStructure.structurePoints?.length || 0}
                    </p>
                  </div>
                  <Square className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Structure Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Structure Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketStructure.structurePoints?.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStructureIcon(point.type)}
                      <Badge variant="outline">
                        {point.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {point.type === 'HH' ? 'Higher High' :
                         point.type === 'HL' ? 'Higher Low' :
                         point.type === 'LH' ? 'Lower High' : 'Lower Low'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">${point.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(point.time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    No structure points identified yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* BOS and CHoCH Levels */}
          {(marketStructure.bosLevels?.length > 0 || marketStructure.chochLevels?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketStructure.bosLevels?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Break of Structure (BOS)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketStructure.bosLevels.map((level, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-success/10 rounded">
                          <span className="text-sm">BOS Level {index + 1}</span>
                          <span className="font-mono font-semibold">${level.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {marketStructure.chochLevels?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Change of Character (CHoCH)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {marketStructure.chochLevels.map((level, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-amber-500/10 rounded">
                          <span className="text-sm">CHoCH Level {index + 1}</span>
                          <span className="font-mono font-semibold">${level.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};