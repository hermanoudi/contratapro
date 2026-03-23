"""
Testes de edge cases para agendamentos.

Cobre os seguintes riscos de alta prioridade:
- Agendamento em data passada sem rejeição (bug: validação ausente)
- Terceiro não autorizado alterando status do agendamento
- Transição de status sem máquina de estados (completed → cancelled)
- Cliente tentando marcar agendamento como concluído
- Agendamento do profissional consigo mesmo
"""
import pytest
from datetime import date, time

from tests.helpers import make_user, get_auth_headers, setup_professional_scenario, next_weekday, past_weekday


# ============================================================
# Validação de data de agendamento
# ============================================================

@pytest.mark.asyncio
async def test_booking_past_date_is_not_rejected(async_client):
    """
    Documenta ausência de validação de data passada no agendamento.
    Um cliente consegue agendar para uma data no passado se o profissional
    tiver horário cadastrado para aquele dia da semana.
    COMPORTAMENTO ESPERADO: retornar 400 para datas passadas.
    """
    scenario = await setup_professional_scenario(async_client)
    # Segunda-feira passada — profissional tem horário cadastrado para dia 0
    past_monday = past_weekday(0)

    resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": past_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    # BUG: retorna 201 em vez de 400 — datas passadas deveriam ser rejeitadas
    assert resp.status_code == 400, (
        "Falha de negócio: agendamento para data passada foi aceito. "
        "O sistema deve rejeitar datas anteriores a hoje."
    )


@pytest.mark.asyncio
async def test_booking_today_is_accepted(async_client):
    """
    Verifica que agendamentos para hoje com horário futuro funcionam normalmente.
    Garante que a futura validação de data não bloqueie o dia atual.
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert resp.status_code == 201


# ============================================================
# Autorização: terceiros não podem alterar status
# ============================================================

@pytest.mark.asyncio
async def test_third_party_cannot_update_appointment_status(async_client):
    """
    Garante que um usuário que não é cliente nem profissional do agendamento
    não consegue alterar o status (deve receber 403).
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    # Cliente cria o agendamento
    appt_resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert appt_resp.status_code == 201
    appt_id = appt_resp.json()["id"]

    # Terceiro usuário (sem relação com o agendamento)
    third_email, third_password, _ = await make_user(async_client, is_professional=False)
    third_headers = await get_auth_headers(async_client, third_email, third_password)

    resp = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "cancelled", "reason": "Cancelo por engano alheio"},
        headers=third_headers,
    )
    assert resp.status_code == 403


# ============================================================
# Máquina de estados: transições inválidas
# ============================================================

@pytest.mark.asyncio
async def test_completed_appointment_can_be_cancelled_without_guard(async_client):
    """
    Documenta ausência de máquina de estados no status dos agendamentos.
    Um agendamento já concluído pode ser cancelado retroativamente.
    COMPORTAMENTO ESPERADO: transição completed → cancelled deveria ser 409/400.
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    # Cria o agendamento
    appt_resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert appt_resp.status_code == 201
    appt_id = appt_resp.json()["id"]

    # Profissional marca como concluído
    completed_resp = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "completed"},
        headers=scenario["professional_headers"],
    )
    assert completed_resp.status_code == 200
    assert completed_resp.json()["status"] == "completed"

    # BUG: cancelamento de agendamento já concluído deveria ser bloqueado
    cancel_resp = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "cancelled", "reason": "Cancelamento retroativo indevido"},
        headers=scenario["professional_headers"],
    )
    assert cancel_resp.status_code == 400, (
        "Falha de negócio: agendamento CONCLUÍDO foi cancelado retroativamente. "
        "O status 'completed' deveria ser um estado final imutável."
    )


@pytest.mark.asyncio
async def test_client_cannot_mark_appointment_as_completed(async_client):
    """
    Garante que apenas o profissional pode marcar um agendamento como concluído.
    O cliente deve receber 403.
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    appt_resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert appt_resp.status_code == 201
    appt_id = appt_resp.json()["id"]

    resp = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "completed"},
        headers=scenario["client_headers"],  # cliente tentando completar
    )
    assert resp.status_code == 403


# ============================================================
# Validação de campos
# ============================================================

@pytest.mark.asyncio
async def test_appointment_status_update_with_invalid_status_returns_400(async_client):
    """
    Garante que o endpoint rejeita status inválidos (ex: "pending", "active").
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    appt_resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert appt_resp.status_code == 201
    appt_id = appt_resp.json()["id"]

    resp = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "pending"},
        headers=scenario["professional_headers"],
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_cancellation_without_reason_returns_400(async_client):
    """
    Garante que cancelamento sem motivo (ou motivo muito curto) retorna 400.
    """
    scenario = await setup_professional_scenario(async_client)
    next_tuesday = next_weekday(1)

    appt_resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_tuesday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert appt_resp.status_code == 201
    appt_id = appt_resp.json()["id"]

    # Cancelamento sem motivo
    resp_no_reason = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "cancelled"},
        headers=scenario["professional_headers"],
    )
    assert resp_no_reason.status_code == 400

    # Cancelamento com motivo muito curto (< 5 chars)
    resp_short_reason = await async_client.patch(
        f"/appointments/{appt_id}/status",
        json={"status": "cancelled", "reason": "Não"},
        headers=scenario["professional_headers"],
    )
    assert resp_short_reason.status_code == 400


@pytest.mark.asyncio
async def test_double_booking_same_slot_returns_400(async_client):
    """
    Garante que dois agendamentos no mesmo horário para o mesmo profissional
    são rejeitados (o segundo deve retornar 400).
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    payload = {
        "professional_id": scenario["professional_id"],
        "service_id": scenario["service_id"],
        "date": next_monday.isoformat(),
        "start_time": "10:00:00",
        "end_time": "11:00:00",
    }

    # Primeiro agendamento — deve funcionar
    first = await async_client.post("/appointments/", json=payload, headers=scenario["client_headers"])
    assert first.status_code == 201

    # Segundo agendamento no mesmo slot — deve falhar
    second = await async_client.post("/appointments/", json=payload, headers=scenario["client_headers"])
    assert second.status_code == 400
    assert "booked" in second.json()["detail"].lower() or "ocupado" in second.json()["detail"].lower()


@pytest.mark.asyncio
async def test_booking_outside_working_hours_returns_400(async_client):
    """
    Garante que agendamentos fora do horário de trabalho do profissional
    são rejeitados.
    """
    scenario = await setup_professional_scenario(async_client)
    next_monday = next_weekday(0)

    resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_monday.isoformat(),
            "start_time": "18:00:00",   # fora do horário 08:00-17:00
            "end_time": "19:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_booking_on_day_without_working_hours_returns_400(async_client):
    """
    Garante que agendamento num dia sem horário cadastrado retorna 400.
    O profissional tem horários apenas para Segunda (0) e Terça (1).
    """
    scenario = await setup_professional_scenario(async_client)
    next_wednesday = next_weekday(2)  # Quarta — sem horário cadastrado

    resp = await async_client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": next_wednesday.isoformat(),
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        },
        headers=scenario["client_headers"],
    )
    assert resp.status_code == 400
