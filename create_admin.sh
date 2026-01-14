#!/bin/bash

# Script para criar usuário administrador na plataforma Chama Eu
# Uso: ./create_admin.sh [email] [senha] [nome]

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Valores padrão
DEFAULT_EMAIL="admin@chamaeu.com"
DEFAULT_PASSWORD="admin123"
DEFAULT_NAME="Administrador"

# Usar argumentos ou valores padrão
ADMIN_EMAIL="${1:-$DEFAULT_EMAIL}"
ADMIN_PASSWORD="${2:-$DEFAULT_PASSWORD}"
ADMIN_NAME="${3:-$DEFAULT_NAME}"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Criação de Usuário Administrador         ║${NC}"
echo -e "${BLUE}║  Plataforma Chama Eu                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo -e "${YELLOW}   Inicie o Docker e tente novamente.${NC}"
    exit 1
fi

# Verificar se os containers estão rodando
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo -e "${YELLOW}⚠️  Backend não está rodando. Iniciando containers...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✓ Aguardando backend inicializar...${NC}"
    sleep 5
fi

echo -e "${BLUE}📝 Configuração:${NC}"
echo -e "   Email: ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "   Senha: ${GREEN}${ADMIN_PASSWORD}${NC}"
echo -e "   Nome:  ${GREEN}${ADMIN_NAME}${NC}"
echo ""

# Script Python para criar o admin
PYTHON_SCRIPT=$(cat <<EOF
import asyncio
from app.database import AsyncSessionLocal
from app.models import User
from app.auth_utils import get_password_hash
from sqlalchemy import select

async def create_admin():
    async with AsyncSessionLocal() as db:
        # Verificar se admin já existe
        result = await db.execute(
            select(User).filter(User.email == "${ADMIN_EMAIL}")
        )
        existing_admin = result.scalars().first()

        if existing_admin:
            print("⚠️  Usuário já existe!")
            print(f"   Email: ${ADMIN_EMAIL}")
            print(f"   É admin: {existing_admin.is_admin}")

            if not existing_admin.is_admin:
                print("   Atualizando para administrador...")
                existing_admin.is_admin = True
                await db.commit()
                print("✓ Usuário atualizado para administrador!")
            else:
                print("✓ Usuário já é administrador!")

            return existing_admin

        # Criar novo admin
        admin = User(
            name="${ADMIN_NAME}",
            email="${ADMIN_EMAIL}",
            hashed_password=get_password_hash("${ADMIN_PASSWORD}"),
            is_admin=True,
            is_professional=False
        )

        db.add(admin)
        await db.commit()
        await db.refresh(admin)

        print("✓ Administrador criado com sucesso!")
        print(f"   ID: {admin.id}")
        print(f"   Nome: {admin.name}")
        print(f"   Email: {admin.email}")

        return admin

# Executar
asyncio.run(create_admin())
EOF
)

echo -e "${BLUE}🔧 Executando script de criação...${NC}"
echo ""

# Executar o script Python dentro do container
if docker-compose exec -T backend python3 -c "$PYTHON_SCRIPT"; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ADMIN CRIADO COM SUCESSO!              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📋 Credenciais de Acesso:${NC}"
    echo -e "   URL:   ${GREEN}http://localhost:3000/login${NC}"
    echo -e "   Email: ${GREEN}${ADMIN_EMAIL}${NC}"
    echo -e "   Senha: ${GREEN}${ADMIN_PASSWORD}${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dica:${NC} Altere a senha após o primeiro login!"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ ERRO AO CRIAR ADMINISTRADOR           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis soluções:${NC}"
    echo -e "  1. Verifique se o backend está rodando:"
    echo -e "     ${BLUE}docker-compose ps${NC}"
    echo ""
    echo -e "  2. Verifique os logs do backend:"
    echo -e "     ${BLUE}docker-compose logs backend${NC}"
    echo ""
    echo -e "  3. Reinicie os containers:"
    echo -e "     ${BLUE}docker-compose restart${NC}"
    echo ""
    exit 1
fi
