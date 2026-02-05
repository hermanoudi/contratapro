# slug_utils.py - Utilitarios para geracao de slugs

import re
import unicodedata
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


def normalize_text(text: str) -> str:
    """
    Remove acentos e caracteres especiais de um texto.
    """
    # Normaliza para NFD (separa caracteres base de acentos)
    normalized = unicodedata.normalize('NFD', text)
    # Remove acentos (caracteres de combinacao)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    return ascii_text


def generate_base_slug(name: str) -> str:
    """
    Gera um slug base a partir de um nome.
    Ex: "Hermano Flávio de Moura" -> "hermano-flavio-de-moura"
    """
    # Remove acentos
    slug = normalize_text(name)
    # Converte para minusculas
    slug = slug.lower()
    # Substitui espacos e caracteres especiais por hifens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    # Remove hifens no inicio e fim
    slug = slug.strip('-')
    # Remove hifens duplicados
    slug = re.sub(r'-+', '-', slug)
    return slug


async def generate_unique_slug(
    db: AsyncSession,
    name: str,
    user_id: int = None
) -> str:
    """
    Gera um slug unico para um usuario.
    Se houver colisao, adiciona um numero ao final.

    Args:
        db: Sessao do banco de dados
        name: Nome do usuario
        user_id: ID do usuario (para excluir da verificacao de duplicatas)

    Returns:
        Slug unico
    """
    from .models import User

    base_slug = generate_base_slug(name)

    if not base_slug:
        # Se o nome resultou em slug vazio, usar 'profissional'
        base_slug = 'profissional'

    slug = base_slug
    counter = 1

    while True:
        # Verificar se slug ja existe
        query = select(User).filter(User.slug == slug)

        # Se estamos atualizando um usuario existente, ignorar ele mesmo
        if user_id:
            query = query.filter(User.id != user_id)

        result = await db.execute(query)
        existing = result.scalars().first()

        if not existing:
            return slug

        # Se existe, adicionar numero e tentar novamente
        counter += 1
        slug = f"{base_slug}-{counter}"


def generate_slug_sync(name: str, existing_slugs: set = None) -> str:
    """
    Versao sincrona para gerar slug unico (para uso em migrations).

    Args:
        name: Nome do usuario
        existing_slugs: Conjunto de slugs ja utilizados

    Returns:
        Slug unico
    """
    if existing_slugs is None:
        existing_slugs = set()

    base_slug = generate_base_slug(name)

    if not base_slug:
        base_slug = 'profissional'

    slug = base_slug
    counter = 1

    while slug in existing_slugs:
        counter += 1
        slug = f"{base_slug}-{counter}"

    return slug
