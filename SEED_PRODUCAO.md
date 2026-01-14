# 🌱 Carregar Seeds no Banco de Produção (Railway)

Este guia mostra como popular o banco de dados de produção no Railway com as categorias de serviços.

---

## 📋 O Que Será Carregado

**33 categorias de serviços** organizadas em 6 grupos:
- Construção e Manutenção (10)
- Beleza e Estética (7)
- Serviços Técnicos (4)
- Casa e Limpeza (7)
- Educação (2)
- Eventos e Entretenimento (1)
- Pet (3)

---

## 🎯 Método 1: Executar Script Localmente Contra Banco Railway (RECOMENDADO)

Este é o método **mais seguro e rápido**.

### Passo 1: Obter URL do Banco Railway

1. Acesse seu projeto no Railway
2. Clique no serviço **Postgres**
3. Vá em **Variables**
4. Copie o valor de `DATABASE_URL`

Exemplo:
```
postgresql://postgres:senha@região.railway.app:porta/railway
```

### Passo 2: Criar arquivo .env temporário

```bash
cd /home/hermano/projetos/faz_de_tudo/backend
nano .env.production  # ou use seu editor preferido
```

Cole o seguinte conteúdo (ajuste a URL):
```env
# Banco de Produção Railway (TEMPORÁRIO - NÃO COMMITAR!)
DATABASE_URL=postgresql+asyncpg://postgres:senha@região.railway.app:porta/railway
```

**IMPORTANTE**: Substitua pela URL real do Railway e adicione `+asyncpg` após `postgresql://`

### Passo 3: Executar o Script de Seeds

```bash
cd /home/hermano/projetos/faz_de_tudo/backend

# Ativar venv (se estiver usando)
source venv/bin/activate

# Executar seeds com o .env de produção
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d'=' -f2-)" python run_seeds.py
```

### Passo 4: Verificar

```bash
# O script mostrará:
==================================================
EXECUTANDO SEEDS DO BANCO DE DADOS
==================================================
Iniciando seed de categorias...
✓ 33 categorias inseridas com sucesso!
==================================================
SEEDS CONCLUÍDOS COM SUCESSO!
==================================================
```

### Passo 5: Limpar

```bash
# APAGAR O ARQUIVO TEMPORÁRIO!
rm .env.production
```

---

## 🚀 Método 2: Executar Via Railway CLI

Se você tiver o Railway CLI instalado.

### Instalar Railway CLI (se necessário)

```bash
# Instalar
npm install -g @railway/cli

# Ou via curl
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login
```

### Executar Seeds

```bash
cd /home/hermano/projetos/faz_de_tudo/backend

# Conectar ao projeto
railway link

# Executar seeds no ambiente de produção
railway run python run_seeds.py
```

---

## 🐳 Método 3: Executar Dentro do Container Railway

Execute um comando one-off no container em produção.

### Via Dashboard Railway

1. Acesse seu projeto no Railway
2. Clique no serviço **Backend**
3. Vá em **Deployments**
4. Clique no deployment ativo (com ✅)
5. Clique em **View Logs**
6. No canto superior direito, clique em **⋮** (três pontos)
7. Selecione **Open Shell**
8. Execute:

```bash
python run_seeds.py
```

### Via Railway CLI

```bash
# Abrir shell no container
railway shell

# Executar seeds
python run_seeds.py

# Sair
exit
```

---

## ✅ Verificar se Funcionou

### Via API (Recomendado)

Acesse no navegador:
```
https://seu-backend.railway.app/categories/
```

Você deve ver um JSON com as 33 categorias.

### Via Railway Shell

```bash
railway shell

# Abrir Python
python

# Executar query
from app.database import SessionLocal
from app.models import Category

db = SessionLocal()
count = db.query(Category).count()
print(f"Total de categorias: {count}")

# Listar algumas
categories = db.query(Category).limit(5).all()
for cat in categories:
    print(f"- {cat.name} ({cat.group})")

db.close()
exit()
```

### Via PostgreSQL Client

