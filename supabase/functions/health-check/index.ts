import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: 'ok' | 'error';
    finnhub: 'ok' | 'error';
    redis?: 'ok' | 'error';
  };
  timestamp: string;
  correlation_id: string;
  response_time_ms: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  
  console.log(`[${correlationId}] Health check started`);

  const checks = {
    database: 'error' as 'ok' | 'error',
    finnhub: 'error' as 'ok' | 'error',
  };

  // Test database connection
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log(`[${correlationId}] Missing Supabase credentials`);
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('assets').select('id').limit(1);
      
      if (!error) {
        checks.database = 'ok';
        console.log(`[${correlationId}] Database check passed`);
      } else {
        console.log(`[${correlationId}] Database check failed:`, error);
      }
    }
  } catch (error) {
    console.log(`[${correlationId}] Database check error:`, error);
  }

  // Test Finnhub API
  try {
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    
    if (!finnhubApiKey) {
      console.log(`[${correlationId}] Missing Finnhub API key`);
    } else {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubApiKey}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.c === 'number') {
          checks.finnhub = 'ok';
          console.log(`[${correlationId}] Finnhub check passed`);
        } else {
          console.log(`[${correlationId}] Finnhub returned invalid data:`, data);
        }
      } else {
        console.log(`[${correlationId}] Finnhub HTTP error:`, response.status);
      }
    }
  } catch (error) {
    console.log(`[${correlationId}] Finnhub check error:`, error);
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  const failureCount = Object.values(checks).filter(check => check === 'error').length;
  
  if (failureCount === 0) {
    status = 'healthy';
  } else if (failureCount === 1) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  const responseTimeMs = Date.now() - startTime;

  const healthStatus: HealthStatus = {
    status,
    checks,
    timestamp: new Date().toISOString(),
    correlation_id: correlationId,
    response_time_ms: responseTimeMs
  };

  console.log(`[${correlationId}] Health check completed: ${status} (${responseTimeMs}ms)`);

  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(healthStatus), {
    status: httpStatus,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'X-Correlation-Id': correlationId
    },
  });
});