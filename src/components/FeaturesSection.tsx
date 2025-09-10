import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  Target, 
  Globe,
  Smartphone,
  BookOpen
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Algorithmic Trading AI",
    description: "Advanced machine learning algorithms analyze market patterns, technical indicators, and order flow to execute profitable trades automatically with 89.3% success rate.",
    highlight: "89.3% Win Rate"
  },
  {
    icon: BarChart3,
    title: "Multi-Asset Portfolio",
    description: "Trade stocks, forex, cryptocurrency, commodities, ETFs, and options with unified portfolio management and cross-asset correlation analysis.",
    highlight: "6 Asset Classes"
  },
  {
    icon: Target,
    title: "Technical Analysis Suite",
    description: "Professional-grade charting tools with 200+ technical indicators, Fibonacci retracements, Elliott Wave analysis, and custom screeners for pattern recognition.",
    highlight: "200+ Indicators"
  },
  {
    icon: Users,
    title: "Copy Trading Network",
    description: "Mirror successful traders' strategies automatically. Follow verified profitable traders with transparent track records and risk metrics.",
    highlight: "Verified Traders"
  },
  {
    icon: Shield,
    title: "Advanced Risk Management",
    description: "Institutional-grade risk controls with dynamic position sizing, correlation limits, VaR calculations, and automated stop-loss management.",
    highlight: "Institutional Grade"
  },
  {
    icon: Zap,
    title: "High-Frequency Execution",
    description: "Ultra-low latency order execution with direct market access (DMA), smart order routing, and sub-millisecond trade execution.",
    highlight: "0.01ms Latency"
  },
  {
    icon: TrendingUp,
    title: "Market Sentiment Analysis",
    description: "Real-time sentiment tracking from news, social media, and options flow. AI-powered market psychology indicators for timing entries and exits.",
    highlight: "Real-Time Sentiment"
  },
  {
    icon: Globe,
    title: "Global Market Access",
    description: "Trade on 150+ international exchanges across all time zones. Access pre-market, after-hours, and extended trading sessions worldwide.",
    highlight: "150+ Exchanges"
  },
  {
    icon: Smartphone,
    title: "Professional Mobile App",
    description: "Full-featured mobile trading platform with advanced order types, real-time charts, push notifications, and biometric security.",
    highlight: "Pro Mobile"
  },
  {
    icon: BookOpen,
    title: "Trading Education Hub",
    description: "Comprehensive trading courses, strategy backtesting, paper trading simulator, and personalized AI coaching to accelerate your learning curve.",
    highlight: "AI Coaching"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-secondary relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Professional Trading Tools for 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Maximum Profits</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access institutional-grade trading technology with advanced analytics, algorithmic strategies, and risk management tools used by professional fund managers and hedge funds.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-primary p-3 rounded-lg group-hover:shadow-glow transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto shadow-card">
            <h3 className="text-2xl font-bold mb-4">Join the Elite Trading Community</h3>
            <p className="text-muted-foreground mb-6">
              Over 125,000 profitable traders use our platform daily. Start your journey to financial freedom with proven strategies and professional tools.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">89.3%</div>
                <div className="text-sm text-muted-foreground">Average Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">$5.8B+</div>
                <div className="text-sm text-muted-foreground">Monthly Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">125K+</div>
                <div className="text-sm text-muted-foreground">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Market Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;