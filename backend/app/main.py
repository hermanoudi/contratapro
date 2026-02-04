# main.py - FastAPI entry point

import logging
import sys
import uvicorn
import asyncio
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from .database import engine, Base
from .routers import (
    users, services, appointments, subscriptions,
    auth, schedule, categories, admin, cep, health, plans, notifications
)
from .services.subscription_jobs import subscription_jobs

# Scheduler global
scheduler = AsyncIOScheduler()

# Configurar logging para stdout (Railway)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerencia o ciclo de vida da aplicacao.
    Cria as tabelas do banco de dados na inicializacao.
    Inicia o scheduler de jobs.
    """
    # Startup: Criar tabelas
    print("Iniciando aplicacao...")
    print("Criando tabelas do banco de dados...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tabelas criadas com sucesso!")

    # Iniciar scheduler de jobs
    print("Configurando scheduler de jobs...")
    brasilia_tz = pytz.timezone('America/Sao_Paulo')
    scheduler.add_job(
        subscription_jobs.run_daily_subscription_jobs,
        CronTrigger(hour=0, minute=30, timezone=brasilia_tz),
        id="daily_subscription_jobs",
        name="Jobs diarios de assinatura",
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler iniciado! Jobs diarios agendados para 00:30 (Brasilia)")

    yield

    # Shutdown: Parar scheduler
    print("Encerrando scheduler...")
    scheduler.shutdown()
    print("Encerrando aplicacao...")


app = FastAPI(
    title="ContrataPro API",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração de CORS
# Lista de origens permitidas
origins = [
    "http://localhost:5173",              # Dev - Vite
    "http://localhost:3000",              # Dev alternativo
    "https://contratapro.com.br",         # Produção
    "https://www.contratapro.com.br",     # Produção com www
]

# Middleware CORS com suporte a padrões do Vercel
def configure_cors():
    """Configura CORS permitindo origens específicas e preview deploys do Vercel"""

    def allow_origin(origin: str) -> bool:
        """Valida se a origem é permitida"""
        # Permite origens exatas da lista
        if origin in origins:
            return True
        # Permite qualquer subdomínio .vercel.app
        if origin and origin.endswith('.vercel.app'):
            return True
        return False

    return allow_origin

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Aceita todos os deploys do Vercel
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar pasta de uploads (desenvolvimento local)
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(health.router)
app.include_router(users, prefix="/users", tags=["users"])
app.include_router(services, prefix="/services", tags=["services"])
app.include_router(
    appointments, prefix="/appointments", tags=["appointments"]
)
app.include_router(
    subscriptions, prefix="/subscriptions", tags=["subscriptions"]
)
app.include_router(auth, prefix="/auth", tags=["auth"])
app.include_router(schedule, prefix="/schedule", tags=["schedule"])
app.include_router(categories)
app.include_router(admin, prefix="/admin", tags=["admin"])
app.include_router(cep.router)
app.include_router(plans, prefix="/plans", tags=["plans"])
app.include_router(notifications, prefix="/notifications", tags=["notifications"])


if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
