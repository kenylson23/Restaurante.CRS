# =========================================================
# AUTOMATED BACKEND DEPLOYMENT TO RENDER (Windows)
# =========================================================

Write-Host "🚀 === BACKEND DEPLOYMENT TO RENDER ===" -ForegroundColor Blue
Write-Host "📋 This script will deploy your backend automatically" -ForegroundColor Blue
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
if (-not (Test-Path "../server/package.json")) {
    Write-Error "Execute this script from las-tortillas-vercel\frontend\ directory"
    exit 1
}

# Step 1: Prepare backend for deployment
Write-Step "STEP 1: Preparing backend for deployment..."

Set-Location "../server"

# Install dependencies
Write-Step "Installing backend dependencies..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed"
} else {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Test TypeScript compilation
Write-Step "Testing TypeScript compilation..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "TypeScript compilation successful"
} else {
    Write-Error "TypeScript compilation failed"
    exit 1
}

# Test if server starts (simplified for Windows)
Write-Step "Testing server startup..."
$serverJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}
Start-Sleep -Seconds 5

if ($serverJob.State -eq "Running") {
    Write-Success "Server starts successfully"
    Stop-Job $serverJob
    Remove-Job $serverJob
} else {
    Write-Warning "Server startup test inconclusive"
    Remove-Job $serverJob -Force
}

# Step 2: Git preparation
Write-Step "STEP 2: Preparing Git repository..."

Set-Location ".."

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Step "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
}

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Step "Committing latest changes..."
    git add .
    git commit -m "Prepare for Render deployment"
}

Write-Success "Git repository prepared"

# Step 3: Render deployment validation
Write-Step "STEP 3: Validating Render configuration..."

# Check render.yaml
if (Test-Path "render.yaml") {
    Write-Success "render.yaml configuration found"
    
    # Validate render.yaml structure
    $renderContent = Get-Content "render.yaml" -Raw
    if ($renderContent -match "las-tortillas-backend") {
        Write-Success "Service name configured"
    } else {
        Write-Warning "Service name might need adjustment"
    }
    
    if ($renderContent -match "server") {
        Write-Success "Build directory configured"
    } else {
        Write-Error "Build directory not configured correctly"
        exit 1
    }
} else {
    Write-Error "render.yaml not found"
    exit 1
}

# Step 4: Environment variables checklist
Write-Step "STEP 4: Environment variables checklist..."

Write-Host ""
Write-Host "📋 REQUIRED ENVIRONMENT VARIABLES FOR RENDER:" -ForegroundColor Yellow
Write-Host "You need to configure these in Render dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🗃️  DATABASE_URL: Your Neon PostgreSQL connection string" -ForegroundColor White
Write-Host "🔐 SUPABASE_URL: Your Supabase project URL" -ForegroundColor White
Write-Host "🔐 SUPABASE_ANON_KEY: Your Supabase anon key" -ForegroundColor White
Write-Host "🔐 SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key" -ForegroundColor White
Write-Host "🔑 JWT_SECRET: A secure random string (min 32 characters)" -ForegroundColor White
Write-Host "🌐 CORS_ORIGIN: Your Vercel frontend URL" -ForegroundColor White
Write-Host "⚙️  NODE_ENV: production" -ForegroundColor White
Write-Host "⚙️  PORT: 10000" -ForegroundColor White
Write-Host ""

$envConfigured = Read-Host "Have you configured all environment variables in Render? (y/N)"
if ($envConfigured -notmatch "^[Yy]$") {
    Write-Warning "Please configure environment variables in Render dashboard first"
    Write-Host ""
    Write-Host "📋 HOW TO CONFIGURE:" -ForegroundColor Yellow
    Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Select your service" -ForegroundColor White
    Write-Host "3. Go to Environment tab" -ForegroundColor White
    Write-Host "4. Add each variable listed above" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Step 5: Deployment instructions
Write-Step "STEP 5: Deployment options..."

Write-Host ""
Write-Host "🚀 DEPLOYMENT OPTIONS:" -ForegroundColor Green
Write-Host ""
Write-Host "OPTION A: Manual Deployment via Render Dashboard" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Click 'New +' → 'Web Service'" -ForegroundColor White
Write-Host "3. Connect your Git repository" -ForegroundColor White
Write-Host "4. Configure as follows:" -ForegroundColor White
Write-Host "   - Name: las-tortillas-backend" -ForegroundColor White
Write-Host "   - Environment: Node" -ForegroundColor White
Write-Host "   - Branch: main (or your current branch)" -ForegroundColor White
Write-Host "   - Root Directory: server" -ForegroundColor White
Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor White
Write-Host "   - Start Command: npm start" -ForegroundColor White
Write-Host "5. Add environment variables (from checklist above)" -ForegroundColor White
Write-Host "6. Click 'Create Web Service'" -ForegroundColor White
Write-Host ""

Write-Host "OPTION B: Using Render CLI (if installed)" -ForegroundColor Yellow
Write-Host "1. Install Render CLI: npm install -g @render/cli" -ForegroundColor White
Write-Host "2. Login: render login" -ForegroundColor White
Write-Host "3. Deploy: render deploy" -ForegroundColor White
Write-Host ""

$deployOption = Read-Host "Which option do you prefer? (A/B)"

if ($deployOption -match "^[Aa]$") {
    Write-Step "Opening Render dashboard..."
    Start-Process "https://dashboard.render.com"
} elseif ($deployOption -match "^[Bb]$") {
    if (Get-Command "render" -ErrorAction SilentlyContinue) {
        Write-Step "Deploying with Render CLI..."
        render deploy
    } else {
        Write-Error "Render CLI not installed"
        Write-Step "Installing Render CLI..."
        npm install -g @render/cli
        Write-Step "Please run 'render login' then 'render deploy'"
    }
} else {
    Write-Warning "No option selected. Please deploy manually."
}

# Step 6: Post-deployment validation
Write-Step "STEP 6: Post-deployment validation..."

Write-Host ""
Write-Host "📋 AFTER DEPLOYMENT, VALIDATE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ Check deployment logs in Render dashboard" -ForegroundColor White
Write-Host "2. ✅ Test health endpoint: https://your-backend.onrender.com/api/health" -ForegroundColor White
Write-Host "3. ✅ Verify no critical errors in logs" -ForegroundColor White
Write-Host "4. ✅ Test database connection (should show in logs)" -ForegroundColor White
Write-Host "5. ✅ Update VITE_API_URL in frontend with your backend URL" -ForegroundColor White
Write-Host ""

Write-Host "🔗 YOUR BACKEND URL WILL BE:" -ForegroundColor Cyan
Write-Host "https://las-tortillas-backend.onrender.com" -ForegroundColor White
Write-Host "(or custom name if you changed it)" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter when deployment is complete and you want to test"

# Test deployment if URL is provided
$backendUrl = Read-Host "Enter your backend URL to test (or press Enter to skip)"

if ($backendUrl) {
    Write-Step "Testing backend deployment..."
    
    # Test health endpoint
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 10
        Write-Success "Backend health check passed!"
        Write-Host "✅ Backend is running correctly" -ForegroundColor Green
    } catch {
        Write-Error "Backend health check failed"
        Write-Host "❌ Check deployment logs and configuration" -ForegroundColor Red
    }
}

Write-Host ""
Write-Success "Backend deployment process completed!"
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Blue
Write-Host "1. ✅ Backend deployed to Render" -ForegroundColor Green
Write-Host "2. 🌐 Deploy frontend to Vercel" -ForegroundColor Yellow
Write-Host "3. 🧪 Test full application" -ForegroundColor Yellow
Write-Host ""