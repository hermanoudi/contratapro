# ADR-001: SQLAlchemy 2.0 Async ORM as Data Access Layer

**Status:** Accepted
**Date:** 2026-01-05
**Depends on:**
- [ADR-001: FastAPI as Primary Backend Framework](../CORE/ADR-001-fastapi-as-primary-backend-framework.md)
- [ADR-001: PostgreSQL 15 as Primary Relational Database](./needs-input/ADR-001-postgresql-as-primary-database.md)

**Used by:** [ADR-002: Denormalized Rating Aggregates on User for Search Performance](./ADR-002-denormalized-rating-aggregates-on-user.md)

---

## Context and Problem Statement

ContrataPro required a data access layer capable of integrating with PostgreSQL under a fully
async execution model. The chosen ORM would define the programming interface for every database
interaction in the system — model definitions, query composition, relationship loading, session
lifecycle, and schema migration execution.

SQLAlchemy 2.0 in async mode was adopted at project inception (2026-01-05) and has remained the
foundational data access mechanism through 9 migration cycles and the full growth of the domain
model to 10 entities. The choice was reinforced by FastAPI's async-native design (CORE/ADR-001):
the framework's dependency injection system manages request-scoped database sessions, and every
router, background job service, and migration runner operates through the same async session API.

A non-obvious constraint introduced by this choice is the absence of lazy loading. SQLAlchemy's
async mode requires all ORM relationship traversal to be declared explicitly at query time via
eager loading strategies. This constraint applies uniformly to every developer working on any
backend feature.

## Decision Drivers

- FastAPI's async-first model (CORE/ADR-001) requires that the database layer never block the
  event loop, ruling out synchronous ORM approaches
- A well-established ORM with a stable migration ecosystem (Alembic) was necessary to manage
  schema evolution across the full business domain without raw SQL maintenance overhead
- Type-safe model definitions and relationship declarations reduce runtime errors when navigating
  complex entity graphs spanning users, services, appointments, subscriptions, and reviews
- Explicit relationship loading discipline was acceptable given the small team size and the
  ability to enforce it through code review
- The asyncpg driver provides the highest-performance PostgreSQL connection layer for Python async
  applications, and SQLAlchemy 2.0 async integrates with it natively

## Considered Options

1. **SQLAlchemy 2.0 async** — mature ORM with native async API, asyncpg integration, Alembic
   migration tooling, and explicit eager loading as the relationship access model
2. **SQLModel** — thin library that unifies SQLAlchemy models with Pydantic schemas, reducing
   schema duplication between ORM and API layers
3. **Raw asyncpg** — direct use of the PostgreSQL async driver without an ORM abstraction,
   giving maximum query control at the cost of manual schema and relationship management

## Decision Outcome

Chosen option: SQLAlchemy 2.0 async, because it provides a proven async-native ORM with
first-class Alembic integration, enabling schema-controlled migration management across the full
business domain from day one.

[NEEDS INPUT: Was SQLModel evaluated and rejected because of immaturity at the time of selection,
or because the team preferred to keep ORM models and Pydantic schemas as separate concerns with
independent evolution?]

The session is configured with `expire_on_commit=False` to allow background job services to read
entity attributes after a transaction commits without triggering additional database round-trips.
This configuration is load-bearing for the scheduler-based job services that process subscription
renewals and auto-completion of appointments outside the FastAPI request context.

## Pros and Cons of the Options

### SQLAlchemy 2.0 async

- Good: Native async API eliminates sync-to-async bridging at the database layer, preserving
  event loop throughput under concurrent request load
- Good: Alembic integration provides a structured, version-controlled migration workflow that
  scales with schema complexity over time
- Good: Explicit eager loading (selectinload, joinedload) prevents accidental N+1 query patterns
  by making relationship access costs visible at the query declaration site
- Bad: Disabling lazy loading is a non-default behavior that every developer must internalize
  before writing queries involving related entities; it raises the onboarding floor

### SQLModel

- Good: Unified model definition reduces boilerplate by eliminating the parallel Pydantic schema
  declarations that mirror ORM models
- Bad: SQLModel was less mature than SQLAlchemy 2.0 at the time of adoption, with a smaller
  community and thinner documentation for async usage patterns
- Bad: Merging ORM and API schema concerns into a single class hierarchy constrains the ability
  to evolve response shapes independently of the database schema

### Raw asyncpg

- Good: Maximum query control and minimal abstraction overhead for performance-critical paths
- Bad: Manual management of all schema definitions, relationship joins, and migration scripts
  eliminates the structural benefits of an ORM for a 10-entity domain model
- Bad: No Alembic integration; schema evolution requires handwritten SQL migration files with
  no autogenerate support

## Consequences

The async-first ORM constraint propagates throughout the entire backend. All 13 domain routers,
2 background job services, and the Alembic migration runner operate through SQLAlchemy's async
API. Any future module that requires database access must follow the same async session pattern.
Synchronous database operations within async request handlers are prohibited, as they block the
event loop and degrade concurrency under load.

The absence of lazy loading creates a standing requirement for explicit relationship loading in
every query that navigates entity associations. Developers must declare all required relationships
at the query site using selectinload or joinedload. This discipline prevents N+1 patterns but
requires upfront knowledge of the data access patterns for each endpoint. The review system
(ReviewToken, Review) and the professional search optimization (search index queries) both
demonstrate this pattern in practice.

Migrating away from SQLAlchemy would require rewriting all model definitions, all query
compositions across 13 routers, the session lifecycle in background services, and the entire
Alembic migration history. The 10-model schema is structurally coupled to SQLAlchemy's column
and relationship API. This decision is effectively permanent for the lifetime of the current
backend architecture.

## References

- `backend/app/database.py:1`
- `backend/app/models.py:1`
- `backend/alembic/env.py:93`
- `backend/requirements.txt:1`
