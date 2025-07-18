import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OAuthService } from '../services/oauth.service';
import { Code } from 'lucide-react';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Check if this is an OAuth callback
        if (!OAuthService.isOAuthCallback()) {
          throw new Error('Not a valid OAuth callback');
        }

        // Parse callback data
        const callbackData = OAuthService.parseCallbackData();
        
        if (!callbackData) {
          throw new Error('Failed to parse OAuth callback data');
        }

        // Handle OAuth callback through auth context
        handleOAuthCallback(callbackData);

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        OAuthService.handleOAuthError(error instanceof Error ? error.message : 'Unknown error');
        navigate('/login?error=oauth_callback_failed', { replace: true });
      }
    };

    processOAuthCallback();
  }, [navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Code className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In...</h2>
        <p className="text-gray-400">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
