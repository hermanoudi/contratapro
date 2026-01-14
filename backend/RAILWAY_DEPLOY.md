# Deploy no Railway - Backend

## Problema: "No start command was found"

Isso acontece quando o Railway não detecta automaticamente como iniciar sua aplicação.

## Solução

### Arquivos Criados:

1. ✅ **Procfile** - Comando de inicialização padrão
2. ✅ **railway.json** - Configuração específica do Railway
3. ✅ **runtime.txt** - Versão do Python
4. ✅ **requirements.txt** - Dependências (corrigido)

### Passo a Passo no Railway:

#### 1. Criar Novo Projeto

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize o Railway a acessar seu repositório
5. Selecione o repositório `contratapro`

#### 2. Configurar o Serviço

**IMPORTANTE**: O Railway pode não detectar automaticamente o diretório `/backend`.

**Opção A: Configurar Root Directory (Recomendado)**

1. Após criar o projeto, vá em **Settings**
2. Na seção **Source**, encontre **Root Directory**
3. Digite: `backend`
4. Clique em **Save**
5. O Railway irá redesenhar o projeto

**Opção B: Deploy Manual**

Se a Opção A não funcionar:

1. Vá em **Settings**
2. Na seção **Build**, configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Em **Source**, configure:
   - **Root Directory**: `backend`

#### 3. Adicionar Banco de Dados PostgreSQL

1. No dashboard do projeto, clique em **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. O Railway criará automaticamente a variável `DATABASE_URL`

#### 4. Configurar Variáveis de Ambiente

Vá em **Variables** e adicione:

```bash
# Banco de Dados (criado automaticamente pelo Railway)
DATABASE_URL=postgresql+asyncpg://... (fornecido automaticamente)

# JWT
JWT_SECRET_KEY=seu-secret-key-super-secreto-min-32-caracteres
JWT_ALGORITHM=HS256

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# Mercado Pago (PRODUÇÃO)
MERCADOPAGO_ACCESS_TOKEN=seu-access-token-de-producao

# Frontend URL
FRONTEND_URL=https://contratapro.vercel.app
```

#### 5. Ajustar DATABASE_URL

Por padrão, o Railway fornece a URL com `postgresql://`. Você precisa adicionar o driver assíncrono:

1. Vá em **Variables**
2. Encontre `DATABASE_URL`
3. Clique em **Raw Editor**
4. Modifique de:
   ```
   postgresql://...
   ```
   Para:
   ```
   postgresql+asyncpg://...
   ```
5. Ou crie uma nova variável `DATABASE_URL_ASYNC`:
   ```bash
   DATABASE_URL_ASYNC=${{Postgres.DATABASE_URL}}
   ```
   E no código, use `DATABASE_URL_ASYNC` em vez de `DATABASE_URL`

#### 6. Deploy

1. O Railway fará deploy automaticamente após você configurar tudo
2. Acompanhe os logs em **Deployments**
3. Quando estiver pronto, você verá: ✅ **Success**

#### 7. Obter URL da API

1. Vá em **Settings** → **Networking**
2. Clique em **Generate Domain**
3. Railway gerará uma URL como: `contratapro-production.up.railway.app`
4. **Copie essa URL!** Você precisará dela para configurar o frontend.

#### 8. Atualizar Frontend

Após obter a URL da API do Railway, atualize:

**No repositório frontend:**
1. Edite `frontend/vercel.json`
2. Atualize a linha 10:
   ```json
   "destination": "https://SUA-URL-DO-RAILWAY.up.railway.app/$1"
   ```
3. Commit e push

---

## Troubleshooting

### Erro: "No module named 'app'"

**Causa**: Railway não está executando do diretório correto.

**Solução**:
1. Verifique se **Root Directory** está configurado como `backend`
2. Ou atualize o **Start Command** para:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Erro: "Could not connect to database"

**Causa**: DATABASE_URL está incorreta ou sem o driver asyncpg.

**Solução**:
1. Verifique se a URL começa com `postgresql+asyncpg://`
2. Teste a conexão: vá em **Deployments** → **View Logs**
3. Procure por erros de conexão

### Erro: "Application startup failed"

**Causa**: Faltam variáveis de ambiente ou há erro no código.

**Solução**:
1. Verifique os logs: **Deployments** → **View Logs**
2. Confirme que todas as variáveis estão configuradas
3. Teste localmente primeiro

### Build demora muito

**Causa**: O Railway está instalando todas as dependências do zero.

**Solução**: Isso é normal no primeiro deploy. Os próximos serão mais rápidos devido ao cache.

---

## Verificação

Após o deploy, teste:

```bash
# Health check
curl https://sua-url.up.railway.app/health

# Deve retornar algo como:
# "OK" ou redirecionamento 307
```

Se funcionar, sua API está no ar! 🚀

---

## Comandos Úteis

### Ver logs em tempo real
```bash
railway logs
```

### Executar comando no container
```bash
railway run python manage.py migrate
```

### Conectar ao banco
```bash
railway connect postgres
```

---

## Importante

- ⚠️ **NÃO** execute seeds em produção
- ⚠️ **NÃO** commit credenciais no código
- ✅ **SEMPRE** use variáveis de ambiente
- ✅ **TESTE** localmente antes de fazer deploy

---

## Próximos Passos

Após deploy bem-sucedido:

1. ✅ Copiar URL da API do Railway
2. ✅ Atualizar `frontend/vercel.json` com a URL
3. ✅ Deploy do frontend na Vercel
4. ✅ Testar integração completa

---

**Última atualização**: 2026-01-14
