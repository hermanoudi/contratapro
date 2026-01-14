# ✅ Checklist Rápido de Deploy

## Arquivos Prontos

### Backend
- ✅ `backend/Procfile` - Comando de start
- ✅ `backend/railway.json` - Configuração Railway
- ✅ `backend/runtime.txt` - Python 3.12.7
- ✅ `backend/requirements.txt` - Dependências (corrigido)
- ✅ `backend/app/main.py` - CORS configurado

### Frontend
- ✅ `frontend/vercel.json` - Configuração Vercel
- ✅ `frontend/src/config.js` - API_URL configurado
- ✅ `frontend/.env.example` - Template de variáveis
- ✅ Todos os arquivos atualizados para usar `${API_URL}`

---

## 1. Deploy do Backend (Railway)

### Passo 1: Criar Projeto
1. Acesse https://railway.app
2. Login com GitHub
3. New Project → Deploy from GitHub repo
4. Selecione seu repositório

### Passo 2: Configurar Root Directory
⚠️ **IMPORTANTE**: Defina o diretório raiz!

1. Vá em **Settings**
2. Seção **Source**
3. **Root Directory**: `backend`
4. Salvar

### Passo 3: Adicionar PostgreSQL
1. Clique em **+ New**
2. **Database** → **Add PostgreSQL**
3. Aguarde criação

### Passo 4: Configurar Variáveis
Em **Variables**, adicione:

```bash
JWT_SECRET_KEY=seu-secret-minimo-32-caracteres-aqui
JWT_ALGORITHM=HS256
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
MERCADOPAGO_ACCESS_TOKEN=seu-access-token-producao
FRONTEND_URL=https://contratapro.vercel.app
```

### Passo 5: Gerar Domínio
1. **Settings** → **Networking**
2. **Generate Domain**
3. **COPIE A URL!** (ex: `contratapro-production.up.railway.app`)

---

## 2. Atualizar Frontend com URL do Railway

### Antes de fazer deploy do frontend:

1. Edite `frontend/vercel.json`
2. Linha 10, substitua:
   ```json
   "destination": "https://contratapro-production.up.railway.app/$1"
   ```
3. Commit e push

---

## 3. Deploy do Frontend (Vercel)

### Passo 1: Importar Projeto
1. Acesse https://vercel.com
2. **Add New** → **Project**
3. Importe do GitHub

### Passo 2: Configurar Build
- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Passo 3: Variáveis de Ambiente
Adicione em **Environment Variables**:

```bash
VITE_API_URL=
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-sua-chave-publica-producao
```

⚠️ Deixe `VITE_API_URL` **vazio** para usar o proxy!

### Passo 4: Deploy
1. Clique em **Deploy**
2. Aguarde build (2-5 minutos)
3. Pronto! 🎉

---

## 4. Verificação

### Testar Backend
```bash
curl https://sua-url.up.railway.app/health
```

### Testar Frontend
1. Acesse a URL da Vercel
2. Tente fazer login
3. Verifique se a API está respondendo

---

## 5. Problemas Comuns

### Railway: "No start command found"
✅ **Solução**: Configurar Root Directory = `backend`

### Railway: "Build failed"
✅ **Solução**: Verificar logs, checar requirements.txt

### Vercel: "Build failed"
✅ **Solução**:
- Verificar se Root Directory = `frontend`
- Rodar `npm run build` localmente

### Frontend não conecta à API
✅ **Solução**:
- Verificar URL em `vercel.json`
- Verificar CORS no backend
- Testar API diretamente no navegador

---

## 6. Após Deploy Bem-Sucedido

- [ ] Teste login
- [ ] Teste cadastro
- [ ] Teste busca de profissionais
- [ ] Teste agendamento
- [ ] Teste upload de imagens
- [ ] Teste pagamento (modo teste primeiro!)

---

## Comandos Git para Deploy

```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "feat: preparar para deploy em produção (Railway + Vercel)"

# Push (isso trigará os deploys automáticos)
git push origin main
```

---

## URLs Importantes

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Cloudinary: https://cloudinary.com/console
- Mercado Pago: https://www.mercadopago.com.br/developers

---

## Suporte

Se tiver problemas:

1. Verifique os logs (Railway e Vercel têm logs detalhados)
2. Teste localmente primeiro
3. Confira as variáveis de ambiente
4. Consulte `RAILWAY_DEPLOY.md` para troubleshooting detalhado

---

**Boa sorte com o deploy! 🚀**
