# 📊 Guia de Uso - Dashboard Administrativo Aprimorado

## 🎯 Como Acessar o Dashboard Admin

### 1. **Fazer Login como Administrador**
   - Acesse: `http://localhost:3000/login`
   - Use suas credenciais de administrador
   - Será redirecionado automaticamente para `/admin`

### 2. **Navegação no Dashboard**
   O dashboard possui 3 abas principais:
   - **Visão Geral** (Overview) - Métricas e estatísticas gerais
   - **Profissionais** - Lista e gerenciamento de profissionais
   - **Clientes** - Lista de clientes cadastrados

---

## ✨ Novas Funcionalidades Implementadas

### 📈 **Seção: Métricas Principais** (Topo da Página)

**5 Cards de Estatísticas:**

1. **Total de Clientes**
   - Número total de clientes cadastrados na plataforma
   - Inclui apenas usuários não-profissionais e não-admin

2. **Total de Profissionais**
   - Número total de profissionais cadastrados
   - Independente do status da assinatura

3. **Profissionais Ativos**
   - Profissionais com assinatura ativa (status: 'active')
   - Estes são os que geram receita

4. **Agendamentos (Mês)**
   - Total de agendamentos no mês atual
   - Baseado na data do agendamento

5. **🆕 Último Agendamento**
   - Data e horário do último agendamento realizado na plataforma
   - Exibe apenas agendamentos confirmados (exclui bloqueios manuais)
   - Mostra "-" se não houver agendamentos

---

### 💰 **Seção: Faturamento da Plataforma** (NOVA)

**4 Cards de Faturamento:**

1. **🆕 Faturamento Diário**
   - **Cálculo:** `Profissionais Ativos × (R$ 50,00 ÷ 30 dias)`
   - Média de receita por dia
   - Exemplo: 10 profissionais ativos = R$ 16,67/dia

2. **🆕 Faturamento Semanal**
   - **Cálculo:** `Profissionais Ativos × (R$ 50,00 ÷ 4,33 semanas)`
   - Média de receita por semana
   - Exemplo: 10 profissionais ativos = R$ 115,47/semana

3. **Faturamento Mensal**
   - **Cálculo:** `Profissionais Ativos × R$ 50,00`
   - Receita mensal recorrente (MRR)
   - Exemplo: 10 profissionais ativos = R$ 500,00/mês

4. **Projeção Anual**
   - **Cálculo:** `Faturamento Mensal × 12`
   - Receita anual projetada (ARR)
   - Exemplo: 10 profissionais ativos = R$ 6.000,00/ano

---

### 📊 **Seção: Métricas de Assinatura** (NOVA)

**3 Cards de Assinaturas:**

1. **Total de Assinantes**
   - Número atual de profissionais com assinatura ativa
   - Mesmo valor que "Profissionais Ativos"

2. **🆕 Novos Assinantes (Mês)**
   - Assinaturas criadas no mês atual
   - **Cálculo:** Conta registros na tabela `Subscription` onde `created_at` está no mês atual
   - Ajuda a medir crescimento mensal

3. **🆕 Cancelamentos (Mês)**
   - Assinaturas canceladas no mês atual
   - **Cálculo:** Conta registros onde `status = 'cancelled'` e `cancelled_at` está no mês atual
   - Métrica importante para taxa de churn

---

### 📑 **Seções Existentes (Mantidas)**

4. **Status das Assinaturas**
   - Distribuição por status: Ativos, Inativos, Cancelados, Suspensos

5. **Profissionais por Estado**
   - Visualização geográfica dos profissionais
   - Mostra total e ativos por estado

6. **Profissionais Recentes**
   - Últimos 10 profissionais cadastrados
   - Detalhes: Nome, E-mail, Categoria, Localização, Status

---

## 🎨 Design e Cores

Cada métrica possui cores temáticas para fácil identificação:

- 🟢 **Verde** - Métricas positivas (ativos, faturamento diário)
- 🔵 **Azul** - Métricas de movimentação (agendamentos, semanal, novos)
- 🟣 **Roxo** - Métricas de crescimento (mensal, anual)
- 🟠 **Laranja** - Métricas de atenção (último agendamento, projeção)
- 🔴 **Vermelho** - Métricas críticas (cancelamentos)

---

## 📐 Fórmulas de Cálculo

