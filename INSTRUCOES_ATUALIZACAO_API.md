# Instruções para Atualizar Chamadas de API

## Resumo
Todos os arquivos que fazem chamadas `fetch('/api/...)` precisam ser atualizados para usar `${API_URL}/...`

## Passos Automáticos

Execute este comando no terminal para atualizar automaticamente todos os arquivos:

```bash
cd /home/hermano/projetos/faz_de_tudo/frontend/src

# 1. Adicionar import do API_URL em todos os arquivos que usam fetch
find . -type f -name "*.jsx" -exec grep -l "fetch.*'/api/" {} \; | while read file; do
  if ! grep -q "import { API_URL }" "$file"; then
    # Adiciona o import após o último import existente
    sed -i '/^import.*from/a import { API_URL } from '"'"'../config'"'"';' "$file"
  fi
done

# 2. Substituir todas as chamadas fetch
find . -type f -name "*.jsx" -exec sed -i "s|fetch('/api/|fetch(\`\${API_URL}/|g" {} \;
find . -type f -name "*.jsx" -exec sed -i 's|fetch("/api/|fetch(`${API_URL}/|g' {} \;
```

## OU: Atualização Manual

Se preferir fazer manualmente, para cada arquivo abaixo:

### Arquivos a atualizar:
1. `frontend/src/pages/Home.jsx`
2. `frontend/src/components/ProfessionalLayout.jsx`
3. `frontend/src/components/ClientLayout.jsx`
4. `frontend/src/pages/RegisterClient.jsx`
5. `frontend/src/pages/RegisterProfessional.jsx`
6. `frontend/src/pages/AdminDashboard.jsx`
7. `frontend/src/pages/AdminTrials.jsx`
8. `frontend/src/pages/MySubscription.jsx`
9. `frontend/src/pages/ProfessionalProfile.jsx`
10. `frontend/src/components/CategoryMenu.jsx`
11. `frontend/src/pages/Booking.jsx`
12. `frontend/src/pages/ClientDashboard.jsx`
13. `frontend/src/pages/Dashboard.jsx`
14. `frontend/src/pages/History.jsx`
15. `frontend/src/pages/SubscriptionSetup.jsx`
16. `frontend/src/pages/SubscriptionCallback.jsx`
17. `frontend/src/pages/SubscriptionCheckout.jsx`

### Para cada arquivo:

1. **Adicionar import no topo** (após os outros imports):
```javascript
import { API_URL } from '../config';
```

2. **Substituir todas as ocorrências de**:
```javascript
fetch('/api/...
```

**Por**:
```javascript
fetch(`${API_URL}/...
```

### Exemplo:

**ANTES:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

**DEPOIS:**
```javascript
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Verificação

Após atualizar, execute para verificar se ainda há chamadas antigas:

```bash
cd /home/hermano/projetos/faz_de_tudo/frontend/src
grep -r "fetch.*'/api/" . --include="*.jsx"
```

Se não retornar nada, está tudo atualizado!

## Arquivo já atualizado

✅ `frontend/src/pages/Login.jsx` - JÁ ATUALIZADO
