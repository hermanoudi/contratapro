# ADR Relationship Analysis Report

**Generated:** 2026-02-17
**Tool:** ADR Relationship Linker

---

## Summary

| Metric | Value |
|--------|-------|
| ADRs scanned | 15 |
| Modules | 9 (AUTH, CORE, DATA, FE-APP, IMG, JOB, NOTIF, SEARCH, SUB) |
| ADRs updated | 13 |
| Total links written | 34 (bidirectional pairs) |
| Broken links detected | 0 |
| Broken links dropped | 1 (DATA/ADR-003 reference in D3 — file does not exist) |
| ADRs without relationships | 2 (IMG/Cloudinary, SUB/Mercado Pago) |

---

## Relationship Breakdown

| Type | Pairs | Link updates |
|------|-------|-------------|
| Supersedes / Superseded by | 0 | 0 |
| Depends on / Used by | 4 | 8 |
| Related to (bidirectional) | 9 | 18 |
| Amends / Amended by | 0 | 0 |
| **Total** | **13** | **34** |

---

## Detected Relationships

### Depends on / Used by

| Dependent ADR | Relationship | Required ADR | Confidence | Basis |
|---|---|---|---|---|
| `AUTH/needs-input/ADR-001-jwt-storage-in-browser-localstorage.md` | Depends on | `AUTH/needs-input/ADR-001-stateless-jwt-authentication-hs256.md` | 0.90 | Manual reference converted; localStorage decision builds on JWT token design and lifetime |
| `DATA/ADR-001-sqlalchemy-async-orm-as-data-access-layer.md` | Depends on | `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | 0.90 | Manual reference converted; async-first FastAPI constraint propagated to ORM layer |
| `DATA/ADR-001-sqlalchemy-async-orm-as-data-access-layer.md` | Depends on | `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` | 0.80 | asyncpg driver in SQLAlchemy 2.0 async is PostgreSQL-only |
| `DATA/ADR-002-denormalized-rating-aggregates-on-user.md` | Depends on | `DATA/ADR-001-sqlalchemy-async-orm-as-data-access-layer.md` | 0.80 | Manual reference converted; denormalized columns are ORM-managed via SQLAlchemy |
| `SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md` | Depends on | `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` | 0.90 | Manual reference converted; `pg_trgm` GIN extension is PostgreSQL-specific; explicit text in ADR |

### Related to (bidirectional)

| ADR A | ADR B | Confidence | Basis |
|---|---|---|---|
| `AUTH/ADR-001-bcrypt-password-hashing.md` | `AUTH/needs-input/ADR-001-stateless-jwt-authentication-hs256.md` | 0.65 | Complementary auth concerns in the same module; both govern credential security |
| `AUTH/needs-input/ADR-001-jwt-storage-in-browser-localstorage.md` | `FE-APP/needs-input/ADR-001-react-vite-spa-framework.md` | 0.85 | Manual reference converted; F1 explicitly notes JWT storage is constrained by SPA no-service-layer rule |
| `AUTH/needs-input/ADR-001-stateless-jwt-authentication-hs256.md` | `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | 0.80 | Manual reference converted; JWT integrates with FastAPI DI for auth guards |
| `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | `JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md` | 0.90 | Manual reference converted; FastAPI lifespan hosts APScheduler; FastAPI Consequences section references JOB/ADR-001 |
| `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | `FE-APP/needs-input/ADR-001-react-vite-spa-framework.md` | 0.75 | Manual reference converted; backend/frontend counterpart framework decisions |
| `CORE/needs-input/ADR-001-apscheduler-as-in-process-job-scheduler.md` | `JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md` | 0.95 | Same decision (APScheduler in-process vs Celery) documented from two module angles; identical date, same implementation references |
| `DATA/ADR-002-denormalized-rating-aggregates-on-user.md` | `SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md` | 0.85 | Manual reference converted; search optimization duo — denormalized columns + GIN indexes both target professional search performance |
| `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` | `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | 0.75 | Manual reference converted; FastAPI async-first directly drove asyncpg/PostgreSQL selection |
| `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` | `DATA/ADR-002-denormalized-rating-aggregates-on-user.md` | 0.80 | Manual reference converted; denormalized columns live on PostgreSQL-hosted `users` table |
| `JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md` | `NOTIF/needs-input/ADR-001-resend-as-production-transactional-email-provider.md` | 0.85 | Manual reference converted; background job services (subscription and review schedulers) call the notification system |
| `SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md` | `SEARCH/needs-input/ADR-001-viacep-backend-proxy-for-address-resolution.md` | 0.75 | Same optimization sprint (2026-02-10); ViaCEP resolves CEP to city string, which is then matched via GIN trigram index |

---

## Key Architectural Dependency Chains

```
CORE/FastAPI (C1)
├── Used by: DATA/SQLAlchemy (D1)
│   └── Depends on: DATA/PostgreSQL (D3)
│       └── Used by: SEARCH/GIN-Trigram (S1)
│           └── Related to: SEARCH/ViaCEP (S2) [search pipeline]
│           └── Related to: DATA/Denormalized-Ratings (D2) [search optimization duo]
├── Related to: AUTH/Stateless-JWT (A3)
│   └── Used by: AUTH/JWT-localStorage (A2)
│       └── Related to: FE-APP/React-Vite (F1)
│           └── Related to: CORE/FastAPI (C1) [backend counterpart]
└── Related to: JOB/APScheduler (J1)
    ├── Related to: CORE/APScheduler (C2) [same decision, two modules]
    └── Related to: NOTIF/Resend (N1) [schedulers call email]
