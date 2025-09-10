import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Shield, 
  DollarSign, 
  TrendingDown, 
  AlertTriangle,
  Target,
  PieChart
} from 'lucide-react';

interface Signal {
  type: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfits: number[];
  riskReward: number[];
}

interface ICTRiskCalculatorProps {
  signals: Signal[];
}

interface PositionCalculation {
  accountSize: number;
  riskPercentage: number;
  riskAmount: number;
  positionSize: number;
  positionValue: number;
  potentialLoss: number;
  potentialGains: number[];
  maxDrawdown: number;
}

export const ICTRiskCalculator: React.FC<ICTRiskCalculatorProps> = ({ signals }) => {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [selectedSignal, setSelectedSignal] = useState(0);
  const [calculations, setCalculations] = useState<PositionCalculation | null>(null);

  const signal = signals[selectedSignal];

  useEffect(() => {
    if (signal && accountSize > 0) {
      calculatePosition();
    }
  }, [accountSize, riskPercentage, selectedSignal, signal]);

  const calculatePosition = () => {
    if (!signal) return;

    const riskPercent = riskPercentage[0] / 100;
    const riskAmount = accountSize * riskPercent;
    const stopLossDistance = Math.abs(signal.entry - signal.stopLoss);
    const positionSize = Math.floor(riskAmount / stopLossDistance);
    const positionValue = positionSize * signal.entry;
    const potentialLoss = positionSize * stopLossDistance;
    
    const potentialGains = signal.takeProfits.map(tp => {
      const gain = Math.abs(tp - signal.entry) * positionSize;
      return gain;
    });

    const maxDrawdown = (potentialLoss / accountSize) * 100;

    setCalculations({
      accountSize,
      riskPercentage: riskPercentage[0],
      riskAmount,
      positionSize,
      positionValue,
      potentialLoss,
      potentialGains,
      maxDrawdown
    });
  };

  const getMaxGainPercent = () => {
    if (!calculations) return 0;
    const maxGain = Math.max(...calculations.potentialGains);
    return (maxGain / calculations.accountSize) * 100;
  };

  const getRiskLevel = (riskPercent: number) => {
    if (riskPercent <= 1) return { level: 'Conservative', color: 'text-success', bg: 'bg-success/10' };
    if (riskPercent <= 2) return { level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-500/10' };
    if (riskPercent <= 5) return { level: 'Aggressive', color: 'text-danger', bg: 'bg-danger/10' };
    return { level: 'Very High Risk', color: 'text-red-600', bg: 'bg-red-500/10' };
  };

  if (!signal) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Signals Available</h3>
          <p className="text-muted-foreground">
            Generate trading signals first to use the risk calculator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = getRiskLevel(riskPercentage[0]);

  return (
    <div className="space-y-6">
      {/* Risk Calculator Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Position Size & Risk Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-size">Account Size ($)</Label>
                <Input
                  id="account-size"
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  placeholder="10000"
                  className="font-mono"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Risk per Trade (%)</Label>
                  <Badge variant="outline" className={`${riskLevel.color} ${riskLevel.bg}`}>
                    {riskLevel.level}
                  </Badge>
                </div>
                <Slider
                  value={riskPercentage}
                  onValueChange={setRiskPercentage}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0.5%</span>
                  <span className="font-medium">{riskPercentage[0]}%</span>
                  <span>10%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {signals.length > 1 && (
                <div className="space-y-2">
                  <Label>Select Signal</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedSignal}
                    onChange={(e) => setSelectedSignal(Number(e.target.value))}
                  >
                    {signals.map((sig, index) => (
                      <option key={index} value={index}>
                        {sig.type} Signal #{index + 1} - {sig.confidence}% Confidence
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <h4 className="font-medium">Selected Signal</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Entry: <span className="font-mono">${signal.entry.toFixed(2)}</span></div>
                  <div>Stop: <span className="font-mono">${signal.stopLoss.toFixed(2)}</span></div>
                  <div>Type: <span className="font-medium">{signal.type}</span></div>
                  <div>Confidence: <span className="font-medium">{signal.confidence}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Calculation Results */}
      {calculations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Position Size</p>
                  <p className="text-xl font-bold text-primary">
                    {calculations.positionSize.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">shares</p>
                </div>
                <PieChart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Position Value</p>
                  <p className="text-xl font-bold text-accent">
                    ${calculations.positionValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">total investment</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Amount</p>
                  <p className="text-xl font-bold text-danger">
                    ${calculations.riskAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{calculations.riskPercentage}% of account</p>
                </div>
                <TrendingDown className="h-8 w-8 text-danger" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Max Gain</p>
                  <p className="text-xl font-bold text-success">
                    ${Math.max(...calculations.potentialGains).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{getMaxGainPercent().toFixed(1)}% of account</p>
                </div>
                <Target className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Risk Analysis */}
      {calculations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-danger/10 rounded-lg">
                  <span className="text-sm font-medium">Maximum Loss</span>
                  <span className="font-mono text-lg font-bold text-danger">
                    -${calculations.potentialLoss.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Stop Loss Distance</span>
                  <span className="font-mono text-sm">
                    ${Math.abs(signal.entry - signal.stopLoss).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Max Drawdown</span>
                  <span className="font-mono text-sm">
                    {calculations.maxDrawdown.toFixed(2)}%
                  </span>
                </div>
              </div>

              <Alert className={calculations.riskPercentage > 5 ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {calculations.riskPercentage > 5 
                    ? "⚠️ High Risk: Consider reducing position size. Risking more than 5% per trade is very aggressive."
                    : calculations.riskPercentage > 2
                    ? "⚠️ Moderate Risk: This is within acceptable risk parameters for most traders."
                    : "✅ Conservative Risk: This risk level follows proper money management principles."
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Profit Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {signal.takeProfits.map((tp, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">TP{index + 1}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (1:{signal.riskReward[index]?.toFixed(1)} RR)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-success">
                        +${calculations.potentialGains[index]?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((calculations.potentialGains[index] / calculations.accountSize) * 100).toFixed(1)}% gain
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Total Reward Potential</div>
                  <div className="font-mono text-xl font-bold text-primary">
                    +${calculations.potentialGains.reduce((sum, gain) => sum + gain, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    if all targets hit
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Position Management Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Position Management Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-success">Best Practices</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Never risk more than 1-2% per trade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Use proper stop-loss placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Scale out at profit targets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Move stop to breakeven after TP1</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-danger">Avoid These Mistakes</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-danger">✗</span>
                  <span>Overleveraging your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger">✗</span>
                  <span>Moving stop loss against you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger">✗</span>
                  <span>Risking more than planned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger">✗</span>
                  <span>Ignoring risk management rules</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};