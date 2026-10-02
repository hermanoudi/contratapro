"""
Plano pago só com pagamento.

/plans/me/change-plan gravava qualquer plano (inclusive Pro e Premium) com
subscription_status="active", sem passar pelo Mercado Pago. O cadastro
chamava esse endpoint, e qualquer profissional logado podia chamá-lo direto.
/subscriptions/activate-manual e /subscriptions/debug-checkout são de
desenvolvimento e não podem responder em produção (DEBUG=False).
"""
import pytest
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import SubscriptionPlan, User
from tests.helpers import make_user, get_auth_headers


async def _user_plan(user_id):
    async for session in app.dependency_overrides[get_db]():
        user = (await session.execute(select(User).where(User.id == user_id))).scalar_one()
        plan = (await session.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == user.subscription_plan_id)
        )).scalar_one_or_none()
        return (plan.slug if plan else None), user.subscription_status


async def _new_pro(async_client):
    email, password, data = await make_user(async_client, is_professional=True)
    return data["id"], await get_auth_headers(async_client, email, password)


@pytest.mark.asyncio
@pytest.mark.parametrize("slug", ["pro", "premium"])
async def test_paid_plan_cannot_be_set_without_payment(async_client, slug):
    user_id, headers = await _new_pro(async_client)
    before = await _user_plan(user_id)

    resp = await async_client.post("/plans/me/change-plan", json={"new_plan_slug": slug}, headers=headers)

    assert resp.status_code == 403, resp.text
    assert await _user_plan(user_id) == before


@pytest.mark.asyncio
async def test_free_plan_still_set_directly(async_client):
    user_id, headers = await _new_pro(async_client)

    resp = await async_client.post("/plans/me/change-plan", json={"new_plan_slug": "free"}, headers=headers)

    assert resp.status_code == 200, resp.text
    assert await _user_plan(user_id) == ("free", "active")


@pytest.mark.asyncio
@pytest.mark.parametrize("path", ["/subscriptions/activate-manual", "/subscriptions/debug-checkout"])
async def test_dev_endpoints_hidden_in_production(async_client, monkeypatch, path):
    monkeypatch.setattr(settings, "DEBUG", False)
    user_id, headers = await _new_pro(async_client)
    before = await _user_plan(user_id)

    resp = await async_client.post(path, headers=headers)

    assert resp.status_code == 404, resp.text
    assert await _user_plan(user_id) == before
