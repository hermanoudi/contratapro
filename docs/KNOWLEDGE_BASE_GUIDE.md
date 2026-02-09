# Guia de Base de Conhecimento - ContrataPro

Este documento organiza os arquivos markdown do projeto por persona e indica quais estao atualizados e prontos para uso em bases de conhecimento (NotebookLM, RAG, etc).

---

## Legenda de Status

| Status | Significado |
|--------|-------------|
| ✅ **USAR** | Atualizado e pronto para uso |
| ⚠️ **REVISAR** | Util mas pode precisar de atualizacao |
| ❌ **NAO USAR** | Desatualizado ou interno |
| 🆕 **CRIAR** | Documento recomendado que nao existe |

---

## 1. CLIENTES (Usuarios Finais)

### Documentos Prontos

| Arquivo | Status | Uso |
|---------|--------|-----|
| `docs/User_Guide_cliente.md` | ✅ **USAR** | Guia completo do cliente - perfeito para chatbot |
| `CATEGORIAS_SERVICOS.md` | ✅ **USAR** | Lista de servicos disponiveis na plataforma |

### Conteudo Sugerido para Criar

| Documento | Conteudo |
|-----------|----------|
| 🆕 `docs/FAQ_cliente.md` | Perguntas frequentes de clientes |
| 🆕 `docs/Marketing_cliente.md` | Beneficios, proposta de valor, casos de uso |

### Topicos para RAG de Atendimento ao Cliente

1. Como me cadastrar na plataforma
2. Como buscar profissionais na minha cidade
3. Como agendar um servico
4. Como cancelar um agendamento
5. Formas de contato com o profissional
6. Seguranca e verificacao de profissionais
7. Politica de precos (podem variar)

---

## 2. PROFISSIONAIS

### Documentos Prontos

| Arquivo | Status | Uso |
|---------|--------|-----|
| `docs/User_Guide_pro.md` | ✅ **USAR** | Guia completo do profissional - perfeito para chatbot |
| `CATEGORIAS_SERVICOS.md` | ✅ **USAR** | Categorias disponiveis para cadastro |

### Conteudo Sugerido para Criar

| Documento | Conteudo |
|-----------|----------|
| 🆕 `docs/FAQ_profissional.md` | Perguntas frequentes de profissionais |
| 🆕 `docs/Marketing_profissional.md` | Beneficios de ser parceiro, casos de sucesso |
| 🆕 `docs/Planos_Detalhados.md` | Comparativo detalhado dos planos |

### Topicos para RAG de Atendimento ao Profissional

1. Como me cadastrar como profissional
2. Quais planos existem e seus precos
3. Como configurar meus servicos
4. Como configurar minha agenda
5. Como bloquear horarios
6. Como funciona a assinatura
7. Como cancelar minha assinatura
8. Dicas para ter mais agendamentos
9. Como ver meu perfil publico

---

## 3. DESENVOLVEDORES (Onboarding Tecnico)

### Documentos Essenciais

| Arquivo | Status | Uso |
|---------|--------|-----|
| `README.md` | ⚠️ **REVISAR** | Visao geral - nome antigo "Chama Eu" |
| `CLAUDE.md` | ✅ **USAR** | Instrucoes para AI assistants |
| `DESENVOLVIMENTO_LOCAL.md` | ✅ **USAR** | Setup do ambiente local |
| `PRD_Faz_de_tudo_Plataforma.md` | ⚠️ **REVISAR** | PRD original - base para entender o projeto |

### Documentos de Arquitetura

| Arquivo | Status | Uso |
|---------|--------|-----|
| `IMPLEMENTACAO_SISTEMA_ASSINATURAS.md` | ✅ **USAR** | Sistema de assinaturas e pagamentos |
| `IMPLEMENTACAO_PLANOS_CODIGO.md` | ✅ **USAR** | Codigo dos planos |
| `backend/MIGRATIONS.md` | ✅ **USAR** | Como rodar migrations |

### Documentos de Deploy

| Arquivo | Status | Uso |
|---------|--------|-----|
| `DEPLOY_PRODUCTION_GUIDE.md` | ✅ **USAR** | Guia completo de producao |
| `RAILWAY_CLI_SETUP.md` | ✅ **USAR** | Setup do Railway |
| `SETUP_FRONTEND_VERCEL.md` | ✅ **USAR** | Deploy do frontend |

