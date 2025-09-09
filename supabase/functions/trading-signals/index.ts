import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradingSignalRequest {
  action: 'create_signal' | 'analyze_asset' | 'get_ai_signals' | 'update_signal_performance'
  asset_id?: string
  signal_type?: string
  entry_price?: number
  target_price?: number
  stop_loss?: number
  reasoning?: string
  confidence_level?: number
  timeframe?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const requestData: TradingSignalRequest = await req.json()
    const { action } = requestData
    
    console.log('Trading Signals - Action:', action, 'User:', user.id)

    let result

    switch (action) {
      case 'create_signal':
        result = await createTradingSignal(supabaseClient, user.id, requestData)
        break
        
      case 'analyze_asset':
        result = await analyzeAsset(supabaseClient, requestData.asset_id!)
        break
        
      case 'get_ai_signals':
        result = await getAIGeneratedSignals(supabaseClient)
        break
        
      case 'update_signal_performance':
        result = await updateSignalPerformance(supabaseClient)
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in trading-signals function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function createTradingSignal(supabaseClient: any, userId: string, signalData: TradingSignalRequest) {
  console.log('Creating trading signal for user:', userId)

  const { data, error } = await supabaseClient
    .from('signals')
    .insert({
      user_id: userId,
      asset_id: signalData.asset_id,
      signal_type: signalData.signal_type,
      entry_price: signalData.entry_price,
      target_price: signalData.target_price,
      stop_loss: signalData.stop_loss,
      reasoning: signalData.reasoning,
      confidence_level: signalData.confidence_level,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    signal: data,
    message: 'Trading signal created successfully'
  }
}

async function analyzeAsset(supabaseClient: any, assetId: string) {
  console.log('Analyzing asset:', assetId)

  // Get asset information
  const { data: asset, error: assetError } = await supabaseClient
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single()

  if (assetError) throw assetError

  // Get latest market data
  const { data: marketData, error: marketError } = await supabaseClient
    .from('market_data')
    .select('*')
    .eq('asset_id', assetId)
    .order('timestamp', { ascending: false })
    .limit(30)

  if (marketError) throw marketError

  // Perform technical analysis
  const analysis = await performTechnicalAnalysis(asset, marketData)
  
  return {
    success: true,
    asset,
    analysis,
    market_data_points: marketData.length
  }
}

async function getAIGeneratedSignals(supabaseClient: any) {
  console.log('Generating AI trading signals')

  // Get top assets for analysis
  const { data: assets, error: assetsError } = await supabaseClient
    .from('assets')
    .select('*')
    .eq('is_active', true)
    .in('asset_type', ['stock', 'crypto'])
    .limit(20)

  if (assetsError) throw assetsError

  const aiSignals = []

  for (const asset of assets) {
    const signal = await generateAISignal(asset)
    if (signal.confidence_level >= 70) { // Only include high-confidence signals
      aiSignals.push(signal)
    }
  }

  // Insert AI signals into database
  if (aiSignals.length > 0) {
    const { error: insertError } = await supabaseClient
      .from('ai_signals')
      .insert(aiSignals)

    if (insertError) {
      console.error('Error inserting AI signals:', insertError)
    }
  }

  return {
    success: true,
    signals_generated: aiSignals.length,
    signals: aiSignals
  }
}

async function updateSignalPerformance(supabaseClient: any) {
  console.log('Updating signal performance')

  // Get active signals
  const { data: signals, error: signalsError } = await supabaseClient
    .from('signals')
    .select(`
      *,
      assets:asset_id (symbol, name)
    `)
    .eq('status', 'active')

  if (signalsError) throw signalsError

  const updates = []

  for (const signal of signals) {
    // Get current market price
    const { data: currentData, error: priceError } = await supabaseClient
      .from('market_data')
      .select('price')
      .eq('asset_id', signal.asset_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (priceError) continue

    const currentPrice = currentData.price
    const entryPrice = signal.entry_price
    const targetPrice = signal.target_price
    const stopLoss = signal.stop_loss

    let newStatus = 'active'
    let successRate = signal.success_rate || 0

    // Check if signal hit target or stop loss
    if (signal.signal_type === 'buy') {
      if (currentPrice >= targetPrice) {
        newStatus = 'completed'
        successRate = 100
      } else if (currentPrice <= stopLoss) {
        newStatus = 'stopped'
        successRate = 0
      }
    } else if (signal.signal_type === 'sell') {
      if (currentPrice <= targetPrice) {
        newStatus = 'completed'
        successRate = 100
      } else if (currentPrice >= stopLoss) {
        newStatus = 'stopped'
        successRate = 0
      }
    }

    if (newStatus !== 'active') {
      updates.push({
        id: signal.id,
        status: newStatus,
        success_rate: successRate,
        updated_at: new Date().toISOString()
      })
    }
  }

  // Update signals
  if (updates.length > 0) {
    for (const update of updates) {
      await supabaseClient
        .from('signals')
        .update({
          status: update.status,
          success_rate: update.success_rate,
          updated_at: update.updated_at
        })
        .eq('id', update.id)
    }
  }

  return {
    success: true,
    signals_checked: signals.length,
    signals_updated: updates.length
  }
}

async function performTechnicalAnalysis(asset: any, marketData: any[]) {
  if (marketData.length === 0) {
    return {
      trend: 'neutral',
      strength: 0,
      recommendation: 'hold',
      indicators: {}
    }
  }

  const prices = marketData.map(d => d.price).reverse()
  
  // Calculate technical indicators
  const sma5 = calculateSMA(prices, 5)
  const sma20 = calculateSMA(prices, 20)
  const rsi = calculateRSI(prices, 14)
  
  // Determine trend
  let trend = 'neutral'
  if (sma5 > sma20) trend = 'bullish'
  else if (sma5 < sma20) trend = 'bearish'
  
  // Calculate strength (0-100)
  const strength = Math.abs(((sma5 - sma20) / sma20) * 100)
  
  // Generate recommendation
  let recommendation = 'hold'
  if (trend === 'bullish' && rsi < 70) recommendation = 'buy'
  else if (trend === 'bearish' && rsi > 30) recommendation = 'sell'
  
  return {
    trend,
    strength: Math.min(100, Math.round(strength)),
    recommendation,
    indicators: {
      sma5: Math.round(sma5 * 100) / 100,
      sma20: Math.round(sma20 * 100) / 100,
      rsi: Math.round(rsi)
    }
  }
}

async function generateAISignal(asset: any) {
  // Simulate AI signal generation with realistic parameters
  const signalTypes = ['buy', 'sell']
  const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)]
  
  const basePrice = Math.random() * 500 + 50
  const volatility = Math.random() * 0.1 + 0.02 // 2-12% volatility
  
  const confidence = Math.floor(Math.random() * 40) + 60 // 60-100% confidence
  
  return {
    asset_id: asset.id,
    signal_type: signalType,
    confidence: confidence,
    reasoning: `AI detected ${signalType === 'buy' ? 'bullish' : 'bearish'} pattern based on technical analysis`,
    target_price: signalType === 'buy' ? basePrice * 1.05 : basePrice * 0.95,
    stop_loss: signalType === 'buy' ? basePrice * 0.98 : basePrice * 1.02,
    strength: Math.floor(Math.random() * 30) + 70, // 70-100% strength
    pattern_detected: ['double_bottom', 'head_and_shoulders', 'bullish_flag', 'support_break'][Math.floor(Math.random() * 4)],
    confidence_level: confidence
  }
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0
  
  const slice = prices.slice(-period)
  return slice.reduce((sum, price) => sum + price, 0) / period
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50
  
  const changes = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }
  
  const recentChanges = changes.slice(-period)
  const gains = recentChanges.filter(change => change > 0)
  const losses = recentChanges.filter(change => change < 0).map(loss => Math.abs(loss))
  
  const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / gains.length : 0
  const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}