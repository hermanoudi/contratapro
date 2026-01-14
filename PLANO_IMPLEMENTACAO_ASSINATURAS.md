# Plano de Implementação - Sistema de Assinaturas com Múltiplos Planos

## ✅ Progresso Atual (Atualizado em 08/01/2026)

### Backend - Infraestrutura Base ✅

- [x] Migration criada e aplicada
- [x] Tabela `subscription_plans` criada com 4 planos
- [x] Colunas adicionadas na tabela `users`:
  - `subscription_plan_id`
  - `trial_ends_at`
  - `subscription_started_at`
- [x] Modelo `SubscriptionPlan` criado
- [x] Modelo `User` atualizado com relacionamento
- [x] Schemas `SubscriptionPlanResponse` e `UserResponse` atualizados
- [x] Schema `ProfessionalPublic` atualizado com `subscription_plan`

### Backend - Router de Planos ✅

- [x] `GET /plans/` - Listar todos os planos ativos
- [x] `GET /plans/{slug}` - Detalhes de um plano específico
- [x] `GET /plans/me/features` - Features do plano do usuário logado

### Backend - Busca de Profissionais ✅

- [x] Busca carrega `subscription_plan` via `selectinload`
- [x] Frontend recebe dados do plano na busca

### Frontend - Botão Condicional ✅

- [x] Botão "Ver Agenda e Reservar" é ocultado para profissionais Bronze
- [x] Verificação baseada em `can_receive_bookings`

### Backend - Autorização e Middleware ✅

- [x] `check_can_create_service` - Valida limite de serviços e trial
- [x] `check_can_manage_schedule` - Valida permissão para agenda
- [x] Middleware aplicado em `/services` (criação de serviço)
- [x] Middleware aplicado em `/schedule` (criação e exclusão de horários)
- [x] Busca prioriza plano Ouro (order by `priority_in_search DESC`)

### Backend - Upgrade/Downgrade de Planos ✅

- [x] `POST /plans/me/change-plan` - Trocar plano do usuário
- [x] Validação: não pode voltar para trial
- [x] Validação: verifica serviços excedentes no downgrade
- [x] `POST /plans/me/remove-excess-services` - Remove serviços excedentes
- [x] Limpa trial ao trocar para plano pago
- [x] Atualiza `subscription_status` para 'active'

### Pendente 🔄

- [ ] Frontend - Página de seleção de planos
- [ ] Frontend - Menu dinâmico baseado no plano
- [ ] Frontend - Banner de trial
- [ ] Admin - Extender trial

## 📊 Planos Definidos

### 1. Trial (Gratuito - 30 dias)
- **Preço**: R$ 0,00
- **Duração**: 30 dias
- **Serviços**: Ilimitados
- **Agenda**: ✅ Sim
- **Agendamentos**: ✅ Sim
- **Prioridade busca**: Normal
- **Menu**: Completo
- **Obs**: Aviso de dias restantes no dashboard

### 2. Bronze
- **Preço**: R$ 20,00/mês
- **Serviços**: Máximo 1
- **Agenda**: ❌ Não
- **Agendamentos**: ❌ Não (clientes não podem agendar)
- **Prioridade busca**: Normal
- **Menu**: Serviços, Assinatura, Minha Conta

### 3. Prata
- **Preço**: R$ 30,00/mês
- **Serviços**: Ilimitados
- **Agenda**: ✅ Sim
- **Agendamentos**: ✅ Sim
- **Prioridade busca**: Normal
- **Menu**: Completo

### 4. Ouro
- **Preço**: R$ 50,00/mês
- **Serviços**: Ilimitados
- **Agenda**: ✅ Sim
- **Agendamentos**: ✅ Sim
- **Prioridade busca**: ⭐ ALTA (aparece primeiro)
- **Menu**: Completo

## 🎯 Próximos Passos da Implementação

### Fase 1: Backend - Modelos e Schemas (AGORA)
**Arquivo**: `backend/app/models.py`
- Criar modelo `SubscriptionPlan`
- Atualizar modelo `User` com relacionamento

**Arquivo**: `backend/app/schemas.py`
- `SubscriptionPlanResponse`
- `SubscriptionPlanCreate`
- Atualizar `UserResponse` com dados do plano

### Fase 2: Backend - Endpoints de Planos
**Arquivo**: `backend/app/routers/plans.py` (NOVO)
- `GET /api/plans` - Listar todos os planos
- `GET /api/plans/{slug}` - Detalhes de um plano
- `POST /api/users/me/plan` - Trocar plano (upgrade/downgrade)
- `GET /api/users/me/plan/features` - Features do plano atual

### Fase 3: Backend - Middleware de Autorização
**Arquivo**: `backend/app/dependencies.py`
- `check_plan_feature()` - Verificar se usuário tem acesso a feature
- `require_feature()` - Decorator para rotas

**Aplicar em rotas**:
- `/api/services` - Verificar limite de serviços (Bronze)
- `/api/schedule` - Verificar `can_manage_schedule`
- `/api/appointments` - Verificar `can_receive_bookings`

### Fase 4: Backend - Mercado Pago Atualizado
**Arquivo**: `backend/app/routers/mercadopago.py`
- Atualizar criação de assinatura com preço do plano
- Webhook para confirmar pagamento e ativar plano
- Lógica de trial → plano pago
- Upgrade/downgrade

