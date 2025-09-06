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
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold bg-gradient-primary bg-clip-text text-transparent">
              TradePro AI
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigation.map((section, index) => (
            <div key={index}>
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                        isActive 
                          ? "bg-accent text-accent-foreground font-medium" 
                          : "text-muted-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                ))}
              </div>
              {index < navigation.length - 1 && !collapsed && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
              isActive 
                ? "bg-accent text-accent-foreground font-medium" 
                : "text-muted-foreground"
            )
          }
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "px-3"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;