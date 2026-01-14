#!/usr/bin/env python3
"""
Script para adicionar novas categorias ao banco de dados
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Import models
import sys
sys.path.append(os.path.dirname(__file__))
from app.models import Category

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo")

# Novas categorias
NEW_CATEGORIES = [
    {
        "name": "Churrasqueiro",
        "slug": "churrasqueiro",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Confeiteiro",
        "slug": "confeiteiro",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Decorador",
        "slug": "decorador",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Músico",
        "slug": "músico",
        "group": "Eventos e Entretenimento",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    }
]


async def add_categories():
    """Adiciona novas categorias ao banco de dados"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for cat_data in NEW_CATEGORIES:
            # Verificar se já existe
            result = await session.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                category = Category(**cat_data)
                session.add(category)
                print(f"✓ Categoria '{cat_data['name']}' adicionada")
            else:
                print(f"⊘ Categoria '{cat_data['name']}' já existe")

        await session.commit()

    await engine.dispose()
    print("\n✓ Processo concluído!")


if __name__ == "__main__":
    asyncio.run(add_categories())
