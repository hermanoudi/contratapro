# 🎯 Sistema de Planos de Assinatura - Backend COMPLETO

## 📊 Status: 100% Implementado ✅

Data: 08/01/2026

---

## 🏗️ Arquitetura Implementada

### 1. Banco de Dados

#### Tabela: `subscription_plans`
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  price FLOAT NOT NULL,
  max_services INTEGER,  -- NULL = ilimitado
  can_manage_schedule BOOLEAN DEFAULT false,
  can_receive_bookings BOOLEAN DEFAULT false,
  priority_in_search INTEGER DEFAULT 0,  -- 0=normal, 1=alta
  trial_days INTEGER,  -- Apenas para trial
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `users` (colunas adicionadas)
```sql
ALTER TABLE users ADD COLUMN subscription_plan_id INTEGER REFERENCES subscription_plans(id);
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMP;
```

#### Dados Iniciais (Seeds)
| ID | Nome | Slug | Preço | Max Serviços | Agenda | Agendamentos | Prioridade | Trial |
|----|------|------|-------|--------------|--------|--------------|------------|-------|
| 1 | Trial | trial | R$ 0 | Ilimitado | ✅ | ✅ | 0 | 30 dias |
| 2 | Bronze | bronze | R$ 20 | 1 | ❌ | ❌ | 0 | - |
| 3 | Prata | prata | R$ 30 | Ilimitado | ✅ | ✅ | 0 | - |
| 4 | Ouro | ouro | R$ 50 | Ilimitado | ✅ | ✅ | 1 | - |

---

## 🔌 API Endpoints

### Planos (`/plans`)

#### `GET /plans/`
**Descrição**: Lista todos os planos ativos
**Autenticação**: Não requerida
**Resposta**:
```json
[
  {
    "id": 1,
    "name": "Trial",
    "slug": "trial",
    "price": 0.0,
    "max_services": null,
    "can_manage_schedule": true,
    "can_receive_bookings": true,
    "priority_in_search": 0,
    "trial_days": 30,
    "is_active": true,
    "created_at": "2026-01-08T13:58:07.304507"
  }
]
```

#### `GET /plans/{slug}`
**Descrição**: Detalhes de um plano específico
**Autenticação**: Não requerida
**Parâmetros**: `slug` (trial, bronze, prata, ouro)

#### `GET /plans/me/features`
**Descrição**: Features do plano do usuário logado
**Autenticação**: Requerida (Bearer Token)
**Resposta**:
```json
{
  "has_plan": true,
  "plan_slug": "bronze",
  "plan_name": "Bronze",
  "trial_expired": false,
  "trial_days_left": null,
  "needs_upgrade": false,
  "features": {
    "max_services": 1,
    "can_manage_schedule": false,
    "can_receive_bookings": false,
    "priority_in_search": 0
  }
}
```

#### `POST /plans/me/change-plan`
**Descrição**: Altera o plano do usuário (upgrade/downgrade)
**Autenticação**: Requerida
**Body**:
```json
{
  "new_plan_slug": "prata"
}
```
**Resposta de Sucesso**:
```json
{
  "success": true,
  "plan": {
    "id": 3,
    "name": "Prata",
    "slug": "prata",
    "price": 30.0
  },
  "message": "Plano alterado para Prata com sucesso!"
}
```
**Resposta de Erro (Serviços Excedentes)**:
```json
{
  "success": false,
  "error": "services_exceeded",
  "message": "Você tem 3 serviços cadastrados. O plano Bronze permite apenas 1.",
  "current_services": [
    {"id": 1, "title": "Corte de Cabelo"},
    {"id": 2, "title": "Barba"},
    {"id": 3, "title": "Tintura"}
  ],
  "max_allowed": 1
}
```

#### `POST /plans/me/remove-excess-services`
**Descrição**: Remove serviços excedentes após downgrade
**Autenticação**: Requerida
**Body**:
```json
{
  "keep_service_ids": [1]
}
```

