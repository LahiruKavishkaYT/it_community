#!/usr/bin/env pwsh
# IT Community Database Setup Script

Write-Host "🚀 Setting up IT Community Database..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found in backend directory!" -ForegroundColor Red
    Write-Host "Please ensure you have created the .env file with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green

# Generate Prisma client
Write-Host "📦 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Push database schema
Write-Host "🗄️  Pushing database schema..." -ForegroundColor Yellow
npx prisma db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    exit 1
}

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
node scripts/seed-users.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
Write-Host "🔑 Admin credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@itcommunity.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host "📚 API Documentation: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "🚀 Start backend: npm run start:dev" -ForegroundColor Cyan 