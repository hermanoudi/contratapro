#!/usr/bin/env python3
"""
Script de migração de dados: Trial/Basic/Premium → Free/Pro/Premium

PRÉ-REQUISITO: A migration Alembic já deve ter sido aplicada:
    docker-compose exec backend alembic upgrade head
    # ou: railway run python -m alembic upgrade head

O QUE ESTE SCRIPT FAZ:
  1. Upsert dos 3 planos (Free, Pro, Premium) com valores corretos
  2. Migra usuários que estão no plano 'trial' (antigo) para 'free':
       - Limpa trial_ends_at (free é permanente)
       - Status 'expired' → 'active'
       - Status 'trial'   → 'active'
  3. Exibe resumo completo do que foi alterado

USO:
    railway run python migrate_to_free_plans.py
    # ou:
    DATABASE_URL="postgresql+asyncpg://..." python migrate_to_free_plans.py
"""

import sys
import os
import asyncio
from datetime import datetime

if not os.getenv("DATABASE_URL"):
    print("❌ ERRO: Variável DATABASE_URL não configurada!")
    print()
    print("Use Railway CLI:")
    print("  railway run python migrate_to_free_plans.py")
    print()
    print("Ou exporte manualmente:")
    print("  export DATABASE_URL='postgresql+asyncpg://user:pass@host:port/db'")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, update, text  # noqa: E402
from app.database import AsyncSessionLocal  # noqa: E402
from app.models import SubscriptionPlan, User  # noqa: E402


# ──────────────────────────────────────────
# Definição canônica dos planos novos
# ──────────────────────────────────────────
PLANS = [
    {
        "name": "Free",
        "slug": "free",
        "price": 0.0,
        "max_services": 1,
        "max_appointments_per_month": 3,
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 0,
        "trial_days": None,
        "badge_label": None,
        "is_active": True,
    },
    {
        "name": "Pro",
        "slug": "pro",
        "price": 19.90,
        "max_services": None,           # Ilimitado
        "max_appointments_per_month": None,  # Ilimitado
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 1,
        "trial_days": None,
        "badge_label": "Profissional Ativo",
        "is_active": True,
    },
    {
        "name": "Premium",
        "slug": "premium",
        "price": 39.90,
        "max_services": None,           # Ilimitado
        "max_appointments_per_month": None,  # Ilimitado
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 2,
        "trial_days": None,
        "badge_label": "Destaque",
        "is_active": True,
    },
]

# Mapeamento de slugs antigos → novos (para renomear se ainda existirem)
SLUG_RENAMES = {
    "trial": "free",
    "basic": "pro",
}


