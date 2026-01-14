# 🏠 Guia de Desenvolvimento Local

## Como o Ambiente Local Funciona

### Diferença entre Local e Produção

| Aspecto | Local (Desenvolvimento) | Produção (Railway) |
|---------|------------------------|-------------------|
| **Variáveis** | Arquivo `backend/.env` | Variables do Railway |
| **Banco** | PostgreSQL via Docker | PostgreSQL do Railway |
| **Uploads** | Pasta `uploads/` local | Cloudinary |
| **URL** | http://localhost:8000 | https://seu-dominio.railway.app |

---

## 🚀 Método 1: Docker Compose (Recomendado)

### Pré-requisitos
- Docker instalado
- Docker Compose instalado

### 1. Criar arquivo `.env` local

**Importante**: Este arquivo só existe na sua máquina, não é commitado!

```bash
cd /home/hermano/projetos/faz_de_tudo/backend
```

Copie o template e edite:
```bash
cp .env.example .env
nano .env  # ou use seu editor preferido
```

**Conteúdo do `.env` local**:
```env
# Banco de Dados Local
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo

# JWT (pode usar um secret simples em dev)
JWT_SECRET_KEY=dev-secret-key-apenas-para-desenvolvimento-local
JWT_ALGORITHM=HS256

# Cloudinary (opcional em dev, pode usar local)
UPLOAD_STORAGE=local
# Se quiser testar com Cloudinary:
# CLOUDINARY_CLOUD_NAME=seu-cloud-name
# CLOUDINARY_API_KEY=sua-api-key
# CLOUDINARY_API_SECRET=seu-api-secret

# Mercado Pago (use credenciais de TESTE)
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-token-de-teste
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica-de-teste

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# PostgreSQL (para o container do banco)
POSTGRES_DB=faz_de_tudo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 2. Iniciar com Docker Compose

```bash
# Na raiz do projeto
cd /home/hermano/projetos/faz_de_tudo

# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose down

# Parar e remover volumes (limpa banco)
docker-compose down -v
```

### 3. Acessar

- **Backend API**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Banco de Dados**: localhost:5432

---

## 🐍 Método 2: Executar Direto com Python (Sem Docker)

### Pré-requisitos
- Python 3.12.7 instalado
- PostgreSQL rodando localmente

### 1. Criar Virtual Environment

```bash
cd /home/hermano/projetos/faz_de_tudo/backend

# Criar venv
python3 -m venv venv

# Ativar
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3. Criar `.env` Local

Igual ao método 1, mas ajuste a URL do banco:

```env
# Se PostgreSQL estiver rodando localmente
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/faz_de_tudo
```

### 4. Iniciar Banco PostgreSQL

**Opção A: Docker apenas para o banco**
```bash
docker run -d \
  --name faz_de_tudo_db \
  -e POSTGRES_DB=faz_de_tudo \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

**Opção B: PostgreSQL instalado localmente**
```bash
# Criar banco
psql -U postgres
CREATE DATABASE faz_de_tudo;
\q
```

### 5. Executar Backend

```bash
# Ativar venv se ainda não estiver
source venv/bin/activate

# Rodar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🎨 Frontend (Vite)

### 1. Instalar Dependências

```bash
cd /home/hermano/projetos/faz_de_tudo/frontend
npm install
```

### 2. Configurar `.env` (opcional)

O frontend já está configurado para usar `localhost:8000` em desenvolvimento.

Se quiser customizar:
```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica-de-teste
```

### 3. Executar

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 📂 Estrutura de Arquivos `.env`

```
/home/hermano/projetos/faz_de_tudo/
├── backend/
│   ├── .env                 ← Apenas local (não commitado)
│   ├── .env.example         ← Template (commitado)
│   └── .env.railway.template ← Template para Railway
├── frontend/
│   ├── .env                 ← Apenas local (não commitado)
│   └── .env.example         ← Template (commitado)
└── docker-compose.yaml      ← Usa backend/.env
```

---

## 🔄 Workflow Completo

### Desenvolvimento Diário

```bash
# 1. Iniciar ambiente
cd /home/hermano/projetos/faz_de_tudo
docker-compose up -d

# 2. Em outro terminal, iniciar frontend
cd frontend
npm run dev

# 3. Desenvolver e testar
# Backend: http://localhost:8000
# Frontend: http://localhost:5173

# 4. Quando terminar
docker-compose down
```

### Fazer Deploy

```bash
# 1. Commitar código (SEM .env!)
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 2. Railway e Vercel fazem deploy automático
# 3. As variáveis de ambiente vêm dos painéis deles
```

---

## 🔍 Troubleshooting Local

### "Port 5432 already in use"

**Causa**: Outro PostgreSQL rodando.

**Solução**:
```bash
# Parar PostgreSQL local
sudo systemctl stop postgresql

# Ou mudar porta no docker-compose.yaml:
ports:
  - "5433:5432"  # Usa 5433 externamente
```

### "Connection refused to database"

**Causa**: Banco não iniciou ainda.

**Solução**:
```bash
# Verificar status
docker-compose ps

# Ver logs do banco
docker-compose logs db

# Aguardar alguns segundos e tentar novamente
```

### "Module not found"

**Causa**: Dependências não instaladas.

**Solução**:
```bash
# Docker Compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Python direto
pip install -r requirements.txt
```

---

## 💡 Dicas

### Usar Postgres do Railway Localmente

Se quiser testar contra o banco de produção:

```env
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@host.railway.app:port/database
```

⚠️ **CUIDADO**: Você estará mexendo no banco de produção!

### Hot Reload

Com Docker Compose, mudanças no código são refletidas automaticamente porque:
```yaml
volumes:
  - ./backend:/app  # Volume montado
```

### Rodar Apenas o Banco

```bash
# Iniciar só o banco
docker-compose up -d db

# Rodar backend fora do Docker
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

## 📋 Checklist de Setup Inicial

- [ ] Docker e Docker Compose instalados
- [ ] Criar `backend/.env` a partir de `.env.example`
- [ ] Ajustar variáveis no `.env` local
- [ ] `docker-compose up -d`
- [ ] Verificar http://localhost:8000/docs
- [ ] Frontend: `npm install && npm run dev`
- [ ] Verificar http://localhost:5173

---

## 🔐 Segurança

### O Que NÃO Commitar

- ❌ `backend/.env`
- ❌ `frontend/.env`
- ❌ `uploads/` (imagens de usuários)
- ❌ `__pycache__/`
- ❌ `node_modules/`

### O Que Commitar

- ✅ `.env.example` (sem valores reais)
- ✅ `docker-compose.yaml`
- ✅ `Dockerfile`
- ✅ Código fonte
- ✅ `requirements.txt`

---

## 📝 Comandos Úteis

```bash
# Ver logs do backend em tempo real
docker-compose logs -f backend

# Entrar no container
docker-compose exec backend bash

# Resetar banco de dados
docker-compose down -v
docker-compose up -d

# Rodar migrações (se houver Alembic)
docker-compose exec backend alembic upgrade head

# Acessar banco diretamente
docker-compose exec db psql -U postgres -d faz_de_tudo
```

---

**Última atualização**: 2026-01-14