### **Faturamento:**
```
Diário = Profissionais Ativos × (50 ÷ 30)
Semanal = Profissionais Ativos × (50 ÷ 4.33)
Mensal = Profissionais Ativos × 50
Anual = Mensal × 12
```

### **Assinaturas:**
```
Novos Assinantes (Mês) = COUNT(Subscription WHERE created_at NO MÊS ATUAL)
Cancelamentos (Mês) = COUNT(Subscription WHERE status='cancelled' AND cancelled_at NO MÊS ATUAL)
```

### **Último Agendamento:**
```
SELECT * FROM appointments
WHERE status = 'scheduled'
  AND is_manual_block = false
ORDER BY created_at DESC
LIMIT 1
```

---

## 🔍 Como Interpretar as Métricas

### **Crescimento Saudável:**
- ✅ Novos Assinantes > Cancelamentos
- ✅ Faturamento Mensal em crescimento
- ✅ Profissionais Ativos aumentando

### **Sinais de Alerta:**
- ⚠️ Cancelamentos > Novos Assinantes (churn alto)
- ⚠️ Poucos agendamentos no mês (baixo engajamento)
- ⚠️ Último agendamento muito antigo (plataforma inativa)

### **KPIs Importantes:**
- **MRR (Monthly Recurring Revenue):** Faturamento Mensal
- **ARR (Annual Recurring Revenue):** Projeção Anual
- **Churn Rate:** Cancelamentos ÷ Total de Assinantes
- **Growth Rate:** Novos Assinantes ÷ Total de Assinantes

---

## 🧪 Testando as Novas Funcionalidades

### **Teste 1: Verificar Novos Assinantes**
1. Registre um novo profissional
2. Crie uma assinatura para ele no mês atual
3. Acesse o dashboard admin
4. Verifique se "Novos Assinantes (Mês)" incrementou

### **Teste 2: Verificar Cancelamentos**
1. Cancele uma assinatura existente
2. Acesse o dashboard admin
3. Verifique se "Cancelamentos (Mês)" incrementou

### **Teste 3: Verificar Último Agendamento**
1. Crie um novo agendamento como cliente
2. Acesse o dashboard admin
3. Verifique se "Último Agendamento" mostra a data/hora corretos

### **Teste 4: Verificar Faturamento**
1. Note o número de "Profissionais Ativos"
2. Calcule manualmente: Ativos × R$ 50
3. Compare com "Faturamento Mensal"
4. Verifique se diário = mensal ÷ 30
5. Verifique se semanal = mensal ÷ 4.33

---

## 🎯 Exemplo Prático

### **Cenário:** Plataforma com 25 profissionais ativos

**Métricas Esperadas:**

| Métrica | Valor | Cálculo |
|---------|-------|---------|
| Faturamento Diário | R$ 41,67 | 25 × (50 ÷ 30) |
| Faturamento Semanal | R$ 288,68 | 25 × (50 ÷ 4.33) |
| Faturamento Mensal | R$ 1.250,00 | 25 × 50 |
| Projeção Anual | R$ 15.000,00 | 1.250 × 12 |

**Se este mês:**
- 5 novos profissionais assinaram
- 2 profissionais cancelaram

**Taxa de Crescimento:** +12% (3 net new / 25 base)
**Churn Rate:** 8% (2 cancelamentos / 25 base)

---

## 🚀 Próximos Passos Sugeridos

### **Melhorias Futuras:**
1. **Gráficos de Tendência**
   - Gráfico de linha mostrando faturamento dos últimos 6 meses
   - Gráfico de barras de novos assinantes vs cancelamentos

2. **Alertas Automáticos**
   - Email quando churn > 10%
   - Notificação quando não há agendamentos há 7+ dias

3. **Exportação de Dados**
   - Botão para exportar relatório em PDF/Excel
   - Incluir todas as métricas do mês

4. **Filtros de Período**
   - Visualizar métricas de meses anteriores
   - Comparar mês atual vs mês anterior

5. **Métricas por Categoria**
   - Faturamento segmentado por categoria de profissional
   - Top 5 categorias com mais agendamentos

---

## 📞 Suporte

Para dúvidas ou problemas com o dashboard:
- Verifique os logs do backend: `docker-compose logs backend`
- Verifique o console do navegador para erros de frontend
- Certifique-se que está logado como administrador

---

**Última Atualização:** 27/12/2024
**Versão:** 2.0 (Dashboard Aprimorado)
