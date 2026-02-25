# ADR-001: FastAPI as Primary Backend Framework

**Status:** Accepted
**Date:** 2026-01-14
**Related to:**
- [ADR-001: APScheduler In-Process Scheduler Over Celery](../JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md)
- [ADR-001: Stateless JWT Authentication with HS256](../AUTH/needs-input/ADR-001-stateless-jwt-authentication-hs256.md)
- [ADR-001: React 19 + Vite 7 as Frontend SPA Framework](../FE-APP/needs-input/ADR-001-react-vite-spa-framework.md)

**Used by:**
- [ADR-001: SQLAlchemy 2.0 Async ORM as Data Access Layer](../DATA/ADR-001-sqlalchemy-async-orm-as-data-access-layer.md)
- [ADR-001: PostgreSQL 15 as Primary Relational Database](../DATA/needs-input/ADR-001-postgresql-as-primary-database.md)

---

## Context and Problem Statement

ContrataPro required a Python web framework to serve as the structural foundation for a Brazilian
professional services marketplace backend. The chosen framework would dictate the async programming
model, dependency injection strategy, schema validation approach, API documentation generation, and
middleware integration for all backend modules.

The framework was selected at project inception (2026-01-14) and has been the unchallenged
foundation across all 13 domain routers covering the full business domain: users, services,
appointments, subscriptions, reviews, scheduling, and platform administration. The framework's
async-first model directly determined the selection of complementary infrastructure — async
PostgreSQL driver, SQLAlchemy async mode, and async-compatible HTTP and email clients.

[NEEDS INPUT: Was the async-first approach a deliberate performance decision for the expected
concurrency profile of a marketplace, or was it primarily incidental to FastAPI's design and
popularity at the time of selection?]

## Decision Drivers

- All backend business domains require a unified request lifecycle, dependency injection, and
  schema validation model to support consistent development across a growing team
- The Railway deployment target (Nixpacks builder, single-process Uvicorn) constrained the
  framework to Python-native solutions without build-time dependencies on external binary runtimes
- Automatic OpenAPI documentation generation reduces API consumer friction and accelerates
  frontend-backend integration cycles
- The async-first constraint propagates to every layer: database driver, HTTP client, email
  client, and background task execution must all be async-compatible
- Pydantic v2 integration for request and response schema validation was a baseline requirement
  for runtime type safety across all 13 endpoints groups

## Considered Options

1. **FastAPI 0.115** — async-native Python framework with Pydantic v2 integration, automatic
   OpenAPI generation, and a declarative dependency injection system
2. **Django REST Framework** — batteries-included REST framework built on Django's synchronous
   ORM, admin panel, and opinionated project structure
3. **Flask** — minimal synchronous micro-framework with full developer control over routing,
   serialization, and middleware composition

## Decision Outcome

Chosen option: FastAPI, because it provides native async support, a declarative dependency
injection system, and automatic OpenAPI documentation generation within a lightweight framework
that requires no deviation from the single-process Uvicorn deployment model on Railway.

FastAPI's dependency injection system — used for authentication guards, authorization checks, and
request-scoped database session management — enabled a consistent, reusable security and data
access model across all domain routers without custom middleware boilerplate.

## Pros and Cons of the Options

### FastAPI 0.115

- Good: Async-native design aligns with asyncpg and SQLAlchemy async, eliminating the need for
  sync-to-async bridging at the database layer
- Good: Declarative dependency injection enables reusable authentication guards and request-scoped
  database sessions shared across all routers
- Good: Automatic OpenAPI generation at `/docs` provides living API documentation with no
  maintenance overhead
- Bad: Async programming model requires all team members to understand Python async/await, async
  context managers, and SQLAlchemy's no-lazy-loading constraint before contributing to any endpoint
- Bad: Mixing synchronous blocking calls within async request handlers causes subtle latency spikes
  that are difficult to detect during development

### Django REST Framework

- Good: Batteries-included ORM, admin panel, and authentication system reduce initial scaffolding
  for a marketplace with user management and content moderation needs
- Good: Synchronous programming model is more accessible to developers without async experience
- Bad: Django's synchronous ORM requires async wrappers (sync_to_async) or a separate async ORM,
  adding complexity to every database operation
- Bad: Django's opinionated project structure conflicts with the single-file model convention
  (all models in models.py, all schemas in schemas.py) established for this project

### Flask

- Good: Minimal core allows full architectural freedom in routing, serialization, and middleware
  composition
- Bad: No built-in dependency injection, schema validation, or OpenAPI generation — each requires
  a separate library with its own maintenance surface
- Bad: Synchronous-first design makes async adoption partial and inconsistent without significant
  extension work

## Consequences

FastAPI's async model has propagated an async-first constraint throughout the entire backend
infrastructure stack. Every component that touches the request path — database sessions, HTTP
clients for payment gateway calls, email delivery, and background task execution — must be
async-compatible. This constraint is non-negotiable and applies to every future module added to
the platform.

The dependency injection system, while powerful, creates a pattern deviation for background job
services: scheduled jobs run outside the FastAPI request context and cannot use the standard
dependency injection chain for database access. Each background job service manages its own
database engine and session lifecycle independently. This architectural split is documented in
JOB/ADR-001 and must be understood by any developer authoring new background services.

Migrating away from FastAPI would require rewriting all 13 domain routers, all dependency
injection guards, the middleware stack, and the lifespan-managed scheduler integration. The
tight Pydantic v2 coupling means schema definitions are not portable to a different framework
without significant rework. This decision is effectively load-bearing for the lifetime of the
current architecture.

## References

- `backend/app/main.py:8`
- `backend/app/dependencies.py:1`
- `backend/app/routers/__init__.py:1`
- `backend/requirements.txt:1`
