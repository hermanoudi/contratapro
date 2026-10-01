"""
Upgrade de plano sem tirar o profissional do ar.

O upgrade fica guardado em pending_* até o Mercado Pago autorizar o novo
preapproval; enquanto isso o plano atual (pago ou Free) continua valendo e
o perfil continua na busca. O webhook troca o plano quando autorizado e só
descarta o pendente quando o pagamento não sai.
"""
from datetime import date, timedelta
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import select

import importlib
subs = importlib.import_module("app.routers.subscriptions")
from app.database import get_db
from app.main import app
from app.models import Subscription, SubscriptionPlan, User
from tests.helpers import make_user, get_auth_headers
from tests.test_webhook_edge_cases import _signed_webhook_request


class _FakeResponse:
    def __init__(self, status_code, payload):
        self.status_code = status_code
        self._payload = payload
        self.text = str(payload)

    def json(self):
        return self._payload


class _FakeHttpx:
    """Substitui httpx.AsyncClient: registra as chamadas ao Mercado Pago."""
    calls = []

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def post(self, url, json=None, headers=None):
        _FakeHttpx.calls.append(("POST", url, json))
        return _FakeResponse(201, {"id": "new-pa", "init_point": "https://mp.example/checkout/new-pa"})

    async def put(self, url, json=None, headers=None):
        _FakeHttpx.calls.append(("PUT", url, json))
        return _FakeResponse(200, {})


class _FakeSdk:
    """Substitui o SDK do MP no webhook: devolve o preapproval pedido."""

    def __init__(self, preapprovals):
        self._preapprovals = preapprovals

    def preapproval(self):
        sdk = self

        class _P:
            def get(self, preapproval_id):
                return {"status": 200, "response": sdk._preapprovals[preapproval_id]}

        return _P()


async def _session():
    async for session in app.dependency_overrides[get_db]():
        return session


async def _plan(session, slug):
    return (await session.execute(select(SubscriptionPlan).where(SubscriptionPlan.slug == slug))).scalar_one()


async def _pro_on(async_client, slug, with_subscription=True):
    """Profissional com CPF no plano `slug`, ativo, já pagando (se pago)."""
    email, password, data = await make_user(async_client, is_professional=True, cpf="52998224725")
    headers = await get_auth_headers(async_client, email, password)
    session = await _session()
    plan = await _plan(session, slug)
    user = (await session.execute(select(User).where(User.id == data["id"]))).scalar_one()
    user.subscription_plan_id = plan.id
    user.subscription_status = "active"
    if with_subscription:
        session.add(Subscription(
            professional_id=user.id,
            plan_id=plan.id,
            status="active",
            plan_amount=plan.price,
            mercadopago_preapproval_id="old-pa",
            next_billing_date=date.today() + timedelta(days=12),
            last_payment_date=date.today() - timedelta(days=18),
        ))
    await session.commit()
    await session.close()
    return data["id"], headers


async def _state(user_id):
    session = await _session()
    user = (await session.execute(select(User).where(User.id == user_id))).scalar_one()
    sub = (await session.execute(select(Subscription).where(Subscription.professional_id == user_id))).scalar_one_or_none()
    plan = (await session.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == user.subscription_plan_id))).scalar_one()
    await session.close()
    return user, sub, plan


async def _webhook(async_client, preapproval_id):
    url, headers = _signed_webhook_request(data_id=preapproval_id)
    return await async_client.post(url, json={"type": "preapproval", "data": {"id": preapproval_id}}, headers=headers)


@pytest.fixture
def mp(monkeypatch):
    _FakeHttpx.calls = []
    monkeypatch.setattr(subs.httpx, "AsyncClient", _FakeHttpx)
    monkeypatch.setattr(subs.notification_service, "notify_subscription_activated", AsyncMock())
    monkeypatch.setattr(subs.notification_service, "notify_subscription_plan_changed", AsyncMock())
    return _FakeHttpx


@pytest.mark.asyncio
async def test_upgrade_keeps_current_plan_until_payment(async_client, mp):
    user_id, headers = await _pro_on(async_client, "pro")

    resp = await async_client.post("/subscriptions/change-plan/premium", headers=headers)
    assert resp.status_code == 200, resp.text
    assert resp.json()["init_point"] == "https://mp.example/checkout/new-pa"

    user, sub, plan = await _state(user_id)
    assert plan.slug == "pro"
    assert user.subscription_status == "active"
    assert sub.status == "active"
    assert sub.mercadopago_preapproval_id == "old-pa"
    assert sub.pending_preapproval_id == "new-pa"
    # A assinatura atual não é cancelada no MP antes da confirmação
    assert not [c for c in mp.calls if c[0] == "PUT"]
    # O novo preapproval é identificado como upgrade
    post = [c for c in mp.calls if c[0] == "POST"][0]
    assert post[2]["external_reference"] == f"{user_id}_upgrade"

    me = await async_client.get("/subscriptions/my-subscription", headers=headers)
    assert me.json()["subscription"]["pending_plan"]["slug"] == "premium"


