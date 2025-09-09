import { Bell, Search, User, Wallet, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="flex h-20 items-center px-8 lg:px-12">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search stocks, analysis, or trading signals..."
              className="pl-12 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-base focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6 ml-8">
          {/* Live Market Status */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-sm font-medium text-green-700">Markets Open</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative w-12 h-12 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500 border-2 border-white">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-xl hover:bg-gray-100 transition-all">
                <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="bg-gradient-primary text-white font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mr-4 mt-2 rounded-xl shadow-xl border-gray-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-base font-semibold leading-none">
                    {user?.user_metadata?.display_name || 'Professional Trader'}
                  </p>
                  <p className="text-sm leading-none text-gray-500">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Pro Plan</Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard/settings')}
                className="mx-2 mb-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              >
                <User className="mr-3 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard/portfolio')}
                className="mx-2 mb-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              >
                <Wallet className="mr-3 h-4 w-4" />
                <span>Portfolio</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard/settings')}
                className="mx-2 mb-1 rounded-lg hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 my-2" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="mx-2 mb-2 rounded-lg hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;