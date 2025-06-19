import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      {user ? (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-900">
            {children}
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