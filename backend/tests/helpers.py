"""
Helpers compartilhados para criação de fixtures nos testes de edge cases.
"""
import uuid
from datetime import date, timedelta
from httpx import AsyncClient


async def make_user(client: AsyncClient, is_professional: bool = False, **extra) -> tuple:
    """
    Cria um usuário via API e retorna (email, password, response_data).
    Usa UUID no email para garantir unicidade entre testes.
    """
    email = f"test_{uuid.uuid4()}@example.com"
    password = "Secure@123"
    payload = {
        "name": "Test User",
        "email": email,
        "password": password,
        "is_professional": is_professional,
        **extra,
    }
    resp = await client.post("/users/", json=payload)
    assert resp.status_code == 201, f"Falha ao criar usuário: {resp.text}"
    return email, password, resp.json()


async def get_auth_headers(client: AsyncClient, email: str, password: str) -> dict:
    """Faz login e retorna headers de autorização Bearer."""
    resp = await client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Falha no login: {resp.text}"
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


async def setup_professional_scenario(client: AsyncClient) -> dict:
    """
    Cria um profissional com plano free, serviço hourly e horários de trabalho
    para Segunda (0) e Terça (1), das 08:00 às 17:00.
    Retorna um dict com todos os dados do cenário.
    """
    pro_email, pro_password, pro_data = await make_user(
        client, is_professional=True, whatsapp="11999999999"
    )
    pro_headers = await get_auth_headers(client, pro_email, pro_password)
    professional_id = pro_data["id"]

    # Criar serviço hourly
    svc_resp = await client.post(
        "/services/",
        json={"title": "Serviço de Teste", "description": "Desc", "duration_type": "hourly"},
        headers=pro_headers,
    )
    assert svc_resp.status_code == 201, f"Falha ao criar serviço: {svc_resp.text}"
    service_id = svc_resp.json()["id"]

    # Criar horários de trabalho: Segunda (0) e Terça (1) 08:00-17:00
    for day in [0, 1]:
        wh_resp = await client.post(
            "/schedule/",
            json={"day_of_week": day, "start_time": "08:00:00", "end_time": "17:00:00"},
            headers=pro_headers,
        )
        assert wh_resp.status_code == 201, f"Falha ao criar horário: {wh_resp.text}"

    # Criar cliente
    cli_email, cli_password, cli_data = await make_user(client, is_professional=False)
    cli_headers = await get_auth_headers(client, cli_email, cli_password)

    return {
        "professional_id": professional_id,
        "professional_headers": pro_headers,
        "professional_email": pro_email,
        "professional_password": pro_password,
        "service_id": service_id,
        "client_id": cli_data["id"],
        "client_headers": cli_headers,
        "client_email": cli_email,
        "client_password": cli_password,
    }


def next_weekday(weekday: int) -> date:
    """Retorna a próxima data futura com o dia da semana informado (0=Segunda)."""
    today = date.today()
    days_ahead = weekday - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return today + timedelta(days=days_ahead)


def past_weekday(weekday: int) -> date:
    """Retorna a data passada mais recente com o dia da semana informado."""
    today = date.today()
    days_behind = today.weekday() - weekday
    if days_behind <= 0:
        days_behind += 7
    return today - timedelta(days=days_behind)
