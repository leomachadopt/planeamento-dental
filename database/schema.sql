-- Schema do Banco de Dados para Planejamento Estratégico de Clínicas Dentárias
-- Banco: Neon PostgreSQL

-- Tabela principal de clínicas
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Configuração inicial
CREATE TABLE IF NOT EXISTS clinic_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  tipo_clinica TEXT,
  nome_clinica VARCHAR(255),
  localizacao TEXT,
  publico_principal TEXT,
  estagio_clinica VARCHAR(50),
  gestores_principais TEXT,
  objetivo_geral_2026 TEXT,
  tamanho_relatorio VARCHAR(20),
  tom_linguagem VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Diagnóstico Porter
CREATE TABLE IF NOT EXISTS porter_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  rivalry TEXT,
  new_entrants TEXT,
  substitutes TEXT,
  buyers TEXT,
  suppliers TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Diagnóstico Rumelt
CREATE TABLE IF NOT EXISTS rumelt_diagnosis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  challenge TEXT,
  obstacles TEXT,
  policy TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Avaliação operacional
CREATE TABLE IF NOT EXISTS operational_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  services TEXT,
  infrastructure TEXT,
  team_composition TEXT,
  working_hours TEXT,
  patient_management TEXT,
  financial_management TEXT,
  processes_well_defined TEXT,
  processes_disorganized TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Avaliação de mercado
CREATE TABLE IF NOT EXISTS market_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  market_description TEXT,
  competitors TEXT,
  clinic_strengths TEXT,
  competitor_strengths TEXT,
  acquisition_channels TEXT,
  patient_complaints TEXT,
  patient_compliments TEXT,
  patient_loss TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Visão do gestor
CREATE TABLE IF NOT EXISTS manager_visions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  vision_2026 TEXT,
  revenue_goal TEXT,
  occupancy_goal TEXT,
  nps_goal TEXT,
  other_goal TEXT,
  processes_score INTEGER,
  processes_justification TEXT,
  financial_score INTEGER,
  financial_justification TEXT,
  satisfaction_score INTEGER,
  satisfaction_justification TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Problemas do gestor
CREATE TABLE IF NOT EXISTS manager_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  problem TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Oportunidades do gestor
CREATE TABLE IF NOT EXISTS manager_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  opportunity TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Identidade estratégica
CREATE TABLE IF NOT EXISTS identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  reason TEXT,
  recognition_goal TEXT,
  values TEXT,
  priority_audience TEXT,
  price_positioning VARCHAR(50),
  strategy_focus VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id)
);

-- Blue Ocean
CREATE TABLE IF NOT EXISTS blue_ocean_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('eliminate', 'reduce', 'raise', 'create')),
  item TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs to be Done
CREATE TABLE IF NOT EXISTS jtbd_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  job TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Funcional', 'Emocional', 'Social')),
  solution TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OKRs
CREATE TABLE IF NOT EXISTS okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  perspective VARCHAR(20) NOT NULL CHECK (perspective IN ('Financeira', 'Clientes', 'Processos', 'Aprendizado')),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Key Results
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID REFERENCES okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ações (Action Items)
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('Plan', 'Do', 'Check', 'Act')),
  owner VARCHAR(255),
  deadline DATE,
  okr_id UUID REFERENCES okrs(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Relatórios (armazenados como JSON)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('diagnostic', 'strategic', 'advanced', 'tactical', 'operational', 'final')),
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(clinic_id, report_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clinic_configs_clinic_id ON clinic_configs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_porter_clinic_id ON porter_analysis(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rumelt_clinic_id ON rumelt_diagnosis(clinic_id);
CREATE INDEX IF NOT EXISTS idx_okrs_clinic_id ON okrs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_actions_clinic_id ON actions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reports_clinic_id ON reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_blue_ocean_clinic_id ON blue_ocean_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_clinic_id ON jtbd_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_identities_clinic_id ON identities(clinic_id);

