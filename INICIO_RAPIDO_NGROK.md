# ⚡ Início Rápido - ngrok para Assinaturas

## 🎯 Objetivo
Configurar ngrok em **5 minutos** para testar o fluxo completo de assinaturas com redirecionamento automático.

---

## 📝 Passo a Passo

### 1️⃣ Instalar ngrok
```bash
./install_ngrok.sh
```

Ou instale manualmente via snap:
```bash
sudo snap install ngrok
```

---

### 2️⃣ Criar Conta e Autenticar (1 minuto)

**A) Crie conta gratuita:**
- Acesse: https://dashboard.ngrok.com/signup
- Use Google/GitHub para login rápido

**B) Copie seu authtoken:**
- Acesse: https://dashboard.ngrok.com/get-started/your-authtoken
- Copie o token (exemplo: `2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5`)

**C) Configure no terminal:**
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**Exemplo:**
```bash
ngrok config add-authtoken 2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
```

---

### 3️⃣ Iniciar ngrok

**IMPORTANTE:** Abra um **NOVO TERMINAL** (deixe o terminal atual livre) e rode:

```bash
ngrok http 5173
```

Você verá algo assim:
```
Forwarding   https://abc123def456.ngrok-free.app -> http://localhost:5173
```

**📋 COPIE A URL HTTPS** (exemplo: `https://abc123def456.ngrok-free.app`)

⚠️ **NÃO FECHE ESTE TERMINAL!** Deixe o ngrok rodando.

---

### 4️⃣ Atualizar Configuração

**No terminal original**, edite o arquivo `.env`:

```bash
nano backend/.env
```

**Encontre a linha:**
```bash
FRONTEND_URL=http://localhost:5173
```

**Substitua pela URL do ngrok:**
```bash
FRONTEND_URL=https://abc123def456.ngrok-free.app
```

**Salve:** `Ctrl+O` → Enter → `Ctrl+X`

---

### 5️⃣ Reiniciar Backend

```bash
docker-compose restart backend
```

Aguarde 5 segundos.

---

### 6️⃣ Testar!

**A) Acesse PELA URL DO NGROK:**
```
https://sua-url-ngrok.ngrok-free.app/register-pro
```

**B) Cadastre um profissional**

**C) Use o cartão de teste:**
```
Número: 5031 4332 1540 6351
Nome: APRO
CVV: 123
Validade: 11/25
CPF: 12345678909
```

**D) Aguarde o redirecionamento automático! ✨**

---

## ✅ Resultado Esperado

Após pagar com o cartão de teste:
1. ✅ Você será redirecionado automaticamente para a página de confirmação
2. ✅ Verá "Assinatura Ativada!" (ou "Pagamento em Análise")
3. ✅ Será levado para o dashboard

**Verifique no Admin:**
- URL: `https://sua-url-ngrok.ngrok-free.app/admin`
- Login: `admin@chamaeu.com` / `admin123`
- Aba "Assinaturas" → Deve aparecer a nova assinatura

---

## 🔧 Problemas Comuns

### "Tunnel not found" ou "404"
- **Você está usando localhost** em vez da URL do ngrok
- **Solução:** Use `https://sua-url.ngrok-free.app`

### URL do ngrok mudou
- **Causa:** Você reiniciou o ngrok (URLs mudam a cada reinício)
- **Solução:**
  1. Copie a nova URL do ngrok
  2. Atualize `FRONTEND_URL` no `.env`
  3. Reinicie: `docker-compose restart backend`

### "Visit Site" ao acessar
- **Causa:** Página de boas-vindas do ngrok
- **Solução:** Clique em "Visit Site"

---

## 💡 Dica: Manter ngrok Rodando

Se fechar o terminal, o ngrok para. Para evitar:

```bash
# Instalar tmux
sudo apt install tmux

# Criar sessão
tmux new -s ngrok

# Dentro do tmux:
ngrok http 5173

# Sair (mantém rodando): Ctrl+B, depois D
# Voltar: tmux attach -t ngrok
```

---

## 📊 Monitorar Requisições

Acesse a interface web do ngrok:
```
http://127.0.0.1:4040
```

Aqui você pode ver todas as requisições em tempo real!

---

## ⏹️ Parar tudo

**Parar ngrok:**
- No terminal do ngrok: `Ctrl+C`

**Voltar para localhost:**
1. Edite `backend/.env`:
   ```bash
   FRONTEND_URL=http://localhost:5173
   ```
2. Reinicie: `docker-compose restart backend`

---

## 📚 Documentação Completa

Para mais detalhes, veja: [SETUP_NGROK.md](SETUP_NGROK.md)

---

**Pronto!** Com estes 6 passos você terá o fluxo completo funcionando! 🚀
