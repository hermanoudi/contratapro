-- Migration: Adicionar plan_id e trial_ends_at à tabela subscriptions
-- Data: 2026-01-14

-- 1. Adicionar coluna plan_id (relacionamento com subscription_plans)
ALTER TABLE subscriptions
ADD COLUMN plan_id INTEGER REFERENCES subscription_plans(id);

-- 2. Adicionar coluna trial_ends_at (data de expiração do trial)
ALTER TABLE subscriptions
ADD COLUMN trial_ends_at DATE;

-- 3. Criar índice para melhorar performance de queries
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_trial_ends_at ON subscriptions(trial_ends_at);

-- 4. Comentários para documentação
COMMENT ON COLUMN subscriptions.plan_id IS 'ID do plano escolhido (Trial, Basic ou Premium)';
COMMENT ON COLUMN subscriptions.trial_ends_at IS 'Data de expiração do período trial (15 dias)';

-- Rollback (se necessário):
-- ALTER TABLE subscriptions DROP COLUMN plan_id;
-- ALTER TABLE subscriptions DROP COLUMN trial_ends_at;
-- DROP INDEX idx_subscriptions_plan_id;
-- DROP INDEX idx_subscriptions_trial_ends_at;
