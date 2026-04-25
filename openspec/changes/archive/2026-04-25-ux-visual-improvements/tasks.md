## 1. Landing Page Hero (Home.jsx)

- [x] 1.1 Extrair `HeroSection` como componente separado em `frontend/src/components/HeroSection.jsx`
- [x] 1.2 Redesenhar hero com headline principal, subheadline e dois CTAs ("Encontrar profissional" / "Quero oferecer serviços") com hierarquia visual primário/outline
- [x] 1.3 Adicionar endpoint `GET /api/stats/public` no backend retornando `{professionals_count, appointments_count}`
- [x] 1.4 Implementar hook `usePublicStats()` com fetch ao endpoint e fallback hardcoded após 2s de timeout
- [x] 1.5 Criar contadores animados com framer-motion (contagem de 0 até valor real em 1.5s) ativados ao entrar na viewport via `IntersectionObserver`
- [x] 1.6 Adicionar seção "Como funciona para profissionais" com 3 cards (ícone + passo + título + descrição), com animação de entrada via framer-motion

## 2. Cards de Busca Redesenhados (Search.jsx)

- [x] 2.1 Redesenhar card de profissional com foto hero (aspect-ratio 4:3, object-fit cover), badge de plano no canto superior direito e avaliação inline
- [x] 2.2 Implementar lógica de badge: Premium → badge dourado "Destaque", Pro → badge azul "Profissional Ativo", Free → sem badge
- [x] 2.3 Adicionar chips de especialidades/serviços no card (máx 3, resto truncado com "+N")
- [x] 2.4 Adicionar botão "Agendar" como CTA inline no card com navegação para `/booking/<id>`
- [x] 2.5 Redesenhar filtros como chips horizontais com scroll no mobile (viewport < 768px)
- [x] 2.6 Implementar estado visual de filtro ativo (cor primária + X de remoção individual)

## 3. Onboarding de Profissionais (Dashboard.jsx)

- [x] 3.1 Criar componente `ProfileCompletionBar.jsx` que calcula % de completude (foto, bio, cidade, serviço) e exibe barra de progresso com itens pendentes linkáveis
- [x] 3.2 Integrar `ProfileCompletionBar` no topo do `Dashboard.jsx`, visível apenas quando completude < 100%
- [x] 3.3 Criar componente `OnboardingSteps.jsx` com overlay de 3 etapas (perfil → serviços → disponibilidade), botão "Agora não" e botão X
- [x] 3.4 Implementar lógica de exibição do overlay: verificar `localStorage.onboarding_dismissed_<userId>` e completude < 100%
- [x] 3.5 Implementar persistência do dismiss em localStorage e fechamento automático ao completar todas as etapas (após 3s com mensagem de parabéns)

## 4. Comparação de Planos (ChangePlan.jsx)

- [x] 4.1 Criar componente `PlanComparisonTable.jsx` com cards lado a lado e badge "Mais Popular" no plano Pro (border colorida + box-shadow maior)
- [x] 4.2 Substituir lista de benefícios atual por tabela comparativa usando checkmarks verdes (✓) para recursos incluídos e traço neutro (—) para não incluídos no Free (sem X vermelho)
- [x] 4.3 Destacar o item "Agendamentos ilimitados" em negrito/cor primária nas colunas Pro e Premium
- [x] 4.4 Integrar `PlanComparisonTable` em `ChangePlan.jsx` substituindo o layout atual de cards
