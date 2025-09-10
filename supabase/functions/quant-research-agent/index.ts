import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuantAnalysisRequest {
  query: string;
  memory?: any;
}

interface QuantAnalysisResponse {
  summary: string;
  data_used: Record<string, any>;
  analysis: string;
  recommendation: string;
  memory: {
    tickers_tracked: string[];
    last_metrics: Record<string, any>;
    conclusions: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, memory = {} }: QuantAnalysisRequest = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Processing quant research query:', query);

    // Simulate OpenBB data retrieval (in production, this would integrate with actual OpenBB)
    const mockOpenBBData = await getMockFinancialData(query);

    const prompt = `You are **Quant Research Agent**, a financial AI integrated with OpenBB data and running on Gemini.

CORE IDENTITY:
- You are a professional, data-driven financial analyst.
- You never hallucinate numbers — you only use data retrieved via OpenBB Agent or explicitly provided.
- You maintain context across turns. Each response must carry forward a "memory" section with tickers, metrics, and insights so you can continue reasoning in future queries.

WORKFLOW:
1. Receive user query + any prior memory.
2. Retrieve financial data via OpenBB Agent.
3. Parse and analyze step by step:
   - Extract key metrics (PE ratio, EPS, growth, revenue, margins, risk indicators).
   - Compare against peers if requested.
   - Highlight risks, opportunities, and valuation concerns.
   - If user references "previous tickers" or "add X," recall memory and update it.
4. Always output valid JSON with **four sections**:

{
  "summary": "Plain-English executive summary of findings",
  "data_used": { "TICKER": { "metric": value, ... } },
  "analysis": "Deeper interpretation of trends, risks, opportunities",
  "recommendation": "Actionable insights, e.g., hold, research further, risks to note",
  "memory": {
    "tickers_tracked": ["AAPL", "TSLA", "AMZN"], 
    "last_metrics": { "TICKER": { "metric": value } },
    "conclusions": "Concise notes to recall next turn"
  }
}

FORMATTING RULES:
- Always produce JSON in the schema above.
- Do not add prose outside the JSON.
- If data is missing, explicitly note "Data unavailable for X" inside \`analysis\`.
- Keep summaries concise but professional.
- Update the memory field every turn (add new tickers, preserve old ones, update metrics).

Prior memory:
${JSON.stringify(memory)}

User query: ${query}
OpenBB data:
${JSON.stringify(mockOpenBBData)}

Analyze the data and provide insights in the exact JSON format specified above.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini response:', generatedText);

    // Parse JSON response
    let result: QuantAnalysisResponse;
    try {
      // Extract JSON from response (remove any markdown formatting)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : generatedText;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      result = {
        summary: generatedText.trim(),
        data_used: mockOpenBBData,
        analysis: "Could not parse JSON perfectly from Gemini response.",
        recommendation: "Verify analysis manually.",
        memory: memory || {
          tickers_tracked: [],
          last_metrics: {},
          conclusions: ""
        }
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in quant-research-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: "Analysis failed",
      data_used: {},
      analysis: "Error occurred during analysis",
      recommendation: "Please try again",
      memory: { tickers_tracked: [], last_metrics: {}, conclusions: "" }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getMockFinancialData(query: string): Promise<Record<string, any>> {
  // Extract tickers from query
  const tickerPattern = /\b[A-Z]{1,5}\b/g;
  const tickers = query.match(tickerPattern) || [];
  
  const data: Record<string, any> = {};
  
  for (const ticker of tickers) {
    // Mock financial data - in production, integrate with real OpenBB API
    data[ticker] = {
      price: Math.random() * 200 + 50,
      pe_ratio: Math.random() * 30 + 10,
      eps: Math.random() * 10 + 1,
      revenue_growth: (Math.random() - 0.5) * 0.4,
      profit_margin: Math.random() * 0.3 + 0.05,
      debt_to_equity: Math.random() * 2,
      current_ratio: Math.random() * 3 + 0.5,
      market_cap: Math.random() * 1000000000000 + 10000000000,
      volume: Math.random() * 100000000 + 1000000,
      beta: Math.random() * 2 + 0.5,
      dividend_yield: Math.random() * 0.05,
      analyst_rating: ['Buy', 'Hold', 'Sell'][Math.floor(Math.random() * 3)],
      price_target: Math.random() * 300 + 100
    };
  }
  
  return data;
}