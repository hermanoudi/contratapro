# Potential ADR: FastAPI as Primary Backend Framework

**Module**: CORE
**Category**: Architecture / Technology
**Priority**: Must Document (Score: 150)
**Date Identified**: 2026-02-17

---

## What Was Identified

The backend of ContrataPro is built entirely on FastAPI, a modern Python async web framework. This is the structural foundation upon which all 13 domain routers, middleware, dependency injection, and the lifespan context manager are built. The framework was present from the very first commit on 2026-01-14 ("feat:primeiro commit em produção"), meaning the decision predates the project's production existence and has been the unchallenged foundation ever since.

FastAPI shapes the entire backend: it dictates the dependency injection pattern used for authentication guards (`get_current_user`, `check_can_manage_schedule`), the `Depends()` mechanism for request-scoped database sessions, the `BackgroundTasks` mechanism used in the APPT module, automatic OpenAPI documentation generation at `/docs`, and the Pydantic v2 integration for request/response schema validation. The framework choice is tightly coupled with SQLAlchemy's async session lifecycle, which is managed via FastAPI's dependency injection system.

The selection of FastAPI over alternatives such as Django REST Framework, Flask, or Litestar determined the async-first architecture of the entire backend, including the decision to use `asyncpg` as the PostgreSQL driver and SQLAlchemy 2.0 in async mode.

## Why This Might Deserve an ADR

- **Impact**: Affects every backend module — all 13 routers, the dependency injection system, schema validation, error handling, and API documentation are all FastAPI constructs.
- **Trade-offs**: FastAPI's async model requires async-compatible drivers throughout (asyncpg, aiosmtplib, httpx) — mixing sync code causes subtle blocking issues. Django would have offered a more batteries-included ORM and admin panel. Flask would have allowed more flexibility but with fewer guardrails.
- **Complexity**: The async programming model, while performant, requires all team members to understand Python async/await patterns, async context managers, and the constraints of SQLAlchemy async (no lazy loading).
- **Team Knowledge**: Every backend developer must understand FastAPI's dependency injection lifecycle, Pydantic integration, and async patterns before contributing to any endpoint.
- **Future Implications**: Migrating away from FastAPI would require rewriting all 13 routers, all dependency guards, and the middleware stack. The tight Pydantic v2 integration means schema changes would cascade. This decision is effectively irreversible for the lifetime of the project.
- **Temporal Context**: Stable since project inception (2026-01-14), approximately 5 weeks old. No commits indicate any reconsideration or alternative evaluation.

## Evidence Found in Codebase

### Key Files
- [`backend/app/main.py`](/home/hermano/projetos/faz_de_tudo/backend/app/main.py) — Lines 8-82: FastAPI app instantiation, middleware, lifespan, router registration
- [`backend/app/dependencies.py`](/home/hermano/projetos/faz_de_tudo/backend/app/dependencies.py) — FastAPI `Depends()` injection chain
- [`backend/requirements.txt`](/home/hermano/projetos/faz_de_tudo/backend/requirements.txt) — `fastapi==0.115.0`, `uvicorn==0.30.6`

### Code Evidence
```python
# backend/app/main.py:78-82
app = FastAPI(
    title="ContrataPro API",
    version="1.0.0",
    lifespan=lifespan
)
```

```python
# backend/app/main.py:109-116
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```python
# backend/app/main.py:124-140 — All 13 domain routers registered under FastAPI
app.include_router(health.router)
app.include_router(users, prefix="/users", tags=["users"])
app.include_router(services, prefix="/services", tags=["services"])
app.include_router(appointments, prefix="/appointments", tags=["appointments"])
app.include_router(subscriptions, prefix="/subscriptions", tags=["subscriptions"])
# ... and 8 more
```

### Impact Analysis
- Introduced: 2026-01-14 ("feat:primeiro commit em produção")
- Modified: 9 commits over 26 days
- Last change: 2026-02-09 ("feat:sistema de avaliacao de prestadores")
- Affects: All 13 routers, all dependency injection, all Pydantic schemas
- Scope: Entire backend — every module is a FastAPI router

### Alternatives (if observable)
No explicit alternative evaluation visible in commit history or comments. The Celery dependency declared in `requirements.txt` (but not yet activated) implies Django was not chosen, as Django would have its own task queue integration path. The async-first architecture rules out Flask (sync-first) as a practical alternative at this stage.

## Questions to Address in ADR (if created)

- Why FastAPI over Django REST Framework or Flask for a Brazilian marketplace?
- Was the async-first approach a deliberate performance decision or incidental to FastAPI's popularity?
- What Python runtime constraints (Railway Nixpacks builder) influenced the choice?
- How does the auto-generated OpenAPI docs factor into the decision (team productivity, API consumers)?
- What is the versioning and upgrade strategy for FastAPI given the rapid release cadence?

## Related Potential ADRs
- [APScheduler as In-Process Job Scheduler](./apscheduler-as-in-process-job-scheduler.md) — scheduler integrated into FastAPI lifespan
- Potential ADR for SQLAlchemy Async ORM (DATA module) — framework pairing
- Potential ADR for Pydantic v2 Schema Validation (DATA module) — tightly coupled with FastAPI

## Additional Notes
FastAPI version 0.115.0 is the current production version. The `lifespan` context manager pattern (used here) replaced the deprecated `@app.on_event("startup")` / `@app.on_event("shutdown")` decorators in FastAPI v0.93+. The adoption of the lifespan API indicates the team is following current FastAPI best practices.
