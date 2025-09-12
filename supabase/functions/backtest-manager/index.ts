import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
};

interface BacktestRequest {
  symbol: string;
  timeframe: string;
  strategy: string;
  params: Record<string, any>;
  start_date?: string;
  end_date?: string;
}

interface BacktestResponse {
  success: boolean;
  job_id?: string;
  error?: {
    code: string;
    message: string;
    correlation_id: string;
  };
  correlation_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw {
        code: 'AUTH.MISSING_TOKEN',
        message: 'Authorization token required',
        correlation_id: correlationId
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw {
        code: 'AUTH.INVALID_TOKEN',
        message: 'Invalid authorization token',
        correlation_id: correlationId
      };
    }

    console.log(`[${correlationId}] Backtest request from user ${user.id}`);

    if (req.method === 'POST') {
      // Create new backtest
      const backtestRequest: BacktestRequest = await req.json();
      
      // Validate input
      if (!backtestRequest.symbol || !backtestRequest.strategy) {
        throw {
          code: 'INPUT.INVALID_PARAMS',
          message: 'Symbol and strategy are required',
          correlation_id: correlationId
        };
      }

      const normalizedSymbol = backtestRequest.symbol.trim().toUpperCase();
      
      // Create backtest record
      const { data: backtest, error: insertError } = await supabase
        .from('backtests')
        .insert({
          user_id: user.id,
          symbol: normalizedSymbol,
          params: {
            timeframe: backtestRequest.timeframe || '1D',
            strategy: backtestRequest.strategy,
            start_date: backtestRequest.start_date,
            end_date: backtestRequest.end_date,
            ...backtestRequest.params
          },
          status: 'queued',
          correlation_id: correlationId
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`[${correlationId}] Database error:`, insertError);
        throw {
          code: 'DB.INSERT_FAILED',
          message: 'Failed to create backtest record',
          correlation_id: correlationId
        };
      }

      console.log(`[${correlationId}] Created backtest job ${backtest.id} for ${normalizedSymbol}`);

      // TODO: Enqueue background job for actual backtesting
      // For now, we'll simulate by updating status to 'running'
      await supabase
        .from('backtests')
        .update({ status: 'running' })
        .eq('id', backtest.id);

      // Log the API call
      await supabase.from('api_logs').insert({
        correlation_id: correlationId,
        user_id: user.id,
        endpoint: '/backtest-manager',
        method: 'POST',
        params: { symbol: normalizedSymbol, strategy: backtestRequest.strategy },
        response_status: 202,
        execution_time_ms: Date.now() - startTime
      });

      const response: BacktestResponse = {
        success: true,
        job_id: backtest.id,
        correlation_id: correlationId
      };

      return new Response(JSON.stringify(response), {
        status: 202,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId
        },
      });

    } else if (req.method === 'GET') {
      // Get backtest status or results
      const url = new URL(req.url);
      const jobId = url.pathname.split('/').pop();
      
      if (!jobId) {
        // List user's backtests
        const { data: backtests, error } = await supabase
          .from('backtests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          throw {
            code: 'DB.QUERY_FAILED',
            message: 'Failed to fetch backtests',
            correlation_id: correlationId
          };
        }

        return new Response(JSON.stringify({
          success: true,
          data: backtests,
          correlation_id: correlationId
        }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId
          },
        });
      } else {
        // Get specific backtest
        const { data: backtest, error } = await supabase
          .from('backtests')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single();

        if (error || !backtest) {
          throw {
            code: 'BACKTEST.NOT_FOUND',
            message: 'Backtest not found',
            correlation_id: correlationId
          };
        }

        return new Response(JSON.stringify({
          success: true,
          data: backtest,
          correlation_id: correlationId
        }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId
          },
        });
      }
    }

    throw {
      code: 'HTTP.METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
      correlation_id: correlationId
    };

  } catch (error) {
    console.error(`[${correlationId}] Error in backtest manager:`, error);
    
    // Log the error
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('api_logs').insert({
        correlation_id: correlationId,
        endpoint: '/backtest-manager',
        method: req.method,
        response_status: 500,
        error_details: {
          code: error.code || 'INTERNAL.UNKNOWN_ERROR',
          message: error.message || 'Unknown error occurred'
        },
        execution_time_ms: Date.now() - startTime
      });
    }

    const errorResponse: BacktestResponse = {
      success: false,
      error: {
        code: error.code || 'INTERNAL.UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
        correlation_id: correlationId
      },
      correlation_id: correlationId
    };

    return new Response(JSON.stringify(errorResponse), {
      status: error.code?.startsWith('AUTH.') ? 401 : 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId
      },
    });
  }
});