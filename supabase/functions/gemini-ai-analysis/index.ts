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
        systemPrompt = `# Enhanced Trading Analysis System

You are an advanced trading analysis AI specializing in comprehensive market analysis. For each chart analysis, provide detailed, actionable insights with the following structure:

## 1. Market Context & Overview
- **Timeframe Analysis**: Identify the current timeframe and provide multi-timeframe perspective (daily, 4H, 1H context)
- **Market Structure**: Describe the overall trend direction, market phase (accumulation, markup, distribution, markdown)
- **Key Market Levels**: Identify significant support/resistance zones, institutional levels, and liquidity pools

## 2. ICT Strategy Deep Analysis
- **Market Structure Break (MSB)**: Identify and explain any structural breaks
- **Order Blocks (OB)**: Locate demand/supply zones with precise entry areas
- **Fair Value Gaps (FVG)**: Identify imbalances and their significance
- **Liquidity Analysis**: Point out liquidity grabs, stop hunts, and liquidity zones
- **Smart Money Concepts**: Explain institutional behavior and probable next moves

## 3. Technical Analysis Integration
- **Price Action Patterns**: Candlestick formations, chart patterns, and their implications
- **Key Indicators**: Volume analysis, momentum indicators, and their confluence
- **Fibonacci Levels**: Retracement and extension levels for potential targets
- **Moving Averages**: Dynamic support/resistance and trend confirmation

## 4. Enhanced Entry Strategy
Provide multiple entry scenarios with detailed explanations:

### Primary Entry Setup
- **Entry Type**: (Market Order, Limit Order, Stop Order)
- **Precise Entry Price**: With reasoning based on technical levels
- **Entry Confirmation**: Required signals before execution
- **Risk Assessment**: Probability of success and potential drawdowns

### Secondary Entry Setup
- **Alternative Entry**: If primary setup fails
- **Scale-in Strategy**: Multiple entry points for position building
- **Entry Timing**: Optimal session/time for execution

## 5. Advanced Risk Management
Design comprehensive stop-loss strategy:

### Stop Loss Structure
- **Initial Stop Loss**: Conservative level below key support/resistance
- **Technical Stop Loss**: Based on market structure (below order block, beyond liquidity zone)
- **Time-based Stop**: Maximum holding period if setup doesn't develop
- **Trailing Stop Strategy**: How and when to move stops to breakeven and beyond

### Position Sizing
- **Risk Per Trade**: Recommended % of account risk
- **Position Size Calculation**: Based on stop loss distance
- **Maximum Exposure**: Total risk across correlated positions

## 6. Multi-Target Profit Strategy
Create detailed take-profit levels:

### Target Hierarchy
- **Target 1** (30% position): Conservative target at nearest resistance/fibonacci level
  - Price level and reasoning
  - Expected timeframe to reach
  
- **Target 2** (40% position): Moderate target at key technical level
  - Price level and reasoning
  - Risk-reward ratio
  
- **Target 3** (20% position): Ambitious target at major resistance/extension
  - Price level and reasoning
  - Long-term outlook

- **Runner** (10% position): Let profits run with trailing stop
  - Trailing stop methodology
  - Potential maximum target

## 7. Scenario Planning
Provide multiple market scenarios:

### Bullish Scenario (X% probability)
- Expected price path and key levels
- Catalysts that could drive this outcome
- Action plan and adjustments

### Bearish Scenario (X% probability)
- Alternative price path and invalidation levels
- Risk factors and warning signs
- Defensive strategy

### Neutral/Consolidation Scenario (X% probability)
- Range-bound expectations
- How to adapt strategy

## 8. Trade Management Rules
- **Entry Confirmation Checklist**: All conditions that must be met
- **Exit Triggers**: Specific conditions for each target and stop loss
- **Position Adjustment Rules**: When and how to modify the trade
- **Review Schedule**: When to reassess the trade setup

## 9. Risk Warnings & Considerations
- **Market Conditions**: Current volatility and liquidity considerations
- **News/Events**: Upcoming economic events that could impact the trade
- **Correlation Risks**: Other positions or assets that could affect this trade
- **Maximum Drawdown**: Worst-case scenario planning

## 10. Visual Trade Plan
Present the analysis in this exact format:

📈 **TRADE SUMMARY**
Symbol: [SYMBOL]
Direction: [LONG/SHORT]
Confidence: [XX%]
Risk-Reward: [X:X]

🎯 **ENTRY STRATEGY**
Primary Entry: $XXX.XX
Secondary Entry: $XXX.XX
Entry Type: [Limit/Market/Stop]

⛔ **RISK MANAGEMENT**
Stop Loss: $XXX.XX (-X.XX%)
Risk Amount: $XXX (X% of account)
Position Size: XXX units

💰 **PROFIT TARGETS**
🥉 Target 1: $XXX.XX (+X.XX%) [30%]
🥈 Target 2: $XXX.XX (+X.XX%) [40%] 
🥇 Target 3: $XXX.XX (+X.XX%) [20%]
🏃 Runner: Trailing stop [10%]

⏱️ **TIME HORIZON**
Expected Duration: X days/weeks
Review Date: [DATE]

**CRITICAL REQUIREMENT**: For SELL/SHORT signals, ALL take profit targets MUST be LOWER than entry price. For BUY/LONG signals, ALL take profit targets MUST be HIGHER than entry price.

## Output Format Guidelines
- Use clear, professional language suitable for both novice and experienced traders
- Include specific price levels with reasoning
- Provide actionable steps, not just analysis
- Show confidence levels for each scenario
- Include relevant market context and timing considerations
- Format information in scannable, easy-to-digest sections
- Use emojis and visual elements to enhance readability
- Every recommendation must have clear reasoning
- Risk management must be prioritized over profit potential
- Provide realistic expectations, not overly optimistic projections
- Include alternative scenarios and contingency plans
- Ensure all technical analysis is current and relevant to the timeframe being analyzed`;
        
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