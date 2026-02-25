# Guia Completo de Deploy - Railway.app

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Conta no GitHub com o repositório do projeto
- ✅ Conta no Railway.app (criar em https://railway.app)
- ✅ Credenciais do Mercado Pago (Access Token e Public Key)
- ✅ Domínio registrado (opcional, mas recomendado)
- ✅ Conta no Cloudinary (para fotos - free tier)

---

## 🚀 Parte 1: Preparação do Código

### 1.1 Criar arquivo `requirements.txt` (se não existir)

```bash
cd /home/hermano/projetos/faz_de_tudo/backend
pip freeze > requirements.txt
```

**Ou criar manualmente com as dependências principais:**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0
python-jose[cryptography]==3.3.0
bcrypt==4.2.1
python-multipart==0.0.6
mercadopago==2.3.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
```

### 1.2 Criar `Procfile` na raiz do backend

```bash
# /home/hermano/projetos/faz_de_tudo/backend/Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 1.3 Atualizar `.env.example` com todas as variáveis

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# JWT
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-access-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key

# URLs
FRONTEND_URL=https://your-app.railway.app
BACKEND_URL=https://your-api.railway.app

# Subscription
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months
```

### 1.4 Adicionar `.gitignore` (se não existir)

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
.venv

# Environment
.env
.env.local

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 1.5 Commit e Push para o GitHub

```bash
cd /home/hermano/projetos/faz_de_tudo
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## 🛤️ Parte 2: Configuração do Railway

### 2.1 Criar Conta e Novo Projeto

1. Acesse https://railway.app
2. Clique em **"Start a New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu GitHub
5. Selecione o repositório `faz_de_tudo`

### 2.2 Deploy do Backend (FastAPI)

#### Passo 1: Adicionar Serviço Backend

1. No Railway dashboard, clique **"+ New"**
2. Selecione **"GitHub Repo"**
3. Escolha `faz_de_tudo`
4. Railway detectará automaticamente que é Python

#### Passo 2: Configurar Root Directory

1. Clique no serviço criado
2. Vá em **Settings** → **General**
3. Em **Root Directory**, adicione: `backend`
4. Em **Start Command**, adicione: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Passo 3: Adicionar Variáveis de Ambiente

1. Clique em **Variables**
2. Adicione as seguintes variáveis:

```env
SECRET_KEY=gere-uma-chave-secreta-aqui-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
MERCADOPAGO_ACCESS_TOKEN=seu-token-do-mercado-pago
MERCADOPAGO_PUBLIC_KEY=sua-public-key-do-mercado-pago
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months
```

**⚠️ NÃO adicione DATABASE_URL ainda - vamos criar o banco primeiro**

**⚠️ NÃO adicione FRONTEND_URL e BACKEND_URL ainda - vamos pegar depois**

### 2.3 Deploy do PostgreSQL

#### Passo 1: Adicionar Database

1. No projeto Railway, clique **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Railway criará automaticamente o banco de dados

#### Passo 2: Conectar Backend ao Database

1. Clique no serviço **Backend**
2. Vá em **Variables**
3. Clique em **"+ New Variable"** → **"Add Reference"**
4. Selecione `DATABASE_URL` do PostgreSQL

**✅ O Railway conecta automaticamente!**

### 2.4 Deploy do Frontend (React) → Vercel

> **⚠️ O frontend do ContrataPro é hospedado na Vercel, não no Railway.**
> O Railway fica responsável apenas pelo **backend (FastAPI) + PostgreSQL**.

#### Passo 1: Conectar repositório na Vercel

1. Acesse https://vercel.com e faça login
2. Clique em **"Add New Project"** → importe o repositório `faz_de_tudo`
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (detectado automaticamente)
   - **Output Directory**: `dist`

#### Passo 2: Variável de Ambiente na Vercel

1. Em **Settings** → **Environment Variables**, adicione:

```env
VITE_API_URL=
```

> Deixe vazio — em produção o `config.js` usa `/api` como prefixo padrão, e o `vercel.json` redireciona `/api/*` para o backend Railway.

#### Passo 3: Configurar rewrite no vercel.json

Certifique-se que `frontend/vercel.json` contém o rewrite para o backend:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://seu-backend.railway.app/:path*"
    }
  ]
}
```

**⚠️ Substitua `seu-backend.railway.app` pela URL real do seu serviço Railway**

### 2.5 Configurar URLs e Domínios

#### Passo 1: Obter URLs Geradas

1. Clique no serviço **Backend**
2. Vá em **Settings** → **Networking**
3. Copie a **Public URL** (algo como `backend-production-xxxx.up.railway.app`)

4. Repita para o **Frontend**
5. Copie a **Public URL** do frontend

#### Passo 2: Atualizar Variáveis com URLs

**Backend Variables:**
```env
FRONTEND_URL=https://frontend-production-xxxx.up.railway.app
BACKEND_URL=https://backend-production-xxxx.up.railway.app
```

**Frontend Variables:**
```env
VITE_API_URL=https://backend-production-xxxx.up.railway.app
```

### 2.6 Configurar CORS no Backend

Certifique-se que o `main.py` tem (origens explícitas + Vercel preview deploys):

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",           # Dev - Vite
    "http://localhost:3000",           # Dev alternativo
    "https://contratapro.com.br",      # Produção
    "https://www.contratapro.com.br",  # Produção com www
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Aceita preview deploys
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2.7 Aplicar Migrations do Banco de Dados

O projeto usa **Alembic** para gerenciar o schema do banco. Nunca use `Base.metadata.create_all` — ele ignora as migrations e pode criar o schema errado.

#### Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Aplicar todas as migrations pendentes
railway run alembic upgrade head

# Rodar seed de planos (necessário apenas uma vez)
railway run python seed_plans.py
```

