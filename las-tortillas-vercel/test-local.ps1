# Script de Teste Local - Las Tortillas Vercel

Write-Host "🧪 Iniciando teste local do Las Tortillas..." -ForegroundColor Green

# Verificar se Node.js está instalado
try {
    node --version | Out-Null
    Write-Host "✅ Node.js encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
try {
    npm --version | Out-Null
    Write-Host "✅ npm encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado." -ForegroundColor Red
    exit 1
}

# Navegar para o diretório frontend
Write-Host "📁 Navegando para o diretório frontend..." -ForegroundColor Blue
Set-Location frontend

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
npm install

# Verificar se o build funciona
Write-Host "🔨 Testando build..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    exit 1
}

# Iniciar servidor de desenvolvimento
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔐 Teste de autenticação: http://localhost:3000/test-auth" -ForegroundColor Cyan
Write-Host "⏹️  Pressione Ctrl+C para parar" -ForegroundColor Yellow

npm run dev 