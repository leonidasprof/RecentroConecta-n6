-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE park_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sculptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sculpture_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas para park_settings (todos podem ler, apenas autenticados podem atualizar)
CREATE POLICY "Todos podem ler configurações do parque"
  ON park_settings FOR SELECT
  USING (true);

CREATE POLICY "Apenas autenticados podem atualizar configurações"
  ON park_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Políticas para sculptures (todos podem ler, apenas autenticados podem modificar)
CREATE POLICY "Todos podem ler esculturas"
  ON sculptures FOR SELECT
  USING (true);

CREATE POLICY "Apenas autenticados podem inserir esculturas"
  ON sculptures FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem atualizar esculturas"
  ON sculptures FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem deletar esculturas"
  ON sculptures FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para employees (apenas autenticados podem acessar)
CREATE POLICY "Apenas autenticados podem ler funcionários"
  ON employees FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem inserir funcionários"
  ON employees FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem atualizar funcionários"
  ON employees FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem deletar funcionários"
  ON employees FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para partners (apenas autenticados podem acessar)
CREATE POLICY "Apenas autenticados podem ler parceiros"
  ON partners FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem inserir parceiros"
  ON partners FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem atualizar parceiros"
  ON partners FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem deletar parceiros"
  ON partners FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para tickets (todos podem criar, apenas autenticados podem ler todos)
CREATE POLICY "Todos podem criar ingressos"
  ON tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Apenas autenticados podem ler todos os ingressos"
  ON tickets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas autenticados podem atualizar ingressos"
  ON tickets FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Políticas para sculpture_visits (todos podem registrar visitas, apenas autenticados podem ler)
CREATE POLICY "Todos podem registrar visitas"
  ON sculpture_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Apenas autenticados podem ler visitas"
  ON sculpture_visits FOR SELECT
  USING (auth.role() = 'authenticated');

-- Políticas para satisfaction_ratings (todos podem avaliar, apenas autenticados podem ler)
CREATE POLICY "Todos podem avaliar"
  ON satisfaction_ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Apenas autenticados podem ler avaliações"
  ON satisfaction_ratings FOR SELECT
  USING (auth.role() = 'authenticated');
