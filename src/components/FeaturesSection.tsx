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
    title: "Advanced AI Engine",
    description: "Our proprietary AI analyzes 10,000+ data points per second with 98.7% accuracy, far exceeding human capabilities.",
    highlight: "98.7% Accuracy"
  },
  {
    icon: BarChart3,
    title: "Multi-Asset Trading",
    description: "Trade stocks, crypto, forex, commodities, and options all from one unified platform with real-time data.",
    highlight: "5 Asset Classes"
  },
  {
    icon: Target,
    title: "Pattern Recognition",
    description: "Identify complex market patterns and trends that human traders often miss, giving you a significant edge.",
    highlight: "1000+ Patterns"
  },
  {
    icon: Users,
    title: "Social Trading",
    description: "Follow and copy trades from successful traders, or share your own strategies with the community.",
    highlight: "Top Traders"
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Advanced risk assessment tools with automated stop-losses and position sizing based on your risk tolerance.",
    highlight: "Auto Protection"
  },
  {
    icon: Zap,
    title: "Lightning Execution",
    description: "Execute trades in milliseconds with our high-frequency trading infrastructure and direct market access.",
    highlight: "<1ms Latency"
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "Machine learning models predict market movements with unprecedented accuracy using sentiment analysis.",
    highlight: "Future Insights"
  },
  {
    icon: Globe,
    title: "Global Markets",
    description: "Access 100+ global exchanges and markets 24/7 with real-time data and instant execution capabilities.",
    highlight: "24/7 Trading"
  },
  {
    icon: Smartphone,
    title: "Mobile Trading",
    description: "Trade on-the-go with our native mobile apps featuring full functionality and offline capabilities.",
    highlight: "iOS & Android"
  },
  {
    icon: BookOpen,
    title: "AI-Powered Education",
    description: "Personalized learning paths and real-time coaching from our AI to improve your trading skills.",
    highlight: "Smart Learning"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gradient-secondary relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Features that set us 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> apart</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of trading with our comprehensive suite of AI-powered tools and features designed to maximize your success.
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
            <h3 className="text-2xl font-bold mb-4">Ready to experience the future of trading?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of successful traders who have already discovered the power of AI-driven trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">98.7%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">$2.4B+</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;