import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
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
  Eye,
  Zap
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
    title: 'Smart Analysis',
    items: [
      { name: 'Smart Trade Analytics', href: '/dashboard/ai-analytics', icon: Brain },
      { name: 'Trading Signals', href: '/dashboard/signals', icon: Zap },
      { name: 'Watchlist', href: '/dashboard/watchlist', icon: Eye },
    ]
  },
  {
    title: 'Community & Learning',
    items: [
      { name: 'Community', href: '/dashboard/community', icon: Users },
      { name: 'Education', href: '/dashboard/education', icon: BookOpen },
    ]
  }
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';

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
    <Sidebar className="border-r-0 shadow-xl">
      <SidebarHeader className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-white">TradePro AI</h1>
              <p className="text-xs text-slate-300">Smart Trading Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900">
        <div className="p-4 space-y-6">
          {navigation.map((section, index) => {
            const hasActiveItem = section.items.some(item => isActive(item.href));
            
            return (
              <SidebarGroup key={index}>
                {!collapsed && (
                  <SidebarGroupLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative",
                                isActive 
                                  ? "bg-gradient-primary text-white shadow-lg shadow-blue-500/25" 
                                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-700 p-4 bg-slate-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )
                }
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-medium",
                  collapsed && "px-4"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
