# ============================================================
#  Gera certificado SSL local com mkcert para meuapp.local
#  Pré-requisito: mkcert instalado
#    winget install FiloSottile.mkcert
#    ou: choco install mkcert
#
#  Uso (PowerShell como Administrador):
#    .\scripts\gerar-certificado.ps1
#
#  Após executar, adicione ao C:\Windows\System32\drivers\etc\hosts:
#    127.0.0.1  meuapp.local
# ============================================================

$ErrorActionPreference = "Stop"

$certsDir = Join-Path $PSScriptRoot "..\nginx\certs"
New-Item -ItemType Directory -Force -Path $certsDir | Out-Null

Write-Host "Instalando CA raiz do mkcert no sistema..." -ForegroundColor Cyan
mkcert -install

Write-Host "Gerando certificado para meuapp.local..." -ForegroundColor Cyan
mkcert `
  -cert-file "$certsDir\meuapp.local.pem" `
  -key-file  "$certsDir\meuapp.local-key.pem" `
  meuapp.local

Write-Host ""
Write-Host "Certificado gerado em nginx/certs/" -ForegroundColor Green
Write-Host ""
Write-Host "Adicione ao C:\Windows\System32\drivers\etc\hosts (como Administrador):" -ForegroundColor Yellow
Write-Host "  127.0.0.1  meuapp.local"
Write-Host ""
Write-Host "Agora execute: docker compose up --build" -ForegroundColor Cyan
