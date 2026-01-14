# 🚀 Configuração do ngrok para Fluxo Completo de Assinaturas

## 📋 O que o ngrok faz?

O ngrok cria um túnel seguro que expõe seu servidor local (localhost) para a internet através de uma URL pública temporária. Isso permite que o Mercado Pago:

1. ✅ Aceite a `back_url` (redirecionamento após pagamento)
2. ✅ Envie notificações para o webhook
3. ✅ Simule o comportamento de produção em desenvolvimento

---

## 1️⃣ Instalação do ngrok

### Opção A: Via Snap (Recomendado - Mais Rápido)
```bash
sudo snap install ngrok
```

### Opção B: Download Manual
1. Acesse: https://ngrok.com/download
2. Baixe a versão para Linux
3. Extraia e mova para /usr/local/bin:
```bash
cd ~/Downloads
unzip ngrok-v3-stable-linux-amd64.zip
sudo mv ngrok /usr/local/bin/
```

### Verificar instalação:
```bash
ngrok version
```

Deve mostrar algo como: `ngrok version 3.x.x`

---

## 2️⃣ Criar Conta no ngrok (Gratuita)

**Por que?** A conta gratuita oferece:
- ✅ URLs mais estáveis
- ✅ Sessões mais longas
- ✅ Melhor performance

### Passos:
1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita (pode usar Google/GitHub)
3. Copie seu **authtoken** em: https://dashboard.ngrok.com/get-started/your-authtoken

### Configurar authtoken:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

**Exemplo:**
```bash
ngrok config add-authtoken 2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
```

---

## 3️⃣ Iniciar ngrok para o Frontend

### Comando:
```bash
ngrok http 5173
```

### O que você verá:
```
ngrok

Session Status                online
Account                       seu_email@exemplo.com (Plan: Free)
Version                       3.5.0
Region                        South America (sa)
Latency                       15ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### ⚠️ IMPORTANTE:
**NÃO FECHE ESTA JANELA!** O ngrok precisa ficar rodando.

Copie a URL `Forwarding` (exemplo: `https://abc123def456.ngrok-free.app`)

---

## 4️⃣ Atualizar Configuração do Projeto

### Abra `backend/.env` e altere:
```bash
# ANTES:
FRONTEND_URL=http://localhost:5173

# DEPOIS (use SUA URL do ngrok):
FRONTEND_URL=https://abc123def456.ngrok-free.app
```

**💡 Dica:** Use a URL **HTTPS** que o ngrok forneceu (não a HTTP)

### Salve o arquivo `.env`

---

## 5️⃣ Reiniciar o Backend

```bash
docker-compose restart backend
```

Aguarde 5 segundos para o backend iniciar completamente.

---

## 6️⃣ Testar o Fluxo Completo

### 1. Acesse o frontend PELA URL DO NGROK:
```
https://sua-url.ngrok-free.app/register-pro
```

**⚠️ IMPORTANTE:** Use a URL do ngrok, NÃO `localhost:5173`!

### 2. Cadastre um profissional:
- Preencha todos os dados
- Você será redirecionado para a página de assinatura

### 3. Clique em "Ir para Pagamento Seguro"

### 4. Use o cartão de teste:
```
Número: 5031 4332 1540 6351
Nome: APRO
CVV: 123
Validade: 11/25
CPF: 12345678909
```

### 5. Confirme o pagamento

### 6. Aguarde o redirecionamento automático ✨
- ✅ Você será redirecionado automaticamente para `/subscription/callback`
- ✅ Verá a mensagem de sucesso
- ✅ Será levado para o dashboard

---

## 7️⃣ Verificar Resultado

### No Admin Dashboard:
```
https://sua-url.ngrok-free.app/admin
Login: admin@chamaeu.com
Senha: admin123
```

