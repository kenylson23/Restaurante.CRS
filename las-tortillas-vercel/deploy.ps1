# Script de Deploy para Vercel - Windows PowerShell

Write-Host "🚀 Iniciando deploy do Las Tortillas para Vercel..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar se está logado no Vercel
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logado no Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Faça login no Vercel..." -ForegroundColor Yellow
    vercel login
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
Set-Location frontend
npm install
Set-Location ..

# Build do projeto
Write-Host "🔨 Fazendo build do projeto..." -ForegroundColor Blue
Set-Location frontend
npm run build
Set-Location ..

# Deploy para Vercel
Write-Host "🚀 Fazendo deploy para Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Seu projeto está disponível em: https://las-tortillas.vercel.app" -ForegroundColor Cyan 