> **Atenção:** O Railway injeta `DATABASE_URL` automaticamente. A aplicação converte `postgresql://` para `postgresql+asyncpg://` em runtime (ver `database.py` e `config.py`).

---

## 🌐 Parte 3: Configurar Domínio Customizado (Opcional)

### 3.1 No Railway

1. Clique no serviço (Backend ou Frontend)
2. Vá em **Settings** → **Networking**
3. Em **Custom Domain**, adicione seu domínio:
   - Backend: `api.contratapro.com.br`
   - Frontend: `app.contratapro.com.br` ou `contratapro.com.br`

### 3.2 No seu Provedor de Domínio (Registro.br, etc)

Adicione os registros DNS:

**Para o Backend (api.contratapro.com.br):**
```
Type: CNAME
Name: api
Value: backend-production-xxxx.up.railway.app
```

**Para o Frontend (app.contratapro.com.br):**
```
Type: CNAME
Name: app
Value: frontend-production-xxxx.up.railway.app
```

**SSL Automático:** Railway gera certificado SSL automaticamente via Let's Encrypt.

### 3.3 Atualizar Variáveis com Domínio Customizado

**Backend:**
```env
FRONTEND_URL=https://app.contratapro.com.br
BACKEND_URL=https://api.contratapro.com.br
```

**Frontend:**
```env
VITE_API_URL=https://api.contratapro.com.br
```

---

## 🔧 Parte 4: Configuração do Mercado Pago

### 4.1 Obter Credenciais

1. Acesse https://www.mercadopago.com.br/developers
2. Entre na sua conta
3. Vá em **Suas integrações** → **Credenciais**
4. Copie:
   - **Access Token** (Production)
   - **Public Key** (Production)

### 4.2 Configurar Webhook no Mercado Pago

1. No painel do Mercado Pago, vá em **Webhooks**
2. Clique em **Configurar**
3. Adicione a URL:
   ```
   https://api.contratapro.com.br/subscriptions/webhook
   ```
   Ou se usando URL gerada:
   ```
   https://backend-production-xxxx.up.railway.app/subscriptions/webhook
   ```

4. Selecione os eventos:
   - ✅ **Preapprovals** (para assinaturas)
   - ✅ **Payments** (para pagamentos mensais)

5. Salve e ative o webhook

### 4.3 Testar Integração

```bash
# Criar um profissional de teste
curl -X POST https://api.contratapro.com.br/auth/register-professional \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@teste.com",
    "password": "Teste123!",
    "name": "João Teste",
    "whatsapp": "11999999999",
    "category": "Eletricista",
    "cep": "01310-100",
    "city": "São Paulo",
    "state": "SP"
  }'

# Fazer login e criar assinatura
# Testar fluxo completo no navegador
```

---

## 📊 Parte 5: Monitoramento e Logs

### 5.1 Ver Logs no Railway

1. Clique no serviço (Backend/Frontend)
2. Vá na aba **Deployments**
3. Clique no deployment ativo
4. Veja os **Logs** em tempo real

### 5.2 Configurar Sentry (Opcional mas Recomendado)

#### Backend (FastAPI)

```bash
pip install sentry-sdk[fastapi]
```

```python
# app/main.py
import sentry_sdk
from app.config import settings

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        environment="production",
    )
```

