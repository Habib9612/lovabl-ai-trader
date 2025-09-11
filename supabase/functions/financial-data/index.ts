import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { symbol } = await req.json();
    const apiKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching financial data for ${symbol}`);

    // Check cache first (data is valid for 1 minute for real-time updates)
    const { data: cachedData } = await supabase
      .from('financial_data_cache')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .gte('last_updated', new Date(Date.now() - 60 * 1000).toISOString())
      .single();

    if (cachedData) {
      console.log(`Returning cached data for ${symbol}`);
      return new Response(JSON.stringify({
        success: true,
        data: cachedData.data,
        ticker: symbol.toUpperCase(),
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch data from Finnhub API
    const [quoteResponse, profileResponse, metricsResponse] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`)
    ]);

    if (!quoteResponse.ok || !profileResponse.ok || !metricsResponse.ok) {
      throw new Error('Failed to fetch data from Finnhub API');
    }

    const [quoteData, profileData, metricsData] = await Promise.all([
      quoteResponse.json(),
      profileResponse.json(),
      metricsResponse.json()
    ]);

    const quote = quoteData || {};
    const profile = profileData || {};
    const metrics = metricsData?.metric || {};

    if (!quote.c && !profile.name) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    // Calculate derived values
    const change = quote.c && quote.pc ? quote.c - quote.pc : null;
    const changePercent = quote.c && quote.pc ? ((quote.c - quote.pc) / quote.pc) * 100 : null;

    // Structure the response similar to what the frontend expects
    const fundamentals = {
      symbol: symbol.toUpperCase(),
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

    console.log(`Successfully fetched data for ${symbol}:`, fundamentals);

    // Cache the data
    await supabase
      .from('financial_data_cache')
      .upsert({
        symbol: symbol.toUpperCase(),
        data: fundamentals,
        last_updated: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      data: fundamentals,
      ticker: symbol.toUpperCase()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      ticker: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});