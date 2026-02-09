import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date, timedelta
from sqlalchemy import func, or_, and_
from ..database import get_db
from ..models import Appointment, User, Service, ReviewToken
from ..schemas import AppointmentCreate, AppointmentResponse, AppointmentBase, AppointmentStatusUpdate, AppointmentPagination, ManualBlockCreate
from ..dependencies import get_current_user
from ..services.notifications import notification_service
from ..services.notifications.templates import email_templates
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/history", response_model=AppointmentPagination)
async def get_appointment_history(
    page: int = 1,
    size: int = 10,
    status_filter: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    client_id: Optional[int] = None,
    professional_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * size

    # Base filter: Show any appointment where the user is involved (as client or professional)
    filters = [
        or_(
            Appointment.client_id == current_user.id,
            Appointment.professional_id == current_user.id
        )
    ]

    # Apply optional filters
    if status_filter:
        filters.append(Appointment.status == status_filter.lower())

    if start_date:
        filters.append(Appointment.date >= start_date)

    if end_date:
        filters.append(Appointment.date <= end_date)

    # Client filter (only for professionals viewing their history)
    if client_id and current_user.is_professional:
        filters.append(Appointment.client_id == client_id)

    # Professional filter (only for clients viewing their history)
    if professional_id and not current_user.is_professional:
        filters.append(Appointment.professional_id == professional_id)

    filter_stmt = and_(*filters)

    # Count total
    count_query = select(func.count()).select_from(Appointment).filter(filter_stmt)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Fetch items - Order by date desc, then start_time desc (newest first)
    query = select(Appointment).options(
        selectinload(Appointment.client),
        selectinload(Appointment.professional),
        selectinload(Appointment.service)
    ).filter(filter_stmt).order_by(
        Appointment.date.desc(),
        Appointment.start_time.desc()
    ).offset(skip).limit(size)

    result = await db.execute(query)
    appointments = result.scalars().all()
    
    items = []
    for appt in appointments:
        # Use model_validate for Pydantic v2, fallback to from_orm for v1
        try:
            resp = AppointmentResponse.model_validate(appt)
        except AttributeError:
            resp = AppointmentResponse.from_orm(appt)
            
        if appt.client:
            resp.client_name = appt.client.name
        if appt.professional:
            resp.professional_name = appt.professional.name
            resp.professional_category = appt.professional.category
        if appt.service:
            resp.service_title = appt.service.title
        items.append(resp)
        
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@router.patch("/{appt_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appt_id: int,
    status_update: AppointmentStatusUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment).options(
        selectinload(Appointment.client),
        selectinload(Appointment.professional),
        selectinload(Appointment.service),
    ).filter(Appointment.id == appt_id)
    result = await db.execute(query)
    appt = result.scalars().first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Permission check
    is_professional = appt.professional_id == current_user.id
    is_client = appt.client_id == current_user.id

    if not is_professional and not is_client:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = status_update.status.lower()

    if new_status == "completed":
        if not is_professional:
            raise HTTPException(status_code=403, detail="Only professionals can mark as completed")
    elif new_status in ["cancelled", "suspended"]:
        if not status_update.reason or len(status_update.reason.strip()) < 5:
            raise HTTPException(status_code=400, detail="Reason is mandatory and must be at least 5 characters")
    else:
        raise HTTPException(status_code=400, detail="Invalid status")

    appt.status = new_status
    appt.reason = status_update.reason

    # Se concluido, gerar token de avaliacao na mesma transacao
    token_value = None
    if new_status == "completed":
        token_value = str(uuid.uuid4())
        review_token = ReviewToken(
            token=token_value,
            appointment_id=appt_id,
        )
        db.add(review_token)

    await db.commit()
    await db.refresh(appt)

    # Disparar notificacoes em background
    background_tasks.add_task(
        notification_service.notify_appointment_status_changed,
        db,
        appt_id,
        new_status,
    )

    # Enviar email de avaliacao em background
    if token_value:
        background_tasks.add_task(
            _send_review_email,
            db,
            appt_id,
            token_value,
        )

    # Enriquecer resposta com dados dos relacionamentos
    resp = AppointmentResponse.model_validate(appt)
    if appt.client:
        resp.client_name = appt.client.name
        resp.client_email = appt.client.email
        resp.client_whatsapp = appt.client.whatsapp
        resp.client_street = appt.client.street
        resp.client_number = appt.client.number
        resp.client_complement = appt.client.complement
        resp.client_neighborhood = appt.client.neighborhood
        resp.client_city = appt.client.city
        resp.client_state = appt.client.state
        resp.client_cep = appt.client.cep
    if appt.professional:
        resp.professional_name = appt.professional.name
        resp.professional_category = appt.professional.category
        resp.professional_whatsapp = appt.professional.whatsapp
        resp.professional_street = appt.professional.street
        resp.professional_number = appt.professional.number
        resp.professional_complement = appt.professional.complement
        resp.professional_neighborhood = appt.professional.neighborhood
        resp.professional_city = appt.professional.city
        resp.professional_state = appt.professional.state
        resp.professional_cep = appt.professional.cep
    if appt.service:
        resp.service_title = appt.service.title
        resp.service_duration_type = appt.service.duration_type

    return resp

@router.get("/me/week", response_model=List[AppointmentResponse])
async def get_weekly_appointments(
    start_date: date, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    end_date = start_date + timedelta(days=7)
    
    query = select(Appointment).options(
        selectinload(Appointment.client),
        selectinload(Appointment.service)
    ).filter(
        Appointment.professional_id == current_user.id,
        Appointment.date >= start_date,
        Appointment.date < end_date
    )
    
    result = await db.execute(query)
    appointments = result.scalars().all()
    
    # Enrich response with names
    response = []
    for appt in appointments:
        try:
            resp = AppointmentResponse.model_validate(appt)
        except AttributeError:
            resp = AppointmentResponse.from_orm(appt)
            
        if appt.client:
            resp.client_name = appt.client.name
            resp.client_whatsapp = appt.client.whatsapp
            resp.client_street = appt.client.street
            resp.client_number = appt.client.number
            resp.client_complement = appt.client.complement
            resp.client_neighborhood = appt.client.neighborhood
            resp.client_city = appt.client.city
            resp.client_state = appt.client.state
            resp.client_cep = appt.client.cep
        if appt.service:
            resp.service_title = appt.service.title
        response.append(resp)
        
    return response

@router.get("/{appt_id}", response_model=AppointmentResponse)
async def get_appointment_detail(
    appt_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment).options(
        selectinload(Appointment.client),
        selectinload(Appointment.professional),
        selectinload(Appointment.service)
    ).filter(Appointment.id == appt_id)
    
    result = await db.execute(query)
    appt = result.scalars().first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appt.professional_id != current_user.id and appt.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        resp = AppointmentResponse.model_validate(appt)
    except AttributeError:
        resp = AppointmentResponse.from_orm(appt)
        
    if appt.client:
        resp.client_name = appt.client.name
        resp.client_email = appt.client.email
        resp.client_whatsapp = appt.client.whatsapp
        resp.client_street = appt.client.street
        resp.client_number = appt.client.number
        resp.client_complement = appt.client.complement
        resp.client_neighborhood = appt.client.neighborhood
        resp.client_city = appt.client.city
        resp.client_state = appt.client.state
        resp.client_cep = appt.client.cep
    if appt.professional:
        resp.professional_name = appt.professional.name
        resp.professional_street = appt.professional.street
        resp.professional_number = appt.professional.number
        resp.professional_complement = appt.professional.complement
        resp.professional_neighborhood = appt.professional.neighborhood
        resp.professional_city = appt.professional.city
        resp.professional_state = appt.professional.state
        resp.professional_cep = appt.professional.cep
    if appt.service:
        resp.service_title = appt.service.title

    return resp

@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appt: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from ..models import WorkingHour
    from ..services.whatsapp import whatsapp_service
    from datetime import datetime

    # 1. Check if professional is suspended
    pro_result = await db.execute(select(User).filter(User.id == appt.professional_id))
    professional = pro_result.scalars().first()
    if not professional or professional.is_suspended:
        raise HTTPException(status_code=400, detail="Professional is currently not accepting appointments")

    # 1.5. Get service to check duration_type
    service_result = await db.execute(select(Service).filter(Service.id == appt.service_id))
    service = service_result.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 2. Check if professional works on this day/time
    # day_of_week: 0=Monday, 6=Sunday (Python's date.weekday() matches this)
    day_of_week = appt.date.weekday()

    # Para serviços diários, buscar o horário de trabalho do dia
    if service.duration_type == 'daily':
        wh_query = select(WorkingHour).filter(
            WorkingHour.professional_id == appt.professional_id,
            WorkingHour.day_of_week == day_of_week
        )
        wh_result = await db.execute(wh_query)
        working_hour = wh_result.scalars().first()

        if not working_hour:
            raise HTTPException(status_code=400, detail="Professional is not available on this day")

        # Para serviços diários, usar o horário completo de trabalho
        appt.start_time = working_hour.start_time
        appt.end_time = working_hour.end_time
    elif not appt.start_time or not appt.end_time:
        # Se não for diária, start_time e end_time são obrigatórios
        raise HTTPException(status_code=400, detail="start_time and end_time are required for hourly services")
    else:
        # Para serviços por hora, validar se está dentro do horário de trabalho
        wh_query = select(WorkingHour).filter(
            WorkingHour.professional_id == appt.professional_id,
            WorkingHour.day_of_week == day_of_week,
            WorkingHour.start_time <= appt.start_time,
            WorkingHour.end_time >= appt.end_time
        )
        wh_result = await db.execute(wh_query)
        if not wh_result.scalars().first():
            raise HTTPException(status_code=400, detail="Professional is not available at this time")

    # 3. Check if slot is already taken
    conflict_query = select(Appointment).filter(
        Appointment.professional_id == appt.professional_id,
        Appointment.date == appt.date,
        Appointment.status.in_(["scheduled", "blocked"]),
        Appointment.start_time < appt.end_time,
        Appointment.end_time > appt.start_time
    )
    conflict_result = await db.execute(conflict_query)
    if conflict_result.scalars().first():
        raise HTTPException(status_code=400, detail="This slot is already booked")

    new_appt = Appointment(
        client_id=current_user.id,
        professional_id=appt.professional_id,
        service_id=appt.service_id,
        date=appt.date,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status="scheduled"
    )
    db.add(new_appt)
    await db.commit()
    await db.refresh(new_appt)

    # Gerar link do WhatsApp para o cliente contatar o profissional
    data_hora = datetime.combine(appt.date, appt.start_time)
    whatsapp_link = whatsapp_service.gerar_link_agendamento(
        whatsapp=professional.whatsapp,
        profissional_nome=professional.name,
        cliente_nome=current_user.name,
        servico=service.title,
        data_hora=data_hora
    )

    # Adicionar link à resposta
    response = AppointmentResponse.model_validate(new_appt)
    response.whatsapp_link = whatsapp_link
    response.professional_name = professional.name
    response.professional_whatsapp = professional.whatsapp
    response.service_title = service.title

    # Disparar notificações em background
    background_tasks.add_task(
        notification_service.notify_appointment_created,
        db,
        new_appt.id
    )

    return response
@router.get("/professional/{pro_id}/week", response_model=List[AppointmentResponse])
async def get_pro_weekly_appointments(
    pro_id: int,
    start_date: date,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna agendamentos e bloqueios da semana do profissional.
    Inclui status 'scheduled' (agendamentos confirmados) e 'blocked' (bloqueios manuais)
    para que clientes vejam todos os horários indisponíveis.
    """
    end_date = start_date + timedelta(days=7)
    query = select(Appointment).filter(
        Appointment.professional_id == pro_id,
        Appointment.date >= start_date,
        Appointment.date < end_date,
        or_(Appointment.status == "scheduled", Appointment.status == "blocked")
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/history/filters/people")
async def get_filter_people(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get unique clients (for professionals) or professionals (for clients) for filtering"""

    if current_user.is_professional:
        # Get unique clients who have appointments with this professional
        query = select(User).join(
            Appointment, Appointment.client_id == User.id
        ).filter(
            Appointment.professional_id == current_user.id
        ).distinct()
    else:
        # Get unique professionals who have appointments with this client
        query = select(User).join(
            Appointment, Appointment.professional_id == User.id
        ).filter(
            Appointment.client_id == current_user.id
        ).distinct()

    result = await db.execute(query)
    people = result.scalars().all()

    return [{"id": person.id, "name": person.name} for person in people]

@router.get("/client/me", response_model=List[AppointmentResponse])
async def get_client_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment).options(
        selectinload(Appointment.professional),
        selectinload(Appointment.service)
    ).filter(
        Appointment.client_id == current_user.id
    ).order_by(Appointment.date.desc(), Appointment.start_time.desc())

    result = await db.execute(query)
    appointments = result.scalars().all()

    response = []
    for appt in appointments:
        try:
            resp = AppointmentResponse.model_validate(appt)
        except AttributeError:
            resp = AppointmentResponse.from_orm(appt)

        if appt.professional:
            resp.professional_name = appt.professional.name
            resp.professional_category = appt.professional.category
        if appt.service:
            resp.service_title = appt.service.title
            resp.service_duration_type = appt.service.duration_type
        response.append(resp)
    return response


@router.post("/block", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_block(
    block: ManualBlockCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permite que o profissional bloqueie horários manualmente.
    Útil para estender agendamentos ou marcar horários como indisponíveis.
    """
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Apenas profissionais podem bloquear horários")

    # Verificar se já existe algum agendamento nesse horário (apenas agendamentos com clientes, não bloqueios)
    existing_query = await db.execute(
        select(Appointment).filter(
            Appointment.professional_id == current_user.id,
            Appointment.date == block.date,
            Appointment.status == 'scheduled',  # Apenas agendamentos confirmados
            Appointment.is_manual_block == False,  # Não considerar bloqueios existentes
            or_(
                and_(Appointment.start_time <= block.start_time, Appointment.end_time > block.start_time),
                and_(Appointment.start_time < block.end_time, Appointment.end_time >= block.end_time),
                and_(Appointment.start_time >= block.start_time, Appointment.end_time <= block.end_time)
            )
        ).options(selectinload(Appointment.client))
    )
    existing_appointment = existing_query.scalars().first()

    if existing_appointment:
        # Formatar horários para mensagem
        start_time_str = existing_appointment.start_time.strftime("%H:%M")
        end_time_str = existing_appointment.end_time.strftime("%H:%M")
        client_name = existing_appointment.client.name if existing_appointment.client else "Cliente"

        raise HTTPException(
            status_code=400,
            detail=f"Existe um agendamento para o cliente {client_name} no horário {start_time_str} às {end_time_str}"
        )

    # Criar bloqueio manual
    manual_block = Appointment(
        client_id=current_user.id,  # O próprio profissional é o "cliente" do bloqueio
        professional_id=current_user.id,
        service_id=None,  # Não há serviço associado
        date=block.date,
        start_time=block.start_time,
        end_time=block.end_time,
        status='blocked',
        reason=block.reason,
        is_manual_block=True
    )

    db.add(manual_block)
    await db.commit()
    await db.refresh(manual_block)

    return AppointmentResponse.model_validate(manual_block)


@router.delete("/block/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_manual_block(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove um bloqueio manual de horário"""
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Apenas profissionais podem remover bloqueios")

    result = await db.execute(
        select(Appointment).filter(
            Appointment.id == appointment_id,
            Appointment.professional_id == current_user.id,
            Appointment.is_manual_block == True
        )
    )
    block = result.scalars().first()

    if not block:
        raise HTTPException(status_code=404, detail="Bloqueio não encontrado")

    await db.delete(block)
    await db.commit()


async def _send_review_email(
    db: AsyncSession,
    appointment_id: int,
    token_value: str,
):
    """
    Envia email de avaliacao ao cliente apos conclusao do servico.
    Executado em background para nao atrasar a resposta da API.
    """
    try:
        result = await db.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.client),
                selectinload(Appointment.professional),
                selectinload(Appointment.service),
            )
            .filter(Appointment.id == appointment_id)
        )
        appt = result.scalars().first()
        if not appt or not appt.client:
            return

        frontend_url = settings.FRONTEND_URL.rstrip("/")
        review_link = f"{frontend_url}/avaliar/{token_value}"

        professional_name = (
            appt.professional.name
            if appt.professional
            else "Profissional"
        )
        service_title = (
            appt.service.title
            if appt.service
            else "Servico"
        )

        subject, plain_text, html = email_templates.review_request(
            recipient_name=appt.client.name,
            professional_name=professional_name,
            service_title=service_title,
            appointment_date=appt.date,
            review_link=review_link,
        )

        await notification_service.send_subscription_email(
            to_email=appt.client.email,
            subject=subject,
            plain_text=plain_text,
            html=html,
        )

        logger.info(
            f"Email de avaliacao enviado para "
            f"{appt.client.email} (appointment {appointment_id})"
        )
    except Exception as e:
        logger.error(
            f"Erro ao enviar email de avaliacao "
            f"(appointment {appointment_id}): {str(e)}"
        )
