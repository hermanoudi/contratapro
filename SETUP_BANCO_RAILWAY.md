# 🗄️ Setup Completo do Banco de Dados Railway

Guia passo a passo para criar tabelas e popular o banco de produção.

---

## 📋 O Que Faremos

1. ✅ Criar todas as tabelas do banco de dados
2. ✅ Popular com as 33 categorias de serviços
3. ✅ (Opcional) Criar planos de assinatura padrão

---

## 🚀 Método 1: Deploy Automático (RECOMENDADO)

Com as alterações que fizemos no `main.py`, as tabelas serão criadas **automaticamente** no próximo deploy!

### Passo 1: Commit e Push

```bash
cd /home/hermano/projetos/faz_de_tudo

git add backend/app/main.py backend/create_tables.py
git commit -m "feat: criar tabelas automaticamente na inicialização"
git push origin main
```

### Passo 2: Aguardar Deploy no Railway

1. Acesse o Railway Dashboard
2. Vá no serviço **Backend**
3. Aguarde o deploy terminar
4. Verifique os logs - você deve ver:

```
🚀 Iniciando aplicação...
📊 Criando tabelas do banco de dados...
✅ Tabelas criadas com sucesso!
```

### Passo 3: Verificar Tabelas Criadas

1. No Railway, clique em **Postgres**
2. Vá em **Database** → **Data**
3. Você deve ver as tabelas:
   - `users`
   - `subscription_plans`
   - `categories`
   - `services`
   - `working_hours`
   - `appointments`

### Passo 4: Popular com Categorias

Após as tabelas serem criadas, execute os seeds:

#### Opção A: Via Railway Shell
```bash
# No Railway Dashboard:
# Backend → Deployments → Deployment ativo → ⋮ → Open Shell

python run_seeds.py
```

#### Opção B: Via Railway CLI
```bash
railway link
railway run python run_seeds.py
```

---

## 🛠️ Método 2: Criar Tabelas Manualmente

Se você quiser criar as tabelas **agora** sem esperar o próximo deploy.

### Via Railway Shell

1. Acesse Railway Dashboard
2. Backend → Deployments → Deployment ativo
3. Clique em **⋮** → **Open Shell**
4. Execute:

```bash
# Criar tabelas
python create_tables.py

# Popular categorias
python run_seeds.py
```

### Via Railway CLI

```bash
# Criar tabelas
railway run python create_tables.py

# Popular categorias
railway run python run_seeds.py
```

---

## 🔍 Verificar se Funcionou

### 1. Via API

Acesse no navegador:
```
https://seu-backend.railway.app/categories/
```

Deve retornar JSON com 33 categorias.

### 2. Via Railway Database UI

1. Railway → Postgres → Database → Data
2. Clique na tabela `categories`
3. Você deve ver 33 registros

### 3. Via Railway Shell

```bash
railway shell

python
from app.database import SessionLocal
from app.models import Category

db = SessionLocal()
count = db.query(Category).count()
print(f"✓ Total de categorias: {count}")
db.close()
exit()
```

---

## 📦 (Opcional) Criar Planos de Assinatura

Se o sistema usa planos de assinatura, você também precisa criá-los.

### Via Railway Shell

```bash
railway shell

python
from app.database import SessionLocal
from app.models import SubscriptionPlan

db = SessionLocal()

# Plano Trial (15 dias grátis)
trial = SubscriptionPlan(
    name="Trial",
    slug="trial",
    price=0.0,
    max_services=3,
    can_manage_schedule=True,
    can_receive_bookings=True,
    priority_in_search=0,
    trial_days=15,
    is_active=True
)

# Plano Premium
premium = SubscriptionPlan(
    name="Premium",
    slug="premium",
    price=50.0,
    max_services=None,  # Ilimitado
    can_manage_schedule=True,
    can_receive_bookings=True,
    priority_in_search=1,
    trial_days=None,
    is_active=True
)

db.add(trial)
db.add(premium)
db.commit()

print("✓ Planos criados com sucesso!")
db.close()
exit()
```

---

## 🔄 Workflow Completo Recomendado

```bash
# 1. Commit as mudanças
git add backend/app/main.py backend/create_tables.py
git commit -m "feat: criar tabelas automaticamente na inicialização"
git push origin main

# 2. Aguardar deploy no Railway (verá logs de criação de tabelas)

# 3. Executar seeds
railway run python run_seeds.py

# 4. (Opcional) Criar planos via shell
railway shell
# ... executar código Python acima ...

# 5. Verificar
curl https://seu-backend.railway.app/categories/
```

---

## ⚠️ Troubleshooting

### "Table already exists"

**Causa**: Tabelas já foram criadas anteriormente.

**Solução**: Tudo bem! Apenas execute os seeds.

```bash
railway run python run_seeds.py
```

### "Connection refused" ou erro de conexão

**Causa**: DATABASE_URL incorreta ou banco não acessível.

**Solução**: Verifique as variáveis do Railway:
1. Railway → Backend → Variables
2. Verifique se `DATABASE_URL` está definida
3. Ela deve apontar para o serviço Postgres do Railway

### "ModuleNotFoundError"

**Causa**: Executando do diretório errado.

**Solução**:
```bash
# Certifique-se de estar no diretório backend
cd backend
python create_tables.py
```

### Seeds não aparecem na API

**Causa**: Seeds executados mas transação não comitada.

**Solução**: Execute novamente:
```bash
railway run python run_seeds.py
```

### Erro ao criar tabelas: "no such table"

**Causa**: Modelos não foram importados corretamente.

**Solução**: Verifique se todos os models estão importados em `main.py`:
```python
from .models import (
    User, Service, Appointment, WorkingHours,
    SubscriptionPlan, Category
)
```

---

## 📊 Estrutura do Banco Após Setup

```
PostgreSQL Database
├── users (vazio inicialmente)
├── subscription_plans (opcional - 2 registros)
├── categories (33 registros)
├── services (vazio - preenchido por profissionais)
├── working_hours (vazio - preenchido por profissionais)
└── appointments (vazio - preenchido por clientes)
```

---

## 🎯 Próximos Passos

Após setup do banco:

1. ✅ Testar cadastro de usuário via API
2. ✅ Testar login
3. ✅ Profissional pode cadastrar serviços
4. ✅ Cliente pode buscar profissionais
5. ✅ Cliente pode fazer agendamentos

---

## 📝 Comandos Úteis

```bash
# Ver logs do backend em tempo real
railway logs -f

# Abrir shell no container
railway shell

# Executar qualquer script Python
railway run python seu_script.py

# Ver variáveis de ambiente
railway variables

# Conectar ao banco via psql
railway connect postgres
```

---

## 🔐 Lembrete de Segurança

**NUNCA commite**:
- ❌ `backend/.env`
- ❌ `backend/.env.production`
- ❌ Credenciais ou senhas

**Sempre use**:
- ✅ Variáveis do Railway
- ✅ Railway CLI autenticado
- ✅ `.env.example` como template

---

**Última atualização**: 2026-01-14