```

---

## ADRs Without Automated Relationships

| ADR | Reason |
|-----|--------|
| `IMG/needs-input/ADR-001-cloudinary-as-production-image-storage.md` | No qualifying relationships above confidence threshold (0.60). Cloudinary is an independent infrastructure choice; Railway ephemeral filesystem is the driver but FastAPI as foundational ADR has confidence ~0.55 for dependency. |
| `SUB/needs-input/ADR-001-mercado-pago-as-subscription-payment-gateway.md` | Related to JOB (subscription_jobs.py) at confidence 0.70, but JOB's 3-link "Related to" limit was already reached by higher-confidence links. Bidirectionality rule prevents adding a one-sided link. |

---

## Dropped / Skipped Relationships

| Candidate | Reason |
|-----------|--------|
| `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` → DATA/ADR-003 (manual) | Target file does not exist. Reference dropped. |
| `SUB/ADR-001-mercado-pago` ↔ `JOB/ADR-001-apscheduler` | Confidence 0.70 qualifies, but JOB reached the 3-link "Related to" cap (C1, C2, N1 take priority). Omitted per max-link rule. |
| All ADRs → `CORE/ADR-001-fastapi` as "Depends on" (foundational exclusion) | FastAPI is a foundational framework ADR used by everything. Excluded from automated "Depends on" links for ADRs that don't explicitly reference it in their Decision Outcome as a strategic dependency. |

---

## Validation Report

```
=== Link Validation ===
Checked:  34 links across 13 ADR files
Valid:    34 (100%)
Broken:    0
Orphaned:  0
Status consistency: all ADRs with "Superseded by" have Status = Superseded (N/A — no supersession detected)
```

---

## Modified Files

| File | Changes |
|------|---------|
| `AUTH/ADR-001-bcrypt-password-hashing.md` | Added: Related to A3 |
| `AUTH/needs-input/ADR-001-jwt-storage-in-browser-localstorage.md` | Replaced manual "Related ADRs" with clickable Depends on (A3) + Related to (F1) |
| `AUTH/needs-input/ADR-001-stateless-jwt-authentication-hs256.md` | Replaced manual "Related ADRs" with Related to (C1, A1) + Used by (A2) |
| `CORE/ADR-001-fastapi-as-primary-backend-framework.md` | Replaced manual "Related ADRs" with Related to (J1, A3, F1) + Used by (D1, D3) |
| `CORE/needs-input/ADR-001-apscheduler-as-in-process-job-scheduler.md` | Replaced manual "Related ADRs" with Related to (J1, C1) |
| `DATA/ADR-001-sqlalchemy-async-orm-as-data-access-layer.md` | Replaced manual "Related ADRs" with Depends on (C1, D3) + Used by (D2) |
| `DATA/ADR-002-denormalized-rating-aggregates-on-user.md` | Replaced manual "Related ADRs" with Depends on (D1) + Related to (D3, S1) |
| `DATA/needs-input/ADR-001-postgresql-as-primary-database.md` | Replaced manual "Related ADRs" (dropping broken DATA/ADR-003) with Related to (C1, D2) + Used by (D1, S1) |
| `FE-APP/needs-input/ADR-001-react-vite-spa-framework.md` | Replaced manual "Related ADRs" with Related to (A2, C1) |
| `JOB/needs-input/ADR-001-apscheduler-in-process-over-celery.md` | Added: Related to (C1, C2, N1) |
| `NOTIF/needs-input/ADR-001-resend-as-production-transactional-email-provider.md` | Replaced manual "Related ADRs" with Related to (J1) |
| `SEARCH/needs-input/ADR-001-postgresql-gin-trigram-indexes-for-professional-search.md` | Replaced manual "Related ADRs" with Depends on (D3) + Related to (D2, S2) |
| `SEARCH/needs-input/ADR-001-viacep-backend-proxy-for-address-resolution.md` | Added: Related to (S1) |
