# 🚀 Guia de Teste em Produção - Mercado Pago

## ⚠️ ATENÇÃO
Este teste usará **credenciais de PRODUÇÃO** e processará um **pagamento real de R$ 1,00**.

---

## 📋 PASSO 1: Obter Credenciais de Produção

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Clique na aba **"Credenciais"**
4. Selecione **"Credenciais de produção"**
5. Copie:
   - **Access Token** (formato: `APP_USR-XXXXXXXX-XXXXXX-...`)
   - **Public Key** (formato: `APP_USR-XXXXXXXX-XXXX-...`)

---

## 📝 PASSO 2: Atualizar Credenciais

### Backend (`backend/.env`)
```bash
MERCADOPAGO_ACCESS_TOKEN=COLE_SEU_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=COLE_SUA_PUBLIC_KEY_AQUI
```

### Frontend (`frontend/.env`)
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=COLE_A_MESMA_PUBLIC_KEY_AQUI
```

---

## 🔄 PASSO 3: Reiniciar Serviços

```bash
# Reiniciar backend
docker-compose restart backend

# Reiniciar frontend (se estiver rodando)
# Ctrl+C e depois npm run dev novamente
```

---

## 🧪 PASSO 4: Executar o Teste

### 4.1 Criar/Logar com Profissional
1. Acesse: https://vaguely-semifinished-mathilda.ngrok-free.dev
2. Registre um novo profissional OU faça login com um existente
3. Você será redirecionado para `/subscription/setup`

### 4.2 Iniciar Assinatura
1. Clique em **"Ir para Pagamento Seguro"**
2. Você será redirecionado para o checkout do Mercado Pago
3. Valor mostrado: **R$ 1,00/mês**

### 4.3 Preencher Dados de Pagamento
Use seu **cartão real**:
- Número do cartão
- Nome (como está no cartão)
- Validade
- CVV
- CPF do titular

### 4.4 Confirmar Pagamento
1. Clique em **"Pagar assinatura"**
2. O botão DEVE estar habilitado (diferente do ambiente de teste)
3. Aguarde confirmação

### 4.5 Verificar Sucesso
- Você será redirecionado para `/subscription/callback?status=success`
- A assinatura deve aparecer como "active" no banco de dados
- O profissional deve estar habilitado para receber solicitações

---

## 🔍 PASSO 5: Verificar no Painel do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/activities
2. Você deve ver:
   - Um pagamento de R$ 1,00 processado
   - Status: Aprovado
   - Tipo: Assinatura

---

## ❌ PASSO 6: Cancelar Assinatura de Teste

### Via Dashboard do Profissional (quando implementado)
```
/dashboard → Assinatura → Cancelar
```

### Via API (manualmente)
```bash
# Obter token de autenticação
TOKEN="seu_token_jwt_aqui"

# Cancelar assinatura
curl -X POST http://localhost:8000/subscriptions/cancel \
  -H "Authorization: Bearer $TOKEN"
```

### Via Mercado Pago
1. Acesse: https://www.mercadopago.com.br/subscriptions
2. Encontre a assinatura
3. Clique em "Cancelar"

---

## 📊 PASSO 7: Verificar Logs

### Backend
```bash
docker-compose logs -f backend
```

Procure por:
- `Plano criado: XXXX`
- `Assinatura criada: XXXX, status: authorized`
- Logs do webhook (se configurado)

### Banco de Dados
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM users WHERE id = <professional_id>;
```

---

## ✅ Critérios de Sucesso

- [ ] Plano criado com sucesso no Mercado Pago
- [ ] Redirecionamento para checkout funcionou
- [ ] Botão "Pagar assinatura" estava **habilitado**
- [ ] Pagamento foi processado
- [ ] Valor correto cobrado (R$ 1,00)
- [ ] Assinatura salva no banco com status "active"
- [ ] Usuário atualizado com `subscription_status = "active"`
- [ ] Redirecionamento para página de sucesso funcionou

---

## 🐛 Troubleshooting

### Botão ainda desabilitado?
- Verifique se realmente está usando credenciais de PRODUÇÃO
- Limpe cache do navegador
- Tente em modo anônimo
- Verifique se o valor está correto (≥ R$ 0.50)

### Erro ao criar plano?
- Verifique logs do backend: `docker-compose logs backend`
- Confirme que o Access Token está correto
- Verifique se a aplicação está ativa no painel do Mercado Pago

### Pagamento rejeitado?
- Verifique se há saldo/limite no cartão
- Confirme que os dados estão corretos
- Tente outro cartão

---

## 🔐 Segurança

### ⚠️ IMPORTANTE
- Nunca commite o arquivo `.env` com credenciais reais
- Depois do teste, você pode voltar para credenciais de teste
- Mantenha as credenciais de produção em segredo

### Após o Teste
Para voltar ao modo de teste:
1. Substitua as credenciais por credenciais de teste
2. Reinicie o backend
3. O ambiente voltará ao modo sandbox

---

## 💰 Custo do Teste

- **Valor cobrado**: R$ 1,00
- **Taxa Mercado Pago**: ~R$ 0,07 (aproximadamente)
- **Você receberá**: ~R$ 0,93

Após cancelar a assinatura, não haverá novas cobranças.

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Consulte a documentação: https://www.mercadopago.com.br/developers/pt/docs/subscriptions
3. Entre em contato com suporte do Mercado Pago

---

**Data de criação**: 2025-12-27
**Valor do teste**: R$ 1,00
**Ambiente**: Produção
