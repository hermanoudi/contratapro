#!/usr/bin/env python3
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def check_and_activate(email):
    async with AsyncSessionLocal() as db:
        # Verificar usuário
        result = await db.execute(
            text("SELECT id, name, email, is_professional, subscription_status FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()
        
        if not user:
            print(f"❌ Usuário com email '{email}' não encontrado!")
            return
        
        print(f"\n📋 Usuário encontrado:")
        print(f"   ID: {user.id}")
        print(f"   Nome: {user.name}")
        print(f"   Email: {user.email}")
        print(f"   É Profissional: {user.is_professional}")
        print(f"   Status Assinatura: {user.subscription_status}")
        
        if user.subscription_status == 'active':
            print(f"\n✅ Assinatura já está ativa!")
            return
        
        # Ativar assinatura
        await db.execute(
            text("UPDATE users SET subscription_status = 'active' WHERE id = :id"),
            {"id": user.id}
        )
        await db.commit()
        
        print(f"\n✅ Assinatura ativada com sucesso!")
        
        # Verificar novamente
        result = await db.execute(
            text("SELECT subscription_status FROM users WHERE id = :id"),
            {"id": user.id}
        )
        new_status = result.scalar()
        print(f"   Novo status: {new_status}")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "musico@gmail.com"
    print(f"🔍 Buscando usuário: {email}")
    asyncio.run(check_and_activate(email))
