# Codebase Architecture Mapping

**Project**: ContrataPro
**Mapping Date**: 2026-02-16
**Phase**: 1 — Codebase Mapping
**Analyzed By**: ADR Specialist (Phase 1)

---

## Project Overview

| Field         | Value                                                             |
|---------------|-------------------------------------------------------------------|
| **Name**      | ContrataPro                                                       |
| **Purpose**   | Brazilian marketplace connecting clients to autonomous professionals with scheduling and subscription billing |
| **Type**      | SaaS Marketplace / Two-sided Platform                            |
| **Languages** | Python 3.12 (backend), JavaScript/JSX (frontend)                 |
| **Framework** | FastAPI (backend), React 19 + Vite 7 (frontend)                  |
| **Structure** | Monorepo — `backend/` + `frontend/` in single git repository     |
| **Domain**    | Service marketplace with freemium monetization (Trial/Basic/Premium plans) |

---

## Technology Stack

### Backend
| Layer            | Technology                                                |
|------------------|-----------------------------------------------------------|
| Framework        | FastAPI 0.115.0                                           |
| Runtime          | Python 3.12, Uvicorn 0.30.6                               |
| ORM              | SQLAlchemy 2.0.35 (async mode — `create_async_engine`)    |
| Database Driver  | asyncpg 0.29.0 (PostgreSQL async driver)                  |
| Migrations       | Alembic 1.13.2                                            |
| Schema Validation| Pydantic v2 (2.9.2) + pydantic-settings 2.5.2            |
| Authentication   | python-jose 3.3.0 (JWT HS256), bcrypt 3.2.0               |
| Scheduling       | APScheduler 3.10.4 (AsyncIOScheduler + CronTrigger)       |
| HTTP Client      | httpx 0.27.2 (async)                                      |
| Task Queue       | Celery 5.4.0 + Redis (declared in deps, not yet in use)   |

### Frontend
| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Framework      | React 19.2.0                                    |
| Build Tool     | Vite 7.2.4                                      |
| Routing        | React Router DOM 7.11.0                         |
| Styling        | styled-components 6.1.19                        |
| Animations     | framer-motion 12.x                              |
| Icons          | lucide-react 0.562.0                            |
| Notifications  | sonner 2.0.7 (toast UI)                         |
| Calendar       | react-calendar 6.0.0                            |
| Onboarding     | react-joyride 2.9.3                             |
| SEO            | react-helmet-async 2.0.5                        |
| Testing        | Vitest 4.x + Testing Library                    |

### Infrastructure & External Services
| Service         | Purpose                                           | Env Config Key               |
|-----------------|---------------------------------------------------|------------------------------|
| PostgreSQL 15   | Primary relational database                       | `DATABASE_URL`               |
| Railway         | Backend hosting + PostgreSQL managed DB           | Deployment platform          |
| Vercel          | Frontend hosting + CDN                            | `vercel.json`                |
| Mercado Pago    | Payment gateway — subscriptions (preapproval)     | `MERCADOPAGO_ACCESS_TOKEN`   |
| Cloudinary      | Cloud image storage (production)                  | `CLOUDINARY_*` keys          |
| Resend          | Transactional email (production)                  | `RESEND_API_KEY`             |
| ViaCEP          | Brazilian ZIP code / address lookup (external API)| No key — public API          |
| Redis           | Declared dependency (Celery broker, not active)   | Not yet configured           |
| Local FS        | Image storage fallback (development)              | `UPLOAD_STORAGE=local`       |

---

## System Modules

### Module Index

