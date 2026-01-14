# main.py - FastAPI entry point

import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routers import (
    users, services, appointments, subscriptions,
    auth, schedule, categories, admin, cep, health, plans
)

app = FastAPI(title="Chama Eu API", version="1.0.0")

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
