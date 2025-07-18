# OAuth Setup and Implementation Guide

## Overview

This guide provides step-by-step instructions for setting up and configuring Google and GitHub OAuth authentication for the IT Community Platform. The OAuth implementation allows users to sign in seamlessly using their existing Google or GitHub accounts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [OAuth Provider Setup](#oauth-provider-setup)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing OAuth Flow](#testing-oauth-flow)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

## Prerequisites

Before setting up OAuth authentication, ensure you have:

- **Google Developer Account**: Access to Google Cloud Console
- **GitHub Developer Account**: Access to GitHub Developer Settings
- **Backend Server**: Running on `http://localhost:3001`
- **Frontend Application**: Running on `http://localhost:5173`
- **Database**: PostgreSQL with Prisma migrations applied

## OAuth Provider Setup

### Google OAuth Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API

2. **Configure OAuth Consent Screen**
   - Navigate to APIs & Services > OAuth consent screen
   - Choose "External" user type (for testing)
   - Fill in required fields:
     - App name: "IT Community Platform"
     - User support email: Your email
     - Developer contact email: Your email

3. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > OAuth 2.0 Client ID
   - Choose "Web application"
   - Configure redirect URIs:
     - `http://localhost:3001/auth/google/callback`
   - Note down your Client ID and Client Secret

### GitHub OAuth Setup

1. **Create a GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the application details:
     - Application name: "IT Community Platform"
     - Homepage URL: `http://localhost:5173`
     - Authorization callback URL: `http://localhost:3001/auth/github/callback`

2. **Generate Client Secret**
   - After creating the app, generate a new client secret
   - Note down your Client ID and Client Secret

## Backend Configuration

### 1. Environment Variables

Create or update your `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_community_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Frontend URL for OAuth redirects
FRONTEND_URL="http://localhost:5173"

# Server Configuration
PORT=3001
NODE_ENV="development"
```

### 2. Install OAuth Dependencies

Ensure these packages are installed in your backend:

```bash
npm install passport-google-oauth20 passport-github2
npm install --save-dev @types/passport-google-oauth20 @types/passport-github2
```

### 3. Database Schema Updates

The User model has been updated to support OAuth fields:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?  // Optional for OAuth users
  name      String
  role      UserRole @default(STUDENT)
  avatar    String?
  bio       String?
  skills    String[]
  company   String?
  location  String?
  
  // OAuth Integration
  googleId  String?  @unique
  githubId  String?  @unique
  provider  String?  // 'local', 'google', 'github'
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  projects        Project[]
  events          Event[]
  jobs            Job[]
  eventRegistrations EventRegistration[]
  jobApplications JobApplication[]
  activities      Activity[]
  feedback        ProjectFeedback[]
  jobBookmarks    JobBookmark[]
}
```

Run the migration to update your database:

```bash
npx prisma migrate dev --name add_oauth_fields
npx prisma generate
```

### 4. OAuth Strategy Implementation

#### Google Strategy (`src/auth/strategies/google.strategy.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    const oauthUser = {
      googleId: id,
      email: emails[0]?.value,
      name: `${name.givenName} ${name.familyName}`,
      avatar: photos[0]?.value,
      provider: 'google',
    };

    try {
      const user = await this.authService.validateOAuthUser(oauthUser);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
```

#### GitHub Strategy (`src/auth/strategies/github.strategy.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { username, emails, photos, id } = profile;
    
    const oauthUser = {
      githubId: id,
      email: emails[0]?.value,
      name: profile.displayName || username,
      avatar: photos[0]?.value,
      provider: 'github',
    };

    try {
      const user = await this.authService.validateOAuthUser(oauthUser);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
```

### 5. OAuth Guards

#### Google OAuth Guard (`src/auth/guards/google-oauth.guard.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {}
```

#### GitHub OAuth Guard (`src/auth/guards/github-oauth.guard.ts`)

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GitHubOAuthGuard extends AuthGuard('github') {}
```

### 6. OAuth Endpoints

The following endpoints are available in `AuthController`:

```typescript
// Google OAuth endpoints
@Get('google')
@UseGuards(GoogleOAuthGuard)
async googleAuth() {
  // This endpoint initiates Google OAuth flow
}

@Get('google/callback')
@UseGuards(GoogleOAuthGuard)
async googleAuthCallback(@Request() req: any, @Response() res: any) {
  const result = req.user;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  // Redirect to frontend with tokens in query params
  const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
  
  return res.redirect(redirectUrl);
}

// GitHub OAuth endpoints
@Get('github')
@UseGuards(GitHubOAuthGuard)
async githubAuth() {
  // This endpoint initiates GitHub OAuth flow
}

@Get('github/callback')
@UseGuards(GitHubOAuthGuard)
async githubAuthCallback(@Request() req: any, @Response() res: any) {
  const result = req.user;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  // Redirect to frontend with tokens in query params
  const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
  
  return res.redirect(redirectUrl);
}
```

## Frontend Configuration

### 1. OAuth Service

Create `src/services/oauth.service.ts`:

```typescript
import { OAuthProvider, OAuthCallbackData } from '../types';

export class OAuthService {
  private static readonly BASE_URL = 'http://localhost:3001';

  static initiateOAuth(provider: OAuthProvider): void {
    const oauthUrl = `${this.BASE_URL}/auth/${provider}`;
    window.location.href = oauthUrl;
  }

  static loginWithGoogle(): void {
    this.initiateOAuth('google');
  }

  static loginWithGitHub(): void {
    this.initiateOAuth('github');
  }

  static parseCallbackData(): OAuthCallbackData | null {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const userParam = urlParams.get('user');

    if (!accessToken || !refreshToken || !userParam) {
      return null;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
      };
    } catch (error) {
      console.error('Error parsing OAuth callback data:', error);
      return null;
    }
  }

  static isOAuthCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return !!(
      urlParams.get('access_token') &&
      urlParams.get('refresh_token') &&
      urlParams.get('user')
    );
  }

  static clearCallbackParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('access_token');
    url.searchParams.delete('refresh_token');
    url.searchParams.delete('user');
    window.history.replaceState({}, document.title, url.pathname);
  }

  static handleOAuthError(errorMessage: string): void {
    console.error('OAuth error:', errorMessage);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
}
```

### 2. OAuth Callback Page

Create `src/pages/OAuthCallbackPage.tsx`:

```tsx
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
```

### 3. Update Auth Context

Update `src/contexts/AuthContext.tsx` to include OAuth methods:

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  handleOAuthCallback: (callbackData: OAuthCallbackData) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
};
```

### 4. Update Routes

Add the OAuth callback route to your `App.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

function App() {
  return (
    <Routes>
      {/* Other routes */}
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      {/* Other routes */}
    </Routes>
  );
}
```

### 5. Update Login and Signup Pages

Add OAuth buttons to your login and signup pages:

```tsx
// In LoginPage.tsx or SignupPage.tsx
const { loginWithGoogle, loginWithGitHub } = useAuth();

// Add these buttons to your form
<div className="mt-6 grid grid-cols-2 gap-3">
  <button
    type="button"
    onClick={loginWithGoogle}
    className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      {/* Google icon SVG */}
    </svg>
    <span className="ml-2">Google</span>
  </button>

  <button
    type="button"
    onClick={loginWithGitHub}
    className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      {/* GitHub icon SVG */}
    </svg>
    <span className="ml-2">GitHub</span>
  </button>
</div>
```

## Testing OAuth Flow

### 1. Start Both Servers

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Test OAuth Flow

1. **Navigate to Login Page**: Go to `http://localhost:5173/login`
2. **Click OAuth Button**: Click either "Google" or "GitHub" button
3. **OAuth Provider Auth**: Complete authentication on Google/GitHub
4. **Callback Processing**: You'll be redirected to `/auth/callback`
5. **Dashboard Redirect**: Finally redirected to dashboard with user logged in

### 3. Verify User Creation

Check your database to confirm OAuth users are created with:
- `googleId` or `githubId` populated
- `provider` field set to 'google' or 'github'
- `password` field as null (OAuth users don't need passwords)

## Troubleshooting

### Common Issues

#### 1. OAuth Redirect URI Mismatch
**Error**: `redirect_uri_mismatch`
**Solution**: Ensure OAuth app callback URLs match exactly:
- Google: `http://localhost:3001/auth/google/callback`
- GitHub: `http://localhost:3001/auth/github/callback`

#### 2. Environment Variables Not Loading
**Error**: OAuth credentials not found
**Solution**: 
- Verify `.env` file is in backend root directory
- Restart the backend server after adding variables
- Check for typos in variable names

#### 3. CORS Issues
**Error**: CORS policy blocks OAuth requests
**Solution**: Ensure `main.ts` CORS configuration includes your frontend URL:

```typescript
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
});
```

#### 4. Frontend Callback Parsing Errors
**Error**: Failed to parse OAuth callback data
**Solution**: 
- Check browser developer tools for URL parameter format
- Verify `OAuthService.parseCallbackData()` implementation
- Check for URL encoding issues

### Debugging Steps

1. **Check OAuth Provider Configuration**:
   ```bash
   # Test OAuth endpoints directly
   curl http://localhost:3001/auth/google
   curl http://localhost:3001/auth/github
   ```

2. **Verify Environment Variables**:
   ```typescript
   // Add to your strategy constructor for debugging
   console.log('OAuth Configuration:', {
     clientID: clientID ? 'Set' : 'Not set',
     clientSecret: clientSecret ? 'Set' : 'Not set',
   });
   ```

3. **Check Database User Creation**:
   ```sql
   -- Verify OAuth users in database
   SELECT id, email, name, provider, "googleId", "githubId" 
   FROM "User" 
   WHERE provider IN ('google', 'github');
   ```

4. **Frontend Console Logs**:
   - Check browser console for OAuth callback data
   - Verify token storage in localStorage
   - Monitor AuthContext state changes

## Security Considerations

### Production Security

1. **Environment Variables**:
   - Never commit OAuth secrets to version control
   - Use secure secret management in production
   - Rotate OAuth secrets regularly

2. **HTTPS Requirements**:
   - OAuth providers require HTTPS in production
   - Update callback URLs to use HTTPS
   - Implement SSL/TLS certificates

3. **OAuth App Configuration**:
   - Restrict OAuth app domains to your production domain
   - Enable only necessary OAuth scopes
   - Monitor OAuth usage and logs

4. **JWT Security**:
   - Use strong JWT secrets (32+ characters)
   - Implement JWT token expiration
   - Consider implementing refresh token rotation

### Development Security

1. **Local Testing**:
   - Use separate OAuth apps for development
   - Never use production OAuth credentials locally
   - Regularly clean up test OAuth apps

2. **Data Privacy**:
   - Only request necessary OAuth scopes
   - Inform users about data collection
   - Implement data retention policies

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication)
- [React Context API Guide](https://reactjs.org/docs/context.html)

## Support

If you encounter issues with OAuth setup:

1. Check this guide for common solutions
2. Review OAuth provider documentation
3. Check GitHub issues for known problems
4. Contact the development team for assistance

---

This completes the OAuth setup and implementation guide for the IT Community Platform. The OAuth integration provides a seamless authentication experience while maintaining security best practices.
