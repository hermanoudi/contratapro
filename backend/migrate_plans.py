#!/usr/bin/env python3
"""
Script de migração: substitui planos antigos (bronze/prata/ouro) pelos novos (trial/basic/premium).

- Insere/atualiza trial, basic, premium com valores corretos
- Migra usuários e subscriptions dos planos antigos para os novos
- Remove planos antigos do banco

Mapeamento:
  bronze → basic
  prata  → basic
  ouro   → premium
  trial  → trial (mantém, apenas atualiza valores)

Uso:
    docker-compose exec -T backend python migrate_plans.py
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import AsyncSessionLocal  # noqa: E402
from app.models import SubscriptionPlan, User, Subscription  # noqa: E402
from sqlalchemy import select, update, delete  # noqa: E402


# Definição dos planos corretos
NEW_PLANS = [
    {
        "name": "Trial",
        "slug": "trial",
        "price": 0.0,
        "max_services": 3,
        "can_manage_schedule": True,
        "can_receive_bookings": True,
        "priority_in_search": 0,
        "trial_days": 30,
        "is_active": True,
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
        "is_active": True,
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
        "is_active": True,
    },
]

# Mapeamento: slug antigo → slug novo
OLD_TO_NEW = {
    "bronze": "basic",
    "prata": "basic",
    "ouro": "premium",
}


async def migrate():
    async with AsyncSessionLocal() as db:
        print("=" * 60)
        print("MIGRAÇÃO DE PLANOS: bronze/prata/ouro → trial/basic/premium")
        print("=" * 60)
        print()

        # 1. Upsert dos novos planos
        print("1. Inserindo/atualizando planos corretos...")
        new_plan_ids = {}
        for plan_data in NEW_PLANS:
            result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.slug == plan_data["slug"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                for k, v in plan_data.items():
                    setattr(existing, k, v)
                print(f"   ✓ Atualizado: {plan_data['name']}")
            else:
                new_plan = SubscriptionPlan(**plan_data)
                db.add(new_plan)
                await db.flush()
                existing = new_plan
                print(f"   ✓ Inserido: {plan_data['name']}")
            new_plan_ids[plan_data["slug"]] = existing.id

        await db.flush()

        # Reler IDs após flush (pode ter mudado)
        for slug in ["trial", "basic", "premium"]:
            result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.slug == slug)
            )
            plan = result.scalar_one_or_none()
            if plan:
                new_plan_ids[slug] = plan.id

        print()

        # 2. Buscar planos antigos
        print("2. Buscando planos antigos (bronze/prata/ouro)...")
        old_plans = {}
        for old_slug in OLD_TO_NEW.keys():
            result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.slug == old_slug)
            )
            plan = result.scalar_one_or_none()
            if plan:
                old_plans[old_slug] = plan
                print(f"   Encontrado: {plan.name} (id={plan.id}) → será migrado para '{OLD_TO_NEW[old_slug]}'")
            else:
                print(f"   Não encontrado: {old_slug} (já foi migrado ou nunca existiu)")

        if not old_plans:
            print()
            print("✅ Nenhum plano antigo encontrado. Nada a migrar.")
            await db.commit()
            return

        print()

        # 3. Migrar users.subscription_plan_id
        print("3. Migrando usuários...")
        total_users = 0
        for old_slug, old_plan in old_plans.items():
            new_slug = OLD_TO_NEW[old_slug]
            new_id = new_plan_ids[new_slug]

            result = await db.execute(
                select(User).where(User.subscription_plan_id == old_plan.id)
            )
            affected_users = result.scalars().all()

            if affected_users:
                await db.execute(
                    update(User)
                    .where(User.subscription_plan_id == old_plan.id)
                    .values(subscription_plan_id=new_id)
                )
                total_users += len(affected_users)
                print(f"   ✓ {len(affected_users)} usuário(s) migrados de '{old_slug}' → '{new_slug}'")
            else:
                print(f"   - Nenhum usuário em '{old_slug}'")

        print(f"   Total: {total_users} usuário(s) migrado(s)")
        print()

        # 4. Migrar subscriptions.plan_id e scheduled_plan_id
        print("4. Migrando subscriptions...")
        total_subs = 0
        for old_slug, old_plan in old_plans.items():
            new_slug = OLD_TO_NEW[old_slug]
            new_id = new_plan_ids[new_slug]

            # plan_id
            result = await db.execute(
                select(Subscription).where(Subscription.plan_id == old_plan.id)
            )
            affected = result.scalars().all()
            if affected:
                await db.execute(
                    update(Subscription)
                    .where(Subscription.plan_id == old_plan.id)
                    .values(plan_id=new_id)
                )
                total_subs += len(affected)
                print(f"   ✓ {len(affected)} subscription(s) plan_id migrado de '{old_slug}' → '{new_slug}'")

            # scheduled_plan_id
            result = await db.execute(
                select(Subscription).where(Subscription.scheduled_plan_id == old_plan.id)
            )
            affected = result.scalars().all()
            if affected:
                await db.execute(
                    update(Subscription)
                    .where(Subscription.scheduled_plan_id == old_plan.id)
                    .values(scheduled_plan_id=new_id)
                )
                print(f"   ✓ {len(affected)} subscription(s) scheduled_plan_id migrado de '{old_slug}' → '{new_slug}'")

        print()

        # 5. Deletar planos antigos
        print("5. Removendo planos antigos...")
        for old_slug, old_plan in old_plans.items():
            await db.execute(
                delete(SubscriptionPlan).where(SubscriptionPlan.id == old_plan.id)
            )
            print(f"   ✓ Removido: {old_plan.name} (slug={old_slug})")

        await db.commit()
        print()
        print("=" * 60)
        print("✅ Migração concluída com sucesso!")
        print("=" * 60)
        print()
        print("Planos ativos:")
        result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))
        for plan in result.scalars().all():
            price = f"R$ {plan.price:.2f}" if plan.price > 0 else "Grátis"
            services = f"{plan.max_services} serviços" if plan.max_services else "Ilimitado"
            print(f"  - {plan.name} ({plan.slug}): {price} | {services}")


if __name__ == "__main__":
    asyncio.run(migrate())
