import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock, 
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Signal {
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfits: number[];
  riskReward: number[];
  reasoning: string;
  timeframeValidity: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ICTSignalsProps {
  signals: Signal[];
  currentPrice: number;
}

export const ICTSignals: React.FC<ICTSignalsProps> = ({ signals, currentPrice }) => {
  const copySignalToClipboard = (signal: Signal) => {
    const signalText = `
🎯 ${signal.type} SIGNAL - ${signal.confidence}% Confidence
Entry: $${signal.entry.toFixed(2)}
Stop Loss: $${signal.stopLoss.toFixed(2)}
TP1: $${signal.takeProfits[0]?.toFixed(2)} (1:${signal.riskReward[0]?.toFixed(1)} RR)
TP2: $${signal.takeProfits[1]?.toFixed(2)} (1:${signal.riskReward[1]?.toFixed(1)} RR)
TP3: $${signal.takeProfits[2]?.toFixed(2)} (1:${signal.riskReward[2]?.toFixed(1)} RR)
Risk Level: ${signal.riskLevel.toUpperCase()}
Validity: ${signal.timeframeValidity}
Reasoning: ${signal.reasoning}
    `.trim();
    
    navigator.clipboard.writeText(signalText);
    toast.success('Signal copied to clipboard!');
  };

  const getSignalStatus = (signal: Signal) => {
    const entryDistance = Math.abs(currentPrice - signal.entry);
    const entryPercent = (entryDistance / signal.entry) * 100;
    
    if (entryPercent < 0.5) {
      return { status: 'At Entry', color: 'text-primary', bg: 'bg-primary/10' };
    } else if (currentPrice > signal.entry && signal.type === 'BUY') {
      return { status: 'In Profit', color: 'text-success', bg: 'bg-success/10' };
    } else if (currentPrice < signal.entry && signal.type === 'SELL') {
      return { status: 'In Profit', color: 'text-success', bg: 'bg-success/10' };
    } else {
      return { status: 'Pending', color: 'text-muted-foreground', bg: 'bg-muted/10' };
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'high': return 'bg-danger/20 text-danger border-danger/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-amber-600';
    return 'text-danger';
  };

  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
          <p className="text-muted-foreground">
            Run an analysis to generate ICT trading signals based on current market structure.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Signal Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Signals</p>
                <p className="text-2xl font-bold text-primary">{signals.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold text-success">
                  {Math.round(signals.reduce((acc, sig) => acc + sig.confidence, 0) / signals.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Risk:Reward</p>
                <p className="text-2xl font-bold text-accent">
                  1:{Math.max(...signals.flatMap(s => s.riskReward)).toFixed(1)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Signals */}
      <div className="space-y-4">
        {signals.map((signal, index) => {
          const signalStatus = getSignalStatus(signal);
          
          return (
            <Card key={index} className="border-l-4 border-l-primary bg-gradient-to-r from-background to-muted/30">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={signal.type === 'BUY' ? 'default' : 'destructive'}
                        className="text-base px-3 py-1"
                      >
                        {signal.type === 'BUY' ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {signal.type} SIGNAL
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className={getConfidenceColor(signal.confidence)}
                      >
                        {signal.confidence}% Confidence
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className={getRiskLevelColor(signal.riskLevel)}
                      >
                        {signal.riskLevel.toUpperCase()} Risk
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${signalStatus.bg} ${signalStatus.color}`}>
                        {signalStatus.status}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Valid for {signal.timeframeValidity}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copySignalToClipboard(signal)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Entry & Exit Levels
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium">Entry Price</span>
                        <span className="font-mono text-lg font-bold text-primary">
                          ${signal.entry.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-danger/10 rounded-lg">
                        <span className="text-sm font-medium">Stop Loss</span>
                        <span className="font-mono text-lg font-bold text-danger">
                          ${signal.stopLoss.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Take Profit Targets
                    </h4>
                    
                    <div className="space-y-2">
                      {signal.takeProfits.map((tp, tpIndex) => (
                        <div key={tpIndex} className="flex justify-between items-center p-2 bg-success/10 rounded">
                          <span className="text-sm">TP{tpIndex + 1}</span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-success">
                              ${tp.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              (1:{signal.riskReward[tpIndex]?.toFixed(1)} RR)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk/Reward Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Risk vs Reward Profile</span>
                    <span className="text-muted-foreground">
                      Max R:R 1:{Math.max(...signal.riskReward).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex h-3 bg-muted rounded-full overflow-hidden">
                    <div className="bg-danger h-full w-1/6"></div>
                    {signal.riskReward.map((rr, rrIndex) => (
                      <div 
                        key={rrIndex}
                        className="bg-success h-full opacity-70"
                        style={{ width: `${Math.min(rr * 5, 25)}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Risk</span>
                    <span>Reward</span>
                  </div>
                </div>

                {/* Signal Reasoning */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Analysis & Reasoning
                  </h4>
                  <Alert>
                    <AlertDescription>
                      {signal.reasoning}
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Risk Disclaimer */}
                <Alert className="border-amber-200 bg-amber-50/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Risk Warning:</strong> All trading involves risk. This signal is for educational purposes only. 
                    Always use proper risk management and never risk more than you can afford to lose.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};