# 🚀 Implementação Completa - Sistema de Assinaturas

Este documento contém **TODO o código necessário** para implementar o sistema de assinaturas com Trial gratuito.

---

## ✅ O Que Já Foi Feito

- ✅ Migration executada (plan_id e trial_ends_at adicionados)
- ✅ Modelo Subscription atualizado
- ✅ 3 planos criados no banco de produção
- ✅ Análise completa documentada

---

## 📝 Arquivos a Criar/Atualizar

### 1. Novo Endpoint: `POST /subscriptions/subscribe/{plan_slug}`

**Criar arquivo:** `backend/app/routers/subscriptions_new.py`

```python
#!/usr/bin/env python3
"""
Novo sistema de assinaturas com suporte a Trial gratuito.
Substitui a lógica antiga que sempre usava Mercado Pago.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta
from pydantic import BaseModel
from typing import Optional
import httpx
import logging

from ..database import get_db
from ..models import Subscription, User, SubscriptionPlan
from .auth import get_current_user
from ..config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


class SubscribeResponse(BaseModel):
    message: str
    subscription_id: int
    plan_name: str
    trial_ends_at: Optional[date] = None
    requires_payment: bool
    init_point: Optional[str] = None


@router.post("/subscribe/{plan_slug}", response_model=SubscribeResponse)
async def subscribe_to_plan(
    plan_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Inscreve profissional em um plano (Trial, Basic ou Premium).

    - Trial: Ativação imediata sem pagamento (15 dias)
    - Basic/Premium: Cria assinatura no Mercado Pago
    """

    # 1. Validar que é profissional
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Apenas profissionais podem assinar planos"
        )

    # 2. Buscar o plano escolhido
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
            detail=f"Plano '{plan_slug}' não encontrado"
        )

    # 3. Verificar se já tem assinatura ativa
    result = await db.execute(
        select(Subscription).where(
            Subscription.professional_id == current_user.id
        )
    )
    existing_sub = result.scalar_one_or_none()

    if existing_sub and existing_sub.status in ["active", "pending"]:
        raise HTTPException(
            status_code=400,
            detail="Você já possui uma assinatura ativa"
        )

    # 4. TRIAL: Ativação imediata sem Mercado Pago
    if plan.price == 0.0:
        return await activate_trial(
            db=db,
            user=current_user,
            plan=plan,
            existing_sub=existing_sub
        )

    # 5. PLANOS PAGOS: Criar assinatura no Mercado Pago
    else:
        return await create_paid_subscription(
            db=db,
            user=current_user,
            plan=plan,
            existing_sub=existing_sub
        )


async def activate_trial(
    db: AsyncSession,
    user: User,
    plan: SubscriptionPlan,
    existing_sub: Optional[Subscription]
) -> SubscribeResponse:
    """
    Ativa plano Trial (gratuito) imediatamente.
    NÃO usa Mercado Pago.
    """

    # Validar se CPF já usou Trial
    if user.cpf:
        result = await db.execute(
            select(Subscription)
            .join(User)
            .where(
                User.cpf == user.cpf,
                Subscription.plan_id == plan.id,
                Subscription.status.in_(["active", "expired"])
            )
        )
        previous_trial = result.scalar_one_or_none()

        if previous_trial:
            raise HTTPException(
                status_code=400,
                detail="CPF já utilizou o período trial. Escolha Basic ou Premium."
            )

    # Calcular data de expiração
    trial_ends = date.today() + timedelta(days=plan.trial_days or 15)

    # Criar ou atualizar assinatura
    if existing_sub:
        existing_sub.plan_id = plan.id
        existing_sub.plan_amount = 0.0
        existing_sub.status = "active"
        existing_sub.trial_ends_at = trial_ends
        existing_sub.last_payment_date = date.today()
        existing_sub.next_billing_date = None  # Trial não tem cobrança recorrente
        existing_sub.cancelled_at = None
        existing_sub.cancellation_reason = None
        subscription = existing_sub
    else:
        subscription = Subscription(
            professional_id=user.id,
            plan_id=plan.id,
            plan_amount=0.0,
            status="active",
            trial_ends_at=trial_ends,
            last_payment_date=date.today(),
            next_billing_date=None
        )
        db.add(subscription)

    # Atualizar usuário
    user.subscription_status = "trial"
    user.subscription_plan_id = plan.id
    user.trial_ends_at = trial_ends

    await db.commit()
    await db.refresh(subscription)

    logger.info(
        f"Trial ativado para usuário {user.id} (CPF: {user.cpf}). "
        f"Expira em: {trial_ends}"
    )

    return SubscribeResponse(
        message=f"Trial ativado com sucesso! Você tem {plan.trial_days} dias grátis.",
        subscription_id=subscription.id,
        plan_name=plan.name,
        trial_ends_at=trial_ends,
        requires_payment=False,
        init_point=None
    )


async def create_paid_subscription(
    db: AsyncSession,
    user: User,
    plan: SubscriptionPlan,
    existing_sub: Optional[Subscription]
) -> SubscribeResponse:
    """
    Cria assinatura paga via Mercado Pago (Basic ou Premium).
    """

    try:
        # Criar plano no Mercado Pago
        mp_plan_data = {
            "reason": f"Plano {plan.name} - ContrataPro",
            "auto_recurring": {
                "frequency": settings.SUBSCRIPTION_FREQUENCY,
                "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,
                "transaction_amount": float(plan.price),  # Usa preço do plano!
                "currency_id": "BRL",
            },
            "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
        }

        logger.info(f"Criando plano MP: {mp_plan_data}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mercadopago.com/preapproval_plan",
                json=mp_plan_data,
                headers={
                    "Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}",
                    "Content-Type": "application/json"
                }
            )

        if response.status_code not in [200, 201]:
            logger.error(f"Erro MP: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar plano no Mercado Pago: {response.text}"
            )

        mp_plan = response.json()
        plan_id = mp_plan["id"]
        init_point = mp_plan.get("init_point")

        if not init_point:
            raise HTTPException(
                status_code=500,
                detail="Plano criado mas sem URL de checkout"
            )

        # Criar assinatura no banco
        if existing_sub:
            existing_sub.plan_id = plan.id
            existing_sub.mercadopago_preapproval_id = plan_id
            existing_sub.init_point = init_point
            existing_sub.plan_amount = plan.price
            existing_sub.status = "pending"
            existing_sub.cancelled_at = None
            subscription = existing_sub
        else:
            subscription = Subscription(
                professional_id=user.id,
                plan_id=plan.id,
                mercadopago_preapproval_id=plan_id,
                init_point=init_point,
                plan_amount=plan.price,
                status="pending"
            )
            db.add(subscription)

        # Atualizar usuário
        user.subscription_status = "pending"
        user.subscription_plan_id = plan.id

        await db.commit()
        await db.refresh(subscription)

        logger.info(f"Assinatura paga criada: {subscription.id} (MP: {plan_id})")

        return SubscribeResponse(
            message="Link de pagamento gerado com sucesso",
            subscription_id=subscription.id,
            plan_name=plan.name,
            trial_ends_at=None,
            requires_payment=True,
            init_point=init_point
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar assinatura paga: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar assinatura: {str(e)}"
        )
```

