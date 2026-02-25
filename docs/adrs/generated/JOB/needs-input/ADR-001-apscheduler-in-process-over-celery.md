# ADR-001: APScheduler In-Process Scheduler Over Celery

**Status:** Accepted
**Date:** 2026-02-04
**Related to:**
- [ADR-001: FastAPI as Primary Backend Framework](../../CORE/ADR-001-fastapi-as-primary-backend-framework.md)
- [ADR-001: APScheduler as In-Process Job Scheduler](../../CORE/needs-input/ADR-001-apscheduler-as-in-process-job-scheduler.md)
- [ADR-001: Resend as Production Transactional Email Provider with Adapter Pattern](../../NOTIF/needs-input/ADR-001-resend-as-production-transactional-email-provider.md)

---

## Context and Problem Statement

The platform requires time-triggered background jobs to run daily business operations: subscription lifecycle management (renewals, trial expiry, grace periods, downgrades) and review workflow automation (appointment auto-completion, reminder email safety nets). These jobs must execute on a predictable daily schedule regardless of user activity.

The project is deployed as a single-process application on Railway with no separate worker infrastructure. The codebase includes both APScheduler 3.10.4 and Celery 5.4.0 in its dependency manifest, along with Celery's full dependency chain (kombu, amqp, billiard, vine). Only APScheduler is wired into the runtime. Celery was declared as a dependency but never connected to the application, indicating the distributed task queue option was actively considered during project initialization before the current approach was established.

The in-process scheduling model means that all scheduled jobs execute within the same Uvicorn worker that serves HTTP requests. Jobs cannot use FastAPI's request-scoped dependency injection and must manage their own database connections independently — a pattern deviation that applies to every future background job author.

## Decision Drivers

- Single-process Railway deployment with no dedicated worker containers available at current scale
- Operational simplicity preferred over distributed infrastructure for an early-stage marketplace
- Two job services already implemented using self-managed database session pattern, establishing a de facto standard
- Celery's full dependency chain installed but unused, creating dependency bloat and architectural ambiguity
- [NEEDS INPUT: Was reducing infrastructure complexity an explicit product or cost constraint at the time of the decision?]

## Considered Options

1. **APScheduler 3.10.4 with AsyncIOScheduler** — in-process cron scheduler embedded in the FastAPI lifespan, each job service manages its own async database engine
2. **Celery 5.4.0 + Redis** — distributed task queue with persistent message broker, independent worker processes, retry queues, and dead-letter handling

## Decision Outcome

Chosen option: APScheduler in-process scheduler, because it requires no additional infrastructure beyond the existing single-process Railway deployment. The daily scheduling requirements of the platform — two jobs, low frequency, non-interactive — fit within the operational envelope of an embedded scheduler without needing a message broker, worker processes, or queue management.

[NEEDS INPUT: Was the risk of missed runs on process restart (e.g., Railway deploy at 00:29 before the subscription job) explicitly evaluated and accepted, or was it an implicit consequence of the simplicity preference?]

## Pros and Cons of the Options

### APScheduler In-Process

- Good: Zero additional infrastructure — no Redis instance, no worker Dyno, no broker configuration
- Good: Native async integration with Python asyncio event loop and FastAPI lifespan
- Good: Immediate setup for low-frequency daily jobs with no operational overhead
- Bad: No job persistence — a process restart between schedule time and execution silently skips that day's run
- Bad: Jobs share memory and event loop with HTTP request handling, creating resource contention risk under load
- Bad: Job services must bypass FastAPI dependency injection and manage database connections independently

### Celery + Redis

- Good: Persistent task queue survives process restarts and redeploys
- Good: Independent worker scaling separate from the web server process
- Good: Built-in retry, dead-letter queuing, and task monitoring (Flower dashboard)
- Bad: Requires a Redis instance and separate worker process deployment — significant operational complexity increase
- Bad: Celery's async support requires additional configuration and is less idiomatic with FastAPI's asyncio model

## Consequences

The current architecture relies on Railway's deployment stability to avoid missed job runs. The subscription job at 00:30 BRT and the review job at 01:00 BRT have no recovery mechanism if the process restarts within their execution window. Any future job added to the platform inherits this constraint and must also implement the self-managed database session pattern rather than using FastAPI's standard dependency injection.

The Celery and Redis packages remain in `requirements.txt` alongside their full dependency chain (six packages totaling approximately 6 MB). Their presence either signals intent to adopt Celery when scale demands it or represents resolved ambiguity from project initialization. [NEEDS INPUT: Should Celery and its dependencies be removed from requirements.txt to reduce image size and eliminate architectural ambiguity, or retained as a forward migration signal?]

If the platform requires job retries, parallel job execution, or operational monitoring dashboards, Celery is the natural migration path given it is already declared as a dependency. [NEEDS INPUT: What are the explicit trigger conditions for initiating that migration — job failure SLA, deployment frequency, horizontal scaling requirement, or other measurable threshold?]

## References

- `backend/app/main.py:52-68` — AsyncIOScheduler registration inside FastAPI lifespan, CronTrigger job definitions
- `backend/app/services/subscription_jobs.py:28-51` — SubscriptionJobsService with self-managed async engine and session pattern
- `backend/app/services/review_jobs.py:26-51` — ReviewJobsService with identical self-managed session pattern
- `backend/requirements.txt:2,12,68` — APScheduler, Celery, and Redis all declared; only APScheduler active at runtime
