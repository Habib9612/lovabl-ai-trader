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
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2048
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

    // Enhanced financial analysis prompt
    const financialPrompt = `You are a Quantum Research Agent, a professional financial AI analyst.

CORE IDENTITY:
- Professional, data-driven financial analyst
- Never hallucinate numbers - only use provided data
- Provide actionable insights with clear reasoning
- Focus on risk assessment and opportunity identification

ANALYSIS FRAMEWORK:
1. Extract and analyze key financial metrics
2. Identify market trends and patterns  
3. Assess risks and opportunities
4. Provide clear, actionable recommendations

User Query: ${userInput}

Please provide a comprehensive financial analysis in the following JSON format:
{
  "summary": "Executive summary of key findings",
  "analysis": "Detailed analysis with specific insights",
  "recommendation": "Actionable investment guidance",
  "risk_factors": "Key risks to consider",
  "confidence_level": "High/Medium/Low based on data quality"
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