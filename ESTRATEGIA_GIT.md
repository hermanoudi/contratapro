# Estratégia de Versionamento Git - Chama Eu

## 📊 Análise: Monorepo vs Multirepo

### ✅ RECOMENDAÇÃO: **MONOREPO** (Repositório Único)

Para o seu projeto "Chama Eu", **recomendo fortemente usar um MONOREPO** (um único repositório para frontend e backend juntos).

## 🎯 Por que Monorepo é melhor para este projeto?

### ✅ Vantagens

1. **Simplicidade de Gerenciamento**
   - Um único repositório para clonar
   - Um único README e documentação central
   - Issues e PRs centralizados

2. **Versionamento Sincronizado**
   - Frontend e backend sempre compatíveis
   - Mudanças em ambos os lados no mesmo commit
   - Histórico unificado de desenvolvimento

3. **Facilita Desenvolvimento Full-Stack**
   - Você trabalha em features que abrangem frontend e backend
   - Commits atômicos que incluem mudanças nos dois lados
   - Exemplo: Adicionar endpoint + tela que o consome em um único PR

4. **CI/CD Mais Simples**
   - Um único pipeline de deploy
   - Testes end-to-end mais fáceis
   - Deploy coordenado de front e back

5. **Melhor para Projetos de Tamanho Médio**
   - Seu projeto tem ~200 arquivos (estimativa)
   - Não há complexidade que justifique separação
   - Equipe pequena (você ou poucos desenvolvedores)

### ❌ Quando NÃO usar Monorepo

- Equipes grandes (>10 pessoas) com times separados front/back
- Backends que servem múltiplos frontends diferentes
- Necessidade de CI/CD totalmente independente
- Projetos com tecnologias muito diferentes que raramente se comunicam

## 🏗️ Estrutura Recomendada do Monorepo

```
faz_de_tudo/                    # Repositório único
├── .git/                       # Versionamento Git
├── .gitignore                  # Ignorar arquivos sensíveis ✅ CRIADO
├── README.md                   # Documentação principal ✅ CRIADO
├── docker-compose.yaml         # Orquestração completa
├── .github/                    # CI/CD (futuro)
│   └── workflows/
│       └── deploy.yml
├── backend/                    # Aplicação Python/FastAPI
│   ├── .env.example           # Template de configuração ✅ EXISTE
│   ├── .env                   # Configuração local (IGNORADO)
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/                   # Aplicação React/Vite
    ├── .env.example           # Template (CRIAR)
    ├── .env                   # Configuração local (IGNORADO)
    ├── src/
    ├── package.json
    └── Dockerfile
```

## 🔐 Checklist de Segurança ANTES do Commit

### ✅ Arquivos Criados/Configurados

- [x] `.gitignore` - Criado e configurado
- [x] `README.md` - Documentação completa
- [x] `backend/.env.example` - Template sem credenciais
- [ ] `frontend/.env.example` - **CRIAR AGORA**

### ⚠️ Arquivos que NUNCA devem ir pro Git

- [ ] `backend/.env` - **VERIFICAR que está no .gitignore**
- [ ] `frontend/.env` - **VERIFICAR que está no .gitignore**
- [ ] `uploads/` - Arquivos de upload de usuários
- [ ] `*.key`, `*.pem` - Certificados e chaves privadas
- [ ] `venv/`, `node_modules/` - Dependências
- [ ] Scripts de teste pessoais (`test_*.sh`, `debug_*.sh`)

### 🔍 Verificações de Segurança

#### 1. Credenciais do Mercado Pago
```bash
# ⚠️ ATENÇÃO: Suas credenciais atuais são de TESTE
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4784725392668962-122714-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-f4e37e9e-b156-4d26-9d46-...
```

**Status**: ✅ São credenciais de TESTE (sandbox)
**Ação**: Pode commitar o código, mas **NUNCA commitar .env**
**Produção**: Trocar por credenciais de produção usando variáveis de ambiente

#### 2. Secret Key JWT
```bash
SECRET_KEY=your-secret-key-here-change-in-production
```

**Status**: ⚠️ Chave genérica (desenvolvimento)
**Ação**:
- Desenvolvimento: OK manter
- Produção: **OBRIGATÓRIO** gerar chave forte:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 3. Senha do Banco de Dados
```bash
POSTGRES_PASSWORD=postgres
```

