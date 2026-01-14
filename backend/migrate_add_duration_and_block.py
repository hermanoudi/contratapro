#!/usr/bin/env python3
"""
Script de migração para adicionar:
1. Campo duration_type à tabela services
2. Campo is_manual_block à tabela appointments

Execute com: docker-compose exec backend python migrate_add_duration_and_block.py
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
        # 1. Adicionar duration_type à tabela services
        check_duration_type = await conn.fetchval(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = 'services'
                AND column_name = 'duration_type'
            );
            """
        )

        if not check_duration_type:
            print("Adicionando coluna 'duration_type' à tabela 'services'...")
            await conn.execute(
                """
                ALTER TABLE services
                ADD COLUMN duration_type VARCHAR NOT NULL DEFAULT 'hourly';
                """
            )
            print("✓ Coluna 'duration_type' adicionada com sucesso!")
        else:
            print("✓ Coluna 'duration_type' já existe.")

        # 2. Adicionar is_manual_block à tabela appointments
        check_manual_block = await conn.fetchval(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_name = 'appointments'
                AND column_name = 'is_manual_block'
            );
            """
        )

        if not check_manual_block:
            print("Adicionando coluna 'is_manual_block' à tabela 'appointments'...")
            await conn.execute(
                """
                ALTER TABLE appointments
                ADD COLUMN is_manual_block BOOLEAN NOT NULL DEFAULT FALSE;
                """
            )
            print("✓ Coluna 'is_manual_block' adicionada com sucesso!")
        else:
            print("✓ Coluna 'is_manual_block' já existe.")

        print("\n✅ Migração concluída com sucesso!")

    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(migrate())
