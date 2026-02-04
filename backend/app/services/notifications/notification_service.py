import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ...models import Notification, User, Appointment, Service
from ...config import settings
from .email_adapter import email_adapter
from .resend_adapter import resend_adapter
from .templates import email_templates

logger = logging.getLogger(__name__)


def get_email_adapter():
    """Retorna o adapter de e-mail apropriado baseado na configuração"""
    if settings.EMAIL_PROVIDER == "resend" and resend_adapter.is_configured():
        logger.info("Usando Resend como provedor de e-mail")
        return resend_adapter
    elif email_adapter.is_configured():
        logger.info("Usando SMTP como provedor de e-mail")
        return email_adapter
    else:
        logger.warning("Nenhum provedor de e-mail configurado")
        return email_adapter  # Retorna o SMTP como fallback


class NotificationService:
    """Serviço principal de notificações que orquestra o envio"""

    def __init__(self):
        self.email_adapter = get_email_adapter()

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


    # ==================== NOTIFICAÇÕES DE ASSINATURA ====================

    async def send_subscription_email(
        self,
        to_email: str,
        subject: str,
        plain_text: str,
        html: str
    ) -> bool:
        """
        Envia um e-mail de notificação de assinatura.

        Args:
            to_email: E-mail do destinatário
            subject: Assunto do e-mail
            plain_text: Corpo em texto puro
            html: Corpo em HTML

        Returns:
            bool: True se enviou com sucesso
        """
        try:
            success, error = await self.email_adapter.send(
                to=to_email,
                subject=subject,
                body=plain_text,
                html_body=html
            )

            if success:
                logger.info(f"E-mail de assinatura enviado para {to_email}: {subject}")
            else:
                logger.error(f"Falha ao enviar e-mail de assinatura para {to_email}: {error}")

            return success
        except Exception as e:
            logger.error(f"Erro ao enviar e-mail de assinatura: {str(e)}")
            return False

    async def notify_subscription_activated(
        self,
        user_email: str,
        user_name: str,
        plan_name: str,
        plan_price: float,
        is_trial: bool = False,
        trial_days: int = None,
        trial_end_date: str = None
    ) -> bool:
        """
        Notifica o usuário que sua assinatura foi ativada.

        Args:
            user_email: E-mail do usuário
            user_name: Nome do usuário
            plan_name: Nome do plano
            plan_price: Preço do plano
            is_trial: Se é um plano trial
            trial_days: Dias de trial (se aplicável)
            trial_end_date: Data de expiração do trial (se aplicável)

        Returns:
            bool: True se enviou com sucesso
        """
        subject, plain_text, html = email_templates.subscription_activated(
            recipient_name=user_name,
            plan_name=plan_name,
            plan_price=plan_price,
            is_trial=is_trial,
            trial_days=trial_days,
            trial_end_date=trial_end_date
        )

        return await self.send_subscription_email(user_email, subject, plain_text, html)

    async def notify_subscription_cancelled(
        self,
        user_email: str,
        user_name: str,
        plan_name: str,
        cancellation_reason: str = None
    ) -> bool:
        """
        Notifica o usuário que sua assinatura foi cancelada.

        Args:
            user_email: E-mail do usuário
            user_name: Nome do usuário
            plan_name: Nome do plano cancelado
            cancellation_reason: Motivo do cancelamento

        Returns:
            bool: True se enviou com sucesso
        """
        subject, plain_text, html = email_templates.subscription_cancelled(
            recipient_name=user_name,
            plan_name=plan_name,
            cancellation_reason=cancellation_reason
        )

        return await self.send_subscription_email(user_email, subject, plain_text, html)

    async def notify_subscription_plan_changed(
        self,
        user_email: str,
        user_name: str,
        old_plan_name: str,
        new_plan_name: str,
        new_plan_price: float,
        is_upgrade: bool,
        requires_payment: bool = False
    ) -> bool:
        """
        Notifica o usuário sobre mudança de plano.

        Args:
            user_email: E-mail do usuário
            user_name: Nome do usuário
            old_plan_name: Nome do plano anterior
            new_plan_name: Nome do novo plano
            new_plan_price: Preço do novo plano
            is_upgrade: Se é um upgrade
            requires_payment: Se requer pagamento

        Returns:
            bool: True se enviou com sucesso
        """
        subject, plain_text, html = email_templates.subscription_plan_changed(
            recipient_name=user_name,
            old_plan_name=old_plan_name,
            new_plan_name=new_plan_name,
            new_plan_price=new_plan_price,
            is_upgrade=is_upgrade,
            requires_payment=requires_payment
        )

        return await self.send_subscription_email(user_email, subject, plain_text, html)

    async def notify_trial_expiring_soon(
        self,
        user_email: str,
        user_name: str,
        days_remaining: int,
        expiration_date: str
    ) -> bool:
        """
        Notifica o usuário que o trial está expirando.

        Args:
            user_email: E-mail do usuário
            user_name: Nome do usuário
            days_remaining: Dias restantes
            expiration_date: Data de expiração formatada

        Returns:
            bool: True se enviou com sucesso
        """
        subject, plain_text, html = email_templates.trial_expiring_soon(
            recipient_name=user_name,
            days_remaining=days_remaining,
            expiration_date=expiration_date
        )

        return await self.send_subscription_email(user_email, subject, plain_text, html)


# Instância singleton
notification_service = NotificationService()
