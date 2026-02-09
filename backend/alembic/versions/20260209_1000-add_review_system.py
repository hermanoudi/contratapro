"""add review system

Revision ID: a1b2c3d4e5f6
Revises: 8b9c0d1e2f3a
Create Date: 2026-02-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8b9c0d1e2f3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabela review_tokens
    op.create_table(
        'review_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column(
            'token', sa.String(36),
            unique=True, nullable=False, index=True,
        ),
        sa.Column(
            'appointment_id', sa.Integer(),
            sa.ForeignKey('appointments.id'),
            nullable=False, unique=True,
        ),
        sa.Column(
            'created_at', sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            'used_at', sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Tabela reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column(
            'appointment_id', sa.Integer(),
            sa.ForeignKey('appointments.id'),
            nullable=False, unique=True,
        ),
        sa.Column(
            'professional_id', sa.Integer(),
            sa.ForeignKey('users.id'),
            nullable=False, index=True,
        ),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column(
            'customer_name', sa.String(255), nullable=False,
        ),
        sa.Column(
            'created_at', sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Campos denormalizados no User para performance
    op.add_column(
        'users',
        sa.Column('average_rating', sa.Float(), nullable=True),
    )
    op.add_column(
        'users',
        sa.Column(
            'total_reviews', sa.Integer(),
            server_default='0', nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column('users', 'total_reviews')
    op.drop_column('users', 'average_rating')
    op.drop_table('reviews')
    op.drop_table('review_tokens')
