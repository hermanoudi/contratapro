# ADR-001: PostgreSQL GIN Trigram Indexes for Professional Search

**Status:** Accepted
**Date:** 2026-02-10
**Depends on:** [ADR-001: PostgreSQL 15 as Primary Relational Database](../../DATA/needs-input/ADR-001-postgresql-as-primary-database.md)
**Related to:**
- [ADR-002: Denormalized Rating Aggregates on User for Search Performance](../../DATA/ADR-002-denormalized-rating-aggregates-on-user.md)
- [ADR-001: ViaCEP Backend Proxy for Address Resolution](./ADR-001-viacep-backend-proxy-for-address-resolution.md)

---

## Context and Problem Statement

The professional search feature requires partial string matching against two text columns
on the users table — city and category — to connect clients with available professionals.
Prior to February 2026, every search request performed an unindexed sequential scan of
the entire users table, an O(n) operation that degrades proportionally with user base growth.

The performance optimization sprint introduced in February 2026 resolved this by activating
the `pg_trgm` PostgreSQL extension and creating GIN (Generalized Inverted Index) trigram
indexes on the city and category columns. Two complementary B-tree indexes were added on
boolean pre-filter columns (professional flag and subscription status) to narrow result sets
before the trigram scan. All four indexes were introduced via a single Alembic migration.

This choice anchored the search architecture to PostgreSQL's extension ecosystem. The core
decision was selecting GIN trigram indexing over PostgreSQL native full-text search or
an external search engine, with direct trade-offs in relevance quality, infrastructure
complexity, and future extensibility for a Portuguese-language marketplace.

## Decision Drivers

- Search queries use `ILIKE` wildcard patterns that are incompatible with standard B-tree
  indexes, requiring a specialized index type for acceptable query performance
- The `pg_trgm` approach requires zero changes to existing query logic — the same `ILIKE`
  patterns become index-covered without rewriting the query layer
- PostgreSQL full-text search would require pt-BR language configuration, the `unaccent`
  extension, and a different query interface, introducing linguistic complexity with uncertain
  relevance benefit at current scale
- External search engines (Elasticsearch, Meilisearch, Typesense) add operational overhead,
  synchronization latency, and infrastructure cost that the team deemed disproportionate
  to the problem scale
- The platform is already committed to PostgreSQL (DATA/ADR-001), making PostgreSQL-specific
  extensions a natural fit without adding new infrastructure dependencies

## Considered Options

1. **GIN trigram indexes via pg_trgm** — PostgreSQL extension that makes ILIKE wildcard
   queries index-covered without changing query syntax, at the cost of higher write overhead
   and a hard PostgreSQL dependency
2. **PostgreSQL full-text search (tsvector/tsquery)** — native ranked search with stemming,
   stop-word handling, and Portuguese language support, requiring schema changes and a new
   query interface
3. **External search engine (Meilisearch / Typesense)** — purpose-built search infrastructure
   with relevance ranking, facets, and geographic filtering, requiring data synchronization
   and separate hosting

## Decision Outcome

Chosen option: GIN trigram indexes via pg_trgm, because it eliminates the sequential scan
performance problem with the minimum viable change to the codebase — no query rewrites,
no new infrastructure, no schema type changes. The platform's city-level matching model
(exact city string from CEP resolution) does not require linguistic relevance ranking, making
the lower complexity of trigram matching appropriate for the current feature scope.

[NEEDS INPUT: Confirm whether Portuguese-language relevance ranking (stemming, accent
normalization via unaccent) was explicitly evaluated and rejected, or whether full-text
search was ruled out primarily on implementation complexity grounds.]

## Pros and Cons of the Options

### GIN trigram indexes via pg_trgm

- Good: Existing `ILIKE` queries become index-covered with no query-layer changes
- Good: Supports case-insensitive partial string matching on any substring position
- Good: No additional infrastructure or synchronization layer required
- Bad: GIN indexes have higher write amplification than B-tree, increasing insert and update
  cost on the users table at scale
- Bad: No linguistic relevance — results are ranked by query position matching, not semantic
  relevance to Portuguese search terms

### PostgreSQL full-text search (tsvector/tsquery)

- Good: Native Portuguese stemming and stop-word handling with the `unaccent` extension
- Good: Supports ranked relevance results, enabling result quality improvements without
  adding external infrastructure
- Bad: Requires schema changes (tsvector columns or generated columns) and a different
  query interface, breaking existing ILIKE-based query patterns
- Bad: Requires explicit pt-BR language configuration and testing to validate accent and
  stemming behavior for Brazilian city and category names

### External search engine (Meilisearch / Typesense)

- Good: Purpose-built for relevant search with faceted filtering, typo tolerance, and
  geographic proximity queries out of the box
- Good: Decouples search performance from the primary database write path
- Bad: Requires data synchronization pipeline between PostgreSQL and the search index,
  introducing consistency lag and operational complexity
- Bad: Adds infrastructure cost and hosting dependency disproportionate to a marketplace
  at early growth stage

## Consequences

Every search query for end users is now index-covered for city and category filters.
The `pg_trgm` extension creates a hard architectural dependency: new text columns intended
for search-style filtering must receive GIN trgm indexes via Alembic migration, or they
silently degrade to sequential scans. Team members adding search dimensions (neighborhood,
service title) must be aware of this requirement.

The service title search path in the by-service endpoint uses an `ILIKE` subquery against
the services table that is not covered by a GIN trigram index. As service catalog volume
grows, this subquery will become a secondary performance bottleneck independent of the
user-table indexes introduced here.

[NEEDS INPUT: Define the user or service volume threshold at which the current GIN trigram
approach should be re-evaluated — either by adding GIN coverage to the services table or
by migrating to a dedicated search engine with geographic proximity support.]

## References

- `backend/alembic/versions/20260210_1200-add_search_indexes.py:1-52`
- `backend/app/routers/users.py:192-276`
- `backend/app/models.py:52-56`
