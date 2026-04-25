## Why

O ContrataPro tem funcionalidades sólidas, mas o UX atual não comunica valor suficiente para converter visitantes em profissionais cadastrados nem inspirar confiança nos clientes na hora de contratar. A landing page, os cards de busca e o fluxo de onboarding do profissional precisam ser mais visuais, envolventes e orientados à ação para aumentar cadastros e contratações.

## What Changes

- **Hero da landing page** redesenhado com proposta de valor clara para profissionais e clientes, CTA duplo ("Quero contratar" / "Quero trabalhar") e prova social animada (número de profissionais, agendamentos realizados)
- **Onboarding guiado para profissionais** — fluxo de 3 etapas pós-cadastro com progresso visual (perfil → serviços → disponibilidade) para aumentar a taxa de completude do perfil
- **Cards de busca redesenhados** — foto maior, badge de plano (Destaque/Profissional Ativo), avaliação com estrelas, especialidades como chips e botão de agendamento direto no card
- **Perfil público do profissional aprimorado** — galeria de fotos de trabalhos realizados, seção "Sobre mim" destacada, métricas sociais (total de avaliações, tempo de resposta estimado)
- **Página de planos mais persuasiva** — comparação visual lado a lado com destaque no plano recomendado e depoimentos de profissionais que upgradaram

## Capabilities

### New Capabilities
- `professional-onboarding-flow`: Fluxo de boas-vindas pós-cadastro com stepper visual (3 etapas), dicas contextuais e barra de completude de perfil no dashboard
- `search-results-ux`: Cards de busca redesenhados com foto hero, badges de plano, avaliação inline e CTA de agendamento direto; filtros visuais aprimorados
- `landing-page-hero`: Hero section com proposta de valor dual (cliente/profissional), contador animado de prova social e CTA destacado

### Modified Capabilities
- `free-plan-limits`: Ajuste na exibição dos benefícios do plano Free na tela de planos para comunicar melhor o valor de upgrade sem parecer punitivo

## Impact

- `frontend/src/pages/Home.jsx` — redesign do hero e seção de prova social
- `frontend/src/pages/Search.jsx` — redesign dos cards de resultado
- `frontend/src/pages/ChangePlan.jsx` — layout de comparação de planos aprimorado
- `frontend/src/pages/Dashboard.jsx` — barra de completude de perfil + prompt de onboarding
- `frontend/src/pages/ProfessionalProfile.jsx` — galeria de fotos + métricas sociais
- Novos componentes: `OnboardingSteps.jsx`, `ProfileCompletionBar.jsx`, `PlanComparisonTable.jsx`
- Sem mudanças em backend ou banco de dados
