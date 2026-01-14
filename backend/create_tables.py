#!/usr/bin/env python3
"""
Script para criar todas as tabelas do banco de dados.

Uso:
    python create_tables.py

Este script cria todas as tabelas definidas nos models.
É seguro executar múltiplas vezes - SQLAlchemy não recria tabelas existentes.
"""

import asyncio
import sys
import os

# Adicionar o diretório app ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import (
    User, Service, Appointment, WorkingHours,
    SubscriptionPlan, Category
)


async def create_tables():
    """Cria todas as tabelas no banco de dados"""
    print("=" * 60)
    print("CRIANDO TABELAS DO BANCO DE DADOS")
    print("=" * 60)
    print()

    try:
        async with engine.begin() as conn:
            print("Conectando ao banco de dados...")

            # Criar todas as tabelas definidas nos models
            await conn.run_sync(Base.metadata.create_all)

            print()
            print("✓ Tabelas criadas com sucesso!")
            print()
            print("Tabelas criadas:")
            print("  - users")
            print("  - subscription_plans")
            print("  - categories")
            print("  - services")
            print("  - working_hours")
            print("  - appointments")
            print()

    except Exception as e:
        print()
        print(f"❌ Erro ao criar tabelas: {e}")
        print()
        return False

    print("=" * 60)
    print("TABELAS CRIADAS COM SUCESSO!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    print()
    result = asyncio.run(create_tables())
    print()

    if result:
        print("Próximos passos:")
        print("  1. Execute os seeds para popular categorias:")
        print("     python run_seeds.py")
        print()
        print("  2. Ou crie o primeiro usuário via API")
        print()
        sys.exit(0)
    else:
        sys.exit(1)
