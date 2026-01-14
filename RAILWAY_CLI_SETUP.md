# 🚂 Railway CLI - Setup e Uso

## Instalar Railway CLI

```bash
# Via npm (recomendado)
npm install -g @railway/cli

# Ou via script
curl -fsSL https://railway.app/install.sh | sh
```

## Fazer Login

```bash
railway login
```

Isso abrirá o navegador para você fazer login.

## Vincular ao Projeto

```bash
cd /home/hermano/projetos/faz_de_tudo/backend
railway link
```

Selecione:
- Project: **contratapro**
- Environment: **production**

## Executar Seeds

```bash
# Executar comando no Railway
railway run python run_seeds.py

# Ou abrir shell interativo
railway shell
# Depois execute: python run_seeds.py
```

## Outros Comandos Úteis

```bash
# Ver logs em tempo real
railway logs -f

# Ver variáveis de ambiente
railway variables

# Conectar ao PostgreSQL
railway connect postgres

# Executar qualquer comando
railway run <comando>
```

---

**Última atualização**: 2026-01-14
