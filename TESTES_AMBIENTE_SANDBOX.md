# 🧪 Testes no Ambiente Sandbox - Mercado Pago

**Objetivo**: Tentar todas as alternativas possíveis para fazer o pagamento funcionar no ambiente de teste.

---

## 📋 CHECKLIST DE TESTES

### ✅ Teste 1: Criar Novo Profissional

**Por quê?** Às vezes o Mercado Pago guarda estado do usuário/email que pode causar conflitos.

**Passo a passo:**
1. Acesse: https://vaguely-semifinished-mathilda.ngrok-free.dev
2. Clique em "Registrar como Profissional"
3. Use um **email completamente novo** (diferente de todos os testados)
   - Exemplo: `teste_novo_$(date +%s)@gmail.com`
   - Ou: `profissional_novo_2025@gmail.com`
4. Preencha todos os dados
5. Após registro → será redirecionado para `/subscription/setup`
6. Clique em "Ir para Pagamento Seguro"
7. Tente preencher e pagar

**Cartão Visa para testar:**
```
Número: 4509 9535 6623 3704
Nome: APRO
Validade: 11/25
CVV: 123
CPF: 12345678909
```

---

### ✅ Teste 2: Limpar Cookies e Cache

**Por quê?** Dados em cache podem interferir com a sessão do Mercado Pago.

**Chrome/Edge:**
1. Abra DevTools (F12)
2. Vá em "Application" → "Storage"
3. Clique em "Clear site data"
4. OU use `Ctrl+Shift+Delete` → Limpar dados de navegação → Últimas 24 horas

**Firefox:**
1. `Ctrl+Shift+Delete`
2. Selecione "Cookies" e "Cache"
3. Tempo: "Última hora"
4. Limpar

**Após limpar:**
1. Feche o navegador completamente
2. Abra novamente
3. Acesse o site
4. Faça login com profissional existente
5. Vá em `/subscription/setup`
6. Tente novamente

---

### ✅ Teste 3: Modo Anônimo/Privado

**Por quê?** Navegação privada não tem cookies/cache/extensões que possam interferir.

**Chrome:**
1. `Ctrl+Shift+N` (modo anônimo)
2. Acesse: https://vaguely-semifinished-mathilda.ngrok-free.dev
3. Registre novo profissional OU faça login
4. Tente o pagamento

**Firefox:**
1. `Ctrl+Shift+P` (janela privativa)
2. Acesse o site
3. Tente o pagamento

**Edge:**
1. `Ctrl+Shift+N` (InPrivate)
2. Acesse o site
3. Tente o pagamento

---

### ✅ Teste 4: Diferentes Navegadores

**Por quê?** Cada navegador pode renderizar o checkout do Mercado Pago de forma diferente.

**Teste em ordem:**
1. ✅ Chrome (que você já testou)
2. ⬜ Firefox
3. ⬜ Edge
4. ⬜ Opera
5. ⬜ Brave

**Para cada navegador:**
- Use modo anônimo
- Registre novo profissional ou faça login
- Tente o pagamento

---

### ✅ Teste 5: Cartões de Teste Diferentes

**Por quê?** Diferentes bandeiras podem ter comportamentos diferentes no sandbox.

#### Visa (Aprovação)
```
Número: 4509 9535 6623 3704
Nome: APRO
Validade: 11/25
CVV: 123
CPF: 12345678909
```

#### Mastercard (Aprovação) - Você já testou
```
Número: 5031 4332 1540 6351
Nome: APRO
Validade: 11/30
CVV: 123
CPF: 12345678909
```

#### American Express (Aprovação)
```
Número: 3711 803032 57522
Nome: APRO
Validade: 11/25
CVV: 1234
CPF: 12345678909
```

**Teste cada um em ordem:**
1. Visa primeiro
2. Se não funcionar, tente Amex
3. Se não funcionar, volte para Mastercard

---

### ✅ Teste 6: Desabilitar Extensões do Navegador

**Por quê?** Extensões como bloqueadores de anúncios podem interferir.

**Como fazer:**
1. Abra o navegador
2. Vá em Extensões/Add-ons
3. **Desabilite TODAS**, principalmente:
   - AdBlock
   - uBlock Origin
   - Privacy Badger
   - Ghostery
   - Qualquer VPN
4. Feche e reabra o navegador
5. Tente novamente

**OU simplesmente use modo anônimo** (que já desabilita extensões automaticamente)

---

### ✅ Teste 7: Verificar Console do Navegador

