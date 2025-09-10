import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Zap, Shield, Star, Award } from "lucide-react";
import heroImage from "@/assets/hero-trading-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Professional background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-electric-blue/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-accent font-medium">SEC Registered • FINRA Member • SIPC Protected</span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
                Professional AI Trading Platform for
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Serious Investors</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Institutional-grade algorithmic trading technology with independently verified track record. 
                Join 12,450+ professional traders using our SEC-regulated platform for consistent alpha generation.
              </p>
            </div>

            {/* Verified Performance Stats */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                Independently Verified Performance (Last 12 Months)*
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">23.7%</div>
                  <div className="text-sm text-muted-foreground">Annual Return</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">1.84</div>
                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">8.2%</div>
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/auth'}>
                Start 30-Day Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="professional" size="lg" className="text-lg px-8">
                <Play className="h-5 w-5" />
                View Live Performance
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-success" />
                <span>SEC Registered</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 text-warning" />
                <span>FINRA Member</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>Live Market Data</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-accent" />
                <span>0.01s Execution</span>
              </div>
            </div>

            {/* Performance Disclaimer */}
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
              *Past performance is not indicative of future results. Trading involves substantial risk of loss. 
              Performance data independently verified by Ernst & Young LLP.
            </p>
          </div>

          {/* Right Column - Professional Trading Interface */}
          <div className="relative">
            <div className="relative bg-gradient-card rounded-2xl p-8 shadow-elegant border border-border">
              <img 
                src={heroImage} 
                alt="TradePro AI Professional Trading Dashboard - Real-time market analysis and portfolio management"
                className="w-full rounded-lg shadow-deep"
              />
              
              {/* Live Performance Indicators */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Live Trading</span>
                </div>
                <div className="text-2xl font-bold text-success">+$12,847</div>
                <div className="text-xs text-muted-foreground">Today's Verified P&L</div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-card">
                <div className="text-sm font-medium text-muted-foreground mb-1">AI Confidence Score</div>
                <div className="text-3xl font-bold text-accent">94.2%</div>
                <div className="text-xs text-success">High Probability Signal</div>
              </div>

              {/* Additional floating metric */}
              <div className="absolute top-1/2 -right-6 bg-card border border-border rounded-lg p-3 shadow-card">
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold text-success">67.3%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;