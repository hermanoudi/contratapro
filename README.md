# Chama Eu - Plataforma de Agendamento de Serviços

Plataforma web que conecta clientes a profissionais autônomos, facilitando o agendamento de serviços com sistema de pagamento integrado via Mercado Pago.

## 🚀 Tecnologias

### Backend
- **FastAPI** - Framework Python async para APIs REST
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM async para Python
- **Alembic** - Migrations de banco de dados
- **Pydantic** - Validação de dados
- **JWT** - Autenticação e autorização
- **Mercado Pago SDK** - Integração de pagamentos

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e dev server
- **React Router** - Roteamento client-side
- **Styled Components** - CSS-in-JS
- **Framer Motion** - Animações
- **Lucide React** - Ícones

### Infraestrutura
- **Docker** & **Docker Compose** - Containerização
- **Nginx** (futuro) - Reverse proxy e servir arquivos estáticos

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local do frontend)
- Python 3.12+ (para desenvolvimento local do backend)
- Conta no Mercado Pago (para testes de pagamento)

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd faz_de_tudo
```

### 2. Configure as variáveis de ambiente

#### Backend (`backend/.env`)

Copie o arquivo de exemplo e configure:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` e configure:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=faz_de_tudo

# JWT
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Mercado Pago (Credenciais de TESTE)
MERCADOPAGO_ACCESS_TOKEN=seu-access-token-aqui
MERCADOPAGO_PUBLIC_KEY=sua-public-key-aqui

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Assinatura
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months
```

#### Frontend (`frontend/.env`)

```bash
# Crie o arquivo frontend/.env
echo "VITE_MERCADOPAGO_PUBLIC_KEY=sua-public-key-aqui" > frontend/.env
```

### 3. Inicie o projeto com Docker

```bash
docker-compose up -d
```

Isso irá:
- Criar o banco de dados PostgreSQL
- Executar as migrations
- Iniciar o backend na porta 8000
- Instalar dependências e iniciar o frontend na porta 5173

### 4. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 👥 Tipos de Usuário

### Cliente
- Buscar profissionais por serviço e localização
- Visualizar perfis e avaliações
- Agendar serviços
- Acompanhar agendamentos

### Profissional
- Criar perfil profissional com foto e descrição
- Cadastrar serviços oferecidos
- Gerenciar agenda e disponibilidade
- Receber agendamentos de clientes
- Assinatura mensal de R$ 50,00 via Mercado Pago

### Administrador
- Gerenciar usuários e profissionais
- Visualizar estatísticas da plataforma
- Ativar/desativar assinaturas manualmente

## 📂 Estrutura do Projeto

```
faz_de_tudo/
├── backend/
│   ├── app/
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   ├── schemas.py         # Schemas Pydantic
│   │   ├── routers/           # Endpoints da API
│   │   ├── services/          # Lógica de negócio
│   │   └── database.py        # Configuração do DB
│   ├── alembic/               # Migrations
│   ├── requirements.txt       # Dependências Python
│   └── .env                   # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── pages/             # Páginas React
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── assets/            # Imagens e recursos
│   │   └── App.jsx            # Componente principal
│   ├── package.json           # Dependências Node
│   └── .env                   # Variáveis de ambiente
└── docker-compose.yaml        # Orquestração de containers
```

## 🔐 Segurança

### Checklist de Segurança para Produção

- [ ] Alterar `SECRET_KEY` para uma chave forte e única
- [ ] Alterar senha do PostgreSQL (`POSTGRES_PASSWORD`)
- [ ] Usar credenciais de PRODUÇÃO do Mercado Pago
- [ ] Configurar CORS adequadamente
- [ ] Habilitar HTTPS
- [ ] Configurar rate limiting
- [ ] Revisar permissões de upload de arquivos
- [ ] Configurar backup automático do banco de dados
- [ ] Implementar logs de auditoria
- [ ] Configurar variáveis de ambiente via secrets do servidor

### Arquivos Sensíveis (Nunca commitar)

- `*.env` (exceto `.env.example`)
- `*.key`, `*.pem`
- `credentials.json`
- Arquivos de upload (`uploads/`)
- Dados de banco de dados

## 🧪 Testando a Aplicação

### Criar um usuário administrador

```bash
# Com Docker
docker-compose exec backend python -c "from app.create_admin import create_admin; import asyncio; asyncio.run(create_admin())"

# Ou use o script fornecido
./create_admin.sh
```

### Credenciais de teste Mercado Pago

Para testes em ambiente sandbox, use cartões de teste:
- **Aprovado**: 5031 4332 1540 6351
- **Recusado**: 5031 7557 3453 0604

CVV: 123 | Validade: qualquer data futura

## 📚 Documentação API

A documentação interativa da API está disponível em:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Desenvolvimento

### Backend (desenvolvimento local)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (desenvolvimento local)

```bash
cd frontend
npm install
npm run dev
```

### Migrations

```bash
# Criar uma nova migration
docker-compose exec backend alembic revision --autogenerate -m "descrição"

# Aplicar migrations
docker-compose exec backend alembic upgrade head
```

## 📝 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

## 🤝 Contribuindo

Para contribuir com este projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
2. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
3. Push para a branch (`git push origin feature/MinhaFeature`)
4. Abra um Pull Request

## ✨ Autores

Desenvolvido por [Seu Nome]

## 📞 Suporte

Para suporte, envie um email para: [seu-email@example.com]
