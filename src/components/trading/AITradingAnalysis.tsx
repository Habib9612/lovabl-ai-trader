import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, Shield, BarChart3, Target } from 'lucide-react';

interface AIAnalysisProps {
  symbol: string;
  currentPrice: number;
}

export const AITradingAnalysis: React.FC<AIAnalysisProps> = ({ symbol, currentPrice }) => {
  const navigate = useNavigate();

  const handleGetAnalysis = () => {
    navigate(`/dashboard/ai-analysis?symbol=${symbol}&price=${currentPrice}`);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Trading Analysis</h3>
            <p className="text-muted-foreground">Get comprehensive market insights</p>
          </div>
        </div>
        <Button 
          onClick={handleGetAnalysis}
          size="lg"
          className="bg-gradient-primary hover:shadow-primary shadow-lg transition-all"
        >
          <Brain className="w-5 h-5 mr-2" />
          Get Full Analysis
        </Button>
      </div>
      
      <Card className="border-0 shadow-xl bg-gradient-card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-bold mb-2">Advanced AI Trading Analysis</h4>
            <p className="text-lg opacity-90">
              Comprehensive trading signals and market insights for {symbol}
            </p>
          </div>
        </div>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h5 className="font-bold text-green-900 mb-2">AI-Powered Signals</h5>
              <p className="text-sm text-green-700">Buy/sell recommendations with confidence scores</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h5 className="font-bold text-blue-900 mb-2">Risk Management</h5>
              <p className="text-sm text-blue-700">Position sizing and risk assessment</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h5 className="font-bold text-purple-900 mb-2">Technical Analysis</h5>
              <p className="text-sm text-purple-700">Support/resistance levels and indicators</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <Target className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h5 className="font-bold text-orange-900 mb-2">Price Targets</h5>
              <p className="text-sm text-orange-700">Entry points and profit objectives</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleGetAnalysis}
              size="lg"
              className="bg-gradient-primary hover:shadow-primary shadow-lg transition-all px-8 py-3"
            >
              <Brain className="w-5 h-5 mr-2" />
              Launch Analysis Dashboard
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Generate comprehensive analysis in seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};