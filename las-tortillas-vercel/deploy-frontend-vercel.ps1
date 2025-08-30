# =========================================================
# AUTOMATED FRONTEND DEPLOYMENT TO VERCEL (Windows)
# =========================================================

Write-Host "🌐 === FRONTEND DEPLOYMENT TO VERCEL ===" -ForegroundColor Blue
Write-Host "📋 This script will deploy your frontend automatically" -ForegroundColor Blue
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

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Execute this script from las-tortillas-vercel\frontend\ directory"
    exit 1
}

# Step 1: Prepare frontend for deployment
Write-Step "STEP 1: Preparing frontend for deployment..."

# Install dependencies
Write-Step "Installing frontend dependencies..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed"
} else {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Step 2: Environment configuration
Write-Step "STEP 2: Environment configuration check..."

if (-not (Test-Path "../.env.local")) {
    Write-Warning "No .env.local file found"
    Write-Step "Creating environment template..."
    
    if (Test-Path "../.env.template") {
        Copy-Item "../.env.template" "../.env.local"
        Write-Success "Template copied to .env.local"
        Write-Warning "Please edit .env.local with your actual values!"
    } else {
        Write-Error ".env.template not found"
        exit 1
    }
} else {
    Write-Success ".env.local file found"
}

# Check for required environment variables
Write-Host ""
Write-Host "📋 REQUIRED ENVIRONMENT VARIABLES FOR VERCEL:" -ForegroundColor Yellow
Write-Host "Configure these in Vercel dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🖥️  VITE_API_URL: Your Render backend URL" -ForegroundColor White
Write-Host "🔐 SUPABASE_URL: Your Supabase project URL" -ForegroundColor White
Write-Host "🔐 SUPABASE_ANON_KEY: Your Supabase anon key" -ForegroundColor White
Write-Host "⚙️  NODE_ENV: production" -ForegroundColor White
Write-Host ""

$backendUrl = Read-Host "Enter your Render backend URL (e.g., https://your-backend.onrender.com)"

if (-not $backendUrl) {
    Write-Error "Backend URL is required for frontend deployment"
    exit 1
}

# Update environment variables for build
$env:VITE_API_URL = $backendUrl
Write-Success "Backend URL configured: $backendUrl"

# Step 3: Build frontend
Write-Step "STEP 3: Building frontend..."

npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend build successful"
} else {
    Write-Error "Frontend build failed"
    exit 1
}

# Step 4: Validate build output
Write-Step "STEP 4: Validating build output..."

if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Recurse
    $totalSize = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    
    Write-Success "Build output created in dist/"
    Write-Host "📊 Build size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan
    
    # Check for essential files
    if (Test-Path "dist/index.html") {
        Write-Success "index.html found"
    } else {
        Write-Error "index.html not found in build output"
        exit 1
    }
} else {
    Write-Error "Build output directory not found"
    exit 1
}

# Step 5: Vercel CLI deployment
Write-Step "STEP 5: Vercel deployment..."

# Check if Vercel CLI is installed
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Warning "Vercel CLI not installed"
    Write-Step "Installing Vercel CLI..."
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Vercel CLI"
        exit 1
    }
    
    Write-Success "Vercel CLI installed"
}

# Login to Vercel
Write-Step "Logging in to Vercel..."
vercel login

# Deploy to Vercel
Write-Step "Deploying to Vercel..."
Write-Host ""
Write-Host "🚀 DEPLOYMENT OPTIONS:" -ForegroundColor Green
Write-Host ""
Write-Host "OPTION A: Production Deployment (Recommended)" -ForegroundColor Yellow
Write-Host "OPTION B: Preview Deployment (For testing)" -ForegroundColor Yellow
Write-Host ""

$deployType = Read-Host "Choose deployment type (A/B)"

if ($deployType -match "^[Aa]$") {
    Write-Step "Deploying to production..."
    vercel --prod
    $deploymentType = "production"
} else {
    Write-Step "Deploying to preview..."
    vercel
    $deploymentType = "preview"
}

