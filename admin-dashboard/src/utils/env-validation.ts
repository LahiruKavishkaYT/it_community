/**
 * Admin Dashboard Environment Validation
 * Ensures proper API configuration and validates admin-specific settings
 */

interface AdminEnvironmentConfig {
  apiUrl: string;
  useMockData: boolean;
  environment: string;
}

/**
 * Validates and gets admin dashboard environment configuration
 */
export function getAdminEnvironmentConfig(): AdminEnvironmentConfig {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const environment = import.meta.env.MODE || 'development';

  // Validate API URL format
  try {
    new URL(apiUrl);
  } catch (error) {
    throw new Error(`Invalid API URL format: ${apiUrl}`);
  }

  // Production validations
  if (environment === 'production') {
    if (useMockData) {
      console.error('🚨 CRITICAL: Mock data is enabled in production!');
      console.error('   Set VITE_USE_MOCK_DATA=false for production deployment');
      throw new Error('Mock data must be disabled in production');
    }

    if (apiUrl.includes('localhost')) {
      console.error('🚨 CRITICAL: Production build uses localhost API URL!');
      console.error('   Set VITE_API_URL to your production API endpoint');
      throw new Error('Production build cannot use localhost API URL');
    }

    if (!apiUrl.startsWith('https://')) {
      console.warn('⚠️  Production API should use HTTPS for security');
    }
  }

  // Development helpful logging
  if (environment === 'development') {
    console.log('🔧 Admin Dashboard Environment Configuration:', {
      apiUrl,
      useMockData,
      environment
    });
    
    if (useMockData) {
      console.log('📋 Mock data is enabled - using simulated API responses');
    }
  }

  return {
    apiUrl,
    useMockData,
    environment
  };
}

/**
 * Validates admin API connection and permissions
 */
export async function validateAdminApiConnection(apiUrl: string): Promise<{
  isReachable: boolean;
  hasAdminEndpoints: boolean;
}> {
  try {
    // Check if API is reachable
    const healthResponse = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!healthResponse.ok) {
      return { isReachable: false, hasAdminEndpoints: false };
    }

    // Check if admin endpoints exist (without authentication)
    const adminResponse = await fetch(`${apiUrl}/admin/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // We expect 401 (unauthorized) rather than 404 (not found)
    // This means the endpoint exists but requires authentication
    const hasAdminEndpoints = adminResponse.status === 401 || adminResponse.ok;
    
    return { 
      isReachable: true, 
      hasAdminEndpoints 
    };
  } catch (error) {
    console.warn('⚠️  Admin API endpoint validation failed:', error);
    return { isReachable: false, hasAdminEndpoints: false };
  }
}

/**
 * Validates that the environment is properly configured for admin operations
 */
export function validateAdminEnvironment(): void {
  const config = getAdminEnvironmentConfig();
  
  // Critical checks
  if (config.environment === 'production' && config.useMockData) {
    throw new Error('Mock data cannot be enabled in production');
  }
  
  if (config.environment === 'production' && config.apiUrl.includes('localhost')) {
    throw new Error('Production deployment cannot use localhost API');
  }

  console.log('✅ Admin environment validation passed');
} 