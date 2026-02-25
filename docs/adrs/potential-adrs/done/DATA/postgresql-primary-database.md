# Potential ADR: PostgreSQL 15 as the Primary Relational Database

**Module**: DATA
**Category**: Technology / Infrastructure
**Priority**: Must Document (Score: 150/150)
**Date Identified**: 2026-02-17

---

## What Was Identified

PostgreSQL 15, managed by Railway, is the sole persistent data store for ContrataPro. It holds the complete application state: users, professionals, subscriptions, appointments, services, working hours, notifications, reviews, and subscription plans. The database is the only external service with a stateful relationship — all other services (Mercado Pago, Cloudinary, Resend) are external APIs that ContrataPro calls but does not own.

The choice was made at project inception (2026-01-05) and has grown to encompass 10 tables, 9 migration files, and PostgreSQL-specific features that go beyond what any generic SQL database would provide. Specifically, the GIN trigram indexing strategy (added 2026-02-10) creates a hard dependency on PostgreSQL extensions (`pg_trgm`), making this a PostgreSQL-specific deployment rather than a generic SQL one.

Railway's managed PostgreSQL service injects `DATABASE_URL` in the standard `postgresql://` scheme, which requires active rewriting to the `postgresql+asyncpg://` driver prefix — a tangible coupling between the hosting provider and the database driver.

## Why This Might Deserve an ADR

- **Impact**: All application state lives in PostgreSQL. Every feature, every module, every query is built against PostgreSQL semantics and data types.
- **Trade-offs**: The adoption of `pg_trgm` GIN indexes (migration 20260210) creates a hard PostgreSQL dependency. A migration to MySQL, SQLite, or another RDBMS would require replacing the entire text-search indexing strategy and rewriting the ILIKE-based search queries.
- **Complexity**: PostgreSQL-specific features in active use: `pg_trgm` extension, GIN index type, `postgresql_using='gin'` and `postgresql_ops` in Alembic, timezone-aware `DateTime(timezone=True)` columns, `server_default=func.now()`, and `onupdate=func.now()` server-side triggers.
- **Team Knowledge**: Developers must know Railway's `DATABASE_URL` format, asyncpg driver requirements, and the GIN index strategy to maintain or extend the search functionality.
- **Future Implications**: The `pg_trgm` dependency is invisible to anyone not looking at the migration files. Any attempt to run the application against a non-PostgreSQL database will fail silently until search is exercised.

Temporal Context: Present since project inception (2026-01-05). PostgreSQL-specific features were deepened on 2026-02-10 with the GIN index migration, signaling an intentional commitment to PostgreSQL semantics over portability.

## Evidence Found in Codebase

### Key Files
- [`backend/app/database.py`](../../../backend/app/database.py) - Lines 9-13
  - Default URL and `postgresql+asyncpg://` rewriting
- [`backend/app/config.py`](../../../backend/app/config.py) - Lines 8-17
  - `DATABASE_URL` setting with `field_validator` for asyncpg prefix conversion
- [`backend/alembic/versions/20260210_1200-add_search_indexes.py`](../../../backend/alembic/versions/20260210_1200-add_search_indexes.py) - Lines 22-44
  - `CREATE EXTENSION IF NOT EXISTS pg_trgm`, GIN index creation
- [`backend/app/models.py`](../../../backend/app/models.py) - Lines 20, 74, 127, 176-177
  - `DateTime(timezone=True)`, `server_default=func.now()`, `onupdate=func.now()`

### Code Evidence
```python
# backend/app/database.py:9-13
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo")

# Converter postgresql:// para postgresql+asyncpg:// (Railway injeta sem asyncpg)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
```

```python
# backend/alembic/versions/20260210_1200-add_search_indexes.py:22-44
def upgrade() -> None:
    # Criar extensão pg_trgm para suportar buscas ILIKE eficientes
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_index('ix_users_is_professional', 'users', ['is_professional'])
    op.create_index('ix_users_subscription_status', 'users', ['subscription_status'])

    # Índices GIN com pg_trgm para ILIKE com wildcard
    op.create_index(
        'ix_users_city_trgm',
        'users', ['city'],
        postgresql_using='gin',
        postgresql_ops={'city': 'gin_trgm_ops'}
    )
    op.create_index(
        'ix_users_category_trgm',
        'users', ['category'],
        postgresql_using='gin',
        postgresql_ops={'category': 'gin_trgm_ops'}
    )
```

```python
# backend/app/models.py:176-177 — Subscription model
created_at = Column(DateTime(timezone=True), server_default=func.now())
updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

### Impact Analysis
- Introduced: 2026-01-05 (project inception, Railway managed PostgreSQL)
- PostgreSQL-specific features added: 2026-02-10 (GIN trigram, pg_trgm extension)
- Migration count: 9 migrations over 36 days
- Affects: Every data model, every router, all search functionality, all timestamps
- Hosting coupling: Railway managed PostgreSQL — URL format requires active rewriting

### Alternatives (if observable)
- MySQL/MariaDB — not referenced; GIN/pg_trgm feature set unavailable
- SQLite — referenced in `database.py` default fallback name, not used in production
- MongoDB — not referenced (relational model with foreign keys rules this out)

## Questions to Address in ADR (if created)

- Why PostgreSQL over MySQL for a Brazilian SME marketplace?
- Was Railway's managed PostgreSQL the driver of the choice, or was PostgreSQL chosen first?
- What is the plan if Railway's PostgreSQL pricing grows prohibitively expensive?
- How are the GIN indexes maintained — do developers know to enable pg_trgm in local dev?
- What is the local development database setup for engineers (Docker Compose PostgreSQL)?

## Related Potential ADRs
- [SQLAlchemy Async ORM](./sqlalchemy-async-orm.md) — ORM built on top of PostgreSQL
- [Alembic for Schema Migrations](./alembic-schema-migrations.md) — migration tooling for PostgreSQL
- [GIN Trigram Indexing Strategy](./gin-trigram-search-indexing.md) — PostgreSQL-specific search feature

## Additional Notes
The `docker-compose.yml` likely defines a local PostgreSQL 15 service (aligned with Railway version) for development parity — worth confirming and documenting in the ADR if so.
