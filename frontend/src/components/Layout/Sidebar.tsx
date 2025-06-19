import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Briefcase,
  Map,
  User,
  Users,
  Building2,
  GraduationCap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/projects', icon: FolderOpen, label: 'Projects' },
      { path: '/events', icon: Calendar, label: 'Events' },
      { path: '/jobs', icon: Briefcase, label: 'Jobs' },
      { path: '/career-path', icon: Map, label: 'Career Path' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];

    // Add role-specific items
    if (user.role === 'company') {
      return [
        ...baseItems.slice(0, 1), // Dashboard
        { path: '/talent', icon: Users, label: 'Find Talent' },
        ...baseItems.slice(1), // Rest of items
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-gray-800 shadow-sm border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="flex-shrink-0">
            {user.role === 'student' && <GraduationCap className="h-8 w-8 text-blue-400" />}
            {user.role === 'professional' && <Users className="h-8 w-8 text-purple-400" />}
            {user.role === 'company' && <Building2 className="h-8 w-8 text-green-400" />}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;