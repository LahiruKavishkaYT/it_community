import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code, Bell, User, LogOut } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../../services/api';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(notifications => notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Public navigation for unauthenticated users
  const PublicNavigation = () => (
    <nav className="hidden md:flex space-x-8">
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
    <nav className="hidden md:flex space-x-8">
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

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">ITCommunity</span>
            </Link>
          </div>

          {/* Dynamic navigation based on authentication state */}
          {user ? <AuthenticatedNavigation /> : <PublicNavigation />}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative ml-4">
                  <button
                    className="relative flex items-center justify-center p-2 hover:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowDropdown(v => !v)}
                    aria-label={`Notifications (${unreadCount} unread)`}
                  >
                    <Bell className="h-5 w-5 text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1.5 py-0.5 leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
                      <div className="p-2 border-b font-bold">Notifications</div>
                      <ul className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 && <li className="p-4 text-gray-500">No notifications</li>}
                        {notifications.map(n => (
                          <li
                            key={n.id}
                            className={`p-3 border-b cursor-pointer ${n.isRead ? 'bg-gray-100' : 'bg-blue-50 font-semibold'}`}
                            onClick={() => handleNotificationClick(n.id)}
                          >
                            <div className="text-sm">{n.title}</div>
                            <div className="text-xs text-gray-500">{n.message}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <img
                      className="h-8 w-8 rounded-full ring-2 ring-gray-700"
                      src={user.avatar}
                      alt={user.name}
                    />
                    <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;