## 1. Backend

- [x] 1.1 Alterar `max_services` de `1` para `None` no plano Free em `backend/seed_plans.py`

## 2. Frontend

- [x] 2.1 Auditar o frontend (pages e components) por qualquer texto ou lógica que exiba o limite de serviços do plano Free ao usuário
- [x] 2.2 Remover ou atualizar mensagens encontradas que mencionem o limite de serviços do Free

## 3. Deploy e Validação

- [x] 3.1 Executar `railway run python seed_plans.py` em produção para atualizar o registro do plano Free
- [x] 3.2 Verificar no banco de produção que `max_services IS NULL` para o plano Free
- [x] 3.3 Testar manualmente: criar segundo serviço com conta Free e confirmar que não retorna 403
