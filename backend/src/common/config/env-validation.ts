/**
 * Environment Variable Validation
 * Ensures all required environment variables are set for production deployment
 */

interface RequiredEnvVars {
  DATABASE_URL: string;
  JWT_SECRET: string;
}

interface OptionalEnvVars {
  NODE_ENV?: string;
  PORT?: string;
  FRONTEND_URL?: string;
  ADMIN_DASHBOARD_URL?: string;
  ADMIN_PASSWORD?: string;
  JWT_EXPIRATION?: string;
  ALLOWED_ORIGINS?: string;
}

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function validateEnvironmentVariables(): void {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check for production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    // Additional production requirements
    const productionRequiredVars = ['FRONTEND_URL', 'ADMIN_DASHBOARD_URL', 'ALLOWED_ORIGINS'];
    
    for (const varName of productionRequiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    // Check for weak JWT secret in production
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters in production');
    }

    // Check for default admin password
    if (!process.env.ADMIN_PASSWORD) {
      warnings.push('ADMIN_PASSWORD not set - using default password (security risk)');
    }
  }

  // Handle missing variables
  if (missingVars.length > 0) {
    console.error('\n🚨 ENVIRONMENT VALIDATION FAILED');
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please set these variables in your .env file or environment');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Handle warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  ENVIRONMENT WARNINGS:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  // Success message
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Environment validation passed');
    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 Production environment detected - enhanced security checks applied');
    }
  }
}

/**
 * Gets validated environment configuration
 */
export function getValidatedConfig(): RequiredEnvVars & OptionalEnvVars {
  validateEnvironmentVariables();

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || '3001',
    FRONTEND_URL: process.env.FRONTEND_URL,
    ADMIN_DASHBOARD_URL: process.env.ADMIN_DASHBOARD_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
}

/**
 * Validates that a JWT secret is secure
 */
export function validateJWTSecret(secret: string): boolean {
  if (secret.length < 32) {
    return false;
  }
  
  // Check for common weak secrets
  const weakSecrets = [
    'your-secret-key',
    'default-secret-key',
    'secret',
    'jwt-secret',
    'mysecret'
  ];
  
  return !weakSecrets.includes(secret.toLowerCase());
} 