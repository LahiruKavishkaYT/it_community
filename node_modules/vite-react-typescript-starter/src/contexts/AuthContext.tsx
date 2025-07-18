import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, OAuthCallbackData } from '../types';
import * as api from '../services/api';
import { OAuthService } from '../services/oauth.service';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  handleOAuthCallback: (callbackData: OAuthCallbackData) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate the hook to avoid Fast Refresh issues
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token by fetching user profile
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    }
  };

  const login = async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    
    try {
      const data = await api.login(email, password);
      
      // Store token and user data
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => {
    OAuthService.loginWithGoogle();
  };

  const loginWithGitHub = () => {
    OAuthService.loginWithGitHub();
  };

  const handleOAuthCallback = (callbackData: OAuthCallbackData) => {
    // Store token and user data from OAuth
    localStorage.setItem('token', callbackData.access_token);
    if (callbackData.refresh_token) {
      localStorage.setItem('refresh_token', callbackData.refresh_token);
    }
    setUser(callbackData.user);
    
    // Clear callback parameters from URL
    OAuthService.clearCallbackParams();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      loginWithGitHub, 
      handleOAuthCallback, 
      logout, 
      updateUser, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };