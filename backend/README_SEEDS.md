# 🌱 Seeds do Banco de Dados

Este documento explica como funcionam os seeds (dados iniciais) do projeto Faz de Tudo.

## 📋 O que são Seeds?

Seeds são dados iniciais que são inseridos automaticamente no banco de dados quando o sistema é implantado. No projeto Faz de Tudo, usamos seeds para popular as **categorias de serviços**.

## 🎯 Categorias de Serviços

O sistema possui **33 categorias** organizadas em 6 grupos:

- **🏗️ Construção e Manutenção** (10 categorias)
- **💇 Beleza e Estética** (7 categorias)
- **🔧 Serviços Técnicos** (4 categorias)
- **🏠 Casa e Limpeza** (4 categorias)
- **📚 Educação** (2 categorias)
- **🐾 Pet** (3 categorias)

Cada categoria possui:
- `id`: Identificador único
- `name`: Nome da categoria (ex: "Pedreiro")
- `slug`: Versão em minúsculas para URLs (ex: "pedreiro")
- `group`: Grupo ao qual pertence
- `image_url`: URL da imagem do Unsplash

## 🚀 Como Executar os Seeds

### Método 1: Script Python direto

```bash
cd backend
python run_seeds.py
```

### Método 2: Via módulo Python

```bash
cd backend
python -m app.seeds
```

### Método 3: Durante o deployment

Os seeds são executados automaticamente na primeira inicialização do banco de dados.

## 🔒 Segurança

O script de seeds é **idempotente**, ou seja:
- ✅ Verifica se as categorias já existem antes de inserir
- ✅ Pode ser executado múltiplas vezes sem duplicar dados
- ✅ Apenas insere se a tabela estiver vazia

## 📁 Arquivos Relacionados

```
backend/
├── app/
│   ├── models.py          # Modelo Category
│   ├── seeds.py           # Definição dos seeds
│   └── routers/
│       └── categories.py  # API endpoints para categorias
└── run_seeds.py           # Script CLI para executar seeds
```

## 🌐 Endpoints da API

Após executar os seeds, você pode acessar:

### Listar todas as categorias
```http
GET /api/categories/
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Pedreiro",
    "slug": "pedreiro",
    "group": "Construção e Manutenção",
    "image_url": "https://images.unsplash.com/..."
  },
  ...
]
```

### Listar categorias agrupadas
```http
GET /api/categories/groups
```

**Resposta:**
```json
{
  "Construção e Manutenção": [
    {
      "id": 1,
      "name": "Pedreiro",
      "slug": "pedreiro",
      "image_url": "https://images.unsplash.com/..."
    },
    ...
  ],
  "Beleza e Estética": [...],
  ...
}
```

## 🔄 Processo de Deploy em Produção

### 1. Primeira implantação

```bash
# 1. Criar banco de dados
createdb faz_de_tudo_production

# 2. Aplicar migrations (se houver)
# alembic upgrade head

# 3. Executar seeds
cd backend
python run_seeds.py
```

### 2. Atualizações futuras

Se novas categorias forem adicionadas ao arquivo `seeds.py`:

```bash
# O script verifica e adiciona apenas as novas
python run_seeds.py
```

## 🛠️ Adicionar Novas Categorias

Para adicionar uma nova categoria:

1. Edite `backend/app/seeds.py`
2. Adicione o novo item na lista `CATEGORIES`:

```python
{
    "name": "Nova Categoria",
    "slug": "nova-categoria",
    "group": "Grupo Apropriado",
    "image_url": "https://images.unsplash.com/..."
}
```

3. Execute o script de seeds:
```bash
python run_seeds.py
```

## 📊 Verificar Seeds no Banco

### Via psql
```sql
-- Listar todas as categorias
SELECT * FROM categories ORDER BY "group", name;

-- Contar categorias por grupo
SELECT "group", COUNT(*) FROM categories GROUP BY "group";
```

### Via Python
```python
from app.database import SessionLocal
from app.models import Category

db = SessionLocal()
categories = db.query(Category).all()
for cat in categories:
    print(f"{cat.group}: {cat.name}")
db.close()
```

## ⚠️ Troubleshooting

### Erro: "Table already exists"
O modelo Category foi adicionado após criar as tabelas. Solução:
```python
# Em um terminal Python
from app.database import engine, Base
from app.models import Category

async def create_category_table():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

import asyncio
asyncio.run(create_category_table())
```

### Erro: "Module not found"
Certifique-se de estar no diretório `backend/`:
```bash
cd backend
python run_seeds.py
```

## 📝 Notas Importantes

1. **Imagens do Unsplash**: As URLs são otimizadas com `?auto=format&fit=crop&w=800&q=80`
2. **Slugs únicos**: Cada categoria tem um slug único para URLs amigáveis
3. **Grupos fixos**: Os 6 grupos principais devem ser mantidos para consistência
4. **Dados de produção**: Os seeds são dados de **configuração**, não dados de usuários

## 🔗 Links Relacionados

- [Lista completa de categorias](../CATEGORIAS_SERVICOS.md)
- [Documentação do modelo Category](app/models.py)
- [API de categorias](app/routers/categories.py)
