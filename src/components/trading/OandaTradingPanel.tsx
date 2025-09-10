import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useOandaTrading } from '@/hooks/useOandaTrading';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export const OandaTradingPanel = () => {
  const {
    isLoading,
    accounts,
    selectedAccount,
    instruments,
    positions,
    trades,
    loadAccounts,
    setSelectedAccount,
    getPrice,
    placeOrder,
    refreshAccountData
  } = useOandaTrading();

  const [orderForm, setOrderForm] = useState({
    instrument: '',
    units: '',
    type: 'MARKET',
    price: '',
    timeInForce: 'FOK'
  });

  const [prices, setPrices] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    loadAccounts();
  }, []);

  // Load prices for instruments
  useEffect(() => {
    const loadPrices = async () => {
      if (selectedAccount && instruments.length > 0) {
        const majorPairs = ['EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD'];
        const availablePairs = instruments
          .filter(inst => majorPairs.includes(inst.name))
          .slice(0, 5);

        for (const instrument of availablePairs) {
          const price = await getPrice(selectedAccount.id, instrument.name);
          if (price) {
            setPrices(prev => ({
              ...prev,
              [instrument.name]: price
            }));
          }
        }
      }
    };

    loadPrices();
    const interval = setInterval(loadPrices, 5000); // Update prices every 5 seconds
    return () => clearInterval(interval);
  }, [selectedAccount, instruments]);

  const handlePlaceOrder = async () => {
    if (!selectedAccount || !orderForm.instrument || !orderForm.units) {
      return;
    }

    try {
      await placeOrder({
        accountId: selectedAccount.id,
        instrument: orderForm.instrument,
        units: parseInt(orderForm.units),
        type: orderForm.type as any,
        price: orderForm.price ? parseFloat(orderForm.price) : undefined,
        timeInForce: orderForm.timeInForce as any
      });

      // Reset form
      setOrderForm({
        instrument: '',
        units: '',
        type: 'MARKET',
        price: '',
        timeInForce: 'FOK'
      });
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (!accounts.length && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OANDA Demo Trading</CardTitle>
          <CardDescription>Connect to your OANDA demo account to start trading</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadAccounts} className="w-full">
            Connect to OANDA Demo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            OANDA Demo Account
          </CardTitle>
          {selectedAccount && (
            <CardDescription>
              Account ID: {selectedAccount.id}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {selectedAccount && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  ${selectedAccount.balance.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${selectedAccount.nav.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">NAV</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${selectedAccount.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${selectedAccount.unrealizedPL.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Unrealized P&L</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${selectedAccount.marginAvailable.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Available Margin</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="trade" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="prices">Prices</TabsTrigger>
        </TabsList>

        {/* Trading Panel */}
        <TabsContent value="trade">
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select
                    value={orderForm.instrument}
                    onValueChange={(value) => setOrderForm(prev => ({ ...prev, instrument: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      {instruments.slice(0, 20).map((instrument) => (
                        <SelectItem key={instrument.name} value={instrument.name}>
                          {instrument.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="units">Units</Label>
                  <Input
                    id="units"
                    type="number"
                    placeholder="Enter units (negative for sell)"
                    value={orderForm.units}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, units: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Order Type</Label>
                  <Select
                    value={orderForm.type}
                    onValueChange={(value) => setOrderForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKET">Market</SelectItem>
                      <SelectItem value="LIMIT">Limit</SelectItem>
                      <SelectItem value="STOP">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderForm.type !== 'MARKET' && (
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.00001"
                      placeholder="Enter price"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading || !orderForm.instrument || !orderForm.units}
                className="w-full"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions */}
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <Button onClick={refreshAccountData} size="sm" variant="outline">
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No open positions</p>
              ) : (
                <div className="space-y-2">
                  {positions.map((position, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{position.instrument}</div>
                          <div className="text-sm text-muted-foreground">
                            Long: {position.long.units} | Short: {position.short.units}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${parseFloat(position.long.unrealizedPL) + parseFloat(position.short.unrealizedPL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(parseFloat(position.long.unrealizedPL) + parseFloat(position.short.unrealizedPL)).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Unrealized P&L</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Open Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">No pending orders</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Prices */}
        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(prices).map(([instrument, price]) => (
                  <div key={instrument} className="flex justify-between items-center p-3 border rounded">
                    <div className="font-semibold">{instrument}</div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Bid</div>
                        <div className="font-mono text-red-600">
                          {price.bids[0]?.price || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Ask</div>
                        <div className="font-mono text-green-600">
                          {price.asks[0]?.price || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};