Write-Host "MONITORANDO DEPLOYMENT - CORREÇÃO APLICADA" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "PROBLEMA CORRIGIDO:" -ForegroundColor Green
Write-Host "- Removido cross-env do comando de start" -ForegroundColor White
Write-Host "- Usando NODE_ENV=production node dist/index.js direto" -ForegroundColor White
Write-Host ""

Write-Host "ALTERAÇÕES APLICADAS:" -ForegroundColor Yellow
Write-Host "- render.yaml: startCommand atualizado" -ForegroundColor White
Write-Host "- Git: Commit e push realizado" -ForegroundColor White
Write-Host "- Render: Deploy automatico deve iniciar" -ForegroundColor White
Write-Host ""

$url = "https://las-tortillas-api.onrender.com/api/health"

Write-Host "AGUARDANDO NOVO DEPLOYMENT..." -ForegroundColor Yellow
Write-Host "URL de teste: $url" -ForegroundColor Cyan
Write-Host ""

$attempts = 0
$maxAttempts = 20
$waitTime = 15

while ($attempts -lt $maxAttempts) {
    $attempts++
    Write-Host "Tentativa $attempts/$maxAttempts - Aguardando ${waitTime}s..." -ForegroundColor Gray
    Start-Sleep -Seconds $waitTime
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        Write-Host ""
        Write-Host "SUCESSO! BACKEND FUNCIONANDO!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "Resposta do health check:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 2
        Write-Host ""
        Write-Host "DEPLOYMENT COMPLETO!" -ForegroundColor Green
        Write-Host "Backend URL: https://las-tortillas-api.onrender.com" -ForegroundColor Cyan
        break
    }
    catch {
        Write-Host "Ainda aguardando... (Erro: $($_.Exception.Message))" -ForegroundColor Yellow
        
        if ($attempts -eq $maxAttempts) {
            Write-Host ""
            Write-Host "TIMEOUT - VERIFICAR MANUALMENTE" -ForegroundColor Red
            Write-Host "================================" -ForegroundColor Red
            Write-Host "1. Acesse: https://dashboard.render.com" -ForegroundColor White
            Write-Host "2. Verifique logs do deployment" -ForegroundColor White
            Write-Host "3. Confirme se o build foi iniciado" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Confirmar que o backend está respondendo" -ForegroundColor White
Write-Host "2. Testar endpoints da API" -ForegroundColor White
Write-Host "3. Fazer deploy do frontend na Vercel" -ForegroundColor White