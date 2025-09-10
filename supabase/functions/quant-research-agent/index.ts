import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuantumMemoryEntry {
  query: string;
  response: string;
  vector: number[];
  timestamp: number;
}

interface QuantAnalysisRequest {
  query: string;
  memory?: QuantumMemoryEntry[];
}

class OpenRouterLLM {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.endpoint = "https://openrouter.ai/api/v1/chat/completions";
  }

  async query(prompt: string): Promise<string> {
    const headers = { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      "HTTP-Referer": "https://lovable.dev",
      "X-Title": "Trading Analysis Platform"
    };
    
    const payload = {
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 250
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content;
        } else {
          return "No response generated";
        }
      } else {
        return `LLM Error ${response.status}: ${await response.text()}`;
      }
    } catch (error) {
      return `Request failed: ${error.message}`;
    }
  }
}

class QuantumMemory {
  private vectorDim: number = 384;
  private memories: QuantumMemoryEntry[] = [];

  constructor(existingMemories: QuantumMemoryEntry[] = []) {
    this.memories = existingMemories;
  }

  private embed(text: string): number[] {
    // Hash-based embedding (simplified for edge function)
    const hash = this.hashString(text);
    const vector = new Array(this.vectorDim);
    
    // Generate deterministic vector from hash
    let seed = hash;
    for (let i = 0; i < this.vectorDim; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      vector[i] = (seed / 0x7fffffff) * 2 - 1; // Normalize to [-1, 1]
    }

    // Add text-based features
    const textLower = text.toLowerCase();
    vector[0] = Math.min(text.length / 1000.0, 1.0);
    vector[1] = Math.min(text.split(' ').length / 100.0, 1.0);
    
    return vector;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  store(query: string, response: string): boolean {
    if (!query.trim() || !response.trim()) return false;

    const vector = this.embed(query);
    const entry: QuantumMemoryEntry = {
      query,
      response,
      vector,
      timestamp: Date.now()
    };

    this.memories.push(entry);
    return true;
  }

  retrieve(query: string, threshold: number = 0.75): QuantumMemoryEntry | null {
    if (this.memories.length === 0) return null;

    const queryVector = this.embed(query);
    let bestMatch: QuantumMemoryEntry | null = null;
    let bestSimilarity = 0;

    for (const memory of this.memories) {
      const similarity = this.cosineSimilarity(queryVector, memory.vector);
      if (similarity > bestSimilarity && similarity > threshold) {
        bestSimilarity = similarity;
        bestMatch = memory;
      }
    }

    return bestMatch;
  }

  getMemories(): QuantumMemoryEntry[] {
    return this.memories;
  }

  getStats() {
    return {
      totalMemories: this.memories.length,
      vectorDimension: this.vectorDim
    };
  }
}

class QuantumAgent {
  private memory: QuantumMemory;
  private llm: OpenRouterLLM;
  private memoryThreshold: number;

  constructor(apiKey: string, existingMemories: QuantumMemoryEntry[] = [], memoryThreshold: number = 0.75) {
    this.memory = new QuantumMemory(existingMemories);
    this.llm = new OpenRouterLLM(apiKey);
    this.memoryThreshold = memoryThreshold;
  }

