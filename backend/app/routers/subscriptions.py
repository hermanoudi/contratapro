# backend/app/routers/subscriptions.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta, datetime
from pydantic import BaseModel
from typing import Optional
import mercadopago
import httpx
import logging

from ..database import get_db
from ..models import Subscription, SubscriptionPlan, User, Service
from ..dependencies import get_current_user
from ..config import settings
from ..services.notifications.notification_service import notification_service
from ..services.notifications.templates import email_templates

router = APIRouter()
logger = logging.getLogger(__name__)

# Inicializar SDK do Mercado Pago
sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)


class SubscriptionResponse(BaseModel):
    message: str
    init_point: str  # URL de checkout do Mercado Pago
    subscription_id: int


class CardTokenRequest(BaseModel):
    card_token_id: str
    payment_method_id: str


class CancelSubscriptionRequest(BaseModel):
    reason: str
    reason_code: Optional[str] = None  # Código do motivo para analytics


class ChangePlanRequest(BaseModel):
    new_plan_slug: str


class AdminForceTrialRequest(BaseModel):
    user_id: int
    reason: Optional[str] = None


class SubscribePlanResponse(BaseModel):
    message: str
    plan_name: str
    status: str
    trial_ends_at: Optional[str] = None
    init_point: Optional[str] = None  # URL do Mercado Pago (apenas para planos pagos)


@router.post("/subscribe/{plan_slug}", response_model=SubscribePlanResponse)
async def subscribe_to_plan(
    plan_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Assina um plano específico.

    - **trial**: Ativa imediatamente por 15 dias (gratuito)
    - **basic**: Redireciona para pagamento no Mercado Pago (R$ 29,90/mês)
    - **premium**: Redireciona para pagamento no Mercado Pago (R$ 49,90/mês)
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem assinar planos"
        )

    # Buscar o plano pelo slug
    result = await db.execute(
        select(SubscriptionPlan).where(
            SubscriptionPlan.slug == plan_slug,
            SubscriptionPlan.is_active == True
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail=f"Plano '{plan_slug}' não encontrado ou inativo"
        )

    # Verificar se já tem assinatura ativa
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    existing_subscription = result.scalar_one_or_none()

    # Verificar se já usou o trial
    if plan_slug == "trial" and existing_subscription:
        if existing_subscription.plan_id:
            # Buscar plano anterior
            result = await db.execute(
                select(SubscriptionPlan).where(
                    SubscriptionPlan.id == existing_subscription.plan_id
                )
            )
            previous_plan = result.scalar_one_or_none()
            if previous_plan and previous_plan.slug == "trial":
                raise HTTPException(
                    status_code=400,
                    detail="Você já utilizou o período de trial. Escolha um plano pago."
                )

    # Se já tem assinatura ativa (não cancelada/expirada), não pode criar outra
    if existing_subscription and existing_subscription.status in ["active", "pending"]:
        raise HTTPException(
            status_code=400,
            detail="Você já possui uma assinatura ativa"
        )

    # FLUXO TRIAL: Ativar imediatamente sem pagamento
    if plan.price == 0 or plan.slug == "trial":
        trial_days = plan.trial_days or 15
        trial_end_date = date.today() + timedelta(days=trial_days)

        if existing_subscription:
            # Reativar assinatura existente como trial
            existing_subscription.plan_id = plan.id
            existing_subscription.status = "active"
            existing_subscription.trial_ends_at = trial_end_date
            existing_subscription.plan_amount = 0.0
            existing_subscription.cancelled_at = None
            existing_subscription.cancellation_reason = None
            existing_subscription.mercadopago_preapproval_id = None
            existing_subscription.init_point = None
            subscription = existing_subscription
        else:
            # Criar nova assinatura trial
            subscription = Subscription(
                professional_id=current_user.id,
                plan_id=plan.id,
                status="active",
                trial_ends_at=trial_end_date,
                plan_amount=0.0
            )
            db.add(subscription)

        # Atualizar usuário
        current_user.subscription_status = "active"
        current_user.subscription_plan_id = plan.id
        current_user.trial_ends_at = datetime.combine(trial_end_date, datetime.min.time())
        current_user.subscription_started_at = datetime.now()

        await db.commit()
        await db.refresh(subscription)

        logger.info(f"Trial ativado para usuário {current_user.id}. Expira em: {trial_end_date}")

        # Enviar notificação por e-mail
        await notification_service.notify_subscription_activated(
            user_email=current_user.email,
            user_name=current_user.name,
            plan_name=plan.name,
            plan_price=0.0,
            is_trial=True,
            trial_days=trial_days,
            trial_end_date=trial_end_date.strftime("%d/%m/%Y")
        )

        return SubscribePlanResponse(
            message=f"Plano {plan.name} ativado com sucesso! Você tem {trial_days} dias de acesso gratuito.",
            plan_name=plan.name,
            status="active",
            trial_ends_at=trial_end_date.isoformat()
        )

    # FLUXO PAGO: Criar assinatura no Mercado Pago
    # Validar CPF obrigatório para planos pagos
    if not current_user.cpf:
        raise HTTPException(
            status_code=400,
            detail="CPF é obrigatório para assinar um plano pago. Atualize seu perfil com o CPF."
        )

    try:
        # Separar nome em first_name e last_name para o Mercado Pago
        name_parts = current_user.name.split(" ", 1) if current_user.name else ["Usuário", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        plan_data = {
            "reason": f"Plano {plan.name} - ContrataPro",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": plan.price,
                "currency_id": "BRL",
            },
            "payer_email": current_user.email,
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "external_reference": str(current_user.id),
        }

        # Adicionar informações do pagador para melhor qualidade de integração
        # Isso melhora a taxa de aprovação e habilita o checkout corretamente
        if current_user.cpf:
            plan_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        logger.info(f"Criando plano pago no MP: {plan_data}")

        async with httpx.AsyncClient() as client:
            plan_response = await client.post(
                "https://api.mercadopago.com/preapproval_plan",
                json=plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if plan_response.status_code not in [200, 201]:
            logger.error(f"Erro ao criar plano MP: {plan_response.status_code} - {plan_response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar plano no Mercado Pago"
            )

        mp_plan = plan_response.json()
        mp_plan_id = mp_plan["id"]
        mp_init_point = mp_plan.get("init_point")

        if not mp_init_point:
            raise HTTPException(
                status_code=500,
                detail="Erro: Mercado Pago não retornou URL de checkout"
            )

        # Criar/atualizar assinatura no banco como pending
        if existing_subscription:
            existing_subscription.plan_id = plan.id
            existing_subscription.status = "pending"
            existing_subscription.trial_ends_at = None
            existing_subscription.plan_amount = plan.price
            existing_subscription.mercadopago_preapproval_id = mp_plan_id
            existing_subscription.init_point = mp_init_point
            existing_subscription.cancelled_at = None
            existing_subscription.cancellation_reason = None
            subscription = existing_subscription
        else:
            subscription = Subscription(
                professional_id=current_user.id,
                plan_id=plan.id,
                status="pending",
                plan_amount=plan.price,
                mercadopago_preapproval_id=mp_plan_id,
                init_point=mp_init_point
            )
            db.add(subscription)

        # Atualizar usuário
        current_user.subscription_plan_id = plan.id
        current_user.subscription_status = "pending"

        await db.commit()
        await db.refresh(subscription)

        logger.info(f"Assinatura paga criada para usuário {current_user.id}. Init point: {mp_init_point}")

        return SubscribePlanResponse(
            message=f"Plano {plan.name} selecionado. Complete o pagamento para ativar.",
            plan_name=plan.name,
            status="pending",
            init_point=mp_init_point
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar assinatura paga: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar assinatura: {str(e)}"
        )


@router.get("/plans")
async def list_subscription_plans(db: AsyncSession = Depends(get_db)):
    """
    Lista todos os planos de assinatura disponíveis.
    Não requer autenticação.
    """
    result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)
    )
    plans = result.scalars().all()

    return {
        "plans": [
            {
                "id": plan.id,
                "name": plan.name,
                "slug": plan.slug,
                "price": plan.price,
                "max_services": plan.max_services,
                "can_manage_schedule": plan.can_manage_schedule,
                "can_receive_bookings": plan.can_receive_bookings,
                "priority_in_search": plan.priority_in_search,
                "trial_days": plan.trial_days,
                "is_free": plan.price == 0
            }
            for plan in plans
        ]
    }


