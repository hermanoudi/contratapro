# ⚡ Setup Rápido - Railway Database

## 🎯 Problema Identificado

✅ Banco de dados criado mas **sem tabelas**
✅ Solução implementada: criar tabelas automaticamente na inicialização

---

## 🚀 Solução Rápida (3 Passos)

### 1️⃣ Fazer Deploy com Auto-Create Tables

```bash
cd /home/hermano/projetos/faz_de_tudo

git add backend/app/main.py backend/create_tables.py
git commit -m "feat: criar tabelas automaticamente na inicialização"
git push origin main
```

**O que acontece**: Railway faz rebuild → App inicia → Tabelas criadas automaticamente

### 2️⃣ Verificar Logs do Deploy

No Railway Dashboard:
- Backend → Deployments → Ver logs
- Procure por:
```
🚀 Iniciando aplicação...
📊 Criando tabelas do banco de dados...
✅ Tabelas criadas com sucesso!
```

### 3️⃣ Popular com Categorias

```bash
railway run python run_seeds.py
```

**Resultado esperado**:
```
==================================================
EXECUTANDO SEEDS DO BANCO DE DADOS
==================================================
Iniciando seed de categorias...
✓ 33 categorias inseridas com sucesso!
==================================================
```

---

## ✅ Verificação Final

Acesse no navegador:
```
https://seu-backend.railway.app/categories/
```

Deve retornar JSON com 33 categorias.

---

## 🆘 Se Precisar Criar Tabelas AGORA (Sem Deploy)

Via Railway Shell:

```bash
# Abrir shell no Railway Dashboard
# Backend → Deployments → ⋮ → Open Shell

python create_tables.py
python run_seeds.py
```

---

## 📚 Documentação Completa

Ver: [`SETUP_BANCO_RAILWAY.md`](SETUP_BANCO_RAILWAY.md)

---

**Última atualização**: 2026-01-14
