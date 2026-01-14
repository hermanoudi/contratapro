# 🚀 Setup Frontend no Vercel - contratapro.com.br

## ✅ Pré-requisitos Concluídos:
- ✅ Backend funcionando em `https://api.contratapro.com.br`
- ✅ `vercel.json` já configurado com API URL
- ✅ Frontend usa `config.js` para API_URL dinâmica

---

## 1️⃣ Configurar Domínio no Vercel

### No Vercel Dashboard:

1. Acesse https://vercel.com
2. Selecione seu projeto do frontend
3. Vá em **Settings** → **Domains**
4. Clique em **Add Domain**

#### Adicionar domínio principal:
- Digite: `contratapro.com.br`
- Clique em **Add**

#### Adicionar subdomínio www:
- Clique em **Add Domain** novamente
- Digite: `www.contratapro.com.br`
- Clique em **Add**

### Vercel vai mostrar os registros DNS necessários

---

## 2️⃣ Configurar DNS no GoDaddy

### Registros DNS a Adicionar:

#### Para o domínio raiz (contratapro.com.br):

**Opção A - Registro A (Recomendado):**
| Tipo | Nome | Valor        | TTL    |
|------|------|--------------|--------|
| A    | @    | 76.76.21.21  | 1 hora |

**Opção B - CNAME (se A não funcionar):**
| Tipo  | Nome | Valor                 | TTL    |
|-------|------|-----------------------|--------|
| CNAME | @    | cname.vercel-dns.com  | 1 hora |

#### Para o subdomínio www:

| Tipo  | Nome | Valor                 | TTL    |
|-------|------|-----------------------|--------|
| CNAME | www  | cname.vercel-dns.com  | 1 hora |

---

## 3️⃣ Configurar Variáveis de Ambiente no Vercel

### No Vercel Dashboard:

1. Vá em **Settings** → **Environment Variables**
2. Adicione a seguinte variável:

```
Name: VITE_API_URL
Value: https://api.contratapro.com.br
```

3. **Marque para aplicar em**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Clique em **Save**

---

## 4️⃣ Fazer Deploy

### Opção A - Trigger Automático (Recomendado):

O código já está commitado. Basta fazer push:

```bash
cd /home/hermano/projetos/faz_de_tudo

# Verificar se há mudanças pendentes
git status

# Se houver mudanças, commitar
git add .
git commit -m "chore: preparar frontend para produção"
git push origin main
```

O Vercel fará deploy automático!

### Opção B - Redeploy Manual:

1. No Vercel Dashboard
2. Vá em **Deployments**
3. Clique nos **três pontos (⋮)** do último deployment
4. Selecione **Redeploy**
5. Marque **Use existing Build Cache** (opcional)
6. Clique em **Redeploy**

---

## 5️⃣ Verificar Build e Deploy

### Acompanhar Deploy:

1. Vercel → **Deployments**
2. Clique no deployment em progresso
3. Veja os logs em tempo real
4. Aguarde até aparecer: **"✓ Build Completed"**

### O que deve aparecer nos logs:

```
✓ Downloading build cache...
✓ Installing dependencies...
✓ Building application...
✓ Uploading build output...
✓ Deployment Ready
```

---

## 6️⃣ Testar Frontend

### Após propagação DNS (5-30 minutos):

```bash
# Verificar DNS
dig +short contratapro.com.br
dig +short www.contratapro.com.br

# Testar HTTPS
curl -I https://contratapro.com.br
curl -I https://www.contratapro.com.br
```

### Abrir no Navegador:

1. https://contratapro.com.br
2. https://www.contratapro.com.br

### Verificar Integração com Backend:

1. Abra o navegador
2. Acesse https://contratapro.com.br
3. Abra **DevTools** (F12) → **Console**
4. Navegue pelas páginas que fazem chamadas à API
5. Verifique se não há erros de CORS
6. As requisições devem ir para `https://api.contratapro.com.br`

---

