# 🔍 Análise do Plano Trial - Produção

## 📊 Status Atual do Plano Trial

### ✅ Configuração do Plano (Banco de Dados):
```json
{
  "name": "Trial",
  "slug": "trial",
  "price": 0.0,
  "max_services": 3,
  "can_manage_schedule": true,
  "can_receive_bookings": true,
  "priority_in_search": 0,
  "trial_days": 15,
  "is_active": true
}
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Problema 1: INTEGRAÇÃO COM MERCADO PAGO É OBRIGATÓRIA

**Situação Atual:**
O código em `subscriptions.py` **SEMPRE** tenta criar uma assinatura no Mercado Pago, mesmo para o plano Trial gratuito.

**Onde está o problema:**
```python
# Linhas 74-83: Sempre cria plano no MP
plan_data = {
    "reason": "Plano Mensal - Chama Eu Profissional",
    "auto_recurring": {
        "frequency": settings.SUBSCRIPTION_FREQUENCY,  # 1
        "frequency_type": settings.SUBSCRIPTION_FREQUENCY_TYPE,  # months
        "transaction_amount": settings.SUBSCRIPTION_AMOUNT,  # R$ 1.00 (FIXO!)
        "currency_id": "BRL",
    },
    "back_url": f"{settings.FRONTEND_URL}/subscription/callback",
}
```

**O MAIOR PROBLEMA:**
- `settings.SUBSCRIPTION_AMOUNT` é uma **constante global** configurada nas variáveis de ambiente
- Não diferencia entre Trial (R$ 0,00), Basic (R$ 29,90) ou Premium (R$ 49,90)
- **TODOS os planos** tentam cobrar o valor de `SUBSCRIPTION_AMOUNT`

---

### 🔴 Problema 2: SISTEMA NÃO CONSULTA TABELA `subscription_plans`

**O código atual:**
- ❌ NÃO consulta a tabela `subscription_plans` que você criou
- ❌ NÃO usa os preços definidos em cada plano (0.0, 29.90, 49.90)
- ❌ Sempre usa `settings.SUBSCRIPTION_AMOUNT` (valor fixo)

**O código deveria fazer:**
```python
# Buscar o plano escolhido pelo usuário
plan = await db.execute(
    select(SubscriptionPlan).where(SubscriptionPlan.slug == "trial")
)
plan_data = plan.scalar_one()

# Usar o preço do plano
transaction_amount = plan_data.price  # 0.0 para Trial!
```

---

## 🔧 SOLUÇÕES NECESSÁRIAS

### Solução 1: Lógica Especial para Trial (SEM Mercado Pago)

**Para o plano Trial (gratuito):**
- ❌ NÃO criar assinatura no Mercado Pago
- ✅ Criar assinatura APENAS no banco de dados local
- ✅ Ativar automaticamente por 15 dias
- ✅ Após 15 dias, exigir upgrade para plano pago

**Pseudocódigo:**
```python
@router.post("/subscribe/{plan_slug}")
async def subscribe_to_plan(
    plan_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Buscar plano escolhido
    plan = await get_plan_by_slug(db, plan_slug)

    # 2. Se plano é Trial (price == 0)
    if plan.price == 0.0:
        # Ativar localmente (SEM Mercado Pago)
        subscription = Subscription(
            professional_id=current_user.id,
            plan_id=plan.id,
            plan_amount=0.0,
            status="active",
            trial_ends_at=date.today() + timedelta(days=plan.trial_days),
            last_payment_date=date.today(),
            next_billing_date=None  # Trial não tem cobrança recorrente
        )
        db.add(subscription)
        current_user.subscription_status = "trial"
        current_user.subscription_plan_id = plan.id
        await db.commit()

        return {
            "message": "Trial ativado com sucesso!",
            "trial_ends_at": subscription.trial_ends_at,
            "requires_payment": False
        }

    # 3. Se plano é pago (Basic/Premium)
    else:
        # Criar assinatura no Mercado Pago
        mp_plan_data = {
            "auto_recurring": {
                "transaction_amount": plan.price,  # Usa preço do plano!
                ...
            }
        }
        # ... resto do fluxo com MP
```

---

### Solução 2: Adicionar Campo `plan_id` na Tabela `subscriptions`

**Problema atual:**
A tabela `subscriptions` não tem relação com `subscription_plans`.

**Solução:**
Adicionar migration para criar o relacionamento:

```python
# Migration
class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    professional_id = Column(Integer, ForeignKey("users.id"))

    # ADICIONAR ESTE CAMPO:
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)

    plan_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    trial_ends_at = Column(Date, nullable=True)  # NOVO: para controlar Trial
    # ... resto dos campos

    # ADICIONAR RELACIONAMENTO:
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
```

---

### Solução 3: Cronjob para Expirar Trials

**Necessário:**
Um script/cronjob que roda diariamente para verificar trials expirados:

```python
# backend/app/tasks/expire_trials.py
async def expire_trial_subscriptions():
    """
    Executa diariamente para expirar trials vencidos
    """
    async with AsyncSessionLocal() as db:
        # Buscar trials expirados
        result = await db.execute(
            select(Subscription).where(
                Subscription.status == "active",
                Subscription.trial_ends_at <= date.today()
            )
        )
        expired_trials = result.scalars().all()

        for subscription in expired_trials:
            # Buscar usuário
            user = await db.get(User, subscription.professional_id)

            # Desativar
            subscription.status = "expired"
            user.subscription_status = "inactive"

            # TODO: Enviar email notificando sobre expiração

        await db.commit()
        print(f"✓ {len(expired_trials)} trials expirados")
