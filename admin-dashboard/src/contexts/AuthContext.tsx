import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, User, isAuthenticated, APIError } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (action: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission mapping based on user roles
const PERMISSIONS = {
  ADMIN: [
    'users.read',
    'users.update',
    'users.delete',
    'users.suspend',
    'content.read',
    'content.delete',
    'content.moderate',
    'analytics.read',
    'system.read',
    'system.update',
  ],
  MODERATOR: [
    'users.read',
    'content.read',
    'content.delete',
    'content.moderate',
    'analytics.read',
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token might be invalid, clear it
          localStorage.removeItem('admin_token');
          console.warn('Invalid token, cleared from storage');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.name}`,
      });
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'ADMIN') {
      return PERMISSIONS.ADMIN.includes(action);
    }

    // Other roles have limited permissions
    return false;
  };

  const refreshUser = async (): Promise<void> => {
    if (!isAuthenticated()) return;

    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Failed to refresh user:', error);
      // Don't clear user on refresh failure to avoid flashing
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, hasPermission, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  return AuthenticatedComponent;
}; 