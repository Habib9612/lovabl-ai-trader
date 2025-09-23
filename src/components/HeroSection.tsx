import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Zap, Shield, Star, Award, BarChart3, Brain, Target } from "lucide-react";
import heroImage from "@/assets/hero-trading-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-electric-blue/5" />
      
      {/* Animated floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-bounce" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Enhanced Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Professional Badge with enhanced styling */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-full px-6 py-3 text-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Award className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-accent font-medium">SEC Registered • FINRA Member • SIPC Protected</span>
            </div>

            {/* Enhanced Headline with better typography */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                Professional AI Trading Platform for
                <span className="bg-gradient-primary bg-clip-text text-transparent block mt-2 animate-gradient"> 
                  Serious Investors
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Institutional-grade algorithmic trading technology with independently verified track record. 
                Join <span className="font-semibold text-accent">12,450+</span> professional traders using our SEC-regulated platform for consistent alpha generation.
              </p>
            </div>

            {/* Enhanced Performance Stats with animations */}
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-elegant hover:shadow-deep transition-all duration-500 hover:scale-[1.02]">
              <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-success animate-pulse" />
                Independently Verified Performance (Last 12 Months)*
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-success group-hover:scale-110 transition-transform duration-300">23.7%</div>
                  <div className="text-sm text-muted-foreground mt-1">Annual Return</div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                    <div className="bg-success h-2 rounded-full w-[75%] animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-accent group-hover:scale-110 transition-transform duration-300">1.84</div>
                  <div className="text-sm text-muted-foreground mt-1">Sharpe Ratio</div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                    <div className="bg-accent h-2 rounded-full w-[92%] animate-pulse delay-300"></div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-warning group-hover:scale-110 transition-transform duration-300">8.2%</div>
                  <div className="text-sm text-muted-foreground mt-1">Max Drawdown</div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 mt-2">
                    <div className="bg-warning h-2 rounded-full w-[18%] animate-pulse delay-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-10 py-4 hover:scale-105 transition-all duration-300 shadow-glow hover:shadow-deep group" 
                onClick={() => window.location.href = '/auth'}
              >
                Start 30-Day Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                variant="professional" 
                size="lg" 
                className="text-lg px-10 py-4 hover:scale-105 transition-all duration-300 group"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                View Live Performance
              </Button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-success transition-colors duration-300 group">
                <Shield className="h-5 w-5 text-success group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">SEC Registered</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-warning transition-colors duration-300 group">
                <Star className="h-5 w-5 text-warning group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">FINRA Member</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300 group">
                <TrendingUp className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Live Market Data</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300 group">
                <Zap className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">0.01s Execution</span>
              </div>
            </div>

            {/* Performance Disclaimer */}
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border/50 backdrop-blur-sm">
              *Past performance is not indicative of future results. Trading involves substantial risk of loss. 
              Performance data independently verified by Ernst & Young LLP.
            </p>
          </div>

          {/* Right Column - Enhanced Trading Interface */}
          <div className="relative animate-fade-in-right">
            <div className="relative bg-gradient-card rounded-3xl p-8 shadow-elegant border border-border/50 backdrop-blur-sm hover:shadow-deep transition-all duration-500">
              <img 
                src={heroImage} 
                alt="TradePro AI Professional Trading Dashboard - Real-time market analysis and portfolio management"
                className="w-full rounded-2xl shadow-deep hover:scale-[1.02] transition-transform duration-500"
              />
              
              {/* Enhanced Live Performance Indicators */}
              <div className="absolute -top-6 -left-6 bg-gradient-to-br from-card to-card/90 border border-border/50 rounded-2xl p-6 shadow-elegant backdrop-blur-md hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-success rounded-full animate-pulse shadow-glow"></div>
                  <span className="text-sm font-semibold">Live Trading</span>
                </div>
                <div className="text-3xl font-bold text-success">+$12,847</div>
                <div className="text-xs text-muted-foreground">Today's Verified P&L</div>
                <div className="flex items-center gap-2 mt-2">
                  <BarChart3 className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+2.3% vs S&P 500</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-card to-card/90 border border-border/50 rounded-2xl p-6 shadow-elegant backdrop-blur-md hover:scale-105 transition-all duration-300">
                <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  AI Confidence Score
                </div>
                <div className="text-4xl font-bold text-accent">94.2%</div>
                <div className="text-xs text-success flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  High Probability Signal
                </div>
              </div>

              {/* Additional floating metrics with enhanced design */}
              <div className="absolute top-1/2 -right-8 bg-gradient-to-br from-card to-card/90 border border-border/50 rounded-xl p-4 shadow-card backdrop-blur-md hover:scale-105 transition-all duration-300">
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="text-2xl font-bold text-success">67.3%</div>
                <div className="w-full bg-secondary/50 rounded-full h-1 mt-1">
                  <div className="bg-success h-1 rounded-full w-[67%]"></div>
                </div>
              </div>

              <div className="absolute top-1/4 -left-8 bg-gradient-to-br from-card to-card/90 border border-border/50 rounded-xl p-4 shadow-card backdrop-blur-md hover:scale-105 transition-all duration-300">
                <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-accent">1.84</div>
                <div className="text-xs text-accent">Excellent</div>
              </div>
            </div>

            {/* Floating action buttons */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button size="sm" variant="outline" className="backdrop-blur-md bg-card/80 hover:scale-105 transition-all duration-300">
                <Play className="h-3 w-3 mr-1" />
                Demo
              </Button>
              <Button size="sm" variant="outline" className="backdrop-blur-md bg-card/80 hover:scale-105 transition-all duration-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.2s both;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
