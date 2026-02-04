-- Migration: Add scheduled subscription fields
-- Data: 2026-02-04
-- Descricao: Adiciona campos para cancelamento agendado, downgrade agendado e controle de falhas

-- Cancelamento agendado (usuario pode usar ate vencimento)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS scheduled_cancellation_date DATE;

-- Mudanca de plano agendada (para downgrades)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS scheduled_plan_id INTEGER REFERENCES subscription_plans(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS scheduled_plan_change_date DATE;

-- Controle de falhas de pagamento
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_failure_count INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_payment_failure_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS grace_period_ends_at DATE;

-- Notificacao de renovacao enviada
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS renewal_reminder_sent_at DATE;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND column_name IN (
    'scheduled_cancellation_date',
    'scheduled_plan_id',
    'scheduled_plan_change_date',
    'payment_failure_count',
    'last_payment_failure_date',
    'grace_period_ends_at',
    'renewal_reminder_sent_at'
);
