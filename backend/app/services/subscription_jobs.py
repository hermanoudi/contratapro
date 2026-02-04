"""
Servico de Jobs Schedulados para Assinaturas

Jobs diarios que rodam para:
1. Enviar lembretes de renovacao 7 dias antes do vencimento
2. Processar cancelamentos agendados
3. Processar mudancas de plano agendadas (downgrades)
4. Verificar trials expirando
5. Gerenciar periodo de tolerancia para falhas de pagamento
"""

import logging
from datetime import date, timedelta, datetime
from typing import List, Optional

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from ..models import Subscription, SubscriptionPlan, User
from ..config import settings
from .notifications.notification_service import notification_service
from .notifications.templates import email_templates

logger = logging.getLogger(__name__)


class SubscriptionJobsService:
    """Servico para executar jobs schedulados de assinaturas"""

    def __init__(self):
        self.engine = None
        self.async_session = None

    async def init_db(self):
        """Inicializa conexao com banco de dados"""
        if not self.engine:
            self.engine = create_async_engine(
                settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
                echo=False
            )
            self.async_session = sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )

    async def get_session(self) -> AsyncSession:
        """Retorna uma sessao do banco"""
        await self.init_db()
        return self.async_session()

    # ==================== JOB PRINCIPAL ====================

    async def run_daily_subscription_jobs(self):
        """
        Job principal que roda diariamente (recomendado: 00:30).
        Executa todas as verificacoes de assinatura.
        """
        logger.info("=" * 50)
        logger.info("Iniciando jobs diarios de assinatura")
        logger.info(f"Data atual: {date.today()}")
        logger.info("=" * 50)

        try:
            # 1. Enviar lembretes de renovacao (7 dias antes)
            await self.send_renewal_reminders()

            # 2. Processar cancelamentos agendados
            await self.process_scheduled_cancellations()

            # 3. Processar mudancas de plano agendadas (downgrades)
            await self.process_scheduled_plan_changes()

            # 4. Verificar trials expirando
            await self.check_expiring_trials()

            # 5. Verificar periodo de tolerancia vencido
            await self.check_grace_period_expired()

            logger.info("Jobs diarios de assinatura finalizados com sucesso")

        except Exception as e:
            logger.error(f"Erro nos jobs diarios de assinatura: {str(e)}")
            raise

    # ==================== LEMBRETES DE RENOVACAO ====================

    async def send_renewal_reminders(self):
        """
        Envia lembretes para assinaturas que vencem em 7 dias.
        - Planos pagos: avisa sobre renovacao automatica
        - Trials: avisa sobre expiracao e sugere upgrade
        """
        logger.info("Verificando assinaturas para lembrete de renovacao...")

        async with await self.get_session() as db:
            today = date.today()
            reminder_date = today + timedelta(days=7)

            # Buscar assinaturas pagas que vencem em 7 dias
            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .join(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(
                    and_(
                        Subscription.status == "active",
                        Subscription.next_billing_date == reminder_date,
                        or_(
                            Subscription.renewal_reminder_sent_at.is_(None),
                            Subscription.renewal_reminder_sent_at < today
                        ),
                        # Nao enviar se ja tem cancelamento agendado
                        Subscription.scheduled_cancellation_date.is_(None)
                    )
                )
            )
            paid_subscriptions = result.all()

            for sub, user, plan in paid_subscriptions:
                if plan.price > 0:
                    # Plano pago - avisar sobre renovacao automatica
                    await self._send_paid_renewal_reminder(db, sub, user, plan)
                else:
                    # Trial - avisar sobre expiracao
                    await self._send_trial_expiring_reminder(db, sub, user, plan)

            # Buscar trials que expiram em 7 dias
            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .join(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(
                    and_(
                        Subscription.status == "active",
                        Subscription.trial_ends_at == reminder_date,
                        or_(
                            Subscription.renewal_reminder_sent_at.is_(None),
                            Subscription.renewal_reminder_sent_at < today
                        )
                    )
                )
            )
            trials = result.all()

            for sub, user, plan in trials:
                await self._send_trial_expiring_reminder(db, sub, user, plan)

            await db.commit()
            logger.info(f"Lembretes enviados: {len(paid_subscriptions)} pagos, {len(trials)} trials")

    async def _send_paid_renewal_reminder(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        plan: SubscriptionPlan
    ):
        """Envia lembrete de renovacao para plano pago"""
        try:
            subject, plain_text, html = email_templates.renewal_reminder_paid(
                recipient_name=user.name,
                plan_name=plan.name,
                plan_price=plan.price,
                renewal_date=subscription.next_billing_date.strftime("%d/%m/%Y")
            )

            success = await notification_service.send_subscription_email(
                to_email=user.email,
                subject=subject,
                plain_text=plain_text,
                html=html
            )

            if success:
                subscription.renewal_reminder_sent_at = date.today()
                logger.info(f"Lembrete de renovacao enviado para {user.email}")

        except Exception as e:
            logger.error(f"Erro ao enviar lembrete para {user.email}: {str(e)}")

    async def _send_trial_expiring_reminder(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        plan: SubscriptionPlan
    ):
        """Envia lembrete de expiracao de trial"""
        try:
            expiration_date = subscription.trial_ends_at or subscription.next_billing_date
            days_remaining = (expiration_date - date.today()).days

            success = await notification_service.notify_trial_expiring_soon(
                user_email=user.email,
                user_name=user.name,
                days_remaining=days_remaining,
                expiration_date=expiration_date.strftime("%d/%m/%Y")
            )

            if success:
                subscription.renewal_reminder_sent_at = date.today()
                logger.info(f"Lembrete de trial expirando enviado para {user.email}")

        except Exception as e:
            logger.error(f"Erro ao enviar lembrete de trial para {user.email}: {str(e)}")

    # ==================== CANCELAMENTOS AGENDADOS ====================

    async def process_scheduled_cancellations(self):
        """
        Processa cancelamentos agendados para hoje.
        O usuario ja solicitou cancelamento mas continuou usando ate o vencimento.
        """
        logger.info("Processando cancelamentos agendados...")

        async with await self.get_session() as db:
            today = date.today()

            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .outerjoin(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(
                    and_(
                        Subscription.scheduled_cancellation_date <= today,
                        Subscription.status.in_(["active", "pending"])
                    )
                )
            )
            subscriptions = result.all()

            for sub, user, plan in subscriptions:
                await self._execute_scheduled_cancellation(db, sub, user, plan)

            await db.commit()
            logger.info(f"Cancelamentos processados: {len(subscriptions)}")

    async def _execute_scheduled_cancellation(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        plan: Optional[SubscriptionPlan]
    ):
        """Executa o cancelamento efetivo de uma assinatura"""
        try:
            logger.info(f"Executando cancelamento agendado para usuario {user.id}")

            # Atualizar status
            subscription.status = "cancelled"
            subscription.cancelled_at = datetime.now()
            subscription.scheduled_cancellation_date = None

            # Atualizar usuario
            user.subscription_status = "cancelled"

            # Enviar email de confirmacao de cancelamento efetivado
            plan_name = plan.name if plan else "Plano Profissional"
            await notification_service.notify_subscription_cancelled(
                user_email=user.email,
                user_name=user.name,
                plan_name=plan_name,
                cancellation_reason="Cancelamento agendado efetivado na data de vencimento"
            )

            logger.info(f"Cancelamento efetivado para usuario {user.id}")

        except Exception as e:
            logger.error(f"Erro ao processar cancelamento para usuario {user.id}: {str(e)}")

    # ==================== MUDANCAS DE PLANO AGENDADAS ====================

    async def process_scheduled_plan_changes(self):
        """
        Processa mudancas de plano agendadas para hoje.
        Usado para downgrades - usuario continua no plano atual ate vencimento.
        """
        logger.info("Processando mudancas de plano agendadas...")

        async with await self.get_session() as db:
            today = date.today()

            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .join(SubscriptionPlan, SubscriptionPlan.id == Subscription.scheduled_plan_id)
                .where(
                    and_(
                        Subscription.scheduled_plan_change_date <= today,
                        Subscription.scheduled_plan_id.isnot(None),
                        Subscription.status == "active"
                    )
                )
            )
            subscriptions = result.all()

            for sub, user, new_plan in subscriptions:
                await self._execute_scheduled_plan_change(db, sub, user, new_plan)

            await db.commit()
            logger.info(f"Mudancas de plano processadas: {len(subscriptions)}")

    async def _execute_scheduled_plan_change(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        new_plan: SubscriptionPlan
    ):
        """Executa a mudanca de plano agendada"""
        try:
            # Buscar plano atual para notificacao
            old_plan_result = await db.execute(
                select(SubscriptionPlan).where(SubscriptionPlan.id == subscription.plan_id)
            )
            old_plan = old_plan_result.scalar_one_or_none()
            old_plan_name = old_plan.name if old_plan else "Plano anterior"

            logger.info(f"Executando mudanca de plano agendada para usuario {user.id}: {old_plan_name} -> {new_plan.name}")

            # Atualizar assinatura
            subscription.plan_id = new_plan.id
            subscription.plan_amount = new_plan.price
            subscription.scheduled_plan_id = None
            subscription.scheduled_plan_change_date = None
            subscription.next_billing_date = date.today() + timedelta(days=30)

            # Atualizar usuario
            user.subscription_plan_id = new_plan.id

            # Enviar notificacao
            is_upgrade = new_plan.price > (old_plan.price if old_plan else 0)
            await notification_service.notify_subscription_plan_changed(
                user_email=user.email,
                user_name=user.name,
                old_plan_name=old_plan_name,
                new_plan_name=new_plan.name,
                new_plan_price=new_plan.price,
                is_upgrade=is_upgrade,
                requires_payment=False
            )

            logger.info(f"Mudanca de plano efetivada para usuario {user.id}")

        except Exception as e:
            logger.error(f"Erro ao processar mudanca de plano para usuario {user.id}: {str(e)}")

    # ==================== TRIALS EXPIRANDO ====================

    async def check_expiring_trials(self):
        """
        Verifica trials que expiram hoje e atualiza status.
        """
        logger.info("Verificando trials expirando...")

        async with await self.get_session() as db:
            today = date.today()

            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .outerjoin(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(
                    and_(
                        Subscription.trial_ends_at <= today,
                        Subscription.status == "active",
                        # Apenas trials (sem mercadopago_preapproval_id)
                        or_(
                            Subscription.mercadopago_preapproval_id.is_(None),
                            Subscription.plan_amount == 0
                        )
                    )
                )
            )
            expired_trials = result.all()

            for sub, user, plan in expired_trials:
                await self._expire_trial(db, sub, user, plan)

            await db.commit()
            logger.info(f"Trials expirados: {len(expired_trials)}")

    async def _expire_trial(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        plan: Optional[SubscriptionPlan]
    ):
        """Expira um trial"""
        try:
            logger.info(f"Expirando trial para usuario {user.id}")

            subscription.status = "expired"
            user.subscription_status = "expired"

            # Enviar email
            plan_name = plan.name if plan else "Trial"
            subject, plain_text, html = email_templates.trial_expired(
                recipient_name=user.name,
                plan_name=plan_name
            )

            await notification_service.send_subscription_email(
                to_email=user.email,
                subject=subject,
                plain_text=plain_text,
                html=html
            )

            logger.info(f"Trial expirado para usuario {user.id}")

        except Exception as e:
            logger.error(f"Erro ao expirar trial para usuario {user.id}: {str(e)}")

    # ==================== PERIODO DE TOLERANCIA ====================

    async def check_grace_period_expired(self):
        """
        Verifica assinaturas com periodo de tolerancia vencido (7 dias apos falha de pagamento).
        """
        logger.info("Verificando periodos de tolerancia vencidos...")

        async with await self.get_session() as db:
            today = date.today()

            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .outerjoin(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(
                    and_(
                        Subscription.grace_period_ends_at <= today,
                        Subscription.status == "active",
                        Subscription.payment_failure_count > 0
                    )
                )
            )
            expired_grace = result.all()

            for sub, user, plan in expired_grace:
                await self._suspend_for_non_payment(db, sub, user, plan)

            await db.commit()
            logger.info(f"Assinaturas suspensas por nao pagamento: {len(expired_grace)}")

    async def _suspend_for_non_payment(
        self,
        db: AsyncSession,
        subscription: Subscription,
        user: User,
        plan: Optional[SubscriptionPlan]
    ):
        """Suspende assinatura por nao pagamento apos periodo de tolerancia"""
        try:
            logger.info(f"Suspendendo assinatura por nao pagamento - usuario {user.id}")

            subscription.status = "suspended"
            user.subscription_status = "suspended"

            # Enviar email
            plan_name = plan.name if plan else "Plano Profissional"
            subject, plain_text, html = email_templates.subscription_suspended_non_payment(
                recipient_name=user.name,
                plan_name=plan_name
            )

            await notification_service.send_subscription_email(
                to_email=user.email,
                subject=subject,
                plain_text=plain_text,
                html=html
            )

            logger.info(f"Assinatura suspensa para usuario {user.id}")

        except Exception as e:
            logger.error(f"Erro ao suspender assinatura para usuario {user.id}: {str(e)}")

    # ==================== UTILITARIOS ====================

    async def handle_payment_failure(self, subscription_id: int):
        """
        Chamado quando o webhook do MP notifica falha de pagamento.
        Inicia periodo de tolerancia de 7 dias.
        """
        async with await self.get_session() as db:
            result = await db.execute(
                select(Subscription, User, SubscriptionPlan)
                .join(User, User.id == Subscription.professional_id)
                .outerjoin(SubscriptionPlan, SubscriptionPlan.id == Subscription.plan_id)
                .where(Subscription.id == subscription_id)
            )
            row = result.first()

            if not row:
                logger.error(f"Assinatura {subscription_id} nao encontrada")
                return

            sub, user, plan = row

            # Incrementar contador de falhas
            sub.payment_failure_count = (sub.payment_failure_count or 0) + 1
            sub.last_payment_failure_date = date.today()

            # Se primeira falha, iniciar periodo de tolerancia
            if not sub.grace_period_ends_at:
                sub.grace_period_ends_at = date.today() + timedelta(days=7)

            await db.commit()

            # Enviar email de notificacao
            plan_name = plan.name if plan else "Plano Profissional"
            days_remaining = (sub.grace_period_ends_at - date.today()).days

            subject, plain_text, html = email_templates.payment_failed(
                recipient_name=user.name,
                plan_name=plan_name,
                days_remaining=days_remaining
            )

            await notification_service.send_subscription_email(
                to_email=user.email,
                subject=subject,
                plain_text=plain_text,
                html=html
            )

            logger.info(f"Falha de pagamento registrada para usuario {user.id}. Tolerancia ate: {sub.grace_period_ends_at}")

    async def handle_payment_success(self, subscription_id: int):
        """
        Chamado quando o webhook do MP notifica pagamento aprovado.
        Reseta contadores de falha.
        """
        async with await self.get_session() as db:
            result = await db.execute(
                select(Subscription).where(Subscription.id == subscription_id)
            )
            sub = result.scalar_one_or_none()

            if not sub:
                return

            # Resetar contadores de falha
            sub.payment_failure_count = 0
            sub.last_payment_failure_date = None
            sub.grace_period_ends_at = None
            sub.last_payment_date = date.today()
            sub.next_billing_date = date.today() + timedelta(days=30)

            await db.commit()
            logger.info(f"Pagamento confirmado para assinatura {subscription_id}")


# Instancia singleton
subscription_jobs = SubscriptionJobsService()
