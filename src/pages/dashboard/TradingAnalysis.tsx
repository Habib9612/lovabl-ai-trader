import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedTradingChart } from '@/components/charts/EnhancedTradingChart';
import { CompanyFundamentals } from '@/components/trading/CompanyFundamentals';
import { ImageChartAnalysis } from '@/components/trading/ImageChartAnalysis';
import { AITraining } from '@/components/trading/AITraining';
import { TradingJournal } from '@/components/trading/TradingJournal';
import { FinvizScreener } from '@/components/trading/FinvizScreener';
import { FinvizChart } from '@/components/trading/FinvizChart';

const TradingAnalysis = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Trading Analysis</h1>
        <p className="text-muted-foreground">
          Real-time market data, AI-powered analysis, and comprehensive trading tools
        </p>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="charts">Live Charts</TabsTrigger>
          <TabsTrigger value="finviz-chart">FinViz Chart</TabsTrigger>
          <TabsTrigger value="screener">Stock Screener</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="image-analysis">Image Analysis</TabsTrigger>
          <TabsTrigger value="ai-training">AI Training</TabsTrigger>
          <TabsTrigger value="journal">Trading Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <EnhancedTradingChart />
        </TabsContent>

        <TabsContent value="finviz-chart" className="space-y-6">
          <FinvizChart />
        </TabsContent>

        <TabsContent value="screener" className="space-y-6">
          <FinvizScreener />
        </TabsContent>

        <TabsContent value="fundamentals" className="space-y-6">
          <CompanyFundamentals symbol="AAPL" demoMode={true} />
        </TabsContent>

        <TabsContent value="image-analysis" className="space-y-6">
          <ImageChartAnalysis />
        </TabsContent>

        <TabsContent value="ai-training" className="space-y-6">
          <AITraining />
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <TradingJournal />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingAnalysis;