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
    const { imageBase64, strategies } = await req.json();
    console.log('Received image analysis request for strategies:', strategies);

    if (!imageBase64) {
      throw new Error('Image data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create strategy-specific analysis prompts
    const strategyPrompts = {
      'ict': `Analyze this chart using Inner Circle Trader (ICT) concepts:
- Identify market structure (BOS - Break of Structure, CHoCH - Change of Character)
- Look for liquidity sweeps and stop hunts
- Identify order blocks and fair value gaps
- Analyze session patterns (London/New York overlap)
- Provide specific entry, stop loss, and take profit levels
- Rate confidence 1-100`,

      'technical': `Perform traditional technical analysis:
- Identify chart patterns (triangles, head & shoulders, flags, etc.)
- Analyze key indicators (RSI, MACD, moving averages)
- Find support and resistance levels
- Assess trend direction and momentum
- Provide entry and exit recommendations
- Rate setup confidence 1-100`,

      'price-action': `Analyze using pure price action:
- Identify candlestick patterns and formations
- Look for rejection wicks and engulfing patterns
- Analyze price momentum and volume
- Find key pivot points and swing levels
- Assess market sentiment from price behavior
- Provide trading signals with confidence rating`,

      'support-resistance': `Focus on support and resistance analysis:
- Identify major and minor S/R levels
- Look for level retests and confirmations
- Analyze breakouts and breakdowns
- Find confluence zones with multiple levels
- Assess probability of level holds vs breaks
- Provide specific trading levels`,

      'trend-following': `Analyze for trend following opportunities:
- Identify primary and secondary trends
- Look for trend continuation patterns
- Analyze pullbacks and retracements
- Find optimal trend entry points
- Assess trend strength and momentum
- Provide trend-based trading signals`,

      'reversal': `Look for reversal patterns and signals:
- Identify potential reversal formations
- Look for divergences and momentum shifts
- Analyze exhaustion patterns
- Find reversal confirmation signals
- Assess reversal probability
- Provide counter-trend trading opportunities`
    };

    const analysisResults = [];

    for (const strategy of strategies) {
      const prompt = strategyPrompts[strategy as keyof typeof strategyPrompts];
      if (!prompt) continue;

      console.log(`Analyzing with ${strategy} strategy`);

      const systemPrompt = `You are an expert trader specializing in ${strategy} analysis. 
      Analyze the provided chart image and provide detailed insights.
      
      Return your analysis as a JSON object with this exact structure:
      {
        "strategy": "${strategy}",
        "confidence": <number 1-100>,
        "signal": "<buy|sell|neutral>",
        "entryPrice": <number or null>,
        "stopLoss": <number or null>, 
        "takeProfit": <number or null>,
        "reasoning": "<detailed explanation>",
        "keyLevels": ["<level1>", "<level2>"],
        "timeframe": "<recommended timeframe>"
      }`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
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
                    text: prompt
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
            max_tokens: 1000,
            temperature: 0.7
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`OpenAI API error for ${strategy}:`, response.status, errorData);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log(`Raw response for ${strategy}:`, content);

        // Try to parse JSON from the response
        let analysisResult;
        try {
          // Extract JSON from response if it's wrapped in text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error(`Failed to parse JSON for ${strategy}:`, parseError);
          // Fallback: create a basic result from the text response
          analysisResult = {
            strategy,
            confidence: 70,
            signal: 'neutral',
            reasoning: content,
            keyLevels: [],
            timeframe: '1H'
          };
        }

        analysisResults.push(analysisResult);
        console.log(`Successfully analyzed with ${strategy} strategy`);

      } catch (error) {
        console.error(`Error analyzing with ${strategy} strategy:`, error);
        // Continue with other strategies even if one fails
      }
    }

    if (analysisResults.length === 0) {
      throw new Error('No analysis results generated');
    }

    console.log('Analysis completed successfully, results:', analysisResults.length);

    return new Response(
      JSON.stringify({ results: analysisResults }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in chart-image-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze chart image',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});