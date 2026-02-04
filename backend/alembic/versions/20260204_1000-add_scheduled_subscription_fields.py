"""add scheduled subscription fields

Revision ID: 7a8b9c0d1e2f
Revises: add_cancellation_reason_code
Create Date: 2026-02-04 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, None] = 'add_cancellation_reason_code'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Cancelamento agendado
    op.add_column('subscriptions', sa.Column('scheduled_cancellation_date', sa.Date(), nullable=True))

    # Mudanca de plano agendada (downgrades)
    op.add_column('subscriptions', sa.Column('scheduled_plan_id', sa.Integer(), nullable=True))
    op.add_column('subscriptions', sa.Column('scheduled_plan_change_date', sa.Date(), nullable=True))

    # Controle de falhas de pagamento
    op.add_column('subscriptions', sa.Column('payment_failure_count', sa.Integer(), server_default='0', nullable=True))
    op.add_column('subscriptions', sa.Column('last_payment_failure_date', sa.Date(), nullable=True))
    op.add_column('subscriptions', sa.Column('grace_period_ends_at', sa.Date(), nullable=True))

    # Notificacao de renovacao
    op.add_column('subscriptions', sa.Column('renewal_reminder_sent_at', sa.Date(), nullable=True))

    # Foreign key para scheduled_plan_id
    op.create_foreign_key(
        'fk_subscriptions_scheduled_plan_id',
        'subscriptions',
        'subscription_plans',
        ['scheduled_plan_id'],
        ['id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_subscriptions_scheduled_plan_id', 'subscriptions', type_='foreignkey')
    op.drop_column('subscriptions', 'renewal_reminder_sent_at')
    op.drop_column('subscriptions', 'grace_period_ends_at')
    op.drop_column('subscriptions', 'last_payment_failure_date')
    op.drop_column('subscriptions', 'payment_failure_count')
    op.drop_column('subscriptions', 'scheduled_plan_change_date')
    op.drop_column('subscriptions', 'scheduled_plan_id')
    op.drop_column('subscriptions', 'scheduled_cancellation_date')
