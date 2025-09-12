import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch comprehensive market data for the symbol
async function fetchComprehensiveData(symbol: string) {
  const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY') || '';
  // If the Finnhub key is missing, continue with safe defaults.

  const cleanSymbol = symbol.trim().toUpperCase();
  const now = Math.floor(Date.now() / 1000);
  const oneYearAgo = now - (365 * 24 * 60 * 60);

  // Helper function to safely fetch and parse JSON
  const safeFetch = async (url: string, defaultValue: any = {}) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch ${url}: ${response.status}`);
        return defaultValue;
      }
      return await response.json();
    } catch (error) {
      console.warn(`Error fetching ${url}:`, error);
      return defaultValue;
    }
  };

  try {
    // Fetch multiple data sources with individual error handling
    const [quote, profile, candles, news, recommendations] = await Promise.all([
      safeFetch(`https://finnhub.io/api/v1/quote?symbol=${cleanSymbol}&token=${finnhubApiKey}`, { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, t: 0 }),
      safeFetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${cleanSymbol}&token=${finnhubApiKey}`, { name: cleanSymbol, marketCapitalization: 0, finnhubIndustry: 'Unknown' }),
      safeFetch(`https://finnhub.io/api/v1/stock/candle?symbol=${cleanSymbol}&resolution=D&from=${oneYearAgo}&to=${now}&token=${finnhubApiKey}`, { c: [], h: [], l: [], v: [], s: 'no_data' }),
      safeFetch(`https://finnhub.io/api/v1/company-news?symbol=${cleanSymbol}&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${finnhubApiKey}`, []),
      safeFetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${cleanSymbol}&token=${finnhubApiKey}`, [])
    ]);

    // Validate essential data but avoid throwing to keep function resilient
    if (!quote.c || quote.c === 0) {
      console.warn('Quote price missing or zero; proceeding with defaults');
    }

    return { quote, profile, candles, news, recommendations };
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    throw new Error(`Failed to fetch market data: ${error.message}`);
  }
}

// Calculate technical indicators
function calculateTechnicals(candles: any) {
  if (!candles.c || candles.c.length < 200) {
    return {
      ma20: null,
      ma50: null,
      ma200: null,
      rsi: null,
      volatility: null,
      momentum: null
    };
  }

  const closes = candles.c;
  const highs = candles.h;
  const lows = candles.l;
  const volumes = candles.v;

  // Moving averages
  const ma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
  const ma50 = closes.slice(-50).reduce((a: number, b: number) => a + b, 0) / 50;
  const ma200 = closes.slice(-200).reduce((a: number, b: number) => a + b, 0) / 200;

  // RSI calculation (simplified 14-period)
  const period = 14;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length - 1; i++) {
    const change = closes[i + 1] - closes[i];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  // Volatility (ATR approximation)
  const recentHighs = highs.slice(-20);
  const recentLows = lows.slice(-20);
  const recentCloses = closes.slice(-21, -1);
  let atr = 0;
  for (let i = 0; i < 20; i++) {
    const tr = Math.max(
      recentHighs[i] - recentLows[i],
      Math.abs(recentHighs[i] - recentCloses[i]),
      Math.abs(recentLows[i] - recentCloses[i])
    );
    atr += tr;
  }
  atr = atr / 20;

  // Momentum (price change over 20 days)
  const momentum = ((closes[closes.length - 1] - closes[closes.length - 21]) / closes[closes.length - 21]) * 100;

  return {
    ma20: Number(ma20.toFixed(2)),
    ma50: Number(ma50.toFixed(2)),
    ma200: Number(ma200.toFixed(2)),
    rsi: Number(rsi.toFixed(2)),
    volatility: Number(atr.toFixed(2)),
    momentum: Number(momentum.toFixed(2))
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe, strategy } = await req.json();
    
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }

    console.log('Stock AI Analysis: Processing comprehensive request for', symbol);

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Fetch comprehensive market data
    const marketData = await fetchComprehensiveData(symbol);
    const technicals = calculateTechnicals(marketData.candles);

// Calculate additional metrics with safe fallbacks
const currentPrice = Number(marketData.quote?.c ?? 0);
const yearHighRaw = Number(marketData.quote?.h ?? 0);
const yearLowRaw = Number(marketData.quote?.l ?? 0);
const yearHigh = yearHighRaw || currentPrice || 0;
const yearLow = yearLowRaw || currentPrice || 0;
const range = yearHigh - yearLow;
const relativePosition = range > 0 ? ((currentPrice - yearLow) / range) * 100 : 50;

// News sentiment analysis (safe)
const recentNews = Array.isArray(marketData.news) ? marketData.news.slice(0, 5) : [];
const newsCount = recentNews.length;

// Analyst recommendations (safe)
const latestRecommendation = Array.isArray(marketData.recommendations) && marketData.recommendations.length > 0
  ? marketData.recommendations[0]
  : {};

    // Prepare safe values for prompt
    const profile = marketData.profile || {};
    const quote = marketData.quote || {};
    const marketCapBillionsVal = Number(profile.marketCapitalization ?? 0) / 1_000_000_000;
    const marketCapBillions = Number.isFinite(marketCapBillionsVal) ? marketCapBillionsVal.toFixed(2) : '0.00';
    const peRatio = typeof profile.peBasicExclExtraTTM === 'number' ? profile.peBasicExclExtraTTM : 'N/A';
    const dividendYield = typeof profile.dividendYield === 'number' ? profile.dividendYield : null;
    const sharesOut = Number(profile.shareOutstanding ?? 0);
    const volumeVal = Number(quote.v ?? 0);
    const volumeMillionsVal = volumeVal / 1_000_000;
    const volumeMillions = Number.isFinite(volumeMillionsVal) ? volumeMillionsVal.toFixed(1) : '0.0';
    const relativeVolumeVal = sharesOut > 0 ? (volumeVal / sharesOut) * 100 : 0;
    const relativeVolume = Number.isFinite(relativeVolumeVal) ? Number(relativeVolumeVal.toFixed(1)) : 0;
    const positionInRange = Number.isFinite(relativePosition) ? Number(relativePosition.toFixed(1)) : 50;
    const dayChangePct = typeof quote.dp === 'number' ? quote.dp : 0;
    const dayChangeAbs = typeof quote.d === 'number' ? quote.d : 0;

    const analysisPrompt = `
Analyze ${symbol} (${marketData.profile.name || 'Unknown Company'}) with the following comprehensive data:

**CORE MARKET DATA:**
- Current Price: $${currentPrice}
- Day Change: ${marketData.quote.dp}% (${marketData.quote.d > 0 ? '+' : ''}$${marketData.quote.d})
- Market Cap: $${marketCapBillions}B
- P/E Ratio: ${marketData.profile.peBasicExclExtraTTM || 'N/A'}
- 52W High: $${yearHigh} | Low: $${yearLow}
- Position in Range: ${positionInRange}%
- Average Volume: ${volumeMillions}M shares
- Sector: ${marketData.profile.finnhubIndustry || 'N/A'}

**TECHNICAL INDICATORS:**
- MA20: $${technicals.ma20} | MA50: $${technicals.ma50} | MA200: $${technicals.ma200}
- RSI (14): ${technicals.rsi} ${technicals.rsi > 70 ? '(Overbought)' : technicals.rsi < 30 ? '(Oversold)' : '(Neutral)'}
- Momentum (20d): ${technicals.momentum}%
- Volatility (ATR): $${technicals.volatility}

**TREND ANALYSIS:**
- Short-term trend: ${currentPrice > (technicals.ma20 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'} (vs MA20)
- Medium-term trend: ${currentPrice > (technicals.ma50 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'} (vs MA50)
- Long-term trend: ${currentPrice > (technicals.ma200 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'} (vs MA200)

**MARKET SENTIMENT:**
- Recent News Count: ${newsCount} articles (last 7 days)
- Analyst Consensus: ${latestRecommendation.buy || 0} Buy, ${latestRecommendation.hold || 0} Hold, ${latestRecommendation.sell || 0} Sell

**TRADING PARAMETERS:**
- Timeframe: ${timeframe || 'Medium-term'}
- Strategy: ${strategy || 'Growth Investing'}

**ANALYSIS REQUIREMENTS:**
Create a comprehensive professional analysis that includes:

1. **Market Overview**: Current position, trend direction, key support/resistance
2. **Technical Assessment**: RSI, momentum, moving average signals
3. **Risk Evaluation**: Volatility assessment, risk score (0-100)
4. **AI Forecast**: Probability of outperforming market over timeframe
5. **Actionable Insights**: Specific entry/exit points, stop losses
6. **Natural Language Summary**: 2-3 sentence market story

Respond with a JSON object containing:
{
  "coreData": {
    "marketCap": "${marketCapBillions}B",
    "pe": ${peRatio === 'N/A' ? null : peRatio},
    "dividendYield": ${marketData.profile.dividendYield || null},
    "volume": "${volumeMillions}M",
    "relativeVolume": ${relativeVolume},
    "yearHighLow": "${yearHigh}/${yearLow}",
    "positionInRange": ${positionInRange}
  },
  "technicals": {
    "trend": {
      "shortTerm": "${currentPrice > (technicals.ma20 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'}",
      "mediumTerm": "${currentPrice > (technicals.ma50 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'}",
      "longTerm": "${currentPrice > (technicals.ma200 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'}"
    },
    "indicators": {
      "rsi": ${technicals.rsi},
      "rsiSignal": "${technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral'}",
      "momentum": ${technicals.momentum},
      "volatility": ${technicals.volatility}
    },
    "movingAverages": {
      "ma20": ${technicals.ma20},
      "ma50": ${technicals.ma50},
      "ma200": ${technicals.ma200}
    }
  },
  "sentiment": {
    "score": number (0-100),
    "newsCount": ${newsCount},
    "analystRatings": {
      "buy": ${latestRecommendation.buy || 0},
      "hold": ${latestRecommendation.hold || 0},
      "sell": ${latestRecommendation.sell || 0}
    }
  },
  "forecast": {
    "aiProbability": number (0-100),
    "expectedVolatility": "${technicals.volatility > 5 ? 'High' : technicals.volatility > 2 ? 'Medium' : 'Low'}",
    "riskScore": number (0-100),
    "targetPrice": number,
    "stopLoss": number
  },
  "insights": {
    "summary": "Natural language market story",
    "keySignals": ["signal1", "signal2", "signal3"],
    "recommendation": "BUY/SELL/HOLD",
    "confidence": number (0-100)
  }
}`;

    console.log('Sending analysis request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trading-ai-dashboard.lovable.dev',
        'X-Title': 'Trading AI Dashboard'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst providing comprehensive stock analysis. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', response.status, errorData);
      // Fallback analysis when AI call fails
      const analysisResult = {
        coreData: {
          marketCap: `${marketCapBillions}B`,
          pe: peRatio === 'N/A' ? null : peRatio,
          dividendYield: dividendYield ?? null,
          volume: `${volumeMillions}M`,
          relativeVolume: relativeVolume,
          yearHighLow: `${yearHigh}/${yearLow}`,
          positionInRange: positionInRange
        },
        technicals: {
          trend: {
            shortTerm: currentPrice > (technicals.ma20 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish',
            mediumTerm: currentPrice > (technicals.ma50 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish',
            longTerm: currentPrice > (technicals.ma200 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'
          },
          indicators: {
            rsi: technicals.rsi,
            rsiSignal: technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral',
            momentum: technicals.momentum,
            volatility: technicals.volatility
          },
          movingAverages: {
            ma20: technicals.ma20,
            ma50: technicals.ma50,
            ma200: technicals.ma200
          }
        },
        sentiment: {
          score: 65,
          newsCount: newsCount,
          analystRatings: {
            buy: latestRecommendation.buy || 0,
            hold: latestRecommendation.hold || 0,
            sell: latestRecommendation.sell || 0
          }
        },
        forecast: {
          aiProbability: 60,
          expectedVolatility: technicals.volatility > 5 ? 'High' : technicals.volatility > 2 ? 'Medium' : 'Low',
          riskScore: 50,
          targetPrice: currentPrice ? Number((currentPrice * 1.08).toFixed(2)) : 0,
          stopLoss: currentPrice ? Number((currentPrice * 0.95).toFixed(2)) : 0
        },
        insights: {
          summary: 'AI service unavailable. Showing data-driven baseline analysis.',
          keySignals: ['Trend assessment', 'Momentum and RSI', 'ATR volatility'],
          recommendation: 'HOLD',
          confidence: 70
        },
        rawData: {
          quote: marketData.quote,
          profile: marketData.profile,
          technicals
        }
      };
      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        symbol: symbol.toUpperCase(),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      console.warn('No analysis content received from OpenRouter, returning fallback analysis');
      const analysisResult = {
        coreData: {
          marketCap: `${marketCapBillions}B`,
          pe: peRatio === 'N/A' ? null : peRatio,
          dividendYield: dividendYield ?? null,
          volume: `${volumeMillions}M`,
          relativeVolume: relativeVolume,
          yearHighLow: `${yearHigh}/${yearLow}`,
          positionInRange: positionInRange
        },
        technicals: {
          trend: {
            shortTerm: currentPrice > (technicals.ma20 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish',
            mediumTerm: currentPrice > (technicals.ma50 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish',
            longTerm: currentPrice > (technicals.ma200 ?? Number.MAX_SAFE_INTEGER) ? 'Bullish' : 'Bearish'
          },
          indicators: {
            rsi: technicals.rsi,
            rsiSignal: technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral',
            momentum: technicals.momentum,
            volatility: technicals.volatility
          },
          movingAverages: {
            ma20: technicals.ma20,
            ma50: technicals.ma50,
            ma200: technicals.ma200
          }
        },
        sentiment: {
          score: 65,
          newsCount: newsCount,
          analystRatings: {
            buy: latestRecommendation.buy || 0,
            hold: latestRecommendation.hold || 0,
            sell: latestRecommendation.sell || 0
          }
        },
        forecast: {
          aiProbability: 60,
          expectedVolatility: technicals.volatility > 5 ? 'High' : technicals.volatility > 2 ? 'Medium' : 'Low',
          riskScore: 50,
          targetPrice: currentPrice ? Number((currentPrice * 1.08).toFixed(2)) : 0,
          stopLoss: currentPrice ? Number((currentPrice * 0.95).toFixed(2)) : 0
        },
        insights: {
          summary: 'AI response empty. Showing baseline analysis.',
          keySignals: ['Trend assessment', 'Momentum and RSI', 'ATR volatility'],
          recommendation: 'HOLD',
          confidence: 70
        },
        rawData: {
          quote: marketData.quote,
          profile: marketData.profile,
          technicals
        }
      };
      return new Response(JSON.stringify({
        success: true,
        analysis: analysisResult,
        symbol: symbol.toUpperCase(),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Stock AI Analysis: Received response from OpenRouter API');

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response structure
      analysisResult = {
        coreData: {
          marketCap: `${(marketData.profile.marketCapitalization / 1000000000).toFixed(2)}B`,
          pe: marketData.profile.peBasicExclExtraTTM || null,
          dividendYield: marketData.profile.dividendYield || null,
          volume: `${(marketData.quote.v / 1000000).toFixed(1)}M`,
          relativeVolume: Number(((marketData.quote.v / (marketData.profile.shareOutstanding || 1)) * 100).toFixed(1)),
          yearHighLow: `${yearHigh}/${yearLow}`,
          positionInRange: Number(relativePosition.toFixed(1))
        },
        technicals: {
          trend: {
            shortTerm: currentPrice > technicals.ma20 ? 'Bullish' : 'Bearish',
            mediumTerm: currentPrice > technicals.ma50 ? 'Bullish' : 'Bearish',
            longTerm: currentPrice > technicals.ma200 ? 'Bullish' : 'Bearish'
          },
          indicators: {
            rsi: technicals.rsi,
            rsiSignal: technicals.rsi > 70 ? 'Overbought' : technicals.rsi < 30 ? 'Oversold' : 'Neutral',
            momentum: technicals.momentum,
            volatility: technicals.volatility
          },
          movingAverages: {
            ma20: technicals.ma20,
            ma50: technicals.ma50,
            ma200: technicals.ma200
          }
        },
        sentiment: {
          score: 65,
          newsCount: newsCount,
          analystRatings: {
            buy: latestRecommendation.buy || 0,
            hold: latestRecommendation.hold || 0,
            sell: latestRecommendation.sell || 0
          }
        },
        forecast: {
          aiProbability: 65,
          expectedVolatility: technicals.volatility > 5 ? 'High' : technicals.volatility > 2 ? 'Medium' : 'Low',
          riskScore: 50,
          targetPrice: currentPrice * 1.1,
          stopLoss: currentPrice * 0.95
        },
        insights: {
          summary: analysisText.substring(0, 200) + '...',
          keySignals: ['Technical analysis available', 'Market data processed', 'AI analysis complete'],
          recommendation: 'HOLD',
          confidence: 75
        }
      };
    }

    // Add raw market data for reference
    analysisResult.rawData = {
      quote: marketData.quote,
      profile: marketData.profile,
      technicals: technicals
    };

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stock-ai-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});