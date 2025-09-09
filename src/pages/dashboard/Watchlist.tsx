import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Plus, TrendingUp, TrendingDown, Star, Bell, MoreHorizontal, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const watchlistData = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.84,
    change: 2.34,
    changePercent: 1.35,
    volume: '48.2M',
    marketCap: '2.8T',
    pe: 29.8,
    alerts: true,
    favorite: true
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    volume: '25.1M',
    marketCap: '1.8T',
    pe: 25.4,
    alerts: false,
    favorite: false
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 4.12,
    changePercent: 1.10,
    volume: '22.8M',
    marketCap: '2.8T',
    pe: 32.1,
    alerts: true,
    favorite: true
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.50,
    change: -8.75,
    changePercent: -3.40,
    volume: '65.4M',
    marketCap: '791B',
    pe: 62.8,
    alerts: false,
    favorite: false
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.12,
    change: 1.84,
    changePercent: 1.28,
    volume: '31.2M',
    marketCap: '1.5T',
    pe: 45.2,
    alerts: true,
    favorite: false
  }
];

const marketMovers = [
  { symbol: 'NVDA', change: 8.45, reason: 'Strong earnings beat' },
  { symbol: 'META', change: -3.21, reason: 'Regulatory concerns' },
  { symbol: 'AMD', change: 5.67, reason: 'New chip announcement' },
  { symbol: 'NFLX', change: -2.14, reason: 'Subscriber decline' }
];

export default function Watchlist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const filteredWatchlist = watchlistData.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">Monitor your favorite stocks and market movements</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistData.length}</div>
            <p className="text-xs text-muted-foreground">in watchlist</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistData.filter(s => s.favorite).length}</div>
            <p className="text-xs text-muted-foreground">starred stocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Active</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistData.filter(s => s.alerts).length}</div>
            <p className="text-xs text-muted-foreground">price alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gainers Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistData.filter(s => s.change > 0).length}</div>
            <p className="text-xs text-muted-foreground">positive movers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList>
          <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          <TabsTrigger value="movers">Market Movers</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          <TabsTrigger value="add">Add Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Stock</th>
                      <th className="text-right p-4 font-medium">Price</th>
                      <th className="text-right p-4 font-medium">Change</th>
                      <th className="text-right p-4 font-medium">Volume</th>
                      <th className="text-right p-4 font-medium">Market Cap</th>
                      <th className="text-right p-4 font-medium">P/E</th>
                      <th className="text-center p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWatchlist.map((stock) => (
                      <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {stock.favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                              {stock.alerts && <Bell className="h-4 w-4 text-blue-500" />}
                            </div>
                            <div>
                              <div className="font-semibold">{stock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{stock.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-semibold">${stock.price.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <div className={`flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>${Math.abs(stock.change).toFixed(2)}</span>
                            <span>({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-muted-foreground">{stock.volume}</td>
                        <td className="p-4 text-right text-muted-foreground">{stock.marketCap}</td>
                        <td className="p-4 text-right text-muted-foreground">{stock.pe}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View Chart</DropdownMenuItem>
                              <DropdownMenuItem>Set Alert</DropdownMenuItem>
                              <DropdownMenuItem>Add to Portfolio</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Market Movers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketMovers.map((mover) => (
                  <div key={mover.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-lg">{mover.symbol}</div>
                      <div className="text-muted-foreground">{mover.reason}</div>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${mover.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mover.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Price Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {watchlistData.filter(stock => stock.alerts).map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">Alert when price reaches $180.00</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Stock to Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button disabled={!newSymbol}>Add to Watchlist</Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Popular stocks: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META, NFLX
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}