| ID      | Name                    | Description                                                                 |
|---------|-------------------------|-----------------------------------------------------------------------------|
| CORE    | Core Application        | FastAPI app bootstrap, CORS, lifespan, router registration, scheduler setup |
| AUTH    | Authentication          | JWT-based auth, bcrypt hashing, OAuth2 scheme, password reset flows         |
| DATA    | Data Layer              | SQLAlchemy async engine, session factory, Alembic migrations, all models    |
| USER    | User Management         | Registration, profiles, slugs, image uploads, plan-based access guards      |
| SVC     | Services Catalog        | Professional service offerings CRUD with plan-limit enforcement             |
| SCHED   | Scheduling              | Working hours management, appointment booking, slot availability            |
| APPT    | Appointments            | Appointment lifecycle (create/cancel/complete), review token generation     |
| SUB     | Subscriptions           | Plan management, Mercado Pago payment integration, trial/paid lifecycle     |
| NOTIF   | Notifications           | Email notification system with pluggable adapter (SMTP/Resend), templates  |
| REVIEW  | Review System           | UUID-token single-use reviews, star ratings, professional score aggregation |
| ADMIN   | Admin Dashboard         | Platform admin operations, subscription overrides, trial management         |
| SEARCH  | Search & Discovery      | CEP-based geographic search, professional filtering by category/city        |
| IMG     | Image Storage           | Dual-mode image upload (local dev / Cloudinary prod) with a strategy pattern |
| JOB     | Background Jobs         | APScheduler cron jobs: subscription lifecycle, trial expiry, review reminders |
| FE-APP  | Frontend Application    | React SPA routing, layouts per role, global state (TourContext)             |
| FE-PUB  | Public Pages            | Unauthenticated pages: Home, Search, Booking, Profile, Review submission    |
| FE-PRO  | Professional Portal     | Professional-role pages: Dashboard, Schedule, Services, Subscription mgmt  |
| FE-CLI  | Client Portal           | Client-role pages: My Appointments, History, Appointment detail             |

---

### CORE: Core Application

**Purpose**: FastAPI app bootstrap, CORS policy, middleware registration, router mounting, and lifespan management (scheduler start/stop).

**Location**: `backend/app/main.py`

**Key Components**:
- `FastAPI` app instantiation with lifespan context manager
- `CORSMiddleware` — explicit origins + Vercel wildcard (`*.vercel.app`) pattern
- Router registration for all 13 domain routers
- `AsyncIOScheduler` initialization with two cron jobs (00:30 and 01:00 Brasilia time)
- Static file mount at `/uploads` for local dev images

**Technologies**: FastAPI, APScheduler, CORSMiddleware, pytz (Brasilia timezone)

**Dependencies**:
- Internal: All domain routers, `subscription_jobs`, `review_jobs`
- External: None (orchestration layer)

**Patterns**: Lifespan-based startup/shutdown (FastAPI v0.93+ pattern), centralized router registration

**Key Files**:
- `backend/app/main.py` — Complete app definition (147 lines)

**Scope**: Small — 1 file, ~147 lines

---

### AUTH: Authentication

**Purpose**: Stateless JWT-based authentication. Password hashing (bcrypt). Token issuance for access and password reset. OAuth2 password bearer scheme.

**Location**: `backend/app/auth_utils.py`, `backend/app/dependencies.py`, `backend/app/routers/auth.py`

**Key Components**:
- `auth_utils.py` — `verify_password`, `get_password_hash` (bcrypt), `create_access_token` (JWT HS256), `create_password_reset_token`, `verify_password_reset_token`
- `dependencies.py` — `get_current_user` (JWT decode + DB lookup), `check_can_manage_schedule`, `check_can_create_service` (plan-based guards)
- `routers/auth.py` — `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` endpoints

**Technologies**: python-jose (JWT), bcrypt, FastAPI OAuth2PasswordBearer

**Dependencies**:
- Internal: `models.User`, `models.SubscriptionPlan`, `database.get_db`, `config.Settings`
- External: None

**Patterns**:
- Stateless JWT (no server-side session storage)
- Algorithm: HS256
- Token expiry: 7 days access, 24h password reset
- Special claim `purpose: "password_reset"` differentiates reset tokens from access tokens
- Plan-based dependency injection guards (`check_can_manage_schedule`, `check_can_create_service`)

**Key Files**:
- `backend/app/auth_utils.py` — Core crypto operations
- `backend/app/dependencies.py` — Dependency injection guards

**Scope**: Small — 3 files, ~185 lines

---

### DATA: Data Layer

**Purpose**: All database models (single-file approach), async engine configuration, Alembic migrations, and Pydantic schemas.

