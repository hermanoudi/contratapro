# Claude Code Instructions - ContrataPro

## Regras de Segurança (OBRIGATÓRIO)

### NUNCA COMMITAR DADOS SENSÍVEIS

O Claude Code **NUNCA** deve incluir em commits os seguintes dados:

1. **Senhas** - Senhas de usuários, administradores, bancos de dados
2. **Chaves de API** - Mercado Pago, Cloudinary, JWT secrets, etc
3. **URLs de banco de dados** - DATABASE_URL com credenciais
4. **Tokens de acesso** - Access tokens, refresh tokens, bearer tokens
5. **Chaves privadas** - SSH keys, SSL certificates, private keys
6. **Credenciais de serviços** - Railway, Vercel, AWS, GCP, etc

### Como Lidar com Dados Sensíveis

1. **Usar variáveis de ambiente** - Sempre usar `os.getenv()` ou similar
2. **Arquivos .env** - Credenciais devem estar apenas em `.env` (já no .gitignore)
3. **Argumentos de CLI** - Aceitar senhas como argumentos de linha de comando
4. **Placeholders** - Em documentação, usar exemplos genéricos como:
   - `sua-senha-aqui`
   - `seu-token-aqui`
   - `postgresql://user:password@host:port/db`

### Antes de Cada Commit

Verificar se o código contém:
- Strings que parecem senhas (sequências alfanuméricas complexas)
- URLs com credenciais embutidas
- Tokens ou chaves de API hardcoded
- Qualquer dado que não deveria ser público

### Se Credenciais Vazarem

1. **Alterar imediatamente** a senha/token vazado
2. **Remover** do código e commitar a correção
3. **Considerar** usar `git filter-branch` ou BFG para limpar histórico

---

## Estrutura do Projeto

### Backend (FastAPI + PostgreSQL)
- `backend/app/` - Código principal da API
- `backend/app/routers/` - Endpoints organizados por domínio
- `backend/app/models.py` - Modelos SQLAlchemy
- `backend/app/schemas.py` - Schemas Pydantic

### Frontend (React + Vite)
- `frontend/src/pages/` - Páginas da aplicação
- `frontend/src/components/` - Componentes reutilizáveis
- `frontend/src/services/` - Comunicação com API

### Infraestrutura
- **Backend**: Railway (api.contratapro.com.br)
- **Frontend**: Vercel (contratapro.com.br)
- **Banco**: PostgreSQL no Railway

---

## Comandos Úteis

```bash
# Backend local
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend local
cd frontend && npm run dev

# Docker
docker-compose up -d

# Railway
railway run python <script>.py
```

---

## Planos de Assinatura

| Plano   | Preço     | Serviços  | Trial    |
|---------|-----------|-----------|----------|
| Trial   | Grátis    | 3         | 30 dias  |
| Basic   | R$ 29,90  | 5         | -        |
| Premium | R$ 49,90  | Ilimitado | -        |
