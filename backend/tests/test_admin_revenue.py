"""
Receita do painel do admin.

Antes: "profissionais ativos × R$ 50", contando o Free (ativo sem pagar) e um
preço que não existe. Agora: soma das assinaturas pagas ativas que vão
renovar; a linha status="free" (upgrade pendente de quem está no Free) não
conta como assinante nem aparece na lista de assinaturas.
"""
from datetime import date, timedelta

import pytest
from sqlalchemy import select

from app.database import get_db
from app.main import app
from app.models import Subscription, SubscriptionPlan, User
from tests.helpers import make_user, get_auth_headers


async def _session():
    async for session in app.dependency_overrides[get_db]():
        return session


async def _seed(async_client):
    # Admin
    email, password, admin = await make_user(async_client)
    session = await _session()
    (await session.execute(select(User).where(User.id == admin["id"]))).scalar_one().is_admin = True
    plans = {p.slug: p for p in (await session.execute(select(SubscriptionPlan))).scalars()}

    async def pro(slug, sub_status, amount, **extra):
        _, _, data = await make_user(async_client, is_professional=True)
        user = (await session.execute(select(User).where(User.id == data["id"]))).scalar_one()
        user.subscription_plan_id = plans[slug].id
        user.subscription_status = "active" if sub_status in ("active", "free") else sub_status
        session.add(Subscription(professional_id=user.id, plan_id=plans[slug].id, status=sub_status, plan_amount=amount, **extra))

    await pro("pro", "active", 19.90, next_billing_date=date.today() + timedelta(days=10))       # paga
    await pro("premium", "active", 39.90, scheduled_cancellation_date=date.today() + timedelta(days=5))  # vai sair
    await pro("free", "free", 0.0, pending_preapproval_id="pa-1")                                # Free com upgrade pendente
    await pro("pro", "pending", 19.90)                                                           # não pagou
    await session.commit()
    await session.close()
    return await get_auth_headers(async_client, email, password)


@pytest.mark.asyncio
async def test_revenue_counts_only_paid_renewing_subscriptions(async_client):
    headers = await _seed(async_client)

    resp = await async_client.get("/admin/dashboard", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert data["revenue"]["monthly"] == pytest.approx(19.90)
    assert data["revenue"]["annual_projected"] == pytest.approx(238.80)
    assert data["revenue"]["paying_subscribers"] == 1
    # Free e pagantes contam como visíveis na busca
    assert data["summary"]["active_professionals"] == 3
    # Novos assinantes: só as assinaturas pagas (a linha "free" fica de fora)
    assert data["summary"]["new_subscribers_this_month"] == 3


@pytest.mark.asyncio
async def test_subscriptions_list_hides_free_placeholder(async_client):
    headers = await _seed(async_client)

    resp = await async_client.get("/admin/subscriptions", headers=headers)
    assert resp.status_code == 200, resp.text
    statuses = sorted(s["status"] for s in resp.json()["subscriptions"])
    assert statuses == ["active", "active", "pending"]
