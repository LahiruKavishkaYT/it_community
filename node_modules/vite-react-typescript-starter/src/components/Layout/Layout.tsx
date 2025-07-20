import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Add error boundary for auth context
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.warn('Auth context not available, rendering layout without auth');
  }

  const isMobile = useIsMobile();

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onMenuToggle={handleSidebarToggle} 
        isMobileMenuOpen={isSidebarOpen}
      />
      {user ? (
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={handleSidebarClose} 
          />
          <main className={`flex-1 p-4 md:p-6 bg-gray-900 transition-all duration-300 ${
            !isMobile ? 'md:ml-0' : ''
          }`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      ) : (
        <main className="bg-gray-900">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;