**Location**: `backend/app/models.py`, `backend/app/database.py`, `backend/app/schemas.py`, `backend/alembic/`

**Key Components**:
- `database.py` — `create_async_engine`, `AsyncSessionLocal`, `Base`, `get_db` dependency
- `models.py` — ALL 9 SQLAlchemy models in one file: `SubscriptionPlan`, `Category`, `User`, `Service`, `WorkingHour`, `Appointment`, `Subscription`, `Notification`, `ReviewToken`, `Review`
- `schemas.py` — All Pydantic v2 request/response schemas (single file)
- `alembic/versions/` — 9 migration files from 2026-01-05 to 2026-02-10

**Technologies**: SQLAlchemy 2.0 (async), asyncpg, Alembic, Pydantic v2

**Dependencies**:
- Internal: `config.Settings` (DATABASE_URL)
- External: PostgreSQL 15

**Patterns**:
- Single-file model consolidation (all models in `models.py`)
- Single-file schema consolidation (all schemas in `schemas.py`)
- All relationships use `back_populates`
- Status fields as plain strings (not Enums): `subscription_status`, `status`
- Denormalized rating fields on User (`average_rating`, `total_reviews`) for search performance
- `asyncpg` URL prefix rewriting (Railway injects `postgresql://`, code converts to `postgresql+asyncpg://`)
- DB-level triggers: `server_default=func.now()` for timestamps, `onupdate=func.now()` for `updated_at`

**Migration History**:
| Date       | Migration                                       |
|------------|-------------------------------------------------|
| 2026-01-05 | Initial migration (core schema)                 |
| 2026-01-08 | Add subscription_plans table                    |
| 2026-01-22 | Add plan_id to subscriptions                    |
| 2026-01-23 | Add notifications table                         |
| 2026-01-30 | Add cancellation_reason_code                    |
| 2026-02-04 | Add scheduled subscription fields               |
| 2026-02-04 | Add user slug                                   |
| 2026-02-09 | Add review system (ReviewToken, Review)         |
| 2026-02-10 | Add search indexes (GIN + pg_trgm, btree)       |

**Key Files**:
- `backend/app/models.py` — 257 lines, all 9 models
- `backend/app/database.py` — 22 lines, engine + session factory
- `backend/alembic/versions/` — 9 migration files

**Scope**: Large — influences every module

---

### USER: User Management

**Purpose**: User registration (professional/client), profile management with multipart form data, profile picture upload, slug generation, CPF management.

**Location**: `backend/app/routers/users.py`, `backend/app/slug_utils.py`

**Key Components**:
- `PUT /users/me` — Profile update (multipart form, includes image upload)
- `POST /users/upload-profile-picture` — Standalone image upload
- `GET /users/me` — Current user profile
- `GET /users/professionals` — List professionals (filtered by subscription)
- `GET /users/professionals/{id}` and `GET /users/p/{slug}` — Public professional profiles
- `GET /users/search` — Professional search by service/category/CEP
- `slug_utils.py` — Unique slug generation from name (URL-friendly)

**Technologies**: FastAPI Form/File upload, Pydantic v2, SQLAlchemy async

**Dependencies**:
- Internal: `image_storage` (IMG module), `auth_utils`, `dependencies.get_current_user`
- External: None (CEP handled by SEARCH module)

**Patterns**:
- Dual registration path (professional vs. client — same `users` table, `is_professional` flag)
- Subscription-plan-based feature gating via dependency injection
- Profile image dual-storage strategy (local/Cloudinary delegated to IMG module)
- Slug generation for public-facing professional URLs (`/p/:slug`)

**Key Files**:
- `backend/app/routers/users.py`
- `backend/app/slug_utils.py`

**Scope**: Medium — 2 files, ~300 lines

---

### SVC: Services Catalog

**Purpose**: Professional service offerings — CRUD operations with plan-limit enforcement (Trial: 3 services, Basic: 5 services, Premium: unlimited).

**Location**: `backend/app/routers/services.py`

