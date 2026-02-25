# Potential ADR: GIN Trigram Indexes for Full-Text Professional Search

**Module**: DATA
**Category**: Performance / Architecture
**Priority**: Must Document (Score: 110/150)
**Date Identified**: 2026-02-17

---

## Existing ADR Context

WARNING: SIMILAR DECISION EXISTS

This decision appears similar to an already-identified potential ADR from the SEARCH module analysis:

- **SEARCH module ADR**: PostgreSQL GIN Trigram Indexes for City-Level Professional Search (Score: 130)
  - File: [postgresql-gin-trigram-indexes-for-city-level-professional-search.md](../../must-document/SEARCH/postgresql-gin-trigram-indexes-for-city-level-professional-search.md)
  - Common keywords: postgresql, GIN, trigram, pg_trgm, ILIKE, search, indexes, city, category, users table

**Keyword overlap**: approximately 85% — high similarity (above 70% threshold).

**Recommended Action**: DO NOT CREATE a separate DATA-module ADR for this decision. The SEARCH module ADR is the correct owner since it covers this decision from the right perspective: the query pattern that motivated the index, the alternatives considered (FTS, external engines), and the impact on search performance. The DATA module's contribution to this decision (the migration and the indexed columns in `models.py`) should be referenced from the SEARCH ADR as evidence.

If the formal ADR is created, it should be filed under the SEARCH module with the evidence from both the migration files (DATA's evidence) and the query patterns (SEARCH's evidence).

---

## What Was Identified

A deliberate PostgreSQL-specific indexing strategy was introduced on 2026-02-10 to accelerate the professional search feature: GIN (Generalized Inverted Index) indexes using the `pg_trgm` extension on the `users.city` and `users.category` text columns, combined with btree indexes on `is_professional` and `subscription_status`.

The migration comment explicitly states the intent: "Índices GIN com pg_trgm para ILIKE com wildcard — Isso permite buscas case-insensitive e partial match de forma eficiente". The migration is #9 in the chain (2026-02-10), introduced as "Fix 2" in a targeted performance optimization sprint.

From the DATA module perspective, this decision adds a hard dependency on the `pg_trgm` PostgreSQL extension in all migration environments, and requires that developers adding new searchable text columns also add corresponding GIN indexes.

## Why This Might Deserve an ADR

See the SEARCH module ADR referenced above for the full rationale. The DATA module perspective adds:

- **Migration management**: The `pg_trgm` extension is enabled via Alembic (`CREATE EXTENSION IF NOT EXISTS pg_trgm`). Every fresh environment must run migrations before search works.
- **Column design constraint**: Future text columns intended for search must follow the same GIN trgm indexing pattern. This is a hidden convention in the DATA module.
- **Portability impact**: This migration makes the schema PostgreSQL-only — not a MySQL or SQLite-compatible schema.

## Evidence Found in Codebase

### Key Files
- [`backend/alembic/versions/20260210_1200-add_search_indexes.py`](../../../backend/alembic/versions/20260210_1200-add_search_indexes.py) - Lines 21-44
  - `pg_trgm` extension, GIN index definitions — the DATA module's direct evidence
- [`backend/app/models.py`](../../../backend/app/models.py) - Lines 55-56
  - `city` and `category` columns on `User` — the indexed columns

### Code Evidence
```python
# backend/alembic/versions/20260210_1200-add_search_indexes.py
def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.create_index('ix_users_city_trgm', 'users', ['city'],
        postgresql_using='gin', postgresql_ops={'city': 'gin_trgm_ops'})
    op.create_index('ix_users_category_trgm', 'users', ['category'],
        postgresql_using='gin', postgresql_ops={'category': 'gin_trgm_ops'})
```

### Impact Analysis
- Introduced: 2026-02-10 (migration #9)
- Primary ADR owner: SEARCH module
- DATA module contribution: schema design, migration, extension management

## Related Potential ADRs
- [SEARCH: PostgreSQL GIN Trigram Indexes for City-Level Professional Search](../../must-document/SEARCH/postgresql-gin-trigram-indexes-for-city-level-professional-search.md) — primary ADR, supersedes this file
- [PostgreSQL as Primary Database](./postgresql-primary-database.md) — prerequisite

## Additional Notes
This file is retained for traceability of the cross-module analysis. The formal ADR should be created under the SEARCH module, with migration evidence from the DATA module incorporated.
