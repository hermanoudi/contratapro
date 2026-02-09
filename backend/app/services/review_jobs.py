"""
Servico de Jobs Schedulados para Avaliacoes

Jobs diarios que rodam para:
1. Auto-completar agendamentos passados
2. Gerar tokens de avaliacao e enviar emails para agendamentos
   recem-completados sem token (safety net)
"""

import logging
import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, selectinload

from ..models import Appointment, ReviewToken
from ..config import settings
from .notifications.notification_service import notification_service
from .notifications.templates import email_templates

logger = logging.getLogger(__name__)


class ReviewJobsService:
    """Servico para executar jobs schedulados de avaliacoes"""

    def __init__(self):
        self.engine = None
        self.async_session = None

    async def init_db(self):
        """Inicializa conexao com banco de dados"""
        if not self.engine:
            db_url = settings.DATABASE_URL
            if db_url.startswith("postgresql://"):
                db_url = db_url.replace(
                    "postgresql://", "postgresql+asyncpg://"
                )
            self.engine = create_async_engine(db_url, echo=False)
            self.async_session = sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )

    async def get_session(self) -> AsyncSession:
        """Retorna uma sessao do banco"""
        await self.init_db()
        return self.async_session()

    # ==================== JOB PRINCIPAL ====================

    async def run_daily_review_jobs(self):
        """
        Job principal que roda diariamente (01:00 Brasilia).
        1. Auto-completa agendamentos passados
        2. Envia emails de avaliacao pendentes (safety net)
        """
        logger.info("=" * 50)
        logger.info("Iniciando jobs diarios de avaliacao")
        logger.info(f"Data atual: {date.today()}")
        logger.info("=" * 50)

        try:
            await self.auto_complete_past_appointments()
            await self.send_pending_review_emails()
            logger.info(
                "Jobs diarios de avaliacao finalizados com sucesso"
            )
        except Exception as e:
            logger.error(
                f"Erro nos jobs diarios de avaliacao: {str(e)}"
            )
            raise

    # ==================== AUTO-COMPLETAR ====================

    async def auto_complete_past_appointments(self):
        """
        Auto-completa agendamentos com status 'scheduled'
        cuja data ja passou. Gera token de avaliacao para cada.
        """
        logger.info("Auto-completando agendamentos passados...")

        async with await self.get_session() as db:
            today = date.today()

            # Buscar agendamentos scheduled com data passada
            result = await db.execute(
                select(Appointment)
                .options(
                    selectinload(Appointment.client),
                    selectinload(Appointment.professional),
                    selectinload(Appointment.service),
                )
                .filter(
                    Appointment.status == "scheduled",
                    Appointment.is_manual_block.is_(False),
                    Appointment.date < today,
                )
            )
            appointments = result.scalars().all()

            count = 0
            for appt in appointments:
                appt.status = "completed"
                await self._generate_token_and_send_email(db, appt)
                count += 1

            await db.commit()
            logger.info(
                f"Agendamentos auto-completados: {count}"
            )

    # ==================== EMAILS PENDENTES ====================

    async def send_pending_review_emails(self):
        """
        Busca agendamentos completed sem token de avaliacao
        e envia email. Safety net para falhas no fluxo principal.
        """
        logger.info(
            "Verificando emails de avaliacao pendentes..."
        )

        async with await self.get_session() as db:
            # IDs que ja tem token
            subquery = select(ReviewToken.appointment_id)

            result = await db.execute(
                select(Appointment)
                .options(
                    selectinload(Appointment.client),
                    selectinload(Appointment.professional),
                    selectinload(Appointment.service),
                )
                .filter(
                    Appointment.status == "completed",
                    Appointment.is_manual_block.is_(False),
                    ~Appointment.id.in_(subquery),
                )
            )
            appointments = result.scalars().all()

            count = 0
            for appt in appointments:
                await self._generate_token_and_send_email(db, appt)
                count += 1

            await db.commit()
            logger.info(
                f"Emails de avaliacao enviados (safety net): {count}"
            )

    # ==================== HELPER ====================

    async def _generate_token_and_send_email(
        self,
        db: AsyncSession,
        appointment: Appointment,
    ):
        """Gera token UUID e envia email de avaliacao ao cliente"""
        try:
            token_value = str(uuid.uuid4())

            review_token = ReviewToken(
                token=token_value,
                appointment_id=appointment.id,
            )
            db.add(review_token)

            # Enviar email ao cliente
            if (
                appointment.client
                and appointment.client.email
            ):
                frontend_url = settings.FRONTEND_URL.rstrip("/")
                review_link = (
                    f"{frontend_url}/avaliar/{token_value}"
                )

                professional_name = (
                    appointment.professional.name
                    if appointment.professional
                    else "Profissional"
                )
                service_title = (
                    appointment.service.title
                    if appointment.service
                    else "Servico"
                )

                subject, plain_text, html = (
                    email_templates.review_request(
                        recipient_name=appointment.client.name,
                        professional_name=professional_name,
                        service_title=service_title,
                        appointment_date=appointment.date,
                        review_link=review_link,
                    )
                )

                await notification_service.send_subscription_email(
                    to_email=appointment.client.email,
                    subject=subject,
                    plain_text=plain_text,
                    html=html,
                )

                logger.info(
                    f"Email de avaliacao enviado para "
                    f"{appointment.client.email} "
                    f"(appointment {appointment.id})"
                )

        except Exception as e:
            logger.error(
                f"Erro ao gerar token/enviar email para "
                f"appointment {appointment.id}: {str(e)}"
            )


# Instancia singleton
review_jobs = ReviewJobsService()