**Key Components**:
- `POST /services/` — Create service (guarded by `check_can_create_service`)
- `PUT /services/{id}` — Update service
- `DELETE /services/{id}` — Delete service
- `GET /services/` — List services for authenticated professional
- `GET /services/professional/{id}` — Public service listing by professional
- Service image upload via `image_storage`

**Technologies**: FastAPI, SQLAlchemy async

**Dependencies**:
- Internal: `dependencies.check_can_create_service`, `image_storage`, `models.Service`
- External: None

**Patterns**:
- Plan-limit enforcement at the dependency level (not business logic layer)
- Service duration types: `hourly` or `daily`

**Scope**: Small — 1 file

---

### SCHED: Scheduling

**Purpose**: Professional working hours management. Availability slot computation. Blocked time slots.

**Location**: `backend/app/routers/schedule.py`

**Key Components**:
- `PUT /schedule/working-hours` — Set working hours per day of week
- `GET /schedule/availability/{professional_id}` — Compute available time slots
- Manual block creation (using `Appointment` with `is_manual_block=True`)

**Technologies**: FastAPI, SQLAlchemy async, Python `datetime`

**Dependencies**:
- Internal: `dependencies.check_can_manage_schedule`, `models.WorkingHour`, `models.Appointment`
- External: None

**Patterns**:
- Feature-gated by plan (`check_can_manage_schedule` guard)
- Blocks stored as appointments with `is_manual_block=True` flag

**Scope**: Small — 1 file

---

### APPT: Appointments

**Purpose**: Full appointment lifecycle: creation, status transitions (scheduled → completed/cancelled), review token generation on completion, notification dispatch.

**Location**: `backend/app/routers/appointments.py`

**Key Components**:
- `POST /appointments/` — Create appointment (client books professional)
- `PATCH /appointments/{id}/status` — Update status (complete/cancel)
- `GET /appointments/` — List appointments for current user (professional or client)
- `GET /appointments/{id}` — Single appointment detail
- On `completed` status: creates `ReviewToken`, dispatches review email (background task)

**Technologies**: FastAPI BackgroundTasks, SQLAlchemy async

**Dependencies**:
- Internal: `notification_service` (NOTIF module), `review_jobs` (JOB module), `models.Appointment`, `models.ReviewToken`
- External: None

**Patterns**:
- Background tasks for post-completion side-effects (email sending)
- Review token generated at appointment completion time
- Status as plain string: `scheduled`, `completed`, `cancelled`, `suspended`, `blocked`

**Scope**: Medium — 1 file

---

### SUB: Subscriptions

**Purpose**: Full subscription lifecycle for professional monetization. Trial activation (immediate, no payment). Paid plan flow via Mercado Pago preapproval API. Plan upgrades (immediate with pro-rata), downgrades (scheduled for billing date), cancellations (scheduled for billing date for paid, immediate for trial). Webhook processing for payment events.

**Location**: `backend/app/routers/subscriptions.py`, `backend/app/routers/plans.py`

**Key Components**:
- `POST /subscriptions/subscribe/{plan_slug}` — Subscribe to trial or paid plan
- `POST /subscriptions/change-plan/{new_plan_slug}` — Upgrade/downgrade plan
- `POST /subscriptions/cancel` — Cancel subscription (immediate or scheduled)
- `POST /subscriptions/cancel-scheduled-change` — Undo scheduled changes
- `POST /subscriptions/webhook` — Mercado Pago webhook handler (preapproval + payment events)
- `GET /subscriptions/my-subscription` — Current subscription status
- `POST /subscriptions/admin/force-trial/{user_id}` — Admin trial override
- `GET /plans/` — Public plan listing

**Technologies**: mercadopago SDK 2.3.0, httpx (direct REST calls to MP API), FastAPI

**Dependencies**:
- Internal: `notification_service`, `email_templates`, `models.Subscription`, `models.SubscriptionPlan`
- External: Mercado Pago API (`https://api.mercadopago.com/preapproval_plan`, `/preapproval`)

