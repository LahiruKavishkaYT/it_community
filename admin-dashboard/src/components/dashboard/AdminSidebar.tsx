import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  FolderOpen,
  Calendar,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Settings,
  Shield,
  Home,
  ChevronDown,
  ChevronRight,
  Activity,
  Database,
  Code
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home, description: "Overview & metrics" },
  { title: "Users", url: "/users", icon: Users, description: "Manage community members" },
  { title: "Projects", url: "/projects", icon: FolderOpen, description: "Student & professional projects" },
  { title: "Events", url: "/events", icon: Calendar, description: "Workshops & networking events" },
  { title: "Jobs & Internships", url: "/jobs", icon: Briefcase, description: "Career opportunities" },
  { title: "Suggestions", url: "/suggestions", icon: MessageSquare, description: "Community feedback & suggestions" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Platform insights" },
];

const adminNavItems = [
  { title: "Admin Settings", url: "/admin-settings", icon: Shield, description: "User roles & permissions" },
  { title: "System Settings", url: "/system-settings", icon: Settings, description: "Platform configuration" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [adminSectionOpen, setAdminSectionOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 group";
    return isActive(path)
      ? `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25`
      : `${baseClasses} text-gray-300 hover:bg-gray-750 hover:text-white hover:shadow-md`;
  };

  const getActiveIndicator = (path: string) => {
    if (!isActive(path)) return null;
    return (
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
    );
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={getNavClassName(item.url)}
          title={isCollapsed ? item.title : undefined}
        >
          {getActiveIndicator(item.url)}
          <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} transition-transform duration-200 group-hover:scale-110`} />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block leading-tight">{item.title}</span>
              <span className="text-xs opacity-75 truncate block mt-0.5 leading-tight">{item.description}</span>
            </div>
          )}
          {isActive(item.url) && !isCollapsed && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} bg-gray-800 border-r border-gray-700 transition-all duration-300`}>
      <SidebarContent className="overflow-hidden">
        {/* Header */}
        <div className={`p-4 border-b border-gray-700 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  ITCommunity
                </h2>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-400">Admin Dashboard</p>
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs border-blue-500/30">
                    {user?.role || 'ADMIN'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">System Healthy</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <Activity className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className={`text-gray-400 text-xs font-semibold uppercase tracking-wider ${isCollapsed ? 'px-2' : 'px-4'} py-3`}>
            {isCollapsed ? "MAIN" : "Main Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={`space-y-2 ${isCollapsed ? 'px-1' : 'px-2'} pb-4`}>
              {mainNavItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        {!isCollapsed ? (
          <div className="mx-4 border-t border-gray-700/30 my-2"></div>
        ) : (
          <div className="mx-2 border-t border-gray-700/30 my-3"></div>
        )}

        {/* Administration */}
        <SidebarGroup className="mt-4">
          <Collapsible open={adminSectionOpen} onOpenChange={setAdminSectionOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel 
                className={`text-gray-400 text-xs font-semibold uppercase tracking-wider ${isCollapsed ? 'px-2' : 'px-4'} py-3 cursor-pointer hover:text-gray-300 transition-colors flex items-center justify-between group`}
              >
                <span>{isCollapsed ? "ADMIN" : "Administration"}</span>
                {!isCollapsed && (
                  <div className="transition-transform duration-200 group-hover:scale-110">
                    {adminSectionOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </div>
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className={`space-y-2 ${isCollapsed ? 'px-1' : 'px-2'} pb-4`}>
                  {adminNavItems.map((item) => (
                    <NavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Footer */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-gray-700/50">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                Platform Version 2.1.0
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Database className="w-3 h-3" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
