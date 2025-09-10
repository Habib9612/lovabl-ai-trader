import { Card, CardContent } from "@/components/ui/card";
import { Star, Verified, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Portfolio Manager",
    company: "Apex Capital",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b4aa?w=100&h=100&fit=crop&crop=face",
    quote: "Increased our fund's alpha by 340 basis points in the first year. The AI's pattern recognition capabilities are extraordinary.",
    performance: "+34.2% annual return",
    verified: true,
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Quantitative Trader",
    company: "Goldman Sachs",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    quote: "The risk management algorithms caught patterns our team missed. Reduced max drawdown from 15% to 6.2% while maintaining returns.",
    performance: "Risk-adjusted returns +89%",
    verified: true,
    rating: 5
  },
  {
    name: "Jennifer Rodriguez",
    role: "Day Trader",
    company: "Independent",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    quote: "Transformed my trading completely. The AI's entry and exit signals have a 73% success rate on my EUR/USD strategies.",
    performance: "73% win rate improvement",
    verified: true,
    rating: 5
  }
];

const caseStudies = [
  {
    title: "Hedge Fund Alpha Generation",
    description: "How Meridian Capital increased returns by 340 bps",
    metrics: ["34.2% Annual Return", "6.2% Max Drawdown", "2.1 Sharpe Ratio"],
    badge: "Institutional Client"
  },
  {
    title: "Forex Trading Optimization",
    description: "Independent trader's journey from break-even to profitable",
    metrics: ["73% Win Rate", "+127% ROI", "8.9% Monthly Return"],
    badge: "Retail Success"
  },
  {
    title: "Multi-Asset Portfolio Management",
    description: "Family office diversification with AI-driven allocation",
    metrics: ["24.7% Return", "12.3% Volatility", "1.8 Calmar Ratio"],
    badge: "Private Wealth"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm mb-6">
            <Verified className="h-4 w-4 text-accent" />
            <span className="text-accent font-medium">Verified Client Results</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Professional Traders</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From independent day traders to institutional portfolio managers, 
            see how our AI trading platform delivers consistent results across all market conditions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning-amber text-warning-amber" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                {/* Performance Metric */}
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-6">
                  <div className="text-sm font-medium text-success">
                    Performance Result
                  </div>
                  <div className="text-lg font-bold text-success">
                    {testimonial.performance}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {testimonial.name}
                      </span>
                      {testimonial.verified && (
                        <Verified className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case Studies */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center mb-8">
            Detailed Case Studies
          </h3>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-card transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {study.badge}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  
                  <h4 className="text-lg font-bold mb-2">{study.title}</h4>
                  <p className="text-muted-foreground mb-4">{study.description}</p>
                  
                  <div className="space-y-2">
                    {study.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {metric.split(' ')[0]} {metric.split(' ')[1]}
                        </span>
                        <span className="font-semibold text-success">
                          {metric.split(' ').slice(2).join(' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Join 12,450+ Successful Traders</h3>
            <p className="text-muted-foreground mb-6">
              Start your 30-day free trial and discover why professional traders 
              choose our AI-powered platform for consistent results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                View More Case Studies
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              No credit card required • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;