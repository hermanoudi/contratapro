# 🚀 Guia de Configuração do Mercado Pago (Modo Teste)

## 📋 Pré-requisitos
- Conta no Mercado Pago (gratuita)
- Projeto rodando localmente

---

## 1️⃣ Criar Conta e Obter Credenciais de Teste

### Passo 1: Acesse o Painel de Desenvolvedores
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Faça login com sua conta Mercado Pago (ou crie uma conta gratuita)

### Passo 2: Criar uma Aplicação
1. Clique em **"Criar aplicação"**
2. Nome da aplicação: `Chama Eu - Desenvolvimento`
3. Selecione: **"Pagamentos online"**
4. Clique em **"Criar aplicação"**

### Passo 3: Obter Credenciais de TESTE
1. No menu lateral, clique em **"Credenciais"**
2. Selecione a aba **"Credenciais de teste"** (não Production!)
3. Você verá duas credenciais:
   - **Access Token** (começa com `APP_USR-...`)
   - **Public Key** (começa com `APP_USR-...`)
4. Copie ambas as credenciais

**⚠️ IMPORTANTE:** As credenciais de teste e produção agora têm o mesmo formato (`APP_USR-`).
Certifique-se de estar na aba **"Credenciais de teste"** para não usar credenciais de produção por engano!

---

## 2️⃣ Configurar no Projeto

### Passo 1: Editar arquivo .env
Abra o arquivo `backend/.env` e cole suas credenciais:

```bash
# Substitua pelos valores reais que você copiou da aba "Credenciais de teste"
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890-123456-abc123def456ghi789jkl012mno345-678901234
MERCADOPAGO_PUBLIC_KEY=APP_USR-abc12345-6789-0123-4567-890123456789
```

**💡 Dica:** As credenciais começam com `APP_USR-` tanto para teste quanto produção.
O que diferencia é a **aba de onde você copiou** no painel do Mercado Pago!

### Passo 2: Reiniciar o Backend
```bash
docker-compose restart backend
```

### Passo 3: Verificar se está funcionando
```bash
docker-compose logs backend | grep -i mercadopago
```

Se não houver erros, está tudo certo!

---

## 3️⃣ Cartões de Teste (Grátis - Sem Cobrança Real)

### ✅ Cartão para APROVAR pagamento
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25 (qualquer data futura)
Nome do titular: APRO
CPF: 12345678909
```

### ❌ Cartão para RECUSAR pagamento
```
Número: 5031 4332 1540 6351
Nome do titular: OXXO
Resto: igual ao cartão de aprovação
```

### ⏳ Cartão para ficar PENDENTE
```
Número: 5031 4332 1540 6351
Nome do titular: FUND
Resto: igual ao cartão de aprovação
```

**IMPORTANTE:** Nenhum desses cartões cobra dinheiro real! É tudo simulado.

### Mais cartões de teste:
https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

## 4️⃣ Testar Fluxo de Assinatura

### Teste Rápido:

1. **Cadastre um profissional:**
   - http://localhost:5173/register-pro
   - Preencha os dados
   - Você será redirecionado para `/subscription/setup`

2. **Clique em "Ir para Pagamento Seguro"**
   - Você será redirecionado para o checkout do Mercado Pago

3. **Preencha com o cartão de teste APROVADO:**
   - Número: `5031 4332 1540 6351`
   - Nome: `APRO`
   - CVV: `123`
   - Validade: `11/25`
   - CPF: `12345678909`

4. **Confirme o pagamento**
   - Você será redirecionado para `/subscription/callback`
   - Deve aparecer "Assinatura Ativada!"

5. **Verifique no Admin Dashboard:**
   - http://localhost:5173/admin
   - Login: admin@chamaeu.com / admin123
   - Aba "Assinaturas" → Deve aparecer uma assinatura ATIVA

---

## 5️⃣ Configurar Webhook (Para Receber Notificações)

### O que é?
O webhook é uma URL que o Mercado Pago usa para notificar seu sistema sobre mudanças de status (pagamento aprovado, cancelamento, etc.)

### Para Desenvolvimento Local (ngrok):

#### Passo 1: Instalar ngrok
```bash
# Ubuntu/Debian
sudo snap install ngrok

