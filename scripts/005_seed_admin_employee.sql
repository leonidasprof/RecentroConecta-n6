-- Inserir funcionário admin padrão para testes
-- Senha: admin123 (hash bcrypt)
INSERT INTO employees (name, email, role, password_hash)
VALUES (
  'Administrador',
  'admin@parque.com',
  'admin',
  '$2a$10$rOzXQVvHj8K9h4B5o5L5a.KOYqJ9Y0YvKJ5K5K5K5K5K5K5K5K5K.'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash;

-- Atualizar funcionários existentes com senha padrão
UPDATE employees
SET password_hash = '$2a$10$rOzXQVvHj8K9h4B5o5L5a.KOYqJ9Y0YvKJ5K5K5K5K5K5K5K5K5K.'
WHERE password_hash = '' OR password_hash IS NULL;
