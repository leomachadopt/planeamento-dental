-- Migração 001: Sistema de Dossiê da Clínica
-- Cria todas as tabelas necessárias para o sistema de documentação versionável

-- ============================================
-- 1. TABELA PRINCIPAL: DOSSIES
-- ============================================
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'archived')),
  version_number INTEGER DEFAULT 1,
  baseline_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dossiers_clinic_id ON dossiers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_status ON dossiers(status);

-- ============================================
-- 2. ESTRUTURA DE SEÇÕES E SUBSEÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subsections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section_id, code)
);

CREATE TABLE IF NOT EXISTS dossier_sections_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete')),
  completion_percent INTEGER DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
  last_updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(dossier_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_dossier_sections_status_dossier_id ON dossier_sections_status(dossier_id);
CREATE INDEX IF NOT EXISTS idx_dossier_sections_status_section_id ON dossier_sections_status(section_id);

-- ============================================
-- 3. MOTOR DE PERGUNTAS (QUESTIONÁRIO)
-- ============================================
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  subsection_id UUID REFERENCES subsections(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_sets_section_id ON question_sets(section_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_is_active ON question_sets(is_active);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  help_text TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'currency', 'date', 'single_select', 'multi_select', 'scale', 'json')),
  required BOOLEAN DEFAULT false,
  validation_schema JSONB,
  order_index INTEGER NOT NULL,
  ai_importance_weight DECIMAL(3,2) DEFAULT 0.5 CHECK (ai_importance_weight >= 0 AND ai_importance_weight <= 1),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_set_id, code)
);

CREATE INDEX IF NOT EXISTS idx_questions_question_set_id ON questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_questions_code ON questions(code);

CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_json JSONB,
  source VARCHAR(20) DEFAULT 'user' CHECK (source IN ('user', 'ai', 'import')),
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(dossier_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_dossier_id ON answers(dossier_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- ============================================
-- 4. ENTIDADES ESTRUTURADAS DO NEGÓCIO
-- ============================================

-- Segmentos de Cliente
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_segments_dossier ON customer_segments(clinic_id, dossier_id);

-- Propostas de Valor
CREATE TABLE IF NOT EXISTS value_propositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_value_propositions_dossier ON value_propositions(clinic_id, dossier_id);
CREATE INDEX IF NOT EXISTS idx_value_propositions_target_segment ON value_propositions(target_segment_id);

-- Categorias de Serviços
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_dossier ON service_categories(clinic_id, dossier_id);

-- Serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  service_category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price NUMERIC(10,2),
  estimated_cost NUMERIC(10,2),
  is_flagship BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_dossier ON services(clinic_id, dossier_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(service_category_id);

-- Concorrentes
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'indirect')),
  notes TEXT,
  differentiation_summary TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitors_dossier ON competitors(clinic_id, dossier_id);

-- Funções/Cargos
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_clinic_id ON roles(clinic_id);

-- Membros da Equipe
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  employment_type VARCHAR(20) NOT NULL CHECK (employment_type IN ('employee', 'contractor', 'partner')),
  hours_per_week INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_dossier ON team_members(clinic_id, dossier_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role_id);

-- Capacidades Operacionais
CREATE TABLE IF NOT EXISTS capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('room', 'equipment', 'staff_time', 'other')),
  name VARCHAR(255) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit VARCHAR(50),
  constraints TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacities_dossier ON capacities(clinic_id, dossier_id);