---

## 🔒 Sistema de Autorização

### Dependencies Implementadas

#### `check_can_create_service`
**Arquivo**: `backend/app/dependencies.py:70-110`
**Valida**:
- ✅ Usuário tem plano ativo
- ✅ Não atingiu limite de serviços (Bronze: max 1)
- ✅ Trial não expirou

**Erro 403 se**:
- Não tem plano
- Limite de serviços atingido
- Trial expirado

#### `check_can_manage_schedule`
**Arquivo**: `backend/app/dependencies.py:33-67`
**Valida**:
- ✅ Usuário tem plano ativo
- ✅ Plano permite gerenciar agenda (Bronze = não)
- ✅ Trial não expirou

**Erro 403 se**:
- Não tem plano
- Plano Bronze (não permite)
- Trial expirado

### Rotas Protegidas

| Endpoint | Dependency | Restrição |
|----------|-----------|-----------|
| `POST /services/` | `check_can_create_service` | Bronze: max 1 serviço |
| `POST /schedule/` | `check_can_manage_schedule` | Bronze: bloqueado |
| `DELETE /schedule/{id}` | `check_can_manage_schedule` | Bronze: bloqueado |

---

## 🔍 Priorização de Busca

### Implementação
**Arquivo**: `backend/app/routers/users.py:212-218`

```python
# Ordenar por prioridade do plano (Ouro aparece primeiro)
from ..models import SubscriptionPlan
query = query.join(
    SubscriptionPlan,
    User.subscription_plan_id == SubscriptionPlan.id,
    isouter=True
).order_by(SubscriptionPlan.priority_in_search.desc())
```

### Resultado
- **Ouro** (priority=1): Aparece primeiro
- **Trial, Bronze, Prata** (priority=0): Ordem padrão

**Exemplo de Busca**:
```json
[
  {
    "name": "João Barbeiro Premium",
    "plan": "ouro",
    "priority": 1
  },
  {
    "name": "Pedrinho Barber Show",
    "plan": "bronze",
    "priority": 0
  }
]
```

---

## 🎨 Integração Frontend

### Schema `ProfessionalPublic`
**Arquivo**: `backend/app/schemas.py:88-102`

Agora inclui:
```python
subscription_plan: Optional[SubscriptionPlanResponse] = None
```

### Busca de Profissionais
**Arquivo**: `backend/app/routers/users.py:190`

```python
.options(
    selectinload(User.services),
    selectinload(User.working_hours),
    selectinload(User.subscription_plan)  # Carrega dados do plano
)
```

### Resposta da API
```json
{
  "id": 21,
  "name": "Pedrinho Barber Show",
  "subscription_plan": {
    "name": "Bronze",
    "slug": "bronze",
    "can_receive_bookings": false
  }
}
```

### Botão Condicional (Frontend)
**Arquivo**: `frontend/src/pages/Search.jsx:781-790`

```jsx
{pro.subscription_plan?.can_receive_bookings && (
  <BookButton onClick={() => navigate(`/book/${pro.id}`)}>
    Ver Agenda e Reservar
  </BookButton>
)}
```

---

## 📝 Regras de Negócio Implementadas

### 1. Mudança de Plano

#### Regra: Não pode voltar para Trial
```python
if new_plan.slug == 'trial' and current_user.subscription_plan_id:
    raise HTTPException(403, "Não é possível voltar para o plano Trial")
```

#### Regra: Downgrade com Serviços Excedentes
```python
if len(services) > new_plan.max_services:
    return {
        "success": False,
        "error": "services_exceeded",
        "current_services": [...]
    }
```

#### Regra: Limpar Trial ao Migrar
```python
current_user.trial_ends_at = None
current_user.subscription_status = 'active'
```

### 2. Criação de Serviços

#### Bronze: Máximo 1 Serviço
```python
if count >= current_user.subscription_plan.max_services:
    raise HTTPException(403, "Limite de 1 serviço(s) atingido")
```

