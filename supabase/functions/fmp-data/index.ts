import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  changesPercentage: number;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

interface FMPFinancialData {
  symbol: string;
  date: string;
  revenue: number;
  grossProfit: number;
  netIncome: number;
  eps: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  totalDebt: number;
  totalEquity: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  priceToEarningsRatio: number;
  priceToBookRatio: number;
  enterpriseValue: number;
  evToRevenue: number;
  evToEbitda: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, symbol, period = 'annual', limit = 10 } = await req.json();
    const apiKey = Deno.env.get('FMP_API_KEY');
    
    if (!apiKey) {
      throw new Error('FMP_API_KEY not configured');
    }

    let url: string;
    
    switch (endpoint) {
      case 'profile':
        url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;
        break;
      case 'income-statement':
        url = `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'balance-sheet':
        url = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'cash-flow':
        url = `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'ratios':
        url = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'key-metrics':
        url = `https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'growth':
        url = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'dcf':
        url = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}?apikey=${apiKey}`;
        break;
      case 'rating':
        url = `https://financialmodelingprep.com/api/v3/rating/${symbol}?apikey=${apiKey}`;
        break;
      case 'insider-trading':
        url = `https://financialmodelingprep.com/api/v4/insider-trading?symbol=${symbol}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'institutional-holders':
        url = `https://financialmodelingprep.com/api/v3/institutional-holder/${symbol}?apikey=${apiKey}`;
        break;
      case 'analyst-estimates':
        url = `https://financialmodelingprep.com/api/v3/analyst-estimates/${symbol}?period=${period}&limit=${limit}&apikey=${apiKey}`;
        break;
      case 'price-target':
        url = `https://financialmodelingprep.com/api/v4/price-target?symbol=${symbol}&apikey=${apiKey}`;
        break;
      case 'earnings-calendar':
        url = `https://financialmodelingprep.com/api/v3/earning_calendar?symbol=${symbol}&apikey=${apiKey}`;
        break;
      case 'news':
        url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=${limit}&apikey=${apiKey}`;
        break;
      default:
        throw new Error('Invalid endpoint specified');
    }

    console.log(`Fetching from FMP: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Successfully fetched ${endpoint} data for ${symbol}`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fmp-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});