@pytest.mark.asyncio
async def test_authorized_webhook_promotes_pending_upgrade(async_client, mp, monkeypatch):
    user_id, headers = await _pro_on(async_client, "pro")
    await async_client.post("/subscriptions/change-plan/premium", headers=headers)
    billing_before = (await _state(user_id))[1].next_billing_date

    monkeypatch.setattr(subs, "sdk", _FakeSdk({
        "new-pa": {"status": "authorized", "external_reference": f"{user_id}_upgrade", "payer_id": 99},
    }))
    resp = await _webhook(async_client, "new-pa")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

    user, sub, plan = await _state(user_id)
    assert plan.slug == "premium"
    assert user.subscription_status == "active"
    assert sub.status == "active"
    assert sub.mercadopago_preapproval_id == "new-pa"
    assert sub.pending_preapproval_id is None
    # Começa no vencimento atual (free_trial até lá): a data não muda
    assert sub.next_billing_date == billing_before
    # Só depois da troca o preapproval antigo é cancelado
    assert ("PUT", "https://api.mercadopago.com/preapproval/old-pa", {"status": "cancelled"}) in mp.calls


@pytest.mark.asyncio
async def test_abandoned_upgrade_keeps_user_active(async_client, mp, monkeypatch):
    user_id, headers = await _pro_on(async_client, "pro")
    await async_client.post("/subscriptions/change-plan/premium", headers=headers)

    monkeypatch.setattr(subs, "sdk", _FakeSdk({
        "new-pa": {"status": "cancelled", "external_reference": f"{user_id}_upgrade"},
    }))
    resp = await _webhook(async_client, "new-pa")
    assert resp.status_code == 200

    user, sub, plan = await _state(user_id)
    assert plan.slug == "pro"
    assert user.subscription_status == "active"
    assert sub.status == "active"
    assert sub.mercadopago_preapproval_id == "old-pa"
    assert sub.pending_preapproval_id is None


@pytest.mark.asyncio
async def test_free_user_stays_visible_while_upgrading(async_client, mp, monkeypatch):
    user_id, headers = await _pro_on(async_client, "free", with_subscription=False)

    resp = await async_client.post("/subscriptions/change-plan/pro", headers=headers)
    assert resp.status_code == 200, resp.text

    user, sub, plan = await _state(user_id)
    assert plan.slug == "free"
    assert user.subscription_status == "active"
    assert sub.status == "free"
    assert sub.pending_preapproval_id == "new-pa"

    monkeypatch.setattr(subs, "sdk", _FakeSdk({
        "new-pa": {"status": "authorized", "external_reference": f"{user_id}_upgrade"},
    }))
    await _webhook(async_client, "new-pa")

    user, sub, plan = await _state(user_id)
    assert plan.slug == "pro"
    assert sub.status == "active"
    assert sub.next_billing_date == date.today() + timedelta(days=30)


@pytest.mark.asyncio
async def test_giving_up_pending_upgrade(async_client, mp):
    user_id, headers = await _pro_on(async_client, "pro")
    await async_client.post("/subscriptions/change-plan/premium", headers=headers)

    resp = await async_client.post("/subscriptions/cancel-pending-upgrade", headers=headers)
    assert resp.status_code == 200, resp.text

    user, sub, plan = await _state(user_id)
    assert plan.slug == "pro"
    assert sub.pending_preapproval_id is None
    assert ("PUT", "https://api.mercadopago.com/preapproval/new-pa", {"status": "cancelled"}) in mp.calls


@pytest.mark.asyncio
async def test_upgrade_reference_does_not_crash_current_webhook(async_client, mp, monkeypatch):
    """O webhook do preapproval atual com referência "N_upgrade" não pode quebrar."""
    user_id, _ = await _pro_on(async_client, "pro")
    monkeypatch.setattr(subs, "sdk", _FakeSdk({
        "old-pa": {"status": "authorized", "external_reference": f"{user_id}_upgrade"},
    }))
    resp = await _webhook(async_client, "old-pa")
    assert resp.json()["status"] == "ok"
