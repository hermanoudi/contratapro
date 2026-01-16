#!/usr/bin/env python3
"""
Cronjob para expirar trials vencidos.

Este script deve ser executado diariamente para:
1. Encontrar assinaturas trial que expiraram
2. Marcar como "expired"
3. Atualizar status do usuário para "inactive"

Uso via Railway:
    railway run python -m app.tasks.expire_trials

Uso local:
    DATABASE_URL="..." python -m app.tasks.expire_trials

Configurar no Railway como Cron Job:
    Schedule: 0 3 * * * (executa às 3h da manhã, todo dia)
"""

import sys
import os
import asyncio
import logging
from datetime import date

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select, and_
from app.database import AsyncSessionLocal
from app.models import Subscription, SubscriptionPlan, User


async def expire_trials():
    """
    Expira todas as assinaturas trial que passaram da data de expiração.
    """
    logger.info("=" * 60)
    logger.info("INICIANDO VERIFICAÇÃO DE TRIALS EXPIRADOS")
    logger.info("=" * 60)
    logger.info(f"Data atual: {date.today()}")

    expired_count = 0
    error_count = 0

    async with AsyncSessionLocal() as db:
        try:
            # Buscar assinaturas trial ativas que expiraram
            result = await db.execute(
                select(Subscription).where(
                    and_(
                        Subscription.status == "active",
                        Subscription.trial_ends_at != None,
                        Subscription.trial_ends_at < date.today()
                    )
                )
            )
            expired_subscriptions = result.scalars().all()

            logger.info(f"Encontradas {len(expired_subscriptions)} assinaturas trial expiradas")

            for subscription in expired_subscriptions:
                try:
                    # Buscar usuário
                    result = await db.execute(
                        select(User).where(User.id == subscription.professional_id)
                    )
                    user = result.scalar_one_or_none()

                    # Marcar assinatura como expirada
                    subscription.status = "expired"

                    # Atualizar status do usuário
                    if user:
                        user.subscription_status = "expired"

                    expired_count += 1
                    logger.info(
                        f"  ✓ Assinatura {subscription.id} expirada "
                        f"(usuário: {user.email if user else 'N/A'}, "
                        f"trial_ends_at: {subscription.trial_ends_at})"
                    )

                except Exception as e:
                    error_count += 1
                    logger.error(f"  ✗ Erro ao expirar assinatura {subscription.id}: {e}")

            await db.commit()

        except Exception as e:
            logger.error(f"Erro geral ao processar trials: {e}")
            raise

    logger.info("")
    logger.info("=" * 60)
    logger.info("RESUMO")
    logger.info("=" * 60)
    logger.info(f"Trials expirados: {expired_count}")
    logger.info(f"Erros: {error_count}")
    logger.info("=" * 60)

    return expired_count, error_count


async def notify_expiring_soon():
    """
    Notifica usuários cujo trial expira em 3 dias ou menos.
    (Para implementação futura com envio de email)
    """
    logger.info("")
    logger.info("Verificando trials próximos de expirar...")

    from datetime import timedelta
    warning_date = date.today() + timedelta(days=3)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Subscription, User).join(
                User, User.id == Subscription.professional_id
            ).where(
                and_(
                    Subscription.status == "active",
                    Subscription.trial_ends_at != None,
                    Subscription.trial_ends_at <= warning_date,
                    Subscription.trial_ends_at >= date.today()
                )
            )
        )
        expiring_soon = result.all()

        if expiring_soon:
            logger.info(f"Encontrados {len(expiring_soon)} trials próximos de expirar:")
            for subscription, user in expiring_soon:
                days_left = (subscription.trial_ends_at - date.today()).days
                logger.info(
                    f"  - {user.email}: expira em {days_left} dia(s) "
                    f"({subscription.trial_ends_at})"
                )
                # TODO: Implementar envio de email de notificação
        else:
            logger.info("Nenhum trial próximo de expirar.")


async def main():
    """Executa todas as tarefas de manutenção de trials."""
    try:
        # Expirar trials vencidos
        expired, errors = await expire_trials()

        # Notificar trials próximos de expirar
        await notify_expiring_soon()

        logger.info("")
        logger.info("✅ Tarefa concluída com sucesso!")

        # Retorna código de erro se houve problemas
        return 1 if errors > 0 else 0

    except Exception as e:
        logger.error(f"❌ Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
