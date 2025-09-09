import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { useFinvizData } from '@/hooks/useFinvizData';

const SCREENER_PRESETS = {
  'top_gainers': { name: 'Top Gainers', filters: ['ta_perf_day_o5'], order: '-change' },
  'top_losers': { name: 'Top Losers', filters: ['ta_perf_day_u-5'], order: 'change' },
  'mega_cap': { name: 'Mega Cap (>$200B)', filters: ['cap_mega'], order: '-marketcap' },
  'large_cap': { name: 'Large Cap ($10B-$200B)', filters: ['cap_large'], order: '-marketcap' },
  'sp500_tech': { name: 'S&P 500 Tech', filters: ['idx_sp500', 'sec_technology'], order: '-marketcap' },
  'high_volume': { name: 'High Volume', filters: ['sh_avgvol_o2000'], order: '-volume' },
  'dividend_stocks': { name: 'Dividend Stocks', filters: ['fa_div_o3'], order: '-dividend' },
  'penny_stocks': { name: 'Penny Stocks', filters: ['sh_price_u5'], order: 'price' }
};

export const FinvizScreener = () => {
  const { screenStocks, getTopGainers, getTopLosers, screenerData, isLoading } = useFinvizData();
  const [activePreset, setActivePreset] = useState('top_gainers');
  const [customFilters, setCustomFilters] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('FinvizScreener: Loading initial preset');
    loadPreset('top_gainers');
  }, []);

  const loadPreset = async (presetKey: string) => {
    setActivePreset(presetKey);
    
    if (presetKey === 'top_gainers') {
      await getTopGainers(50);
    } else if (presetKey === 'top_losers') {
      await getTopLosers(50);
    } else {
      const preset = SCREENER_PRESETS[presetKey as keyof typeof SCREENER_PRESETS];
      if (preset) {
        await screenStocks(preset.filters, preset.order, 50);
      }
    }
  };

  const runCustomScreen = async () => {
    if (!customFilters.trim()) return;
    
    const filters = customFilters.split(',').map(f => f.trim()).filter(f => f);
    await screenStocks(filters, '-marketcap', 50);
  };

  const filteredData = screenerData.filter(stock => 
    !searchTerm || 
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatChange = (change: string) => {
    const isPositive = !change.startsWith('-');
    return (
      <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </span>
    );
  };

  const formatMarketCap = (marketCap: string) => {
    if (marketCap === '-') return marketCap;
    
    // Convert market cap to more readable format
    const num = parseFloat(marketCap.replace(/[^0-9.-]/g, ''));
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}T`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}B`;
    return marketCap;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">FinViz Stock Screener</h2>
          <p className="text-muted-foreground">Professional stock screening with real-time market data</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Live Data
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            FinViz
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Preset Screens</TabsTrigger>
          <TabsTrigger value="custom">Custom Screen</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(SCREENER_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={activePreset === key ? "default" : "outline"}
                size="sm"
                onClick={() => loadPreset(key)}
                className="justify-start"
              >
                {key === 'top_gainers' && <TrendingUp className="w-4 h-4 mr-2" />}
                {key === 'top_losers' && <TrendingDown className="w-4 h-4 mr-2" />}
                {preset.name}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter filters (e.g., cap_large,sec_technology,ta_perf_day_o5)"
              value={customFilters}
              onChange={(e) => setCustomFilters(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runCustomScreen} disabled={isLoading}>
              <Filter className="w-4 h-4 mr-2" />
              Screen
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Common filters: cap_mega, cap_large, idx_sp500, sec_technology, ta_perf_day_o5, fa_div_o3</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search and Results */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {filteredData.length} stocks
          </Badge>
        </div>

        <Card className="bg-background border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">Screening Results</span>
                {isLoading && <Skeleton className="h-4 w-20" />}
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredData.length} results
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              {SCREENER_PRESETS[activePreset as keyof typeof SCREENER_PRESETS]?.name || 'Custom Screen'} • Updated {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>P/E</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((stock, index) => (
                      <TableRow key={`${stock.ticker}-${index}`} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Badge variant="outline">{stock.ticker}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {stock.company}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {stock.sector}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatMarketCap(stock.marketCap)}</TableCell>
                        <TableCell className="font-medium">${stock.price}</TableCell>
                        <TableCell>{formatChange(stock.change)}</TableCell>
                        <TableCell>{stock.volume}</TableCell>
                        <TableCell>{stock.pe}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredData.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No stocks found matching your criteria
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};