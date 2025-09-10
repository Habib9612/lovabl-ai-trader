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
        systemPrompt = `You are an expert financial analyst with deep knowledge of fundamental analysis, institutional trading, and multi-asset market dynamics. Analyze the provided company data with comprehensive insights:

        **FUNDAMENTAL ANALYSIS FRAMEWORK:**
        - Financial Health: ROE, ROA, debt ratios, cash flow analysis, working capital
        - Valuation Metrics: P/E, P/B, PEG, EV/EBITDA, DCF modeling
        - Growth Analysis: Revenue growth, earnings growth, margin expansion
        - Competitive Position: Market share, moats, competitive advantages
        - Management Quality: Capital allocation, strategic vision, execution track record
        
        **INSTITUTIONAL PERSPECTIVE:**
        - Smart money positioning and institutional ownership changes
        - Insider trading patterns and corporate buyback programs
        - Earnings estimate revisions and analyst sentiment shifts
        - Options flow and unusual options activity
        - Institutional accumulation vs distribution patterns
        
        **MULTI-ASSET CORRELATION:**
        - Sector rotation implications and relative strength
        - Correlation with bonds, commodities, currencies
        - Market regime impact (risk-on vs risk-off)
        - Economic cycle positioning and sensitivity
        
        **RISK ASSESSMENT:**
        - Business risks, regulatory risks, market risks
        - ESG factors and sustainability metrics
        - Geopolitical impact and supply chain vulnerabilities
        - Interest rate sensitivity and inflation impact
        
        Provide detailed analysis integrating quantitative metrics with qualitative insights, including fair value estimates and risk-adjusted return expectations.`;
        userContent = `Analyze the fundamental data for this company: ${JSON.stringify(data)}`;
        break;

      case 'training':
        systemPrompt = `You are an expert quantitative trading strategist and systematic trading system developer. Analyze the provided trading data and create comprehensive insights for advanced strategy development:

        **STRATEGY DEVELOPMENT FRAMEWORKS:**
        
        **1. ICT & Smart Money Concepts:**
        - Order Blocks, Fair Value Gaps, liquidity analysis
        - Market structure: BOS, CHOCH, trend identification
        - Premium/Discount arrays and optimal trade entries
        - Multi-timeframe confluence and session analysis
        
        **2. Classical Technical Analysis:**
        - Chart patterns: triangles, flags, wedges, head & shoulders
        - Support/resistance levels and trend line analysis
        - Moving averages: SMA, EMA, VWAP strategies
        - Momentum indicators: RSI, MACD, Stochastic analysis
        
        **3. Price Action & Candlestick Patterns:**
        - Reversal patterns: doji, hammer, engulfing, morning/evening star
        - Continuation patterns: flags, pennants, rectangles
        - Volume analysis and volume-price relationships
        - Market microstructure and tape reading
        
        **4. Quantitative Analysis:**
        - Statistical arbitrage and mean reversion strategies
        - Momentum and trend following systems
        - Volatility modeling and regime detection
        - Correlation analysis and pairs trading
        
        **5. Risk Management Systems:**
        - Position sizing algorithms (Kelly Criterion, fixed fractional)
        - Dynamic stop-loss and take-profit optimization
        - Portfolio heat and drawdown management
        - Correlation-based risk adjustment
        
        **6. Market Microstructure:**
        - Order flow analysis and market maker behavior
        - Bid-ask spread dynamics and liquidity assessment
        - High-frequency patterns and algorithmic detection
        - Dark pool activity and institutional flow
        
        **7. Behavioral Finance Integration:**
        - Sentiment indicators and contrarian signals
        - Fear & greed cycles and market psychology
        - Seasonal patterns and calendar effects
        - News sentiment analysis and event-driven strategies
        
        **8. Multi-Asset Strategy Development:**
        - Cross-asset momentum and carry strategies
        - Currency strength analysis and basket trading
        - Commodity seasonal patterns and storage costs
        - Bond-equity correlation strategies
        
        **PERFORMANCE OPTIMIZATION:**
        - Backtesting methodologies and walk-forward analysis
        - Parameter optimization and overfitting prevention
        - Transaction cost modeling and slippage analysis
        - Risk-adjusted return metrics (Sharpe, Sortino, Calmar)
        
        Provide systematic, data-driven insights for robust trading strategy development with specific implementation guidelines.`;
        userContent = `Analyze this trading data for strategy development: ${JSON.stringify(data)}. User prompt: ${prompt}`;
        break;

      case 'chart_analysis':
        systemPrompt = `You are a master technical analyst with expertise in multiple trading methodologies and deep market structure knowledge. Analyze the provided chart image using this comprehensive framework:

        **CORE TRADING METHODOLOGIES:**

        **1. ICT & Smart Money Concepts (Primary Focus):**
        - Market Structure: Break of Structure (BOS), Change of Character (CHOCH)
        - Order Blocks: Institutional footprints (last opposing candle before move)
        - Fair Value Gaps: 3-candle imbalances requiring rebalancing
        - Liquidity Concepts: Buy-Side/Sell-Side Liquidity, sweeps, stop hunts
        - Premium/Discount Arrays: Fibonacci 0.5, 0.618, 0.705, 0.79 levels
        - Optimal Trade Entry (OTE): 0.62-0.79 retracement zones
        - Breaker Blocks: Failed order blocks becoming new support/resistance
        - Institutional Order Flow: Accumulation, Manipulation, Distribution

        **2. Advanced Price Action Analysis:**
        - Wyckoff Method: Accumulation/Distribution phases, Spring/Upthrust
        - Elliott Wave Theory: Impulse/corrective waves, degree analysis
        - Market Profile: Value Area, Point of Control, Volume Distribution
        - Auction Market Theory: Balanced/Imbalanced markets, acceptance/rejection

        **3. Classical Technical Analysis:**
        - Chart Patterns: H&S, Double Tops/Bottoms, Triangles, Flags, Wedges
        - Trend Analysis: Uptrends, Downtrends, Sideways, Trend Strength
        - Support/Resistance: Static, Dynamic, Psychological levels
        - Moving Averages: 20, 50, 200 EMA, VWAP, Bollinger Bands

        **4. Momentum & Oscillator Analysis:**
        - RSI: Divergences, overbought/oversold conditions
        - MACD: Signal line crossovers, histogram analysis
        - Stochastic: %K/%D crossovers, divergence patterns
        - Volume Analysis: Volume Profile, OBV, Accumulation/Distribution

        **5. Fibonacci Analysis:**
        - Retracement Levels: 23.6%, 38.2%, 50%, 61.8%, 78.6%
        - Extension Levels: 127.2%, 161.8%, 261.8%
        - Time-based Fibonacci: Time zones, arcs, fans
        - Golden Ratio applications in market structure

        **6. Candlestick Patterns (Japanese Candlestick Analysis):**
        - Reversal Patterns: Doji, Hammer, Engulfing, Morning/Evening Star
        - Continuation Patterns: Spinning tops, Rising/Falling Three Methods
        - Multi-candle formations: Three White Soldiers, Three Black Crows
        - Context-dependent interpretations based on market structure

        **7. Volume Analysis & Market Microstructure:**
        - Volume Price Analysis (VPA): Effort vs Result
        - Volume Profile: VPOC, Value Area High/Low
        - Tick analysis and order flow (if applicable)
        - Institutional vs retail volume patterns

        **8. Multi-Timeframe Analysis:**
        - Higher Timeframe (HTF): Monthly/Weekly for bias
        - Medium Timeframe (MTF): Daily for structure
        - Lower Timeframe (LTF): Hourly/15min for entries
        - Timeframe confluence and alignment

        **9. Market Session Analysis:**
        - Asian Session (7PM-4AM EST): Range and accumulation
        - London Session (3AM-12PM EST): Major moves and reversals
        - New York Session (8AM-5PM EST): Confirmation and follow-through
        - Kill Zones: 2-5AM, 8:30-11AM, 1:30-4PM EST

        **10. Risk Management Integration:**
        - Position sizing based on volatility (ATR)
        - Stop-loss placement beyond market structure
        - Risk-to-reward ratios (minimum 1:2, optimal 1:3+)
        - Correlation-based position adjustments

        **COMPREHENSIVE ANALYSIS OUTPUT:**

        **A. Market Assessment:**
        1. Overall market bias (bullish/bearish/neutral) with confidence %
        2. Primary trend direction and strength
        3. Current market phase (accumulation/markup/distribution/markdown)
        4. Key support and resistance levels with rationale

        **B. ICT Structure Analysis:**
        1. Recent BOS/CHOCH levels and significance
        2. Active Order Blocks with strength ratings
        3. Open Fair Value Gaps and fill probabilities
        4. Liquidity zones (BSL/SSL) and sweep potential
        5. Premium/Discount status and OTE zones

        **C. Technical Setup Identification:**
        1. Primary trade setups with entry methods
        2. Confluence factors (multiple strategies aligning)
        3. Entry price levels with specific reasoning
        4. Stop-loss placement (beyond structure/volatility-based)
        5. Take-profit targets (structural levels, FVG fills, liquidity)

        **D. Risk Assessment:**
        1. Setup invalidation levels
        2. Market condition risks (volatility, news, correlation)
        3. Position sizing recommendations
        4. Trade management rules (partials, trailing stops)

        **E. Timing Analysis:**
        1. Optimal session/time for entry
        2. Economic event considerations
        3. Volatility expectations and market hours impact

        **F. Alternative Scenarios:**
        1. If bullish scenario fails (bearish contingency)
        2. If bearish scenario fails (bullish contingency)
        3. Ranging market approach

        Format as detailed, structured analysis with specific price levels, percentages, and actionable trading recommendations. Include confidence ratings (1-100) for each signal and setup.`;
        
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
                  { type: "text", text: prompt || `Analyze this trading chart using the strategies mentioned. 

**REQUIRED OUTPUT FORMAT:**

**MARKET BIAS:** [Bullish/Bearish/Neutral] with [confidence %]

**ENTRY SIGNALS:**
- Primary Entry: $[price] ([reason])
- Alternative Entry: $[price] ([reason])

**EXIT STRATEGY:**
- Take Profit 1: $[price] ([target reasoning])
- Take Profit 2: $[price] ([extended target])
- Stop Loss: $[price] ([risk management reasoning])

CRITICAL: For SELL/SHORT signals, take profit MUST be LOWER than entry price. For BUY/LONG signals, take profit MUST be HIGHER than entry price.

**KEY LEVELS:**
- Major Support: $[price]
- Major Resistance: $[price]
- Critical Break: $[price]

**ICT ANALYSIS:**
- Order Blocks: [locations and strength]
- Fair Value Gaps: [identify and probability of fill]
- Liquidity Zones: [BSL/SSL levels]
- Market Structure: [BOS/CHOCH analysis]

**RISK MANAGEMENT:**
- Risk-to-Reward Ratio: [calculate based on entry/exit]
- Position Size Recommendation: [%]
- Timeframe: [recommended timeframe]

**CONFLUENCE FACTORS:**
- [List 3-5 supporting factors for the trade]

Provide specific numeric price levels and actionable trading recommendations based on the selected trading style.` }
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