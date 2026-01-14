#!/bin/bash
# Script para monitorar propagação DNS e testar API

echo "🔍 Monitorando propagação DNS de api.contratapro.com.br"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN="api.contratapro.com.br"
API_URL="https://$DOMAIN"
MAX_ATTEMPTS=20
ATTEMPT=0

echo "⏳ Aguardando propagação DNS..."
echo "   (Isso pode levar de 5 a 30 minutos)"
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    echo -n "[$ATTEMPT/$MAX_ATTEMPTS] Verificando DNS... "

    # Verificar se DNS resolve
    DNS_RESULT=$(dig +short $DOMAIN 2>/dev/null | tail -1)

    if [ -n "$DNS_RESULT" ]; then
        echo -e "${GREEN}✅ DNS resolvido: $DNS_RESULT${NC}"

        echo -n "           Testando HTTPS... "

        # Testar health endpoint
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>&1)

        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✅ API FUNCIONANDO!${NC}"
            echo ""
            echo "=================================================="
            echo "🎉 SUCESSO! API está respondendo!"
            echo "=================================================="
            echo ""
            echo "URLs disponíveis:"
            echo "  Health: $API_URL/health"
            echo "  Categorias: $API_URL/categories/"
            echo "  Documentação: $API_URL/docs"
            echo ""
            echo "Testando resposta:"
            curl -s "$API_URL/health" | python3 -m json.tool
            echo ""
            exit 0
        elif [ "$HTTP_CODE" = "000" ]; then
            echo -e "${YELLOW}⏳ Aguardando SSL... (DNS ok, certificado pendente)${NC}"
        else
            echo -e "${YELLOW}⏳ HTTP $HTTP_CODE (aguardando)${NC}"
        fi
    else
        echo -e "${YELLOW}⏳ DNS ainda não propagou${NC}"
    fi

    # Aguardar antes de tentar novamente
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "   Aguardando 30 segundos..."
        echo ""
        sleep 30
    fi
done

echo ""
echo "=================================================="
echo "⏱️  Timeout após $MAX_ATTEMPTS tentativas"
echo "=================================================="
echo ""
echo "O DNS pode levar até 72 horas para propagar completamente,"
echo "mas geralmente leva de 5 a 30 minutos."
echo ""
echo "Continue verificando manualmente:"
echo "  curl https://api.contratapro.com.br/health"