**Patterns**:
- Mercado Pago preapproval plan model (not one-time payments)
- Hybrid SDK usage: official `mercadopago` SDK for some calls + direct `httpx` for others (preapproval_plan creation)
- Dual status tracking: `Subscription.status` + `User.subscription_status` (denormalized)
- Scheduled changes: `scheduled_cancellation_date`, `scheduled_plan_id`, `scheduled_plan_change_date` fields
- Pro-rata calculation for upgrades: `(price_diff * days_remaining) / 30`
- CPF required for paid plans (Brazilian tax ID)

**Key Files**:
- `backend/app/routers/subscriptions.py` — 1901 lines, the largest file in the codebase

**Scope**: Large — 1 file, ~1901 lines

---

### NOTIF: Notifications

**Purpose**: Email notification system with pluggable adapter pattern (SMTP or Resend). HTML + plain-text email templates. Notification records stored in DB for audit trail.

**Location**: `backend/app/services/notifications/`

**Key Components**:
- `base.py` — Abstract `NotificationAdapter` interface
- `email_adapter.py` — SMTP adapter (aiosmtplib)
- `resend_adapter.py` — Resend API adapter
- `notification_service.py` — Orchestrator singleton, adapter selection at runtime
- `templates.py` — Static methods returning `(subject, plain_text, html)` tuples

**Technologies**: aiosmtplib (SMTP), resend 2.5.1, Python async

**Dependencies**:
- Internal: `models.Notification`, `config.Settings` (`EMAIL_PROVIDER`, `RESEND_API_KEY`, `SMTP_*`)
- External: Resend API (production), SMTP server (configurable)

**Patterns**:
- Adapter pattern for email provider (runtime selection via `EMAIL_PROVIDER` env var)
- Singleton `notification_service` instance imported by routers
- Dual-body emails: HTML + plain text fallback
- Notification records in DB (`Notification` model) for audit/in-app display
- Templates as pure functions (no side effects)

**Key Files**:
- `backend/app/services/notifications/notification_service.py`
- `backend/app/services/notifications/templates.py`
- `backend/app/services/notifications/base.py`

**Scope**: Medium — 5 files in `services/notifications/`

---

### REVIEW: Review System

**Purpose**: Post-service quality reviews via single-use UUID tokens. Unauthenticated public submission. Denormalized rating aggregation on professional User record.

**Location**: `backend/app/routers/reviews.py`, `backend/app/services/review_jobs.py`

**Key Components**:
- `POST /reviews/{token}` — Public review submission (no auth required)
- `GET /reviews/providers/{id}/summary` — Public review summary with pagination
- `ReviewToken` model — UUID token, one-per-appointment, `used_at` marks consumption
- `review_jobs.py` — Daily cron: auto-complete past appointments, send safety-net emails

**Technologies**: FastAPI, SQLAlchemy async, APScheduler

**Dependencies**:
- Internal: `models.ReviewToken`, `models.Review`, `models.User`, `notification_service`, JOB module
- External: None

**Patterns**:
- Token-based review: UUID sent via email, consumed on first use
- Rating aggregation: `User.average_rating` and `User.total_reviews` updated on each review (denormalized for search performance)
- Public endpoints — no JWT required

**Scope**: Small — 2 files

---

### ADMIN: Admin Dashboard

**Purpose**: Platform administration — professional oversight, subscription management overrides, trial management, user status control, platform metrics.

**Location**: `backend/app/routers/admin.py`, `frontend/src/pages/AdminDashboard.jsx`, `frontend/src/pages/AdminTrials.jsx`

**Key Components**:
- `GET /admin/professionals` — Paginated professional listing with subscription info
- `POST /admin/suspend-professional/{id}` — Suspend/reactivate professional
- `GET /admin/stats` — Platform statistics
- `POST /subscriptions/admin/force-trial/{user_id}` — Force trial for a user
- Frontend: `AdminDashboard.jsx`, `AdminTrials.jsx` (no auth wrapper, checks `is_admin` flag)

**Technologies**: FastAPI, SQLAlchemy async, React

**Dependencies**:
- Internal: `models.User`, `models.Subscription`, `models.SubscriptionPlan`, `dependencies.get_current_user`
- External: None

