# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from datetime import date, timedelta, datetime
from pydantic import BaseModel
from passlib.context import CryptContext
from ..database import get_db
from ..models import User, Subscription, Appointment, SubscriptionPlan, Category
from ..dependencies import get_current_user
from ..config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/dashboard")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard administrativo com métricas da plataforma
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    # Total de profissionais cadastrados
    result = await db.execute(
        select(func.count(User.id)).where(User.is_professional == True)
    )
    total_professionals = result.scalar()

    # Total de clientes cadastrados
    result = await db.execute(
        select(func.count(User.id)).where(User.is_professional == False, User.is_admin == False)
    )
    total_clients = result.scalar()

    # Profissionais por status de assinatura
    result = await db.execute(
        select(User.subscription_status, func.count(User.id))
        .where(User.is_professional == True)
        .group_by(User.subscription_status)
    )
    subscription_stats = {status: count for status, count in result.all()}

    # Faturamento mensal (profissionais ativos * R$ 50)
    active_professionals = subscription_stats.get('active', 0)
    monthly_revenue = active_professionals * 50.00

    # Faturamento anual projetado
    annual_revenue = monthly_revenue * 12

    # Profissionais por estado
    result = await db.execute(
        select(User.state, func.count(User.id))
        .where(User.is_professional == True, User.state.isnot(None))
        .group_by(User.state)
    )
    professionals_by_state = [{"state": state, "count": count} for state, count in result.all()]

    # Profissionais ativos por estado (com assinatura ativa)
    result = await db.execute(
        select(User.state, func.count(User.id))
        .where(
            and_(
                User.is_professional == True,
                User.subscription_status == 'active',
                User.state.isnot(None)
            )
        )
        .group_by(User.state)
    )
    active_professionals_by_state = [{"state": state, "count": count} for state, count in result.all()]

    # Agendamentos do mês atual
    current_month = date.today().month
    current_year = date.today().year
    result = await db.execute(
        select(func.count(Appointment.id))
        .where(
            and_(
                extract('month', Appointment.date) == current_month,
                extract('year', Appointment.date) == current_year
            )
        )
    )
    appointments_this_month = result.scalar()

    # Último agendamento realizado na plataforma
    result = await db.execute(
        select(Appointment)
        .where(Appointment.status == "scheduled", Appointment.is_manual_block == False)
        .order_by(Appointment.created_at.desc())
        .limit(1)
    )
    last_appointment = result.scalar_one_or_none()

    # Novos assinantes do mês atual
    result = await db.execute(
        select(func.count(Subscription.id))
        .where(
            and_(
                extract('month', Subscription.created_at) == current_month,
                extract('year', Subscription.created_at) == current_year
            )
        )
    )
    new_subscribers_this_month = result.scalar()

    # Cancelamentos do mês atual
    result = await db.execute(
        select(func.count(Subscription.id))
        .where(
            and_(
                Subscription.status == 'cancelled',
                Subscription.cancelled_at.isnot(None),
                extract('month', Subscription.cancelled_at) == current_month,
                extract('year', Subscription.cancelled_at) == current_year
            )
        )
    )
    cancellations_this_month = result.scalar()

    # Faturamento diário (média por dia)
    daily_revenue = round(active_professionals * (50.00 / 30), 2)

    # Faturamento semanal (média por semana)
    weekly_revenue = round(active_professionals * (50.00 / 4.33), 2)

    # Profissionais mais recentes (últimos 10)
    result = await db.execute(
        select(User)
        .where(User.is_professional == True)
        .order_by(User.created_at.desc())
        .limit(10)
    )
    recent_professionals = result.scalars().all()

    return {
        "summary": {
            "total_professionals": total_professionals,
            "total_clients": total_clients,
            "active_professionals": subscription_stats.get('active', 0),
            "inactive_professionals": subscription_stats.get('inactive', 0),
            "cancelled_professionals": subscription_stats.get('cancelled', 0),
            "suspended_professionals": subscription_stats.get('suspended', 0),
            "appointments_this_month": appointments_this_month,
            "new_subscribers_this_month": new_subscribers_this_month,
            "cancellations_this_month": cancellations_this_month
        },
        "revenue": {
            "daily": daily_revenue,
            "weekly": weekly_revenue,
            "monthly": monthly_revenue,
            "annual_projected": annual_revenue,
            "per_professional": 50.00
        },
        "last_appointment": {
            "date": last_appointment.date.isoformat() if last_appointment else None,
            "start_time": last_appointment.start_time.strftime("%H:%M") if last_appointment else None,
            "created_at": last_appointment.created_at.isoformat() if last_appointment else None,
        } if last_appointment else None,
        "subscription_stats": subscription_stats,
        "professionals_by_state": professionals_by_state,
        "active_professionals_by_state": active_professionals_by_state,
        "recent_professionals": [
            {
                "id": prof.id,
                "name": prof.name,
                "email": prof.email,
                "category": prof.category,
                "city": prof.city,
                "state": prof.state,
                "subscription_status": prof.subscription_status,
                "created_at": prof.created_at.isoformat()
            }
            for prof in recent_professionals
        ]
    }

