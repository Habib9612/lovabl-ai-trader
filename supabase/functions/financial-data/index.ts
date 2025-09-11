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
    const apiKey = Deno.env.get('FINANCIAL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('Financial data API key not configured');
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching financial data for ${symbol}`);

    // Check cache first (data is valid for 5 minutes)
    const { data: cachedData } = await supabase
      .from('financial_data_cache')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .gte('last_updated', new Date(Date.now() - 5 * 60 * 1000).toISOString())
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

    // Fetch company profile and key metrics from Financial Modeling Prep
    const [profileResponse, metricsResponse, quoteResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?limit=1&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`)
    ]);

    const [profile, metrics, quote] = await Promise.all([
      profileResponse.json(),
      metricsResponse.json(),
      quoteResponse.json()
    ]);

    const profileData = Array.isArray(profile) ? profile[0] : profile;
    const metricsData = Array.isArray(metrics) ? metrics[0] : metrics;
    const quoteData = Array.isArray(quote) ? quote[0] : quote;

    if (!profileData || !quoteData) {
      throw new Error(`No data found for symbol ${symbol}`);
    }

    // Structure the response similar to what the frontend expects
    const fundamentals = {
      symbol: symbol.toUpperCase(),
      companyName: profileData.companyName || 'N/A',
      sector: profileData.sector || 'N/A',
      industry: profileData.industry || 'N/A',
      marketCap: profileData.mktCap ? `${(profileData.mktCap / 1e9).toFixed(2)}B` : 'N/A',
      pe: quoteData.pe ? quoteData.pe.toFixed(2) : 'N/A',
      eps: quoteData.eps ? quoteData.eps.toFixed(2) : 'N/A',
      price: quoteData.price ? quoteData.price.toFixed(2) : 'N/A',
      change: quoteData.change ? quoteData.change.toFixed(2) : 'N/A',
      changesPercentage: quoteData.changesPercentage ? `${quoteData.changesPercentage.toFixed(2)}%` : 'N/A',
      volume: quoteData.volume ? quoteData.volume.toLocaleString() : 'N/A',
      avgVolume: quoteData.avgVolume ? quoteData.avgVolume.toLocaleString() : 'N/A',
      previousClose: quoteData.previousClose ? quoteData.previousClose.toFixed(2) : 'N/A',
      dayLow: quoteData.dayLow ? quoteData.dayLow.toFixed(2) : 'N/A',
      dayHigh: quoteData.dayHigh ? quoteData.dayHigh.toFixed(2) : 'N/A',
      yearHigh: quoteData.yearHigh ? quoteData.yearHigh.toFixed(2) : 'N/A',
      yearLow: quoteData.yearLow ? quoteData.yearLow.toFixed(2) : 'N/A',
      priceToBook: metricsData?.priceToBookRatio ? metricsData.priceToBookRatio.toFixed(2) : 'N/A',
      debtToEquity: metricsData?.debtToEquityRatio ? metricsData.debtToEquityRatio.toFixed(2) : 'N/A',
      returnOnEquity: metricsData?.returnOnEquity ? `${(metricsData.returnOnEquity * 100).toFixed(2)}%` : 'N/A',
      returnOnAssets: metricsData?.returnOnAssets ? `${(metricsData.returnOnAssets * 100).toFixed(2)}%` : 'N/A',
      description: profileData.description || 'N/A'
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