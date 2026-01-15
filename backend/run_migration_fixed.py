#!/usr/bin/env python3
"""
Script para executar migration no banco de produção Railway.
Adiciona campos plan_id e trial_ends_at na tabela subscriptions.

Esta versão executa os comandos individualmente (compatível com asyncpg).

IMPORTANTE: Configure DATABASE_URL como variável de ambiente!

Uso:
    DATABASE_URL="sua-url-aqui" python run_migration_fixed.py

Ou via Railway CLI:
    railway run python run_migration_fixed.py
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
    print("  railway run python run_migration_fixed.py")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine  # noqa: E402
from sqlalchemy import text  # noqa: E402


async def run_migration():
    """Executa a migration SQL comando por comando"""

    commands = [
        "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES subscription_plans(id)",
        "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at DATE",
        "CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id)",
        "CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at ON subscriptions(trial_ends_at)"
    ]

    print("=" * 60)
    print("⚠️  EXECUTANDO MIGRATION NO BANCO DE PRODUÇÃO")
    print("=" * 60)
    print()

    try:
        async with engine.begin() as conn:
            print("Conectando ao banco...")
            print()

            # Executar cada comando separadamente
            for i, command in enumerate(commands, 1):
                print(f"[{i}/{len(commands)}] Executando: {command[:50]}...")
                await conn.execute(text(command))
                print(f"  ✓ Concluído")
                print()

            print("✓ Migration executada com sucesso!")
            print()
            print("Campos adicionados:")
            print("  - subscriptions.plan_id (FK para subscription_plans)")
            print("  - subscriptions.trial_ends_at (DATE)")
            print()
            print("Índices criados:")
            print("  - idx_subscriptions_plan_id")
            print("  - idx_subscriptions_trial_ends_at")
            print()

    except Exception as e:
        print(f"❌ Erro ao executar migration: {e}")
        import traceback
        traceback.print_exc()
        return False

    print("=" * 60)
    print("✅ MIGRATION CONCLUÍDA!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    print()
    result = asyncio.run(run_migration())
    print()
    sys.exit(0 if result else 1)
