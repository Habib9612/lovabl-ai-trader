import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useDemoTrading } from '@/hooks/useDemoTrading';

export const DemoTradingPanel = () => {
  const {
    marketData,
    portfolio,
    orderHistory,
    loading,
    placeOrder,
    refreshData
  } = useDemoTrading();

  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState('');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');

  const handlePlaceOrder = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await placeOrder(selectedSymbol, parseInt(quantity), orderSide);
      setQuantity('');
      refreshData();
    } catch (error) {
      console.error('Order placement failed:', error);
    }
  };

  const selectedStock = marketData.find(stock => stock.symbol === selectedSymbol);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.total_value?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {portfolio.total_pnl >= 0 ? '+' : ''}${portfolio.total_pnl?.toFixed(2) || '0.00'} 
              ({portfolio.total_pnl_percent?.toFixed(2) || '0.00'}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.cash?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Available to trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.market_value?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Invested positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
            {portfolio.total_pnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolio.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio.total_pnl >= 0 ? '+' : ''}${portfolio.total_pnl?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolio.total_pnl_percent?.toFixed(2) || '0.00'}% return
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
                <CardDescription>Buy or sell stocks with demo money</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Symbol</label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {marketData.map((stock) => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - ${stock.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStock && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedStock.symbol}</span>
                      <div className="text-right">
                        <div className="font-bold">${selectedStock.price.toFixed(2)}</div>
                        <div className={`text-sm ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderSide === 'BUY' ? 'default' : 'outline'}
                    onClick={() => setOrderSide('BUY')}
                    className="w-full"
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderSide === 'SELL' ? 'default' : 'outline'}
                    onClick={() => setOrderSide('SELL')}
                    className="w-full"
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                {selectedStock && quantity && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Estimated Total</div>
                    <div className="font-bold">
                      ${(selectedStock.price * parseInt(quantity || '0')).toFixed(2)}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handlePlaceOrder} 
                  className="w-full"
                  disabled={loading || !quantity}
                >
                  {loading ? 'Processing...' : `${orderSide} ${selectedSymbol}`}
                </Button>
              </CardContent>
            </Card>

            {/* Market Watch */}
            <Card>
              <CardHeader>
                <CardTitle>Market Watch</CardTitle>
                <CardDescription>Real-time stock prices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {marketData.map((stock) => (
                    <div
                      key={stock.symbol}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted ${
                        selectedSymbol === stock.symbol ? 'border-primary bg-muted' : ''
                      }`}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            Vol: {(stock.volume / 1000000).toFixed(1)}M
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${stock.price.toFixed(2)}</div>
                          <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
              <CardDescription>Your active stock positions</CardDescription>
            </CardHeader>
            <CardContent>
              {portfolio.positions?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Market Value</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.positions.map((position: any) => (
                      <TableRow key={position.symbol}>
                        <TableCell className="font-medium">{position.symbol}</TableCell>
                        <TableCell>{position.quantity}</TableCell>
                        <TableCell>${position.avg_price.toFixed(2)}</TableCell>
                        <TableCell>${position.current_price.toFixed(2)}</TableCell>
                        <TableCell>${position.market_value.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                            <div className="text-xs">
                              ({position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(2)}%)
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No positions yet. Start trading to see your positions here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Your recent trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              {orderHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderHistory.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{new Date(order.created_at).toLocaleTimeString()}</TableCell>
                        <TableCell className="font-medium">{order.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === 'BUY' ? 'default' : 'secondary'}>
                            {order.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet. Place your first trade to see history here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Live market data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketData.map((stock) => (
                  <Card key={stock.symbol} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{stock.symbol}</h3>
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
                      <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Volume: {(stock.volume / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};