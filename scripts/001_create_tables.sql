-- Tabela de configurações do parque
CREATE TABLE IF NOT EXISTS park_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open BOOLEAN DEFAULT true,
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '17:00:00',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de esculturas
CREATE TABLE IF NOT EXISTS sculptures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code SERIAL UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  curiosity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de parceiros
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ingressos
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  ticket_type VARCHAR(50) NOT NULL, -- 'individual' ou 'scheduled'
  visitor_type VARCHAR(50) NOT NULL, -- 'local', 'turista', 'parceiro', 'outro'
  visitor_name VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_phone VARCHAR(20),
  visitor_origin VARCHAR(255), -- cidade/estado de origem
  visit_date DATE NOT NULL,
  visit_time TIME,
  number_of_people INTEGER DEFAULT 1,
  qr_code TEXT, -- código QR gerado
  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de visitas às esculturas (para rastreamento)
CREATE TABLE IF NOT EXISTS sculpture_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sculpture_id UUID REFERENCES sculptures(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações/satisfação
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial do parque
INSERT INTO park_settings (is_open, opening_time, closing_time)
VALUES (true, '08:00:00', '17:00:00')
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tickets_visit_date ON tickets(visit_date);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type ON tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_tickets_visitor_type ON tickets(visitor_type);
CREATE INDEX IF NOT EXISTS idx_sculpture_visits_sculpture_id ON sculpture_visits(sculpture_id);
CREATE INDEX IF NOT EXISTS idx_sculpture_visits_visited_at ON sculpture_visits(visited_at);
