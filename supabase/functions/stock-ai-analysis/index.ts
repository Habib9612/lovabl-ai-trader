import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, symbol, timeframe, strategy, stockData } = await req.json();
    
    if (!prompt) {
      throw new Error('Analysis prompt is required');
    }

    console.log('Stock AI Analysis: Processing request for', symbol);

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const systemPrompt = `You are an expert financial analyst with deep knowledge of:

1. Technical Analysis:
   - Chart patterns, support/resistance levels
   - Moving averages, RSI, MACD, volume analysis
   - Trend identification and momentum indicators

2. Fundamental Analysis:
   - Financial ratios (P/E, P/B, ROE, ROA)
   - Market capitalization and valuation metrics
   - Sector analysis and competitive positioning

3. Trading Strategies:
   - Day trading, swing trading, position trading
   - Momentum and value investing approaches
   - ICT (Inner Circle Trading) concepts
   - Risk management and position sizing

4. Market Analysis:
   - Market sentiment and economic factors
   - Sector rotation and market cycles
   - Risk assessment and probability analysis

Provide detailed, actionable analysis with specific recommendations. Always include confidence levels and risk assessments.

Format your response as a JSON object with the following structure:
{
  "analysis": "Detailed technical and fundamental analysis",
  "recommendation": "Clear BUY/SELL/HOLD recommendation with reasoning",
  "confidence": number (1-100),
  "riskLevel": "low/medium/high",
  "targetPrice": number (optional),
  "stopLoss": number (optional),
  "timeframe": "provided timeframe",
  "strategy": "provided strategy"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trading-ai-dashboard.lovable.dev',
        'X-Title': 'Trading AI Dashboard'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content received from OpenRouter');
    }

    console.log('Stock AI Analysis: Received response from OpenRouter API');

    // Try to parse as JSON, fallback to structured text if parsing fails
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch {
      // If JSON parsing fails, create a structured response
      analysisResult = {
        analysis: analysisText,
        recommendation: extractRecommendation(analysisText),
        confidence: extractConfidence(analysisText),
        riskLevel: extractRiskLevel(analysisText),
        targetPrice: extractTargetPrice(analysisText),
        stopLoss: extractStopLoss(analysisText),
        timeframe: timeframe,
        strategy: strategy
      };
    }

    // Ensure all required fields are present
    if (!analysisResult.timeframe) analysisResult.timeframe = timeframe;
    if (!analysisResult.strategy) analysisResult.strategy = strategy;
    if (!analysisResult.confidence) analysisResult.confidence = 75;
    if (!analysisResult.riskLevel) analysisResult.riskLevel = 'medium';

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      symbol: symbol,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stock-ai-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions to extract information from text analysis
function extractRecommendation(text: string): string {
  const buyPattern = /\b(buy|long|bullish)\b/i;
  const sellPattern = /\b(sell|short|bearish)\b/i;
  const holdPattern = /\b(hold|neutral|sideways)\b/i;
  
  if (buyPattern.test(text)) return 'BUY';
  if (sellPattern.test(text)) return 'SELL';
  if (holdPattern.test(text)) return 'HOLD';
  
  return 'HOLD';
}

function extractConfidence(text: string): number {
  const confidenceMatch = text.match(/confidence[:\s]*(\d{1,2})%/i);
  if (confidenceMatch) {
    return parseInt(confidenceMatch[1]);
  }
  return 75; // Default confidence
}

function extractRiskLevel(text: string): string {
  if (/\b(high risk|very risky)\b/i.test(text)) return 'high';
  if (/\b(low risk|conservative)\b/i.test(text)) return 'low';
  return 'medium';
}

function extractTargetPrice(text: string): number | undefined {
  const targetMatch = text.match(/target[:\s]*\$?(\d+\.?\d*)/i);
  if (targetMatch) {
    return parseFloat(targetMatch[1]);
  }
  return undefined;
}

function extractStopLoss(text: string): number | undefined {
  const stopLossMatch = text.match(/stop[:\s]*\$?(\d+\.?\d*)/i);
  if (stopLossMatch) {
    return parseFloat(stopLossMatch[1]);
  }
  return undefined;
}