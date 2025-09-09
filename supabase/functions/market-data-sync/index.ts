import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketDataRequest {
  action: 'sync_all' | 'sync_symbol' | 'get_latest'
  symbol?: string
  limit?: number
}

interface AssetData {
  id: string
  symbol: string
  asset_type: string
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

    const { action, symbol, limit = 100 }: MarketDataRequest = await req.json()
    console.log('Market Data Sync - Action:', action, 'Symbol:', symbol)

    let result

    switch (action) {
      case 'sync_all':
        result = await syncAllMarketData(supabaseClient)
        break
        
      case 'sync_symbol':
        if (!symbol) {
          throw new Error('Symbol is required for sync_symbol action')
        }
        result = await syncSymbolData(supabaseClient, symbol)
        break
        
      case 'get_latest':
        result = await getLatestMarketData(supabaseClient, limit)
        break
        
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in market-data-sync function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function syncAllMarketData(supabaseClient: any) {
  console.log('Syncing all market data...')
  
  // Get all active assets
  const { data: assets, error: assetsError } = await supabaseClient
    .from('assets')
    .select('id, symbol, asset_type')
    .eq('is_active', true)
    .limit(50) // Limit to prevent timeout

  if (assetsError) throw assetsError

  const results = []
  for (const asset of assets) {
    try {
      const marketData = await fetchMarketDataForAsset(asset)
      if (marketData) {
        // Insert market data
        const { error: insertError } = await supabaseClient
          .from('market_data')
          .insert({
            asset_id: asset.id,
            price: marketData.price,
            change_24h: marketData.change_24h,
            change_percentage_24h: marketData.change_percentage_24h,
            volume_24h: marketData.volume_24h,
            market_cap: marketData.market_cap,
            high_24h: marketData.high_24h,
            low_24h: marketData.low_24h,
            source: 'finviz'
          })

        if (insertError) {
          console.error(`Error inserting data for ${asset.symbol}:`, insertError)
        } else {
          results.push({ symbol: asset.symbol, status: 'success' })
        }
      }
    } catch (error) {
      console.error(`Error syncing ${asset.symbol}:`, error)
      results.push({ symbol: asset.symbol, status: 'error', error: error.message })
    }
  }

  return {
    success: true,
    synced_count: results.filter(r => r.status === 'success').length,
    total_assets: assets.length,
    results
  }
}

async function syncSymbolData(supabaseClient: any, symbol: string) {
  console.log(`Syncing data for symbol: ${symbol}`)
  
  // Get asset info
  const { data: asset, error: assetError } = await supabaseClient
    .from('assets')
    .select('id, symbol, asset_type')
    .eq('symbol', symbol.toUpperCase())
    .single()

  if (assetError) throw new Error(`Asset not found: ${symbol}`)

  const marketData = await fetchMarketDataForAsset(asset)
  
  if (!marketData) {
    throw new Error(`No market data available for ${symbol}`)
  }

  // Insert market data
  const { error: insertError } = await supabaseClient
    .from('market_data')
    .insert({
      asset_id: asset.id,
      price: marketData.price,
      change_24h: marketData.change_24h,
      change_percentage_24h: marketData.change_percentage_24h,
      volume_24h: marketData.volume_24h,
      market_cap: marketData.market_cap,
      high_24h: marketData.high_24h,
      low_24h: marketData.low_24h,
      source: 'finviz'
    })

  if (insertError) throw insertError

  return {
    success: true,
    symbol: symbol,
    data: marketData
  }
}

async function getLatestMarketData(supabaseClient: any, limit: number) {
  console.log(`Getting latest market data (limit: ${limit})`)
  
  const { data, error } = await supabaseClient
    .from('market_data')
    .select(`
      *,
      assets:asset_id (symbol, name, asset_type)
    `)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error

  return {
    success: true,
    data,
    count: data.length
  }
}

async function fetchMarketDataForAsset(asset: AssetData) {
  try {
    // Simulate market data fetching (in real implementation, this would call external APIs)
    // For demo purposes, generate realistic-looking data
    
    const basePrice = getBasePriceForSymbol(asset.symbol)
    const change = (Math.random() - 0.5) * 0.1 // ±5% change
    const price = basePrice * (1 + change)
    
    return {
      price: parseFloat(price.toFixed(2)),
      change_24h: parseFloat((basePrice * change).toFixed(2)),
      change_percentage_24h: parseFloat((change * 100).toFixed(2)),
      volume_24h: Math.floor(Math.random() * 100000000),
      market_cap: asset.asset_type === 'stock' ? Math.floor(Math.random() * 1000000000000) : null,
      high_24h: parseFloat((price * 1.02).toFixed(2)),
      low_24h: parseFloat((price * 0.98).toFixed(2))
    }
  } catch (error) {
    console.error(`Error fetching market data for ${asset.symbol}:`, error)
    return null
  }
}

function getBasePriceForSymbol(symbol: string): number {
  // Return realistic base prices for common symbols
  const basePrices: { [key: string]: number } = {
    'AAPL': 190.50,
    'GOOGL': 150.25,
    'MSFT': 415.75,
    'TSLA': 245.80,
    'AMZN': 155.30,
    'NVDA': 875.25,
    'META': 485.60,
    'BTC': 67500.00,
    'ETH': 3750.00,
    'SPY': 550.25,
    'QQQ': 485.30
  }
  
  return basePrices[symbol] || (Math.random() * 500 + 50) // Random price between $50-$550
}