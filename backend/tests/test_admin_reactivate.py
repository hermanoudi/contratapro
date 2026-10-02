"""
Reativar profissional pelo admin.

Antes, reativar gravava subscription_status="active" sempre: quem tinha
cancelado ou nunca pagou voltava para a busca de graça. Agora o status volta
ao que o plano e a assinatura permitem.
"""
import pytest
from sqlalchemy import select

from app.database import get_db
from app.main import app
from app.models import Subscription, SubscriptionPlan, User
from tests.helpers import make_user, get_auth_headers


async def _session():
    async for session in app.dependency_overrides[get_db]():
        return session


async def _admin_headers(async_client):
    email, password, admin = await make_user(async_client)
    session = await _session()
    (await session.execute(select(User).where(User.id == admin["id"]))).scalar_one().is_admin = True
    await session.commit()
    await session.close()
    return await get_auth_headers(async_client, email, password)


async def _suspended_pro(async_client, slug, sub_status=None):
    _, _, data = await make_user(async_client, is_professional=True)
    session = await _session()
    plan = (await session.execute(select(SubscriptionPlan).where(SubscriptionPlan.slug == slug))).scalar_one()
    user = (await session.execute(select(User).where(User.id == data["id"]))).scalar_one()
    user.subscription_plan_id = plan.id
    user.is_suspended = True
    user.subscription_status = "suspended"
    if sub_status:
        session.add(Subscription(professional_id=user.id, plan_id=plan.id, status=sub_status, plan_amount=plan.price))
    await session.commit()
    await session.close()
    return data["id"]


async def _status(user_id):
    session = await _session()
    user = (await session.execute(select(User).where(User.id == user_id))).scalar_one()
    await session.close()
    return user.subscription_status, user.is_suspended


@pytest.mark.asyncio
@pytest.mark.parametrize("slug,sub_status,expected", [
    ("free", None, "active"),
    ("pro", "active", "active"),
    ("pro", "cancelled", "cancelled"),
    ("premium", "pending", "pending"),
    ("pro", None, "inactive"),
])
async def test_reactivate_restores_status_the_plan_allows(async_client, slug, sub_status, expected):
    headers = await _admin_headers(async_client)
    user_id = await _suspended_pro(async_client, slug, sub_status)

    resp = await async_client.post(f"/admin/professionals/{user_id}/reactivate", headers=headers)

    assert resp.status_code == 200, resp.text
    assert await _status(user_id) == (expected, False)
