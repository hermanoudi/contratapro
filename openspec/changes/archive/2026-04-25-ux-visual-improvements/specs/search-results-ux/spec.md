## ADDED Requirements

### Requirement: Card de profissional redesenhado com foto hero e badge de plano
Cada card de resultado de busca SHALL exibir: foto de perfil em formato hero (aspect-ratio 4:3, object-fit cover), badge de plano no canto superior direito (label do campo `badge_label` do plano), avaliação média com estrelas e total de avaliações, nome e categoria, até 3 chips de especialidades/serviços e botão "Agendar" como CTA principal inline no card.

#### Scenario: Card exibe badge de plano Premium
- **WHEN** o resultado de busca inclui um profissional com plano Premium (`badge_label = "Destaque"`)
- **THEN** o card exibe um badge dourado/amarelo com o texto "Destaque" no canto superior direito da foto

#### Scenario: Card exibe badge de plano Pro
- **WHEN** o resultado inclui profissional com plano Pro (`badge_label = "Profissional Ativo"`)
- **THEN** o card exibe um badge azul com o texto "Profissional Ativo"

#### Scenario: Card de profissional sem plano pago não exibe badge
- **WHEN** o resultado inclui profissional no plano Free
- **THEN** o card NÃO exibe nenhum badge de plano

#### Scenario: CTA de agendamento direto do card
- **WHEN** o usuário clica em "Agendar" no card de um profissional
- **THEN** o sistema navega para `/booking/<professional_id>` sem exigir que o usuário abra o perfil completo primeiro

### Requirement: Filtros de busca visuais aprimorados
A página de busca SHALL exibir filtros como chips horizontais roláveis no mobile (avaliação mínima, tipo de serviço, disponibilidade) em vez de dropdowns ocultos. Os filtros ativos SHALL ser visualmente destacados e ter botão individual de remoção (X).

#### Scenario: Filtros exibidos como chips no mobile
- **WHEN** o usuário acessa a página de busca em viewport < 768px
- **THEN** os filtros são renderizados como chips horizontais em carrossel scrollável, não como dropdowns empilhados

#### Scenario: Filtro ativo destacado visualmente
- **WHEN** o usuário seleciona um filtro (ex: avaliação mínima 4 estrelas)
- **THEN** o chip desse filtro muda para cor primária com texto branco e exibe um "×" para remover
