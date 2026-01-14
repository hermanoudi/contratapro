import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_create_user_success(async_client):
    unique_email = f"test_{uuid.uuid4()}@example.com"
    payload = {
        "name": "Test User",
        "email": unique_email,
        "password": "securepassword123",
        "is_professional": True,
        "cep": "12345678",
        "city": "Test City",
        "state": "TS",
        "whatsapp": "11999999999",
        "category": "Test Category",
        "description": "Test Description"
    }
    response = await async_client.post("/users/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data

@pytest.mark.asyncio
async def test_create_user_long_password(async_client):
    # Test password longer than 72 bytes
    long_password = "a" * 100
    unique_email = f"long_{uuid.uuid4()}@example.com"
    payload = {
        "name": "Long Password User",
        "email": unique_email,
        "password": long_password,
        "is_professional": True
    }
    response = await async_client.post("/users/", json=payload)
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_create_user_duplicate_email(async_client):
    unique_email = f"dup_{uuid.uuid4()}@example.com"
    payload = {
        "name": "Duplicate User",
        "email": unique_email,
        "password": "123",
        "is_professional": False
    }
    # First creation
    await async_client.post("/users/", json=payload)
    # Second creation
    response = await async_client.post("/users/", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"
