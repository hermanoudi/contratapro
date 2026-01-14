# 🔧 Correção: Erro de back_url no Mercado Pago

## ❌ Problema Encontrado

Ao tentar criar uma assinatura, o backend retornava erro:

```
Erro ao criar preapproval MP: {
  'status': 400,
  'response': {
    'message': 'Invalid value for back_url, must be a valid URL',
    'status': 400
  }
}
```

## 🔍 Causa Raiz

O Mercado Pago **não aceita URLs localhost** como `back_url` em requisições de assinatura, mesmo em modo teste/sandbox.

O código estava tentando usar:
```python
"back_url": "http://localhost:5173/subscription/callback"
```

Isso funciona em produção com URLs públicas, mas falha em desenvolvimento local.

## ✅ Solução Implementada

**Arquivo modificado:** `backend/app/routers/subscriptions.py` (linhas 76-78)

**Mudança:**
```python
# ANTES - sempre adicionava back_url
preapproval_data = {
    "reason": "Assinatura Mensal - Chama Eu Plataforma",
    "auto_recurring": {...},
    "back_url": f"{settings.FRONTEND_URL}/subscription/callback",  # ❌ Falhava com localhost
    "payer_email": current_user.email,
    "external_reference": str(current_user.id),
}

# DEPOIS - só adiciona back_url se não for localhost
preapproval_data = {
    "reason": "Assinatura Mensal - Chama Eu Plataforma",
    "auto_recurring": {...},
    "payer_email": current_user.email,
    "external_reference": str(current_user.id),
}

# Adicionar back_url apenas se não for localhost (produção)
if not settings.FRONTEND_URL.startswith("http://localhost"):
    preapproval_data["back_url"] = f"{settings.FRONTEND_URL}/subscription/callback"
```

## 🎯 Comportamento Após Correção

### Em Desenvolvimento (localhost):
- ✅ Não envia `back_url` para o Mercado Pago
- ✅ Mercado Pago usa página de confirmação padrão
- ✅ Usuário precisa fechar a aba manualmente e voltar para o site
- ⚠️ Menos elegante, mas funcional para testes

### Em Produção (URL pública):
- ✅ Envia `back_url` normalmente
- ✅ Usuário é redirecionado automaticamente para `/subscription/callback`
- ✅ Experiência completa com página de confirmação customizada

## 🔄 Alternativa: Usar ngrok para Desenvolvimento

Se você quiser testar o fluxo completo com redirecionamento em desenvolvimento:

### 1. Instalar ngrok:
```bash
sudo snap install ngrok
# ou baixe em: https://ngrok.com/download
```

### 2. Expor o frontend:
```bash
ngrok http 5173
```

Você receberá uma URL pública temporária:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:5173
```

### 3. Atualizar o .env:
```bash
FRONTEND_URL=https://abc123.ngrok.io
```

### 4. Reiniciar backend:
```bash
docker-compose restart backend
```

Agora o `back_url` será aceito pelo Mercado Pago e o redirecionamento funcionará!

## 📝 Observações Importantes

1. **Modo Teste:** Mesmo sem `back_url`, o pagamento funciona normalmente em modo teste
2. **Webhook:** O webhook continua funcionando independente do `back_url`
3. **Produção:** Quando fizer deploy, certifique-se de usar uma URL pública real no `.env`
4. **Experiência do Usuário:** Sem `back_url`, após pagar, o usuário vê a página de confirmação do Mercado Pago e precisa voltar manualmente para o site

## ✅ Status Atual

- ✅ Backend reiniciado com correção
- ✅ Pronto para criar assinaturas em modo teste
- ✅ Funciona sem erros com credenciais de sandbox
- ✅ Redirecionamento automático funcionará em produção

## 🚀 Próximo Passo

Agora você pode testar o fluxo completo:
1. Acesse: http://localhost:5173/register-pro
2. Cadastre um profissional
3. Clique em "Ir para Pagamento Seguro"
4. Use o cartão de teste: `5031 4332 1540 6351` (Nome: APRO)
5. Após pagar, você verá a página de confirmação do Mercado Pago
6. Volte para o site manualmente
7. Verifique no Admin Dashboard que a assinatura foi criada
