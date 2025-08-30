Write-Host "DEPLOY FINAL - SEM DOTENV" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host ""

Write-Host "CORRECOES APLICADAS:" -ForegroundColor Green
Write-Host "- Removido import dotenv do server/index.ts" -ForegroundColor White
Write-Host "- Removido dotenv do server/package.json" -ForegroundColor White
Write-Host "- Servidor usa apenas variaveis de sistema" -ForegroundColor White
Write-Host ""

Write-Host "Fazendo commit e push..." -ForegroundColor Yellow
git add server/
git commit -m "DEFINITIVE FIX: Remove dotenv completely from server"
git push

Write-Host ""
Write-Host "Aguardando 60 segundos para deploy..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "Testando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://las-tortillas-api.onrender.com/api/health" -TimeoutSec 20
    Write-Host ""
    Write-Host "SUCESSO! BACKEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
    Write-Host ""
    Write-Host "DEPLOY COMPLETO!" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Se ainda nao funcionar, configure no dashboard:" -ForegroundColor Cyan
    Write-Host "1. DATABASE_URL" -ForegroundColor White
    Write-Host "2. JWT_SECRET" -ForegroundColor White
    Write-Host ""
    Write-Host "URL: https://las-tortillas-api.onrender.com/api/health" -ForegroundColor White
}

Write-Host ""
Write-Host "Configuracao final aplicada!" -ForegroundColor Green