# Potential ADR: APScheduler as In-Process Scheduler Over Celery

**Module**: JOB
**Category**: Infrastructure / Technology
**Priority**: Must Document (Score: 125/150)
**Date Identified**: 2026-02-17

---

## What Was Identified

The project uses APScheduler 3.10.4 with `AsyncIOScheduler` embedded directly inside the FastAPI/Uvicorn process to run daily cron jobs. Two jobs are registered at startup via the FastAPI lifespan context manager: subscription lifecycle management at 00:30 BRT and review reminders at 01:00 BRT.

Critically, Celery 5.4.0 and Redis 5.0.8 are both declared in `requirements.txt` and installed, but neither is used anywhere in the runtime codebase. The project declared a distributed task queue dependency, then chose an in-process scheduler instead. This is a deliberate architectural fork that left an explicit artifact (unused Celery + Redis deps) in the dependency tree.

The decision was introduced on 2026-02-04 (commit "feat:config recorrencia") when subscription recurring billing logic was implemented. The review jobs were added on 2026-02-09 ("feat:sistema de avaliacao de prestadores"), following the same pattern — extending the APScheduler approach rather than revisiting the Celery option. As of 2026-02-17, APScheduler has been the sole scheduling mechanism through at least 13 days of feature growth.

The in-process nature of this decision means scheduled jobs compete for memory and event loop time with incoming HTTP requests within the same Uvicorn worker. Railway (the hosting platform) manages the single-process deployment; there is no separate worker Dyno or container.

## Why This Might Deserve an ADR

- **Impact**: Every time-triggered business operation — subscription renewal reminders, trial expiry, scheduled cancellations, plan downgrades, payment grace periods, auto-completed appointments, and review email safety nets — depends on this scheduling mechanism. Any failure in job execution (process restart, Railway deploy) silently skips that day's run.
- **Trade-offs**: In-process scheduling means no message persistence, no retry queues, no dead-letter handling, and no horizontal scaling of job workers. If the process restarts at 00:29, the subscription job does not run until the next day. Celery + Redis would provide persistent task queuing, retries, and independent worker scaling — but at significant operational complexity.
- **Complexity**: Choosing APScheduler forced a second architectural consequence: job services cannot use FastAPI's request-scoped `get_db` dependency. Each job class (`SubscriptionJobsService`, `ReviewJobsService`) instantiates its own `create_async_engine` and `sessionmaker` — a pattern deviation from the rest of the codebase that every future job author must be aware of.
- **Team Knowledge**: Any engineer adding a new scheduled job must understand: (a) where to register the cron trigger in `main.py`, (b) why they must create their own DB session and cannot use `get_db`, and (c) the risk of missing runs on process restart. Without documentation, this is non-obvious.
- **Future Implications**: If the platform grows to require job retries, parallel job workers, or monitoring dashboards, Celery (already installed) is the natural next step. An ADR documents whether that migration was ever formally considered and what the trigger conditions for switching should be.
- **Temporal Context**: Stable pattern applied twice across 13 days (2026-02-04 and 2026-02-09). The Celery dependency presence suggests the alternative was actively considered during project setup.

## Evidence Found in Codebase

### Key Files

- [`backend/app/main.py`](/home/hermano/projetos/faz_de_tudo/backend/app/main.py) - Lines 11-13, 52-68
  - APScheduler import, `AsyncIOScheduler` instantiation, two `CronTrigger` job registrations inside the FastAPI lifespan
- [`backend/app/services/subscription_jobs.py`](/home/hermano/projetos/faz_de_tudo/backend/app/services/subscription_jobs.py) - Lines 28-51
  - `SubscriptionJobsService` class with `init_db()` and `get_session()` — self-managed engine and session, bypassing FastAPI DI
- [`backend/app/services/review_jobs.py`](/home/hermano/projetos/faz_de_tudo/backend/app/services/review_jobs.py) - Lines 26-51
  - `ReviewJobsService` class with identical self-managed session pattern
- [`backend/requirements.txt`](/home/hermano/projetos/faz_de_tudo/backend/requirements.txt) - Lines 2, 12, 68
  - `apscheduler==3.10.4`, `celery==5.4.0`, `redis==5.0.8` all declared — Celery and Redis installed but unused

