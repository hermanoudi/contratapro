# ADR-001: Mercado Pago as the Subscription Payment Gateway

**Status:** Accepted
**Date:** 2026-01-14

---

## 1. Context and Problem Statement

ContrataPro is a Brazilian professional services marketplace where autonomous professionals monetize
their availability through subscription plans (Trial, Basic, Premium). The platform required a
recurring billing infrastructure capable of collecting monthly payments from Brazilian professionals
using Brazilian-market payment methods (PIX, boleto, credit card).

The core challenge was selecting a payment gateway that supports recurring subscription billing
natively for the Brazilian market, integrates with the existing Python/FastAPI backend, and can
be operated by a small development team without dedicated payments engineering.

The integration was introduced on 2026-01-14 and iterated through at least 10 commits over three
weeks, covering initial integration, purchase flow fixes, plan change mechanics, and configurable
billing frequency. This sustained iteration reflects a stable, load-bearing architectural commitment
rather than a provisional choice.

## 2. Decision Drivers

- Brazilian market coverage: PIX, boleto, and credit card support are required for the target
  professional demographic.
- Recurring billing support: the revenue model depends on monthly auto-renewal, not one-time payments.
- SDK availability: a Python SDK reduces integration surface and maintenance overhead.
- Time-to-market: the team needed operational billing within the initial development sprint.
- [NEEDS INPUT: Were pricing/fee considerations (transaction fees, monthly costs) a factor in the
  gateway selection over Stripe or PagSeguro?]

## 3. Considered Options

1. **Mercado Pago preapproval model** — recurring subscription templates (preapproval_plan) with
   per-subscriber instances (preapproval), using hosted checkout.
2. **Stripe** — international payment processor with superior documentation and SDKs, but limited
   Brazilian local payment method support (no PIX/boleto in standard recurring billing).
3. **Mercado Pago transparent checkout** — direct card tokenization without the preapproval
   subscription model, requiring the application to manage renewal cycles manually.

## 4. Decision Outcome

Chosen option: **Mercado Pago preapproval model**, because it provides native recurring billing with
Brazilian local payment methods (PIX, boleto, credit card) under a single integration, offloading
subscription state management and payment retries to the gateway.

The preapproval model was chosen over Mercado Pago's transparent checkout because it delegates
billing cycle management to the gateway, reducing the backend's responsibility to webhook event
processing rather than active payment orchestration.

[NEEDS INPUT: Was there a specific business or strategic reason (e.g., existing Mercado Pago
merchant account, platform's own MP account, or partnership) that made Mercado Pago the default
choice over PagSeguro, which is also a leading Brazilian payment processor?]

## 5. Pros and Cons of the Options

### Mercado Pago preapproval model

- Good: Dominant Brazilian payment processor with native PIX, boleto, and credit card support.
- Good: Hosted checkout offloads PCI compliance scope from the application.
- Good: Webhook-driven state machine integrates with the backend's async architecture.
- Bad: Official Python SDK does not support the `preapproval_plan` endpoint, requiring direct
  HTTP calls for plan template creation alongside SDK calls for subscription queries (hybrid pattern).
- Bad: Webhook payload signature verification is not currently implemented, leaving the webhook
  endpoint exposed to spoofed state-change requests.

### Stripe

- Good: Best-in-class API documentation, SDKs, and webhook security model (signature verification
  built into the SDK).
- Good: Mature recurring billing primitives (Products, Prices, Subscriptions) with granular
  lifecycle control.
- Bad: PIX support is limited and boleto recurring billing is not a first-class feature for the
  Brazilian market.
- Bad: Higher engineering familiarity required for latency, currency conversion, and compliance
  considerations in Brazil.

### Mercado Pago transparent checkout

- Good: Full control over payment UI and card data tokenization without gateway-hosted pages.
- Good: Uses the same Mercado Pago account and credentials as the preapproval model.
- Bad: Renewal orchestration, retry logic, and dunning must be implemented in the application layer.
- Bad: Significantly higher backend complexity for subscription lifecycle management.

## 6. Consequences

The preapproval model introduces a two-step API flow: first creating a `preapproval_plan` resource
(the recurring plan template, created via direct HTTP due to SDK limitations), then creating a
`preapproval` resource (the subscriber instance). This split is non-obvious to developers unfamiliar
with Mercado Pago's subscription model and is compounded by the hybrid SDK/HTTP pattern within the
same module. Any developer working on billing features must understand both resource types and which
call path applies to each.

The `mercadopago_preapproval_id` field on the Subscription model is the primary join key between
local database state and Mercado Pago's payment state. All subscription status transitions
(active, paused, cancelled) originate from webhook events processed by the backend, with the
local `Subscription.status` and denormalized `User.subscription_status` updated accordingly. This
external state dependency means the backend's view of subscription health is only as current as the
most recent webhook delivery. Webhook signature verification is an open security gap that must be
addressed before the platform scales, as any caller can currently trigger subscription state changes.

[NEEDS INPUT: What is the agreed strategy for handling payment failures beyond the 7-day grace period
currently modeled in `payment_failure_count` and `grace_period_ends_at`? Should the subscription
be suspended, cancelled, or enter a longer dunning cycle? This decision affects the `subscription_jobs`
daily processing logic and user-facing communication templates.]

## 7. References

- `backend/app/routers/subscriptions.py:1` — Full subscription lifecycle: trial, paid plan, plan
  changes, cancellation, webhook handler, admin overrides (1,901 lines).
- `backend/app/services/subscription_jobs.py:1` — Daily cron processing scheduled cancellations,
  downgrades, trial expiries, and grace period management.
- `backend/app/models.py:133` — Subscription model with Mercado Pago identifier fields and
  scheduled-change state columns.
- `backend/app/config.py:40` — Mercado Pago credentials and configurable recurring billing
  parameters.
- `frontend/src/pages/SubscriptionCheckout.jsx` — Frontend card tokenization and hosted checkout
  redirect using the Mercado Pago JS SDK.