**Status**: ⚠️ Senha padrão (desenvolvimento)
**Ação**:
- Desenvolvimento local: OK
- Produção: **OBRIGATÓRIO** usar senha forte

#### 4. URLs Hardcoded
```bash
FRONTEND_URL=https://vaguely-semifinished-mathilda.ngrok-free.dev
```

**Status**: ⚠️ URL temporária do ngrok
**Ação**: Alterar antes de deploy para URL real de produção

## 📝 Plano de Ação para Primeiro Commit

### Passo 1: Criar `.env.example` do Frontend
```bash
cat > frontend/.env.example << 'EOF'
# ===========================================
# MERCADO PAGO - PUBLIC KEY
# ===========================================
# Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials
# Use credenciais de TESTE para desenvolvimento
# Use credenciais de PRODUÇÃO para deploy final
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-your-public-key-here
EOF
```

### Passo 2: Verificar .gitignore
```bash
# Verificar se .env está ignorado
git check-ignore backend/.env frontend/.env

# Deve retornar os caminhos, indicando que serão ignorados
```

### Passo 3: Adicionar arquivos ao Git
```bash
cd /home/hermano/projetos/faz_de_tudo

# Adicionar tudo EXCETO arquivos sensíveis
git add .

# Verificar o que será commitado
git status

# Se aparecer algum .env, REMOVER:
git reset backend/.env frontend/.env
```

### Passo 4: Fazer o commit inicial
```bash
git commit -m "feat: Initial commit - Chama Eu Platform

- FastAPI backend com autenticação JWT
- Frontend React + Vite com styled-components
- Integração Mercado Pago para assinaturas
- Sistema de agendamento profissional-cliente
- Docker Compose para desenvolvimento
- Upload de imagens para perfis
- Sistema de busca por categoria e localização"
```

### Passo 5: Criar repositório remoto

#### Opção A: GitHub (Recomendado)
```bash
# Crie o repositório no GitHub primeiro
# Depois:
git remote add origin https://github.com/seu-usuario/chama-eu.git
git branch -M main
git push -u origin main
```

#### Opção B: GitLab
```bash
git remote add origin https://gitlab.com/seu-usuario/chama-eu.git
git branch -M main
git push -u origin main
```

## 🚀 Estratégia de Branches

### Branch Principal
- `main` ou `master` - Código de produção

### Branches de Feature
```bash
# Para novas funcionalidades
git checkout -b feature/nome-da-feature

# Para correções
git checkout -b fix/nome-do-bug

# Para melhorias
git checkout -b improvement/nome-da-melhoria
```

### Fluxo de Trabalho
```bash
# 1. Criar branch
git checkout -b feature/pagamento-pix

# 2. Fazer mudanças
git add .
git commit -m "feat: adiciona pagamento via PIX"

# 3. Push da branch
git push origin feature/pagamento-pix

# 4. Criar Pull Request no GitHub

# 5. Após aprovação, merge para main
git checkout main
git merge feature/pagamento-pix
git push origin main
```

## 📦 Alternativa: Multirepo (NÃO Recomendado para seu caso)

Se ainda assim preferir separar, seria assim:

```
chama-eu-backend/          # Repositório 1
├── app/
├── alembic/
└── requirements.txt

chama-eu-frontend/         # Repositório 2
├── src/
├── public/
└── package.json
```

**Desvantagens**:
- Dois repositórios para clonar e configurar
- Dificulta mudanças que afetam ambos os lados
- Mais complexo de versionar compatibilidade
- CI/CD precisa coordenar dois repos

## ✅ Checklist Final Antes do Push

- [ ] `.gitignore` configurado
- [ ] `.env` e `.env.*` não aparecem no `git status`
- [ ] `README.md` completo e atualizado
- [ ] `.env.example` criado para frontend
- [ ] Sem credenciais reais commitadas
- [ ] `node_modules/` e `venv/` ignorados
- [ ] `uploads/` ignorado
- [ ] Scripts de teste pessoais ignorados

## 🎓 Comandos Úteis

```bash
# Ver o que será commitado
git status

# Ver diferenças
git diff

# Ver histórico
git log --oneline --graph

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Remover arquivo acidentalmente adicionado
git rm --cached arquivo.env

# Ver arquivos ignorados
git status --ignored
```

## 📞 Suporte

Se tiver dúvidas sobre a estratégia de versionamento, consulte:
- [GitHub Docs](https://docs.github.com/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