### Code Evidence

```python
# backend/app/main.py:52-68
# Lifespan registers both jobs at startup, embedded in the web server process
brasilia_tz = pytz.timezone('America/Sao_Paulo')
scheduler.add_job(
    subscription_jobs.run_daily_subscription_jobs,
    CronTrigger(hour=0, minute=30, timezone=brasilia_tz),
    id="daily_subscription_jobs",
    name="Jobs diarios de assinatura",
    replace_existing=True
)
scheduler.add_job(
    review_jobs.run_daily_review_jobs,
    CronTrigger(hour=1, minute=0, timezone=brasilia_tz),
    id="daily_review_jobs",
    name="Jobs diarios de avaliacao",
    replace_existing=True,
)
scheduler.start()
```

```python
# backend/app/services/subscription_jobs.py:35-51
# Job service creates its own engine — cannot use FastAPI get_db (not request-scoped)
async def init_db(self):
    """Inicializa conexao com banco de dados"""
    if not self.engine:
        self.engine = create_async_engine(
            settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
            echo=False
        )
        self.async_session = sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

async def get_session(self) -> AsyncSession:
    """Retorna uma sessao do banco"""
    await self.init_db()
    return self.async_session()
```

```python
# backend/requirements.txt:2,12,68
# All three declared — only APScheduler is used at runtime
apscheduler==3.10.4
celery==5.4.0
redis==5.0.8
```

### Impact Analysis

- Introduced: 2026-02-04 (subscription jobs), 2026-02-09 (review jobs)
- Modified: 2 commits introducing the pattern, consistent approach across both job services
- Last change: 2026-02-09 ("feat:sistema de avaliacao de prestadores")
- Affects: 2 job service files, `main.py` (scheduler registration), every future background job
- Unused alternatives: Celery + Redis declared in requirements (4 related packages: celery, redis, kombu, amqp, billiard, vine)
- Recent themes: "feat" (new features), "fix" (subscription flow corrections), no scheduler-specific fixes observed

### Alternatives (Observable)

Celery 5.4.0 + Redis 5.0.8 are explicitly declared in `requirements.txt` alongside related packages (`kombu==5.5.4`, `amqp==5.3.1`, `billiard==4.2.2`, `vine==5.1.0`). These are Celery's own dependencies, indicating Celery was set up as a dependency but never wired into the application. This is direct evidence the Celery option was active at some point during project initialization.

## Questions to Address in ADR (if created)

- Why was APScheduler chosen over Celery for subscription lifecycle management?
- Was job persistence (surviving process restarts) explicitly evaluated and accepted as a risk?
- What are the trigger conditions for migrating to Celery (e.g., job failure SLA, horizontal scaling need)?
- Should Celery and Redis be removed from `requirements.txt` to avoid confusion, or retained for future use?
- How are missed runs detected and recovered (e.g., if Railway restarts at 00:29)?
- Was the self-managed DB session pattern in job services intentional, and should it be codified as the standard pattern for all future jobs?

## Related Potential ADRs

- No other JOB module ADRs identified at this time.
- Related modules to review for context: CORE (lifespan pattern, scheduler registration), SUB (scheduled cancellation/downgrade fields that the job processes), REVIEW (auto-complete + safety net trigger).

## Additional Notes

The six Celery-related packages in requirements.txt (`celery`, `redis`, `kombu`, `amqp`, `billiard`, `vine`) add approximately 6 MB of installed dependencies with no runtime benefit. Removing them would reduce deployment image size. However, retaining them signals the team's intent to use Celery in the future. This decision either way is worth documenting.

The self-managed session pattern in job services (each class creates its own `create_async_engine`) is a necessary consequence of APScheduler's design — jobs run outside the HTTP request lifecycle and thus outside FastAPI's dependency injection scope. Async SQLAlchemy also prohibits lazy loading, making explicit session management non-negotiable. This is documented here as an architectural side-effect rather than a separate ADR, as its score (50/150) falls below the documentation threshold.