Na aba **"Assinaturas"**, você deve ver:
- ✅ Uma nova assinatura
- ✅ Status: "pending" ou "active" (dependendo do webhook)
- ✅ Valor: R$ 1,00
- ✅ Profissional recém-cadastrado

---

## 8️⃣ Configurar Webhook (Opcional - Para Status Automático)

Com o webhook configurado, o status da assinatura muda automaticamente de "pending" para "active".

### Passos:
1. Mantenha o ngrok rodando
2. Acesse: https://www.mercadopago.com.br/developers/panel/app
3. Selecione sua aplicação
4. Vá em **"Webhooks"** → **"Configurar notificações"**
5. Cole a URL do webhook:
```
https://sua-url.ngrok-free.app/subscriptions/webhook
```

6. Selecione os eventos:
   - ✅ Assinaturas (preapproval)
   - ✅ Pagamentos (payment)

7. Salve

### Testar Webhook:
Após configurar, faça um novo pagamento de teste. Você verá nos logs do backend:

```bash
docker-compose logs -f backend
```

Deve aparecer:
```
INFO: Webhook recebido: {'type': 'preapproval', 'data': {'id': '...'}}
INFO: Assinatura atualizada: 1 -> authorized
```

---

## 🔧 Troubleshooting

### Erro: "Tunnel not found"
- **Causa:** Você está acessando `localhost:5173` em vez da URL do ngrok
- **Solução:** Use `https://sua-url.ngrok-free.app`

### Erro: "Failed to connect to ngrok"
- **Causa:** ngrok não está rodando
- **Solução:** Rode `ngrok http 5173` novamente

### URL do ngrok mudou
- **Causa:** Você reiniciou o ngrok (URLs gratuitas mudam a cada reinício)
- **Solução:**
  1. Copie a nova URL
  2. Atualize `FRONTEND_URL` no `.env`
  3. Reinicie o backend: `docker-compose restart backend`
  4. Atualize a URL do webhook no painel do Mercado Pago (se configurou)

### Aviso: "Visit Site" ao acessar ngrok
- **Causa:** Página de boas-vindas do ngrok (primeira vez)
- **Solução:** Clique em "Visit Site" para acessar sua aplicação

### Backend não aceita a URL do ngrok
- **Causa:** Esqueceu de atualizar o `.env` ou reiniciar o backend
- **Solução:** Verifique se `FRONTEND_URL` está correto e rode `docker-compose restart backend`

---

## 💡 Dicas Úteis

### 1. Interface Web do ngrok
Acesse `http://127.0.0.1:4040` para ver:
- Todas as requisições HTTP
- Detalhes de cada chamada
- Útil para debugar problemas

### 2. Manter ngrok rodando
Use `tmux` ou `screen` para manter o ngrok em background:
```bash
# Instalar tmux
sudo apt install tmux

# Iniciar sessão
tmux new -s ngrok

# Dentro do tmux, rode:
ngrok http 5173

# Sair do tmux (mantém rodando): Ctrl+B, depois D
# Voltar para o tmux: tmux attach -t ngrok
```

### 3. URL Fixa (Plano Pago)
Se quiser uma URL que não mude a cada reinício, considere o plano pago do ngrok ($8/mês):
- URL personalizada (ex: `meu-app.ngrok.io`)
- Não expira
- Mais estável

---

## 📚 Documentação Oficial

- **ngrok:** https://ngrok.com/docs
- **ngrok + Mercado Pago:** https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-test/test-with-ngrok

---

## ✅ Checklist Final

Antes de testar, certifique-se:

- [ ] ngrok instalado e autenticado
- [ ] ngrok rodando (`ngrok http 5173`)
- [ ] URL do ngrok copiada
- [ ] `FRONTEND_URL` atualizado no `backend/.env`
- [ ] Backend reiniciado
- [ ] Acessando pela URL do ngrok (não localhost)
- [ ] Webhook configurado (opcional)

---

**Pronto!** Agora você tem o fluxo completo funcionando com redirecionamento automático! 🎉
