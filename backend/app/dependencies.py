from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from sqlalchemy import func, extract
from .database import get_db
from .models import User, SubscriptionPlan, Service, Appointment
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
        token_iat: int | None = payload.get("iat")
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

    # Rejeitar tokens emitidos antes ou no mesmo instante da ultima troca de senha
    if user.password_changed_at and token_iat is not None:
        changed_ts = int(user.password_changed_at.timestamp())
        if token_iat <= changed_ts:
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
            detail="Seu plano não permite gerenciar agenda. Faça upgrade!"
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

    return current_user


async def check_appointment_limit(
    professional_id: int,
    db: AsyncSession
):
    """Verifica se o profissional atingiu o limite de agendamentos do mês (plano Free)"""
    # Buscar profissional com plano carregado
    result = await db.execute(
        select(User)
        .filter(User.id == professional_id)
        .options(selectinload(User.subscription_plan))
    )
    professional = result.scalars().first()

    if not professional or not professional.subscription_plan:
        return

    limit = professional.subscription_plan.max_appointments_per_month
    if limit is None:
        return  # Sem limite

    # Contar agendamentos do mês corrente para este profissional
    now = datetime.now()
    count_result = await db.execute(
        select(func.count()).select_from(Appointment).filter(
            Appointment.professional_id == professional_id,
            Appointment.status != "cancelled",
            extract('year', Appointment.created_at) == now.year,
            extract('month', Appointment.created_at) == now.month,
        )
    )
    count = count_result.scalar() or 0

    if count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Este profissional atingiu o limite de {limit} agendamentos/mês no plano Free."
        )
