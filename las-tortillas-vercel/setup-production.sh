#!/bin/bash

# =========================================================
# SCRIPT DE SETUP AUTOMÁTICO - LAS TORTILLAS
# Deploy Frontend (Vercel) + Backend (Render) + DB (Neon)
# =========================================================

echo "🚀 === SETUP AUTOMÁTICO LAS TORTILLAS ==="
echo "📋 Este script vai configurar todo o ambiente de produção"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_step "Verificando pré-requisitos..."

if ! command_exists node; then
    print_error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm não encontrado. Instale npm primeiro."
    exit 1
fi

print_success "Node.js e npm encontrados"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório las-tortillas-vercel/frontend/"
    exit 1
fi

# Step 1: Install dependencies
print_step "PASSO 1: Instalando dependências..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependências instaladas"
else
    print_error "Falha ao instalar dependências"
    exit 1
fi

# Step 2: Environment configuration
print_step "PASSO 2: Configuração de ambiente..."

if [ ! -f "../.env.local" ]; then
    print_warning "Arquivo .env.local não encontrado"
    print_step "Copiando template de configuração..."
    
    if [ -f "../.env.template" ]; then
        cp ../.env.template ../.env.local
        print_success "Template copiado para .env.local"
        print_warning "IMPORTANTE: Edite o arquivo .env.local com suas credenciais!"
        print_warning "Configurações necessárias:"
        echo "  - DATABASE_URL (Neon)"
        echo "  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
        echo "  - VITE_API_URL (URL do backend no Render)"
        echo ""
        
        read -p "Pressione Enter depois de configurar o .env.local..."
    else
        print_error "Template .env.template não encontrado"
        exit 1
    fi
else
    print_success "Arquivo .env.local encontrado"
fi

# Step 3: Test database connection
print_step "PASSO 3: Testando conexão com banco de dados..."
npm run test-neon-connection
if [ $? -eq 0 ]; then
    print_success "Conexão com banco estabelecida"
else
    print_error "Falha na conexão com banco"
    print_warning "Verifique as configurações no .env.local"
    
    read -p "Deseja continuar mesmo com falha na conexão? (y/N): " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Run database migration
print_step "PASSO 4: Executando migração do banco..."
npm run migrate-neon
if [ $? -eq 0 ]; then
    print_success "Migração do banco concluída"
else
    print_error "Falha na migração do banco"
    exit 1
fi

# Step 5: Build frontend
print_step "PASSO 5: Build do frontend..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build do frontend concluído"
else
    print_error "Falha no build do frontend"
    exit 1
fi

# Step 6: Instructions for deployment
print_step "PASSO 6: Instruções para deploy..."

echo ""
echo "🎉 === SETUP CONCLUÍDO COM SUCESSO! ==="
echo ""
echo "📋 PRÓXIMOS PASSOS PARA DEPLOY:"
echo ""
echo "1️⃣  BACKEND (Render):"
echo "   • Acesse: https://render.com"
echo "   • Crie um novo Web Service"
echo "   • Conecte seu repositório GitHub"
echo "   • Configure Build Command: cd server && npm install && npm run build"
echo "   • Configure Start Command: cd server && npm start"
echo "   • Adicione variáveis de ambiente:"
echo "     - DATABASE_URL (sua URL do Neon)"
echo "     - NODE_ENV=production"
echo "     - PORT=10000"
echo ""
echo "2️⃣  FRONTEND (Vercel):"
echo "   • Acesse: https://vercel.com"
echo "   • Importe seu repositório"
echo "   • Configure Root Directory: las-tortillas-vercel/frontend"
echo "   • Configure Build Command: npm run build"
echo "   • Adicione variáveis de ambiente:"
echo "     - VITE_API_URL (URL do seu backend no Render)"
echo "     - SUPABASE_URL"
echo "     - SUPABASE_ANON_KEY"
echo ""
echo "3️⃣  TESTE FINAL:"
echo "   • Acesse sua aplicação na Vercel"
echo "   • Teste todas as funcionalidades"
echo "   • Verifique logs no Render e Vercel"
echo ""
echo "📞 SUPORTE:"
echo "   • Logs Render: https://dashboard.render.com"
echo "   • Logs Vercel: https://vercel.com/dashboard"
echo "   • DB Neon: https://console.neon.tech"
echo ""

print_success "Setup automático concluído! 🚀"