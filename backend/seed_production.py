#!/usr/bin/env python3
"""
Script para executar seeds no banco de produção Railway.

IMPORTANTE: Este script se conecta diretamente ao banco de PRODUÇÃO!

Uso:
    python seed_production.py
"""

import sys
import os
import asyncio

# Configurar DATABASE_URL para produção
# COLE AQUI a URL pública do banco Railway (DATABASE_PUBLIC_URL)
PRODUCTION_DB_URL = "postgresql+asyncpg://postgres:QqSQgoCaOKitEWCNacZfbqOhIlSMYQVn@trolley.proxy.rlwy.net:11371/railway"

# Sobrescrever a variável de ambiente
os.environ["DATABASE_URL"] = PRODUCTION_DB_URL

# Adicionar o diretório app ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.seeds import run_seeds  # noqa: E402

if __name__ == "__main__":
    print("=" * 60)
    print("⚠️  ATENÇÃO: Conectando ao BANCO DE PRODUÇÃO no Railway!")
    print("=" * 60)
    print()
    print("Executando seeds no banco de produção...")
    print()

    asyncio.run(run_seeds())

    print()
    print("=" * 60)
    print("✅ Seeds executados no banco de produção!")
    print("=" * 60)