### Documentos de Integracao

| Arquivo | Status | Uso |
|---------|--------|-----|
| `GUIA_CONFIGURACAO_MERCADOPAGO.md` | ✅ **USAR** | Integracao Mercado Pago |
| `dados_teste/mercado_pago.md` | ✅ **USAR** | Dados de teste MP |

### Documentos Internos (NAO incluir em knowledge base publica)

| Arquivo | Status | Motivo |
|---------|--------|--------|
| `SEGURANCA_CHECKLIST.md` | ❌ **NAO USAR** | Informacoes sensiveis |
| `.claude/` folder | ❌ **NAO USAR** | Configuracoes internas |
| `backend/.env` | ❌ **NAO USAR** | Credenciais |

---

## 4. MARKETING DIGITAL

### Documentos Uteis

| Arquivo | Status | Uso |
|---------|--------|-----|
| `CATEGORIAS_SERVICOS.md` | ✅ **USAR** | Lista de servicos para posts |
| `docs/User_Guide_cliente.md` | ✅ **USAR** | Features para destacar |
| `docs/User_Guide_pro.md` | ✅ **USAR** | Beneficios para profissionais |
| `PRD_Faz_de_tudo_Plataforma.md` | ⚠️ **REVISAR** | Proposta de valor original |

### Conteudo Sugerido para Criar

| Documento | Conteudo |
|-----------|----------|
| 🆕 `docs/Marketing_Storybook.md` | Narrativas, casos de uso, jornadas |
| 🆕 `docs/Social_Media_Pack.md` | Templates de posts, hashtags, CTAs |
| 🆕 `docs/Pitch_Deck.md` | Apresentacao da plataforma |
| 🆕 `docs/Brand_Guide.md` | Tom de voz, cores, personalidade |

### Ideias de Conteudo por Categoria

**Para Instagram/TikTok:**
- "5 dicas para encontrar o profissional ideal"
- "Como funciona o agendamento online"
- "Profissional: aumente seus clientes com a ContrataPro"
- "Antes vs Depois: agenda na plataforma"

**Para Blog/SEO:**
- Guias por categoria (ex: "Como contratar um eletricista")
- Dicas para profissionais
- Historias de sucesso

---

## 5. ARQUIVOS NAO RECOMENDADOS

Estes arquivos sao desatualizados, temporarios ou muito tecnicos:

| Arquivo | Motivo |
|---------|--------|
| `CORRECAO_BACK_URL.md` | Fix temporario |
| `REINICIAR_FRONTEND.md` | Comando simples |
| `INICIO_RAPIDO_NGROK.md` | Setup local especifico |
| `CORRECAO_NGROK_HOST.md` | Fix temporario |
| `TEST_API.md` | Testes internos |
| `TESTE_*.md` | Documentos de teste |
| `backlog_prd/backlog.md` | Backlog desatualizado |
| `.playwright-mcp/` | Snapshots de teste |

---

## Recomendacao por Caso de Uso

### NotebookLM para Atendimento ao Cliente
```
docs/User_Guide_cliente.md
CATEGORIAS_SERVICOS.md
```

### NotebookLM para Atendimento ao Profissional
```
docs/User_Guide_pro.md
CATEGORIAS_SERVICOS.md
```

### NotebookLM para Onboarding de Desenvolvedores
```
README.md (revisar nome)
CLAUDE.md
DESENVOLVIMENTO_LOCAL.md
PRD_Faz_de_tudo_Plataforma.md
IMPLEMENTACAO_SISTEMA_ASSINATURAS.md
DEPLOY_PRODUCTION_GUIDE.md
GUIA_CONFIGURACAO_MERCADOPAGO.md
```

### NotebookLM para Marketing
```
docs/User_Guide_cliente.md
docs/User_Guide_pro.md
CATEGORIAS_SERVICOS.md
PRD_Faz_de_tudo_Plataforma.md
```

---

## Proximos Passos

1. **Atualizar README.md** - Corrigir nome "Chama Eu" para "ContrataPro"
2. **Criar FAQ_cliente.md** - Perguntas frequentes
3. **Criar FAQ_profissional.md** - Perguntas frequentes
4. **Criar Marketing_Storybook.md** - Narrativas para redes sociais
5. **Criar Pitch_Deck.md** - Apresentacao da plataforma

---

*Documento criado em: Fevereiro 2026*
