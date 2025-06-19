import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code, Bell, User, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

          {user && (
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
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
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