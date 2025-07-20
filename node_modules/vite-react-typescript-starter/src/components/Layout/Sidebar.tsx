import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Briefcase,
  Map,
  User,
  Users,
  Building2,
  GraduationCap,
  FileText,
  MessageSquare,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Close sidebar when route changes on mobile
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location.pathname, isMobile, isOpen, onClose]);

  useEffect(() => {
    // Handle body scroll lock for mobile overlay
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

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
    if (user.role === 'STUDENT') {
      return [
        ...baseItems.slice(0, 4), // Dashboard, Projects, Events, Jobs
        { path: '/my-feedback', icon: MessageSquare, label: 'My Feedback' },
        ...baseItems.slice(4), // Career Path, Profile
      ];
    }

    if (user.role === 'COMPANY' || user.role === 'PROFESSIONAL') {
      return [
        ...baseItems.slice(0, 4), // Dashboard, Projects, Events, Jobs
        { path: '/job-applications', icon: FileText, label: 'Job Applications' },
        ...baseItems.slice(4), // Career Path, Profile
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gray-800 border-r border-gray-700">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {user.role === 'STUDENT' && <GraduationCap className="h-6 w-6 text-blue-400" />}
            {user.role === 'PROFESSIONAL' && <Users className="h-6 w-6 text-purple-400" />}
            {user.role === 'COMPANY' && <Building2 className="h-6 w-6 text-green-400" />}
            <span className="text-lg font-semibold text-white">Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* User Info */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="flex-shrink-0">
            {user.role === 'STUDENT' && <GraduationCap className="h-8 w-8 text-blue-400" />}
            {user.role === 'PROFESSIONAL' && <Users className="h-8 w-8 text-purple-400" />}
            {user.role === 'COMPANY' && <Building2 className="h-8 w-8 text-green-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-xs text-gray-500">ITCommunity Platform</div>
          <div className="text-xs text-gray-400 mt-1">v2.1.0</div>
        </div>
      </div>
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside 
      className={`hidden md:block w-64 min-h-screen transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;