# Ou baixe em: https://ngrok.com/download
```

#### Passo 2: Expor o backend
```bash
ngrok http 8000
```

Você verá algo assim:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8000
```

#### Passo 3: Configurar no Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **"Webhooks"** no menu lateral
4. Clique em **"Configurar notificações"**
5. Cole a URL: `https://abc123.ngrok.io/subscriptions/webhook`
6. Selecione os eventos:
   - ✅ Assinaturas
   - ✅ Pagamentos
7. Salve

#### Passo 4: Testar
Quando você fizer um pagamento de teste, o Mercado Pago enviará uma notificação para seu webhook.

Verifique os logs:
```bash
docker-compose logs -f backend
```

Você deve ver algo como:
```
INFO: Webhook recebido: {'type': 'preapproval', 'data': {'id': '...'}}
INFO: Assinatura atualizada: 1 -> authorized
```

---

## 6️⃣ Valores de Teste

Com credenciais de teste, você pode usar qualquer valor sem ser cobrado:

### Opções:
```bash
# No arquivo backend/.env

# Opção 1: Valor baixo para testes
SUBSCRIPTION_AMOUNT=0.01

# Opção 2: R$ 1,00
SUBSCRIPTION_AMOUNT=1.00

# Opção 3: Valor real (ainda sem cobrar no modo teste)
SUBSCRIPTION_AMOUNT=50.00
```

**Nenhum valor será cobrado de verdade enquanto usar credenciais de TESTE!**

---

## 7️⃣ Quando Ir para Produção

### Quando estiver tudo funcionando:

1. **Obtenha credenciais de PRODUÇÃO:**
   - Painel de Desenvolvedores → Credenciais → **"Credenciais de produção"**
   - Copie o Access Token e Public Key de produção

2. **Atualize o .env:**
   ```bash
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-... (credencial de produção)
   MERCADOPAGO_PUBLIC_KEY=APP_USR-... (credencial de produção)
   SUBSCRIPTION_AMOUNT=50.00
   ```

3. **Configure webhook de produção:**
   - URL: `https://seu-dominio.com/subscriptions/webhook`

4. **⚠️ AGORA SIM OS PAGAMENTOS SERÃO REAIS!**

---

## ❓ Troubleshooting

### Erro: "Credenciais inválidas"
- Verifique se você copiou as credenciais corretas
- Certifique-se de ter copiado da aba **"Credenciais de teste"** (não produção!)
- As credenciais devem começar com `APP_USR-`
- Reinicie o backend após alterar o .env

### Erro: "Init point não gerado"
- Verifique se o Access Token está correto
- Veja os logs do backend: `docker-compose logs backend`

### Webhook não está recebendo notificações
- Certifique-se de que o ngrok está rodando
- Verifique se a URL do webhook está correta no painel do Mercado Pago
- Teste enviando uma notificação manual pelo painel

### Assinatura fica como "pending"
- Isso significa que o webhook não foi processado ainda
- Verifique se o webhook está configurado
- Aguarde alguns segundos (pode demorar até 30 segundos)

---

## 📚 Documentação Oficial

- **Guia de Assinaturas:** https://www.mercadopago.com.br/developers/pt/docs/subscriptions
- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
- **Webhooks:** https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration/subscription-payments-notification

---

## ✅ Checklist Final

Antes de testar, verifique:

- [ ] Credenciais de TESTE configuradas no `.env`
- [ ] Backend reiniciado após configurar `.env`
- [ ] Ngrok rodando (se testar webhook)
- [ ] Webhook configurado no painel do Mercado Pago
- [ ] Usar cartão de teste com nome "APRO"
- [ ] Admin criado com `./create_admin.sh`

---

## 🎉 Próximos Passos

Depois de testar e funcionar:

1. ✅ Implementar controle de acesso por assinatura ativa
2. ✅ Criar formulário de serviços para profissionais
3. ✅ Melhorar gestão de horários
4. ✅ Implementar notificações por email
5. ✅ Deploy em produção

---

**Dúvidas?** Entre em contato ou consulte a documentação oficial do Mercado Pago.
