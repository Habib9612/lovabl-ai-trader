import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Zap, Shield, Star, Award, BarChart3, Brain, Target, Bot, Cpu, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      
      {/* Animated floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-bounce" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Enhanced Content */}
          <div className="space-y-8 animate-fade-in">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-6 py-3 text-sm backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Bot className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-blue-400 font-medium">Powered by Advanced AI • Real-time Analysis • 24/7 Trading</span>
            </div>

            {/* Enhanced Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                AI-Powered Trading
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block mt-2 animate-gradient"> 
                  Revolution
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl leading-relaxed">
                Experience the future of trading with our advanced AI agents. Omnara-powered intelligence, 
                real-time market analysis, and autonomous trading strategies that adapt to market conditions.
              </p>
            </div>

            {/* AI Performance Stats */}
            <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
              <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                Live AI Performance Metrics
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">94.2%</div>
                  <div className="text-sm text-slate-400 mt-1">AI Accuracy</div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                    <div className="bg-green-400 h-2 rounded-full w-[94%] animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-300">5</div>
                  <div className="text-sm text-slate-400 mt-1">Active Agents</div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                    <div className="bg-blue-400 h-2 rounded-full w-[100%] animate-pulse delay-300"></div>
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-300">0.01s</div>
                  <div className="text-sm text-slate-400 mt-1">Response Time</div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                    <div className="bg-purple-400 h-2 rounded-full w-[95%] animate-pulse delay-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 group" 
                onClick={() => navigate('/auth')}
              >
                Start AI Trading Now
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:scale-105 transition-all duration-300 group"
                onClick={() => navigate('/dashboard')}
              >
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                View Live Dashboard
              </Button>
            </div>

            {/* AI Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="flex items-center gap-3 text-slate-400 hover:text-blue-400 transition-colors duration-300 group">
                <Brain className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Neural Networks</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 hover:text-purple-400 transition-colors duration-300 group">
                <Bot className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">AI Agents</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 hover:text-green-400 transition-colors duration-300 group">
                <Activity className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors duration-300 group">
                <Zap className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Auto Execution</span>
              </div>
            </div>
          </div>

          {/* Right Column - AI Trading Dashboard */}
          <div className="relative animate-fade-in-right">
            <div className="relative bg-slate-800/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:shadow-blue-500/20 transition-all duration-500">
              {/* AI Dashboard Mockup */}
              <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    AI Trading Dashboard
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                </div>

                {/* AI Agents Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">Trading Analyst</span>
                    </div>
                    <div className="text-white font-bold">Active</div>
                    <div className="text-green-400 text-sm">+2.3% today</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 text-sm">Portfolio Manager</span>
                    </div>
                    <div className="text-white font-bold">Optimizing</div>
                    <div className="text-blue-400 text-sm">Risk: Low</div>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">AI Market Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">AAPL</span>
                      <span className="text-green-400">BUY • 94% confidence</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">TSLA</span>
                      <span className="text-yellow-400">HOLD • 76% confidence</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">NVDA</span>
                      <span className="text-green-400">BUY • 89% confidence</span>
                    </div>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Portfolio Performance</h4>
                  <div className="h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded flex items-end justify-between px-2">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-gradient-to-t from-blue-500 to-green-400 rounded-t w-4 animate-pulse" 
                        style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating AI Metrics */}
              <div className="absolute -top-6 -left-6 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm font-semibold text-white">AI Trading Active</span>
                </div>
                <div className="text-3xl font-bold text-green-400">+$24,567</div>
                <div className="text-xs text-slate-400">Today's AI-Generated Profit</div>
                <div className="flex items-center gap-2 mt-2">
                  <BarChart3 className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">+4.7% vs Market</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  AI Processing Power
                </div>
                <div className="text-4xl font-bold text-blue-400">2.4THz</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Neural Network Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>{`
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