**Patterns**:
- Role check via `current_user.is_admin` flag (not separate role table)
- Admin endpoints mixed into domain routers (subscriptions router has admin sub-routes)

**Scope**: Small — 2 backend files, 2 frontend pages

---

### SEARCH: Search & Discovery

**Purpose**: Geographic professional search by CEP (ZIP code), service category, and text. Proxy for ViaCEP API to avoid frontend cross-origin latency.

**Location**: `backend/app/routers/cep.py`, `backend/app/routers/categories.py`, `backend/app/services/viacep.py`, `frontend/src/pages/Search.jsx`

**Key Components**:
- `GET /cep/{cep}` — Backend proxy for ViaCEP (returns city/state for search context)
- `GET /categories/` — Service category listing
- `GET /users/search` — Professional search by city/category/text (uses GIN indexes)
- `ViaCEPService` — Async ViaCEP client with timeout/error handling
- `Search.jsx` — Frontend search page with CEP input + category filter

**Technologies**: httpx (ViaCEP calls), PostgreSQL GIN/pg_trgm indexes (search acceleration)

**Dependencies**:
- Internal: `models.User`, `models.Category`
- External: ViaCEP public API (`https://viacep.com.br/ws`)

**Patterns**:
- Backend proxy pattern for ViaCEP (avoids browser CORS issues and sequential latency)
- GIN trigram indexes on `city` and `category` columns (migration 20260210)
- Denormalized `city`/`state` on User for search without joins

**Key Files**:
- `backend/app/services/viacep.py`
- `backend/app/routers/cep.py`

**Scope**: Small — 3 backend files

---

### IMG: Image Storage

**Purpose**: Dual-mode image upload with strategy pattern. Local filesystem for development, Cloudinary for production. Supports profiles and service images.

**Location**: `backend/app/services/image_storage.py`

**Key Components**:
- `ImageStorageService.upload()` — Routes to local or Cloudinary based on `UPLOAD_STORAGE` env var
- `_upload_local()` — Saves to `uploads/{folder}/` filesystem path
- `_upload_cloudinary()` — Uploads to Cloudinary with WebP conversion + auto quality
- `_delete_local()` / `_delete_cloudinary()` — Cleanup on profile/service update

**Technologies**: Cloudinary Python SDK 1.41.0, pathlib, uuid

**Dependencies**:
- Internal: `config.Settings`
- External: Cloudinary (production), local filesystem (development)

**Patterns**:
- Strategy pattern: same interface, two implementations selected by config
- Singleton `image_storage` instance
- Auto-conversion to WebP format on Cloudinary upload (optimization)
- Images served via Cloudinary CDN (production) or FastAPI StaticFiles (development)

**Key Files**:
- `backend/app/services/image_storage.py` — 169 lines

**Scope**: Small — 1 file

---

### JOB: Background Jobs

**Purpose**: Daily cron jobs for subscription lifecycle management and review trigger safety net. Run independently via APScheduler with own DB sessions.

**Location**: `backend/app/services/subscription_jobs.py`, `backend/app/services/review_jobs.py`

**Key Components**:
- `SubscriptionJobsService.run_daily_subscription_jobs()` — Runs at 00:30 BRT:
  - Renewal reminders (7 days before billing)
  - Trial expiry notifications and deactivation
  - Scheduled cancellations execution
  - Scheduled plan downgrades execution
  - Payment failure grace period management
- `ReviewJobsService.run_daily_review_jobs()` — Runs at 01:00 BRT:
  - Auto-complete past appointments
  - Send review request emails (safety net for missed triggers)

**Technologies**: APScheduler 3.10.4, SQLAlchemy async (own session), pytz (America/Sao_Paulo)

**Dependencies**:
- Internal: `models.*`, `notification_service`, `config.Settings`
- External: None (all DB operations)

**Patterns**:
- Singleton job service classes with own DB session management (not using request-scoped `get_db`)
- Cron schedules: `00:30` subscriptions, `01:00` reviews (Brasilia timezone)
- Idempotent job design (safe to re-run)

**Key Files**:
- `backend/app/services/subscription_jobs.py`
- `backend/app/services/review_jobs.py`

**Scope**: Medium — 2 files

