#!/usr/bin/env python3
"""
Script de migração para adicionar colunas image_url e created_at à tabela services
Execute com: docker-compose exec backend python migrate_add_image_url.py
"""

import asyncio
import asyncpg
import os


async def migrate():
    # Conectar ao banco de dados
    database_url = os.getenv(
        'DATABASE_URL',
        'postgresql://user:password@db/faz_de_tudo'
    )

    # Converter asyncpg URL se necessário
    if database_url.startswith('postgresql+asyncpg://'):
        database_url = database_url.replace('postgresql+asyncpg://', 'postgresql://')

    print(f"Conectando ao banco de dados...")
    conn = await asyncpg.connect(database_url)

    try:
        # Verificar se a coluna image_url já existe
        check_image_url = await conn.fetchval(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = 'services'
                AND column_name = 'image_url'
            );
            """
        )

        if not check_image_url:
            print("Adicionando coluna 'image_url' à tabela 'services'...")
            await conn.execute(
                "ALTER TABLE services ADD COLUMN image_url VARCHAR;"
            )
            print("✓ Coluna 'image_url' adicionada com sucesso!")
        else:
            print("✓ Coluna 'image_url' já existe.")

        # Verificar se a coluna created_at já existe
        check_created_at = await conn.fetchval(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = 'services'
                AND column_name = 'created_at'
            );
            """
        )

        if not check_created_at:
            print("Adicionando coluna 'created_at' à tabela 'services'...")
            await conn.execute(
                """
                ALTER TABLE services
                ADD COLUMN created_at TIMESTAMP WITH TIME ZONE
                DEFAULT CURRENT_TIMESTAMP;
                """
            )
            print("✓ Coluna 'created_at' adicionada com sucesso!")
        else:
            print("✓ Coluna 'created_at' já existe.")

        print("\n✅ Migração concluída com sucesso!")

    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(migrate())
