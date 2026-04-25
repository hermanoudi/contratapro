## Context

O plano Free tem `max_services = 1` definido em `backend/seed_plans.py` e propagado para o banco via upsert. A guarda `check_can_create_service` em `dependencies.py` interpreta `None` como ilimitado — ou seja, a lógica já suporta a mudança; só o dado no banco precisa ser atualizado.

Estado atual:
```
SubscriptionPlan(slug="free", max_services=1, max_appointments_per_month=3, priority_in_search=0)
```

Estado alvo:
```
SubscriptionPlan(slug="free", max_services=None, max_appointments_per_month=3, priority_in_search=0)
```

## Goals / Non-Goals

**Goals:**
- Remover a restrição de quantidade de serviços para usuários Free
- Manter os demais limitadores: 3 agendamentos/mês e `priority_in_search = 0`
- Atualizar o banco de produção sem migration formal (upsert via seed)

**Non-Goals:**
- Alterar os planos Pro ou Premium
- Mudar a lógica de agendamentos ou visibilidade na busca
- Redesenhar a estrutura de planos

## Decisions

### Upsert via seed, não migration Alembic

O `seed_plans.py` já usa upsert por `slug` — basta alterar o valor e re-executar. Uma migration Alembic seria overhead desnecessário para uma mudança de dado de configuração, não de schema.

Alternativa considerada: migration `UPDATE subscription_plans SET max_services = NULL WHERE slug = 'free'` — funciona, mas cria um arquivo de migration para algo que já tem mecanismo próprio.

### Nenhuma mudança de código backend

`check_can_create_service` em `dependencies.py` já trata `None` como sem limite (fluxo de early return). Zero risco de regressão no backend.

### Verificação de frontend necessária

É preciso auditar o frontend para mensagens do tipo "você pode cadastrar até X serviços no plano Free". Se existirem, devem ser removidas ou atualizadas para refletir o novo comportamento.

## Risks / Trade-offs

- **[Risco baixo] Profissionais Free cadastram muitos serviços e sobrecarregam listagens** → Improvável no curto prazo; monitorar se necessário. O limite de 3 agendamentos/mês naturalmente desincentiva abuso.
- **[Risco mínimo] Re-execução do seed em produção** → O upsert é idempotente; não afeta dados de usuários, só o registro do plano.

## Migration Plan

1. Alterar `max_services` de `1` para `None` em `backend/seed_plans.py`
2. Executar `railway run python seed_plans.py` em produção
3. Verificar no banco: `SELECT max_services FROM subscription_plans WHERE slug = 'free'` deve retornar `NULL`
4. Auditar e corrigir frontend se houver exibição do limite de serviços
5. Rollback: alterar de volta para `1` e re-executar o seed

## Open Questions

- Existe alguma tela no frontend que exibe o limite de serviços do plano atual ao profissional? (a auditar)
