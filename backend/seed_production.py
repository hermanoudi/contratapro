#!/usr/bin/env python3
"""
Script para executar seeds no banco de produção Railway.

IMPORTANTE: Configure DATABASE_URL como variável de ambiente!

Uso:
    DATABASE_URL="sua-url-aqui" python seed_production.py

Ou via Railway CLI:
    railway run python seed_production.py
"""

import sys
import os
import asyncio

# Usar DATABASE_URL do ambiente (Railway injeta automaticamente)
if not os.getenv("DATABASE_URL"):
    print("❌ ERRO: Variável DATABASE_URL não configurada!")
    print()
    print("Configure a URL do banco:")
    url_example = "postgresql+asyncpg://user:pass@host:port/db"
    print(f"  export DATABASE_URL='{url_example}'")
    print()
    print("Ou use Railway CLI:")
    print("  railway run python seed_production.py")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.seeds import run_seeds  # noqa: E402

if __name__ == "__main__":
    print("⚠️  ATENÇÃO: Conectando ao banco de produção!")
    print()
    asyncio.run(run_seeds())
