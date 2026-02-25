# Potential ADR: APScheduler as In-Process Job Scheduler

**Module**: CORE
**Category**: Architecture / Infrastructure
**Priority**: Must Document (Score: 130)
**Date Identified**: 2026-02-17

---

## What Was Identified

ContrataPro uses APScheduler 3.10.4 embedded directly within the FastAPI process to run business-critical daily cron jobs. The scheduler is initialized as a global `AsyncIOScheduler` instance in `main.py` and managed through FastAPI's lifespan context manager — it starts on application startup and stops on shutdown. Two cron jobs are registered: subscription lifecycle management at 00:30 BRT and review trigger safety-net at 01:00 BRT.

This decision was introduced on 2026-02-04 with the commit "feat:config recorrencia" (subscription recurrence configuration), when the subscription billing lifecycle required automated management. The review jobs were added on 2026-02-09 as part of the review system feature. The in-process scheduler shares the same Python process as the API server, runs in the same asyncio event loop, and uses the same database connection infrastructure.

Notably, the project's `requirements.txt` also declares Celery 5.4.0 and Redis as dependencies, but these are not yet activated or used anywhere in the codebase — suggesting the team was aware of the Celery alternative but opted for the simpler in-process APScheduler approach for the current stage.

## Why This Might Deserve an ADR

- **Impact**: Affects the JOB module entirely, and indirectly affects SUB (subscription lifecycle), REVIEW (auto-complete + safety-net emails), APPT (auto-completion of past appointments), and NOTIF (emails dispatched by jobs). Any developer adding a new scheduled task must understand this infrastructure.
- **Trade-offs**: In-process scheduling means jobs run only when the API server is running — if Railway restarts the container, in-flight jobs may be interrupted. A Celery + Redis worker would offer job persistence, retry queues, and independent scaling. APScheduler is simpler to operate (no separate worker process), but cannot distribute load and shares memory with the API.
- **Complexity**: The job services use their own DB session management (`AsyncSessionLocal` directly), not the request-scoped `get_db` dependency — a pattern that must be understood by any developer adding jobs.
- **Team Knowledge**: Critical for developers working on subscription billing, review automation, or any future background processing. The distinction between request-scoped and job-scoped DB sessions is a non-obvious pattern.
- **Future Implications**: If the platform scales and requires distributed job execution or job persistence across restarts, migration to Celery + Redis (already declared as a dependency) would be needed. The Celery dependency being present suggests this migration path is already anticipated. The current architecture makes this a deliberate deferral, not an oversight.
- **Temporal Context**: Introduced 2026-02-04, approximately 13 days old. Two jobs registered, growing with each new automated feature.

## Evidence Found in Codebase

### Key Files
- [`backend/app/main.py`](/home/hermano/projetos/faz_de_tudo/backend/app/main.py) — Lines 25-75: Scheduler instantiation, job registration, lifespan management
- [`backend/app/services/subscription_jobs.py`](/home/hermano/projetos/faz_de_tudo/backend/app/services/subscription_jobs.py) — Subscription lifecycle job (00:30 BRT)
- [`backend/app/services/review_jobs.py`](/home/hermano/projetos/faz_de_tudo/backend/app/services/review_jobs.py) — Review automation job (01:00 BRT)

### Code Evidence
```python
# backend/app/main.py:25 — Global in-process scheduler
scheduler = AsyncIOScheduler()

# backend/app/main.py:52-68 — Jobs registered in lifespan startup
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

# backend/app/main.py:73-74 — Graceful shutdown
scheduler.shutdown()
```

```python
# Pattern: Jobs manage their own DB sessions (not request-scoped)
# backend/app/services/subscription_jobs.py (representative pattern)
# Jobs use AsyncSessionLocal directly, not the get_db dependency
```

### Impact Analysis
- APScheduler introduced: 2026-02-04 ("feat:config recorrencia")
- Review jobs added: 2026-02-09 ("feat:sistema de avaliacao de prestadores")
- Modified: 2 meaningful commit groups over 5 days
- Celery + Redis declared but unused: suggests intentional deferral
- Affects: JOB, SUB, REVIEW, APPT, NOTIF modules (5 of 18 modules)
- Timezone: Explicitly `America/Sao_Paulo` (Brasilia) — business-critical for Brazilian market timing

### Alternatives (if observable)
The presence of `celery==5.4.0` and `redis` in `requirements.txt` without any usage is direct evidence that Celery was evaluated and explicitly deferred. This is not an oversight — the dependencies are declared, indicating awareness of the alternative.

## Questions to Address in ADR (if created)

- Why was APScheduler chosen over activating the already-declared Celery + Redis dependency?
- What triggers would cause migration to Celery (job failure tolerance requirements, scaling needs)?
- Is the in-process scheduler acceptable given Railway's container restart behavior?
- What is the job failure handling strategy — if a Railway restart interrupts a subscription job at 00:30, what happens?
- Should job execution be idempotent by design, and is the current implementation idempotent?
- What monitoring exists for job execution success/failure?

## Related Potential ADRs
- [FastAPI as Primary Backend Framework](./fastapi-as-primary-backend-framework.md) — scheduler is embedded in FastAPI lifespan
- Potential ADR for APScheduler in-process job session management pattern (JOB module)
- Potential ADR for Celery + Redis as deferred alternative (if/when activated)

## Additional Notes
The `replace_existing=True` parameter on job registration is a defensive pattern ensuring that if the lifespan restarts without a full process shutdown (e.g., hot reload), jobs are not duplicated. The `pytz.timezone('America/Sao_Paulo')` timezone is hardcoded — this is intentional for a Brazilian-only product, but worth documenting as a constraint.
