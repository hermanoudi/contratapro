# Potential ADR: Resend as Production Transactional Email Provider with SMTP Fallback and Adapter Pattern

**Module**: NOTIF
**Category**: Infrastructure / Architecture
**Priority**: Must Document (Score: 135)
**Date Identified**: 2026-02-17

---

## What Was Identified

The NOTIF module implements a pluggable email delivery system that selects between two concrete providers at runtime: Resend (the production choice) and SMTP via aiosmtplib (the development/fallback choice). The selection is driven by a single environment variable, `EMAIL_PROVIDER`, which is commented in `config.py` with the instruction "Mude para 'resend' no Railway" (change to 'resend' on Railway). This comment alone signals that the Resend vs. SMTP split is an intentional environment-boundary decision, not an accident.

Both providers implement a shared abstract base class `NotificationAdapter` (defined in `base.py`), which mandates two async methods: `send()` returning a `(bool, Optional[str])` result tuple, and `is_configured()` as a runtime health check. The `NotificationService` orchestrator resolves which adapter to use via `get_email_adapter()` at instantiation time, applying a priority chain: Resend (if `EMAIL_PROVIDER == "resend"` AND `is_configured()`) → SMTP (if `is_configured()`) → SMTP unconfigured as silent fallback.

The Resend adapter was identified as the production email provider in the project documentation (`CLAUDE.md` infrastructure table) and in `config.py` (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`). The migration `20260123_1212-ea99501454e6_add_notifications_table.py` marks 2026-01-23 as the date the persistence layer for notifications was introduced, indicating the full notification architecture (with Resend as its production vehicle) was established in late January 2026.

## Why This Might Deserve an ADR

- **Impact**: Transactional email delivery is a critical user-facing system. Every event in the platform — appointment created, cancelled, completed; subscription activated, cancelled, trial expiring; review requested; password reset — triggers an email. The provider choice directly affects deliverability, cost, and operational complexity.
- **Trade-offs**: Resend is a managed email API (simpler ops, automatic SPF/DKIM/DMARC, deliverability monitoring) but introduces vendor lock-in and an external API dependency. SMTP (via Titan/GoDaddy based on the adapter comment) is self-managed, giving full control but requiring manual infrastructure maintenance and higher deliverability risk at scale.
- **Complexity**: The adapter pattern introduces an abstraction layer that, while clean, means there are two parallel code paths (Resend SDK call vs. aiosmtplib async SMTP handshake). Debugging email failures requires knowing which adapter is active.
- **Team Knowledge**: Every developer adding a new notification type must understand the adapter contract (`send()` signature, return tuple `(bool, Optional[str])`), the template convention (`(subject, plain_text, html)` tuple), and which code path is active per environment. Getting this wrong silently (the fallback logs a warning but returns the unconfigured SMTP adapter) could result in undelivered emails in production.
- **Future Implications**: Adding a third channel (SMS via Twilio, WhatsApp via official API) would require creating a new adapter and deciding whether to fold it into the existing `NotificationAdapter` ABC or create a parallel hierarchy. The `channel` field on the `Notification` model already declares values of `sms`, `whatsapp`, `push` as anticipated future channels. The formal ADR would capture why SMS was deferred and what the extension contract looks like.
- **Temporal Context**: Introduced in January 2026 (notifications migration on 2026-01-23). The system is approximately 1 month old as of this analysis, suggesting this is an early architectural choice that will evolve as scale demands grow.

## Evidence Found in Codebase

### Key Files
- [`backend/app/services/notifications/base.py`](../../../../../backend/app/services/notifications/base.py) - Lines 5-33
  - Defines the `NotificationAdapter` ABC with `send()` and `is_configured()` contracts
- [`backend/app/services/notifications/resend_adapter.py`](../../../../../backend/app/services/notifications/resend_adapter.py) - Lines 12-93
  - Production adapter: Resend SDK, api_key from settings, returns `(bool, Optional[str])`
- [`backend/app/services/notifications/email_adapter.py`](../../../../../backend/app/services/notifications/email_adapter.py) - Lines 14-117
  - Fallback adapter: aiosmtplib async SMTP, TLS mode detection by port (465=SSL, 587=STARTTLS)
- [`backend/app/services/notifications/notification_service.py`](../../../../../backend/app/services/notifications/notification_service.py) - Lines 17-27
  - Adapter selection logic: priority chain with `EMAIL_PROVIDER` env var
- [`backend/app/config.py`](../../../../../backend/app/config.py) - Lines 60-75
  - Config declaration for both providers, with comment: `# Mude para "resend" no Railway`
- [`backend/alembic/versions/20260123_1212-ea99501454e6_add_notifications_table.py`](../../../../../backend/alembic/versions/20260123_1212-ea99501454e6_add_notifications_table.py)
  - Migration that added the `notifications` table, establishing the persistence layer

### Code Evidence

```python
# backend/app/services/notifications/notification_service.py:17-27
def get_email_adapter():
    """Retorna o adapter de e-mail apropriado baseado na configuração"""
    if settings.EMAIL_PROVIDER == "resend" and resend_adapter.is_configured():
        logger.info("Usando Resend como provedor de e-mail")
        return resend_adapter
    elif email_adapter.is_configured():
        logger.info("Usando SMTP como provedor de e-mail")
        return email_adapter
    else:
        logger.warning("Nenhum provedor de e-mail configurado")
        return email_adapter  # Retorna o SMTP como fallback
```

```python
# backend/app/services/notifications/base.py:5-33
class NotificationAdapter(ABC):
    """Classe base abstrata para adaptadores de notificação"""

    @abstractmethod
    async def send(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass
```

```python
# backend/app/config.py:60-75
# SMTP Configuration (Titan/GoDaddy)
SMTP_HOST: str = ""
SMTP_PORT: int = 587
SMTP_USER: str = ""
SMTP_PASSWORD: str = ""
SMTP_FROM: str = ""
SMTP_FROM_NAME: str = "ContrataPro"
SMTP_USE_TLS: bool = True

# Resend Configuration (alternativa ao SMTP para cloud)
RESEND_API_KEY: str = ""
RESEND_FROM_EMAIL: str = ""  # Se vazio, usa SMTP_FROM
RESEND_FROM_NAME: str = ""   # Se vazio, usa SMTP_FROM_NAME

EMAIL_PROVIDER: str = "smtp"  # Mude para "resend" no Railway
```

```python
# backend/app/models.py:193-194 — channel field anticipates future channels
type = Column(String(50), nullable=False)  # new_appointment, appointment_updated, appointment_cancelled
channel = Column(String(20), nullable=False, default="email")  # email, sms, whatsapp, push
```

### Impact Analysis

- Introduced: 2026-01-23 (notifications migration date)
- Modified: Not available (git history access not available in this session)
- Affects: 5 files in `services/notifications/`, called from 4 consuming modules:
  - `routers/appointments.py` — appointment lifecycle emails
  - `routers/subscriptions.py` — subscription state-change emails (15+ call sites)
  - `services/subscription_jobs.py` — daily cron emails (renewal, trial expiry, payment failure)
  - `services/review_jobs.py` — post-appointment review request emails
- Templates: 12 distinct email templates across appointments, subscriptions, and reviews
- Recent themes: Not available (git history access not available in this session)

### Alternatives (Observable)

The comment in `email_adapter.py` ("Adaptador de notificação via e-mail usando SMTP (Titan/GoDaddy)") reveals the SMTP provider was Titan (GoDaddy's email hosting), indicating Resend was chosen over an existing SMTP setup — not as the initial choice but as a cloud-optimized replacement. This is a migration story: SMTP was first, Resend was added as a better production alternative, with SMTP retained for development.

The `Notification` model's `channel` field (with anticipated values `sms`, `whatsapp`, `push`) shows that alternative channels were considered and explicitly deferred, not dismissed.

## Questions to Address in ADR (if created)

- Why was Resend chosen over SendGrid, Mailgun, AWS SES, or other transactional email providers?
- What deliverability issues (if any) were observed with the Titan/GoDaddy SMTP setup that prompted adding Resend?
- Why is the default `EMAIL_PROVIDER=smtp` rather than failing fast when Resend is not configured? Is the silent SMTP fallback intentional?
- Should subscription emails (`send_subscription_email`) create `Notification` DB records like appointment emails do? The current split (appointment notifications persisted, subscription emails not persisted) is an architectural inconsistency worth documenting.
- What is the strategy for SMS/WhatsApp/push channels that the `channel` field anticipates? Is there a roadmap for expanding beyond email?
- Why was the `notification_service` instantiated at module load time (singleton) rather than per-request? What are the implications for adapter reconfiguration without restart?

## Related Potential ADRs

- The DB-persisted `Notification` model (DATA module) is a dependency of this system — the persistence layer for appointment notifications is a separate concern from the email provider choice, but they were introduced simultaneously.
- The JOB module's cron-based email delivery pattern (review_jobs, subscription_jobs) is architecturally coupled to this decision: the adapters must support async execution from non-request-scoped contexts.

## Additional Notes

There is a notable inconsistency in the notification system that a formal ADR should surface: appointment notifications go through `create_and_send_notification()` which persists a `Notification` DB record before sending, while all subscription and review emails bypass DB persistence entirely via `send_subscription_email()`. This means the in-app notification center (`MyNotifications.jsx`) only shows appointment-related notifications, not subscription or review events. This is likely intentional (subscription emails are informational, not in-app alerts) but is not documented anywhere in the codebase.

The ResendAdapter's `send()` method calls `resend.Emails.send(params)` synchronously (not awaited), despite the method being declared `async`. This works because the Resend Python SDK is synchronous, but it could block the event loop under load — a concern worth noting in a formal ADR discussion.
