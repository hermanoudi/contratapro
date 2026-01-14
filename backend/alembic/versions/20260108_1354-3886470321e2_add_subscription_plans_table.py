"""add subscription plans table

Revision ID: 3886470321e2
Revises: 5ee1534e1c43
Create Date: 2026-01-08 13:54:07.743150

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3886470321e2'
down_revision: Union[str, None] = '5ee1534e1c43'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar tabela de planos de assinatura
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('slug', sa.String(length=50), nullable=False, unique=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('max_services', sa.Integer(), nullable=True),  # NULL = ilimitado
        sa.Column('can_manage_schedule', sa.Boolean(), default=False),
        sa.Column('can_receive_bookings', sa.Boolean(), default=False),
        sa.Column('priority_in_search', sa.Integer(), default=0),  # 0=normal, 1=alta
        sa.Column('trial_days', sa.Integer(), nullable=True),  # Apenas para trial
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Adicionar colunas na tabela users
    op.add_column('users', sa.Column('subscription_plan_id', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('trial_ends_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('subscription_started_at', sa.DateTime(), nullable=True))

    # Criar foreign key
    op.create_foreign_key(
        'fk_users_subscription_plan',
        'users', 'subscription_plans',
        ['subscription_plan_id'], ['id']
    )

    # Inserir planos padrão
    op.execute("""
        INSERT INTO subscription_plans (name, slug, price, max_services, can_manage_schedule, can_receive_bookings, priority_in_search, trial_days)
        VALUES
            ('Trial', 'trial', 0.00, NULL, true, true, 0, 30),
            ('Bronze', 'bronze', 20.00, 1, false, false, 0, NULL),
            ('Prata', 'prata', 30.00, NULL, true, true, 0, NULL),
            ('Ouro', 'ouro', 50.00, NULL, true, true, 1, NULL)
    """)


def downgrade() -> None:
    # Remover foreign key
    op.drop_constraint('fk_users_subscription_plan', 'users', type_='foreignkey')

    # Remover colunas da tabela users
    op.drop_column('users', 'subscription_started_at')
    op.drop_column('users', 'trial_ends_at')
    op.drop_column('users', 'subscription_plan_id')

    # Remover tabela de planos
    op.drop_table('subscription_plans')
