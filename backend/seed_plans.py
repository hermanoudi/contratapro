#!/usr/bin/env python3
"""
Script para criar planos de assinatura no banco de produção Railway.

IMPORTANTE: Configure DATABASE_URL como variável de ambiente!

Uso:
    DATABASE_URL="sua-url-aqui" python seed_plans.py

Ou via Railway CLI:
    railway run python seed_plans.py
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
    print("  railway run python seed_plans.py")
    sys.exit(1)

# Adicionar o diretório app ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal  # noqa: E402
from app.models import SubscriptionPlan  # noqa: E402
from sqlalchemy import select  # noqa: E402


# Definição dos planos
PLANS = [
    {
        "name": "Trial",
        "slug": "trial",
        "price": 0.0,
        "max_services": 3,
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 0,
        "trial_days": 30,
        "is_active": True
    },
    {
        "name": "Basic",
        "slug": "basic",
        "price": 29.90,
        "max_services": 5,
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 0,
        "trial_days": None,
        "is_active": True
    },
    {
        "name": "Premium",
        "slug": "premium",
        "price": 49.90,
        "max_services": None,  # Ilimitado
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 1,
        "trial_days": None,
        "is_active": True
    }
]


async def seed_plans():
    """
    Popula o banco de dados com os planos de assinatura.
    Executa apenas se a tabela estiver vazia.
    """
    async with AsyncSessionLocal() as db:
        # Verificar se já existem planos
        result = await db.execute(select(SubscriptionPlan))
        existing_count = len(result.scalars().all())

        if existing_count > 0:
            print(f"✓ Planos já existem no banco ({existing_count} registros).")
            print("\nPlanos existentes:")
            result = await db.execute(select(SubscriptionPlan))
            for plan in result.scalars().all():
                price_str = f"R$ {plan.price:.2f}" if plan.price > 0 else "Grátis"
                services = f"{plan.max_services} serviços" if plan.max_services else "Ilimitado"
                trial = f" ({plan.trial_days} dias trial)" if plan.trial_days else ""
                print(f"  - {plan.name}: {price_str} - {services}{trial}")
            return

        print("Iniciando seed de planos de assinatura...")
        print()

        for plan_data in PLANS:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)

            price_str = f"R$ {plan_data['price']:.2f}" if plan_data['price'] > 0 else "Grátis"
            services = f"{plan_data['max_services']} serviços" if plan_data['max_services'] else "Ilimitado"
            trial = f" ({plan_data['trial_days']} dias trial)" if plan_data['trial_days'] else ""

            print(f"  ✓ {plan_data['name']}: {price_str} - {services}{trial}")

        await db.commit()
        print()
        print(f"✓ {len(PLANS)} planos inseridos com sucesso!")


async def run():
    """
    Executa o seed de planos.
    """
    try:
        print("=" * 60)
        print("⚠️  ATENÇÃO: Conectando ao BANCO DE PRODUÇÃO!")
        print("=" * 60)
        print()
        print("CRIANDO PLANOS DE ASSINATURA")
        print("=" * 60)
        print()

        await seed_plans()

        print()
        print("=" * 60)
        print("✅ Planos criados no banco de produção!")
        print("=" * 60)
        print()
        print("📊 Resumo dos Planos:")
        print()
        print("┌──────────┬──────────┬──────────────┬─────────┬──────────┐")
        print("│   Plano  │   Preço  │  Serviços    │  Busca  │  Trial   │")
        print("├──────────┼──────────┼──────────────┼─────────┼──────────┤")
        print("│  Trial   │  Grátis  │  3 serviços  │  Normal │ 30 dias  │")
        print("│  Basic   │ R$ 29.90 │  5 serviços  │  Normal │    -     │")
        print("│  Premium │ R$ 49.90 │  Ilimitado   │ Destaque│    -     │")
        print("└──────────┴──────────┴──────────────┴─────────┴──────────┘")
        print()

    except Exception as e:
        print(f"❌ Erro ao criar planos: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    print()
    asyncio.run(run())
    print()
