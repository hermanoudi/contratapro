## Context

O ContrataPro é um marketplace com FastAPI + React. O frontend usa styled-components, framer-motion e lucide-react. Todas as mudanças são puramente frontend — nenhum endpoint novo é necessário. As páginas-chave a melhorar são `Home.jsx` (landing), `Search.jsx` (busca), `Dashboard.jsx` (painel do profissional) e `ChangePlan.jsx` (planos). O projeto já tem CSS variables para theming (`--primary`, `--bg-primary`, etc.) e breakpoints responsivos.

## Goals / Non-Goals

**Goals:**
- Aumentar a taxa de conversão de visitantes → profissionais cadastrados via hero mais persuasivo
- Aumentar completude de perfil de profissionais via onboarding guiado
- Melhorar a confiança do cliente na busca via cards mais informativos
- Tornar o upgrade de plano mais atraente visualmente

**Non-Goals:**
- Mudanças no backend ou banco de dados
- Novo sistema de design (manter styled-components + CSS variables existentes)
- Redesign completo de todas as páginas
- Dark mode ou troca de tema

## Decisions

### Decisão 1: Componentes novos vs. modificação inline
**Escolha**: Extrair componentes reutilizáveis (`OnboardingSteps`, `ProfileCompletionBar`, `PlanComparisonTable`) em vez de embutir tudo em páginas existentes.
**Rationale**: As páginas `Dashboard.jsx` (73.8K) e `Home.jsx` (50.4K) já são grandes demais. Novos componentes mantêm a responsabilidade clara e são testáveis isoladamente.
**Alternativa considerada**: Adicionar inline em cada página — descartado por aumentar ainda mais arquivos já grandes.

### Decisão 2: Prova social via dados reais da API
**Escolha**: Exibir contadores reais (nº de profissionais, agendamentos) via endpoint GET `/api/stats/public` existente (ou novo endpoint mínimo).
**Rationale**: Números reais são mais críveis que valores fixos. Se o endpoint não existir, usar valores mínimos hardcoded como fallback aceitável para lançamento.
**Alternativa considerada**: Valores estáticos — descartado por parecer falso após crescimento.

### Decisão 3: Onboarding como modal/overlay vs. página separada
**Escolha**: Overlay flutuante no dashboard (não página separada), com estado salvo em `localStorage` para não reaparecer após completar.
**Rationale**: Mantém o profissional no contexto do dashboard; não exige nova rota. Simples de implementar sem risco de regressão no fluxo de login.
**Alternativa considerada**: Página `/onboarding` dedicada — descartado por exigir mudança no fluxo de redirecionamento pós-login.

### Decisão 4: Cards de busca — layout
**Escolha**: Card com foto hero (aspect-ratio 4:3), badge de plano no canto superior direito, linha de avaliação, chips de especialidades (max 3) e botão CTA inline.
**Rationale**: Maximiza informação visual sem aumentar altura do card, mantendo densidade de resultados na tela.

## Risks / Trade-offs

- **[Risco] Home.jsx já tem 50K** → O hero redesenhado pode aumentar ainda mais. Mitigação: extrair `HeroSection` como componente separado em `components/HeroSection.jsx`.
- **[Risco] Dados de prova social indisponíveis** → Fallback: valores mínimos hardcoded ("Mais de 100 profissionais"). Mitigação: adicionar endpoint `/api/stats/public` simples.
- **[Risco] Onboarding intrusivo para profissionais já ativos** → Mitigação: mostrar apenas se `localStorage.getItem('onboarding_dismissed')` não estiver setado E perfil estiver incompleto.
- **[Trade-off] Cards maiores na busca** → Menos resultados visíveis sem scroll. Decisão: aceitar; a qualidade da informação supera a quantidade visível.

## Migration Plan

1. Todas as mudanças são aditivas — sem breaking changes de API ou rota
2. Deploy via Vercel normal (push para `main`)
3. Rollback: reverter commit no Vercel dashboard em < 1 minuto se necessário
4. Sem migrações de banco de dados
