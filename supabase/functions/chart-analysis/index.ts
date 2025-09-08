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
    const { imageBase64, ticker, analysisType = 'comprehensive' } = await req.json();
    
    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `You are an expert financial analyst and technical analysis specialist with deep knowledge of:

1. ICT (Inner Circle Trading) Strategy:
   - Market structure analysis
   - Order blocks and fair value gaps
   - Liquidity sweeps and stop hunts
   - Premium and discount zones
   - Session-based trading concepts

2. Technical Analysis:
   - Support and resistance levels
   - Chart patterns (triangles, flags, head and shoulders, etc.)
   - Moving averages and trend analysis
   - Volume analysis
   - Momentum indicators (RSI, MACD, Stochastic)
   - Fibonacci retracements and extensions

3. Fundamental Analysis Context:
   - Market sentiment indicators
   - Economic event impacts
   - Sector rotation analysis
   - Risk assessment

4. Multiple Trading Strategies:
   - Swing trading setups
   - Day trading opportunities
   - Position trading analysis
   - Risk management recommendations

Analyze the provided chart image and provide a comprehensive analysis including:
- Current market structure
- Key support/resistance levels
- ICT concepts (order blocks, fair value gaps, liquidity zones)
- Technical indicator signals
- Pattern recognition
- Entry/exit recommendations with risk management
- Multiple timeframe considerations
- Risk assessment and position sizing suggestions

Format your response as a structured JSON with clear sections for each analysis type.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${ticker || 'financial'} chart using ICT strategy, technical analysis, and fundamental considerations. Provide detailed insights for different trading strategies.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_completion_tokens: 2000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log(`Successfully analyzed chart for ${ticker || 'unknown ticker'}`);

    // Try to parse as JSON, fallback to plain text if parsing fails
    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysis);
    } catch {
      structuredAnalysis = {
        raw_analysis: analysis,
        ticker: ticker || 'N/A',
        analysis_type: analysisType,
        timestamp: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify({
      analysis: structuredAnalysis,
      ticker: ticker || 'N/A',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chart-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});