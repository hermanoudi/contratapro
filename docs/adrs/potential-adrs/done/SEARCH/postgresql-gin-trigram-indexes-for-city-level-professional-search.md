# Potential ADR: PostgreSQL GIN Trigram Indexes for City-Level Professional Search

**Module**: SEARCH
**Category**: Architecture / Performance / Technology
**Priority**: Must Document (Score: 130)
**Date Identified**: 2026-02-17

---

## What Was Identified

The professional search feature relies on `ILIKE` wildcard queries (e.g., `User.city.ilike(f"%{city}%")`) against two text columns on the `users` table: `city` and `category`. To make these queries performant as the user base grows, the project added the `pg_trgm` PostgreSQL extension and two GIN (Generalized Inverted Index) indexes using trigram operators, introduced via migration `20260210_1200-add_search_indexes.py`.

The migration also added two B-tree indexes on boolean/enum-like columns (`is_professional`, `subscription_status`) used as pre-filter conditions in all search queries. Together, these four indexes form the complete indexing strategy for the professional search feature.

This approach was introduced as a targeted performance optimization (referenced in project memory as "Fix 2") explicitly replacing what was previously an unindexed `ILIKE` full-table-scan approach. The choice of trigram GIN over PostgreSQL's built-in full-text search (`tsvector`/`tsquery`) or an external search engine (Elasticsearch, Typesense, Meilisearch) is the core architectural decision documented here.

## Why This Might Deserve an ADR

- **Impact**: The `pg_trgm` extension is a PostgreSQL-specific feature. Its use creates a hard dependency on PostgreSQL as the database engine for professional search. The performance of every search query for every end-user depends on these indexes being present and correctly configured. Without them, each search is an O(n) sequential scan of the entire users table.
- **Trade-offs**: GIN trigram indexes support the existing `ILIKE '%term%'` pattern with minimal query-layer changes, but they have trade-offs: higher write overhead compared to B-tree, larger index size, and less linguistic relevance than full-text search. PostgreSQL FTS (`to_tsvector`) would provide ranked relevance, stemming, and stop-word handling for Portuguese, but requires a different query interface and column type changes.
- **Complexity**: Requires the `pg_trgm` extension to be available in the database environment. On Railway's managed PostgreSQL, the extension is available and the migration handles activation with `CREATE EXTENSION IF NOT EXISTS pg_trgm`. On fresh environments (local Docker, test DBs, CI), the migration must run before search functionality works correctly.
- **Team Knowledge**: Any developer who adds a new text column intended for search-style filtering (e.g., `neighborhood`, `service_title`) must know to add a corresponding GIN trgm index via Alembic migration. Without this knowledge, new search filters silently degrade to full-table-scan behavior, breaking performance at scale.
- **Future Implications**: The current search is city-exact and category-approximate (string match). As the marketplace grows geographically, pressure to add radius-based search (PostGIS), ranked relevance (FTS or external engine), or faceted filters may arrive. The pg_trgm approach does not support distance queries. Documenting this decision clarifies the current scope and what would trigger a migration to a more capable search solution.

## Evidence Found in Codebase

### Key Files
- [`backend/alembic/versions/20260210_1200-add_search_indexes.py`](../../../../../backend/alembic/versions/20260210_1200-add_search_indexes.py) — Lines 1-52
  - Migration that activates `pg_trgm` extension and creates all four search indexes
- [`backend/app/routers/users.py`](../../../../../backend/app/routers/users.py) — Lines 192-276
  - Both search endpoints (`/search` and `/search-by-service`) using `ILIKE` with wildcard patterns
- [`backend/app/models.py`](../../../../../backend/app/models.py) — Lines 52-56
  - `city` (String) and `category` (String) columns on `User` model — the indexed fields

### Code Evidence

