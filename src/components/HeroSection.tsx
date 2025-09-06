import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-trading-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">98.7% Prediction Accuracy</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Trade with
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Superhuman </span>
                Intelligence
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Leverage our advanced AI to analyze markets, identify opportunities, and execute trades with unparalleled precision. Join thousands of successful traders already using TradePro AI.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.4B+</div>
                <div className="text-sm text-muted-foreground">Volume Traded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">147%</div>
                <div className="text-sm text-muted-foreground">Avg Returns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">50K+</div>
                <div className="text-sm text-muted-foreground">Active Traders</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/auth'}>
                Start 7-Day Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="glass" size="lg" className="text-lg px-8">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-secondary rounded-2xl p-8 shadow-card">
              <img 
                src={heroImage} 
                alt="TradePro AI Dashboard - Advanced trading interface with real-time analytics"
                className="w-full rounded-lg shadow-glow"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-lg p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Trading</span>
                </div>
                <div className="text-2xl font-bold text-success">+$12,847</div>
                <div className="text-xs text-muted-foreground">Today's P&L</div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-lg p-4 shadow-card">
                <div className="text-sm font-medium text-muted-foreground">AI Confidence</div>
                <div className="text-2xl font-bold text-primary">94.2%</div>
                <div className="text-xs text-success">High Probability Trade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;