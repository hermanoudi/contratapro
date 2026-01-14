#!/bin/bash

# Script para atualizar todas as chamadas de API para usar a variável API_URL

# Lista de arquivos para atualizar
files=(
  "frontend/src/pages/Home.jsx"
  "frontend/src/components/ProfessionalLayout.jsx"
  "frontend/src/components/ClientLayout.jsx"
  "frontend/src/pages/RegisterClient.jsx"
  "frontend/src/pages/RegisterProfessional.jsx"
  "frontend/src/pages/AdminDashboard.jsx"
  "frontend/src/pages/AdminTrials.jsx"
  "frontend/src/pages/MySubscription.jsx"
  "frontend/src/pages/ProfessionalProfile.jsx"
  "frontend/src/components/CategoryMenu.jsx"
  "frontend/src/pages/Booking.jsx"
  "frontend/src/pages/ClientDashboard.jsx"
  "frontend/src/pages/Dashboard.jsx"
  "frontend/src/pages/History.jsx"
  "frontend/src/pages/SubscriptionSetup.jsx"
  "frontend/src/pages/SubscriptionCallback.jsx"
  "frontend/src/pages/SubscriptionCheckout.jsx"
)

echo "Atualizando arquivos para usar API_URL..."

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processando $file..."

    # Adicionar import se não existir
    if ! grep -q "import { API_URL } from" "$file"; then
      # Encontrar a última linha de import
      last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      if [ -n "$last_import" ]; then
        sed -i "${last_import}a import { API_URL } from '../config';" "$file"
      fi
    fi

    # Substituir fetch('/api/ por fetch(\`\${API_URL}/
    sed -i "s|fetch('/api/|fetch(\`\${API_URL}/|g" "$file"
    sed -i 's|fetch("/api/|fetch(`${API_URL}/|g' "$file"

    # Substituir '/api/ por ${API_URL}/
    sed -i "s|'\(/api/[^']*\)'|\`\${API_URL}/\1\`|g" "$file" 2>/dev/null || true

  else
    echo "Arquivo não encontrado: $file"
  fi
done

echo "Concluído!"