---

### FE-APP: Frontend Application

**Purpose**: React SPA bootstrap, routing, role-based layout wrappers, global provider setup.

**Location**: `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/src/config.js`

**Key Components**:
- `App.jsx` — Router + Routes definition, 20 routes total
- `ProfessionalLayout` — Sidebar + header for professional-role pages
- `ClientLayout` — Header for client-role pages
- `SharedLayout` — Generic authenticated layout
- `TourContext` / `TourProvider` — Guided onboarding tour state
- `config.js` — `API_URL` resolution: `/api` (prod via Vercel rewrite) or `http://localhost:8000` (dev via Vite proxy)

**Technologies**: React 19, React Router 7, styled-components, framer-motion

**Dependencies**:
- Internal: All page components, layout components
- External: Vercel (hosting + `/api` URL rewrite)

**Patterns**:
- Role-based layout composition (not route guards — page components check auth)
- API URL abstraction: single `API_URL` from `config.js`, no service layer
- No `src/services/` directory — inline `fetch()` calls in each page component
- Vite dev proxy `/api -> localhost:8000`
- Vercel prod rewrite `/api/* -> https://api.contratapro.com.br/$1`

**Key Files**:
- `frontend/src/App.jsx`
- `frontend/src/config.js`
- `frontend/vite.config.js`
- `frontend/vercel.json`

**Scope**: Small — 4 key files

---

### FE-PUB: Public Pages

**Purpose**: Unauthenticated-accessible pages. No layout wrapper. Key conversion/discovery surfaces.

**Location**: `frontend/src/pages/` (public subset)

**Key Components**:
- `Home.jsx` — Landing page, hero, plan pricing, category menu
- `Search.jsx` — CEP-based professional search with filters
- `Booking.jsx` — Professional profile + service booking (accessible by slug `/p/:slug` or ID `/book/:id`)
- `ProfessionalProfile.jsx` — Public professional profile page
- `ReviewSubmit.jsx` — Token-based review submission (`/avaliar/:token`)
- `ServiceCategory.jsx` — Category-specific professional listing
- `Login.jsx`, `RegisterClient.jsx`, `RegisterProfessional.jsx` — Auth pages
- `ResetPassword.jsx` — Password reset flow

**Technologies**: React 19, styled-components, framer-motion, sonner

**Dependencies**:
- Internal: `API_URL` from config.js, inline fetch
- External: Mercado Pago JS SDK (for card tokenization on checkout)

**Patterns**:
- All public pages: no auth check at route level
- CEP lookup via backend proxy (`/api/cep/{cep}`)
- Dual route for booking: `/p/:slug` (URL-friendly) and `/book/:id` (legacy ID-based)

**Scope**: Medium — 8 page files

---

### FE-PRO: Professional Portal

**Purpose**: Authenticated pages for professional users. Plan-gated feature access.

**Location**: `frontend/src/pages/` (professional subset)

**Key Components**:
- `Dashboard.jsx` — Professional appointment calendar + stats
- `SubscriptionSetup.jsx` — Plan selection page
- `SubscriptionCheckout.jsx` — Payment card entry (Mercado Pago)
- `SubscriptionCallback.jsx` — Post-payment redirect handler
- `MySubscription.jsx` — Subscription status + management
- `ChangePlan.jsx` — Plan upgrade/downgrade UI
- All wrapped in `ProfessionalLayout`

**Technologies**: React 19, Mercado Pago JS SDK (card tokenization)

**Dependencies**:
- Internal: `API_URL`, localStorage (JWT token), `ProfessionalLayout`
- External: Mercado Pago (payment flow)

**Scope**: Medium — 6 page files

---

### FE-CLI: Client Portal

**Purpose**: Authenticated pages for client users.

**Location**: `frontend/src/pages/` (client subset)

**Key Components**:
- `ClientDashboard.jsx` — Client's upcoming appointments (`/my-appointments`)
- `AppointmentDetail.jsx` — Single appointment view + cancel
- `History.jsx` — Past appointment history with filters
- `MyNotifications.jsx` — In-app notification center
- All wrapped in `ClientLayout` or `SharedLayout`