## 7️⃣ Verificar CORS

### Teste Manual:

```bash
curl -H "Origin: https://contratapro.com.br" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.contratapro.com.br/categories/
```

**Resposta esperada deve incluir:**
```
access-control-allow-origin: https://contratapro.com.br
access-control-allow-credentials: true
```

---

## ✅ Checklist Final

- [ ] Domínios adicionados no Vercel (`contratapro.com.br` e `www`)
- [ ] Registros DNS configurados no GoDaddy (A ou CNAME para raiz, CNAME para www)
- [ ] `VITE_API_URL` configurado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] DNS propagado (pode levar 5-30 minutos)
- [ ] SSL ativo (Vercel gera automaticamente)
- [ ] Frontend carrega em `https://contratapro.com.br`
- [ ] Frontend carrega em `https://www.contratapro.com.br`
- [ ] Requisições à API funcionando sem erros de CORS
- [ ] Login e cadastro funcionando
- [ ] Busca de profissionais funcionando
- [ ] Imagens do Cloudinary carregando

---

## 🔧 Troubleshooting

### DNS não resolve

```bash
# Limpar cache DNS local
sudo systemd-resolve --flush-caches

# Verificar propagação global
# Acesse: https://dnschecker.org
# Digite: contratapro.com.br
```

### Erro de SSL/HTTPS

- Vercel gera certificado SSL automaticamente
- Pode levar até 1 hora após configurar domínio
- Verifique em Vercel → Settings → Domains (deve mostrar "SSL Active")

### CORS Error no navegador

```
Access to fetch at 'https://api.contratapro.com.br/...' from origin
'https://contratapro.com.br' has been blocked by CORS policy
```

**Solução:**
- Verifique se `origins` no `backend/app/main.py` inclui `https://contratapro.com.br`
- Já está configurado! Se continuar, faça redeploy do backend

### API retorna 404

- Verifique se `vercel.json` tem o rewrite correto
- Já está configurado para `https://api.contratapro.com.br`
- Teste direto: `curl https://api.contratapro.com.br/health`

### Build falha no Vercel

```bash
# Ver logs detalhados
vercel logs <deployment-url>

# Ou no dashboard: Deployments → Click no deployment → View Function Logs
```

Erros comuns:
- **Faltando dependências**: Adicione ao `package.json`
- **Erro de build**: Verifique se `npm run build` funciona localmente
- **Variável de ambiente**: Certifique-se que `VITE_API_URL` está configurada

---

## 🎯 Arquitetura Final

```
┌─────────────────────────────────────────────────────┐
│                   DNS (GoDaddy)                      │
│  contratapro.com.br → 76.76.21.21 (Vercel)          │
│  www.contratapro.com.br → cname.vercel-dns.com      │
│  api.contratapro.com.br → z79qb0a7.up.railway.app   │
└─────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         │                                    │
         ▼                                    ▼
┌───────────────────┐              ┌────────────────────┐
│  Vercel CDN       │              │  Railway Server    │
│  (Frontend)       │──── CORS ────▶  (Backend API)    │
│  React + Vite     │              │  FastAPI + Python  │
└───────────────────┘              └────────┬───────────┘
                                            │
                                            ▼
                                   ┌────────────────────┐
                                   │  PostgreSQL        │
                                   │  (Railway)         │
                                   │  33 Categorias ✓   │
                                   └────────────────────┘
```

---

## 📊 URLs Finais

| Serviço     | URL                              | Status |
|-------------|----------------------------------|--------|
| Frontend    | https://contratapro.com.br       | ⏳ Configurando |
| Frontend WWW| https://www.contratapro.com.br   | ⏳ Configurando |
| Backend API | https://api.contratapro.com.br   | ✅ Online |
| API Docs    | https://api.contratapro.com.br/docs | ✅ Online |
| Health      | https://api.contratapro.com.br/health | ✅ Healthy |

---

**Última atualização**: 2026-01-14
