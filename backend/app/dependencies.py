from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from .database import get_db
from .models import User, SubscriptionPlan, Service
from .auth_utils import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Carregar usuário com subscription_plan eager loading
    result = await db.execute(
        select(User)
        .filter(User.email == email)
        .options(selectinload(User.subscription_plan))
    )
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


async def check_can_manage_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verifica se usuário pode gerenciar agenda"""
    if not current_user.subscription_plan_id:
        raise HTTPException(
            status_code=403,
            detail="Você precisa de um plano ativo para gerenciar sua agenda"
        )

    # Carregar plano se não estiver carregado
    if not current_user.subscription_plan:
        query = select(SubscriptionPlan).filter(
            SubscriptionPlan.id == current_user.subscription_plan_id
        )
        result = await db.execute(query)
        current_user.subscription_plan = result.scalars().first()

    if not current_user.subscription_plan.can_manage_schedule:
        raise HTTPException(
            status_code=403,
            detail="Seu plano não permite gerenciar agenda. Faça upgrade para Prata ou Ouro!"
        )

    # Verificar se trial expirou
    if current_user.trial_ends_at:
        now = datetime.now(current_user.trial_ends_at.tzinfo)
        if now > current_user.trial_ends_at:
            raise HTTPException(
                status_code=403,
                detail="Seu período de trial expirou. Escolha um plano!"
            )

    return current_user


async def check_can_create_service(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verifica se usuário pode criar mais serviços"""
    if not current_user.subscription_plan_id:
        raise HTTPException(
            status_code=403,
            detail="Você precisa de um plano ativo para cadastrar serviços"
        )

    # Carregar plano se não estiver carregado
    if not current_user.subscription_plan:
        query = select(SubscriptionPlan).filter(
            SubscriptionPlan.id == current_user.subscription_plan_id
        )
        result = await db.execute(query)
        current_user.subscription_plan = result.scalars().first()

    # Verificar limite de serviços
    if current_user.subscription_plan.max_services is not None:
        query = select(Service).filter(Service.professional_id == current_user.id)
        result = await db.execute(query)
        count = len(result.scalars().all())

        if count >= current_user.subscription_plan.max_services:
            raise HTTPException(
                status_code=403,
                detail=f"Limite de {current_user.subscription_plan.max_services} serviço(s) atingido. Faça upgrade!"
            )

    # Verificar se trial expirou
    if current_user.trial_ends_at:
        now = datetime.now(current_user.trial_ends_at.tzinfo)
        if now > current_user.trial_ends_at:
            raise HTTPException(
                status_code=403,
                detail="Seu período de trial expirou. Escolha um plano!"
            )

    return current_user
