import pytest


# Home usa /users/search?limit= para mostrar só alguns profissionais
@pytest.mark.asyncio
async def test_search_accepts_limit(async_client):
    r = await async_client.get("/users/search?limit=3")
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_search_rejects_invalid_limit(async_client):
    r = await async_client.get("/users/search?limit=0")
    assert r.status_code == 422
