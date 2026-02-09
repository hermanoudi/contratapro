-- ============================================================
-- Migration: Sistema de Avaliacao de Prestadores
-- Data: 2026-02-09
-- Alembic revision: a1b2c3d4e5f6
-- ============================================================

-- 1. Tabela review_tokens
CREATE TABLE IF NOT EXISTS review_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(36) NOT NULL UNIQUE,
    appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_review_tokens_token ON review_tokens(token);
CREATE INDEX IF NOT EXISTS ix_review_tokens_id ON review_tokens(id);

-- 2. Tabela reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id),
    professional_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    customer_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_reviews_professional_id ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS ix_reviews_id ON reviews(id);

-- 3. Campos denormalizados no User
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating FLOAT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 4. Registrar na tabela de versao do Alembic
INSERT INTO alembic_version (version_num)
VALUES ('a1b2c3d4e5f6')
ON CONFLICT (version_num) DO NOTHING;

-- Se precisa atualizar de versao anterior:
-- UPDATE alembic_version SET version_num = 'a1b2c3d4e5f6' WHERE version_num = '8b9c0d1e2f3a';
