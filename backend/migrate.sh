#!/bin/bash
# Script para gerenciar migrations do banco de dados
# Uso: ./migrate.sh [comando]
#
# Comandos disponíveis:
#   upgrade   - Aplica todas as migrations pendentes
#   downgrade - Reverte a última migration
#   current   - Mostra a versão atual do banco
#   history   - Mostra histórico de migrations
#   create    - Cria uma nova migration (autogenerate)

set -e

COMMAND=${1:-upgrade}

case "$COMMAND" in
  upgrade)
    echo "🔄 Aplicando migrations pendentes..."
    python3 -m alembic upgrade head
    echo "✅ Migrations aplicadas com sucesso!"
    ;;

  downgrade)
    echo "⚠️  Revertendo última migration..."
    python3 -m alembic downgrade -1
    echo "✅ Migration revertida!"
    ;;

  current)
    echo "📍 Versão atual do banco:"
    python3 -m alembic current
    ;;

  history)
    echo "📜 Histórico de migrations:"
    python3 -m alembic history
    ;;

  create)
    if [ -z "$2" ]; then
      echo "❌ Erro: Forneça uma mensagem para a migration"
      echo "Uso: ./migrate.sh create 'mensagem_da_migration'"
      exit 1
    fi
    echo "🆕 Criando nova migration: $2"
    python3 -m alembic revision --autogenerate -m "$2"
    echo "✅ Migration criada! Revise o arquivo gerado antes de aplicar."
    ;;

  *)
    echo "❌ Comando desconhecido: $COMMAND"
    echo ""
    echo "Comandos disponíveis:"
    echo "  upgrade   - Aplica todas as migrations pendentes"
    echo "  downgrade - Reverte a última migration"
    echo "  current   - Mostra a versão atual do banco"
    echo "  history   - Mostra histórico de migrations"
    echo "  create    - Cria uma nova migration (autogenerate)"
    exit 1
    ;;
esac
