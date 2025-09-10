import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Shield, Target, Eye, Download } from "lucide-react";

const performanceMetrics = [
  {
    metric: "Annual Return",
    value: "23.7%",
    change: "+2.3%",
    period: "12 months",
    status: "positive"
  },
  {
    metric: "Sharpe Ratio",
    value: "1.84",
    change: "+0.12",
    period: "Risk-adjusted",
    status: "positive"
  },
  {
    metric: "Max Drawdown",
    value: "8.2%",
    change: "-1.1%",
    period: "Historical",
    status: "negative"
  },
  {
    metric: "Win Rate",
    value: "67.3%",
    change: "+3.2%",
    period: "Last 1000 trades",
    status: "positive"
  }
];

const PerformanceSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm mb-6">
            <BarChart3 className="h-4 w-4 text-accent" />
            <span className="text-accent font-medium">Verified Track Record</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transparent Performance &
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Verified Results</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our algorithmic trading strategies are independently audited and verified. 
            View real-time performance data, risk metrics, and detailed analytics with full transparency.
          </p>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">
                  {metric.metric}
                </CardDescription>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.status === 'positive' ? 'text-success' : 'text-loss'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {metric.change}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.period}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Performance Dashboard */}
        <div className="bg-gradient-card rounded-2xl border border-border p-8 mb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-success">Live Trading Active</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Real-Time Performance Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Monitor live trading performance, risk metrics, and portfolio allocation 
                with real-time updates every second. All data is independently verified 
                and audited monthly.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Today's P&L</div>
                  <div className="text-2xl font-bold text-success">+$12,847</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Portfolio Value</div>
                  <div className="text-2xl font-bold text-foreground">$2.4M</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" className="flex-1">
                  <Eye className="h-4 w-4" />
                  View Live Dashboard
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="w-full lg:w-1/2">
              <div className="bg-secondary/50 rounded-lg border border-border p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Interactive Performance Chart
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time updates • 5-year history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance & Verification */}
        <div className="text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <span className="font-semibold text-foreground">Third-Party Verified</span>
            </div>
            
            <h3 className="text-xl font-bold mb-4">Independent Performance Audits</h3>
            <p className="text-muted-foreground mb-6">
              All performance data is independently verified by Ernst & Young quarterly. 
              Risk metrics are calculated using industry-standard methodologies and 
              benchmarked against institutional trading firms.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">E&Y</div>
                <div className="text-sm text-muted-foreground">Audit Firm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">SOC 2</div>
                <div className="text-sm text-muted-foreground">Type II</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">ISO</div>
                <div className="text-sm text-muted-foreground">27001 Certified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-4xl mx-auto bg-secondary/50 rounded-lg p-4">
            <strong>Performance Disclaimer:</strong> Past performance is not indicative of future results. 
            Trading involves substantial risk of loss and is not suitable for all investors. 
            Performance figures are net of fees and calculated using GIPS standards. 
            Individual results may vary based on market conditions, strategy allocation, and risk tolerance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;