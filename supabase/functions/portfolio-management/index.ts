import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortfolioRequest {
  action: 'create_portfolio' | 'add_position' | 'update_position' | 'remove_position' | 'calculate_performance' | 'rebalance'
  portfolio_id?: string
  asset_id?: string
  symbol?: string
  quantity?: number
  entry_price?: number
  position_type?: 'long' | 'short'
  portfolio_name?: string
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

    const requestData: PortfolioRequest = await req.json()
    const { action } = requestData
    
    console.log('Portfolio Management - Action:', action, 'User:', user.id)

    let result

    switch (action) {
      case 'create_portfolio':
        result = await createPortfolio(supabaseClient, user.id, requestData)
        break
        
      case 'add_position':
        result = await addPosition(supabaseClient, user.id, requestData)
        break
        
      case 'update_position':
        result = await updatePosition(supabaseClient, user.id, requestData)
        break
        
      case 'remove_position':
        result = await removePosition(supabaseClient, user.id, requestData)
        break
        
      case 'calculate_performance':
        result = await calculatePortfolioPerformance(supabaseClient, user.id, requestData.portfolio_id!)
        break
        
      case 'rebalance':
        result = await rebalancePortfolio(supabaseClient, user.id, requestData.portfolio_id!)
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in portfolio-management function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function createPortfolio(supabaseClient: any, userId: string, data: PortfolioRequest) {
  console.log('Creating portfolio for user:', userId)

  const { data: portfolio, error } = await supabaseClient
    .from('portfolios')
    .insert({
      user_id: userId,
      name: data.portfolio_name || 'New Portfolio',
      is_default: false
    })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    portfolio,
    message: 'Portfolio created successfully'
  }
}

async function addPosition(supabaseClient: any, userId: string, data: PortfolioRequest) {
  console.log('Adding position to portfolio')

  // First, get or create asset
  let assetId = data.asset_id

  if (!assetId && data.symbol) {
    // Try to find existing asset
    const { data: existingAsset } = await supabaseClient
      .from('assets')
      .select('id')
      .eq('symbol', data.symbol.toUpperCase())
      .single()

    if (existingAsset) {
      assetId = existingAsset.id
    } else {
      // Create new asset
      const { data: newAsset, error: assetError } = await supabaseClient
        .from('assets')
        .insert({
          symbol: data.symbol.toUpperCase(),
          name: data.symbol.toUpperCase(),
          asset_type: 'stock' // Default to stock
        })
        .select()
        .single()

      if (assetError) throw assetError
      assetId = newAsset.id
    }
  }

  if (!assetId) {
    throw new Error('Asset ID or symbol is required')
  }

  // Create trade record
  const { data: trade, error: tradeError } = await supabaseClient
    .from('trades')
    .insert({
      user_id: userId,
      portfolio_id: data.portfolio_id,
      asset_id: assetId,
      trade_type: data.position_type === 'short' ? 'sell' : 'buy',
      order_type: 'market',
      quantity: data.quantity,
      price: data.entry_price,
      total_amount: (data.quantity || 0) * (data.entry_price || 0),
      status: 'executed',
      executed_at: new Date().toISOString()
    })
    .select()
    .single()

  if (tradeError) throw tradeError

  // Update portfolio balance
  await updatePortfolioBalance(supabaseClient, data.portfolio_id!)

  return {
    success: true,
    trade,
    message: 'Position added successfully'
  }
}

async function updatePosition(supabaseClient: any, userId: string, data: PortfolioRequest) {
  console.log('Updating position')

  // Get existing position (latest trade for this asset in portfolio)
  const { data: existingTrade, error: tradeError } = await supabaseClient
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('portfolio_id', data.portfolio_id)
    .eq('asset_id', data.asset_id)
    .order('executed_at', { ascending: false })
    .limit(1)
    .single()

  if (tradeError) throw tradeError

  // Create new trade for the difference
  const quantityDiff = (data.quantity || 0) - existingTrade.quantity
  
  if (quantityDiff !== 0) {
    const { data: updateTrade, error: updateError } = await supabaseClient
      .from('trades')
      .insert({
        user_id: userId,
        portfolio_id: data.portfolio_id,
        asset_id: data.asset_id,
        trade_type: quantityDiff > 0 ? 'buy' : 'sell',
        order_type: 'market',
        quantity: Math.abs(quantityDiff),
        price: data.entry_price,
        total_amount: Math.abs(quantityDiff) * (data.entry_price || 0),
        status: 'executed',
        executed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (updateError) throw updateError

    // Update portfolio balance
    await updatePortfolioBalance(supabaseClient, data.portfolio_id!)

    return {
      success: true,
      trade: updateTrade,
      message: 'Position updated successfully'
    }
  }

  return {
    success: true,
    message: 'No changes needed'
  }
}

async function removePosition(supabaseClient: any, userId: string, data: PortfolioRequest) {
  console.log('Removing position')

  // Get current position
  const { data: trades, error: tradesError } = await supabaseClient
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('portfolio_id', data.portfolio_id)
    .eq('asset_id', data.asset_id)

  if (tradesError) throw tradesError

  // Calculate total position
  let totalQuantity = 0
  for (const trade of trades) {
    if (trade.trade_type === 'buy') {
      totalQuantity += trade.quantity
    } else {
      totalQuantity -= trade.quantity
    }
  }

  if (totalQuantity > 0) {
    // Get current market price
    const { data: marketData } = await supabaseClient
      .from('market_data')
      .select('price')
      .eq('asset_id', data.asset_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const currentPrice = marketData?.price || data.entry_price || 0

    // Create sell trade to close position
    const { data: closeTrade, error: closeError } = await supabaseClient
      .from('trades')
      .insert({
        user_id: userId,
        portfolio_id: data.portfolio_id,
        asset_id: data.asset_id,
        trade_type: 'sell',
        order_type: 'market',
        quantity: totalQuantity,
        price: currentPrice,
        total_amount: totalQuantity * currentPrice,
        status: 'executed',
        executed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (closeError) throw closeError

    // Update portfolio balance
    await updatePortfolioBalance(supabaseClient, data.portfolio_id!)

    return {
      success: true,
      trade: closeTrade,
      message: 'Position closed successfully'
    }
  }

  return {
    success: true,
    message: 'No position to close'
  }
}

async function calculatePortfolioPerformance(supabaseClient: any, userId: string, portfolioId: string) {
  console.log('Calculating portfolio performance')

  // Get all trades for portfolio
  const { data: trades, error: tradesError } = await supabaseClient
    .from('trades')
    .select(`
      *,
      assets:asset_id (symbol, name)
    `)
    .eq('user_id', userId)
    .eq('portfolio_id', portfolioId)
    .order('executed_at', { ascending: true })

  if (tradesError) throw tradesError

  // Calculate positions
  const positions: { [assetId: string]: any } = {}
  let totalInvested = 0
  let totalCashFlow = 0

  for (const trade of trades) {
    if (!positions[trade.asset_id]) {
      positions[trade.asset_id] = {
        asset: trade.assets,
        quantity: 0,
        total_cost: 0,
        realized_pnl: 0
      }
    }

    const position = positions[trade.asset_id]

    if (trade.trade_type === 'buy') {
      position.quantity += trade.quantity
      position.total_cost += trade.total_amount
      totalInvested += trade.total_amount
      totalCashFlow -= trade.total_amount
    } else {
      // Sell trade
      const avgCost = position.total_cost / position.quantity
      const soldCost = avgCost * trade.quantity
      const soldValue = trade.total_amount
      
      position.realized_pnl += soldValue - soldCost
      position.quantity -= trade.quantity
      position.total_cost -= soldCost
      totalCashFlow += trade.total_amount
    }
  }

  // Get current market prices for open positions
  let currentValue = 0
  let unrealizedPnl = 0

  for (const assetId in positions) {
    const position = positions[assetId]
    if (position.quantity > 0) {
      const { data: marketData } = await supabaseClient
        .from('market_data')
        .select('price')
        .eq('asset_id', assetId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      const currentPrice = marketData?.price || 0
      const positionValue = position.quantity * currentPrice
      currentValue += positionValue

      const avgCost = position.total_cost / position.quantity
      unrealizedPnl += (currentPrice - avgCost) * position.quantity
    }
  }

  // Calculate total P&L
  const totalRealizedPnl = Object.values(positions).reduce((sum: number, pos: any) => sum + pos.realized_pnl, 0)
  const totalPnl = totalRealizedPnl + unrealizedPnl
  const totalReturn = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  // Update portfolio with calculated values
  await supabaseClient
    .from('portfolios')
    .update({
      current_balance: currentValue + totalCashFlow,
      total_profit_loss: totalPnl,
      updated_at: new Date().toISOString()
    })
    .eq('id', portfolioId)

  return {
    success: true,
    performance: {
      total_invested: totalInvested,
      current_value: currentValue,
      cash_balance: totalCashFlow,
      total_portfolio_value: currentValue + Math.max(0, totalCashFlow),
      realized_pnl: totalRealizedPnl,
      unrealized_pnl: unrealizedPnl,
      total_pnl: totalPnl,
      total_return_percentage: totalReturn,
      positions: Object.values(positions).filter((p: any) => p.quantity > 0)
    }
  }
}

async function rebalancePortfolio(supabaseClient: any, userId: string, portfolioId: string) {
  console.log('Rebalancing portfolio')

  // Get portfolio performance first
  const performance = await calculatePortfolioPerformance(supabaseClient, userId, portfolioId)
  
  // Simple rebalancing: sell positions that are > 30% of portfolio, buy those < 10%
  const totalValue = performance.performance.total_portfolio_value
  const rebalanceActions = []

  for (const position of performance.performance.positions) {
    const currentPrice = 100 // Simplified - would get real price
    const positionValue = position.quantity * currentPrice
    const positionWeight = (positionValue / totalValue) * 100

    if (positionWeight > 30) {
      // Sell to reduce to 25%
      const targetValue = totalValue * 0.25
      const quantityToSell = (positionValue - targetValue) / currentPrice
      
      rebalanceActions.push({
        action: 'sell',
        asset_id: position.asset.id,
        quantity: quantityToSell,
        reason: `Reduce overweight position from ${positionWeight.toFixed(1)}% to 25%`
      })
    } else if (positionWeight < 10 && positionWeight > 0) {
      // Buy to increase to 15%
      const targetValue = totalValue * 0.15
      const quantityToBuy = (targetValue - positionValue) / currentPrice
      
      rebalanceActions.push({
        action: 'buy',
        asset_id: position.asset.id,
        quantity: quantityToBuy,
        reason: `Increase underweight position from ${positionWeight.toFixed(1)}% to 15%`
      })
    }
  }

  return {
    success: true,
    rebalance_actions: rebalanceActions,
    message: `Portfolio rebalancing analysis complete. ${rebalanceActions.length} actions recommended.`
  }
}

async function updatePortfolioBalance(supabaseClient: any, portfolioId: string) {
  // This would typically recalculate the portfolio balance
  // For now, we'll just update the timestamp
  await supabaseClient
    .from('portfolios')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', portfolioId)
}