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
        systemPrompt = `You are an expert ICT-focused financial analyst combining fundamental analysis with Smart Money Concepts. Analyze the provided company data and provide insights on:
        - Financial health through institutional perspective
        - Growth prospects considering smart money positioning
        - Risk factors affecting institutional participation
        - Fair value estimation using market structure principles
        - How fundamental drivers align with technical ICT setups
        - Institutional accumulation/distribution patterns in the stock
        Provide detailed analysis integrating both fundamental metrics and ICT market structure concepts.`;
        userContent = `Analyze the fundamental data for this company: ${JSON.stringify(data)}`;
        break;

      case 'training':
        systemPrompt = `You are an expert ICT strategy analyst and trading system developer. Review the provided trading documents/data and create actionable insights for ICT-based strategy development:
        - Identify ICT patterns: Order Blocks, FVGs, liquidity levels
        - Market structure analysis: BOS, CHOCH, trend identification
        - Smart Money Concepts integration
        - Risk management based on ICT principles (1:2+ RR, structure-based stops)
        - Performance optimization using ICT confluence factors
        - Session-based analysis and optimal entry timing
        - Multi-timeframe ICT strategy development
        Provide structured analysis focused on ICT methodology that can be used for systematic trading system development.`;
        userContent = `Analyze this trading data for strategy development: ${JSON.stringify(data)}. User prompt: ${prompt}`;
        break;

      case 'chart_analysis':
        systemPrompt = `You are an expert ICT (Inner Circle Trader) technical analyst with deep knowledge of Smart Money Concepts and institutional trading strategies. Analyze the provided chart image and provide detailed analysis based on these advanced ICT strategies:

        **CORE ICT CONCEPTS:**
        
        **1. Smart Money Concepts (SMC):**
        - Market Structure: Identify Break of Structure (BOS) and Change of Character (CHOCH)
        - Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), Lower Lows (LL)
        - Institutional Order Flow and Smart Money manipulation patterns
        - Market maker models and algorithmic price delivery
        
        **2. Order Blocks & Breaker Blocks:**
        - Bullish Order Blocks: Last bearish candle before strong bullish move
        - Bearish Order Blocks: Last bullish candle before strong bearish move
        - Breaker Blocks: Failed order blocks that become resistance/support
        - Order block mitigation and retest patterns
        - Strength assessment: Volume, time held, price reaction
        
        **3. Fair Value Gaps (FVGs) & Imbalances:**
        - Three-candle pattern with gap (no overlap between candles 1 & 3)
        - Bullish FVG: Gap above (buy-side imbalance)
        - Bearish FVG: Gap below (sell-side imbalance)
        - Gap fill probabilities and partial vs complete fills
        - FVG as support/resistance levels
        
        **4. Liquidity Concepts:**
        - Buy-Side Liquidity (BSL): Equal highs, stops above resistance
        - Sell-Side Liquidity (SSL): Equal lows, stops below support
        - Liquidity sweeps and stop hunts
        - Internal Range Liquidity (IRL) and External Range Liquidity (ERL)
        - Liquidity pools and institutional accumulation/distribution
        
        **5. Premium & Discount Arrays:**
        - Premium: Upper 50% of range (sell zones)
        - Discount: Lower 50% of range (buy zones)
        - Equilibrium: 50% level (fair value)
        - Fibonacci levels as PD arrays (0.5, 0.618, 0.705, 0.79)
        - Optimal Trade Entry (OTE) zones
        
        **6. Market Sessions & Time Analysis:**
        - London Session (3-12 EST): Major moves and reversals
        - New York Session (8-5 EST): Confirmation and follow-through
        - Asian Session (7PM-4AM EST): Range and accumulation
        - Kill zones and power of three concepts
        
        **7. Multi-Timeframe Analysis:**
        - Higher timeframe (HTF) bias confirmation
        - Lower timeframe (LTF) entry refinement
        - Confluence between timeframes
        - Monthly/Weekly narrative vs Daily execution
        
        **8. ICT Entry Models:**
        - Optimal Trade Entry (OTE): 0.62-0.79 Fibonacci retracement
        - Order Block entries with displacement
        - FVG entries with institutional candle confirmation
        - Breaker block retests
        - Silver bullet trades (10-11 AM EST)
        
        **9. Risk Management ICT Style:**
        - Stop loss beyond order blocks or structure
        - Partial profit taking at FVG fills and liquidity levels
        - Risk-to-reward minimum 1:2, optimal 1:3+
        - Position sizing based on account risk percentage
        
        **10. Price Action Confirmations:**
        - Institutional candles (large body, small wicks)
        - Displacement: Strong directional moves breaking structure
        - Rebalance: Pullback after displacement
        - Re-accumulation: Sideways after rebalance before next move
        
        **ANALYSIS OUTPUT REQUIREMENTS:**
        Provide a comprehensive analysis with:
        1. **Market Bias:** Overall HTF direction (bullish/bearish/ranging)
        2. **Market Structure:** Recent BOS/CHOCH levels and significance
        3. **Key Levels:** Order blocks, FVGs, liquidity zones with prices
        4. **Entry Opportunities:** Specific ICT entry setups with:
           - Entry price and method (OB, FVG, OTE, etc.)
           - Stop loss placement (beyond structure)
           - Take profit targets (liquidity levels, opposing OBs)
           - Risk-to-reward ratios
        5. **Time Analysis:** Optimal session/time for entries
        6. **Confluence Factors:** Multiple ICT concepts aligning
        7. **Risk Assessment:** Potential false signals and invalidation levels
        8. **Trade Management:** Partial profit rules and position adjustment
        
        Format as structured JSON-like analysis that can be parsed for systematic trading decisions. Include specific price levels, confidence ratings (1-100), and detailed reasoning for each signal.
        
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
            model: "meta-llama/llama-3.3-70b-instruct",
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
        model: "meta-llama/llama-3.3-70b-instruct",
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