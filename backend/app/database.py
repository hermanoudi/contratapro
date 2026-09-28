# backend/app/database.py
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

from .config import settings

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo")

# Converter postgresql:// para postgresql+asyncpg:// (Railway injeta sem asyncpg)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# echo=True logava todo SQL executado (incluindo dados sensíveis) em stdout
# incondicionalmente, inclusive em produção. Defina DEBUG=true no ambiente
# para reativar localmente quando precisar depurar queries.
engine = create_async_engine(DATABASE_URL, echo=settings.DEBUG, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