  async handleRequest(userInput: string): Promise<any> {
    if (!userInput.trim()) {
      return { error: "Please provide a valid input." };
    }

    // Check quantum memory first
    const memResult = this.memory.retrieve(userInput, this.memoryThreshold);
    if (memResult) {
      const similarity = this.memory.retrieve(userInput, 0)?.vector ? 
        this.calculateSimilarity(userInput, memResult.query) : 0;
      
      return {
        source: "quantum_memory",
        similarity: similarity.toFixed(2),
        originalQuery: memResult.query,
        response: memResult.response,
        timestamp: memResult.timestamp
      };
    }

    // Enhanced comprehensive trading analysis prompt
    const financialPrompt = `You are a Quantum Research Agent - an elite quantitative analyst with expertise in multiple trading methodologies, institutional strategies, and advanced market analytics.

CORE IDENTITY:
- Master of quantitative analysis, algorithmic trading, and systematic strategies
- Expert in ICT, classical technical analysis, fundamental analysis, and behavioral finance
- Focus on data-driven insights with institutional-grade analysis
- Provide actionable intelligence for professional trading decisions
- Never hallucinate numbers - only use provided data with statistical validation

COMPREHENSIVE ANALYSIS FRAMEWORK:

**1. INSTITUTIONAL TRADING ANALYSIS:**
   - Smart Money Concepts: Order Blocks, Fair Value Gaps, Liquidity analysis
   - Market Structure: BOS, CHOCH, trend identification and strength
   - Wyckoff Method: Accumulation, Distribution, Markup, Markdown phases
   - Dark Pool activity and institutional flow patterns
   - Options flow and gamma exposure analysis

**2. QUANTITATIVE TECHNICAL ANALYSIS:**
   - Statistical analysis: Mean reversion, momentum, volatility clustering
   - Chart patterns: Recognition, probability of success, target projections
   - Indicator confluence: RSI, MACD, Stochastic, Bollinger Bands
   - Volume analysis: Volume Profile, VWAP, Accumulation/Distribution
   - Fibonacci analysis: Retracements, extensions, time-based projections

**3. MULTI-ASSET CORRELATION ANALYSIS:**
   - Cross-asset momentum: Stocks, Bonds, Commodities, Currencies
   - Sector rotation analysis and relative strength rankings
   - Currency strength matrix and carry trade opportunities
   - Commodity seasonal patterns and supply/demand dynamics
   - Interest rate sensitivity and duration analysis

**4. FUNDAMENTAL INTEGRATION:**
   - Financial health metrics: ROE, ROIC, Debt-to-Equity, Cash Flow
   - Valuation analysis: P/E, P/B, EV/EBITDA, DCF modeling
   - Earnings quality assessment and estimate revisions
   - Economic indicators impact and cycle positioning
   - ESG factors and sustainability metrics

**5. BEHAVIORAL FINANCE & SENTIMENT:**
   - Market sentiment indicators: VIX, Put/Call ratio, Investor surveys
   - Contrarian signals and crowd psychology analysis
   - Fear & greed cycles and market extremes identification
   - News sentiment analysis and event-driven impacts
   - Seasonal patterns and calendar anomalies

**6. RISK MANAGEMENT SYSTEMS:**
   - Portfolio risk assessment: VAR, Expected Shortfall, Maximum Drawdown
   - Position sizing optimization: Kelly Criterion, Fixed Fractional
   - Correlation-based risk adjustment and hedging strategies
   - Dynamic stop-loss and take-profit optimization
   - Black swan event preparation and tail risk hedging

**7. ALGORITHMIC STRATEGY DEVELOPMENT:**
   - Trend following systems: Moving average crossovers, breakout strategies
   - Mean reversion strategies: Bollinger Band reversals, RSI divergences
   - Momentum strategies: Price momentum, earnings momentum, factor momentum
   - Arbitrage opportunities: Statistical arbitrage, pairs trading
   - High-frequency patterns and microstructure analysis

**8. MACROECONOMIC INTEGRATION:**
   - Central bank policy impact and interest rate cycles
   - Inflation expectations and real yield analysis
   - Economic cycle positioning and recession indicators
   - Geopolitical risk assessment and safe-haven flows
   - Currency policy and trade balance implications

**9. PERFORMANCE ANALYTICS:**
   - Risk-adjusted returns: Sharpe, Sortino, Calmar ratios
   - Drawdown analysis and recovery statistics
   - Win rate, average win/loss, profit factor calculations
   - Correlation with market benchmarks and style factors
   - Performance attribution and factor decomposition

**10. MARKET REGIME DETECTION:**
   - Bull/Bear/Sideways market identification
   - Volatility regime changes and clustering
   - Correlation regime shifts and breakdown analysis
   - Interest rate environment classification
   - Crisis vs normal market conditions

User Query: ${userInput}

Provide comprehensive quantitative analysis in the following structured JSON format:
{
  "executive_summary": {
    "key_findings": "Top 3 most important insights",
    "market_bias": "Bullish/Bearish/Neutral with confidence %",
    "risk_level": "Low/Medium/High with specific factors",
    "time_horizon": "Optimal holding period based on analysis"
  },
  "technical_analysis": {
    "trend_analysis": "Multi-timeframe trend assessment",
    "support_resistance": "Key levels with probability of holding",
    "momentum_indicators": "RSI, MACD, Stochastic readings and signals",
    "pattern_recognition": "Chart patterns and completion probabilities",
    "volume_analysis": "Volume confirmation and institutional flow"
  },
  "institutional_insights": {
    "smart_money_flow": "Order blocks, FVGs, liquidity analysis",
    "market_structure": "BOS/CHOCH levels and significance",
    "wyckoff_analysis": "Current phase and expected next move",
    "options_flow": "Gamma exposure and dealer positioning",
    "dark_pool_activity": "Institutional accumulation/distribution"
  },
  "quantitative_metrics": {
    "statistical_measures": "Volatility, correlation, beta analysis",
    "probability_analysis": "Success probability of identified setups",
    "risk_metrics": "VAR, maximum drawdown, Sharpe ratio",
    "performance_attribution": "Factor exposure and style analysis"
  },
  "fundamental_overlay": {
    "valuation_assessment": "Fair value estimate with methodology",
    "financial_health": "Key ratios and quality metrics",
    "growth_prospects": "Revenue/earnings growth outlook",
    "competitive_position": "Market share and competitive advantages"
  },
  "risk_assessment": {
    "primary_risks": "Top risk factors with impact probability",
    "scenario_analysis": "Bull/bear/base case outcomes",
    "correlation_risks": "Exposure to systematic risk factors",
    "tail_risks": "Black swan events and hedging recommendations"
  },
  "trading_strategy": {
    "setup_type": "Primary strategy with entry methodology",
    "entry_criteria": "Specific conditions for trade initiation",
    "position_sizing": "Optimal size based on risk parameters",
    "exit_strategy": "Stop loss, take profit, and management rules",
    "risk_reward": "Expected R:R ratio with probability weighting"
  },
  "market_outlook": {
    "short_term": "1-7 day outlook with key levels",
    "medium_term": "1-4 week outlook with major catalysts",
    "long_term": "3-12 month outlook with secular trends",
    "key_catalysts": "Events that could change the outlook"
  },
  "actionable_recommendations": {
    "primary_recommendation": "Main trading/investment action",
    "alternative_strategies": "Secondary approaches if primary fails",
    "portfolio_allocation": "Suggested weight within portfolio",
    "monitoring_criteria": "Signals to watch for strategy adjustment"
  },
  "confidence_metrics": {
    "overall_confidence": "1-100 based on data quality and confluence",
    "technical_confidence": "Confidence in technical analysis",
    "fundamental_confidence": "Confidence in fundamental analysis",
    "risk_confidence": "Confidence in risk assessment accuracy"
  }
}`;

    // Query OpenRouter LLM
    console.log("Querying OpenRouter LLM for financial analysis...");
    const llmResponse = await this.llm.query(financialPrompt);

    // Store in memory if valid response
    if (!llmResponse.startsWith("LLM Error") && !llmResponse.startsWith("Request failed")) {
      const stored = this.memory.store(userInput, llmResponse);
      
      // Try to parse JSON response
      try {
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        
        return {
          source: "quantum_llm",
          stored: stored,
          response: jsonResponse || llmResponse,
          raw_response: llmResponse
        };
      } catch (parseError) {
        return {
          source: "quantum_llm",
          stored: stored,
          response: llmResponse,
          parse_error: "Could not parse JSON response"
        };
      }
    } else {
      return {
        source: "quantum_llm",
        error: llmResponse
      };
    }
  }

  private calculateSimilarity(query1: string, query2: string): number {
    const vec1 = this.memory['embed'](query1);
    const vec2 = this.memory['embed'](query2);
    return this.memory['cosineSimilarity'](vec1, vec2);
  }

  getStats() {
    return {
      ...this.memory.getStats(),
      memoryThreshold: this.memoryThreshold
    };
  }

  getMemories(): QuantumMemoryEntry[] {
    return this.memory.getMemories();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, memory = [] }: QuantAnalysisRequest = await req.json();
    const openRouterApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log('Processing quantum research query:', query);

    // Initialize quantum agent with existing memory
    const agent = new QuantumAgent(openRouterApiKey, memory, 0.75);

    // Handle the request
    const result = await agent.handleRequest(query);

    // Return response with updated memory
    return new Response(JSON.stringify({
      ...result,
      memory: agent.getMemories(),
      stats: agent.getStats()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in quantum-research-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: "system_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});