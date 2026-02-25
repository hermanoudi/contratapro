# ADR-001: PostgreSQL 15 as Primary Relational Database

**Status:** Accepted
**Date:** 2026-01-05
**Related to:**
- [ADR-001: FastAPI as Primary Backend Framework](../../CORE/ADR-001-fastapi-as-primary-backend-framework.md)
- [ADR-002: Denormalized Rating Aggregates on User for Search Performance](../ADR-002-denormalized-rating-aggregates-on-user.md)

**Used by:**
- [ADR-001: SQLAlchemy 2.0 Async ORM as Data Access Layer](../ADR-001-sqlalchemy-async-orm-as-data-access-layer.md)
- [ADR-001: PostgreSQL GIN Trigram Indexes for Professional Search](../../SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md)

---

## Context and Problem Statement

ContrataPro required a persistent relational data store from project inception to hold the
complete application state of a Brazilian professional services marketplace: users, professionals,
subscriptions, appointments, services, working hours, notifications, reviews, and subscription
plans. The database selection was the first foundational infrastructure decision and has remained
unchallenged across 9 migration cycles over 36 days.

PostgreSQL 15, managed via Railway's hosted database service, was chosen as the sole stateful
external dependency. Unlike the payment gateway, image storage, and email providers — which are
external APIs contracted by the application — the database is owned and operated as part of the
platform infrastructure. All other services are disposable; the database cannot be.

The decision deepened intentionally on 2026-02-10 when the `pg_trgm` extension and GIN trigram
indexing strategy were adopted for professional search. This created a hard dependency on
PostgreSQL-specific extensions, making the choice irreversible without replacing the entire text
search architecture.

## Decision Drivers

- All 10 domain entities require referential integrity and relational joins, ruling out
  document databases as a primary store
- Railway's managed PostgreSQL service provides zero-configuration provisioning and injects
  the standard connection URL automatically into the application environment
- The async-first FastAPI architecture (CORE/ADR-001) requires a database driver that supports
  non-blocking I/O, which asyncpg provides natively for PostgreSQL
- The `pg_trgm` GIN indexing strategy for ILIKE-based professional search requires
  PostgreSQL-specific extension support unavailable in MySQL or SQLite
- [NEEDS INPUT: Document whether PostgreSQL was the team's first choice on technical merit,
  or whether Railway's managed offering was the primary selection driver]

## Considered Options

1. **PostgreSQL 15 via Railway managed service** — open-source RDBMS with advanced indexing,
   timezone-aware datetime handling, server-side defaults, and the `pg_trgm` extension for
   full-text trigram search
2. **MySQL/MariaDB** — widely adopted open-source RDBMS with broad hosting support, lacking
   GIN index types and the `pg_trgm` extension for efficient ILIKE wildcard queries
3. **SQLite** — embedded file-based RDBMS used as a local development fallback in the default
   connection string, without network access, concurrent write support, or extension ecosystem

## Decision Outcome

Chosen option: PostgreSQL 15, because it is the only RDBMS among the evaluated options that
supports the full feature set in active use: asyncpg non-blocking driver, timezone-aware datetime
columns with server-side defaults, and the `pg_trgm` GIN index strategy for efficient
ILIKE-based professional search without sequential table scans.

[NEEDS INPUT: Document the explicit business or technical rationale for selecting PostgreSQL
over MySQL at project inception, before the pg_trgm dependency was introduced. At the time of
the initial decision, both were viable relational options — the rationale for the choice
clarifies whether portability was ever a consideration.]

## Pros and Cons of the Options

### PostgreSQL 15 via Railway managed service

- Good: Native asyncpg driver enables true non-blocking database I/O, consistent with the
  FastAPI async-first architecture
- Good: `pg_trgm` extension with GIN indexes supports efficient ILIKE wildcard queries for
  city and category search without full-table scans
- Good: `DateTime(timezone=True)` columns and `server_default=func.now()` server-side triggers
  are handled natively with no application-layer workarounds
- Bad: Railway's `DATABASE_URL` format omits the asyncpg driver prefix, requiring active
  string rewriting in both the application configuration and the Alembic environment
- Bad: `pg_trgm` GIN indexes are invisible operational dependencies — engineers without
  awareness of the extension must manually enable it in local development environments

### MySQL/MariaDB

- Good: Broad hosting support across providers reduces vendor dependency concentration
- Good: Familiar to a wider pool of backend developers than PostgreSQL
- Bad: No `pg_trgm` extension or GIN index type — the current ILIKE search strategy has no
  direct equivalent and would require full-text search reengineering
- Bad: Timezone handling and server-side default semantics differ from PostgreSQL, requiring
  schema and query adjustments

### SQLite

- Good: Zero-configuration local development with no external service dependency
- Bad: No network access, no concurrent write support, and no extension ecosystem — unsuitable
  for any multi-user production deployment
- Bad: Incompatible with the asyncpg driver and GIN index migration scripts

## Consequences

The adoption of `pg_trgm` GIN indexes on 2026-02-10 transformed a pragmatic infrastructure
choice into an architectural commitment. Migrating to any non-PostgreSQL database now requires
replacing the text search indexing strategy entirely and rewriting all ILIKE-based search queries.
The practical cost of migration has grown from high to prohibitive over the 36-day initial
development period.

Railway's URL injection behavior creates an operational coupling: the `DATABASE_URL` environment
variable requires active rewriting from `postgresql://` to `postgresql+asyncpg://` in both the
application configuration layer and the Alembic migration environment. Any developer provisioning
a new Railway environment or configuring local development must be aware of this requirement.
The GIN index migration also requires the `pg_trgm` extension to be enabled in every PostgreSQL
instance used by the application — including local Docker Compose environments.

[NEEDS INPUT: Confirm whether the Docker Compose local development environment provisions
PostgreSQL 15 with the `pg_trgm` extension enabled, and document the manual steps (if any)
required for new engineers to enable the extension in local databases.]

[NEEDS INPUT: Document the contingency strategy if Railway's managed PostgreSQL pricing becomes
prohibitive. Identify whether migration to another managed PostgreSQL provider (Supabase, Neon,
AWS RDS) was evaluated, or whether the team accepts the vendor dependency as a business risk.]

## References

- `backend/app/database.py:9-13`
- `backend/app/config.py:8-17`
- `backend/alembic/versions/20260210_1200-add_search_indexes.py:22-44`
- `backend/app/models.py:74`
