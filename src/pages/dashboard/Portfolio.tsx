import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Wallet, Target, DollarSign, Percent } from 'lucide-react';

const portfolioData = [
  { name: 'AAPL', value: 25000, percentage: 35, change: 5.2, shares: 150 },
  { name: 'GOOGL', value: 18000, percentage: 25, change: -2.1, shares: 85 },
  { name: 'MSFT', value: 14400, percentage: 20, change: 3.8, shares: 120 },
  { name: 'TSLA', value: 7200, percentage: 10, change: -8.5, shares: 45 },
  { name: 'AMZN', value: 7200, percentage: 10, change: 1.2, shares: 55 }
];

const performanceData = [
  { month: 'Jan', value: 68000 },
  { month: 'Feb', value: 69500 },
  { month: 'Mar', value: 71200 },
  { month: 'Apr', value: 70800 },
  { month: 'May', value: 72100 },
  { month: 'Jun', value: 71800 }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export default function Portfolio() {
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalGain = 3200;
  const totalGainPercent = 4.67;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and performance</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Position
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${totalGain.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{totalGainPercent}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day's Change</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$847</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +1.18%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioData.length}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="add">Add Position</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioData.map((stock) => (
                    <div key={stock.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{stock.name}</div>
                        <Badge variant="secondary">{stock.percentage}%</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${stock.value.toLocaleString()}</div>
                        <div className={`text-sm flex items-center ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.map((position) => (
                  <div key={position.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold text-lg">{position.name}</div>
                        <div className="text-sm text-muted-foreground">{position.shares} shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${position.value.toLocaleString()}</div>
                      <div className={`text-sm flex items-center justify-end ${position.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {position.change >= 0 ? '+' : ''}{position.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Symbol</label>
                  <Input
                    placeholder="e.g., AAPL"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shares</label>
                  <Input
                    type="number"
                    placeholder="Number of shares"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" disabled={!newSymbol || !newShares}>
                Add Position
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}