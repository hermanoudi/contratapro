from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, SubscriptionPlan
from ..schemas import UserCreate, UserResponse, ProfessionalPublic, UserUpdate
from ..auth_utils import get_password_hash
from ..dependencies import get_current_user
from ..services.image_storage import image_storage

router = APIRouter()

@router.put("/me", response_model=UserResponse)
async def update_user(
    name: Optional[str] = Form(None),
    whatsapp: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    cep: Optional[str] = Form(None),
    street: Optional[str] = Form(None),
    number: Optional[str] = Form(None),
    complement: Optional[str] = Form(None),
    neighborhood: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza o perfil do usuário logado.
    Aceita FormData para permitir upload de foto de perfil.
    """
    # Atualizar campos de texto
    if name is not None:
        current_user.name = name
    if whatsapp is not None:
        current_user.whatsapp = whatsapp
    if category is not None:
        current_user.category = category
    if description is not None:
        current_user.description = description
    if cep is not None:
        current_user.cep = cep
    if street is not None:
        current_user.street = street
    if number is not None:
        current_user.number = number
    if complement is not None:
        current_user.complement = complement
    if neighborhood is not None:
        current_user.neighborhood = neighborhood
    if city is not None:
        current_user.city = city
    if state is not None:
        current_user.state = state

    # Upload de foto de perfil
    if profile_picture and profile_picture.filename:
        # Deletar foto antiga se existir
        if current_user.profile_picture:
            await image_storage.delete(current_user.profile_picture)

        # Fazer upload da nova foto
        image_url = await image_storage.upload(profile_picture, folder="profiles")
        current_user.profile_picture = image_url

    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload de foto de perfil do usuário.
    A foto antiga é deletada se existir.
    """
    # Deletar foto antiga se existir
    if current_user.profile_picture:
        await image_storage.delete(current_user.profile_picture)

    # Fazer upload da nova foto na pasta "profiles"
    image_url = await image_storage.upload(file, folder="profiles")

    # Atualizar usuário
    current_user.profile_picture = image_url
    await db.commit()
    await db.refresh(current_user)

    return {"profile_picture": image_url, "message": "Foto de perfil atualizada com sucesso!"}

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).filter(User.email == user.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Se for profissional, buscar plano Trial
    trial_plan_id = None
    trial_ends_at = None
    if user.is_professional:
        trial_query = select(SubscriptionPlan).filter(SubscriptionPlan.slug == 'trial')
        trial_result = await db.execute(trial_query)
        trial_plan = trial_result.scalars().first()

        if trial_plan:
            trial_plan_id = trial_plan.id
            # Usar trial_days do plano ou padrão de 30 dias
            trial_duration = trial_plan.trial_days if trial_plan.trial_days else 30
            trial_ends_at = datetime.now() + timedelta(days=trial_duration)

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=get_password_hash(user.password.encode('utf-8')[:72].decode('utf-8', 'ignore')),
        is_professional=user.is_professional,
        cpf=user.cpf,
        cep=user.cep,
        street=user.street,
        number=user.number,
        complement=user.complement,
        neighborhood=user.neighborhood,
        city=user.city,
        state=user.state,
        whatsapp=user.whatsapp,
        category=user.category,
        description=user.description,
        subscription_plan_id=trial_plan_id,
        trial_ends_at=trial_ends_at,
        subscription_status='active' if trial_plan_id else None
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Recarregar usuário com subscription_plan eager loading para evitar MissingGreenlet
    if new_user.subscription_plan_id:
        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(User)
            .filter(User.id == new_user.id)
            .options(selectinload(User.subscription_plan))
        )
        new_user = result.scalars().first()

    return new_user

@router.post("/toggle-suspension")
async def toggle_suspension(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.is_suspended = not current_user.is_suspended
    await db.commit()
    await db.refresh(current_user)
    return {"is_suspended": current_user.is_suspended}

@router.get("/search", response_model=List[ProfessionalPublic])
async def search_professionals(
    category: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Busca profissionais disponíveis na plataforma.
    Apenas profissionais com assinatura ativa são exibidos.
    """
    from sqlalchemy.orm import selectinload
    query = select(User).filter(
        User.is_professional == True,
        User.is_suspended.is_not(True),
        User.subscription_status == 'active'  # Apenas profissionais com assinatura ativa
    ).options(
        selectinload(User.services),
        selectinload(User.working_hours),
        selectinload(User.subscription_plan)
    )

    if category:
        query = query.filter(User.category.ilike(f"%{category}%"))
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/search-by-service", response_model=List[ProfessionalPublic])
async def search_professionals_by_service(
    service: Optional[str] = None,
    cep: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Busca profissionais que oferecem um serviço específico.
    Busca pela categoria do profissional OU pelo título dos serviços cadastrados.
    Exemplos: "Barbeiro", "Corte de Cabelo", "Pintura de Paredes".
    Filtra por CEP/cidade do cliente.
    Apenas profissionais com assinatura ativa são exibidos.
    """
    from sqlalchemy.orm import selectinload
    from sqlalchemy import or_
    from ..models import Service

    # Query base: profissionais ativos com assinatura
    query = select(User).filter(
        User.is_professional == True,
        User.is_suspended.is_not(True),
        User.subscription_status == 'active'
    ).options(
        selectinload(User.services),
        selectinload(User.working_hours),
        selectinload(User.subscription_plan)  # Carregar dados do plano
    )

    # Filtrar por serviço (se fornecido)
    if service:
        # Buscar profissionais por categoria OU que tenham serviços com título similar
        # Subconsulta para IDs de profissionais que têm serviços com o título
        service_subquery = select(Service.professional_id).filter(
            Service.title.ilike(f"%{service}%")
        )

        query = query.filter(
            or_(
                User.category.ilike(f"%{service}%"),  # Busca na categoria do profissional
                User.id.in_(service_subquery)  # OU nos títulos dos serviços
            )
        )

    # Filtrar por cidade (se fornecida)
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    # Ordenar por prioridade do plano (Ouro aparece primeiro)
    from ..models import SubscriptionPlan
    query = query.join(
        SubscriptionPlan,
        User.subscription_plan_id == SubscriptionPlan.id,
        isouter=True
    ).order_by(SubscriptionPlan.priority_in_search.desc())

    result = await db.execute(query)
    professionals = result.scalars().all()

    return professionals

@router.get("/categories", response_model=List[str])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Retorna todas as categorias de serviços disponíveis.
    Busca da tabela Category (seeds) ao invés de usuários cadastrados.
    """
    from ..models import Category
    query = select(Category.slug).order_by(Category.group, Category.name)
    result = await db.execute(query)
    categories = result.scalars().all()
    return categories if categories else []

@router.get("/{user_id}/public", response_model=ProfessionalPublic)
async def get_professional_public(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retorna dados públicos de um profissional.
    Apenas profissionais com assinatura ativa podem ser visualizados.
    """
    from sqlalchemy.orm import selectinload
    query = select(User).filter(
        User.id == user_id,
        User.is_professional == True,
        User.subscription_status == 'active'  # Apenas profissionais com assinatura ativa
    ).options(
        selectinload(User.services),
        selectinload(User.working_hours),
        selectinload(User.subscription_plan)
    )
    result = await db.execute(query)
    pro = result.scalars().first()
    if not pro:
        raise HTTPException(
            status_code=404,
            detail="Profissional não encontrado ou sem assinatura ativa"
        )
    return pro
