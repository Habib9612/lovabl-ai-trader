import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Home, 
  TrendingUp, 
  Wallet, 
  Brain, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Zap,
  Target,
  Shield,
  Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Portfolio', href: '/dashboard/portfolio', icon: Wallet },
      { name: 'Trading', href: '/dashboard/trading', icon: TrendingUp },
    ]
  },
  {
    title: 'AI Tools',
    items: [
      { name: 'AI Analytics', href: '/dashboard/ai-analytics', icon: Brain },
      { name: 'Pattern Recognition', href: '/dashboard/patterns', icon: Target },
      { name: 'Signals', href: '/dashboard/signals', icon: Zap },
    ]
  },
  {
    title: 'Social',
    items: [
      { name: 'Community', href: '/dashboard/community', icon: Users },
      { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: TrendingUp },
    ]
  },
  {
    title: 'Learning',
    items: [
      { name: 'Education', href: '/dashboard/education', icon: BookOpen },
      { name: 'Risk Management', href: '/dashboard/risk', icon: Shield },
    ]
  },
  {
    title: 'Markets',
    items: [
      { name: 'Watchlist', href: '/dashboard/watchlist', icon: Eye },
      { name: 'Global Markets', href: '/dashboard/markets', icon: Globe },
    ]
  }
];

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar = ({ className }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    }
  };

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-xl transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-primary">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TradePro AI</h1>
              <p className="text-xs text-white/80">Professional Trading</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/20 ml-auto"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-8">
          {navigation.map((section, index) => (
            <div key={index}>
              {!collapsed && (
                <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  {section.title}
                </h3>
              )}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 group relative",
                        isActive 
                          ? "bg-gradient-primary text-white shadow-lg" 
                          : "text-gray-700 hover-scale"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        <div className="w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              {index < navigation.length - 1 && !collapsed && (
                <Separator className="my-6 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-200",
              isActive 
                ? "bg-gray-200 text-gray-900" 
                : "text-gray-600"
            )
          }
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium",
            collapsed && "px-4"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;