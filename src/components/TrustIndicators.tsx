import { Shield, Award, TrendingUp, Users, Clock, Lock } from "lucide-react";

const trustIndicators = [
  {
    icon: Shield,
    text: "SEC Registered",
    subtext: "Regulated & Compliant"
  },
  {
    icon: Award,
    text: "FINRA Member",
    subtext: "Industry Certified"
  },
  {
    icon: Lock,
    text: "SIPC Protected",
    subtext: "Up to $500K Coverage"
  },
  {
    icon: TrendingUp,
    text: "Live Market Data",
    subtext: "Real-Time Feeds"
  },
  {
    icon: Clock,
    text: "0.01s Execution",
    subtext: "Ultra-Low Latency"
  },
  {
    icon: Users,
    text: "12,450+ Traders",
    subtext: "Verified Active Users"
  }
];

const TrustIndicators = () => {
  return (
    <section className="py-12 bg-gradient-secondary border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Trusted by Professional Traders Worldwide
          </h3>
          <p className="text-sm text-muted-foreground">
            Regulated, secure, and compliant trading platform
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trustIndicators.map((indicator, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="bg-card border border-border rounded-lg p-4 mb-3 group-hover:shadow-card transition-all duration-300">
                <indicator.icon className="h-6 w-6 text-accent mx-auto" />
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                {indicator.text}
              </div>
              <div className="text-xs text-muted-foreground">
                {indicator.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Risk Disclosure */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-4xl mx-auto">
            <strong>Risk Disclosure:</strong> Trading securities and derivatives involves substantial risk of loss. 
            Past performance is not indicative of future results. TradePro AI is a registered investment advisor. 
            All content is for informational purposes only and should not be considered investment advice.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;