### 3. Gestão de Agenda

#### Bronze: Bloqueado
```python
if not current_user.subscription_plan.can_manage_schedule:
    raise HTTPException(403, "Seu plano não permite gerenciar agenda")
```

### 4. Verificação de Trial

#### Trial Expirado
```python
if current_user.trial_ends_at:
    now = datetime.now(current_user.trial_ends_at.tzinfo)
    if now > current_user.trial_ends_at:
        raise HTTPException(403, "Seu período de trial expirou")
```

---

## 📦 Arquivos Modificados/Criados

### Criados ✨
1. `backend/alembic/versions/20260108_1354-3886470321e2_add_subscription_plans_table.py`
2. `backend/app/routers/plans.py`

### Modificados 🔧
1. `backend/app/models.py` - Modelo `SubscriptionPlan` e relacionamento em `User`
2. `backend/app/schemas.py` - Schemas de planos e `ChangePlanRequest`
3. `backend/app/dependencies.py` - Dependencies de autorização
4. `backend/app/routers/services.py` - Middleware na criação de serviços
5. `backend/app/routers/schedule.py` - Middleware na gestão de agenda
6. `backend/app/routers/users.py` - Priorização de busca e carregamento de plano
7. `backend/app/main.py` - Inclusão do router de plans
8. `backend/app/routers/__init__.py` - Export do router de plans
9. `frontend/src/pages/Search.jsx` - Botão condicional de agendamento

---

## ✅ Testes Realizados

1. ✅ Listagem de planos (`GET /plans/`)
2. ✅ Detalhes de plano (`GET /plans/bronze`)
3. ✅ Busca prioriza Ouro (João antes de Pedrinho)
4. ✅ Schema retorna subscription_plan na busca
5. ✅ Botão de agendamento oculto para Bronze

---

## 🚀 Próximos Passos (Frontend)

### 1. Página de Seleção de Planos
- [ ] Cards de planos na Home
- [ ] Modal de confirmação de escolha
- [ ] Integração com Mercado Pago

### 2. Menu Dinâmico
- [ ] Carregar features do plano no login
- [ ] Renderizar menu baseado em permissões
- [ ] Bronze: Apenas Serviços, Assinatura, Perfil

### 3. Banner de Trial
- [ ] Componente `TrialBanner`
- [ ] Contador de dias restantes
- [ ] CTA para upgrade

### 4. Admin
- [ ] Endpoint para extender trial
- [ ] Interface para gerenciar planos de profissionais

---

## 📊 Progresso Geral

| Módulo | Status | Progresso |
|--------|--------|-----------|
| **Backend** | ✅ Completo | 100% |
| Database | ✅ | 100% |
| API Endpoints | ✅ | 100% |
| Autorização | ✅ | 100% |
| Priorização | ✅ | 100% |
| **Frontend** | 🔄 Parcial | 25% |
| Botão Condicional | ✅ | 100% |
| Página de Planos | ❌ | 0% |
| Menu Dinâmico | ❌ | 0% |
| Banner Trial | ❌ | 0% |

---

## 🎓 Lições e Boas Práticas

### ✅ Implementado Corretamente
1. **Separation of Concerns**: Dependencies separadas para cada validação
2. **DRY**: Reutilização de lógica de verificação de plano
3. **Security**: Validação no backend, não apenas frontend
4. **User Experience**: Mensagens de erro claras e acionáveis
5. **Database**: Foreign keys e constraints adequados
6. **API Design**: Endpoints RESTful e respostas consistentes

### 🔄 Melhorias Futuras
1. Cache de planos (raramente mudam)
2. Webhooks do Mercado Pago para ativação automática
3. Logs de auditoria para mudanças de plano
4. Métricas de conversão por plano
5. Testes automatizados (unitários e integração)

---

**Desenvolvido em 08/01/2026**
**Tempo de Implementação**: ~4 horas
**Linhas de Código**: ~700 linhas