#### Frontend (React)

```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**Adicionar variável:**
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 5.3 Configurar Uptime Monitoring

**BetterUptime (Grátis):**

1. Acesse https://betteruptime.com
2. Adicione seu site: `https://app.contratapro.com.br`
3. Adicione sua API: `https://api.contratapro.com.br/health` (criar endpoint)
4. Configure alertas por email/SMS

**Endpoint de Health Check:**

```python
# app/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "contratapro-api"
    }
```

---

## 🔄 Parte 6: CI/CD Automático

### 6.1 Deploy Automático

Railway já configura CI/CD automaticamente:

1. ✅ Push para `main` → Deploy automático
2. ✅ Pull Request → Preview deployment
3. ✅ Rollback com 1 clique

### 6.2 Configurar Ambientes (Staging + Production)

**Staging:**
1. Crie uma branch `staging`
2. No Railway, clique **"+ New Environment"**
3. Conecte à branch `staging`
4. Configure variáveis separadas

**Production:**
- Mantenha conectado à branch `main`

### 6.3 Workflow de Deploy

```bash
# Desenvolvimento
git checkout -b feature/nova-funcionalidade
# ... desenvolver ...
git commit -m "feat: adicionar nova funcionalidade"

# Testar em staging
git checkout staging
git merge feature/nova-funcionalidade
git push origin staging
# Railway deploya automaticamente em staging

# Após testes, mover para produção
git checkout main
git merge staging
git push origin main
# Railway deploya automaticamente em produção
```

---

## 🔐 Parte 7: Segurança e Boas Práticas

### 7.1 Checklist de Segurança

- ✅ **Variáveis de ambiente**: Nunca commitar `.env`
- ✅ **SECRET_KEY**: Usar chave aleatória forte (32+ caracteres)
- ✅ **HTTPS**: Railway configura automaticamente
- ✅ **CORS**: Configurar apenas domínios permitidos
- ✅ **SQL Injection**: SQLAlchemy ORM protege automaticamente
- ✅ **XSS**: React escapa automaticamente
- ✅ **Rate Limiting**: Implementar (ver abaixo)

### 7.2 Adicionar Rate Limiting

```bash
pip install slowapi
```

```python
# app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    # ...
```

### 7.3 Configurar Backups do Banco de Dados

**Railway faz backups automáticos**, mas para garantir:

1. No Railway, clique em **PostgreSQL**
2. Vá em **Settings** → **Backups**
3. Ative **Automated Backups**
4. Configure retenção: 7 dias (free tier)

**Backup manual:**
```bash
# Via Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restaurar
railway run psql $DATABASE_URL < backup.sql
```

---

## 📈 Parte 8: Scaling e Otimização

### 8.1 Monitorar Uso de Recursos

1. Railway Dashboard → Serviço → **Metrics**
2. Verifique:
   - CPU Usage
   - Memory Usage
   - Network Bandwidth

### 8.2 Escalar Verticalmente (Mais Recursos)

1. Clique no serviço
2. **Settings** → **Resources**
3. Ajuste:
   - Memory: 512MB → 1GB → 2GB
   - CPU: Compartilhada → Dedicada

**Custos:**
- 512MB RAM: Incluído no Developer Plan ($20/mês)
- 1GB RAM: ~$25/mês
- 2GB RAM: ~$35/mês

### 8.3 Escalar Horizontalmente (Múltiplas Instâncias)

**Quando atingir >1000 usuários simultâneos:**

1. Railway → **Settings** → **Replicas**
2. Aumentar de 1 para 2-3 réplicas
3. Railway balanceia carga automaticamente

### 8.4 Otimizar Database

```python
# Adicionar índices nas queries mais usadas
# app/models.py

class Service(Base):
    __tablename__ = "services"

    # Adicionar índices
    __table_args__ = (
        Index('idx_city', 'city'),
        Index('idx_category', 'category'),
        Index('idx_city_category', 'city', 'category'),
    )
```

---

## 🧪 Parte 9: Testes em Produção

### 9.1 Smoke Tests

Após deploy, testar:

```bash
# 1. Health Check
curl https://api.contratapro.com.br/health

# 2. Criar usuário
curl -X POST https://api.contratapro.com.br/auth/register-client \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"Teste123!","name":"Teste"}'

# 3. Login
curl -X POST https://api.contratapro.com.br/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teste@teste.com","password":"Teste123!"}'

# 4. Buscar profissionais
curl https://api.contratapro.com.br/services/search?city=São%20Paulo
```

