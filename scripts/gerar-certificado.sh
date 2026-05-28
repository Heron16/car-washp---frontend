#!/usr/bin/env bash
# ============================================================
#  Gera certificado SSL local com mkcert para meuapp.local
#  Pré-requisito: mkcert instalado (https://github.com/FiloSottile/mkcert)
#
#  Uso:
#    chmod +x scripts/gerar-certificado.sh
#    ./scripts/gerar-certificado.sh
#
#  Após executar, adicione ao /etc/hosts:
#    127.0.0.1  meuapp.local
# ============================================================

set -e

CERTS_DIR="$(dirname "$0")/../nginx/certs"
mkdir -p "$CERTS_DIR"

echo "🔐 Instalando CA raiz do mkcert no sistema..."
mkcert -install

echo "📜 Gerando certificado para meuapp.local..."
mkcert -cert-file "$CERTS_DIR/meuapp.local.pem" \
       -key-file  "$CERTS_DIR/meuapp.local-key.pem" \
       meuapp.local

echo ""
echo "✅ Certificado gerado em nginx/certs/"
echo ""
echo "⚠️  Adicione ao /etc/hosts (se ainda não tiver):"
echo "   127.0.0.1  meuapp.local"
echo ""
echo "🚀 Agora execute: docker compose up --build"
