# ADR-001: Resend as Production Transactional Email Provider with Adapter Pattern

**Status:** Accepted
**Date:** 2026-01-23
**Related to:** [ADR-001: APScheduler In-Process Scheduler Over Celery](../../JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md)

---

## Context and Problem Statement

The platform delivers transactional emails for every significant lifecycle event: appointment creation, cancellation, and completion; subscription activation, trial expiry, and payment failure; review requests after completed appointments; and password resets. Reliable, high-deliverability email delivery is a critical user-facing capability, not an auxiliary concern.

The hosting infrastructure (Railway) runs the backend as a single managed process with no dedicated worker infrastructure. An initial SMTP-based approach using Titan/GoDaddy email hosting was in place before the notification architecture was formalized. Resend was subsequently introduced as a cloud-optimized production alternative, with SMTP retained as a development and fallback path. The migration to this dual-provider model was established on 2026-01-23 with the `add_notifications_table` database migration.

The system implements a provider adapter pattern: a shared abstract contract is fulfilled by two concrete implementations, with the active provider selected at runtime via an environment variable. This design makes the provider boundary explicit and swappable, but also introduces two parallel operational code paths that must be understood by any developer extending the notification system.

## Decision Drivers

- Railway's managed container environment makes self-hosted SMTP infrastructure operationally fragile at production scale
- Transactional email deliverability requires SPF, DKIM, and DMARC configuration that a managed email API handles automatically
- Background job services (subscription and review schedulers) call the notification system from non-request-scoped async contexts, requiring adapter implementations compatible with the asyncio event loop
- A single abstraction layer must support both the production API provider and a local SMTP workflow without changing consuming code
- [NEEDS INPUT: Were deliverability failures or bounce rate issues observed with the Titan/GoDaddy SMTP setup that directly motivated adopting Resend?]

## Considered Options

1. **Resend managed email API** — SaaS transactional email provider with automatic SPF/DKIM/DMARC, deliverability monitoring, and a Python SDK; selected as the production provider
2. **SMTP via Titan/GoDaddy** — self-managed email hosting using aiosmtplib for async SMTP delivery; retained as the development and fallback provider
3. **Alternative SaaS providers** — SendGrid, Mailgun, or AWS SES as managed email alternatives with comparable feature sets

## Decision Outcome

Chosen option: Resend as the production provider via the adapter pattern, because it offloads SPF/DKIM/DMARC configuration and deliverability monitoring to a managed service while retaining SMTP as a local development path. The `EMAIL_PROVIDER` environment variable controls which adapter is active at runtime, isolating the provider boundary from the consuming codebase.

[NEEDS INPUT: Why was Resend selected over SendGrid, Mailgun, or AWS SES? The choice may have been driven by API simplicity, pricing at low volume, developer experience, or an existing account — this rationale is not documented in the codebase and is needed to assess the long-term commitment to this vendor.]

## Pros and Cons of the Options

### Resend Managed Email API

- Good: Automatic SPF/DKIM/DMARC configuration eliminates the largest operational risk of self-managed SMTP at production scale
- Good: Deliverability monitoring, bounce handling, and sending reputation are managed by the provider
- Good: Clean SDK integration with a single API key credential requirement
- Bad: External vendor dependency — API availability and pricing changes are outside the team's control

### SMTP via Titan/GoDaddy

- Good: No additional vendor or API credential beyond the existing email hosting account
- Good: Full control over SMTP relay configuration, connection pooling, and retry behavior
- Bad: SPF/DKIM/DMARC must be configured and maintained manually; misconfiguration silently degrades deliverability
- Bad: Titan/GoDaddy SMTP is not designed for high-volume transactional sending; rate limits and blacklist risk increase with volume

### Alternative SaaS Providers (SendGrid, Mailgun, AWS SES)

- Good: Comparable deliverability infrastructure with established market track records and rich analytics dashboards
- Good: AWS SES in particular offers significantly lower per-email pricing at higher volumes
- Bad: No evidence these were formally evaluated against Resend; selection rationale is undocumented
- [NEEDS INPUT: Were alternative SaaS providers evaluated and rejected, or was Resend adopted without a formal comparison?]

## Consequences

The adapter pattern creates a structural guarantee: any future email provider can be integrated by implementing the two-method abstract contract without modifying consuming code. However, the silent fallback behavior — returning an unconfigured SMTP adapter when neither provider is available rather than raising an error — means misconfigured production environments may silently drop emails. This is a known operational risk that monitoring or alerting on the `is_configured()` check should address.

The notification persistence model is intentionally asymmetric: appointment lifecycle emails are persisted to the `Notification` database table and surface in the user-facing notification center, while subscription state-change emails and review request emails bypass persistence entirely. This means the in-app notification center reflects only appointment events. [NEEDS INPUT: Is the persistence asymmetry between appointment notifications (persisted) and subscription/review emails (not persisted) an intentional product decision, or an implementation gap? This affects the scope of the notification center feature and future audit trail requirements.]

Background job services (subscription and review schedulers) call the notification system from outside FastAPI's request lifecycle, requiring the adapter implementations to remain compatible with self-managed asyncio execution contexts. Any new provider adapter must be validated in both request-scoped and scheduler-scoped async contexts. The `channel` field on the `Notification` model anticipates future channels beyond email (`sms`, `whatsapp`, `push`), indicating the adapter pattern was designed with channel expansion in mind, though no roadmap for those channels is documented.

## References

- `backend/app/services/notifications/base.py:5`
- `backend/app/services/notifications/notification_service.py:17`
- `backend/app/services/notifications/resend_adapter.py:12`
- `backend/app/services/notifications/email_adapter.py:14`
- `backend/app/config.py:60`
