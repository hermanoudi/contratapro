## ADDED Requirements

### Requirement: Profissional Free pode cadastrar serviços sem limite de quantidade
O sistema SHALL permitir que profissionais no plano Free cadastrem qualquer número de serviços, sem restrição de quantidade. O campo `max_services` do plano Free SHALL ser `NULL` (ilimitado).

#### Scenario: Cadastro do segundo serviço por profissional Free
- **WHEN** um profissional com plano Free tenta cadastrar um segundo serviço
- **THEN** o sistema SHALL aceitar o cadastro normalmente, sem retornar erro 403

#### Scenario: Cadastro de múltiplos serviços por profissional Free
- **WHEN** um profissional com plano Free já possui 5 serviços cadastrados e tenta cadastrar um sexto
- **THEN** o sistema SHALL aceitar o cadastro sem restrição de quantidade

### Requirement: Plano Free mantém limite de 3 agendamentos por mês
O sistema SHALL continuar aplicando o limite de 3 agendamentos por mês para profissionais no plano Free, independente da quantidade de serviços cadastrados.

#### Scenario: Bloqueio após 3 agendamentos no mês
- **WHEN** um profissional Free já recebeu 3 agendamentos no mês corrente e um cliente tenta agendar um novo serviço
- **THEN** o sistema SHALL retornar erro 403 indicando que o limite mensal foi atingido

### Requirement: Plano Free mantém prioridade inferior na busca
O sistema SHALL continuar exibindo profissionais Free com `priority_in_search = 0`, abaixo de profissionais Pro (1) e Premium (2) nos resultados de busca.

#### Scenario: Ordenação na busca com profissionais de planos diferentes
- **WHEN** a busca retorna profissionais Free, Pro e Premium para o mesmo serviço
- **THEN** o sistema SHALL ordenar com Premium primeiro, Pro em seguida, e Free por último (entre iguais, critérios secundários como avaliação se aplicam)

### Requirement: Página de planos exibe comparação visual lado a lado com plano recomendado destacado
A página de comparação de planos (`ChangePlan.jsx`) SHALL exibir os planos em cards lado a lado com um componente `PlanComparisonTable`. O plano Pro SHALL ser marcado como "Mais Popular" com badge visual destacado e leve elevação (box-shadow maior). A lista de benefícios SHALL usar checkmarks verdes para recursos incluídos e ícones neutros (sem X vermelho) para recursos não incluídos no plano Free, comunicando o valor sem conotação punitiva.

#### Scenario: Plano Pro destacado como recomendado
- **WHEN** o profissional acessa a página de planos
- **THEN** o card do plano Pro é exibido com badge "Mais Popular", border colorida e box-shadow maior que os demais cards

#### Scenario: Benefícios do Free exibidos de forma neutra
- **WHEN** o profissional visualiza a coluna do plano Free na comparação
- **THEN** recursos não incluídos (ex: prioridade na busca, badge de destaque) são exibidos com ícone de traço neutro (—) em vez de X vermelho, sem texto negativo

#### Scenario: Benefício de agendamentos ilimitados destacado nos planos pagos
- **WHEN** o profissional visualiza os planos Pro e Premium na comparação
- **THEN** o item "Agendamentos ilimitados" é exibido em destaque (negrito ou cor primária) para comunicar o principal diferencial em relação ao plano Free
