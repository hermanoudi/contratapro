#!/usr/bin/env python3
"""
Script para executar migration no banco de produção Railway.
Adiciona campos plan_id e trial_ends_at na tabela subscriptions.
"""

import sys
import os
import asyncio

# URL do banco Railway
PRODUCTION_DB_URL = "postgresql+asyncpg://postgres:QqSQgoCaOKitEWCNacZfbqOhIlSMYQVn@trolley.proxy.rlwy.net:11371/railway"
os.environ["DATABASE_URL"] = PRODUCTION_DB_URL

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
