import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FinvizRequest {
  action: 'get_stock' | 'screen_stocks' | 'get_multiple_stocks' | 'get_top_gainers' | 'get_top_losers'
  ticker?: string
  tickers?: string[]
  filters?: string[]
  order?: string
  limit?: number
}

class RateLimiter {
  private requests: Date[] = []
  private maxRequests = 50
  private timeWindow = 60000 // 1 minute

  async waitIfNeeded() {
    const now = new Date()
    this.requests = this.requests.filter(req => now.getTime() - req.getTime() < this.timeWindow)
    
    if (this.requests.length >= this.maxRequests) {
      const sleepTime = this.timeWindow - (now.getTime() - this.requests[0].getTime())
      await new Promise(resolve => setTimeout(resolve, sleepTime))
    }
    
    this.requests.push(now)
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

const rateLimiter = new RateLimiter()

async function fetchFinvizStock(ticker: string) {
  try {
    await rateLimiter.waitIfNeeded()
    
    const response = await fetch(`https://finviz.com/quote.ashx?t=${ticker}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Parse stock data from HTML
    const data = parseStockData(html, ticker)
    
    return { success: true, data, ticker }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    return { success: false, error: error.message, ticker }
  }
}

function parseStockData(html: string, ticker: string) {
  const data: any = { ticker }
  
  try {
    // Extract price
    const priceMatch = html.match(/class="snapshot-td2-cp"[^>]*>([^<]+)</i)
    if (priceMatch) data.price = priceMatch[1].trim()
    
    // Extract change
    const changeMatch = html.match(/class="snapshot-td2-cp"[^>]*>[^<]+<\/b><span[^>]*>([^<]+)</i)
    if (changeMatch) data.change = changeMatch[1].trim()
    
    // Extract volume
    const volumeMatch = html.match(/Volume<\/td><td[^>]*>([^<]+)</i)
    if (volumeMatch) data.volume = volumeMatch[1].trim()
    
    // Extract market cap
    const marketCapMatch = html.match(/Market Cap<\/td><td[^>]*>([^<]+)</i)
    if (marketCapMatch) data.marketCap = marketCapMatch[1].trim()
    
    // Extract P/E ratio
    const peMatch = html.match(/P\/E<\/td><td[^>]*>([^<]+)</i)
    if (peMatch) data.pe = peMatch[1].trim()
    
    // Extract 52-week range
    const rangeMatch = html.match(/52W Range<\/td><td[^>]*>([^<]+)</i)
    if (rangeMatch) data.range52w = rangeMatch[1].trim()
    
    // Extract beta
    const betaMatch = html.match(/Beta<\/td><td[^>]*>([^<]+)</i)
    if (betaMatch) data.beta = betaMatch[1].trim()
    
    // Extract dividend yield
    const divMatch = html.match(/Dividend %<\/td><td[^>]*>([^<]+)</i)
    if (divMatch) data.dividend = divMatch[1].trim()
    
    // Extract EPS
    const epsMatch = html.match(/EPS \(ttm\)<\/td><td[^>]*>([^<]+)</i)
    if (epsMatch) data.eps = epsMatch[1].trim()
    
  } catch (error) {
    console.error('Error parsing stock data:', error)
  }
  
  return data
}

async function fetchFinvizScreener(filters: string[] = [], order: string = 'ticker', limit: number = 50) {
  try {
    await rateLimiter.waitIfNeeded()
    
    // Build screener URL
    const filterStr = filters.join(',')
    const url = `https://finviz.com/screener.ashx?v=111&f=${filterStr}&o=${order}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const stocks = parseScreenerData(html, limit)
    
    return {
      success: true,
      data: stocks,
      total_results: stocks.length,
      filters_used: filters
    }
  } catch (error) {
    console.error('Error fetching screener:', error)
    return { success: false, error: error.message }
  }
}

function parseScreenerData(html: string, limit: number) {
  const stocks: any[] = []
  
  try {
    // Find all table rows with stock data
    const rowRegex = /<tr[^>]*class="table-dark-row[^"]*"[^>]*>(.*?)<\/tr>/gs
    const rows = html.match(rowRegex) || []
    
    for (let i = 0; i < Math.min(rows.length, limit); i++) {
      const row = rows[i]
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs) || []
      
      if (cells.length >= 11) {
        const stock = {
          ticker: extractText(cells[1]),
          company: extractText(cells[2]),
          sector: extractText(cells[3]),
          industry: extractText(cells[4]),
          country: extractText(cells[5]),
          marketCap: extractText(cells[6]),
          pe: extractText(cells[7]),
          price: extractText(cells[8]),
          change: extractText(cells[9]),
          volume: extractText(cells[10])
        }
        stocks.push(stock)
      }
    }
  } catch (error) {
    console.error('Error parsing screener data:', error)
  }
  
  return stocks
}

function extractText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ticker, tickers, filters, order, limit }: FinvizRequest = await req.json()

    let result

    switch (action) {
      case 'get_stock':
        if (!ticker) {
          throw new Error('Ticker is required for get_stock action')
        }
        result = await fetchFinvizStock(ticker)
        break

      case 'get_multiple_stocks':
        if (!tickers || !Array.isArray(tickers)) {
          throw new Error('Tickers array is required for get_multiple_stocks action')
        }
        
        const stockPromises = tickers.map(t => fetchFinvizStock(t))
        const stockResults = await Promise.all(stockPromises)
        result = { success: true, data: stockResults }
        break

      case 'screen_stocks':
        result = await fetchFinvizScreener(filters || [], order || 'ticker', limit || 50)
        break

      case 'get_top_gainers':
        result = await fetchFinvizScreener(['ta_perf_day_o5'], '-change', limit || 20)
        break

      case 'get_top_losers':
        result = await fetchFinvizScreener(['ta_perf_day_u-5'], 'change', limit || 20)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in finviz-data function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})