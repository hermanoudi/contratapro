"""
API Router para Categorias de Serviços
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models import Category
from pydantic import BaseModel


# Schemas Pydantic
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    group: str
    image_url: str | None

    class Config:
        from_attributes = True


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryResponse])
async def list_categories(db: Session = Depends(get_db)):
    """
    Lista todas as categorias de serviços disponíveis.
    Retorna categorias agrupadas por tipo.
    """
    result = await db.execute(
        select(Category).order_by(Category.group, Category.name)
    )
    categories = result.scalars().all()
    return categories


@router.get("/groups", response_model=dict)
async def list_categories_by_group(db: Session = Depends(get_db)):
    """
    Lista categorias agrupadas por tipo de serviço.
    Retorna um dicionário com grupos como chaves.
    """
    result = await db.execute(
        select(Category).order_by(Category.group, Category.name)
    )
    categories = result.scalars().all()

    # Agrupar por tipo
    grouped = {}
    for cat in categories:
        if cat.group not in grouped:
            grouped[cat.group] = []
        grouped[cat.group].append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "image_url": cat.image_url
        })

    return grouped
