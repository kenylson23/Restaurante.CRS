# =========================================================
# END-TO-END TESTING SCRIPT - LAS TORTILLAS
# =========================================================

Write-Host "🧪 === END-TO-END TESTING SUITE ===" -ForegroundColor Blue
Write-Host "📋 This script will test all functionality after deployment" -ForegroundColor Blue
Write-Host ""

# Function to print colored output
function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $global:totalTests++
    Write-Step "Testing: $Name"
    Write-Info "URL: $Url"
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 30
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            if (-not $Headers.ContainsKey("Content-Type")) {
                $params.Headers["Content-Type"] = "application/json"
            }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Success "$Name - PASSED (Status: $($response.StatusCode))"
            $global:passedTests++
            return $true
        } else {
            Write-Warning "$Name - UNEXPECTED STATUS (Expected: $ExpectedStatus, Got: $($response.StatusCode))"
            $global:failedTests++
            return $false
        }
    } catch {
        Write-Error "$Name - FAILED ($($_.Exception.Message))"
        $global:failedTests++
        return $false
    }
}

# Get URLs from user
Write-Step "STEP 1: Configuration"
$frontendUrl = Read-Host "Enter your frontend URL (Vercel)"
$backendUrl = Read-Host "Enter your backend URL (Render)"

if (-not $frontendUrl -or -not $backendUrl) {
    Write-Error "Both frontend and backend URLs are required"
    exit 1
}

# Ensure URLs don't have trailing slashes
$frontendUrl = $frontendUrl.TrimEnd('/')
$backendUrl = $backendUrl.TrimEnd('/')

Write-Success "Frontend URL: $frontendUrl"
Write-Success "Backend URL: $backendUrl"
Write-Host ""

# Test Suite 1: Infrastructure Tests
Write-Step "TEST SUITE 1: Infrastructure & Connectivity"
Write-Host "=" * 50

Test-Endpoint "Frontend Home Page" "$frontendUrl"
Test-Endpoint "Backend Health Check" "$backendUrl/api/health"
Test-Endpoint "Backend CORS Headers" "$backendUrl/api/health" -Headers @{"Origin" = $frontendUrl}

Write-Host ""

# Test Suite 2: API Endpoints
Write-Step "TEST SUITE 2: API Endpoints"
Write-Host "=" * 50

Test-Endpoint "Menu Items API" "$backendUrl/api/menu/items"
Test-Endpoint "Menu Categories API" "$backendUrl/api/menu/categories"
Test-Endpoint "Restaurant Locations API" "$backendUrl/api/tables"
Test-Endpoint "Orders API" "$backendUrl/api/orders"

Write-Host ""

# Test Suite 3: Authentication Endpoints
Write-Step "TEST SUITE 3: Authentication"
Write-Host "=" * 50

# Test login endpoint (expect 400/401 without credentials)
Test-Endpoint "Login Endpoint (No Credentials)" "$backendUrl/api/auth/login" -Method "POST" -ExpectedStatus 400
Test-Endpoint "User Info Endpoint (No Auth)" "$backendUrl/api/auth/user" -ExpectedStatus 401

Write-Host ""

# Test Suite 4: Frontend Routes
Write-Step "TEST SUITE 4: Frontend Routes"
Write-Host "=" * 50

Test-Endpoint "Frontend Admin Route" "$frontendUrl/#/admin"
Test-Endpoint "Frontend Menu Route" "$frontendUrl/#/menu"
Test-Endpoint "Frontend Login Route" "$frontendUrl/#/login"

Write-Host ""

# Test Suite 5: Database Integration
Write-Step "TEST SUITE 5: Database Integration Tests"
Write-Host "=" * 50

Write-Info "Testing data creation (will create test data)..."

# Test creating a test order
$testOrder = @{
    customer_name = "Test Customer"
    customer_phone = "+244123456789"
    type = "takeaway"
    items = @(
        @{
            name = "Test Taco"
            quantity = 2
            price = 15.00
        }
    )
    subtotal = 30.00
    total = 30.00
} | ConvertTo-Json

$orderCreated = Test-Endpoint "Create Test Order" "$backendUrl/api/orders/create" -Method "POST" -Body $testOrder

Write-Host ""

# Test Suite 6: File Upload
Write-Step "TEST SUITE 6: File Upload"
Write-Host "=" * 50

Write-Info "Testing file upload endpoint availability..."
Test-Endpoint "Upload Endpoint" "$backendUrl/api/upload" -Method "POST" -ExpectedStatus 400

Write-Host ""

# Test Suite 7: Real-time Features
Write-Step "TEST SUITE 7: Real-time Features"
Write-Host "=" * 50

Write-Info "Testing SSE endpoints..."
Test-Endpoint "Kitchen Updates SSE" "$backendUrl/api/sse/kitchen-updates"
Test-Endpoint "Order Updates SSE" "$backendUrl/api/sse/order-updates"

Write-Host ""

# Test Suite 8: Performance Tests
Write-Step "TEST SUITE 8: Performance Tests"
Write-Host "=" * 50

