# ADR-002: Denormalized Rating Aggregates on User for Search Performance

**Status:** Accepted
**Date:** 2026-02-09
**Depends on:** [ADR-001: SQLAlchemy 2.0 Async ORM as Data Access Layer](./ADR-001-sqlalchemy-async-orm-as-data-access-layer.md)
**Related to:**
- [ADR-001: PostgreSQL 15 as Primary Relational Database](./needs-input/ADR-001-postgresql-as-primary-database.md)
- [ADR-001: PostgreSQL GIN Trigram Indexes for Professional Search](../SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md)

---

## Context and Problem Statement

ContrataPro's professional search feature requires sorting and filtering professionals by their
review quality. Computing average ratings on demand — by joining the `users` table to the
`reviews` table and aggregating per professional — would introduce a GROUP BY aggregate subquery
into every search request, regardless of whether review data is the primary filter criterion.

On 2026-02-09, alongside the full review system introduction, `average_rating` (Float, nullable)
and `total_reviews` (Integer, default 0) were added as denormalized columns directly on the
`users` table (migration `a1b2c3d4e5f6`). The migration comment explicitly documents the intent:
"Campos denormalizados no User para performance." These columns are updated synchronously on each
review submission, keeping the aggregate values current without requiring the search query to touch
the `reviews` table.

The nullable distinction is architecturally intentional: `average_rating` is NULL for
professionals with no reviews, while `total_reviews` defaults to 0. This correctly avoids
representing an absent rating as a 0.0 average, which would misrepresent the professional's
review standing in search results.

## Decision Drivers

- Search is the dominant read path in a marketplace; aggregate subqueries at search time would
  degrade proportionally with review volume, not just user volume
- The `ProfessionalSearchResult` schema must expose rating data directly from the `users` row
  to avoid a secondary query or join per result page
- The GIN trigram index strategy (SEARCH/ADR-001) optimizes city and category filtering; rating
  sort must not introduce a new unindexed join that undermines those gains
- Review submission frequency is far lower than search request frequency, making write-side
  complexity an acceptable trade-off for read-side simplicity
- The running average formula applied at write time is deterministic and auditable; a per-query
  aggregate over a growing `reviews` table is not bounded in execution cost

## Considered Options

1. **Denormalized columns on `users`** — maintain `average_rating` and `total_reviews` directly
   on the user row, updated synchronously at review submission time via a running average formula
2. **On-demand aggregate query** — compute `AVG(rating)` and `COUNT(*)` from the `reviews` table
   at search time using a GROUP BY subquery or lateral join per result set
3. **PostgreSQL materialized view** — precompute the aggregate outside the application layer and
   refresh on a schedule, decoupling the write path from the read path

## Decision Outcome

Chosen option: Denormalized columns on `users`, because it keeps the search query entirely within
the `users` table — consistent with the existing GIN trigram index strategy — and bounds the
per-review write cost to a single additional column update within the same transaction context.

[NEEDS INPUT: Confirm whether the `average_rating` and `total_reviews` update in the review
router is executed atomically within the same database transaction as the `Review` insert, or
whether it is a separate subsequent write that could leave the columns stale on partial failure.]

## Pros and Cons of the Options

### Denormalized columns on `users`

- Good: Search queries read `average_rating` and `total_reviews` directly from the user row
  with no join, preserving the single-table access pattern established by the GIN index strategy
- Good: The NULL vs. 0 distinction for `average_rating` correctly models the semantic difference
  between "no reviews yet" and "reviewed with a low score"
- Bad: Every code path that creates a `Review` must also update both denormalized columns;
  a direct database insert bypassing the application layer will silently corrupt the aggregates
- Bad: The running average formula is non-trivial and will silently produce incorrect results
  if implemented with an arithmetic error — there is no automatic database-level enforcement

### On-demand aggregate query

- Good: No write-side maintenance burden; the `reviews` table is always the authoritative source
- Good: Trivially correct — no formula to maintain, no risk of denormalized drift
- Bad: GROUP BY aggregate on every search request becomes a full `reviews` table scan as review
  volume grows, with cost unbounded by the existing user-table indexes
- Bad: Incompatible with sorting professionals by rating in a single-pass query over the
  GIN-indexed `users` table

### PostgreSQL materialized view

- Good: Separates aggregate freshness from the write path, avoiding synchronous coupling
- Good: Refresh can be triggered on demand or on a schedule without application code changes
- Bad: Adds infrastructure complexity — refresh lifecycle, staleness window, and cache
  invalidation strategy must all be managed separately from the core review flow
- Bad: Rating freshness depends on refresh frequency; a professional's displayed average may
  lag their actual reviews for the duration of the refresh interval

## Consequences

The denormalization pattern creates a standing write invariant: every review creation must update
both `average_rating` and `total_reviews` on the professional's user row. This invariant is not
enforced by the database schema — it is a code contract. Any future feature that creates reviews
programmatically (e.g., bulk import, migration script, admin tools) must explicitly maintain
this invariant or trigger a full recomputation migration over the `users` table.

[NEEDS INPUT: Confirm whether a periodic data reconciliation job exists or is planned to detect
drift between the denormalized `users.average_rating` and the actual `AVG(reviews.rating)` per
professional — particularly relevant if the review creation path is ever extended with bulk
operations or administrative overrides.]

If the denormalized values ever become stale at scale, correcting them requires a full-table
recomputation migration over the `users` table joined to `reviews`. The cost of such a migration
grows with both user count and review volume. The pattern is appropriate at current scale but
should be revisited if review submission volume significantly increases relative to the team's
ability to maintain the write-side invariant across all code paths.

## References

- `backend/app/models.py:59-61`
- `backend/alembic/versions/20260209_1000-add_review_system.py:70-81`
- `backend/app/schemas.py:105-106`
- `backend/app/routers/reviews.py:1`
