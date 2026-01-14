# main.py - FastAPI entry point

import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import (
    users, services, appointments, subscriptions,
    auth, schedule, categories, admin, cep, health, plans
)

app = FastAPI(title="Chama Eu API", version="1.0.0")

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


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
