# Guia de Deploy - ContrataPro

Este documento contém todas as instruções para fazer deploy da aplicação em produção.

## Arquitetura de Deploy

- **Backend**: Railway (https://railway.app)
- **Frontend**: Vercel (https://vercel.com)
- **Banco de Dados**: PostgreSQL no Railway
- **Armazenamento**: Cloudinary (para imagens)

---

## 1. Backend - Deploy no Railway

### 1.1. Arquivos Necessários

✅ **Procfile** (já criado em `/backend/Procfile`):
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

✅ **CORS Configurado** (já configurado em `/backend/app/main.py`):
- Permite localhost (desenvolvimento)
- Permite contratapro.com.br e www.contratapro.com.br (produção)
- Permite todos os deploys do Vercel (*.vercel.app)

### 1.2. Variáveis de Ambiente no Railway

Configure as seguintes variáveis de ambiente no Railway:

```bash
# Banco de Dados (Railway fornece automaticamente)
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# JWT
JWT_SECRET_KEY=seu-secret-key-super-secreto-aqui-min-32-chars
JWT_ALGORITHM=HS256

# Cloudinary (para upload de imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token-de-producao

# URLs
FRONTEND_URL=https://contratapro.vercel.app
```

### 1.3. Deploy no Railway

1. Conecte seu repositório GitHub ao Railway
2. Selecione o diretório `/backend` como root
3. Railway detectará automaticamente o Procfile
4. Configure as variáveis de ambiente
5. Deploy!

**URL da API após deploy**: `https://contratapro-api.up.railway.app`

---

## 2. Frontend - Deploy na Vercel

### 2.1. Arquivos Necessários

✅ **vercel.json** (já criado em `/frontend/vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://contratapro-api.up.railway.app/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **Configuração de API** (já criado em `/frontend/src/config.js`):
- Usa variável de ambiente `VITE_API_URL`
- Em produção, usa `/api` que será redirecionado para o Railway

### 2.2. Variáveis de Ambiente na Vercel

Configure as seguintes variáveis de ambiente na Vercel:

```bash
# API URL (deixe vazio para usar proxy do vercel.json)
VITE_API_URL=

# Mercado Pago (use credenciais de PRODUÇÃO)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-chave-publica-de-producao
```

### 2.3. Deploy na Vercel

1. Importe o repositório na Vercel
2. Selecione o diretório `/frontend` como root
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Configure as variáveis de ambiente
7. Deploy!

**URL do frontend após deploy**: `https://contratapro.vercel.app`

---

## 3. Banco de Dados

### 3.1. PostgreSQL no Railway

1. No Railway, adicione um serviço PostgreSQL
2. Railway fornecerá automaticamente a variável `DATABASE_URL`
3. Conecte ao backend

### 3.2. Migrações

Execute as migrações após o primeiro deploy:

```bash
# Localmente (conectando ao banco de produção)
# NÃO RECOMENDADO - use com cuidado!

# OU: Execute dentro do container do Railway
railway run python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"
```

**IMPORTANTE**: Use seeds apenas em desenvolvimento. Em produção, crie dados manualmente.

---

## 4. Cloudinary (Armazenamento de Imagens)

### 4.1. Criar Conta

1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. No Dashboard, copie:
   - Cloud Name
   - API Key
   - API Secret

### 4.2. Configurar no Railway

Adicione as variáveis no Railway conforme seção 1.2.

---

## 5. Mercado Pago

### 5.1. Credenciais de Produção

1. Acesse https://www.mercadopago.com.br/developers/panel/credentials
2. Mude para "Credenciais de Produção"
3. Copie:
   - Public Key → `VITE_MERCADOPAGO_PUBLIC_KEY` (Vercel)
   - Access Token → `MERCADOPAGO_ACCESS_TOKEN` (Railway)

### 5.2. Webhook (Opcional)

Configure webhook para receber notificações de pagamento:
- URL: `https://contratapro-api.up.railway.app/subscriptions/webhook`

---

## 6. DNS e Domínio

### 6.1. Configurar Domínio na Vercel

1. Adicione domínio personalizado na Vercel
2. Configure DNS:
   - Tipo: CNAME
   - Nome: www
   - Valor: cname.vercel-dns.com

   - Tipo: A
   - Nome: @
   - Valor: 76.76.21.21

### 6.2. Atualizar CORS

Após configurar domínio, atualize o CORS no backend (`main.py`) para incluir seu domínio personalizado.

---

## 7. Checklist de Deploy

### Backend (Railway)
- [ ] Procfile criado
- [ ] CORS configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados conectado
- [ ] Migrações executadas
- [ ] Health check funcionando (`/health`)

### Frontend (Vercel)
- [ ] vercel.json criado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] API_URL configurado
- [ ] Testes de navegação

### Geral
- [ ] Cloudinary configurado
- [ ] Mercado Pago em modo produção
- [ ] DNS configurado (se domínio personalizado)
- [ ] SSL/HTTPS habilitado
- [ ] Testes de ponta a ponta

---

## 8. Monitoramento

### 8.1. Railway

- Logs: Acesse o dashboard do Railway
- Métricas: CPU, RAM, Network disponíveis no painel

### 8.2. Vercel

- Analytics: Vercel fornece analytics automático
- Logs: Disponíveis no dashboard

---

## 9. Troubleshooting

### Erro de CORS

**Sintoma**: `Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy`

**Solução**:
1. Verifique se a origem está listada em `backend/app/main.py`
2. Reinicie o backend no Railway
3. Limpe cache do navegador

### Erro 404 na API

**Sintoma**: Frontend não consegue conectar à API

**Solução**:
1. Verifique se a URL em `frontend/vercel.json` está correta
2. Teste a API diretamente: `https://contratapro-api.up.railway.app/health`
3. Verifique logs do Railway

### Build Failed na Vercel

**Sintoma**: Build do frontend falha

**Solução**:
1. Teste build localmente: `npm run build`
2. Verifique variáveis de ambiente
3. Veja logs detalhados na Vercel

---

## 10. Rollback

### Vercel

Cada deploy gera uma URL única. Para fazer rollback:
1. Vá em Deployments
2. Encontre o deploy anterior estável
3. Clique em "Promote to Production"

### Railway

1. Vá em Deployments
2. Selecione o deploy anterior
3. Clique em "Redeploy"

---

## 11. Atualizações

Para fazer updates:

1. **Desenvolvimento Local**:
   ```bash
   git checkout -b feature/nova-funcionalidade
   # Desenvolva e teste localmente
   git commit -m "feat: nova funcionalidade"
   ```

2. **Push e Deploy Automático**:
   ```bash
   git push origin feature/nova-funcionalidade
   # Crie Pull Request no GitHub
   # Vercel criará preview deploy automaticamente
   ```

3. **Merge para Produção**:
   ```bash
   # Após aprovação do PR
   git checkout main
   git merge feature/nova-funcionalidade
   git push origin main
   # Vercel e Railway farão deploy automático
   ```

---

## Suporte

- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- FastAPI: https://fastapi.tiangolo.com
- Vite: https://vitejs.dev

---

**Última atualização**: 2026-01-14
