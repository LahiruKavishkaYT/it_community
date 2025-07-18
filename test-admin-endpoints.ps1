#!/usr/bin/env pwsh
# Test Admin Dashboard Endpoints

Write-Host "Testing IT Community Admin Endpoints..." -ForegroundColor Green

# Admin login
Write-Host "Testing admin login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@itcommunity.com","password":"admin123"}'
    
    if ($loginResponse.user.role -eq "ADMIN") {
        Write-Host "Admin login successful" -ForegroundColor Green
        $headers = @{"Authorization" = "Bearer " + $loginResponse.access_token}
    } else {
        Write-Host "User is not an admin" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Admin login failed: $_" -ForegroundColor Red
    exit 1
}

# Test admin endpoints
$endpoints = @(
    @{name="Users"; url="/admin/users"},
    @{name="User Analytics"; url="/admin/analytics/users"},
    @{name="Content Analytics"; url="/admin/analytics/content"},
    @{name="System Health"; url="/admin/system/health"},
    @{name="Dashboard Overview"; url="/admin/dashboard/overview"},
    @{name="Projects"; url="/admin/projects"},
    @{name="Events"; url="/admin/events"},
    @{name="Jobs"; url="/admin/jobs"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing $($endpoint.name)..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001$($endpoint.url)" -Method GET -Headers $headers
        Write-Host "$($endpoint.name) - Success" -ForegroundColor Green
    } catch {
        Write-Host "$($endpoint.name) - Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Admin endpoint testing completed!" -ForegroundColor Green
Write-Host "Admin Dashboard URL: http://localhost:5174" -ForegroundColor Cyan
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@itcommunity.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White 