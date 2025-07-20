import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Code, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../../services/api';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    if (user) {
      getNotifications().then(setNotifications).catch(error => {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      });
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
      if (showMobileNav && !target.closest('.mobile-nav')) {
        setShowMobileNav(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown, showMobileNav]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileNav(false);
  };

  const handleMobileNavToggle = () => {
    setShowMobileNav(!showMobileNav);
  };

  // Public navigation for unauthenticated users
  const PublicNavigation = () => (
    <nav className="hidden lg:flex space-x-6">
      <Link
        to="/projects"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Projects
      </Link>
      <Link
        to="/events"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Events
      </Link>
      <Link
        to="/jobs"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Jobs
      </Link>
      <Link
        to="/career-path"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Career Paths
      </Link>
    </nav>
  );

  // Authenticated navigation for logged-in users
  const AuthenticatedNavigation = () => (
    <nav className="hidden lg:flex space-x-6">
      <Link
        to="/dashboard"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Dashboard
      </Link>
      <Link
        to="/projects"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Projects
      </Link>
      <Link
        to="/events"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Events
      </Link>
      <Link
        to="/jobs"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Jobs
      </Link>
      <Link
        to="/career-path"
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Career Path
      </Link>
    </nav>
  );

  // Mobile navigation menu
  const MobileNavigation = () => (
    <div className={`mobile-nav absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-700 shadow-lg lg:hidden transition-all duration-300 ${
      showMobileNav ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      <div className="px-4 py-6 space-y-4">
        {!user ? (
          // Public mobile navigation
          <>
            <Link
              to="/projects"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Projects
            </Link>
            <Link
              to="/events"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Events
            </Link>
            <Link
              to="/jobs"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Jobs
            </Link>
            <Link
              to="/career-path"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Career Paths
            </Link>
            <div className="pt-4 border-t border-gray-700">
              <Link
                to="/login"
                className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors mb-4"
                onClick={() => setShowMobileNav(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-base font-medium transition-colors text-center"
                onClick={() => setShowMobileNav(false)}
              >
                Join Now
              </Link>
            </div>
          </>
        ) : (
          // Authenticated mobile navigation
          <>
            <Link
              to="/dashboard"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Projects
            </Link>
            <Link
              to="/events"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Events
            </Link>
            <Link
              to="/jobs"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Jobs
            </Link>
            <Link
              to="/career-path"
              className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors"
              onClick={() => setShowMobileNav(false)}
            >
              Career Path
            </Link>
            <div className="pt-4 border-t border-gray-700">
              <Link
                to="/profile"
                className="block text-gray-300 hover:text-blue-400 py-2 text-base font-medium transition-colors mb-4"
                onClick={() => setShowMobileNav(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-400 hover:text-red-300 py-2 text-base font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button (only for authenticated users) */}
            {user && (
              <button
                onClick={onMenuToggle}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}

            {/* Logo */}
            <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white hidden sm:block">ITCommunity</span>
              <span className="text-lg font-bold text-white sm:hidden">IT</span>
            </Link>
          </div>

          {/* Center navigation */}
          <div className="flex-1 flex justify-center">
            {user ? <AuthenticatedNavigation /> : <PublicNavigation />}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative notification-dropdown">
                  <button
                    className="relative flex items-center justify-center p-2 hover:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    onClick={() => setShowDropdown(v => !v)}
                    aria-label={`Notifications (${unreadCount} unread)`}
                  >
                    <Bell className="h-5 w-5 text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 shadow-lg rounded-lg z-50">
                      <div className="p-3 border-b border-gray-700 font-semibold text-white">Notifications</div>
                      <ul className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 && (
                          <li className="p-4 text-gray-400 text-center">No notifications</li>
                        )}
                        {notifications.map(n => (
                          <li
                            key={n.id}
                            className={`p-3 border-b border-gray-700 cursor-pointer transition-colors ${n.isRead ? 'bg-gray-800 hover:bg-gray-750' : 'bg-blue-900/20 hover:bg-blue-900/30 font-medium'}`}
                            onClick={() => handleNotificationClick(n.id)}
                          >
                            <div className="text-sm text-white">{n.title}</div>
                            <div className="text-xs text-gray-400">{n.message}</div>
                            <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* User profile - desktop only */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <img
                      className="h-8 w-8 rounded-full ring-2 ring-gray-700"
                      src={user.avatar}
                      alt={user.name}
                    />
                    <span className="hidden lg:block text-sm font-medium truncate max-w-24">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link
                  to="/login"
                  className="hidden sm:block text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span className="hidden sm:inline">Join Now</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle (for non-authenticated users) */}
            {!user && (
              <button
                onClick={handleMobileNavToggle}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {showMobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileNavigation />
    </header>
  );
};

export default Header;