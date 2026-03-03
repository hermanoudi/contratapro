#!/bin/bash
set -e

echo "Rodando migrations Alembic..."
alembic upgrade head
echo "Migrations aplicadas. Iniciando servidor..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
