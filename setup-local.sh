#!/bin/bash

# Script de Setup para Desenvolvimento Local
# Execute: bash setup-local.sh

echo "🚀 ContrataPro - Setup de Desenvolvimento Local"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está na raiz do projeto
if [ ! -f "docker-compose.yaml" ]; then
    echo -e "${RED}❌ Erro: Execute este script da raiz do projeto!${NC}"
    echo "   cd /home/hermano/projetos/faz_de_tudo"
    exit 1
fi

echo "📋 Verificando pré-requisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    echo "   Instale: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker instalado${NC}"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado!${NC}"
    echo "   Instale: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose instalado${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js não encontrado${NC}"
    echo "   Instale para rodar o frontend: https://nodejs.org/"
else
    echo -e "${GREEN}✅ Node.js instalado ($(node --version))${NC}"
fi

echo ""
echo "📁 Configurando Backend..."

# Criar .env se não existir
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Criando backend/.env...${NC}"

    # Gerar JWT Secret
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "dev-secret-change-me-in-production")

    cat > backend/.env << EOF
# Gerado automaticamente por setup-local.sh
# $(date)

# ===========================================
# DATABASE
# ===========================================
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/faz_de_tudo

# PostgreSQL (para o container)
POSTGRES_DB=faz_de_tudo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# ===========================================
# JWT
# ===========================================
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# ===========================================
# MERCADO PAGO (TESTE)
# ===========================================
# Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials
MERCADOPAGO_ACCESS_TOKEN=TEST-your-test-token-here
MERCADOPAGO_PUBLIC_KEY=TEST-your-test-public-key-here

# ===========================================
# URLs
# ===========================================
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# ===========================================
# UPLOAD
# ===========================================
UPLOAD_STORAGE=local

# ===========================================
# SUBSCRIPTION
# ===========================================
SUBSCRIPTION_AMOUNT=50.00
SUBSCRIPTION_FREQUENCY=1
SUBSCRIPTION_FREQUENCY_TYPE=months
EOF

    echo -e "${GREEN}✅ backend/.env criado!${NC}"
    echo -e "${YELLOW}⚠️  Configure o MERCADOPAGO_ACCESS_TOKEN com sua chave de teste${NC}"
else
    echo -e "${GREEN}✅ backend/.env já existe${NC}"
fi

echo ""
echo "📁 Configurando Frontend..."

# Criar .env do frontend se não existir
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}📝 Criando frontend/.env...${NC}"

    cat > frontend/.env << EOF
# Gerado automaticamente por setup-local.sh
# $(date)

# ===========================================
# API URL
# ===========================================
# Deixe vazio para usar localhost:8000 em dev
VITE_API_URL=

# ===========================================
# MERCADO PAGO (TESTE)
# ===========================================
# Use a mesma chave pública de teste do backend
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-test-public-key-here
EOF

    echo -e "${GREEN}✅ frontend/.env criado!${NC}"
    echo -e "${YELLOW}⚠️  Configure o VITE_MERCADOPAGO_PUBLIC_KEY${NC}"
else
    echo -e "${GREEN}✅ frontend/.env já existe${NC}"
fi

echo ""
echo "🐳 Iniciando containers Docker..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers iniciados!${NC}"
else
    echo -e "${RED}❌ Erro ao iniciar containers${NC}"
    exit 1
fi

echo ""
echo "⏳ Aguardando backend inicializar (10 segundos)..."
sleep 10

echo ""
echo "🧪 Testando backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend funcionando!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend ainda não respondeu (pode levar mais alguns segundos)${NC}"
    echo "   Verifique os logs: docker-compose logs -f backend"
fi

echo ""
echo "📦 Instalando dependências do frontend..."
if command -v npm &> /dev/null; then
    cd frontend
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependências instaladas!${NC}"
        cd ..
    else
        echo -e "${RED}❌ Erro ao instalar dependências${NC}"
        cd ..
    fi
else
    echo -e "${YELLOW}⚠️  npm não disponível, pule esta etapa${NC}"
fi

echo ""
echo "✅ Setup completo!"
echo ""
echo "================================================"
echo "🎉 Ambiente de Desenvolvimento Pronto!"
echo "================================================"
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1️⃣  Configure suas credenciais do Mercado Pago:"
echo "   - Edite backend/.env"
echo "   - Edite frontend/.env"
echo "   - Use credenciais de TESTE"
echo ""
echo "2️⃣  Acesse o backend:"
echo "   🔗 API: http://localhost:8000"
echo "   📖 Docs: http://localhost:8000/docs"
echo ""
echo "3️⃣  Inicie o frontend (em outro terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo "   🔗 App: http://localhost:5173"
echo ""
echo "4️⃣  Ver logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "5️⃣  Parar ambiente:"
echo "   docker-compose down"
echo ""
echo "================================================"
echo "📖 Documentação completa: DESENVOLVIMENTO_LOCAL.md"
echo "================================================"
