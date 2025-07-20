# 🚀 Admin Dashboard Startup Script
# Run this script to start the admin dashboard automatically

Write-Host "🔧 Starting IT Community Admin Dashboard..." -ForegroundColor Cyan

# Check if backend is running
Write-Host "📡 Checking backend server..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet
if ($backendRunning) {
    Write-Host "✅ Backend server is running on port 3001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server is not running on port 3001" -ForegroundColor Red
    Write-Host "   Please start the backend first:" -ForegroundColor Yellow
    Write-Host "   cd backend && npm run start:dev" -ForegroundColor Gray
    exit 1
}

# Navigate to admin dashboard directory
$adminDashboardPath = Join-Path $PSScriptRoot "admin-dashboard"
if (Test-Path $adminDashboardPath) {
    Set-Location $adminDashboardPath
    Write-Host "📂 Navigated to admin dashboard directory" -ForegroundColor Green
} else {
    Write-Host "❌ Admin dashboard directory not found: $adminDashboardPath" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "🚀 Starting admin dashboard on http://localhost:8082..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Green
Write-Host "Email: admin@itcommunity.com" -ForegroundColor White
Write-Host "Password: SecureAdmin123!" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev 