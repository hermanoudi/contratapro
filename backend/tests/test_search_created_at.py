import pytest
from sqlalchemy import update

from app.database import get_db
from app.main import app
from app.models import User
from tests.helpers import make_user


@pytest.mark.asyncio
async def test_search_returns_created_at_for_trust_signal(async_client):
    """A Home mostra "no ContrataPro desde" a partir do created_at real do profissional."""
    _, _, pro = await make_user(async_client, is_professional=True, whatsapp="11999999999")

    # Mesma sessão de teste que o conftest injeta no app
    async for session in app.dependency_overrides[get_db]():
        await session.execute(update(User).where(User.id == pro["id"]).values(subscription_status="active"))
        await session.commit()

    r = await async_client.get("/users/search?limit=6")
    assert r.status_code == 200, r.text
    found = [p for p in r.json() if p["id"] == pro["id"]]
    assert found, "profissional ativo deveria aparecer na busca"
    assert found[0]["created_at"]
