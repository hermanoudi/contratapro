## ADDED Requirements

### Requirement: Hero section com proposta de valor dual e CTA duplo
A landing page SHALL exibir um hero section redesenhado com headline principal clara, subheadline explicativa e dois CTAs distintos: "Encontrar profissional" (para clientes) e "Quero oferecer serviços" (para profissionais). Os dois CTAs SHALL ter hierarquia visual diferente (primário/secundário) e estar visíveis acima da dobra em todos os viewports.

#### Scenario: Cliente vê CTA primário de busca
- **WHEN** um visitante não autenticado acessa a landing page
- **THEN** o botão "Encontrar profissional" é exibido com cor primária (filled) e o botão "Quero oferecer serviços" como botão outline, ambos visíveis sem scroll

#### Scenario: Profissional clica no CTA de cadastro
- **WHEN** o visitante clica em "Quero oferecer serviços"
- **THEN** o sistema navega para `/cadastro/profissional`

### Requirement: Contador animado de prova social no hero
O hero SHALL exibir métricas de prova social animadas (contagem progressiva ao entrar na viewport): número de profissionais cadastrados e número de agendamentos realizados. Os valores SHALL ser buscados do endpoint `/api/stats/public` com fallback para valores mínimos hardcoded se o endpoint falhar ou retornar em > 2s.

#### Scenario: Contadores animam ao carregar a página
- **WHEN** o visitante acessa a landing page e o hero entra na viewport
- **THEN** os contadores de profissionais e agendamentos animam de 0 até o valor real com duração de 1.5s usando framer-motion

#### Scenario: Fallback quando API não responde
- **WHEN** o endpoint `/api/stats/public` retorna erro ou não responde em 2 segundos
- **THEN** os contadores exibem valores mínimos hardcoded sem quebrar o layout (ex: "100+ profissionais", "500+ agendamentos")

### Requirement: Seção de como funciona para profissionais
A landing page SHALL incluir uma seção "Como funciona para profissionais" com 3 passos ilustrados (Cadastre-se → Monte seu perfil → Receba clientes) imediatamente abaixo do hero, visando aumentar a taxa de cadastro de profissionais.

#### Scenario: Seção de passos visível abaixo do hero
- **WHEN** o visitante faz scroll além do hero
- **THEN** a seção "Como funciona" exibe 3 cards com ícone, número do passo, título e descrição curta, com animação de entrada ao entrar na viewport
