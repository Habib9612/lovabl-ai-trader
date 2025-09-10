import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Square, 
  Triangle, 
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

interface ICTChartProps {
  data: {
    symbol: string;
    timeframe: string;
    currentPrice: number;
    marketStructure: any;
    orderBlocks: any[];
    fairValueGaps: any[];
    liquidityZones: any[];
    signals: any[];
  };
}

export const ICTChart: React.FC<ICTChartProps> = ({ data }) => {
  const [showOrderBlocks, setShowOrderBlocks] = useState(true);
  const [showFVGs, setShowFVGs] = useState(true);
  const [showStructure, setShowStructure] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  // Generate mock price data for the chart
  const generatePriceData = () => {
    const basePrice = data.currentPrice;
    const points = 50;
    const priceData = [];
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * 4;
      const price = basePrice + variation - (points - i) * 0.1;
      priceData.push({
        time: new Date(Date.now() - (points - i) * 60000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: Number(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    return priceData;
  };

  const priceData = generatePriceData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-primary">Price: ${payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className="text-sm">
              <span className="text-muted-foreground">Volume: {payload[1].value.toLocaleString()}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {data.symbol} - {data.timeframe} ICT Chart Analysis
            </CardTitle>
            <Badge variant="outline" className="font-mono">
              ${data.currentPrice.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Order Blocks</span>
              </div>
              <Switch
                checked={showOrderBlocks}
                onCheckedChange={setShowOrderBlocks}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Triangle className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Fair Value Gaps</span>
              </div>
              <Switch
                checked={showFVGs}
                onCheckedChange={setShowFVGs}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Market Structure</span>
              </div>
              <Switch
                checked={showStructure}
                onCheckedChange={setShowStructure}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Liquidity Zones</span>
              </div>
              <Switch
                checked={showLiquidity}
                onCheckedChange={setShowLiquidity}
              />
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  fontSize={12}
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Main price line */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />

                {/* Order Blocks as Reference Areas */}
                {showOrderBlocks && data.orderBlocks.map((block, index) => (
                  <ReferenceArea
                    key={`ob-${index}`}
                    y1={block.low}
                    y2={block.high}
                    fill={block.type === 'bullish' ? '#10b981' : '#ef4444'}
                    fillOpacity={block.mitigated ? 0.1 : 0.3}
                    stroke={block.type === 'bullish' ? '#10b981' : '#ef4444'}
                    strokeWidth={1}
                    strokeDasharray={block.mitigated ? "5,5" : "0"}
                  />
                ))}

                {/* Fair Value Gaps */}
                {showFVGs && data.fairValueGaps.map((gap, index) => (
                  <ReferenceArea
                    key={`fvg-${index}`}
                    y1={gap.bottom}
                    y2={gap.top}
                    fill={gap.type === 'bullish' ? '#10b981' : '#ef4444'}
                    fillOpacity={0.2}
                    stroke={gap.type === 'bullish' ? '#10b981' : '#ef4444'}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Liquidity Zones */}
                {showLiquidity && data.liquidityZones.map((zone, index) => (
                  <ReferenceLine
                    key={`liq-${index}`}
                    y={zone.level}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                ))}

                {/* Signal Entry Points */}
                {data.signals.map((signal, index) => (
                  <ReferenceLine
                    key={`signal-${index}`}
                    y={signal.entry}
                    stroke={signal.type === 'BUY' ? '#10b981' : '#ef4444'}
                    strokeWidth={3}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 border border-green-500 rounded"></div>
              <span>Bullish Order Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/30 border border-red-500 rounded"></div>
              <span>Bearish Order Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-500/20 border border-green-500 border-dashed"></div>
              <span>Bullish FVG</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-amber-500 opacity-60"></div>
              <span>Liquidity Zone</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Structure Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Trend:</span>
              <Badge variant={data.marketStructure.trend === 'bullish' ? 'default' : 'destructive'}>
                {data.marketStructure.trend.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Structure Points:</span>
              <span className="text-sm font-medium">{data.marketStructure.structurePoints?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">BOS Levels:</span>
              <span className="text-sm font-medium">{data.marketStructure.bosLevels?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Square className="h-4 w-4" />
              Order Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bullish OBs:</span>
              <span className="text-sm font-medium text-success">
                {data.orderBlocks.filter(ob => ob.type === 'bullish').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bearish OBs:</span>
              <span className="text-sm font-medium text-danger">
                {data.orderBlocks.filter(ob => ob.type === 'bearish').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active FVGs:</span>
              <span className="text-sm font-medium">
                {data.fairValueGaps.filter(fvg => fvg.fillStatus === 'open').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Triangle className="h-4 w-4" />
              Signal Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Signals:</span>
              <span className="text-sm font-medium">{data.signals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Confidence:</span>
              <span className="text-sm font-medium">
                {data.signals.length > 0 
                  ? `${Math.round(data.signals.reduce((acc, sig) => acc + sig.confidence, 0) / data.signals.length)}%`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Max R:R:</span>
              <span className="text-sm font-medium">
                {data.signals.length > 0 
                  ? `1:${Math.max(...data.signals.flatMap(s => s.riskReward)).toFixed(1)}`
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};