Write-Info "Testing response times..."

# Measure response time for critical endpoints
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-WebRequest -Uri "$frontendUrl" -TimeoutSec 10 | Out-Null
    $stopwatch.Stop()
    $frontendTime = $stopwatch.ElapsedMilliseconds
    
    if ($frontendTime -lt 3000) {
        Write-Success "Frontend Performance - GOOD ($frontendTime ms)"
        $global:passedTests++
    } else {
        Write-Warning "Frontend Performance - SLOW ($frontendTime ms)"
        $global:failedTests++
    }
} catch {
    Write-Error "Frontend Performance - FAILED"
    $global:failedTests++
}
$global:totalTests++

$stopwatch.Restart()
try {
    Invoke-WebRequest -Uri "$backendUrl/api/health" -TimeoutSec 10 | Out-Null
    $stopwatch.Stop()
    $backendTime = $stopwatch.ElapsedMilliseconds
    
    if ($backendTime -lt 2000) {
        Write-Success "Backend Performance - GOOD ($backendTime ms)"
        $global:passedTests++
    } else {
        Write-Warning "Backend Performance - SLOW ($backendTime ms)"
        $global:failedTests++
    }
} catch {
    Write-Error "Backend Performance - FAILED"
    $global:failedTests++
}
$global:totalTests++

Write-Host ""

# Test Suite 9: Security Headers
Write-Step "TEST SUITE 9: Security Tests"
Write-Host "=" * 50

Write-Info "Testing security headers..."

try {
    $response = Invoke-WebRequest -Uri $frontendUrl
    $headers = $response.Headers
    
    $securityHeaders = @(
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection"
    )
    
    foreach ($header in $securityHeaders) {
        $global:totalTests++
        if ($headers.ContainsKey($header)) {
            Write-Success "Security Header: $header - PRESENT"
            $global:passedTests++
        } else {
            Write-Warning "Security Header: $header - MISSING"
            $global:failedTests++
        }
    }
} catch {
    Write-Error "Security headers test failed"
}

Write-Host ""

# Final Report
Write-Step "TEST RESULTS SUMMARY"
Write-Host "=" * 50

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "📊 TOTAL TESTS: $totalTests" -ForegroundColor Cyan
Write-Host "✅ PASSED: $passedTests" -ForegroundColor Green
Write-Host "❌ FAILED: $failedTests" -ForegroundColor Red
Write-Host "📈 SUCCESS RATE: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host ""

# Recommendations based on results
if ($successRate -ge 90) {
    Write-Success "🎉 EXCELLENT! Your application is ready for production!"
    Write-Host "🚀 You can confidently go live with your restaurant system." -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Warning "✅ GOOD! Most tests passed. Address the failed tests before going live."
    Write-Host "🔧 Review failed tests and fix issues." -ForegroundColor Yellow
} elseif ($successRate -ge 60) {
    Write-Warning "⚠️  NEEDS WORK! Several critical issues found."
    Write-Host "🛠️  Address failed tests before production deployment." -ForegroundColor Yellow
} else {
    Write-Error "❌ CRITICAL ISSUES! Application not ready for production."
    Write-Host "🚨 Major fixes required before going live." -ForegroundColor Red
}

Write-Host ""

# Manual testing checklist
Write-Step "MANUAL TESTING CHECKLIST"
Write-Host "=" * 50

Write-Host "Please manually test the following:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔐 LOGIN FUNCTIONALITY:" -ForegroundColor Blue
Write-Host "   • Admin login (admin@lastortilhas.ao)" -ForegroundColor White
Write-Host "   • Kitchen login (cozinha@lastortilhas.ao)" -ForegroundColor White
Write-Host ""
Write-Host "🛒 ORDER SYSTEM:" -ForegroundColor Blue
Write-Host "   • Create new order" -ForegroundColor White
Write-Host "   • Update order status" -ForegroundColor White
Write-Host "   • View orders in kitchen panel" -ForegroundColor White
Write-Host ""
Write-Host "📱 USER INTERFACE:" -ForegroundColor Blue
Write-Host "   • Responsive design on mobile" -ForegroundColor White
Write-Host "   • Navigation works correctly" -ForegroundColor White
Write-Host "   • Images load properly" -ForegroundColor White
Write-Host ""
Write-Host "🖼️  FILE UPLOAD:" -ForegroundColor Blue
Write-Host "   • Upload menu item images" -ForegroundColor White
Write-Host "   • Verify images display correctly" -ForegroundColor White
Write-Host ""

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Blue
Write-Host "1. Address any failed automated tests" -ForegroundColor White
Write-Host "2. Complete manual testing checklist" -ForegroundColor White
Write-Host "3. Configure custom domain (optional)" -ForegroundColor White
Write-Host "4. Set up monitoring and alerts" -ForegroundColor White
Write-Host "5. Go live! 🚀" -ForegroundColor White
Write-Host ""

Write-Success "End-to-end testing completed!"