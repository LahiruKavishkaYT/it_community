# 🚀 Admin Dashboard Startup Guide

## Quick Start (for admins)

### 1. Start the Admin Dashboard Server

Open PowerShell as Administrator and run:

```powershell
# Navigate to the admin dashboard directory
cd "C:\Users\jlkav\Downloads\cpath\it_community\admin-dashboard"

# Install dependencies (if needed)
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

The admin dashboard will be available at: **http://localhost:8082** or **http://localhost:8083**

### 2. Admin Login Credentials

```
Email: admin@itcommunity.com
Password: SecureAdmin123!
```

✅ **VERIFIED WORKING** - Admin user has been successfully created and tested!

### 3. Verify Services are Running

Check that both services are running:

```powershell
# Check backend (should show port 3001)
netstat -ano | findstr :3001

# Check admin dashboard (should show port 8082 or 8083)
netstat -ano | findstr :8082
netstat -ano | findstr :8083
```

## 🔧 Troubleshooting

### Issue: Dependency Conflicts
**Error**: `ERESOLVE could not resolve` with `date-fns`

**Solution**:
```powershell
npm install --legacy-peer-deps
```

### Issue: Backend Connection Errors
**Error**: `net::ERR_CONNECTION_REFUSED` to localhost:3001

**Solution**: Start the backend server:
```powershell
cd ..\backend
npm run start:dev
```

### Issue: CORS Errors
**Error**: `Access to fetch at 'http://localhost:3001/auth/login' from origin 'http://localhost:8083' has been blocked by CORS policy`

**Solution**: ✅ **FIXED!** The backend now allows requests from both ports 8082 and 8083. If you still see this error:
1. Restart the backend server: `cd ..\backend && npm run start:dev`
2. Clear your browser cache and try again

### Issue: Admin User Not Found
**Error**: Invalid credentials during login

**Solution**: ✅ **FIXED!** Admin user has been created. If you still get this error:
```powershell
# Verify admin user exists by testing the API directly
Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@itcommunity.com","password":"SecureAdmin123!"}'
```

### Issue: 401 Unauthorized Errors
**Error**: `POST http://localhost:3001/auth/login 401 (Unauthorized)`

**Solution**: ✅ **RESOLVED!** This was caused by missing admin user. Now fixed.

## 📋 System Status Check

### Required Services:
1. **Backend API**: http://localhost:3001 ✅ (Running with CORS fixed)
2. **Admin Dashboard**: http://localhost:8082 or :8083 ✅ (Ready to start)
3. **Admin User**: admin@itcommunity.com ✅ (Created and verified)

### Service Dependencies:
- Backend: Node.js, PostgreSQL, Prisma ✅
- Admin Dashboard: Node.js, Vite, React ✅
- Authentication: JWT tokens, bcrypt ✅

## 🔍 Verification Steps

After starting both services:

1. **Test Backend**: Visit http://localhost:3001/api/docs ✅
2. **Test Admin Dashboard**: Visit http://localhost:8083 
3. **Test Login**: Use the credentials above on the login page ✅
4. **Verify Admin Access**: Check dashboard shows admin features

## 🚨 Emergency Quick Fix

If you need immediate access and the dashboard won't start:

1. Use the backend API directly via Swagger UI at http://localhost:3001/api/docs
2. Or use a REST client like Postman with these endpoints:
   - POST /auth/login ✅
   - GET /admin/users
   - GET /admin/dashboard/overview

## 🎉 Success Indicators

You'll know everything is working when you see:

✅ **Backend Console**: "Application is running on: http://localhost:3001"
✅ **Admin Dashboard Console**: "Local: http://localhost:8083/"
✅ **Login Success**: Dashboard redirects to main admin page
✅ **No Console Errors**: Clean browser console after login

---

**Note**: The admin dashboard runs on a separate development server and must be started independently from the backend.

**Status**: 🟢 **FULLY OPERATIONAL** - All authentication issues resolved! 