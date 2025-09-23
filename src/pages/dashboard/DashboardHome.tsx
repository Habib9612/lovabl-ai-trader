import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
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
  Play,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Shield,
  Sparkles
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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const portfolioData = [
  { date: '2024-01', value: 10000, benchmark: 10000 },
  { date: '2024-02', value: 10250, benchmark: 10100 },
  { date: '2024-03', value: 10100, benchmark: 9950 },
  { date: '2024-04', value: 10800, benchmark: 10200 },
  { date: '2024-05', value: 11200, benchmark: 10400 },
  { date: '2024-06', value: 11850, benchmark: 10650 },
  { date: '2024-07', value: 12100, benchmark: 10800 },
  { date: '2024-08', value: 11900, benchmark: 10600 },
  { date: '2024-09', value: 12650, benchmark: 11000 },
  { date: '2024-10', value: 13200, benchmark: 11200 },
  { date: '2024-11', value: 13950, benchmark: 11500 },
  { date: '2024-12', value: 14750, benchmark: 11800 },
];

const signalsData = [
  { asset: 'AAPL', type: 'BUY', confidence: 94.2, change: '+2.3%', price: '$175.43', volume: 'High' },
  { asset: 'TSLA', type: 'SELL', confidence: 87.5, change: '-1.8%', price: '$248.92', volume: 'Medium' },
  { asset: 'BTC', type: 'BUY', confidence: 91.3, change: '+5.2%', price: '$43,250', volume: 'Very High' },
  { asset: 'ETH', type: 'HOLD', confidence: 76.8, change: '+0.5%', price: '$2,650', volume: 'Medium' },
  { asset: 'NVDA', type: 'BUY', confidence: 89.7, change: '+3.1%', price: '$875.20', volume: 'High' },
];

const assetAllocation = [
  { name: 'Stocks', value: 45, color: '#8B5CF6', amount: '$6,637' },
  { name: 'Crypto', value: 25, color: '#06B6D4', amount: '$3,687' },
  { name: 'Forex', value: 20, color: '#10B981', amount: '$2,950' },
  { name: 'Commodities', value: 10, color: '#F59E0B', amount: '$1,475' },
];

const recentTrades = [
  { symbol: 'AAPL', action: 'BUY', quantity: 50, price: '$173.25', pnl: '+$247.50', time: '2 min ago', status: 'completed' },
  { symbol: 'TSLA', action: 'SELL', quantity: 25, price: '$251.80', pnl: '+$125.75', time: '15 min ago', status: 'completed' },
  { symbol: 'BTC', action: 'BUY', quantity: 0.5, price: '$42,850', pnl: '+$200.00', time: '1 hour ago', status: 'completed' },
];

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Welcome Section */}
      <div className="flex items-center justify-between bg-gradient-to-r from-card/50 to-accent/5 rounded-2xl p-6 border border-border/50 backdrop-blur-sm">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, Alex!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your portfolio is performing <span className="text-success font-semibold">+2.3%</span> above market today.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-success">Markets Open</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">Account Protected</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="lg"
            className="hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/dashboard/ai-analytics')}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          <Button 
            variant="hero" 
            size="lg"
            className="hover:scale-105 transition-all duration-300 shadow-glow"
            onClick={() => navigate('/dashboard/trading')}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Trading
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/50 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$14,750.00</div>
            <div className="flex items-center text-sm text-success mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +47.5% from last year
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2 mt-3">
              <div className="bg-success h-2 rounded-full w-[75%] animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/50 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Activity className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+$247.85</div>
            <div className="flex items-center text-sm text-success mt-2">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +1.68% today
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last updated: 2 min ago
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/50 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.7%</div>
            <div className="flex items-center text-sm text-primary mt-2">
              <Target className="h-3 w-3 mr-1" />
              Last 30 days
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-warning fill-current" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/50 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <div className="p-2 bg-warning/10 rounded-lg">
              <Zap className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Users className="h-3 w-3 mr-1" />
              8 high confidence
            </div>
            <div className="flex gap-1 mt-2">
              <Badge variant="default" className="text-xs">3 BUY</Badge>
              <Badge variant="destructive" className="text-xs">2 SELL</Badge>
              <Badge variant="secondary" className="text-xs">7 HOLD</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Performance with Benchmark */}
        <Card className="hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Portfolio Performance vs Benchmark
            </CardTitle>
            <CardDescription>
              Your portfolio value compared to S&P 500 over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`, 
                    name === 'value' ? 'Your Portfolio' : 'S&P 500 Benchmark'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Asset Allocation */}
        <Card className="hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-accent" />
              Asset Allocation
            </CardTitle>
            <CardDescription>
              Distribution of your $14,750 portfolio across asset classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.amount})`, 
                    'Allocation'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm font-medium">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{asset.value}%</div>
                    <div className="text-xs text-muted-foreground">{asset.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced AI Signals and Recent Trades */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced AI Signals */}
        <Card className="lg:col-span-2 hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Live AI Signals
              <Badge variant="outline" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-generated trading signals with confidence scores and market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signalsData.map((signal, index) => (
                <div 
                  key={signal.asset} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{signal.asset}</div>
                      <div className="text-xs text-muted-foreground">{signal.price}</div>
                    </div>
                    <Badge 
                      variant={
                        signal.type === 'BUY' ? 'default' : 
                        signal.type === 'SELL' ? 'destructive' : 
                        'secondary'
                      }
                      className="px-3 py-1"
                    >
                      {signal.type}
                    </Badge>
                    <div className="text-center">
                      <div className="text-sm font-medium">{signal.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        signal.change.startsWith('+') ? 'text-success' : 'text-destructive'
                      }`}>
                        {signal.change}
                      </div>
                      <div className="text-xs text-muted-foreground">{signal.volume} vol</div>
                    </div>
                    <Button size="sm" variant="outline" className="hover:scale-105 transition-transform duration-200">
                      Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              Recent Trades
            </CardTitle>
            <CardDescription>
              Your latest trading activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTrades.map((trade, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.action === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                      {trade.action}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {trade.quantity} @ {trade.price}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-success">{trade.pnl}</span>
                  <span className="text-xs text-muted-foreground">{trade.time}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 hover:scale-105 transition-transform duration-200">
              View All Trades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Performance Summary */}
      <Card className="hover:shadow-elegant transition-all duration-300 border-border/50 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Performance Summary
          </CardTitle>
          <CardDescription>
            Your trading performance metrics for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  Win Rate
                </span>
                <span className="text-sm text-muted-foreground">73%</span>
              </div>
              <Progress value={73} className="h-3" />
              <div className="text-xs text-muted-foreground">
                146 wins out of 200 trades
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Profit Factor
                </span>
                <span className="text-sm text-muted-foreground">2.4</span>
              </div>
              <Progress value={80} className="h-3" />
              <div className="text-xs text-muted-foreground">
                Excellent risk-adjusted returns
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  Risk Score
                </span>
                <span className="text-sm text-muted-foreground">Low</span>
              </div>
              <Progress value={25} className="h-3" />
              <div className="text-xs text-muted-foreground">
                Conservative risk management
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
