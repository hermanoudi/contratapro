"""
Testes de edge cases para horários de trabalho.

Cobre os seguintes riscos de alta prioridade:
- Horário com end_time antes de start_time aceito sem validação (bug)
- Horários sobrepostos no mesmo dia aceitos sem verificação de overlap (bug)
- day_of_week fora do range 0-6
"""
import pytest
from tests.helpers import make_user, get_auth_headers


# ============================================================
# Validação de campos de tempo
# ============================================================

@pytest.mark.asyncio
async def test_working_hour_end_before_start_is_accepted_without_validation(async_client):
    """
    Documenta a ausência de validação temporal nos horários de trabalho.
    Um horário onde end_time < start_time é aceito sem erro.
    COMPORTAMENTO ESPERADO: retornar 400 ou 422 quando end_time <= start_time.
    """
    email, password, _ = await make_user(async_client, is_professional=True)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post(
        "/schedule/",
        json={
            "day_of_week": 0,
            "start_time": "17:00:00",  # start DEPOIS de end
            "end_time": "08:00:00",
        },
        headers=headers,
    )
    # BUG: retorna 201 em vez de 400/422
    assert resp.status_code in (400, 422), (
        "Falha de validação: horário com end_time < start_time foi aceito. "
        "O sistema deve rejeitar configurações onde o fim é antes do início."
    )


@pytest.mark.asyncio
async def test_working_hour_same_start_and_end_time_is_accepted_without_validation(async_client):
    """
    Documenta que start_time == end_time (duração zero) é aceito sem erro.
    COMPORTAMENTO ESPERADO: retornar 400 para horários com duração zero.
    """
    email, password, _ = await make_user(async_client, is_professional=True)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 1, "start_time": "10:00:00", "end_time": "10:00:00"},
        headers=headers,
    )
    assert resp.status_code in (400, 422), (
        "Falha de validação: horário com duração zero (start == end) foi aceito."
    )


# ============================================================
# Sobreposição de horários
# ============================================================

@pytest.mark.asyncio
async def test_overlapping_working_hours_same_day_are_accepted_without_validation(async_client):
    """
    Documenta a ausência de verificação de sobreposição de horários.
    Dois horários sobrepostos no mesmo dia são aceitos, causando comportamento
    indefinido ao verificar disponibilidade para agendamentos.
    COMPORTAMENTO ESPERADO: retornar 400 ao detectar sobreposição.

    Nota: o código tem comentário explícito "Check overlap logic could go here,
    but keeping it simple for MVP".
    """
    email, password, _ = await make_user(async_client, is_professional=True)
    headers = await get_auth_headers(async_client, email, password)

    # Primeiro horário: Segunda 08:00-17:00
    first_resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 0, "start_time": "08:00:00", "end_time": "17:00:00"},
        headers=headers,
    )
    assert first_resp.status_code == 201

    # Segundo horário sobreposto: Segunda 12:00-20:00
    second_resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 0, "start_time": "12:00:00", "end_time": "20:00:00"},
        headers=headers,
    )
    # BUG: 201 em vez de 400 — sobreposição não é verificada
    assert second_resp.status_code == 400, (
        "Falha de validação: dois horários sobrepostos no mesmo dia foram aceitos. "
        "O sistema deve detectar e rejeitar sobreposições de horários de trabalho."
    )


# ============================================================
# Validação de day_of_week
# ============================================================

@pytest.mark.asyncio
async def test_working_hour_invalid_day_of_week_above_six(async_client):
    """
    Garante que day_of_week = 7 (inválido, semana tem 0-6) é rejeitado.
    """
    email, password, _ = await make_user(async_client, is_professional=True)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 7, "start_time": "08:00:00", "end_time": "17:00:00"},
        headers=headers,
    )
    assert resp.status_code in (400, 422), (
        "day_of_week=7 é inválido — a semana tem apenas 7 dias (0 a 6)."
    )


@pytest.mark.asyncio
async def test_working_hour_negative_day_of_week(async_client):
    """
    Garante que day_of_week negativo é rejeitado.
    """
    email, password, _ = await make_user(async_client, is_professional=True)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": -1, "start_time": "08:00:00", "end_time": "17:00:00"},
        headers=headers,
    )
    assert resp.status_code in (400, 422)


# ============================================================
# Autorização
# ============================================================

@pytest.mark.asyncio
async def test_client_cannot_create_working_hours(async_client):
    """
    Garante que um cliente (não profissional) não pode criar horários de trabalho.
    """
    email, password, _ = await make_user(async_client, is_professional=False)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 0, "start_time": "08:00:00", "end_time": "17:00:00"},
        headers=headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_professional_cannot_delete_another_professionals_working_hour(async_client):
    """
    Garante que um profissional não pode deletar horários de trabalho de outro.
    """
    # Profissional A cria horário
    email_a, password_a, _ = await make_user(async_client, is_professional=True)
    headers_a = await get_auth_headers(async_client, email_a, password_a)

    wh_resp = await async_client.post(
        "/schedule/",
        json={"day_of_week": 0, "start_time": "08:00:00", "end_time": "17:00:00"},
        headers=headers_a,
    )
    assert wh_resp.status_code == 201
    wh_id = wh_resp.json()["id"]

    # Profissional B tenta deletar horário de A
    email_b, password_b, _ = await make_user(async_client, is_professional=True)
    headers_b = await get_auth_headers(async_client, email_b, password_b)

    delete_resp = await async_client.delete(f"/schedule/{wh_id}", headers=headers_b)
    assert delete_resp.status_code == 404  # Não encontrado para o usuário B
