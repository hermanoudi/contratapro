#!/bin/bash
# Script de inicialização para Railway
# Garante que PORT seja definido corretamente

# Se PORT não estiver definido, usa 8000 como padrão
PORT=${PORT:-8000}

echo "🚀 Iniciando servidor na porta $PORT..."

# Iniciar uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