@router.post("/create", response_model=SubscriptionResponse)
async def create_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma assinatura e retorna URL de checkout do Mercado Pago
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem criar assinaturas"
        )

    # Verificar se já tem assinatura
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    existing_subscription = result.scalar_one_or_none()

    if existing_subscription:
        # Se já existe mas está cancelada, pode reativar
        if existing_subscription.status == "cancelled":
            pass  # Continua para criar nova assinatura
        else:
            raise HTTPException(
                status_code=400,
                detail="Profissional já possui assinatura ativa"
            )

    # Criar preferência de assinatura no Mercado Pago
    try:
        # Separar nome em first_name e last_name para o Mercado Pago
        name_parts = current_user.name.split(" ", 1) if current_user.name else ["Usuário", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        # PASSO 1: Criar plano de assinatura (preapproval_plan) usando API REST diretamente
        plan_data = {
            "reason": "Plano Mensal - ContrataPro",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
            },
            "payer_email": current_user.email,
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "external_reference": str(current_user.id),
        }

        # Adicionar informações do pagador para melhor qualidade de integração
        if current_user.cpf:
            plan_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        logger.info(f"Criando plano de assinatura: {plan_data}")

        # Fazer chamada HTTP direta para criar o plano
        async with httpx.AsyncClient() as client:
            plan_response = await client.post(
                "https://api.mercadopago.com/preapproval_plan",
                json=plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if plan_response.status_code not in [200, 201]:
            logger.error(f"Erro ao criar plano MP: {plan_response.status_code} - {plan_response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar plano de assinatura no Mercado Pago: {plan_response.text}"
            )

        plan = plan_response.json()
        plan_id = plan["id"]
        plan_init_point = plan.get("init_point")
        logger.info(f"Plano criado com sucesso. ID: {plan_id}, init_point: {plan_init_point}")

        # Usar o init_point do plano para redirecionar ao checkout
        # O usuário criará a assinatura ao completar o pagamento
        if not plan_init_point:
            logger.error(f"Plano criado mas sem init_point: {plan}")
            raise HTTPException(
                status_code=500,
                detail="Plano criado mas sem URL de checkout"
            )

        # Criar ou atualizar assinatura no banco
        if existing_subscription and existing_subscription.status == "cancelled":
            # Reativar assinatura existente
            existing_subscription.mercadopago_preapproval_id = plan_id  # Salvar ID do plano
            existing_subscription.init_point = plan_init_point
            existing_subscription.status = "pending"
            existing_subscription.cancelled_at = None
            subscription = existing_subscription
        else:
            # Criar nova assinatura
            subscription = Subscription(
                professional_id=current_user.id,
                mercadopago_preapproval_id=plan_id,  # Salvar ID do plano
                init_point=plan_init_point,
                plan_amount=settings.SUBSCRIPTION_AMOUNT,
                status="pending"
            )
            db.add(subscription)

        await db.commit()
        await db.refresh(subscription)

        return SubscriptionResponse(
            message="Link de pagamento gerado com sucesso",
            init_point=plan_init_point,
            subscription_id=subscription.id
        )

    except Exception as e:
        logger.error(f"Erro ao criar assinatura: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar assinatura: {str(e)}"
        )


@router.post("/create-with-card")
async def create_subscription_with_card(
    card_data: CardTokenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma assinatura usando card_token_id gerado no frontend
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem criar assinaturas"
        )

    # Verificar se já tem assinatura ativa
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    existing_subscription = result.scalar_one_or_none()

    if existing_subscription and existing_subscription.status not in ["cancelled", "pending"]:
        raise HTTPException(
            status_code=400,
            detail="Profissional já possui assinatura ativa"
        )

    try:
        # Separar nome em first_name e last_name para o Mercado Pago
        name_parts = current_user.name.split(" ", 1) if current_user.name else ["Usuário", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        # PASSO 1: Criar plano de assinatura
        plan_data = {
            "reason": "Plano Mensal - ContrataPro",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
            },
            "payer_email": current_user.email,
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "external_reference": str(current_user.id),
        }

        # Adicionar informações do pagador para melhor qualidade de integração
        if current_user.cpf:
            plan_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        logger.info(f"Criando plano de assinatura: {plan_data}")

        async with httpx.AsyncClient() as client:
            plan_response = await client.post(
                "https://api.mercadopago.com/preapproval_plan",
                json=plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if plan_response.status_code not in [200, 201]:
            logger.error(f"Erro ao criar plano MP: {plan_response.status_code} - {plan_response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar plano: {plan_response.text}"
            )

        plan = plan_response.json()
        plan_id = plan["id"]
        logger.info(f"Plano criado: {plan_id}")

        # PASSO 2: Criar assinatura (preapproval) com o card_token_id
        preapproval_data = {
            "preapproval_plan_id": plan_id,
            "reason": "Plano Mensal - ContrataPro",
            "payer_email": current_user.email,
            "card_token_id": card_data.card_token_id,
            "status": "authorized",
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "external_reference": str(current_user.id),
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
            }
        }

        # Adicionar informações do pagador
        if current_user.cpf:
            preapproval_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        logger.info(f"Criando assinatura com card_token: {preapproval_data}")

        async with httpx.AsyncClient() as client:
            preapproval_response = await client.post(
                "https://api.mercadopago.com/preapproval",
                json=preapproval_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if preapproval_response.status_code not in [200, 201]:
            logger.error(f"Erro ao criar preapproval: {preapproval_response.status_code} - {preapproval_response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar assinatura: {preapproval_response.text}"
            )

        preapproval = preapproval_response.json()
        preapproval_id = preapproval["id"]
        preapproval_status = preapproval.get("status")

        logger.info(f"Assinatura criada: {preapproval_id}, status: {preapproval_status}")

        # PASSO 3: Salvar no banco de dados
        if existing_subscription:
            existing_subscription.mercadopago_preapproval_id = preapproval_id
            existing_subscription.status = "active" if preapproval_status == "authorized" else "pending"
            existing_subscription.plan_amount = settings.SUBSCRIPTION_AMOUNT
            existing_subscription.last_payment_date = date.today()
            existing_subscription.next_billing_date = date.today() + timedelta(days=30)
            existing_subscription.cancelled_at = None
            subscription = existing_subscription
        else:
            subscription = Subscription(
                professional_id=current_user.id,
                mercadopago_preapproval_id=preapproval_id,
                plan_amount=settings.SUBSCRIPTION_AMOUNT,
                status="active" if preapproval_status == "authorized" else "pending",
                last_payment_date=date.today(),
                next_billing_date=date.today() + timedelta(days=30)
            )
            db.add(subscription)

        # Atualizar status do usuário
        current_user.subscription_status = "active" if preapproval_status == "authorized" else "pending"

        await db.commit()
        await db.refresh(subscription)

        return {
            "message": "Assinatura criada com sucesso!",
            "subscription_id": subscription.id,
            "status": subscription.status,
            "preapproval_id": preapproval_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar assinatura: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar assinatura: {str(e)}"
        )


@router.get("/my-subscription")
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna a assinatura do profissional logado"""
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais têm assinaturas"
        )

    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        return {
            "subscription": None,
            "message": "Nenhuma assinatura encontrada"
        }

    # Buscar informações do plano
    plan_info = None
    is_trial = False
    trial_days_remaining = None

    if subscription.plan_id:
        result = await db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.id == subscription.plan_id
            )
        )
        plan = result.scalar_one_or_none()
        if plan:
            is_trial = plan.slug == "trial"
            plan_info = {
                "id": plan.id,
                "name": plan.name,
                "slug": plan.slug,
                "price": plan.price,
                "max_services": plan.max_services
            }

    # Calcular dias restantes do trial
    if subscription.trial_ends_at:
        days_remaining = (subscription.trial_ends_at - date.today()).days
        trial_days_remaining = max(0, days_remaining)

    # Buscar informacoes do plano agendado (para downgrade)
    scheduled_plan_info = None
    if subscription.scheduled_plan_id:
        result = await db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.id == subscription.scheduled_plan_id
            )
        )
        scheduled_plan = result.scalar_one_or_none()
        if scheduled_plan:
            scheduled_plan_info = {
                "id": scheduled_plan.id,
                "name": scheduled_plan.name,
                "slug": scheduled_plan.slug,
                "price": scheduled_plan.price
            }

    return {
        "subscription": {
            "id": subscription.id,
            "status": subscription.status,
            "plan_amount": subscription.plan_amount,
            "plan": plan_info,
            "is_trial": is_trial,
            "trial_ends_at": (
                str(subscription.trial_ends_at)
                if subscription.trial_ends_at else None
            ),
            "trial_days_remaining": trial_days_remaining,
            "next_billing_date": (
                str(subscription.next_billing_date)
                if subscription.next_billing_date else None
            ),
            "last_payment_date": (
                str(subscription.last_payment_date)
                if subscription.last_payment_date else None
            ),
            "cancelled_at": (
                subscription.cancelled_at.isoformat()
                if subscription.cancelled_at else None
            ),
            "cancellation_reason": subscription.cancellation_reason,
            "created_at": subscription.created_at.isoformat(),
            "init_point": subscription.init_point,
            # Mudancas agendadas
            "scheduled_cancellation_date": (
                str(subscription.scheduled_cancellation_date)
                if subscription.scheduled_cancellation_date else None
            ),
            "scheduled_plan": scheduled_plan_info,
            "scheduled_plan_change_date": (
                str(subscription.scheduled_plan_change_date)
                if subscription.scheduled_plan_change_date else None
            ),
            "scheduled_plan_id": subscription.scheduled_plan_id
        }
    }


@router.post("/cancel")
async def cancel_subscription(
    cancel_data: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancela a assinatura do profissional.

    Para planos pagos: agenda o cancelamento para o dia do vencimento.
    O usuario pode continuar usando ate essa data.

    Para trials: cancela imediatamente.
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem cancelar assinaturas"
        )

    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Assinatura nao encontrada"
        )

    if subscription.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Assinatura ja esta cancelada"
        )

    # Verificar se ja tem cancelamento agendado
    if subscription.scheduled_cancellation_date:
        raise HTTPException(
            status_code=400,
            detail=f"Cancelamento ja agendado para {subscription.scheduled_cancellation_date.strftime('%d/%m/%Y')}"
        )

    # Buscar plano para verificar se e trial ou pago
    plan = None
    plan_name = "Plano Profissional"
    if subscription.plan_id:
        plan_result = await db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.id == subscription.plan_id
            )
        )
        plan = plan_result.scalar_one_or_none()
        if plan:
            plan_name = plan.name

    is_trial = (
        subscription.trial_ends_at is not None or
        (plan and plan.price == 0) or
        subscription.plan_amount == 0
    )

    # Cancelar no Mercado Pago (para parar a recorrencia)
    try:
        if subscription.mercadopago_preapproval_id:
            cancel_response = sdk.preapproval().update(
                subscription.mercadopago_preapproval_id,
                {"status": "cancelled"}
            )

            if cancel_response["status"] not in [200, 201]:
                logger.error(f"Erro ao cancelar no MP: {cancel_response}")
            else:
                logger.info(f"Assinatura cancelada no MP: {subscription.mercadopago_preapproval_id}")
    except Exception as e:
        logger.error(f"Erro ao cancelar assinatura no MP: {str(e)}")

    # Guardar motivo do cancelamento
    subscription.cancellation_reason = cancel_data.reason
    subscription.cancellation_reason_code = cancel_data.reason_code

    if is_trial:
        # TRIAL: Cancela imediatamente
        subscription.status = "cancelled"
        subscription.cancelled_at = datetime.now()
        current_user.subscription_status = "cancelled"

        await db.commit()

        logger.info(f"Trial cancelado imediatamente para usuario {current_user.id}")

        await notification_service.notify_subscription_cancelled(
            user_email=current_user.email,
            user_name=current_user.name,
            plan_name=plan_name,
            cancellation_reason=cancel_data.reason
        )

        return {
            "message": "Assinatura Trial cancelada com sucesso",
            "immediate": True
        }
    else:
        # PLANO PAGO: Agendar cancelamento para o vencimento
        cancellation_date = subscription.next_billing_date or date.today()
        subscription.scheduled_cancellation_date = cancellation_date

        await db.commit()

        logger.info(
            f"Cancelamento agendado para usuario {current_user.id}. "
            f"Data: {cancellation_date}. Codigo: {cancel_data.reason_code}"
        )

        # Enviar email informando cancelamento agendado
        subject, plain_text, html = email_templates.cancellation_scheduled(
            recipient_name=current_user.name,
            plan_name=plan_name,
            cancellation_date=cancellation_date.strftime("%d/%m/%Y"),
            cancellation_reason=cancel_data.reason
        )

        await notification_service.send_subscription_email(
            to_email=current_user.email,
            subject=subject,
            plain_text=plain_text,
            html=html
        )

        return {
            "message": f"Cancelamento agendado para {cancellation_date.strftime('%d/%m/%Y')}. Voce pode continuar usando ate essa data.",
            "immediate": False,
            "cancellation_date": cancellation_date.isoformat()
        }


@router.post("/cancel-scheduled-change")
async def cancel_scheduled_change(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancela uma mudanca agendada (cancelamento ou downgrade).
    Permite que o usuario volte atras antes da data agendada.
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem fazer isso"
        )

    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Assinatura nao encontrada"
        )

    has_scheduled_cancellation = subscription.scheduled_cancellation_date is not None
    has_scheduled_downgrade = subscription.scheduled_plan_id is not None

    if not has_scheduled_cancellation and not has_scheduled_downgrade:
        raise HTTPException(
            status_code=400,
            detail="Nao ha nenhuma mudanca agendada para cancelar"
        )

    # Cancelar mudancas agendadas
    cancelled_what = []

    if has_scheduled_cancellation:
        subscription.scheduled_cancellation_date = None
        subscription.cancellation_reason = None
        subscription.cancellation_reason_code = None
        cancelled_what.append("cancelamento")

    if has_scheduled_downgrade:
        subscription.scheduled_plan_id = None
        subscription.scheduled_plan_change_date = None
        cancelled_what.append("mudanca de plano")

    await db.commit()

    logger.info(
        f"Mudanca agendada cancelada para usuario {current_user.id}: "
        f"{', '.join(cancelled_what)}"
    )

    return {
        "success": True,
        "message": f"Sua {' e '.join(cancelled_what)} agendada foi cancelada. "
                   f"Sua assinatura continua normalmente.",
        "cancelled": cancelled_what
    }


@router.post("/debug-checkout")
async def debug_subscription_checkout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Debug: Tenta criar uma assinatura diretamente via API
    e retorna informações detalhadas sobre o que está acontecendo.
    """
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Apenas profissionais")

    debug_info = {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_cpf": current_user.cpf[:3] + "***" if current_user.cpf else None,
        "has_cpf": bool(current_user.cpf),
        "steps": []
    }

    try:
        # Separar nome
        name_parts = current_user.name.split(" ", 1) if current_user.name else ["Usuário", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        # Dados do plano
        plan_data = {
            "reason": "Plano Basic - ContrataPro",
            "auto_recurring": {
                "frequency": 1,
                "frequency_type": "months",
                "transaction_amount": 5.00,
                "currency_id": "BRL",
            },
            "payer_email": current_user.email,
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "external_reference": str(current_user.id),
        }

        # Adicionar payer info se tiver CPF
        if current_user.cpf:
            plan_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        debug_info["steps"].append({
            "step": 1,
            "action": "Preparando dados do plano",
            "data": {k: v for k, v in plan_data.items() if k != "payer"}
        })

        # Criar plano
        async with httpx.AsyncClient() as client:
            plan_response = await client.post(
                "https://api.mercadopago.com/preapproval_plan",
                json=plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        plan_result = plan_response.json()
        debug_info["steps"].append({
            "step": 2,
            "action": "Criar preapproval_plan",
            "status_code": plan_response.status_code,
            "response": plan_result
        })

        if plan_response.status_code not in [200, 201]:
            debug_info["error"] = "Falha ao criar plano"
            return debug_info

        # Verificar init_point
        init_point = plan_result.get("init_point")
        debug_info["steps"].append({
            "step": 3,
            "action": "Verificar init_point",
            "init_point": init_point,
            "plan_id": plan_result.get("id"),
            "status": plan_result.get("status")
        })

        # Tentar buscar detalhes do plano criado
        async with httpx.AsyncClient() as client:
            detail_response = await client.get(
                f"https://api.mercadopago.com/preapproval_plan/{plan_result.get('id')}",
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}"
                }
            )

        debug_info["steps"].append({
            "step": 4,
            "action": "Detalhes do plano criado",
            "status_code": detail_response.status_code,
            "response": detail_response.json() if detail_response.status_code == 200 else None
        })

        debug_info["success"] = True
        debug_info["init_point"] = init_point
        return debug_info

    except Exception as e:
        debug_info["error"] = str(e)
        logger.error(f"Debug checkout error: {str(e)}")
        return debug_info


@router.post("/reset-pending")
async def reset_pending_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reseta uma assinatura pendente para permitir criar uma nova.
    Útil quando o init_point está desatualizado ou com dados incorretos.
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem resetar assinaturas"
        )

    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        return {"message": "Nenhuma assinatura encontrada", "can_subscribe": True}

    if subscription.status == "active":
        raise HTTPException(
            status_code=400,
            detail="Não é possível resetar uma assinatura ativa. Use o cancelamento."
        )

    # Cancelar no Mercado Pago se existir preapproval_id
    if subscription.mercadopago_preapproval_id:
        try:
            async with httpx.AsyncClient() as client:
                cancel_response = await client.put(
                    f"https://api.mercadopago.com/preapproval/{subscription.mercadopago_preapproval_id}",
                    json={"status": "cancelled"},
                    headers={
                        "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                        "Content-Type": "application/json"
                    }
                )
                logger.info(f"Reset MP preapproval: {cancel_response.status_code}")
        except Exception as e:
            logger.error(f"Erro ao cancelar preapproval no MP: {str(e)}")
            # Continua mesmo com erro

    # Resetar assinatura para permitir nova criação
    subscription.status = "cancelled"
    subscription.mercadopago_preapproval_id = None
    subscription.init_point = None
    subscription.cancelled_at = datetime.now()
    subscription.cancellation_reason = "Reset para nova assinatura"

    # Atualizar usuário
    current_user.subscription_status = "inactive"

    await db.commit()

    logger.info(f"Assinatura resetada para usuário {current_user.id}")

    return {
        "message": "Assinatura resetada com sucesso. Você pode criar uma nova assinatura.",
        "can_subscribe": True
    }


@router.post("/activate-manual")
async def activate_subscription_manual(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    APENAS PARA DESENVOLVIMENTO/TESTE
    Ativa manualmente uma assinatura pending (simula pagamento aprovado)
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem ativar assinaturas"
        )

    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    subscription = result.scalar_one_or_none()

    # Se não existe assinatura, criar uma nova
    if not subscription:
        subscription = Subscription(
            professional_id=current_user.id,
            plan_amount=1.00,  # R$ 1.00 para teste
            status="pending"
        )
        db.add(subscription)
        await db.flush()  # Para obter o ID
        logger.info(f"Nova assinatura criada automaticamente para usuário {current_user.id}")

    if subscription.status == "active":
        return {"message": "Assinatura já está ativa"}

    # Ativar assinatura
    subscription.status = "active"
    subscription.last_payment_date = date.today()
    subscription.next_billing_date = date.today() + timedelta(days=30)
    current_user.subscription_status = "active"

    await db.commit()

    logger.info(f"Assinatura ativada manualmente para usuário {current_user.id} (DESENVOLVIMENTO)")

    return {
        "message": "Assinatura ativada com sucesso (modo desenvolvimento)",
        "status": "active",
        "next_billing_date": subscription.next_billing_date.isoformat()
    }


@router.post("/change-plan/{new_plan_slug}")
async def change_subscription_plan(
    new_plan_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Altera o plano do profissional.

    UPGRADE (Basic -> Premium):
    - Cobra pro-rata da diferenca pelos dias restantes
    - Muda plano imediatamente
    - Proxima renovacao cobra valor cheio do novo plano

    DOWNGRADE (Premium -> Basic):
    - Agenda mudanca para o dia do vencimento
    - Usuario continua com plano atual ate la
    - Na renovacao, cobra o valor do novo plano

    Cenarios bloqueados:
    - Qualquer plano pago -> Trial (apenas admin pode fazer)
    """
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem alterar planos"
        )

    # Buscar plano atual do usuario
    current_plan = None
    if current_user.subscription_plan_id:
        result = await db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.id == current_user.subscription_plan_id
            )
        )
        current_plan = result.scalar_one_or_none()

    # Buscar novo plano
    result = await db.execute(
        select(SubscriptionPlan).where(
            SubscriptionPlan.slug == new_plan_slug,
            SubscriptionPlan.is_active == True
        )
    )
    new_plan = result.scalar_one_or_none()

    if not new_plan:
        raise HTTPException(
            status_code=404,
            detail=f"Plano '{new_plan_slug}' nao encontrado ou inativo"
        )

    # Verificar se e o mesmo plano
    if current_plan and current_plan.id == new_plan.id:
        raise HTTPException(
            status_code=400,
            detail="Voce ja esta neste plano"
        )

    # REGRA: Nao pode mudar de plano pago para Trial (apenas admin)
    if new_plan_slug == "trial":
        if current_plan and current_plan.price > 0:
            raise HTTPException(
                status_code=403,
                detail="Nao e possivel voltar para o plano Trial. Apenas administradores podem fazer essa alteracao."
            )

    # Buscar assinatura atual
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    existing_subscription = result.scalar_one_or_none()

    # Verificar se ja tem mudanca agendada
    if existing_subscription and existing_subscription.scheduled_plan_id:
        raise HTTPException(
            status_code=400,
            detail=f"Ja existe uma mudanca de plano agendada para {existing_subscription.scheduled_plan_change_date}"
        )

    # Verificar limite de servicos para downgrade
    if new_plan.max_services is not None:
        result = await db.execute(
            select(Service).where(
                Service.professional_id == current_user.id
            )
        )
        services = result.scalars().all()

        if len(services) > new_plan.max_services:
            return {
                "success": False,
                "error": "services_exceeded",
                "message": f"Voce tem {len(services)} servicos cadastrados. O plano {new_plan.name} permite apenas {new_plan.max_services}.",
                "current_services": [
                    {"id": s.id, "title": s.title} for s in services
                ],
                "max_allowed": new_plan.max_services,
                "action_required": "remove_services"
            }

    # Determinar se e upgrade ou downgrade
    current_price = current_plan.price if current_plan else 0
    is_upgrade = new_plan.price > current_price
    is_downgrade = new_plan.price < current_price and current_price > 0
    is_from_trial = current_plan is None or current_plan.price == 0

    old_plan_name = current_plan.name if current_plan else "Sem plano"

    # ==================== CENARIO: PARA TRIAL (ADMIN) ====================
    if new_plan.price == 0 or new_plan.slug == "trial":
        if existing_subscription and existing_subscription.mercadopago_preapproval_id:
            try:
                async with httpx.AsyncClient() as client:
                    await client.put(
                        f"https://api.mercadopago.com/preapproval/{existing_subscription.mercadopago_preapproval_id}",
                        json={"status": "cancelled"},
                        headers={
                            "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                            "Content-Type": "application/json"
                        }
                    )
                logger.info(f"Assinatura MP cancelada para mudanca de plano: {existing_subscription.mercadopago_preapproval_id}")
            except Exception as e:
                logger.error(f"Erro ao cancelar assinatura MP: {str(e)}")

        trial_days = new_plan.trial_days or 15
        trial_end_date = date.today() + timedelta(days=trial_days)

        if existing_subscription:
            existing_subscription.plan_id = new_plan.id
            existing_subscription.status = "active"
            existing_subscription.trial_ends_at = trial_end_date
            existing_subscription.plan_amount = 0.0
            existing_subscription.mercadopago_preapproval_id = None
            existing_subscription.init_point = None
            existing_subscription.scheduled_plan_id = None
            existing_subscription.scheduled_plan_change_date = None
        else:
            new_subscription = Subscription(
                professional_id=current_user.id,
                plan_id=new_plan.id,
                status="active",
                trial_ends_at=trial_end_date,
                plan_amount=0.0
            )
            db.add(new_subscription)

        current_user.subscription_plan_id = new_plan.id
        current_user.subscription_status = "active"
        current_user.trial_ends_at = datetime.combine(trial_end_date, datetime.min.time())

        await db.commit()

        await notification_service.notify_subscription_activated(
            user_email=current_user.email,
            user_name=current_user.name,
            plan_name=new_plan.name,
            plan_price=0.0,
            is_trial=True,
            trial_days=trial_days,
            trial_end_date=trial_end_date.strftime("%d/%m/%Y")
        )

        return {
            "success": True,
            "message": f"Plano alterado para {new_plan.name} com sucesso!",
            "plan": {"name": new_plan.name, "slug": new_plan.slug, "price": new_plan.price},
            "trial_ends_at": trial_end_date.isoformat()
        }

    # ==================== CENARIO: DOWNGRADE (AGENDADO) ====================
    if is_downgrade:
        # Agenda a mudanca para o dia do vencimento
        change_date = existing_subscription.next_billing_date if existing_subscription and existing_subscription.next_billing_date else date.today() + timedelta(days=30)

        if existing_subscription:
            existing_subscription.scheduled_plan_id = new_plan.id
            existing_subscription.scheduled_plan_change_date = change_date
        else:
            raise HTTPException(
                status_code=400,
                detail="Nenhuma assinatura ativa para fazer downgrade"
            )

        await db.commit()

        logger.info(f"Downgrade agendado para usuario {current_user.id}: {current_plan.slug} -> {new_plan.slug} em {change_date}")

        # Enviar email informando downgrade agendado
        subject, plain_text, html = email_templates.downgrade_scheduled(
            recipient_name=current_user.name,
            old_plan_name=old_plan_name,
            new_plan_name=new_plan.name,
            new_plan_price=new_plan.price,
            change_date=change_date.strftime("%d/%m/%Y")
        )

        await notification_service.send_subscription_email(
            to_email=current_user.email,
            subject=subject,
            plain_text=plain_text,
            html=html
        )

        return {
            "success": True,
            "message": f"Downgrade agendado! Voce continuara com o plano {old_plan_name} ate {change_date.strftime('%d/%m/%Y')}, quando passara para o plano {new_plan.name}.",
            "plan": {"name": new_plan.name, "slug": new_plan.slug, "price": new_plan.price},
            "scheduled_change_date": change_date.isoformat(),
            "is_scheduled": True,
            "requires_payment": False
        }

    # ==================== CENARIO: UPGRADE ou TRIAL->PAGO ====================
    # Validar CPF
    if not current_user.cpf:
        raise HTTPException(
            status_code=400,
            detail="CPF e obrigatorio para assinar um plano pago. Atualize seu perfil com o CPF."
        )

    # Calcular pro-rata para upgrade entre planos pagos
    prorata_amount = 0.0
    if is_upgrade and existing_subscription and existing_subscription.next_billing_date:
        # Calcular dias restantes ate o vencimento
        days_remaining = (existing_subscription.next_billing_date - date.today()).days
        if days_remaining > 0:
            # Diferenca de preco
            price_diff = new_plan.price - current_price
            # Pro-rata: (diferenca * dias restantes) / 30
            prorata_amount = round((price_diff * days_remaining) / 30, 2)
            logger.info(f"Pro-rata calculado: R${prorata_amount} ({days_remaining} dias restantes, diferenca R${price_diff})")

    # Cancelar assinatura atual no MP
    if existing_subscription and existing_subscription.mercadopago_preapproval_id:
        if existing_subscription.status in ["active", "pending"]:
            try:
                async with httpx.AsyncClient() as client:
                    await client.put(
                        f"https://api.mercadopago.com/preapproval/{existing_subscription.mercadopago_preapproval_id}",
                        json={"status": "cancelled"},
                        headers={
                            "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                            "Content-Type": "application/json"
                        }
                    )
                logger.info(f"Assinatura MP anterior cancelada: {existing_subscription.mercadopago_preapproval_id}")
            except Exception as e:
                logger.error(f"Erro ao cancelar assinatura MP anterior: {str(e)}")

    # Criar nova assinatura no MP
    try:
        name_parts = current_user.name.split(" ", 1) if current_user.name else ["Usuario", ""]
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else first_name

        # Para upgrade com pro-rata, definir a primeira cobranca como o pro-rata
        # e as proximas como o valor cheio
        if prorata_amount > 0:
            # Criar assinatura com primeira cobranca = pro-rata
            plan_data = {
                "reason": f"Upgrade para Plano {new_plan.name} - ContrataPro",
                "auto_recurring": {
                    "frequency": settings.SUBSCRIPTION_FREQUENCY,
                    "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                    "transaction_amount": new_plan.price,
                    "currency_id": "BRL",
                    "start_date": (existing_subscription.next_billing_date).isoformat() if existing_subscription.next_billing_date else None,
                    "free_trial": {
                        "frequency": (existing_subscription.next_billing_date - date.today()).days if existing_subscription.next_billing_date else 0,
                        "frequency_type": "days"
                    }
                },
                "payer_email": current_user.email,
                "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
                "external_reference": f"{current_user.id}_upgrade",
            }
        else:
            # Assinatura normal (trial para pago ou sem pro-rata)
            plan_data = {
                "reason": f"Plano {new_plan.name} - ContrataPro",
                "auto_recurring": {
                    "frequency": settings.SUBSCRIPTION_FREQUENCY,
                    "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                    "transaction_amount": new_plan.price,
                    "currency_id": "BRL",
                },
                "payer_email": current_user.email,
                "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
                "external_reference": str(current_user.id),
            }

        if current_user.cpf:
            plan_data["payer"] = {
                "first_name": first_name,
                "last_name": last_name,
                "email": current_user.email,
                "identification": {
                    "type": "CPF",
                    "number": current_user.cpf.replace(".", "").replace("-", "")
                }
            }

        logger.info(f"Criando novo plano MP para mudanca: {plan_data}")

        async with httpx.AsyncClient() as client:
            plan_response = await client.post(
                "https://api.mercadopago.com/preapproval",
                json=plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if plan_response.status_code not in [200, 201]:
            logger.error(f"Erro ao criar plano MP: {plan_response.status_code} - {plan_response.text}")
            raise HTTPException(
                status_code=500,
                detail="Erro ao criar novo plano no Mercado Pago"
            )

        mp_plan = plan_response.json()
        mp_plan_id = mp_plan["id"]
        mp_init_point = mp_plan.get("init_point")

        if not mp_init_point:
            raise HTTPException(
                status_code=500,
                detail="Erro: Mercado Pago nao retornou URL de checkout"
            )

        # Atualizar assinatura no banco
        if existing_subscription:
            existing_subscription.plan_id = new_plan.id
            existing_subscription.status = "pending"
            existing_subscription.trial_ends_at = None
            existing_subscription.plan_amount = new_plan.price
            existing_subscription.mercadopago_preapproval_id = mp_plan_id
            existing_subscription.init_point = mp_init_point
            existing_subscription.cancelled_at = None
            existing_subscription.cancellation_reason = None
            existing_subscription.scheduled_plan_id = None
            existing_subscription.scheduled_plan_change_date = None
        else:
            new_subscription = Subscription(
                professional_id=current_user.id,
                plan_id=new_plan.id,
                status="pending",
                plan_amount=new_plan.price,
                mercadopago_preapproval_id=mp_plan_id,
                init_point=mp_init_point
            )
            db.add(new_subscription)

        current_user.subscription_plan_id = new_plan.id
        current_user.subscription_status = "pending"
        current_user.trial_ends_at = None

        await db.commit()

        logger.info(f"Mudanca de plano iniciada para usuario {current_user.id}: {current_plan.slug if current_plan else 'none'} -> {new_plan.slug}")

        # Enviar notificacao por e-mail
        await notification_service.notify_subscription_plan_changed(
            user_email=current_user.email,
            user_name=current_user.name,
            old_plan_name=old_plan_name,
            new_plan_name=new_plan.name,
            new_plan_price=new_plan.price,
            is_upgrade=is_upgrade,
            requires_payment=True
        )

        message = f"Plano alterado para {new_plan.name}. Complete o pagamento para ativar."
        if prorata_amount > 0:
            message = f"Upgrade para {new_plan.name}! Valor pro-rata: R$ {prorata_amount:.2f}. Complete o pagamento."

        return {
            "success": True,
            "message": message,
            "plan": {"name": new_plan.name, "slug": new_plan.slug, "price": new_plan.price},
            "init_point": mp_init_point,
            "requires_payment": True,
            "prorata_amount": prorata_amount if prorata_amount > 0 else None,
            "is_upgrade": is_upgrade
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao mudar plano: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar mudanca de plano: {str(e)}"
        )


@router.post("/admin/force-trial/{user_id}")
async def admin_force_trial(
    user_id: int,
    request_data: AdminForceTrialRequest = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ADMIN ONLY: Força um usuário a voltar para o plano Trial.
    Útil para casos excepcionais onde o usuário precisa de suporte.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem executar esta ação"
        )

    # Buscar usuário alvo
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    if not target_user.is_professional:
        raise HTTPException(
            status_code=400,
            detail="Usuário não é um profissional"
        )

    # Buscar plano Trial
    result = await db.execute(
        select(SubscriptionPlan).where(
            SubscriptionPlan.slug == "trial",
            SubscriptionPlan.is_active == True
        )
    )
    trial_plan = result.scalar_one_or_none()

    if not trial_plan:
        raise HTTPException(
            status_code=404,
            detail="Plano Trial não encontrado no sistema"
        )

    # Buscar assinatura atual
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == user_id
        )
    )
    subscription = result.scalar_one_or_none()

    # Cancelar assinatura MP se existir
    if subscription and subscription.mercadopago_preapproval_id:
        try:
            async with httpx.AsyncClient() as client:
                await client.put(
                    f"https://api.mercadopago.com/preapproval/{subscription.mercadopago_preapproval_id}",
                    json={"status": "cancelled"},
                    headers={
                        "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                        "Content-Type": "application/json"
                    }
                )
            logger.info(f"[ADMIN] Assinatura MP cancelada: {subscription.mercadopago_preapproval_id}")
        except Exception as e:
            logger.error(f"[ADMIN] Erro ao cancelar assinatura MP: {str(e)}")

    # Configurar trial
    trial_days = trial_plan.trial_days or 15
    trial_end_date = date.today() + timedelta(days=trial_days)
    reason = request_data.reason if request_data and request_data.reason else "Forçado por administrador"

    if subscription:
        subscription.plan_id = trial_plan.id
        subscription.status = "active"
        subscription.trial_ends_at = trial_end_date
        subscription.plan_amount = 0.0
        subscription.mercadopago_preapproval_id = None
        subscription.init_point = None
        subscription.cancellation_reason = f"[ADMIN] {reason}"
    else:
        subscription = Subscription(
            professional_id=user_id,
            plan_id=trial_plan.id,
            status="active",
            trial_ends_at=trial_end_date,
            plan_amount=0.0
        )
        db.add(subscription)

    target_user.subscription_plan_id = trial_plan.id
    target_user.subscription_status = "active"
    target_user.trial_ends_at = datetime.combine(trial_end_date, datetime.min.time())

    await db.commit()

    logger.info(f"[ADMIN] Usuário {user_id} forçado para Trial por admin {current_user.id}. Motivo: {reason}")

    # Enviar notificação por e-mail para o usuário
    await notification_service.notify_subscription_activated(
        user_email=target_user.email,
        user_name=target_user.name,
        plan_name=trial_plan.name,
        plan_price=0.0,
        is_trial=True,
        trial_days=trial_days,
        trial_end_date=trial_end_date.strftime("%d/%m/%Y")
    )

    return {
        "success": True,
        "message": f"Usuário {target_user.name} alterado para plano Trial com sucesso",
        "user_id": user_id,
        "trial_ends_at": trial_end_date.isoformat(),
        "admin_action_by": current_user.id
    }


@router.post("/webhook")
async def mercadopago_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook para receber notificações do Mercado Pago
    Documentação: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration/subscription-payments-notification
    """
    try:
        body = await request.json()
        logger.info(f"Webhook recebido: {body}")

        # Verificar tipo de notificação
        notification_type = body.get("type")

        if notification_type == "preapproval":
            # Notificação de assinatura
            preapproval_id = body.get("data", {}).get("id")

            if not preapproval_id:
                logger.error("Webhook sem preapproval_id")
                return {"status": "error", "message": "Missing preapproval_id"}

            # Buscar detalhes da assinatura no MP
            preapproval_response = sdk.preapproval().get(preapproval_id)
            preapproval_data = preapproval_response["response"]

            if preapproval_response["status"] != 200:
                logger.error(
                    f"Erro ao buscar preapproval: {preapproval_response}"
                )
                return {"status": "error"}

            # Buscar assinatura no banco
            result = await db.execute(
                select(Subscription).where(
                    Subscription.mercadopago_preapproval_id == preapproval_id
                )
            )
            subscription = result.scalar_one_or_none()

            if not subscription:
                logger.error(
                    f"Assinatura não encontrada: {preapproval_id}"
                )
                return {"status": "error", "message": "Subscription not found"}

            # Atualizar status baseado no status do MP
            mp_status = preapproval_data.get("status")
            external_reference = preapproval_data.get("external_reference")

            # Buscar usuário
            result = await db.execute(
                select(User).where(
                    User.id == int(external_reference)
                )
            )
            user = result.scalar_one_or_none()

            if mp_status == "authorized":
                subscription.status = "active"
                subscription.mercadopago_payer_id = preapproval_data.get(
                    "payer_id"
                )
                subscription.last_payment_date = date.today()
                subscription.next_billing_date = (
                    date.today() + timedelta(days=30)
                )
                if user:
                    user.subscription_status = "active"

                    # Buscar nome do plano e enviar notificação
                    if subscription.plan_id:
                        plan_result = await db.execute(
                            select(SubscriptionPlan).where(
                                SubscriptionPlan.id == subscription.plan_id
                            )
                        )
                        plan = plan_result.scalar_one_or_none()
                        if plan:
                            await notification_service.notify_subscription_activated(
                                user_email=user.email,
                                user_name=user.name,
                                plan_name=plan.name,
                                plan_price=subscription.plan_amount or plan.price,
                                is_trial=False
                            )

            elif mp_status == "paused":
                subscription.status = "paused"
                if user:
                    user.subscription_status = "inactive"

            elif mp_status == "cancelled":
                subscription.status = "cancelled"
                subscription.cancelled_at = datetime.now()
                if user:
                    user.subscription_status = "cancelled"

            await db.commit()
            logger.info(
                f"Assinatura atualizada: {subscription.id} -> {mp_status}"
            )

        elif notification_type == "payment":
            # Notificação de pagamento individual
            payment_id = body.get("data", {}).get("id")

            if payment_id:
                payment_response = sdk.payment().get(payment_id)
                payment_data = payment_response["response"]

                if payment_response["status"] == 200:
                    preapproval_id = payment_data.get("preapproval_id")

                    if preapproval_id:
                        result = await db.execute(
                            select(Subscription).where(
                                Subscription.mercadopago_preapproval_id ==
                                preapproval_id
                            )
                        )
                        subscription = result.scalar_one_or_none()

                        if subscription:
                            subscription.last_payment_date = date.today()
                            subscription.next_billing_date = (
                                date.today() + timedelta(days=30)
                            )
                            await db.commit()
                            logger.info(
                                f"Pagamento processado: {payment_id}"
                            )

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Erro no webhook: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.get("/admin/all")
async def list_all_subscriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lista todas as assinaturas (apenas admin)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores podem acessar"
        )

    result = await db.execute(select(Subscription))
    subscriptions = result.scalars().all()

    return {
        "subscriptions": [
            {
                "id": sub.id,
                "professional_id": sub.professional_id,
                "status": sub.status,
                "plan_amount": sub.plan_amount,
                "next_billing_date": (
                    sub.next_billing_date.isoformat()
                    if sub.next_billing_date else None
                ),
                "last_payment_date": (
                    sub.last_payment_date.isoformat()
                    if sub.last_payment_date else None
                ),
                "mercadopago_preapproval_id": sub.mercadopago_preapproval_id
            }
            for sub in subscriptions
        ]
    }
