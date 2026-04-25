## Why

O plano Free limita profissionais a 1 serviço cadastrado, tornando seus perfis incompletos comparados a concorrentes pagantes — o que reduz as chances de receber agendamentos e enfraquece o argumento para upgrade. O limite de 3 agendamentos/mês e a posição inferior na busca já são alavancas de conversão suficientes; o limite de serviços cria fricção no momento errado (antes do primeiro cliente) sem benefício proporcional.

## What Changes

- O campo `max_services` do plano Free passa de `1` para `null` (ilimitado)
- Profissionais no plano Free poderão cadastrar quantos serviços quiserem
- Os demais limitadores do Free permanecem inalterados: 3 agendamentos/mês e `priority_in_search = 0`
- O guard `check_can_create_service` em `dependencies.py` já trata `None` como ilimitado — nenhuma mudança de lógica necessária nele

## Capabilities

### New Capabilities

- `free-plan-limits`: Especificação das restrições vigentes do plano Free (agendamentos e prioridade de busca), documentando a remoção do limite de serviços como decisão de produto.

### Modified Capabilities

<!-- Nenhuma spec existente a modificar -->

## Impact

- **`backend/seed_plans.py`**: `max_services` do plano Free muda de `1` para `None`
- **Banco de produção**: requer re-execução do seed (upsert por slug) para atualizar o registro existente
- **`backend/app/dependencies.py`**: nenhuma mudança — `check_can_create_service` já trata `None` como sem limite
- **Frontend**: verificar se alguma tela exibe o limite de serviços do plano atual ao usuário (ex: página de planos, onboarding)