**Technologies**: React 19, styled-components

**Scope**: Small — 4 page files

---

## Cross-Cutting Concerns

### Authentication & Authorization
- **Mechanism**: Stateless JWT Bearer tokens (HS256, 7-day expiry)
- **Guards**: FastAPI dependency injection — `get_current_user` (identity), `check_can_manage_schedule` (plan feature), `check_can_create_service` (plan limit)
- **Admin**: `is_admin` boolean flag on `User` model (no RBAC framework)
- **Frontend**: JWT stored in `localStorage`, included in `Authorization: Bearer` header on each fetch

### Database Access Pattern
- **All operations async**: `await db.execute()`, `await db.commit()`, `await db.refresh()`
- **Session lifecycle**: Request-scoped via `get_db` dependency (FastAPI DI)
- **Jobs exception**: `subscription_jobs` and `review_jobs` manage their own sessions (not request-scoped)
- **Eager loading**: `selectinload` used for specific relations (e.g., `subscription_plan` in `get_current_user`)
- **No lazy loading**: Async SQLAlchemy does not support lazy loading by default

### API Design
- **Style**: REST (resource-based URLs, HTTP methods, status codes)
- **Prefix**: All backend routes unprefixed (e.g., `/users`, `/subscriptions`)
- **Frontend access**: Via `/api` prefix (Vite proxy in dev, Vercel rewrite in prod)
- **Docs**: FastAPI auto-generates OpenAPI at `api.contratapro.com.br/docs`

### Configuration Management
- **Backend**: `pydantic-settings` with `Settings` class, loaded from `.env` + environment variables
- **Frontend**: Vite env vars (`VITE_*` prefix), `import.meta.env`
- **Production secrets**: Injected via Railway (backend) and Vercel (frontend) environment variable dashboards

### Deployment & Hosting
- **Backend**: Railway (Python Nixpacks builder) — `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Frontend**: Vercel — Vite build, SPA rewrites in `vercel.json`
- **Database**: Railway managed PostgreSQL 15
- **CI/CD**: Git push triggers automatic Railway/Vercel deployments

### Email Provider Strategy
- **Runtime adapter selection**: `EMAIL_PROVIDER=smtp` (dev/SMTP) or `EMAIL_PROVIDER=resend` (production)
- **Fallback chain**: Resend (if configured) → SMTP → warning log
- **Templates**: Pure functions returning `(subject, plain_text, html)` — provider-agnostic

---

## File Count Summary

| Area                          | Files  | Approx Lines |
|-------------------------------|--------|--------------|
| Backend routers               | 13     | ~4,500       |
| Backend services              | 7      | ~900         |
| Backend core (models/schemas/config/db/auth) | 6 | ~1,200 |
| Backend migrations            | 9      | ~400         |
| Frontend pages                | 20     | ~7,000       |
| Frontend components           | 8      | ~1,000       |
| Frontend config/contexts      | 4      | ~200         |
| **Total (source files)**      | **67** | **~15,200**  |

---

## Notes for Phase 2 (ADR Identification)

The following modules contain the highest density of architectural decisions and should be prioritized for ADR analysis:

1. **DATA** — ORM choice (SQLAlchemy async), single-file model consolidation, PostgreSQL-specific indexes
2. **AUTH** — JWT strategy, bcrypt, stateless session design, plan-based guards
3. **SUB** — Mercado Pago integration, preapproval model, scheduled change pattern
4. **NOTIF** — Adapter pattern for email providers, runtime provider selection
5. **IMG** — Strategy pattern for dual-mode storage (local/Cloudinary)
6. **JOB** — APScheduler cron design, own-session job pattern
7. **CORE** — CORS policy (Vercel wildcard), FastAPI lifespan pattern
8. **SEARCH** — Backend CEP proxy decision, GIN trigram index strategy
9. **FE-APP** — No service layer (inline fetch), Vite proxy + Vercel rewrite API routing

**Recommended Analysis Order**: DATA → AUTH → SUB → NOTIF → IMG → CORE → SEARCH → FE-APP → JOB
