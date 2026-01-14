# 🔄 Como Reiniciar o Frontend Corretamente

## ⚠️ IMPORTANTE: Apliquei correção nova no vite.config.js

Acabei de atualizar o `vite.config.js` com a configuração específica para o ngrok.

## 📝 Você PRECISA fazer:

### 1. Pare o frontend atual
No terminal onde o frontend está rodando:
- Pressione `Ctrl+C`

### 2. Limpe o cache do Vite
```bash
cd /home/hermano/projetos/faz_de_tudo/frontend
rm -rf node_modules/.vite
```

### 3. Reinicie o frontend
```bash
npm run dev
```

### 4. Teste
Acesse: `https://vaguely-semifinished-mathilda.ngrok-free.dev`

---

## 🆘 Se AINDA DER ERRO "Blocked request"

Execute este comando completo:

```bash
cd /home/hermano/projetos/faz_de_tudo/frontend && \
rm -rf node_modules/.vite && \
npm run dev -- --force
```

O `--force` força o Vite a recarregar tudo do zero.

---

## ✅ O que deve aparecer no terminal

Quando o Vite iniciar, você deve ver algo como:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://0.0.0.0:5173/
➜  Network: http://192.168.x.x:5173/
```

A linha **Network: http://0.0.0.0:5173/** indica que está aceitando conexões externas (ngrok).

---

## 🔍 Diagnóstico

Se o erro persistir, me mande:

```bash
# 1. Ver configuração atual
cat frontend/vite.config.js

# 2. Ver processos rodando
ps aux | grep vite

# 3. Ver porta em uso
lsof -i :5173
```
