import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pattern recognition algorithms
const detectPatterns = (priceData: number[], timeframe: string) => {
  const patterns = [];
  
  // Simple moving average crossover pattern
  if (priceData.length >= 20) {
    const sma5 = calculateSMA(priceData.slice(-5), 5);
    const sma20 = calculateSMA(priceData.slice(-20), 20);
    
    if (sma5 > sma20 && priceData[priceData.length - 6] <= priceData[priceData.length - 21]) {
      patterns.push({
        type: 'Golden Cross',
        confidence: 0.75,
        prediction: 'Bullish - Short-term average crossed above long-term average',
        accuracy: 68
      });
    }
  }
  
  // Support and resistance levels
  const highs = findLocalMaxima(priceData);
  const lows = findLocalMinima(priceData);
  
  if (highs.length >= 2) {
    const recentHighs = highs.slice(-2);
    if (Math.abs(recentHighs[0] - recentHighs[1]) / recentHighs[0] < 0.02) {
      patterns.push({
        type: 'Double Top',
        confidence: 0.82,
        prediction: 'Bearish - Double top pattern indicates potential reversal',
        accuracy: 73
      });
    }
  }
  
  if (lows.length >= 2) {
    const recentLows = lows.slice(-2);
    if (Math.abs(recentLows[0] - recentLows[1]) / recentLows[0] < 0.02) {
      patterns.push({
        type: 'Double Bottom',
        confidence: 0.79,
        prediction: 'Bullish - Double bottom pattern indicates potential reversal',
        accuracy: 71
      });
    }
  }
  
  // Triangle pattern detection
  if (priceData.length >= 10) {
    const highs = findLocalMaxima(priceData.slice(-10));
    const lows = findLocalMinima(priceData.slice(-10));
    
    if (highs.length >= 2 && lows.length >= 2) {
      const highTrend = calculateTrend(highs);
      const lowTrend = calculateTrend(lows);
      
      if (highTrend < 0 && lowTrend > 0) {
        patterns.push({
          type: 'Symmetrical Triangle',
          confidence: 0.65,
          prediction: 'Neutral - Triangle pattern suggests consolidation before breakout',
          accuracy: 64
        });
      }
    }
  }
  
  return patterns;
};

const calculateSMA = (data: number[], period: number): number => {
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
};

const findLocalMaxima = (data: number[]): number[] => {
  const maxima = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      maxima.push(data[i]);
    }
  }
  return maxima;
};

const findLocalMinima = (data: number[]): number[] => {
  const minima = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] < data[i - 1] && data[i] < data[i + 1]) {
      minima.push(data[i]);
    }
  }
  return minima;
};

const calculateTrend = (data: number[]): number => {
  if (data.length < 2) return 0;
  const n = data.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = data.reduce((acc, val) => acc + val, 0);
  const sumXY = data.reduce((acc, val, i) => acc + (i * val), 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceData, ticker, timeframe } = await req.json();

    if (!priceData || !Array.isArray(priceData) || priceData.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid price data - need at least 10 data points' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Detect patterns
    const detectedPatterns = detectPatterns(priceData, timeframe || '1D');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get or create asset
    let asset;
    if (ticker) {
      const { data: existingAsset } = await supabase
        .from('assets')
        .select('id')
        .eq('symbol', ticker.toUpperCase())
        .single();

      if (existingAsset) {
        asset = existingAsset;
      } else {
        const { data: newAsset, error: assetError } = await supabase
          .from('assets')
          .insert({
            symbol: ticker.toUpperCase(),
            name: ticker.toUpperCase(),
            asset_type: 'stock'
          })
          .select('id')
          .single();

        if (assetError) {
          console.error('Error creating asset:', assetError);
        } else {
          asset = newAsset;
        }
      }
    }

    // Store detected patterns in database
    const patternInserts = [];
    for (const pattern of detectedPatterns) {
      if (asset) {
        patternInserts.push({
          asset_id: asset.id,
          pattern_type: pattern.type,
          confidence_score: pattern.confidence,
          price_data: { data: priceData, length: priceData.length },
          timeframe: timeframe || '1D',
          prediction: pattern.prediction,
          accuracy_score: pattern.accuracy
        });
      }
    }

    if (patternInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('pattern_recognition')
        .insert(patternInserts);

      if (insertError) {
        console.error('Error inserting patterns:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        patterns: detectedPatterns,
        ticker: ticker || 'Unknown',
        timeframe: timeframe || '1D',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in pattern recognition function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});