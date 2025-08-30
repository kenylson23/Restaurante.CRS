# =========================================================
# RENDER ENVIRONMENT VARIABLES SETUP VALIDATOR
# =========================================================

Write-Host "RENDER ENVIRONMENT VARIABLES SETUP" -ForegroundColor Blue
Write-Host "Validating configuration for Las Tortillas backend..." -ForegroundColor Blue
Write-Host ""

# Read current environment from .env.local for reference
if (Test-Path ".env.local") {
    Write-Host "Reading current local environment variables..." -ForegroundColor Green
    $envContent = Get-Content ".env.local"
    
    # Extract DATABASE_URL
    $databaseUrl = ($envContent | Where-Object { $_ -match "DATABASE_URL=" }) -replace "DATABASE_URL=", ""
    
    # Extract JWT_SECRET
    $jwtSecret = ($envContent | Where-Object { $_ -match "JWT_SECRET=" }) -replace "JWT_SECRET=", ""
    
    Write-Host ""
    Write-Host "MANDATORY VARIABLES FOR RENDER:" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. DATABASE_URL:" -ForegroundColor White
    Write-Host "   $databaseUrl" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "2. JWT_SECRET:" -ForegroundColor White
    Write-Host "   $jwtSecret" -ForegroundColor Cyan
    Write-Host "   Length: $($jwtSecret.Length) characters" -ForegroundColor Gray
    if ($jwtSecret.Length -ge 32) {
        Write-Host "   OK: JWT_SECRET meets minimum length requirement" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: JWT_SECRET should be at least 32 characters" -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "3. NODE_ENV:" -ForegroundColor White
    Write-Host "   production" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "4. PORT:" -ForegroundColor White
    Write-Host "   10000" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "RENDER CONFIGURATION STEPS:" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Open Render Dashboard:" -ForegroundColor White
Write-Host "   https://dashboard.render.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Select your service: 'las-tortillas-backend'" -ForegroundColor White
Write-Host ""

Write-Host "3. Go to Environment tab and add these variables:" -ForegroundColor White
Write-Host ""

Write-Host "   DATABASE_URL = $databaseUrl" -ForegroundColor Gray
Write-Host "   JWT_SECRET = $jwtSecret" -ForegroundColor Gray
Write-Host "   NODE_ENV = production" -ForegroundColor Gray
Write-Host "   PORT = 10000" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Optional variables (if using Supabase):" -ForegroundColor White
Write-Host "   SUPABASE_URL = [your-supabase-url]" -ForegroundColor Gray
Write-Host "   SUPABASE_ANON_KEY = [your-supabase-anon-key]" -ForegroundColor Gray
Write-Host "   SUPABASE_SERVICE_ROLE_KEY = [your-supabase-service-role-key]" -ForegroundColor Gray
Write-Host "   CORS_ORIGIN = [your-frontend-url]" -ForegroundColor Gray
Write-Host ""

$openDashboard = Read-Host "Open Render Dashboard now? (Y/n)"

if ($openDashboard -notmatch "^[Nn]$") {
    Write-Host "Opening Render Dashboard..." -ForegroundColor Green
    Start-Process "https://dashboard.render.com"
}

Write-Host ""
Write-Host "NEXT STEPS AFTER CONFIGURATION:" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Save environment variables in Render" -ForegroundColor White
Write-Host "2. Wait for automatic deployment to complete (3-5 minutes)" -ForegroundColor White
Write-Host "3. Test health endpoint: https://las-tortillas-backend.onrender.com/api/health" -ForegroundColor White
Write-Host "4. Expected response: {'status': 'healthy'}" -ForegroundColor White
Write-Host ""

Write-Host "Configuration guide saved to: RENDER_ENV_VARS.md" -ForegroundColor Green
Write-Host "Setup completed successfully!" -ForegroundColor Green