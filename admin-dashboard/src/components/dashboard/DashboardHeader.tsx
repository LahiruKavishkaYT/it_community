import { Bell, Search, User, LogOut, Settings, Shield, Menu, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3); // This would come from a real notification service

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or implement global search
      console.log('Searching for:', searchQuery);
      // You could implement global search across users, projects, events
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600 text-white';
      case 'MODERATOR':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      '/': 'Dashboard Overview',
      '/users': 'User Management',
      '/projects': 'Project Management',
      '/events': 'Event Management',
      '/jobs': 'Job Management',
      '/analytics': 'Analytics & Reports',
      '/admin-settings': 'Admin Settings',
      '/system-settings': 'System Settings'
    };
    return titleMap[path] || 'Admin Dashboard';
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
        <SidebarTrigger 
          className="text-gray-300 hover:text-white" 
          aria-label="Toggle sidebar"
        />
        
        {/* Page Title - Hidden on small screens */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-white truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users, projects, events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
            aria-label="Global search"
          />
        </form>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-300 hover:text-white hover:bg-gray-700 p-2"
          aria-label={`Notifications (${notifications} unread)`}
        >
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center p-0">
              {notifications > 9 ? '9+' : notifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 p-2"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user ? getInitials(user.name) : 'AD'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white truncate max-w-32">
                  {user?.name || 'Admin User'}
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(user?.role || 'ADMIN')}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role || 'ADMIN'}
                  </Badge>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end">
            <DropdownMenuLabel className="text-gray-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs leading-none text-gray-400">
                  {user?.email || 'admin@itcommunity.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem 
              className="text-gray-300 hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate('/admin-settings')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-gray-300 hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate('/system-settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem 
              className="text-red-400 hover:bg-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
