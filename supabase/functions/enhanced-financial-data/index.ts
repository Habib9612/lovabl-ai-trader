import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
};

interface StructuredError {
  code: string;
  message: string;
  provider?: string;
  correlation_id: string;
  raw?: any;
}

interface FinancialDataResponse {
  success: boolean;
  data?: any;
  error?: StructuredError;
  correlation_id: string;
  provider_used?: string;
  cached?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  
  try {
    const { symbol } = await req.json();
    
    if (!symbol || typeof symbol !== 'string') {
      throw {
        code: 'INPUT.INVALID_SYMBOL',
        message: 'Symbol is required and must be a string',
        correlation_id: correlationId
      };
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    console.log(`[${correlationId}] Fetching financial data for ${normalizedSymbol}`);

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      throw {
        code: 'CONFIG.MISSING_API_KEY',
        message: 'Finnhub API key not configured',
        correlation_id: correlationId
      };
    }

    // Initialize Supabase client for caching and logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first (data is valid for 1 minute for real-time updates)
    const { data: cachedData } = await supabase
      .from('financial_data_cache')
      .select('*')
      .eq('symbol', normalizedSymbol)
      .gte('last_updated', new Date(Date.now() - 60 * 1000).toISOString())
      .single();

    if (cachedData) {
      console.log(`[${correlationId}] Returning cached data for ${normalizedSymbol}`);
      
      await supabase.from('api_logs').insert({
        correlation_id: correlationId,
        endpoint: '/enhanced-financial-data',
        method: 'POST',
        params: { symbol: normalizedSymbol },
        response_status: 200,
        provider_used: 'cache',
        execution_time_ms: Date.now() - startTime
      });

      return new Response(JSON.stringify({
        success: true,
        data: cachedData.data,
        correlation_id: correlationId,
        provider_used: 'cache',
        cached: true
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId
        },
      });
    }

    let providerUsed = 'finnhub';
    let financialData;

    try {
      // Fetch data from Finnhub API
      console.log(`[${correlationId}] Fetching from Finnhub API for ${normalizedSymbol}`);
      
      const [quoteResponse, profileResponse, metricsResponse] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${normalizedSymbol}&token=${finnhubApiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${normalizedSymbol}&token=${finnhubApiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${normalizedSymbol}&metric=all&token=${finnhubApiKey}`)
      ]);

      if (!quoteResponse.ok || !profileResponse.ok || !metricsResponse.ok) {
        throw new Error(`Finnhub API HTTP error: ${quoteResponse.status}, ${profileResponse.status}, ${metricsResponse.status}`);
      }

      const [quoteData, profileData, metricsData] = await Promise.all([
        quoteResponse.json(),
        profileResponse.json(),
        metricsResponse.json()
      ]);

      // Check if Finnhub returned valid data
      if (!quoteData.c && !profileData.name) {
        console.log(`[${correlationId}] Finnhub returned no data for ${normalizedSymbol}, attempting fallback`);
        
        // Fallback to yfinance-like API or mock data
        providerUsed = 'fallback';
        financialData = {
          symbol: normalizedSymbol,
          companyName: 'N/A',
          sector: 'N/A',
          industry: 'N/A',
          marketCap: 'N/A',
          pe: 'N/A',
          eps: 'N/A',
          price: 'N/A',
          change: 'N/A',
          changesPercentage: 'N/A',
          volume: 'N/A',
          avgVolume: 'N/A',
          previousClose: 'N/A',
          dayLow: 'N/A',
          dayHigh: 'N/A',
          yearHigh: 'N/A',
          yearLow: 'N/A',
          priceToBook: 'N/A',
          debtToEquity: 'N/A',
          returnOnEquity: 'N/A',
          returnOnAssets: 'N/A',
          description: 'No data available'
        };
      } else {
        const quote = quoteData || {};
        const profile = profileData || {};
        const metrics = metricsData?.metric || {};

        // Calculate derived values
        const change = quote.c && quote.pc ? quote.c - quote.pc : null;
        const changePercent = quote.c && quote.pc ? ((quote.c - quote.pc) / quote.pc) * 100 : null;

        // Structure the response
        financialData = {
          symbol: normalizedSymbol,
          companyName: profile.name || 'N/A',
          sector: profile.finnhubIndustry || 'N/A',
          industry: profile.finnhubIndustry || 'N/A',
          marketCap: profile.marketCapitalization ? `${(profile.marketCapitalization / 1000).toFixed(2)}B` : 'N/A',
          pe: metrics.peBasicExclExtraTTM ? metrics.peBasicExclExtraTTM.toFixed(2) : 'N/A',
          eps: metrics.epsBasicExclExtraItemsTTM ? metrics.epsBasicExclExtraItemsTTM.toFixed(2) : 'N/A',
          price: quote.c ? quote.c.toFixed(2) : 'N/A',
          change: change ? change.toFixed(2) : 'N/A',
          changesPercentage: changePercent ? `${changePercent.toFixed(2)}%` : 'N/A',
          volume: quote.v ? quote.v.toLocaleString() : 'N/A',
          avgVolume: metrics.avgVol10Day ? metrics.avgVol10Day.toLocaleString() : 'N/A',
          previousClose: quote.pc ? quote.pc.toFixed(2) : 'N/A',
          dayLow: quote.l ? quote.l.toFixed(2) : 'N/A',
          dayHigh: quote.h ? quote.h.toFixed(2) : 'N/A',
          yearHigh: metrics['52WeekHigh'] ? metrics['52WeekHigh'].toFixed(2) : 'N/A',
          yearLow: metrics['52WeekLow'] ? metrics['52WeekLow'].toFixed(2) : 'N/A',
          priceToBook: metrics.pbAnnual ? metrics.pbAnnual.toFixed(2) : 'N/A',
          debtToEquity: metrics.totalDebt2TotalEquityAnnual ? metrics.totalDebt2TotalEquityAnnual.toFixed(2) : 'N/A',
          returnOnEquity: metrics.roeTTM ? `${(metrics.roeTTM * 100).toFixed(2)}%` : 'N/A',
          returnOnAssets: metrics.roaTTM ? `${(metrics.roaTTM * 100).toFixed(2)}%` : 'N/A',
          description: profile.weburl || 'N/A'
        };
      }

    } catch (finnhubError) {
      console.error(`[${correlationId}] Finnhub error:`, finnhubError);
      
      // Fallback to alternative provider or mock data
      providerUsed = 'fallback';
      financialData = {
        symbol: normalizedSymbol,
        companyName: 'N/A',
        sector: 'N/A',
        industry: 'N/A',
        marketCap: 'N/A',
        pe: 'N/A',
        eps: 'N/A',
        price: 'N/A',
        change: 'N/A',
        changesPercentage: 'N/A',
        volume: 'N/A',
        avgVolume: 'N/A',
        previousClose: 'N/A',
        dayLow: 'N/A',
        dayHigh: 'N/A',
        yearHigh: 'N/A',
        yearLow: 'N/A',
        priceToBook: 'N/A',
        debtToEquity: 'N/A',
        returnOnEquity: 'N/A',
        returnOnAssets: 'N/A',
        description: 'Data temporarily unavailable'
      };
    }

    console.log(`[${correlationId}] Successfully fetched data for ${normalizedSymbol} from ${providerUsed}`);

    // Cache the data
    await supabase
      .from('financial_data_cache')
      .upsert({
        symbol: normalizedSymbol,
        data: financialData,
        last_updated: new Date().toISOString()
      });

    // Log the API call
    await supabase.from('api_logs').insert({
      correlation_id: correlationId,
      endpoint: '/enhanced-financial-data',
      method: 'POST',
      params: { symbol: normalizedSymbol },
      response_status: 200,
      provider_used: providerUsed,
      execution_time_ms: Date.now() - startTime
    });

    const response: FinancialDataResponse = {
      success: true,
      data: financialData,
      correlation_id: correlationId,
      provider_used: providerUsed
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId
      },
    });

  } catch (error) {
    console.error(`[${correlationId}] Error fetching financial data:`, error);
    
    const structuredError: StructuredError = {
      code: error.code || 'INTERNAL.UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      correlation_id: correlationId,
      provider: error.provider,
      raw: error.raw
    };

    // Log the error
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('api_logs').insert({
        correlation_id: correlationId,
        endpoint: '/enhanced-financial-data',
        method: 'POST',
        params: { symbol: (error as any).symbol || 'unknown' },
        response_status: 500,
        error_details: structuredError,
        execution_time_ms: Date.now() - startTime
      });
    }

    const errorResponse: FinancialDataResponse = {
      success: false,
      error: structuredError,
      correlation_id: correlationId
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId
      },
    });
  }
});