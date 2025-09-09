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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
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
        systemPrompt = `You are an expert technical analyst specializing in chart pattern recognition and market structure analysis. Analyze the provided chart image and provide detailed insights on:
        - Chart patterns and formations
        - Support and resistance levels
        - Trend analysis and momentum
        - Entry/exit points and risk management
        - Market structure and order flow
        Provide specific price levels and actionable trading insights.`;
        
        // For image analysis, we need to use the Gemini Vision API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: data.mimeType || 'image/jpeg',
                    data: data.base64.split(',')[1] // Remove data:image/...;base64, prefix
                  }
                },
                { text: prompt || 'Analyze this trading chart for technical patterns and trading opportunities.' }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Gemini API error:', errorData);
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const result = await response.json();
        const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: userContent }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';

    return new Response(JSON.stringify({ 
      analysis,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-ai-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});