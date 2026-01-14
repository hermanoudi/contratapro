# 🧪 Guia de Teste - Dashboard Administrativo

## ✅ Pré-requisitos

1. **Backend rodando:**
   ```bash
   docker-compose ps
   # Verificar se backend está "Up"
   ```

2. **Frontend rodando:**
   ```bash
   cd frontend
   npm run dev
   # Deve estar rodando em http://localhost:3000
   ```

---

## 📝 Passo a Passo para Testar

### **1. Criar um Usuário Administrador (se não existir)**

**Método Rápido (Recomendado):**

Execute o script automatizado na raiz do projeto:

```bash
./create_admin.sh
```

O script irá:
- ✅ Verificar se o Docker está rodando
- ✅ Iniciar os containers se necessário
- ✅ Criar o usuário admin com credenciais padrão
- ✅ Verificar se já existe e atualizar se necessário

**Credenciais criadas:**
- Email: `admin@chamaeu.com`
- Senha: `admin123`

**Personalizar credenciais (opcional):**

```bash
./create_admin.sh "meuemail@empresa.com" "minhasenha" "Meu Nome"
```

---

**Método Manual (alternativo):**

Se preferir criar manualmente ou o script não funcionar:

```bash
docker-compose exec backend python3 -c "
import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from app.auth_utils import get_password_hash
from sqlalchemy import select

async def create_admin():
    async with AsyncSessionLocal() as db:
        admin = User(
            name='Administrador',
            email='admin@chamaeu.com',
            hashed_password=get_password_hash('admin123'),
            is_admin=True,
            is_professional=False
        )
        db.add(admin)
        await db.commit()
        print('Admin criado!')

asyncio.run(create_admin())
"
```

---

### **2. Acessar o Dashboard Administrativo**

1. **Abra o navegador:** http://localhost:3000

2. **Faça login:**
   - Email: `admin@chamaeu.com`
   - Senha: `admin123`

3. **Você será redirecionado automaticamente para:** `/admin`

---

### **3. Verificar as Novas Métricas**

Ao abrir o dashboard, você deve ver:

#### **Topo da Página - Métricas Principais (5 cards):**

✅ **Total de Clientes**
- Mostra o número de clientes cadastrados

✅ **Total de Profissionais**
- Mostra o número de profissionais cadastrados

✅ **Profissionais Ativos**
- Mostra profissionais com assinatura ativa

✅ **Agendamentos (Mês)**
- Mostra agendamentos do mês atual

✅ **🆕 Último Agendamento**
- **NOVA MÉTRICA**
- Mostra a data e hora do último agendamento
- Se não houver agendamentos, mostra "-"

---

#### **Seção: Faturamento da Plataforma (4 cards):**

✅ **🆕 Faturamento Diário**
- **NOVA MÉTRICA**
- Cálculo: `Profissionais Ativos × (R$ 50 ÷ 30)`
- Exemplo: 10 ativos = R$ 16,67/dia

✅ **🆕 Faturamento Semanal**
- **NOVA MÉTRICA**
- Cálculo: `Profissionais Ativos × (R$ 50 ÷ 4,33)`
- Exemplo: 10 ativos = R$ 115,47/semana

✅ **Faturamento Mensal**
- Cálculo: `Profissionais Ativos × R$ 50`
- Exemplo: 10 ativos = R$ 500,00/mês

✅ **Projeção Anual**
- Cálculo: `Faturamento Mensal × 12`
- Exemplo: 10 ativos = R$ 6.000,00/ano

---

#### **Seção: Métricas de Assinatura (3 cards):**

✅ **Total de Assinantes**
- Número de profissionais com assinatura ativa

✅ **🆕 Novos Assinantes (Mês)**
- **NOVA MÉTRICA**
- Assinaturas criadas neste mês
- Ajuda a medir crescimento

✅ **🆕 Cancelamentos (Mês)**
- **NOVA MÉTRICA**
- Assinaturas canceladas neste mês
- Importante para taxa de churn

---

### **4. Testar Cálculos Manualmente**

Para verificar se os cálculos estão corretos:

1. **Anote o número de "Profissionais Ativos":** _______

2. **Calcule manualmente:**
   - Faturamento Mensal = Ativos × 50
   - Faturamento Diário = Mensal ÷ 30
   - Faturamento Semanal = Mensal ÷ 4.33
   - Projeção Anual = Mensal × 12

3. **Compare com os valores no dashboard**

**Exemplo:**
Se houver **5 profissionais ativos**:
- Mensal: 5 × 50 = **R$ 250,00** ✓
- Diário: 250 ÷ 30 = **R$ 8,33** ✓
- Semanal: 250 ÷ 4.33 = **R$ 57,74** ✓
- Anual: 250 × 12 = **R$ 3.000,00** ✓

---

### **5. Testar Novos Assinantes**

Para verificar se "Novos Assinantes (Mês)" está funcionando:

1. **Registre um novo profissional:**
   - Vá para: http://localhost:3000/register-professional
   - Preencha os dados e crie a conta

2. **Crie uma assinatura (via Mercado Pago ou manualmente no banco)**

3. **Volte ao dashboard admin**

4. **Verifique se "Novos Assinantes (Mês)" incrementou**

---

### **6. Testar Cancelamentos**

