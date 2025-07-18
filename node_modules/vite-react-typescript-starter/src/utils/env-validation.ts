/**
 * Frontend Environment Validation
 * Ensures proper API configuration for the community application
 */

interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
}

/**
 * Validates and gets environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const environment = import.meta.env.MODE || 'development';

  // Validate API URL format
  try {
    new URL(apiUrl);
  } catch (error) {
    throw new Error(`Invalid API URL format: ${apiUrl}`);
  }

  // Production validations
  if (environment === 'production') {
    if (apiUrl.includes('localhost')) {
      console.warn('⚠️  Production build detected with localhost API URL');
      console.warn('   Make sure to set VITE_API_URL to your production API endpoint');
    }

    if (!apiUrl.startsWith('https://')) {
      console.warn('⚠️  Production API should use HTTPS');
    }
  }

  // Development helpful logging
  if (environment === 'development') {
    console.log('🔧 Frontend Environment Configuration:', {
      apiUrl,
      environment
    });
  }

  return {
    apiUrl,
    environment
  };
}

/**
 * Validates that the API endpoint is reachable
 */
export async function validateApiConnection(apiUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('⚠️  API endpoint not reachable:', apiUrl);
    return false;
  }
} 