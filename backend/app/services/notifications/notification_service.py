import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ...models import Notification, User, Appointment, Service
from .email_adapter import email_adapter
from .templates import email_templates

logger = logging.getLogger(__name__)


class NotificationService:
    """Serviço principal de notificações que orquestra o envio"""

    def __init__(self):
        self.email_adapter = email_adapter

    async def create_and_send_notification(
        self,
        db: AsyncSession,
        user_id: int,
        appointment_id: int,
        notification_type: str,
        channel: str = "email"
    ) -> Optional[Notification]:
        """
        Cria um registro de notificação e envia de forma assíncrona.

        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário destinatário
            appointment_id: ID do agendamento relacionado
            notification_type: Tipo da notificação
            channel: Canal de envio (email, sms, etc)

        Returns:
            Notification: Registro da notificação criada
        """
        try:
            # Buscar appointment
            result = await db.execute(
                select(Appointment).filter(Appointment.id == appointment_id)
            )
            appointment = result.scalars().first()

            if not appointment:
                logger.error(f"Appointment {appointment_id} não encontrado")
                return None

            # Buscar usuário destinatário
            user_result = await db.execute(
                select(User).filter(User.id == user_id)
            )
            user = user_result.scalars().first()

            if not user:
                logger.error(f"User {user_id} não encontrado")
                return None

            # Buscar serviço
            service_result = await db.execute(
                select(Service).filter(Service.id == appointment.service_id)
            )
            service = service_result.scalars().first()

            # Buscar a outra parte (profissional ou cliente)
            if user_id == appointment.professional_id:
                other_result = await db.execute(
                    select(User).filter(User.id == appointment.client_id)
                )
                other_party = other_result.scalars().first()
                is_professional = True
            else:
                other_result = await db.execute(
                    select(User).filter(User.id == appointment.professional_id)
                )
                other_party = other_result.scalars().first()
                is_professional = False

            # Gerar conteúdo do e-mail baseado no tipo
            if notification_type == "new_appointment":
                subject, plain_text, html = email_templates.new_appointment(
                    recipient_name=user.name,
                    is_professional=is_professional,
                    service_title=service.title if service else "Serviço",
                    appointment_date=appointment.date,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    other_party_name=other_party.name if other_party else "N/A",
                    other_party_whatsapp=other_party.whatsapp if other_party else None
                )
            elif notification_type == "appointment_updated":
                subject, plain_text, html = email_templates.appointment_updated(
                    recipient_name=user.name,
                    is_professional=is_professional,
                    service_title=service.title if service else "Serviço",
                    appointment_date=appointment.date,
                    start_time=appointment.start_time,
                    end_time=appointment.end_time,
                    other_party_name=other_party.name if other_party else "N/A",
                    new_status=appointment.status
                )
            elif notification_type == "appointment_cancelled":
                subject, plain_text, html = email_templates.appointment_cancelled(
                    recipient_name=user.name,
                    is_professional=is_professional,
                    service_title=service.title if service else "Serviço",
                    appointment_date=appointment.date,
                    start_time=appointment.start_time,
                    other_party_name=other_party.name if other_party else "N/A",
                    reason=appointment.reason
                )
            else:
                logger.error(f"Tipo de notificação desconhecido: {notification_type}")
                return None

            # Criar registro de notificação
            notification = Notification(
                user_id=user_id,
                appointment_id=appointment_id,
                type=notification_type,
                channel=channel,
                status="pending",
                title=subject,
                message=plain_text
            )

            db.add(notification)
            await db.commit()
            await db.refresh(notification)

            # Enviar a notificação
            success, error = await self.email_adapter.send(
                to=user.email,
                subject=subject,
                body=plain_text,
                html_body=html
            )

            # Atualizar status da notificação
            if success:
                notification.status = "sent"
                notification.sent_at = datetime.now()
                logger.info(f"Notificação {notification.id} enviada com sucesso para {user.email}")
            else:
                notification.status = "error"
                notification.error_message = error
                logger.error(f"Falha ao enviar notificação {notification.id}: {error}")

            await db.commit()
            await db.refresh(notification)

            return notification

        except Exception as e:
            logger.error(f"Erro ao criar/enviar notificação: {str(e)}")
            return None

    async def notify_appointment_created(
        self,
        db: AsyncSession,
        appointment_id: int
    ):
        """
        Envia notificações para cliente e profissional sobre novo agendamento.

        Args:
            db: Sessão do banco de dados
            appointment_id: ID do agendamento criado
        """
        result = await db.execute(
            select(Appointment).filter(Appointment.id == appointment_id)
        )
        appointment = result.scalars().first()

        if not appointment:
            logger.error(f"Appointment {appointment_id} não encontrado para notificação")
            return

        # Notificar profissional
        await self.create_and_send_notification(
            db=db,
            user_id=appointment.professional_id,
            appointment_id=appointment_id,
            notification_type="new_appointment"
        )

        # Notificar cliente
        await self.create_and_send_notification(
            db=db,
            user_id=appointment.client_id,
            appointment_id=appointment_id,
            notification_type="new_appointment"
        )

    async def notify_appointment_status_changed(
        self,
        db: AsyncSession,
        appointment_id: int,
        new_status: str
    ):
        """
        Envia notificações sobre mudança de status do agendamento.

        Args:
            db: Sessão do banco de dados
            appointment_id: ID do agendamento
            new_status: Novo status do agendamento
        """
        result = await db.execute(
            select(Appointment).filter(Appointment.id == appointment_id)
        )
        appointment = result.scalars().first()

        if not appointment:
            logger.error(f"Appointment {appointment_id} não encontrado para notificação")
            return

        # Determinar tipo de notificação baseado no status
        notification_type = (
            "appointment_cancelled" if new_status in ["cancelled", "suspended"]
            else "appointment_updated"
        )

        # Notificar profissional
        await self.create_and_send_notification(
            db=db,
            user_id=appointment.professional_id,
            appointment_id=appointment_id,
            notification_type=notification_type
        )

        # Notificar cliente
        await self.create_and_send_notification(
            db=db,
            user_id=appointment.client_id,
            appointment_id=appointment_id,
            notification_type=notification_type
        )


# Instância singleton
notification_service = NotificationService()