### Fase 5: Backend - Busca Priorizada
**Arquivo**: `backend/app/routers/users.py`
- Modificar `search-by-service` para ordernar por `priority_in_search` DESC

### Fase 6: Frontend - Seleção de Planos na Home
**Arquivo**: `frontend/src/pages/Home.jsx`
- Seção com 4 cards de planos
- Botão "Começar" para cada plano
- Destaque no plano mais popular (Prata)

### Fase 7: Frontend - Menu Dinâmico
**Arquivo**: `frontend/src/components/ProfessionalLayout.jsx`
- Buscar features do plano do usuário
- Renderizar menu condicionalmente:
  - Bronze: Serviços, Assinatura, Meu Perfil
  - Outros: Menu completo

### Fase 8: Frontend - Página de Gerenciamento de Planos
**Arquivo**: `frontend/src/pages/SubscriptionManagement.jsx` (NOVO)
- Exibir plano atual
- Comparação de planos
- Botões de upgrade/downgrade
- Confirmar mudança via Mercado Pago

### Fase 9: Frontend - Contador Trial
**Arquivo**: `frontend/src/pages/Dashboard.jsx`
- Banner com dias restantes
- CTA para upgrade
- Esconder após trial expirar ou upgrade

### Fase 10: Admin - Estatísticas por Plano
**Arquivo**: `frontend/src/pages/AdminDashboard.jsx`
- Cards com total de profissionais por plano
- Receita mensal estimada
- Gráfico de distribuição

## 🔧 Configuração Necessária

### Variáveis de Ambiente (`.env`)
```bash
# Já existentes, apenas validar
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_PUBLIC_KEY=...
```

### Parâmetros Configuráveis
```python
# backend/app/config.py
TRIAL_DAYS = 30  # Dias do trial
PLAN_PRICES = {
    'trial': 0.00,
    'bronze': 20.00,
    'prata': 30.00,
    'ouro': 50.00
}
```

## 📝 Lógica de Negócio

### Fluxo de Cadastro do Profissional
1. Profissional se registra
2. Sistema atribui plano Trial automaticamente
3. Define `trial_ends_at` = hoje + 30 dias
4. Profissional tem acesso completo

### Fluxo de Expiração do Trial
1. Sistema verifica `trial_ends_at`
2. Se expirado e sem plano pago:
   - Bloquear acesso a features
   - Mostrar tela de upgrade obrigatório
   - Permitir apenas visualizar perfil

### Fluxo de Upgrade/Downgrade
1. Profissional escolhe novo plano
2. Sistema cria assinatura no Mercado Pago
3. Webhook confirma pagamento
4. Atualiza `subscription_plan_id`
5. Define `subscription_started_at`
6. Limpa `trial_ends_at` se existir

### Fluxo de Downgrade
1. Profissional downgrade (ex: Prata → Bronze)
2. Sistema verifica se tem mais de 1 serviço
3. Se sim, solicita escolha de 1 serviço para manter
4. Desativa serviços excedentes
5. Aplica downgrade

## 🚨 Regras de Validação

### Ao Criar Serviço
```python
if user.plan.max_services:
    current_count = count_services(user.id)
    if current_count >= user.plan.max_services:
        raise HTTPException(400, "Limite de serviços atingido. Faça upgrade!")
```

### Ao Acessar Agenda
```python
if not user.plan.can_manage_schedule:
    raise HTTPException(403, "Recurso indisponível no seu plano")
```

### Ao Cliente Tentar Agendar
```python
if not professional.plan.can_receive_bookings:
    return "Este profissional não aceita agendamentos online"
```

## 🎨 Componentes UI Necessários

1. **PlanCard** - Card de plano individual
2. **PlanComparison** - Tabela comparativa
3. **TrialBanner** - Banner de aviso trial
4. **UpgradeModal** - Modal de confirmação
5. **FeatureGate** - Wrapper para features bloqueadas

## 🧪 Testes Necessários

- [ ] Cadastro com trial automático
- [ ] Upgrade trial → Bronze
- [ ] Downgrade Ouro → Prata
- [ ] Bloqueio de serviço excedente (Bronze)
- [ ] Bloqueio de agenda (Bronze)
- [ ] Priorização na busca (Ouro)
- [ ] Expiração de trial
- [ ] Webhook Mercado Pago

## 📅 Estimativa de Implementação

- Backend: ~4-6 horas
- Frontend: ~6-8 horas
- Testes: ~2-3 horas
- **Total**: ~12-17 horas

## ⚠️ Pontos de Atenção

1. **Migração de dados**: Profissionais existentes devem receber trial
2. **Mercado Pago**: Testar com credenciais de teste primeiro
3. **UX**: Deixar claro limitações de cada plano
4. **Performance**: Indexar `priority_in_search` na busca
5. **Segurança**: Validar mudança de plano no backend

---

## 🤔 Decisões Necessárias

Antes de continuar, preciso confirmar:

1. **Trial Automático**: Todo profissional novo começa com Trial?
2. **Forçar Escolha**: Após trial expirar, forçar upgrade ou permitir continuar limitado?
3. **Cancelamento**: Profissional pode cancelar e voltar para free/trial?
4. **Serviços Existentes**: No downgrade para Bronze com 3 serviços, qual manter? (deixar usuário escolher?)
5. **Mercado Pago**: Usar Checkout Pro ou API de Assinaturas?

---

**Quer que eu prossiga com a implementação ou prefere ajustar algo no plano?**
