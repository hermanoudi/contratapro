"""
Histórico de agendamentos e lista de notificações.

- Bloqueios manuais não entram no histórico nem no filtro de pessoas
  (o bloqueio grava o próprio profissional como cliente).
- A busca das notificações roda no banco, antes da paginação, e o total
  continua contando todas as páginas.
"""
import pytest

from app.main import app
from app.database import get_db
from tests.helpers import setup_professional_scenario, next_weekday
from app.models import Notification


async def _book(client, scenario, day, start, end):
    resp = await client.post(
        "/appointments/",
        json={
            "professional_id": scenario["professional_id"],
            "service_id": scenario["service_id"],
            "date": day.isoformat(),
            "start_time": start,
            "end_time": end,
        },
        headers=scenario["client_headers"],
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.mark.asyncio
async def test_history_skips_manual_blocks(async_client):
    scenario = await setup_professional_scenario(async_client)
    monday = next_weekday(0)
    appt = await _book(async_client, scenario, monday, "09:00:00", "10:00:00")

    block = await async_client.post(
        "/appointments/block",
        json={"date": monday.isoformat(), "start_time": "14:00:00", "end_time": "15:00:00"},
        headers=scenario["professional_headers"],
    )
    assert block.status_code == 201, block.text

    resp = await async_client.get("/appointments/history", headers=scenario["professional_headers"])
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert [item["id"] for item in data["items"]] == [appt["id"]]

    people = await async_client.get(
        "/appointments/history/filters/people", headers=scenario["professional_headers"]
    )
    assert people.status_code == 200
    assert [p["id"] for p in people.json()] == [scenario["client_id"]]


@pytest.mark.asyncio
async def test_notification_search_counts_every_page(async_client):
    scenario = await setup_professional_scenario(async_client)
    appt = await _book(async_client, scenario, next_weekday(0), "09:00:00", "10:00:00")

    # Mesma sessão que a API usa nos testes (override do conftest)
    async for session in app.dependency_overrides[get_db]():
        # 12 avisos do cliente: os pares ligados ao agendamento, os ímpares soltos
        session.add_all(
            Notification(
                user_id=scenario["client_id"],
                appointment_id=appt["id"] if i % 2 == 0 else None,
                type="new_appointment",
                channel="email",
                status="sent",
                title=f"Aviso {i}",
                message="x",
            )
            for i in range(12)
        )
        await session.commit()

    # Pelo título do serviço: só as 6 ligadas ao agendamento, mesmo com página de 5
    resp = await async_client.get(
        "/notifications/me",
        params={"search": "serviço de teste", "size": 5},
        headers=scenario["client_headers"],
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    linked = data["total"]
    assert linked >= 6
    assert data["pages"] == (linked + 4) // 5
    assert len(data["items"]) == 5

    # Pelo título da notificação
    resp = await async_client.get(
        "/notifications/me", params={"search": "aviso 1"}, headers=scenario["client_headers"]
    )
    titles = sorted(item["title"] for item in resp.json()["items"])
    assert titles == ["Aviso 1", "Aviso 10", "Aviso 11"]
