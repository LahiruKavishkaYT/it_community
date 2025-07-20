# 🔐 OAuth Authentication Setup Guide

## 🚨 **Current Issues Resolved:**

✅ **OAuth strategies re-enabled in backend**  
✅ **Comprehensive setup instructions provided**  
✅ **Frontend OAuth implementation verified**  

## 📋 **Quick Setup Checklist:**

- [ ] Configure Google OAuth App
- [ ] Configure GitHub OAuth App  
- [ ] Update backend `.env` file
- [ ] Test OAuth authentication
- [ ] Verify database schema

---

## 🔧 **Step 1: Backend Environment Configuration**

### Create/Update `backend/.env` file with these variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/it_community_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-at-least-32-characters"
JWT_EXPIRATION="24h"

# Server Configuration
PORT=3001
NODE_ENV="development"

# Frontend URLs for CORS
FRONTEND_URL="http://localhost:5173"
ADMIN_DASHBOARD_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# GitHub OAuth Configuration  
GITHUB_CLIENT_ID="your-github-client-id-here"
GITHUB_CLIENT_SECRET="your-github-client-secret-here"
```

---

## 🔵 **Step 2: Google OAuth Setup**

### 2.1 Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Project name**: "IT Community Platform"

### 2.2 Enable Google+ API

1. Navigate to **APIs & Services > Library**
2. Search for **"Google+ API"**
3. Click **Enable**

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **"External"** user type
3. Fill required fields:
   - **App name**: IT Community Platform
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. **Save and Continue**

### 2.4 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Configure settings:
   - **Name**: IT Community Platform
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
5. **Create** and copy your credentials:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

## 🐙 **Step 3: GitHub OAuth Setup**

### 3.1 Create GitHub OAuth App

1. **Go to [GitHub Developer Settings](https://github.com/settings/developers)**
2. Click **"OAuth Apps" > "New OAuth App"**
3. Fill in details:
   - **Application name**: IT Community Platform
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
4. **Register application**

### 3.2 Generate Client Secret

1. After creating app, click **"Generate a new client secret"**
2. Copy your credentials:
   - **Client ID** → `GITHUB_CLIENT_ID`
   - **Client Secret** → `GITHUB_CLIENT_SECRET`

---

## 🗃️ **Step 4: Database Schema Verification**

### Verify OAuth fields exist in User table:

```sql
-- Check if OAuth columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('googleId', 'githubId', 'provider');
```

### If OAuth fields are missing, run migration:

```bash
cd backend
npx prisma migrate dev --name add_oauth_fields
npx prisma generate
```

---

## 🧪 **Step 5: Test OAuth Authentication**

### 5.1 Start Services

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 5.2 Test OAuth Flow

1. **Open**: `http://localhost:5173/login`
2. **Click**: Google or GitHub login button
3. **Verify**: OAuth provider redirects properly
4. **Check**: User creation in database
5. **Confirm**: Dashboard access after login

### 5.3 Debug OAuth Issues

**Backend Logs**: Check console for OAuth configuration status:
```
Google OAuth Configuration: { clientID: 'Set', clientSecret: 'Set' }
GitHub OAuth Configuration: { clientID: 'Set', clientSecret: 'Set' }
```

**Frontend Browser**: Check Network tab for OAuth requests:
- `GET /auth/google` → Should redirect to Google
- `GET /auth/github` → Should redirect to GitHub
- `GET /auth/callback?access_token=...` → Should redirect to dashboard

---

## 🚨 **Common Issues & Solutions**

### ❌ **Issue 1: "redirect_uri_mismatch"**
**Cause**: OAuth app callback URL doesn't match  
**Solution**: Verify exact URLs in OAuth apps:
- Google: `http://localhost:3001/auth/google/callback`
- GitHub: `http://localhost:3001/auth/github/callback`

### ❌ **Issue 2: "OAuth Configuration: Not set"**
**Cause**: Environment variables not loaded  
**Solution**: 
- Verify `.env` file exists in `backend/` directory
- Restart backend server after adding variables
- Check for typos in variable names

### ❌ **Issue 3: CORS Error**
**Cause**: Frontend URL not allowed in CORS  
**Solution**: Verify `FRONTEND_URL` in `.env` matches frontend dev server

### ❌ **Issue 4: "Cannot find module" Error**
**Cause**: OAuth strategies not properly imported  
**Solution**: Restart backend server (already fixed in auth.module.ts)

### ❌ **Issue 5: Database OAuth Fields Missing**
**Cause**: Migration not run or schema outdated  
**Solution**: Run Prisma migration and generate client

---

## 🔐 **Security Best Practices**

### For Development:
- ✅ Use `http://localhost` URLs in OAuth apps
- ✅ Keep OAuth secrets in `.env` file (gitignored)
- ✅ Use strong JWT_SECRET (32+ characters)

### For Production:
- 🔒 Use HTTPS URLs only
- 🔒 Set secure environment variables
- 🔒 Configure proper CORS origins
- 🔒 Enable OAuth app domain verification

---

## 🆘 **Need Help?**

### Debug Commands:

```bash
# Check environment variables are loaded
cd backend
node -e "require('dotenv').config(); console.log('Google:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');"

# Test OAuth endpoints directly
curl -I http://localhost:3001/auth/google
curl -I http://localhost:3001/auth/github

# Check database OAuth fields
cd backend
npx prisma studio
```

### Verification Checklist:

- [ ] Backend starts without errors
- [ ] OAuth endpoints return 302 redirects
- [ ] Google/GitHub OAuth apps configured correctly
- [ ] Database has OAuth fields (googleId, githubId, provider)
- [ ] Frontend OAuth buttons trigger authentication flow
- [ ] Users can complete OAuth login successfully

---

## ✅ **Expected Results**

After completing setup:

1. **Login page** displays Google and GitHub buttons
2. **Clicking OAuth buttons** redirects to provider auth
3. **After authorization** user is redirected to dashboard
4. **Database** contains OAuth user with provider data
5. **Subsequent logins** work seamlessly

Your OAuth authentication should now be fully functional! 🎉 