Para verificar se "Cancelamentos (Mês)" está funcionando:

1. **No dashboard admin, vá para a aba "Profissionais"**

2. **Clique em "Suspender" em algum profissional ativo**

3. **Ou execute no banco de dados:**
   ```sql
   UPDATE subscriptions
   SET status = 'cancelled',
       cancelled_at = NOW()
   WHERE id = 1;
   ```

4. **Volte ao dashboard admin**

5. **Verifique se "Cancelamentos (Mês)" incrementou**

---

### **7. Testar Último Agendamento**

Para verificar se "Último Agendamento" está funcionando:

1. **Como cliente, faça um agendamento:**
   - Faça login como cliente
   - Vá para página de agendamento
   - Complete um agendamento

2. **Volte ao dashboard admin**

3. **Verifique se "Último Agendamento" mostra a data/hora corretos**

---

## 🔍 Verificação Visual

### **Layout Esperado:**

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard Administrativo                    [User Info] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Clientes] [Profiss.] [Ativos] [Agend.] [🆕 Último]  │
│                                                          │
│  💰 Faturamento da Plataforma                           │
│  [🆕 Diário] [🆕 Semanal] [Mensal] [Anual]             │
│                                                          │
│  📊 Métricas de Assinatura                              │
│  [Total] [🆕 Novos Mês] [🆕 Cancelamentos]             │
│                                                          │
│  Status das Assinaturas                                 │
│  [Ativos] [Inativos] [Cancelados] [Suspensos]          │
│                                                          │
│  🗺️ Profissionais por Estado                           │
│  [Grid de Estados]                                      │
│                                                          │
│  👥 Profissionais Recentes                              │
│  [Tabela]                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Cores Esperadas

- **🟢 Verde:** Faturamento Diário, Total de Assinantes
- **🔵 Azul:** Agendamentos, Faturamento Semanal, Novos Assinantes
- **🟣 Roxo:** Faturamento Mensal
- **🟠 Laranja:** Último Agendamento, Projeção Anual
- **🔴 Vermelho:** Cancelamentos

---

## 📊 Teste com Console do Navegador

Abra o Console (F12) e execute:

```javascript
// Ver dados retornados do backend
fetch('/admin/dashboard', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Dados do Dashboard:', data);

  // Verificar novas métricas
  console.log('🆕 Novos Assinantes:', data.summary.new_subscribers_this_month);
  console.log('🆕 Cancelamentos:', data.summary.cancellations_this_month);
  console.log('🆕 Último Agendamento:', data.last_appointment);
  console.log('🆕 Faturamento Diário:', data.revenue.daily);
  console.log('🆕 Faturamento Semanal:', data.revenue.weekly);
});
```

---

## ✅ Checklist de Testes

- [ ] Backend está rodando (`docker-compose ps`)
- [ ] Frontend está rodando (`npm run dev`)
- [ ] Consegui fazer login como admin
- [ ] Dashboard carrega sem erros
- [ ] Vejo o card "Último Agendamento"
- [ ] Vejo a seção "Faturamento da Plataforma"
- [ ] Vejo "Faturamento Diário"
- [ ] Vejo "Faturamento Semanal"
- [ ] Vejo a seção "Métricas de Assinatura"
- [ ] Vejo "Novos Assinantes (Mês)"
- [ ] Vejo "Cancelamentos (Mês)"
- [ ] Os valores de faturamento batem com o cálculo manual
- [ ] As cores dos cards estão corretas
- [ ] Não há erros no console do navegador
- [ ] Não há erros nos logs do backend

---

## 🐛 Troubleshooting

### **Problema:** Dashboard não carrega

**Solução:**
```bash
# Reiniciar containers
docker-compose restart backend
```

### **Problema:** Valores zerados

**Causa:** Não há dados no banco

**Solução:**
1. Cadastre profissionais
2. Ative assinaturas
3. Crie agendamentos
4. Recarregue o dashboard

### **Problema:** Erro 403 (Forbidden)

**Causa:** Usuário não é admin

**Solução:**
```sql
UPDATE users SET is_admin = true WHERE email = 'seu@email.com';
```

### **Problema:** "Último Agendamento" mostra "-"

**Causa:** Não há agendamentos confirmados

**Solução:**
1. Faça um agendamento como cliente
2. Verifique que o status seja "scheduled"
3. Recarregue o dashboard

---

## 📸 Screenshots Esperados

Tire screenshots e compare:

1. **Topo do Dashboard:** 5 cards visíveis
2. **Seção de Faturamento:** 4 cards com valores em R$
3. **Seção de Assinaturas:** 3 cards incluindo novos e cancelamentos

---

## 🎯 Teste Final

Se todos os itens abaixo estiverem corretos, a implementação está funcionando:

✅ Login como admin funciona
✅ Dashboard carrega
✅ 8 novas métricas aparecem:
   - Último Agendamento (data/hora)
   - Faturamento Diário (R$)
   - Faturamento Semanal (R$)
   - Novos Assinantes (número)
   - Cancelamentos (número)
   - Total de Assinantes visível
   - Faturamento Mensal visível
   - Projeção Anual visível
✅ Cálculos estão corretos
✅ Cores estão aplicadas
✅ Não há erros no console

---

**Sucesso! 🎉** O dashboard administrativo aprimorado está funcionando corretamente!
