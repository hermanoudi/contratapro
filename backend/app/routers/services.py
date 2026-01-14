from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from ..database import get_db
from ..models import Service, User
from ..schemas import ServiceCreate, ServiceResponse
from ..auth_utils import verify_password # We need a get_current_user dependency really
from ..dependencies import get_current_user, check_can_create_service
from ..services import image_storage

router = APIRouter()

@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(service: ServiceCreate, current_user: User = Depends(check_can_create_service), db: AsyncSession = Depends(get_db)):
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Only professionals can create services")
        
    new_service = Service(
        title=service.title,
        description=service.description,
        price=service.price,
        duration_type=service.duration_type,
        professional_id=current_user.id
    )
    db.add(new_service)
    await db.commit()
    await db.refresh(new_service)
    return new_service

@router.get("/me", response_model=List[ServiceResponse])
async def read_my_services(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).filter(Service.professional_id == current_user.id))
    services = result.scalars().all()
    return services

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).filter(Service.id == service_id, Service.professional_id == current_user.id))
    service = result.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Deletar imagem se existir
    if service.image_url:
        await image_storage.delete(service.image_url)

    await db.delete(service)
    await db.commit()


@router.post("/{service_id}/upload-image", response_model=ServiceResponse)
async def upload_service_image(
    service_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Faz upload de uma imagem para um serviço.
    Aceita: JPG, PNG, WEBP (máximo 5MB)
    """
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Apenas profissionais podem fazer upload")

    # Buscar serviço
    result = await db.execute(
        select(Service).filter(
            Service.id == service_id,
            Service.professional_id == current_user.id
        )
    )
    service = result.scalars().first()

    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    # Deletar imagem antiga se existir
    if service.image_url:
        await image_storage.delete(service.image_url)

    # Upload nova imagem
    try:
        image_url = await image_storage.upload(file, folder="services")
        service.image_url = image_url
        await db.commit()
        await db.refresh(service)
        return service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")


@router.delete("/{service_id}/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_image(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a imagem de um serviço"""
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Apenas profissionais podem deletar imagens")

    # Buscar serviço
    result = await db.execute(
        select(Service).filter(
            Service.id == service_id,
            Service.professional_id == current_user.id
        )
    )
    service = result.scalars().first()

    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    if not service.image_url:
        raise HTTPException(status_code=404, detail="Serviço não possui imagem")

    # Deletar imagem
    await image_storage.delete(service.image_url)
    service.image_url = None
    await db.commit()
