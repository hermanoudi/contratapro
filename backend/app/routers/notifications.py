from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, and_
from typing import Optional
from datetime import date

from ..database import get_db
from ..models import Notification, Appointment, User
from ..schemas import NotificationResponse, NotificationPagination
from ..dependencies import get_current_user
from ..services.notifications.email_adapter import email_adapter

router = APIRouter()


@router.get("/me", response_model=NotificationPagination)
async def get_my_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    type_filter: Optional[str] = None,
    status_filter: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna notificações do usuário atual com paginação e filtros.

    - **page**: Número da página (começa em 1)
    - **size**: Itens por página (máx 50)
    - **type_filter**: Filtrar por tipo (new_appointment, appointment_updated, appointment_cancelled)
    - **status_filter**: Filtrar por status (pending, sent, error)
    - **start_date**: Data inicial do filtro
    - **end_date**: Data final do filtro
    - **search**: Busca por nome de serviço, profissional ou cliente
    """
    skip = (page - 1) * size

    # Filtro base
    filters = [Notification.user_id == current_user.id]

    # Aplicar filtros opcionais
    if type_filter:
        filters.append(Notification.type == type_filter)

    if status_filter:
        filters.append(Notification.status == status_filter)

    if start_date:
        filters.append(func.date(Notification.created_at) >= start_date)

    if end_date:
        filters.append(func.date(Notification.created_at) <= end_date)

    filter_stmt = and_(*filters)

    # Contar total
    count_query = select(func.count()).select_from(Notification).filter(filter_stmt)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Buscar itens
    query = (
        select(Notification)
        .filter(filter_stmt)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(size)
    )

    result = await db.execute(query)
    notifications = result.scalars().all()

    # Enriquecer com dados do appointment
    items = []
    for notif in notifications:
        resp = NotificationResponse.model_validate(notif)

        if notif.appointment_id:
            appt_result = await db.execute(
                select(Appointment)
                .options(
                    selectinload(Appointment.service),
                    selectinload(Appointment.professional),
                    selectinload(Appointment.client)
                )
                .filter(Appointment.id == notif.appointment_id)
            )
            appt = appt_result.scalars().first()

            if appt:
                resp.appointment_date = appt.date
                resp.appointment_start_time = appt.start_time
                if appt.service:
                    resp.service_title = appt.service.title
                if appt.professional:
                    resp.professional_name = appt.professional.name
                if appt.client:
                    resp.client_name = appt.client.name

        items.append(resp)

    # Filtrar por busca se fornecido (busca client-side nos dados enriquecidos)
    if search:
        search_lower = search.lower()
        items = [
            item for item in items
            if (item.service_title and search_lower in item.service_title.lower()) or
               (item.professional_name and search_lower in item.professional_name.lower()) or
               (item.client_name and search_lower in item.client_name.lower()) or
               (search_lower in item.title.lower())
        ]
        total = len(items)

    pages = (total + size - 1) // size if total > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }


# IMPORTANTE: Rotas específicas ANTES da rota com parâmetro
@router.get("/smtp-status")
async def get_smtp_status(
    current_user: User = Depends(get_current_user)
):
    """
    Retorna o status da configuração SMTP (para debug).
    Não expõe a senha, apenas indica se está configurada.
    """
    import os

    # Debug: verificar se as variáveis estão no ambiente
    env_vars = {
        "SMTP_HOST_env": os.getenv("SMTP_HOST", "(não definido)"),
        "SMTP_PORT_env": os.getenv("SMTP_PORT", "(não definido)"),
        "SMTP_USER_env": os.getenv("SMTP_USER", "(não definido)"),
        "SMTP_FROM_env": os.getenv("SMTP_FROM", "(não definido)"),
        "SMTP_PASSWORD_set_env": bool(os.getenv("SMTP_PASSWORD")),
    }

    return {
        "configured": email_adapter.is_configured(),
        "host": email_adapter.host or "(não definido)",
        "port": email_adapter.port,
        "user": email_adapter.user or "(não definido)",
        "from_email": email_adapter.from_email or "(não definido)",
        "from_name": email_adapter.from_name or "(não definido)",
        "password_set": bool(email_adapter.password),
        "use_tls": email_adapter.use_tls,
        "env_debug": env_vars
    }


@router.post("/test")
async def test_email_notification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Envia um e-mail de teste para o usuário atual.
    Útil para verificar se a configuração SMTP está funcionando.
    """
    if not email_adapter.is_configured():
        raise HTTPException(
            status_code=500,
            detail="SMTP não configurado. Verifique as variáveis de ambiente."
        )

    subject = "ContrataPro - E-mail de Teste"
    plain_text = f"""
Olá {current_user.name},

Este é um e-mail de teste enviado pelo ContrataPro.
Se você está recebendo esta mensagem, significa que a configuração de e-mail está funcionando corretamente!

Atenciosamente,
Equipe ContrataPro
"""
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }}
        .success {{ background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ContrataPro</h1>
        </div>
        <div class="content">
            <h2>Olá {current_user.name}!</h2>
            <div class="success">
                ✓ E-mail de teste enviado com sucesso!
            </div>
            <p>Este é um e-mail de teste enviado pelo ContrataPro.</p>
            <p>Se você está recebendo esta mensagem, significa que a configuração de e-mail está funcionando corretamente!</p>
        </div>
        <div class="footer">
            <p>Atenciosamente,<br>Equipe ContrataPro</p>
        </div>
    </div>
</body>
</html>
"""

    success, error = await email_adapter.send(
        to=current_user.email,
        subject=subject,
        body=plain_text,
        html_body=html
    )

    if success:
        return {
            "success": True,
            "message": f"E-mail de teste enviado com sucesso para {current_user.email}"
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Falha ao enviar e-mail: {error}"
        )


# Rota com parâmetro DEPOIS das rotas específicas
@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification_detail(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna detalhes de uma notificação específica."""
    result = await db.execute(
        select(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalars().first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")

    resp = NotificationResponse.model_validate(notification)

    # Enriquecer com dados do appointment
    if notification.appointment_id:
        appt_result = await db.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.service),
                selectinload(Appointment.professional),
                selectinload(Appointment.client)
            )
            .filter(Appointment.id == notification.appointment_id)
        )
        appt = appt_result.scalars().first()

        if appt:
            resp.appointment_date = appt.date
            resp.appointment_start_time = appt.start_time
            if appt.service:
                resp.service_title = appt.service.title
            if appt.professional:
                resp.professional_name = appt.professional.name
            if appt.client:
                resp.client_name = appt.client.name

    return resp
