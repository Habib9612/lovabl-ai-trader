import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Analysis</h3>
        </div>
        <Button 
          onClick={handleGetAnalysis}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Brain className="w-4 h-4 mr-2" />
          Get Full Analysis
        </Button>
      </div>
      
      <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h4 className="text-xl font-semibold mb-2">Advanced AI Trading Analysis</h4>
          <p className="text-muted-foreground mb-4">
            Get comprehensive trading signals, risk analysis, and technical insights for {symbol}
          </p>
          <ul className="text-sm text-muted-foreground mb-6 space-y-1">
            <li>• AI-powered buy/sell signals with confidence scores</li>
            <li>• Risk management and position sizing recommendations</li>
            <li>• Technical analysis with support/resistance levels</li>
            <li>• Detailed explanation of trading rationale</li>
          </ul>
          <Button 
            onClick={handleGetAnalysis}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Launch Analysis Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};