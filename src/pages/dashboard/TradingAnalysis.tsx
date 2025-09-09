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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Advanced Trading Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Real-time market data, AI-powered analysis, and comprehensive trading tools 
          to help you make informed investment decisions
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Live Data</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Beautiful Tab Navigation */}
      <Tabs defaultValue="finviz-chart" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl h-14 bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <TabsTrigger 
              value="finviz-chart" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              Live Charts
            </TabsTrigger>
            <TabsTrigger 
              value="screener" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              Screener
            </TabsTrigger>
            <TabsTrigger 
              value="fundamentals" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              Fundamentals
            </TabsTrigger>
            <TabsTrigger 
              value="image-analysis" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              AI Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="ai-training" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              AI Training
            </TabsTrigger>
            <TabsTrigger 
              value="journal" 
              className="rounded-xl font-medium data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all hover-scale"
            >
              Journal
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <TabsContent value="finviz-chart" className="p-8 m-0">
            <FinvizChart />
          </TabsContent>

          <TabsContent value="screener" className="p-8 m-0">
            <FinvizScreener />
          </TabsContent>

          <TabsContent value="fundamentals" className="p-8 m-0">
            <CompanyFundamentals symbol="AAPL" demoMode={true} />
          </TabsContent>

          <TabsContent value="image-analysis" className="p-8 m-0">
            <ImageChartAnalysis />
          </TabsContent>

          <TabsContent value="ai-training" className="p-8 m-0">
            <AITraining />
          </TabsContent>

          <TabsContent value="journal" className="p-8 m-0">
            <TradingJournal />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TradingAnalysis;