### 9.2 Testar Fluxo de Assinatura

1. Registrar como profissional
2. Clicar em "Ativar Assinatura"
3. Redirecionar para Mercado Pago (usar cartão de teste)
4. Retornar ao callback
5. Verificar status da assinatura

**Cartões de teste MP:**
- **Aprovado:** 5031 4332 1540 6351 - CVV: 123 - Validade: 11/25
- **Recusado:** 4235 6477 2802 5682 - CVV: 123 - Validade: 11/25

---

## 🚨 Parte 10: Troubleshooting

### Problema 1: Deploy Falha

**Erro:** `Error: Module not found`

**Solução:**
```bash
# Verificar requirements.txt
cat backend/requirements.txt

# Rebuildar
railway up --force
```

### Problema 2: Database Connection Error

**Erro:** `FATAL: password authentication failed`

**Solução:**
1. Verificar se `DATABASE_URL` está configurado
2. Railway → PostgreSQL → Variables → Copiar URL
3. Backend → Variables → Adicionar `DATABASE_URL`

### Problema 3: CORS Error no Frontend

**Erro:** `Access to fetch at 'https://api...' has been blocked by CORS`

**Solução:**
```python
# Atualizar main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problema 4: Webhook não Recebe Notificações

**Solução:**
1. Verificar URL no Mercado Pago
2. Testar endpoint manualmente:
   ```bash
   curl -X POST https://api.contratapro.com.br/subscriptions/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'
   ```
3. Verificar logs: Railway → Deployments → Logs

---

## 📋 Checklist Final

### Antes de Lançar

- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] PostgreSQL configurado com backups
- [ ] Variáveis de ambiente configuradas
- [ ] Credenciais do Mercado Pago em produção
- [ ] Webhook do Mercado Pago configurado
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL ativado (automático no Railway)
- [ ] CORS configurado corretamente
- [ ] Logs de erro configurados (Sentry)
- [ ] Uptime monitoring ativo (BetterUptime)
- [ ] Smoke tests executados
- [ ] Fluxo de assinatura testado
- [ ] Documentação de API atualizada
- [ ] README com instruções de uso

### Pós-Lançamento

- [ ] Monitorar logs nas primeiras 24h
- [ ] Verificar primeira assinatura real
- [ ] Confirmar recebimento de webhooks
- [ ] Monitorar métricas de uso
- [ ] Backup manual do banco de dados
- [ ] Comunicar aos primeiros usuários

---

## 💰 Resumo de Custos

### Custos Mensais (Railway)

```
Railway Developer Plan:           R$ 100,00
Domínio (.com.br/ano):             R$   3,33 (40/12)
Cloudinary (fotos - free):         R$   0,00
Resend (email - free tier):        R$   0,00
Sentry (erros - free):             R$   0,00
BetterUptime (uptime - free):      R$   0,00
WhatsApp Business API:             R$  50,00
─────────────────────────────────────────────
TOTAL:                             R$ 153,33/mês
```

### Custos com Crescimento

**150-500 profissionais:**
- Railway Pro: R$ 250/mês
- Total: ~R$ 303/mês

**500-2000 profissionais:**
- Railway Team: R$ 500/mês
- Total: ~R$ 553/mês

**>2000 profissionais:**
- Migrar para AWS/GCP
- Custo estimado: R$ 1.000-2.000/mês

---

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Implementar features faltantes** (ver backlog no repositório)
2. **Configurar analytics** (Google Analytics, Hotjar)
3. **Implementar testes automatizados** (Pytest, Jest)
4. **Documentar API** (Swagger/OpenAPI já incluído no FastAPI)
5. **Criar processo de onboarding** para primeiros profissionais
6. **Configurar email marketing** (para comunicação)
7. **Implementar feature flags** (para rollout gradual)

---

## 📞 Suporte

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

**Mercado Pago:**
- Developers: https://www.mercadopago.com.br/developers
- Suporte: https://www.mercadopago.com.br/ajuda

**Comunidade:**
- FastAPI: https://github.com/tiangolo/fastapi/discussions
- React: https://react.dev/community

---

## ✅ Conclusão

Com este guia, você terá o **ContrataPro** rodando em produção no Railway em **2-4 horas**, com:

- ✅ Deploy automático via Git
- ✅ PostgreSQL gerenciado com backups
- ✅ SSL/HTTPS configurado
- ✅ Mercado Pago integrado
- ✅ Monitoring e logs
- ✅ Custo de R$ 153/mês

**Boa sorte com o lançamento do MVP!** 🚀
