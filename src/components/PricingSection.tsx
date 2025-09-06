import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for beginners to explore AI trading",
    features: [
      "Basic chart analysis",
      "Limited AI insights (10/day)",
      "Paper trading simulator",
      "Community access",
      "Basic educational content",
      "Mobile app access"
    ],
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    popular: false,
    icon: Star
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/month",
    description: "For serious traders ready to leverage AI",
    features: [
      "Full AI analysis suite",
      "Real-time market data",
      "Advanced charting tools",
      "Risk management tools",
      "Pattern recognition",
      "Social trading features",
      "Priority support",
      "Advanced education"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "hero" as const,
    popular: true,
    icon: Zap
  },
  {
    name: "Premium",
    price: "$99.99",
    period: "/month",
    description: "For professional traders and institutions",
    features: [
      "Everything in Pro",
      "Unlimited AI insights",
      "Custom algorithms",
      "API access",
      "Dedicated account manager",
      "Advanced analytics",
      "White-label options",
      "Priority execution",
      "Custom integrations"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "success" as const,
    popular: false,
    icon: Crown
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, transparent 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your trading goals. All plans include our core AI features with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-card border-border hover:shadow-card transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-primary shadow-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    plan.popular ? 'bg-gradient-primary' : 'bg-secondary'
                  }`}>
                    <plan.icon className={`h-6 w-6 ${
                      plan.popular ? 'text-primary-foreground' : 'text-foreground'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full" 
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto shadow-card">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              All plans come with a 7-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg">
                View FAQ
              </Button>
              <Button variant="ghost" size="lg">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;