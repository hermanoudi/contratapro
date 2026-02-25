import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
    # Dispor conexões do engine para evitar conflito entre event loops
    await engine.dispose()