---

### 2. Script para Expirar Trials Diariamente

**Criar arquivo:** `backend/app/tasks/expire_trials.py`

```python
#!/usr/bin/env python3
"""
Cronjob: Expirar trials vencidos.
Executar diariamente às 00:00.

Uso:
    python -m app.tasks.expire_trials
"""

import asyncio
import sys
import os
from datetime import date
from sqlalchemy import select, and_

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal  # noqa: E402
from app.models import Subscription, User  # noqa: E402


async def expire_trial_subscriptions():
    """
    Expira assinaturas trial que atingiram a data de vencimento.
    """
    async with AsyncSessionLocal() as db:
        print(f"🕐 Verificando trials expirados... ({date.today()})")

        # Buscar trials ativos expirados
        result = await db.execute(
            select(Subscription).where(
                and_(
                    Subscription.status == "active",
                    Subscription.trial_ends_at <= date.today(),
                    Subscription.trial_ends_at.isnot(None)
                )
            )
        )
        expired_trials = result.scalars().all()

        if not expired_trials:
            print("✓ Nenhum trial expirado encontrado.")
            return

        print(f"⚠️  Encontrados {len(expired_trials)} trials expirados:")

        for subscription in expired_trials:
            # Buscar usuário
            user = await db.get(User, subscription.professional_id)

            if user:
                # Marcar como expirado
                subscription.status = "expired"
                user.subscription_status = "inactive"

                print(f"  - Usuário {user.id} ({user.email})")
                print(f"    Trial expirou em: {subscription.trial_ends_at}")

                # TODO: Enviar email notificando
                # await send_trial_expired_email(user, subscription)

        await db.commit()
        print(f"\n✓ {len(expired_trials)} trials marcados como expirados")


async def warn_expiring_trials(days_before=3):
    """
    Avisa usuários cujo trial expira em X dias.
    """
    async with AsyncSessionLocal() as db:
        from datetime import timedelta

        warn_date = date.today() + timedelta(days=days_before)

        result = await db.execute(
            select(Subscription).where(
                and_(
                    Subscription.status == "active",
                    Subscription.trial_ends_at == warn_date
                )
            )
        )
        expiring_soon = result.scalars().all()

        if not expiring_soon:
            print(f"✓ Nenhum trial expirando em {days_before} dias.")
            return

        print(f"⏰ {len(expiring_soon)} trials expiram em {days_before} dias:")

        for subscription in expiring_soon:
            user = await db.get(User, subscription.professional_id)

            if user:
                print(f"  - {user.email} (expira: {subscription.trial_ends_at})")

                # TODO: Enviar email de aviso
                # await send_trial_expiring_email(user, subscription, days_before)


if __name__ == "__main__":
    print("=" * 60)
    print("🔍 EXPIRAÇÃO DE TRIALS - ContrataPro")
    print("=" * 60)
    print()

    # Expirar trials vencidos
    asyncio.run(expire_trial_subscriptions())

    print()

    # Avisar sobre trials que expiram em 3 dias
    asyncio.run(warn_expiring_trials(days_before=3))

    print()
    print("=" * 60)
    print("✅ PROCESSO CONCLUÍDO")
    print("=" * 60)
```

