"""
Seeds para o banco de dados - Categorias de Serviços
Categorias baseadas no arquivo data/categorias_disponiveis.csv
"""
from sqlalchemy import select
from .models import Category
from .database import AsyncSessionLocal

# Lista de categorias conforme data/categorias_disponiveis.csv
CATEGORIES = [
    # Construção e Manutenção
    {
        "name": "Marido de Aluguel",
        "slug": "marido-de-aluguel",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Pedreiro",
        "slug": "pedreiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Eletricista",
        "slug": "eletricista",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Pintor",
        "slug": "pintor",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Encanador",
        "slug": "encanador",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Marceneiro",
        "slug": "marceneiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Serralheiro",
        "slug": "serralheiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Vidraceiro",
        "slug": "vidraceiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Jardineiro",
        "slug": "jardineiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Gesseiro",
        "slug": "gesseiro",
        "group": "Construção e Manutenção",
        "image_url": "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80"
    },

    # Beleza e Estética
    {
        "name": "Barbeiro",
        "slug": "barbeiro",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Manicure",
        "slug": "manicure",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Cabeleireiro",
        "slug": "cabeleireiro",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Esteticista",
        "slug": "esteticista",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Depilador",
        "slug": "depilador",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Massagista",
        "slug": "massagista",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Design de sombrancelha",
        "slug": "sombrancelha",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    },

    # Serviços Técnicos
    {
        "name": "Mecânico",
        "slug": "mecânico",
        "group": "Serviços Técnicos",
        "image_url": "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Técnico",
        "slug": "técnico",
        "group": "Serviços Técnicos",
        "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Chaveiro",
        "slug": "chaveiro",
        "group": "Serviços Técnicos",
        "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80"
    },

    # Casa e Limpeza
    {
        "name": "Diarista",
        "slug": "diarista",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Passadeira",
        "slug": "passadeira",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Cozinheiro",
        "slug": "cozinheiro",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Churrasqueiro",
        "slug": "churrasqueiro",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Confeiteiro",
        "slug": "confeiteiro",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Decorador",
        "slug": "decorador",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Móveis Planejados",
        "slug": "moveis-planejados",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
    },

    # Educação
    {
        "name": "Professor Particular",
        "slug": "professor-particular",
        "group": "Educação",
        "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Inglês",
        "slug": "ingles",
        "group": "Educação",
        "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
    },

    # Eventos e Entretenimento
    {
        "name": "Músico",
        "slug": "músico",
        "group": "Eventos e Entretenimento",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    },

    # Pet
    {
        "name": "Veterinário",
        "slug": "veterinário",
        "group": "Pet",
        "image_url": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Tosador",
        "slug": "tosador",
        "group": "Pet",
        "image_url": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Adestrador",
        "slug": "adestrador",
        "group": "Pet",
        "image_url": "https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&w=800&q=80"
    },

    # Tecnologia e Informação
    {
        "name": "Programador",
        "slug": "programador",
        "group": "Tecnologia e Informação",
        "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Formatar computador",
        "slug": "formatacao",
        "group": "Tecnologia e Informação",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Técnico Celular",
        "slug": "celular",
        "group": "Tecnologia e Informação",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    },
]


async def seed_categories():
    """
    Popula o banco de dados com as categorias de serviços.
    Executa apenas se a tabela estiver vazia.
    """
    async with AsyncSessionLocal() as db:
        # Verificar se já existem categorias
        result = await db.execute(select(Category))
        existing_count = len(result.scalars().all())

        if existing_count > 0:
            msg = (f"✓ Categorias já existem no banco "
                   f"({existing_count} registros). Seed ignorado.")
            print(msg)
            return

        print("Iniciando seed de categorias...")

        for cat_data in CATEGORIES:
            category = Category(**cat_data)
            db.add(category)

        await db.commit()
        print(f"✓ {len(CATEGORIES)} categorias inseridas com sucesso!")


async def run_seeds():
    """
    Executa todos os seeds do sistema.
    """
    try:
        print("=" * 50)
        print("EXECUTANDO SEEDS DO BANCO DE DADOS")
        print("=" * 50)

        await seed_categories()

        print("=" * 50)
        print("SEEDS CONCLUÍDOS COM SUCESSO!")
        print("=" * 50)
    except Exception as e:
        print(f"❌ Erro ao executar seeds: {e}")
        raise


if __name__ == "__main__":
    import asyncio
    asyncio.run(run_seeds())
