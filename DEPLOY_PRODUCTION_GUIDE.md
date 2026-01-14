# 🚀 Guia Completo de Deploy em Produção - ContrataPro

## 📊 Stack de Produção Recomendada

```
┌─────────────────────────────────────────────┐
│           GoDaddy (Brasil)                  │
│  - Domínio: contratapro.com.br              │
│  - Email: Microsoft 365                     │
│  - Custo: R$ 62/mês                         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Vercel (Frontend)                 │
│  - React SPA                                │
│  - CDN Global                               │
│  - SSL Automático                           │
│  - GRÁTIS (Hobby Plan)                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Railway (Backend + DB)            │
│  - FastAPI                                  │
│  - PostgreSQL                               │
│  - Custo: $15-20/mês (~R$ 80-100)          │
└─────────────────────────────────────────────┘
```

**Custo Total Mensal:** R$ 150-170/mês

---

## ✅ PRÉ-REQUISITOS

Antes de começar, você precisa:

### 1. **Contas Necessárias**
- [ ] GitHub (com repositório do projeto)
- [ ] Vercel (https://vercel.com - login com GitHub)
- [ ] Railway (https://railway.app - login com GitHub)
- [ ] GoDaddy (para domínio e email)
- [ ] Mercado Pago (credentials de produção)

### 2. **Informações Necessárias**
- [ ] Domínio contratapro.com.br registrado
- [ ] Mercado Pago Access Token (produção)
- [ ] Mercado Pago Public Key (produção)
- [ ] Secret Key para JWT (gerar nova)

### 3. **Arquivos a Criar/Atualizar**
- [ ] `.env.production` (backend)
- [ ] `.env.production` (frontend)
- [ ] `vercel.json` (frontend)
- [ ] `railway.json` ou `Procfile` (backend)

---

## 📂 PARTE 1: PREPARAR O CÓDIGO

### 1.1 Backend - Criar `Procfile`

```bash
cd /home/hermano/projetos/faz_de_tudo/backend
```

Criar arquivo `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 1.2 Backend - Atualizar `requirements.txt`

```bash
cd backend
pip freeze > requirements.txt
```

Verificar se contém essas dependências principais:
```txt
fastapi
uvicorn[standard]
sqlalchemy
asyncpg
alembic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
mercadopago
pydantic-settings
python-dotenv
```

### 1.3 Frontend - Criar `vercel.json`

```bash
cd /home/hermano/projetos/faz_de_tudo/frontend
```

Criar arquivo `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://contratapro-api.up.railway.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 1.4 Frontend - Atualizar arquivo de configuração de API

Criar arquivo `frontend/src/config.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export { API_URL };
```

Atualizar todas as chamadas fetch para usar:
```javascript
import { API_URL } from '../config';

fetch(`${API_URL}/auth/login`, ...)
```

### 1.5 Backend - Configurar CORS para produção

Editar `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

# Adicionar origins de produção
origins = [
    "http://localhost:5173",  # Dev
    "http://localhost:3000",   # Dev alternativo
    "https://contratapro.com.br",  # Produção
    "https://www.contratapro.com.br",  # Produção com www
    "https://contratapro.vercel.app",  # Vercel preview
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🚂 PARTE 2: DEPLOY DO BACKEND (Railway)

### 2.1 Criar Projeto no Railway

1. Acesse https://railway.app
2. Login com GitHub
3. Click em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Selecione o repositório `faz_de_tudo`
6. Railway detectará automaticamente que é Python

### 2.2 Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

```bash
# Database (será gerado automaticamente ao adicionar PostgreSQL)
DATABASE_URL=postgresql://... (será preenchido automaticamente)

# JWT - GERAR NOVA SECRET KEY
SECRET_KEY=<gerar_nova_key_aleatoria_64_caracteres>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Mercado Pago (PRODUÇÃO)
MERCADOPAGO_ACCESS_TOKEN=<seu_token_producao>
MERCADOPAGO_PUBLIC_KEY=<sua_public_key_producao>

# URLs
FRONTEND_URL=https://contratapro.com.br
BACKEND_URL=https://contratapro-api.up.railway.app

# Subscription
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months

# Python
PYTHONUNBUFFERED=1
```

**Como gerar SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 2.3 Adicionar PostgreSQL

1. No projeto Railway, click em "+ New"
2. Selecione "Database" → "PostgreSQL"
3. Railway criará automaticamente e configurará `DATABASE_URL`
4. Anote as credenciais (estão em Variables)

### 2.4 Configurar Domínio Customizado (Backend)

1. No serviço do backend, vá em **Settings**
2. Em **Domains**, click em "Generate Domain"
3. Railway gerará algo como: `contratapro-api-production.up.railway.app`
4. Anote esse domínio (será usado no frontend)

**OU usar domínio personalizado:**
1. Click em "Custom Domain"
2. Digite: `api.contratapro.com.br`
3. Railway mostrará um CNAME record
4. Adicione no GoDaddy (próximo passo)

### 2.5 Rodar Migrações do Banco

Após primeiro deploy:

```bash
# Via Railway CLI (instalar: npm i -g @railway/cli)
railway login
railway link
railway run alembic upgrade head
```

**OU criar service worker no Railway:**
1. Add new service → "Empty Service"
2. Variables: mesmas do backend
3. Start Command: `alembic upgrade head`
4. Run once

---

## ⚡ PARTE 3: DEPLOY DO FRONTEND (Vercel)

### 3.1 Criar Projeto no Vercel

1. Acesse https://vercel.com
2. Login com GitHub
3. Click em "New Project"
4. Selecione o repositório `faz_de_tudo`
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.2 Configurar Variáveis de Ambiente

No Vercel, vá em **Settings → Environment Variables**:

```bash
# API URL (usar domínio Railway do passo 2.4)
VITE_API_URL=https://contratapro-api-production.up.railway.app

# Mercado Pago (Public Key - PRODUÇÃO)
VITE_MERCADOPAGO_PUBLIC_KEY=<sua_public_key_producao>

# Mode
NODE_ENV=production
```

### 3.3 Deploy Automático

- Vercel fará deploy automático a cada push no branch `main`
- Preview deployments para PRs automaticamente
- SSL automático (HTTPS)

### 3.4 Obter URL de Preview

Após primeiro deploy, Vercel gerará:
- `contratapro-frontend.vercel.app`
- Ou personalizado se configurado

---

## 🌐 PARTE 4: CONFIGURAR DOMÍNIO (GoDaddy)

### 4.1 Registrar Domínio

1. Acesse GoDaddy: https://godaddy.com/pt-br
2. Busque: `contratapro.com.br`
3. Registre (R$ 40/ano)

### 4.2 Configurar DNS no GoDaddy

Vá em **Meu Domínio → DNS → Gerenciar DNS**

#### Registros para FRONTEND (Vercel):

```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com
TTL: 1 hora

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 1 hora
```

#### Registros para BACKEND (Railway) - SE usar api.contratapro.com.br:

```
Tipo: CNAME
Nome: api
Valor: <valor_fornecido_pelo_railway>
TTL: 1 hora
```

#### Registros para EMAIL (Microsoft 365):

GoDaddy configurará automaticamente quando você contratar o email.

### 4.3 Adicionar Domínio no Vercel

1. No projeto Vercel, vá em **Settings → Domains**
2. Add Domain: `contratapro.com.br`
3. Add Domain: `www.contratapro.com.br`
4. Vercel verificará DNS (pode levar até 48h, geralmente 10-30min)

### 4.4 Adicionar Domínio no Railway (Opcional)

Se quiser usar `api.contratapro.com.br`:

1. Railway → Service → Settings → Domains
2. Custom Domain: `api.contratapro.com.br`
3. Adicionar CNAME no GoDaddy conforme instruções

---

## 📧 PARTE 5: CONFIGURAR EMAIL (GoDaddy + Microsoft 365)

### 5.1 Contratar Email Profissional

1. No GoDaddy, vá em "Email Profissional"
2. Selecione "Microsoft 365 Business Basic"
3. Custo: ~R$ 22/mês por usuário
4. Criar contas:
   - contato@contratapro.com.br
   - suporte@contratapro.com.br
   - admin@contratapro.com.br

### 5.2 Configurar Cliente de Email

Usar Outlook Web ou configurar em cliente desktop:
- **Servidor IMAP:** outlook.office365.com (993)
- **Servidor SMTP:** smtp.office365.com (587)

---

## 🔒 PARTE 6: CONFIGURAR SSL/HTTPS

### ✅ Vercel (Frontend)
- SSL automático ✅
- HTTPS forçado ✅
- Certificado Let's Encrypt

### ✅ Railway (Backend)
- SSL automático ✅
- HTTPS forçado ✅
- Certificado Let's Encrypt

**Nada a fazer!** Ambos configuram automaticamente.

---

## 🔍 PARTE 7: CONFIGURAR SEO TOOLS

### 7.1 Google Analytics

1. Criar conta: https://analytics.google.com
2. Criar propriedade: "ContrataPro"
3. Obter ID de medição: `G-XXXXXXXXXX`

Adicionar no `frontend/index.html` antes do `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 7.2 Google Search Console

1. Acesse: https://search.google.com/search-console
2. Adicionar propriedade: `https://contratapro.com.br`
3. Verificar propriedade:
   - Vercel: adicionar TXT record no DNS
   - Ou fazer upload de arquivo HTML
4. Submeter sitemap: `https://contratapro.com.br/sitemap.xml`

### 7.3 Atualizar URLs no sitemap.xml

Editar `frontend/public/sitemap.xml` e trocar todas as URLs de exemplo para o domínio real.

---

## 🧪 PARTE 8: TESTES PÓS-DEPLOY

### 8.1 Checklist de Testes

- [ ] Homepage carrega: https://contratapro.com.br
- [ ] API responde: https://api.contratapro.com.br/health (ou Railway URL)
- [ ] Login funciona
- [ ] Registro de profissional funciona
- [ ] Busca de profissionais funciona
- [ ] Integração Mercado Pago funciona (teste com R$ 0,01)
- [ ] Emails estão sendo enviados
- [ ] WhatsApp links funcionam
- [ ] SSL ativo (cadeado verde no navegador)
- [ ] Google Analytics rastreando
- [ ] Search Console sem erros

### 8.2 Comandos de Teste

```bash
# Testar API
curl https://contratapro-api-production.up.railway.app/health

# Testar frontend
curl -I https://contratapro.com.br

# Testar SSL
curl -vI https://contratapro.com.br 2>&1 | grep -i ssl

# Testar DNS
dig contratapro.com.br
nslookup contratapro.com.br
```

---

## 📊 PARTE 9: MONITORAMENTO

### 9.1 Railway Monitoring

- Dashboard → Metrics
- CPU, RAM, Network usage
- Logs em tempo real

### 9.2 Vercel Analytics

- Analytics tab no projeto
- Core Web Vitals
- Geographic distribution
- Device/Browser stats

### 9.3 Uptime Monitoring (Opcional)

Ferramentas gratuitas:
- UptimeRobot (https://uptimerobot.com)
- Pingdom (plano free)
- StatusCake (plano free)

Configurar alertas para:
- `https://contratapro.com.br` (frontend)
- `https://api.contratapro.com.br/health` (backend)

---

## 🆘 TROUBLESHOOTING

### Problema: Frontend não conecta no backend

**Solução:**
1. Verificar CORS no backend (`main.py`)
2. Verificar `VITE_API_URL` no Vercel
3. Verificar DNS propagation (pode levar até 48h)

```bash
# Testar DNS
nslookup api.contratapro.com.br
```

### Problema: Banco de dados não conecta

**Solução:**
1. Verificar `DATABASE_URL` no Railway
2. Rodar migrações:
```bash
railway run alembic upgrade head
```
3. Verificar logs do Railway

### Problema: Mercado Pago não funciona

**Solução:**
1. Verificar se está usando credenciais de PRODUÇÃO (não sandbox)
2. Verificar BACKEND_URL está correto
3. Verificar logs de webhook no Mercado Pago

### Problema: Email não funciona

**Solução:**
1. Verificar configuração MX records no GoDaddy
2. Aguardar 24-48h para propagação DNS
3. Testar em https://mxtoolbox.com

---

## 💰 RESUMO DE CUSTOS MENSAIS

| Serviço | Custo | Descrição |
|---------|-------|-----------|
| **Domínio .com.br** | R$ 3/mês | GoDaddy (R$ 40/ano) |
| **Email Microsoft 365** | R$ 22/mês | Por usuário |
| **Email adicional** | R$ 22/mês | Segundo usuário (opcional) |
| **Frontend Vercel** | R$ 0 | Grátis (Hobby) |
| **Backend Railway** | R$ 80-100/mês | $15-20 USD |
| **PostgreSQL Railway** | Incluído | No plano Railway |
| **SSL/HTTPS** | R$ 0 | Grátis (Let's Encrypt) |
| **Total Mínimo** | **~R$ 105/mês** | Com 1 email |
| **Total Recomendado** | **~R$ 150/mês** | Com 2-3 emails |

---

## 📝 CHECKLIST FINAL

Antes de considerar o deploy completo:

### Setup Inicial
- [ ] Domínio registrado no GoDaddy
- [ ] Email profissional configurado
- [ ] Contas criadas (Vercel, Railway, Google)

### Backend (Railway)
- [ ] Código deployado
- [ ] PostgreSQL criado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações rodadas
- [ ] Domínio customizado configurado (opcional)
- [ ] Logs sem erros críticos

### Frontend (Vercel)
- [ ] Código deployado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio principal conectado
- [ ] WWW redirect funcionando
- [ ] SSL ativo

### DNS (GoDaddy)
- [ ] CNAME para Vercel configurado
- [ ] CNAME para Railway configurado (se aplicável)
- [ ] MX records para email configurados
- [ ] Propagação completa (teste: nslookup)

### SEO
- [ ] Google Analytics instalado
- [ ] Search Console verificado
- [ ] Sitemap.xml submetido
- [ ] Robots.txt acessível

### Testes
- [ ] Homepage carrega
- [ ] API responde
- [ ] Fluxo de login funciona
- [ ] Fluxo de registro funciona
- [ ] Mercado Pago integração testada
- [ ] WhatsApp links funcionam

### Monitoramento
- [ ] Uptime monitor configurado
- [ ] Alertas de email configurados
- [ ] Métricas sendo coletadas

---

## 🚀 PRÓXIMOS PASSOS PÓS-DEPLOY

1. **Criar conta admin em produção**
```bash
railway run python -c "from app.scripts.create_admin import create_admin; create_admin('admin@contratapro.com.br', 'senha_segura', 'Admin')"
```

2. **Testar fluxo completo:**
   - Cadastro de profissional
   - Cadastro de cliente
   - Busca
   - Agendamento
   - Pagamento trial
   - Upgrade para pago

3. **Configurar backup do banco:**
   - Railway faz backup automático
   - Configurar backup adicional (opcional)

4. **Marketing:**
   - Adicionar pixel do Facebook/Instagram
   - Configurar Google Ads (opcional)
   - Criar perfis nas redes sociais

---

## 📚 RECURSOS ÚTEIS

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **GoDaddy Support:** https://br.godaddy.com/help
- **Mercado Pago Docs:** https://www.mercadopago.com.br/developers
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/

---

## 🆘 SUPORTE

Em caso de problemas:

1. **Documentação oficial** dos serviços
2. **Logs do Railway:** Railway Dashboard → Logs
3. **Logs do Vercel:** Vercel Dashboard → Deployments → Logs
4. **Community:** Discord do Railway, Vercel community

---

**Última atualização:** 12/01/2026  
**Versão:** 1.0 - ContrataPro Production Deploy
