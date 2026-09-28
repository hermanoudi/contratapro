#!/bin/bash
set -e

echo "Rodando migrations Alembic..."
alembic upgrade head
echo "Migrations aplicadas. Iniciando servidor..."
# --forwarded-allow-ips='*': o Railway só é alcançável através do proxy de
# borda dele, então confiamos no X-Forwarded-For que ele injeta. Sem isso,
# o uvicorn só confia em X-Forwarded-For vindo de 127.0.0.1 (padrão) e
# request.client.host vira sempre o IP do proxy — o rate limiting de
# /auth/login e /auth/forgot-password (app/rate_limit.py) ficaria
# compartilhado entre TODOS os usuários em vez de por IP real (ver plano
# de melhorias / Fase 1.4).
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --forwarded-allow-ips='*'
