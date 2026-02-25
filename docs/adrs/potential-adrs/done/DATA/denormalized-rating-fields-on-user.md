# Potential ADR: Denormalized Rating Aggregates on User for Search Performance

**Module**: DATA
**Category**: Performance / Architecture
**Priority**: Consider (Score: 75/150)
**Date Identified**: 2026-02-17

---

## What Was Identified

`User.average_rating` (Float) and `User.total_reviews` (Integer) are maintained as denormalized columns directly on the `users` table rather than computed on-demand from the `reviews` table. These fields are updated synchronously every time a new review is submitted, keeping search queries free from aggregate subqueries or joins to the `reviews` table.

This pattern was introduced on 2026-02-09 alongside the full review system (migration `a1b2c3d4e5f6`). The migration comment explicitly states the intent: "Campos denormalizados no User para performance" (Denormalized fields on User for performance). The `ProfessionalSearchResult` schema exposes both fields directly from the `users` table, and search queries can filter and sort by these values without touching the `reviews` table at all.

The trade-off is a data integrity guarantee: every code path that creates a `Review` must also atomically update `User.average_rating` and `User.total_reviews`. If a review is created without this update (e.g., via a direct DB insert in a migration or a bug in the review router), the denormalized fields become stale. The running average formula must also be correct: `((avg * count) + new_rating) / (count + 1)`.

## Why This Might Deserve an ADR

- **Impact**: Affects data consistency guarantees across REVIEW (write path) and SEARCH (read path). Any developer adding review-related features must maintain both the normalized `reviews` table and the denormalized `users` columns.
- **Trade-offs**: Read performance (no JOIN/aggregate in search) vs. write complexity (two writes per review, computed average update). Chosen in favor of read performance, which is appropriate for a marketplace where search is exercised far more frequently than review submission.
- **Complexity**: The running average formula is non-trivial. An incorrect formula would silently corrupt all average ratings over time without obvious failure.
- **Team Knowledge**: New developers unfamiliar with this pattern might attempt to query `SELECT AVG(rating) FROM reviews WHERE professional_id = X` instead of reading `User.average_rating`, creating inconsistency in the codebase.
- **Future Implications**: If the `reviews` table grows large, recomputing all averages in a correction migration would be necessary if any bug corrupts the denormalized values. A data reconciliation job may eventually be needed.

Temporal Context: Introduced 2026-02-09. Present for approximately 8 days as of analysis date. The pattern is new but immediately embedded in the search schema (`ProfessionalSearchResult`).

## Evidence Found in Codebase

### Key Files
- [`backend/app/models.py`](../../../backend/app/models.py) - Lines 59-61
  - Denormalized fields on `User` model
- [`backend/alembic/versions/20260209_1000-add_review_system.py`](../../../backend/alembic/versions/20260209_1000-add_review_system.py) - Lines 70-81
  - Migration comment explicitly labels these as denormalized for performance
- [`backend/app/schemas.py`](../../../backend/app/schemas.py) - Lines 105-106, 124-125
  - Both `ProfessionalPublic` and `ProfessionalSearchResult` expose the denormalized fields

### Code Evidence
```python
# backend/app/models.py:59-61
# Avaliacao (denormalizados para performance em buscas)
average_rating = Column(Float, nullable=True)
total_reviews = Column(Integer, default=0)
```

```python
# backend/alembic/versions/20260209_1000-add_review_system.py:70-81
# Campos denormalizados no User para performance
op.add_column(
    'users',
    sa.Column('average_rating', sa.Float(), nullable=True),
)
op.add_column(
    'users',
    sa.Column(
        'total_reviews', sa.Integer(),
        server_default='0', nullable=True,
    ),
)
```

```python
# backend/app/schemas.py:111-126 — ProfessionalSearchResult
class ProfessionalSearchResult(BaseModel):
    """Schema para resultados de busca — sem working_hours (não usado nos cards)"""
    ...
    average_rating: Optional[float] = None
    total_reviews: int = 0
```

### Impact Analysis
- Introduced: 2026-02-09 (migration `a1b2c3d4e5f6`)
- Affects: `users` table (write + read), `reviews` router (update logic), search endpoint (read)
- Write invariant: Every `POST /reviews/{token}` must update both denormalized fields
- Risk: Silent data drift if update logic is bypassed or contains a bug
- Read benefit: No JOIN required on search queries — `average_rating` and `total_reviews` available directly on the User row

### Alternatives (if observable)
- Computed aggregate on query time: `SELECT AVG(rating) FROM reviews GROUP BY professional_id` — avoided due to search query performance cost
- PostgreSQL materialized view — not used; adds infrastructure complexity
- Database trigger to maintain denormalized fields — not implemented; update is in application code

## Questions to Address in ADR (if created)

- Where exactly in the review router is the denormalized update performed, and is it atomic with the review insert?
- What happens if the update fails after the review is created (partial failure scenario)?
- Is there a data reconciliation mechanism if the denormalized values drift?
- Should future aggregate statistics follow the same denormalization pattern?
- At what review volume would a database trigger be preferable to application-layer updates?

## Related Potential ADRs
- [GIN Trigram Indexing Strategy](../../must-document/DATA/gin-trigram-search-indexing.md) — companion search performance decision
- [PostgreSQL as Primary Database](../../must-document/DATA/postgresql-primary-database.md) — context for the storage choice

## Additional Notes
The `average_rating` column is nullable while `total_reviews` defaults to 0 on the `users` table. This distinction means a professional with zero reviews has `average_rating = NULL` (not 0.0), which is correctly handled in the `ProfessionalSearchResult` schema as `Optional[float]`. This is a subtle correctness consideration worth capturing in the ADR.
