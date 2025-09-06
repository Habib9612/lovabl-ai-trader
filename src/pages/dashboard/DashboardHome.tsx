import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Brain, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Users,
  Play
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const portfolioData = [
  { date: '2024-01', value: 10000 },
  { date: '2024-02', value: 10250 },
  { date: '2024-03', value: 10100 },
  { date: '2024-04', value: 10800 },
  { date: '2024-05', value: 11200 },
  { date: '2024-06', value: 11850 },
  { date: '2024-07', value: 12100 },
  { date: '2024-08', value: 11900 },
  { date: '2024-09', value: 12650 },
  { date: '2024-10', value: 13200 },
  { date: '2024-11', value: 13950 },
  { date: '2024-12', value: 14750 },
];

const signalsData = [
  { asset: 'AAPL', type: 'BUY', confidence: 94.2, change: '+2.3%' },
  { asset: 'TSLA', type: 'SELL', confidence: 87.5, change: '-1.8%' },
  { asset: 'BTC', type: 'BUY', confidence: 91.3, change: '+5.2%' },
  { asset: 'ETH', type: 'HOLD', confidence: 76.8, change: '+0.5%' },
];

const assetAllocation = [
  { name: 'Stocks', value: 45, color: '#8B5CF6' },
  { name: 'Crypto', value: 25, color: '#06B6D4' },
  { name: 'Forex', value: 20, color: '#10B981' },
  { name: 'Commodities', value: 10, color: '#F59E0B' },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's your trading overview for today.
          </p>
        </div>
        <Button variant="hero" size="lg">
          <Play className="h-4 w-4 mr-2" />
          Start Trading
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$14,750.00</div>
            <div className="flex items-center text-sm text-success">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +47.5% from last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+$247.85</div>
            <div className="flex items-center text-sm text-success">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +1.68% today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <div className="flex items-center text-sm text-primary">
              <Target className="h-3 w-3 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              8 high confidence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Your portfolio value over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Portfolio Value']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Asset Allocation
            </CardTitle>
            <CardDescription>
              Distribution of your portfolio across asset classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="text-sm">{asset.name}: {asset.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Signals and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Signals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Live AI Signals
            </CardTitle>
            <CardDescription>
              Real-time trading signals generated by our AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signalsData.map((signal) => (
                <div key={signal.asset} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{signal.asset}</div>
                    <Badge 
                      variant={
                        signal.type === 'BUY' ? 'default' : 
                        signal.type === 'SELL' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {signal.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {signal.confidence}% confidence
                    </div>
                    <div className={`text-sm font-medium ${
                      signal.change.startsWith('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      {signal.change}
                    </div>
                    <Button size="sm" variant="outline">
                      Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common trading and analysis tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Open Trading Terminal
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Brain className="h-4 w-4 mr-2" />
              Run AI Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Set Price Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="h-4 w-4 mr-2" />
              View Market News
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Your trading performance metrics for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Win Rate</span>
                <span className="text-sm text-muted-foreground">73%</span>
              </div>
              <Progress value={73} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit Factor</span>
                <span className="text-sm text-muted-foreground">2.4</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm text-muted-foreground">Low</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;