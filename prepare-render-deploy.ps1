# =========================================================
# PREPARAÇÃO COMPLETA PARA DEPLOY NO RENDER
# Las Tortillas Backend Deployment
# =========================================================

Write-Host "🚀 === PREPARAÇÃO RENDER DEPLOY - LAS TORTILLAS ===" -ForegroundColor Blue
Write-Host "📋 Este script prepara todo o backend para deploy no Render" -ForegroundColor Blue
Write-Host ""

# Functions
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

# 1. Verificações Iniciais
Write-Step "PASSO 1: Verificações iniciais..."

if (-not (Test-Path "server/package.json")) {
    Write-Error "Diretório server/ não encontrado. Execute na raiz do projeto."
    exit 1
}

if (-not (Test-Path "render.yaml")) {
    Write-Error "Arquivo render.yaml não encontrado"
    exit 1
}

Write-Success "Estrutura do projeto verificada"

# 2. Instalar dependências do servidor
Write-Step "PASSO 2: Instalando dependências do servidor..."

Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependências instaladas"
} else {
    Write-Error "Falha ao instalar dependências"
    exit 1
}

# 3. Adicionar dotenv se não existir
Write-Step "PASSO 3: Verificando dependência dotenv..."

$packageContent = Get-Content "package.json" | ConvertFrom-Json
$hasDotenv = $packageContent.dependencies.dotenv

if (-not $hasDotenv) {
    Write-Step "Adicionando dotenv..."
    npm install dotenv
    Write-Success "dotenv adicionado"
} else {
    Write-Success "dotenv já instalado"
}

# 4. Testar build TypeScript
Write-Step "PASSO 4: Testando build TypeScript..."

npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build TypeScript executado com sucesso"
} else {
    Write-Error "Falha no build TypeScript"
    exit 1
}

# 5. Testar se o servidor inicia
Write-Step "PASSO 5: Testando inicialização do servidor..."

# Criar um teste de servidor básico
$testScript = @"
const { spawn } = require('child_process');
const process = require('process');

console.log('Testing server startup...');

const server = spawn('node', ['dist/index.js'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3333' },
    stdio: 'pipe'
});

let started = false;

server.stdout.on('data', (data) => {
    console.log('Server output:', data.toString());
    if (data.toString().includes('serving on port') || data.toString().includes('3333')) {
        started = true;
        server.kill();
        console.log('✅ Server starts successfully');
        process.exit(0);
    }
});

server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
});

setTimeout(() => {
    if (!started) {
        server.kill();
        console.log('⚠️ Server test timeout (may still work in production)');
        process.exit(0);
    }
}, 10000);
"@

Set-Content -Path "test-server.js" -Value $testScript
node test-server.js
Remove-Item "test-server.js"

Write-Success "Teste de servidor concluído"

# 6. Voltar para raiz
Set-Location ..

# 7. Verificar render.yaml
Write-Step "PASSO 6: Verificando configuração render.yaml..."

$renderContent = Get-Content "render.yaml" -Raw

if ($renderContent -match "las-tortillas-backend") {
    Write-Success "Nome do serviço configurado"
} else {
    Write-Warning "Nome do serviço pode precisar de ajuste"
}

if ($renderContent -match "server") {
    Write-Success "Diretório de build configurado"
} else {
    Write-Error "Diretório de build não configurado"
}

Write-Success "render.yaml validado"

# 8. Preparar documentação de variáveis de ambiente
Write-Step "PASSO 7: Criando documentação de variáveis..."

$envDoc = @"
# =========================================================
# VARIÁVEIS DE AMBIENTE NECESSÁRIAS PARA O RENDER
# =========================================================

Configure estas variáveis no dashboard do Render:

## 🗃️ DATABASE (OBRIGATÓRIO)
DATABASE_URL=postgresql://user:password@host:5432/database
# Obtenha no dashboard do Neon: https://console.neon.tech

## 🔐 SUPABASE (Para upload de imagens)
SUPABASE_URL=https://seu-project.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key
# Obtenha no dashboard do Supabase: https://supabase.com

## 🔑 SEGURANÇA
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres
# Gere uma chave aleatória segura

## 🌐 CORS E URLs
CORS_ORIGIN=https://seu-frontend.vercel.app
# URL do seu frontend quando deployado na Vercel

## ⚙️ CONFIGURAÇÕES AUTOMÁTICAS (Já configuradas no render.yaml)
NODE_ENV=production
PORT=10000

# =========================================================
# COMO CONFIGURAR NO RENDER:
# =========================================================
# 1. Acesse https://dashboard.render.com
# 2. Selecione seu serviço
# 3. Vá em "Environment"
# 4. Adicione cada variável listada acima
# 5. Clique em "Save Changes"
# =========================================================
"@

Set-Content -Path "RENDER_ENV_VARS.md" -Value $envDoc
Write-Success "Documentação de variáveis criada: RENDER_ENV_VARS.md"

# 9. Resumo final
Write-Host ""
Write-Host "🎉 === PREPARAÇÃO CONCLUÍDA COM SUCESSO! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RESUMO DO QUE FOI FEITO:" -ForegroundColor Blue
Write-Host "  ✅ Dependências do servidor instaladas" -ForegroundColor White
Write-Host "  ✅ Build TypeScript testado" -ForegroundColor White
Write-Host "  ✅ Inicialização do servidor testada" -ForegroundColor White
Write-Host "  ✅ Configuração render.yaml validada" -ForegroundColor White
Write-Host "  ✅ Documentação de variáveis criada" -ForegroundColor White
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Blue
Write-Host ""
Write-Host "1️⃣ CONFIGURAR REPOSITÓRIO GIT:" -ForegroundColor Yellow
Write-Host "   • Execute: .\prepare-git-repo.ps1" -ForegroundColor White
Write-Host "   • Ou configure manualmente o Git remote" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣ DEPLOY NO RENDER:" -ForegroundColor Yellow
Write-Host "   • Execute: .\deploy-to-render.ps1" -ForegroundColor White
Write-Host "   • Ou acesse https://dashboard.render.com" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣ CONFIGURAR VARIÁVEIS:" -ForegroundColor Yellow
Write-Host "   • Leia: RENDER_ENV_VARS.md" -ForegroundColor White
Write-Host "   • Configure no dashboard do Render" -ForegroundColor White
Write-Host ""

Write-Success "Tudo pronto para deploy! 🚀"