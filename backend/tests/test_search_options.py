"""
Opções do filtro de busca: só categorias e cidades de profissionais visíveis.
"""
import pytest
from sqlalchemy import select

from app.database import get_db
from app.main import app
from app.models import User
from tests.helpers import make_user


async def _set(user_id, **fields):
    async for session in app.dependency_overrides[get_db]():
        user = (await session.execute(select(User).where(User.id == user_id))).scalar_one()
        for key, value in fields.items():
            setattr(user, key, value)
        await session.commit()
        return


@pytest.mark.asyncio
async def test_search_options_only_visible_professionals(async_client):
    _, _, visible = await make_user(async_client, is_professional=True)
    await _set(visible["id"], category="Eletricista", city="Campinas", subscription_status="active")

    _, _, dup = await make_user(async_client, is_professional=True)
    await _set(dup["id"], category="eletricista ", city="campinas", subscription_status="active")

    _, _, suspended = await make_user(async_client, is_professional=True)
    await _set(suspended["id"], category="Pintor", city="Santos",
               subscription_status="active", is_suspended=True)

    _, _, expired = await make_user(async_client, is_professional=True)
    await _set(expired["id"], category="Diarista", city="Recife", subscription_status="expired")

    resp = await async_client.get("/users/search-options")
    assert resp.status_code == 200
    data = resp.json()
    assert data["categories"] == ["Eletricista"]
    assert data["cities"] == ["Campinas"]

    # A busca por cidade encontra o profissional visível
    found = await async_client.get("/users/search-by-service", params={"city": "Campinas"})
    assert visible["id"] in [p["id"] for p in found.json()]
