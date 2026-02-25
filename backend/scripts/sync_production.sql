-- =============================================================================
-- Script de atualização do banco de produção (Railway)
-- Sincroniza o schema com os models locais (models.py)
-- Data: 2026-02-16
-- =============================================================================
-- IMPORTANTE: Execute este script conectado ao banco de produção do Railway
-- Host: trolley.proxy.rlwy.net:11371 | DB: railway | User: postgres
-- =============================================================================

BEGIN;

-- ============================================
-- 1. Colunas faltantes na tabela subscriptions
-- ============================================

-- Cancelamento agendado (usuário pode usar até vencimento)
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS scheduled_cancellation_date DATE;

-- Mudança de plano agendada (para downgrades)
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS scheduled_plan_id INTEGER;

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS scheduled_plan_change_date DATE;

-- Controle de falhas de pagamento
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS payment_failure_count INTEGER DEFAULT 0;

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS last_payment_failure_date DATE;

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS grace_period_ends_at DATE;

-- ============================================
-- 2. Foreign key para scheduled_plan_id
-- ============================================

ALTER TABLE subscriptions
    ADD CONSTRAINT fk_subscriptions_scheduled_plan_id
    FOREIGN KEY (scheduled_plan_id)
    REFERENCES subscription_plans(id);

COMMIT;

-- ============================================
-- Verificação pós-execução
-- ============================================
-- Execute estas queries para confirmar:
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'subscriptions' ORDER BY ordinal_position;
--
-- SELECT * FROM alembic_version;
-- ============================================
