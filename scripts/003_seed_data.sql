-- Inserir dados de exemplo para esculturas
INSERT INTO sculptures (name, description, curiosity) VALUES
('Coluna de Cristal', 'Uma impressionante coluna de cerâmica com detalhes em azul e branco', 'Esta escultura foi uma das primeiras obras de Brennand no parque'),
('Torre dos Ventos', 'Torre alta decorada com elementos que representam os quatro ventos', 'A torre muda de som dependendo da direção do vento'),
('Jardim das Esculturas', 'Conjunto de esculturas que representam figuras mitológicas', 'Cada figura tem uma história diferente da mitologia brasileira'),
('Fonte da Vida', 'Fonte decorativa com esculturas de animais marinhos', 'A água da fonte vem de um poço artesiano natural'),
('Portal do Sol', 'Grande portal decorado com símbolos solares', 'O portal se alinha perfeitamente com o sol no solstício de verão');

-- Inserir dados de exemplo para funcionários
INSERT INTO employees (name, email, role, phone) VALUES
('Maria Silva', 'maria.silva@recentroconecta.com', 'Gerente', '(81) 98765-4321'),
('João Santos', 'joao.santos@recentroconecta.com', 'Recepcionista', '(81) 98765-4322'),
('Ana Costa', 'ana.costa@recentroconecta.com', 'Guia Turístico', '(81) 98765-4323');

-- Inserir dados de exemplo para parceiros
INSERT INTO partners (name, email, phone, organization) VALUES
('Secretaria de Turismo', 'turismo@recife.pe.gov.br', '(81) 3355-8000', 'Prefeitura do Recife'),
('SESC Pernambuco', 'contato@sescpe.com.br', '(81) 3217-5000', 'SESC'),
('Fundação de Cultura', 'cultura@recife.pe.gov.br', '(81) 3355-9000', 'Prefeitura do Recife');
