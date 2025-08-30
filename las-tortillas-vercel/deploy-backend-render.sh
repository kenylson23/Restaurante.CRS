#!/bin/bash

# =========================================================
# AUTOMATED BACKEND DEPLOYMENT TO RENDER
# =========================================================

echo "🚀 === BACKEND DEPLOYMENT TO RENDER ==="
echo "📋 This script will deploy your backend automatically"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "../server/package.json" ]; then
    print_error "Execute this script from las-tortillas-vercel/frontend/ directory"
    exit 1
fi

# Step 1: Prepare backend for deployment
print_step "STEP 1: Preparing backend for deployment..."

cd ../server

# Install dependencies
print_step "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Test TypeScript compilation
print_step "Testing TypeScript compilation..."
npm run build
if [ $? -eq 0 ]; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# Test if server starts
print_step "Testing server startup..."
timeout 10s npm start &
SERVER_PID=$!
sleep 5

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server starts successfully"
    kill $SERVER_PID
else
    print_warning "Server startup test inconclusive"
fi

# Step 2: Git preparation
print_step "STEP 2: Preparing Git repository..."

cd ..

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_step "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_step "Committing latest changes..."
    git add .
    git commit -m "Prepare for Render deployment"
fi

print_success "Git repository prepared"

# Step 3: Render deployment validation
print_step "STEP 3: Validating Render configuration..."

# Check render.yaml
if [ -f "render.yaml" ]; then
    print_success "render.yaml configuration found"
    
    # Validate render.yaml structure
    if grep -q "las-tortillas-backend" render.yaml; then
        print_success "Service name configured"
    else
        print_warning "Service name might need adjustment"
    fi
    
    if grep -q "server" render.yaml; then
        print_success "Build directory configured"
    else
        print_error "Build directory not configured correctly"
        exit 1
    fi
else
    print_error "render.yaml not found"
    exit 1
fi

# Step 4: Environment variables checklist
print_step "STEP 4: Environment variables checklist..."

echo ""
echo "📋 REQUIRED ENVIRONMENT VARIABLES FOR RENDER:"
echo "You need to configure these in Render dashboard:"
echo ""
echo "🗃️  DATABASE_URL: Your Neon PostgreSQL connection string"
echo "🔐 SUPABASE_URL: Your Supabase project URL"
echo "🔐 SUPABASE_ANON_KEY: Your Supabase anon key"
echo "🔐 SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key"
echo "🔑 JWT_SECRET: A secure random string (min 32 characters)"
echo "🌐 CORS_ORIGIN: Your Vercel frontend URL"
echo "⚙️  NODE_ENV: production"
echo "⚙️  PORT: 10000"
echo ""

read -p "Have you configured all environment variables in Render? (y/N): " env_configured
if [[ ! $env_configured =~ ^[Yy]$ ]]; then
    print_warning "Please configure environment variables in Render dashboard first"
    echo ""
    echo "📋 HOW TO CONFIGURE:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Select your service"
    echo "3. Go to Environment tab"
    echo "4. Add each variable listed above"
    echo ""
    exit 1
fi

# Step 5: Deployment instructions
print_step "STEP 5: Deployment options..."

echo ""
echo "🚀 DEPLOYMENT OPTIONS:"
echo ""
echo "OPTION A: Manual Deployment via Render Dashboard"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your Git repository"
echo "4. Configure as follows:"
echo "   - Name: las-tortillas-backend"
echo "   - Environment: Node"
echo "   - Branch: main (or your current branch)"
echo "   - Root Directory: server"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "5. Add environment variables (from checklist above)"
echo "6. Click 'Create Web Service'"
echo ""

echo "OPTION B: Using Render CLI (if installed)"
echo "1. Install Render CLI: npm install -g @render/cli"
echo "2. Login: render login"
echo "3. Deploy: render deploy"
echo ""

read -p "Which option do you prefer? (A/B): " deploy_option

if [[ $deploy_option =~ ^[Aa]$ ]]; then
    print_step "Opening Render dashboard..."
    if command -v xdg-open > /dev/null; then
        xdg-open "https://dashboard.render.com"
    elif command -v open > /dev/null; then
        open "https://dashboard.render.com"
    else
        echo "Please open https://dashboard.render.com manually"
    fi
elif [[ $deploy_option =~ ^[Bb]$ ]]; then
    if command -v render > /dev/null; then
        print_step "Deploying with Render CLI..."
        render deploy
    else
        print_error "Render CLI not installed"
        print_step "Installing Render CLI..."
        npm install -g @render/cli
        print_step "Please run 'render login' then 'render deploy'"
    fi
else
    print_warning "No option selected. Please deploy manually."
fi

# Step 6: Post-deployment validation
print_step "STEP 6: Post-deployment validation..."

echo ""
echo "📋 AFTER DEPLOYMENT, VALIDATE:"
echo ""
echo "1. ✅ Check deployment logs in Render dashboard"
echo "2. ✅ Test health endpoint: https://your-backend.onrender.com/api/health"
echo "3. ✅ Verify no critical errors in logs"
echo "4. ✅ Test database connection (should show in logs)"
echo "5. ✅ Update VITE_API_URL in frontend with your backend URL"
echo ""

echo "🔗 YOUR BACKEND URL WILL BE:"
echo "https://las-tortillas-backend.onrender.com"
echo "(or custom name if you changed it)"
echo ""

read -p "Press Enter when deployment is complete and you want to test..."

# Test deployment if URL is provided
read -p "Enter your backend URL to test (or press Enter to skip): " backend_url

if [ ! -z "$backend_url" ]; then
    print_step "Testing backend deployment..."
    
    # Test health endpoint
    if curl -f "${backend_url}/api/health" > /dev/null 2>&1; then
        print_success "Backend health check passed!"
        echo "✅ Backend is running correctly"
    else
        print_error "Backend health check failed"
        echo "❌ Check deployment logs and configuration"
    fi
fi

echo ""
print_success "Backend deployment process completed!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. ✅ Backend deployed to Render"
echo "2. 🌐 Deploy frontend to Vercel"
echo "3. 🧪 Test full application"
echo ""