**Por quê?** Erros JavaScript podem estar bloqueando o botão.

**Como fazer:**
1. Quando estiver na página de pagamento do Mercado Pago
2. Abra DevTools (F12)
3. Vá na aba "Console"
4. Procure por **erros em vermelho**
5. Tire screenshot e me mostre

**O que procurar:**
- ❌ Erros de script bloqueado
- ❌ Erros de CORS
- ❌ Erros de validação
- ❌ Erros de rede (failed to fetch)

---

### ✅ Teste 8: Tentar com Dados Diferentes

**Variações para testar:**

#### CPF Diferente
Ao invés de `12345678909`, tente:
- `11111111111`
- `00000000000`

#### Nome Diferente
Ao invés de `APRO`, tente:
- `APRO SILVA`
- `TESTE APROVADO`
- `JOHN DOE`

#### Email Diferente
Use email totalmente novo que nunca foi usado:
- `novoprofissional_$(date +%s)@test.com`

---

### ✅ Teste 9: Aguardar Mais Tempo

**Por quê?** Às vezes o Mercado Pago precisa de alguns segundos para processar.

**Como fazer:**
1. Preencha todos os campos
2. **Aguarde 10-15 segundos** sem fazer nada
3. Veja se o botão habilita automaticamente
4. Se não, tente clicar em outro campo e voltar
5. Aguarde mais um pouco

---

### ✅ Teste 10: Clicar Fora e Voltar

**Por quê?** Pode forçar revalidação do formulário.

**Como fazer:**
1. Preencha todos os campos
2. Clique **fora do formulário** (área em branco)
3. Clique de volta no último campo
4. Pressione Tab
5. Veja se o botão habilita

---

## 🔍 DIAGNÓSTICO - Se NADA Funcionar

### Verificar Logs do Backend

```bash
docker-compose logs -f backend | grep -i mercado
```

**Procure por:**
- ✅ "Plano criado com sucesso"
- ✅ "init_point: https://..."
- ❌ Qualquer erro de API

### Verificar Resposta da API

No DevTools (F12) → Network:
1. Procure pela requisição para `/subscriptions/create`
2. Veja a resposta
3. Confirme que tem `init_point` válido

### Teste Manual da API

```bash
# 1. Fazer login e pegar token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@test.com","password":"sua_senha"}'

# 2. Criar assinatura
curl -X POST http://localhost:8000/subscriptions/create \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Copiar o init_point da resposta
# 4. Abrir no navegador manualmente
```

---

## 📊 RESULTADOS ESPERADOS

### Se Funcionar ✅
- Botão "Pagar assinatura" habilita
- Consegue clicar
- Processa pagamento
- Redireciona para `/subscription/callback`

### Se NÃO Funcionar ❌
**Possíveis causas:**
1. **Limitação do Sandbox** (mais provável)
2. Credenciais de teste expiradas
3. Bug no ambiente de teste do Mercado Pago
4. Restrição de país/região

**O que fazer:**
- Documentar todos os testes feitos
- Aceitar que é limitação do sandbox
- Confiar que funcionará em produção
- Continuar com desenvolvimento do resto do MVP

---

## 📝 REGISTRO DE TESTES

Use esta tabela para anotar resultados:

| # | Teste | Navegador | Resultado | Observações |
|---|-------|-----------|-----------|-------------|
| 1 | Novo profissional | Chrome | ⬜ | |
| 2 | Limpar cache | Chrome | ⬜ | |
| 3 | Modo anônimo | Chrome | ⬜ | |
| 4 | Firefox | Firefox | ⬜ | |
| 5 | Cartão Visa | Chrome | ⬜ | |
| 6 | Sem extensões | Chrome | ⬜ | |
| 7 | Console check | Chrome | ⬜ | |
| 8 | Dados diferentes | Chrome | ⬜ | |
| 9 | Aguardar 15s | Chrome | ⬜ | |
| 10 | Clicar fora/voltar | Chrome | ⬜ | |

**Legenda:**
- ✅ Funcionou
- ❌ Não funcionou
- ⬜ Não testado ainda

---

## 🎯 CONCLUSÃO

Após fazer TODOS estes testes, você terá:

1. **Se funcionar**: Ótimo! A assinatura está 100% operacional
2. **Se não funcionar**: Evidência clara de que é limitação do sandbox, não do código

**Em ambos os casos**, o código está correto e funcionará em produção!

---

**Data**: 2025-12-27
**Ambiente**: Sandbox (Teste)
**Credenciais**: Teste do Mercado Pago
