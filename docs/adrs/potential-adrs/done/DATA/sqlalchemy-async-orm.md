# Potential ADR: SQLAlchemy 2.0 Async ORM as Data Access Layer

**Module**: DATA
**Category**: Technology
**Priority**: Must Document (Score: 145/150)
**Date Identified**: 2026-02-17

---

## What Was Identified

SQLAlchemy 2.0 in full async mode (`create_async_engine`, `AsyncSession`) was chosen as the ORM for all database interactions in ContrataPro. Every database operation in the system — across all 13 domain routers, 2 background job services, and Alembic migrations — goes through SQLAlchemy's async API with asyncpg as the low-level PostgreSQL driver.

The pattern was established at project inception (initial migration: 2026-01-05) and has remained the foundational data access mechanism throughout 9 migration cycles and the growth from the initial schema to 10 models spanning the full business domain. The choice was deliberate: SQLAlchemy 2.0 introduced a native async API (not a bolted-on compatibility layer), enabling true non-blocking I/O in a FastAPI/asyncio application.

The Alembic env.py is configured to run migrations asynchronously via `async_engine_from_config` and `run_async_migrations()`, reinforcing that async-first is a pervasive constraint, not just an HTTP-layer concern.

## Why This Might Deserve an ADR

- **Impact**: Every module that touches the database depends on this choice. Replacing it would require rewriting all 13 routers, 2 job services, and the Alembic configuration.
- **Trade-offs**: SQLAlchemy async disables lazy loading by default — all relationship loading must be explicit (`selectinload`, `joinedload`). This is a non-obvious constraint that every developer who adds a new relationship or query must understand.
- **Complexity**: The `expire_on_commit=False` session configuration, the `asyncpg` URL prefix rewriting pattern (done in both `database.py` and `config.py`), and the async Alembic runner represent compounding decisions that stem from this root choice.
- **Team Knowledge**: Any new developer working on any backend feature must understand async SQLAlchemy patterns. The absence of lazy loading and the explicit session lifecycle are non-default behaviors compared to synchronous SQLAlchemy usage.
- **Future Implications**: Migrating away from SQLAlchemy to another ORM (e.g., Tortoise ORM, SQLModel, raw asyncpg) would require a full rewrite of the data access layer across the entire backend. The 10-model schema is deeply coupled to SQLAlchemy's `Column`, `relationship`, and `back_populates` API.

Temporal Context: Foundational decision present since 2026-01-05. Stable across 9 migration cycles over 6 weeks, with no evidence of reconsideration.

## Evidence Found in Codebase

### Key Files
- [`backend/app/database.py`](../../../backend/app/database.py) - Lines 3-21
  - `create_async_engine`, `AsyncSessionLocal` (sessionmaker with `AsyncSession`), `Base = declarative_base()`
- [`backend/app/models.py`](../../../backend/app/models.py) - Lines 1-257
  - All 10 models use SQLAlchemy Column API and `relationship()` with `back_populates`
- [`backend/alembic/env.py`](../../../backend/alembic/env.py) - Lines 93-114
  - `async_engine_from_config`, `run_async_migrations()` — migrations run fully async

### Code Evidence
```python
# backend/app/database.py:15-21
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

```python
# backend/alembic/env.py:93-108
async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()
```

```python
# backend/app/models.py — representative relationship pattern
class User(Base):
    subscription_plan = relationship("SubscriptionPlan", back_populates="users")
    services = relationship("Service", back_populates="professional")
    working_hours = relationship("WorkingHour", back_populates="professional")
    appointments_as_professional = relationship(
        "Appointment", foreign_keys="[Appointment.professional_id]",
        back_populates="professional"
    )
```

### Impact Analysis
- Introduced: 2026-01-05 (project inception)
- Migration cycles: 9 migrations over 36 days
- Affects: All 13 domain routers, 2 job services, Alembic env, `database.py`, `models.py`
- Recent themes: "add review system", "add search indexes", "add scheduled subscription fields"
- Derived constraints: No lazy loading, explicit `selectinload` required everywhere

### Alternatives (if observable)
- `asyncpg` (raw driver) — referenced as the low-level driver; not chosen as ORM
- `SQLModel` — not found in dependencies (would unify SQLAlchemy + Pydantic)
- `Tortoise ORM` — not referenced
- Synchronous SQLAlchemy — explicitly rejected (async engine was chosen from day one)

## Questions to Address in ADR (if created)

- Why was SQLAlchemy 2.0 chosen over SQLModel, which would unify ORM + Pydantic schemas?
- Was Tortoise ORM (async-native from origin) considered?
- What drove `expire_on_commit=False` — was this to support background tasks reading objects post-commit?
- How should developers handle relationships in async context? (explicit selectinload policy)
- What is the strategy for N+1 query prevention given no lazy loading?

## Related Potential ADRs
- [PostgreSQL as Primary Database](./postgresql-primary-database.md) — the ORM target
- [Alembic for Schema Migrations](./alembic-schema-migrations.md) — lifecycle companion
- [Single-File Model Consolidation](../../consider/DATA/single-file-model-consolidation.md)

## Additional Notes
The URL rewriting pattern (`postgresql://` → `postgresql+asyncpg://`) appears in both `database.py` and `config.py`, indicating this was discovered and addressed incrementally as Railway's injection format was encountered. This duplication suggests the `database.py` approach was the original fix and `config.py` was a later normalization.
