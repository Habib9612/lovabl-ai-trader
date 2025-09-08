import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChartAnalysis {
  analysis: any;
  ticker: string;
  timestamp: string;
}

export const useChartAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureChart = useCallback((elementId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const element = document.getElementById(elementId);
      if (!element) {
        reject(new Error('Chart element not found'));
        return;
      }

      // Use html2canvas for screenshot capture
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(element, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: true
        }).then((canvas) => {
          const imageBase64 = canvas.toDataURL('image/png');
          resolve(imageBase64);
        }).catch(reject);
      }).catch(reject);
    });
  }, []);

  const analyzeChart = useCallback(async (
    imageBase64: string,
    ticker?: string,
    analysisType: string = 'comprehensive'
  ): Promise<ChartAnalysis> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('chart-analysis', {
        body: {
          imageBase64,
          ticker,
          analysisType
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      toast.success('Chart analysis completed successfully!');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Analysis failed: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const captureAndAnalyze = useCallback(async (
    chartElementId: string,
    ticker?: string,
    analysisType: string = 'comprehensive'
  ): Promise<ChartAnalysis> => {
    try {
      toast.info('Capturing chart...');
      const imageBase64 = await captureChart(chartElementId);
      
      toast.info('Analyzing chart with AI...');
      return await analyzeChart(imageBase64, ticker, analysisType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture and analyze chart';
      toast.error(errorMessage);
      throw err;
    }
  }, [captureChart, analyzeChart]);

  return {
    loading,
    error,
    captureChart,
    analyzeChart,
    captureAndAnalyze
  };
};