---

### 3. Atualizar Router Principal

**Editar:** `backend/app/main.py`

Adicionar import do novo router:

```python
from .routers import (
    users, services, appointments, subscriptions,
    auth, schedule, categories, admin, cep, health, plans
)

# ADICIONAR IMPORT:
from .routers import subscriptions_new

# ... código existente ...

# Adicionar router novo (ANTES do router antigo para ter prioridade):
app.include_router(
    subscriptions_new.router,
    prefix="/subscriptions",
    tags=["subscriptions-v2"]
)
app.include_router(
    subscriptions,
    prefix="/subscriptions",
    tags=["subscriptions"]
)
```

---

### 4. Configurar Cronjob no Railway

**Opção A: Railway Cron (se disponível no plano)**

No Railway Dashboard:
1. Crie um novo serviço "Cron Job"
2. Configure para rodar diariamente:
```bash
0 0 * * * cd /app && python -m app.tasks.expire_trials
```

**Opção B: Usar GitHub Actions**

Criar `.github/workflows/expire_trials.yml`:

```yaml
name: Expirar Trials Diariamente

on:
  schedule:
    - cron: '0 3 * * *'  # 00:00 BRT (03:00 UTC)
  workflow_dispatch:  # Permitir execução manual

jobs:
  expire-trials:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run expire trials
        env:
          DATABASE_URL: ${{ secrets.RAILWAY_DATABASE_URL }}
        run: |
          cd backend
          python -m app.tasks.expire_trials
```

---

## 🧪 Como Testar

### 1. Testar Trial (Localmente ou Produção)

```bash
# Fazer login como profissional
curl -X POST https://api.contratapro.com.br/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "prof@test.com", "password": "senha123"}'

# Assinar plano Trial
curl -X POST https://api.contratapro.com.br/subscriptions/subscribe/trial \
  -H "Authorization: Bearer SEU_TOKEN"

# Resposta esperada:
{
  "message": "Trial ativado com sucesso! Você tem 15 dias grátis.",
  "subscription_id": 1,
  "plan_name": "Trial",
  "trial_ends_at": "2026-01-29",
  "requires_payment": false,
  "init_point": null
}
```

### 2. Testar Plano Pago

```bash
# Assinar Basic
curl -X POST https://api.contratapro.com.br/subscriptions/subscribe/basic \
  -H "Authorization: Bearer SEU_TOKEN"

# Resposta esperada:
{
  "message": "Link de pagamento gerado com sucesso",
  "subscription_id": 2,
  "plan_name": "Basic",
  "trial_ends_at": null,
  "requires_payment": true,
  "init_point": "https://www.mercadopago.com.br/..."
}
```

### 3. Testar Expiração de Trials

```bash
cd backend
python -m app.tasks.expire_trials
```

---

## 📋 Checklist de Deploy

- [ ] Criar `backend/app/routers/subscriptions_new.py`
- [ ] Criar `backend/app/tasks/expire_trials.py`
- [ ] Atualizar `backend/app/main.py` (adicionar router)
- [ ] Commitar e push para main
- [ ] Aguardar deploy no Railway
- [ ] Testar endpoint `/subscribe/trial` via Postman/curl
- [ ] Testar endpoint `/subscribe/basic` via Postman/curl
- [ ] Configurar cronjob (Railway ou GitHub Actions)
- [ ] Validar que trial expira após 15 dias

---

## 🔒 Validações Implementadas

✅ CPF não pode usar Trial duas vezes
✅ Trial ativa imediatamente sem pagamento
✅ Planos pagos usam Mercado Pago
✅ Trial expira automaticamente após 15 dias
✅ Profissional não pode ter 2 assinaturas ativas

---

## 🎯 Fluxo Completo

```
Profissional se Cadastra
    ↓
Escolhe Plano
    ├─ Trial (R$ 0) ────→ Ativação Imediata ────→ 15 dias grátis
    ├─ Basic (R$ 29,90) ─→ Mercado Pago ────────→ Pagamento
    └─ Premium (R$ 49,90)→ Mercado Pago ────────→ Pagamento
    ↓
Cronjob Diário
    ├─ Avisa 3 dias antes de expirar
    └─ Expira trial vencido
    ↓
Profissional Inativo → Modal: "Escolha um plano"
```

---

**Última atualização**: 2026-01-14
**Autor**: Claude Sonnet 4.5
