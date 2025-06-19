import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on role
    const mockUser: User = {
      id: '1',
      name: role === 'student' ? 'Alex Chen' : role === 'professional' ? 'Sarah Johnson' : 'TechCorp Inc.',
      email,
      role,
      avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
      bio: role === 'student' 
        ? 'Computer Science student passionate about web development and AI'
        : role === 'professional'
        ? 'Full-stack developer with 3+ years experience in React and Node.js'
        : 'Leading tech company specializing in innovative software solutions',
      skills: role !== 'company' ? ['JavaScript', 'React', 'Node.js', 'Python'] : undefined,
      company: role === 'professional' ? 'TechStart Inc.' : undefined,
      location: 'San Francisco, CA'
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};