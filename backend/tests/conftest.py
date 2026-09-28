"""
Fixtures compartilhadas dos testes.

Os testes rodam contra um banco SQLite em memória, isolado do banco de
desenvolvimento/produção configurado em DATABASE_URL — antes desta mudança,
`pytest` escrevia diretamente no banco real (ver plano de melhorias / Fase 0).

Limitação conhecida: SQLite não reproduz extensões específicas do Postgres
(pg_trgm) nem toda a semântica de transação usada em produção. Testes que
dependem especificamente de comportamento do Postgres devem ser marcados
e rodados à parte contra um Postgres real (ver Fase 5 do plano — CI).
"""
import os

# Precisa ser definido ANTES de qualquer import de `app.*`: `app.config.Settings()`
# é instanciado na primeira importação do módulo e falha propositalmente (Fase 1.1
# do plano de melhorias) se SECRET_KEY estiver ausente ou for um valor inseguro
# conhecido. Testes usam um segredo dummy, nunca o de produção/desenvolvimento.
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-use-only")
os.environ.setdefault("MERCADOPAGO_WEBHOOK_SECRET", "test-webhook-secret-not-for-production")

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import SubscriptionPlan
from app.rate_limit import limiter

# Espelha backend/seed_plans.py (fonte da verdade dos planos — ver Fase 2 do
# plano de melhorias). Sem isso, usuários profissionais criados nos testes
# ficam sem subscription_plan_id e os guards de plano em dependencies.py
# (check_can_create_service, check_can_manage_schedule) rejeitam tudo com 403,
# diferente do comportamento real da aplicação.
_SUBSCRIPTION_PLANS = [
    {
        "name": "Free", "slug": "free", "price": 0.0,
        "max_services": None, "max_appointments_per_month": 3,
        "can_manage_schedule": True, "can_receive_bookings": True,
        "priority_in_search": 0, "trial_days": None,
        "badge_label": None, "is_active": True,
    },
    {
        "name": "Pro", "slug": "pro", "price": 19.90,
        "max_services": None, "max_appointments_per_month": None,
        "can_manage_schedule": True, "can_receive_bookings": True,
        "priority_in_search": 1, "trial_days": None,
        "badge_label": "Profissional Ativo", "is_active": True,
    },
    {
        "name": "Premium", "slug": "premium", "price": 39.90,
        "max_services": None, "max_appointments_per_month": None,
        "can_manage_schedule": True, "can_receive_bookings": True,
        "priority_in_search": 2, "trial_days": None,
        "badge_label": "Destaque", "is_active": True,
    },
]

# Engine dedicado aos testes — nunca o `engine` de app.database, que aponta
# para DATABASE_URL (dev/produção). StaticPool mantém uma única conexão viva
# durante toda a sessão de testes, necessário porque "sqlite:///:memory:"
# cria um banco novo a cada nova conexão.
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def _override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture(autouse=True)
async def _isolated_database():
    """Recria o schema do zero e semeia os planos antes de cada teste."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        session.add_all(SubscriptionPlan(**data) for data in _SUBSCRIPTION_PLANS)
        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
def _reset_rate_limiter():
    """
    Limpa o storage em memória do rate limiter (app/rate_limit.py) antes de
    cada teste. Sem isso, os limites de /auth/login e /auth/forgot-password
    (Fase 1.4) seriam compartilhados entre todos os testes — que rodam com o
    mesmo IP simulado pelo ASGITransport — e a suíte inteira começaria a
    falhar com 429 depois de poucos testes.
    """
    limiter._storage.reset()
    yield


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
