#!/usr/bin/env python3
"""
Script para configuração inicial do banco de produção.

Tarefas:
1. Atualizar trial_days do plano Trial para 30 dias
2. Criar usuário administrador

IMPORTANTE: Configure DATABASE_URL como variável de ambiente!

Uso:
    railway run python setup_production.py
"""

import sys
import os
import asyncio

# Usar DATABASE_URL do ambiente
if not os.getenv("DATABASE_URL"):
    print("❌ ERRO: Variável DATABASE_URL não configurada!")
    print()
    print("Use Railway CLI:")
    print("  railway run python setup_production.py")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models import SubscriptionPlan, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def update_trial_days():
    """Atualiza o plano Trial para 30 dias."""
    print("=" * 60)
    print("ATUALIZANDO PLANO TRIAL PARA 30 DIAS")
    print("=" * 60)
    print()

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.slug == "trial")
        )
        trial_plan = result.scalar_one_or_none()

        if not trial_plan:
            print("❌ Plano Trial não encontrado!")
            return False

        print(f"Plano encontrado: {trial_plan.name}")
        print(f"  trial_days atual: {trial_plan.trial_days}")

        if trial_plan.trial_days == 30:
            print("  ✓ Já está configurado para 30 dias")
            return True

        # Atualizar para 30 dias
        trial_plan.trial_days = 30
        await db.commit()

        print(f"  ✓ Atualizado para 30 dias!")
        return True


async def create_admin():
    """Cria o usuário administrador."""
    print()
    print("=" * 60)
    print("CRIANDO USUÁRIO ADMINISTRADOR")
    print("=" * 60)
    print()

    admin_email = "admin@contratapro.com.br"
    admin_password = "D4y#2026$"

    async with AsyncSessionLocal() as db:
        # Verificar se já existe
        result = await db.execute(
            select(User).where(User.email == admin_email)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"⚠️  Usuário {admin_email} já existe!")
            print(f"   ID: {existing_admin.id}")
            print(f"   is_admin: {existing_admin.is_admin}")

            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                await db.commit()
                print("   ✓ Promovido para administrador!")

            return True

        # Criar novo admin
        hashed_password = pwd_context.hash(admin_password)

        admin = User(
            name="Administrador",
            email=admin_email,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True,
            is_professional=False
        )

        db.add(admin)
        await db.commit()
        await db.refresh(admin)

        print(f"✓ Administrador criado com sucesso!")
        print(f"  Email: {admin_email}")
        print(f"  ID: {admin.id}")
        print()
        print("⚠️  IMPORTANTE: Guarde a senha em local seguro!")

        return True


async def main():
    """Executa todas as tarefas de setup."""
    print()
    print("=" * 60)
    print("⚠️  SETUP DO BANCO DE PRODUÇÃO")
    print("=" * 60)
    print()

    try:
        # 1. Atualizar trial para 30 dias
        await update_trial_days()

        # 2. Criar admin
        await create_admin()

        print()
        print("=" * 60)
        print("✅ SETUP CONCLUÍDO COM SUCESSO!")
        print("=" * 60)
        print()

        return 0

    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
