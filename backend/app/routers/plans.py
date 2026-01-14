from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import SubscriptionPlan, User, Service
from ..schemas import SubscriptionPlanResponse, ChangePlanRequest
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SubscriptionPlanResponse])
async def list_plans(
    db: AsyncSession = Depends(get_db)
):
    """Lista todos os planos ativos"""
    query = select(SubscriptionPlan).filter(SubscriptionPlan.is_active == True)
    result = await db.execute(query)
    plans = result.scalars().all()
    return plans

@router.get("/{slug}", response_model=SubscriptionPlanResponse)
async def get_plan(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Obtém detalhes de um plano específico"""
    query = select(SubscriptionPlan).filter(SubscriptionPlan.slug == slug)
    result = await db.execute(query)
    plan = result.scalars().first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    return plan

@router.get("/me/features")
async def get_my_plan_features(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna as features disponíveis no plano do usuário"""
    if not current_user.subscription_plan_id:
        return {
            "has_plan": False,
            "trial_expired": False,
            "needs_upgrade": True,
            "features": {}
        }

    # Carregar plano
    query = select(SubscriptionPlan).filter(SubscriptionPlan.id == current_user.subscription_plan_id)
    result = await db.execute(query)
    plan = result.scalars().first()

    # Verificar se trial expirou
    trial_expired = False
    days_left = None

    if current_user.trial_ends_at:
        now = datetime.now(current_user.trial_ends_at.tzinfo)
        if now > current_user.trial_ends_at:
            trial_expired = True
        else:
            days_left = (current_user.trial_ends_at - now).days

    return {
        "has_plan": True,
        "plan_slug": plan.slug,
        "plan_name": plan.name,
        "trial_expired": trial_expired,
        "trial_days_left": days_left,
        "trial_ends_at": current_user.trial_ends_at.isoformat() if current_user.trial_ends_at else None,
        "needs_upgrade": trial_expired and plan.slug == 'trial',
        "features": {
            "max_services": plan.max_services,
            "can_manage_schedule": plan.can_manage_schedule,
            "can_receive_bookings": plan.can_receive_bookings,
            "priority_in_search": plan.priority_in_search
        }
    }


@router.post("/me/change-plan")
async def change_plan(
    request: ChangePlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Altera o plano do usuário (upgrade ou downgrade)"""
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem ter planos"
        )

    # Buscar novo plano
    query = select(SubscriptionPlan).filter(
        SubscriptionPlan.slug == request.new_plan_slug
    )
    result = await db.execute(query)
    new_plan = result.scalars().first()

    if not new_plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    # Não pode voltar para trial
    if new_plan.slug == 'trial' and current_user.subscription_plan_id:
        raise HTTPException(
            status_code=403,
            detail="Não é possível voltar para o plano Trial"
        )

    # Verificar se tem serviços excedentes
    if new_plan.max_services is not None:
        query = select(Service).filter(
            Service.professional_id == current_user.id
        )
        result = await db.execute(query)
        services = result.scalars().all()

        if len(services) > new_plan.max_services:
            return {
                "success": False,
                "error": "services_exceeded",
                "message": f"Você tem {len(services)} serviços cadastrados. O plano {new_plan.name} permite apenas {new_plan.max_services}.",
                "current_services": [
                    {"id": s.id, "title": s.title} for s in services
                ],
                "max_allowed": new_plan.max_services
            }

    # Aplicar mudança
    current_user.subscription_plan_id = new_plan.id
    current_user.subscription_started_at = datetime.now()
    current_user.trial_ends_at = None  # Limpar trial
    current_user.subscription_status = 'active'

    await db.commit()
    await db.refresh(current_user)

    return {
        "success": True,
        "plan": {
            "id": new_plan.id,
            "name": new_plan.name,
            "slug": new_plan.slug,
            "price": new_plan.price
        },
        "message": f"Plano alterado para {new_plan.name} com sucesso!"
    }


@router.post("/me/remove-excess-services")
async def remove_excess_services(
    keep_service_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove serviços excedentes ao fazer downgrade"""
    if not current_user.subscription_plan_id:
        raise HTTPException(
            status_code=400,
            detail="Você precisa ter um plano ativo"
        )

    # Carregar plano
    query = select(SubscriptionPlan).filter(
        SubscriptionPlan.id == current_user.subscription_plan_id
    )
    result = await db.execute(query)
    plan = result.scalars().first()

    if not plan or not plan.max_services:
        raise HTTPException(
            status_code=400,
            detail="Operação inválida para seu plano"
        )

    if len(keep_service_ids) > plan.max_services:
        raise HTTPException(
            status_code=400,
            detail=f"Você só pode manter {plan.max_services} serviço(s)"
        )

    # Deletar serviços não selecionados
    query = select(Service).filter(
        Service.professional_id == current_user.id,
        Service.id.notin_(keep_service_ids)
    )
    result = await db.execute(query)
    services_to_delete = result.scalars().all()

    for service in services_to_delete:
        await db.delete(service)

    await db.commit()

    return {
        "success": True,
        "removed_count": len(services_to_delete),
        "message": f"{len(services_to_delete)} serviço(s) removido(s) com sucesso"
    }
