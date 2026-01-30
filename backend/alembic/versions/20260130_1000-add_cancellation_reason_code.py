"""add cancellation_reason_code to subscriptions

Revision ID: add_cancellation_reason_code
Revises: ea99501454e6
Create Date: 2026-01-30 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_cancellation_reason_code'
down_revision = 'ea99501454e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add cancellation_reason_code column for analytics
    op.add_column(
        'subscriptions',
        sa.Column('cancellation_reason_code', sa.String(50), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('subscriptions', 'cancellation_reason_code')
