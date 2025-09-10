import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoTradingRequest {
  action: string
  symbol?: string
  quantity?: number
  side?: 'BUY' | 'SELL'
  portfolioId?: string
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, ...params } = await req.json() as DemoTradingRequest

    console.log(`Processing demo trading action: ${action} for user: ${user.id}`)

    let result

    switch (action) {
      case 'getMarketData':
        result = await getMarketData()
        break
      case 'getPortfolio':
        result = await getPortfolio(supabaseClient, user.id)
        break
      case 'placeOrder':
        result = await placeOrder(supabaseClient, user.id, params)
        break
      case 'getOrderHistory':
        result = await getOrderHistory(supabaseClient, user.id)
        break
      case 'createDemoAccount':
        result = await createDemoAccount(supabaseClient, user.id)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: `Demo trading ${action} completed successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Demo trading error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Market Data Functions
async function getMarketData(): Promise<MarketData[]> {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']
  const marketData: MarketData[] = []

  for (const symbol of symbols) {
    try {
      // Using a free API alternative or mock data for demo
      const mockPrice = getBasePriceForSymbol(symbol)
      const change = (Math.random() - 0.5) * 10 // Random change between -5% and +5%
      const price = mockPrice * (1 + change / 100)
      
      marketData.push({
        symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(change * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
    }
  }

  return marketData
}

function getBasePriceForSymbol(symbol: string): number {
  const basePrices: Record<string, number> = {
    'AAPL': 150,
    'GOOGL': 2800,
    'MSFT': 300,
    'AMZN': 3200,
    'TSLA': 800,
    'NVDA': 450,
    'META': 320,
    'NFLX': 450,
    'AMD': 120,
    'INTC': 50
  }
  return basePrices[symbol] || 100
}

// Portfolio Functions
async function getPortfolio(supabaseClient: any, userId: string) {
  // Get or create demo account
  let { data: account } = await supabaseClient
    .from('demo_accounts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!account) {
    account = await createDemoAccount(supabaseClient, userId)
  }

  // Get positions
  const { data: positions } = await supabaseClient
    .from('demo_positions')
    .select('*')
    .eq('account_id', account.id)

  // Get current market data
  const marketData = await getMarketData()
  const marketPrices = marketData.reduce((acc, stock) => {
    acc[stock.symbol] = stock.price
    return acc
  }, {} as Record<string, number>)

  // Calculate portfolio metrics
  let totalMarketValue = 0
  const positionsWithValues = (positions || []).map((position: any) => {
    const currentPrice = marketPrices[position.symbol] || position.avg_price
    const marketValue = currentPrice * position.quantity
    const pnl = (currentPrice - position.avg_price) * position.quantity
    const pnlPercent = ((currentPrice - position.avg_price) / position.avg_price) * 100

    totalMarketValue += marketValue

    return {
      ...position,
      current_price: currentPrice,
      market_value: marketValue,
      pnl,
      pnl_percent: pnlPercent
    }
  })

  const totalValue = account.cash + totalMarketValue
  const totalPnl = totalValue - account.initial_cash
  const totalPnlPercent = (totalPnl / account.initial_cash) * 100

  return {
    cash: account.cash,
    market_value: totalMarketValue,
    total_value: totalValue,
    total_pnl: totalPnl,
    total_pnl_percent: totalPnlPercent,
    initial_cash: account.initial_cash,
    positions: positionsWithValues
  }
}

async function createDemoAccount(supabaseClient: any, userId: string) {
  const initialCash = 100000 // $100,000 demo money

  const { data, error } = await supabaseClient
    .from('demo_accounts')
    .insert({
      user_id: userId,
      cash: initialCash,
      initial_cash: initialCash
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function placeOrder(supabaseClient: any, userId: string, params: any) {
  const { symbol, quantity, side } = params

  // Get market price
  const marketData = await getMarketData()
  const stockData = marketData.find(stock => stock.symbol === symbol)
  if (!stockData) {
    throw new Error('Symbol not found')
  }

  const currentPrice = stockData.price

  // Get demo account
  const { data: account } = await supabaseClient
    .from('demo_accounts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!account) {
    throw new Error('Demo account not found')
  }

  if (side === 'BUY') {
    const totalCost = currentPrice * quantity
    if (account.cash < totalCost) {
      throw new Error('Insufficient funds')
    }

    // Update cash
    await supabaseClient
      .from('demo_accounts')
      .update({ cash: account.cash - totalCost })
      .eq('id', account.id)

    // Update or create position
    const { data: existingPosition } = await supabaseClient
      .from('demo_positions')
      .select('*')
      .eq('account_id', account.id)
      .eq('symbol', symbol)
      .single()

    if (existingPosition) {
      const newQuantity = existingPosition.quantity + quantity
      const newAvgPrice = ((existingPosition.avg_price * existingPosition.quantity) + (currentPrice * quantity)) / newQuantity

      await supabaseClient
        .from('demo_positions')
        .update({
          quantity: newQuantity,
          avg_price: newAvgPrice
        })
        .eq('id', existingPosition.id)
    } else {
      await supabaseClient
        .from('demo_positions')
        .insert({
          account_id: account.id,
          symbol,
          quantity,
          avg_price: currentPrice
        })
    }

  } else if (side === 'SELL') {
    // Get existing position
    const { data: position } = await supabaseClient
      .from('demo_positions')
      .select('*')
      .eq('account_id', account.id)
      .eq('symbol', symbol)
      .single()

    if (!position || position.quantity < quantity) {
      throw new Error('Insufficient shares')
    }

    // Update cash
    const proceeds = currentPrice * quantity
    await supabaseClient
      .from('demo_accounts')
      .update({ cash: account.cash + proceeds })
      .eq('id', account.id)

    // Update position
    const newQuantity = position.quantity - quantity
    if (newQuantity === 0) {
      await supabaseClient
        .from('demo_positions')
        .delete()
        .eq('id', position.id)
    } else {
      await supabaseClient
        .from('demo_positions')
        .update({ quantity: newQuantity })
        .eq('id', position.id)
    }
  }

  // Record order
  await supabaseClient
    .from('demo_orders')
    .insert({
      account_id: account.id,
      symbol,
      quantity,
      side,
      price: currentPrice,
      status: 'FILLED'
    })

  return {
    message: `Order executed: ${side} ${quantity} ${symbol} at $${currentPrice.toFixed(2)}`,
    executed_price: currentPrice
  }
}

async function getOrderHistory(supabaseClient: any, userId: string) {
  const { data: account } = await supabaseClient
    .from('demo_accounts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!account) return []

  const { data: orders } = await supabaseClient
    .from('demo_orders')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return orders || []
}