```python
# backend/alembic/versions/20260210_1200-add_search_indexes.py:22-44
def upgrade() -> None:
    # Criar extensão pg_trgm para suportar buscas ILIKE eficientes
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Índices simples para filtros booleanos/igualdade
    op.create_index('ix_users_is_professional', 'users', ['is_professional'])
    op.create_index('ix_users_subscription_status', 'users', ['subscription_status'])

    # Índices GIN com pg_trgm para ILIKE com wildcard
    # Isso permite buscas case-insensitive e partial match de forma eficiente
    op.create_index(
        'ix_users_city_trgm',
        'users',
        ['city'],
        postgresql_using='gin',
        postgresql_ops={'city': 'gin_trgm_ops'}
    )
    op.create_index(
        'ix_users_category_trgm',
        'users',
        ['category'],
        postgresql_using='gin',
        postgresql_ops={'category': 'gin_trgm_ops'}
    )
```

```python
# backend/app/routers/users.py:212-215 (search endpoint)
if category:
    query = query.filter(User.category.ilike(f"%{category}%"))
if city:
    query = query.filter(User.city.ilike(f"%{city}%"))
```

```python
# backend/app/routers/users.py:256-264 (search-by-service endpoint)
query = query.filter(
    or_(
        User.category.ilike(f"%{service}%"),  # Busca na categoria do profissional
        User.id.in_(service_subquery)          # OU nos títulos dos serviços
    )
)
if city:
    query = query.filter(User.city.ilike(f"%{city}%"))
```

### Impact Analysis
- Introduced: 2026-02-10 (migration `b2c3d4e5f6a7`, revision after `a1b2c3d4e5f6`)
- Context: Explicitly documented as "Fix 2" — performance optimization sprint for professional search
- Affects: All `GET /users/search` and `GET /users/search-by-service` queries
- PostgreSQL dependency: `pg_trgm` is a PostgreSQL-only extension; not portable to MySQL, SQLite, or other engines
- Index type: GIN (write-heavy but read-optimized for partial string matching)

### Alternatives (if observable)
- **Before this migration**: `ILIKE` without indexes — full sequential table scan on `users`
- **PostgreSQL Full-Text Search** (`to_tsvector`/`to_tsquery`): Not chosen — would require different column types, pt-BR language configuration (`unaccent` extension), and ranked relevance query interface
- **External search engine** (Elasticsearch, Meilisearch, Typesense): Not chosen — avoids operational complexity, no infrastructure cost for current scale
- **Application-level filtering**: Not chosen — cannot scale beyond hundreds of users

## Questions to Address in ADR (if created)

- Why was `ILIKE` with GIN trigram chosen over PostgreSQL full-text search (`tsvector`) for a Portuguese-language marketplace?
- At what user scale should a dedicated search engine be considered?
- Should the `Service.title` column also receive a GIN trgm index? (Currently `search-by-service` uses an unindexed `ilike` on `Service.title`)
- What is the plan if the marketplace expands to require proximity-based search (radius from CEP) rather than city-exact matching?
- Should `neighborhood` be added as a search dimension with a GIN trgm index?

## Related Potential ADRs
- [ViaCEP Backend Proxy for Brazilian Address Resolution](./viacep-backend-proxy-for-brazilian-address-resolution.md) — The city string fed into the GIN-indexed query is resolved from CEP via the backend proxy
- Denormalized `average_rating` and `total_reviews` on User model (DATA module) — another search-performance trade-off on the same `users` table

## Additional Notes
The `search-by-service` endpoint includes a subquery against `Service.title` using `ilike(f"%{service}%")`, which is NOT covered by a GIN trigram index. As service volumes grow, this subquery will become a performance bottleneck. A future ADR may need to address whether to add a GIN trgm index on `services.title` or restructure the search to avoid the subquery.

The `priority_in_search` column on `SubscriptionPlan` (an integer: 0=normal, 1=high) is used in an `ORDER BY` clause to surface premium-tier professionals first. This implicit monetization mechanic in the search ranking layer is not documented anywhere and could warrant its own ADR if it becomes more sophisticated.
