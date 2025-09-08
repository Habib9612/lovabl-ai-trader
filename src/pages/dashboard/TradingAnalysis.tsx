import React from 'react';
import { EnhancedTradingChart } from '@/components/charts/EnhancedTradingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, BarChart3, Camera } from 'lucide-react';

const TradingAnalysis = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Trading Analysis</h1>
        <p className="text-muted-foreground">
          Real-time market data, AI-powered chart analysis, and ICT trading strategies
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Data</p>
                <h3 className="text-2xl font-bold">Polygon.io</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Analysis</p>
                <h3 className="text-2xl font-bold">GPT-4 Vision</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strategy</p>
                <h3 className="text-2xl font-bold">ICT Method</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analytics</p>
                <h3 className="text-2xl font-bold">OpenBB</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Real-Time Market Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Live stock prices and charts</li>
                <li>• Historical market data</li>
                <li>• Dividend information</li>
                <li>• Volume and volatility metrics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">AI Chart Analysis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chart pattern recognition</li>
                <li>• Support/resistance levels</li>
                <li>• Trend analysis and forecasting</li>
                <li>• Risk assessment</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">ICT Trading Strategy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Market structure analysis</li>
                <li>• Order blocks identification</li>
                <li>• Liquidity zone mapping</li>
                <li>• Fair value gap detection</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Technical Indicators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• RSI and momentum indicators</li>
                <li>• MACD and signal analysis</li>
                <li>• Bollinger Bands</li>
                <li>• Moving averages (SMA/EMA)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Multiple Strategies</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Swing trading setups</li>
                <li>• Day trading opportunities</li>
                <li>• Position trading analysis</li>
                <li>• Risk management tools</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">OpenBB Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Financial ratio analysis</li>
                <li>• Portfolio optimization</li>
                <li>• Market screening tools</li>
                <li>• Fundamental data insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Trading Chart */}
      <EnhancedTradingChart />

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use the Analysis Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <h4 className="font-semibold">Enter a Stock Ticker</h4>
                <p className="text-sm text-muted-foreground">
                  Type any stock symbol (e.g., AAPL, TSLA, NVDA) to load real-time market data from Polygon.io
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <h4 className="font-semibold">Select Time Frame</h4>
                <p className="text-sm text-muted-foreground">
                  Choose from 1D, 1W, 1M, 3M, or 1Y to analyze different time horizons and trading strategies
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <h4 className="font-semibold">Analyze with AI</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Analyze Chart" to capture the chart and get comprehensive AI analysis using GPT-4 Vision
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <h4 className="font-semibold">Review Analysis Tabs</h4>
                <p className="text-sm text-muted-foreground">
                  Explore Technical indicators, Dividend data, AI Analysis, and ICT Strategy recommendations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingAnalysis;