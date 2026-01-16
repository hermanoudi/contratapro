#!/usr/bin/env python3
"""
Script para configuração inicial do banco de produção.

Tarefas:
1. Atualizar trial_days do plano Trial para 30 dias
2. Criar usuário administrador

IMPORTANTE:
- Configure DATABASE_URL como variável de ambiente
- Configure ADMIN_EMAIL e ADMIN_PASSWORD como variáveis de ambiente
- OU passe como argumentos de linha de comando

Uso com variáveis de ambiente:
    export ADMIN_EMAIL="admin@exemplo.com"
    export ADMIN_PASSWORD="sua-senha-segura"
    railway run python setup_production.py

Uso com argumentos:
    railway run python setup_production.py --email admin@exemplo.com --password "sua-senha"

NUNCA COMMITAR SENHAS NO GIT!
"""

import sys
import os
import asyncio
import argparse

# Usar DATABASE_URL do ambiente
if not os.getenv("DATABASE_URL"):
    print("=" * 60)
    print("ERRO: Variável DATABASE_URL não configurada!")
    print("=" * 60)
    print()
    print("Use Railway CLI:")
    print("  railway run python setup_production.py --email EMAIL --password SENHA")
    sys.exit(1)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import SubscriptionPlan, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def parse_args():
    """Parse argumentos de linha de comando."""
    parser = argparse.ArgumentParser(
        description="Setup inicial do banco de produção",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  railway run python setup_production.py --email admin@exemplo.com --password "MinhaSenha123"

  # Ou usando variáveis de ambiente:
  export ADMIN_EMAIL="admin@exemplo.com"
  export ADMIN_PASSWORD="MinhaSenha123"
  railway run python setup_production.py
        """
    )

    parser.add_argument(
        "--email",
        default=os.getenv("ADMIN_EMAIL"),
        help="Email do administrador (ou use ADMIN_EMAIL env var)"
    )
    parser.add_argument(
        "--password",
        default=os.getenv("ADMIN_PASSWORD"),
        help="Senha do administrador (ou use ADMIN_PASSWORD env var)"
    )
    parser.add_argument(
        "--name",
        default=os.getenv("ADMIN_NAME", "Administrador"),
        help="Nome do administrador (default: Administrador)"
    )
    parser.add_argument(
        "--skip-admin",
        action="store_true",
        help="Pular criação do admin (apenas atualizar trial)"
    )

    return parser.parse_args()


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
            print("Plano Trial nao encontrado!")
            return False

        print(f"Plano encontrado: {trial_plan.name}")
        print(f"  trial_days atual: {trial_plan.trial_days}")

        if trial_plan.trial_days == 30:
            print("  Ja esta configurado para 30 dias")
            return True

        # Atualizar para 30 dias
        trial_plan.trial_days = 30
        await db.commit()

        print(f"  Atualizado para 30 dias!")
        return True


async def create_admin(email: str, password: str, name: str):
    """Cria o usuário administrador."""
    print()
    print("=" * 60)
    print("CRIANDO USUARIO ADMINISTRADOR")
    print("=" * 60)
    print()

    async with AsyncSessionLocal() as db:
        # Verificar se já existe
        result = await db.execute(
            select(User).where(User.email == email)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"Usuario {email} ja existe!")
            print(f"   ID: {existing_admin.id}")
            print(f"   is_admin: {existing_admin.is_admin}")

            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                await db.commit()
                print("   Promovido para administrador!")

            return True

        # Criar novo admin
        hashed_password = pwd_context.hash(password)

        admin = User(
            name=name,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True,
            is_professional=False
        )

        db.add(admin)
        await db.commit()
        await db.refresh(admin)

        print(f"Administrador criado com sucesso!")
        print(f"  Email: {email}")
        print(f"  ID: {admin.id}")

        return True


async def main():
    """Executa todas as tarefas de setup."""
    args = parse_args()

    print()
    print("=" * 60)
    print("SETUP DO BANCO DE PRODUCAO")
    print("=" * 60)
    print()

    try:
        # 1. Atualizar trial para 30 dias
        await update_trial_days()

        # 2. Criar admin (se não pular)
        if not args.skip_admin:
            if not args.email or not args.password:
                print()
                print("=" * 60)
                print("ERRO: Email e senha do admin sao obrigatorios!")
                print("=" * 60)
                print()
                print("Use:")
                print("  --email EMAIL --password SENHA")
                print()
                print("Ou configure as variaveis de ambiente:")
                print("  export ADMIN_EMAIL='admin@exemplo.com'")
                print("  export ADMIN_PASSWORD='sua-senha-segura'")
                print()
                return 1

            await create_admin(args.email, args.password, args.name)
        else:
            print()
            print("Criacao de admin pulada (--skip-admin)")

        print()
        print("=" * 60)
        print("SETUP CONCLUIDO COM SUCESSO!")
        print("=" * 60)
        print()

        return 0

    except Exception as e:
        print(f"Erro: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
