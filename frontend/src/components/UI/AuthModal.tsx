import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  feature: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  action,
  feature
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Sign in required
              </h2>
              <p className="text-gray-300">
                To {action} {feature}, please sign in to your account or create a new one.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Link to="/login" onClick={onClose}>
                <Button className="w-full flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              
              <Link to="/signup" onClick={onClose}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Join our community to access all features and connect with other tech enthusiasts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal; 