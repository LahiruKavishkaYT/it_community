/**
 * OAuth Configuration Verification Script
 * Run this from the backend directory to check OAuth setup
 */

require('dotenv').config();

console.log('\n🔐 OAuth Configuration Check');
console.log('==============================\n');

// Check required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];

const optionalVars = [
  'FRONTEND_URL',
  'ADMIN_DASHBOARD_URL',
  'PORT',
  'NODE_ENV'
];

let allRequiredSet = true;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const isSet = !!process.env[varName];
  const status = isSet ? '✅ SET' : '❌ NOT SET';
  console.log(`   ${varName}: ${status}`);
  
  if (!isSet) {
    allRequiredSet = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? `✅ ${value}` : '⚠️  NOT SET (using default)';
  console.log(`   ${varName}: ${status}`);
});

console.log('\n🔍 Configuration Analysis:');

// Check JWT Secret strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length < 32) {
    console.log('   ⚠️  JWT_SECRET should be at least 32 characters for security');
  } else {
    console.log('   ✅ JWT_SECRET length is secure');
  }
} else {
  console.log('   ❌ JWT_SECRET is required');
}

// Check Google OAuth
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientId && googleClientSecret) {
  console.log('   ✅ Google OAuth credentials configured');
  console.log(`   📝 Google Client ID: ${googleClientId.substring(0, 20)}...`);
} else {
  console.log('   ❌ Google OAuth credentials missing');
}

// Check GitHub OAuth
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
if (githubClientId && githubClientSecret) {
  console.log('   ✅ GitHub OAuth credentials configured');
  console.log(`   📝 GitHub Client ID: ${githubClientId.substring(0, 20)}...`);
} else {
  console.log('   ❌ GitHub OAuth credentials missing');
}

// Overall status
console.log('\n🎯 Overall Status:');
if (allRequiredSet) {
  console.log('   ✅ All required variables are set!');
  console.log('   🚀 OAuth authentication should work');
  console.log('\n   Next steps:');
  console.log('   1. Start backend: npm run start:dev');
  console.log('   2. Start frontend: cd ../frontend && npm run dev');
  console.log('   3. Test OAuth at: http://localhost:5173/login');
} else {
  console.log('   ❌ Missing required variables');
  console.log('   📖 Please check OAUTH_SETUP_COMPLETE_GUIDE.md for setup instructions');
}

console.log('\n');

// Quick test of OAuth URLs
console.log('🌐 OAuth Callback URLs to configure:');
console.log(`   Google: http://localhost:${process.env.PORT || 3001}/auth/google/callback`);
console.log(`   GitHub: http://localhost:${process.env.PORT || 3001}/auth/github/callback`);
console.log(''); 