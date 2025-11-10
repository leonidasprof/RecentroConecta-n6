-- Adicionar coluna de senha na tabela employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- Adicionar índice no email para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
