# 🔐 Como Configurar Variáveis de Ambiente no Railway

## Passo a Passo com Screenshots

### 1️⃣ Adicionar PostgreSQL Primeiro

**Antes de configurar variáveis**, adicione o banco de dados:

1. No dashboard do projeto, clique **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Aguarde a criação (30 segundos)

✅ O Railway criará automaticamente a variável `DATABASE_URL`

---

### 2️⃣ Acessar a Aba de Variáveis

1. Clique no seu **serviço backend** (não no PostgreSQL)
2. Clique na aba **"Variables"** (ou "Environment")

---

### 3️⃣ Adicionar Variáveis (Escolha um método)

#### Método A: Raw Editor (Mais Rápido) ⚡

1. Clique em **"RAW EDITOR"** (canto superior direito)
2. Cole o conteúdo abaixo:

```env
JWT_SECRET_KEY=GERE-UM-SECRET-FORTE-AQUI-32-CARACTERES-MINIMO
JWT_ALGORITHM=HS256
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
UPLOAD_STORAGE=cloudinary
MERCADOPAGO_ACCESS_TOKEN=APP_USR-seu-token-de-producao
FRONTEND_URL=https://contratapro.vercel.app
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months
MAX_UPLOAD_SIZE=5242880
```

3. Clique em **"Update Variables"**

#### Método B: Adicionar Uma por Uma

1. Clique em **"+ New Variable"**
2. Para cada variável:
   - **Variable Name**: nome da variável (ex: `JWT_SECRET_KEY`)
   - **Value**: valor da variável
   - Clique em **"Add"**

---

### 4️⃣ Gerar JWT_SECRET_KEY Forte

**IMPORTANTE**: Nunca use um secret padrão em produção!

**Opção 1: Online**
- Acesse https://generate-secret.vercel.app/32
- Copie o secret gerado

**Opção 2: Terminal**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Opção 3: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### 5️⃣ Obter Credenciais do Cloudinary

1. Acesse https://cloudinary.com/console
2. No dashboard, você verá:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET` (clique em "Reveal" para ver)

---

### 6️⃣ Obter Credenciais do Mercado Pago (PRODUÇÃO)

1. Acesse https://www.mercadopago.com.br/developers/panel/credentials
2. **IMPORTANTE**: Selecione **"Credenciais de produção"** (não "Teste")
3. Copie:
   - **Access Token** → `MERCADOPAGO_ACCESS_TOKEN`

⚠️ **ATENÇÃO**: Em produção, use APENAS credenciais de PRODUÇÃO!

---

### 7️⃣ Verificar DATABASE_URL

Após adicionar PostgreSQL, verifique:

1. Vá em **Variables**
2. Procure por `DATABASE_URL`
3. **NÃO modifique!** O Railway gerencia automaticamente
4. O código já converte para `postgresql+asyncpg://` automaticamente

Se quiser ver o valor:
- Clique nos 3 pontinhos `...` ao lado da variável
- Selecione **"Show Value"**

---

### 8️⃣ Redesploy (Se Necessário)

Após adicionar/modificar variáveis:

1. O Railway geralmente redesenha automaticamente
2. Se não, vá em **Deployments**
3. Clique nos 3 pontinhos do último deploy
4. Selecione **"Redeploy"**

---

## 📋 Checklist de Variáveis

Verifique se você adicionou todas:

- [ ] `JWT_SECRET_KEY` (gerado com tool de secrets)
- [ ] `JWT_ALGORITHM` (HS256)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `UPLOAD_STORAGE` (cloudinary)
- [ ] `MERCADOPAGO_ACCESS_TOKEN` (PRODUÇÃO)
- [ ] `FRONTEND_URL` (https://contratapro.vercel.app)
- [ ] `SUBSCRIPTION_AMOUNT` (50.00)
- [ ] `SUBSCRIPTION_FREQUENCY` (1)
- [ ] `SUBSCRIPTION_FREQUENCY_TYPE` (months)
- [ ] `MAX_UPLOAD_SIZE` (5242880)

**Variáveis Automáticas (NÃO adicione manualmente):**
- [ ] `DATABASE_URL` (criada automaticamente pelo PostgreSQL)
- [ ] `PORT` (Railway define automaticamente)

---

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Logs

1. Vá em **Deployments**
2. Clique no deployment ativo
3. Veja os logs em tempo real
4. Procure por:
   ```
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:PORT
   ```

### 2. Testar Health Check

1. Gere um domínio: **Settings** → **Networking** → **Generate Domain**
2. No navegador, acesse: `https://seu-dominio.up.railway.app/health`
3. Deve retornar: `"OK"` ou redirecionamento

### 3. Verificar Variáveis no Container

Se os logs mostrarem erros de variáveis não encontradas:

1. Vá em **Variables**
2. Confira se todas estão listadas
3. Verifique se não há espaços extras nos valores
4. Redesenhe se necessário

---

## ⚠️ Problemas Comuns

### "KeyError: DATABASE_URL"

**Causa**: PostgreSQL não foi adicionado ou DATABASE_URL não está disponível

**Solução**:
1. Adicione PostgreSQL ao projeto
2. Aguarde criação completa
3. Verifique se `DATABASE_URL` aparece em Variables

### "Invalid JWT Secret"

**Causa**: JWT_SECRET_KEY não foi definido ou é muito curto

**Solução**:
1. Gere um secret de pelo menos 32 caracteres
2. Adicione em Variables como `JWT_SECRET_KEY`

### "Cloudinary not configured"

**Causa**: Credenciais do Cloudinary faltando ou incorretas

**Solução**:
1. Verifique se as 3 variáveis do Cloudinary estão definidas
2. Confirme que `UPLOAD_STORAGE=cloudinary`
3. Verifique se as credenciais estão corretas

### "Mercado Pago error"

**Causa**: Token de teste sendo usado em produção

**Solução**:
1. Use APENAS credenciais de PRODUÇÃO
2. Verifique se o token começa com `APP_USR-`
3. Não use tokens de teste (começam com `TEST-`)

---

## 💡 Dicas de Segurança

✅ **FAÇA**:
- Gere secrets fortes e únicos
- Use credenciais de produção em produção
- Mantenha variáveis de ambiente atualizadas
- Revogue credenciais antigas ao gerar novas

❌ **NÃO FAÇA**:
- Commit variáveis no código
- Compartilhe secrets publicamente
- Use credenciais de teste em produção
- Reutilize secrets entre projetos

---

## 📝 Template de Variáveis

Arquivo disponível em: `backend/.env.railway.template`

Para usar:
1. Abra o arquivo
2. Substitua os valores de exemplo
3. Cole no Raw Editor do Railway

---

**Última atualização**: 2026-01-14
