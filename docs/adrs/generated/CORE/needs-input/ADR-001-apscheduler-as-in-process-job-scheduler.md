# ADR-001: APScheduler as In-Process Job Scheduler

**Status:** Accepted
**Date:** 2026-02-04
**Related to:**
- [ADR-001: APScheduler In-Process Scheduler Over Celery](../../JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md)
- [ADR-001: FastAPI as Primary Backend Framework](../ADR-001-fastapi-as-primary-backend-framework.md)

---

## Context and Problem Statement

ContrataPro requires time-triggered background automation for business-critical operations: subscription lifecycle management and review workflow processing. These operations must execute on a predictable daily schedule without user interaction and must integrate with the same database and configuration infrastructure used by the HTTP layer.

The platform is deployed as a single-process application on Railway with no dedicated worker infrastructure. The architecture decision was whether to embed the scheduler within the FastAPI process — sharing the asyncio event loop and application startup/shutdown lifecycle — or to operate a separate distributed task queue. APScheduler 3.10.4 was integrated into the FastAPI lifespan context manager on 2026-02-04, running two daily cron jobs within the Uvicorn worker process itself. Celery 5.4.0 and its full dependency chain are declared in the project dependencies but were never connected to the application runtime, indicating the distributed alternative was evaluated and explicitly deferred.

The in-process approach means the scheduler starts and stops with the HTTP server, cannot survive process restarts, and shares the application's asyncio event loop with concurrent HTTP request handling. This is a deliberate architectural constraint accepted at the current scale of the platform.

## Decision Drivers

- Single-process Railway deployment with no worker container infrastructure available at launch
- Operational simplicity preferred over distributed infrastructure for an early-stage marketplace
- Native asyncio integration eliminates the need for thread pool or subprocess bridging
- FastAPI lifespan context manager provides clean scheduler lifecycle management without external orchestration
- [NEEDS INPUT: Was operational simplicity an explicit product or cost constraint at the time of the decision, or was it an implicit consequence of the single-developer team structure?]

## Considered Options

1. **APScheduler 3.10.4 in-process** — AsyncIOScheduler embedded in FastAPI lifespan, jobs run in the same process and asyncio event loop as the HTTP server
2. **Celery 5.4.0 + Redis** — distributed task queue with a separate worker process, persistent message broker, retry queues, and independent scaling
3. **Railway cron jobs (external trigger)** — HTTP endpoint triggered by a Railway-managed cron schedule, keeping job logic in the web process without an embedded scheduler library

## Decision Outcome

Chosen option: APScheduler in-process, because it requires no additional infrastructure beyond the existing single-process Railway deployment and integrates natively with FastAPI's asyncio event loop and lifespan management. The two daily jobs operate at low frequency with no requirement for job persistence across restarts or parallel execution.

[NEEDS INPUT: Was the risk of missed job runs on container restart — such as a Railway deploy occurring at 00:29 before the 00:30 subscription job — explicitly evaluated and accepted, or was it an implicit consequence of the simplicity preference?]

## Pros and Cons of the Options

### APScheduler In-Process

- Good: Zero additional infrastructure — no Redis instance, no worker deployment, no broker configuration
- Good: Native asyncio event loop integration with FastAPI lifespan startup and shutdown hooks
- Good: Jobs have direct access to the same environment configuration as the HTTP layer
- Bad: No job persistence — a container restart within the execution window silently skips that day's run
- Bad: Jobs share memory and CPU with concurrent HTTP request handling, creating resource contention under load

### Celery + Redis

- Good: Persistent task queue survives process restarts and deploys
- Good: Independent worker process scaling separate from the web server
- Bad: Requires Redis infrastructure and a separate worker container, significantly increasing operational complexity
- Bad: Celery's async support requires additional configuration and is less idiomatic with FastAPI's asyncio model

### Railway Cron (External Trigger)

- Good: Keeps job scheduling external to the application process, decoupling scheduling from the web runtime
- Good: No embedded scheduler library required; endpoint is testable via direct HTTP calls
- Bad: Requires authenticated endpoint management and exposes job execution as an HTTP surface
- Bad: Railway's cron granularity and timezone configuration are less flexible than APScheduler's CronTrigger

## Consequences

All scheduled operations on the platform execute within the same process boundary as HTTP request handling. The scheduler shares the asyncio event loop with Uvicorn, meaning a long-running job can delay HTTP request processing during its execution window. As the number of jobs grows, this contention risk increases proportionally. Each new scheduled job author must understand that FastAPI's request-scoped dependency injection is unavailable in the job context and that jobs must manage their own database sessions independently.

The Celery 5.4.0 dependency and its full chain remain declared in the project manifest alongside APScheduler. Their presence signals the migration path when the platform outgrows the in-process model. [NEEDS INPUT: Should Celery and its dependencies be removed from the dependency manifest to reduce container image size and eliminate architectural ambiguity, or retained as an explicit forward migration signal?] The migration to Celery is a non-trivial operational change — it requires provisioning Redis, deploying a worker container, and converting all existing job services to Celery task signatures.

[NEEDS INPUT: What are the specific trigger conditions for initiating the migration to Celery — for example, a measurable job failure rate, a horizontal scaling requirement, or a business SLA on subscription billing accuracy?]

## References

- `backend/app/main.py:25-75` — AsyncIOScheduler instantiation, CronTrigger job registration, and lifespan lifecycle management
- `backend/app/services/subscription_jobs.py:1` — Subscription lifecycle automation job with self-managed database session pattern
- `backend/app/services/review_jobs.py:1` — Review workflow automation job with identical self-managed session pattern
- `backend/requirements.txt:2` — APScheduler, Celery, and Redis all declared; only APScheduler active at runtime
