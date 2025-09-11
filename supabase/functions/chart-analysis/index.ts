import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import Puter.js library dynamically
const importPuter = async () => {
  const puterCode = await fetch('https://js.puter.com/v2/').then(r => r.text());
  // Create a minimal global context for Puter
  const puter = eval(`
    const window = globalThis;
    const document = { body: { appendChild: () => {} } };
    ${puterCode}
    puter;
  `);
  return puter;
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

    console.log('Chart Analysis: Processing request for ticker:', ticker);

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

    try {
      // Try to use Puter.js
      const puter = await importPuter();
      
      const userPrompt = `Analyze this ${ticker || 'financial'} chart using ICT strategy, technical analysis, and fundamental considerations. Provide detailed insights for different trading strategies.`;
      
      const response = await puter.ai.chat(
        userPrompt,
        imageBase64,
        { 
          model: "gpt-5-nano",
          max_tokens: 2000,
          temperature: 0.3
        }
      );

      console.log('Chart Analysis: Received response from Puter AI');

      // Try to parse as JSON, fallback to plain text if parsing fails
      let structuredAnalysis;
      try {
        structuredAnalysis = JSON.parse(response);
      } catch {
        structuredAnalysis = {
          raw_analysis: response,
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

    } catch (puterError) {
      console.error('Puter.js error:', puterError);
      
      // Fallback to direct API call without OpenAI key requirement
      try {
        // Use a simple text-based analysis as fallback
        const fallbackAnalysis = {
          market_structure: "Unable to analyze chart image - please try again",
          entry_zones: ["Chart analysis temporarily unavailable"],
          targets: ["Please re-upload chart"],
          stop_loss: "Risk management required",
          confidence: 1,
          timeframe: "N/A",
          risk_reward: "N/A",
          key_levels: ["Chart upload needed"],
          scenario_analysis: {
            bullish: "Chart analysis service temporarily unavailable",
            bearish: "Please try uploading the chart image again"
          },
          error: "Chart analysis service is currently experiencing issues"
        };

        return new Response(JSON.stringify({
          analysis: fallbackAnalysis,
          ticker: ticker || 'N/A',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (fallbackError) {
        throw new Error('Chart analysis service unavailable');
      }
    }

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