-- Migration: Add user slug for friendly URLs
-- Data: 2026-02-04
-- Descricao: Adiciona campo slug aos usuarios para URLs amigaveis como /book/hermano-flavio

-- Passo 1: Adicionar coluna slug
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Passo 2: Criar indice unico (execute DEPOIS de popular os slugs)
-- CREATE UNIQUE INDEX IF NOT EXISTS ix_users_slug ON users(slug);

-- Passo 3: Gerar slugs para usuarios existentes
-- Execute este script Python via Railway CLI ou adapte para SQL puro:
--
-- Opcao A: Via Python (recomendado - rode via railway run python)
--
-- import asyncio
-- from app.database import async_session_maker
-- from app.models import User
-- from app.slug_utils import generate_unique_slug
-- from sqlalchemy.future import select
--
-- async def generate_slugs():
--     async with async_session_maker() as db:
--         result = await db.execute(select(User).filter(User.slug == None))
--         users = result.scalars().all()
--         for user in users:
--             user.slug = await generate_unique_slug(db, user.name, user.id)
--         await db.commit()
--         print(f"Slugs gerados para {len(users)} usuarios")
--
-- asyncio.run(generate_slugs())
--
-- Opcao B: Via SQL puro (funciona mas menos elegante)
-- Este script gera slugs simples baseados no ID:
UPDATE users SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            TRANSLATE(name,
                'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ',
                'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn'
            ),
            '[^a-zA-Z0-9 ]', '', 'g'
        ),
        ' +', '-', 'g'
    )
) || '-' || id::text
WHERE slug IS NULL;

-- Passo 4: Criar indice unico APOS popular os slugs
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_slug ON users(slug);

-- Verificar resultado
SELECT id, name, slug FROM users LIMIT 20;
