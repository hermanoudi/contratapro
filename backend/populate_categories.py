#!/usr/bin/env python3
"""
Script para popular a tabela de categorias com os serviços organizados em grupos
Similar ao modelo de marketplaces como Mercado Livre e Magazine Luiza
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Category, Base
import os
import re
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def slugify(text):
    """Converte texto em slug (URL-friendly)"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

# Categorias organizadas por grupos (como no Mercado Livre e Magazine Luiza)
CATEGORIES = [
    # Grupo: Casa e Construção
    {"name": "Pedreiro", "group": "Casa e Construção", "slug": "pedreiro"},
    {"name": "Pintor", "group": "Casa e Construção", "slug": "pintor"},
    {"name": "Encanador", "group": "Casa e Construção", "slug": "encanador"},
    {"name": "Eletricista", "group": "Casa e Construção", "slug": "eletricista"},
    {"name": "Marceneiro", "group": "Casa e Construção", "slug": "marceneiro"},
    {"name": "Serralheiro", "group": "Casa e Construção", "slug": "serralheiro"},
    {"name": "Vidraceiro", "group": "Casa e Construção", "slug": "vidraceiro"},
    {"name": "Gesseiro", "group": "Casa e Construção", "slug": "gesseiro"},
    {"name": "Azulejista", "group": "Casa e Construção", "slug": "azulejista"},
    {"name": "Marmorista", "group": "Casa e Construção", "slug": "marmorista"},

    # Grupo: Limpeza e Organização
    {"name": "Diarista", "group": "Limpeza e Organização", "slug": "diarista"},
    {"name": "Faxineiro(a)", "group": "Limpeza e Organização", "slug": "faxineiro"},
    {"name": "Lavador de Carros", "group": "Limpeza e Organização", "slug": "lavador-de-carros"},
    {"name": "Limpeza de Piscina", "group": "Limpeza e Organização", "slug": "limpeza-de-piscina"},
    {"name": "Dedetizador", "group": "Limpeza e Organização", "slug": "dedetizador"},
    {"name": "Personal Organizer", "group": "Limpeza e Organização", "slug": "personal-organizer"},

    # Grupo: Beleza e Estética
    {"name": "Cabeleireiro(a)", "group": "Beleza e Estética", "slug": "cabeleireiro"},
    {"name": "Barbeiro", "group": "Beleza e Estética", "slug": "barbeiro"},
    {"name": "Manicure", "group": "Beleza e Estética", "slug": "manicure"},
    {"name": "Pedicure", "group": "Beleza e Estética", "slug": "pedicure"},
    {"name": "Designer de Sobrancelhas", "group": "Beleza e Estética", "slug": "designer-de-sobrancelhas"},
    {"name": "Maquiador(a)", "group": "Beleza e Estética", "slug": "maquiador"},
    {"name": "Esteticista", "group": "Beleza e Estética", "slug": "esteticista"},
    {"name": "Massagista", "group": "Beleza e Estética", "slug": "massagista"},
    {"name": "Depilador(a)", "group": "Beleza e Estética", "slug": "depilador"},

    # Grupo: Saúde e Bem-Estar
    {"name": "Personal Trainer", "group": "Saúde e Bem-Estar", "slug": "personal-trainer"},
    {"name": "Fisioterapeuta", "group": "Saúde e Bem-Estar", "slug": "fisioterapeuta"},
    {"name": "Nutricionista", "group": "Saúde e Bem-Estar", "slug": "nutricionista"},
    {"name": "Psicólogo(a)", "group": "Saúde e Bem-Estar", "slug": "psicologo"},
    {"name": "Terapeuta", "group": "Saúde e Bem-Estar", "slug": "terapeuta"},
    {"name": "Cuidador(a) de Idosos", "group": "Saúde e Bem-Estar", "slug": "cuidador-de-idosos"},

    # Grupo: Tecnologia e Informática
    {"name": "Técnico de Informática", "group": "Tecnologia e Informática", "slug": "tecnico-de-informatica"},
    {"name": "Assistência de Celular", "group": "Tecnologia e Informática", "slug": "assistencia-de-celular"},
    {"name": "Instalador de TV", "group": "Tecnologia e Informática", "slug": "instalador-de-tv"},
    {"name": "Técnico de Ar Condicionado", "group": "Tecnologia e Informática", "slug": "tecnico-de-ar-condicionado"},
    {"name": "Eletrotécnico", "group": "Tecnologia e Informática", "slug": "eletrotecnico"},

    # Grupo: Automotivo
    {"name": "Mecânico", "group": "Automotivo", "slug": "mecanico"},
    {"name": "Funileiro", "group": "Automotivo", "slug": "funileiro"},
    {"name": "Pintor de Veículos", "group": "Automotivo", "slug": "pintor-de-veiculos"},
    {"name": "Borracheiro", "group": "Automotivo", "slug": "borracheiro"},
    {"name": "Instalador de Som", "group": "Automotivo", "slug": "instalador-de-som"},
    {"name": "Guincho", "group": "Automotivo", "slug": "guincho"},

    # Grupo: Alimentação
    {"name": "Cozinheiro(a)", "group": "Alimentação", "slug": "cozinheiro"},
    {"name": "Churrasqueiro", "group": "Alimentação", "slug": "churrasqueiro"},
    {"name": "Confeiteiro(a)", "group": "Alimentação", "slug": "confeiteiro"},
    {"name": "Doceira", "group": "Alimentação", "slug": "doceira"},
    {"name": "Chef de Cozinha", "group": "Alimentação", "slug": "chef-de-cozinha"},
    {"name": "Salgadeiro(a)", "group": "Alimentação", "slug": "salgadeiro"},
    {"name": "Bartender", "group": "Alimentação", "slug": "bartender"},
    {"name": "Garçom/Garçonete", "group": "Alimentação", "slug": "garcom-garconete"},

    # Grupo: Eventos e Entretenimento
    {"name": "Fotógrafo", "group": "Eventos e Entretenimento", "slug": "fotografo"},
    {"name": "Videomaker", "group": "Eventos e Entretenimento", "slug": "videomaker"},
    {"name": "DJ", "group": "Eventos e Entretenimento", "slug": "dj"},
    {"name": "Músico", "group": "Eventos e Entretenimento", "slug": "musico"},
    {"name": "Animador de Festas", "group": "Eventos e Entretenimento", "slug": "animador-de-festas"},
    {"name": "Mágico", "group": "Eventos e Entretenimento", "slug": "magico"},
    {"name": "Decorador de Eventos", "group": "Eventos e Entretenimento", "slug": "decorador-de-eventos"},
    {"name": "Buffet", "group": "Eventos e Entretenimento", "slug": "buffet"},

    # Grupo: Educação
    {"name": "Professor Particular", "group": "Educação", "slug": "professor-particular"},
    {"name": "Aulas de Inglês", "group": "Educação", "slug": "aulas-de-ingles"},
    {"name": "Aulas de Música", "group": "Educação", "slug": "aulas-de-musica"},
    {"name": "Aulas de Informática", "group": "Educação", "slug": "aulas-de-informatica"},
    {"name": "Reforço Escolar", "group": "Educação", "slug": "reforco-escolar"},

    # Grupo: Jardinagem e Paisagismo
    {"name": "Jardineiro", "group": "Jardinagem e Paisagismo", "slug": "jardineiro"},
    {"name": "Paisagista", "group": "Jardinagem e Paisagismo", "slug": "paisagista"},
    {"name": "Podador de Árvores", "group": "Jardinagem e Paisagismo", "slug": "podador-de-arvores"},

    # Grupo: Moda e Costura
    {"name": "Costureira", "group": "Moda e Costura", "slug": "costureira"},
    {"name": "Alfaiate", "group": "Moda e Costura", "slug": "alfaiate"},
    {"name": "Designer de Moda", "group": "Moda e Costura", "slug": "designer-de-moda"},
    {"name": "Sapateiro", "group": "Moda e Costura", "slug": "sapateiro"},

    # Grupo: Transporte e Mudanças
    {"name": "Motorista Particular", "group": "Transporte e Mudanças", "slug": "motorista-particular"},
    {"name": "Mudanças e Fretes", "group": "Transporte e Mudanças", "slug": "mudancas-e-fretes"},
    {"name": "Entregador", "group": "Transporte e Mudanças", "slug": "entregador"},

    # Grupo: Serviços Domésticos
    {"name": "Babá", "group": "Serviços Domésticos", "slug": "baba"},
    {"name": "Cozinheira Doméstica", "group": "Serviços Domésticos", "slug": "cozinheira-domestica"},
    {"name": "Passadeira", "group": "Serviços Domésticos", "slug": "passadeira"},
    {"name": "Lavadeira", "group": "Serviços Domésticos", "slug": "lavadeira"},

    # Grupo: Pet
    {"name": "Pet Sitter", "group": "Pet", "slug": "pet-sitter"},
    {"name": "Banho e Tosa", "group": "Pet", "slug": "banho-e-tosa"},
    {"name": "Adestrador", "group": "Pet", "slug": "adestrador"},
    {"name": "Veterinário", "group": "Pet", "slug": "veterinario"},
]

async def populate_categories():
    """Popula a tabela de categorias"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            # Limpar categorias existentes
            print("Limpando categorias existentes...")
            await db.execute(Category.__table__.delete())
            await db.commit()

            # Adicionar novas categorias
            print(f"Adicionando {len(CATEGORIES)} categorias...")
            for cat_data in CATEGORIES:
                category = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    group=cat_data["group"]
                )
                db.add(category)

            await db.commit()
            print(f"✅ {len(CATEGORIES)} categorias adicionadas!")

            # Mostrar resumo por grupo
            print("\n📊 Resumo por grupo:")
            groups = {}
            for cat in CATEGORIES:
                group = cat["group"]
                if group not in groups:
                    groups[group] = 0
                groups[group] += 1

            for group, count in sorted(groups.items()):
                print(f"  • {group}: {count} categorias")

        except Exception as e:
            print(f"❌ Erro ao popular categorias: {e}")
            await db.rollback()


if __name__ == "__main__":
    print("🚀 Iniciando população de categorias...\n")
    asyncio.run(populate_categories())
    print("\n✨ Processo finalizado!")
