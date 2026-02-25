# Potential ADR: Mercado Pago as the Subscription Payment Gateway

**Module**: SUB
**Category**: Technology / Infrastructure
**Priority**: Must Document (Score: 150/150)
**Date Identified**: 2026-02-17

---

## What Was Identified

ContrataPro uses Mercado Pago exclusively as its subscription payment infrastructure. The integration
was introduced on 2026-01-14 with the commit "feat: implementar sistema de assinaturas com Trial
gratuito" and has been actively shaped by at least 10 subsequent commits through 2026-02-04,
with themes including "fix: integração", "fix: compra com mercado pago", "feat: config recorrência",
and "feat: mudança de planos". This sustained investment indicates a stable, load-bearing
architectural commitment.

The integration uses Mercado Pago's **preapproval** model (subscription/recurring billing), not
one-time payments. The implementation involves a deliberate two-step API flow: first creating a
`preapproval_plan` (the recurring plan template) via direct `httpx` REST calls, then creating a
`preapproval` (the subscriber's subscription instance) either via the official `mercadopago` SDK
or also via `httpx`. The resulting `init_point` URL is handed to the professional to complete
payment in Mercado Pago's hosted checkout. State changes are received asynchronously via a
webhook endpoint (`POST /subscriptions/webhook`).

Within this integration, several sub-decisions are permanently locked in:
- CPF (Brazilian tax ID) is required for all paid subscriptions, wired into the API payer payload
- Status lifecycle is driven by MP webhook events (`authorized`, `paused`, `cancelled`)
- The internal `Subscription.mercadopago_preapproval_id` field is the join key between local state
  and Mercado Pago's state

## Why This Might Deserve an ADR

- **Impact**: The payment gateway choice determines revenue collection for the entire platform.
  Every professional's monetization path flows through Mercado Pago. Changing it would require
  rewriting `subscriptions.py` (1,901 lines), `subscription_jobs.py`, the `Subscription` model,
  and all four frontend subscription pages (`SubscriptionSetup`, `SubscriptionCheckout`,
  `SubscriptionCallback`, `MySubscription`).
- **Trade-offs**: Mercado Pago dominates Brazilian digital payments and supports PIX, boleto, and
  credit cards natively - critical for a Brazilian professional marketplace. However, it lacks the
  international documentation quality of Stripe, the official Python SDK does not support the
  `preapproval_plan` endpoint (which is why `httpx` is used directly for that call), and webhook
  signature verification is absent in the current implementation.
- **Complexity**: The two-step preapproval flow (plan template + subscriber instance) is a
  non-obvious pattern. Any developer unfamiliar with Mercado Pago's subscription model will
  struggle to understand why two separate API resources are created for a single subscription.
  The hybrid SDK/httpx pattern compounds this: some calls use `sdk.preapproval().get()` while
  others use `httpx.AsyncClient().post("https://api.mercadopago.com/preapproval_plan", ...)`.
- **Team Knowledge**: Every backend developer working on billing, plan management, admin overrides,
  or the daily subscription cron job must understand this gateway's model. The `preapproval_id` is
  a first-class join key between local DB state and external payment state.
- **Future Implications**: Adding new billing features (annual plans, usage-based billing, refunds,
  dispute handling) requires navigating Mercado Pago's API surface. The absence of webhook
  signature verification is a security gap that will need addressing before scale.
- **Temporal Context**: Stable for approximately 5 weeks as the primary billing infrastructure,
  with active iteration.

## Evidence Found in Codebase

### Key Files
- [`backend/app/routers/subscriptions.py`](../../../../../backend/app/routers/subscriptions.py) - Lines 1-1901
  - Contains the entire subscription lifecycle: trial activation, paid plan creation, upgrade,
    downgrade (scheduled), cancellation (immediate trial / scheduled paid), webhook handler,
    admin force-trial override
- [`backend/app/services/subscription_jobs.py`](../../../../../backend/app/services/subscription_jobs.py) - Lines 1-559
  - Daily cron job that processes scheduled cancellations, downgrades, trial expiries, and
    grace period management - all of which result from or interact with MP payment events
- [`backend/app/models.py`](../../../../../backend/app/models.py) - Lines 133-182 (Subscription model)
  - `mercadopago_preapproval_id`, `mercadopago_subscription_id`, `mercadopago_payer_id` fields
  - `scheduled_cancellation_date`, `scheduled_plan_id`, `scheduled_plan_change_date` - DB-level
    state fields driven by MP payment events
  - `payment_failure_count`, `grace_period_ends_at` - payment failure tracking
- [`backend/app/config.py`](../../../../../backend/app/config.py) - Lines 40-50
  - `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY` secrets
  - `SUBSCRIPTION_AMOUNT`, `SUBSCRIPTION_FREQUENCY`, `SUBSCRIPTION_FREQUENCY_TYPE` configurable
    recurring parameters

### Code Evidence

```python
# backend/app/routers/subscriptions.py:8-23
import mercadopago
import httpx

# Inicializar SDK do Mercado Pago
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)

# STEP 1 — preapproval_plan created via raw httpx (SDK does not support this endpoint)
async with httpx.AsyncClient() as client:
    plan_response = await client.post(
        "https://api.mercadopago.com/preapproval_plan",
        json=plan_data,
        headers={
            "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
    )

# STEP 2 — preapproval status queried via the official SDK
preapproval_response = sdk.preapproval().get(preapproval_id)
```

```python
# backend/app/routers/subscriptions.py:1724-1863 (webhook handler)
@router.post("/webhook")
async def mercadopago_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    notification_type = body.get("type")

    if notification_type == "preapproval":
        preapproval_id = body.get("data", {}).get("id")
        preapproval_response = sdk.preapproval().get(preapproval_id)
        # No signature verification — any caller can trigger state changes
        mp_status = preapproval_data.get("status")
        if mp_status == "authorized":
            subscription.status = "active"
            user.subscription_status = "active"
```

```python
# backend/app/models.py:133-182 (Subscription model - all MP-driven fields)
class Subscription(Base):
    __tablename__ = "subscriptions"
    mercadopago_subscription_id = Column(String, nullable=True, unique=True)
    mercadopago_preapproval_id  = Column(String, nullable=True)
    mercadopago_payer_id        = Column(String, nullable=True)
    scheduled_cancellation_date = Column(Date, nullable=True)
    scheduled_plan_id           = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    scheduled_plan_change_date  = Column(Date, nullable=True)
    payment_failure_count       = Column(Integer, default=0)
    grace_period_ends_at        = Column(Date, nullable=True)
```

### Impact Analysis
- Introduced: 2026-01-14 ("feat: implementar sistema de assinaturas com Trial gratuito")
- Modified: at least 10 commits over 3 weeks (2026-01-14 to 2026-02-04)
- Last change: 2026-02-04 ("feat: config recorrência" - configurable billing frequency)
- Affects: 1 primary backend file (1,901 lines), 1 job service, 1 model, 4 frontend pages, config
- Commit themes: "fix: integração", "fix: compra", "feat: mudança de planos", "feat: config recorrência"

### Alternatives (if observable)
The codebase contains `celery 5.4.0` and `redis` in declared dependencies
(`backend/requirements.txt`) but neither is active. This suggests Celery/Redis were considered
as infrastructure for background payment processing or event-driven webhooks, but the decision
was made to use synchronous APScheduler cron jobs instead. Stripe was not evidenced.

## Questions to Address in ADR (if created)

- Why Mercado Pago over Stripe or PagSeguro for the Brazilian market?
- Why the preapproval plan model (recurring subscription template) over direct preapproval or
  transparent checkout?
- Why does `preapproval_plan` creation use raw `httpx` while other calls use the official SDK?
  Was this an SDK limitation discovered at integration time?
- Why is webhook signature verification not implemented? Is this a known gap or intentional for
  development speed?
- What is the strategy for handling payment failures beyond the 7-day grace period?
- How does the CPF requirement interact with Brazilian consumer protection law?

## Related Potential ADRs
- JOB module: APScheduler cron for scheduled changes (DB-flags pattern chosen over Celery/Redis)
- DATA module: Denormalized `User.subscription_status` alongside `Subscription.status`

## Additional Notes

The `backend/app/routers/subscriptions.py` at 1,901 lines is the largest single file in the
codebase. This concentration of complexity suggests the subscription domain may benefit from
further modularization as the platform scales. The file mixes trial logic, paid plan logic,
webhook processing, admin overrides, and debug endpoints in a single module.

A `POST /subscriptions/activate-manual` endpoint exists with the comment "APENAS PARA
DESENVOLVIMENTO/TESTE" (development/test only) that manually activates subscriptions without
payment. This should be reviewed for production access controls.
