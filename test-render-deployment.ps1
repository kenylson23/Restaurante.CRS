# =========================================================
# RENDER BACKEND DEPLOYMENT TESTING SCRIPT
# =========================================================

Write-Host "LAS TORTILLAS BACKEND - DEPLOYMENT TESTING" -ForegroundColor Blue
Write-Host "Testing deployed backend on Render..." -ForegroundColor Blue
Write-Host ""

# Backend URLs to test
$renderUrl = "https://las-tortillas-backend.onrender.com"
$healthEndpoint = "$renderUrl/api/health"

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$Timeout = 30
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec $Timeout
        Write-Host "OK: $Description - Response received" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "FAILED: $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host ""
}

# Function to test with curl as fallback
function Test-EndpointCurl {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testing with curl: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $result = curl -s -w "%{http_code}" -o temp_response.json $Url
        $httpCode = $result
        
        if ($httpCode -eq "200") {
            $response = Get-Content "temp_response.json" -Raw
            Write-Host "OK: $Description - HTTP $httpCode" -ForegroundColor Green
            Write-Host "Response: $response" -ForegroundColor Cyan
            Remove-Item "temp_response.json" -ErrorAction SilentlyContinue
            return $true
        } else {
            Write-Host "FAILED: $Description - HTTP $httpCode" -ForegroundColor Red
            Remove-Item "temp_response.json" -ErrorAction SilentlyContinue
            return $false
        }
    }
    catch {
        Write-Host "FAILED: $Description - Curl error" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Remove-Item "temp_response.json" -ErrorAction SilentlyContinue
        return $false
    }
    Write-Host ""
}

# Start testing
Write-Host "BACKEND DEPLOYMENT TESTS" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host ""

$allTestsPassed = $true

# Test 1: Health Check Endpoint
Write-Host "TEST 1: Health Check Endpoint" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan
$healthTest = Test-Endpoint -Url $healthEndpoint -Description "Health Check" -Timeout 60

if (-not $healthTest) {
    Write-Host "Trying with curl as fallback..." -ForegroundColor Yellow
    $healthTest = Test-EndpointCurl -Url $healthEndpoint -Description "Health Check (curl)"
}

if (-not $healthTest) {
    $allTestsPassed = $false
    Write-Host "CRITICAL: Health check failed - deployment may not be ready" -ForegroundColor Red
} else {
    Write-Host "SUCCESS: Health check passed!" -ForegroundColor Green
}
Write-Host ""

# Test 2: Menu Items Endpoint
Write-Host "TEST 2: Menu Items Endpoint" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan
$menuTest = Test-Endpoint -Url "$renderUrl/api/menu-items" -Description "Menu Items" -Timeout 30

if (-not $menuTest) {
    Write-Host "Trying with curl as fallback..." -ForegroundColor Yellow
    $menuTest = Test-EndpointCurl -Url "$renderUrl/api/menu-items" -Description "Menu Items (curl)"
}

if (-not $menuTest) {
    Write-Host "WARNING: Menu items endpoint failed" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Menu items endpoint working!" -ForegroundColor Green
}
Write-Host ""

# Test 3: Tables Endpoint
Write-Host "TEST 3: Tables Endpoint" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan
$tablesTest = Test-Endpoint -Url "$renderUrl/api/tables" -Description "Tables" -Timeout 30

if (-not $tablesTest) {
    Write-Host "Trying with curl as fallback..." -ForegroundColor Yellow
    $tablesTest = Test-EndpointCurl -Url "$renderUrl/api/tables" -Description "Tables (curl)"
}

if (-not $tablesTest) {
    Write-Host "WARNING: Tables endpoint failed" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Tables endpoint working!" -ForegroundColor Green
}
Write-Host ""

# Test 4: Orders Endpoint
Write-Host "TEST 4: Orders Endpoint" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan
$ordersTest = Test-Endpoint -Url "$renderUrl/api/orders" -Description "Orders" -Timeout 30

if (-not $ordersTest) {
    Write-Host "Trying with curl as fallback..." -ForegroundColor Yellow
    $ordersTest = Test-EndpointCurl -Url "$renderUrl/api/orders" -Description "Orders (curl)"
}

if (-not $ordersTest) {
    Write-Host "WARNING: Orders endpoint failed" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Orders endpoint working!" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "DEPLOYMENT TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
Write-Host ""

if ($healthTest) {
    Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
}

if ($menuTest) {
    Write-Host "✅ Menu Items: PASSED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Menu Items: FAILED" -ForegroundColor Yellow
}

if ($tablesTest) {
    Write-Host "✅ Tables: PASSED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tables: FAILED" -ForegroundColor Yellow
}

if ($ordersTest) {
    Write-Host "✅ Orders: PASSED" -ForegroundColor Green
} else {
    Write-Host "⚠️  Orders: FAILED" -ForegroundColor Yellow
}

Write-Host ""

if ($healthTest) {
    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Backend is live at: $renderUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Update frontend VITE_API_URL to: $renderUrl" -ForegroundColor White
    Write-Host "2. Deploy frontend to Vercel" -ForegroundColor White
    Write-Host "3. Test full application flow" -ForegroundColor White
} else {
    Write-Host "❌ DEPLOYMENT ISSUES DETECTED" -ForegroundColor Red
    Write-Host ""
    Write-Host "TROUBLESHOOTING STEPS:" -ForegroundColor Yellow
    Write-Host "1. Check Render dashboard for deployment logs" -ForegroundColor White
    Write-Host "2. Verify environment variables are set correctly" -ForegroundColor White
    Write-Host "3. Ensure build completed successfully" -ForegroundColor White
    Write-Host "4. Check database connection (DATABASE_URL)" -ForegroundColor White
    Write-Host ""
    Write-Host "Render Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "USEFUL URLS:" -ForegroundColor Cyan
Write-Host "- Backend Health: $healthEndpoint" -ForegroundColor White
Write-Host "- Backend API: $renderUrl/api/" -ForegroundColor White
Write-Host "- Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host ""