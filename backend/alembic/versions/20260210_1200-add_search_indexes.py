"""add search indexes

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar extensão pg_trgm para suportar buscas ILIKE eficientes
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Índices simples para filtros booleanos/igualdade
    op.create_index('ix_users_is_professional', 'users', ['is_professional'])
    op.create_index('ix_users_subscription_status', 'users', ['subscription_status'])

    # Índices GIN com pg_trgm para ILIKE com wildcard
    # Isso permite buscas case-insensitive e partial match de forma eficiente
    op.create_index(
        'ix_users_city_trgm',
        'users',
        ['city'],
        postgresql_using='gin',
        postgresql_ops={'city': 'gin_trgm_ops'}
    )
    op.create_index(
        'ix_users_category_trgm',
        'users',
        ['category'],
        postgresql_using='gin',
        postgresql_ops={'category': 'gin_trgm_ops'}
    )


def downgrade() -> None:
    op.drop_index('ix_users_category_trgm')
    op.drop_index('ix_users_city_trgm')
    op.drop_index('ix_users_subscription_status')
    op.drop_index('ix_users_is_professional')
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
