import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function executePythonScript(scriptPath: string, args: string[] = []): Promise<string> {
  const venvPython = "/home/ubuntu/venv/bin/python3"; // Path to python executable in venv

  // Set SMC_CREDIT=0 to suppress the smartmoneyconcepts library's credit message
  const fullCommand = `export SMC_CREDIT=0 && ${venvPython} ${scriptPath} ${args.map(a => `'${a}'`).join(' ')}`;
  console.log(`Executing Python command: ${fullCommand}`);

  const command = new Deno.Command("bash", {
    args: ["-c", fullCommand],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const errorOutput = new TextDecoder().decode(stderr);
    console.error(`Python script failed: ${errorOutput}`);
    throw new Error(`Python script execution failed: ${errorOutput}`);
  }

  return new TextDecoder().decode(stdout);
}

serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));
    const { type, data, prompt, symbol, interval, range } = requestBody;
    console.log(`Request type: ${type}`);
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY"); // Renamed from GEMINI_API_KEY


    let systemPrompt = '';
    let userContent = '';

    switch (type) {
      case 'fundamentals':
        if (!openRouterApiKey) {
          throw new Error('OpenRouter API key not configured');
        }
        systemPrompt = `You are an expert financial analyst with deep knowledge of fundamental analysis, institutional trading, and multi-asset market dynamics. Analyze the provided company data with comprehensive insights:\n\n        **FUNDAMENTAL ANALYSIS FRAMEWORK:**\n        - Financial Health: ROE, ROA, debt ratios, cash flow analysis, working capital\n        - Valuation Metrics: P/E, P/B, PEG, EV/EBITDA, DCF modeling\n        - Growth Analysis: Revenue growth, earnings growth, margin expansion\n        - Competitive Position: Market share, moats, competitive advantages\n        - Management Quality: Capital allocation, strategic vision, execution track record\n        \n        **INSTITUTIONAL PERSPECTIVE:**\n        - Smart money positioning and institutional ownership changes\n        - Insider trading patterns and corporate buyback programs\n        - Earnings estimate revisions and analyst sentiment shifts\n        - Options flow and unusual options activity\n        - Institutional accumulation vs distribution patterns\n        \n        **MULTI-ASSET CORRELATION:**\n        - Sector rotation implications and relative strength\n        - Correlation with bonds, commodities, currencies\n        - Market regime impact (risk-on vs risk-off)\n        - Economic cycle positioning and sensitivity\n        \n        **RISK ASSESSMENT:**\n        - Business risks, regulatory risks, market risks\n        - ESG factors and sustainability metrics\n        - Geopolitical impact and supply chain vulnerabilities\n        - Interest rate sensitivity and inflation impact\n        \n        Provide detailed analysis integrating quantitative metrics with qualitative insights, including fair value estimates and risk-adjusted return expectations.`;
        userContent = `Analyze the fundamental data for this company: ${JSON.stringify(data)}`;
        break;

      case 'training':
        if (!openRouterApiKey) {
          throw new Error('OpenRouter API key not configured');
        }
        systemPrompt = `You are an expert quantitative trading strategist and systematic trading system developer. Analyze the provided trading data and create comprehensive insights for advanced strategy development:\n\n        **STRATEGY DEVELOPMENT FRAMEWORKS:**\n        \n        **1. ICT & Smart Money Concepts:**\n        - Order Blocks, Fair Value Gaps, liquidity analysis\n        - Market structure: BOS, CHOCH, trend identification\n        - Premium/Discount arrays and optimal trade entries\n        - Multi-timeframe confluence and session analysis\n        \n        **2. Classical Technical Analysis:**\n        - Chart patterns: triangles, flags, wedges, head & shoulders\n        - Support/resistance levels and trend line analysis\n        - Moving averages: SMA, EMA, VWAP strategies\n        - Momentum indicators: RSI, MACD, Stochastic analysis\n        \n        **3. Price Action & Candlestick Patterns:**\n        - Reversal patterns: doji, hammer, engulfing, morning/evening star\n        - Continuation patterns: flags, pennants, rectangles\n        - Volume analysis and volume-price relationships\n        - Market microstructure and tape reading\n        \n        **4. Quantitative Analysis:**\n        - Statistical arbitrage and mean reversion strategies\n        - Momentum and trend following systems\n        - Volatility modeling and regime detection\n        - Correlation analysis and pairs trading\n        \n        **5. Risk Management Systems:**\n        - Position sizing algorithms (Kelly Criterion, fixed fractional)\n        - Dynamic stop-loss and take-profit optimization\n        - Portfolio heat and drawdown management\n        - Correlation-based risk adjustment\n        \n        **6. Market Microstructure:**\n        - Order flow analysis and market maker behavior\n        - Bid-ask spread dynamics and liquidity assessment\n        - High-frequency patterns and algorithmic detection\n        - Dark pool activity and institutional flow\n        \n        **7. Behavioral Finance Integration:**\n        - Sentiment indicators and contrarian signals\n        - Fear & greed cycles and market psychology\n        - Seasonal patterns and calendar effects\n        - News sentiment analysis and event-driven strategies\n        \n        **8. Multi-Asset Strategy Development:**\n        - Cross-asset momentum and carry strategies\n        - Currency strength analysis and basket trading\n        - Commodity seasonal patterns and storage costs\n        - Bond-equity correlation strategies\n        \n        **PERFORMANCE OPTIMIZATION:**\n        - Backtesting methodologies and walk-forward analysis\n        - Parameter optimization and overfitting prevention\n        - Transaction cost modeling and slippage analysis\n        - Risk-adjusted return metrics (Sharpe, Sortino, Calmar)\n        \n        Provide systematic, data-driven insights for robust trading strategy development with specific implementation guidelines.`;
        userContent = `Analyze this trading data for strategy development: ${JSON.stringify(data)}. User prompt: ${prompt}`;
        break;

      case 'fetch_historical_data':
        console.log(`Fetching historical data for ${symbol}, interval: ${interval}, range: ${range}...`);
        const fetchDataScriptPath = './lovabl-ai-trader/scripts/fetch_stock_data.py';
        const fetchDataArgs = [symbol, interval, range];
        let fetchedDataOutput;
        try {
          fetchedDataOutput = await executePythonScript(fetchDataScriptPath, fetchDataArgs);
          console.log('Fetched data raw output:', fetchedDataOutput);
        } catch (fetchError) {
          console.error('Error fetching historical data:', fetchError);
          return new Response(JSON.stringify({
            error: `Failed to fetch historical data: ${fetchError.message}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let parsedFetchedData;
        try {
          parsedFetchedData = JSON.parse(fetchedDataOutput);
          if (parsedFetchedData.error) {
            throw new Error(parsedFetchedData.error);
          }
        } catch (jsonError) {
          console.error('Error parsing fetched data output:', jsonError);
          return new Response(JSON.stringify({
            error: `Error parsing fetched data output: ${jsonError.message}. Raw output: ${fetchedDataOutput}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          data: parsedFetchedData,
          success: true,
          message: 'Historical data fetched successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'ict_analysis':
        console.log('Performing ICT analysis using Python script...');
        const pythonScriptPath = './lovabl-ai-trader/scripts/run_ict_analysis.py';
        const pythonArgs = [JSON.stringify(data)];
        let pythonOutput;
        try {
          pythonOutput = await executePythonScript(pythonScriptPath, pythonArgs);
          console.log('Python script raw output:', pythonOutput);
        } catch (pyError) {
          console.error('Error executing Python script:', pyError);
          return new Response(JSON.stringify({
            error: `Python script execution failed: ${pyError.message}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        let ictAnalysisResult;
        try {
          ictAnalysisResult = JSON.parse(pythonOutput);
        } catch (jsonError) {
          console.error('Error parsing Python script output:', jsonError);
          return new Response(JSON.stringify({
            error: `Error parsing Python script output: ${jsonError.message}. Raw output: ${pythonOutput}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          analysis: ictAnalysisResult,
          success: true,
          message: 'ICT analysis completed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'lstm_prediction':
        console.log('Performing LSTM prediction using Python script...');
        const lstmScriptPath = './lovabl-ai-trader/scripts/run_lstm_model.py';
        const lstmArgs = [JSON.stringify(data)];
        let lstmOutput;
        try {
          lstmOutput = await executePythonScript(lstmScriptPath, lstmArgs);
          console.log('Python LSTM script raw output:', lstmOutput);
        } catch (pyError) {
          console.error('Error executing Python LSTM script:', pyError);
          return new Response(JSON.stringify({
            error: `Python LSTM script execution failed: ${pyError.message}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let lstmPredictionResult;
        try {
          lstmPredictionResult = JSON.parse(lstmOutput);
        } catch (jsonError) {
          console.error('Error parsing Python LSTM script output:', jsonError);
          return new Response(JSON.stringify({
            error: `Error parsing Python LSTM script output: ${jsonError.message}. Raw output: ${lstmOutput}`,
            success: false
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          predictions: lstmPredictionResult.predictions,
          success: true,
          message: 'LSTM prediction completed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'chart_analysis':
        if (!openRouterApiKey) {
          throw new Error('OpenRouter API key not configured');
        }
        systemPrompt = `# Enhanced Trading Analysis System\n\nYou are an advanced trading analysis AI specializing in comprehensive market analysis. For each chart analysis, provide detailed, actionable insights with the following structure:\n\n## 1. Market Context & Overview\n- **Timeframe Analysis**: Identify the current timeframe and provide multi-timeframe perspective (daily, 4H, 1H context)\n- **Market Structure**: Describe the overall trend direction, market phase (accumulation, markup, distribution, markdown)\n- **Key Market Levels**: Identify significant support/resistance zones, institutional levels, and liquidity pools\n\n## 2. ICT Strategy Deep Analysis\n- **Market Structure Break (MSB)**: Identify and explain any structural breaks\n- **Order Blocks (OB)**: Locate demand/supply zones with precise entry areas\n- **Fair Value Gaps (FVG)**: Identify imbalances and their significance\n- **Liquidity Analysis**: Point out liquidity grabs, stop hunts, and liquidity zones\n- **Smart Money Concepts**: Explain institutional behavior and probable next moves\n\n## 3. Technical Analysis Integration\n- **Price Action Patterns**: Candlestick formations, chart patterns, and their implications\n- **Key Indicators**: Volume analysis, momentum indicators, and their confluence\n- **Fibonacci Levels**: Retracement and extension levels for potential targets\n- **Moving Averages**: Dynamic support/resistance and trend confirmation\n\n## 4. Enhanced Entry Strategy\nProvide multiple entry scenarios with detailed explanations:\n\n### Primary Entry Setup\n- **Entry Type**: (Market Order, Limit Order, Stop Order)\n- **Precise Entry Price**: With reasoning based on technical levels\n- **Entry Confirmation**: Required signals before execution\n- **Risk Assessment**: Probability of success and potential drawdowns\n\n### Secondary Entry Setup\n- **Alternative Entry**: If primary setup fails\n- **Scale-in Strategy**: Multiple entry points for position building\n- **Entry Timing**: Optimal session/time for execution\n\n## 5. Advanced Risk Management\nDesign comprehensive stop-loss strategy:\n\n### Stop Loss Structure\n- **Initial Stop Loss**: Conservative level below key support/resistance\n- **Technical Stop Loss**: Based on market structure (below order block, beyond liquidity zone)\n- **Time-based Stop**: Maximum holding period if setup doesn\\\\\\\\\\\\\\'t develop\n- **Trailing Stop Strategy**: How and when to move stops to breakeven and beyond\n\n### Position Sizing\n- **Risk Per Trade**: Recommended % of account risk\n- **Position Size Calculation**: Based on stop loss distance\n- **Maximum Exposure**: Total risk across correlated positions\n\n## 6. Multi-Target Profit Strategy\nCreate detailed take-profit levels:\n\n### Target Hierarchy\n- **Target 1** (30% position): Conservative target at nearest resistance/fibonacci level\n  - Price level and reasoning\n  - Expected timeframe to reach\n  \n- **Target 2** (40% position): Moderate target at key technical level\n  - Price level and reasoning\n  - Risk-reward ratio\n  \n- **Target 3** (20% position): Ambitious target at major resistance/extension\n  - Price level and reasoning\n  - Long-term outlook\n\n- **Runner** (10% position): Let profits run with trailing stop\n  - Trailing stop methodology\n  - Potential maximum target\n\n## 7. Scenario Planning\nProvide multiple market scenarios:\n\n### Bullish Scenario (X% probability)\n- Expected price path and key levels\n- Catalysts that could drive this outcome\n- Action plan and adjustments\n\n### Bearish Scenario (X% probability)\n- Alternative price path and invalidation levels\n- Risk factors and warning signs\n- Defensive strategy\n\n### Neutral/Consolidation Scenario (X% probability)\n- Range-bound expectations\n- How to adapt strategy\n\n## 8. Trade Management Rules\n- **Entry Confirmation Checklist**: All conditions that must be met\n- **Exit Triggers**: Specific conditions for each target and stop loss\n- **Position Adjustment Rules**: When and how to modify the trade\n- **Review Schedule**: When to reassess the trade setup\n\n## 9. Risk Warnings & Considerations\n- **Market Conditions**: Current volatility and liquidity considerations\n- **News/Events**: Upcoming economic events that could impact the trade\n- **Correlation Risks**: Other positions or assets that could affect this trade\n- **Maximum Drawdown**: Worst-case scenario planning\n\n## 10. Visual Trade Plan\nPresent the analysis in this exact format:\n\n📈 **TRADE SUMMARY**\nSymbol: [SYMBOL]\nDirection: [LONG/SHORT]\nConfidence: [XX%]\nRisk-Reward: [X:X]\n\n🎯 **ENTRY STRATEGY**\nPrimary Entry: $XXX.XX\nSecondary Entry: $XXX.XX\nEntry Type: [Limit/Market/Stop]\n\n⛔ **RISK MANAGEMENT**\nStop Loss: $XXX.XX (-X.XX%)\nRisk Amount: $XXX (X% of account)\nPosition Size: XXX units\n\n💰 **PROFIT TARGETS**\n🥉 Target 1: $XXX.XX (+X.XX%) [30%]\n🥈 Target 2: $XXX.XX (+X.XX%) [40%] \n🥇 Target 3: $XXX.XX (+X.XX%) [20%]\n🏃 Runner: Trailing stop [10%]\n\n⏱️ **TIME HORIZON**\nExpected Duration: X days/weeks\nReview Date: [DATE]\n\n**CRITICAL REQUIREMENT**: For SELL/SHORT signals, ALL take profit targets MUST be LOWER than entry price. For BUY/LONG signals, ALL take profit targets MUST be HIGHER than entry price.\n\n## Output Format Guidelines\n- Use clear, professional language suitable for both novice and experienced traders\n- Include specific price levels with reasoning\n- Provide actionable steps, not just analysis\n- Show confidence levels for each scenario\n- Include relevant market context and timing considerations\n- Format information in scannable, easy-to-digest sections\n- Use emojis and visual elements to enhance readability\n- Every recommendation must have clear reasoning\n- Risk management must be prioritized over profit potential\n- Provide realistic expectations, not overly optimistic projections\n- Include alternative scenarios and contingency plans\n- Ensure all technical analysis is current and relevant to the timeframe being analyzed`;
        
        // For image analysis, we need to use a vision-capable model
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://lovable.dev',
            'X-Title': 'Trading Analysis Platform'
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
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
                  { type: "text", text: prompt || `Analyze this trading chart using the strategies mentioned. \n\n**REQUIRED OUTPUT FORMAT:**\n\n**MARKET BIAS:** [Bullish/Bearish/Neutral] with [confidence %]\n\n**ENTRY SIGNALS:**\n- Primary Entry: $[price] ([reason])\n- Alternative Entry: $[price] ([reason])\n\n**EXIT STRATEGY:**\n- Take Profit 1: $[price] ([target reasoning])\n- Take Profit 2: $[price] ([extended target])\n- Stop Loss: $[price] ([risk management reasoning])\n\nCRITICAL: For SELL/SHORT signals, take profit MUST be LOWER than entry price. For BUY/LONG signals, take profit MUST be HIGHER than entry price.\n\n**KEY LEVELS:**\n- Major Support: $[price]\n- Major Resistance: $[price]\n- Critical Break: $[price]\n\n**ICT ANALYSIS:**\n- Order Blocks: [locations and strength]\n- Fair Value Gaps: [identify and probability of fill]\n- Liquidity Zones: [BSL/SSL levels]\n- Market Structure: [BOS/CHOCH analysis]\n\n**RISK MANAGEMENT:**\n- Risk-to-Reward Ratio: [calculate based on entry/exit]\n- Position Size Recommendation: [%]\n- Timeframe: [recommended timeframe]\n\n**CONFLUENCE FACTORS:**\n- [List 3-5 supporting factors for the trade]\n\nProvide specific numeric price levels and actionable trading recommendations based on the selected trading style.` }
                ]
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
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
        // For text-based analysis (fundamentals and training)
        const textResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://lovable.dev',
            'X-Title': 'Trading Analysis Platform'
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
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
            temperature: 0.3,
            max_tokens: 2000
          }),
        });
    
        if (!textResponse.ok) {
          const errorData = await textResponse.text();
          console.error('OpenRouter API error:', errorData);
          throw new Error(`OpenRouter API error: ${textResponse.status}`);
        }
    
        const textResult = await textResponse.json();
        const textAnalysis = textResult.choices?.[0]?.message?.content || 'No analysis generated';
    
        return new Response(JSON.stringify({ 
          analysis: textAnalysis,
          success: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in smart-trade-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

