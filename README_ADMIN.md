# 🔐 Criação de Usuário Administrador

## 🚀 Uso Rápido

Para criar um administrador com credenciais padrão:

```bash
./create_admin.sh
```

**Credenciais padrão:**
- **Email:** `admin@chamaeu.com`
- **Senha:** `admin123`
- **Nome:** `Administrador`

---

## 🎯 Uso Personalizado

Para criar um admin com credenciais customizadas:

```bash
./create_admin.sh "email@empresa.com" "senha_segura" "Nome do Admin"
```

**Exemplo:**

```bash
./create_admin.sh "joao@chamaeu.com" "minhasenha123" "João Silva"
```

---

## 📋 O que o Script Faz

1. ✅ Verifica se o Docker está rodando
2. ✅ Verifica se os containers estão ativos (inicia se necessário)
3. ✅ Conecta ao banco de dados
4. ✅ Verifica se o email já existe:
   - Se **existe** e **não é admin**: atualiza para administrador
   - Se **existe** e **já é admin**: informa que já existe
   - Se **não existe**: cria novo usuário administrador
5. ✅ Exibe as credenciais de acesso

---

## 🔧 Quando Usar

### **Desenvolvimento Local:**
```bash
# Após clonar o repositório
git clone <repo>
cd faz_de_tudo
docker-compose up -d
./create_admin.sh
```

### **Após Limpar o Banco:**
```bash
# Se você apagou o banco de dados
docker-compose down -v
docker-compose up -d
./create_admin.sh
```

### **Ambiente de Homologação:**
```bash
# Criar admin específico para homologação
./create_admin.sh "admin.homolog@chamaeu.com" "senha_homolog" "Admin Homologação"
```

### **Ambiente de Produção:**
```bash
# Criar admin com senha forte
./create_admin.sh "admin@empresa.com" "$(openssl rand -base64 32)" "Administrador Prod"
```

> **⚠️ IMPORTANTE:** Em produção, use senhas fortes e armazene as credenciais de forma segura!

---

## 🐳 Requisitos

- Docker e Docker Compose instalados e rodando
- Backend configurado e containers ativos

---

## 🛠️ Troubleshooting

### **Erro: "Docker não está rodando"**

**Solução:**
```bash
# Iniciar o Docker
sudo systemctl start docker  # Linux
# ou
# Abrir Docker Desktop (Windows/Mac)
```

### **Erro: "Backend não está rodando"**

**Solução:**
```bash
# Iniciar os containers
docker-compose up -d

# Verificar status
docker-compose ps
```

### **Erro: "Usuário já existe"**

Se o usuário já existe mas não é admin:
```bash
# O script automaticamente atualiza para admin
./create_admin.sh
```

Se precisar resetar a senha de um admin existente:
```bash
# Deletar o usuário primeiro
docker-compose exec backend python3 -c "
import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from sqlalchemy import select, delete

async def delete_user():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(User).where(User.email == 'admin@chamaeu.com'))
        await db.commit()
        print('Usuário deletado!')

asyncio.run(delete_user())
"

# Depois criar novamente
./create_admin.sh
```

---

## 📱 Primeiro Acesso

Após criar o admin:

1. **Acesse:** http://localhost:3000/login

2. **Faça login com as credenciais**

3. **Será redirecionado para:** http://localhost:3000/admin

4. **⚠️ Altere a senha padrão:**
   - Vá para "Minha Conta" (quando implementado)
   - Ou use o backend diretamente

---

## 🔒 Segurança

### **Recomendações para Produção:**

1. **Nunca use a senha padrão (`admin123`)**

2. **Use senhas fortes:**
   ```bash
   # Gerar senha aleatória forte
   ./create_admin.sh "admin@empresa.com" "$(openssl rand -base64 32)" "Admin"
   ```

3. **Armazene credenciais com segurança:**
   - Use um gerenciador de senhas
   - Não commite senhas no Git
   - Use variáveis de ambiente em produção

4. **Implemente 2FA (Two-Factor Authentication)**
   - Adicionar depois do MVP

5. **Monitore acessos admin:**
   - Implementar logs de auditoria
   - Alertas de login suspeito

---

## 📝 Variáveis de Ambiente (Produção)

Para produção, crie variáveis de ambiente:

```bash
# .env.production
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=senha_super_segura_gerada
ADMIN_NAME=Administrador Produção
```

Depois use:
```bash
./create_admin.sh "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME"
```

---

## 🧪 Teste Rápido

Verificar se o admin foi criado corretamente:

```bash
# Listar todos os admins
docker-compose exec backend python3 -c "
import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from sqlalchemy import select

async def list_admins():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.is_admin == True)
        )
        admins = result.scalars().all()
        print(f'\n📋 Administradores cadastrados: {len(admins)}\n')
        for admin in admins:
            print(f'  • {admin.name} ({admin.email})')

asyncio.run(list_admins())
"
```

---

## 🔄 Scripts Relacionados

- **[create_admin.sh](create_admin.sh)** - Este script (criar admin)
- **[GUIA_TESTE_ADMIN_DASHBOARD.md](GUIA_TESTE_ADMIN_DASHBOARD.md)** - Guia completo de testes do dashboard

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs:
   ```bash
   docker-compose logs backend
   ```

2. Verifique a conexão com o banco:
   ```bash
   docker-compose exec backend python3 -c "from app.database import engine; print('✓ Banco conectado!')"
   ```

3. Reinicie os containers:
   ```bash
   docker-compose restart
   ```

---

**Criado em:** 27/12/2024
**Versão:** 1.0
