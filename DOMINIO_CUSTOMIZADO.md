# 🌐 Configurar Domínio Customizado (contratapro.com.br)

## Estrutura Final:
- **Frontend**: `https://contratapro.com.br` (Vercel)
- **Backend API**: `https://api.contratapro.com.br` (Railway)

---

## 1️⃣ Backend - Railway (api.contratapro.com.br)

### No Railway Dashboard:

1. Acesse https://railway.app
2. Selecione o projeto **contratapro**
3. Clique no serviço **backend**
4. Vá em **Settings**
5. Role até **Networking** → **Custom Domain**
6. Clique em **+ Custom Domain**
7. Digite: `api.contratapro.com.br`
8. O Railway mostrará o **CNAME target** (anote!)

### No Painel DNS (Registro.br / Cloudflare):

Adicione o registro CNAME:

| Tipo  | Nome | Valor (Target)                              | TTL  |
|-------|------|---------------------------------------------|------|
| CNAME | api  | `contratapro-production-XXXX.up.railway.app` | 3600 |

**Importante**: Substitua `XXXX` pelo valor real que o Railway mostrou!

### Aguardar Propagação:
```bash
# Verificar se DNS propagou (pode levar 5-30 minutos)
dig api.contratapro.com.br
nslookup api.contratapro.com.br
```

### Testar API:
```bash
curl https://api.contratapro.com.br/health
curl https://api.contratapro.com.br/categories/
```

---

## 2️⃣ Frontend - Vercel (contratapro.com.br)

### No Vercel Dashboard:

1. Acesse https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Domains**
4. Clique em **Add**
5. Digite: `contratapro.com.br`
6. Clique em **Add** novamente
7. Digite: `www.contratapro.com.br`

O Vercel mostrará os registros DNS necessários.

### No Painel DNS:

#### Para domínio raiz (contratapro.com.br):

| Tipo | Nome | Valor           | TTL  |
|------|------|-----------------|------|
| A    | @    | 76.76.21.21     | 3600 |

#### Para subdomínio www:

| Tipo  | Nome | Valor                | TTL  |
|-------|------|----------------------|------|
| CNAME | www  | cname.vercel-dns.com | 3600 |

**Nota**: Se seu provedor não suportar registro A no domínio raiz, use CNAME apontando para `cname.vercel-dns.com`

### Configurar Variável de Ambiente:

1. Vercel → Projeto → **Settings** → **Environment Variables**
2. Adicione:
   ```
   VITE_API_URL = https://api.contratapro.com.br
   ```
3. Aplique para: **Production**, **Preview**, **Development**
4. **Save**

### Fazer Redeploy:

1. Vá em **Deployments**
2. Clique nos **três pontos** do último deploy
3. Selecione **Redeploy**

---

## 3️⃣ Atualizar Código

### Backend (Railway) - Variável de Ambiente

No Railway Dashboard:
1. Backend → **Variables**
2. Edite:
   ```
   FRONTEND_URL=https://contratapro.com.br
   ```

### Frontend - Commit Mudanças

```bash
cd /home/hermano/projetos/faz_de_tudo

git add frontend/vercel.json
git commit -m "feat: configurar domínio customizado api.contratapro.com.br

- Atualiza vercel.json para usar api.contratapro.com.br
- Remove dependência de URL temporária do Railway

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

O Vercel fará deploy automático!

---

## 4️⃣ Verificação Final

### Testar Backend:
```bash
# Health check
curl https://api.contratapro.com.br/health

# Categorias
curl https://api.contratapro.com.br/categories/

# Documentação
# Abra no navegador:
https://api.contratapro.com.br/docs
```

### Testar Frontend:
```bash
# Abra no navegador:
https://contratapro.com.br
https://www.contratapro.com.br
```

### Testar CORS:
```bash
curl -H "Origin: https://contratapro.com.br" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.contratapro.com.br/categories/
```

Deve retornar headers de CORS permitindo a origem.

---

## ✅ Checklist

- [ ] DNS configurado no provedor (CNAME para `api`, A/CNAME para raiz)
- [ ] Domínio customizado adicionado no Railway
- [ ] Domínio customizado adicionado no Vercel
- [ ] `VITE_API_URL` configurado no Vercel
- [ ] `FRONTEND_URL` atualizado no Railway
- [ ] `vercel.json` atualizado com novo domínio
- [ ] Código commitado e push feito
- [ ] Redeploy do Vercel concluído
- [ ] API responde em `https://api.contratapro.com.br/health`
- [ ] Frontend carrega em `https://contratapro.com.br`
- [ ] CORS funcionando entre frontend e backend

---

## 🔧 Troubleshooting

### DNS não propaga
```bash
# Limpar cache DNS local
sudo systemd-resolve --flush-caches  # Linux
dscacheutil -flushcache              # Mac

# Verificar propagação global
https://dnschecker.org
```

### Erro SSL/TLS
- Railway e Vercel geram certificados SSL automaticamente
- Pode levar alguns minutos após configurar o domínio
- Aguarde até 1 hora para propagação completa

### CORS Error no navegador
- Verifique se `FRONTEND_URL` está correto no Railway
- Certifique-se que `origins` no `main.py` inclui seu domínio
- Limpe cache do navegador

### API não responde
- Verifique se CNAME está correto
- Aguarde propagação DNS (5-30 minutos)
- Verifique logs do Railway: `railway logs -f`

---

## 📊 Resumo da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                        Internet                          │
└─────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────────┐
│ contratapro.com.br│              │api.contratapro.com.br│
│  (Vercel DNS)     │              │   (Railway DNS)      │
└────────┬──────────┘              └──────────┬───────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────────┐
│   Vercel CDN     │─────CORS─────▶   Railway Server    │
│  (Frontend)      │              │    (Backend API)     │
└──────────────────┘              └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  PostgreSQL Database │
                                  │    (Railway)         │
                                  └──────────────────────┘
```

---

**Última atualização**: 2026-01-14