async def check_columns_exist(db) -> bool:
    """Verifica se as colunas novas já existem na tabela."""
    result = await db.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'subscription_plans'
          AND column_name IN ('max_appointments_per_month', 'badge_label')
    """))
    cols = {row[0] for row in result.fetchall()}
    missing = {'max_appointments_per_month', 'badge_label'} - cols
    return missing


async def upsert_plans(db) -> dict:
    """
    Upsert dos planos pela seguinte lógica de prioridade:
      1. Se o slug novo já existe → atualiza campos
      2. Se o slug antigo existe (ex: 'trial') → renomeia + atualiza
      3. Se nenhum existe → insere como novo
    """
    stats = {"inserted": 0, "updated": 0}

    for plan_data in PLANS:
        new_slug = plan_data["slug"]
        old_slug = next((k for k, v in SLUG_RENAMES.items() if v == new_slug), None)

        # Tenta achar pelo slug novo
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.slug == new_slug)
        )
        plan = result.scalar_one_or_none()

        # Se não achou pelo novo, tenta pelo slug antigo
        if plan is None and old_slug:
            result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.slug == old_slug)
            )
            plan = result.scalar_one_or_none()
            if plan:
                print(f"    ↳ Renomeando slug '{old_slug}' → '{new_slug}'")

        if plan:
            for k, v in plan_data.items():
                setattr(plan, k, v)
            action = "atualizado"
            stats["updated"] += 1
        else:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
            action = "inserido"
            stats["inserted"] += 1

        price_str = f"R$ {plan_data['price']:.2f}" if plan_data["price"] > 0 else "Grátis"
        services = str(plan_data["max_services"]) + " serviço(s)" if plan_data["max_services"] else "Ilimitado"
        appts = f", {plan_data['max_appointments_per_month']} agendamentos/mês" if plan_data["max_appointments_per_month"] else ""
        print(f"  ✓ [{action}] {plan_data['name']}: {price_str} — {services}{appts}")

    await db.flush()  # Garante que os IDs estão disponíveis antes de migrar usuários
    return stats


async def migrate_users(db) -> dict:
    """
    Migra usuários do plano trial (antigo) para free:
      - Limpa trial_ends_at
      - Status 'expired' ou 'trial' → 'active'
    Retorna contagens para o relatório final.
    """
    stats = {"cleaned_trial_ends": 0, "expired_fixed": 0, "trial_status_fixed": 0}

    # Busca o plano free (agora já existe após upsert)
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.slug == "free")
    )
    free_plan = result.scalar_one_or_none()
    if not free_plan:
        print("  ⚠️  Plano free não encontrado — skip migração de usuários")
        return stats

    # Busca todos os usuários no plano free com trial_ends_at preenchido
    result = await db.execute(
        select(User).where(
            User.subscription_plan_id == free_plan.id,
            User.trial_ends_at.isnot(None)
        )
    )
    users_with_trial = result.scalars().all()

    for user in users_with_trial:
        user.trial_ends_at = None
        stats["cleaned_trial_ends"] += 1
        # Corrige status 'expired' → 'active'
        if user.subscription_status == "expired":
            user.subscription_status = "active"
            stats["expired_fixed"] += 1
        # Corrige status 'trial' → 'active'
        elif user.subscription_status == "trial":
            user.subscription_status = "active"
            stats["trial_status_fixed"] += 1

    # Usuários com subscription_status='trial' no plano free (sem trial_ends_at)
    result = await db.execute(
        select(User).where(
            User.subscription_plan_id == free_plan.id,
            User.subscription_status == "trial"
        )
    )
    trial_status_users = result.scalars().all()
    for user in trial_status_users:
        user.subscription_status = "active"
        stats["trial_status_fixed"] += 1

    return stats


async def run_migration():
    async with AsyncSessionLocal() as db:
        print()
        print("=" * 60)
        print("  MIGRAÇÃO: Trial/Basic/Premium → Free/Pro/Premium")
        print("=" * 60)
        print()

        # 1. Verificar colunas
        print("► Verificando colunas novas na tabela subscription_plans...")
        missing = await check_columns_exist(db)
        if missing:
            print(f"  ⚠️  Colunas ausentes: {missing}")
            print()
            print("  ATENÇÃO: Execute a migration Alembic antes deste script:")
            print("    docker-compose exec backend alembic upgrade head")
            print("    # ou: railway run python -m alembic upgrade head")
            print()
            sys.exit(1)
        else:
            print("  ✓ Colunas max_appointments_per_month e badge_label existem")
        print()

        # 2. Upsert de planos
        print("► Criando/atualizando planos...")
        plan_stats = await upsert_plans(db)
        print()

        # 3. Migrar usuários
        print("► Migrando usuários do Trial antigo para Free...")
        user_stats = await migrate_users(db)

        total_users = (
            user_stats["cleaned_trial_ends"]
            + user_stats["trial_status_fixed"]
        )
        if total_users == 0:
            print("  ✓ Nenhum usuário para migrar (já OK)")
        else:
            print(f"  ✓ {user_stats['cleaned_trial_ends']} usuário(s) tiveram trial_ends_at removido")
            if user_stats["expired_fixed"]:
                print(f"  ✓ {user_stats['expired_fixed']} usuário(s) reativados (expired → active)")
            if user_stats["trial_status_fixed"]:
                print(f"  ✓ {user_stats['trial_status_fixed']} usuário(s) com status 'trial' corrigidos para 'active'")
        print()

        # 4. Commit
        await db.commit()

        # 5. Relatório final
        print("=" * 60)
        print("  ✅ Migração concluída com sucesso!")
        print("=" * 60)
        print()
        print("  Planos em produção:")
        print()
        print("  ┌──────────┬───────────┬──────────────┬────────────────┐")
        print("  │  Plano   │   Preço   │   Serviços   │  Agendamentos  │")
        print("  ├──────────┼───────────┼──────────────┼────────────────┤")
        print("  │  Free    │  Grátis   │  1 serviço   │  3 / mês       │")
        print("  │  Pro     │ R$ 19,90  │  Ilimitado   │  Ilimitado     │")
        print("  │  Premium │ R$ 39,90  │  Ilimitado   │  Ilimitado     │")
        print("  └──────────┴───────────┴──────────────┴────────────────┘")
        print()
        print(f"  Planos: {plan_stats['inserted']} inserido(s), {plan_stats['updated']} atualizado(s)")
        print(f"  Usuários migrados: {total_users}")
        print()


if __name__ == "__main__":
    print()
    asyncio.run(run_migration())
    print()
