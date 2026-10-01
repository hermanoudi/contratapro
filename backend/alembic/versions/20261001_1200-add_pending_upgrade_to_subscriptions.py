"""add pending upgrade fields to subscriptions

O upgrade de plano não troca mais o plano na hora: fica guardado em
pending_* até o Mercado Pago autorizar o novo preapproval (webhook).

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-10-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('subscriptions', sa.Column('pending_plan_id', sa.Integer(), nullable=True))
    op.add_column('subscriptions', sa.Column('pending_preapproval_id', sa.String(), nullable=True))
    op.add_column('subscriptions', sa.Column('pending_init_point', sa.String(), nullable=True))
    op.create_foreign_key(
        'fk_subscriptions_pending_plan_id', 'subscriptions', 'subscription_plans',
        ['pending_plan_id'], ['id']
    )
    op.create_index('ix_subscriptions_pending_preapproval_id', 'subscriptions', ['pending_preapproval_id'])


def downgrade() -> None:
    op.drop_index('ix_subscriptions_pending_preapproval_id', table_name='subscriptions')
    op.drop_constraint('fk_subscriptions_pending_plan_id', 'subscriptions', type_='foreignkey')
    op.drop_column('subscriptions', 'pending_init_point')
    op.drop_column('subscriptions', 'pending_preapproval_id')
    op.drop_column('subscriptions', 'pending_plan_id')
