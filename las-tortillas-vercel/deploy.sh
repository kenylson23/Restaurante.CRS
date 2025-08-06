#!/bin/bash

echo "🚀 Iniciando deploy do Las Tortillas para Vercel..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado no Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Faça login no Vercel..."
    vercel login
fi

# Instalar dependências
echo "📦 Instalando dependências..."
cd frontend
npm install
cd ..

# Build do projeto
echo "🔨 Fazendo build do projeto..."
cd frontend
npm run build
cd ..

# Deploy para Vercel
echo "🚀 Fazendo deploy para Vercel..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Seu projeto está disponível em: https://las-tortillas.vercel.app" 