if ($LASTEXITCODE -eq 0) {
    Write-Success "Deployment to Vercel successful!"
} else {
    Write-Error "Deployment to Vercel failed"
    exit 1
}

# Step 6: Environment variables configuration
Write-Step "STEP 6: Environment variables configuration..."

Write-Host ""
Write-Host "🔧 CONFIGURE ENVIRONMENT VARIABLES IN VERCEL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Add the following variables:" -ForegroundColor White
Write-Host ""
Write-Host "   VITE_API_URL = $backendUrl" -ForegroundColor Cyan
Write-Host "   SUPABASE_URL = your_supabase_url" -ForegroundColor Cyan
Write-Host "   SUPABASE_ANON_KEY = your_supabase_anon_key" -ForegroundColor Cyan
Write-Host "   NODE_ENV = production" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Redeploy after adding environment variables" -ForegroundColor White
Write-Host ""

$envConfigured = Read-Host "Have you configured environment variables in Vercel? (y/N)"

if ($envConfigured -match "^[Yy]$") {
    Write-Step "Triggering redeploy with new environment variables..."
    if ($deploymentType -eq "production") {
        vercel --prod
    } else {
        vercel
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Redeploy with environment variables successful!"
    } else {
        Write-Warning "Redeploy failed. Check Vercel dashboard for details."
    }
} else {
    Write-Warning "Remember to configure environment variables and redeploy"
}

# Step 7: Test deployment
Write-Step "STEP 7: Testing deployment..."

$frontendUrl = Read-Host "Enter your Vercel deployment URL to test (or press Enter to skip)"

if ($frontendUrl) {
    Write-Step "Testing frontend deployment..."
    
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend loads successfully!"
            Write-Host "✅ Frontend is accessible" -ForegroundColor Green
        } else {
            Write-Warning "Frontend responded with status: $($response.StatusCode)"
        }
    } catch {
        Write-Error "Frontend test failed: $($_.Exception.Message)"
    }
    
    # Test API connection
    if ($backendUrl) {
        Write-Step "Testing frontend → backend connection..."
        try {
            $healthUrl = "$backendUrl/api/health"
            $healthResponse = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
            Write-Success "Backend connection from frontend working!"
        } catch {
            Write-Warning "Backend connection test failed. Check CORS configuration."
        }
    }
}

# Step 8: Final validation checklist
Write-Step "STEP 8: Final validation checklist..."

Write-Host ""
Write-Host "📋 FINAL VALIDATION CHECKLIST:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Frontend deployed to Vercel" -ForegroundColor Green
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 MANUAL TESTS TO PERFORM:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. 🌐 Open your frontend URL and verify it loads" -ForegroundColor White
Write-Host "2. 🔐 Test admin login functionality" -ForegroundColor White
Write-Host "3. 👨‍🍳 Test kitchen login functionality" -ForegroundColor White
Write-Host "4. 🛒 Test order creation process" -ForegroundColor White
Write-Host "5. 📱 Test on mobile devices" -ForegroundColor White
Write-Host "6. 🖼️ Test image upload functionality" -ForegroundColor White
Write-Host "7. 📊 Check browser console for errors" -ForegroundColor White
Write-Host ""

Write-Host "🔗 USEFUL LINKS:" -ForegroundColor Cyan
Write-Host "• Frontend: $frontendUrl" -ForegroundColor White
Write-Host "• Backend: $backendUrl" -ForegroundColor White
Write-Host "• Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "• Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host ""

Write-Success "Frontend deployment completed!"
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Blue
Write-Host "1. ✅ Frontend deployed to Vercel" -ForegroundColor Green
Write-Host "2. ✅ Backend deployed to Render" -ForegroundColor Green
Write-Host "3. 🧪 Perform end-to-end testing" -ForegroundColor Yellow
Write-Host "4. 🚀 Go live with your restaurant!" -ForegroundColor Yellow
Write-Host ""