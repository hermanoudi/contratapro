# ContrataPro

Marketplace brasileiro que conecta clientes a profissionais autonomos com agendamento e assinaturas via Mercado Pago. Monorepo: FastAPI backend + React frontend.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Python 3.12, FastAPI, SQLAlchemy async, Pydantic, Alembic, bcrypt, python-jose |
| Frontend | React 19, Vite 7, styled-components 6, React Router 7, framer-motion, lucide-react |
| Infra | Railway (backend + PostgreSQL), Vercel (frontend), Cloudinary (images), Resend (emails) |

## Quick Start

```bash
# Backend local
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend local
cd frontend && npm run dev

# Docker (full stack)
docker-compose up -d

# Migration
docker-compose exec backend alembic revision --autogenerate -m "descricao"
docker-compose exec backend alembic upgrade head

# Build frontend
cd frontend && npm run build
```

## Project Structure

```
backend/app/
  main.py              # FastAPI app, CORS, scheduler, lifespan
  models.py            # ALL SQLAlchemy models (single file)
  schemas.py           # ALL Pydantic schemas
  database.py          # Engine, AsyncSessionLocal, get_db
  config.py            # Settings via pydantic-settings
  auth_utils.py        # bcrypt, JWT creation/verification
  dependencies.py      # get_current_user, plan-based guards
  routers/             # One file per domain (auth, users, services, schedule...)
    __init__.py        # Re-exports all router objects
  services/            # Business logic (image_storage, notifications, subscription_jobs)

frontend/src/
  App.jsx              # Router + TourProvider
  config.js            # API_URL (dev: localhost:8000, prod: /api)
  pages/               # One .jsx per route
  components/          # Reusable (ProfessionalLayout, ClientLayout, SharedLayout, SEO/)
  contexts/            # React contexts (TourContext)
  config/              # Configuration (tourConfig.js)
  assets/              # Static images
```

## Universal Rules

1. **NEVER commit secrets** — passwords, API keys, tokens, DB URLs. See [security.md](.claude/guidelines/security.md)
2. **Portuguese comments, English identifiers** — `# Verifica assinatura` but `subscription_status`
3. **All DB operations async** — `await db.execute()`, `await db.commit()`, `await db.refresh()`
4. **`from_attributes = True`** in every Pydantic response schema's `Config` class
5. **No `src/services/` dir** — use inline `fetch()` with `API_URL` from `config.js`

## When to Read Guidelines

| Working on... | Read |
|---------------|------|
| Auth, secrets, CORS, passwords | [security.md](.claude/guidelines/security.md) |
| Naming, imports, file structure | [code-style.md](.claude/guidelines/code-style.md) |
| New endpoint, schemas, errors | [api-patterns.md](.claude/guidelines/api-patterns.md) |
| React pages, components, styling | [frontend-patterns.md](.claude/guidelines/frontend-patterns.md) |
| Models, migrations, relationships | [database.md](.claude/guidelines/database.md) |
| Commits, branching, pre-commit | [git-workflow.md](.claude/guidelines/git-workflow.md) |

## Subscription Plans

| Plano | Preco | Servicos | Trial |
|-------|-------|----------|-------|
| Trial | Gratis | 3 | 30 dias |
| Basic | R$ 29,90/mes | 5 | - |
| Premium | R$ 59,90/mes | Ilimitado | - |

**URLs**: Prod `contratapro.com.br` | API `api.contratapro.com.br` | Docs `api.contratapro.com.br/docs`
