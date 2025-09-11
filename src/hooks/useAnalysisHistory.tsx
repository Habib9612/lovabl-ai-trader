import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnalysisHistoryItem {
  id: string;
  symbol: string;
  analysis_type: string;
  analysis_result: any;
  confidence_score: number;
  trading_style: string;
  strategy: string;
  created_at: string;
}

export const useAnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveAnalysis = async (
    symbol: string,
    analysisResult: any,
    confidenceScore: number,
    tradingStyle: string,
    strategy: string,
    analysisType: string = 'comprehensive'
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chart_analysis_results')
        .insert({
          user_id: user.id,
          symbol,
          analysis_type: analysisType,
          analysis_result: analysisResult,
          confidence_score: confidenceScore,
          trading_style: tradingStyle,
          strategy
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to local history
      setHistory(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chart_analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  return {
    history,
    loading,
    saveAnalysis,
    loadHistory
  };
};