Se você tiver `psql` instalado:

```bash
# Conectar ao banco Railway
psql "postgresql://postgres:senha@região.railway.app:porta/railway"

# Consultar
SELECT COUNT(*) FROM categories;
SELECT name, "group" FROM categories LIMIT 10;

# Sair
\q
```

---

## 🔄 Executar Novamente (Sem Duplicar)

O script de seeds é **idempotente**. Se você executar novamente:

```bash
python run_seeds.py
```

Ele mostrará:
```
✓ Categorias já existem no banco (33 registros). Seed ignorado.
```

---

## 🛠️ Adicionar Novas Categorias Depois

Se você adicionar categorias ao arquivo `backend/app/seeds.py`:

### Passo 1: Editar seeds.py

```python
# backend/app/seeds.py
CATEGORIES = [
    # ... categorias existentes ...
    {
        "name": "Nova Categoria",
        "slug": "nova-categoria",
        "group": "Grupo Apropriado",
        "image_url": "https://images.unsplash.com/..."
    },
]
```

### Passo 2: Commitar e Fazer Deploy

```bash
git add backend/app/seeds.py
git commit -m "feat: adicionar nova categoria de serviço"
git push origin main
```

### Passo 3: Executar Seeds Novamente

O script atual não adiciona novas categorias automaticamente. Você precisará:

**Opção A**: Modificar o script para ser incremental
**Opção B**: Adicionar manualmente via Railway Shell:

```bash
railway shell

python
from app.database import SessionLocal
from app.models import Category

db = SessionLocal()

# Verificar se já existe
exists = db.query(Category).filter_by(slug="nova-categoria").first()
if not exists:
    new_cat = Category(
        name="Nova Categoria",
        slug="nova-categoria",
        group="Grupo",
        image_url="https://..."
    )
    db.add(new_cat)
    db.commit()
    print("✓ Nova categoria adicionada!")
else:
    print("Categoria já existe")

db.close()
exit()
```

---

## ⚠️ Troubleshooting

### "Connection refused"

**Causa**: URL do banco incorreta ou Railway não permitindo conexões externas.

**Solução**:
- Verifique se a URL está correta
- Verifique se você pode acessar o banco via Railway Shell primeiro

### "ModuleNotFoundError: No module named 'app'"

**Causa**: Executando do diretório errado.

**Solução**:
```bash
cd /home/hermano/projetos/faz_de_tudo/backend
python run_seeds.py
```

### "Table 'categories' doesn't exist"

**Causa**: Tabelas não foram criadas ainda.

**Solução**:
```bash
railway shell

# Criar tabelas
python
from app.database import engine, Base
import asyncio

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

asyncio.run(create_tables())
exit()

# Agora executar seeds
python run_seeds.py
```

### Seeds foram executados mas categorias não aparecem

**Causa**: Pode ser transação não comitada.

**Solução**:
```bash
railway shell

python
from app.database import SessionLocal
from app.models import Category

db = SessionLocal()
count = db.query(Category).count()
print(f"Categorias no banco: {count}")
db.close()
exit()
```

Se mostrar 0, execute os seeds novamente dentro do shell:
```bash
python run_seeds.py
```

---

## 📝 Resumo - Passo a Passo Rápido

### Se você tem Railway CLI instalado:

```bash
cd backend
railway link
railway run python run_seeds.py
```

### Se NÃO tem Railway CLI:

1. Abra Railway Dashboard
2. Backend → Deployments → Deployment ativo → ⋮ → Open Shell
3. Execute: `python run_seeds.py`
4. Verifique: `https://seu-backend.railway.app/categories/`

---

## 🔐 Segurança

**NUNCA commite**:
- ❌ `.env.production`
- ❌ URLs de banco com senhas
- ❌ Credenciais do Railway

**Sempre use**:
- ✅ Variáveis de ambiente do Railway
- ✅ Railway CLI autenticado
- ✅ Railway Shell para operações sensíveis

---

**Última atualização**: 2026-01-14
