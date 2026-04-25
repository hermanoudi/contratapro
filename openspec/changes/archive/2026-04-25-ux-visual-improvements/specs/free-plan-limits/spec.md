## ADDED Requirements

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
