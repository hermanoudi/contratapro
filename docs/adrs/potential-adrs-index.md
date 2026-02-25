# Potential ADRs Index

## Analysis Progress

### Analyzed Modules
- **IMG**: Image Storage — 2026-02-17 — 1 high priority ADR, 0 medium priority ADRs
- **FE-APP**: Frontend Application — 2026-02-17 — 1 high priority ADR, 0 medium priority ADRs
- **JOB**: Background Jobs — 2026-02-17 — 1 high priority ADR, 0 medium priority ADRs
- **SUB**: Subscriptions — 2026-02-17 — 1 high priority ADR, 0 medium priority ADRs
- **CORE**: Core Application — 2026-02-17 — 2 high priority ADRs, 0 medium priority ADRs
- **NOTIF**: Notifications — 2026-02-17 — 1 high priority ADR, 0 medium priority ADRs
- **SEARCH**: Search & Discovery — 2026-02-17 — 2 high priority ADRs, 0 medium priority ADRs
- **AUTH**: Authentication — 2026-02-17 — 2 high priority ADRs, 1 medium priority ADR
- **DATA**: Data Layer — 2026-02-17 — 2 high priority ADRs (+ 1 cross-module duplicate flagged), 1 medium priority ADR

### Pending Analysis
- **USER**: User Management
- **SVC**: Services Catalog
- **SCHED**: Scheduling
- **APPT**: Appointments
- **REVIEW**: Review System
- **ADMIN**: Admin Dashboard
- **FE-PUB**: Public Pages
- **FE-PRO**: Professional Portal
- **FE-CLI**: Client Portal

---

## High Priority ADRs (must-document/)

### Module: IMG

| Title | Category | Score | File |
|-------|----------|-------|------|
| Cloudinary as Production Image Storage with Local Filesystem Fallback | Infrastructure / Technology | 130 | [cloudinary-as-production-image-storage-with-local-filesystem-fallback.md](./potential-adrs/must-document/IMG/cloudinary-as-production-image-storage-with-local-filesystem-fallback.md) |

### Module: FE-APP

| Title | Category | Score | File |
|-------|----------|-------|------|
| React 19 + Vite 7 as Frontend SPA Framework | Technology / Architecture | 145 | [react-vite-spa-framework.md](./potential-adrs/must-document/FE-APP/react-vite-spa-framework.md) |

### Module: JOB

| Title | Category | Score | File |
|-------|----------|-------|------|
| APScheduler as In-Process Scheduler Over Celery | Infrastructure / Technology | 125 | [apscheduler-in-process-over-celery.md](./potential-adrs/must-document/JOB/apscheduler-in-process-over-celery.md) |

### Module: SUB

| Title | Category | Score | File |
|-------|----------|-------|------|
| Mercado Pago as Subscription Payment Gateway | Technology / Infrastructure | 150 | [mercado-pago-subscription-payment-gateway.md](./potential-adrs/must-document/SUB/mercado-pago-subscription-payment-gateway.md) |

### Module: CORE

| Title | Category | Score | File |
|-------|----------|-------|------|
| FastAPI as Primary Backend Framework | Architecture / Technology | 150 | [fastapi-as-primary-backend-framework.md](./potential-adrs/must-document/CORE/fastapi-as-primary-backend-framework.md) |
| APScheduler as In-Process Job Scheduler | Architecture / Infrastructure | 130 | [apscheduler-as-in-process-job-scheduler.md](./potential-adrs/must-document/CORE/apscheduler-as-in-process-job-scheduler.md) |

### Module: NOTIF

| Title | Category | Score | File |
|-------|----------|-------|------|
| Resend as Production Transactional Email Provider with SMTP Fallback and Adapter Pattern | Infrastructure / Architecture | 135 | [resend-as-production-transactional-email-provider.md](./potential-adrs/must-document/NOTIF/resend-as-production-transactional-email-provider.md) |

### Module: SEARCH

| Title | Category | Score | File |
|-------|----------|-------|------|
| ViaCEP Backend Proxy for Brazilian Address Resolution | Architecture / Integration | 115 | [viacep-backend-proxy-for-brazilian-address-resolution.md](./potential-adrs/must-document/SEARCH/viacep-backend-proxy-for-brazilian-address-resolution.md) |
| PostgreSQL GIN Trigram Indexes for City-Level Professional Search | Architecture / Performance / Technology | 130 | [postgresql-gin-trigram-indexes-for-city-level-professional-search.md](./potential-adrs/must-document/SEARCH/postgresql-gin-trigram-indexes-for-city-level-professional-search.md) |

### Module: AUTH

| Title | Category | Score | File |
|-------|----------|-------|------|
| Stateless JWT Authentication with HS256 | Security / Architecture | 150 | [stateless-jwt-authentication-hs256.md](./potential-adrs/must-document/AUTH/stateless-jwt-authentication-hs256.md) |
| bcrypt for Password Hashing | Security | 135 | [bcrypt-password-hashing.md](./potential-adrs/must-document/AUTH/bcrypt-password-hashing.md) |

### Module: DATA

| Title | Category | Score | File |
|-------|----------|-------|------|
| SQLAlchemy 2.0 Async ORM as Data Access Layer | Technology | 145/150 | [sqlalchemy-async-orm.md](./potential-adrs/must-document/DATA/sqlalchemy-async-orm.md) |
| PostgreSQL 15 as the Primary Relational Database | Technology / Infrastructure | 150/150 | [postgresql-primary-database.md](./potential-adrs/must-document/DATA/postgresql-primary-database.md) |
| GIN Trigram Indexes (DATA perspective) — DUPLICATE of SEARCH module ADR | Performance / Architecture | 110/150 | [gin-trigram-search-indexing.md](./potential-adrs/must-document/DATA/gin-trigram-search-indexing.md) |

---

## Medium Priority ADRs (consider/)

### Module: AUTH

| Title | Category | Score | File |
|-------|----------|-------|------|
| JWT Token Stored in Browser localStorage | Security / Frontend Architecture | 70 | [jwt-stored-in-localstorage.md](./potential-adrs/consider/AUTH/jwt-stored-in-localstorage.md) |

### Module: DATA

| Title | Category | Score | File |
|-------|----------|-------|------|
| Denormalized Rating Aggregates on User for Search Performance | Performance / Architecture | 75/150 | [denormalized-rating-fields-on-user.md](./potential-adrs/consider/DATA/denormalized-rating-fields-on-user.md) |

---

## Summary

- High Priority (must-document/): 13 ADRs (includes 1 cross-module duplicate flagged in DATA)
- Medium Priority (consider/): 2 ADRs
- Total: 15 ADRs
- Modules Analyzed: 9 of 17
