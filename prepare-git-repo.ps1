# =========================================================
# SCRIPT PREPARAÇÃO REPOSITÓRIO - RENDER DEPLOY
# =========================================================

Write-Host "🔧 === PREPARANDO REPOSITÓRIO PARA RENDER ===" -ForegroundColor Blue

# 1. Verificar se estamos na raiz do projeto
if (-not (Test-Path "package.json") -or -not (Test-Path "server/package.json")) {
    Write-Host "❌ Execute na raiz do projeto Las Tortillas" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projeto Las Tortillas detectado" -ForegroundColor Green

# 2. Verificar Git
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Inicializando repositório Git..." -ForegroundColor Blue
    git init
    Write-Host "✅ Git inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório Git existente" -ForegroundColor Green
}

# 3. Criar/atualizar .gitignore
Write-Host "📝 Configurando .gitignore..." -ForegroundColor Blue

$gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host "✅ .gitignore configurado" -ForegroundColor Green

# 4. Adicionar arquivos ao Git
Write-Host "📦 Adicionando arquivos ao repositório..." -ForegroundColor Blue
git add .

# 5. Verificar se há mudanças para commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "💾 Fazendo commit das alterações..." -ForegroundColor Blue
    git commit -m "Prepare for Render deployment - Las Tortillas"
    Write-Host "✅ Commit realizado" -ForegroundColor Green
} else {
    Write-Host "✅ Repositório está atualizado" -ForegroundColor Green
}

# 6. Verificar se há remote origin
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Nenhum remote origin configurado" -ForegroundColor Yellow
    Write-Host "📋 Para continuar, você precisa:" -ForegroundColor Yellow
    Write-Host "   1. Criar repositório no GitHub/GitLab" -ForegroundColor White
    Write-Host "   2. Executar: git remote add origin <URL_DO_SEU_REPO>" -ForegroundColor White
    Write-Host "   3. Executar: git push -u origin main" -ForegroundColor White
} else {
    Write-Host "✅ Remote origin: $remoteUrl" -ForegroundColor Green
    
    # Tentar fazer push
    Write-Host "🚀 Fazendo push para o repositório..." -ForegroundColor Blue
    git push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push realizado com sucesso" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Falha no push - verifique credenciais" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 === REPOSITÓRIO PREPARADO COM SUCESSO ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Blue
Write-Host "1. ✅ Repositório Git configurado" -ForegroundColor White
Write-Host "2. 📦 Execute: .\prepare-render-deploy.ps1" -ForegroundColor White
Write-Host "3. 🚀 Execute: .\deploy-to-render.ps1" -ForegroundColor White
Write-Host ""