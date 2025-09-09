import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PolygonDividendResponse {
  results: Array<{
    cash_amount: number;
    currency: string;
    declaration_date: string;
    dividend_type: string;
    ex_dividend_date: string;
    frequency: number;
    id: string;
    pay_date: string;
    record_date: string;
    ticker: string;
  }>;
  status: string;
  request_id: string;
}

interface PolygonStockResponse {
  results: Array<{
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    t: number; // timestamp
    v: number; // volume
    vw: number; // volume weighted average price
  }>;
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  status: string;
  request_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, ticker, multiplier = 1, timespan = 'day', from, to } = await req.json();
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    
    if (!apiKey) {
      throw new Error('POLYGON_API_KEY not configured');
    }

    let url: string;
    
    switch (endpoint) {
      case 'dividends':
        url = `https://api.polygon.io/v3/reference/dividends?ticker=${ticker}&apikey=${apiKey}`;
        break;
      case 'aggregates':
        url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apikey=${apiKey}`;
        break;
      case 'previous-close':
        url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apikey=${apiKey}`;
        break;
      case 'daily-open-close':
        url = `https://api.polygon.io/v1/open-close/${ticker}/${from}?adjusted=true&apikey=${apiKey}`;
        break;
      case 'ticker-details':
        url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apikey=${apiKey}`;
        break;
      case 'market-holidays':
        url = `https://api.polygon.io/v1/marketstatus/upcoming?apikey=${apiKey}`;
        break;
      default:
        throw new Error('Invalid endpoint specified');
    }

    console.log(`Fetching from Polygon.io: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Polygon.io API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Polygon.io API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Successfully fetched ${endpoint} data for ${ticker}`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in polygon-market-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});