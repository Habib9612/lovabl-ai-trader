import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, prompt } = await req.json();
    const openRouterApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    let systemPrompt = '';
    let userContent = '';

    switch (type) {
      case 'fundamentals':
        systemPrompt = `You are an expert financial analyst specializing in fundamental analysis. Analyze the provided company data and provide insights on:
        - Financial health and key metrics
        - Growth prospects and competitive position
        - Risk factors and investment recommendations
        - Fair value estimation
        Provide detailed analysis with specific numbers and ratios where applicable.`;
        userContent = `Analyze the fundamental data for this company: ${JSON.stringify(data)}`;
        break;

      case 'training':
        systemPrompt = `You are an expert trading strategy analyst. Review the provided trading documents/data and create actionable insights for strategy development:
        - Key patterns and signals identified
        - Strategy recommendations based on the data
        - Risk management suggestions
        - Performance optimization tips
        Provide structured analysis that can be used for AI model training.`;
        userContent = `Analyze this trading data for strategy development: ${JSON.stringify(data)}. User prompt: ${prompt}`;
        break;

      case 'chart_analysis':
        systemPrompt = `You are an expert technical analyst with deep knowledge of multiple trading strategies. Analyze the provided chart image and provide detailed analysis based on these strategies:

        **ICT Strategy (Inner Circle Trader):**
        - Smart Money Concepts (SMC)
        - Order blocks and breaker blocks
        - Fair value gaps (FVGs)
        - Liquidity zones and sweeps
        - Premium and discount arrays

        **Technical Analysis:**
        - Classic chart patterns (triangles, flags, H&S, etc.)
        - Support and resistance levels
        - Fibonacci retracements and extensions
        - Moving averages and trend lines

        **Price Action:**
        - Candlestick patterns and formations
        - Market structure (higher highs/lows)
        - Pin bars, engulfing patterns
        - Supply and demand zones

        **Support & Resistance:**
        - Key psychological levels
        - Previous highs and lows
        - Volume profile and VWAP
        - Dynamic support/resistance

        **Trend Following:**
        - Trend identification and strength
        - Momentum indicators
        - Breakout confirmations
        - Trend continuation patterns

        **Reversal Patterns:**
        - Double tops/bottoms
        - Divergences
        - Reversal candlestick patterns
        - Exhaustion signals

        Provide a comprehensive analysis with:
        1. Current market structure and bias (bullish/bearish/neutral)
        2. Key levels for each strategy
        3. Entry and exit points with reasoning
        4. Risk management suggestions (stop loss, take profit)
        5. Confidence level for each signal
        6. Timeframe recommendations

        Format as structured analysis that can be parsed for trading decisions.`;
        
        // For image analysis, we need to use the OpenRouter Vision API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://lovable.dev',
            'X-Title': 'Trading Analysis Platform'
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: systemPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${data.mimeType || 'image/jpeg'};base64,${data.base64.split(',')[1]}`
                    }
                  },
                  { type: "text", text: prompt || 'Analyze this trading chart using the strategies mentioned. Provide specific entry/exit levels and trading recommendations.' }
                ]
              }
            ],
            temperature: 0.3,
            max_tokens: 250
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('OpenRouter API error:', errorData);
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const result = await response.json();
        const analysis = result.choices?.[0]?.message?.content || 'No analysis generated';

        return new Response(JSON.stringify({ 
          analysis,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid analysis type');
    }

    // For text-based analysis (fundamentals and training)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Trading Analysis Platform'
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userContent
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.choices?.[0]?.message?.content || 'No analysis generated';

    return new Response(JSON.stringify({ 
      analysis,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openrouter-ai-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});