```

**Configurar no Railway:**
Usar Railway Cron Jobs ou similar para executar diariamente.

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Preparação (URGENTE)
- [ ] Criar migration para adicionar `plan_id` em `subscriptions`
- [ ] Criar migration para adicionar `trial_ends_at` em `subscriptions`
- [ ] Atualizar modelo `Subscription` no código
- [ ] Adicionar relacionamento com `SubscriptionPlan`

### Fase 2: Lógica de Negócio
- [ ] Criar endpoint `/subscribe/{plan_slug}` novo
- [ ] Implementar lógica especial para Trial (sem MP)
- [ ] Implementar lógica para planos pagos (com MP)
- [ ] Validar que Trial só pode ser usado 1x por CPF

### Fase 3: Automação
- [ ] Criar script `expire_trials.py`
- [ ] Configurar cronjob no Railway (diário às 00:00)
- [ ] Implementar notificação por email quando Trial expira
- [ ] Implementar notificação 3 dias antes de expirar

### Fase 4: Frontend
- [ ] Página de seleção de planos mostrando Trial, Basic, Premium
- [ ] Para Trial: ativação imediata sem pagamento
- [ ] Para Basic/Premium: fluxo com Mercado Pago
- [ ] Dashboard mostrando "Trial expira em X dias"

---

## 🎯 FLUXO RECOMENDADO PARA TRIAL

### Cadastro de Profissional:
```
1. Profissional se cadastra
   ↓
2. Sistema oferece 3 opções:
   - Trial (15 dias grátis, 3 serviços) ← ATIVA IMEDIATO
   - Basic (R$ 29.90/mês, 5 serviços) → Mercado Pago
   - Premium (R$ 49.90/mês, ilimitado) → Mercado Pago
   ↓
3. Se escolher Trial:
   - Criar subscription no banco (sem MP)
   - status = "active"
   - trial_ends_at = hoje + 15 dias
   - Liberar funcionalidades
   ↓
4. Cronjob diário verifica:
   - Se trial_ends_at <= hoje → marcar como "expired"
   - Enviar email: "Seu trial expirou, escolha um plano"
```

### Durante o Trial:
```
- Profissional pode usar até 3 serviços
- Dashboard mostra: "Trial: faltam X dias"
- 3 dias antes: "Seu trial expira em 3 dias, escolha um plano"
```

### Após Expirar:
```
- Status muda para "expired"
- Profissional NÃO aparece mais nas buscas
- Ao fazer login: modal "Seu trial expirou, escolha Basic ou Premium"
```

---

## 🔐 VALIDAÇÕES IMPORTANTES

### Evitar Abuso do Trial:
```python
# Verificar se CPF já usou Trial antes
existing_trial = await db.execute(
    select(Subscription).join(User).where(
        User.cpf == current_user.cpf,
        Subscription.plan_id == trial_plan.id
    )
)

if existing_trial.scalar_one_or_none():
    raise HTTPException(
        status_code=400,
        detail="CPF já utilizou o período trial. Escolha Basic ou Premium."
    )
```

---

## 💰 DIFERENÇA ENTRE OS PLANOS

| Aspecto | Trial | Basic | Premium |
|---------|-------|-------|---------|
| Preço | R$ 0,00 | R$ 29,90/mês | R$ 49,90/mês |
| Duração | 15 dias | Recorrente | Recorrente |
| Serviços | 3 | 5 | Ilimitado |
| Mercado Pago | ❌ NÃO | ✅ SIM | ✅ SIM |
| Cobrança Recorrente | ❌ NÃO | ✅ SIM | ✅ SIM |
| Prioridade Busca | Normal | Normal | Alta |
| Ativação | Imediata | Após pagamento | Após pagamento |

---

## 🚨 RISCOS SE NÃO CORRIGIR

1. **Trial vai tentar cobrar R$ 1,00** (valor atual de SUBSCRIPTION_AMOUNT)
2. **Erro no Mercado Pago** se tentar criar assinatura com valor R$ 0,00
3. **Trial nunca expira** (sem cronjob)
4. **Usuários podem usar Trial infinitamente** (sem validação de CPF)
5. **Todos os planos cobram o mesmo valor** (não diferencia preço)

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

**URGENTE - Antes de liberar para testes:**

1. ✅ Criar migration para adicionar campos `plan_id` e `trial_ends_at`
2. ✅ Implementar endpoint `/subscribe/{plan_slug}` que consulta tabela de planos
3. ✅ Criar lógica especial: Trial sem MP, pagos com MP
4. ✅ Implementar cronjob de expiração

**Quer que eu crie o código corrigido agora?** 🚀

---

**Última atualização**: 2026-01-14
