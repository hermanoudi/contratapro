"""add user slug

Revision ID: 8b9c0d1e2f3a
Revises: 7a8b9c0d1e2f
Create Date: 2026-02-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision: str = '8b9c0d1e2f3a'
down_revision: Union[str, None] = '7a8b9c0d1e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def normalize_text(txt: str) -> str:
    """Remove acentos de um texto."""
    import unicodedata
    normalized = unicodedata.normalize('NFD', txt)
    return normalized.encode('ascii', 'ignore').decode('ascii')


def generate_base_slug(name: str) -> str:
    """Gera um slug base a partir de um nome."""
    import re
    slug = normalize_text(name)
    slug = slug.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    slug = re.sub(r'-+', '-', slug)
    return slug if slug else 'profissional'


def upgrade() -> None:
    # Adicionar coluna slug (nullable inicialmente)
    op.add_column('users', sa.Column('slug', sa.String(100), nullable=True))

    # Criar indice unico para slug
    op.create_index('ix_users_slug', 'users', ['slug'], unique=True)

    # Gerar slugs para usuarios existentes
    conn = op.get_bind()

    # Buscar todos os usuarios
    result = conn.execute(text("SELECT id, name FROM users ORDER BY id"))
    users = result.fetchall()

    # Conjunto para rastrear slugs ja utilizados
    used_slugs = set()

    for user_id, name in users:
        if not name:
            name = 'usuario'

        base_slug = generate_base_slug(name)
        slug = base_slug
        counter = 1

        # Garantir unicidade
        while slug in used_slugs:
            counter += 1
            slug = f"{base_slug}-{counter}"

        used_slugs.add(slug)

        # Atualizar usuario
        conn.execute(
            text("UPDATE users SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": user_id}
        )


def downgrade() -> None:
    op.drop_index('ix_users_slug', table_name='users')
    op.drop_column('users', 'slug')
