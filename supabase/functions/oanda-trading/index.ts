import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OandaRequest {
  action: string;
  instrument?: string;
  units?: number;
  type?: string;
  price?: number;
  timeInForce?: string;
  accountId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    const oandaToken = Deno.env.get('OANDA_DEMO_TOKEN');
    if (!oandaToken) {
      throw new Error('OANDA demo token not configured');
    }

    const { action, ...params } = await req.json() as OandaRequest;

    console.log(`Processing OANDA action: ${action} for user: ${user.id}`);

    let result;
    switch (action) {
      case 'getAccounts':
        result = await getAccounts(oandaToken);
        break;
      case 'getAccountDetails':
        result = await getAccountDetails(oandaToken, params.accountId!);
        break;
      case 'getInstruments':
        result = await getInstruments(oandaToken, params.accountId!);
        break;
      case 'getPricing':
        result = await getPricing(oandaToken, params.accountId!, params.instrument!);
        break;
      case 'placeOrder':
        result = await placeOrder(oandaToken, params.accountId!, params);
        break;
      case 'getPositions':
        result = await getPositions(oandaToken, params.accountId!);
        break;
      case 'getOrders':
        result = await getOrders(oandaToken, params.accountId!);
        break;
      case 'getTrades':
        result = await getTrades(oandaToken, params.accountId!);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log the successful action
    await supabaseClient
      .from('edge_logs')
      .insert({
        user_id: user.id,
        message: `OANDA ${action} completed successfully`,
        meta: { action, success: true }
      });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('OANDA API Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// OANDA API Functions
async function getAccounts(token: string) {
  const response = await fetch('https://api-fxpractice.oanda.com/v3/accounts', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getAccountDetails(token: string, accountId: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getInstruments(token: string, accountId: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/instruments`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getPricing(token: string, accountId: string, instrument: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/pricing?instruments=${instrument}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function placeOrder(token: string, accountId: string, params: any) {
  const orderData = {
    order: {
      type: params.type || 'MARKET',
      instrument: params.instrument,
      units: params.units.toString(),
      timeInForce: params.timeInForce || 'FOK',
      ...(params.price && { price: params.price.toString() })
    }
  };

  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getPositions(token: string, accountId: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/positions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getOrders(token: string, accountId: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}

async function getTrades(token: string, accountId: string) {
  const response = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/trades`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`OANDA API error: ${response.statusText}`);
  }
  
  return await response.json();
}