import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select
import sys
sys.path.insert(0, '/home/hermano/projetos/faz_de_tudo/backend')

from app.models import User, Service
from app.config import settings

async def check_professionals():
    # Conectar ao banco
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Buscar todos os profissionais
        query = select(User).filter(
            User.is_professional == True
        ).options(
            selectinload(User.services)
        )

        result = await session.execute(query)
        professionals = result.scalars().all()

        print(f"\n{'='*80}")
        print(f"Total de profissionais encontrados: {len(professionals)}")
        print(f"{'='*80}\n")

        for pro in professionals:
            print(f"ID: {pro.id}")
            print(f"Nome: {pro.name}")
            print(f"Email: {pro.email}")
            print(f"Status de Assinatura: {pro.subscription_status}")
            print(f"Categoria: {pro.category}")
            print(f"Cidade: {pro.city}/{pro.state}")
            print(f"Suspenso: {pro.is_suspended}")
            print(f"Número de serviços: {len(pro.services)}")

            if pro.services:
                print("  Serviços cadastrados:")
                for svc in pro.services:
                    print(f"    - {svc.title} (R$ {svc.price}, {svc.duration_type})")
            else:
                print("  ⚠️  Nenhum serviço cadastrado!")

            print(f"{'-'*80}\n")

        # Verificar se há profissionais com assinatura ativa
        active_pros = [p for p in professionals if p.subscription_status == 'active']
        print(f"\n{'='*80}")
        print(f"Profissionais com assinatura ATIVA: {len(active_pros)}")
        print(f"{'='*80}\n")

if __name__ == "__main__":
    asyncio.run(check_professionals())
