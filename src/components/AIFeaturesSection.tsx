import { Bot, Brain, Target, TrendingUp, Shield, Zap, Activity, Cpu, BarChart3, Eye, Lightbulb, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIFeaturesSection = () => {
  const features = [
    {
      icon: <Bot className="h-8 w-8 text-blue-400" />,
      title: "AI Trading Agents",
      description: "Deploy specialized AI agents for different trading strategies. Each agent learns and adapts to market conditions in real-time.",
      capabilities: ["Trading Analyst", "Portfolio Manager", "Risk Manager", "Sentiment Analyst", "Technical Analyst"],
      color: "blue"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-400" />,
      title: "Neural Network Analysis",
      description: "Advanced deep learning models analyze market patterns, news sentiment, and technical indicators simultaneously.",
      capabilities: ["Pattern Recognition", "Sentiment Analysis", "Predictive Modeling", "Risk Assessment"],
      color: "purple"
    },
    {
      icon: <Activity className="h-8 w-8 text-green-400" />,
      title: "Real-time Processing",
      description: "Process thousands of market signals per second with sub-millisecond latency for optimal trade execution.",
      capabilities: ["Live Market Data", "Instant Execution", "Real-time Alerts", "Continuous Learning"],
      color: "green"
    },
    {
      icon: <Target className="h-8 w-8 text-cyan-400" />,
      title: "Precision Trading",
      description: "AI-powered precision targeting with 94.2% accuracy rate and intelligent position sizing algorithms.",
      capabilities: ["Smart Entry/Exit", "Position Sizing", "Stop Loss Optimization", "Profit Taking"],
      color: "cyan"
    },
    {
      icon: <Shield className="h-8 w-8 text-yellow-400" />,
      title: "Risk Management",
      description: "Advanced risk management AI that monitors portfolio exposure and adjusts positions automatically.",
      capabilities: ["Portfolio Protection", "Drawdown Control", "Volatility Management", "Correlation Analysis"],
      color: "yellow"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-orange-400" />,
      title: "Market Intelligence",
      description: "AI-driven market intelligence that processes news, social media, and economic data for trading insights.",
      capabilities: ["News Analysis", "Social Sentiment", "Economic Indicators", "Market Trends"],
      color: "orange"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 text-sm backdrop-blur-sm mb-6">
            <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-blue-400 font-medium">Powered by Advanced AI Technology</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI-Powered Trading
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Intelligence
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of trading with our suite of AI agents and neural networks. 
            Each component works together to create a comprehensive trading ecosystem.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-400 mb-3">Key Capabilities:</h4>
                {feature.capabilities.map((capability, capIndex) => (
                  <div key={capIndex} className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-${feature.color}-400 rounded-full`} />
                    <span className="text-sm text-slate-300">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Performance Dashboard */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              Live AI Performance Metrics
            </h3>
            <p className="text-slate-300">Real-time performance data from our AI trading systems</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-slate-900/60 rounded-2xl p-6 hover:bg-slate-900/80 transition-all duration-300 group-hover:scale-105">
                <div className="text-3xl font-bold text-green-400 mb-2">94.2%</div>
                <div className="text-slate-400 text-sm mb-3">AI Prediction Accuracy</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full w-[94%] animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-slate-900/60 rounded-2xl p-6 hover:bg-slate-900/80 transition-all duration-300 group-hover:scale-105">
                <div className="text-3xl font-bold text-blue-400 mb-2">2.4ms</div>
                <div className="text-slate-400 text-sm mb-3">Average Response Time</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full w-[98%] animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-slate-900/60 rounded-2xl p-6 hover:bg-slate-900/80 transition-all duration-300 group-hover:scale-105">
                <div className="text-3xl font-bold text-purple-400 mb-2">1,247</div>
                <div className="text-slate-400 text-sm mb-3">Active AI Agents</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full w-[85%] animate-pulse delay-400"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-slate-900/60 rounded-2xl p-6 hover:bg-slate-900/80 transition-all duration-300 group-hover:scale-105">
                <div className="text-3xl font-bold text-cyan-400 mb-2">$2.4B</div>
                <div className="text-slate-400 text-sm mb-3">Assets Under Management</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full w-[92%] animate-pulse delay-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Types */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">Meet Your AI Trading Team</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: "Trading Analyst", icon: <TrendingUp className="h-6 w-6" />, color: "blue", description: "Market analysis & signals" },
              { name: "Portfolio Manager", icon: <BarChart3 className="h-6 w-6" />, color: "purple", description: "Asset allocation & optimization" },
              { name: "Risk Manager", icon: <Shield className="h-6 w-6" />, color: "yellow", description: "Risk assessment & control" },
              { name: "Sentiment Analyst", icon: <Eye className="h-6 w-6" />, color: "green", description: "News & social sentiment" },
              { name: "Technical Analyst", icon: <Activity className="h-6 w-6" />, color: "cyan", description: "Chart patterns & indicators" }
            ].map((agent, index) => (
              <div key={index} className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 group">
                <div className={`w-16 h-16 bg-${agent.color}-500/10 border border-${agent.color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-${agent.color}-400`}>
                    {agent.icon}
                  </div>
                </div>
                <h4 className="text-white font-semibold mb-2">{agent.name}</h4>
                <p className="text-slate-400 text-sm">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12 backdrop-blur-md">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Experience AI Trading?
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who are already using our AI-powered platform to maximize their returns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Start Free Trial
                <Bot className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:scale-105 transition-all duration-300"
              >
                <Settings className="h-5 w-5 mr-2" />
                Customize AI Agents
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;