@router.get("/professionals")
async def list_all_professionals(
    status: str = None,
    state: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos os profissionais com filtros opcionais
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    query = select(User).where(User.is_professional == True)

    if status:
        query = query.where(User.subscription_status == status)
    if state:
        query = query.where(User.state == state)

    query = query.order_by(User.created_at.desc())

    result = await db.execute(query)
    professionals = result.scalars().all()

    return {
        "professionals": [
            {
                "id": prof.id,
                "name": prof.name,
                "email": prof.email,
                "category": prof.category,
                "city": prof.city,
                "state": prof.state,
                "whatsapp": prof.whatsapp,
                "subscription_status": prof.subscription_status,
                "is_suspended": prof.is_suspended,
                "created_at": prof.created_at.isoformat()
            }
            for prof in professionals
        ],
        "total": len(professionals)
    }

@router.get("/clients")
async def list_all_clients(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos os clientes
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    result = await db.execute(
        select(User)
        .where(User.is_professional == False, User.is_admin == False)
        .order_by(User.created_at.desc())
    )
    clients = result.scalars().all()

    return {
        "clients": [
            {
                "id": client.id,
                "name": client.name,
                "email": client.email,
                "city": client.city,
                "state": client.state,
                "created_at": client.created_at.isoformat()
            }
            for client in clients
        ],
        "total": len(clients)
    }

@router.post("/professionals/{professional_id}/suspend")
async def suspend_professional(
    professional_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspende um profissional"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    result = await db.execute(
        select(User).where(User.id == professional_id, User.is_professional == True)
    )
    professional = result.scalar_one_or_none()

    if not professional:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")

    professional.is_suspended = True
    professional.subscription_status = "suspended"
    await db.commit()

    return {"message": f"Profissional {professional.name} suspenso com sucesso"}

@router.post("/professionals/{professional_id}/reactivate")
async def reactivate_professional(
    professional_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reativa um profissional suspenso"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    result = await db.execute(
        select(User).where(User.id == professional_id, User.is_professional == True)
    )
    professional = result.scalar_one_or_none()

    if not professional:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")

    professional.is_suspended = False
    professional.subscription_status = "active"
    await db.commit()

    return {"message": f"Profissional {professional.name} reativado com sucesso"}

@router.get("/subscriptions")
async def list_all_subscriptions(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas as assinaturas com informações dos profissionais
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    try:
        from sqlalchemy.orm import selectinload

        query = select(Subscription).options(
            selectinload(Subscription.professional)
        )

        if status:
            query = query.where(Subscription.status == status)

        query = query.order_by(Subscription.created_at.desc())

        result = await db.execute(query)
        subscriptions = result.scalars().all()

        return {
            "subscriptions": [
                {
                    "id": sub.id,
                    "professional_id": sub.professional_id,
                    "professional_name": sub.professional.name if sub.professional else None,
                    "professional_email": sub.professional.email if sub.professional else None,
                    "professional_category": sub.professional.category if sub.professional else None,
                    "professional_city": sub.professional.city if sub.professional else None,
                    "professional_state": sub.professional.state if sub.professional else None,
                    "plan_amount": sub.plan_amount,
                    "status": sub.status,
                    "next_billing_date": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
                    "last_payment_date": sub.last_payment_date.isoformat() if sub.last_payment_date else None,
                    "cancelled_at": sub.cancelled_at.isoformat() if sub.cancelled_at else None,
                    "created_at": sub.created_at.isoformat(),
                    "mercadopago_subscription_id": sub.mercadopago_subscription_id
                }
                for sub in subscriptions
            ],
            "total": len(subscriptions)
        }
    except Exception as e:
        # Retorna lista vazia em caso de erro (ex: tabela não existe no banco local)
        return {
            "subscriptions": [],
            "total": 0,
            "error": str(e)
        }

@router.get("/trial-users")
async def get_trial_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos os usuários com plano trial
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    # Buscar plano trial
    trial_plan_query = select(SubscriptionPlan).filter(SubscriptionPlan.slug == 'trial')
    trial_plan_result = await db.execute(trial_plan_query)
    trial_plan = trial_plan_result.scalars().first()

    if not trial_plan:
        return {"users": [], "total": 0}

    # Buscar usuários com plano trial
    query = select(User).filter(
        User.subscription_plan_id == trial_plan.id,
        User.is_professional == True
    ).order_by(User.trial_ends_at.desc())

    result = await db.execute(query)
    trial_users = result.scalars().all()

    return {
        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "trial_ends_at": user.trial_ends_at.isoformat() if user.trial_ends_at else None,
                "created_at": user.created_at.isoformat(),
                "subscription_status": user.subscription_status
            }
            for user in trial_users
        ],
        "total": len(trial_users)
    }

class ExtendTrialRequest(BaseModel):
    user_id: int
    new_trial_end_date: str  # ISO format: "2026-02-15T23:59:59"

@router.post("/extend-trial")
async def extend_trial(
    request: ExtendTrialRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permite que administradores estendam ou alterem a data de expiração do trial de um usuário.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    # Buscar usuário
    result = await db.execute(select(User).filter(User.id == request.user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not user.is_professional:
        raise HTTPException(status_code=400, detail="Apenas profissionais podem ter trial")

    # Validar e converter data
    try:
        new_end_date = datetime.fromisoformat(request.new_trial_end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido. Use ISO format: YYYY-MM-DDTHH:MM:SS")

    # Atualizar data de expiração
    user.trial_ends_at = new_end_date

    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "user_id": user.id,
        "user_name": user.name,
        "user_email": user.email,
        "trial_ends_at": user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        "message": f"Data de expiração do trial atualizada para {user.trial_ends_at.strftime('%d/%m/%Y %H:%M:%S')}"
    }


# =============================================================================
# ENDPOINTS DE SETUP (Protegidos por chave secreta)
# =============================================================================

class SetupRequest(BaseModel):
    secret_key: str


class CreateAdminRequest(BaseModel):
    secret_key: str
    email: str
    password: str
    name: str = "Administrador"


@router.post("/setup/update-trial-days")
async def setup_update_trial_days(
    request: SetupRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza o plano Trial para 30 dias.
    Requer chave secreta JWT para execução.
    """
    # Validar chave secreta
    if request.secret_key != settings.SECRET_KEY:
        raise HTTPException(status_code=403, detail="Chave secreta inválida")

    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.slug == "trial")
    )
    trial_plan = result.scalar_one_or_none()

    if not trial_plan:
        raise HTTPException(status_code=404, detail="Plano Trial não encontrado")

    old_value = trial_plan.trial_days
    trial_plan.trial_days = 30
    await db.commit()

    return {
        "success": True,
        "message": f"Plano Trial atualizado de {old_value} para 30 dias",
        "plan": {
            "id": trial_plan.id,
            "name": trial_plan.name,
            "slug": trial_plan.slug,
            "trial_days": trial_plan.trial_days
        }
    }


@router.post("/setup/create-admin")
async def setup_create_admin(
    request: CreateAdminRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Cria um usuário administrador.
    Requer chave secreta JWT para execução.
    """
    # Validar chave secreta
    if request.secret_key != settings.SECRET_KEY:
        raise HTTPException(status_code=403, detail="Chave secreta inválida")

    # Verificar se já existe
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        if existing_user.is_admin:
            return {
                "success": True,
                "message": f"Usuário {request.email} já existe e é administrador",
                "user_id": existing_user.id,
                "already_existed": True
            }
        else:
            # Promover para admin
            existing_user.is_admin = True
            await db.commit()
            return {
                "success": True,
                "message": f"Usuário {request.email} promovido para administrador",
                "user_id": existing_user.id,
                "promoted": True
            }

    # Criar novo admin
    hashed_password = pwd_context.hash(request.password)

    admin = User(
        name=request.name,
        email=request.email,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=True,
        is_professional=False
    )

    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    return {
        "success": True,
        "message": f"Administrador criado com sucesso",
        "user_id": admin.id,
        "email": admin.email,
        "created": True
    }


@router.get("/setup/check-plans")
async def setup_check_plans(
    db: AsyncSession = Depends(get_db)
):
    """
    Verifica os planos de assinatura configurados.
    Endpoint público para verificação.
    """
    result = await db.execute(select(SubscriptionPlan))
    plans = result.scalars().all()

    return {
        "plans": [
            {
                "id": plan.id,
                "name": plan.name,
                "slug": plan.slug,
                "price": plan.price,
                "trial_days": plan.trial_days,
                "max_services": plan.max_services,
                "is_active": plan.is_active
            }
            for plan in plans
        ],
        "total": len(plans)
    }


class ChangePasswordRequest(BaseModel):
    new_password: str


@router.post("/change-password")
async def change_admin_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Altera a senha do administrador logado.
    Requer autenticação como admin.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="A senha deve ter pelo menos 8 caracteres")

    try:
        # Buscar o usuário novamente para garantir que está na sessão atual
        result = await db.execute(
            select(User).where(User.id == current_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Alterar senha
        user.hashed_password = pwd_context.hash(request.new_password)
        await db.commit()

        return {
            "success": True,
            "message": "Senha alterada com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao alterar senha: {str(e)}")


class ChangeAdminPasswordRequest(BaseModel):
    secret_key: str
    email: str
    new_password: str


@router.post("/setup/change-admin-password")
async def setup_change_admin_password(
    request: ChangeAdminPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Altera a senha de um administrador.
    Requer chave secreta JWT para execução.
    """
    # Validar chave secreta
    if request.secret_key != settings.SECRET_KEY:
        raise HTTPException(status_code=403, detail="Chave secreta inválida")

    # Buscar usuário
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Usuário não é administrador")

    # Alterar senha
    user.hashed_password = pwd_context.hash(request.new_password)
    await db.commit()

    return {
        "success": True,
        "message": f"Senha do administrador {request.email} alterada com sucesso",
        "user_id": user.id
    }


# ============================================
# CRUD de Categorias
# ============================================

class CategoryCreate(BaseModel):
    name: str
    slug: str
    group: str
    image_url: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    group: str | None = None
    image_url: str | None = None


@router.get("/categories")
async def list_admin_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas as categorias para o admin gerenciar.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    try:
        result = await db.execute(
            select(Category).order_by(Category.group, Category.name)
        )
        categories = result.scalars().all()

        # Agrupar por grupo
        grouped = {}
        for cat in categories:
            if cat.group not in grouped:
                grouped[cat.group] = []
            grouped[cat.group].append({
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "group": cat.group,
                "image_url": cat.image_url
            })

        # Lista de grupos únicos para o select
        groups = list(grouped.keys())

        return {
            "categories": [
                {
                    "id": cat.id,
                    "name": cat.name,
                    "slug": cat.slug,
                    "group": cat.group,
                    "image_url": cat.image_url
                }
                for cat in categories
            ],
            "grouped": grouped,
            "groups": groups,
            "total": len(categories)
        }
    except Exception as e:
        # Log do erro para debug
        print(f"Erro ao listar categorias: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar categorias: {str(e)}")


@router.post("/categories")
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma nova categoria.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    # Verificar se slug já existe
    result = await db.execute(
        select(Category).where(Category.slug == category.slug)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Já existe uma categoria com esse slug")

    new_category = Category(
        name=category.name,
        slug=category.slug,
        group=category.group,
        image_url=category.image_url
    )

    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)

    return {
        "success": True,
        "message": "Categoria criada com sucesso",
        "category": {
            "id": new_category.id,
            "name": new_category.name,
            "slug": new_category.slug,
            "group": new_category.group,
            "image_url": new_category.image_url
        }
    }


@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza uma categoria existente.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    existing = result.scalar_one_or_none()

    if not existing:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    # Verificar se novo slug já existe (se estiver sendo alterado)
    if category.slug and category.slug != existing.slug:
        result = await db.execute(
            select(Category).where(Category.slug == category.slug)
        )
        slug_exists = result.scalar_one_or_none()
        if slug_exists:
            raise HTTPException(status_code=400, detail="Já existe uma categoria com esse slug")

    # Atualizar campos
    if category.name is not None:
        existing.name = category.name
    if category.slug is not None:
        existing.slug = category.slug
    if category.group is not None:
        existing.group = category.group
    if category.image_url is not None:
        existing.image_url = category.image_url

    await db.commit()
    await db.refresh(existing)

    return {
        "success": True,
        "message": "Categoria atualizada com sucesso",
        "category": {
            "id": existing.id,
            "name": existing.name,
            "slug": existing.slug,
            "group": existing.group,
            "image_url": existing.image_url
        }
    }


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove uma categoria.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem acessar")

    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    existing = result.scalar_one_or_none()

    if not existing:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    # Verificar se há profissionais usando esta categoria
    result = await db.execute(
        select(func.count(User.id)).where(User.category == existing.slug)
    )
    count = result.scalar()

    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Não é possível excluir. {count} profissional(is) estão usando esta categoria."
        )

    await db.delete(existing)
    await db.commit()

    return {
        "success": True,
        "message": "Categoria excluída com sucesso"
    }
