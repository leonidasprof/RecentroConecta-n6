-- Permitir leitura pública de parceiros para agendamentos
-- Os visitantes precisam ver a lista de parceiros para fazer agendamentos

CREATE POLICY "Public can read partners"
  ON partners FOR SELECT
  USING (true);

-- Nota: Esta política permite que qualquer pessoa leia a lista de parceiros,
-- mas apenas autenticados ainda podem criar/editar/deletar
