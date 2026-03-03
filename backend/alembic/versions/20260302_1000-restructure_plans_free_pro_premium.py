"""restructure plans free pro premium

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar novos campos na tabela subscription_plans
    op.add_column('subscription_plans', sa.Column('max_appointments_per_month', sa.Integer(), nullable=True))
    op.add_column('subscription_plans', sa.Column('badge_label', sa.String(50), nullable=True))

    # Renomear plano trial → free (slug e name)
    op.execute("""
        UPDATE subscription_plans
        SET slug = 'free', name = 'Free', price = 0.0,
            max_services = 1, trial_days = NULL,
            priority_in_search = 0,
            max_appointments_per_month = 3,
            badge_label = NULL
        WHERE slug = 'trial'
    """)

    # Renomear plano basic → pro e atualizar valores
    op.execute("""
        UPDATE subscription_plans
        SET slug = 'pro', name = 'Pro', price = 19.90,
            max_services = NULL, trial_days = NULL,
            priority_in_search = 1,
            max_appointments_per_month = NULL,
            badge_label = 'Profissional Ativo'
        WHERE slug = 'basic'
    """)

    # Atualizar Premium: novo preço e campos
    op.execute("""
        UPDATE subscription_plans
        SET price = 39.90,
            priority_in_search = 2,
            max_appointments_per_month = NULL,
            badge_label = 'Destaque'
        WHERE slug = 'premium'
    """)

    # Migrar usuários com subscription_status = 'expired' (trial vencido)
    # → voltam para 'active' no plano free (já renomeado)
    op.execute("""
        UPDATE users
        SET subscription_status = 'active',
            trial_ends_at = NULL
        WHERE subscription_status = 'expired'
          AND subscription_plan_id IN (
              SELECT id FROM subscription_plans WHERE slug = 'free'
          )
    """)

    # Zerar trial_ends_at de todos os usuários no plano free (não expira mais)
    op.execute("""
        UPDATE users
        SET trial_ends_at = NULL
        WHERE subscription_plan_id IN (
            SELECT id FROM subscription_plans WHERE slug = 'free'
        )
    """)


def downgrade() -> None:
    # Reverter Premium
    op.execute("""
        UPDATE subscription_plans
        SET price = 49.90, priority_in_search = 1,
            max_appointments_per_month = NULL, badge_label = NULL
        WHERE slug = 'premium'
    """)

    # Reverter pro → basic
    op.execute("""
        UPDATE subscription_plans
        SET slug = 'basic', name = 'Basic', price = 29.90,
            max_services = 5, priority_in_search = 0,
            max_appointments_per_month = NULL, badge_label = NULL
        WHERE slug = 'pro'
    """)

    # Reverter free → trial
    op.execute("""
        UPDATE subscription_plans
        SET slug = 'trial', name = 'Trial', price = 0.0,
            max_services = 3, trial_days = 30,
            priority_in_search = 0,
            max_appointments_per_month = NULL, badge_label = NULL
        WHERE slug = 'free'
    """)

    # Remover colunas adicionadas
    op.drop_column('subscription_plans', 'badge_label')
    op.drop_column('subscription_plans', 'max_appointments_per_month')
