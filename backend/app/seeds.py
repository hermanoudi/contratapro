"""
Seeds para o banco de dados - Categorias de Serviços
"""
from sqlalchemy.orm import Session
from .models import Category
from .database import SessionLocal

# Lista completa de categorias com imagens do Unsplash
CATEGORIES = [
    # Construção e Manutenção
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
    {
        "name": "Azulejista",
        "slug": "azulejista",
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
        "name": "Maquiador",
        "slug": "maquiador",
        "group": "Beleza e Estética",
        "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80"
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

    # Serviços Técnicos
    {
        "name": "Mecânico",
        "slug": "mecânico",
        "group": "Serviços Técnicos",
        "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80"
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
    {
        "name": "Instalador",
        "slug": "instalador",
        "group": "Serviços Técnicos",
        "image_url": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
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
        "name": "Organizador",
        "slug": "organizador",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Decorador",
        "slug": "decorador",
        "group": "Casa e Limpeza",
        "image_url": "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80"
    },

    # Educação
    {
        "name": "Professor",
        "slug": "professor",
        "group": "Educação",
        "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "name": "Instrutor",
        "slug": "instrutor",
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
]


def seed_categories(db: Session):
    """
    Popula o banco de dados com as categorias de serviços.
    Executa apenas se a tabela estiver vazia.
    """
    # Verificar se já existem categorias
    existing_count = db.query(Category).count()

    if existing_count > 0:
        print(f"✓ Categorias já existem no banco ({existing_count} registros). Seed ignorado.")
        return

    print("Iniciando seed de categorias...")

    for cat_data in CATEGORIES:
        category = Category(**cat_data)
        db.add(category)

    db.commit()
    print(f"✓ {len(CATEGORIES)} categorias inseridas com sucesso!")


def run_seeds():
    """
    Executa todos os seeds do sistema.
    """
    db = SessionLocal()
    try:
        print("=" * 50)
        print("EXECUTANDO SEEDS DO BANCO DE DADOS")
        print("=" * 50)

        seed_categories(db)

        print("=" * 50)
        print("SEEDS CONCLUÍDOS COM SUCESSO!")
        print("=" * 50)
    except Exception as e:
        print(f"❌ Erro ao executar seeds: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    run_seeds()
