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
from ..models import Subscription, User
from .auth import get_current_user
from ..config import settings

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
        # PASSO 1: Criar plano de assinatura (preapproval_plan) usando API REST diretamente
        plan_data = {
            "reason": "Plano Mensal - Chama Eu Profissional",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
            },
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
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
        # PASSO 1: Criar plano de assinatura
        plan_data = {
            "reason": "Plano Mensal - Chama Eu Profissional",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
            },
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
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
            "reason": "Plano Mensal - Chama Eu Profissional",
            "payer_email": current_user.email,
            "card_token_id": card_data.card_token_id,
            "status": "authorized",
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": settings.SUBSCRIPTION_AMOUNT,
                "currency_id": "BRL",
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

    return {
        "subscription": {
            "id": subscription.id,
            "status": subscription.status,
            "plan_amount": subscription.plan_amount,
            "next_billing_date": (
                subscription.next_billing_date.isoformat()
                if subscription.next_billing_date else None
            ),
            "last_payment_date": (
                subscription.last_payment_date.isoformat()
                if subscription.last_payment_date else None
            ),
            "cancelled_at": (
                subscription.cancelled_at.isoformat()
                if subscription.cancelled_at else None
            ),
            "cancellation_reason": subscription.cancellation_reason,
            "created_at": subscription.created_at.isoformat(),
            "init_point": subscription.init_point
        }
    }


@router.post("/cancel")
async def cancel_subscription(
    cancel_data: CancelSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancela a assinatura do profissional no Mercado Pago e no banco"""
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
            detail="Assinatura não encontrada"
        )

    if subscription.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Assinatura já está cancelada"
        )

    # Cancelar no Mercado Pago
    try:
        if subscription.mercadopago_preapproval_id:
            cancel_response = sdk.preapproval().update(
                subscription.mercadopago_preapproval_id,
                {"status": "cancelled"}
            )

            if cancel_response["status"] not in [200, 201]:
                logger.error(
                    f"Erro ao cancelar no MP: {cancel_response}"
                )
                # Continua mesmo com erro no MP
            else:
                logger.info(f"Assinatura cancelada no MP: {subscription.mercadopago_preapproval_id}")
    except Exception as e:
        logger.error(f"Erro ao cancelar assinatura no MP: {str(e)}")
        # Continua para cancelar localmente

    # Cancelar no banco de dados
    subscription.status = "cancelled"
    subscription.cancelled_at = datetime.now()
    subscription.cancellation_reason = cancel_data.reason
    current_user.subscription_status = "cancelled"

    await db.commit()

    logger.info(f"Assinatura cancelada localmente para usuário {current_user.id}. Motivo: {cancel_data.reason}")

    return {"message": "Assinatura cancelada com sucesso"}


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
