# API Patterns

## Creating a New Router

1. Create `backend/app/routers/my_domain.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import MyModel
from ..schemas import MyModelCreate, MyModelResponse
from ..dependencies import get_current_user

router = APIRouter()
```

2. Register in `backend/app/routers/__init__.py`:

```python
from . import my_domain as _my_domain
my_domain = _my_domain.router
# Add to __all__
```

3. Include in `backend/app/main.py`:

```python
from .routers import my_domain
app.include_router(my_domain, prefix="/my-domain", tags=["my-domain"])
```

## Auth Dependencies

| Dependency | When to Use |
| --------- | ----------- |
| `get_current_user` | Any authenticated endpoint |
| `check_can_manage_schedule` | Schedule/calendar endpoints (plan-gated) |
| `check_can_create_service` | Service creation (checks plan service limit) |

```python
@router.post("/", response_model=ServiceResponse)
async def create_service(
    service: ServiceCreate,
    current_user: User = Depends(check_can_create_service),
    db: AsyncSession = Depends(get_db)
):
```

## Error Handling

Use `HTTPException` with appropriate status codes:

```python
raise HTTPException(status_code=404, detail="Working hour not found")
raise HTTPException(status_code=403, detail="Only professionals can create services")
raise HTTPException(status_code=401, detail="Could not validate credentials")
```

## Schema Naming

| Pattern | Purpose | Example |
| ------- | ------- | ------- |
| `*Base` | Shared fields | `UserBase(email, name)` |
| `*Create` | Input for creation | `UserCreate(password, is_professional...)` |
| `*Update` | Partial update | `UserUpdate(name=None, email=None...)` |
| `*Response` | API output | `UserResponse` — MUST have `from_attributes = True` |

```python
class SubscriptionPlanResponse(SubscriptionPlanBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

## Background Tasks

Use FastAPI `BackgroundTasks` for emails:

```python
from fastapi import BackgroundTasks

@router.post("/reset-password")
async def reset_password(data: ResetRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_reset_email, email=data.email)
    return {"message": "Se o email existir, enviaremos instrucoes"}
```

## Scheduled Jobs

APScheduler with AsyncIOScheduler for cron jobs (configured in `main.py` lifespan):

```python
scheduler.add_job(
    subscription_jobs.run_daily_subscription_jobs,
    CronTrigger(hour=0, minute=30, timezone=brasilia_tz),
    id="daily_subscription_jobs",
    replace_existing=True
)
```

## URL Convention

Backend has NO `/api` prefix. The Vite dev proxy and Vercel rewrite strip `/api`:

```javascript
// frontend/vite.config.js
proxy: {
    '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, '')
    }
}
```

So backend routes are `/users`, `/services`, `/auth` — NOT `/api/users`.

## Professional Visibility Rules

Um profissional aparece na busca **somente** quando `subscription_status IN ('trial', 'active')` e não está bloqueado pelo admin (`is_active=True`).

| subscription_status | Aparece na busca | Botão agendar |
| ------------------- | ---------------- | ------------- |
| `trial` (dentro do prazo) | Sim | Sim |
| `active` | Sim | Sim |
| `expired` / `cancelled` / `inactive` | Não | Não |

**Agenda sem WorkingHours:** Se o profissional não tiver nenhum `WorkingHour` cadastrado, **todos os slots aparecem como indisponíveis** para o cliente. A ausência de horários configurados equivale a "fora de serviço" do ponto de vista do calendário.

## WhatsApp Integration

WhatsApp é implementado via **links `wa.me`** — sem integração com WhatsApp Business API. O serviço está em `backend/app/services/whatsapp.py`:

```python
from ..services.whatsapp import WhatsAppService

# Gerar link de agendamento
link = WhatsAppService.gerar_link_agendamento(
    whatsapp=professional.whatsapp,
    profissional_nome=professional.name,
    cliente_nome=client_name,
    servico=service_name,
    data_hora="15/03/2026 às 14:00",
    observacoes=""
)
# Retorna: https://wa.me/5511999999999?text=...
```

Use apenas para redirecionar o usuário — não há envio automático de mensagem pelo servidor.

## Admin Account Creation

Não existe endpoint de criação de admin. Use o script `backend/setup_production.py`:

```bash
# Via Railway CLI
railway run python setup_production.py --email admin@contratapro.com.br --password "SenhaForte123!"

# Ou via env vars
ADMIN_EMAIL=admin@contratapro.com.br ADMIN_PASSWORD=SenhaForte123! railway run python setup_production.py
```

O script cria `User(is_admin=True, is_professional=False)`. Se o email já existir, promove para admin sem alterar a senha.

## Subscription Cancellation Behavior

Ao cancelar assinatura (`POST /subscriptions/cancel`):

| Tipo | Comportamento |
| ---- | ------------- |
| Trial | Cancelamento imediato: `subscription.status = "cancelled"` |
| Plano pago | Cancelamento agendado para `next_billing_date` — acesso mantido até lá |
| Agendamentos futuros | **Não são cancelados automaticamente** — permanecem com `status="scheduled"` |
| Serviços | Não são excluídos |

O processamento diário (`subscription_jobs.py`, 00:30) efetiva o cancelamento agendado e muda `user.subscription_status = "cancelled"`. Após isso, o perfil sai da busca e o botão de agendamento é ocultado para novos clientes — mas agendamentos existentes **não mudam de status**.
